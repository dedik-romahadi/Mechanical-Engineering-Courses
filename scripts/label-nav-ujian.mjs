/**
 * Label navbar (`.nav-brand`) 12 halaman UTS/UAS mengikuti label course di
 * halaman modulnya sendiri: `<LABEL> // UTS` dan `<LABEL> // UAS`.
 *
 * MASALAHNYA. Halaman ujian Sistem Kendali Cerdas dan Teknik Tenaga Listrik
 * disalin dari kerangka Getaran Mekanik, dan UTS/UAS Pemodelan CAD dibangkitkan
 * dari TTL (scripts/cad-exam/bangun.py). Label navbarnya ikut terbawa:
 * "GETARANMESIN // UTS" di mata kuliah yang bukan Getaran, padahal ke-14 modul
 * course itu berlabel SISKENCERDAS / TENAGALISTRIK / PEMODELANCAD.
 *
 * YANG DILAKUKAN. Label course dibaca dari navbar ke-14 halaman
 * <Kursus>/Modul/Modul-N.html (`<span>LABEL // M1</span>` atau `// P1` di
 * Getaran) — semuanya wajib sama — lalu satu-satunya `.nav-brand` di
 * <Kursus>/Exam/UTS.html dan UAS.html ditulis `<span>LABEL // UTS|UAS</span>`.
 * Tidak ada peta label terpisah yang bisa menyimpang dari halaman modul.
 *
 * UTS/UAS Pemodelan CAD: scripts/cad-exam/bangun.py memetakan
 * `TENAGALISTRIK // <UTS|UAS>` kerangka TTL menjadi `PEMODELANCAD // <UTS|UAS>`,
 * jadi jalankan skrip ini (pada TTL) sebelum membangun ulang CAD; hasil bangun
 * ulang identik dengan hasil skrip ini dan `--periksa` sesudahnya harus 0.
 *
 * CAKUPAN: <Kursus>/Exam/UTS.html dan UAS.html saja (bukan salinan konflik
 * OneDrive *-DEDIK-PC.html). Tidak menyentuh blok AI-CHAT-AGENT.
 *
 * Idempoten: halaman yang labelnya sudah benar tidak ditulis; jalan kedua
 * melaporkan 0 halaman.
 *
 * Pakai:
 *   node scripts/label-nav-ujian.mjs            # terapkan
 *   node scripts/label-nav-ujian.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

const RX_NAV = /<span class="nav-brand"><span class="pulse"><\/span><span>([A-Z0-9]+) \/\/ ([A-Z]+\d*)<\/span><\/span>/g;

/** Label course dari navbar halaman modul; semua modul wajib sepakat. */
function labelKursus(kursus) {
  const dir = path.join(root, kursus, "Modul");
  const modul = fs.readdirSync(dir).filter((f) => /^Modul-\d+\.html$/.test(f));
  if (!modul.length) throw new Error(`${kursus}: tidak ada halaman Modul-N.html untuk membaca label course`);
  const label = new Set();
  for (const f of modul) {
    const nav = [...fs.readFileSync(path.join(dir, f), "utf8").matchAll(RX_NAV)];
    if (nav.length !== 1 || !/^[MP]\d+$/.test(nav[0][2])) {
      throw new Error(`${kursus}/Modul/${f}: navbar modul harus tepat satu "<LABEL> // M<n>|P<n>", ditemukan ${nav.length}`);
    }
    label.add(nav[0][1]);
  }
  if (label.size !== 1) throw new Error(`${kursus}: label navbar modul tidak seragam (${[...label].join(", ")})`);
  return [...label][0];
}

let n = 0;
let total = 0;
const rekap = {};
for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
  if (!kursus.isDirectory()) continue;
  for (const jenis of ["UTS", "UAS"]) {
    const f = path.join(root, kursus.name, "Exam", `${jenis}.html`);
    if (!fs.existsSync(f)) continue;
    total += 1;
    const rel = path.relative(root, f).split(path.sep).join("/");
    const html = fs.readFileSync(f, "utf8");
    if (html.includes("\r")) throw new Error(`${rel}: berkas memuat CR; repo ini LF (.gitattributes eol=lf)`);
    const nav = [...html.matchAll(RX_NAV)];
    if (nav.length !== 1) throw new Error(`${rel}: .nav-brand harus tepat satu, ditemukan ${nav.length}`);
    if (nav[0][2] !== jenis) throw new Error(`${rel}: navbar menyebut "${nav[0][2]}", harusnya "${jenis}"`);
    const label = labelKursus(kursus.name);
    if (nav[0][1] === label) continue;
    const baru = html.replace(nav[0][0], () => `<span class="nav-brand"><span class="pulse"></span><span>${label} // ${jenis}</span></span>`);
    n += 1;
    const kunci = `${nav[0][1]}->${label}`;
    rekap[kunci] = (rekap[kunci] || 0) + 1;
    if (!periksa) fs.writeFileSync(f, baru);
  }
}
if (total !== 12) throw new Error(`harap 12 halaman <Kursus>/Exam/UTS.html|UAS.html, ditemukan ${total}`);
console.log(`${n} dari ${total} halaman ujian ${periksa ? "akan diperbarui" : "diperbarui"}: ${JSON.stringify(rekap)}`);
