/**
 * Tab Hasil (96 halaman: 84 modul + UTS/UAS enam course): "Jumlah Kehadiran" dan
 * "Jumlah Absen" harus sama dengan status di tabel di bawahnya.
 *
 * ATURAN (keputusan dosen, 6 Oktober 2026):
 *   Hadir = punya poin (Tepat Waktu ATAU Terlambat; Terlambat tetap mengerjakan,
 *           poinnya hanya dikali 0,65)
 *   Absen = tanpa poin DAN jadwal sudah berakhir (= baris Bolos)
 *   Belum = tanpa poin dan jadwal masih aktif (tidak dihitung)
 * sehingga Jumlah Mahasiswa = Hadir + Belum + Absen, dan Absen = jumlah nama Bolos.
 * Akun simulasi dosen (SIM_NIMS) dilewati, sama dengan totalMhs dan tabel.
 *
 * MASALAH YANG DIPERBAIKI (dua tahap).
 * (1) Akun simulasi ada di students.json tiap course; totalMhs dan tabel menyaringnya
 *     tetapi loop Hadir/Absen tidak, jadi sesudah jadwal berakhir ia terhitung Bolos
 *     (CAD Modul 3: Absen 5, nama 4). PR #991.
 * (2) Loop lama menghitung mahasiswa Terlambat sebagai Absen, padahal tabel
 *     menandainya "Terlambat" (bukan "Bolos"). Kini Terlambat dihitung Hadir.
 *
 * Idempoten: blok bertanda (versi apa pun) ditimpa di tempat; jalan kedua melaporkan
 * 0 halaman. Salinan konflik OneDrive (*-DEDIK-PC.html) dilewati. Generator TTL/CAD
 * dan enrich Sisken membangun halaman dari Modul-1/templatnya, jadi jalankan
 * `--periksa` sesudah regenerasi; harus 0.
 *
 * Pakai:
 *   node scripts/samakan-absen-hasil.mjs            # terapkan
 *   node scripts/samakan-absen-hasil.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

const RX_LAMA = /  let hadir = 0, absen = 0;\n  for\(const s of masterStudents\)\{\n[\s\S]*?\n  \}\n(?=  const setTxt)/;
const RX_BLOK = /  \/\/ SAMAKAN-ABSEN-HASIL BEGIN[^\n]*\n[\s\S]*?  \/\/ SAMAKAN-ABSEN-HASIL END[^\n]*\n/;
export const BLOK = `  // SAMAKAN-ABSEN-HASIL BEGIN v2 — dipasang scripts/samakan-absen-hasil.mjs
  // Aturan yang sama dengan status di tabel Hasil (renderVisitors):
  //   Hadir = punya poin (Tepat Waktu atau Terlambat);
  //   Absen = tanpa poin DAN jadwal sudah berakhir (= baris Bolos).
  // Akun simulasi dosen ada di roster tetapi tidak dihitung di totalMhs dan tidak
  // tampil di tabel, jadi dilewati juga di sini.
  let hadir = 0, absen = 0;
  for(const s of masterStudents){
    if(isSimulasiNim(s.nim)) continue;
    const v = visitMap[s.nim];
    if(v && (v.points || 0) > 0) hadir++;
    else if(schedEnded) absen++;
  }
  // SAMAKAN-ABSEN-HASIL END v2
`;

const hitungRx = (s, rx) => (s.match(new RegExp(rx.source, "g")) || []).length;

function proses(berkas) {
  let html = fs.readFileSync(berkas, "utf8");
  const awal = html;
  if (html.includes("\r")) throw new Error("berkas memuat CR; repo ini LF (.gitattributes eol=lf)");
  const ada = hitungRx(html, RX_BLOK);
  if (ada > 1) throw new Error(`blok SAMAKAN-ABSEN-HASIL muncul ${ada}x, harusnya 1`);
  if (ada === 1) {
    html = html.replace(RX_BLOK, () => BLOK);
  } else {
    const n = hitungRx(html, RX_LAMA);
    if (n !== 1) throw new Error(`loop statistik Hadir/Absen di updateLeaderboard muncul ${n}x, harusnya 1`);
    html = html.replace(RX_LAMA, () => BLOK);
  }
  if (html.indexOf("let hadir = 0, absen = 0;") !== html.lastIndexOf("let hadir = 0, absen = 0;")) throw new Error("loop statistik muncul lebih dari sekali");
  return html === awal ? null : html;
}

const berkas = [];
for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
  if (!kursus.isDirectory()) continue;
  for (const sub of ["Modul", "Exam"]) {
    const dir = path.join(root, kursus.name, sub);
    if (!fs.existsSync(dir)) continue;
    for (const nama of fs.readdirSync(dir)) {
      if (sub === "Modul" ? /^Modul-\d+\.html$/.test(nama) : /^U[TA]S\.html$/.test(nama)) berkas.push(path.join(dir, nama));
    }
  }
}
if (berkas.length !== 96) throw new Error(`harap 96 halaman (84 modul + 12 exam), ditemukan ${berkas.length}`);

let n = 0;
for (const f of berkas.sort()) {
  let h;
  try { h = proses(f); }
  catch (e) { throw new Error(`${path.relative(root, f)}: ${e.message}`); }
  if (h === null) continue;
  n += 1;
  if (!periksa) fs.writeFileSync(f, h);
}
console.log(`${n} dari ${berkas.length} halaman ${periksa ? "akan diperbarui" : "diperbarui"}`);
