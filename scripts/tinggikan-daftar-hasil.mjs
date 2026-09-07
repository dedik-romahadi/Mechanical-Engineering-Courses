/**
 * Menyamakan tinggi daftar mahasiswa di tab Hasil halaman Exam dengan halaman
 * Modul.
 *
 * MASALAHNYA. Wadah roster (`#visitorTableBody`) di halaman Exam dipatok
 * `max-height:420px` — nilai tetap yang tidak peduli tinggi layar. Pada kelas
 * berisi 27 mahasiswa, dosen hanya melihat ±7 baris sekaligus dan harus
 * menggulir di dalam kotak kecil, padahal ruang layar di bawahnya menganggur.
 * Halaman Modul Sisken sudah memakai `min(72vh,820px)`: ikut tinggi viewport,
 * tetapi tetap punya batas atas supaya di monitor besar tidak melar.
 *
 * YANG DILAKUKAN. Mengganti nilai `max-height` pada atribut style inline
 * `#visitorTableBody` di seluruh halaman Exam menjadi `min(72vh,820px)`.
 * Hanya angka itu yang disentuh; `overflow-y:auto` dan sisa style dibiarkan.
 *
 * CAKUPAN: <Kursus>/Exam/*.html dan <Kursus>/Modul/*.html — seluruh 64 halaman.
 *
 * Awalnya hanya Exam (5 September 2026), karena saat itu hanya 14 modul Sistem
 * Kendali Cerdas yang responsif dan 42 modul mata kuliah lain masih 420px.
 * Modul menyusul pada 7 September 2026 atas keputusan dosen, sehingga tab Hasil
 * kini seragam di seluruh mata kuliah dan seluruh jenis halaman.
 *
 * Idempoten: berkas yang nilainya sudah TINGGI dilewati, dan pencocokannya
 * memakai nilai lama yang eksplisit sehingga tidak pernah menumpuk.
 *
 * Pakai:
 *   node scripts/tinggikan-daftar-hasil.mjs            # terapkan
 *   node scripts/tinggikan-daftar-hasil.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

const SUB = ["Exam", "Modul"];
const LAMA = 'id="visitorTableBody" style="max-height:420px;';
const TINGGI = 'id="visitorTableBody" style="max-height:min(72vh,820px);';

function kumpulkan() {
  const out = [];
  for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
    if (!kursus.isDirectory()) continue;
    for (const sub of SUB) {
      const dir = path.join(root, kursus.name, sub);
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir)) {
        if (f.endsWith(".html")) out.push(path.join(dir, f));
      }
    }
  }
  return out.sort();
}

let n = 0;
let sudah = 0;
for (const berkas of kumpulkan()) {
  const html = fs.readFileSync(berkas, "utf8");
  if (html.includes(TINGGI)) { sudah += 1; continue; }
  const jumlah = html.split(LAMA).length - 1;
  if (jumlah === 0) {
    throw new Error(`${path.relative(root, berkas)}: jangkar #visitorTableBody tidak ditemukan`);
  }
  if (jumlah > 1) {
    throw new Error(`${path.relative(root, berkas)}: jangkar muncul ${jumlah}x, harusnya 1`);
  }
  if (!periksa) fs.writeFileSync(berkas, html.replace(LAMA, TINGGI));
  n += 1;
}
console.log(
  `${n} halaman ${periksa ? "akan diperbarui" : "diperbarui"}` +
  `${sudah ? `, ${sudah} sudah tinggi` : ""}.`,
);
