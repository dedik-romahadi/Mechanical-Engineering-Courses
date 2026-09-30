/**
 * Kandidat jawaban komputasi: angka yang BUKAN bagian label ikut dikirim.
 *
 * MASALAHNYA (laporan mahasiswa, C13 Teknik Tenaga Listrik Modul 2, 29 Sep 2026).
 * Keluaran
 *     T1: 863.8690 kVA  (86.39 % dari rating)
 *     T2: 1136.1310 kVA  (68.24 % dari rating)
 * memuat jawaban yang benar (1136.1310), tetapi dinilai salah. `parseNumbers`
 * membaca "T2" sebagai angka 2, sehingga angka PERTAMA baris itu 2 dan angka
 * TERAKHIRnya 68.24; `_lineAnswers` hanya mengirim angka pertama dan terakhir
 * per baris, dan server (`_evaluateModulAnswer` / `evaluateAnswer`) hanya
 * membandingkan kandidat itu dengan kunci. Nilai di tengah baris tidak pernah
 * diperiksa. Label soalnya sendiri ("print() beban T2 (kVA)") mengundang
 * keluaran berlabel seperti itu.
 *
 * YANG DILAKUKAN. `_lineAnswers` di tiap halaman modul/ujian ber-Pyodide
 * ditambah satu lintasan: per baris, angka pertama dan terakhir yang digit
 * pertamanya TIDAK menempel pada huruf atau garis bawah (T2, x2, S_1, ω1 =
 * label/nama variabel) ikut menjadi kandidat, bila belum ada. Pembantunya
 * `_angkaTanpaLabel`.
 *
 * YANG TIDAK DIUBAH. `parseNumbers`, `_lastLineAnswer`, `userAnswer`, dan
 * `userAnswers` (dipakai pencocokan multi-langkah ujian) tetap. Kandidat lama
 * `_lineAnswers` tetap di depan dengan urutan yang sama (halaman memotong
 * `lineAnswers` di 64 entri), jadi keluaran yang sebelumnya dinilai benar
 * tetap dinilai benar — perubahan ini hanya menambah kandidat. Backend tidak
 * perlu di-deploy: server sudah membandingkan semua `lineAnswers`.
 *
 * Tanpa lookbehind (Safari < 16.4 gagal mem-parse seluruh skrip), dan
 * `\p{L}` dibangun lewat `new RegExp` di dalam try/catch supaya peramban tanpa
 * property escape jatuh ke rentang huruf Latin/Yunani/Kiril.
 *
 * CAKUPAN: <Kursus>/Modul/Modul-N.html dan <Kursus>/Exam/UTS|UAS.html yang
 * memuat `function _lineAnswers` (UTS/UAS Pemodelan CAD tidak ber-Pyodide).
 * Bukan salinan konflik OneDrive *-DEDIK-PC.html.
 *
 * Generator modul (TTL/CAD/Sisken) mewarisi blok ini dari halaman sumbernya;
 * sesudah regenerasi, `--periksa` harus melaporkan 0. Karena generator mengganti
 * teks ber-nama course/nomor modul, komentar di dalam blok sengaja tidak
 * menyebut keduanya.
 *
 * Idempoten: halaman yang bloknya sudah sama tidak ditulis.
 *
 * Pakai:
 *   node scripts/angka-tanpa-label.mjs            # terapkan
 *   node scripts/angka-tanpa-label.mjs --periksa  # laporan saja (keluar 1 bila ada yang tertinggal)
 *   node scripts/angka-tanpa-label.mjs --uji      # uji perilaku fungsi di setiap halaman
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");
const uji = process.argv.includes("--uji");

const VERSI = "v1";
const BS = String.fromCharCode(92); // garis miring terbalik, supaya escape \uXXXX tertulis apa adanya di halaman
const AWAL_BANTU = `// ANGKA-TANPA-LABEL:BANTU ${VERSI} (scripts/angka-tanpa-label.mjs) — mulai`;
const AKHIR_BANTU = "// ANGKA-TANPA-LABEL:BANTU — selesai";
const AWAL_BARIS = `  // ANGKA-TANPA-LABEL:BARIS ${VERSI} (scripts/angka-tanpa-label.mjs) — mulai`;
const AKHIR_BARIS = "  // ANGKA-TANPA-LABEL:BARIS — selesai";

const BANTU = String.raw`${AWAL_BANTU}
// Angka di dalam teks, kecuali yang digit pertamanya menempel pada huruf atau
// garis bawah: itu bagian label/nama variabel (T2, x2, S_1), bukan nilai.
// Tanda minus di depan tidak dihitung menempel ("x-3" tetap -3, sama dengan
// parseNumbers).
let _RX_HURUF_LABEL;
try { _RX_HURUF_LABEL = new RegExp('[\\p{L}_]$', 'u'); }
catch (e) { _RX_HURUF_LABEL = /[A-Za-z_@@RENTANG@@]$/; }
function _angkaTanpaLabel(str) {
  const s = String(str || '');
  const re = /-?\d+\.?\d*(?:[eE][+-]?\d+)?/g;
  const out = [];
  let m;
  while ((m = re.exec(s)) !== null) {
    if (m[0].charAt(0) !== '-' && _RX_HURUF_LABEL.test(s.slice(Math.max(0, m.index - 2), m.index))) continue;
    const n = Number(m[0]);
    if (isFinite(n)) out.push(n);
  }
  return out;
}
${AKHIR_BANTU}
`.replace("@@RENTANG@@", () => [["00C0", "024F"], ["0370", "03FF"], ["0400", "04FF"]]
  .map(([a, b]) => `${BS}u${a}-${BS}u${b}`).join(""));

const BARIS = String.raw`${AWAL_BARIS}
  // Laporan mhs (29 Sep 2026): "T2: 1136.1310 kVA  (68.24 % dari rating)"
  // -- angka pertama baris itu "2" dari label "T2" dan angka terakhirnya 68.24,
  // sehingga 1136.1310 tidak pernah jadi kandidat. Tambahkan angka PERTAMA dan
  // TERAKHIR per baris yang bukan bagian label. Kandidat di atas tidak diubah
  // dan tetap di depan (pengirim memotong di 64 entri).
  for (const line of lines) {
    const nb = _angkaTanpaLabel(line.replace(/\[[^\[\]]*\]/g, ' '));
    if (nb.length > 0) {
      if (out.indexOf(nb[0]) === -1) out.push(nb[0]);
      if (nb.length > 1 && out.indexOf(nb[nb.length - 1]) === -1) out.push(nb[nb.length - 1]);
    }
  }
${AKHIR_BARIS}
`;

const RX_BANTU = /\/\/ ANGKA-TANPA-LABEL:BANTU [^\n]*— mulai\n[\s\S]*?\/\/ ANGKA-TANPA-LABEL:BANTU — selesai\n/g;
const RX_BARIS = / {2}\/\/ ANGKA-TANPA-LABEL:BARIS [^\n]*— mulai\n[\s\S]*?\/\/ ANGKA-TANPA-LABEL:BARIS — selesai\n/g;
const KEPALA = "function _lineAnswers(str) {\n";
const EKOR = "  return out;\n}\n";

function halaman() {
  const out = [];
  for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
    if (!kursus.isDirectory() || kursus.name.startsWith(".")) continue;
    for (const sub of ["Modul", "Exam"]) {
      const dir = path.join(root, kursus.name, sub);
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir)) {
        if (!(sub === "Modul" ? /^Modul-\d+\.html$/ : /^(UTS|UAS)\.html$/).test(f)) continue;
        out.push(path.join(dir, f));
      }
    }
  }
  return out.sort();
}

/** Halaman tanpa kedua blok (bentuk asal), untuk dibandingkan dan disuntik ulang. */
function lepas(html) {
  return html.replace(RX_BANTU, "").replace(RX_BARIS, "");
}

/** Pasang kedua blok pada halaman bentuk asal. */
function pasang(asal, rel) {
  if (asal.split(KEPALA).length !== 2) throw new Error(`${rel}: "function _lineAnswers(str) {" harus tepat satu`);
  const iK = asal.indexOf(KEPALA);
  const iE = asal.indexOf(EKOR, iK);
  const iTutup = asal.indexOf("\n}\n", iK);
  if (iE === -1 || iE + EKOR.length !== iTutup + 3) {
    throw new Error(`${rel}: _lineAnswers tidak berakhir dengan "return out;" — bentuknya berubah, periksa manual`);
  }
  const badan = asal.slice(iK, iE);
  if (!badan.includes("const lines = ") || !badan.includes("const out = []") || !badan.includes("parseNumbers(")) {
    throw new Error(`${rel}: badan _lineAnswers tidak dikenali (lines/out/parseNumbers)`);
  }
  return asal.slice(0, iE) + BARIS + EKOR + BANTU + asal.slice(iE + EKOR.length);
}

/** Ambil parseNumbers + blok bantu + _lineAnswers dari halaman lalu jalankan. */
function fungsiHalaman(html, rel) {
  const iP = html.indexOf("function parseNumbers(str) {");
  const iPt = html.indexOf("\n}\n", iP);
  const iK = html.indexOf(KEPALA);
  const iB = html.indexOf(AKHIR_BANTU, iK);
  if (iP === -1 || iB === -1 || iK === -1) throw new Error(`${rel}: fungsi tidak lengkap untuk diuji`);
  const kode = html.slice(iP, iPt + 3) + html.slice(iK, iB) +
    "\n({ parseNumbers, _angkaTanpaLabel, _lineAnswers });";
  return vm.runInNewContext(kode, {}, { filename: rel });
}

/** Kandidat lama: angka pertama + terakhir per baris dari parseNumbers (perilaku sebelum skrip ini). */
function kandidatLama(parseNumbers, teks) {
  const out = [];
  for (const line of String(teks || "").split("\n")) {
    const ns = parseNumbers(line.replace(/\[[^\[\]]*\]/g, " "));
    if (ns.length > 0) {
      out.push(ns[0]);
      if (ns.length > 1) out.push(ns[ns.length - 1]);
    }
  }
  return out;
}

const KASUS = [
  // [keluaran, angka yang wajib menjadi kandidat, keterangan]
  ["T1: 863.8690 kVA  (86.39 % dari rating)\nT2: 1136.1310 kVA  (68.24 % dari rating)", [1136.131, 863.869], "C13 TTL Modul-2 (label T1/T2 + persen)"],
  ["x1=3.5, x2=7.25", [3.5, 7.25], "nama variabel berangka"],
  ["S_2 = 263.0332 kVA/%", [263.0332], "indeks bergaris bawah"],
  ["ω1= 10 rad/s", [10], "huruf Yunani berangka"],
  ["Amplitudo (t > 5s): 0.246 m", [0.246, 5], "C8/C11 Modul-4: angka di label berkurung"],
  ["Peak tertinggi: 50 Hz, magnitude = 1.0 unit", [50, 1], "angka pertama baris terakhir"],
  ["Nilai outlier: [45.0, -8.0]\nJumlah: 2", [2], "literal list diabaikan"],
  ["hasil = -3.5", [-3.5], "bilangan negatif"],
  ["x-3", [-3], "minus menempel huruf tetap seperti parseNumbers"],
  ["k = 1.5e-3 N/m", [0.0015], "notasi ilmiah"],
  ["Rp5000", [5000], "angka menempel huruf tetap kandidat lama"],
  ["1136.1310", [1136.131], "jawaban polos"],
  ["R2D2 H2O CO2", [], "hanya label: tidak ada kandidat baru"],
];

let berubah = 0;
let total = 0;
let gagalUji = 0;
const tertinggal = [];
for (const f of halaman()) {
  const rel = path.relative(root, f).split(path.sep).join("/");
  const html = fs.readFileSync(f, "utf8");
  if (!html.includes("function _lineAnswers")) continue; // halaman tanpa Pyodide (UTS/UAS CAD)
  if (html.includes("\r")) throw new Error(`${rel}: berkas memuat CR; repo ini LF (.gitattributes eol=lf)`);
  total += 1;
  const baru = pasang(lepas(html), rel);
  if (baru !== html) {
    berubah += 1;
    tertinggal.push(rel);
    if (!periksa && !uji) fs.writeFileSync(f, baru);
  }
  if (uji) {
    const fn = fungsiHalaman(baru, rel);
    for (const [teks, wajib, ket] of KASUS) {
      const lama = kandidatLama(fn.parseNumbers, teks);
      const hasil = Array.from(fn._lineAnswers(teks));
      const awalanSama = lama.every((v, i) => hasil[i] === v);
      const lengkap = wajib.every((w) => hasil.some((v) => Math.abs(v - w) < 1e-9));
      const tanpaBaru = wajib.length > 0 || hasil.length === lama.length;
      if (!awalanSama || !lengkap || !tanpaBaru) {
        gagalUji += 1;
        console.error(`GAGAL ${rel} — ${ket}: lama=${JSON.stringify(lama)} hasil=${JSON.stringify(hasil)} wajib=${JSON.stringify(wajib)}`);
      }
    }
  }
}

if (uji) {
  console.log(`angka-tanpa-label --uji: ${total} halaman × ${KASUS.length} kasus, ${gagalUji} gagal` +
    (berubah ? ` (catatan: ${berubah} halaman belum disuntik; diuji pada hasil suntikan)` : ""));
  process.exit(gagalUji ? 1 : 0);
}
console.log(`angka-tanpa-label${periksa ? " --periksa" : ""}: ${berubah} dari ${total} halaman ${periksa ? "perlu disuntik" : "ditulis"}`);
if (periksa && berubah) {
  for (const r of tertinggal.slice(0, 20)) console.log("  - " + r);
  process.exit(1);
}
