/**
 * Video penjelasan materi — memasang panel video sendiri di halaman modul TTL, di antara panel hitung mundur
 * (<!-- COUNTDOWN -->) dan Bagian 01, serta menulis halaman tonton publik (tanpa login) untuk tombol Bagikan.
 *
 * PERMINTAAN DOSEN (24 Oktober 2026). Selain video penjelasan simulasi di Bagian 07 (scripts/video-simulasi.mjs),
 * tiap modul TTL diberi video yang menjelaskan SELURUH materi, dari Bagian 01 sampai selesai, dengan bahasa yang
 * mudah dipahami mahasiswa (rekaman halaman modul + narasi suara + caption). Percobaan di Modul 6; dosen meminta
 * video itu diletakkan di panel sendiri, di antara panel hitung mundur dan panel Bagian 01.
 *
 * YANG DIPASANG DI HALAMAN MODUL (bertanda, idempoten; jalan kedua melaporkan 0 berkas berubah):
 *   VIDEO-MATERI:CSS   <style id="video-materi-style"> di <head>
 *   VIDEO-MATERI:BLOK  panel pemutar <video controls preload="none" poster> + tombol bab + tombol Bagikan,
 *                      sesudah blok hitung mundur dan sebelum komentar/garis pembuka Bagian 01; memuat juga
 *                      pelacak tontonan (VIDEO-MATERI:TONTON, skrip klasik) — lihat WAJIB MENONTON
 *   VIDEO-MATERI:TAYANG <script type="module" id="video-materi-tayang"> sebelum </body>: jumlah tayang dari RTDB
 *                      tayang/teknik_tenaga_listrik/modul-<N> (onValue), +1 per pemutaran lewat runTransaction,
 *                      sama dengan video simulasi (scripts/video-simulasi.mjs).
 *   VIDEO-MATERI:SIMPAN <script type="module" id="video-materi-simpan"> sebelum </body>: tontonan disimpan di server
 *                      (callable saveModulTonton) dan dipulihkan dari getModulProgress — lihat WAJIB MENONTON.
 * Modul yang punya video materi tidak lagi memakai video simulasi (dosen, 24 Oktober 2026): Bagian 07–08 sudah
 * ada di video ini. Pelepasan kartu simulasinya dan halaman pengalih tautan lamanya ditangani
 * scripts/video-simulasi.mjs; jalankan skrip itu sesudah menambah modul di video-materi-data.mjs. Karena itu
 * kunci tayang/<course>/modul-<N> (satu-satunya bentuk yang diterima aturan RTDB backend) kini milik video
 * materi; hitungan Modul 6 meneruskan 2 tayangan video simulasinya.
 *
 * WAJIB MENONTON (dosen, 24 Oktober 2026: "jika mahasiswa tidak menonton video maka kotak centang berikutnya
 * tidak aktif"). Kotak centang berikutnya = kotak Bagian 01 (indeks 0; panel ini tepat sebelum Bagian 01).
 * Pelacak menandai tiap detik video yang benar-benar diputar (lompatan/geser waktu tidak dihitung; kecepatan
 * putar bebas) dan menyimpannya di localStorage per NIM + MODUL_ID. Selama kurang dari AMBANG (90%) detik
 * video tertonton, window._pmSyarat[0] mengembalikan alasan, sehingga runtime PROGRES-MODUL
 * (scripts/tambah-progres-modul.mjs butir 9) menahan kotak itu. Mahasiswa yang sudah mencentang Bagian 01
 * tidak terpengaruh.
 * DISIMPAN DI SERVER (dosen, 24 Oktober 2026: "Buat menonton video disimpan di server"). Petanya (bitset base64,
 * bit i = detik ke-i, bit rendah lebih dulu) dikirim ke callable saveModulTonton (backend VIDEO_MATERI_WAJIB,
 * `detik` = detikVideo(), `ambang` = AMBANG — dicocokkan verify-tonton-materi.js backend) saat video dijeda/selesai,
 * tiap 15 detik selama diputar, dan saat halaman ditutup; peta server dari getModulProgress (event
 * 'progres-modul:diterapkan') digabung ke peta lokal, jadi tontonan terbawa ke perangkat lain. Server menolak
 * centang Bagian 01 (setModulCentang) sampai tontonan TERSIMPAN mencapai ambang, dan membatasi laju (detik
 * tersimpan ≤ 2,5 × waktu sejak simpanan pertama + 60 detik); kiriman yang dibatasi diulang 60 detik kemudian.
 * Menambah video materi = entri VIDEO_MATERI_WAJIB backend + deploy functions SEBELUM halaman ini dipasang.
 * HALAMAN TONTON: <KURSUS>/Video/<halaman> ditulis utuh oleh skrip ini (jangan disunting manual).
 *
 * Regenerasi modul (scripts/ttl-modul/bangun.py N) membuang blok ini: jalankan ulang skrip ini sesudahnya.
 *
 * Pakai:
 *   node scripts/video-materi.mjs            # terapkan
 *   node scripts/video-materi.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { KURSUS, COURSE_ID, SITUS, repoVideo, dasarVideo, VIDEO_MATERI } from "./video-materi-data.mjs";
import { configFirebase } from "./video-simulasi.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");
const FIREBASE = "https://www.gstatic.com/firebasejs/12.11.0";
// Video dianggap ditonton bila sekurang-kurangnya AMBANG dari detik videonya benar-benar diputar.
export const AMBANG = 0.9;

const CSS_AWAL = "/* VIDEO-MATERI:CSS v2 — dipasang scripts/video-materi.mjs */";
const ATURAN = `.video-materi-luar{padding:40px 32px 0}
.video-materi{max-width:1100px;margin:0 auto;border:1px solid var(--border,#243653);border-radius:18px;background:var(--surface,#080f1e);overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.35)}
.video-materi .vm-kepala{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;padding:16px 20px 12px}
.video-materi .vm-ikon{font-size:1.3rem;line-height:1}
.video-materi .vm-judul{font-weight:800;font-size:1.05rem;color:var(--cyan,#67e8f9)}
.video-materi .vm-meta{margin-left:auto;font-size:.78rem;color:var(--muted,#aebbd0)}
.video-materi .vm-tayang{white-space:nowrap}
.video-materi video{display:block;width:100%;height:auto;aspect-ratio:16/9;background:#000}
.video-materi .vm-bab{display:flex;flex-wrap:wrap;gap:8px;padding:12px 20px 6px}
.video-materi .vm-bab button,.video-materi .vm-bagikan{font:inherit;font-size:.78rem;font-weight:700;padding:6px 12px;border-radius:999px;cursor:pointer;color:var(--cyan,#67e8f9);background:transparent;border:1px solid var(--border,#243653)}
.video-materi .vm-bab button:hover,.video-materi .vm-bab button:focus-visible,.video-materi .vm-bagikan:hover,.video-materi .vm-bagikan:focus-visible{background:rgba(103,232,249,.12);border-color:var(--cyan,#67e8f9);outline:none}
.video-materi .vm-aksi{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:6px 20px 4px}
.video-materi .vm-bagikan{color:#0b1220;background:var(--cyan,#67e8f9);border-color:var(--cyan,#67e8f9)}
.video-materi .vm-bagikan:hover,.video-materi .vm-bagikan:focus-visible{color:var(--cyan,#67e8f9)}
.video-materi .vm-pesan{font-size:.78rem;color:var(--muted,#aebbd0)}
.video-materi .vm-cat{margin:0;padding:6px 20px 16px;font-size:.8rem;line-height:1.5;color:var(--muted,#aebbd0)}
.video-materi .vm-progres{margin:4px 20px 0;padding:8px 12px;border-radius:10px;font-size:.82rem;line-height:1.5;color:#fde68a;background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.35)}
.video-materi .vm-progres.vm-tuntas{color:#9ff3d2;background:rgba(0,224,158,.1);border-color:rgba(0,224,158,.4)}
@media (max-width:600px){.video-materi-luar{padding:28px 16px 0}.video-materi .vm-meta{margin-left:0;width:100%}.video-materi .vm-kepala{padding:12px 14px 8px}.video-materi .vm-bab,.video-materi .vm-aksi{padding-left:14px;padding-right:14px}.video-materi .vm-cat{padding:6px 14px 12px}.video-materi .vm-progres{margin:4px 14px 0}}`;
export const CSS = `<style id="video-materi-style">${CSS_AWAL}
${ATURAN}
</style>`;

const fmt = (d) => `${Math.floor(d / 60)}:${String(Math.floor(d % 60)).padStart(2, "0")}`;

// Kartu pemutar, dipakai halaman modul (dasar "../Video/", dengan baris progres menonton) dan halaman tonton
// (dasar ""). `dasar` untuk poster dan halaman tonton; MP4 selalu dari repo video (dasarVideo(v), domain sama).
function kartu(v, dasar, indent, catatan, progres = false) {
  const id = `vm-m${v.modul}`;
  const tombol = v.bab
    .map(([label, t]) => `<button type="button" data-t="${t}" onclick="var v=document.getElementById('${id}');v.currentTime=${t};v.play()" aria-label="Lompat ke ${label} (${fmt(t)})">${label} <span aria-hidden="true">· ${fmt(t)}</span></button>`)
    .join(`\n${indent}    `);
  return `${indent}<div class="video-materi reveal" id="video-materi">
${indent}  <div class="vm-kepala"><span class="vm-ikon" aria-hidden="true">🎓</span><span class="vm-judul">Video penjelasan materi: ${v.judul}</span><span class="vm-meta">TTL Modul ${v.modul} · Bagian 01–${v.bagianAkhir} · ${v.durasi}<span class="vm-tayang" data-tayang="modul-${v.modul}" hidden></span></span></div>
${indent}  <video id="${id}" controls preload="none" playsinline poster="${dasar}${v.poster}" aria-label="Video penjelasan materi Modul ${v.modul}: ${v.judul}">
${indent}    <source src="${dasarVideo(v)}${v.berkas}" type="video/mp4">
${indent}    Peramban Anda tidak mendukung pemutar video.
${indent}  </video>
${indent}  <div class="vm-bab" role="group" aria-label="Lompat ke bagian">
${indent}    ${tombol}
${indent}  </div>
${progres ? `${indent}  <p class="vm-progres" id="vm-progres-m${v.modul}" role="status" aria-live="polite" hidden></p>\n` : ""}${indent}  <div class="vm-aksi"><button type="button" class="vm-bagikan" data-tonton="${dasar}${v.halaman}" data-judul="Video materi TTL Modul ${v.modul}: ${v.judul}" onclick="window._vmBagikan&&window._vmBagikan(this)">🔗 Bagikan video</button><span class="vm-pesan" role="status" aria-live="polite"></span></div>
${indent}  <p class="vm-cat">${catatan}</p>
${indent}</div>`;
}

// Tombol Bagikan (skrip klasik, tanpa host luar).
const BAGIKAN = `<script id="video-materi-bagikan">
window._vmBagikan = function (btn) {
  var url = new URL(btn.getAttribute('data-tonton'), location.href);
  url.hash = ''; url.search = '';
  var tautan = url.href, judul = btn.getAttribute('data-judul') || document.title;
  var pesan = btn.parentNode.querySelector('.vm-pesan');
  function beri(t) { if (!pesan) return; pesan.textContent = t; clearTimeout(btn._vmT); btn._vmT = setTimeout(function () { pesan.textContent = ''; }, 4000); }
  function manual() { window.prompt('Salin tautan video ini:', tautan); }
  var sentuh = window.matchMedia && window.matchMedia('(pointer:coarse)').matches;
  if (sentuh && navigator.share) { navigator.share({ title: judul, text: judul, url: tautan }).catch(function () {}); return; }
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(tautan).then(function () { beri('✓ Tautan disalin — tempel di WhatsApp atau grup kelas. Penerima bisa langsung menonton tanpa login.'); }, manual);
  } else manual();
};
</script>`;

const catatanModul = (v) => `Video ini menjelaskan seluruh materi modul ini, dari Bagian 01 sampai Bagian ${v.bagianAkhir}, dengan narasi suara dan caption: konsep, gambar, rumus beserta contoh angkanya, tabel, lalu animasi dan cell Python. Tonton dulu, lalu pelajari tiap bagian di bawah dan centang bila sudah paham. Kotak centang Bagian 01 aktif setelah video ini ditonton minimal ${Math.round(AMBANG * 100)}% (bagian yang dilompati tidak dihitung); progres menonton tersimpan di server, jadi bisa dilanjutkan di perangkat lain. Tombol Bagikan menyalin tautan halaman tonton; penerima bisa langsung menonton tanpa login.`;
const catatanTonton = (v) => `Video ini menjelaskan seluruh materi Modul ${v.modul} Teknik Tenaga Listrik, dari Bagian 01 sampai Bagian ${v.bagianAkhir}, dengan narasi suara dan caption. Untuk mencoba animasinya dan mengerjakan tugas, buka modulnya (mahasiswa login dengan NIM dan PIN).`;

// Lama video dalam detik dari `durasi` "m:ss" (+1 untuk pecahan detik terakhir): panjang peta detik tontonan.
export const detikVideo = (v) => { const [m, d] = v.durasi.split(":").map(Number); return m * 60 + d + 1; };

// Pelacak tontonan (skrip klasik, tanpa host luar) + syarat kotak Bagian 01 untuk runtime PROGRES-MODUL +
// antarmuka window._vmTonton untuk penyimpan server (simpanTonton).
function tonton(v) {
  return `<script id="video-materi-tonton">
// VIDEO-MATERI:TONTON v2 — kotak centang Bagian 01 aktif setelah video ini ditonton (scripts/video-materi.mjs)
(function () {
  var video = document.getElementById('vm-m${v.modul}');
  var info = document.getElementById('vm-progres-m${v.modul}');
  if (!video) return;
  var DETIK = ${detikVideo(v)}, AMBANG = ${AMBANG};
  var peta = null, nimPeta = null, terakhir = null, baru = 0, persenTampil = -1;
  function saya() {
    try {
      var me = typeof getIdentityLocal === 'function' ? getIdentityLocal() : null;
      return me && me.role === 'student' && me.nim && !window._previewMode ? String(me.nim) : null;
    } catch (e) { return null; }
  }
  function kunci(nim) { return 'vm_tonton_' + String(window.MODUL_ID || 'modul-${v.modul}') + '_' + nim; }
  // Peta detik tontonan milik NIM yang sedang login: '1' = detik itu sudah diputar.
  function muat() {
    var nim = saya();
    if (peta && nim === nimPeta) return;
    nimPeta = nim; peta = new Uint8Array(DETIK);
    if (!nim) return;
    try {
      var s = localStorage.getItem(kunci(nim)) || '';
      for (var i = 0; i < DETIK && i < s.length; i++) peta[i] = s.charAt(i) === '1' ? 1 : 0;
    } catch (e) {}
  }
  function simpan() { if (!nimPeta || !peta) return; try { localStorage.setItem(kunci(nimPeta), peta.join('')); } catch (e) {} }
  function bagian() { muat(); var n = 0; for (var i = 0; i < DETIK; i++) n += peta[i]; return n / DETIK; }
  function tampil() {
    var nim = saya(), p = bagian(), persen = Math.floor(p * 100), tuntas = p >= AMBANG;
    if (info) {
      var cb = document.querySelector('.pm-centang[data-pm="0"] input');
      info.hidden = !nim || !!(cb && cb.checked && !tuntas);
      info.classList.toggle('vm-tuntas', tuntas);
      info.textContent = tuntas
        ? '✓ Video sudah ditonton (' + persen + '%). Kotak centang Bagian 01 sudah aktif.'
        : '🎬 Progres menonton: ' + persen + '% dari minimal ' + Math.round(AMBANG * 100) + '%. Kotak centang Bagian 01 aktif setelah video ini ditonton; bagian yang dilompati tidak dihitung.';
    }
    if (persen !== persenTampil) {
      persenTampil = persen;
      try { window.dispatchEvent(new Event('progres-modul:syarat')); } catch (e) {}
    }
  }
  window._pmSyarat = window._pmSyarat || {};
  window._pmSyarat[0] = function () {
    var p = bagian();
    return p >= AMBANG ? null : '🎬 tonton video materi dulu · ' + Math.floor(p * 100) + '%';
  };
  // Untuk VIDEO-MATERI:SIMPAN: peta milik NIM yang login (null bila bukan mahasiswa) dan penggabungan peta
  // server (bitset base64, bit i = detik ke-i, bit rendah lebih dulu). Detik tidak pernah dihapus.
  window._vmTonton = {
    detik: DETIK,
    nim: saya,
    peta: function () { muat(); return nimPeta ? peta : null; },
    gabung: function (b64) {
      muat();
      if (!nimPeta || typeof b64 !== 'string') return;
      var s;
      try { s = atob(b64); } catch (e) { return; }
      var n = 0;
      for (var i = 0; i < DETIK && (i >> 3) < s.length; i++) {
        if (((s.charCodeAt(i >> 3) >> (i & 7)) & 1) && !peta[i]) { peta[i] = 1; n++; }
      }
      if (n) { simpan(); tampil(); }
    }
  };
  function tandai(a, b) {
    muat();
    var n = 0;
    for (var i = Math.max(0, Math.floor(a)); i <= Math.min(DETIK - 1, Math.floor(b)); i++) if (!peta[i]) { peta[i] = 1; n++; }
    if (!n) return;
    baru += n;
    if (baru >= 5) { baru = 0; simpan(); }
    tampil();
  }
  // Hanya pemutaran biasa yang dihitung: lompatan lebih dari 3 detik (geser waktu, tombol bab) memutus jejak.
  video.addEventListener('timeupdate', function () {
    var t = video.currentTime;
    if (!video.paused && !video.seeking && terakhir !== null && t >= terakhir && t - terakhir <= 3) tandai(terakhir, t);
    terakhir = video.seeking ? null : t;
  });
  video.addEventListener('seeking', function () { terakhir = null; });
  video.addEventListener('pause', simpan);
  video.addEventListener('ended', simpan);
  window.addEventListener('pagehide', simpan);
  window.addEventListener('progres-modul:diterapkan', tampil);
  tampil();
})();
</script>`;
}

export function blok(v) {
  return `<!-- VIDEO-MATERI:BLOK BEGIN v3 -->
<div class="video-materi-luar">
${kartu(v, "../Video/", "  ", catatanModul(v), true)}
</div>
${BAGIKAN}
${tonton(v)}
<!-- VIDEO-MATERI:BLOK END v3 -->
`;
}

// Penghitung tayang. app = getApp() di halaman modul (skrip modul utama memanggil initializeApp),
// initializeApp(config) di halaman tonton. Pola sama dengan scripts/video-simulasi.mjs.
function hitung(v, impor, app) {
  return `${impor}
import { getDatabase, ref, onValue, runTransaction } from "${FIREBASE}/firebase-database.js";
(function () {
  var video = document.getElementById('vm-m${v.modul}');
  var label = document.querySelector('.video-materi [data-tayang="modul-${v.modul}"]');
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

// Penyimpan tontonan di server: kirim peta lokal ke saveModulTonton bila ada detik yang belum tersimpan, gabungkan
// peta server (respons dan getModulProgress) ke peta lokal. not-found/failed-precondition/invalid-argument
// menghentikan kiriman (backend tanpa callable atau modul tanpa video wajib); galat PIN sesi diurus
// JAWABAN-PRIVAT/PROGRES-MODUL; galat sementara dicoba ulang 5/15/30/60 detik.
export function simpanTonton(v) {
  return `<script type="module" id="video-materi-simpan">
// VIDEO-MATERI:SIMPAN v1 — tontonan video materi disimpan di server; dipasang scripts/video-materi.mjs
import { getApp } from "${FIREBASE}/firebase-app.js";
import { getFunctions, httpsCallable } from "${FIREBASE}/firebase-functions.js";
(function () {
  var video = document.getElementById('vm-m${v.modul}');
  var T = window._vmTonton;
  if (!video || !T) return;
  var fx = null, server = null, nimServer = null, sibuk = false, mati = false, gagal = 0, tunda = null;
  function panggil(nama, data) {
    if (!fx) fx = getFunctions(getApp(), 'asia-southeast1');
    return httpsCallable(fx, nama)(data).then(function (r) { return (r && r.data) || {}; });
  }
  function bit(s, i) { return (i >> 3) < s.length ? (s.charCodeAt(i >> 3) >> (i & 7)) & 1 : 0; }
  // Ada detik yang sudah ditonton di sini tetapi belum tersimpan di server (peta server milik NIM ini)?
  function adaBaru(p) {
    if (nimServer !== T.nim()) { server = null; nimServer = T.nim(); }
    for (var i = 0; i < T.detik; i++) if (p[i] && !(server && bit(server, i))) return true;
    return false;
  }
  function keBase64(p) {
    var b = new Uint8Array(Math.ceil(T.detik / 8)), s = '';
    for (var i = 0; i < T.detik; i++) if (p[i]) b[i >> 3] |= 1 << (i & 7);
    for (var j = 0; j < b.length; j++) s += String.fromCharCode(b[j]);
    return btoa(s);
  }
  function terima(t) {
    if (!t || typeof t.peta !== 'string' || t.detik !== T.detik) return;
    try { server = atob(t.peta); nimServer = T.nim(); } catch (e) { return; }
    T.gabung(t.peta);
  }
  function jadwal(ms) { clearTimeout(tunda); tunda = setTimeout(kirim, ms); }
  function kirim() {
    var nim = T.nim(), h = window._sessionPinHash, p = T.peta();
    if (mati || sibuk || !nim || !h || !p || !adaBaru(p)) return;
    sibuk = true;
    panggil('saveModulTonton', { modulId: window.MODUL_ID, nim: nim, pinHash: h, peta: keBase64(p) }).then(function (r) {
      gagal = 0;
      terima(r);
      if (r.dibatasi) jadwal(60000);   // batas laju server: sisanya diterima setelah waktu berjalan
    }, function (e) {
      var k = String((e && e.code) || '');
      if (k.indexOf('functions/') === 0) k = k.slice(10);
      if (k === 'not-found' || k === 'failed-precondition' || k === 'invalid-argument') { mati = true; return; }
      if (k === 'unauthenticated' || k === 'resource-exhausted') return;
      if (gagal < 4) jadwal([5000, 15000, 30000, 60000][gagal++]);
    }).then(function () { sibuk = false; });
  }
  video.addEventListener('pause', kirim);
  video.addEventListener('ended', kirim);
  setInterval(function () { if (!video.paused) kirim(); }, 15000);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') kirim(); });
  window.addEventListener('pagehide', kirim);
  window.addEventListener('progres-modul:diterapkan', function (ev) {
    var p = ev && ev.detail && ev.detail.progres;
    if (p && p.tontonMateri) terima(p.tontonMateri);
    kirim();
  });
})();
</script>
`;
}

export function tayang(v) {
  return `<script type="module" id="video-materi-tayang">
// VIDEO-MATERI:TAYANG v1 — dipasang scripts/video-materi.mjs
${hitung(v, `import { getApp } from "${FIREBASE}/firebase-app.js";`, "getApp()")}
</script>
`;
}

export function halamanTonton(v, config) {
  const url = `${SITUS}/${KURSUS}/Video/${v.halaman}`;
  const judul = `Video Materi Modul ${v.modul} — ${v.judul} | Teknik Tenaga Listrik`;
  const desk = `Video penjelasan materi Teknik Tenaga Listrik Modul ${v.modul}. ${v.ringkas}`;
  return `<!DOCTYPE html>
<!-- VIDEO-MATERI:TONTON v1 — ditulis scripts/video-materi.mjs; jangan disunting manual -->
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${judul}</title>
<meta name="description" content="${desk}">
<meta name="theme-color" content="#070b16">
<meta property="og:type" content="video.other">
<meta property="og:title" content="Video Materi TTL Modul ${v.modul}: ${v.judul}">
<meta property="og:description" content="${v.ringkas} Tonton langsung tanpa login.">
<meta property="og:image" content="${SITUS}/${KURSUS}/Video/${v.poster}">
<meta property="og:url" content="${url}">
<style>
:root{--bg:#070b16;--surface:#080f1e;--border:#243653;--cyan:#67e8f9;--muted:#aebbd0;--teks:#e6edf7}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--teks);font-family:"Source Sans 3",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.55}
main{max-width:1140px;margin:0 auto;padding:28px 16px 40px}
.kicker{margin:0 0 6px;font-size:.75rem;font-weight:700;letter-spacing:.12em;color:var(--cyan)}
h1{margin:0 0 8px;font-size:clamp(1.4rem,3.6vw,2.1rem);line-height:1.2}
.ringkas{margin:0 0 18px;color:var(--muted)}
.lanjut{margin:18px 0 0;font-size:.9rem;color:var(--muted)}
.lanjut a{color:var(--cyan)}
footer{margin-top:28px;font-size:.78rem;color:var(--muted)}
${ATURAN}
</style>
</head>
<body>
<main>
  <p class="kicker">TEKNIK TENAGA LISTRIK · MODUL ${v.modul} · PENJELASAN MATERI</p>
  <h1>${v.judul}</h1>
  <p class="ringkas">${v.ringkas}</p>
${kartu(v, "", "  ", catatanTonton(v))}
  <p class="lanjut">Mahasiswa: <a href="../Modul/Modul-${v.modul}.html">buka Modul ${v.modul}</a> untuk mempelajari materinya, mencoba animasi, dan mengerjakan tugas.</p>
  <footer>Dedik Romahadi · Teknik Mesin, Universitas Mercu Buana</footer>
</main>
${BAGIKAN}
<script type="module" id="video-materi-tayang">
// VIDEO-MATERI:TAYANG v1 — halaman tonton publik
${hitung(v, `import { initializeApp } from "${FIREBASE}/firebase-app.js";`, `initializeApp(${config})`)}
</script>
</body>
</html>
`;
}

const RX_BLOK = /<!-- VIDEO-MATERI:BLOK BEGIN v\d+ -->[\s\S]*?<!-- VIDEO-MATERI:BLOK END v\d+ -->\n/;
const RX_CSS = /<style id="video-materi-style">[\s\S]*?<\/style>\n?/;
const RX_TAYANG = /<script type="module" id="video-materi-tayang">[\s\S]*?<\/script>\n/;
const RX_SIMPAN = /<script type="module" id="video-materi-simpan">[\s\S]*?<\/script>\n/;

// Titik sisip: awal baris komentar/garis pertama sesudah blok hitung mundur (sebelum Bagian 01).
export function titikSisip(html, modul) {
  const c = html.indexOf("<!-- COUNTDOWN -->");
  if (c < 0) throw new Error(`modul ${modul}: penanda <!-- COUNTDOWN --> tidak ditemukan`);
  const s = html.indexOf('<div class="section" id="m-', c);
  if (s < 0) throw new Error(`modul ${modul}: Bagian 01 tidak ditemukan sesudah hitung mundur`);
  const k = html.lastIndexOf("\n<!-- ═══", s);
  if (k < c) throw new Error(`modul ${modul}: komentar pembuka Bagian 01 tidak ditemukan`);
  return k + 1;
}

export function pasang(html, v) {
  let out = html;
  out = RX_CSS.test(out) ? out.replace(RX_CSS, () => CSS + "\n") : out.replace("</head>", () => CSS + "\n</head>");
  for (const [rx, isi] of [[RX_TAYANG, tayang(v)], [RX_SIMPAN, simpanTonton(v)]]) {
    if (rx.test(out)) { out = out.replace(rx, () => isi); continue; }
    const b = out.lastIndexOf("</body>");
    if (b < 0) throw new Error(`modul ${v.modul}: </body> tidak ditemukan`);
    out = out.slice(0, b) + isi + out.slice(b);
  }
  if (RX_BLOK.test(out)) return out.replace(RX_BLOK, () => blok(v));
  const i = titikSisip(out, v.modul);
  return out.slice(0, i) + blok(v) + out.slice(i);
}

// Salinan lokal repo video `repo` (di folder induk env VIDEO_REPOS_DIR, atau bersebelahan dengan repo ini); null bila
// tidak ada.
export function dirRepoVideo(repo) {
  const calon = [process.env.VIDEO_REPOS_DIR, path.resolve(root, "..")].filter(Boolean).map((d) => path.join(d, repo));
  return calon.find((d) => fs.existsSync(path.join(d, KURSUS))) || null;
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
  for (const v of VIDEO_MATERI) {
    const poster = path.join(root, KURSUS, "Video", v.poster);
    if (!fs.existsSync(poster) || fs.statSync(poster).size < 1024) throw new Error(`poster tidak ada/kosong: ${path.relative(root, poster)}`);
    const dirVideo = dirRepoVideo(repoVideo(v));
    if (!dirVideo) console.log(`peringatan: salinan ${repoVideo(v)} tidak ditemukan (set VIDEO_REPOS_DIR); ukuran ${v.berkas} tidak diperiksa`);
    else {
      const mp4 = path.join(dirVideo, KURSUS, v.berkas);
      if (!fs.existsSync(mp4) || fs.statSync(mp4).size !== v.ukuran) throw new Error(`${repoVideo(v)}/${KURSUS}/${v.berkas} tidak ada atau ukurannya ≠ ${v.ukuran}`);
    }
    const halaman = path.join(root, KURSUS, "Modul", `Modul-${v.modul}.html`);
    const html = fs.readFileSync(halaman, "utf8");
    tulis(halaman, pasang(html, v));
    tulis(path.join(root, KURSUS, "Video", v.halaman), halamanTonton(v, configFirebase(html)));
  }
  console.log(`${berubah} berkas ${periksa ? "perlu diubah" : "diubah"}`);
}
