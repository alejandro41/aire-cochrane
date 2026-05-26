const METEOCHILE_USER = process.env.METEOCHILE_USER;
const METEOCHILE_TOKEN = process.env.METEOCHILE_TOKEN;
const METEOCHILE_EMA_CODE = "470001";

export default async function handler(req, res) {
  try {
    if (!METEOCHILE_USER || !METEOCHILE_TOKEN) {
      return res.status(500).json({
        ok: false,
        error: "Faltan METEOCHILE_USER o METEOCHILE_TOKEN en Vercel"
      });
    }

    const url =
      `https://climatologia.meteochile.gob.cl/application/servicios/getDatosRecientesEma/${METEOCHILE_EMA_CODE}` +
      `?usuario=${encodeURIComponent(METEOCHILE_USER)}` +
      `&token=${encodeURIComponent(METEOCHILE_TOKEN)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Monitor Ambiental Cochrane/1.0",
        "Accept": "application/json,text/plain,*/*"
      }
    });

    const text = await response.text();

    let parsed = null;
    let parseError = null;

    try {
      parsed = JSON.parse(text);
    } catch (error) {
      parseError = error.message;
    }

    const rows = Array.isArray(parsed)
      ? parsed
      : parsed?.datos || parsed?.data || parsed?.resultado || parsed?.registros || [];

    const first = Array.isArray(rows) && rows.length ? rows[0] : null;
    const last = Array.isArray(rows) && rows.length ? rows[rows.length - 1] : null;

    res.status(200).json({
      ok: true,
      status: response.status,
      contentType: response.headers.get("content-type"),
      textLength: text.length,
      parseError,
      parsedType: Array.isArray(parsed) ? "array" : typeof parsed,
      topLevelKeys: parsed && typeof parsed === "object" ? Object.keys(parsed) : [],
      rowsIsArray: Array.isArray(rows),
      rowsLength: Array.isArray(rows) ? rows.length : null,
      firstSample: first,
      lastSample: last,
      rawPreview: text.slice(0, 3000)
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}