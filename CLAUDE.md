# CLAUDE.md — Orientation untuk Sesi Baru

Quick-start untuk Claude session di repo ini. **Untuk detail apa pun, rujuk ke `Pedoman-Modul.md` (8029 baris, v20)** — ini cuma peta.

> 🎞️ **Mengerjakan slide Slidev?** Baca dulu **`Pedoman-Slides.md`** (struktur deck, komponen, CSS classes, layout, transisi, git workflow slide). Termasuk: penyesuaian per-slide `.slidev-page-N` + **GOTCHA renumber saat sisip/hapus slide** (§14), notch kamera (§15), webcam terkunci (§16), slide kuis interaktif (§17).

---

## Apa ini

LMS multi-course untuk **S1 Teknik Mesin Universitas Mercu Buana** (Dosen: Dedik Romahadi). Single-page HTML per modul/exam, Firebase RTDB + Firestore + Cloud Functions di belakang. 3 mata kuliah aktif:

| Folder | Course ID | Singkatan |
|--------|-----------|-----------|
| `Engineering-Mathematics/` | `math4` | Matematika 4 |
| `Getaran-Mekanik/` | `getaran_mekanik` | Getaran |
| `Optimalisasi-dan-Automasi/` | `optoauto` | Opto |

> ⚠️ **Ejaan Optoauto (quirk on-disk — gampang salah saat scripting):** folder = `Optimalisasi-dan-Automasi/` (**Automasi**, huruf A) TAPI file asesmennya = `Asesmen-Optimalisasi-dan-Otomasi.json` (**Otomasi**, huruf O). Judul tampil "Optimalisasi & Otomasi", slug `optoauto`. Semua path/URL (`STUDENTS_JSON_URL`, dst.) pakai folder `Optimalisasi-dan-Automasi` — string `Optimization-Automation` **tidak pernah** dipakai di kode (itu salah ketik lama di Pedoman, sudah dikoreksi). **Pengecualian baru:** deck **slide** Opto (`penerapan-machine-learning.md`) memakai brand **"Optimalisasi & Automasi"** (huruf A) — sengaja beda dari LMS lain (Modul/Exam/OBE tetap "Otomasi"), atas permintaan dosen. Jangan "perbaiki" jadi Otomasi di slide.

## Struktur per-course

```
<Course>/
├── Attributes/       students.json + Asesmen-<Course>.json (SSOT bobot)
├── Banner/           Halaman pengumuman pertemuan (Banner-Pertemuan-N.html)
├── Modul/            Modul-1.html .. Modul-14.html (14 modul, post-UTS shift sudah)
├── Exam/             UTS.html + UAS.html
└── OBE/              Dokumen-OBE.html (1 file, gabung Silabus + Penilaian)
```

Plus root: `Admin/` (tools dosen: rescale-deadline, recompute-obe-score, reset-soal), `functions/` (Cloud Functions Node), `Pedoman-Modul.md`, `database.rules.json`, `firestore.rules`.

Total file HTML utama: **42 modul + 6 exam + 3 OBE = 51 file**.

## Konvensi Inti (yang sering bikin bingung kalau lupa)

### Login (terbaru, sejak PR #370-#386 — Mei/Juni 2026)
- **Role picker overlay** muncul DULUAN (`#roleChooserOverlay` z-index 100002) — pilih Mahasiswa vs Dosen.
- **Mahasiswa**: input **NIM + PIN 6 digit inline** (no Nama input — auto-lookup dari `masterStudents`). PIN global di RTDB `pins/mhs_<NIM>` (lintas-course).
- **Dosen**: modal password admin + tombol "🕐 Atur Jadwal" inline. Mode upfront → 1× input pw, 1× klik "Simpan Jadwal & Masuk" sekaligus login.
- Cancel dosen modal → kembali ke role picker.
- Animasi electric di-share via `initLoginAnimation(canvasId, particlesId)` dipanggil 3× (picker + visitor + dosen overlay).

### Waktu (WIB-locked)
- **Semua tampilan jam pakai `timeZone: 'Asia/Jakarta'`** di `toLocaleString/toLocaleDateString`.
- Exam helper: `_nowPlusMinAsWibString(min)` + `_wibStringToDate(s)` — force WIB interpretation regardless dosen browser tz.

### Schedule Defaults
| Konteks | Durasi default | Batas akhir default | Perpanjangan |
|---------|---------------|---------------------|--------------|
| **Modul** | 7 **hari** | +6 hari WIB 23:59 | n/a |
| **Exam (UTS/UAS)** | 180 **menit** | now + 180 menit WIB | **120 menit** |

⚠️ Modul pakai HARI, Exam pakai MENIT. Gampang ke-mix.

### Penalti Terlambat
- `_getLateMultiplier()` return **0.7** (30% penalty), bukan 0.8. Per PR #284.
- Exam: setelah `end + extension` → submit diblokir (beda dari modul yang allow indefinitely).

### PIN Global
- `pins/mhs_<NIM>` di RTDB. SHA-256 hash. **Reset modul TIDAK hapus PIN** (separate node).
- Field: `{ pinHash, pinSetAt, nama, nim }`.
- Helper: `_sha256Hex(pin)`, `_setSessionPinHash(hash)`, `_tryMigrateLegacyPin(nim, nama)`.

### Scoring per Soal (Exam)
- Bobot **per tipe**: TF=1 : MC=1 : Comp Easy=2 : Comp Hard=4 (rasio 1:1:2:4).
- Sub-CPMK dgn bobot terbesar di mapping → diisi Comp Hard.
- Total 50 poin per modul (10 MC + 10 Comp E/M + 5 Comp Hard).

## Operasi Umum

### Edit batch lintas file
Script Python di `/tmp/` pakai pattern read → `src.replace(OLD, NEW)` → write. Lihat contoh `/tmp/exam_role_picker.py`, `/tmp/dosen_streamline.py`. **Modul HTML mungkin binary mode** untuk grep (UTF-8 + emoji); pakai `grep -a` atau Python.

### Git workflow
- Branch development: `claude/<feature-slug>` (auto-set per session, lihat instructions).
- Push: `git push -u origin <branch>` (retry up to 4× dgn exponential backoff kalau network fail).
- Buat PR HANYA kalau user minta eksplisit.
- Merge: via GitHub MCP tool `mcp__github__merge_pull_request` (squash default).
- Repo: `dedik-romahadi/mechanical-engineering-courses`.

### Cloud Functions kunci (di `functions/index.js`)
| Function | Role | Aksi |
|----------|------|------|
| `checkExamAnswer` | mahasiswa (PIN) | Server-side validation UTS/UAS, lock 1× answer |
| `publishObeNilai` | dosen | Batch publish nilai OBE ke Firestore |
| `getMyObeNilai` | mahasiswa (PIN) | Fetch nilai sendiri |
| `deleteObeNilai` | dosen | Hapus nilai OBE Firestore |
| `computeObeScores` | dosen | Auto-compute TGS/UTS/UAS dari poin → ke localStorage |
| `recomputeAllObeScores` | dosen | Recompute massal (per examId) |
| `resetExamAttempts` | dosen | Hapus Firestore examAttempts + RTDB visitor (saat Reset) |

EXAM_CONFIG di functions/index.js wajib punya entry per examId: `getaran-mekanik-uts`, `getaran-mekanik-uas`, `optoauto-uts`, `optoauto-uas`, `math4-uts`, `math4-uas`.

### Reference Implementation
- **Modul**: `Getaran-Mekanik/Modul/Modul-1.html` (reference penuh, semua pattern terkini)
- **Exam**: `Optimalisasi-dan-Automasi/Exam/UTS.html`
- **OBE**: `Optimalisasi-dan-Automasi/OBE/Dokumen-OBE.html`

## Anti-pola yang sering muncul

1. **Branch by nama "Dedik Romahadi"** — sudah OBSOLETE. Login flow sekarang via role picker.
2. **`vNama` input** — sudah dihapus. Form Mahasiswa hanya `vNim` + `vPin`. Kalau ada listener ke `vNama` → `TypeError` runtime (lihat fix PR #378).
3. **Default schedule menit di modul** — modul pakai HARI. Cek tipe konversi (`dur*86400000` vs `dur*60000`).
4. **`new Date(due)` di exam saveSchedule** — pakai `_wibStringToDate(due)` untuk WIB-lock.
5. **Penalti 0.8/20%** — sudah 0.7/30%. Update tulisan di banner/help text.
6. **PIN per-modul** — sudah global (`pins/mhs_<NIM>`). Reset modul tidak boleh hapus PIN.

## Dokumen wajib baca sebelum perubahan besar

- `Pedoman-Modul.md` §§7, 8, 9, 9.5 (login, PIN, schedule modul, schedule exam)
- `Pedoman-Modul.md` §13 (Firebase paths + rules)
- `Pedoman-Modul.md` §38 (Dokumen OBE)
- `Pedoman-Modul.md` §39 (Role Picker — BARU di v19)
- `functions/DEPLOY.md` (deploy Cloud Functions)
