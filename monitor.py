# -*- coding: utf-8 -*-
"""
=============================================================================
SISTEMA OSINT - SOCIAL MONITOR v2.9.2
DOCUMENTACIÓN DE RELEVO TÉCNICO: monitor.py (Cerebro Orquestador Temporal)
-----------------------------------------------------------------------------
Este script corre indefinidamente en segundo plano. Intercepta cambios en 
el temporizador desde MongoDB y reajusta la frecuencia de escaneo (TMD) en 
caliente sin requerir interrupciones del proceso principal.
=============================================================================
"""

import schedule
import time
import requests
import urllib.parse
import xml.etree.ElementTree as ET
import re
import unicodedata
import random
from pymongo import MongoClient
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

# Parámetros de conectividad del ecosistema OSINT
MONGO_URI = "mongodb://localhost:27017/"
TIKTOK_API_URL = "http://localhost:8001/search"
TWITTER_API_URL = "http://localhost:8002/search"
FACEBOOK_API_URL = "http://localhost:8003/search"
INSTAGRAM_API_URL = "http://localhost:8004/search"

# Conexión persistente a MongoDB
client = MongoClient(MONGO_URI)
db = client['social_alert_db']
CACHE_SINONIMOS = {}
ECUADOR_TZ = timezone(timedelta(hours=-5))

def obtener_fecha_ecuador(): return datetime.now(ECUADOR_TZ).strftime("%Y-%m-%d %H:%M:%S")
def log(msg): print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)

def actualizar_progreso(id_visual, porcentaje):
    try: db.tareas.update_one({"id_visual": id_visual}, {"$set": {"progreso": porcentaje}})
    except: pass

USER_AGENTS = ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36']
SINONIMOS_LOCALES = {
    "guayaquil": ["guayas", "puerto principal", "zona 8", "durán", "pascuales", "guasmo", "suburbio"],
}

def normalizar_texto(texto):
    if not texto: return ""
    texto = texto.lower()
    texto = ''.join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn')
    return texto

def es_contenido_relevante_prensa(titulo, query_original):
    titulo_norm = normalizar_texto(titulo)
    query_norm = normalizar_texto(query_original)
    palabras_query = [p for p in query_norm.split() if len(p) > 2]
    if not palabras_query: return True
    return any(p in titulo_norm for p in palabras_query)

def analizar_sentimiento(texto):
    texto = normalizar_texto(texto)
    if any(x in texto for x in ["sicariato", "muerte", "crimen"]): return "NEGATIVO"
    return "NEUTRAL"

def consultar_prensa(sub_query):
    query_encoded = urllib.parse.quote(sub_query.replace('"', ''))
    try:
        response = requests.get(f"https://news.google.com/rss/search?q={query_encoded}&hl=es-419&gl=EC&ceid=EC:es-419", timeout=12)
        if response.status_code == 200: return ET.fromstring(response.content).findall('.//item')
    except: pass
    return []

def consultar_api_externa(url_api, query, timeout_segundos):
    try:
        response = requests.get(url_api, params={"q": query}, timeout=timeout_segundos)
        if response.status_code == 200: 
            data = response.json()
            return data.get("resultados", []), data.get("analizados", 0)
    except: pass
    return [], 0

def guardar(tarea, fuente, titulo, url, extra="", fecha_custom=None, termino_especifico=None):
    if db.menciones.find_one({"url": url, "tarea_id": tarea['id_visual']}): return False
    titulo_limpio = f"{titulo} {extra}".strip()
    criterio = termino_especifico if termino_especifico else tarea['query']
    if fuente == "Noticias" and not es_contenido_relevante_prensa(titulo_limpio, criterio): return False
    fecha_final = fecha_custom if fecha_custom else obtener_fecha_ecuador()
    try:
        db.menciones.insert_one({
            "tarea_id": tarea['id_visual'], "termino_buscado": criterio, "fuente": fuente,
            "sentimiento": analizar_sentimiento(titulo_limpio), "sitio": "Red Social / Web",
            "titulo": titulo_limpio[:400], "url": url, "fecha": fecha_final
        })
        return True
    except: return False

def ejecutar_hilo_red_social(tarea, red, api_url, q, sub_query):
    analizados_totales = 0
    positivos_totales = 0
    try:
        fuente_nombre = "Twitter (X)" if red == "twitter" else red.capitalize()
        res_hibrida, a_hibrida = consultar_api_externa(api_url, q, timeout_segundos=150)
        analizados_totales += a_hibrida
        for v in res_hibrida:
            cont = v.get('texto') or v.get('titulo') or f"Post en {fuente_nombre}"
            if guardar(tarea, fuente_nombre, cont, v.get('url','#'), termino_especifico=sub_query):
                positivos_totales += 1
        log(f"      ✓ {fuente_nombre} completado para '{q}' (Analizados: {analizados_totales} | TP Guardados: {positivos_totales})")
    except Exception as e: 
        log(f"      ❌ Error en hilo de {red}: {str(e)}")
    return analizados_totales, positivos_totales

def procesar_mision(tarea):
    estado_actual = db.tareas.find_one({"id_visual": tarea['id_visual']})
    if not estado_actual or estado_actual.get("estado") != "activo": return

    id_visual = tarea['id_visual']
    raw_query = tarea['query']
    redes = tarea.get('redes', [])
    medios = tarea.get('medios', [])
    hallazgos_antes = db.menciones.count_documents({"tarea_id": id_visual})
    sub_queries = [s.strip() for s in raw_query.split(',') if s.strip()]

    total_operaciones = 0
    for sub_query in sub_queries:
        if medios: total_operaciones += 1
        for red, _ in [("tiktok", ""), ("twitter", ""), ("facebook", ""), ("instagram", "")]:
            if any(red in r.lower() for r in redes): total_operaciones += 1
    if total_operaciones == 0: total_operaciones = 1

    try:
        actualizar_progreso(id_visual, 5) 
        operaciones_completadas = 0
        total_analizados_ciclo = 0
        total_positivos_ciclo = 0

        with ThreadPoolExecutor(max_workers=5) as executor:
            futuros = []
            for sub_query in sub_queries:
                if medios:
                    log(f"   📰 Escaneando Prensa: '{sub_query}'...")
                    for item in consultar_prensa(sub_query)[:30]:
                        total_analizados_ciclo += 1
                        try:
                            fecha_pub = None
                            pub_date = item.find('pubDate')
                            if pub_date is not None:
                                fecha_pub = parsedate_to_datetime(pub_date.text).astimezone(ECUADOR_TZ).strftime("%Y-%m-%d %H:%M:%S")
                            if guardar(tarea, "Noticias", item.find('title').text, item.find('link').text, fecha_custom=fecha_pub, termino_especifico=sub_query):
                                total_positivos_ciclo += 1
                        except: continue
                    operaciones_completadas += 1
                    actualizar_progreso(id_visual, min(95, 5 + int((operaciones_completadas / total_operaciones) * 90)))

                for red, api_url in [("tiktok", TIKTOK_API_URL), ("twitter", TWITTER_API_URL), ("facebook", FACEBOOK_API_URL), ("instagram", INSTAGRAM_API_URL)]:
                    if any(red in r.lower() for r in redes):
                        time.sleep(random.uniform(0.3, 1.2))
                        log(f"   🚀 Desplegando agente a {red.capitalize()} para '{sub_query}'...")
                        futuros.append(executor.submit(ejecutar_hilo_red_social, tarea, red, api_url, sub_query, sub_query))
            
            for futuro in as_completed(futuros):
                a_hilo, p_hilo = futuro.result()
                total_analizados_ciclo += a_hilo
                total_positivos_ciclo += p_hilo
                operaciones_completadas += 1
                actualizar_progreso(id_visual, min(95, 5 + int((operaciones_completadas / total_operaciones) * 90)))

        try: db.tareas.update_one({"id_visual": id_visual}, {"$inc": {"stats.analizados": total_analizados_ciclo, "stats.positivos": total_positivos_ciclo}})
        except: pass
        log(f"✅ FIN DE MISIÓN '{raw_query[:20]}...': +{db.menciones.count_documents({'tarea_id': id_visual}) - hallazgos_antes} resultados.")
        log("")
    finally:
        actualizar_progreso(id_visual, 100)

def ejecutar_todas_las_tareas():
    conf = db.config.find_one({"_id": "global"}) or {}
    lote = conf.get("concurrencia", 1) 
    orden_visual = conf.get("orden_visual", [])
    
    try: db.tareas.update_many({"estado": "activo"}, {"$set": {"progreso": 100}})
    except: pass
    
    todas_las_tareas = list(db.tareas.find())
    if not todas_las_tareas: return True
    
    orden_dict = {id_v: idx for idx, id_v in enumerate(orden_visual)}
    tareas_ordenadas = sorted(todas_las_tareas, key=lambda x: orden_dict.get(x['id_visual'], 999999))
    tareas_activas_ordenadas = [t for t in tareas_ordenadas if t.get("estado") == "activo"]
    if not tareas_activas_ordenadas: return True
    
    print("=======================================================", flush=True)
    log(f"--- BARRIDO V2.9.2 (LOTES DE {lote}) ({len(tareas_activas_ordenadas)} MISIONES ACTIVAS) ---")
    log("=======================================================")
    log("")
    
    for i in range(0, len(tareas_activas_ordenadas), lote):
        conf_check = db.config.find_one({"_id": "global"}) or {}
        if conf_check.get("reset_signal"):
            log("🔄 RESET INTERCEPTADO ANTES DEL BATCH. Abortando y reiniciando desde Misión 01...")
            db.config.update_one({"_id": "global"}, {"$set": {"reset_signal": False}})
            return False

        chunk = tareas_activas_ordenadas[i:i+lote]
        print(f"🚀 [LOTE {i//lote + 1}] Escaneando misiones {i+1} a {min(i+lote, len(tareas_activas_ordenadas))} en paralelo...", flush=True)
        
        with ThreadPoolExecutor(max_workers=max(1, len(chunk)) * 2) as executor:
            futuros = [executor.submit(procesar_mision, t) for t in chunk]
            for f in as_completed(futuros): pass
        
        conf_actualizada = db.config.find_one({"_id": "global"}) or {}
        if conf_actualizada.get("reset_signal"):
            log("🔄 RESET INTERCEPTADO DESPUÉS DEL BATCH. Rompiendo cola actual...")
            db.config.update_one({"_id": "global"}, {"$set": {"reset_signal": False}})
            return False 
            
    log("--- CICLO DE LOTES FINALIZADO EXITOSAMENTE ---")
    log("")
    return True 

def ciclo():
    # Esta función se llama cuando el temporizador expira
    ejecutar_todas_las_tareas()

# Inicialización del intervalo en memoria
intervalo_actual = 1
schedule.every(intervalo_actual).minutes.do(ciclo)
log(f"MOTOR OSINT v2.9.2 ACTIVO (FRECUENCIA INICIAL: {intervalo_actual} MIN)")

# Ejecución inicial forzada al arrancar el servicio
ejecutar_todas_las_tareas()

while True:
    try:
        # 🚨 MONITOREO DINÁMICO: Lee el intervalo de la DB en cada vuelta del bucle
        conf = db.config.find_one({"_id": "global"}) or {}
        intervalo_db = conf.get("intervalo_scan", 1)
        
        # Si el usuario cambió los minutos en la interfaz web, reconfiguramos schedule
        if intervalo_db != intervalo_actual:
            log(f"⏱️ CAMBIO DE TEMPORIZADOR DETECTADO: Re-programando escáner cada {intervalo_db} minutos.")
            schedule.clear() # Limpia la cola antigua
            schedule.every(intervalo_db).minutes.do(ciclo) # Registra el nuevo intervalo
            intervalo_actual = intervalo_db # Sincroniza la marca en memoria
    except: pass
    
    schedule.run_pending()
    time.sleep(1)
