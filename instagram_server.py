from fastapi import FastAPI
import requests
import urllib.parse
import xml.etree.ElementTree as ET
from playwright.async_api import async_playwright
import unicodedata
import re

app = FastAPI()

def normalizar_texto(texto):
    if not texto: return ""
    texto = texto.lower()
    texto = ''.join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn')
    cambios_leet = {'3': 'e', '4': 'a', '1': 'i', '0': 'o', '5': 's', '7': 't', '@': 'a', '$': 's', '!': 'i'}
    for num, letra in cambios_leet.items(): texto = texto.replace(num, letra)
    return texto

def validacion_estricta(texto_post, termino_busqueda):
    post_norm = normalizar_texto(texto_post)
    term_norm = normalizar_texto(termino_busqueda).replace('#', '')
    palabras_requeridas = [p for p in term_norm.split() if len(p) > 2]
    if not palabras_requeridas: return True
    aciertos = sum(1 for palabra in palabras_requeridas if palabra in post_norm)
    return aciertos > 0

def buscar_instagram_via_google_html(q):
    posts = []
    analizados = 0
    terminos = [t.strip() for t in q.split(',') if t.strip()]
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    for termino in terminos:
        query_encoded = urllib.parse.quote(f'"{termino}" site:instagram.com')
        try:
            res = requests.get(f"https://www.google.com/search?q={query_encoded}", headers=headers, timeout=10)
            matches = re.findall(r'<a\s+[^>]*href="([^"]+)"[^>]*>.*?<h3[^>]*>(.*?)</h3>', res.text, re.IGNORECASE | re.DOTALL)
            analizados += len(matches)
            for link, title in matches:
                title_clean = re.sub(r'<[^>]+>', '', title).strip()
                if link.startswith('/url?q='): link = urllib.parse.unquote(link.split('/url?q=')[1].split('&')[0])
                if 'instagram.com' in link and validacion_estricta(title_clean, termino):
                    posts.append({"titulo": title_clean, "url": link, "autor": "Usuario IG (Vía Google)", "fuente": "Instagram"})
        except: pass
    return posts, analizados

def buscar_instagram_via_rss(q):
    posts = []
    analizados = 0
    terminos = [t.strip() for t in q.split(',') if t.strip()]
    for termino in terminos:
        query_encoded = urllib.parse.quote(f'"{termino}" site:instagram.com')
        try:
            res = requests.get(f"https://news.google.com/rss/search?q={query_encoded}+when:1d&hl=es-419&gl=EC&ceid=EC:es-419", headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
            if res.status_code == 200:
                items = ET.fromstring(res.content).findall('.//item')[:25]
                analizados += len(items)
                for item in items: 
                    title = item.find('title').text
                    link = item.find('link').text
                    clean_text = title.replace("- Instagram", "").strip()
                    if "Login" not in clean_text and validacion_estricta(clean_text, termino):
                        posts.append({"titulo": clean_text, "url": link, "autor": "Usuario IG (RSS)", "fuente": "Instagram"})
        except: pass
    return posts, analizados

async def buscar_instagram_activo(q):
    posts = []
    analizados = 0
    terminos = [t.strip() for t in q.split(',') if t.strip()]
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled", "--no-sandbox"])
            context = await browser.new_context(viewport={"width": 1920, "height": 1080})
            page = await context.new_page()
            for termino in terminos:
                search_url = f"https://www.instagram.com/explore/tags/{termino.replace('#', '')}/" if termino.startswith("#") else f"https://www.instagram.com/explore/search/keyword/?q={urllib.parse.quote(termino)}"
                await page.goto(search_url, timeout=30000)
                await page.wait_for_timeout(4000)
                if not ("login" in page.url or "accounts/login" in page.url):
                    for _ in range(3):
                        await page.mouse.wheel(0, 1500)
                        await page.wait_for_timeout(1500)
                    extracted = await page.evaluate('''() => {
                        let res = [];
                        document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]').forEach(a => {
                            let img = a.querySelector('img');
                            let desc = img ? img.alt : "Post Instagram";
                            if (desc.includes("May be an image of")) desc = desc.split("May be an image of")[1].trim();
                            res.push({titulo: desc.substring(0, 250), url: a.href, autor: "Usuario Instagram", fuente: "Instagram"});
                        });
                        return res;
                    }''')
                    analizados += len(extracted)
                    for r in extracted:
                        if r['url'].startswith('/'): r['url'] = 'https://www.instagram.com' + r['url']
                        if validacion_estricta(r['titulo'], termino): posts.append(r)
            await browser.close()
    except: pass
    return posts, analizados

@app.get("/")
def home(): return {"status": "Instagram Intelligence V2.4 Online"}

@app.get("/search")
async def search_instagram(q: str):
    res_html, a_html = buscar_instagram_via_google_html(q)
    res_rss, a_rss = buscar_instagram_via_rss(q)
    res_activos, a_activos = await buscar_instagram_activo(q)
    fusion = []
    urls_vistas = set()
    for r in (res_html + res_rss + res_activos):
        url_clean = r['url'].split('?')[0] 
        if url_clean not in urls_vistas:
            urls_vistas.add(url_clean)
            fusion.append(r)
    return {"resultados": fusion, "analizados": a_html + a_rss + a_activos}
