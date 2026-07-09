# 🛡️ OPERACIONES DE CIBERSEGURIDAD: Social Monitor OSINT

<div align="center">

[![Version](https://img.shields.io/badge/Versi%C3%B3n-v2.9.5__Estable-blue.svg?style=for-the-badge&logo=appveyor)](#)
[![Python](https://img.shields.io/badge/Python-3.10+-yellow.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x+-green.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Next.js-20232A.svg?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-NoSQL-47A248.svg?style=for-the-badge&logo=mongodb&logoColor=white)](#)

**Prototipo de sistema OSINT mediante arquitectura de microservicios con filtrado de relevancia para la monitorización y alerta temprana de ciberamenazas.**

---

### 🎓 Contexto Académico e Investigativo
Este proyecto ha sido desarrollado de forma íntegra por el **Ing. Stalyn Pauta Cuji**, como proyecto de tesis de la **Maestría en Ciberseguridad** en la **UNIR (Universidad Internacional de La Rioja)**. Constituye una herramienta avanzada para la monitorización táctica y el análisis forense de fuentes abiertas bajo estándares de ciberdefensa.

</div>

---

## 📖 Tabla de Contenidos
1. [Descripción General](#-descripción-general)
2. [Objetivos del Proyecto](#-objetivos-del-proyecto)
3. [Características Principales](#-características-principales)
4. [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
5. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
6. [Requisitos Técnicos del Sistema](#-requisitos-técnicos-del-sistema)
7. [Puertos y Microservicios Utilizados](#-puertos-y-microservicios-utilizados)
8. [Estructura de Base de Datos (MongoDB)](#-estructura-de-base-de-datos-mongodb)
9. [Estructura de Carpetas del Proyecto](#-estructura-de-carpetas-del-proyecto)
10. [Implementación desde Máquina Virtual OVA](#-implementación-desde-máquina-virtual-ova)
11. [Instalación Manual Paso a Paso](#-instalación-manual-paso-a-paso)
12. [Configuración Inicial y Accesos](#-configuración-inicial-y-accesos)
13. [Ejecución del Ecosistema mediante PM2](#-ejecución-del-ecosistema-mediante-pm2)
14. [Casos de Uso y Flujo de Funcionamiento](#-casos-de-uso-y-flujo-de-funcionamiento)
15. [Funcionalidades Detalladas](#-funcionalidades-detalladas)
16. [Capturas de la Interfaz de Usuario](#-capturas-de-la-interfaz-de-usuario)
17. [Buenas Prácticas de Seguridad y Hardening](#-buenas-prácticas-de-seguridad-y-hardening)
18. [Troubleshooting y Gestión de Logs](#-troubleshooting-y-gestión-de-logs)
19. [Procedimiento de Respaldo y Recuperación](#-procedimiento-de-respaldo-y-recuperación)
20. [Guía de Mantenimiento](#-guía-de-mantenimiento)
21. [Roadmap Futuro](#-roadmap-futuro)
22. [Guía para Contribuciones](#-guía-para-contribuciones)
23. [Licencia y Créditos](#-licencia-créditos-y-contacto)

---

## 👁️ Descripción General
**Social Monitor OSINT** es una plataforma de Inteligencia de Fuentes Abiertas (OSINT) y de Señales (SIGINT-Web) orientada a misiones de ciberdefensa. Su núcleo se basa en una arquitectura distribuida de microservicios asíncronos que auditan, recolectan y analizan de forma pasiva grandes flujos de información en redes sociales (TikTok, Twitter/X, Facebook, Instagram) y prensa digital. 

El sistema está optimizado para actuar bajo condiciones estrictas de **Sigilo Operativo (OPSEC)**, implementando algoritmos de evasión que emulan comportamientos humanos legítimos para burlar los sistemas de detección WAF (*Web Application Firewalls*) y sistemas de bloqueo anti-bot de las plataformas corporativas más agresivas del mundo.

---

## 🎯 Objetivos del Proyecto
* **Rastreo Multitarea Concurrente:** Ejecutar barridos de información paralelos sobre objetivos de alto valor (POI), marcas o hashtags de manera simultánea.
* **Alerta Temprana de Incidentes:** Capturar ráfagas de publicaciones vinculadas a amenazas, ciberataques o alteraciones del orden público mediante análisis semántico.
* **Triangulación y Enriquecimiento Geográfico:** Dotar al analista de capacidades GEOINT al mapear con precisión quirúrgica las menciones mediante un motor regex calibrado.
* **Portabilidad y Despliegue Inmediato:** Garantizar el funcionamiento automático bajo cualquier red empresarial mediante descubrimiento dinámico por DHCP.

---

## ✨ Características Principales
* **Evasión Avanzada y Modo Stealth:** Utiliza técnicas de *Jittering* (retrasos asimétricos aleatorios) y ocultación de firmas de automatización en el motor Chromium de Playwright.
* **Orquestación Inteligente por Lotes:** Permite agrupar las misiones en lotes (Batches) configurables en caliente para proteger el hardware del servidor contra picos de estrés térmico.
* **Botonera Dinámica de Sub-Objetivos:** El sistema parsea automáticamente misiones complejas con términos múltiples, generando filtros en un clic con contadores individuales.
* **Diccionario Táctico Nacional:** Motor cartográfico paramétrico cargado con las 24 provincias y cantones principales de la República del Ecuador.
* **Ecosistema de Red Adaptativo:** Modificación en caliente de la frecuencia de barrido del Cronjob y cálculo automatizado de las métricas forenses de Precisión y Tiempo Medio de Detección (TMD).

---

## 🏛️ Arquitectura del Proyecto

El ecosistema separa de forma modular las responsabilidades de captura, persistencia, control y presentación de datos a través de 7 microservicios independientes administrados por PM2:

```text
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                            DASHBOARD-WEB                                │
   │                       (Next.js / Puerto 3000)                           │
   └────────────────────────────────────┬────────────────────────────────────┘
                                        │ HTTP / JSON REST
                                        ▼ (Soporte DHCP Auto-Discovery)
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                             CEREBRO-API                                 │
   │                        (FastAPI / Puerto 8000)                          │
   └──────────────────┬───────────────────────────────────▲──────────────────┘
                      │                                   │
        Lee / Escribe │                                   │ Intercepta Configuración
                      ▼                                   │ (Lotes, TMD, Reset a 01)
   ┌────────────────────────────────────┐                 │
   │         MongoDB Local              │                 │
   │     (DB: social_alert_db)          │                 │
   │  ┌──────────┐        ┌──────────┐  │                 │
   │  │  tareas  │        │menciones │  │                 │
   │  ├──────────┤        ├──────────┤  │                 │
   │  │  config  │        │  users   │  │                 │
   │  └──────────┘        └──────────┘  │                 │
   └────────────────────────────────────┘                 │
                                                          │
   ┌──────────────────────────────────────────────────────┴──────────────────┐
   │                            ESPIA-MONITOR                                │
   │                (Orquestador Cron / Multihilos Python)                   │
   └────────────────────────────────────┬────────────────────────────────────┘
                                        │ Despacha Extracción Local (HTTP REST)
                                        ▼
        ┌────────────────┬──────────────┴──────────────┬────────────────┐
        ▼                ▼                             ▼                ▼
 ┌──────────────┐ ┌──────────────┐              ┌──────────────┐ ┌──────────────┐
 │ TIKTOK-INTEL │ │TWITTER-INTEL │              │FACEBOOK-INTEL│ │INSTAGRAM-INTEL
 │ (Puerto 8001)│ │ (Puerto 8002)│              │ (Puerto 8003)│ │ (Puerto 8004)│
 └──────────────┘ └──────────────┘              └──────────────┘ └──────────────┘
```
## 💻 Tecnologías Utilizadas

El desarrollo del ecosistema se basó en la selección de tecnologías de código abierto de alto rendimiento, garantizando la escalabilidad y el sigilo del sistema:

* **Interfaz Gráfica (Frontend):** Next.js 14, React 18 y TailwindCSS para el maquetado visual adaptativo. La cartografía interactiva se procesa mediante Leaflet Maps, y las métricas estadísticas mediante Chart.js.
* **Servicio REST Central (Backend):** Python 3.10+, FastAPI y Uvicorn para la exposición de endpoints asíncronos de baja latencia. El subsistema de seguridad emplea Passlib (Bcrypt) para hashing y PyJWT para sesiones tokens.
* **Agentes de Extracción (Workers):** Playwright Async Headless Core y BeautifulSoup4 para la navegación sigilosa y el parseo del DOM web.
* **Base de Datos:** MongoDB Community Server, configurado de manera local para optimizar los tiempos de persistencia NoSQL mediante indexación compuesta.
* **Daemonizador de Procesos:** PM2 (Process Manager 2 Runtime) encargado de la persistencia de procesos, el balanceo básico de carga y la administración de logs.

---

## ⚙️ Requisitos Técnicos del Sistema

| Recurso | Requisito Mínimo (Implementación OVA) | Recomendado (Producción / Alta Carga) |
| :--- | :--- | :--- |
| **Almacenamiento** | **80 GB SSD** | 150 GB NVMe |
| **Memoria RAM** | **6 GB** | 16 GB DDR4/DDR5 |
| **Procesador (CPU)**| **6 Núcleos** (Virtualizados) | 12 Núcleos o superior |

> *Nota Operativa:* Si se configuran misiones masivas o lotes paralelos elevados, el uso de navegadores Chromium simultáneos escalará la demanda de hardware de forma considerable en el procesador.

---

## 🔌 Puertos y Microservicios Utilizados

| Nombre del Proceso PM2 | Tecnología | Puerto | Protocolo | Descripción Operativa |
| :--- | :--- | :--- | :--- | :--- |
| **`DASHBOARD-WEB`** | Next.js Engine | `3000` | HTTP | Interfaz de usuario (Panel de control reactivo). |
| **`CEREBRO-API`** | FastAPI Central | `8000` | HTTP | Núcleo de servicios RESTful y persistencia NoSQL. |
| **`TIKTOK-INTEL`** | Playwright Worker | `8001` | HTTP | Extractor táctico especializado en TikTok DOM. |
| **`TWITTER-INTEL`** | Playwright Worker | `8002` | HTTP | Extractor táctico especializado en Twitter (X). |
| **`FACEBOOK-INTEL`** | Playwright Worker | `8003` | HTTP | Extractor táctico especializado en Facebook. |
| **`INSTAGRAM-INTEL`**| Playwright Worker | `8004` | HTTP | Extractor táctico especializado en Instagram. |
| **`ESPIA-MONITOR`** | Python Threading | `N/A` | Interno | Orquestador y despachador cíclico de misiones. |
| **`N/A`** | MongoDB Daemon | `27017` | TCP | Motor de persistencia para misiones y alertas. |

---

## 🗄️ Estructura de Base de Datos (MongoDB)

El sistema utiliza la base de datos NoSQL `social_alert_db` estructurada en 4 colecciones clave para garantizar consultas instantáneas sin bloquear el renderizado:

### 1. Colección: `tareas` (Misiones)
Estructura encargada de la persistencia de los objetivos activos del radar:
```json
{
  "_id": "ObjectId",
  "query": "sicariato guayaquil, muerte violenta guasmo",
  "redes": ["twitter", "tiktok"],
  "medios": ["eluniverso"],
  "estado": "activo",
  "id_visual": "1719174000",
  "progreso": 100,
  "stats": { "analizados": 1540, "positivos": 127 }
}
```
### 2. Colección: menciones (Hallazgos Confirmados)
Repositorio forense donde impactan las publicaciones extraídas validadas:
```json
{
  "_id": "ObjectId",
  "tarea_id": "1719174000",
  "termino_buscado": "sicariato guayaquil",
  "fuente": "Twitter (X)",
  "sitio": "Red Social / Web",
  "titulo": "Urgente: Se reporta sicariato en los exteriores de un mercado de Montebello...",
  "url": "[https://twitter.com/user/status/12345678](https://twitter.com/user/status/12345678)",
  "sentimiento": "NEGATIVO",
  "fecha": "2026-06-23 20:29:33"
}
```
### 3. Colección: config (Parámetros Operativos del Sistema)
```json
{
  "_id": "global",
  "concurrencia": 1,
  "intervalo_scan": 10,
  "orden_visual": ["1719174000", "1719175000"],
  "reset_signal": false
}
```
### 4. Colección: users (Control de Credenciales)
```json
{
  "_id": "ObjectId",
  "username": "admin",
  "hashed_password": "$pbkdf2-sha256$29000$encryptedhash..."
}
```
### 📂 Estructura de Carpetas del Proyecto
```Bash
/opt/social-monitor/
├── api.py                  # API REST FastAPI (Proceso: CEREBRO-API)
├── monitor.py              # Script Orquestador Core (Proceso: ESPIA-MONITOR)
├── tiktok_server.py        # Agente Playwright TikTok (Proceso: TIKTOK-INTEL)
├── twitter_server.py       # Agente Playwright Twitter (Proceso: TWITTER-INTEL)
├── facebook_server.py      # Agente Playwright Facebook (Proceso: FACEBOOK-INTEL)
├── instagram_server.py     # Agente Playwright Instagram (Proceso: INSTAGRAM-INTEL)
├── ecosystem.config.js     # Manifiesto de orquestación y arranque PM2
├── reset_admin.py          # Script de restauración de accesos criptográficos
├── requirements.txt        # Manifiesto de dependencias Python pip
├── venv/                   # Entorno virtual de aislamiento Python
└── frontend/               # Directorio del Dashboard Web (Proceso: DASHBOARD-WEB)
    ├── app/
    │   ├── page.js         # Interfaz Táctica con useMemo y Mapas
    │   ├── globals.css     # Estilos y variables CSS Tailwind
    │   └── layout.js       # Next.js Root Layout
    ├── package.json        # Manifiesto de dependencias Node.js
    └── tailwind.config.js  # Configuración del motor Tailwind
```
### 📦 Implementación desde Máquina Virtual OVA
Para fines de evaluación académica en la UNIR o rápida auditoría, el sistema completo se distribuye comprimido en formato .OVA alojado en la nube. Esta máquina cuenta con auto-descubrimiento DHCP.

### 1. Descarga e Importación
Máquina virtual preconfigurada (OVA): permite desplegar el entorno completo del sistema sin necesidad de realizar instalaciones o configuraciones adicionales. 
```Bash
https://mega.nz/file/Pxh1TTSR#YNtWuXLH1p46mq4ew0W4j_l5aNRQ5L9ah0a4PAMNFNU 
```
Repositorio del proyecto: contiene el código fuente del sistema, organizado por módulos, junto con los archivos necesarios para su compilación y mantenimiento.
```Bash
https://github.com/stalyn-p/SocialAlert-monitor.git  
```
Manual de usuario: incluye las instrucciones para la configuración y utilización de las principales funcionalidades del sistema.
```Bash
https://mega.nz/file/DxgS2J4Z#lgRNiTe3j8ALPWOD2xzqIv2OSoRKG7sPp2PprK9PmgM 
```
Video demostrativo: presenta el funcionamiento general del sistema y ejemplifica el uso de sus principales características.
```Bash
https://mega.nz/file/apJllIST#6jOgl87mRtg0o1SDSpCyBlGzOnRvpJKVFZwFspg7zlk 
```

Abra Oracle VM VirtualBox (o VMware).

Seleccione Archivo > Importar servicio virtualizado y cargue el .ova.

⚠️ CONFIGURACIÓN OBLIGATORIA DE RED: En las propiedades de red de la Máquina Virtual, asegúrese de que el adaptador esté configurado en modo "Adaptador Puente" (Bridged Adapter) y elija su tarjeta de red física de salida. Esto garantiza que el router de su entorno le provea una dirección IP válida mediante DHCP.

Ejecute la importación.

### 2. Credenciales del Sistema Operativo (Consola Linux / SSH)
Al encender la máquina virtual, podrá acceder a la consola con los siguientes privilegios:
```Bash
-Usuario SSH / Linux: monitor
-Contraseña Linux: monitor
```
Para escalar a root y obtener privilegios de administración, ejecute: sudo su e introduzca la contraseña monitor.

### 3. Conexión al Dashboard e Identidad de Pruebas
Una vez encendido el sistema, identifique la IP asignada por su red local mediante el comando ip a (por ejemplo: 192.168.3.104). Abra el navegador de su máquina física (Host) e ingrese a la dirección:
```Bash
👉 http://192.168.3.104:3000
```
### 4. Credenciales de Acceso a la Interfaz Web (Dashboard)
```Bash
Usuario: admin
Contraseña: Csirt2026.
```
### 🛠️ Instalación Manual Paso a Paso
Si decide realizar un despliegue nativo sin la máquina virtual, ejecute la siguiente secuencia en un sistema Ubuntu/Debian limpio:

### 1. Enriquecimiento del Sistema e Instalación de Dependencias
```Bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv mongodb nodejs npm git curl
```
### 2. Despliegue del Entorno Virtual y Librerías de Extracción
```Bash
cd /opt/social-monitor
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn pymongo pandas requests passlib python-jose playwright schedule
playwright install chromium
playwright install-deps
```
### 3. Compilación de la Interfaz Web (Production Build)
```Bash
cd /opt/social-monitor/frontend
npm install
npm run build
```
📄 Archivos de Configuración Críticos
Para asegurar la replicabilidad total del entorno, se anexan las estructuras de los tres archivos de control añadidos en la versión estable:

### 4. requirements.txt (Librerías Python)
 ```Plaintext
fastapi==0.110.0
uvicorn==0.28.0
pymongo==4.6.2
pandas==2.2.1
requests==2.31.0
passlib[bcrypt]==1.7.4
python-jose[cryptography]==3.3.0
playwright==1.42.0
schedule==1.2.1
openpyxl==3.1.2
python-multipart==0.0.9
```
### 5. ecosystem.config.js (Orquestación PM2)
```JavaScript
module.exports = {
  apps: [
    {
      name: 'CEREBRO-API',
      script: './venv/bin/python3',
      args: '-m uvicorn api:app --host 0.0.0.0 --port 8000',
      cwd: '/opt/social-monitor',
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'TIKTOK-INTEL',
      script: './venv/bin/python3',
      args: 'tiktok_server.py',
      cwd: '/opt/social-monitor',
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'TWITTER-INTEL',
      script: './venv/bin/python3',
      args: 'twitter_server.py',
      cwd: '/opt/social-monitor',
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'FACEBOOK-INTEL',
      script: './venv/bin/python3',
      args: 'facebook_server.py',
      cwd: '/opt/social-monitor',
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'INSTAGRAM-INTEL',
      script: './venv/bin/python3',
      args: 'instagram_server.py',
      cwd: '/opt/social-monitor',
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'ESPIA-MONITOR',
      script: './venv/bin/python3',
      args: 'monitor.py',
      cwd: '/opt/social-monitor',
      autorestart: true,
      max_memory_restart: '500M'
    },
    {
      name: 'DASHBOARD-WEB',
      script: 'npm',
      args: 'start',
      cwd: '/opt/social-monitor/frontend',
      autorestart: true,
      max_memory_restart: '1.5G',
      env: { NODE_ENV: 'production', PORT: 3000 }
    }
  ]
};
```
### 6. reset_admin.py (Script de Recuperación de Credenciales)
 ```Python
import sys
from pymongo import MongoClient
from passlib.context import CryptContext

def inicializar_administrador():
    try:
        client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=3000)
        db = client['social_alert_db']
        client.server_info()
    except Exception as e:
        print(f"[-] Error: No se conectó a MongoDB: {str(e)}")
        sys.exit(1)

    pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
    usuario_target = "admin"
    password_target = "Csirt2026."

    db.users.delete_many({"username": usuario_target})
    db.users.insert_one({
        "username": usuario_target,
        "hashed_password": pwd_context.hash(password_target)
    })
    print(f"[+] Credenciales inyectadas con éxito.\nUser: {usuario_target}\nPass: {password_target}")

if __name__ == "__main__":
    inicializar_administrador()
```

    
### 🚀 Ejecución del Ecosistema mediante PM2
Con la introducción del archivo ecosystem.config.js, no se requiere ejecutar comandos individuales por servicio. Despliegue el entorno completo con las siguientes directivas:

Bash
cd /opt/social-monitor

# 1. Purgar cualquier proceso remanente en memoria
pm2 delete all

# 2. Inicializar la arquitectura completa en caliente
pm2 start ecosystem.config.js

# 3. Consolidar el arranque automático con el S.O.
pm2 save
pm2 startup


### ⚙️ Configuración Inicial y Accesos
El sistema cuenta con un motor adaptativo de descubrimiento DHCP. No requiere configurar IPs estáticas en archivos .env. El frontend calcula su origen en tiempo real mediante la instrucción:

```JavaScript
const API_URL = typeof window !== "undefined" ? `http://${window.location.hostname}:8000` : "http://localhost:8000";
```
Para inicializar el analista administrador por defecto en MongoDB, acceda a la consola interactiva de python y ejecute:
```Python
from pymongo import MongoClient
from passlib.context import CryptContext

db = MongoClient("mongodb://localhost:27017/")['social_alert_db']
pwd_context = CryptContext(schemes=["pbkdf2_sha256"])
db.users.insert_one({"username": "admin", "hashed_password": pwd_context.hash("Csirt2026.")})
```

### 🚀 Ejecución del Proyecto (Gestión PM2)Para garantizar la ejecución ininterrumpida de los 7 microservicios, se utiliza PM2 como controlador de procesos del ecosistema:
```Bash
sudo npm install -g pm2
cd /opt/social-monitor
source venv/bin/activate

# Registrar Microservicios en PM2
`
pm2 start venv/bin/python3 --name "CEREBRO-API" -- -m uvicorn api:app --host 0.0.0.0 --port 8000
pm2 start venv/bin/python3 --name "TIKTOK-INTEL" -- tiktok_server.py
pm2 start venv/bin/python3 --name "TWITTER-INTEL" -- twitter_server.py
pm2 start venv/bin/python3 --name "FACEBOOK-INTEL" -- facebook_server.py
pm2 start venv/bin/python3 --name "INSTAGRAM-INTEL" -- instagram_server.py
pm2 start venv/bin/python3 --name "ESPIA-MONITOR" -- monitor.py

# Registrar Interfaz Gráfica
cd frontend
pm2 start npm --name "DASHBOARD-WEB" -- start

# Consolidar persistencia en arranque del S.O.
pm2 save
pm2 startup
```
### 🔄 Casos de Uso y Flujo de Funcionamiento
Escenarios Operativos Comunes:
Alerta Temprana en Crisis: Monitorización en tiempo real de disturbios urbanos o ciberamenazas mediante el uso de términos encadenados.

Aislamiento de Casos: El analista puede seleccionar una sola de las submisiones activas (ej. sicariato guayaquil) para limpiar el espectro de datos, filtrando la lista de tarjetas y el mapa táctico de inmediato.

### 🧩 Funcionalidades Detalladas
- Sincronización por Lotes (Batching): Diseñado para preservar la integridad del procesador. Si se ingresan 20 misiones pero el lote está fijado en 1, el orquestador procesará de 1 en 1 de arriba hacia abajo de manera descendente.
- Filtros Inteligentes en Cascada: Al presionar un sub-objetivo en la barra superior, la UI aislará los hallazgos en la pantalla y posicionará los marcadores del mapa Leaflet en torno a ese criterio de búsqueda específico.
- Garantía Anti-Bloqueo de Interfaz: Toda la volumetría de datos y parseo geográfico pasa por filtros useMemo en React, lo que impide re-renders innecesarios y elimina cualquier retraso o lag al tipear texto en la UI.
- Fórmulas Forenses Blindadas: Las ecuaciones de la tasa de precisión ($VP / [VP+FP]$) y el tiempo medio de detección ($TMD$) se calculan basándose en los históricos globales de la base de datos, impidiendo desajustes matemáticos al usar filtros parciales en el frontend.

### 📸 Capturas de la Interfaz de Usuario
(Reemplace las rutas con imágenes reales al subirlas a producción en GitHub)

Pantalla de acceso seguro encargada de la validación mediante Tokens JWT.

Dashboard Global mostrando el Filtro interactivo de Submisiones, el Mapa Táctico de Ecuador y los indicadores de Precisión en tiempo real.

### 🔐 Buenas Prácticas de Seguridad y Hardening
### 🚨 Riesgos de Operación Conocidos (OPSEC)
Baneo de Firma de Red (Rate Limiting): Si se mantiene el escáner operando con una frecuencia de 1 minuto, los firewalls (WAF) de Google o Meta detectarán la IP del servidor.

Mitigación implementada: Ingrese al panel del engranaje ⚙️ y configure la Frecuencia de Barrido a 10 o 15 minutos para simular tráfico humano legítimo y proteger la firma de red.

### 🛠️ Hardening del Servidor
Aislamiento de MongoDB: No exponga el puerto 27017 al exterior de la red. Modifique /etc/mongod.conf para enlazar únicamente a la interfaz de loopback 127.0.0.1.

Firewall Local (UFW): Cierre todos los accesos directos de los microservicios e interfases internas, permitiendo únicamente el tráfico de control web:

```Bash
sudo ufw default deny incoming
sudo ufw allow 3000/tcp # Acceso al Dashboard Web
sudo ufw enable
```

### 🔍 Troubleshooting y Gestión de Logs
🚨 Comando de Inspección Crítica (Logs del Orquestador)
Si desea observar el comportamiento interno del motor multihilo de extracción en tiempo real y auditar los saltos de lote sin el envoltorio de PM2, detenga el proceso de monitorización e inícielo manualmente con la siguiente instrucción de consola:

```Bash
pm2 stop ESPIA-MONITOR
/opt/social-monitor/venv/bin/python3 /opt/social-monitor/monitor.py
```
Este comando desplegará los logs con la estructura exacta de tiempos y lotes solicitada para las auditorías de relevo.

### 🔄 Reinicio Rápido de Emergencia (Ecosistema)
Para reiniciar todos los microservicios y restaurar sockets caídos tras un cambio de red por DHCP, ejecute:

```Bash
pm2 restart all
```

### 🧠 Corrección del Error Runtime: isExactMatch is not defined
Causa: Conflicto del motor de compilación Next.js (Turbopack) que retiene archivos corruptos en memoria caché tras un guardado de código caliente.

Solución Quirúrgica:

```Bash
cd /opt/social-monitor/frontend
rm -rf .next
npm run build
pm2 restart DASHBOARD-WEB
```

### 💾 Procedimiento de Respaldo y Recuperación
Respaldo de Inteligencia Acumulada (Hot Backup)
```Bash
mongodump --db social_alert_db --out /opt/backups/osint_backup_$(date +%F)
```
Recuperación ante Desastres (Disaster Recovery)
```Bash
mongorestore --db social_alert_db --drop /opt/backups/osint_backup_ANTERIOR/social_alert_db
```

### 🧹 Guía de Mantenimiento
Rotación de Logs Preventiva: Evite que los registros de PM2 saturen el almacenamiento de 80 GB instalando el módulo de rotación automática:

```Bash
pm2 install pm2-logrotate
```
Actualización de Firmas DOM: Debido a las modificaciones periódicas en la maquetación web de las redes sociales, se sugiere actualizar las dependencias de los navegadores headless de forma mensual:

```Bash
/opt/social-monitor/venv/bin/playwright install chromium
```

### 🛣️ Roadmap Futuro
- [ ] Integración de proxies rotativos residenciales cifrados en los microservicios *-INTEL.

- [ ] Implementación de un modelo de Inteligencia Actoral local (LLM mediante Ollama) para la categorización avanzada del nivel de riesgo.

- [ ] Generación y exportación automatizada de reportes PDF bajo firmas criptográficas hash.

### 📜 Licencia, Créditos y Contacto
Créditos
- Autor Principal: Ing. Stalyn Pauta Cuji.

- Tutor de Investigación: Cuerpo Docente UNIR.

- Institución: UNIR (Universidad Internacional de La Rioja) - Trabajo de Fin de Máster en Ciberseguridad.

### Licencia
Este software se distribuye con fines de investigación académica y monitorización pasiva OSINT. Se distribuye bajo la licencia MIT. Consulte el archivo LICENSE para más detalles.





