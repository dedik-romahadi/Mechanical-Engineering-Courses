/**
 * Menyisipkan ilustrasi bernomor ke enam bagian penjelasan Modul 1 Sisken
 * (halaman tulisan tangan yang dilewati enrich). Idempoten: bila halaman
 * sudah memuat figure.ilustrasi, jalanan berikutnya mengganti blok lama
 * berdasarkan penanda, bukan menggandakan.
 *
 * Ikut menomori kotak "Cara Membaca Animasi Ini" menjadi "Animasi k" supaya
 * gambar yang sudah ada merujuk nomor serinya sendiri.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderIlustrasi, CSS_ILUSTRASI, kapitalAwal } from "./sisken-ilustrasi.mjs";
import { GAMBAR_MODUL } from "./sisken-ilustrasi-data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "Sistem-Kendali-Cerdas", "Modul", "Modul-1.html");
let html = fs.readFileSync(target, "utf8");

const spesifikasi = GAMBAR_MODUL["1"];
if (!spesifikasi || spesifikasi.length !== 6) throw new Error("GAMBAR_MODUL['1'] harus berisi 6 entri");

// Bagian sasaran dikenali dari penggalan judul section-title-nya (urut tampil).
const SASARAN = [
  "Apa Itu",
  "Komponen",
  "Loop Terbuka",
  "Persamaan Respons",
  "Analogi Sistem Kontrol",
  "Penerapan pada",
];
const FRASA = [
  (k) => `Gambar ${k} mengilustrasikan gagasan ini.`,
  (k) => `Skemanya diperlihatkan pada Gambar ${k}.`,
  (k) => `Perhatikan ilustrasinya pada Gambar ${k}.`,
  (k) => `Gambar ${k} merangkum alurnya secara visual.`,
];

// Bersihkan hasil sisipan lama (idempoten) berdasarkan penanda blok.
html = html.replace(/\n?<!-- ILUSTRASI-M1:(\d+):START -->[\s\S]*?<!-- ILUSTRASI-M1:\1:END -->/g, "");
html = html.replace(/ (?:Gambar \d+ mengilustrasikan gagasan ini\.|Skemanya diperlihatkan pada Gambar \d+\.|Perhatikan ilustrasinya pada Gambar \d+\.|Gambar \d+ merangkum alurnya secara visual\.)(?=<\/p>)/g, "");

SASARAN.forEach((cuplik, i) => {
  const nomor = i + 1;
  // Cari HEADING bagian (bukan sembarang kemunculan teks), lalu paragraf
  // pembuka pertama sesudahnya. matchAll diulang tiap iterasi karena posisi
  // bergeser setelah setiap penyisipan.
  const heads = [...html.matchAll(/<h2[^>]*class="section-title[^"]*"[^>]*>([\s\S]*?)<\/h2>/g)];
  const head = heads.find((m) => m[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").includes(cuplik));
  if (!head) throw new Error(`Heading bagian "${cuplik}" tidak ditemukan`);
  const posJudul = head.index;
  const posParagraf = html.indexOf('class="section-desc', posJudul);
  const posTutup = html.indexOf("</p>", posParagraf);
  if (posParagraf < 0 || posTutup < 0) throw new Error(`Paragraf pembuka "${cuplik}" tidak ditemukan`);
  const frasa = FRASA[i % FRASA.length](nomor);
  const blok = `\n<!-- ILUSTRASI-M1:${nomor}:START -->\n${renderIlustrasi(spesifikasi[i], nomor)}\n<!-- ILUSTRASI-M1:${nomor}:END -->`;
  html = `${html.slice(0, posTutup)} ${frasa}</p>${blok}${html.slice(posTutup + 4)}`;
});

// CSS figure: satu blok style bertanda sendiri sebelum </head>.
html = html.replace(/<style id="ilustrasi-css">[\s\S]*?<\/style>\n?/, "");
html = html.replace("</head>", `<style id="ilustrasi-css">${CSS_ILUSTRASI}</style>\n</head>`);

// Kotak penjelasan panel animasi menyebut nomor serinya.
let urutAnim = 0;
html = html.replace(/Cara Membaca Animasi(?: Ini| \d+)?:/g, () => {
  urutAnim += 1;
  return `Cara Membaca Animasi ${urutAnim}:`;
});

// Setiap teks panel persamaan dan chip notasi diawali huruf kapital
// (idempoten: kapitalAwal tidak mengubah teks yang sudah kapital/lambang).
// Sel yang dibuka "\(" adalah LaTeX — polanya menuntut huruf kecil di awal,
// sehingga lambang seperti \(e_{ss}\) tidak ikut dikapitalkan.
for (const kelas of ["formula", "formula-main", "formula-label"]) {
  const pola = new RegExp(`(class="${kelas}">\\s*)([a-zà-ÿ][^<]*)`, "g");
  html = html.replace(pola, (m, awal, isi) => awal + kapitalAwal(isi));
}
html = html.replace(/(Persamaan \(\d+\)<\/strong> — )([a-zà-ÿ][^<]*)/g, (m, awal, isi) => awal + kapitalAwal(isi));
html = html.replace(/(<span class="rumus-notasi">[^<]*(?:<[^>]+>[^<]*)*?<\/span><span>)([a-zà-ÿ][^<]*)/g, (m, awal, isi) => awal + kapitalAwal(isi));
html = html.replace(/(<span class="anim-var[^"]*"><code>[^<]*<\/code><span>)([a-zà-ÿ][^<]*)/g, (m, awal, isi) => awal + kapitalAwal(isi));

fs.writeFileSync(target, html);
console.log(`Modul-1: 6 ilustrasi tersisip, ${urutAnim} kotak animasi dinomori.`);
