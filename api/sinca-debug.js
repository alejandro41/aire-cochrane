const SINCA_URL =
  "https://sinca.mma.gob.cl/cgi-bin/APUB-MMA/apub.htmlindico2.cgi?from=210310&header=Cochrane&macro=PM25.horario.horario&macropath=.%2FRXI%2FB06%2FCal%2FPM25&page=pageFrame&to=260413";

export default async function handler(req, res) {
  try {
    const response = await fetch(SINCA_URL, {
      headers: {
        "User-Agent": "Monitor Ambiental Cochrane/1.0",
        "Accept": "text/html,application/xhtml+xml,text/plain"
      }
    });

    const html = await response.text();

    res.status(200).json({
      ok: true,
      status: response.status,
      contentType: response.headers.get("content-type"),
      length: html.length,
      preview: html.slice(0, 3000)
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}