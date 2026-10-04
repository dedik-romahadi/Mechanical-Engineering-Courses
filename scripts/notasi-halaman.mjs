#!/usr/bin/env node
/**
 * Notasi rumus di halaman yang ditulis tangan (laporan dosen 3 Oktober 2026: "V_k, R_l" di Gambar 2
 * Modul 3 TTL tertulis dengan garis bawah mentah; pola yang sama ada di modul lain).
 *
 * TTL dan Pemodelan CAD dibangun generator (pustaka.py, animasi/dasar.js). Halaman Getaran Mekanik,
 * Matematika 4, Optimalisasi & Otomasi, Sistem Kendali Cerdas Modul 1, bagian Sisken Modul 2–14 di luar
 * keluaran enrich-sisken-modules.mjs, dan seluruh halaman ujian (UTS/UAS) ditulis tangan. Skrip ini
 * memasang perbaikan notasinya secara idempoten dari daftar eksplisit `notasi-halaman-data.json`:
 *
 *   - `grup[].ganti` berisi pasangan [lama, baru] dengan jangkar teks yang UNIK di halamannya.
 *     Pasangan dipasang bila `lama` muncul tepat sekali dan `baru` belum ada; dilewati bila `baru`
 *     sudah ada tepat sekali dan `lama` tidak ada (sudah terpasang). Keadaan lain (jangkar hilang,
 *     ganda, atau keduanya ada) DITOLAK dan tidak ada berkas yang ditulis — halaman yang sudah
 *     berubah di sekitar jangkar harus ditinjau, bukan ditebak.
 *     Isinya: subskrip/superskrip <sub>/<sup> pada teks tampil, <tspan> pada <text> SVG statis,
 *     penanda <sub>/<sup> pada literal kanvas/readout (fillText, innerHTML; sink textContent yang
 *     menampilkan penanda diganti innerHTML — isinya teks statis dan angka), overlay login
 *     `el.innerHTML = f.t`, segmen KaTeX yang terpecah <sub>/<sup> disatukan kembali, teks <option>
 *     (KaTeX/penanda tidak dirender di dalam <option>) ditulis polos dengan karakter Unicode.
 *     Kode tidak diubah: <pre>, blok Python, <code> yang berisi kode (pemanggilan, indeks, nama
 *     berkas), nama parameter/variabel (n_estimators, X_train, A_ub, solve_ivp, …), atribut, KaTeX.
 *   - `kanvas` adalah halaman yang mendapat blok NOTASI-KANVAS (sebelum </head>): helper prototipe
 *     CanvasRenderingContext2D yang menggambar teks berpenanda <sub>…</sub>/<sup>…</sup> pada
 *     fillText/strokeText/measureText sebagai subskrip/superskrip sungguhan (aturan yang sama dengan
 *     _ttlRumus TTL/CAD: 0,72× ukuran, tidak di bawah 8 px, turun 0,22 em / naik 0,38 em). Teks tanpa
 *     penanda diteruskan apa adanya.
 *
 * Blok AI-CHAT-AGENT tidak pernah disentuh (diperiksa identik sebelum/sesudah). Gambar bernomor
 * (tambah-ilustrasi-statis.mjs, tambah-ilustrasi-modul1.mjs, enrich-sisken-modules.mjs) dan keluaran
 * enrich-sisken-modules.mjs diperbaiki di generatornya; pasangan untuk wilayah generator Sisken 2–14
 * di data ini adalah keluaran generator yang sama (agar halaman terbit tidak perlu dibangun ulang).
 *
 * Pakai (dari root repo; bagian dari urutan injector kanonik, Pedoman §2/§17.1):
 *   node scripts/notasi-halaman.mjs             # pasang
 *   node scripts/notasi-halaman.mjs --periksa   # laporan saja; keluar 1 bila ada yang akan berubah/ditolak
 * Pemeriksa notasinya: scripts/periksa-notasi.mjs (dipanggil validate-public-security.mjs). Pemeriksaan --periksa yang
 * sama (rencanaNotasi) juga dijalankan validate-public-security.mjs beserta uji mutasi label tulisan tangan TTL, karena
 * label yang dikeluarkan dari KaTeX ("10 Soal · @2", "Terminal — <code>ttl</code>") hanya dijaga jangkar pasangan ini.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");
const DATA = JSON.parse(fs.readFileSync(path.join(root, "scripts", "notasi-halaman-data.json"), "utf8"));

export const VERSI_KANVAS = 1;
export const SKRIP_KANVAS = String.raw`/* Notasi rumus di kanvas (scripts/notasi-halaman.mjs). Teks fillText/strokeText/measureText yang memuat
   <sub>…</sub> atau <sup>…</sup> digambar sebagai subskrip/superskrip sungguhan; teks lain tidak berubah. */
(function () {
  var P = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
  if (!P || P.__notasiKanvas) return;
  var isi = P.fillText, garis = P.strokeText, ukur = P.measureText;
  // Tanpa membedakan huruf besar/kecil: label yang di-toUpperCase() ("E<SUB>TOTAL</SUB>") tetap dikenali.
  function ada(s) { return typeof s === 'string' && /<su[bp]>/i.test(s); }
  function potong(s) {
    var rx = /<(sub|sup)>([\s\S]*?)<\/\1>/gi, out = [], i = 0, m;
    while ((m = rx.exec(s))) {
      if (m.index > i) out.push([s.slice(i, m.index), 0]);
      out.push([m[2], m[1].toLowerCase() === 'sub' ? 1 : -1]);
      i = rx.lastIndex;
    }
    if (i < s.length) out.push([s.slice(i), 0]);
    return out;
  }
  function tata(ctx, s) {
    var f = ctx.font, al = ctx.textAlign, bl = ctx.textBaseline;
    var mm = /(\d+(?:\.\d+)?)px/.exec(f), px = mm ? parseFloat(mm[1]) : 10;
    var kecil = f.replace(/\d+(?:\.\d+)?px/, Math.max(px * 0.72, Math.min(px, 8)).toFixed(2) + 'px');
    var dyA = -ukur.call(ctx, 'x').alphabeticBaseline;          // garis dasar alfabetik relatif ke y
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    var W = 0, pot = potong(s).map(function (p) {
      ctx.font = p[1] ? kecil : f;
      var m = ukur.call(ctx, p[0]);
      var o = { t: p[0], font: ctx.font, x: W, g: p[1] === 1 ? 0.22 * px : (p[1] === -1 ? -0.38 * px : 0), m: m };
      W += m.width; return o;
    });
    ctx.font = f; ctx.textAlign = al; ctx.textBaseline = bl;
    var s0 = al === 'center' ? -W / 2 : ((al === 'right' || al === 'end') ? -W : 0);
    return { pot: pot, W: W, s0: s0, dyA: dyA };
  }
  function gambar(ctx, s, x, y, w, asli) {
    var t = tata(ctx, s), f = ctx.font, al = ctx.textAlign, bl = ctx.textBaseline;
    var k = (typeof w === 'number' && w > 0 && t.W > w) ? w / t.W : 1;   // maxWidth: dipadatkan merata
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    for (var i = 0; i < t.pot.length; i++) {
      var p = t.pot[i]; ctx.font = p.font;
      if (k === 1) asli.call(ctx, p.t, x + t.s0 * k + p.x, y + t.dyA + p.g);
      else asli.call(ctx, p.t, x + (t.s0 + p.x) * k, y + t.dyA + p.g, Math.max(1, p.m.width * k));
    }
    ctx.font = f; ctx.textAlign = al; ctx.textBaseline = bl;
  }
  function ukurRumus(ctx, s) {
    var t = tata(ctx, s), kiri = Infinity, kanan = -Infinity, naik = -Infinity, turun = -Infinity;
    for (var i = 0; i < t.pot.length; i++) {
      var p = t.pot[i];
      kiri = Math.min(kiri, t.s0 + p.x - p.m.actualBoundingBoxLeft); kanan = Math.max(kanan, t.s0 + p.x + p.m.actualBoundingBoxRight);
      naik = Math.max(naik, p.m.actualBoundingBoxAscent - p.g - t.dyA); turun = Math.max(turun, p.m.actualBoundingBoxDescent + p.g + t.dyA);
    }
    var b = t.pot.length ? t.pot[0].m : {};
    return { width: t.W, actualBoundingBoxLeft: -kiri, actualBoundingBoxRight: kanan, actualBoundingBoxAscent: naik,
      actualBoundingBoxDescent: turun, fontBoundingBoxAscent: b.fontBoundingBoxAscent, fontBoundingBoxDescent: b.fontBoundingBoxDescent };
  }
  P.fillText = function (t, x, y, w) {
    if (ada(t)) return gambar(this, t, x, y, w, isi);
    return arguments.length > 3 ? isi.call(this, t, x, y, w) : isi.call(this, t, x, y);
  };
  P.strokeText = function (t, x, y, w) {
    if (ada(t)) return gambar(this, t, x, y, w, garis);
    return arguments.length > 3 ? garis.call(this, t, x, y, w) : garis.call(this, t, x, y);
  };
  P.measureText = function (t) { return ada(t) ? ukurRumus(this, t) : ukur.call(this, t); };
  P.__notasiKanvas = 1;
})();`;
export const BLOK_KANVAS = `<!-- NOTASI-KANVAS:START v${VERSI_KANVAS} -->\n<script>\n${SKRIP_KANVAS}\n</script>\n<!-- NOTASI-KANVAS:END v${VERSI_KANVAS} -->`;
const RX_BLOK = /<!-- NOTASI-KANVAS:START v\d+ -->[\s\S]*?<!-- NOTASI-KANVAS:END v\d+ -->/;
const RX_AI = /<!-- AI-CHAT-AGENT:BEGIN[\s\S]*?<!-- AI-CHAT-AGENT:END[^>]*-->/;

const hitung = (s, t) => s.split(t).length - 1;

/** Pasang/segarkan blok NOTASI-KANVAS tepat sebelum </head> dokumen (bukan di dalam skrip). */
export function pasangKanvas(html) {
  if (RX_BLOK.test(html)) return html.replace(RX_BLOK, () => BLOK_KANVAS);
  const i = html.indexOf("</head>");
  if (i < 0) throw new Error("</head> tidak ditemukan");
  const sebelum = html.slice(0, i);
  if (hitung(sebelum, "<script") !== hitung(sebelum, "</script>")) throw new Error("</head> pertama berada di dalam <script>");
  return `${sebelum}${BLOK_KANVAS}\n${html.slice(i)}`;
}

// ── Struktur tampilan sesudah pasangan ──────────────────────────────────────────────────────────
// (a) Opsi PG/jajak (.radio-option/.p-opt) dan tautan #modulSubnav adalah display:flex: tiap elemen anak
//     (<sub>, <sup>, <code>, <strong>, KaTeX) menjadi flex item sendiri — subskrip tidak turun, ada celah
//     10–12 px di tengah rumus, dan di layar sempit teks opsi terpotong. Isi yang memuat elemen/KaTeX
//     dibungkus satu <span class="opsi-teks"> (sama dengan pustaka.opsi_teks TTL/CAD; textContent tetap).
//     Pasangan data dicocokkan pada bentuk TANPA pembungkus (dilepas dulu, dipasang lagi sesudahnya),
//     jadi jangkarnya tidak bergantung pada pembungkus.
// (b) Tombol/label pemilih animasi yang menandai pilihan aktif dengan menulis ulang textContent
//     (`btn.textContent = active ? (btn.textContent.replace(' ✓','') + ' ✓') : …`) meratakan <sup> dan
//     KaTeX labelnya (e<sup>−x/3</sup> → "e−x/3"); diganti penanda ✓ sebagai simpul teks terakhir saja.
export const BUKA_OPSI = '<span class="opsi-teks">';
const TUTUP_OPSI = "</span>";
const RX_OPSI = /(<div class="(?:radio-option|p-opt)"[^>\n]*><div class="(?:radio|p)-circle"><\/div>)((?:(?!<\/?div\b)[^\n])*?)(<\/div>)/g;
const RX_SUBNAV = /(<div id="modulSubnav"[^>]*>)([\s\S]*?)(<\/div>)/g;
const RX_SUBNAV_A = /(<a\b[^>]*>)([\s\S]*?)(<\/a>)/g;
const perluBungkus = (isi) => isi.includes("<") || isi.includes("\\(");
const terbungkus = (isi) => isi.startsWith(BUKA_OPSI) && isi.endsWith(TUTUP_OPSI);
const RX_SKRIP = /<script\b[\s\S]*?<\/script>/gi;
/** Terapkan fn hanya pada bagian di luar <script>…</script>. */
function diLuarSkrip(html, fn) {
  let out = "", pos = 0;
  for (const m of html.matchAll(RX_SKRIP)) { out += fn(html.slice(pos, m.index)) + m[0]; pos = m.index + m[0].length; }
  return out + fn(html.slice(pos));
}
function petakanIsi(html, ubah) {
  return diLuarSkrip(html, (s) => s
    .replace(RX_OPSI, (m, a, isi, z) => a + ubah(isi) + z)
    .replace(RX_SUBNAV, (m, a, isi, z) => a + isi.replace(RX_SUBNAV_A, (m2, a2, isi2, z2) => a2 + ubah(isi2) + z2) + z));
}
/** Lepas pembungkus opsi-teks (bentuk tempat pasangan data dicocokkan). */
export function lepasBungkus(html) {
  return petakanIsi(html, (isi) => (terbungkus(isi) ? isi.slice(BUKA_OPSI.length, -TUTUP_OPSI.length) : isi));
}
/** Bungkus isi opsi/tautan subnav yang memuat elemen atau KaTeX. */
export function bungkus(html) {
  return petakanIsi(html, (isi) => (perluBungkus(isi) && !terbungkus(isi) ? BUKA_OPSI + isi + TUTUP_OPSI : isi));
}
const RX_CENTANG = /^([ \t]*)(\w+)\.textContent = active \? \(\2\.textContent\.replace\(' ✓',''\)((?:\.replace\(' ✗',''\))?) \+ ' ✓'\) : \2\.textContent\.replace\(' ✓',''\)\3;[ \t]*$/gm;
/** Penanda ✓ pilihan aktif tanpa menulis ulang textContent (pangkat dan KaTeX label tetap). */
export function centang(html) {
  return html.replace(RX_CENTANG, (m, ind, el, silang) =>
    `${ind}(function (el, aktif) { var t = el.lastChild; if (t && t.nodeType === 3 && ${silang ? "/ [✓✗]$/" : "/ ✓$/"}.test(t.nodeValue)) { t.nodeValue = t.nodeValue.slice(0, -2); if (!t.nodeValue) el.removeChild(t); } if (aktif) el.appendChild(document.createTextNode(' ✓')); })(${el}, active);   // notasi-halaman.mjs: ✓ tanpa menulis ulang textContent`);
}

/** Terapkan pasangan pada satu halaman: {html, dipasang, sudah, ditolak[]} */
export function terapkan(html, pasangan) {
  let out = html, dipasang = 0, sudah = 0;
  const ditolak = [];
  for (const [lama, baru] of pasangan) {
    const nL = hitung(out, lama), nB = hitung(out, baru);
    if (nL === 1 && nB === 0) { out = out.replace(lama, () => baru); dipasang += 1; }
    else if (nL === 0 && nB === 1) sudah += 1;
    else ditolak.push(`jangkar lama ${nL}×, baru ${nB}×: ${JSON.stringify(lama.slice(0, 80))}`);
  }
  return { html: out, dipasang, sudah, ditolak };
}

/** Pasangan per halaman (urutan grup data), termasuk halaman `kanvas` tanpa pasangan: Map rel → [[lama, baru], …]. */
export function pasanganPerHalaman(data = DATA) {
  const perHalaman = new Map();
  for (const g of data.grup) {
    for (const rel of g.halaman) {
      if (!perHalaman.has(rel)) perHalaman.set(rel, []);
      perHalaman.get(rel).push(...g.ganti);
    }
  }
  for (const rel of data.kanvas) if (!perHalaman.has(rel)) perHalaman.set(rel, []);
  return perHalaman;
}

/**
 * Keluaran injector untuk seluruh data tanpa menulis apa pun: {berubah: [[rel, berkas, html]], salah: [], rekap, jumlah}.
 * Halaman yang `berubah` belum memuat pasangan/struktur/blok kanvasnya; `salah` = jangkar yang ditolak (hilang, ganda,
 * atau lama dan baru sama-sama ada), berkas yang tidak ada, atau blok AI-CHAT-AGENT yang berubah. Dipakai `--periksa` dan
 * validate-public-security.mjs (label tulisan tangan yang dikembalikan ke KaTeX — "10 Soal · @2", "Terminal — ttl" —
 * tidak ditolak periksa-katex/periksa-notasi, hanya oleh jangkar ini). `hanya` membatasi halaman, `baca(rel, berkas)`
 * menggantikan pembacaan berkas (uji mutasi validator).
 */
export function rencanaNotasi({ akar = root, data = DATA, hanya = null, baca = null } = {}) {
  const perHalaman = pasanganPerHalaman(data);
  const kanvas = new Set(data.kanvas);
  const berubah = [], salah = [];
  const rekap = { pasangan: 0, kanvas: 0, struktur: 0 };
  let jumlah = 0;
  for (const [rel, pasangan] of [...perHalaman].sort()) {
    if (hanya && !hanya.includes(rel)) continue;
    jumlah += 1;
    const f = path.join(akar, rel);
    if (!baca && !fs.existsSync(f)) { salah.push(`${rel}: berkas tidak ada`); continue; }
    const asli = baca ? baca(rel, f) : fs.readFileSync(f, "utf8");
    const polos = lepasBungkus(asli);
    const r = terapkan(polos, pasangan);
    if (r.ditolak.length) { salah.push(...r.ditolak.map((d) => `${rel}: ${d}`)); continue; }
    let html = centang(bungkus(r.html));
    if (centang(bungkus(polos)) !== asli) rekap.struktur += 1;     // pembungkus opsi / penanda ✓ yang belum terpasang
    if (kanvas.has(rel)) {
      const k = pasangKanvas(html);
      if (k !== html) rekap.kanvas += 1;
      html = k;
    }
    const ai0 = asli.match(RX_AI), ai1 = html.match(RX_AI);
    if ((ai0 && ai0[0]) !== (ai1 && ai1[0])) { salah.push(`${rel}: blok AI-CHAT-AGENT berubah`); continue; }
    rekap.pasangan += r.dipasang;
    if (html !== asli) berubah.push([rel, f, html]);
  }
  return { berubah, salah, rekap, jumlah };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { berubah, salah, rekap, jumlah } = rencanaNotasi();
  const hasil = berubah.map(([, f, html]) => [f, html]);
  if (salah.length) {
    for (const s of salah) console.error(`DITOLAK ${s}`);
    console.error(`${salah.length} jangkar/halaman ditolak; tidak ada berkas yang ditulis.`);
    process.exit(1);
  }
  if (!periksa) for (const [f, html] of hasil) fs.writeFileSync(f, html);
  console.log(`${hasil.length} dari ${jumlah} halaman ${periksa ? "akan diperbarui" : "diperbarui"}: ${JSON.stringify(rekap)}`);
  if (periksa && hasil.length > 0) process.exitCode = 1;
}
