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
