#!/usr/bin/env node
// Pemeriksa notasi rumus di halaman modul dan ujian (Pedoman §2 dan §17.1; dipakai validate-public-security.mjs).
//
// Notasi rumus di teks yang DIRENDER untuk mahasiswa ditulis sebagai subskrip/superskrip sungguhan:
// <sub>/<sup> di HTML, <tspan> di SVG (pustaka.py rumus_svg, sisken-ilustrasi.mjs rumusSvg), helper
// kanvas _ttlRumus/_ttlRumusKtx (animasi/dasar.js TTL/CAD) atau blok NOTASI-KANVAS
// (scripts/notasi-halaman.mjs, course lain dan halaman ujian) untuk fillText. Garis bawah mentah seperti
// "V_k = V · R_k / R_seri" tampil apa adanya di <text> SVG dan di kanvas — laporan dosen 3 Oktober 2026
// (TTL Modul 3, Gambar 2). Yang ditolak:
//   1. <text> SVG yang memuat notasi bergaris bawah (X_k, R_seri, σ_maks) atau pangkat ^ mentah,
//      kecuali <text data-kode="1"> (kode/alias Spreadsheet yang memang diketik: pustaka.Kode);
//   2. penanda <sub>/<sup> yang tertinggal di dalam <text> SVG (SVG tidak mengenalnya);
//   3. literal string argumen pertama fillText/strokeText/_ttlTeks/_ttlLabel, argumen kedua
//      _ttlTulis/_siskenLegenda, dan teks _siskenBawah yang memuat notasi bergaris bawah atau pangkat ^,
//      kecuali baris bertanda "// notasi: kode" (alias/parameter yang diketik);
//   4. literal kanvas berpenanda <sub>/<sup> di halaman tanpa helper kanvas (penanda tampil mentah);
//   5. segmen KaTeX \( … \) yang terpecah lintas simpul teks (mis. <sub> atau "<" telanjang masuk ke
//      dalamnya), karena auto-render hanya mencari pembatas di dalam satu simpul teks.
// Teks HTML biasa tidak diperiksa di sini (notasi di <code>/<pre>/KaTeX sah, dan nama parameter kode
// seperti n_estimators boleh tampil); generator TTL/CAD/Sisken dan notasi-halaman.mjs menjaganya.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Course yang notasinya sudah dirapikan dan dijaga (folder di root repo): seluruh enam course.
export const KURSUS_NOTASI = ["Teknik-Tenaga-Listrik", "Pemodelan-Computer-Aided-Design", "Getaran-Mekanik",
  "Engineering-Mathematics", "Optimalisasi-dan-Automasi", "Sistem-Kendali-Cerdas"];

/** Halaman yang diperiksa per course: Modul/Modul-1..14.html lalu Exam/UTS.html dan Exam/UAS.html. */
export function halamanNotasi(root, course) {
  const dir = path.join(root, course, "Modul");
  const modul = fs.readdirSync(dir).filter((n) => /^Modul-\d+\.html$/.test(n))
    .sort((a, b) => parseInt(a.slice(6), 10) - parseInt(b.slice(6), 10))
    .map((n) => path.join(course, "Modul", n));
  const ujian = ["UTS.html", "UAS.html"].map((n) => path.join(course, "Exam", n)).filter((r) => fs.existsSync(path.join(root, r)));
  return [...modul, ...ujian];
}

const HURUF = "A-Za-zΑ-Ωα-ω";
export const RX_SUB = new RegExp(`(?<![A-Za-z0-9_$@.\\\\-])[${HURUF}ΔΣ″′]*[${HURUF}″′]_[${HURUF}0-9φ{(]`, "u");
export const RX_SUP = /[A-Za-z0-9)α-ω]\^(?:\(|\{|[0-9A-Za-z−-])/u;

const ENTITAS = { amp: "&", lt: "<", gt: ">", quot: '"', nbsp: " ", minus: "−", sigma: "σ", delta: "δ", tau: "τ", rho: "ρ", eta: "η", omega: "ω", phi: "φ", theta: "θ", alpha: "α", beta: "β", gamma: "γ", mu: "μ", Delta: "Δ", Sigma: "Σ", Omega: "Ω" };
const lepasEntitas = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[A-Za-z]+);/gi, (m, e) =>
  e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : (ENTITAS[e] ?? m));
const baris = (s, i) => s.slice(0, i).split("\n").length;

function argumen(js, i) {
  // isi argumen mulai indeks i (tepat sesudah "(") sampai koma/tutup kurung tingkat teratas
  let d = 0, j = i;
  while (j < js.length) {
    const c = js[j];
    if (c === "'" || c === '"' || c === "`") {
      j += 1;
      while (j < js.length && js[j] !== c) { if (js[j] === "\\") j += 1; j += 1; }
    } else if (c === "(" || c === "[" || c === "{") d += 1;
    else if (c === ")" || c === "]" || c === "}") { if (d === 0) break; d -= 1; }
    else if (c === "," && d === 0) break;
    j += 1;
  }
  return [js.slice(i, j), j];
}
const literal = (teks) => [...teks.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)].map((m) => (m[1] ?? m[2] ?? m[3]).replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/\$\{[^}]*\}/g, " "));

/** Daftar pelanggaran notasi pada satu halaman: [{baris, jenis, teks}]. */
export function periksaNotasi(html) {
  const hasil = [];
  // 1–2. <text> SVG (di luar <script>)
  const tanpaSkrip = html.replace(/<script\b[\s\S]*?<\/script>/gi, (m) => m.replace(/[^\n]/g, " "));
  for (const m of tanpaSkrip.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)) {
    if (/\bdata-kode="1"/.test(m[1])) continue;
    if (/<su[bp]\b/.test(m[2])) hasil.push({ baris: baris(html, m.index), jenis: "penanda <sub>/<sup> di <text> SVG", teks: m[2].slice(0, 90) });
    const isi = lepasEntitas(m[2].replace(/<[^>]+>/g, ""));
    if (RX_SUB.test(isi) || RX_SUP.test(isi)) hasil.push({ baris: baris(html, m.index), jenis: "notasi mentah di <text> SVG", teks: isi.slice(0, 90) });
  }
  // 3–4. kanvas dan readout
  // helper TTL/CAD (_ttlRumusKtx di animasi/dasar.js) atau blok NOTASI-KANVAS (scripts/notasi-halaman.mjs)
  const adaHelper = /function _ttlRumusKtx\(/.test(html) || /<!-- NOTASI-KANVAS:START v\d+ -->/.test(html);
  for (const s of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    const js = s[1], awal = s.index + s[0].indexOf(js);
    for (const c of js.matchAll(/\b(fillText|strokeText|_ttlTeks|_ttlLabel|_ttlTulis|_siskenLegenda|_siskenBawah)\(/g)) {
      let [arg, j] = argumen(js, c.index + c[0].length);
      if (c[1] === "_ttlTeks" || c[1] === "_ttlLabel") [arg] = argumen(js, j + 1);            // (ctx, teks, …)
      else if (c[1] === "_ttlTulis" || c[1] === "_siskenLegenda") [arg] = argumen(js, j + 1); // (id, teks) · (x, [[teks, warna], …])
      else if (c[1] === "_siskenBawah") {                                                      // (x, s, kiri, kanan)
        const [, j2] = argumen(js, j + 1);
        const [kiri, j3] = argumen(js, j2 + 1);
        const [kanan] = js[j3] === "," ? argumen(js, j3 + 1) : [""];
        arg = `${kiri},${kanan}`;
      }
      const akhirBaris = js.indexOf("\n", c.index);
      if (/\/\/ notasi: kode/.test(js.slice(c.index, akhirBaris < 0 ? undefined : akhirBaris))) continue;
      for (const lit of literal(arg)) {
        const polos = lit.replace(/<\/?su[bp]>/g, "");
        if (RX_SUB.test(polos) || RX_SUP.test(polos) || /[A-Za-zΑ-Ωα-ω]_$/u.test(polos)) hasil.push({ baris: baris(html, awal + c.index), jenis: `notasi mentah di ${c[1]}`, teks: lit.slice(0, 90) });   // 'Z_'+lab: subskrip bersambung
        if (/<su[bp]>/.test(lit) && !adaHelper) hasil.push({ baris: baris(html, awal + c.index), jenis: `penanda <sub>/<sup> di ${c[1]} tanpa helper kanvas (_ttlRumusKtx/NOTASI-KANVAS)`, teks: lit.slice(0, 90) });
      }
    }
  }
  // 5. KaTeX terpecah lintas simpul teks
  const teks = html.replace(/<(script|style|pre|code|textarea|kbd|samp|title)\b[\s\S]*?<\/\1\s*>/gi, (m) => "<x>" + m.replace(/[^\n]/g, " ") + "<x>");
  let pos = 0;
  for (const simpul of teks.split(/<[A-Za-z!/][^>]*>/)) {   // seperti peramban: "<" + huruf membuka tag sampai ">"
    const b = (simpul.match(/\\\(/g) || []).length, t = (simpul.match(/\\\)/g) || []).length;
    if (b !== t) {
      const i = html.indexOf(simpul.trim().slice(0, 40), pos);
      hasil.push({ baris: i >= 0 ? baris(html, i) : 0, jenis: "segmen KaTeX \\( \\) terpecah lintas simpul teks", teks: simpul.trim().slice(0, 90) });
    }
    pos += simpul.length;
  }
  return hasil;
}

/**
 * Uji mutasi: pemeriksa harus menolak notasi mentah dan menerima pengecualian yang sah.
 * `halamanBersih` memakai helper _ttlRumusKtx (TTL/CAD); `halamanKanvas` (opsional) memakai blok
 * NOTASI-KANVAS (course lain) — tanpa blok itu penanda kanvas harus ditolak.
 */
export function ujiMutasiNotasi(halamanBersih, relative, halamanKanvas = null, relKanvas = "") {
  if (halamanKanvas !== null) {
    const rxBlok = /<!-- NOTASI-KANVAS:START v\d+ -->[\s\S]*?<!-- NOTASI-KANVAS:END v\d+ -->/;
    if (!rxBlok.test(halamanKanvas)) throw new Error(`${relKanvas}: notation mutation test needs a NOTASI-KANVAS page`);
    if (/function _ttlRumusKtx\(/.test(halamanKanvas)) throw new Error(`${relKanvas}: notation mutation test needs a page without _ttlRumusKtx`);
    if (periksaNotasi(halamanKanvas).length) throw new Error(`${relKanvas}: notation mutation test needs a clean page`);
    const ujung = halamanKanvas.lastIndexOf("</body>");
    const baris = "<script>\nfunction _ujiNotasi(ctx){\n  ctx.fillText('x<sub>A</sub> = 3', 4, 4);\n}\n</script>\n";
    const dengan = halamanKanvas.slice(0, ujung) + baris + halamanKanvas.slice(ujung);
    if (periksaNotasi(dengan).length) throw new Error(`${relKanvas}: notation check rejected canvas markers on a NOTASI-KANVAS page`);
    if (!periksaNotasi(dengan.replace(rxBlok, "")).length) throw new Error(`${relKanvas}: notation check accepted canvas markers without NOTASI-KANVAS`);
  }
  const awalSvg = halamanBersih.indexOf('<figure class="ilustrasi');
  if (awalSvg < 0) throw new Error(`${relative}: notation mutation test needs a figure`);
  if (periksaNotasi(halamanBersih).length) throw new Error(`${relative}: notation mutation test needs a clean page`);
  const sisip = (s, potongan) => s.slice(0, awalSvg) + potongan + s.slice(awalSvg);
  const akhir = halamanBersih.lastIndexOf("</body>");      // "</body>" pertama bisa berada di templat ekspor skrip
  const diAkhir = (potongan) => halamanBersih.slice(0, akhir) + potongan + halamanBersih.slice(akhir);
  const kanvas = (baris) => diAkhir(`<script>\nfunction _ujiNotasi(ctx){\n  ${baris}\n}\n</script>\n`);
  const tolak = [
    ["garis bawah mentah di <text> SVG", sisip(halamanBersih, '<svg viewBox="0 0 10 10"><text x="1" y="1">V_k = V · R_k / R_seri</text></svg>')],
    ["pangkat ^ mentah di <text> SVG", sisip(halamanBersih, '<svg viewBox="0 0 10 10"><text x="1" y="1">M = E^(1/3)/ρ</text></svg>')],
    ["entitas berbasis subskrip di <text> SVG", sisip(halamanBersih, '<svg viewBox="0 0 10 10"><text x="1" y="1">&sigma;_maks</text></svg>')],
    ["penanda <sub> tertinggal di <text> SVG", sisip(halamanBersih, '<svg viewBox="0 0 10 10"><text x="1" y="1">R<sub>L</sub></text></svg>')],
    ["fillText bergaris bawah", kanvas("ctx.fillText('R_L = r → P_maks', 10, 10);")],
    ["fillText bersambung", kanvas("ctx.fillText('Z_'+lab[i]+' '+z, 10, 10);")],
    ["_ttlTulis bergaris bawah", kanvas("_ttlTulis('info', 'V_th = '+v.toFixed(2));")],
    ["_ttlTeks bergaris bawah", kanvas("_ttlTeks(ctx, 'I_sc = '+i, 4, 4, 100);")],
    ["_siskenLegenda bergaris bawah", kanvas("_siskenLegenda(x,[['e_ss','#fbbf24']],s.pad,s.atas-13);")],
    ["_siskenBawah bergaris bawah", kanvas("_siskenBawah(x,s,'K_p naik','waktu →');")],
    ["fillText berpangkat ^", kanvas("ctx.fillText('y = e^(-at)', 4, 4);")],
    ["KaTeX dipecah <sub>", diAkhir("<p>Contoh \\(V<sub>1</sub> = 4\\) V.</p>")],
    ["KaTeX dengan < telanjang", diAkhir("<p>\\(\\sum_{k<i} Y_{ik}\\)</p>")],
  ];
  for (const [nama, salinan] of tolak) {
    if (!periksaNotasi(salinan).length) throw new Error(`${relative}: notation check accepted a mutated page (${nama})`);
  }
  const terima = [
    ["data-kode", sisip(halamanBersih, '<svg viewBox="0 0 10 10"><text x="1" y="1" data-kode="1">t_sigma = (6*F*L/(b*s_izin))^(1/2)</text></svg>')],
    ["tspan subskrip", sisip(halamanBersih, '<svg viewBox="0 0 10 10"><text x="1" y="1">V<tspan dy="2.4" font-size="8">k</tspan></text></svg>')],
    ["baris notasi: kode", kanvas("ctx.fillText('Spreadsheet r, h_r, d', 4, 4);   // notasi: kode")],
    ["penanda kanvas dengan helper", kanvas("ctx.fillText('R<sub>L</sub> = r', 4, 4);")],
    ["KaTeX utuh", diAkhir("<p>\\(V_1 = 4\\) dan \\(\\sum_{k \\lt i}\\)</p>")],
  ];
  for (const [nama, salinan] of terima) {
    const sisa = periksaNotasi(salinan);
    if (sisa.length) throw new Error(`${relative}: notation check rejected a valid page (${nama}): ${sisa[0].jenis} — ${sisa[0].teks}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.cwd();
  const rinci = process.argv.includes("--rinci");
  const kursus = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  let total = 0;
  let jumlah = 0;
  for (const k of kursus.length ? kursus : KURSUS_NOTASI) {
    for (const rel of halamanNotasi(root, k)) {
      const h = periksaNotasi(fs.readFileSync(path.join(root, rel), "utf8"));
      total += h.length;
      jumlah += 1;
      if (h.length) console.log(`${rel.replace(/\\/g, "/")}: ${h.length} pelanggaran notasi`);
      if (rinci) for (const x of h) console.log(`  baris ${x.baris}: ${x.jenis} — ${x.teks}`);
    }
  }
  console.log(`${total} pelanggaran notasi di ${jumlah} halaman`);
  process.exit(total ? 1 : 0);
}
