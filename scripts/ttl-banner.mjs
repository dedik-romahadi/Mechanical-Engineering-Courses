#!/usr/bin/env node
// Generator banner LMS Teknik Tenaga Listrik (Semester Ganjil 2026/2027, kelas 2F
// Sabtu Reguler 2, kode SIA 2A51362F, Moodle course id 5923).
//
// Desain mengikuti banner Sistem Kendali Cerdas (Sistem-Kendali-Cerdas/Banner);
// susunan section mengikuti pola Getaran/Opto/Math (satu section per pekan,
// banner di ringkasan section, Google Meet + Attendance pada pekan TMV/TMK,
// Tugas + Forum pada tiap modul, UTS/UAS pada pekannya sendiri).
//
// Kebijakan dosen (19 Sep 2026): Google Meet, Attendance, Tugas, dan Forum dibuat
// PADA PEKANNYA lewat form "Add an activity" di LMS (Google Meet wajib lewat UI form
// agar room dibuat plugin). Banner boleh dipasang lebih dulu, tetapi tombol Meet dan
// tombol modul tampil nonaktif sampai pekannya tiba dan tautannya ada.
// Jalankan ulang setiap kali: modul baru terbit (tambahkan ke PUBLISHED),
// Google Meet pekan TMV dibuat (isi MEET_URL), atau jadwal berubah.
//   node scripts/ttl-banner.mjs
// Keluaran: Teknik-Tenaga-Listrik/Banner/*.html (100% inline style, tanpa JS).

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "Teknik-Tenaga-Listrik", "Banner");
const BASE = "https://dedik-romahadi.github.io/Mechanical-Engineering-Courses/Teknik-Tenaga-Listrik";

// ---------- konfigurasi yang berubah dari pekan ke pekan ----------
export const PUBLISHED = [1, 2, 3, 4, 5, 6, 7]; // nomor modul yang halamannya sudah terbit
export const EXAM_PUBLISHED = { UTS: true, UAS: false };
// Tautan room Google Meet per pertemuan TMV — diisi PADA PEKANNYA setelah aktivitas
// Google Meet™ for Moodle dibuat lewat UI form LMS (room dibuat otomatis oleh plugin).
// Pertemuan yang belum ada di sini memakai tombol nonaktif "Google Meet belum dibuka".
export const MEET_URL = { 1: "https://meet.google.com/kpn-jaex-kxg" };
export const WA_URL = "https://chat.whatsapp.com/ELpExbiM33dBebdXJMzYFx"; // grup WhatsApp kelas 2F
export const RUANG = "B-304-2";
export const JAM = "12:00–13:40 WIB";

// ---------- kalender perkuliahan Fast Learning, kelas 2F Sabtu Reguler 2 ----------
// tipe: TMV = tatap muka virtual, DARING = daring/asinkron, TMK = tatap muka kelas
// (keputusan dosen 19 Sep 2026: P9 dan P15 yang di kalender Fast Learning bertipe TMK
//  dijalankan sebagai TMV, jadi tidak ada pekan TMK)
export const KALENDER = [
  { p: 1, tipe: "TMV", tgl: "2026-09-19", modul: 1 },
  { p: 2, tipe: "DARING", tgl: "2026-09-26", modul: 2 },
  { p: 3, tipe: "TMV", tgl: "2026-10-03", modul: 3 },
  { p: 4, tipe: "DARING", tgl: "2026-10-10", modul: 4 },
  { p: 5, tipe: "TMV", tgl: "2026-10-17", modul: 5 },
  { p: 6, tipe: "DARING", tgl: "2026-10-24", modul: 6 },
  { p: 7, tipe: "TMV", tgl: "2026-10-31", modul: 7 },
  { p: 8, tipe: "UTS", tgl: "2026-11-07", akhir: "2026-11-20" },
  { p: 9, tipe: "TMV", tgl: "2026-11-21", modul: 8 },
  { p: 10, tipe: "DARING", tgl: "2026-11-28", modul: 9 },
  { p: 11, tipe: "TMV", tgl: "2026-12-05", modul: 10 },
  { p: 12, tipe: "DARING", tgl: "2026-12-12", modul: 11 },
  { p: 13, tipe: "TMV", tgl: "2026-12-19", modul: 12 },
  { p: 14, tipe: "DARING", tgl: "2026-12-26", modul: 13 },
  { p: 15, tipe: "TMV", tgl: "2027-01-02", modul: 14 },
  { p: 16, tipe: "UAS", tgl: "2027-01-09", akhir: "2027-01-22" },
];

// ---------- materi per modul (Modul N = Sub-CPMK ke-N, mengikuti RPS revisi 14 Sep 2026) ----------
export const MODUL = [
  { n: 1, sub: "1.1", judul: "Konsep Dasar <span style=\"color:#67e8f9;\">Sistem Tenaga</span> Listrik",
    judulPolos: "Konsep Dasar Sistem Tenaga Listrik",
    desk: "Membangun kosakata dan alat hitung pertama: pengertian dan peran sistem tenaga listrik, rantai pembangkitan–transmisi–distribusi–beban beserta tingkat tegangannya, daya satu dan tiga fasa, alasan transmisi bertegangan tinggi, generator dan frekuensi, hingga kurva beban.",
    chips: ["&#9889; Bagian-bagian STL", "&#128268; Tingkat Tegangan", "&#128208; Daya 1 &amp; 3 Fasa", "&#128013; Python"] },
  { n: 2, sub: "1.2", judul: "Komponen <span style=\"color:#67e8f9;\">Sistem Tenaga</span> Listrik",
    judulPolos: "Komponen Sistem Tenaga Listrik",
    desk: "Membedah generator, transformator daya, saluran, gardu induk, rel (busbar), dan pemutus tenaga: fungsi tiap komponen, spesifikasi rating kVA/MVA dan tegangan, serta perhitungan rating dan efisiensinya.",
    chips: ["Generator", "Transformator Daya", "Gardu Induk &amp; PMT", "Rating kVA/MVA"] },
  { n: 3, sub: "1.3", judul: "Daya pada Jaringan <span style=\"color:#67e8f9;\">DC Satu Sumber</span>",
    judulPolos: "Daya pada Jaringan DC dengan Satu Sumber Tegangan",
    desk: "Menerapkan hukum Ohm dan Kirchhoff pada rangkaian seri–paralel bersumber tunggal untuk menghitung arus, daya, energi, rugi, dan efisiensi, termasuk syarat transfer daya maksimum.",
    chips: ["Hukum Ohm", "Hukum Kirchhoff", "Seri–Paralel", "Transfer Daya Maksimum"] },
  { n: 4, sub: "2.1", judul: "Daya pada Jaringan <span style=\"color:#67e8f9;\">DC Multi-Sumber</span>",
    judulPolos: "Daya pada Jaringan DC dengan Dua atau Lebih Sumber Tegangan",
    desk: "Menyusun dan menyelesaikan persamaan mesh dan nodal, memakai teorema superposisi, Thevenin, dan Norton, serta menghitung pembagian beban dan daya tiap sumber pada jaringan DC bersumber ganda.",
    chips: ["Analisis Mesh", "Analisis Nodal", "Superposisi", "Thevenin &amp; Norton"] },
  { n: 5, sub: "2.2", judul: "Daya pada Jaringan <span style=\"color:#67e8f9;\">Listrik AC</span>",
    judulPolos: "Daya pada Jaringan Listrik AC",
    desk: "Menggunakan fasor dan impedansi untuk menghitung daya aktif, reaktif, dan semu, faktor daya dan segitiga daya, serta tegangan, arus, dan daya pada sistem tiga fasa seimbang.",
    chips: ["Fasor &amp; Impedansi", "P, Q, S", "Faktor Daya", "Tiga Fasa Seimbang"] },
  { n: 6, sub: "3.1", judul: "Aliran Daya, Transien, dan <span style=\"color:#67e8f9;\">Kompensasi Reaktif</span> Saluran Transmisi",
    judulPolos: "Aliran Daya dan Transien pada Saluran Transmisi serta Kompensasi Reaktif",
    desk: "Menghitung aliran daya, regulasi tegangan, dan efisiensi pada model saluran pendek, menengah, dan panjang; menentukan kebutuhan kompensasi reaktif seri dan shunt; mengenal transien gelombang berjalan.",
    chips: ["Model Saluran", "Regulasi Tegangan", "Kompensasi Seri/Shunt", "Gelombang Berjalan"] },
  { n: 7, sub: "3.2", judul: "Reaktansi dan <span style=\"color:#67e8f9;\">Impedansi</span> Sistem Tenaga",
    judulPolos: "Reaktansi dan Impedansi di Sistem Tenaga Listrik",
    desk: "Menghitung reaktansi generator dan transformator, impedansi ekuivalen dengan transformasi star–delta, besaran per unit (PU), dan MVA hubung singkat sebagai bekal analisis gangguan.",
    chips: ["Reaktansi Generator/Trafo", "Star–Delta", "Sistem Per Unit", "MVA Hubung Singkat"] },
  { n: 8, sub: "4.1", judul: "Sistem <span style=\"color:#67e8f9;\">Saluran Transmisi</span>",
    judulPolos: "Sistem Tenaga Listrik Saluran Transmisi",
    desk: "Mengenal klasifikasi SUTT, SUTET, dan SKTT, konstruksi menara, konduktor, dan isolator, gejala korona, serta pemilihan tingkat tegangan dan rugi transmisi pada berbagai tegangan.",
    chips: ["SUTT / SUTET / SKTT", "Menara &amp; Konduktor", "Isolator &amp; Korona", "Rugi Transmisi"] },
  { n: 9, sub: "4.2", judul: "Pemodelan <span style=\"color:#67e8f9;\">Saluran Transmisi</span>",
    judulPolos: "Pemodelan Saluran Transmisi",
    desk: "Menghitung parameter R, L, dan C saluran dari GMR/GMD, menerapkan model nominal-π dan konstanta ABCD, serta impedansi karakteristik saluran panjang.",
    chips: ["Parameter R, L, C", "GMR / GMD", "Model Nominal-π", "Konstanta ABCD"] },
  { n: 10, sub: "5.1", judul: "Kompensasi dalam <span style=\"color:#67e8f9;\">Sistem Distribusi</span>",
    judulPolos: "Kompensasi dalam Sistem Distribusi",
    desk: "Menghitung kebutuhan kVAR kapasitor bank untuk perbaikan faktor daya, penurunan rugi daya dan jatuh tegangan, penempatan dan ukuran kompensator, serta peran regulator tegangan.",
    chips: ["Kapasitor Bank", "Perbaikan Faktor Daya", "Jatuh Tegangan", "Regulator Tegangan"] },
  { n: 11, sub: "5.2", judul: "Konsep Dasar <span style=\"color:#67e8f9;\">Sistem Distribusi</span>",
    judulPolos: "Konsep dan Teori Dasar Sistem Distribusi Tenaga Listrik",
    desk: "Membandingkan konfigurasi radial, loop, spindle, dan mesh, jaringan tegangan menengah dan rendah, gardu distribusi, serta menghitung jatuh tegangan dan rugi pada penyulang.",
    chips: ["Radial / Loop / Spindle", "JTM &amp; JTR", "Gardu Distribusi", "Rugi Penyulang"] },
  { n: 12, sub: "6.1", judul: "Aliran Daya, Peralatan, dan <span style=\"color:#67e8f9;\">Pengembangan</span> Distribusi",
    judulPolos: "Aliran Daya, Peralatan, dan Pengembangan Sistem Distribusi",
    desk: "Mengenal fuse, recloser, relai arus lebih, dan PMT, menghitung arus gangguan dan mengoordinasikan proteksi, serta meramalkan beban untuk pengembangan jaringan distribusi.",
    chips: ["Fuse &amp; Recloser", "Relai Arus Lebih", "Koordinasi Proteksi", "Peramalan Beban"] },
  { n: 13, sub: "7.1", judul: "Metode <span style=\"color:#67e8f9;\">Single Line Diagram</span>",
    judulPolos: "Metode Single Line Diagram",
    desk: "Menyusun single line diagram dengan simbol dan kaidah baku, menurunkannya menjadi diagram impedansi dan reaktansi, serta mengubah data peralatan menjadi diagram per unit.",
    chips: ["Simbol &amp; Kaidah SLD", "Diagram Impedansi", "Diagram Reaktansi", "Per Unit"] },
  { n: 14, sub: "7.2", judul: "Analisis Aliran Daya <span style=\"color:#67e8f9;\">(Load Flow)</span>",
    judulPolos: "Metode Analisis Aliran Daya (Load Flow)",
    desk: "Mengklasifikasikan bus, menyusun matriks admitansi Ybus dan persamaan aliran daya, lalu menjalankan iterasi Gauss–Seidel dan mengenal Newton–Raphson dengan Python.",
    chips: ["Klasifikasi Bus", "Matriks Ybus", "Gauss–Seidel", "Newton–Raphson"] },
];

// ---------- util tanggal (WIB) ----------
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const BULAN_PENDEK = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const tgl = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
export const fmtPanjang = (iso) => { const d = tgl(iso); return `${HARI[d.getUTCDay()]}, ${d.getUTCDate()} ${BULAN[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
export const fmtPendek = (iso) => { const d = tgl(iso); return `${d.getUTCDate()} ${BULAN_PENDEK[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
export const plusHari = (iso, n) => { const d = tgl(iso); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const deadlineIso = (iso) => plusHari(iso, 6); // konvensi modul: +6 hari, 23:59 WIB
export const rentang = (a, b) => { const da = tgl(a), db = tgl(b); const sameM = da.getUTCMonth() === db.getUTCMonth(); return sameM ? `${da.getUTCDate()}–${db.getUTCDate()} ${BULAN[db.getUTCMonth()]} ${db.getUTCFullYear()}` : `${da.getUTCDate()} ${BULAN[da.getUTCMonth()]} – ${db.getUTCDate()} ${BULAN[db.getUTCMonth()]} ${db.getUTCFullYear()}`; };

export const TIPE = {
  TMV: { label: "KELAS TMV · ONLINE", nama: "Tatap Muka Virtual", bg: "#3a2710", bd: "#78521d", fg: "#fcd58a" },
  DARING: { label: "KELAS DARING · ASINKRON", nama: "Daring", bg: "#0c2940", bd: "#1d5873", fg: "#8ce8ff" },
  TMK: { label: `TATAP MUKA KELAS · ${RUANG}`, nama: "Tatap Muka Kelas", bg: "#14321f", bd: "#2f7a4a", fg: "#a7f3d0" },
  UTS: { label: "UJIAN TENGAH SEMESTER", nama: "UTS", bg: "#3a2710", bd: "#78521d", fg: "#fcd58a" },
  UAS: { label: "UJIAN AKHIR SEMESTER", nama: "UAS", bg: "#3b1a26", bd: "#9f1239", fg: "#fecdd3" },
};

// ---------- potongan gaya bersama (identik dengan banner Sisken) ----------
const WRAP_OPEN = '<div style="background:#07101f;font-family:\'Segoe UI\',Arial,sans-serif;border-radius:22px;overflow:hidden;border:1px solid #22345a;color:#eaf2ff;box-shadow:0 16px 36px rgba(2,8,23,.28);"><div style="height:5px;background:linear-gradient(90deg,#22d3ee 0%,#6366f1 42%,#a855f7 72%,#f59e0b 100%);"></div><div style="padding:14px 18px;background:radial-gradient(circle at 82% 18%,rgba(168,85,247,.22),transparent 34%),radial-gradient(circle at 8% 90%,rgba(34,211,238,.13),transparent 32%),#07101f;">';
const FOOTER = (tahun = "2026/2027") => `<div style="padding:6px 18px;background:#0a1527;border-top:1px solid #22345a;color:#8ea1bd;font-size:10px;">Dedik Romahadi &middot; Teknik Tenaga Listrik &middot; S1 Teknik Mesin &middot; Universitas Mercu Buana &middot; ${tahun}</div></div>`;
const pill = (teks, bg, bd, fg, extra = "") => `<span style="display:inline-block;${extra}margin-bottom:3px;padding:3px 9px;border-radius:999px;background:${bg};border:1px solid ${bd};color:${fg};font-size:10px;font-weight:800;letter-spacing:1px;">${teks}</span>`;
const chip = (teks, i) => i % 2 === 0
  ? `<span style="display:inline-block;margin:0 4px 4px 0;padding:3px 8px;border-radius:7px;background:#0c2940;border:1px solid #1d5873;color:#8ce8ff;font-size:11px;">${teks}</span>`
  : `<span style="display:inline-block;margin:0 4px 4px 0;padding:3px 8px;border-radius:7px;background:#17264a;border:1px solid #334f87;color:#b9d3ff;font-size:11px;">${teks}</span>`;
const btnAktif = (href, ikon, teks, gaya) => `<a href="${href}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;box-sizing:border-box;${gaya}color:#fff;text-decoration:none;font-size:11.5px;line-height:1.3;font-weight:800;"><span style="font-size:16px;line-height:1;">${ikon}</span><span>${teks}</span></a>`;
const btnMati = (ikon, teks, mt = 6) => `<span role="button" aria-disabled="true" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;box-sizing:border-box;margin-top:${mt}px;padding:8px 10px;border-radius:10px;background:#334155;color:#cbd5e1;font-size:11.5px;line-height:1.3;font-weight:800;border:1px solid #64748b;cursor:not-allowed;"><span style="font-size:16px;line-height:1;">${ikon}</span><span>${teks}</span></span>`;
const GAYA_MODUL = "margin-top:7px;padding:8px 10px;border-radius:10px;background:linear-gradient(135deg,#0891b2,#4f46e5 62%,#7e22ce);box-shadow:0 8px 22px rgba(79,70,229,.35);";
const GAYA_MEET = "margin-top:6px;padding:8px 10px;border-radius:10px;background:#0f766e;border:1px solid #2dd4bf;";

// ---------- banner pertemuan (modul) ----------
export function bannerPertemuan(k) {
  const m = MODUL.find((x) => x.n === k.modul);
  const t = TIPE[k.tipe];
  const dl = deadlineIso(k.tgl);
  const terbit = PUBLISHED.includes(m.n);
  const alur = k.tipe === "TMV"
    ? "1. Ikuti TMV lewat Google Meet<br>2. Baca materi dan contoh<br>3. Kerjakan 25 soal / 50 poin<br>4. Jawab 3 diskusi Forum<br>5. Export HTML dan submit di LMS"
    : k.tipe === "TMK"
      ? `1. Hadir di ruang ${RUANG}<br>2. Baca materi dan contoh<br>3. Kerjakan 25 soal / 50 poin<br>4. Jawab 3 diskusi Forum<br>5. Export HTML dan submit di LMS`
      : "1. Baca materi dan contoh<br>2. Jalankan simulasi Python<br>3. Kerjakan 25 soal / 50 poin<br>4. Jawab 3 diskusi Forum<br>5. Export HTML dan submit di LMS";
  const tombolModul = terbit
    ? btnAktif(`${BASE}/Modul/Modul-${m.n}.html`, "&#128214;", `Buka Modul, Tugas,<br>dan Forum ${m.n} &rarr;`, GAYA_MODUL)
    : btnMati("&#128214;", `Modul ${m.n} terbit<br>menjelang pertemuan`, 7);
  let tombolKedua = "";
  if (k.tipe === "TMV") {
    tombolKedua = MEET_URL[k.p]
      ? btnAktif(MEET_URL[k.p], "&#127909;", "Masuk Google Meet Hari Ini", GAYA_MEET)
      : btnMati("&#127909;", "Google Meet belum dibuka");
  } else if (k.tipe === "TMK") {
    tombolKedua = `<div style="margin-top:6px;padding:8px 10px;border-radius:10px;background:#14321f;border:1px solid #2f7a4a;color:#a7f3d0;font-size:11.5px;font-weight:800;line-height:1.4;">&#127979; Tatap muka di ruang ${RUANG}<br><span style="font-weight:600;color:#d1fae5;">Sabtu, ${JAM}</span></div>`;
  }
  return `<!-- Banner Pertemuan ${k.p} / Modul ${m.n} Teknik Tenaga Listrik — LMS compatible, inline styles; dibuat oleh scripts/ttl-banner.mjs -->
${WRAP_OPEN}<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td valign="top" style="padding-right:14px;"><div style="margin-bottom:7px;">${pill(`PERTEMUAN ${k.p}`, "#12304a", "#287da0", "#8ce8ff")}${pill(`SUB-CPMK ${m.sub}`, "#28184c", "#6336a5", "#d8b4fe", "margin-left:5px;")}${pill(t.label, t.bg, t.bd, t.fg, "margin-left:5px;")}</div><h2 style="margin:0 0 5px;color:#ffffff;font-size:20px;line-height:1.2;letter-spacing:-.3px;">${m.judul}</h2><p style="margin:0 0 7px;color:#c4d3ea;font-size:12.5px;line-height:1.5;">${m.desk}</p><div style="margin-bottom:5px;">${m.chips.map(chip).join("")}</div><div style="display:block;padding:5px 10px;border-radius:8px;background:#0b172a;border:1px solid #26395c;font-size:10.5px;line-height:1.5;color:#d6e2f5;">&#128197; <strong style="color:#fff;">${fmtPanjang(k.tgl)}</strong> &middot; ${JAM} &middot; ${t.nama}<br>&#9203; Deadline Tugas &amp; Forum: <strong style="color:#fcd34d;">${fmtPanjang(dl)}, 23:59 WIB</strong></div></td><td width="212" valign="top" style="text-align:center;"><div style="background:#0b172a;border:1px solid #26395c;border-radius:12px;padding:9px 11px;text-align:left;"><div style="font-size:10px;font-weight:800;color:#93c5fd;letter-spacing:1px;margin-bottom:5px;">ALUR PEMBELAJARAN</div><div style="font-size:10.5px;line-height:1.5;color:#d6e2f5;">${alur}</div><div style="height:1px;background:#26395c;margin:7px 0;"></div><div style="font-size:9.5px;line-height:1.5;color:#f8c77b;"><strong>&#9200; Aturan terlambat:</strong><br>Setelah deadline, poin setiap soal dipotong <strong>35%</strong>.</div></div>${tombolModul}${tombolKedua}</td></tr></table></div>${FOOTER()}
`;
}

// ---------- banner UTS / UAS (gaya section UTS/UAS Sisken) ----------
export function bannerUjian(k) {
  const uts = k.tipe === "UTS";
  const warna = uts
    ? { bg: "#150e0a", bd: "#6b4326", fg: "#f6ece1", bar: "linear-gradient(90deg,#f59e0b,#fb923c 45%,#ef4444)", inner: "#1d130d", label: "#fbbf24", teks: "#e3d5c6", muted: "#bda389", kuat: "#fde68a", kartu: "#241810", kartuBd: "#5a3a1f", btn: "linear-gradient(135deg,#d97706,#f59e0b)", btnFg: "#1a1004", foot: "#140d09", footBd: "#3f2a1a", footFg: "#a98f76", bayang: "rgba(23,10,2,.34)" }
    : { bg: "#160a10", bd: "#703049", fg: "#f8e9f0", bar: "linear-gradient(90deg,#e11d48,#fb7185 45%,#f59e0b)", inner: "#1f0e18", label: "#fb7185", teks: "#ecd6e0", muted: "#c39fb2", kuat: "#fbcfe8", kartu: "#2a1220", kartuBd: "#6b2a45", btn: "linear-gradient(135deg,#be123c,#fb7185)", btnFg: "#fff", foot: "#150911", footBd: "#431f31", footFg: "#b08fa0", bayang: "rgba(25,4,15,.34)" };
  const cakupanModul = uts ? "Modul 1–4 dan 6" : "Modul 8–14";
  const cakupanSub = uts ? "Sub-CPMK 1.1, 1.2, 1.3, 2.1, dan 3.1 (sesuai matriks UTS di SIA; Modul 5 dan 7 dinilai lewat Tugas)" : "Sub-CPMK 4.1, 4.2, 5.1, 5.2, 6.1, 7.1, dan 7.2";
  const bobot = uts ? "25%" : "32%";
  const terbit = EXAM_PUBLISHED[k.tipe];
  const tombol = terbit
    ? `<a href="${BASE}/Exam/${k.tipe}.html" target="_blank" rel="noopener noreferrer" style="display:block;box-sizing:border-box;width:100%;margin-top:6px;padding:8px 10px;border-radius:10px;background:${warna.btn};color:${warna.btnFg};text-decoration:none;font-size:12px;font-weight:900;text-align:center;">Buka ${k.tipe} &rarr;</a>`
    : `<span role="button" aria-disabled="true" style="display:block;box-sizing:border-box;width:100%;margin-top:6px;padding:8px 10px;border-radius:10px;background:#334155;color:#cbd5e1;font-size:12px;font-weight:900;text-align:center;border:1px solid #64748b;cursor:not-allowed;">Halaman ${k.tipe} dibuka menjelang ujian</span>`;
  return `<!-- Banner ${k.tipe} Teknik Tenaga Listrik — LMS compatible, inline styles; dibuat oleh scripts/ttl-banner.mjs -->
<div style="background:${warna.bg};font-family:'Segoe UI',Arial,sans-serif;border-radius:18px;overflow:hidden;border:1px solid ${warna.bd};color:${warna.fg};box-shadow:0 14px 30px ${warna.bayang};"><div style="height:4px;background:${warna.bar};"></div><div style="padding:12px 16px;background:${warna.inner};"><table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td valign="top" style="padding-right:14px;"><div style="font-size:10px;font-weight:900;color:${warna.label};letter-spacing:1.4px;margin-bottom:4px;">${k.tipe} &middot; TEKNIK TENAGA LISTRIK &middot; PERTEMUAN ${k.p}</div><h2 style="margin:0 0 4px;color:#fff;font-size:19px;line-height:1.15;">${uts ? "Ujian Tengah Semester" : "Ujian Akhir Semester"}</h2><p style="margin:0 0 6px;color:${warna.teks};font-size:12px;line-height:1.5;">Kerjakan mandiri, lengkapi bukti proses autentik, lalu export dan submit file HTML melalui Fast Learning.</p><div style="font-size:10.5px;line-height:1.5;color:${warna.muted};">Cakupan materi: <strong style="color:${warna.kuat};">${cakupanModul}</strong> (${cakupanSub}).<br>Bentuk: 45 soal &middot; 4 bagian &middot; skala 100 &middot; open-book &middot; Python. Bobot nilai akhir: <strong style="color:${warna.kuat};">${bobot}</strong>.<br>Soal komputasi bersifat parametrik dari 2 digit terakhir NIM.</div></td><td width="232" valign="top"><div style="background:${warna.kartu};border:1px solid ${warna.kartuBd};border-radius:10px;padding:8px 11px;font-size:10.5px;line-height:1.5;color:${warna.fg};"><div style="font-size:10px;font-weight:900;color:${warna.label};letter-spacing:1.2px;margin-bottom:5px;">JADWAL PELAKSANAAN</div><div><strong>Masa ${k.tipe}:</strong> ${rentang(k.tgl, k.akhir)}<br><strong>Hari/Jam:</strong> mengikuti jadwal resmi di web SIA<br><strong>Durasi:</strong> 180 menit + perpanjangan 120 menit (terlambat, potongan 35%)</div></div>${tombol}</td></tr></table></div><div style="padding:5px 16px;background:${warna.foot};border-top:1px solid ${warna.footBd};color:${warna.footFg};font-size:10px;">Soal bersifat parametrik &mdash; angkanya dihitung dari 2 digit terakhir NIM, sehingga jawaban tiap mahasiswa berbeda. Login dengan NIM &amp; PIN Anda, kerjakan sekali submit per soal, lalu export &amp; kumpulkan sebelum batas waktu.</div></div>
`;
}

// strip ringkas untuk pekan kedua masa ujian
export function bannerUjianLanjutan(k) {
  const uts = k.tipe === "UTS";
  const bg = uts ? "#1d130d" : "#1f0e18", bd = uts ? "#6b4326" : "#703049", label = uts ? "#fbbf24" : "#fb7185", fg = uts ? "#e3d5c6" : "#ecd6e0";
  return `<!-- Banner pekan lanjutan ${k.tipe} Teknik Tenaga Listrik; dibuat oleh scripts/ttl-banner.mjs -->
<div style="background:${bg};font-family:'Segoe UI',Arial,sans-serif;border-radius:12px;border:1px solid ${bd};padding:8px 14px;color:${fg};font-size:11.5px;line-height:1.5;"><strong style="color:${label};letter-spacing:1.2px;font-size:10.5px;">MASA ${k.tipe} BERLANJUT</strong><br>Pekan kedua masa ${k.tipe} (${rentang(plusHari(k.tgl, 7), k.akhir)}). Hari dan jam ujian mengikuti jadwal resmi di web SIA; tautan ujian ada pada banner ${k.tipe} di pekan sebelumnya. Perkuliahan Pertemuan ${k.p + 1} dimulai kembali <strong style="color:#fff;">${fmtPanjang(plusHari(k.akhir, 1))}</strong>.</div>
`;
}

// ---------- banner Introduction (General) ----------
export function bannerIntroduction() {
  const tipeWarna = { TMV: ["#3a2710", "#78521d", "#fcd58a"], DARING: ["#0c2940", "#1d5873", "#8ce8ff"], TMK: ["#14321f", "#2f7a4a", "#a7f3d0"], UTS: ["#3a2710", "#78521d", "#fde68a"], UAS: ["#3b1a26", "#9f1239", "#fecdd3"] };
  const baris = (k) => {
    const [bg, bd, fg] = tipeWarna[k.tipe];
    const isi = k.modul ? `Modul ${k.modul}` : "jadwal sesuai web SIA";
    const tanggal = k.akhir ? rentang(k.tgl, k.akhir) : fmtPendek(k.tgl);
    return `<tr><td style="padding:2px 5px;border-bottom:1px solid rgba(255,255,255,.06);font-size:11px;color:#e2e8f0;font-weight:800;">${k.p}</td><td style="padding:2px 5px;border-bottom:1px solid rgba(255,255,255,.06);"><span style="display:inline-block;min-width:52px;text-align:center;padding:2px 7px;border-radius:6px;background:${bg};border:1px solid ${bd};color:${fg};font-size:9.5px;font-weight:800;letter-spacing:.6px;">${k.tipe}</span></td><td style="padding:2px 5px;border-bottom:1px solid rgba(255,255,255,.06);font-size:11px;color:#cbd5e1;white-space:nowrap;">${tanggal}</td><td style="padding:2px 5px;border-bottom:1px solid rgba(255,255,255,.06);font-size:11px;color:#94a3b8;">${isi}</td></tr>`;
  };
  const kiri = KALENDER.slice(0, 8).map(baris).join("");
  const kanan = KALENDER.slice(8).map(baris).join("");
  const outline = (arr) => arr.map((m) => `<strong style="color:#fff;">${String(m.n).padStart(2, "0")}.</strong> ${m.judulPolos}<br>`).join("");
  return `<!--
  BANNER INTRODUCTION — Teknik Tenaga Listrik (Semester Ganjil 2026/2027, kelas 2F Sabtu Reguler 2)
  LMS-Compatible: 100% inline styles, tanpa JavaScript dan aset eksternal; dibuat oleh scripts/ttl-banner.mjs
-->
<div style="background:#070b16;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;border-radius:22px;overflow:hidden;border:1px solid rgba(96,165,250,.18);color:#e2e8f0;">
  <div style="height:5px;background:linear-gradient(90deg,#2563eb,#22d3ee,#8b5cf6,#ec4899,#f59e0b);"></div>

  <div style="padding:18px 22px 14px;position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0;opacity:.05;background-image:radial-gradient(circle,#93c5fd 1px,transparent 1px);background-size:22px 22px;pointer-events:none;"></div>
    <div style="position:absolute;top:-110px;right:-80px;width:360px;height:360px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,.28),rgba(139,92,246,.08),transparent 70%);pointer-events:none;"></div>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="position:relative;z-index:1;">
      <tr>
        <td valign="middle" style="padding-right:18px;">
          <div style="margin-bottom:8px;">
            <span style="display:inline-block;background:rgba(34,211,238,.11);border:1px solid rgba(34,211,238,.3);padding:5px 12px;border-radius:8px;font-size:10px;font-weight:800;color:#67e8f9;letter-spacing:2px;text-transform:uppercase;font-family:monospace;">INTRODUCTION</span>
            <span style="display:inline-block;margin-left:7px;background:rgba(139,92,246,.1);border:1px solid rgba(167,139,250,.25);padding:5px 11px;border-radius:8px;font-size:10px;font-weight:700;color:#c4b5fd;letter-spacing:1px;text-transform:uppercase;">Mata Kuliah Wajib &bull; 2 SKS</span>
            <span style="display:inline-block;margin-left:7px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);padding:5px 11px;border-radius:8px;font-size:10px;font-weight:700;color:#fcd34d;letter-spacing:1px;text-transform:uppercase;">Kelas 2F &bull; Sabtu Reguler 2</span>
          </div>

          <h1 style="font-size:27px;font-weight:900;line-height:1.08;margin:0 0 7px 0;letter-spacing:-.8px;color:#f8fafc;">
            Teknik Tenaga
            <span style="background:linear-gradient(90deg,#22d3ee,#818cf8,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Listrik</span>
          </h1>

          <p style="font-size:12.5px;color:#a5b4c7;line-height:1.55;margin:0 0 9px 0;">
            Mempelajari rantai <strong style="color:#67e8f9;">pembangkitan&ndash;transmisi&ndash;distribusi&ndash;beban</strong>: konsep dan komponen sistem tenaga, analisis jaringan DC dan AC, saluran transmisi dan pemodelannya, sistem distribusi dan proteksinya, hingga
            <strong style="color:#c4b5fd;">single line diagram dan analisis aliran daya</strong> dengan Python.
          </p>

          <div style="display:flex;flex-wrap:wrap;gap:7px;">
            <span style="display:inline-block;padding:5px 11px;border-radius:8px;font-size:10px;font-weight:700;background:rgba(34,211,238,.08);color:#67e8f9;border:1px solid rgba(34,211,238,.18);">&#9889; Daya 1 &amp; 3 Fasa</span>
            <span style="display:inline-block;padding:5px 11px;border-radius:8px;font-size:10px;font-weight:700;background:rgba(96,165,250,.08);color:#93c5fd;border:1px solid rgba(96,165,250,.18);">&#128268; Jaringan DC &amp; AC</span>
            <span style="display:inline-block;padding:5px 11px;border-radius:8px;font-size:10px;font-weight:700;background:rgba(167,139,250,.08);color:#c4b5fd;border:1px solid rgba(167,139,250,.18);">&#128225; Saluran Transmisi</span>
            <span style="display:inline-block;padding:5px 11px;border-radius:8px;font-size:10px;font-weight:700;background:rgba(244,114,182,.08);color:#f9a8d4;border:1px solid rgba(244,114,182,.18);">&#128202; Load Flow</span>
          </div>
        </td>

        <td width="220" valign="middle" style="text-align:center;">
          <div style="width:205px;height:150px;display:inline-flex;align-items:center;justify-content:center;border-radius:22px;background:linear-gradient(145deg,rgba(37,99,235,.13),rgba(139,92,246,.08));border:1px solid rgba(96,165,250,.16);position:relative;">
            <svg width="185" height="138" viewBox="0 0 195 145" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="ttlLine" x1="0" y1="0" x2="195" y2="0">
                  <stop stop-color="#22d3ee"/><stop offset=".55" stop-color="#818cf8"/><stop offset="1" stop-color="#f472b6"/>
                </linearGradient>
              </defs>
              <circle cx="24" cy="52" r="13" stroke="#67e8f9" stroke-width="2" fill="rgba(34,211,238,.12)"/>
              <path d="M18 52c2-5 5-5 6 0s4 5 6 0" stroke="#67e8f9" stroke-width="1.6" fill="none"/>
              <text x="24" y="80" text-anchor="middle" fill="#67e8f9" font-size="8" font-family="monospace">G</text>
              <path d="M37 52H55" stroke="#67e8f9" stroke-width="2"/>
              <circle cx="62" cy="52" r="7" stroke="#818cf8" stroke-width="1.8" fill="none"/><circle cx="72" cy="52" r="7" stroke="#818cf8" stroke-width="1.8" fill="none"/>
              <text x="67" y="80" text-anchor="middle" fill="#c4b5fd" font-size="8" font-family="monospace">TRAFO</text>
              <path d="M79 52H98" stroke="#a78bfa" stroke-width="2"/>
              <path d="M104 30l-4 22h8l-6 24" stroke="#f472b6" stroke-width="2" fill="none" stroke-linejoin="round"/>
              <path d="M98 30h12M96 40h16M94 50h20" stroke="rgba(244,114,182,.5)" stroke-width="1"/>
              <text x="104" y="92" text-anchor="middle" fill="#f9a8d4" font-size="8" font-family="monospace">SUTET</text>
              <path d="M114 52H132" stroke="#f472b6" stroke-width="2"/>
              <rect x="132" y="38" width="30" height="28" rx="6" fill="rgba(245,158,11,.12)" stroke="#fbbf24"/>
              <text x="147" y="56" text-anchor="middle" fill="#fde68a" font-size="8" font-family="monospace">GI</text>
              <path d="M162 52H176" stroke="#fbbf24" stroke-width="2"/>
              <path d="M176 44v16M181 47v10M186 50v4" stroke="#fde68a" stroke-width="2"/>
              <text x="180" y="80" text-anchor="middle" fill="#fde68a" font-size="8" font-family="monospace">BEBAN</text>
              <path d="M24 100h156" stroke="url(#ttlLine)" stroke-width="1.5" stroke-dasharray="5 4"/>
              <text x="98" y="118" text-anchor="middle" fill="#64748b" font-size="8" font-family="monospace">20 kV &bull; 150 kV &bull; 500 kV &bull; 380/220 V</text>
              <text x="98" y="135" text-anchor="middle" fill="#64748b" font-size="8" font-family="monospace">generate &bull; transmit &bull; distribute</text>
            </svg>
          </div>
        </td>
      </tr>
    </table>
  </div>

  <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(34,211,238,.3),rgba(139,92,246,.3),rgba(244,114,182,.3),transparent);margin:0 22px;"></div>

  <div style="padding:12px 22px 14px;">
    <div style="font-size:10px;font-weight:800;color:#64748b;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;font-family:monospace;">Alur Kompetensi</div>
    <table width="100%" cellpadding="0" cellspacing="5" border="0">
      <tr>
        <td width="25%" valign="top" style="background:rgba(34,211,238,.055);border:1px solid rgba(34,211,238,.14);border-radius:11px;padding:9px 11px;">
          <div style="font-size:15px;margin-bottom:3px;">01</div>
          <div style="font-size:12px;font-weight:800;color:#67e8f9;margin-bottom:5px;">Konsep &amp; Komponen</div>
          <div style="font-size:10px;color:#8492a6;line-height:1.5;">Bagian sistem tenaga, tingkat tegangan, generator, trafo, gardu induk.</div>
        </td>
        <td width="25%" valign="top" style="background:rgba(96,165,250,.055);border:1px solid rgba(96,165,250,.14);border-radius:11px;padding:9px 11px;">
          <div style="font-size:15px;margin-bottom:3px;">02</div>
          <div style="font-size:12px;font-weight:800;color:#93c5fd;margin-bottom:5px;">Jaringan DC &amp; AC</div>
          <div style="font-size:10px;color:#8492a6;line-height:1.5;">Ohm, Kirchhoff, mesh/nodal, fasor, daya P/Q/S, tiga fasa.</div>
        </td>
        <td width="25%" valign="top" style="background:rgba(167,139,250,.055);border:1px solid rgba(167,139,250,.14);border-radius:11px;padding:9px 11px;">
          <div style="font-size:15px;margin-bottom:3px;">03</div>
          <div style="font-size:12px;font-weight:800;color:#c4b5fd;margin-bottom:5px;">Transmisi</div>
          <div style="font-size:10px;color:#8492a6;line-height:1.5;">Aliran daya, kompensasi, per unit, konstruksi dan pemodelan saluran.</div>
        </td>
        <td width="25%" valign="top" style="background:rgba(244,114,182,.055);border:1px solid rgba(244,114,182,.14);border-radius:11px;padding:9px 11px;">
          <div style="font-size:15px;margin-bottom:3px;">04</div>
          <div style="font-size:12px;font-weight:800;color:#f9a8d4;margin-bottom:5px;">Distribusi &amp; Analisis</div>
          <div style="font-size:10px;color:#8492a6;line-height:1.5;">Kompensasi, proteksi, single line diagram, load flow.</div>
        </td>
      </tr>
    </table>

    <div style="margin-top:10px;font-size:10px;font-weight:800;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;font-family:monospace;">Outline Mata Kuliah</div>
    <table width="100%" cellpadding="0" cellspacing="5" border="0" style="table-layout:fixed;">
      <tr>
        <td width="50%" valign="top" style="background:#0b1d31;border:1px solid #1e4976;border-radius:11px;padding:10px 12px;">
          <div style="font-size:10.5px;font-weight:900;color:#67e8f9;margin-bottom:9px;">KONSEP, JARINGAN, &amp; TRANSMISI (SEBELUM UTS)</div>
          <div style="font-size:10px;color:#dbeafe;line-height:1.55;">${outline(MODUL.slice(0, 7))}</div>
        </td>
        <td width="50%" valign="top" style="background:#221638;border:1px solid #5b3a88;border-radius:11px;padding:10px 12px;">
          <div style="font-size:10.5px;font-weight:900;color:#d8b4fe;margin-bottom:9px;">TRANSMISI, DISTRIBUSI, &amp; ANALISIS (SETELAH UTS)</div>
          <div style="font-size:10px;color:#ede9fe;line-height:1.55;">${outline(MODUL.slice(7))}</div>
        </td>
      </tr>
    </table>

    <div style="margin-top:10px;font-size:10px;font-weight:800;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;font-family:monospace;">Pelaksanaan Perkuliahan</div>
    <div style="background:#0a1730;border:1px solid #27447d;border-radius:12px;padding:10px 12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.025);">
      <div style="font-size:11.5px;color:#e0e7ff;line-height:1.5;margin-bottom:7px;">
        Perkuliahan mengikuti <strong style="color:#67e8f9;">Kalender Perkuliahan Fast Learning Semester Ganjil 2026/2027</strong> untuk kode kelas <strong style="color:#fff;">2F &mdash; Kelas Sabtu Reguler 2</strong>: satu modul setiap pekan pada hari <strong style="color:#fff;">Sabtu, ${JAM}</strong>, mulai <strong style="color:#fff;">${fmtPanjang(KALENDER[0].tgl)}</strong>. Pertemuan TMV berlangsung lewat Google Meet (termasuk Pertemuan 9 dan 15 yang di kalender tertulis TMK), pertemuan Daring dikerjakan mandiri lewat halaman modul. Tugas dan Forum tiap modul ditutup <strong style="color:#fcd34d;">Jumat berikutnya pukul 23:59 WIB</strong>.
      </div>
      <table width="100%" cellpadding="0" cellspacing="5" border="0" style="table-layout:fixed;">
        <tr>
          <td width="25%" valign="top" style="background:#0d2940;border:1px solid #155e75;border-radius:9px;padding:8px 10px;">
            <div style="font-size:9px;color:#67e8f9;letter-spacing:1px;text-transform:uppercase;margin-bottom:5px;">Mulai Perkuliahan</div>
            <div style="font-size:12px;font-weight:900;color:#f8fafc;">${fmtPanjang(KALENDER[0].tgl)}</div>
            <div style="font-size:11px;color:#bae6fd;margin-top:3px;">Pertemuan 1 &bull; TMV &bull; ${JAM}</div>
          </td>
          <td width="25%" valign="top" style="background:#121d3d;border:1px solid #3730a3;border-radius:9px;padding:8px 10px;">
            <div style="font-size:9px;color:#a5b4fc;letter-spacing:1px;text-transform:uppercase;margin-bottom:5px;">Pola Mingguan</div>
            <div style="font-size:12px;font-weight:900;color:#f8fafc;">1 Modul / Pekan</div>
            <div style="font-size:11px;color:#c7d2fe;margin-top:3px;">${KALENDER.filter((k) => k.tipe === "TMV").length} TMV &bull; ${KALENDER.filter((k) => k.tipe === "DARING").length} Daring</div>
          </td>
          <td width="25%" valign="top" style="background:#27163e;border:1px solid #6b21a8;border-radius:9px;padding:8px 10px;">
            <div style="font-size:9px;color:#d8b4fe;letter-spacing:1px;text-transform:uppercase;margin-bottom:5px;">UTS</div>
            <div style="font-size:12px;font-weight:900;color:#f8fafc;">${rentang(KALENDER[7].tgl, KALENDER[7].akhir)}</div>
            <div style="font-size:10px;color:#e9d5ff;margin-top:3px;">Pertemuan 8 &bull; jadwal sesuai web SIA</div>
          </td>
          <td width="25%" valign="top" style="background:#351b27;border:1px solid #9f1239;border-radius:9px;padding:8px 10px;">
            <div style="font-size:9px;color:#fda4af;letter-spacing:1px;text-transform:uppercase;margin-bottom:5px;">UAS</div>
            <div style="font-size:12px;font-weight:900;color:#f8fafc;">${rentang(KALENDER[15].tgl, KALENDER[15].akhir)}</div>
            <div style="font-size:10px;color:#fecdd3;margin-top:3px;">Pertemuan 16 &bull; jadwal sesuai web SIA</div>
          </td>
        </tr>
      </table>
    </div>

    <div style="margin-top:10px;font-size:10px;font-weight:800;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;font-family:monospace;">Kalender Pertemuan &mdash; Kode Kelas 2F, Sabtu Reguler 2</div>
    <table width="100%" cellpadding="0" cellspacing="5" border="0" style="table-layout:fixed;">
      <tr>
        <td width="50%" valign="top" style="background:#0b1425;border:1px solid #1f3355;border-radius:11px;padding:6px 8px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><th style="text-align:left;padding:4px 6px;font-size:9.5px;color:#64748b;letter-spacing:1px;">PERT.</th><th style="text-align:left;padding:4px 6px;font-size:9.5px;color:#64748b;letter-spacing:1px;">TIPE</th><th style="text-align:left;padding:4px 6px;font-size:9.5px;color:#64748b;letter-spacing:1px;">SABTU</th><th style="text-align:left;padding:4px 6px;font-size:9.5px;color:#64748b;letter-spacing:1px;">ISI</th></tr>${kiri}</table>
        </td>
        <td width="50%" valign="top" style="background:#0b1425;border:1px solid #1f3355;border-radius:11px;padding:6px 8px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><th style="text-align:left;padding:4px 6px;font-size:9.5px;color:#64748b;letter-spacing:1px;">PERT.</th><th style="text-align:left;padding:4px 6px;font-size:9.5px;color:#64748b;letter-spacing:1px;">TIPE</th><th style="text-align:left;padding:4px 6px;font-size:9.5px;color:#64748b;letter-spacing:1px;">SABTU</th><th style="text-align:left;padding:4px 6px;font-size:9.5px;color:#64748b;letter-spacing:1px;">ISI</th></tr>${kanan}</table>
        </td>
      </tr>
    </table>
    <div style="margin-top:5px;font-size:9.5px;color:#94a3b8;line-height:1.5;"><strong style="color:#fcd58a;">TMV</strong> = Tatap Muka Virtual (Google Meet) &nbsp;&bull;&nbsp; <strong style="color:#8ce8ff;">DARING</strong> = pembelajaran daring mandiri lewat halaman modul &nbsp;&bull;&nbsp; tanggal UTS/UAS mengikuti web SIA.</div>

    <div style="margin-top:10px;font-size:10px;font-weight:800;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;font-family:monospace;">Status Kehadiran &amp; Aturan Penilaian</div>
    <table width="100%" cellpadding="0" cellspacing="5" border="0" style="table-layout:fixed;">
      <tr>
        <td width="33.33%" valign="top" style="background:#0b2235;border:1px solid #155e75;border-radius:11px;padding:10px 12px;">
          <div style="font-size:11px;font-weight:900;color:#67e8f9;margin-bottom:10px;">STATUS KEHADIRAN</div>
          <div style="font-size:10px;color:#dbeafe;line-height:1.55;">
            <strong style="color:#86efac;">Tepat Waktu</strong> &mdash; memperoleh poin sebelum deadline.<br>
            <strong style="color:#fcd34d;">Terlambat</strong> &mdash; memperoleh poin sesudah deadline.<br>
            <strong style="color:#c4b5fd;">Belum</strong> &mdash; belum memperoleh poin saat jadwal masih aktif.<br>
            <strong style="color:#fda4af;">Bolos/Absen</strong> &mdash; tidak memperoleh poin setelah jadwal berakhir.
          </div>
        </td>
        <td width="33.33%" valign="top" style="background:#161b3a;border:1px solid #4338ca;border-radius:11px;padding:10px 12px;">
          <div style="font-size:11px;font-weight:900;color:#c4b5fd;margin-bottom:10px;">ATURAN MODUL</div>
          <div style="font-size:10px;color:#e0e7ff;line-height:1.55;">
            Setiap soal hanya dapat dijawab <strong style="color:#fff;">satu kali</strong>. Materi dibaca berurutan (kotak centang tiap bagian) sebelum Tugas dan Forum terbuka; modul berikutnya terbuka setelah modul sebelumnya tuntas. Modul tetap dapat dikerjakan setelah deadline, tetapi <strong style="color:#fcd34d;">poin setiap soal dipotong 35%</strong> (dikalikan 0,65) dan soal Comp Hard tidak mendapat partial credit.
          </div>
        </td>
        <td width="33.33%" valign="top" style="background:#32162f;border:1px solid #9d174d;border-radius:11px;padding:10px 12px;">
          <div style="font-size:11px;font-weight:900;color:#f9a8d4;margin-bottom:10px;">ATURAN EXAM</div>
          <div style="font-size:10px;color:#fce7f3;line-height:1.55;">
            Setiap soal hanya dapat dijawab <strong style="color:#fff;">satu kali</strong>. Pada fase perpanjangan setelah deadline, status menjadi Terlambat dan <strong style="color:#fcd34d;">poin setiap soal dipotong 35%</strong> (dikalikan 0,65). Setelah fase perpanjangan berakhir, submit diblokir. Bobot: Tugas 43% &bull; UTS 25% &bull; UAS 32%.
          </div>
        </td>
      </tr>
    </table>

    <div style="margin-top:6px;background:#111827;border:1px solid #334155;border-radius:9px;padding:7px 11px;font-size:9.5px;color:#cbd5e1;line-height:1.5;">
      <strong style="color:#f8fafc;">Catatan:</strong> status pada modul/exam adalah monitoring aktivitas berbasis akses dan perolehan poin. Kehadiran resmi tetap dicatat oleh dosen pada FAST/LMS Universitas Mercu Buana.
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:11px;">
      <tr>
        <td style="padding:9px 12px;">
          <div style="font-size:10px;color:#64748b;margin-bottom:3px;text-transform:uppercase;letter-spacing:1px;">Jadwal</div>
          <div style="font-size:12px;font-weight:800;color:#e2e8f0;">Sabtu &bull; ${JAM} &bull; ${RUANG}</div>
        </td>
        <td style="padding:9px 12px;border-left:1px solid rgba(255,255,255,.06);">
          <div style="font-size:10px;color:#64748b;margin-bottom:3px;text-transform:uppercase;letter-spacing:1px;">Kelas</div>
          <div style="font-size:12px;font-weight:800;color:#e2e8f0;">W132500023 &bull; 2A51362F &bull; Kode 2F</div>
        </td>
        <td style="padding:9px 12px;border-left:1px solid rgba(255,255,255,.06);">
          <div style="font-size:10px;color:#64748b;margin-bottom:3px;text-transform:uppercase;letter-spacing:1px;">Dosen Pengampu</div>
          <div style="font-size:12px;font-weight:800;color:#e2e8f0;">Dedik Romahadi, ST, M.Sc</div>
        </td>
        <td width="180" style="padding:8px 10px;border-left:1px solid rgba(255,255,255,.06);text-align:center;">
          <a href="${BASE}/OBE/Penilaian-OBE.htm" target="_blank" style="display:inline-block;width:165px;box-sizing:border-box;padding:8px 11px;border-radius:9px;text-decoration:none;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;font-size:11px;font-weight:800;box-shadow:0 5px 15px rgba(37,99,235,.25);">Silabus &amp; Penilaian OBE &rarr;</a>
          <a href="${WA_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-block;width:165px;box-sizing:border-box;margin-top:5px;padding:8px 11px;border-radius:9px;text-decoration:none;background:linear-gradient(135deg,#16a34a,#0d9488);color:#fff;font-size:11px;font-weight:800;box-shadow:0 5px 15px rgba(22,163,74,.24);">&#128172; Grup WhatsApp &rarr;</a>
          <a href="https://dedik-romahadi.github.io/Mechanical-Engineering-Courses/Unduhan-Gabungan/RPS-Teknik-Tenaga-Listrik.pdf" target="_blank" rel="noopener noreferrer" style="display:inline-block;width:165px;box-sizing:border-box;margin-top:5px;padding:8px 11px;border-radius:9px;text-decoration:none;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);color:#e2e8f0;font-size:11px;font-weight:800;">RPS (PDF) &rarr;</a>
        </td>
      </tr>
    </table>
  </div>

  <div style="background:rgba(255,255,255,.025);border-top:1px solid rgba(255,255,255,.06);padding:6px 22px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
    <div style="font-size:10px;color:#64748b;">&#127963;&#65039; S1 Teknik Mesin &bull; Universitas Mercu Buana</div>
    <div style="font-size:10px;color:#475569;font-family:monospace;">Semester Ganjil 2026/2027</div>
  </div>
</div>
`;
}

// ---------- nama section LMS (gaya Sisken) ----------
export function namaSection(k) {
  if (k.tipe === "UTS" || k.tipe === "UAS") return `Pertemuan ${k.p} · ${k.tipe} · ${rentang(k.tgl, k.akhir)} · jadwal sesuai SIA`;
  return `Pertemuan ${k.p} · ${fmtPanjang(k.tgl)} · Modul ${k.modul} · ${TIPE[k.tipe].nama}`;
}
export const namaSectionLanjutan = (k) => `Pekan ${k.tipe} lanjutan · ${rentang(plusHari(k.tgl, 7), k.akhir)}`;

// ---------- tulis berkas ----------
export function tulisSemua() {
  mkdirSync(OUT, { recursive: true });
  const ditulis = [];
  const simpan = (nama, isi) => { writeFileSync(join(OUT, nama), isi, "utf8"); ditulis.push(nama); };
  simpan("Banner-Introduction.html", bannerIntroduction());
  for (const k of KALENDER) {
    if (k.modul) simpan(`Banner-Pertemuan-${k.p}.html`, bannerPertemuan(k));
    else { simpan(`Banner-${k.tipe}.html`, bannerUjian(k)); simpan(`Banner-${k.tipe}-Lanjutan.html`, bannerUjianLanjutan(k)); }
  }
  return ditulis;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const d = tulisSemua();
  console.log(`${d.length} banner ditulis ke Teknik-Tenaga-Listrik/Banner/`);
  for (const k of KALENDER) console.log(`  P${String(k.p).padStart(2)} ${k.tipe.padEnd(6)} ${k.tgl}  ${k.modul ? namaSection(k) : namaSection(k)}`);
}
