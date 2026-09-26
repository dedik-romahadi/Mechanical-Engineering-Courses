/**
 * Halaman modul: updateLeaderboard hanya dipanggil dari renderVisitors.
 *
 * MASALAHNYA. Sesudah students.json dimuat, fetchMasterStudents merender ulang
 * tab Hasil lewat renderVisitors(latestVisitors) — yang di baris-baris awalnya
 * sudah memanggil updateLeaderboard(visitors, schedExpired) dengan schedExpired
 * dari jadwal saat ini — lalu memanggil updateLeaderboard SEKALI LAGI dengan
 * variabel jadwal-berakhir yang tidak pernah didefinisikan di halaman mana pun
 * (selalu false). Panggilan kedua itu menimpa statistik yang baru dihitung
 * benar: bila jadwal modul sudah berakhir, "Absen" tidak menghitung mahasiswa
 * Bolos (tanpa poin) sampai event RTDB berikutnya atau interval 30 detik.
 * Terjadi setiap kali data RTDB tiba lebih dulu daripada students.json.
 * Halaman UTS/UAS sudah diperbaiki scripts/privasi-hasil-ujian.mjs (MASTER);
 * skrip ini melakukan hal yang sama untuk ke-84 halaman modul.
 *
 * YANG DILAKUKAN. Di fetchMasterStudents, blok
 *   if (typeof updateLeaderboard === 'function'[ && typeof latestVisitors !== 'undefined']) {
 *     updateLeaderboard(latestVisitors || [], <variabel jadwal-berakhir tak terdefinisi>);
 *   }
 * (tiga ragam penulisan, dari Getaran/Sisken/TTL/CAD, Math4, dan Opto) diganti
 * penanda LEADERBOARD-MODUL-SEKALI berisi komentar saja. Render ulang
 * renderVisitors tepat di atasnya dibiarkan, dan skrip memeriksa bahwa
 * renderVisitors memang memanggil updateLeaderboard di tingkat teratas
 * badannya (tanpa cabang), jadi papan dan statistik tetap diperbarui.
 *
 * Jangkar penyuntik lain tidak disentuh (kecualikan-akun-simulasi.mjs:
 * definisi updateLeaderboard, baris `const mhs=...`, baris pertama
 * renderVisitors). Generator TTL/CAD membangun modul dari Modul-1 course-nya
 * (dan TTL Modul-1 dari Sisken Modul-1), jadi hasil bangun ulang mewarisi
 * perbaikan ini; jalankan `--periksa` sesudah regenerasi, harus 0.
 *
 * CAKUPAN: <Kursus>/Modul/Modul-N.html (84 halaman). Salinan konflik OneDrive
 * (*-DEDIK-PC.html) dilewati.
 *
 * Idempoten: blok bertanda ditimpa di tempat bila sudah ada; jalan kedua
 * melaporkan 0 halaman.
 *
 * Pakai:
 *   node scripts/leaderboard-modul-sekali.mjs            # terapkan
 *   node scripts/leaderboard-modul-sekali.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

const RENDER_ULANG = "      if (typeof renderVisitors === 'function' && typeof latestVisitors !== 'undefined') {\n        renderVisitors(latestVisitors || []);\n      }\n";
// Tiga ragam: `typeof latestVisitors` ada/tidak di syarat; argumen kedua
// `typeof X !== 'undefined' ? X : false` atau `(typeof X !== 'undefined' && X) || false`.
const RX_LAMA = /      if \(typeof updateLeaderboard === 'function'(?: && typeof latestVisitors !== 'undefined')?\) \{\n        updateLeaderboard\(latestVisitors \|\| \[\], (?:typeof _scheduleExpired !== 'undefined' \? _scheduleExpired : false|\(typeof _scheduleExpired !== 'undefined' && _scheduleExpired\) \|\| false)\);\n      \}\n/;
const RX_BLOK = /      \/\/ LEADERBOARD-MODUL-SEKALI BEGIN[^\n]*\n[\s\S]*?      \/\/ LEADERBOARD-MODUL-SEKALI END[^\n]*\n/;
const BLOK = `      // LEADERBOARD-MODUL-SEKALI BEGIN v1 — dipasang scripts/leaderboard-modul-sekali.mjs
      // renderVisitors di atas sudah memanggil updateLeaderboard dengan
      // schedExpired dari jadwal saat ini. Panggilan kedua di sini dulu membaca
      // variabel jadwal-berakhir yang tidak pernah didefinisikan (selalu false),
      // sehingga "Absen" tertimpa tanpa mahasiswa Bolos sampai render
      // berikutnya. Panggilan itu sengaja dibuang.
      // LEADERBOARD-MODUL-SEKALI END v1
`;
const PANGGIL_RV = "\n  updateLeaderboard(visitors, schedExpired);\n";

const hitung = (s, sub) => s.split(sub).length - 1;
const hitungRx = (s, rx) => (s.match(new RegExp(rx.source, "g")) || []).length;

/** Badan fungsi dari `awal` sampai "\n}\n" pertama sesudahnya. */
function fungsi(html, awal) {
  const i = html.indexOf(awal);
  const j = i < 0 ? -1 : html.indexOf("\n}\n", i);
  return i < 0 || j < 0 ? "" : html.slice(i, j + 3);
}

function proses(berkas) {
  let html = fs.readFileSync(berkas, "utf8");
  const awal = html;
  const catatan = [];
  if (html.includes("\r")) throw new Error("berkas memuat CR; repo ini LF (.gitattributes eol=lf)");

  const ada = hitungRx(html, RX_BLOK);
  if (ada > 1) throw new Error(`blok LEADERBOARD-MODUL-SEKALI muncul ${ada}x, harusnya 1`);
  if (ada === 1) {
    const baru = html.replace(RX_BLOK, () => BLOK);
    if (baru !== html) catatan.push("diperbarui");
    html = baru;
  } else {
    const n = hitungRx(html, new RegExp(escRx(RENDER_ULANG) + RX_LAMA.source));
    if (n !== 1) throw new Error(`render ulang + updateLeaderboard ber-variabel tak terdefinisi di fetchMasterStudents muncul ${n}x, harusnya 1`);
    html = html.replace(RX_LAMA, () => BLOK);
    catatan.push("dibuang");
  }

  // Penjaga hasil.
  if (html.includes("_scheduleExpired")) throw new Error("variabel jadwal-berakhir tak terdefinisi masih tertinggal");
  const fm = fungsi(html, "function fetchMasterStudents(");
  if (!fm.includes(RENDER_ULANG + BLOK) || fm.includes("updateLeaderboard(")) {
    throw new Error("fetchMasterStudents harus merender ulang lewat renderVisitors saja, tepat sebelum blok LEADERBOARD-MODUL-SEKALI");
  }
  const rv = fungsi(html, "function renderVisitors(visitors){");
  if (hitung(rv, PANGGIL_RV) !== 1) throw new Error("renderVisitors harus memanggil updateLeaderboard(visitors, schedExpired) sekali di tingkat teratas badannya");
  if (hitung(html, "updateLeaderboard(") !== 2) throw new Error(`updateLeaderboard( muncul ${hitung(html, "updateLeaderboard(")}x, harusnya 2 (definisi + panggilan di renderVisitors)`);

  if (html === awal) return null;
  return { html, catatan };
}
function escRx(t) { return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

const berkas = [];
for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
  if (!kursus.isDirectory()) continue;
  const dir = path.join(root, kursus.name, "Modul");
  if (!fs.existsSync(dir)) continue;
  for (const nama of fs.readdirSync(dir)) {
    if (/^Modul-\d+\.html$/.test(nama)) berkas.push(path.join(dir, nama));
  }
}
if (berkas.length !== 84) throw new Error(`harap 84 halaman <Kursus>/Modul/Modul-N.html, ditemukan ${berkas.length}`);

let n = 0;
const rekap = {};
for (const f of berkas.sort()) {
  let h;
  try { h = proses(f); }
  catch (e) { throw new Error(`${path.relative(root, f)}: ${e.message}`); }
  if (!h) continue;
  n += 1;
  for (const c of h.catatan) rekap[c] = (rekap[c] || 0) + 1;
  if (!periksa) fs.writeFileSync(f, h.html);
}
console.log(`${n} dari ${berkas.length} halaman modul ${periksa ? "akan diperbarui" : "diperbarui"}: ${JSON.stringify(rekap)}`);
