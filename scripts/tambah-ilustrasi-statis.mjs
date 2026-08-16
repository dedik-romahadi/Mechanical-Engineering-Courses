/**
 * Menyisipkan ilustrasi bernomor ke halaman modul yang ditulis tangan.
 *
 * Modul Getaran Mekanik, Matematika 4, dan Optimalisasi & Otomasi tidak punya
 * generator seperti Sisken: halamannya ditulis langsung. Skrip ini memakai
 * mesin gambar yang sama (sisken-ilustrasi.mjs) lalu menempelkan hasilnya ke
 * bagian yang disebut spesifikasi di ilustrasi-statis-data.mjs.
 *
 * Idempoten: blok lama dikenali penanda ILUSTRASI-STATIS dan dibuang lebih
 * dahulu, jadi menjalankan ulang tidak menggandakan gambar.
 *
 * Pakai:
 *   node scripts/tambah-ilustrasi-statis.mjs            # semua kursus di data
 *   node scripts/tambah-ilustrasi-statis.mjs Getaran-Mekanik
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderIlustrasi, CSS_ILUSTRASI } from "./sisken-ilustrasi.mjs";
import { GAMBAR_STATIS } from "./ilustrasi-statis-data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Frasa rujukan dirotasi supaya satu halaman tidak terdengar monoton; pola
// yang sama dipakai generator Sisken sehingga gaya seluruh mata kuliah sama.
const FRASA = [
  (k) => `Gambar ${k} mengilustrasikan gagasan ini.`,
  (k) => `Skemanya diperlihatkan pada Gambar ${k}.`,
  (k) => `Perhatikan ilustrasinya pada Gambar ${k}.`,
  (k) => `Gambar ${k} merangkum alurnya secara visual.`,
];
const RX_RUJUKAN = / (?:Gambar \d+ mengilustrasikan gagasan ini\.|Skemanya diperlihatkan pada Gambar \d+\.|Perhatikan ilustrasinya pada Gambar \d+\.|Gambar \d+ merangkum alurnya secara visual\.)(?=<\/p>)/g;
const RX_BLOK = /\n?<!-- ILUSTRASI-STATIS:\d+:START -->[\s\S]*?<!-- ILUSTRASI-STATIS:\d+:END -->/g;

/** Posisi akhir `</p>` paragraf pembuka bagian yang judulnya memuat `kunci`. */
function titikSisip(html, kunci) {
  const judul = [...html.matchAll(/<h2[^>]*class="section-title[^"]*"[^>]*>([\s\S]*?)<\/h2>/g)];
  // Tag dibuang TANPA disisipi spasi: judul seperti "Transmissibility T<sub>d</sub>"
  // harus terbaca "Transmissibility Td" agar kunci pada data tetap alami.
  const cocok = judul.find((m) => m[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").includes(kunci));
  if (!cocok) return null;
  const mulai = cocok.index + cocok[0].length;
  const paragraf = html.indexOf('class="section-desc', mulai);
  if (paragraf < 0) return null;
  const tutup = html.indexOf("</p>", paragraf);
  return tutup < 0 ? null : tutup;
}

function prosesBerkas(berkas, daftar) {
  let html = fs.readFileSync(berkas, "utf8");
  html = html.replace(RX_BLOK, "").replace(RX_RUJUKAN, "");

  // Disisipkan dari BELAKANG supaya indeks bagian sebelumnya tetap sahih,
  // tetapi nomornya tetap urut dari atas halaman.
  const sisip = daftar.map((spec, i) => ({ spec, nomor: i + 1, pos: titikSisip(html, spec.kunci) }));
  const hilang = sisip.filter((s) => s.pos === null).map((s) => s.spec.kunci);
  if (hilang.length) {
    throw new Error(`${path.basename(berkas)}: bagian tidak ditemukan -> ${hilang.join(" | ")}`);
  }
  // Dua kunci yang menunjuk bagian sama berarti salah satunya terlalu umum
  // dan menyambar judul lain — gambarnya akan menumpuk di satu tempat.
  const ganda = sisip.filter((s, i) => sisip.findIndex((t) => t.pos === s.pos) !== i);
  if (ganda.length) {
    throw new Error(`${path.basename(berkas)}: kunci menunjuk bagian yang sama -> ${ganda.map((g) => g.spec.kunci).join(" | ")}`);
  }
  const urut = [...sisip].sort((a, b) => a.pos - b.pos);
  if (urut.some((s, i) => s.nomor !== i + 1)) {
    throw new Error(`${path.basename(berkas)}: urutan spesifikasi tidak sesuai urutan bagian di halaman`);
  }
  for (const { spec, nomor, pos } of [...sisip].reverse()) {
    const frasa = FRASA[(nomor - 1) % FRASA.length](nomor);
    const blok = `\n<!-- ILUSTRASI-STATIS:${nomor}:START -->\n${renderIlustrasi(spec, nomor)}\n<!-- ILUSTRASI-STATIS:${nomor}:END -->`;
    html = `${html.slice(0, pos)} ${frasa}</p>${blok}${html.slice(pos + 4)}`;
  }

  html = html.replace(/<style id="ilustrasi-css">[\s\S]*?<\/style>\n?/, "");
  html = html.replace("</head>", `<style id="ilustrasi-css">${CSS_ILUSTRASI}</style>\n</head>`);
  fs.writeFileSync(berkas, html);
  return daftar.length;
}

const pilihan = process.argv.slice(2).filter((a) => !a.startsWith("--"));
let total = 0;
for (const [kursus, modul] of Object.entries(GAMBAR_STATIS)) {
  if (pilihan.length && !pilihan.includes(kursus)) continue;
  let perKursus = 0;
  for (const [nomor, daftar] of Object.entries(modul)) {
    const berkas = path.join(root, kursus, "Modul", `Modul-${nomor}.html`);
    if (!fs.existsSync(berkas)) throw new Error(`Berkas tidak ada: ${berkas}`);
    perKursus += prosesBerkas(berkas, daftar);
  }
  total += perKursus;
  console.log(`${kursus}: ${perKursus} ilustrasi pada ${Object.keys(modul).length} modul`);
}
console.log(`Total ${total} ilustrasi tersisip.`);
