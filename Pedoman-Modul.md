# Pedoman Sistem Modul, Exam, dan OBE

> **Status:** acuan keadaan sistem saat ini, diperbarui 10 Agustus 2026
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

**Pemodelan Computer Aided Design (CAD) — Tahap 1 (13 September 2026).** Mata kuliah semester 2 ini ditambahkan bertahap atas keputusan dosen. Yang sudah ada: `Attributes/Asesmen-Pemodelan-Computer-Aided-Design.json` (bobot dari SIA), `Attributes/students.json` (11 mahasiswa), `OBE/Penilaian-OBE.htm`, `Unduhan-Gabungan/RPS-Pemodelan-Computer-Aided-Design.pdf`, kartu di `index.html`, dan baris `rsync` di `deploy-slides.yml`. Yang **sengaja belum** dibuat: Banner, Modul, Modul-Word, Exam, dan bentuk Tugas (masih diputuskan dosen).

- **Bobot mengikuti SIA** (TGS 55%, UTS 22%, UAS 23%), bukan komponen penilaian RPS (UTS 50%/UAS 50%, bobot mingguan Σ92%) yang tidak konsisten dengan SIA.
- Kelas sudah dibuka: SIA kelas 354322, `kode_mk` `W132500006`, kelas `2A2132FF`, Selasa 19:30–22:00 (19 September 2026); RPS masih memakai kode lama `W132100008`. Roster 11 mahasiswa dari presensi SIA; akun simulasi ditambahkan saat modul dibuat.
- Backend hanya menambahkan `pemodelan_cad` ke `OBE_MAPPING_COURSES` agar mapping OBE bisa disimpan. `computeObeScores` menolak course ini dengan pesan jelas karena belum ada di `OBE_COURSE_EXAMS`.
- `validate-public-security.mjs` memindai halaman OBE-nya lewat `obeOnlyRoots` (bukan `courseRoots`, yang mewajibkan `Exam/UTS.html` dan `Exam/UAS.html`); hitungan halaman ber-autentikasi menjadi 74 (75 setelah OBE Teknik Tenaga Listrik, 76 setelah Modul 1-nya terbit).
- Saat modul dan ujian dibuat: pindahkan ke `courseRoots` dan daftar di `validate-all-course-modern-design.mjs` (serta sesuaikan hitungan modul dan halaman ber-autentikasi), tambahkan ke `_MODUL_COURSES`, `EXAM_CONFIG`, `OBE_EXAM_CONFIG`, `OBE_COURSE_EXAMS`, keempat daftar course di `database.rules.json`, registry dan basis pengetahuan chat, lima alat `Admin/`, isi `DEFAULT_MAPPING` UTS/UAS di halaman OBE, lalu isi roster.

**Pemodelan CAD — Tahap 2: Modul 1 dan jalur unggah berkas (20 September 2026).** Perangkat lunak yang dipakai **FreeCAD 1.0**. Tugas per modul = **10 PG + 5 tugas pemodelan** (6/6/6/11/11 poin = 40; total 50). Tiap tugas pemodelan mengunggah **berkas `.FCStd`** langsung di kartu tugas dan mengisi **satu angka bacaan** dari FreeCAD (Area, Shape.Length, CenterOfMass) yang parametrik per NIM; server menolak penilaian sebelum berkas ada. Modul 1–4 berisi tugas 2D (Draft/Sketcher). **Sejak 24 September 2026 isi berkas divalidasi server** (backend PR #78): pembaca Python `bacaFcstd` membaca geometri yang tersimpan di `.FCStd`, sehingga unggahan tanpa geometri ditolak dan angka ketikan harus terbaca dari model yang diunggah (aturan baca per tugas di backend); angka yang tidak ada di berkas ditolak tanpa dihitung dan tanpa mengunci soal. **Kirim ulang (modul saja):** kiriman salah bernilai 0 tetapi tidak mengunci; mahasiswa boleh memperbaiki model, mengunggah ulang, dan mengirim ulang tanpa batas, dan kiriman benar setelah pernah salah bernilai 65% dari poin tugas (× 0,65 lagi bila terlambat). Partial 0,5 tidak lagi berlaku di tugas modul; attempt lama yang sudah mendapat partial mempertahankan poinnya dan boleh dikirim ulang. Kunci dan penjelasan baru ditampilkan setelah tugas benar. UTS/UAS CAD tetap satu kesempatan (partial 0,5), dengan validasi isi berkas yang sama.

- **Halaman:** `Pemodelan-Computer-Aided-Design/Modul/Modul-1.html` dibangun `scripts/cad-modul/bangun-modul-1.py` dari kerangka TTL Modul 1 (semua lapisan injektor ikut) dengan konten `scripts/cad-modul/modul_1.py` dan `animasi/modul-1.js` (helper `pustaka.py`, `animasi/dasar.js` — salinan dari `scripts/ttl-modul/`). Tab: Setup FreeCAD (instalasi dan preferensi), Setup Python (`scripts/cad-modul/setup_python.py`: Miniconda + env `pemodelan_cad` + VS Code + uji `freecadcmd`; halaman `page-python`, CSS-nya salinan blok `#page-setup`), Modul (9 bagian, 6 gambar, 4 animasi, 3 cell Python console FreeCAD), Tugas, Forum, Hasil; tab Pembagian Kelompok, Pyodide, dan pemanasan `getPyodide()` dibuang. Setiap kartu tugas T1–T5 memuat gambar acuan simbolik (`scripts/cad-modul/tugas_gambar.py`, `tugas_gambar_html(N)`; simbol mengikuti teks tugas, angka dimuat per NIM). Urutan regenerasi: `bangun-modul-1.py` → `tambah-progres-modul.mjs` → `bangun.py 2..N` → `tambah-progres-modul.mjs` (bangun.py membuang kotak centang Modul 1 sebelum menyalin, jadi injektor harus sudah berjalan). Gambar materi diperiksa agar teks tidak saling menimpa (`teks2()` di `pustaka.py` memecah keterangan panjang). **Teks SVG memakai `'Inter'` yang tidak dimuat halaman** (halaman hanya memuat Source Sans 3, Playfair Display, JetBrains Mono; `@import` Inter di berkas hanya milik templat ekspor tugas), sehingga gambar tampil dengan font sistem perangkat, dan font sistem Mac/iPhone lebih lebar daripada Windows. **Pemeriksa tata letak yang berlaku adalah `python scripts/cad-modul/periksa_gambar_chrome.py --semua` lalu `--semua --inter`** (Chrome headless, `getBBox` nyata; `--inter` memuat Inter dari Google Fonts sebagai pendekatan lebar font Mac). Keduanya harus "0 cacat": teks keluar kanvas, sisa < 16 px dari tepi kanan (di mode Inter hanya peringatan), < 6 px dari tepi lain, tinta dua teks bersentuhan, teks memotong `<rect>`, atau garis mencoret tinta huruf; tumpang/sentuh yang hanya mengenai kotak getBBox kosmetik. Sejak 22 September 2026 aturan KOTAK memakai posisi `<rect>` sesudah transformasi elemen/grupnya, sama seperti teks (sebelumnya kotak di dalam `<g transform>` dibandingkan pada koordinat mentah). `periksa_gambar.py` hanya menaksir lebar (0,46 em per huruf) dan meloloskan teks hingga 4 px melewati tepi: pada 21–22 September 2026 pemeriksa Chrome menemukan 179 temuan di 40 dari 70 gambar tugas dan puluhan di gambar materi yang semuanya lolos `periksa_gambar.py` — label dicoret garis, baris catatan terpotong tepi kanan, label es/ei zona g6 Modul 12 tertukar, dan angka dimensi Modul 4 yang salah tempat ("70" di Gambar 1 tergambar seluruhnya di luar kanvas) karena helper `_dim` menimpa parameter `dy`. Semua 168 gambar (98 materi + 70 tugas) sudah dirapikan. **Gambar 7 tiap modul adalah gambar kerja praktik terbimbing** di awal bagian 09, sebelum kartu langkah: setiap angkanya membaca konstanta yang sama dengan teks langkah sehingga keduanya tidak bisa menyimpang, dan `periksa_modul.py` menuntut 7 gambar dengan Gambar 7 di `m-praktik` tanpa `rgba()`. Pengurai SVG MuPDF di generator Word mencetak `rgba()` dan isian gradien `url(#…)` sebagai hitam pekat, mengabaikan `fill-opacity` pada `<text>`, dan mengabaikan `stroke-dasharray`. Sejak 22 September 2026 `warna_mupdf()` (kini di `scripts/svg_word.py`, modul render SVG→PNG yang dipakai bersama generator Word CAD dan TTL) mengolah salinan SVG untuk Word lebih dulu (`rgba()` → `rgb()` + `fill-/stroke-opacity`, alpha teks → `opacity`, kotak bergradien → PNG ber-alpha dengan sudut membulat), sehingga 134 dari 168 gambar yang dulu bercetak blok hitam kini sama dengan halaman web; halaman modulnya sendiri tidak berubah. `garis_putus_mupdf()` (22 September 2026) lalu memecah setiap bentuk bergaris putus (line, polyline, polygon, rect, circle, ellipse, path — 453 elemen di 125 gambar, termasuk garis sumbu titik-strip dan banyak garis di Gambar 7) menjadi strip nyata di sepanjang path setaranya menurut SVG 2, dengan titik awal, arah, dan `stroke-dashoffset` yang sama dengan peramban; isian bentuknya tetap. Dibandingkan piksel demi piksel dengan render Chrome (tanpa teks, 2 px/unit, toleransi 1 px), selisihnya turun dari 81.395 menjadi 442 piksel dan gumpalan sisa terbesar 4 piksel (anti-alias di ujung strip). Kedua fungsi berhenti dengan galat jelas bila menemui bentuk yang belum didukung (misalnya `pathLength`), bukan diam-diam mencetak hitam atau garis utuh. **Animasi kanvas (22 September 2026):** lebar kanvas mengikuti kolom halaman, tingginya bawaan 280. Lebar nyata: layar ≥ 1366 px → 1000, 1024 → 800, 768 → 570, ponsel 414/390/360/320 px → 298/274/244/204; tablet dan ponsel mendatar memberi lebar di antaranya. Keterangan satu baris berposisi tetap dulu terpotong di hampir semua animasi di ponsel, sebagian juga di desktop (label sumbu keluar tepi atas, label yang ikut model saat zoom maksimum). `animasi/dasar.js` kini punya `_TTL_SEMPIT` (520), `_ttlKanvas(id, hSempit)` (kanvas lebih tinggi saat sempit) dan `_ttlTeks(ctx, teks, x, y, maxW)` (kecilkan huruf sampai 85 % lalu pecah per kata); tiap `animasi/modul-N.js` punya cabang tata letak `sempit`. **Pemeriksanya `python scripts/cad-modul/periksa_animasi_chrome.py`** (Chrome headless; halaman uji dirakit dari `materi()` + skrip animasi, jadi tanpa membangun ulang): 33 lebar 1000..204, siklus 460 bingkai pada slider bawaan/min/maks, kisi keadaan dijeda, dan `requestAnimationFrame` dimatikan agar deterministik. Pada lebar ≥ 244 teks terpotong, huruf < 8 px, teks bertumpuk, garis yang mencoret tinta teks (label duduk di atas garis; kisi samar beropasitas < 0,2 diabaikan), atau galat JavaScript = cacat; semua 56 animasi kini nol (dari 1.250 teks terpotong dan ±900 label di atas garis pada pengukuran awal). Label yang memang harus menumpang garis (nilai dimensi di tengah garis dimensinya, label di atas kurva) memakai `_ttlLabel`, yang menggambar pelat warna latar di belakang teks sehingga garis yang digambar sebelumnya terputus. `--cepat` untuk iterasi, `--gambar DIR` menyimpan PNG tiap kanvas. Mengubah skrip animasi: jalankan pemeriksa ini, lalu bangun ulang halaman modulnya. Memperbaiki gambar modul yang sudah terbit: `bangun.py N` → `tambah-progres-modul.mjs` → `pasang-tautan-pdf.py`, lalu bangun ulang Word/PDF modul itu; pada pembangunan ulang, `bangun.py` tidak menyentuh CLAUDE.md dan Pedoman karena hitungannya tidak berubah.
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
  (#938); kini `bangun.py uts|uas` kembali mereproduksi halaman live byte demi byte. Kartu tugas ujian mengikuti
  validasi isi berkas di server: pesan unggah menampilkan ringkasan geometri, konfirmasi kirim menyebut bahwa angka
  harus terbaca dari geometri berkas, dan penolakan server (angka tidak ada di model) tampil sebagai peringatan tanpa
  mengunci kartu. Ujian tetap satu kesempatan dengan partial 0,5.
- **Kartu tugas** (`c1`–`c5`, label T1–T5): input berkas + tombol ⬆ Unggah (`unggahBerkasTugas`: ekstensi dari server, maks 8 MB, tanda ZIP + `Document.xml`; boleh diganti selama belum dikirim) + kolom angka (`kirimTugas` → `checkModulAnswer` dengan `userAnswer` angka, koma/titik desimal diterima) + konfirmasi kirim. Respons `bisaUlang` membuka kartu lagi lewat `_bukaKirimUlangCad` (tombol "🔁 Kirim Ulang (maks 65%)", unggah aktif, `berkasDiServer` membolehkan kirim tanpa unggah ulang); penanda RTDB `cN_comp_ulang` (dan `_comp_used`/`_comp_partial` lama) dipulihkan sebagai kartu terbuka, dan `window._cadSudahKirim` membuat ekspor tetap siap. Penolakan server (angka tidak terbaca dari berkas, berkas tak terbaca) ditampilkan sebagai peringatan tanpa mengunci. `SCORE_CONFIG`: `COMP_EZ_COUNT 3 × 6`, `COMP_HARD_COUNT 2 × 11`, `_isHardComp` = c4–c5, konsolasi 12 dari 15 soal. Ringkasan berkas yang dinilai dipulihkan dari RTDB `codes/<qId>`; angka dan metadata unggahan yang belum dikirim disimpan di draft localStorage per NIM. Tautan Google Drive opsional. Ekspor HTML memuat nama berkas, ukuran, SHA-256, dan angka bacaan.
- **Backend:** `_MODUL_COURSES` `{ slug: "pemodelan_cad", id: "pemodelan_cad", moduls: [1], consolationThreshold: 12 }`, bank `functions/modules/cad-modul-all-v2.js` (+ `cad-modul-1.js`, `cad-helpers.js`), seed `seed/modul/pemodelan_cad-modul-1-answers.js`, PG diacak per NIM, `pemodelan_cad` di keempat daftar course `database.rules.json`, penjaga `scripts/verify-cad-modules.js`. Berkas di bucket privat `getaran-mekanik-tugas` (`tugas/<modulId>/mhs_<nim>/<qId>/<nama>`), metadata Firestore `tugasBerkas/`. Callable: `unggahBerkasTugas` (mahasiswa), `unduhBerkasTugas` (dosen, atau pemilik dengan PIN), `daftarBerkasTugas` (dosen).
- **Modul-Word CAD (21 September 2026) diturunkan dari HTML-nya oleh generator** `scripts/cad-modul/buat-modul-word.py N` (atau `--semua`; jalankan dengan `PYTHONIOENCODING=utf-8`). Polanya sama dengan TTL — kerangka sampul/header/footer BOP dari `Sistem-Kendali-Cerdas/Modul-Word/Modul-1-…docx`, panel MODUL INTERAKTIF dari `panel-modul-interaktif-docx.py`, SVG dirender PNG lewat PyMuPDF setelah `warna_mupdf()` mengganti `rgba()` dan gradien yang oleh MuPDF dicetak hitam dan `garis_putus_mupdf()` memecah garis putus-putus yang oleh MuPDF dicetak utuh — dengan empat beda khas CAD. (a) **Tidak ada RPS JavaScript untuk CAD**, sehingga "Bahan kajian" diambil dari paragraf cakupan `Banner/Banner-Pertemuan-P.html` (Pertemuan 8 = UTS, jadi Modul 8–14 memakai banner 9–15) dan chip banner menjadi butir "Kata kunci"; "Indikator" dirakit dari butir yang benar-benar dinilai di halaman modul (jumlah PG, kelima label tugas beserta poin 6/6/6/11/11 dan bentuk setorannya, jumlah pertanyaan forum); Sub-CPMK/bobot/SKS/kode MK dari berkas asesmen. Tidak ada kalimat yang dikarang di luar repo. (b) Bagian tugas berjudul "Bagian A — Pilihan Ganda" dan "Bagian B — Tugas Pemodelan FreeCAD (unggah .FCStd + angka bacaan)", bukan Komputasi Mudah/Sulit; `compEzDefs` dan `compHardDefs` dibaca per-array (regex menyapu seluruh berkas akan mencampur c1–c5). (c) Gambar acuan tugas ikut dicetak — labelnya simbolik (a, b, h, rᵢ, rₒ, θ) tanpa angka per-NIM, dan karena teks tugas dirakit server, gambar itulah satu-satunya isi tugas yang bisa disiapkan mahasiswa lebih awal. (d) `div.warning-box` khas CAD ikut sebagai kotak catatan, dan sampulnya dua baris `PEMODELAN`/`CAD` karena nama penuh tidak muat di kotak judul. Lanjutan pipeline: `python scripts/docx-ke-pdf.py Pemodelan-Computer-Aided-Design/Modul-Word/*.docx` → `python scripts/cad-modul/pasang-tautan-pdf.py` (`--periksa` melapor; idempoten) → `python scripts/gabung-pdf-modul.py --buat-baru` (`Modul-Gabungan-Pemodelan-Computer-Aided-Design.pdf`, 303 halaman; skrip itu menulis ulang berkas gabungan **semua** course, jadi kembalikan lima berkas course lain dengan `git checkout --` agar diff tetap sempit). Hasil render 14 PDF: 18–25 halaman per modul, di atas minimum 10 halaman isi §15. **`bangun-modul-1.py` dan `bangun.py` mengosongkan kembali `MODUL_PDF_URL`/`MODUL_PDF_FILENAME` setiap kali dijalankan**, jadi `pasang-tautan-pdf.py` harus diulang sesudahnya — dan bangun ulang Word-nya juga bila `modul_N.py` berubah, agar dokumen tetap identik dengan halaman.
- **Dosen:** `Admin/berkas-tugas.html` mendaftar dan mengunduh berkas per modul beserta status penilaian (berkas akun simulasi disaring kecuali dicentang). Course CAD juga ada di pilihan `reset-soal`, `rescale-deadline`, `verify-export-code`, `analyze-victims`.
- **Validator:** modul CAD dihitung `validate-all-course-modern-design.mjs` lewat `moduleCount` (1); CAD tetap di `obeOnlyRoots` validator keamanan sampai UTS/UAS-nya ada. Hitungan: 84 modul dengan tombol ekspor terjaga dan 108 halaman ber-autentikasi (96 Modul/Exam + 6 OBE + 6 Admin). Roster memuat akun simulasi. Daftar "belum" pada tahap ini — UTS/UAS, `OBE_COURSE_EXAMS`, registry chat AI backend, versi Word/PDF, banner LMS — **seluruhnya sudah terbit 20–21 September 2026**; CAD kini dipindai lewat `courseRoots`. Yang masih tersisa hanya jadwal `settings/pemodelan_cad/…` yang belum diisi dosen.

**Teknik Tenaga Listrik — Tahap 1 (13 September 2026).** Mata kuliah semester 5 (kelas SIA 354290, `W132500023`, `2A51362F`, Sabtu 12:00–13:40), ditambahkan dengan pola yang sama seperti Pemodelan CAD: `Attributes/Asesmen-Teknik-Tenaga-Listrik.json`, `Attributes/students.json` (20 mahasiswa dari presensi SIA), `OBE/Penilaian-OBE.htm`, `Unduhan-Gabungan/RPS-Teknik-Tenaga-Listrik.pdf`, kartu di `index.html`, baris `rsync`, `obeOnlyRoots`, dan `teknik_tenaga_listrik` di `OBE_MAPPING_COURSES`. Sejak 14 September 2026 modulnya dibangun satu per satu atas permintaan dosen (modul berikutnya menunggu persetujuan modul sebelumnya): **Modul 1–14, UTS, dan UAS sudah terbit** (Modul 2–9 dan UTS pada 19 September 2026, Modul 10–14 dan UAS pada 20 September 2026; UTS = `teknik-tenaga-listrik-uts`, 45 soal parametrik, cakupan Sub-CPMK 1.1/1.2/1.3/2.1/3.1 sesuai matriks SIA); **Modul-Word 1–14 (docx + PDF) dan `Unduhan-Gabungan/Modul-Gabungan-Teknik-Tenaga-Listrik.pdf` terbit 20 September 2026** (lihat butir Modul-Word di bawah). Banner LMS untuk seluruh semester sudah ada (lihat butir Kelas LMS di bawah).

- **RPS sudah diselaraskan dengan SIA (14 September 2026).** RPS Juni 2025 memakai 6 CPMK dan 13 Sub-CPMK dengan rumusan lain serta bobot 60/20/20. `Unduhan-Gabungan/RPS-Teknik-Tenaga-Listrik.pdf` kini disusun ulang dari `Asesmen-Teknik-Tenaga-Listrik.json`: 7 CPMK, 14 Sub-CPMK, TGS 43%/UTS 25%/UAS 32%, CPL2/CPL5/CPL6 = 21/57/22 (CPL2 ← CPMK 1; CPL5 ← CPMK 2–5; CPL6 ← CPMK 6–7). Tata letaknya mengikuti RPS lama (sampul, Satuan Acara Perkuliahan, RPS, catatan); pengembang dan pengesah RPS tetap, dengan catatan revisi. Bila bobot di SIA berubah, RPS harus disusun ulang bersama berkas asesmen. Skrip penyusunnya ada di `scripts/rps-teknik-tenaga-listrik/buat-rps.js` (butuh paket `docx` dan LibreOffice). Setiap modul yang terbit dicocokkan dengan baris minggunya (materi, indikator, pustaka); baris minggu 1–7 dan 9–15 sudah diperbarui mengikuti Modul 1–14, termasuk von Meier (2006) dan Chapman (2012) di pustaka pendukung.
- Halaman OBE-nya merender jumlah kolom CPMK (7) dan CPL secara dinamis; templat lama mengunci 5 CPMK dan 4 CPL.
- **Modul-Word TTL (20 September 2026) diturunkan dari HTML-nya oleh generator** `scripts/ttl-modul/buat-modul-word.py N` (atau `--semua`; jalankan dengan `PYTHONIOENCODING=utf-8`). Sumber kebenarannya `Modul-N.html`: hero → Pendahuluan dan abstrak sampul, setiap `div.section` → heading beserta paragraf, gambar SVG (dirender PNG lewat PyMuPDF oleh `scripts/svg_word.py`, modul yang sama dengan CAD: `<` dan `&` telanjang di-escape, warna disesuaikan `warna_mupdf`, dan sejak 22 September 2026 garis putus-putus dipecah menjadi strip oleh `garis_putus_mupdf` — 41 elemen di 26 gambar TTL yang sebelumnya tercetak utuh; selisihnya terhadap render Chrome turun dari 37.100 menjadi 48 piksel. Perluasan kanvas dipakai seperti CAD sejak ke-84 gambar TTL dirapikan pada 22 September 2026; tidak ada gambar TTL yang kini meluap di MuPDF), persamaan bernomor, kartu, tabel, kotak info/tip, panel animasi, dan blok kode; tab Tugas → PG dan label C1–C15 tanpa kunci; tab Forum → skenario dan pertanyaan; Daftar Pustaka = kartu pustaka modul + jurnal/standar klasik per modul yang tercantum di `JURNAL` (tanpa tautan DOI; pustaka klasik yang dosen boleh ganti). Kerangkanya sampul/header/footer BOP dari `Sistem-Kendali-Cerdas/Modul-Word/Modul-1-…docx` dengan identitas diganti di XML (kode MK `W132500023`, tahun 2026–2027, kotak "Modul N"/abstrak/Sub-CPMK diatur ulang agar tidak terpotong), panel MODUL INTERAKTIF dari `panel-modul-interaktif-docx.py`, dan media Sisken yang tidak terpakai dibuang. Nama berkas `Modul-N-<Judul-Tanpa-Diakritik>.docx` dari `pustaka.nama_berkas_word`, dan `bangun.py` kini menulis `MODUL_PDF_URL`/`MODUL_PDF_FILENAME` yang sama ke halaman modul (`scripts/ttl-modul/pasang-tautan-pdf.py` untuk memasangnya ulang; `--periksa` melapor). Lanjutan pipeline: `python scripts/docx-ke-pdf.py Teknik-Tenaga-Listrik/Modul-Word/*.docx` → `python scripts/gabung-pdf-modul.py --buat-baru` (Modul-Gabungan-Teknik-Tenaga-Listrik.pdf; PDF gabungan course lain tidak boleh berubah). Hasil render 14 PDF: 18–24 halaman per modul, di atas minimum 10 halaman isi §15. Setelah mengubah `modul_N.py`/`bangun.py`, bangun ulang Word-nya juga agar tetap identik dengan HTML.
- Pemetaan Modul N → Sub-CPMK ke-N ditetapkan di RPS revisi: Modul 1–7 minggu 1–7, UTS minggu 8, Modul 8–14 minggu 9–15, UAS minggu 16. Cakupan ujian SIA cocok dengan urutan ini (UTS Sub-CPMK 1.1–3.1, UAS 3.2–7.2).
- Roster memuat akun simulasi (`41399999901`) sejak Modul 1 terbit.
- **Modul 1 — Konsep Dasar Sistem Tenaga Listrik (Sub-CPMK 1.1)** dibangun dari kerangka Sisken Modul 1 (6 tab, 9 bagian materi, 6 gambar, 5 animasi, 4 cell Python) dengan skrip sekali pakai, sehingga semua lapisan injektor sudah ada; `tambah-progres-modul.mjs` menyisipkan 9 kotak centang. Tugas memakai struktur universal 25 soal/50 poin: 10 PG diacak per NIM (`mcOrderVersion: 1`) dan 15 komputasi parametrik per NIM dari `functions/modules/ttl-modul-all-v2.js` (satu berkas bank untuk seluruh modul TTL, modul ditambah lewat `register()`); kunci PG di `functions/seed/modul/teknik_tenaga_listrik-modul-N-answers.js`, penjaganya `scripts/verify-ttl-modules.js`.
- Backend hanya mendaftarkan modul yang sudah terbit lewat `moduls: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]` pada entri `_MODUL_COURSES`. Modul yang belum terdaftar ditolak callable progres dan gerbang antar-modul meloloskan modul sesudahnya, jadi setiap modul baru wajib ditambahkan di sana bersama bank, seed (`seed_scope=modul:custom`), dan halamannya, dengan urutan deploy backend lebih dulu.
- Validator: TTL sudah masuk `courseRoots` validator keamanan (UTS dan UAS lengkap sejak 20 September 2026); `validate-all-course-modern-design.mjs` memeriksanya lewat `moduleCount` (sekarang 14, lengkap). Hitungan: 70 modul dengan tombol ekspor terjaga dan 91 halaman ber-autentikasi admin (80 Modul/Exam). `OBE_COURSE_EXAMS` backend dan `verify-obe-mapping.js` memuat TTL (UTS+UAS); halaman OBE TTL memuat `DEFAULT_MAPPING.uts` dan `.uas` (MAP_KEY v5).
- **Modul 2 dst (sejak 19 September 2026) dibangun generator** `scripts/ttl-modul/bangun.py N` dari `Modul-1.html` TTL (kerangka yang sudah memuat semua lapisan injektor) dan konten `scripts/ttl-modul/modul_N.py` + `animasi/modul-N.js`; helper bersama di `pustaka.py` dan `animasi/dasar.js`. **Gambar SVG TTL diperiksa `python scripts/ttl-modul/periksa_gambar_chrome.py` lalu `--inter`** (pembungkus pemeriksa CAD: aturan, getBBox, dan kotak tinta yang sama, sumbernya `gambar1..6` tiap `modul_N.py`); keduanya harus "0 cacat". Pada 22 September 2026 pemeriksa ini menemukan 405 cacat di 67 dari 84 gambar yang semuanya tampil di halaman web — keterangan satu baris lebih lebar dari gambarnya, label bertumpuk atau dicoret garis, batang 500 kV Modul 8 Gambar 2 di luar kanvas (pembagi posisi 3 untuk empat tingkat), kurva yang keluar sumbu (M3 G4, M6 G3, M14 G3), label berkas-2 M8 G6 di x ≈ 1800 — dan kecepatan rambat "0×10³ km/s" di M6 (gambar dan teks materi; kini 296×10³ km/s). Semuanya dirapikan. Bantuan di `pustaka.py`: `teks2` memecah keterangan panjang, dan `svg()` memanggil `lubangi_kisi`, yang memutus garis kisi (stroke `GRID`, tebal 0,7) tepat di belakang setiap label sehingga label di dalam grafik tidak dicoret kisi. Memperbaiki gambar TTL yang sudah terbit: Modul 2–14 lewat `bangun.py N` → `tambah-progres-modul.mjs` → `pasang-tautan-pdf.py` (jalur ini mereproduksi halaman live byte demi byte bila sumbernya tidak berubah); Modul 1 dibangun skrip sekali pakai dari halaman Sisken, jadi SVG gambarnya diganti di tempat dengan keluaran `modul_1.gambarK()`. Lalu bangun ulang Word/PDF-nya. Generator mengganti identitas ber-angka, subnav, hero, materi, PG, forum (beserta salinan LMS dan kanvas), animasi, dan label ekspor, lalu membuang tab Setup Python dan Pembagian Kelompok (pola Sisken Modul 2–14). Setelah membangun: jalankan `tambah-progres-modul.mjs` (kotak centang), naikkan `moduleCount` dan hitungan validator keamanan, tambah tautan di `index.html`, tambah nomor ke `PUBLISHED` di `ttl-banner.mjs` lalu `node scripts/ttl-banner.mjs`, dan cocokkan baris minggunya di RPS. Backend: `functions/modules/ttl-modul-N.js` + seed + nomor di `moduls` + deploy dan seed `modul:custom` **sebelum** merge frontend. Modul 2 (Komponen Sistem Tenaga Listrik, Sub-CPMK 1.2): 9 bagian, 6 gambar, 10 persamaan, 4 animasi, 4 cell. Modul 3 (Daya pada Jaringan DC Satu Sumber, Sub-CPMK 1.3): 8 bagian, 6 gambar, 10 persamaan, 4 animasi, 4 cell. Modul 4 (Daya pada Jaringan DC Dua Sumber, Sub-CPMK 2.1): 8 bagian, 6 gambar, 10 persamaan, 4 animasi, 4 cell; angka contohnya sengaja berbeda dari varian soal C1–C15. Modul 5 (Daya pada Jaringan Listrik AC, Sub-CPMK 2.2): 8 bagian, 6 gambar, 10 persamaan, 4 animasi, 4 cell; bangun dengan `PYTHONIOENCODING=utf-8` agar cetakan pemeriksaan sisa tidak gagal di konsol cp1252. Modul 6 (Aliran Daya dan Transien Saluran Transmisi, Sub-CPMK 3.1): 8 bagian, 6 gambar, 10 persamaan, 4 animasi, 4 cell. Modul 7 (Reaktansi dan Impedansi di STL, Sub-CPMK 3.2): 8 bagian, 6 gambar, 10 persamaan, 4 animasi, 4 cell. Modul 8 (Saluran Transmisi, Sub-CPMK 4.1, Pertemuan 9): 8 bagian, 6 gambar, 8 persamaan, 4 animasi, 4 cell. Modul 9 (Pemodelan Saluran Transmisi, Sub-CPMK 4.2, Pertemuan 10): 8 bagian, 6 gambar, 9 persamaan, 4 animasi, 4 cell. Modul 10 (Kompensasi dalam Sistem Distribusi, Sub-CPMK 5.1, Pertemuan 11): 8 bagian, 6 gambar, 6 persamaan, 4 animasi, 4 cell. Modul 11 (Konsep dan Teori Dasar Sistem Distribusi Tenaga Listrik, Sub-CPMK 5.2, Pertemuan 12): 8 bagian, 6 gambar, 6 persamaan, 4 animasi, 4 cell. Modul 12 (Aliran Daya, Peralatan, dan Pengembangan Sistem Distribusi, Sub-CPMK 6.1, Pertemuan 13): 8 bagian, 6 gambar, 6 persamaan, 4 animasi, 4 cell. Modul 13 (Metode Single Line Diagram, Sub-CPMK 7.1, Pertemuan 14): 8 bagian, 6 gambar, 6 persamaan, 4 animasi, 4 cell. Modul 14 (Metode Analisis Aliran Daya, Sub-CPMK 7.2, Pertemuan 15): 8 bagian, 6 gambar, 6 persamaan, 4 animasi, 4 cell.
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

## 3. Identitas modul, pertemuan, dan path Firebase

Nomor file modul tidak selalu sama dengan nomor pertemuan. Pertemuan 8 ditempati UTS.

```text
Modul 1–7  → Pertemuan 1–7
Modul 8–14 → Pertemuan 9–15
```

Rumusnya: `P = N` untuk `N <= 7`, dan `P = N + 1` untuk `N >= 8`. Rumus ini dipakai `_segmentsForModul()` di backend untuk **keempat** course, termasuk Sistem Kendali Cerdas.

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

### 3.2 Path modul

| Course | Visitor | Jadwal | Presence | Chat |
|---|---|---|---|---|
| Matematika 4 | `visitors/math4/modul-N` | `settings/math4/pertemuan-P/schedule` | `presence/math4/modul-N` | `chat/math4/modul-N/messages` |
| Getaran | `visitors/getaran_mekanik/pertemuan-P` | `settings/getaran_mekanik/pertemuan-P/schedule` | `presence/getaran_mekanik/pertemuan-P` | `chat/getaran_mekanik/pertemuan-P/messages` |
| Optoauto | `visitors/optoauto/pertemuan-P` | `settings/optoauto/pertemuan-P/schedule` | `presence/optoauto/pertemuan-P` | `chat/optoauto/pertemuan-P/messages` |
| Sisken | `visitors/sistem_kendali_cerdas/pertemuan-P` | `settings/sistem_kendali_cerdas/pertemuan-P/schedule` | `presence/sistem_kendali_cerdas/pertemuan-P` | `chat/sistem_kendali_cerdas/pertemuan-P/messages` |
| TTL | `visitors/teknik_tenaga_listrik/pertemuan-P` | `settings/teknik_tenaga_listrik/pertemuan-P/schedule` | `presence/teknik_tenaga_listrik/pertemuan-P` | `chat/teknik_tenaga_listrik/pertemuan-P/messages` |

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

ID, slug, path, localStorage key, konfigurasi backend, seed, dan OBE mapping harus berubah bersama. Jangan menyalin prefix course asal saat membuat halaman baru.

---

## 4. Peran, login, dan sesi

### 4.1 Role picker

Halaman modul dan exam membuka pemilih peran sebelum akses penilaian:

- **Mahasiswa:** NIM dan PIN; nama diambil dari roster.
- **Dosen:** password admin, kemudian dapat mengatur jadwal atau masuk untuk meninjau soal exam.
- **Mode Preview:** akses tanpa identitas untuk melihat struktur halaman, tanpa penilaian.

Pada seluruh UTS dan UAS, login dosen otomatis membuka tab **Soal Ujian** dalam mode hanya-baca. UTS maupun UAS mengambil teks soal melalui `getExamQuestions` memakai sesi Firebase dengan claim admin, sehingga dapat ditinjau tanpa menunggu jadwal mahasiswa. Mode dosen tidak boleh mengirim jawaban, membuat attempt, menambah poin, atau membuat export mahasiswa.

Tombol perpindahan sesi bernama **Log Out**, bukan “Ganti Peran”. Logout menghapus identitas lokal, sesi PIN, presence, dan sesi Firebase Auth yang relevan, lalu mengembalikan pengguna ke pemilih peran.

### 4.2 Mode Preview

Pada modul:

- tab **Tugas** dan **Forum** beserta panelnya disembunyikan;
- jika navigasi lama mencoba membuka keduanya, halaman kembali ke tab Modul;
- soal tidak dapat dikirim, poin tidak dicatat, dan export dinonaktifkan.

Pada exam:

- handler jawaban dan export tetap dinonaktifkan;
- teks soal **tidak tampil**, baik UTS maupun UAS. Bank soal keduanya diambil dari server lewat `getExamQuestions`, yang mensyaratkan sesi mahasiswa valid (NIM + PIN + jadwal terbuka) atau sesi admin Firebase. Preview tidak memenuhi keduanya, sehingga panel soal menampilkan pesan terkunci.

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

**Urutan deploy wajib** bila menyentuh alur ini (salah urutan memutus login seluruh mahasiswa): (1) deploy Cloud Functions supaya `verifyPin` ada; (2) merge frontend agar halaman memakainya; (3) baru deploy RTDB Rules yang menutup `pins/`.

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

**Mengganti nama atau PIN:** nama ada di enam `students.json` **dan** di RTDB `pins/mhs_41399999901.nama` (perbarui keduanya; `pins/` hanya bisa ditulis admin SDK karena write-once untuk klien). Mengganti PIN: hapus node `pins/mhs_41399999901`, lalu login sekali dengan PIN baru (alur "Buat PIN" akan menulis hash baru). Jangan pernah menuliskan PIN-nya di repo, commit, atau dokumen ini.

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

> **Penalti 35% seragam:** seluruh mata kuliah memakai pengali 0,65 (potongan 35%). Rollout bertahap yang sempat menahan Optimalisasi & Otomasi, Matematika 4, dan Getaran Mekanik di 0,7 sudah berakhir. Attempt yang terlanjur dinilai dengan pengali lama tetap bernilai seperti saat itu dan tidak dihitung ulang, sebab pengali diterapkan pada saat submit lalu disimpan.

### 5.3 Default modal exam yang benar-benar ada saat ini

| Halaman | Batas akhir ketika belum ada jadwal | Judul modal |
|---|---|---|
| Semua UAS | tanggal WIB saat modal dibuka, 19.30 | Atur Jadwal UAS |
| UTS Getaran | tanggal WIB saat modal dibuka, 19.30 | Atur Jadwal UTS |
| UTS Matematika | waktu WIB sekarang + 180 menit | Atur Jadwal Perkuliahan |
| UTS Optimalisasi | waktu WIB sekarang + 180 menit | Atur Jadwal Perkuliahan |
| UTS Sisken dan UTS Teknik Tenaga Listrik | tanggal WIB saat modal dibuka, 19.30 | Atur Jadwal UTS |

Tabel ini mencatat implementasi aktual, bukan menyatakan ketidakkonsistenan tersebut sebagai desain ideal. Jika default UTS diseragamkan, ubah keempat halaman UTS, pemeriksa otomatis, dan bagian ini dalam commit yang sama.

### 5.4 Zona waktu modul

Seluruh 70 modul memakai editor deadline berupa field tanggal dan field teks jam
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

### 5.5 Jadwal ujian susulan (override per mahasiswa)

Selain jadwal global di §5.2, exam punya lapisan kedua opsional di RTDB
`settings/<course>/<slot>/scheduleOverrides/mhs_<NIM>` (lihat §9.1). Ditulis
admin-only lewat callable `rescaleExamLatePenalty` (parameter `nims[]` +
`newEnd`/`newExtension`) atau UI `Admin/rescale-deadline.html`.

- Override hanya boleh mengubah `end`/`extension`, **tidak pernah** `start`.
- Jadwal global dan mahasiswa lain tidak tersentuh — ini per-NIM.
- Kedelapan halaman `UTS.html`/`UAS.html` (4 course × 2 exam) subscribe ke path
  ini secara real-time (`_watchScheduleOverride`/`_mergeSchedule`) dan
  menggabungkannya di atas jadwal global.
- `getExamQuestions` dan `checkExamAnswer` di backend mengevaluasi override
  untuk NIM yang meminta (`evalSchedule(..., nimKey)`), jadi mahasiswa dalam
  jendela override aktif tetap bisa mengambil soal/submit walau jadwal
  global sudah tertutup.

---

## 6. Struktur halaman modul

Modul adalah satu file HTML mandiri yang memuat UI, konten, animasi, Pyodide, dan integrasi Firebase. Susunan tab **berbeda per course** dan tidak ada aturan "harus enam tab":

| Course | Tab |
|---|---|
| Matematika 4, Getaran Mekanik, Optimalisasi | Setup Python · Pembagian Kelompok · Modul · Tugas · Forum · Hasil (6 tab) |
| Sistem Kendali Cerdas — Modul 1 | Setup Python · Pembagian Kelompok · Modul · Tugas · Forum · Hasil (6 tab) |
| Sistem Kendali Cerdas — Modul 2–14 | Modul · Tugas · Forum · Hasil (4 tab) |
| Teknik Tenaga Listrik — Modul 1 | Setup Python · Pembagian Kelompok · Modul · Tugas · Forum · Hasil (6 tab) |
| Teknik Tenaga Listrik — Modul 2–14 | Modul · Tugas · Forum · Hasil (4 tab) |
| Pemodelan CAD — Modul 1 | Setup FreeCAD · Setup Python · Modul · Tugas · Forum · Hasil (6 tab) |
| Pemodelan CAD — Modul 2–5 | Modul · Tugas · Forum · Hasil (4 tab) |

Setup Python dan Pembagian Kelompok hanya ada di Modul 1 tiap course (CAD: Setup FreeCAD + Setup Python, tanpa Pembagian Kelompok); pada Sisken Modul 2–14 dan CAD Modul 2–5 tombol nav, halaman, dan blok gayanya dibuang oleh generator supaya tidak ada tab yang menuju halaman kosong. Jangan "memperbaiki" ketidaksamaan ini dengan menambahkan tab kosong.

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

Seluruh 70 modul memakai satu sistem **modern academic**. Keseragaman berarti komponen, interaksi, dan hierarki visualnya sama; isi, jumlah bagian, jumlah tab, dan aksen course tetap boleh berbeda. Lapisan ini ditandai oleh `body.modern-academic-design`, `<style id="modern-academic-design">`, dan `<script id="modern-academic-runtime">`. Jangan menerapkannya pada halaman exam.

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

Sumber penerapan lintas course adalah `scripts/apply-modern-academic-all-modules.mjs`. Markup hasil normalisasi harus sudah menyimpan kelas tabel dan daftar pustaka secara statis; runtime hanya memulihkan markup lama sebagai fallback. Generator Sisken wajib menghasilkan struktur yang sama secara langsung. Cakupan pemeriksanya dirangkum di §17.1.

Khusus Sistem Kendali Cerdas, modul kelipatan tiga (Modul 3, 6, 9, dan 12) berjenis TMV. Buat ruang melalui aktivitas **Google Meet™ for Moodle** pada menu LMS, lalu pasang tautannya sebagai tombol pada kolom kanan banner pertemuan. Tautan halaman modul juga cukup tersedia pada tombol banner dan tidak perlu dibuat ulang sebagai resource URL terpisah di LMS.

### 6.2 Tugas modul

Struktur universal:

| Bagian | Jumlah | Poin per soal | Maksimum |
|---|---:|---:|---:|
| Pilihan ganda | 10 | 1 | 10 |
| Komputasi Easy/Medium | 10 | 2 | 20 |
| Komputasi Hard | 5 | 4 | 20 |
| **Total** | **25** |  | **50** |

Markup wajib per soal (pernah rusak, jadi ditulis eksplisit):

- setiap soal pilihan ganda butuh **tiga** elemen dengan urutan ini: grup radio `id="rg-mcN"`, lalu tombol `<button class="mc-submit" id="sub-mcN" onclick="checkMC('mcN')" disabled>Periksa Jawaban</button>`, lalu kotak umpan balik `id="fb-mcN"`;
- tombol `sub-mcN` **tidak boleh hilang**: `selectMC()` diakhiri `document.getElementById('sub-' + qId).disabled = false`, sehingga elemen yang tidak ada membuat handler klik melempar `TypeError` di tengah jalan dan pilihan ganda tampak "tidak bisa dipilih". Ini pernah terjadi pada seluruh Sisken Modul 2–14 dan membuat 10 poin PG per modul tak terjangkau;
- penjaganya ada di `scripts/validate-sisken-modules.mjs` — ia memeriksa keberadaan tombol per soal **dan** urutannya. Pemeriksa lama hanya menghitung jumlah grup radio sehingga hilangnya seluruh tombol lolos tanpa keluhan.

Perilaku penilaian:

- jawaban dikirim ke `checkModulAnswer`; kunci berada di Firestore `modulAnswers` dan tidak ada di client;
- pada 14 modul Sisken dan modul Teknik Tenaga Listrik, urutan empat opsi PG diacak deterministik per NIM. Markup tidak membawa huruf kanonik; client mengirim huruf posisi yang terlihat dengan `mcOrderVersion: 1`, lalu server merekonstruksi permutasi memakai `shuffleSeed` dari bank exam dan memetakannya ke huruf kanonik. Payload tanpa versi tetap diperlakukan sebagai huruf kanonik agar frontend lama aman selama deployment bertahap;
- batas perlindungan shuffle PG harus disebutkan jujur: teks opsi masih berada di HTML publik sehingga mahasiswa teknis dapat menghitung ulang permutasi. Mekanisme ini mematikan penyebaran kunci huruf universal, tetapi bukan penghalang kriptografis;
- seluruh Modul 1–14 Sisken memakai komputasi parametrik per NIM. Teks `c1`–`c15` tidak lagi statis di HTML; setelah login ia diambil melalui `getModulQuestions`, sedangkan kunci/toleransi/`explain` tetap di backend privat. Registry bersama berada di `functions/modules/sisken-modul-all-v2.js`; Modul 3 mempertahankan bank pilotnya, sedangkan modul lain memakai tiga skenario topikal dengan parameter fisik berbeda serta nilai kalibrasi varian yang dinyatakan pada teks. Verifikasi `scripts/verify-sisken-all-modules.js` menjalankan 14 × 15 × 100 varian dan menolak toleransi yang saling menerima;
- satu `qId` hanya dapat dicoba sekali sampai direset;
- modul bersifat formatif: server boleh mengembalikan jawaban benar dan penjelasan setelah attempt;
- komputasi dinilai dengan nilai target dan toleransi pada server;
- kandidat numerik dapat berasal dari jawaban utama, angka pertama/terakhir output, dan kandidat per baris `print()`;
- soal Hard dapat memberi partial credit jika dikonfigurasi dan dikerjakan sebelum terlambat. Besarnya diambil dari `partialPoints` pada kunci Firestore: **0,5 poin, seragam di semua mata kuliah**. Attempt yang dinilai sebelum kebijakan ini berlaku tetap bernilai 1 di tiga course lama dan tidak dihitung ulang. Angka ini juga muncul sebagai teks yang dibaca mahasiswa di pengantar Bagian C, jadi ubah keduanya bersama;
- poin terlambat ditentukan backend dan kini seragam: dikalikan 0,65 (potongan 35%) di semua mata kuliah;
- konsolasi satu poin (berbeda dari partial credit) ditentukan backend. Jangan memakai konstanta threshold client sebagai sumber kebenaran.

Poin tampilan modul 0–50 dikonversi menjadi nilai 0–100 untuk headline. Poin mentah tetap dipakai untuk penyimpanan dan OBE.

### 6.3 Penyimpanan dan refresh modul

- Attempt resmi disimpan di Firestore `modulAttempts/<modulId>/students/<nimKey>/qs/<qId>`.
- Ringkasan cepat disimpan pada record visitor RTDB: poin, marker soal, selection, code, dan timestamp.
- Draft yang belum disubmit, seperti kode dan link Drive, disimpan per NIM di localStorage. Teks Forum juga disimpan di localStorage sebagai draft, tetapi salinan resminya ada di server (`saveModulForum`, lihat §6.8) dan dipulihkan saat login.
- Setelah refresh, halaman memuat marker dan data tersimpan sebelum mengizinkan interaksi.
- Jika attempt Firestore ada tetapi transaksi RTDB sebelumnya gagal, submit ulang pada soal terkunci dapat menjalankan self-heal tanpa memberi poin ganda.

### 6.4 Export tugas

Export tugas baru aktif jika:

- seluruh 10 pilihan ganda sudah dijawab;
- seluruh 15 soal komputasi sudah dicoba;
- link Google Drive valid sudah diisi.

File export memuat identitas, jawaban/kode, poin server, waktu, dan kode verifikasi. Nama file harus memuat nomor tugas, NIM, dan course yang benar.

Pada Sisken Modul 2–14, `scripts/sisken-export-html.mjs` menyalin ekor alur export lengkap dari Modul 1 setelah daftar judul PG yang memang spesifik per modul: pengumpulan jawaban, pembangunan dokumen HTML, pembuatan `Blob`, anchor download, dan pembersihan object URL. Generator `enrich-sisken-modules.mjs` wajib menjalankan normalizer ini agar regenerasi materi tidak dapat mengembalikan fungsi export yang berhenti setelah daftar `MC_QUESTIONS`.

**Animasi milik satu modul, bukan dicap ke semua.** Dahulu Modul 2–14 memakai tiga animasi yang sama (respons step, rasio redaman, Bode) apa pun topiknya — animasi respons step sampai tampil di modul Logika Fuzzy. Kini tiap modul punya tiga animasi dan satu grafik sendiri di `scripts/sisken-animasi.mjs` (trio lama menjadi milik Modul 8, satu-satunya modul yang topiknya memang karakteristik respons); `bangunRuntime(n)` hanya menyisipkan fungsi gambar milik modul itu ke halamannya. `validate-sisken-modules.mjs` menegakkan: tiap modul 2–14 tepat 3 panel `Animasi k —` + 1 `Grafik 1 —`, keempat fungsi `drawSiskenAnim1..3`/`drawSiskenGrafik` ada di runtime, dan **judul animasi unik lintas modul** (termasuk terhadap Modul 1) — duplikat berarti animasi generik kembali dicap ke banyak modul.

**Regenerasi Sisken bukan satu perintah.** Setelah `enrich-sisken-modules.mjs`, jalankan ulang skrip pasca-proses yang menambal bagian di dalam `page-modul`: `apply-sisken-all-parametric.mjs` lalu `apply-modern-academic-all-modules.mjs` (keduanya idempoten; skrip apply lain akan melewati halaman yang tambalannya masih utuh). Menjalankan enrich saja menghapus hero `academic-hero`, roadmap, dan CSS panel sticky — `validate-sisken-modules.mjs` dan `validate-all-course-modern-design.mjs` akan menangkapnya. Catatan: skrip apply yang berupa migrasi satu-kali **dihapus setelah hasilnya di-commit** — membiarkannya membuat alur regenerasi tampak lebih panjang dari kenyataannya, dan jangkarnya lapuk begitu halaman berevolusi. Preseden: `apply-module-deadline-wib-24h.mjs` (deadline WIB 24 jam, PR #787) dihapus setelah gagal pada jangkarnya sendiri; hasil migrasinya diverifikasi tetap tertanam di ke-56 halaman (`Asia/Jakarta`, `scheduleDueTime`).

File HTML lokal tetap dapat diedit oleh pemilik file. Kode HMAC tidak mencegah edit; kode itu mendeteksi ketidaksesuaian ketika diperiksa melalui `Admin/verify-export-code.html`.

### 6.5 Forum dan chat

- Tab Forum berisi pertanyaan diskusi dan alat salin HTML untuk LMS.
- HTML yang disalin harus menggunakan struktur yang stabil untuk editor LMS: style inline dan layout tabel lebih aman daripada layout CSS kompleks.
- Kunci jawaban jajak Forum Sisken disimpan pada `window._forumPollAnswerHashes`; jangan memakai nama global generik yang dapat tertimpa skrip lain. Generator menormalkan runtime melalui `scripts/sisken-forum-runtime.mjs`.
- Chat realtime memakai RTDB `chat/<course>/<module>/messages`.
- Pesan baru dibatasi Rules, termasuk panjang teks maksimum 500 karakter.
- Preview tidak menampilkan Forum.

### 6.6 Hasil dan presence modul

Tab Hasil membaca record visitor untuk statistik, aktivitas, dan skor. Presence realtime terpisah dari riwayat kunjungan. Jangan menyimpulkan “online” hanya dari `lastVisit`. Akun simulasi (§4.5) disaring dari papan peringkat, tabel roster, penyebut hadir/total, pembagian kelompok di Modul 1 (sejak 14 September 2026; `renderGroups()` di skrip klasik memakai `window.isSimulasiNim` yang diekspos dari skrip module), dan roster halaman OBE oleh `scripts/kecualikan-akun-simulasi.mjs`; bila menulis fungsi render baru di tab Hasil, saring lagi dengan `isSimulasiNim(nim)`.

### 6.7 Progres materi berurutan dan gerbang antar-modul

Berlaku di keempat course sejak 22 Agustus 2026 (permintaan dosen), dan di Teknik Tenaga Listrik sejak Modul 1 terbit. Diterapkan oleh `scripts/tambah-progres-modul.mjs` (idempoten, penanda `PROGRES-MODUL`) dan empat callable di §10.

- Di akhir setiap bagian materi (`div.section`, kecuali "Daftar Pustaka" dan bagian orientasi "Posisi Anda dan Sisa Waktu" di Sisken) ada kotak centang pernyataan *"Saya sudah mempelajari dan memahami bagian ini — [judul bagian]"* (teks 17 px, panel gradien hijau–sian dengan lencana status). Hanya kotak giliran yang aktif — **untuk semua peran**: centang harus urut dari bagian pertama, satu per satu, dan bagi mahasiswa tidak dapat dibatalkan. Injector membuang kotak lama lalu menyisipkan ulang, jadi perubahan pengecualian/teks cukup dengan menjalankannya kembali. Server (`setModulCentang`) menolak indeks yang tidak urut lewat transaksi Firestore.
- Tab **Tugas, Forum, dan Hasil terkunci** sampai semua kotak dicentang; `switchTab` dibungkus sehingga tab terkunci tidak bisa dibuka lewat jalur lain.
- **Modul dianggap lengkap** bila centang penuh **dan** semua soal tugas sudah dicoba **dan** forum selesai (tiga jawaban masing-masing ≥ 30 kata; `FORUM_MIN_WORDS` di halaman harus sama dengan `FORUM_MIN_KATA` di backend).
- **Gerbang login**: saat masuk modul *n* > 1, `checkModulAccess` memeriksa modul *n*−1. Bila belum lengkap, halaman ditutup overlay kunci yang merinci apa yang kurang dan menautkan ke modul sebelumnya. Tombol **🔄 Periksa lagi** di overlay itu (sejak 24 September 2026) memanggil ulang `getModulProgress` dengan sesi yang sama, tanpa muat ulang dan tanpa login ulang: bila modul sebelumnya ternyata sudah lengkap (misalnya baru dilengkapi di tab lain), overlay ditutup dan progres modul ini langsung diterapkan; bila belum, rinciannya digambar ulang dengan data terbaru. Tombol ini dibuat karena mahasiswa yang membuka modul *n* sebelum menuntaskan modul *n*−1 tetap melihat overlay lama walau syaratnya sudah terpenuhi di tab lain. Modul 1 selalu terbuka. UTS/UAS tidak digerbang.
- **Transisi (keputusan dosen, opsi 1a)**: modul yang tugasnya sudah selesai dengan semua attempt bertanggal sebelum `PROGRES_MULAI` (22 Agu 2026 12:00 UTC) dianggap lengkap meski tanpa centang/forum, supaya mahasiswa yang sudah berjalan tidak terkunci di modul 1.
- Setelah tenggat, modul tetap bisa dikerjakan dengan status terlambat (modul tidak punya batas atas), jadi gerbang ini tidak pernah mengunci permanen.
- **Dosen dan Mode Preview** tidak digerbang: tab tetap terbuka, kotak dicentang berurutan secara lokal (diingat di localStorage per modul, boleh membatalkan yang terakhir) dan tidak disimpan ke server. **Akun simulasi** diperlakukan persis mahasiswa (lihat §4.5), kecuali boleh membatalkan centang terakhir dan selalu lolos gerbang antar-modul.
- Blok lama "Daftar Periksa Sebelum Lanjut" (centang lokal Sisken, `siskenCentang`) sudah dihapus; kartu "Salah Kaprah" di bagian yang sama dipertahankan.

### 6.8 Sistem Agen AI berbasis sumber

Mode **Asisten Dosen** menempel pada tombol dan panel chat yang sudah ada
(`#visitorFab` + `#visitorPanel`, tetap satu tombol dan satu panel) pada 84
halaman modul dan 12 halaman UTS/UAS (enam mata kuliah). Di halaman modul ia
menjadi tab kedua panel Chat Kelas ("👥 Kelas" ↔ "🤖 Asisten Dosen"). Halaman
UTS/UAS **tidak punya Chat Kelas**: panelnya hanya daftar mahasiswa online
(presence, §7.8), sehingga Asisten membawa komposernya sendiri (`#vpAiComposer`).
Perilakunya di ujian bergantung peran:

- **Dosen**: tab "👥 Online" (default) dan "🤖 Asisten Dosen", seperti sebelumnya.
- **Mahasiswa yang login** (sejak 26 September 2026): `#visitorFab` tampil
  sebagai tombol "🤖 Asisten Dosen" dan panel langsung terbuka di mode Asisten
  dengan catatan cakupan ujian. Tab Online, daftar nama/NIM, badge, dan jumlah
  online tidak pernah terlihat — roster tetap khusus dosen (§7.8).
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
terkunci selama jendela UTS/UAS aktif, termasuk `scheduleOverrides` per NIM,
tetapi bantuan administratif tetap tersedia. Penguncian ini ditegakkan backend
(`aiChat`) untuk halaman mana pun yang memanggil, termasuk halaman ujian;
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

Bobot tipe 1:1:2:4 digunakan untuk membagi bobot di dalam Sub-CPMK. Nilai tiap soal bukan angka tetap 1/1/2/4. Backend menghitungnya dari:

1. bobot Sub-CPMK exam;
2. daftar soal yang dipetakan ke Sub-CPMK;
3. bobot tipe soal di dalam kelompok tersebut.

Jumlah nilai exam adalah 100. Soal yang sengaja tidak dipetakan dapat bernilai nol walaupun tetap bisa dijawab.

**Dua sumber angka yang mudah tertukar.** Definisi bank soal (`functions/exams/*-v2.js`) memberi tiap soal field `points` mengikuti bobot tipe 1/1/2/4, sehingga Σ`points` sebuah exam = **70**. Angka 70 itu **bukan** nilai yang diberikan ke mahasiswa: `checkExamAnswer` menimpanya dengan `_examQPoints(examId, qId)` yang dihitung dari bobot Sub-CPMK OBE sehingga **Σ = 100**. Jadi:

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

**Partial credit exam membaca `partialPoints` dari kunci** (kini 0,5 seragam di semua course). Sebelumnya `checkExamAnswer` mematoknya 1 dan mengabaikan `partialPoints`, sehingga kebijakan per-course tidak pernah berlaku di exam; sekarang hanya status `correct` yang ditimpa bobot OBE. Jalur `recomputeExamPoints` memakai aturan yang sama — bila salah satunya kembali mematok 1, rescale akan menimpa poin partial yang sudah benar.

**Partial credit tetap hanya diberikan sebelum deadline.** Begitu masuk fase perpanjangan (exam) atau fase terlambat (modul), `computeOutcome` mengembalikan status `wrong` bernilai 0 — bukan partial yang dipotong. Yang dikenai potongan keterlambatan (0,65 di semua course) adalah **jawaban benar**. Contoh Sisken UTS `c15`: benar tepat waktu 2,797 poin; benar saat perpanjangan 2,797 × 0,65 = 1,818; kode disubmit tetapi salah → 0,5 bila tepat waktu, dan 0 bila sudah masuk perpanjangan.

### 7.1 Sistem desain exam

Kedelapan halaman exam memakai satu keluarga desain exam yang terpisah dari sistem desain modul. Keempat UTS berbagi stylesheet utama yang sama, demikian pula keempat UAS. Perbedaan konten, identitas course, jadwal, dan status UTS/UAS diperbolehkan; struktur visual dan perilaku komponen lintas course harus tetap setara.

- hero menyajikan identitas exam, status jadwal, timer, dan ringkasan progres;
- panel skor `.score-bar` selalu terlihat secara sticky selama pengerjaan dan menjadi pusat progres, rincian poin, serta export;
- pemilih peran, login, friction layer mahasiswa, state sebelum/dalam/setelah jadwal, dan halaman Hasil harus mempertahankan hierarki visual yang sama;
- friction dan pembatasan interaksi hanya berlaku untuk mahasiswa, bukan mode dosen;
- perubahan desain exam harus diterapkan ke seluruh empat course untuk jenis exam yang sama, tanpa menyalin marker atau runtime `modern-academic-design` milik modul;
- perubahan visual tidak boleh mengubah gate PIN/jadwal, penilaian server, ledger attempt, presence, atau export.

### 7.2 ID soal

Urutan konseptual adalah Q1–Q45:

- Q1–Q10: `tf1`–`tf10`;
- Q11–Q30: `mc1`–`mc20`;
- Q31–Q40: komputasi Easy/Medium;
- Q41–Q45: komputasi Hard.

Getaran, Matematika, dan Opto UAS memakai `c1`–`c15`. Opto UTS memakai `ce1`–`ce10` untuk Easy/Medium dan `ch1`–`ch5` untuk Hard. Reset, mapping OBE, urutan backend, dan frontend harus memahami pengecualian ini.

### 7.3 Aturan submit

- Validasi semua tipe soal berjalan melalui `checkExamAnswer`.
- Kunci jawaban berada di Firestore `examAnswers`, tidak di HTML.
- Setiap soal one-shot dan dikunci oleh ledger Firestore.
- Akun dosen dapat meninjau seluruh soal dalam mode hanya-baca; handler jawaban dan export mahasiswa tetap diblokir.
- Exam bersifat sumatif: jawaban benar tidak ditampilkan kepada mahasiswa.
- Komputasi menjalankan kode dengan Pyodide, lalu mengirim kandidat output dan potongan kode ke server.
- Toleransi numerik dan variasi per NIM ditentukan kunci server.
- Comp Hard dapat memberi 0,5 poin partial jika dikonfigurasi dan tidak terlambat.
- Pengali terlambat diterapkan server dan seragam di semua mata kuliah: 0,65 (potongan 35%). Client tidak boleh menjadi sumber kebenaran multiplier.

### 7.4 Parameter NIM

`N` diambil dari dua digit terakhir NIM. Jika dua digit terakhir adalah `00`, dipakai dua digit sebelumnya. Logika client, renderer bank soal, dan `deriveN()` backend harus selalu identik.

Jangan mengambil satu digit terakhir saja. Contoh NIM berakhiran `22` harus menghasilkan `N = 22`, bukan 2 atau 0.

> ⚠️ **Catatan implementasi (diperiksa ulang 21 Agu 2026):** tidak ada satu pun
> halaman exam yang memiliki fallback `00` pada penurunan `N` sisi client —
> catatan sebelumnya yang menyebut UTS Getaran dan Sisken sudah memilikinya
> keliru. Keadaan sebenarnya:
>
> | Halaman | Sumber `N` di client | Aman untuk NIM berakhiran `00`? |
> |---|---|---|
> | UAS Getaran, UAS Sisken | `window._uasServerN` bila tersedia | ya, mengikuti server |
> | Keempat `UTS.html` | turunan lokal; `window._utsServerN` disimpan tetapi tidak dipakai `getN()` | tidak |
> | UAS Math4, UAS Opto | turunan lokal | tidak |
>
> Dampaknya tampilan saja: badge `N=` bisa berbeda dari `N` server, sedangkan
> penilaian tetap benar karena server memakai `deriveN()` sendiri. Perbaikan
> yang paling bersih bukan menambah fallback di enam tempat, melainkan
> mengikuti pola UAS Getaran/Sisken — pakai `N` yang sudah dikirim server
> (`_utsServerN`/`_uasServerN`) dan jadikan turunan lokal sekadar cadangan.

### 7.5 Perbedaan UTS dan UAS

| Aspek | UTS | UAS |
|---|---|---|
| Teks soal | backend privat, diambil dengan `getExamQuestions` | backend privat, diambil dengan `getExamQuestions` |
| Kunci jawaban | server-only | server-only |
| Gate teks soal | PIN + jadwal (mahasiswa) atau sesi admin (dosen) | PIN + jadwal (mahasiswa) atau sesi admin (dosen) |
| Friction anti-copy/capture | aktif untuk mahasiswa (identik dengan UAS) | aktif untuk mahasiswa |

`getExamQuestions` melayani kedelapan exam (empat UTS + empat UAS). Response berisi teks, opsi, hint, diagram, dan nilai `N` yang sudah dirender; bukan fungsi `compute()` atau jawaban benar.

Status bank per exam saat ini:

| Exam | Bank | Catatan |
|---|---|---|
| `getaran-mekanik-uts` / `-uas` | ditulis | 45 soal |
| `math4-uts` / `-uas` | ditulis | 45 soal |
| `optoauto-uts` / `-uas` | ditulis | 45 soal |
| `sisken-uts` | ditulis | 45 soal, cakupan Modul 1–4 (Sub-CPMK 1.1, 1.2, 2.1, 2.2) |
| `sisken-uas` | ditulis | 45 soal, cakupan Modul 8–14 (Sub-CPMK 4.1–4.3, 5.1–5.4) |
| `teknik-tenaga-listrik-uts` | ditulis (19 September 2026) | 45 soal, 40 parametrik, cakupan Modul 1–4 dan 6 (Sub-CPMK 1.1, 1.2, 1.3, 2.1, 3.1); Modul 5 (2.2) dinilai lewat Tugas |

Cakupan exam Sisken **tidak** mengikuti urutan pertemuan, melainkan matriks OBE di SIA: UTS 22% hanya menilai Sub-CPMK 1.1/1.2/2.1/2.2, dan UAS 30% menilai 4.1–4.3/5.1–5.4. Sub-CPMK 3.1–3.3 (Modul 5–7) dinilai **hanya lewat Tugas**. Menulis soal Modul 5–7 di UTS akan membuat jawabannya dihitung sebagai nilai Sub-CPMK lain, karena pemetaan OBE berbasis **posisi** soal (1–45), bukan topiknya.

Blueprint posisi → Sub-CPMK untuk Sisken (harus sama dengan `OBE_EXAM_CONFIG` backend dan mapping halaman Penilaian-OBE):

```text
sisken-uts   1.1 → 1-8    1.2 → 9-29   2.1 → 30-37  2.2 → 38-45
sisken-uas   4.1 → 1-9    4.2 → 10-17  4.3 → 18-25  5.1 → 26-28
             5.2 → 29-34  5.3 → 35-40  5.4 → 41-45
teknik-tenaga-listrik-uts
             1.1 → 1-4    1.2 → 5-8, 11-13   1.3 → 9-10, 14-19, 31-33
             2.1 → 20-25, 34-37, 41-42   3.1 → 26-30, 38-40, 43-45
```

Urutan posisi mengikuti `OBE_EXAM_ORDER`: `tf1..tf10`, `mc1..mc20`, `c1..c10`, `c11..c15`.

### 7.6 Sumber nilai dan konsistensi

Sumber data exam mempunyai fungsi berbeda:

| Data | Peran |
|---|---|
| Firestore `examAttempts/.../qs/<qId>` | ledger attempt resmi dan sumber recompute |
| RTDB visitor `points` | cache total cepat untuk UI |
| RTDB visitor `scoreDeltas/<qId>` | delta aktual per soal, termasuk multiplier terlambat |
| local state | render sementara, bukan sumber nilai resmi |

Ketentuan:

- refresh harus memulihkan nilai per soal dari `scoreDeltas`, bukan menghitung ulang dari bobot default;
- bila `scoreDeltas` tidak ada — modul baru mulai menulisnya, dan exam baru menulisnya sejak 30 Juli 2026 — helper `restoredDelta(qId, fallback)` memakai nilai partial historis mata kuliah itu: **1** untuk Getaran Mekanik, Matematika 4, dan Optimalisasi & Otomasi; **0,5** untuk Sistem Kendali Cerdas. Fallback lain akan ditolak `validate-public-security.mjs`;
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
- isinya juga dikosongkan dari DOM, karena render fase tamu (sebelum login)
  sempat mengisinya dengan mahasiswa lain;
- cabang mahasiswa `renderVisitors` tetap `return` sebelum jalur dosen mengisi
  roster, badge, dan jumlah online.

RTDB `visitors/*` dan `presence/*` dapat dibaca publik, jadi ini jaminan UI,
bukan batas keamanan: jangan menambahkan data yang lebih sensitif ke node itu.
Semuanya dipasang `scripts/buka-asisten-ujian.mjs` dan dijaga
`validate-public-security.mjs` (§17.1).

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

Dua penghalang ditambahkan ke seluruh 64 halaman: `@media print` mengosongkan halaman saat dicetak atau disimpan sebagai PDF (menutup jalur menu browser yang tidak lewat Ctrl+P), dan `beforeprint` mencatatnya. Halaman **modul** juga dikaburkan saat *jendela* kehilangan fokus (`blur`/`focus`) — Alt+Tab dan Snipping Tool tidak mengubah `visibilitychange`, jadi dipantau terpisah. Ini **tidak** diterapkan pada exam: larangan memburamkan halaman ujian saat kehilangan fokus tetap berlaku dan ditegakkan validator.

Jangan menulis klaim “screenshot mustahil” atau “Alt+Tab diblokir total”.

---

## 9. Data Firebase

### 9.1 RTDB

| Path | Isi |
|---|---|
| `pins/mhs_<NIM>` | hash PIN global dan identitas dasar |
| `visitors/<course>/<slot>/mhs_<NIM>` | kunjungan, points, marker, selection, code, link, dan score delta — tidak pernah ditulis untuk akun simulasi (§4.5) |
| `settings/<course>/<slot>/schedule` | start, end, duration, due, extension |
| `settings/<course>/<slot>/scheduleOverrides/mhs_<NIM>` | override `end`/`extension` per NIM untuk ujian susulan (§5.5); admin-only write |
| `presence/<course>/<slot>/mhs_<NIM>` | heartbeat online |
| `chat/<course>/<slot>/messages` | chat modul |
| `aiChat/quota/<NIM>` | kuota rate-limit AI chat per mahasiswa; server-only (tidak ada rules node, default deny) |
| `security/adminLoginState` | penghitung gagal dan lock login admin global |

Rules harus mencegah client mengubah field server-owned seperti `points`, `scoredQuestions`, `scoreDeltas`, timestamp poin, dan konsolasi. Client boleh membuat record awal yang netral dan memperbarui field yang diizinkan. Operasi admin yang membutuhkan hak lebih tinggi dilakukan melalui callable atau token admin.

**Batas penjagaan `scoreDeltas` (sejak backend #44, 5 September 2026).** `scoreDeltas` berupa objek, sehingga tidak boleh dibandingkan dengan `===` di `.write` induk: di aturan RTDB hasilnya selalu false dan mengunci login mahasiswa yang sudah menjawab. Imutabilitasnya dijaga per entri di `scoreDeltas/$qId` (nilai yang sudah ada tidak bisa diubah), dan record baru dari klien tidak boleh membawa `scoreDeltas`; `validate-backend.js` menjaga ketiga hal itu, termasuk mencegah pembanding objek kembali. Batas yang disadari: `.validate` tidak berjalan saat penghapusan, dan entri untuk soal yang belum dijawab masih bisa ditambahkan klien. Dampaknya hanya tampilan poin per soal setelah refresh — `points` tetap terkunci, sedangkan kode ekspor, OBE, dan `recomputeExamPoints` memakai ledger Firestore. Karena itu **jangan pernah memakai `scoreDeltas` RTDB sebagai sumber nilai resmi**.

### 9.2 Firestore

| Path | Isi |
|---|---|
| `examAnswers/<examId>/qs/<qId>` | kunci jawaban exam |
| `examAttempts/<examId>/students/<nimKey>/qs/<qId>` | ledger attempt exam |
| `modulAnswers/<modulId>/qs/<qId>` | kunci jawaban modul |
| `modulAttempts/<modulId>/students/<nimKey>/qs/<qId>` | ledger attempt modul |
| `obeNilai/<courseId>/students/<nimKey>` | nilai OBE yang dipublish |
| `obeMappings/<courseId>` | mapping Tugas/UTS/UAS per course |
| `progresModul/<modulId>/students/<nimKey>` | progres materi: `centang`, `total`, `forum{fq1..3}`, `forumSelesai`, `updatedAt` (§6.7) |

Firestore Rules menolak semua akses client langsung. Jangan melonggarkan rules untuk memudahkan debugging.

---

## 10. Cloud Functions

Daftar callable yang digunakan sistem saat ini:

| Callable | Akses | Fungsi |
|---|---|---|
| `createAdminSession` | password admin | membuat custom token admin |
| `checkModulAnswer` | mahasiswa + PIN | validasi satu soal modul dan catat poin |
| `checkExamAnswer` | mahasiswa + PIN | validasi satu soal exam dan catat attempt/poin |
| `getExamQuestions` | mahasiswa + PIN + jadwal, atau admin | mengambil bank teks soal UTS/UAS yang sudah dirender |
| `getModulQuestions` | mahasiswa + PIN + jadwal, atau admin | mengambil teks `c1`–`c15` Sisken Modul 1–14 yang sudah dirender per NIM |
| `generateExportCode` | mahasiswa + PIN | mengambil poin resmi dan membuat kode HMAC export |
| `verifyExportCode` | admin | memverifikasi kode export |
| `resetModulAttempts` | admin | menghapus ledger seluruh attempt satu modul |
| `resetExamAttempts` | admin | menghapus ledger seluruh attempt satu exam |
| `resetModulQuestion` | admin | reset soal tertentu/semua untuk satu atau semua mahasiswa |
| `resetExamQuestion` | admin | reset soal tertentu/semua untuk satu atau semua mahasiswa |
| `rescaleModulLatePenalty` | admin | menghitung ulang penalti modul, dapat dibatasi NIM |
| `rescaleExamLatePenalty` | admin | menghitung ulang penalti keterlambatan exam (UTS/UAS), dapat dibatasi NIM; parameter `nims[]`+`newEnd`/`newExtension` menulis `scheduleOverrides` untuk ujian susulan (§5.5) |
| `analyzeModulData` | admin | menganalisis data modul dan anomali grading |
| `recomputeExamPoints` | admin | menghitung ulang total exam dari ledger |
| `computeObeScores` | admin | menghitung TGS/UTS/UAS per Sub-CPMK |
| `getObeMapping` | admin | mengambil mapping OBE satu course |
| `saveObeMapping` | admin | memvalidasi dan menyimpan mapping OBE satu course |
| `publishObeNilai` | admin | mempublikasikan nilai OBE |
| `getMyObeNilai` | mahasiswa + PIN | mengambil nilai OBE mahasiswa tersebut |
| `getModulProgress` | mahasiswa + PIN | progres centang/forum/tugas modul ini + hasil gerbang akses |
| `checkModulAccess` | mahasiswa + PIN | boleh masuk modul ini? (modul sebelumnya lengkap) |
| `setModulCentang` | mahasiswa + PIN | mencentang bagian materi ke-*i*; ditolak bila tidak urut. Parameter `batal:true` membatalkan centang terakhir dan hanya diterima untuk akun simulasi (`SIM_NIMS`) |
| `saveModulForum` | mahasiswa + PIN | menyimpan tiga jawaban forum; `forumSelesai` bila masing-masing ≥ 30 kata |
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
| `reset-soal.html` | reset satu, beberapa, atau semua soal pada 56 modul dan 8 exam; target satu NIM atau semua mahasiswa |
| `recompute-obe-score.html` | recompute poin satu exam dari mapping OBE dan ledger |
| `rescale-deadline.html` | rescale penalti keterlambatan modul atau exam (UTS/UAS), global atau NIM tertentu (exam via `rescaleExamLatePenalty`, §5.5/§10) |
| `analyze-victims.html` | analisis korban/anomali grading modul dan reset terarah |
| `verify-export-code.html` | verifikasi HMAC export modul/exam |
| `berkas-tugas.html` | daftar dan unduh berkas FreeCAD tugas pemodelan CAD per modul, dengan status penilaian |
| `analyze-affected.py` | helper analisis file/data lokal; bukan halaman web |

Pada `reset-soal.html`, opsi **semua soal** harus benar-benar mengirim seluruh qId yang valid. Untuk exam, reset harus menghapus attempt, marker, selection/code, dan mengurangi delta poin yang bersangkutan tanpa merusak soal lain.

---

## 12. Dokumen OBE

Setiap `OBE/Penilaian-OBE.htm` menggabungkan dua mode:

- **Silabus:** dapat dibaca tanpa login; memuat bobot asesmen, relasi CPL/CPMK/Sub-CPMK, matrikulasi, dan deskripsi.
- **Penilaian:** memerlukan login mahasiswa atau dosen.

### 12.1 Dosen

Dosen dapat:

- mengisi atau mengimpor PRE dan nilai Sub-CPMK;
- mengedit mapping modul 1–14 dan soal exam 1–45 ke Sub-CPMK;
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
Optimalisasi & Otomasi 60/20/20. Cek `FORMS` di `Penilaian-OBE.htm` course
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
4. Pastikan 25 soal dan bobot 50 poin tetap konsisten, kecuali perubahan desain memang disetujui.
5. Perbarui seed `modulAnswers`, `MODUL_CONFIG`, dan validator backend jika ID/struktur berubah.
6. Uji preview, mahasiswa, dosen, refresh, late, export, Forum, chat, dan reset.

### 16.2 Mengubah exam

1. Pertahankan `examId`, DB path, schedule path, `OBE_ORDER`, dan seed dalam satu perubahan atomik.
2. Jika soal berubah, perbarui teks, kunci/toleransi, mapping Sub-CPMK, dan qId reset. `EXAM_QID_POINTS` **dibangkitkan**, bukan disunting: jalankan `node scripts/bangkitkan-poin-soal-exam.js` di backend setiap kali `OBE_EXAM_CONFIG` atau `OBE_ORDER` berubah.
3. Teks soal hanya di backend: UAS di bank `uas-v2`, UTS di `functions/exams/uts-<course>-v2.js` (yang benar-benar dilayani `QUESTION_BANKS`; `uts-<course>-bank.js` cuma sumber helper lama, bukan jalur serving — lihat §14). Jangan menambah bank statis ke HTML. Untuk UTS, jaga `shuffleSeed` di bank identik dengan yang di berkas kunci — jalankan manual `node scripts/verify-uts-bank.js` (bukan `npm run lint`, yang cuma syntax-check). Saat menambah atau menulis ulang soal MC, pastikan seed pengocokannya berbeda tiap soal (lihat §7); penjaganya ada di `verify-sisken-uas.js`.
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

`validate-public-security.mjs` memindai seluruh HTML dalam allowlist Pages pada lima course aktif serta folder Pemodelan CAD. Ia menjaga artefak sensitif, sintaks inline script, 108 halaman berautentikasi admin (96 Modul/Exam + 6 OBE + 6 Admin), gate dan friction exam, WIB, preview modul, reset, presence, format poin, pemulihan `scoreDeltas`, serta keamanan publikasi. Sejak 26 September 2026 ia juga menagih Asisten mahasiswa di ke-12 UTS/UAS: penanda dan kode `buka-asisten-ujian.mjs`, CSS penyembunyi roster di `<head>`, `#fabCount`/`#vpBadge`/`#vpList` hanya diisi jalur dosen `renderVisitors` (cabang mahasiswa hanya mengosongkan lalu `return`), serta larangan `.vp-chat`/`#vpChatList`/`#vpChatInput`/`sendChat` di luar blok AI. Jumlah halaman autentikasi (108) dan halaman ujian ber-Asisten (12) dipatok di validator; perbarui bersama bila inventaris berubah.

Skrip penyuntik lintas halaman (semua idempoten lewat penanda; jalankan `--periksa` dulu) yang wajib dijalankan ulang setelah regenerasi modul: `tambah-efek-memuat.mjs`, `tambah-efek-jawaban.mjs`, `ubah-friction.mjs`, `kecualikan-akun-simulasi.mjs`, `kunci-lapisan-animasi-login.mjs`, `tambah-progres-modul.mjs` (modul saja), `perkuat-pembagian-kelompok.mjs` (tab Pembagian Kelompok di Modul 1 setiap course; penanda `KELOMPOK-TANGGUH`), dan `buka-asisten-ujian.mjs` (12 halaman UTS/UAS saja; penanda `ASISTEN-UJIAN-MAHASISWA`; ditambahkan 26 September 2026 — `#visitorFab` menjadi tombol Asisten Dosen bagi mahasiswa sementara roster online tetap khusus dosen, lihat §6.8 dan §7.8; UTS/UAS CAD yang dibangun ulang `bangun.py` mewarisinya dari kerangka TTL, jadi `--periksa` sesudahnya harus 0). Yang terakhir ditambahkan 14 September 2026 setelah tab itu menampilkan "Gagal memuat data mahasiswa": `renderGroups()` dulu mengambil roster sekali tanpa cek status HTTP dan tanpa percobaan ulang, sehingga satu kegagalan sesaat langsung tampil sebagai error. Kini roster dimuat lewat `_pkAmbilRoster()` (cek `r.ok`, tiga percobaan dengan jeda dan parameter anti-cache), pesan gagal menyebut penyebabnya beserta tombol **Coba lagi**, dan halaman yang dibuka dari berkas lokal (`file://`) diarahkan ke situs. Dua di antaranya juga menyentuh `<Course>/OBE/Penilaian-OBE.htm` sejak 1 September 2026: `kecualikan-akun-simulasi.mjs` (menyaring akun simulasi dari roster `STUDENTS`) dan `tambah-efek-memuat.mjs` (efek loading pemilih peran). Keduanya memakai jalur terpisah `prosesObe()` karena halaman OBE beda ekstensi dan tidak punya jangkar `updateLeaderboard`. **Posisi blok dipertahankan (diperbaiki 1 September 2026).** `tambah-efek-memuat.mjs` dan `tambah-efek-jawaban.mjs` sama-sama menaruh satu blok `<style>` di `<head>`. Dulu keduanya membuang bloknya lalu menyisipkan ulang tepat sebelum `</head>`, sehingga berebut tempat terakhir: menjalankan yang satu memindahkan blok yang lain ke bawah — 64 berkas berubah, 67 baris bergeser, nol perubahan isi — lalu menjalankan yang lain memindahkannya balik. Siklus dua langkah yang tidak pernah selesai dan mengotori setiap diff. Sekarang keduanya **mengganti blok di tempat** bila sudah ada, dan hanya menyisip sebelum `</head>` bila blok itu memang belum ada. Isinya tetap ditimpa tiap jalan (perbaikan CSS tetap sampai), tetapi urutannya tidak lagi berubah. Diuji: empat putaran bergantian, keduanya melaporkan 0 halaman. `tinggikan-daftar-hasil.mjs` (modul + exam) menyamakan tinggi wadah roster tab Hasil `#visitorTableBody`: `max-height:420px` tetap → `min(72vh,820px)` responsif, sehingga daftar ikut tinggi layar tetapi berhenti di 820px. Ditambahkan 5 September 2026 untuk 8 halaman Exam, diperluas 7 September 2026 ke 56 modul — kini seragam di seluruh 64 halaman. Aturan CSS lintas course yang ditulis langsung di halaman (ukuran roadmap, padding panel persamaan, jarak `br+span`) juga sudah ada di generator `apply-modern-academic-all-modules.mjs` dan `enrich-sisken-modules.mjs`.

Validator khusus melengkapi pemeriksaan publik tersebut:

| Validator | Cakupan khusus |
|---|---|
| `validate-all-course-modern-design.mjs` | Marker, runtime, tabel, kartu pustaka, perilaku tab, editor deadline `HH:mm` 24 jam, normalisasi WIB, dan sintaks pada seluruh 70 modul (Teknik Tenaga Listrik sebatas modul yang sudah terbit). |
| `validate-all-course-score-panels.mjs` | Panel skor compact pada 42 modul Matematika 4, Getaran Mekanik, dan Optimalisasi & Otomasi. |
| `validate-sisken-modules.mjs` | Struktur dan perilaku 14 modul Sisken, termasuk urutan tombol pilihan ganda, panel skor, serta kompatibilitas generator. |
| `validate-sisken-forum.mjs` | Seluruh 156 kombinasi jajak Forum Modul 2–14 beserta Clipboard API dan fallback `execCommand`. |
| `validate-sisken-export-html.mjs` | Jalur export HTML Tugas pada seluruh modul Sisken. |

### 17.2 Backend privat

Dari root backend:

```powershell
node scripts/validate-backend.js
node scripts/validate-ai-knowledge.js
Set-Location functions
npm.cmd run lint
npm.cmd test
```

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
| Preview | tidak membuat identity/attempt/poin; Tugas dan Forum modul tersembunyi |
| Mahasiswa | roster, PIN, schedule gate, satu attempt, restore setelah refresh |
| Dosen | login, pesan lock, atur jadwal dengan jam 24 jam, tampilan deadline WIB yang sama pada perangkat beda zona waktu, logout, sesi kedaluwarsa |
| Modul | 25 soal, total 50, PG dapat dipilih dan tombol Periksa aktif, late 0,65 (seragam semua course), partial Hard 0,5 (semua course), export lengkap, Forum/chat |
| Exam | 45 soal, total 100, format poin, late/cutoff, online-only, export resmi |
| Agen AI | konsep modul aktif dijawab dengan sitasi; pertanyaan lintas MK dan jawaban langsung asesmen ditolak; data pribadi disunting; saat UTS/UAS aktif materi terkunci tetapi jadwal/aturan tetap terjawab; mode `AI_PROVIDER=none` dan simulasi kuota tetap menghasilkan fallback retrieval |
| Asisten di UTS/UAS | mahasiswa yang login (termasuk yang baru login dari layar tamu, tanpa muat ulang) melihat tombol 🤖 "Asisten Dosen" dan panel langsung di mode Asisten dengan catatan cakupan ujian; tab Online, nama/NIM mahasiswa lain, badge, dan jumlah online tidak terlihat; saat jendela UTS/UAS aktif pertanyaan materi dijawab pesan penguncian, permintaan kunci jawaban ditolak, jadwal/aturan ujian tetap terjawab; dosen tetap melihat tab Online sebagai default; tamu tidak melihat tombol; `#backToTop` tidak tertutup tombol chat di desktop maupun ≤480px |
| UAS | soal tidak ada di source publik, fetch setelah gate, friction tidak memburamkan halaman |
| Progres modul | kotak centang hanya giliran yang aktif, lompat ditolak server; tab Tugas/Forum/Hasil terkunci sampai lengkap; login modul *n* ditolak bila modul *n*−1 belum lengkap (overlay kunci dengan rincian; tombol Periksa lagi membuka halaman tanpa login ulang setelah syaratnya terpenuhi); forum terpulihkan setelah login |
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
9. Preview tidak menilai; preview modul tidak menampilkan Tugas dan Forum.
10. Panel exam menampilkan mahasiswa online, bukan seluruh riwayat visitor, dan daftar itu hanya untuk dosen: mahasiswa hanya mendapat Asisten Dosen di panel yang sama (roster berisi nama, NIM, dan status poin teman sekelas; RTDB-nya terbaca publik sehingga UI satu-satunya penjaga). Halaman ujian tidak punya Chat Kelas.
11. Poin exam ditampilkan maksimal dua desimal tanpa mengubah nilai mentah.
12. Friction browser adalah deterrent, bukan jaminan anti-screenshot atau blokir Alt+Tab.
13. Atur Jadwal tidak boleh menghapus data. Reset adalah operasi terpisah dan eksplisit.
14. Export HTML bukan sumber nilai resmi; kode HMAC hanya alat verifikasi.
15. Setiap perubahan yang sudah tervalidasi harus masuk `main`; deployment backend tetap langkah manual terpisah.
16. Node `pins/` tertutup dari klien. Verifikasi PIN hanya lewat callable `verifyPin`; jangan membaca `pins/` dari browser.
17. Kunci jawaban tidak pernah masuk repo publik — sekali ter-commit, kebocorannya permanen di riwayat Git dan hanya dapat ditutup dengan merotasi soal.
18. Bank soal yang masih placeholder tidak boleh di-live-seed; kunci dummy di produksi menilai mahasiswa secara ngawur tanpa gejala.
19. Angka poin bank exam (Σ=70) bukan nilai mahasiswa; yang diberikan adalah `_examQPoints` (Σ=100), dan hanya status `correct` yang ditimpa bobot itu. Partial credit membaca `partialPoints` kunci (0,5 seragam) dan hanya berlaku sebelum deadline; setelah itu 0, bukan partial yang dipotong.
20. Setiap soal pilihan ganda wajib punya tombol `sub-mcN`-nya sendiri; tanpa itu `selectMC()` melempar dan PG tidak dapat dipilih.
21. Publikasi Pages memakai push ke branch `gh-pages`; jangan kembali ke `actions/deploy-pages`.
22. Agen AI hanya memakai resolver dan retrieval privat dari allowlist mata kuliah aktif; model bersifat opsional, bank/kunci tidak masuk indeks, sitasi wajib, dan tutor materi terkunci selama ujian mahasiswa aktif.
23. Seed pengocokan opsi MC wajib berbeda tiap soal. Seed seragam membuat seluruh kunci jatuh di satu huruf bagi tiap mahasiswa, sehingga menjawab satu huruf terus memberi nilai penuh bagian pilihan ganda.
24. `EXAM_QID_POINTS` di halaman ujian dibangkitkan dari `_examQPoints` server, tidak pernah disunting tangan. Tabel itu hanya penyebut tampilan; poin per soal dan nilai resmi tetap datang dari server.
