/**
 * Efek perayaan benar/salah bergaya Duolingo pada tiap jawaban yang dikirim.
 *
 * Saat server menjawab, sebuah emoji muncul melayang di atas kotak umpan balik
 * soal itu: wajah senang memantul (dengan jempol) untuk benar, wajah berpikir
 * untuk sebagian, wajah sedih bergoyang untuk salah. Tiap status punya
 * beberapa varian wajah (lihat VARIAN) yang dipilih acak per jawaban. Untuk
 * jawaban benar, kartu soal ikut berdenyut hijau dan konfeti kecil terlempar.
 *
 * EMOJI DIGAMBAR, BUKAN DIKETIK. Emoji font tampil datar dan berbeda di tiap
 * perangkat (Windows, Android, iOS menggambar wajah yang berlainan). Di sini
 * wajahnya SVG berlapis: gradien radial memberi volume bola, sorotan spekular
 * di kiri-atas memberi kesan kilap, bayangan elips lembut di bawah memberi
 * kesan melayang, dan pantulannya memakai kurva easing "overshoot" supaya
 * terasa punya bobot. Hasilnya sama di semua perangkat dan terlihat 3D.
 *
 * HANYA JAWABAN BARU. Jalur alreadyAnswered dan healed (pemulihan setelah
 * refresh) sudah `return` lebih dulu di kedua penerap hasil, jadi penyisipan
 * ditaruh tepat di blok "fresh attempt" — memuat ulang halaman tidak akan
 * memicu perayaan ulang.
 *
 * Gerak dihormati: pada prefers-reduced-motion emoji tetap muncul (ia membawa
 * informasi), tetapi tanpa pantulan, goyangan, dan konfeti.
 *
 * Idempoten lewat penanda EFEK-JAWABAN; blok lama diganti, bukan dilewati.
 *
 * Pakai:
 *   node scripts/tambah-efek-jawaban.mjs            # terapkan
 *   node scripts/tambah-efek-jawaban.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Wajah SVG. Tiga lapisan volume: bola bergradien radial (terang di kiri-atas,
// gelap di tepi kanan-bawah), cincin tepi gelap tipis agar bolanya "terangkat"
// dari latar, lalu sorotan spekular putih yang memberi kesan kilap.
// Semua bola berwarna kuning; status dibedakan dari ekspresi (senyum+jempol,
// berpikir, menangis dengan air mata biru), bukan dari warna bola.
// Lapisannya: bola bergradien radial, cincin tepi gelap,
// kilap spekular, DAN pantulan cahaya lingkungan di bawah (rim light) supaya
// bolanya tidak terlihat "ditempel" — itulah yang membuatnya tampak 3D.
// Palet bola bergaya stiker klasik (acuan gambar dosen, 22 Agu 2026): kuning
// terang di pusat → emas → jingga pekat di tepi, garis tepi cokelat tua tebal.
// [terang, tengah, gelap, garis, rim]
const PALET = {
  senang: ["#fff9c4", "#ffd21f", "#f07c00", "#4a2a00", "#ffb300"],
  pikir: ["#fff6c8", "#ffc928", "#ee7a00", "#4a2a00", "#ffa000"],
  sedih: ["#fff9c4", "#ffd21f", "#f07c00", "#4a2a00", "#ffb300"],
};
const PUPIL = "#111";

// Mata berkedip lewat SMIL: skala-Y mengecil sesaat tiap ~3 detik.
const KEDIP = `<animateTransform attributeName="transform" type="scale" additive="sum" values="1 1;1 1;1 .08;1 1;1 1" keyTimes="0;.9;.93;.96;1" dur="3.2s" repeatCount="indefinite"/>`;
// Mata putih besar berpupil hitam — ciri utama set acuan.
const mataPutih = (x, y, garis, geserPupil = 0, r = 10, ry = r * 1.15) =>
  `<g transform="translate(${x} ${y})"><g><ellipse rx="${r}" ry="${ry}" fill="#fff" stroke="${garis}" stroke-width="2.2"/>`
  + `<circle cx="${geserPupil}" cy="${ry * 0.18}" r="${r * 0.5}" fill="${PUPIL}"/><circle cx="${geserPupil - r * 0.18}" cy="${ry * 0.18 - r * 0.2}" r="${r * 0.17}" fill="#fff"/>${KEDIP}</g></g>`;
// Mata tertawa: lengkung tertutup tebal.
const mataSenyum = (x, y, garis) =>
  `<g transform="translate(${x} ${y})"><g><path d="M-9 2 Q0 -10 9 2" fill="none" stroke="${garis}" stroke-width="5" stroke-linecap="round"/>${KEDIP}</g></g>`;
// Mata terpejam (kedip / menangis keras): lengkung ke bawah.
const mataTutup = (x, y, garis) =>
  `<path d="M${x - 9} ${y} Q${x} ${y + 8} ${x + 9} ${y}" fill="none" stroke="${garis}" stroke-width="5" stroke-linecap="round"/>`;
const alis = (d, garis, lebar = 4.5) => `<path d="${d}" stroke="${garis}" stroke-width="${lebar}" fill="none" stroke-linecap="round"/>`;
const hati = (x, y) =>
  `<g transform="translate(${x} ${y})"><path d="M0 6 C-11 -3 -11 -14 -1.5 -12 C0 -11 0 -9 0 -8 C0 -9 0 -11 1.5 -12 C11 -14 11 -3 0 6 Z" fill="#ff1744" stroke="#8e0000" stroke-width="1.6" transform="scale(1.35)">`
  + `<animateTransform attributeName="transform" type="scale" values="1.35;1.55;1.35" dur=".7s" repeatCount="indefinite"/></path><ellipse cx="-5" cy="-10" rx="2.2" ry="1.4" fill="#fff" opacity=".7" transform="rotate(-30)"/></g>`;
// Air mata: tetes biru besar bergaris tepi biru tua, jatuh berulang.
const tetes = (x, y0, y1, delay, rx = 4, ry = 6.5) =>
  `<ellipse cx="${x}" cy="${y0}" rx="${rx}" ry="${ry}" fill="#5ac8ff" stroke="#1565c0" stroke-width="1.4">`
  + `<animate attributeName="cy" values="${y0};${y1}" dur="1.1s" begin="${delay}s" repeatCount="indefinite"/>`
  + `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.7;1" dur="1.1s" begin="${delay}s" repeatCount="indefinite"/></ellipse>`;
// Semburan air mata ke samping (menangis keras / tertawa sampai menangis).
const semburan = (x, y, arah) =>
  `<g transform="translate(${x} ${y}) scale(${arah} 1)"><path d="M0 0 C6 -2 14 2 18 10 C14 6 8 8 2 6 Z" fill="#5ac8ff" stroke="#1565c0" stroke-width="1.4">`
  + `<animateTransform attributeName="transform" type="scale" values="1 1;1.15 1.1;1 1" dur=".8s" repeatCount="indefinite"/></path>`
  + `<ellipse cx="20" cy="14" rx="3" ry="4" fill="#5ac8ff" stroke="#1565c0" stroke-width="1.2"><animate attributeName="cy" values="12;26" dur=".9s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur=".9s" repeatCount="indefinite"/></ellipse></g>`;
// Mulut "bernapas" dengan garis tepi cokelat tebal.
const mulutBernapas = (d1, d2, fill, garis, dur = "1.4s", tebal = 3) =>
  `<path fill="${fill}" stroke="${garis}" stroke-width="${tebal}" stroke-linejoin="round"><animate attributeName="d" values="${d1};${d2};${d1}" dur="${dur}" repeatCount="indefinite"/></path>`;
// Mulut tawa lebar: rongga merah tua, deretan gigi putih di atas, lidah merah di bawah.
const mulutTawa = (garis, lebar = 1) =>
  `<g transform="translate(50 60) scale(${lebar}) translate(-50 -60)">`
  + mulutBernapas("M26 54 Q50 58 74 54 Q72 86 50 88 Q28 86 26 54 Z", "M25 53 Q50 57 75 53 Q73 89 50 91 Q27 89 25 53 Z", "#7a1010", garis, "1.4s", 3.2)
  + `<path d="M29 56 Q50 60 71 56 L70 64 Q50 68 30 64 Z" fill="#fff"/>`
  + `<path d="M36 78 Q50 70 64 78 Q58 88 50 88 Q42 88 36 78 Z" fill="#ff3d3d"/><path d="M50 74 V84" stroke="#c62828" stroke-width="1.2" opacity=".6"/>`
  + `</g>`;
const pipiMerah = `<ellipse cx="20" cy="60" rx="9" ry="5.5" fill="#ff6d4d" opacity=".55"/><ellipse cx="80" cy="60" rx="9" ry="5.5" fill="#ff6d4d" opacity=".55"/>`;

// Ragam wajah (acuan: lembar emoji klasik yang dikirim dosen, tanpa emoji
// kotoran, tanpa wajah marah untuk jawaban salah). Kunci: jenis (palet +
// animasi), mata, mulut, ekstra. Dipilih acak per jawaban.
const VARIAN = {
  // ── BENAR ──
  tawa: { jenis: "senang", mata: g => mataSenyum(34, 36, g) + mataSenyum(66, 36, g),
    mulut: g => mulutTawa(g), ekstra: () => "" },
  kedip: { jenis: "senang", mata: g => mataPutih(36, 38, g, 1.5, 11, 12.5) + mataTutup(65, 40, g) + alis("M24 22 Q36 16 48 22", g),
    mulut: g => mulutBernapas("M38 62 Q50 70 62 62 Q62 78 50 80 Q38 78 38 62 Z", "M37 62 Q50 70 63 62 Q63 81 50 83 Q37 81 37 62 Z", "#7a1010", g)
      + `<path d="M44 72 Q50 68 56 72 Q54 78 50 78 Q46 78 44 72 Z" fill="#ff3d3d"/>`,
    ekstra: () => "" },
  kacamata: { jenis: "senang", mata: g =>
      `<g><path d="M8 30 H92" stroke="#111" stroke-width="3.5" stroke-linecap="round"/>`
      + `<path d="M16 30 Q16 50 30 50 Q44 50 46 30 Z" fill="#151515" stroke="#000" stroke-width="1.5"/><path d="M54 30 Q56 50 70 50 Q84 50 84 30 Z" fill="#151515" stroke="#000" stroke-width="1.5"/>`
      + `<path d="M20 34 L34 34" stroke="#fff" stroke-width="2.5" opacity=".55" stroke-linecap="round"/><path d="M58 34 L72 34" stroke="#fff" stroke-width="2.5" opacity=".55" stroke-linecap="round"/></g>`,
    mulut: g => mulutBernapas("M24 60 Q50 64 76 60 Q72 82 50 84 Q28 82 24 60 Z", "M23 60 Q50 64 77 60 Q73 85 50 87 Q27 85 23 60 Z", "#fff", g, "1.4s", 3.2)
      + `<path d="M27 66 Q50 70 73 66 M31 72 Q50 76 69 72" stroke="${g}" stroke-width="1.4" fill="none" opacity=".55"/><path d="M36 61 V80 M44 62 V83 M50 63 V84 M56 62 V83 M64 61 V80" stroke="${g}" stroke-width="1.2" opacity=".35"/>`,
    ekstra: () => "" },
  cinta: { jenis: "senang", mata: () => hati(34, 40) + hati(66, 40),
    mulut: g => mulutBernapas("M36 62 Q50 66 64 62 Q62 80 50 82 Q38 80 36 62 Z", "M35 62 Q50 66 65 62 Q63 83 50 85 Q37 83 35 62 Z", "#7a1010", g)
      + `<path d="M40 64 Q50 66 60 64 L59 69 Q50 71 41 69 Z" fill="#fff"/><path d="M42 76 Q50 70 58 76 Q55 82 50 82 Q45 82 42 76 Z" fill="#ff3d3d"/>`,
    ekstra: () => pipiMerah },
  tawaAirMata: { jenis: "senang", mata: g => mataTutup(34, 32, g) + mataTutup(66, 32, g)
      + alis("M22 24 Q34 18 46 24", g, 4) + alis("M54 24 Q66 18 78 24", g, 4),
    mulut: g => mulutTawa(g, 1.08),
    ekstra: () => semburan(22, 36, -1) + semburan(78, 36, 1) },
  bangga: { jenis: "senang", mata: g => `<g transform="translate(36 42)"><g><ellipse rx="11" ry="7" fill="#fff" stroke="${g}" stroke-width="2.2"/><circle cx="3" cy="-1" r="4.5" fill="${PUPIL}"/><circle cx="1.6" cy="-2.6" r="1.5" fill="#fff"/><path d="M-12 -1 Q0 -10 12 -1" fill="url(#ej-bangga-bola)" stroke="${g}" stroke-width="2.2"/>${KEDIP}</g></g>`
      + `<g transform="translate(64 42)"><g><ellipse rx="11" ry="7" fill="#fff" stroke="${g}" stroke-width="2.2"/><circle cx="3" cy="-1" r="4.5" fill="${PUPIL}"/><circle cx="1.6" cy="-2.6" r="1.5" fill="#fff"/><path d="M-12 -1 Q0 -10 12 -1" fill="url(#ej-bangga-bola)" stroke="${g}" stroke-width="2.2"/>${KEDIP}</g></g>`
      + alis("M22 30 Q34 24 48 31", g) + alis("M52 30 Q66 22 78 27", g),
    mulut: g => `<path d="M34 68 Q52 78 68 62" fill="none" stroke="${g}" stroke-width="5" stroke-linecap="round"/>`,
    ekstra: () => pipiMerah },
  // ── SEBAGIAN ──
  pikir: { jenis: "pikir", mata: g => mataPutih(36, 44, g, 2, 9, 10) + mataPutih(64, 40, g, 2, 9, 10)
      + alis("M24 32 Q36 26 47 33", g) + alis("M53 28 Q64 18 76 26", g),
    mulut: g => `<path fill="none" stroke="${g}" stroke-width="5" stroke-linecap="round"><animate attributeName="d" values="M34 70 Q50 64 66 72;M34 71 Q50 66 66 70;M34 70 Q50 64 66 72" dur="2.2s" repeatCount="indefinite"/></path>`,
    ekstra: (t, gelap) => `<circle cx="77" cy="78" r="7.5" fill="${t}" stroke="${gelap}" stroke-width="2.2"/>` },
  lidah: { jenis: "pikir", mata: g => mataPutih(35, 40, g, 3, 10, 11.5) + mataPutih(65, 40, g, -3, 10, 11.5)
      + alis("M22 24 Q35 18 48 26", g) + alis("M52 26 Q65 18 78 24", g),
    mulut: g => `<path d="M32 62 Q50 74 68 62" fill="none" stroke="${g}" stroke-width="5" stroke-linecap="round"/>`
      + `<g><path d="M50 66 C50 66 64 62 68 72 C72 84 60 90 54 82 C50 76 50 70 50 66 Z" fill="#ff3d3d" stroke="#8e0000" stroke-width="2"><animateTransform attributeName="transform" type="rotate" values="0 50 66;7 50 66;0 50 66" dur=".9s" repeatCount="indefinite"/></path><path d="M58 70 L62 80" stroke="#c62828" stroke-width="1.3" opacity=".7"/></g>`,
    ekstra: () => "" },
  polos: { jenis: "pikir", mata: g => mataPutih(35, 42, g, 0, 11, 12.5) + mataPutih(65, 42, g, 0, 11, 12.5)
      + alis("M22 26 Q35 18 48 26", g) + alis("M52 26 Q65 18 78 26", g),
    mulut: g => `<path d="M40 70 Q50 78 60 70" fill="none" stroke="${g}" stroke-width="4.5" stroke-linecap="round"/>`,
    ekstra: () => "" },
  // ── SALAH (sedih, bukan marah) ──
  menangis: { jenis: "sedih", mata: g => mataPutih(35, 42, g, 0, 9.5, 11) + mataPutih(65, 42, g, 0, 9.5, 11)
      + alis("M22 32 Q34 30 46 24", g) + alis("M78 32 Q66 30 54 24", g),
    mulut: g => `<path fill="none" stroke="${g}" stroke-width="5" stroke-linecap="round"><animate attributeName="d" values="M36 78 Q50 64 64 78;M36 79 Q50 66 64 79;M36 78 Q50 64 64 78" dur=".8s" repeatCount="indefinite"/></path>`
      + `<path d="M42 75 Q50 70 58 75" fill="#ff8a80" opacity=".7"/>`,
    ekstra: () => `<path d="M29 52 Q27 66 31 80" fill="none" stroke="#5ac8ff" stroke-width="4" stroke-linecap="round" opacity=".9"/><path d="M71 52 Q73 66 69 80" fill="none" stroke="#5ac8ff" stroke-width="4" stroke-linecap="round" opacity=".9"/>`
      + tetes(30, 56, 86, 0) + tetes(70, 56, 86, .4)
      + `<ellipse cx="50" cy="94" rx="15" ry="3.2" fill="#2196f3" opacity=".6"><animate attributeName="rx" values="11;17;11" dur="1.4s" repeatCount="indefinite"/></ellipse>` },
  meraung: { jenis: "sedih", mata: g => mataTutup(34, 40, g) + mataTutup(66, 40, g)
      + alis("M22 30 Q34 26 46 30", g) + alis("M54 30 Q66 26 78 30", g),
    mulut: g => mulutBernapas("M36 60 Q50 54 64 60 Q66 86 50 90 Q34 86 36 60 Z", "M35 59 Q50 53 65 59 Q67 89 50 93 Q33 89 35 59 Z", "#5a0c0c", g, ".7s", 3.2)
      + `<path d="M40 62 Q50 58 60 62 L59 67 Q50 64 41 67 Z" fill="#fff"/>`,
    ekstra: () => semburan(22, 42, -1) + semburan(78, 42, 1) },
  cemas: { jenis: "sedih", mata: g => mataPutih(35, 44, g, 0, 9.5, 11) + mataPutih(65, 44, g, 0, 9.5, 11)
      + alis("M22 34 Q34 30 46 24", g) + alis("M78 34 Q66 30 54 24", g),
    mulut: g => `<path fill="none" stroke="${g}" stroke-width="4.8" stroke-linecap="round"><animate attributeName="d" values="M34 72 Q42 64 50 72 Q58 80 66 72;M34 73 Q42 65 50 73 Q58 81 66 73;M34 72 Q42 64 50 72 Q58 80 66 72" dur="1s" repeatCount="indefinite"/></path>`,
    ekstra: () => `<path d="M82 22 Q90 34 90 39 A8 8 0 1 1 74 39 Q74 34 82 22 Z" fill="#5ac8ff" stroke="#1565c0" stroke-width="1.4"><animateTransform attributeName="transform" type="translate" values="0 0;0 4;0 0" dur="1.3s" repeatCount="indefinite"/></path>` },
  murung: { jenis: "sedih", mata: g => `<g transform="translate(35 44)"><g><ellipse rx="10" ry="6.5" fill="#fff" stroke="${g}" stroke-width="2.2"/><circle cx="0" cy="1" r="4" fill="${PUPIL}"/><path d="M-11 0 Q0 -9 11 0" fill="url(#ej-murung-bola)" stroke="${g}" stroke-width="2.2"/>${KEDIP}</g></g>`
      + `<g transform="translate(65 44)"><g><ellipse rx="10" ry="6.5" fill="#fff" stroke="${g}" stroke-width="2.2"/><circle cx="0" cy="1" r="4" fill="${PUPIL}"/><path d="M-11 0 Q0 -9 11 0" fill="url(#ej-murung-bola)" stroke="${g}" stroke-width="2.2"/>${KEDIP}</g></g>`
      + alis("M22 34 Q34 32 46 30", g) + alis("M78 34 Q66 32 54 30", g),
    mulut: g => `<path fill="none" stroke="${g}" stroke-width="5" stroke-linecap="round"><animate attributeName="d" values="M38 74 Q50 66 62 74;M38 75 Q50 68 62 75;M38 74 Q50 66 62 74" dur="1.6s" repeatCount="indefinite"/></path>`,
    ekstra: () => tetes(70, 54, 78, .3) },
};
const VARIAN_STATUS = {
  correct: ["tawa", "kedip", "kacamata", "cinta", "tawaAirMata", "bangga"],
  partial: ["pikir", "lidah", "polos"],
  wrong: ["menangis", "meraung", "cemas", "murung"],
};

function wajah(nama) {
  const v = VARIAN[nama];
  if (!v) throw new Error(`varian wajah '${nama}' tidak dikenal`);
  const [terang, tengah, gelap, garis, rim] = PALET[v.jenis];
  const id = `ej-${nama}`;

  // Bintang berkilau hanya untuk benar: empat bintang kecil berkedip bergantian.
  const bintang = v.jenis === "senang"
    ? [[8, 18, 0], [92, 24, .35], [12, 86, .7], [90, 80, 1.05]].map(([x, y, d]) =>
      `<path transform="translate(${x} ${y})" d="M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6 Z" fill="#fff">`
      + `<animate attributeName="opacity" values="0;1;0" dur="1.4s" begin="${d}s" repeatCount="indefinite"/>`
      + `<animateTransform attributeName="transform" type="scale" additive="sum" values=".4;1.2;.4" dur="1.4s" begin="${d}s" repeatCount="indefinite"/></path>`).join("")
    : "";

  // Jempol untuk benar: tangan terangkat di kanan-bawah bola, muncul dengan
  // "pop" lalu mengangguk kecil. Digambar bersih (bukan emoji font) supaya
  // warnanya serasi dengan bola dan sama di semua perangkat.
  const jempol = v.jenis === "senang"
    ? `<g class="ej-jempol" transform="translate(79 74)">`
      + `<animateTransform attributeName="transform" type="translate" additive="sum" values="0 14;0 -3;0 0" keyTimes="0;.6;1" dur=".5s" begin=".35s" fill="freeze"/>`
      + `<g transform="scale(1.9)"><g><animateTransform attributeName="transform" type="rotate" values="-8;8;-8" dur="1.1s" begin=".9s" repeatCount="3"/>`
      + `<rect x="-9" y="-2" width="16" height="15" rx="5" fill="${tengah}" stroke="${garis}" stroke-width="2.2"/>`
      + `<path d="M-9 3 H7 M-9 8 H7" stroke="${garis}" stroke-width="1.6" opacity=".6"/>`
      + `<path d="M-2 -2 C-2 -8 -1 -14 3 -14 C7 -14 8 -9 7 -4 L7 -2" fill="${tengah}" stroke="${garis}" stroke-width="2.2" stroke-linejoin="round"/>`
      + `<ellipse cx="2.5" cy="-9" rx="2" ry="3" fill="#fff" opacity=".55"/>`
      + `</g></g></g>`
    : "";

  return `<svg viewBox="0 0 100 112" width="72" height="81" aria-hidden="true">`
    + `<defs>`
    + `<radialGradient id="${id}-bola" cx="36%" cy="30%" r="72%"><stop offset="0" stop-color="${terang}"/><stop offset=".5" stop-color="${tengah}"/><stop offset="1" stop-color="${gelap}"/></radialGradient>`
    + `<radialGradient id="${id}-kilap" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="${id}-rim" cx="50%" cy="100%" r="55%"><stop offset="0" stop-color="${rim}" stop-opacity=".75"/><stop offset="1" stop-color="${rim}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="${id}-bayang" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`
    + `</defs>`
    + `<circle class="ej-pancar" cx="50" cy="50" r="46" fill="none" stroke="${rim}" stroke-width="3"/>`
    + `<ellipse class="ej-bayang" cx="50" cy="104" rx="26" ry="6" fill="url(#${id}-bayang)"/>`
    + `<g class="ej-bola">`
    // Garis tepi cokelat tebal + kilap putih besar di kiri-atas, seperti stiker.
    + `<circle cx="50" cy="50" r="46" fill="url(#${id}-bola)" stroke="${garis}" stroke-width="3"/>`
    + `<ellipse cx="50" cy="76" rx="36" ry="16" fill="url(#${id}-rim)"/>`
    + `<ellipse cx="31" cy="24" rx="15" ry="9" fill="#fff" opacity=".85" transform="rotate(-28 31 24)"/>`
    + `<ellipse cx="30" cy="28" rx="20" ry="13" fill="url(#${id}-kilap)" transform="rotate(-28 30 28)"/>`
    + v.ekstra(tengah, gelap) + v.mata(garis) + v.mulut(garis)
    + `</g>`
    + bintang
    + jempol
    + `</svg>`;
}

const BLOK = `<!-- EFEK-JAWABAN:START v1 -->
<style>
/* Panggung emoji: melayang di atas kotak umpan balik, tidak menggeser tata letak. */
.feedback{position:relative}
.ej-panggung{position:absolute;left:50%;top:-14px;transform:translate(-50%,-100%);pointer-events:none;z-index:5;filter:drop-shadow(0 10px 14px rgba(0,0,0,.28))}
.ej-panggung svg{display:block;overflow:visible}
/* Pantulan dengan overshoot supaya terasa berbobot, lalu lenyap pelan. */
@keyframes ejMuncul{0%{opacity:0;transform:translate(-50%,-60%) scale(.3)}55%{opacity:1;transform:translate(-50%,-112%) scale(1.12)}75%{transform:translate(-50%,-100%) scale(.96)}100%{opacity:1;transform:translate(-50%,-100%) scale(1)}}
@keyframes ejLenyap{to{opacity:0;transform:translateY(-22px) scale(.85)}}
@keyframes ejPantul{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes ejBayangPantul{0%,100%{transform:scaleX(1);opacity:1}50%{transform:scaleX(.78);opacity:.6}}
@keyframes ejGoyang{0%,100%{transform:rotate(0)}25%{transform:rotate(-9deg)}75%{transform:rotate(9deg)}}
@keyframes ejDenyutHijau{0%{box-shadow:0 0 0 0 rgba(0,224,158,.55)}100%{box-shadow:0 0 0 22px rgba(0,224,158,0)}}
@keyframes ejDenyutMerah{0%{box-shadow:0 0 0 0 rgba(239,68,68,.45)}100%{box-shadow:0 0 0 18px rgba(239,68,68,0)}}
@keyframes ejKonfeti{0%{opacity:1;transform:translate(0,0) rotate(0)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(540deg)}}
/* Muncul dan lenyap dipisah ke DUA elemen. Saat keduanya dipasang pada satu
   elemen sebagai daftar animasi, keyframe 0% ejMuncul (opacity 0, scale .3)
   tetap terpegang — diukur di browser: pada 900 ms opacity masih 0 dan
   transform masih scale(.3) meski kedua animasi "running". Dengan elemen
   terpisah tidak ada dua animasi yang memperebutkan properti yang sama. */
.ej-panggung{animation:ejMuncul .6s cubic-bezier(.34,1.56,.64,1) both}
.ej-isi{display:block;animation:ejLenyap .5s ease-in 2.6s forwards}
.ej-senang .ej-bola{transform-box:fill-box;transform-origin:center;animation:ejPantul .55s ease-in-out .6s 3}
.ej-senang .ej-bayang{transform-box:fill-box;transform-origin:center;animation:ejBayangPantul .55s ease-in-out .6s 3}
.ej-sedih .ej-bola{transform-box:fill-box;transform-origin:50% 90%;animation:ejGoyang .5s ease-in-out .6s 3}
.ej-pikir .ej-bola{transform-box:fill-box;transform-origin:center;animation:ejGoyang 1.1s ease-in-out .6s 2}
/* Cincin pancar: melebar dan memudar dari belakang bola, dua kali saat muncul. */
@keyframes ejPancar{0%{transform:scale(.9);opacity:.9}100%{transform:scale(1.9);opacity:0}}
.ej-pancar{transform-box:fill-box;transform-origin:center;opacity:0;animation:ejPancar 1.1s ease-out .15s 2}
.ej-denyut-benar{animation:ejDenyutHijau .9s ease-out;border-radius:inherit}
.ej-denyut-salah{animation:ejDenyutMerah .7s ease-out;border-radius:inherit}
.ej-konfeti{position:absolute;left:50%;top:-20px;width:8px;height:8px;border-radius:2px;pointer-events:none;z-index:4;animation:ejKonfeti 1s cubic-bezier(.2,.8,.4,1) forwards}
/* Tombol bisu: kecil, di SEBELAH KIRI tombol chat (.visitor-fab 56px di
   right:24px/bottom:24px), bukan di bawahnya — di pojok yang sama keduanya
   tumpang tindih. right = 24 + 56 + 12 jarak = 92px; bottom = 24 + (56-40)/2
   = 32px supaya pusatnya sejajar dengan pusat tombol chat. Tetap di bawah
   panel chat (bottom:92px) dan overlay login (z-index 100000+). */
.ej-tombol-bisu{position:fixed;right:92px;bottom:32px;z-index:9000;width:40px;height:40px;border-radius:50%;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.82);color:#fff;font-size:18px;line-height:1;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.28);backdrop-filter:blur(6px);transition:transform .15s ease,opacity .2s ease;opacity:.85}
.ej-tombol-bisu:hover{transform:scale(1.08);opacity:1}
.ej-tombol-bisu[aria-pressed="true"]{opacity:.55}
@media (prefers-reduced-motion:reduce){
  .ej-panggung{animation:none;opacity:1;transform:translate(-50%,-100%)}
  .ej-isi{animation:ejLenyap .4s ease-in 2.4s forwards}
  .ej-senang .ej-bola,.ej-senang .ej-bayang,.ej-sedih .ej-bola,.ej-pikir .ej-bola,.ej-pancar{animation:none}
  .ej-denyut-benar,.ej-denyut-salah{animation:none}
  .ej-konfeti{display:none}
}
</style>
<script>
(function(){
  // Beberapa varian per status; dipilih acak tiap jawaban, tidak mengulang
  // varian yang baru saja tampil.
  var WAJAH = {
    correct: ${JSON.stringify(VARIAN_STATUS.correct.map(wajah))},
    partial: ${JSON.stringify(VARIAN_STATUS.partial.map(wajah))},
    wrong: ${JSON.stringify(VARIAN_STATUS.wrong.map(wajah))}
  };
  var terakhir = {};
  function pilihWajah(status) {
    var daftar = WAJAH[status], i = Math.floor(Math.random() * daftar.length);
    if (daftar.length > 1 && i === terakhir[status]) i = (i + 1) % daftar.length;
    terakhir[status] = i;
    return daftar[i];
  }
  var KELAS = { correct: 'ej-senang', partial: 'ej-pikir', wrong: 'ej-sedih' };
  var WARNA_KONFETI = ['#00e09e','#ffd43b','#4fc3f7','#ff6b6b','#a855f7'];
  var diam = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Efek suara ─────────────────────────────────────────────────────────
     Disintesis lewat Web Audio API, bukan berkas audio: tanpa unduhan, tanpa
     aset yang perlu di-deploy, tanpa urusan lisensi. AudioContext dibuat malas
     pada perayaan pertama — selalu SESUDAH gestur kirim, sehingga tidak kena
     blokir autoplay browser. Volume rendah dan nadanya singkat; untuk salah
     dipilih dua nada turun yang lembut, bukan bunyi keras yang mempermalukan
     di ruang kelas. Tombol bisu tersimpan di localStorage supaya mahasiswa di
     tempat umum bisa mematikannya sekali untuk semua halaman. */
  var KUNCI_BISU = 'lms_suara_bisu';
  var ctxAudio = null;
  function bisu() { try { return localStorage.getItem(KUNCI_BISU) === '1'; } catch (e) { return false; } }
  function ambilCtx() {
    if (ctxAudio) return ctxAudio;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctxAudio = new AC(); } catch (e) { return null; }
    return ctxAudio;
  }
  // Satu nada: osilator sinus + envelope ADSR sederhana, lewat gain supaya
  // tidak ada "klik" di awal/akhir.
  function nada(ctx, freq, mulai, durasi, vol, jenis) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = jenis || 'sine'; o.frequency.setValueAtTime(freq, mulai);
    g.gain.setValueAtTime(0.0001, mulai);
    g.gain.exponentialRampToValueAtTime(vol, mulai + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, mulai + durasi);
    o.connect(g); g.connect(ctx.destination);
    o.start(mulai); o.stop(mulai + durasi + 0.02);
  }
  var SUARA = {
    // "ding" naik: C6 → E6, khas nada berhasil
    correct: function (ctx, t) { nada(ctx, 1046.5, t, 0.14, 0.16); nada(ctx, 1318.5, t + 0.11, 0.22, 0.18); },
    // satu nada netral pendek
    partial: function (ctx, t) { nada(ctx, 784.0, t, 0.16, 0.13, 'triangle'); },
    // dua nada turun yang lembut
    wrong:   function (ctx, t) { nada(ctx, 392.0, t, 0.14, 0.12, 'triangle'); nada(ctx, 311.1, t + 0.13, 0.22, 0.12, 'triangle'); }
  };
  window.bunyikanJawaban = function (status) {
    if (bisu() || !SUARA[status]) return;
    var ctx = ambilCtx(); if (!ctx) return;
    var jalankan = function () { try { SUARA[status](ctx, ctx.currentTime + 0.01); } catch (e) {} };
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume().then(jalankan, function () {}); else jalankan();
  };
  window.setBisuSuara = function (nilai) {
    try { localStorage.setItem(KUNCI_BISU, nilai ? '1' : '0'); } catch (e) {}
    document.querySelectorAll('.ej-tombol-bisu').forEach(function (b) {
      b.setAttribute('aria-pressed', nilai ? 'true' : 'false');
      b.title = nilai ? 'Suara efek (jawaban & tombol): mati — klik untuk nyalakan' : 'Suara efek (jawaban & tombol): nyala — klik untuk matikan';
      b.textContent = nilai ? '🔇' : '🔊';
    });
  };
  // Tombol bisu kecil di pojok kanan-bawah; dipasang sekali saat halaman siap.
  function pasangTombolBisu() {
    if (document.querySelector('.ej-tombol-bisu')) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'ej-tombol-bisu'; b.setAttribute('aria-label', 'Suara efek jawaban');
    b.addEventListener('click', function () { window.setBisuSuara(!bisu()); if (!bisu()) window.bunyikanJawaban('partial'); });
    document.body.appendChild(b);
    window.setBisuSuara(bisu());
  }
  /* ── Suara antarmuka (permintaan dosen, 22 Agu 2026) ────────────────────
     Bunyi pendek saat menekan tombol, memilih opsi jawaban (pilihan ganda
     .radio-option, benar/salah .tf-option), dan mencentang kotak/radio.
     Satu listener terdelegasi di document (fase capture) supaya berlaku juga
     untuk elemen yang dirender belakangan. Mengikuti tombol bisu yang sama.
     Tombol yang disabled tidak berbunyi — tidak ada aksi, tidak ada suara. */
  var SUARA_UI = {
    tombol: function (ctx, t) { nada(ctx, 880, t, 0.05, 0.07); },
    pilih:  function (ctx, t) { nada(ctx, 660, t, 0.05, 0.08, 'triangle'); nada(ctx, 990, t + 0.045, 0.07, 0.08, 'triangle'); },
    centang: function (ctx, t) { nada(ctx, 1320, t, 0.035, 0.07, 'square'); }
  };
  function bunyikanUI(jenis) {
    if (bisu() || !SUARA_UI[jenis]) return;
    var ctx = ambilCtx(); if (!ctx) return;
    var jalankan = function () { try { SUARA_UI[jenis](ctx, ctx.currentTime + 0.005); } catch (e) {} };
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume().then(jalankan, function () {}); else jalankan();
  }
  window.bunyikanUI = bunyikanUI;
  document.addEventListener('click', function (ev) {
    // .subnav-bar a = sub-tab bagian modul (tautan #m-N), diminta ikut berbunyi.
    var el = ev.target && ev.target.closest && ev.target.closest('.radio-option,.tf-option,button,[role="button"],.subnav-bar a,#modulSubnav a');
    if (!el || el.classList.contains('ej-tombol-bisu')) return;
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    if (el.tagName !== 'BUTTON' && el.tagName !== 'A' && el.getAttribute('role') !== 'button' && getComputedStyle(el).pointerEvents === 'none') return;
    bunyikanUI(el.matches('.radio-option,.tf-option') ? 'pilih' : 'tombol');
  }, true);
  document.addEventListener('change', function (ev) {
    var el = ev.target;
    if (el && el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) bunyikanUI('centang');
  }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasangTombolBisu); else pasangTombolBisu();

  /**
   * Rayakan hasil di atas kotak umpan balik. \`status\`: correct|partial|wrong.
   * Aman dipanggil berkali-kali: perayaan sebelumnya pada kotak yang sama dibuang.
   */
  window.rayakanJawaban = function (fb, status) {
    if (!fb || !WAJAH[status]) return;
    window.bunyikanJawaban(status);
    var lama = fb.querySelector('.ej-panggung');
    if (lama) lama.remove();
    var p = document.createElement('div');
    p.className = 'ej-panggung ' + KELAS[status];
    // SVG dibungkus elemen dalam yang memegang animasi lenyap, terpisah dari
    // animasi muncul di panggung luar — lihat catatan pada CSS .ej-isi.
    p.innerHTML = '<span class="ej-isi">' + pilihWajah(status) + '</span>';
    fb.appendChild(p);
    setTimeout(function(){ if (p.parentNode) p.remove(); }, 3300);

    // Denyut pada kartu soal terdekat supaya matanya tertarik ke soal yang benar.
    var kartu = fb.closest('.q-card, .question-card, .card, .task-card') || fb.parentElement;
    if (kartu && !diam) {
      var k = status === 'correct' ? 'ej-denyut-benar' : (status === 'wrong' ? 'ej-denyut-salah' : null);
      if (k) { kartu.classList.remove(k); void kartu.offsetWidth; kartu.classList.add(k);
        setTimeout(function(){ kartu.classList.remove(k); }, 1000); }
    }
    if (status === 'correct' && !diam) {
      for (var i = 0; i < 14; i++) {
        var c = document.createElement('i');
        c.className = 'ej-konfeti';
        var sudut = (Math.PI * 2) * (i / 14) + (Math.random() - .5) * .6;
        var jarak = 60 + Math.random() * 50;
        c.style.setProperty('--dx', Math.cos(sudut) * jarak + 'px');
        c.style.setProperty('--dy', (Math.sin(sudut) * jarak - 30) + 'px');
        c.style.background = WARNA_KONFETI[i % WARNA_KONFETI.length];
        c.style.animationDelay = (Math.random() * .12) + 's';
        fb.appendChild(c);
        (function(el){ setTimeout(function(){ if (el.parentNode) el.remove(); }, 1300); })(c);
      }
    }
  };
})();
</script>
<!-- EFEK-JAWABAN:END v1 -->
`;

// Titik sisip: awal blok "fresh attempt" pada kedua penerap hasil. Keduanya
// diawali `if (fb) {` tepat sesudah komentar penanda blok itu, dan jalur
// alreadyAnswered/healed sudah return di atasnya.
//
// Komentar penandanya ditulis dengan em-dash (—) di tiga course dan dengan
// tanda hubung ganda (--) di Optimalisasi & Otomasi, jadi dicocokkan lewat
// regex yang menerima keduanya — kalau tidak, ke-14 modul Opto terlewat.
//
// PENTING — dipanggil SESUDAH blok `if (fb) { … }` selesai, bukan di awalnya.
// Kotak .feedback berawal display:none dan baru tampil ketika className-nya
// diset di dalam blok itu. Emoji dijangkarkan di dalam kotak tersebut, jadi
// kalau dipanggil sebelum className diset, panggungnya dibuat di elemen yang
// masih tersembunyi dan berukuran 0×0 — tidak pernah terlihat pada jawaban
// pertama. Ini ketahuan dari pengukuran getBoundingClientRect di browser.
const PANGGIL = "  if (fb && typeof rayakanJawaban === 'function') rayakanJawaban(fb, status);\n";
// Modul: baris pertama sesudah blok if(fb) pada jalur fresh adalah komentar
// "Highlight correct option" — sama di keempat course, dan hanya muncul sekali
// di dalam _applyModulServerResult.
const RX_MODUL = /(\n)(  \/\/ Highlight correct option di DOM \(MC only\)\n)/g;
// Exam: baris pertama sesudah blok if(fb) pada jalur fresh adalah `if (sub) {`.
// Dijangkarkan lewat lookbehind pada penutup cabang wrong bertuliskan
// "Jawaban telah dikunci" (khas jalur fresh; alreadyAnswered memakai kalimat
// lain), supaya `if (sub) {` lain di halaman tidak ikut tersambar.
// Lima exam menyelipkan komentar "// Tombol & opsi visual lock" sebelum
// `if (sub) {`, tiga lainnya tidak — komentar itu dibuat opsional.
const RX_EXAM = /((?:UTS|UAS) murni, jadi jawaban benar tidak ditampilkan\)';\n    \}\n  \}\n\n)((?:  \/\/ Tombol & opsi visual lock\n)?  if \(sub\) \{)/g;

function proses(berkas) {
  let html = fs.readFileSync(berkas, "utf8");
  const awal = html;
  // Sisipan lama dibuang dulu supaya idempoten dan supaya perubahan titik sisip
  // di versi berikutnya tidak menumpuk.
  // Bentuk lama (`if (typeof …`) dan baru (`if (fb && typeof …`) sama-sama
  // dibuang. Kalau hanya bentuk lama yang dikenali, jalan kedua di halaman
  // modul menggandakan pemanggilan — jangkar "Highlight" tetap cocok walau
  // sisipan barunya masih ada di atasnya.
  //
  // Yang dibuang HANYA baris pemanggilannya sendiri (indentasi + isi + newline
  // miliknya). Versi sebelumnya menelan newline SEBELUM baris itu, sehingga
  // baris kosong pemisah `}\n\n  if (sub) {` di exam ikut hilang — RX_EXAM
  // tak cocok lagi, sisip=0, dan kedelapan exam tak pernah diperbarui lagi.
  html = html.replace(/^[ \t]*if \((?:fb && )?typeof rayakanJawaban === 'function'\) rayakanJawaban\(fb, status\);\n/gm, "");
  // Blok lama diganti PENANDA, bukan dibuang, supaya posisinya bisa dipakai
  // ulang. Versi lama membuangnya lalu menyisipkan ulang tepat sebelum
  // </head> — sama seperti tambah-efek-memuat.mjs untuk bloknya sendiri —
  // sehingga keduanya berebut tempat terakhir dan saling memindahkan blok
  // lawannya tiap kali dijalankan (siklus dua langkah, 64 berkas per langkah,
  // nol perubahan isi). Dengan mempertahankan posisi, urutan yang sudah ada
  // tetap dan kedua skrip idempoten apa pun urutan menjalankannya.
  //
  // Penandanya dipasang SEBELUM penyisipan pemanggilan supaya isi blok tidak
  // ikut terbaca oleh RX_MODUL/RX_EXAM, persis seperti pembuangan versi lama.
  // Berbentuk komentar HTML supaya, andai pun tertinggal karena bug,
  // halaman tetap sah - meski penjaga di bawah sudah menolak keadaan itu.
  const PENANDA = "<!--EFEK-JAWABAN:PENANDA-POSISI-->\n";
  const RX_BLOK = /<!-- EFEK-JAWABAN:START[\s\S]*?<!-- EFEK-JAWABAN:END[^>]*-->\n?/;
  const adaBlok = RX_BLOK.test(html);
  html = html.replace(RX_BLOK, () => PENANDA);

  let sisip = 0;
  // Kedua regex menangkap (sebelum)(sesudah); pemanggilan diselipkan di
  // antaranya sehingga teks asli di kedua sisi tidak berubah sama sekali.
  for (const rx of [RX_MODUL, RX_EXAM]) {
    html = html.replace(rx, (m, sebelum, sesudah) => { sisip += 1; return sebelum + PANGGIL + sesudah; });
  }
  if (!sisip) return null;
  if (adaBlok) {
    html = html.replace(PENANDA, () => BLOK);
  } else {
    if (!html.includes("</head>")) throw new Error(`${path.basename(berkas)}: tidak ada </head>`);
    html = html.replace("</head>", () => `${BLOK}</head>`);
  }
  if (html.includes(PENANDA)) throw new Error(`${path.basename(berkas)}: penanda blok tertinggal`);
  return html === awal ? null : { html, sisip };
}

const periksa = process.argv.includes("--periksa");
const berkas = [];
for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
  if (!kursus.isDirectory()) continue;
  for (const sub of ["Exam", "Modul"]) {
    const dir = path.join(root, kursus.name, sub);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) if (f.endsWith(".html")) berkas.push(path.join(dir, f));
  }
}
let n = 0;
let total = 0;
for (const f of berkas.sort()) {
  const hasil = proses(f);
  if (!hasil) continue;
  n += 1; total += hasil.sisip;
  if (!periksa) fs.writeFileSync(f, hasil.html);
}
console.log(`${n} halaman ${periksa ? "akan diperbarui" : "diperbarui"}, ${total} titik perayaan.`);
