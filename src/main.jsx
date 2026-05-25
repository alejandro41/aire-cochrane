import React from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  CloudRain,
  HeartPulse,
  Home,
  Info,
  LineChart as LineChartIcon,
  MapPin,
  RefreshCcw,
  ShieldAlert,
  Thermometer,
  Trees,
  Wind,
  Baby,
  UserRound,
  Activity,
  CalendarDays,
  Scale,
  CheckCircle2,
  CloudSun,
  Sunrise,
  Sunset,
  HousePlus,
  Dumbbell,
  Flame,
  AlertTriangle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import "./styles.css";
import heroImage from "./assets/cochrane-fondo.png";

const currentMp25 = 72;

const hourlyData = [
  { hora: "12:00", mp25: 34, temp: 9, hum: 66 },
  { hora: "14:00", mp25: 30, temp: 10, hum: 63 },
  { hora: "16:00", mp25: 46, temp: 9, hum: 61 },
  { hora: "18:00", mp25: 38, temp: 8, hum: 60 },
  { hora: "20:00", mp25: 52, temp: 6, hum: 62 },
  { hora: "22:00", mp25: 45, temp: 4, hum: 67 },
  { hora: "00:00", mp25: 31, temp: 3, hum: 69 },
  { hora: "04:00", mp25: 42, temp: 2, hum: 65 },
  { hora: "08:00", mp25: 33, temp: 4, hum: 70 },
  { hora: "12:00 ", mp25: 40, temp: 8, hum: 72 }
];

const weeklyData = [
  { dia: "Lun", promedio: 31, peak: 55 },
  { dia: "Mar", promedio: 46, peak: 79 },
  { dia: "Mié", promedio: 28, peak: 61 },
  { dia: "Jue", promedio: 52, peak: 97 },
  { dia: "Vie", promedio: 38, peak: 70 },
  { dia: "Sáb", promedio: 61, peak: 108 },
  { dia: "Dom", promedio: 42, peak: 81 }
];

function getAirQuality(value) {
  if (value <= 25) {
    return {
      label: "BUENO",
      className: "good",
      icon: "😊",
      message: "El aire está en buenas condiciones para la mayoría de las personas.",
      action: "Puedes realizar actividades al aire libre con normalidad."
    };
  }
  if (value <= 50) {
    return {
      label: "REGULAR",
      className: "regular",
      icon: "🙂",
      message: "El aire es aceptable, pero personas sensibles deben estar atentas.",
      action: "Si tienes molestias respiratorias, reduce el esfuerzo físico."
    };
  }
  if (value <= 80) {
    return {
      label: "ALERTA",
      className: "alert",
      icon: "⚠️",
      message: "El aire puede afectar a niños, adultos mayores y personas con enfermedades respiratorias.",
      action: "Evita ejercicio intenso al aire libre y prefiere actividades bajo techo."
    };
  }
  if (value <= 110) {
    return {
      label: "PREEMERGENCIA",
      className: "pre",
      icon: "🚨",
      message: "La calidad del aire es mala y puede afectar la salud.",
      action: "Reduce las salidas y evita actividad física al aire libre."
    };
  }
  return {
    label: "EMERGENCIA",
    className: "emergency",
    icon: "🛑",
    message: "La calidad del aire es muy mala.",
    action: "Evita salir si no es necesario y sigue indicaciones oficiales."
  };
}

const quality = getAirQuality(currentMp25);

const levels = [
  { label: "BUENO", range: "0 - 25 µg/m³", className: "good", active: currentMp25 <= 25 },
  { label: "REGULAR", range: "25 - 50 µg/m³", className: "regular", active: currentMp25 > 25 && currentMp25 <= 50 },
  { label: "ALERTA", range: "50 - 80 µg/m³", className: "alert", active: currentMp25 > 50 && currentMp25 <= 80 },
  { label: "PREEMERGENCIA", range: "80 - 110 µg/m³", className: "pre", active: currentMp25 > 80 && currentMp25 <= 110 },
  { label: "EMERGENCIA", range: "> 110 µg/m³", className: "emergency", active: currentMp25 > 110 }
];

function App() {
  return (
    <div className="app" style={{ backgroundImage: `url(${heroImage})` }}>
      <div className="overlay" />

      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">
            <Trees size={32} />
          </div>
          <div className="brandText">
            <div className="brandTitle">COCHRANE</div>
            <div className="brandSub">POR UN AIRE LIMPIO</div>
          </div>
        </div>

        <nav className="menu">
          <button className="active"><Home size={20} /> Resumen</button>
          <button><Activity size={20} /> Aire en tiempo real</button>
          <button><CloudSun size={20} /> Clima</button>
          <button><LineChartIcon size={20} /> Gráficos</button>
          <button><CalendarDays size={20} /> Historial</button>
          <button><Scale size={20} /> Comparaciones</button>
          <button><Bell size={20} /> Alertas</button>
          <button><ShieldAlert size={20} /> Recomendaciones</button>
          <button><Info size={20} /> Acerca del proyecto</button>
        </nav>

        <div className="sideBox">
          <h3>¿Quieres recibir alertas?</h3>
          <p>Recibe notificaciones cuando el aire empeore en Cochrane.</p>
          <button>Activar notificaciones</button>
        </div>

        <div className="sideFooter">Desarrollado para la comunidad de Cochrane</div>
      </aside>

      <main className="content">
        <header className="hero">
          <div>
            <h1>Hola, Cochrane 🌿</h1>
            <p className="heroSub">Monitoreo ambiental en tiempo real para nuestra comuna</p>
            <div className="heroTags">
              <span><MapPin size={16} /> Cochrane, Región de Aysén</span>
              <span><CalendarDays size={16} /> 12:45 hrs · 24 Mayo 2024</span>
            </div>
          </div>

          <div className="heroActions">
            <button className="refreshBtn"><RefreshCcw size={16} /> Actualizar</button>
            <div className="weatherMini">
              <CloudSun size={28} />
              <div>
                <strong>12.5 °C</strong>
                <span>Parcialmente nublado</span>
              </div>
              <small><Sunrise size={14} /> 08:57 &nbsp;&nbsp; <Sunset size={14} /> 17:41</small>
            </div>
          </div>
        </header>

        <section className="topGrid">
          <section className="card">
            <div className="cardTitle">Calidad del aire actual</div>
            <div className="cardSub">Estación SINCA Cochrane B06</div>

            <div className="airMain">
              <div className={`donut ${quality.className}`}>
                <span>{currentMp25}</span>
                <b>µg/m³</b>
                <small>MP2,5</small>
              </div>

              <div className="airText">
                <div className={`airStatus ${quality.className}`}>{quality.label} {quality.icon}</div>
                <p className="airMessage">{quality.message}</p>
                <p className="airAction">{quality.action}</p>
                <div className="updateText">Última actualización: hoy 21:10 hrs</div>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="cardTitle">Condiciones meteorológicas</div>
            <div className="cardSub">Condiciones que pueden influir en el aire</div>
            <div className="weatherGrid">
              <div className="miniCard"><Thermometer size={28} /><strong>12.5°C</strong><span>Temperatura</span></div>
              <div className="miniCard"><Info size={28} /><strong>78%</strong><span>Humedad</span></div>
              <div className="miniCard"><Wind size={28} /><strong>9.7 km/h</strong><span>Viento</span></div>
              <div className="miniCard"><CloudRain size={28} /><strong>0 mm</strong><span>Lluvia hoy</span></div>
            </div>
          </section>

          <section className="card">
            <div className="cardTitle">Índice de calidad del aire (MP2,5)</div>
            <div className="levelsList">
              {levels.map(level => (
                <div key={level.label} className={`levelRow ${level.className} ${level.active ? "active" : ""}`}>
                  <strong>{level.label}</strong>
                  <span>{level.range}</span>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section className="middleGrid">
          <section className="card chartCard">
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
              <span><strong>Lectura simple:</strong> el aire empeoró entre la tarde y la noche. Esto suele ocurrir cuando baja la temperatura y hay menos ventilación.</span>
            </div>
          </section>

          <section className="card">
            <div className="cardTitle">Resumen semanal</div>
            <div className="cardSub">Promedio semanal: 28 µg/m³</div>
            <div className="summaryBoxes">
              <div><span>Mejor día</span><strong>Viernes</strong><small>18 µg/m³</small></div>
              <div><span>Peor día</span><strong>Martes</strong><small>62 µg/m³</small></div>
              <div><span>Peak semanal</span><strong>Martes 21:00</strong><small>87 µg/m³</small></div>
            </div>
          </section>
        </section>

        <section className="bottomGrid">
          <section className="card compareCard">
            <div className="cardTitle">Comparación de fuentes (MP2,5)</div>
            <div className="cardSub">Datos en tiempo real</div>
            <div className="compareGrid">
              <div><strong>SINCA MMA</strong><b>38</b><span>Bueno</span></div>
              <div><strong>MeteoChile</strong><b>35</b><span>Bueno</span></div>
              <div><strong>AQICN</strong><b>42</b><span>Bueno</span></div>
            </div>
          </section>

          <section className="card recommendationsCard">
            <div className="recommendHeader">
              <ShieldAlert size={26} />
              <div>
                <div className="cardTitle">¿Qué debo hacer hoy?</div>
                <div className="cardSub">Recomendaciones para cuidar tu salud</div>
              </div>
            </div>

            <div className="recommendList">
              <article>
                <UserRound size={20} />
                <div>
                  <strong>Adultos mayores</strong>
                  <span>Evitar esfuerzo físico al aire libre durante la tarde y noche.</span>
                </div>
              </article>
              <article>
                <Baby size={20} />
                <div>
                  <strong>Niños y niñas</strong>
                  <span>Preferir juegos y actividades dentro de casa si el aire sigue en alerta.</span>
                </div>
              </article>
              <article>
                <HeartPulse size={20} />
                <div>
                  <strong>Personas con asma o EPOC</strong>
                  <span>Tener sus medicamentos a mano y consultar si presentan síntomas.</span>
                </div>
              </article>
              <article>
                <HousePlus size={20} />
                <div>
                  <strong>Ventila tu hogar</strong>
                  <span>Abre ventanas en horarios donde el aire esté mejor, si las condiciones lo permiten.</span>
                </div>
              </article>
              <article>
                <Dumbbell size={20} />
                <div>
                  <strong>Actividad física</strong>
                  <span>Evita ejercicio intenso al aire libre cuando el aire esté en alerta.</span>
                </div>
              </article>
              <article>
                <Flame size={20} />
                <div>
                  <strong>Calefacción</strong>
                  <span>Usa leña seca y evita encender estufas antes de tiempo si no es necesario.</span>
                </div>
              </article>
            </div>
          </section>

          <section className="card alertCard">
            <div className="cardTitle alertTitle">Alertas activas</div>
            <div className="alertCenter">
              <CheckCircle2 size={38} />
              <strong>No hay alertas activas</strong>
              <span>Te notificaremos si las condiciones del aire empeoran.</span>
            </div>
          </section>
        </section>
        <footer className="appFooter">
  <span>Copyright © 2026 Alejandro Gatica. Todos los derechos reservados.</span>
</footer>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);