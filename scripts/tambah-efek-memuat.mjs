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

const BLOK = `<!-- EFEK-MEMUAT:START v2 -->
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
/**
 * Bungkus aksi async dari atribut onclick tanpa menyentuh isi fungsinya.
 *
 * Sebagian handler punya banyak return dini untuk galat validasi. Menyisipkan
 * pemulihan di tiap cabang itu rapuh — satu cabang terlewat berarti tombolnya
 * mati selamanya. Blok finally menutup seluruh cabang sekaligus, termasuk saat
 * handler melempar.
 */
window.jalankanDenganMuat = async function (el, label, fn) {
  if (typeof fn !== 'function') return;
  window.mulaiMuat(el, label);
  try { return await fn(); } finally { window.selesaiMuat(el); }
};
</script>
<!-- EFEK-MEMUAT:END v2 -->
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

// Handler async yang dipanggil tombol tetapi sama sekali tidak menyentuh
// tombolnya. Dibungkus di TITIK PANGGIL supaya isi fungsinya — beserta seluruh
// `return` dini untuk galat validasi — tidak perlu diubah sama sekali.
const BUNGKUS = [
  ["submitDosenLogin", "Memverifikasi..."],
  ["saveSchedule", "Menyimpan..."],
];

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

  let bungkus = 0;
  for (const [fn, label] of BUNGKUS) {
    const rx = new RegExp(`onclick="${fn}\\(\\s*\\)"`, "g");
    html = html.replace(rx, () => { bungkus += 1;
      return `onclick="jalankanDenganMuat(this,'${label}',${fn})"`; });
  }

  let kelompok = 0;
  html = html.replace(RX_KELOMPOK_MATI, () => { kelompok += 1;
    return "btns.forEach(b=>{b.disabled=true;b.style.opacity='.5';b.style.cursor='wait';b.classList.add('kelompok-memuat');});"; });
  html = html.replace(RX_KELOMPOK_HIDUP, () =>
    "btns.forEach(b=>{b.disabled=false;b.style.opacity='1';b.style.cursor='pointer';b.classList.remove('kelompok-memuat');});");

  // Isi blok lama selalu DITIMPA, bukan dilewati: kalau hanya dilewati, halaman
  // yang sudah menerima versi sebelumnya tidak akan pernah mendapat perbaikan
  // CSS berikutnya — persis yang terjadi saat pemutar kelompok ditambahkan dan
  // aturannya tidak pernah sampai ke halaman.
  //
  // Tetapi POSISINYA dipertahankan. Versi lama membuang blok lalu menyisipkan
  // ulang tepat sebelum </head>, dan tambah-efek-jawaban.mjs melakukan hal yang
  // sama untuk bloknya sendiri. Keduanya jadi berebut tempat terakhir: jalankan
  // skrip ini, 64 halaman "berubah" (blok pindah ke bawah blok JAWABAN, nol
  // perubahan isi); jalankan skrip itu, 64 halaman berubah lagi (pindah balik).
  // Siklus dua langkah yang tidak pernah selesai. Dengan mengganti di tempat,
  // urutan yang sudah ada tetap dan kedua skrip benar-benar idempoten apa pun
  // urutan menjalankannya.
  const RX_BLOK = /<!-- EFEK-MEMUAT:START[\s\S]*?<!-- EFEK-MEMUAT:END[^>]*-->\n?/;
  const adaBlok = RX_BLOK.test(html);
  // Uji kebutuhan dilakukan pada teks TANPA blok: blok itu sendiri memuat
  // "kelompok-memuat" di CSS-nya, jadi mengujinya utuh selalu bernilai benar.
  const tanpaBlok = html.replace(RX_BLOK, "");
  const perluBlok = mulai || selesai || kelompok || bungkus
    || /mulaiMuat\(|kelompok-memuat|jalankanDenganMuat/.test(tanpaBlok);
  if (adaBlok) {
    html = html.replace(RX_BLOK, () => (perluBlok ? BLOK : ""));
  } else if (perluBlok) {
    if (!html.includes("</head>")) throw new Error(`${path.basename(berkas)}: tidak ada </head>`);
    html = html.replace("</head>", () => `${BLOK}</head>`);
  }
  if (html === awal) return null;
  return { html, mulai, selesai, kelompok, bungkus };
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

// --- Pemilih peran halaman OBE ----------------------------------------------
// Kasus berbeda dari tombol di Exam/Modul: modalnya diganti seluruhnya, jadi
// pemutar pada tombol (mulaiMuat/selesaiMuat) tidak punya tempat. Yang dipakai
// bentuk titik-titik seperti modal login Modul (.loading-students).
//
// Bukan hiasan: getFb() mengimpor tiga modul Firebase dari jaringan. Sebelum
// ini impor itu baru jalan saat tombol "Masuk" ditekan, sehingga jeda pertama
// terjadi tanpa umpan balik apa pun. Sekarang dipanaskan tepat setelah peran
// dipilih, dengan indikator yang bergerak.
const OBE_CSS_JANGKAR =
  "  .btn-import{background:rgba(34,211,238,.15);color:var(--cyan);border:1px solid rgba(34,211,238,.3)}";
const OBE_CSS_BARU = OBE_CSS_JANGKAR + `
  /* Efek loading pemilih peran — bentuknya disamakan dengan modal login
     halaman Modul (.loading-students/.loading-dot di sana). */
  .loading-students{display:flex;align-items:center;justify-content:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#94a3b8;min-height:26px;transition:all .3s}
  .loading-dot{width:6px;height:6px;border-radius:50%;animation:ldot .8s ease-in-out infinite;flex-shrink:0}
  .loading-dot:nth-child(1){background:#06d6a0}
  .loading-dot:nth-child(2){background:#fbbf24;animation-delay:.16s}
  .loading-dot:nth-child(3){background:#a855f7;animation-delay:.32s}
  @keyframes ldot{0%,80%,100%{transform:scale(.55);opacity:.35}40%{transform:scale(1.1);opacity:1}}`;

const OBE_HELPER_JANGKAR = "window.loginAsDosen = async function(){";
const OBE_HELPER = `// Efek loading pemilih peran — bentuknya disamakan dengan modal login di
// halaman Modul. Bukan sekadar hiasan: getFb() mengimpor tiga modul Firebase
// dari jaringan, dan tanpa ini jeda itu baru terasa setelah tombol "Masuk"
// ditekan, tanpa umpan balik apa pun.
function _modalMemuatLogin(judul, teks){
  showModal(\`
    <h3 style="margin:0 0 6px;font-size:18px">\${judul}</h3>
    <div class="loading-students" style="margin:20px 0 8px">
      <div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div>
      <span>\${teks}</span>
    </div>
  \`);
}
async function _siapkanLogin(jugaRoster){
  // Kegagalan di sini sengaja tidak memblokir: formulirnya tetap ditampilkan
  // dan getFb() dicoba ulang saat submit, di mana galatnya punya tempat tampil.
  try {
    await Promise.all(jugaRoster ? [getFb(), STUDENTS_READY] : [getFb()]);
  } catch(e){ console.error('[login] gagal menyiapkan koneksi:', e); }
}

`;
const OBE_TITIK = [
  [
    "window.loginAsDosen = async function(){\n  showModal(`",
    "window.loginAsDosen = async function(){\n"
      + "  _modalMemuatLogin('\u{1F468}‍\u{1F3EB} Login Dosen', 'Menyiapkan koneksi…');\n"
      + "  await _siapkanLogin(false);\n  showModal(`",
  ],
  [
    "window.loginAsMahasiswa = async function(){\n  showModal(`",
    "window.loginAsMahasiswa = async function(){\n"
      + "  _modalMemuatLogin('\u{1F393} Login Mahasiswa', 'Memuat data mahasiswa…');\n"
      + "  await _siapkanLogin(true);\n  showModal(`",
  ],
];

function prosesObe(berkas) {
  let html = fs.readFileSync(berkas, "utf8");
  if (html.includes("_modalMemuatLogin")) return null;
  const nama = path.relative(root, berkas);
  if (!html.includes(OBE_CSS_JANGKAR)) throw new Error(`${nama}: jangkar CSS .btn-import tidak ada`);
  if (!html.includes(OBE_HELPER_JANGKAR)) throw new Error(`${nama}: loginAsDosen tidak ada`);
  html = html.replace(OBE_CSS_JANGKAR, OBE_CSS_BARU)
             .replace(OBE_HELPER_JANGKAR, OBE_HELPER + OBE_HELPER_JANGKAR);
  for (const [lama, baru] of OBE_TITIK) {
    if (!html.includes(lama)) throw new Error(`${nama}: titik login tidak cocok`);
    html = html.replace(lama, baru);
  }
  return html;
}

let n = 0;
let tm = 0;
let ts = 0;
let tk = 0;
let tb = 0;
for (const f of kumpulkan(["Exam", "Modul"])) {
  const hasil = proses(f);
  if (!hasil) continue;
  n += 1; tm += hasil.mulai; ts += hasil.selesai; tk += hasil.kelompok; tb += hasil.bungkus;
  if (!periksa) fs.writeFileSync(f, hasil.html);
}
let nObe = 0;
for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
  if (!kursus.isDirectory()) continue;
  const p = path.join(root, kursus.name, "OBE", "Penilaian-OBE.htm");
  if (!fs.existsSync(p)) continue;
  const html = prosesObe(p);
  if (!html) continue;
  nObe += 1;
  if (!periksa) fs.writeFileSync(p, html);
}
console.log(`${n} halaman ${periksa ? "akan diperbarui" : "diperbarui"}: `
  + `${tm} titik mulai-muat, ${ts} titik selesai-muat, ${tk} kelompok tombol, ${tb} handler dibungkus.`);
console.log(`${nObe} halaman OBE ${periksa ? "akan diberi" : "diberi"} efek loading pemilih peran.`);
