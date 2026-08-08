import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const courseRoots = [
  "Engineering-Mathematics",
  "Getaran-Mekanik",
  "Optimalisasi-dan-Automasi",
];
const failures = [];

const count = (source, needle) => source.split(needle).length - 1;

for (const courseRoot of courseRoots) {
  for (let moduleNumber = 1; moduleNumber <= 14; moduleNumber += 1) {
    const label = `${courseRoot}/Modul-${moduleNumber}`;
    const file = path.join(root, courseRoot, "Modul", `Modul-${moduleNumber}.html`);
    const html = fs.readFileSync(file, "utf8");
    const checks = [
      [count(html, 'class="score-bar score-bar-compact"') === 1, "satu panel compact"],
      [html.includes(".score-bar-compact{border-radius:18px;padding:14px 20px;margin-bottom:32px;gap:14px}"), "geometri compact"],
      [html.includes(".score-bar-compact .btn-export{padding:9px 16px;min-height:38px"), "tombol Export compact"],
      [html.includes(".score-bar-compact #export-blocked-msg{font-size:10.5px!important;line-height:1.3}"), "status compact"],
      [["score-value", "score-breakdown", "score-export-guide", "score-export-icon", "score-export-copy"].every((className) => count(html, `class="${className}"`) === 1), "penanda bagian panel compact"],
      [/\.score-bar\{position:sticky;top:64px;/.test(html), "perilaku sticky tetap ada"],
      [["scoreDisplay", "scoreDetail", "scoreFill", "scoreMC", "scoreCompEz", "scoreCompHard", "btn-score-export", "export-blocked-msg", "gdrive-link"].every((id) => html.includes(`id="${id}"`)), "komponen dan prasyarat panel utuh"],
      [/<button class="btn-export" id="btn-score-export" onclick="exportTugasHtml\(\)" disabled/.test(html), "Export tetap terkunci pada keadaan awal"],
      [html.includes("function checkExportReady()"), "logika kelengkapan tetap ada"],
      [!html.includes("temporary-panel-test"), "tanpa skrip uji sementara"],
    ];
    for (const [ok, description] of checks) {
      if (!ok) failures.push(`${label}: ${description}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Validated 42 compact score panels across Engineering Mathematics, Getaran Mekanik, and Optimalisasi & Otomasi.");
