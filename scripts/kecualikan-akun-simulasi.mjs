/**
 * Mengecualikan akun simulasi dosen dari penyimpanan dan papan hasil di
 * sisi klien, melengkapi pengaman server di functions/index.js (SIM_NIMS).
 *
 * Server sudah menolak menyimpan jawaban akun ini. Tetapi halaman juga
 * menulis record pengunjung (visitors/<course>/<segmen>/mhs_<nim>) saat login
 * dan heartbeat, serta menampilkan papan hasil dari node itu — dua hal yang
 * tidak lewat server. Skrip ini menutup keduanya:
 *
 *   1. Papan hasil (renderVisitors, updateLeaderboard) menyaring NIM simulasi
 *      seperti ia menyaring role dosen/guest.
 *   2. Heartbeat tidak ditulis untuk NIM simulasi.
 *   3. Record pengunjung tidak dibuat saat login — submitVisitor melewati
 *      set()/update() ke DB_PATH bila NIM-nya simulasi, tetapi tetap
 *      menyimpan identitas lokal sehingga halaman berfungsi penuh.
 *
 *   4. Setelah server menilai (respons simulasi:true), soal dibuka kembali
 *      supaya bisa dicoba ulang — server memang tidak menyimpannya.
 *
 * Daftar NIM harus sama dengan SIM_NIMS di backend.
 *
 * Idempoten: tiap sisipan dikenali dari bentuk akhirnya.
 *
 * Pakai:
 *   node scripts/kecualikan-akun-simulasi.mjs            # terapkan
 *   node scripts/kecualikan-akun-simulasi.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

const SIM_NIMS = ["41399999901"];
const DEFINISI = `// NIM akun simulasi dosen — harus sama dengan SIM_NIMS di backend. Jawaban
// akun ini dinilai server tetapi tidak disimpan; di klien ia disaring dari
// papan hasil dan tidak menulis record pengunjung maupun heartbeat.
const SIM_NIMS = new Set(${JSON.stringify(SIM_NIMS)});
const isSimulasiNim = (nim) => SIM_NIMS.has(String(nim || ''));
`;

// Definisi ditaruh tepat sebelum fungsi papan hasil pertama yang memakainya.
const JANGKAR_DEFINISI = "function updateLeaderboard(visitors, schedExpired){";

// 1a. updateLeaderboard: tambah saringan NIM simulasi.
const LB_LAMA = "const mhs=visitors.filter(v=>v.role!=='dosen'&&v.role!=='guest');";
const LB_BARU = "const mhs=visitors.filter(v=>v.role!=='dosen'&&v.role!=='guest'&&!isSimulasiNim(v.nim));";
// 1b. renderVisitors: idem.
const RV_LAMA = "for(const v of visitors){if(v.role==='dosen'||v.role==='guest')continue;";
const RV_BARU = "for(const v of visitors){if(v.role==='dosen'||v.role==='guest'||isSimulasiNim(v.nim))continue;";
// 2. heartbeat.
const HB_LAMA = "  if (!me || me.role !== 'student' || !me.nim) return;\n";
const HB_BARU = "  if (!me || me.role !== 'student' || !me.nim || isSimulasiNim(me.nim)) return;\n";
// 3. record pengunjung saat login: bungkus set/update ke DB_PATH.
const RX_TULIS_VISITOR = /^(\s*)await (set|update)\(ref\(db, DB_PATH \+ '\/' \+ key\), (visitorRec|patch|freshRec)\);$/gm;
// 4. Tabel roster di tab Hasil dirender dari masterStudents (roster), bukan dari
//    visitors, jadi saringan papan hasil tidak menyentuhnya — akun simulasi
//    tetap tampil sebagai baris "Belum". Disaring SEBELUM .map agar nomor
//    urutnya tetap rapat. Pemakai masterStudents di jalur login (find/some)
//    sengaja tidak disentuh: itulah yang membuat akun simulasi bisa masuk.
const ROSTER_LAMA = "tableEl.innerHTML=masterStudents.map((s,i)=>{";
const ROSTER_BARU = "tableEl.innerHTML=masterStudents.filter(s=>!isSimulasiNim(s.nim)).map((s,i)=>{";
// 5. Penyebut ringkasan kehadiran ikut dikecualikan supaya "hadir/total" jujur.
const TOTAL_LAMA = "  const totalMhs = masterStudents.length;\n";
const TOTAL_BARU = "  const totalMhs = masterStudents.filter(s=>!isSimulasiNim(s.nim)).length;\n";

// 6. Setelah dinilai, halaman mengunci soal secara lokal (tombol disabled,
//    opsi tidak bisa diklik). Server menandai respons akun simulasi dengan
//    simulasi:true dan tidak menyimpannya, jadi soal dibuka kembali agar bisa
//    dicoba ulang tanpa refresh. Umpan balik/emoji tetap ditampilkan.
const MODUL_KUNCI_LAMA = `  if (sub) sub.disabled = true;
  if (typeof updateScore === 'function') updateScore();
  if (typeof checkExportReady === 'function') checkExportReady();
}
window._applyModulServerResult = _applyModulServerResult;`;
const MODUL_KUNCI_BARU = `  // Akun simulasi: server tidak menyimpan jawaban, soal dibuka kembali.
  if (res.simulasi === true) {
    if (type === 'mc') delete mcAnswered[qId];
    if (type === 'comp') delete compAnswered[qId];
    if (res.marker) _answeredQ.delete(res.marker);
    if (rg) { delete rg.dataset.locked; rg.querySelectorAll('.radio-option').forEach(o => { o.style.pointerEvents = ''; o.style.opacity = ''; }); }
    if (sub) sub.disabled = false;
    if (typeof updateScore === 'function') updateScore();
    return;
  }
  if (sub) sub.disabled = true;
  if (typeof updateScore === 'function') updateScore();
  if (typeof checkExportReady === 'function') checkExportReady();
}
window._applyModulServerResult = _applyModulServerResult;`;
// Sebagian halaman Exam menyisipkan satu baris komentar sebelum
// _handleServerExamError; baris itu dipertahankan (grup $1).
const RX_EXAM_KUNCI = new RegExp(
  [
    "^  if \\(typeof updateScore === 'function'\\) updateScore\\(\\);",
    "  if \\(typeof checkExportReady === 'function'\\) checkExportReady\\(\\);",
    "\\}",
    "",
    "((?:\\/\\/[^\\n]*\\n)?)function _handleServerExamError\\(",
  ].join("\\n"),
  "m",
);
const EXAM_KUNCI_BARU = `  // Akun simulasi: server tidak menyimpan jawaban, soal dibuka kembali.
  if (res.simulasi === true) {
    if (type === 'tf') delete tfAnswered[qId];
    if (type === 'mc') delete mcAnswered[qId];
    if (type === 'comp') delete compAnswered[qId];
    if (res.marker) _answeredQ.delete(res.marker);
    const rgSim = document.getElementById('rg-' + qId);
    if (rgSim) { delete rgSim.dataset.locked; rgSim.querySelectorAll('.radio-option').forEach(o => { o.style.pointerEvents = ''; o.style.opacity = ''; }); }
    if (sub) { sub.disabled = false; sub.textContent = '🔁 Simulasi — coba lagi'; sub.style.background = ''; sub.style.borderColor = ''; sub.style.color = ''; sub.classList.remove('running'); }
    if (typeof updateScore === 'function') updateScore();
    return;
  }
  if (typeof updateScore === 'function') updateScore();
  if (typeof checkExportReady === 'function') checkExportReady();
}

$1function _handleServerExamError(`;

function proses(berkas) {
  let html = fs.readFileSync(berkas, "utf8");
  const awal = html;
  const catatan = [];

  if (!html.includes("const isSimulasiNim") && html.includes(JANGKAR_DEFINISI)) {
    html = html.replace(JANGKAR_DEFINISI, DEFINISI + JANGKAR_DEFINISI);
    catatan.push("definisi");
  }
  if (html.includes(LB_LAMA)) { html = html.split(LB_LAMA).join(LB_BARU); catatan.push("leaderboard"); }
  if (html.includes(RV_LAMA)) { html = html.split(RV_LAMA).join(RV_BARU); catatan.push("renderVisitors"); }
  if (html.includes(HB_LAMA)) { html = html.split(HB_LAMA).join(HB_BARU); catatan.push("heartbeat"); }
  let tulis = 0;
  html = html.replace(RX_TULIS_VISITOR, (m, indent, op, rec) => {
    tulis += 1;
    return `${indent}if (!isSimulasiNim(nim)) await ${op}(ref(db, DB_PATH + '/' + key), ${rec});`;
  });
  if (tulis) catatan.push(`tulis-visitor×${tulis}`);
  if (html.includes(ROSTER_LAMA)) { html = html.split(ROSTER_LAMA).join(ROSTER_BARU); catatan.push("roster"); }
  if (html.includes(TOTAL_LAMA)) { html = html.split(TOTAL_LAMA).join(TOTAL_BARU); catatan.push("totalMhs"); }
  if (!html.includes("res.simulasi === true") && html.includes(MODUL_KUNCI_LAMA)) { html = html.split(MODUL_KUNCI_LAMA).join(MODUL_KUNCI_BARU); catatan.push("buka-ulang-modul"); }
  if (!html.includes("res.simulasi === true") && RX_EXAM_KUNCI.test(html)) { html = html.replace(RX_EXAM_KUNCI, EXAM_KUNCI_BARU); catatan.push("buka-ulang-exam"); }

  if (html === awal) return null;
  // Penjaga: definisi harus ada bila ada pemakai.
  if (html.includes("isSimulasiNim(") && !html.includes("const isSimulasiNim")) {
    throw new Error(`${path.basename(berkas)}: isSimulasiNim dipakai tetapi definisinya tidak tersisip (jangkar updateLeaderboard tidak ada?)`);
  }
  return { html, catatan };
}

const berkas = [];
for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
  if (!kursus.isDirectory()) continue;
  for (const sub of ["Exam", "Modul"]) {
    const dir = path.join(root, kursus.name, sub);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) if (f.endsWith(".html")) berkas.push(path.join(dir, f));
  }
}
let n = 0;
const rekap = {};
for (const f of berkas.sort()) {
  const h = proses(f);
  if (!h) continue;
  n += 1;
  for (const c of h.catatan) rekap[c] = (rekap[c] || 0) + 1;
  if (!periksa) fs.writeFileSync(f, h.html);
}
console.log(`${n} halaman ${periksa ? "akan diperbarui" : "diperbarui"}: ${JSON.stringify(rekap)}`);
