import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const failures = [];

for (let n = 1; n <= 14; n += 1) {
  const file = path.join(root, "Sistem-Kendali-Cerdas", "Modul", `Modul-${n}.html`);
  const html = fs.readFileSync(file, "utf8");
  const checks = [
    [html.includes(`id="sisken-module-${n}"`), "rich module root"],
    [(html.match(/class="sisken-tab(?: active)?"/g) || []).length === 6, "six content tabs"],
    [(html.match(/data-sisken-pane=/g) || []).length === 6, "six content panes"],
    [(html.match(/class="code-wrap/g) || []).length === 1, "one visible Python code panel"],
    [html.includes("class=\"code-dots\"") && html.includes("class=\"code-copy\""), "reference code-panel design"],
    [(html.match(/id="sisken-rich-runtime"/g) || []).length === 1, "one runtime"],
    [!html.match(/pengalaman pribadi|Tugas Pertemuan|10 soal pilihan/gi), "no personal/legacy assessment copy"],
    [html.includes("Asesmen Teknis") && html.includes("Implementasi Python"), "technical assignment panel"],
    [html.includes('id="visitorTableBody" style="max-height:min(72vh,820px);overflow-y:auto;"'), "tall responsive student list"],
    [(html.match(/<span class="nav-brand">/g) || []).length === 1 && html.includes(`<span>SISKENCERDAS // M${n}</span></span>`), "clean module navigation brand"],
    [html.includes("overflow-y:auto!important;overscroll-behavior:contain"), "scroll-safe login overlays"],
  ];
  for (const [ok, label] of checks) if (!ok) failures.push(`Modul-${n}: ${label}`);

  const runtime = html.match(/<script id="sisken-rich-runtime">([\s\S]*?)<\/script>/)?.[1];
  if (runtime) {
    try { new vm.Script(runtime, { filename: `Modul-${n}:sisken-rich-runtime` }); }
    catch (error) { failures.push(`Modul-${n}: runtime syntax — ${error.message}`); }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Validated 14 Sisken modules: content tabs, code panels, tasks, and runtime syntax.");
