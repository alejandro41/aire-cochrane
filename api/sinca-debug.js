const SINCA_BASE = "https://sinca.mma.gob.cl";

const TEST_URLS = [
  {
    name: "pageFrame",
    url: "https://sinca.mma.gob.cl/cgi-bin/APUB-MMA/apub.htmlindico2.cgi?from=210310&header=Cochrane&macro=PM25.horario.horario&macropath=.%2FRXI%2FB06%2FCal%2FPM25&page=pageFrame&to=260413"
  },
  {
    name: "csv",
    url: "https://sinca.mma.gob.cl/cgi-bin/APUB-MMA/apub.htmlindico2.cgi?from=210310&header=Cochrane&macro=PM25.horario.horario&macropath=.%2FRXI%2FB06%2FCal%2FPM25&page=csv&to=260413"
  },
  {
    name: "xcl",
    url: "https://sinca.mma.gob.cl/cgi-bin/APUB-MMA/apub.htmlindico2.cgi?from=210310&header=Cochrane&macro=PM25.horario.horario&macropath=.%2FRXI%2FB06%2FCal%2FPM25&page=xcl&to=260413"
  },
  {
    name: "txt",
    url: "https://sinca.mma.gob.cl/cgi-bin/APUB-MMA/apub.htmlindico2.cgi?from=210310&header=Cochrane&macro=PM25.horario.horario&macropath=.%2FRXI%2FB06%2FCal%2FPM25&page=txt&to=260413"
  },
  {
    name: "pageText",
    url: "https://sinca.mma.gob.cl/cgi-bin/APUB-MMA/apub.htmlindico2.cgi?from=210310&header=Cochrane&macro=PM25.horario.horario&macropath=.%2FRXI%2FB06%2FCal%2FPM25&page=pageText&to=260413"
  }
];

async function fetchHtml(item) {
  const response = await fetch(item.url, {
    headers: {
      "User-Agent": "Monitor Ambiental Cochrane/1.0",
      "Accept": "text/html,text/plain,text/csv,application/vnd.ms-excel,*/*"
    }
  });

  const text = await response.text();

  return {
    name: item.name,
    url: item.url,
    status: response.status,
    contentType: response.headers.get("content-type"),
    length: text.length,
    preview: text.slice(0, 2500)
  };
}

export default async function handler(req, res) {
  try {
    const results = [];

    for (const item of TEST_URLS) {
      try {
        const result = await fetchHtml(item);
        results.push(result);
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
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}