/**
 * Urutan tab modul: Modul → Forum → Tugas → Hasil (permintaan dosen 19 Okt 2026).
 *
 * Tombol #tab-forum dipindah ke tepat sebelum #tab-tugas di bilah tab (nav .nav-tabs) setiap
 * halaman <Kursus>/Modul/Modul-<n>.html. Hanya urutan tombol yang berubah; bagian halaman
 * (#page-forum, #page-tugas), id, dan onclick tidak disentuh. Idempoten: halaman yang sudah
 * berurutan Forum sebelum Tugas dilewati, jadi jalan kedua melaporkan 0 halaman.
 *
 * Dijalankan sesudah pembangun halaman (mis. scripts/cad-modul/bangun.py) bersama injector lain.
 * Validator (validate-public-security.mjs) menolak halaman yang Forum-nya masih sesudah Tugas.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KURSUS = [
  "Engineering-Mathematics", "Getaran-Mekanik", "Optimalisasi-dan-Automasi",
  "Pemodelan-Computer-Aided-Design", "Sistem-Kendali-Cerdas", "Teknik-Tenaga-Listrik",
];
const RX_FORUM = /\n([ \t]*)<button class="nav-tab[^"]*" id="tab-forum"[^>]*>[^<]*<\/button>/;
const RX_TUGAS = /\n([ \t]*)<button class="nav-tab[^"]*" id="tab-tugas"[^>]*>[^<]*<\/button>/;

let diubah = 0, sesuai = 0;
for (const kursus of KURSUS) {
  for (let n = 1; n <= 14; n += 1) {
    const rel = `${kursus}/Modul/Modul-${n}.html`;
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, "utf8");
    const f = RX_FORUM.exec(html), t = RX_TUGAS.exec(html);
    if (!f || !t) throw new Error(`${rel}: tombol tab-forum/tab-tugas tidak ditemukan`);
    if (f.index < t.index) { sesuai += 1; continue; }
    const tanpaForum = html.slice(0, f.index) + html.slice(f.index + f[0].length);
    const t2 = RX_TUGAS.exec(tanpaForum);
    const baris = "\n" + t2[1] + f[0].slice(1 + f[1].length);
    const baru = tanpaForum.slice(0, t2.index) + baris + tanpaForum.slice(t2.index);
    fs.writeFileSync(file, baru, "utf8");
    diubah += 1;
  }
}
console.log(`urut-tab-forum: ${diubah} halaman diubah, ${sesuai} sudah sesuai`);
