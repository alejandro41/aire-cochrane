import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
    Bell, CloudRain, HeartPulse, Home, Info, LineChart as LineChartIcon,
  MapPin, RefreshCcw, ShieldAlert, Thermometer, Trees, Wind, Baby,
  UserRound, Activity, CalendarDays, Scale, CheckCircle2, CloudSun,
  Sunrise, Sunset, HousePlus, Dumbbell, Flame, AlertTriangle
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import "./styles.css";
import heroImage from "./assets/cochrane-fondo.png";
function formatChileTime(dateInput = new Date()) {
  const date = dateInput ? new Date(dateInput) : new Date();

  const time = new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);

  return `${time.replace(":", ".")} horas`;
}
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);

  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

const demoData = {
  ok: true,
  generatedAt: new Date().toISOString(),
  air: {
    source: "Demo local",
    station: "Cochrane B06",
    pollutant: "MP2,5",
    unit: "µg/m³",
    value: 72,
    status: "ALERTA",
    updatedAt: "Dato demo",
    hourly: [
      { hora: "12:00", mp25: 34 },
      { hora: "14:00", mp25: 30 },
      { hora: "16:00", mp25: 46 },
      { hora: "18:00", mp25: 38 },
      { hora: "20:00", mp25: 52 },
      { hora: "22:00", mp25: 72 },
      { hora: "00:00", mp25: 31 },
      { hora: "04:00", mp25: 42 },
      { hora: "08:00", mp25: 33 },
      { hora: "12:00 ", mp25: 40 }
    ]
  },
  weather: {
    source: "Demo local",
    station: "Referencia",
    temperature: 12.5,
    humidity: 78,
    wind: 9.7,
    rain: 0,
    updatedAt: "Dato demo"
  },
  warnings: []
};

function getAirQuality(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return { label: "SIN DATOS", className: "regular", icon: "ℹ️", message: "Aún no se pudo obtener el último dato de calidad del aire.", action: "Revisa nuevamente en unos minutos." };
  }
  if (value <= 25) return { label: "BUENO", className: "good", icon: "😊", message: "El aire está en buenas condiciones para la mayoría de las personas.", action: "Puedes realizar actividades al aire libre con normalidad." };
  if (value <= 50) return { label: "REGULAR", className: "regular", icon: "🙂", message: "El aire es aceptable, pero personas sensibles deben estar atentas.", action: "Si tienes molestias respiratorias, reduce el esfuerzo físico." };
  if (value <= 80) return { label: "ALERTA", className: "alert", icon: "⚠️", message: "El aire puede afectar a niños, adultos mayores y personas con enfermedades respiratorias.", action: "Evita ejercicio intenso al aire libre y prefiere actividades bajo techo." };
  if (value <= 110) return { label: "PREEMERGENCIA", className: "pre", icon: "🚨", message: "La calidad del aire es mala y puede afectar la salud.", action: "Reduce las salidas y evita actividad física al aire libre." };
  return { label: "EMERGENCIA", className: "emergency", icon: "🛑", message: "La calidad del aire es muy mala.", action: "Evita salir si no es necesario y sigue indicaciones oficiales." };
}

const levels = [
  { label: "BUENO", range: "0 - 25 µg/m³", className: "good", match: (v) => v <= 25 },
  { label: "REGULAR", range: "25 - 50 µg/m³", className: "regular", match: (v) => v > 25 && v <= 50 },
  { label: "ALERTA", range: "50 - 80 µg/m³", className: "alert", match: (v) => v > 50 && v <= 80 },
  { label: "PREEMERGENCIA", range: "80 - 110 µg/m³", className: "pre", match: (v) => v > 80 && v <= 110 },
  { label: "EMERGENCIA", range: "> 110 µg/m³", className: "emergency", match: (v) => v > 110 }
];

function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "S/D";
  return Number(value).toLocaleString("es-CL", { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

function safeValue(value, fallback) {
  return value === null || value === undefined || Number.isNaN(Number(value)) ? fallback : value;
}

function App() {
  const [data, setData] = useState(demoData);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const air = data.air || demoData.air;
  const weather = data.weather || demoData.weather;
  const currentMp25 = air.value;
  const quality = getAirQuality(currentMp25);

  const hourlyData = useMemo(() => {
    const base = air.hourly?.length ? air.hourly : demoData.air.hourly;
    return base.map((item, index) => ({
      hora: item.hora || `${index}:00`,
      mp25: Number(item.mp25 ?? item.value ?? 0),
      temp: Number(safeValue(weather.temperature, 0)),
      hum: Number(safeValue(weather.humidity, 0))
    }));
  }, [air.hourly, weather.temperature, weather.humidity]);

  async function loadData() {
    setLoading(true);
    try {
      const response = await fetch("/api/current", { cache: "no-store" });
      if (!response.ok) throw new Error("No se pudo consultar /api/current");
      const json = await response.json();
      setData(json);
      setLastRefresh(new Date());
    } catch (error) {
      console.warn("Usando datos demo porque la API no respondió:", error);
      setData({ ...demoData, warnings: ["API no disponible en modo local o fuente sin respuesta."] });
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 10 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="app" style={{ backgroundImage: `url(${heroImage})` }}>
      <div className="overlay" />

      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark"><Trees size={32} /></div>
          <div className="brandText">
            <div className="brandTitle">COCHRANE</div>
            <div className="brandSub">POR UN AIRE LIMPIO</div>
          </div>
        </div>

        <nav className="menu">
  <button className="active" onClick={() => scrollToSection("resumen")}><Home size={20} /> Resumen</button>
  <button onClick={() => scrollToSection("aire")}><Activity size={20} /> Aire en tiempo real</button>
  <button onClick={() => scrollToSection("clima")}><CloudSun size={20} /> Clima</button>
  <button onClick={() => scrollToSection("graficos")}><LineChartIcon size={20} /> Gráficos</button>
  <button onClick={() => scrollToSection("historial")}><CalendarDays size={20} /> Historial</button>
  <button onClick={() => scrollToSection("comparaciones")}><Scale size={20} /> Comparaciones</button>
  <button onClick={() => scrollToSection("alertas")}><Bell size={20} /> Alertas</button>
  <button onClick={() => scrollToSection("recomendaciones")}><ShieldAlert size={20} /> Recomendaciones</button>
  <button onClick={() => scrollToSection("acerca")}><Info size={20} /> Acerca del proyecto</button>
</nav>

        <div className="sideBox">
          <h3>¿Quieres recibir alertas?</h3>
          <p>Recibe notificaciones cuando el aire empeore en Cochrane.</p>
          <button>Activar notificaciones</button>
        </div>

        <div className="sideFooter">Desarrollado para la comunidad de Cochrane</div>
      </aside>

      <main className="content">
        <header id="resumen" className="hero">
          <div>
            <h1>Hola, Cochrane 🌿</h1>
            <p className="heroSub">Monitoreo ambiental en tiempo real para nuestra comuna</p>
            <div className="heroTags">
              <span><MapPin size={16} /> Cochrane, Región de Aysén</span>
              <span><CalendarDays size={16} /> {lastRefresh ? `Actualizado ${formatChileTime(lastRefresh)}` : "Cargando datos..."}</span>
            </div>
          </div>

          <div className="heroActions">
            <button className="refreshBtn" onClick={loadData} disabled={loading}>
              <RefreshCcw size={16} /> {loading ? "Actualizando..." : "Actualizar"}
            </button>

            <div className="weatherMini">
              <CloudSun size={28} />
              <div>
                <strong>{formatNumber(weather.temperature, 1)} °C</strong>
                <span>{weather.source}</span>
              </div>
              <small><Sunrise size={14} /> 08:57 &nbsp;&nbsp; <Sunset size={14} /> 17:41</small>
            </div>
          </div>
        </header>

        {data.warnings?.length > 0 && (
          <div className="sourceWarning">
            <Info size={18} />
            <span>{data.warnings.join(" · ")}</span>
          </div>
        )}

        <section className="topGrid">
          <section id="aire" className="card">
            <div className="cardTitle">Calidad del aire actual</div>
            <div className="cardSub">Fuente: {air.source} · Estación {air.station}</div>

            <div className="airMain">
              <div className={`donut ${quality.className}`}>
                <span>{formatNumber(currentMp25, 0)}</span>
                <b>{air.unit || "µg/m³"}</b>
                <small>{air.pollutant || "MP2,5"}</small>
              </div>

              <div className="airText">
                <div className={`airStatus ${quality.className}`}>{quality.label} {quality.icon}</div>
                <p className="airMessage">{quality.message}</p>
                <p className="airAction">{quality.action}</p>
                <div className="updateText">Última actualización fuente: {air.updatedAt || "sin dato"}</div>
              </div>
            </div>
          </section>

          <section id="clima" className="card">
            <div className="cardTitle">Condiciones meteorológicas</div>
            <div className="cardSub">Fuente: {weather.source} · {weather.station}</div>

            <div className="weatherGrid">
              <div className="miniCard"><Thermometer size={28} /><strong>{formatNumber(weather.temperature, 1)}°C</strong><span>Temperatura</span></div>
              <div className="miniCard"><Info size={28} /><strong>{formatNumber(weather.humidity, 0)}%</strong><span>Humedad</span></div>
              <div className="miniCard"><Wind size={28} /><strong>{formatNumber(weather.wind, 1)} km/h</strong><span>Viento</span></div>
              <div className="miniCard"><CloudRain size={28} /><strong>{formatNumber(weather.rain, 1)} mm</strong><span>Lluvia</span></div>
            </div>
          </section>

          <section className="card">
            <div className="cardTitle">Índice de calidad del aire (MP2,5)</div>
            <div className="levelsList">
              {levels.map(level => (
                <div key={level.label} className={`levelRow ${level.className} ${level.match(currentMp25) ? "active" : ""}`}>
                  <strong>{level.label}</strong>
                  <span>{level.range}</span>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section className="middleGrid">
          <section id="graficos" className="card chartCard">
            <div className="cardTitle">¿Cómo estuvo el aire hoy?</div>
            <div className="cardSub">Este gráfico muestra en qué horas el aire estuvo mejor o peor durante las últimas 24 horas.</div>

            <div className="chartLegend">
              <span><i className="green"></i> MP2,5</span>
              <span><i className="orange"></i> Temperatura</span>
              <span><i className="blue"></i> Humedad</span>
            </div>

            <div className="chartWrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="mp25" name="MP2,5" stroke="#22c55e" fill="#dcfce7" strokeWidth={3} />
                  <Line type="monotone" dataKey="temp" name="Temperatura" stroke="#f97316" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="hum" name="Humedad" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="quickRead">
              <AlertTriangle size={20} />
              <span><strong>Lectura simple:</strong> el aire puede empeorar entre la tarde y la noche, especialmente cuando baja la temperatura y hay menos ventilación.</span>
            </div>
          </section>

          <section id="historial" className="card">
            <div className="cardTitle">Resumen semanal</div>
            <div className="cardSub">Etapa siguiente: historial automático guardado cada 15 minutos.</div>

            <div className="summaryBoxes">
              <div><span>Dato actual</span><strong>{quality.label}</strong><small>{formatNumber(currentMp25, 0)} µg/m³</small></div>
              <div><span>Fuente aire</span><strong>{air.source}</strong><small>{air.station}</small></div>
              <div><span>Fuente clima</span><strong>{weather.source}</strong><small>{weather.station}</small></div>
            </div>
          </section>
        </section>

        <section className="bottomGrid">
          <section id="comparaciones" className="card compareCard">
            <div className="cardTitle">Comparación de fuentes</div>
            <div className="cardSub">Primera versión conectada a fuentes externas.</div>

            <div className="compareGrid">
              <div><strong>{air.source}</strong><b>{formatNumber(currentMp25, 0)}</b><span>{quality.label}</span></div>
              <div><strong>{weather.source}</strong><b>{formatNumber(weather.temperature, 1)}</b><span>°C</span></div>
              <div><strong>Actualización</strong><b>{lastRefresh ? lastRefresh.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) : "--:--"}</b><span>hora local</span></div>
            </div>
          </section>

          <section id="recomendaciones" className="card recommendationsCard">
            <div className="recommendHeader">
              <ShieldAlert size={26} />
              <div>
                <div className="cardTitle">¿Qué debo hacer hoy?</div>
                <div className="cardSub">Recomendaciones para cuidar tu salud</div>
              </div>
            </div>

            <div className="recommendList">
              <article><UserRound size={20} /><div><strong>Adultos mayores</strong><span>Evitar esfuerzo físico al aire libre durante la tarde y noche si el aire está en alerta.</span></div></article>
              <article><Baby size={20} /><div><strong>Niños y niñas</strong><span>Preferir juegos y actividades dentro de casa si el aire sigue en alerta.</span></div></article>
              <article><HeartPulse size={20} /><div><strong>Personas con asma o EPOC</strong><span>Tener sus medicamentos a mano y consultar si presentan síntomas.</span></div></article>
              <article><HousePlus size={20} /><div><strong>Ventila tu hogar</strong><span>Abre ventanas en horarios donde el aire esté mejor, si las condiciones lo permiten.</span></div></article>
              <article><Dumbbell size={20} /><div><strong>Actividad física</strong><span>Evita ejercicio intenso al aire libre cuando el aire esté en alerta.</span></div></article>
              <article><Flame size={20} /><div><strong>Calefacción</strong><span>Usa leña seca y evita encender estufas antes de tiempo si no es necesario.</span></div></article>
            </div>
          </section>

          <section id="alertas" className="card alertCard">
            <div className="cardTitle alertTitle">Alertas activas</div>
            <div className="alertCenter">
              <CheckCircle2 size={38} />
              <strong>{quality.label === "BUENO" || quality.label === "REGULAR" ? "Sin alertas críticas" : `Estado actual: ${quality.label}`}</strong>
              <span>Te notificaremos si las condiciones del aire empeoran.</span>
            </div>
          </section>
        </section>

        <footer id="acerca" className="appFooter">
          <span>Copyright © 2026 Alejandro Gatica. Todos los derechos reservados.</span>
        </footer>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
