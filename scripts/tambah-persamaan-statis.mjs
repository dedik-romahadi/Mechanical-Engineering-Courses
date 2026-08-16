/**
 * Menomori persamaan pada halaman modul yang ditulis tangan dan melampirkan
 * kotak penjelasan beserta arti tiap notasinya.
 *
 * Pola mengikuti modul Sisken: tiap blok rumus mendapat nomor di sisi kanan,
 * lalu di bawahnya menyusul kotak "Persamaan (N)" yang menjelaskan maksud
 * rumus dengan bahasa biasa dan mendaftar arti setiap lambangnya sebagai chip
 * berwarna. Paragraf pembuka bagian ikut menyebut nomor itu bila belum.
 *
 * Idempoten: nomor, kotak, dan kalimat rujukan lama dibuang lebih dahulu
 * lewat penanda, jadi menjalankan ulang tidak menggandakan apa pun.
 *
 * Pakai:
 *   node scripts/tambah-persamaan-statis.mjs               # semua kursus di data
 *   node scripts/tambah-persamaan-statis.mjs Getaran-Mekanik
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { kapitalAwal } from "./sisken-rumus.mjs";
import { PERSAMAAN_STATIS, ATURAN_BLOK } from "./persamaan-statis-data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Gaya chip dan nomor persamaan disalin dari modul Sisken supaya tampilannya
// sama persis lintas mata kuliah; halaman tulisan tangan belum memuatnya.
const CSS = `
#page-modul .formula-block{position:relative}
#page-modul .formula-number{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:var(--cyan);opacity:.85}
#page-modul .rumus-jelas{margin-top:-6px;font-size:16.5px;line-height:1.65}
#page-modul .anim-var-list{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
#page-modul .anim-var{--na:0,229,255;--nt:#9ff6ff;display:inline-flex;align-items:center;gap:10px;padding:9px 14px;border:1px solid rgba(var(--na),.22);border-radius:12px;background:linear-gradient(180deg,rgba(var(--na),.07),rgba(var(--na),.02));font-size:16.5px;line-height:1.55;color:var(--text);max-width:100%}
#page-modul .anim-var.nw1{--na:168,85,247;--nt:#dcbcff}
#page-modul .anim-var.nw2{--na:0,224,158;--nt:#8dffd8}
#page-modul .anim-var.nw3{--na:249,115,22;--nt:#ffc59b}
#page-modul .anim-var.nw4{--na:14,165,233;--nt:#a5dcff}
#page-modul .rumus-notasi{font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;color:var(--nt);background:rgba(var(--na),.14);border:1px solid rgba(var(--na),.38);border-radius:8px;padding:3px 10px;white-space:nowrap}
`;

const FRASA = [
  (k) => `Hubungan ini dirangkum dalam Persamaan (${k}) di bawah.`,
  (k) => `Bentuk ringkasnya dituliskan pada Persamaan (${k}).`,
  (k) => `Persamaan (${k}) di bawah memadatkan aturan tersebut.`,
  (k) => `Rangkuman kuantitatifnya tertulis pada Persamaan (${k}).`,
];
const RX_RUJUKAN = / (?:Hubungan ini dirangkum dalam Persamaan \(\d+\) di bawah\.|Bentuk ringkasnya dituliskan pada Persamaan \(\d+\)\.|Persamaan \(\d+\) di bawah memadatkan aturan tersebut\.|Rangkuman kuantitatifnya tertulis pada Persamaan \(\d+\)\.)(?=<\/p>)/g;
const RX_KOTAK = /\n?<!-- PERSAMAAN-STATIS:\d+:START -->[\s\S]*?<!-- PERSAMAAN-STATIS:\d+:END -->/g;
const RX_NOMOR = /<span class="formula-number">\(\d+\)<\/span>/g;

/** Kotak penjelasan: maksud persamaan plus arti tiap notasinya. */
function kotakJelas(spec, nomor) {
  if (!spec.apa || !spec.variabel?.length) {
    throw new Error(`Persamaan (${nomor}) tanpa penjelasan atau daftar notasi`);
  }
  const chips = spec.variabel.map(([notasi, arti], i) =>
    `<span class="anim-var nw${i % 5}"><span class="rumus-notasi">\\(${notasi}\\)</span><span>${esc(kapitalAwal(arti))}</span></span>`).join("");
  return `  <div class="tip-box reveal rumus-jelas">
    <strong>📐 Persamaan (${nomor})</strong> — ${esc(kapitalAwal(spec.apa))}
    <div class="anim-var-list" aria-label="Arti tiap notasi">${chips}</div>
  </div>`;
}

/**
 * Penentu blok mana yang dihitung sebagai persamaan konsep. Markup halaman
 * berbeda antar mata kuliah, jadi aturannya dinyatakan eksplisit di data:
 *
 * - "label-polos": hanya blok berlabel `<div class="label">` tanpa atribut.
 *   Dipakai Getaran dan Matematika 4, yang halamannya juga memuat blok
 *   contoh terselesaikan berlabel bergaya ("Contoh 5.1", "Penyelesaian ...")
 *   yang bukan persamaan konsep.
 * - "semua-berlabel": setiap blok berlabel, kecuali kotak langkah. Dipakai
 *   Optimalisasi & Otomasi yang seluruh blok rumusnya memang persamaan
 *   konsep, hanya labelnya ditulis dengan atribut gaya.
 */
function pembuatPenentu(aturan) {
  if (aturan === "semua-berlabel") {
    return (isi) => {
      const lab = isi.match(/class="label"[^>]*>([\s\S]*?)<\/div>/);
      if (!lab) return false;
      return !/Langkah-demi-Langkah/.test(lab[1].replace(/<[^>]*>/g, ""));
    };
  }
  return (isi) => /<div class="label">/.test(isi);
}

function prosesBerkas(berkas, daftar, konsep) {
  let html = fs.readFileSync(berkas, "utf8");
  html = html.replace(RX_KOTAK, "").replace(RX_RUJUKAN, "").replace(RX_NOMOR, "");

  // Blok rumus memuat <div class="label"> di dalamnya, jadi penutupnya dicari
  // dengan menghitung kedalaman tag. Pola non-greedy akan berhenti di penutup
  // label dan menyisipkan nomor ke tempat yang salah.
  const blok = [];
  for (const m of html.matchAll(/<div class="formula-block[^"]*"[^>]*>/g)) {
    let dalam = 1;
    const rx = /<div\b[^>]*>|<\/div>/g;
    rx.lastIndex = m.index + m[0].length;
    let t;
    while ((t = rx.exec(html)) !== null) {
      dalam += t[0] === "</div>" ? -1 : 1;
      if (dalam === 0) break;
    }
    if (!t) throw new Error(`${path.basename(berkas)}: blok rumus tanpa penutup`);
    const akhir = t.index + t[0].length;
    if (!konsep(html.slice(m.index, akhir))) continue;
    blok.push({ mulai: m.index, akhir });
  }
  if (blok.length !== daftar.length) {
    throw new Error(`${path.basename(berkas)}: ${blok.length} blok rumus, tetapi datanya ${daftar.length} entri`);
  }

  // Tahap 1 — nomor dan kotak penjelasan. Disisipkan dari BELAKANG: keduanya
  // ditempatkan di dalam atau sesudah blok, jadi posisi blok sebelumnya aman.
  for (let i = blok.length - 1; i >= 0; i -= 1) {
    const nomor = i + 1;
    const { mulai, akhir } = blok[i];
    const isi = html.slice(mulai, akhir);
    const kotak = `\n<!-- PERSAMAAN-STATIS:${nomor}:START -->\n${kotakJelas(daftar[i], nomor)}\n<!-- PERSAMAAN-STATIS:${nomor}:END -->`;
    // Nomor dipasang tepat sebelum penutup blok; blok sudah position:relative.
    const isiBaru = isi.replace(/<\/div>$/, `<span class="formula-number">(${nomor})</span></div>`);
    if (isiBaru === isi) throw new Error(`${path.basename(berkas)}: blok ${nomor} tidak berakhir dengan </div>`);
    html = html.slice(0, mulai) + isiBaru + kotak + html.slice(akhir);
  }

  // Tahap 2 — kalimat rujukan pada paragraf pembuka. Dipisah karena
  // penyisipannya berada SEBELUM blok, sehingga akan menggeser posisi blok
  // lain; posisinya dicari ulang tiap putaran lewat penanda nomornya.
  for (let nomor = daftar.length; nomor >= 1; nomor -= 1) {
    const penanda = `<span class="formula-number">(${nomor})</span>`;
    const posBlok = html.indexOf(penanda);
    if (posBlok < 0) continue;
    const paragraf = html.lastIndexOf('class="section-desc', posBlok);
    if (paragraf < 0) continue;
    const tutup = html.indexOf("</p>", paragraf);
    if (tutup < 0 || tutup > posBlok) continue;
    if (/Persamaan \(\d+\)/.test(html.slice(paragraf, tutup))) continue;
    const frasa = FRASA[(nomor - 1) % FRASA.length](nomor);
    html = `${html.slice(0, tutup)} ${frasa}${html.slice(tutup)}`;
  }

  html = html.replace(/<style id="persamaan-css">[\s\S]*?<\/style>\n?/, "");
  html = html.replace("</head>", `<style id="persamaan-css">${CSS}</style>\n</head>`);
  fs.writeFileSync(berkas, html);
  return daftar.length;
}

const pilihan = process.argv.slice(2).filter((a) => !a.startsWith("--"));
let total = 0;
for (const [kursus, modul] of Object.entries(PERSAMAAN_STATIS)) {
  if (pilihan.length && !pilihan.includes(kursus)) continue;
  let perKursus = 0;
  for (const [nomor, daftar] of Object.entries(modul)) {
    const berkas = path.join(root, kursus, "Modul", `Modul-${nomor}.html`);
    if (!fs.existsSync(berkas)) throw new Error(`Berkas tidak ada: ${berkas}`);
    perKursus += prosesBerkas(berkas, daftar, pembuatPenentu(ATURAN_BLOK[kursus]));
  }
  total += perKursus;
  console.log(`${kursus}: ${perKursus} persamaan bernomor pada ${Object.keys(modul).length} modul`);
}
console.log(`Total ${total} persamaan diberi nomor dan penjelasan.`);
