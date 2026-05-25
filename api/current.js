const SINCA_STATION_PAGE = "https://sinca.mma.gob.cl/index.php/estacion/index/id/296";
const SINCA_HISTORY_BASE = "https://sinca.mma.gob.cl/cgi-bin/APUB-MMA/apub.htmlindico2.cgi";
const METEOCHILE_EMA_PAGE = "https://climatologia.meteochile.gob.cl/application/diariob/visorDeDatosEma/480002";
const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast?latitude=-47.2531&longitude=-72.5734&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m&timezone=America%2FSantiago";

function todayChile() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Santiago" }));
}

function yymmdd(date) {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

function cleanNumber(value) {
  if (value === null || value === undefined) return null;
  const n = Number(String(value).replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function classifyMp25(value) {
  if (value === null || value === undefined) return "SIN DATOS";
  if (value <= 25) return "BUENO";
  if (value <= 50) return "REGULAR";
  if (value <= 80) return "ALERTA";
  if (value <= 110) return "PREEMERGENCIA";
  return "EMERGENCIA";
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseSincaValues(html) {
  const rows = [];

  // 1) Intenta leer filas de tablas HTML.
  const tableRowRegex = /<tr[\s\S]*?<\/tr>/gi;
  const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;

  const trMatches = html.match(tableRowRegex) || [];

  for (const rowHtml of trMatches) {
    const cells = [];
    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      const cleanCell = cellMatch[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (cleanCell) cells.push(cleanCell);
    }

    if (cells.length >= 2) {
      const joined = cells.join(" ");
      const nums = cells
        .map(cleanNumber)
        .filter((n) => n !== null && n >= 0 && n < 1000);

      if (nums.length) {
        const value = nums[nums.length - 1];
        const dateText =
          cells.find((c) => /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}:\d{2}/.test(c)) ||
          joined.slice(0, 40);

        rows.push({
          hora: dateText,
          mp25: Math.round(value * 10) / 10
        });
      }
    }
  }

  // 2) Si la tabla no se pudo leer, intenta leer texto plano.
  if (!rows.length) {
    const text = htmlToText(html);

    const patterns = [
      /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s+(\d{1,2}:\d{2})\s+(-?\d+(?:[.,]\d+)?)/g,
      /(\d{4}[-/]\d{1,2}[-/]\d{1,2})\s+(\d{1,2}:\d{2})\s+(-?\d+(?:[.,]\d+)?)/g,
      /(\d{1,2}:\d{2})\s+(-?\d+(?:[.,]\d+)?)/g
    ];

    for (const pattern of patterns) {
      let match;

      while ((match = pattern.exec(text)) !== null) {
        const maybeValue = match[3] || match[2];
        const value = cleanNumber(maybeValue);

        if (value !== null && value >= 0 && value < 1000) {
          rows.push({
            hora: match[1],
            mp25: Math.round(value * 10) / 10
          });
        }
      }

      if (rows.length) break;
    }
  }

  // 3) Último respaldo: busca números cercanos a textos MP2,5 / PM25.
  if (!rows.length) {
    const text = htmlToText(html);
    const nearPm25 = text.match(/(?:MP\s*2[,.]5|PM25|PM\s*2[,.]5)[\s\S]{0,120}?(-?\d+(?:[.,]\d+)?)/i);

    if (nearPm25) {
      const value = cleanNumber(nearPm25[1]);

      if (value !== null && value >= 0 && value < 1000) {
        rows.push({
          hora: "Último dato SINCA",
          mp25: Math.round(value * 10) / 10
        });
      }
    }
  }

  // 4) Filtra valores poco probables.
  return rows
    .filter((item) => item.mp25 !== null && item.mp25 >= 0 && item.mp25 < 500)
    .slice(-24);
}

async function getAirFromSinca() {
  const to = todayChile();
  const from = new Date(to);
  from.setDate(from.getDate() - 2);

  const params = new URLSearchParams({
    from: yymmdd(from),
    header: "Cochrane",
    macro: "PM25.horario.horario",
    macropath: "./RXI/B06/Cal/PM25",
    page: "pageFrame",
    to: yymmdd(to)
  });

  const url = `${SINCA_HISTORY_BASE}?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Monitor Ambiental Cochrane/1.0",
      "Accept": "text/html,application/xhtml+xml"
    }
  });

  if (!response.ok) throw new Error(`SINCA respondió ${response.status}`);

  const html = await response.text();
  const hourly = parseSincaValues(html);
  const latest = hourly.length ? hourly[hourly.length - 1] : null;

  if (!latest) throw new Error("No se pudo leer MP2,5 desde SINCA");

  return {
    source: "SINCA MMA",
    station: "Cochrane B06",
    stationPage: SINCA_STATION_PAGE,
    pollutant: "MP2,5",
    unit: "µg/m³",
    value: latest.mp25,
    status: classifyMp25(latest.mp25),
    updatedAt: latest.hora,
    hourly: hourly.slice(-24)
  };
}

function parseMeteoChile(html) {
  const text = htmlToText(html);

  const pick = (patterns) => {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return cleanNumber(match[1]);
    }
    return null;
  };

  return {
    temperature: pick([/Temperatura\s*(-?\d+(?:[.,]\d+)?)/i, /(-?\d+(?:[.,]\d+)?)\s*°\s*C/i]),
    humidity: pick([/Humedad\s*(\d+(?:[.,]\d+)?)/i, /(\d+(?:[.,]\d+)?)\s*%\s*HR/i]),
    wind: pick([/Viento\s*(\d+(?:[.,]\d+)?)/i, /(\d+(?:[.,]\d+)?)\s*km\/h/i]),
    rain: pick([/Lluvia\s*(\d+(?:[.,]\d+)?)/i, /Precipitaci[oó]n\s*(\d+(?:[.,]\d+)?)/i])
  };
}

async function getWeatherFromMeteoChile() {
  const response = await fetch(METEOCHILE_EMA_PAGE, {
    headers: {
      "User-Agent": "Monitor Ambiental Cochrane/1.0",
      "Accept": "text/html,application/xhtml+xml"
    }
  });

  if (!response.ok) throw new Error(`MeteoChile respondió ${response.status}`);

  const parsed = parseMeteoChile(await response.text());

  if (parsed.temperature === null && parsed.humidity === null && parsed.wind === null && parsed.rain === null) {
    throw new Error("No se pudieron leer datos desde MeteoChile");
  }

  return {
    source: "MeteoChile / DMC",
    station: "EMA 480002, referencia regional",
    temperature: parsed.temperature,
    humidity: parsed.humidity,
    wind: parsed.wind,
    rain: parsed.rain,
    updatedAt: new Date().toISOString()
  };
}

async function getWeatherFromOpenMeteo() {
  const response = await fetch(OPEN_METEO_URL);
  if (!response.ok) throw new Error(`Open-Meteo respondió ${response.status}`);

  const data = await response.json();
  const current = data.current || {};

  return {
    source: "Open-Meteo, respaldo automático",
    station: "Coordenadas Cochrane",
    temperature: current.temperature_2m ?? null,
    humidity: current.relative_humidity_2m ?? null,
    wind: current.wind_speed_10m ?? null,
    windDirection: current.wind_direction_10m ?? null,
    rain: current.precipitation ?? null,
    updatedAt: current.time || new Date().toISOString()
  };
}

function demoAir(reason) {
  const value = 72;
  return {
    source: `Demo local (${reason})`,
    station: "Cochrane B06",
    pollutant: "MP2,5",
    unit: "µg/m³",
    value,
    status: classifyMp25(value),
    updatedAt: "Dato demo",
    hourly: [
      { hora: "12:00", mp25: 34 },
      { hora: "14:00", mp25: 30 },
      { hora: "16:00", mp25: 46 },
      { hora: "18:00", mp25: 38 },
      { hora: "20:00", mp25: 52 },
      { hora: "22:00", mp25: 72 }
    ]
  };
}

function demoWeather(reason) {
  return {
    source: `Demo local (${reason})`,
    station: "Referencia",
    temperature: 12.5,
    humidity: 78,
    wind: 9.7,
    rain: 0,
    updatedAt: "Dato demo"
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=1800");

  const result = {
    ok: true,
    generatedAt: new Date().toISOString(),
    air: null,
    weather: null,
    warnings: []
  };

  try {
    result.air = await getAirFromSinca();
  } catch (error) {
    result.warnings.push(`SINCA: ${error.message}`);
    result.air = demoAir("SINCA no respondió");
  }

  try {
    result.weather = await getWeatherFromMeteoChile();
  } catch (error) {
    result.warnings.push(`MeteoChile: ${error.message}`);
    try {
      result.weather = await getWeatherFromOpenMeteo();
    } catch (fallbackError) {
      result.warnings.push(`Open-Meteo: ${fallbackError.message}`);
      result.weather = demoWeather("clima no disponible");
    }
  }

  res.status(200).json(result);
}
