/**
 * Serves the static export the same way GitHub Pages does: everything under
 * /MY-DOMAIN/. Local preview helper only — `npm run build` first.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = join(process.cwd(), "out");
const BASE = "/MY-DOMAIN";
const PORT = Number(process.env.PORT ?? 4000);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

async function resolve(pathname) {
  let filePath = join(ROOT, normalize(pathname));

  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = join(filePath, "index.html");
  } catch {
    return null;
  }

  try {
    await stat(filePath);
    return filePath;
  } catch {
    return null;
  }
}

createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === "/") {
    response.writeHead(302, { location: `${BASE}/` });
    response.end();
    return;
  }

  if (!pathname.startsWith(`${BASE}/`)) {
    response.writeHead(404, { "content-type": "text/plain" }).end("Not found");
    return;
  }

  pathname = pathname.slice(BASE.length);

  const file = await resolve(pathname);
  if (!file) {
    const fallback = await resolve("/404/index.html");
    response.writeHead(404, { "content-type": TYPES[".html"] });
    response.end(fallback ? await readFile(fallback) : "Not found");
    return;
  }

  response.writeHead(200, {
    "content-type": TYPES[extname(file)] ?? "application/octet-stream",
    "cache-control": "no-store",
  });
  response.end(await readFile(file));
}).listen(PORT, "0.0.0.0", () => {
  console.log(`Preview: http://localhost:${PORT}${BASE}/`);
});
