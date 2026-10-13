/**
 * Hasil Keren — ikon bergerak + lima grafik agregat kelas di tab Hasil halaman modul
 * (permintaan dosen 13 Okt 2026; spesifikasi terkoreksi v1; v2 13 Okt 2026: G5 = tren kelas per pertemuan).
 *
 * DATA YANG DIPAKAI (tidak ada penulisan Firebase, tidak ada langganan baru):
 *   latestVisitors (sesudah pipa keaktifan + forum), _visitorsMentah (rekaman mentah pertemuan ini = poin
 *   tugas tanpa bonus), masterStudents (roster), currentSchedule (jadwal ternormalisasi), MODULE_ID, DB_PATH,
 *   _keaktifanTotal(), _visitorsDiterima, _auth (gerbang tampilan dosen). Definisi status/Hadir/Absen = tabel
 *   Hasil + blok SAMAKAN-ABSEN-HASIL v2. Nama mahasiswa tidak pernah ditampilkan di grafik.
 *   Satu-satunya akses Firebase (hkTrenBaca, G5): node publik visitors/<kursus>/<segmen> dan
 *   settings/<kursus>/<pertemuan>/schedule pertemuan LAIN dibaca SEKALI (get, cadangan onValue onlyOnce) saat panel
 *   pertama kali digambar dengan tab Hasil aktif, di-cache, dimuat ulang paling cepat 10 menit sekali; galat baca
 *   satu pertemuan = pertemuan itu "tidak termuat" (data lama yang sudah termuat dipertahankan).
 *   Kolom tren = Modul 1-14 = Pertemuan 1-7 dan 9-15 (pertemuan 8 = UTS, tidak punya node visitors); segmen node
 *   visitors = awalan MODULE_ID + nomor pertemuan (kursus "pertemuan-N") atau nomor modul (Matematika 4 "modul-N").
 *   Pertemuan yang jadwalnya belum berakhir = "sedang berlangsung": batang digambar redup, tidak ikut rata-rata.
 *
 * v3 (13 Okt 2026, permintaan dosen "ikon judul papan sedikit lebih besar, setiap ikon bisa bergerak, desain lebih keren"):
 *   ikon judul papan/kartu grafik ±1,4× dalam lencana bercahaya; ke-18 .hk-ikon punya animasi SIAGA tak berujung
 *   (@keyframes hkSiaga*, 3–7 dtk, fase gerak singkat lalu diam, delay berbeda; 🗑 Reset tetap hanya saat hover), juga
 *   🥇🥈🥉 dan 🔥 daftar Keaktifan (fase jam dinding --hk-fase agar tidak tersentak saat papan ditulis ulang); dijeda per
 *   bagian di luar layar (kisi papan, kisi statistik, panel grafik, kepala seksi, kartu jadwal, banner dosen); kartu kaca bergradien + bingkai gradien, angka
 *   statistik gradien, kilau sekali saat tab dibuka, header tabel tegas, cahaya kiri baris menurut status. Semua lewat
 *   CSS + kelas runtime; markup halaman tidak diedit; semua gerak mati di prefers-reduced-motion.
 *   Review v3: warna tabel diganti lewat :where(#visitorTableBody) (hover bawaan baris tetap menang), NIM Keaktifan
 *   dicerahkan, pil status sebaris hanya > 640 px, lencana kepala papan sejajar ikon saat judul membungkus, halo 👥.
 *
 * YANG DIPASANG (tiga blok bertanda v3, isi identik di setiap halaman):
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
 *   (mahasiswa: sesudah jadwal berakhir dan >= 5 penjawab; rincian per soal hanya dosen), G5 tren kelas
 *   per pertemuan (% hadir + rata-rata nilai tugas P1–P7, P9–P15; 13 Okt 2026 menggantikan grafik keaktifan, yang
 *   sudah ada di papan Keaktifan di Kelas). Animasi masuk hanya saat tab dibuka; pembaruan data hanya menyorot
 *   baris yang berubah.
 *   Animasi siaga tak berujung (v3: semua ikon) dijeda per bagian di luar layar; semua mati di
 *   prefers-reduced-motion (juga .ff/.pulse-dot hero tab Hasil, kilau ::after, angkat hover).
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

export const VERSI = 3;
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

export const CSS = String.raw`<style id="hasil-keren-style">/* HASIL-KEREN:CSS v3 — dipasang scripts/hasil-keren.mjs (ikon bergerak + desain + grafik kelas tab Hasil) */
@keyframes hkMuncul{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes hkPop{0%{opacity:0;transform:scale(.3)}60%{opacity:1;transform:scale(1.2)}100%{opacity:1;transform:scale(1)}}
@keyframes hkSentil{0%,100%{transform:scale(1) rotate(0)}40%{transform:scale(1.14) rotate(-4deg)}70%{transform:scale(.97) rotate(2deg)}}
@keyframes hkAyun{0%,100%{transform:rotate(0)}20%{transform:rotate(-16deg)}40%{transform:rotate(12deg)}60%{transform:rotate(-7deg)}80%{transform:rotate(3deg)}}
@keyframes hkLambai{0%,60%,100%{transform:rotate(0)}10%,30%{transform:rotate(16deg)}20%,40%{transform:rotate(-8deg)}}
@keyframes hkLompat{0%,100%{transform:translateY(0)}30%{transform:translateY(-7px)}50%{transform:translateY(0)}70%{transform:translateY(-3px)}}
@keyframes hkDenyut{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
@keyframes hkGoyang{0%,100%{transform:rotate(0)}20%,60%{transform:rotate(-11deg)}40%,80%{transform:rotate(11deg)}}
@keyframes hkBalik{0%{opacity:0;transform:perspective(160px) rotateX(-90deg)}60%{opacity:1;transform:perspective(160px) rotateX(14deg)}100%{opacity:1;transform:none}}
@keyframes hkNaik{0%,100%{scale:1}45%{scale:1.32}}
@keyframes hkKilauLintas{from{transform:translateX(0) skewX(-18deg)}to{transform:translateX(420%) skewX(-18deg)}}
@keyframes hkTumbuhY{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes hkTumbuhX{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes hkPudar{from{opacity:0}to{opacity:1}}
@keyframes hkSegar{from{opacity:.4}to{opacity:1}}
@keyframes hkSorot{from{opacity:1}to{opacity:0}}
@keyframes hkGores{from{stroke-dashoffset:var(--hk-pjg)}to{stroke-dashoffset:0}}
@keyframes hkSiagaTrofi{0%,32%,100%{transform:rotate(0)}6%{transform:rotate(-14deg)}12%{transform:rotate(11deg)}18%{transform:rotate(-7deg)}24%{transform:rotate(3deg)}}
@keyframes hkSiagaKilau{0%,30%,56%,100%{opacity:0;transform:scale(.2) rotate(0)}40%{opacity:1;transform:scale(1) rotate(45deg)}48%{opacity:.6;transform:scale(.7) rotate(80deg)}}
@keyframes hkSiagaApi{0%,40%,100%{opacity:1;transform:none}6%{transform:scale(1.14,1.08) translateY(-1px)}12%{opacity:.82;transform:scale(.96,1.04)}18%{opacity:1;transform:translateY(-2px) scale(1.1,1.18)}26%{opacity:.9;transform:scale(.98)}34%{opacity:1;transform:scale(1.04)}}
@keyframes hkSiagaLambai{0%,30%,100%{transform:rotate(0)}5%,15%{transform:rotate(18deg)}10%,20%{transform:rotate(-8deg)}25%{transform:rotate(6deg)}}
@keyframes hkSiagaAngguk{0%,28%,100%{transform:translateY(0)}7%{transform:translateY(-4px)}14%{transform:translateY(0)}21%{transform:translateY(-2px)}}
@keyframes hkSiagaDenyut{0%,26%,100%{transform:scale(1)}7%{transform:scale(1.18)}14%{transform:scale(.95)}20%{transform:scale(1.07)}}
@keyframes hkSiagaGeleng{0%,18%,100%{transform:rotate(0)}3%,9%{transform:rotate(-10deg)}6%,12%{transform:rotate(10deg)}15%{transform:rotate(-4deg)}}
@keyframes hkSiagaBalik{0%{transform:perspective(160px) rotateX(0)}14%,100%{transform:perspective(160px) rotateX(-360deg)}}
@keyframes hkSiagaSasaran{0%,30%,100%{transform:scale(1) rotate(0)}8%{transform:scale(1.18) rotate(-12deg)}16%{transform:scale(.95) rotate(6deg)}23%{transform:scale(1.05) rotate(0)}}
@keyframes hkSiagaPantul{0%,32%,100%{transform:scale(1)}6%{transform:scale(1.08,.78)}13%{transform:translateY(-2px) scale(.94,1.22)}20%{transform:scale(1.04,.92)}26%{transform:scale(1)}}
@keyframes hkSiagaDetak{0%,34%,100%{transform:rotate(0)}3%,8%{transform:rotate(12deg)}11%,16%{transform:rotate(-12deg)}19%,24%{transform:rotate(12deg)}27%,31%{transform:rotate(-4deg)}}
@keyframes hkSiagaGoyang{0%,28%,100%{transform:rotate(0) translate(0,0)}6%{transform:rotate(-10deg) translate(-1px,-1px)}12%{transform:rotate(8deg) translate(1px,0)}18%{transform:rotate(-5deg)}23%{transform:rotate(2deg)}}
@keyframes hkSiagaNaik{0%,30%,100%{transform:translateY(0) rotate(0)}8%{transform:translateY(-4px) rotate(-6deg)}16%{transform:translateY(1px) rotate(0)}23%{transform:translateY(-2px) rotate(-2deg)}}
@keyframes hkSiagaAwas{0%,30%,100%{transform:scale(1)}6%,18%{transform:scale(1.16)}12%,24%{transform:scale(1)}}
@keyframes hkSiagaJam{0%{transform:rotate(0)}18%,100%{transform:rotate(360deg)}}
@keyframes hkSiagaMedali{0%,36%,100%{transform:translateY(0) rotate(0)}9%{transform:translateY(-3px) rotate(-10deg)}18%{transform:translateY(0) rotate(6deg)}27%{transform:rotate(-2deg)}}
@keyframes hkSiagaNyala{0%,40%,100%{opacity:1;transform:none}8%{transform:scale(1.12,1.18) translateY(-1px)}16%{opacity:.8;transform:scale(.95,1.02)}24%{opacity:1;transform:scale(1.06,1.12)}32%{transform:scale(1)}}
.hk-ikon{display:inline-block;transform-origin:50% 60%;backface-visibility:hidden;transition:scale .3s cubic-bezier(.34,1.56,.64,1)}
div.hk-ikon{display:block}
.hk-sr{position:absolute!important;width:1px!important;height:1px!important;margin:-1px!important;padding:0!important;border:0!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important;white-space:nowrap!important}
.hk-angka{font-variant-numeric:tabular-nums}
.hk-i-tab{--hk-gerak:hkSiagaPantul 3.6s ease-in-out 1s infinite,hkLompat .7s ease-out backwards}
.hk-i-aktivitas{--hk-gerak:hkSiagaAngguk 4.2s ease-in-out 2.1s infinite,hkLompat .8s ease-out .3s 2 backwards}
.hk-i-kalender{--hk-gerak:hkSiagaBalik 6.4s ease-in-out 1.4s infinite,hkBalik .7s cubic-bezier(.2,.8,.2,1) .25s backwards}
.hk-i-peringatan{--hk-gerak:hkSiagaAwas 3.6s ease-in-out 3.4s infinite,hkDenyut 1s ease-in-out .3s 3 backwards}
.hk-i-jam{--hk-gerak:hkSiagaJam 6s ease-in-out 1.5s infinite}
.hk-i-trofi{--hk-gerak:hkSiagaTrofi 5s ease-in-out 2.8s infinite,hkAyun 1.1s ease-in-out .45s 2 backwards}
.hk-i-api{--hk-gerak:hkSiagaApi 3.4s ease-in-out .7s infinite}
.hk-i-tangan{--hk-gerak:hkSiagaLambai 4.6s ease-in-out 3.5s infinite,hkLambai 1.4s ease-in-out .55s 2 backwards}
.hk-i-mhs{--hk-gerak:hkSiagaAngguk 4.2s ease-in-out 1.45s infinite,hkLompat .8s ease-out .5s 1 backwards}
.hk-i-hadir{--hk-gerak:hkSiagaDenyut 3.8s ease-in-out 3.6s infinite,hkDenyut .9s ease-in-out .6s 3 backwards}
.hk-i-absen{--hk-gerak:hkSiagaGeleng 5.6s ease-in-out 1.6s infinite,hkGoyang .6s ease-in-out .7s 1 backwards}
.hk-i-grafik{--hk-gerak:hkSiagaNaik 4.8s ease-in-out 1.2s infinite}
.hk-i-sasaran{--hk-gerak:hkSiagaSasaran 4.4s ease-in-out 1.9s infinite}
.hk-i-batang{--hk-gerak:hkSiagaPantul 3.6s ease-in-out 2.4s infinite}
.hk-i-waktu{--hk-gerak:hkSiagaDetak 5s ease-out 2.9s infinite}
.hk-i-kepingan{--hk-gerak:hkSiagaGoyang 5.2s ease-in-out 3.2s infinite}
.hk-i-tren{--hk-gerak:hkSiagaNaik 4.8s ease-in-out 3.8s infinite}
.hk-i-tab,.hk-i-batang{transform-origin:50% 100%}
.hk-i-trofi,.hk-i-api{transform-origin:50% 90%}
.hk-i-tangan{transform-origin:25% 90%}
.hk-i-jam,.hk-i-sasaran{transform-origin:50% 50%}
.hk-i-kalender{backface-visibility:visible}
#tab-hasil.active .hk-ikon,#tab-hasil:hover .hk-ikon,#tab-hasil:focus-visible .hk-ikon{animation:var(--hk-gerak,none)}
#page-hasil.active .hk-ikon{animation:var(--hk-gerak,none)}
#page-hasil.active .hk-ikon.hk-naik{animation:var(--hk-gerak,none),hkNaik .55s ease-out}
#page-hasil.active .hk-panel.hk-masuk .hk-judul .hk-ikon,#page-hasil.active .hk-panel.hk-masuk>summary .hk-ikon{animation:var(--hk-gerak,none),hkPop .5s cubic-bezier(.2,.8,.2,1) .45s backwards}
#page-hasil #resetBtnHasil:hover .hk-ikon,#page-hasil #resetBtnHasil:focus-visible .hk-ikon{animation:hkGoyang .5s ease-in-out 1}
.hk-i-trofi{position:relative}
.hk-i-trofi::after{content:"";position:absolute;top:-.14em;right:-.22em;width:.62em;height:.62em;border-radius:50%;background:radial-gradient(circle,#fff 0 14%,rgba(254,240,138,.85) 26%,rgba(253,224,71,0) 64%);opacity:0;pointer-events:none}
#page-hasil.active .hk-ikon.hk-i-trofi::after{animation:hkSiagaKilau 5s ease-in-out 2.8s infinite}
#leaderboardPanel>div:first-child>div:hover .hk-ikon,#leaderboardPanel>div:nth-child(2)>div:hover .hk-ikon,.hk-kartu:hover .hk-judul .hk-ikon,.hk-panel>summary:hover .hk-ikon,#rajinList>div:hover>span:first-child,#aktifList .ka-baris:hover .ka-ikon{scale:1.18}
.hk-jeda .hk-ikon,.hk-jeda .hk-ikon::after,.hk-jeda #rajinList>div>span:first-child,.hk-jeda .ka-ikon,.hk-jeda>div::after{animation-play-state:paused!important}
#page-hasil.active #leaderboardPanel>div:first-child>div,#page-hasil.active #leaderboardPanel>div:nth-child(2)>div,#page-hasil.active .hk-panel{animation:hkMuncul .5s cubic-bezier(.2,.8,.2,1) both}
#page-hasil.active #leaderboardPanel>div:first-child>div:nth-child(2){animation-delay:.07s}
#page-hasil.active #leaderboardPanel>div:first-child>div:nth-child(3){animation-delay:.14s}
#page-hasil.active #leaderboardPanel>div:nth-child(2)>div:nth-child(1){animation-delay:.2s}
#page-hasil.active #leaderboardPanel>div:nth-child(2)>div:nth-child(2){animation-delay:.26s}
#page-hasil.active #leaderboardPanel>div:nth-child(2)>div:nth-child(3){animation-delay:.32s}
#page-hasil.active .hk-panel{animation-delay:.38s}
#leaderboardPanel>div:first-child>div:nth-child(1){--hk-a:251,191,36}
#leaderboardPanel>div:first-child>div:nth-child(2){--hk-a:249,115,22}
#leaderboardPanel>div:first-child>div:nth-child(3){--hk-a:236,72,153}
#leaderboardPanel>div:nth-child(2)>div:nth-child(1){--hk-a:56,189,248}
#leaderboardPanel>div:nth-child(2)>div:nth-child(2){--hk-a:0,224,158}
#leaderboardPanel>div:nth-child(2)>div:nth-child(3){--hk-a:239,68,68}
#scheduleInfo{--hk-a:168,85,247}
#leaderboardPanel>div:first-child>div,#scheduleInfo{background:radial-gradient(130% 100% at 100% 0%,rgba(var(--hk-a),.17),rgba(var(--hk-a),0) 58%) padding-box,linear-gradient(165deg,rgba(255,255,255,.055),rgba(255,255,255,.012) 42%,rgba(255,255,255,0)) padding-box,linear-gradient(#111a2a,#0d1524) padding-box,linear-gradient(135deg,rgba(var(--hk-a),.75),rgba(148,163,184,.16) 40%,rgba(148,163,184,.09) 65%,rgba(139,92,246,.55)) border-box!important;border-color:transparent!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 12px 28px -16px rgba(0,0,0,.8),0 0 26px -14px rgba(var(--hk-a),.55);transition:box-shadow .35s ease,translate .35s cubic-bezier(.2,.8,.2,1)}
#leaderboardPanel>div:nth-child(2)>div{background:radial-gradient(circle at 50% 32px,rgba(var(--hk-a),.32),rgba(var(--hk-a),0) 46px) padding-box,linear-gradient(90deg,rgba(var(--hk-a),0),rgba(var(--hk-a),.95),rgba(var(--hk-a),0)) center bottom/100% 2px no-repeat padding-box,linear-gradient(165deg,rgba(255,255,255,.05),rgba(255,255,255,.01) 45%,rgba(255,255,255,0)) padding-box,linear-gradient(#111a2a,#0d1524) padding-box,linear-gradient(150deg,rgba(var(--hk-a),.7),rgba(148,163,184,.14) 45%,rgba(148,163,184,.08) 70%,rgba(var(--hk-a),.35)) border-box!important;border-color:transparent!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 12px 28px -16px rgba(0,0,0,.8),0 0 26px -14px rgba(var(--hk-a),.55);transition:box-shadow .35s ease,translate .35s cubic-bezier(.2,.8,.2,1)}
#leaderboardPanel>div:first-child>div:hover,#leaderboardPanel>div:nth-child(2)>div:hover,.hk-kartu:hover{translate:0 -2px;box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 18px 34px -16px rgba(0,0,0,.85),0 0 30px -8px rgba(var(--hk-a),.55)}
#leaderboardPanel>div:nth-child(2)>div::after{content:"";position:absolute;top:0;bottom:0;left:-50%;width:40%;background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.16) 50%,rgba(255,255,255,0));transform:skewX(-18deg);pointer-events:none}
#page-hasil.active #leaderboardPanel>div:nth-child(2)>div::after{animation:hkKilauLintas 1.2s cubic-bezier(.4,0,.2,1) .7s 1 both}
#page-hasil.active #leaderboardPanel>div:nth-child(2)>div:nth-child(2)::after{animation-delay:.85s}
#page-hasil.active #leaderboardPanel>div:nth-child(2)>div:nth-child(3)::after{animation-delay:1s}
#leaderboardPanel>div:nth-child(2) .hk-ikon{font-size:1.7rem!important;line-height:1.3}
@supports ((-webkit-background-clip:text) or (background-clip:text)){
#statTotalMhs,#statHadir,#statAbsen,#leaderboardPanel .hk-angka{background-image:linear-gradient(180deg,#fff 6%,currentColor 78%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
#leaderboardPanel .hk-kepala-teks{background:linear-gradient(90deg,#fef3c7,#fbbf24 55%,#f59e0b);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
#leaderboardPanel>div:first-child>div:nth-child(2) .hk-kepala-teks{background-image:linear-gradient(90deg,#fed7aa,#fb923c 50%,#f97316)}
.hk-judul-seksi{background:linear-gradient(90deg,#fff 0%,#e0f7ff 38%,#67e8f9 72%,#c4b5fd);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.hk-panel-judul{background:linear-gradient(90deg,#67e8f9,#a78bfa);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
}
#leaderboardPanel .hk-angka{filter:drop-shadow(0 0 10px rgba(var(--hk-a),.35))}
#leaderboardPanel .hk-kepala{position:relative;display:flex;align-items:flex-start;gap:10px;min-height:32px}
#leaderboardPanel .hk-kepala>:not(.hk-ikon){align-self:center}
#leaderboardPanel .hk-kepala::before{content:"";position:absolute;left:0;top:0;width:32px;height:32px;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.16),rgba(var(--hk-a),.24) 48%,rgba(var(--hk-a),.08) 76%);box-shadow:0 0 0 1px rgba(var(--hk-a),.55),0 0 18px -2px rgba(var(--hk-a),.6);pointer-events:none}
#leaderboardPanel .hk-kepala>.hk-ikon{position:relative;z-index:1;flex:0 0 32px;height:32px;display:inline-flex;align-items:center;justify-content:center;font-size:1.4em;line-height:1;letter-spacing:0}
.kartu-aktif .ka-judul.hk-ka-judul{background:none;-webkit-background-clip:border-box;background-clip:border-box;color:#f9a8d4}
.kartu-aktif .ka-judul .hk-ka-teks{background:linear-gradient(90deg,#fb923c,#f472b6,#a78bfa);-webkit-background-clip:text;background-clip:text;color:transparent}
#page-hasil .hk-pil{background:linear-gradient(90deg,rgba(255,255,255,.07),rgba(139,92,246,.12)) padding-box,linear-gradient(#0f1726,#0f1726) padding-box,linear-gradient(90deg,currentColor,#a78bfa 55%,#ec4899) border-box!important;border-color:transparent!important;box-shadow:0 0 18px -6px currentColor,inset 0 1px 0 rgba(255,255,255,.06)}
#page-hasil .hk-pil .hk-ikon{font-size:1.25em;letter-spacing:0}
.hk-i-mhs,.hk-i-aktivitas{filter:drop-shadow(0 0 1px rgba(255,255,255,.75)) drop-shadow(0 0 7px rgba(var(--hk-a,6,214,160),.6))}
.hk-judul-seksi{width:fit-content;max-width:100%;filter:drop-shadow(0 0 16px rgba(34,211,238,.22))}
.hk-judul-seksi::after{content:"";display:block;width:72px;height:3px;margin-top:10px;border-radius:3px;background:linear-gradient(90deg,#22d3ee,#8b5cf6,#ec4899)}
#page-hasil h1.hero-title{text-shadow:0 0 26px rgba(34,211,238,.28),0 0 64px rgba(139,92,246,.25)}
#scheduleInfo>.hk-ikon{filter:drop-shadow(0 0 8px rgba(168,85,247,.5))}
#scheduleInfo>div>div:first-child{filter:brightness(1.3)}
.hk-kartu-tabel{background:radial-gradient(90% 50% at 0% 0%,rgba(34,211,238,.09),rgba(34,211,238,0) 60%) padding-box,radial-gradient(70% 40% at 100% 0%,rgba(139,92,246,.1),rgba(139,92,246,0) 60%) padding-box,linear-gradient(#141e2f,#0e1625) padding-box,linear-gradient(160deg,rgba(34,211,238,.45),rgba(148,163,184,.12) 30%,rgba(148,163,184,.08) 70%,rgba(139,92,246,.45)) border-box!important;border-color:transparent!important;box-shadow:0 24px 60px -30px rgba(0,0,0,.85),0 0 44px -26px rgba(34,211,238,.45)}
#leaderboardPanel+div{background:linear-gradient(180deg,#1c2739,#141e2f)!important;color:#a3b3c9!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),inset 0 -1px 0 rgba(34,211,238,.22)}
#rajinList div[style*="color:#64748b"],#santaiList div[style*="color:#64748b"],#aktifList div[style*="color:#64748b"],#rajinList>span,#santaiList>span,#aktifList>span{color:#8f9db3!important}
#visitorTableBody{scrollbar-width:thin;scrollbar-color:rgba(34,211,238,.35) transparent}
:where(#visitorTableBody) [style*="color:#64748b"]{color:#8391a7!important}
:where(#visitorTableBody) [style*="color:#475569"]{color:#7b8aa0!important}
#visitorTableBody .vt-row{transition:background .3s,border-color .3s,box-shadow .3s}
#visitorTableBody .vt-row.hk-st-tepat{--hk-st:0,224,158}
#visitorTableBody .vt-row.hk-st-terlambat{--hk-st:251,113,133}
#visitorTableBody .vt-row.hk-st-belum{--hk-st:148,163,184}
#visitorTableBody .vt-row.hk-st-bolos{--hk-st:239,68,68}
#visitorTableBody .vt-row[class*="hk-st-"]:hover{border-left-color:rgb(var(--hk-st));box-shadow:inset 140px 0 80px -80px rgba(var(--hk-st),.24),inset 0 1px 0 rgba(255,255,255,.03)}
#visitorTableBody .vt-status>span{border-radius:999px!important;letter-spacing:.02em;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 2px 8px -4px rgba(0,0,0,.6)}
@media (min-width:641px){#visitorTableBody .vt-status>span{white-space:nowrap}}
#rajinList>div>span:first-child{display:inline-block;transition:scale .3s cubic-bezier(.34,1.56,.64,1)}
#aktifList .ka-ikon{display:inline-block;transform-origin:50% 90%;transition:scale .3s cubic-bezier(.34,1.56,.64,1)}
#rajinList>div>span:first-child{animation:hkSiagaMedali 4.8s ease-in-out var(--hk-fase,.6s) infinite}
#rajinList>div:nth-child(2)>span:first-child{animation-delay:var(--hk-fase,1s)}
#rajinList>div:nth-child(3)>span:first-child{animation-delay:var(--hk-fase,1.4s)}
#aktifList .ka-ikon{animation:hkSiagaNyala 3.4s ease-in-out var(--hk-fase,.9s) infinite}
#rajinList.hk-masuk>div>span:first-child{animation:hkSiagaMedali 4.8s ease-in-out var(--hk-fase,.6s) infinite,hkPop .5s cubic-bezier(.2,.8,.2,1) backwards}
#aktifList.hk-masuk .ka-ikon{animation:hkSiagaNyala 3.4s ease-in-out var(--hk-fase,.9s) infinite,hkPop .5s cubic-bezier(.2,.8,.2,1) backwards}
#santaiList.hk-masuk>div>span:first-child{animation:hkPop .5s cubic-bezier(.2,.8,.2,1) both}
#rajinList.hk-masuk>div:nth-child(2)>span:first-child,#aktifList.hk-masuk .ka-baris:nth-child(2) .ka-ikon{animation-delay:var(--hk-fase,1s),.1s}
#rajinList.hk-masuk>div:nth-child(3)>span:first-child,#aktifList.hk-masuk .ka-baris:nth-child(n+3) .ka-ikon{animation-delay:var(--hk-fase,1.4s),.2s}
#santaiList.hk-masuk>div:nth-child(2)>span:first-child{animation-delay:.1s}
#santaiList.hk-masuk>div:nth-child(3)>span:first-child{animation-delay:.2s}
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
.hk-panel[hidden]{display:none!important}
.hk-panel{--hk-a:34,211,238;margin:0 20px 16px;border:1px solid transparent;border-radius:18px;background:radial-gradient(120% 60% at 0% 0%,rgba(34,211,238,.08),rgba(34,211,238,0) 55%) padding-box,linear-gradient(#111a2a,#0d1524) padding-box,linear-gradient(150deg,rgba(34,211,238,.55),rgba(148,163,184,.14) 35%,rgba(148,163,184,.08) 70%,rgba(139,92,246,.5)) border-box;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 18px 40px -24px rgba(0,0,0,.8)}
.hk-panel>summary{position:relative;list-style:none;display:flex;align-items:center;gap:4px 10px;flex-wrap:wrap;padding:14px 40px 14px 16px;cursor:pointer;font-size:.72rem;font-weight:700;color:#38bdf8;text-transform:uppercase;letter-spacing:.1em;border-radius:18px;background:linear-gradient(90deg,rgba(34,211,238,.6),rgba(139,92,246,.45) 50%,rgba(236,72,153,0)) left bottom/100% 1px no-repeat}
.hk-panel:not([open])>summary{background-size:0 0}
.hk-panel>summary::-webkit-details-marker{display:none}
.hk-panel>summary::before{content:"";position:absolute;left:16px;top:14px;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.15),rgba(34,211,238,.22) 48%,rgba(34,211,238,.07) 76%);box-shadow:0 0 0 1px rgba(34,211,238,.5),0 0 16px -2px rgba(34,211,238,.55);pointer-events:none}
.hk-panel>summary>.hk-ikon{position:relative;z-index:1;flex:0 0 30px;height:30px;display:inline-flex;align-items:center;justify-content:center;font-size:1.4em;line-height:1;letter-spacing:0}
.hk-panel>summary::after{content:"▾";position:absolute;right:16px;top:19px;color:#94a3b8;transition:transform .25s}
.hk-panel:not([open])>summary::after{transform:rotate(-90deg)}
.hk-panel>summary:focus-visible{outline:2px solid #38bdf8;outline-offset:2px}
.hk-panel-judul{color:#67e8f9}
.hk-sub{font-weight:600;text-transform:none;letter-spacing:0;color:#94a3b8;font-size:.78rem}
.hk-kisi{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:12px}
#hkStatus{--hk-a:244,114,182}
#hkNilai{--hk-a:56,189,248}
#hkWaktu{--hk-a:251,191,36}
#hkSoal{--hk-a:167,139,250}
#hkTren{--hk-a:6,214,160}
.hk-kartu{margin:0;min-width:0;border:1px solid transparent;border-radius:14px;padding:12px 14px;background:radial-gradient(110% 70% at 100% 0%,rgba(var(--hk-a),.12),rgba(var(--hk-a),0) 60%) padding-box,linear-gradient(165deg,rgba(255,255,255,.045),rgba(255,255,255,.01) 45%,rgba(255,255,255,0)) padding-box,linear-gradient(#141d2e,#101827) padding-box,linear-gradient(140deg,rgba(var(--hk-a),.6),rgba(148,163,184,.14) 40%,rgba(148,163,184,.08) 70%,rgba(var(--hk-a),.3)) border-box;box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 10px 24px -16px rgba(0,0,0,.8);transition:box-shadow .35s ease,translate .35s cubic-bezier(.2,.8,.2,1)}
.hk-lebar{grid-column:1/-1}
.hk-judul{position:relative;display:flex;align-items:center;gap:10px;min-height:28px;font-size:.7rem;font-weight:700;color:#e2e8f0;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
.hk-judul::before{content:"";position:absolute;left:0;top:0;width:28px;height:28px;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.15),rgba(var(--hk-a),.22) 48%,rgba(var(--hk-a),.07) 76%);box-shadow:0 0 0 1px rgba(var(--hk-a),.5),0 0 14px -2px rgba(var(--hk-a),.5);pointer-events:none}
.hk-judul{flex-wrap:wrap}
.hk-judul>.hk-ikon{position:relative;z-index:1;flex:0 0 28px;height:28px;display:inline-flex;align-items:center;justify-content:center;font-size:1.4em;line-height:1;letter-spacing:0}
.hk-tanya{margin:0 0 8px;font-size:.72rem;color:#9aa8bd}
.hk-isi{position:relative;min-height:120px}
.hk-isi svg{display:block;width:100%;height:auto;overflow:visible}
.hk-kosong{display:flex;align-items:center;justify-content:center;min-height:120px;text-align:center;font-size:.8rem;color:#94a3b8;padding:8px}
.hk-ket{margin:8px 0 0;font-size:.72rem;line-height:1.5;color:#9aa8bd}
.hk-ket b{color:#e2e8f0}
.hk-c-tepat{--hk:#00e09e}.hk-c-terlambat{--hk:#fb7185}.hk-c-belum{--hk:#94a3b8}.hk-c-bolos{--hk:#ef4444}
.hk-c-benar{--hk:#00e09e}.hk-c-parsial{--hk:#fbbf24}.hk-c-salah{--hk:#fb7185}.hk-c-ulang{--hk:#a78bfa}.hk-c-kosong{--hk:#64748b}
.hk-donat{display:flex;align-items:center;gap:16px}
.hk-donat svg{width:132px;flex-shrink:0}
.hk-cincin{fill:none;stroke:#26324a;stroke-width:14}
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
.hk-garis-grid{stroke:#26324a;stroke-width:1}
.hk-batang{fill:#38bdf8}
.hk-batang.hk-anda{fill:#00e09e}
.hk-batang.hk-ini{fill:#f472b6}
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
.hk-kena{fill:transparent}
.hk-kolom:hover .hk-kena{fill:rgba(148,163,184,.1)}
.hk-tren-garis{fill:none;stroke:#fbbf24;stroke-width:2;stroke-linejoin:round;pointer-events:none}
.hk-tren-titik{fill:#fbbf24;stroke:#0f172a;stroke-width:1.5;pointer-events:none}
.hk-batang.hk-berlangsung{fill-opacity:.4;stroke:#38bdf8;stroke-width:1;stroke-dasharray:3 2}
.hk-batang.hk-ini.hk-berlangsung{stroke:#f472b6}
.hk-tren-titik.hk-berlangsung{fill:#0f172a;stroke:#fbbf24}
.hk-tren-kosong{fill:#64748b}
.hk-tren-gagal{fill:#fb7185;font-size:13px;font-weight:800;text-anchor:middle}
.hk-sumbu-ini{fill:#f9a8d4;font-weight:700}
.hk-c-hadir{--hk:#38bdf8}.hk-c-ini{--hk:#f472b6}.hk-c-nilai{--hk:#fbbf24}.hk-c-jalan{--hk:rgba(56,189,248,.4)}
.hk-legenda-baris .hk-c-nilai::before{border-radius:50%}
.hk-baris-soal{display:grid;grid-template-columns:minmax(0,9.5em) minmax(0,1fr) 3.2em;align-items:center;gap:8px;margin:6px 0;font-size:.76rem;color:#cbd5e1}
.hk-tumpuk{display:flex;height:12px;border-radius:6px;overflow:hidden;background:#26324a}
.hk-tumpuk>span{display:block;height:100%;background:var(--hk)}
.hk-pct{text-align:right;font-family:'JetBrains Mono',monospace;font-weight:700;color:#e2e8f0}
.hk-legenda-baris{display:flex;flex-wrap:wrap;gap:6px 12px;margin-top:6px;font-size:.7rem;color:#9aa8bd}
.hk-legenda-baris span::before{content:"";display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px;vertical-align:-1px;background:var(--hk)}
.hk-rinci{margin-top:8px}
.hk-rinci>summary{cursor:pointer;font-size:.74rem;color:#38bdf8}
.hk-rinci .hk-baris-soal{grid-template-columns:4.6em minmax(0,1fr) 3.2em;margin:4px 0}
.hk-rinci .hk-tumpuk{height:8px}
.hk-terkunci{margin:6px 0;font-size:.76rem;color:#94a3b8}
.hk-sulit{color:#fbbf24}
.hk-lencana-dosen{display:inline-block;margin-left:auto;padding:1px 8px;border-radius:999px;font-size:.68rem;color:#bae6fd;background:rgba(56,189,248,.14);text-transform:none;letter-spacing:0}
.hk-panel.hk-masuk .hk-batang{transform-box:fill-box;transform-origin:50% 100%;animation:hkTumbuhY .6s cubic-bezier(.2,.8,.2,1) both}
.hk-panel.hk-masuk .hk-tumpuk{transform-origin:0 50%;animation:hkTumbuhX .7s cubic-bezier(.2,.8,.2,1) both}
.hk-panel.hk-masuk .hk-kurva{stroke-dasharray:var(--hk-pjg);animation:hkGores 1.1s ease-out .15s both}
.hk-panel.hk-masuk .hk-area{animation:hkPudar .8s ease-out .5s both}
.hk-panel.hk-masuk .hk-tren-garis,.hk-panel.hk-masuk .hk-tren-titik{animation:hkPudar .8s ease-out .45s both}
.hk-panel .hk-segar{animation:hkSegar .35s ease-out}
@media (max-width:640px){
.hk-panel{margin:0 12px 12px}
.hk-kisi{grid-template-columns:minmax(0,1fr);gap:10px;padding:10px 8px 8px}
.hk-kartu{padding:12px}
.hk-donat{flex-direction:column;align-items:stretch}
.hk-donat svg{width:120px;margin:0 auto}
.hk-baris-soal,.hk-rinci .hk-baris-soal{grid-template-columns:minmax(0,1fr) 3.2em}
.hk-baris-soal>.hk-tumpuk{grid-column:1/-1;grid-row:2}
#leaderboardPanel .hk-kepala{min-height:28px}
#leaderboardPanel .hk-kepala::before{width:28px;height:28px}
#leaderboardPanel .hk-kepala>.hk-ikon{flex-basis:28px;height:28px}
.hk-sub{flex-basis:100%;padding-left:40px}
#leaderboardPanel>div:nth-child(2) .hk-ikon{font-size:1.5rem!important}
#leaderboardPanel>div:nth-child(2)>div>div:last-child{letter-spacing:.04em!important}
}
@media (prefers-reduced-motion:reduce){
#tab-hasil .hk-ikon,#page-hasil .hk-ikon,#page-hasil .hk-ikon::after,#page-hasil.active #leaderboardPanel>div:first-child>div,#page-hasil.active #leaderboardPanel>div:nth-child(2)>div,#leaderboardPanel>div:nth-child(2)>div::after,#page-hasil.active .hk-panel,#rajinList>div>span:first-child,#santaiList>div>span:first-child,#aktifList .ka-ikon,#visitorTableBody .vt-row,#visitorTableBody .vt-status>span,#page-hasil .pulse-dot,.hk-panel,.hk-panel *{animation:none!important}
#page-hasil .float-formulas,#visitorTableBody .vt-row.hk-baru::after,#page-hasil .hk-ikon::after,#leaderboardPanel>div:nth-child(2)>div::after{display:none!important}
#leaderboardPanel>div>div,#scheduleInfo,.hk-kartu,#tab-hasil .hk-ikon,#page-hasil .hk-ikon,#rajinList>div>span:first-child,#aktifList .ka-ikon,#visitorTableBody .vt-row{transition:none!important;translate:none!important;scale:none!important}
.hk-panel *,.hk-panel>summary::after{transition:none!important}
}
</style>`;

export const PANEL = String.raw`      <!-- HASIL-KEREN:PANEL BEGIN v3 — dipasang scripts/hasil-keren.mjs -->
      <details class="hk-panel" id="hkPanel" open hidden>
        <summary><span class="hk-ikon hk-i-grafik" aria-hidden="true">📈</span><span class="hk-panel-judul">Statistik Kelas</span><span class="hk-sub" id="hkSub">⏳ Memuat…</span></summary>
        <div class="hk-kisi">
          <figure class="hk-kartu" id="hkStatus" aria-labelledby="hkStatusJudul">
            <figcaption class="hk-judul" id="hkStatusJudul"><span class="hk-ikon hk-i-sasaran" aria-hidden="true">🎯</span>Status Kehadiran</figcaption>
            <p class="hk-tanya">Berapa yang sudah mengerjakan, terlambat, belum, atau bolos?</p>
            <div class="hk-isi" id="hkStatusIsi"><div class="hk-kosong">⏳ Memuat…</div></div>
            <p class="hk-ket" id="hkStatusKet"></p>
          </figure>
          <figure class="hk-kartu" id="hkNilai" aria-labelledby="hkNilaiJudul">
            <figcaption class="hk-judul" id="hkNilaiJudul"><span class="hk-ikon hk-i-batang" aria-hidden="true">📊</span>Sebaran Nilai</figcaption>
            <p class="hk-tanya">Bagaimana nilai kelas tersebar (0–100)?</p>
            <div class="hk-isi" id="hkNilaiIsi"><div class="hk-kosong">⏳ Memuat…</div></div>
            <p class="hk-ket" id="hkNilaiKet"></p>
          </figure>
          <figure class="hk-kartu hk-lebar" id="hkWaktu" aria-labelledby="hkWaktuJudul">
            <figcaption class="hk-judul" id="hkWaktuJudul"><span class="hk-ikon hk-i-waktu" aria-hidden="true">⏱️</span>Progres Pengerjaan</figcaption>
            <p class="hk-tanya">Kapan mahasiswa mengerjakan, dibanding jadwal buka dan deadline?</p>
            <div class="hk-isi" id="hkWaktuIsi"><div class="hk-kosong">⏳ Memuat…</div></div>
            <p class="hk-ket" id="hkWaktuKet"></p>
          </figure>
          <figure class="hk-kartu" id="hkSoal" aria-labelledby="hkSoalJudul">
            <figcaption class="hk-judul" id="hkSoalJudul"><span class="hk-ikon hk-i-kepingan" aria-hidden="true">🧩</span>Ketuntasan per Jenis Soal</figcaption>
            <p class="hk-tanya">Bagian mana yang paling banyak dijawab benar?</p>
            <div class="hk-isi" id="hkSoalIsi"><div class="hk-kosong">⏳ Memuat…</div></div>
            <p class="hk-ket" id="hkSoalKet"></p>
          </figure>
          <figure class="hk-kartu" id="hkTren" aria-labelledby="hkTrenJudul">
            <figcaption class="hk-judul" id="hkTrenJudul"><span class="hk-ikon hk-i-tren" aria-hidden="true">📈</span>Tren Kelas per Pertemuan</figcaption>
            <p class="hk-tanya">Bagaimana kehadiran dan nilai kelas dari pertemuan ke pertemuan?</p>
            <div class="hk-isi" id="hkTrenIsi"><div class="hk-kosong">⏳ Memuat…</div></div>
            <p class="hk-ket" id="hkTrenKet"></p>
          </figure>
        </div>
      </details>
      <!-- HASIL-KEREN:PANEL END v3 -->
`;

export const DATA = String.raw`// HASIL-KEREN:DATA BEGIN v3 — dipasang scripts/hasil-keren.mjs
// Statistik Kelas tab Hasil: ikon bergerak + lima grafik agregat (SVG/HTML buatan sendiri, tanpa pustaka).
// v3: kelas desain (kepala papan, pil, judul seksi, kartu tabel, status baris), fase ikon daftar, jeda per bagian.
// Angka = aturan tabel Hasil + statistik Hadir/Absen (status yang sama); nama tidak pernah ditampilkan;
// tidak menulis Firebase dan tidak berlangganan node baru. Satu-satunya akses Firebase: hkTrenBaca (G5) membaca
// SEKALI node publik visitors + jadwal pertemuan lain kursus ini (cache, paling cepat 10 menit sekali dimuat ulang).
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
// Kolom tren = 14 modul: Modul 1–7 = Pertemuan 1–7, Modul 8–14 = Pertemuan 9–15 (pertemuan 8 = UTS).
function hkTrenPertemuanMurni(slot) { return slot <= 7 ? slot : slot + 1; }
// Jalur 14 kolom tren, diturunkan dari DB_PATH (= <akar><MODULE_ID>), MODULE_ID (<awalan><nomor>), SCHEDULE_PATH
// (= <akarJadwal><PERTEMUAN>/schedule) dan PERTEMUAN (<awalanJadwal><nomor pertemuan>). Segmen visitors: awalan
// MODULE_ID + nomor pertemuan bila awalannya sama dengan PERTEMUAN (kursus "pertemuan-N": tanpa pertemuan 8),
// selain itu + nomor modul (Matematika 4 "modul-N"). Hasil { ini: kolom halaman ini (1–14), kolom: [{ slot, no,
// visitors, jadwal }] }; null bila bentuknya lain atau MODULE_ID/PERTEMUAN tidak cocok dengan satu kolom.
function hkTrenJalurMurni(dbPath, modulId, jadwalPath, pertemuanId) {
  const p = String(dbPath || ''), id = String(modulId || ''), jp = String(jadwalPath || ''), pid = String(pertemuanId || '');
  const m = /^(.*?)(\d+)$/.exec(id), mp = /^(.*?)(\d+)$/.exec(pid);
  if (!m || !m[1] || !mp || !mp[1] || p.length <= id.length || p.slice(p.length - id.length) !== id) return null;
  const ekor = pid + '/schedule';
  if (jp.length <= ekor.length || jp.slice(jp.length - ekor.length) !== ekor) return null;
  const akar = p.slice(0, p.length - id.length), akarJadwal = jp.slice(0, jp.length - ekor.length);
  const ikutPertemuan = m[1] === mp[1];
  const kolom = [];
  let ini = null;
  for (let slot = 1; slot <= 14; slot += 1) {
    const no = hkTrenPertemuanMurni(slot);
    const seg = m[1] + (ikutPertemuan ? no : slot);
    if (seg === id) ini = slot;
    kolom.push({ slot: slot, no: no, visitors: akar + seg, jadwal: akarJadwal + mp[1] + no + '/schedule' });
  }
  if (ini === null || kolom[ini - 1].no !== Number(mp[2])) return null;
  return { ini: ini, kolom: kolom };
}
// Jadwal mentah settings/.../schedule -> { mulai, akhir } (ms; NaN bila tidak ada), aturan _normalizeModuleScheduleWib:
// due "YYYY-MM-DDTHH:mm" (WIB) menang atas end; mulai = due - duration hari bila duration > 0.
function hkTrenJadwalMurni(s) {
  const j = (s && typeof s === 'object') ? s : {};
  const due = /^(\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d)$/.exec(String(j.due || ''));
  const akhir = due ? Date.parse(due[1] + ':00+07:00') : hkMsIsoMurni(j.end);
  const durasi = Number(j.duration);
  const mulai = (due && Number.isFinite(durasi) && durasi > 0) ? akhir - durasi * 86400000 : hkMsIsoMurni(j.start);
  return { mulai: mulai, akhir: akhir };
}
// Tren kelas per kolom 1–14 (label = nomor pertemuan). peta[slot] = { baca: 'ok', data: node visitors (objek/larik/
// null), jadwal: node schedule mentah/ternormalisasi atau null }, { baca: 'gagal' }, atau tidak ada (masih memuat).
// Hadir = mahasiswa daftar (bukan simulasi) yang punya rekaman non-dosen/non-tamu dengan poin TUGAS mentah > 0 (tanpa
// bonus keaktifan/forum, jadi bisa lebih kecil dari kartu Kehadiran). Nilai = round(poin/total*100) dari poin tugas
// mentah agar sebanding antarpertemuan; rekaman ganda: poin terbesar.
// status: 'ada' (selesai, sedikitnya satu rekaman mahasiswa daftar), 'berlangsung' (jadwal belum berakhir pada kini
// dan sudah ada rekaman atau sudah dibuka; angka sementara, tidak ikut rata-rata/terendah), 'kosong' (belum
// berlangsung), 'gagal', 'memuat'. Jadwal tidak diketahui = dianggap selesai bila ada rekaman.
function hkTrenMurni(peta, roster, isSim, total, ini, kini) {
  const dalam = new Set((roster || []).filter((s) => s && !isSim(s.nim)).map((s) => String(s.nim)));
  const r = dalam.size;
  const tot = Number(total) > 0 ? Number(total) : 50;
  const sekarang = Number(kini);
  const per = [];
  for (let slot = 1; slot <= 14; slot += 1) {
    const e = (peta || {})[slot];
    const x = { slot: slot, no: hkTrenPertemuanMurni(slot), ini: slot === ini, status: 'memuat', hadir: 0, roster: r, pct: null, rata: null };
    per.push(x);
    if (!e) continue;
    if (e.baca !== 'ok') { x.status = 'gagal'; continue; }
    const jd = hkTrenJadwalMurni(e.jadwal);
    const jalan = Number.isFinite(sekarang) && Number.isFinite(jd.akhir) && jd.akhir > sekarang;
    const d = e.data;
    const daftar = Array.isArray(d) ? d : (d && typeof d === 'object') ? Object.keys(d).map((k) => d[k]) : [];
    const poin = Object.create(null);
    for (const v of daftar) {
      if (!v || typeof v !== 'object' || v.role === 'dosen' || v.role === 'guest') continue;
      const nim = String(v.nim);
      if (isSim(nim) || !dalam.has(nim)) continue;
      const p = Number(v.points) || 0;
      if (!(nim in poin) || p > poin[nim]) poin[nim] = p;
    }
    const nims = Object.keys(poin);
    if (!nims.length && !(jalan && Number.isFinite(jd.mulai) && jd.mulai <= sekarang)) { x.status = 'kosong'; continue; }
    const nilai = nims.filter((n) => poin[n] > 0).map((n) => Math.max(0, Math.min(100, Math.round(poin[n] / tot * 100))));
    x.status = jalan ? 'berlangsung' : 'ada';
    x.hadir = nilai.length;
    x.pct = r ? x.hadir / r * 100 : 0;
    x.rata = nilai.length ? nilai.reduce((a, b) => a + b, 0) / nilai.length : null;
  }
  const ada = per.filter((x) => x.status === 'ada');
  const bernilai = ada.filter((x) => x.rata !== null);
  let terendah = null;
  ada.forEach((x) => { if (!terendah || x.pct < terendah.pct) terendah = x; });
  return { per: per, roster: r, berdata: ada.length, berlangsung: per.filter((x) => x.status === 'berlangsung').length,
    rataHadir: ada.length ? ada.reduce((a, x) => a + x.pct, 0) / ada.length : null,
    rataNilai: bernilai.length ? bernilai.reduce((a, x) => a + x.rata, 0) / bernilai.length : null,
    terendah: terendah ? terendah.no : null,
    gagal: per.filter((x) => x.status === 'gagal').length, memuat: per.filter((x) => x.status === 'memuat').length };
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
// Bagian yang diamati IntersectionObserver (hk-jeda = animasi siaga di dalamnya dijeda); dilepas hkPulihkan.
const HK_BAGIAN = [];
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
  // hk-jeda juga dipasang pada bagian lain yang diamati (kisi papan/statistik tanpa id, kepala seksi, jadwal, banner).
  HK_BAGIAN.forEach((b) => coba(() => b.classList.remove('hk-jeda')));
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
// Judul papan menjadi kepala berlencana (.hk-kepala): teks sesudah ikon dibungkus span bergradien (ikon tetap berwarna).
function hkKepala(judul, sisa, kelasTeks) {
  if (!judul || !sisa || sisa.parentNode !== judul) return;
  const teks = document.createElement('span');
  teks.className = kelasTeks;
  judul.insertBefore(teks, sisa);
  teks.appendChild(sisa);
  judul.classList.add('hk-kepala');
}
// Hiasan ikon + kelas desain (v3). Hanya kelas/span/variabel CSS; teks, urutan, dan perilaku elemen asli tetap.
function hkHiasIkon() {
  const id = (x) => document.getElementById(x);
  const pasang = (f) => { try { f(); } catch (e) { try { console.warn('[HasilKeren] ikon:', e); } catch (e2) { /* diam */ } } };
  pasang(() => hkBungkusIkon(id('tab-hasil'), 'hk-i-tab', false));
  pasang(() => {
    const h2 = hkCari(id('page-hasil'), (c) => c.tagName === 'H2' && String(c.textContent).trim() === 'Performa Mahasiswa');
    if (!h2) return;
    h2.classList.add('hk-judul-seksi');
    const pil = h2.previousElementSibling;
    hkBungkusIkon(pil, 'hk-i-aktivitas', true);
    if (pil && pil.tagName === 'SPAN') pil.classList.add('hk-pil');
  });
  pasang(() => hkTandaiIkon(hkSpanPertama(id('scheduleInfo')), 'hk-i-kalender'));
  pasang(() => hkBungkusIkon(id('resetBtnHasil'), 'hk-i-hapus', true));
  pasang(() => hkTandaiIkon(hkSpanPertama(id('scheduleMissingDosen')), 'hk-i-peringatan'));
  pasang(() => hkBungkusIkon(hkCari(id('scheduleMissingDosen'), (c) => c.tagName === 'BUTTON'), 'hk-i-jam', true));
  pasang(() => { const el = id('rajinList'); const j = el && el.previousElementSibling; hkKepala(j, hkBungkusIkon(j, 'hk-i-trofi', false), 'hk-kepala-teks'); });
  pasang(() => { const el = id('santaiList'); const j = el && el.previousElementSibling; hkKepala(j, hkBungkusIkon(j, 'hk-i-api', false), 'hk-kepala-teks'); });
  pasang(() => {
    const el = id('aktifList');
    const judul = el && el.previousElementSibling;
    const sisa = hkBungkusIkon(judul, 'hk-i-tangan', false);
    // .ka-judul bergradien lewat background-clip:text: gradien pindah ke span teks agar ikon tetap berwarna.
    const ka = hkKelas(judul, 'ka-judul');
    hkKepala(judul, sisa, ka ? 'hk-ka-teks' : 'hk-kepala-teks');
    if (sisa && ka) judul.classList.add('hk-ka-judul');
  });
  pasang(() => { const p = id('leaderboardPanel'); if (p && p.parentNode && p.parentNode.classList) p.parentNode.classList.add('hk-kartu-tabel'); });
  [['statTotalMhs', 'hk-i-mhs'], ['statHadir', 'hk-i-hadir'], ['statAbsen', 'hk-i-absen']].forEach((p) => pasang(() => {
    const el = id(p[0]);
    hkTandaiIkon(el && el.previousElementSibling, p[1]);
    // Warna aksen kartu = warna angka asli kursus (mis. Matematika oranye); bawaan CSS bila tidak terbaca.
    const w = /^rgba?\((\d+), ?(\d+), ?(\d+)/.exec(String((el && el.style && el.style.color) || ''));
    const kartu = el && el.parentNode;
    if (w && kartu && kartu.style && typeof kartu.style.setProperty === 'function') kartu.style.setProperty('--hk-a', w[1] + ',' + w[2] + ',' + w[3]);
  }));
}
// Ikon daftar papan yang ditulis ulang tiap render (🥇🥈🥉, 🔥 Keaktifan) melanjutkan fase jam dinding lewat --hk-fase
// (hanya animasi siaga; periode = durasi CSS hkSiagaMedali/hkSiagaNyala), jadi tidak tersentak ke posisi awal.
const HK_FASE = { rajinList: 4800, aktifList: 3400 };
function hkFase(el, x) {
  const periode = HK_FASE[x];
  if (!el || !periode) return;
  const ikon = [];
  if (x === 'rajinList') {
    for (let i = 0; i < el.children.length; i += 1) { const s = hkSpanPertama(el.children[i]); if (s) ikon.push(s); }
  } else {
    const kumpul = (n) => { for (let i = 0; i < n.children.length; i += 1) { const c = n.children[i]; if (hkKelas(c, 'ka-ikon')) ikon.push(c); else kumpul(c); } };
    kumpul(el);
  }
  const kini = Date.now();
  ikon.forEach((s, i) => { s.style.setProperty('--hk-fase', String(-(((kini - i * 400) % periode + periode) % periode)) + 'ms'); });
}
// Kelas status baris tabel (cahaya kiri saat hover) dari awal teks pil status; teks dan struktur tabel tidak diubah.
const HK_ST_BARIS = [['✅', 'tepat'], ['⏰', 'terlambat'], ['⏳', 'belum'], ['❌', 'bolos']];
function hkTandaiStatus() {
  hkBarisTabel().forEach((r) => {
    const s = hkCari(r, (c) => hkKelas(c, 'vt-status'));
    const t = s ? String(s.textContent).trim() : '';
    const k = HK_ST_BARIS.find((p) => t.indexOf(p[0]) === 0);
    if (k && !hkKelas(r, 'hk-st-' + k[1])) r.classList.add('hk-st-' + k[1]);
  });
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
// G5 Tren: jalur node pertemuan lain (sekali per halaman) dan baca-sekali ber-cache.
const HK_TREN_SEGAR_MS = 600000;
const HK_TREN_TUNGGU_MS = 20000;
const HK_TREN = { jalur: null, peta: {}, jadwal: {}, waktu: 0, gen: 0, baca: 0 };
function hkTrenJalur() {
  if (HK_TREN.jalur === null) {
    try { HK_TREN.jalur = hkTrenJalurMurni(DB_PATH, MODULE_ID, SCHEDULE_PATH, PERTEMUAN) || false; } catch (e) { HK_TREN.jalur = false; }
  }
  return HK_TREN.jalur;
}
// Satu-satunya akses Firebase blok ini: baca SEKALI satu node publik (tanpa langganan, tanpa tulis) lewat get()
// modul, atau onValue onlyOnce bila get tidak ada. Galat apa pun (lemparan/penolakan) -> gagal(), bukan hkGagal:
// satu pertemuan yang tidak termuat tidak menggagalkan panel.
function hkTrenBaca(jalur, ok, gagal) {
  let selesai = false;
  const sekali = (f) => hkAman(function (x) { if (selesai) return; selesai = true; f(x); });
  const berhasil = sekali((snap) => ok((snap && typeof snap.val === 'function') ? snap.val() : null));
  const galat = sekali(() => gagal());
  try {
    const r = ref(db, jalur);
    if (typeof get === 'function') {
      const p = get(r);
      if (p && typeof p.then === 'function') p.then(berhasil, galat); else galat();
    } else if (typeof onValue === 'function') onValue(r, berhasil, galat, { onlyOnce: true });
    else galat();
  } catch (e) { galat(); }
}
// Dipanggil hkGambar (tab Hasil aktif + panel terbuka): node visitors + jadwal 13 pertemuan lain dibaca sekali, lalu
// dimuat ulang paling cepat HK_TREN_SEGAR_MS sesudahnya (tab dibuka ulang / data berubah sesudah 10 menit). Data lama
// tetap tampil selama memuat ulang dan TIDAK ditimpa oleh baca ulang yang gagal; baca yang menggantung dianggap gagal
// sesudah HK_TREN_TUNGGU_MS, tetapi hasil 'ok' yang tiba sesudahnya (generasi yang sama) tetap diterima.
function hkTrenMuat() {
  const j = hkTrenJalur();
  if (!j) return;
  const kini = Date.now();
  if (HK_TREN.waktu && kini - HK_TREN.waktu < HK_TREN_SEGAR_MS) return;
  HK_TREN.waktu = kini;
  HK_TREN.gen += 1;
  const gen = HK_TREN.gen;
  const tunggu = {};
  const tuntas = (w, isi) => {
    if (gen !== HK_TREN.gen || (!tunggu[w.kunci] && isi.baca !== 'ok')) return;
    delete tunggu[w.kunci];
    const lama = w.wadah[w.slot];
    if (isi.baca !== 'ok' && lama && lama.baca === 'ok') return;
    w.wadah[w.slot] = isi;
    hkJadwalkan(false);
  };
  const kerja = [];
  j.kolom.forEach((k) => {
    if (k.slot === j.ini) return;
    kerja.push({ kunci: 'v' + k.slot, slot: k.slot, jalur: k.visitors, wadah: HK_TREN.peta });
    kerja.push({ kunci: 'j' + k.slot, slot: k.slot, jalur: k.jadwal, wadah: HK_TREN.jadwal });
  });
  kerja.forEach((w) => {
    tunggu[w.kunci] = w;
    HK_TREN.baca += 1;
    hkTrenBaca(w.jalur, (v) => tuntas(w, { baca: 'ok', data: v }), () => tuntas(w, { baca: 'gagal' }));
  });
  setTimeout(hkAman(() => { Object.keys(tunggu).forEach((k) => tuntas(tunggu[k], { baca: 'gagal' })); }), HK_TREN_TUNGGU_MS);
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
  // Tren: pertemuan lain dari cache baca-sekali (visitors + jadwal; jadwal gagal/tidak ada = tidak diketahui);
  // pertemuan ini dari rekaman mentah langsung halaman (poin tugas) + currentSchedule.
  const jalur = hkTrenJalur();
  let tren = null;
  if (jalur) {
    const peta = {};
    Object.keys(HK_TREN.peta).forEach((slot) => {
      const jd = HK_TREN.jadwal[slot];
      peta[slot] = { baca: HK_TREN.peta[slot].baca, data: HK_TREN.peta[slot].data, jadwal: (jd && jd.baca === 'ok') ? jd.data : null };
    });
    if (_visitorsDiterima) peta[jalur.ini] = { baca: 'ok', data: Array.isArray(_visitorsMentah) ? _visitorsMentah : [], jadwal: j || null };
    else delete peta[jalur.ini];
    tren = hkTrenMurni(peta, roster, isSimulasiNim, total, jalur.ini, kini);
  }
  const saya = hkSaya(st);
  const menit = kurva.sekarangDalam ? Math.floor(kini / 60000) : 0;
  return { memuat: memuat, gagal: gagal, jadwal: jadwal, adaDeadline: adaDeadline, schedExpired: schedExpired, bukaMs: bukaMs, dueMs: dueMs, st: st, dist: dist,
    kurva: kurva, cfg: cfg, soal: soal, dosen: dosen, gerbang: gerbang, rinci: rinci, tren: tren, saya: saya, menit: menit };
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
// G5 Tren Kelas per Pertemuan: batang = % hadir, titik + garis = rata-rata nilai tugas (sumbu sama 0–100).
function hkTrenPct(p) { return Math.round(p.pct || 0); }
function hkTrenJudul(p) {
  const ini = p.ini ? ' (pertemuan ini)' : '';
  if (p.status === 'ada' || p.status === 'berlangsung') {
    return 'Pertemuan ' + p.no + (p.status === 'berlangsung' ? ' (sedang berlangsung, sementara)' : '') + ': hadir ' + p.hadir + '/' + p.roster +
      ' (' + hkTrenPct(p) + '%), rata-rata nilai tugas ' + (p.rata === null ? '–' : hkFmtMurni(p.rata, 1)) + ini;
  }
  if (p.status === 'kosong') return 'Pertemuan ' + p.no + ': belum berlangsung (belum ada data)' + ini;
  if (p.status === 'gagal') return 'Pertemuan ' + p.no + ': data tidak termuat' + ini;
  return 'Pertemuan ' + p.no + ': memuat…' + ini;
}
function hkGambarTren(R, W) {
  const isi = document.getElementById('hkTrenIsi');
  const ket = document.getElementById('hkTrenKet');
  if (!isi) return;
  const t = R.tren;
  if (!t) { hkKosong(isi, 'Tren per pertemuan tidak tersedia di halaman ini.'); hkKet(ket, []); return; }
  if (!t.berdata && !t.gagal && !t.berlangsung) {
    hkKosong(isi, t.memuat ? '⏳ Memuat data pertemuan…' : 'Belum ada pertemuan yang berjalan.');
    hkKet(ket, []);
    return;
  }
  const H = 176, kiri = 30, kanan = 6, atas = 14, bawah = 22;
  const slot = (W - kiri - kanan) / 14;
  const tinggi = H - atas - bawah;
  const dasar = atas + tinggi;
  const y = (v) => atas + (1 - v / 100) * tinggi;
  const lebarBatang = slot * 0.62;
  const pendek = slot < 26;
  const svg = hkSvg('hkTrenSvg', W, H, 'Tren kelas per pertemuan',
    'Persentase hadir dan rata-rata nilai tugas (0–100) per pertemuan: ' + t.per.map((p) => p.no + ' ' + ((p.status === 'ada' || p.status === 'berlangsung')
      ? (p.status === 'berlangsung' ? 'sedang berlangsung, ' : '') + 'hadir ' + hkTrenPct(p) + '%, nilai ' + (p.rata === null ? '–' : hkFmtMurni(p.rata, 1))
      : p.status === 'kosong' ? 'belum berlangsung' : p.status === 'gagal' ? 'tidak termuat' : 'memuat') + (p.ini ? ' (ini)' : '')).join('; ') + '.');
  [0, 50, 100].forEach((v) => {
    svg.appendChild(hkS('line', { class: 'hk-garis-grid', x1: kiri, x2: W - kanan, y1: hkAngka(y(v)), y2: hkAngka(y(v)) }));
    svg.appendChild(hkS('text', { class: 'hk-sumbu', x: kiri - 5, y: hkAngka(y(v) + 4), 'text-anchor': 'end' }, v));
  });
  const titik = [];
  t.per.forEach((p, i) => {
    const x0 = kiri + i * slot;
    const xc = x0 + slot / 2;
    const g = hkS('g', { class: 'hk-kolom' + (p.ini ? ' hk-kolom-ini' : '') });
    g.appendChild(hkS('title', null, hkTrenJudul(p)));
    g.appendChild(hkS('rect', { class: 'hk-kena', x: hkAngka(x0), y: atas, width: hkAngka(slot), height: tinggi + bawah }));
    if (p.status === 'ada' || p.status === 'berlangsung') {
      const jalan = p.status === 'berlangsung';
      const h = p.pct / 100 * tinggi;
      const b = hkS('rect', { class: 'hk-batang' + (p.ini ? ' hk-ini' : '') + (jalan ? ' hk-berlangsung' : ''), x: hkAngka(xc - lebarBatang / 2), y: hkAngka(dasar - h),
        width: hkAngka(lebarBatang), height: hkAngka(h), rx: 2 });
      b.style.animationDelay = (i * 30) + 'ms';
      g.appendChild(b);
      if (p.rata !== null) titik.push({ slot: p.slot, jalan: jalan, x: xc, y: y(p.rata) });
    } else if (p.status === 'kosong') {
      g.appendChild(hkS('rect', { class: 'hk-tren-kosong', x: hkAngka(xc - lebarBatang / 2), y: dasar - 2, width: hkAngka(lebarBatang), height: 2 }));
      g.appendChild(hkS('text', { class: 'hk-sumbu', x: hkAngka(xc), y: dasar - 6, 'text-anchor': 'middle' }, '–'));
    } else if (p.status === 'gagal') {
      g.appendChild(hkS('text', { class: 'hk-tren-gagal', x: hkAngka(xc), y: dasar - 6 }, '!'));
    } else {
      g.appendChild(hkS('text', { class: 'hk-sumbu', x: hkAngka(xc), y: dasar - 6, 'text-anchor': 'middle' }, '…'));
    }
    g.appendChild(hkS('text', { class: 'hk-sumbu' + (p.ini ? ' hk-sumbu-ini' : ''), x: hkAngka(xc), y: H - 6, 'text-anchor': 'middle' }, (pendek ? '' : 'P') + p.no));
    svg.appendChild(g);
  });
  // Garis nilai hanya menyambung kolom berurutan yang sama-sama punya nilai final (bukan yang sedang berlangsung).
  let jalur = '';
  titik.forEach((q, i) => {
    const sambung = i && !q.jalan && !titik[i - 1].jalan && titik[i - 1].slot === q.slot - 1;
    if (!q.jalan) jalur += (sambung ? 'L' : 'M') + hkAngka(q.x) + ',' + hkAngka(q.y);
  });
  if (jalur) svg.appendChild(hkS('path', { class: 'hk-tren-garis', d: jalur }));
  titik.forEach((q) => svg.appendChild(hkS('circle', { class: 'hk-tren-titik' + (q.jalan ? ' hk-berlangsung' : ''), cx: hkAngka(q.x), cy: hkAngka(q.y), r: 3.2 })));
  const leg = hkEl('div', { class: 'hk-legenda-baris', 'aria-hidden': 'true' });
  const legenda = [['hadir', 'Hadir (%)'], ['ini', 'Pertemuan ini'], ['nilai', 'Rata-rata nilai tugas (0–100)']];
  if (t.berlangsung) legenda.push(['jalan', 'Sedang berlangsung (sementara)']);
  legenda.forEach((x) => leg.appendChild(hkEl('span', { class: 'hk-c-' + x[0] }, x[1])));
  hkGanti(isi, svg, leg);
  const bag = [];
  const ketJalan = t.berlangsung ? ' (+' + t.berlangsung + ' sedang berlangsung, belum dihitung)' : '';
  if (t.berdata) {
    bag.push(['Rata-rata kehadiran ', { b: hkFmtMurni(t.rataHadir, 0) + '%' }, ' dan nilai tugas ', { b: t.rataNilai === null ? '–' : hkFmtMurni(t.rataNilai, 1) },
      ' dari ' + t.berdata + ' pertemuan yang sudah selesai' + ketJalan + (t.berdata > 1 ? '; kehadiran terendah di Pertemuan ' + t.terendah + '.' : '.')]);
  } else if (t.berlangsung) bag.push('Belum ada pertemuan yang selesai; ' + t.berlangsung + ' pertemuan sedang berlangsung (angka sementara).');
  bag.push('Dihitung tanpa bonus keaktifan/forum agar sebanding antarpertemuan: hadir = mahasiswa di daftar yang punya poin tugas di pertemuan itu, nilai = rata-rata poin tugas mereka (skala 0–100).');
  const pIni = t.per.find((p) => p.ini);
  if (pIni && (pIni.status === 'ada' || pIni.status === 'berlangsung') && !R.memuat && !R.gagal && R.st && pIni.hadir !== R.st.hadir) {
    bag.push('Pertemuan ini: ' + pIni.hadir + ' hadir menurut poin tugas; kartu Kehadiran (' + R.st.hadir + ') juga menghitung mahasiswa yang hanya mendapat bonus keaktifan/forum.');
  }
  if (t.memuat) bag.push('Memuat ' + t.memuat + ' pertemuan…');
  if (t.gagal) bag.push('! = data ' + t.gagal + ' pertemuan tidak termuat; dicoba lagi saat tab Hasil dibuka sesudah 10 menit.');
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
  // Node pertemuan lain dibaca hanya bila panel benar-benar terlihat (sekali, lalu paling cepat 10 menit sekali).
  hkTrenMuat();
  const kini = Date.now();
  const R = hkRingkasan(kini);
  const lebar = { nilai: Math.max(120, hkLebar('hkNilaiIsi')), waktu: Math.max(160, hkLebar('hkWaktuIsi')), tren: Math.max(160, hkLebar('hkTrenIsi')) };
  const tanda = JSON.stringify(R, hkTanpaBaris) + '|' + lebar.nilai + ',' + lebar.waktu + ',' + lebar.tren;
  const masuk = HK.masuk && !R.memuat;
  if (tanda === HK.tanda && !masuk) { hkSelaraskanAngka(); return; }
  const animasi = masuk && !HK.diam;
  const umum = R.memuat ? '⏳ Memuat…' : R.gagal ? '⚠ Daftar mahasiswa tidak bisa dimuat' : !R.st.total ? 'Belum ada mahasiswa di daftar' : '';
  const kartu = {
    hkStatus: [umum, R.st.tepat, R.st.terlambat, R.st.belum, R.st.bolos, R.adaDeadline],
    hkNilai: [umum, R.dist, R.saya, lebar.nilai],
    hkWaktu: [umum, R.kurva, R.dueMs, R.dosen, R.menit, lebar.waktu],
    hkSoal: [umum, R.soal, R.cfg, R.gerbang, R.rinci, R.dosen, R.schedExpired],
    hkTren: [umum, R.tren, lebar.tren],
  };
  const gambar = {
    hkStatus: () => hkGambarStatus(R, animasi),
    hkNilai: () => hkGambarNilai(R, lebar.nilai),
    hkWaktu: () => hkGambarWaktu(R, lebar.waktu, kini),
    hkSoal: () => hkGambarSoal(R),
    hkTren: () => hkGambarTren(R, lebar.tren),
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
  panel.setAttribute('data-hk-tren-baca', String(HK_TREN.baca));
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
      hkTandaiStatus();
      amati(tbody, { childList: true }, () => {
        hkTandaiStatus();
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
          else el.classList.remove('hk-masuk');
          hkFase(el, x);
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
      // Animasi siaga dijeda per bagian yang di luar layar: kisi papan (🏆/🔥/🙋 + daftar), kisi statistik (👥/✅/❌)
      // dan panel grafik, juga kepala seksi (pil 👥 + judul), kartu jadwal (📅) dan banner dosen (⚠️/🕐) di atas papan.
      // hk-jeda dipasang pada bagian yang diamati itu sendiri, bukan pada #leaderboardPanel (yang juga memuat
      // #hkPanel, jadi selalu "terlihat" selama grafik dibaca). Tanpa IntersectionObserver: tetap jalan.
      const papan = id('leaderboardPanel');
      const seksi = hkCari(halaman, (c) => hkKelas(c, 'hk-judul-seksi'));
      let kepala = seksi && seksi.parentNode !== halaman ? seksi.parentNode : null;
      // Kepala seksi yang ternyata memuat papan (markup lain) tidak diamati: hk-jeda-nya akan menjeda papan yang terlihat.
      for (let p = papan; p && kepala; p = p.parentNode) if (p === kepala) kepala = null;
      [papan && papan.children[0], papan && papan.children[1], panel, kepala, id('scheduleInfo'), id('scheduleMissingDosen')]
        .forEach((b) => { if (b && b.classList && HK_BAGIAN.indexOf(b) < 0) HK_BAGIAN.push(b); });
      if (HK_BAGIAN.length) {
        const io = new IntersectionObserver(hkAman((isi) => { isi.forEach((e) => { if (e.target && e.target.classList) e.target.classList.toggle('hk-jeda', !e.isIntersecting); }); }));
        HK_BAGIAN.forEach((b) => io.observe(b));
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
// HASIL-KEREN:DATA END v3
`;

export const RX_CSS = /<style id="hasil-keren-style">\/\* HASIL-KEREN:CSS v\d+[\s\S]*?<\/style>\n/;
export const RX_PANEL = / {6}<!-- HASIL-KEREN:PANEL BEGIN v\d+[^\n]*\n[\s\S]*? {6}<!-- HASIL-KEREN:PANEL END v\d+ -->\n/;
export const RX_DATA = /\/\/ HASIL-KEREN:DATA BEGIN v\d+[^\n]*\n[\s\S]*?\/\/ HASIL-KEREN:DATA END v\d+\n/;
const ANKER_PANEL = /(Jumlah Absen<\/div>\n {8}<\/div>\n {6}<\/div>\n)( {4}<\/div>\n {4}<div style="display:flex;padding:14px 24px;)/;
const ANKER_DATA = /\/\/ FORUM-POIN:DATA END v\d+\n/;
// Toleran versi KEAKTIFAN-KELAS (v5+; 13 Okt 2026): blok ini membaca _visitorsMentah/_keaktifanTotal
// (dijaga DEPENDENSI_SKRIP), bukan tampilan papan, jadi DATA v6 (pil bonus pertemuan ini) tidak mengubahnya.
const RX_KEAKTIFAN_FORUM = /\/\/ KEAKTIFAN-KELAS:DATA END v\d+\n\/\/ FORUM-POIN:DATA BEGIN v4/g;
const FORUM_HK = "// FORUM-POIN:DATA END v4\n// HASIL-KEREN:DATA BEGIN v3";
export const DEPENDENSI = [
  "let latestVisitors=[];", "function renderVisitors(visitors){", "// SAMAKAN-ABSEN-HASIL BEGIN v2", "const KEAKTIFAN_KURSUS = '",
  "let masterFetchDone", "let _visitorsDiterima = false;", "const _auth = getAuth(app);",
  'id="visitorTableBody"', 'id="statHadir"', 'id="rajinList"', 'id="aktifList"', 'id="page-hasil"',
];
// Harus berada di skrip modul yang sama dengan blok DATA (dibaca sebagai identifier bebas).
const DEPENDENSI_SKRIP = ["let latestVisitors=[];", "function renderVisitors(visitors){", "function isLate(", "let currentSchedule",
  "let masterStudents", "let _visitorsMentah = [];", "const MODULE_ID = ", "const DB_PATH = `", "const db = getDatabase(app);", "const isSimulasiNim = ",
  "function _keaktifanTotal("];
export const PENANDA = ["HASIL-KEREN:CSS v3", "HASIL-KEREN:PANEL BEGIN v3", "HASIL-KEREN:PANEL END v3", "HASIL-KEREN:DATA BEGIN v3",
  "HASIL-KEREN:DATA END v3", "HASIL-KEREN:MURNI BEGIN", "HASIL-KEREN:MURNI END", 'id="hkPanel"'];
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
