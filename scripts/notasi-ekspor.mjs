#!/usr/bin/env node
/**
 * Notasi rumus di dokumen Export Tugas (tinjauan 3 Oktober 2026, lanjutan laporan dosen tentang notasi
 * "V_k, R_l" di Modul 3 TTL).
 *
 * MASALAHNYA. Sesudah notasi rumus ditulis sebagai <sub>/<sup> (Pedoman §2 butir Notasi rumus),
 * exportTugasHtml masih membaca teks soal dan pilihan PG lewat `textContent`. textContent menempelkan
 * subskrip/pangkat ke huruf dasarnya — "Z<sub>baru</sub> = Z<sub>lama</sub> × (S<sub>lama</sub>/…)" menjadi
 * "Zbaru = Zlama × (Slama/…)", "e<sup>−x/3</sup>" menjadi "e−x/3" — dan KaTeX yang sudah dirender terbaca
 * dua kali (MathML + tampilan: "x2x^2x2"). Dokumen ekspor yang dibaca dosen jadi ambigu.
 *
 * YANG DILAKUKAN. Di awal badan `async function exportTugasHtml()` setiap halaman modul dipasang blok
 * NOTASI-EKSPOR berisi `_teksNotasi(el)`: salinan elemen, KaTeX diganti sumber LaTeX-nya, <sub>/<sup>
 * diganti teks — subskrip satu karakter atau angka menjadi huruf subskrip Unicode (V<sub>k</sub> → Vₖ,
 * Y<sub>11</sub> → Y₁₁), selain itu "_" (Z_baru, ω_(n,iso)); pangkat angka/tanda atau satu huruf n/i/T menjadi
 * superskrip Unicode (x², 10⁻³, xⁿ), selain itu "^"/"^(…)" (e^(−x/3)). Tiga pembacaan di exportTugasHtml
 * memakainya: pilihan PG terpilih (`sel`), teks soal PG (`.mc-q`), dan teks soal komputasi (`.comp-q`).
 * Fallback jawaban benar di blok PILIHAN-PG-EKSPOR (scripts/pulihkan-pilihan-pg.mjs) memanggilnya juga bila ada.
 *
 * Generator TTL/CAD membangun Modul 2–14 dari Modul-1 halamannya, jadi blok ini ikut terbawa; Sisken dan
 * halaman tulisan tangan dipasangi langsung. Jalankan sesudah regenerasi, di urutan injector kanonik
 * (Pedoman §17.1) sebelum draft-modul.mjs. Idempoten.
 *
 * Pakai:
 *   node scripts/notasi-ekspor.mjs            # pasang/segarkan
 *   node scripts/notasi-ekspor.mjs --periksa  # laporan saja (keluar 1 bila ada yang akan berubah)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { KURSUS_NOTASI } from "./periksa-notasi.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

export const VERSI = "v1";
export const KEPALA = "async function exportTugasHtml() {\n";
const AWAL = `  // NOTASI-EKSPOR BEGIN ${VERSI} — dipasang scripts/notasi-ekspor.mjs`;
const AKHIR = `  // NOTASI-EKSPOR END ${VERSI}`;
export const BLOK = `${AWAL}
  // textContent menempelkan subskrip/pangkat ke huruf dasarnya (Z<sub>baru</sub> → "Zbaru") dan membaca KaTeX
  // dua kali, sehingga rumus di dokumen ekspor terbaca salah. Subskrip satu karakter/angka → huruf subskrip
  // Unicode (Vₖ, Y₁₁), selain itu "_" (Z_baru); pangkat angka/tanda → superskrip (x², 10⁻³), selain itu
  // "^"/"^(…)"; KaTeX → sumber LaTeX-nya.
  function _teksNotasi(el) {
    if (!el) return '';
    var SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
      '+': '₊', '-': '₋', '−': '₋', '=': '₌', '(': '₍', ')': '₎', a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ',
      l: 'ₗ', m: 'ₘ', n: 'ₙ', o: 'ₒ', p: 'ₚ', r: 'ᵣ', s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ' };
    var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
      '+': '⁺', '-': '⁻', '−': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', n: 'ⁿ', i: 'ⁱ', T: 'ᵀ' };
    var c = el.cloneNode(true);
    var kx = c.querySelectorAll('.katex');
    for (var k = 0; k < kx.length; k++) {
      var a = kx[k].querySelector('annotation');
      kx[k].parentNode.replaceChild(document.createTextNode(a ? a.textContent : kx[k].textContent), kx[k]);
    }
    var ns = c.querySelectorAll('sub, sup');
    for (var i = ns.length - 1; i >= 0; i--) {
      var e = ns[i], t = e.textContent, sub = e.tagName.toLowerCase() === 'sub', peta = sub ? SUB : SUP, u = '';
      var unik = t.length === 1 || /^[0-9+\\-−=()]+$/.test(t);
      for (var j = 0; j < t.length && u !== null; j++) u = peta[t.charAt(j)] ? u + peta[t.charAt(j)] : null;
      if (!unik || u === null || !t) u = (sub ? '_' : '^') + (/^[A-Za-z0-9α-ωΑ-Ω]+$/.test(t) && (sub || t.length === 1) ? t : '(' + t + ')');
      e.parentNode.replaceChild(document.createTextNode(u), e);
    }
    return c.textContent.trim();
  }
${AKHIR}
`;
const RX_BLOK = /  \/\/ NOTASI-EKSPOR BEGIN [^\n]*\n[\s\S]*?  \/\/ NOTASI-EKSPOR END [^\n]*\n/;
// pembacaan teks di exportTugasHtml: [lama, baru, jumlah per halaman]
export const BACAAN = [
  ["      selectedText = sel.textContent.trim();\n", "      selectedText = _teksNotasi(sel);\n", 1],
  ["        if (q) return q.textContent.trim();\n", "        if (q) return _teksNotasi(q);\n", 2],
];
const hitung = (s, t) => s.split(t).length - 1;

/** Halaman modul keenam course (Modul-1..14), tanpa salinan konflik OneDrive. */
export function halamanModul() {
  const out = [];
  for (const k of KURSUS_NOTASI) {
    for (let n = 1; n <= 14; n += 1) out.push(path.join(k, "Modul", `Modul-${n}.html`));
  }
  return out;
}

/** Pasang blok + ganti pembacaan teks pada satu halaman (idempoten). */
export function pasang(html, rel) {
  if (hitung(html, KEPALA) !== 1) throw new Error(`${rel}: "async function exportTugasHtml() {" harus tepat satu`);
  const i = html.indexOf(KEPALA) + KEPALA.length;
  let out = html;
  if (RX_BLOK.test(out)) out = out.replace(RX_BLOK, () => BLOK);
  else out = out.slice(0, i) + BLOK + out.slice(i);
  if (out.indexOf(BLOK) !== i) throw new Error(`${rel}: blok NOTASI-EKSPOR harus tepat di awal badan exportTugasHtml`);
  const awal = out.indexOf(KEPALA);
  for (const [lama, baru, n] of BACAAN) {
    const nL = hitung(out, lama), nB = hitung(out, baru);
    if (nL === n && nB === 0) {
      if (out.indexOf(lama) < awal) throw new Error(`${rel}: pembacaan ${JSON.stringify(lama.trim())} berada sebelum exportTugasHtml`);
      out = out.split(lama).join(baru);
    } else if (!(nL === 0 && nB === n)) throw new Error(`${rel}: pembacaan ${JSON.stringify(lama.trim())} ${nL}×, bentuk baru ${nB}×, harap ${n}`);
  }
  return out;
}

/** Pelanggaran pada satu halaman (untuk validate-public-security.mjs). */
export function periksaHalaman(html, rel) {
  const salah = [];
  if (hitung(html, BLOK) !== 1) salah.push(`${rel}: blok NOTASI-EKSPOR ${VERSI} tidak ada atau berbeda (node scripts/notasi-ekspor.mjs)`);
  else if (html.indexOf(BLOK) !== html.indexOf(KEPALA) + KEPALA.length) salah.push(`${rel}: blok NOTASI-EKSPOR tidak di awal exportTugasHtml`);
  for (const [lama, baru, n] of BACAAN) {
    if (hitung(html, lama)) salah.push(`${rel}: ekspor masih membaca ${JSON.stringify(lama.trim())} (notasi rumus diratakan)`);
    if (hitung(html, baru) !== n) salah.push(`${rel}: ${JSON.stringify(baru.trim())} harus ${n}×`);
  }
  return salah;
}

/** Uji perilaku _teksNotasi (fungsi di BLOK) pada DOM tiruan minimum; lempar Error bila menyimpang. */
export function ujiTeksNotasi() {
  class Teks {
    constructor(t) { this.nodeType = 3; this.data = t; this.parentNode = null; }
    get textContent() { return this.data; }
    cloneNode() { return new Teks(this.data); }
  }
  class El {
    constructor(tag, cls = "", anak = []) {
      this.nodeType = 1; this.tagName = tag.toUpperCase(); this.className = cls; this.childNodes = []; this.parentNode = null;
      for (const a of anak) this.appendChild(typeof a === "string" ? new Teks(a) : a);
    }
    appendChild(n) { n.parentNode = this; this.childNodes.push(n); return n; }
    get textContent() { return this.childNodes.map((n) => n.textContent).join(""); }
    cloneNode(dalam) { const c = new El(this.tagName, this.className); if (dalam) for (const n of this.childNodes) c.appendChild(n.cloneNode(true)); return c; }
    replaceChild(baru, lama) { const i = this.childNodes.indexOf(lama); baru.parentNode = this; this.childNodes[i] = baru; lama.parentNode = null; return lama; }
    semua(cocok, out = []) { for (const n of this.childNodes) if (n.nodeType === 1) { if (cocok(n)) out.push(n); n.semua(cocok, out); } return out; }
    querySelectorAll(sel) {
      const f = { ".katex": (n) => n.className.split(" ").includes("katex"), "sub, sup": (n) => n.tagName === "SUB" || n.tagName === "SUP", annotation: (n) => n.tagName === "ANNOTATION" }[sel];
      if (!f) throw new Error(`selektor tidak dikenal di DOM tiruan: ${sel}`);
      return this.semua(f);
    }
    querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  }
  const sub = (t) => new El("sub", "", [t]), sup = (t) => new El("sup", "", [t]);
  const teksNotasi = new Function("document", `${BLOK}\nreturn _teksNotasi;`)({ createTextNode: (t) => new Teks(t) });
  const kasus = [
    [new El("div", "radio-option", [new El("div", "radio-circle"), new El("span", "opsi-teks", ["(A)   Z", sub("baru"), " = Z", sub("lama"), " × (V", sub("baru"), "/V", sub("lama"), ")²"])]),
      "(A)   Z_baru = Z_lama × (V_baru/V_lama)²"],
    [new El("div", "mc-q", ["V", sub("k"), " = V · R", sub("k"), " / R", sub("seri"), " dan R", sub("L")]), "Vₖ = V · Rₖ / R_seri dan R_L"],
    [new El("div", "", ["e", sup("−x/3"), "·sin(x), x", sup("2"), " + Y", sub("11"), ", ω", sub("n,iso"), ", 10", sup("−3")]), "e^(−x/3)·sin(x), x² + Y₁₁, ω_(n,iso), 10⁻³"],
    [new El("div", "comp-q", [" Daya ", new El("span", "katex", [new El("span", "katex-mathml", [new El("annotation", "", ["I^2R"])]), new El("span", "katex-html", ["I2R"])]), " turun "]), "Daya I^2R turun"],
    [null, ""],
  ];
  for (const [el, harap] of kasus) {
    const asli = el && el.textContent;
    const hasil = teksNotasi(el);
    if (hasil !== harap) throw new Error(`_teksNotasi → ${JSON.stringify(hasil)}, harap ${JSON.stringify(harap)}`);
    if (el && el.textContent !== asli) throw new Error("_teksNotasi mengubah elemen asli (harus bekerja pada salinan)");
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--uji")) { ujiTeksNotasi(); console.log("_teksNotasi: semua kasus uji lulus"); process.exit(0); }
  const tulis = [];
  for (const rel of halamanModul()) {
    const f = path.join(root, rel);
    const html = fs.readFileSync(f, "utf8");
    const baru = pasang(html, rel.replace(/\\/g, "/"));
    if (baru !== html) tulis.push([f, baru]);
  }
  if (!periksa) for (const [f, html] of tulis) fs.writeFileSync(f, html);
  console.log(`${tulis.length} dari ${halamanModul().length} halaman modul ${periksa ? "akan diperbarui" : "diperbarui"} (NOTASI-EKSPOR ${VERSI})`);
  if (periksa && tulis.length) process.exitCode = 1;
}
