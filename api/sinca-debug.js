const SINCA_BASE = "https://sinca.mma.gob.cl";

const SINCA_URL =
  "https://sinca.mma.gob.cl/cgi-bin/APUB-MMA/apub.htmlindico2.cgi?from=210310&header=Cochrane&macro=PM25.horario.horario&macropath=.%2FRXI%2FB06%2FCal%2FPM25&page=pageFrame&to=260413";

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Monitor Ambiental Cochrane/1.0",
      "Accept": "text/html,application/xhtml+xml,text/plain"
    }
  });

  const html = await response.text();

  return {
    url,
    status: response.status,
    contentType: response.headers.get("content-type"),
    length: html.length,
    html
  };
}

function extractFrameUrls(html) {
  const urls = [];
  const regex = /<frame[^>]+src=["']([^"']+)["']/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    let src = match[1];

    if (!src) continue;

    if (src.startsWith("/")) {
      src = SINCA_BASE + src;
    }

    if (src.startsWith("http")) {
      urls.push(src);
    }
  }

  return urls;
}

export default async function handler(req, res) {
  try {
    const first = await fetchHtml(SINCA_URL);
    const frameUrls = extractFrameUrls(first.html);

    const frames = [];

    for (const frameUrl of frameUrls) {
      const frame = await fetchHtml(frameUrl);
      frames.push({
        url: frame.url,
        status: frame.status,
        contentType: frame.contentType,
        length: frame.length,
        preview: frame.html.slice(0, 4000)
      });
    }

    res.status(200).json({
      ok: true,
      first: {
        url: first.url,
        status: first.status,
        contentType: first.contentType,
        length: first.length,
        preview: first.html.slice(0, 1200)
      },
      frameUrls,
      frames
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}