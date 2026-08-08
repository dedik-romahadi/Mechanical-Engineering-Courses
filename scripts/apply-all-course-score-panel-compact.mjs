import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const courseRoots = [
  "Engineering-Mathematics",
  "Getaran-Mekanik",
  "Optimalisasi-dan-Automasi",
];

const compactRules = `/* Score tracker compact - informasi dan perilaku tetap utuh */
.score-bar-compact{border-radius:18px;padding:14px 20px;margin-bottom:32px;gap:14px}
.score-bar-compact::after{border-radius:18px}
.score-bar-compact .score-value{min-width:56px!important}
.score-bar-compact #scoreDisplay{font-size:32px!important}
.score-bar-compact .score-info{min-width:150px;padding-bottom:2px}
.score-bar-compact .score-title{font-size:10px;letter-spacing:2px;margin-bottom:1px}
.score-bar-compact .score-progress{height:5px;margin-top:3px}
.score-bar-compact .score-breakdown{font-size:10px!important;min-width:132px!important;line-height:1.45}
.score-bar-compact .btn-export{padding:9px 16px;min-height:38px;font-size:10px!important;gap:7px;border-radius:10px}
.score-bar-compact .score-export-guide{padding-top:7px!important;margin-top:0!important;gap:7px!important}
.score-bar-compact .score-export-icon{font-size:14px!important;line-height:1.25!important}
.score-bar-compact .score-export-copy{font-size:11px!important;line-height:1.35!important}
.score-bar-compact #export-blocked-msg{font-size:10.5px!important;line-height:1.3}
@media(max-width:700px){.score-bar-compact{padding:12px 14px;gap:10px}.score-bar-compact .score-breakdown{text-align:left!important;min-width:120px!important}.score-bar-compact .btn-export{padding:8px 12px}}`;

function count(source, pattern) {
  if (typeof pattern === "string") return source.split(pattern).length - 1;
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  return [...source.matchAll(new RegExp(pattern.source, flags))].length;
}

function addClassOnce(source, pattern, className, label, fileLabel) {
  if (source.includes(`class="${className}"`)) return source;
  if (count(source, pattern) !== 1) throw new Error(`${fileLabel}: ${label} tidak unik`);
  return source.replace(pattern, (match, tag, attributes) => `<${tag} class="${className}"${attributes}>`);
}

function compactPanel(source, fileLabel) {
  const panelStart = source.indexOf("  <!-- SCORE BAR -->");
  const panelEnd = panelStart < 0 ? -1 : source.indexOf("  <!-- LATE ACCESS", panelStart);
  if (panelStart < 0 || panelEnd < 0) throw new Error(`${fileLabel}: batas panel skor tidak ditemukan`);

  let prefix = source.slice(0, panelStart);
  let panel = source.slice(panelStart, panelEnd);
  const suffix = source.slice(panelEnd);

  if (!prefix.includes(compactRules)) {
    if (prefix.includes("/* Score tracker compact - informasi dan perilaku tetap utuh */")) {
      throw new Error(`${fileLabel}: aturan compact parsial`);
    }
    const anchor = ".score-bar:hover{";
    if (count(prefix, anchor) !== 1) throw new Error(`${fileLabel}: lokasi gaya panel skor tidak unik`);
    prefix = prefix.replace(anchor, `${compactRules}\n${anchor}`);
  }

  if (!panel.includes('class="score-bar score-bar-compact"')) {
    if (count(panel, '<div class="score-bar">') !== 1) throw new Error(`${fileLabel}: wadah panel skor tidak unik`);
    panel = panel.replace('<div class="score-bar">', '<div class="score-bar score-bar-compact">');
  }
  panel = addClassOnce(
    panel,
    /<(div)( style="text-align:center;min-width:(?:60|70)px")>/,
    "score-value",
    "angka nilai",
    fileLabel,
  );
  panel = addClassOnce(
    panel,
    /<(div)( style="font-family:'JetBrains Mono',monospace;[^\"]*text-align:right;[^\"]*")>/,
    "score-breakdown",
    "rincian skor",
    fileLabel,
  );
  panel = addClassOnce(
    panel,
    /<(div)( style="flex-basis:100%;[^\"]*")>/,
    "score-export-guide",
    "petunjuk Export",
    fileLabel,
  );
  panel = addClassOnce(
    panel,
    /<(span)( style="font-size:(?:16|18)px;[^\"]*")>(?=📤)/,
    "score-export-icon",
    "ikon Export",
    fileLabel,
  );
  panel = addClassOnce(
    panel,
    /<(div)( style="flex:1;min-width:240px;[^\"]*")>(?=Isi semua jawaban)/,
    "score-export-copy",
    "teks Export",
    fileLabel,
  );

  return prefix + panel + suffix;
}

let changed = 0;
for (const courseRoot of courseRoots) {
  for (let moduleNumber = 1; moduleNumber <= 14; moduleNumber += 1) {
    const file = path.join(root, courseRoot, "Modul", `Modul-${moduleNumber}.html`);
    const label = `${courseRoot}/Modul-${moduleNumber}`;
    const original = fs.readFileSync(file, "utf8");
    const updated = compactPanel(original, label);
    if (updated === original) {
      console.log(`${label}: sudah compact`);
      continue;
    }
    const temporary = `${file}.tmp-${process.pid}`;
    fs.writeFileSync(temporary, updated, "utf8");
    fs.renameSync(temporary, file);
    changed += 1;
    console.log(`${label}: panel skor dibuat compact`);
  }
}

console.log(`Selesai: ${changed} dari 42 panel diperbarui.`);
