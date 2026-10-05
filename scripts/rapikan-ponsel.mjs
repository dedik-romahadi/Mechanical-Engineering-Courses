/**
 * Merapikan tampilan ponsel (<= 640 px) halaman modul dan ujian keenam course:
 * rumus, kode, dan label panjang tidak boleh meluap, terpotong, atau saling menimpa.
 *
 * Satu blok <style id="rapikan-ponsel"> + <script id="rapikan-ponsel-js"> (dibungkus komentar RAPIKAN-PONSEL:START/END) dipasang di <head>
 * ke-96 halaman (14 modul + UTS + UAS per course). Hampir semua aturan berada di dalam @media (max-width:640px) (Setup 560/360), jadi
 * tata letak desktop tidak berubah; pengecualiannya sengaja dan sempit: paritas .comp-q (tanpa media), blok tablet <= 900 px (semua
 * header sel kode memakai baris label sendiri; kartu soal dan opsi PG boleh menyempit dan memecah token tak terpatahkan) dan label
 * sel kode >= 901 px (lebar dibatasi agar tidak menimpa titik hias/bahasa/Copy; hanya label yang memang menimpa yang berubah, jadi
 * batasnya per course: lihat KIRI_KURSUS). Pemindai Chrome (lebar 320/375/414 px, sapuan 641-1280 px) menjadi dasar daftar aturan;
 * alasan tiap aturan ada di komentar CSS di bawah dan di Pedoman-Modul.md §2 butir (22).
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
 * bangun.py dan tetap dijalankan di akhir rantai (sebelum draft-modul.mjs, urutan Pedoman §17.1);
 * angka label sel kode per course (CAD, Matematika 4) ditulis ulang di tempat oleh skrip ini, bukan oleh generator.
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
export const VERSI = 4;

/**
 * Tepi kanan kluster kiri bar sel kode (titik hias + pil bahasa, px dari tepi kiri bar) per course, diukur di Chrome 1280 px pada
 * ke-96 halaman basis: pil "Python" membuatnya 140 px, "Python" Matematika 4 154 px (pil lebih lebar), "Python (FreeCAD)" CAD 206 px;
 * kluster kanan (Copy) hanya 92 px. Label ditengahkan di bar, jadi tabrakan terjadi bila lebar label > lebar bar - 2 x tepi itu;
 * batas lebar label di >= 901 px adalah lebar bar - 2 x (tepi + JARAK_LABEL), JARAK_LABEL = 2 px hanya untuk pembulatan ukuran (jarak
 * 8 px memenggal label yang masih muat dengan celah 3-7 px: 15 header di 901 px, 4 di 1024 px). Satu angka untuk semua course (dulu
 * 436 px, dari pil CAD) mengubah header yang tidak bertabrakan di course lain (label sebaris menjadi dua baris), jadi tiap course
 * memakai angkanya sendiri. line-height label tidak diubah: label yang muat tampil identik piksel demi piksel dengan basis.
 */
export const KIRI_STANDAR = 140;
export const KIRI_KURSUS = { "Engineering-Mathematics": 154, "Pemodelan-Computer-Aided-Design": 206 };
export const JARAK_LABEL = 2;
export const kursusDari = (rel) => String(rel || "").replace(/\\/g, "/").split("/")[0];
export const kiriKursus = (rel) => KIRI_KURSUS[kursusDari(rel)] ?? KIRI_STANDAR;
export const cadanganLabel = (kiri) => 2 * (kiri + JARAK_LABEL);

/** Isi CSS (tanpa pembungkus <style>) untuk course dengan kluster kiri `kiri` px. Setiap aturan dibatasi @media (max-width:640px); Setup memakai 560/360. */
export const buatCss = (kiri = KIRI_STANDAR) => `
/* RAPIKAN-PONSEL v${VERSI} — tampilan ponsel; di atas 640 px hanya paritas .comp-q, blok tablet (<= 900 px) dan blok label sel kode laptop (>= 901 px) yang berlaku */
/* (2) Paritas keenam course: kartu soal komputasi boleh menyempit dan patah kata (Matematika 4, Getaran, Optimalisasi, Sisken sudah punya; TTL dan CAD baru). */
.comp-q{min-width:0;overflow-wrap:break-word}
/* (4) Label sel kode, tablet (<= 900 px): label ditengahkan absolut di bar bertumpuk dengan titik hias, bahasa, dan Copy (sapuan 641-900 px: 274 header di 641, 180 di 768, 73 di 900). Bar membungkus dan label turun ke baris sendiri; ini berlaku untuk SEMUA header sel kode di tablet (yang tidak bertabrakan di basis pun memakai baris label sendiri, tinggi header 46 -> ±71 px di 768 px). */
/* (2c) Kartu soal Tugas/UTS/UAS di tablet: token tak terpatahkan (jalur berkas, URL, nama fungsi) di soal dari backend melebarkan dokumen di 641-900 px (soal tiruan: scrollWidth 855-925 di 768 px); anak flex boleh menyempit dan token dipatah. Teks biasa tidak berubah. */
@media (max-width:900px){
.code-header{flex-wrap:wrap;row-gap:6px}
.code-header .code-label{position:static;transform:none;order:9;flex:1 1 100%;white-space:normal;overflow-wrap:anywhere}
.code-header .code-copy{margin-left:auto}
.mc-q,.tf-q,.comp-q,.p-opt,.radio-option{min-width:0;overflow-wrap:anywhere}
}
/* (4) Label sel kode, laptop (>= 901 px): tetap ditengahkan, tetapi selebar-lebarnya bar dikurangi dua kali (tepi kanan kluster kiri course ini = ${kiri} px, titik hias + pil bahasa, + ${JARAK_LABEL} px); label yang lebih panjang membungkus 2 baris (di dalam bar 46 px; line-height tidak diubah), bukan menimpa. Label yang muat tidak berubah satu piksel pun. */
@media (min-width:901px){
.code-header .code-label{width:max-content;max-width:calc(100% - ${cadanganLabel(kiri)}px);white-space:normal;text-align:center;overflow-wrap:anywhere}
}
@media (max-width:640px){
/* (1) Persamaan bernomor TTL/CAD/Sisken: nomor turun ke baris sendiri (rata kanan) supaya tidak menimpa rumus yang terbungkus. */
.formula-main{padding-right:0;overflow-x:auto}
.formula-main>.formula-number{position:static;display:block;text-align:right;transform:none;margin-top:2px}
/* Rumus yang tak bisa dipatah (satu pecahan/akar panjang) digulir mendatar di dalam kotaknya, bukan keluar kotak. */
#page-modul .formula-block{overflow-x:auto;padding-left:14px;padding-right:14px}
#page-modul .card .formula{max-width:100%;overflow-x:auto;overflow-y:hidden}
/* Petunjuk gulir: ponsel menyembunyikan bilah gulir ber-overlay, jadi rumus yang digulir tampak terpotong di tepi kanan. Gaya ::-webkit-scrollbar membuat bilah tipis tetap tampak (Chrome/Safari); tanpa gulir tidak ada bilah dan tinggi kotak tidak berubah. */
.formula-main::-webkit-scrollbar,#page-modul .formula-block::-webkit-scrollbar,#page-modul .card .formula::-webkit-scrollbar{height:5px}
.formula-main::-webkit-scrollbar-track,#page-modul .formula-block::-webkit-scrollbar-track,#page-modul .card .formula::-webkit-scrollbar-track{background:rgba(148,163,184,.14);border-radius:3px}
.formula-main::-webkit-scrollbar-thumb,#page-modul .formula-block::-webkit-scrollbar-thumb,#page-modul .card .formula::-webkit-scrollbar-thumb{background:rgba(148,163,184,.6);border-radius:3px}
/* (2) Kartu soal Tugas/UTS/UAS: anak flex boleh menyempit, teks/kode tak terpatahkan dipatah, rumus selebar kartu digulir. */
/* padding-block + margin-block negatif: subskrip/pangkat yang menjulur sedikit di luar kotak baris tetap di dalam kotak gulir (tanpa batang gulir tegak), letak teks tidak bergeser. */
/* padding-right + margin-right negatif 4 px: KaTeX menjulur 1-4 px di luar kotak teks; tanpa ruang itu wadah gulir muncul dengan bilah 15 px di peramban desktop berbilah klasik (jendela sempit, layar terbagi) padahal tak ada yang perlu digulir. Letak teks tidak bergeser. */
.mc-q,.tf-q,.comp-q{min-width:0;overflow-wrap:anywhere;overflow-x:auto;padding-block:.45em;margin-block:-.45em;padding-right:4px;margin-right:-4px}
.radio-option,.p-opt{min-width:0;overflow-wrap:anywhere}
.radio-option>span,.p-opt>span{min-width:0;overflow-x:auto;padding-block:.4em;margin-block:-.4em;padding-right:4px;margin-right:-4px}
/* (2d) Kepala kartu pilihan ganda dan benar/salah (sama dengan kepala kartu komputasi): nomor + poin di baris pertama, teks soal selebar kartu di baris kedua; sebaris dengan nomor dan poin kolom teks hanya 74-117 px dan memenggal kata di tengah (Matematika 4 Modul 10 di 320 px: "Transform/asi"). */
.mc-header,.tf-header{flex-wrap:wrap;row-gap:8px}
.mc-num,.tf-num{order:0}
.mc-pts,.tf-pts{order:1;margin-left:auto}
.mc-q,.tf-q{order:2;flex:1 1 100%}
/* (2b) Kepala kartu soal komputasi: nomor + poin di baris pertama, teks soal selebar kartu di baris kedua (kolom teks hanya 110-180 px bila sebaris dengan nomor dan poin). */
.comp-header{flex-wrap:wrap;row-gap:8px}
.comp-num{order:0}
.comp-pts{order:1;margin-left:auto}
.comp-q{order:2;flex:1 1 100%}
/* (5) Kode, tautan, dan label panjang di teks; kisi inline selebar >= 220 px; judul hero; tab navigasi Modul 1. */
:not(pre)>code{overflow-wrap:anywhere}
.reference-card{overflow-wrap:anywhere}
.card :is(p,li){overflow-wrap:anywhere}
/* Kotak catatan di luar .card (daftar tautan pustaka CAD: "Body/Pad/Pocket/..." sepanjang 360-500 px), judul bagian, deskripsi bagian, dan petunjuk soal: kata tak terpatahkan dipatah, bukan keluar kotak/layar (CAD Modul 5 dan 7 di 375 px, Getaran Modul 8 dan Optimalisasi Modul 12 di 320 px). Judul hero sengaja tidak termasuk (diatur --ponsel-hero). */
.info-box,.tip-box,.warn-box,.warning-box,.analogy-box{overflow-wrap:anywhere}
h2,h3,.section-desc,.comp-hint{overflow-wrap:anywhere}
/* Papan Top Skor / Top Akses tab Hasil: kisi inline 1fr 1fr melebar mengikuti nama + NIM + poin (230 + 260 px di 375 px) dan kartu kanan terpotong; satu kolom di ponsel. */
#leaderboardPanel>div:first-child{grid-template-columns:minmax(0,1fr)!important}
.reference-card>*{min-width:0}
/* Legenda notasi animasi: chip simbol (KaTeX, tak bisa menyusut) di baris sendiri bila deskripsinya tidak muat di sampingnya; deskripsi tidak pernah terjepit di bawah 9rem (dulu kolom 2-40 px, satu huruf per baris). */
.anim-var{flex-wrap:wrap;row-gap:6px}
.anim-var>span:last-child{flex:1 1 auto;min-width:min(9rem,100%);overflow-wrap:break-word}
.anim-var>code{white-space:normal;overflow-wrap:anywhere;min-width:0;flex-shrink:1}
.fq-body{overflow-x:auto}
[style*="minmax(220px,1fr)"]{grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr))!important}
[style*="minmax(240px,1fr)"]{grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr))!important}
[style*="minmax(260px,1fr)"]{grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr))!important}
[style*="minmax(280px,1fr)"]{grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))!important}
/* Judul hero: ukuran asli halaman TIDAK diubah; hanya judul yang memuat kata terlalu lebar untuk kotaknya diperkecil seperlunya oleh rapikan-ponsel-js lewat --ponsel-hero. */
h1.hero-title[style*="--ponsel-hero"]{font-size:var(--ponsel-hero)!important}
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
/* Kolom berkas CAD: efektif di UTS/UAS CAD (tanpanya melebihi kartu 22-25 px di 320 px). Di 14 modul CAD aturan ini kalah urutan dari CSS kartu tugas CAD (blok cad-tugas-style, sesudah blok ponsel di head; min-width:220px, muat di kartu >= 248 px), jadi tanpa dampak di sana. */
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
/** CSS standar (kluster kiri 140 px); Matematika 4 dan CAD memakai angkanya sendiri lewat buatCss(kiriKursus(rel)). */
export const CSS = buatCss();

/**
 * (a) Strip tab navigasi Modul 1 (Setup Python, Pembagian Kelompok, Modul, Tugas, Forum, Hasil: 609 px dalam kotak 335 px di 375 px)
 * digulir mendatar; tab aktif ("Modul", ke-3) terpotong di tepi kanan dan tak ada petunjuk gulir. Skrip kecil ini menaruh tab
 * aktif di tengah strip saat halaman dibuka dan tiap kelas tab berganti (switchTab), hanya di <= 640 px dan hanya bila strip
 * memang bisa digulir.
 * (b) Judul hero (h1.hero-title): ukuran asli halaman dipertahankan; hanya judul yang memuat kata tak terpatahkan lebih lebar dari
 * kotaknya (Hyperparameter, Memaksimalkan, Transmissibility, ... di 22 halaman pada 375 px) diperkecil secukupnya lewat
 * properti --ponsel-hero (aturan CSS-nya ada di atas), diukur dengan font yang benar-benar terpasang (Playfair Display dimuat dari
 * jaringan, jadi diulang saat font siap, saat ukuran berubah, dan saat halaman/tab berganti). Batasnya yang terkecil dari kotak h1
 * dan kotak isi .hero: .hero-content adalah anak flex yang MELEBAR mengikuti kata terlebar (min-content), jadi h1 tidak "meluap"
 * dari kotaknya sendiri tetapi menggeser seluruh hero keluar layar (CAD Modul 3 Tugas di 320 px: x = -8, terpotong 8 px per sisi).
 * Di > 640 px properti itu dilepas.
 * Tanpa nama global (IIFE), tanpa mengubah skrip halaman.
 */
export const JS = `
/* RAPIKAN-PONSEL v${VERSI}: tab navigasi aktif di tengah strip dan judul hero yang tak muat (<= 640 px) */
(function () {
  var mq = window.matchMedia && window.matchMedia('(max-width:640px)');
  function tengahkan() {
    if (!mq || !mq.matches) return;
    var tab = document.querySelector('nav .nav-tabs .nav-tab.active');
    var strip = tab && tab.parentNode;
    if (!strip || strip.scrollWidth <= strip.clientWidth + 1) return;
    var a = tab.getBoundingClientRect(), b = strip.getBoundingClientRect();
    strip.scrollLeft += (a.left - b.left) - (strip.clientWidth - a.width) / 2;
  }
  function sedia(h) {
    var hero = h.closest && h.closest('.hero');
    if (!hero) return h.clientWidth;
    var s = getComputedStyle(hero);
    return hero.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
  }
  function pasHero() {
    var judul = document.querySelectorAll('h1.hero-title');
    for (var i = 0; i < judul.length; i++) {
      var h = judul[i];
      h.style.removeProperty('--ponsel-hero');
      if (!mq || !mq.matches || !h.clientWidth) continue;
      for (var n = 0; n < 6; n++) {
        var kotak = Math.min(h.clientWidth, sedia(h)), isi = Math.max(h.scrollWidth, h.getBoundingClientRect().width);
        var fs = parseFloat(getComputedStyle(h).fontSize);
        if (!(isi > kotak + 1) || !(fs > 22)) break;
        h.style.setProperty('--ponsel-hero', Math.max(22, Math.floor(fs * kotak / isi * 98) / 100) + 'px');
      }
    }
  }
  var tunda = 0;
  function rapikan() {
    if (tunda) return;
    tunda = (window.requestAnimationFrame || window.setTimeout)(function () { tunda = 0; tengahkan(); pasHero(); });
  }
  function pasang() {
    var strip = document.querySelector('nav .nav-tabs');
    tengahkan();
    pasHero();
    if (window.MutationObserver) {
      var amati = new MutationObserver(rapikan);
      if (strip) amati.observe(strip, { attributes: true, attributeFilter: ['class'], subtree: true });
      var halaman = document.querySelectorAll('.page');
      for (var i = 0; i < halaman.length; i++) amati.observe(halaman[i], { attributes: true, attributeFilter: ['class'] });
    }
    window.addEventListener('resize', rapikan);
    window.addEventListener('load', rapikan);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rapikan);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang); else pasang();
})();
`;

// Blok dibungkus komentar START/END seperti injector lain (NOTASI-KANVAS, EFEK-JAWABAN): akhir <head> tetap diawali komentar.
// Pembungkus itu hanya untuk keseragaman penanda dan pemeriksaan blok (RX_BLOK/periksaPonsel), bukan syarat generator CAD:
// sejak #987 cad-modul/bangun-modul-1.py memakai </head> pertama halaman, bukan jangkar "</style>\n</head>".
const NAMA_BLOK = PENANDA.toUpperCase();
const BLOK = (eol, kiri = KIRI_STANDAR) => `<!-- ${NAMA_BLOK}:START v${VERSI} -->${eol}<style id="${PENANDA}">${buatCss(kiri).replace(/\n/g, eol)}</style>${eol}<script id="${PENANDA}-js">${JS.replace(/\n/g, eol)}</script>${eol}<!-- ${NAMA_BLOK}:END v${VERSI} -->`;
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

/** Hasil pemasangan pada teks halaman `rel` (murni; dipakai juga oleh validator). `rel` menentukan angka label sel kode course. */
export function pasang(html, rel) {
  const eol = html.includes("\r\n") ? "\r\n" : "\n";
  const blok = BLOK(eol, kiriKursus(rel));
  if (RX_BLOK.test(html)) return html.replace(RX_BLOK, () => blok);
  const i = html.indexOf("</head>");
  const b = html.indexOf("<body");
  if (i < 0 || (b >= 0 && i > b)) throw new Error("</head> dokumen tidak ditemukan sebelum <body>");
  const sebelum = html.slice(0, i);
  const hitung = (t, k) => t.split(k).length - 1;
  if (hitung(sebelum, "<script") !== hitung(sebelum, "</script>")) throw new Error("</head> pertama berada di dalam <script>");
  return `${sebelum}${blok}${eol}${html.slice(i)}`;
}

/** Masalah blok ponsel pada teks halaman `rel` (kosong = sesuai): tepat satu blok (dan satu <style>/<script> berpenanda), di <head>, isinya sama dengan CSS skrip ini untuk course-nya. */
export function periksaPonsel(html, rel) {
  const blok = [...html.matchAll(new RegExp(RX_BLOK.source, "g"))];
  if (blok.length !== 1) return [`${blok.length} blok ${NAMA_BLOK} (harus tepat satu)`];
  const masalah = [];
  const sisa = (id) => (html.match(new RegExp(`<(?:style|script)[^>]*\\bid=["']${id}["']`, "g")) || []).length;
  if (sisa(PENANDA) !== 1) masalah.push(`${sisa(PENANDA)} <style id="${PENANDA}"> (harus tepat satu, di dalam blok berpenanda)`);
  if (sisa(`${PENANDA}-js`) !== 1) masalah.push(`${sisa(`${PENANDA}-js`)} <script id="${PENANDA}-js"> (harus tepat satu, di dalam blok berpenanda)`);
  const kepala = html.indexOf("</head>");
  if (kepala < 0 || blok[0].index > kepala) masalah.push("blok berada di luar <head>");
  if (blok[0][0] !== BLOK(html.includes("\r\n") ? "\r\n" : "\n", kiriKursus(rel))) masalah.push("isi blok berbeda dari CSS scripts/rapikan-ponsel.mjs (jalankan node scripts/rapikan-ponsel.mjs)");
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
    const baru = pasang(lama, rel);
    if ((lama.match(RX_CHAT) || []).join("\n") !== (baru.match(RX_CHAT) || []).join("\n")) throw new Error(`${rel}: blok AI-CHAT-AGENT berubah`);
    if (baru !== lama) {
      berubah += 1;
      if (!periksa) fs.writeFileSync(berkas, baru);
    }
  }
  console.log(`${berubah} dari ${halaman.length} halaman ${periksa ? "akan berubah" : "diperbarui"} (RAPIKAN-PONSEL v${VERSI})`);
  if (periksa && berubah) process.exit(1);
}
