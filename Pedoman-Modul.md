# Pedoman Sistem Modul, Exam, dan OBE

> **Status:** acuan keadaan sistem saat ini, diperbarui 8 Agustus 2026
>
> **Lingkup:** LMS empat mata kuliah S1 Teknik Mesin Universitas Mercu Buana
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

Perhatikan Sistem Kendali Cerdas memakai **dua penamaan berbeda** yang keduanya benar dan tidak boleh disamakan: course id/path Firebase `sistem_kendali_cerdas` (dengan garis bawah), tetapi prefix exam `sisken` (`sisken-uts`, `sisken-uas`). Nama berkas kunci modul juga memakai bentuk panjang: `functions/seed/modul/sistem_kendali_cerdas-modul-N-answers.js`.

Khusus course Optimalisasi:

- nama folder memakai **Automasi**;
- `Attributes/Asesmen-Optimalisasi-dan-Otomasi.json` dan judul LMS memakai **Otomasi**;
- deck Slidev tertentu memakai “Optimalisasi & Automasi” secara sengaja;
- jangan membuat path `Optimization-Automation`.

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

- 56 modul: 14 per course;
- 8 exam: UTS dan UAS per course;
- 4 halaman OBE;
- total 68 halaman HTML inti;
- 5 halaman Admin HTML dan satu helper analisis Python.

Halaman standalone lama di `Attributes/` (`Nilai-Akhir.html`, `Pembagian-Kelompok.html`, `Setup-Python.html`) **sudah dihapus** dari Matematika 4, Getaran Mekanik, dan Optimalisasi. Halaman itu memakai login lama (nama + NIM, tanpa PIN) dan fungsinya sudah ada di dalam halaman modul. Tautannya di `index.html` ikut dihapus. Jangan membuatnya kembali; jika perlu, tambahkan sebagai tab di halaman modul supaya ikut gerbang PIN.

Sumber data course yang harus dipertahankan:

| Course | Asesmen |
|---|---|
| Matematika 4 | `Attributes/Asesmen-Matematika-4.json` |
| Getaran Mekanik | `Attributes/Asesmen-Getaran-Mekanik.json` |
| Optimalisasi & Otomasi | `Attributes/Asesmen-Optimalisasi-dan-Otomasi.json` |
| Sistem Kendali Cerdas | `Attributes/Asesmen-Sistem-Kendali-Cerdas.json` |

Roster login mahasiswa selalu berasal dari `Attributes/students.json` masing-masing course. Nama mahasiswa tidak diketik bebas ketika login.

---

## 3. Identitas modul, pertemuan, dan path Firebase

Nomor file modul tidak selalu sama dengan nomor pertemuan. Pertemuan 8 ditempati UTS.

```text
Modul 1–7  → Pertemuan 1–7
Modul 8–14 → Pertemuan 9–15
```

Rumusnya: `P = N` untuk `N <= 7`, dan `P = N + 1` untuk `N >= 8`. Rumus ini dipakai `_segmentsForModul()` di backend untuk **keempat** course, termasuk Sistem Kendali Cerdas.

> **Ketidakcocokan yang diketahui (Sistem Kendali Cerdas).** Label pertemuan di LMS Moodle Sisken memakai `P = N` sampai akhir, karena Modul 7 dan UTS digabung pada Pertemuan 7 dan jadwalnya tiga pertemuan per minggu (Kamis/Jumat/Sabtu) sehingga totalnya 15 pertemuan. Akibatnya untuk `N >= 8` label LMS ("Pertemuan 8 · Modul 8") berbeda dari path Firebase (`pertemuan-9`). Path Firebase tetap konsisten dengan backend sehingga penilaian tidak terpengaruh — yang berbeda hanya angka yang dibaca mahasiswa. Halaman modul Sisken juga masih tidak seragam sendiri: mis. Modul 8 menulis "Pertemuan 9" pada hero/hitung mundur/tugas tetapi "Pertemuan 8" pada bagian Forum, dan instruksi forum masih menyebut "Forum Pertemuan 1". Perbaikan label ini belum dikerjakan; jangan menganggap salah satu angka sebagai acuan sebelum diputuskan.

### 3.1 ID callable modul

| Course | `modulId` |
|---|---|
| Matematika 4 | `math4-modul-N` |
| Getaran Mekanik | `getaran-mekanik-modul-N` |
| Optimalisasi & Otomasi | `optoauto-modul-N` |
| Sistem Kendali Cerdas | `sistem_kendali_cerdas-modul-N` |

### 3.2 Path modul

| Course | Visitor | Jadwal | Presence | Chat |
|---|---|---|---|---|
| Matematika 4 | `visitors/math4/modul-N` | `settings/math4/pertemuan-P/schedule` | `presence/math4/modul-N` | `chat/math4/modul-N/messages` |
| Getaran | `visitors/getaran_mekanik/pertemuan-P` | `settings/getaran_mekanik/pertemuan-P/schedule` | `presence/getaran_mekanik/pertemuan-P` | `chat/getaran_mekanik/pertemuan-P/messages` |
| Optoauto | `visitors/optoauto/pertemuan-P` | `settings/optoauto/pertemuan-P/schedule` | `presence/optoauto/pertemuan-P` | `chat/optoauto/pertemuan-P/messages` |
| Sisken | `visitors/sistem_kendali_cerdas/pertemuan-P` | `settings/sistem_kendali_cerdas/pertemuan-P/schedule` | `presence/sistem_kendali_cerdas/pertemuan-P` | `chat/sistem_kendali_cerdas/pertemuan-P/messages` |

Untuk Matematika, visitor memakai `modul-N` sedangkan jadwal memakai `pertemuan-P`. Perbedaan ini disengaja dan sudah ditangani oleh backend. Tiga course lain memakai `pertemuan-P` untuk keduanya.

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

---

## 5. Jadwal dan WIB

Semua label dan tampilan waktu ditujukan untuk WIB. Gunakan `timeZone: 'Asia/Jakarta'` pada formatting. Pada exam, nilai `datetime-local` harus diparse sebagai WIB dengan `_wibStringToDate`, bukan `new Date(due)`.

Jadwal disimpan sebagai:

```json
{
  "start": "ISO UTC",
  "end": "ISO UTC",
  "duration": 180,
  "due": "YYYY-MM-DDTHH:MM",
  "extension": 120
}
```

`extension` hanya dipakai exam dan boleh tidak ditulis jika nol.

### 5.1 Modul

- Durasi default: 7 hari.
- Batas akhir default: enam hari setelah modal dibuka, pukul 23.59 WIB.
- `start = end - duration`.
- Sebelum `start`, akses penilaian ditolak.
- Setelah `end`, modul tetap dapat dikerjakan tanpa batas akhir tambahan. Pengali terlambat mengikuti konfigurasi mata kuliah: Sistem Kendali Cerdas memakai 0,65 (potongan 35%).
- Mengubah jadwal tidak menghapus visitor, attempt, jawaban, atau poin.

### 5.2 Exam

- Durasi default: 180 menit.
- Perpanjangan default: 120 menit.
- `start = end - duration`.
- Sebelum `start`, akses dan submit ditolak.
- Pada `(end, end + extension]`, submit masih diterima. Pengali terlambat mengikuti konfigurasi mata kuliah: Sistem Kendali Cerdas memakai 0,65 (potongan 35%).
- Setelah `end + extension`, submit diblokir.
- Mengubah jadwal tidak mereset data mahasiswa.

> **Rollout penalti 35%:** aturan baru diterapkan pada Sistem Kendali Cerdas. Optimalisasi & Otomasi, Matematika 4, dan Getaran Mekanik tetap memakai pengali 0,7 (potongan 30%) sampai proses penilaian yang sedang berjalan selesai. Jangan mengubah konfigurasi ketiga mata kuliah tersebut selama masa transisi.

### 5.3 Default modal exam yang benar-benar ada saat ini

| Halaman | Batas akhir ketika belum ada jadwal | Judul modal |
|---|---|---|
| Semua UAS | tanggal WIB saat modal dibuka, 19.30 | Atur Jadwal UAS |
| UTS Getaran | tanggal WIB saat modal dibuka, 19.30 | Atur Jadwal UTS |
| UTS Matematika | waktu WIB sekarang + 180 menit | Atur Jadwal Perkuliahan |
| UTS Optimalisasi | waktu WIB sekarang + 180 menit | Atur Jadwal Perkuliahan |

Tabel ini mencatat implementasi aktual, bukan menyatakan ketidakkonsistenan tersebut sebagai desain ideal. Jika UTS diseragamkan, ubah ketiga course, pemeriksa otomatis, dan bagian ini dalam commit yang sama.

### 5.4 Batasan zona waktu modul

Formatter modul memakai WIB, tetapi penyimpanan due modul saat ini masih membentuk `Date` dari nilai `datetime-local` berdasarkan zona waktu browser. Operasikan pengaturan jadwal modul pada perangkat yang disetel ke WIB sampai parser modul diseragamkan dengan `_wibStringToDate` milik exam.

### 5.5 Jadwal ujian susulan (override per mahasiswa)

Selain jadwal global di §5.2, exam punya lapisan kedua opsional di RTDB
`settings/<course>/<slot>/scheduleOverrides/mhs_<NIM>` (lihat §9.1). Ditulis
admin-only lewat callable `rescaleExamLatePenalty` (parameter `nims[]` +
`newEnd`/`newExtension`) atau UI `Admin/rescale-deadline.html`.

- Override hanya boleh mengubah `end`/`extension`, **tidak pernah** `start`.
- Jadwal global dan mahasiswa lain tidak tersentuh — ini per-NIM.
- `UTS.html`/`UAS.html` di keenam file (3 course × 2 exam) subscribe ke path
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

Setup Python dan Pembagian Kelompok hanya ada di Modul 1 tiap course; pada Sisken Modul 2–14 tombol nav, halaman, dan blok gayanya dibuang oleh generator supaya tidak ada tab yang menuju halaman kosong. Jangan "memperbaiki" ketidaksamaan ini dengan menambahkan tab kosong.

Ketentuan konten dan UI:

- materi, contoh, animasi, dan skenario harus sesuai topik pertemuan;
- ketika menyalin modul, periksa judul, course, pertemuan, Sub-CPMK, animasi, soal, export, filename, roster URL, semua ID, serta seluruh path;
- rumus statis dan dinamis dirender dengan KaTeX setelah elemen tersedia;
- kode komputasi berjalan di browser melalui Pyodide; paket tambahan dimuat sesuai kebutuhan;
- halaman harus tetap responsif dan usable pada layar laptop maupun ponsel;
- hormati `prefers-reduced-motion` jika menambah animasi baru;
- jangan mengunci aturan visual ke ukuran per piksel di dokumen ini; ikuti komponen yang sudah digunakan course bersangkutan.

Khusus Sistem Kendali Cerdas, modul kelipatan tiga (Modul 3, 6, 9, dan 12) berjenis TMV. Buat ruang melalui aktivitas **Google Meet™ for Moodle** pada menu LMS, lalu pasang tautannya sebagai tombol pada kolom kanan banner pertemuan. Tautan halaman modul juga cukup tersedia pada tombol banner dan tidak perlu dibuat ulang sebagai resource URL terpisah di LMS.

### 6.1 Tugas modul

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
- satu `qId` hanya dapat dicoba sekali sampai direset;
- modul bersifat formatif: server boleh mengembalikan jawaban benar dan penjelasan setelah attempt;
- komputasi dinilai dengan nilai target dan toleransi pada server;
- kandidat numerik dapat berasal dari jawaban utama, angka pertama/terakhir output, dan kandidat per baris `print()`;
- soal Hard dapat memberi partial credit jika dikonfigurasi dan dikerjakan sebelum terlambat. Besarnya diambil dari `partialPoints` pada kunci Firestore: **Sistem Kendali Cerdas 0,5 poin** (seluruh 14 modul), tiga course lain 1 poin. Angka ini juga muncul sebagai teks yang dibaca mahasiswa di pengantar Bagian C, jadi ubah keduanya bersama;
- poin terlambat ditentukan backend per mata kuliah: Sistem Kendali Cerdas dikalikan 0,65 (potongan 35%); Optimalisasi & Otomasi, Matematika 4, dan Getaran Mekanik sementara tetap 0,7 (potongan 30%);
- konsolasi satu poin ditentukan backend. Jangan memakai konstanta threshold client sebagai sumber kebenaran.

Poin tampilan modul 0–50 dikonversi menjadi nilai 0–100 untuk headline. Poin mentah tetap dipakai untuk penyimpanan dan OBE.

### 6.2 Penyimpanan dan refresh modul

- Attempt resmi disimpan di Firestore `modulAttempts/<modulId>/students/<nimKey>/qs/<qId>`.
- Ringkasan cepat disimpan pada record visitor RTDB: poin, marker soal, selection, code, dan timestamp.
- Draft yang belum disubmit, seperti kode, link Drive, dan teks Forum, disimpan per NIM di localStorage.
- Setelah refresh, halaman memuat marker dan data tersimpan sebelum mengizinkan interaksi.
- Jika attempt Firestore ada tetapi transaksi RTDB sebelumnya gagal, submit ulang pada soal terkunci dapat menjalankan self-heal tanpa memberi poin ganda.

### 6.3 Export tugas

Export tugas baru aktif jika:

- seluruh 10 pilihan ganda sudah dijawab;
- seluruh 15 soal komputasi sudah dicoba;
- link Google Drive valid sudah diisi.

File export memuat identitas, jawaban/kode, poin server, waktu, dan kode verifikasi. Nama file harus memuat nomor tugas, NIM, dan course yang benar.

File HTML lokal tetap dapat diedit oleh pemilik file. Kode HMAC tidak mencegah edit; kode itu mendeteksi ketidaksesuaian ketika diperiksa melalui `Admin/verify-export-code.html`.

### 6.4 Forum dan chat

- Tab Forum berisi pertanyaan diskusi dan alat salin HTML untuk LMS.
- HTML yang disalin harus menggunakan struktur yang stabil untuk editor LMS: style inline dan layout tabel lebih aman daripada layout CSS kompleks.
- Chat realtime memakai RTDB `chat/<course>/<module>/messages`.
- Pesan baru dibatasi Rules, termasuk panjang teks maksimum 500 karakter.
- Preview tidak menampilkan Forum.

### 6.5 Hasil dan presence modul

Tab Hasil membaca record visitor untuk statistik, aktivitas, dan skor. Presence realtime terpisah dari riwayat kunjungan. Jangan menyimpulkan “online” hanya dari `lastVisit`.

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

Contoh nyata (`sisken-uts`, bobot Sub-CPMK 4/10/4/4, Σ=22): Sub-CPMK 1.1 memegang 8 soal × 2,273 = 18,18 poin; 1.2 21 soal × 2,165 = 45,45; 2.1 dan 2.2 masing-masing 8 soal × 2,273 = 18,18. Totalnya 100.

**Partial credit exam saat ini dipatok 1 poin.** `checkExamAnswer` menetapkan `outcome.points = 1` untuk status `partial` dan **mengabaikan `partialPoints`** pada kunci. Karena itu memasang `partialPoints: 0,5` pada bank exam **tidak berpengaruh** pada nilai — berbeda dari modul, yang memang membaca `partialPoints`. Bila kebijakan 0,5 ingin berlaku juga di exam, `checkExamAnswer` (dan jalur `recomputeExamPoints`) harus diubah lebih dulu; jangan mengandalkan nilai di bank saja.

### 7.1 ID soal

Urutan konseptual adalah Q1–Q45:

- Q1–Q10: `tf1`–`tf10`;
- Q11–Q30: `mc1`–`mc20`;
- Q31–Q40: komputasi Easy/Medium;
- Q41–Q45: komputasi Hard.

Getaran, Matematika, dan Opto UAS memakai `c1`–`c15`. Opto UTS memakai `ce1`–`ce10` untuk Easy/Medium dan `ch1`–`ch5` untuk Hard. Reset, mapping OBE, urutan backend, dan frontend harus memahami pengecualian ini.

### 7.2 Aturan submit

- Validasi semua tipe soal berjalan melalui `checkExamAnswer`.
- Kunci jawaban berada di Firestore `examAnswers`, tidak di HTML.
- Setiap soal one-shot dan dikunci oleh ledger Firestore.
- Akun dosen dapat meninjau seluruh soal dalam mode hanya-baca; handler jawaban dan export mahasiswa tetap diblokir.
- Exam bersifat sumatif: jawaban benar tidak ditampilkan kepada mahasiswa.
- Komputasi menjalankan kode dengan Pyodide, lalu mengirim kandidat output dan potongan kode ke server.
- Toleransi numerik dan variasi per NIM ditentukan kunci server.
- Comp Hard dapat memberi satu poin partial jika dikonfigurasi dan tidak terlambat.
- Pengali terlambat diterapkan server sesuai konfigurasi mata kuliah; Sistem Kendali Cerdas memakai 0,65 (potongan 35%), sedangkan Optimalisasi & Otomasi, Matematika 4, dan Getaran Mekanik sementara tetap 0,7 (potongan 30%). Client tidak boleh menjadi sumber kebenaran multiplier.

### 7.3 Parameter NIM

`N` diambil dari dua digit terakhir NIM. Jika dua digit terakhir adalah `00`, dipakai dua digit sebelumnya. Logika client, renderer bank soal, dan `deriveN()` backend harus selalu identik.

Jangan mengambil satu digit terakhir saja. Contoh NIM berakhiran `22` harus menghasilkan `N = 22`, bukan 2 atau 0.

> ⚠️ **Catatan implementasi (Agu 2026):** fallback `00` baru diterapkan di
> `getN()` client `Getaran-Mekanik/Exam/UTS.html`. Math4 UTS, Opto UTS, dan
> ketiga `UAS.html` masih memakai `parseInt(slice(-2),10) || 0` tanpa
> fallback — badge `N=` yang ditampilkan ke mahasiswa bisa berbeda dari `N`
> server untuk NIM berakhiran `00` (server via `deriveN()` tetap benar,
> jadi penilaian tidak salah, hanya tampilan). Perlu diseragamkan di
> keenam file exam.

### 7.4 Perbedaan UTS dan UAS

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

Cakupan exam Sisken **tidak** mengikuti urutan pertemuan, melainkan matriks OBE di SIA: UTS 22% hanya menilai Sub-CPMK 1.1/1.2/2.1/2.2, dan UAS 30% menilai 4.1–4.3/5.1–5.4. Sub-CPMK 3.1–3.3 (Modul 5–7) dinilai **hanya lewat Tugas**. Menulis soal Modul 5–7 di UTS akan membuat jawabannya dihitung sebagai nilai Sub-CPMK lain, karena pemetaan OBE berbasis **posisi** soal (1–45), bukan topiknya.

Blueprint posisi → Sub-CPMK untuk Sisken (harus sama dengan `OBE_EXAM_CONFIG` backend dan mapping halaman Penilaian-OBE):

```text
sisken-uts   1.1 → 1-8    1.2 → 9-29   2.1 → 30-37  2.2 → 38-45
sisken-uas   4.1 → 1-9    4.2 → 10-17  4.3 → 18-25  5.1 → 26-28
             5.2 → 29-34  5.3 → 35-40  5.4 → 41-45
```

Urutan posisi mengikuti `OBE_EXAM_ORDER`: `tf1..tf10`, `mc1..mc20`, `c1..c10`, `c11..c15`.

### 7.5 Sumber nilai dan konsistensi

Sumber data exam mempunyai fungsi berbeda:

| Data | Peran |
|---|---|
| Firestore `examAttempts/.../qs/<qId>` | ledger attempt resmi dan sumber recompute |
| RTDB visitor `points` | cache total cepat untuk UI |
| RTDB visitor `scoreDeltas/<qId>` | delta aktual per soal, termasuk multiplier terlambat |
| local state | render sementara, bukan sumber nilai resmi |

Ketentuan:

- refresh harus memulihkan nilai per soal dari `scoreDeltas`, bukan menghitung ulang dari bobot default;
- tab Soal Ujian, tab Hasil, leaderboard, dan export harus mengacu pada total yang sama;
- `generateExportCode` menghitung ulang nilai exam dari ledger Firestore, mengembalikan `scoreDeltas` resmi, dan memperbaiki cache RTDB jika drift;
- `recomputeExamPoints` dapat menghitung ulang seluruh mahasiswa pada satu exam setelah perubahan mapping/bobot;
- nilai mentah disimpan dengan presisi yang diperlukan, sedangkan semua tampilan poin exam dibatasi maksimal dua angka di belakang koma tanpa nol ekor;
- headline nilai boleh berupa pembulatan bilangan bulat, tetapi tidak boleh mengganti total poin mentah.

Dengan alur ini, poin dan jawaban yang sudah tercatat tetap tersedia setelah refresh. localStorage bukan satu-satunya tempat penyimpanan nilai.

### 7.6 Export exam

Export UTS/UAS bersifat lenient: dapat dibuat setelah minimal satu soal telah dijawab dan link Google Drive valid. Export harus menyatakan jika masih ada soal yang belum dikerjakan.

Poin pada export berasal dari server, bukan penjumlahan DOM. Kode verifikasi memakai ID exam, NIM, poin yang dinormalisasi, dan waktu pembuatan.

### 7.7 Mahasiswa online

Semua exam hanya menampilkan mahasiswa yang sedang online:

- heartbeat: 20 detik;
- ambang online: 45 detik;
- `onDisconnect` dan `beforeunload` membersihkan presence jika memungkinkan;
- entri basi disaring ketika panel dirender;
- badge memakai jumlah online, bukan jumlah seluruh visitor historis.

Presence bukan sumber nilai atau bukti final kehadiran.

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

Jangan menulis klaim “screenshot mustahil” atau “Alt+Tab diblokir total”.

---

## 9. Data Firebase

### 9.1 RTDB

| Path | Isi |
|---|---|
| `pins/mhs_<NIM>` | hash PIN global dan identitas dasar |
| `visitors/<course>/<slot>/mhs_<NIM>` | kunjungan, points, marker, selection, code, link, dan score delta |
| `settings/<course>/<slot>/schedule` | start, end, duration, due, extension |
| `settings/<course>/<slot>/scheduleOverrides/mhs_<NIM>` | override `end`/`extension` per NIM untuk ujian susulan (§5.5); admin-only write |
| `presence/<course>/<slot>/mhs_<NIM>` | heartbeat online |
| `chat/<course>/<slot>/messages` | chat modul |
| `aiChat/quota/<NIM>` | kuota rate-limit AI chat per mahasiswa; server-only (tidak ada rules node, default deny) |
| `security/adminLoginState` | penghitung gagal dan lock login admin global |

Rules harus mencegah client mengubah field server-owned seperti `points`, `scoredQuestions`, `scoreDeltas`, timestamp poin, dan konsolasi. Client boleh membuat record awal yang netral dan memperbarui field yang diizinkan. Operasi admin yang membutuhkan hak lebih tinggi dilakukan melalui callable atau token admin.

### 9.2 Firestore

| Path | Isi |
|---|---|
| `examAnswers/<examId>/qs/<qId>` | kunci jawaban exam |
| `examAttempts/<examId>/students/<nimKey>/qs/<qId>` | ledger attempt exam |
| `modulAnswers/<modulId>/qs/<qId>` | kunci jawaban modul |
| `modulAttempts/<modulId>/students/<nimKey>/qs/<qId>` | ledger attempt modul |
| `obeNilai/<courseId>/students/<nimKey>` | nilai OBE yang dipublish |
| `obeMappings/<courseId>` | mapping Tugas/UTS/UAS per course |

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
| `deleteObeNilai` | admin | menghapus nilai OBE terpublikasi satu course |
| `getModuleChatContext` | mahasiswa + PIN | bootstrap sapaan/konteks AI chat modul (deterministik, tidak memanggil model) |
| `aiChat` | mahasiswa + PIN | tanya-jawab administratif AI per modul (resolver deterministik dulu, lalu provider LLM opsional); butuh secret `AI_API_KEY` (§1.2), rate-limit di `aiChat/quota/<NIM>` (§9.1) |

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
| `reset-soal.html` | reset satu, beberapa, atau semua soal pada 42 modul dan 6 exam; target satu NIM atau semua mahasiswa |
| `recompute-obe-score.html` | recompute poin satu exam dari mapping OBE dan ledger |
| `rescale-deadline.html` | rescale penalti keterlambatan modul atau exam (UTS/UAS), global atau NIM tertentu (exam via `rescaleExamLatePenalty`, §5.5/§10) |
| `analyze-victims.html` | analisis korban/anomali grading modul dan reset terarah |
| `verify-export-code.html` | verifikasi HMAC export modul/exam |
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
- UAS tidak boleh kembali mempunyai array statis `UAS_TF`, `UAS_MC`, `UAS_COMP_EZ`, atau `UAS_COMP_HARD` di HTML;
- UTS juga tidak boleh kembali mempunyai array statis `UTS_TF`, `UTS_MC`, `UTS_COMP_EZ`, atau `UTS_COMP_HARD` di HTML, termasuk helper `_svg`/`_diagram` yang menyertainya;
- semua operasi admin memakai Firebase Auth custom token dan claim admin;
- update RTDB dari client harus sparse dan tidak boleh menulis ulang field server-owned dari snapshot basi;
- user input harus di-escape ketika masuk ke export, chat, atau HTML dinamis;
- Pages workflow harus menolak artefak sensitif sebelum deploy;
- node RTDB `pins/` tidak boleh dibuka kembali untuk dibaca klien (lihat §4.3);
- seed **menolak** menulis kunci bank yang masih placeholder ke Firestore. `seed-firestore.js` mendeteksi status placeholder dari teks bank dan membatalkan live seed dengan pesan jelas; pelolos `--allow-placeholder` hanya untuk keadaan yang disengaja. Ini menutup jalur yang dulu membuat `--all-exam` menuliskan kunci dummy `sisken-uas` ke produksi tanpa gejala.

### 14.1 Kunci exam lama bocor di riwayat Git (tidak dapat ditarik kembali)

Repo frontend bersifat publik dan **riwayatnya tetap publik** meski berkasnya sudah dihapus. Commit sekitar April–20 Mei 2026 pernah meng-*embed* `correctIdx` + `explain` di HTML exam. Perbandingan teks eksak terhadap bank server menemukan **54 soal MC/TF yang kuncinya bocor DAN masih dipakai** (UTS Getaran 17, Math 18, Opto 19; UAS ketiganya 0 karena soalnya sudah ditulis ulang; Sisken 0 karena lahir server-side).

Aturan yang mengikuti dari kejadian itu:

- menulis ulang riwayat Git **tidak** menyembuhkan kebocoran — salinan publik sudah dapat di-*clone*/*fork*/ter-*cache*. Perbaikan yang benar adalah **rotasi soal**, bukan menghapus jejak;
- ke-54 soal itu **sudah dirotasi** (soal dan jawabannya diganti, lalu di-seed ulang), sehingga kunci di riwayat tidak lagi memetakan ke ujian yang berjalan;
- karena itu jangan pernah menaruh kunci, `correctIdx`, `explain`, `expected`, atau `tolerance` di repo publik meski "sementara" — satu commit sudah cukup untuk membocorkannya permanen.

Teks soal UTS **tidak lagi publik**. Batasan arsitektur yang dulu dicatat di sini sudah ditutup: bank soal ketiga UTS dipindahkan ke repo backend dan dilayani `getExamQuestions` di balik gerbang yang sama dengan UAS. Halaman UTS mengisi `window.UTS_TF/MC/COMP_EZ/COMP_HARD` lewat `_ensureUTSQuestionsLoaded()` setelah login berhasil.

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
2. Jika soal berubah, perbarui teks, kunci/toleransi, mapping Sub-CPMK, `EXAM_QID_POINTS`, dan qId reset.
3. Teks soal hanya di backend: UAS di bank `uas-v2`, UTS di `functions/exams/uts-<course>-v2.js` (yang benar-benar dilayani `QUESTION_BANKS`; `uts-<course>-bank.js` cuma sumber helper lama, bukan jalur serving — lihat §14). Jangan menambah bank statis ke HTML. Untuk UTS, jaga `shuffleSeed` di bank identik dengan yang di berkas kunci — jalankan manual `node scripts/verify-uts-bank.js` (bukan `npm run lint`, yang cuma syntax-check).
4. Verifikasi `deriveN()` dan contoh NIM termasuk suffix `00`.
5. Jalankan seed dry-run sebelum live seed.
6. Uji nilai benar/salah/partial, refresh, scoreDeltas, export, late window, cutoff, dan reset satu soal.

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
node scripts/validate-sisken-modules.mjs
git diff --check
```

`validate-sisken-modules.mjs` memeriksa struktur 14 modul Sisken, termasuk keberadaan dan urutan tombol `sub-mcN` per soal pilihan ganda (§6.1). Jalankan setiap kali menyentuh halaman modul Sisken.

Validator publik saat ini memeriksa antara lain:

- artefak backend tidak berada di repo publik;
- sintaks inline script seluruh HTML;
- 56 halaman yang memakai autentikasi admin (48 Modul/Exam + 3 OBE + 5 Admin; turun dari 63 setelah 7 halaman `Attributes/` lama dihapus — angka ini dipatok di validator, jadi perbarui bersama bila jumlah halaman berubah);

> **Cakupan validator ini belum penuh.** `courseRoots` di `validate-public-security.mjs` masih hanya berisi Matematika 4, Getaran Mekanik, dan Optimalisasi. Folder `Sistem-Kendali-Cerdas/` **tidak dipindai**, sehingga halaman Sisken tidak ikut diperiksa untuk sintaks inline script maupun artefak sensitif. Untuk sementara andalkan `validate-sisken-modules.mjs` bagi modul Sisken, dan ingat bahwa exam serta OBE Sisken belum tercakup penjaga otomatis mana pun di sisi frontend.
- UAS server-gated dan friction layer;
- WIB exam;
- preview modul dan label Log Out;
- reset soal modul/exam termasuk opsi semua soal;
- presence online-only semua exam;
- format poin maksimal dua desimal;
- pemulihan `scoreDeltas` resmi;
- allowlist dan gate keamanan Pages.

### 17.2 Backend privat

Dari root backend:

```powershell
node scripts/validate-backend.js
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
| `node scripts/verify-sisken-uas.js` | idem untuk UAS Sisken, plus poin per Sub-CPMK cocok dengan pemetaan OBE |

Dua penjaga terakhir adalah satu-satunya yang menangkap kekeliruan `correctIdx` menunjuk opsi yang salah dan **opsi MC kembar** (kunci ambigu) — kelas bug yang tidak terlihat dari struktur. Bank tanpa berkas kunci legacy tidak dapat diperiksa `verify-uts-bank.js`, jadi jangan menganggap bank Sisken sudah teruji hanya karena skrip itu hijau.

Bila menulis soal pada bank yang sebelumnya placeholder, ingat bahwa penjaga yang **mewajibkan** teks placeholder harus diinversi lebih dulu; ini pernah membuat `validate-backend.js` dan `verify-uts-unified.js` gagal begitu soal ditulis. Keduanya sekarang mendeteksi sendiri keadaan bank.

### 17.3 Uji manual minimum

| Area | Pemeriksaan |
|---|---|
| Preview | tidak membuat identity/attempt/poin; Tugas dan Forum modul tersembunyi |
| Mahasiswa | roster, PIN, schedule gate, satu attempt, restore setelah refresh |
| Dosen | login, pesan lock, atur jadwal, logout, sesi kedaluwarsa |
| Modul | 25 soal, total 50, PG dapat dipilih dan tombol Periksa aktif, late sesuai konfigurasi (Sisken 0,65; Opto/Math4/Getaran sementara 0,7), partial Hard (Sisken 0,5), export lengkap, Forum/chat |
| Exam | 45 soal, total 100, format poin, late/cutoff, online-only, export resmi |
| UAS | soal tidak ada di source publik, fetch setelah gate, friction tidak memburamkan halaman |
| Reset | Firestore dan RTDB konsisten; PIN tidak terhapus; poin soal lain tetap |
| OBE | mapping per course, compute, draft lokal, publish, tampilan satu mahasiswa |

Jangan menganggap perubahan selesai hanya karena halaman terbuka. Penilaian harus diuji sampai ke ledger, refresh, export, dan reset.

---

## 18. Ringkasan aturan yang tidak boleh dilanggar

1. Backend, kunci jawaban, bank soal UAS, service account, dan secret tetap privat.
2. Semua waktu operasional adalah WIB; exam wajib memakai parser WIB eksplisit.
3. PIN bersifat global; reset asesmen tidak menghapus PIN.
4. Modul bernilai maksimum 50; exam bernilai maksimum 100.
5. Server menentukan jawaban, toleransi, attempt, poin, late multiplier, dan hak admin.
6. Firestore attempt adalah ledger; RTDB visitor adalah cache realtime, bukan pengganti ledger.
7. Refresh tidak boleh mengubah poin atau rincian per soal.
8. UTS dan UAS sama-sama mengambil teks soal dari server; HTML publik tidak memuat bank soal apa pun.
9. Preview tidak menilai; preview modul tidak menampilkan Tugas dan Forum.
10. Panel exam menampilkan mahasiswa online, bukan seluruh riwayat visitor.
11. Poin exam ditampilkan maksimal dua desimal tanpa mengubah nilai mentah.
12. Friction browser adalah deterrent, bukan jaminan anti-screenshot atau blokir Alt+Tab.
13. Atur Jadwal tidak boleh menghapus data. Reset adalah operasi terpisah dan eksplisit.
14. Export HTML bukan sumber nilai resmi; kode HMAC hanya alat verifikasi.
15. Setiap perubahan yang sudah tervalidasi harus masuk `main`; deployment backend tetap langkah manual terpisah.
16. Node `pins/` tertutup dari klien. Verifikasi PIN hanya lewat callable `verifyPin`; jangan membaca `pins/` dari browser.
17. Kunci jawaban tidak pernah masuk repo publik — sekali ter-commit, kebocorannya permanen di riwayat Git dan hanya dapat ditutup dengan merotasi soal.
18. Bank soal yang masih placeholder tidak boleh di-live-seed; kunci dummy di produksi menilai mahasiswa secara ngawur tanpa gejala.
19. Angka poin bank exam (Σ=70) bukan nilai mahasiswa; yang diberikan adalah `_examQPoints` (Σ=100). Partial credit exam saat ini dipatok 1 poin dan mengabaikan `partialPoints`.
20. Setiap soal pilihan ganda wajib punya tombol `sub-mcN`-nya sendiri; tanpa itu `selectMC()` melempar dan PG tidak dapat dipilih.
21. Publikasi Pages memakai push ke branch `gh-pages`; jangan kembali ke `actions/deploy-pages`.
