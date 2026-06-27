#!/usr/bin/env bun
/**
 * serve-out.mjs
 * ------------------------------------------------------------------
 * Serves the static `out/` directory produced by `bun run build:gh-pages`
 * over HTTP so you can preview the production build locally.
 *
 * WHY THIS EXISTS:
 *   Opening `out/index.html` directly with a browser (i.e. via the
 *   `file://` protocol) shows a broken page with NO STYLING and NO DATA.
 *   That is expected — the HTML references assets with absolute paths
 *   like `/_next/static/chunks/abc.css`, which a browser can only
 *   resolve over HTTP. `file:///_next/...` does not exist on disk, so
 *   every CSS/JS/JSON request 404s.
 *
 *   Serve the folder over HTTP instead and everything works exactly as
 *   it will on GitHub Pages.
 *
 * USAGE:
 *   bun run serve                 # serves out/ at http://localhost:4173
 *   bun run serve --port 8080     # custom port
 *   bun run serve --base /my-repo # simulate a GitHub Pages project site
 *
 * The --base flag rewrites absolute `/_next/...` requests to
 * `/my-repo/_next/...` so you can preview the build exactly as it will
 * appear under https://<user>.github.io/<repo>/.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, join, normalize } from "node:path";

const args = process.argv.slice(2);
let port = 4173;
let base = "";
for (let i = 0; i < args.length; i++) {
  if ((args[i] === "--port" || args[i] === "-p") && args[i + 1]) {
    port = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === "--base" && args[i + 1]) {
    base = args[i + 1].replace(/\/+$/, "");
    i++;
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log(`Usage: bun run serve [--port 4173] [--base /repo-name]`);
    process.exit(0);
  }
}

const root = resolve(process.cwd(), "out");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

const safeJoin = (reqPath) => {
  // Strip the configured base prefix (if any) so the file lookup is
  // always relative to out/, regardless of basePath.
  let p = reqPath.split("?")[0];
  if (base && p.startsWith(base)) p = p.slice(base.length);
  if (!p.startsWith("/")) p = "/" + p;
  // Prevent path traversal.
  const cleaned = normalize(p).replace(/^(\.\.[/\\])+/, "");
  return join(root, cleaned);
};

const tryFile = async (p) => {
  try {
    const s = await stat(p);
    if (s.isFile()) return p;
    if (s.isDirectory()) {
      const idx = join(p, "index.html");
      try {
        await stat(idx);
        return idx;
      } catch {
        return null;
      }
    }
  } catch {
    return null;
  }
  return null;
};

const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url || "/");
  let file = await tryFile(safeJoin(url));

  // Next.js with trailingSlash:true serves directory-style URLs.
  // Fallback: if /foo 404s, try /foo.html, then /foo/index.html.
  if (!file && !extname(url)) {
    file = await tryFile(safeJoin(url + ".html"));
  }
  if (!file) {
    // SPA-style fallback to the 404 page.
    file = await tryFile(join(root, "404.html"));
    res.statusCode = 404;
  }

  if (!file) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
    return;
  }

  const mime = MIME[extname(file).toLowerCase()] || "application/octet-stream";
  try {
    const body = await readFile(file);
    res.writeHead(res.statusCode || 200, {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=0, must-revalidate",
    });
    res.end(body);
  } catch {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("500 Internal Server Error");
  }
});

server.listen(port, "127.0.0.1", () => {
  const origin = `http://127.0.0.1:${port}`;
  const path = base ? `${base}/` : "/";
  console.log(`\n  ▲ Static preview server running`);
  console.log(`    Serving:  ${root}`);
  console.log(`    Open:     ${origin}${path}`);
  if (base) console.log(`    basePath: ${base} (simulating a project site)`);
  console.log(`    Press Ctrl+C to stop.\n`);
});
