# 🛡️ OPERACIONES DE CIBERDEFENSA: Social Monitor OSINT

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





