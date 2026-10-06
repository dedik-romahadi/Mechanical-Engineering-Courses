/**
 * Tab Hasil (96 halaman: 84 modul + UTS/UAS enam course): "Jumlah Absen" tidak
 * boleh menghitung akun simulasi dosen.
 *
 * MASALAHNYA. Akun simulasi dosen (SIM_NIMS, mis. 41399999901) tercantum di
 * students.json tiap course. Jumlah Mahasiswa (totalMhs) dan tabel Hasil
 * (renderVisitors) menyaringnya, tetapi loop Hadir/Absen di updateLeaderboard
 * melintasi seluruh masterStudents tanpa menyaring. Sesudah jadwal berakhir
 * akun itu (0 poin) terhitung Bolos, sehingga "Jumlah Absen" lebih besar satu
 * daripada jumlah nama Bolos di tabel (mis. CAD Modul 3: Absen 5, nama 4).
 *
 * YANG DILAKUKAN. Loop statistik melewati akun simulasi dengan isSimulasiNim,
 * sama dengan totalMhs dan tabel. Aturan Hadir/Terlambat/Absen lainnya tidak
 * berubah.
 *
 * Idempoten: blok bertanda ditimpa di tempat; jalan kedua melaporkan 0 halaman.
 * Salinan konflik OneDrive (*-DEDIK-PC.html) dilewati. Generator TTL/CAD dan
 * enrich Sisken membangun halaman dari Modul-1/templatnya, jadi jalankan
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
export const BLOK = `  // SAMAKAN-ABSEN-HASIL BEGIN v1 — dipasang scripts/samakan-absen-hasil.mjs
  // Akun simulasi dosen ada di roster tetapi tidak dihitung di totalMhs dan
  // tidak tampil di tabel; ia juga tidak boleh masuk Hadir/Absen (dulu: Absen
  // lebih besar satu daripada jumlah nama Bolos).
  let hadir = 0, absen = 0;
  for(const s of masterStudents){
    if(isSimulasiNim(s.nim)) continue;
    const v = visitMap[s.nim];
    const hasP = v && ((v.points || 0) > 0);
    const late = hasP && (typeof isLate === 'function') && isLate(v.timestamp);
    if(hasP && !late){
      hadir++;   // Tepat Waktu: punya poin + tidak terlambat
    } else if(late){
      absen++;   // Terlambat: dihitung sebagai absen
    } else if(schedEnded){
      absen++;   // Bolos: tidak punya poin + jadwal sudah berakhir
                 //        (mencakup tidak-akses maupun akses-tapi-0-poin)
    }
    // else: Belum (jadwal masih aktif, belum berhasil dapat poin) — tidak dihitung
  }
  // SAMAKAN-ABSEN-HASIL END v1
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
