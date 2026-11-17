#!/usr/bin/env node
// Pisahkan draft lokal OBE per mata kuliah dan beri nama file ekspor SIA yang benar.
//
// Sampai 17 Nov 2026 keenam OBE/Penilaian-OBE.htm memakai localStorage yang sama
// ('opto-obe-nilai-v1' untuk nilai Sub-CPMK, 'opto-obe-pre-override-v1' untuk PRE),
// warisan templat Optimalisasi. Akibatnya draft satu course tercampur dengan course
// lain (NIM yang sama di dua course saling menimpa) dan "Reset Lokal" menghapus draft
// keenam course sekaligus. Nama file "File Import .xls" juga selalu berakhiran
// _347514 (kode kelas SIA Optimalisasi Genap 2025).
//
// Skrip ini (idempoten) menulis kunci per course dan konstanta SIA_KODEKELAS.
// Draft di kunci lama tidak dipindahkan (isinya campuran; tidak bisa dipilah dengan
// aman) dan tidak dihapus — draft baru dibangun ulang dengan Tarik & Hitung, PRE
// dengan "Update PRE dari .xls SIA".
//
//   node scripts/obe-kunci-per-kursus.mjs            # terapkan
//   node scripts/obe-kunci-per-kursus.mjs --periksa  # gagal bila belum diterapkan
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KURSUS = [
  // folder, courseId (sama dengan COURSE_ID halaman), kode kelas SIA (kodekelas di URL nilaiobe)
  ["Engineering-Mathematics", "math4", "348504"],
  ["Getaran-Mekanik", "getaran_mekanik", "349216"],
  ["Optimalisasi-dan-Automasi", "optoauto", "347514"],
  ["Sistem-Kendali-Cerdas", "sistem_kendali_cerdas", "350131"],
  ["Pemodelan-Computer-Aided-Design", "pemodelan_cad", "354322"],
  ["Teknik-Tenaga-Listrik", "teknik_tenaga_listrik", "354290"],
];
const periksa = process.argv.includes("--periksa");
let gagal = 0;

for (const [folder, courseId, kodekelas] of KURSUS) {
  const file = path.join(ROOT, folder, "OBE", "Penilaian-OBE.htm");
  const asli = fs.readFileSync(file, "utf8");
  let h = asli;
  const cid = asli.match(/const COURSE_ID = '([^']+)';/);
  if (!cid || cid[1] !== courseId) throw new Error(`${folder}: COURSE_ID ${cid && cid[1]} ≠ ${courseId}`);

  const lsBaru = `const LS_KEY = 'obe-nilai-${courseId}-v2';  // per course (OBE-KUNCI-PER-KURSUS); dulu 'opto-obe-nilai-v1' bersama`;
  const preBaru = `const PRE_KEY = 'obe-pre-override-${courseId}-v2';  // per course (OBE-KUNCI-PER-KURSUS); dulu 'opto-obe-pre-override-v1' bersama`;
  h = h.replace(/^const LS_KEY = [^\n]*$/m, lsBaru);
  h = h.replace(/^const PRE_KEY = [^\n]*$/m, preBaru);

  const kodeBaru = `const SIA_KODEKELAS = '${kodekelas}';  // kodekelas SIA (akad.php/nilaiobe/lst/<kodekelas>) — akhiran nama file ekspor`;
  if (/^const SIA_KODEKELAS = [^\n]*$/m.test(h)) h = h.replace(/^const SIA_KODEKELAS = [^\n]*$/m, kodeBaru);
  else h = h.replace(/^(const SIA_CLASS_TOKEN = [^\n]*)$/m, `$1\n${kodeBaru}`);
  h = h.split("`Form_Nilai_${form.label}_${SIA_CLASS_TOKEN}_347514.xls`").join("`Form_Nilai_${form.label}_${SIA_CLASS_TOKEN}_${SIA_KODEKELAS}.xls`");

  const cek = [
    [h.includes(lsBaru), "LS_KEY per course"],
    [h.includes(preBaru), "PRE_KEY per course"],
    [h.includes(kodeBaru), "SIA_KODEKELAS"],
    [h.includes("_${SIA_KODEKELAS}.xls`"), "nama file ekspor"],
    [!/opto-obe-(nilai|pre-override)-v1'\s*;/.test(h), "kunci bersama lama tidak dipakai"],
    [!h.includes("_347514.xls`"), "akhiran _347514 tetap"],
  ];
  for (const [ok, apa] of cek) if (!ok) { gagal++; console.error(`✗ ${folder}: ${apa}`); }

  if (periksa) {
    if (h !== asli) { gagal++; console.error(`✗ ${folder}: belum diterapkan (jalankan tanpa --periksa)`); }
  } else if (h !== asli) {
    fs.writeFileSync(file, h, "utf8");
    console.log(`✓ ${folder}: diperbarui`);
  } else console.log(`· ${folder}: sudah sesuai`);
}
if (gagal) { console.error(`OBE-KUNCI-PER-KURSUS: ${gagal} masalah`); process.exit(1); }
console.log("OBE-KUNCI-PER-KURSUS: 6 halaman OBE sesuai");
