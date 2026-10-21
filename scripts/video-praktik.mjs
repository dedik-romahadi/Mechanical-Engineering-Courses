/**
 * Rekaman layar Praktik Terbimbing — memasang pemutar video di Bagian 09 (m-praktik) halaman modul CAD.
 *
 * PERMINTAAN DOSEN (16 Oktober 2026). Tiap modul CAD diberi rekaman layar FreeCAD (hanya jendela
 * FreeCAD, caption teks tanpa suara) seperti video T2 Modul 5, diputar langsung di halaman. Percobaan
 * di Modul 5 (Braket L) lebih dulu; modul lain menyusul setelah dosen menyetujui hasil percobaan.
 *
 * YANG DIPASANG (bertanda, idempoten; jalan kedua melaporkan 0 halaman berubah):
 *   VIDEO-PRAKTIK:CSS    <style id="video-praktik-style"> di <head>
 *   VIDEO-PRAKTIK:BLOK   kartu pemutar <video controls preload="none" poster> + tombol bab (lompat
 *                        ke langkah 1..7) tepat sebelum kartu langkah di #m-praktik, sesudah Gambar 7
 *   VIDEO-PRAKTIK:TAYANG <script type="module" id="video-praktik-tayang"> sebelum </body> (20 Okt 2026,
 *                        permintaan dosen): jumlah tayang di kepala kartu ("· 👁 N kali ditonton"),
 *                        dibaca langsung (onValue) dari RTDB tayang/pemodelan_cad/modul-<N>; tiap
 *                        pemutaran menambah 1 lewat runTransaction (putar pertama sesudah halaman dibuka
 *                        dan tiap putar ulang sesudah video selesai; jeda lalu lanjut tidak dihitung).
 *                        Siapa pun boleh menambah (tanpa login); aturan RTDB hanya menerima +1
 *                        (backend database.rules.json, scripts/verify-tayang-video.js).
 * Video bernarasi (21 Okt 2026, pilot Modul 1; `narasi: true` di data): klip FreeCAD yang sama, gambar ditahan
 * sampai narasi Edge TTS id-ID-ArdiNeural tiap caption selesai; catatan panel menyebut narasi suara.
 * Berkas video dan poster: Pemodelan-Computer-Aided-Design/Video/ (lihat video-praktik-data.mjs).
 * Tanpa pustaka, tanpa host luar; skrip bab hanya mengatur currentTime.
 *
 * Regenerasi modul (bangun.py N) membuang blok ini: jalankan ulang skrip ini sesudah bangun.py.
 *
 * Pakai:
 *   node scripts/video-praktik.mjs            # terapkan
 *   node scripts/video-praktik.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { KURSUS, VIDEO_PRAKTIK } from "./video-praktik-data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

const CSS_AWAL = "/* VIDEO-PRAKTIK:CSS v1 — dipasang scripts/video-praktik.mjs */";
export const CSS = `<style id="video-praktik-style">${CSS_AWAL}
.video-praktik{margin:22px 0 26px;border:1px solid var(--border,#243653);border-radius:14px;background:var(--surface,#080f1e);overflow:hidden}
.video-praktik .vp-kepala{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;padding:14px 18px 10px}
.video-praktik .vp-ikon{font-size:1.25rem;line-height:1}
.video-praktik .vp-judul{font-weight:800;font-size:1rem;color:var(--cyan,#67e8f9)}
.video-praktik .vp-meta{margin-left:auto;font-size:.78rem;color:var(--muted,#aebbd0)}
.video-praktik .vp-tayang{white-space:nowrap}
.video-praktik video{display:block;width:100%;height:auto;aspect-ratio:16/9;background:#000}
.video-praktik .vp-bab{display:flex;flex-wrap:wrap;gap:8px;padding:12px 18px 6px}
.video-praktik .vp-bab button{font:inherit;font-size:.78rem;font-weight:700;padding:6px 12px;border-radius:999px;cursor:pointer;color:var(--cyan,#67e8f9);background:transparent;border:1px solid var(--border,#243653)}
.video-praktik .vp-bab button:hover,.video-praktik .vp-bab button:focus-visible{background:rgba(103,232,249,.12);border-color:var(--cyan,#67e8f9);outline:none}
.video-praktik .vp-cat{margin:0;padding:6px 18px 14px;font-size:.8rem;line-height:1.5;color:var(--muted,#aebbd0)}
@media (max-width:600px){.video-praktik .vp-meta{margin-left:0;width:100%}.video-praktik .vp-kepala{padding:12px 14px 8px}.video-praktik .vp-bab{padding:10px 14px 4px}.video-praktik .vp-cat{padding:6px 14px 12px}}
</style>`;

const fmt = (d) => `${Math.floor(d / 60)}:${String(Math.floor(d % 60)).padStart(2, "0")}`;

export function blok(v) {
  const id = `vp-m${v.modul}`;
  const tombol = v.bab
    .map(([label, t]) => `<button type="button" data-t="${t}" onclick="var v=document.getElementById('${id}');v.currentTime=${t};v.play()" aria-label="Lompat ke langkah ${label} (${fmt(t)})">${label} <span aria-hidden="true">· ${fmt(t)}</span></button>`)
    .join("\n      ");
  return `  <!-- VIDEO-PRAKTIK:BLOK BEGIN v1 -->
  <div class="video-praktik reveal" id="video-praktik">
    <div class="vp-kepala"><span class="vp-ikon" aria-hidden="true">🎬</span><span class="vp-judul">Rekaman layar: ${v.judul}</span><span class="vp-meta">FreeCAD · ${v.durasi}<span class="vp-tayang" data-tayang="modul-${v.modul}" hidden></span></span></div>
    <video id="${id}" controls preload="none" playsinline poster="../Video/${v.poster}" aria-label="Rekaman layar FreeCAD: praktik terbimbing ${v.judul}">
      <source src="../Video/${v.berkas}" type="video/mp4">
      Peramban Anda tidak mendukung pemutar video. Ikuti tujuh langkah tertulis di bawah.
    </video>
    <div class="vp-bab" role="group" aria-label="Lompat ke langkah">
      ${tombol}
    </div>
    <p class="vp-cat">Video memperlihatkan jendela FreeCAD saja dan mengikuti tujuh langkah di bawah dengan angka yang sama. ${v.narasi ? "Penjelasan berupa narasi suara dan caption teks; musik latar mengecil saat narasi berbicara." : "Penjelasan berupa caption teks; musik latar hanya penghias (bisa dimatikan lewat tombol volume)."} Tekan spasi untuk menjeda video bila perlu mengetik angkanya.</p>
  </div>
<!-- VIDEO-PRAKTIK:BLOK END v1 -->
`;
}

const RX_BLOK = /[ \t]*<!-- VIDEO-PRAKTIK:BLOK BEGIN v\d+ -->[\s\S]*?<!-- VIDEO-PRAKTIK:BLOK END v\d+ -->\n/;
const RX_CSS = /<style id="video-praktik-style">[\s\S]*?<\/style>\n?/;
const RX_TAYANG = /<script type="module" id="video-praktik-tayang">[\s\S]*?<\/script>\n/;

// Penghitung tayang: skrip modul terpisah di akhir <body>, sesudah skrip modul utama yang memanggil
// initializeApp (getApp() sudah tersedia); blok video sendiri tetap tanpa host luar.
export function tayang(v) {
  return `<script type="module" id="video-praktik-tayang">
// VIDEO-PRAKTIK:TAYANG v1 — dipasang scripts/video-praktik.mjs
import { getApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";
(function () {
  var video = document.getElementById('vp-m${v.modul}');
  var label = document.querySelector('.video-praktik [data-tayang="modul-${v.modul}"]');
  if (!video || !label) return;
  var JALUR = 'tayang/pemodelan_cad/modul-${v.modul}';
  var db = null;
  function sambung() {
    if (!db) { try { db = getDatabase(getApp()); } catch (e) { db = null; } }
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
})();
</script>
`;
}

export function pasang(html, v) {
  let out = html;
  // CSS sekali di <head>
  out = RX_CSS.test(out) ? out.replace(RX_CSS, () => CSS + "\n") : out.replace("</head>", () => CSS + "\n</head>");
  // penghitung tayang: ganti yang ada, atau sisipkan tepat sebelum </body> terakhir
  if (RX_TAYANG.test(out)) out = out.replace(RX_TAYANG, () => tayang(v));
  else {
    const b = out.lastIndexOf("</body>");
    if (b < 0) throw new Error(`modul ${v.modul}: </body> tidak ditemukan`);
    out = out.slice(0, b) + tayang(v) + out.slice(b);
  }
  // blok: ganti yang ada, atau sisipkan sebelum kartu langkah pertama di #m-praktik
  if (RX_BLOK.test(out)) return out.replace(RX_BLOK, () => blok(v));
  const i = out.indexOf('id="m-praktik"');
  if (i < 0) throw new Error(`modul ${v.modul}: #m-praktik tidak ditemukan`);
  const j = out.indexOf('<div class="cards reveal">', i);
  const k = out.indexOf('id="m-pustaka"', i);
  if (j < 0 || (k >= 0 && j > k)) throw new Error(`modul ${v.modul}: kartu langkah di #m-praktik tidak ditemukan`);
  const awalBaris = out.lastIndexOf("\n", j) + 1; // blok mulai di awal baris kartu langkah; indentasi kartu tetap milik kartu
  return out.slice(0, awalBaris) + blok(v) + out.slice(awalBaris);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let berubah = 0;
  for (const v of VIDEO_PRAKTIK) {
    for (const f of [v.berkas, v.poster]) {
      const p = path.join(root, KURSUS, "Video", f);
      if (!fs.existsSync(p) || fs.statSync(p).size < 1024) throw new Error(`berkas tidak ada/kosong: ${path.relative(root, p)}`);
    }
    const halaman = path.join(root, KURSUS, "Modul", `Modul-${v.modul}.html`);
    const lama = fs.readFileSync(halaman, "utf8");
    const baru = pasang(lama, v);
    const beda = baru !== lama;
    console.log(`${path.relative(root, halaman)}: ${beda ? (periksa ? "perlu dipasang" : "dipasang") : "sudah terpasang"}`);
    if (beda) {
      berubah += 1;
      if (!periksa) fs.writeFileSync(halaman, baru);
    }
  }
  console.log(`${berubah} halaman ${periksa ? "perlu diubah" : "diubah"}`);
}
