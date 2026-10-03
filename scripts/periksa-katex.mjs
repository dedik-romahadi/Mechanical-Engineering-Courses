#!/usr/bin/env node
// Pemeriksa rumus KaTeX di halaman modul dan ujian (Pedoman §2 butir (20) dan §17.1; dipakai
// validate-public-security.mjs). Laporan dosen 3 Oktober 2026 (lanjutan notasi rumus): banyak rumus KaTeX
// tampil salah tanpa galat merah — kata miring seperti perkalian huruf, Laplace L{…} yang kurawalnya hilang,
// % yang menelan sisa rumus, akar yang hanya menaungi "(" — sehingga pemeriksaan galat saja tidak cukup.
//
// Segmen diambil seperti auto-render KaTeX halaman (renderMathInElement(document.body), pembatas $$ … $$,
// \( … \), \[ … \]; abaikan script/noscript/style/textarea/pre/code/option dan kelas ff/float-formulas),
// per simpul teks, sesudah entitas HTML diurai. Yang ditolak:
//   1. % polos di dalam rumus — bagi TeX itu komentar, jadi sisa rumus hilang ("± 20%" tampil "± 20"); tulis \%;
//   2. Laplace dengan kurawal biasa (L{f(t)}, \mathcal{L}^{-1}{F(s)}, ℒ{u(t)}) — kurawal hanya pengelompok
//      dan tidak tampil; tulis \mathcal{L}\{…\};
//   3. akar terpotong: \sqrt( … (hanya "(" yang di bawah akar), isi \sqrt{…} yang kurungnya tidak seimbang
//      ("\sqrt{(k_1+k_3}/m"), atau √ Unicode di dalam rumus (tidak menaungi apa pun); tulis \sqrt{…};
//   4. kata ≥ 4 huruf di mode matematika tanpa \text{…}/\mathrm{…}/\operatorname{…} — tampil miring dan
//      dibaca sebagai perkalian huruf ("Orde = 2" → O·r·d·e); subskrip/superskrip berkurawal (k_{aman}) sah;
//   5. kurawal { } yang tidak seimbang (KaTeX gagal mengurai dan menampilkan TeX merah);
//   6. TeX mentah di teks tampil: pembatas yang tidak tertutup dalam satu simpul teks ("\(x = 2" lalu tag lain)
//      atau perintah TeX di luar rumus ("\cdot", "\frac") — tampil apa adanya.
// Dengan --katex <folder paket katex> setiap segmen juga dirender (throwOnError) dan galatnya dilaporkan
// ("galat KaTeX", sama dengan .katex-error di peramban). Repo publik ini tanpa node_modules, jadi CI menjalankan
// aturan statis 1–6 saja; render dijalankan saat memeriksa perubahan secara lokal.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { halamanNotasi } from "./periksa-notasi.mjs";

// Course yang rumusnya sudah dirapikan dan dijaga. Teknik Tenaga Listrik menyusul bersama fase D rencana
// perbaikan KaTeX (generator pustaka.py: akronim SAIFI/SAIDI miring, label "C · Komp" UTS/UAS, judul sel
// test_setup.ipynb Modul 1); Pemodelan CAD sudah lolos aturan ini.
export const KURSUS_KATEX = ["Engineering-Mathematics", "Getaran-Mekanik", "Optimalisasi-dan-Automasi", "Sistem-Kendali-Cerdas",
  "Pemodelan-Computer-Aided-Design"];
export const halamanKatex = halamanNotasi;

const ENTITAS = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0", middot: "·", mdash: "—", ndash: "–", minus: "−",
  times: "×", deg: "°", infin: "∞", rarr: "→", rArr: "⇒", asymp: "≈", sup2: "²", sup3: "³", oslash: "ø", ge: "≥", le: "≤", ne: "≠",
  radic: "√", plusmn: "±", part: "∂", sum: "∑", frac12: "½", uuml: "ü", rdquo: "”", ldquo: "“", hellip: "…",
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", Delta: "Δ", epsilon: "ε", zeta: "ζ", eta: "η", theta: "θ", lambda: "λ", mu: "μ",
  pi: "π", rho: "ρ", sigma: "σ", Sigma: "Σ", tau: "τ", phi: "φ", Phi: "Φ", omega: "ω", Omega: "Ω" };
const urai = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[A-Za-z][A-Za-z0-9]*);/gi, (m, e) =>
  e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : (ENTITAS[e] ?? m));

// Elemen yang dilewati auto-render KaTeX (ignoredTags bawaan + kelas ignoredClasses halaman).
const ABAI_TAG = ["script", "noscript", "style", "textarea", "pre", "code", "option", "template"];
const ABAI_KELAS = ["ff", "float-formulas"];

/** Indeks sesudah penutup elemen bernama `tag` yang dibuka di `i` (penghitung bersarang sederhana). */
function ujungElemen(html, i, tag) {
  const rx = new RegExp(`<(/?)${tag}\\b[^>]*>`, "gi");
  rx.lastIndex = i;
  let d = 0, m;
  while ((m = rx.exec(html))) {
    if (m[1]) { d -= 1; if (d === 0) return m.index + m[0].length; } else if (!m[0].endsWith("/>")) d += 1;
  }
  return html.length;
}

/** Ganti isi bagian yang dilewati auto-render dengan spasi (baris dipertahankan, offset tetap). */
function kosongkanAbaian(html) {
  const kosong = (s) => s.replace(/[^\n]/g, " ");
  let out = html.replace(/<!--[\s\S]*?-->/g, kosong);
  const rxBuka = /<([A-Za-z][\w-]*)\b([^>]*)>/g;
  let m;
  while ((m = rxBuka.exec(out))) {
    const tag = m[1].toLowerCase();
    const kelas = (/\bclass\s*=\s*"([^"]*)"/i.exec(m[2]) || [])[1] || "";
    const abaiKelas = kelas.split(/\s+/).some((k) => ABAI_KELAS.includes(k));
    if (!ABAI_TAG.includes(tag) && !abaiKelas) continue;
    let akhir;
    if (tag === "option") {                                  // </option> boleh tidak ditulis
      const rx = /<\/option\s*>|<option\b|<\/select\s*>|<\/datalist\s*>/gi;
      rx.lastIndex = m.index + m[0].length;
      const t = rx.exec(out);
      akhir = t ? (t[0].startsWith("</option") ? t.index + t[0].length : t.index) : out.length;
    } else if (["script", "style", "textarea", "noscript", "template"].includes(tag)) {
      const i = out.toLowerCase().indexOf(`</${tag}`, m.index + m[0].length);
      akhir = i < 0 ? out.length : out.indexOf(">", i) + 1;
    } else akhir = ujungElemen(out, m.index, tag);
    out = out.slice(0, m.index) + kosong(out.slice(m.index, akhir)) + out.slice(akhir);
    rxBuka.lastIndex = akhir;
  }
  return out;
}

// Pemecah pembatas auto-render KaTeX 0.16.9 (splitAtDelimiters): kurawal di dalam rumus dihitung.
const PEMBATAS = [["$$", "$$", true], ["\\(", "\\)", false], ["\\[", "\\]", true]];
function ujungRumus(kanan, teks, mulai) {
  let i = mulai, kurawal = 0;
  while (i < teks.length) {
    const c = teks[i];
    if (kurawal <= 0 && teks.startsWith(kanan, i)) return i;
    if (c === "\\") i += 1; else if (c === "{") kurawal += 1; else if (c === "}") kurawal -= 1;
    i += 1;
  }
  return -1;
}
export function pecahPembatas(teks) {
  const hasil = [];
  let pos = 0;
  while (pos < teks.length) {
    let kiri = -1, d = null;
    for (const p of PEMBATAS) { const k = teks.indexOf(p[0], pos); if (k >= 0 && (kiri < 0 || k < kiri)) { kiri = k; d = p; } }
    if (kiri < 0) break;
    if (kiri > pos) hasil.push({ jenis: "teks", isi: teks.slice(pos, kiri), off: pos });
    const akhir = ujungRumus(d[1], teks, kiri + d[0].length);
    if (akhir < 0) { hasil.push({ jenis: "teks", isi: teks.slice(kiri), off: kiri, terbuka: d[0] }); pos = teks.length; break; }
    hasil.push({ jenis: "rumus", isi: teks.slice(kiri + d[0].length, akhir), off: kiri, tampil: d[2], mentah: teks.slice(kiri, akhir + d[1].length) });
    pos = akhir + d[1].length;
  }
  if (pos < teks.length) hasil.push({ jenis: "teks", isi: teks.slice(pos), off: pos });
  return hasil;
}

/** Bagian tampil halaman (urut sumber): [{jenis:'rumus'|'teks', isi, baris, tampil, terbuka}]. */
export function bagianKatex(html) {
  const awal = Math.max(0, html.search(/<body\b/i));
  const bersih = kosongkanAbaian(html);
  const hasil = [];
  const rxTag = /<[A-Za-z!/?][^>]*>/g;
  let pos = awal, m;
  const barisDi = (() => { const ls = [0]; for (let i = 0; i < html.length; i++) if (html[i] === "\n") ls.push(i + 1);
    return (p) => { let lo = 0, hi = ls.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (ls[mid] <= p) lo = mid; else hi = mid - 1; } return lo + 1; }; })();
  const simpul = (a, b) => {
    const mentah = bersih.slice(a, b);
    if (!/\S/.test(mentah)) return;
    const teks = urai(mentah);
    const b0 = barisDi(a);
    for (const p of pecahPembatas(teks)) hasil.push({ ...p, baris: b0 + (teks.slice(0, p.off).match(/\n/g) || []).length });
  };
  rxTag.lastIndex = awal;
  while ((m = rxTag.exec(bersih))) { simpul(pos, m.index); pos = m.index + m[0].length; }
  simpul(pos, bersih.length);
  return hasil;
}

const TEKS_TEGAK = /\\(?:text|textrm|textbf|textit|textsf|texttt|textup|mathrm|mathbf|mathit|mathsf|mathtt|operatorname\*?|mbox|hbox)\s*\{[^{}]*\}/g;
function kurawalSeimbang(t) {
  let d = 0;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === "\\") { i += 1; continue; }
    if (t[i] === "{") d += 1; else if (t[i] === "}") { d -= 1; if (d < 0) return false; }
  }
  return d === 0;
}
function akarTerpotong(t) {
  if (/\\sqrt\s*\(/.test(t)) return "\\sqrt(";
  if (t.includes("√")) return "√";
  for (const m of t.matchAll(/\\sqrt\s*(?:\[[^\]]*\]\s*)?\{/g)) {
    let i = m.index + m[0].length, d = 1, isi = "";
    while (i < t.length && d) { if (t[i] === "\\") { isi += t.slice(i, i + 2); i += 2; continue; } if (t[i] === "{") d += 1; else if (t[i] === "}") d -= 1; if (d) isi += t[i]; i += 1; }
    if ((isi.match(/\(/g) || []).length !== (isi.match(/\)/g) || []).length) return `\\sqrt{${isi}}`;
  }
  return null;
}
function kataMiring(t) {
  let s = t.replace(TEKS_TEGAK, " ").replace(/\\(?:begin|end)\s*\{[^{}]*\}/g, " ").replace(/\\[A-Za-z]+/g, " ");
  for (let i = 0; i < 3; i++) s = s.replace(/[_^]\s*\{[^{}]*\}/g, " ");
  const m = /(?<![A-Za-z])[A-Za-z]{4,}(?![A-Za-z])/.exec(s);
  return m ? m[0] : null;
}

/** Daftar pelanggaran KaTeX pada satu halaman: [{baris, jenis, teks}]. `render` opsional: (tex, tampil) → pesan galat|null. */
export function periksaKatex(html, render = null) {
  const hasil = [];
  const catat = (p, jenis, teks) => hasil.push({ baris: p.baris, jenis, teks: String(teks).replace(/\s+/g, " ").slice(0, 100) });
  for (const p of bagianKatex(html)) {
    if (p.jenis === "teks") {
      if (p.terbuka) catat(p, `pembatas ${p.terbuka} tanpa penutup di simpul teks yang sama (TeX tampil mentah)`, p.isi);
      else { const m = /\\(?:[A-Za-z]{2,}|[()[\]])/.exec(p.isi); if (m) catat(p, `TeX mentah di teks tampil (${m[0]})`, p.isi.slice(Math.max(0, m.index - 30), m.index + 40)); }
      continue;
    }
    const t = p.isi;
    if (/(^|[^\\])%/.test(t)) catat(p, "% polos di rumus (komentar TeX: sisa rumus hilang; tulis \\%)", p.mentah);
    if (/(^|[^A-Za-z\\])(?:L|\\mathcal\s*\{L\}|ℒ)(?:\^\{?-1\}?)?\s*\{/.test(t)) catat(p, "Laplace dengan kurawal biasa (tidak tampil; tulis \\mathcal{L}\\{…\\})", p.mentah);
    const akar = akarTerpotong(t);
    if (akar) catat(p, `akar terpotong (${akar.slice(0, 40)}; tulis \\sqrt{…} utuh)`, p.mentah);
    const kata = kataMiring(t);
    if (kata) catat(p, `kata "${kata}" miring di mode matematika (tulis \\text{…})`, p.mentah);
    if (!kurawalSeimbang(t)) catat(p, "kurawal { } tidak seimbang", p.mentah);
    if (render) { const g = render(t, p.tampil); if (g) catat(p, `galat KaTeX: ${g}`, p.mentah); }
  }
  return hasil;
}

/** Perender KaTeX opsional dari folder paket katex (mis. node_modules/katex): (tex, tampil) → pesan galat|null. */
export function buatRender(folderKatex) {
  const katex = createRequire(import.meta.url)(path.resolve(folderKatex));
  return (tex, tampil) => {
    const warn = console.warn;
    console.warn = () => {};          // "No character metrics for '½'": fon cadangan, bukan galat (halaman: strict false)
    try { katex.renderToString(tex, { displayMode: tampil, throwOnError: true, strict: false }); return null; }
    catch (e) { return String(e.message || e).replace(/^KaTeX parse error: /, "").slice(0, 120); }
    finally { console.warn = warn; }
  };
}

/** Uji mutasi: pemeriksa harus menolak rumus yang tampil salah dan menerima bentuk yang benar. */
export function ujiMutasiKatex(halamanBersih, relative) {
  if (periksaKatex(halamanBersih).length) throw new Error(`${relative}: KaTeX mutation test needs a clean page`);
  const akhir = halamanBersih.lastIndexOf("</body>");
  if (akhir < 0) throw new Error(`${relative}: KaTeX mutation test needs </body>`);
  const sisip = (potongan) => halamanBersih.slice(0, akhir) + potongan + "\n" + halamanBersih.slice(akhir);
  const tolak = [
    ["% polos", "<p>\\(\\omega_{op} \\ne \\omega_n \\pm 20%\\)</p>"],
    ["Laplace L{…}", "<p>\\(L{f(t)} = F(s)\\)</p>"],
    ["invers Laplace \\mathcal{L}^{-1}{…}", "<p>\\(\\mathcal{L}^{-1}{F(s)} = f(t)\\)</p>"],
    ["Laplace ℒ{…}", "<p>\\(ℒ{u(t-a)} = e^{-as}/s\\)</p>"],
    ["akar terpotong di tengah kurung", "<div class=\"formula\">\\(\\sqrt{(k_1+k_3}/m\\)</div>"],
    ["akar tanpa kurawal", "<p>\\(v = \\sqrt(2gh)\\)</p>"],
    ["akar Unicode di rumus", "<p>\\(\\omega = √(k/m)\\)</p>"],
    ["kata miring", "<p>\\(Orde = 2, Derajat = 1\\)</p>"],
    ["kata miring berentitas", "<p>\\(Health&nbsp;Index = f(x)\\)</p>"],
    ["kurawal tutup berlebih", "<p>\\(x = a_{1}} + b\\)</p>"],
    ["kurawal tak tertutup (auto-render tidak menemukan penutup)", "<p>\\(x = \\frac{a}{b\\)</p>"],
    ["pembatas tanpa penutup", "<p>Hasil \\(x = <strong>2</strong>\\)</p>"],
    ["perintah TeX di teks", "<p>Gaya F = m \\cdot a</p>"],
    ["rumus tampilan dengan % polos", "<div>$$P = 50%$$</div>"],
  ];
  for (const [nama, potongan] of tolak) {
    if (!periksaKatex(sisip(potongan)).length) throw new Error(`${relative}: KaTeX check accepted a mutated page (${nama})`);
  }
  const terima = [
    ["Laplace benar", "<p>\\(\\mathcal{L}\\{f(t)\\} = F(s)\\), \\(\\mathcal{L}^{-1}\\{F(s)\\} = f(t)\\)</p>"],
    ["persen ter-escape", "<p>\\(\\omega_{op} \\ne \\omega_n \\pm 20\\%\\)</p>"],
    ["akar utuh", "<div class=\"formula\">\\(\\sqrt{(k_1+k_3)/m}\\), \\(\\sqrt[3]{x}\\)</div>"],
    ["kata tegak dan subskrip kata", "<p>\\(\\text{Orde} = 2\\), \\(k_{aman} = 0{,}071\\), \\(\\operatorname{Re}(s)\\), \\(\\mathrm{SIL}\\)</p>"],
    ["kode dan pre tidak dirender", "<p><code>\\(L{f}\\) 20%</code></p><pre>\\cdot \\frac</pre>"],
    ["rumus melayang ff", "<div class=\"float-formulas\"><span class=\"ff\">L{f} \\cdot</span></div>"],
    ["opsi select", "<select><option>\\(L{f}\\)<option>√(g/L)</select>"],
    ["himpunan", "<p>\\(\\{x \\mid x > 0\\}\\) dan \\(\\begin{bmatrix} a & b \\end{bmatrix}\\)</p>"],
  ];
  for (const [nama, potongan] of terima) {
    const sisa = periksaKatex(sisip(potongan));
    if (sisa.length) throw new Error(`${relative}: KaTeX check rejected a valid page (${nama}): ${sisa[0].jenis} — ${sisa[0].teks}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.cwd();
  const args = process.argv.slice(2);
  const rinci = args.includes("--rinci");
  const iK = args.indexOf("--katex");
  const render = iK >= 0 ? buatRender(args[iK + 1]) : null;
  const kursus = args.filter((a, i) => !a.startsWith("--") && !(iK >= 0 && i === iK + 1));
  let total = 0, jumlah = 0, segmen = 0;
  for (const k of kursus.length ? kursus : KURSUS_KATEX) {
    for (const rel of halamanKatex(root, k)) {
      const html = fs.readFileSync(path.join(root, rel), "utf8");
      const h = periksaKatex(html, render);
      segmen += bagianKatex(html).filter((p) => p.jenis === "rumus").length;
      total += h.length;
      jumlah += 1;
      if (h.length) console.log(`${rel.replace(/\\/g, "/")}: ${h.length} pelanggaran KaTeX`);
      if (rinci) for (const x of h) console.log(`  baris ${x.baris}: ${x.jenis} — ${x.teks}`);
    }
  }
  console.log(`${total} pelanggaran KaTeX di ${jumlah} halaman (${segmen} segmen rumus${render ? ", dirender" : ""})`);
  process.exit(total ? 1 : 0);
}
