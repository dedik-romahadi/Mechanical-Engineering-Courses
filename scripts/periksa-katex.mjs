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
//   2. Laplace dengan kurawal biasa (L{f(t)}, \mathcal{L}^{-1}{F(s)}, \mathcal{L}_t{f(t)}, ℒ{u(t)}) — kurawal hanya
//      pengelompok dan tidak tampil; tulis \mathcal{L}\{…\};
//   3. akar terpotong: \sqrt( … (hanya "(" yang di bawah akar), isi \sqrt{…} yang kurungnya tidak seimbang
//      ("\sqrt{(k_1+k_3}/m"), atau √ Unicode di mode matematika (tidak menaungi apa pun); tulis \sqrt{…}. √ di
//      dalam \text{…} adalah teks biasa dan tampil benar;
//   4. kata ≥ 4 huruf di mode matematika tanpa \text{…}/\mathrm{…}/\operatorname{…} — tampil miring dan
//      dibaca sebagai perkalian huruf ("Orde = 2" → O·r·d·e); subskrip/superskrip berkurawal (k_{aman}) dan
//      diferensial berderet (dxdy, dudv) sah;
//   5. kurawal { } yang tidak seimbang (KaTeX gagal mengurai dan menampilkan TeX merah);
//   6. TeX mentah di teks tampil: pembatas yang tidak tertutup dalam satu simpul teks ("\(x = 2" lalu tag lain)
//      atau perintah TeX di luar rumus ("\cdot", "\frac") — tampil apa adanya. Jalur berkas Windows
//      (C:\Users\…, %APPDATA%\…, ~\…, \\server\…) bukan perintah TeX;
//   7. fungsi KaTeX sebagai pangkat/subskrip tanpa kurawal (e^\int P dx, x_\sqrt2, e^\sin x) — KaTeX menolaknya
//      ("Got function '\int' with no arguments as superscript") dan menampilkan TeX merah; tulis e^{\int P\,dx}.
//      \frac, \text, \mathrm, \mathbf … memang boleh tanpa kurawal (x_\text{max});
//   8. kode yang diketik di dalam rumus: garis bawah \_ (\text{motor\_1\_rms}) atau pemanggilan kosong
//      (\text{isnull()}, \text{solve\_lp}()) — kode ditulis <code>…</code> di luar KaTeX (keputusan dosen
//      3 Oktober 2026, Pedoman §2 butir (17));
//   9. en dash, em dash, atau ½ di mode matematika (0.1–0.15, ½ m v^2) — karakter teks tanpa metrik fon KaTeX;
//      tulis 0.1\text{–}0.15 dan \tfrac{1}{2} (di dalam \text{…} boleh);
//  10. (course berkoma desimal Indonesia, KURSUS_KOMA_DESIMAL) "angka,angka" tanpa spasi di mode matematika — KaTeX
//      menganggap koma tanda baca dan menambah spasi tipis ("0,849" tampil "0, 849"); tulis 0{,}849. Daftar dan
//      koordinat ditulis berspasi (A(0, 0), [0, 1]); subskrip _{1,2,3} dan isi perintah mode teks (\text{…},
//      \textrm{…}, \operatorname{…}) sah. Isi \mathrm{…}/\mathbf{…}/\mathit{…} tetap mode matematika — KaTeX menampilkan
//      \mathrm{0,5} sebagai "0, 5" — jadi diperiksa. Course bertitik desimal (Matematika 4, Getaran, Optimalisasi)
//      memakai koma hanya sebagai pemisah ([[1,0],[0,1]], \{1,-3\}), jadi aturan ini tidak berlaku di sana (keputusan
//      dosen (1): pemisah desimal per course);
//  11. (TTL dan CAD, KURSUS_AKRONIM) akronim miring di mode matematika — tampil seperti perkalian lambang; tulis
//      \mathrm{SIL}. Ditolak: tiga huruf kapital (SIL, GMD, MVA_{base}, TMS; empat huruf atau lebih sudah ditolak
//      aturan 4) dan akronim pendek yang ditegakkan fase D (AKRONIM_DIJAGA: SF, LF, CF, LsF, VR, PV, PQ, kV, CO_2).
//      Daftar pendeknya eksplisit karena dua huruf kapital di rumus TTL/CAD biasanya perkalian atau ruas (EI, FL, IR,
//      BC, AD). Subskrip/superskrip berkurawal (n_{PQ}) dan isi \mathrm/\mathbf/\text sah; isi \mathit/\textit/\emph
//      tetap miring, jadi diperiksa. Sisken tidak: G C H di T_r = GC/(1+GCH) memang perkalian fungsi alih.
//      Label tulisan tangan yang dikeluarkan dari KaTeX (UTS/UAS "10 Soal · @2", judul bar Setup "Terminal — ttl")
//      tidak dijaga aturan ini; pasangannya di notasi-halaman-data.json (node scripts/notasi-halaman.mjs --periksa).
// Argumen warna/URL/atribut HTML (\color{blue}, \textcolor{green}{…}, \href{…}) bukan kata matematika, dan isi
// \text{…}/\textnormal{…}/\colorbox{…}{…} (kurawal bersarang pun) adalah teks tegak — keduanya tidak dihitung
// sebagai kata miring; argumen matematika \textcolor{red}{Gaya} tetap diperiksa.
// Dengan --katex <folder paket katex> setiap segmen juga dirender (throwOnError) dan galatnya dilaporkan
// ("galat KaTeX", sama dengan .katex-error di peramban); paketnya wajib versi halaman (VERSI_KATEX). Repo publik
// ini tanpa node_modules: validate-public-security.mjs menjalankan aturan statis 1–11, dan CI
// (security-validation.yml) memasang katex@VERSI_KATEX di luar repo lalu menjalankan render penuh ini; langkah CI
// itu dipatok baris demi baris (periksaLangkahCiKatex) — dikomentari, `if:`, `continue-on-error`, `|| true`, atau
// perintah tambahan ditolak.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { halamanNotasi } from "./periksa-notasi.mjs";

// Course yang rumusnya dijaga: keenam course (96 halaman modul dan ujian). Teknik Tenaga Listrik dan Pemodelan CAD
// dirapikan di generatornya (fase D, 4 Oktober 2026: pustaka.koma_katex dan \mathrm{…} untuk akronim).
export const KURSUS_KATEX = ["Engineering-Mathematics", "Getaran-Mekanik", "Optimalisasi-dan-Automasi", "Sistem-Kendali-Cerdas",
  "Teknik-Tenaga-Listrik", "Pemodelan-Computer-Aided-Design"];
// Aturan 10: course yang menulis koma desimal Indonesia di rumus (Sisken lewat sisken-rumus.tokenLatex, TTL/CAD lewat
// pustaka.koma_katex). Aturan 11: course generator TTL/CAD (akronim teknik di rumus ditulis \mathrm{…}).
export const KURSUS_KOMA_DESIMAL = ["Sistem-Kendali-Cerdas", "Teknik-Tenaga-Listrik", "Pemodelan-Computer-Aided-Design"];
export const KURSUS_AKRONIM = ["Teknik-Tenaga-Listrik", "Pemodelan-Computer-Aided-Design"];
// Aturan 11, akronim pendek yang ditegakkan fase D (\mathrm{…} di modul_N.py TTL/CAD) dan tidak tertangkap pola tiga
// huruf kapital. "CO_2" berarti CO yang disusul subskrip 2. Validator mematok isi ketiga daftar ini.
export const AKRONIM_DIJAGA = ["SF", "LF", "CF", "LsF", "VR", "PV", "PQ", "kV", "CO_2"];
/** Opsi aturan per course untuk periksaKatex (aturan 10 dan 11). */
export const opsiKursus = (course) => ({ komaDesimal: KURSUS_KOMA_DESIMAL.includes(course), akronim: KURSUS_AKRONIM.includes(course) });
export const halamanKatex = halamanNotasi;
// Versi <script> KaTeX halaman (cdnjs …/KaTeX/0.16.9/). Render --katex wajib memakai versi yang sama.
export const VERSI_KATEX = "0.16.9";

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

// Perintah berisi teks tegak (bukan mode matematika): argumennya dibuang utuh dengan kurawal seimbang
// (\text{nilai {awal}}). ARG_NON_MATEMATIKA: banyaknya argumen yang bukan matematika — warna, URL, atribut HTML,
// ditambah argumen teks \colorbox/\fcolorbox; argumen matematika sesudahnya (\textcolor{red}{Gaya}) tetap diperiksa.
const TEKS_TEGAK = new Set(["text", "textrm", "textbf", "textit", "textsf", "texttt", "textup", "textmd", "textnormal", "emph",
  "mathrm", "mathbf", "mathit", "mathsf", "mathtt", "operatorname", "operatorname*", "mbox", "hbox"]);
// Aturan 10: hanya perintah mode teks (koma di dalamnya tidak berspasi). \mathrm/\mathbf/\mathit/\mathsf/\mathtt tetap
// mode matematika: \mathrm{0,5} tampil "0, 5". \operatorname{0,5} dirender sebagai satu identifier tanpa spasi.
const MODE_TEKS = new Set([...TEKS_TEGAK].filter((n) => !n.startsWith("math")));
// Aturan 11: isi yang tampil tegak. \mathit/\textit/\emph tetap miring, jadi akronim di dalamnya diperiksa.
const TEGAK_AKRONIM = new Set([...TEKS_TEGAK].filter((n) => !["mathit", "textit", "emph"].includes(n)));
const ARG_NON_MATEMATIKA = { color: 1, textcolor: 1, colorbox: 2, fcolorbox: 3, href: 1, url: 1, htmlClass: 1, htmlId: 1,
  htmlStyle: 1, htmlData: 1 };
/** Indeks sesudah satu argumen TeX yang dimulai di `i` ({…} seimbang, \perintah, atau satu karakter). */
function lewatiArgumen(t, i) {
  while (i < t.length && /\s/.test(t[i])) i += 1;
  if (t[i] === "{") {
    for (let j = i, d = 0; j < t.length; j++) {
      if (t[j] === "\\") { j += 1; continue; }
      if (t[j] === "{") d += 1; else if (t[j] === "}") { d -= 1; if (d === 0) return j + 1; }
    }
    return t.length;
  }
  if (t[i] === "\\") { const m = /^\\(?:[A-Za-z]+|.)/.exec(t.slice(i)); return i + (m ? m[0].length : 1); }
  return Math.min(t.length, i + 1);
}
/** Buang perintah teks tegak (`tegak`, bawaan TEKS_TEGAK) beserta isinya dan argumen non-matematika (warna, URL,
 *  atribut HTML). */
function buangNonMatematika(t, tegak = TEKS_TEGAK) {
  let out = "", pos = 0, m;
  const rx = /\\([A-Za-z]+\*?)/g;
  while ((m = rx.exec(t))) {
    const n = tegak.has(m[1]) ? 1 : (ARG_NON_MATEMATIKA[m[1]] || 0);
    if (!n) continue;
    let j = m.index + m[0].length;
    for (let k = 0; k < n; k++) j = lewatiArgumen(t, j);
    out += t.slice(pos, m.index) + " ";
    pos = j;
    rx.lastIndex = j;
  }
  return out + t.slice(pos);
}
// Fungsi KaTeX yang tidak boleh menjadi pangkat/subskrip tanpa kurawal (diuji pada katex 0.16.9: "Got function
// '\…' with no arguments as superscript"). Yang boleh tidak dicantumkan: \frac, \dfrac, \tfrac, \binom, \text…,
// \mathrm, \mathbf, \mathcal, \mathbb, … serta lambang biasa (\alpha, \infty, \prime, \cdot).
const FUNGSI_TANPA_KURAWAL = ("int iint iiint oint oiint oiiint intop smallint sum prod coprod bigcup bigcap bigvee bigwedge " +
  "bigodot bigoplus bigotimes biguplus bigsqcup lim liminf limsup varliminf varlimsup max min sup inf det gcd Pr arg deg dim " +
  "exp hom ker lg ln log sin cos tan cot sec csc sinh cosh tanh coth arcsin arccos arctan sqrt hat bar vec dot ddot tilde " +
  "check breve acute grave mathring widehat widetilde widecheck overline underline overbrace underbrace overrightarrow " +
  "overleftarrow overleftrightarrow underrightarrow utilde left right middle big Big bigg Bigg bigl bigr Bigl Bigr biggl " +
  "biggr Biggl Biggr operatorname operatornamewithlimits color textcolor colorbox fcolorbox displaystyle textstyle " +
  "scriptstyle scriptscriptstyle boldsymbol bm pmb quad qquad enspace hspace kern mkern mskip phantom hphantom vphantom " +
  "stackrel overset underset not cancel bcancel xcancel sout boxed fbox cfrac mathop mathbin mathrel mathord mathopen " +
  "mathclose mathpunct mathinner llap rlap clap mathllap mathrlap mathclap raisebox hbox vcenter vdots href url htmlClass " +
  "htmlId htmlStyle htmlData").split(" ");
const RX_SKRIP_FUNGSI = new RegExp(String.raw`(?<!\\)[\^_]\s*(\\(?:${FUNGSI_TANPA_KURAWAL.join("|")})(?![A-Za-z])|\\[,;:!])`);
function kurawalSeimbang(t) {
  let d = 0;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === "\\") { i += 1; continue; }
    if (t[i] === "{") d += 1; else if (t[i] === "}") { d -= 1; if (d < 0) return false; }
  }
  return d === 0;
}
function akarTerpotong(rumus) {
  const t = buangNonMatematika(rumus);                       // √ di dalam \text{…} adalah teks dan tampil benar
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
  let s = buangNonMatematika(t).replace(/\\(?:begin|end)\s*\{[^{}]*\}/g, " ").replace(/\\[A-Za-z]+/g, " ");
  for (let i = 0; i < 3; i++) s = s.replace(/[_^]\s*\{[^{}]*\}/g, " ");
  // Diferensial berderet (dxdy, dxdydz, dudv) bukan kata; huruf sesudah d bukan a/e/i/o, jadi "dadu" tetap kata.
  s = s.replace(/(?<![A-Za-z])(?:d[b-df-hj-np-z]){2,}(?![A-Za-z])/g, " ");
  const m = /(?<![A-Za-z])[A-Za-z]{4,}(?![A-Za-z])/.exec(s);
  return m ? m[0] : null;
}
/** Kode yang diketik di rumus (aturan 8): garis bawah \_ atau pemanggilan kosong nama(). */
function kodeDiRumus(t) {
  const m = /\\_|[A-Za-z0-9_}]\s*\(\s*\)/.exec(t);
  return m ? m[0] : null;
}
/** Karakter teks tanpa metrik KaTeX di mode matematika (aturan 9): en dash, em dash, ½. */
function teksDiMatematika(t) {
  const m = /[–—½]/.exec(buangNonMatematika(t));
  return m ? m[0] : null;
}
/** True bila posisi i di `s` berada di dalam skrip berkurawal — subskrip _{…}, atau juga superskrip ^{…} bila `pangkat`
 *  (kurawal ter-escape \{ \} dilewati). */
function diSubskrip(s, i, pangkat = false) {
  const tumpuk = [];
  for (let k = 0; k < i; k++) {
    if (s[k] === "\\") { k += 1; continue; }
    if (s[k] === "{") tumpuk.push(s[k - 1] === "_" || (pangkat && s[k - 1] === "^")); else if (s[k] === "}") tumpuk.pop();
  }
  return tumpuk.some(Boolean);
}
/** Koma desimal tanpa {,} di mode matematika (aturan 10): "0,849", juga sesudah {,} ("1{,}2,3"), di pangkat, dan di
 *  \mathrm{…}/\mathbf{…}; isi perintah mode teks dan subskrip berkurawal dilewati. */
function komaTanpaKurawal(t) {
  const s = buangNonMatematika(t, MODE_TEKS);
  for (const m of s.matchAll(/(?<![\d,])\d+,\d+/g)) if (!diSubskrip(s, m.index)) return m[0];
  return null;
}
// AKRONIM_DIJAGA sebagai pola: "CO_2" → CO yang disusul _2 atau _{2}.
const RX_AKRONIM_DIJAGA = new RegExp(String.raw`(?<![A-Za-z])(?:${AKRONIM_DIJAGA.map((a) => {
  const [dasar, sub] = a.split("_");
  return sub ? String.raw`${dasar}(?=\s*_\s*(?:${sub}|\{\s*${sub}\s*\}))` : dasar;
}).join("|")})(?![A-Za-z])`, "g");
/** Akronim miring di mode matematika (aturan 11): akronim pendek AKRONIM_DIJAGA di luar skrip berkurawal, atau tiga huruf
 *  kapital; isi \mathrm/\mathbf/\text dibuang, isi \mathit/\textit/\emph tidak (tetap miring). */
function akronimMiring(t) {
  let s = buangNonMatematika(t, TEGAK_AKRONIM).replace(/\\(?:begin|end)\s*\{[^{}]*\}/g, " ").replace(/\\[A-Za-z]+/g, " ");
  for (const m of s.matchAll(RX_AKRONIM_DIJAGA)) if (!diSubskrip(s, m.index, true)) return m[0];
  for (let i = 0; i < 3; i++) s = s.replace(/[_^]\s*\{[^{}]*\}/g, " ");
  const m = /(?<![A-Za-z])[A-Z]{3}(?![A-Za-z])/.exec(s);
  return m ? m[0] : null;
}
// Jalur berkas Windows di teks biasa bukan perintah TeX (aturan 6): C:\Users\Nama\Documents, C:\Program Files\FreeCAD,
// %APPDATA%\FreeCAD, ~\Documents, .\data, \\server\bagi. Segmen berspasi ("Program Files") hanya diterima bila segmen
// sesudahnya jelas bagian jalur (huruf kapital/angka, folder yang disusul "\", atau nama berkas berekstensi), supaya
// "C:\Users\Nama lalu tulis \frac di sini" tetap ditolak.
const SEGMEN = String.raw`[^\\\s<>"|?*]+`;
const RX_JALUR = new RegExp([
  String.raw`(?<![A-Za-z0-9])[A-Za-z]:(?:\\(?:[^\\<>"|?*\n]{1,60}(?=\\(?:[A-Z0-9]|${SEGMEN}(?:\\|\.[A-Za-z0-9]{1,4}(?![A-Za-z0-9]))))|${SEGMEN}))+`,
  String.raw`(?:%[A-Za-z_][\w()]*%|(?<![\w\\])~|(?<![\w\\.])\.{1,2})(?:\\${SEGMEN})+`,
  String.raw`(?<![\w\\])\\\\[\w.$-]+(?:\\${SEGMEN})+`,
].join("|"), "g");

/** Daftar pelanggaran KaTeX pada satu halaman: [{baris, jenis, teks}]. `render` opsional: (tex, tampil) → pesan galat|null.
 *  `opsi` = opsiKursus(course): {komaDesimal, akronim} menyalakan aturan 10 dan 11. */
export function periksaKatex(html, render = null, opsi = {}) {
  const hasil = [];
  const catat = (p, jenis, teks) => hasil.push({ baris: p.baris, jenis, teks: String(teks).replace(/\s+/g, " ").slice(0, 100) });
  for (const p of bagianKatex(html)) {
    if (p.jenis === "teks") {
      if (p.terbuka) catat(p, `pembatas ${p.terbuka} tanpa penutup di simpul teks yang sama (TeX tampil mentah)`, p.isi);
      else {
        const isi = p.isi.replace(RX_JALUR, (j) => " ".repeat(j.length));
        const m = /\\(?:[A-Za-z]{2,}|[()[\]])/.exec(isi);
        if (m) catat(p, `TeX mentah di teks tampil (${m[0]})`, p.isi.slice(Math.max(0, m.index - 30), m.index + 40));
      }
      continue;
    }
    const t = p.isi;
    if (/(^|[^\\])%/.test(t)) catat(p, "% polos di rumus (komentar TeX: sisa rumus hilang; tulis \\%)", p.mentah);
    if (/(^|[^A-Za-z\\])(?:L|\\mathcal\s*\{L\}|ℒ)(?:\s*[_^]\s*(?:\{[^{}]*\}|-?[A-Za-z0-9])){0,2}\s*\{/.test(t)) catat(p, "Laplace dengan kurawal biasa (tidak tampil; tulis \\mathcal{L}\\{…\\})", p.mentah);
    const akar = akarTerpotong(t);
    if (akar) catat(p, `akar terpotong (${akar.slice(0, 40)}; tulis \\sqrt{…} utuh)`, p.mentah);
    const kata = kataMiring(t);
    if (kata) catat(p, `kata "${kata}" miring di mode matematika (tulis \\text{…})`, p.mentah);
    if (!kurawalSeimbang(t)) catat(p, "kurawal { } tidak seimbang", p.mentah);
    const skrip = RX_SKRIP_FUNGSI.exec(t);
    if (skrip) catat(p, `fungsi ${skrip[1]} sebagai pangkat/subskrip tanpa kurawal (galat KaTeX; tulis ${skrip[0][0]}{${skrip[1]} …})`, p.mentah);
    const kode = kodeDiRumus(t);
    if (kode) catat(p, `kode di rumus (${kode}; tulis <code>…</code> di luar KaTeX)`, p.mentah);
    const huruf = teksDiMatematika(t);
    if (huruf) catat(p, `${huruf} di mode matematika (tanpa metrik fon KaTeX; tulis ${huruf === "½" ? "\\tfrac{1}{2}" : `\\text{${huruf}}`})`, p.mentah);
    const koma = opsi.komaDesimal ? komaTanpaKurawal(t) : null;
    if (koma) catat(p, `koma desimal ${koma} tanpa {,} (tampil "${koma.replace(",", ", ")}"; tulis ${koma.replace(",", "{,}")}, daftar/koordinat berspasi)`, p.mentah);
    const akronim = opsi.akronim ? akronimMiring(t) : null;
    if (akronim) catat(p, `akronim "${akronim}" miring di mode matematika (tulis \\mathrm{${akronim}})`, p.mentah);
    if (render) { const g = render(t, p.tampil); if (g) catat(p, `galat KaTeX: ${g}`, p.mentah); }
  }
  return hasil;
}

// Langkah CI render KaTeX penuh (.github/workflows/security-validation.yml) — satu-satunya penangkap galat parse
// (\frac{a}, \foo x, x^, \left( tanpa \right) lolos aturan statis). Dipatok baris demi baris pada baris yang tidak
// dikomentari: langkah ada tepat sekali, sejajar dengan langkah validator di daftar steps yang sama, dan isinya persis
// tiga perintah ini. `if:`, `continue-on-error`, `|| true`, `; true`, perintah tambahan, atau jalur lain ditolak.
export const NAMA_LANGKAH_CI = "Render every KaTeX formula with the pages' KaTeX version";
const LANGKAH_CI = [
  `- name: ${NAMA_LANGKAH_CI}`,
  "run: |",
  `VERSI_KATEX=$(node --input-type=module -e "import { VERSI_KATEX } from './scripts/periksa-katex.mjs'; console.log(VERSI_KATEX)")`,
  `npm install --no-save --no-package-lock --no-audit --no-fund --prefix "$RUNNER_TEMP/katex" "katex@$VERSI_KATEX"`,
  `node scripts/periksa-katex.mjs --katex "$RUNNER_TEMP/katex/node_modules/katex"`,
];
const LANGKAH_VALIDATOR = "- name: Validate frontend and Pages gates";
const barisAktif = (b) => b.trim() !== "" && !/^\s*#/.test(b);
/** Letak langkah render KaTeX: {mulai, akhir, indent} (akhir = indeks baris sesudah blok) atau pesan galat. */
function letakLangkahCi(baris) {
  const awal = baris.map((b, i) => (barisAktif(b) && b.trim() === LANGKAH_CI[0] ? i : -1)).filter((i) => i >= 0);
  if (awal.length !== 1) return `langkah "${NAMA_LANGKAH_CI}" harus ada tepat sekali dan tidak dikomentari (ditemukan ${awal.length})`;
  const mulai = awal[0], indent = baris[mulai].search(/\S/);
  let akhir = mulai + 1;
  for (let i = mulai + 1; i < baris.length; i++) {
    if (!barisAktif(baris[i])) continue;
    if (baris[i].search(/\S/) <= indent) break;
    akhir = i + 1;
  }
  return { mulai, akhir, indent };
}
/** Masalah langkah CI render KaTeX pada teks security-validation.yml ([] = sah). */
export function periksaLangkahCiKatex(yaml) {
  const baris = yaml.split(/\r?\n/);
  const l = letakLangkahCi(baris);
  if (typeof l === "string") return [l];
  const masalah = [];
  const isi = baris.slice(l.mulai, l.akhir).filter(barisAktif).map((b) => b.trim());
  if (isi.length !== LANGKAH_CI.length || isi.some((b, i) => b !== LANGKAH_CI[i])) {
    const beda = isi.find((b, i) => b !== LANGKAH_CI[i]) ?? `${isi.length} baris, seharusnya ${LANGKAH_CI.length}`;
    masalah.push(`isi langkah "${NAMA_LANGKAH_CI}" harus persis ${LANGKAH_CI.length - 1} baris (run: | + tiga perintah, tanpa if:, ` +
      `continue-on-error, || true, atau perintah tambahan); berbeda di: ${beda}`);
  }
  const indentRun = baris.slice(l.mulai + 1, l.akhir).filter(barisAktif).map((b) => b.search(/\S/));
  if (indentRun.length && (indentRun[0] !== l.indent + 2 || indentRun.slice(1).some((n) => n <= indentRun[0]))) {
    masalah.push(`indentasi langkah "${NAMA_LANGKAH_CI}" rusak (run: harus sejajar name:, perintah di bawahnya lebih dalam)`);
  }
  if (!baris.some((b) => barisAktif(b) && b.trim() === LANGKAH_VALIDATOR && b.search(/\S/) === l.indent)) {
    masalah.push(`langkah "${NAMA_LANGKAH_CI}" harus berada di daftar steps yang sama dengan "${LANGKAH_VALIDATOR.slice(8)}"`);
  }
  if (baris.some((b) => barisAktif(b) && /^\s*(?:-\s+)?continue-on-error\s*:/.test(b))) masalah.push("continue-on-error di security-validation.yml");
  return masalah;
}
/** Uji mutasi penjaga langkah CI: langkah yang dimatikan dengan cara apa pun harus ditolak. */
export function ujiLangkahCiKatex(yaml) {
  if (periksaLangkahCiKatex(yaml).length) throw new Error("security-validation.yml: KaTeX CI step test needs the valid workflow");
  const baris = yaml.split(/\r?\n/);
  const l = letakLangkahCi(baris);
  const ind = " ".repeat(l.indent + 2);
  const iNode = baris.findIndex((b, i) => i >= l.mulai && i < l.akhir && b.trim() === LANGKAH_CI[4]);
  const ubah = (fn) => { const b = baris.slice(); fn(b); return b.join("\n"); };
  const mutasi = [
    ["langkah dikomentari", ubah((b) => { for (let i = l.mulai; i < l.akhir; i++) if (b[i].trim()) b[i] = b[i].replace(/^(\s*)/, "$1# "); })],
    ["langkah dihapus", ubah((b) => b.splice(l.mulai, l.akhir - l.mulai))],
    ["if: false", ubah((b) => b.splice(l.mulai + 1, 0, `${ind}if: false`))],
    ["if: ${{ false }} sesudah run", ubah((b) => b.splice(l.akhir, 0, `${ind}if: \${{ false }}`))],
    ["continue-on-error", ubah((b) => b.splice(l.mulai + 1, 0, `${ind}continue-on-error: true`))],
    ["|| true", ubah((b) => { b[iNode] += " || true"; })],
    ["; true", ubah((b) => { b[iNode] += "; true"; })],
    ["perintah tambahan sesudahnya", ubah((b) => b.splice(iNode + 1, 0, b[iNode].replace(/\S.*$/, "exit 0")))],
    ["render dijadikan komentar shell", ubah((b) => { b[iNode] = b[iNode].replace(/node /, "# node "); })],
    ["paket katex dari jalur lain", ubah((b) => { b[iNode] = b[iNode].replace("$RUNNER_TEMP/katex/node_modules/katex", "node_modules/katex"); })],
    ["langkah dipindah ke job lain", ubah((b) => { for (let i = l.mulai; i < l.akhir; i++) b[i] = "  " + b[i]; })],
  ];
  for (const [nama, teks] of mutasi) {
    if (!periksaLangkahCiKatex(teks).length) throw new Error(`security-validation.yml: KaTeX CI step guard accepted a mutated workflow (${nama})`);
  }
}

/** Perender KaTeX opsional dari folder paket katex (mis. node_modules/katex): (tex, tampil) → pesan galat|null. */
export function buatRender(folderKatex) {
  const katex = createRequire(import.meta.url)(path.resolve(folderKatex));
  if (katex.version !== VERSI_KATEX) throw new Error(`paket katex ${katex.version}, halaman memakai KaTeX ${VERSI_KATEX}`);
  return (tex, tampil) => {
    const warn = console.warn;
    console.warn = () => {};          // "No character metrics for '½'": fon cadangan, bukan galat (halaman: strict false)
    try { katex.renderToString(tex, { displayMode: tampil, throwOnError: true, strict: false }); return null; }
    catch (e) { return String(e.message || e).replace(/^KaTeX parse error: /, "").slice(0, 120); }
    finally { console.warn = warn; }
  };
}

/** Uji mutasi: pemeriksa harus menolak rumus yang tampil salah dan menerima bentuk yang benar. Mutasi aturan 10–11
 *  memakai opsi course berkoma desimal/TTL-CAD; acuannya harus bersih juga dengan opsi itu. */
export function ujiMutasiKatex(halamanBersih, relative) {
  const KOMA = { komaDesimal: true }, AKRONIM = { akronim: true }, SEMUA = { komaDesimal: true, akronim: true };
  if (periksaKatex(halamanBersih).length || periksaKatex(halamanBersih, null, SEMUA).length) {
    throw new Error(`${relative}: KaTeX mutation test needs a clean page`);
  }
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
    ["fungsi sebagai pangkat tanpa kurawal", "<p>\\(u = e^\\int P dx\\)</p>"],
    ["akar sebagai subskrip tanpa kurawal", "<p>\\(x_\\sqrt{2} = 1\\)</p>"],
    ["kata berwarna tetap miring", "<p>\\(\\textcolor{red}{Gaya} = F\\)</p>"],
    ["Laplace bersubskrip L_t{…}", "<p>\\(\\mathcal{L}_t{f(t)} = F(s)\\)</p>"],
    ["kode ber-garis-bawah di rumus", "<p>Hitung mean dari \\(\\text{motor\\_1\\_rms}\\).</p>"],
    ["pemanggilan kode di rumus", "<span class=\"rumus-notasi\">\\(\\text{isnull()}\\)</span>"],
    ["en dash di mode matematika", "<p>\\(\\zeta \\approx 0.1–0.15\\)</p>"],
    ["½ di mode matematika", "<p>\\(E = ½ m v^2\\)</p>"],
    ["perintah TeX sesudah jalur berkas", "<p>Buka C:\\Users\\Nama lalu tulis \\frac di sini</p>"],
    ["koma desimal tanpa {,}", "<p>Contoh: \\(\\eta_{total} \\approx 33,59\\%\\).</p>", KOMA],
    ["koma desimal di pangkat", "<p>\\(t = 0{,}14/(5^{0,02} - 1)\\)</p>", KOMA],
    ["daftar tanpa spasi sesudah {,}", "<p>\\(x = 1{,}2,3\\)</p>", KOMA],
    ["koma desimal di blok persamaan", "<div class=\"formula-main\">\\(\\mathrm{GMR} = 0,7788\\,r\\)</div>", KOMA],
    ["koma desimal di \\mathrm (tetap mode matematika)", "<p>\\(\\mathrm{0,5}\\)</p>", KOMA],
    ["koma desimal di \\mathbf", "<p>\\(\\mathbf{F} = \\mathbf{0,5}\\,\\mathbf{a}\\)</p>", KOMA],
    ["akronim miring", "<p>\\(SIL = V_L^2/Z_c\\)</p>", AKRONIM],
    ["akronim bersubskrip miring", "<p>\\(Z_{base} = (\\mathrm{kV}_{base})^2/MVA_{base}\\)</p>", AKRONIM],
    ["akronim di \\mathit tetap miring", "<p>\\(\\mathit{SIL} = V_L^2/Z_c\\)</p>", AKRONIM],
    ["akronim dua huruf bersubskrip", "<p>\\(SF_{target} = 2{,}5\\)</p>", AKRONIM],
    ["akronim huruf kecil bersubskrip", "<p>\\(Z_{base} = (kV_{base})^2/\\mathrm{MVA}_{base}\\)</p>", AKRONIM],
    ["CO_2 berkurawal", "<p>\\(CO_{2} = \\sum_i f_i\\,\\rho_i\\,V_i\\)</p>", AKRONIM],
    // Setiap akronim pendek yang dijaga: bentuk miringnya ditolak (bentuk \mathrm-nya diterima, daftar terima).
    ...AKRONIM_DIJAGA.map((a) => [`akronim pendek ${a} miring`, `<p>Contoh: \\(${a} = 0{,}5 \\cdot x\\).</p>`, AKRONIM]),
  ];
  for (const [nama, potongan, opsi] of tolak) {
    if (!periksaKatex(sisip(potongan), null, opsi).length) throw new Error(`${relative}: KaTeX check accepted a mutated page (${nama})`);
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
    ["warna, teks normal, teks bersarang", "<p>\\(\\color{blue} x\\), \\(\\textcolor{green}{y}\\), \\(\\textnormal{Gaya} = F\\), " +
      "\\(\\text{nilai {awal}}\\), \\(\\colorbox{yellow}{Gaya}\\)</p>"],
    ["pangkat berkurawal dan skrip yang boleh tanpa kurawal", "<p>\\(u = e^{\\int P\\, dx}\\), \\(x_\\text{max}\\), " +
      "\\(e^\\alpha\\), \\(x^\\prime\\), \\(y_\\mathrm{a}\\)</p>"],
    ["jalur berkas Windows di teks", "<p>Simpan di C:\\Users\\Nama\\Documents atau C:\\Program Files\\FreeCAD 1.0\\bin\\FreeCAD.exe, " +
      "%APPDATA%\\FreeCAD\\Macro, ~\\Documents\\Tugas, \\\\server\\bagi\\data.</p>"],
    ["akar Unicode di dalam \\text", "<p>\\(\\text{faktor √2}\\)</p>"],
    ["diferensial berderet", "<p>\\(\\iint_D f\\,dxdy\\), \\(\\iiint_V \\rho\\,dxdydz\\), \\(\\int du\\,dv\\)</p>"],
    ["kode <code> di luar rumus, rentang dan setengah yang benar", "<p><code>motor_1_rms</code>, <code>isnull()</code>, " +
      "\\(2\\text{–}18\\ \\text{MHz}\\), \\(\\text{kV (fasa–netral)}\\), \\(\\tfrac{1}{2} m v^2\\), \\(\\frac{L_1}{L_2}\\)</p>"],
    ["koma desimal {,}, subskrip daftar, koordinat, interval, teks", "<p>\\(\\eta \\approx 33{,}59\\%\\), \\(\\sigma_{1,2,3}\\), " +
      "\\(A(0, 0)\\), \\([0, 1]\\), \\(\\text{1,5 kV}\\), \\(1.234{,}5\\), \\(t^{0{,}02}\\), \\(B(a,0)\\)</p>", SEMUA],
    ["akronim tegak, subskrip kapital, dua huruf", "<p>\\(\\mathrm{SIL} = V_L^2/Z_c\\), \\(\\mathrm{MVA}_{base}\\), " +
      "\\(2n_{PQ} + n_{PV}\\), \\(\\mathbf{Z}_{ABC}\\), \\(d(A, BC)\\), \\(\\text{CAIDI}\\)</p>", SEMUA],
    ["akronim pendek tegak, perkalian dua huruf, koma di mode teks", "<p>\\(\\mathrm{SF}_{target}\\), " +
      "\\((\\mathrm{kV}_{base})^2\\), \\(\\mathrm{CO}_2\\), \\(\\text{bus PV}\\), \\(x^{PQ}\\), \\(EI\\), \\(F L\\), \\(I R\\), " +
      "\\(\\textrm{0,5}\\), \\(\\operatorname{f}(0{,}5)\\), \\(\\mathrm{0{,}5}\\), \\(CO = r\\)</p>", SEMUA],
    ...AKRONIM_DIJAGA.map((a) => [`akronim pendek ${a} tegak`, `<p>Contoh: \\(\\mathrm{${a.split("_")[0]}}${a.includes("_") ? "_" +
      a.split("_")[1] : ""} = 0{,}5 \\cdot x\\).</p>`, SEMUA]),
    ["koma pemisah dan perkalian fungsi alih di course lain", "<p>\\(M = [[1,0],[0,1]]\\), \\(\\{1,-3,-6,8\\}\\), " +
      "\\(T_r = \\frac{GC}{1+GCH}\\)</p>"],
  ];
  for (const [nama, potongan, opsi] of terima) {
    const sisa = periksaKatex(sisip(potongan), null, opsi);
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
      const h = periksaKatex(html, render, opsiKursus(k));
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
