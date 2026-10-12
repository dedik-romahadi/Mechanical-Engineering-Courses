/**
 * Blok "Cara hitung nilai & bobot Sub-CPMK" (details#obeInfo) di halaman UTS/UAS:
 * total bobot dan tabel Sub-CPMK/Bobot/Soal harus sama dengan berkas asesmen SIA
 * (<Kursus>/Attributes/Asesmen-*.json) dan pemetaan OBE di backend.
 *
 * MASALAHNYA (12 Oktober 2026). Tiga halaman membawa tabel salinan lama:
 *   - Sistem Kendali Cerdas UTS: Σ25%, Sub-CPMK 1.1–3.2  (SIA: Σ22%, 1.1, 1.2, 2.1, 2.2)
 *   - Sistem Kendali Cerdas UAS: Σ24%, Sub-CPMK 3.3–6.3 per pertemuan (SIA: Σ30%, 4.1–5.4)
 *   - Teknik Tenaga Listrik UTS: Σ25% benar, tetapi tabelnya salinan Sisken lama
 *     (SIA: 1.1, 1.2, 1.3, 2.1, 3.1 = 2/3/5/7/8)
 * Halaman TTL dan Sisken tidak dibangun generator (CAD dibangun scripts/cad-exam/bangun.py
 * dari konfigurasinya sendiri), jadi blok ini diperbaiki di tempat.
 *
 * YANG DILAKUKAN. Untuk halaman di DATA: angka total dan isi <tbody> blok diganti dari
 * DATA. Kolom "Soal" adalah nomor soal pada urutan penilaian OBE backend (OBE_EXAM_CONFIG
 * mapping), sama dengan nomor Q di halaman. Bobot diperiksa terhadap berkas asesmen
 * sebelum menulis. validate-public-security.mjs (periksaBobotUjian) menjaga ke-12 halaman.
 *
 * Idempoten; jalan kedua melaporkan 0 halaman.
 *   node scripts/bobot-ujian-obe.mjs            # terapkan
 *   node scripts/bobot-ujian-obe.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

// [Sub-CPMK, bobot %, nomor soal] — bobot dari SIA, nomor soal dari OBE_EXAM_CONFIG backend.
const DATA = {
  "Sistem-Kendali-Cerdas/Exam/UTS.html": [
    ["1.1", 4, "Q1-8"], ["1.2", 10, "Q9-29"], ["2.1", 4, "Q30-37"], ["2.2", 4, "Q38-45"],
  ],
  "Sistem-Kendali-Cerdas/Exam/UAS.html": [
    ["4.1", 6, "Q1-9"], ["4.2", 5, "Q10-17"], ["4.3", 5, "Q18-25"], ["5.1", 2, "Q26-28"],
    ["5.2", 4, "Q29-34"], ["5.3", 4, "Q35-40"], ["5.4", 4, "Q41-45"],
  ],
  "Teknik-Tenaga-Listrik/Exam/UTS.html": [
    ["1.1", 2, "Q1-4"], ["1.2", 3, "Q5-8, 11-13"], ["1.3", 5, "Q9-10, 14-19, 31-33"],
    ["2.1", 7, "Q20-25, 34-37, 41-42"], ["3.1", 8, "Q26-30, 38-40, 43-45"],
  ],
};

const RX_TOTAL = /(dengan total bobot Σ <b>)(\d+)(%<\/b> dari nilai akhir mata kuliah\.)/;
const RX_TBODY = /(<details[^>]*id="obeInfo"[\s\S]*?<tbody>\n)([\s\S]*?)(\s*<\/tbody>)/;
const baris = ([sub, bobot, soal]) =>
  `              <tr><td style="padding:2px 0">${sub}</td><td align="right" style="padding:2px 0">${bobot}%</td><td align="right" style="padding:2px 0;color:#94a3b8">${soal}</td></tr>`;

function bobotSia(rel) {
  const kursus = rel.split("/")[0];
  const jenis = /UTS\.html$/.test(rel) ? "uts" : "uas";
  const dir = path.join(root, kursus, "Attributes");
  const f = fs.readdirSync(dir).find((n) => /^Asesmen-.*\.json$/.test(n));
  const a = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const sub = {};
  for (const s of a.sub_cpmk) {
    const b = (s.bobot || {})[jenis] || 0;
    if (b) sub[s.kode.replace("Sub-CPMK ", "")] = b;
  }
  return { total: a.asesmen.total_per_komponen[jenis], sub };
}

let n = 0;
for (const [rel, data] of Object.entries(DATA)) {
  const f = path.join(root, rel);
  const html = fs.readFileSync(f, "utf8");
  if (html.includes("\r")) throw new Error(`${rel}: berkas memuat CR`);
  const sia = bobotSia(rel);
  const total = data.reduce((s, r) => s + r[1], 0);
  const cocok = total === sia.total && data.length === Object.keys(sia.sub).length && data.every(([s, b]) => sia.sub[s] === b);
  if (!cocok) throw new Error(`${rel}: DATA tidak sama dengan berkas asesmen SIA (Σ${total} vs Σ${sia.total})`);
  if ((html.match(new RegExp(RX_TOTAL.source, "g")) || []).length !== 1) throw new Error(`${rel}: kalimat total bobot harus tepat satu`);
  if (!RX_TBODY.test(html)) throw new Error(`${rel}: tbody blok obeInfo tidak ditemukan`);
  const baru = html
    .replace(RX_TOTAL, (_, a, _b, c) => a + total + c)
    .replace(RX_TBODY, (_, a, _isi, c) => a + data.map(baris).join("\n") + c);
  if (baru === html) continue;
  n += 1;
  if (!periksa) fs.writeFileSync(f, baru);
}
console.log(`${n} dari ${Object.keys(DATA).length} halaman ujian ${periksa ? "akan diperbarui" : "diperbarui"}`);
