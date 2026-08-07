import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const mime = { ".html": "text/html; charset=utf-8", ".htm": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8" };

http.createServer((req, res) => {
  const target = path.resolve(root, "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname));
  if (!target.startsWith(root) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
    res.writeHead(404).end("Not found");
    return;
  }
  res.writeHead(200, { "Content-Type": mime[path.extname(target)] || "application/octet-stream" });
  fs.createReadStream(target).pipe(res);
}).listen(8765, "127.0.0.1", () => console.log("Local preview: http://127.0.0.1:8765"));
