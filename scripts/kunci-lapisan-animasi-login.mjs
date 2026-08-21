/**
 * Mengunci lapisan animasi overlay login supaya tidak memicu scrollbar.
 *
 * Gejala (22 Agu 2026, dilaporkan dosen): sesudah memilih "Mahasiswa",
 * overlay login "tidak stabil — scroll muncul berulang kali".
 *
 * Sebab (diukur di halaman live Sisken Modul-7): overlay login di modul
 * Sisken dibuat bisa di-scroll (`.visitor-overlay{overflow-y:auto}` dari
 * enrich-sisken-modules.mjs, supaya modal panjang tetap terjangkau di layar
 * pendek). Partikel dan rumus melayang (`.ov-particle`, `.ov-formula`)
 * ditambahkan ke `#overlayParticles`, yang TIDAK punya kelas
 * `overlay-anim-particles` (berbeda dari `#pickerParticles` yang punya),
 * jadi lapisan itu tidak memotong anaknya: scrollHeight overlay 837 px pada
 * viewport 812 px dan scrollWidth 522 px pada 375 px. Setiap partikel lewat
 * tepi, scrollbar muncul lalu hilang.
 *
 * Perbaikan:
 *   1. `#overlayParticles` diberi kelas `overlay-anim-particles`
 *      (position:absolute; inset:0; overflow:hidden) — sama seperti pemilih
 *      peran. Anak-anaknya tak lagi memperbesar area scroll.
 *   2. Pada overlay yang memang bisa di-scroll, `scrollbar-gutter:stable`
 *      supaya munculnya scrollbar (mis. saat modal panjang di layar pendek)
 *      tidak menggeser tata letak.
 *
 * Idempoten: dikenali dari bentuk akhirnya.
 *
 * Pakai:
 *   node scripts/kunci-lapisan-animasi-login.mjs            # terapkan
 *   node scripts/kunci-lapisan-animasi-login.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

const MARKUP_LAMA = `<div id="overlayParticles" aria-hidden="true"></div>`;
const MARKUP_BARU = `<div id="overlayParticles" class="overlay-anim-particles" aria-hidden="true"></div>`;
// Aturan override Sisken (satu baris panjang); hanya ditambah scrollbar-gutter.
const OVERLAY_SCROLL_LAMA = `.visitor-overlay{overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior:contain;`;
const OVERLAY_SCROLL_BARU = `.visitor-overlay{overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior:contain;scrollbar-gutter:stable;`;

function proses(berkas) {
  let html = fs.readFileSync(berkas, "utf8");
  const awal = html;
  const catatan = [];
  if (html.includes(MARKUP_LAMA)) { html = html.split(MARKUP_LAMA).join(MARKUP_BARU); catatan.push("kelas-partikel"); }
  if (!html.includes(OVERLAY_SCROLL_BARU) && html.includes(OVERLAY_SCROLL_LAMA)) { html = html.split(OVERLAY_SCROLL_LAMA).join(OVERLAY_SCROLL_BARU); catatan.push("scrollbar-gutter"); }
  if (html === awal) return null;
  return { html, catatan };
}

const berkas = [];
for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
  if (!kursus.isDirectory()) continue;
  for (const sub of ["Exam", "Modul"]) {
    const dir = path.join(root, kursus.name, sub);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) if (f.endsWith(".html")) berkas.push(path.join(dir, f));
  }
}
let n = 0;
const rekap = {};
for (const f of berkas.sort()) {
  const h = proses(f);
  if (!h) continue;
  n += 1;
  for (const c of h.catatan) rekap[c] = (rekap[c] || 0) + 1;
  if (!periksa) fs.writeFileSync(f, h.html);
}
console.log(`${n} halaman ${periksa ? "akan diperbarui" : "diperbarui"}: ${JSON.stringify(rekap)}`);
