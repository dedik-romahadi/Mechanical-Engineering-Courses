# CLAUDE.md — Aturan yang dijalankan lebih dulu

Panduan lengkap ada di `AGENTS.md` (peta repo) dan `Pedoman-Modul.md` (detail
kebijakan). Berkas ini sengaja pendek: isinya hanya hal yang harus dikerjakan
**sebelum** menyentuh apa pun.

## 1. Sinkronkan dengan remote sebelum mengubah apa pun

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
`Mechanical-Engineering-Courses-Backend`. Keduanya punya remote sendiri dan
bisa tertinggal sendiri-sendiri.

> Kejadian nyata (19 Agustus 2026): lokal tertinggal 8 commit di repo ini dan
> 2 commit di backend. Suntingan sempat dibuat di atas basis lama sebelum
> ketahuan, dan harus diulang dari basis yang benar.

## 2. Sesudah mengubah kebijakan, cari seluruh penyebutannya

Angka kebijakan (pengali penalti, poin partial, ambang konsolasi) ditulis di
banyak tempat: kode backend, `Pedoman-Modul.md`, `AGENTS.md`, registry agen
chat, alat di `Admin/`, dan kadang teks yang dibaca mahasiswa. Mengubah satu
tempat saja membuat dokumen bertentangan dengan kodenya.

```bash
grep -rn "<angka lama>" --include=*.md --include=*.html --include=*.js .
```

## 3. Verifikasi sebelum PR

`node scripts/validate-public-security.mjs` wajib hijau — repo ini publik dan
validator itu yang menahan kunci jawaban agar tidak ikut terkirim.
