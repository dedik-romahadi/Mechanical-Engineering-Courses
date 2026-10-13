/**
 * Hasil Keren — ikon bergerak + lima grafik agregat kelas di tab Hasil halaman modul
 * (permintaan dosen 13 Okt 2026; spesifikasi terkoreksi v1).
 *
 * DATA YANG DIPAKAI (semuanya sudah ada di halaman; tidak ada node Firebase baru, tidak ada penulisan):
 *   latestVisitors (sesudah pipa keaktifan + forum), masterStudents (roster), currentSchedule (jadwal
 *   ternormalisasi), _keaktifanKursus, _forumModul, MODULE_ID, _keaktifanTotal(), KEAKTIFAN_BONUS_FRAKSI,
 *   _visitorsDiterima, _auth (gerbang tampilan dosen). Definisi status/Hadir/Absen = tabel Hasil +
 *   blok SAMAKAN-ABSEN-HASIL v2. Nama mahasiswa tidak pernah ditampilkan di grafik.
 *
 * YANG DIPASANG (tiga blok bertanda v1, isi identik di setiap halaman):
 *   HASIL-KEREN:CSS    <style id="hasil-keren-style"> di <head> dokumen. Bila sudah ada, DIGANTI DI TEMPAT
 *                      (tidak dibuang lalu disisip ulang di ujung <head>), jadi penyuntik lain yang menulis
 *                      sebelum </head> tidak berebut urutan; hanya disisip sebelum </head> bila belum ada.
 *   HASIL-KEREN:PANEL  <details id="hkPanel" open hidden> sebagai anak TERAKHIR #leaderboardPanel (aturan
 *                      ponsel #leaderboardPanel>div:first-child tidak kena); dibuka (hidden dilepas) oleh
 *                      skrip hanya sesudah inisialisasi berhasil.
 *   HASIL-KEREN:DATA   tepat sesudah "// FORUM-POIN:DATA END v4" di skrip modul yang sama dengan
 *                      latestVisitors: fungsi murni (HASIL-KEREN:MURNI, diuji sandbox validator) + runtime.
 *                      Keselamatan: seluruh tubuh hkMulai di dalam try/catch, semua callback lewat hkAman,
 *                      ResizeObserver/IntersectionObserver/MutationObserver/matchMedia dideteksi dulu, galat
 *                      -> hkPulihkan() (tampilan asli kembali); sintaks tidak lebih baru dari skrip modul.
 *   Grafik: G1 status (donat), G2 sebaran nilai, G3 progres pengerjaan, G4 ketuntasan per jenis soal
 *   (mahasiswa: sesudah jadwal berakhir dan >= 5 penjawab; rincian per soal hanya dosen), G5 keaktifan
 *   per pertemuan. Animasi masuk hanya saat tab dibuka; pembaruan data hanya menyorot baris yang berubah.
 *   Dua animasi tak berujung (🔥 judul Top Akses, 🥇) dijeda di luar layar; semua mati di
 *   prefers-reduced-motion (juga .ff/.pulse-dot hero tab Hasil).
 *
 * CAKUPAN: percobaan PERCOBAAN (TTL Modul 3). Halaman di luar HALAMAN dicabut bloknya (cabut), jadi
 * mengosongkan HALAMAN = rollback; rollout = HALAMAN = semuaHalaman() dan validator HASIL_KEREN_SEMUA.
 *
 * URUTAN RANTAI (Pedoman §17.1): … → keaktifan-kelas.mjs → forum-poin.mjs → … → samakan-absen-hasil.mjs →
 * hasil-keren.mjs → … → notasi-halaman.mjs → notasi-ekspor.mjs → rapikan-ponsel.mjs → draft-modul.mjs.
 * Generator TTL/CAD/Sisken mewarisi atau menimpa halaman dari Modul 1: jalankan ulang skrip ini sesudah
 * regenerasi; --periksa harus 0.
 *
 * Pakai (dari root repo):
 *   node scripts/hasil-keren.mjs                 tulis (hanya bila SEMUA halaman lolos di memori)
 *   node scripts/hasil-keren.mjs --periksa       lapor saja; kode keluar 1 bila ada halaman yang akan berubah
 *   node scripts/hasil-keren.mjs --uji-jangkar   pasang + periksa di memori pada ke-84 halaman (kesiapan rollout)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const VERSI = 1;
export const KURSUS = [
  "Engineering-Mathematics",
  "Getaran-Mekanik",
  "Optimalisasi-dan-Automasi",
  "Sistem-Kendali-Cerdas",
  "Teknik-Tenaga-Listrik",
  "Pemodelan-Computer-Aided-Design",
];
export const PERCOBAAN = ["Teknik-Tenaga-Listrik/Modul/Modul-3.html"];
export const HALAMAN = PERCOBAAN;

export const CSS = String.raw`<style id="hasil-keren-style">/* HASIL-KEREN:CSS v1 — dipasang scripts/hasil-keren.mjs (ikon bergerak + grafik kelas tab Hasil) */
@keyframes hkMuncul{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes hkPop{0%{opacity:0;transform:scale(.3)}60%{opacity:1;transform:scale(1.2)}100%{opacity:1;transform:scale(1)}}
@keyframes hkSentil{0%,100%{transform:scale(1) rotate(0)}40%{transform:scale(1.14) rotate(-4deg)}70%{transform:scale(.97) rotate(2deg)}}
@keyframes hkAyun{0%,100%{transform:rotate(0)}20%{transform:rotate(-16deg)}40%{transform:rotate(12deg)}60%{transform:rotate(-7deg)}80%{transform:rotate(3deg)}}
@keyframes hkApi{0%,100%{transform:scale(1,1) translateY(0)}25%{transform:scale(1.06,.94) translateY(1px)}50%{transform:scale(.94,1.1) translateY(-2px)}75%{transform:scale(1.04,.97) translateY(0)}}
@keyframes hkLambai{0%,60%,100%{transform:rotate(0)}10%,30%{transform:rotate(16deg)}20%,40%{transform:rotate(-8deg)}}
@keyframes hkLompat{0%,100%{transform:translateY(0)}30%{transform:translateY(-7px)}50%{transform:translateY(0)}70%{transform:translateY(-3px)}}
@keyframes hkDenyut{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
@keyframes hkGoyang{0%,100%{transform:rotate(0)}20%,60%{transform:rotate(-11deg)}40%,80%{transform:rotate(11deg)}}
@keyframes hkBalik{0%{opacity:0;transform:perspective(160px) rotateX(-90deg)}60%{opacity:1;transform:perspective(160px) rotateX(14deg)}100%{opacity:1;transform:none}}
@keyframes hkMengambang{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-3px) rotate(-6deg)}}
@keyframes hkPutar{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes hkTumbuhY{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes hkTumbuhX{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes hkPudar{from{opacity:0}to{opacity:1}}
@keyframes hkSegar{from{opacity:.4}to{opacity:1}}
@keyframes hkSorot{from{opacity:1}to{opacity:0}}
@keyframes hkGores{from{stroke-dashoffset:var(--hk-pjg)}to{stroke-dashoffset:0}}
.hk-ikon{display:inline-block;transform-origin:50% 60%;backface-visibility:hidden}
div.hk-ikon{display:block}
.hk-sr{position:absolute!important;width:1px!important;height:1px!important;margin:-1px!important;padding:0!important;border:0!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important;white-space:nowrap!important}
.hk-angka{font-variant-numeric:tabular-nums}
#page-hasil.active #leaderboardPanel>div:first-child>div,#page-hasil.active #leaderboardPanel>div:nth-child(2)>div,#page-hasil.active .hk-panel{animation:hkMuncul .5s cubic-bezier(.2,.8,.2,1) both}
#page-hasil.active #leaderboardPanel>div:first-child>div:nth-child(2){animation-delay:.07s}
#page-hasil.active #leaderboardPanel>div:first-child>div:nth-child(3){animation-delay:.14s}
#page-hasil.active #leaderboardPanel>div:nth-child(2)>div:nth-child(1){animation-delay:.2s}
#page-hasil.active #leaderboardPanel>div:nth-child(2)>div:nth-child(2){animation-delay:.26s}
#page-hasil.active #leaderboardPanel>div:nth-child(2)>div:nth-child(3){animation-delay:.32s}
#page-hasil.active .hk-panel{animation-delay:.38s}
#tab-hasil .hk-i-tab{transform-origin:50% 100%}
#tab-hasil:hover .hk-i-tab,#tab-hasil:focus-visible .hk-i-tab,#tab-hasil.active .hk-i-tab{animation:hkLompat .7s ease-out 1}
#page-hasil.active .hk-i-aktivitas{animation:hkLompat .8s ease-out .3s 2}
#page-hasil.active .hk-i-kalender{animation:hkBalik .7s cubic-bezier(.2,.8,.2,1) .25s both}
#resetBtnHasil:hover .hk-i-hapus,#resetBtnHasil:focus-visible .hk-i-hapus{animation:hkGoyang .5s ease-in-out 1}
#page-hasil.active .hk-i-peringatan{animation:hkDenyut 1s ease-in-out .3s 3}
#scheduleMissingDosen button:hover .hk-i-jam,#scheduleMissingDosen button:focus-visible .hk-i-jam{animation:hkPutar .8s ease-in-out 1}
#page-hasil.active .hk-i-trofi{transform-origin:50% 90%;animation:hkAyun 1.1s ease-in-out .45s 2}
#page-hasil .hk-i-api{transform-origin:50% 90%;animation:hkApi 1.6s ease-in-out infinite}
#page-hasil.active .hk-i-tangan{transform-origin:25% 90%;animation:hkLambai 1.4s ease-in-out .55s 2}
#page-hasil.active .hk-i-mhs{animation:hkLompat .8s ease-out .5s 1}
#page-hasil.active .hk-i-hadir{animation:hkDenyut .9s ease-in-out .6s 3}
#page-hasil.active .hk-i-absen{animation:hkGoyang .6s ease-in-out .7s 1}
#page-hasil.active .hk-ikon.hk-naik{animation:hkPop .55s ease-out 1}
#page-hasil.active .hk-i-absen.hk-naik{animation:hkGoyang .55s ease-in-out 2}
#leaderboardPanel>div:first-child>div>div:first-child:hover .hk-ikon{animation:hkSentil .5s ease-out 1}
.kartu-aktif .ka-judul.hk-ka-judul{background:none;-webkit-background-clip:border-box;background-clip:border-box;color:#f9a8d4}
.kartu-aktif .ka-judul .hk-ka-teks{background:linear-gradient(90deg,#fb923c,#f472b6,#a78bfa);-webkit-background-clip:text;background-clip:text;color:transparent}
#rajinList>div>span:first-child{display:inline-block}
#aktifList .ka-ikon{display:inline-block;transform-origin:50% 90%}
#rajinList.hk-masuk>div>span:first-child,#santaiList.hk-masuk>div>span:first-child,#aktifList.hk-masuk .ka-ikon{animation:hkPop .5s cubic-bezier(.2,.8,.2,1) both}
#rajinList.hk-masuk>div:nth-child(2)>span:first-child,#santaiList.hk-masuk>div:nth-child(2)>span:first-child,#aktifList.hk-masuk .ka-baris:nth-child(2) .ka-ikon{animation-delay:.1s}
#rajinList.hk-masuk>div:nth-child(3)>span:first-child,#santaiList.hk-masuk>div:nth-child(3)>span:first-child,#aktifList.hk-masuk .ka-baris:nth-child(n+3) .ka-ikon{animation-delay:.2s}
#rajinList>div:first-child>span:first-child{animation:hkMengambang 2.8s ease-in-out .6s infinite}
#rajinList.hk-masuk>div:first-child>span:first-child{animation:hkPop .5s cubic-bezier(.2,.8,.2,1) both,hkMengambang 2.8s ease-in-out .6s infinite}
#aktifList .ka-baris:hover .ka-ikon{animation:hkApi .8s ease-in-out 2}
#visitorTableBody.hk-masuk .vt-row{animation:hkMuncul .4s ease-out both}
#visitorTableBody.hk-masuk .vt-row:nth-child(2){animation-delay:.03s}
#visitorTableBody.hk-masuk .vt-row:nth-child(3){animation-delay:.06s}
#visitorTableBody.hk-masuk .vt-row:nth-child(4){animation-delay:.09s}
#visitorTableBody.hk-masuk .vt-row:nth-child(5){animation-delay:.12s}
#visitorTableBody.hk-masuk .vt-row:nth-child(6){animation-delay:.15s}
#visitorTableBody.hk-masuk .vt-row:nth-child(7){animation-delay:.18s}
#visitorTableBody.hk-masuk .vt-row:nth-child(8){animation-delay:.21s}
#visitorTableBody.hk-masuk .vt-row:nth-child(9){animation-delay:.24s}
#visitorTableBody.hk-masuk .vt-row:nth-child(10){animation-delay:.27s}
#visitorTableBody.hk-masuk .vt-row:nth-child(11){animation-delay:.3s}
#visitorTableBody.hk-masuk .vt-row:nth-child(12){animation-delay:.33s}
#visitorTableBody.hk-masuk .vt-row:nth-child(n+13){animation-delay:.36s}
#visitorTableBody .vt-row.hk-baru{position:relative}
#visitorTableBody .vt-row.hk-baru::after{content:"";position:absolute;top:0;right:0;bottom:0;left:0;background:rgba(56,189,248,.14);pointer-events:none;animation:hkSorot 1.4s ease-out both}
#visitorTableBody .vt-row:hover .vt-status>span{animation:hkSentil .45s ease-out 1}
#leaderboardPanel.hk-jeda .hk-i-api,#leaderboardPanel.hk-jeda #rajinList span{animation-play-state:paused}
.hk-panel[hidden]{display:none!important}
.hk-panel{margin:0 20px 16px;border:1px solid #2a3548;border-radius:16px;background:linear-gradient(180deg,rgba(14,165,233,.05),rgba(255,255,255,.015))}
.hk-panel>summary{list-style:none;display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 16px;cursor:pointer;font-size:.72rem;font-weight:700;color:#38bdf8;text-transform:uppercase;letter-spacing:.1em;border-radius:16px}
.hk-panel>summary::-webkit-details-marker{display:none}
.hk-panel>summary::after{content:"▾";margin-left:auto;color:#94a3b8;transition:transform .25s}
.hk-panel:not([open])>summary::after{transform:rotate(-90deg)}
.hk-panel>summary:focus-visible{outline:2px solid #38bdf8;outline-offset:2px}
.hk-sub{font-weight:600;text-transform:none;letter-spacing:0;color:#94a3b8;font-size:.78rem}
.hk-kisi{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:0 12px 12px}
.hk-kartu{margin:0;min-width:0;background:rgba(255,255,255,.025);border:1px solid #2a3548;border-radius:14px;padding:12px 14px}
.hk-lebar{grid-column:1/-1}
.hk-judul{display:flex;align-items:center;gap:8px;font-size:.7rem;font-weight:700;color:#e2e8f0;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
.hk-tanya{margin:0 0 8px;font-size:.72rem;color:#94a3b8}
.hk-isi{position:relative;min-height:120px}
.hk-isi svg{display:block;width:100%;height:auto;overflow:visible}
.hk-kosong{display:flex;align-items:center;justify-content:center;min-height:120px;text-align:center;font-size:.8rem;color:#94a3b8;padding:8px}
.hk-ket{margin:8px 0 0;font-size:.72rem;line-height:1.5;color:#94a3b8}
.hk-ket b{color:#e2e8f0}
.hk-c-tepat{--hk:#00e09e}.hk-c-terlambat{--hk:#fb7185}.hk-c-belum{--hk:#94a3b8}.hk-c-bolos{--hk:#ef4444}
.hk-c-benar{--hk:#00e09e}.hk-c-parsial{--hk:#fbbf24}.hk-c-salah{--hk:#fb7185}.hk-c-ulang{--hk:#a78bfa}.hk-c-kosong{--hk:#64748b}
.hk-donat{display:flex;align-items:center;gap:16px}
.hk-donat svg{width:132px;flex-shrink:0}
.hk-cincin{fill:none;stroke:#2a3548;stroke-width:14}
.hk-seg{fill:none;stroke:var(--hk);stroke-width:14;transition:stroke-dasharray .8s cubic-bezier(.2,.8,.2,1),stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)}
.hk-donat-angka{fill:#e2e8f0;font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:800;text-anchor:middle;dominant-baseline:middle}
.hk-donat-label{fill:#94a3b8;font-size:10.5px;letter-spacing:.1em;text-anchor:middle}
.hk-legenda{list-style:none;margin:0;padding:0;flex:1;min-width:0;display:grid;gap:6px;font-size:.78rem;color:#cbd5e1}
.hk-legenda li{display:flex;align-items:center;gap:8px}
.hk-legenda .hk-warna{width:10px;height:10px;border-radius:3px;flex-shrink:0;background:var(--hk)}
.hk-legenda .hk-jml{margin-left:auto;font-family:'JetBrains Mono',monospace;font-weight:700;color:#e2e8f0;white-space:nowrap}
.hk-legenda .hk-nol,.hk-legenda .hk-nol .hk-jml{color:#94a3b8}
.hk-legenda .hk-nol .hk-warna{opacity:.45}
.hk-sumbu{fill:#94a3b8;font-size:11px}
.hk-garis-grid{stroke:#2a3548;stroke-width:1}
.hk-batang{fill:#38bdf8}
.hk-batang.hk-anda{fill:#00e09e}
.hk-batang.hk-ini{fill:#f472b6}
.hk-batang.hk-lain{fill:#a78bfa}
.hk-label-batang{fill:#e2e8f0;font-size:11px;font-weight:700;text-anchor:middle}
.hk-rata{stroke:#fbbf24;stroke-width:1.5;stroke-dasharray:4 3}
.hk-teks-rata{fill:#fbbf24;font-size:10.5px;font-weight:700}
.hk-kurva{fill:none;stroke:#00e09e;stroke-width:2.2;stroke-linejoin:round}
.hk-area{fill:rgba(0,224,158,.13)}
.hk-zona-telat{fill:rgba(239,68,68,.08)}
.hk-deadline{stroke:#fb7185;stroke-width:1.5;stroke-dasharray:5 4}
.hk-sekarang{stroke:#fbbf24;stroke-width:1.5}
.hk-buka{stroke:#94a3b8;stroke-width:1;stroke-dasharray:2 3}
.hk-teks-deadline{fill:#fb7185;font-size:10.5px;font-weight:700}
.hk-teks-sekarang{fill:#fbbf24;font-size:10.5px;font-weight:700}
.hk-titik{fill:#00e09e}
.hk-baris-soal{display:grid;grid-template-columns:minmax(0,9.5em) minmax(0,1fr) 3.2em;align-items:center;gap:8px;margin:6px 0;font-size:.76rem;color:#cbd5e1}
.hk-tumpuk{display:flex;height:12px;border-radius:6px;overflow:hidden;background:#2a3548}
.hk-tumpuk>span{display:block;height:100%;background:var(--hk)}
.hk-pct{text-align:right;font-family:'JetBrains Mono',monospace;font-weight:700;color:#e2e8f0}
.hk-legenda-baris{display:flex;flex-wrap:wrap;gap:6px 12px;margin-top:6px;font-size:.7rem;color:#94a3b8}
.hk-legenda-baris span::before{content:"";display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px;vertical-align:-1px;background:var(--hk)}
.hk-rinci{margin-top:8px}
.hk-rinci>summary{cursor:pointer;font-size:.74rem;color:#38bdf8}
.hk-rinci .hk-baris-soal{grid-template-columns:4.6em minmax(0,1fr) 3.2em;margin:4px 0}
.hk-rinci .hk-tumpuk{height:8px}
.hk-terkunci{margin:6px 0;font-size:.76rem;color:#94a3b8}
.hk-sulit{color:#fbbf24}
.hk-lencana-dosen{display:inline-block;margin-left:auto;padding:1px 8px;border-radius:999px;font-size:.68rem;color:#bae6fd;background:rgba(56,189,248,.14);text-transform:none;letter-spacing:0}
.hk-panel.hk-masuk .hk-judul .hk-ikon,.hk-panel.hk-masuk>summary .hk-ikon{animation:hkPop .5s cubic-bezier(.2,.8,.2,1) .45s both}
.hk-panel.hk-masuk .hk-batang{transform-box:fill-box;transform-origin:50% 100%;animation:hkTumbuhY .6s cubic-bezier(.2,.8,.2,1) both}
.hk-panel.hk-masuk .hk-tumpuk{transform-origin:0 50%;animation:hkTumbuhX .7s cubic-bezier(.2,.8,.2,1) both}
.hk-panel.hk-masuk .hk-kurva{stroke-dasharray:var(--hk-pjg);animation:hkGores 1.1s ease-out .15s both}
.hk-panel.hk-masuk .hk-area{animation:hkPudar .8s ease-out .5s both}
.hk-segar{animation:hkSegar .35s ease-out}
@media (max-width:640px){
.hk-panel{margin:0 12px 12px}
.hk-kisi{grid-template-columns:minmax(0,1fr);padding:0 8px 8px}
.hk-kartu{padding:12px}
.hk-donat{flex-direction:column;align-items:stretch}
.hk-donat svg{width:120px;margin:0 auto}
.hk-baris-soal,.hk-rinci .hk-baris-soal{grid-template-columns:minmax(0,1fr) 3.2em}
.hk-baris-soal>.hk-tumpuk{grid-column:1/-1;grid-row:2}
}
@media (prefers-reduced-motion:reduce){
#tab-hasil .hk-ikon,#page-hasil .hk-ikon,#page-hasil.active #leaderboardPanel>div:first-child>div,#page-hasil.active #leaderboardPanel>div:nth-child(2)>div,#page-hasil.active .hk-panel,#rajinList>div>span:first-child,#santaiList>div>span:first-child,#aktifList .ka-ikon,#visitorTableBody .vt-row,#visitorTableBody .vt-status>span,#page-hasil .pulse-dot,.hk-panel,.hk-panel *{animation:none!important}
#page-hasil .float-formulas,#visitorTableBody .vt-row.hk-baru::after{display:none!important}
.hk-panel *,.hk-panel>summary::after{transition:none!important}
}
</style>`;

export const PANEL = String.raw`      <!-- HASIL-KEREN:PANEL BEGIN v1 — dipasang scripts/hasil-keren.mjs -->
      <details class="hk-panel" id="hkPanel" open hidden>
        <summary><span class="hk-ikon hk-i-grafik" aria-hidden="true">📈</span>Statistik Kelas<span class="hk-sub" id="hkSub">⏳ Memuat…</span></summary>
        <div class="hk-kisi">
          <figure class="hk-kartu" id="hkStatus" aria-labelledby="hkStatusJudul">
            <figcaption class="hk-judul" id="hkStatusJudul"><span class="hk-ikon" aria-hidden="true">🎯</span>Status Kehadiran</figcaption>
            <p class="hk-tanya">Berapa yang sudah mengerjakan, terlambat, belum, atau bolos?</p>
            <div class="hk-isi" id="hkStatusIsi"><div class="hk-kosong">⏳ Memuat…</div></div>
            <p class="hk-ket" id="hkStatusKet"></p>
          </figure>
          <figure class="hk-kartu" id="hkNilai" aria-labelledby="hkNilaiJudul">
            <figcaption class="hk-judul" id="hkNilaiJudul"><span class="hk-ikon" aria-hidden="true">📊</span>Sebaran Nilai</figcaption>
            <p class="hk-tanya">Bagaimana nilai kelas tersebar (0–100)?</p>
            <div class="hk-isi" id="hkNilaiIsi"><div class="hk-kosong">⏳ Memuat…</div></div>
            <p class="hk-ket" id="hkNilaiKet"></p>
          </figure>
          <figure class="hk-kartu hk-lebar" id="hkWaktu" aria-labelledby="hkWaktuJudul">
            <figcaption class="hk-judul" id="hkWaktuJudul"><span class="hk-ikon" aria-hidden="true">⏱️</span>Progres Pengerjaan</figcaption>
            <p class="hk-tanya">Kapan mahasiswa mengerjakan, dibanding jadwal buka dan deadline?</p>
            <div class="hk-isi" id="hkWaktuIsi"><div class="hk-kosong">⏳ Memuat…</div></div>
            <p class="hk-ket" id="hkWaktuKet"></p>
          </figure>
          <figure class="hk-kartu" id="hkSoal" aria-labelledby="hkSoalJudul">
            <figcaption class="hk-judul" id="hkSoalJudul"><span class="hk-ikon" aria-hidden="true">🧩</span>Ketuntasan per Jenis Soal</figcaption>
            <p class="hk-tanya">Bagian mana yang paling banyak dijawab benar?</p>
            <div class="hk-isi" id="hkSoalIsi"><div class="hk-kosong">⏳ Memuat…</div></div>
            <p class="hk-ket" id="hkSoalKet"></p>
          </figure>
          <figure class="hk-kartu" id="hkAktif" aria-labelledby="hkAktifJudul">
            <figcaption class="hk-judul" id="hkAktifJudul"><span class="hk-ikon" aria-hidden="true">🙋</span>Keaktifan di Kelas per Pertemuan</figcaption>
            <p class="hk-tanya">Berapa mahasiswa yang dicentang aktif di tiap pertemuan?</p>
            <div class="hk-isi" id="hkAktifIsi"><div class="hk-kosong">⏳ Memuat…</div></div>
            <p class="hk-ket" id="hkAktifKet"></p>
          </figure>
        </div>
      </details>
      <!-- HASIL-KEREN:PANEL END v1 -->
`;

export const DATA = String.raw`// HASIL-KEREN:DATA BEGIN v1 — dipasang scripts/hasil-keren.mjs
// Statistik Kelas tab Hasil: ikon bergerak + lima grafik agregat (SVG/HTML buatan sendiri, tanpa pustaka).
// Angka = aturan tabel Hasil + statistik Hadir/Absen (status yang sama); nama tidak pernah ditampilkan;
// tidak menulis Firebase dan tidak berlangganan node baru (hanya membaca keadaan halaman).
// Setiap galat ditangkap di sini (hkMulai/hkAman) agar sisa skrip modul tetap berjalan.
// HASIL-KEREN:MURNI BEGIN
const HK_MIN_PESERTA = 5;
const HK_ISO_BERZONA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;
function hkMsIsoMurni(s) { return (typeof s === 'string' && HK_ISO_BERZONA.test(s)) ? Date.parse(s) : NaN; }
// Status per mahasiswa roster, aturan tabel Hasil dan statistik Hadir/Absen.
function hkStatusKelasMurni(visitors, roster, schedExpired, isSim, isLate, total) {
  const peta = {};
  for (const v of (visitors || [])) {
    if (!v || v.role === 'dosen' || v.role === 'guest' || isSim(v.nim)) continue;
    if (!peta[v.nim]) peta[v.nim] = v;
  }
  const tot = Number(total) > 0 ? Number(total) : 50;
  const r = { total: 0, hadir: 0, absen: 0, tepat: 0, terlambat: 0, belum: 0, bolos: 0, baris: [] };
  for (const s of (roster || [])) {
    if (!s || isSim(s.nim)) continue;
    const v = peta[s.nim];
    const poin = v ? (Number(v.points) || 0) : 0;
    const punya = !!v && poin > 0;
    const status = (!punya && schedExpired) ? 'bolos' : !punya ? 'belum' : isLate(v.timestamp) ? 'terlambat' : 'tepat';
    r.total += 1;
    r[status] += 1;
    r.baris.push({ nim: String(s.nim), status, poin, nilai: Math.round(poin / tot * 100),
      tanpaKunjungan: !!(v && v.tanpaKunjungan), poinPertama: v ? v.poinPertama : undefined,
      pointTimestamp: v ? v.pointTimestamp : undefined, scored: v ? String(v.scoredQuestions || '') : '' });
  }
  r.hadir = r.tepat + r.terlambat;
  r.absen = r.bolos;
  return r;
}
function hkDistribusiNilaiMurni(baris) {
  const nilai = (baris || []).filter((b) => b.status === 'tepat' || b.status === 'terlambat')
    .map((b) => Math.max(0, Math.min(100, Number(b.nilai) || 0))).sort((a, b) => a - b);
  const keranjang = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (const x of nilai) keranjang[Math.min(9, Math.floor(x / 10))] += 1;
  const n = nilai.length;
  const jumlah = nilai.reduce((a, x) => a + x, 0);
  const median = n ? (n % 2 ? nilai[(n - 1) / 2] : (nilai[n / 2 - 1] + nilai[n / 2]) / 2) : null;
  return { n, keranjang, rata: n ? Math.round(jumlah / n * 10) / 10 : null, median,
    min: n ? nilai[0] : null, maks: n ? nilai[n - 1] : null, tanpaNilai: (baris || []).length - n };
}
// Kurva kumulatif waktu tulisan server: poinPertama, cadangan pointTimestamp (sumber dihitung terpisah).
function hkKurvaMurni(baris, bukaMs, dueMs, nowMs) {
  const r = { ada: false, x0: NaN, x1: NaN, titik: [], n: 0, sebelum: 0, sesudah: 0, sesudahTepat: 0,
    tanpaWaktu: 0, hanyaBonus: 0, terpotong: 0, sumberPertama: 0, sumberAkhir: 0,
    total: (baris || []).length, sekarangDalam: false };
  if (!Number.isFinite(bukaMs) || !Number.isFinite(dueMs) || dueMs <= bukaMs) return r;
  const batas = dueMs + (dueMs - bukaMs);
  const waktu = [];
  for (const b of (baris || [])) {
    if (b.status !== 'tepat' && b.status !== 'terlambat') continue;
    if (b.tanpaKunjungan) { r.hanyaBonus += 1; continue; }
    let t = hkMsIsoMurni(b.poinPertama);
    const pertama = Number.isFinite(t);
    if (!pertama) t = hkMsIsoMurni(b.pointTimestamp);
    if (!Number.isFinite(t)) { r.tanpaWaktu += 1; continue; }
    if (pertama) r.sumberPertama += 1; else r.sumberAkhir += 1;
    if (t < bukaMs) t = bukaMs;
    if (t <= dueMs) r.sebelum += 1;
    else { r.sesudah += 1; if (b.status === 'tepat') r.sesudahTepat += 1; }
    if (t > batas) { t = batas; r.terpotong += 1; }
    waktu.push(t);
  }
  waktu.sort((a, b) => a - b);
  r.titik = waktu.map((t, i) => ({ t, n: i + 1 }));
  r.n = waktu.length;
  r.sekarangDalam = Number.isFinite(nowMs) && nowMs >= bukaMs && nowMs <= dueMs;
  let x1 = Math.max(dueMs, waktu.length ? waktu[waktu.length - 1] : dueMs);
  if (x1 > batas) x1 = batas;
  r.x0 = bukaMs;
  r.x1 = x1 + (x1 - bukaMs) * 0.03;
  r.ada = true;
  return r;
}
// Status akhir per qId dari penanda scoredQuestions (hanya mc/c).
function hkMarkerMurni(scored) {
  const urut = { ulang: 1, salah: 2, parsial: 3, benar: 4 };
  const st = {};
  for (const m of String(scored || '').split(',')) {
    const r = /^((?:mc|c)\d{1,2})(_tf_used|_mc_used|_comp_used|_comp_partial|_comp_ulang|_comp)?$/.exec(m.trim());
    if (!r) continue;
    const s = (!r[2] || r[2] === '_comp') ? 'benar' : r[2] === '_comp_partial' ? 'parsial' : r[2] === '_comp_ulang' ? 'ulang' : 'salah';
    if (!st[r[1]] || urut[s] > urut[st[r[1]]]) st[r[1]] = s;
  }
  return st;
}
function hkSoalMurni(baris, cfg) {
  const mc = Math.max(0, Number(cfg && cfg.mc) || 0);
  const ez = Math.max(0, Number(cfg && cfg.ez) || 0);
  const hd = Math.max(0, Number(cfg && cfg.hard) || 0);
  const ids = [];
  for (let i = 1; i <= mc; i += 1) ids.push(['mc' + i, 'pg']);
  for (let i = 1; i <= ez + hd; i += 1) ids.push(['c' + i, i <= ez ? 'ez' : 'hard']);
  const kosong = () => ({ benar: 0, parsial: 0, salah: 0, ulang: 0, belum: 0 });
  const soal = ids.map(([id, jenis]) => Object.assign({ id, jenis }, kosong()));
  const jenis = { pg: Object.assign({ n: mc, peserta: 0 }, kosong()), ez: Object.assign({ n: ez, peserta: 0 }, kosong()),
    hard: Object.assign({ n: hd, peserta: 0 }, kosong()) };
  let peserta = 0;
  for (const b of (baris || [])) {
    const st = hkMarkerMurni(b.scored);
    if (!ids.some(([id]) => st[id])) continue;
    peserta += 1;
    // Penjawab per jenis: mahasiswa yang punya penanda sedikitnya satu soal jenis itu.
    const coba = {};
    ids.forEach(([id, j]) => { if (st[id]) coba[j] = true; });
    Object.keys(coba).forEach((j) => { jenis[j].peserta += 1; });
    soal.forEach((q) => { const s = st[q.id] || 'belum'; q[s] += 1; jenis[q.jenis][s] += 1; });
  }
  return { peserta, jenis, soal };
}
function hkGerbangSoalMurni(peserta, schedEnded, dosen) {
  if (!peserta) return 'kosong';
  if (dosen) return 'tampil';
  if (peserta < HK_MIN_PESERTA) return 'sedikit';
  if (!schedEnded) return 'tunggu';
  return 'tampil';
}
// Batang satu jenis soal untuk mahasiswa hanya bila jenis itu dijawab sedikitnya HK_MIN_PESERTA mahasiswa
// (ambang keseluruhan saja bisa membuka hasil satu orang pada jenis yang jarang dikerjakan).
function hkGerbangJenisMurni(pesertaJenis, dosen) { return dosen === true || Number(pesertaJenis) >= HK_MIN_PESERTA; }
// Rincian per soal hanya untuk dosen (jawaban modul tetap diterima sesudah deadline).
function hkGerbangRinciMurni(gerbang, dosen) { return gerbang === 'tampil' && dosen === true; }
function hkKeaktifanTrenMurni(kursusNode, roster, isSim, modulId) {
  const m = /^(.*?)(\d+)$/.exec(String(modulId || ''));
  const awalan = m ? m[1] : '';
  const ini = m ? Number(m[2]) : 0;
  const dalam = new Set((roster || []).filter((s) => s && !isSim(s.nim)).map((s) => String(s.nim)));
  const per = [];
  for (let no = 1; no <= 14; no += 1) {
    let n = 0;
    for (const [k, rec] of Object.entries((kursusNode || {})[awalan + no] || {})) {
      if (k.indexOf('mhs_') !== 0 || !rec || rec.aktif !== true) continue;
      const nim = k.slice(4);
      if (!isSim(nim) && dalam.has(nim)) n += 1;
    }
    per.push({ no, n, sekarang: no === ini });
  }
  return { per, total: dalam.size, adaData: per.some((x) => x.n > 0) };
}
function hkForumRingkasMurni(modulForum, roster, isSim) {
  const dalam = new Set((roster || []).filter((s) => s && !isSim(s.nim)).map((s) => String(s.nim)));
  const r = { klaim: 0, penuh: 0, sebagian: 0 };
  for (const [k, rec] of Object.entries(modulForum || {})) {
    if (k.indexOf('mhs_') !== 0 || !rec || typeof rec !== 'object') continue;
    const nim = k.slice(4);
    const p = Number(rec.pengali);
    if (isSim(nim) || !dalam.has(nim) || !(p > 0 && p <= 1)) continue;
    r.klaim += 1;
    if (p === 1) r.penuh += 1; else r.sebagian += 1;
  }
  return r;
}
// NIM baris tabel yang teksnya berubah sejak render sebelumnya (render pertama: tidak ada).
function hkUbahBarisMurni(lama, baru) {
  const a = lama || {}, b = baru || {};
  if (!Object.keys(a).length) return [];
  return Object.keys(b).filter((k) => a[k] !== b[k]);
}
function hkTanggaMurni(maks) {
  const top = Math.max(1, Math.ceil(Number(maks) || 0));
  if (top <= 5) return Array.from({ length: top + 1 }, (_, i) => i);
  const atas = Math.ceil(top / 2) * 2;
  return [0, atas / 2, atas];
}
function hkFmtMurni(n, desimal) {
  const k = Math.pow(10, desimal || 0);
  return String(Math.round((Number(n) || 0) * k) / k).replace('.', ',');
}
// HASIL-KEREN:MURNI END
const HK_SVG = 'http://www.w3.org/2000/svg';
const HK_ANGKA = ['statTotalMhs', 'statHadir', 'statAbsen'];
const HK = { mati: false, galat: 0, diam: false, aktif: false, masuk: true, masukDaftar: false, kotor: true, tanda: '',
             timer: 0, tunggu: 0, raf: 0, lebar: 0, gambar: 0, beda: 0, angka: {}, baris: {}, lepas: {} };
// Pengamat yang dibuat blok ini (diputus hkPulihkan) dan tanda tangan isi per kartu grafik.
const HK_PENGAMAT = [];
const HK_KARTU = {};
const HK_SEGAR = {};
const HK_STATUS = [['tepat', '✅', 'Tepat Waktu'], ['terlambat', '⏰', 'Terlambat'], ['belum', '⏳', 'Belum'], ['bolos', '❌', 'Bolos']];
// Galat pertama dicatat sekali; sesudah 3 galat fitur dimatikan dan tampilan asli dipulihkan.
function hkGagal(e) {
  HK.galat += 1;
  if (HK.galat === 1) { try { console.warn('[HasilKeren]', e); } catch (e2) { /* diam */ } }
  if (HK.galat >= 3 && !HK.mati) hkPulihkan();
}
function hkAman(fn) {
  return function () {
    if (HK.mati) return undefined;
    try { return fn.apply(this, arguments); } catch (e) { hkGagal(e); return undefined; }
  };
}
// Kembali ke tampilan asli: pengamat diputus, angka bayangan dibuang, angka asli tampil lagi, panel disembunyikan.
function hkPulihkan() {
  HK.mati = true;
  const coba = (f) => { try { f(); } catch (e) { /* lanjut ke langkah berikutnya */ } };
  coba(() => { if (HK.timer) clearTimeout(HK.timer); HK.timer = 0; });
  coba(() => { if (HK.raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(HK.raf); HK.raf = 0; });
  while (HK_PENGAMAT.length) { const o = HK_PENGAMAT.pop(); coba(() => o.disconnect()); }
  Object.keys(HK.angka).forEach((id) => {
    const a = HK.angka[id];
    coba(() => a.obs.disconnect());
    coba(() => { if (a.raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(a.raf); a.raf = 0; });
    coba(() => { if (a.bayangan && a.bayangan.parentNode) a.bayangan.parentNode.removeChild(a.bayangan); });
  });
  HK.angka = {};
  HK_ANGKA.forEach((id) => coba(() => { const el = document.getElementById(id); if (el) el.classList.remove('hk-sr'); }));
  ['rajinList', 'santaiList', 'aktifList', 'visitorTableBody', 'leaderboardPanel', 'hkPanel'].forEach((id) => coba(() => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hk-masuk', 'hk-jeda');
  }));
  coba(() => hkBarisTabel().forEach((r) => r.classList.remove('hk-baru')));
  coba(() => { const p = document.getElementById('hkPanel'); if (p) p.hidden = true; });
}
function hkDiam() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
function hkDengarDiam() {
  if (!window.matchMedia) return;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!mq) return;
  const ubah = hkAman(() => { HK.diam = !!mq.matches; });
  if (typeof mq.addEventListener === 'function') mq.addEventListener('change', ubah);
  else if (typeof mq.addListener === 'function') mq.addListener(ubah);
}
// Simbol/emoji di awal teks (jangkar ikon sudah diperiksa injector; tanpa regex \p).
function hkSimbol(s) { const c = String(s || '').codePointAt(0); return Number.isFinite(c) && c >= 0x2190; }
function hkKelas(el, k) { return !!(el && el.classList && el.classList.contains(k)); }
function hkCari(akar, uji) {
  if (!akar || !akar.children) return null;
  for (let i = 0; i < akar.children.length; i += 1) {
    const c = akar.children[i];
    if (uji(c)) return c;
    const d = hkCari(c, uji);
    if (d) return d;
  }
  return null;
}
// Emoji di awal node teks pertama dibungkus span.hk-ikon (sisa teks tetap node teks yang sama).
function hkBungkusIkon(el, kelas, buangSpasi) {
  if (!el || hkCari(el, (c) => hkKelas(c, 'hk-ikon'))) return null;
  const teks = el.firstChild;
  if (!teks || teks.nodeType !== 3) return null;
  const m = /^(\s*)(\S+)(\s+)/.exec(String(teks.nodeValue));
  if (!m || !hkSimbol(m[2])) return null;
  const ikon = document.createElement('span');
  ikon.className = 'hk-ikon ' + kelas;
  ikon.setAttribute('aria-hidden', 'true');
  ikon.textContent = m[2];
  el.insertBefore(ikon, teks);
  if (m[1]) el.insertBefore(document.createTextNode(m[1]), ikon);
  teks.nodeValue = (buangSpasi ? '' : ' ') + String(teks.nodeValue).slice(m[0].length);
  return teks;
}
// Elemen yang isinya hanya satu simbol diberi kelas hk-ikon + kelasnya.
function hkTandaiIkon(el, kelas) {
  if (!el || hkKelas(el, 'hk-ikon')) return;
  const t = String(el.textContent || '').trim();
  if (t.length > 3 || !hkSimbol(t) || el.children.length !== 0) return;
  el.classList.add('hk-ikon', kelas);
  el.setAttribute('aria-hidden', 'true');
}
function hkSpanPertama(el) { const a = el && el.firstElementChild; return (a && a.tagName === 'SPAN') ? a : null; }
function hkHiasIkon() {
  const id = (x) => document.getElementById(x);
  const pasang = (f) => { try { f(); } catch (e) { try { console.warn('[HasilKeren] ikon:', e); } catch (e2) { /* diam */ } } };
  pasang(() => hkBungkusIkon(id('tab-hasil'), 'hk-i-tab', false));
  pasang(() => {
    const h2 = hkCari(id('page-hasil'), (c) => c.tagName === 'H2' && String(c.textContent).trim() === 'Performa Mahasiswa');
    if (h2) hkBungkusIkon(h2.previousElementSibling, 'hk-i-aktivitas', true);
  });
  pasang(() => hkTandaiIkon(hkSpanPertama(id('scheduleInfo')), 'hk-i-kalender'));
  pasang(() => hkBungkusIkon(id('resetBtnHasil'), 'hk-i-hapus', true));
  pasang(() => hkTandaiIkon(hkSpanPertama(id('scheduleMissingDosen')), 'hk-i-peringatan'));
  pasang(() => hkBungkusIkon(hkCari(id('scheduleMissingDosen'), (c) => c.tagName === 'BUTTON'), 'hk-i-jam', true));
  pasang(() => { const el = id('rajinList'); hkBungkusIkon(el && el.previousElementSibling, 'hk-i-trofi', false); });
  pasang(() => { const el = id('santaiList'); hkBungkusIkon(el && el.previousElementSibling, 'hk-i-api', false); });
  pasang(() => {
    const el = id('aktifList');
    const judul = el && el.previousElementSibling;
    const sisa = hkBungkusIkon(judul, 'hk-i-tangan', false);
    if (!sisa || !hkKelas(judul, 'ka-judul')) return;
    // .ka-judul bergradien lewat background-clip:text: gradien pindah ke span teks agar ikon tetap berwarna.
    const teks = document.createElement('span');
    teks.className = 'hk-ka-teks';
    judul.insertBefore(teks, sisa);
    teks.appendChild(sisa);
    judul.classList.add('hk-ka-judul');
  });
  [['statTotalMhs', 'hk-i-mhs'], ['statHadir', 'hk-i-hadir'], ['statAbsen', 'hk-i-absen']].forEach((p) => pasang(() => {
    const el = id(p[0]);
    hkTandaiIkon(el && el.previousElementSibling, p[1]);
  }));
}
// Angka bayangan statistik (hitung naik) tanpa merebut textContent milik kartu statistik asli:
// pengamat dulu, lalu bayangan disisipkan, baru angka asli disembunyikan visual (hk-sr).
function hkPasangAngka() {
  if (typeof MutationObserver !== 'function') return;
  HK_ANGKA.forEach((id) => {
    const el = document.getElementById(id);
    if (!el || HK.angka[id]) return;
    let obs = null;
    let bayangan = null;
    try {
      obs = new MutationObserver(hkAman(() => hkAngkaBerubah(id, false)));
      obs.observe(el, { childList: true, characterData: true, subtree: true });
      bayangan = document.createElement('div');
      bayangan.className = 'hk-angka';
      bayangan.setAttribute('aria-hidden', 'true');
      bayangan.style.cssText = el.style.cssText;
      bayangan.textContent = el.textContent;
      el.insertAdjacentElement('afterend', bayangan);
      el.classList.add('hk-sr');
      HK.angka[id] = { el: el, bayangan: bayangan, obs: obs, raf: 0, tuju: String(el.textContent) };
    } catch (e) {
      if (obs) { try { obs.disconnect(); } catch (e2) { /* diam */ } }
      if (bayangan && bayangan.parentNode) bayangan.parentNode.removeChild(bayangan);
      throw e;
    }
  });
}
function hkNaik(ikon) {
  if (!ikon || !ikon.classList || HK.diam || !HK.aktif) return;
  ikon.classList.remove('hk-naik');
  void ikon.offsetWidth;
  ikon.classList.add('hk-naik');
  let lepas = 0;
  const selesai = hkAman(() => {
    ikon.classList.remove('hk-naik');
    ikon.removeEventListener('animationend', selesai);
    if (lepas) clearTimeout(lepas);
    lepas = 0;
  });
  ikon.addEventListener('animationend', selesai);
  lepas = setTimeout(selesai, 1200);
}
function hkAngkaBerubah(id, dariNol) {
  const a = HK.angka[id];
  if (!a) return;
  const teks = String(a.el.textContent);
  const bersih = teks.trim();
  const henti = () => { if (a.raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(a.raf); a.raf = 0; };
  if (!/^\d+$/.test(bersih)) { henti(); a.tuju = teks; a.bayangan.textContent = teks; return; }
  if (!dariNol && a.tuju === teks) return;
  const akhir = Number(bersih);
  const tampil = Number(String(a.bayangan.textContent).trim());
  const awal = dariNol ? 0 : (Number.isFinite(tampil) ? tampil : 0);
  henti();
  a.tuju = teks;
  if (HK.diam || !HK.aktif || typeof requestAnimationFrame !== 'function' || awal === akhir) { a.bayangan.textContent = teks; return; }
  if (!dariNol && akhir > awal && (id === 'statHadir' || id === 'statAbsen')) hkNaik(a.el.previousElementSibling);
  const mulai = Date.now();
  const langkah = hkAman(() => {
    const p = Math.min(1, (Date.now() - mulai) / 700);
    const v = awal + (akhir - awal) * (1 - Math.pow(1 - p, 3));
    a.bayangan.textContent = p >= 1 ? teks : String(Math.round(v));
    a.raf = p >= 1 ? 0 : requestAnimationFrame(langkah);
  });
  a.raf = requestAnimationFrame(langkah);
}
// Bayangan yang tidak sedang beranimasi disamakan lagi dengan angka asli (sumber kebenaran).
function hkSelaraskanAngka() {
  Object.keys(HK.angka).forEach((id) => {
    const a = HK.angka[id];
    const asli = String(a.el.textContent);
    if (!a.raf && a.bayangan.textContent !== asli) { a.bayangan.textContent = asli; a.tuju = asli; }
  });
}
function hkKelasMasuk(el) {
  if (!el || HK.diam) return;
  const k = el.id || 'hk';
  if (HK.lepas[k]) clearTimeout(HK.lepas[k]);
  el.classList.add('hk-masuk');
  HK.lepas[k] = setTimeout(hkAman(() => { HK.lepas[k] = 0; el.classList.remove('hk-masuk'); }), 1600);
}
function hkSegar(el) {
  if (!el || HK.diam) return;
  el.classList.remove('hk-segar');
  void el.offsetWidth;
  el.classList.add('hk-segar');
  const k = 'segar-' + el.id;
  if (HK.lepas[k]) clearTimeout(HK.lepas[k]);
  HK.lepas[k] = setTimeout(hkAman(() => { HK.lepas[k] = 0; el.classList.remove('hk-segar'); }), 400);
}
// Tab Hasil dibuka: animasi masuk daftar papan/tabel hanya di jendela ini (bukan karena data berubah).
function hkBukaTab() {
  // Sorotan lama tidak ikut berkedip lagi saat tab dibuka ulang (animasi CSS mulai ulang sesudah display:none).
  hkBarisTabel().forEach((r) => r.classList.remove('hk-baru'));
  HK.aktif = true;
  HK.masuk = true;
  HK.masukDaftar = true;
  if (HK.lepas._daftar) clearTimeout(HK.lepas._daftar);
  HK.lepas._daftar = setTimeout(hkAman(() => { HK.lepas._daftar = 0; HK.masukDaftar = false; }), 800);
  ['rajinList', 'santaiList', 'aktifList', 'visitorTableBody'].forEach((id) => hkKelasMasuk(document.getElementById(id)));
  HK_ANGKA.forEach((id) => hkAngkaBerubah(id, true));
  hkJadwalkan(true);
}
function hkBarisTabel() {
  const tb = document.getElementById('visitorTableBody');
  const out = [];
  if (!tb || !tb.children) return out;
  for (let i = 0; i < tb.children.length; i += 1) {
    const r = tb.children[i];
    if (hkKelas(r, 'vt-row') && r.getAttribute('data-nim')) out.push(r);
  }
  return out;
}
function hkPetaBaris() {
  const peta = {};
  hkBarisTabel().forEach((r) => { peta[r.getAttribute('data-nim')] = String(r.textContent); });
  return peta;
}
// Debounce 200 ms (paling lama 1 dtk sejak pemicu pertama yang tertunda), lalu satu requestAnimationFrame.
function hkJadwalkan(paksa) {
  if (HK.mati) return;
  if (paksa) HK.tanda = '';
  const kini = Date.now();
  if (!HK.tunggu) HK.tunggu = kini;
  if (HK.timer) clearTimeout(HK.timer);
  const jeda = Math.max(0, Math.min(200, 1000 - (kini - HK.tunggu)));
  HK.timer = setTimeout(hkAman(() => {
    HK.timer = 0;
    HK.tunggu = 0;
    if (HK.raf) return;
    const jalan = hkAman(() => { HK.raf = 0; hkGambar(); });
    HK.raf = (typeof requestAnimationFrame === 'function') ? requestAnimationFrame(jalan) : setTimeout(jalan, 16);
  }), jeda);
}
function hkKonfigSoal() {
  let c = window.SCORE_CONFIG || null;
  if (!c) { try { c = SCORE_CONFIG; } catch (e) { c = null; } }
  const n = (x, d) => ((x !== null && x !== undefined && x !== '' && Number.isInteger(Number(x)) && Number(x) >= 0) ? Number(x) : d);
  const cfg = { mc: n(c && c.MC_COUNT, 10), ez: n(c && c.COMP_EZ_COUNT, 10), hard: n(c && c.COMP_HARD_COUNT, 5) };
  cfg.tugas = cfg.ez + cfg.hard <= 5;
  return cfg;
}
// Keranjang nilai identitas sendiri (mahasiswa sungguhan berstatus Hadir), bukan Mode Preview/akun simulasi.
function hkSaya(st) {
  let me = null;
  try { me = (typeof getIdentityLocal === 'function') ? getIdentityLocal() : null; } catch (e) { me = null; }
  if (!me || me.role !== 'student' || !me.nim || window._previewMode || isSimulasiNim(me.nim)) return null;
  const b = st.baris.find((x) => x.nim === String(me.nim));
  if (!b || (b.status !== 'tepat' && b.status !== 'terlambat')) return null;
  return Math.min(9, Math.floor(Math.max(0, Math.min(100, Number(b.nilai) || 0)) / 10));
}
function hkRingkasan(kini) {
  const roster = Array.isArray(masterStudents) ? masterStudents : [];
  const kunjungan = Array.isArray(latestVisitors) ? latestVisitors : [];
  const memuat = (!roster.length && !masterFetchDone) || !_visitorsDiterima;
  const gagal = !roster.length && !!masterFetchDone;
  const j = currentSchedule;
  const jadwal = !!(j && j.start && j.end);
  // Aturan status (isLate/Bolos) hanya memakai end: keterangan G1 mengikuti syarat yang sama.
  const adaDeadline = !!(j && j.end);
  const schedExpired = !!(j && j.end && kini > Date.parse(j.end));
  const total = _keaktifanTotal();
  const st = hkStatusKelasMurni(kunjungan, roster, schedExpired, isSimulasiNim, isLate, total);
  const dist = hkDistribusiNilaiMurni(st.baris);
  const bukaMs = jadwal ? Date.parse(j.start) : NaN;
  const dueMs = jadwal ? Date.parse(j.end) : NaN;
  const kurva = hkKurvaMurni(st.baris, bukaMs, dueMs, kini);
  const cfg = hkKonfigSoal();
  const soal = hkSoalMurni(st.baris, cfg);
  const dosen = !!(_auth && _auth.currentUser);
  const gerbang = hkGerbangSoalMurni(soal.peserta, schedExpired, dosen);
  const rinci = hkGerbangRinciMurni(gerbang, dosen);
  const aktif = hkKeaktifanTrenMurni(_keaktifanKursus, roster, isSimulasiNim, MODULE_ID);
  let forum = null;
  try {
    if (typeof forumAturanAktif === 'function' && forumAturanAktif() === true) forum = hkForumRingkasMurni(_forumModul, roster, isSimulasiNim);
  } catch (e) { forum = null; }
  const saya = hkSaya(st);
  const menit = kurva.sekarangDalam ? Math.floor(kini / 60000) : 0;
  return { memuat: memuat, gagal: gagal, jadwal: jadwal, adaDeadline: adaDeadline, schedExpired: schedExpired, bukaMs: bukaMs, dueMs: dueMs, st: st, dist: dist,
    kurva: kurva, cfg: cfg, soal: soal, dosen: dosen, gerbang: gerbang, rinci: rinci, aktif: aktif, forum: forum, saya: saya,
    menit: menit, bonus: total * KEAKTIFAN_BONUS_FRAKSI };
}
function hkTanpaBaris(k, v) { return k === 'baris' ? undefined : v; }
function hkLebar(id) { const el = document.getElementById(id); return el ? Math.round(el.clientWidth || 0) : 0; }
function hkPersen(a, b) { return b > 0 ? Math.round(a / b * 100) : 0; }
function hkAngka(x) { return String(Math.round(x * 100) / 100); }
// DOM dibangun hanya lewat createElement(NS) + setAttribute + textContent (tanpa HTML mentah).
function hkEl(tag, attr, teks, svg) {
  const el = svg ? document.createElementNS(HK_SVG, tag) : document.createElement(tag);
  if (attr) Object.keys(attr).forEach((k) => { if (attr[k] !== null && attr[k] !== undefined) el.setAttribute(k, String(attr[k])); });
  if (teks !== undefined && teks !== null) el.textContent = String(teks);
  return el;
}
function hkS(tag, attr, teks) { return hkEl(tag, attr, teks, true); }
function hkGanti(el) {
  const anak = Array.prototype.slice.call(arguments, 1);
  if (typeof el.replaceChildren === 'function') { el.replaceChildren.apply(el, anak); return; }
  while (el.firstChild) el.removeChild(el.firstChild);
  anak.forEach((n) => el.appendChild(n));
}
// Keterangan: bagian berupa string, atau larik berisi string dan {b: teks} (tebal).
function hkKet(el, bagian) {
  if (!el) return;
  const anak = [];
  (bagian || []).forEach((b, i) => {
    if (i) anak.push(document.createTextNode(' '));
    if (Array.isArray(b)) b.forEach((x) => anak.push(typeof x === 'string' ? document.createTextNode(x) : hkEl('b', null, x.b)));
    else anak.push(document.createTextNode(String(b)));
  });
  hkGanti.apply(null, [el].concat(anak));
}
function hkKosong(isi, teks) { if (isi) hkGanti(isi, hkEl('div', { class: 'hk-kosong' }, teks)); }
function hkSvg(idDasar, w, h, judul, ringkas) {
  const svg = hkS('svg', { viewBox: '0 0 ' + w + ' ' + h, 'aria-labelledby': idDasar + 'T ' + idDasar + 'D', focusable: 'false' });
  svg.setAttribute('role', 'img');
  svg.appendChild(hkS('title', { id: idDasar + 'T' }, judul));
  svg.appendChild(hkS('desc', { id: idDasar + 'D' }, ringkas));
  return svg;
}
function hkRaf(fn) { return (typeof requestAnimationFrame === 'function') ? requestAnimationFrame(hkAman(fn)) : setTimeout(hkAman(fn), 16); }
// G1 Status Kehadiran (donat): sama dengan kartu statistik dan status tabel.
function hkGambarStatus(R, animasi) {
  const isi = document.getElementById('hkStatusIsi');
  if (!isi) return;
  const st = R.st;
  const C = 2 * Math.PI * 46;
  const svg = hkSvg('hkStatusSvg', 120, 120, 'Status kehadiran',
    'Status kehadiran ' + st.total + ' mahasiswa: ' + st.tepat + ' tepat waktu, ' + st.terlambat + ' terlambat, ' + st.belum + ' belum, ' +
    st.bolos + ' bolos. Hadir ' + st.hadir + ', absen ' + st.absen + '.');
  svg.appendChild(hkS('circle', { class: 'hk-cincin', cx: 60, cy: 60, r: 46 }));
  const ada = HK_STATUS.filter((s) => st[s[0]] > 0);
  const seg = [];
  let mulai = 0;
  ada.forEach((s, i) => {
    const bagian = st[s[0]] / st.total * C;
    const len = Math.max(0, bagian - (ada.length > 1 ? 2 : 0));
    const c = hkS('circle', { class: 'hk-seg hk-c-' + s[0], cx: 60, cy: 60, r: 46, transform: 'rotate(-90 60 60)',
      'stroke-dasharray': (animasi ? '0' : hkAngka(len)) + ' ' + hkAngka(C), 'stroke-dashoffset': hkAngka(-mulai) });
    c.appendChild(hkS('title', null, s[2] + ': ' + st[s[0]] + ' (' + hkPersen(st[s[0]], st.total) + '%)'));
    if (animasi) c.style.transitionDelay = (i * 80) + 'ms';
    svg.appendChild(c);
    seg.push([c, len]);
    mulai += bagian;
  });
  svg.appendChild(hkS('text', { class: 'hk-donat-angka', x: 60, y: 56 }, st.hadir + '/' + st.total));
  svg.appendChild(hkS('text', { class: 'hk-donat-label', x: 60, y: 76 }, 'HADIR'));
  const ul = hkEl('ul', { class: 'hk-legenda' });
  HK_STATUS.forEach((s) => {
    const n = st[s[0]];
    const li = hkEl('li', { class: 'hk-c-' + s[0] + (n ? '' : ' hk-nol') });
    li.appendChild(hkEl('span', { class: 'hk-warna', 'aria-hidden': 'true' }));
    li.appendChild(hkEl('span', null, s[1] + ' ' + s[2]));
    li.appendChild(hkEl('span', { class: 'hk-jml' }, n + ' · ' + hkPersen(n, st.total) + '%'));
    ul.appendChild(li);
  });
  const wadah = hkEl('div', { class: 'hk-donat' });
  wadah.appendChild(svg);
  wadah.appendChild(ul);
  hkGanti(isi, wadah);
  if (animasi && seg.length) hkRaf(() => seg.forEach((p) => p[0].setAttribute('stroke-dasharray', hkAngka(p[1]) + ' ' + hkAngka(C))));
  hkKet(document.getElementById('hkStatusKet'), [R.adaDeadline
    ? 'Hadir = Tepat Waktu + Terlambat; Absen = Bolos (sama dengan kartu di atas).'
    : 'Jadwal belum ada atau belum termuat — Terlambat dan Bolos belum bisa ditentukan (yang punya poin dihitung Tepat Waktu).']);
}
function hkRentang(i) { return i === 9 ? '90–100' : (i * 10) + '–' + (i * 10 + 9); }
// G2 Sebaran Nilai (histogram 0–100, hanya yang Hadir).
function hkGambarNilai(R, W) {
  const isi = document.getElementById('hkNilaiIsi');
  const ket = document.getElementById('hkNilaiKet');
  if (!isi) return;
  const d = R.dist;
  if (!d.n) { hkKosong(isi, 'Belum ada nilai.'); hkKet(ket, []); return; }
  const H = 170, kiri = 26, atas = 18, bawah = 24;
  const slot = (W - 34) / 10;
  const tinggi = H - atas - bawah;
  const tangga = hkTanggaMurni(Math.max.apply(null, d.keranjang));
  const puncak = tangga[tangga.length - 1];
  const y = (v) => atas + (1 - v / puncak) * tinggi;
  const svg = hkSvg('hkNilaiSvg', W, H, 'Sebaran nilai',
    'Sebaran nilai ' + d.n + ' mahasiswa hadir per rentang 10: ' + d.keranjang.map((k, i) => hkRentang(i) + ' ' + k).join(', ') +
    '. Rata-rata ' + hkFmtMurni(d.rata, 1) + ', median ' + hkFmtMurni(d.median, 1) + '.');
  tangga.forEach((t) => {
    svg.appendChild(hkS('line', { class: 'hk-garis-grid', x1: kiri, x2: W - 8, y1: hkAngka(y(t)), y2: hkAngka(y(t)) }));
    svg.appendChild(hkS('text', { class: 'hk-sumbu', x: 20, y: hkAngka(y(t) + 4), 'text-anchor': 'end' }, t));
  });
  [0, 20, 40, 60, 80, 100].forEach((v) => svg.appendChild(hkS('text', { class: 'hk-sumbu', x: hkAngka(kiri + v / 10 * slot), y: H - 8, 'text-anchor': 'middle' }, v)));
  d.keranjang.forEach((k, i) => {
    const x = kiri + i * slot + slot * 0.14;
    const w = slot * 0.72;
    const h = k / puncak * tinggi;
    const anda = R.saya === i;
    const r = hkS('rect', { class: 'hk-batang' + (anda ? ' hk-anda' : ''), x: hkAngka(x), y: hkAngka(atas + tinggi - h), width: hkAngka(w), height: hkAngka(h), rx: 2 });
    r.style.animationDelay = (i * 40) + 'ms';
    r.appendChild(hkS('title', null, 'Nilai ' + hkRentang(i) + ': ' + k + ' mahasiswa' + (anda ? ' (termasuk Anda)' : '')));
    svg.appendChild(r);
    if (k > 0) svg.appendChild(hkS('text', { class: 'hk-label-batang', x: hkAngka(x + w / 2), y: hkAngka(atas + tinggi - h - 4) }, k));
    if (anda) svg.appendChild(hkS('text', { class: 'hk-label-batang', x: hkAngka(x + w / 2), y: hkAngka(atas + tinggi - h - (k > 0 ? 17 : 4)) }, 'Anda'));
  });
  const xr = kiri + d.rata / 10 * slot;
  const kanan = xr > W / 2;
  svg.appendChild(hkS('line', { class: 'hk-rata', x1: hkAngka(xr), x2: hkAngka(xr), y1: atas - 6, y2: atas + tinggi }));
  svg.appendChild(hkS('text', { class: 'hk-teks-rata', x: hkAngka(kanan ? xr - 5 : xr + 5), y: 10, 'text-anchor': kanan ? 'end' : 'start' }, 'rata-rata ' + hkFmtMurni(d.rata, 1)));
  hkGanti(isi, svg);
  const bag = ['n = ' + d.n + ' hadir · rata-rata ' + hkFmtMurni(d.rata, 1) + ' · median ' + hkFmtMurni(d.median, 1) +
    ' · terendah ' + d.min + ' · tertinggi ' + d.maks + '.'];
  if (d.tanpaNilai) bag.push(d.tanpaNilai + ' mahasiswa tanpa nilai (Belum/Bolos) tidak digambar.');
  hkKet(ket, bag);
}
function hkTanggal(ms) {
  try { return new Date(ms).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' }); } catch (e) {
    const d = new Date(ms + 7 * 3600000);
    return d.getUTCDate() + '/' + (d.getUTCMonth() + 1);
  }
}
// G3 Progres Pengerjaan (kurva kumulatif terhadap jadwal). Waktu hanya dipakai di sini, tidak mengubah status.
function hkGambarWaktu(R, W, kini) {
  const isi = document.getElementById('hkWaktuIsi');
  const ket = document.getElementById('hkWaktuKet');
  if (!isi) return;
  const k = R.kurva;
  const tanya = hkCari(document.getElementById('hkWaktu'), (c) => hkKelas(c, 'hk-tanya'));
  if (tanya) {
    tanya.textContent = k.sumberPertama === 0
      ? 'Kapan nilai mahasiswa terakhir tercatat, dibanding jadwal buka dan deadline?'
      : 'Kapan mahasiswa mulai mengerjakan, dibanding jadwal buka dan deadline?';
  }
  const bag = [];
  if (k.n) {
    bag.push(['Sebelum deadline: ', { b: String(k.sebelum) }, ' dari ' + k.total + ' mahasiswa (' + hkPersen(k.sebelum, k.total) + '%). Sesudah deadline: ' + k.sesudah + '.']);
  }
  if (R.dosen && k.sesudahTepat > 0) {
    bag.push(k.sesudahTepat + ' pengerjaan tercatat sesudah deadline tetapi berstatus Tepat Waktu di tabel (status memakai waktu akses pertama halaman).');
  }
  if (k.hanyaBonus) bag.push(k.hanyaBonus + ' hadir hanya dari keaktifan/forum (tanpa waktu pengerjaan).');
  if (k.tanpaWaktu) bag.push(k.tanpaWaktu + ' tanpa catatan waktu.');
  if (k.terpotong) bag.push(k.terpotong + ' titik di luar batas grafik digambar di tepi kanan.');
  if (k.sumberPertama && !k.sumberAkhir) bag.push('Waktu = pengerjaan pertama tercatat server.');
  else if (!k.sumberPertama && k.sumberAkhir) bag.push('Waktu = perubahan poin terakhir tercatat server (data sebelum pencatatan pengerjaan pertama); bisa bergeser bila nilai dihitung ulang.');
  else if (k.sumberPertama && k.sumberAkhir) bag.push('Waktu: ' + k.sumberPertama + ' pengerjaan pertama, ' + k.sumberAkhir + ' perubahan poin terakhir (data lama).');
  if (!k.ada) { hkKosong(isi, '📅 Jadwal belum ada atau belum termuat.'); hkKet(ket, []); return; }
  if (!k.n) { hkKosong(isi, 'Belum ada pengerjaan.'); hkKet(ket, bag); return; }
  const H = 190, kiri = 34, kanan = 10, atas = 16, bawah = 28;
  const lebar = W - kiri - kanan;
  const tinggi = H - atas - bawah;
  const x = (t) => kiri + (t - k.x0) / (k.x1 - k.x0) * lebar;
  const y = (p) => atas + (1 - p / 100) * tinggi;
  const due = R.dueMs;
  const svg = hkSvg('hkWaktuSvg', W, H, 'Progres pengerjaan',
    'Kurva kumulatif pengerjaan: ' + k.n + ' dari ' + k.total + ' mahasiswa punya waktu tercatat; ' + k.sebelum + ' sebelum deadline, ' + k.sesudah + ' sesudah deadline.');
  const xd = x(due);
  svg.appendChild(hkS('rect', { class: 'hk-zona-telat', x: hkAngka(xd), y: atas, width: hkAngka(Math.max(0, kiri + lebar - xd)), height: tinggi }));
  [0, 50, 100].forEach((p) => {
    svg.appendChild(hkS('line', { class: 'hk-garis-grid', x1: kiri, x2: kiri + lebar, y1: hkAngka(y(p)), y2: hkAngka(y(p)) }));
    svg.appendChild(hkS('text', { class: 'hk-sumbu', x: kiri - 6, y: hkAngka(y(p) + 4), 'text-anchor': 'end' }, p + '%'));
  });
  const HARI = 86400000, WIB = 7 * 3600000;
  const langkah = Math.max(1, Math.ceil(((k.x1 - k.x0) / HARI) / Math.max(1, Math.floor(lebar / 48))));
  for (let t = Math.ceil((k.x0 + WIB) / HARI) * HARI - WIB, i = 0; t <= k.x1; t += HARI, i += 1) {
    if (i % langkah) continue;
    const xt = x(t);
    svg.appendChild(hkS('line', { class: 'hk-garis-grid', x1: hkAngka(xt), x2: hkAngka(xt), y1: atas + tinggi, y2: atas + tinggi + 4 }));
    svg.appendChild(hkS('text', { class: 'hk-sumbu', x: hkAngka(xt), y: H - 8, 'text-anchor': 'middle' }, hkTanggal(t)));
  }
  const xb = x(k.x0);
  svg.appendChild(hkS('line', { class: 'hk-buka', x1: hkAngka(xb), x2: hkAngka(xb), y1: atas, y2: atas + tinggi }));
  svg.appendChild(hkS('text', { class: 'hk-sumbu', x: hkAngka(xb + 3), y: atas - 4, 'text-anchor': 'start' }, 'Buka'));
  svg.appendChild(hkS('line', { class: 'hk-deadline', x1: hkAngka(xd), x2: hkAngka(xd), y1: atas, y2: atas + tinggi }));
  const dKanan = xd > kiri + lebar - 64;
  svg.appendChild(hkS('text', { class: 'hk-teks-deadline', x: hkAngka(dKanan ? xd - 3 : xd + 3), y: atas - 4, 'text-anchor': dKanan ? 'end' : 'start' }, 'Deadline'));
  if (k.sekarangDalam) {
    const xs = x(kini);
    const sKiri = xs - kiri > 64;
    svg.appendChild(hkS('line', { class: 'hk-sekarang', x1: hkAngka(xs), x2: hkAngka(xs), y1: atas, y2: atas + tinggi }));
    svg.appendChild(hkS('text', { class: 'hk-teks-sekarang', x: hkAngka(sKiri ? xs - 4 : xs + 4), y: atas + 11, 'text-anchor': sKiri ? 'end' : 'start' }, 'Sekarang'));
  }
  const terakhir = k.titik[k.titik.length - 1];
  const ujung = Math.min(k.x1, k.sekarangDalam ? Math.max(kini, terakhir.t) : k.x1);
  let jalur = 'M' + hkAngka(x(k.x0)) + ',' + hkAngka(y(0));
  k.titik.forEach((p) => { jalur += 'H' + hkAngka(x(p.t)) + 'V' + hkAngka(y(p.n / k.total * 100)); });
  jalur += 'H' + hkAngka(x(ujung));
  svg.appendChild(hkS('path', { class: 'hk-area', d: jalur + 'V' + hkAngka(y(0)) + 'Z' }));
  const kurva = hkS('path', { class: 'hk-kurva', d: jalur });
  svg.appendChild(kurva);
  const xe = x(ujung), ye = y(k.n / k.total * 100);
  svg.appendChild(hkS('circle', { class: 'hk-titik', cx: hkAngka(xe), cy: hkAngka(ye), r: 3.5 }));
  svg.appendChild(hkS('text', { class: 'hk-label-batang', x: hkAngka(Math.max(kiri + 30, xe - 34)), y: hkAngka(Math.max(10, ye - 8)) },
    k.n + ' (' + hkPersen(k.n, k.total) + '%)'));
  hkGanti(isi, svg);
  try { if (typeof kurva.getTotalLength === 'function') kurva.style.setProperty('--hk-pjg', String(Math.ceil(kurva.getTotalLength()))); } catch (e) { /* kurva tetap terlihat */ }
  hkKet(ket, bag);
}
function hkLabelSoal(q, cfg) {
  const no = Number(String(q.id).replace(/^\D+/, ''));
  if (q.jenis === 'pg') return 'PG ' + no;
  return cfg.tugas ? 'Tugas ' + no : 'C' + no;
}
const HK_BAGIAN_SOAL = [['benar', 'benar', 'Benar'], ['parsial', 'parsial', 'Parsial'], ['salah', 'salah', 'Salah'],
  ['ulang', 'ulang', 'Salah – boleh kirim ulang'], ['belum', 'kosong', 'Belum dicoba']];
function hkBarisSoal(label, x, pen, sulit) {
  const baris = hkEl('div', { class: 'hk-baris-soal' });
  const lab = hkEl('span', null, label);
  if (sulit) lab.appendChild(hkEl('span', { class: 'hk-sulit', title: 'Termasuk 3 soal dengan persentase benar terendah' }, ' ⚠'));
  baris.appendChild(lab);
  const bar = hkEl('div', { class: 'hk-tumpuk' });
  bar.setAttribute('role', 'img');
  bar.setAttribute('aria-label', label + ': ' + HK_BAGIAN_SOAL.filter((b) => x[b[0]] > 0).map((b) => hkPersen(x[b[0]], pen) + '% ' + b[2].toLowerCase()).join(', '));
  HK_BAGIAN_SOAL.forEach((b) => {
    if (!x[b[0]]) return;
    const sp = hkEl('span', { class: 'hk-c-' + b[1], title: b[2] + ': ' + hkPersen(x[b[0]], pen) + '%' });
    sp.style.width = (x[b[0]] / pen * 100) + '%';
    bar.appendChild(sp);
  });
  baris.appendChild(bar);
  baris.appendChild(hkEl('span', { class: 'hk-pct' }, hkPersen(x.benar, pen) + '%'));
  return baris;
}
// G4 Ketuntasan per Jenis Soal: batang per jenis bergerbang; rincian per soal HANYA dosen
// (jawaban modul tetap diterima sesudah deadline).
function hkGambarSoal(R) {
  const isi = document.getElementById('hkSoalIsi');
  const ket = document.getElementById('hkSoalKet');
  if (!isi) return;
  const s = R.soal, cfg = R.cfg, g = R.gerbang;
  const judul = document.getElementById('hkSoalJudul');
  if (judul) {
    const lama = hkCari(judul, (c) => hkKelas(c, 'hk-lencana-dosen'));
    const jarang = ['pg', 'ez', 'hard'].some((j) => s.jenis[j].n && !hkGerbangJenisMurni(s.jenis[j].peserta, false));
    const perlu = R.dosen && g === 'tampil' && (!R.schedExpired || s.peserta < HK_MIN_PESERTA || jarang);
    if (lama && !perlu) lama.parentNode.removeChild(lama);
    if (!lama && perlu) judul.appendChild(hkEl('span', { class: 'hk-lencana-dosen' }, 'tampilan dosen'));
  }
  if (g === 'kosong') { hkKosong(isi, 'Belum ada jawaban tercatat.'); hkKet(ket, []); return; }
  if (g === 'sedikit') {
    hkKosong(isi, '🔒 Ditampilkan bila sedikitnya ' + HK_MIN_PESERTA + ' mahasiswa sudah menjawab (sekarang ' + s.peserta + '), agar tidak mengungkap jawaban perorangan.');
    hkKet(ket, []);
    return;
  }
  if (g === 'tunggu') { hkKosong(isi, '🔒 Tersedia setelah jadwal berakhir.'); hkKet(ket, []); return; }
  const label = {
    pg: 'Pilihan Ganda · ' + cfg.mc,
    ez: cfg.tugas ? 'Tugas 1–' + cfg.ez : 'Komputasi Easy–Medium · ' + cfg.ez,
    hard: cfg.tugas ? 'Tugas ' + (cfg.ez + 1) + '–' + (cfg.ez + cfg.hard) : 'Komputasi Hard · ' + cfg.hard,
  };
  const wadah = hkEl('div');
  let ulang = 0;
  ['pg', 'ez', 'hard'].forEach((j) => {
    const x = s.jenis[j];
    if (!x.n) return;
    if (!hkGerbangJenisMurni(x.peserta, R.dosen)) {
      wadah.appendChild(hkEl('div', { class: 'hk-terkunci' }, '🔒 ' + label[j] + ': kurang dari ' + HK_MIN_PESERTA + ' penjawab'));
      return;
    }
    ulang += x.ulang;
    wadah.appendChild(hkBarisSoal(label[j], x, s.peserta * x.n, false));
  });
  const leg = hkEl('div', { class: 'hk-legenda-baris', 'aria-hidden': 'true' });
  HK_BAGIAN_SOAL.forEach((b) => { if (b[0] !== 'ulang' || ulang) leg.appendChild(hkEl('span', { class: 'hk-c-' + b[1] }, b[2])); });
  wadah.appendChild(leg);
  if (R.rinci) {
    const lamaRinci = hkCari(isi, (c) => hkKelas(c, 'hk-rinci'));
    const det = hkEl('details', { class: 'hk-rinci' });
    if (lamaRinci && lamaRinci.open) det.open = true;
    det.appendChild(hkEl('summary', null, 'Rincian per soal (' + s.soal.length + ')'));
    const terendah = s.soal.map((q, i) => ({ id: q.id, i: i, p: s.peserta ? q.benar / s.peserta : 0 }))
      .filter((q) => q.p < 1).sort((a, b) => (a.p - b.p) || (a.i - b.i)).slice(0, 3).map((q) => q.id);
    s.soal.forEach((q) => det.appendChild(hkBarisSoal(hkLabelSoal(q, cfg), q, s.peserta, terendah.indexOf(q.id) >= 0)));
    wadah.appendChild(det);
  }
  hkGanti(isi, wadah);
  const bag = ['Dari penanda jawaban ' + s.peserta + ' mahasiswa yang sudah menjawab; persentase terhadap ' + s.peserta + ' × jumlah soal. Tanpa nama dan tanpa pilihan jawaban.'];
  if (R.dosen) bag.push('Jawaban modul tetap diterima sesudah deadline; mahasiswa melihat batang per jenis sesudah jadwal berakhir bila sedikitnya ' + HK_MIN_PESERTA + ' mahasiswa menjawab jenis itu, rincian per soal hanya untuk dosen.');
  else bag.push('Rincian per soal hanya untuk dosen.');
  hkKet(ket, bag);
}
// G5 Keaktifan di Kelas per Pertemuan (node keaktifan kursus yang sudah dilanggan halaman).
function hkGambarAktif(R, W) {
  const isi = document.getElementById('hkAktifIsi');
  const ket = document.getElementById('hkAktifKet');
  if (!isi) return;
  const a = R.aktif;
  const bag = [];
  const ini = a.per.find((p) => p.sekarang);
  const nIni = ini ? ini.n : 0;
  if (a.adaData) bag.push('Pertemuan ini: ' + nIni + ' dari ' + a.total + ' mahasiswa (' + hkPersen(nIni, a.total) + '%). +' + hkFmtMurni(R.bonus, 2) + ' poin per centang.');
  if (R.forum) bag.push('💬 Forum diskusi pertemuan ini: ' + R.forum.klaim + ' klaim (' + R.forum.penuh + ' penuh, ' + R.forum.sebagian + ' dengan pengali < 1).');
  if (!a.adaData) {
    hkKosong(isi, "Belum ada centang keaktifan di kursus ini. Dosen mencentang 'Aktif di kelas' di tabel di bawah.");
    hkKet(ket, bag);
    return;
  }
  const H = 150, kiri = 22, kanan = 6, atas = 16, bawah = 22;
  const slot = (W - kiri - kanan) / 14;
  const tinggi = H - atas - bawah;
  const tangga = hkTanggaMurni(Math.max.apply(null, a.per.map((p) => p.n)));
  const puncak = tangga[tangga.length - 1];
  const y = (v) => atas + (1 - v / puncak) * tinggi;
  const svg = hkSvg('hkAktifSvg', W, H, 'Keaktifan di kelas per pertemuan',
    'Jumlah mahasiswa yang dicentang aktif per pertemuan: ' + a.per.map((p) => p.no + ': ' + p.n).join(', ') + '. Pertemuan ini: ' + nIni + '.');
  tangga.forEach((t) => {
    svg.appendChild(hkS('line', { class: 'hk-garis-grid', x1: kiri, x2: W - kanan, y1: hkAngka(y(t)), y2: hkAngka(y(t)) }));
    svg.appendChild(hkS('text', { class: 'hk-sumbu', x: kiri - 5, y: hkAngka(y(t) + 4), 'text-anchor': 'end' }, t));
  });
  a.per.forEach((p, i) => {
    const x = kiri + i * slot + slot * 0.18;
    const w = slot * 0.64;
    const h = p.n / puncak * tinggi;
    const r = hkS('rect', { class: 'hk-batang ' + (p.sekarang ? 'hk-ini' : 'hk-lain'), x: hkAngka(x), y: hkAngka(atas + tinggi - h), width: hkAngka(w), height: hkAngka(h), rx: 2 });
    r.style.animationDelay = (i * 30) + 'ms';
    r.appendChild(hkS('title', null, 'Pertemuan ' + p.no + ': ' + p.n + ' mahasiswa aktif' + (p.sekarang ? ' (pertemuan ini)' : '')));
    svg.appendChild(r);
    if (p.n > 0) svg.appendChild(hkS('text', { class: 'hk-label-batang', x: hkAngka(x + w / 2), y: hkAngka(atas + tinggi - h - 4) }, p.n));
    if (p.sekarang) svg.appendChild(hkS('text', { class: 'hk-label-batang', x: hkAngka(x + w / 2), y: hkAngka(atas + tinggi - h - (p.n > 0 ? 17 : 4)) }, 'ini'));
    svg.appendChild(hkS('text', { class: 'hk-sumbu', x: hkAngka(x + w / 2), y: H - 6, 'text-anchor': 'middle' }, p.no));
  });
  hkGanti(isi, svg);
  hkKet(ket, bag);
}
function hkSubjudul(R, umum) {
  const sub = document.getElementById('hkSub');
  if (!sub) return;
  sub.textContent = umum || (R.st.total + ' mahasiswa · ' + R.st.hadir + ' hadir (' + hkPersen(R.st.hadir, R.st.total) + '%) · ' +
    (R.dist.n ? 'rata-rata nilai ' + hkFmtMurni(R.dist.rata, 1) : 'belum ada nilai'));
}
// Pemeriksaan diri: angka grafik harus sama dengan kartu statistik (dua gambar berturut-turut berbeda = peringatan).
function hkPeriksaDiri(R) {
  if (R.memuat || R.gagal) { HK.beda = 0; return; }
  const baca = (id) => { const el = document.getElementById(id); const t = el ? String(el.textContent).trim() : ''; return /^\d+$/.test(t) ? Number(t) : null; };
  const kartu = [baca('statTotalMhs'), baca('statHadir'), baca('statAbsen')];
  if (kartu.some((x) => x === null)) { HK.beda = 0; return; }
  const grafik = [R.st.total, R.st.hadir, R.st.absen];
  if (kartu.join() === grafik.join()) { HK.beda = 0; return; }
  HK.beda += 1;
  if (HK.beda === 2) console.warn('[HasilKeren] angka grafik beda dengan kartu statistik', { kartu: kartu, grafik: grafik });
}
function hkGambar() {
  const panel = document.getElementById('hkPanel');
  const halaman = document.getElementById('page-hasil');
  const acuan = document.getElementById('hkNilaiIsi');
  if (HK.mati || !panel || !halaman || !acuan || !halaman.classList.contains('active') || !panel.open || acuan.clientWidth < 40) {
    HK.kotor = true;
    return;
  }
  const kini = Date.now();
  const R = hkRingkasan(kini);
  const lebar = { nilai: Math.max(120, hkLebar('hkNilaiIsi')), waktu: Math.max(160, hkLebar('hkWaktuIsi')), aktif: Math.max(120, hkLebar('hkAktifIsi')) };
  const tanda = JSON.stringify(R, hkTanpaBaris) + '|' + lebar.nilai + ',' + lebar.waktu + ',' + lebar.aktif;
  const masuk = HK.masuk && !R.memuat;
  if (tanda === HK.tanda && !masuk) { hkSelaraskanAngka(); return; }
  const animasi = masuk && !HK.diam;
  const umum = R.memuat ? '⏳ Memuat…' : R.gagal ? '⚠ Daftar mahasiswa tidak bisa dimuat' : !R.st.total ? 'Belum ada mahasiswa di daftar' : '';
  const kartu = {
    hkStatus: [umum, R.st.tepat, R.st.terlambat, R.st.belum, R.st.bolos, R.adaDeadline],
    hkNilai: [umum, R.dist, R.saya, lebar.nilai],
    hkWaktu: [umum, R.kurva, R.dueMs, R.dosen, R.menit, lebar.waktu],
    hkSoal: [umum, R.soal, R.cfg, R.gerbang, R.rinci, R.dosen, R.schedExpired],
    hkAktif: [umum, R.aktif, R.forum, R.bonus, lebar.aktif],
  };
  const gambar = {
    hkStatus: () => hkGambarStatus(R, animasi),
    hkNilai: () => hkGambarNilai(R, lebar.nilai),
    hkWaktu: () => hkGambarWaktu(R, lebar.waktu, kini),
    hkSoal: () => hkGambarSoal(R),
    hkAktif: () => hkGambarAktif(R, lebar.aktif),
  };
  // Efek segar hanya bila datanya berubah: garis Sekarang yang maju tiap menit menggambar ulang G3 tanpa efek.
  const efek = { hkWaktu: [umum, R.kurva, R.dueMs, R.dosen, lebar.waktu] };
  const berubah = [];
  Object.keys(kartu).forEach((id) => {
    const t = JSON.stringify(kartu[id], hkTanpaBaris);
    if (!masuk && HK_KARTU[id] === t) return;
    HK_KARTU[id] = t;
    const te = efek[id] ? JSON.stringify(efek[id], hkTanpaBaris) : t;
    if (HK_SEGAR[id] !== te) berubah.push(id);
    HK_SEGAR[id] = te;
    try {
      if (umum) {
        hkKosong(document.getElementById(id + 'Isi'), umum);
        hkKet(document.getElementById(id + 'Ket'), []);
      } else gambar[id]();
    } catch (e) {
      HK_KARTU[id] = '';
      hkGagal(e);
      hkKosong(document.getElementById(id + 'Isi'), '⚠ Grafik tidak bisa digambar.');
    }
  });
  hkSubjudul(R, umum);
  HK.tanda = tanda;
  HK.kotor = false;
  if (masuk) {
    HK.masuk = false;
    if (animasi) hkKelasMasuk(panel);
  } else if (!HK.diam) berubah.forEach((id) => hkSegar(document.getElementById(id)));
  hkSelaraskanAngka();
  HK.gambar += 1;
  panel.setAttribute('data-hk-gambar', String(HK.gambar));
  hkPeriksaDiri(R);
}
// Satu-satunya kode tingkat atas: seluruh tubuh di dalam try; galat apa pun memulihkan tampilan asli
// tanpa menghentikan sisa skrip modul (login, tabel, penilaian, chat).
(function hkMulai() {
  try {
    const panel = document.getElementById('hkPanel');
    const halaman = document.getElementById('page-hasil');
    if (!panel || !halaman) return;
    HK.diam = hkDiam(); hkDengarDiam();
    hkHiasIkon();
    hkPasangAngka();
    const id = (x) => document.getElementById(x);
    if (typeof MutationObserver === 'function') {
      const amati = (el, opsi, fn) => {
        if (!el) return;
        const o = new MutationObserver(hkAman(fn));
        o.observe(el, opsi);
        HK_PENGAMAT.push(o);
      };
      // Dibuat sesudah pengamat tabel milik blok keaktifan: lencana/sakelar sudah terpasang saat teks baris dibaca.
      const tbody = id('visitorTableBody');
      HK.baris = hkPetaBaris();
      amati(tbody, { childList: true }, () => {
        const peta = hkPetaBaris();
        if (HK.masukDaftar) hkKelasMasuk(tbody);
        else {
          tbody.classList.remove('hk-masuk');
          if (HK.aktif && !HK.diam) {
            const ubah = hkUbahBarisMurni(HK.baris, peta);
            hkBarisTabel().forEach((r) => {
              if (ubah.indexOf(r.getAttribute('data-nim')) < 0) return;
              r.classList.add('hk-baru');
              setTimeout(hkAman(() => r.classList.remove('hk-baru')), 1500);
            });
          }
        }
        HK.baris = peta;
        hkJadwalkan(false);
      });
      ['rajinList', 'santaiList', 'aktifList'].forEach((x) => {
        const el = id(x);
        amati(el, { childList: true }, () => {
          if (HK.masukDaftar) hkKelasMasuk(el);
          else {
            el.classList.remove('hk-masuk');
            // 🥇 baru (papan ditulis ulang tiap render) melanjutkan fase jam dinding, tidak tersentak ke posisi diam.
            const medali = x === 'rajinList' ? hkSpanPertama(el.firstElementChild) : null;
            if (medali) medali.style.animationDelay = (-(Date.now() % 2800)) + 'ms';
          }
          if (x === 'aktifList') hkJadwalkan(false);
        });
      });
      amati(halaman, { attributes: true, attributeFilter: ['class'] }, () => {
        const aktif = halaman.classList.contains('active');
        if (aktif && !HK.aktif) hkBukaTab();
        else if (!aktif && HK.aktif) HK.aktif = false;
      });
    }
    panel.addEventListener('toggle', hkAman(() => { if (panel.open) { HK.masuk = true; hkJadwalkan(true); } }));
    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(hkAman(() => {
        const w = Math.round(panel.clientWidth || 0);
        if (Math.abs(w - HK.lebar) >= 8) { HK.lebar = w; hkJadwalkan(true); }
      }));
      ro.observe(panel);
      HK_PENGAMAT.push(ro);
    }
    if (typeof IntersectionObserver === 'function') {
      const papan = id('leaderboardPanel');
      // Yang diamati kisi papan (🏆/🔥/🙋) saja: #hkPanel juga anak #leaderboardPanel, jadi seluruh papan tetap
      // "terlihat" selama grafik dibaca walau 🔥 dan 🥇 sudah jauh di atas layar.
      const kisi = papan && papan.firstElementChild;
      if (kisi && kisi.id !== 'hkPanel') {
        const io = new IntersectionObserver(hkAman((isi) => { isi.forEach((e) => papan.classList.toggle('hk-jeda', !e.isIntersecting)); }));
        io.observe(kisi);
        HK_PENGAMAT.push(io);
      }
    }
    if (_auth && typeof _auth.onAuthStateChanged === 'function') _auth.onAuthStateChanged(hkAman(() => { HK.baris = hkPetaBaris(); hkJadwalkan(true); }));
    panel.hidden = false;
    if (halaman.classList.contains('active')) hkBukaTab();
  } catch (e) {
    try { console.warn('[HasilKeren] dimatikan:', e); hkPulihkan(); } catch (e2) { /* diam */ }
  }
})();
// HASIL-KEREN:DATA END v1
`;

export const RX_CSS = /<style id="hasil-keren-style">\/\* HASIL-KEREN:CSS v\d+[\s\S]*?<\/style>\n/;
export const RX_PANEL = / {6}<!-- HASIL-KEREN:PANEL BEGIN v\d+[^\n]*\n[\s\S]*? {6}<!-- HASIL-KEREN:PANEL END v\d+ -->\n/;
export const RX_DATA = /\/\/ HASIL-KEREN:DATA BEGIN v\d+[^\n]*\n[\s\S]*?\/\/ HASIL-KEREN:DATA END v\d+\n/;
const ANKER_PANEL = /(Jumlah Absen<\/div>\n {8}<\/div>\n {6}<\/div>\n)( {4}<\/div>\n {4}<div style="display:flex;padding:14px 24px;)/;
const ANKER_DATA = /\/\/ FORUM-POIN:DATA END v\d+\n/;
// Toleran versi KEAKTIFAN-KELAS (v5+; 13 Okt 2026): blok ini membaca _keaktifanKursus/_keaktifanTotal
// (dijaga DEPENDENSI_SKRIP), bukan tampilan papan, jadi DATA v6 (pil bonus pertemuan ini) tidak mengubahnya.
const RX_KEAKTIFAN_FORUM = /\/\/ KEAKTIFAN-KELAS:DATA END v\d+\n\/\/ FORUM-POIN:DATA BEGIN v4/g;
const FORUM_HK = "// FORUM-POIN:DATA END v4\n// HASIL-KEREN:DATA BEGIN v1";
export const DEPENDENSI = [
  "let latestVisitors=[];", "function renderVisitors(visitors){", "// SAMAKAN-ABSEN-HASIL BEGIN v2", "const KEAKTIFAN_KURSUS = '",
  "function forumAturanAktif() {", "let masterFetchDone", "let _visitorsDiterima = false;", "const _auth = getAuth(app);",
  'id="visitorTableBody"', 'id="statHadir"', 'id="rajinList"', 'id="aktifList"', 'id="page-hasil"',
];
// Harus berada di skrip modul yang sama dengan blok DATA (dibaca sebagai identifier bebas).
const DEPENDENSI_SKRIP = ["let latestVisitors=[];", "function renderVisitors(visitors){", "function isLate(", "let currentSchedule",
  "let masterStudents", "let _keaktifanKursus", "let _forumModul", "const MODULE_ID = ", "const isSimulasiNim = ", "function _keaktifanTotal("];
export const PENANDA = ["HASIL-KEREN:CSS v1", "HASIL-KEREN:PANEL BEGIN v1", "HASIL-KEREN:PANEL END v1", "HASIL-KEREN:DATA BEGIN v1",
  "HASIL-KEREN:DATA END v1", "HASIL-KEREN:MURNI BEGIN", "HASIL-KEREN:MURNI END", 'id="hkPanel"'];
// Isi blok identik di setiap halaman: tanpa literal kursus/nomor modul (generator TTL/CAD mengganti token itu
// dan melaporkan sisa "Modul 1 "/"Pertemuan 1 "), tanpa token yang dihitung validator lain, tanpa penanda
// penyuntik lain, dan (DATA) tanpa sintaks lebih baru dari skrip modul (\p{}, lookbehind/named group, ?., ??, ||=, &&=, 1_000, .#privat, static {}).
export const LARANGAN_BLOK = [
  "math4", "getaran_mekanik", "optoauto", "pemodelan_cad", "sistem_kendali_cerdas", "teknik_tenaga_listrik",
  "Modul 1 ", "Pertemuan 1 ", "Tugas 1 ", "pertemuan-1", "</script", "updateLeaderboard", 'class="hero"', "anim-panel", "code-wrap",
  "data-tab=", "function renderVisitors(visitors){", "SAMAKAN-ABSEN-HASIL", "KEAKTIFAN-KELAS:", "FORUM-POIN:", "RAPIKAN-PONSEL",
  "LEADERBOARD-MODUL-SEKALI", "_scheduleExpired", "window._forumRingkasEkspor(",
];
export const RX_LARANGAN_DATA = /latestVisitors\s*=/;
export const RX_SINTAKS_BARU = /\\[pP]\{|\(\?<|\?\.(?!\d)|\?\?|\|\|=|&&=|\b\d+_\d|\.#[A-Za-z_$]|\bstatic\s*\{/;

const hitung = (s, sub) => s.split(sub).length - 1;
const hitungRx = (s, rx) => (s.match(new RegExp(rx.source, "g")) || []).length;

/** Masalah isi blok (kosong = sesuai). Dipakai pasang() dan validator. */
export function periksaIsiBlok(css = CSS, panel = PANEL, data = DATA) {
  const masalah = [];
  for (const [nama, isi] of [["CSS", css], ["PANEL", panel], ["DATA", data]]) {
    for (const t of LARANGAN_BLOK) if (isi.includes(t)) masalah.push(`blok ${nama} memuat token terlarang ${JSON.stringify(t)}`);
    if (isi.includes("\r")) masalah.push(`blok ${nama} memuat CR`);
  }
  if (RX_LARANGAN_DATA.test(data)) masalah.push("blok DATA memuat penugasan latestVisitors");
  const sintaks = data.match(RX_SINTAKS_BARU);
  if (sintaks) masalah.push(`blok DATA memakai sintaks lebih baru dari skrip modul: ${JSON.stringify(sintaks[0])}`);
  return masalah;
}
let isiBlokSah = null;

export function semuaHalaman() {
  const h = [];
  for (const k of KURSUS) for (let n = 1; n <= 14; n += 1) h.push(`${k}/Modul/Modul-${n}.html`);
  return h;
}

/** Isi <script> yang memuat indeks i. */
function skripPemuat(html, i) {
  const a = html.lastIndexOf("<script", i);
  const z = html.indexOf("</script>", i);
  if (a < 0 || z < 0 || html.lastIndexOf("</script>", i) > a) throw new Error("blok DATA tidak berada di dalam <script>");
  return html.slice(a, z);
}

function buang(html, rx, nama) {
  const n = hitungRx(html, rx);
  if (n > 1) throw new Error(`blok HASIL-KEREN ${nama} ganda (${n}x)`);
  return n ? html.replace(rx, "") : html;
}

/** Cabut ketiga blok (rollback / halaman di luar HALAMAN). */
export function cabut(html) {
  let h = html;
  h = buang(h, RX_CSS, "CSS");
  h = buang(h, RX_PANEL, "PANEL");
  h = buang(h, RX_DATA, "DATA");
  return h;
}

function pasangSekali(html, rel) {
  if (html.includes("\r")) throw new Error("berkas memuat CR");
  for (const dep of DEPENDENSI) if (!html.includes(dep)) throw new Error(`dependensi tidak ditemukan: ${dep}`);
  let h = html;
  // 1. CSS: diganti di tempat bila sudah ada di <head>; selain itu disisip sebelum </head> dokumen.
  {
    const n = hitungRx(h, RX_CSS);
    if (n > 1) throw new Error(`blok HASIL-KEREN CSS ganda (${n}x)`);
    const kepala = h.indexOf("</head>");
    const badan = h.indexOf("<body");
    if (!(kepala > 0 && badan > kepala)) throw new Error("</head> dokumen tidak ditemukan sebelum <body>");
    const ada = n === 1 ? h.search(RX_CSS) : -1;
    if (ada >= 0 && ada < kepala) h = h.replace(RX_CSS, () => CSS + "\n");
    else {
      if (ada >= 0) h = h.replace(RX_CSS, "");
      const i = h.indexOf("</head>");
      const sebelum = h.slice(0, i);
      if (hitung(sebelum, "<script") !== hitung(sebelum, "</script>")) throw new Error("</head> pertama berada di dalam <script>");
      h = sebelum + CSS + "\n" + h.slice(i);
    }
  }
  // 2. PANEL: anak terakhir #leaderboardPanel (sesudah kisi statistik, sebelum penutup panel).
  h = buang(h, RX_PANEL, "PANEL");
  {
    const n = hitungRx(h, ANKER_PANEL);
    if (n !== 1) throw new Error(`jangkar PANEL (penutup kisi statistik + kepala tabel) muncul ${n}x, harusnya 1`);
    h = h.replace(ANKER_PANEL, (_, a, b) => a + PANEL + b);
  }
  // 3. DATA: tepat sesudah FORUM-POIN:DATA END, di skrip modul yang sama dengan latestVisitors.
  h = buang(h, RX_DATA, "DATA");
  {
    const m = h.match(ANKER_DATA);
    if (!m || hitungRx(h, ANKER_DATA) !== 1) throw new Error("FORUM-POIN:DATA END tidak ditemukan tepat sekali (jalankan forum-poin.mjs dulu)");
    const j = h.indexOf(m[0]) + m[0].length;
    h = h.slice(0, j) + DATA + h.slice(j);
    const skrip = skripPemuat(h, j);
    if (!/^<script type="module">/.test(skrip)) throw new Error("blok DATA tidak berada di <script type=\"module\">");
    for (const dep of DEPENDENSI_SKRIP) if (!skrip.includes(dep)) throw new Error(`skrip modul tempat blok DATA tidak memuat ${dep}`);
    const iAuth = h.indexOf("const _auth = getAuth(app);");
    if (iAuth < 0 || iAuth > j) throw new Error("_auth harus dideklarasikan sebelum blok DATA");
  }
  // 4. Pascasyarat.
  for (const t of PENANDA) if (hitung(h, t) !== 1) throw new Error(`penanda ${t} muncul ${hitung(h, t)}x, harusnya 1`);
  if ((h.match(/updateLeaderboard\(/g) || []).length !== 2) throw new Error("updateLeaderboard( harus tepat 2x");
  if (hitungRx(h, RX_KEAKTIFAN_FORUM) !== 1) throw new Error("pasangan KEAKTIFAN-KELAS END v5+ / FORUM-POIN BEGIN v4 harus berdampingan tepat sekali");
  if (hitung(h, FORUM_HK) !== 1) throw new Error("blok HASIL-KEREN:DATA harus tepat sesudah FORUM-POIN:DATA END v4");
  return h;
}

/** Hasil pemasangan pada teks halaman `rel` (murni; dipakai juga oleh validator). Idempoten. */
export function pasang(html, rel) {
  if (isiBlokSah === null) isiBlokSah = periksaIsiBlok();
  if (isiBlokSah.length) throw new Error(`isi blok HASIL-KEREN ditolak: ${isiBlokSah.join("; ")}`);
  const h = pasangSekali(html, rel);
  if (pasangSekali(h, rel) !== h) throw new Error("pasang tidak idempoten");
  return h;
}

/**
 * Masalah blok HASIL-KEREN pada teks halaman `rel` (kosong = sesuai). `harusAda` default: rel di HALAMAN.
 * Halaman berblok: penanda tepat sekali, isi sama byte demi byte, CSS di <head>, PANEL di antara kisi
 * statistik dan kepala tabel, DATA tepat sesudah FORUM-POIN di skrip modul yang sama, pasang() tidak mengubah apa pun.
 */
export function periksaHasilKeren(html, rel, harusAda = HALAMAN.includes(rel)) {
  if (!harusAda) {
    return ["HASIL-KEREN", "hasil-keren-style", 'id="hkPanel"'].filter((t) => html.includes(t))
      .map((t) => `memuat ${t} padahal bukan halaman HALAMAN (jalankan node scripts/hasil-keren.mjs)`);
  }
  const masalah = [];
  for (const t of PENANDA) if (hitung(html, t) !== 1) masalah.push(`penanda ${t} muncul ${hitung(html, t)}x, harusnya 1`);
  if (!html.includes(CSS + "\n")) masalah.push("isi blok CSS berbeda dari scripts/hasil-keren.mjs");
  if (!html.includes(PANEL)) masalah.push("isi blok PANEL berbeda dari scripts/hasil-keren.mjs");
  if (!html.includes(DATA)) masalah.push("isi blok DATA berbeda dari scripts/hasil-keren.mjs");
  const kepala = html.indexOf("</head>"), badan = html.indexOf("<body"), css = html.indexOf('<style id="hasil-keren-style">');
  if (!(css > 0 && kepala > css && badan > kepala)) masalah.push("CSS harus di <head> dokumen (sebelum </head> yang mendahului <body>)");
  const panel = html.indexOf("<!-- HASIL-KEREN:PANEL BEGIN"), absen = html.indexOf('id="statAbsen"'), no = html.indexOf('<div style="width:44px;flex-shrink:0;">No</div>');
  if (!(panel > absen && no > panel && absen > 0)) masalah.push("PANEL harus di antara #statAbsen dan kepala tabel");
  if (hitung(html, FORUM_HK) !== 1) masalah.push("blok DATA harus tepat sesudah FORUM-POIN:DATA END v4");
  const iData = html.indexOf("// HASIL-KEREN:DATA BEGIN");
  try {
    if (iData < 0 || !skripPemuat(html, iData).includes("let latestVisitors=[];")) masalah.push("blok DATA harus di skrip modul yang sama dengan latestVisitors");
  } catch (e) { masalah.push(e.message); }
  if ((html.match(/updateLeaderboard\(/g) || []).length !== 2) masalah.push("updateLeaderboard( harus tepat 2x");
  if (!masalah.length) {
    try { if (pasang(html, rel) !== html) masalah.push("halaman belum mutakhir (jalankan node scripts/hasil-keren.mjs)"); } catch (e) { masalah.push(e.message); }
  }
  return masalah;
}

const RX_CHAT = /<!-- AI-CHAT-AGENT:BEGIN[\s\S]*?<!-- AI-CHAT-AGENT:END[^>]*-->/g;

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const periksa = process.argv.includes("--periksa");
  const ujiJangkar = process.argv.includes("--uji-jangkar");
  const halaman = semuaHalaman();
  if (halaman.length !== 84) throw new Error(`harap 84 halaman modul, ditemukan ${halaman.length}`);
  for (const rel of HALAMAN) if (!halaman.includes(rel)) throw new Error(`HALAMAN memuat ${rel} yang bukan halaman modul`);
  const baca = (rel) => {
    const berkas = path.join(root, rel);
    if (!fs.existsSync(berkas)) throw new Error(`Berkas tidak ada: ${rel}`);
    return fs.readFileSync(berkas, "utf8");
  };
  if (ujiJangkar) {
    const gagal = [];
    let siap = 0;
    for (const rel of halaman) {
      try {
        const h = pasang(baca(rel), rel);
        const m = periksaHasilKeren(h, rel, true);
        if (m.length) gagal.push(`${rel}: ${m.join("; ")}`); else siap += 1;
      } catch (e) { gagal.push(`${rel}: ${e.message}`); }
    }
    console.log(`${siap}/${halaman.length} jangkar siap (HASIL-KEREN v${VERSI}; uji di memori, tidak menulis)`);
    if (gagal.length) { for (const g of gagal) console.error(g); process.exit(1); }
  } else {
    const tulis = [];
    for (const rel of halaman) {
      const lama = baca(rel);
      let baru;
      try {
        baru = HALAMAN.includes(rel) ? pasang(lama, rel) : cabut(lama);
        const m = periksaHasilKeren(baru, rel);
        if (m.length) throw new Error(m.join("; "));
      } catch (e) { throw new Error(`${rel}: ${e.message}`); }
      if ((lama.match(RX_CHAT) || []).join("\n") !== (baru.match(RX_CHAT) || []).join("\n")) throw new Error(`${rel}: blok AI-CHAT-AGENT berubah`);
      if (baru !== lama) tulis.push([rel, baru]);
    }
    // Semua halaman lolos di memori; baru sekarang ditulis.
    if (!periksa) for (const [rel, isi] of tulis) fs.writeFileSync(path.join(root, rel), isi);
    console.log(`${tulis.length} dari ${halaman.length} halaman ${periksa ? "akan berubah" : "diperbarui"} (HASIL-KEREN v${VERSI}; aktif di ${HALAMAN.length} halaman)`);
    if (periksa && tulis.length) process.exit(1);
  }
}
