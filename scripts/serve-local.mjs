import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const mime = { ".html": "text/html; charset=utf-8", ".htm": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".pdf": "application/pdf" };

const handler = (req, res) => {
  const target = path.resolve(root, "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname));
  if (!target.startsWith(root) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
    res.writeHead(404).end("Not found");
    return;
  }
  res.writeHead(200, { "Content-Type": mime[path.extname(target)] || "application/octet-stream" });
  fs.createReadStream(target).pipe(res);
};
// Port: env PORT (pratinjau editor), lalu argumen --port=NNNN, lalu 8765.
const argPort = Number((process.argv.find((x) => x.startsWith("--port=")) || "").slice(7));
const port = Number(process.env.PORT) || argPort || 8765;
http.createServer(handler).listen(port, "127.0.0.1", () => console.log(`Local preview: http://127.0.0.1:${port}`));
