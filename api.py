# -*- coding: utf-8 -*-
"""
=============================================================================
SISTEMA OSINT - SOCIAL MONITOR v2.9.4
DOCUMENTACIÓN DE RELEVO TÉCNICO: api.py (Cerebro Central de Servicios REST)
-----------------------------------------------------------------------------
- BUG FIX: Se corrigió el endpoint /tareas/{id}/estado para que reciba 
  correctamente el modelo booleano (EstadoUpdate) y permita Pausar/Reanudar.
=============================================================================
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pymongo import MongoClient
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import time as import_time
import requests
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from playwright.async_api import async_playwright
import urllib.parse
import re

app = FastAPI()

SECRET_KEY = "social_alert_master_key_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

client = MongoClient("mongodb://localhost:27017/")
db = client['social_alert_db']

db.menciones.create_index([("tarea_id", 1)])
db.menciones.create_index([("fecha", -1)])
db.tareas.create_index([("id_visual", 1)], unique=True)

app.add_middleware(
    CORSMiddleware, 
    allow_origin_regex=".*", 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

# 🚨 MODELOS DE DATOS 
class Tarea(BaseModel): query: str; redes: Optional[List[str]] = []; medios: Optional[List[str]] = []
class EstadoUpdate(BaseModel): activo: bool # <--- CORRECCIÓN CLAVE PARA EL PLAY/PAUSA
class TareaNombre(BaseModel): query: str
class Token(BaseModel): access_token: str; token_type: str
class OrdenUpdate(BaseModel): orden: List[str]
class ConcurrenciaUpdate(BaseModel): lote: int
class IntervaloUpdate(BaseModel): intervalo: int

def verify_password(plain_password, hashed_password): return pwd_context.verify(plain_password, hashed_password)
def get_password_hash(password): return pwd_context.hash(password)
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.users.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    return {"access_token": create_access_token(data={"sub": user["username"]}), "token_type": "bearer"}

@app.post("/nueva_tarea")
def crear_tarea(tarea: Tarea):
    nueva = {
        "query": tarea.query, "redes": tarea.redes, "medios": tarea.medios, 
        "estado": "activo", "id_visual": str(int(import_time.time())),
        "stats": {"analizados": 0, "positivos": 0}
    }
    db.tareas.insert_one(nueva)
    return {"mensaje": "Ok", "id": nueva["id_visual"]}

@app.get("/tareas")
def listar_tareas(): return [{**t, "_id": str(t["_id"])} for t in db.tareas.find().sort("_id", -1)]

@app.put("/tareas/{id_tarea}")
def actualizar_nombre_tarea(id_tarea: str, dato: TareaNombre):
    db.tareas.update_one({"id_visual": id_tarea}, {"$set": {"query": dato.query}})
    return {"mensaje": "Nombre actualizado"}

@app.delete("/tareas/{id_tarea}")
def eliminar_tarea(id_tarea: str):
    db.tareas.delete_one({"id_visual": id_tarea})
    db.menciones.delete_many({"tarea_id": id_tarea})
    return {"mensaje": "Tarea de radar eliminada"}

# 🚨 CORRECCIÓN DEL ENDPOINT DE PLAY/PAUSA
@app.put("/tareas/{id_tarea}/estado")
def cambiar_estado(id_tarea: str, estado: EstadoUpdate):
    db.tareas.update_one({"id_visual": id_tarea}, {"$set": {"estado": "activo" if estado.activo else "pausado"}})
    return {"mensaje": "Estado cambiado exitosamente"}

@app.put("/config/orden")
def update_orden(dato: OrdenUpdate):
    db.config.update_one({"_id": "global"}, {"$set": {"orden_visual": dato.orden}}, upsert=True)
    return {"mensaje": "Orden secuencial actualizado"}

@app.put("/config/concurrencia")
def update_concurrencia(dato: ConcurrenciaUpdate):
    db.config.update_one({"_id": "global"}, {"$set": {"concurrencia": dato.lote}}, upsert=True)
    return {"mensaje": "Lote de procesamiento configurado"}

@app.put("/config/intervalo")
def update_intervalo(dato: IntervaloUpdate):
    db.config.update_one({"_id": "global"}, {"$set": {"intervalo_scan": dato.intervalo}}, upsert=True)
    return {"mensaje": "Intervalo del temporizador guardado"}

@app.post("/config/reset")
def trigger_reset():
    db.config.update_one({"_id": "global"}, {"$set": {"reset_signal": True}}, upsert=True)
    return {"mensaje": "Señal de reset enviada"}

@app.get("/config")
def get_config():
    conf = db.config.find_one({"_id": "global"}) or {}
    return {
        "concurrencia": conf.get("concurrencia", 1),
        "intervalo_scan": conf.get("intervalo_scan", 1), 
        "orden_visual": conf.get("orden_visual", [])
    }

@app.get("/config/estado_ip")
def obtener_estado_ip():
    try: ip_pub = requests.get("https://api.ipify.org", timeout=4).text
    except: ip_pub = "IP Oculta / No se pudo resolver"
    estado = "UP"
    try:
        res = requests.get("https://www.google.com/search?q=ecuador", headers={"User-Agent": "Mozilla/5.0"}, timeout=4)
        if res.status_code in [403, 429]: estado = "DOWN" 
    except: estado = "DOWN"
    return {"ip": ip_pub, "puertos": "8000 (API), 8001 (TT), 8002 (X), 8003 (FB), 8004 (IG)", "estado": estado}

@app.get("/alertas")
def obtener_todas_las_alertas(): return [{**r, "_id": str(r["_id"])} for r in db.menciones.find().sort("fecha", -1).limit(3000)]

@app.get("/resultados/{id_tarea}")
def obtener_resultados_tarea(id_tarea: str): return [{**r, "_id": str(r["_id"])} for r in db.menciones.find({"tarea_id": id_tarea}).sort("fecha", -1).limit(3000)]

@app.get("/exportar_excel/{id_tarea}")
def exportar_excel(id_tarea: str):
    query = {} if id_tarea == "global" else {"tarea_id": id_tarea}
    data = list(db.menciones.find(query, {"_id":0}))
    if not data: return {"error": "Sin datos"}
    mapa_tareas = {t["id_visual"]: t["query"] for t in list(db.tareas.find({}, {"id_visual": 1, "query": 1}))}
    for d in data: d["termino_buscado"] = d.get("termino_buscado", mapa_tareas.get(d.get("tarea_id"), "Desconocida"))
    df = pd.DataFrame(data)
    path = f"/tmp/Reporte_{id_tarea}.xlsx"
    df.to_excel(path, index=False)
    return FileResponse(path, filename=f"Reporte_{id_tarea}.xlsx")
