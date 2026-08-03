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
- Mengerjakan latihan komputasi dengan **Python langsung di browser** (tanpa install apa pun)
- Mengerjakan **UTS/UAS online** dengan penilaian sisi-server dan jadwal terkunci WIB
- Melihat nilai OBE dan mengunduh modul dalam format Word/PDF

## 📚 Mata Kuliah Aktif

| Folder | Course ID | Nama Tampil | Isi |
|---|---|---|---|
| `Engineering-Mathematics/` | `math4` | Matematika 4 | Persamaan diferensial, Transformasi Laplace, Deret Fourier |
| `Getaran-Mekanik/` | `getaran_mekanik` | Getaran Mekanik | Getaran bebas & paksa, sistem 2-DoF, analisis modal, FFT/STFT |
| `Optimalisasi-dan-Automasi/` | `optoauto` | Optimalisasi & Otomasi | Time series, ekstraksi fitur, optimasi linear/non-linear, machine learning |

Masing-masing berisi **14 modul + UTS + UAS + dokumen OBE**.
Total: **42 halaman modul · 6 halaman ujian · 3 dokumen OBE · 57 banner pertemuan**.

## 🗂️ Struktur Repository

```
Mechanical-Engineering-Courses/
├── <Mata-Kuliah>/
│   ├── Attributes/     students.json + Asesmen-<MK>.json (SSOT bobot nilai)
│   ├── Banner/         Halaman pengumuman per pertemuan
│   ├── Modul/          Modul-1.html .. Modul-14.html
│   ├── Modul-Word/     Modul versi .docx + .pdf (setoran BOP)
│   ├── Exam/           UTS.html + UAS.html
│   ├── OBE/            Dokumen-OBE.html (Silabus + Penilaian)
│   └── Slides/         Deck Slidev (Getaran & Opto)
├── Admin/              Tools dosen (rescale-deadline, reset-soal, recompute-obe-score, ...)
├── PDD-UKTPT/          Portofolio pengajaran Serdos 2026 (slide + video + narasi)
├── Template-Modul-Word-dan-PPT/   Template resmi BOP — jangan diubah
├── Unduhan-Gabungan/   PDF gabungan modul, ujian, dan RPS per mata kuliah
├── Images/             Logo dan foto
├── scripts/            validate-public-security.mjs (gate keamanan)
├── index.html          Halaman depan situs
├── AGENTS.md           Peta orientasi untuk sesi agen baru
├── Pedoman-Modul.md    📖 Spesifikasi lengkap sistem (rujukan utama)
└── Pedoman-Slides.md   📖 Panduan deck Slidev
```

## 🏗️ Arsitektur

**Frontend (repo ini, publik)** — HTML/CSS/JS murni tanpa framework dan tanpa build step. Setiap halaman berdiri sendiri.

| Komponen | Teknologi |
|---|---|
| Runtime Python | Pyodide 0.25.1 |
| Render matematika | KaTeX 0.16.9 |
| Data & auth | Firebase Web SDK 12.11.0 (RTDB, Firestore, Functions, Auth) |
| Presentasi | Slidev + Vue 3 |
| Hosting | GitHub Pages via GitHub Actions |

**Backend (repo privat terpisah)** — [`Mechanical-Engineering-Courses-Backend`](https://github.com/dedik-romahadi/Mechanical-Engineering-Courses-Backend) memegang Cloud Functions, kunci jawaban, seed soal, serta Firestore/RTDB Rules.

> ⚠️ **Pemisahan ini disengaja dan ditegakkan otomatis.** `scripts/validate-public-security.mjs` dan workflow CI akan **menggagalkan build** jika `functions/`, `firebase.json`, `firestore.rules`, atau `database.rules.json` muncul di repo publik ini. Jangan pernah menyalin artefak backend ke sini — kunci jawaban ada di dalamnya.

Nilai tidak pernah dihitung di sisi klien. Cloud Functions `checkModulAnswer` / `checkExamAnswer` adalah satu-satunya yang memegang kunci jawaban dan menulis poin; RTDB Rules mengunci field `points` agar klien tidak bisa mengubahnya sendiri.

## 🚀 Deployment

Deploy otomatis ke GitHub Pages setiap ada commit masuk `main`, lewat `.github/workflows/deploy-slides.yml`. Workflow membangun deck Slidev, lalu menyusun `_site` memakai **allowlist per-direktori** dan menolak artefak sensitif sebelum publish.

> ⚠️ **Jangan ubah Pages Source dari "GitHub Actions" ke "Deploy from a branch".** Semua path di luar folder tersebut akan langsung 404 — termasuk roster login mahasiswa yang di-fetch dari Pages. Lihat `Pedoman-Modul.md` §1.1.

## 🤝 Kontribusi & Pengembangan

Baca dulu, berurutan:

1. **`AGENTS.md`** — peta cepat, konvensi inti, dan daftar anti-pola
2. **`Pedoman-Modul.md`** — spesifikasi lengkap (ID/path, login, PIN, jadwal WIB, scoring, Firebase, OBE, keamanan)
3. **`Pedoman-Slides.md`** — khusus deck Slidev

Sebelum commit, wajib lulus:

```bash
node scripts/validate-public-security.mjs
```

## 📜 Lisensi

Dilisensikan di bawah [MIT License](LICENSE) — bebas digunakan, dimodifikasi, dan dibagikan untuk tujuan pendidikan.

---

Dibuat untuk mahasiswa Teknik Mesin Universitas Mercu Buana ⚙️
Ada pertanyaan atau saran? Buka [Issue](https://github.com/dedik-romahadi/Mechanical-Engineering-Courses/issues).
