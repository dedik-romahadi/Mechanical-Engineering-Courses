# Pedoman Desain Sistem & Konten — Modul Pertemuan (LMS Multi-Course)

> **Referensi Implementasi:** `Modul-4.html` — PD Linier Orde N, Bernoulli, Reduksi Orde
> **Mata Kuliah Pendukung:** Matematika 4 · Getaran Mekanik · Optimalisasi & Otomasi
> **Program Studi:** S1 Teknik Mesin · Universitas Mercu Buana
> **Dosen:** Dedik Romahadi
> **Tujuan:** Dokumentasi lengkap arsitektur, sistem, dan konten sehingga modul baru dapat dibuat dengan desain identik di tiga mata kuliah berbeda.
>
> **Diperbarui:** April 2026 (v7) — mencerminkan refactor Modul-4 (countdown circular, palet per-tab, hero animation per-tab, scoring rule lengkap, Firebase Security Rules, blokir akses di luar jadwal, **sistem PIN 6-digit untuk mahasiswa**, **password admin ter-hash SHA-256**, **animasi login constellation + electric charges + lightning blasts**, **Dosen Login Modal dengan password masking**, **role-based visibility untuk tombol Reset** — tombol Atur Jadwal tetap visible sebagai bootstrap action, **scoring universal 50 poin** dengan 5 soal Komputasi Hard @4 poin, **partial credit +1 poin** untuk Hard yang salah, **status label butuh poin** — Tepat Waktu/Terlambat hanya diberikan jika mahasiswa memperoleh poin > 0 (akses tanpa poin = Belum), **Bolos diperluas** — mencakup juga mahasiswa yang akses tapi 0 poin saat jadwal sudah berakhir, **PIN global lintas-course** — satu PIN per mahasiswa yang berlaku di SEMUA mata kuliah dan modul, disimpan di node `pins/mhs_<NIM>` terpisah dari visitor records sehingga reset modul tidak menghapus PIN).
>
> **v14 (April 2026, akhir bulan) — Animation Topic-Alignment + API Timeout Mitigation:** Dokumentasi formal aturan **animasi canvas WAJIB sesuai topik modul** untuk mencegah bug pedagogis "judul HTML LP tapi canvas masih FFT" yang muncul saat copy template (§14.1.1). Mapping animasi reference per topik (FFT → LP → NLP → metaheuristik) di §14.1.2 dengan slot konvensi `drawPhysics/Sweep/Iso/HPB`. Strategi audit pre-merge dengan tabel checklist 6-layer (HTML title, slider, canvas drawing, tip-box, info panel, float formulas) di §14.1.3. **§34 BARU — Strategi mitigasi `API Stream Idle Timeout`** dengan chunked commit pattern (per-animasi commit, HTML-then-JS layered, write+splice escape hatch); recovery procedure (revert vs commit-as-wip); pre-flight checklist refactor besar; lessons learned dari Modul-8 LP & Modul-9 NLP animation refactor (8 animasi, 1700+ baris JS, zero work loss dengan strategi chunked). Pattern ini sekarang **standar wajib** untuk pekerjaan replacement > 500 baris atau > 30KB.
>
> **v13 (April 2026, late-month) — Vibrant Countdown redesign:** Redesain panel hitung mundur deadline (Section §10) menjadi lebih colorful & menarik. Tambahan: aurora konik berputar, gradient border 4-warna via mask compositing, label sweep animation, ring 130px (dari 120px) dengan halo radial pulsing, double drop-shadow glow neon, hover scale-up, gradient-text angka 32px font-weight 900, ring detik dengan tick animation, note deadline sebagai pill glassmorphism. Bug fix: `overflow:visible` pada `.cd-ring svg` untuk mencegah glow drop-shadow ter-clip menjadi bayang kotak di tepi viewport SVG. Applied ke seluruh modul Optimalisasi & Automasi (6) dan Getaran-Mekanik (7). Pedoman lengkap di §10.4.
>
> **v12 (April 2026, late-month) — Export Tugas consolidation + MC export bug fix:** Konsolidasi tombol Export tugas dari 2 panel (atas + bawah) menjadi satu tombol di score-bar (sticky), dengan baris kedua memuat petunjuk submit dan indikator soal yang belum diisi (`#export-blocked-msg`, center-aligned). Perbaiki 2 bug critical di export PG: (1) selektor multi-class `'.selected, .correct-ans, .wrong-ans'` mengembalikan opsi correct (urutan DOM) sebagai pilihan user — fix dengan `.radio-option.selected` saja + cek `classList.contains('correct-ans')`; (2) restore Firebase tidak re-apply `.selected`, sehingga export pasca-reload tampil "Belum dijawab" — fix dengan fallback ke `mcAnswered`/`mcScores`. Tambah konvensi subtitle cover dan filename download (`Tugas{N}_{NIM}_{CourseSlug}.html`) untuk mencegah leakage course asal saat copy modul. Pattern lengkap di §15.1c, §15.3d, §25.10, §25.11. Applied ke 26 modul (Optoauto 1–6, Getaran 1–6, Math 1–14).
>
> **v7 (April 2026, late-month) — NIM-Direct Variable Pattern release:** Redesign menyeluruh atas 28 soal parametric di UTS Getaran Mekanik (4 TF + 9 MC + 15 Comp) untuk membuat hubungan NIM ↔ variabel **transparan**. Setiap soal parametric kini menampilkan formula eksplisit di question text (`var = formula = computed_value`) dengan setidaknya 1 variabel langsung dari N (atau N+1). Mahasiswa bisa verifikasi parameter mereka sendiri tanpa tebak-tebakan. Pattern lengkap + anti-pattern + migration guide didokumentasikan di **§32 (BARU)**. Math correctness terverifikasi di 140 boundary cases (28 soal × N=0,25,50,75,99). Audit checklist v7 di §31 tambah section "NIM-Direct Variable Pattern".
> 
> **v6 (April 2026, post-UTS build) — Architecture & pattern release:** Mendokumentasikan arsitektur halaman UTS yang berbeda signifikan dari Modul reguler — skoring 70-poin (TF + MC + Comp E/M + Hard), tipe soal True/False (BARU), NIM-based parametric questions, dynamic render system, schedule duration MENIT (bukan hari), multi-mode countdown ('to-start'/'in-progress'/'expired'), UTS-murni (no answer reveal), one-shot 3-layer enforcement. Plus 5 bug pattern baru (§26): **Cross-script scope trap** (CRITICAL — let/const di module script tidak akses-able dari regular script — applicable to ALL modul), inline `display:none` override CSS class, countdown setTimeout chain fragility, startCountdown early-return blocks tick, **Reset modal misleading PIN messaging** (PIN tidak terhapus karena global, tapi pesan UI bilang sebaliknya — fixed di v6). BARU: §28 inline SVG diagram pattern (`_svg` namespace + `_diagram` wrapper, parametric per-NIM), §29 selection persistence + cache restore (idempotent visual restore via `_cachedFirebaseData`), §30 Google Drive link submission validation. Audit checklist v6 di §31.
>
> **v5 (April 2026, late-month) — Bug fix release:** Fix 3 bug kritikal yang ditemukan di produksi: (1) **Null-comparison trap di Firebase Rules** menyebabkan poin tidak tersimpan — root cause + solusi 2-lapis di §13.4.1, app fix `points: 0` & `scoredQuestions: ''` init wajib, rules fix defensive null check; (2) **Chat tidak bisa setelah first login** — `saveIdentity()` sekarang single source of truth dengan hook `renderChat()` + `onChatInput()` di §24.4; (3) **Copy Forum HTML gagal di banyak browser** — 3-tier fallback `navigator.clipboard` → `execCommand` → popup window di §16.3. Semua bug + solusi didokumentasikan di **§25 (BARU) — Common Bugs & Anti-Recurrence** dengan audit checklist mandatori sebelum deploy.

---

## Daftar Isi

1. [Arsitektur Umum](#1-arsitektur-umum)
2. [Technology Stack](#2-technology-stack)
3. [Multi-Course Configuration](#3-multi-course-configuration)
4. [Sistem Warna & Palet per Tab](#4-sistem-warna--palet-per-tab)
5. [Tipografi](#5-tipografi)
6. [Struktur Navbar](#6-struktur-navbar)
7. [Sistem Login & Visitor](#7-sistem-login--visitor)
8. [Sistem PIN Keamanan Mahasiswa](#8-sistem-pin-keamanan-mahasiswa)
9. [Sistem Jadwal & Zona Waktu](#9-sistem-jadwal--zona-waktu)
10. [Countdown Circular Rings](#10-countdown-circular-rings)
11. [Hero Animations per Tab](#11-hero-animations-per-tab)
12. [Animasi Login Overlay](#12-animasi-login-overlay)
13. [Struktur Firebase & Security Rules](#13-struktur-firebase--security-rules)
14. [Tab Modul — Struktur Konten](#14-tab-modul--struktur-konten)
15. [Tab Tugas — Sistem Soal & Validasi](#15-tab-tugas--sistem-soal--validasi)
16. [Tab Forum — Diskusi & Export](#16-tab-forum--diskusi--export)
17. [Tab Hasil — Aktivitas & Stats](#17-tab-hasil--aktivitas--stats)
18. [Sistem Penilaian & Anti-Manipulasi](#18-sistem-penilaian--anti-manipulasi)
19. [Password Admin & Hashing](#19-password-admin--hashing)
20. [Reset & Administrasi Data](#20-reset--administrasi-data)
21. [Komponen UI Reusable](#21-komponen-ui-reusable)
22. [Checklist Membuat Modul Baru](#22-checklist-membuat-modul-baru)
23. [Konfigurasi Cepat per Pertemuan](#23-konfigurasi-cepat-per-pertemuan)
24. [Sistem Real-time Chat & Online Presence](#24-sistem-real-time-chat--online-presence)
25. [Common Bugs & Anti-Recurrence (Lessons Learned)](#25-common-bugs--anti-recurrence-lessons-learned)
26. [Bug & Pattern Baru dari UTS Build (April 2026, akhir bulan)](#26-bug--pattern-baru-dari-uts-build-april-2026-akhir-bulan)
27. [UTS Architecture — Berbeda dari Modul Reguler](#27-uts-architecture--berbeda-dari-modul-reguler)
28. [Inline SVG Diagram Pattern (BARU di UTS)](#28-inline-svg-diagram-pattern-baru-di-uts)
29. [Selection Persistence & Cache Restore (BARU di UTS)](#29-selection-persistence--cache-restore-baru-di-uts)
30. [Google Drive Link Submission (BARU di UTS, juga relevan untuk Tugas)](#30-google-drive-link-submission-baru-di-uts-juga-relevan-untuk-tugas)
31. [Audit Checklist v7 (Update dari §25.8 dan v6)](#31-audit-checklist-v7-update-dari-258-dan-v6)
32. [NIM-Direct Variable Pattern — Transparent NIM-to-Variable Mapping (BARU di v7)](#32-nim-direct-variable-pattern--transparent-nim-to-variable-mapping-baru-di-v7)
33. [Prosedur Pengisian Lembar UTS dengan Acuan Asesmen JSON (BARU di v8)](#33-prosedur-pengisian-lembar-uts-dengan-acuan-asesmen-json-baru-di-v8)
34. [Strategi Mitigasi API Stream Idle Timeout (BARU di v14)](#34-strategi-mitigasi-api-stream-idle-timeout-baru-di-v14)

---

## 1. Arsitektur Umum

Setiap modul pertemuan adalah **satu file HTML tunggal** yang mengandung 4 tab utama. Semua tab di-render bersamaan; hanya satu yang terlihat pada satu waktu.

```
Modul-N.html
│
├── <head>  — External CDN (fonts, KaTeX, Pyodide)
│
├── <style> — CSS variables + tab themes + semua class komponen
│
├── <body>
│   ├── Visitor Overlays (login, reset, jadwal)
│   ├── Pyodide Status Bar
│   ├── Navbar (fixed top, 60px)
│   ├── Subnav Modul (fixed, 40px, slide in/out)
│   │
│   ├── #page-modul   (TAB 1: Materi, animasi, pustaka)
│   ├── #page-tugas   (TAB 2: 10 MC + 10 Komputasi)
│   ├── #page-forum   (TAB 3: Skenario kasus + 3 diskusi)
│   └── #page-hasil   (TAB 4: Leaderboard + stats kehadiran)
│
├── <script> — JS utama (tab switching, hero animations, soal)
└── <script type="module"> — Firebase + visitor system
```

### 1.1 Prinsip Desain

| Prinsip | Implementasi |
|---------|-------------|
| **Single file** | Satu `.html` untuk semua tab — mudah deploy GitHub Pages |
| **Multi-course** | Path Firebase berbasis `course` agar 3 MK terpisah datanya |
| **Dark theme** | Background per-tab dengan gradient distinct |
| **Tab-themed palettes** | Tiap tab punya palet warna sendiri (lihat §4) |
| **Hero canvas animations** | Animasi per-tab unik (slope field, orbit, decay, constellation) |
| **Countdown circular** | 4 ring SVG warna distinct per unit waktu |
| **Glassmorphism nav** | `backdrop-filter:blur` + semi-transparent |
| **Scroll reveal** | `IntersectionObserver` — elemen muncul saat scroll |
| **Firebase real-time** | Visitor tracking, poin, jadwal tersinkron lintas-device |
| **Schedule-gated** | Poin dan akses HANYA disimpan dalam rentang jadwal aktif |
| **Python di browser** | Pyodide untuk validasi kode mahasiswa |
| **Anti-manipulasi** | Semua jawaban (benar/salah) disimpan Firebase + Security Rules |
| **Server-side guard** | Firebase Security Rules membatasi `points` max +2 per write |

---

## 2. Technology Stack

### 2.1 External Dependencies (CDN)

```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900
  &family=Source+Sans+3:wght@300;400;600;700
  &family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">

<!-- Python WebAssembly (hanya untuk tab Tugas) -->
<script src="https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js"></script>

<!-- KaTeX (rendering formula matematika) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js"></script>

<!-- Firebase (ES module, di bagian bawah body) -->
<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getDatabase, ref, get, set, remove, onValue }
  from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";
</script>
```

### 2.2 Firebase Config (sama untuk semua mata kuliah)

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDvgpxKxXSOFHwFTxWZeCA9IxmgYBM6lW8",
  authDomain: "getaran-mekanik.firebaseapp.com",
  databaseURL: "https://getaran-mekanik-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "getaran-mekanik",
  storageBucket: "getaran-mekanik.firebasestorage.app",
  messagingSenderId: "430886299733",
  appId: "1:430886299733:web:0edecd5d4adf73e7440cdc",
};
```

> **Catatan:** Project Firebase tetap satu (`getaran-mekanik`). Pemisahan antar mata kuliah dilakukan via path DB (lihat §3 dan §12).

### 2.3 Pyodide

- Versi: `v0.25.1`
- Package yang di-load: `numpy`, `pandas`, `scipy` (lazy)
- Loading: Hanya saat tab Tugas pertama kali dibuka
- Singleton: `_pyodideInstance` — tidak re-load antar soal

---

## 3. Multi-Course Configuration

### 3.1 Daftar Mata Kuliah & String Identifier

| Mata Kuliah | Course Slug | DB Path | Settings Path | LOCAL_IDENTITY Prefix | Repo Attributes Folder |
|-------------|-------------|---------|---------------|------------------------|------------------------|
| Matematika 4 | `math4` | `visitors/math4/...` | `settings/math4/...` | `math4_identity_` | `Engineering-Mathematics/Attributes/` |
| Getaran Mekanik | `getaran_mekanik` | `visitors/getaran_mekanik/...` | `settings/getaran_mekanik/...` | `getaran_mekanik_identity_` | `Getaran-Mekanik/Attributes/` |
| Optimalisasi & Otomasi | `optoauto` | `visitors/optoauto/...` | `settings/optoauto/...` | `optoauto_identity_` | `Optimization-Automation/Attributes/` |

**Aturan penamaan slug:**
- Lowercase + underscore (bukan tanda hubung) untuk konsistensi
- Maks 40 karakter, regex `^[a-z0-9_-]{1,40}$`
- Slug **harus terdaftar** di Firebase Security Rules — kalau tidak, semua write akan ditolak
- **Slug harus sama persis** di: (1) `DB_PATH`, (2) `SCHEDULE_PATH`, (3) `LOCAL_IDENTITY` prefix, (4) Firebase Rules validate, (5) variabel `RELATED_MODULES` cleanup. **Tidak boleh** meminjam slug dari mata kuliah lain (misal template pertama Optoauto — jangan gunakan `optoauto_identity_` untuk course selain Optoauto).

**⚠ Penting — Konsistensi `LOCAL_IDENTITY`:**

localStorage key harus **course-scoped** sesuai slug DB. Jangan mewarisi prefix dari template course lain (ini legacy bug yang pernah terjadi saat template di-copy dari Optoauto tanpa me-rename prefix). Risiko:
- Dua course dengan MODULE_ID sama (misal keduanya `modul-4`) akan **bentrok session** di localStorage
- Tombol Reset di course A bisa tidak sengaja menghapus session course B
- Mahasiswa yang enrolled di >1 course akan punya identity yang salah-slot

### 3.2 Konstanta yang Membedakan Mata Kuliah di HTML

```javascript
// ══════════════════════════════════════════════════════════════
// MATEMATIKA 4
// ══════════════════════════════════════════════════════════════
const MODULE_ID       = 'modul-4';
const DB_PATH         = `visitors/math4/${MODULE_ID}`;
const PERTEMUAN       = 'pertemuan-4';
const RELATED_MODULES = ['forum-4', 'tugas-4'];
const SCHEDULE_PATH   = `settings/math4/${PERTEMUAN}/schedule`;
const LOCAL_IDENTITY  = `math4_identity_${MODULE_ID}`;
const STUDENTS_JSON_URL = 'https://dedik-romahadi.github.io/Mechanical-Engineering-Courses/Engineering-Mathematics/Attributes/students.json';

// ══════════════════════════════════════════════════════════════
// GETARAN MEKANIK
// ══════════════════════════════════════════════════════════════
const MODULE_ID       = 'pertemuan-4';    // atau 'modul-4', 'pertemuan-N', dll
const DB_PATH         = `visitors/getaran_mekanik/${MODULE_ID}`;
const PERTEMUAN       = 'pertemuan-4';
const RELATED_MODULES = ['forum-4', 'tugas-4'];
const SCHEDULE_PATH   = `settings/getaran_mekanik/${PERTEMUAN}/schedule`;
const LOCAL_IDENTITY  = `getaran_mekanik_identity_${MODULE_ID}`;
const STUDENTS_JSON_URL = 'https://dedik-romahadi.github.io/Mechanical-Engineering-Courses/Getaran-Mekanik/Attributes/students.json';

// ══════════════════════════════════════════════════════════════
// OPTIMALISASI & OTOMASI
// ══════════════════════════════════════════════════════════════
const MODULE_ID       = 'modul-4';
const DB_PATH         = `visitors/optoauto/${MODULE_ID}`;
const PERTEMUAN       = 'pertemuan-4';
const RELATED_MODULES = ['forum-4', 'tugas-4'];
const SCHEDULE_PATH   = `settings/optoauto/${PERTEMUAN}/schedule`;
const LOCAL_IDENTITY  = `optoauto_identity_${MODULE_ID}`;
const STUDENTS_JSON_URL = 'https://dedik-romahadi.github.io/Mechanical-Engineering-Courses/Optimization-Automation/Attributes/students.json';
```

**Rumus umum:**
```javascript
const LOCAL_IDENTITY = `${COURSE_SLUG}_identity_${MODULE_ID}`;
// dengan COURSE_SLUG = slug yang sama persis dengan DB_PATH
```

### 3.3 Menambah Mata Kuliah Baru

1. Tentukan slug baru (misal `elemen_mesin`) — lowercase + underscore
2. Buat folder repo (misal `Element-Machine/Modul-N.html`)
3. Update `Attributes/students.json` dengan daftar mahasiswa MK tersebut
4. Edit Firebase Security Rules — tambahkan slug ke `.validate` di kedua tempat:
   - `rules.visitors.$course.".validate"`
   - `rules.settings.$course.".validate"`
5. Publish ulang rules
6. Set `LOCAL_IDENTITY = elemen_mesin_identity_${MODULE_ID}` — **jangan** pakai slug mata kuliah lain
7. Konsisten-kan semua konstanta: `DB_PATH`, `SCHEDULE_PATH`, `LOCAL_IDENTITY` prefix harus pakai slug yang sama

### 3.4 Reset & Migrasi Data

`RELATED_MODULES` harus mengikuti slug yang sama. Saat reset Modul-N di Matematika 4, juga membersihkan node `forum-N` dan `tugas-N` di path `visitors/math4/`.

```javascript
// ✅ BENAR — semua di bawah course yang sama
RELATED_MODULES.forEach(mid => {
  remove(ref(db, `visitors/math4/${mid}`));
  localStorage.removeItem(`math4_identity_${mid}`);
});
```

**Legacy cleanup saat migrasi prefix:** Jika men-transisikan course dari prefix `optoauto_identity_` (legacy) ke prefix course-scoped baru, lakukan dual-cleanup di tombol Reset selama 1–2 minggu transisi:

```javascript
RELATED_MODULES.forEach(mid => {
  localStorage.removeItem(`${COURSE_SLUG}_identity_${mid}`);  // prefix baru
  localStorage.removeItem(`optoauto_identity_${mid}`);         // legacy cleanup (one-time)
});
```

Setelah semua mahasiswa sudah login ulang (session baru tersimpan di prefix baru), baris legacy cleanup boleh dihapus.

---

## 4. Sistem Warna & Palet per Tab

### 4.1 CSS Variables Dasar (sama untuk semua tab)

```css
:root {
  --bg:      #080c18;    /* Fallback background */
  --surface: #162033;    /* Background kartu/panel */
  --border:  #1e293b;    /* Border default */
  --cyan:    #0ea5e9;
  --amber:   #f97316;
  --green:   #00e09e;
  --pink:    #ef4444;
  --violet:  #a855f7;
  --text:    #e4e8f1;
  --muted:   #64748b;
}
```

### 4.2 Palet per Tab (data-tab attribute)

Setiap `<div class="hero" data-tab="...">` mendapat tema gradient distinct:

| Tab | Palet | Background Gradient | Decoration Pattern |
|-----|-------|--------------------|--------------------|
| `modul` | **Violet + Cyan** | `#0a0418 → #08122a → #0e1b3a → #0a0f26` | Grid pattern (60×60 px) |
| `tugas` | **Amber + Pink** | `#1a0a08 → #2a1008 → #2e1a0e → #1a0a14` | Diagonal stripes (45°) |
| `forum` | **Green + Teal-Violet** | `#02100c → #061e1a → #0a2028 → #0a121e` | Diagonal stripes (-45°) |
| `hasil` | **Indigo + Pink-Gold** | `#0a0818 → #0f0e2a → #1a1236 → #1a0c1e` | Radial dots (3 corners) |

```css
/* Contoh — Modul */
.hero[data-tab="modul"] {
  background: linear-gradient(160deg, #0a0418 0%, #08122a 35%, #0e1b3a 70%, #0a0f26 100%);
}
.hero[data-tab="modul"]::before {
  background:
    repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(168,85,247,.04) 59px, rgba(168,85,247,.04) 60px),
    repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(168,85,247,.04) 59px, rgba(168,85,247,.04) 60px);
}
.hero[data-tab="modul"]::after {
  background:
    radial-gradient(ellipse 55% 55% at 50% 55%, rgba(168,85,247,.10), transparent 70%),
    radial-gradient(ellipse 45% 45% at 20% 75%, rgba(14,165,233,.08), transparent 65%);
}
```

### 4.3 Float Formulas — Warna per Tab

Hero menampilkan formula floating dengan warna sesuai tema tab:

| Tab | Warna formula |
|-----|---------------|
| Modul | `--cyan`, `--violet`, `--amber`, `--pink`, `--green` (mix) |
| Tugas | `--amber`, `#fb923c`, `--pink`, `#f43f5e` (warm only) |
| Forum | `--green`, `#2dd4bf`, `#34d399`, `--violet` (cool only) |
| Hasil | `#818cf8`, `#ec4899`, `#fbbf24`, `#f472b6`, `#a78bfa` (indigo+pink+gold) |

### 4.4 Pola Penggunaan Warna per Konteks (umum)

| Konteks | Warna Utama | Contoh |
|---------|-------------|--------|
| Benar / Poin | `--green` (#00e09e) | Feedback benar, status hadir |
| Salah / Error | `--pink` (#ef4444) | Feedback salah |
| Terlambat | `#fb7185` | Status badge terlambat |
| Bolos | `#ef4444` | Status badge bolos, baris merah |
| Belum / Inactive | `#94a3b8` | Status badge belum, teks redup |

---

## 5. Tipografi

### 5.1 Font Stack

| Font | Digunakan Untuk |
|------|----------------|
| `'Source Sans 3'` | Body text, paragraf, label |
| `'Playfair Display'` | Heading besar (hero title, modal title) |
| `'JetBrains Mono'` | Kode, formula, badge monospace, label uppercase, countdown |

### 5.2 Skala Ukuran

| Elemen | Class/Style | Ukuran |
|--------|-------------|--------|
| Hero title | `.hero-title` | `clamp(42px, 7vw, 82px)` |
| Section title | `.section-title` | `clamp(28px, 4vw, 42px)` |
| Section label | `.section-label` | `11px`, uppercase, letter-spacing 4px |
| Body text | `body` | `16px`, line-height 1.7 |
| Card heading | `h3` | `18–20px` |
| Monospace label | JetBrains Mono | `10–12px` |
| Countdown number | `.cd-num` | `32px`, JetBrains Mono, weight 900, gradient-text light→saturated (v13) |
| Formula inline | KaTeX / pre | `13–14px` |

---

## 6. Struktur Navbar

Navbar terdiri dari **dua bar fixed** terpisah:

```
┌─────────────────────────────────────────────────────┐ ← top: 0; height: 60px
│  ● MATEMATIKA4 // M4   [Modul] [Tugas] [Forum] [Hasil]   👨‍🏫 DEDIK ROMAHADI  │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐ ← top: 60px; height: 40px
│  Linier Faktor Bernoulli Reduksi Analogi Animasi Aplikasi Python Pustaka  │
└─────────────────────────────────────────────────────┘ ← hanya muncul saat tab Modul aktif
```

### 6.1 HTML Navbar

```html
<nav id="navTop">
  <span class="nav-brand">
    <span class="pulse"></span>
    <span>MATEMATIKA4 // M4</span>   <!-- Sesuaikan: GETARANMESIN, OPTOAUTO, dst -->
  </span>
  <div class="nav-tabs">
    <button class="nav-tab active" id="tab-modul"  onclick="switchTab('modul')">📖 Modul</button>
    <button class="nav-tab"        id="tab-tugas"  onclick="switchTab('tugas')">📝 Tugas</button>
    <button class="nav-tab"        id="tab-forum"  onclick="switchTab('forum')">💬 Forum</button>
    <button class="nav-tab"        id="tab-hasil"  onclick="switchTab('hasil')">📊 Hasil</button>
  </div>
  <span class="nav-badge">👨‍🏫 DEDIK ROMAHADI</span>
</nav>

<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-section1">Bagian 1</a>
  <!-- ... -->
  <a href="#m-pustaka">Pustaka</a>
</div>
```

### 6.2 Brand Naming Convention

| Mata Kuliah | Brand Format |
|-------------|--------------|
| Matematika 4 | `MATEMATIKA4 // M{N}` |
| Getaran Mekanik | `GETARANMESIN // P{N}` |
| Optimalisasi & Otomasi | `OPTOAUTO // P{N}` |

---

## 7. Sistem Login & Visitor

### 7.1 Dua Alur Login Berbeda

Ada **dua peran** pengguna dengan alur login berbeda:

| Peran | Cara Login | Kredensial Tambahan |
|-------|------------|---------------------|
| **Mahasiswa** | Nama + NIM + **PIN 6-digit** | PIN personal yang disimpan hashed di Firebase (lihat §8) |
| **Dosen** | Nama "Dedik Romahadi" + **Password Admin** | Password admin ter-hash SHA-256 (lihat §19) |

Kedua alur menggunakan overlay login yang sama di awal, lalu bercabang berdasarkan nama yang dimasukkan.

### 7.2 Validasi Identitas Mahasiswa

Saat mahasiswa klik "Masuk", validasi berlapis:

1. **Format nama** — setiap kata diawali huruf kapital (`/^([A-Z][a-z']+ ?)+$/`)
2. **Format NIM** — angka tanpa spasi (`/^[0-9]{1,20}$/`)
3. **Master list** — cocokkan dengan `students.json` mata kuliah tersebut
   - NIM exists tapi nama tidak cocok → `⚠ Nama tidak sesuai dengan NIM yang terdaftar di SIA.`
   - NIM tidak exists → `⚠ NIM tidak terdaftar. Hanya mahasiswa yang terdaftar yang dapat mengakses halaman ini.`
4. **Jadwal aktif** — kalau jadwal belum diset → `⚠ Jadwal belum diatur. Silakan hubungi dosen.`
5. **Sebelum start** — kalau akses sebelum jadwal mulai → tampilkan jadwal mulai
6. **Setelah end** — login tetap berhasil tapi data tidak disimpan ke Firebase (lihat §9)
7. **Cek PIN di Firebase** — bercabang ke modal PIN (lihat §8)

### 7.3 Alur Login Dosen

Ketika nama yang dimasukkan = `"Dedik Romahadi"` (case-insensitive):

1. Validasi format nama saja (NIM bisa kosong)
2. Overlay login utama **disembunyikan sementara**
3. Muncul **Dosen Login Modal** (👨‍🏫) — custom modal dengan `<input type="password">`
4. Password tampil sebagai `••••••` saat diketik (bukan plaintext)
5. Password dihash SHA-256 → bandingkan dengan `ADMIN_PW_HASH`
6. Jika match → identitas dosen disimpan di `localStorage`, FAB muncul
7. Jika salah → modal tertutup, overlay login kembali muncul dengan pesan error
8. Enter submit, Escape cancel

**Kenapa tidak pakai `prompt()` native?** Browser `window.prompt()` tidak mendukung masking — password selalu tampil plaintext. Ini limitasi Web API yang tidak bisa di-workaround. Solusinya: custom modal dengan `<input type="password">`.

```javascript
// Promise-based helper agar bisa di-await seperti prompt() sync
let _dosenLoginResolver = null;

function askAdminPassword() {
  return new Promise((resolve) => {
    _dosenLoginResolver = resolve;
    document.getElementById('dosenLoginPw').value = '';
    document.getElementById('dosenLoginOverlay').classList.remove('hidden');
    setTimeout(() => document.getElementById('dosenLoginPw').focus(), 100);
  });
}

function submitDosenLogin() {
  const pw = document.getElementById('dosenLoginPw').value;
  document.getElementById('dosenLoginOverlay').classList.add('hidden');
  if (_dosenLoginResolver) { _dosenLoginResolver(pw); _dosenLoginResolver = null; }
}

function cancelDosenLogin() {
  document.getElementById('dosenLoginOverlay').classList.add('hidden');
  if (_dosenLoginResolver) { _dosenLoginResolver(null); _dosenLoginResolver = null; }
}

// Di submitVisitor:
if (isDosen) {
  document.getElementById('visitorOverlay').classList.add('hidden');   // fokus ke modal
  const pwInput = await askAdminPassword();
  if (pwInput === null) {
    document.getElementById('visitorOverlay').classList.remove('hidden');
    err.textContent = '⚠ Login dibatalkan.'; return;
  }
  const ok = await _verifyAdminPw(pwInput);
  if (!ok) {
    document.getElementById('visitorOverlay').classList.remove('hidden');
    err.textContent = '⚠ Password admin salah.'; return;
  }
  saveIdentity({ nama, nim: 'DOSEN', role: 'dosen', timestamp: new Date().toISOString() });
  document.getElementById('visitorFab').style.display = 'flex';
  return;
}
```

**HTML modal (di atas PIN Input modal):**
```html
<div class="visitor-overlay hidden" id="dosenLoginOverlay" style="z-index:100001;">
  <div class="visitor-modal" style="max-width:420px;">
    <div style="font-size:2.4rem;margin-bottom:12px;">👨‍🏫</div>
    <h2>Login sebagai Dosen</h2>
    <p class="sub">Masukkan password admin untuk melanjutkan sebagai dosen.</p>
    <p class="v-error" id="dosenLoginError"></p>
    <input type="password" class="v-input" id="dosenLoginPw"
           placeholder="Password admin" autocomplete="off">
    <button class="v-btn-primary" onclick="submitDosenLogin()">Masuk sebagai Dosen</button>
    <button class="v-btn-cancel" onclick="cancelDosenLogin()">Batal</button>
  </div>
</div>
```

**Keyboard bindings:**
```javascript
document.getElementById('dosenLoginPw').addEventListener('keydown', function(e){
  if (e.key === 'Enter')  submitDosenLogin();
  if (e.key === 'Escape') cancelDosenLogin();
});
```

**Catatan:** Dosen TIDAK perlu setup PIN. Password admin digunakan langsung sebagai kredensial dosen (sudah cukup kuat untuk konteks kelas).

### 7.4 Identitas Lokal (localStorage)

Saat login berhasil, identitas disimpan di `localStorage` dengan key `LOCAL_IDENTITY`.

**Format key:**
```javascript
const LOCAL_IDENTITY = `${COURSE_SLUG}_identity_${MODULE_ID}`;
// Contoh:
//   math4_identity_modul-4
//   getaran_mekanik_identity_pertemuan-4
//   optoauto_identity_modul-4
```

**Aturan kritis:**
- Prefix `COURSE_SLUG` **harus sama persis** dengan slug yang digunakan di `DB_PATH` dan Firebase Rules
- **JANGAN** mewarisi prefix dari mata kuliah lain (misal, `optoauto_identity_` untuk course Getaran) — ini legacy bug yang menyebabkan bentrok session kalau dua course pakai MODULE_ID yang sama
- Lihat §3.1 untuk tabel lengkap prefix per course

**Mahasiswa:**
```javascript
{
  nama: "Dedik Romahadi",
  nim: "41522010001",
  role: "student",
  timestamp: "2026-04-18T10:00:00.000Z",
  visitCount: 1,
  lastVisit: "2026-04-18T10:00:00.000Z",
  pinHash: "a3f5...",           // SHA-256 hash PIN
  pinSetAt: "2026-04-18T..."    // kapan PIN diset pertama kali
}
```

**Dosen:**
```javascript
{
  nama: "Dedik Romahadi",
  nim: "DOSEN",
  role: "dosen",
  timestamp: "2026-04-18T10:00:00.000Z"
}
```

Identitas ini digunakan untuk auto-login pada kunjungan berikutnya **di device yang sama**. Mahasiswa yang ganti device/browser akan menjalani PIN flow lagi.

**3 tempat yang harus konsisten menggunakan prefix yang benar:**

1. Deklarasi konstanta utama:
   ```javascript
   const LOCAL_IDENTITY = `getaran_mekanik_identity_${MODULE_ID}`;
   ```
2. Fungsi helper standalone (sering hardcoded di luar scope module):
   ```javascript
   function getIdentityLocal() {
     try { return JSON.parse(localStorage.getItem('getaran_mekanik_identity_pertemuan-4')); }
     catch(e) { return null; }
   }
   ```
3. Reset cleanup `RELATED_MODULES`:
   ```javascript
   RELATED_MODULES.forEach(mid => {
     localStorage.removeItem(`getaran_mekanik_identity_${mid}`);
   });
   ```

**Checklist migrasi** kalau ada course lama yang masih pakai `optoauto_identity_` legacy: lihat §3.4 untuk dual-cleanup pattern.

### 7.5 Role: Dosen — Hak Akses Khusus

- NIM otomatis = `'DOSEN'`
- Tidak dihitung di leaderboard / stats / visitor table
- Bisa lakukan **reset** (hapus semua data) dengan password admin
- Bisa **set jadwal** dengan password admin
- Tidak perlu PIN
- Badge `👨‍🏫 DEDIK ROMAHADI` muncul di navbar

### 7.6 Role-Based UI Visibility

Tombol **"🗑 Reset"** (di tab Hasil) **hanya tampil untuk dosen**. Mahasiswa tidak melihat tombol Reset sama sekali.

Tombol **"🕐 Atur Jadwal 🔒"** (di login overlay) **selalu terlihat untuk siapa pun** — namun dilindungi password admin saat di-klik.

**Rationale — Kenapa beda perlakuan?**

| Tombol | Perlakuan | Alasan |
|--------|-----------|--------|
| **Reset** | Hidden untuk non-dosen | Destructive action yang tidak relevan untuk mahasiswa. UX lebih clean, mengurangi risiko social engineering |
| **Atur Jadwal** | Selalu visible | **Bootstrap action**: setelah reset total, `localStorage` di-clear → identitas dosen hilang → jika tombol disembunyikan, dosen tidak bisa set jadwal baru tanpa edit CSS via DevTools. Circular dependency! |

**Circular dependency yang terjadi jika Atur Jadwal disembunyikan:**
```
Untuk tampilkan tombol Atur Jadwal → perlu login sebagai dosen
Untuk login → perlu jadwal aktif ("⚠ Jadwal belum diatur")
Untuk set jadwal → perlu klik tombol Atur Jadwal
        ↑                                       │
        └───────── STUCK ←──────────────────────┘
```

Jadi: **tombol Atur Jadwal adalah entry point** ke sistem, sama seperti tombol "Login" yang harus selalu visible di aplikasi web biasa. Proteksinya ada di layer password, bukan visibility.

**Implementasi:**

```html
<!-- Login overlay — selalu visible -->
<button class="v-btn-cancel" id="scheduleBtnLogin"
        onclick="showScheduleModal()"
        style="margin-top:8px;...">🕐 Atur Jadwal 🔒</button>
<!-- ✅ TIDAK pakai display:none -->

<!-- Tab Hasil — default hidden -->
<button id="resetBtnHasil" onclick="showResetModal()"
        style="display:none;...align-items:center;gap:6px;">🗑 Reset</button>
```

Helper function yang evaluate identity dan toggle visibility **hanya tombol Reset**:
```javascript
function _applyRoleVisibility() {
  const me = (function(){
    try { return JSON.parse(localStorage.getItem(LOCAL_IDENTITY) || 'null'); }
    catch(e){ return null; }
  })();
  const isDosen = !!(me && me.role === 'dosen' && me.nama &&
                     me.nama.toLowerCase() === 'dedik romahadi');

  // Hanya Reset button yang di-toggle
  const resetBtn = document.getElementById('resetBtnHasil');
  if (resetBtn) resetBtn.style.display = isDosen ? 'flex' : 'none';
}
window._applyRoleVisibility = _applyRoleVisibility;
```

**Titik panggilan** — `_applyRoleVisibility()` harus dipanggil di setiap perubahan state login:

| Kondisi | Alasan |
|---------|--------|
| `initVisitor()` saat load halaman | Auto-login returning user — check role dari localStorage |
| Sukses login dosen (setelah verifikasi password) | Baru jadi dosen → tampilkan Reset |
| Sukses `submitPinSetup()` (mahasiswa baru) | Baru jadi mahasiswa → pastikan Reset hidden |
| Sukses `submitPinVerify()` (mahasiswa returning) | Idem |
| Setelah `confirmReset()` | `localStorage` dihapus → sembunyikan Reset lagi |

Total **5 titik panggilan** di kode Modul-4.

**Proteksi berlapis:**
1. **Layer UI** (visibility): tombol Reset disembunyikan untuk non-dosen → clean UX untuk mahasiswa
2. **Layer Logic** (password gate): Atur Jadwal & Reset keduanya minta password admin SHA-256 saat di-klik
3. **Layer Firebase Rules**: bahkan jika password bocor, rules membatasi operasi di server

Tiga layer ini adalah **defense in depth** — kegagalan satu layer tidak membuat sistem collapse. Tombol Atur Jadwal yang visible ke mahasiswa **tidak menurunkan keamanan** karena layer 2 & 3 tetap bekerja.

---

## 8. Sistem PIN Keamanan Mahasiswa (Global — Lintas-Course)

### 8.1 Tujuan & Arsitektur

Mencegah mahasiswa B login dengan identitas mahasiswa A (yang namanya/NIM-nya diketahui publik). PIN 6-digit adalah kredensial personal yang hanya diketahui mahasiswa sendiri.

**Sejak April 2026, PIN bersifat GLOBAL lintas-course dan lintas-module** — satu mahasiswa punya **satu PIN** yang berlaku di SEMUA mata kuliah (Matematika 4, Getaran Mekanik, Optoauto, dll) dan SEMUA pertemuan/modul. Sebelumnya PIN per-modul (ada satu `pinHash` terpisah di tiap node visitor), yang menyebabkan mahasiswa harus setup PIN berkali-kali (sekali per modul pertama kali akses) — desain baru menghilangkan friction itu.

**Firebase structure:**
```
pins/                              ← NODE GLOBAL (baru)
  mhs_<NIM>/
    pinHash:  string (64 char hex, SHA-256) — IMMUTABLE setelah create
    pinSetAt: string (ISO timestamp)        — IMMUTABLE setelah create
    nama:     string                        — untuk audit, optional update

visitors/<course>/<module>/        ← Per-modul, TANPA pinHash lagi
  mhs_<NIM>/
    nama, nim, role, timestamp, lastVisit, visitCount,
    points, pointTimestamp, scoredQuestions, consolationAwarded
    (TIDAK ADA pinHash/pinSetAt di sini — sekarang di pins/ global)
```

**Konsekuensi desain:**

| Skenario | Sebelum (per-modul) | Sekarang (global) |
|----------|---------------------|-------------------|
| Mahasiswa buka modul pertama di course apapun | Setup PIN baru | Setup PIN baru (sekali seumur hidup) |
| Buka modul baru (course sama/beda) | Setup PIN baru LAGI | Input PIN yang sama |
| Dosen reset modul tertentu | PIN modul itu hilang, mahasiswa setup lagi di modul itu | **PIN tetap aman** (di `pins/` terpisah) |
| Dosen reset PIN individual via Console | Hapus field `pinHash` di satu visitor record | Hapus `pins/mhs_<NIM>` — reset global |
| PIN bocor | Terpengaruh hanya satu modul | **Terpengaruh semua modul** — perlu reset global segera |

### 8.2 Alur First-Time Setup (Global)

```
Mahasiswa baru pertama kali login (di course/modul apapun)
         │
         ▼
  Validasi Nama + NIM (cocok students.json course tersebut)
         │
         ▼
  Cek pins/mhs_<NIM> di Firebase — TIDAK ADA
         │
         ▼
  Fallback migrasi legacy (lihat §8.9): cek visitor records lama
  punya pinHash? — TIDAK ADA → lanjut setup baru
         │
         ▼
  Muncul Modal Setup PIN 🔐
         │
         ▼
  Mahasiswa input PIN 6 digit + konfirmasi
         │
         ▼
  Validasi PIN tidak lemah + konfirmasi cocok
         │
         ▼
  SHA-256 hash input → simpan ke DUA tempat:
    1. pins/mhs_<NIM>/ { pinHash, pinSetAt, nama }         ← GLOBAL
    2. visitors/<course>/<module>/mhs_<NIM>/ {             ← PER-MODUL
         nama, nim, role, timestamp, visitCount: 1, lastVisit
       }    (tanpa pinHash — sekarang di pins/ global)
         │
         ▼
  Auto-login — overlay tertutup, FAB muncul
```

### 8.3 Alur Returning Login (Global)

```
Mahasiswa yang sudah punya PIN global login (course/modul apapun)
         │
         ▼
  Validasi Nama + NIM (cocok students.json course tersebut)
         │
         ▼
  Cek pins/mhs_<NIM> — ADA (atau auto-migrated dari legacy)
         │
         ▼
  Muncul Modal Input PIN 🔑
         │
         ▼
  Mahasiswa input PIN 6 digit
         │
         ▼
  Hash input → bandingkan dengan pins/mhs_<NIM>/pinHash
         │
   ┌─────┴─────┐
   │ MATCH     │ MISMATCH
   ▼           ▼
 Auto-login  Error: "⚠ PIN salah..."
 (create or  (boleh coba lagi, tidak ada counter)
  update
  visitor
  record di
  course/
  module
  current)
```

### 8.4 Implementasi Kode — Key Functions

```javascript
// SHA-256 hash (reuse dari admin password system)
async function _sha256Hex(s) {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

// State untuk flow PIN (dipegang selama user navigasi antar modal)
let _pinFlow = {
  nama: null, nim: null, nowISO: null,
  existingPin: null,        // data dari pins/mhs_<NIM> (atau null)
  existingVisitor: null,    // data dari visitors/<course>/<module>/mhs_<NIM> (atau null)
  schedOpen: false
};

// Cek PIN lemah (sama seperti sebelumnya)
const WEAK_PINS = new Set([
  '123456', '654321',
  '000000', '111111', /* ... */, '999999',
  '012345', '098765',
  '123123', '456456', '789789',
  '121212', '212121', '131313',
  '112233', '332211',
  '102030', '010203'
]);

function _isWeakPin(pin) {
  if (!/^[0-9]{6}$/.test(pin)) return true;
  return WEAK_PINS.has(pin);
}

// Setelah validasi identitas di submitVisitor(), cek PIN global
async function _routeAfterIdentityCheck(nama, nim, nowISO, schedOpen) {
  const key = sanitizeKey('mhs_' + nim);

  // 1. Cek pins/ node GLOBAL
  const pinSnap = await get(ref(db, 'pins/' + key));
  let existingPin = pinSnap.exists() ? pinSnap.val() : null;

  // 2. Jika tidak ada di pins/, cek legacy visitor records (auto-migrate)
  if (!existingPin || !existingPin.pinHash) {
    existingPin = await _tryMigrateLegacyPin(nim, nama);
  }

  // 3. Cek visitor record di course/module CURRENT (untuk points/visitCount)
  const visSnap = await get(ref(db, DB_PATH + '/' + key));
  const existingVisitor = visSnap.exists() ? visSnap.val() : null;

  _pinFlow = { nama, nim, nowISO, existingPin, existingVisitor, schedOpen };

  document.getElementById('visitorOverlay').classList.add('hidden');
  if (existingPin && existingPin.pinHash) {
    _showPinInput(nama);   // sudah punya PIN global → verifikasi
  } else {
    _showPinSetup(nama);    // belum punya PIN → setup pertama kali
  }
}

// Setup PIN baru (first-time global)
async function submitPinSetup() {
  // ... validasi 6 digit, konfirmasi cocok, tidak lemah ...
  const { nama, nim, nowISO } = _pinFlow;
  const key = sanitizeKey('mhs_' + nim);
  const pinHash = await _sha256Hex(p1);

  // 1. Simpan PIN ke node GLOBAL
  await set(ref(db, 'pins/' + key), {
    pinHash, pinSetAt: nowISO, nama
  });

  // 2. Simpan visitor record di course/module CURRENT (tanpa pinHash)
  //    PENTING: points dan scoredQuestions HARUS di-init dari awal (lihat §13.4.1)
  await set(ref(db, DB_PATH + '/' + key), {
    nama, nim, role: 'student',
    timestamp: nowISO,
    lastVisit: nowISO,
    visitCount: 1,
    points: 0,
    scoredQuestions: ''
  });

  saveIdentity({ nama, nim, role: 'student', timestamp: nowISO });
  // ... tutup modal, tampilkan FAB, etc.
}

// Verifikasi PIN (returning login, atau first login di course/module baru)
async function submitPinVerify() {
  const { nama, nim, nowISO, existingPin, existingVisitor } = _pinFlow;
  const pin = document.getElementById('pinInputField').value.trim();

  const inputHash = await _sha256Hex(pin);
  if (inputHash !== existingPin.pinHash) {
    // PIN salah — tampilkan error, user bisa coba lagi
    document.getElementById('pinInputError').textContent = '\u26a0 PIN salah. Coba lagi.';
    return;
  }

  // PIN match → create/update visitor record di course/module CURRENT
  const key = sanitizeKey('mhs_' + nim);
  if (existingVisitor) {
    // Update: bump visitCount jika sudah > cooldown
    const lastV = new Date(existingVisitor.lastVisit || existingVisitor.timestamp).getTime();
    const shouldBump = Date.now() - lastV >= VISIT_COOLDOWN && _isScheduleOpen();
    await set(ref(db, DB_PATH + '/' + key), {
      ...existingVisitor,
      lastVisit: nowISO,
      visitCount: shouldBump ? (existingVisitor.visitCount || 1) + 1 : (existingVisitor.visitCount || 1)
    });
  } else {
    // First visit di course/module ini (tapi sudah punya PIN global)
    // PENTING: points dan scoredQuestions HARUS di-init (lihat §13.4.1)
    await set(ref(db, DB_PATH + '/' + key), {
      nama, nim, role: 'student',
      timestamp: nowISO,
      lastVisit: nowISO,
      visitCount: 1,
      points: 0,
      scoredQuestions: ''
    });
  }

  saveIdentity({ nama, nim, role: 'student', timestamp: nowISO });
  // ... tutup modal, tampilkan FAB, etc.
}
```

### 8.5 Daftar PIN Lemah yang Ditolak

Total **25 kombinasi** ditolak saat setup:

| Kategori | PIN |
|----------|-----|
| Berurutan 6 digit | `123456`, `654321`, `012345`, `098765` |
| Repetitif 6 digit | `000000`, `111111`, `222222`, `333333`, `444444`, `555555`, `666666`, `777777`, `888888`, `999999` |
| Pola ulang 3-3 | `123123`, `456456`, `789789` |
| Pola ulang 2-2 | `121212`, `131313`, `212121` |
| Pola pasangan | `112233`, `332211` |
| Pola jarak tetap | `102030`, `010203` |

Jika input termasuk kategori ini, muncul pesan: `⚠ PIN terlalu mudah ditebak (misalnya 123456, angka berulang, atau pola sederhana). Gunakan kombinasi yang lebih unik.`

### 8.6 Proteksi Multi-Layer

| Layer | Perlindungan |
|-------|-------------|
| **Client HTML** | Filter input non-angka, cap 6 digit, cek `_isWeakPin()` |
| **Firebase Security Rules** | `pins/mhs_<NIM>/pinHash` validate format SHA-256 (64 char hex), `pinHash` dan `pinSetAt` IMMUTABLE setelah ditetapkan (write rule: `!data.exists() OR newData.pinHash == data.pinHash AND newData.pinSetAt == data.pinSetAt`) |
| **SHA-256 hash** | PIN tersimpan sebagai hash, bukan plaintext |
| **Global immutability** | Sekali PIN diset di `pins/`, tidak bisa diubah via aplikasi — hanya dosen yang bisa reset via Firebase Console (delete node) |
| **Isolasi dari visitor record** | Reset module tidak menghapus PIN (karena `pins/` terpisah dari `visitors/<course>/<module>/`) |

### 8.7 Firebase Security Rules — Node `pins/`

```json
{
  "rules": {
    "pins": {
      ".read": true,
      "$visitorKey": {
        ".validate": "$visitorKey.matches(/^mhs_[0-9A-Z]{1,20}$/)",
        ".read": true,
        ".write": "!data.exists() || (newData.exists() && newData.child('pinHash').val() === data.child('pinHash').val() && newData.child('pinSetAt').val() === data.child('pinSetAt').val())",
        "pinHash": {
          ".validate": "newData.isString() && newData.val().length === 64 && newData.val().matches(/^[0-9a-f]+$/)"
        },
        "pinSetAt": {
          ".validate": "newData.isString() && newData.val().length >= 10 && newData.val().length <= 40"
        },
        "nama": {
          ".validate": "newData.isString() && newData.val().length >= 2 && newData.val().length <= 80"
        },
        "$other": { ".validate": false }
      }
    }
    // ... visitors/, settings/ (lihat §13)
  }
}
```

Penjelasan rule `.write` di `$visitorKey`:
- `!data.exists()` — create baru selalu diizinkan
- `|| (newData.exists() && pinHash === data.pinHash && pinSetAt === data.pinSetAt)` — update diizinkan HANYA jika `pinHash` dan `pinSetAt` sama persis dengan existing (praktis: hanya field `nama` yang bisa update, PIN terkunci)
- Untuk benar-benar reset PIN, dosen harus **delete node** via Firebase Console (`newData.exists()` = false + `data.exists()` = true → ditolak oleh rule ini, jadi delete harus via parent path `pins/` dengan rule di level atas)

> **Catatan:** Rule di level `pins/` tidak memuat `.write` top-level, sehingga delete via aplikasi dilarang. Hanya admin yang bisa delete via Firebase Console (yang bypasses rules).

### 8.8 HTML Modal — Setup PIN (Global)

Tidak berubah dari versi sebelumnya, kecuali teks subtitle:

```html
<div class="visitor-overlay hidden" id="pinSetupOverlay" style="z-index:100001;">
  <div class="visitor-modal" style="max-width:420px;">
    <div style="font-size:2.4rem;margin-bottom:12px;">🔐</div>
    <h2>Buat PIN Keamanan</h2>
    <p class="sub">Hai <strong id="pinSetupName"></strong>! Buat PIN 6 digit sebagai kredensial login Anda. <strong>PIN ini berlaku untuk semua mata kuliah dan modul</strong> — cukup setup sekali.</p>
    <p class="v-error" id="pinSetupError"></p>
    <input type="password" class="v-input" id="pinSetupInput1" placeholder="PIN (6 digit)" inputmode="numeric" maxlength="6" style="letter-spacing:8px;text-align:center;">
    <input type="password" class="v-input" id="pinSetupInput2" placeholder="Konfirmasi PIN" inputmode="numeric" maxlength="6" style="letter-spacing:8px;text-align:center;">
    <div style="background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.2);border-radius:8px;padding:10px 14px;margin:10px 0;font-size:.78rem;color:#fcd34d;">
      💡 <strong>Penting:</strong> Ingat PIN Anda! PIN ini akan Anda gunakan di semua mata kuliah. Jika lupa, hubungi dosen untuk reset global.
    </div>
    <button class="v-btn-primary" id="pinSetupBtn" onclick="submitPinSetup()">Simpan PIN &amp; Masuk</button>
    <button class="v-btn-cancel" onclick="cancelPinFlow()">Batal</button>
  </div>
</div>
```

### 8.9 Migrasi dari Skema Lama (Per-Modul → Global)

Sistem lama menyimpan `pinHash` di `visitors/<course>/<module>/mhs_<NIM>/pinHash`. Saat rollout sistem global, implementasikan **auto-migration on first login**:

```javascript
async function _tryMigrateLegacyPin(nim, nama) {
  const key = sanitizeKey('mhs_' + nim);

  // Cari pinHash di SEMUA course/module lama
  const courses = ['math4', 'getaran_mekanik', 'optoauto'];
  const modulePatterns = ['modul-', 'pertemuan-', 'forum-', 'tugas-'];

  // Strategi: cari record pertama yang punya pinHash (karena mahasiswa mungkin
  // pakai PIN berbeda di modul-modul lama — ambil yang PALING LAMA/pertama untuk
  // menjadi PIN global)
  let oldestPin = null;
  let oldestSetAt = null;

  for (const course of courses) {
    const snap = await get(ref(db, 'visitors/' + course));
    if (!snap.exists()) continue;
    const modules = snap.val();
    for (const moduleId in modules) {
      const visitor = modules[moduleId][key];
      if (visitor && visitor.pinHash && visitor.pinSetAt) {
        if (!oldestSetAt || visitor.pinSetAt < oldestSetAt) {
          oldestPin = visitor.pinHash;
          oldestSetAt = visitor.pinSetAt;
        }
      }
    }
  }

  if (!oldestPin) return null;  // tidak ada legacy PIN → setup baru

  // Migrate: tulis ke pins/ global
  await set(ref(db, 'pins/' + key), {
    pinHash: oldestPin,
    pinSetAt: oldestSetAt,
    nama
  });

  console.log('[PIN] Auto-migrated legacy PIN to global for', nim);
  return { pinHash: oldestPin, pinSetAt: oldestSetAt, nama };
}
```

**Alternative: Dosen run manual migration script** di Firebase Cloud Functions jika prefer one-shot batch migration daripada gradual on-login.

> **Pembersihan field `pinHash` lama di visitor records**: Tidak wajib dihapus — Security Rules di `visitors/<course>/<module>/<visitorKey>/$other` menolak penulisan field baru, namun field existing tetap bisa ada. Biarkan saja; tidak berdampak fungsi karena login flow sekarang hanya baca dari `pins/`. Jika ingin dibersihkan, dosen bisa delete field via Firebase Console atau tulis ulang visitor record tanpa field tersebut.

### 8.10 Skenario Reset PIN

| Skenario | Cara | Efek |
|----------|------|------|
| Mahasiswa lupa PIN global | Dosen delete `pins/mhs_<NIM>` via Firebase Console | Mahasiswa setup PIN baru pada login berikutnya (di modul apapun). Poin/visit di semua modul tetap aman. |
| Mahasiswa ganti PIN (privacy/suspected leak) | Sama — delete `pins/mhs_<NIM>` | Idem; mahasiswa setup PIN baru yang berbeda. |
| Reset modul (bukan PIN) — awal pertemuan baru | Tombol Reset di modul → password admin | Hanya hapus `visitors/<course>/<module>/` — **PIN global tetap aman**, mahasiswa langsung masuk dengan PIN lama pada login berikutnya. |
| Nuclear: reset semua PIN seluruh MK | Delete node `pins/` via Firebase Console | Semua mahasiswa setup ulang PIN pada login berikutnya. (Jarang dipakai — hanya kalau ada breach massal.) |

### 8.11 HTML Modal — Input PIN (Returning Login, Global)

Modal ini muncul untuk mahasiswa yang sudah punya PIN global (termasuk pertama kali akses course/module baru jika sudah pernah setup PIN di course/module lain).

```html
<div class="visitor-overlay hidden" id="pinInputOverlay" style="z-index:100001;">
  <div class="visitor-modal" style="max-width:420px;">
    <div style="font-size:2.4rem;margin-bottom:12px;">🔑</div>
    <h2>Masukkan PIN</h2>
    <p class="sub">Halo <strong id="pinInputName"></strong>, masukkan PIN 6 digit Anda.</p>
    <p class="v-error" id="pinInputError"></p>
    <input type="password" class="v-input" id="pinInputField" placeholder="PIN (6 digit)" inputmode="numeric" maxlength="6" style="letter-spacing:8px;text-align:center;">
    <button class="v-btn-primary" id="pinInputBtn" onclick="submitPinVerify()">Verifikasi &amp; Masuk</button>
    <button class="v-btn-cancel" onclick="cancelPinFlow()">Batal</button>
    <p style="font-size:.72rem;color:#64748b;text-align:center;">Lupa PIN? Hubungi dosen untuk reset global.</p>
  </div>
</div>
```

---

## 9. Sistem Jadwal & Zona Waktu

### 9.1 Tiga Zona Waktu

Berdasarkan `currentSchedule.start` dan `currentSchedule.end`, ada **3 zona** dengan perilaku berbeda:

| Zona | Waktu | Gating Write Firebase |
|------|-------|----------------------|
| **Tepat Waktu** | `[start, end − 24jam)` | ✅ Disimpan normal |
| **Terlambat** | `[end − 24jam, end]` | ✅ Disimpan normal (perlakuan sama dengan Tepat Waktu) |
| **Di Luar Jadwal** | `< start` atau `> end` | ❌ TIDAK disimpan (diblokir `_isScheduleOpen()`) |

> **Catatan penting — zona ≠ status label.** Zona di atas hanya menentukan APAKAH poin tersimpan ke Firebase, bukan label status yang ditampilkan di tab Hasil. Label status final juga bergantung pada apakah mahasiswa memperoleh `points > 0`. Lihat §17.3 untuk aturan label lengkap.
>
> Ringkasan singkat:
> - **⏰ Terlambat** diberikan hanya jika mahasiswa akses di zona `[end−24jam, end]` **DAN** punya poin.
> - **❌ Bolos** diberikan jika mahasiswa tidak punya poin **DAN** jadwal sudah berakhir (mencakup: tidak akses sama sekali, atau akses tapi 0 poin).
> - **⏳ Belum** diberikan jika mahasiswa belum punya poin **DAN** jadwal masih aktif.
> - **✅ Tepat Waktu** diberikan jika mahasiswa akses di zona `[start, end−24jam)` **DAN** punya poin.

### 9.2 Helper Function

```javascript
function _isScheduleOpen() {
  if (!currentSchedule || !currentSchedule.start || !currentSchedule.end) return false;
  const now = Date.now();
  const s = new Date(currentSchedule.start).getTime();
  const e = new Date(currentSchedule.end).getTime();
  return now >= s && now <= e;
}

function isLate(timestamp) {
  if (!currentSchedule || !currentSchedule.start || !currentSchedule.end) return false;
  const t = new Date(timestamp).getTime();
  const e = new Date(currentSchedule.end).getTime();
  return t >= (e - 24*60*60*1000);   // 24 jam terakhir = zona Terlambat
}
```

### 9.3 Gating Penyimpanan

**Semua fungsi Firebase write** harus cek `_isScheduleOpen()` di awal:

```javascript
window._awardPoint = function(qId) {
  if (!_isScheduleOpen()) return;   // ← guard
  // ... lanjut update points
};

window._awardCompPoint = function(qId) {
  if (!_isScheduleOpen()) return;   // ← guard
  // ...
};

window._recordMcAttempt = function(qId) {
  if (!_isScheduleOpen()) return;   // ← guard
  // ...
};

window._recordCompAttempt = function(qId) {
  if (!_isScheduleOpen()) return;   // ← guard
  // ...
};
```

`submitVisitor()` dan visit-bump di `initVisitor()` juga gated dengan cara yang sama.

### 9.4 Banner Akses Terlambat

Tab Tugas menampilkan banner merah otomatis saat akses di luar jadwal:

```html
<div id="lateAccessBanner" style="display:none;...">
  <span>⏰</span>
  <div>
    <div>Akses di Luar Jadwal Perkuliahan</div>
    <p>Anda dapat tetap membuka dan melihat materi, namun
       <strong>poin dan kehadiran tidak akan dicatat</strong>.
       Pengerjaan soal di halaman ini tidak akan disimpan.
       Silakan hubungi dosen jika ada kebutuhan khusus.</p>
  </div>
</div>
```

Diaktifkan oleh `_updateLateBanner()` yang dipanggil:
- Saat tab switch ke Tugas
- Saat schedule berubah (Firebase listener)
- Setiap 30 detik (untuk kasus jadwal expire mid-session)

---

## 10. Countdown Circular Rings

### 10.1 Desain

4 ring SVG melingkar — **bukan box+separator**. Tiap unit waktu punya warna distinct. Palette berbeda per mata kuliah / modul:

| Unit | Class | Getaran-Mekanik | Optimalisasi std (M1,2,3,5,6) | Optimalisasi M4 |
|------|-------|-----------------|-------------------------------|-----------------|
| Hari | `.ring-d` | `#a855f7` (violet) | `#a855f7` (violet) | `#7c4dff` (indigo-violet) |
| Jam | `.ring-h` | `#0ea5e9` (sky) | `#0ea5e9` (sky) | `#00e5ff` (cyan) |
| Menit | `.ring-m` | `#00e09e` (green) | `#00e09e` (green) | `#00e676` (green) |
| Detik | `.ring-s` | `#f97316` (orange) | `#ff4081` (pink) | `#ffb300` (amber) |

> **v13 update:** Palette di-pertahankan, namun visual treatment di-upgrade signifikan. Lihat **§10.4 Vibrant Visual Treatment**.

### 10.2 Struktur HTML

```html
<div class="countdown-wrap reveal">
  <div class="countdown-label">⏰ Hitung Mundur — Deadline Pertemuan N</div>
  <div class="countdown-rings">
    <div class="cd-ring ring-d" id="ring-d">
      <svg viewBox="0 0 120 120">
        <circle class="bg-track" cx="60" cy="60" r="52"/>
        <circle class="progress" cx="60" cy="60" r="52"
                stroke-dasharray="326.73" stroke-dashoffset="326.73"/>
      </svg>
      <div class="cd-center">
        <div class="cd-num" id="cd-d">--</div>
        <div class="cd-unit">Hari</div>
      </div>
    </div>
    <!-- Ulangi untuk Jam (ring-h), Menit (ring-m), Detik (ring-s) -->
  </div>
  <div class="cd-note" id="cdDeadline">Deadline: <strong>Menunggu jadwal...</strong></div>
</div>
```

### 10.3 JavaScript

```javascript
function startCountdown(endISO) {
  const end = new Date(endISO).getTime();
  const CIRC = 326.73;   // 2*pi*52
  const maxOf = { d: 30, h: 24, m: 60, s: 60 };

  function setRing(key, val, max) {
    const ring = document.getElementById('ring-' + key);
    if (!ring) return;
    const prog = ring.querySelector('.progress');
    const frac = Math.max(0, Math.min(1, val / max));
    prog.setAttribute('stroke-dashoffset', String(CIRC * (1 - frac)));
  }

  function tick() {
    const diff = end - Date.now();
    if (diff <= 0) {
      ['d','h','m','s'].forEach(k => {
        const el = document.getElementById('cd-' + k);
        if (el) el.innerHTML = '<span class="cd-expired">0</span>';
        document.getElementById('ring-' + k)?.classList.add('expired');
      });
      return;
    }
    const d = Math.floor(diff/86400000),
          h = Math.floor((diff%86400000)/3600000),
          m = Math.floor((diff%3600000)/60000),
          s = Math.floor((diff%60000)/1000);
    [['d',d],['h',h],['m',m],['s',s]].forEach(([key, val]) => {
      const el = document.getElementById('cd-' + key);
      if (el) el.textContent = String(val).padStart(2, '0');
      setRing(key, val, maxOf[key]);
    });
    setTimeout(tick, 1000);
  }
  tick();
}
```

### 10.4 Vibrant Visual Treatment (v13)

Mulai v13, panel countdown mendapat upgrade visual signifikan. Struktur HTML & ID **tetap sama** (kompatibel dengan `startCountdown()` di §10.3) — hanya CSS yang berubah. Tujuannya menghilangkan kesan "panel datar" dan memberi nuansa hidup berwarna-warni tanpa mengganggu keterbacaan angka.

#### 10.4.1 Komponen Visual Baru

| Komponen | Mekanisme | Tujuan |
|----------|-----------|--------|
| **Multi-radial background** | 3 ellipse `radial-gradient` (kiri-atas / kanan-atas / bawah-tengah) overlayed pada gradient diagonal dasar | Memberi kedalaman & nuansa berwarna sebelum animasi |
| **Aurora konik** | `::after` `inset:-50%` + `conic-gradient` 4-warna + `filter:blur(40px)` + `animation:cdAurora 18s linear infinite` | Glow hidup yang berputar pelan di belakang ring |
| **Gradient border** | `::before` `padding:1.5px` + `linear-gradient` 4-warna + mask-composite trick | Tepi panel berwarna-warni (bukan border solid 1 warna) |
| **Label sweep** | `background-size:200% 100%` + `cdLabelSweep 6s linear infinite` | Teks judul ber-shimmer multi-warna |
| **Ring halo** | `.cd-ring::before` radial gradient `currentColor` + `blur(10px)` + `cdHaloPulse 3s` | Aura warna mengikuti palette per-ring, berdenyut lembut |
| **Hover scale** | `.cd-ring:hover{transform:scale(1.05)}` + halo ke `opacity:.42` | Interaktivitas + emphasizes ring |
| **Drop-shadow ganda** | `filter:drop-shadow(0 0 10px) drop-shadow(0 0 4px)` pada `.progress` | Glow neon stroke (inner-tight + outer-soft) |
| **Gradient-text angka** | `background:linear-gradient(180deg, light, saturated)` + `background-clip:text` per ring | Angka tampil 3-dimensi, tidak datar 1 warna |
| **Tick detik** | `.ring-s .cd-num { animation: cdSecondTick 1s }` (scale 1 → 1.14 → 1) | Angka detik berdetak ringan setiap detik |
| **Pill glassmorphism** | `.cd-note` jadi inline-block dengan `border-radius:999px` + `backdrop-filter:blur(8px)` + `border:1px solid rgba(...,.25)` | Note deadline tampil seperti chip premium |

#### 10.4.2 Bug pattern: SVG drop-shadow ter-clip jadi kotak

**Gejala:** Glow `drop-shadow` di tepi ring tampak terpotong tegas dengan tepi rectangular — terlihat seperti "bayang kotak" mengelilingi lingkaran.

**Root cause:** SVG memiliki **default `overflow:hidden`** pada viewport-nya. Ketika `filter:drop-shadow` diterapkan ke `.progress`, output filter (stroke + glow) memiliki bounding box yang lebih besar dari stroke aslinya. Bagian glow yang melewati viewBox SVG (130×130 pada `.cd-ring`) akan ter-clip dengan tepi kotak SVG.

**Fix wajib:**
```css
.cd-ring svg{
  position:absolute;inset:0;width:100%;height:100%;
  transform:rotate(-90deg);
  z-index:1;
  overflow:visible;  /* ← WAJIB. Tanpa ini glow ter-clip jadi kotak */
}
```

> **Lesson:** Ketika menerapkan `filter:drop-shadow` / `filter:blur` pada elemen di dalam SVG dengan glow yang melebar, **selalu** set `overflow:visible` pada SVG agar filter output tidak ter-clip.

#### 10.4.3 Ukuran & Konstanta

| Konstanta | Nilai lama | Nilai v13 |
|-----------|------------|-----------|
| Ring size | 120×120 px | 130×130 px |
| Stroke width | 6 px | 7 px |
| `.cd-num` font-size | 28px | 32px |
| `.cd-num` font-weight | 800 | 900 |
| Drop-shadow glow | `drop-shadow(0 0 8px)` | `drop-shadow(0 0 10px) drop-shadow(0 0 4px)` |

> **Catatan SVG `<circle>`:** Atribut `cx="60" cy="60" r="52"` dan `stroke-dasharray="326.73"` **tidak berubah** karena viewBox tetap `0 0 120 120`. Konstanta `CIRC = 326.73` di JS juga tidak berubah.

#### 10.4.4 Audit Checklist

Ketika menambah modul baru atau migrasi countdown ke versi vibrant:

- [ ] CSS countdown menggunakan template v13 (multi-radial bg + aurora + gradient border + halo)
- [ ] `.cd-ring svg` memiliki `overflow:visible`
- [ ] Palette `.ring-d/.ring-h/.ring-m/.ring-s` sesuai dengan course (lihat tabel §10.1)
- [ ] Aurora `::after` & gradient border `::before` warna sesuai palette
- [ ] `.cd-note` tampil sebagai pill (bukan plain text)
- [ ] Buka di browser → verifikasi tidak ada bayang kotak di sekitar ring
- [ ] Verifikasi tick detik pulsing tetap halus (tidak menggangu angka)

---

## 11. Hero Animations per Tab

Setiap tab punya **canvas animation berbeda**, dipanggil dari `initHeroAnimations()` di JS utama.

### 11.1 Daftar Animasi per Tab

| Tab | Animasi | Konsep Visual |
|-----|---------|---------------|
| **Modul** | Direction Field (slope field) + flowing particles | PD `y' = e^(2x) − 3y`: panah arah + partikel cyan mengalir + integral curve oranye berdenyut |
| **Tugas** | Orbital parametric curves | 4 orbit elips/figure-8 dengan partikel amber/pink berputar |
| **Forum** | Exponential decay curves | Multiple `T(t) = T∞ + ΔT·e^(−kt)` curves + partikel "panas" naik & memudar |
| **Hasil** | Constellation network | 35 dot indigo/pink/gold, terhubung garis redup saat berdekatan, dengan pulse |

### 11.2 Struktur HTML

```html
<div class="page" id="page-modul">
  <div class="hero" data-tab="modul">
    <canvas class="hero-canvas" id="heroCanvasModul"></canvas>
    <div class="float-formulas">...</div>
    <div class="hero-content">...</div>
  </div>
</div>
```

```css
.hero-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
```

### 11.3 Pola JavaScript Implementation

```javascript
(function initHeroAnimations() {
  const animations = {
    modul: { particles: null, step(ctx, W, H, frame) { /* slope field */ } },
    tugas: { step(ctx, W, H, frame) { /* orbits */ } },
    forum: { step(ctx, W, H, frame) { /* decay */ } },
    hasil: { stars: null, step(ctx, W, H, frame) { /* constellation */ } }
  };

  const canvases = [
    { id: 'heroCanvasModul', tab: 'modul' },
    { id: 'heroCanvasTugas', tab: 'tugas' },
    { id: 'heroCanvasForum', tab: 'forum' },
    { id: 'heroCanvasHasil', tab: 'hasil' }
  ];

  let frame = 0;
  const state = [];

  function setup() {
    canvases.forEach(c => {
      const cv = document.getElementById(c.id);
      if (!cv) return;
      const rect = cv.parentElement.getBoundingClientRect();
      cv.width = Math.max(300, Math.floor(rect.width));
      cv.height = Math.max(300, Math.floor(rect.height));
      state.push({ canvas: cv, ctx: cv.getContext('2d'), anim: animations[c.tab] });
    });
  }

  function loop() {
    state.forEach(s => {
      // Draw only if hero is visible (tab active)
      const page = s.canvas.closest('.page');
      if (page && !page.classList.contains('active')) return;
      s.anim.step(s.ctx, s.canvas.width, s.canvas.height, frame);
    });
    frame++;
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { setup(); loop(); });
  } else {
    setup(); loop();
  }
})();
```

### 11.4 Customizing Hero Animations per Mata Kuliah

Konsep visual harus **relevan dengan topik mata kuliah**. Ada dua pendekatan utama:

**Pendekatan A — Canvas full-screen** (default, multi-tab berbeda):
| Mata Kuliah | Saran Animasi Modul | Saran Animasi Forum |
|-------------|---------------------|---------------------|
| Matematika 4 | Slope field PD | Cooling curves (pendinginan) |
| Getaran Mekanik | Sine wave dengan envelope / Spring-mass-damper | Resonance amplitude curve |
| Optimalisasi & Otomasi | Gradient descent path / contour | Convergence iteration |

**Pendekatan B — SVG decorative** (digunakan Modul-Getaran, lebih subtle):
- `<div class="hero-waves">` berisi `<svg>` dengan 2-3 `<path class="wave-trace">` — kurva sinusoidal teredam (amplitude decay) yang dianimasikan JS via `setAttribute('d', ...)` setiap frame
- `<div class="hero-schematic">` berisi SVG diagram spring-mass-damper statis dengan class `smd-mass` yang osilasi naik-turun (opacity ~0.12)
- Unified theme di semua 4 tab (background + grid + gradients sama)
- Warna wave traces dapat dibedakan per tab: `.w1/.w2/.w3` (Modul: violet+cyan+amber), `.w1b/.w2b` (Tugas: amber+violet), `.w1c/.w2c` (Forum: green+violet), `.w1d/.w2d` (Hasil: teal+indigo)

Pendekatan B lebih ringan (tidak ada requestAnimationFrame heavy canvas rendering) dan konsisten dengan aesthetic "documentation blueprint". Direkomendasikan untuk mata kuliah yang topiknya inheren visual (getaran, gelombang, sinyal).

Tab Tugas dan Hasil bisa **tetap sama** lintas-mata kuliah karena karakter konten serupa (orbital = soal/pencapaian, constellation = data agregat).

---

## 12. Animasi Login Overlay

Login overlay Modul-4 menampilkan animasi full-screen bertema **constellation + electric charges** yang selaras dengan palet hero Tab Hasil (indigo / pink / gold). Inspirasi: jaringan titik-titik berdenyut dengan muatan listrik yang sesekali mengeluarkan petir. Pengganti animasi sine-wave lama.

### 12.1 Komposisi Layer (Background → Foreground)

| Layer | Elemen | Jumlah | Fungsi |
|-------|--------|--------|--------|
| **1. Canvas background** | Full screen `<canvas>` @ DPR up to 2× | — | Dasar semua rendering |
| **2. Field lines** | Bezier curve melengkung | Antar pasangan `+ ↔ −` | Dekorasi medan listrik |
| **3. Node links** | Garis tipis indigo | Antar node dalam 160 px | Constellation edges |
| **4. Constellation nodes** | Titik berdenyut | **42 node** | Background pulse |
| **5. Spark arcs** | Zigzag kuning (probabilistik) | ~4% per frame | Event mikro |
| **6. Lightning blasts** | Fraktal cabang + flash + shockwave | ~1 per muatan per 15-35 s | Event makro |
| **7. Electric charges** | Simbol `+` / `−` berpulse | **8 muatan** (4+, 4−) | Fokus visual utama |
| **8. DOM particles** | 30 dot yang float dari bawah | 30 | Layer ekstra di atas canvas |
| **9. DOM formulas** | 11 formula PD melayang | 11 | Estetika tematik |

### 12.2 Palet Warna

Semua elemen selaras dengan Tab Hasil:

```javascript
const NODE_COLORS = [
  '#818cf8',   // indigo
  '#ec4899',   // pink
  '#fbbf24',   // gold
  '#a78bfa',   // violet
  '#f472b6',   // pink muda
  '#60a5fa'    // blue
];

// Muatan
// Positif (+) → '#fbbf24' (gold)
// Negatif (−) → '#60a5fa' (blue)

// Spark arcs → 'rgba(253,224,71,...)' (yellow electric)

// Field lines → gradient gold↔blue sesuai muatan
```

### 12.3 High-DPR (Retina) Rendering

```javascript
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);   // cap 2× untuk performa
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width  = Math.floor(W * DPR);
  canvas.height = Math.floor(H * DPR);
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
```

CSS:
```css
#overlayWaveCanvas {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  opacity: .85;
}
```

### 12.4 Constellation Nodes

42 titik bergerak perlahan dengan velocity random (`±0.175 px/frame`):

```javascript
const NODE_COUNT = 42;
const LINK_DIST = 160;   // jarak maks untuk menggambar garis antar node

nodes.push({
  x:  Math.random() * W,
  y:  Math.random() * H,
  vx: (Math.random() - 0.5) * 0.35,   // drift pelan
  vy: (Math.random() - 0.5) * 0.35,
  r:  1.2 + Math.random() * 2.2,
  color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)],
  pulseOff: Math.random() * Math.PI * 2
});
```

**Rendering:**
- Setiap node pulse: `sin(frame * 0.025 + pulseOff)` → skala 0.55 – 1.0
- Node yang berdekatan (`<160 px`) dihubungkan garis `rgba(129,140,248,...)` dengan alpha proporsional terhadap jarak
- Shadow blur 12×pulse untuk efek glow

### 12.5 Electric Charges (8 muatan)

4 muatan positif + 4 muatan negatif, **bergerak bebas** (tanpa gaya tarik-menolak Coulomb):

> **Catatan desain:** Versi awal mencoba simulasi gaya Coulomb (sejenis menolak, berlawanan menarik), tapi terasa **terlalu deterministik** — muatan sering berkumpul berpasangan di tengah dan blast terkonsentrasi di area yang sama. Free-drift menghasilkan distribusi spasial yang lebih merata, blast tersebar di seluruh layar, dan visual lebih organic. Field lines tetap digambar sebagai dekorasi visual murni.

```javascript
const CHARGE_COUNT = 8;

charges.push({
  x: Math.random() * W,
  y: Math.random() * H,
  vx: (Math.random() - 0.5) * 1.0,   // ~2× lebih cepat dari nodes (energetic but not chaotic)
  vy: (Math.random() - 0.5) * 1.0,
  sign: pos ? 1 : -1,
  r: 16,
  color: pos ? '#fbbf24' : '#60a5fa',
  pulseOff: Math.random() * Math.PI * 2,
  nextBlastAt: 240 + Math.floor(Math.random() * 720),   // first blast 4-16 s
  blastCharging: false
});
```

**Rendering per muatan:**
1. Halo radial gradient (2× radius muatan, pulse)
2. Core circle solid (r=16 px)
3. Simbol `+` atau `−` dengan stroke `#0a0418` tebal 3 px
4. Shadow blur 16×pulse

**Update:**
```javascript
function updateCharges() {
  for (const c of charges) {
    c.x += c.vx; c.y += c.vy;
    // Bounce dari boundary (margin 30px)
    if (c.x < 30)     { c.x = 30;     c.vx = Math.abs(c.vx); }
    if (c.x > W - 30) { c.x = W - 30; c.vx = -Math.abs(c.vx); }
    if (c.y < 30)     { c.y = 30;     c.vy = Math.abs(c.vy); }
    if (c.y > H - 30) { c.y = H - 30; c.vy = -Math.abs(c.vy); }
  }
}
```

### 12.6 Field Lines (Dekorasi Medan Listrik)

Garis Bezier melengkung antara setiap pasangan muatan berlawanan (`+` ke `−`) dalam jarak `<340 px`:

```javascript
function drawFieldLines() {
  for (let i = 0; i < charges.length; i++) {
    for (let j = i + 1; j < charges.length; j++) {
      const a = charges[i], b = charges[j];
      if (a.sign === b.sign) continue;  // hanya pasangan berlawanan
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d > 340) continue;

      const alpha = (1 - d/340) * 0.35;
      // Gradient: gold (from +) → blue (to −)
      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      // ... (alpha fade, bow dinamis dengan sin(frame * 0.015))
      const bow = 40 * Math.sin(frame * 0.015 + i + j);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(mx + nx * bow, my + ny * bow, b.x, b.y);
      ctx.stroke();
    }
  }
}
```

Hanya dekorasi — **tidak mempengaruhi pergerakan** muatan.

### 12.7 Spark Arcs (Event Mikro)

~4% probability per frame spawn spark arc antara 2 node yang berdekatan (<95 px):

```javascript
function maybeSpawnSpark() {
  if (Math.random() > 0.04) return;
  // Cari pasangan node yang sangat dekat
  const closePairs = /* ... filter d² < 9000 */;
  if (!closePairs.length) return;
  const [a, b] = closePairs[Math.floor(Math.random() * closePairs.length)];
  sparks.push({
    x1: a.x, y1: a.y, x2: b.x, y2: b.y,
    life: 14, maxLife: 14,
    seed: Math.random() * 1000
  });
}
```

**Visual:**
- Zigzag 6 segmen dengan jitter sinusoidal (pakai `seed`)
- Warna kuning `rgba(253,224,71,alpha)` dengan glow
- Durasi 14 frame (≈0.23 s), fade-out linear

### 12.8 ⚡ Lightning Blast System

Setiap muatan sesekali melepas pelepasan listrik dahsyat. **3 tier ukuran** dengan distribusi probabilitas:

| Tier | Probabilitas | Karakteristik |
|------|:-----------:|---------------|
| 🔹 **Small** | 50 % | Percikan lokal, 3-5 cabang, 1 shockwave, durasi 0.4 s |
| 🔸 **Medium** | 35 % | Blast standar, 6-9 cabang, 2 shockwaves, durasi 0.53 s |
| 💥 **Massive** | 15 % | Blast dahsyat, 10-14 cabang, 3 shockwaves, durasi 0.73 s, flash layar 2× |

**Parameter per tier:**

| Parameter | Small | Medium | Massive |
|-----------|:-----:|:------:|:-------:|
| Cabang utama | 3-5 | 6-9 | 10-14 |
| Panjang cabang | 60-140 px | 150-300 px | 280-520 px |
| Iterasi fraktal | 4 | 5 | 6 |
| Sub-cabang per branch | 0-2 | 2-4 | 4-7 |
| Partikel percikan | 6-12 | 14-24 | 28-45 |
| Flash radius | 60-100 px | 120-200 px | 200-380 px |
| Jumlah shockwave ring | 1 | 2 | 3 |
| Shockwave max radius | 130 px | 280/420 px | 460/680/900 px |
| Outer glow stroke | 3.5 px | 5 px | 8 px |
| Global screen flash | 0.6× | 1× | 2× |

**Fractal lightning via midpoint displacement:**

```javascript
function genLightningPath(x1, y1, x2, y2, displacement, detail) {
  let pts = [{x:x1, y:y1}, {x:x2, y:y2}];
  for (let iter = 0; iter < detail; iter++) {
    const newPts = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i+1];
      newPts.push(a);
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.sqrt(dx*dx + dy*dy) || 1;
      const nx = -dy / d, ny = dx / d;
      const off = (Math.random() - 0.5) * displacement;
      newPts.push({ x: mx + nx * off, y: my + ny * off });
    }
    newPts.push(pts[pts.length - 1]);
    pts = newPts;
    displacement *= 0.55;   // exponential decay → detail makin halus
  }
  return pts;
}
```

Untuk cabang utama `detail = 5` → 2⁵ = 32 titik zigzag. Untuk massive `detail = 6` → 64 titik (lebih detail).

**4 layer rendering per blast:**

1. **Radial flash** — gradient besar di pusat, fade 0.2 s (flashLife)
2. **Shockwave rings** — lingkaran ekspansi ease-out `sw.r += (maxR - sw.r) * 0.08`
3. **Lightning branches** — double-stroke (outer glow tebal + inner bright core putih)
4. **Spark pieces** — partikel putih terbang dengan physics (friction 0.94 + gravity 0.05)

### 12.9 Charging Phase (Warning Visual)

**20 frame sebelum blast**, muatan memasuki mode "charging":

```javascript
c.blastCharging = (c.nextBlastAt - frame) <= 20 && (c.nextBlastAt - frame) > 0;

// Di drawCharges:
if (c.blastCharging) {
  const chargeFrac = 1 - (c.nextBlastAt - frame) / 20;   // 0 → 1
  const flicker = 0.5 + 0.5 * Math.sin(frame * 0.8);     // rapid flicker
  chargingMult = 1 + chargeFrac * 2 * (0.5 + flicker * 0.5);
  // → halo 2-3× lebih besar, glow lebih terang

  // Tambahan: charging ring — lingkaran putih yang menyusut ke muatan
  const ringR = c.r * (3.2 - chargeFrac * 1.2);
  ctx.strokeStyle = `rgba(255,255,255,${0.4 + chargeFrac * 0.5})`;
  ctx.beginPath();
  ctx.arc(c.x, c.y, ringR, 0, Math.PI * 2);
  ctx.stroke();
}
```

Mahasiswa melihat muatan "mengumpulkan energi" 0.33 detik sebelum meledak — anticipation effect.

### 12.10 Blast Timing & Pacing

**Cooldown per muatan:**
- First blast: `240 + random(720)` frames → **4-16 detik** setelah halaman load
- Blast berikutnya: `900 + random(1200)` frames → **15-35 detik** cooldown per muatan

**Rate agregat** dengan 8 muatan (rata-rata cooldown 25 detik per muatan):
- Rata-rata **~1 blast / 3 detik** secara agregat di layar
- Jeda panjang memberi ruang bernapas untuk constellation + field lines
- Selama 30 detik login: **~10 blast total** (~5 small + ~3.5 medium + ~1.5 massive)
- Massive blast jarang (~1-2 per 30 detik) sehingga tetap **berkesan** saat muncul

**Filosofi pacing:**
> "Langit tenang yang sesekali disambar petir" — bukan "badai listrik terus-menerus"

Jeda antar blast sengaja dibuat panjang agar:
- Mahasiswa bisa mengapresiasi layer lain (constellation, field lines, spark arcs)
- Massive blast jadi event yang ditunggu-tunggu
- Efek visual tidak melelahkan mata selama sesi login

### 12.11 Global Screen Flash

Saat ada blast aktif, seluruh layar di-flash putih tipis — intensitas **scaled per ukuran blast**:

```javascript
const activeFlash = blasts.reduce((acc, b) => {
  const mult = b.globalFlashMult || 1;  // small=0.6, medium=1, massive=2
  const raw = (b.flashLife / b.maxFlashLife) * mult;
  return Math.max(acc, raw);
}, 0);
if (activeFlash > 0) {
  ctx.fillStyle = `rgba(255,255,255,${Math.min(activeFlash * 0.08, 0.18)})`;
  ctx.fillRect(0, 0, W, H);
}
```

Capped di 0.18 alpha agar tidak terlalu silau untuk massive blast.

### 12.12 Performance Optimization

| Optimasi | Implementasi |
|----------|--------------|
| **DPR cap 2×** | Mencegah layar DPR 3+ (iPad, 4K) merender terlalu banyak pixel |
| **Auto-pause** | `MutationObserver` pada `visitorOverlay.classList` — saat `.hidden`, cancel `requestAnimationFrame` |
| **Precomputed branches** | Lightning cabang di-generate sekali saat spawn, tidak per-frame |
| **Life-based cleanup** | Blast, sparks, spark-pieces dihapus setelah `life ≤ 0` |
| **Filter before draw** | Field lines & node links hanya dihitung untuk pasangan dalam jarak threshold |
| **Minimal state reset** | `frame` counter tidak di-reset saat show — kontinuitas pulse |

### 12.13 Floating Formulas (DOM Layer)

Di atas canvas, 11 formula melayang dari bawah ke atas dengan animasi CSS (DOM-based, bukan canvas):

```javascript
// Matematika 4 — PD Linier
const formulas = [
  { t: "y' + P(x)y = Q(x)",              s: 13 },
  { t: 'u = e^∫P dx',                     s: 13 },
  { t: 'y·u = ∫Q·u dx + c',               s: 12 },
  { t: 'z = y^(1−n)',                     s: 13 },
  { t: "y' + Py = Qyⁿ",                   s: 12 },
  { t: 'T(t) = T∞ + ΔT·e^(−kt)',          s: 10 },
  // ... dst
];

// Palet warna konsisten dengan tema baru
const fCols = [
  'rgba(129,140,248,.22)',   // indigo
  'rgba(236,72,153,.18)',    // pink
  'rgba(251,191,36,.22)',    // gold
  'rgba(168,85,247,.2)',     // violet
  'rgba(96,165,250,.18)',    // blue
];
```

CSS animation `ovFormula` → translate dari `translateY(105vh)` → `translateY(-80px)` dengan rotasi random.

**Per mata kuliah, ganti daftar formulas:**

```javascript
// Getaran Mekanik
const formulas = [
  { t: 'mẍ + cẋ + kx = F₀sin(ωt)', s: 12 },
  { t: 'ωₙ = √(k/m)',               s: 14 },
  { t: 'ζ = c/(2√(km))',            s: 13 },
  { t: 'DMF = 1/√((1-r²)² + (2ζr)²)', s: 11 },
  // ...
];

// Optimalisasi & Otomasi
const formulas = [
  { t: 'min f(x) s.t. g(x) ≤ 0', s: 12 },
  { t: '∇L = 0',                  s: 14 },
  { t: 'f(x) ≥ f(x*) + ∇f·(x-x*)', s: 11 },
  // ...
];
```

### 12.14 Floating Particles (DOM Layer)

30 titik kecil yang float dari bawah ke atas dengan drift horizontal random:

```javascript
const pColors = [
  'rgba(129,140,248,.85)',  'rgba(236,72,153,.75)',
  'rgba(251,191,36,.65)',   'rgba(168,85,247,.6)',
  'rgba(244,114,182,.55)',
];
```

Durasi animasi 11-27 detik per siklus, dengan `boxShadow` radial glow.

### 12.15 Struktur HTML

```html
<div class="visitor-overlay" id="visitorOverlay">
  <!-- Animation layer: canvas (constellation + charges) -->
  <canvas id="overlayWaveCanvas"></canvas>

  <!-- DOM particles layer (di atas canvas) -->
  <div id="overlayParticles" aria-hidden="true"></div>

  <!-- Modal login -->
  <div class="visitor-modal">
    <!-- ... -->
  </div>
</div>
```

### 12.16 Menyesuaikan Animasi untuk Mata Kuliah Lain

Yang **tetap identik** lintas mata kuliah:
- Struktur layer canvas (constellation + charges + blasts)
- Palet warna (indigo/pink/gold — netral, cocok untuk semua MK)
- Timing parameters (cooldown, durasi blast)
- Performance optimization

Yang **perlu disesuaikan**:
- `formulas[]` — isi dengan formula PD / getaran / optimasi sesuai MK
- Warna floating particles/formulas boleh diubah jika ingin beda nuansa, tapi palet indigo/pink/gold sudah optimal untuk semua

**Tidak disarankan mengubah:**
- Parameter muatan (`CHARGE_COUNT`, `NODE_COUNT`) — sudah dicalibrate untuk densitas visual optimal
- Timing blast — menjaga pacing yang sudah tested

---

## 13. Struktur Firebase & Security Rules

### 13.1 Path Structure

```
/pins                         ← NODE GLOBAL (lintas-course, lintas-module)
  /mhs_<NIM>                  ← satu PIN per mahasiswa, seumur hidup
    - pinHash   (64 char hex SHA-256, IMMUTABLE)
    - pinSetAt  (ISO string, IMMUTABLE)
    - nama      (string, audit)

/visitors
  /math4              ← course slug 1
    /modul-N          ← module ID
      /mhs_<NIM>      ← per-student record
        - nama, nim, role, timestamp, lastVisit
        - visitCount, points, pointTimestamp
        - scoredQuestions (CSV string)
        - consolationAwarded (bool)
        (NO pinHash/pinSetAt — sudah di /pins global)
    /forum-N
    /tugas-N
  /getaran_mekanik    ← course slug 2
    /pertemuan-N
  /optoauto           ← course slug 3
    /pertemuan-N

/settings
  /math4
    /pertemuan-N
      /schedule
        - start, end, duration, due
  /getaran_mekanik
    /...
  /optoauto
    /...

/presence                     ← NODE REAL-TIME (hanya mahasiswa, auto-remove onDisconnect)
  /getaran_mekanik
    /pertemuan-N
      /mhs_<NIM>              ← satu entry per mahasiswa online
        - nama, nim (digit-only), lastSeen (timestamp ms), tab, role ('student' only)
        (dosen TIDAK pernah write ke sini — privacy)

/chat                         ← NODE GROUP CHAT (immutable, last 50)
  /getaran_mekanik
    /pertemuan-N
      /messages
        /<pushId>             ← push-id generated by Firebase
          - nim (digit atau 'DOSEN'), nama, role ('student'|'dosen')
          - text (1-500 char), timestamp (ms)
          (immutable: !data.exists() guard di rules)
```

**Catatan arsitektur:**
- Node `/pins` terpisah dari `/visitors` secara sengaja. Tujuan: (a) satu PIN untuk seluruh mata kuliah (lihat §8), (b) isolasi dari reset modul — delete `/visitors/<course>/<module>` tidak menyentuh PIN, (c) rules lebih sederhana (immutable by design).
- Key `mhs_<NIM>` di `/pins` dan `/visitors/<course>/<module>` sama persis — memudahkan cross-reference saat login flow.
- Node `/presence` dan `/chat` **ephemeral & append-only** (lihat §24) — tidak di-reset oleh tombol Reset Data Mahasiswa; dibersihkan manual via Firebase Console jika perlu.

### 13.2 Schema Field

**Schema `/pins/mhs_<NIM>` (global):**

| Field | Type | Constraint |
|-------|------|------------|
| `pinHash` | string | **64 char hex** (SHA-256), **IMMUTABLE** setelah create (rule di level `$visitorKey`) |
| `pinSetAt` | ISO string | Kapan PIN diset pertama kali, **IMMUTABLE** |
| `nama` | string | 2–80 char, untuk audit (boleh update tanpa ganggu immutability pinHash) |

**Schema `/visitors/<course>/<module>/mhs_<NIM>` (per-modul):**

| Field | Type | Constraint |
|-------|------|------------|
| `nama` | string | 2–80 char |
| `nim` | string | 1–20 digit, atau `'DOSEN'` |
| `role` | string | `'student'` / `'dosen'` / `'guest'` |
| `timestamp` | ISO string | Login pertama di course/module ini (terkunci) |
| `lastVisit` | ISO string | Update tiap visit baru |
| `visitCount` | number | 1–500, hanya bisa naik +1 |
| `points` | number | 0–**50**, hanya bisa naik +0/+1/+2/+4 per write (lihat §13.4) |
| `pointTimestamp` | ISO string | Update tiap dapat poin |
| `scoredQuestions` | string | CSV `"mc1,c1_comp,..."`, max 2000 char |
| `consolationAwarded` | bool | `true` saja, mencegah retrigger konsolasi |

> **Catatan migrasi (April 2026):** Visitor records sistem lama mungkin masih memiliki field `pinHash` dan `pinSetAt` tersisa. Field-field ini **diabaikan** oleh login flow baru — otoritas sepenuhnya dari `/pins/mhs_<NIM>`. Security Rules baru **tidak** validate `pinHash`/`pinSetAt` di `visitors/...` lagi (field legacy terbaca tapi tidak bisa di-update; akan terhapus otomatis saat modul di-reset atau visitor record di-rewrite).

### 13.3 Schema Field per Schedule

| Field | Type | Constraint |
|-------|------|------------|
| `start` | ISO string | 10–40 char |
| `end` | ISO string | 10–40 char |
| `duration` | number | 0–365 hari |
| `due` | string | datetime-local format |

### 13.4 Firebase Security Rules

**File:** `database.rules.json`

Inti rules untuk multi-course (full file ada di repo terpisah):

```json
{
  "rules": {
    ".read": false,
    ".write": false,

    "visitors": {
      "$course": {
        ".validate": "$course === 'math4' || $course === 'getaran_mekanik' || $course === 'optoauto'",
        ".read": true,

        "$module": {
          ".validate": "$module.matches(/^[a-z0-9_-]{1,40}$/)",
          ".write": "!newData.exists()",   // izinkan delete (reset)

          "$visitorKey": {
            ".validate": "$visitorKey.matches(/^mhs_[0-9A-Z]{1,20}$/) || $visitorKey === 'dosen'",
            ".read": true,
            ".write": "...",   // batasi: identitas terkunci, points naik max +2/write

            // ... field validators
          }
        }
      }
    },

    "settings": {
      "$course": {
        ".validate": "$course === 'math4' || $course === 'getaran_mekanik' || $course === 'optoauto'",
        ".read": true,
        "$pertemuan": {
          "schedule": {
            ".write": true,
            // ... field validators
          }
        }
      }
    },

    "presence": {              // ← NODE REAL-TIME (lihat §24)
      "$course": {
        ".validate": "$course === 'math4' || $course === 'getaran_mekanik' || $course === 'optoauto'",
        ".read": true,
        "$module": {
          "$userKey": {
            ".validate": "$userKey.matches(/^mhs_[0-9A-Z]{1,20}$/)",   // hanya mahasiswa
            ".write": "...",   // boleh write presence sendiri + onDisconnect remove
            "role": { ".validate": "newData.val() === 'student'" },    // BUKAN dosen
            // ... field validators (nama, nim digit-only, lastSeen, tab)
          }
        }
      }
    },

    "chat": {                  // ← NODE GROUP CHAT (lihat §24)
      "$course": {
        ".validate": "$course === 'math4' || $course === 'getaran_mekanik' || $course === 'optoauto'",
        ".read": true,
        "$module": {
          "messages": {
            ".indexOn": ["timestamp"],
            "$msgId": {
              ".write": "!data.exists()",   // IMMUTABLE: pesan tidak bisa diedit/dihapus
              "nim":  { ".validate": "... matches /^[0-9]{1,20}$/ OR === 'DOSEN'" },
              "role": { ".validate": "... === 'student' OR === 'dosen'" },
              "text": { ".validate": "... length 1..500" },
              // ... timestamp validators (anti-spoof now±5min)
            }
          }
        }
      }
    }
  }
}
```

**Untuk menambah mata kuliah baru di rules:**
1. Edit empat baris validate `$course` (di `visitors`, `settings`, `presence`, `chat`)
2. Tambah operator `||` dengan slug baru
3. Publish ulang di Firebase Console

### 13.4.1 ⚠ Null-Comparison Trap (CRITICAL — root cause Bug Apr 2026)

Firebase Realtime Database Rules memperlakukan `null` sebagai **bukan angka** dalam komparasi numerik. Ini menyebabkan trap mematikan:

```javascript
// .write rule (lama, BERMASALAH):
"newData.child('points').val() >= data.child('points').val() && 
 newData.child('points').val() <= data.child('points').val() + 4"

// Skenario gagal:
// 1. Mahasiswa login → record dibuat dengan { nama, nim, ..., visitCount: 1 }
//    (TIDAK ada field 'points' — programmer kira "default null = 0")
// 2. Mahasiswa jawab MC → _awardPoint write { ..., points: 1 }
// 3. Rule cek: data.child('points').val() = null
//    Komparasi: 1 >= null  →  Firebase rules: FALSE (bukan true!)
// 4. Write ditolak silent → poin tidak tersimpan, mahasiswa frustrasi
```

**Gejala yang muncul ketika trap ini aktif:**
- Visit tercatat di Firebase ✓ (initial write OK karena `!data.exists()`)
- Poin TIDAK pernah tersimpan ✗ (semua subsequent writes ditolak)
- Tabel performa kosong padahal mahasiswa rajin menjawab
- Tidak ada error visible di UI (silent rule rejection)

**Solusi 2-lapis (WAJIB):**

**Lapis 1 — Aplikasi (preventif):** Setiap visitor record creation HARUS init `points: 0` & `scoredQuestions: ''`:

```javascript
// ✅ BENAR — points dan scoredQuestions di-init dari awal
const visitorRec = {
  nama, nim, role: 'student',
  timestamp: nowISO,
  lastVisit: nowISO,
  visitCount: 1,
  points: 0,           // ← WAJIB, tidak boleh diabaikan
  scoredQuestions: ''  // ← WAJIB, tidak boleh diabaikan
};

// ❌ SALAH — akan trigger null-comparison trap
const visitorRec = {
  nama, nim, role: 'student',
  timestamp: nowISO,
  lastVisit: nowISO,
  visitCount: 1
  // points & scoredQuestions tidak ada → rule reject saat first answer
};
```

**Lapis 2 — Rules (defensif):** `.write` rule HARUS handle null case:

```javascript
// ✅ BENAR — defensive null check
"(!newData.hasChild('points') || !data.hasChild('points') || 
  (newData.child('points').val() >= data.child('points').val() && 
   newData.child('points').val() <= data.child('points').val() + 4))"

// ❌ SALAH — trap aktif jika field belum ada
"(!newData.hasChild('points') || 
  (newData.child('points').val() >= data.child('points').val() && 
   newData.child('points').val() <= data.child('points').val() + 4))"
```

**Pola lain yang rentan trap yang sama** — selalu tambah `!data.hasChild('<field>')` saat membandingkan numeric/string yang mungkin tidak ada di record awal: `consolationAwarded`, `visitCount` (sudah benar di rules), atau field baru apa pun yang ditambahkan kemudian.

**Audit checklist sebelum deploy modul baru:**
1. ✅ `submitPinSetup` visitor record include `points: 0, scoredQuestions: ''`
2. ✅ `submitPinVerify` new-visitor branch include `points: 0, scoredQuestions: ''`
3. ✅ Auto-create blocks di `_awardPoint` dst include `points: 0, scoredQuestions: ''`
4. ✅ `database.rules.json` mengandung `|| !data.hasChild('points')` di .write rule

### 13.5 Apa yang Dilindungi

| Proteksi | Efeknya |
|----------|---------|
| `$course` whitelist | Tidak bisa buat path liar |
| Identitas terkunci setelah create | Tidak bisa ganti nim/nama via DevTools |
| `points` max **+4** per write | Tidak bisa lompat ke 50 langsung (maksimal increment = poin Comp Hard) |
| `points` tidak bisa turun | Mencegah cheat dengan reset |
| `points` cap = **50** | Hard limit — mendukung skema universal 50-poin (10 MC + 10 Comp E/M + 5 Comp Hard); juga valid untuk varian legacy 30 dan 25 poin karena nilainya lebih rendah |
| `visitCount` max +1 per write | Mencegah inflasi kunjungan |
| `consolationAwarded` once-only | Tidak bisa retrigger 1 poin konsolasi |
| `/pins/mhs_<NIM>/pinHash` IMMUTABLE | Tidak bisa ganti PIN orang lain — rule `.write` mensyaratkan `newData.pinHash == data.pinHash` jika data exists |
| `/pins/mhs_<NIM>/pinSetAt` IMMUTABLE | Timestamp setup PIN dijaga integritasnya |
| `pinHash` format validate (64 char hex) | Tidak bisa inject data selain SHA-256 hash |
| `/pins` tidak bisa di-delete dari client | Delete PIN hanya via Firebase Console (admin) — tidak ada rule `.write` yang mengizinkan `newData.exists() === false` di level `$visitorKey` dari client aplikasi |
| Field `$other` ditolak | Mencegah injeksi data |

**Firebase Rules — update `points.validate`:**
```json
"points": {
  ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 50"
}
```

**Dan pada `.write` rule di `$visitorKey`**, increment yang diizinkan adalah **0, 1, 2, atau 4** (MC, Comp E/M, atau Comp Hard):
```
newData.child('points').val() <= data.child('points').val() + 4
```
> Sebelumnya `+ 2` (hanya MC dan Comp). Dengan adanya Comp Hard bernilai 4 poin, batas harus dinaikkan ke `+ 4`. Ini tetap aman karena server tidak bisa cek difficulty soal — proteksi utama tetap pada `scoredQuestions` yang mencegah double-award per qId.

**Firebase Rules — node `/pins` baru:**
```json
"pins": {
  ".read": true,
  "$visitorKey": {
    ".validate": "$visitorKey.matches(/^mhs_[0-9A-Z]{1,20}$/)",
    ".read": true,
    ".write": "!data.exists() || (newData.exists() && newData.child('pinHash').val() === data.child('pinHash').val() && newData.child('pinSetAt').val() === data.child('pinSetAt').val())",
    "pinHash":  { ".validate": "newData.isString() && newData.val().length === 64 && newData.val().matches(/^[0-9a-f]+$/)" },
    "pinSetAt": { ".validate": "newData.isString() && newData.val().length >= 10 && newData.val().length <= 40" },
    "nama":     { ".validate": "newData.isString() && newData.val().length >= 2 && newData.val().length <= 80" },
    "$other":   { ".validate": false }
  }
}
```
> Rule `.write` ini mengizinkan: (a) create baru, atau (b) update yang PRESERVES `pinHash` dan `pinSetAt` (praktis: hanya field `nama` yang bisa di-update setelah PIN terset). Delete dari client dilarang (karena `newData.exists()` = false akan fail check `newData.child('pinHash').val() === ...`). Admin tetap bisa delete via Firebase Console.

### 13.6 Reset Data

`confirmReset()` melakukan `remove()` di parent node module + related modules + schedule:

```javascript
Promise.all([
  remove(ref(db, DB_PATH)),           // visitors/<course>/modul-N
  remove(ref(db, SCHEDULE_PATH)),     // settings/<course>/pertemuan-N/schedule
  ...RELATED_MODULES.map(mid =>
    remove(ref(db, `visitors/<course>/${mid}`))
  )
]).then(() => {
  // sukses: clear localStorage, tutup modal, tampilkan login
}).catch(err => {
  // tampilkan error: "❌ Gagal hapus data: ..."
});
```

Rules level `$module` mengizinkan delete via `".write": "!newData.exists()"`.

---

## 14. Tab Modul — Struktur Konten

Tab Modul dibagi menjadi **8 Bagian** + Daftar Pustaka. Konsisten lintas mata kuliah:

| Bagian | Topik Generic | Contoh Matematika 4 |
|--------|---------------|---------------------|
| 01 | Konsep Dasar | PD Linier Orde Satu |
| 02 | Metode Penyelesaian Utama | Faktor Integrasi |
| 03 | Variasi/Generalisasi | Persamaan Bernoulli |
| 04 | Reduksi/Transformasi | Reduksi Orde |
| 05 | Analogi Sehari-hari | 6 analogi (obat, kopi, tangki, …) |
| 06 | Animasi Interaktif | 4 canvas (slope field, faktor integrasi, Bernoulli, reduksi) |
| 07 | Aplikasi Teknik Mesin | Pendinginan, tangki, RL, jatuh bebas |
| 08 | Implementasi Python (Jupyter) | 4 cell SymPy + NumPy |

### 14.1 Bagian 06 — Canvas Animasi

Per topik, buat 4 canvas dengan slider interaktif (konvensi: `cvPhysics`, `cvSweep`, `cvIso`, `cvHPB` dengan fungsi draw `drawPhysics/Sweep/Iso/HPB`):

```html
<div class="anim-block reveal">
  <h3>Animasi 1 — [Judul]</h3>
  <canvas id="cv1" height="300"></canvas>
  <div class="slider-row">
    <label>Parameter: <span id="v_p">2.0</span></label>
    <input type="range" id="sl_p" min="0.5" max="5" step="0.1" value="2">
  </div>
  <div class="tip-box">
    💡 <strong>Cara Membaca Grafik:</strong> ...
  </div>
</div>
```

#### 14.1.1 ⚠ ATURAN WAJIB — Animasi HARUS Sesuai Topik Modul

**Animasi adalah inti pedagogis modul, bukan dekorasi.** Setiap canvas harus memvisualisasikan konsep yang dibahas di pertemuan terkait. **Animasi yang tidak relevan dengan topik = bug pedagogis serius** dan harus diperbaiki sebelum publish.

**Anti-pattern yang sudah pernah terjadi:**

Saat membuat modul baru dengan cara <em>copy template</em> dari modul lain (mis. Modul-8 LP dibuat dengan copy Modul-7 FFT, Modul-9 NLP dengan copy Modul-8 LP), seringkali **HTML deskripsi panel diupdate ke topik baru tetapi JS canvas drawing tetap menggambar topik lama**. Hasilnya:
- Judul HTML: "Animasi 1 — Daerah Feasibel & Iso-Profit Lines (LP)"
- Canvas yang tergambar: sinyal vibrasi RMS/Peak (dari Modul-7 FFT)
- → Mahasiswa bingung total. **Mismatch ini sangat menyesatkan**.

**Checklist Konsistensi Animasi (WAJIB sebelum merge PR):**

| Layer | Yang Harus Dicek | Modul-8 LP (contoh) | Modul-9 NLP (contoh) |
|-------|------------------|---------------------|----------------------|
| **HTML judul** `<span class="anim-title">` | Sebut konsep modul | "Daerah Feasibel & Iso-Profit Lines" | "Gradient Descent on Contour" |
| **Slider label** `<label>` | Parameter relevan | c₁ profit, b₁ kapasitas | α step size, x₀ |
| **Canvas drawing** `drawPhysics()` etc. | Render visual yang cocok | Polygon konveks + iso-profit line | Contour + trajectory descent |
| **Tip-box** `<div class="tip-box">` | Petunjuk "Coba" cocok | "(1) c₁=40 → vertex (20,20)…" | "(1) α kecil → konvergen lambat…" |
| **Info panel** innerHTML | Output sesuai konsep | "Vertex optimal: (x_A, x_B), Z=…" | "Iter: N, ‖∇f‖=…, status: konvergen" |
| **Float formulas** di `formulas[]` array | Notasi modul | `max cᵀx`, `Ax ≤ b` | `min f(x)`, `∇f=0`, `KKT` |

#### 14.1.2 Mapping Animasi ke Topik per Modul (Reference Implementation)

Berikut pemetaan empat slot animasi (`drawPhysics`, `drawSweep`, `drawIso`, `drawHPB`) untuk topik Optimalisasi & Otomasi sebagai pola referensi. Modul lain mengikuti prinsip yang sama: **tiap animasi harus menjelaskan konsep spesifik yang ada di Bagian 01–07 modul**.

| Slot | Modul-7 FFT (P7) | Modul-8 LP (P9) | Modul-9 NLP (P10) | Modul-10+ |
|------|------------------|------------------|--------------------|-----------|
| **drawPhysics** (cvPhysics) | Sinyal vibrasi RMS/Peak | Daerah Feasibel + Iso-profit | Gradient Descent on contour | Sesuai topik |
| **drawSweep** (cvSweep) | Impak transient → CF/Kurt | Simpleks vertex pivot | Newton vs Steepest Descent | Sesuai topik |
| **drawIso** (cvIso) | Histogram skewness/kurtosis | Sensitivity Z(b) piecewise | Multi-modal landscape (lokal vs global) | Sesuai topik |
| **drawHPB** (cvHPB) | Bearing lifetime trajectory | Slack variables bar chart | KKT: gradients paralel + μ bar | Sesuai topik |

**Prinsip pemilihan animasi:**

1. **Ambil 4 konsep paling fundamental dari Bagian 01–04 modul** (yang menjadi judul Bagian Materi)
2. **Tiap animasi harus interaktif** — minimal 1 slider yang mengubah perilaku visual signifikan
3. **Tiap animasi harus computable di browser** — pakai canvas 2D + JavaScript murni, hindari WebGL/Three.js
4. **Tiap animasi punya tip-box "Coba (1)…(2)…(3)…"** dengan minimal 3 skenario eksperimen yang menunjukkan trade-off konsep

#### 14.1.3 Strategi Implementasi: Audit Sebelum Copy-Paste

Saat membuat modul baru dengan template copy-paste:

**Langkah wajib (urutan kritis):**

1. **Copy file** `Modul-N.html` → `Modul-(N+1).html`
2. **Update HTML panel animasi** (judul, slider label, tip-box) ke topik baru
3. **JANGAN STOP DI SINI** — JS canvas drawing masih menggambar topik lama!
4. **Tulis ulang 4 fungsi JS canvas** (`drawPhysics`, `drawSweep`, `drawIso`, `drawHPB`) dengan visual yang cocok dengan topik baru
5. **Tulis ulang `formulas[]` array** di hero overlay agar formula yang melayang sesuai topik
6. **Test di browser**: buka modul, geser tiap slider, pastikan visual canvas berubah secara bermakna sesuai deskripsi tip-box
7. **Cross-check**: bandingkan judul HTML dengan output canvas — kalau tidak cocok, **REVERT atau perbaiki sebelum merge**

**Indikator merah di code review:**
- HTML mention "Daerah Feasibel" tapi `drawPhysics()` body masih ada `Math.sin()` untuk sinyal periodik → **MISMATCH**
- HTML mention "Gradient Descent" tapi canvas tidak menggambar contour atau trajectory → **MISMATCH**
- Function name masih `drawSignalVibrasi` di modul LP → **dead-code naming, refactor**
- Variabel internal masih `_physicsAnim.t` untuk akumulasi waktu sinyal padahal dipakai untuk fase iso-profit → boleh tetap (nama generik), tapi komentar header function harus diupdate

**Lihat juga §34 untuk strategi commit incremental yang melindungi pekerjaan animasi besar dari API timeout.**

### 14.2 Bagian 08 — Code Wrap Format

**Penting:** Gunakan struktur `code-wrap` dengan macOS-style dots (BUKAN format `cb`/`cbh`/`cbd` lama):

```html
<div class="code-wrap reveal">
  <div class="code-header">
    <div class="code-dots">
      <span style="background:#ff5f57"></span>
      <span style="background:#febc2e"></span>
      <span style="background:#28c840"></span>
    </div>
    <span class="code-label">Cell N — [Judul Cell]</span>
    <span class="code-lang">Python</span>
    <button class="code-copy" onclick="cpC(this)">📋 Copy</button>
  </div>
  <pre><span class="kw">import</span> numpy <span class="kw">as</span> np
...</pre>
</div>
```

Syntax highlighting span classes: `.kw` (keyword, violet), `.fn` (function, cyan), `.st` (string, green), `.cm` (comment, muted), `.nm` (number, amber).

**CSS spec untuk `.code-header` elements:**

```css
.code-header { padding: 10px 18px; display: flex; align-items: center; position: relative; }
.code-dots { display: flex; gap: 6px; margin-right: 18px; }  /* ← 18px wajib */
.code-dots span { width: 10px; height: 10px; border-radius: 50%; }
.code-label { position: absolute; left: 50%; transform: translateX(-50%); }  /* centered */
.code-lang { padding: 2px 10px; border-radius: 20px; }  /* "Python" badge */
.code-copy { margin-left: auto; }  /* push to right */
```

> **⚠ Penting — `margin-right:18px` pada `.code-dots`:** Tanpa margin ini, 3 titik traffic-light (merah/orange/hijau) akan menempel langsung pada badge "Python" di sebelahnya karena keduanya adalah flex sibling tanpa spacing. Jangan andalkan `gap` di parent `.code-header` karena `.code-label` di-position absolute (out of flex flow) sehingga akan terlihat tertimpa pada layar sempit. Margin 18px memberikan visual breathing room yang konsisten lintas modul.

### 14.3 Petunjuk Pengerjaan Jupyter

```html
<div class="info-box reveal">
  <strong>📓 Petunjuk Pengerjaan di Jupyter Notebook:</strong><br>
  1. Buka VS Code → terminal → <code>conda activate <env-name></code><br>
  2. Buat file: <code>topik_modul.ipynb</code><br>
  3. Salin Cell 1–4 ke notebook<br>
  4. Klik <strong>Run All</strong>
</div>
```

`<env-name>` per mata kuliah:
- Matematika 4: `matematika4`
- Getaran Mekanik: `getaran_mekanik`
- Optimalisasi & Otomasi: `optoauto`

---

## 15. Tab Tugas — Sistem Soal & Validasi

### 15.1 Struktur Scoring Universal — 50 Poin

**Skema scoring standar (berlaku untuk SEMUA mata kuliah baru):**

| Bagian | Jumlah | Poin per soal | Subtotal |
|--------|--------|---------------|----------|
| 🅐 Pilihan Ganda (MC) | 10 soal | 1 poin | **10 poin** |
| 🅑 Komputasi Easy–Medium | 10 soal | 2 poin | **20 poin** |
| 🅒 Komputasi Hard | 5 soal | 4 poin | **20 poin** |
| **Total maksimal** | **25 soal** | — | **50 poin** (= nilai 100) |

**Karakteristik tiap bagian:**

- **🅐 MC (1 poin)** — konseptual, formula recognition, interpretasi hasil. Tidak perlu coding.
- **🅑 Komputasi Easy–Medium (2 poin)** — perlu **sedikit coding** (5–15 baris). Fokus pada substitusi parameter, evaluasi formula, plotting sederhana, atau satu iterasi algoritma. Hint dan struktur kode disediakan di `comp-hint`.
- **🅒 Komputasi Hard (4 poin)** — perlu **banyak coding** (20–50+ baris). Fokus pada algoritma lengkap, multiple iterasi, optimization routine, implementasi numerik dari awal (RK4, bisection, gradient descent, FFT, dll), atau sintesis multi-konsep. **Partial credit**: jika mahasiswa submit kode (non-kosong) tapi output salah atau runtime error, tetap dapat **+1 poin usaha**. Lihat detail di §15.3e.

**Konsolasi:** 1 poin jika mahasiswa attempt ≥20 soal tapi salah semua DAN total poin = 0 (`baseIds.size >= 20 && points === 0`). Karena Hard partial credit memberi +1 poin, konsolasi otomatis tidak akan ter-trigger jika mahasiswa pernah submit Hard (meski salah).

### 15.1a Konstanta Scoring di JavaScript

```javascript
// ── SCORING CONFIG (Universal 50-poin) ──
const SCORE_CONFIG = {
  MC_COUNT:       10,     // jumlah soal Pilihan Ganda
  MC_POINT:       1,      // poin per MC
  COMP_EZ_COUNT:  10,     // jumlah soal Komputasi Easy–Medium
  COMP_EZ_POINT:  2,      // poin per Comp Easy–Medium
  COMP_HARD_COUNT: 5,     // jumlah soal Komputasi Hard
  COMP_HARD_POINT: 4,     // poin per Comp Hard
  CONSOLATION_THRESHOLD: 20,  // minimal attempt unik untuk konsolasi
  CONSOLATION_POINT:     1,   // poin konsolasi
  get MC_TOTAL()      { return this.MC_COUNT * this.MC_POINT; },           // 10
  get COMP_EZ_TOTAL() { return this.COMP_EZ_COUNT * this.COMP_EZ_POINT; }, // 20
  get COMP_HARD_TOTAL(){ return this.COMP_HARD_COUNT * this.COMP_HARD_POINT; }, // 20
  get TOTAL()         { return this.MC_TOTAL + this.COMP_EZ_TOTAL + this.COMP_HARD_TOTAL; } // 50
};
```

**Helper konversi poin → nilai (0–100):**
```javascript
function pointsToScore(pts) {
  return Math.round((pts || 0) / SCORE_CONFIG.TOTAL * 100);
}
```

Semua tempat yang menghitung nilai HARUS pakai helper ini, jangan hardcode pembagi:

```javascript
// ✅ BENAR
const nilai = pointsToScore(v.points);

// ❌ SALAH — hardcoded denominator
const nilai = Math.round(v.points / 50 * 100);
```

### 15.1b Varian Scoring untuk Mata Kuliah Lama (Legacy)

Modul yang sudah di-deploy dengan skema lama **tidak perlu di-refactor** — mereka tetap bekerja dengan denominator lama sendiri-sendiri. Gunakan tabel ini sebagai referensi legacy:

| Varian | MC × poin | Comp × poin | Comp Hard | Total | Konsolasi threshold | Mata Kuliah |
|--------|-----------|-------------|-----------|-------|---------------------|-------------|
| **50-poin (Universal, BARU)** | 10 × 1 | 10 × 2 | 5 × 4 | **50** | ≥20 | Semua modul baru |
| 30-poin (Legacy) | 10 × 1 | 10 × 2 | — | 30 | ≥20 | Matematika 4 (Modul-1..N lama), Optoauto |
| 25-poin (Legacy) | 5 × 1 | 10 × 2 | — | 25 | ≥15 | Getaran Mekanik Modul-4 |

> **⚠ Firebase Rules adjustment:** Firebase `points.validate` perlu dinaikkan ke **`<= 50`** untuk mendukung skema baru. Jika masih ada modul legacy 25/30-poin aktif di DB yang sama, pakai `<= 50` saja — itu tetap valid untuk total yang lebih rendah.

### 15.1c Score Bar — Layout Konsolidasi (Tombol Export Tunggal)

> **Update v12 (April 2026):** Panel tombol Export di bagian bawah halaman Tugas dihapus. Hanya satu tombol Export tersisa di score-bar (sticky) bersama informasi cara submit + indikator soal kosong (`#export-blocked-msg`). Sebelumnya ada dua tombol (`btn-score-export` di atas + `btn-export-tugas` di bawah) yang membingungkan dan membuat indikator soal kosong tidak terlihat sebelum mahasiswa scroll ke paling bawah.

Score bar harus menampilkan **tiga sub-total** breakdown dan **satu tombol Export HTML**. Baris kedua (full-width) berisi petunjuk submit + indikator kelengkapan agar selalu terlihat saat sticky.

```html
<div class="score-bar">
  <!-- Baris 1: nilai + breakdown + tombol export -->
  <div class="score-num" id="scoreDisplay">0</div>
  <div class="score-info">
    <div class="score-title">Skor Sementara</div>
    <div id="scoreDetail">0 / 50 poin</div>
    <div class="score-progress"><div class="score-fill" id="scoreFill"></div></div>
  </div>
  <div style="font-family:monospace;font-size:11px;text-align:right">
    <div>PG: <span id="scoreMC" style="color:var(--cyan)">0</span>/10 poin</div>
    <div>Komp E/M: <span id="scoreCompEz" style="color:var(--amber)">0</span>/20 poin</div>
    <div>Komp Hard: <span id="scoreCompHard" style="color:var(--pink)">0</span>/20 poin</div>
  </div>
  <button class="btn-export" id="btn-score-export"
          onclick="exportTugasHtml()" disabled
          style="opacity:.4;cursor:not-allowed;font-size:11px">📄 Export HTML</button>

  <!-- Baris 2: petunjuk submit + indikator soal kosong (full-width) -->
  <div style="flex-basis:100%;border-top:1px solid var(--border);padding-top:14px;margin-top:4px;display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap">
    <span style="font-size:18px;flex-shrink:0;line-height:1.4">📤</span>
    <div style="flex:1;min-width:240px;font-size:13px;color:var(--muted);line-height:1.55">
      Isi semua jawaban dan link Google Drive, lalu klik
      <strong style="color:var(--violet)">📄 Export HTML</strong> di atas
      untuk mengunduh file HTML pengumpulan tugas.
    </div>
    <div id="export-blocked-msg"
         style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--amber);text-align:center;flex-basis:100%"></div>
  </div>
</div>
```

**Aturan:**
- Hanya satu tombol Export di seluruh halaman Tugas. **Jangan** buat panel tombol Export terpisah di bagian bawah halaman.
- `#export-blocked-msg` harus berada di dalam score-bar (bukan di section lain) agar selalu terlihat — score-bar bersifat sticky.
- `text-align:center` untuk pesan indikator agar simetris ketika menampilkan list soal yang belum diisi.
- Update denominator `/50` di-substitusikan dari `SCORE_CONFIG.TOTAL` agar konsisten jika di masa depan struktur berubah.

**`checkExportReady()` — referensi tombol tunggal:**
```javascript
function checkExportReady() {
  const btnTop = document.getElementById('btn-score-export');
  const msgEl  = document.getElementById('export-blocked-msg');
  // ... validasi semua jawaban + link ...
  _setBtnState(btnTop, allDone);   // hanya 1 tombol — JANGAN add btnBottom
  // ...
}
```

### 15.2 Soal Pilihan Ganda (MC) — 1 poin

```html
<div class="mc-card reveal">
  <div class="mc-header">
    <div class="mc-num">01</div>
    <div class="mc-q">Pertanyaan...</div>
    <div class="mc-pts">1 poin</div>
  </div>
  <div class="radio-group" id="rg-mc1">
    <div class="radio-option" onclick="selectMC('mc1', this, false)">
      <div class="radio-circle"></div>(A) Pilihan A
    </div>
    <div class="radio-option" onclick="selectMC('mc1', this, true)">
      <div class="radio-circle"></div>(B) Pilihan B (BENAR)
    </div>
    <!-- ... -->
  </div>
  <button class="mc-submit" id="sub-mc1" onclick="checkMC('mc1')" disabled>Periksa Jawaban</button>
  <div class="feedback" id="fb-mc1"></div>
</div>
```

> **CATATAN PENTING:** Jangan tulis teks penjelasan jawaban / tanda `✓` di dalam `radio-option` — itu membocorkan jawaban. Letakkan penjelasan di feedback yang muncul setelah submit.

### 15.3 Soal Komputasi Easy–Medium (2 poin)

Ditulis dengan class `.comp-card.comp-easy` (atau tanpa modifier, default). Hint berisi kerangka kode ≤ 15 baris.

```html
<div class="q-section">
  <div class="q-type-badge badge-comp-ez">🅑 BAGIAN B — Komputasi Easy–Medium · 10 Soal · @2 Poin</div>

  <div class="comp-card reveal">
    <div class="comp-header">
      <div class="comp-num">C1</div>
      <div class="comp-q">Hitung nilai <code>f(x)</code> pada titik x = ... menggunakan substitusi langsung.</div>
      <div class="comp-pts">2 poin</div>
    </div>
    <div class="comp-hint">💡 <code>import numpy as np; x = 2.5; result = ...; print(result)</code></div>
    <div class="comp-code-wrap">
      <div class="input-label"><span class="col-badge">Python</span> Kode Jupyter</div>
      <textarea class="code-textarea" id="code-c1" oninput="onCodeInput('c1')"></textarea>
      <div class="stdout-box" id="stdout-c1"></div>
    </div>
    <button class="comp-submit run-btn" id="sub-c1"
            onclick="runAndCheck('c1', expectedAnswer, tolerance, 'easy')">▶ Run &amp; Validasi</button>
    <div class="feedback" id="fb-c1"></div>
  </div>
  <!-- C2..C10 -->
</div>
```

### 15.3a Soal Komputasi Hard (4 poin + 1 partial)

Ditulis dengan class `.comp-card.comp-hard`. Hint **lebih minimal** — mahasiswa diharapkan mengimplementasikan algoritma dari awal.

**Skema poin:**

| Hasil | Poin | Tombol | Feedback | Firebase Marker |
|-------|:----:|:------:|:--------:|:---------------:|
| **Jawaban benar** | **+4** | `✓ Selesai` (hijau) | `feedback correct` | `c<N>_comp` |
| **Jawaban salah** (kode filled + numerik beda dari expected) | **+1** | `△ Usaha` (kuning) | `feedback warn` | `c<N>_comp_partial` |
| **Runtime error** (kode error saat dijalankan) | **+1** | `△ Usaha` (kuning) | `feedback warn` | `c<N>_comp_partial` |
| **Kode kosong** | 0 | (warning, tidak locked) | `feedback warn` | — (belum ada attempt) |

**Kenapa +1 partial untuk Hard?** Soal Hard butuh 20–50+ baris kode. Mahasiswa yang sudah investasi waktu signifikan untuk menulis algoritma tapi kode-nya ada bug tetap mendapat reward atas upaya — ini juga sesuai prinsip **growth mindset**. Easy–Medium tidak dapat partial karena hint-nya lengkap dan expected scaffold jelas.

**Anti-gaming:** 1 poin hanya 2% dari nilai total (50 poin). Tidak sepadan dengan submit trivial kode seperti `print(0)`. Mahasiswa tetap terdorong untuk mencari jawaban benar untuk mendapat full +4 poin.

**HTML structure:**

```html
<div class="q-section">
  <div class="q-type-badge badge-comp-hard">🅒 BAGIAN C — Komputasi Hard · 5 Soal · @4 Poin · Algoritma Lengkap</div>

  <div class="comp-card comp-hard reveal">
    <div class="comp-header">
      <div class="comp-num">C11</div>
      <div class="comp-q">Implementasikan metode Runge-Kutta 4 untuk menyelesaikan PD <code>y' = f(x,y)</code> dari x=0 ke x=2, step 0.01, dan laporkan y(2).</div>
      <div class="comp-pts">4 poin</div>
    </div>
    <div class="comp-hint">💡 Kerangka: fungsi <code>rk4_step(f, x, y, h)</code> yang mengembalikan y_next, lalu loop dari x0 ke xf.</div>
    <div class="comp-code-wrap">
      <div class="input-label"><span class="col-badge" style="background:var(--pink)">Python — Hard</span> Kode Jupyter (20–50 baris)</div>
      <textarea class="code-textarea" id="code-c11" rows="12" oninput="onCodeInput('c11')"></textarea>
      <div class="stdout-box" id="stdout-c11"></div>
    </div>
    <button class="comp-submit run-btn" id="sub-c11"
            onclick="runAndCheck('c11', expectedAnswer, tolerance, 'hard')">▶ Run &amp; Validasi</button>
    <div class="feedback" id="fb-c11"></div>
  </div>
  <!-- C12..C15 -->
</div>
```

**CSS badge class:**
```css
.badge-mc        { background:rgba(14,165,233,.1); border:1px solid rgba(14,165,233,.25); color:var(--cyan); }
.badge-comp-ez   { background:rgba(249,115,22,.1); border:1px solid rgba(249,115,22,.25); color:var(--amber); }
.badge-comp-hard { background:rgba(236,72,153,.1); border:1px solid rgba(236,72,153,.28); color:var(--pink); }

/* Komputasi Hard — visual differentiation */
.comp-card.comp-hard { border-left:4px solid var(--pink); background:linear-gradient(90deg,rgba(236,72,153,.03),var(--surface) 40%); }
.comp-card.comp-hard .comp-num { background:rgba(236,72,153,.12); border-color:rgba(236,72,153,.3); color:var(--pink); }
.comp-card.comp-hard .comp-pts { background:rgba(236,72,153,.12); border-color:rgba(236,72,153,.3); color:var(--pink); font-weight:700; }
```

**Helper `_isHardComp()` — deteksi difficulty dari qId:**

Karena marker Firebase pakai `_comp` untuk keduanya (Easy dan Hard correct), kita butuh helper untuk deteksi apakah suatu soal termasuk Hard saat restore state dari Firebase. Konvensi: soal `c11..c15` adalah Hard.

```javascript
window._isHardComp = function(qId) {
  const m = /^c(\d+)$/.exec(qId);
  return m && parseInt(m[1], 10) >= 11 && parseInt(m[1], 10) <= 15;
};
```

### 15.3b Fungsi `runAndCheck` — Dinamis per Difficulty

```javascript
async function runAndCheck(qId, expected, tolerance, difficulty){
  if (!_isScheduleOpen()) { _showScheduleClosedInfo(qId); return; }

  const pyodide = await loadPyodide();   // singleton
  const code = document.getElementById('code-' + qId).value;
  let stdout = '';
  pyodide.setStdout({ batched: (s) => { stdout += s; } });

  try {
    await pyodide.runPythonAsync(code);
  } catch (err) {
    // Runtime error — Hard tetap dapat +1 poin usaha
    const partial = (difficulty === 'hard') ? 1 : 0;
    const msg = partial > 0
      ? `🔒 Kode error — soal dikunci. +${partial} poin untuk upaya Hard.`
      : '🔒 Kode error — soal dikunci. Tidak ada kesempatan ulang.';
    _lockCompWrong(qId, msg, partial);
    return;
  }

  const nums = [...stdout.matchAll(/[-+]?\d*\.?\d+([eE][-+]?\d+)?/g)].map(m => parseFloat(m[0]));
  const ok = nums.some(n => Math.abs(n - expected) <= tolerance);

  if (ok) {
    const point = (difficulty === 'hard')
      ? SCORE_CONFIG.COMP_HARD_POINT     // 4
      : SCORE_CONFIG.COMP_EZ_POINT;      // 2
    _awardCompPoint(qId, point);
  } else {
    // Output salah — Hard tetap dapat +1 poin usaha
    const partial = (difficulty === 'hard') ? 1 : 0;
    const msg = partial > 0
      ? `🔒 Output tidak benar (≈ ${expected}). Soal dikunci. +${partial} poin untuk upaya Hard.`
      : `🔒 Output tidak benar (≈ ${expected}). Soal dikunci.`;
    _lockCompWrong(qId, msg, partial);
  }
}
```

Signature `_lockCompWrong(qId, fbMsg, partialPoint)` — parameter ke-3 opsional. Jika `partialPoint > 0`:
- UI: tombol `△ Usaha` (amber), textarea amber tint, feedback class `warn`
- Firebase: tulis marker `_comp_partial` + tambah `partialPoint` ke `points`

Jika `partialPoint === 0` (default, untuk Easy/Medium):
- UI: tombol `✗ Terkunci` (pink), textarea red tint, feedback class `wrong`
- Firebase: tulis marker `_comp_used` saja (tanpa poin)

### 15.3c `_awardCompPoint` — Update Firebase

```javascript
async function _awardCompPoint(qId, point){
  const me = getIdentity();
  if (!me || me.role === 'dosen') return;
  const key = sanitizeKey(`mhs_${me.nim}`);
  const snap = await get(ref(db, `${DB_PATH}/${key}`));
  const ex = snap.val() || {};
  const scored = JSON.parse(ex.scoredQuestions || '[]');
  if (scored.includes(qId)) return;   // sudah pernah dapat poin untuk soal ini

  scored.push(qId);
  const newPoints = Math.min(
    (ex.points || 0) + point,
    SCORE_CONFIG.TOTAL      // cap di total maksimal
  );
  await set(ref(db, `${DB_PATH}/${key}`), {
    ...ex,
    points: newPoints,
    pointTimestamp: new Date().toISOString(),
    scoredQuestions: JSON.stringify(scored)
  });
  updateScoreDisplay();
}
```

### 15.3d Export HTML — Template dengan 3 Bagian

Template export harus include breakdown 3 sub-score:

```javascript
function exportTugasHtml(){
  const me = getIdentity();
  const mc   = _getMcScore();      // 0..10
  const ezE  = _getCompEzScore();  // 0..20
  const hdE  = _getCompHardScore();// 0..20
  const tot  = mc + ezE + hdE;
  const nilai = pointsToScore(tot);

  const html = `
  <div style="font-family:sans-serif;padding:24px;max-width:800px;margin:0 auto;">
    <h2>Tugas ${MODULE_LABEL} — ${COURSE_LABEL}</h2>
    <p><strong>${me.nama}</strong> — ${me.nim}</p>
    <table style="border-collapse:collapse;width:100%;">
      <tr><td>Pilihan Ganda (10 × 1)</td><td style="text-align:right"><strong>${mc}/10</strong></td></tr>
      <tr><td>Komputasi Easy–Medium (10 × 2)</td><td style="text-align:right"><strong>${ezE}/20</strong></td></tr>
      <tr><td>Komputasi Hard (5 × 4)</td><td style="text-align:right"><strong>${hdE}/20</strong></td></tr>
      <tr style="border-top:2px solid #333;"><td><strong>Total</strong></td><td style="text-align:right"><strong>${tot}/50 (Nilai: ${nilai})</strong></td></tr>
    </table>
    <!-- detail jawaban mahasiswa per soal -->
  </div>`;
  downloadHtml(html, `Tugas-${MODULE_LABEL}-${me.nim}.html`);
}
```

#### Konvensi Nama Mata Kuliah di Export HTML (BARU v12)

> **Lesson learned (April 2026):** Saat membuat modul baru dengan menyalin file modul dari mata kuliah lain (mis. Optoauto-Modul-5 disalin dari Getaran-Mekanik-Modul-5), seringkali subtitle cover dan filename download tidak ikut diupdate, sehingga export HTML mahasiswa Optoauto bertuliskan `Getaran Mekanik` di subtitle dan filename `Tugas4_<NIM>_GetaranMekanik.html` (juga nomor tugas-nya salah, "Tugas4" untuk semua modul). Bug ini ditemukan di 5 modul Optoauto.

**Aturan:**
1. **Subtitle cover** (`<p class="sub">...`) harus pakai nama mata kuliah modul itu sendiri — bukan nama course asal saat copy:
   ```html
   <!-- Optimalisasi & Automasi -->
   <p class="sub">Optimalisasi &amp; Automasi · S1 Teknik Mesin · Universitas Mercu Buana · 2025/2026 · Dosen: Dedik Romahadi</p>
   <!-- Getaran Mekanik -->
   <p class="sub">Getaran Mekanik · S1 Teknik Mesin · Universitas Mercu Buana · 2025/2026 · Dosen: Dedik Romahadi</p>
   <!-- Matematika 4 / Engineering Mathematics -->
   <p class="sub">Matematika 4 · S1 Teknik Mesin · Universitas Mercu Buana · 2025/2026 · Dosen: Dedik Romahadi</p>
   ```

2. **Filename download** harus konsisten format: `Tugas{N}_{NIM}_{CourseSlug}.html`
   - `{N}` = nomor modul aktual (jangan hardcoded `Tugas4` untuk semua modul)
   - `{CourseSlug}` (PascalCase tanpa spasi):
     - Optimalisasi & Automasi → `OptimalisasiAutomasi`
     - Getaran Mekanik → `GetaranMekanik`
     - Matematika 4 → `Matematika4`
   ```javascript
   a.download = 'Tugas' + MODULE_NUMBER + '_' + nim + '_' + COURSE_SLUG + '.html';
   ```

**Audit cara cepat saat membuat modul baru dengan copy-paste:**
```bash
grep -n 'class="sub">\|a.download\b' Modul-N.html
# Pastikan hasilnya sesuai dengan course + nomor modul saat ini, bukan course asal.
```

### 15.3e Partial Credit — Comp Hard Salah Dapat +1 Poin

**Filosofi:** Soal Hard butuh 20–50+ baris kode. Wajar jika mahasiswa stuck di debug atau algoritma tidak konvergen. Partial credit memberi reward atas upaya yang signifikan (bukan asal submit) tanpa merusak diferensiasi poin penuh.

**Aturan:**

| Kondisi | Easy/Medium | Hard |
|---------|:-----------:|:----:|
| Kode kosong + klik Submit | 0 (warning, tidak locked) | 0 (warning, tidak locked) |
| Kode ada + runtime error | 0 (terkunci) | **+1** (terkunci) |
| Kode ada + output salah | 0 (terkunci) | **+1** (terkunci) |
| Kode ada + output benar | +2 (terkunci) | +4 (terkunci) |

**Anti-gaming:** Bar untuk partial credit memang rendah (hanya kode non-kosong + submit), tapi:
- 1 poin = 2% nilai total (50 poin). Tidak sebanding dengan gaming serius.
- Tombol langsung di-disable setelah 1× submit — tidak bisa edit + retry untuk 4 poin.
- Tetap perlu kode valid (meski tidak perfect) yang Python mau parse sampai runtime.

**Tiga Marker Firebase:** Sistem sekarang punya 3 marker berbeda untuk status comp:

| Marker | Arti | Poin | UI Restore |
|--------|------|:----:|------------|
| `c<N>_comp` | Benar | 4 (Hard) / 2 (Easy) | `✓ Selesai` hijau |
| `c<N>_comp_partial` | Hard salah (partial credit) | 1 | `△ Usaha` amber |
| `c<N>_comp_used` | Easy/Medium salah | 0 | `✗ Terkunci` pink |

**Helper deteksi Hard:**
```javascript
window._isHardComp = function(qId) {
  const m = /^c(\d+)$/.exec(qId);
  return m && parseInt(m[1], 10) >= 11 && parseInt(m[1], 10) <= 15;
};
```

**Firebase function baru `_awardCompPartial`:**
```javascript
window._awardCompPartial = function(qId, point) {
  const pts = (typeof point === 'number' && point > 0) ? point : 1;
  const partialKey = qId + '_comp_partial';   // marker berbeda dari _comp
  if (_answeredQ.has(partialKey)) return;

  const me = getIdentity();
  if (!me || !me.nim || me.role === 'dosen') return;
  
  // Schedule check: kalau di luar jadwal, skip + log warning (lihat §15.4d)
  if (!_isScheduleOpen()) {
    console.warn('[Score] Partial credit tidak tersimpan: jadwal belum dibuka.');
    return;
  }
  
  const key = sanitizeKey('mhs_' + me.nim);
  const nodeRef = ref(db, DB_PATH + '/' + key);

  get(nodeRef).then(snap => {
    let ex;
    if (!snap.exists()) {
      // Auto-create record on-demand (lihat §15.4e — anti race-condition)
      console.warn('[Score] Visitor record missing — creating now (Partial)');
      ex = {
        nama: me.nama || '—', nim: me.nim, role: 'student',
        timestamp: me.timestamp || new Date().toISOString(),
        lastVisit: new Date().toISOString(),
        visitCount: 1,
        points: 0,           // ← WAJIB init (lihat §13.4.1)
        scoredQuestions: ''  // ← WAJIB init
      };
    } else {
      ex = snap.val();
    }
    const scored = (ex.scoredQuestions || '').split(',').filter(Boolean);
    if (scored.includes(partialKey)) { _answeredQ.add(partialKey); return; }
    _answeredQ.add(partialKey); scored.push(partialKey);
    const newPoints = Math.min((ex.points||0) + pts, SCORE_CONFIG.TOTAL);
    const updated = Object.assign({}, ex, {
      points: newPoints,
      pointTimestamp: new Date().toISOString(),
      scoredQuestions: scored.join(',')
    });
    set(nodeRef, updated).catch(err => console.error('[Score] Partial save failed:', err));
    // Tidak trigger konsolasi — poin sudah > 0
  }).catch(err => console.error('[Score] _awardCompPartial failed:', err));
};
```

### 15.4d Schedule Warning Toast (Pedoman v5)

Saat `_isScheduleOpen()` returns false di `_awardPoint`/`_awardCompPoint`, mahasiswa harus dapat **visible feedback** kenapa jawaban tidak tersimpan — jangan silent fail. Gunakan toast merah dengan **dedupe 30 detik** agar tidak spam:

```javascript
if (!_isScheduleOpen()) {
  console.warn('[Score] Tidak tersimpan: jadwal belum dibuka oleh dosen.');
  if (!window._scheduleWarnShown) {
    window._scheduleWarnShown = true;
    setTimeout(() => { window._scheduleWarnShown = false; }, 30000);  // re-allow tiap 30s
    // ... show red toast: "⚠ Jadwal pertemuan belum diset oleh dosen — jawaban Anda tidak akan tersimpan."
  }
  return;
}
```

### 15.4e Auto-create Record on Missing Snapshot (Pedoman v5)

`if (!snap.exists()) return;` di `_awardPoint` dst adalah **silent failure** yang menyebabkan poin hilang saat race condition (login → answer terlalu cepat sebelum visitor record committed). 

**WAJIB pattern** untuk semua 5 award/record functions (`_awardPoint`, `_awardCompPoint`, `_awardCompPartial`, `_recordMcAttempt`, `_recordCompAttempt`):

```javascript
get(nodeRef).then(snap => {
  let ex;
  if (!snap.exists()) {
    console.warn('[Score] Visitor record missing — creating now');
    ex = {
      nama: me.nama || '—', nim: me.nim, role: 'student',
      timestamp: me.timestamp || new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      visitCount: 1,
      points: 0,           // ← WAJIB
      scoredQuestions: ''  // ← WAJIB
    };
  } else {
    ex = snap.val();
  }
  // ... lanjut update points/scoredQuestions
  set(nodeRef, updated).catch(err => console.error('[Score] save failed:', err));
}).catch(err => console.error('[Score] get failed:', err));
```

**JANGAN PERNAH** pakai `.catch(()=>{})` (silent error) — selalu pakai `console.error('[Score] <fn> failed:', err)` untuk mempermudah debug.

**Restore setelah refresh** — `_loadScoredQuestions` perlu handle 3 marker:

```javascript
scored.forEach(qId => {
  _answeredQ.add(qId);

  // ── Comp benar (both Easy dan Hard) ──
  if (qId.endsWith('_comp')) {
    const baseId = qId.replace('_comp', '');
    const restoredPts = window._isHardComp(baseId)
      ? SCORE_CONFIG.COMP_HARD_POINT      // 4 untuk C11–C15
      : SCORE_CONFIG.COMP_EZ_POINT;       // 2 untuk C1–C10
    compAnswered[baseId] = true;
    compScores[baseId]   = restoredPts;
    // ... UI: tombol ✓ Selesai (hijau)
  }

  // ── Comp partial (Hard salah — NEW) ──
  if (qId.endsWith('_comp_partial')) {
    const baseId = qId.replace('_comp_partial', '');
    compAnswered[baseId] = true;
    compScores[baseId]   = 1;
    // ... UI: tombol △ Usaha (amber), feedback class 'warn'
  }

  // ── Comp salah / error (Easy/Medium atau fallback) ──
  if (qId.endsWith('_comp_used')) {
    const baseId = qId.replace('_comp_used', '');
    compAnswered[baseId] = true;
    compScores[baseId]   = 0;
    // ... UI: tombol ✗ Terkunci (pink)
  }
});
```

**Interaksi dengan Konsolasi:**

Konsolasi hanya ter-trigger jika `points === 0 && baseIds.size >= 25`. Karena:
- Hard partial memberi +1 poin → `points >= 1` → konsolasi SKIP
- Jika mahasiswa tidak pernah attempt Hard (hanya MC+EZ salah semua) → `points === 0` → konsolasi fire normal

Jadi partial credit dan konsolasi **tidak berkonflik** — mereka saling eksklusif berdasarkan apakah mahasiswa pernah submit Hard.

**Edge cases:**

| Kasus | Behavior |
|-------|----------|
| Mahasiswa refresh setelah partial → buka soal lagi | Tombol `△ Usaha`, textarea disabled, tidak bisa retry |
| Mahasiswa buka soal Hard via DevTools + paste Firebase marker `_comp` fake | Rules tolak karena delta > 4 (jika points lonjak) + `_answeredQ` set prevent re-award |
| Dua browser tab buka soal sama | Marker pertama yang write berhasil, kedua ter-reject karena `scored.includes(partialKey)` |
| Mahasiswa submit kode kosong | Warning "Tulis kode Python terlebih dahulu", tidak locked, tidak dapat poin |

---

## 16. Tab Forum — Diskusi & Export

### 16.1 Struktur

1. **Skenario Kasus Industri** — narasi singkat + 4 parameter penting + canvas visualisasi
2. **3 Pertanyaan Diskusi** — masing-masing dengan textarea (min 30 kata) + Quick Check poll opsional
3. **Export HTML** — copy ke clipboard untuk paste ke LMS

### 16.2 Quick Check Poll

```html
<div class="poll">
  <div class="poll-q">QUICK CHECK — Pertanyaan singkat?</div>
  <div class="poll-opts" id="fp1">
    <div class="p-opt" onclick="voteForum(1, this, false)">
      <div class="p-circle"></div>Pilihan A salah
    </div>
    <div class="p-opt" onclick="voteForum(1, this, true)">
      <div class="p-circle"></div>Pilihan B benar ✓
    </div>
  </div>
  <div class="p-fb r" id="fp1r">✅ Feedback benar</div>
  <div class="p-fb w" id="fp1w">❌ Feedback salah</div>
</div>
```

### 16.3 Export HTML Forum (3-tier Copy Fallback — Pedoman v5)

`copyForumHtml()` membangun string HTML dari template, copy ke clipboard. Format:
- Header dengan info mahasiswa (nama, NIM, tanggal)
- Skenario card
- 3 jawaban diskusi dengan styling per-warna
- Footer dengan branding mata kuliah

**WAJIB pakai 3-tier fallback** karena browser modern memiliki banyak edge case yang bisa memblok clipboard API (HTTP context, iframe sandbox, restricted permission, mobile Safari/Chrome quirks, dst). Silent failure tanpa fallback menyebabkan mahasiswa frustrasi dan melapor "tombol copy tidak berfungsi".

**Lesson learned #1 (Apr 2026, v9):** Tier 3 versi awal pakai **popup window** — ternyata sering di-block oleh browser mobile dan ad-blocker, sehingga mahasiswa **tidak melihat HTML sama sekali**. Pattern v9 ganti Tier 3 ke **always-visible inline textarea** yang muncul di bawah tombol Copy: tidak butuh popup, selalu visible, dan mahasiswa bisa Ctrl+C manual sebagai pengaman terakhir.

**Lesson learned #2 (Apr 2026, v10):** Setelah pattern v9 deployed, mahasiswa **masih lapor button copy tidak berfungsi**. Investigasi: di beberapa environment user (cache lama, mobile browser quirk, browser extension yang block onclick handler, dst.), klik tombol Copy **tidak pernah memicu** `copyForumHtml()` sama sekali. Akibatnya `_populateForumOutput()` juga tidak terpanggil → textarea tetap kosong. **Single point of failure**: seluruh fallback chain bergantung pada button click yang ter-eksekusi. Pattern v10 hilangkan dependency ini: textarea **auto-populate sambil user mengetik** (di `checkForumReady`), sehingga HTML tersedia bahkan jika tombol Copy total tidak bisa di-klik. Fix ini di-apply ke 5 modul (Modul-1 s/d Modul-5 Getaran Mekanik).

#### v10 — Auto-populate di checkForumReady (button-independent)

```javascript
function checkForumReady() {
  const ids = ['ans-fq1', 'ans-fq2', 'ans-fq3'];
  const btn = document.getElementById('btn-copy-forum');

  let allFilled = true;
  // ... existing word count check (set wc-fq* indicator + allFilled flag) ...

  if (!btn) return;
  _setBtnState(btn, allFilled);  // PEDOMAN §15.4b
  _saveDraft();                   // PEDOMAN §15.4

  // ── KEY ADDITION v10: auto-populate textarea sambil user mengetik ──
  // Ini menghilangkan dependency pada button click. Walau tombol Copy
  // tidak responsif (cache / browser quirk / extension), HTML tetap
  // tersedia di textarea bawah, mahasiswa Ctrl+C manual.
  if (allFilled) {
    try {
      const _autoHtml = buildForumHtml();
      if (_autoHtml && _autoHtml.length > 100) {
        _populateForumOutput(_autoHtml);  // textarea visible & populated
      }
    } catch(e) { /* identity belum ada / textarea belum ready — silent */ }
  }
}
```

**UX message v10** — banner di atas textarea menggeser fokus dari "backup" → "primary method":

```
✅ HTML Siap di Bawah — Salin Manual                  (was: 💡 Backup Manual Copy)

Cara salin (3 langkah):
1) Klik "🔍 Pilih Semua" di bawah kotak HTML
2) Tekan Ctrl+C (atau Cmd+C di Mac)
3) Paste di Fast Learning > mode HTML

Tombol Copy di atas adalah opsional — jika tidak berfungsi, gunakan cara manual ini.
```

#### HTML Component (always-rendered, hidden by default, visible setelah klik Copy)

```html
<!-- Below the existing copy button + msg div -->
<div id="forum-html-output" style="display:none;margin-top:18px;text-align:left">
  <div style="background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.3);border-radius:10px;padding:14px 16px;margin-bottom:10px">
    <span style="font-size:14px;font-weight:700;color:var(--violet)">💡 Backup Manual Copy</span>
    <span style="font-size:11px;color:var(--muted)">Jika auto-copy gagal, salin manual dari kotak di bawah</span>
    <!-- Step-by-step instruksi: 1) Pilih Semua  2) Ctrl+C  3) Paste di Fast Learning -->
  </div>
  <textarea id="forum-html-textarea" readonly 
    style="width:100%;height:140px;font-family:monospace;font-size:11px;background:#0a1224;color:#e2e8f0;padding:12px 14px;border-radius:10px;resize:vertical"></textarea>
  <button onclick="selectForumHtmlAll()">🔍 Pilih Semua</button>
  <button onclick="copyForumHtmlManual()">📋 Copy Lagi</button>
</div>
```

#### JavaScript — 3-tier fallback dengan textarea-as-tier-3

```javascript
function copyForumHtml() {
  // ... validasi word count dulu (FORUM_MIN_WORDS = 30) ...
  
  let htmlCode;
  try { 
    htmlCode = buildForumHtml(); 
  } catch(err) {
    console.error('[Forum] buildForumHtml failed:', err);
    if (msg) msg.textContent = '❌ Gagal generate HTML: ' + err.message;
    return;
  }

  // ── KEY CHANGE v9: ALWAYS populate output textarea SEBELUM clipboard attempt ──
  // Ini guarantee mahasiswa selalu punya akses ke HTML, bahkan jika auto-copy diam-diam gagal
  _populateForumOutput(htmlCode);

  // ── TIER 1: Modern Clipboard API (HTTPS + secure context) ──
  if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
    navigator.clipboard.writeText(htmlCode)
      .then(() => _showCopySuccess(btn, msg))
      .catch(err => {
        console.warn('[Forum] Clipboard API failed, trying fallback:', err);
        fallbackCopy(htmlCode, btn, msg);
      });
  } else {
    fallbackCopy(htmlCode, btn, msg);
  }
}

// ── TIER 3 (NEW): Always-visible HTML output area ──
function _populateForumOutput(htmlCode) {
  const out = document.getElementById('forum-html-output');
  const ta  = document.getElementById('forum-html-textarea');
  if (out && ta) {
    ta.value = htmlCode;
    out.style.display = 'block';
    setTimeout(() => { 
      try { out.scrollIntoView({behavior:'smooth', block:'nearest'}); } catch(e){} 
    }, 100);
  }
}

function selectForumHtmlAll() {
  const ta = document.getElementById('forum-html-textarea');
  if (!ta || !ta.value) return;
  ta.focus();
  ta.select();
  ta.setSelectionRange(0, ta.value.length);
}

function copyForumHtmlManual() {
  const ta = document.getElementById('forum-html-textarea');
  if (!ta || !ta.value) return;
  selectForumHtmlAll();
  // Try modern API again (sering kerja saat tombol manual diklik karena fresh user gesture)
  if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
    navigator.clipboard.writeText(ta.value).catch(() => _execCopyFallback(ta, msg));
  } else {
    _execCopyFallback(ta, msg);
  }
}

// fallbackCopy() Tier 2 = execCommand (sama seperti versi sebelumnya)
// — tapi setelah Tier 2 gagal, tidak buka popup; cukup tampilkan instruksi:
//   "⚠ Auto-copy diblokir. Gunakan Ctrl+C (Cmd+C di Mac) untuk salin manual."
// Mahasiswa tinggal lihat textarea di forum-html-output, klik Pilih Semua, lalu Ctrl+C.

window._populateForumOutput = _populateForumOutput;
window.selectForumHtmlAll  = selectForumHtmlAll;
window.copyForumHtmlManual = copyForumHtmlManual;
```

**Helper `_showCopySuccess(btn, msg)`** — UI feedback konsisten saat sukses (di tier mana pun): tombol berubah jadi "✅ Tersalin!" 3 detik, message hijau dengan instruksi paste. Output area tetap visible setelah sukses (mahasiswa bisa pakai sebagai backup jika clipboard ke-clobber sebelum mereka paste).

**Audit checklist sebelum deploy (v9):**
1. ✅ `window.isSecureContext` di-check sebelum tier 1
2. ✅ `_populateForumOutput(htmlCode)` dipanggil **sebelum** clipboard attempt (Tier 3 always-ready)
3. ✅ `<div id="forum-html-output">` ada di DOM (default `display:none`)
4. ✅ 4 helper functions terdaftar di `window.*` (untuk inline onclick): `_populateForumOutput`, `selectForumHtmlAll`, `copyForumHtmlManual`, `_execCopyFallback`
5. ✅ Semua catch blocks pakai `console.error('[Forum] ...')` (jangan silent)
6. ✅ `buildForumHtml()` dibungkus try/catch untuk safety
7. ✅ End-to-end test: fill 3 textarea (≥30 kata) → click → output area visible + textarea populated + auto-scroll

---

## 17. Tab Hasil — Aktivitas & Stats

### 17.1 Struktur

```
┌─────────────────────────────────────────┐
│ Hero: data-tab="hasil"                  │
├─────────────────────────────────────────┤
│ Schedule Info Box (kalau ada jadwal)    │
├─────────────────────────────────────────┤
│ ┌─────────┬─────────┐  Top Skor & Top Akses (2 kolom)
│ │Top Skor │Top Akses│  Format: "25 (83)" = poin (nilai 0-100)
│ └─────────┴─────────┘
├─────────────────────────────────────────┤
│ ┌────┬────┬────┐                        │
│ │👥  │✅  │❌  │  Stats (3 kolom)       │
│ │Tot │Hdr │Abs │                        │
│ └────┴────┴────┘                        │
├─────────────────────────────────────────┤
│ Header: No, Nama, NIM, Status,          │
│         Poin (Nilai), Kunjungan, Waktu  │
├─────────────────────────────────────────┤
│ Visitor Table Body (semua mahasiswa)    │
│ - Status badge per row                  │
│ - Color-coded                           │
└─────────────────────────────────────────┘
```

### 17.2 Stats Calculation

```javascript
const totalMhs = masterStudents.length;
let hadir = 0, absen = 0;

for (const s of masterStudents) {
  const v = visitMap[s.nim];
  const hasP = v && ((v.points || 0) > 0);
  if (hasP) {
    hadir++;
  } else if (schedExpired) {
    absen++;   // Bolos = tidak punya poin + jadwal sudah berakhir
               //        (mencakup: TIDAK akses DAN akses tapi 0 poin)
  }
  // else: Belum (jadwal masih aktif, belum berhasil dapat poin)
}
```

| Kategori | Definisi |
|----------|----------|
| **Total Mahasiswa** | `masterStudents.length` (dari `students.json`) |
| **Hadir** | Punya `points > 0` (otomatis berarti akses dalam jadwal — diblokir jika di luar) |
| **Absen** | Status `Bolos` — tidak punya poin **DAN** jadwal sudah berakhir. Mencakup dua kasus: (a) TIDAK pernah akses + jadwal selesai, atau (b) PERNAH akses tapi 0 poin + jadwal selesai |

> **Catatan perubahan dari versi sebelumnya:** Definisi Absen diperluas. Sebelumnya hanya mahasiswa yang tidak pernah akses. Sekarang juga mencakup mahasiswa yang sempat akses tapi tidak memperoleh poin sampai jadwal berakhir. Alasan pedagogis: mahasiswa yang hanya membuka halaman tanpa mengerjakan tugas sampai deadline seharusnya dikategorikan sama dengan yang tidak pernah akses — keduanya tidak menghasilkan evidence of engagement dalam waktu yang tersedia.
>
> Mahasiswa "Belum" (jadwal masih aktif, belum berhasil dapat poin) TIDAK dihitung Absen — mereka masih punya kesempatan. Jadi `Total = Hadir + Belum + Absen`, non-overlapping.

### 17.3 Status Logic

Status label ditentukan oleh kombinasi **akses + poin + zona waktu + jadwal selesai**. Dua pilar utamanya:

1. **Harus punya poin** untuk label "Tepat Waktu" atau "Terlambat". Jika tidak ada poin (poin = 0), status = "Belum" (jadwal masih aktif) atau "Bolos" (jadwal selesai).
2. **Jadwal selesai + tidak punya poin** = Bolos, tidak peduli apakah sempat akses atau tidak.

```javascript
const hasVisit = !!v;
const hasPoints = hasVisit && (v.points || 0) > 0;
const late     = hasPoints && isLate(v.timestamp);   // butuh poin
const bolos    = !hasPoints && schedExpired;         // tidak punya poin + jadwal selesai

let statusCol;
if      (bolos)       statusCol = '❌ Bolos';
else if (!hasPoints)  statusCol = '⏳ Belum';        // jadwal masih aktif, belum punya poin
else if (late)        statusCol = '⏰ Terlambat';   // punya poin + akses di 24h terakhir
else                  statusCol = '✅ Tepat Waktu'; // punya poin + akses sebelum 24h terakhir
```

**Matriks lengkap — 4 status vs 2 variabel kondisi:**

| Kondisi Mahasiswa | `hasPoints` | `schedExpired` | `isLate(timestamp)` | **Status Label** | Counted In |
|-------------------|:-----------:|:--------------:|:-------------------:|------------------|:----------:|
| Belum akses, jadwal aktif | ✗ | ✗ | – | ⏳ Belum | — |
| Belum akses, jadwal selesai | ✗ | ✓ | – | ❌ Bolos | Absen |
| Akses, 0 poin, jadwal aktif | ✗ | ✗ | – | ⏳ Belum | — |
| Akses, 0 poin, jadwal selesai | ✗ | ✓ | – | ❌ Bolos | Absen |
| Akses + poin, sebelum 24h akhir | ✓ | – | ✗ | ✅ Tepat Waktu | Hadir |
| Akses + poin, dalam 24h akhir | ✓ | – | ✓ | ⏰ Terlambat | Hadir |

> **Rasionalisasi butuh poin untuk Tepat Waktu/Terlambat:** label ini mengklaim mahasiswa telah "hadir" dan mengerjakan tugas. Membuka halaman tanpa mengerjakan soal bukanlah bukti engagement yang cukup untuk status positif. Mahasiswa "hanya akses" tetap di zona netral "⏳ Belum" sampai mereka berhasil memperoleh poin.
>
> **Rasionalisasi Bolos mencakup akses tanpa poin:** setelah deadline, mahasiswa yang tidak punya poin — baik tidak pernah akses maupun sempat akses tapi tidak mengerjakan — sama-sama tidak menghasilkan bukti pengerjaan. Membedakan keduanya akan memberi "privilege" status pada yang sekadar membuka halaman, yang pedagogis tidak adil bagi mahasiswa yang benar-benar mengerjakan.

### 17.4 Top Akses Filter

Hanya mahasiswa **dengan poin > 0** yang muncul di Top Akses (sort by `visitCount` desc, tie-break by earliest timestamp):

```javascript
const akses = [...visited]
  .filter(v => (v.points || 0) > 0)
  .sort((a, b) => {
    const d = (b.visitCount || 1) - (a.visitCount || 1);
    return d !== 0 ? d : new Date(a.timestamp) - new Date(b.timestamp);
  });
```

### 17.5 Format Tampilan Poin

Selalu tampilkan **poin (nilai)** di mana `nilai = round(poin/SCORE_CONFIG.TOTAL × 100)`:

```javascript
const nilai = pointsToScore(pts);       // helper universal
const ptsDisplay = `${pts} (${nilai})`; // contoh: "42 (84)"
```

Berlaku di:
- Card Top Skor di leaderboard
- Kolom "Poin (Nilai)" di visitor table
- Template export HTML Tugas

> **JANGAN** hardcode pembagi (`pts/30`, `pts/50`) — selalu pakai `SCORE_CONFIG.TOTAL` lewat `pointsToScore()` supaya konsisten saat skema berubah di masa depan.

---

## 18. Sistem Penilaian & Anti-Manipulasi

### 18.1 Marker Firebase per Aksi

Skema scoring 50-poin lengkap (jumlah, point, konsolasi, partial credit) sudah didokumentasikan di **§15.1**. Section ini fokus pada **marker Firebase** yang ditulis di field `scoredQuestions` per aksi — info ini critical untuk audit log + anti-manipulasi (Layer 2 di §18.2).

| Aksi | Poin | Marker Firebase di `scoredQuestions` |
|------|:----:|--------------------------------------|
| MC benar | +1 | `mc<N>` |
| MC salah | 0 (terkunci) | `mc<N>_mc_used` |
| Comp Easy–Medium benar | +2 | `c<N>_comp` |
| Comp Easy–Medium salah | 0 (terkunci) | `c<N>_comp_used` |
| Comp Hard benar | +4 | `c<N>_comp` |
| Comp Hard salah (kode diisi — partial credit) | +1 (terkunci amber) | `c<N>_comp_partial` |
| Comp Hard kode kosong + submit | 0 (warning, tidak locked) | — (tidak ditulis) |
| Konsolasi triggered | +1 → `points = 1` | flag `consolationAwarded: true` |

**3 suffix untuk Comp** (penting untuk anti-double-award):
- `_comp` → benar (full poin awarded)
- `_comp_partial` → Hard salah (1 poin usaha awarded)
- `_comp_used` → Easy/Medium salah ATAU Hard salah dengan kode kosong (0 poin, locked)

**Konsolasi threshold** (`CONSOLATION_THRESHOLD` di §15.1a):
```javascript
const CONSOLATION_THRESHOLD = SCORE_CONFIG.MC_COUNT + SCORE_CONFIG.COMP_EZ_COUNT + SCORE_CONFIG.COMP_HARD_COUNT;
// = 25 universal · Legacy: 20 (varian 30-poin), 15 (varian 25-poin)
```

Konsolasi **tidak applicable** jika mahasiswa dapat partial credit (`points > 0`) — dua mekanisme ini saling eksklusif (lihat §15.3e untuk detail interaksi).

### 18.2 Anti-Manipulasi Layered

**Layer 1 — Client-side (tidak fool-proof tapi mencegah double-submit casual):**
- Tombol disable setelah submit
- Radio option dinonaktifkan
- Set `_answeredQ` in-memory (keyed by full marker, bukan qId — supaya `_comp` vs `_comp_partial` vs `_comp_used` terpisah)

**Layer 2 — Firebase write (server-trusted, tapi data dari client):**
- `scoredQuestions` CSV menandai soal yang sudah di-attempt — 3 suffix untuk comp:
  - `_comp` → benar (full poin)
  - `_comp_partial` → Hard salah (1 poin usaha) — **marker baru**
  - `_comp_used` → Easy/Medium salah (0 poin)
- Cek `if (scored.includes(markerKey)) return;` di tiap fungsi award mencegah double-award
- `consolationAwarded: true` flag mencegah retrigger konsolasi

**Layer 3 — Firebase Security Rules (server-side, fool-proof):**
- `points` hanya bisa naik +0/+1/+2/+4 per write (mencegah lompat ke 50 dalam satu write)
  - **Penting:** rule `<= data.child('points').val() + 4` sudah mengakomodasi semua delta valid (+1 partial, +1 konsolasi, +2 EZ, +4 Hard)
- `points` tidak bisa turun (monotonic)
- `points` max = 50 (hard cap di `.validate`)
- Identitas (nim, nama, role, timestamp) terkunci setelah create
- `visitCount` max +1 per write
- `consolationAwarded` hanya bisa diset `true`

**Layer 4 — Schedule gate:**
- Semua write di-blokir saat di luar jadwal aktif via `_isScheduleOpen()` — termasuk `_awardCompPartial`

**Catatan gaming Hard partial:**
Mahasiswa bisa saja submit `print(0)` asal-asalan untuk dapat +1 poin di 5 soal Hard = 5 poin (10%). Ini trade-off yang disengaja:
- Bar 5 poin tidak signifikan untuk menentukan kelulusan (lulus typically butuh ≥60 nilai = ≥30 poin)
- Tombol langsung di-lock setelah 1× submit, jadi tidak bisa edit+retry untuk 4 poin penuh
- Anti-gaming sebenarnya ada di mekanisme tombol lock, bukan di nilai 1-poin itu sendiri

### 18.3 Helper Konsolasi

```javascript
function _checkConsolationPoint(nodeRef, state) {
  const scored = (state.scoredQuestions || '').split(',').filter(Boolean);
  // Hitung distinct base IDs (strip semua suffix yang kami pakai)
  const baseIds = new Set();
  scored.forEach(tag => {
    let base = tag;
    if      (/_mc_used$/.test(base))        base = base.replace(/_mc_used$/, '');
    else if (/_comp_used$/.test(base))      base = base.replace(/_comp_used$/, '');
    else if (/_comp_partial$/.test(base))   base = base.replace(/_comp_partial$/, '');
    else if (/_comp$/.test(base))           base = base.replace(/_comp$/, '');
    baseIds.add(base);
  });
  // Threshold universal: 10 MC + 10 Comp E/M + 5 Comp Hard = 25
  const threshold = SCORE_CONFIG.MC_COUNT + SCORE_CONFIG.COMP_EZ_COUNT + SCORE_CONFIG.COMP_HARD_COUNT;
  const allAttempted     = baseIds.size >= threshold;
  const zeroPoints       = (state.points || 0) === 0;
  const alreadyConsoled  = (state.consolationAwarded === true);
  if (allAttempted && zeroPoints && !alreadyConsoled) {
    set(nodeRef, Object.assign({}, state, {
      points: SCORE_CONFIG.CONSOLATION_POINT,      // = 1
      pointTimestamp: new Date().toISOString(),
      consolationAwarded: true
    }));
  }
}
```

> **Migrasi dari skema legacy:** Ganti hardcoded `>= 20` atau `>= 15` dengan `>= threshold` yang dihitung dari `SCORE_CONFIG`. Kalau module memakai skema legacy, buat `SCORE_CONFIG` lokal dengan angka yang sesuai (`MC_COUNT: 5, COMP_EZ_COUNT: 10, COMP_HARD_COUNT: 0` untuk Getaran Mekanik Modul-4 lama).

---

## 19. Password Admin & Hashing

### 19.1 Konsep

Password admin dipakai untuk **dua fitur sensitif**:
- Login sebagai dosen (dari login overlay)
- Reset data (hapus seluruh node pertemuan)
- Set jadwal perkuliahan (start + end time)

Password **tidak disimpan plaintext** di manapun. Yang ada di HTML hanyalah **SHA-256 hash** dari password — hash tidak dapat di-reverse menjadi password asli.

### 19.2 Penyimpanan

```javascript
// HTML source (bisa dilihat siapapun) — tidak ada string password asli
const ADMIN_PW_HASH = '57ae60d11a0de7b13b9c77c4664dc951afe403952b46c3b4f95a8bc0eb8a0470';

async function _sha256Hex(s) {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

async function _verifyAdminPw(input) {
  if (!input) return false;
  try {
    const hash = await _sha256Hex(input);
    return hash === ADMIN_PW_HASH;
  } catch(e) {
    console.error('[Auth] SHA-256 failed:', e);
    return false;
  }
}
```

Semua pemanggilan admin password menggunakan `await _verifyAdminPw(input)`. Fungsi-fungsi yang memakainya harus `async`.

### 19.3 Cara Mengganti Password Admin

1. Hitung SHA-256 dari password baru, misalnya:
   - Via tool online: [https://emn178.github.io/online-tools/sha256.html](https://emn178.github.io/online-tools/sha256.html)
   - Via Python: `hashlib.sha256(b'PasswordBaru').hexdigest()`
   - Via Node.js: `require('crypto').createHash('sha256').update('PasswordBaru').digest('hex')`
2. Buka `Modul-N.html` → cari `const ADMIN_PW_HASH = '...'`
3. Ganti string hash dengan hash baru (64 karakter hex)
4. Upload ulang ke GitHub Pages
5. **Penting**: Password yang lama masih berlaku sampai file ter-deploy + cache browser refresh

### 19.4 Batasan Proteksi

Perlindungan ini **bertingkat-satu**: efektif terhadap *casual snooper* (mahasiswa yang iseng view-source), tapi tidak terhadap *determined attacker* yang bisa:

- **Dictionary attack**: hitung hash untuk password umum dan bandingkan. Mitigasi: pakai password panjang + campuran huruf+angka+simbol + tidak di dictionary umum. Password `TeknikMesin0602` sudah cukup kuat (15 karakter, mix).
- **Keylogger / MITM**: lihat input field saat dosen mengetik. Tidak realistis untuk konteks kelas.

Untuk proteksi penuh perlu Firebase Authentication — namun untuk dampak terbatas dari breach admin password (hanya bisa reset/set jadwal, tidak bisa mencuri nilai), tingkat proteksi SHA-256 sudah memadai.

### 19.5 Cara Dosen Login

1. Buka halaman, muncul overlay login
2. Ketik nama **"Dedik Romahadi"** (case-insensitive)
3. Field NIM boleh kosong
4. Klik **Masuk**
5. Overlay login tersembunyi, muncul **Dosen Login Modal** 👨‍🏫
6. Ketik `TeknikMesin0602` di field password — terlihat sebagai `••••••` (masking aktif)
7. Tekan **Enter** atau klik **"Masuk sebagai Dosen"**
8. Jika match → langsung masuk sebagai dosen, FAB muncul
9. Badge `👨‍🏫 DEDIK ROMAHADI` muncul di navbar

**Cara batalkan:** klik **Batal** atau tekan **Escape** — modal tertutup dan overlay login kembali muncul dengan pesan "⚠ Login dibatalkan."

**Cara password salah:** modal tertutup dan overlay login kembali muncul dengan pesan "⚠ Password admin salah." — dosen ketik nama lagi untuk coba ulang (tidak ada counter/lockout).

---

## 20. Reset & Administrasi Data

### 20.1 Dua Jenis Reset

Ada **dua skenario reset** dengan efek berbeda:

| Skenario | Cara | Data yang Terhapus |
|----------|------|-------------------|
| **A. Reset Total** | Tombol Reset di halaman + password admin | Semua data module (poin, visit, PIN, jawaban, jadwal) |
| **B. Reset PIN Individual** | Firebase Console manual | Hanya PIN satu mahasiswa |

### 20.2 Skenario A: Reset Total via Tombol

**Kapan dipakai:**
- Awal semester baru
- Ganti topik pertemuan
- Clear data setelah development/testing

**Cara:**
1. Dosen buka `Modul-N.html` → klik tombol reset di login overlay
2. Modal muncul menampilkan daftar data yang akan dihapus:
   > ⚠️ Data yang akan dihapus:
   > - Semua poin & nilai mahasiswa
   > - Semua kunjungan (visitCount, lastVisit)
   > - Semua riwayat jawaban (scoredQuestions)
   > - Semua PIN mahasiswa (mereka harus buat PIN baru)
   > - Data forum, tugas, dan jadwal pertemuan
3. Masukkan password admin
4. Klik **Hapus Semua Data**
5. Toast muncul: `✅ Semua data berhasil dihapus (termasuk PIN). Mahasiswa akan membuat PIN baru saat login berikutnya.`

**Implementasi (v11 — Apr 2026, child-by-child iteration + reset guard):**

Bug pre-v11: pakai `Promise.all([remove(DB_PATH), remove(SCHEDULE_PATH), ...])` parent-level — sering muncul error **"permission denied"** di console (walau data faktanya terhapus setelah reload). Lihat §20.7 untuk lesson learned lengkap.

Pattern v11 menghilangkan ambiguitas dengan:
1. **Reset guard flag** (`window._resetInProgress = true`) untuk suppress listener side-effects
2. **Child-by-child delete** via `get()` snapshot lalu `Promise.all(map(remove))` per `$visitorKey` — setiap delete eksplisit pakai rule `.write` yang ada di `$visitorKey` level
3. **Sequential ordering**: data utama → related modules → clear localStorage → schedule TERAKHIR
4. **Hard reload** (`window.location.reload()`) setelah sukses untuk guarantee clean state

```javascript
async function confirmReset(){
  const ok = await _verifyAdminPw(document.getElementById('resetPw').value);
  if(!ok){ /* pesan error */ return; }
  
  // Layer 1: reset guard — suppress listener side-effects selama operasi
  window._resetInProgress = true;
  
  try {
    // STEP 1: Hapus visitor data utama child-by-child (deterministic per-record)
    // Reason: rule .write hanya defined di $visitorKey level. Parent-level remove
    // bisa ambiguous saat ada concurrent writes / listener fires.
    const _mainSnap = await get(ref(db, DB_PATH));
    const _mainData = _mainSnap.val() || {};
    if (Object.keys(_mainData).length > 0) {
      await Promise.all(
        Object.keys(_mainData).map(k => remove(ref(db, DB_PATH + '/' + k)))
      );
    }
    
    // STEP 2: Hapus related modules (forum-N, tugas-N) child-by-child juga
    if (RELATED_MODULES && RELATED_MODULES.length > 0) {
      for (const mid of RELATED_MODULES) {
        const _relPath = 'visitors/<course>/' + mid;
        const _relSnap = await get(ref(db, _relPath));
        const _relData = _relSnap.val() || {};
        if (Object.keys(_relData).length > 0) {
          await Promise.all(
            Object.keys(_relData).map(k => remove(ref(db, _relPath + '/' + k)))
          );
        }
      }
    }
    
    // STEP 3: Clear localStorage SEBELUM schedule listener fire
    localStorage.removeItem(LOCAL_IDENTITY);
    RELATED_MODULES.forEach(mid => {
      localStorage.removeItem(`${COURSE_SLUG}_identity_${mid}`);
      localStorage.removeItem(`optoauto_identity_${mid}`);   // legacy cleanup
    });
    
    // STEP 4: Hapus schedule TERAKHIR — listener akan fire force-logout, tapi DB
    // sudah bersih dan localStorage cleared, jadi tidak ada operasi pending konflik
    await remove(ref(db, SCHEDULE_PATH));
    
    // STEP 5: Hard reload untuk clean state
    _showResetToast('✅ Data berhasil dihapus. Halaman akan di-reload...');
    setTimeout(() => { window.location.reload(); }, 1500);
  } catch (err) {
    window._resetInProgress = false;   // reset flag agar tidak stuck
    /* tampilkan error */
  }
}
```

**Layer 2 — `_handleScheduleReady()` guard** (di file yang sama, di luar `confirmReset`):

```javascript
function _handleScheduleReady() {
  // Guard: jangan force-logout di tengah reset operation
  if (window._resetInProgress) return;
  
  const hasSchedule = !!(currentSchedule && currentSchedule.start && currentSchedule.end);
  // ... existing logic
}
```

**Note import:** pattern ini butuh `get` di Firebase imports:
```javascript
import { getDatabase, ref, get, set, remove, onValue } 
  from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";
```

Karena child-by-child iterate memakai rule `.write` di `$visitorKey` level secara eksplisit, semua field per-mahasiswa (termasuk `pinHash`, `pinSetAt` yang ada di record visitor) otomatis terhapus bersamanya per-record.

### 20.3 Skenario B: Reset PIN Individual via Firebase Console

**Kapan dipakai:**
- Mahasiswa lupa PIN-nya
- Mahasiswa curiga PIN-nya dipakai orang lain
- Mahasiswa butuh ganti PIN (baru-baru ini bagi dengan teman)

**Cara:**
1. Dosen buka [Firebase Console](https://console.firebase.google.com)
2. Pilih project `kelas-teknik-mesin` (Project ID: `getaran-mekanik`)
3. Menu kiri → **Realtime Database**
4. Tab **Data**
5. Navigate ke path: `visitors/<course>/<module>/mhs_<NIM>`
   - Contoh: `visitors/math4/modul-4/mhs_41522010001`
6. Cari field **`pinHash`** → klik ikon **X** untuk hapus
7. Cari field **`pinSetAt`** → klik ikon **X** untuk hapus (optional, tapi recommended untuk konsistensi)
8. Konfirmasi penghapusan

**Efek:**
- ❌ `pinHash` dan `pinSetAt` hilang dari record mahasiswa
- ✅ Field lain (`nama`, `nim`, `role`, `timestamp`, `visitCount`, `points`, `scoredQuestions`, `consolationAwarded`) **TETAP AMAN**
- ✅ Mahasiswa saat login berikutnya otomatis masuk ke alur Setup PIN lagi (karena `pinHash` tidak ada)
- ✅ Poin, kunjungan, dan riwayat jawaban tetap utuh

### 20.4 Logging & Audit

Firebase Console menyimpan **log aktivitas** di bagian Usage. Dosen bisa audit kapan terakhir data diubah, tapi tidak tahu siapa yang mengubah (tidak ada sistem auth per-user).

Rekomendasi: catat di logbook pribadi saat reset besar (reset total, reset PIN mahasiswa) untuk referensi.

### 20.5 Backup sebelum Reset

Sebelum **Reset Total**, disarankan:
1. Export data mahasiswa ke Excel via Firebase Console → kanan atas → **Export JSON**
2. Simpan file hasil export dengan nama `backup-modul-N-YYYYMMDD.json`
3. File ini bisa digunakan untuk rekonstruksi manual jika perlu

Firebase tidak menyediakan fitur undo untuk `remove()`. Sekali dihapus, data tidak bisa dikembalikan otomatis.

### 20.6 Password Reset Emergency

Jika dosen lupa password admin:
1. Buka file `Modul-N.html` di text editor
2. Hitung ulang SHA-256 dari password baru (lihat §19.3)
3. Ganti `ADMIN_PW_HASH` dengan hash baru
4. Upload ulang ke GitHub Pages
5. Password lama otomatis tidak berlaku setelah cache refresh

Jika dosen kehilangan akses GitHub Pages:
- Fitur reset + set jadwal tidak bisa dilakukan
- Data Firebase tetap bisa diakses via Firebase Console (login dengan akun Google pemilik project)
- Bisa hapus/edit data secara manual via Console

### 20.7 Lesson Learned: Anti-pattern Promise.all Parent-Remove (BARU di v11)

**Bug history:** Implementasi awal pakai pattern naïve:
```javascript
// ❌ ANTI-PATTERN — Promise.all parent-level remove
Promise.all([
  remove(ref(db, DB_PATH)),          // parent-level node delete
  remove(ref(db, SCHEDULE_PATH)),
  ...RELATED_MODULES.map(mid => remove(ref(db, 'visitors/<course>/' + mid)))
]).then(() => { /* cleanup */ });
```

**Symptom yang dilaporkan dosen (Apr 2026):**
> "Saat saya klik Reset, muncul pesan **permission denied** di console. Tapi setelah saya reload halaman, ternyata datanya **berhasil terhapus** semua."

**Hipotesis yang DITELITI tapi BUKAN root cause:**

1. **❌ Race condition antara Promise.all branches** — saya awalnya mengira `remove(SCHEDULE_PATH)` selesai duluan (rule sederhana) → trigger `_handleScheduleReady` listener → force-logout di tengah `remove(DB_PATH)` masih async. Investigasi: walaupun guard ditambahkan, error masih muncul.

2. **❌ Firebase rule cascade tidak izinkan delete di `$module` level** — saya mengira `.write` rule hanya ada di `$visitorKey` level, jadi parent-level remove di `$module` ditolak. Investigasi: data faktanya terhapus → berarti permission level `$module` SEBENARNYA work, mungkin via cascade child rule evaluation.

**Diagnosa yang TIDAK PASTI** (tanpa Firebase Console + Network tab access):
Kemungkinan ada concurrent writes (heartbeat / setInterval / delayed promise dari student session sebelumnya) yang fire selama reset, dan write itu gagal karena rule mengharapkan struktur lengkap (nim/nama/timestamp) tapi state mid-deletion. Error itu yang nongol di console, bukan dari `remove()` calls itu sendiri.

**Pattern v11 — DETERMINISTIC fix tanpa perlu pinpoint exact race:**

Daripada terus menebak source error, **eliminasi semua ambiguitas** dengan iterate child-by-child:

```javascript
// ✓ PATTERN v11 — explicit per-record delete via $visitorKey rule
const _mainSnap = await get(ref(db, DB_PATH));
const _mainData = _mainSnap.val() || {};
await Promise.all(
  Object.keys(_mainData).map(k => remove(ref(db, DB_PATH + '/' + k)))
);
```

**Keuntungan iterate child-by-child:**

| Aspect | Parent-level remove | Child-iterate |
|--------|---------------------|---------------|
| Rule yang dipakai | Implicit cascade (ambiguous) | Eksplisit `.write` di `$visitorKey` |
| Per-record success | Tidak terlihat | Setiap delete punya status sendiri |
| Error reporting | Generic | Spesifik per-record |
| Konsistensi dengan rules.json | Bergantung implementasi Firebase | Eksplisit pakai rule yang ada |
| Testability | Sulit isolate failure | Per-record traceable |

**Prinsip umum yang dipelajari:**

> **Untuk operasi destruktif yang melibatkan listener side-effects, pilih pattern yang DETERMINISTIC daripada yang lebih singkat tapi ambiguous.** Singkatnya code (single `remove(parent)`) tidak sebanding dengan jam debugging karena root cause yang sulit di-pinpoint. Pattern child-iterate sedikit lebih panjang (5-7 baris vs 1 baris), tapi setiap operasi pakai rule eksplisit yang traceable.

**Applied ke 6 file** di repository (Apr 2026 v11):
- `UTS-Getaran-Mekanik.html` (RELATED_MODULES = `[]`)
- `Modul-1.html` s/d `Modul-5.html` (RELATED_MODULES = `['forum-N', 'tugas-N']`)

**Refleksi proses debugging:**
Saya (assistant) sempat 2× memberikan diagnosa yang salah sebelum apply fix v11. Lesson: ketika user lapor bug yang tidak bisa di-reproduce di environment kita, jangan menebak — minta info konkret (Console screenshot, Network tab) atau pilih pattern yang eliminasi ambiguitas. Pattern child-iterate v11 berfungsi karena tidak bergantung pada akurasi diagnosa, melainkan pada explicit rule mapping.

---

## 21. Komponen UI Reusable

### 21.1 Tip Box

```html
<div class="tip-box reveal">
  💡 <strong>Judul Insight:</strong> Penjelasan tambahan.
</div>
```

### 21.2 Info Box

```html
<div class="info-box reveal">
  <strong>Judul Info:</strong> Detail dengan formula atau angka.
</div>
```

### 21.3 Warn Box

```html
<div class="warn-box reveal">
  <div class="warn-icon">⚠️</div>
  <div>
    <h4>Judul Peringatan</h4>
    <p>Penjelasan...</p>
  </div>
</div>
```

### 21.4 Late Access Banner

```html
<div id="lateAccessBanner" style="display:none;background:linear-gradient(135deg,rgba(239,68,68,.12),rgba(251,113,133,.08));border:1px solid rgba(239,68,68,.35);border-left:5px solid #ef4444;border-radius:14px;padding:18px 24px;margin-bottom:28px;align-items:flex-start;gap:14px;">
  <span style="font-size:24px;flex-shrink:0">⏰</span>
  <div>
    <div style="font-weight:800;color:#f87171;font-size:15px;margin-bottom:4px;letter-spacing:.5px">Akses di Luar Jadwal Perkuliahan</div>
    <p style="font-size:13.5px;color:#fecaca;margin:0;line-height:1.65;">Anda dapat tetap membuka dan melihat materi, namun <strong style="color:#fff">poin dan kehadiran tidak akan dicatat</strong>. Pengerjaan soal di halaman ini tidak akan disimpan. Silakan hubungi dosen jika ada kebutuhan khusus.</p>
  </div>
</div>
```

### 21.5 Stats Card (Tab Hasil)

```html
<div style="background:rgba(0,224,158,.06);border:1px solid rgba(0,224,158,.18);border-radius:14px;padding:14px 12px;text-align:center;">
  <div style="font-size:1.4rem;margin-bottom:2px;">✅</div>
  <div id="statHadir" style="font-family:'JetBrains Mono',monospace;font-size:1.6rem;font-weight:800;color:#00e09e;">—</div>
  <div style="font-size:.66rem;font-weight:700;color:#34d399;text-transform:uppercase;letter-spacing:.12em;">Jumlah Kehadiran</div>
</div>
```

### 21.6 Code Wrap (Python Cell)

Lihat §13.2.

---

## 22. Checklist Membuat Modul Baru

### A. Persiapan Konten

- [ ] Tentukan topik utama dan 4 sub-topik
- [ ] Tulis penjelasan setiap bagian (min. 2 paragraf per bagian)
- [ ] Rancang 6 analogi sehari-hari yang relevan
- [ ] Siapkan 4 animasi canvas yang memvisualisasikan konsep kunci
- [ ] Tulis 4 cell kode Python Jupyter yang saling berkaitan
- [ ] Pilih 5 referensi buku/artikel
- [ ] Rancang skenario kasus industri untuk forum
- [ ] **Pilih skema scoring (lihat §15.1b):**
  - ✅ **Default (WAJIB untuk modul baru): Universal 50 poin** — 10 MC × 1p + 10 Comp E/M × 2p + 5 Comp Hard × 4p
  - ⚠ Legacy (hanya untuk kompatibilitas modul lama): 30 poin (10 MC + 10 Comp) atau 25 poin (5 MC + 10 Comp)
- [ ] Tentukan **10 soal MC** (konseptual, interpretasi formula, tanpa coding) — 1 poin each
- [ ] Tentukan **10 soal Komputasi Easy–Medium** (5–15 baris kode, substitusi/plot sederhana) — 2 poin each
- [ ] Tentukan **5 soal Komputasi Hard** (20–50+ baris kode, algoritma lengkap/RK4/optimisasi/FFT dari awal) — 4 poin each
- [ ] Set `expected_answer` + `tolerance` untuk semua 15 soal Komputasi
- [ ] Siapkan 3 pertanyaan diskusi forum

### B. Konfigurasi Sistem (Multi-Course Aware)

- [ ] Pilih course slug yang sesuai (`math4` / `getaran_mekanik` / `optoauto` / slug baru)
- [ ] Set `MODULE_ID` → `'modul-N'` atau `'pertemuan-N'`
- [ ] Set `DB_PATH` → `` `visitors/<slug>/${MODULE_ID}` ``
- [ ] Set `SCHEDULE_PATH` → `` `settings/<slug>/${PERTEMUAN}/schedule` ``
- [ ] Set `RELATED_MODULES` → `['forum-N', 'tugas-N']`
- [ ] Set `STUDENTS_JSON_URL` → URL `students.json` mata kuliah (pastikan path sudah ter-deploy di GitHub Pages — lihat §3.1 tabel kolom *Repo Attributes Folder*)
- [ ] **Set `LOCAL_IDENTITY` dengan prefix course-scoped** — `` `<slug>_identity_${MODULE_ID}` ``. Slug HARUS sama persis dengan yang dipakai di `DB_PATH` (misal: `math4_identity_`, `getaran_mekanik_identity_`, `optoauto_identity_`). **JANGAN** mewarisi prefix dari mata kuliah lain.
- [ ] Verifikasi konsistensi prefix di **3 tempat** (§7.4): konstanta `LOCAL_IDENTITY`, fungsi `getIdentityLocal()`, dan reset cleanup `RELATED_MODULES.forEach(...)`.
- [ ] Update brand di navbar (`MATEMATIKA4` / `GETARANMESIN` / `OPTOAUTO` / dll)
- [ ] Update `<title>` halaman

### C. Tab Modul

- [ ] Set `data-tab="modul"` pada hero
- [ ] Ganti section label dan judul semua 8 bagian
- [ ] Sesuaikan formula-block dengan topik
- [ ] Tulis 6 analogi baru di Bagian 05
- [ ] Buat 4 fungsi canvas animasi di Bagian 06
- [ ] Update kode Python di Bagian 08 (4 cell, format `code-wrap`)
- [ ] Update `conda activate <env-name>` di petunjuk pengerjaan
- [ ] Update 5 daftar pustaka
- [ ] Update subnav links

### D. Tab Tugas (Skema Universal 50 Poin)

- [ ] Set `data-tab="tugas"` pada hero
- [ ] Set `SCORE_CONFIG` object di awal script dengan nilai universal: `MC_COUNT:10, MC_POINT:1, COMP_EZ_COUNT:10, COMP_EZ_POINT:2, COMP_HARD_COUNT:5, COMP_HARD_POINT:4`
- [ ] **🅐 Bagian A — Pilihan Ganda**: tulis **10 soal MC** dengan badge `badge-mc`
- [ ] **PASTIKAN tidak ada bocoran jawaban** di radio-option (no `✓`, no penjelasan dalam kurung) — penjelasan HANYA di feedback post-submit
- [ ] **🅑 Bagian B — Komputasi Easy–Medium**: tulis **10 soal** dengan badge `badge-comp-ez`, hint kerangka kode ≤15 baris
- [ ] **🅒 Bagian C — Komputasi Hard**: tulis **5 soal** dengan badge `badge-comp-hard` dan class `.comp-card.comp-hard`, hint minimal (mahasiswa implement sendiri)
- [ ] Set `expected_answer` dan `tolerance` untuk 15 soal komputasi
- [ ] Pastikan `runAndCheck(qId, expected, tolerance, difficulty)` dipanggil dengan parameter `'easy'` untuk Bagian B, `'hard'` untuk Bagian C
- [ ] Score bar menampilkan **3 sub-total**: PG (/10), Komp E/M (/20), Komp Hard (/20), Total (/50)
- [ ] Hint teks di score-detail: `0 / 50 poin`
- [ ] Semua hitungan nilai pakai helper `pointsToScore(pts)` — **jangan** hardcode `/50`
- [ ] Sertakan `lateAccessBanner` HTML element
- [ ] Uji setiap soal — jalankan kode benar, pastikan expected answer valid

### E. Tab Forum

- [ ] Set `data-tab="forum"` pada hero
- [ ] Buat skenario kasus industri baru
- [ ] Tulis 3 pertanyaan diskusi
- [ ] Update Quick Check poll
- [ ] Update canvas forum (parameter sesuai skenario)
- [ ] Update template Export HTML dengan info skenario baru

### F. Tab Hasil

- [ ] Set `data-tab="hasil"` pada hero
- [ ] **Tidak ada konten yang diubah** — dinamis dari Firebase
- [ ] Pastikan stats row (3 kolom) ter-include
- [ ] Pastikan kolom "Poin (Nilai)" di header tabel menampilkan `{pts}/{SCORE_CONFIG.TOTAL} ({nilai})`

### G. Konfigurasi Firebase

- [ ] Pastikan course slug terdaftar di `database.rules.json` (kalau MK baru)
- [ ] **Update `points.validate` ke `<= 50`** (sebelumnya `<= 30`) — lihat §13.5
- [ ] **Update `.write` rule di `$visitorKey`** — ubah `points.val() <= data.child('points').val() + 2` menjadi `+ 4` (mendukung increment Comp Hard)
- [ ] Pastikan rules memvalidasi `pinHash` (format 64-char hex) dan `pinSetAt`
- [ ] Pastikan rules `.write` pada `$visitorKey` memuat immutability untuk `pinHash`
- [ ] Publish ulang rules di Firebase Console
- [ ] Test di Rules Playground:
  - Read `/visitors/<slug>/...` → ALLOWED
  - Set `points: 50` langsung dari 0 → DENIED (max increment = +4)
  - Set `points: 4` (record baru) → ALLOWED (jika tidak ada data sebelumnya dan ≤ increment rule untuk new record)
  - Update `points` dari 10 ke 14 → ALLOWED (+4 OK)
  - Update `points` dari 10 ke 15 → DENIED (>+4)
  - Update `pinHash` yang sudah ada → DENIED (immutability)

### H. Validasi Akhir

- [ ] Test login dosen: nama "Dedik Romahadi" + custom modal password (masked ••••••)
- [ ] Test login dosen dengan password salah → modal tertutup, overlay login kembali muncul dengan error
- [ ] Test login dosen dengan Escape/Batal → pesan "Login dibatalkan"
- [ ] Test role-based UI: tombol "Atur Jadwal" SELALU terlihat (bootstrap action)
- [ ] Test role-based UI: sebelum login & saat login mahasiswa, tombol "Reset" TIDAK terlihat
- [ ] Test role-based UI: setelah login dosen, tombol "Reset" muncul di tab Hasil
- [ ] Test role-based UI: setelah reset data (logout dosen), tombol "Reset" kembali TIDAK terlihat
- [ ] Test bootstrap scenario: setelah reset total, tombol "Atur Jadwal" tetap bisa diklik untuk set jadwal baru
- [ ] Test Comp Hard partial credit: submit kode `print(0)` untuk C11 → dapat +1 poin, tombol `△ Usaha` amber
- [ ] Test Comp Hard partial credit: submit kode dengan Python runtime error → dapat +1 poin, tombol `△ Usaha` amber
- [ ] Test Comp Hard partial credit: submit kode kosong → warning, NO poin, tombol TIDAK locked (bisa retry setelah isi kode)
- [ ] Test Comp Hard benar: submit kode dengan output benar → +4 poin, tombol `✓ Selesai` hijau
- [ ] Test Comp Easy/Medium salah: submit kode salah → 0 poin, tombol `✗ Terkunci` pink (bukan amber)
- [ ] Test restore partial: setelah submit partial, refresh halaman → status `△ Usaha` + poin +1 harus tetap tersimpan
- [ ] Test Firebase marker: cek `scoredQuestions` CSV di DB berisi `c11_comp_partial` setelah submit salah
- [ ] Test login mahasiswa first-time → muncul modal Setup PIN
- [ ] Test setup PIN dengan PIN lemah (`123456`, `111111`, `121212`) → ditolak
- [ ] Test setup PIN dengan PIN valid → tersimpan, auto-login
- [ ] Test login mahasiswa returning → muncul modal Input PIN
- [ ] Test input PIN benar → login berhasil
- [ ] Test input PIN salah → pesan error, bisa coba lagi
- [ ] Test semua soal MC (benar dan salah, 5 atau 10 sesuai varian) — pastikan keduanya terkunci
- [ ] Test 10 soal komputasi dengan kode benar — pastikan +2 poin
- [ ] Test soal komputasi dengan kode salah — pastikan terkunci
- [ ] Test retry setelah refresh — pastikan terkunci dari Firebase
- [ ] Test akses di luar jadwal → banner muncul, write diblokir
- [ ] Test consolation point — attempt all 20, salah semua → +1
- [ ] Test reset data (password admin) → data terhapus, PIN ikut hilang
- [ ] Test reset PIN individual via Firebase Console → mahasiswa setup PIN baru, poin aman
- [ ] Test set jadwal → schedule tersimpan, countdown mulai
- [ ] Test tombol Export HTML — pastikan semua soal harus diisi
- [ ] Test Copy Forum — pastikan min 30 kata per jawaban
- [ ] Cek countdown rings — 4 warna distinct, animasi smooth
- [ ] Cek hero animation per tab — distinct visual
- [ ] Cek stats Hasil — Total/Hadir/Absen update real-time
- [ ] Upload ke GitHub Pages, test dari URL publik

---

## 23. Konfigurasi Cepat per Pertemuan

### 23.1 Konstanta JavaScript (per mata kuliah)

**Matematika 4:**
```javascript
const MODULE_ID       = 'modul-N';
const DB_PATH         = `visitors/math4/${MODULE_ID}`;
const PERTEMUAN       = 'pertemuan-N';
const RELATED_MODULES = ['forum-N', 'tugas-N'];
const SCHEDULE_PATH   = `settings/math4/${PERTEMUAN}/schedule`;
const LOCAL_IDENTITY  = `math4_identity_${MODULE_ID}`;
const STUDENTS_JSON_URL = 'https://dedik-romahadi.github.io/Mechanical-Engineering-Courses/Engineering-Mathematics/Attributes/students.json';
```

**Getaran Mekanik:**
```javascript
const MODULE_ID       = 'pertemuan-N';
const DB_PATH         = `visitors/getaran_mekanik/${MODULE_ID}`;
const PERTEMUAN       = 'pertemuan-N';
const RELATED_MODULES = ['forum-N', 'tugas-N'];
const SCHEDULE_PATH   = `settings/getaran_mekanik/${PERTEMUAN}/schedule`;
const LOCAL_IDENTITY  = `getaran_mekanik_identity_${MODULE_ID}`;
const STUDENTS_JSON_URL = 'https://dedik-romahadi.github.io/Mechanical-Engineering-Courses/Getaran-Mekanik/Attributes/students.json';
```

**Optimalisasi & Otomasi:**
```javascript
const MODULE_ID       = 'pertemuan-N';
const DB_PATH         = `visitors/optoauto/${MODULE_ID}`;
const PERTEMUAN       = 'pertemuan-N';
const RELATED_MODULES = ['forum-N', 'tugas-N'];
const SCHEDULE_PATH   = `settings/optoauto/${PERTEMUAN}/schedule`;
const LOCAL_IDENTITY  = `optoauto_identity_${MODULE_ID}`;
const STUDENTS_JSON_URL = 'https://dedik-romahadi.github.io/Mechanical-Engineering-Courses/Optimization-Automation/Attributes/students.json';
```

> **⚠ Konvensi `LOCAL_IDENTITY`:** Prefix WAJIB course-scoped — sama persis dengan slug yang dipakai di `DB_PATH`. Aturan: `` `${COURSE_SLUG}_identity_${MODULE_ID}` ``. **Jangan** meminjam prefix dari mata kuliah lain (misal `optoauto_identity_` untuk course Getaran Mekanik). Ini untuk mencegah bentrok session localStorage antar-course ketika MODULE_ID kebetulan sama (misal dua course pakai `pertemuan-4`), dan memastikan tombol Reset tidak salah menghapus session course lain. Lihat §3.1 dan §7.4 untuk detail.

**Tabel ringkasan prefix per course:**

| Course Slug | `LOCAL_IDENTITY` Prefix |
|-------------|-------------------------|
| `math4` | `math4_identity_` |
| `getaran_mekanik` | `getaran_mekanik_identity_` |
| `optoauto` | `optoauto_identity_` |
| `<slug_baru>` | `<slug_baru>_identity_` |

**⚠ Scoring Config (universal 50 poin) — sama untuk semua course baru:**

```javascript
const SCORE_CONFIG = {
  MC_COUNT:         10, MC_POINT:         1,  // Bagian A: 10 MC × 1 = 10
  COMP_EZ_COUNT:    10, COMP_EZ_POINT:    2,  // Bagian B: 10 Comp × 2 = 20
  COMP_HARD_COUNT:   5, COMP_HARD_POINT:  4,  // Bagian C:  5 Comp × 4 = 20
  CONSOLATION_POINT: 1,
  get TOTAL(){ return 10 + 20 + 20; }         // = 50
};
```

### 23.2 Find & Replace HTML

```
GETARANMESIN // P4   →   <BRAND> // <CODE>N
Masuk ke Modul 4 →   →   Masuk ke Modul N →
Pertemuan 4          →   Pertemuan N
Modul 4 — [Topik]    →   Modul N — [Topik Baru]
2025/2026            →   [Tahun Akademik]

# Scoring-specific:
0 / 30 poin          →   0 / 50 poin
Math.round(pts/30*100) →  pointsToScore(pts)
Math.round(pts/25*100) →  pointsToScore(pts)
BAGIAN A — Pilihan Ganda · 10 Soal   →   (match setting baru)
```

### 23.3 Title

```html
<title>Modul N — [Topik] | [Mata Kuliah]</title>
```

Contoh:
- `<title>Modul 5 — Persamaan Diferensial Eksak | Matematika 4</title>`
- `<title>Pertemuan 6 — Resonansi | Getaran Mekanik</title>`
- `<title>Pertemuan 8 — Algoritma Genetika | Optimalisasi & Otomasi</title>`

---

## 24. Sistem Real-time Chat & Online Presence

Fitur sosial di widget mengambang pojok kanan-bawah (FAB 👥). Menampilkan: (a) mahasiswa yang sedang online real-time, (b) group chat kelas per modul.

### 24.1 Tujuan & Prinsip Desain

| Tujuan | Bentuk |
|---|---|
| Mahasiswa tahu siapa teman yang sedang aktif | Strip avatar horizontal di atas panel |
| Diskusi ringan antar mahasiswa tanpa keluar dari modul | Group chat kelas, bubble style |
| Dosen bisa ikut memberi arahan/koreksi saat mahasiswa bertanya | Dosen bisa kirim chat (bubble amber + 🧑‍🏫) |
| Privasi dosen — mahasiswa tidak perlu tahu kapan dosen online | Dosen NOT tracked di `presence/` node |
| Tahan spam / manipulasi | Rate-limit client + Firebase Rules server-side |
| Pesan tidak bisa diedit/dihapus oleh pengirim sendiri | Immutable via `!data.exists()` di rules |

**Catatan filosofis:** chat ini bukan pengganti grup WhatsApp kelas — hanya saluran cepat saat mahasiswa sedang mengerjakan modul. Oleh karena itu sengaja: max 500 char, tidak ada emoji/file/DM, tidak ada read-receipt. Ini fitur "cukup" bukan "lengkap".

### 24.2 Arsitektur

Dua Firebase nodes terpisah:

```
/presence/<course>/<module>/<mhs_NIM>
  { nama, nim, lastSeen (ms), tab, role: 'student' }
  [auto-remove via onDisconnect saat tab close]

/chat/<course>/<module>/messages/<pushId>
  { nim, nama, role ('student'|'dosen'), text, timestamp (ms) }
  [immutable — tidak bisa edit/delete via client]
```

**Kenapa dua node terpisah?**
- `presence/` bersifat **volatile** (auto-remove, heartbeat refresh 20s) → write-heavy, read-heavy
- `chat/` bersifat **append-only, immutable** → write-once, read many
- Rules yang berbeda: presence butuh write-update, chat butuh write-create saja
- Reset: hapus `presence/` tidak memengaruhi `chat/` history, dan sebaliknya

### 24.3 Heartbeat & Online Detection

Konstanta (di script modul):
```javascript
const HEARTBEAT_MS = 20000;         // write lastSeen tiap 20 detik
const ONLINE_THRESHOLD_MS = 45000;  // offline jika > 45s tanpa heartbeat
const CHAT_LIMIT = 50;              // ambil 50 pesan terakhir
```

Implementasi `initPresence()` — split responsibility:
```javascript
function initPresence() {
  const me = getIdentity();
  if (!me || !me.nama) return;

  // ─── LISTENER: SEMUA user login (mhs + dosen) bisa read presence ───
  if (!_presenceUnsubscribe) {
    _presenceUnsubscribe = onValue(ref(db, PRESENCE_PATH), (snap) => {
      const data = snap.val() || {};
      const now = Date.now();
      onlineUsers = Object.entries(data)
        .map(([key, val]) => ({ key, ...val }))
        .filter(u => u.lastSeen && (now - u.lastSeen) < ONLINE_THRESHOLD_MS);
      renderOnlineUsers();
    });
  }

  // ─── WRITER: HANYA mahasiswa (dosen privacy) ───
  if (me.role !== 'student' || !me.nim) return;

  const userKey = sanitizeKey('mhs_' + me.nim);
  _currentPresenceRef = ref(db, PRESENCE_PATH + '/' + userKey);

  // onDisconnect FIRST — server menghapus entry saat koneksi putus
  onDisconnect(_currentPresenceRef).remove().catch(()=>{});

  // Initial heartbeat + interval
  _writeHeartbeat();
  _heartbeatTimer = setInterval(_writeHeartbeat, HEARTBEAT_MS);

  // Extra heartbeat saat tab aktif lagi (visibility change)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) _writeHeartbeat();
  });
}
```

**Tiga kunci robustness:**
1. `onDisconnect().remove()` — Firebase server-side hapus entry saat WebSocket putus (mati listrik, tab close, crash browser). Tidak perlu cleanup manual.
2. `visibilitychange` listener — heartbeat langsung saat user kembali aktif setelah lama AFK.
3. `beforeunload` listener — best-effort cleanup saat user close tab normal (sebagai fallback).

### 24.4 Chat — Group Kelas

> ⚠ **Pedoman v5 — saveIdentity HARUS call renderChat()** untuk fix bug "chat tidak bisa setelah first login":
> 
> Setelah user login, identity di-save ke localStorage tapi UI chat tidak otomatis re-render → input chat tetap hidden hingga refresh. Solusi: `saveIdentity()` jadi single source of truth untuk re-render.
> 
> ```javascript
> function saveIdentity(v) {
>   localStorage.setItem(LOCAL_IDENTITY, JSON.stringify(v));
>   // WAJIB: re-render chat UI agar input ter-enable tanpa refresh
>   try { if (typeof renderChat === 'function') renderChat(); } catch(e) {}
>   try { if (typeof onChatInput === 'function') onChatInput(); } catch(e) {}
> }
> ```
> 
> Karena fix di **central function** `saveIdentity`, semua login path (dosen login, PIN setup, PIN verify, auto-login mahasiswa returning) otomatis ikut ter-fix tanpa modifikasi tempat lain.

Listener `initChat()` — semua user yang login (termasuk guest dengan identity null):
```javascript
function initChat() {
  const q = query(ref(db, CHAT_PATH), limitToLast(CHAT_LIMIT));
  _chatUnsubscribe = onValue(q, (snap) => {
    const data = snap.val() || {};
    chatMessages = Object.entries(data)
      .map(([key, val]) => ({ key, ...val }))
      .sort((a,b) => (a.timestamp||0) - (b.timestamp||0));
    renderChat();
  });
}
```

Send dengan rate limit 2s + role-check:
```javascript
function sendChat() {
  const me = getIdentity();
  if (!me || (me.role !== 'student' && me.role !== 'dosen')) return;   // guest ditolak
  const text = input.value.trim();
  if (!text || text.length > 500) return;
  if (Date.now() - _lastSentAt < 2000) return;     // rate limit 2s
  _lastSentAt = Date.now();

  const msg = {
    nim: me.nim || 'DOSEN',
    nama: me.nama.slice(0, 80),
    role: me.role,
    text: text.slice(0, 500),
    timestamp: Date.now()
  };
  push(ref(db, CHAT_PATH));
  set(newRef, msg);
}
```

Bubble styles di `renderChat()`:
- **own** (hijau, kanan) — pesan sendiri, tanpa label nama
- **other** (abu, kiri) — pesan mahasiswa lain
- **dosen-msg** (amber, kiri, dengan 🧑‍🏫) — pesan dosen

### 24.5 Role-based Access Matrix

| Aksi | Mahasiswa | Dosen | Guest |
|---|:---:|:---:|:---:|
| Lihat strip mahasiswa online | ✅ | ✅ (monitor) | ❌ (FAB tidak tampil) |
| Muncul di strip sebagai online | ✅ | ❌ (**privasi**) | — |
| Lihat chat messages | ✅ | ✅ | — |
| Kirim chat messages | ✅ (bubble hijau) | ✅ (bubble amber + 🧑‍🏫) | — |
| Edit/hapus pesan sendiri | ❌ (immutable) | ❌ (immutable) | — |
| Hapus chat via Firebase Console | — | ✅ | — |

### 24.6 UI Widget — Unified Single View

**Design decision:** TIDAK ada internal tabs di dalam panel. Online + Chat dalam satu view untuk:
- Mengurangi friksi (tidak perlu tap untuk pindah view)
- Online avatars sebagai context visual saat chatting
- Layar kecil (mobile) tetap usable

Struktur layout:

```
┌─ 💬 Chat Kelas          🟢 N online ─┐
│── MAHASISWA ONLINE         🟢 N ─────│   ← strip label + count
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐                 │
│  │AS│ │BK│ │CM│ │DP│ ...              │   ← horizontal avatar strip
│  └──┘ └──┘ └──┘ └──┘                 │     (hover → tooltip)
├───────────────────────────────────────┤
│                                        │
│  Budi: Kerjain soal C11 gimana?       │
│                     Saya coba help... ─│   ← chat bubbles
│  🧑‍🏫 Pak Dedik: Pakai half-power BW   │
│                                        │
├───────────────────────────────────────┤
│ [ Tulis pesan... ]          [ ➤ ]     │   ← input (Enter=kirim)
└───────────────────────────────────────┘
```

**CSS variable penting:**
```css
.visitor-panel { width: 360px; max-height: 520px; }
.vp-online-strip { padding: 10px 14px 12px; }        /* online users atas */
.vp-online-avatar { width: 36px; height: 36px; }     /* bulat, green dot */
.vp-chat-list { min-height: 200px; }                  /* main content */
.vp-chat-input textarea { max-height: 80px; }         /* auto-resize */
.vp-msg.own { background: rgba(6,214,160,.18); }     /* hijau */
.vp-msg.other { background: rgba(255,255,255,.06); } /* abu */
.vp-msg.dosen-msg { background: rgba(251,191,36,.15);}/* amber */
```

### 24.7 Firebase Security Rules

**Presence node:**
```json
"presence": {
  "$course": {
    ".validate": "$course === 'math4' || $course === 'getaran_mekanik' || $course === 'optoauto'",
    ".read": true,
    "$module": {
      ".validate": "$module.matches(/^[a-z0-9_-]{1,40}$/)",
      "$userKey": {
        ".validate": "$userKey.matches(/^mhs_[0-9A-Z]{1,20}$/)",         // BUKAN dosen
        ".write": "!newData.exists() || (newData.hasChildren(['nama','nim','lastSeen']) && newData.child('lastSeen').val() <= now + 60000)",
        "nama":     {".validate": "newData.isString() && newData.val().length >= 2 && newData.val().length <= 80"},
        "nim":      {".validate": "newData.isString() && newData.val().matches(/^[0-9]{1,20}$/)"},
        "lastSeen": {".validate": "newData.isNumber() && newData.val() >= 0"},
        "tab":      {".validate": "newData.isString() && newData.val().length <= 20"},
        "role":     {".validate": "newData.val() === 'student'"},         // STRICT: bukan dosen
        "$other":   {".validate": false}
      }
    }
  }
}
```

**Chat node:**
```json
"chat": {
  "$course": {
    ".validate": "$course === 'math4' || $course === 'getaran_mekanik' || $course === 'optoauto'",
    ".read": true,
    "$module": {
      ".validate": "$module.matches(/^[a-z0-9_-]{1,40}$/)",
      "messages": {
        ".indexOn": ["timestamp"],
        "$msgId": {
          ".validate": "newData.hasChildren(['nim','nama','text','timestamp'])",
          ".write":    "!data.exists() && newData.child('timestamp').val() <= now + 60000 && newData.child('timestamp').val() >= now - 300000",
          "nim":       {".validate": "newData.isString() && (newData.val().matches(/^[0-9]{1,20}$/) || newData.val() === 'DOSEN')"},
          "nama":      {".validate": "newData.isString() && newData.val().length >= 1 && newData.val().length <= 80"},
          "role":      {".validate": "newData.val() === 'student' || newData.val() === 'dosen'"},
          "text":      {".validate": "newData.isString() && newData.val().length >= 1 && newData.val().length <= 500"},
          "timestamp": {".validate": "newData.isNumber() && newData.val() > 0"},
          "$other":    {".validate": false}
        }
      }
    }
  }
}
```

**Key security properties:**
- `!data.exists()` saat write → pesan **immutable** (tidak bisa diedit/dihapus via klien)
- `now - 300000 ≤ timestamp ≤ now + 60000` → jendela ±5 menit / +1 menit (anti-spoof jauh ke depan/belakang)
- `$other: false` → semua field di luar whitelist ditolak (anti-injection)
- `presence/` userKey **hanya** pattern `mhs_<NIM>` — tidak ada slot untuk dosen (privasi hard-enforced di server)
- `presence/` role **harus** `'student'` — double-check di samping userKey pattern

### 24.8 Moderasi & Cleanup

Karena pesan immutable dari sisi klien, moderasi hanya dari Firebase Console:

| Operasi | Lokasi | Efek |
|---|---|---|
| Hapus satu pesan | `chat/<course>/<module>/messages/<msgId>` → Delete | Pesan hilang dari semua client dalam 1-2 detik |
| Clear seluruh chat modul | `chat/<course>/<module>/messages` → Delete | Chat history bersih, sistem tetap berfungsi |
| Reset presence (saat development/testing) | `presence/<course>/<module>` → Delete | Semua user "offline" sampai heartbeat berikutnya |

**Penting:** tombol "🔄 Reset Data Mahasiswa" di tab Hasil **tidak** menyentuh node `presence/` atau `chat/`. Ini by-design — reset nilai ≠ clear chat history. Bersihkan manual jika perlu.

### 24.9 Testing Checklist

Setelah deploy `Modul-N.html` + `database.rules.json`:

- [ ] **Test 1 — Mahasiswa bisa saling chat**
  - Browser A: Login mhs1 (NIM+PIN)
  - Browser B: Login mhs2
  - Browser A kirim pesan → Browser B lihat dalam 1-2s dengan bubble abu
  - Browser B kirim pesan → Browser A lihat dengan bubble abu
  - Setiap pesan sendiri muncul dengan bubble hijau

- [ ] **Test 2 — Dosen bisa chat**
  - Browser C: Login dosen (password admin)
  - Browser C kirim pesan → Browser A & B lihat dengan bubble amber + 🧑‍🏫

- [ ] **Test 3 — Dosen TIDAK muncul di strip online**
  - Browser A (mhs): strip "MAHASISWA ONLINE" hanya tampil mhs1, mhs2 — **bukan** dosen
  - Browser C (dosen): strip tampil mhs1, mhs2 (dosen bisa monitor)

- [ ] **Test 4 — Heartbeat & auto-remove**
  - Browser A close tab
  - Browser B: avatar mhs1 hilang dari strip dalam ≤ 45 detik

- [ ] **Test 5 — Rate limit**
  - Browser A: kirim 3 pesan cepat berturut-turut (< 2s) → hanya pesan pertama terkirim, 2 lainnya diblokir silent

- [ ] **Test 6 — Guest tidak bisa kirim**
  - Browser incognito, klik FAB → panel muncul dengan warning "Masuk terlebih dahulu untuk mengirim pesan", textarea tidak muncul

### 24.10 Biaya Firebase (Estimasi)

Untuk kelas 30 mahasiswa aktif 2 jam sehari:

| Operasi | Volume/hari | Quota Spark (Free) |
|---|---|---|
| Presence heartbeat (20s × 30 user × 7200s) | ~10,800 writes | 20K writes/day — **safe** |
| Chat messages (misal 50 msg/kelas) | ~50 writes | negligible |
| Presence reads (listener — 1 per user/session) | ~30 connections | 100 concurrent — **safe** |
| Chat reads (listener) | ~30 connections | shared with above |
| Storage (chat cumulative, 500 char/msg × 50 msg × 15 pertemuan) | ~375 KB | 1 GB — **safe** |
| Bandwidth (presence updates × 30 users × session) | ~5 MB/day | 10 GB/month — **safe** |

Sampai 50 mahasiswa × 5 kelas paralel masih di bawah Spark quota. Tidak perlu upgrade ke Blaze plan.

### 24.11 Limitations (By-Design)

Yang sengaja **tidak** ada di chat:

1. **DM (private message)** — group chat per modul saja; kalau butuh private gunakan WhatsApp/email
2. **Edit pesan** — immutable di server, hati-hati typo
3. **Hapus pesan** — oleh pengirim sendiri tidak bisa (hanya dosen via Console)
4. **File/image attachment** — plain text only untuk efisiensi
5. **Emoji reaction** — tidak ada 👍/❤️ di pesan
6. **"Sedang mengetik..." indicator** — tidak ada untuk hemat bandwidth
7. **Read receipts** — tidak ada centang biru
8. **Push notification** — chat hanya terlihat saat panel dibuka
9. **Search di chat history** — browse manual (max 50 pesan terakhir)
10. **Multi-room chat** — hanya satu channel per modul

Jika di masa depan ada kebutuhan DM atau file sharing, evaluasi ulang — mungkin sudah butuh pindah ke platform chat terpisah (Slack/Discord) dengan SSO, bukan bloat modul.

---

## 25. Common Bugs & Anti-Recurrence (Lessons Learned)

Section ini mendokumentasikan bug-bug nyata yang pernah muncul di produksi dan solusinya, agar tidak terulang di modul masa depan. **Setiap modul baru WAJIB di-audit terhadap checklist di akhir section ini.**

### 25.1 Bug Apr 2026 — Poin Tidak Tersimpan (Critical)

**Gejala yang dilaporkan:**
- Mahasiswa login berhasil, kunjungan tercatat di Firebase
- Mahasiswa menjawab MC/Comp dengan benar — feedback "✅ Benar! +1 poin" muncul
- Tapi poin TIDAK pernah masuk ke tabel performa mahasiswa
- Tidak ada error visible di UI mahasiswa

**Root cause:** Null-comparison trap di Firebase Rules (lihat §13.4.1 untuk detail). Singkatnya: visitor record awal tidak punya field `points`, lalu rule `newData.points >= data.points` evaluasi `1 >= null` = false → write ditolak silent.

**Solusi:**
1. App-level: Init `points: 0` & `scoredQuestions: ''` di SETIAP visitor record creation (3 tempat: `submitPinSetup`, `submitPinVerify` new-branch, 5 auto-create blocks di award/record functions)
2. Rules-level: Tambah `|| !data.hasChild('points')` defensive null check
3. Anti-silent-fail: Replace semua `.catch(()=>{})` dengan `.catch(err => console.error('[Score] <fn> failed:', err))`

**Anti-recurrence:** Audit checklist §13.4.1 + §15.4e wajib dijalankan sebelum deploy.

### 25.2 Bug Apr 2026 — Chat Tidak Bisa Setelah First Login

**Gejala:** Setelah login pertama kali, mahasiswa tidak bisa ketik chat — input area hidden, hanya tampil warning "Login dulu". Setelah refresh halaman, baru bisa.

**Root cause:** `renderChat()` hanya dipanggil dari Firebase chat listener (`onValue` di `initChat`). Saat user login, `saveIdentity()` menulis ke localStorage TAPI tidak trigger re-render UI → input chat tetap hidden hingga page reload trigger `initChat` ulang.

**Solusi:** `saveIdentity()` jadi single source of truth. Tambah hook untuk `renderChat()` + `onChatInput()`:

```javascript
function saveIdentity(v) {
  localStorage.setItem(LOCAL_IDENTITY, JSON.stringify(v));
  try { if (typeof renderChat === 'function') renderChat(); } catch(e) {}
  try { if (typeof onChatInput === 'function') onChatInput(); } catch(e) {}
}
```

Karena fix terpusat di `saveIdentity`, semua login path (dosen, PIN setup, PIN verify, auto-login returning) otomatis ikut ter-fix.

**Anti-recurrence:** Lihat §24.4 — saveIdentity hook requirement.

### 25.3 Bug Apr 2026 — Copy Forum HTML Tidak Berfungsi

**Gejala:** Sebagian mahasiswa klik tombol "📋 Copy Forum" tapi tidak ada respons — clipboard tetap kosong, tidak ada feedback error.

**Root cause:** Browser modern memblok `navigator.clipboard.writeText` dalam beberapa konteks (HTTP, sandbox iframe, perizinan terbatas, mobile WebView). Code lama hanya punya 1 tier fallback (`execCommand`) yang juga sering gagal di browser yang sama.

**Solusi:** 3-tier fallback (lihat §16.3):
1. **Tier 1** — `navigator.clipboard.writeText` dengan check `window.isSecureContext`
2. **Tier 2** — `execCommand('copy')` dengan textarea selectable (style transparent, bukan `display:none`)
3. **Tier 3** — Buka popup window dengan HTML di textarea + tombol Select All + instruksi Ctrl+A/Ctrl+C manual

Plus error logging dengan `console.error('[Forum] ...')` di setiap kegagalan.

**Anti-recurrence:** Audit checklist §16.3 wajib dijalankan.

### 25.4 Bug Apr 2026 — Tabel Hasil Stuck di "Memuat data mahasiswa..."

**Gejala:** Tab Hasil di salah satu modul (sering Modul-4 atau modul yang baru di-deploy) menampilkan tabel daftar mahasiswa yang stuck di pesan "⏳ Memuat data mahasiswa..." tanpa pernah berubah, padahal mahasiswa sudah ada yang login dan data ada di Firebase.

**Root cause:** Race condition antara dua async operations:

1. `fetchMasterStudents()` — fetch ke `students.json` (URL eksternal di GitHub Pages)
2. Firebase `onValue(DB_PATH)` listener — fire saat data Firebase tersedia

```javascript
// Pattern lama (bermasalah):
fetchMasterStudents();   // async — fire & forget, tidak ada callback re-render
// ... 
onValue(ref(db, DB_PATH), (snap) => {
  latestVisitors = data ? Object.values(data) : [];
  renderVisitors(latestVisitors);   // bisa fire SEBELUM masterStudents loaded
});

function renderVisitors(visitors) {
  if (!masterStudents.length) {
    tableEl.innerHTML = '⏳ Memuat data mahasiswa...';
    return;   // ← exit early
  }
  // ... render
}
```

Skenario gagal:
- Firebase listener fires SEBELUM `fetchMasterStudents` selesai → `masterStudents.length === 0` → render dengan loading message → return early
- `fetchMasterStudents.then()` set `masterStudents = data`, **TAPI tidak trigger re-render** → tabel stuck selamanya

Bug ini **non-deterministic** — kadang muncul kadang tidak, tergantung mana yang menang race. Cache browser bisa membuat fetch lebih cepat (tidak terlihat bug); modul baru tanpa cache → fetch lebih lambat → bug muncul.

**Solusi:** Tambah trigger re-render di kedua branch `fetchMasterStudents.then()` (success) dan `.catch()` (failure):

```javascript
fetchMasterStudents = function(retries) {
  return fetch(STUDENTS_JSON_URL).then(r => r.json()).then(data => {
    masterStudents = data;
    masterFetchDone = true;
    // FIX: trigger re-render setelah master list tersedia
    try {
      if (typeof renderVisitors === 'function' && typeof latestVisitors !== 'undefined') {
        renderVisitors(latestVisitors || []);
      }
      if (typeof updateLeaderboard === 'function') {
        updateLeaderboard(latestVisitors || [], _scheduleExpired || false);
      }
    } catch(e) { console.warn('[Visitor] Re-render failed:', e); }
  }).catch(err => {
    if (retries < 2) {
      setTimeout(() => fetchMasterStudents(retries + 1), 1500);
    } else {
      masterStudents = []; masterFetchDone = true;
      // FIX: trigger re-render even on failure (akan tampilkan warning yang jelas)
      try {
        if (typeof renderVisitors === 'function' && typeof latestVisitors !== 'undefined') {
          renderVisitors(latestVisitors || []);
        }
      } catch(e) {}
      // ...
    }
  });
};
```

Plus update `renderVisitors` untuk **bedakan loading vs failure**:

```javascript
function renderVisitors(visitors) {
  if (!masterStudents.length) {
    if (masterFetchDone) {
      // Fetch sudah selesai tapi kosong → warning, bukan loading
      tableEl.innerHTML = '⚠ Daftar mahasiswa tidak bisa dimuat<br>Refresh atau cek koneksi.';
    } else {
      // Masih loading
      tableEl.innerHTML = '⏳ Memuat data mahasiswa...';
    }
    return;
  }
  // ... render normal
}
```

**Anti-recurrence:** Setiap async fetch yang menjadi dependency render UI WAJIB punya re-render trigger di kedua branch (success + failure). Jangan andalkan urutan natural async — selalu eksplisit re-trigger.

### 25.5 Bug Apr 2026 — HTML Element Dihapus Tapi JS Masih Reference (Hidden Crash)

**Gejala:** Tab Hasil Modul-4 stuck di "Memuat data mahasiswa..." padahal Modul-5 (struktur sama) berfungsi normal. Tidak ada error visible di UI. Mahasiswa & dosen tidak bisa lihat tabel.

**Root cause:** Saat fitur baru menggantikan HTML element, JS yang masih reference element lama akan throw `TypeError: Cannot set properties of null` → JS execution stop → UI stuck.

Skenario nyata di Modul-4:
1. **April 2026 (chat widget):** Visitor panel HTML diganti dengan chat widget. Element lama `vpList`, `vpBadge` dihilangkan.
2. **JS `renderVisitors()` di Modul-4 TIDAK ikut di-update** — masih punya `document.getElementById('vpList').innerHTML = ...`
3. **Saat `renderVisitors()` dipanggil** → `getElementById('vpList')` returns null → `.innerHTML` throw TypeError → execution exit
4. **Tabel tidak pernah ter-update** karena render function crash sebelum sampai ke `tableEl`

Kenapa Modul-5 OK? Karena saat update dilakukan di Modul-5, `renderVisitors()` ikut di-update untuk hanya manage `tableEl` (modul-modul lain ikut updated tapi Modul-4 terlewatkan).

**Solusi:** Sinkronisasi HTML dan JS. Kalau menghapus element HTML, **WAJIB** audit semua JS reference dan hapus juga atau guard dengan null check:

```javascript
// ❌ SALAH — crash kalau element tidak ada
function renderVisitors(visitors) {
  document.getElementById('fabCount').textContent = visited.length;
  document.getElementById('vpBadge').textContent = visited.length + ' orang';
  // ... element-element ini sudah dihapus saat chat widget added!
}

// ✅ BENAR — clean version, hanya manage element yang masih ada
function renderVisitors(visitors) {
  const tableEl = document.getElementById('visitorTableBody');
  // NOTE: vpList & vpBadge & fabCount sekarang dikelola oleh presence system
  // renderVisitors() hanya update leaderboard + table Hasil + stats cards
  // ...
}

// ✅ ALTERNATIF — null guard untuk backward compat
function renderVisitors(visitors) {
  const fabEl = document.getElementById('fabCount');
  if (fabEl) fabEl.textContent = visited.length;   // ← guard
  // ...
}
```

**Anti-recurrence:** Saat melakukan **HTML structural change** (replace section, remove element, ganti ID), WAJIB:
1. Search seluruh JS untuk `getElementById('<old_id>')` references
2. Update atau hapus reference tersebut
3. Atau tambah null check sebagai safety net
4. Lakukan ini di SEMUA modul, jangan hanya satu (mudah terlewat)

Cara cepat audit di terminal:
```bash
grep -rn "getElementById('vpList')" Modul-*.html  # sebelum delete element
grep -rn "getElementById('vpList')" Modul-*.html  # setelah delete — should be 0
```

### 25.6 Bug Apr 2026 — Spacing `.code-dots` ke Badge Python (Visual)

**Gejala:** Di header panel script Python, 3 titik traffic-light (merah/orange/hijau) terlihat menempel langsung pada badge "Python" tanpa jarak — visual cramped, kurang nyaman dibaca.

**Root cause:** `.code-dots` dan `.code-lang` adalah sibling flex item tanpa margin di antaranya. `.code-label` (judul cell) di-position absolute di tengah `.code-header`, sehingga tidak menambah jarak natural di flex flow. Pada viewport sempit, dots dan badge Python berdempetan.

**Solusi:** Tambah `margin-right: 18px` di `.code-dots` (lihat §14.2 untuk spec lengkap):

```css
.code-dots { display: flex; gap: 6px; margin-right: 18px; }
```

**Anti-recurrence:** Saat menambah elemen baru di area dengan **mixed positioning** (beberapa flex flow + beberapa absolute), selalu test di viewport sempit (mobile) untuk memastikan visual spacing tetap nyaman. Jangan asumsikan `gap` di parent flex cukup kalau ada element yang `position:absolute`.

### 25.7 Bug Apr 2026 — Pyodide Package Auto-Load Gagal untuk Comma-Imports (Critical)

**Gejala yang dilaporkan:**
- Mahasiswa menulis kode Python yang benar di Tab Tugas, klik ▶ Run & Validasi
- Muncul error: `ModuleNotFoundError: The module 'pandas' is included in the Pyodide distribution, but it is not installed.`
- Soal langsung dikunci (Tidak ada kesempatan ulang) — mahasiswa frustrasi karena kodenya sebenarnya benar
- Bug paling sering terjadi di Modul-5 dataset reference yang pakai pattern `import numpy as np, pandas as pd`

**Root cause:** Function `_ensurePythonPackages()` punya regex `/^\s*(?:import\s+pandas|from\s+pandas\s+import)/m` yang hanya match `pandas` di posisi pertama setelah `import`. Saat mahasiswa pakai **comma-separated import** seperti `import numpy as np, pandas as pd` (sangat umum di Jupyter notebook), regex GAGAL detect → `loadPackage('pandas')` tidak dipanggil → exec kode mahasiswa → `import pandas` throw ModuleNotFoundError → soal terkunci.

Test case yang harusnya match tapi gagal di regex lama:
```python
import numpy as np, pandas as pd     # ❌ tidak match (pandas di posisi kedua)
import pandas, numpy                  # ❌ tidak match
```

**Solusi:** Ganti regex agar match nama paket di posisi mana pun dalam import statement:

```javascript
// SEBELUM (BUG):
{ name: 'pandas', regex: /^\s*(?:import\s+pandas|from\s+pandas\s+import)/m }

// SESUDAH (FIXED):
{ name: 'pandas', regex: /(?:^|[\n;])\s*(?:from\s+pandas(?:\s|\.)|import\s+(?:[^\n#]*?,\s*)?pandas(?:\s|,|$))/m }
```

Regex baru menangani:
- `import pandas` (standar)
- `import pandas as pd` (with alias)
- `import numpy as np, pandas as pd` (comma-separated, pandas di posisi mana pun)
- `import pandas, numpy` (multi-package)
- `from pandas import X` dan `from pandas.io import Y`

Pattern serupa diterapkan untuk `scipy`, `matplotlib`, `sympy`, `scikit-learn` (sklearn). Tambahan: `statsmodels` di-include karena sering dipakai untuk decomposition (STL, ADF test).

**Anti-recurrence:** Saat menambah package detection regex, **selalu test minimal 5 variasi import statement** termasuk comma-separated. Patternnya:

```javascript
// Test cases mandatory:
'import <pkg>'                                    // standar
'import <pkg> as alias'                           // dengan alias
'import other as o, <pkg> as p'                   // comma-separated
'from <pkg> import X'                             // from-import
'from <pkg>.submodule import X'                   // submodule
```

Tambahkan unit test JavaScript ini di console saat develop fitur Pyodide auto-load.

### 25.10 Bug Apr 2026 — Export PG Selalu Menampilkan Opsi Benar (Critical)

**Gejala yang dilaporkan:**
- Mahasiswa export HTML hasil tugas, lalu lapor "kenapa jawaban PG saya selalu ditandai ✓ padahal saya jawab salah?"
- Bahkan saat skor banner menunjukkan PG: 3/10 (tujuh salah), tabel di file export menampilkan ke-10 jawaban sebagai opsi yang benar dan ditandai ✓.

**Root cause:** Selektor multi-class di build `mcData` mengembalikan elemen pertama dalam **urutan DOM**, bukan pilihan sebenarnya:
```javascript
// ❌ BUGGY — selalu return first DOM-order match
const correctEl = rg?.querySelector('.radio-option.correct-ans');
const selected  = rg?.querySelector('.radio-option.selected, .radio-option.correct-ans, .radio-option.wrong-ans');
return { selected: selected?.textContent.trim(), correct: !!correctEl, ... };
```

Saat user salah, opsi BENAR (yang tidak dipilih) di-mark `.correct-ans`. Karena CSS selector list mengembalikan **first match in document order**, dan opsi benar sering muncul lebih awal di DOM daripada opsi salah yang user pilih, querySelector mengembalikan **opsi benar** sebagai "pilihan user". `correctEl` juga selalu non-null → `correct: true`. Bug menampilkan opsi benar + ✓ untuk semua soal yang sudah disubmit.

**Pattern benar:** Pilihan asli user **selalu** memiliki kelas `.selected` (selectMC men-set `.selected`, dan checkMC tidak pernah men-remove-nya — hanya menambah `.correct-ans` atau `.wrong-ans` di atas `.selected`):
```javascript
// ✅ CORRECT — sumber kebenaran tunggal
const sel        = rg?.querySelector('.radio-option.selected');
const correctOpt = rg?.querySelector('.radio-option.correct-ans');
let selectedText, isCorrect;
if (sel) {
  selectedText = sel.textContent.trim();
  isCorrect    = sel.classList.contains('correct-ans');   // benar bila yang dipilih juga correct-ans
} else if (mcAnswered[id]) {
  // FALLBACK §25.11 — pasca-restore dari Firebase, .selected hilang
  isCorrect    = (mcScores[id] || 0) > 0;
  selectedText = isCorrect && correctOpt
    ? correctOpt.textContent.trim()
    : '(Sudah dijawab — pilihan salah)';
} else {
  selectedText = '(Belum dijawab)';
  isCorrect    = false;
}
```

**Anti-recurrence:** Jangan pernah pakai `querySelector` dengan **selector list multi-class** untuk mendeteksi state spesifik. CSS selector list = **OR logic**, return first match in DOM order — tidak ada konsep "prefer .selected over .correct-ans". Pakai selector tunggal yang spesifik untuk state yang ingin diidentifikasi.

### 25.11 Bug Apr 2026 — Export PG Setelah Reload Tampil "Belum Dijawab" (Critical)

**Gejala yang dilaporkan:**
- Mahasiswa kemarin sudah jawab semua PG (skor banner show 8/10), reload halaman keesokan harinya untuk export.
- Score banner masih menampilkan 8/10 (Firebase restore berhasil), TAPI export HTML menampilkan ke-10 jawaban sebagai `(Belum dijawab)`.

**Root cause:** `_loadScoredQuestions()` saat restore dari Firebase **hanya** men-set `mcAnswered[qId] = true` + lock radio group + ubah feedback message. Handler **tidak** menambahkan kelas `.selected` / `.correct-ans` ke opsi mana pun. Akibatnya:
- DOM tidak punya `.radio-option.selected` setelah reload.
- `querySelector('.radio-option.selected')` di build `mcData` return `null`.
- Logic export menulis `(Belum dijawab)` walau `mcScores[qId] = 1`.

**Anti-pattern (jangan):**
```javascript
// ❌ Hanya tergantung DOM class yang tidak di-restore
const sel = rg?.querySelector('.radio-option.selected');
return { selected: sel?.textContent.trim() || '(Belum dijawab)', ... };
```

**Pattern benar (2 lapis):**
1. **Restore handler menandai opsi benar di DOM** (BARU v12.1) — gunakan `onclick` attribute (`selectMC(...,this,true)`) untuk identifikasi opsi yang correct, bukan kelas yang sudah hilang. Pattern ini survives `shuffleMCOptions` karena onclick attribute di-update saat shuffle.
   ```javascript
   // Di _loadScoredQuestions, dalam handler restore mc<N>:
   const _correctOpt = Array.from(rg.querySelectorAll('.radio-option'))
     .find(o => /,\s*this\s*,\s*true\s*\)/.test(o.getAttribute('onclick') || ''));
   if (_correctOpt) _correctOpt.classList.add('selected', 'correct-ans');
   //                                          ^^^^^^^^^   ^^^^^^^^^^^
   //                                          (selected = pilihan user; correct-ans = visual hijau)

   // Untuk mc<N>_mc_used (salah): tambah .correct-ans saja (kita tidak tahu opsi yang dipilih user)
   if (_correctOpt) _correctOpt.classList.add('correct-ans');
   ```

2. **Fallback `mcAnswered`/`mcScores` di build `mcData`** — sebagai safety net jika restore handler bermasalah. Lihat §25.10 cabang `else if (mcAnswered[id])`.

**⚠ Trap:** Hanya menyediakan fallback (lapis 2) **tidak cukup** kalau `correctOpt` belum di-set di DOM — fallback `isCorrect && correctOpt` jatuh ke string `(Sudah dijawab — pilihan salah)` walau `isCorrect=true`. Akibatnya export menampilkan teks "pilihan salah" tapi bersamaan dengan ✓ hijau (inkonsisten visual). Restore handler **wajib** menandai opsi benar.

**Catatan teknis:** Kita tidak menyimpan **opsi mana yang dipilih** di Firebase (anti-cheat: hanya `mc<N>` untuk benar atau `mc<N>_mc_used` untuk salah). Untuk kasus benar, kita aman menambahkan `.selected` ke opsi correct karena memang itu yang user pilih. Untuk kasus salah, kita hanya menandai opsi correct (`.correct-ans`) tanpa `.selected` karena kita memang tidak tahu pilihan user.

**Audit cepat:**
```bash
# Cari pattern buggy di seluruh repo
grep -rn "querySelector('.radio-option.selected, .radio-option.correct-ans, .radio-option.wrong-ans')" .
# Harus 0 hasil.

# Verifikasi restore handler menandai opsi benar
grep -c "v12.1 — mark correct option visually" Modul-N.html
# Atau cari pattern onclick parsing di handler restore mc:
grep -n ",\\\\s\\*this\\\\s\\*,\\\\s\\*true" Modul-N.html
# Harus muncul di blok _loadScoredQuestions untuk mc<N> dan mc<N>_mc_used.
```

### 25.8 Audit Checklist — Wajib Sebelum Deploy Modul Baru

Untuk mencegah ketiga bug di atas terulang, jalankan checklist berikut sebelum push modul baru ke produksi:

#### Database & Score System
- [ ] `submitPinSetup` create visitor record dengan `points: 0` & `scoredQuestions: ''`
- [ ] `submitPinVerify` new-visitor branch sama seperti di atas
- [ ] 5 auto-create blocks di `_awardPoint`/`_awardCompPoint`/`_awardCompPartial`/`_recordMcAttempt`/`_recordCompAttempt` include `points: 0` & `scoredQuestions: ''`
- [ ] Semua catch blocks pakai `console.error('[Score] ...')` (bukan silent `.catch(()=>{})`)
- [ ] Schedule check pakai red-toast dengan dedupe 30s (untuk mahasiswa awareness)
- [ ] `database.rules.json` mengandung `|| !data.hasChild('points')` defensive check

#### Chat & Identity
- [ ] `saveIdentity()` memanggil `renderChat()` + `onChatInput()` (kalau modul punya chat)
- [ ] `initChat()` dipanggil di top-level init (sebelum identity ada — agar guest bisa lihat pesan)
- [ ] `initPresence()` dipanggil setelah login berhasil (4 entry point: dosen, PIN setup, PIN verify, auto-login)

#### Reset Operations (BARU di v11 — Apr 2026 akhir bulan)
- [ ] `confirmReset()` set `window._resetInProgress = true` di awal
- [ ] `_handleScheduleReady()` early-return jika `window._resetInProgress` (suppress force-logout selama reset)
- [ ] Pakai **child-by-child iterate** (`get` lalu `Promise.all(map(remove))`) — BUKAN parent-level `remove(DB_PATH)`
- [ ] Sequential ordering: data utama → related modules → clear localStorage → schedule TERAKHIR
- [ ] Schedule di-remove paling akhir (rule `.write: true` simpel, listener fire setelah DB clean)
- [ ] `await get(...)` lalu `Promise.all(Object.keys(snap.val()).map(remove))` — handle empty data dengan `|| {}`
- [ ] `RELATED_MODULES` di-iterate sequentially (for-of loop), tiap module child-iterate juga
- [ ] `try/catch` mengembalikan flag ke `false` di error path agar tidak stuck
- [ ] Hard `window.location.reload()` setelah success (1.5s delay) — guarantee clean state
- [ ] Firebase imports include `get` (untuk read snapshot sebelum iterate delete)
- [ ] Lihat §20.2 untuk implementasi lengkap + §20.7 untuk lesson learned anti-pattern

#### Tab Tugas — Export HTML (BARU v12)
- [ ] **Hanya satu tombol Export** di halaman Tugas (id `btn-score-export` di score-bar). Verifikasi: `grep -c 'btn-export-tugas' Modul-N.html` harus 0
- [ ] Score-bar memuat baris kedua dengan `#export-blocked-msg` (text-align center) — verifikasi struktur sesuai §15.1c
- [ ] `checkExportReady()` HANYA mereferensikan `btnTop` (bukan `btnBottom`). Verifikasi: `grep -c 'btnBottom' Modul-N.html` harus 0
- [ ] **Subtitle cover export** sesuai mata kuliah modul (lihat §15.3d). `grep -n 'class="sub">' Modul-N.html`
- [ ] **Filename download** = `Tugas{N}_{NIM}_{CourseSlug}.html` dengan N = nomor modul aktual. `grep -n 'a.download =' Modul-N.html`
- [ ] **Build `mcData` di export** pakai pattern `.radio-option.selected` + fallback `mcAnswered`/`mcScores` (lihat §25.10–§25.11). Verifikasi NO multi-class selector list:
  ```bash
  grep -c "querySelector('.radio-option.selected, .radio-option.correct-ans, .radio-option.wrong-ans')" Modul-N.html
  # harus 0
  ```
- [ ] Test manual: jawab 1 PG benar + 1 PG salah → export → buka file → verifikasi opsi yang ditampilkan = pilihan asli user, bukan opsi correct
- [ ] Test reload: jawab semua PG → reload halaman → export → verifikasi semua tetap muncul (bukan "Belum dijawab")

#### Forum Copy (UPDATED v10 — Apr 2026 akhir bulan)
- [ ] `copyForumHtml()` punya 3-tier fallback: `navigator.clipboard` → `execCommand` → **always-visible inline textarea** (bukan popup window — popup sering di-block mobile/ad-blocker)
- [ ] `window.isSecureContext` di-check sebelum tier 1
- [ ] `buildForumHtml()` di-wrap try/catch
- [ ] `_populateForumOutput(htmlCode)` dipanggil **sebelum** clipboard attempt (Tier 3 always-ready)
- [ ] **v10: `checkForumReady()` auto-populate textarea saat `allFilled=true`** (button-independent — fallback bila onclick tidak ter-fire)
- [ ] HTML element `<div id="forum-html-output">` + `<textarea id="forum-html-textarea">` ada di DOM
- [ ] 4 helper functions ter-export di `window.*`: `_populateForumOutput`, `selectForumHtmlAll`, `copyForumHtmlManual`, `_execCopyFallback`
- [ ] Banner text "✅ HTML Siap di Bawah — Salin Manual" (bukan lagi "💡 Backup") — komunikasikan ke mahasiswa bahwa manual adalah cara primary
- [ ] Lihat §16.3 untuk implementation detail lengkap (lesson learned #1 + #2)

#### General Hygiene
- [ ] JS validation pass via `node --check` untuk semua script blocks
- [ ] Tidak ada `console.log` debugging tertinggal
- [ ] Tidak ada `.catch(()=>{})` (silent error swallowing)
- [ ] Forum scenario UNIK per pertemuan (tidak duplikat antar modul)
- [ ] Math parameters di forum sudah verified secara numerik (Python verification script)
- [ ] **Setiap async fetch yang dependency render UI** punya re-render trigger di `.then()` DAN `.catch()` (lihat §25.4)
- [ ] **`renderVisitors`** membedakan state loading vs failure (`masterFetchDone` check)
- [ ] **Saat HTML structural change** (replace section, remove element, ganti ID): audit semua JS `getElementById()` reference dengan `grep -rn "getElementById('<old_id>')"` (lihat §25.5)
- [ ] **Cross-modul consistency:** Kalau update fungsi seperti `renderVisitors()`, lakukan di SEMUA modul, jangan hanya satu

#### Pyodide Package Auto-Load
- [ ] `_ensurePythonPackages` regex match comma-separated imports: test `import numpy as np, pandas as pd` HARUS detect pandas (lihat §25.7)
- [ ] Setiap package yang dipakai di soal Tugas (pandas, scipy, matplotlib, sympy, sklearn, statsmodels) ada di `PACKAGE_PATTERNS` array
- [ ] Test minimal 5 variasi import (standar, dengan alias, comma-separated, from-import, submodule) sebelum deploy

### 25.9 Pola Anti-Pattern yang Harus Dihindari

| Anti-Pattern | Mengapa Bahaya | Pengganti |
|---|---|---|
| `.catch(()=>{})` | Silent error swallowing — bug tidak terdeteksi | `.catch(err => console.error('[<scope>]', err))` |
| `if (!snap.exists()) return;` | Race condition kehilangan data | Auto-create record dengan default values |
| Visitor record tanpa `points: 0` | Null-comparison trap di Firebase rules | Always init numeric fields |
| Single-tier clipboard copy | Banyak browser/context yang blok | 3-tier fallback (modern → execCommand → popup) |
| `renderChat()` hanya dari listener | Stale UI setelah login | Hook di `saveIdentity` (single source) |
| Hard-coded `points: 0 → +4` di rule tanpa null check | Trap di first write | Tambah `\|\| !data.hasChild('points')` |
| `fetch().then(data => globalVar = data)` tanpa re-render | Race condition stuck UI | Always trigger `renderUI()` di kedua branch (.then/.catch) |
| `getElementById('<id>').innerHTML` tanpa null check | Crash silent saat element dihapus | Audit JS setelah HTML structural change, atau pakai null guard |
| Regex `^\s*import\s+<pkg>` saja | Gagal detect comma-imports → ModuleNotFoundError | Pakai regex yang match nama paket di posisi mana pun (lihat §25.7) |



### Kenapa `type="module"` di script Firebase?

Firebase v12 menggunakan ES modules. Script dengan `type="module"` berjalan di strict mode, scope terpisah, mendukung top-level `import`. Semua fungsi yang perlu diakses dari luar modul (`submitVisitor`, `confirmReset`, dll.) harus di-expose via `window.nama = fungsi`.

### Pesan Error Standar

Konsisten antar mata kuliah (untuk kemudahan support mahasiswa):

| Kondisi | Pesan |
|---------|-------|
| Jadwal belum diset | `⚠ Jadwal belum diatur. Silakan hubungi dosen.` |
| Sebelum jadwal mulai | `⚠ Akses belum dibuka. Jadwal dimulai pada [tanggal jam].` |
| Nama tidak cocok dengan NIM | `⚠ Nama tidak sesuai dengan NIM yang terdaftar di SIA.` |
| NIM tidak terdaftar | `⚠ NIM tidak terdaftar. Hanya mahasiswa yang terdaftar yang dapat mengakses halaman ini.` |
| Format nama salah | `⚠ Format nama salah. Setiap kata harus diawali huruf kapital.` |
| Format NIM salah | `⚠ NIM harus berupa angka tanpa spasi.` |
| Login dosen dibatalkan | `⚠ Login dibatalkan.` |
| Password admin salah | `⚠ Password admin salah.` |
| PIN bukan 6 digit | `⚠ PIN harus 6 digit angka.` |
| Konfirmasi PIN tidak cocok | `⚠ Konfirmasi PIN tidak cocok.` |
| PIN lemah (weak list) | `⚠ PIN terlalu mudah ditebak (misalnya 123456, angka berulang, atau pola sederhana). Gunakan kombinasi yang lebih unik.` |
| PIN verifikasi salah | `⚠ PIN salah. Coba lagi atau hubungi dosen jika lupa.` |
| Reset gagal | `❌ Gagal hapus data: [error message]. Cek koneksi atau Firebase Security Rules.` |
| Setup PIN gagal simpan | `❌ Gagal menyimpan PIN: [error message]` |

### Password Admin & PIN Mahasiswa

**Password Admin** — sama lintas mata kuliah dan modul: **`TeknikMesin0602`** (default, bisa diganti — lihat §19.3)

Disimpan sebagai SHA-256 hash, bukan plaintext.

Dipakai untuk:
- Login dosen (dari overlay login utama)
- Reset data (`confirmReset()`)
- Set jadwal (`saveSchedule()`)

**PIN Mahasiswa** — personal per mahasiswa, 6 digit angka, ditetapkan saat first-time login. Disimpan sebagai SHA-256 hash di Firebase (field `pinHash`). Reset PIN bisa:
- Total (via tombol reset di halaman) — hapus semua data
- Individual (via Firebase Console) — hanya hapus field `pinHash` + `pinSetAt`

### Struktur Data Firebase per Mahasiswa (Lengkap)

Setelah sistem PIN ditambahkan, struktur node per-mahasiswa menjadi:

```javascript
{
  nama: "Dedik Romahadi",
  nim: "41522010001",
  role: "student",
  timestamp: "2026-04-18T10:00:00.000Z",   // ← terkunci setelah create
  lastVisit: "2026-04-18T14:30:00.000Z",   // ← update tiap visit (dengan cooldown 1 jam)
  visitCount: 3,                            // ← max +1 per write
  points: 42,                               // ← max +4 per write, range 0–50 (universal)
  pointTimestamp: "2026-04-18T13:15:00.000Z",
  scoredQuestions: "mc1,mc2_mc_used,c1_comp,c2_comp_used,c11_comp,c12_comp_partial,...",
  // Suffix: _comp=benar, _comp_partial=Hard salah (1 poin), _comp_used=Easy/Med salah, _mc_used=MC salah
  consolationAwarded: true,                 // optional, hanya set jika triggered
  pinHash: "a3f5b2c8...",                   // ← SHA-256 hash, 64 char hex, IMMUTABLE
  pinSetAt: "2026-04-18T10:00:30.000Z"     // ← kapan PIN diset pertama kali
}
```

### Print CSS

Tab Tugas support print ke PDF via `window.print()`. CSS print mengecualikan semua tab kecuali `#page-tugas` dan menyembunyikan elemen interaktif.

### KaTeX Rendering

KaTeX di-render via `renderMathInElement(document.body, {...})` saat DOMContentLoaded. Formula:
- Inline: `\(formula\)`
- Display: `\[formula\]` atau `$$formula$$`

Class `ff` (float formula) dan `.float-formulas` dikecualikan dari rendering KaTeX untuk performa.

---

## 26. Bug & Pattern Baru dari UTS Build (April 2026, akhir bulan)

Section ini mendokumentasikan bug + pattern yang ditemukan saat build halaman **UTS Getaran Mekanik** (April 2026). Bug-bug ini juga **berpotensi muncul di Modul reguler** dan harus diaudit di sana juga.

### 26.1 Bug — Cross-Script Scope Trap (CRITICAL, applicable to ALL modul)

**Gejala:**
- Browser console error: `ReferenceError: _answeredQ is not defined` atau `currentSchedule is not defined`
- Countdown timer tidak berjalan padahal jadwal sudah dimuat
- Beberapa fungsi dari `<script>` regular tidak bisa akses variabel dari `<script type="module">`

**Root cause:** Variabel yang dideklarasikan dengan `let` atau `const` di dalam `<script type="module">` **tidak terekspose ke window/global scope** — ES Modules deliberately isolate scope. Jika ada `<script>` regular yang akses variabel itu, dia tidak akan menemukannya:

```html
<script type="module">
  // ❌ SALAH — _answeredQ hanya di module scope
  const _answeredQ = new Set();
  window._awardPoint = function(qId) { /* ... */ };
</script>

<script>
  // ❌ ReferenceError saat fungsi ini dijalankan
  function checkAnswered(qId) {
    if (_answeredQ.has(qId)) return;  // ← _answeredQ undefined di sini!
  }
</script>
```

**Solusi — Pattern `window.X` namespace + alias:**

```html
<script type="module">
  // ✓ Expose ke window agar bisa diakses dari script regular
  const _answeredQ = window._answeredQ || (window._answeredQ = new Set());
  window._awardPoint = function(qId) {
    _answeredQ.add(qId);
    // ...
  };
</script>

<script>
  // ✓ Akses lewat window dengan local alias untuk readability
  window._answeredQ = window._answeredQ || new Set();
  var _answeredQ = window._answeredQ;  // alias

  function checkAnswered(qId) {
    if (_answeredQ.has(qId)) return;  // works!
  }
</script>
```

**Variabel umum yang harus di-window:**
- State soal: `_answeredQ`, `_firebaseStateLoaded`
- Schedule data: `currentSchedule`
- Cache Firebase: `_cachedFirebaseData`
- Identity helpers: `getIdentity` (sudah di-window di v5)

**Anti-recurrence:** Saat menambah variabel state baru, tanya: "apakah ini diakses dari kedua jenis script?" Jika YA → wajib pakai pattern `window.X`. Jika ragu, tetap pakai `window.X` — tidak ada downside.

### 26.2 Bug — Empty-Code Feedback Hidden by Inline `style="display:none"`

**Gejala:** Mahasiswa klik "▶ Run & Validasi" tanpa menulis kode. Feedback warning "tulis kode dulu" tidak muncul. Mereka kira tombol broken, klik berkali-kali tanpa hasil.

**Root cause:** Element `<div class="feedback" id="fb-c1" style="display:none">` punya **inline `style="display:none"`**. CSS class `.feedback.warn { display: block }` tidak akan override karena **inline style punya specificity lebih tinggi** dari class selector. Saat `runAndCheck` set `fb.className = 'feedback warn'`, class berubah, tapi `display` tetap `none` dari inline style.

```html
<!-- ❌ SALAH — inline style menang -->
<div class="feedback" id="fb-c1" style="display:none"></div>

<style>
.feedback.warn { display: block; }  /* tidak menang! */
</style>
```

**Solusi (pilih salah satu):**

```javascript
// Option A — set style.display secara eksplisit di JS:
function runAndCheck(qId) {
  const fb = document.getElementById('fb-' + qId);
  fb.className = 'feedback warn';
  fb.style.display = 'block';   // ← WAJIB karena inline style menang
  fb.textContent = '⚠ Tulis kode Python terlebih dahulu.';
  fb.scrollIntoView({behavior: 'smooth', block: 'nearest'});
}

// Option B — hilangkan inline display:none dan pakai CSS class default:
// HTML:  <div class="feedback" id="fb-c1"></div>  (no inline)
// CSS:   .feedback { display: none; }
//        .feedback.warn, .feedback.correct, .feedback.wrong { display: block; }
```

**Rekomendasi:** Option A lebih defensive (works regardless of CSS state). Anti-recurrence: di setiap tempat yang assign `fb.className = '...'`, juga set `fb.style.display = 'block'` sebagai safety net.

### 26.3 Bug — Countdown setTimeout Chain Lebih Fragile

**Gejala:** Countdown berjalan beberapa detik lalu berhenti tiba-tiba. Refresh halaman bikin countdown kembali normal sebentar, lalu stuck lagi.

**Root cause:** Pattern lama pakai recursive `setTimeout`:

```javascript
function startCountdown(target) {
  function tick() {
    const remain = target - Date.now();
    document.getElementById('cd').textContent = formatTime(remain);
    if (remain > 0) setTimeout(tick, 1000);  // ← satu error → chain mati
  }
  tick();
}
```

Jika `tick()` throw error sekali (misalnya element `cd` belum ada di DOM, atau formatTime undefined), chain `setTimeout` putus selamanya.

**Solusi — pakai `setInterval` always-on, dengan ID untuk clear:**

```javascript
let _countdownIntervalId = null;

function startCountdown(target) {
  if (_countdownIntervalId) clearInterval(_countdownIntervalId);
  _countdownIntervalId = setInterval(() => {
    try {
      const remain = target - Date.now();
      const el = document.getElementById('cd');
      if (el) el.textContent = formatTime(remain);
      if (remain <= 0) {
        clearInterval(_countdownIntervalId);
        _countdownIntervalId = null;
        onExpired();
      }
    } catch (err) {
      console.error('[Countdown] tick error (will retry next interval):', err);
    }
  }, 1000);
}
```

**Keuntungan:** error di satu tick tidak menghentikan loop berikutnya. Browser scheduler tetap fire interval setiap detik, regardless.

### 26.4 Bug — `startCountdown` Early-Return Blocks Tick Forever

**Gejala:** Schedule berhasil dimuat (`currentSchedule` ada di `window`), tapi countdown tidak pernah mulai walaupun jadwal sudah open.

**Root cause:** Function lama melakukan early-return jika `scheduleInfo` panel UI tidak ada, **sebelum** memanggil `startCountdown`:

```javascript
function updateScheduleDisplay() {
  const info = document.getElementById('scheduleInfo');
  const range = document.getElementById('scheduleRange');
  if (!info || !range) return;   // ← BUG: return sebelum startCountdown
  info.textContent = ...;
  range.textContent = ...;
  startCountdown(currentSchedule.endTime);  // ← never reached
}
```

Akibat: di halaman yang tidak punya scheduleInfo panel (mis. embed iframe), countdown silent broken.

**Solusi — pisahkan concerns:** countdown wajib dimulai independent dari panel info:

```javascript
function updateScheduleDisplay() {
  // ── Step 1: Wajib start countdown (independent dari panel) ──
  if (window.currentSchedule && window.currentSchedule.endTime) {
    startCountdown(window.currentSchedule.endTime);
  }

  // ── Step 2: Update info panel (optional, tergantung halaman) ──
  const info  = document.getElementById('scheduleInfo');
  const range = document.getElementById('scheduleRange');
  if (info && range) {
    info.textContent  = formatScheduleInfo(window.currentSchedule);
    range.textContent = formatScheduleRange(window.currentSchedule);
  }
}
```

**Anti-recurrence:** Setiap "side-effect penting" (start timer, write Firebase, render data) harus dijalankan SEBELUM optional UI updates. Layout: critical path dulu, decorative path belakangan.

---

### 26.5 Bug — Reset Modal Misleading Message tentang PIN

**Gejala:** Modal konfirmasi reset menampilkan list "Data yang akan dihapus" yang menyertakan "Semua PIN mahasiswa (mereka harus buat PIN baru)". Toast sukses pasca-reset juga mengatakan "termasuk PIN". Padahal sejak v5 (April 2026), PIN bersifat **global lintas-course** (disimpan di node `pins/mhs_<NIM>` terpisah dari visitor records) dan **tidak terhapus** saat reset modul.

**Root cause:** Pesan UI ditulis sebelum migrasi PIN ke node global. Logic `confirmReset` hanya menghapus 3 hal:
1. `DB_PATH` (visitor records pertemuan ini)
2. `SCHEDULE_PATH` (jadwal pertemuan ini)
3. `RELATED_MODULES` (visitor records pertemuan terkait — forum, tugas)

Node `pins/...` tidak pernah disentuh oleh tombol reset di Modul.

**Dampak:** Dosen menjadi enggan klik reset (takut mengganggu mahasiswa yang harus setup PIN ulang di mata kuliah lain) — padahal reset sebenarnya aman untuk PIN. Mahasiswa juga bisa panik tidak perlu jika dosen menyebut "akan reset, kalian perlu setup PIN baru".

**Solusi:** Update copy di 2 tempat:

```html
<!-- Modal warning — list item PIN -->
<!-- ❌ SEBELUM: -->
<li>Semua <strong>PIN mahasiswa</strong> (mereka harus buat PIN baru)</li>

<!-- ✓ SESUDAH: -->
<li><em>PIN mahasiswa <strong>tidak terhapus</strong></em> — tersimpan global lintas-modul, tidak perlu setup ulang</li>
```

```javascript
// Toast pasca-reset
// ❌ SEBELUM:
_showResetToast('✅ Semua data berhasil dihapus (termasuk PIN). Mahasiswa akan membuat PIN baru saat login berikutnya.');

// ✓ SESUDAH:
_showResetToast('✅ Data pertemuan berhasil dihapus (poin, jawaban, kunjungan, jadwal). PIN mahasiswa tetap aktif (global lintas-modul).');
```

**Anti-recurrence:** Setiap kali ada migrasi data structure (mis. moving field dari satu node ke node lain), audit semua copy/messaging UI yang menyebutkan field tersebut. Cara cepat: `grep -rn "<old field name>" *.html`. Pesan UI sering diabaikan saat refactor karena tidak masuk audit syntax/logic.


## 27. UTS Architecture — Berbeda dari Modul Reguler

Halaman UTS (Ujian Tengah Semester) memiliki kebutuhan berbeda dari Modul reguler. Section ini mendokumentasikan perbedaan dan pattern khusus UTS yang **tidak berlaku** untuk Modul biasa.

### 27.1 Skema Skoring 70-Poin

Berbeda dari skoring universal 50-poin di Modul reguler (§15.1), UTS pakai skema 70-poin yang lebih granular:

| Bagian | Jumlah | Poin per soal | Subtotal |
|--------|--------|--------------:|---------:|
| 🅐 True/False (TF) | 10 soal | 1 poin | **10 poin** |
| 🅑 Pilihan Ganda (MC) | 20 soal | 1 poin | **20 poin** |
| 🅒 Komputasi Easy/Medium | 10 soal | 2 poin | **20 poin** |
| 🅓 Komputasi Hard | 5 soal | 4 poin | **20 poin** |
| **Total maksimal** | **45 soal** | — | **70 poin** |

**Konversi nilai:** `nilai_100 = (points / 70) * 100`

**Konsolasi UTS:** ≥ 30 dari 45 soal attempted DAN points = 0 → +1 poin konsolasi.

```javascript
// SCORE_CONFIG di UTS HTML:
const SCORE_CONFIG = {
  TF_COUNT: 10,             TF_POINT: 1,
  MC_COUNT: 20,             MC_POINT: 1,
  COMP_EZ_COUNT: 10,        COMP_EZ_POINT: 2,
  COMP_HARD_COUNT: 5,       COMP_HARD_POINT: 4,
  CONSOLATION_THRESHOLD: 30,  // dari 45 attempted
  TOTAL: 70
};
```

### 27.2 True/False — Tipe Soal BARU

UTS memperkenalkan tipe soal **True/False** (1 poin) yang tidak ada di Modul reguler. Karakteristiknya:

- 2 opsi saja: BENAR / SALAH
- Tidak ada partial credit
- Bisa parametric (NIM-based) atau static
- Marker Firebase: `tf<N>` (benar) atau `tf<N>_tf_used` (salah)

**Skema HTML:**

```html
<div class="tf-card reveal">
  <div class="tf-header">
    <div class="tf-num">A01</div>
    <div class="tf-q">Pertanyaan...</div>
    <div class="tf-pts">1 poin</div>
  </div>
  <div class="tf-options" id="tfopts-tf1">
    <div class="tf-option tf-true" onclick="selectTF('tf1', this, true)">
      <span class="tf-icon">✓</span><span>BENAR (TRUE)</span>
    </div>
    <div class="tf-option tf-false" onclick="selectTF('tf1', this, false)">
      <span class="tf-icon">✗</span><span>SALAH (FALSE)</span>
    </div>
  </div>
  <button class="tf-submit" onclick="checkTF('tf1')" disabled>🔒 Periksa</button>
  <div class="feedback" id="fb-tf1"></div>
</div>
```

**Functions yang dibutuhkan:** `selectTF`, `checkTF`, `_awardTfPoint`, `_recordTfAttempt`. Pattern sama dengan MC, hanya domain answer adalah `boolean` bukan index.

### 27.3 NIM-Based Question Parametrization

Setiap mahasiswa mendapat **set parameter unik** untuk soal parametric, dihitung dari NIM mereka. Tidak ada dua mahasiswa dengan parameter sama → mengurangi peluang menyontek.

```javascript
// Hash sederhana dari 2 digit terakhir NIM
function getN(nim) {
  return parseInt(String(nim).slice(-2), 10);  // 0–99
}

// Soal parametric — definisi di UTS_TF, UTS_MC, UTS_COMP_EZ, UTS_COMP_HARD
{
  id: 'mc5', modul: 2, parametric: true,
  compute: (N) => {
    const m = 2 + N * 0.05;        // 2.00 — 6.95 kg
    const k = 800 + N * 10;         // 800 — 1790 N/m
    const wn = Math.sqrt(k / m);
    const opts = [
      { v: wn, lbl: wn.toFixed(2) },
      { v: wn * 1.15, lbl: (wn*1.15).toFixed(2) },
      // ...
    ];
    const shuffled = shuffleSeed(opts, N + 5);  // urutan stabil per N
    return {
      text: `Untuk m=${m.toFixed(2)} kg dan k=${k} N/m, ωₙ adalah:`,
      options: shuffled.map(o => o.lbl + ' rad/s'),
      correctIdx: shuffled.findIndex(o => o.v === wn),
      explain: `ωₙ = √(k/m) = ${wn.toFixed(2)} rad/s`
    };
  }
}
```

**Catatan implementasi:**
- Shuffle dipakai dengan `seed = N + offset` agar urutan opsi stabil per mahasiswa (tidak berubah saat refresh)
- Verifikasi numerik di N = 0, 25, 50, 75, 99 wajib (test boundary)
- Hindari parameter yang menyebabkan nilai degenerate (mis. `1 - r²` saat r ≈ 1 → division by zero di formula tertentu)

### 27.4 Dynamic Render System

Modul reguler render 25 soal langsung di HTML statis. UTS dengan 45 soal parametric **harus** render dynamically:

```javascript
function renderUTSQuestions() {
  const N = getN(getIdentity().nim);

  // ── Bagian A: TF ──
  const tfContainer = document.getElementById('container-tf');
  tfContainer.innerHTML = '';
  window.UTS_TF.forEach((q, i) => {
    const data = q.parametric ? q.compute(N) : { text: q.text, answer: q.answer };
    window._utsAnswerKeys.tf[q.id] = data.answer;  // ← cache answer key
    tfContainer.appendChild(_buildTfCard(q, data, i));
  });

  // ── Bagian B: MC, C: Comp Easy, D: Comp Hard ──
  // (similar pattern)

  // ── PENTING: re-apply visual state dari Firebase cache (handle race condition)
  if (window._cachedFirebaseData) {
    _applyUTSVisualState(window._cachedFirebaseData);
  }
}
```

**Lifecycle:**
1. Login berhasil → `getIdentity()` returns object
2. `renderUTSQuestions()` dipanggil → render 45 cards
3. `_loadScoredQuestions()` fetch Firebase → cache di `window._cachedFirebaseData`
4. `_applyUTSVisualState(cache)` — restore selection, highlight answered, disable controls

### 27.5 Schedule dengan Duration dalam MENIT

Modul reguler pakai schedule duration dalam **hari** (dueDate). UTS pakai duration dalam **menit** (90 menit default), karena UTS adalah event waktu-tetap.

```javascript
// Schedule object di Firebase: settings/<course>/<module>/schedule
{
  startTime: 1712534400000,    // UTC ms epoch
  durationMinutes: 90,          // ← BERBEDA dari modul reguler
  endTime: 1712539800000        // computed: startTime + durationMinutes*60000
}
```

**UI input dosen:** input `<input type="number" id="duration-minutes" min="30" max="180">` dengan default 90.

### 27.6 Multi-Mode Countdown

Modul reguler hanya punya 1 mode countdown (waktu sampai due date). UTS punya **3 mode**:

```javascript
function getCountdownMode() {
  const now = Date.now();
  if (!currentSchedule) return 'no-schedule';
  if (now < currentSchedule.startTime) return 'to-start';     // belum mulai
  if (now < currentSchedule.endTime)   return 'in-progress';  // berjalan
  return 'expired';                                            // sudah lewat
}
```

UI berbeda per mode:
- `'to-start'` — countdown ke startTime, label "UTS Dimulai Dalam:", color cyan
- `'in-progress'` — countdown ke endTime, label "Sisa Waktu:", color amber → red saat <5 menit
- `'expired'` — banner merah "UTS Selesai", semua interaksi disabled

### 27.7 UTS-Murni — No Answer Reveal

Berbeda dari Modul reguler yang reveal jawaban benar setelah submit (untuk pembelajaran), **UTS tidak reveal**:
- Tidak ada green highlight pada opsi correct
- `MC_HINTS` tidak ditampilkan
- Field `data.diagram` di-render (visual aid, bukan jawaban)
- Field `data.explain` hanya muncul di export HTML untuk dosen, tidak di UI mahasiswa

Filosofi: UTS adalah summative assessment, bukan formative. Jawaban benar baru di-reveal di sesi review pasca-UTS.

### 27.8 One-Shot Enforcement (3 Layer)

UTS adalah ujian — tidak boleh ada cara mahasiswa retry soal. Implementasi 3 lapis:

```javascript
// LAYER 1: Local state check (cepat, sebelum render)
if (_answeredQ.has(qId)) return;  // sudah dijawab, exit

// LAYER 2: Mark immediately (sebelum await Firebase)
_answeredQ.add(qId);
disableQuestionUI(qId);

// LAYER 3: Firebase RMW atomic check
get(nodeRef).then(snap => {
  const ex = snap.val();
  const scored = (ex.scoredQuestions || '').split(',').filter(Boolean);
  if (scored.includes(qId) || scored.includes(qId + '_used')) {
    return;  // ← server-side enforcement: tolak duplicate award
  }
  // ... lanjut award point
});
```

**Mengapa 3 layer?** Layer 1 protect dari double-click cepat. Layer 2 protect dari concurrent click di tab berbeda (sebelum Firebase respond). Layer 3 protect dari devtools manipulation atau race antar tab.

---

## 28. Inline SVG Diagram Pattern (BARU di UTS)

Pola pedagogis baru: setiap soal yang relevan dilengkapi **diagram SVG inline parametric** yang terhubung ke nilai NIM mahasiswa. Contoh: soal "Hitung ωₙ untuk m=4.5 kg, k=850 N/m" dilengkapi gambar pegas-massa dengan nilai k dan m mahasiswa tertulis di gambar.

### 28.1 `_svg` Helper Namespace

Definisikan namespace global `_svg` dengan helper untuk diagram umum di domain getaran mekanik:

```javascript
window._svg = {
  // ── Sistem fisik ──
  springMass: (k, m) => { /* return SVG string */ },
  springMassDamper: (k, m, c, opts) => { /* ... */ },

  // ── Plot respons ──
  decay: ({zeta, wn, markPeaks}) => { /* underdamped exponential decay */ },
  threeRegimes: (highlight) => { /* under/critical/over comparison */ },
  harmonicMotion: () => { /* x(t), v(t), a(t) overlay */ },

  // ── Plot karakteristik ──
  dmfCurve: ({zetas, highlightR, highlightZeta}) => { /* DMF vs r */ },
  trCurve: ({zeta, target}) => { /* Transmissibility */ },

  // ── Spectrum ──
  fftSpec: (f1, f2) => { /* time signal + FFT bars */ }
};

// Wrapper untuk inject di card soal
window._diagram = (label, svgStr) => `
  <div class="diagram-wrap" style="background:rgba(168,85,247,.04);border:1px solid rgba(168,85,247,.18);
       border-radius:10px;padding:14px 16px;margin:14px 0">
    <div style="font-size:11px;color:#a855f7;font-family:'JetBrains Mono',monospace;
         font-weight:600;letter-spacing:.5px;text-transform:uppercase;margin-bottom:10px">
      📊 ${label}
    </div>
    ${svgStr}
  </div>`;
```

### 28.2 Per-Card Diagram Injection

Setiap soal yang punya diagram tambahkan field `diagram` di return value:

```javascript
{
  id: 'tf5', modul: 3, parametric: true,
  compute: (N) => {
    const m = 2 + N * 0.05;
    const c = 5 + N * 3.0;
    const k = 800 + N * 8;
    const zeta = c / (2 * Math.sqrt(m * k));
    return {
      text: `Sistem dengan m=${m.toFixed(2)} kg, c=${c.toFixed(2)} Ns/m, k=${k} N/m
             berada dalam regim underdamped (ζ < 1).`,
      answer: zeta < 1,
      explain: `ζ = ${zeta.toFixed(3)} ${zeta < 1 ? '< 1 → underdamped' : '≥ 1'}`,
      diagram: _diagram(
        'Tiga Regim Damping — bandingkan respons',
        _svg.threeRegimes(zeta < 1 ? 'under' : (zeta > 1 ? 'over' : 'critical'))
      )
    };
  }
}
```

Render template inject `${data.diagram || ''}` di antara header dan options:

```javascript
card.innerHTML = `
  <div class="tf-header">...</div>
  ${data.diagram || ''}     <!-- ← inject di sini -->
  <div class="tf-options">...</div>
  <button class="tf-submit">...</button>
  <div class="feedback"></div>
`;
```

### 28.3 Cakupan Diagram

Aim untuk **70-80% cakupan** diagram di soal Komputasi (paling banyak butuh visualisasi) dan **50-60%** di TF/MC:

| Bagian | Total | Berdiagram | Tidak Berdiagram |
|--------|-----:|-----------:|------------------|
| TF | 10 | 8 (80%) | tf1, tf2 (definisi abstrak) |
| MC | 20 | 13 (65%) | mc1, mc3, mc4, mc6, mc8, mc12, mc16 (konseptual) |
| Comp Easy | 10 | 9 (90%) | hanya soal pure substitusi formula |
| Comp Hard | 5 | 5 (100%) | semua butuh visualisasi |

**Soal yang TIDAK butuh diagram:** definisi abstrak ("apa itu rasio redaman?"), konsep matematis murni ("DMF rumusnya apa?"), interpretasi tekstual.

---

## 29. Selection Persistence & Cache Restore (BARU di UTS)

Berbeda dari Modul reguler yang hanya simpan marker hasil benar/salah, UTS perlu simpan **pilihan aktual mahasiswa** agar bisa di-restore visually setelah refresh dan di-export ke HTML report.

### 29.1 Schema `selections` di Firebase

Visitor record UTS punya field `selections` (object):

```javascript
{
  nama: "...", nim: "...", role: "student",
  points: 24,
  scoredQuestions: "tf1,tf2_tf_used,mc3,mc5_mc_used,c1_comp,c11_comp_partial",
  selections: {
    tf1: true,        // boolean untuk TF
    tf2: false,
    mc3: 2,           // index 0-3 untuk MC
    mc5: 0,
    // (Comp tidak di-store di selections; kode disimpan di field codes/)
  },
  codes: {
    c1: "import numpy as np\nm=4.5\n...",
    c11: "def rk4_step(...): ..."
  }
}
```

### 29.2 `_cachedFirebaseData` + `_applyUTSVisualState`

Pattern restore yang idempotent (boleh dipanggil berkali-kali tanpa side effect):

```javascript
window._cachedFirebaseData = null;

function _loadScoredQuestions() {
  const me = getIdentity();
  if (!me || !me.nim) return;
  const key = sanitizeKey('mhs_' + me.nim);
  return get(ref(db, DB_PATH + '/' + key)).then(snap => {
    if (!snap.exists()) return;
    const data = snap.val();
    window._cachedFirebaseData = data;       // cache untuk re-apply
    _applyUTSVisualState(data);               // initial apply
  });
}

function _applyUTSVisualState(data) {
  if (!data) return;
  const scored = (data.scoredQuestions || '').split(',').filter(Boolean);
  const sels   = data.selections || {};
  const codes  = data.codes || {};

  // Restore TF
  for (const qId in sels) {
    if (qId.startsWith('tf')) {
      const val = sels[qId];
      const optEl = document.querySelector(`#tfopts-${qId} .tf-${val ? 'true' : 'false'}`);
      if (optEl) optEl.classList.add('selected');
    }
  }

  // Restore MC
  for (const qId in sels) {
    if (qId.startsWith('mc')) {
      const idx = sels[qId];
      const opts = document.querySelectorAll(`#rg-${qId} .radio-option`);
      if (opts[idx]) opts[idx].classList.add('selected');
    }
  }

  // Restore Comp code text
  for (const qId in codes) {
    const ta = document.getElementById('code-' + qId);
    if (ta) ta.value = codes[qId];
  }

  // Disable submitted questions
  scored.forEach(qId => {
    const baseId = qId.replace(/_(tf_used|mc_used|comp|comp_partial|comp_used)$/, '');
    _disableQuestionUI(baseId);
  });

  // Re-render score display
  if (typeof updateScoreDisplay === 'function') updateScoreDisplay();
}

// PENTING: Re-apply di akhir renderUTSQuestions (race-condition guard)
function renderUTSQuestions() {
  // ... build all cards ...
  if (window._cachedFirebaseData) {
    _applyUTSVisualState(window._cachedFirebaseData);
  }
}
```

**Kenapa cache + idempotent?** Race condition: `_loadScoredQuestions` mungkin selesai SEBELUM `renderUTSQuestions` (jika Firebase cepat). Tanpa cache, visual restore akan diterapkan ke DOM yang belum ada → no-op silent. Dengan cache, render bisa apply ulang.

---

## 30. Google Drive Link Submission (BARU di UTS, juga relevan untuk Tugas)

Untuk UTS dan Tugas yang memerlukan upload file (gambar tangan, bukti kerja, screenshot), tambahkan input link Google Drive yang **divalidasi sebelum export HTML**.

### 30.1 HTML Input + Validasi Real-Time

```html
<div class="gdrive-section" style="margin:24px 0;padding:18px 20px;
     background:rgba(0,224,158,.04);border:1px solid rgba(0,224,158,.18);border-radius:10px">
  <label for="gdrive-link" style="display:block;font-weight:600;color:var(--green);
         font-size:13px;margin-bottom:8px">
    📂 Link Google Drive (kerja tangan / screenshot / file pendukung)
  </label>
  <input type="url" id="gdrive-link" placeholder="https://drive.google.com/..."
         oninput="checkExportReady()"
         style="width:100%;padding:10px 14px;background:#0f172a;
                border:1px solid rgba(0,224,158,.3);border-radius:8px;
                color:#e2e8f0;font-family:inherit">
  <div id="gdrive-feedback" style="font-size:12px;margin-top:6px"></div>
</div>
```

### 30.2 Validasi JavaScript

```javascript
function _isValidGDriveLink(url) {
  if (!url || url.length < 10) return false;
  // Accept https://drive.google.com/... atau link lain (untuk fleksibilitas)
  return url.startsWith('https://drive.google.com')
      || url.startsWith('https://docs.google.com')
      || url.startsWith('http');
}

function checkExportReady() {
  const link = document.getElementById('gdrive-link').value.trim();
  const fb   = document.getElementById('gdrive-feedback');
  const exportBtn = document.getElementById('export-btn');

  // Visual feedback
  if (!link) {
    fb.textContent = '';
  } else if (_isValidGDriveLink(link)) {
    fb.textContent = '✅ Link valid';
    fb.style.color = 'var(--green)';
  } else {
    fb.textContent = '⚠ Masukkan link valid (https://...)';
    fb.style.color = 'var(--amber)';
  }

  // Enable export button hanya jika link valid DAN ada minimal 1 jawaban
  const hasAnswer = window._answeredQ && window._answeredQ.size > 0;
  exportBtn.disabled = !(_isValidGDriveLink(link) && hasAnswer);
}
```

### 30.3 Inject di Export HTML

Saat `exportHtml()` build HTML report untuk paste ke LMS, sertakan link di top:

```javascript
function exportHtml() {
  const link = document.getElementById('gdrive-link').value.trim();
  const linkSection = link
    ? `<div style="background:#dcfce7;border:1px solid #16a34a;padding:12px;border-radius:8px;margin:16px 0">
         <strong>📂 Link kerja tangan:</strong>
         <a href="${escapeHtml(link)}" target="_blank">${escapeHtml(link)}</a>
       </div>`
    : `<div style="background:#fee2e2;border:1px solid #dc2626;padding:12px;border-radius:8px;margin:16px 0">
         <strong>⚠ Link Google Drive WAJIB</strong> tapi tidak terisi.
       </div>`;
  // ... build rest of HTML ...
}
```

---

## 31. Audit Checklist v7 (Update dari §25.8 dan v6)

Tambahan ke checklist v5 dan v6 — wajib dijalankan untuk modul/halaman yang terpengaruh:

#### Cross-Script Scope (BARU §26.1)
- [ ] Semua state shared (`_answeredQ`, `currentSchedule`, `_cachedFirebaseData`, `_firebaseStateLoaded`) pakai `window.X` namespace
- [ ] Tidak ada `let`/`const` di module script yang diakses dari script regular tanpa `window.X` alias
- [ ] Test scenario: load halaman → buka DevTools console → ketik nama variabel → harus tidak undefined

#### Feedback Display (BARU §26.2)
- [ ] Element `.feedback` tidak punya inline `style="display:none"` (atau, jika punya, semua call-site set `style.display='block'` saat assign className)
- [ ] Test: klik tombol Run/Submit dengan input kosong → harus muncul warning visible

#### Countdown Robustness (BARU §26.3, §26.4)
- [ ] Pakai `setInterval` (bukan recursive `setTimeout`) untuk countdown utama
- [ ] `startCountdown` dipanggil SEBELUM optional UI updates (panel info)
- [ ] Setiap tick wrap dalam try/catch supaya error tidak menghentikan loop

#### UTS-Specific (BARU §27, jika halaman UTS)
- [ ] SCORE_CONFIG.TOTAL = 70 (bukan 50)
- [ ] Schedule duration dalam menit (`durationMinutes`)
- [ ] 3 mode countdown: 'to-start' / 'in-progress' / 'expired'
- [ ] Tidak reveal jawaban benar di UI (UTS-murni)
- [ ] One-shot 3-layer enforcement aktif
- [ ] NIM-based parametric question verified di N=0,25,50,75,99

#### Inline Diagrams (BARU §28, jika halaman UTS/tugas dengan visual)
- [ ] `_svg` namespace + `_diagram()` wrapper terdefinisi
- [ ] Field `diagram` di-inject di card (TF, MC, Comp)
- [ ] Cakupan diagram: ≥70% di soal yang ada konsep visualnya
- [ ] Diagram parametric (NIM-based) tidak hardcode nilai

#### Selection Persistence (BARU §29, jika UTS atau tugas dengan resume)
- [ ] Field `selections` (untuk TF/MC) dan `codes` (untuk Comp) di-write Firebase
- [ ] `_cachedFirebaseData` global variable + `_applyUTSVisualState` idempotent
- [ ] Re-apply visual state di akhir `renderUTSQuestions()` (race-condition guard)

#### Google Drive Link (BARU §30, opsional — UTS/tugas dengan file submission)
- [ ] Input `<input type="url" id="gdrive-link">` ada
- [ ] Validation `_isValidGDriveLink` + real-time feedback
- [ ] Export button disabled sampai link valid
- [ ] Link di-inject di exported HTML report

#### NIM-Direct Variable Pattern (BARU §32, jika UTS/tugas parametric)
- [ ] Setiap soal parametric memiliki **setidaknya 1 variabel** langsung dari N (atau N+1)
- [ ] Question text menampilkan formula eksplisit: `var = formula = computed_value`
- [ ] Variabel constant ditulis dengan label `(tetap)`
- [ ] Comment `// FORMULA EKSPLISIT:` di setiap compute body parametric (helps code review)
- [ ] Untuk Comp questions: hint juga mengandung substitusi N: `# N = ${N} (dari NIM Anda)`
- [ ] Math correctness verified di N = 0, 25, 50, 75, 99 (boundary test)
- [ ] Tidak ada formula opaque seperti `m = 2 + N * 0.05` tanpa explanation di text
- [ ] Tidak ada multiple variabel scale simultan (misal m & k keduanya dengan N) yang membuat output konstan

---

## 32. NIM-Direct Variable Pattern — Transparent NIM-to-Variable Mapping (BARU di v7)

### 32.1 Konteks & Motivasi

Saat membangun soal parametric berbasis NIM (UTS Getaran Mekanik, atau tugas individual lain), formula tradisional seperti `m = 2 + N * 0.05` menyembunyikan koneksi antara NIM mahasiswa dan nilai variabel. Mahasiswa hanya melihat hasil akhir ("m = 4.50 kg") tanpa tahu mengapa nilai itu spesifik untuk NIM mereka.

**Masalah yang muncul:**
- Mahasiswa tidak bisa verifikasi parameter mereka secara independen
- Sulit membedakan "soal sama untuk semua" vs "soal individual per NIM"
- Suspect: dosen mengarang nilai random → kepercayaan terhadap fairness turun
- Saat mahasiswa diskusi sesama, tidak jelas mengapa nilai mereka berbeda
- Debug error: jika mahasiswa salah hitung, sulit identifikasi apakah salah substitusi atau salah formula

### 32.2 Prinsip NIM-Direct

Setiap soal parametric **WAJIB** memenuhi:

1. Setidaknya **1 variabel** memiliki formula sederhana yang mengandung N (atau N+1) langsung
2. Question text menampilkan **substitusi eksplisit**: `var = formula = computed_value`
3. Variabel "tetap" (constant untuk semua N) ditulis dengan label `(tetap)` agar mahasiswa tahu mana yang sama untuk semua mahasiswa
4. Untuk Computational questions, hint code juga menampilkan substitusi: `# N = ${N}` lalu `var = ${value}  # = formula`

### 32.3 Pattern Standar

#### Pattern 1: Direct Equality (paling umum)

```javascript
const m = N + 1;          // langsung dari NIM (range 1-100)
// text: "m = N + 1 = ${N} + 1 = ${m} kg"
```

Gunakan saat: parameter rentang 1-100 cocok dengan physical realism (massa, gaya, frekuensi rad/s).

#### Pattern 2: Multiple of N+1

```javascript
const k = (N + 1) * 10;   // skaling untuk physical realism (range 10-1000)
const F0 = (N + 1) * 30;  // untuk gaya (range 30-3000 N)
// text: "k = (N + 1) × 10 = (${N} + 1) × 10 = ${k} N/m"
```

Gunakan saat: parameter butuh range lebih besar (stiffness, RPM, forces).

#### Pattern 3: Linear Combination (offset + slope)

```javascript
const r = 0.5 + 0.025 * N;     // range 0.5-2.975
const omega = 1.5 + 0.04 * N;  // range 1.5-5.46
// text: "r = 0.5 + 0.025·N = 0.5 + 0.025·${N} = ${r.toFixed(3)}"
```

Gunakan saat: parameter butuh start dari nilai non-zero (frequency ratio, dimensionless ratios).

#### Pattern 4: Division for Small Parameters

```javascript
const c = (N + 1) / 10;   // range 0.1-10 Ns/m
const zeta = (N + 1) / 200; // range 0.005-0.5
// text: "c = (N + 1) / 10 = (${N} + 1) / 10 = ${c.toFixed(1)} Ns/m"
```

Gunakan saat: parameter kecil (damping coefficient, ratios).

#### Pattern 5: Exponential / Non-linear (jarang)

```javascript
const ratio = Math.exp(-(N + 1) / 100);  // range 0.367-0.990
const x2 = x1 * ratio;
// text: "x₂ = x₁·exp(−(N+1)/100) = 0.1·exp(−${N+1}/100) = ${x2.toFixed(4)} m"
```

Gunakan saat: physics of the problem demands non-linear (decay, exponential growth).

### 32.4 Anti-Pattern (HINDARI)

**❌ JANGAN: Formula opaque tanpa explanation**

```javascript
const m = 2 + N * 0.05;        // mahasiswa tidak tahu N dipakai apa
// text: "Sistem dengan m = 4.50 kg..."  
```

Mahasiswa hanya lihat hasil. Tidak ada cara verifikasi.

**❌ JANGAN: Multiple variabel scale simultan**

```javascript
const m = 1 + 0.1 * N;
const k = 200 + 5 * N;
// → ωn = √(k/m) hampir konstan untuk semua N → soal jadi "sama" untuk semua
```

Saat 2+ variabel scale dengan N proporsional, output target mungkin tidak vary → soal tidak benar-benar parametric.

**❌ JANGAN: Formula tanpa substitusi di question text**

```javascript
text: `m = ${m.toFixed(2)} kg`  // mahasiswa lihat angka, bukan formula
```

Tampilkan formula AND computed value, supaya mahasiswa tahu sumber angka.

**❌ JANGAN: Variabel direct N tapi tidak prominent**

```javascript
const m = 5;
const k = 1000;
const c = N + 1;       // ada direct, TAPI...
// text: `... c = ${c} ...`  // tidak menyebut "= N+1"
```

Walaupun c direct = N+1, jika tidak ditulis explicit di text, sama saja opaque.

### 32.5 Format Standar Question Text

#### True/False & Multiple Choice

```javascript
text: `Berdasarkan NIM Anda, <b>N = ${N}</b>:<br>
       • <b>var1 = formula = computed_value</b><br>
       • <b>var2 = constant_value</b> (tetap)<br>
       Question_part?`
```

Contoh konkret (TF4):
```javascript
text: `Sistem getaran SDOF undamped. Berdasarkan NIM Anda, <b>N = ${N}</b> (2 digit terakhir):<br>
       • <b>m = N + 1 = ${N} + 1 = ${m} kg</b><br>
       • <b>k = 1000 N/m</b> (tetap, sama untuk semua mahasiswa)<br>
       Apakah periode natural <em>T &gt; 1.5 detik</em>?`
```

#### Computational Questions (text + hint)

Text format sama seperti TF/MC, tapi bahasa lebih instruksional:

```javascript
text: `Berdasarkan NIM Anda, <b>N = ${N}</b>:<br>
       • <b>m = 1 kg</b> (tetap)<br>
       • <b>k = (N + 1) × 10 = (${N} + 1) × 10 = ${k} N/m</b><br>
       Hitung <b>frekuensi natural ωₙ</b> (rad/s). Rumus: ωₙ = √(k/m).`
```

Hint format dengan substitusi explicit di code:

```javascript
hint: `import numpy as np
# N = ${N} (dari NIM Anda)
m = 1            # tetap
k = ${k}        # = (N+1) * 10
# TODO: hitung wn dengan rumus ωₙ = √(k/m) — gunakan np.sqrt()
# TODO: print(wn)`
```

### 32.6 Verifikasi Math Correctness (WAJIB)

Setelah redesign, **WAJIB** test math di boundary N values: **0, 25, 50, 75, 99**.

Test script template:

```javascript
// verify_math.js — run with: node verify_math.js
global.window = {}; global.getIdentity = () => null;
require('./uts_questions.js');

const testN = [0, 25, 50, 75, 99];
const results = {ok: 0, fail: 0, errors: []};

function check(label, q, N) {
  try {
    const data = q.compute(N);
    if (data.expected !== undefined && (isNaN(data.expected) || !isFinite(data.expected))) {
      results.fail++; results.errors.push(`${label} N=${N}: expected NaN/Inf`);
      return;
    }
    if (data.answer !== undefined && typeof data.answer !== 'boolean') {
      results.fail++; results.errors.push(`${label} N=${N}: answer not boolean`);
      return;
    }
    if (data.correctIdx !== undefined && (data.correctIdx < 0 || data.correctIdx > 3)) {
      results.fail++; results.errors.push(`${label} N=${N}: correctIdx out of range`);
      return;
    }
    results.ok++;
  } catch(e) {
    results.fail++; results.errors.push(`${label} N=${N}: ERROR ${e.message}`);
  }
}

for (const N of testN) {
  for (const q of window.UTS_TF) if (q.parametric) check(`TF-${q.id}`, q, N);
  for (const q of window.UTS_MC) if (q.parametric) check(`MC-${q.id}`, q, N);
  for (const q of window.UTS_COMP_EZ) check(`CE-${q.id}`, q, N);
  for (const q of window.UTS_COMP_HARD) check(`CH-${q.id}`, q, N);
}

console.log(`OK: ${results.ok} | FAIL: ${results.fail}`);
results.errors.slice(0, 20).forEach(e => console.log('  ' + e));
```

**Target:** 100% pass. UTS Getaran Mekanik v7 = 28 questions × 5 N = **140/140 PASS**.

Hal yang dicek:
- `expected` (untuk Comp): tidak NaN, tidak Infinity
- `answer` (untuk TF): tipe boolean
- `correctIdx` (untuk MC): integer 0-3
- Tidak throw error di compute(N)

### 32.7 Pemilihan Variabel Direct N (Cheat Sheet)

Tabel rekomendasi (dari UTS Getaran Mekanik v7, 28 soal):

| Tipe Konsep | Variabel direct N | Rationale |
|------------|------------------|-----------|
| **Periode/Frekuensi natural** | m = N+1 atau k = N+1 | Massa rentang 1-100 kg realistis; stiffness skala bebas |
| **Frekuensi natural (Hz)** | k = (N+1)·40 | Range 40-4000 N/m cocok untuk fn 1-10 Hz |
| **Damping ratio ζ** | c = N+1 atau c = (N+1)/10 | c kecil dengan k=100 → underdamped saat N kecil |
| **DMF (Dynamic Magnification)** | r = (N+1)/50 | Range 0.02-2.0 cover sub-resonance, resonance, super-resonance |
| **Transmissibility T_R** | r = 1.5 + 0.04·N | r > √2 (≈1.414) untuk isolasi efektif |
| **RPM/ω angular** | rpm = (N+1)·30 atau ω = N+1 | Real-world 30-3000 RPM; ω 1-100 rad/s |
| **Forces F₀** | F₀ = (N+1)·10 | Newton range realistis (10-1000 N) |
| **Q-factor** | ζ = (N+1)/200 | ζ kecil → Q tinggi (0.005-0.5 → Q ∞-1) |
| **Exponential decay ratio** | x₂/x₁ = exp(−(N+1)/100) | Realistic damping pattern |
| **FFT dominant frequency** | f₁ = N+1 Hz | 1-100 Hz cover most mech vibration |

### 32.8 Migration Guide (Updating Existing Questions)

Untuk mengganti formula opaque → NIM-direct:

**Step 1: Identifikasi parametric questions**
```bash
grep -n "parametric: true\|compute: (N)" uts_questions.js
```

**Step 2: Pilih 1 variabel target**
- Lihat tabel §32.7 untuk rekomendasi per tipe konsep
- Pilih variabel yang paling natural di-tie ke N
- Variabel lain → set sebagai constant

**Step 3: Replace compute body**
- Ganti formula complex → simple direct
- Tambahkan comment `// FORMULA EKSPLISIT: ...`

**Step 4: Rewrite text**
- Header: `Berdasarkan NIM Anda, <b>N = ${N}</b>:<br>`
- Setiap variabel: `• <b>var = formula = ${value}</b><br>` atau `• <b>var = value</b> (tetap)<br>`
- Question prompt di akhir

**Step 5: Untuk Comp questions, rewrite hint**
- Header: `# N = ${N} (dari NIM Anda)`
- Setiap variabel: `var = ${value}  # = formula` atau `var = ${value}        # tetap`

**Step 6: Verify math correctness**
- Jalankan test boundary di §32.6
- Pastikan 100% pass

**Step 7: Update HTML**
- Re-inject uts_questions.js → UTS HTML
- Validate inline & module JS syntax

**Step 8: Audit checklist (§31)**
- Centang semua item NIM-Direct di §31

### 32.9 Lessons Learned dari UTS Redesign v7

1. **140/140 math tests pass** setelah redesign 28 soal — proof bahwa pattern stabil di boundary N values
2. **Comment marker** `// FORMULA EKSPLISIT:` di setiap compute body sangat membantu code review (jumlah occurrence = jumlah parametric questions)
3. **Distribusi answer balance tidak perlu sempurna** — yang penting math correct; distribusi natural OK (e.g., TF4 di v7: 56% FALSE, 44% TRUE — balanced enough)
4. Gunakan **tag `(tetap)`** untuk variabel constant — mahasiswa appreciate clarity, mengurangi pertanyaan
5. **Diagram SVG kompatibel** — most helpers (`springMass`, `springMassDamper`, `dmfCurve`, `trCurve`, `decay`) menerima new variable values tanpa perubahan
6. **Range validation important** — setelah pilih formula, cek output di N=0 dan N=99 untuk pastikan parameter tidak degenerate (e.g., ζ=0 atau m=0)
7. **Re-injection ke HTML** — pakai unique boundary string (`// UTS GETARAN MEKANIK — Definisi Soal` ... `window.shuffleSeed = shuffleSeed;`) untuk safe replace

### 32.10 Forward Compatibility

Pattern ini berlaku untuk:
- ✓ UTS (Getaran Mekanik, Matematika 4, Optimalisasi & Otomasi)
- ✓ Tugas individual berbasis NIM di Modul reguler
- ✓ UAS (jika ada parametric questions)
- ✓ Latihan / Quiz parametric

Tidak berlaku untuk:
- ✗ Soal sama untuk semua (non-parametric) — tidak perlu N
- ✗ Group assignment — N bisa jadi group_id, formula sama
- ✗ Soal teori murni (definisi, konsep) — tidak ada perhitungan


## 33. Prosedur Pengisian Lembar UTS dengan Acuan Asesmen JSON (BARU di v8)

### 33.1 Konteks & Motivasi

Lembar UTS adalah dokumen Word formal (`.docx`) yang dilampirkan ke RPS sebagai struktur soal yang akan diujikan. Bobot di lembar UTS **harus sinkron** dengan rencana asesmen yang sudah ter-register di Excel 1D / SIA universitas. Inkonsistensi (misal: lembar UTS catat kontribusi 25% tapi RPS catat 20%) menyebabkan masalah administratif saat input nilai akhir mata kuliah dan menghambat audit akreditasi.

**Masalah yang sering muncul tanpa pedoman ini:**
- Bobot per Sub-CPMK di lembar UTS tidak sinkron dengan plan asesmen di Excel 1D
- Jumlah soal dan distribusi tidak proportional terhadap bobot Sub-CPMK
- Saat plan asesmen di-update, lembar UTS tidak ikut di-update (drift)
- Multiple mata kuliah dengan format berbeda — sulit cross-check
- Auditor kesulitan mem-verify bahwa konten ujian align dengan CPMK

**Solusi:** **Asesmen JSON** sebagai *single source of truth* yang di-reference oleh lembar UTS, lembar UAS, RPS, dan template-template asesmen lain.

### 33.2 Asesmen JSON — Single Source of Truth

Setiap mata kuliah memiliki satu file `Asesmen-<Mata-Kuliah>.json` di project root yang mendefinisikan rencana asesmen lengkap. Schema ini di-shared antara lembar UTS, lembar UAS, dan template tugas.

**Lokasi file (currently maintained):**

```
project/
├── Asesmen-Getaran-Mekanik.json          (UTS 25%, UAS 24%, Tugas 51%)
├── Asesmen-Matematika-4.json             (UTS 31%, UAS 30%, Tugas 39%)
└── Asesmen-Optimalisasi-dan-Otomasi.json (UTS 20%, UAS 20%, Tugas 60%)
```

**Schema JSON (excerpt):**

```json
{
  "mata_kuliah": {
    "nama": "Getaran Mekanik",
    "kode_mk": "W132500020",
    "sks": 2,
    "program_studi": "S1 Teknik Mesin",
    "fakultas": "Fakultas Teknik",
    "universitas": "Universitas Mercu Buana",
    "dosen_pengampu": "Dedik Romahadi, ST., M.Sc"
  },
  "asesmen": {
    "satuan_bobot": "persen",
    "komponen": ["praktikum", "tugas", "uts", "uas"],
    "total_per_komponen": {
      "praktikum": 0,
      "tugas": 51,
      "uts": 25,
      "uas": 24
    },
    "total_keseluruhan": 100
  },
  "ringkasan_cpmk": [
    { "cpmk": "CPMK 1", "sub_cpmk_anggota": [...], "total_bobot": 21 },
    ...
  ],
  "sub_cpmk": [
    {
      "kode": "Sub-CPMK 1.1",
      "cpmk_induk": "CPMK 1",
      "deskripsi": "Memahami Konsep dasar getaran mesin",
      "bobot": { "praktikum": 0, "tugas": 3, "uts": 5, "uas": 0 },
      "total": 8
    },
    ...
  ]
}
```

**Field kunci untuk lembar UTS:**

| Field JSON | Tujuan di Lembar UTS |
|------------|----------------------|
| `mata_kuliah.nama` | Header dokumen |
| `mata_kuliah.kode_mk` | Header subtitle |
| `mata_kuliah.sks` | Info table |
| `mata_kuliah.dosen_pengampu` | Info table + signature |
| `asesmen.total_per_komponen.uts` | Header info table — "Bobot Persentase Asesmen" |
| `sub_cpmk[i].kode` | Sub CPMK column di tabel soal |
| `sub_cpmk[i].deskripsi` | Reference untuk konten Sub-CPMK |
| `sub_cpmk[i].bobot.uts` | Bobot column per Sub-CPMK group di tabel soal |

### 33.3 Mapping JSON → Lembar UTS

#### A. Header Info Table (Page 1)

Field "Bobot Persentase Asesmen" diisi **persis sama** dengan `asesmen.total_per_komponen.uts`:

```
Bobot Persentase Asesmen: 25% (sesuai dengan rencana pembobotan asesmen di Excel 1D)
                          ^^^
                          asesmen.total_per_komponen.uts
```

#### B. Tabel Soal (Page 2 onward)

Untuk setiap Sub-CPMK dengan `bobot.uts > 0`:

| Field di Lembar | Sumber JSON | Catatan |
|-----------------|-------------|---------|
| Kolom Sub CPMK | `sub_cpmk[i].kode` | vMerge across rows in group |
| Kolom No. Pertanyaan | P1, P2, ... assigned per soal | Sequential numbering, unique |
| Kolom Pertanyaan/Soal | Konten custom (ikuti §32 NIM-Direct) | Per soal, dengan diagram if applicable |
| Kolom Sub-Bobot | Distributed within group | Sum per group = `sub_cpmk[i].bobot.uts` |
| Kolom Bobot | `sub_cpmk[i].bobot.uts` | vMerge across rows in group |

**Sub-CPMK yang DIFILTER:** hanya Sub-CPMK dengan `sub_cpmk[i].bobot.uts > 0` masuk ke lembar UTS. Sub-CPMK dengan `bobot.uts == 0` (misal hanya dinilai di Tugas atau UAS) **TIDAK** masuk ke lembar UTS — meskipun Sub-CPMK tersebut existing di JSON.

### 33.4 Algoritma Pengisian (Pseudo-Code)

```python
import json

def build_uts_lembar(asesmen_json_path, output_docx_path, soal_per_sub_cpmk):
    """
    Build lembar UTS dari asesmen JSON + content soal.
    
    asesmen_json_path: path ke Asesmen-<MK>.json
    output_docx_path: target .docx output
    soal_per_sub_cpmk: dict {kode_sub_cpmk: [list of question dicts]}
                      e.g. {"Sub-CPMK 1.1": [
                        {"p_num": "P1", "segments": [...], "diagram": None, "sub_bobot": 1},
                        ...
                      ]}
    """
    # 1. Load asesmen JSON (single source of truth)
    with open(asesmen_json_path) as f:
        asesmen = json.load(f)
    
    # 2. Filter hanya Sub-CPMK yang dinilai di UTS
    uts_sub_cpmk = [s for s in asesmen['sub_cpmk'] if s['bobot']['uts'] > 0]
    
    # 3. Set "Bobot Persentase Asesmen" di info table header
    total_uts_pct = asesmen['asesmen']['total_per_komponen']['uts']
    set_field(docx, 'Bobot Persentase Asesmen', 
              f'{total_uts_pct}% (sesuai dengan rencana pembobotan asesmen di Excel 1D)')
    
    # 4. Build tabel soal dengan vMerge per Sub-CPMK group
    for sub in uts_sub_cpmk:
        kode = sub['kode']                    # e.g. "Sub-CPMK 1.1"
        group_bobot = sub['bobot']['uts']     # e.g. 5
        questions = soal_per_sub_cpmk[kode]   # list of N questions
        
        # 4a. Validasi: sum sub-bobot dalam group HARUS = group_bobot
        sum_sub_bobot = sum(q['sub_bobot'] for q in questions)
        assert sum_sub_bobot == group_bobot, \
            f'{kode}: sub-bobot sum {sum_sub_bobot} ≠ group_bobot {group_bobot}'
        
        # 4b. Build rows dengan vMerge
        for i, q in enumerate(questions):
            is_first = (i == 0)
            row = make_row(
                sub_cpmk=kode if is_first else None,
                p_num=q['p_num'],
                segments=q['segments'],
                diagram=q.get('diagram'),
                sub_bobot=q['sub_bobot'],
                group_bobot=group_bobot if is_first else None
            )
            append_to_table(docx, row)
    
    # 5. Validasi total tabel == total UTS di JSON
    table_total = sum(s['bobot']['uts'] for s in uts_sub_cpmk)
    assert table_total == total_uts_pct, \
        f'Tabel total {table_total} ≠ asesmen.total_per_komponen.uts {total_uts_pct}'
    
    # 6. Set Catatan Tambahan dengan info dari JSON
    set_catatan_bobot_uts(docx, total_uts_pct)  # bullet "Bobot UTS = {pct}%"
    
    # 7. Save .docx
    save_docx(docx, output_docx_path)
```

### 33.5 vMerge Pattern untuk Sub CPMK & Bobot Columns

Kolom Sub CPMK dan Bobot di-merge vertikal agar setiap Sub-CPMK group tampak sebagai satu blok visual yang kohesif.

**XML structure (OOXML):**

```xml
<!-- First row of group: vMerge="restart" -->
<w:tr>
  <w:trPr><w:cantSplit/></w:trPr>  <!-- prevent mid-row page break -->
  <w:tc>
    <w:tcPr><w:vMerge w:val="restart"/></w:tcPr>
    <w:p><w:r><w:t>Sub CPMK 1.1</w:t></w:r></w:p>
  </w:tc>
  <w:tc>...P1 cells (No, Pertanyaan, Sub-Bobot)...</w:tc>
  <w:tc>
    <w:tcPr><w:vMerge w:val="restart"/></w:tcPr>
    <w:p><w:r><w:t>5</w:t></w:r></w:p>
  </w:tc>
</w:tr>

<!-- Continuation rows: vMerge (no val) + empty paragraph -->
<w:tr>
  <w:trPr><w:cantSplit/></w:trPr>
  <w:tc>
    <w:tcPr><w:vMerge/></w:tcPr>
    <w:p/>  <!-- WAJIB ada empty paragraph -->
  </w:tc>
  <w:tc>...P2 cells...</w:tc>
  <w:tc>
    <w:tcPr><w:vMerge/></w:tcPr>
    <w:p/>
  </w:tc>
</w:tr>
```

**Aturan vMerge:**
- First row of group: `<w:vMerge w:val="restart"/>` + content paragraph
- Continuation rows: `<w:vMerge/>` (tanpa `val`) + **empty paragraph** (jangan kosong total)
- Setiap row WAJIB punya `<w:cantSplit/>` di `<w:trPr>` agar row tidak terbelah antar halaman
- Lebar cell (`<w:tcW>`) harus consistent across merged rows

### 33.6 Distribusi Sub-Bobot per Soal — 3 Pendekatan

**Pendekatan A — Sub-bobot integer (CLEANEST, recommended):**

Jumlah soal per Sub-CPMK = bobot UTS, dengan sub-bobot = 1 per soal.

```
Sub-CPMK 1.1 (bobot UTS 5) → 5 soal × 1 = 5 ✓
Sub-CPMK 1.2 (bobot UTS 4) → 4 soal × 1 = 4 ✓
Sub-CPMK 2.2 (bobot UTS 10) → 10 soal × 1 = 10 ✓
```

Cocok untuk: kasus dengan jumlah soal yang available >= bobot UTS. Reference: Getaran Mekanik v8 dan Matematika 4 menggunakan pendekatan ini.

**Pendekatan B — Mixed integer/half (saat soal lebih banyak dari bobot):**

Jumlah soal > bobot, dengan beberapa soal "primary" (sub-bobot 1) dan "supplementary" (sub-bobot 0.5).

```
Sub-CPMK 2.1 (bobot UTS 3) → 4 soal: 1 + 0.5 + 0.5 + 1 = 3 ✓
Sub-CPMK 3.1 (bobot UTS 3) → 4 soal: 1 + 0.5 + 1 + 0.5 = 3 ✓
```

Cocok untuk: kasus jumlah soal > bobot. Pilih soal "primary" yang utama (calculation core) dan "supplementary" sebagai derivative/extension question.

**Pendekatan C — Fractional decimal (HINDARI kecuali tidak ada cara lain):**

```
Sub-CPMK 1.3 (bobot UTS 2) → 6 soal: 0.33 each ≈ 2 (rounding awkward)
```

Hindari karena: tampilan bobot 0.33 di tabel terlihat tidak professional, sum eksak sulit dicapai (0.33×6 = 1.98), reader sulit interpretasi.

**Solusi alternatif:** kurangi jumlah soal (gabung 2 soal menjadi 1, atau pindahkan ke Sub-CPMK lain) sehingga Pendekatan A atau B applicable.

### 33.7 Validasi Konsistensi (Checklist)

Setelah generate lembar UTS, jalankan checklist berikut sebelum finalisasi:

#### Bobot consistency

- [ ] `header.Bobot Persentase Asesmen` (xx%) **==** `asesmen.total_per_komponen.uts` di JSON
- [ ] Sum `bobot column` di tabel **==** `asesmen.total_per_komponen.uts`
- [ ] Untuk tiap Sub-CPMK group: `sum(sub_bobot dalam group)` **==** `group_bobot`
- [ ] Untuk tiap Sub-CPMK group: `group_bobot` di tabel **==** `sub_cpmk.bobot.uts` di JSON
- [ ] Catatan Tambahan bullet "Bobot UTS = {pct}%" **==** `asesmen.total_per_komponen.uts`

#### Coverage consistency

- [ ] Sub-CPMK yang ada di tabel **==** Sub-CPMK dengan `bobot.uts > 0` di JSON
- [ ] Tidak ada Sub-CPMK di tabel yang `bobot.uts == 0` di JSON (false positive)
- [ ] Tidak ada Sub-CPMK dengan `bobot.uts > 0` yang missing dari tabel (false negative)

#### Question consistency

- [ ] P numbers unique (no duplicates di seluruh tabel)
- [ ] Cross-references valid (e.g., "Dari sistem P5" hanya ada jika P5 actually exists)
- [ ] Setiap soal di group X benar-benar menguji kompetensi Sub-CPMK X (alignment topical dengan deskripsi Sub-CPMK)
- [ ] Setiap diagram unik (no duplicates) atau punya justifikasi reuse

#### vMerge consistency

- [ ] Sub CPMK column merged across all rows in group (first row restart, others continue)
- [ ] Bobot column merged across all rows in group (first row restart, others continue)
- [ ] Setiap row punya `<w:cantSplit/>` di `<w:trPr>` agar tidak terbelah antar halaman

#### Layout consistency

- [ ] Page count ≤ 4 (target standar lembar UTS)
- [ ] Setiap halaman terisi (no excessive whitespace di bottom)
- [ ] Catatan Tambahan terbaca lengkap (tidak ada bullet yang terpotong)

### 33.8 Contoh: 3 Mata Kuliah Reference

Tabel di bawah menunjukkan bagaimana 3 mata kuliah terkonfigurasi via asesmen JSON dan ter-render di lembar UTS:

| Mata Kuliah | JSON file | Total UTS | Sub-CPMK Aktif (di UTS) | Distribusi Bobot per Sub-CPMK |
|-------------|-----------|:--:|---|---|
| **Getaran Mekanik** | `Asesmen-Getaran-Mekanik.json` | **25%** | 7 (1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2) | 5 + 4 + 2 + 3 + 3 + 5 + 3 = 25 |
| **Matematika 4** | `Asesmen-Matematika-4.json` | **31%** | 5 (1.1, 1.2, 2.1, 2.2, 2.3) | 5 + 6 + 5 + 10 + 5 = 31 |
| **Optimalisasi & Otomasi** | `Asesmen-Optimalisasi-dan-Otomasi.json` | **20%** | 5 (1.1, 1.2, 1.3, 2.2, 2.3) | 5 + 5 + 4 + 3 + 3 = 20 |

**Pattern terlihat dari 3 MK reference:**

- **Total UTS bervariasi** (20–31%) — bergantung pada kebijakan dosen/prodi di Excel 1D
- **Jumlah Sub-CPMK aktif di UTS**: 5–7 (subset dari total Sub-CPMK MK)
- **Bobot per Sub-CPMK**: range 2–10 (Matematika 4 punya 1 Sub-CPMK dengan bobot 10 = PD Euler — kasus heavy-weight)
- **Implementasi konsisten** karena schema JSON identical untuk semua MK — tooling yang sama bisa dipakai
- **Praktikum 0%** untuk semua 3 MK (current period) — tidak masuk lembar UTS

### 33.9 Update Pattern: Saat Plan Asesmen Berubah

Jika dosen perlu mengubah bobot asesmen (contoh: ada penambahan jam tatap muka, redistribusi UTS/UAS, atau hasil rapat prodi):

```
1. Edit Asesmen-<MK>.json (update bobot.uts atau total_per_komponen.uts)
2. Validasi internal JSON:
   - sum(sub_cpmk[i].bobot.uts) == total_per_komponen.uts
   - sum(semua komponen) == 100%
   - total_keseluruhan == 100
3. Re-generate lembar UTS dari JSON yang ter-update
4. Verify Bobot Persentase Asesmen di header = total UTS baru
5. Verify vMerge groups match jumlah soal baru
6. Verify Catatan bullet "Bobot UTS = {pct}%" updated
7. Sync update ke Excel 1D di SIA universitas (jika belum)
8. Inform mahasiswa via platform digital UTS jika ada perubahan substansial
```

**Anti-pattern:** Edit lembar UTS langsung tanpa update JSON, atau update Excel 1D tanpa update JSON. Konsekuensi: drift antara JSON, lembar UTS, dan Excel 1D — sulit di-track saat audit akreditasi (BAN-PT/LAM-Teknik mengevaluasi konsistensi rencana asesmen vs implementasi).

### 33.10 Cross-References ke Section Lain

Section ini melengkapi dan terhubung dengan:

- **§27 (UTS Architecture)** — skoring 70-poin internal UTS di platform digital, konversi ke 100. Lembar UTS adalah representasi formal soal yang akan diujikan; platform digital adalah implementasi-nya.
- **§28 (Inline SVG Diagram Pattern)** — diagram di lembar UTS (rendered ke PNG) dan di platform digital (inline SVG) berasal dari konsep visual yang sama. Lihat §28 untuk reference 10 jenis diagram (`springMass`, `springMassDamper`, `harmonicMotion`, `threeRegimes`, `dmfCurve`, `trCurve`, `fftSpec`, `decay`, dst.)
- **§30 (Google Drive Link Submission)** — workflow submission `.ipynb` → Drive → link di platform → Export HTML → submit ke LMS UMB. Workflow ini disebutkan di Catatan Tambahan lembar UTS.
- **§32 (NIM-Direct Variable Pattern)** — pattern formula `var = formula = computed_value` untuk soal parametric per NIM yang masuk ke lembar UTS. Setiap soal di lembar UTS yang parametric WAJIB ikuti §32.

**Note untuk UAS:** Procedure di §33 ini juga berlaku untuk lembar UAS dengan substitusi field `uts` → `uas` di JSON. Sub-CPMK yang aktif di UAS biasanya berbeda dari yang di UTS (lihat distribusi di tabel §33.8 — Getaran Mekanik UAS mencakup Sub-CPMK 3.3, 4.1, 4.2, 5.1, 6.1, 6.2, 6.3 yang tidak diujikan di UTS).

### 33.11 Pattern Tidak Berlaku Untuk

- ✗ **Lembar Praktikum** — bobot praktikum biasanya 0% di plan asesmen current; jika praktikum dilakukan, biasanya ditangani via report lab terpisah (bukan struktur soal formal Word)
- ✗ **Tugas individual** — bobot tugas ada di JSON (`bobot.tugas`) tapi tidak butuh lembar formal Word; ditangani via platform digital langsung dengan pattern §32 NIM-Direct dan §15 Tab Tugas
- ✗ **Quiz harian** — micro-assessment yang tidak ter-formalize di Excel 1D; ditangani secara informal di Modul reguler
- ✓ **Lembar UTS** — fokus utama section ini
- ✓ **Lembar UAS** — pattern sama dengan substitusi field `uts` → `uas` di JSON dan templating

### 33.12 Tools Referensi

Untuk implementasi automasi, gunakan stack berikut:

| Task | Tool/Library | Catatan |
|------|--------------|---------|
| Load JSON | `json` (Python builtin) | Standard library |
| Generate .docx | `python-docx` atau direct OOXML manipulation | Direct OOXML untuk control penuh atas vMerge |
| Generate diagram PNG | `matplotlib` | Konversi dari SVG concept di §28 |
| Validasi DOCX | `pack.py` di `/mnt/skills/public/docx/scripts/office/` | Auto-validates struktur OOXML |
| Convert ke PDF | `soffice.py` (LibreOffice headless) | Pastikan font Times New Roman tersedia |
| Preview PDF | `pdftoppm` | Untuk visual check halaman by halaman |

**Reference implementation:** Lihat `rebuild_v8.py` (Getaran Mekanik) sebagai contoh end-to-end script yang load asesmen JSON, generate diagrams, build vMerge tabel, set header, replace Catatan Tambahan, validate, pack, dan convert ke PDF dalam single execution.

---

## 34. Strategi Mitigasi `API Stream Idle Timeout` (BARU di v14)

### 34.1 Konteks

Saat AI assistant (Claude Code) melakukan refactor besar pada satu modul HTML/JS (mis. menulis ulang 4 fungsi animasi canvas atau mengganti 1500+ baris JS), seringkali muncul error:

```
API Error: Stream idle timeout - partial response received
```

Penyebab: koneksi streaming antara client (Claude Code) dan API Anthropic terputus karena (1) respons terlalu panjang tanpa jeda token, (2) tool call dengan parameter Edit/Write berukuran besar (50KB+) yang butuh waktu lama untuk di-format, (3) latency jaringan atau congestion server. **Akibatnya:** generasi respons cut off di tengah jalan, tool call yang sedang diformat tetapi belum selesai dieksekusi **hilang seluruhnya**, kerja terbuang.

### 34.2 Symptom Umum (Indikator Masalah)

| Symptom | Diagnosa | Severity |
|---------|----------|----------|
| Error muncul setelah Edit besar (>50KB) | Tool call timeout selama formatting | 🔴 High — tool call hilang total |
| Error muncul saat replace block 500+ baris | Stream idle (server tidak menerima delta cukup cepat) | 🔴 High |
| Error muncul random di operasi kecil | Network blip / congestion | 🟡 Medium — retry biasanya berhasil |
| Working tree dirty tanpa progress di file | Edit tidak ter-apply, perlu retry | 🔴 High — hook stop-git-check trigger |
| File ter-update tapi commit hilang | Edit sukses tapi commit message timeout | 🟡 Medium — tinggal commit ulang |

### 34.3 Strategi Mitigasi — Chunked Commit Pattern

**Prinsip utama:** *Pecah pekerjaan besar menjadi unit-unit kecil yang masing-masing bisa di-commit dalam waktu singkat.* Setiap commit yang berhasil push ke remote = checkpoint yang aman dari timeout.

#### Pattern 1: Per-Animasi Commit (Refactor Canvas)

Untuk pekerjaan refactor 4–8 fungsi canvas drawing seperti yang dilakukan di Modul-8 LP & Modul-9 NLP:

```
Commit 1: HTML panel updates (deskripsi, slider, tip-box) untuk seluruh modul
Commit 2: JS drawPhysics rewrite (Animasi 1)
Commit 3: JS drawSweep rewrite (Animasi 2)
Commit 4: JS drawIso rewrite (Animasi 3)
Commit 5: JS drawHPB rewrite (Animasi 4)
```

**Keuntungan:**
- Setiap commit ~150–250 baris JS = aman dari timeout (Edit ≤30KB)
- Jika timeout di tengah commit 3, commit 1 & 2 sudah aman di remote — tinggal lanjut
- Code review per-commit lebih mudah, granular history
- Kalau ada bug di satu animasi, tidak revert seluruh refactor

**Push setelah tiap commit?** Tidak wajib per commit, tetapi WAJIB push setelah selesai semua atau setiap 3–5 commit. Stop-git-check hook akan trigger jika `git status` dirty.

#### Pattern 2: HTML Then JS (Tier-Layered Edit)

Untuk modul yang dibangun dari template (mis. copy Modul-8 → Modul-9):

```
Commit 1: HTML title, brand, MODULE_ID, RELATED_MODULES configs (sed-based, ringan)
Commit 2: Hero section HTML (baru, replace block ≤200 baris)
Commit 3: Bagian 01 HTML
Commit 4: Bagian 02 HTML
... (lanjut per Bagian)
Commit N: Tugas section MC
Commit N+1: Tugas section Comp
Commit N+2: Forum section
Commit N+3: JS animations (lebih besar — pecah lagi jika perlu)
```

**Trade-off:** lebih banyak commit history, tetapi tahan timeout. Squash dengan `git reset --soft HEAD~K` di akhir kalau ingin ringkas history.

#### Pattern 3: Write File + Bash Splice (Untuk Edit Sangat Besar)

Untuk replacement blok > 1000 baris JS yang sering timeout sebagai single Edit:

```bash
# 1. Tulis kode baru ke file terpisah (lebih cepat dari Edit besar)
Write: /tmp/new-anim-block.js  ← 1500 lines

# 2. Splice via Bash dengan sed/python
python3 -c "
with open('Modul-N.html') as f: lines = f.readlines()
start = next(i for i,l in enumerate(lines) if 'ANIMASI 1 START' in l)
end   = next(i for i,l in enumerate(lines) if 'ANIMASI 4 END' in l)
with open('/tmp/new-anim-block.js') as f: new = f.readlines()
lines[start:end+1] = new
with open('Modul-N.html', 'w') as f: f.writelines(lines)
"
```

**Catatan:** kurang elegan tapi sangat efektif untuk Edit yang konsisten timeout. Pilih ini sebagai escape hatch terakhir.

### 34.4 Pencegahan Proaktif

**Sebelum mulai pekerjaan besar, deteksi dini:**

1. **Estimasi size** — kalau replacement > 500 baris atau > 30KB, langsung pecah jadi 3+ chunks
2. **Sediakan `claude/<task-name>` branch terpisah** — jangan kerja langsung di `main` agar revert mudah
3. **Set TodoWrite dengan granularitas commit** — tiap todo = 1 commit (bukan 1 fungsi besar)
4. **Push `git push -u origin <branch>` setelah commit pertama** — establish remote tracking lebih awal

**Saat mengetik prompt panjang ke Claude Code, hindari:**
- ❌ "Write 4 animations: gradient descent, Newton, multi-modal, KKT — all in one go"
- ✅ "Write Animasi 1 only: gradient descent on contour. Setelah selesai, kita commit lalu lanjut animasi 2."

### 34.5 Recovery Procedure (Setelah Timeout)

Jika terjadi timeout di tengah kerja:

```bash
# 1. Cek status — apakah edit ter-apply atau hilang
git status
git diff --stat

# 2. Kalau working tree dirty dengan partial change yang inconsistent
#    (mis. HTML mention LP tapi JS masih FFT) → REVERT supaya tree bersih
git restore <file>

# 3. Atau kalau partial change sudah konsisten internal (mis. cuma 1 animasi
#    selesai dari 4) → COMMIT dulu agar tidak hilang
git add -A && git commit -m "wip: partial Animasi 1 (incomplete refactor)"
git push -u origin <branch>

# 4. Lalu lanjut dari titik commit terakhir
```

**Aturan emas:** **JANGAN BIARKAN WORKING TREE DIRTY > 10 MENIT.** Stop-hook akan firing terus, dan kalau tiba-tiba laptop hibernate / battery die, semua perubahan in-memory hilang.

### 34.6 Anti-Pattern: Yang HARUS Dihindari

| Anti-Pattern | Risiko | Solusi |
|--------------|--------|--------|
| Single Edit dengan 2000+ baris old_string + 2000+ new_string | 90%+ timeout rate | Pecah jadi 4–8 Edit kecil |
| Refactor 4 animasi sekaligus dalam 1 Edit | Kalau timeout, semua hilang | 1 commit per animasi |
| Tidak push setelah 5+ commit lokal | Risk hilang kalau git error | Push tiap 3–5 commit |
| Edit file 100KB+ tanpa branch terpisah | Sulit revert kalau ada masalah | Selalu branch `claude/*` |
| Lupa update TodoWrite saat commit incremental | Lost progress tracking | Update tiap todo selesai |
| Ignore stop-hook warning | Hook trigger berulang, working tree polluted | Commit/push/revert sesuai konteks |

### 34.7 Checklist Pre-Flight (Sebelum Refactor Besar)

Sebelum mulai refactor JS canvas atau replacement blok besar:

- [ ] **Branch terpisah** sudah dibuat (`git checkout -b claude/<task>`)
- [ ] **TodoWrite** sudah di-set dengan 1 todo per chunk planned
- [ ] **Estimasi size** sudah dihitung — < 30KB per Edit?
- [ ] **Push** awal `git push -u origin <branch>` sudah dilakukan untuk establish tracking
- [ ] Mengetahui **point-of-no-return**: kalau Edit ke-3 dari 5 timeout, apakah commit 1–2 sudah aman? (harus: ya)
- [ ] **Test plan** sudah dipikirkan sebelum mulai (apa yang dicek setelah selesai)

### 34.8 Lessons Learned: Modul-8 LP & Modul-9 NLP Animation Refactor

**Kasus:** Refactor 8 fungsi canvas animation (4 di Modul-8, 4 di Modul-9) — total ~1700 baris JS baru, masing-masing 200–400 baris.

**Yang berhasil:**
- ✅ Branch terpisah `claude/fix-animations` dari awal
- ✅ HTML panel update sebagai commit pertama (ringan, ≤ 7KB)
- ✅ 1 commit per animasi (8 commit kerja inti)
- ✅ Push tiap 4 commit sebagai checkpoint
- ✅ Final squash via PR merge (history main bersih)

**Yang gagal (versi pertama, sebelum strategi chunked):**
- ❌ Coba single Edit untuk 4 animasi sekaligus → timeout ~70% rate
- ❌ Tidak ada branch terpisah → revert susah
- ❌ Working tree dirty 30+ menit → stop-hook trigger berulang

**Output:** Strategi chunked commit menyelamatkan ~12 jam kerja dari kemungkinan hilang akibat timeout. **Pattern ini sekarang menjadi standar.**

---

*Pedoman v14 — April 2026 (akhir bulan, post-Animasi-Topic-Alignment + API Timeout Mitigation).*
*Update v14: §14.1.1 BARU — aturan WAJIB animasi canvas harus sesuai topik modul (anti copy-template-mismatch); §14.1.2 reference mapping animasi per topik (FFT/LP/NLP); §14.1.3 strategi audit pre-merge. §34 BARU — strategi mitigasi `API Stream Idle Timeout` dengan chunked commit pattern (per-animasi commit, HTML-then-JS layered, write+splice escape hatch); recovery procedure setelah timeout; checklist pre-flight refactor besar; lessons learned dari Modul-8 LP & Modul-9 NLP animation refactor (8 animasi, 1700+ baris JS, zero work loss dengan strategi chunked).*

*Pedoman v13 — April 2026 (akhir bulan, late-month Vibrant Countdown redesign).*
*Update v13: §10.4 BARU — Vibrant Visual Treatment countdown (aurora konik berputar, gradient border 4-warna, ring 130px halo radial pulsing, gradient-text angka, neon glow). Applied ke 13 modul.*

*Pedoman v12.1 — April 2026 (akhir bulan, hotfix restore handler tidak menandai opsi benar).*
*Update v12.1: §25.11 di-revisi — fallback `mcAnswered`/`mcScores` saja TIDAK CUKUP. Restore handler `_loadScoredQuestions` wajib menandai opsi benar via parsing `onclick` attribute (`selectMC(...,this,true)`) supaya `correctOpt` tersedia di build `mcData`. Tanpa ini, export menampilkan "(Sudah dijawab — pilihan salah)" walau ✓ hijau (inkonsisten visual). Applied ke 24 modul (Modul-4 sudah punya pattern ini sejak awal).*

*Pedoman v12 — April 2026 (akhir bulan, post-Export Tugas consolidation + MC export bug fix).*
*Update v12: §15.1c — score-bar layout konsolidasi (1 tombol Export, baris kedua dengan `#export-blocked-msg` center). §15.3d — konvensi nama mata kuliah di subtitle cover export + filename download (`Tugas{N}_{NIM}_{CourseSlug}.html`) untuk mencegah leakage course asal saat copy modul. §25.10 BARU — bug export PG selalu menampilkan opsi benar (selektor multi-class salah urut) + pattern benar pakai `.radio-option.selected`. §25.11 BARU — bug export PG setelah reload tampil "Belum dijawab" (Firebase restore tidak re-apply `.selected`) + pola fallback ke `mcAnswered`/`mcScores`. §25.8 audit checklist tambah section "Tab Tugas — Export HTML" 8 items. Applied ke 26 modul (Optoauto 1–6, Getaran 1–6, Math 1–14).*

*Pedoman v11 — April 2026 (akhir bulan, post-Reset child-iterate fix).*
*Update v11: §20.2 implementasi reset di-rewrite total dengan pattern child-by-child iteration + reset guard + sequential ordering + hard reload (deterministic, tanpa ambiguitas rule cascade). §20.7 BARU — lesson learned: 2× diagnosa salah sebelum sampai ke fix yang work, documented anti-pattern Promise.all parent-remove + prinsip umum "pilih DETERMINISTIC over singkat-tapi-ambiguous untuk operasi destruktif". §25 BARU — checklist Reset Operations 11 items. Applied ke 6 file (UTS + Modul-1 s/d Modul-5).*

*Pedoman v10 — April 2026 (akhir bulan, post-Forum Copy v2 button-independent).*
*Update v10: §16.3 lesson learned #2 — bahkan dengan always-visible textarea (v9), mahasiswa masih lapor button tidak berfungsi. Root cause: button click sendiri tidak ter-fire di beberapa environment (cache / browser quirk / extension). Fix: `checkForumReady()` auto-populate textarea sambil user mengetik, hilangkan dependency pada button click. Banner text shifted: "Backup Manual Copy" → "HTML Siap di Bawah — Salin Manual" (menggeser primary action dari button → manual). Applied ke 5 modul.*

*Pedoman v9 — April 2026 (akhir bulan, post-Forum Copy foolproof fix).*
*Update v9: §16.3 Tier 3 fallback diganti dari popup window → always-visible inline textarea (foolproof manual copy) — applied ke 5 modul Getaran Mekanik. Sebab: popup sering di-block mobile/ad-blocker → mahasiswa lapor "Copy tidak berfungsi". Audit checklist §25.8 Forum Copy disinkron dengan pattern baru. Konsolidasi §18.1: scoring table dihapus (duplikasi §15.1), retain hanya Firebase markers info.*

*Pedoman v8 — April 2026 (akhir bulan, post-Asesmen JSON formalization).*
*Update v8: §33 Prosedur Pengisian Lembar UTS dengan Acuan Asesmen JSON — 3 MK ter-formalized (Getaran Mekanik 25%, Matematika 4 31%, Optimalisasi & Otomasi 20%) dengan schema JSON identical sebagai single source of truth untuk bobot asesmen, vMerge pattern terdokumentasi, validation checklist 4 kategori, dan reference implementation `rebuild_v8.py`.*

*Pedoman v7 — April 2026 (akhir bulan, post-UTS NIM-Direct redesign).*
*Update: §32 NIM-Direct Variable Pattern (28 soal parametric UTS redesigned), audit checklist v7 dengan section NIM-Direct Variable Pattern.*

*Pedoman v6 — April 2026 (akhir bulan, post-UTS build).*
*Update v6: §26 bug + pattern baru dari UTS build (cross-script scope, feedback display, countdown robustness), §27 arsitektur UTS lengkap, §28 inline SVG diagram pattern, §29 selection persistence + cache restore, §30 Google Drive link submission, §31 audit checklist (now v7).*
*Implementasi referensi: `Modul-1.html` s/d `Modul-5.html` (Getaran Mekanik) + `UTS-Getaran-Mekanik.html`.*


---

*Pedoman ini berdasarkan implementasi `Modul-4.html` — PD Linier Orde N, Matematika 4, S1 Teknik Mesin UMB 2025/2026.*
*Mendukung mata kuliah: Matematika 4 (`math4`), Getaran Mekanik (`getaran_mekanik`), Optimalisasi & Otomasi (`optoauto`).*
*Terakhir diperbarui: April 2026 — refactor multi-course, countdown circular, palet per-tab, hero animations, schedule gating, Firebase Security Rules, sistem PIN mahasiswa 6-digit, password admin SHA-256 hashed, animasi login overlay constellation + electric charges + lightning blasts, Dosen Login Modal dengan password masking, role-based visibility untuk tombol Reset (Atur Jadwal tetap visible sebagai bootstrap action), scoring universal 50 poin (10 MC + 10 Comp E/M + 5 Comp Hard), partial credit +1 poin untuk Comp Hard yang salah, **real-time chat & online presence widget di floating button kanan-bawah** (§24) — mahasiswa saling chat + dosen ikut dengan bubble khusus 🧑‍🏫, privacy preserving (dosen tidak tracked di presence), immutable messages, onDisconnect auto-remove, rate-limit client + server.*
