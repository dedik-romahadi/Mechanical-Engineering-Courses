/**
 * Teks penalti terlambat di halaman = kebijakan server: pengali 0,65 (potongan 35%).
 *
 * MASALAHNYA. Server memakai cfg.lateMultiplierValue 0,65 untuk semua course
 * (Pedoman §5.1–§5.2), dan halaman Sisken, TTL, serta CAD sudah menyebut 35%.
 * Halaman Matematika 4, Getaran Mekanik, dan Optimalisasi & Otomasi masih
 * membawa angka rollout lama:
 *   - 42 modul: pesan status terlambat di tab Tugas "poin per soal dikurangi
 *     30%" dan komentar isLate yang sama;
 *   - 6 UTS/UAS: pesan sesi perpanjangan, keterangan di modal Atur Jadwal
 *     ("dengan poin dikurangi 30%"), dan komentar "late multiplier 0.7";
 *   - ke-48 halaman itu: _getLateMultiplier() mengembalikan 0.7 (tidak dipakai
 *     untuk menilai — server yang menilai — tetapi diekspor ke window);
 *   - 3 halaman Pengantar (Attributes/Introduction.html, Getaran:
 *     Attributes/Introdcution.html), ditaut dari index.html: "dikurangi 20%
 *     (multiplier 0.8)" dan "dipotong 20%" untuk modul maupun ujian.
 *
 * YANG DILAKUKAN. Tiap angka lama diganti bentuk yang sudah dipakai halaman
 * Sisken/TTL/CAD (jangkar teks persis; bukan pencarian angka bebas, supaya
 * materi kuliah yang kebetulan memuat 0.7 atau 30% tidak tersentuh). Sesudah
 * itu skrip menuntut ke-96 halaman modul/ujian memuat bentuk baru tepat sekali
 * dan tidak ada halaman yang masih cocok dengan pola angka lama.
 * validate-public-security.mjs memakai pola yang sama untuk menolak angka lama.
 *
 * Tidak ada generator yang membawa teks ini: halaman Math4/Getaran/Opto
 * dirawat langsung, sedangkan generator TTL (dari Sisken) dan CAD (dari TTL)
 * menyalin halaman yang sudah 35%.
 *
 * CAKUPAN: <Kursus>/Modul/Modul-N.html (84), <Kursus>/Exam/UTS.html dan
 * UAS.html (12), <Kursus>/Attributes/*.html. Salinan konflik OneDrive
 * (*-DEDIK-PC.html) dilewati.
 *
 * Idempoten: jalan kedua melaporkan 0 halaman.
 *
 * Pakai:
 *   node scripts/penalti-35.mjs            # terapkan
 *   node scripts/penalti-35.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

// [nama, lama, baru]
const PESAN_TUGAS = ["pesan-terlambat",
  '<strong style="color:#fff">poin per soal dikurangi 30%</strong>',
  '<strong style="color:#fff">poin per soal dikurangi 35%</strong>'];
const PENGALI_KLIEN = ["_getLateMultiplier",
  "  return _isPastDeadline() ? 0.7 : 1.0;\n",
  "  return _isPastDeadline() ? 0.65 : 1.0;\n"];
const ATURAN = {
  modul: [
    ["komentar-isLate",
      "  // dikurangi 30%, Comp Hard tidak dapat partial credit, dan tidak\n",
      "  // dikurangi 35%, Comp Hard tidak dapat partial credit, dan tidak\n"],
    PESAN_TUGAS,
    PENGALI_KLIEN,
  ],
  ujian: [
    ["keterangan-modal",
      "dengan poin dikurangi 30%. Setelah perpanjangan habis, submit diblokir.</p>",
      "dengan poin dikurangi 35%. Setelah perpanjangan habis, submit diblokir.</p>"],
    PESAN_TUGAS,
    ["komentar-pengali",
      '  // Exam: "past deadline" (untuk late multiplier 0.7) hanya saat dalam\n',
      '  // Exam: "past deadline" (untuk late multiplier 0.65) hanya saat dalam\n'],
    PENGALI_KLIEN,
  ],
  pengantar: [
    ["pengantar-terlambat",
      'Poin per soal dikurangi <strong style="color:#fb7185;">20%</strong> (multiplier 0.8)',
      'Poin per soal dikurangi <strong style="color:#fb7185;">35%</strong> (multiplier 0.65)'],
    ["pengantar-modul",
      "poin terlambat dipotong 20%.",
      "poin terlambat dipotong 35%."],
    ["pengantar-ujian",
      'poin dipotong <strong style="color:#fb7185;">20%</strong> (status terlambat)',
      'poin dipotong <strong style="color:#fb7185;">35%</strong> (status terlambat)'],
  ],
};

// Pola angka lama — sama dengan validate-public-security.mjs.
const RX_PENALTI_LAMA = [
  /(?:dikurangi|dipotong|potongan|dipangkas)\s*(?:<[^>]{0,120}>\s*)?(?:20|30)\s*%/i,
  /\bmultiplier\s+0\.[78]\b/i,
  /_isPastDeadline\(\)\s*\?\s*0\.[78]\b/,
  /×\s?0[.,]7\b/,
  /\bdikali\s+0[.,][78]\b/i,
];

const hitung = (s, sub) => s.split(sub).length - 1;

function proses(berkas, jenis) {
  let html = fs.readFileSync(berkas, "utf8");
  if (html.includes("\r")) {
    // Halaman Pengantar tersimpan LF di indeks tetapi bisa CRLF di folder
    // kerja (salinan OneDrive/checkout lama). Bekerja atas bentuk LF; berkas
    // hanya ditulis (sebagai LF, sama dengan indeks) bila ada yang diganti.
    if (jenis !== "pengantar") throw new Error("berkas memuat CR; repo ini LF (.gitattributes eol=lf)");
    html = html.replace(/\r\n/g, "\n");
  }
  const lfAwal = html;
  const catatan = [];
  const aturan = ATURAN[jenis] || [];
  for (const [nama, lama, baru] of aturan) {
    const n = hitung(html, lama);
    if (n > 1) throw new Error(`${nama}: bentuk lama muncul ${n}x, harap paling banyak 1`);
    if (n === 1) {
      html = html.replace(lama, () => baru);
      catatan.push(nama);
    }
  }
  // Penjaga hasil: ke-96 halaman modul/ujian memuat tiap bentuk baru tepat
  // sekali; halaman Pengantar yang memuat blok aturan terlambat juga.
  const wajib = jenis === "pengantar" && !html.includes("Poin per soal dikurangi") ? [] : aturan;
  for (const [nama, , baru] of wajib) {
    const n = hitung(html, baru);
    if (n !== 1) throw new Error(`${nama}: bentuk baru muncul ${n}x, harusnya 1 (jangkar halaman berubah?)`);
  }
  for (const rx of RX_PENALTI_LAMA) {
    const m = html.match(rx);
    if (m) throw new Error(`angka penalti lama tersisa: "${m[0]}" (tambahkan jangkarnya ke ATURAN)`);
  }
  if (html === lfAwal) return null;
  return { html, catatan };
}

const berkas = [];
for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
  if (!kursus.isDirectory()) continue;
  const dirModul = path.join(root, kursus.name, "Modul");
  if (fs.existsSync(dirModul)) {
    for (const nama of fs.readdirSync(dirModul)) {
      if (/^Modul-\d+\.html$/.test(nama)) berkas.push([path.join(dirModul, nama), "modul"]);
    }
  }
  const dirUjian = path.join(root, kursus.name, "Exam");
  if (fs.existsSync(dirUjian)) {
    for (const nama of ["UTS.html", "UAS.html"]) {
      if (fs.existsSync(path.join(dirUjian, nama))) berkas.push([path.join(dirUjian, nama), "ujian"]);
    }
  }
  const dirAtribut = path.join(root, kursus.name, "Attributes");
  if (fs.existsSync(dirAtribut)) {
    for (const nama of fs.readdirSync(dirAtribut)) {
      if (/\.html?$/.test(nama) && !/-DEDIK-PC\./.test(nama)) berkas.push([path.join(dirAtribut, nama), "pengantar"]);
    }
  }
}
const jumlah = (j) => berkas.filter(([, x]) => x === j).length;
if (jumlah("modul") !== 84) throw new Error(`harap 84 halaman <Kursus>/Modul/Modul-N.html, ditemukan ${jumlah("modul")}`);
if (jumlah("ujian") !== 12) throw new Error(`harap 12 halaman UTS/UAS, ditemukan ${jumlah("ujian")}`);

let n = 0;
const rekap = {};
for (const [f, jenis] of berkas.sort((a, b) => a[0].localeCompare(b[0]))) {
  let h;
  try { h = proses(f, jenis); }
  catch (e) { throw new Error(`${path.relative(root, f)}: ${e.message}`); }
  if (!h) continue;
  n += 1;
  for (const c of h.catatan) rekap[c] = (rekap[c] || 0) + 1;
  if (!periksa) fs.writeFileSync(f, h.html);
}
console.log(`${n} dari ${berkas.length} halaman ${periksa ? "akan diperbarui" : "diperbarui"}: ${JSON.stringify(rekap)}`);
