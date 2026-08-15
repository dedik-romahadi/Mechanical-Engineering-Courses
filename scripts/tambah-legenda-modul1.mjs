// Satu-kali PAKAI-ULANG-AMAN: sisipkan legenda "Arti notasi" di bawah tiap grup
// kartu Modul 1 Sisken yang memuat rumus matematis. Modul 1 ditulis tangan
// (dilewati generator), tetapi aturan dosen berlaku untuk semua kartu: setiap
// notasi persamaan harus ada penjelasannya. Idempoten — grup yang sudah
// berlegenda dilewati; token tanpa arti di NOTASI_KAMUS menghentikan proses.
import fs from "node:fs";
import path from "node:path";

import { ekstrakNotasiLatex } from "./sisken-rumus.mjs";
import { NOTASI_KAMUS } from "./sisken-rumus-jelas.mjs";

const root = path.resolve(import.meta.dirname, "..");
const file = path.join(root, "Sistem-Kendali-Cerdas", "Modul", "Modul-1.html");
let html = fs.readFileSync(file, "utf8");

const NAMA_DIKENAL = new Set(Object.keys(NOTASI_KAMUS)
  .filter((k) => k.length > 1 && !k.startsWith("\\") && !k.includes("_")));
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function akhirDivSeimbang(s, mulai) {
  let d = 0;
  const re = /<div\b|<\/div>/g;
  re.lastIndex = mulai;
  for (let m; (m = re.exec(s)); ) {
    d += m[0] === "</div>" ? -1 : 1;
    if (d === 0) return re.lastIndex;
  }
  throw new Error("div tidak seimbang");
}

let sisip = 0;
const kurang = new Map();
let pos = 0;
while ((pos = html.indexOf('<div class="cards reveal">', pos)) !== -1) {
  const akhir = akhirDivSeimbang(html, pos);
  const grup = html.slice(pos, akhir);
  const setelah = html.slice(akhir, akhir + 400);
  if (setelah.includes("Arti notasi:")) { pos = akhir; continue; }
  const rumus = [...grup.matchAll(/class="formula">\\\((.+?)\\\)<\/div>/gs)].map((m) => m[1]);
  const urutan = [];
  const sudah = new Set();
  for (const r of rumus) {
    for (const tk of ekstrakNotasiLatex(r, NAMA_DIKENAL)) {
      if (!sudah.has(tk)) { sudah.add(tk); urutan.push(tk); }
    }
  }
  if (!urutan.length) { pos = akhir; continue; }
  const chips = [];
  for (const tk of urutan) {
    const arti = NOTASI_KAMUS[tk];
    if (!arti) { kurang.set(tk, rumus[0]?.slice(0, 40)); continue; }
    chips.push(`<span class="anim-var"><span class="rumus-notasi">\\(${tk}\\)</span><span>${esc(arti)}</span></span>`);
  }
  const kotak = `\n  <div class="tip-box reveal rumus-jelas"><strong>🔤 Arti notasi:</strong>
    <div class="anim-var-list" aria-label="Arti tiap notasi">${chips.join("")}</div>
  </div>`;
  html = html.slice(0, akhir) + kotak + html.slice(akhir);
  sisip += 1;
  pos = akhir + kotak.length;
}

if (kurang.size) {
  console.error("KURANG di NOTASI_KAMUS:");
  for (const [t, a] of kurang) console.error(`  ${JSON.stringify(t)}  <- ${a}`);
  process.exit(1);
}
fs.writeFileSync(file, html, "utf8");
console.log(`Modul 1: ${sisip} legenda Arti notasi disisipkan.`);
