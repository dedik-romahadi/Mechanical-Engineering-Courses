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
 *                      sesudah blok hitung mundur dan sebelum komentar/garis pembuka Bagian 01
 * Belum ada penghitung tayang: aturan RTDB (backend database.rules.json) hanya menerima kunci
 * tayang/<course>/modul-<N>, yang dipakai video simulasi.
 * Modul yang punya video materi tidak lagi memakai video simulasi (dosen, 24 Oktober 2026): Bagian 07–08 sudah
 * ada di video ini. Pelepasan kartu simulasinya dan halaman pengalih tautan lamanya ditangani
 * scripts/video-simulasi.mjs; jalankan skrip itu sesudah menambah modul di video-materi-data.mjs.
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
import { KURSUS, SITUS, VIDEO_MATERI } from "./video-materi-data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

const CSS_AWAL = "/* VIDEO-MATERI:CSS v1 — dipasang scripts/video-materi.mjs */";
const ATURAN = `.video-materi-luar{padding:40px 32px 0}
.video-materi{max-width:1100px;margin:0 auto;border:1px solid var(--border,#243653);border-radius:18px;background:var(--surface,#080f1e);overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.35)}
.video-materi .vm-kepala{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;padding:16px 20px 12px}
.video-materi .vm-ikon{font-size:1.3rem;line-height:1}
.video-materi .vm-judul{font-weight:800;font-size:1.05rem;color:var(--cyan,#67e8f9)}
.video-materi .vm-meta{margin-left:auto;font-size:.78rem;color:var(--muted,#aebbd0)}
.video-materi video{display:block;width:100%;height:auto;aspect-ratio:16/9;background:#000}
.video-materi .vm-bab{display:flex;flex-wrap:wrap;gap:8px;padding:12px 20px 6px}
.video-materi .vm-bab button,.video-materi .vm-bagikan{font:inherit;font-size:.78rem;font-weight:700;padding:6px 12px;border-radius:999px;cursor:pointer;color:var(--cyan,#67e8f9);background:transparent;border:1px solid var(--border,#243653)}
.video-materi .vm-bab button:hover,.video-materi .vm-bab button:focus-visible,.video-materi .vm-bagikan:hover,.video-materi .vm-bagikan:focus-visible{background:rgba(103,232,249,.12);border-color:var(--cyan,#67e8f9);outline:none}
.video-materi .vm-aksi{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:6px 20px 4px}
.video-materi .vm-bagikan{color:#0b1220;background:var(--cyan,#67e8f9);border-color:var(--cyan,#67e8f9)}
.video-materi .vm-bagikan:hover,.video-materi .vm-bagikan:focus-visible{color:var(--cyan,#67e8f9)}
.video-materi .vm-pesan{font-size:.78rem;color:var(--muted,#aebbd0)}
.video-materi .vm-cat{margin:0;padding:6px 20px 16px;font-size:.8rem;line-height:1.5;color:var(--muted,#aebbd0)}
@media (max-width:600px){.video-materi-luar{padding:28px 16px 0}.video-materi .vm-meta{margin-left:0;width:100%}.video-materi .vm-kepala{padding:12px 14px 8px}.video-materi .vm-bab,.video-materi .vm-aksi{padding-left:14px;padding-right:14px}.video-materi .vm-cat{padding:6px 14px 12px}}`;
export const CSS = `<style id="video-materi-style">${CSS_AWAL}
${ATURAN}
</style>`;

const fmt = (d) => `${Math.floor(d / 60)}:${String(Math.floor(d % 60)).padStart(2, "0")}`;

// Kartu pemutar, dipakai halaman modul (dasar "../Video/") dan halaman tonton (dasar "").
function kartu(v, dasar, indent, catatan) {
  const id = `vm-m${v.modul}`;
  const tombol = v.bab
    .map(([label, t]) => `<button type="button" data-t="${t}" onclick="var v=document.getElementById('${id}');v.currentTime=${t};v.play()" aria-label="Lompat ke ${label} (${fmt(t)})">${label} <span aria-hidden="true">· ${fmt(t)}</span></button>`)
    .join(`\n${indent}    `);
  return `${indent}<div class="video-materi reveal" id="video-materi">
${indent}  <div class="vm-kepala"><span class="vm-ikon" aria-hidden="true">🎓</span><span class="vm-judul">Video penjelasan materi: ${v.judul}</span><span class="vm-meta">TTL Modul ${v.modul} · Bagian 01–${v.bagianAkhir} · ${v.durasi}</span></div>
${indent}  <video id="${id}" controls preload="none" playsinline poster="${dasar}${v.poster}" aria-label="Video penjelasan materi Modul ${v.modul}: ${v.judul}">
${indent}    <source src="${dasar}${v.berkas}" type="video/mp4">
${indent}    Peramban Anda tidak mendukung pemutar video.
${indent}  </video>
${indent}  <div class="vm-bab" role="group" aria-label="Lompat ke bagian">
${indent}    ${tombol}
${indent}  </div>
${indent}  <div class="vm-aksi"><button type="button" class="vm-bagikan" data-tonton="${dasar}${v.halaman}" data-judul="Video materi TTL Modul ${v.modul}: ${v.judul}" onclick="window._vmBagikan&&window._vmBagikan(this)">🔗 Bagikan video</button><span class="vm-pesan" role="status" aria-live="polite"></span></div>
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

const catatanModul = (v) => `Video ini menjelaskan seluruh materi modul ini, dari Bagian 01 sampai Bagian ${v.bagianAkhir}, dengan narasi suara dan caption: konsep, gambar, rumus beserta contoh angkanya, tabel, lalu animasi dan cell Python. Tonton dulu, lalu pelajari tiap bagian di bawah dan centang bila sudah paham. Tombol Bagikan menyalin tautan halaman tonton; penerima bisa langsung menonton tanpa login.`;
const catatanTonton = (v) => `Video ini menjelaskan seluruh materi Modul ${v.modul} Teknik Tenaga Listrik, dari Bagian 01 sampai Bagian ${v.bagianAkhir}, dengan narasi suara dan caption. Untuk mencoba animasinya dan mengerjakan tugas, buka modulnya (mahasiswa login dengan NIM dan PIN).`;

export function blok(v) {
  return `<!-- VIDEO-MATERI:BLOK BEGIN v1 -->
<div class="video-materi-luar">
${kartu(v, "../Video/", "  ", catatanModul(v))}
</div>
${BAGIKAN}
<!-- VIDEO-MATERI:BLOK END v1 -->
`;
}

export function halamanTonton(v) {
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
</body>
</html>
`;
}

const RX_BLOK = /<!-- VIDEO-MATERI:BLOK BEGIN v\d+ -->[\s\S]*?<!-- VIDEO-MATERI:BLOK END v\d+ -->\n/;
const RX_CSS = /<style id="video-materi-style">[\s\S]*?<\/style>\n?/;

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
  if (RX_BLOK.test(out)) return out.replace(RX_BLOK, () => blok(v));
  const i = titikSisip(out, v.modul);
  return out.slice(0, i) + blok(v) + out.slice(i);
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
    for (const f of [v.berkas, v.poster]) {
      const p = path.join(root, KURSUS, "Video", f);
      if (!fs.existsSync(p) || fs.statSync(p).size < 1024) throw new Error(`berkas tidak ada/kosong: ${path.relative(root, p)}`);
    }
    const halaman = path.join(root, KURSUS, "Modul", `Modul-${v.modul}.html`);
    tulis(halaman, pasang(fs.readFileSync(halaman, "utf8"), v));
    tulis(path.join(root, KURSUS, "Video", v.halaman), halamanTonton(v));
  }
  console.log(`${berubah} berkas ${periksa ? "perlu diubah" : "diubah"}`);
}
