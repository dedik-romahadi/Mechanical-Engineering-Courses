# CLAUDE.md — Aturan dan peta repo

Bagian A adalah hal yang harus dikerjakan **sebelum** menyentuh apa pun.
Bagian B adalah peta singkat repo (dulu `AGENTS.md`, digabung ke sini pada
22 Agustus 2026). Untuk rincian kebijakan apa pun, sumber kebenarannya
`Pedoman-Modul.md`; untuk deck Slidev, `Pedoman-Slides.md`.

---

## A. Aturan yang dijalankan lebih dulu

### A.1 Sinkronkan dengan remote sebelum mengubah apa pun

Repo ini dikerjakan dari lebih dari satu mesin dan oleh lebih dari satu agen
(lihat cabang `codex/*` di remote), jadi salinan lokal sering tertinggal tanpa
tanda apa pun. Bekerja di atas salinan basi menghasilkan suntingan yang
menimpa pekerjaan orang lain, atau perbaikan atas bug yang sudah diperbaiki.

Jalankan di **awal** tugas, bukan saat hendak push:

```bash
git fetch origin && git log --oneline HEAD..origin/main
```

- Keluarannya kosong → lanjutkan.
- Ada commit tercantum → `git pull --ff-only` dulu, baru mulai bekerja.
- Sudah terlanjur menyunting → `git stash` → `git pull --ff-only` →
  `git stash pop`, lalu periksa bentrokan dan jalankan ulang verifikasi.

Periksa juga repo pasangannya bila tugasnya menyentuh keduanya: kebijakan
penilaian, bank soal, dan jadwal tersebar di frontend (repo ini) **dan**
`Mechanical-Engineering-Courses-Backend` (privat; punya `CLAUDE.md` sendiri).
Keduanya punya remote sendiri dan bisa tertinggal sendiri-sendiri.

> Kejadian nyata (19 Agustus 2026): lokal tertinggal 8 commit di repo ini dan
> 2 commit di backend. Suntingan sempat dibuat di atas basis lama sebelum
> ketahuan, dan harus diulang dari basis yang benar.

### A.2 Sesudah mengubah kebijakan, cari seluruh penyebutannya

Angka kebijakan (pengali penalti, poin partial, ambang konsolasi) ditulis di
banyak tempat: kode backend, `Pedoman-Modul.md`, berkas ini, registry agen
chat, alat di `Admin/`, dan kadang teks yang dibaca mahasiswa. Mengubah satu
tempat saja membuat dokumen bertentangan dengan kodenya.

```bash
git grep -n "<angka lama>" -- '*.md' '*.html' '*.js' '*.mjs'
```

(`git grep` hanya memindai berkas terlacak, jadi jauh lebih cepat daripada
`grep -r` yang ikut menyisir `node_modules/` dan berkas biner.)

### A.3 Verifikasi sebelum PR

`node scripts/validate-public-security.mjs` wajib hijau — repo ini publik dan
validator itu yang menahan kunci jawaban agar tidak ikut terkirim. Validator
lain per area ada di `Pedoman-Modul.md` §17.1.

### A.4 Git, PR, dan rilis

- Cabang kerja per tugas (`fix/…`, `feat/…`, `docs/…`, atau `codex/…`), push
  dengan `git push -u origin <cabang>`.
- Setelah verifikasi lulus: commit, push, buat PR, tunggu check `validate`
  hijau, lalu **squash-merge ke `main`** tanpa menunggu instruksi tambahan.
- Repo: `dedik-romahadi/Mechanical-Engineering-Courses` — kapitalisasi persis
  begini; path GitHub Pages case-sensitive, dan `STUDENTS_JSON_URL` (roster
  login mahasiswa) di-fetch dari sana.
- Deploy Pages **otomatis** setiap commit masuk `main` lewat workflow
  `deploy-slides.yml` (allowlist frontend + build deck Slidev), yang
  **mem-push hasilnya ke branch `gh-pages`**; Pages membangun dari branch itu
  (Source: `gh-pages`, root). Jangan kembalikan ke `actions/deploy-pages`
  (batas keras 10 menit berulang kali terlampaui) dan jangan pindahkan situs
  ke `/docs`. Tunggu run-nya sukses, lalu cek halaman live dengan `curl`
  (CDN butuh ±1–3 menit). Lihat `Pedoman-Modul.md` §1.1.
- Backend tidak ikut rilis otomatis; deploy-nya manual dan sesempit mungkin
  (lihat `CLAUDE.md` di repo backend).

---

## B. Peta repo

### B.1 Apa ini

LMS multi-course untuk **S1 Teknik Mesin Universitas Mercu Buana** (dosen:
Dedik Romahadi). Satu berkas HTML mandiri per modul/exam; Firebase RTDB +
Firestore + Cloud Functions di belakang (repo privat). Enam mata kuliah aktif;
Pemodelan CAD dan Teknik Tenaga Listrik ditambahkan bertahap pada September 2026:

| Folder | Course ID | Slug callable modul | Singkatan |
|---|---|---|---|
| `Engineering-Mathematics/` | `math4` | `math4-modul-N` | Math4 |
| `Getaran-Mekanik/` | `getaran_mekanik` | `getaran-mekanik-modul-N` | Getaran |
| `Optimalisasi-dan-Automasi/` | `optoauto` | `optoauto-modul-N` | Opto |
| `Sistem-Kendali-Cerdas/` | `sistem_kendali_cerdas` | `sistem_kendali_cerdas-modul-N` | Sisken |
| `Pemodelan-Computer-Aided-Design/` | `pemodelan_cad` | `pemodelan_cad-modul-N` (Modul 1–14; tugas berkas FreeCAD). Exam: `pemodelan-cad-uts`/`-uas` — **tanda hubung**, tidak seperti slug modulnya | CAD |
| `Teknik-Tenaga-Listrik/` | `teknik_tenaga_listrik` | `teknik_tenaga_listrik-modul-N` (terbit: Modul 1–14) | TTL |

> Kelas LMS TTL (FAST Learning course id 5923, kelas 2F Sabtu 12:00–13:40) sudah
> tertata: banner seluruh semester dibuat `scripts/ttl-banner.mjs` dan dipasang oleh
> `scripts/ttl-lms-poster.js`; Google Meet/Attendance/Tugas/Forum dibuat **pada
> pekannya** (Google Meet lewat UI form). Rutinitas mingguan: Pedoman §2.

> Kelas LMS Pemodelan CAD (FAST Learning course id 4601, kelas Reguler 2 Selasa
> 19:30–22:00, SIA 2A2132FF) memakai pola yang sama: `scripts/cad-banner.mjs` →
> `Pemodelan-Computer-Aided-Design/Banner/`, dipasang `scripts/cad-lms-poster.js`
> (`cadPoster.run`). Kalender: TMV pekan ganjil, Daring pekan genap (SE Tipe
> Perkuliahan Gasal 2026/2027), P1 = Selasa 15 September 2026. Rincian: Pedoman §2.

> ⚠️ **Ejaan Opto (mudah salah saat scripting):** folder `Optimalisasi-dan-Automasi/`
> (**Automasi**, huruf A) tetapi berkas asesmennya
> `Asesmen-Optimalisasi-dan-Otomasi.json` (**Otomasi**, huruf O). Judul tampil
> "Optimalisasi & Otomasi", slug `optoauto`. Semua path/URL memakai folder
> `Optimalisasi-dan-Automasi`. Pengecualian: deck slide Opto memakai brand
> "Optimalisasi & Automasi" (huruf A) atas permintaan dosen — jangan "diperbaiki".

Total berkas HTML utama: **84 modul + 12 exam + 6 OBE**. Pemodelan CAD: Modul 1–14 terbit (FreeCAD 1.0; 10 PG + 5 tugas unggah berkas
`.FCStd` + angka bacaan yang wajib terbaca dari geometri berkas (divalidasi server sejak 24 September 2026;
tugas modul yang salah boleh dikirim ulang dengan nilai maksimal 65%), generator `scripts/cad-modul/bangun-modul-1.py`; berkas dosen
di `Admin/berkas-tugas.html`), **UTS dan UAS terbit 20 September 2026** dengan bentuk
sendiri: UTS 30 soal (20 PG + 10 tugas unggah model), UAS 31 soal (20 PG + 10 sub-model
komponen kompresor KT-40 + 1 tugas rakitan). Tanpa soal benar-salah dan tanpa Pyodide;
generatornya `scripts/cad-exam/bangun.py uts|uas` dengan pemeriksa `periksa_exam.py`.
**Modul-Word/PDF CAD terbit 21 September 2026** dari `scripts/cad-modul/buat-modul-word.py`
(tautannya dipasang `scripts/cad-modul/pasang-tautan-pdf.py`, yang wajib dijalankan ulang
setiap kali `bangun-modul-1.py`/`bangun.py` dijalankan karena keduanya mengosongkan
penandanya). Tiap modul CAD punya 7 gambar materi (Gambar 7 = gambar kerja praktik terbimbing);
tata letak semua gambar SVG CAD diperiksa `scripts/cad-modul/periksa_gambar_chrome.py --semua`
dan `--semua --inter` (getBBox nyata di Chrome) — `periksa_gambar.py` hanya menaksir dan meloloskan
banyak cacat. Animasi kanvas CAD diperiksa `scripts/cad-modul/periksa_animasi_chrome.py`
(33 lebar kanvas 1000..204, termasuk ponsel 360 px = kanvas 244). Teknik Tenaga Listrik dibangun modul demi
modul: Modul 1–14 sudah terbit (generator `scripts/ttl-modul/bangun.py`; Word/PDF-nya
dari `scripts/ttl-modul/buat-modul-word.py`; gambar SVG-nya diperiksa `scripts/ttl-modul/periksa_gambar_chrome.py`
dan `--inter`, keduanya wajib 0 cacat) dan terdaftar
di `_MODUL_COURSES` backend lewat `moduls: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]`; UTS (`teknik-tenaga-listrik-uts`) dan UAS
(`teknik-tenaga-listrik-uas`) sudah terbit, sehingga validator keamanan memindainya
lewat `courseRoots` seperti course lain. Rincian: Pedoman §2.

### B.2 Struktur per-course

```
<Course>/
├── Attributes/   students.json (roster, termasuk akun simulasi) + Asesmen-<Course>.json (SSOT bobot)
├── Banner/       Banner-Pertemuan-N.html (pengumuman pertemuan)
├── Modul/        Modul-1.html .. Modul-14.html
├── Modul-Word/   Modul versi .docx + .pdf (setoran BOP)
├── Exam/         UTS.html + UAS.html
├── OBE/          Penilaian-OBE.htm
└── Slides/       Deck Slidev — hanya Getaran & Opto (lihat Pedoman-Slides.md)
```

Root: `Admin/` (alat dosen: rescale-deadline, recompute-obe-score, reset-soal,
verify-export-code, analyze-victims, berkas-tugas), `Template-Modul-Word-dan-PPT/` (template
resmi BOP — Pedoman §15), `Unduhan-Gabungan/` (PDF gabungan), `PDD-UKTPT/`
(portofolio Serdos, bukan mata kuliah), `scripts/` (generator, injector,
validator), `index.html`, `Pedoman-Modul.md`, `Pedoman-Slides.md`.
Cloud Functions, rules, bank soal, dan seed berada di repo privat
`dedik-romahadi/Mechanical-Engineering-Courses-Backend`; jangan menyalinnya ke
repo publik ini.

### B.3 Konvensi inti (yang sering salah bila lupa)

- **Login.** Role picker dulu (Mahasiswa / Dosen / Mode Preview). Mahasiswa:
  NIM + PIN 6 digit (nama dari roster; tidak ada input nama). Dosen: password
  admin. PIN global di RTDB `pins/mhs_<NIM>` (hash SHA-256, lintas course);
  klien tidak boleh membaca `pins/` — verifikasi lewat callable `verifyPin`.
  Reset modul/exam tidak menghapus PIN. Reset/ganti PIN **menimpa**
  `pins/mhs_<NIM>`, tidak pernah menghapusnya (slot kosong = login pertama
  bagi siapa pun yang lebih dulu). Auto-login yang mendapati slot kosong
  membuang identitas dan menampilkan form login lagi, tanpa mengisikan NIM
  (`scripts/pin-kosong-ke-login.mjs`). Lockout PIN dua keluarga: per NIM (dibagi
  `verifyPin`) dan per NIM + sumber (penilaian, soal, unggah,
  `getJawabanSaya`, `generateExportCode`). Rincian: Pedoman §4.3.
- **Akun simulasi** NIM `41399999901` ("SIMULASI MAHASISWA") — akun uji
  dosen untuk menjalani alur mahasiswa tanpa mengotori data:
  - masuk lewat tombol 🎓 Mahasiswa dengan NIM itu + PIN yang dipegang dosen;
    **PIN tidak boleh ditulis di repo, commit, atau dokumen mana pun**;
  - jawaban tugas/ujian dinilai server (umpan balik, emoji, suara tetap
    muncul) tetapi **tidak disimpan** — tanpa ledger, tanpa poin RTDB, tanpa
    record pengunjung/heartbeat; soal bisa dijawab ulang tanpa batas;
  - disaring dari papan peringkat, roster tab Hasil, hadir/total, pembagian
    kelompok (Modul 1), dan OBE
    (fungsi render baru di tab Hasil wajib memakai `isSimulasiNim(nim)`);
  - **progres materi persis mahasiswa** (centang tersimpan & divalidasi
    server, tab terkunci, forum tersimpan) kecuali boleh membatalkan centang
    terakhir (`setModulCentang` dengan `batal:true`) dan selalu lolos gerbang
    antar-modul — gerbang itu tidak bisa diuji dengan akun ini;
  - daftar NIM-nya harus sama di tiga tempat: `SIM_NIMS` di backend
    `functions/index.js`, `scripts/kecualikan-akun-simulasi.mjs` di sini
    (disuntikkan ke 96 halaman modul/exam + 6 halaman OBE), dan
    `scripts/tambah-progres-modul.mjs` (84 halaman modul); nama ada di enam `students.json` **dan**
    RTDB `pins/mhs_41399999901.nama`;
  - saat membersihkan sisa datanya, kunci Firestore modul memakai prefiks
    `mhs_` (`modulAttempts/<id>/students/mhs_<nim>`), exam tidak.
  Cara pakai dan pemeliharaan lengkap: Pedoman §4.5.
- **Waktu WIB-locked.** Semua tampilan jam memakai `timeZone: 'Asia/Jakarta'`;
  deadline diparse dengan `_wibStringToDate`, bukan `new Date(...)`.
- **Jadwal.** Modul memakai **hari** (default 7 hari, deadline +6 hari
  23:59 WIB) dan tidak punya batas atas (terlambat tetap boleh). Exam memakai
  **menit** (default 180, perpanjangan 120) dan ditutup setelah
  `end + extension`. Jangan tertukar `dur*86400000` vs `dur*60000`.
  Deadline modul yang kanonis adalah `due` (WIB); perpanjangan satu kelas
  lewat `Admin/rescale-deadline.html` (NIM kosong) menulis `end` **dan**
  `due` dengan waktu buka tetap (backend `rescaleModulLatePenalty`, Pedoman
  §5.4) — berlaku sejak cabang backend
  `fix/chat-kenapa-admin-dan-rescale-due` di-deploy; sebelumnya callable
  produksi hanya menulis `end`. Rescale ujian satu kelas (backend
  `rescaleExamLatePenalty`, sejak cabang yang sama di-deploy) menulis `end`,
  `due`, dan `duration` menit dengan `start` tetap, karena modal Atur Jadwal
  UTS/UAS mengisi kolomnya dari `due`/`duration`; override per-NIM tetap hanya
  `end`/`extension` dan tetap dipakai saat menilai ulang satu kelas (§5.5).
  Sejak deploy yang sama server menolak sebelum menulis: deadline modul satu
  kelas yang tidak berselisih kelipatan 24 jam dari waktu buka (modal Atur
  Jadwal modul menyimpan `start = due − Durasi` hari penuh, jadi jam deadline
  harus sama dengan jam buka modul), deadline pada/sebelum waktu buka modul
  atau `start` ujian, dan hitung ulang modul tanpa Deadline Baru saat
  `end` ≠ `due` (§5.4). Rescale ujian satu kelas yang membuat jendela lebih
  dari 30 hari menghapus `duration` (rules membatasi 43200 menit), sehingga
  modal Atur Jadwal meminta Durasi dan Durasi yang diisi menggeser waktu mulai;
  `rescale-deadline.html` memperingatkannya.
- **Penalti terlambat 0,65** (potongan 35%) seragam semua course; sumber
  kebenarannya server (`cfg.lateMultiplierValue`). Partial Hard 0,5.
- **Skor.** Modul: 25 soal = 10 PG ×1 + 10 Komputasi ×2 + 5 Hard ×4 = 50.
  Exam: TF=1, MC=1, Comp Easy=2, Comp Hard=4; total 100. Pengecualian
  Pemodelan CAD: modul 15 soal (10 PG + 5 tugas pemodelan 6/6/6/11/11 = 50,
  kirim ulang maksimal 65%, tanpa partial — juga saat rescale, sejak cabang
  backend `fix/rescale-cad-kirim-ulang` di-deploy, Pedoman §5.4); UTS 30 / UAS 31 soal tanpa TF
  (bobot tipe PG 1, tugas unggah 2, rakitan `c11` 6 dengan partial 3).
- **Progres materi berurutan** (sejak 22 Agu 2026): kotak centang per bagian,
  tab Tugas/Forum/Hasil terkunci sampai lengkap, login modul *n* ditolak bila
  modul *n*−1 belum lengkap (centang + tugas + forum). Rincian: Pedoman §6.7.
  Pilihan quick check Forum (tidak dinilai) disimpan ke localStorage dan,
  bila `getModulProgress` memuat `forumPoll`, ke server `forumPoll` lewat
  callable terpisah `saveModulPoll` — JANGAN lewat `saveModulForum`, yang
  menulis tiga teks kosong bila `jawaban` tidak ada, sedangkan fungsi backend
  diperbarui satu per satu saat deploy/rollback — lalu dipulihkan saat dimuat; dipasang
  `scripts/simpan-pilihan-poll.mjs` (penanda `PILIHAN-POLL-FORUM`, ada
  `--periksa`, jalankan sesudah `tambah-progres-modul.mjs`). Pedoman §6.5.
- **Efek & skrip penyuntik.** Emoji/suara jawaban, efek memuat, friction,
  pengecualian akun simulasi, lapisan overlay login, progres modul, kunci
  identitas skrip klasik, dan draft materi disuntikkan oleh skrip idempoten di `scripts/`
  yang wajib dijalankan ulang setelah regenerasi modul (daftar di Pedoman
  §17.1). Regenerasi Sisken bukan satu perintah (Pedoman §6.4).
- **Kunci identitas di skrip klasik modul** (sejak 29 Sep 2026).
  `LOCAL_IDENTITY`/`MODULE_ID` adalah `const` skrip module dan tidak terlihat
  dari skrip klasik, jadi `getIdentityLocal()` (dipakai progres modul, Export
  Tugas, forum HTML, kunci draft) dan `const LK` friksi menulis kuncinya
  sebagai literal yang wajib sama dengan `<slug>_identity_<MODULE_ID>`
  (`MODULE_ID`: Modul 1–7 = `pertemuan-N`, Modul 8–14 = `pertemuan-(N+1)`;
  Matematika 4 = `modul-N`; Pedoman §3). Mengubah `MODULE_ID` saja membuat progres,
  gerbang, dan friksi mati tanpa galat — Optimalisasi Modul 12–14 begitu sejak
  30 Mei 2026. Jalankan `scripts/samakan-kunci-identitas.mjs`;
  `validate-public-security.mjs` menagihnya di 84 modul. Rincian: Pedoman §6.7.
- **Draft materi modul** (sejak 29 Sep 2026). Kode, tautan Drive, teks Forum,
  serta angka bacaan dan metadata berkas CAD yang belum dikirim disimpan di
  localStorage `draft_modul_<MODUL_ID>_<nim>` (hanya mahasiswa dan akun
  simulasi bersesi PIN; dosen, tamu, Mode Preview → tanpa kunci) dan pulih
  sesudah muat ulang. Draft dimuat hanya sesudah `_markLoaded` bersesi DAN
  progres `{ok:true}` bersesi sama (server menerima NIM + hash PIN; hash PIN
  sesi tidak terikat NIM), tidak ada tulisan sebelum draft dibaca; kolom
  kode/angka soal yang sudah dinilai (`compAnswered`) tidak pernah diisi draft
  (ledger menang, juga angka `JAWABAN-PRIVAT:ANGKA-CAD`); forum server
  menang kecuali suntingan yang belum terkirim — gabung 3-arah: sidik teks
  server = basis draft → belum terkirim, berbeda → server menang + catatan
  (event `progres-modul:forum-tersimpan` dari PENJAGA-FORUM v2) — dan simpanan
  hanya mengambil teks Forum yang disunting di tab itu; draft hanya menyimpan
  isian yang belum dinilai/terkirim (tanpa kode/angka ledger, tanpa teks
  server; tetap ada sesudah Log Out); metadata berkas CAD dari draft dipakai
  hanya sesudah `getJawabanSaya` sesi itu selesai dan bila server tidak punya
  berkas lain; tugas CAD yang dibuka lagi: metadata draft tidak dipakai
  sesudah muat ulang (v4); kiriman (v5) dikenali di pembungkus accessor
  `window._callCheckModulAnswer`: angka & berkas tugas CAD keluar dari draft
  begitu dikirim, tetap keluar bila hasilnya dinilai atau tak pasti (respons
  hilang/galat), kembali bila ditolak sebelum dinilai; angka draft = angka
  ledger `getJawabanSaya` dibuang saat muat; hasil penilaian diumumkan ke tab
  lain lewat `BroadcastChannel` (tanpa localStorage); NIM yang berganti tanpa
  muat ulang → kolom dikosongkan + muat ulang. Dipasang `scripts/draft-modul.mjs`
  (penanda `DRAFT-MODUL:KUNCI` v1/`PENJAGA` v5, ada `--periksa`, jalankan PALING
  AKHIR, sesudah `simpan-pilihan-poll.mjs`); badan `_saveDraft`/`_loadDraft`
  tidak disunting, dan fungsi draft tidak boleh ditugaskan di skrip module;
  `window._callCheckModulAnswer` ditugaskan tepat sekali (skrip module) dan
  selalu dipanggil lewat `window.`. Rincian: Pedoman §6.3.
- **Asisten Dosen di UTS/UAS** (sejak 26 Sep 2026). Mahasiswa yang login
  memakai `#visitorFab` sebagai tombol "🤖 Asisten Dosen"; daftar mahasiswa
  online (nama, NIM, status poin) tetap khusus dosen dan halaman ujian tidak
  punya Chat Kelas. Sisi halaman dipasang `scripts/buka-asisten-ujian.mjs`
  (12 halaman, penanda `ASISTEN-UJIAN-MAHASISWA`, ada `--periksa`); sisi blok
  AI diubah di backend `frontend-integration/modul-ai-chat.js` lalu
  `apply-ai-chat.js`, **bukan** disunting di antara penanda `AI-CHAT-AGENT`.
  Jangan menerapkan blok dari checkout backend yang lebih tua (panel mahasiswa
  jadi buntu; `validate-public-security.mjs` menolaknya) — gabungkan perubahan
  backend lebih dulu. Rincian: Pedoman §6.8 dan §7.8.
- **Data kelas UTS/UAS khusus dosen.** Tabel kelas tab Hasil, papan Top
  Skor/Top Akses, statistik kelas, dan daftar online hanya dirender untuk
  dosen terverifikasi (`_dosenUjianTerverifikasi` — satu-satunya aturan dosen
  halaman ujian untuk semua yang membuka fitur dosen: `_applyRoleVisibility`,
  auto-login jadwal, tinjauan soal dosen, gerbang wadah soal, dan permintaan
  soal mode dosen; jangan menulis perbandingan nama dosen kedua maupun
  `isDosen… = …role === 'dosen'` baru — yang berbasis role hanya penjaga yang
  membatasi `_previewGuard`/`_previewExportGuard`, penentu mahasiswa, dan
  pengalih ke tinjauan soal dosen); tamu dan
  Mode Preview mendapat placeholder (ajakan berbeda: Preview diarahkan ke tombol
  "Keluar Preview"), identitas yang bukan dosen terverifikasi maupun mahasiswa
  tidak dipulihkan otomatis, dan setiap perubahan peran — termasuk masuk Mode
  Preview — merender ulang seketika (`_segarkanHasilUjian`). "Bukan mahasiswa"
  tidak pernah berarti "dosen". Dipasang `scripts/privasi-hasil-ujian.mjs` (penanda
  `PRIVASI-HASIL-UJIAN`, ada `--periksa`, jalankan sesudah
  `buka-asisten-ujian.mjs`). Halaman modul tidak memakainya. Rincian: Pedoman
  §4.2 dan §7.8.
- **Jawaban mahasiswa privat** (sejak 29 Sep 2026). Record RTDB
  `visitors/<course>/<slot>/<kunci>` terbaca publik (papan peringkat, tab
  Hasil), jadi halaman tidak membaca pilihan PG/benar-salah maupun kode dari
  sana: jawaban sendiri dipulihkan HANYA lewat callable `getJawabanSaya`
  (ledger Firestore; NIM + hash PIN sesi, ditunggu `_loadScoredQuestions`
  ≤ 2,5 detik, hasil terlambat tetap diterapkan) dan digabung ke `data`
  sebelum kode pemulihan lama; `scoreDelta` ledger menang atas RTDB hanya
  bila status entri itu cocok dengan marker RTDB segar soalnya (JEMBATAN v4:
  `qId`/`_comp` = correct, `_comp_partial` = partial, `_mc_used`/`_tf_used`/
  `_comp_used`/`_comp_ulang` = wrong; tidak cocok → entri itu tidak dipakai
  sama sekali, soal tanpa marker tetap dari ledger), supaya hasil terlambat
  yang dibaca sebelum kiriman ulang CAD tidak menurunkan skor. Record
  RTDB baru dibaca SESUDAH penantian itu, dan snapshot yang tidak memuat
  marker benar yang sudah diketahui halaman (`window._answeredQ`) dibaca
  ulang lalu dilewati (TUNGGU v2) — jangan kembalikan `Promise.all([get(…),
  _muatJawabanSaya()])`: snapshot lama membatalkan kiriman ulang CAD. Callable
  gagal → field publik TETAP tidak dipakai (functions + rules ter-deploy
  sebelum halaman), teks netral; galat sementara dicoba lagi,
  `resource-exhausted` (penguncian PIN per NIM + sumber) menunggu
  `remainingSeconds` tanpa mengakhiri sesi, `unauthenticated` membuang hash
  sesi dan meminta PIN.
  Identitas localStorage tanpa field jawaban (`_identitasTanpaJawaban`,
  NIM mahasiswa selalu `student`) dan sesudah login dari alur login
  (`_identitasLogin`, bukan salinan record); tulisan klien ke record visitor
  hanya lewat `_tulisPengunjung` (rules create-only: record lama hanya
  `visitCount`/`lastVisit`)/patch kunjungan, tidak pernah `set()` dari
  snapshot record (juga tidak ada cadangan `freshRec`). Dipasang
  `scripts/jawaban-privat.mjs` (96 halaman, penanda `JAWABAN-PRIVAT`, ada
  `--periksa`); `PILIHAN-PG-PULIH` v3 membaca `mcOrderVersion` ledger; kait
  berkas CAD belum dinilai (`_tandaiBerkasDiServer`) milik generator CAD,
  dan ringkasan berkas belum dinilai tidak dipakai untuk soal yang sudah
  bermarker atau sudah dikirim di sesi itu (`compAnswered`, JEMBATAN v5);
  angka bacaan tugas CAD yang sudah dinilai (field `angka` → `data.angka`,
  status ledger-nya → `data.angkaStatus`, JEMBATAN v3) dipasang blok
  `JAWABAN-PRIVAT:ANGKA-CAD` di 16 halaman CAD (tugas final terkunci berisi
  angka ledger — di modul hanya bila status ledger `correct`, supaya hasil
  terlambat yang lebih tua daripada marker tidak menimpa kiriman ulang;
  kartu kirim ulang diisi bila kolomnya kosong; ekspor "Angka bacaan: X").
  Jangan menambah pembaca `data.selections`/`data.codes`/`data.angka`/`data.angkaStatus` di luar jalur itu,
  dan jangan mengembalikan `set()` seluruh record. Rincian: Pedoman §6.3,
  §7.6, §9.1.
- **Label navbar UTS/UAS** = label modul course-nya (`TENAGALISTRIK // UTS`,
  bukan sisa templat `GETARANMESIN`); dipasang `scripts/label-nav-ujian.mjs`
  (ada `--periksa`), CAD lewat `scripts/cad-exam/bangun.py`.
- **Modul HTML besar dan ber-emoji**; pakai `grep -a`/`git grep` atau skrip
  Node/Python untuk suntingan batch, dan lakukan lewat skrip di `scripts/`
  yang idempoten, bukan suntingan manual per berkas.

### B.4 Implementasi acuan

- Modul: `Getaran-Mekanik/Modul/Modul-1.html` (pola terlengkap); Sisken
  digenerasi (`enrich-sisken-modules.mjs` + skrip pasca-proses).
- Exam: `Optimalisasi-dan-Automasi/Exam/UTS.html`.
- OBE: `Optimalisasi-dan-Automasi/OBE/Penilaian-OBE.htm`.

### B.5 Anti-pola yang masih sering muncul

1. Membaca `pins/` dari klien — sudah tertutup; pakai `verifyPin`.
2. Listener ke `vNama` — input itu sudah tidak ada (hanya `vNim` + `vPin`).
3. Default jadwal modul dalam menit — modul memakai hari.
4. `new Date(due)` di `saveSchedule` — pakai `_wibStringToDate(due)`.
5. Menulis angka penalti lama (0,7/30% atau 0,8/20%) — sekarang 0,65/35%.
   `validate-public-security.mjs` menolaknya di halaman course dan `Admin/`;
   `scripts/penalti-35.mjs` menyeragamkan halaman.
6. Konstanta penilaian di klien sebagai sumber kebenaran — server yang
   menentukan.
7. Mengeklaim "screenshot mustahil" atau memburamkan halaman saat pindah
   tab — dilarang (Pedoman §8).
8. Mengubah `students.json` dengan `json.dumps` — memformat ulang seluruh
   berkas; sisipkan satu baris dengan gaya yang sama.
9. Menjalankan kode mahasiswa (Pyodide) di halaman `Admin/` yang memegang
   sesi admin — `import js` membuka `sessionStorage` dan `fetch` halaman itu.
   Pakai kotak pasir seperti `Admin/analyze-victims.html` (iframe
   `sandbox="allow-scripts"` tanpa `allow-same-origin` + Worker per
   mahasiswa; Pedoman §11.2).
10. "Reset PIN" dengan menghapus `pins/mhs_<NIM>` (juga akun simulasi) —
    slot kosong menjadi login pertama bagi siapa pun yang lebih dulu. Timpa
    `pinHash` di tempat; PIN terpapar dirotasi skrip backend
    (`reset-pin`/`cabut-pin`). Pedoman §4.3.

### B.6 Dokumen wajib baca sebelum perubahan besar

- `Pedoman-Modul.md` §§3–5 (ID/path, login, PIN, jadwal, WIB), §§6–8 (modul,
  progres materi, exam, friction), §§9–11 (Firebase, callable, reset, Admin),
  §§12–13 (OBE, kode verifikasi export), §§14–17 (keamanan, template Word/PPT,
  prosedur perubahan, validasi).
- `Pedoman-Slides.md` untuk deck Slidev (renumber saat sisip/hapus slide,
  notch kamera, kuis interaktif).
- `CLAUDE.md` dan `functions/DEPLOY.md` di repo backend untuk deploy Cloud
  Functions, secrets, rules, dan seed.
