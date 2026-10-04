/**
 * Merapikan tampilan ponsel (<= 640 px) halaman modul dan ujian keenam course:
 * rumus, kode, dan label panjang tidak boleh meluap, terpotong, atau saling menimpa.
 *
 * Satu blok <style id="rapikan-ponsel"> (dibungkus komentar RAPIKAN-PONSEL:START/END) dipasang di <head> ke-96 halaman (14 modul + UTS + UAS
 * per course). Semua aturan berada di dalam @media (max-width:640px), jadi tata letak desktop
 * dan tablet (>= 641 px) tidak berubah sama sekali. Pemindai Chrome (lebar 320/375/414 px)
 * menjadi dasar daftar aturan; alasan tiap aturan ada di komentar CSS di bawah dan di
 * Pedoman-Modul.md §2 butir (22).
 *
 * Idempoten: blok yang sudah ada diganti DI TEMPAT (bukan dibuang lalu dipasang ulang di ujung
 * <head>), supaya penyuntik lain yang juga menulis sebelum </head> tidak berebut urutan. Blok
 * AI-CHAT-AGENT tidak disentuh (diperiksa identik sebelum menulis).
 *
 * Pakai (dari root repo):
 *   node scripts/rapikan-ponsel.mjs            tulis semua halaman
 *   node scripts/rapikan-ponsel.mjs --periksa  lapor saja; kode keluar 1 bila ada yang berbeda
 *
 * Halaman TTL/CAD dibangun generator dari kerangka TTL Modul 1: blok ini ikut terwaris lewat
 * bangun.py dan tetap dijalankan di akhir rantai (sebelum draft-modul.mjs, urutan Pedoman §17.1).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const KURSUS = [
  "Engineering-Mathematics",
  "Getaran-Mekanik",
  "Optimalisasi-dan-Automasi",
  "Sistem-Kendali-Cerdas",
  "Pemodelan-Computer-Aided-Design",
  "Teknik-Tenaga-Listrik",
];
export const PENANDA = "rapikan-ponsel";
export const VERSI = 1;

/** Isi CSS (tanpa pembungkus <style>). Setiap aturan dibatasi @media (max-width:640px); Setup memakai 560/360. */
export const CSS = `
/* RAPIKAN-PONSEL v${VERSI} — tampilan ponsel; di atas 640 px hanya baris paritas .comp-q di bawah yang berlaku */
/* (2) Paritas keenam course: kartu soal komputasi boleh menyempit dan patah kata (Matematika 4, Getaran, Optimalisasi, Sisken sudah punya; TTL dan CAD baru). */
.comp-q{min-width:0;overflow-wrap:break-word}
@media (max-width:640px){
/* (1) Persamaan bernomor TTL/CAD/Sisken: nomor turun ke baris sendiri (rata kanan) supaya tidak menimpa rumus yang terbungkus. */
.formula-main{padding-right:0;overflow-x:auto}
.formula-main>.formula-number{position:static;display:block;text-align:right;transform:none;margin-top:2px}
/* Rumus yang tak bisa dipatah (satu pecahan/akar panjang) digulir mendatar di dalam kotaknya, bukan keluar kotak. */
#page-modul .formula-block{overflow-x:auto;padding-left:14px;padding-right:14px}
#page-modul .card .formula{max-width:100%;overflow-x:auto;overflow-y:hidden}
/* (2) Kartu soal Tugas/UTS/UAS: anak flex boleh menyempit, teks/kode tak terpatahkan dipatah, rumus selebar kartu digulir. */
/* padding-block + margin-block negatif: subskrip/pangkat yang menjulur sedikit di luar kotak baris tetap di dalam kotak gulir (tanpa batang gulir tegak), letak teks tidak bergeser. */
.mc-q,.tf-q,.comp-q{min-width:0;overflow-wrap:anywhere;overflow-x:auto;padding-block:.45em;margin-block:-.45em}
.radio-option,.p-opt{min-width:0;overflow-wrap:anywhere}
.radio-option>span,.p-opt>span{min-width:0;overflow-x:auto;padding-block:.4em;margin-block:-.4em}
/* (4) Label sel kode: judul turun ke baris sendiri dan membungkus, bukan ditengahkan absolut di atas tombol. */
.code-header{flex-wrap:wrap;row-gap:6px}
.code-header .code-label{position:static;transform:none;order:9;flex:1 1 100%;white-space:normal;overflow-wrap:anywhere}
.code-header .code-copy{margin-left:auto}
/* (5) Kode, tautan, dan label panjang di teks; kisi inline selebar >= 220 px; judul hero; tab navigasi Modul 1. */
:not(pre)>code{overflow-wrap:anywhere}
.reference-card{overflow-wrap:anywhere}
.reference-card>*{min-width:0}
.anim-var>span:last-child{min-width:0;overflow-wrap:anywhere}
.anim-var>code{white-space:normal;overflow-wrap:anywhere;min-width:0;flex-shrink:1}
.fq-body{overflow-x:auto}
[style*="minmax(220px,1fr)"]{grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr))!important}
[style*="minmax(240px,1fr)"]{grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr))!important}
[style*="minmax(260px,1fr)"]{grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr))!important}
[style*="minmax(280px,1fr)"]{grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))!important}
#page-modul .academic-hero .hero-title,h1.hero-title{font-size:clamp(34px,11.5vw,62px);overflow-wrap:anywhere}
nav{padding-left:12px;padding-right:12px;gap:8px}
nav .nav-tabs{gap:2px;min-width:0;overflow-x:auto;scrollbar-width:none}
nav .nav-tabs::-webkit-scrollbar{display:none}
nav .nav-tab{flex:0 0 auto;padding-left:8px;padding-right:8px}
.cards{grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))}
.anim-title{min-width:0;overflow-wrap:anywhere}
/* Label kolom kode soal komputasi, label analogi, dan panduan Export: membungkus, bukan keluar kartu (terlihat di 320 px). */
.input-label{flex-wrap:wrap;row-gap:2px}
.input-label>span{min-width:0;max-width:100%;overflow-wrap:anywhere}
.analogy-label{max-width:100%;flex-wrap:wrap}
.score-export-copy{min-width:0!important}
#scheduleOverlay .visitor-modal>div[style*="display:flex"]{flex-wrap:wrap}
#scheduleOverlay .visitor-modal>div[style*="display:flex"]>div{min-width:0;flex:1 1 130px!important}
#scheduleOverlay .v-input{min-width:0;max-width:100%}
.berkas-input{min-width:0;max-width:100%}
html .pm-centang .pm-status{white-space:normal;flex:0 1 auto;min-width:0;max-width:calc(100% - 42px)}
}
@media (max-width:560px){
/* (3) Setup: kolom langkah sempit (±150 px di basis) — lebarkan kartu, sembunyikan tiga titik hias, dan jaga Copy sebaris. */
html :is(#page-setup,#page-python) .sp-wrap{padding:0 12px}
html :is(#page-setup,#page-python) .sp-timeline::before{left:16px}
html :is(#page-setup,#page-python) .sp-step{padding-left:46px}
html :is(#page-setup,#page-python) .sp-dot{left:2px;width:28px;height:28px;font-size:.8rem}
html :is(#page-setup,#page-python) .sp-head{padding:1.1rem 1rem .5rem}
html :is(#page-setup,#page-python) .sp-body{padding:.5rem 1rem 1.25rem}
html :is(#page-setup,#page-python) .sp-body a{overflow-wrap:anywhere}
html :is(#page-setup,#page-python) .sp-cbh{flex-wrap:nowrap;gap:.5rem;padding:.5rem .8rem}
html :is(#page-setup,#page-python) .sp-cbh-left{flex:1 1 0;min-width:0}
html :is(#page-setup,#page-python) .sp-cbh-dots{display:none}
html :is(#page-setup,#page-python) .sp-cbh-copy{flex:0 0 auto;white-space:nowrap}
html :is(#page-setup,#page-python) .sp-cbd{padding:.9rem 1rem}
}
@media (max-width:360px){
nav .nav-tab{padding-left:6px;padding-right:6px}
html :is(#page-setup,#page-python) .sp-step{padding-left:38px}
html :is(#page-setup,#page-python) .sp-body{padding:.5rem .75rem 1rem}
html :is(#page-setup,#page-python) .sp-cbh{padding:.5rem .6rem}
html :is(#page-setup,#page-python) .sp-cbh-copy{padding:.3rem .5rem}
}
`;

// Blok dibungkus komentar START/END seperti injector lain (NOTASI-KANVAS, EFEK-JAWABAN): akhir <head> tetap diawali komentar,
// bukan "</style>\n</head>" — jangkar generator (cad-modul/bangun-modul-1.py menuntut "</style>\n</head>" tepat satu kali di
// kerangka TTL Modul 1) tidak boleh ikut terkena.
const NAMA_BLOK = PENANDA.toUpperCase();
const BLOK = (eol) => `<!-- ${NAMA_BLOK}:START v${VERSI} -->${eol}<style id="${PENANDA}">${CSS.replace(/\n/g, eol)}</style>${eol}<!-- ${NAMA_BLOK}:END v${VERSI} -->`;
const RX_BLOK = new RegExp(`<!-- ${NAMA_BLOK}:START[^>]*-->[\\s\\S]*?<!-- ${NAMA_BLOK}:END[^>]*-->`);
const RX_CHAT = /<!-- AI-CHAT-AGENT:BEGIN[\s\S]*?<!-- AI-CHAT-AGENT:END[^>]*-->/g;

export function daftarHalaman() {
  const h = [];
  for (const k of KURSUS) {
    for (let n = 1; n <= 14; n += 1) h.push(path.join(k, "Modul", `Modul-${n}.html`));
    h.push(path.join(k, "Exam", "UTS.html"), path.join(k, "Exam", "UAS.html"));
  }
  return h;
}

/** Hasil pemasangan pada teks halaman (murni; dipakai juga oleh validator). */
export function pasang(html) {
  const eol = html.includes("\r\n") ? "\r\n" : "\n";
  const blok = BLOK(eol);
  if (RX_BLOK.test(html)) return html.replace(RX_BLOK, () => blok);
  const i = html.indexOf("</head>");
  const b = html.indexOf("<body");
  if (i < 0 || (b >= 0 && i > b)) throw new Error("</head> dokumen tidak ditemukan sebelum <body>");
  const sebelum = html.slice(0, i);
  const hitung = (t, k) => t.split(k).length - 1;
  if (hitung(sebelum, "<script") !== hitung(sebelum, "</script>")) throw new Error("</head> pertama berada di dalam <script>");
  return `${sebelum}${blok}${eol}${html.slice(i)}`;
}

/** Masalah blok ponsel pada teks halaman (kosong = sesuai): tepat satu blok, di <head>, isinya sama dengan CSS skrip ini. */
export function periksaPonsel(html) {
  const blok = [...html.matchAll(new RegExp(RX_BLOK.source, "g"))];
  if (blok.length !== 1) return [`${blok.length} blok ${NAMA_BLOK} (harus tepat satu)`];
  const masalah = [];
  const kepala = html.indexOf("</head>");
  if (kepala < 0 || blok[0].index > kepala) masalah.push("blok berada di luar <head>");
  if (blok[0][0] !== BLOK(html.includes("\r\n") ? "\r\n" : "\n")) masalah.push("isi blok berbeda dari CSS scripts/rapikan-ponsel.mjs (jalankan node scripts/rapikan-ponsel.mjs)");
  return masalah;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const periksa = process.argv.includes("--periksa");
  let berubah = 0;
  const halaman = daftarHalaman();
  for (const rel of halaman) {
    const berkas = path.join(root, rel);
    if (!fs.existsSync(berkas)) throw new Error(`Berkas tidak ada: ${rel}`);
    const lama = fs.readFileSync(berkas, "utf8");
    const baru = pasang(lama);
    if ((lama.match(RX_CHAT) || []).join("\n") !== (baru.match(RX_CHAT) || []).join("\n")) throw new Error(`${rel}: blok AI-CHAT-AGENT berubah`);
    if (baru !== lama) {
      berubah += 1;
      if (!periksa) fs.writeFileSync(berkas, baru);
    }
  }
  console.log(`${berubah} dari ${halaman.length} halaman ${periksa ? "akan berubah" : "diperbarui"} (RAPIKAN-PONSEL v${VERSI})`);
  if (periksa && berubah) process.exit(1);
}
