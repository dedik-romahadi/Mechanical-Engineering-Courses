/**
 * Video penjelasan simulasi — memasang pemutar video di Bagian 07 (m-animasi) halaman modul TTL dan
 * menulis halaman tonton publik (tanpa login) untuk tombol Bagikan.
 *
 * PERMINTAAN DOSEN (21 Oktober 2026). Modul TTL diberi video penjelasan simulasi (rekaman halaman modul
 * dengan narasi suara + caption): lima animasi dan cell Python dijelaskan satu per satu. Percobaan di
 * Modul 1; modul lain menyusul. Penonton boleh membagikan tautannya, dan penerima langsung bisa
 * menonton tanpa melewati pilihan peran/login: tautan Bagikan menuju halaman tonton di folder Video/,
 * bukan ke halaman modul.
 *
 * YANG DIPASANG DI HALAMAN MODUL (bertanda, idempoten; jalan kedua melaporkan 0 berkas berubah):
 *   VIDEO-SIMULASI:CSS     <style id="video-simulasi-style"> di <head>
 *   VIDEO-SIMULASI:BLOK    kartu pemutar <video controls preload="none" poster> + tombol bab + tombol
 *                          Bagikan, tepat sebelum panel animasi pertama di #m-animasi
 *   VIDEO-SIMULASI:TAYANG  <script type="module" id="video-simulasi-tayang"> sebelum </body>: jumlah tayang
 *                          dari RTDB tayang/teknik_tenaga_listrik/modul-<N> (onValue), +1 per pemutaran
 *                          lewat runTransaction (pola sama dengan scripts/video-praktik.mjs; aturan RTDB
 *                          hanya menerima +1, backend database.rules.json).
 * HALAMAN TONTON: <KURSUS>/Video/<halaman> ditulis utuh oleh skrip ini (jangan disunting manual): video,
 * bab, penghitung tayang yang sama, tombol Bagikan, tautan ke modul. Tanpa login, tanpa createAdminSession.
 * Konfigurasi Firebase (publik) diambil dari halaman modul supaya tidak ada salinan kedua yang bisa basi.
 *
 * Tombol Bagikan: di ponsel memakai lembar bagikan bawaan (navigator.share); di desktop menyalin tautan
 * halaman tonton ke clipboard (cadangan: kotak prompt berisi tautan).
 *
 * Regenerasi modul (scripts/ttl-modul/bangun.py N) membuang blok ini: jalankan ulang skrip ini sesudahnya.
 *
 * MODUL BERVIDEO MATERI (24 Oktober 2026, dosen: "Hapus video simulasi karena sudah ada di video materi").
 * Video materi (scripts/video-materi.mjs) menjelaskan Bagian 01 sampai akhir, termasuk animasi dan cell
 * Python, jadi modul yang tercantum di VIDEO_MATERI tidak memakai video simulasi: modulnya tidak boleh ada di
 * VIDEO_SIMULASI, ketiga penanda di atas dibuang dari halaman modulnya, dan halaman tonton lama
 * (Modul-<N>-Simulasi.html, tautan yang mungkin sudah dibagikan) diganti halaman pengalih ke halaman tonton
 * video materi. MP4/JPG simulasinya dihapus dari repo.
 *
 * Pakai:
 *   node scripts/video-simulasi.mjs            # terapkan
 *   node scripts/video-simulasi.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { KURSUS, COURSE_ID, SITUS, VIDEO_SIMULASI } from "./video-simulasi-data.mjs";
import { VIDEO_MATERI } from "./video-materi-data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");
const FIREBASE = "https://www.gstatic.com/firebasejs/12.11.0";

const CSS_AWAL = "/* VIDEO-SIMULASI:CSS v1 — dipasang scripts/video-simulasi.mjs */";
const ATURAN = `.video-simulasi{margin:22px 0 26px;border:1px solid var(--border,#243653);border-radius:14px;background:var(--surface,#080f1e);overflow:hidden}
.video-simulasi .vs-kepala{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;padding:14px 18px 10px}
.video-simulasi .vs-ikon{font-size:1.25rem;line-height:1}
.video-simulasi .vs-judul{font-weight:800;font-size:1rem;color:var(--cyan,#67e8f9)}
.video-simulasi .vs-meta{margin-left:auto;font-size:.78rem;color:var(--muted,#aebbd0)}
.video-simulasi .vs-tayang{white-space:nowrap}
.video-simulasi video{display:block;width:100%;height:auto;aspect-ratio:16/9;background:#000}
.video-simulasi .vs-bab{display:flex;flex-wrap:wrap;gap:8px;padding:12px 18px 6px}
.video-simulasi .vs-bab button,.video-simulasi .vs-bagikan{font:inherit;font-size:.78rem;font-weight:700;padding:6px 12px;border-radius:999px;cursor:pointer;color:var(--cyan,#67e8f9);background:transparent;border:1px solid var(--border,#243653)}
.video-simulasi .vs-bab button:hover,.video-simulasi .vs-bab button:focus-visible,.video-simulasi .vs-bagikan:hover,.video-simulasi .vs-bagikan:focus-visible{background:rgba(103,232,249,.12);border-color:var(--cyan,#67e8f9);outline:none}
.video-simulasi .vs-aksi{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:6px 18px 4px}
.video-simulasi .vs-bagikan{color:#0b1220;background:var(--cyan,#67e8f9);border-color:var(--cyan,#67e8f9)}
.video-simulasi .vs-bagikan:hover,.video-simulasi .vs-bagikan:focus-visible{color:var(--cyan,#67e8f9)}
.video-simulasi .vs-pesan{font-size:.78rem;color:var(--muted,#aebbd0)}
.video-simulasi .vs-cat{margin:0;padding:6px 18px 14px;font-size:.8rem;line-height:1.5;color:var(--muted,#aebbd0)}
@media (max-width:600px){.video-simulasi .vs-meta{margin-left:0;width:100%}.video-simulasi .vs-kepala{padding:12px 14px 8px}.video-simulasi .vs-bab,.video-simulasi .vs-aksi{padding-left:14px;padding-right:14px}.video-simulasi .vs-cat{padding:6px 14px 12px}}`;
export const CSS = `<style id="video-simulasi-style">${CSS_AWAL}
${ATURAN}
</style>`;

const fmt = (d) => `${Math.floor(d / 60)}:${String(Math.floor(d % 60)).padStart(2, "0")}`;

// Kartu pemutar, dipakai halaman modul (dasar "../Video/") dan halaman tonton (dasar "").
function kartu(v, dasar, indent, catatan) {
  const id = `vs-m${v.modul}`;
  const tombol = v.bab
    .map(([label, t]) => `<button type="button" data-t="${t}" onclick="var v=document.getElementById('${id}');v.currentTime=${t};v.play()" aria-label="Lompat ke bab ${label} (${fmt(t)})">${label} <span aria-hidden="true">· ${fmt(t)}</span></button>`)
    .join(`\n${indent}    `);
  return `${indent}<div class="video-simulasi reveal" id="video-simulasi">
${indent}  <div class="vs-kepala"><span class="vs-ikon" aria-hidden="true">🎬</span><span class="vs-judul">Video penjelasan simulasi: ${v.judul}</span><span class="vs-meta">TTL Modul ${v.modul} · ${v.durasi}<span class="vs-tayang" data-tayang="modul-${v.modul}" hidden></span></span></div>
${indent}  <video id="${id}" controls preload="none" playsinline poster="${dasar}${v.poster}" aria-label="Video penjelasan simulasi Modul ${v.modul}: ${v.judul}">
${indent}    <source src="${dasar}${v.berkas}" type="video/mp4">
${indent}    Peramban Anda tidak mendukung pemutar video.
${indent}  </video>
${indent}  <div class="vs-bab" role="group" aria-label="Lompat ke bab">
${indent}    ${tombol}
${indent}  </div>
${indent}  <div class="vs-aksi"><button type="button" class="vs-bagikan" data-tonton="${dasar}${v.halaman}" data-judul="Video simulasi TTL Modul ${v.modul}: ${v.judul}" onclick="window._vsBagikan&&window._vsBagikan(this)">🔗 Bagikan video</button><span class="vs-pesan" role="status" aria-live="polite"></span></div>
${indent}  <p class="vs-cat">${catatan}</p>
${indent}</div>`;
}

// Tombol Bagikan (skrip klasik, tanpa host luar): tetap jalan walau skrip Firebase gagal dimuat.
const BAGIKAN = `<script id="video-simulasi-bagikan">
window._vsBagikan = function (btn) {
  var url = new URL(btn.getAttribute('data-tonton'), location.href);
  url.hash = ''; url.search = '';
  var tautan = url.href, judul = btn.getAttribute('data-judul') || document.title;
  var pesan = btn.parentNode.querySelector('.vs-pesan');
  function beri(t) { if (!pesan) return; pesan.textContent = t; clearTimeout(btn._vsT); btn._vsT = setTimeout(function () { pesan.textContent = ''; }, 4000); }
  function manual() { window.prompt('Salin tautan video ini:', tautan); }
  var sentuh = window.matchMedia && window.matchMedia('(pointer:coarse)').matches;
  if (sentuh && navigator.share) { navigator.share({ title: judul, text: judul, url: tautan }).catch(function () {}); return; }
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(tautan).then(function () { beri('✓ Tautan disalin — tempel di WhatsApp atau grup kelas. Penerima bisa langsung menonton tanpa login.'); }, manual);
  } else manual();
};
</script>`;

const KATA = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam"];
const catatanModul = (v) => `Video ini merekam halaman modul ini: ${KATA[v.animasi]} animasi di bawah dan cell Python di Bagian ${v.bagianPython} dijelaskan dengan narasi suara dan caption, memakai angka yang sama. Jeda video lalu coba sendiri slidernya. Tombol Bagikan menyalin tautan halaman tonton; penerima bisa langsung menonton tanpa login.`;
const catatanTonton = (v) => `Video ini merekam halaman Modul ${v.modul} Teknik Tenaga Listrik: ${KATA[v.animasi]} animasi interaktif dan cell Python dijelaskan dengan narasi suara dan caption. Untuk mencoba animasinya sendiri, buka modulnya (mahasiswa login dengan NIM dan PIN).`;

export function blok(v) {
  return `  <!-- VIDEO-SIMULASI:BLOK BEGIN v1 -->
${kartu(v, "../Video/", "  ", catatanModul(v))}
${BAGIKAN}
<!-- VIDEO-SIMULASI:BLOK END v1 -->
`;
}

// Penghitung tayang. `app` = ekspresi yang menghasilkan aplikasi Firebase: getApp() di halaman modul
// (skrip modul utama memanggil initializeApp), initializeApp(config) di halaman tonton.
function hitung(v, impor, app) {
  return `${impor}
import { getDatabase, ref, onValue, runTransaction } from "${FIREBASE}/firebase-database.js";
(function () {
  var video = document.getElementById('vs-m${v.modul}');
  var label = document.querySelector('.video-simulasi [data-tayang="modul-${v.modul}"]');
  if (!video || !label) return;
  var JALUR = 'tayang/${COURSE_ID}/modul-${v.modul}';
  var db = null;
  function sambung() {
    if (!db) { try { db = getDatabase(${app}); } catch (e) { db = null; } }
    return db;
  }
  function tampil(n) {
    label.textContent = ' · 👁 ' + (Number(n) || 0).toLocaleString('id-ID') + ' kali ditonton';
    label.hidden = false;
  }
  (function baca(coba) {
    var d = sambung();
    if (!d) { if (coba < 20) setTimeout(function () { baca(coba + 1); }, 500); return; }
    onValue(ref(d, JALUR), function (s) { tampil(s.val()); }, function () {});
  })(0);
  // Satu hitungan per pemutaran: putar pertama sesudah halaman dibuka dan tiap putar ulang sesudah
  // video selesai. Jeda lalu lanjut, lompat bab, dan menggeser waktu tidak dihitung lagi.
  var sedangTayang = false;
  video.addEventListener('play', function () {
    if (sedangTayang) return;
    sedangTayang = true;
    var d = sambung();
    if (d) runTransaction(ref(d, JALUR), function (n) { return (Number(n) || 0) + 1; }).catch(function () {});
  });
  video.addEventListener('ended', function () { sedangTayang = false; });
})();`;
}

export function tayang(v) {
  return `<script type="module" id="video-simulasi-tayang">
// VIDEO-SIMULASI:TAYANG v1 — dipasang scripts/video-simulasi.mjs
${hitung(v, `import { getApp } from "${FIREBASE}/firebase-app.js";`, "getApp()")}
</script>
`;
}

export function configFirebase(html) {
  const m = /\nconst firebaseConfig = (\{[^}]*\});\n/.exec(html);
  if (!m) throw new Error("firebaseConfig tidak ditemukan di halaman modul");
  return m[1];
}

export function halamanTonton(v, config) {
  const url = `${SITUS}/${KURSUS}/Video/${v.halaman}`;
  const judul = `Video Simulasi Modul ${v.modul} — ${v.judul} | Teknik Tenaga Listrik`;
  const desk = `Video penjelasan simulasi Teknik Tenaga Listrik Modul ${v.modul}. ${v.ringkas}`;
  return `<!DOCTYPE html>
<!-- VIDEO-SIMULASI:TONTON v1 — ditulis scripts/video-simulasi.mjs; jangan disunting manual -->
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${judul}</title>
<meta name="description" content="${desk}">
<meta name="theme-color" content="#070b16">
<meta property="og:type" content="video.other">
<meta property="og:title" content="Video Simulasi TTL Modul ${v.modul}: ${v.judul}">
<meta property="og:description" content="${v.ringkas} Tonton langsung tanpa login.">
<meta property="og:image" content="${SITUS}/${KURSUS}/Video/${v.poster}">
<meta property="og:url" content="${url}">
<style>
:root{--bg:#070b16;--surface:#080f1e;--border:#243653;--cyan:#67e8f9;--muted:#aebbd0;--teks:#e6edf7}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--teks);font-family:"Source Sans 3",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.55}
main{max-width:1080px;margin:0 auto;padding:28px 16px 40px}
.kicker{margin:0 0 6px;font-size:.75rem;font-weight:700;letter-spacing:.12em;color:var(--cyan)}
h1{margin:0 0 8px;font-size:clamp(1.4rem,3.6vw,2.1rem);line-height:1.2}
.ringkas{margin:0;color:var(--muted)}
.lanjut{margin:18px 0 0;font-size:.9rem;color:var(--muted)}
.lanjut a{color:var(--cyan)}
footer{margin-top:28px;font-size:.78rem;color:var(--muted)}
${ATURAN}
</style>
</head>
<body>
<main>
  <p class="kicker">TEKNIK TENAGA LISTRIK · MODUL ${v.modul} · PENJELASAN SIMULASI</p>
  <h1>${v.judul}</h1>
  <p class="ringkas">${v.ringkas}</p>
${kartu(v, "", "  ", catatanTonton(v))}
  <p class="lanjut">Mahasiswa: <a href="../Modul/Modul-${v.modul}.html#m-animasi">buka Modul ${v.modul}</a> untuk mencoba animasinya dan mengerjakan tugas.</p>
  <footer>Dedik Romahadi · Teknik Mesin, Universitas Mercu Buana</footer>
</main>
${BAGIKAN}
<script type="module" id="video-simulasi-tayang">
// VIDEO-SIMULASI:TAYANG v1 — halaman tonton publik
${hitung(v, `import { initializeApp } from "${FIREBASE}/firebase-app.js";`, `initializeApp(${config})`)}
</script>
</body>
</html>
`;
}

const RX_BLOK = /[ \t]*<!-- VIDEO-SIMULASI:BLOK BEGIN v\d+ -->[\s\S]*?<!-- VIDEO-SIMULASI:BLOK END v\d+ -->\n/;
const RX_CSS = /<style id="video-simulasi-style">[\s\S]*?<\/style>\n?/;
const RX_TAYANG = /<script type="module" id="video-simulasi-tayang">[\s\S]*?<\/script>\n/;

export function pasang(html, v) {
  let out = html;
  out = RX_CSS.test(out) ? out.replace(RX_CSS, () => CSS + "\n") : out.replace("</head>", () => CSS + "\n</head>");
  if (RX_TAYANG.test(out)) out = out.replace(RX_TAYANG, () => tayang(v));
  else {
    const b = out.lastIndexOf("</body>");
    if (b < 0) throw new Error(`modul ${v.modul}: </body> tidak ditemukan`);
    out = out.slice(0, b) + tayang(v) + out.slice(b);
  }
  if (RX_BLOK.test(out)) return out.replace(RX_BLOK, () => blok(v));
  const i = out.indexOf('id="m-animasi"');
  if (i < 0) throw new Error(`modul ${v.modul}: #m-animasi tidak ditemukan`);
  const j = out.indexOf('<div class="anim-panel', i);
  const k = out.indexOf('<div class="section" id="', i + 1);
  if (j < 0 || (k >= 0 && j > k)) throw new Error(`modul ${v.modul}: panel animasi di #m-animasi tidak ditemukan`);
  const awalBaris = out.lastIndexOf("\n", j) + 1;
  return out.slice(0, awalBaris) + blok(v) + out.slice(awalBaris);
}

// Modul bervideo materi: buang kartu, CSS, dan penghitung tayang video simulasi dari halaman modul.
export function lepas(html) {
  return html.replace(RX_BLOK, "").replace(RX_CSS, "").replace(RX_TAYANG, "");
}

export const halamanLama = (modul) => `Modul-${modul}-Simulasi.html`;

// Pengganti halaman tonton simulasi lama: tautan yang sudah dibagikan tetap jalan, menuju video materi.
export function halamanPindah(m) {
  const tujuan = m.halaman;
  return `<!DOCTYPE html>
<!-- VIDEO-SIMULASI:PINDAH v1 — ditulis scripts/video-simulasi.mjs; jangan disunting manual -->
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Video Materi Modul ${m.modul} — ${m.judul} | Teknik Tenaga Listrik</title>
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${tujuan}">
<link rel="canonical" href="${SITUS}/${KURSUS}/Video/${tujuan}">
<style>body{margin:0;background:#070b16;color:#e6edf7;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.55}main{max-width:640px;margin:0 auto;padding:40px 16px}a{color:#67e8f9}</style>
</head>
<body>
<main>
  <p>Video simulasi Modul ${m.modul} sekarang menjadi bagian dari video penjelasan materi Modul ${m.modul} (Bagian 07–08).</p>
  <p><a href="${tujuan}">Buka video materi Modul ${m.modul}</a></p>
</main>
<script>location.replace(${JSON.stringify(tujuan)});</script>
</body>
</html>
`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let berubah = 0;
  const tulis = (berkas, baru) => {
    const lama = fs.existsSync(berkas) ? fs.readFileSync(berkas, "utf8") : null;
    const beda = baru !== lama;
    console.log(`${path.relative(root, berkas)}: ${beda ? (periksa ? "perlu dipasang" : "dipasang") : "sudah terpasang"}`);
    if (beda) {
      berubah += 1;
      if (!periksa) fs.writeFileSync(berkas, baru);
    }
  };
  for (const v of VIDEO_SIMULASI) {
    for (const f of [v.berkas, v.poster]) {
      const p = path.join(root, KURSUS, "Video", f);
      if (!fs.existsSync(p) || fs.statSync(p).size < 1024) throw new Error(`berkas tidak ada/kosong: ${path.relative(root, p)}`);
    }
    const halaman = path.join(root, KURSUS, "Modul", `Modul-${v.modul}.html`);
    const html = fs.readFileSync(halaman, "utf8");
    tulis(halaman, pasang(html, v));
    tulis(path.join(root, KURSUS, "Video", v.halaman), halamanTonton(v, configFirebase(html)));
  }
  for (const m of VIDEO_MATERI) {
    if (VIDEO_SIMULASI.some((v) => v.modul === m.modul)) throw new Error(`modul ${m.modul} punya video materi; hapus entrinya dari VIDEO_SIMULASI`);
    const halaman = path.join(root, KURSUS, "Modul", `Modul-${m.modul}.html`);
    tulis(halaman, lepas(fs.readFileSync(halaman, "utf8")));
    tulis(path.join(root, KURSUS, "Video", halamanLama(m.modul)), halamanPindah(m));
  }
  console.log(`${berubah} berkas ${periksa ? "perlu diubah" : "diubah"}`);
}
