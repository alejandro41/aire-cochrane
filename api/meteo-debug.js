const TEST_URLS = [
  {
    name: "visor ema 480002",
    url: "https://climatologia.meteochile.gob.cl/application/diariob/visorDeDatosEma/480002"
  },
  {
    name: "posible json estacion 480002",
    url: "https://climatologia.meteochile.gob.cl/application/servicios/getDatosEstacion/480002"
  },
  {
    name: "posible json ema 480002",
    url: "https://climatologia.meteochile.gob.cl/application/servicios/getDatosEma/480002"
  },
  {
    name: "posible 12 horas estacion",
    url: "https://climatologia.meteochile.gob.cl/application/servicios/getEmaUltimasHoras/480002"
  },
  {
    name: "posible estaciones automaticas",
    url: "https://climatologia.meteochile.gob.cl/application/servicios/getEstacionesAutomaticas"
  }
];

async function fetchText(item) {
  const response = await fetch(item.url, {
    headers: {
      "User-Agent": "Monitor Ambiental Cochrane/1.0",
      "Accept": "application/json,text/html,text/plain,*/*"
    }
  });

  const text = await response.text();

  return {
    name: item.name,
    url: item.url,
    status: response.status,
    contentType: response.headers.get("content-type"),
    length: text.length,
    preview: text.slice(0, 3000)
  };
}

export default async function handler(req, res) {
  const results = [];

  for (const item of TEST_URLS) {
    try {
      results.push(await fetchText(item));
    } catch (error) {
      results.push({
        name: item.name,
        url: item.url,
        ok: false,
        error: error.message
      });
    }
  }

  res.status(200).json({
    ok: true,
    results
  });
}