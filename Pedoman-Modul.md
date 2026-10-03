# Pedoman Sistem Modul, Exam, dan OBE

> **Status:** acuan keadaan sistem saat ini, diperbarui 29 September 2026
>
> **Lingkup:** LMS enam mata kuliah S1 Teknik Mesin Universitas Mercu Buana
>
> **Dosen pengampu:** Dedik Romahadi
>
> **Zona waktu operasional:** WIB (`Asia/Jakarta`, UTC+7)

Dokumen ini menjelaskan perilaku yang saat ini digunakan oleh halaman modul, UTS, UAS, OBE, alat Admin, dan backend Firebase. Dokumen ini sengaja tidak memuat kronologi PR, daftar bug lama, atau spesifikasi visual per piksel. Riwayat perubahan tetap tersedia melalui Git.

Jika dokumen dan implementasi berbeda, urutan sumber kebenaran adalah:

1. validasi dan transaksi pada Cloud Functions serta Firebase Rules;
2. kode frontend yang sedang dipublikasikan;
3. pemeriksa otomatis repositori;
4. dokumen ini.

Perbedaan harus diperbaiki pada kode atau didokumentasikan pada perubahan yang sama. Jangan menjadikan komentar lama di dalam HTML sebagai aturan jika bertentangan dengan backend.

---

## 1. Arsitektur dan repositori

Sistem dibagi menjadi dua repositori.

| Komponen | Repositori | Isi | Publikasi |
|---|---|---|---|
| Frontend | `dedik-romahadi/Mechanical-Engineering-Courses` | Modul, exam, OBE, Attributes, Banner, Admin, template Word/PPT, workflow Pages | GitHub Pages |
| Backend | `dedik-romahadi/Mechanical-Engineering-Courses-Backend` | Cloud Functions, RTDB Rules, Firestore Rules, bank soal UTS & UAS, seed kunci jawaban | Firebase project `getaran-mekanik` |

Aturan pemisahan:

- Repositori frontend tidak boleh berisi `functions/`, `.firebaserc`, `firebase.json`, rules, service account, seed jawaban, kunci jawaban, atau bank soal (UTS maupun UAS).
- Konfigurasi Firebase Web di HTML bukan kredensial rahasia. Keamanan tetap bergantung pada Rules, validasi server, dan autentikasi.
- Service account dan secret hanya disimpan sebagai GitHub Actions secret atau Firebase Secret Manager.
- Firestore menolak akses langsung dari client. Akses jawaban, attempt, OBE, dan operasi admin berjalan melalui Cloud Functions dengan Admin SDK.
- Cloud Functions berjalan di `asia-southeast1`; pengaturan umum saat ini `maxInstances: 10`, memori 256 MiB, dan timeout 30 detik kecuali fungsi tertentu memberi override.

### 1.1 Hosting frontend

GitHub Pages menggunakan `.github/workflows/deploy-slides.yml` dengan allowlist frontend. Workflow berjalan otomatis ketika perubahan masuk ke `main` dan juga dapat dijalankan manual.

Publikasi memakai **push ke branch `gh-pages`** (`build_type: legacy`), **bukan** `actions/deploy-pages`. Alasannya tercatat di komentar workflow: `actions/deploy-pages` punya batas keras 10 menit yang berulang kali terlampaui oleh jumlah berkas situs ini. Karena itu workflow butuh izin `contents: write` untuk mendorong hasil build ke `gh-pages`.

Jangan:

- mengembalikan publikasi ke `actions/deploy-pages` (batas 10 menit akan terlampaui lagi);
- memindahkan situs ke `/docs`;
- menyalin seluruh root repositori ke artefak situs;
- memasukkan backend, seed, bank soal, atau secret ke artefak Pages.

Berkas `.docx` di `Modul-Word/` sengaja tidak ikut dipublikasikan; hanya hasil render `.pdf` yang disertakan.

Path roster mahasiswa di halaman live bergantung pada struktur root Pages. Perubahan strategi hosting dapat memutus login seluruh mata kuliah.

### 1.2 Deployment backend

Backend tidak terdeploy otomatis saat frontend masuk `main`. Gunakan workflow manual `.github/workflows/deploy-firebase.yml` di repositori privat. Workflow mendukung:

- dry-run atau live seed untuk satu exam, semua exam, satu modul, satu course, atau semua;
- deploy Firestore Rules;
- deploy Cloud Functions;
- deploy RTDB Rules;
- set atau rotasi secret export dan secret autentikasi admin.

Secret yang diperlukan:

| GitHub Actions secret | Isi |
|---|---|
| `FIREBASE_SA_KEY` | seluruh JSON service account Firebase |
| `EXPORT_CODE_SECRET_VALUE` | nilai acak panjang untuk HMAC kode export; pertahankan nilai lama jika kode lama harus tetap valid |
| `ADMIN_PASSWORD_HASH_VALUE` | SHA-256 password admin baru, tepat 64 karakter heksadesimal; bukan password mentah |
| `AI_API_KEY_VALUE` | API key penyedia model AI chat (mis. OpenRouter/Groq/Gemini); nama secret netral vendor |

Secret runtime yang dibuat di Firebase Secret Manager adalah `EXPORT_CODE_SECRET`, `ADMIN_PASSWORD_HASH`, dan `AI_API_KEY` (dipakai callable `aiChat`/`getModuleChatContext` — lihat §10).

---

## 2. Mata kuliah, nama, dan inventaris

| Folder | Course ID/path | Prefix exam | Nama tampilan LMS |
|---|---|---|---|
| `Engineering-Mathematics/` | `math4` | `math4` | Matematika 4 / Engineering Mathematics |
| `Getaran-Mekanik/` | `getaran_mekanik` | `getaran-mekanik` | Getaran Mekanik |
| `Optimalisasi-dan-Automasi/` | `optoauto` | `optoauto` | Optimalisasi & Otomasi |
| `Sistem-Kendali-Cerdas/` | `sistem_kendali_cerdas` | `sisken` | Sistem Kendali Cerdas |
| `Pemodelan-Computer-Aided-Design/` | `pemodelan_cad` | `pemodelan-cad` | Pemodelan Computer Aided Design (CAD) |
| `Teknik-Tenaga-Listrik/` | `teknik_tenaga_listrik` | `teknik-tenaga-listrik` | Teknik Tenaga Listrik |

Perhatikan Sistem Kendali Cerdas memakai **dua penamaan berbeda** yang keduanya benar dan tidak boleh disamakan: course id/path Firebase `sistem_kendali_cerdas` (dengan garis bawah), tetapi prefix exam `sisken` (`sisken-uts`, `sisken-uas`). Nama berkas kunci modul juga memakai bentuk panjang: `functions/seed/modul/sistem_kendali_cerdas-modul-N-answers.js`.

Khusus course Optimalisasi:

- nama folder memakai **Automasi**;
- `Attributes/Asesmen-Optimalisasi-dan-Otomasi.json` dan judul LMS memakai **Otomasi**;
- deck Slidev tertentu memakai “Optimalisasi & Automasi” secara sengaja;
- jangan membuat path `Optimization-Automation`.

**Pemodelan Computer Aided Design (CAD) — Tahap 1 (13 September 2026).** Mata kuliah semester 2 ini ditambahkan bertahap atas keputusan dosen. Yang sudah ada: `Attributes/Asesmen-Pemodelan-Computer-Aided-Design.json` (bobot dari SIA), `Attributes/students.json` (11 mahasiswa), `OBE/Penilaian-OBE.htm`, `Unduhan-Gabungan/RPS-Pemodelan-Computer-Aided-Design.pdf`, kartu di `index.html`, dan baris `rsync` di `deploy-slides.yml`. Yang pada tahap itu **sengaja belum** dibuat: Banner, Modul, Modul-Word, Exam, dan bentuk Tugas (masih diputuskan dosen); semuanya terbit 20–21 September 2026 (Tahap 2 di bawah).

- **Bobot mengikuti SIA** (TGS 55%, UTS 22%, UAS 23%), bukan komponen penilaian RPS (UTS 50%/UAS 50%, bobot mingguan Σ92%) yang tidak konsisten dengan SIA.
- Kelas sudah dibuka: SIA kelas 354322, `kode_mk` `W132500006`, kelas `2A2132FF`, Selasa 19:30–22:00 (19 September 2026); RPS masih memakai kode lama `W132100008`. Roster 11 mahasiswa dari presensi SIA; akun simulasi ditambahkan saat modul dibuat.
- Pada tahap ini backend hanya menambahkan `pemodelan_cad` ke `OBE_MAPPING_COURSES` agar mapping OBE bisa disimpan, sehingga `computeObeScores` sempat menolak course ini dengan pesan jelas karena belum ada di `OBE_COURSE_EXAMS`. Sejak UTS/UAS CAD terbit (20 September 2026) `pemodelan_cad` ada di `OBE_COURSE_EXAMS` (`pemodelan-cad-uts`/`-uas`) dan dihitung seperti course lain.
- Saat itu `validate-public-security.mjs` memindai halaman OBE-nya lewat `obeOnlyRoots` (bukan `courseRoots`, yang mewajibkan `Exam/UTS.html` dan `Exam/UAS.html`); hitungan halaman ber-autentikasi menjadi 74 (75 setelah OBE Teknik Tenaga Listrik, 76 setelah Modul 1-nya terbit). Kini CAD dipindai lewat `courseRoots` dan `obeOnlyRoots` kosong (butir Validator Tahap 2).
- Daftar yang dijalankan saat modul dan ujian dibuat (seluruhnya selesai 20–21 September 2026): pindahkan ke `courseRoots` dan daftar di `validate-all-course-modern-design.mjs` (serta sesuaikan hitungan modul dan halaman ber-autentikasi), tambahkan ke `_MODUL_COURSES`, `EXAM_CONFIG`, `OBE_EXAM_CONFIG`, `OBE_COURSE_EXAMS`, keempat daftar course di `database.rules.json`, registry dan basis pengetahuan chat, lima alat `Admin/`, isi `DEFAULT_MAPPING` UTS/UAS di halaman OBE, lalu isi roster.

**Pemodelan CAD — Tahap 2: Modul 1 dan jalur unggah berkas (20 September 2026).** Perangkat lunak yang dipakai **FreeCAD 1.0**. Tugas per modul = **10 PG + 5 tugas pemodelan** (6/6/6/11/11 poin = 40; total 50). Tiap tugas pemodelan mengunggah **berkas `.FCStd`** langsung di kartu tugas dan mengisi **satu angka bacaan** dari FreeCAD (Area, Shape.Length, CenterOfMass) yang parametrik per NIM; server menolak penilaian sebelum berkas ada. Modul 1–4 berisi tugas 2D (Draft/Sketcher). **Sejak 24 September 2026 isi berkas divalidasi server** (backend PR #78): pembaca Python `bacaFcstd` membaca geometri yang tersimpan di `.FCStd`, sehingga unggahan tanpa geometri ditolak dan angka ketikan harus terbaca dari model yang diunggah (aturan baca per tugas di backend); angka yang tidak ada di berkas ditolak tanpa dihitung dan tanpa mengunci soal. **Kirim ulang (modul saja):** kiriman salah bernilai 0 tetapi tidak mengunci; mahasiswa boleh memperbaiki model, mengunggah ulang, dan mengirim ulang tanpa batas, dan kiriman benar setelah pernah salah bernilai 65% dari poin tugas (× 0,65 lagi bila terlambat). Partial 0,5 tidak lagi berlaku di tugas modul; attempt lama yang sudah mendapat partial mempertahankan poinnya dan boleh dikirim ulang. Kunci dan penjelasan baru ditampilkan setelah tugas benar. UTS/UAS CAD tetap satu kesempatan (partial 0,5; tugas rakitan `c11` UAS 3 poin, §7.5), dengan validasi isi berkas yang sama.

- **Halaman:** `Pemodelan-Computer-Aided-Design/Modul/Modul-1.html` dibangun `scripts/cad-modul/bangun-modul-1.py` dari kerangka TTL Modul 1 (semua lapisan injektor kerangka ikut, kecuali blok `JAWABAN-PRIVAT:ANGKA-CAD` yang hanya ada di halaman CAD — lihat urutan regenerasi di bawah) dengan konten `scripts/cad-modul/modul_1.py` dan `animasi/modul-1.js` (helper `pustaka.py`, `animasi/dasar.js` — salinan dari `scripts/ttl-modul/`). Tab: Setup FreeCAD (instalasi dan preferensi; sejak 30 September 2026 nomor versinya tidak lagi ditulis mati: span `data-fc-versi="seri"`/`"penuh"` diisi skrip `VERSI-FREECAD v1` dari rilis stabil terbaru GitHub FreeCAD/FreeCAD — sumber yang sama dengan tombol unduh freecad.org/downloads — dengan cache 12 jam di localStorage `fc_versi_terbaru`; bila gagal, tampil cadangan `FC_VERSI` di `scripts/cad-modul/modul_1.py`, yang diperbarui saat membangun ulang), Setup Python (`scripts/cad-modul/setup_python.py`: Miniconda + env `pemodelan_cad` + VS Code + uji `freecadcmd`; halaman `page-python`, CSS-nya salinan blok `#page-setup`), Modul (9 bagian, 6 gambar, 4 animasi, 3 cell Python console FreeCAD), Tugas, Forum, Hasil; tab Pembagian Kelompok, Pyodide, dan pemanasan `getPyodide()` dibuang. Setiap kartu tugas T1–T5 memuat gambar acuan simbolik (`scripts/cad-modul/tugas_gambar.py`, `tugas_gambar_html(N)`; simbol mengikuti teks tugas, angka dimuat per NIM). **Catatan desimal FreeCAD (29 September 2026):** teks tugas memakai koma desimal (`fmt()` backend, mis. "radius 31,4 mm"), padahal kotak isian FreeCAD mengikuti format angka komputer; di laptop berformat titik, "31,4" terbaca sebagai 314 (koma = pemisah ribuan) dan seorang mahasiswa Modul 1 T2 mendapat panjang busur tepat 10× kunci. Karena itu `#parametric-modul-note` di `tugas_block()` (`modul_1.py`, ikut ke ke-14 modul lewat `bangun.py`), langkah 2 tab Setup FreeCAD, dan kotak "Sebelum klik ▶ Kirim & Validasi" UTS/UAS (`scripts/cad-exam/bangun.py`) memuat catatan: ketik desimal dengan pemisah yang ditampilkan FreeCAD (umumnya titik, 31.4) lalu periksa nilainya di tab Data panel Property. Kunci, toleransi, dan `fmt()` tidak diubah. Urutan regenerasi: `bangun-modul-1.py` → `tambah-progres-modul.mjs` → `jawaban-privat.mjs` → `bangun.py 2..N` → `tambah-progres-modul.mjs` → `pasang-tautan-pdf.py` (bangun.py membuang kotak centang Modul 1 sebelum menyalin, jadi `tambah-progres-modul.mjs` harus sudah berjalan; blok `JAWABAN-PRIVAT:ANGKA-CAD` tidak ada di kerangka TTL, jadi `jawaban-privat.mjs` harus memasangnya di Modul-1 sebelum `bangun.py 2..N` menyalinnya — tanpa langkah itu ke-14 halaman tanpa blok dan `validate-public-security.mjs` menolaknya). Sesudahnya `node scripts/jawaban-privat.mjs --periksa` harus 0. Gambar materi diperiksa agar teks tidak saling menimpa (`teks2()` di `pustaka.py` memecah keterangan panjang). **Teks SVG memakai `'Inter'` yang tidak dimuat halaman** (halaman hanya memuat Source Sans 3, Playfair Display, JetBrains Mono; `@import` Inter di berkas hanya milik templat ekspor tugas), sehingga gambar tampil dengan font sistem perangkat, dan font sistem Mac/iPhone lebih lebar daripada Windows. **Pemeriksa tata letak yang berlaku adalah `python scripts/cad-modul/periksa_gambar_chrome.py --semua` lalu `--semua --inter`** (Chrome headless, `getBBox` nyata; `--inter` memuat Inter dari Google Fonts sebagai pendekatan lebar font Mac). Keduanya harus "0 cacat": teks keluar kanvas, sisa < 16 px dari tepi kanan (di mode Inter hanya peringatan), < 6 px dari tepi lain, tinta dua teks bersentuhan, teks memotong `<rect>`, atau garis mencoret tinta huruf; tumpang/sentuh yang hanya mengenai kotak getBBox kosmetik. Sejak 22 September 2026 aturan KOTAK memakai posisi `<rect>` sesudah transformasi elemen/grupnya, sama seperti teks (sebelumnya kotak di dalam `<g transform>` dibandingkan pada koordinat mentah). `periksa_gambar.py` hanya menaksir lebar (0,46 em per huruf) dan meloloskan teks hingga 4 px melewati tepi: pada 21–22 September 2026 pemeriksa Chrome menemukan 179 temuan di 40 dari 70 gambar tugas dan puluhan di gambar materi yang semuanya lolos `periksa_gambar.py` — label dicoret garis, baris catatan terpotong tepi kanan, label es/ei zona g6 Modul 12 tertukar, dan angka dimensi Modul 4 yang salah tempat ("70" di Gambar 1 tergambar seluruhnya di luar kanvas) karena helper `_dim` menimpa parameter `dy`. Semua 168 gambar (98 materi + 70 tugas) sudah dirapikan. **Gambar 7 tiap modul adalah gambar kerja praktik terbimbing** di awal bagian 09, sebelum kartu langkah: setiap angkanya membaca konstanta yang sama dengan teks langkah sehingga keduanya tidak bisa menyimpang, dan `periksa_modul.py` menuntut 7 gambar dengan Gambar 7 di `m-praktik` tanpa `rgba()`. Pengurai SVG MuPDF di generator Word mencetak `rgba()` dan isian gradien `url(#…)` sebagai hitam pekat, mengabaikan `fill-opacity` pada `<text>`, dan mengabaikan `stroke-dasharray`. Sejak 22 September 2026 `warna_mupdf()` (kini di `scripts/svg_word.py`, modul render SVG→PNG yang dipakai bersama generator Word CAD dan TTL) mengolah salinan SVG untuk Word lebih dulu (`rgba()` → `rgb()` + `fill-/stroke-opacity`, alpha teks → `opacity`, kotak bergradien → PNG ber-alpha dengan sudut membulat), sehingga 134 dari 168 gambar yang dulu bercetak blok hitam kini sama dengan halaman web; halaman modulnya sendiri tidak berubah. `garis_putus_mupdf()` (22 September 2026) lalu memecah setiap bentuk bergaris putus (line, polyline, polygon, rect, circle, ellipse, path — 453 elemen di 125 gambar, termasuk garis sumbu titik-strip dan banyak garis di Gambar 7) menjadi strip nyata di sepanjang path setaranya menurut SVG 2, dengan titik awal, arah, dan `stroke-dashoffset` yang sama dengan peramban; isian bentuknya tetap. Dibandingkan piksel demi piksel dengan render Chrome (tanpa teks, 2 px/unit, toleransi 1 px), selisihnya turun dari 81.395 menjadi 442 piksel dan gumpalan sisa terbesar 4 piksel (anti-alias di ujung strip). Kedua fungsi berhenti dengan galat jelas bila menemui bentuk yang belum didukung (misalnya `pathLength`), bukan diam-diam mencetak hitam atau garis utuh. **Animasi kanvas (22 September 2026):** lebar kanvas mengikuti kolom halaman, tingginya bawaan 280. Lebar nyata: layar ≥ 1366 px → 1000, 1024 → 800, 768 → 570, ponsel 414/390/360/320 px → 298/274/244/204; tablet dan ponsel mendatar memberi lebar di antaranya. Keterangan satu baris berposisi tetap dulu terpotong di hampir semua animasi di ponsel, sebagian juga di desktop (label sumbu keluar tepi atas, label yang ikut model saat zoom maksimum). `animasi/dasar.js` kini punya `_TTL_SEMPIT` (520), `_ttlKanvas(id, hSempit)` (kanvas lebih tinggi saat sempit) dan `_ttlTeks(ctx, teks, x, y, maxW)` (kecilkan huruf sampai 85 % lalu pecah per kata); tiap `animasi/modul-N.js` punya cabang tata letak `sempit`. **Pemeriksanya `python scripts/cad-modul/periksa_animasi_chrome.py`** (Chrome headless; halaman uji dirakit dari `materi()` + skrip animasi, jadi tanpa membangun ulang): 33 lebar 1000..204, siklus 460 bingkai pada slider bawaan/min/maks, kisi keadaan dijeda, dan `requestAnimationFrame` dimatikan agar deterministik. Pada lebar ≥ 244 teks terpotong, huruf < 8 px, teks bertumpuk, garis yang mencoret tinta teks (label duduk di atas garis; kisi samar beropasitas < 0,2 diabaikan), atau galat JavaScript = cacat; semua 56 animasi kini nol (dari 1.250 teks terpotong dan ±900 label di atas garis pada pengukuran awal). Label yang memang harus menumpang garis (nilai dimensi di tengah garis dimensinya, label di atas kurva) memakai `_ttlLabel`, yang menggambar pelat warna latar di belakang teks sehingga garis yang digambar sebelumnya terputus. `--cepat` untuk iterasi, `--gambar DIR` menyimpan PNG tiap kanvas. Mengubah skrip animasi: jalankan pemeriksa ini, lalu bangun ulang halaman modulnya. Memperbaiki gambar modul yang sudah terbit: `bangun.py N` → `tambah-progres-modul.mjs` → `pasang-tautan-pdf.py`, lalu bangun ulang Word/PDF modul itu; pada pembangunan ulang, `bangun.py` tidak menyentuh CLAUDE.md dan Pedoman karena hitungannya tidak berubah.
- **UTS/UAS CAD (20 September 2026).** `Pemodelan-Computer-Aided-Design/Exam/UTS.html` dan `UAS.html`
  dibangun `python scripts/cad-exam/bangun.py uts|uas` dari kerangka ujian Teknik Tenaga Listrik.
  Bentuknya berbeda dari ujian lain: UTS 30 soal (mc1–mc20 lalu c1–c10 tugas unggah model), UAS 31 soal
  (tambahan c11 tugas rakitan, soal bernilai tertinggi 10,43 poin). Tidak ada soal benar-salah dan tidak
  ada Pyodide; soal komputasi memakai kartu unggah `.FCStd` + kolom angka seperti kartu tugas modul,
  tetapi memanggil `unggahBerkasTugas` dengan `examId` (bukan `modulId`) dan dinilai `checkExamAnswer`.
  Pemeriksanya `python scripts/cad-exam/periksa_exam.py` (gagal keras bila sisa Pyodide/benar-salah
  tertinggal atau jumlah kartu soal salah); pemetaan Sub-CPMK dijaga `verify-obe-mapping.js` di backend
  (jalankan manual — skrip itu butuh kedua repo). Jadwalnya `settings/pemodelan_cad/uts|uas/schedule`.
  Blok widget chat AI (`AI-CHAT-AGENT:BEGIN/END`) diambil **utuh dari kerangka**: blok itu dihasilkan satu sumber di
  repo backend (`frontend-integration/apply-ai-chat.js`) untuk 96 halaman dan sudah mengenal keenam mata kuliah,
  jadi generator menyisihkannya sebelum sapuan `teknik_tenaga_listrik → pemodelan_cad` lalu mengembalikannya, dan
  `periksa_exam.py` mengecualikannya dari pemeriksaan sisa kerangka (tetapi mewajibkan blok itu mengenal Pemodelan
  CAD). Sebelum 24 September 2026 generator menambal blok itu sendiri, sehingga build gagal sejak blok diseragamkan
  (#938); kini `bangun.py uts|uas` lalu `node scripts/jawaban-privat.mjs` dan, paling akhir, `node scripts/draft-ujian.mjs`
  kembali mereproduksi halaman live byte demi byte (sejak 29 September 2026 kedua injektor itu wajib: blok
  `JAWABAN-PRIVAT:ANGKA-CAD` — angka bacaan yang dinilai setelah muat ulang, §6.3 — hanya dipasang di halaman CAD dan
  tidak ada di kerangka TTL, sedangkan blok `DRAFT-UJIAN:KUNCI` dibuang generator, §17.1; jadi keluaran `bangun.py`
  saja tidak memuat keduanya dan `validate-public-security.mjs` menolaknya). Kartu tugas ujian mengikuti
  validasi isi berkas di server: pesan unggah menampilkan ringkasan geometri, konfirmasi kirim menyebut bahwa angka
  harus terbaca dari geometri berkas, dan penolakan server (angka tidak ada di model) tampil sebagai peringatan tanpa
  mengunci kartu. Ujian tetap satu kesempatan dengan partial 0,5 (rakitan `c11` UAS: 3 poin). Label navbar kerangka
  `TENAGALISTRIK // UTS|UAS` dipetakan menjadi `PEMODELANCAD // UTS|UAS`, dan build gagal bila kerangkanya masih
  berlabel lain (sejak 26 September 2026, §17.1).
- **Kartu tugas** (`c1`–`c5`, label T1–T5): input berkas + tombol ⬆ Unggah (`unggahBerkasTugas`: ekstensi dari server, maks 8 MB, tanda ZIP + `Document.xml`; boleh diganti selama belum dikirim) + kolom angka (`kirimTugas` → `checkModulAnswer` dengan `userAnswer` angka, koma/titik desimal diterima) + konfirmasi kirim. Respons `bisaUlang` membuka kartu lagi lewat `_bukaKirimUlangCad` (tombol "🔁 Kirim Ulang (maks 65%)", unggah aktif, `berkasDiServer` membolehkan kirim tanpa unggah ulang); penanda RTDB `cN_comp_ulang` (dan `_comp_used`/`_comp_partial` lama) dipulihkan sebagai kartu terbuka, dan `window._cadSudahKirim` membuat ekspor tetap siap. Penolakan server (angka tidak terbaca dari berkas, berkas tak terbaca) ditampilkan sebagai peringatan tanpa mengunci. `SCORE_CONFIG`: `COMP_EZ_COUNT 3 × 6`, `COMP_HARD_COUNT 2 × 11`, `_isHardComp` = c4–c5, konsolasi 12 dari 15 soal. Setelah muat ulang, ringkasan berkas yang dinilai dipulihkan dari ledger lewat `getJawabanSaya` (`kode`), dan sejak 29 September 2026 angka bacaan yang dinilai (`angka`, attempt terakhir) mengisi kolom angka lewat blok `JAWABAN-PRIVAT:ANGKA-CAD` (§6.3): tugas benar terkunci berisi angka itu, tugas yang dibuka lagi untuk kirim ulang terisi angka kiriman terakhir tanpa dikunci bila kolomnya masih kosong. Angka dan metadata unggahan yang belum dikirim disimpan di draft localStorage per modul dan per NIM lalu pulih setelah muat ulang (butir **Draft materi** §6.3); kolom tugas yang sudah dinilai tetap berisi angka ledger. Tautan Google Drive opsional. Ekspor HTML memuat nama berkas, ukuran, SHA-256, dan angka bacaan — juga setelah muat ulang (§6.4).
- **Backend:** `_MODUL_COURSES` `{ slug: "pemodelan_cad", id: "pemodelan_cad", moduls: [1, …, 14], consolationThreshold: 12 }` (Modul 1 saja pada tahap ini; kini 1–14), bank `functions/modules/cad-modul-all-v2.js` (+ `cad-modul-1.js` … `cad-modul-14.js`, `cad-helpers.js`), seed `seed/modul/pemodelan_cad-modul-N-answers.js`, PG diacak per NIM, `pemodelan_cad` di keempat daftar course `database.rules.json`, penjaga `scripts/verify-cad-modules.js`. Berkas di bucket privat `getaran-mekanik-tugas` (`tugas/<modulId>/mhs_<nim>/<qId>/<nama>`), metadata Firestore `tugasBerkas/`. Callable: `unggahBerkasTugas` (mahasiswa), `unduhBerkasTugas` (dosen, atau pemilik dengan PIN), `daftarBerkasTugas` (dosen).
- **Modul-Word CAD (21 September 2026) diturunkan dari HTML-nya oleh generator** `scripts/cad-modul/buat-modul-word.py N` (atau `--semua`; jalankan dengan `PYTHONIOENCODING=utf-8`). Polanya sama dengan TTL — kerangka sampul/header/footer BOP dari `Sistem-Kendali-Cerdas/Modul-Word/Modul-1-…docx`, panel MODUL INTERAKTIF dari `panel-modul-interaktif-docx.py`, SVG dirender PNG lewat PyMuPDF setelah `warna_mupdf()` mengganti `rgba()` dan gradien yang oleh MuPDF dicetak hitam dan `garis_putus_mupdf()` memecah garis putus-putus yang oleh MuPDF dicetak utuh — dengan empat beda khas CAD. (a) **Tidak ada RPS JavaScript untuk CAD**, sehingga "Bahan kajian" diambil dari paragraf cakupan `Banner/Banner-Pertemuan-P.html` (Pertemuan 8 = UTS, jadi Modul 8–14 memakai banner 9–15) dan chip banner menjadi butir "Kata kunci"; "Indikator" dirakit dari butir yang benar-benar dinilai di halaman modul (jumlah PG, kelima label tugas beserta poin 6/6/6/11/11 dan bentuk setorannya, jumlah pertanyaan forum); Sub-CPMK/bobot/SKS/kode MK dari berkas asesmen. Tidak ada kalimat yang dikarang di luar repo. (b) Bagian tugas berjudul "Bagian A — Pilihan Ganda" dan "Bagian B — Tugas Pemodelan FreeCAD (unggah .FCStd + angka bacaan)", bukan Komputasi Mudah/Sulit; `compEzDefs` dan `compHardDefs` dibaca per-array (regex menyapu seluruh berkas akan mencampur c1–c5). (c) Gambar acuan tugas ikut dicetak — labelnya simbolik (a, b, h, rᵢ, rₒ, θ) tanpa angka per-NIM, dan karena teks tugas dirakit server, gambar itulah satu-satunya isi tugas yang bisa disiapkan mahasiswa lebih awal. (d) `div.warning-box` khas CAD ikut sebagai kotak catatan, dan sampulnya dua baris `PEMODELAN`/`CAD` karena nama penuh tidak muat di kotak judul. Lanjutan pipeline: `python scripts/docx-ke-pdf.py Pemodelan-Computer-Aided-Design/Modul-Word/*.docx` → `python scripts/cad-modul/pasang-tautan-pdf.py` (`--periksa` melapor; idempoten) → `python scripts/gabung-pdf-modul.py --buat-baru` (`Modul-Gabungan-Pemodelan-Computer-Aided-Design.pdf`, 303 halaman; skrip itu menulis ulang berkas gabungan **semua** course, jadi kembalikan lima berkas course lain dengan `git checkout --` agar diff tetap sempit). Hasil render 14 PDF: 18–25 halaman per modul, di atas minimum 10 halaman isi §15. **`bangun-modul-1.py` dan `bangun.py` mengosongkan kembali `MODUL_PDF_URL`/`MODUL_PDF_FILENAME` setiap kali dijalankan**, jadi `pasang-tautan-pdf.py` harus diulang sesudahnya — dan bangun ulang Word-nya juga bila `modul_N.py` berubah, agar dokumen tetap identik dengan halaman.
- **Dosen:** `Admin/berkas-tugas.html` mendaftar dan mengunduh berkas per modul beserta status penilaian (berkas akun simulasi disaring kecuali dicentang). Course CAD juga ada di pilihan `reset-soal`, `rescale-deadline`, `verify-export-code`, `analyze-victims`.
- **Validator:** modul CAD dihitung `validate-all-course-modern-design.mjs` lewat `moduleCount` (1 pada tahap ini; kini 14); CAD sempat di `obeOnlyRoots` validator keamanan sampai UTS/UAS-nya ada. Hitungan: 84 modul dengan tombol ekspor terjaga dan 108 halaman ber-autentikasi (96 Modul/Exam + 6 OBE + 6 Admin). Roster memuat akun simulasi. Daftar "belum" pada tahap ini — UTS/UAS, `OBE_COURSE_EXAMS`, registry chat AI backend, versi Word/PDF, banner LMS — **seluruhnya sudah terbit 20–21 September 2026**; CAD kini dipindai lewat `courseRoots`. Yang tersisa waktu itu hanya jadwal `settings/pemodelan_cad/…`, yang diisi dosen pekan demi pekan (Modul 2 pada 22 September 2026, butir Kelas LMS CAD di bawah).

**Teknik Tenaga Listrik — Tahap 1 (13 September 2026).** Mata kuliah semester 5 (kelas SIA 354290, `W132500023`, `2A51362F`, Sabtu 12:00–13:40), ditambahkan dengan pola yang sama seperti Pemodelan CAD: `Attributes/Asesmen-Teknik-Tenaga-Listrik.json`, `Attributes/students.json` (20 mahasiswa dari presensi SIA), `OBE/Penilaian-OBE.htm`, `Unduhan-Gabungan/RPS-Teknik-Tenaga-Listrik.pdf`, kartu di `index.html`, baris `rsync`, `obeOnlyRoots`, dan `teknik_tenaga_listrik` di `OBE_MAPPING_COURSES`. Sejak 14 September 2026 modulnya dibangun satu per satu atas permintaan dosen (modul berikutnya menunggu persetujuan modul sebelumnya): **Modul 1–14, UTS, dan UAS sudah terbit** (Modul 2–9 dan UTS pada 19 September 2026, Modul 10–14 dan UAS pada 20 September 2026; UTS = `teknik-tenaga-listrik-uts`, 45 soal parametrik, cakupan Sub-CPMK 1.1/1.2/1.3/2.1/3.1 sesuai matriks SIA); **Modul-Word 1–14 (docx + PDF) dan `Unduhan-Gabungan/Modul-Gabungan-Teknik-Tenaga-Listrik.pdf` terbit 20 September 2026** (lihat butir Modul-Word di bawah). Banner LMS untuk seluruh semester sudah ada (lihat butir Kelas LMS di bawah).

- **RPS sudah diselaraskan dengan SIA (14 September 2026).** RPS Juni 2025 memakai 6 CPMK dan 13 Sub-CPMK dengan rumusan lain serta bobot 60/20/20. `Unduhan-Gabungan/RPS-Teknik-Tenaga-Listrik.pdf` kini disusun ulang dari `Asesmen-Teknik-Tenaga-Listrik.json`: 7 CPMK, 14 Sub-CPMK, TGS 43%/UTS 25%/UAS 32%, CPL2/CPL5/CPL6 = 21/57/22 (CPL2 ← CPMK 1; CPL5 ← CPMK 2–5; CPL6 ← CPMK 6–7). Tata letaknya mengikuti RPS lama (sampul, Satuan Acara Perkuliahan, RPS, catatan); pengembang dan pengesah RPS tetap, dengan catatan revisi. Bila bobot di SIA berubah, RPS harus disusun ulang bersama berkas asesmen. Skrip penyusunnya ada di `scripts/rps-teknik-tenaga-listrik/buat-rps.js` (butuh paket `docx` dan LibreOffice). Setiap modul yang terbit dicocokkan dengan baris minggunya (materi, indikator, pustaka); baris minggu 1–7 dan 9–15 sudah diperbarui mengikuti Modul 1–14, termasuk von Meier (2006) dan Chapman (2012) di pustaka pendukung.
- Halaman OBE-nya merender jumlah kolom CPMK (7) dan CPL secara dinamis; templat lama mengunci 5 CPMK dan 4 CPL.
- **Modul-Word TTL (20 September 2026) diturunkan dari HTML-nya oleh generator** `scripts/ttl-modul/buat-modul-word.py N` (atau `--semua`; jalankan dengan `PYTHONIOENCODING=utf-8`). Sumber kebenarannya `Modul-N.html`: hero → Pendahuluan dan abstrak sampul, setiap `div.section` → heading beserta paragraf, gambar SVG (dirender PNG lewat PyMuPDF oleh `scripts/svg_word.py`, modul yang sama dengan CAD: `<` dan `&` telanjang di-escape, warna disesuaikan `warna_mupdf`, dan sejak 22 September 2026 garis putus-putus dipecah menjadi strip oleh `garis_putus_mupdf` — 41 elemen di 26 gambar TTL yang sebelumnya tercetak utuh; selisihnya terhadap render Chrome turun dari 37.100 menjadi 48 piksel. Perluasan kanvas dipakai seperti CAD sejak ke-84 gambar TTL dirapikan pada 22 September 2026; tidak ada gambar TTL yang kini meluap di MuPDF), persamaan bernomor, kartu, tabel, kotak info/tip, panel animasi, dan blok kode; tab Tugas → PG dan label C1–C15 tanpa kunci; tab Forum → skenario dan pertanyaan; Daftar Pustaka = kartu pustaka modul + jurnal/standar klasik per modul yang tercantum di `JURNAL` (tanpa tautan DOI; pustaka klasik yang dosen boleh ganti). Kerangkanya sampul/header/footer BOP dari `Sistem-Kendali-Cerdas/Modul-Word/Modul-1-…docx` dengan identitas diganti di XML (kode MK `W132500023`, tahun 2026–2027, kotak "Modul N"/abstrak/Sub-CPMK diatur ulang agar tidak terpotong), panel MODUL INTERAKTIF dari `panel-modul-interaktif-docx.py`, dan media Sisken yang tidak terpakai dibuang. Nama berkas `Modul-N-<Judul-Tanpa-Diakritik>.docx` dari `pustaka.nama_berkas_word` dengan judul `<title>` halaman (`JUDUL_PANJANG` di `modul_N.py`, bukan `JUDUL` pendek), dan `bangun.py` menulis `MODUL_PDF_URL`/`MODUL_PDF_FILENAME` dari judul yang sama ke halaman modul (`scripts/ttl-modul/pasang-tautan-pdf.py` untuk memasangnya ulang; `--periksa` melapor, dan sesudah regenerasi harus "diubah 0"). Sebelum 29 September 2026 `bangun.py` memakai `JUDUL`, yang berbeda di Modul 2, 3, 4, dan 6, sehingga regenerasi tanpa `pasang-tautan-pdf.py` menautkan PDF yang tidak ada (404); kini `bangun.py` juga berhenti bila `Modul-Word/` sudah memuat `Modul-N-*.pdf` dengan nama lain, karena nama berkas yang sudah terbit tidak boleh berganti (tautan LMS bisa memakainya). Lanjutan pipeline: `python scripts/docx-ke-pdf.py Teknik-Tenaga-Listrik/Modul-Word/*.docx` → `python scripts/gabung-pdf-modul.py --buat-baru` (Modul-Gabungan-Teknik-Tenaga-Listrik.pdf; PDF gabungan course lain tidak boleh berubah). Hasil render 14 PDF: 18–24 halaman per modul, di atas minimum 10 halaman isi §15. Setelah mengubah `modul_N.py`/`bangun.py`, bangun ulang Word-nya juga agar tetap identik dengan HTML.
- Pemetaan Modul N → Sub-CPMK ke-N ditetapkan di RPS revisi: Modul 1–7 minggu 1–7, UTS minggu 8, Modul 8–14 minggu 9–15, UAS minggu 16. Cakupan ujian SIA cocok dengan urutan ini (UTS Sub-CPMK 1.1–3.1, UAS 3.2–7.2).
- Roster memuat akun simulasi (`41399999901`) sejak Modul 1 terbit.
- **Modul 1 — Konsep Dasar Sistem Tenaga Listrik (Sub-CPMK 1.1)** dibangun dari kerangka Sisken Modul 1 (6 tab, 9 bagian materi, 6 gambar, 5 animasi, 4 cell Python) dengan skrip sekali pakai, sehingga semua lapisan injektor sudah ada; `tambah-progres-modul.mjs` menyisipkan 9 kotak centang. Tugas memakai struktur universal 25 soal/50 poin: 10 PG diacak per NIM (`mcOrderVersion: 1`) dan 15 komputasi parametrik per NIM dari `functions/modules/ttl-modul-all-v2.js` (satu berkas bank untuk seluruh modul TTL, modul ditambah lewat `register()`); kunci PG di `functions/seed/modul/teknik_tenaga_listrik-modul-N-answers.js`, penjaganya `scripts/verify-ttl-modules.js`.
- Backend hanya mendaftarkan modul yang sudah terbit lewat `moduls: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]` pada entri `_MODUL_COURSES`. Modul yang belum terdaftar ditolak callable progres dan gerbang antar-modul meloloskan modul sesudahnya, jadi setiap modul baru wajib ditambahkan di sana bersama bank, seed (`seed_scope=modul:custom`), dan halamannya, dengan urutan deploy backend lebih dulu.
- Validator: TTL sudah masuk `courseRoots` validator keamanan (UTS dan UAS lengkap sejak 20 September 2026); `validate-all-course-modern-design.mjs` memeriksanya lewat `moduleCount` (sekarang 14, lengkap). Hitungan saat itu (TTL lengkap, modul CAD belum dihitung): 70 modul dengan tombol ekspor terjaga dan 91 halaman ber-autentikasi admin (80 Modul/Exam); kini 84 modul dan 108 halaman (§17.1). `OBE_COURSE_EXAMS` backend dan `verify-obe-mapping.js` memuat TTL (UTS+UAS); halaman OBE TTL memuat `DEFAULT_MAPPING.uts` dan `.uas` (MAP_KEY v5).
- **Modul 2 dst (sejak 19 September 2026) dibangun generator** `scripts/ttl-modul/bangun.py N` dari `Modul-1.html` TTL (kerangka yang sudah memuat semua lapisan injektor) dan konten `scripts/ttl-modul/modul_N.py` + `animasi/modul-N.js`; helper bersama di `pustaka.py` dan `animasi/dasar.js`. **Gambar SVG TTL diperiksa `python scripts/ttl-modul/periksa_gambar_chrome.py` lalu `--inter`** (pembungkus pemeriksa CAD: aturan, getBBox, dan kotak tinta yang sama, sumbernya `gambar1..6` tiap `modul_N.py`); keduanya harus "0 cacat". Pada 22 September 2026 pemeriksa ini menemukan 405 cacat di 67 dari 84 gambar yang semuanya tampil di halaman web — keterangan satu baris lebih lebar dari gambarnya, label bertumpuk atau dicoret garis, batang 500 kV Modul 8 Gambar 2 di luar kanvas (pembagi posisi 3 untuk empat tingkat), kurva yang keluar sumbu (M3 G4, M6 G3, M14 G3), label berkas-2 M8 G6 di x ≈ 1800 — dan kecepatan rambat "0×10³ km/s" di M6 (gambar dan teks materi; kini 296×10³ km/s). Semuanya dirapikan. Bantuan di `pustaka.py`: `teks2` memecah keterangan panjang, dan `svg()` memanggil `lubangi_kisi`, yang memutus garis kisi (stroke `GRID`, tebal 0,7) tepat di belakang setiap label sehingga label di dalam grafik tidak dicoret kisi. Memperbaiki gambar TTL yang sudah terbit: Modul 2–14 lewat `bangun.py N` → `tambah-progres-modul.mjs` → `pasang-tautan-pdf.py` (jalur ini mereproduksi halaman live byte demi byte bila sumbernya tidak berubah); Modul 1 dibangun skrip sekali pakai dari halaman Sisken, jadi SVG gambarnya diganti di tempat dengan keluaran `modul_1.gambarK()`. Lalu bangun ulang Word/PDF-nya. **Animasi kanvas TTL wajib tahan kanvas tersembunyi (sejak 29 September 2026).** Animasi yang berjalan tetap dipanggil `requestAnimationFrame` saat mahasiswa pindah ke tab Forum/Tugas/Hasil, dan `_ttlKanvas` TTL (`animasi/dasar.js`, juga salinannya di `animasi/modul-1.js`) memberi `W = 0` untuk kanvas tersembunyi (`clientWidth` 0) — berbeda dengan `_ttlKanvas` CAD, yang memakai lebar buffer (`cv.clientWidth||cv.width`). Karena itu setiap radius `arc`/`ellipse` (juga `createRadialGradient` dan radius `roundRect`) yang dihitung dari `W`/`H` harus tetap tidak negatif pada `W = 0`: lewati gambar bila rentangnya tanpa lebar pakai (pola `_ttlReaktor7` Modul 7: `if(!(x2>x1)) return;`) atau jepit dengan `Math.max(0,…)`. Radius negatif melempar `IndexSizeError`, dan galat di dalam callback rAF menghentikan animasinya sampai tombol PAUSE/PLAY ditekan atau halaman dimuat ulang: Animasi 3 Modul 7 (reduksi jaringan, reaktor `(x2−x1)/8` dari `xB = 0,62W` dan `xC = W−40`) membeku setiap kali mahasiswa membuka Forum saat animasinya berjalan, dan pada keadaan dijeda galatnya muncul saat jendela di-resize dari tab lain. Survei headless 29 September 2026 atas ke-14 modul TTL dan ke-14 modul CAD (pindah ke Forum saat animasi berjalan lalu kembali, kanvas tersembunyi, lebar kanvas 0–244 px, slider bawaan/min/maks, viewport 1280 dan 375) hanya menemukan kasus Modul 7 itu; kanvas CAD baru bergalat pada lebar terlihat di bawah 90 px (radius negatif `cvParametrik` Modul 1 di bawah 65 px dan `cvKtLubang` Modul 9 di bawah 90 px; loop kisi tak berujung `cvChain` Modul 4 pada 32 px ke bawah), jauh di bawah kanvas ponsel 320 px (204 px), jadi dibiarkan. `periksa_gambar_chrome.py` hanya memeriksa SVG dan `scripts/cad-modul/periksa_animasi_chrome.py` hanya kanvas CAD pada lebar 1000..204, sehingga keduanya tidak menangkap kelas galat ini; penjaganya **`python scripts/ttl-modul/periksa_animasi_chrome.py`** (sejak 29 September 2026, wajib "0 galat"). Pemeriksa ini (skrip ukurnya `uji_animasi.js`) merakit halaman uji dari `modul_N.materi()` dengan requestAnimationFrame dimatikan, lalu memanggil setiap fungsi gambar di `_TTL_DAFTAR` (Modul 1: daftar kickoff di `modul-1.js`) pada kanvas tersembunyi (induk `display:none`, buffer tetap/1000/204), lebar 0, dan lebar nyata 1000..204, masing-masing 120 bingkai berjalan × slider bawaan/min/maks ditambah kisi slider dalam keadaan dijeda; setiap exception membuat kode keluar 1, sedangkan lebar 150..1 px hanya peringatan. Bawaannya menguji dua salinan animasi sekaligus: sumber (`dasar.js` + `modul-N.js`, `--sumber`) dan skrip yang terbit di `<script id="ttl-modul-N-animations">` `Modul-N.html` (`--halaman`), sehingga halaman yang tertinggal dari sumbernya ikut tertangkap. Modul 1–14 ≈ 2 menit, 0 galat dan 0 peringatan; terhadap Modul 7 sebelum perbaikan (sumber maupun halaman) ia melaporkan `IndexSizeError` radius −2,5 di `cvReduksi` pada keempat keadaan W = 0. Tata letak teks kanvas TTL tidak diperiksanya. Memperbaiki animasi TTL yang sudah terbit: sunting `animasi/modul-N.js` (uji dulu `periksa_animasi_chrome.py N --sumber`), lalu `bangun.py N` → seluruh injektor §17.1 (`--periksa` masing-masing 0 sesudahnya) → `pasang-tautan-pdf.py` → `periksa_animasi_chrome.py N` (sumber + halaman); Word/PDF tidak perlu dibangun ulang karena `buat-modul-word.py` melewati `<script>` dan `<canvas>`. Menyunting `animasi/dasar.js` mengubah ke-13 halaman Modul 2–14, jadi semuanya harus dibangun ulang bersama. Generator mengganti identitas ber-angka, subnav, hero, materi, PG, forum (beserta salinan LMS dan kanvas), animasi, dan label ekspor, lalu membuang tab Setup Python dan Pembagian Kelompok (pola Sisken Modul 2–14). Setelah membangun: jalankan `tambah-progres-modul.mjs` (kotak centang), naikkan `moduleCount` dan hitungan validator keamanan, tambah tautan di `index.html`, tambah nomor ke `PUBLISHED` di `ttl-banner.mjs` lalu `node scripts/ttl-banner.mjs`, dan cocokkan baris minggunya di RPS. Backend: `functions/modules/ttl-modul-N.js` + seed + nomor di `moduls` + deploy dan seed `modul:custom` **sebelum** merge frontend. Modul 2 (Komponen Sistem Tenaga Listrik, Sub-CPMK 1.2): 9 bagian, 6 gambar, 10 persamaan, 4 animasi, 4 cell. Modul 3 (Daya pada Jaringan DC Satu Sumber, Sub-CPMK 1.3): 8 bagian, 6 gambar, 10 persamaan, 4 animasi, 4 cell. Modul 4 (Daya pada Jaringan DC Dua Sumber, Sub-CPMK 2.1): 8 bagian, 6 gambar, 10 persamaan, 4 animasi, 4 cell; angka contohnya sengaja berbeda dari varian soal C1–C15. Modul 5 (Daya pada Jaringan Listrik AC, Sub-CPMK 2.2): 8 bagian, 6 gambar, 10 persamaan, 4 animasi, 4 cell; bangun dengan `PYTHONIOENCODING=utf-8` agar cetakan pemeriksaan sisa tidak gagal di konsol cp1252. Modul 6 (Aliran Daya dan Transien Saluran Transmisi, Sub-CPMK 3.1): 8 bagian, 6 gambar, 10 persamaan, 4 animasi, 4 cell. Modul 7 (Reaktansi dan Impedansi di STL, Sub-CPMK 3.2): 8 bagian, 6 gambar, 10 persamaan, 4 animasi, 4 cell. Modul 8 (Saluran Transmisi, Sub-CPMK 4.1, Pertemuan 9): 8 bagian, 6 gambar, 8 persamaan, 4 animasi, 4 cell. Modul 9 (Pemodelan Saluran Transmisi, Sub-CPMK 4.2, Pertemuan 10): 8 bagian, 6 gambar, 9 persamaan, 4 animasi, 4 cell. Modul 10 (Kompensasi dalam Sistem Distribusi, Sub-CPMK 5.1, Pertemuan 11): 8 bagian, 6 gambar, 6 persamaan, 4 animasi, 4 cell. Modul 11 (Konsep dan Teori Dasar Sistem Distribusi Tenaga Listrik, Sub-CPMK 5.2, Pertemuan 12): 8 bagian, 6 gambar, 6 persamaan, 4 animasi, 4 cell. Modul 12 (Aliran Daya, Peralatan, dan Pengembangan Sistem Distribusi, Sub-CPMK 6.1, Pertemuan 13): 8 bagian, 6 gambar, 6 persamaan, 4 animasi, 4 cell. Modul 13 (Metode Single Line Diagram, Sub-CPMK 7.1, Pertemuan 14): 8 bagian, 6 gambar, 6 persamaan, 4 animasi, 4 cell. Modul 14 (Metode Analisis Aliran Daya, Sub-CPMK 7.2, Pertemuan 15): 8 bagian, 6 gambar, 6 persamaan, 4 animasi, 4 cell.
- **Terdaftar di agen AI sejak 20 September 2026** (backend PR #74): `functions/chat/module-registry.js` memuat 14 modul + `teknik-tenaga-listrik-uts`/`-uas` beserta metadata resmi dari berkas asesmen (W132500023, 2 SKS, kelas 2A51362F, bobot 43/25/32, Sub-CPMK UTS 1.1–3.1 dan UAS 3.2–7.2) dan semester Ganjil 2026/2027 yang di-override per course; `knowledge-base.json` dibangun ulang menjadi 2.224 potongan untuk lima mata kuliah (TTL 414 potongan). Sebelum itu `aiChat` menolak moduleId TTL dengan "Modul tidak dikenal". Lima alat `Admin/` juga sudah memuat TTL (`berkas-tugas.html` khusus unggahan CAD, tidak berlaku untuk TTL). Versi Word/PDF modul terbit 20 September 2026, jadi tombol Export PDF mengunduh berkasnya.
- **Kelas LMS (FAST Learning course id 5923, kelas 2F Sabtu Reguler 2, 19 September 2026).** Halaman kelas mengikuti pola Getaran/Opto/Math dengan desain banner Sistem Kendali Cerdas: banner Introduction di section General; tiap section pekan dinamai `Pertemuan P · <hari, tanggal> · Modul N · <tipe>` dengan banner pertemuan sebagai ringkasan section; pekan TMV berisi Google Meet™ for Moodle + Attendance + Tugas + Forum, pekan Daring berisi Tugas + Forum; UTS (7–20 November 2026) dan UAS (9–22 Januari 2027) masing-masing satu section banner + `UTS/UAS — Submit Hasil Export` (tanggal ujian mengikuti web SIA, jadi tanpa due date), pekan kedua masa ujian memakai strip banner lanjutan. **Aktivitas dibuat sesuai minggunya** (keputusan dosen 19 September 2026): banner boleh dipasang untuk seluruh semester, tetapi Google Meet, Attendance, Tugas, dan Forum tiap pekan baru dibuat pada pekannya lewat form Add an activity — Google Meet wajib lewat UI form agar room dibuat plugin — dan tombol Meet di banner tetap nonaktif ("Google Meet belum dibuka") sampai pekannya tiba. Jadwal mengikuti Kalender Perkuliahan Fast Learning Ganjil 2026/2027 kode kelas 2F: TMV pada P1/3/5/7/9/11/13/15 (P9 dan P15 di kalender tertulis TMK, tetapi dosen menjalankannya sebagai TMV), Daring pada P2/4/6/10/12/14. Deadline Tugas dan Forum di LMS = Sabtu pertemuan + 6 hari, 23:59 WIB (sama dengan default modul). Banner dibuat `scripts/ttl-banner.mjs` (konfigurasi `PUBLISHED`, `EXAM_PUBLISHED`, `MEET_URL`, `KALENDER`, `MODUL`) ke `Teknik-Tenaga-Listrik/Banner/`; tombol modul aktif hanya untuk modul di `PUBLISHED` **yang pekannya sudah tiba** (gerbang `HARI_INI` = tanggal WIB saat generator dijalankan, dapat ditimpa `HARI_INI=YYYY-MM-DD`; permintaan dosen 20 September 2026 — modul terbit yang pekannya belum tiba tampil "Modul N dibuka <tanggal>", yang belum terbit "Modul N terbit menjelang pertemuan"; karena itu generator dijalankan ulang pada pekan P sebelum poster) dan tombol Meet menunjuk room di `MEET_URL` (seperti banner Sisken). Pengisian ke LMS memakai `scripts/ttl-lms-poster.js` dari konsol browser dosen (idempoten; aktivitas lewat form Add, bukan Duplicate; `activities:true` wajib disertai `only:[P]`; situs mewajibkan deskripsi aktivitas ≥ 100 karakter). **Rutinitas tiap pekan P:** (1) buat Google Meet pekan TMV lewat UI form dan salin room URL ke `MEET_URL`; (2) bila modulnya terbit, tambahkan nomornya ke `PUBLISHED`; (3) jalankan generator, commit; (4) `ttlPoster.run({sections:true, activities:true, only:[P]})` untuk memasang banner baru dan membuat Attendance/Tugas/Forum pekan itu. Catatan 19 September 2026: Pertemuan 1 sengaja **tanpa forum LMS** — menurut dosen, FAST memang diatur agar pekan tertentu tidak memiliki forum; gejalanya form Forum mengembalikan halaman form tanpa pesan galat (tambah maupun ubah). Untuk pekan seperti itu jalankan poster dengan `forum:false`; mahasiswa tetap mengerjakan Forum di halaman modul.
- **Kelas LMS Pemodelan CAD (FAST Learning course id 4601, kelas Reguler 2 Selasa 19:30–22:00, kode SIA 2A2132FF / kelas 354322, 20 September 2026).** Disusun dengan pola yang sama persis seperti TTL: `scripts/cad-banner.mjs` (konfigurasi `PUBLISHED`, `EXAM_PUBLISHED`, `MEET_URL`, `WA_URL`, `KALENDER`, `MODUL`) menulis 19 banner ke `Pemodelan-Computer-Aided-Design/Banner/` (Introduction, 14 pertemuan modul, UTS/UAS + strip lanjutan), dan `scripts/cad-lms-poster.js` (`cadPoster.run`, cabang lewat `window.CAD_BRANCH`) memasangnya dari konsol browser dosen ke section 75890–75908 course 4601. Kalender mengikuti Surat Edaran 01-1/886/B-Ed/VII/2026 (Tipe Perkuliahan Semester Gasal 2026/2027): kelas Reguler 2 Senin–Jumat 19:30–22:00 bertipe Fast Learning — TMV pada P1/3/5/7/9/11/13/15, Daring (forum/kuis) pada P2/4/6/10/12/14, UTS P8, UAS P16, tanpa pekan tatap muka kelas; semester mulai 14 September 2026 sehingga P1 = Selasa 15 September 2026 (= tanggal mulai course Moodle), UTS 3–16 November 2026, UAS 5–18 Januari 2027 (rentang pekan; hari/jam ujian mengikuti web SIA). Deadline Tugas dan Forum = Selasa pertemuan + 6 hari (Senin 23:59 WIB). Alur pembelajaran di banner memakai bentuk tugas CAD (10 PG + 5 tugas pemodelan .FCStd + angka bacaan, 3 diskusi forum, export HTML); cakupan banner UTS = Modul 3–7 (Sub-CPMK 2.1–2.5, bobot 22%) dan UAS = Modul 8–12 (Sub-CPMK 3.1–4.2, bobot 23%) sesuai Asesmen JSON. Judul Modul 5–14 di `MODUL` diambil dari daftar topik `pemodelan_cad` di `scripts/cad-modul/bangun-modul-1.py` (deskripsi/chip masih rencana; sesuaikan saat modulnya terbit). Grup WhatsApp kelas: `WA_URL` = https://chat.whatsapp.com/Dr6Jsi67Ey3Cb9jRHYUZGu (21 September 2026), tombol "Grup WhatsApp" tampil di banner Introduction di bawah tombol Silabus & Penilaian OBE, sama seperti TTL. Kebijakan aktivitas per pekan, Google Meet lewat UI form, dan `forum:false` sama dengan TTL. **Forum lewat UI form (temuan 22 September 2026, Pertemuan 2 CAD):** pengiriman form Forum oleh skrip poster selalu kembali ke form tanpa pesan galat (P1 dan P2, jadi bukan soal minggu ganjil), sedangkan form UI "Add an activity" dengan isian yang sama tersimpan normal. Buat Forum lewat form UI (nama `Forum Modul N — Submit Hasil Copy Forum`, tipe single, due date = deadline Tugas, lampiran maksimum 1) dan jalankan poster dengan `forum:false`. Setelah forum dibuat, dosen memberi satu balasan pembuka di bawah topik forum dengan HTML yang sama seperti Forum Modul 2 Sisken (course 4118, posting 147778, "I'm waiting for your response"). Jadwal Modul 2 CAD di RTDB diisi 22 September 2026 (`settings/pemodelan_cad/pertemuan-2/schedule`, durasi 7 hari, due 28 September 23:59 WIB = deadline LMS); `firebase database:set` dari berkas macet di proxy, pakai `--data '<json>'`. Tombol modul di banner mengikuti gerbang pekan yang sama dengan TTL (`HARI_INI`): aktif hanya bila modul ada di `PUBLISHED` **dan** tanggal pertemuannya (`aktual` bila ada) sudah tiba; jalankan generator ulang pada pekan P sebelum `cadPoster.run({sections:true, activities:true, only:[P]})`.

Setiap course mempunyai:

```text
<Course>/
├── Attributes/       roster, asesmen, dan halaman pendukung (RPS PDF gabungan ada di Unduhan-Gabungan/RPS-<Course>.pdf, bukan di sini)
├── Banner/           banner/pengumuman per pertemuan
├── Modul/            Modul-1.html sampai Modul-14.html
├── Exam/             UTS.html dan UAS.html
└── OBE/              Penilaian-OBE.htm
```

Inventaris utama saat ini:

- 84 modul: 14 per course untuk keenam mata kuliah;
- 12 exam: UTS dan UAS per course;
- 6 halaman OBE;
- total 102 halaman HTML inti;
- 6 halaman Admin HTML dan satu helper analisis Python.

Halaman standalone lama di `Attributes/` (`Nilai-Akhir.html`, `Pembagian-Kelompok.html`, `Setup-Python.html`) **sudah dihapus** dari Matematika 4, Getaran Mekanik, dan Optimalisasi. Halaman itu memakai login lama (nama + NIM, tanpa PIN) dan fungsinya sudah ada di dalam halaman modul. Tautannya di `index.html` ikut dihapus. Jangan membuatnya kembali; jika perlu, tambahkan sebagai tab di halaman modul supaya ikut gerbang PIN.

Sumber data course yang harus dipertahankan:

| Course | Asesmen |
|---|---|
| Matematika 4 | `Attributes/Asesmen-Matematika-4.json` |
| Getaran Mekanik | `Attributes/Asesmen-Getaran-Mekanik.json` |
| Optimalisasi & Otomasi | `Attributes/Asesmen-Optimalisasi-dan-Otomasi.json` |
| Sistem Kendali Cerdas | `Attributes/Asesmen-Sistem-Kendali-Cerdas.json` |
| Pemodelan Computer Aided Design (CAD) | `Attributes/Asesmen-Pemodelan-Computer-Aided-Design.json` |
| Teknik Tenaga Listrik | `Attributes/Asesmen-Teknik-Tenaga-Listrik.json` |

Roster login mahasiswa selalu berasal dari `Attributes/students.json` masing-masing course. Nama mahasiswa tidak diketik bebas ketika login.

---

**Urutan kanonik injector modul sesudah regenerasi apa pun** (TTL `bangun.py N`, CAD `bangun-modul-1.py`/`bangun.py N` + `pasang-tautan-pdf.py`, rantai Sisken §6.4; 29 September 2026): `jawaban-privat.mjs` + `pulihkan-pilihan-pg.mjs` → `samakan-kunci-identitas.mjs` → `tambah-progres-modul.mjs` → `simpan-pilihan-poll.mjs` → … → `notasi-halaman.mjs` → `notasi-ekspor.mjs` → `draft-modul.mjs` paling akhir, lalu `--periksa` semua injector harus 0 (rinciannya §17.1). Generator mewarisi blok-blok itu dari halaman sumbernya, jadi pada pembangunan ulang biasa injector hanya menambah kotak centang (`tambah-progres-modul.mjs`) dan sisanya 0.

**Notasi rumus di teks yang dirender (3 Oktober 2026, TTL dan CAD).** Laporan dosen: Gambar 2 Modul 3 TTL menulis "V_k = V · R_k / R_seri" — garis bawah tampil apa adanya di `<text>` SVG, padahal notasi yang sama di KaTeX tampil benar. Pemindaian menemukan pola yang sama di seluruh generator TTL/CAD (±1.700 kemunculan TTL, ±900 CAD: teks HTML, gambar SVG, kanvas animasi, readout, forum, PG, hero). Aturannya kini: (1) di sumber generator, subskrip dan pangkat di teks tampil ditulis `<sub>…</sub>`/`<sup>…</sup>` (R<sub>L</sub>, e<sup>−t/τ</sup>; prima ″/′, konjugat `<sup>*</sup>`, perkalian ·/×); KaTeX `\( \)` tetap LaTeX, dan segmen KaTeX yang dirakit dari beberapa literal (`r"\(K_t = " + ind(…) + r"\)"`) tidak boleh berisi `<sub>` — auto-render hanya mencari pembatas di dalam satu simpul teks; tanda `<` di dalam KaTeX ditulis `\lt` (TTL Modul 8 dan 14 sempat menulis `\sum_{k<i}`, yang dibaca peramban sebagai tag `<i`). (2) SVG: `pustaka.t()` (TTL dan CAD) mengubah penanda itu menjadi `<tspan>` lewat `rumus_svg` — subskrip 0,72× (minimal 8 unit bila teksnya lebih besar), turun 0,22 em, superskrip naik 0,38 em, ditulis dengan `dy` dan ukuran mutlak karena MuPDF (gambar Modul-Word) mengabaikan `baseline-shift` dan "membocorkan" `font-size` persen; `teks2` menghitung panjang tanpa penanda, `svg()` menulis `aria-label` tanpa markup (`teks_aria`), dan SVG yang ditulis langsung (`HERO_SCHEMATIC_*`) dibungkus `rumus_mentah()`. Teks yang memang kode yang diketik (alias/ekspresi Spreadsheet seperti `t_sigma = (6*F*L/(b*s_izin))^(1/2)`, nama objek FreeCAD `CCX_Results`) dibungkus `pustaka.Kode(...)`: tampil apa adanya dan bertanda `data-kode="1"`; di HTML ditulis `<code>…</code>`. (3) Kanvas: `_ttlKanvas` (`animasi/dasar.js` TTL dan CAD, juga salinan di `animasi/modul-1.js` TTL) membungkus konteksnya dengan `_ttlRumusKtx`, sehingga `fillText`/`measureText` — juga lewat `_ttlTeks`/`_ttlLabel` — menggambar teks berpenanda dengan `_ttlRumus`; teks tanpa penanda diteruskan apa adanya. `_ttlTulis` memasang penanda sebagai `<sub>`/`<sup>` (sisanya di-escape). Kanvas forum (`FORUM_KANVAS`) membungkus konteksnya sendiri dengan `_ttlRumusKtx` bila tersedia; literal kanvas berisi alias yang diketik diberi komentar `// notasi: kode` pada barisnya. (4) Placeholder textarea forum tidak bisa memuat markup: pakai huruf subskrip Unicode bila semua hurufnya tersedia (ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ, misalnya Iₙ, Zₚᵤ, Xₛ) atau tulis dengan kata ("arus hubung singkat"). (5) Modul-Word: `scripts/svg_word.py` (`tspan_mupdf`) menjangkarkan ulang `<text>` ber-tspan yang rata tengah/kanan karena MuPDF menjangkarkan tiap potongan sendiri-sendiri, dan `buat-modul-word.py` TTL/CAD mempertahankan subskrip pada judul, opsi PG, pertanyaan forum, label tugas, dan keterangan gambar acuan. (6) Pemeriksa tata letak: `ukur_gambar.js` mengukur tinta `<text>` ber-tspan per potongan (metrik pada 10× ukuran agar tidak dibulatkan), `ukur_animasi.js` menyatukan potongan satu rumus (`ctx.__rumus`). TTL Modul 1 adalah kerangka yang tidak dibangun dari nol; isinya disegarkan dari `modul_1.py` + `animasi/modul-1.js` oleh `python scripts/ttl-modul/segarkan-modul-1.py` (`--periksa` melapor; dari sumber yang tidak berubah hasilnya identik), lalu `tambah-progres-modul.mjs` dan `bangun.py 2..14`; rumus overlay login-nya kini `modul_1.RUMUS_LOGIN` berpenanda `<sub>` dan dipasang `el.innerHTML` (konstanta statis; halaman CAD mewarisi baris itu). Penjaganya `scripts/periksa-notasi.mjs`, yang dijalankan `validate-public-security.mjs` (§17.1).

**Notasi rumus di course lain dan halaman ujian (3 Oktober 2026, lanjutan laporan yang sama: "cek juga di modul-modul lain").** Aturannya sama, ditambah: (7) **Sisken Modul 2–14** (generator): `enrich-sisken-modules.mjs` melewatkan `page-modul` dan `page-forum` hasil generator ke `sisken-rumus.rapikanNotasiHtml`, yang hanya menyentuh simpul teks di luar tag, `<script>`/`<style>`/`<pre>`/`<code>`/`<textarea>`/`<svg>`, entitas, dan KaTeX: `wn`/`wd` → ω<sub>n</sub>/ω<sub>d</sub>; `Kp`, `Ki`, `Kd`, `Ku`, `Ti`, `Td`, `Tu`, `Ts`, `Mp`, `tr`, `tp`, `ts`, `ess` → subskrip; `tau`, `zeta`, `eta`, `mu`, `sigma`, `omega`, `Delta` → huruf Yunani (`delta Dirac` dan `3-sigma` tetap); `exp(…)` → e<sup>…</sup>; `sqrt(…)` → √(…); `a*b` → a·b (`u*(e)`, keluaran tegas, tetap); `+/-` → ±; `X_y`/`X^y` → `<sub>`/`<sup>` (pengenal huruf kecil ≥ 3 huruf seperti `solve_ivp` dibiarkan). Chip notasi kotak "Cara Membaca" (`<code>`) memakai `notasiTeks` yang sama. Huruf `z` untuk rasio redaman ditulis ζ langsung di `sisken-materi.mjs`/`sisken-forum.mjs` (tidak otomatis, karena `z` juga peubah neuron dan zero). Teks gambar (`sisken-ilustrasi-data.mjs`, `ilustrasi-statis-data.mjs`) memakai penanda `<sub>`/`<sup>` yang diubah `sisken-ilustrasi.teks()` menjadi `<tspan>` (`rumusSvg`, aturan dy/ukuran yang sama dengan `pustaka.rumus_svg`); kode yang diketik ditulis `<code>solve_ivp</code>` → `data-kode="1"`. Literal kanvas runtime Sisken (`sisken-animasi.mjs`) memakai penanda yang digambar blok `NOTASI-KANVAS`. (8) **Halaman tulisan tangan** (Getaran Mekanik, Matematika 4, Optimalisasi & Otomasi Modul 1–14, Sisken Modul 1, bagian Sisken 2–14 di luar keluaran enrich, ke-12 UTS/UAS): `scripts/notasi-halaman.mjs` memasang daftar eksplisit `scripts/notasi-halaman-data.json` — pasangan `[lama, baru]` berjangkar unik per halaman (subskrip/pangkat `<sub>`/`<sup>`, `<tspan>` pada `<text>` statis, penanda pada literal kanvas/readout dengan `textContent` → `innerHTML` bila isinya teks statis dan angka, overlay login `el.innerHTML = f.t`, teks `<option>` ditulis polos Unicode karena markup tidak dirender di sana) plus blok `NOTASI-KANVAS` v1 tepat sebelum `</head>` yang membungkus `CanvasRenderingContext2D.fillText`/`strokeText`/`measureText` (aturan `_ttlRumus`: 0,72×, minimal 8 px, turun 0,22 em/naik 0,38 em; teks tanpa penanda diteruskan apa adanya). Kode tidak diubah: `<pre>`, `<code>` yang berisi kode, nama parameter/variabel (`n_estimators`, `X_train`, `A_ub`, `solve_ivp`; literal kanvasnya diberi `// notasi: kode`), atribut, dan KaTeX — kecuali segmen KaTeX yang rusak: `<` telanjang (Matematika 4 Modul 7 `\prod_{i<j}` → `\prod_{i \lt j}`, sekaligus eksponennya diberi kurung kurawal `x^\Sigma mᵢ-n(n-1)/2` → `x^{\Sigma m_i - n(n-1)/2}`) dan segmen yang dipecah `<sub>`/`<sup>` sisa konversi lama, yang disatukan kembali menjadi LaTeX (Matematika 4 Modul 11 `\omega <sub>d</sub>^2` → `\omega _{d}^2`, Modul 14 `a<sub>n</sub>^2` → `a_{n}^2`, Optimalisasi Modul 1 `V<sub>n</sub>^2` → `V_{n}^2`). Pasangan untuk wilayah generator Sisken 2–14 adalah selisih keluaran `enrich-sisken-modules.mjs` lama → baru (blok "Daftar Periksa" yang dibuang `tambah-progres-modul.mjs` tidak ikut), sehingga halaman terbit tidak perlu dibangun ulang lewat seluruh rantai Sisken; sesudah regenerasi Sisken pasangan itu terbaca "sudah terpasang". UTS/UAS CAD yang dibangun ulang `cad-exam/bangun.py` mewarisi perbaikan kerangka TTL. Bila teks di sekitar jangkar disunting, `notasi-halaman.mjs` menolak (`DITOLAK`) dan datanya perlu ditinjau ulang. Singkatan lambang kendali yang menempel (`Kp`, `Mp`, `ts`, …) di Sisken Modul 1 dan bagian tulisan tangan Sisken 2–14 diubah seperti (7), demikian pula `Tr`/`Td`/`ωd` di Getaran; `fs` (laju sampel, lazim di pemrosesan sinyal dan sering bersebelahan dengan kode) serta istilah `F-beta`/`3-sigma` sengaja dibiarkan.

**Notasi rumus — tindak lanjut tinjauan (3 Oktober 2026).** Tinjauan Chrome atas 96 halaman (lebar 1280 dan 375, semua slider/pilihan animasi disapu) menemukan tempat notasi yang masih salah tampil; aturannya: (9) **Opsi PG, opsi jajak forum, dan tautan subnav** (`.radio-option`, `.p-opt`, `#modulSubnav a`) adalah `display:flex`, jadi setiap elemen anak (`<sub>`, `<sup>`, `<code>`, `<strong>`, KaTeX) menjadi flex item sendiri — subskrip tidak turun, ada celah 10–12 px di tengah rumus, dan di ponsel opsi terpotong (`overflow:hidden`). Isi yang memuat elemen atau KaTeX dibungkus **satu** `<span class="opsi-teks">`: di TTL/CAD lewat `pustaka.opsi_teks` (juga salinan di `ttl-modul/modul_1.py`, dan SUBNAV `modul_N.py` ditulis berpembungkus), di 68 halaman lain lewat `notasi-halaman.mjs` (pasangan data dicocokkan pada bentuk tanpa pembungkus: pembungkus dilepas, pasangan dipasang, lalu dibungkus lagi). `textContent` tidak berubah, jadi `selectMC`, pengacakan opsi per NIM (`innerHTML.replace(/\([A-D]\)…/)`), kunci, dan pemulihan pilihan tetap cocok; UTS/UAS sudah memakai `<span>` di templat opsinya. Offset lama `.radio-option sup{top:-0.55em}`/`.radio-option sub{bottom:-0.25em}` (`position:relative`) di 13 halaman Matematika 4 dirancang untuk `<sup>`/`<sub>` yang menjadi flex item (di sana `vertical-align` diabaikan); di dalam pembungkus `vertical-align` bawaan berlaku sehingga offset itu bertumpuk (pangkat melayang ±2× tinggi normal). Aturannya dibatasi ke anak langsung (`.radio-option > sup`, `.radio-option > sub`) lewat data `notasi-halaman.mjs`; posisi pangkat/subskrip di opsi kini sama dengan di paragraf (Chrome: naik 0,33–0,39, turun 0,29–0,40 tinggi huruf). (10) **Tombol/label pemilih animasi** Matematika 4 yang menandai pilihan aktif dengan `btn.textContent = active ? (btn.textContent.replace(' ✓','') + ' ✓') : …` meratakan `<sup>` dan KaTeX labelnya (e<sup>−x/3</sup> → "e−x/3"); `notasi-halaman.mjs` menggantinya dengan penanda ✓ sebagai simpul teks terakhir saja. (11) **Export Tugas** membaca soal (`.mc-q`, `.comp-q`) dan pilihan PG lewat `_teksNotasi` (blok `NOTASI-EKSPOR` v1 di awal badan `exportTugasHtml`, `scripts/notasi-ekspor.mjs`, 84 modul; juga fallback jawaban benar di blok `PILIHAN-PG-EKSPOR`): subskrip satu karakter/angka → huruf subskrip Unicode (Vₖ, Y₁₁), selain itu `_` (Z_baru, ω_(n,iso)); pangkat angka/tanda atau n/i/T → superskrip (x², 10⁻³), selain itu `^`/`^(…)` (e^(−x/3)); KaTeX → sumber LaTeX-nya. Sebelumnya textContent menghasilkan "Zbaru = Zlama" di dokumen yang dibaca dosen. (12) **Teks dinamis** yang dirakit lewat variabel atau properti objek (`sigLabel`, `kaseDesc`, `traceLabels`, langkah metode, `enter` simpleks, status readout) memakai penanda `<sub>`/`<sup>` yang sama (sink-nya `innerHTML` atau kanvas ber-`NOTASI-KANVAS`/`_ttlRumusKtx`), termasuk sambungan bersyarat (`'GMR'+(n>1?'<sub>b</sub>':'')`) dan indeks angka (`'|Y<sub>'+(i+1)+(j+1)+'</sub>|'`). Literal yang setengah dikonversi atau sambungan `'_b'` ditolak `periksa-notasi.mjs`; string lewat variabel tidak dapat diperiksa statis, jadi sesudah perubahan besar sapu slider/pilihan di Chrome. (13) **Salinan HTML Forum** (templat ekspor ke Forum FAST di dalam `<script>`) memakai notasi yang sama dengan halaman forum: Sisken 2–14 lewat `enrich-sisken-modules.mjs` (`rapikanNotasiHtml` pada pertanyaan/petunjuk sebelum masuk templat runtime), halaman tulisan tangan lewat data. (14) **Rumus bergaya kode di `<code>`** (berprima atau ber-`e^(…)`: `y' + 3y = e^(2x)`, `A_i = N(r_i)/D'(r_i)`, `]_{−π}`) dikonversi seperti teks, sedangkan **pernyataan kode Python di `<code>`** (`y_anom = clean + noise`, `n_detect = sum(…)`, `X_st = F0 / k`) dan nama fungsi/variabel kode (`y_p(x)` di petunjuk berdampingan `np.exp`, `sun_load`) tetap apa adanya. (15) **Placeholder** (forum dan komputasi) mengikuti butir (4): huruf subskrip/superskrip Unicode bila semua karakternya tersedia (Kₜ = σₘₐₖₛ/σₙₒₘ, eₛₛ, ΦᵢᵀMΦⱼ, e⁻²ᵗ, rᵐ), selain itu kata (frekuensi teredam, koefisien redaman kritis, L efektif, ∛E untuk E^(1/3), ∂M/∂y untuk M_y); nama kode (`class_weight`, `cross_val_score`) tetap. (16) **Modul-Word**: teks RPS (`scripts/rps-teknik-tenaga-listrik/buat-rps.js`, dokumen resmi yang ditulis polos `Y_bus` dan tidak diubah) diberi subskrip sungguhan saat masuk Modul-Word TTL (`buat-modul-word.py` `runs_rps`); keterangan gambar yang dipecah `teks2` memakai spasi tak-putus (`\u00a0`) di sekitar `=`/`·` agar satu rumus tidak terbelah antarbaris (CAD Modul 12 Gambar 4). aria-label gambar tetap memakai `teks_aria` (`E^(1/3)`), karena tidak tampil.

## 3. Identitas modul, pertemuan, dan path Firebase

Nomor file modul tidak selalu sama dengan nomor pertemuan. Pertemuan 8 ditempati UTS.

```text
Modul 1–7  → Pertemuan 1–7
Modul 8–14 → Pertemuan 9–15
```

Rumusnya: `P = N` untuk `N <= 7`, dan `P = N + 1` untuk `N >= 8`. Rumus ini dipakai `_segmentsForModul()` di backend untuk **keenam** course, termasuk Sistem Kendali Cerdas.

> **Sistem Kendali Cerdas: nomor yang TAMPIL berbeda dari nomor pada PATH — dan itu disengaja.**
>
> | | Aturan | Contoh Modul 8 |
> |---|---|---|
> | Angka yang dibaca mahasiswa (hero, hitung mundur, Tugas, Forum, Hasil, footer, label Moodle) | `P = N` | "Pertemuan 8" |
> | Path Firebase (`MODULE_ID`, visitor, jadwal, presence, chat) | `P = N` untuk `N ≤ 7`, `P = N + 1` untuk `N ≥ 8` | `pertemuan-9` |
>
> Sisken memakai `P = N` pada tampilan karena Modul 7 dan UTS digabung pada Pertemuan 7 dan jadwalnya tiga pertemuan per minggu (Kamis/Jumat/Sabtu), sehingga totalnya 15 pertemuan tanpa pergeseran setelah UTS. Path Firebase tetap memakai rumus lama supaya jadwal, visitor record, dan poin yang sudah tersimpan tidak berpindah tempat.
>
> Karena itu: **jangan "menyeragamkan" keduanya.** Mengubah teks tampilan aman; mengubah `MODULE_ID` atau path akan memutus jadwal dan menghilangkan poin mahasiswa dari path lama. Saat menyunting halaman Sisken secara massal, lindungi pola `pertemuan-N` lebih dulu sebelum mengganti teks "Pertemuan N".

### 3.1 ID callable modul

| Course | `modulId` |
|---|---|
| Matematika 4 | `math4-modul-N` |
| Getaran Mekanik | `getaran-mekanik-modul-N` |
| Optimalisasi & Otomasi | `optoauto-modul-N` |
| Sistem Kendali Cerdas | `sistem_kendali_cerdas-modul-N` |
| Teknik Tenaga Listrik | `teknik_tenaga_listrik-modul-N` (terbit: N = 1–14) |
| Pemodelan CAD | `pemodelan_cad-modul-N` (terbit: N = 1–14) |

### 3.2 Path modul

| Course | Visitor | Jadwal | Presence | Chat |
|---|---|---|---|---|
| Matematika 4 | `visitors/math4/modul-N` | `settings/math4/pertemuan-P/schedule` | `presence/math4/modul-N` | `chat/math4/modul-N/messages` |
| Getaran | `visitors/getaran_mekanik/pertemuan-P` | `settings/getaran_mekanik/pertemuan-P/schedule` | `presence/getaran_mekanik/pertemuan-P` | `chat/getaran_mekanik/pertemuan-P/messages` |
| Optoauto | `visitors/optoauto/pertemuan-P` | `settings/optoauto/pertemuan-P/schedule` | `presence/optoauto/pertemuan-P` | `chat/optoauto/pertemuan-P/messages` |
| Sisken | `visitors/sistem_kendali_cerdas/pertemuan-P` | `settings/sistem_kendali_cerdas/pertemuan-P/schedule` | `presence/sistem_kendali_cerdas/pertemuan-P` | `chat/sistem_kendali_cerdas/pertemuan-P/messages` |
| TTL | `visitors/teknik_tenaga_listrik/pertemuan-P` | `settings/teknik_tenaga_listrik/pertemuan-P/schedule` | `presence/teknik_tenaga_listrik/pertemuan-P` | `chat/teknik_tenaga_listrik/pertemuan-P/messages` |
| CAD | `visitors/pemodelan_cad/pertemuan-P` | `settings/pemodelan_cad/pertemuan-P/schedule` | `presence/pemodelan_cad/pertemuan-P` | `chat/pemodelan_cad/pertemuan-P/messages` |

Untuk Matematika, visitor memakai `modul-N` sedangkan jadwal memakai `pertemuan-P`. Perbedaan ini disengaja dan sudah ditangani oleh backend. Course lain memakai `pertemuan-P` untuk keduanya.

### 3.3 ID dan path exam

| Exam ID | Visitor | Jadwal | Presence |
|---|---|---|---|
| `math4-uts` | `visitors/math4/uts` | `settings/math4/uts/schedule` | `presence/math4/uts` |
| `math4-uas` | `visitors/math4/uas` | `settings/math4/uas/schedule` | `presence/math4/uas` |
| `getaran-mekanik-uts` | `visitors/getaran_mekanik/uts` | `settings/getaran_mekanik/uts/schedule` | `presence/getaran_mekanik/uts` |
| `getaran-mekanik-uas` | `visitors/getaran_mekanik/uas` | `settings/getaran_mekanik/uas/schedule` | `presence/getaran_mekanik/uas` |
| `optoauto-uts` | `visitors/optoauto/uts` | `settings/optoauto/uts/schedule` | `presence/optoauto/uts` |
| `optoauto-uas` | `visitors/optoauto/uas` | `settings/optoauto/uas/schedule` | `presence/optoauto/uas` |
| `sisken-uts` | `visitors/sistem_kendali_cerdas/uts` | `settings/sistem_kendali_cerdas/uts/schedule` | `presence/sistem_kendali_cerdas/uts` |
| `sisken-uas` | `visitors/sistem_kendali_cerdas/uas` | `settings/sistem_kendali_cerdas/uas/schedule` | `presence/sistem_kendali_cerdas/uas` |
| `teknik-tenaga-listrik-uts` | `visitors/teknik_tenaga_listrik/uts` | `settings/teknik_tenaga_listrik/uts/schedule` | `presence/teknik_tenaga_listrik/uts` |
| `teknik-tenaga-listrik-uas` | `visitors/teknik_tenaga_listrik/uas` | `settings/teknik_tenaga_listrik/uas/schedule` | `presence/teknik_tenaga_listrik/uas` |
| `pemodelan-cad-uts` | `visitors/pemodelan_cad/uts` | `settings/pemodelan_cad/uts/schedule` | `presence/pemodelan_cad/uts` |
| `pemodelan-cad-uas` | `visitors/pemodelan_cad/uas` | `settings/pemodelan_cad/uas/schedule` | `presence/pemodelan_cad/uas` |

ID, slug, path, localStorage key, konfigurasi backend, seed, dan OBE mapping harus berubah bersama. Jangan menyalin prefix course asal saat membuat halaman baru. Termasuk literal kunci identitas di skrip **klasik** halaman modul (`getIdentityLocal` dan `LK` friksi; `_draftKey` tidak memuat literal lagi sejak `draft-modul.mjs`, §6.3), yang tidak ikut berubah bila hanya `MODULE_ID` di skrip module yang diganti — jalankan `scripts/samakan-kunci-identitas.mjs` (§6.7).

---

## 4. Peran, login, dan sesi

### 4.1 Role picker

Halaman modul dan exam membuka pemilih peran sebelum akses penilaian:

- **Mahasiswa:** NIM dan PIN; nama diambil dari roster.
- **Dosen:** password admin, kemudian dapat mengatur jadwal atau masuk untuk meninjau soal exam.
- **Mode Preview:** akses tanpa identitas untuk melihat struktur halaman, tanpa penilaian.

Pada seluruh UTS dan UAS, login dosen otomatis membuka tab **Soal Ujian** dalam mode hanya-baca (hanya untuk dosen terverifikasi, `_dosenUjianTerverifikasi`; identitas `role: 'dosen'` bernama lain tidak mendapatkannya, §7.8). UTS maupun UAS mengambil teks soal melalui `getExamQuestions` memakai sesi Firebase dengan claim admin, sehingga dapat ditinjau tanpa menunggu jadwal mahasiswa. Mode dosen tidak boleh mengirim jawaban, membuat attempt, menambah poin, atau membuat export mahasiswa.

Tombol perpindahan sesi bernama **Log Out**, bukan “Ganti Peran”. Logout menghapus identitas lokal, sesi PIN, presence, dan sesi Firebase Auth yang relevan, lalu mengembalikan pengguna ke pemilih peran.

### 4.2 Mode Preview

Pada modul:

- tab **Tugas** dan **Forum** beserta panelnya disembunyikan;
- jika navigasi lama mencoba membuka keduanya, halaman kembali ke tab Modul;
- soal tidak dapat dikirim, poin tidak dicatat, dan export dinonaktifkan.

Pada exam:

- handler jawaban dan export tetap dinonaktifkan;
- teks soal **tidak tampil**, baik UTS maupun UAS. Bank soal keduanya diambil dari server lewat `getExamQuestions`, yang mensyaratkan sesi mahasiswa valid (NIM + PIN + jadwal terbuka) atau sesi admin Firebase. Preview tidak memenuhi keduanya, sehingga panel soal menampilkan pesan terkunci;
- tab **Hasil** tidak memuat data kelas apa pun (sejak 26 September 2026): tabel kelas, papan Top Skor/Top Akses, statistik kelas, dan daftar mahasiswa online hanya dirender untuk dosen terverifikasi. Preview mendapat placeholder "Data kelas hanya tersedia untuk dosen. Keluar dari Mode Preview (tombol Keluar Preview di banner atas), lalu masuk sebagai mahasiswa untuk melihat nilai Anda sendiri." (Preview tidak punya formulir login; tamu di layar login mendapat "… Masuk sebagai mahasiswa untuk melihat nilai Anda sendiri."), dan nama/NIM/status mahasiswa lain tidak ada di DOM sama sekali — bahkan bila identitas dosen kebetulan tersimpan di browser itu. Rincian di §7.8.

Preview bukan identitas mahasiswa dan tidak membuat record kehadiran.

### 4.3 PIN mahasiswa

- Standar UI modul dan exam adalah PIN 6 digit.
- Hash PIN disimpan global di RTDB `pins/mhs_<NIM>` dan dapat dipakai lintas course/modul.
- Data utama: `pinHash`, `pinSetAt`, `nama`, dan `nim`.
- Password/PIN mentah tidak disimpan.
- Reset modul atau exam tidak menghapus PIN global.
- Halaman OBE masih menerima 4–8 digit untuk kompatibilitas; PIN baru tetap harus mengikuti standar 6 digit.
- Session PIN berada di `sessionStorage`; jika sesi hilang tetapi identitas lokal masih ada, halaman meminta PIN kembali sebelum submit.

**Node `pins/` tertutup dari klien.** Aturan RTDB `pins/` tidak lagi punya `.read`. Sebelumnya `.read: true`, sehingga siapa pun tanpa login dapat membaca seluruh NIM, nama, dan hash PIN; karena PIN hanya 6 digit dan di-hash SHA-256 tanpa garam, seluruh ruang 10⁶ dapat dihitung offline dalam hitungan detik dan mahasiswa dapat diimpersonasi. Aturan `.write` dipertahankan agar setup PIN pertama kali tetap jalan.

Konsekuensi yang wajib dipatuhi:

- klien **tidak boleh** membaca `pins/` lagi. Verifikasi PIN memakai callable **`verifyPin({nim, pinHash?}) → {exists, valid}`**, yang tidak pernah mengembalikan hash tersimpan dan punya lockout per-NIM (10 kegagalan / 60 detik);
- halaman memakai helper `window._callVerifyPin()` dan `window._pinAuthObj()`; jangan menghidupkan kembali `get(ref(db, 'pins/' + key))` di klien;
- callable bernilai (`checkModulAnswer`, `checkExamAnswer`, `getExamQuestions`, `generateExportCode`, `getMyObeNilai`) tetap memverifikasi `pinHash` sendiri di server — tidak berubah.

**Lockout PIN dua keluarga (backend, 29 September 2026).** Setiap callable ber-PIN membandingkan hash lewat penguncian atomik yang sama (10 kegagalan / 60 detik → `resource-exhausted` + `details.remainingSeconds`), dalam salah satu dari dua keluarga:

- **per NIM** (`pinAuthThrottle/mhs_<NIM>`, dibagi `verifyPin`): `verifyPin`, progres materi dan gerbang modul (`getModulProgress`, `checkModulAccess`, `setModulCentang`, `saveModulForum`, `saveModulPoll`), `getMyObeNilai`, `unduhBerkasTugas`, chat AI;
- **per NIM + sumber permintaan** (`pinAuthThrottleSumber/mhs_<NIM>/…`, tidak dibagi `verifyPin`) untuk jalur yang dikejar waktu ujian/tenggat: `checkModulAnswer`, `checkExamAnswer`, `getExamQuestions`, `getModulQuestions`, `unggahBerkasTugas`, `getJawabanSaya` (pemulihan jawaban), dan `generateExportCode` (kode verifikasi = langkah pengumpulan). Callable ber-PIN baru yang dipakai selama UTS/UAS masuk keluarga ini (keputusan backend).

Halaman menampilkan keduanya sama: "Terlalu banyak percobaan PIN … coba lagi dalam N detik", tanpa mengakhiri sesi PIN (§6.3, §7.6). Alasan dan rinciannya milik backend (`functions/DEPLOY.md` repo privat, butir lockout).

**Reset atau ganti PIN: timpa, jangan hapus.** Slot `pins/mhs_<NIM>` yang kosong diperlakukan sebagai login pertama (write-once untuk klien): siapa pun yang lebih dulu membuat PIN memilikinya, dan pemilik sahnya terkunci di luar. Menghapus lalu berharap mahasiswa lebih dulu membuat PIN baru karena itu dilarang:

- PIN yang **terpapar** (hash publik lama di `visitors/`) dirotasi dengan skrip backend, bukan dihapus: `reset-pin` hanya lokal di laptop dosen dengan mahasiswa hadir (PIN baru diketik mahasiswa di prompt tersembunyi, ditulis atomik bersama pembersihan kunci percobaan), atau `cabut-pin` lewat workflow untuk yang belum bisa hadir (hash acak; mahasiswa itu tidak bisa login sampai dirotasi bersamanya). Perintah dan syaratnya di `functions/DEPLOY.md` backend, § PIN terpapar;
- PIN yang **lupa** (petunjuk "Lupa PIN? Hubungi dosen untuk reset global" di modal PIN) dan PIN akun simulasi (§4.5): timpa nilai `pinHash` di tempat. Mahasiswa mengetik PIN barunya (6 digit, bukan pola di `WEAK_PINS` halaman) di laptop dosen tanpa gaung, mis. Git Bash `read -rs PIN && printf %s "$PIN" | sha256sum && unset PIN` (64 hex huruf kecil, sama dengan `_sha256Hex` halaman), lalu di Firebase Console ubah nilai `pins/mhs_<NIM>/pinHash` (dan `pinSetAt`, ISO) langsung — satu penyuntingan nilai, node tidak pernah kosong — dan hapus `pinAuthThrottle/mhs_<NIM>` serta `pinAuthThrottleSumber/mhs_<NIM>` bila ada. Hash 6 digit tanpa garam sama rahasianya dengan PIN-nya: jangan ditulis di chat, catatan, atau repo, dan tutup terminalnya sesudah itu;
- sesudah rotasi, tab yang masih membawa sesi lama mendapat modal PIN lagi saat dimuat: `getJawabanSaya` menolak hash lama sekali, sesi dibuang, lalu mahasiswa mengetik PIN baru (PIN lama dijawab "PIN salah"). Bukan pemberitahuan "PIN Anda sudah di-reset… Log Out", yang hanya muncul bila `pins/` memang kosong. Sesudah `cabut-pin` modal yang sama muncul, tetapi setiap PIN ditolak sampai dirotasi bersama dosen.
- slot `pins/mhs_<NIM>` yang **kosong** saat auto-login (tab baru tanpa sesi PIN; mahasiswa belum pernah membuat PIN global, mis. sesudah `strip-pin`, atau node-nya terhapus): `verifyPin` menjawab `exists:false` dan migrasi PIN lama tidak menemukan apa pun, maka identitas tersimpan dibuang dan form login mahasiswa tampil lagi dengan pesan "Sesi tersimpan belum punya PIN…". NIM sengaja tidak diisikan: di komputer bersama, identitas basi milik mahasiswa lain akan mengundang orang berikutnya membuat PIN untuk slot kosong orang itu. PIN baru dibuat lewat alur login pertama biasa (`submitVisitor` → modal konfirmasi, diketik dua kali). Sebelum 29 September 2026 halaman tetap tampak "masuk" tanpa hash PIN sesi, dan setiap callable gagal sampai mahasiswa menekan 🚪 Log Out. Hanya identitas mahasiswa (NIM angka) yang terpengaruh; galat jaringan dan penguncian `verifyPin` tidak mengeluarkan siapa pun. Dipasang `scripts/pin-kosong-ke-login.mjs` (§17.1). Pengosongan slot tetap bukan cara reset — di antara dikosongkan dan login berikutnya, siapa pun yang lebih dulu memasukkan NIM itu memiliki PIN-nya.

**Urutan deploy wajib** bila menyentuh alur ini (salah urutan memutus login seluruh mahasiswa): (1) deploy Cloud Functions supaya `verifyPin` ada; (2) merge frontend agar halaman memakainya; (3) baru deploy RTDB Rules yang menutup `pins/`.

**PIN tidak tertinggal di formulir (UTS/UAS, sejak 26 September 2026).** Setelah login berhasil, overlay login hanya disembunyikan. Dulu `#vPin` tetap berisi PIN dan tombol tetap "Memverifikasi...", sehingga bila jadwal dihapus (logout paksa) overlay tampil lagi berisi NIM + PIN, dan begitu jadwal dipulihkan siapa pun di komputer lab dapat masuk sebagai mahasiswa itu tanpa mengetik PIN. Kini `_bersihkanFormLoginUjian()` (dipanggil dari `_applyRoleVisibility`, dipasang `scripts/buka-asisten-ujian.mjs`) mengosongkan `#vPin` dan kolom PIN modal setelah setiap login berhasil serta memulihkan `#vSubmit`; pada logout paksa tanpa jadwal NIM ikut dikosongkan.

**Login pertama memakai modal konfirmasi.** Ketika NIM belum punya PIN, `submitVisitor()` tidak lagi menulis `pins/` langsung. Ia mengisi `_pinFlow`, membuka modal "Buat PIN Keamanan" dengan PIN yang baru diketik terisi di kolom pertama dan fokus di kolom konfirmasi, lalu `submitPinSetup()` yang menuliskannya. Tidak ada penulisan ke Firebase sebelum konfirmasi cocok. `submitPinSetup()` juga menggabungkan visitor record lama bila ada, sehingga poin dan `scoredQuestions` mahasiswa lama tidak tereset saat PIN dibuat.

### 4.4 Autentikasi admin

Browser tidak menyimpan hash admin dan tidak mengirim hash yang dapat dipakai ulang. Alurnya:

1. client mengirim password ke `createAdminSession`;
2. server membandingkan SHA-256 secara constant-time terhadap `ADMIN_PASSWORD_HASH` di Secret Manager;
3. server membuat Firebase custom token dengan claim `admin: true`;
4. client memakai `browserSessionPersistence`;
5. setiap callable admin memvalidasi claim dan `auth_time`.

Ketentuan saat ini:

- sesi admin maksimal 2 jam;
- 5 kegagalan dalam jendela 60 detik mengunci login selama 60 detik;
- pesan lock menyebut sisa detik;
- login berhasil langsung menghapus penghitung kegagalan;
- pembatasan tidak menggunakan alamat IP;
- provider Email/Password tidak diperlukan karena login memakai custom token.

### 4.5 Akun simulasi mahasiswa

Untuk menguji alur mahasiswa tanpa mengotori data, ada satu akun uji: NIM `41399999901`, nama roster "SIMULASI MAHASISWA", terdaftar di `students.json` keenam course. PIN-nya hanya tersimpan sebagai hash di `pins/` dan **tidak ditulis di repo mana pun**. Daftar NIM-nya harus sama di tiga tempat: `SIM_NIMS` di backend `functions/index.js`, di `scripts/kecualikan-akun-simulasi.mjs` (disuntikkan ke 96 halaman modul/exam dan 6 halaman OBE), dan di `scripts/tambah-progres-modul.mjs` (disuntikkan ke 84 halaman modul; mengatur perlakuan akun simulasi pada progres materi).

| Aspek | Perilaku akun simulasi |
|---|---|
| Login | Seperti mahasiswa (NIM + PIN), bukan password admin |
| Jawaban tugas/ujian | Dinilai server (umpan balik, emoji, suara tetap muncul) tetapi **tidak disimpan**: tanpa ledger Firestore, tanpa poin RTDB; idempotensi/self-heal dilewati sehingga soal bisa dijawab ulang tanpa batas (respons membawa `simulasi:true`, halaman membuka kembali soal) |
| Record pengunjung, heartbeat, presence | Tidak ditulis |
| Papan hasil, roster tab Hasil, hitungan hadir/total, pembagian kelompok (Modul 1), OBE | Disaring — tidak pernah tampil atau terhitung |
| Progres materi (§6.7) | **Persis mahasiswa**: centang tersimpan dan divalidasi server, tab terkunci, forum tersimpan; satu-satunya beda: boleh membatalkan centang terakhir (`setModulCentang` dengan `batal:true`, hanya untuk `SIM_NIMS`) supaya uji bisa diulang |
| Gerbang antar-modul | Selalu lolos, karena ia tidak punya ledger tugas sehingga "modul lengkap" tak pernah terpenuhi |

Saat membersihkan sisa data akun ini di Firestore, ingat kunci dokumen modul memakai prefiks: `modulAttempts/<id>/students/mhs_<nim>` (exam: `examAttempts/<id>/students/<nim>`).

**Cara pakai (dosen):**

- Masuk lewat tombol 🎓 Mahasiswa dengan NIM di atas dan PIN yang dipegang dosen (PIN disimpan di luar repo). Sesi ini mengalami semua gerbang persis mahasiswa: kotak centang berurutan, tab terkunci, forum tersimpan, umpan balik jawaban lengkap.
- Mengulang uji soal: cukup jawab lagi — soal tidak pernah terkunci untuk akun ini. Mengulang uji centang: batalkan kotak terakhir satu per satu (hanya akun ini yang bisa). Mengulang dari nol: hapus dokumen `progresModul/<modulId>/students/mhs_41399999901` dengan admin SDK.
- Di tab Hasil akun ini melihat papan peringkat dan roster mahasiswa lain, tetapi **tidak melihat dirinya sendiri** (tidak ada record pengunjung). Bilah poin di tab Tugas menunjukkan poin lokal sesi itu saja dan hilang saat muat ulang.
- Gerbang antar-modul tidak bisa diuji dengan akun ini (selalu lolos); lapis servernya diuji lewat data mahasiswa nyata (lihat §6.7).

**Mengganti nama atau PIN:** nama ada di enam `students.json` **dan** di RTDB `pins/mhs_41399999901.nama` (perbarui keduanya; `pins/` hanya bisa ditulis admin SDK karena write-once untuk klien). Mengganti PIN: **jangan hapus** node `pins/mhs_41399999901` lalu membuat PIN lewat halaman (slot kosong = login pertama bagi siapa pun yang lebih dulu, §4.3). Timpa nilai `pinHash` (dan `pinSetAt`) di tempat seperti PIN lupa (§4.3): hash dihitung lokal tanpa gaung, disunting langsung di Firebase Console, lalu kunci percobaan akun ini dihapus. Jangan pernah menuliskan PIN-nya (maupun hash-nya) di repo, commit, atau dokumen ini.

---

## 5. Jadwal dan WIB

Semua label dan tampilan waktu ditujukan untuk WIB. Formatting wajib memakai
`timeZone: 'Asia/Jakarta'`; jangan membiarkan zona waktu perangkat mengubah
deadline. Arti field jadwal adalah:

| Field | Format | Modul | Exam |
|---|---|---|---|
| `start` | ISO UTC | awal jendela yang diturunkan dari `due` dan `duration` | awal jendela |
| `end` | ISO UTC | batas akhir yang diturunkan dari `due` | batas akhir |
| `due` | `YYYY-MM-DDTHH:MM` tanpa offset | waktu dinding WIB dan sumber kebenaran deadline | nilai kompatibilitas yang diparse sebagai WIB saat jadwal disimpan |
| `duration` | angka | hari | menit |
| `extension` | angka menit | tidak dipakai | perpanjangan setelah `end`; boleh tidak ditulis jika nol |

String `due` bukan waktu lokal browser. Parse dengan `_wibStringToDate`, bukan
`new Date(due)`, lalu simpan waktu absolut pada `start`/`end` sebagai ISO UTC.

### 5.1 Modul

- Durasi default: 7 hari.
- Batas akhir default: enam hari setelah modal dibuka, pukul 23.59 WIB.
- `start = end - duration`.
- Sebelum `start`, akses penilaian ditolak.
- Setelah `end`, modul tetap dapat dikerjakan tanpa batas akhir tambahan, dengan pengali terlambat 0,65 (potongan 35%) — seragam di semua mata kuliah, sama seperti exam.
- Mengubah jadwal tidak menghapus visitor, attempt, jawaban, atau poin.

### 5.2 Exam

- Durasi default: 180 menit.
- Perpanjangan default: 120 menit.
- `start = end - duration`.
- Sebelum `start`, akses dan submit ditolak.
- Pada `(end, end + extension]`, submit masih diterima dengan pengali terlambat 0,65 (potongan 35%), seragam di semua mata kuliah.
- Setelah `end + extension`, submit diblokir.
- Mengubah jadwal tidak mereset data mahasiswa.

> **Penalti 35% seragam:** seluruh mata kuliah memakai pengali 0,65 (potongan 35%). Rollout bertahap yang sempat menahan Optimalisasi & Otomasi, Matematika 4, dan Getaran Mekanik di 0,7 sudah berakhir. Attempt yang terlanjur dinilai dengan pengali lama tetap bernilai seperti saat itu dan tidak dihitung ulang, sebab pengali diterapkan pada saat submit lalu disimpan. Teks halaman ketiga course itu sempat tertinggal (pesan terlambat 42 modul dan 6 UTS/UAS "dikurangi 30%", `_getLateMultiplier()` 0.7 yang tidak dipakai menilai, serta halaman Pengantar yang ditaut `index.html` "dikurangi 20% (multiplier 0.8)"); sejak 27 September 2026 semuanya menyebut 35%/0,65 lewat `scripts/penalti-35.mjs`, dan `validate-public-security.mjs` menolak angka lama di seluruh halaman course dan `Admin/`.

### 5.3 Default modal exam yang benar-benar ada saat ini

| Halaman | Batas akhir ketika belum ada jadwal | Judul modal |
|---|---|---|
| Semua UAS | tanggal WIB saat modal dibuka, 19.30 | Atur Jadwal UAS |
| UTS Getaran | tanggal WIB saat modal dibuka, 19.30 | Atur Jadwal UTS |
| UTS Matematika | waktu WIB sekarang + 180 menit | Atur Jadwal Perkuliahan |
| UTS Optimalisasi | waktu WIB sekarang + 180 menit | Atur Jadwal Perkuliahan |
| UTS Sisken, UTS Teknik Tenaga Listrik, dan UTS Pemodelan CAD | tanggal WIB saat modal dibuka, 19.30 | Atur Jadwal UTS |

Tabel ini mencatat implementasi aktual, bukan menyatakan ketidakkonsistenan tersebut sebagai desain ideal. Jika default UTS diseragamkan, ubah keenam halaman UTS, pemeriksa otomatis, dan bagian ini dalam commit yang sama.

### 5.4 Zona waktu modul

Seluruh 84 modul (enam mata kuliah) memakai editor deadline berupa field tanggal dan field teks jam
`HH:mm` 24 jam. Input `10:00 PM` tidak dipakai; nilai ekuivalennya adalah
`22:00`. Alur simpan membaca keduanya melalui `_readScheduleDueWib`, memvalidasi
jam, lalu `_wibStringToDate` mengonversi WIB (UTC+7) ke ISO UTC. Contoh:
`2026-08-10 22:00 WIB` menjadi `2026-08-10T15:00:00.000Z` dan ditampilkan lagi
sebagai `22:00 WIB` oleh `_formatWibDateTime` (`hourCycle: 'h23'`).

Untuk kompatibilitas data lama, `due` yang valid selalu menjadi sumber kebenaran
deadline modul. `_normalizeModuleScheduleWib` di frontend dan
`_moduleDueWibToMillis` di backend membangun ulang `end` dari `due`, kemudian
`start` dari `duration`. Dengan demikian record lama yang memiliki `end` bergeser
satu jam langsung ditampilkan dan dinilai pada waktu yang benar, tanpa migrasi
RTDB dan tanpa mengubah attempt, jawaban, atau poin mahasiswa. Jika `due` hilang
atau tidak valid, sistem baru memakai ISO `start`/`end` yang tersimpan sebagai
fallback.

**Perpanjangan deadline satu kelas menulis `end` dan `due` (backend, 26 September
2026).** `Admin/rescale-deadline.html` mode Modul dengan Deadline Baru dan kolom
NIM kosong memanggil `rescaleModulLatePenalty` dengan `newEnd` tanpa `nims`.
Callable itu menulis jadwal global `end` **dan** `due` (wall-clock WIB) untuk
instan yang sama, dibulatkan ke menit, lalu menghitung ulang penalti terhadapnya.
Waktu buka yang sedang ditegakkan `evalSchedule` tidak bergeser: `start` ditulis
eksplisit dan `duration` disetel ulang ke selisih harinya. Dulu hanya `end` yang
ditulis; karena halaman modul, `evalSchedule`, dan agen chat membaca `due`,
perpanjangan itu tidak berpengaruh apa pun. Diagnose (dry-run) dan cakupan
per-NIM tidak menulis jadwal; per-NIM, Deadline Baru hanya menjadi acuan hitung
ulang poin. Rescale ujian satu kelas ikut menulis `due`, tetapi tanpa menggeser
`start` (§5.5).

Callable itu menolak tiga keadaan sebelum menulis apa pun (attempt, poin, dan
jadwal tidak tersentuh):

- **Deadline satu kelas yang tidak berselisih kelipatan 24 jam dari waktu buka**
  (`invalid-argument`, juga pada Diagnose; per-NIM tidak terkena karena tidak
  menulis jadwal). Modal Atur Jadwal di ke-84 halaman modul menyimpan
  `start = due − Durasi` hari penuh dan mengisi Durasi dari `duration`
  tersimpan (atau 7), jadi jadwal seperti itu akan menggeser waktu buka begitu
  modal disimpan ulang tanpa perubahan dan bisa mengunci modul yang sedang
  berjalan untuk satu kelas (versi awal cabang backend ini menghapus `duration`
  pada rentang seperti itu, dan justru itu yang memasang jebakan tersebut).
  Artinya jam Deadline Baru harus sama dengan jam buka modul: preset 23:59 di
  `rescale-deadline.html` hanya cocok untuk modul yang dibuka pukul 23.59 WIB
  (bawaan Atur Jadwal); modul yang dibuka pukul 22.00 WIB (mis. sebagian jadwal
  Sisken) perlu deadline pukul 22.00. Pesannya menyebut jam buka modul dan dua
  deadline sah terdekat (juga di `details.waktuBuka` dan
  `details.saranDeadline`). Untuk memindahkan jam buka, atur ulang jadwal lewat
  Atur Jadwal di halaman modul lebih dulu.
- **Deadline Baru pada atau sebelum waktu buka modul** yang ditegakkan
  (`due − duration` hari bila keduanya sah, selain itu `start` mentah):
  `invalid-argument` untuk satu kelas, Diagnose, maupun per-NIM.
- **Hitung Ulang atau Diagnose tanpa Deadline Baru pada jadwal yang `end`-nya
  berbeda dari `due` yang sah** (`failed-precondition`, "…menyimpan dua deadline
  berbeda…", dengan `details.scheduleEnd`/`scheduleDue`). Tanpa deadline baru
  acuannya `end`, padahal `evalSchedule` menegakkan `due`; pada jadwal lama
  `end` bisa satu jam lebih awal (disimpan dari browser UTC+8) atau diperpanjang
  rescale lama yang belum menulis `due`, sehingga memilih salah satunya adalah
  keputusan dosen. Isi Deadline Baru dengan deadline yang dimaksud; dengan kolom
  NIM kosong, `end` dan `due` sekaligus diselaraskan, dan hitung ulang
  berikutnya tanpa Deadline Baru kembali berjalan. Audit baca-saja saat cabang
  itu dibuat mencatat 45 jadwal modul lama seperti ini.

Penjaganya `scripts/verify-rescale-jadwal-modul.js` di `npm test` backend
(§17.2). Perilaku ini datang dari cabang backend
`fix/chat-kenapa-admin-dan-rescale-due`; sebelum cabang itu di-deploy, callable
produksi masih hanya menulis `end` dan belum menolak ketiga keadaan di atas.
Gabungkan dan deploy backend lebih dulu (§1.2), baru frontend.

**Rescale tugas FreeCAD modul Pemodelan CAD memakai aturan kirim ulang (backend,
29 September 2026).** Tugas pemodelan modul CAD dinilai dengan aturan kirim
ulang (§2), dan sejak cabang backend `fix/rescale-cad-kirim-ulang` di-deploy
`rescaleModulLatePenalty` memakai aturan yang sama untuk attempt yang dinilai
dengan aturan itu: benar = poin × pengali kirim ulang yang tersimpan di ledger
(1 untuk benar pada kiriman pertama, 0,65 untuk benar setelah pernah salah) ×
pengali terlambat terhadap deadline acuan; salah tetap 0 dengan penanda
`cN_comp_ulang`, sehingga kartu tetap terbuka dan tidak pernah menjadi partial;
partial aturan lama yang terbawa kiriman ulang tetap dipegang bila kirimannya
tepat waktu terhadap deadline acuan. Attempt yang dinilai sebelum 24 September
2026 (tanpa jejak kiriman ulang) tetap dihitung dengan aturan lama. Sebelum
deploy itu, rescale — bahkan tanpa perubahan deadline — menaikkan
benar-setelah-salah ke poin penuh, menukar `_comp_ulang` menjadi `_comp_used`
(atau partial 0,5 saat deadline diperpanjang), dan membuang partial lama yang
dipertahankan kiriman ulang. `Admin/rescale-deadline.html` menampilkan aturan
ini saat Pemodelan CAD mode Modul dipilih. Penjaganya
`scripts/verify-rescale-cad-ulang.js` di `npm test` backend (§17.2).

### 5.5 Jadwal ujian susulan (override per mahasiswa)

Selain jadwal global di §5.2, exam punya lapisan kedua opsional di RTDB
`settings/<course>/<slot>/scheduleOverrides/mhs_<NIM>` (lihat §9.1). Ditulis
admin-only lewat callable `rescaleExamLatePenalty` (parameter `nims[]` +
`newEnd`/`newExtension`) atau UI `Admin/rescale-deadline.html`.

- Override hanya boleh mengubah `end`/`extension`, **tidak pernah** `start`.
- Jadwal global dan mahasiswa lain tidak tersentuh — ini per-NIM.
- Kedua belas halaman `UTS.html`/`UAS.html` (6 course × 2 exam) subscribe ke path
  ini secara real-time (`_watchScheduleOverride`/`_mergeSchedule`) dan
  menggabungkannya di atas jadwal global.
- `getExamQuestions` dan `checkExamAnswer` di backend mengevaluasi override
  untuk NIM yang meminta (`evalSchedule(..., nimKey)`), jadi mahasiswa dalam
  jendela override aktif tetap bisa mengambil soal/submit walau jadwal
  global sudah tertutup.
- Tanpa NIM, `rescaleExamLatePenalty` dengan Deadline Baru menulis jadwal
  global ujian: `end` **dan** `due` (wall-clock WIB) untuk instan yang sama,
  dibulatkan ke menit, serta `duration` = end baru − `start` dalam menit;
  `extension` hanya berubah bila Perpanjangan diisi, dan `start` tidak pernah
  disentuh. Server dan hitung mundur halaman tetap membaca `start` + `end` +
  `extension`; `due` ujian hanya dibaca modal Atur Jadwal (`duration` juga oleh
  keterangan lama ujian di panel jadwal). Modal itu mengisi kolomnya dari nilai
  tersimpan lalu menyimpan `end = due` dan `start = due − duration`. Karena keduanya ikut diselaraskan, membuka lalu
  menyimpan modal tanpa perubahan setelah rescale tidak lagi mengembalikan
  deadline lama dan tidak menggeser waktu buka. Bila selisih end baru − `start`
  bukan menit bulat positif, `duration` dihapus sehingga modal meminta durasi
  diisi. Diagnose (dry-run) tidak menulis apa pun tetapi memakai deadline yang
  sudah dibulatkan; override per-NIM tetap hanya `end`/`extension`.
- **Penilaian ulang memakai jendela tiap mahasiswa.** Seperti `evalSchedule`
  saat submit, override tersimpan menimpa `end`/`extension` global bagi
  mahasiswa itu, juga pada rescale satu kelas, sehingga attempt susulan yang sah
  tetap bernilai ketika jadwal kelas diubah (dulu dinilai terhadap jadwal global
  saja dan bisa menjadi 0, `outsideWindow`). Override dibaca sekali sebelum
  menulis; bila gagal dibaca, panggilan gagal alih-alih jatuh ke jadwal global.
  Panggilan per-NIM memakai override yang akan ditulisnya (juga pada dry-run),
  dan per-NIM tanpa Deadline Baru menilai terhadap override mahasiswa itu, bukan
  `end` global. Respons memuat `overriddenStudents` dan `students[].window`;
  `rescale-deadline.html` menampilkan keduanya.
- **Penolakan sebelum menulis.** Deadline Baru pada atau sebelum `start` ujian
  ditolak (`invalid-argument`, menyebut waktu mulai dalam WIB) di semua mode:
  satu kelas, Diagnose, dan per-NIM. Override tidak bisa memajukan `start`, dan
  jendela kosong akan menilai setiap attempt 0. NIM yang tidak sah juga ditolak
  sebelum override apa pun ditulis (dulu sesudah override NIM sebelumnya dalam
  daftar telanjur tertulis).
- **Batas 30 hari untuk rescale satu kelas.** Rules RTDB membatasi `duration`
  UTS/UAS paling banyak 43200 menit (30 hari) untuk tulisan klien, termasuk
  modal Atur Jadwal. Deadline Baru lebih dari 30 hari sesudah `start` (misalnya
  perpanjangan berminggu-minggu sesudah ujian dengan preset yang dihitung dari
  hari ini, atau rescale jadwal penutup dengan `duration` 1 dan `end` ≤
  2000-01-02) tetap diterapkan server, tetapi rescale satu kelas lalu
  **menghapus** `duration` (sejak deploy cabang backend
  `fix/chat-kenapa-admin-dan-rescale-due`; sebelumnya ia menulis `duration` di
  atas batas sehingga simpan ulang ditolak `PERMISSION_DENIED`). Akibatnya modal
  Atur Jadwal meminta Durasi diisi, dan Durasi ≤ 43200 yang diisi menggeser
  waktu mulai (`start = due − duration`). `rescale-deadline.html` membaca
  `start` ujian (node `settings` terbaca publik) dan memperingatkannya di dialog
  konfirmasi dan di Diagnose, tanpa memblokir. Untuk ujian susulan sebagian
  mahasiswa, pakai kolom NIM: override tidak menulis `duration`.

Penjaganya `scripts/verify-rescale-jadwal-modul.js` di `npm test` backend, yang
juga menjalankan modal kedua belas halaman ujian (§17.2). Penulisan `end`/`due`/
`duration` satu kelas, penilaian ulang terhadap override, dan kedua penolakan di
atas datang dari cabang backend `fix/chat-kenapa-admin-dan-rescale-due`. Sebelum
cabang itu di-deploy, callable produksi masih hanya menulis `end`, menilai ulang
mahasiswa susulan terhadap jadwal global (poin susulannya bisa menjadi 0), dan
menerima deadline pada atau sebelum `start`. Jadi sampai deploy: setelah rescale
global periksa kolom batas akhir dan durasi di modal sebelum menyimpan agar `end`
tidak kembali ke nilai lama, dan jangan rescale satu kelas selama ada mahasiswa
susulan. Gabungkan dan deploy backend lebih dulu (§1.2), baru frontend.

---

## 6. Struktur halaman modul

Modul adalah satu file HTML mandiri yang memuat UI, konten, animasi, Pyodide, dan integrasi Firebase. Susunan tab **berbeda antara Modul 1 dan modul lain** dan tidak ada aturan "harus enam tab":

| Course | Tab |
|---|---|
| Modul 1 Matematika 4, Getaran Mekanik, Optimalisasi, Sistem Kendali Cerdas, Teknik Tenaga Listrik | Setup Python · Pembagian Kelompok · Modul · Tugas · Forum · Hasil (6 tab; label Math/Opto disingkat "Setup"/"Kelompok") |
| Pemodelan CAD — Modul 1 | Setup FreeCAD · Setup Python · Modul · Tugas · Forum · Hasil (6 tab) |
| Modul 2–14 keenam course | Modul · Tugas · Forum · Hasil (4 tab) |

Setup Python dan Pembagian Kelompok hanya ada di Modul 1 tiap course (CAD: Setup FreeCAD + Setup Python, tanpa Pembagian Kelompok). Pada Modul 2–14 tab itu tidak ada; generator Sisken, TTL, dan CAD membuang tombol nav, halaman, dan blok gayanya supaya tidak ada tab yang menuju halaman kosong. Jangan "memperbaiki" ketidaksamaan ini dengan menambahkan tab kosong.

**Angka pada hero harus dihitung dari isi, bukan dipatok.** Statistik hero (Bagian Materi, Animasi, Cell Python) pernah salah di seluruh Sisken Modul 2–14 — tertulis 13/1/1 padahal isinya 11/3/3 — karena jumlah bagian memakai rumus terpisah (`deep.length + 4`) yang basi setelah bagian materi digabung, sementara dua angka lain dipatok. Sekarang hero dirakit setelah seluruh bagian dibuat dan angkanya diturunkan dari keluaran (`daftarBagian.length`, jumlah `.anim-title` berjudul "Animasi N", jumlah `.code-wrap`). Bila menambah atau menggabung bagian, jangan menuliskan angka barunya secara manual di hero.

Catatan penghitungan: judul animasi ditulis dua kali per panel (`.anim-title` dan `aria-label` kanvas), jadi pola pencocokan harus mengunci ke `.anim-title` agar tidak terhitung dobel. Modul 1 tiap course ditulis tangan dan dilewati generator, sehingga angka heronya diperiksa manual.

Ketentuan konten dan UI:

- materi, contoh, animasi, dan skenario harus sesuai topik pertemuan;
- ketika menyalin modul, periksa judul, course, pertemuan, Sub-CPMK, animasi, soal, export, filename, roster URL, semua ID, serta seluruh path;
- rumus statis dan dinamis dirender dengan KaTeX setelah elemen tersedia;
- kode komputasi berjalan di browser melalui Pyodide; paket tambahan dimuat sesuai kebutuhan;
- halaman harus tetap responsif dan usable pada layar laptop maupun ponsel;
- gunakan komponen bersama; jangan menambahkan override visual per modul jika kebutuhannya berlaku lintas mata kuliah.

### 6.1 Sistem desain modul

Seluruh 84 modul memakai satu sistem **modern academic**. Keseragaman berarti komponen, interaksi, dan hierarki visualnya sama; isi, jumlah bagian, jumlah tab, dan aksen course tetap boleh berbeda. Lapisan ini ditandai oleh `body.modern-academic-design`, `<style id="modern-academic-design">`, dan `<script id="modern-academic-runtime">`. Jangan menerapkannya pada halaman exam.

| Area | Aturan desain saat ini |
|---|---|
| Hero dan navigasi | Hero kaca menampilkan alur belajar tiga tahap (`.academic-roadmap`): judul tahap 17 px, keterangan 13,5 px, lencana nomor 42 px, anak panah 28 px (diperbesar 22 Agu 2026 atas permintaan dosen). Progress bar, indikator posisi membaca, dan penanda subnav mengikuti bagian aktif. Klik tab utama selalu kembali ke hero/top halaman; tab Tugas tidak langsung melompat ke panel skor. |
| Materi | Setiap bagian memakai chapter card dan aksen sendiri. Paragraf `.section-desc` mengikuti lebar jendela tanpa batas `max-width`. Kartu `.card`, formula, dan elemen sejenis memberi umpan balik hover. |
| Formula | `.formula-block` memakai ukuran dan kontras lebih tinggi, efek kilau tanpa membuat halaman melebar, serta hover angkat; padding vertikalnya 7 px agar ruang di atas/bawah persamaan rapat (margin `.formula-main` Sisken 4/3 px, Modul 1 Sisken 6/5 px). Persamaan bertumpuk (dipisah `<br>` di panel bernomor, hanya Sisken) diberi jarak antar baris lewat `.formula-main br+span{margin-top:.8em}` — selektornya menyasar **pembungkus** yang dibuat KaTeX auto-render, bukan `.katex` (yang tidak pernah menjadi saudara langsung `<br>`). KaTeX mewarisi warna komponen. |
| Tabel | Tabel dalam `.tbl-wrap` memakai `academic-data-table`. Caption bernomor menggunakan `.table-caption > .anim-dot + .anim-title`, tinggi 50 px, indentasi 24 px, dan elipsis untuk judul panjang. Caption tidak boleh membawa `style` inline. Header, zebra row, dan hover baris seragam. |
| Kolom persamaan | Header **Persamaan**, **Rumus**, **Formula**, atau **EOM** ditandai otomatis. Kolom memakai lebar intrinsik minimum 180 px dan tidak membungkus satu persamaan; headernya tetap berukuran sama dengan header lain. Pada layar sempit, scroll horizontal hanya berada di wrapper tabel. |
| Daftar pustaka | Setiap item memakai `.reference-card` sehingga hover angkat, outline beraksen, dan kilau berlaku konsisten. |
| Tugas | Hero Tugas memakai animasi masuk dan tinggi `60vh`. Panel `.score-bar.score-bar-compact` tetap terlihat dengan `position: sticky; top: 64px`, permukaan ungu–biru yang kontras, geometri ringkas, teks terbaca, dan adaptasi layar kecil tanpa menyembunyikan rincian. |
| Umpan balik jawaban | Setiap jawaban yang dinilai memunculkan emoji SVG 3D bergaya stiker di atas kotak umpan balik (`scripts/tambah-efek-jawaban.mjs`, penanda `EFEK-JAWABAN`): 13 varian dipilih acak per status — benar 6 (semua berjempol), sebagian 3, salah 4 (menangis/cemas/murung, **tanpa wajah marah**, tanpa emoji kotoran); semua bola kuning. Disertai suara sintesis Web Audio (benar/sebagian/salah) dan suara antarmuka untuk klik tombol, pemilihan opsi jawaban, kotak centang, dan sub-tab modul; tombol bisu 🔊 di kiri tombol chat (`right:92px; bottom:32px`) tersimpan di localStorage. Efek hanya pada jawaban baru (jalur alreadyAnswered/healed tidak memicu). |
| Efek memuat | Tombol login/PIN/jadwal dan tombol "Masuk sebagai Dosen" menampilkan spinner selama menunggu server (`scripts/tambah-efek-memuat.mjs`, penanda `EFEK-MEMUAT`, helper `jalankanDenganMuat`). |
| Overlay login | Lapisan partikel/rumus melayang (`#overlayParticles`, `#pickerParticles`) wajib berkelas `overlay-anim-particles` (absolute, inset 0, `overflow:hidden`). Tanpa itu, pada overlay yang bisa di-scroll (modul Sisken) partikel memperbesar area scroll dan scrollbar muncul-hilang terus (`scripts/kunci-lapisan-animasi-login.mjs`, plus `scrollbar-gutter:stable`). |
| Aksesibilitas dan batas scope | Animasi menghormati `prefers-reduced-motion`. Aturan dibatasi ke `#page-modul`/`#page-tugas` dan `@media screen`; jangan mengubah login, penilaian, path Firebase, atau output cetak. |

Sumber penerapan lintas course adalah `scripts/apply-modern-academic-all-modules.mjs` untuk empat course lama (Matematika 4, Getaran, Optimalisasi, Sisken); Teknik Tenaga Listrik dan Pemodelan CAD mewarisi lapisan yang sama dari kerangka Modul 1 lewat generatornya (`scripts/ttl-modul/`, `scripts/cad-modul/`), dan validatornya memeriksa keenam course. Markup hasil normalisasi harus sudah menyimpan kelas tabel dan daftar pustaka secara statis; runtime hanya memulihkan markup lama sebagai fallback. Generator Sisken wajib menghasilkan struktur yang sama secara langsung. Cakupan pemeriksanya dirangkum di §17.1.

Khusus Sistem Kendali Cerdas, modul kelipatan tiga (Modul 3, 6, 9, dan 12) berjenis TMV. Buat ruang melalui aktivitas **Google Meet™ for Moodle** pada menu LMS, lalu pasang tautannya sebagai tombol pada kolom kanan banner pertemuan. Tautan halaman modul juga cukup tersedia pada tombol banner dan tidak perlu dibuat ulang sebagai resource URL terpisah di LMS.

### 6.2 Tugas modul

Struktur universal:

| Bagian | Jumlah | Poin per soal | Maksimum |
|---|---:|---:|---:|
| Pilihan ganda | 10 | 1 | 10 |
| Komputasi Easy/Medium | 10 | 2 | 20 |
| Komputasi Hard | 5 | 4 | 20 |
| **Total** | **25** |  | **50** |

Pengecualian: Pemodelan CAD memakai 10 PG × 1 + 5 tugas pemodelan (unggah `.FCStd` + angka bacaan; 6/6/6/11/11 poin) = 15 soal dan 50 poin, dengan konsolasi setelah ≥ 12 dari 15 soal dicoba (§2).

Markup wajib per soal (pernah rusak, jadi ditulis eksplisit):

- setiap soal pilihan ganda butuh **tiga** elemen dengan urutan ini: grup radio `id="rg-mcN"`, lalu tombol `<button class="mc-submit" id="sub-mcN" onclick="checkMC('mcN')" disabled>Periksa Jawaban</button>`, lalu kotak umpan balik `id="fb-mcN"`;
- tombol `sub-mcN` **tidak boleh hilang**: `selectMC()` diakhiri `document.getElementById('sub-' + qId).disabled = false`, sehingga elemen yang tidak ada membuat handler klik melempar `TypeError` di tengah jalan dan pilihan ganda tampak "tidak bisa dipilih". Ini pernah terjadi pada seluruh Sisken Modul 2–14 dan membuat 10 poin PG per modul tak terjangkau;
- penjaganya ada di `scripts/validate-sisken-modules.mjs` — ia memeriksa keberadaan tombol per soal **dan** urutannya. Pemeriksa lama hanya menghitung jumlah grup radio sehingga hilangnya seluruh tombol lolos tanpa keluhan.

Perilaku penilaian:

- jawaban dikirim ke `checkModulAnswer`; kunci berada di Firestore `modulAnswers` dan tidak ada di client;
- pada modul Sistem Kendali Cerdas, Teknik Tenaga Listrik, dan Pemodelan CAD (masing-masing 14 modul), urutan empat opsi PG diacak deterministik per NIM. Markup tidak membawa huruf kanonik; client mengirim huruf posisi yang terlihat dengan `mcOrderVersion: 1`, lalu server merekonstruksi permutasi memakai `shuffleSeed` dari bank exam dan memetakannya ke huruf kanonik. Payload tanpa versi tetap diperlakukan sebagai huruf kanonik agar frontend lama aman selama deployment bertahap;
- batas perlindungan shuffle PG harus disebutkan jujur: teks opsi masih berada di HTML publik sehingga mahasiswa teknis dapat menghitung ulang permutasi. Mekanisme ini mematikan penyebaran kunci huruf universal, tetapi bukan penghalang kriptografis;
- seluruh Modul 1–14 Sisken memakai komputasi parametrik per NIM. Teks `c1`–`c15` tidak lagi statis di HTML; setelah login ia diambil melalui `getModulQuestions`, sedangkan kunci/toleransi/`explain` tetap di backend privat. Registry bersama berada di `functions/modules/sisken-modul-all-v2.js`; Modul 3 mempertahankan bank pilotnya, sedangkan modul lain memakai tiga skenario topikal dengan parameter fisik berbeda serta nilai kalibrasi varian yang dinyatakan pada teks. Verifikasi `scripts/verify-sisken-all-modules.js` menjalankan 14 × 15 × 100 varian dan menolak toleransi yang saling menerima. Teknik Tenaga Listrik (`c1`–`c15`, `functions/modules/ttl-modul-all-v2.js`, penjaga `verify-ttl-modules.js`) dan Pemodelan CAD (`c1`–`c5`, `cad-modul-all-v2.js`, penjaga `verify-cad-modules.js`) memakai jalur `getModulQuestions` yang sama;
- satu `qId` hanya dapat dicoba sekali sampai direset, kecuali tugas pemodelan CAD: kiriman salah boleh dikirim ulang, dan kiriman benar setelah pernah salah bernilai 65% (§2);
- modul bersifat formatif: server boleh mengembalikan jawaban benar dan penjelasan setelah attempt;
- komputasi dinilai dengan nilai target dan toleransi pada server;
- kandidat numerik dapat berasal dari jawaban utama, angka pertama/terakhir output, dan kandidat per baris `print()`: angka pertama dan terakhir tiap baris, ditambah (sejak 30 September 2026) angka pertama dan terakhir tiap baris yang **bukan bagian label** — digit yang menempel pada huruf atau garis bawah (`T2`, `x2`, `S_1`) tidak dihitung. Tanpa tambahan itu keluaran `T2: 1136.1310 kVA  (68.24 % dari rating)` hanya memberi kandidat 2 dan 68,24, dan jawaban yang benar di tengah baris dinilai salah (laporan C13 Teknik Tenaga Listrik Modul 2). Kandidat hanya ditambah, tidak pernah dikurangi: `parseNumbers`, `_lastLineAnswer`, dan `userAnswers` tidak berubah, kandidat lama tetap di depan (halaman memotong `lineAnswers` di 64 entri), dan server tidak berubah. Dipasang `scripts/angka-tanpa-label.mjs` (§17.1). Server sengaja tidak mencocokkan semua angka di keluaran;
- soal Hard dapat memberi partial credit jika dikonfigurasi dan dikerjakan sebelum terlambat. Besarnya diambil dari `partialPoints` pada kunci Firestore: **0,5 poin, seragam di semua mata kuliah**. Attempt yang dinilai sebelum kebijakan ini berlaku tetap bernilai 1 di tiga course lama dan tidak dihitung ulang. Angka ini juga muncul sebagai teks yang dibaca mahasiswa di pengantar Bagian C, jadi ubah keduanya bersama. Tugas modul Pemodelan CAD tidak memakai partial (§2);
- poin terlambat ditentukan backend dan kini seragam: dikalikan 0,65 (potongan 35%) di semua mata kuliah;
- konsolasi satu poin (berbeda dari partial credit) ditentukan backend. Jangan memakai konstanta threshold client sebagai sumber kebenaran.

Poin tampilan modul 0–50 dikonversi menjadi nilai 0–100 untuk headline. Poin mentah tetap dipakai untuk penyimpanan dan OBE.

### 6.3 Penyimpanan dan refresh modul

- Attempt resmi disimpan di Firestore `modulAttempts/<modulId>/students/<nimKey>/qs/<qId>`, termasuk jawaban mahasiswa: `userAnswer` (huruf PG, atau angka bacaan tugas unggah Pemodelan CAD — attempt terakhir, dikembalikan `getJawabanSaya` sebagai `angka`), `mcOrderVersion` (jenis huruf PG: 1 posisi terlihat, 0 kanonik), dan `codePreview` (kode Python atau ringkasan berkas CAD).
- Record visitor RTDB hanya ringkasan publik untuk papan peringkat dan tab Hasil: poin, marker soal, `scoreDeltas`, kunjungan, dan timestamp. Sejak 29 September 2026 halaman tidak lagi membaca pilihan PG (`selections`) maupun kode (`codes`) dari record ini: rules memberi `.read: true` pada `visitors/<course>/<slot>/<kunci>` dan izin baca RTDB menurun ke seluruh anak, sementara setiap halaman mengunduh seluruh node slot, sehingga pilihan + marker benar/salah teman sekelas cukup untuk menyusun kunci jawaban modul (dan kunci ujian selama jendela ujian). Backend berhenti menulis, membersihkan, dan melarang kedua field itu (§9.1).
- Jawaban milik sendiri dipulihkan HANYA lewat callable `getJawabanSaya` (`{modulId, nim, pinHash}`, §10): dipanggil untuk tiap pasangan NIM + hash PIN sesi (dimulai lebih awal bila sesi PIN tersimpan), ditunggu `_loadScoredQuestions` paling lama 2,5 detik (sebelum perbaikan tinjauan 29 September 2026 6 detik, yang membuat halaman terkunci lebih lama saat function baru masih cold start), baru record RTDB dibaca (blok `JAWABAN-PRIVAT:TUNGGU` v2; lihat butir berikutnya), lalu digabung ke `data` tepat sesudah `const data = snap.val();` (blok `JAWABAN-PRIVAT:GABUNG`), sehingga kode pemulihan lama — textarea `code-<qId>`, kartu `berkas-status-<qId>` Pemodelan CAD, `restoredDelta`, perulangan marker — tetap bekerja tanpa diubah. Hasil yang datang sesudah batas tunggu tetap diterapkan (pemulihan diulang, idempoten). Yang dipakai hanya field berdaftar-putih: pilihan, `mcOrderVersion`, kode, ringkasan berkas yang sudah diunggah tetapi belum dinilai, dan (JEMBATAN v3, hanya halaman bertugas berkas Pemodelan CAD) angka bacaan FreeCAD yang dinilai (`angka`, number berhingga pada entri `tipe: 'comp'` ber-qId `cN` → `data.angka`, beserta `status` ledger attempt itu → `data.angkaStatus`; course lain mengabaikannya, dan respons tanpa `angka` dari backend lama menghasilkan `data` yang sama persis dengan v2); kunci dan penjelasan tidak pernah. `scoreDelta` ledger (sumber resmi, ikut rescale) menang atas `scoreDeltas` RTDB untuk setiap soal di respons yang statusnya cocok dengan marker RTDB segar soal itu; RTDB mengisi soal lain, dan 0 pada jawaban benar/partial tanpa nilai RTDB (entri cadangan migrasi) dianggap tak diketahui sehingga cadangan halaman yang dipakai. **Ledger basi tidak pernah menang atas marker segar (JEMBATAN v4, 29 September 2026):** status entri respons dicocokkan dengan marker `data.scoredQuestions` yang dibaca untuk pemulihan yang sama (sejak TUNGGU v2 sesudah penantian respons) — atau, untuk hasil yang datang terlambat di modul, dibaca ulang sesudahnya — memakai pemetaan `_statusDariMarker` backend: `qId` (PG/benar-salah benar) atau `qId_comp` = `correct`, `qId_comp_partial` = `partial`, `_mc_used`, `_tf_used`, `_comp_used`, dan `_comp_ulang` (kirim ulang CAD) = `wrong`. Entri yang tidak cocok (juga yang tanpa status) milik attempt lain dan tidak dipakai sama sekali untuk soal itu — pilihan, `mcOrderVersion`, kode, `angka`, `angkaStatus`, dan `scoreDelta`-nya dibuang, jadi poin, tampilan, dan angka bacaan mengikuti record RTDB. Soal tanpa marker (belum tercatat, di-reset dosen, atau berakhiran tak dikenal) tetap memakai entri ledger seperti sebelumnya. Ringkasan berkas yang belum dinilai (`berkas`) tidak punya status ledger; backend hanya mengirimnya untuk soal yang belum punya entri ledger saat respons dibaca. Sejak JEMBATAN v5 (tinjauan v4, hari yang sama) ringkasan itu, beserta kait `_tandaiBerkasDiServer`, tidak dipakai untuk soal yang sudah bermarker (akhiran yang dikenal pemetaan di atas; berakhiran tak dikenal = tanpa marker) atau yang kartunya sudah dikirim di sesi ini (`compAnswered[qId]`, penjaga yang sama dengan kait itu). Syarat kedua perlu untuk ujian, yang menggabung hasil terlambat ke `_cachedFirebaseData` dengan marker yang dibaca saat muat, dan untuk kiriman modul yang masih menunggu jawaban server. Temuan tinjauan (sejak #963, sama di v2–v4; terkonfirmasi headless): berkas A diunggah tanpa dikirim, halaman dimuat ulang dengan `getJawabanSaya` lambat, lalu berkas B diunggah dan dikirim di sesi itu; hasil terlambat menimpa `berkas-status` tugas yang baru dinilai ("📎 B …" di modul, "✅ Berkas dan angka bacaan diterima" di ujian) dengan "📎 A …" sampai muat ulang. Poin, kolom angka, dan ekspor tidak terpengaruh. Temuan yang diperbaiki (ada sejak #963, JEMBATAN v2; terkonfirmasi headless 29 September 2026): pada modul Pemodelan CAD, `getJawabanSaya` yang datang sesudah batas tunggu 2,5 detik (cold start, atau coba ulang 3/10 detik) membawa ledger yang dibaca sebelum mahasiswa mengirim ulang tugas `cN` dengan benar di sesi yang sama; pemulihan ulang (`_terapkanJawabanSayaTerlambat` → `_loadScoredQuestions`) membaca marker `cN_comp` dan `scoreDeltas` baru, tetapi `scoreDelta` 0 kiriman salah dari ledger menang, sehingga `compScores[cN]` menjadi 0 dan panel skor turun sampai halaman dimuat ulang (uji: skor `c2` 6 → 0). Cache respons tidak dibuang sesudah `checkModulAnswer` CAD berhasil. Pencocokan marker sudah menolak entri yang statusnya berubah, dan sejak v5 juga ringkasan berkas untuk soal yang sudah bermarker atau sudah dikirim. Membuang cache berarti membuang hasil yang sedang ditunggu (pilihan PG sesi itu tidak dipulihkan), atau memerlukan panggilan `getJawabanSaya` tambahan plus pemulihan ulang di setiap kiriman. Panggilan tambahan itu melewati gerbang penguncian PIN per NIM + sumber: ditolak selama NIM + sumber itu terkunci, dan memakai satu slot percobaan paralel sampai selesai. Namun hash PIN sesi yang sah tidak menambah hitungan gagal (`_selesaikanPercobaanPin` mengembalikan pesanannya), jadi panggilan itu tidak bisa memicu penguncian. Sisa yang disadari: entri yang statusnya tetap sama (kiriman ulang CAD yang salah lagi) masih bisa membawa ringkasan berkas attempt sebelumnya ke `berkas-status`; poin (0) dan angka bacaan (kolom yang sudah terisi tidak ditimpa) tidak terpengaruh, dan ekspor memakai berkas yang diunggah di sesi itu.
- **Snapshot RTDB tidak boleh lebih tua daripada yang sudah diketahui halaman** (blok `JAWABAN-PRIVAT:TUNGGU` v2, 29 September 2026). Aturannya: (1) record `visitors/…/mhs_<NIM>` dibaca SESUDAH penantian `getJawabanSaya` selesai (hasil datang atau batas 2,5 detik habis), bukan bersamaan, sehingga snapshot dibaca tepat sebelum diterapkan; (2) snapshot yang tidak memuat salah satu marker BENAR (`qId` untuk PG/benar-salah, `qId_comp` untuk komputasi/tugas) yang sudah ada di `window._answeredQ` — marker dari respons penilaian server di sesi ini dan dari pemulihan sebelumnya — dianggap lebih tua (mis. cache listener RTDB yang tertinggal dari respons callable): dibaca ulang tiap 750 ms paling banyak 4 kali, dan bila tetap lebih tua pemulihan itu dilewati (keadaan halaman dipertahankan, `_markLoaded()` tetap dipanggil, console `[jawaban-saya] record RTDB masih lebih tua …`). Hanya marker benar yang menjadi penanda umur, karena benar itu final di semua course (kirim ulang CAD hanya mengganti `_comp_ulang`/`_comp_used`/`_comp_partial`), sedangkan snapshot yang tidak memuat marker salah/partial tidak merusak apa pun — perulangan marker hanya menambah, kecuali pembukaan kirim ulang CAD (`_bukaKirimUlangCad`), yang justru dipicu marker salah. Pemeriksaan umur hanya berlaku untuk NIM pertama yang dipulihkan di halaman itu; bila identitas berganti tanpa muat ulang (identitas localStorage diganti tab lain), marker halaman bercampur dan pemeriksaan mati sampai muat ulang. Record yang hilang padahal halaman tahu marker benar (reset dosen selama halaman terbuka) juga dilewati; muat ulang menampilkan keadaan sesudah reset. Sebabnya: v1 membaca snapshot bersamaan dengan penantian lalu menerapkannya sampai 2,5 detik kemudian, dan halaman modul memanggil `_loadScoredQuestions` dua kali saat dimuat (auto-login +500 ms dan `setTimeout(…, 1200)`), masing-masing dengan batas tunggunya sendiri. Selama `getJawabanSaya` lambat (cold start), pemulihan pertama membuka halaman dan pemulihan kedua menyusul dengan snapshot yang dibaca 1,2 detik sesudah halaman dimuat: kiriman ulang tugas CAD yang benar di antara keduanya dibatalkan (`cN_comp_ulang` → `_bukaKirimUlangCad(cN, 0)`, skor 6 → 0, kartu terbuka lagi, bingkai kuning) sampai pemulihan berikutnya — atau sampai muat ulang bila `getJawabanSaya` gagal. Bentuk lain yang sama: kiriman lalu `_loadScoredQuestions` (login, hasil terlambat) saat cache RTDB belum menerima tulisan server. Jangan kembalikan `Promise.all([get(…), _muatJawabanSaya()])`. Umur ledger — hasil `getJawabanSaya` terlambat yang dibaca sebelum kiriman ulang, lalu `scoreDelta`-nya menang atas `scoreDeltas` RTDB — bukan urusan TUNGGU, melainkan `JAWABAN-PRIVAT:JEMBATAN`/`GABUNG`.
- `selections`/`codes`/`mcOrderVersion`/`angka`/`angkaStatus` di record publik TIDAK PERNAH dipakai, juga saat callable gagal: isinya bisa sisa lama atau tanaman orang lain (dulu `codes` bisa ditulis klien mana pun lewat celah rules), dan backend men-deploy functions + rules sebelum halaman ini terbit, jadi tidak ada masa transisi yang memerlukannya. Tanpa respons, pilihan tidak ditandai, kode kosong kecuali ada draft lokal, dan export memakai teks netral (§6.4). Kegagalan dibedakan menurut kode (dicatat di console `[jawaban-saya]`): sementara (`internal`, `unavailable`, `deadline-exceeded`, jaringan) → dicoba lagi otomatis 3 lalu 10 detik kemudian dan pada setiap `_loadScoredQuestions` berikutnya (login, verifikasi PIN); `resource-exhausted` (penguncian PIN per NIM + sumber — node yang sama dengan penilaian/soal, tidak dibagi `verifyPin`; §4.3) → pemberitahuan "Terlalu banyak percobaan PIN … coba lagi dalam N detik" (`details.remainingSeconds`), tidak memanggil lagi selama terkunci, lalu dicoba lagi otomatis — sesi PIN tetap; `unauthenticated` (PIN dirotasi atau dicabut dosen, §4.3) → hash PIN sesi dibuang (tidak diulang dengan hash yang sama, karena setiap percobaan ikut dihitung penguncian) dan PIN diminta lagi lewat modal verifikasi (hanya bila `pins/` memang kosong: pemberitahuan untuk 🚪 Log Out lalu membuat PIN baru; alat backend tidak pernah mengosongkannya); `not-found`, `invalid-argument`, dan lainnya → di-cache sampai halaman dimuat ulang. Tab baru tanpa sesi PIN tidak memanggilnya; pemulihan terjadi sesudah verifikasi PIN, yang memang memanggil `_loadScoredQuestions` lagi. Akun simulasi mendapat respons kosong. Dipasang `scripts/jawaban-privat.mjs` (§17.1).
- Kartu tugas Pemodelan CAD: berkas yang sudah terunggah tetapi belum dinilai (dari `berkas` respons, juga setelah muat ulang di perangkat lain) tampil di `berkas-status` dan kartunya ditandai lewat `window._tandaiBerkasDiServer(qId)` (`berkasDiServer`): angka bacaan bisa langsung dikirim tanpa unggah ulang (server memeriksa berkas di `tugasBerkas`), dengan petunjuk "Berkas tugas ini sudah terunggah di server tetapi belum dikirim". Kaitnya milik generator (`scripts/cad-modul/bangun-modul-1.py`, `scripts/cad-exam/kartu.py`); sebelumnya kartu menampilkan berkas tetapi tombol kirim tetap mati dan menjawab "Unggah berkas .FCStd terlebih dahulu". Sejak JEMBATAN v5 ringkasan dan tanda itu tidak dipakai untuk soal yang sudah bermarker atau yang kartunya sudah dikirim di sesi ini (butir sebelumnya), sehingga hasil `getJawabanSaya` yang terlambat tidak mengembalikan kartu yang baru dinilai ke berkas lama.
- Angka bacaan tugas Pemodelan CAD yang sudah dinilai (sejak 29 September 2026; laporan mahasiswa: setelah muat ulang kartu hanya menampilkan ringkasan berkas dan kolom angka kosong) kembali ke kolom `nilai-<qId>` lewat blok `JAWABAN-PRIVAT:ANGKA-CAD` (`scripts/jawaban-privat.mjs`, hanya 16 halaman CAD), yang membaca `data.angka` hasil JEMBATAN v3 saja (sejak v4 hanya entri yang statusnya cocok dengan marker RTDB soal itu, jadi syarat `angkaStatus` = `correct` di bawah kini lapis kedua). Modul: blok berjalan di `_loadScoredQuestions` tepat sesudah `_markLoaded()` (yang memanggil `_loadDraft`; draft sendiri bisa baru dimuat sesudah blok ini, lihat akhir butir ini); tugas benar (`cN_comp`) diisi angka ledger — menang atas draft dan ketikan, kecuali ketikan yang nilainya sama (mis. `3200,5`) — lalu dikunci dengan bingkai hijau, hanya bila status ledger attempt itu (`data.angkaStatus`) juga `correct`: respons yang lebih tua daripada marker RTDB (hasil `getJawabanSaya` yang dibaca sebelum kiriman ulang benar di sesi yang sama lalu diterapkan terlambat, atau cache sesi yang dipakai lagi oleh `_loadScoredQuestions` berikutnya) membawa angka kiriman salah sebelumnya dan tidak boleh menimpa kolom yang berisi angka kiriman benar itu (temuan tinjauan 29 September 2026: tanpa syarat ini kolom terkunci berisi angka salah dan ekspor menulisnya sampai halaman dimuat ulang); tugas yang dibuka lagi untuk kirim ulang (`cN_comp_ulang`, `_comp_used`/`_comp_partial` lama, `window._cadSudahKirim`) tidak dikunci dan diisi angka kiriman terakhir hanya bila kolomnya masih kosong (ketikan atau angka draft yang sudah ada di kolom dipertahankan; lihat akhir butir ini), lalu `_refreshTugasBtn` mengaktifkan "🔁 Kirim Ulang (maks 65%)" — keadaan yang sama dengan tepat sesudah kiriman salah di perangkat yang sama; mengirim angka yang sama lagi hanya menjadi attempt salah berikutnya (konfirmasi tetap muncul). Tugas tanpa marker (belum pernah dikirim, di-reset dosen) tidak diisi. Ujian: blok berjalan di akhir `_apply<UTS|UAS>VisualState(data)` (ikut `_reapply…StateFromCache` sesudah kartu dirender dan hasil `getJawabanSaya` yang terlambat); setiap tugas yang sudah dinilai (satu kesempatan: benar, partial rakitan, atau salah) diisi dan dikunci dengan bingkai sesuai status; `_loadDraft` ujian melewati kolom yang terkunci. Angka ditulis `String(n)` (titik desimal, tanpa format lokal yang ambigu dengan pemisah ribuan); `_parseNilai` menerima keduanya. Tanpa `data.angka` (backend lama belum di-deploy, callable gagal, akun simulasi, dosen, tamu) halaman berperilaku persis seperti sebelumnya. Draft materi (butir **Draft materi** di bawah, `scripts/draft-modul.mjs`) dimuat `_markLoaded` hanya bila progres sesi itu sudah diterima server, jadi bisa sebelum atau sesudah blok ini. Kolom tugas yang sudah dinilai (`compAnswered`) tidak pernah diisi draft, sehingga angka ledger tugas benar selalu menang. Kolom tugas yang dibuka lagi untuk kirim ulang diisi oleh yang lebih dulu berjalan, karena keduanya hanya mengisi kolom yang masih kosong: angka draft (perbaikan yang diketik sebelum muat ulang) bila progres sudah diterima saat `_markLoaded`, selain itu angka kiriman terakhir dari blok ini (headless 29 September 2026: progres 0 ms → angka draft, progres 6 detik → angka kiriman terakhir). Sejak `DRAFT-MODUL:PENJAGA` v3 (30 September 2026) angka kiriman terakhir maupun angka ledger tugas yang dinilai tidak pernah masuk draft — draft hanya menyimpan kolom yang diketik di tab itu, dan sejak v4 angka yang diketik lalu DIKIRIM di tab itu keluar dari draft begitu kirimannya dinilai (juga bila tugasnya dibuka lagi; sejak v5 sudah saat dikirim, juga bila hasilnya tak pasti atau tab/perangkat lain yang mengirim, dan saat draft dimuat bila sama dengan angka ledger) — jadi perbaikan yang belum dikirim tetap tersimpan di draft walau kolomnya sempat menampilkan angka kiriman terakhir (headless 30 September 2026: progres 6 detik → kolom berisi angka kiriman terakhir, draft tetap angka perbaikan). Sisa yang disadari: dengan progres lambat kolom menampilkan angka kiriman terakhir, bukan perbaikan yang belum dikirim; perbaikan itu tampil lagi pada muat ulang berikutnya yang progresnya sudah diterima saat `_markLoaded`.
- Identitas di localStorage (`<course>_identity_<slot>`) hanya berisi data login: `saveIdentity` menyimpan `_identitasTanpaJawaban(v)` — tanpa `selections`, `codes`, `scoreDeltas`, `pinHash`, `pinSetAt`; identitas ber-NIM mahasiswa selalu berperan `student` — dan salinan lama yang masih memuatnya (atau berperan dosen dengan NIM mahasiswa) dibersihkan saat halaman dimuat (komputer lab dipakai bergantian). Sesudah login (submitVisitor, PIN baru, verifikasi PIN) identitas disimpan lewat `_identitasLogin(record, nama, nim)`: nama dari roster dan NIM yang diketik (atau `_pinFlow`), peran `student` — tidak pernah disalin dari record `visitors/`, yang dulu bisa dibuat lebih dulu oleh siapa pun dengan peran dosen atau nama/NIM palsu (identitas palsu itu mematikan pemulihan dan mengirim NIM lain ke callable).
- Tulisan klien ke record visitor lewat `_tulisPengunjung`, sesuai rules create-only (backend, §9.1): record baru → `set()` berisi field identitas + kunjungan saja (`nama`, `nim`, `role: 'student'`, `timestamp`, `lastVisit`, `visitCount: 1`, `points: 0`, `scoredQuestions: ''`); record yang sudah ada (penambah kunjungan auto-login, PIN baru dengan record lama, verifikasi PIN Matematika 4 Modul 4–14, konsolasi lama yang tidak dipanggil) → `update()` hanya `visitCount`/`lastVisit` yang berubah, ditambah penghapusan `pinHash`/`pinSetAt` lama — satu-satunya yang boleh diubah klien. Klien tidak pernah menulis ulang identitas, poin, marker, `selections`/`codes`, atau `pinHash` dari snapshot record. Cadangan lama di verifikasi PIN yang menulis ulang seluruh record (`freshRec`, dengan poin/marker salinan) sesudah `PERMISSION_DENIED` dihapus: rules selalu menolaknya, dan catatan kunjungan yang gagal kini hanya dicatat di console tanpa menghalangi login. Dulu penambah kunjungan menulis ulang seluruh record; menurut rules, tulisan itu ditolak bila record memuat `selections` (field tanpa aturan anak jatuh ke `$other: false`), sehingga `visitCount` mahasiswa yang sudah menjawab PG tidak pernah naik lewat auto-login — kini naik sesuai jeda 1 jam, sama seperti mahasiswa lain.
- **Draft materi yang belum dikirim** (sejak 29 September 2026, `scripts/draft-modul.mjs`; blok `DRAFT-MODUL:PENJAGA` v2 sesudah tinjauan hari yang sama, v3 sesudah verifikasi 30 September 2026, v4 sesudah verifikasi putaran berikutnya hari yang sama, v5 sesudah verifikasi putaran 2): kode komputasi (`code-cN`), tautan Google Drive, teks Forum, dan — di Pemodelan CAD — angka bacaan (`nilai-cN`) beserta metadata berkas yang sudah diunggah (`berkasTerunggah`) disimpan di localStorage `draft_modul_<MODUL_ID>_<nim>`, per modul dan per NIM, lalu dipulihkan setelah muat ulang di peramban yang sama (Matematika 4 Modul 4 memang tidak menyimpan kode). Kunci hanya ada untuk peran `student` (termasuk akun simulasi) dengan sesi PIN di luar Mode Preview; dosen, tamu, Mode Preview, dan tab tanpa sesi PIN tidak membaca maupun menulis draft. Komputer lab: draft tidak dihapus saat Keluar, tetapi hanya dimuat sesudah server menerima PIN NIM pemiliknya (butir pertama di bawah), dan sejak v3 isinya hanya isian yang belum dinilai atau belum terkirim — tanpa jawaban ledger maupun teks server (butir **isi draft** di bawah). Halaman UTS/UAS tidak memakai kunci ini, melainkan `draft_ujian_<EXAM_ID>_<NIM>` (butir **Draft UTS/UAS** di bawah), sehingga draft ujian dan draft modul tidak saling menimpa atau memulihkan. Aturannya:
  - draft dimuat bila sesi itu — kunci + hash PIN sesi — memenuhi dua syarat: (1) data Firebase-nya sudah dimuat: `_loadDraft()` dari `_markLoaded` pada `_loadScoredQuestions` yang berjalan dengan sesi itu, jadi sesudah marker dan kode ledger (`getJawabanSaya`) diterapkan, dan draft hanya mengisi kolom yang masih kosong; kolom kode/angka soal yang sudah dinilai (`compAnswered`) tidak pernah diisi draft, juga bila kode ledger-nya datang terlambat (> 2,5 detik), sehingga isinya tetap dari ledger; dan (2) server sudah menerimanya: event `progres-modul:diterapkan` `{ok:true}` (§6.7) dengan sesi itu, sebab `getModulProgress` memeriksa PIN NIM itu. Syarat (2) ada karena hash PIN sesi (sessionStorage per tab) tidak terikat NIM: sesudah mahasiswa A menekan Log Out, identitas mahasiswa B yang login di tab lain lalu menutup tabnya ter-auto-login di tab A dengan hash A, dan tanpa syarat itu draft B termuat tanpa PIN B selama `getJawabanSaya` lebih lambat daripada batas tunggunya (ditemukan tinjauan 29 September 2026, sebelum rilis). Akibatnya selama progres gagal dimuat (galat sementara dicoba ulang 3/10/30 detik oleh PENJAGA-FORUM) atau akses ditolak sampai **Periksa lagi**, draft belum dimuat dan ketikan belum tersimpan sebagai draft; draft yang ada tetap utuh. Pemuatan tanpa sesi PIN (tab baru sebelum PIN) dan jaring 10 detik tidak dihitung; Matematika 4 Modul 4, yang `_markLoaded`-nya fungsi klasik global tanpa `_loadDraft` di jalur tanpa record/galat, mencatat sesi siap dari `window._markLoaded` (jaring 10 detik dan penangan galat modul itu juga memanggilnya, tetapi draft tetap menunggu progres dan modul itu tidak menyimpan kode);
  - **tidak ada tulisan sebelum draft kunci itu dibaca**: `_saveDraft` dari `checkExportReady`/`checkForumReady` di `_markLoaded`, `terapkanProgres`, pemulihan kirim ulang CAD (`_bukaKirimUlangCad`), DOMContentLoaded Sisken 2–14, dan jaring 10 detik ditahan sampai draft dimuat; sesudah dimuat gabungan draft + isian halaman disimpan sekali, dan setiap ketikan di kolom kode, Drive, angka, atau Forum tersimpan (juga kolom tanpa `oninput`);
  - **isi draft** (v3, 30 September 2026; temuan verifikasi privasi komputer bersama: v2 menulis kode/angka soal yang sudah dinilai — ledger privat dari `getJawabanSaya` — dan teks Forum server ke localStorage, dan keduanya tertinggal sesudah Log Out): tulisan `_saveDraft` halaman disaring sebelum sampai ke localStorage — selama `_saveDraft` asli berjalan `Storage.prototype.setItem` dibungkus sesaat, jadi badan fungsi halaman tidak disunting dan tulisan localStorage lain di dalamnya dibuang. Kode/angka soal yang sudah dinilai (`compAnswered`) tidak pernah tersimpan; kolom kode/angka dan tautan Drive diambil dari DOM hanya bila **diketik di tab itu** (event `input`), selain itu isi draft tersimpan dipertahankan — sehingga kode/angka ledger, angka kiriman terakhir tugas CAD yang dibuka lagi (`JAWABAN-PRIVAT:ANGKA-CAD`), dan isi tab lain yang masih memuat data lama tidak pernah masuk draft. Metadata berkas CAD tugas ber-`compAnswered` dibuang. Tugas CAD yang **dikirim lalu dibuka lagi** (v4; temuan verifikasi putaran 1, 30 September 2026: kiriman yang dinilai salah membuat `_bukaKirimUlangCad` mengembalikan `compAnswered` ke false, sementara tanda "diketik" masih ada, sehingga v3 tetap menyimpan angka yang dikirim dan metadata berkas yang dinilai — juga sesudah Log Out dan muat ulang) tidak lagi menyimpan keduanya; sejak v5 kiriman dikenali di pembungkus penilaian (butir berikut), bukan lagi di `_bukaKirimUlangCad(…, true)`. **Kiriman** (v5; temuan verifikasi putaran 2, 30 September 2026: v4 hanya mengenali kiriman lewat `_bukaKirimUlangCad(…, true)` di tab yang MENERIMA respons, jadi angka tugas CAD yang dikirim tetap di draft — juga sesudah muat ulang dan Log Out — bila respons hilang atau berakhir galat sesudah server menilai, bila tab dimuat ulang saat menilai, atau bila tab/perangkat lain yang mengirim; kode soal yang dinilai di tab lain juga kembali lewat simpanan kolom lain di tab yang masih terbuka): PENJAGA membungkus `window._callCheckModulAnswer` lewat accessor (skrip module menugaskannya sesudah PENJAGA; janjinya diteruskan apa adanya, soal PG dilewatkan). Tugas CAD: begitu dikirim, angka dan berkas kiriman itu keluar dari draft tersimpan (selama menunggu, `compAnswered` hanya kunci optimistis `kirimTugas`, jadi angka lain tugas itu — mis. yang diketik di tab lain — tetap); hasil dinilai (juga `bisaUlang`) atau **tak pasti** (galat `deadline-exceeded`/`internal`/`unknown`/`aborted`/`cancelled`/`data-loss`/jaringan, yang bisa terjadi sesudah server menilai) → angka (dibandingkan sebagai bilangan lewat `_parseNilai`, jadi `4321,5` = `4321.5`) dan sidik berkas (nama, SHA-256, waktu unggah, versi) itu dicatat terkirim dan tidak pernah tersimpan lagi, juga lewat simpanan kolom lain; ditolak sebelum dinilai (`failed-precondition`, `invalid-argument`, `unavailable`, `unauthenticated`, … — bukan attempt) → sesudah catch halaman isian kolom itu kembali ke draft. Saat draft dimuat, angka draft yang sama dengan angka kiriman terakhir tugas itu di **ledger** (`getJawabanSaya` NIM + hash PIN sesi itu, `jawaban[q].angka` — angka yang juga diisi ANGKA-CAD, dicatat pembungkus `_getJawabanSayaCallable`) tidak mengisi kolom dan keluar dari draft; bila `getJawabanSaya` lebih lambat dari batas tunggunya, pada muat berikutnya (hasil terlambat memicu `_loadScoredQuestions` lagi). Hasil dinilai/tak pasti diumumkan ke tab lain peramban yang sama lewat `BroadcastChannel` (`draft-modul-kiriman`, di memori; tidak ada yang ditulis ke localStorage): soal yang dinilai **final** dianggap dinilai juga di tab itu (kode maupun angka/berkas tidak tersimpan dari tab itu), angka/sidik berkas kiriman dicatat terkirim, dan metadata draft yang masih ditahan untuk tugas itu dibuang. Angka dan berkas yang diketik/diunggah **sesudah** kiriman tersimpan seperti biasa; ketikan tab itu yang sama dengan angka terkirim memberi jalan pada isi draft tersimpan yang belum dikirim (angka tab lain tidak hilang). Kode Python yang hasil penilaiannya tak pasti tidak dibuang (mahal diketik ulang; sesudah muat ulang `compAnswered` membersihkannya bila memang dinilai). Batas yang disadari: ledger hanya membawa attempt terakhir, jadi angka draft yang sama dengan attempt lebih lama dari perangkat lain baru keluar bila diketik ulang atau dikirim lagi; perangkat lain baru tahu sesudah muat ulang (tidak ada pengumuman lintas perangkat); dan kiriman yang hasilnya tak pasti padahal server tidak menerimanya membuat angka itu tidak pulih sesudah muat ulang (kolom di tab itu tetap berisi angkanya; angka bacaan bisa dibaca ulang dari FreeCAD). Pemulihan marker sesudah muat (`_bukaKirimUlangCad(…, false)`) bukan kiriman. Teks Forum hanya disimpan bila berbeda dari teks server yang diketahui tab itu (suntingan belum terkirim), bersama `forumBasis` = sidik 53-bit (cyrb53) teks server tempat suntingan itu dibuat — bukan teks server itu sendiri; sesudah `progres-modul:forum-tersimpan` teks yang terkirim keluar dari draft. Draft yang tidak berisi apa pun dihapus, dan salinan `<kunci>_sinkron` v2 (berisi teks server) dihapus saat draft dimuat. Draft tidak dihapus saat Log Out (isian yang belum terkirim milik mahasiswa), tetapi tidak berisi jawaban ledger, angka/berkas yang sudah dikirim dan dinilai, maupun teks server (headless 30 September 2026: sesudah muat — juga dengan `getJawabanSaya` 5 detik — dan sesudah Log Out; v4 juga sesudah kiriman CAD yang dinilai salah, sesudah Log Out berikutnya, dan sesudah muat ulang; v5 juga sesudah respons penilaian hilang/galat, muat ulang saat menilai, kiriman dari tab atau perangkat lain, dan Log Out langsung tanpa muat ulang). Akun simulasi menulis draft seperti mahasiswa; itu disengaja supaya alur draft bisa diuji dengan akun itu (isinya tersaring sama);
  - teks Forum, **gabung 3-arah** (v3): salinan resmi di server (`saveModulForum`, §6.7) menang atas draft, kecuali suntingan yang **belum terkirim**. Saat draft pertama kali dimuat, per jawaban yang draftnya ≠ '' dan ≠ teks server: sidik teks server = `forumBasis` draft → server belum berubah sejak suntingan dibuat → suntingan dikembalikan ke textarea dan dikirim PROGRES-MODUL sesudah progres diterapkan (tidak pernah sebelumnya, §6.7); sidik berbeda → teks server berubah di perangkat atau tab lain → **server menang**: textarea yang masih berisi teks draft diganti teks server (juga teks kosong, jadi jawaban yang sengaja dikosongkan di perangkat lain tidak dihidupkan lagi), suntingan lama dibuang dari draft, dan catatan lembut `#dm-catatan-fqN` muncul di bawah textarea sampai jawaban itu diketik lagi. Draft tanpa `forumBasis` (hanya buatan tangan/uji) dianggap belum terkirim hanya bila server belum punya catatan forum sama sekali. Textarea yang sudah diubah mahasiswa sebelum draft dimuat tidak disentuh. v2 memakai salinan tersinkron `<kunci>_sinkron`: suntingan pendek yang belum terkirim di perangkat 1 terbaca "belum terkirim" hanya karena berbeda dari salinan itu, lalu menimpa suntingan yang lebih baru dari perangkat 2 dan membalik `forumSelesai` true → false (temuan verifikasi 30 September 2026, terkonfirmasi headless pada v2; v3: server menang, 0 kiriman);
  - **dua tab modul yang sama**: sesudah muat pertama, simpanan draft hanya mengambil teks Forum dari textarea yang disunting **di tab itu** (event `input`; tandanya dilepas sesudah kiriman sukses, dan teks yang terkirim menjadi teks server yang diketahui tab itu); jawaban lain mempertahankan suntingan draft yang sudah tersimpan beserta basisnya. Tanpa itu tab yang masih memuat teks lama menimpa draft lewat simpanan kolom lain (tautan Drive, kode, `checkExportReady` saat menjawab soal), teks lama itu terbaca "belum terkirim" saat tab itu dimuat ulang, lalu dikirim menimpa suntingan yang lebih baru dari tab lain. Soal kode/tugas CAD yang **dinilai di tab lain** (v5): hasilnya diumumkan lewat `BroadcastChannel` (butir **isi draft**), jadi simpanan kolom lain di tab yang masih memuat kode/angka lama tidak mengembalikannya ke draft (v3/v4: baru bersih pada muat ulang berikutnya karena `compAnswered`, dan tetap ada sesudah Log Out tanpa muat ulang);
  - **berkas Pemodelan CAD** (v3): metadata berkas dari draft dipakai hanya sesudah `getJawabanSaya` untuk NIM + hash PIN sesi itu **selesai dan diterapkan** — PENJAGA memasang accessor `window._getJawabanSayaCallable` (hanya di halaman ber-`berkasTerunggah`, sebelum skrip module JEMBATAN menugaskannya; janji callable diteruskan apa adanya, jadi ledger tetap menang) yang mencatat panggilan yang sukses, lalu `_markLoaded` sesudahnya, yang berjalan sesudah `_gabungJawabanSaya` menandai `berkasDiServer` dan menulis ringkasan server di kartu — dan hanya bila server tidak punya berkas tugas itu atau sidik SHA-256 (16 heksa pertama) metadata draft sama dengan ringkasan server di kartu `berkas-status-qId`. Sebelum itu metadata ditahan di memori (tetap tersimpan di draft) dan tidak dipasang di `berkasTerunggah`, jadi kartu, konfirmasi kirim ("yang terakhir diunggah"), dan ekspor tidak menyebut berkas lama selama `getJawabanSaya` lebih lambat dari batas tunggunya 2,5 detik (v2 memasangnya di jendela itu — temuan verifikasi 30 September 2026); bila server punya berkas lain, ringkasan server menang dan metadata draft dibuang. Unggahan di tab itu selalu menang. Server menilai berkas terbaru di `tugasBerkas`. **Tugas yang dibuka lagi** (`window._cadSudahKirim`, v4): metadata draft tidak pernah dipakai sesudah muat ulang dan dibuang — kartu tugas itu memuat ringkasan **ledger** berkas yang sudah dinilai (`codePreview`), dan `getJawabanSaya` tidak melaporkan unggahan yang belum dinilai untuk tugas ber-ledger, jadi tidak bisa dipastikan metadata draft itu berkas terbaru; kesamaan SHA-256 dengan ringkasan ledger justru berarti berkas yang sudah dinilai (v3 memakainya karena SHA-nya sama, sehingga sesudah perangkat lain mengunggah berkas baru konfirmasi kirim menyebut berkas yang sudah dinilai). Konfirmasi kirim tugas itu menyebut "yang terakhir diunggah", sama dengan `origin/main`; kartu dan ekspor menampilkan ringkasan ledger dari server seperti sebelum draft ada. Angka bacaan draft yang berbeda dari angka kiriman terakhir di ledger (perbaikan yang diketik sesudah kiriman terakhir) tetap mengisi kolom tugas yang dibuka lagi bila kolomnya kosong; angka yang sama tidak (kolom itu diisi ANGKA-CAD, v5);
  - **NIM berganti tanpa muat ulang** (logout paksa karena jadwal dihapus atau identitas tanpa PIN, lalu NIM lain masuk di tab yang sama): pada `_markLoaded` atau progres pertama NIM baru, kolom draft dikosongkan dan halaman dimuat ulang, jadi isian NIM sebelumnya tidak masuk draft maupun forum NIM baru (sesi PIN NIM baru tersimpan di tab, jadi ia tetap masuk sesudah muat ulang);
  - kunci lama `<slug>_draft_<MODULE_ID>_<nim>` (termasuk kunci bersama Matematika 4 Modul 1/2/3/5 dan kunci bergeser Optimalisasi 11/12 dan 13/14, yang di komputer lab bisa berisi draf NIM lain) tidak dibaca, tidak dipindah, dan tidak dihapus.

  Pilihan quick check Forum **bukan** bagian objek draft (objek itu ditulis ulang dari DOM lalu disaring, lihat **isi draft**); kuncinya sendiri `forum_poll_<MODUL_ID>_<nim>` ditambah salinan server `forumPoll` yang ditulis callable terpisah `saveModulPoll` (§6.5). Sebelum 29 September 2026 draft materi tidak pernah pulih: `_draftKey` di 43 halaman (Getaran Modul 1, Sisken, Teknik Tenaga Listrik, Pemodelan CAD) merujuk `const` skrip module (ReferenceError → null), dan di halaman lain `_saveDraft` menulis kolom kosong sebelum `_loadDraft` membacanya. Dipasang `scripts/draft-modul.mjs` (§17.1).
- Setelah refresh, halaman memuat marker dan data tersimpan sebelum mengizinkan interaksi.
- Pilihan PG yang sudah dijawab ikut dipulihkan setelah refresh (sejak 28 September 2026; v3 29 September 2026). Sumbernya `data.selections[mcN]` hasil penggabungan di atas — hanya ledger lewat `getJawabanSaya`, tanpa field RTDB publik: huruf yang dikirim `selectMC`, yaitu huruf kanonik dari `onclick` di Matematika 4, Getaran Mekanik, dan Optimalisasi & Otomasi, atau huruf posisi terlihat (`data-display-letter`) di Sisken, Teknik Tenaga Listrik, dan Pemodelan CAD yang urutan opsinya diacak per NIM (§6.2). Urutan acak per NIM diterapkan dulu (`shuffleMCOptions`, idempoten), lalu opsi itu mendapat `.selected` ditambah `.correct-ans` bila markernya `mcN` atau `.wrong-ans` bila `mcN_mc_used`. Opsi benar untuk jawaban salah **tidak** diungkap saat pemulihan, karena server hanya mengembalikan kuncinya saat submit. Kunci grup, redup `.6`, teks umpan balik, dan `mcAnswered`/`mcScores` tetap diatur perulangan marker seperti sebelumnya. Jenis huruf dibaca dari ledger, `data.mcOrderVersion[mcN]`: 1 = huruf posisi terlihat; 0 = huruf kanonik — pada course acak dicari lewat `data-huruf-asal`, huruf urutan markup yang dicatat blok `JAWABAN-PRIVAT:HURUF-ASAL` sebelum opsi diacak (attempt Sisken 5–8 Agustus 2026, sebelum acak per NIM terpasang). Tanpa entri itu (respons tanpa `mcOrderVersion`) berlaku penjaga v2: pada course acak huruf posisi hanya dipercaya bila `timestamp` record (kunjungan pertama; rules RTDB melarang klien mengubahnya) jatuh pada/sesudah `2026-08-09T00:00:00Z` — modul Sisken terbit 5 Agustus 2026 dengan huruf kanonik di `onclick` dan acak per NIM baru terpasang 8 Agustus 2026 ±17:14 +08:00 (attempt sebelumnya tetap sah), dan tanpa penjaga ini sekitar 3 dari 4 record lama menandai opsi yang salah dan export menulis teks opsi keliru bertanda ✓. Record tanpa pilihan yang dikenali (atau berisi indeks angka pada course acak) tetap dikunci tanpa penanda; export memakai teks netral (§6.4). Dipasang `scripts/pulihkan-pilihan-pg.mjs` (blok `PILIHAN-PG-PULIH` v3 tepat sesudah blok `JAWABAN-PRIVAT:GABUNG`, yang tepat sesudah `const data = snap.val();` di `_loadScoredQuestions`).
- Jika attempt Firestore ada tetapi transaksi RTDB sebelumnya gagal, submit ulang pada soal terkunci dapat menjalankan self-heal tanpa memberi poin ganda.
- **Draft UTS/UAS** (12 halaman ujian, sejak 29 September 2026, `scripts/draft-ujian.mjs`). Kode komputasi (`code-cN`) dan tautan Google Drive yang belum dikirim — di UTS/UAS Pemodelan CAD: angka bacaan FreeCAD (`nilai-cN`) — disimpan di localStorage `draft_ujian_<EXAM_ID>_<NIM>`, per ujian dan per NIM, sehingga UTS dan UAS (juga course lain) tidak saling memulihkan. Kunci hanya ada untuk peran `student` (termasuk akun simulasi) dengan sesi PIN di luar Mode Preview; dosen, tamu, dan Preview tidak membaca maupun menulis draft. Sebelumnya draft ujian mati di ke-12 halaman: `_draftKey` (skrip klasik) membaca `LOCAL_IDENTITY`/`MODULE_ID`, `const` milik skrip module → ReferenceError → null; kini isinya blok `DRAFT-UJIAN:KUNCI` yang membaca `window.EXAM_ID` dan `getIdentityLocal()`. Blok `DRAFT-UJIAN:PENJAGA` (v2, skrip klasik tepat sebelum skrip module) membungkus `_saveDraft`/`_loadDraft`: draft dimuat hanya sesudah kartu soal dari `getExamQuestions` dirender (perender UTS/UAS dibungkus; 250 ms sesudah render, yaitu sesudah pemulihan ulang visual dari cache 150 ms) **dan** sesudah data Firebase termuat *untuk kunci draft itu*. Tandanya `_loadDraft()` dari `_markLoaded` (akhir `_loadScoredQuestions`) yang berjalan saat identitas + sesi PIN sudah ada. Pemuatan Firebase tanpa sesi PIN — tab baru sebelum PIN dimasukkan, form login sesudah Keluar — tidak dihitung: `getJawabanSaya` belum bisa dipanggil, jadi kode ledger soal yang sudah dinilai belum ada di kolomnya. Penjaga v1 hanya menagih `_firebaseStateLoaded`, yang sudah true dari pemuatan itu, sehingga draft lama mengisi kolom kosong tersebut lebih dulu dan menutupi kode ledger (pemulihan visual hanya mengisi kolom kosong), termasuk di HTML ekspor. Draft hanya mengisi kolom yang masih kosong dan tidak mengisi kolom soal yang sudah terkunci (dinilai, `disabled`). Karena itu kode ledger soal yang dinilai yang tampil, juga bila `getJawabanSaya` lebih lambat dari batas tunggu 2,5 detik: marker RTDB sudah mengunci kartunya, dan kolomnya tetap kosong sampai kode ledger datang. Kartu CAD yang dinilai dikunci `_kunciTugasCad`, jadi draft tidak mengisi angkanya; angka bacaan yang dinilai baru kembali ke kolom itu bila blok `JAWABAN-PRIVAT:ANGKA-CAD` (`scripts/jawaban-privat.mjs`) terpasang — tanpa blok itu kolomnya kosong sesudah muat ulang. Firebase yang menggantung (hanya jaring 10 detik yang membuka interaksi, tanpa `_markLoaded`) tidak dianggap siap: draft tidak dimuat dan ketikan tidak disimpan. Tidak ada tulisan sebelum draft kunci itu dimuat — dulu `checkExportReady` → `_saveDraft` yang berjalan sebelum kartu ada menulis `code: {}`/`nilai: {}` di atas draft. Setiap ketikan di kolom kode, tautan Drive, atau angka bacaan menyimpan draft (kolom kode ujian tidak punya `oninput`, dan tautan Drive dulu hanya tersimpan bila ekspor sudah "siap"). Draft tidak dihapus saat Keluar dan tidak dimigrasi dari kunci lama `<slug>_draft_<uts|uas>_<nim>`, yang memang tidak pernah tertulis. Generator CAD (`scripts/cad-exam/bangun.py`) mewarisi PENJAGA dari kerangka TTL tetapi menulis ulang `_draftKey` lama, jadi `draft-ujian.mjs` dijalankan sesudahnya (§17.1).

### 6.4 Export tugas

Export tugas baru aktif jika:

- seluruh 10 pilihan ganda sudah dijawab;
- seluruh 15 soal komputasi sudah dicoba;
- link Google Drive valid sudah diisi.

Pemodelan CAD: seluruh 10 PG dijawab dan kelima tugas pemodelan sudah dikirim; tautan Google Drive opsional (cadangan berkas; bila diisi harus valid), karena berkas `.FCStd` resmi sudah tersimpan di server saat diunggah.

File export memuat identitas, jawaban/kode, poin server, waktu, dan kode verifikasi. Nama file harus memuat nomor tugas, NIM, dan course yang benar.

Kolom jawaban PG di file export memakai teks opsi yang bertanda `.selected` — pilihan sesi ini atau hasil pemulihan §6.3 — dengan ✓/✗ dari `.correct-ans`, dan poin dari `mcScores`. Bila teks pilihan tidak diketahui (`getJawabanSaya` gagal atau belum ter-deploy — record publik tidak pernah dipakai —, attempt tanpa ledger maupun cadangan migrasi, atau record course acak tanpa `mcOrderVersion` yang lebih tua dari acak per NIM, §6.3), jawaban benar ditulis "(Sudah dijawab benar — teks pilihan tidak tersedia)", jawaban salah "(Sudah dijawab, tetapi pilihan salah)", dan soal yang belum dijawab "(Belum dijawab)". Sebelum 28 September 2026 jawaban **benar** yang di-export setelah halaman dimuat ulang tertulis "(Sudah dijawab, tetapi pilihan salah)" padahal poinnya 1 dan bertanda ✓, karena pemulihan tidak menandai opsi apa pun. Aturan teks ini dipasang `scripts/pulihkan-pilihan-pg.mjs` (blok `PILIHAN-PG-EKSPOR` di ke-84 modul), dan `validate-public-security.mjs` menolak bentuk lamanya. Kolom kode komputasi diambil dari textarea yang dipulihkan dari `codePreview` ledger lewat `getJawabanSaya` (atau dari draft lokal), dan bukti tugas Pemodelan CAD dari kartu `berkas-status` ditambah "Angka bacaan: X" dari kolom angka (`_ringkasTugasCad`) — keduanya tidak lagi bersumber dari record RTDB publik (§6.3). Setelah muat ulang, kolom angka tugas yang sudah dinilai dipulihkan dari ledger (blok `JAWABAN-PRIVAT:ANGKA-CAD`, §6.3), sehingga baris ekspor memuat "Angka bacaan: X" tepat sekali per tugas (ringkasan berkas dari server tidak memuat angka); angkanya ditulis dengan titik desimal (`3200.5`), bukan ketikan asli (`3200,5`) seperti sebelum muat ulang.

Pada Sisken Modul 2–14, `scripts/sisken-export-html.mjs` menyalin ekor alur export lengkap dari Modul 1 setelah daftar judul PG yang memang spesifik per modul: pengumpulan jawaban, pembangunan dokumen HTML, pembuatan `Blob`, anchor download, dan pembersihan object URL. Generator `enrich-sisken-modules.mjs` wajib menjalankan normalizer ini agar regenerasi materi tidak dapat mengembalikan fungsi export yang berhenti setelah daftar `MC_QUESTIONS`.

**Animasi milik satu modul, bukan dicap ke semua.** Dahulu Modul 2–14 memakai tiga animasi yang sama (respons step, rasio redaman, Bode) apa pun topiknya — animasi respons step sampai tampil di modul Logika Fuzzy. Kini tiap modul punya tiga animasi dan satu grafik sendiri di `scripts/sisken-animasi.mjs` (trio lama menjadi milik Modul 8, satu-satunya modul yang topiknya memang karakteristik respons); `bangunRuntime(n)` hanya menyisipkan fungsi gambar milik modul itu ke halamannya. `validate-sisken-modules.mjs` menegakkan: tiap modul 2–14 tepat 3 panel `Animasi k —` + 1 `Grafik 1 —`, keempat fungsi `drawSiskenAnim1..3`/`drawSiskenGrafik` ada di runtime, dan **judul animasi unik lintas modul** (termasuk terhadap Modul 1) — duplikat berarti animasi generik kembali dicap ke banyak modul.

**Regenerasi Sisken bukan satu perintah.** Setelah `enrich-sisken-modules.mjs`, jalankan ulang skrip pasca-proses yang menambal bagian di dalam `page-modul`: `apply-sisken-all-parametric.mjs` lalu `apply-modern-academic-all-modules.mjs` (keduanya idempoten; skrip apply lain akan melewati halaman yang tambalannya masih utuh). Menjalankan enrich saja menghapus hero `academic-hero`, roadmap, dan CSS panel sticky — `validate-sisken-modules.mjs` dan `validate-all-course-modern-design.mjs` akan menangkapnya. Catatan: skrip apply yang berupa migrasi satu-kali **dihapus setelah hasilnya di-commit** — membiarkannya membuat alur regenerasi tampak lebih panjang dari kenyataannya, dan jangkarnya lapuk begitu halaman berevolusi. Preseden: `apply-module-deadline-wib-24h.mjs` (deadline WIB 24 jam, PR #787) dihapus setelah gagal pada jangkarnya sendiri; hasil migrasinya diverifikasi tetap tertanam di ke-56 halaman (`Asia/Jakarta`, `scheduleDueTime`).

File HTML lokal tetap dapat diedit oleh pemilik file. Kode HMAC tidak mencegah edit; kode itu mendeteksi ketidaksesuaian ketika diperiksa melalui `Admin/verify-export-code.html`.

### 6.5 Forum dan chat

- Tab Forum berisi pertanyaan diskusi dan alat salin HTML untuk LMS.
- HTML yang disalin harus menggunakan struktur yang stabil untuk editor LMS: style inline dan layout tabel lebih aman daripada layout CSS kompleks.
- Kunci jawaban jajak Forum Sisken disimpan pada `window._forumPollAnswerHashes`; jangan memakai nama global generik yang dapat tertimpa skrip lain. Generator menormalkan runtime melalui `scripts/sisken-forum-runtime.mjs`.
- **Pilihan quick check tersimpan per mahasiswa per modul** (sejak 29 September 2026; laporan mahasiswa Pemodelan CAD Modul 2). Jajak quick check (`.poll-opts` id `fp1`..`fp3`, opsi `onclick="voteForum(n,this,idx)"`; Matematika 4, Getaran Mekanik, dan Optimalisasi 2 poll, Sisken, Teknik Tenaga Listrik, dan Pemodelan CAD 3) dulu hanya menandai DOM, sehingga setelah muat ulang semua poll kosong, status menjadi "PG: 0/N dipilih" + "⚠ N pilihan ganda belum dipilih", dan tombol **📋 Copy Forum (kode HTML)** mati sampai poll dipilih ulang. Blok `PILIHAN-POLL-FORUM` (`scripts/simpan-pilihan-poll.mjs`, §17.1) kini:
  - membungkus `voteForum`: pilihan baru mahasiswa aktif (peran `student`, termasuk akun simulasi; bukan Mode Preview) ditulis ke localStorage `forum_poll_<MODUL_ID>_<nim>` = `{"pilihan":{"1":idx,…},"diServer":["1",…],"forumBelumSelesai":true}` (`diServer` = kunci yang sudah dikonfirmasi server; bentuk datar `{"1":idx}` dari v1 tetap dibaca), lalu dikirim ke server lewat callable **terpisah** `saveModulPoll` `{modulId, nim, pinHash, pilihanPoll}` (§10). Pilihan poll **tidak pernah** lewat `saveModulForum`;
  - **mengapa callable terpisah** (perbaikan tinjauan 29 September 2026, blok v2): `saveModulForum` — versi lama maupun sekarang, yang sama persis — menulis tiga teks forum kosong dan `forumSelesai: false` bila `jawaban` tidak ada. v1 memakai mode poll-saja `saveModulForum` yang digerbang penanda `forumPoll` dari `getModulProgress`, tetapi keduanya layanan Cloud Run yang diperbarui satu per satu saat deploy (log nyata: selisih 2–11 detik; deploy parsial atau rollback bisa lebih lama). Di Chrome headless dengan Firebase tiruan, panggilan poll-saja ke `saveModulForum` lama mengosongkan teks forum yang sudah tersimpan (40 kata ×3 → 0) dan menutup lagi gerbang modul berikutnya. Backend yang belum mengenal `saveModulPoll` menjawab `NOT_FOUND` **tanpa menulis apa pun**, jadi urutan rilis dan rollback apa pun aman;
  - panggilan hanya dibuat bila respons `getModulProgress` **terakhir** memuat kunci `forumPoll` (`bisaPoll`, ditetapkan ulang setiap respons, termasuk sesudah **Periksa lagi**; kini sekadar menghemat panggilan). Pilihan lokal yang belum dikonfirmasi server diunggah sekali; tab yang sudah terbuka saat functions di-deploy baru mengunggah setelah dimuat ulang. Galat **apa pun** (termasuk `NOT_FOUND` saat `saveModulPoll` belum ter-deploy, PIN, penguncian) atau respons tanpa `forumPoll` menghentikan panggilan berikutnya di sesi itu; tanpa coba ulang otomatis, pilihannya tetap di localStorage dan diunggah pada muat berikutnya;
  - **memulihkan tampilan saat dimuat**, sesudah progres server diterapkan (event `progres-modul:diterapkan` dari PROGRES-MODUL, §6.7): sumbernya `forumPoll` server lebih dulu — server menang, localStorage diselaraskan, dan kuncinya dicatat di `diServer` — lalu localStorage (perangkat sama, backend lama, atau `getModulProgress` gagal). Kunci yang pernah dikonfirmasi server tetapi kini tidak ada di `forumPoll` dianggap **direset dosen**: dibuang dari localStorage, tidak dipulihkan, dan tidak diunggah ulang (dulu localStorage mengisi ulang pilihan yang dihapus dari server). Pemulihan memanggil `voteForum` halaman sendiri sehingga hasilnya persis seperti klik: `dataset.done`, opsi terkunci, warna hijau/pink pada opsi terpilih, umpan balik `fpNr`/`fpNw`, dan statistik "PG N/N". Selama pemulihan `checkForumReady` memakai fungsi asli halaman (ditangkap saat parsing), jadi pemulihan tidak pernah menjadwalkan penyimpanan teks forum. Opsi dicari lewat atribut `onclick`, bukan posisi; pilihan yang opsinya tidak ada dilewati;
  - **pilihan pertama final**: server tidak menimpa kunci poll yang sudah ada (sama seperti UI yang terkunci setelah sekali pilih); bila dua tab memilih berbeda, pilihan server yang tampil pada muat berikutnya. Untuk mengulang uji (akun simulasi), dosen menghapus field `forumPoll` di `progresModul/<modulId>/students/mhs_41399999901`; muat ulang di peramban yang sama tidak mengisinya kembali;
  - Mode Preview: poll tidak bereaksi dan tidak ada yang disimpan (tab Forum memang disembunyikan). Dosen dan tamu: perilaku lama, hanya DOM. Sejak `samakan-kunci-identitas.mjs` (#970) `getIdentityLocal` Optimalisasi Modul 12–14 membaca `LOCAL_IDENTITY` halamannya sendiri, jadi PROGRES-MODUL dan blok ini berjalan di sana seperti di modul lain (kunci localStorage poll memakai `MODUL_ID` dan NIM identitas halaman itu). Sebelumnya fungsi itu membaca kunci identitas modul sebelumnya (Modul-12 membaca `optoauto_identity_pertemuan-12`, milik Modul-11, dst.; insiden di §6.7).
  - Quick check **tidak dinilai** dan tidak termasuk syarat "forum selesai" (§6.7).
- Chat realtime memakai RTDB `chat/<course>/<module>/messages`.
- Pesan baru dibatasi Rules, termasuk panjang teks maksimum 500 karakter.
- Preview tidak menampilkan Forum.
- **Chat Kelas dan daftar online berjalan di `<script type="module">` (strict mode).** Keadaannya — `let onlineUsers = [];`, `let chatMessages = [];`, `let _lastSentAt = 0;` — wajib dideklarasikan di tingkat teratas skrip module yang sama, sebelum `initPresence`/`initChat`/`sendChat` (letaknya di samping `let currentSchedule = null;`); tanpa deklarasi, setiap snapshot presence/chat melempar ReferenceError. Handler inline komposer (`oninput="onChatInput()"`, `onkeydown="onChatKey(event)"`, `onclick="sendChat()"`) berjalan di cakupan global, jadi `window.sendChat`/`window.onChatInput`/`window.onChatKey` wajib diekspos di skrip module, **di luar** blok AI-CHAT-AGENT (blok AI hanya membungkus fungsi yang sudah ada). Init sequence memanggil `initChat();` untuk semua peran (tamu ikut membaca chat, begitu pula dosen yang baru login, karena jalur login dosen hanya memanggil `initPresence`). Presence identitas tersimpan dipasang **tepat sekali**: ke-83 modul memakai timer `initPresence()` 1,5 detik di init sequence bagi identitas mahasiswa/dosen, sedangkan Getaran Mekanik Modul-4 memasang presence + chat di auto-login `_handleScheduleReady`, jadi halaman itu tidak boleh punya timer tersebut — setiap panggilan `initPresence` menambah pendengar `visibilitychange` dan tulisan heartbeat RTDB. Getaran Mekanik Modul-4 kehilangan ketiga bagian ini (deklarasi, ekspor, init) lewat unggahan manual 28 April 2026 (daftar online dan chat mati sampai 29 September 2026); `scripts/deklarasi-chat-modul.mjs` memulihkannya dan `validate-public-security.mjs` menagihnya (§17.1).

### 6.6 Hasil dan presence modul

Tab Hasil membaca record visitor untuk statistik, aktivitas, dan skor. Presence realtime terpisah dari riwayat kunjungan. Jangan menyimpulkan “online” hanya dari `lastVisit`. Presence modul ditulis ke `presence/<course>/<module>` dan dibaca listener `initPresence` ke `onlineUsers` (deklarasi skrip module, §6.5); ujian menyimpannya di `onlinePresence` (§7.8) dengan aturan deklarasi yang sama. Akun simulasi (§4.5) disaring dari papan peringkat, tabel roster, penyebut hadir/total, pembagian kelompok di Modul 1 (sejak 14 September 2026; `renderGroups()` di skrip klasik memakai `window.isSimulasiNim` yang diekspos dari skrip module), dan roster halaman OBE oleh `scripts/kecualikan-akun-simulasi.mjs`; bila menulis fungsi render baru di tab Hasil, saring lagi dengan `isSimulasiNim(nim)`.

### 6.7 Progres materi berurutan dan gerbang antar-modul

Berlaku di keempat course lama sejak 22 Agustus 2026 (permintaan dosen), dan di Teknik Tenaga Listrik serta Pemodelan CAD sejak Modul 1 masing-masing terbit — kini di ke-84 modul. Diterapkan oleh `scripts/tambah-progres-modul.mjs` (idempoten, penanda `PROGRES-MODUL`) dan empat callable di §10.

- Di akhir setiap bagian materi (`div.section`, kecuali "Daftar Pustaka" dan bagian orientasi "Posisi Anda dan Sisa Waktu" di Sisken) ada kotak centang pernyataan *"Saya sudah mempelajari dan memahami bagian ini — [judul bagian]"* (teks 17 px, panel gradien hijau–sian dengan lencana status). Hanya kotak giliran yang aktif — **untuk semua peran**: centang harus urut dari bagian pertama, satu per satu, dan bagi mahasiswa tidak dapat dibatalkan. Injector membuang kotak lama lalu menyisipkan ulang, jadi perubahan pengecualian/teks cukup dengan menjalankannya kembali. Server (`setModulCentang`) menolak indeks yang tidak urut lewat transaksi Firestore.
- Tab **Tugas, Forum, dan Hasil terkunci** sampai semua kotak dicentang; `switchTab` dibungkus sehingga tab terkunci tidak bisa dibuka lewat jalur lain.
- **Modul dianggap lengkap** bila centang penuh **dan** semua soal tugas sudah dicoba **dan** forum selesai (tiga jawaban masing-masing ≥ 30 kata; `FORUM_MIN_WORDS` di halaman harus sama dengan `FORUM_MIN_KATA` di backend). Quick check Forum tidak dinilai dan tidak ikut syarat ini; penyimpanan teks forum ke server juga tidak pernah digerbang poll.
- **Tombol 📋 Copy Forum dan quick check** (keputusan dosen, 29 September 2026): quick check yang belum dipilih tetap menahan tombol pada **pengiriman pertama** forum (pedagogi). Teks forum tersimpan otomatis ke server 1,5 detik sesudah lengkap, jadi `forumSelesai` saja tidak membedakan "sudah dikirim" dari "baru saja diketik"; v1 melepas gerbang begitu halaman dimuat ulang sesudah simpan otomatis itu (temuan tinjauan). Sejak v2 poll kosong tidak mematikan tombol hanya bila (a) `getModulProgress` melaporkan `forumSelesai`, (b) ketiga jawaban masih ≥ `FORUM_MIN_WORDS`, dan (c) peramban ini **belum pernah** melihat forum modul itu belum selesai — penanda `forumBelumSelesai` di localStorage poll, ditulis setiap kali respons melaporkan `forumSelesai: false`. Yang dibebaskan: forum yang sudah lengkap sebelum blok ini ada (pilihan lamanya memang hilang — keluhan mahasiswa CAD Modul 2) dan forum yang dilengkapi di perangkat lain; `#forum-blocked-msg` lalu hanya menampilkan catatan lembut "ℹ N quick check belum dipilih (tidak dinilai) — forum Anda sudah tersimpan di server, tombol tetap aktif." Forum yang dilengkapi di peramban ini tetap menunggu poll walau halaman dimuat ulang. Batasannya: penanda itu per peramban, jadi di perangkat kedua yang belum pernah melihat forum belum selesai gerbangnya lepas (quick check tidak dinilai; menutupnya butuh penanda di server). Aturan kata tetap berlaku (jawaban < 30 kata tetap mematikan tombol). `copyForumHtml` memang hanya memeriksa jumlah kata dan `buildForumHtml` tidak memuat poll. Diterapkan pembungkus `checkForumReady` terluar di blok `PILIHAN-POLL-FORUM` (§6.5).
- **Kait untuk blok lain** (v2, 29 September 2026): sesudah progres server diterapkan (`terapkanProgres`, termasuk sesudah **Periksa lagi**) runtime mengirim event window `progres-modul:diterapkan` dengan `detail {ok:true, progres}`; bila `getModulProgress` gagal, `{ok:false}`. Tidak dikirim untuk dosen, Mode Preview, tamu, atau sesi tanpa hash PIN, dan tidak saat akses ditolak (overlay prasyarat). Bersama penjaga forum di bawah: `{ok:true}` adalah pernyataan terakhir `terapkanProgres` — sesudah `forumSiap(p)` (tab Forum terbuka, pembanding kiriman = forum server), textarea terisi, dan `checkForumReady` — jadi pilihan quick check dipulihkan tepat saat tab Forum terbuka; `{ok:false}` dikirim langsung sesudah `forumGagal(e, d)` pada setiap kegagalan, termasuk tiap coba ulang otomatis 3/10/30 detik yang gagal lagi, dan coba ulang yang berhasil mengirim `{ok:true}`. Pemakainya blok `PILIHAN-POLL-FORUM` (pemulihan dari localStorage saat gagal tidak mengirim apa pun ke server; tab Forum tetap terkunci sampai progres diterapkan) dan blok `DRAFT-MODUL:PENJAGA` (sejak v2, kini v5; §6.3), yang memakai `{ok:true}` sebagai tanda bahwa server sudah menerima NIM + hash PIN sesi itu (`getModulProgress` memeriksa PIN) dan mengambil forum server dari `detail.progres.forum`; `{ok:false}` tidak dihitung.
- **Gerbang login**: saat masuk modul *n* > 1, server memeriksa modul *n*−1 (`_cekAkses`). Halaman tidak memanggil `checkModulAccess` sendiri: jawaban akses ikut dalam respons `getModulProgress` (`akses.boleh`, `akses.prasyarat`) yang dipanggil blok `PROGRES-MODUL` di ketiga jalur login. Bila belum lengkap, halaman ditutup overlay kunci yang merinci apa yang kurang dan menautkan ke modul sebelumnya. Tombol **🔄 Periksa lagi** di overlay itu (sejak 24 September 2026) memanggil ulang `getModulProgress` dengan sesi yang sama, tanpa muat ulang dan tanpa login ulang: bila modul sebelumnya ternyata sudah lengkap (misalnya baru dilengkapi di tab lain), overlay ditutup dan progres modul ini langsung diterapkan; bila belum, rinciannya digambar ulang dengan data terbaru. Tombol ini dibuat karena mahasiswa yang membuka modul *n* sebelum menuntaskan modul *n*−1 tetap melihat overlay lama walau syaratnya sudah terpenuhi di tab lain. Modul 1 selalu terbuka. UTS/UAS tidak digerbang.
- **Transisi (keputusan dosen, opsi 1a)**: modul yang tugasnya sudah selesai dengan semua attempt bertanggal sebelum `PROGRES_MULAI` (22 Agu 2026 12:00 UTC) dianggap lengkap meski tanpa centang/forum, supaya mahasiswa yang sudah berjalan tidak terkunci di modul 1.
- Setelah tenggat, modul tetap bisa dikerjakan dengan status terlambat (modul tidak punya batas atas), jadi gerbang ini tidak pernah mengunci permanen.
- **Forum baru dikirim sesudah progres server diterapkan** (sejak 29 September 2026; sub-blok `PROGRES-MODUL:PENJAGA-FORUM`). `saveModulForum` menimpa ketiga jawaban sekaligus, jadi `simpanForum` tidak pernah mengirim selama `getModulProgress` modul ini belum dijawab dan diterapkan, saat akses ditolak (overlay prasyarat; baru sesudah **Periksa lagi** sukses), maupun saat progres gagal. Gagal berarti berhenti menunggu tanpa mengirim: galat sementara (`unavailable`, `internal`, `deadline-exceeded`, jaringan) dicoba ulang otomatis 3, 10, lalu 30 detik kemudian; `resource-exhausted` (penguncian PIN) dan `unauthenticated` (sesi PIN tidak berlaku) tidak dicoba ulang otomatis. Hash PIN sesi tidak disentuh penjaga ini: permintaan PIN ulang dan pembersihan `sessionStorage` milik JAWABAN-PRIVAT (`_gagalJawabanSaya`), dan PIN yang dimasukkan lagi memuat ulang progres. Selama progres modul ini belum diterapkan, tab **Forum** mahasiswa terkunci terlepas dari hitungan centang: juga pada jeda sesudah overlay login tertutup dan sebelum `muatProgres` pertama, saat semua bagian sudah dicentang tetapi progresnya gagal dimuat, dan saat localStorage peramban menyimpan hitungan centang mode bebas dosen/Preview (hitungan itu dibuang begitu halaman beralih ke mahasiswa). Halaman Forum yang terlanjur terbuka ditutup ke tab Modul. Dari status gagal, menekan tab yang terkunci atau centang yang dijawab server memuat ulang progres (paling cepat 15 detik sekali; penguncian PIN sesudah masa kuncinya habis; sesi PIN tidak berlaku sesudah PIN dimasukkan lagi). PIN sesi baru untuk NIM yang sama (misalnya sesudah PIN diminta ulang) tidak mengunci Forum lagi, dan suntingan yang belum terkirim dikirim sesudah progres diterapkan. Kiriman forum yang gagal diberitahukan lewat toast, dan galat sementaranya dicoba ulang 3, 10, lalu 30 detik kemudian dengan isi textarea terbaru. Ketiga jawaban kosong tidak pernah dikirim (mengosongkan ketiga jawaban **tidak** menghapus forum di server; `forumSelesai` tetap), dan pembanding kiriman terakhir diambil dari forum server, sehingga teks yang sama tidak dikirim ulang setiap kali halaman dimuat. Sejak #869 (22 Agustus 2026) sampai perbaikan ini, `simpanForum` mengirim fq1–fq3 kosong bila `getModulProgress` lebih lambat dari ±2 detik (cold start function 2–5 detik), gagal, atau modul terkunci overlay: forum di server tertimpa kosong dengan `forumSelesai=false`, dan bila tab ditutup sebelum progres yang terlambat itu tiba (atau progresnya gagal) kekosongan itu menetap, sehingga modul berikutnya ikut terkunci ("Forum Modul N" ❌). Nilai resmi tidak terdampak, hanya forum dan gerbang; korban memulihkannya dengan menempel ulang jawaban (misalnya dari posting forum LMS) di tab Forum modul itu, menunggu notifikasi tersimpan di server, lalu menekan **Periksa lagi** di modul berikutnya.
- **Event forum tersimpan** (`PENJAGA-FORUM` v2, 29 September 2026): sesudah setiap `saveModulForum` sukses runtime mengirim event window `progres-modul:forum-tersimpan` dengan `detail {jawaban}` (ketiga teks yang terkirim), dari `forumTersimpan(j)` di dalam sub-blok. Pemakainya blok `DRAFT-MODUL:PENJAGA` (§6.3), yang (sejak v3) mencatat teks itu sebagai teks server yang diketahui tab — basis suntingan berikutnya, sehingga teks yang terkirim keluar dari draft — dan melepas tanda "disunting di tab ini" untuk jawaban yang teksnya sama dengan yang terkirim. Kiriman yang gagal tidak mengirim event, dan aturan kapan forum boleh dikirim tidak berubah.
- **Dosen dan Mode Preview** tidak digerbang: tab tetap terbuka, kotak dicentang berurutan secara lokal (diingat di localStorage per modul, boleh membatalkan yang terakhir) dan tidak disimpan ke server. **Akun simulasi** diperlakukan persis mahasiswa (lihat §4.5), kecuali boleh membatalkan centang terakhir dan selalu lolos gerbang antar-modul.
- Blok lama "Daftar Periksa Sebelum Lanjut" (centang lokal Sisken, `siskenCentang`) sudah dihapus; kartu "Salah Kaprah" di bagian yang sama dipertahankan.
- **Identitas dibaca dari skrip klasik — kuncinya wajib sama dengan `LOCAL_IDENTITY` (sejak 29 September 2026).** Blok `PROGRES-MODUL` mengenali mahasiswa lewat `getIdentityLocal()` (skrip klasik), bukan `getIdentity()` skrip module; Export Tugas dan HTML forum juga. `LOCAL_IDENTITY` dan `MODULE_ID` adalah `const` di `<script type="module">`, sehingga **tidak terlihat** dari skrip klasik: di sana `typeof LOCAL_IDENTITY` selalu `'undefined'` (komentar lama "scope window sudah resolved" di `_draftKey` keliru). Karena itu semua kunci yang dibaca skrip klasik ditulis sebagai literal dan harus sama dengan `LOCAL_IDENTITY` halaman itu, `<slug>_identity_<MODULE_ID>`:
  - `getIdentityLocal()`;
  - (dulu juga `_draftKey()`, kunci draf `<slug>_draft_<MODULE_ID>_<nim>` dengan cadangan `typeof … ? … : '<literal>'` yang selalu jatuh ke literalnya; sejak `draft-modul.mjs` kuncinya `draft_modul_<MODUL_ID>_<nim>` dari `window.MODUL_ID` + `getIdentityLocal()`, tanpa literal, §6.3);
  - `const LK` lapisan friksi (§8).

  `MODULE_ID` mengikuti §3: `pertemuan-N` untuk Modul 1–7 dan `pertemuan-(N+1)` untuk Modul 8–14 (pertemuan 8 = UTS; juga Sisken, yang hanya *tampilannya* memakai N); Matematika 4 memakai `modul-N`. Setiap kali `MODULE_ID` diubah, literal-literal itu ikut diubah: jalankan `scripts/samakan-kunci-identitas.mjs` (`--periksa` dulu; penanda `KUNCI-IDENTITAS:LOKAL`/`LK` v1 — blok `DRAF` dari #970 diganti `DRAFT-MODUL:KUNCI`, §6.3 —, hanya halaman yang salah yang disentuh) — `validate-public-security.mjs` menolak ketidaksamaan di ke-84 modul (§17.1).
- **Insiden Optimalisasi Modul 12–14 (30 Mei–29 September 2026).** #285 (30 Mei 2026) menggeser `MODULE_ID` Modul 12/13/14 dari `pertemuan-12/13/14` ke `pertemuan-13/14/15` hanya di skrip module; keempat literal klasik tetap `pertemuan-12/13/14`, yaitu kunci identitas modul **sebelumnya**. Akibatnya, bagi mahasiswa yang tidak login di modul sebelumnya pada peramban yang sama:
  - sejak 22 Agustus 2026 `getIdentityLocal()` = `null`, jadi `getModulProgress`/`setModulCentang`/`saveModulForum` tidak pernah dipanggil, tab Tugas/Forum/Hasil tidak terkunci, centang hanya tersimpan lokal (`pm_centang_bebas_…`), dan forum tidak tersimpan di server;
  - gerbang Modul 13/14 membaca progres Modul 12/13 yang kosong, sehingga mahasiswa yang mengerjakan Modul 12/13 dengan cara di atas lalu membuka Modul 13/14 di peramban yang masih menyimpan login Modul 12/13 tertolak (kecuali lolos transisi opsi 1a);
  - Export Tugas dan HTML forum bernama "Mahasiswa"/NIM "-" — sejak kode verifikasi (16 Juli 2026) export gagal "PIN belum di-setup" — atau memuat identitas basi mahasiswa lain di komputer bersama (export gagal "PIN salah", dan panggilannya ikut dihitung penguncian PIN NIM itu); lapisan friksi tidak aktif; kunci draf Modul 12 sama dengan kunci draf Modul 11.

  Nilai resmi tidak terdampak: ledger `modulAttempts` dan record visitor memakai `getIdentity()` skrip module dengan kunci yang benar. Matematika 4 punya cacat sejenis sejak #257 (21 Mei 2026): `LK` ditulis `'${COURSE_ID}_identity_modul-N'` dalam kutip tunggal (tidak diinterpolasi), sehingga lapisan friksinya tidak pernah aktif, dan cadangan `MODULE_ID` `_draftKey` Modul 1/2/3/5 sama-sama `pertemuan-5` (satu kunci draf untuk empat modul). Keduanya diperbaiki skrip yang sama. Akun simulasi selalu lolos gerbang, jadi uji ulang gerbang memakai NIM fiktif di harness, bukan akun itu. Sesudah perbaikan ini Modul 12–14 Optimalisasi ikut menjalankan penyimpanan forum blok `PROGRES-MODUL` — termasuk cacat lama blok itu yang sudah berlaku di 81 modul lain: bila `getModulProgress` gagal, lambat, atau gerbang menolak (overlay kunci), `saveModulForum` terkirim ±1,5 detik setelah `_markLoaded` dengan ketiga jawaban **kosong** (textarea belum diisi dari server) dan menimpa forum server beserta `forumSelesai`, sehingga gerbang modul berikutnya ikut menolak (diuji di harness Firebase tiruan). Cacat itu diperbaiki terpisah di `tambah-progres-modul.mjs`; perbaikan tersebut sebaiknya sudah masuk sebelum kelas Optimalisasi dibuka lagi.
- **Data lama tidak dimigrasi.** Identitas di kunci lama adalah identitas sah modul lain (di komputer lab bisa milik NIM lain), jadi tidak dipindah atau dihapus; mahasiswa cukup login di modul itu. Centang mode bebas memakai `MODUL_ID` yang memang benar. Centang dan forum yang dulu hanya tersimpan lokal harus diulang mahasiswa (centang adalah pernyataan mahasiswa; tidak diputar ulang otomatis). Draf tidak dipindah (draft materi, §6.3). Data server yang perlu ditinjau dosen (baca saja, tanpa alat Admin untuk `progresModul`):
  - attempt `modulAttempts/optoauto-modul-12` dan `-13` bertanggal ≥ `PROGRES_MULAI` dari NIM yang dokumen `progresModul/optoauto-modul-12`/`-13`-nya kosong atau belum lengkap — mereka tertolak di Modul 13/14 sampai melengkapinya;
  - dokumen `progresModul/optoauto-modul-12/13/14` yang forumnya sama persis dengan forum modul sebelumnya (jejak tabrakan kunci);
  - forum `progresModul/math4-modul-1/2/3/5` yang identik antarmodul;
  - unggahan Export Tugas/forum Modul 12–14 Optimalisasi di LMS (Genap 2025/2026, 25 Juni–Juli 2026) yang bernama "Mahasiswa"/NIM "-" atau memuat nama/NIM selain akun pengunggah.
- **Catatan draf — diperbaiki 29 September 2026 (§6.3).** Sebelumnya `_draftKey` di 43 halaman (Getaran Modul 1, Sisken, TTL, CAD) memakai `LOCAL_IDENTITY`/`MODULE_ID` langsung dari skrip klasik (`ReferenceError` yang ditelan `catch`, draf tidak pernah tersimpan), dan di 83 dari 84 halaman `_markLoaded` menjalankan `_saveDraft` (lewat `checkExportReady`/`checkForumReady`) **sebelum** `_loadDraft`, sehingga draf di kunci mana pun tertimpa sebelum sempat dibaca. `scripts/draft-modul.mjs` memperbaiki urutan itu sekaligus dengan awalan kunci baru `draft_modul_<MODUL_ID>_<nim>` di ke-84 modul, jadi draf warisan — termasuk kunci Optimalisasi Modul 12/13 yang sama dengan kunci tempat halaman lama Modul 13/14 menulis draf atas NIM dari kunci identitas modul sebelumnya — tidak pernah termuat. Blok `KUNCI-IDENTITAS:DRAF` (#970) diganti blok `DRAFT-MODUL:KUNCI`; `samakan-kunci-identitas.mjs` tidak menyentuh `_draftKey` lagi.

### 6.8 Sistem Agen AI berbasis sumber

Mode **Asisten Dosen** menempel pada tombol dan panel chat yang sudah ada
(`#visitorFab` + `#visitorPanel`, tetap satu tombol dan satu panel) pada 84
halaman modul dan 12 halaman UTS/UAS (enam mata kuliah). Di halaman modul ia
menjadi tab kedua panel Chat Kelas ("👥 Kelas" ↔ "🤖 Asisten Dosen"). Halaman
UTS/UAS **tidak punya Chat Kelas**: panelnya hanya daftar mahasiswa online
(presence, §7.8), sehingga Asisten membawa komposernya sendiri (`#vpAiComposer`).
Perilakunya di ujian bergantung peran:

- **Dosen**: tab "👥 Online" (default) dan "🤖 Asisten Dosen", seperti sebelumnya
  — termasuk riwayat dan sapaan Asisten saat dosen login dari layar tamu
  (tidak ditukar ke riwayat dosen).
- **Mahasiswa yang login** (sejak 26 September 2026): `#visitorFab` tampil
  sebagai tombol "🤖 Asisten Dosen" dan panel langsung terbuka di mode Asisten
  dengan catatan cakupan ujian. Tab Online, daftar nama/NIM, badge, dan jumlah
  online tidak pernah terlihat — roster tetap khusus dosen (§7.8). Catatannya
  juga menyatakan bahwa tawaran penjelasan materi pada sapaan dan contoh
  pertanyaan hanya berlaku di luar jendela ujian. Panel yang tertutup keluar
  dari urutan Tab; di layar pendek (laptop dengan skala 125 %, ponsel mendatar)
  daftar pesan menyusut supaya kolom tanya tetap terlihat; pertanyaan yang
  diketik sebelum balasan sebelumnya tiba tetap tersimpan di kolom tanya.
- **Riwayat Asisten mahasiswa di UTS/UAS dibuang saat logout.** Komputer lab
  dipakai bergantian, jadi kunci `modulAiChat:v2:<examId>:<NIM>` dihapus dari
  perangkat ketika halaman ujian dibuka tanpa login mahasiswa (logout memuat
  ulang halaman) dan ketika identitas mahasiswa hilang tanpa muat ulang (logout
  paksa karena jadwal dihapus). Muat ulang biasa selama masih login tetap
  memulihkan riwayat; halaman modul tidak berubah.
- **Tamu** (belum login): tidak ada tombol.

Sisi halaman dipasang `scripts/buka-asisten-ujian.mjs` (penanda
`ASISTEN-UJIAN-MAHASISWA`); sisi blok AI (mode mahasiswa, catatan cakupan,
`ModulAiAgent.terapkanPeran()`) ada di `modul-ai-chat.js` backend. Jangan
menambahkan `.vp-chat`, `#vpChatList`, atau `sendChat` ke halaman ujian: blok AI
akan beralih ke varian modul yang punya chat kelas, dan RTDB `chat/*` menerima
tulisan tanpa autentikasi, jadi hanya ketiadaan UI itulah yang mencegah chat
antarmahasiswa selama ujian. Teknik Tenaga Listrik masuk registry
lewat backend PR #74 dan Pemodelan CAD lewat backend PR #75. ID ujian keduanya
bertanda hubung (`teknik-tenaga-listrik-uts`/`-uas`, `pemodelan-cad-uts`/`-uas`),
tidak seperti ID modulnya yang bergaris bawah (`pemodelan_cad-modul-1`). Ini bukan model yang dilatih ulang dengan seluruh data
kampus. Sistem memakai retrieval-augmented generation (RAG) dari sumber privat
yang diizinkan, dengan tiga lapis:

| Lapis | Implementasi | Peran dan perilaku gagal |
|---|---|---|
| Administratif | `chat/resolver.js` | menjawab jadwal, RPS, penilaian, dan aturan dari registry serta RTDB secara deterministik |
| Retrieval | `chat/retriever.js` + `knowledge-base.json` | mengambil materi/kurikulum mata kuliah aktif dan menghasilkan jawaban ekstraktif bersitasi |
| Model | `chat/provider.js` | opsional; hanya merangkai potongan retrieval, bukan menjadi sumber fakta |

Pemilihan lapis ditentukan `classifyQuestion` (`chat/policy.js`). Kata tanya
alasan "kenapa/mengapa" menandai pertanyaan materi ("Kenapa redaman mengurangi
amplitudo?" tetap ke tutor), **kecuali** bila objeknya urusan administratif
(cabang backend `fix/chat-kenapa-admin-dan-rescale-due`, 26 September 2026,
keenam mata kuliah; berlaku sejak cabang itu di-deploy — sebelumnya
kenapa/mengapa selalu diarahkan ke tutor). Objek itu meliputi export, tautan
Drive, poin/nilai, pengali terlambat 0,65, status terlambat,
jadwal/tenggat, gerbang modul dan tab terkunci, kotak centang, login/PIN,
berkas/unggahan, kirim ulang, dan presensi. Pertanyaan seperti "Kenapa tombol
export saya tidak aktif?" atau "Kenapa poin tugas saya cuma 65%?" dijawab lapis
administratif, misalnya syarat export, pengali 0,65 atau batas kirim ulang CAD
65%, dan modul *n*−1 yang belum lengkap. Dulu pertanyaan seperti itu jatuh ke
retrieval materi. Pola objek (`ALASAN_ADMIN_PATTERNS`) hanya diperiksa bila
kalimatnya memuat kenapa/mengapa, jadi pertanyaan tanpa kata tanya alasan tidak
berubah klasifikasinya. Sebagian besar pola memasangkan objek dengan keadaannya
dan punya pengecualian kosakata materi (misalnya "link" mekanisme, "pin"
rakitan, "jadwal perawatan"). Kata "poin" hanya dicocokkan sebagai kata
Indonesia, sehingga "Mengapa respons melewati set point sebelum tunak?",
"fixed point", "operating point", dan "poin kritis" tetap ke tutor (dulu
`\bpoin\w*` ikut menangkap "point"). Objek yang tidak dipakai materi berdiri
tanpa pengecualian (misalnya `forum`, `submit`, `login`, "kode verifikasi").
Pertanyaan yang administratif hanya karena pola alasan tetapi tidak cocok
dengan jawaban lapis 1 mana pun kembali ke tutor (`viaAlasan`). Penanda materi
lain ("Jelaskan …", "rumus") tetap didahulukan dan mengarahkan ke tutor, dan
permintaan jawaban asesmen tetap ditolak.

Callable `getModuleChatContext` menyiapkan konteks awal tanpa model, sedangkan
`aiChat` mengorkestrasi ketiga lapis. Browser hanya mengirim `moduleId`, pesan,
dan riwayat terbatas. Backend memverifikasi `moduleId` terhadap allowlist 96
halaman (84 modul + 12 ujian), menyusun ulang metadata dari registry, dan membaca jadwal aktual dari
RTDB; metadata buatan browser diabaikan. NIM, nama akun, dan hash PIN hanya
dipakai untuk autentikasi/kuota dan tidak dikirim ke penyedia model. Sebelum
request keluar, `chat/privacy.js` menyunting NIM, email, nomor telepon, dan token
panjang, lalu assertion membatalkan panggilan bila identitas akun masih terdeteksi.

Indeks privat dibangun hanya dari area materi `#page-modul` sebelum
`#page-tugas`, JSON asesmen kurikulum, dan mapping default Modul–Sub-CPMK pada
halaman OBE. Area Tugas/Forum/Hasil, halaman ujian, bank soal, pembahasan, kunci
jawaban, roster, dan data pribadi tidak boleh masuk generator atau indeks.
`knowledge-base.json` tetap berada di repo backend privat dan tidak boleh
disalin ke frontend. Per 24 September 2026 (backend PR #79) indeksnya berisi
2.596 potongan untuk enam mata kuliah, termasuk Teknik Tenaga Listrik 414 dan
Pemodelan CAD 372.

Jawaban materi wajib memakai sitasi yang ada pada hasil retrieval serta tetap
terisolasi pada mata kuliah aktif. Jawaban tanpa sitasi valid, sitasi rekaan,
sumber lintas mata kuliah, atau klaim kunci/hasil akhir asesmen diganti dengan
fallback retrieval yang aman. Pertanyaan konsep, rumus, contoh umum, dan kode
pembelajaran boleh dilayani; permintaan jawaban soal tertentu atau kode
siap-submit ditolak sebelum retrieval/model. Untuk mahasiswa, tutor materi
terkunci di **semua** halaman (keenam mata kuliah) selama jendela UTS/UAS mata
kuliah **mana pun** aktif: jadwal global salah satu dari 12 ujian (start ≤
sekarang ≤ end + extension) atau jendela susulan per NIM mahasiswa itu
(`scheduleOverrides`). Aturan lintas mata kuliah ini diputuskan dosen pada
27 September 2026 (backend PR #84); sebelumnya kunci hanya membaca ujian milik
course halaman yang dibuka. Server tidak punya data keterdaftaran, jadi jendela
global mengunci tutor semua mahasiswa, termasuk yang tidak mengambil mata
kuliah tersebut. Pesan penolakan menyebut ujian yang aktif (mis. "UTS Getaran
Mekanik"); bantuan administratif tetap tersedia, dan pertanyaan administratif
yang tidak terjawab lapis 1 mendapat tautan resmi tanpa memanggil model. Jadwal
course halaman dibaca segar setiap pertanyaan; jadwal dan override course lain
di-cache per instans ±30 detik, sehingga perubahan yang baru ditulis bisa
terlambat berlaku sampai sekian di halaman course lain. Dosen tidak terkunci.
Penguncian ini ditegakkan backend (`aiChat`) untuk halaman mana pun yang memanggil, termasuk halaman ujian;
membuka Asisten bagi mahasiswa di UTS/UAS tidak menambah callable maupun
pengecualian. Sapaan dan enam chip saran tetap identik dengan `greeting.js`
backend; catatan cakupan ujian hanya teks frontend.

Lapis model dapat dimatikan dengan `AI_PROVIDER=none`; resolver dan retrieval
tetap berfungsi. Kuota internal model adalah 8 pertanyaan per mahasiswa per jam.
Respons penyedia `429`/`402` menjeda lapis model melalui
`aiChat/freeTier/state` selama 5, lalu 15, lalu 60 menit jika berulang; satu
respons sukses menolkan tangga dan strike kedaluwarsa setelah dua jam. Pilihan
provider/endpoint/model yang non-rahasia berada di `functions/.env`, sedangkan
`AI_API_KEY` wajib berada di Firebase Secret Manager.

Setelah materi, asesmen kurikulum, atau mapping OBE berubah, bangun dan validasi
ulang indeks dari root backend, lalu jalankan pemeriksaan backend:

```powershell
node scripts/build-ai-knowledge.js ..\Mechanical-Engineering-Courses
node scripts/validate-ai-knowledge.js
Set-Location functions
npm.cmd run lint
npm.cmd test
```

Sumber integrasi UI berada di `frontend-integration/` pada repo backend. Hanya
jika blok UI/agent berubah, terapkan dan periksa generator ke seluruh 96 halaman;
jangan mengedit salinan inline satu per satu:

```powershell
node frontend-integration/apply-ai-chat.js ..\Mechanical-Engineering-Courses
node frontend-integration/apply-ai-chat.js ..\Mechanical-Engineering-Courses --check
```

Kode halaman ujian di luar penanda `AI-CHAT-AGENT` (tombol `#visitorFab` untuk
mahasiswa, `_applyRoleVisibility`, cabang mahasiswa `renderVisitors`, CSS
penyembunyi roster) milik frontend dan hanya diubah lewat
`node scripts/buka-asisten-ujian.mjs` (cek dulu dengan `--periksa`). UTS/UAS
Pemodelan CAD ikut dari kerangka Teknik Tenaga Listrik saat
`scripts/cad-exam/bangun.py` dijalankan.

**Urutan merge frontend–backend.** Kode halaman di atas menyembunyikan tab
Online bagi mahasiswa dan mengandalkan mode mahasiswa di blok AI untuk membuka
Asisten. Blok AI dari checkout backend yang lebih tua membuat panel mahasiswa
buntu (hanya judul, tanpa Asisten) walau validator lain hijau, sehingga
`validate-public-security.mjs` menolak halaman ujian yang bloknya belum memuat
mode itu (`terapkanPeran`, `EXAM_STUDENT_CLASS`, gaya ujian, pembersih riwayat).
Gabungkan perubahan `modul-ai-chat.js` ke `main` backend sebelum atau bersama PR
frontend yang membawa hasil `apply-ai-chat.js`, dan jangan menerapkan dari
checkout backend yang lebih tua.

---

## 7. Struktur dan penilaian exam

UTS dan UAS mempunyai dua tab utama: **Soal Ujian** dan **Hasil**.

Struktur semua exam:

| Bagian | Jumlah | Bobot tipe internal |
|---|---:|---:|
| True/False | 10 | 1 |
| Pilihan ganda | 20 | 1 |
| Komputasi Easy/Medium | 10 | 2 |
| Komputasi Hard | 5 | 4 |
| **Total** | **45** |  |

Pengecualian: UTS/UAS Pemodelan CAD memakai bentuk sendiri tanpa True/False dan tanpa Pyodide — UTS 30 soal (`mc1`–`mc20` + `c1`–`c10` tugas unggah model `.FCStd` + angka bacaan), UAS 31 soal (tambahan `c11` tugas rakitan). Bobot tipenya PG 1, tugas unggah 2, rakitan 6 (`_qTypeWeightByIdx`); lihat §2 dan §7.5.

Bobot tipe 1:1:2:4 digunakan untuk membagi bobot di dalam Sub-CPMK. Nilai tiap soal bukan angka tetap 1/1/2/4. Backend menghitungnya dari:

1. bobot Sub-CPMK exam;
2. daftar soal yang dipetakan ke Sub-CPMK;
3. bobot tipe soal di dalam kelompok tersebut.

Jumlah nilai exam adalah 100. Soal yang sengaja tidak dipetakan dapat bernilai nol walaupun tetap bisa dijawab.

**Dua sumber angka yang mudah tertukar.** Definisi bank soal (`functions/exams/*-v2.js`) memberi tiap soal field `points` mengikuti bobot tipe 1/1/2/4, sehingga Σ`points` sebuah exam 45 soal = **70** (Pemodelan CAD memakai bobot tipe 1/2/6, jadi Σ-nya lain). Angka 70 itu **bukan** nilai yang diberikan ke mahasiswa: `checkExamAnswer` menimpanya dengan `_examQPoints(examId, qId)` yang dihitung dari bobot Sub-CPMK OBE sehingga **Σ = 100**. Jadi:

- Σ`points` bank = 70 → dipakai untuk seed/SUMMARY, pemeriksa struktur, dan pembagian bobot di dalam Sub-CPMK;
- Σ`_examQPoints` = 100 → yang benar-benar masuk ledger dan nilai mahasiswa;
- `cfg.totalPoints` exam = 100, dan `nilai = round(points / 100 × 100)`.

Di dalam satu Sub-CPMK, porsinya masih dibagi lagi menurut bobot tipe soal (1/1/2/4) lewat `_qTypeWeightByIdx`, sehingga soal dengan tipe berbeda pada Sub-CPMK yang sama **tidak** bernilai sama. Contoh nyata `sisken-uts` (bobot Sub-CPMK 4/10/4/4, Σ=22):

| Sub-CPMK | Isi | Subtotal | Poin per soal |
|---|---|---:|---|
| 1.1 | 8 TF | 18,18 | 2,273 |
| 1.2 | 2 TF + 19 MC | 45,45 | 2,165 |
| 2.1 | 1 MC + 7 komputasi (bobot 2) | 18,18 | MC 1,212 · komputasi 2,424 |
| 2.2 | 3 komputasi (2) + 5 Hard (4) | 18,18 | komputasi 1,399 · Hard 2,797 |
| | | **100,00** | |

**Tabel poin di halaman hanya untuk tampilan, dan wajib dibangkitkan.** Tiap `UTS.html`/`UAS.html` memuat `EXAM_QID_POINTS`, dipakai menghitung penyebut tiap bagian (`SECTION_TOTALS` → "Bagian A — True/False (x/y poin)") dan skor berjalan selama ujian. Angka poin per soal yang tampil di lembar jawaban berasal dari `scoreDelta` server, bukan dari tabel ini, dan nilai resmi tidak pernah menyentuhnya.

Tabel itu **tidak boleh disunting tangan**. Jalankan `node scripts/bangkitkan-poin-soal-exam.js` di repo backend; ia memuat `_examQPoints` dan `OBE_ORDER` langsung dari `functions/index.js` sehingga halaman dan penilai mustahil menyimpang. Mode `--periksa` membandingkan tanpa menulis dan keluar dengan kode bukan nol bila ada yang menyimpang.

> Penyuntingan manual pernah membuat halaman UTS dan UAS Sistem Kendali Cerdas memakai tabel milik Getaran — seluruh 45 soal berbeda dari poin yang diberikan server. Karena kedua tabel sama-sama berjumlah 100, nilai sempurna tetap cocok dan selisihnya baru tampak pada penyebut per bagian: peserta bernilai 100 tertulis memperoleh 22,51 dari 20,80 poin di Bagian A. Ketiga UTS lama (Getaran, Math4, Opto) juga tertinggal karena tabelnya masuk 9 Juni 2026 sedangkan pembobotan OBE baru berlaku akhir Juli. Seluruhnya sudah disamakan 21 Agustus 2026 tanpa menilai ulang hasil tersimpan; konsekuensinya poin per soal yang kini tampil pada hasil ujian Mei tidak menjumlah tepat ke total tersimpan peserta.

**Warna panel jawaban dihitung dari rasio, bukan ambang mutlak.** Lembar jawaban menandai tiap soal benar penuh (hijau), sebagian (oranye), atau salah (merah) dengan membandingkan poin yang diperoleh terhadap poin maksimum soal ITU SENDIRI, yang diambil dari `EXAM_QID_POINTS`. Ambang tetap seperti "poin > 1 berarti benar" adalah peninggalan skema lama saat poin per soal masih 1/2/4; sejak poin mengikuti bobot Sub-CPMK, ambang itu salah menggolongkan di kedua arah — soal bernilai 1,212 yang dijawab benar tampak sebagian, sedangkan Hard bernilai 2,797 yang hanya dapat partial 0,5 tampak benar. Keempat tabel (TF, PG, komputasi dasar, komputasi lanjut) wajib memakai penggolong yang sama; pernah ada masa ketiganya menganggap setiap poin bukan nol sebagai benar penuh sehingga partial credit tidak pernah terlihat.

**Seed pengocokan opsi MC wajib berbeda tiap soal.** `shuffleSeed(opts, seed)` dengan `seed = N` saja menghasilkan permutasi yang identik untuk seluruh soal; karena opsi benar lazim ditulis paling pertama, satu mahasiswa akan melihat SELURUH kunci di huruf yang sama dan menjawab satu huruf terus memberi nilai penuh bagian pilihan ganda. Bedakan seednya per soal — mis. lewat sidik isi opsi seperti `uas-sisken-v2.js` — dan jangan mengandalkan sebaran kunci gabungan lintas `N` sebagai bukti sehat: sebaran itu tetap tampak seimbang justru ketika cacatnya ada, sebab hurufnya berpindah antar-`N`. Yang benar memeriksa satu `N` pada satu waktu.

**Partial credit exam membaca `partialPoints` dari kunci** (kini 0,5 seragam di semua course; satu-satunya pengecualian adalah tugas rakitan `c11` UAS Pemodelan CAD, yang partial-nya 3 poin dari 10,43). Sebelumnya `checkExamAnswer` mematoknya 1 dan mengabaikan `partialPoints`, sehingga kebijakan per-course tidak pernah berlaku di exam; sekarang hanya status `correct` yang ditimpa bobot OBE. Jalur `recomputeExamPoints` memakai aturan yang sama — bila salah satunya kembali mematok 1, rescale akan menimpa poin partial yang sudah benar.

**Partial credit tetap hanya diberikan sebelum deadline.** Begitu masuk fase perpanjangan (exam) atau fase terlambat (modul), `computeOutcome` mengembalikan status `wrong` bernilai 0 — bukan partial yang dipotong. Yang dikenai potongan keterlambatan (0,65 di semua course) adalah **jawaban benar**. Contoh Sisken UTS `c15`: benar tepat waktu 2,797 poin; benar saat perpanjangan 2,797 × 0,65 = 1,818; kode disubmit tetapi salah → 0,5 bila tepat waktu, dan 0 bila sudah masuk perpanjangan.

### 7.1 Sistem desain exam

Kedua belas halaman exam (enam course) memakai satu keluarga desain exam yang terpisah dari sistem desain modul. Kelima UTS selain Pemodelan CAD berbagi stylesheet utama yang identik, demikian pula kelima UAS-nya. UTS/UAS Pemodelan CAD dibangun `scripts/cad-exam/bangun.py` dari kerangka Teknik Tenaga Listrik dengan formatnya sendiri (tanpa True/False dan Pyodide, kartu tugas unggah `.FCStd`), sehingga stylesheet-nya adalah kerangka itu tanpa gaya kartu benar-salah. Perbedaan konten, identitas course, jadwal, dan status UTS/UAS diperbolehkan; struktur visual dan perilaku komponen lintas course harus tetap setara. Label navbar ujian sama dengan label modul course-nya (`<LABEL> // UTS|UAS`, §17.1).

- hero menyajikan identitas exam, status jadwal, timer, dan ringkasan progres;
- panel skor `.score-bar` selalu terlihat secara sticky selama pengerjaan dan menjadi pusat progres, rincian poin, serta export;
- pemilih peran, login, friction layer mahasiswa, state sebelum/dalam/setelah jadwal, dan halaman Hasil harus mempertahankan hierarki visual yang sama;
- friction dan pembatasan interaksi hanya berlaku untuk mahasiswa, bukan mode dosen;
- perubahan desain exam harus diterapkan ke keenam course untuk jenis exam yang sama (CAD lewat kerangka TTL lalu `bangun.py uts|uas`), tanpa menyalin marker atau runtime `modern-academic-design` milik modul;
- perubahan visual tidak boleh mengubah gate PIN/jadwal, penilaian server, ledger attempt, presence, atau export.

### 7.2 ID soal

Urutan konseptual adalah Q1–Q45:

- Q1–Q10: `tf1`–`tf10`;
- Q11–Q30: `mc1`–`mc20`;
- Q31–Q40: komputasi Easy/Medium;
- Q41–Q45: komputasi Hard.

Semua exam memakai `c1`–`c15` untuk komputasi, dengan dua pengecualian. Opto UTS memakai `ce1`–`ce10` untuk Easy/Medium dan `ch1`–`ch5` untuk Hard. Pemodelan CAD tidak punya `tf`: UTS `mc1`–`mc20` lalu `c1`–`c10` (Q1–Q30), UAS ditambah `c11` (Q31), dan urutannya ditulis eksplisit di `OBE_ORDER` backend. Reset, mapping OBE, urutan backend, dan frontend harus memahami pengecualian ini.

### 7.3 Aturan submit

- Validasi semua tipe soal berjalan melalui `checkExamAnswer`.
- Kunci jawaban berada di Firestore `examAnswers`, tidak di HTML.
- Setiap soal one-shot dan dikunci oleh ledger Firestore.
- Dosen terverifikasi (`_dosenUjianTerverifikasi`, §7.8) dapat meninjau seluruh soal dalam mode hanya-baca; handler jawaban dan export mahasiswa tetap diblokir untuk identitas `role: 'dosen'` apa pun.
- Exam bersifat sumatif: jawaban benar tidak ditampilkan kepada mahasiswa.
- Komputasi menjalankan kode dengan Pyodide, lalu mengirim kandidat output dan potongan kode ke server. Pemodelan CAD tidak memakai Pyodide: tugas unggah memanggil `unggahBerkasTugas` dengan `examId`, lalu angka bacaan dinilai `checkExamAnswer` dan harus terbaca dari geometri berkas (§2).
- Toleransi numerik dan variasi per NIM ditentukan kunci server.
- Comp Hard dapat memberi 0,5 poin partial jika dikonfigurasi dan tidak terlambat (tugas unggah CAD juga 0,5; rakitan `c11` UAS CAD 3 poin).
- Pengali terlambat diterapkan server dan seragam di semua mata kuliah: 0,65 (potongan 35%). Client tidak boleh menjadi sumber kebenaran multiplier.

### 7.4 Parameter NIM

`N` diambil dari dua digit terakhir NIM. Jika dua digit terakhir adalah `00`, dipakai dua digit sebelumnya. Logika client, renderer bank soal, dan `deriveN()` backend harus selalu identik.

Jangan mengambil satu digit terakhir saja. Contoh NIM berakhiran `22` harus menghasilkan `N = 22`, bukan 2 atau 0.

> ⚠️ **Catatan implementasi (diperiksa ulang 26 September 2026 terhadap
> `getN()` di ke-12 halaman):** catatan 21 Agustus 2026 yang menyatakan tidak
> ada satu pun halaman exam dengan fallback `00` keliru — UTS Getaran memilikinya
> sejak Mei 2026 (#222), dan halaman yang disalin darinya ikut membawanya.
> Keadaan sebenarnya:
>
> | Halaman | Sumber `N` di client | Aman untuk NIM berakhiran `00`? |
> |---|---|---|
> | UAS Getaran, Sisken, Teknik Tenaga Listrik, Pemodelan CAD; UTS Pemodelan CAD | `window._uasServerN`/`_utsServerN` bila tersedia, turunan lokal sebagai cadangan | ya, mengikuti server |
> | UTS Getaran, Sisken, Teknik Tenaga Listrik | turunan lokal dengan fallback `00` (sama dengan `deriveN()`); `window._utsServerN` disimpan tetapi tidak dipakai `getN()` | ya |
> | UTS dan UAS Math4, UTS dan UAS Opto | turunan lokal tanpa fallback `00` | tidak |
>
> Dampaknya tampilan saja: badge `N=` bisa berbeda dari `N` server, sedangkan
> penilaian tetap benar karena server memakai `deriveN()` sendiri. Perbaikan
> yang paling bersih untuk empat halaman terakhir bukan menambah fallback,
> melainkan mengikuti pola UAS Getaran/Sisken/TTL/CAD — pakai `N` yang sudah
> dikirim server (`_utsServerN`/`_uasServerN`) dan jadikan turunan lokal
> sekadar cadangan.

### 7.5 Perbedaan UTS dan UAS

| Aspek | UTS | UAS |
|---|---|---|
| Teks soal | backend privat, diambil dengan `getExamQuestions` | backend privat, diambil dengan `getExamQuestions` |
| Kunci jawaban | server-only | server-only |
| Gate teks soal | PIN + jadwal (mahasiswa) atau sesi admin (dosen) | PIN + jadwal (mahasiswa) atau sesi admin (dosen) |
| Friction anti-copy/capture | aktif untuk mahasiswa (identik dengan UAS) | aktif untuk mahasiswa |

`getExamQuestions` melayani kedua belas exam (enam UTS + enam UAS, `QUESTION_BANKS` backend). Response berisi teks, opsi, hint, diagram, dan nilai `N` yang sudah dirender; bukan fungsi `compute()` atau jawaban benar.

Status bank per exam saat ini:

| Exam | Bank | Catatan |
|---|---|---|
| `getaran-mekanik-uts` / `-uas` | ditulis | 45 soal |
| `math4-uts` / `-uas` | ditulis | 45 soal |
| `optoauto-uts` / `-uas` | ditulis | 45 soal |
| `sisken-uts` | ditulis | 45 soal, cakupan Modul 1–4 (Sub-CPMK 1.1, 1.2, 2.1, 2.2) |
| `sisken-uas` | ditulis | 45 soal, cakupan Modul 8–14 (Sub-CPMK 4.1–4.3, 5.1–5.4) |
| `teknik-tenaga-listrik-uts` | ditulis (19 September 2026) | 45 soal, 40 parametrik, cakupan Modul 1–4 dan 6 (Sub-CPMK 1.1, 1.2, 1.3, 2.1, 3.1); Modul 5 (2.2) dinilai lewat Tugas |
| `teknik-tenaga-listrik-uas` | ditulis (20 September 2026) | 45 soal, cakupan Modul 7–9 dan 11–14 (Sub-CPMK 3.2, 4.1, 4.2, 5.2, 6.1, 7.1, 7.2); Modul 10 (5.1) dinilai lewat Tugas |
| `pemodelan-cad-uts` | ditulis (20 September 2026) | 30 soal tanpa TF: `mc1`–`mc20` + `c1`–`c10` tugas unggah model `.FCStd` + angka bacaan, seluruhnya parametrik; cakupan Modul 3–7 (Sub-CPMK 2.1–2.5) |
| `pemodelan-cad-uas` | ditulis (20 September 2026) | 31 soal tanpa TF: `mc1`–`mc20` + `c1`–`c10` sub-model komponen kompresor KT-40 + `c11` rakitan (10,43 poin, partial 3); cakupan Modul 8–12 (Sub-CPMK 3.1–4.2) |

Cakupan exam Sisken **tidak** mengikuti urutan pertemuan, melainkan matriks OBE di SIA: UTS 22% hanya menilai Sub-CPMK 1.1/1.2/2.1/2.2, dan UAS 30% menilai 4.1–4.3/5.1–5.4. Sub-CPMK 3.1–3.3 (Modul 5–7) dinilai **hanya lewat Tugas**. Menulis soal Modul 5–7 di UTS akan membuat jawabannya dihitung sebagai nilai Sub-CPMK lain, karena pemetaan OBE berbasis **posisi** soal (1–45), bukan topiknya.

Blueprint posisi → Sub-CPMK untuk Sisken, Teknik Tenaga Listrik, dan Pemodelan CAD (harus sama dengan `OBE_EXAM_CONFIG` backend dan mapping halaman Penilaian-OBE):

```text
sisken-uts   1.1 → 1-8    1.2 → 9-29   2.1 → 30-37  2.2 → 38-45
sisken-uas   4.1 → 1-9    4.2 → 10-17  4.3 → 18-25  5.1 → 26-28
             5.2 → 29-34  5.3 → 35-40  5.4 → 41-45
teknik-tenaga-listrik-uts
             1.1 → 1-4    1.2 → 5-8, 11-13   1.3 → 9-10, 14-19, 31-33
             2.1 → 20-25, 34-37, 41-42   3.1 → 26-30, 38-40, 43-45
teknik-tenaga-listrik-uas
             3.2 → 1-2, 11-12, 31        4.1 → 3-4, 13-16, 32-33, 41
             4.2 → 5, 17-18, 34, 42      5.2 → 6-7, 19-22, 35-36, 43
             6.1 → 8, 23-24, 37, 44      7.1 → 9, 25-27, 38, 45
             7.2 → 10, 28-30, 39-40
pemodelan-cad-uts
             2.1 → 1-4, 21-22   2.2 → 5-8, 23-24   2.3 → 9-12, 25-26
             2.4 → 13-16, 27-28 2.5 → 17-20, 29-30
pemodelan-cad-uas
             3.1 → 1-5, 21-22   3.2 → 6-10, 23-24  3.3 → 11-14, 25-27
             4.1 → 15-16, 28, 31               4.2 → 17-20, 29-30
```

Urutan posisi mengikuti `OBE_EXAM_ORDER`: `tf1..tf10`, `mc1..mc20`, `c1..c10`, `c11..c15`. Pemodelan CAD memakai urutan eksplisit `mc1..mc20`, `c1..c10` (UAS: lalu `c11`), karena `OBE_EXAM_ORDER` selalu menaruh `tf1..tf10` di depan.

### 7.6 Sumber nilai dan konsistensi

Sumber data exam mempunyai fungsi berbeda:

| Data | Peran |
|---|---|
| Firestore `examAttempts/.../qs/<qId>` | ledger attempt resmi dan sumber recompute; juga jawaban sendiri (`userAnswer` benar-salah/indeks PG/angka bacaan tugas unggah CAD → `angka`, `codePreview`) yang dipulihkan lewat `getJawabanSaya` |
| RTDB visitor `points` | cache total cepat untuk UI |
| RTDB visitor `scoreDeltas/<qId>` | delta aktual per soal, termasuk multiplier terlambat |
| local state | render sementara, bukan sumber nilai resmi |

Ketentuan:

- refresh harus memulihkan nilai per soal dari `scoreDeltas`, bukan menghitung ulang dari bobot default;
- bila `scoreDeltas` tidak ada — modul baru mulai menulisnya, dan exam baru menulisnya sejak 30 Juli 2026 — helper `restoredDelta(qId, fallback)` memakai nilai partial historis mata kuliah itu: **1** untuk Getaran Mekanik, Matematika 4, dan Optimalisasi & Otomasi; **0,5** untuk Sistem Kendali Cerdas, Teknik Tenaga Listrik, dan Pemodelan CAD. Fallback lain akan ditolak `validate-public-security.mjs`;
- jawaban yang dipulihkan setelah refresh (pilihan benar-salah sebagai boolean, pilihan PG sebagai indeks opsi terlihat, kode Python, ringkasan berkas Pemodelan CAD termasuk yang sudah diunggah tetapi belum dinilai (kecuali tugas yang sudah dikirim di sesi itu, JEMBATAN v5 §6.3), dan angka bacaan tugas unggah CAD yang sudah dinilai — kolom `nilai-<qId>` terisi, terkunci, dan berbingkai sesuai status lewat blok `JAWABAN-PRIVAT:ANGKA-CAD` di akhir `_apply<UTS|UAS>VisualState`) diambil dari ledger lewat `getJawabanSaya` (`{examId, nim, pinHash}`, §10; tanpa gerbang jadwal, jadi tetap bisa dipulihkan setelah ujian ditutup) dan digabung ke `data` sebelum `_cachedFirebaseData = data` dan `_apply<UTS|UAS>VisualState(data)` (blok `JAWABAN-PRIVAT:GABUNG`) — hanya entri yang statusnya cocok dengan marker record/cache soal itu (JEMBATAN v4, §6.3: `scoreDelta` ledger menang atas `scoreDeltas` hanya untuk entri itu; soal tanpa marker tetap dari ledger); record RTDB-nya baru dibaca sesudah penantian `getJawabanSaya`, dan snapshot yang lebih tua daripada marker benar yang sudah diketahui halaman tidak diterapkan maupun di-cache (blok `JAWABAN-PRIVAT:TUNGGU` v2, §6.3); hasil yang datang sesudah batas tunggu 2,5 detik digabung ke `_cachedFirebaseData` lalu `_reapply<UTS|UAS>StateFromCache()`; kegagalan, penguncian PIN, dan hash PIN yang ditolak ditangani sama seperti modul (§6.3; ujian meminta PIN lewat `_promptPinReentry`). `_handleServerExamError` (dan `_handleModulServerError` di modul) menampilkan `resource-exhausted` sebagai penguncian PIN "coba lagi dalam N detik", bukan sesi kedaluwarsa maupun galat koneksi. Tugas unggah Pemodelan CAD yang berkasnya sudah di server tetapi belum dinilai bisa dikirim tanpa unggah ulang (§6.3). Export ujian tetap membaca `_cachedFirebaseData().selections`, dan tanpa pilihan yang dikenali menulis "(Dijawab, jawaban benar/salah)". Record RTDB `visitors/<course>/<uts|uas>` tidak lagi memuat `selections`/`codes`: selama jendela ujian seluruh node itu terunduh ke setiap peramban (§9.1);
- tab Soal Ujian, tab Hasil, leaderboard, dan export harus mengacu pada total yang sama;
- `generateExportCode` menghitung ulang nilai exam dari ledger Firestore, mengembalikan `scoreDeltas` resmi, dan memperbaiki cache RTDB jika drift;
- `recomputeExamPoints` dapat menghitung ulang seluruh mahasiswa pada satu exam setelah perubahan mapping/bobot;
- nilai mentah disimpan dengan presisi yang diperlukan, sedangkan semua tampilan poin exam dibatasi maksimal dua angka di belakang koma tanpa nol ekor;
- headline nilai boleh berupa pembulatan bilangan bulat, tetapi tidak boleh mengganti total poin mentah.

Dengan alur ini, poin dan jawaban yang sudah tercatat tetap tersedia setelah refresh. localStorage bukan satu-satunya tempat penyimpanan nilai.

### 7.7 Export exam

Export UTS/UAS bersifat lenient: dapat dibuat setelah minimal satu soal telah dijawab dan link Google Drive valid. Export harus menyatakan jika masih ada soal yang belum dikerjakan.

Poin pada export berasal dari server, bukan penjumlahan DOM. Kode verifikasi memakai ID exam, NIM, poin yang dinormalisasi, dan waktu pembuatan.

### 7.8 Mahasiswa online

Semua exam hanya menampilkan mahasiswa yang sedang online:

- heartbeat: 20 detik;
- ambang online: 45 detik;
- `onDisconnect` dan `beforeunload` membersihkan presence jika memungkinkan;
- entri basi disaring ketika panel dirender;
- badge memakai jumlah online, bukan jumlah seluruh visitor historis.

Presence bukan sumber nilai atau bukti final kehadiran.

**Daftar online hanya untuk dosen.** Tiap baris memuat nama, NIM, waktu akses,
jumlah kunjungan, dan lencana "⏰ Terlambat" yang hanya muncul bila mahasiswa
itu sudah punya poin — jadi daftar ini membocorkan identitas, kehadiran, dan
status nilai teman sekelas. Aturan "UTS/UAS PRIVACY" (sejak April 2026)
menyembunyikannya dari mahasiswa, seperti kartu "Nilai Anda" yang hanya
menampilkan nilai sendiri. Sejak 26 September 2026 mahasiswa tetap memakai
`#visitorFab`, tetapi hanya sebagai tombol Asisten Dosen (§6.8):

- tab "👥 Online", `#vpList`, `#vpBadge`, dan `#fabCount` disembunyikan lewat
  `body.ujian-mahasiswa` (halaman) dan `body.vp-ujian-mhs` (blok AI), keduanya
  CSS `!important`, sehingga `setMode('kelas')` atau render apa pun tidak bisa
  memunculkannya lagi;
- isinya juga dikosongkan dari DOM. Dulu render fase tamu (sebelum login)
  sempat mengisinya dengan mahasiswa lain; sejak gerbang data kelas di bawah,
  jalur tamu tidak lagi mengisinya, tetapi pembersih ini sengaja dipertahankan
  sebagai lapis kedua;
- cabang mahasiswa `renderVisitors` tetap `return` sebelum jalur dosen mengisi
  roster, badge, dan jumlah online.

RTDB `visitors/*` dan `presence/*` dapat dibaca publik, jadi ini jaminan UI,
bukan batas keamanan: jangan menambahkan data yang lebih sensitif ke node itu.
Semuanya dipasang `scripts/buka-asisten-ujian.mjs` dan dijaga
`validate-public-security.mjs` (§17.1).

**Data kelas hanya untuk dosen terverifikasi (sejak 26 September 2026).**
Tabel tab **Hasil** (nama, NIM, status Terlambat/Bolos/Tepat Waktu, poin,
kunjungan, waktu akses), papan Top Skor/Top Akses, statistik kelas (jumlah
mahasiswa, kehadiran, absen), dan daftar online hanya dirender bila halaman
tidak dalam Mode Preview **dan** identitasnya lolos `_dosenUjianTerverifikasi`:
`role === 'dosen'` dan nama `dedik romahadi` (huruf besar/kecil bebas). Itu
aturan yang sama — satu fungsi — untuk semua yang membuka fitur dosen:
`_applyRoleVisibility` (tombol Reset, banner jadwal, `#visitorFab`), auto-login
jadwal (`_handleScheduleReady`), tinjauan soal dosen
(`_activateDosenQuestionView`), gerbang wadah soal
(`_updateUTSAccessGate`/`_updateUASAccessGate`), dan permintaan soal mode
dosen (`_ensureUTSQuestionsLoaded`/`_ensureUASQuestionsLoaded`), jadi semuanya
tidak bisa menyimpang. Dulu `renderVisitors` memperlakukan siapa pun yang bukan mahasiswa
sebagai dosen, sehingga tamu di layar login dan Mode Preview mendapat seluruh
data kelas; mahasiswa yang sedang ujian cukup membuka tab kedua dalam Mode
Preview untuk melihat status dan nilai teman sekelas. Sekarang:

- tamu dan Mode Preview mendapat placeholder netral ("Data kelas hanya tersedia
  untuk dosen." lalu ajakan sesuai konteks: tamu "Masuk sebagai mahasiswa untuk
  melihat nilai Anda sendiri.", Mode Preview — yang tidak punya formulir login —
  "Keluar dari Mode Preview (tombol Keluar Preview di banner atas), lalu masuk
  sebagai mahasiswa untuk melihat nilai Anda sendiri.");
  papan peringkat dan judul tabel disembunyikan, sedangkan isi papan,
  statistik, dan daftar online **dibuang dari DOM**, bukan sekadar
  disembunyikan. Identitas `role: 'dosen'` dengan nama lain diperlakukan sama;
- `updateLeaderboard` punya gerbang sendiri di baris pertamanya, karena
  `fetchMasterStudents` memanggilnya untuk siapa pun (dulu papan Top Skor
  terisi di DOM halaman mahasiswa, hanya tersembunyi);
- mahasiswa tidak berubah: kartu "Nilai Anda" dan Asisten Dosen (§6.8);
- setiap kali peran berubah, `_applyRoleVisibility` merender ulang tab Hasil
  dari data terakhir (`latestVisitors`, `onlinePresence`): dosen yang baru
  login dari layar tamu langsung melihat data kelas tanpa menunggu event RTDB
  berikutnya atau interval 30 detik, dan logout paksa (jadwal dihapus)
  langsung membuang data kelas dari DOM;
- masuk Mode Preview juga langsung merender ulang: `enterPreviewMode` memanggil
  `_segarkanHasilUjian()` tepat sesudah `window._previewMode = true` (penanda
  `PRIVASI-HASIL-UJIAN:PREVIEW`). Tanpa itu, data kelas yang sudah tampil untuk
  identitas dosen tersimpan (dosen memilih "← Pilih peran lain" lalu "Mode
  Preview") tetap terlihat di bawah banner Preview sampai event jadwal/RTDB
  berikutnya atau interval 30 detik (diperbaiki 26 September 2026);
- daftar online kini tidak pernah diisi untuk tamu di sumbernya (jalur dosen
  `renderVisitors`), sehingga badge "N online" tidak lagi muncul di belakang
  overlay login setelah logout paksa;
- satu aturan dosen untuk seluruh halaman (lanjutan 26 September 2026).
  Auto-login jadwal dulu memakai aturannya sendiri,
  `me.nama.toLowerCase() === 'dedik romahadi'` (nama saja, tanpa role), untuk
  melewati gerbang jam mulai dan penambahan kunjungan, dan tinjauan soal dosen
  aktif untuk `role === 'dosen'` bernama siapa pun. Identitas tersimpan format
  lama `{nama:'Dedik Romahadi'}` tanpa role, atau `{role:'dosen'}` bernama lain,
  jadi setengah-login: overlay hilang, 👥 FAB membuka panel online kosong, chip
  "DOSEN · SOAL HANYA-BACA", soal tertahan atau pesan "belum dibuka" dengan NIM
  "undefined". Sekarang `_isDosen` auto-login dan `_activateDosenQuestionView`
  memakai `_dosenUjianTerverifikasi`, dan identitas yang bukan dosen
  terverifikasi maupun mahasiswa ber-NIM (`_identitasUjianDikenal`) tidak
  dipulihkan: pemilih peran tampil seperti untuk tamu, tanpa `#visitorFab`,
  tanpa melewati gerbang jam mulai, tanpa tulisan ke RTDB — dosen tinggal
  memilih "Dosen" dan memasukkan password. Gerbang wadah soal (`isDosen` di
  `_update…AccessGate`, penanda `PRIVASI-HASIL-UJIAN:GERBANG-SOAL`) dan
  permintaan soal mode dosen tanpa NIM/PIN (`isDosenNow` di
  `_ensure…QuestionsLoaded`, `PRIVASI-HASIL-UJIAN:MUAT-SOAL`) juga memakainya
  sejak temuan tinjauan 26 September 2026; dulu keduanya `role === 'dosen'`
  saja. Tampilannya tidak berubah bagi identitas rekaan (wadah soalnya kosong
  dan server menolak permintaan tanpa klaim admin), tetapi kini tidak ada
  jalur pembuka fitur dosen yang berbasis role. Pemeriksaan role yang tersisa
  tidak membuka apa pun: `_previewGuard` dan `_previewExportGuard` sengaja
  tetap berbasis role karena keduanya MEMBATASI (soal hanya-baca, ekspor mati),
  jadi identitas `role: 'dosen'` apa pun tetap tidak bisa menjawab; penentu
  mahasiswa (`role !== 'dosen'`); pengalih `saveIdentity`/inisialisasi yang
  hanya memanggil `_activateDosenQuestionView` (bergerbang aturan tunggal); dan
  penjaga N=0 renderer soal yang hanya menggambar soal yang sudah dimuat;
- "Jumlah Absen" dosen benar sejak roster dimuat: `fetchMasterStudents` dulu
  memanggil `updateLeaderboard` kedua kali dengan variabel jadwal-berakhir yang
  tidak pernah didefinisikan (selalu `false`), menimpa statistik yang baru saja
  dihitung benar oleh `renderVisitors`, sehingga mahasiswa Bolos (jadwal sudah
  berakhir) tidak terhitung sampai event RTDB berikutnya atau interval 30 detik
  (terjadi bila data RTDB tiba lebih dulu daripada `students.json`). Panggilan
  itu dibuang; `renderVisitors` sudah memanggil `updateLeaderboard` dengan
  `schedExpired` dari jadwal saat ini (penanda `PRIVASI-HASIL-UJIAN:MASTER`).
  Ke-84 halaman modul membawa panggilan yang sama dan diperbaiki dengan cara
  yang sama oleh `scripts/leaderboard-modul-sekali.mjs` (penanda
  `LEADERBOARD-MODUL-SEKALI`, §17.1): statistik Absen tab Hasil modul kini
  benar sejak roster dimuat.

Dipasang `scripts/privasi-hasil-ujian.mjs` (penanda `PRIVASI-HASIL-UJIAN`,
dijalankan sesudah `buka-asisten-ujian.mjs` karena memakai
`_kosongkanRosterUjian`) dan dijaga `validate-public-security.mjs`, yang juga
menjalankan `renderVisitors`/`updateLeaderboard` halaman itu sendiri di sandbox
(§17.1). Sama seperti daftar online, ini jaminan UI; RTDB tetap terbaca publik.
Halaman modul sengaja tidak memakai gerbang ini: papan peringkat modul memang
untuk mahasiswa.

### 7.9 Pemuatan soal dan flag render

Teks soal UTS/UAS hanya datang dari `getExamQuestions` (§7.5), lewat
`_ensureUTSQuestionsLoaded()`/`_ensureUASQuestionsLoaded()`. Loader itu
dipanggil dari `saveIdentity` (login), cabang auto-login `_handleScheduleReady`
(identitas tersimpan dari kunjungan sebelumnya), dan `_setSessionPinHash` (PIN
dimasukkan ulang di tab baru, §4.3) di ke-12 halaman ujian. Jaring aman
inisialisasi di akhir skrip modul memanggilnya hanya di keenam UAS serta UTS
Matematika 4 dan Optimalisasi & Otomasi; di UTS Getaran, Sisken, TTL, dan CAD
jaring aman itu hanya memanggil renderer (lihat tabel di bawah). Dosen
memanggil loader dari `_activateDosenQuestionView` sesudah `authStateReady`.
Loader idempoten: ia berhenti bila soal sudah dirender
(`_utsRendered`/`_uasRendered` atau `window._utsRenderedFlag`/`_uasRenderedFlag`)
atau sedang dimuat, dan mahasiswa tanpa sesi PIN menunggu tanpa memanggil
server. Sesudah bank soal diisi dari respons, loader merender lalu memasang
flag — satu-satunya pasangan render→flag yang sah.

**Flag render hanya dipasang sesudah soal benar-benar ada:** oleh renderer
sesudah render sukses, atau oleh loader sesudah bank soal diisi dari respons
server. Tidak ada tempat lain yang memberinya nilai selain `false`.
`renderUTSQuestions()`/`renderUASQuestions()` return dini selama bank belum
diisi (console: "UTS questions not loaded yet"). Pemanggil yang merender
langsung lalu memasang flag tanpa syarat membuat flag bernilai `true` padahal
belum ada satu soal pun, dan sejak itu setiap panggilan loader berhenti di
penjaganya. Sejak #726 (3 Agustus 2026, bank UTS Matematika 4 dan
Optimalisasi & Otomasi dipindah ke server) kedua UTS itu masih memanggil
`renderUTSQuestions(); window._utsRenderedFlag = true;` di jaring aman
inisialisasi dan di cabang auto-login, sehingga mahasiswa yang kembali dengan
identitas tersimpan — juga yang memasukkan PIN lagi di tab baru — tidak pernah
mendapat soal sampai localStorage dibersihkan (`getExamQuestions` tidak
dipanggil sama sekali). Login baru tidak kena karena `saveIdentity` memanggil
loader sebelum flag terpasang. Bila snapshot jadwal tiba sebelum
`_activateDosenQuestionView`, flag yang sama juga menahan tinjauan soal dosen.
Diperbaiki 29 September 2026: renderer UTS kedua halaman memasang flag sendiri
tepat sesudah `_utsRendered = true` (pola UTS Getaran), jaring aman
inisialisasi memanggil loader seperti keenam UAS, dan auto-login hanya
menjadwalkan loader (+100 ms).

| Halaman | Jaring aman inisialisasi | Auto-login `_handleScheduleReady` | Flag render dipasang |
|---|---|---|---|
| UAS (6 halaman) | loader +100 ms | loader langsung | di loader (UAS CAD juga di renderer) |
| UTS Getaran, Sisken, TTL, CAD | `renderUTSQuestions()` tanpa flag (tanpa efek sebelum soal dimuat) | loader +100 ms, lalu render tanpa flag | di renderer dan di loader |
| UTS Matematika 4, Optimalisasi & Otomasi | loader +100 ms | loader +100 ms | di renderer (`MUAT-SOAL-UTS:FLAG`) dan di loader |

Akibat sampingan yang disengaja, sama seperti di halaman ujian lain:
mahasiswa dengan sesi PIN tersimpan yang membuka UTS kedua halaman itu di luar
jendela ujian kini memicu `getExamQuestions`. Server menolaknya
(`failed-precondition`), dan pesannya tampil di wadah soal sebagai
"Soal terkunci: <pesan server>". Flag tidak terpasang, dan PIN yang benar
tidak menambah hitungan penguncian PIN (§4.3), karena PIN diperiksa sebelum
jadwal.

- **Sebelum jam mulai.** Satu panggilan datang dari jaring aman
  inisialisasi, seperti di keenam UAS. Wadah soal masih tertutup layar login
  "Akses UTS belum dibuka". Login sesudah jam mulai memuat soal seperti biasa;
  dulu flag dari jaring aman itu juga menahan login tersebut. Bila mahasiswa
  itu masuk Mode Preview sebelum jam mulai, layar login tersembunyi dan
  "Soal terkunci: …" terlihat di wadah soal. Ini juga sama seperti UAS, dan
  tidak ada teks soal yang terkirim.
- **Sesudah `end + extension`.** Auto-login hanya memeriksa jam mulai, jadi
  layar login tidak menutup halaman. Jaring aman inisialisasi dan auto-login
  masing-masing memanggil loader (dua panggilan, keduanya ditolak).
  "Soal terkunci: …" tampil di bawah banner "UTS Telah Berakhir … Jawaban
  Anda telah tersimpan", sama seperti UTS Getaran, Sisken, TTL, dan CAD (satu
  panggilan, dari auto-login). Keenam UAS juga memanggil dua kali dan
  menampilkan "🔒 <pesan server>" di bawah banner "UAS Telah Berakhir". Dulu
  wadah UTS kedua halaman itu kosong.

**Teks pesan server menyebut jenis ujian halaman itu** (sejak deploy
fungsi backend 29 September 2026, PR backend #89 — sebelumnya halaman menerima
teks lama di bawah). Ketiga callable yang
menggerbang jendela ujian mengambil teksnya dari satu helper backend
(`_pesanJadwalUjian`, jenis dari `EXAM_CONFIG[examId].jenisUjian`), untuk
jadwal global maupun override susulan:

| Keadaan jadwal | `getExamQuestions` (wadah soal) | `checkExamAnswer` (kirim jawaban) | `unggahBerkasTugas` (UTS/UAS CAD) |
|---|---|---|---|
| sebelum `start` | "Akses UTS belum dibuka — tunggu waktu mulai" | sama | sama |
| sesudah `end + extension` | "Batas waktu UTS sudah lewat" | "Batas waktu UTS sudah lewat — submit ditolak" | "Batas waktu UTS sudah lewat — unggahan ditolak" |
| jadwal tidak ada, atau tanpa `start`/`end` | "Jadwal UTS belum dikonfigurasi" | sama | sama |

Di keenam UAS kata "UTS" menjadi "UAS". UTS yang sudah berakhir jadi
menampilkan "Soal terkunci: Batas waktu UTS sudah lewat" di bawah banner "UTS
Telah Berakhir". Sebelumnya `getExamQuestions` menulis "UAS" untuk kedua belas
ujian ("Akses UAS belum dibuka — tunggu waktu mulai", "Batas waktu UAS sudah
lewat", "Jadwal UAS belum dikonfigurasi"), sedangkan `checkExamAnswer` dan
unggahan menulis "ujian". Hanya teksnya yang berubah: kode galat tetap
`failed-precondition` tanpa `details`, dan halaman tidak disentuh. Ke-12
halaman menampilkan `err.message` apa adanya — di wadah soal sebagai "Soal
terkunci: …" (UTS) atau "🔒 …" (UAS), dan di umpan balik soal saat mengirim
jawaban atau mengunggah berkas CAD — dan tidak ada yang mencocokkan teks
pesan ini (diperiksa dengan `git grep` pada 29 September 2026). Halaman tidak
perlu membedakan keadaan jadwal: tampilkan `err.message` apa adanya. Ketiga
keadaan memakai kode yang sama (`failed-precondition`, tanpa `details`), dan
`checkExamAnswer`/`unggahBerkasTugas` juga memakai kode itu untuk penolakan
yang bukan jadwal (berkas belum diunggah, angka tidak ada di geometri berkas,
soal sudah dinilai), jadi kode galat tidak dapat membedakannya. Bila kelak
perlu dibedakan, tambahkan `details` (mis. `{ reason }`) di backend lewat
`_pesanJadwalUjian` dan sesuaikan `verify-pesan-jadwal-ujian.js`, yang kini
menagih `details` tidak ada; jangan mencocokkan teks. Callable dosen `rescaleExamLatePenalty` (halaman
`Admin/rescale-deadline.html`, "❌ Gagal: …") memakai helper yang sama: "Jadwal
UTS belum dikonfigurasi" bila node jadwal tidak ada, dan "Jadwal UTS belum
punya field 'end'" bila jadwal tanpa `end` dan tanpa deadline baru (dulu
keduanya menulis "ujian"). Penjaganya di backend:
`scripts/verify-pesan-jadwal-ujian.js` (12 ujian × 4 keadaan jadwal untuk
ketiga callable mahasiswa dan 12 ujian × 3 keadaan untuk rescale, ikut `npm
test`, §17.2).

Tinjauan soal dosen (chip "DOSEN · SOAL HANYA-BACA", permintaan tanpa NIM/PIN
dengan sesi admin, jawaban diblokir) tidak berubah. Mode Preview tanpa
identitas (§4.2) juga tidak berubah: loader tidak pernah dipanggil dan wadah
soal kosong. Diuji di Chrome headless dengan Firebase tiruan (tanpa Firebase
sungguhan): auto-login dengan identitas dan sesi PIN tersimpan memanggil
`getExamQuestions` tepat sekali dan merender soalnya, begitu pula tab baru
sesudah PIN dimasukkan.

Dipasang `scripts/muat-soal-uts.mjs` (penanda `MUAT-SOAL-UTS:FLAG`,
`AUTOLOGIN`, `INIT`; hanya UTS Matematika 4 dan Optimalisasi & Otomasi,
kesepuluh halaman ujian lain hanya diperiksa; ada `--periksa`). Skrip itu
memproses dan memeriksa ke-12 halaman di memori lebih dulu, lalu baru menulis
sesudah semuanya lolos. Aturan flag render dijaga
`validate-public-security.mjs` di ke-12 halaman ujian (§17.1); baris komentar
`//` diabaikan:

1. `render…Questions()` yang langsung diikuti pemasangan flag render hanya
   boleh ada di dalam `_ensure…QuestionsLoaded`.
2. Flag render hanya boleh diberi nilai selain `false` di dalam
   `render…Questions` atau `_ensure…QuestionsLoaded`, dan minimal sekali di
   sana. Aturan ini juga menangkap flag yang dipasang sesudah `try/catch`,
   dipisah komentar dari render, atau sesudah `render…Questions?.()`.
3. `_ensure…QuestionsLoaded` memanggil `render…Questions()`. Bentuk pemasangan
   flag di loader tidak dikunci, jadi boleh bersyarat.

---

## 8. Friction layer UAS dan batasannya

Untuk mahasiswa UAS, halaman saat ini:

- menampilkan watermark NIM dan nama;
- memblokir event copy/cut, drag konten, sebagian context menu, print, save page, view source, dan shortcut DevTools yang umum;
- menangani tombol Print Screen dengan shield dan upaya mengganti clipboard;
- memblokir `getDisplayMedia()` dari halaman;
- menghitung perpindahan tab melalui `visibilitychange`;
- tidak memburamkan atau menyembunyikan halaman saat tab kehilangan fokus.

Batasan yang wajib dinyatakan jujur:

- browser tidak dapat menjamin pencegahan screenshot tingkat sistem operasi, kamera eksternal, perangkat kedua, extension, atau DevTools yang dibuka dengan cara lain;
- Alt+Tab tetap dapat digunakan dan hanya dapat terdeteksi secara terbatas ketika visibilitas dokumen berubah;
- halaman tidak dapat membatasi Alt+Tab hanya ke VS Code;
- VS Code tetap dapat digunakan berdampingan karena exam komputasi memang meminta pekerjaan Jupyter/VS Code;
- watermark dan event blocker adalah deterrent serta alat atribusi, bukan DRM atau jaminan anti-kecurangan mutlak.

**Keadaan per 22 Agustus 2026.** Watermark NIM+nama dan panel "🔒 Mode Modul Aktif" **dihapus dari 56 halaman modul** atas permintaan dosen; panel "Mode Ujian Aktif" dihapus dari 8 exam. **Watermark pada UAS/UTS sengaja dipertahankan** sampai ada keputusan eksplisit: ia satu-satunya alat atribusi bila foto soal bocor keluar, dan `validate-public-security.mjs` masih menuntutnya. `scripts/ubah-friction.mjs --exam-watermark` menghapusnya bila keputusan itu jatuh; validator harus diperbarui bersamaan.

Dua penghalang ditambahkan ke 64 halaman yang ada saat itu dan kini terpasang di ke-96 halaman modul/exam: `@media print` mengosongkan halaman saat dicetak atau disimpan sebagai PDF (menutup jalur menu browser yang tidak lewat Ctrl+P), dan `beforeprint` mencatatnya. Halaman **modul** juga dikaburkan saat *jendela* kehilangan fokus (`blur`/`focus`) — Alt+Tab dan Snipping Tool tidak mengubah `visibilitychange`, jadi dipantau terpisah. Ini **tidak** diterapkan pada exam: larangan memburamkan halaman ujian saat kehilangan fokus tetap berlaku dan ditegakkan validator.

**Kunci identitas lapisan friksi (diperbaiki 26 September 2026).** Lapisan friksi
memutuskan "mahasiswa atau bukan" dari `localStorage[LK]`, dan `LK` wajib sama
dengan `LOCAL_IDENTITY` halaman itu (`<slug>_identity_<uts|uas>`). UAS Math4,
Getaran, Sisken, dan TTL sempat membaca kunci **UTS** hasil salin-tempel (sejak
Mei 2026): mahasiswa yang login di UAS lolos dari blokir salin/potong/Ctrl+C,
watermark, dan penghitung pindah tab, sementara identitas UTS yang tertinggal di
komputer lab (mahasiswa lain) justru dipakai sebagai watermark, juga bagi tamu.
`scripts/ubah-friction.mjs` (butir 5) menyamakan `LK` dengan `LOCAL_IDENTITY`,
dan `validate-public-security.mjs` menolak `LK` yang berbeda di ke-12 halaman
ujian. `scripts/cad-exam/bangun.py` menulis ulang `LK` UTS/UAS CAD sendiri.
Sejak 29 September 2026 aturan yang sama ditagih di ke-84 **modul** (§6.7):
`LK` Matematika 4 tertulis `'${COURSE_ID}_identity_modul-N'` dalam kutip tunggal
(tidak diinterpolasi, sejak Mei 2026) sehingga friksi modulnya tidak pernah
aktif, dan `LK` Optimalisasi Modul 12–14 membaca kunci modul sebelumnya sejak
`MODULE_ID`-nya digeser ke pertemuan N+1 (30 Mei 2026). Keduanya disamakan
`scripts/samakan-kunci-identitas.mjs`.

Jangan menulis klaim “screenshot mustahil” atau “Alt+Tab diblokir total”.

---

## 9. Data Firebase

### 9.1 RTDB

| Path | Isi |
|---|---|
| `pins/mhs_<NIM>` | hash PIN global dan identitas dasar |
| `visitors/<course>/<slot>/mhs_<NIM>` | kunjungan, points, marker, dan score delta — **terbaca publik** (papan peringkat, tab Hasil), jadi tanpa jawaban: `selections`/`codes` tidak lagi ditulis maupun dibaca (sumbernya ledger Firestore lewat `getJawabanSaya`, §6.3); tidak pernah ditulis untuk akun simulasi (§4.5) |
| `settings/<course>/<slot>/schedule` | start, end, duration, due, extension |
| `settings/<course>/<slot>/scheduleOverrides/mhs_<NIM>` | override `end`/`extension` per NIM untuk ujian susulan (§5.5); admin-only write |
| `presence/<course>/<slot>/mhs_<NIM>` | heartbeat online |
| `chat/<course>/<slot>/messages` | chat modul |
| `aiChat/quota/<NIM>` | kuota rate-limit AI chat per mahasiswa; server-only (tidak ada rules node, default deny) |
| `security/adminLoginState` | penghitung gagal dan lock login admin global |

Rules harus mencegah client mengubah field server-owned seperti `points`, `scoredQuestions`, `scoreDeltas`, timestamp poin, dan konsolasi. Sejak rules jawaban privat (backend, deploy bersama functions `getJawabanSaya`) record visitor **create-only** untuk klien: record baru wajib `nama`/`nim`/`role`/`timestamp`, kunci `mhs_<nim>`, peran `student`, `visitCount` 1, tanpa poin/marker/`scoreDeltas`/konsolasi/`pinHash`; sesudah ada, klien hanya boleh menaikkan `visitCount` (+0/+1), mengisi `lastVisit`, dan menghapus `pinHash`/`pinSetAt` lama. Server menetapkan ulang `nama`/`nim`/`role` dari `pins/` pada setiap penilaian. Operasi admin yang membutuhkan hak lebih tinggi dilakukan melalui callable atau token admin.

**Jawaban mahasiswa tidak disimpan di `visitors/` (sejak 29 September 2026).** Izin `.read: true` di `visitors/$course`, `$module`, dan `$visitorKey` menurun ke seluruh anak dan tidak bisa dicabut di tingkat bawah, sementara ke-96 halaman modul/ujian (termasuk tamu dan legacy PIN scan) mengunduh seluruh node slot. Dulu `checkModulAnswer`/`checkExamAnswer` menulis `selections[qId]` (huruf PG modul, boolean benar-salah dan indeks PG ujian) dan `codes[qId]` (kode Python atau ringkasan berkas) di samping marker benar/salah, sehingga siapa pun bisa menyusun kunci jawaban modul — dan kunci ujian selama jendela ujian. Rules juga membolehkan klien mana pun menambah/menimpa/menghapus `codes/cN` di record siapa pun. Sumber kebenaran jawaban adalah ledger Firestore (`userAnswer`, `mcOrderVersion`, `codePreview`, §9.2) yang tertutup untuk klien; salinan RTDB hanyalah cache tampilan dan penilaian tidak pernah membacanya. Kini:

- halaman memulihkan jawaban sendiri HANYA lewat callable `getJawabanSaya` (NIM + hash PIN sesi, penguncian gagal PIN atomik per NIM + sumber, tidak dibagi `verifyPin`; §4.3) dan tidak pernah membaca `selections`/`codes` record publik — milik sendiri maupun teman, juga saat callable gagal (§6.3, §7.6);
- tulisan klien ke record visitor hanya membuat record netral atau menambal `visitCount`/`lastVisit` (`_tulisPengunjung`, patch kunjungan); identitas localStorage tidak menyimpan jawaban dan tidak menyalin peran/nama/NIM dari record;
- backend berhenti menulis kedua field, rules create-only (di atas) ter-deploy bersama functions, lalu migrasi mencadangkan entri tanpa ledger dan membersihkan yang sudah ada di seluruh course dan slot (termasuk `uts`/`uas` dan semester lama).

Urutan rilis (rincian dan perintahnya di `functions/DEPLOY.md` repo backend, § Jawaban privat; selesai sebelum UTS CAD 3 November 2026): siapkan kedua PR (PR frontend ini di-rebase ke `main` sesudah #962 ter-merge, CI hijau, belum di-merge) dan merge PR backend → dry-run migrasi → buang `pinHash` publik (`strip-pin`; umumkan bahwa mahasiswa tanpa PIN global diminta membuat PIN baru) → cadangkan → **deploy functions dan RTDB rules dalam satu run** (uji asap termasuk pemisahan keluarga lockout: saat `verifyPin` akun simulasi terkunci, `generateExportCode` dan `getJawabanSaya` dengan PIN benar tetap berhasil) → merge frontend beberapa menit kemudian dan minta mahasiswa memuat ulang tab → gerbang uji pemulihan dengan akun non-simulasi (modul ragam A/B, C, D termasuk berkas CAD belum dinilai, dan satu ujian) → cadangan susulan → `strip` → rotasi PIN terpapar di kelas (`reset-pin` lokal di laptop dosen, mahasiswa mengetik PIN baru; yang belum bisa hadir `cabut-pin` lewat workflow — `pins/` tidak pernah dikosongkan, §4.3). Karena functions + rules sudah aktif saat halaman ini terbit, halaman tidak lagi memakai field publik sebagai cadangan. Tab lama yang masih terbuka sesudah rules ter-deploy: `set()` seluruh record ditolak (kunjungan tidak tercatat) dan pembuatan PIN di tab lama gagal sampai dimuat ulang; penilaian tidak terpengaruh.

**Batas penjagaan `scoreDeltas` (sejak backend #44, 5 September 2026).** `scoreDeltas` berupa objek, sehingga tidak boleh dibandingkan dengan `===` di `.write` induk: di aturan RTDB hasilnya selalu false dan mengunci login mahasiswa yang sudah menjawab. Imutabilitasnya dijaga per entri di `scoreDeltas/$qId` (nilai yang sudah ada tidak bisa diubah), dan record baru dari klien tidak boleh membawa `scoreDeltas`; `validate-backend.js` menjaga ketiga hal itu, termasuk mencegah pembanding objek kembali. Sampai rules create-only ter-deploy, `.validate` tidak berjalan saat penghapusan dan entri untuk soal yang belum dijawab masih bisa ditambahkan klien; sesudahnya klien tidak bisa menulis `scoreDeltas` sama sekali. Selain itu rescale/reset tidak selalu memperbarui `scoreDeltas` RTDB. Karena itu **jangan pernah memakai `scoreDeltas` RTDB sebagai sumber nilai resmi**: kode ekspor, OBE, dan `recomputeExamPoints` memakai ledger Firestore, dan pemulihan halaman memakai `scoreDelta` ledger dari `getJawabanSaya` untuk setiap soal di responsnya (§6.3).

### 9.2 Firestore

| Path | Isi |
|---|---|
| `examAnswers/<examId>/qs/<qId>` | kunci jawaban exam |
| `examAttempts/<examId>/students/<nimKey>/qs/<qId>` | ledger attempt exam |
| `modulAnswers/<modulId>/qs/<qId>` | kunci jawaban modul |
| `modulAttempts/<modulId>/students/<nimKey>/qs/<qId>` | ledger attempt modul |
| `obeNilai/<courseId>/students/<nimKey>` | nilai OBE yang dipublish |
| `obeMappings/<courseId>` | mapping Tugas/UTS/UAS per course |
| `progresModul/<modulId>/students/<nimKey>` | progres materi: `centang`, `total`, `forum{fq1..3}`, `forumSelesai`, `forumPoll{1..3}` (indeks opsi quick check Forum, hanya ditulis `saveModulPoll`; pilihan pertama final, tidak dinilai, §6.5), `updatedAt` (§6.7) |
| `tugasBerkas/<modulId\|examId>/students/<nimKey>/qs/<qId>` | metadata berkas tugas pemodelan Pemodelan CAD (nama, ukuran, SHA-256, path objek, versi, `simulasi`); isi berkasnya di bucket privat `getaran-mekanik-tugas` (§2) |

Firestore Rules menolak semua akses client langsung. Jangan melonggarkan rules untuk memudahkan debugging.

---

## 10. Cloud Functions

Daftar callable yang digunakan sistem saat ini:

| Callable | Akses | Fungsi |
|---|---|---|
| `createAdminSession` | password admin | membuat custom token admin |
| `verifyPin` | tanpa sesi (NIM + hash PIN) | memeriksa PIN mahasiswa `{exists, valid}` tanpa mengembalikan hash; lockout per-NIM (§4.3) |
| `checkModulAnswer` | mahasiswa + PIN | validasi satu soal modul dan catat poin |
| `checkExamAnswer` | mahasiswa + PIN | validasi satu soal exam dan catat attempt/poin |
| `getExamQuestions` | mahasiswa + PIN + jadwal, atau admin | mengambil bank teks soal UTS/UAS yang sudah dirender |
| `getModulQuestions` | mahasiswa + PIN + jadwal, atau admin | mengambil teks tugas parametrik yang sudah dirender per NIM: `c1`–`c15` Sisken dan Teknik Tenaga Listrik, `c1`–`c5` Pemodelan CAD (Modul 1–14) |
| `generateExportCode` | mahasiswa + PIN (penguncian per NIM + sumber, §4.3) | mengambil poin resmi dan membuat kode HMAC export |
| `verifyExportCode` | admin | memverifikasi kode export |
| `resetModulAttempts` | admin | menghapus ledger seluruh attempt satu modul |
| `resetExamAttempts` | admin | menghapus ledger seluruh attempt satu exam |
| `resetModulQuestion` | admin | reset soal tertentu/semua untuk satu atau semua mahasiswa |
| `resetExamQuestion` | admin | reset soal tertentu/semua untuk satu atau semua mahasiswa |
| `rescaleModulLatePenalty` | admin | menghitung ulang penalti modul, dapat dibatasi NIM; `newEnd` tanpa `nims` memperpanjang jadwal global dengan menulis `end` dan `due` (waktu buka tetap, §5.4); menolak sebelum menulis deadline satu kelas yang tidak berselisih kelipatan 24 jam dari waktu buka, deadline pada/sebelum waktu buka, dan hitung ulang tanpa `newEnd` saat `end` ≠ `due` (§5.4). Semuanya sejak deploy cabang backend `fix/chat-kenapa-admin-dan-rescale-due`; sebelumnya hanya `end` yang ditulis, tanpa penolakan. Tugas FreeCAD modul Pemodelan CAD dihitung ulang dengan aturan kirim ulang sejak deploy cabang backend `fix/rescale-cad-kirim-ulang` (§5.4) |
| `rescaleExamLatePenalty` | admin | menghitung ulang penalti keterlambatan exam (UTS/UAS), dapat dibatasi NIM; parameter `nims[]`+`newEnd`/`newExtension` menulis `scheduleOverrides` untuk ujian susulan (§5.5); `newEnd` tanpa `nims` menulis `end`, `due`, dan `duration` jadwal global dengan `start` tetap; tiap mahasiswa dinilai ulang terhadap override-nya (`overriddenStudents`); deadline pada/sebelum `start` dan NIM tidak sah ditolak sebelum menulis; `duration` di luar 1..43200 menit dihapus sehingga modal Atur Jadwal meminta Durasi (§5.5). Semuanya sejak deploy cabang backend `fix/chat-kenapa-admin-dan-rescale-due`; sebelumnya hanya `end`, terhadap jadwal global, tanpa penolakan |
| `analyzeModulData` | admin | menganalisis data modul dan anomali grading |
| `recomputeExamPoints` | admin | menghitung ulang total exam dari ledger |
| `computeObeScores` | admin | menghitung TGS/UTS/UAS per Sub-CPMK |
| `getObeMapping` | admin | mengambil mapping OBE satu course |
| `saveObeMapping` | admin | memvalidasi dan menyimpan mapping OBE satu course |
| `publishObeNilai` | admin | mempublikasikan nilai OBE |
| `getMyObeNilai` | mahasiswa + PIN | mengambil nilai OBE mahasiswa tersebut |
| `getModulProgress` | mahasiswa + PIN | progres centang/forum/tugas modul ini + hasil gerbang akses; backend cabang `feat/pilihan-poll-forum` **selalu** menyertakan `forumPoll` (objek, `{}` bila belum ada) — halaman memakainya untuk memulihkan quick check dan hanya memanggil `saveModulPoll` bila kunci itu ada (§6.5) |
| `getJawabanSaya` | mahasiswa + PIN (penguncian gagal PIN atomik per NIM + sumber, tidak dibagi `verifyPin` (§4.3), `resource-exhausted` + `details.remainingSeconds`; tanpa gerbang jadwal) | jawaban sendiri dari ledger untuk pemulihan setelah refresh, `{modulId}` atau `{examId}`: `{jawaban:{qId:{tipe, pilihan?, mcOrderVersion?, kode?, angka?, status, scoreDelta}}, berkas:{qId: ringkasan berkas belum dinilai}, simulasi?}` — `angka` (number berhingga) hanya pada entri `comp` tugas berkas Pemodelan CAD (modul `pemodelan_cad-modul-N`, ujian `pemodelan-cad-uts`/`-uas`) yang sudah dinilai: angka bacaan attempt terakhir; tidak pernah mengembalikan kunci, penjelasan, atau data mahasiswa lain (§6.3, §7.6, §9.1) |
| `checkModulAccess` | mahasiswa + PIN | boleh masuk modul ini? (modul sebelumnya lengkap) |
| `setModulCentang` | mahasiswa + PIN | mencentang bagian materi ke-*i*; ditolak bila tidak urut. Parameter `batal:true` membatalkan centang terakhir dan hanya diterima untuk akun simulasi (`SIM_NIMS`) |
| `saveModulForum` | mahasiswa + PIN | menyimpan tiga jawaban forum; `forumSelesai` bila masing-masing ≥ 30 kata. Tanpa `jawaban` menulis tiga teks kosong, jadi halaman hanya memanggilnya dari `simpanForum` PROGRES-MODUL dengan `jawaban`; tidak mengenal pilihan poll |
| `saveModulPoll` | mahasiswa + PIN (penguncian per NIM) | menyimpan pilihan quick check Forum `{modulId, nim, pinHash, pilihanPoll: {"1".."3": indeks 0..9}}` ke `forumPoll` dalam transaksi; pilihan pertama per kunci final (kunci yang ada tidak ditimpa, tanpa galat); respons `{forumPoll}` = peta akhir; tidak pernah menyentuh `forum`/`forumSelesai`/`centang` (field lain, termasuk `jawaban`, diabaikan); `pilihanPoll` tidak sah → `invalid-argument` tanpa tulisan. Cabang backend `feat/pilihan-poll-forum`; sebelum ter-deploy menjawab `NOT_FOUND` tanpa tulisan (§6.5) |
| `unggahBerkasTugas` | mahasiswa + PIN + jadwal | mengunggah berkas tugas pemodelan (Pemodelan CAD: `.FCStd` ≤ 8 MB) ke bucket privat; boleh diganti selama tugas belum dinilai |
| `unduhBerkasTugas` | admin, atau mahasiswa + PIN (berkas sendiri) | mengunduh berkas tugas (base64) beserta nama, ukuran, SHA-256 |
| `daftarBerkasTugas` | admin | daftar berkas tugas satu modul beserta status penilaian; akun simulasi disaring kecuali `sertakanSimulasi` |
| `deleteObeNilai` | admin | menghapus nilai OBE terpublikasi satu course |
| `getModuleChatContext` | mahasiswa + PIN | bootstrap sapaan/konteks AI chat modul (deterministik, tidak memanggil model) |
| `aiChat` | mahasiswa + PIN | asisten administratif + tutor retrieval bersitasi untuk mata kuliah aktif; model generatif opsional memakai `AI_API_KEY`, dengan rate-limit model di `aiChat/quota/<NIM>` (§6.8, §9.1) |

Tidak ada callable `recomputeAllObeScores`. Jangan mendokumentasikan atau memanggil nama tersebut.

---

## 11. Reset dan alat Admin

### 11.1 Reset penuh dari halaman modul/exam

Reset penuh adalah operasi destruktif yang terpisah dari pengaturan jadwal. Urutan aman:

1. autentikasi admin;
2. hapus ledger attempt Firestore melalui callable;
3. hapus record visitor RTDB yang ditargetkan;
4. bersihkan identitas lokal terkait;
5. hapus jadwal terakhir;
6. reload.

Jika penghapusan ledger gagal, jangan lanjut menghapus RTDB karena mahasiswa akan terlihat reset tetapi tetap terkunci server-side. PIN global tidak ikut dihapus.

### 11.2 `Admin/`

| Halaman | Kegunaan |
|---|---|
| `reset-soal.html` | reset satu, beberapa, atau semua soal pada 84 modul dan 12 exam (enam mata kuliah); target satu NIM atau semua mahasiswa |
| `recompute-obe-score.html` | recompute poin satu exam dari mapping OBE dan ledger |
| `rescale-deadline.html` | rescale penalti keterlambatan modul atau exam (UTS/UAS), global atau NIM tertentu (exam via `rescaleExamLatePenalty`, §5.5/§10). Deadline Baru dengan NIM kosong menulis `end` **dan** `due` jadwal global dan mempertahankan waktu buka, baik modul (§5.4) maupun ujian (§5.5, `duration` menit ikut diselaraskan), sejak deploy cabang backend `fix/chat-kenapa-admin-dan-rescale-due`; dengan NIM terisi, jadwal global tidak diubah. Sejak deploy yang sama server menolak (juga pada Diagnose): deadline modul satu kelas yang jamnya tidak sama dengan jam buka modul (preset 23:59 hanya cocok untuk modul yang dibuka 23.59 WIB; pesannya menyarankan dua deadline sah), deadline pada/sebelum waktu buka modul atau `start` ujian, dan hitung ulang modul tanpa Deadline Baru saat `end` ≠ `due` (§5.4). Untuk ujian satu kelas, halaman membaca `start` dan memperingatkan bila Deadline Baru lebih dari 30 hari sesudahnya; hasilnya menampilkan jumlah mahasiswa yang dinilai terhadap jendela susulannya sendiri (§5.5). Saat Pemodelan CAD mode Modul dipilih, halaman menampilkan aturan kirim ulang yang dipakai menghitung ulang tugas FreeCAD (§5.4) |
| `analyze-victims.html` | analisis korban/anomali grading modul dan reset terarah. Kode Python mahasiswa (ditulis mahasiswa, dari `codePreview` ledger) dijalankan di kotak pasir: `<iframe sandbox="allow-scripts">` tanpa `allow-same-origin` + satu Web Worker Pyodide per mahasiswa, hanya teks kode masuk dan teks keluaran keluar (`postMessage`), namespace Python baru per kode, batas waktu 120 detik. Jangan pernah memuat Pyodide atau menjalankan kode mahasiswa di dokumen halaman ini: dokumen itu memegang sesi admin (token di `sessionStorage`) dan kunci jawaban, dan `import js` Pyodide membuka keduanya (sebelum 29 September 2026 begitulah keadaannya). |
| `verify-export-code.html` | verifikasi HMAC export modul/exam |
| `berkas-tugas.html` | daftar dan unduh berkas FreeCAD tugas pemodelan CAD per modul, dengan status penilaian |
| `analyze-affected.py` | helper analisis file/data lokal; bukan halaman web |

Pada `reset-soal.html`, opsi **semua soal** harus benar-benar mengirim seluruh qId yang valid. Daftar chip-nya baku untuk semua course (modul `mc1`–`mc10` + `c1`–`c15`; exam `tf1`–`tf10` + `mc1`–`mc20` + `c1`–`c15`, Opto UTS `ce`/`ch`), sehingga untuk Pemodelan CAD daftar itu memuat qId yang tidak ada (`c6`–`c15` modul; `tf*` dan `c12`–`c15` ujian). Semua qId CAD yang nyata tetap tercakup, dan qId yang tidak ada dilaporkan tidak ditemukan tanpa efek. Untuk exam, reset harus menghapus attempt, marker, selection/code, dan mengurangi delta poin yang bersangkutan tanpa merusak soal lain.

---

## 12. Dokumen OBE

Setiap `OBE/Penilaian-OBE.htm` menggabungkan dua mode:

- **Silabus:** dapat dibaca tanpa login; memuat bobot asesmen, relasi CPL/CPMK/Sub-CPMK, matrikulasi, dan deskripsi.
- **Penilaian:** memerlukan login mahasiswa atau dosen.

### 12.1 Dosen

Dosen dapat:

- mengisi atau mengimpor PRE dan nilai Sub-CPMK;
- mengedit mapping modul 1–14 dan soal exam 1–45 ke Sub-CPMK (Pemodelan CAD hanya memakai posisi 1–30 untuk UTS dan 1–31 untuk UAS, §7.5);
- menarik performa sistem melalui `computeObeScores`;
- meninjau hasil dalam draft lokal;
- mempublikasikan nilai melalui `publishObeNilai`;
- menghapus nilai terpublikasi tanpa menghapus draft lokal.

Draft nilai dan override PRE masih disimpan di localStorage browser. Draft tersebut tidak otomatis sinkron lintas perangkat.

Mapping Tugas/UTS/UAS memakai:

- cache per course `obe-mapping-<courseId>-v3` (dengan fallback migrasi satu kali dari key versi lama per course);
- Firestore `obeMappings/<courseId>` melalui `getObeMapping` dan `saveObeMapping` untuk konsistensi lintas perangkat;
- validasi rentang: modul 1–14, UTS/UAS 1–45.

Saat “Tarik & Hitung” dijalankan, hasil menimpa draft nilai lokal pada tab TGS/UTS/UAS. Publish tetap merupakan tindakan terpisah.

### 12.2 Mahasiswa

- Login memakai NIM dan PIN global.
- `getMyObeNilai` hanya mengembalikan dokumen mahasiswa tersebut.
- Tampilan read-only dan hanya memuat satu baris mahasiswa.
- Mapping boleh dilihat tetapi tidak diedit.
- Jika dosen belum publish, halaman menyatakan nilai belum tersedia.

### 12.3 Perhitungan

Bobot TGS/UTS/UAS **tidak tetap 60/20/20 untuk semua course** (sempat jadi
bug — lihat catatan di bawah). Tiap course punya `FORMS.TGS.total`,
`FORMS.UTS.total`, `FORMS.UAS.total` sendiri di `Penilaian-OBE.htm`
masing-masing, ditampilkan sebagai badge `wTGS`/`wUTS`/`wUAS` dan catatan
`totalFormulaNote` pada tab Penilaian:

```text
Nilai akhir = (TGS_total/100)×TGS + (UTS_total/100)×UTS + (UAS_total/100)×UAS
```

Bobot saat ini per course: Getaran Mekanik 51/25/24, Matematika 4 39/31/30,
Optimalisasi & Otomasi 60/20/20, Sistem Kendali Cerdas 48/22/30, Teknik Tenaga
Listrik 43/25/32, Pemodelan CAD 55/22/23. Cek `FORMS` di `Penilaian-OBE.htm` course
terkait untuk angka yang berlaku — jangan asumsikan 60/20/20 berlaku umum.

> **Riwayat:** sampai Agustus 2026, `Penilaian-OBE.htm` Getaran Mekanik dan
> Matematika 4 salah memakai formula tetap `0,6×TGS + 0,2×UTS + 0,2×UAS`
> (bobot milik Optimalisasi & Otomasi, tertinggal saat template disalin),
> sehingga NA yang dipublikasikan untuk kedua course itu tidak sesuai bobot
> resminya. Sudah diperbaiki dengan menurunkan formula dari `FORMS` secara
> dinamis di ketiga file, supaya tidak berulang.

Nilai tiap komponen dihitung dari nilai Sub-CPMK dan bobot pada course bersangkutan. PRE ditampilkan dan dapat dipublish, tetapi tidak termasuk rumus di atas.

Mapping OBE frontend, `OBE_EXAM_CONFIG`, `OBE_ORDER`, dan asesmen JSON harus tetap sinkron. Setelah mapping atau bobot exam berubah, jalankan recompute sebelum mengandalkan total lama.

---

## 13. Export dan kode verifikasi

`generateExportCode` membuat HMAC-SHA256 dari secret server dan field identitas export. Kode ditampilkan dalam tiga grup empat karakter.

Aturan:

- secret tidak boleh berada di HTML atau Git;
- poin exam dinormalisasi maksimal dua desimal sebelum ditandatangani;
- waktu dan field yang ditampilkan harus sama persis dengan data yang ditandatangani;
- perubahan ID, NIM, poin, atau waktu membuat verifikasi gagal;
- mengganti `EXPORT_CODE_SECRET_VALUE` membuat kode lama tidak lagi valid;
- verifikasi export bukan pengganti ledger nilai server.

Saat ada perbedaan antara file export dan sistem, gunakan ledger server dan alat verifikasi sebagai bukti, bukan HTML lokal saja.

---

## 14. Keamanan publik

Wajib dipertahankan:

- tidak ada password admin, hash admin lama, service account, HMAC secret, kunci jawaban, seed, atau bank soal (UTS maupun UAS) di repo publik;
- kunci modul dan exam hanya di Firestore/server;
- teks komputasi parametrik Sisken Modul 1–14 tidak boleh kembali ditulis statis ke HTML publik; setiap halaman hanya boleh memiliki wadah terkunci dan merender response `getModulQuestions` dengan `textContent`;
- markup opsi PG Sisken tidak boleh kembali membawa argumen huruf kanonik pada `selectMC`; penjaganya ada di `validate-sisken-modules.mjs`;
- UAS tidak boleh kembali mempunyai array statis `UAS_TF`, `UAS_MC`, `UAS_COMP_EZ`, atau `UAS_COMP_HARD` di HTML;
- UTS juga tidak boleh kembali mempunyai array statis `UTS_TF`, `UTS_MC`, `UTS_COMP_EZ`, atau `UTS_COMP_HARD` di HTML, termasuk helper `_svg`/`_diagram` yang menyertainya;
- semua operasi admin memakai Firebase Auth custom token dan claim admin;
- update RTDB dari client harus sparse dan tidak boleh menulis ulang field server-owned dari snapshot basi;
- jawaban mahasiswa (pilihan PG/benar-salah, kode, ringkasan berkas) tidak boleh kembali dibaca dari atau ditulis ke `visitors/`, yang terbaca publik — juga tidak sebagai cadangan saat `getJawabanSaya` gagal; halaman memulihkannya lewat `getJawabanSaya`, identitas localStorage tidak menyimpannya dan tidak menyalin peran/nama/NIM dari record (§6.3, §9.1) — `validate-public-security.mjs` menegakkannya;
- kode yang ditulis mahasiswa tidak boleh dijalankan di dokumen yang memegang sesi admin atau kunci jawaban (`Admin/analyze-victims.html` memakai kotak pasir, §11.2);
- user input harus di-escape ketika masuk ke export, chat, atau HTML dinamis;
- Pages workflow harus menolak artefak sensitif sebelum deploy;
- node RTDB `pins/` tidak boleh dibuka kembali untuk dibaca klien (lihat §4.3);
- seed **menolak** menulis kunci bank yang masih placeholder ke Firestore. `seed-firestore.js` mendeteksi status placeholder dari teks bank dan membatalkan live seed dengan pesan jelas; pelolos `--allow-placeholder` hanya untuk keadaan yang disengaja. Ini menutup jalur yang dulu membuat `--all-exam` menuliskan kunci dummy `sisken-uas` ke produksi tanpa gejala.
- basis pengetahuan tutor tetap di backend privat dan hanya dibangun dari sumber allowlist §6.8; validator harus menolak marker kunci, bank soal, kredensial, atau data pribadi;
- frontend tidak boleh menerima kutipan internal retrieval, system prompt, nama provider/model, endpoint, atau secret; respons hanya membawa jawaban, URL sumber resmi, metadata sitasi minimum, dan status kasar;

### 14.1 Kunci exam lama bocor di riwayat Git (tidak dapat ditarik kembali)

Repo frontend bersifat publik dan **riwayatnya tetap publik** meski berkasnya sudah dihapus. Commit sekitar April–20 Mei 2026 pernah meng-*embed* `correctIdx` + `explain` di HTML exam. Perbandingan teks eksak terhadap bank server menemukan **54 soal MC/TF yang kuncinya bocor DAN masih dipakai** (UTS Getaran 17, Math 18, Opto 19; UAS ketiganya 0 karena soalnya sudah ditulis ulang; Sisken 0 karena lahir server-side).

Aturan yang mengikuti dari kejadian itu:

- menulis ulang riwayat Git **tidak** menyembuhkan kebocoran — salinan publik sudah dapat di-*clone*/*fork*/ter-*cache*. Perbaikan yang benar adalah **rotasi soal**, bukan menghapus jejak;
- ke-54 soal itu **sudah dirotasi** (soal dan jawabannya diganti, lalu di-seed ulang), sehingga kunci di riwayat tidak lagi memetakan ke ujian yang berjalan;
- karena itu jangan pernah menaruh kunci, `correctIdx`, `explain`, `expected`, atau `tolerance` di repo publik meski "sementara" — satu commit sudah cukup untuk membocorkannya permanen.

Teks soal UTS **tidak lagi publik**. Batasan arsitektur yang dulu dicatat di sini sudah ditutup: bank soal ketiga UTS dipindahkan ke repo backend dan dilayani `getExamQuestions` di balik gerbang yang sama dengan UAS. Halaman UTS mengisi `window.UTS_TF/MC/COMP_EZ/COMP_HARD` lewat `_ensureUTSQuestionsLoaded()` setelah login berhasil.

**Naskah ujian resmi (format BOP) juga tidak boleh ada di repo ini.** Berkas `<Mata-Kuliah>/Exam/UTS_*.pdf`, `UAS_*.docx`, dan `Unduhan-Gabungan/Exam-Gabungan-*.pdf` dulu tersimpan di sini dan dapat diunduh siapa pun tanpa autentikasi — `deploy-slides.yml` menyalin `<course>/` utuh dan seluruh `Unduhan-Gabungan/`, sedangkan repositori ini sendiri publik. Dokumen itu berkepala "SOAL INI BERSIFAT RAHASIA — HARUS DIKEMBALIKAN". Semuanya sudah dipindahkan ke `naskah-ujian/` di repo backend, dan `validate-public-security.mjs` menolak build bila muncul kembali. Yang tetap publik hanya `Modul-Gabungan-*.pdf` dan `RPS-*.pdf`; `gabung-pdf-modul.py` tidak lagi merakit Exam-Gabungan.

Bank yang **benar-benar dilayani** (dipasang di `QUESTION_BANKS` backend) adalah `functions/exams/uts-<course>-v2.js` — bukan `uts-<course>-bank.js`. Sejak penyatuan bank+kunci teks (satu `build(N)` untuk teks dan kunci), `uts-<course>-bank.js` lama masih ada tapi hanya sebagai sumber helper SVG/`shuffleSeed` yang dipakai `v2.js`, dan sebagai pembanding di `scripts/verify-uts-unified.js`. Jalur kunci penilaian tidak berubah: tetap `functions/seed/uts-<course>-answers.js`, ter-seed ke Firestore.

Konsekuensi yang perlu diketahui saat memelihara UTS:

- teks soal, opsi, hint, dan diagram dirender di server memakai `N` mahasiswa; client menerima data jadi, bukan fungsi `compute()`. Setiap konsumen memakai `const data = q;` — jangan menghidupkan kembali `q.compute(N)` di client;
- **invarian penilaian**: urutan opsi MC dihasilkan `shuffleSeed(opts, seed)` di `uts-<course>-v2.js` (bank yang benar-benar dilayani), sedangkan `correctIdx` yang sudah ter-seed di Firestore dihitung dengan shuffle yang sama di `functions/seed/uts-<course>-answers.js`. Bila salah satu implementasi berubah, jawaban benar akan dinilai salah tanpa gejala. Penjaganya `scripts/verify-uts-bank.js` — jalankan manual lewat `node scripts/verify-uts-bank.js [examId ...]`, **BUKAN** cuma `npm --prefix functions run lint`: lint hanya menjalankan `node --check` (pemeriksaan sintaks) atas berkas ini, tidak mengeksekusi perbandingannya. `npm test` juga tidak memanggilnya (lihat §17.2). Jalankan skrip ini secara eksplisit setelah mengubah bank atau kunci UTS;
- migrasi ke `v2.js` sudah dibuktikan tidak mengubah output yang dikirim ke client: `scripts/verify-uts-unified.js` (juga manual-only, sama seperti di atas) membandingkan tampilan+kunci+metadata `v2.js` vs `bank.js` lama untuk N=0..99.

---

## 15. Template Modul Word dan PPT

Artefak BOP harus dimulai dari file resmi di `Template-Modul-Word-dan-PPT/`:

- `Template modul - kurikulum 2025.docx`;
- `Template Modul - Kurikulum 2025.pptx`;
- `PANDUAN PENULISAN MODUL - KURIKULUM 2025.pdf`;
- `SE Modul Bahan Ajar TA 2025-2026.pdf`.

Ketentuan ringkas:

- jangan menimpa template asli;
- pertahankan struktur cover, header/footer, heading, dan identitas institusi;
- Word minimal 10 halaman isi di luar cover dan daftar pustaka;
- PPT minimal 10 slide isi di luar cover dan slide penutup;
- isi Word dan PPT harus konsisten dengan Sub-CPMK dan materi modul HTML;
- daftar pustaka memakai APA, referensi mutakhir, minimal 5 jurnal internasional dengan link;
- verifikasi hasil render, bukan hanya struktur XML/shape.

Pedoman teknis pembuatan slide Slidev berada terpisah di `Pedoman-Slides.md`.

---

## 16. Prosedur perubahan

### 16.1 Mengubah satu modul

1. Tentukan course, nomor file `N`, dan pertemuan `P`.
2. Salin hanya dari modul yang strukturnya paling dekat.
3. Ubah seluruh identitas, path, localStorage key, roster URL, konten, Sub-CPMK, animasi, filename export, dan judul.
4. Pastikan 25 soal (Pemodelan CAD: 15 soal) dan bobot 50 poin tetap konsisten, kecuali perubahan desain memang disetujui.
5. Perbarui seed `modulAnswers`, `MODUL_CONFIG`, dan validator backend jika ID/struktur berubah.
6. Uji preview, mahasiswa, dosen, refresh, late, export, Forum, chat, dan reset.

### 16.2 Mengubah exam

1. Pertahankan `examId`, DB path, schedule path, `OBE_ORDER`, dan seed dalam satu perubahan atomik.
2. Jika soal berubah, perbarui teks, kunci/toleransi, mapping Sub-CPMK, dan qId reset. `EXAM_QID_POINTS` **dibangkitkan**, bukan disunting: jalankan `node scripts/bangkitkan-poin-soal-exam.js` di backend setiap kali `OBE_EXAM_CONFIG` atau `OBE_ORDER` berubah.
3. Teks soal hanya di backend: UAS di bank `uas-v2.js` (Getaran, Math4, Opto) atau `functions/exams/uas-<course>-v2.js` (Sisken, Teknik Tenaga Listrik, Pemodelan CAD), UTS di `functions/exams/uts-<course>-v2.js` (yang benar-benar dilayani `QUESTION_BANKS`; `uts-<course>-bank.js` cuma sumber helper lama, bukan jalur serving — lihat §14). Jangan menambah bank statis ke HTML. Untuk UTS, jaga `shuffleSeed` di bank identik dengan yang di berkas kunci — jalankan manual `node scripts/verify-uts-bank.js` (bukan `npm run lint`, yang cuma syntax-check). Saat menambah atau menulis ulang soal MC, pastikan seed pengocokannya berbeda tiap soal (lihat §7); penjaganya ada di `verify-sisken-uas.js`.
4. Ubah nama berkas ekspor jawaban agar menyebut mata kuliahnya (`UTS_<MataKuliah>_<nim>.html`). Halaman exam lazim disalin dari course lain, dan nama ini ikut tersalin tanpa gejala apa pun sampai mahasiswa mengunduh berkasnya — halaman Sisken sempat menghasilkan `UTS_GetaranMekanik_<nim>.html`.
5. Verifikasi `deriveN()` dan contoh NIM termasuk suffix `00`.
6. Jalankan seed dry-run sebelum live seed.
7. Uji nilai benar/salah/partial, refresh, scoreDeltas, export, late window, cutoff, dan reset satu soal.

### 16.3 Mengubah OBE

1. Cocokkan asesmen JSON, `FORMS`, `DEFAULT_MAPPING`, `OBE_EXAM_CONFIG`, dan `OBE_ORDER`.
2. Validasi setiap nomor modul/soal tepat rentang dan tidak hilang tanpa keputusan eksplisit.
3. Simpan mapping server, lalu tarik dan hitung ulang draft.
4. Tinjau nilai beberapa NIM secara manual sebelum publish.
5. Recompute exam jika perubahan memengaruhi poin resmi yang sudah tersimpan.

### 16.4 Git dan rilis

- Kerjakan pada branch bernama singkat, deskriptif kebab-case (mis. `exam-window-rules`, `fix-obe-final-grade-weights`). Prefiks `Codex/<fitur>` masih kadang dipakai tapi bukan konvensi dominan pada PR terbaru.
- Stage hanya file yang termasuk scope; jangan mengambil perubahan lokal lain.
- Jalankan validasi sebelum commit.
- Buka Pull Request dari branch fitur ke `main`, tunggu CI (`security-validation.yml`) hijau, lalu squash-merge (`gh pr merge --squash` atau tombol "Squash and merge") — ini jalur mayoritas saat ini. Jangan meninggalkan perubahan yang sudah fix hanya di branch.
- Frontend akan memicu Pages otomatis setelah masuk `main`.
- Jika backend berubah, jalankan deployment Firebase manual yang relevan setelah merge backend.

---

## 17. Validasi wajib

### 17.1 Frontend publik

Dari root `Mechanical-Engineering-Courses`:

```powershell
node scripts/validate-public-security.mjs
node scripts/validate-all-course-score-panels.mjs
node scripts/validate-sisken-modules.mjs
node scripts/validate-sisken-forum.mjs
node scripts/validate-sisken-export-html.mjs
node scripts/validate-all-course-modern-design.mjs
git diff --check
```

`validate-public-security.mjs` memindai seluruh HTML dalam allowlist Pages pada keenam course (`courseRoots`) serta `Admin/`. Ia menjaga artefak sensitif, sintaks inline script, 108 halaman berautentikasi admin (96 Modul/Exam + 6 OBE + 6 Admin), gate dan friction exam, WIB, preview modul, reset, presence, format poin, pemulihan `scoreDeltas`, serta keamanan publikasi. Sejak 26 September 2026 ia juga menagih Asisten mahasiswa di ke-12 UTS/UAS: penanda dan kode `buka-asisten-ujian.mjs`, CSS penyembunyi roster di `<head>`, `#fabCount`/`#vpBadge`/`#vpList` hanya diisi jalur dosen `renderVisitors` (cabang mahasiswa hanya mengosongkan lalu `return`), serta larangan `.vp-chat`/`#vpChatList`/`#vpChatInput`/`sendChat` di luar blok AI. Ia juga menolak blok AI ujian yang belum memuat mode mahasiswa (blok dari checkout backend yang lebih tua, §6.8), `LK` lapisan friksi yang berbeda dari `LOCAL_IDENTITY` halaman (§8), formulir login yang tidak dibersihkan setelah login (§4.3), serta CSS panel mahasiswa yang tertutup (di luar urutan Tab) dan kepala kartu komputasi yang membungkus di layar ≤600px. Ia juga menagih gerbang data kelas `privasi-hasil-ujian.mjs` di ke-12 UTS/UAS (§7.8): penanda `PRIVASI-HASIL-UJIAN`, `_applyRoleVisibility` yang mengambil `isDosen` dari `_dosenUjianTerverifikasi` (tanpa aturan dosen kedua) dan diakhiri render ulang `_segarkanHasilUjian()`, `enterPreviewMode` yang memanggil `_segarkanHasilUjian()` tepat sesudah `window._previewMode = true` (blok `PRIVASI-HASIL-UJIAN:PREVIEW` tanpa pernyataan lain), gerbang `renderVisitors` tepat sesudah cabang mahasiswa dan sebelum setiap tulisan data kelas (`#fabCount`, `updateLeaderboard`, `#vpBadge`, `#vpList`, tabel dari `masterStudents`), gerbang di baris pertama `updateLeaderboard`, dan fungsi pembantu yang hanya menggerbang/mengosongkan (tidak membaca `masterStudents`/`onlinePresence`). Selain pemeriksaan teks, ia memuat `renderVisitors`, `updateLeaderboard`, dan kedua blok pembantu halaman ke sandbox `node:vm` dengan DOM tiruan lalu menjalankan tamu, Mode Preview (juga dengan identitas dosen tersimpan), identitas `dosen` bernama lain, tamu→login dosen (`_segarkanHasilUjian`), dosen, dosen→Mode Preview (blok `PRIVASI-HASIL-UJIAN:PREVIEW` halaman itu sendiri, tanpa event RTDB baru), logout paksa, dan mahasiswa — gagal bila nama/NIM teman sampai ke DOM selain untuk dosen, atau bila tampilan dosen kehilangan tabel, papan, statistik, atau daftar online. Sejak lanjutannya (26 September 2026) ia juga menolak perbandingan nama dosen di luar `_dosenUjianTerverifikasi` (auto-login jadwal, tinjauan soal), menuntut `_previewGuard`/`_previewExportGuard` tetap berbasis role, menuntut gerbang wadah soal (`_update…AccessGate`) dan permintaan soal mode dosen (`_ensure…QuestionsLoaded`) mengambil `isDosen`/`isDosenNow` dari aturan tunggal (blok `GERBANG-SOAL`/`MUAT-SOAL`) dan menolak variabel `isDosen…` lain yang diambil dari `role === 'dosen'` saja, menjalankan blok `AUTOLOGIN`, `PEMILIH`, `SOAL-DOSEN`, `GERBANG-SOAL`, dan `MUAT-SOAL` halaman itu untuk sembilan identitas — dosen asli (juga dengan nama berhuruf kapital), mahasiswa, mahasiswa format lama tanpa role, `{nama:'Dedik Romahadi'}` tanpa role, identitas tanpa role yang ber-NIM (diperlakukan mahasiswa), `{role:'dosen'}` rekaan bernama lain atau ber-NIM mahasiswa, dan nama dosen ber-role mahasiswa tanpa NIM — menolak `_scheduleExpired` serta panggilan `updateLeaderboard` selain dari `renderVisitors`, menjalankan render ulang `fetchMasterStudents` halaman itu dengan jadwal yang sudah berakhir (statistik harus 5/2/3), memeriksa ajakan placeholder tamu dan Mode Preview (beserta tombol "Keluar Preview" di banner; DOM tiruannya membentuk anak `#visitorTableBody` dari `innerHTML`, sehingga pemeriksaan "kartu sudah terpasang" ikut teruji: kartu tamu harus diganti begitu masuk Mode Preview dan tidak ditulis ulang pada render berikutnya dalam konteks yang sama), dan menuntut label navbar ke-12 halaman ujian sama dengan label ke-14 modul course-nya (tanpa `GETARANMESIN` di luar Getaran Mekanik). Di ke-84 halaman modul ia menolak `_scheduleExpired` dan panggilan `updateLeaderboard` selain dari tingkat teratas `renderVisitors` (penanda `LEADERBOARD-MODUL-SEKALI`, `leaderboard-modul-sekali.mjs`). Sejak 27 September 2026 ia juga menolak angka penalti terlambat lama (potongan 30%/20%, `multiplier 0.7`/`0.8`, `_isPastDeadline() ? 0.7`, `×0,7`, `dikali 0,7`/`0,8`) di seluruh halaman course dan `Admin/` (§5.2; perbaiki dengan `penalti-35.mjs`). Sejak 28 September 2026 ia menagih kedua blok `pulihkan-pilihan-pg.mjs` di ke-84 halaman modul (§6.3–§6.4): penanda `PILIHAN-PG-PULIH` tepat sesudah `const data = snap.val();` (sejak v3: sesudah blok `JAWABAN-PRIVAT:GABUNG`) dan `PILIHAN-PG-EKSPOR` di cabang `mcAnswered` perakitan `mcData`, masing-masing tepat sekali; menolak fallback export lama yang menulis jawaban benar sebagai "pilihan salah"; dan menjalankan kedua blok halaman itu di sandbox `node:vm` dengan DOM tiruan — course kanonik (huruf di `onclick`, termasuk indeks angka lama), course acak per NIM (`data-display-letter` sesudah `shuffleMCOptions`), acak yang belum terpasang, record tanpa `selections`, dan pemanggilan ulang `_loadScoredQuestions` — serta keempat kombinasi teks fallback export. Sejak v2 (28 September 2026) ia menguji penjaga `timestamp` course acak: record pada batas `2026-08-09T00:00:00Z` dan sesudahnya ditandai, record sebelum batas (termasuk sedetik sebelumnya), tanpa `timestamp`, atau `timestamp` rusak tidak ditandai, dan record course kanonik tetap ditandai berapa pun `timestamp`-nya. Sejak v3 (29 September 2026) penandanya `PILIHAN-PG-PULIH BEGIN v3` dan fixture-nya memuat `mcOrderVersion` dari ledger: 1 ditandai lewat huruf posisi berapa pun `timestamp`-nya, 0 dicari lewat `data-huruf-asal` (tanpa catatan itu tidak ditandai), course kanonik tetap memakai `onclick`, dan penjaga `timestamp` v2 hanya berlaku untuk mcN tanpa entri. Sejak hari yang sama ia menagih blok `scripts/jawaban-privat.mjs` di ke-96 halaman modul/ujian: penanda `JAWABAN-PRIVAT:JEMBATAN`/`IDENTITAS`/`TUNGGU`/`GABUNG` (+ `HURUF-ASAL` di modul) masing-masing tepat sekali dan di tempatnya (JEMBATAN tepat sebelum `const _generateExportCodeCallable`, TUNGGU/GABUNG di `_loadScoredQuestions` yang sama, GABUNG tepat sesudah `const data = snap.val();` dan sebelum PILIHAN-PG-PULIH atau `_cachedFirebaseData = data;`), jembatan `getJawabanSaya` di luar blok AI dengan `modulId` atau `examId` saja, `saveIdentity` yang menyimpan `_identitasTanpaJawaban(v)` sebagai satu-satunya penyimpan identitas, `update` yang diimpor, serta tidak ada `set()` record visitor selain lewat `_tulisPengunjung` (patch hanya kunjungan + penghapusan `pinHash`/`pinSetAt`, tanpa `set(nodeRef…)` maupun penulis `codes` lama). Blok halaman itu juga dijalankan di `node:vm`: callable ada (dipanggil tepat sekali dengan payload kontrak; hanya field berdaftar-putih yang tergabung, kunci/penjelasan tidak), gagal dan belum ter-deploy, lambat (batas tunggu berlaku, hasil terlambat diterapkan: modul mengulang pemulihan, ujian menggabung ke `_cachedFirebaseData` lalu `_reapply…`), tanpa sesi PIN (baru dipanggil sesudah verifikasi PIN), dosen/tamu, identitas lain (jawaban NIM lain tidak pernah tergabung), akun simulasi, halaman berkas CAD, pembersih identitas localStorage, `_tulisPengunjung` (record baru `set`, record lama `update` hanya field yang berubah), dan — di modul — pemulihan PG terpadu JEMBATAN + HURUF-ASAL + GABUNG + PULIH untuk course acak/kanonik dengan callable ada, gagal, atau belum ter-deploy, sebelum dan sesudah field publik dibersihkan. Sejak perbaikan tinjauan (29 September 2026) penandanya JEMBATAN/IDENTITAS/GABUNG v2 dan ia juga menagih: field publik `selections`/`codes`/`mcOrderVersion` dibuang dalam setiap keadaan (juga callable gagal, tanpa PIN, identitas lain, akun simulasi, dan GABUNG tanpa jembatan), `scoreDelta` ledger menang atas RTDB (0 benar/partial tanpa nilai RTDB → cadangan halaman), batas tunggu bawaan ≤ 2500 ms, kegagalan sementara dicoba lagi (otomatis dan pada `_muatJawabanSaya` berikutnya) dengan coba ulang otomatis yang berhenti sendiri, `resource-exhausted` yang menunggu `remainingSeconds` tanpa memanggil dan tanpa mengakhiri sesi PIN (pemberitahuan `role="status"` "coba lagi dalam N detik"), `unauthenticated` yang membuang hash sesi dan meminta PIN (modul: `_pinFlow` + `_showPinInput`; ujian: `_promptPinReentry`; PIN sudah dihapus: pemberitahuan) tanpa mengulang hash yang sama, kait `_tandaiBerkasDiServer` untuk berkas CAD belum dinilai (plus `berkasDiServer` di tombol dan gerbang kirim halaman CAD), cabang `resource-exhausted` di `_handleModulServerError`/`_handleServerExamError`, identitas ber-NIM mahasiswa berperan `student`, `saveIdentity(_identitasLogin(…, nama, nim))` di alur login (tidak ada `saveIdentity(<record>)`), tanpa `freshRec`, dan `_tulisPengunjung` yang untuk record lama hanya menambal `visitCount`/`lastVisit` (juga untuk record yang diduduki orang lain dengan peran dosen/nama palsu). Uji pewaktunya dipercepat (pewaktu ≥ 1 detik dibagi 100) dan halaman diperiksa 8 sekaligus. Sejak TUNGGU v2 (29 September 2026, §6.3) ia menagih penanda `JAWABAN-PRIVAT:TUNGGU BEGIN v2`/`END v2`, ekor blok yang membuka callback pemulihan (`…then(() => _bacaRekaman(4)).then((snap) => {` + `if (!snap) { …_markLoaded()…; return; }`), tanpa `Promise.all(` di blok, lalu menjalankan blok itu — satu isi untuk ke-96 halaman, sandbox sekali per isi (`periksaTungguPemulihan`) — di `_loadScoredQuestions` tiruan dengan pewaktu dipercepat 100×: record baru dibaca sesudah penantian `getJawabanSaya` selesai (penilaian selama penantian ikut terbaca); penantian yang tidak ada, melempar, menolak, atau berhasil tetap berujung satu bacaan dan satu penerapan; snapshot yang tidak memuat marker benar yang diketahui halaman (`c2_comp`, `mc1`, `tf1`, `ce2_comp`, `ch1_comp`, `c12_comp`, `mc10`) dibaca ulang dengan jeda 500–5000 ms sampai segar; snapshot yang tetap lebih tua → 5 bacaan, tanpa penerapan, `_markLoaded` sekali (juga ragam `window._markLoaded` Matematika 4 Modul-4), satu console.warn; marker salah/partial/kirim ulang bukan penanda umur; record belum ada diterapkan, record hilang padahal marker benar diketahui dilewati; identitas A → B → A tanpa muat ulang tidak pernah dilewati; dan `get()` yang menolak berakhir di `.catch` halaman. Ditambah 15 uji mutasi (`ujiMutasiTunggu`; `TUNGGU_MUTASI=1` mencetak alasannya) pada salinan Pemodelan CAD Modul-2: penanda v1, record dibaca bersamaan dengan penantian, `getJawabanSaya` tidak ditunggu, penantian yang menolak menghentikan pemulihan, tanpa pemeriksaan umur, marker salah ikut menjadi penanda umur, marker benar-salah atau dua digit tidak dikenali, baca ulang tanpa batas atau tanpa jeda, snapshot tua diterapkan sesudah batas, dilewati tanpa `_markLoaded`, tanpa penjaga identitas, identitas bercampur tidak dimatikan, dan record yang hilang dianggap segar. Sejak lanjutannya (28 September 2026) ia menolak warna kanvas yang ditulis sebagai variabel CSS (`addColorStop(…, 'var(--…)')`, `fillStyle`/`strokeStyle`/`shadowColor = 'var(--…)'`) di seluruh halaman: kanvas 2D tidak mengurai `var(--…)`, sehingga `addColorStop` melempar DOMException `SyntaxError` ketika animasi berjalan (Getaran Modul-10 `drawMuRatio` hanya menggambar kisi kosong) dan `fillStyle`/`strokeStyle` diam-diam memakai warna sebelumnya (Getaran Modul-13/14). `node --check` tidak menangkapnya karena hanya memeriksa sintaks JavaScript; pakai hex yang sama dengan variabel CSS-nya. Ia juga menuntut `exportPoints`/`exportNilai` (variabel lokal `exportTugasHtml` dari `generateExportCode`) hanya dibaca di badan `exportTugasHtml`, sesudah deklarasinya, di ke-84 modul dan ke-12 UTS/UAS: Matematika 4 Modul-4 sempat membacanya di `updateScore` (#626), sehingga setiap hasil server PG/komputasi berakhir ReferenceError "exportPoints is not defined", `checkMC` membatalkan kunci optimistik padahal jawaban sudah tercatat, dan panel skor tidak pernah terbarui. Sejak 29 September 2026 ia juga menagih kunci identitas skrip klasik di ke-84 modul (§6.7), dengan pola yang sama seperti `LK` ujian (§8): `MODULE_ID` tepat sekali di skrip module dan mengikuti aturan nomor §3 (Modul 1–7 `pertemuan-N`, Modul 8–14 `pertemuan-(N+1)`, Matematika 4 `modul-N`); `LOCAL_IDENTITY` = `<slug>_identity_<MODULE_ID>`; setiap kunci identitas utuh yang tertulis di skrip inline halaman (di luar baris komentar) sama dengan `LOCAL_IDENTITY` — literal kutip tunggal, ganda, atau backtick (termasuk `'${COURSE_ID}_identity_…'` dalam kutip tunggal yang tidak diinterpolasi), gabungan dua literal (`'<slug>_identity_' + 'pertemuan-12'`), dan templat `${MODULE_ID}`/`${COURSE_ID}` di skrip module; templat ber-`${…}` yang memuat `_identity_` di skrip klasik ditolak; `getIdentityLocal()` dan `_draftKey()` masing-masing dideklarasikan tepat sekali (di skrip klasik) dan tidak ditimpa (`window.getIdentityLocal = …` atau deklarasi kedua; satu-satunya penugasan sah `window._draftKey = _draftKey;`), `getIdentityLocal()` membaca `LOCAL_IDENTITY`, dan `const LK` friksi tepat sekali dan sama (bentuk kunci draft sejak 29 September 2026 ditagih `periksaDraftModul`, di bawah). Uji mutasi bawaan memastikan pemeriksaan itu menolak bentuk yang pernah terjadi (literal lama Optimalisasi Modul 12, `LK` Matematika 4 tanpa interpolasi, `MODULE_ID` tanpa geseran N+1, literal lama Getaran Modul 12, `getIdentityLocal` CAD Modul 1 yang menunjuk modul lain) serta bentuk yang lolos versi pertamanya (pembaca tambahan dengan kunci ber-backtick atau gabungan literal, templat `${MODULE_ID}` di skrip klasik, `window.getIdentityLocal = …`, deklarasi `getIdentityLocal` kedua, `window._draftKey` ditimpa); kasus-kasus baru itu juga menagih alasan penolakannya. Perbaiki dengan `samakan-kunci-identitas.mjs`, yang penjaga hasilnya memakai aturan yang sama dan berhenti (bukan menebak) pada tempat yang belum dikenal. Di luar repo git (salinan untuk uji mutasi) ia tetap memindai seluruh HTML; dulu daftar berkasnya kosong di sana. Sejak 29 September 2026 ia juga menagih pilihan quick check Forum (`simpan-pilihan-poll.mjs`, §6.5) di ke-84 halaman modul: tepat satu blok `PILIHAN-POLL-FORUM` v2 tepat sesudah `<!-- PROGRES-MODUL: akhir -->` dan isinya sama di semua halaman; PROGRES-MODUL yang mengirim event `progres-modul:diterapkan` (ok:true sebagai pernyataan terakhir `terapkanProgres`, sesudah `forumSiap(p)` dan `checkForumReady`; ok:false langsung sesudah `forumGagal(e, d)` saat `getModulProgress` gagal); `pilihanPoll` dan `saveModulPoll` hanya di blok itu, dengan tepat satu panggilan `saveModulPoll` di `kirim()` (payload tepat, tanpa `jawaban`, dijaga `bisaPoll`, galat apa pun menghentikan sesi); `saveModulForum` tidak disebut sama sekali di luar PROGRES-MODUL (juga tidak di blok itu) dan di dalamnya hanya dari `simpanForum` dengan `d.jawaban = j`; dan `bisaPoll` ditetapkan ulang dari setiap respons `getModulProgress`. Blok itu juga dijalankan di sandbox `node:vm` dengan DOM tiruan: backend lama (nol panggilan), backend baru (satu `saveModulPoll` per pilihan, payload tepat `modulId`/`nim`/`pinHash`/`pilihanPoll`, tidak pernah `saveModulForum`), klik sebelum respons progres (diantre), pemulihan dari server (server menang) dan localStorage lewat `voteForum` halaman tanpa menjadwalkan simpan teks forum, unggah pilihan lokal sekali (event berulang tidak mengunggah lagi), rilis miring (`forumPoll` sudah ada tetapi `saveModulPoll` menjawab `NOT_FOUND`: satu percobaan lalu berhenti, diunggah pada muat berikutnya), rollback di tengah sesi (respons tanpa `forumPoll` mematikan panggilan), respons tanpa `forumPoll` yang tidak dianggap tersimpan, reset dosen (kunci terkonfirmasi yang hilang dari server tidak dipulihkan/diunggah; backend lama/gagal tetap memulihkan dari localStorage), bentuk localStorage v1, ok:false lalu ok:true, galat PIN, Mode Preview (inert), dosen (hanya DOM), serta tombol Copy Forum: aktif dengan catatan lembut bila `forumSelesai` + teks lengkap + poll kosong + peramban belum pernah melihat forum belum selesai, tetap ditahan pada pengiriman pertama **dan** sesudah muat ulang yang menyusul simpan otomatis, dan aturan kata tetap berlaku (§6.7). Sejak 29 September 2026 ia juga menjaga flag render di ke-12 halaman UTS/UAS (`periksaFlagRender`; baris komentar `//` diabaikan): `renderUTSQuestions()`/`renderUASQuestions()` yang langsung diikuti pemasangan `_utsRenderedFlag`/`_uasRenderedFlag` (spasi dan pindah baris bebas, juga `?.()`, dengan atau tanpa `window.`) ditolak di luar `_ensure…QuestionsLoaded`; flag itu hanya boleh diberi nilai selain `false` di dalam `render…Questions` atau `_ensure…QuestionsLoaded`, minimal sekali (menangkap juga flag sesudah `try/catch` atau dipisah komentar); dan loader wajib memanggil renderer. Bentuk pemasangan flag di loader tidak dikunci (boleh bersyarat). Renderer return dini selama soal belum dimuat, sehingga flag yang dipasang di tempat lain menahan `getExamQuestions` bagi mahasiswa yang kembali dengan identitas tersimpan (§7.9; perbaiki dengan `muat-soal-uts.mjs`). Tuntutan loader tinjauan soal dosen kini `await window._ensureUTSQuestionsLoaded()` di UTS, sama seperti UAS; dulu cukup teks `window.renderUTSQuestions()`, yang juga ada di dalam loader. Sejak 29 September 2026 ia juga menagih deklarasi keadaan Chat Kelas/presence di ke-96 halaman modul/ujian (§6.5–§6.6, `deklarasi-chat-modul.mjs`): setiap `onlineUsers`, `chatMessages`, `_lastSentAt`, dan `onlinePresence` yang dipakai sebuah `<script type="module">` harus punya tepat satu deklarasi `let`/`var` di tingkat teratas skrip ITU, sebelum pemakaian pertamanya — deklarator sesudah koma (`let a = [], b = [];`), destrukturisasi, dan indentasi dihitung; bukan `const` (listener menugasinya ulang → TypeError), bukan di skrip module lain (→ ReferenceError), bukan di dalam fungsi, komentar, atau string, dan bukan hanya di skrip klasik atau `window.X` (berjalan, tetapi ditolak sebagai aturan rumah §6.5 dengan pesan tersendiri yang tidak mengklaim ReferenceError); handler `on…="F(…)"` di HTML statis yang memanggil fungsi tingkat teratas skrip module harus punya `window.F` di luar blok AI-CHAT-AGENT; dan di ke-84 modul skrip module chat memanggil `initChat();` di tingkat teratasnya serta tidak memasang presence identitas tersimpan dua kali (timer init sequence **dan** auto-login `_handleScheduleReady` sekaligus). Getaran Mekanik Modul-4 melanggar ketiga aturan pertama sejak unggahan manual 28 April 2026 tanpa satu pemeriksaan pun gagal, karena `node --check` hanya memeriksa sintaks sedangkan penugasan ke pengenal tak terdeklarasi baru melempar ReferenceError saat snapshot presence/chat tiba. Pemindaiannya memakai `scripts/pemindai-deklarasi.mjs`, pemindai yang sama dengan injector `deklarasi-chat-modul.mjs`, jadi keduanya sepakat soal "sudah dideklarasikan": komentar, string, templat, dan regex dikosongkan lebih dulu (skrip yang kurungnya tidak seimbang sesudah itu ditolak, supaya pemeriksaan tidak melemah diam-diam), dan aturan ini diuji mutasi di validator itu sendiri pada Getaran Modul-3 dan UTS Getaran sebelum halaman dipindai: tiap deklarasi dibuang, `const` (juga pada deklarator kedua), deklarasi ganda, deklarasi di komentar/string/fungsi/skrip module lain/hanya skrip klasik/sesudah pemakaian, ekspor `window.sendChat`/`onChatKey` dibuang atau `window.onChatInput` hanya ada di blok AI, `initChat();` dibuang atau hanya di dalam fungsi, presence ganda (auto-login + timer), dan `let onlinePresence` ujian dibuang — masing-masing harus tertangkap, sedangkan `var`, deklarasi ber-indentasi, beberapa deklarator (satu baris dan lintas baris), destrukturisasi larik/objek, dan presence hanya lewat auto-login lolos. Sejak angka bacaan CAD (29 September 2026) penanda JEMBATAN-nya v3 dan ia menagih: `angka` respons hanya tergabung ke `data.angka` di halaman bertugas berkas (entri `comp`, number berhingga, qId `cN`; course lain tanpa kunci `angka`) beserta status ledger-nya ke `data.angkaStatus` (hanya untuk qId yang angkanya tergabung), `angka`/`angkaStatus` record publik selalu dibuang (juga saat callable gagal), angka dan statusnya dari hasil terlambat ikut digabung ke `_cachedFirebaseData` ujian, dan blok `JAWABAN-PRIVAT:ANGKA-CAD` tepat sekali di ke-16 halaman CAD (dilarang di halaman lain) — modul tepat sesudah `_markLoaded();` pemulihan di `_loadScoredQuestions` yang sama dengan GABUNG, ujian tepat sebelum `updateScore();` penutup `_apply<UTS|UAS>VisualState` — dengan `_ringkasTugasCad` yang menulis "Angka bacaan: " dari kolom itu, lalu menjalankan bloknya di sandbox `node:vm` bersama `_parseNilai` halaman (tugas final diisi dan dikunci dengan bingkai sesuai status — di modul hanya bila `data.angkaStatus` tugas itu `correct`, sehingga respons yang lebih tua daripada marker `_comp` dan jembatan tanpa status tidak menimpa kolom; ujian satu kesempatan tidak memakai status —, ketikan bernilai sama dipertahankan, kartu modul kirim ulang hanya diisi bila kosong, tanpa marker/kolom/nilai sah/`data.angka` tidak berubah, `data` tidak diubah, idempoten). Sejak JEMBATAN v4 (29 September 2026) penandanya v4 dan `periksaGabungMarker` menjalankan `_gabungJawabanSaya` ke-96 halaman di sandbox `node:vm` dengan respons ledger basi terhadap marker RTDB segar: entri yang statusnya tidak cocok dengan marker soal itu (`qId`/`qId_comp` = correct, `_comp_partial` = partial, `_mc_used`/`_tf_used`/`_comp_used`/`_comp_ulang` = wrong; juga entri tanpa status) tidak boleh memberi `scoreDeltas`, pilihan, `mcOrderVersion`, kode, `angka`, maupun `angkaStatus` (poin tetap dari `scoreDeltas` RTDB), sedangkan entri yang cocok (termasuk `scoreDelta` ledger yang berbeda dari RTDB sesudah rescale) dan soal tanpa marker (juga berakhiran tak dikenal) tetap dari ledger — diuji langsung, digabung dua kali, dan lewat hasil terlambat (modul: pemulihan diulang; ujian: `_cachedFirebaseData`), dengan `scoreDeltas` diperiksa lebih dulu. Uji ini gagal di ke-96 halaman `main` (JEMBATAN v2) maupun cabang angka bacaan sebelum perbaikan (v3), tempat skor tugas CAD yang dikirim ulang benar kembali 0 saat hasil `getJawabanSaya` terlambat (§6.3). Sejak JEMBATAN v5 (tinjauan v4, hari yang sama) penandanya v5 dan uji yang sama juga menagih ringkasan berkas yang belum dinilai. Untuk soal bermarker (`c10_comp`, `c13_comp_ulang`) atau yang sudah dikirim di sesi ini (`compAnswered` di sandbox, soal tanpa marker), ringkasan itu tidak boleh masuk `codes` dan `_tandaiBerkasDiServer` tidak boleh dipanggil. Soal tanpa marker yang belum dikirim (juga `compAnswered` false) dan soal berakhiran tak dikenal tetap masuk dan ditandai. Kasus ini diuji langsung, digabung dua kali, dan lewat hasil terlambat; uji gagal di ke-96 halaman v4. Karena JEMBATAN (skrip module) membaca `compAnswered` halaman, ke-16 halaman CAD juga wajib memuat `let compAnswered = {}, compScores = {};` tepat sekali di tingkat atas skrip klasik. Jumlah halaman autentikasi (108), halaman ujian ber-Asisten (12), halaman ujian bergerbang data kelas (12), halaman ujian berlabel navbar course (12), halaman modul/ujian dengan kode ekspor lokal (96), halaman modul/ujian yang memulihkan jawaban lewat `getJawabanSaya` (96), halaman CAD yang memulihkan angka bacaan (16), halaman modul yang kunci identitas klasiknya diperiksa (84), dan halaman modul/ujian yang diperiksa deklarasi chat/presence-nya (96, di antaranya 84 modul ber-Chat Kelas) dipatok di validator; perbarui bersama bila inventaris berubah.

Skrip penyuntik lintas halaman (semua idempoten lewat penanda; jalankan `--periksa` dulu) yang wajib dijalankan ulang setelah regenerasi modul: `tambah-efek-memuat.mjs`, `tambah-efek-jawaban.mjs`, `ubah-friction.mjs` (sejak 26 September 2026 juga menyamakan `LK` lapisan friksi exam dengan `LOCAL_IDENTITY`, §8), `kecualikan-akun-simulasi.mjs`, `kunci-lapisan-animasi-login.mjs`, `tambah-progres-modul.mjs` (modul saja; v2 29 September 2026 mengirim event `progres-modul:diterapkan` untuk blok `PILIHAN-POLL-FORUM`; sub-blok `PENJAGA-FORUM` v2 juga `progres-modul:forum-tersimpan` untuk blok `DRAFT-MODUL:PENJAGA`), `draft-modul.mjs` (84 modul; paling akhir, lihat paragraf draft materi di bawah), `perkuat-pembagian-kelompok.mjs` (tab Pembagian Kelompok di Modul 1 setiap course; penanda `KELOMPOK-TANGGUH`), `buka-asisten-ujian.mjs` (12 halaman UTS/UAS saja; penanda `ASISTEN-UJIAN-MAHASISWA`; ditambahkan 26 September 2026 — `#visitorFab` menjadi tombol Asisten Dosen bagi mahasiswa sementara roster online tetap khusus dosen, lihat §6.8 dan §7.8; v2 menambah pembersih formulir login §4.3, panel tertutup di luar urutan Tab, dan kepala kartu komputasi yang membungkus di ponsel agar halaman tidak lebih lebar dari layar; UTS/UAS CAD yang dibangun ulang `bangun.py` mewarisinya dari kerangka TTL, jadi `--periksa` sesudahnya harus 0), dan `privasi-hasil-ujian.mjs` (12 halaman UTS/UAS saja; penanda `PRIVASI-HASIL-UJIAN`; ditambahkan 26 September 2026 dalam PR terpisah — tabel kelas tab Hasil, papan Top Skor/Top Akses, statistik kelas, dan daftar online hanya dirender untuk dosen terverifikasi, sedangkan tamu dan Mode Preview mendapat placeholder, lihat §4.2 dan §7.8; sebelas sisipan: `JS`, `PERAN`, `PREVIEW` (render ulang begitu Mode Preview dinyalakan), `RENDER`, `LEADERBOARD`, lalu pada lanjutannya `AUTOLOGIN` (auto-login jadwal memakai aturan dosen tunggal; identitas yang bukan dosen terverifikasi maupun mahasiswa ber-NIM tidak dipulihkan), `PEMILIH` (pemilih peran tetap tampil untuk identitas itu), `SOAL-DOSEN` (tinjauan soal dosen), `MASTER` (panggilan `updateLeaderboard` kedua di `fetchMasterStudents` dibuang), `GERBANG-SOAL` (gerbang wadah soal), dan `MUAT-SOAL` (permintaan soal mode dosen); placeholder-nya membedakan ajakan tamu dan Mode Preview; jalankan **sesudah** `buka-asisten-ujian.mjs` karena memakai `_kosongkanRosterUjian` dan menyisip sesudah penanda `ASISTEN-UJIAN-MAHASISWA:JS END`/`PERAN END`; seperti skrip sebelumnya, UTS/UAS CAD yang dibangun ulang `bangun.py` mewarisinya dari TTL sehingga `--periksa` sesudahnya harus 0), dan `label-nav-ujian.mjs` (12 halaman UTS/UAS; ditambahkan 26 September 2026 — label `.nav-brand` ujian dibaca dari navbar ke-14 modul course yang sama, misalnya `TENAGALISTRIK // UTS`; UTS/UAS Sisken, TTL, dan CAD sempat berlabel sisa templat `GETARANMESIN // UTS`; jalankan pada TTL sebelum `bangun.py` CAD, yang memetakan `TENAGALISTRIK // <UTS|UAS>` menjadi `PEMODELANCAD // <UTS|UAS>` dan gagal bila kerangkanya masih berlabel lain; `periksa_exam.py` menolak `TENAGALISTRIK`/`GETARANMESIN` di halaman CAD), dan `leaderboard-modul-sekali.mjs` (84 halaman modul; penanda `LEADERBOARD-MODUL-SEKALI`; ditambahkan 26 September 2026 — `fetchMasterStudents` tidak lagi memanggil `updateLeaderboard` kedua kali dengan variabel jadwal-berakhir yang tidak terdefinisi, sehingga statistik Absen tab Hasil modul benar sejak roster dimuat, §7.8; generator TTL/CAD membangun modul dari Modul-1 course-nya sehingga mewarisinya, dan `--periksa` sesudah regenerasi harus 0), dan `penalti-35.mjs` (84 modul, 12 UTS/UAS, dan halaman `Attributes/`; ditambahkan 27 September 2026 — teks penalti terlambat halaman Matematika 4, Getaran Mekanik, dan Optimalisasi & Otomasi beserta halaman Pengantar-nya disamakan dengan Sisken/TTL/CAD: 35%, `multiplier 0.65`, `_getLateMultiplier()` 0.65, §5.2; jangkar teks persis tanpa penanda, lalu menuntut ke-96 halaman memuat bentuk barunya tepat sekali; tidak ada generator yang membawa teks lama, sebab TTL dibangun dari Sisken dan CAD dari TTL), dan `pulihkan-pilihan-pg.mjs` (84 halaman modul; penanda `PILIHAN-PG-PULIH` dan `PILIHAN-PG-EKSPOR`; ditambahkan 28 September 2026 — pilihan PG dipulihkan dari RTDB `selections` setelah muat ulang dan export tidak lagi menulis jawaban benar sebagai "pilihan salah", §6.3–§6.4; menggantikan empat ragam pemulihan lama (komentar "PHASE 3 — … Sementara skip" di 56 halaman, ragam ASCII-nya di 13 halaman Optimalisasi, serta ragam "v12.1"/`MC_HINTS`/`, true)` yang tidak pernah cocok karena kunci tidak ada di klien) tanpa menyentuh perulangannya; bloknya sengaja tanpa nama course dan nomor modul, sebab generator TTL/CAD mengganti `sistem_kendali_cerdas`/`teknik_tenaga_listrik` dan "Tugas 1" secara global — jenis course dikenali dari markup seperti `selectMC`; v2 pada hari yang sama menambah penjaga `timestamp` untuk huruf posisi course acak, §6.3. Diuji 28 September 2026 pada salinan scratch: `bangun-modul-1.py` + `bangun.py 2..14` CAD dan `bangun.py 2..14` TTL beserta injektor menghasilkan ke-27 halaman identik byte demi byte, dan `--periksa` sudah 0 sebelum injektor dijalankan (TTL Modul-1 sendiri adalah kerangka: bootstrap `bangun-modul-1-dari-sisken.py` tidak lagi berjalan di `main` karena jangkar registry chat Sisken Modul-1 sudah memuat TTL/CAD); `enrich-sisken-modules.mjs` + pasca-proses + `sisken-export-html.mjs` mempertahankan kedua blok utuh; v3 pada 29 September 2026 memakai `mcOrderVersion` ledger dan diletakkan sesudah blok `JAWABAN-PRIVAT:GABUNG`, jadi jalankan bersama `jawaban-privat.mjs` — urutan keduanya bebas), `jawaban-privat.mjs` (84 modul + 12 UTS/UAS; penanda `JAWABAN-PRIVAT:JEMBATAN`, `HURUF-ASAL` (modul), `IDENTITAS`, `TUNGGU`, `GABUNG`, `AWARD-HARD` (Optimalisasi Modul 4), `ANGKA-CAD` (16 halaman CAD); ditambahkan 29 September 2026 — jawaban sendiri dipulihkan lewat callable `getJawabanSaya`, bukan dari record RTDB `visitors/` yang terbaca publik, identitas localStorage tanpa field jawaban, dan tulisan klien ke record visitor tidak lagi mengirim ulang record lama, §6.3, §7.6, §9.1; menangani keenam ragam pemulihan modul (A/B/C/D, Optimalisasi Modul 4, Matematika 4 Modul 4) dan ketiga ragam ujian tanpa menyentuh kode pemulihannya, karena jawaban digabung ke `data` sebelum kode itu berjalan; bloknya tanpa nama course dan nomor modul, dan JEMBATAN sengaja diletakkan sebelum pasangan baris `_generateExportCodeCallable` yang dijadikan jangkar generator CAD. Perbaikan tinjauan (29 September 2026, JEMBATAN/IDENTITAS/GABUNG v2) menambah: tanpa cadangan field publik saat callable gagal, coba ulang berdasarkan kode galat, penguncian PIN dan hash PIN yang ditolak, batas tunggu 2,5 detik, `scoreDelta` ledger, kait berkas CAD, `_identitasLogin`, penghapusan cadangan `freshRec`, dan cabang `resource-exhausted` di penangan galat penilaian; kait `_tandaiBerkasDiServer`/`berkasDiServer` sendiri milik generator CAD (`scripts/cad-modul/bangun-modul-1.py`, `scripts/cad-exam/kartu.py`). JEMBATAN v3 + blok `ANGKA-CAD` (29 September 2026) memulihkan angka bacaan FreeCAD yang dinilai (field `angka` `getJawabanSaya`) ke kolom angka kartu CAD (§6.3); blok ini tidak ada di kerangka TTL, jadi sesudah `bangun-modul-1.py` atau `cad-exam/bangun.py` `--periksa` melaporkan CAD Modul-1 atau UTS/UAS CAD sampai skrip ini dijalankan, sedangkan CAD 2–14 mewarisinya dari CAD Modul-1 bila skrip dijalankan sebelum `bangun.py 2..14`. JEMBATAN v4 (29 September 2026) hanya memakai entri `getJawabanSaya` yang statusnya cocok dengan marker RTDB segar soal itu (§6.3); penanda naik ke v4 di ke-96 halaman, jalan kedua 0. JEMBATAN v5 (hari yang sama, tinjauan v4) tidak memakai ringkasan berkas yang belum dinilai untuk soal yang sudah bermarker atau sudah dikirim di sesi ini (§6.3); penanda naik ke v5 di ke-96 halaman, jalan kedua 0. TUNGGU v2 (29 September 2026, lanjutannya) membaca record RTDB sesudah penantian `getJawabanSaya`, bukan bersamaan, dan melewati snapshot yang lebih tua daripada marker benar yang sudah diketahui halaman (§6.3); blok v1 ditimpa di tempat di ke-96 halaman termasuk kerangka generator TTL/CAD, dan `pulihkan-pilihan-pg.mjs` mengenali pembacaan record bentuk v2 sebagai jangkarnya (diuji pada salinan scratch: `bangun.py 2..14` TTL, `bangun-modul-1.py` + `bangun.py 2..14` CAD, `cad-exam/bangun.py uts|uas`, `pasang-tautan-pdf.py` kedua course, lalu seluruh injektor → identik byte demi byte, `--periksa` `jawaban-privat.mjs` sudah 0 sebelum injektor — diuji di `main` sebelum blok `ANGKA-CAD` tergabung; untuk CAD Modul-1 dan UTS/UAS CAD lihat kalimat berikut). Diuji 29 September 2026 pada salinan scratch: `bangun.py 2..14` TTL, `bangun-modul-1.py` + `bangun.py 2..14` CAD, dan `cad-exam/bangun.py uts|uas` beserta injektor menghasilkan seluruh halaman identik byte demi byte. Pada uji #963 (JEMBATAN v2), `--periksa` kedua injektor sudah 0 sebelum injektor dijalankan. Sejak blok `ANGKA-CAD`, `jawaban-privat.mjs --periksa` melaporkan CAD Modul-1 sesudah `bangun-modul-1.py` (1 halaman) dan UTS/UAS CAD sesudah `cad-exam/bangun.py` (2 halaman), dengan rekap "angka-cad dipasang", sampai injektor itu dijalankan, lalu 0. `pulihkan-pilihan-pg.mjs --periksa` tetap 0 (diuji ulang untuk JEMBATAN v5, sebelum dan sesudah TUNGGU v2 tergabung); rantai Sisken mempertahankan seluruh bloknya), dan `pin-kosong-ke-login.mjs` (84 modul + 12 UTS/UAS; penanda `PIN-KOSONG-LOGIN`; ditambahkan 29 September 2026 — cabang `else` di blok auto-login "PIN re-verify jika sessionStorage cleared": bila `verifyPin` menjawab `exists:false` dan migrasi PIN lama kosong, identitas mahasiswa dibuang dan form login tampil lagi, §4.3; blok tanpa nama course/nomor modul, generator TTL/CAD mewarisinya dari kerangka sehingga `--periksa` sesudah regenerasi harus 0; `--periksa` keluar dengan kode 1 bila ada halaman yang belum memuatnya), `muat-soal-uts.mjs` (UTS Matematika 4 dan Optimalisasi & Otomasi saja; penanda `MUAT-SOAL-UTS:FLAG`, `AUTOLOGIN`, `INIT`; ditambahkan 29 September 2026 — flag render UTS hanya dipasang renderer sesudah soal terender, dan jaring aman inisialisasi/auto-login memanggil `_ensureUTSQuestionsLoaded()` alih-alih merender tanpa soal, §7.9; kesepuluh halaman ujian lain sudah benar dan hanya diperiksa dengan aturan validator yang sama; ke-12 halaman diproses dan diperiksa di memori lebih dulu dan baru ditulis sesudah semuanya lolos, jadi berkas ber-CR, pelanggaran aturan, atau jumlah halaman yang salah tidak meninggalkan halaman setengah jadi; `--periksa` keluar dengan kode 1 bila ada halaman yang akan berubah; tidak ada generator yang dibangun dari kedua halaman itu, jadi `--periksa` sesudah regenerasi TTL/CAD tetap 0), dan `samakan-kunci-identitas.mjs` (84 halaman modul; penanda `KUNCI-IDENTITAS:LOKAL` dan `KUNCI-IDENTITAS:LK` v1 — blok `KUNCI-IDENTITAS:DRAF` dari versi pertamanya diganti `DRAFT-MODUL:KUNCI` milik `draft-modul.mjs`; ditambahkan 29 September 2026 — kunci identitas yang dibaca skrip klasik (`getIdentityLocal()`, `_draftKey()`, `const LK` friksi) disamakan dengan `LOCAL_IDENTITY` halaman, §6.7: Optimalisasi Modul 12–14 membaca kunci modul sebelumnya sejak #285 sehingga progres, gerbang, forum server, export, dan friksi mati; `LK` Matematika 4 tidak diinterpolasi sehingga friksinya tidak pernah aktif; cadangan draf Matematika 4 `pertemuan-N`/`pertemuan-5`), dan `simpan-pilihan-poll.mjs` (84 modul; penanda `PILIHAN-POLL-FORUM:BEGIN/END v2`, tepat sesudah `<!-- PROGRES-MODUL: akhir -->`; ditambahkan 29 September 2026 — pilihan quick check Forum disimpan ke localStorage `forum_poll_<MODUL_ID>_<nim>` dan, bila `getModulProgress` memuat `forumPoll`, ke server lewat callable terpisah `saveModulPoll` (v2 hari yang sama; v1 memakai mode poll-saja `saveModulForum`, yang versi lamanya mengosongkan teks forum saat fungsi backend diperbarui tidak serentak atau di-rollback), lalu dipulihkan persis saat dimuat; kunci yang direset dosen di server tidak diisi ulang dari localStorage; tombol Copy Forum tidak ditahan poll kosong bila forum sudah lengkap di server sebelum peramban ini pernah melihatnya belum selesai, §6.5 dan §6.7; jalankan SESUDAH `tambah-progres-modul.mjs`, karena prasyaratnya kait event PROGRES-MODUL v2 — skrip gagal keras tanpa kait itu, juga bila `voteForum`/`checkForumReady` tidak global, poll kurang dari 2, atau opsi poll bukan 0..3; halaman ditulis hanya bila semua lolos; `--periksa` keluar 1 bila ada yang akan berubah; akhir baris berkas dipertahankan. Bloknya tanpa nama/ID course, nomor modul, `function voteForum(`, literal `voteForum(<n>,this,<k>)`, maupun `_forumPollAnswerHashes`, karena generator TTL/CAD mengganti token itu dengan hitungan pasti dan validator forum Sisken menghitungnya; generator TTL/CAD dan rantai Sisken mewarisi blok ini dari halaman sumbernya, jadi `--periksa` sesudah regenerasi harus 0). `samakan-kunci-identitas.mjs` menurunkan kunci dari `MODULE_ID` + `LOCAL_IDENTITY` skrip module, berhenti bila aturan nomor §3 dilanggar atau ada literal kunci identitas di tempat yang belum dikenalnya, dan hanya menyentuh halaman yang salah (17 halaman pada 29 September 2026; ke-67 lainnya tidak berubah, termasuk Modul-1 TTL/CAD, sehingga `ganti(…identity…, 2)` generator tetap menemukan dua literal); blok yang sudah ada dibangun ulang dari kunci halaman itu. Tidak ada data localStorage yang dimigrasi (alasannya di §6.7). `--periksa` keluar dengan kode 1 bila ada halaman yang akan berubah; berkas CRLF dipertahankan CRLF. Diuji pada salinan `origin/main`: jalan pertama 17 halaman, jalan kedua 0, hasil CRLF sama dengan hasil LF. Juga `deklarasi-chat-modul.mjs` (84 halaman modul; penanda `DEKLARASI-CHAT-MODUL:VAR`, `EKSPOR`, `INIT`; ditambahkan 29 September 2026 — Getaran Mekanik Modul-4 kehilangan `let onlineUsers`/`chatMessages`/`_lastSentAt`, ekspor `window.sendChat`/`onChatInput`/`onChatKey`, dan `initChat();` lewat unggahan manual 28 April 2026, sehingga daftar online dan chat modul itu mati, §6.5; skrip menyisipkan hanya bagian yang memang hilang di skrip module chat, di luar blok AI-CHAT-AGENT — VAR sesudah `let currentSchedule = null;`, EKSPOR sesudah `window.submitVisitor=submitVisitor;window.togglePanel=togglePanel;`, INIT (`initChat();`, ditambah timer presence 1,5 detik hanya bila presence identitas tersimpan belum dipasang di init sequence maupun di auto-login `_handleScheduleReady`) sesudah `initVisitor();` — dan membuang blok yang menjadi berlebih bila bagian aslinya kembali, jadi `let` tidak pernah ganda; v2 (29 September 2026, sesudah tinjauan) tidak lagi menambah timer itu di Getaran Modul-4, yang memasang presence lewat auto-login — v1 membuat `initPresence` jalan dua kali bagi mahasiswa yang kembali (dua pendengar `visibilitychange`, tulisan heartbeat ganda) — dan mendeteksi deklarasi, fungsi, ekspor, dan `initChat();` dengan `scripts/pemindai-deklarasi.mjs` yang sama dengan validator (tingkat teratas = kedalaman kurung, bukan kolom 0; deklarator sesudah koma dan destrukturisasi dihitung), sehingga halaman yang lolos validator tidak pernah mendapat `let` kedua, sedangkan `const` dan deklarasi yang hanya ada di cakupan global dihentikan dengan pesan jelas untuk diperbaiki dengan tangan; ke-83 modul lain tidak berubah; semua-atau-tidak-sama-sekali seperti `muat-soal-uts.mjs`, berkas ber-CR ditolak, dan `--periksa` keluar dengan kode 1 bila ada halaman yang akan berubah; generator TTL/CAD membangun dari Modul-1 course-nya dan rantai Sisken mempertahankan skrip module, ketiganya sudah lengkap, jadi `--periksa` sesudah regenerasi tetap 0). `perkuat-pembagian-kelompok.mjs` ditambahkan 14 September 2026 setelah tab itu menampilkan "Gagal memuat data mahasiswa": `renderGroups()` dulu mengambil roster sekali tanpa cek status HTTP dan tanpa percobaan ulang, sehingga satu kegagalan sesaat langsung tampil sebagai error. Kini roster dimuat lewat `_pkAmbilRoster()` (cek `r.ok`, tiga percobaan dengan jeda dan parameter anti-cache), pesan gagal menyebut penyebabnya beserta tombol **Coba lagi**, dan halaman yang dibuka dari berkas lokal (`file://`) diarahkan ke situs. Dua di antaranya juga menyentuh `<Course>/OBE/Penilaian-OBE.htm` sejak 1 September 2026: `kecualikan-akun-simulasi.mjs` (menyaring akun simulasi dari roster `STUDENTS`) dan `tambah-efek-memuat.mjs` (efek loading pemilih peran). Keduanya memakai jalur terpisah `prosesObe()` karena halaman OBE beda ekstensi dan tidak punya jangkar `updateLeaderboard`. **Posisi blok dipertahankan (diperbaiki 1 September 2026).** `tambah-efek-memuat.mjs` dan `tambah-efek-jawaban.mjs` sama-sama menaruh satu blok `<style>` di `<head>`. Dulu keduanya membuang bloknya lalu menyisipkan ulang tepat sebelum `</head>`, sehingga berebut tempat terakhir: menjalankan yang satu memindahkan blok yang lain ke bawah — 64 berkas berubah, 67 baris bergeser, nol perubahan isi — lalu menjalankan yang lain memindahkannya balik. Siklus dua langkah yang tidak pernah selesai dan mengotori setiap diff. Sekarang keduanya **mengganti blok di tempat** bila sudah ada, dan hanya menyisip sebelum `</head>` bila blok itu memang belum ada. Isinya tetap ditimpa tiap jalan (perbaikan CSS tetap sampai), tetapi urutannya tidak lagi berubah. Diuji: empat putaran bergantian, keduanya melaporkan 0 halaman. `tinggikan-daftar-hasil.mjs` (modul + exam) menyamakan tinggi wadah roster tab Hasil `#visitorTableBody`: `max-height:420px` tetap → `min(72vh,820px)` responsif, sehingga daftar ikut tinggi layar tetapi berhenti di 820px. Ditambahkan 5 September 2026 untuk 8 halaman Exam, diperluas 7 September 2026 ke 56 modul — kini seragam di ke-96 halaman modul/exam (TTL dan CAD mewarisinya dari kerangka generatornya). Aturan CSS lintas course yang ditulis langsung di halaman (ukuran roadmap, padding panel persamaan, jarak `br+span`) juga sudah ada di generator `apply-modern-academic-all-modules.mjs` dan `enrich-sisken-modules.mjs`. `angka-tanpa-label.mjs` (30 September 2026; 94 halaman = 84 modul + 10 ujian ber-Pyodide, UTS/UAS Pemodelan CAD tidak punya `_lineAnswers`) menambah kandidat jawaban komputasi yang bukan bagian label (§6.2): blok `ANGKA-TANPA-LABEL:BARIS` v1 di akhir `_lineAnswers` dan pembantu `ANGKA-TANPA-LABEL:BANTU` v1 (`_angkaTanpaLabel`) tepat sesudahnya, tanpa lookbehind regex (Safari < 16.4 gagal mem-parse seluruh skrip) dan dengan `\p{L}` lewat `new RegExp` ber-try/catch. `--periksa` harus 0 (keluar 1 bila ada halaman tertinggal) dan `--uji` menjalankan fungsi dari setiap halaman terhadap 13 kasus, termasuk syarat bahwa kandidat lama tetap menjadi awalan keluaran baru. Generator TTL/CAD/Sisken mewarisi bloknya dari halaman sumber (regenerasi TTL Modul 3 menghasilkan halaman identik byte demi byte); komentar di dalam blok sengaja tidak menyebut nama course atau nomor modul karena generator mengganti teks semacam itu.

Validator khusus melengkapi pemeriksaan publik tersebut:

| Validator | Cakupan khusus |
|---|---|
| `validate-all-course-modern-design.mjs` | Marker, runtime, tabel, kartu pustaka, perilaku tab, editor deadline `HH:mm` 24 jam, normalisasi WIB, dan sintaks pada seluruh 84 modul keenam mata kuliah (jumlah 84 dipatok; `moduleCount` TTL dan CAD kini 14). |
| `validate-all-course-score-panels.mjs` | Panel skor compact pada 42 modul Matematika 4, Getaran Mekanik, dan Optimalisasi & Otomasi. |
| `validate-sisken-modules.mjs` | Struktur dan perilaku 14 modul Sisken, termasuk urutan tombol pilihan ganda, panel skor, serta kompatibilitas generator. |
| `validate-sisken-forum.mjs` | Seluruh 156 kombinasi jajak Forum Modul 2–14 beserta Clipboard API dan fallback `execCommand`. |
| `validate-sisken-export-html.mjs` | Jalur export HTML Tugas pada seluruh modul Sisken. |
| `periksa-notasi.mjs` | Notasi rumus di halaman modul **dan ujian** keenam course (`KURSUS_NOTASI` = seluruh `courseRoots`; 14 modul + UTS/UAS per course = 96 halaman, jumlahnya dipatok; §2 butir **Notasi rumus**): menolak garis bawah/pangkat `^` mentah di `<text>` SVG (kecuali `data-kode="1"`; dasar subskripnya huruf — boleh berkoefisien angka `2x_A` atau berakhir superskrip angka `H²_max` — atau penutup `]`/`)`/`|` seperti `[A B; C D]_total` dan `|x|_avg`; pangkat `e^∫P dx` juga ditolak, sedangkan nama berkas `Tugas1_NIM_T1.FCStd` tidak), penanda `<sub>`/`<sup>` yang tertinggal di `<text>` SVG, literal argumen `fillText`/`strokeText`/`_ttlTeks`/`_ttlLabel`/`_ttlTulis`/`_siskenLegenda`/`_siskenBawah` yang bergaris bawah atau berpangkat `^` (termasuk sambungan `'Z_'+…`; kecuali baris `// notasi: kode`), penanda kanvas di halaman tanpa helper kanvas (`_ttlRumusKtx` TTL/CAD atau blok `NOTASI-KANVAS` dari `notasi-halaman.mjs`), segmen KaTeX `\( \)` yang terpecah lintas simpul teks (`<sub>` atau `<` telanjang di dalamnya), sambungan subskrip bersyarat (`'GMR'+(n>1?'_b':'')`), literal skrip yang setengah dikonversi (penanda `<sub>`/`<sup>` dan `X_y`/`^` mentah dalam satu literal; nama bergaya kode `raw_alarms` tidak dihitung), serta isi opsi PG/jajak dan tautan `#modulSubnav` ber-elemen/KaTeX tanpa satu pembungkus `<span class="opsi-teks">` (§2 butir (9)). Teks HTML biasa tidak diperiksa (nama parameter kode seperti `n_estimators` sah tampil). Dijalankan `validate-public-security.mjs` beserta uji mutasinya (23 mutasi harus ditolak dan 9 bentuk sah harus diterima pada acuan TTL Modul-3, ditambah penanda kanvas di Getaran Modul-3 yang harus diterima dengan blok `NOTASI-KANVAS` dan ditolak tanpanya); sendiri: `node scripts/periksa-notasi.mjs --rinci [folder-course …]`. |
| `notasi-halaman.mjs --periksa` | Notasi rumus di 68 halaman tulisan tangan (Getaran, Matematika 4, Optimalisasi Modul 1–14, Sisken Modul 1, bagian Sisken 2–14 di luar keluaran `enrich-sisken-modules.mjs`, dan ke-12 UTS/UAS) dari `scripts/notasi-halaman-data.json` (§2 butir **Notasi rumus**): harus 0. Pasangan `[lama, baru]` dipasang hanya bila jangkar lama muncul tepat sekali dan yang baru belum ada; jangkar yang hilang/ganda menghentikan skrip tanpa menulis apa pun (`DITOLAK …`), dan blok AI-CHAT-AGENT diperiksa identik. Sesudah pasangan, skrip memasang struktur tampilan §2 butir (9)–(10): pembungkus `<span class="opsi-teks">` pada opsi PG/jajak dan tautan subnav ber-elemen/KaTeX (dilepas sebelum pasangan dicocokkan, dipasang lagi sesudahnya) dan penanda ✓ tombol pemilih animasi sebagai simpul teks. Jalankan sebelum `draft-modul.mjs`; sesudah regenerasi Sisken, UTS/UAS CAD, atau `tambah-ilustrasi-statis.mjs` (yang wajib diikuti `tambah-persamaan-statis.mjs`) hasilnya 0. |
| `notasi-ekspor.mjs --periksa` | Blok `NOTASI-EKSPOR` v1 (`_teksNotasi`) di awal badan `exportTugasHtml` ke-84 halaman modul dan tiga pembacaan teks ekspor (pilihan PG terpilih, `.mc-q`, `.comp-q`) lewat `_teksNotasi`, bukan `textContent` (§2 butir (11)); harus 0. Jalankan sesudah `notasi-halaman.mjs`, sebelum `draft-modul.mjs`; generator TTL/CAD mewarisinya dari Modul-1. `validate-public-security.mjs` memeriksa blok di 84 halaman dan menguji `_teksNotasi` pada DOM tiruan (`node scripts/notasi-ekspor.mjs --uji`). |
| `draft-ujian.mjs --periksa` | Draft UTS/UAS (§6.3): harus 0. Dijalankan **terakhir** sesudah regenerasi halaman ujian dan sesudah penyuntik lain — juga sesudah `python scripts/cad-exam/bangun.py uts` dan `uas`, yang mewarisi blok `DRAFT-UJIAN:PENJAGA` dari kerangka TTL tetapi membuang blok `DRAFT-UJIAN:KUNCI` (penandanya sengaja di dalam `_draftKey`, jadi terpotong utuh tanpa penanda yatim). `validate-public-security.mjs` menagih kedua blok byte-sama dengan templat skrip itu (PENJAGA tepat sebelum `<!-- ── FIREBASE + VISITOR SYSTEM … -->`, di luar blok AI), prasyarat halaman (`getIdentityLocal` membaca kunci `LOCAL_IDENTITY`, `_saveDraft`/`_loadDraft` memanggil `_draftKey()` polos, perender di skrip klasik dan menjadwalkan pemulihan ulang visual 150 ms, `_markLoaded` persis bentuk yang dipakai penjaga sebagai tanda Firebase siap, pemanggil `_loadDraft` lain hanya jadwal di perender CAD), `EXAM_ID` sesuai path dan unik, lalu menjalankan `_saveDraft`/`_loadDraft` asli tiap halaman bersama kedua blok dan `_markLoaded` di node:vm (tanpa tulisan sebelum data Firebase atau kartu soal ada, pulih sesudah render, Firebase yang dimuat sebelum sesi PIN tidak dihitung sehingga kode ledger soal dinilai tidak tertutup draft, kolom terkunci tidak diisi draft, ketikan tersimpan, dua ujian terpisah, mati untuk dosen/tamu/Preview/tanpa sesi PIN) serta uji mutasi. Mutan dibangun di luar `try`: mutasi yang jangkarnya tidak ditemukan atau tidak mengubah apa pun menggagalkan validator, bukan tercatat sebagai "ditolak". |

Penjaga forum progres modul (29 September 2026, §6.7): `validate-public-security.mjs` (`periksaPenjagaForum`) menagih sub-blok `// PROGRES-MODUL:PENJAGA-FORUM BEGIN v2` … `END v2` dari `tambah-progres-modul.mjs` di ke-84 modul (tepat sekali, identik, tepat sesudah `var forumDimuat = false;`), kaitnya (`forumSiap(p)` sebagai pernyataan pertama `terapkanProgres`, hitungan centang mode bebas dibuang lalu `mulaiMuatForum()` sesudah cek `pinHash`, `forumDitolak()` sebelum `tampilkanKunci`, `forumGagal(e, d)` di `catch`, `forumTertahan()` di `kunciTab` dan pembungkus `switchTab`, dan `if (!bolehKirimForum(j)) return;` sebelum `saveModulForum`), sub-blok yang tidak menyentuh `_sessionPinHash`, serta `saveModulForum` hanya dari `simpanForum` (di luar PROGRES-MODUL tidak disebut sama sekali, juga tidak di blok `PILIHAN-POLL-FORUM` v2 yang memakai `saveModulPoll`); sub-blok dan runtime PROGRES-MODUL utuh dijalankan di sandbox `node:vm` (cold start, mahasiswa baru, gagal lalu pulih, coba ulang habis lalu tab Forum memuat ulang, gagal lalu centang lengkap, PIN terkunci, sesi PIN tidak berlaku, galat sesi lama, PIN ulang di halaman yang sama, jendela sebelum `muatProgres`, centang mode bebas di localStorage, Forum yang terlanjur terbuka, kiriman forum gagal, akses ditolak lalu **Periksa lagi**; di skenario cold start, gagal lalu pulih, dan akses ditolak juga urutan event `progres-modul:diterapkan`: tidak ada sebelum progres diterapkan maupun saat akses ditolak, `{ok:false}` per kegagalan, dan `{ok:true}` sekali dengan tab Forum sudah terbuka dan textarea terisi), ditambah 34 uji mutasi (`PENJAGA_FORUM_MUTASI=1` mencetak alasannya; sejak v2 juga event `progres-modul:forum-tersimpan` tepat sekali sesudah kiriman sukses dan tidak sesudah kiriman gagal — tiga mutasi v2: tanpa event, event sebelum kiriman, event tanpa `jawaban`; tiga lainnya untuk blok poll: kiriman poll-saja lewat `saveModulForum`, `{ok:true}` sebelum tab Forum terbuka, dan `{ok:false}` yang hilang). Versinya ada di penanda sub-blok; penanda luar `<!-- PROGRES-MODUL: awal -->`/`akhir -->` sengaja tetap tanpa versi karena menjadi jangkar injector lain. Setelah regenerasi modul, jalankan `tambah-progres-modul.mjs` sesudah `jawaban-privat.mjs` + `pulihkan-pilihan-pg.mjs` dan sebelum injector yang berjangkar pada penanda `PROGRES-MODUL`; `--periksa` sesudahnya harus 0.

Draft materi modul (29 September 2026, §6.3): `scripts/draft-modul.mjs` (84 modul; penanda `DRAFT-MODUL:KUNCI` v1 di dalam `function _draftKey() {` dan `DRAFT-MODUL:PENJAGA` v5 — skrip klasik tepat sebelum `<!-- PROGRES-MODUL: awal -->` —, identik di 84 halaman tanpa token course/modul, ada `--periksa`) dijalankan **paling akhir** dalam urutan kanonik `jawaban-privat.mjs` + `pulihkan-pilihan-pg.mjs` → `samakan-kunci-identitas.mjs` → `tambah-progres-modul.mjs` → `simpan-pilihan-poll.mjs` → `draft-modul.mjs` sesudah regenerasi TTL/CAD/Sisken; `--periksa` semua injector sesudahnya harus 0 (hasilnya sama bila tiga skrip terakhir dijalankan terbalik). Injektor berhenti bila `_draftKey` berbentuk di luar lima ragam lama yang dikenal, bila ada pemanggil `_loadDraft` selain `_markLoaded` (akan terbaca sebagai tanda Firebase siap), bila fungsi draft didefinisikan/ditimpa sesudah PROGRES-MODUL, atau bila `_saveDraft`/`_loadDraft`/`window._markLoaded` ditugaskan di skrip module mana pun — skrip module ditunda, jadi juga yang letaknya sebelum PENJAGA berjalan sesudahnya dan membuang pembungkusnya; di halaman bertugas berkas (CAD) juga bila `window.berkasTerunggah = berkasTerunggah;` tidak tepat sekali di skrip klasik sebelum PROGRES-MODUL atau `window._getJawabanSayaCallable =` tidak tepat sekali di skrip module (accessor PENJAGA v3), dan bila `window._cadSudahKirim = {};` tidak tepat sekali atau (v5) `kirimTugas` (skrip klasik) tidak memasang `compAnswered[qId] = true;` sebelum satu-satunya `const res = await window._callCheckModulAnswer(qId, nilai, '', [nilai], [nilai]);`; di semua halaman (v5, accessor penilaian PENJAGA) juga bila `function _callCheckModulAnswer(` atau `window._callCheckModulAnswer = ` tidak tepat sekali di skrip module, ditugaskan lagi di tempat lain, atau dipanggil tanpa `window.` (prasyarat v4 untuk `_bukaKirimUlangCad` tidak berlaku lagi karena PENJAGA v5 tidak membungkusnya). Injektor juga mengganti komentar yang masih menyebut kunci draft lama (Matematika 4 Modul 4) dan berhenti bila kunci lama `<slug>_draft_<modul|pertemuan>-N_` masih tersebut. `validate-public-security.mjs` (`periksaDraftModul`) menagih kedua blok byte-sama dengan templat skrip itu, tanpa sisa `KUNCI-IDENTITAS:DRAF` maupun kunci lama yang tersebut, `MODUL_ID` = `<slug callable>-modul-<N>` sesuai path dan unik di 84 halaman, serta PROGRES-MODUL yang mengirim `progres-modul:diterapkan` dan (PENJAGA-FORUM v2) `progres-modul:forum-tersimpan`; lalu menjalankan `_saveDraft`/`_loadDraft` asli setiap ragam bersama `_markLoaded` persis bentuk halaman dan skrip PENJAGA di `node:vm` (DOM, localStorage bersama antartab lewat `Storage.prototype` tiruan, callable `getJawabanSaya` tiruan, dan event tiruan): tidak ada tulisan/muat sebelum `_markLoaded` bersesi DAN progres `{ok:true}` bersesi sama (juga jaring 10 detik, pemuatan tanpa sesi PIN, progres yang gagal/ditolak, dan penerimaan server untuk hash PIN lain), kode ledger soal yang dinilai tidak ditimpa (juga bila ledger datang terlambat: kolom soal ber-`compAnswered` tidak diisi draft), simpanan pertama tidak menimpa draft, ketikan (juga kolom tanpa `oninput`, juga ketikan sebelum draft dimuat) tersimpan, draft modul lain tidak termuat, NIM yang berganti tanpa muat ulang membuat kolom draft dikosongkan dan halaman dimuat ulang tanpa tulisan ke kunci NIM baru, kunci null untuk dosen/tamu/Preview/tanpa PIN/tanpa `MODUL_ID`/tanpa NIM/tanpa peran; privasi v3 (draft gaya v2 berisi teks server, salinan `_sinkron`, dan kode soal yang kini dinilai → sesudah muat tidak tersisa; kode/angka ledger yang datang terlambat tidak masuk draft; draft kosong dihapus; kolom yang diisi halaman/server tidak masuk draft, yang diketik masuk, yang dikosongkan tidak kembali; suntingan Forum tersimpan bersama sidik basisnya dan keluar dari draft sesudah terkirim); gabung 3-arah Forum (belum terkirim → draft + `checkForumReady`; server berubah → server + catatan, suntingan lama dibuang dan tidak kembali pada muat ulang; dua perangkat; tanpa basis → hanya bila server tanpa catatan forum; textarea yang sudah diubah tidak disentuh; sekali per kunci; jawaban yang dikosongkan di server tetap kosong, suntingan di atas jawaban kosong tetap belum terkirim; dua tab: teks lama tab A tidak masuk draft dan suntingan belum terkirim tab B dipertahankan; tanda suntingan dilepas sesudah kiriman sukses); serta berkas CAD (ditahan sebelum `getJawabanSaya` sesi itu selesai — juga hasil sesi PIN lain atau sesi sebelumnya — dan tetap tersimpan; server dengan berkas lain menang, juga yang datang terlambat; SHA-256 sama → dipakai; tanpa berkas server → dipakai; unggahan di halaman menang; metadata tugas yang dinilai keluar dari draft; accessor hanya di halaman CAD dan meneruskan janji callable apa adanya; v4 dengan `kirimTugas`, `_bukaKirimUlangCad`, dan `_parseNilai` ASLI halaman CAD dan penilaian tiruan: kiriman yang dinilai salah → angka yang dikirim dan berkas yang dinilai keluar dari draft tanpa tulisan yang masih memuatnya, simpanan kolom lain tidak membawanya kembali, ketikan/unggahan sesudahnya tersimpan; muat ulang tugas yang dibuka lagi → metadata draft tidak dipakai walau SHA-256-nya sama dengan ringkasan ledger di kartu, konfirmasi "yang terakhir diunggah", angka perbaikan pulih, kiriman ulang yang dinilai lagi mengeluarkan angkanya; pemulihan marker `(…, false)` bukan kiriman; metadata tahanan keluar sesudah tugasnya dikirim; dua tab: angka tab lain yang lebih baru tidak dibuang; v5 dengan callable penilaian tiruan yang ditugaskan SESUDAH PENJAGA dan `BroadcastChannel` tiruan per peramban: accessor penilaian di semua halaman membungkus callable itu, meneruskan janjinya apa adanya, melewatkan soal PG, dan tidak membungkus dua kali; respons hilang sesudah server menilai (`deadline-exceeded`/`internal`/`unknown`) → angka & berkas keluar dari draft, tidak kembali lewat simpanan lain, ketikan sesudahnya tersimpan; ditolak sebelum dinilai (`failed-precondition`/`invalid-argument`/`unavailable`/`unauthenticated`) → isian kembali ke draft, juga yang dipulihkan dari draft; muat ulang saat menilai → sejak dikirim tidak ada di draft dan tidak pulih; angka draft = angka ledger sesi itu saat muat (juga ledger terlambat) → kolom tidak diisi dan draft bersih, ledger sesi PIN lain tidak dihitung, angka yang berbeda tetap; dua tab (dinilai salah → angka/berkas tidak kembali dari tab lain dan angka lain tab itu tetap; benar → tugas itu dinilai di tab lain; metadata tahanan tab lain keluar; pengumuman modul lain diabaikan; angka tab lain yang tersimpan sebelum maupun selama kiriman tidak hilang); kode yang dinilai di tab lain tidak kembali ke draft, dan kode yang hasil penilaiannya tak pasti tidak dibuang). Uji mutasi pada Getaran Modul-2, Matematika 4 Modul-4 (`_markLoaded` global), dan Pemodelan CAD Modul-2 menagih 66 mutasi perilaku (sebagian khusus ragam; 22 di antaranya untuk v3: gabung 3-arah, privasi, dan berkas CAD; 1 sisa v4: metadata tugas yang dibuka lagi; 21 untuk v5: kiriman, ledger, dan pengumuman dua tab — 7 mutasi v4 lain untuk pembungkus `_bukaKirimUlangCad` dihapus bersama pembungkusnya) dan 20 mutasi struktur (3 untuk v5: panggilan penilaian sebelum kunci optimistis, penugasan ulang, dan panggilan tanpa `window.`; 3 mutasi v4 `_bukaKirimUlangCad` dihapus) (`DRAFT_MODUL_MUTASI=1` mencetak alasannya). Validator yang sama menolak klaim usang bahwa draft modul CAD mati — kunci draft yang katanya selalu kosong, atau angka/metadata unggahan yang katanya belum tersimpan (pola `KLAIM_DRAFT_USANG`) — di Pedoman, CLAUDE.md, `scripts/jawaban-privat.mjs` (komentar `JAWABAN-PRIVAT:ANGKA-CAD` cabang lama), dan ke-84 halaman modul, supaya cabang yang dibuat sebelum draft-modul tidak membawanya masuk lewat rebase tanpa konflik. Uji headless di Chrome dengan Firebase tiruan dan NIM/PIN fiktif (harness scratch, tidak disimpan di repo; `getModulProgress` tiruan memeriksa PIN seperti `_autentikasiMhs`) mencakup muat ulang ke-84 modul, progres lambat 6 detik dengan suntingan belum terkirim, progres gagal (sementara, penguncian PIN, sesi PIN tidak berlaku, sekali lalu pulih), akses ditolak lalu **Periksa lagi**, tab ditutup di jendela progres, dua modul, akun simulasi, Mode Preview, dosen/tamu, tanpa sesi PIN, hash PIN basi (Log Out di tab A, mahasiswa B login di tab lain lalu menutupnya, tab A dimuat ulang: draft B tidak tampil tanpa PIN B), ganti akun di tab yang sama sesudah jadwal dihapus, dua tab modul yang sama, jawaban forum yang dikosongkan di perangkat lain, prioritas lintas perangkat, kirim ulang CAD, berkas CAD yang diunggah ulang dari perangkat lain, dan quick check; v3 (30 September 2026) menambah dua perangkat (A: server berubah di perangkat lain → server menang, 0 kiriman, `forumSelesai` tetap true, catatan tampil; suntingan belum terkirim di perangkat yang sama → terkirim sekali), isi localStorage sesudah muat dan sesudah Log Out (B, juga dengan `getJawabanSaya` 5 detik: tanpa kode/angka dinilai, angka kiriman terakhir, maupun teks server; isian belum terkirim tetap), dan CAD dengan `getJawabanSaya` 5 detik (C: kartu, konfirmasi, dan ekspor tanpa berkas lama di jendela itu; server berberkas lain → server, tanpa berkas atau SHA-256 sama → draft) — ketiganya gagal pada v2 dan lulus pada v3; v4 (30 September 2026, verifikasi putaran 1) menambah kiriman CAD yang dinilai salah lalu dibuka lagi (B: sesudah kiriman, sesudah Log Out, dan sesudah muat ulang draft tanpa angka yang dikirim maupun metadata berkas yang dinilai; perbaikan yang diketik/diunggah sesudahnya tetap tersimpan) dan unggahan perangkat lain sesudah kiriman itu (C, juga dengan `getJawabanSaya` 5 detik: `berkasTerunggah` kosong, konfirmasi "yang terakhir diunggah", tanpa berkas draft di kartu/konfirmasi/ekspor) — gagal pada v3 dan lulus pada v4; v5 (30 September 2026, verifikasi putaran 2) menambah respons penilaian hilang/galat sesudah server menilai, muat ulang saat menilai, kiriman dari perangkat lain dan dari tab lain, kiriman benar di tab lain, serta Log Out langsung tanpa muat ulang (B: sesudah muat ulang dan sesudah Log Out tanpa angka/berkas yang dinilai; ketikan sesudahnya tetap), `getJawabanSaya` 5 detik sesudah kiriman perangkat lain (C: kartu/konfirmasi/ekspor tanpa berkas draft; B: draft bersih sesudah ledger datang), kiriman yang ditolak sebelum dinilai (isian tetap), dan kode yang dinilai di tab lain (tidak kembali ke draft, juga sesudah Log Out) — gagal pada v4 dan lulus pada v5.

### 17.2 Backend privat

Dari root backend:

```powershell
node scripts/validate-backend.js
node scripts/validate-ai-knowledge.js
Set-Location functions
npm.cmd run lint
npm.cmd test
```

Sejak cabang backend `fix/chat-kenapa-admin-dan-rescale-due` (dan `main` backend sesudah cabang itu digabung), `npm test` antara lain menjalankan `validate-ai-chat.js` (termasuk klasifikasi "kenapa/mengapa" administratif serta "point"/"poin kritis" yang tetap materi, §6.8) dan `verify-rescale-jadwal-modul.js`, yang menjalankan `rescaleModulLatePenalty` dan `rescaleExamLatePenalty` dengan RTDB/Firestore tiruan dan menagih `end` + `due` serta waktu buka yang tetap; penolakan deadline modul satu kelas yang bukan kelipatan 24 jam dari waktu buka, deadline pada/sebelum waktu buka modul atau `start` ujian, dan hitung ulang modul tanpa deadline saat `end` ≠ `due`; serta penilaian ulang attempt susulan terhadap override per-NIM (§5.4, §5.5). Bila repo frontend ada di sebelahnya, ia juga menjalankan modal Atur Jadwal ke-84 halaman modul dan kedua belas halaman ujian apa adanya dan menagih simpan ulang tanpa perubahan sesudah rescale; tanpa repo frontend bagian itu dilewati (SKIP), kecuali dengan `REQUIRE_FRONTEND=1`, yang membuatnya gagal. Sejak cabang backend `fix/rescale-cad-kirim-ulang`, `npm test` juga menjalankan `verify-rescale-cad-ulang.js`: ledger tugas FreeCAD modul CAD dibangun lewat `checkModulAnswer` sungguhan (kunci dari seed `pemodelan_cad-modul-1`), lalu ditagih bahwa rescale ke deadline yang sama tidak mengubah apa pun dan bahwa dinilai lalu di-rescale sama dengan dinilai langsung di deadline baru, baik diperpanjang maupun dimajukan (§5.4).

Sejak cabang backend `fix/pesan-jadwal-ujian` (dan `main` backend sesudah cabang itu digabung), `npm test` juga menjalankan `verify-pesan-jadwal-ujian.js`: `getExamQuestions` dan `checkExamAnswer` untuk ke-12 examId, serta `unggahBerkasTugas` untuk kedua ujian CAD, masing-masing dengan jadwal belum dibuka, sudah lewat, tidak ada, dan tanpa `start`/`end`, serta `rescaleExamLatePenalty` (sesi dosen tiruan, `dryRun`) untuk ke-12 examId dengan jadwal tidak ada dan tanpa `end` (RTDB/Firestore tiruan). Ia menagih kode `failed-precondition` tanpa `details`, teks persis yang menyebut UTS atau UAS sesuai examId (§7.9), tanpa tulisan ledger, kontrol jendela terbuka, sesi dosen, dan override susulan, serta tidak ada teks jadwal ujian di `index.js` di luar helper `_pesanJadwalUjian`.

Sebelum live seed, gunakan opsi `dry_run_seed` pada workflow atau perintah seed dengan `--dry-run`.

Penjaga bank soal yang **harus dijalankan manual** (semuanya di luar `lint`/`test`; `lint` hanya `node --check`):

| Skrip | Memeriksa |
|---|---|
| `node scripts/verify-uts-bank.js` | invarian shuffle MC vs `correctIdx` ter-seed, N=0..99 (Getaran/Math4/Opto) |
| `node scripts/verify-uts-unified.js` | tampilan+kunci `v2.js` vs bank/kunci legacy; untuk bank tanpa legacy (Sisken) memeriksa struktur, kebocoran kunci, opsi MC unik, konsistensi `expectedSteps`, dan menolak bank setengah jadi |
| `node scripts/verify-uts-seed-payload.js` | payload seed identik dengan kunci lama (re-seed = no-op) |
| `node scripts/verify-sisken-uts.js` | **menghitung ulang matematika tiap soal UTS Sisken** dari rumusnya untuk N=0..99 |
| `node scripts/verify-sisken-uas.js` | idem untuk UAS Sisken, plus poin per Sub-CPMK cocok dengan pemetaan OBE, dan **sebaran kunci MC per satu `N`** — menolak bila ≥70% kunci berkumpul di satu posisi |
| `node scripts/bangkitkan-poin-soal-exam.js --periksa` | `EXAM_QID_POINTS` tiap halaman ujian identik dengan `_examQPoints` server (keluar bukan nol bila menyimpang) |

`verify-sisken-uts.js` dan `verify-sisken-uas.js` adalah satu-satunya yang menangkap kekeliruan `correctIdx` menunjuk opsi yang salah dan **opsi MC kembar** (kunci ambigu) — kelas bug yang tidak terlihat dari struktur. Yang terakhir juga memeriksa sebaran kunci **di dalam satu `N`**; pemeriksaan sebaran gabungan lintas `N` yang dipakai sebelumnya justru meloloskan cacat seed seragam, sebab gabungannya tetap tampak rata (523/513/485/479) ketika tiap mahasiswa sebenarnya melihat seluruh kunci di satu huruf. Bank tanpa berkas kunci legacy tidak dapat diperiksa `verify-uts-bank.js`, jadi jangan menganggap bank Sisken sudah teruji hanya karena skrip itu hijau.

Bila menulis soal pada bank yang sebelumnya placeholder, ingat bahwa penjaga yang **mewajibkan** teks placeholder harus diinversi lebih dulu; ini pernah membuat `validate-backend.js` dan `verify-uts-unified.js` gagal begitu soal ditulis. Keduanya sekarang mendeteksi sendiri keadaan bank.

### 17.3 Uji manual minimum

| Area | Pemeriksaan |
|---|---|
| Preview | tidak membuat identity/attempt/poin; Tugas dan Forum modul tersembunyi; tab Hasil ujian tanpa data kelas (baris "Data kelas di UTS/UAS") |
| Mahasiswa | roster, PIN, schedule gate, satu attempt, restore setelah refresh |
| Dosen | login, pesan lock, atur jadwal dengan jam 24 jam, tampilan deadline WIB yang sama pada perangkat beda zona waktu, logout, sesi kedaluwarsa; perpanjangan modul satu kelas lewat `Admin/rescale-deadline.html` (NIM kosong) mengubah deadline yang tampil di halaman modul dan di jawaban chat, sedangkan waktu buka modul tidak berubah (§5.4); rescale ujian satu kelas lalu buka dan simpan Atur Jadwal UTS/UAS tanpa perubahan mempertahankan deadline baru dan waktu buka (§5.5); Diagnose modul satu kelas dengan deadline yang jamnya tidak sama dengan jam buka modul ditolak dengan saran dua deadline sah (§5.4); rescale ujian satu kelas saat ada mahasiswa susulan mempertahankan poin susulannya (§5.5); semuanya sejak deploy cabang backend `fix/chat-kenapa-admin-dan-rescale-due` |
| Modul | 25 soal (CAD 15), total 50, PG dapat dipilih dan tombol Periksa aktif, late 0,65 (seragam semua course), partial Hard 0,5 (semua course kecuali tugas modul CAD), export lengkap, Forum/chat |
| Exam | 45 soal (CAD: UTS 30, UAS 31, tanpa TF), total 100, format poin, late/cutoff, online-only, export resmi |
| Muat soal UTS/UAS | mahasiswa yang kembali (identitas + sesi PIN tersimpan) langsung mendapat soal setelah muat ulang; tab baru meminta PIN lalu soal muncul tanpa muat ulang; dibuka sebelum jam mulai lalu login sesudahnya tetap mendapat soal; dibuka sesudah `end + extension` menampilkan "Soal terkunci: <pesan server>" di bawah banner "UTS/UAS Telah Berakhir", tanpa soal; dosen tetap mendapat soal hanya-baca; Mode Preview tanpa identitas tanpa soal, dengan identitas + sesi PIN sebelum jam mulai "Soal terkunci: …" (§7.9) |
| Agen AI | konsep modul aktif dijawab dengan sitasi; pertanyaan lintas MK dan jawaban langsung asesmen ditolak; data pribadi disunting; saat UTS/UAS mata kuliah mana pun aktif, materi terkunci bagi mahasiswa di semua mata kuliah (uji juga dari halaman modul course lain; pesan menyebut ujiannya) tetapi jadwal/aturan tetap terjawab; "Kenapa tombol export saya tidak aktif?" dan "Kenapa poin tugas saya cuma 65%?" dijawab lapis administratif, sedangkan "Kenapa redaman mengurangi amplitudo?" dan "Mengapa respons melewati set point sebelum tunak?" tetap ke tutor (§6.8; sejak deploy cabang backend `fix/chat-kenapa-admin-dan-rescale-due`); mode `AI_PROVIDER=none` dan simulasi kuota tetap menghasilkan fallback retrieval |
| Asisten di UTS/UAS | mahasiswa yang login (termasuk yang baru login dari layar tamu, tanpa muat ulang) melihat tombol 🤖 "Asisten Dosen" dan panel langsung di mode Asisten dengan catatan cakupan ujian; tab Online, nama/NIM mahasiswa lain, badge, dan jumlah online tidak terlihat; saat jendela UTS/UAS aktif pertanyaan materi dijawab pesan penguncian, permintaan kunci jawaban ditolak, jadwal/aturan ujian tetap terjawab; dosen tetap melihat tab Online sebagai default; tamu tidak melihat tombol; `#backToTop` tidak tertutup tombol chat di desktop maupun ≤480px; di ponsel 360/390 px (soal sudah tampil) tombol Asisten terlihat tanpa menggeser layar; pada laptop 1366×768 skala 125 % dan ponsel mendatar kolom tanya terlihat saat panel terbuka; Tab dari tombol tidak masuk ke panel yang tertutup; setelah logout (maupun logout paksa karena jadwal dihapus) riwayat Asisten mahasiswa tidak tersisa di localStorage dan formulir login tidak berisi PIN |
| Data kelas di UTS/UAS | Mode Preview dan tamu di layar login: tab Hasil menampilkan placeholder "Data kelas hanya tersedia untuk dosen…", tanpa tabel kelas, papan Top Skor/Top Akses, dan statistik; di DevTools (Elements, Ctrl+F) nama/NIM mahasiswa lain tidak ditemukan sama sekali, juga setelah menunggu 30 detik; identitas `dosen` bernama lain sama; mahasiswa tetap hanya kartu "Nilai Anda"; dosen yang sudah melihat tabel kelas lalu memilih "← Pilih peran lain" → "Mode Preview" langsung mendapat placeholder (tanpa menunggu 30 detik); dosen yang login dari layar tamu langsung melihat tabel kelas, papan peringkat, statistik, dan daftar online tanpa muat ulang; logout paksa (jadwal dihapus) langsung mengosongkan data kelas dan badge online; placeholder Mode Preview mengarahkan ke tombol "Keluar Preview" di banner, placeholder tamu ke login mahasiswa; setelah jadwal berakhir, dosen yang memuat ulang halaman langsung melihat "Absen" yang menghitung mahasiswa Bolos (tanpa menunggu 30 detik) |
| Identitas dosen lama/rekaan di UTS/UAS | isi localStorage identitas halaman dengan `{nama:'Dedik Romahadi'}` (tanpa role) atau `{role:'dosen', nama:'X'}`, lalu muat ulang saat jadwal berjalan dan sebelum jam mulai: pemilih peran tampil, tanpa 👥/🤖 FAB, tanpa chip "DOSEN · SOAL HANYA-BACA", tanpa pesan "belum dibuka"; pilih Dosen + password → tampilan dosen lengkap; dosen asli yang kembali tetap langsung masuk (juga sebelum jam mulai) |
| Label navbar ujian | UTS/UAS berlabel sama dengan modul course-nya: `MATEMATIKA4`, `GETARANMESIN`, `OPTOAUTO`, `SISKENCERDAS`, `TENAGALISTRIK`, `PEMODELANCAD` `// UTS` atau `// UAS` |
| UAS | soal tidak ada di source publik, fetch setelah gate, friction tidak memburamkan halaman; mahasiswa yang login di UAS mendapat watermark NIM-nya sendiri dan salin diblokir (tidak memakai identitas UTS yang tertinggal) |
| Progres modul | kotak centang hanya giliran yang aktif, lompat ditolak server; tab Tugas/Forum/Hasil terkunci sampai lengkap; login modul *n* ditolak bila modul *n*−1 belum lengkap (overlay kunci dengan rincian; tombol Periksa lagi membuka halaman tanpa login ulang setelah syaratnya terpenuhi); forum terpulihkan setelah login |
| Forum quick check | mahasiswa: pilih quick check, muat ulang → poll tetap terpilih (warna, umpan balik benar/salah, "PG N/N"); buka di perangkat/peramban lain → sama (setelah functions `feat/pilihan-poll-forum` ter-deploy; sebelumnya hanya perangkat yang sama); forum lama yang sudah lengkap + poll kosong → tombol 📋 Copy Forum aktif dengan catatan lembut; forum yang baru diketik → tombol tetap menunggu poll, juga sesudah muat ulang; di DevTools Network pilihan poll hanya lewat `saveModulPoll` dan setiap `saveModulForum` membawa `jawaban`; akun simulasi: hapus `forumPoll` di server → muat ulang → poll kosong lagi; Mode Preview tidak menyimpan apa pun |
| Akun simulasi | bisa menjawab ulang; tidak ada ledger/poin/record pengunjung; tidak tampil di papan hasil/roster; progres tersimpan dan boleh membatalkan centang terakhir |
| Efek jawaban | emoji dan suara hanya pada jawaban baru; tombol bisu berlaku untuk suara jawaban dan antarmuka; overlay login tidak memunculkan scrollbar berkedip |
| Reset | Firestore dan RTDB konsisten; PIN tidak terhapus; poin soal lain tetap |
| OBE | mapping per course, compute, draft lokal, publish, tampilan satu mahasiswa |

**Animasi CSS tidak bisa diverifikasi dari panel browser yang tidak ditampilkan.** Saat panel pratinjau tersembunyi, `document.hidden` bernilai `true` dan `document.timeline.currentTime` berhenti sama sekali: setiap animasi terbaca `running` tetapi `currentTime`-nya tetap 0 dan elemen beku di keyframe 0%. Efek perayaan jawaban pernah tampak "tidak muncul" (opacity 0, skala 0,3) hanya karena ini — kodenya benar. Ukur keadaan akhirnya dengan memaksa `anim.currentTime` ke akhir durasi lewat Web Animations API, atau tampilkan panelnya; jangan menyimpulkan cacat CSS dari pengukuran pada tab yang `hidden`.

Jangan menganggap perubahan selesai hanya karena halaman terbuka. Penilaian harus diuji sampai ke ledger, refresh, export, dan reset.

---

## 18. Ringkasan aturan yang tidak boleh dilanggar

1. Backend, kunci jawaban, bank soal UAS, service account, dan secret tetap privat.
2. Semua waktu operasional adalah WIB; modul dan exam wajib memakai parser WIB eksplisit, dan `due` yang valid menjadi acuan deadline modul.
3. PIN bersifat global; reset asesmen tidak menghapus PIN.
4. Modul bernilai maksimum 50; exam bernilai maksimum 100.
5. Server menentukan jawaban, toleransi, attempt, poin, late multiplier, dan hak admin.
6. Firestore attempt adalah ledger; RTDB visitor adalah cache realtime, bukan pengganti ledger.
7. Refresh tidak boleh mengubah poin atau rincian per soal.
8. UTS dan UAS sama-sama mengambil teks soal dari server; HTML publik tidak memuat bank soal apa pun.
9. Preview tidak menilai; preview modul tidak menampilkan Tugas dan Forum; preview exam tidak menampilkan data kelas.
10. Panel exam menampilkan mahasiswa online, bukan seluruh riwayat visitor, dan daftar itu hanya untuk dosen: mahasiswa hanya mendapat Asisten Dosen di panel yang sama (roster berisi nama, NIM, dan status poin teman sekelas; RTDB-nya terbaca publik sehingga UI satu-satunya penjaga). Halaman ujian tidak punya Chat Kelas. Tabel kelas tab Hasil, papan Top Skor/Top Akses, statistik kelas, dan daftar online hanya dirender untuk dosen terverifikasi (`_dosenUjianTerverifikasi`, satu-satunya aturan dosen halaman ujian untuk semua yang membuka fitur dosen: `_applyRoleVisibility`, auto-login jadwal, tinjauan soal dosen, gerbang wadah soal, dan permintaan soal mode dosen memakainya; pemeriksaan role yang tersisa tidak membuka apa pun — penjaga yang membatasi `_previewGuard`/`_previewExportGuard`, penentu mahasiswa, dan pengalih ke tinjauan soal dosen, §7.8); tamu dan Mode Preview mendapat placeholder tanpa data kelas di DOM, identitas yang bukan dosen terverifikasi maupun mahasiswa tidak dipulihkan otomatis, dan "bukan mahasiswa" tidak pernah berarti "dosen".
11. Poin exam ditampilkan maksimal dua desimal tanpa mengubah nilai mentah.
12. Friction browser adalah deterrent, bukan jaminan anti-screenshot atau blokir Alt+Tab.
13. Atur Jadwal tidak boleh menghapus data. Reset adalah operasi terpisah dan eksplisit.
14. Export HTML bukan sumber nilai resmi; kode HMAC hanya alat verifikasi.
15. Setiap perubahan yang sudah tervalidasi harus masuk `main`; deployment backend tetap langkah manual terpisah.
16. Node `pins/` tertutup dari klien. Verifikasi PIN hanya lewat callable `verifyPin`; jangan membaca `pins/` dari browser.
17. Kunci jawaban tidak pernah masuk repo publik — sekali ter-commit, kebocorannya permanen di riwayat Git dan hanya dapat ditutup dengan merotasi soal.
18. Bank soal yang masih placeholder tidak boleh di-live-seed; kunci dummy di produksi menilai mahasiswa secara ngawur tanpa gejala.
19. Angka poin bank exam (Σ=70 untuk ujian 45 soal) bukan nilai mahasiswa; yang diberikan adalah `_examQPoints` (Σ=100), dan hanya status `correct` yang ditimpa bobot itu. Partial credit membaca `partialPoints` kunci (0,5 seragam; rakitan `c11` UAS Pemodelan CAD 3) dan hanya berlaku sebelum deadline; setelah itu 0, bukan partial yang dipotong.
20. Setiap soal pilihan ganda wajib punya tombol `sub-mcN`-nya sendiri; tanpa itu `selectMC()` melempar dan PG tidak dapat dipilih.
21. Publikasi Pages memakai push ke branch `gh-pages`; jangan kembali ke `actions/deploy-pages`.
22. Agen AI hanya memakai resolver dan retrieval privat dari allowlist mata kuliah aktif; model bersifat opsional, bank/kunci tidak masuk indeks, sitasi wajib, dan tutor materi terkunci bagi mahasiswa di semua mata kuliah selama jendela UTS/UAS mana pun aktif (termasuk jendela susulan per NIM).
23. Seed pengocokan opsi MC wajib berbeda tiap soal. Seed seragam membuat seluruh kunci jatuh di satu huruf bagi tiap mahasiswa, sehingga menjawab satu huruf terus memberi nilai penuh bagian pilihan ganda.
24. `EXAM_QID_POINTS` di halaman ujian dibangkitkan dari `_examQPoints` server, tidak pernah disunting tangan. Tabel itu hanya penyebut tampilan; poin per soal dan nilai resmi tetap datang dari server.
