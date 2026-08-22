# ⚙️ Mechanical Engineering Courses

[![GitHub stars](https://img.shields.io/github/stars/dedik-romahadi/Mechanical-Engineering-Courses?style=social)](https://github.com/dedik-romahadi/Mechanical-Engineering-Courses)
[![License](https://img.shields.io/github/license/dedik-romahadi/Mechanical-Engineering-Courses)](LICENSE)
![GitHub repo size](https://img.shields.io/github/repo-size/dedik-romahadi/Mechanical-Engineering-Courses)
![Last Commit](https://img.shields.io/github/last-commit/dedik-romahadi/Mechanical-Engineering-Courses)

**Learning Management System (LMS) untuk S1 Teknik Mesin — Universitas Mercu Buana**
Dosen pengampu: Dedik Romahadi, S.T., M.Sc.

🔗 **Situs live:** https://dedik-romahadi.github.io/Mechanical-Engineering-Courses/

---

## 🌟 Tentang Repository Ini

Ini bukan sekadar kumpulan materi kuliah — ini **LMS yang berjalan penuh**. Setiap modul dan ujian adalah satu halaman HTML mandiri yang menjalankan Python di browser, merender rumus matematika, mencatat kehadiran real-time, dan menilai jawaban mahasiswa lewat server.

Yang bisa dilakukan mahasiswa di sini:

- Login dengan **NIM + PIN 6 digit** (PIN berlaku lintas mata kuliah)
- Belajar **berurutan**: setiap bagian materi ditutup kotak centang pemahaman; tab Tugas, Forum, dan Hasil terbuka setelah semua bagian dicentang, dan modul berikutnya terbuka setelah modul sebelumnya lengkap (materi + tugas + forum)
- Mengerjakan latihan komputasi dengan **Python langsung di browser** (tanpa install apa pun), dengan umpan balik langsung — penjelasan, emoji, dan efek suara
- Mengerjakan **UTS/UAS online** dengan penilaian sisi-server, soal parametrik per NIM, dan jadwal terkunci WIB
- Berdiskusi di forum (tersimpan di server), bertanya ke **asisten AI** berbasis materi modul, melihat nilai OBE, dan mengunduh modul dalam format PDF

## 📚 Mata Kuliah Aktif

| Folder | Course ID | Nama Tampil | Isi |
|---|---|---|---|
| `Engineering-Mathematics/` | `math4` | Matematika 4 | Persamaan diferensial, Transformasi Laplace, Deret Fourier |
| `Getaran-Mekanik/` | `getaran_mekanik` | Getaran Mekanik | Getaran bebas & paksa, sistem 2-DoF, analisis modal, FFT/STFT |
| `Optimalisasi-dan-Automasi/` | `optoauto` | Optimalisasi & Otomasi | Time series, ekstraksi fitur, optimasi linear/non-linear, machine learning |
| `Sistem-Kendali-Cerdas/` | `sistem_kendali_cerdas` | Sistem Kendali Cerdas | Fungsi transfer, respons sistem umpan balik, PID, logika fuzzy, jaringan saraf tiruan, algoritma genetika |

Masing-masing berisi **14 modul + UTS + UAS + dokumen OBE**, lengkap dengan versi Word/PDF tiap modul.
Total: **56 halaman modul · 8 halaman ujian · 4 dokumen OBE · 72 banner pertemuan**.

## 🗂️ Struktur Repository

```
Mechanical-Engineering-Courses/
├── <Mata-Kuliah>/
│   ├── Attributes/     students.json + Asesmen-<MK>.json (SSOT bobot nilai)
│   ├── Banner/         Halaman pengumuman per pertemuan
│   ├── Modul/          Modul-1.html .. Modul-14.html
│   ├── Modul-Word/     Modul versi .docx + .pdf (setoran BOP)
│   ├── Exam/           UTS.html + UAS.html
│   ├── OBE/            Penilaian-OBE.htm (Silabus + Penilaian)
│   └── Slides/         Deck Slidev (hanya Getaran & Opto)
├── Admin/              Tools dosen (rescale-deadline, reset-soal, recompute-obe-score, verify-export-code, ...)
├── PDD-UKTPT/          Portofolio pengajaran Serdos 2026 (slide + video + narasi)
├── Template-Modul-Word-dan-PPT/   Template resmi BOP — jangan diubah
├── Unduhan-Gabungan/   PDF gabungan modul, ujian, dan RPS per mata kuliah
├── Images/             Logo dan foto
├── scripts/            Generator, penyuntik idempoten, dan validator (≈50 skrip)
├── index.html          Halaman depan situs
├── CLAUDE.md           Aturan awal sesi + peta orientasi repo
├── Pedoman-Modul.md    📖 Spesifikasi lengkap sistem (rujukan utama)
└── Pedoman-Slides.md   📖 Panduan deck Slidev
```

## 🏗️ Arsitektur

**Frontend (repo ini, publik)** — HTML/CSS/JS murni tanpa framework dan tanpa build step. Setiap halaman berdiri sendiri; perubahan lintas halaman dilakukan lewat skrip idempoten di `scripts/`, bukan suntingan manual per berkas.

| Komponen | Teknologi |
|---|---|
| Runtime Python | Pyodide 0.25.1 |
| Render matematika | KaTeX (auto-render) |
| Data & auth | Firebase Web SDK 12.11.0 (RTDB, Firestore, Functions, Auth) |
| Presentasi | Slidev + Vue 3 |
| Hosting | GitHub Pages — dibangun GitHub Actions, dipublikasikan lewat branch `gh-pages` |

**Backend (repo privat terpisah)** — [`Mechanical-Engineering-Courses-Backend`](https://github.com/dedik-romahadi/Mechanical-Engineering-Courses-Backend) memegang Cloud Functions (penilaian, progres materi, OBE, asisten AI), kunci jawaban, bank soal parametrik, seed, serta Firestore/RTDB Rules.

> ⚠️ **Pemisahan ini disengaja dan ditegakkan otomatis.** `scripts/validate-public-security.mjs` dan workflow CI akan **menggagalkan build** jika `functions/`, `firebase.json`, `firestore.rules`, atau `database.rules.json` muncul di repo publik ini. Jangan pernah menyalin artefak backend ke sini — kunci jawaban ada di dalamnya.

Nilai tidak pernah dihitung di sisi klien. Cloud Functions `checkModulAnswer` / `checkExamAnswer` adalah satu-satunya yang memegang kunci jawaban dan menulis poin; RTDB Rules mengunci field `points` agar klien tidak bisa mengubahnya sendiri, dan node `pins/` (hash PIN) tertutup dari pembacaan klien. Progres materi (centang berurutan, forum, gerbang antar-modul) juga divalidasi dan disimpan di server.

## 🚀 Deployment

Deploy otomatis ke GitHub Pages setiap ada commit masuk `main`, lewat `.github/workflows/deploy-slides.yml`. Workflow membangun deck Slidev, menyusun `_site` memakai **allowlist per-direktori**, menolak artefak sensitif, lalu **mem-push hasilnya ke branch `gh-pages`** (Pages Source: branch `gh-pages`, root).

> ⚠️ **Jangan kembalikan publikasi ke `actions/deploy-pages`** (batas keras 10 menit berulang kali terlampaui oleh ukuran situs) dan **jangan pindahkan situs ke `/docs`** — roster login mahasiswa di-fetch dari struktur root Pages. Lihat `Pedoman-Modul.md` §1.1.

## 🤝 Kontribusi & Pengembangan

Baca dulu, berurutan:

1. **`CLAUDE.md`** — aturan sebelum mulai (sinkron remote, validasi, alur PR), peta cepat, konvensi inti, dan anti-pola
2. **`Pedoman-Modul.md`** — spesifikasi lengkap (ID/path, login, PIN, jadwal WIB, progres materi, scoring, Firebase, OBE, keamanan)
3. **`Pedoman-Slides.md`** — khusus deck Slidev

Sebelum membuat PR, wajib lulus:

```bash
node scripts/validate-public-security.mjs
```

## 📜 Lisensi

Dilisensikan di bawah [MIT License](LICENSE) — bebas digunakan, dimodifikasi, dan dibagikan untuk tujuan pendidikan.

---

Dibuat untuk mahasiswa Teknik Mesin Universitas Mercu Buana ⚙️
Ada pertanyaan atau saran? Buka [Issue](https://github.com/dedik-romahadi/Mechanical-Engineering-Courses/issues).
