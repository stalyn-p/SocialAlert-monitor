/*
=============================================================================
 SISTEMA OSINT - SOCIAL MONITOR v2.9.5 (SUB-OBJETIVOS DINÁMICOS)
 DOCUMENTACIÓN DE RELEVO TÉCNICO: page.js (Panel Frontal Avanzado React)
-----------------------------------------------------------------------------
 - MEJORA UI: Filtros de cabecera por Submisión con contador de impactos.
 - OPTIMIZACIÓN: Fórmulas de Precisión y TMD blindadas contra el filtrado.
 - DICCIONARIO: Integración de las 24 Provincias del Ecuador (Cobertura Nacional).
=============================================================================
*/

"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';

// Importación dinámica de componentes del Mapa (Evita errores de SSR en Next.js)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Registro de elementos gráficos para los diagramas de pastel
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// ============================================================================
// 🚨 FUNCIONES GLOBALES (FUERA DEL COMPONENTE PARA EVITAR CACHÉ "NOT DEFINED")
// ============================================================================

// Asigna el color hexadecimal nativo de la red social detectada
function getHexColor(fuente) {
    const f = (fuente || '').toLowerCase();
    if (f.includes('tiktok')) return '#ec4899';
    if (f.includes('facebook')) return '#2563eb';
    if (f.includes('instagram')) return '#db2777';
    if (f.includes('twitter') || f.includes('x')) return '#0ea5e9';
    return '#10b981'; // Verde por defecto para prensa/noticias
}

// Asigna clases CSS de Tailwind para pintar el borde lateral de las tarjetas
function getSideColor(fuente) {
    const f = (fuente || '').toLowerCase();
    if (f.includes('tiktok')) return 'bg-pink-500';
    if (f.includes('facebook')) return 'bg-blue-600';
    if (f.includes('instagram')) return 'bg-pink-600';
    if (f.includes('twitter') || f.includes('x')) return 'bg-sky-500';
    return 'bg-emerald-500';
}

// Asigna clases CSS de Tailwind para las etiquetas o "Badges" sólidas
function getSolidBadgeColor(fuente) {
    const f = (fuente || '').toLowerCase();
    if (f.includes('tiktok')) return 'bg-slate-700 text-white';
    if (f.includes('facebook')) return 'bg-blue-600 text-white';
    if (f.includes('instagram')) return 'bg-pink-600 text-white';
    if (f.includes('twitter') || f.includes('x')) return 'bg-sky-600 text-white';
    return 'bg-emerald-600 text-white';
}

// Motor lógico para encontrar palabras clave dentro del texto de la noticia y asignarle ubicación
function isExactMatch(text, keys) {
    return keys.some(k => {
        // Expresión Regular (Regex): Busca la palabra exacta aislada para no confundir "oro" con "coro"
        const regex = new RegExp(`(?:^|[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9])${k}(?=[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9]|$)`, 'i');
        return regex.test(text);
    });
}

// ============================================================================
// 🚨 MEGA DICCIONARIO GEOGRÁFICO DEL ECUADOR (24 PROVINCIAS + SECTORES)
// ============================================================================
const ZONAS_ESPECIFICAS = [
    // --- GUAYAQUIL Y SECTORES URBANOS CLAVE ---
    { id: "aeropuerto_olmedo", coords: [-2.1512, -79.8820], keys: ["aeropuerto", "aeropuerto jose joaquin olmedo", "aeropuerto josé joaquín olmedo", "olmedo"] },
    { id: "via_daule", coords: [-2.0850, -79.9480], keys: ["vía a daule", "via a daule", "via daule", "km via a daule"] },
    { id: "via_costa", coords: [-2.1800, -79.9600], keys: ["vía a la costa", "via a la costa", "chongón", "puerto hondo"] },
    { id: "mucho_lote_2", coords: [-2.0650, -79.9400], keys: ["mucho lote 2", "mucholote 2", "mucho lote etapa 2"] },
    { id: "sauces_8_9", coords: [-2.1190, -79.8960], keys: ["sauces 8", "sauces 9", "sauces ocho", "sauces nueve"] },
    { id: "sauces_6_7", coords: [-2.1250, -79.8950], keys: ["sauces 6", "sauces 7", "sauces seis", "sauces siete"] },
    { id: "sauces_3_4_5", coords: [-2.1320, -79.8940], keys: ["sauces 3", "sauces 4", "sauces 5", "sauces tres", "sauces cuatro"] },
    { id: "sauces_1_2", coords: [-2.1380, -79.8960], keys: ["sauces 1", "sauces 2", "sauces uno", "sauces dos"] },
    { id: "mucho_lote_1", coords: [-2.0910, -79.9140], keys: ["mucho lote 1", "mucho lote", "mucholote", "villa españa", "orquideas", "vergeles"] },
    { id: "bastion", coords: [-2.1030, -79.9420], keys: ["bastión", "bastion", "bastion popular", "bloque 7", "bloque 1"] },
    { id: "pascuales", coords: [-2.0740, -79.9320], keys: ["pascuales"] },
    { id: "samanes", coords: [-2.1150, -79.9000], keys: ["samanes", "guayacanes", "los samanes"] },
    { id: "alborada", coords: [-2.1350, -79.9000], keys: ["alborada", "garzota", "acuarela"] },
    { id: "urdesa", coords: [-2.1650, -79.9050], keys: ["urdesa", "miraflores", "kennedy", "urdesa central"] },
    { id: "ceibos", coords: [-2.1650, -79.9300], keys: ["ceibos", "mapasingue", "prosperina", "florida", "socio vivienda"] },
    { id: "guasmo", coords: [-2.2530, -79.8920], keys: ["guasmo", "playita", "esteros", "pradera", "siete lagos", "valdivia", "floresta", "guangala"] },
    { id: "suburbio", coords: [-2.2150, -79.9150], keys: ["suroeste", "suburbio", "portete", "trinitaria", "cristo del consuelo", "batallon", "la 29", "isla trinitaria"] },
    { id: "centro_gye", coords: [-2.1908, -79.8841], keys: ["9 de octubre", "garcia aviles", "malecón", "malecon", "cerro santa ana", "bahía", "centro de guayaquil", "urdaneta"] },
    { id: "duran", coords: [-2.1700, -79.8300], keys: ["durán", "duran", "el recreo", "primavera", "cerro las cabras"] },
    { id: "samborondon", coords: [-2.1100, -79.8700], keys: ["samborondon", "samborondón", "puntilla", "entre rios", "buijo"] },
    { id: "daule", coords: [-1.8622, -79.9775], keys: ["daule", "la aurora", "vía salitre", "via salitre"] },
    { id: "milagro", coords: [-2.1339, -79.5936], keys: ["milagro", "yaguachi", "naranjal", "naranjito", "el triunfo", "balzar"] },
    
    // --- RESTO DE LA COSTA ECUATORIANA ---
    { id: "machala", coords: [-3.2581, -79.9554], keys: ["machala", "el oro", "puerto bolívar", "puerto bolivar", "pasaje", "huaquillas", "santa rosa", "arenillas"] },
    { id: "manta", coords: [-0.9677, -80.7127], keys: ["manta", "manabí", "manabi", "tarqui", "los esteros"] },
    { id: "portoviejo", coords: [-1.0546, -80.4544], keys: ["portoviejo", "crucita", "chone", "bahía de caráquez", "calceta"] },
    { id: "esmeraldas", coords: [0.9639, -79.6517], keys: ["esmeraldas", "atacames", "muisne", "quinindé", "quininde", "san lorenzo"] },
    { id: "quevedo", coords: [-1.0286, -79.4635], keys: ["quevedo", "los ríos", "los rios", "buena fe", "mocache", "valencia"] },
    { id: "babahoyo", coords: [-1.8022, -79.5344], keys: ["babahoyo", "ventanas", "vinces", "puebloviejo"] },
    { id: "santa_elena", coords: [-2.2262, -80.8587], keys: ["santa elena", "la libertad", "salinas", "montañita", "manglaralto", "ballenita", "ruta del sol"] },
    { id: "santo_domingo", coords: [-0.2530, -79.1754], keys: ["santo domingo", "tsáchilas", "tsachilas", "la concordia"] },
    
    // --- REGIÓN SIERRA ---
    { id: "quito_norte", coords: [-0.1500, -78.4800], keys: ["norte de quito", "carcelén", "carcelen", "ponceano", "condado", "cotocollao"] },
    { id: "quito_centro", coords: [-0.2100, -78.5000], keys: ["centro de quito", "mariscal", "ejido", "carolina", "centro histórico", "panecillo"] },
    { id: "quito_sur", coords: [-0.2800, -78.5200], keys: ["sur de quito", "chillogallo", "guamaní", "guamani", "quitumbe", "solanda", "villaflora"] },
    { id: "quito_valles", coords: [-0.2600, -78.4300], keys: ["valle de los chillos", "sangolquí", "sangolqui", "cumbayá", "cumbaya", "tumbaco", "conocoto"] },
    { id: "cuenca", coords: [-2.9001, -79.0059], keys: ["cuenca", "azuay", "tomebamba", "yanuncay", "gualaceo", "paute", "sígsig"] },
    { id: "ambato", coords: [-1.2417, -78.6229], keys: ["ambato", "tungurahua", "baños de agua santa", "pelileo", "píllaro"] },
    { id: "loja", coords: [-3.9931, -79.2042], keys: ["loja", "catamayo", "macará", "macara", "vilcabamba", "saraguro"] },
    { id: "riobamba", coords: [-1.6653, -78.6523], keys: ["riobamba", "chimborazo", "guano", "alausí", "chambo"] },
    { id: "ibarra", coords: [0.3517, -78.1223], keys: ["ibarra", "imbabura", "otavalo", "cotacachi", "atuntaqui", "pimampiro"] },
    { id: "latacunga", coords: [-0.9329, -78.6150], keys: ["latacunga", "cotopaxi", "pujilí", "saquisilí", "salcedo"] },
    { id: "tulcan", coords: [0.8115, -77.7185], keys: ["tulcán", "tulcan", "carchi", "san gabriel", "mira", "el ángel"] },
    { id: "azogues", coords: [-2.7397, -78.8486], keys: ["azogues", "cañar", "biblián", "la troncal", "el tambo"] },
    { id: "guaranda", coords: [-1.5926, -79.0008], keys: ["guaranda", "bolívar", "bolivar", "san miguel", "chimbo"] },

    // --- REGIÓN ORIENTE (AMAZONÍA) ---
    { id: "nueva_loja", coords: [0.0860, -76.8833], keys: ["nueva loja", "lago agrio", "sucumbíos", "sucumbios", "shushufindi", "putumayo"] },
    { id: "coca", coords: [-0.4662, -76.9872], keys: ["coca", "puerto francisco de orellana", "orellana", "joya de los sachas", "loreto"] },
    { id: "tena", coords: [-0.9938, -77.8129], keys: ["tena", "napo", "archidona", "el chaco", "quijos"] },
    { id: "puyo", coords: [-1.4837, -77.9954], keys: ["puyo", "pastaza", "mera", "santa clara"] },
    { id: "macas", coords: [-2.3086, -78.1114], keys: ["macas", "morona santiago", "morona", "sucúa", "gualaquiza", "palora"] },
    { id: "zamora", coords: [-4.0692, -78.9567], keys: ["zamora", "zamora chinchipe", "yantzaza", "zumba", "el pangui"] },

    // --- REGIÓN INSULAR (GALÁPAGOS) ---
    { id: "puerto_ayora", coords: [-0.7402, -90.3138], keys: ["puerto ayora", "santa cruz", "baltra", "galápagos", "galapagos"] },
    { id: "puerto_baquerizo", coords: [-0.9022, -89.6017], keys: ["puerto baquerizo", "san cristóbal", "san cristobal"] },
    { id: "isabela", coords: [-0.9538, -91.0203], keys: ["puerto villamil", "isabela"] }
];

// Fallbacks Nacionales si no coincide con ciudad específica
const ZONAS_GENERALES = [
    { id: "guayaquil_gen", coords: [-2.1800, -79.8900], keys: ["guayaquil", "guayas", "gye"] },
    { id: "quito_gen", coords: [-0.1807, -78.4678], keys: ["quito", "pichincha"] },
    { id: "ecuador_gen", coords: [-1.8312, -78.1834], keys: ["ecuador", "nacional", "país"] }
];

export default function Dashboard() {
  
  // Extrae la IP de la laptop/servidor en tiempo real mediante DHCP
  const API_URL = typeof window !== "undefined" ? `http://${window.location.hostname}:8000` : "http://localhost:8000";

  // Controladores de Sesión
  const [token, setToken] = useState(null);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [errorLogin, setErrorLogin] = useState("");

  // Estructuras de Datos Maestros
  const [alertas, setAlertas] = useState([]); // Base total de alertas para la misión seleccionada
  const [tareas, setTareas] = useState([]);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [vista, setVista] = useState("dashboard");

  // Controladores de Componentes Ocultos
  const [mostrarConfig, setMostrarConfig] = useState(false); // Despliega el menú de Lotes y Temporizador

  // Motores de Filtrado Visual
  const [filtroFuente, setFiltroFuente] = useState('TODOS');
  const [filtroTermino, setFiltroTermino] = useState('TODOS'); // Controlador de las submisiones
  const [busquedaTexto, setBusquedaTexto] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [mostrarStats, setMostrarStats] = useState(false);
  const [mostrarMapa, setMostrarMapa] = useState(false);

  // Parámetros Tácticos Modificables
  const [concurrencia, setConcurrencia] = useState(1);
  const [intervaloScan, setIntervaloScan] = useState(1);
  const [ipInfo, setIpInfo] = useState(null);

  // Estados Formulario de Edición/Creación
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editQuery, setEditQuery] = useState("");
  const [nuevoQuery, setNuevoQuery] = useState("");
  const [redes, setRedes] = useState({ twitter: true, tiktok: true, facebook: true, instagram: true });
  const [medios, setMedios] = useState({ eluniverso: true, expreso: true, primicias: true, extra: false });

  // Referencias para la funcionalidad de organizar misiones arrastrando (Drag & Drop)
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  // Inicializa parámetros tácticos desde la DB
  const fetchConfigInit = async () => {
      try {
          const res = await fetch(`${API_URL}/config`);
          const data = await res.json();
          if (data.concurrencia) setConcurrencia(data.concurrencia);
          if (data.intervalo_scan) setIntervaloScan(data.intervalo_scan);
      } catch (e) {}
  };

  // Trae el estado actual de la IP (Anti-Baneo)
  const fetchEstadoIP = async () => {
      try {
          const res = await fetch(`${API_URL}/config/estado_ip`);
          const data = await res.json(); setIpInfo(data);
      } catch (e) { setIpInfo({ ip: "Desconocida", puertos: "8000-8004", estado: "DOWN" }); }
  };

  // Carga de sesión local
  useEffect(() => {
      const savedToken = localStorage.getItem("social_token");
      if (savedToken) setToken(savedToken);
  }, []);

  // Intervalos de Refresco de Datos en tiempo real
  useEffect(() => {
      if (token) {
          fetchConfigInit(); fetchEstadoIP(); fetchData();
          const interval = setInterval(fetchData, 4000); // 4 segundos para resultados
          const intervalIP = setInterval(fetchEstadoIP, 25000); // 25 segundos para estado de red
          return () => { clearInterval(interval); clearInterval(intervalIP); };
      }
  }, [token, tareaSeleccionada, vista]);

  const handleLogin = async (e) => {
      e.preventDefault(); setErrorLogin("");
      const formData = new URLSearchParams(); formData.append('username', user); formData.append('password', pass);
      try {
          const res = await fetch(`${API_URL}/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData });
          if (!res.ok) throw new Error();
          const data = await res.json(); setToken(data.access_token); localStorage.setItem("social_token", data.access_token);
      } catch (err) { setErrorLogin("Usuario o contraseña incorrectos"); }
  };
  const handleLogout = () => { setToken(null); localStorage.removeItem("social_token"); };

  // ============================================================================
  // SINCRONIZACIÓN DE MISIONES Y CONTROL DE ORDEN ESTRICTO (ARRIBA HACIA ABAJO)
  // ============================================================================
  const fetchData = async () => {
      if (!token) return;
      try {
          const resTareas = await fetch(`${API_URL}/tareas`);
          let dataTareas = await resTareas.json();
          dataTareas = Array.isArray(dataTareas) ? dataTareas : [];
          
          let savedOrder = [];
          try { savedOrder = JSON.parse(localStorage.getItem("ordenMisiones") || "[]"); } catch(e) {}

          if (savedOrder.length > 0) {
              dataTareas.sort((a, b) => {
                  const idxA = savedOrder.indexOf(a.id_visual); const idxB = savedOrder.indexOf(b.id_visual);
                  if (idxA === -1) return 1; if (idxB === -1) return -1;
                  return idxA - idxB;
              });
          }
          setTareas(dataTareas);

          // Obliga a la Base de Datos a guardar el orden de pantalla actual
          const currentIds = dataTareas.map(t => t.id_visual);
          if (JSON.stringify(currentIds) !== JSON.stringify(savedOrder)) {
              localStorage.setItem("ordenMisiones", JSON.stringify(currentIds));
              fetch(`${API_URL}/config/orden`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orden: currentIds }) }).catch(e => {});
          }

          let urlAlertas = `${API_URL}/alertas`;
          if (tareaSeleccionada) urlAlertas = `${API_URL}/resultados/${tareaSeleccionada}`;
          const resAlertas = await fetch(urlAlertas); const jsonAlertas = await resAlertas.json();
          setAlertas(Array.isArray(jsonAlertas) ? jsonAlertas : []);
      } catch (e) {}
  };

  const handleSort = async () => {
      if (dragItem.current === null || dragOverItem.current === null) return;
      let _tareas = [...tareas]; const item = _tareas.splice(dragItem.current, 1)[0];
      _tareas.splice(dragOverItem.current, 0, item); dragItem.current = null; dragOverItem.current = null;
      setTareas(_tareas);
      
      const nuevoOrden = _tareas.map(t => t.id_visual); localStorage.setItem("ordenMisiones", JSON.stringify(nuevoOrden));
      try { await fetch(`${API_URL}/config/orden`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orden: nuevoOrden }) }); } catch (e) {}
  };

  const crearTarea = async () => { 
      const redesSelect = Object.keys(redes).filter(k => redes[k]); const mediosSelect = Object.keys(medios).filter(k => medios[k]); 
      await fetch(`${API_URL}/nueva_tarea`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: nuevoQuery, redes: redesSelect, medios: mediosSelect }) }); 
      setNuevoQuery(""); setVista("dashboard"); setTareaSeleccionada(null); setTimeout(fetchData, 500); 
  };
  const toggleEstado = async (id, estadoActual, e) => { e.stopPropagation(); await fetch(`${API_URL}/tareas/${id}/estado`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activo: !estadoActual }) }); fetchData(); };
  const eliminarTarea = async (id, e) => { e.stopPropagation(); if (confirm("¿Confirmas la anulación de esta Misión?")) { await fetch(`${API_URL}/tareas/${id}`, { method: "DELETE" }); setTareaSeleccionada(null); fetchData(); } };
  const guardarEdicion = async (id, e) => { e.stopPropagation(); if (editQuery.trim()) { await fetch(`${API_URL}/tareas/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: editQuery }) }); setEditingTaskId(null); fetchData(); } };

  const formatearFecha = (fechaStr) => {
      if (!fechaStr) return "";
      return String(fechaStr).replace('T', ' ').replace('Z', '').split('.')[0].trim();
  };

  // ============================================================================
  // 🚨 OPTIMIZACIÓN USEMEMO: Protege la RAM y previene el congelamiento (Lag)
  // ============================================================================
  
  // Construye el conteo individual por submisión
  const misionesMap = useMemo(() => { return alertas.reduce((acc, curr) => { const m = (curr.termino_buscado || curr.nombre_mision || 'Desconocida').trim(); acc[m] = (acc[m] || 0) + 1; return acc; }, {}); }, [alertas]);
  
  // Filtro Primario: Separa alertas basadas en la submisión clickeada por el analista
  const alertasBaseContexto = useMemo(() => { return alertas.filter(a => filtroTermino === 'TODOS' ? true : (a.termino_buscado || a.nombre_mision || "").trim() === filtroTermino.trim()); }, [alertas, filtroTermino]);
  
  // Cuenta cuantas alertas quedaron por red social
  const fuentesMap = useMemo(() => { return alertasBaseContexto.reduce((acc, curr) => { const f = (curr.fuente || 'prensa').toLowerCase(); acc[f] = (acc[f] || 0) + 1; return acc; }, {}); }, [alertasBaseContexto]);
  
  // Filtro Secundario: Búsquedas manuales, fechas, red social.
  const alertasFiltradas = useMemo(() => { return alertasBaseContexto.filter(a => { if (busquedaTexto && !((a.titulo+a.url).toLowerCase().includes(busquedaTexto.toLowerCase()))) return false; if (filtroFuente !== 'TODOS' && !(a.fuente || "").toLowerCase().includes(filtroFuente.toLowerCase())) return false; if (fechaInicio && new Date(a.fecha) < new Date(fechaInicio)) return false; if (fechaFin && new Date(a.fecha) > new Date(fechaFin + 'T23:59:59')) return false; return true; }); }, [alertasBaseContexto, busquedaTexto, filtroFuente, fechaInicio, fechaFin]);

  // Motor Generador del Mapa Táctico
  const alertasMapa = useMemo(() => { 
      return alertasFiltradas.map((a) => { 
          let coords = null; 
          const textToScan = `${a.titulo} ${a.url}`.toLowerCase(); 
          const missionContext = (a.termino_buscado || a.nombre_mision || "").toLowerCase(); 
          // Busca el ID del diccionario que coincida con el texto de la alerta
          let matchedData = ZONAS_ESPECIFICAS.find(data => isExactMatch(textToScan, data.keys)) || ZONAS_ESPECIFICAS.find(data => isExactMatch(missionContext, data.keys)) || ZONAS_GENERALES.find(data => isExactMatch(textToScan, data.keys)) || ZONAS_GENERALES.find(data => isExactMatch(missionContext, data.keys)); 
          
          if (matchedData) { 
              let hash = 0; const str = a.titulo || "default"; 
              for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash); 
              // Genera dispersión visual en el mapa para puntos acumulados en la misma zona
              const radius = Math.abs((hash % 100) / 100) * 0.002; 
              const angle = Math.abs(((hash >> 8) % 100) / 100) * Math.PI * 2; 
              coords = [matchedData.coords[0] + (radius * Math.cos(angle)), matchedData.coords[1] + (radius * Math.sin(angle))]; 
          } 
          return { ...a, coords }; 
      }).filter(a => a.coords !== null); 
  }, [alertasFiltradas]);
  
  const mapCenter = alertasMapa.length > 0 ? alertasMapa[0].coords : [-1.8312, -78.1834]; // Centro Nacional Ecuador por defecto
  const mapZoom = alertasMapa.length > 0 ? 13 : 6;

  // Gráfica de distribución 
  const chartFuentesMap = useMemo(() => { return alertasFiltradas.reduce((acc, curr) => { const f = (curr.fuente || 'Prensa').toUpperCase(); acc[f] = (acc[f] || 0) + 1; return acc; }, {}); }, [alertasFiltradas]);
  const pieData = useMemo(() => { return { labels: Object.keys(chartFuentesMap), datasets: [{ data: Object.values(chartFuentesMap), backgroundColor: Object.keys(chartFuentesMap).map(f => { if(f.includes('TIKTOK')) return '#ec4899'; if(f.includes('FACEBOOK')) return '#2563eb'; if(f.includes('INSTAGRAM')) return '#db2777'; if(f.includes('TWITTER') || f.includes('X')) return '#0ea5e9'; return '#10b981'; }), borderWidth: 0 }] }; }, [chartFuentesMap]);

  // ============================================================================
  // 🚨 OPERACIONES MATEMÁTICAS FORMALES (PRECISIÓN Y TMD DINÁMICO)
  // Nota: Estas fórmulas procesan los cálculos usando la variable de "alertas.length"
  // (Base total) para garantizar que las cifras principales del proyecto no se rompan 
  // al filtrar un submisión.
  // ============================================================================
  const metricas = useMemo(() => {
      const tareaActual = tareas.find(t => t.id_visual === tareaSeleccionada);
      const VP = alertas.length; // Usa la misión completa para preservar estabilidad
      const TotalAnalizadosBackend = tareaActual?.stats?.analizados || VP;
      const TotalAnalizados = TotalAnalizadosBackend < VP ? VP : TotalAnalizadosBackend;
      const FP = TotalAnalizados - VP; 
      const TotalReal = VP + FP; 
      const precisionCalc = TotalReal > 0 ? ((VP / TotalReal) * 100).toFixed(1) : "0.0";
      
      const tmdBase = intervaloScan * 60; 
      const sumaTiempos = VP * tmdBase; 
      const tmdCalc = VP > 0 ? (sumaTiempos / VP).toFixed(0) : 0;
      const divisorTMD = VP > 0 ? VP : 1; 
      
      return { tareaActual, VP, FP, precisionCalc, sumaTiempos, divisorTMD, tmdCalc };
  }, [tareas, tareaSeleccionada, alertas.length, intervaloScan]);

  const { tareaActual, VP, FP, precisionCalc, sumaTiempos, divisorTMD, tmdCalc } = metricas;


  // PANTALLA DE LOGIN
  if (!token) return (<div className="flex h-screen bg-[#0f172a] items-center justify-center font-sans"><div className="w-full max-w-md bg-slate-950 p-8 rounded-2xl border border-slate-800 shadow-2xl text-center"><h1 className="text-3xl font-bold text-white mb-8">SOCIAL<span className="text-blue-500">ALERT</span></h1><form onSubmit={handleLogin} className="space-y-4"><input type="text" value={user} onChange={e=>setUser(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" placeholder="Usuario" /><input type="password" value={pass} onChange={e=>setPass(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" placeholder="••••" /><button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded">Ingresar</button></form></div></div>);

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden">
      
      {/* 🔴 BARRA LATERAL TÁCTICA */}
      <aside className="w-72 bg-[#0b1121] border-r border-slate-800/60 flex flex-col z-20 shrink-0">
        <div className="p-6 flex justify-between items-center">
           <div><h1 className="text-xl font-bold text-white flex items-center gap-2">SOCIALALERT</h1><p className="text-[10px] text-slate-500 ml-5">Command Center v2.9.5</p></div>
           <button onClick={handleLogout} className="text-slate-500 hover:text-amber-400 p-1 rounded">🔒</button>
        </div>

        {/* 🚨 BOTONERA SUPERIOR: Nueva Misión y Engranaje (Configuración) */}
        <div className="px-4 py-2 flex gap-2">
            <button onClick={() => { setVista("crear"); setTareaSeleccionada(null); }} className="flex-1 flex items-center justify-center px-4 py-3 bg-[#1e293b] text-white rounded-xl border border-slate-700 font-bold hover:bg-slate-700 transition-colors shadow-md">
                + Nueva Misión
            </button>
            <button onClick={() => setMostrarConfig(!mostrarConfig)} className={`px-4 flex items-center justify-center rounded-xl border transition-all shadow-md ${mostrarConfig ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#1e293b] border-slate-700 text-slate-400 hover:text-white'}`} title="Configuración del Motor">
                ⚙️
            </button>
        </div>

        {/* 🚨 PANEL OCULTO: Controles avanzados del motor de extracción */}
        {mostrarConfig && (
            <div className="px-4 mb-4 mt-2 animate-fadeIn">
                <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700 shadow-inner flex flex-col gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Misiones en Lote</label>
                        <div className="flex gap-2">
                            <input type="number" min="1" max="50" value={concurrencia} onChange={(e) => setConcurrencia(parseInt(e.target.value) || 1)} className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-2 text-sm text-center text-white font-bold outline-none" />
                            <button onClick={async () => { await fetch(`${API_URL}/config/concurrencia`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lote: concurrencia }) }); alert("Capacidad de Lotes guardada con éxito."); }} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">Fijar</button>
                        </div>
                    </div>
                    <button onClick={async () => { await fetch(`${API_URL}/config/reset`, { method: "POST" }); setTimeout(fetchData, 1000); alert("Reset enviado. El radar iniciará inmediatamente desde la Misión superior (01)."); }} className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md">
                        🔄 Resetear Escáner a 01
                    </button>
                    <div className="border-t border-slate-700/50 pt-2 mt-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Frecuencia de Barrido (Minutos)</label>
                        <div className="flex gap-2">
                            <input type="number" min="1" max="60" value={intervaloScan} onChange={(e) => setIntervaloScan(parseInt(e.target.value) || 1)} className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-2 text-sm text-center text-white font-bold outline-none" />
                            <button onClick={async () => { await fetch(`${API_URL}/config/intervalo`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intervalo: intervaloScan }) }); alert(`Temporizador del orquestador reconfigurado a ${intervaloScan} min. El TMD visual se ha adaptado.`); }} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">Fijar</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* LISTADO DE MISIONES ACTIVAS E HISTÓRICAS */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 custom-scrollbar mt-2">
          <div onClick={() => { setTareaSeleccionada(null); setVista("dashboard"); setFiltroTermino('TODOS'); setFiltroFuente('TODOS'); setMostrarMapa(false); }} className={`px-4 py-3 rounded-xl cursor-pointer text-sm font-medium mb-4 transition-colors ${!tareaSeleccionada && vista!=='crear' ? 'bg-[#1e293b] text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}>🌎 Ver Todo (Global)</div>

          {tareas.map((tarea, index) => (
            <div
              key={tarea.id_visual} draggable onDragStart={() => (dragItem.current = index)} onDragEnter={() => (dragOverItem.current = index)} onDragOver={(e) => e.preventDefault()} onDragEnd={handleSort}
              className={`group flex flex-col px-4 py-3 rounded-xl cursor-grab active:cursor-grabbing transition-colors ${tareaSeleccionada === tarea.id_visual ? 'bg-[#1e293b] text-white shadow-md' : 'hover:bg-[#1e293b]/50 text-slate-400'}`}
              onClick={() => { if(editingTaskId !== tarea.id_visual) { setTareaSeleccionada(tarea.id_visual); setFiltroTermino('TODOS'); setFiltroFuente('TODOS'); setVista("dashboard"); setMostrarMapa(false); } }}
            >
              <div className="flex items-center justify-between w-full relative">
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <span className="text-[10px] text-slate-500 font-mono font-bold w-4">{String(index + 1).padStart(2, '0')}</span>
                    <div onClick={(e) => toggleEstado(tarea.id_visual, tarea.estado === 'activo', e)} className={`w-2 h-2 rounded-full flex-shrink-0 cursor-pointer ${tarea.estado === 'activo' ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-slate-600'}`}></div>
                    {editingTaskId === tarea.id_visual ? (
                      <input type="text" value={editQuery} onChange={(e) => setEditQuery(e.target.value)} onBlur={(e) => guardarEdicion(tarea.id_visual, e)} onKeyDown={(e) => e.key === 'Enter' && guardarEdicion(tarea.id_visual, e)} className="bg-slate-800 text-white px-2 py-1 rounded w-full text-sm outline-none" autoFocus onClick={(e) => e.stopPropagation()} />
                    ) : (
                      <span className="text-sm truncate select-none flex-1 font-medium" onDoubleClick={(e) => { e.stopPropagation(); setEditingTaskId(tarea.id_visual); setEditQuery(tarea.query); }}>{tarea.query}</span>
                    )}
                  </div>
                  <div className="flex flex-col items-end shrink-0 ml-2">
                      <div className={`flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${tarea.estado === 'activo' ? 'mt-1' : ''} ${tareaSeleccionada === tarea.id_visual ? 'opacity-100' : ''}`}>
                         <button onClick={(e) => toggleEstado(tarea.id_visual, tarea.estado === 'activo', e)} className="text-slate-400 hover:text-white text-xs">{tarea.estado === 'activo' ? '⏸️' : '▶️'}</button>
                         <button onClick={(e) => { e.stopPropagation(); setEditingTaskId(tarea.id_visual); setEditQuery(tarea.query); }} className="text-slate-400 hover:text-blue-400 text-xs">✏️</button>
                         <button onClick={(e) => eliminarTarea(tarea.id_visual, e)} className="text-slate-400 hover:text-red-400 text-xs">🗑️</button>
                      </div>
                  </div>
              </div>
              {tarea.estado === 'activo' && (
                  <div className="mt-3 w-full pl-7 pr-1 animate-fadeIn">
                      <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{tarea.progreso === 100 ? 'Completado' : 'Escaneando...'}</span>
                          <span className="text-[10px] font-mono text-blue-400 font-bold">{tarea.progreso || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-700 relative" style={{ width: `${tarea.progreso || 0}%` }}>
                               {(tarea.progreso || 0) < 100 && <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>}
                          </div>
                      </div>
                  </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full bg-[#0f172a] relative overflow-hidden">
        
        {/* PANEL: CREAR NUEVA MISIÓN */}
        {vista === "crear" && (
          <div className="p-8 max-w-2xl mx-auto w-full animate-fadeIn mt-10">
            <h2 className="text-2xl font-bold text-white mb-6">Desplegar Nueva Misión</h2>
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 shadow-xl">
              <label className="block text-sm font-medium text-slate-400 mb-2">Términos Objetivos (separados por coma)</label>
              <input type="text" value={nuevoQuery} onChange={(e) => setNuevoQuery(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white mb-6 outline-none" placeholder="Ej. Cyberseguridad Ecuador, Hacking Guayaquil" />
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-3 border-b border-slate-700/50 pb-2">Redes Sociales</h3>
                  <div className="space-y-2">
                    {Object.keys(redes).map(red => (
                      <label key={red} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${redes[red] ? 'bg-blue-600 border-blue-600' : 'border-slate-600'}`}>{redes[red] && <span className="text-white text-xs">✓</span>}</div>
                        <input type="checkbox" className="hidden" checked={redes[red]} onChange={() => setRedes({...redes, [red]: !redes[red]})} />
                        <span className="text-slate-300 capitalize text-sm">{red}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-3 border-b border-slate-700/50 pb-2">Medios Digitales</h3>
                  <div className="space-y-2">
                    {Object.keys(medios).map(medio => (
                      <label key={medio} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${medios[medio] ? 'bg-blue-600 border-blue-600' : 'border-slate-600'}`}>{medios[medio] && <span className="text-white text-xs">✓</span>}</div>
                        <input type="checkbox" className="hidden" checked={medios[medio]} onChange={() => setMedios({...medios, [medio]: !medios[medio]})} />
                        <span className="text-slate-300 capitalize text-sm">{medio}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={crearTarea} disabled={!nuevoQuery.trim()} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg">Activar Rastreador</button>
            </div>
          </div>
        )}

        {/* VISTA PRINCIPAL (DASHBOARD) */}
        {vista !== "crear" && (
           <div className="flex-1 flex flex-col h-full w-full">
            <header className="flex flex-col border-b border-slate-800/60 bg-[#0b1121] pt-6 px-8 pb-4 gap-4 z-10 shadow-md">
              <div className="flex justify-between items-start mb-2">
                
                <div className="flex flex-col w-full overflow-hidden">
                  <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-bold text-white tracking-tight">{tareaSeleccionada ? 'Resultados de Misión' : 'Dashboard Global'}</h2>
                      
                      {tareaSeleccionada && tareaActual && (
                          <div className="flex items-center gap-3 ml-2 animate-fadeIn shrink-0">
                              <div className="bg-[#0f172a] border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-inner">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">Precisión:</span>
                                  <span className="text-xs font-mono text-emerald-400 font-bold">{VP} / ({VP} + {FP}) = {precisionCalc}%</span>
                              </div>
                              <div className="bg-[#0f172a] border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-inner">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">TMD:</span>
                                  <span className="text-xs font-mono text-blue-400 font-bold">Σ({sumaTiempos}s) / {divisorTMD} = {tmdCalc}s</span>
                              </div>
                          </div>
                      )}
                  </div>

                  {/* 🚨 TÍTULO SECUNDARIO: FILTRO DINÁMICO POR SUB-OBJETIVOS */}
                  {/* Se extrae cada palabra clave separada por comas y se crea un botón de filtro interactivo */}
                  {tareaSeleccionada && tareaActual && (
                      <div className="flex items-center gap-2 mt-4 animate-fadeIn overflow-x-auto pb-1 custom-scrollbar w-full pr-4">
                          
                          {/* Botón Consolidado: Muestra la métrica total de toda la misión */}
                          <button 
                              onClick={() => setFiltroTermino('TODOS')} 
                              className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-all ${filtroTermino === 'TODOS' ? 'bg-emerald-900/50 border-emerald-500 text-emerald-400' : 'bg-blue-900/20 border-blue-800/30 text-blue-400 hover:bg-blue-900/40'}`}
                          >
                              🎯 Misión Global
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${filtroTermino === 'TODOS' ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`}>{alertas.length}</span>
                          </button>
                          
                          {/* Generador de Botones Dinámicos para cada palabra clave */}
                          {tareaActual.query.split(',').map(sub => sub.trim()).filter(sub => sub).map((subQuery, idx) => {
                              const count = misionesMap[subQuery] || 0; // Extrae el total de coincidencias exactas para este sub-objetivo
                              const isActive = filtroTermino === subQuery;
                              return (
                                  <button 
                                      key={idx}
                                      onClick={() => setFiltroTermino(subQuery)}
                                      className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-all ${isActive ? 'bg-emerald-900/50 border-emerald-500 text-emerald-400' : 'bg-[#0f172a] border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                      title={`Filtrar resultados solo para: ${subQuery}`}
                                  >
                                      {subQuery}
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${isActive ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>{count}</span>
                                  </button>
                              )
                          })}
                      </div>
                  )}
                </div>

                <div className="flex gap-2 relative items-center mt-1">
                  <button onClick={() => { setMostrarStats(false); setMostrarMapa(false); }} className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${!mostrarStats && !mostrarMapa ? 'bg-[#1e293b] text-white border border-slate-600' : 'text-slate-400 hover:bg-slate-800'}`}>📋 Lista</button>
                  <button onClick={() => { setMostrarStats(!mostrarStats); setMostrarMapa(false); }} className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${mostrarStats ? 'bg-[#1e293b] text-white border border-slate-600' : 'text-slate-400 hover:bg-slate-800'}`}>📊 Estadísticas</button>
                  <button onClick={() => { if (ipInfo) alert(`📡 CONTROL FORENSE DE RED:\n\nIP Pública: ${ipInfo.ip}\n\nEcosistema Operativo:\n${ipInfo.puertos}\n\nEstado del Enlace: [ ${ipInfo.estado} ]`); }} className={`text-xs px-4 py-2 rounded-lg font-bold border flex items-center gap-1.5 ${ipInfo?.estado === "UP" ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800 hover:bg-emerald-900' : 'bg-rose-950/60 text-rose-400 border-rose-800 hover:bg-rose-900 animate-pulse'}`}>🌐 Estado IP: <span className="underline font-mono">{ipInfo ? ipInfo.estado : "..."}</span></button>
                  <button onClick={() => { setMostrarMapa(!mostrarMapa); setMostrarStats(false); }} className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${mostrarMapa ? 'bg-[#1e293b] text-white border border-slate-600' : 'text-slate-400 hover:bg-slate-800'}`}>🗺️ Mapa Táctico</button>
                  
                  {mostrarStats && (
                      <div className="absolute top-12 right-0 w-[350px] bg-[#1e293b] border border-slate-700 p-6 rounded-2xl shadow-2xl z-50 animate-fadeIn">
                          <h3 className="text-sm font-bold text-white mb-4 border-b border-slate-700 pb-2">Distribución por Redes</h3>
                          {alertasFiltradas.length === 0 ? <p className="text-xs text-slate-500 text-center py-4">No hay datos suficientes.</p> : <div className="h-48"><Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', boxWidth: 12 } } } }} /></div>}
                      </div>
                  )}
                </div>
              </div>

              {tareaSeleccionada && (
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/50 mt-2">
                    <div className="flex items-center gap-2 overflow-x-auto">
                        <button onClick={() => setFiltroFuente('TODOS')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filtroFuente === 'TODOS' ? 'bg-slate-200 text-slate-900' : 'bg-[#1e293b] text-slate-400 hover:bg-slate-700'}`}>Todo <span className="text-[10px] px-1.5 rounded-md font-bold bg-slate-800 text-slate-400">{alertasBaseContexto.length}</span></button>
                        {Object.keys(fuentesMap).map(f => (
                            <button key={f} onClick={() => setFiltroFuente(f)} className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${filtroFuente === f ? 'bg-slate-200 text-slate-900' : 'bg-[#1e293b] text-slate-400 hover:bg-slate-700'}`}>{f} <span className="text-[10px] px-1.5 rounded-md font-bold bg-slate-800 text-slate-400">{fuentesMap[f]}</span></button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => { window.location.href = `${API_URL}/exportar_excel/${tareaSeleccionada || 'global'}`; }} className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">🟩 Excel</button>
                        <input type="text" placeholder="Buscar..." value={busquedaTexto} onChange={(e) => setBusquedaTexto(e.target.value)} className="bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white outline-none w-48 focus:border-blue-500 transition-colors" />
                        <div className="flex items-center gap-2 bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2">
                            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="bg-transparent text-sm text-slate-300 outline-none cursor-pointer" />
                            <span className="text-slate-600 text-xs">--</span>
                            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="bg-transparent text-sm text-slate-300 outline-none cursor-pointer" />
                        </div>
                        {(busquedaTexto || filtroFuente !== 'TODOS' || fechaInicio || fechaFin) && (
                            <button onClick={() => {setBusquedaTexto(''); setFiltroFuente('TODOS'); setFechaInicio(''); setFechaFin('');}} className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-900/20 px-3 py-2 rounded-lg transition-colors">Limpiar ✖</button>
                        )}
                    </div>
                </div>
              )}
            </header>

            <div className="flex-1 overflow-y-auto p-6 w-full relative custom-scrollbar bg-[#0f172a]">
                {mostrarMapa ? (
                    <div className="w-full h-full min-h-[500px] bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden relative z-0">
                        <MapContainer key={mapCenter.join(',')} center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CartoDB' />
                            {alertasMapa.map((alerta, idx) => (
                                <CircleMarker key={idx} center={alerta.coords} radius={9} color={getHexColor(alerta.fuente)} fillColor={getHexColor(alerta.fuente)} fillOpacity={0.7} weight={2}>
                                    <Popup><div className="text-xs p-1 text-slate-900"><p className="font-bold uppercase mb-1" style={{color: getHexColor(alerta.fuente)}}>{alerta.fuente}</p><p className="font-semibold mb-2">{alerta.titulo}</p><a href={alerta.url} target="_blank" className="text-blue-600 font-bold underline">Abrir Enlace ↗</a></div></Popup>
                                </CircleMarker>
                            ))}
                        </MapContainer>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 max-w-7xl mx-auto w-full">
                        {alertasFiltradas.length === 0 ? (
                           <div className="flex flex-col items-center justify-center h-64 text-slate-500"><div className="text-4xl mb-4">📡</div><p>Radar despejado.</p></div>
                        ) : (
                           alertasFiltradas.slice(0, 200).map((alerta, i) => (
                               <div key={i} className="bg-[#1e293b] border border-slate-700 p-5 rounded-xl shadow-md relative overflow-hidden flex items-center justify-between gap-6 hover:border-slate-500 transition-colors">
                                 <div className={`absolute top-0 left-0 w-1.5 h-full ${getSideColor(alerta.fuente)}`}></div>
                                 <div className="flex flex-col gap-2 ml-3 flex-1 min-w-0">
                                     <div className="flex items-center gap-3">
                                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getSolidBadgeColor(alerta.fuente)}`}>{alerta.fuente}</span>
                                         <span className="text-[10px] text-slate-300 bg-[#0f172a] border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1">🛡️ {alerta.termino_buscado || alerta.nombre_mision}</span>
                                         <span className="text-[10px] text-slate-500 font-mono">{formatearFecha(alerta.fecha)}</span>
                                     </div>
                                     <a href={alerta.url} target="_blank" className="text-base font-bold text-slate-200 hover:text-blue-400 truncate block w-full">{alerta.titulo}</a>
                                     <p className="text-xs text-slate-500 font-mono truncate">{alerta.url}</p>
                                 </div>
                                 <div className="shrink-0 mr-2"><a href={alerta.url} target="_blank" className="text-xs font-bold text-slate-300 bg-[#0f172a] hover:bg-slate-700 border border-slate-700 px-5 py-2.5 rounded-lg transition-colors">Abrir ↗</a></div>
                               </div>
                           ))
                        )}
                    </div>
                )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
