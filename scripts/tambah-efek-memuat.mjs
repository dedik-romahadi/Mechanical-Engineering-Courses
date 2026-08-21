/**
 * Memberi efek memuat yang terlihat pada tombol yang menunggu jaringan.
 *
 * MASALAHNYA. Halaman sudah menonaktifkan tombol dan mengganti labelnya saat
 * menunggu ("Memverifikasi...", "Menyimpan..."), tetapi tidak ada satu pun
 * yang BERGERAK. Pada koneksi lambat — dan login exam memang menunggu roster,
 * hash PIN, callable verifyPin, lalu tulis RTDB — perubahan teks yang diam
 * mudah luput, sehingga terasa "diklik tetapi tidak ada reaksi" dan mahasiswa
 * menekan tombolnya berkali-kali.
 *
 * YANG DILAKUKAN. Menyisipkan satu helper bersama (`mulaiMuat`/`selesaiMuat`)
 * beserta CSS pemutarnya, lalu menulis ulang seluruh titik muat ad-hoc agar
 * memanggil helper itu. Perilakunya tidak berubah: tombol tetap dinonaktifkan
 * dan labelnya tetap sama persis — yang bertambah hanya pemutar yang berputar,
 * `aria-busy` untuk pembaca layar, dan pemulihan gaya yang konsisten.
 *
 * Idempoten: penanda EFEK-MEMUAT menandai blok yang disisipkan, dan titik yang
 * sudah ditulis ulang tidak lagi cocok dengan pola lama.
 *
 * Pakai:
 *   node scripts/tambah-efek-memuat.mjs            # terapkan
 *   node scripts/tambah-efek-memuat.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const BLOK = `<!-- EFEK-MEMUAT:START v1 -->
<style>
/* Pemutar kecil di dalam tombol yang sedang menunggu jaringan. Memakai
   currentColor supaya otomatis serasi dengan tombol mana pun. */
@keyframes efekMemuatPutar { to { transform: rotate(360deg); } }
.tombol-memuat { cursor: wait !important; opacity: .72; }
.tombol-memuat .efek-memuat-putaran {
  display: inline-block; width: 1em; height: 1em; margin-right: .5em;
  vertical-align: -.15em; border: 2px solid currentColor;
  border-right-color: transparent; border-radius: 50%;
  animation: efekMemuatPutar .7s linear infinite;
}
/* Sebagian aksi menonaktifkan SEKELOMPOK tombol sekaligus (overlay reset dan
   atur jadwal) tanpa satu tombol pemicu yang bisa dikenali seragam. Untuk itu
   pemutarnya digambar lewat ::before pada tombol utama saja, sehingga innerHTML
   tidak perlu disentuh dan pemulihannya cukup melepas kelasnya. */
.kelompok-memuat.v-btn-primary::before {
  content: ''; display: inline-block; width: 1em; height: 1em; margin-right: .5em;
  vertical-align: -.15em; border: 2px solid currentColor;
  border-right-color: transparent; border-radius: 50%;
  animation: efekMemuatPutar .7s linear infinite;
}
/* Hormati pengguna yang meminta gerak dikurangi: pemutarnya tetap ada sebagai
   penanda keadaan, hanya jauh lebih lambat. */
@media (prefers-reduced-motion: reduce) {
  .tombol-memuat .efek-memuat-putaran,
  .kelompok-memuat.v-btn-primary::before { animation-duration: 2.4s; }
}
</style>
<script>
/** Tandai tombol sedang menunggu: pemutar + label + nonaktif. */
window.mulaiMuat = function (el, label) {
  if (!el) return;
  if (el.dataset.labelAsli === undefined) el.dataset.labelAsli = el.textContent;
  el.disabled = true;
  el.setAttribute('aria-busy', 'true');
  el.classList.add('tombol-memuat');
  el.innerHTML = '<span class="efek-memuat-putaran" aria-hidden="true"></span>'
    + String(label == null ? el.dataset.labelAsli : label);
};
/** Kembalikan tombol ke keadaan semula. Argumen label opsional. */
window.selesaiMuat = function (el, label) {
  if (!el) return;
  el.disabled = false;
  el.removeAttribute('aria-busy');
  el.classList.remove('tombol-memuat');
  el.style.opacity = '1';
  el.style.cursor = 'pointer';
  el.textContent = String(label == null
    ? (el.dataset.labelAsli === undefined ? el.textContent : el.dataset.labelAsli)
    : label);
};
</script>
<!-- EFEK-MEMUAT:END v1 -->
`;

// Titik "mulai menunggu" versi lama. Nama variabelnya bebas, tetapi urutan
// keempat pernyataannya seragam di seluruh halaman.
const RX_MULAI = /(\w+)\.disabled\s*=\s*true;\s*(?:\1\.dataset\.labelAsli\s*=\s*\1\.dataset\.labelAsli\s*\|\|\s*\1\.textContent;\s*)?\1\.style\.opacity\s*=\s*'\.6';\s*\1\.style\.cursor\s*=\s*'wait';\s*\1\.textContent\s*=\s*('(?:[^'\\]|\\.)*');/g;

// Titik "selesai". Label pemulihnya dipertahankan apa adanya.
const RX_SELESAI = /(\w+)\.disabled\s*=\s*false;\s*\1\.style\.opacity\s*=\s*'1';\s*\1\.style\.cursor\s*=\s*'pointer';\s*\1\.textContent\s*=\s*([^;]+);/g;

// Aksi yang menonaktifkan sekelompok tombol sekaligus (overlay reset & jadwal).
// Cukup ditambahi kelas; pemutarnya digambar CSS pada tombol utama.
const RX_KELOMPOK_MATI = /btns\.forEach\(b=>\{b\.disabled=true;b\.style\.opacity='\.5';b\.style\.cursor='wait';\}\);/g;
const RX_KELOMPOK_HIDUP = /btns\.forEach\(b=>\{b\.disabled=false;b\.style\.opacity='1';b\.style\.cursor='pointer';\}\);/g;

function proses(berkas) {
  let html = fs.readFileSync(berkas, "utf8");
  const awal = html;
  let mulai = 0;
  let selesai = 0;

  html = html.replace(RX_MULAI, (_, v, label) => { mulai += 1; return `mulaiMuat(${v}, ${label});`; });
  html = html.replace(RX_SELESAI, (_, v, label) => {
    selesai += 1;
    const bersih = label.trim();
    // "x.dataset.labelAsli || x.textContent" adalah default helper — buang saja.
    const bawaan = new RegExp(`^${v}\\.dataset\\.labelAsli\\s*\\|\\|\\s*${v}\\.textContent$`);
    return bawaan.test(bersih) ? `selesaiMuat(${v});` : `selesaiMuat(${v}, ${bersih});`;
  });

  let kelompok = 0;
  html = html.replace(RX_KELOMPOK_MATI, () => { kelompok += 1;
    return "btns.forEach(b=>{b.disabled=true;b.style.opacity='.5';b.style.cursor='wait';b.classList.add('kelompok-memuat');});"; });
  html = html.replace(RX_KELOMPOK_HIDUP, () =>
    "btns.forEach(b=>{b.disabled=false;b.style.opacity='1';b.style.cursor='pointer';b.classList.remove('kelompok-memuat');});");

  // Blok lama DIBUANG lebih dahulu, bukan dilewati: kalau hanya dilewati,
  // halaman yang sudah menerima versi sebelumnya tidak akan pernah mendapat
  // perbaikan CSS berikutnya — persis yang terjadi saat pemutar kelompok
  // ditambahkan dan aturannya tidak pernah sampai ke halaman.
  html = html.replace(/<!-- EFEK-MEMUAT:START[\s\S]*?<!-- EFEK-MEMUAT:END[^>]*-->\n?/, "");
  if (mulai || selesai || kelompok || /mulaiMuat\(|kelompok-memuat/.test(html)) {
    if (!html.includes("</head>")) throw new Error(`${path.basename(berkas)}: tidak ada </head>`);
    html = html.replace("</head>", `${BLOK}</head>`);
  }
  if (html === awal) return null;
  return { html, mulai, selesai, kelompok };
}

const periksa = process.argv.includes("--periksa");
function kumpulkan(pola) {
  const out = [];
  for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
    if (!kursus.isDirectory()) continue;
    for (const sub of pola) {
      const dir = path.join(root, kursus.name, sub);
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir)) {
        if (f.endsWith(".html")) out.push(path.join(dir, f));
      }
    }
  }
  const admin = path.join(root, "Admin");
  if (fs.existsSync(admin)) {
    for (const f of fs.readdirSync(admin)) if (f.endsWith(".html")) out.push(path.join(admin, f));
  }
  return out.sort();
}

let n = 0;
let tm = 0;
let ts = 0;
let tk = 0;
for (const f of kumpulkan(["Exam", "Modul"])) {
  const hasil = proses(f);
  if (!hasil) continue;
  n += 1; tm += hasil.mulai; ts += hasil.selesai; tk += hasil.kelompok;
  if (!periksa) fs.writeFileSync(f, hasil.html);
}
console.log(`${n} halaman ${periksa ? "akan diperbarui" : "diperbarui"}: `
  + `${tm} titik mulai-muat, ${ts} titik selesai-muat, ${tk} kelompok tombol.`);
