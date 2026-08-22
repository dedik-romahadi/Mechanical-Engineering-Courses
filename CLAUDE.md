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
Firestore + Cloud Functions di belakang (repo privat). Empat mata kuliah:

| Folder | Course ID | Slug callable modul | Singkatan |
|---|---|---|---|
| `Engineering-Mathematics/` | `math4` | `math4-modul-N` | Math4 |
| `Getaran-Mekanik/` | `getaran_mekanik` | `getaran-mekanik-modul-N` | Getaran |
| `Optimalisasi-dan-Automasi/` | `optoauto` | `optoauto-modul-N` | Opto |
| `Sistem-Kendali-Cerdas/` | `sistem_kendali_cerdas` | `sistem_kendali_cerdas-modul-N` | Sisken |

> ⚠️ **Ejaan Opto (mudah salah saat scripting):** folder `Optimalisasi-dan-Automasi/`
> (**Automasi**, huruf A) tetapi berkas asesmennya
> `Asesmen-Optimalisasi-dan-Otomasi.json` (**Otomasi**, huruf O). Judul tampil
> "Optimalisasi & Otomasi", slug `optoauto`. Semua path/URL memakai folder
> `Optimalisasi-dan-Automasi`. Pengecualian: deck slide Opto memakai brand
> "Optimalisasi & Automasi" (huruf A) atas permintaan dosen — jangan "diperbaiki".

Total berkas HTML utama: **56 modul + 8 exam + 4 OBE**.

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
verify-export-code, analyze-victims), `Template-Modul-Word-dan-PPT/` (template
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
  Reset modul/exam tidak menghapus PIN. Rincian: Pedoman §4.
- **Akun simulasi** NIM `41399999901` ("SIMULASI MAHASISWA"): jawaban dinilai
  tetapi tidak disimpan, tidak tampil di papan hasil; progres materi persis
  mahasiswa. PIN-nya tidak boleh ditulis di repo. Rincian: Pedoman §4.5.
- **Waktu WIB-locked.** Semua tampilan jam memakai `timeZone: 'Asia/Jakarta'`;
  deadline diparse dengan `_wibStringToDate`, bukan `new Date(...)`.
- **Jadwal.** Modul memakai **hari** (default 7 hari, deadline +6 hari
  23:59 WIB) dan tidak punya batas atas (terlambat tetap boleh). Exam memakai
  **menit** (default 180, perpanjangan 120) dan ditutup setelah
  `end + extension`. Jangan tertukar `dur*86400000` vs `dur*60000`.
- **Penalti terlambat 0,65** (potongan 35%) seragam semua course; sumber
  kebenarannya server (`cfg.lateMultiplierValue`). Partial Hard 0,5.
- **Skor.** Modul: 25 soal = 10 PG ×1 + 10 Komputasi ×2 + 5 Hard ×4 = 50.
  Exam: TF=1, MC=1, Comp Easy=2, Comp Hard=4; total 100.
- **Progres materi berurutan** (sejak 22 Agu 2026): kotak centang per bagian,
  tab Tugas/Forum/Hasil terkunci sampai lengkap, login modul *n* ditolak bila
  modul *n*−1 belum lengkap (centang + tugas + forum). Rincian: Pedoman §6.7.
- **Efek & skrip penyuntik.** Emoji/suara jawaban, efek memuat, friction,
  pengecualian akun simulasi, lapisan overlay login, dan progres modul
  disuntikkan oleh skrip idempoten di `scripts/` yang wajib dijalankan ulang
  setelah regenerasi modul (daftar di Pedoman §17.1). Regenerasi Sisken
  bukan satu perintah (Pedoman §6.4).
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
6. Konstanta penilaian di klien sebagai sumber kebenaran — server yang
   menentukan.
7. Mengeklaim "screenshot mustahil" atau memburamkan halaman saat pindah
   tab — dilarang (Pedoman §8).
8. Mengubah `students.json` dengan `json.dumps` — memformat ulang seluruh
   berkas; sisipkan satu baris dengan gaya yang sama.

### B.6 Dokumen wajib baca sebelum perubahan besar

- `Pedoman-Modul.md` §§3–5 (ID/path, login, PIN, jadwal, WIB), §§6–8 (modul,
  progres materi, exam, friction), §§9–11 (Firebase, callable, reset, Admin),
  §§12–13 (OBE, kode verifikasi export), §§14–17 (keamanan, template Word/PPT,
  prosedur perubahan, validasi).
- `Pedoman-Slides.md` untuk deck Slidev (renumber saat sisip/hapus slide,
  notch kamera, kuis interaktif).
- `CLAUDE.md` dan `functions/DEPLOY.md` di repo backend untuk deploy Cloud
  Functions, secrets, rules, dan seed.
