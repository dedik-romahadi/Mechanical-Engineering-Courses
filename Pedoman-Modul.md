# Pedoman Desain Sistem & Konten — Modul Pertemuan (LMS Multi-Course)

> **Referensi Implementasi:** `Modul-4.html` — PD Linier Orde N, Bernoulli, Reduksi Orde
> **Mata Kuliah Pendukung:** Matematika 4 · Getaran Mekanik · Optimalisasi & Otomasi
> **Program Studi:** S1 Teknik Mesin · Universitas Mercu Buana
> **Dosen:** Dedik Romahadi
> **Tujuan:** Dokumentasi lengkap arsitektur, sistem, dan konten sehingga modul baru dapat dibuat dengan desain identik di tiga mata kuliah berbeda.
>
> **Diperbarui:** April 2026 — mencerminkan refactor Modul-4 (countdown circular, palet per-tab, hero animation per-tab, scoring rule lengkap, Firebase Security Rules, blokir akses di luar jadwal, **sistem PIN 6-digit untuk mahasiswa**, **password admin ter-hash SHA-256**, **animasi login constellation + electric charges + lightning blasts**, **Dosen Login Modal dengan password masking**, **role-based visibility untuk tombol Reset** — tombol Atur Jadwal tetap visible sebagai bootstrap action, **scoring universal 50 poin** dengan 5 soal Komputasi Hard @4 poin, **partial credit +1 poin** untuk Hard yang salah, **status label butuh poin** — Tepat Waktu/Terlambat hanya diberikan jika mahasiswa memperoleh poin > 0 (akses tanpa poin = Belum), **Bolos diperluas** — mencakup juga mahasiswa yang akses tapi 0 poin saat jadwal sudah berakhir, **PIN global lintas-course** — satu PIN per mahasiswa yang berlaku di SEMUA mata kuliah dan modul, disimpan di node `pins/mhs_<NIM>` terpisah dari visitor records sehingga reset modul tidak menghapus PIN, **schedule-gated login** — semua user (dosen & mahasiswa) diblokir login jika schedule tidak ada di database; dosen set jadwal via tombol "🕐 Atur Jadwal" yang password-gated terpisah, **force logout on schedule delete** — semua sesi aktif di-clear saat schedule dihapus/direset, **Firebase Rules tidak support JSON comments** — key `"//"` menyebabkan parsing error di Firebase Console, **content integrity anti-answer-leak** — jangan tambah `✓` atau marker visual di teks opsi benar (pakai HTML comment atau parameter boolean untuk self-documentation), **LMS sanitizer-safe Forum export** — pakai pattern gradient dengan solid fallback untuk survive strip, **MC ABCD shuffle tiap reload** — `shuffleMCOptions()` mengacak konten antar posisi A/B/C/D setiap page load untuk mencegah pattern recognition; Firebase data tetap konsisten karena markers tied ke qId, bukan posisi opsi, **Pyodide lazy-load packages** — `pandas`/`scipy`/`matplotlib` dll tidak bundled di base Pyodide; helper `_ensurePythonPackages()` detect import statements di kode mahasiswa lalu auto-load via `pyodide.loadPackage()` agar soal tidak ke-locked karena ModuleNotFoundError, **draft persistence localStorage** — gdrive link, forum textarea, dan 15 code Komputasi di-save per-NIM via `_saveDraft()/_loadDraft()` agar tidak hilang saat reload; identitas key unification (gunakan `LOCAL_IDENTITY` constant, jangan hardcode) agar nama/NIM muncul di export HTML, **DOM class restore saat reload** — `_loadScoredQuestions()` re-apply `.correct-ans` ke opsi MC yang benar dari onclick attribute parameter `,true)` agar export HTML tampilkan jawaban (bukan "Belum dijawab"), **button state explicit setters** — ganti `cssText.replace()` regex (silent fail-prone) dengan `_setBtnState()` helper yang set individual properties + `pointerEvents:none` sebagai belt-and-suspenders agar tombol disabled tidak accidentally clickable, **Firebase `codes/` field** — code Python Komputasi di-save ke Firebase bersama dengan poin & marker untuk menjamin survive cross-device / incognito / storage clear; localStorage draft hanya complementary untuk gdrive + forum textarea, bukan authoritative storage untuk code).

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
- Package preloaded di init `getPyodide()`: `numpy` saja
- Package lain (`pandas`, `scipy`, `matplotlib`, `sympy`, `scikit-learn`) di-load **on demand** via `_ensurePythonPackages()` helper (lihat §15.3b-2 untuk implementasi)
- Loading: hanya saat tab Tugas pertama kali dibuka (warm-up via DOMContentLoaded listener)
- Singleton: `_pyodideInstance` — tidak re-load antar soal
- Cache loaded packages: `_loadedPyPackages = new Set(['numpy'])`

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
| Countdown number | `.cd-num` | `28px`, JetBrains Mono, weight 800 |
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
4. **Schedule gate** — kalau schedule tidak ada di database, login **ditolak untuk SEMUA role** termasuk dosen. Pesan berbeda per role:
   - Dosen → `⚠ Jadwal belum diatur. Silakan klik tombol "Atur Jadwal" di bawah untuk mengatur jadwal terlebih dahulu.`
   - Mahasiswa → `⚠ Jadwal perkuliahan belum diatur oleh dosen. Mohon tunggu hingga jadwal tersedia.`
   - Rincian lengkap schedule gating flow: lihat §9.5.
5. **Sebelum start** — kalau akses sebelum jadwal mulai → tampilkan jadwal mulai (hanya untuk mahasiswa; dosen bypass untuk preview/testing)
6. **Setelah end** — login tetap berhasil tapi data tidak disimpan ke Firebase (lihat §9)
7. **Cek PIN di Firebase** — bercabang ke modal PIN (lihat §8)

### 7.3 Alur Login Dosen

Ketika nama yang dimasukkan = `"Dedik Romahadi"` (case-insensitive):

1. Validasi format nama saja (NIM bisa kosong)
2. **Schedule gate** (§9.5) — jika schedule tidak ada di database, login **ditolak**, user diarahkan ke tombol "🕐 Atur Jadwal" di login overlay. Dosen dan mahasiswa sama-sama diblokir.
3. Overlay login utama **disembunyikan sementara**
4. Muncul **Dosen Login Modal** (👨‍🏫) — custom modal dengan `<input type="password">`
5. Password tampil sebagai `••••••` saat diketik (bukan plaintext)
6. Password dihash SHA-256 → bandingkan dengan `ADMIN_PW_HASH`
7. Jika match → identitas dosen disimpan di `localStorage`, FAB muncul
8. Jika salah → modal tertutup, overlay login kembali muncul dengan pesan error
9. Enter submit, Escape cancel

> **Kenapa dosen juga diblokir tanpa schedule?** Konsistensi kontrol akses. Tidak ada privilege bypass untuk schedule gate — jalur dosen untuk set schedule ada di tombol terpisah "🕐 Atur Jadwal" yang punya password admin sendiri (§19). Ini memisahkan otoritas "atur jadwal" dari otoritas "login sebagai dosen" agar setiap gate punya proteksi eksplisit.

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
  await set(ref(db, DB_PATH + '/' + key), {
    nama, nim, role: 'student',
    timestamp: nowISO,
    lastVisit: nowISO,
    visitCount: 1,
    points: 0
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
    await set(ref(db, DB_PATH + '/' + key), {
      nama, nim, role: 'student',
      timestamp: nowISO,
      lastVisit: nowISO,
      visitCount: 1,
      points: 0
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

### 9.5 Schedule-Gated Access Control

Selain gating *write* (§9.3), sistem juga menerapkan gating **login/akses**: ketika schedule tidak ada di database (belum diatur, atau baru di-reset/hapus), **semua user diblokir dari login** termasuk dosen. Tidak ada pintu belakang — jalur satu-satunya untuk dosen adalah tombol "🕐 Atur Jadwal" di login overlay, yang mendapat perlindungan password admin terpisah (§19).

**Matriks akses:**

| Role | Schedule ada | Schedule tidak ada |
|------|:-----------:|:------------------:|
| **Dosen** | ✅ Login normal via password admin | ❌ Diblokir — harus klik "Atur Jadwal" dulu |
| **Mahasiswa** | ✅ Login normal via PIN | ❌ Diblokir — tunggu dosen atur jadwal |
| **Tombol "🕐 Atur Jadwal"** | Selalu tersedia (password-gated) | Selalu tersedia (satu-satunya jalur dosen) |

**Rasionalisasi:** jika schedule tidak ada, tidak ada konteks waktu untuk menyimpan data (kapan start/end tidak diketahui → `isLate()` dan `_isScheduleOpen()` tidak dapat dievaluasi). Dosen membutuhkan akses ke fungsi "Atur Jadwal" sebelum data apapun bisa masuk; mahasiswa membutuhkan schedule untuk tahu kapan akses legal. Gate login = gate paling awal dalam rantai proteksi.

**Flow evaluasi saat schedule change:**

```
Schedule snapshot diterima dari Firebase (real-time listener)
         │
         ▼
Evaluasi _handleScheduleReady():
         │
    ┌────┴────┐
    │         │
Schedule    Schedule
  ADA      TIDAK ADA
    │         │
    ▼         ▼
Auto-login   Force logout SEMUA user:
normal       1. localStorage identity di-clear
jika ada     2. Overlay login muncul (paksa)
identity     3. Banner warning tampil di overlay:
local           "⚠ Jadwal perkuliahan belum diatur"
    │        4. FAB & tombol Reset di-hide
    ▼        5. submitVisitor() gate menolak semua login
Normal          — dosen: error + arahkan ke Atur Jadwal
operation       — mahasiswa: error + arahkan tunggu dosen
```

**Prinsip implementasi:**

1. **Real-time evaluasi** — subscribe `onValue(SCHEDULE_PATH)`. Setiap perubahan schedule (termasuk delete) memicu re-evaluasi.
2. **Auto-login gate** — identity di localStorage **tidak dipercaya sendiri**. Harus ada schedule valid terlebih dahulu sebelum overlay bisa dihide.
3. **Force logout symmetric** — saat schedule hilang, localStorage SEMUA role di-clear (tidak ada privilege dosen). Konsistensi > konvinensi.
4. **submitVisitor gate symmetric** — pesan error berbeda per role (dosen diarahkan ke tombol Atur Jadwal, mahasiswa diminta menunggu), tapi keduanya ditolak dengan mekanisme yang sama.

**Dua banner UI yang aktif di state schedule-missing:**

| Banner | Lokasi | Kondisi tampil |
|--------|--------|----------------|
| `#scheduleMissingBanner` | Di dalam login overlay | Schedule tidak ada + overlay sedang tampil |
| `#scheduleMissingDosen` | Di tab Hasil, atas stat cards | Dosen sudah login (`role === 'dosen'`) + schedule tidak ada |

Banner `#scheduleMissingDosen` punya CTA button "🕐 Atur Jadwal Sekarang" yang langsung membuka modal Atur Jadwal. Banner ini otomatis hilang saat schedule berhasil di-save (triggered oleh `_applyRoleVisibility` yang re-run pada setiap `_handleScheduleReady`).

**Skenario edge case — reset modul oleh dosen:**

Dosen klik "🗑 Reset" → `confirmReset()` hapus visitor records + schedule → real-time listener fires → `_handleScheduleReady` deteksi schedule hilang → dosen yang baru saja klik Reset juga ter-logout paksa → overlay login muncul → dosen harus klik "Atur Jadwal" lagi untuk set jadwal baru → setelah saved, bisa login normal. Behavior ini **by design**: reset = state bersih total, termasuk sesi dosen.

**Separation of concerns — `saveSchedule()` vs `confirmReset()`:**

Kedua fungsi **terpisah dan independen**. Dosen tidak perlu (dan tidak boleh) mengkombinasikan keduanya:

| Fungsi | Lingkup | Efek di Firebase |
|--------|---------|------------------|
| `saveSchedule()` (tombol 🕐 Atur Jadwal) | HANYA write ke `SCHEDULE_PATH` | Schedule baru tersimpan, visitor data **tidak disentuh** |
| `confirmReset()` (tombol 🗑 Reset) | Hapus `DB_PATH` + `SCHEDULE_PATH` + related modules | Semua data modul + schedule + related modules dihapus |

**Rationale — kenapa `saveSchedule` TIDAK boleh hapus visitor data:**

1. **Pedoman §20.2 mendefinisikan reset sebagai aksi terpisah** — "Save schedule" adalah operasi administrasi biasa, "Reset" adalah destructive operation yang harus eksplisit
2. **Firebase rules bisa reject cascading delete** — `remove(DB_PATH)` bisa PERMISSION_DENIED karena child `$visitorKey` punya validators complex. `Promise.all` yang mixed (set schedule success + remove visitors fail) akan tampilkan error palsu padahal schedule sudah tersimpan — confusing user
3. **Dosen harus punya kontrol granular** — kadang dosen mau perpanjang deadline (extend schedule) tanpa reset poin mahasiswa. Menggabungkan save+reset menghilangkan opsi ini
4. **Identity dan FAB state tidak diganggu** — dosen yang sudah login tetap login setelah save schedule; tidak perlu double-login

**Implementasi benar:**

```javascript
async function saveSchedule(){
  // ... validasi password, durasi, due date ...
  set(ref(db, SCHEDULE_PATH), {
    start: startDate.toISOString(),
    end:   dueDate.toISOString(),
    duration: dur,
    due: due
  }).then(() => {
    hideScheduleModal();
    // Jangan touch localStorage atau overlay/FAB state —
    // schedule listener akan re-evaluate via _handleScheduleReady secara otomatis.
  }).catch(err => {
    // Tampilkan error — HANYA dari operasi set, bukan dari mixed Promise.all
  });
}
```

**Flow gabungan kalau dosen ingin reset + atur jadwal baru:**

1. Klik 🗑 Reset → masukkan password → confirmReset() hapus semua data + schedule → listener fires → dosen force-logout (§9.5 edge case)
2. Overlay login muncul dengan banner "⚠ Jadwal belum diatur"
3. Dosen klik 🕐 Atur Jadwal → masukkan password (lagi) + fill form → saveSchedule() set schedule baru
4. Dosen login normal dengan password admin

Dua langkah manual, tapi **eksplisit dan auditable**.

---

## 10. Countdown Circular Rings

### 10.1 Desain

4 ring SVG melingkar — **bukan box+separator**. Tiap unit waktu punya warna distinct:

| Unit | Warna | Class |
|------|-------|-------|
| Hari | Violet (`#a855f7`) | `.ring-d` |
| Jam | Cyan (`#0ea5e9`) | `.ring-h` |
| Menit | Green (`#00e09e`) | `.ring-m` |
| Detik | Orange (`#f97316`) | `.ring-s` |

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
```

**Catatan arsitektur:**
- Node `/pins` terpisah dari `/visitors` secara sengaja. Tujuan: (a) satu PIN untuk seluruh mata kuliah (lihat §8), (b) isolasi dari reset modul — delete `/visitors/<course>/<module>` tidak menyentuh PIN, (c) rules lebih sederhana (immutable by design).
- Key `mhs_<NIM>` di `/pins` dan `/visitors/<course>/<module>` sama persis — memudahkan cross-reference saat login flow.

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
| `codes` | object | Key-value `{c1: "...", c2: "...", ...}` — code Python text per soal Komputasi, max 5000 char per value (lihat §15.4c) |
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
          ".read": true,

          "$visitorKey": {
            ".validate": "$visitorKey.matches(/^mhs_[0-9A-Z]{1,20}$/) || $visitorKey === 'dosen'",
            ".read": true,
            ".write": "...",

            "... field validators (lihat implementasi lengkap di database.rules.json)"
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
            "... field validators"
          }
        }
      }
    }
  }
}
```

> **⚠ Warning penting — Firebase Rules tidak support komentar.** Berbeda dengan JSONC atau YAML, Firebase Realtime Database Rules parser menolak key yang diawali `"//"` atau pseudo-comment lainnya. Contoh di atas memakai key dummy `"..."` untuk ilustrasi field validators, tapi di file `database.rules.json` yang dideploy, SEMUA key harus nama path yang valid. Menempatkan komentar seperti `"// explain this rule"` akan menyebabkan error `Line N: Expected '{'` saat Publish di Firebase Console. Simpan semua dokumentasi rules di Pedoman (file ini) atau comment Git commit, bukan di dalam JSON.

> **⚠ Warning penting — jangan pasang `.write` di level `$module`.** Versi awal Pedoman memiliki rule `"$module": { ".write": "!newData.exists()" }` dengan intent "izinkan delete saja". Rule ini ternyata **memblokir semua CRUD di child `$visitorKey`** karena Firebase Rules memiliki *cascading write semantics*: parent `.write` dievaluasi sebelum child rules, dan jika parent return false untuk operasi create/update, child rules tidak pernah dievaluasi. Akibat praktis: Setup PIN → `permission_denied`, update visitCount → `permission_denied`. **Solusi:** hapus `.write` di level `$module`. Gating create/update/delete cukup di level `$visitorKey` dengan rule yang sudah mencover semua kasus via `!data.exists() || !newData.exists() || (update predicates...)`.

**Untuk menambah mata kuliah baru di rules:**
1. Edit dua baris validate `$course` (di `visitors` dan `settings`)
2. Tambah operator `||` dengan slug baru
3. Publish ulang di Firebase Console

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

Delete mahasiswa per-record diizinkan oleh rule `.write` di level `$visitorKey` (cabang `!newData.exists()` — lihat §13.4). Tidak perlu rule `.write` di level `$module` karena Firebase menjalankan delete sebagai series of child-level operations, masing-masing di-authorize oleh `$visitorKey`-level rules.

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

Per topik, buat 1 canvas dengan slider interaktif:

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

### 15.1c Score Bar — Label Dinamis

Score bar di atas soal harus menampilkan **tiga sub-total** agar mahasiswa tahu breakdown:

```html
<div class="score-bar">
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
  <button class="btn-export" id="btn-score-export" onclick="exportTugasHtml()" disabled>📄 Export HTML</button>
</div>
```

Update denominator `/50` di-substitusikan dari `SCORE_CONFIG.TOTAL` agar konsisten jika di masa depan struktur berubah.

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

### 15.3b-2 Pyodide Package Management — Lazy Load on Demand

**Konteks:** Pyodide v0.25.1 (yang digunakan untuk eksekusi Python di browser) **tidak bundle semua scientific packages** di base distribution. Hanya `numpy` yang di-load otomatis saat init `getPyodide()`. Package seperti `pandas`, `scipy`, `matplotlib`, `sympy`, `scikit-learn` harus di-load **on demand** via `pyodide.loadPackage()`.

**Konsekuensi jika tidak di-handle:** Soal yang menggunakan `import pandas` akan gagal dengan error:
```
ModuleNotFoundError: The module 'pandas' is included in the Pyodide distribution,
but it is not installed. You can install it by calling:
  await pyodide.loadPackage("pandas") in JavaScript
```
Lockdown logic Easy/Medium akan **mengunci soal dengan score 0** padahal kode mahasiswa sebenarnya benar — bug yang merugikan mahasiswa.

**Solusi: Lazy-load helper `_ensurePythonPackages(code, fb)`** yang dipanggil di awal `runAndCheck` setelah `getPyodide()`:

```javascript
const _loadedPyPackages = new Set(['numpy']);   // numpy sudah di-load di getPyodide

async function _ensurePythonPackages(code, fb) {
  if (!_pyodideInstance) return;
  const PACKAGE_PATTERNS = [
    { name: 'pandas',       regex: /^\s*(?:import\s+pandas|from\s+pandas\s+import)/m },
    { name: 'scipy',        regex: /^\s*(?:import\s+scipy|from\s+scipy[\s.]|import\s+scipy\.)/m },
    { name: 'matplotlib',   regex: /^\s*(?:import\s+matplotlib|from\s+matplotlib[\s.])/m },
    { name: 'sympy',        regex: /^\s*(?:import\s+sympy|from\s+sympy\s+import)/m },
    { name: 'scikit-learn', regex: /^\s*(?:import\s+sklearn|from\s+sklearn[\s.])/m }
  ];
  const needed = PACKAGE_PATTERNS
    .filter(p => p.regex.test(code) && !_loadedPyPackages.has(p.name))
    .map(p => p.name);
  if (needed.length === 0) return;
  if (fb) {
    fb.className = 'feedback warn';
    fb.textContent = `📦 Memuat package Python: ${needed.join(', ')}... (5-15 detik, sekali saja)`;
  }
  try {
    await _pyodideInstance.loadPackage(needed);
    needed.forEach(p => _loadedPyPackages.add(p));
  } catch (e) {
    if (fb) { fb.className='feedback wrong'; fb.textContent = `❌ Gagal memuat: ${needed.join(', ')}`; }
    throw e;   // re-throw agar runAndCheck tidak lanjut exec
  }
}
```

**Integrasi di `runAndCheck`:**

```javascript
const pyodide = await getPyodide();
await _ensurePythonPackages(code, fb);   // ← NEW: lazy-load packages dari import statements
await pyodide.runPythonAsync('_cap.reset(); sys.stdout = _cap');
// ... lanjut exec
```

**Prinsip implementasi:**

1. **Cache di `Set _loadedPyPackages`** — package yang sudah loaded tidak re-load
2. **Detect via regex `^\s*import` di awal baris** — pakai flag `m` (multiline) supaya match per baris
3. **Show progress di feedback box** sebelum `loadPackage` (load bisa makan 5-30 detik tergantung koneksi)
4. **Re-throw error** kalau load gagal supaya `runAndCheck` skip exec dan tidak salah-lock soal
5. **Whitelist 5 package umum** — pandas, scipy, matplotlib, sympy, scikit-learn. Kalau dosen butuh package lain (misal `statsmodels`, `seaborn`), tambah ke `PACKAGE_PATTERNS` array

**Trade-off Lazy vs Preload:**

| Pendekatan | Pro | Contra |
|------------|-----|--------|
| **Lazy load (current)** | Startup cepat, hanya soal numpy tidak butuh tunggu | First-time soal pandas tunggu 5-15 detik |
| Preload semua di `getPyodide()` | Smooth UX setelah load awal | Init Pyodide makan 30-60 detik (download ~30 MB) |

Untuk modul dengan **mayoritas soal numpy + 1-2 soal pandas** (seperti Modul-4 Optimalisasi & Otomasi: 8 numpy + 2 pandas), lazy load lebih optimal. Untuk modul yang **semua soal pakai pandas/scipy** (misal modul data science penuh), preload lebih nyaman — tinggal ubah `getPyodide()`:
```javascript
await pyodide.loadPackage(['numpy', 'pandas', 'scipy']);   // preload semua
```
dan tambahkan ke `_loadedPyPackages` cache.

**Reference packages yang tersedia di Pyodide v0.25.1:**

`numpy`, `pandas`, `scipy`, `matplotlib`, `sympy`, `scikit-learn`, `statsmodels`, `networkx`, `pillow`, `regex`, `beautifulsoup4`, `lxml`, `pyyaml`, dll. Full list: [https://pyodide.org/en/stable/usage/packages-in-pyodide.html](https://pyodide.org/en/stable/usage/packages-in-pyodide.html). Package di luar list (misal `tensorflow`, `pytorch`) **tidak available** — perlu fallback ke `micropip.install()` atau redesign soal.

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
  if (!_isScheduleOpen()) return;
  const pts = (typeof point === 'number' && point > 0) ? point : 1;
  const partialKey = qId + '_comp_partial';   // marker berbeda dari _comp
  if (_answeredQ.has(partialKey)) return;

  const me = getIdentity();
  if (!me || !me.nim || me.role === 'dosen') return;
  const key = sanitizeKey('mhs_' + me.nim);
  const nodeRef = ref(db, DB_PATH + '/' + key);

  get(nodeRef).then(snap => {
    if (!snap.exists()) return;
    const ex = snap.val();
    const scored = (ex.scoredQuestions || '').split(',').filter(Boolean);
    if (scored.includes(partialKey)) { _answeredQ.add(partialKey); return; }
    _answeredQ.add(partialKey); scored.push(partialKey);
    const newPoints = Math.min((ex.points||0) + pts, SCORE_CONFIG.TOTAL);
    const updated = Object.assign({}, ex, {
      points: newPoints,
      pointTimestamp: new Date().toISOString(),
      scoredQuestions: scored.join(',')
    });
    set(nodeRef, updated);
    // Tidak trigger konsolasi — poin sudah > 0
  }).catch(()=>{});
};
```

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

### 15.4 State Persistence — Firebase + Draft localStorage

Mahasiswa sering keluar-masuk halaman (close tab, refresh, ganti device) selama mengerjakan tugas yang panjang. State harus persist agar pengalaman tidak frustrating. Sistem menggunakan **dua layer storage** dengan tanggung jawab berbeda:

| Layer | Storage | Apa yang disimpan | Sifat |
|-------|---------|-------------------|-------|
| **Firebase** | `visitors/<course>/<modul>/mhs_<NIM>` | Skor (poin, scoredQuestions, visitCount) | Immutable setelah submit, server-trusted |
| **localStorage Draft** | `optoauto_draft_<modul>_<NIM>` | Input belum di-submit (gdrive link, forum textarea) | Mutable, client-only |

**Identity Key Unification:**

`getIdentity()` dan `getIdentityLocal()` (jika ada helper terpisah) **harus pakai key yang sama**: `LOCAL_IDENTITY` constant yang dideklarasikan sebagai `optoauto_identity_${MODULE_ID}` (atau pattern equivalent untuk course lain). **Anti-pattern berbahaya** adalah hardcode key di helper export:

```javascript
// ❌ ANTI-PATTERN — hardcode key, breaks identity lookup
function getIdentityLocal() {
  return JSON.parse(localStorage.getItem('optoauto_identity_pertemuan-4'));   // wrong key!
}

// ✅ CORRECT — refer ke LOCAL_IDENTITY constant
function getIdentityLocal() {
  try {
    const key = (typeof LOCAL_IDENTITY !== 'undefined')
      ? LOCAL_IDENTITY
      : 'optoauto_identity_modul-4';   // fallback for early-access contexts
    return JSON.parse(localStorage.getItem(key));
  } catch(e) { return null; }
}
```

Konsekuensi pakai key yang salah: `getIdentityLocal()` return `null` → export HTML pakai `'Mahasiswa'` / `'-'` sebagai placeholder → mahasiswa kirim tugas tanpa identitas, dosen tidak bisa attribute.

**Draft Persistence Helpers:**

```javascript
function _draftKey() {
  const me = getIdentity();
  if (!me || !me.nim || me.role === 'dosen') return null;
  return 'optoauto_draft_modul-4_' + me.nim;   // per-NIM, bukan global
}

function _saveDraft() {
  const key = _draftKey();
  if (!key) return;
  try {
    const draft = {
      gdrive: document.getElementById('gdrive-link')?.value || '',
      fq1: document.getElementById('ans-fq1')?.value || '',
      fq2: document.getElementById('ans-fq2')?.value || '',
      fq3: document.getElementById('ans-fq3')?.value || '',
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(draft));
  } catch(e) { /* quota exceeded — silent fail */ }
}

function _loadDraft() {
  const key = _draftKey();
  if (!key) return;
  try {
    const draft = JSON.parse(localStorage.getItem(key) || 'null');
    if (!draft) return;
    const els = ['gdrive-link', 'ans-fq1', 'ans-fq2', 'ans-fq3'];
    const props = ['gdrive', 'fq1', 'fq2', 'fq3'];
    els.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el && !el.value && draft[props[i]]) el.value = draft[props[i]];
    });
    if (typeof checkExportReady === 'function') checkExportReady();
    if (typeof checkForumReady === 'function') checkForumReady();
  } catch(e) { /* corrupt JSON — silent fail */ }
}
```

**4 prinsip kunci:**

1. **Draft per-NIM, bukan global per-device** — kunci `optoauto_draft_modul-4_<NIM>` mencegah leak antar mahasiswa di lab komputer shared. Mahasiswa A login → tulis jawaban → logout → mahasiswa B login → jawaban A tidak muncul.
2. **Draft tidak overwrite Firebase state** — kalau Firebase punya `c5_comp` (sudah submit), draft tidak relevant lagi untuk soal C5. Draft hanya untuk input yang belum di-commit.
3. **Auto-save on every input event** — `oninput="checkExportReady()"` atau `oninput="checkForumReady()"` di textarea/input. Helper ini memanggil `_saveDraft()` di akhir, sehingga draft selalu fresh.
4. **Restore at end of `_loadScoredQuestions`** — setelah Firebase restore selesai (yang juga memanggil `checkExportReady()` + `checkForumReady()`), `_loadDraft()` dipanggil untuk mengisi field-field yang masih kosong dari localStorage.

**Restore Order (penting!):**

```
Page Load
   │
   ▼
initVisitor() — schedule + auto-login dari localStorage
   │
   ▼
setTimeout 1200ms → _loadScoredQuestions()
   │
   ├─ Get visitors/<NIM>/scoredQuestions dari Firebase
   ├─ Restore mcAnswered + compAnswered (lock UI elements)
   ├─ updateScore() — refresh score bar
   ├─ checkExportReady() — re-evaluate tombol export (Tugas)
   ├─ checkForumReady() — re-evaluate tombol copy (Forum)
   └─ _loadDraft() — restore gdrive + 3 forum textarea
        └─ Re-call checkExportReady() + checkForumReady() — buttons enable kalau draft + Firebase state lengkap
```

Tanpa Step 4-5 (restore + re-eval), tombol export/copy **stuck disabled** meski mahasiswa sudah jawab semua sebelumnya. Bug ini sering tidak ketahuan saat development karena tester biasanya jarang reload page mid-progress.

**Edge cases:**

| Skenario | Behavior |
|----------|----------|
| Mahasiswa input gdrive → reload → field tetap terisi | `_loadDraft()` restore dari localStorage |
| Mahasiswa tulis 200 kata di forum → reload → tetap utuh | Idem |
| Mahasiswa A logout, B login di device sama | `_draftKey()` baru (B's NIM) → A's draft tidak terbaca |
| Mahasiswa export sukses → mau export ulang nanti | Draft persist (tidak di-clear) — bisa export ulang kapan saja |
| Dosen klik Reset → semua data Modul-4 hapus | Draft tetap di localStorage tiap mahasiswa — tapi karena `compAnswered` empty, tombol export stay disabled. Mahasiswa harus jawab ulang soal sebelum export bisa enable lagi. Draft hanya diisi otomatis kalau field kosong |
| localStorage quota exceeded | Silent fail di `_saveDraft()` — tidak crash app, tapi draft tidak ter-save |
| Mahasiswa pakai DevTools delete localStorage manual | Draft hilang — mahasiswa harus input ulang gdrive + forum |

**Fields apa saja yang harus di-include di `_saveDraft()`?** Setiap field input/textarea yang punya `oninput` handler di markup, tapi nilainya **tidak di-save ke Firebase**. Untuk Modul-4 total **19 field**:

- `gdrive-link` (1 input)
- `ans-fq1`, `ans-fq2`, `ans-fq3` (3 forum textarea)
- `code-c1` … `code-c15` (15 Komputasi textarea — Easy/Medium + Hard)

Field MC **tidak perlu** di-save di draft karena state-nya (terjawab/tidak) sudah di Firebase via `scoredQuestions`. Tapi **code Komputasi HARUS di-save** karena Firebase hanya simpan marker (`c5_comp` / `c5_comp_used` / `c5_comp_partial`), bukan text code mahasiswa. Tanpa draft, code hilang setelah reload → export tampilkan "(belum diisi)".

### 15.4a Anti-Pattern: DOM CSS Classes sebagai Source of Truth

**Symptom:** Export HTML tampilkan "(Belum dijawab)" untuk semua soal MC, padahal mahasiswa sudah menjawab.

**Anti-pattern:**
```javascript
// ❌ Fragile — bergantung pada class CSS yang mungkin hilang setelah restore
const rg = document.getElementById('rg-' + id);
const selected = rg?.querySelector('.radio-option.selected, .correct-ans, .wrong-ans');
return {
  selected: selected ? selected.textContent.trim() : '(Belum dijawab)',
  ...
};
```

Masalahnya: `_loadScoredQuestions()` me-restore flag JavaScript (`mcAnswered[qId] = true`, `compScores[id] = pts`) + disable UI (`pointerEvents: none`, `opacity: 0.6`), tapi **tidak re-apply** CSS classes `.correct-ans` / `.wrong-ans` / `.selected`. Setelah reload, query `rg.querySelector('.correct-ans')` return `null` walaupun mahasiswa sudah jawab sebelumnya.

**Root cause konseptual:** DOM classes adalah **display state**, bukan **data state**. Firebase markers (`mcN`, `mcN_mc_used`) adalah source of truth. Restore harus:
1. Update **data state** (`mcAnswered`, `mcScores`) dari Firebase
2. Re-apply **display state** (CSS classes) dari data state

Pattern yang benar — saat restore MC, traverse DOM dan rekonstruksi classes:
```javascript
// ✅ Correct: rebuild classes dari markup (onclick parameter adalah source of truth lokal)
if (rg) {
  rg.dataset.locked = 'true';
  rg.querySelectorAll('.radio-option').forEach(o => {
    o.style.pointerEvents = 'none';
    o.style.opacity = '.6';
    // Identify correct option from onclick attribute: selectMC('mc1', this, true|false)
    const oc = o.getAttribute('onclick') || '';
    if (/,\s*true\s*\)/.test(oc)) {
      o.classList.add('correct-ans');   // highlight hijau + query export bekerja
      o._correct = true;
      o.style.opacity = '1';            // un-dim opsi yang benar
    }
  });
}
```

**Trade-off untuk MC salah:** Firebase hanya simpan marker `mcN_mc_used` (salah) — TIDAK simpan letter yang dipilih mahasiswa. Setelah reload, tidak ada cara tahu "mahasiswa pilih A atau C". Best-effort: tampilkan opsi BENAR dengan highlight hijau (untuk learning) + score tetap 0 di row export. Mahasiswa tetap tahu mereka salah (dari score), dosen tetap bisa attribute (dari marker di Firebase).

### 15.4b Anti-Pattern: `cssText.replace()` Regex untuk Button State

**Symptom:** Tombol Export menunjukkan kursor "🚫 not-allowed" tapi tetap bisa di-klik → mahasiswa bingung apakah tombol aktif atau tidak.

**Anti-pattern:**
```javascript
// ❌ Silent fail kalau pattern tidak match — button state jadi inconsistent
const styleReady = 'opacity:1;cursor:pointer';
const styleDisabled = 'opacity:.4;cursor:not-allowed';
btn.disabled = !allDone;
btn.style.cssText = btn.style.cssText.replace(
  /opacity[^;]+;cursor[^;]+/,
  allDone ? styleReady : styleDisabled
);
```

Masalahnya: `.replace()` pada cssText bergantung pada **urutan property** dan **format exact string**. Kalau inline `style="..."` di markup HTML punya order berbeda (misal `cursor:not-allowed;opacity:.4`), regex tidak match → replace silent fail → tombol visual stay disabled meski `btn.disabled = false` (functionally clickable).

**Pattern yang benar — explicit property setters + belt-and-suspenders `pointerEvents`:**
```javascript
// ✅ Robust — set individual properties, tidak reliant pada string matching
function _setBtnState(btn, ready) {
  if (!btn) return;
  btn.disabled = !ready;
  btn.style.opacity = ready ? '1' : '.4';
  btn.style.cursor  = ready ? 'pointer' : 'not-allowed';
  btn.style.pointerEvents = ready ? 'auto' : 'none';   // hard-prevent click kalau disabled
}
_setBtnState(btnBottom, allDone);
_setBtnState(btnTop,    allDone);
```

Empat keuntungan:
1. **Eksplisit** — set property langsung, tidak reliant pada string pattern matching
2. **Tahan urutan property** — tidak peduli urutan di cssText
3. **Belt-and-suspenders** — `pointerEvents: none` mencegah click bahkan kalau `disabled` property somehow dropped
4. **Idempotent** — aman di-call berkali-kali tanpa side effect

### 15.4c Anti-Pattern: Volatile Textarea sebagai Storage Utama

**Symptom:** Code Python di tabel Komputasi export HTML kosong "(belum diisi)" untuk semua soal padahal mahasiswa sudah menjalankan code-nya dengan benar (skor 2 atau 4 poin tercatat).

**Masalahnya:** `textarea.value` adalah **volatile DOM state** — browser tidak menyimpan otomatis. Code hanya hidup di memory tab, hilang saat:
- Refresh page (hard atau soft)
- Close & reopen tab
- Navigate away & back
- Browser crash / restart
- **Cross-device access** (mahasiswa kerjakan di lab → export di rumah)

**Firebase marker-only** pattern yang dipakai awalnya (`c5_comp`, `c5_comp_used`, `c5_comp_partial`) hanya mencerminkan STATUS (benar/salah/partial), bukan TEXT code mahasiswa.

**Solusi: Dual-layer persistence dengan Firebase sebagai source of truth primary.**

**Layer 1 — Firebase `codes/<qId>` field (PRIMARY):**

Setiap kali mahasiswa berhasil award poin (atau lock soal salah), text code di textarea **di-capture dan di-save ke Firebase** bersama dengan poin & marker. Code text menjadi durable record yang survive semua skenario reload/cross-device.

```javascript
// Pattern yang harus diterapkan di SEMUA write path comp (4 fungsi):
// _awardCompPoint, _awardCompHardPoint, _awardCompPartial, _recordCompAttempt

window._awardCompPoint = function(qId) {
  // ...validasi schedule, identity, etc.
  // Capture code text dari textarea SEBELUM async get() — karena DOM bisa berubah
  const codeText = (document.getElementById('code-' + qId)?.value || '').slice(0, 5000);

  get(nodeRef).then(snap => {
    if (!snap.exists()) return;
    const ex = snap.val();
    // ...scoredQuestions update logic...

    // Merge code ke existing codes object (preserve code soal lain)
    const codes = Object.assign({}, ex.codes || {}, codeText ? { [qId]: codeText } : {});
    const updated = Object.assign({}, ex, {
      points: (ex.points||0) + 2,
      pointTimestamp: new Date().toISOString(),
      scoredQuestions: scored.join(','),
      codes: codes   // ← NEW
    });
    set(nodeRef, updated);
  });
};
```

**Firebase Security Rules untuk field `codes`:**

```json
"codes": {
  ".validate": "newData.hasChildren() || !newData.exists()",
  "$codeId": {
    ".validate": "$codeId.matches(/^c[0-9]{1,2}$/) && newData.isString() && newData.val().length <= 5000"
  }
}
```

Validator memastikan:
- Child key harus match pattern `c` + 1-2 digit (mencegah spam key arbitrary)
- Value harus string maksimum 5000 karakter (cukup untuk code Komputasi tapi tidak enough untuk file besar)
- `hasChildren() || !newData.exists()` membolehkan delete via remove + write baru

**Layer 2 — Restore dari Firebase saat `_loadScoredQuestions()`:**

```javascript
window._loadScoredQuestions = function() {
  // ...identity check...
  get(ref(db, DB_PATH + '/' + key)).then(snap => {
    if (!snap.exists()) return;
    const data = snap.val();

    // Restore code Komputasi dari Firebase codes/ field
    // Fire FIRST karena textarea state tidak terikat ke scoredQuestions loop
    if (data.codes && typeof data.codes === 'object') {
      Object.keys(data.codes).forEach(qId => {
        const ta = document.getElementById('code-' + qId);
        if (ta && !ta.value && typeof data.codes[qId] === 'string') {
          ta.value = data.codes[qId];
        }
      });
    }

    // ...lanjut scoredQuestions forEach untuk restore markers & UI state...
  });
};
```

**Kenapa Firebase primary vs localStorage?** Trade-off:

| Aspek | localStorage draft | Firebase `codes/` field |
|-------|:------------------:|:-----------------------:|
| Simplicity | ✅ Tidak butuh Rules change | ⚠ Butuh Rules validator |
| Cross-device | ❌ Hilang antar device | ✅ Sync otomatis |
| Incognito mode | ❌ Clear saat tab closed | ✅ Tetap tersimpan |
| Storage quota risk | ⚠ Bisa exceeded | ✅ Firebase quota per-user besar |
| Audit trail dosen | ❌ Tidak terlihat | ✅ Dosen bisa review di Console |
| Cost | Free | ~500 B × 15 soal × N mhs = negligible |
| Write frequency | Every input (high) | Hanya saat award/lock (~30×/modul) |

**Keputusan:** Pakai **Firebase sebagai primary**. localStorage draft hanya untuk field yang tidak di-save di Firebase (gdrive link, forum textareas) — sifatnya complementary, bukan replacement.

**Trigger points untuk save ke Firebase `codes/`:**

Semua 4 write-path comp harus capture dan save code:
1. `_awardCompPoint(qId)` — Easy/Medium correct (+2) — **simpan**
2. `_awardCompHardPoint(qId)` — Hard correct (+4) — **simpan**
3. `_awardCompPartial(qId)` — Hard salah partial (+1) — **simpan**
4. `_recordCompAttempt(qId)` — Easy/Medium salah (0 poin, lock) — **simpan** (dokumentasi upaya)

Code tidak pernah di-save untuk soal yang belum di-submit (tidak ada trigger). Ini acceptable karena fungsi Firebase persistence hanya untuk state **final** mahasiswa, bukan draft-in-progress.

### 15.4d Data-Recovery Implications untuk Existing Students

**Fix retroaktif (bekerja untuk mahasiswa yang sudah submit sebelum fix):**

- ✅ MC display — `_loadScoredQuestions` re-apply `.correct-ans` class dari Firebase marker (`mcN`) yang sudah ada
- ✅ Button state consistency — pure UI logic, tidak butuh data baru
- ✅ Export HTML MC rows — sekarang tampilkan opsi benar (bukan "Belum dijawab")

**Fix NON-retroaktif (tidak bekerja untuk mahasiswa yang sudah submit):**

- ❌ Code Komputasi — data hilang permanen karena `_saveDraft()` belum ada saat mereka kerjakan. Tidak ada cara recover code yang tidak pernah di-save ke storage.

**Mitigasi untuk mahasiswa existing yang terkena Bug Code Komputasi:**

| Skenario | Aksi |
|----------|------|
| Banyak mahasiswa terkena + Notebook dipakai sebagai deliverable utama | Terima export HTML apa adanya, scoring dari Notebook + poin Firebase |
| Sedikit mahasiswa terkena + tugas sudah selesai | Minta re-export (HTML akan menunjukkan "(belum diisi)" di code, tapi score tetap correct) |
| Mahasiswa masih aktif di tab (belum reload) | Urgent: minta export DULU sebelum reload supaya code ter-capture di HTML |
| Dosen mau full reset untuk re-test | Hapus `scoredQuestions` field per mahasiswa di Firebase Console → mereka kerjakan ulang dengan sistem yang sudah fixed |

**Pelajaran universal:** saat mendesain form dengan input yang berharga (code, essay panjang, dll), **selalu pikirkan skenario reload** sejak awal — jangan andalkan DOM state sebagai storage. Implementasikan draft system atau Firebase persistence sebelum deploy ke production.

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
      <div class="p-circle"></div>Pilihan A
    </div>
    <div class="p-opt" onclick="voteForum(1, this, true)">
      <div class="p-circle"></div>Pilihan B
    </div>
  </div>
  <div class="p-fb r" id="fp1r">✅ Feedback benar</div>
  <div class="p-fb w" id="fp1w">❌ Feedback salah</div>
</div>
```

> **⚠ WARNING — Jangan tambahkan penanda visual pada jawaban benar.** Ada anti-pattern dangerous di mana author modul menambah ` ✓` di akhir teks opsi benar sebagai catatan untuk diri sendiri saat proofreading. Karakter ini **ter-render di UI** dan langsung membocorkan jawaban benar ke mahasiswa — mereka tinggal scan visual + klik opsi bercentang. Pattern yang benar:
> - Parameter `voteForum(id, this, true|false)` di `onclick` sudah cukup self-documenting untuk author
> - Jika butuh marker untuk proofreading, pakai **HTML comment**: `<!-- ✓ correct -->` sebelum `<div>` — tidak ter-render
> - Sama berlakunya untuk opsi MC (`selectMC(qId, this, true|false)`) — jangan pernah tambah simbol visual di akhir teks opsi benar

### 16.3 Content Integrity — Anti-Answer-Leak

Selain checkmark `✓`, beberapa pattern lain yang harus dihindari di HTML soal/poll:

| Anti-pattern | Kenapa bocor | Solusi |
|--------------|-------------|--------|
| ` ✓` / ` (benar)` / ` ←` di akhir teks opsi | Visual marker terlihat pre-answer | HTML comment atau parameter boolean |
| Class CSS yang beda untuk opsi benar (`class="radio-option correct"`) | DevTools inspect element reveal | Class tambahkan via JS setelah submit, bukan di markup |
| `data-correct="true"` attribute statis | DevTools bisa lihat attribute langsung | Logika cek hanya via JS closure/function scope |
| Urutan opsi "jawaban benar selalu di B" | Pattern recognition mahasiswa | Randomize urutan, atau distribusi merata A/B/C/D |
| Penjelasan panjang hanya di opsi benar | Opsi benar terlihat "effort lebih" | Semua opsi sepanjang sama + punya rasional realistis |

Author modul bertanggung jawab memastikan tidak ada signal visual/struktural yang membedakan opsi benar dari opsi salah **sebelum mahasiswa submit**. Verifikasi dengan open file di browser + inspect element pada tiap opsi — kalau ada field/class/text yang inconsistent antara opsi, itu potential leak.

### 16.3a Implementation — `shuffleMCOptions()` untuk Randomize Tiap Reload

Solusi untuk anti-pattern "jawaban benar selalu di B" (baris tabel §16.3) diimplementasikan via fungsi `shuffleMCOptions()` yang dipanggil sekali saat page load. **Prinsip implementasi:**

1. **Label huruf (A, B, C, D) tetap berurutan top-to-bottom** — user experience tidak berubah. Yang di-acak adalah KONTEN di belakang tiap label.
2. **Flag `isCorrect` mengikuti konten** — parameter ke-3 di `onclick="selectMC(qId, this, true|false)"` di-update bersama shuffle konten. Opsi yang pindah posisi bawa flag correct-nya bersama.
3. **Shuffle dipanggil SEBELUM `initVisitor()` dan `_loadScoredQuestions`** agar state restore Firebase landing di posisi shuffled yang benar.
4. **Firebase data model tidak terpengaruh** — markers (`mcN_mc`, `mcN_mc_used`) tied ke qId soal, bukan ke huruf. Leaderboard cross-user tetap konsisten meskipun tiap user melihat shuffle order yang berbeda.

**Signature selectMC:** `selectMC(qId, this, true|false)` — parameter boolean menunjukkan apakah opsi ini adalah jawaban benar. Satu `true` dan tiga `false` per soal (4 opsi total).

```javascript
function shuffleMCOptions() {
  const LETTERS = ['A', 'B', 'C', 'D'];
  document.querySelectorAll('.radio-group').forEach(rg => {
    const qId = (rg.id || '').replace(/^rg-/, '');
    if (!qId || !qId.startsWith('mc')) return;

    const opts = Array.from(rg.querySelectorAll('.radio-option'));
    if (opts.length !== 4) return;

    // Parse (content, isCorrect) pairs dari HTML & onclick attribute
    const data = opts.map(opt => {
      const m = opt.innerHTML.match(
        /^\s*<div class="radio-circle"><\/div>\s*\([A-D]\)\s*(?:&nbsp;)?\s*([\s\S]+?)\s*$/);
      if (!m) return null;
      const onclick = opt.getAttribute('onclick') || '';
      const bm = onclick.match(/selectMC\([^,]+,\s*this\s*,\s*(true|false)\s*\)/);
      if (!bm) return null;
      return { content: m[1], isCorrect: bm[1] === 'true' };
    });
    if (data.some(d => d === null)) return;   // bail jika parse gagal — biarkan markup asli

    // Fisher-Yates shuffle
    for (let i = data.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [data[i], data[j]] = [data[j], data[i]];
    }

    // Re-render: labels A/B/C/D tetap top-to-bottom, konten + onclick flag di-acak
    data.forEach((d, idx) => {
      const newLetter = LETTERS[idx];
      opts[idx].innerHTML =
        '<div class="radio-circle"></div>(' + newLetter + ') &nbsp; ' + d.content;
      opts[idx].setAttribute('onclick',
        "selectMC('" + qId + "',this," + d.isCorrect + ")");
      // Clear session-state classes/props dari previous render
      opts[idx].classList.remove('selected', 'correct-ans', 'wrong-ans');
      if (opts[idx]._correct !== undefined) delete opts[idx]._correct;
    });
  });
}
window.shuffleMCOptions = shuffleMCOptions;
```

**Timing — urutan di init sequence akhir `<script type="module">`:**

```javascript
if (typeof shuffleMCOptions === 'function') shuffleMCOptions();   // 1. Shuffle SEKALI
initVisitor();                                                      // 2. Auto-login
setTimeout(window._loadScoredQuestions, 1200);                      // 3. Restore state POST-shuffle
setTimeout(_applyRoleVisibility, 300);                              // 4. Role-based UI
```

**Kenapa shuffle aman untuk restore dari Firebase:**

Restore logic `_loadScoredQuestions` tidak peduli WHICH option yang pernah dipilih — hanya `mcAnswered[qId]` flag (boolean) yang di-set. UI meng-disable SEMUA radio options via `pointerEvents='none'` + `opacity='.6'` berdasarkan flag tersebut. Feedback text ditentukan oleh marker Firebase (`mcN_mc` vs `mcN_mc_used`), bukan oleh posisi opsi. Jadi user melihat opsi shuffled yang baru tapi tidak bisa berinteraksi karena sudah pernah menjawab.

**Scope — function dapat di-define di `<script type="module">` atau plain `<script>`.** Pendekatan boolean-based ini **tidak butuh object global seperti `MC_HINTS`** karena informasi correctness sudah embedded di onclick attribute tiap opsi. Ini membuat implementasi lebih portable dan tidak introduce global state baru.

**Efek pada distribusi jawaban:**

| Kondisi | Tebak "selalu B" |
|---------|:---------------:|
| Tanpa shuffle, distribusi B×7/A×1/C×2/D×0 | 70% akurasi (exploit-able) |
| Dengan shuffle tiap reload | 25% akurasi (~random 1 dari 4) |

**Consistency dengan Firebase:**

Shuffle hanya mengubah **UI rendering per-session**. Data model Firebase tetap:
- `scoredQuestions: 'mc1,mc3_mc_used,...'` — markers berupa qId, bukan letter
- Dua mahasiswa menjawab MC1 benar → keduanya dapat marker `mc1` di Firebase, walaupun mereka klik letter berbeda di UI masing-masing
- Leaderboard, stats, cross-device sync semuanya unaffected

**Edge cases yang di-handle dengan graceful fallback (function return early tanpa error):**

| Edge case | Behavior |
|-----------|----------|
| `MC_HINTS` undefined | `return` — no shuffle |
| qId tidak ada di `MC_HINTS` | Skip soal itu, lanjut yang lain |
| Jumlah `.radio-option` ≠ 4 | Skip (defensive untuk format non-standar) |
| Regex parse gagal (format `innerHTML` berubah) | Skip |
| `MC_HINTS[qId].answer` tidak ada | Skip |

### 16.4 Export HTML Forum

`copyForumHtml()` membangun string HTML dari template, copy ke clipboard, mahasiswa paste ke Fast Learning / Moodle. Format:
- Header dengan info mahasiswa (nama, NIM, tanggal)
- Skenario card
- 3 jawaban diskusi dengan styling per-warna
- Footer dengan branding mata kuliah

### 16.5 LMS Sanitizer Compatibility

HTML Forum **berbeda dari HTML Tugas** — file Tugas adalah `.html` download mandiri yang dibuka langsung di browser, sedangkan Forum HTML di-paste ke input editor LMS dan **melewati sanitizer** yang bisa strip/modify properties tertentu. Design pattern untuk memaksimalkan survival:

**Yang umumnya PRESERVED di sanitizer LMS:**
- Inline `style="..."` pada elemen block (div, p, span, table)
- Hex background colors (`#f0f4ff`, `#fce7f3`, dll)
- RGBA background colors dengan transparency (`rgba(129,140,248,.15)`)
- `border`, `border-left`, `border-radius`, `padding`, `margin`
- `display:flex` + `flex-wrap` untuk horizontal layout
- HTML entities (`&middot;`, `&amp;`, `&#128172;`) — defensif terhadap encoding
- Tabel layout dengan `<table>`, `<tr>`, `<td>` + inline styles

**Yang BERISIKO di-strip:**
- `linear-gradient()` dengan hex colors (dark themes) — sering distrip jadi transparent/white
- `background-image` eksternal
- `<style>` block (selalu distrip, wajib pakai inline)
- `<script>` (selalu distrip, tidak ada JS di export)
- `position: fixed/absolute`
- `@media print`, `@keyframes`, dan rules di dalam `<style>`
- `box-shadow` dengan blur (kadang diturunkan kompleksitasnya)

**Pattern defensive untuk gradient header (dari Introduction.html):**

```css
/* Dua deklarasi berturutan — CSS cascade: preferred di bawah, fallback di atas */
background: #f0f4ff;                          /* solid fallback — SELALU survive */
background: linear-gradient(135deg,
  rgba(129,140,248,.18) 0%,
  rgba(91,53,208,.10) 100%);                   /* preferred — mungkin strip */
border: 1px solid rgba(129,140,248,.28);
border-left: 6px solid #818cf8;                /* strong accent — selalu survive */
```

**Prinsip "worst-case visual degradation":**
- Jika gradient strip → solid color fallback tetap tampil
- Jika border-radius strip → square corners (acceptable)
- Jika `display:flex` strip → element stack vertikal (functional, less elegant)
- Jika semua color + border strip → teks masih readable dengan default black (paling ekstrem, hampir tidak pernah terjadi)

Setiap modul yang generate Forum HTML **harus test paste ke target LMS** saat deployment pertama, verifikasi hasil render match preview. Jika ada properti yang konsisten strip, update pattern di Pedoman.

### 16.6 Pattern Preferensi: Light-Themed untuk Forum Export

Header Forum sebaiknya **light-themed** (background putih/light + teks dark accent color), BUKAN dark-themed. Alasan:
- LMS-level page background biasanya light → dark header akan "pop out" aneh jika gradient terstrip (jadi white-on-white)
- Light theme konsisten dengan threading UI forum yang umumnya light
- Contrast text lebih predictable: dark text di atas light background = readable di semua skenario degradasi
- Emosi professional/academic lebih dominan dari "dark hero" flashy

Contoh color scheme yang aman:
- Primary accent: violet `#818cf8` / `#5b35d0`
- Background fallback: `#f0f4ff` (very light violet) atau `#f1f5f9` (light gray)
- Body text: `#1e293b` atau `#475569`
- Muted text: `#64748b`

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

### 17.6 Banner Schedule Missing (Dosen)

Ketika dosen sedang login tapi schedule tidak ada di database, tab Hasil menampilkan banner amber prominent di atas stat cards dengan CTA button langsung ke modal Atur Jadwal.

**Element:** `#scheduleMissingDosen` (inline di markup tab Hasil, default `display:none`).

**Kondisi tampil:** `role === 'dosen'` DAN `!hasValidSchedule()`. Dikendalikan oleh `_applyRoleVisibility()` yang dipanggil ulang pada setiap `_handleScheduleReady()` (§9.5), sehingga banner otomatis hilang begitu schedule berhasil di-save.

**Isi banner:**
- Headline: `⚠ Jadwal Perkuliahan Belum Diatur`
- Subtext: Penjelasan bahwa mahasiswa belum dapat mengakses modul
- CTA: Button `🕐 Atur Jadwal Sekarang` yang memanggil `showScheduleModal()`

Banner ini komplementer dengan `#scheduleMissingBanner` di login overlay (§9.5) — yang satu untuk state sebelum login, yang satu untuk state dosen sudah login. Keduanya mengarahkan ke satu tujuan: buka modal Atur Jadwal.

---

## 18. Sistem Penilaian & Anti-Manipulasi

### 18.1 Aturan Poin (Universal 50)

| Aksi | Poin | Marker Firebase |
|------|------|-----------------|
| MC benar | **+1** | `mc<N>` |
| MC salah | 0 (terkunci, tidak bisa retry) | `mc<N>_mc_used` |
| Comp Easy–Medium benar | **+2** | `c<N>_comp` |
| Comp Easy–Medium salah | 0 (terkunci) | `c<N>_comp_used` |
| Comp Hard benar | **+4** | `c<N>_comp` |
| Comp Hard salah (kode diisi — partial credit) | **+1** (terkunci amber) | `c<N>_comp_partial` |
| Comp Hard kode kosong + submit | 0 (warning, tidak locked) | — |
| Konsolasi (≥25 soal attempt + `points === 0`) | +1 (set `points = 1`) | `consolationAwarded: true` |
| **Maksimum total** | **50** | |

**Catatan Partial Credit Hard (lihat §15.3e untuk detail):**
- Hard runtime error dengan kode non-kosong → dianggap upaya → +1 poin
- Hard output salah dengan kode non-kosong → +1 poin
- Konsolasi **tidak applicable** jika mahasiswa dapat partial credit (points > 0) — dua mekanisme ini saling eksklusif dan tidak tumpang tindih

**Konsolasi threshold (`baseIds.size`) — tergantung jumlah soal total:**
```javascript
const CONSOLATION_THRESHOLD = SCORE_CONFIG.MC_COUNT + SCORE_CONFIG.COMP_EZ_COUNT + SCORE_CONFIG.COMP_HARD_COUNT;
// = 10 + 10 + 5 = 25 (universal)
// Legacy: 20 (untuk varian 30-poin), 15 (untuk varian 25-poin)
```

### 18.2 Anti-Manipulasi Layered

**Layer 0 — Content integrity (pre-requisite sebelum semua layer berikut):**

Sebelum berpikir tentang Firebase rules atau client-side locks, pastikan **HTML soal itu sendiri tidak membocorkan jawaban** melalui:
- Tidak ada marker visual (` ✓`, ` (benar)`) di teks opsi — lihat §16.2 warning
- Tidak ada CSS class atau data attribute yang membedakan opsi benar sebelum submit
- Tidak ada pattern "jawaban benar selalu di opsi B" atau panjang teks yang inconsistent
- Rincian lengkap + checklist: lihat §16.3 (Content Integrity)

Tanpa layer 0, semua layer berikut percuma — mahasiswa dapat jawaban benar tanpa perlu cheat Firebase.

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
   > ⚠️ Data yang akan dihapus (HANYA course/module ini — tidak menghapus PIN global):
   > - Semua poin & nilai mahasiswa di modul ini
   > - Semua kunjungan (visitCount, lastVisit) di modul ini
   > - Semua riwayat jawaban (scoredQuestions) di modul ini
   > - Data forum dan tugas terkait (RELATED_MODULES di course yang sama)
   > - Jadwal pertemuan modul ini
   >
   > ✅ **PIN global mahasiswa TETAP AMAN** — mereka bisa login langsung dengan PIN lama tanpa setup ulang. Jika ingin reset PIN mahasiswa individual, lihat Skenario B di §20.3.
3. Masukkan password admin
4. Klik **Hapus Semua Data**
5. Toast muncul: `✅ Data modul berhasil dihapus. PIN global mahasiswa tetap aman — mereka bisa login langsung tanpa setup PIN ulang.`

**Implementasi:**
```javascript
async function confirmReset(){
  const ok = await _verifyAdminPw(document.getElementById('resetPw').value);
  if(!ok){ /* pesan error */ return; }
  Promise.all([
    remove(ref(db, DB_PATH)),          // visitors/<course>/modul-N
    remove(ref(db, SCHEDULE_PATH)),    // settings/<course>/pertemuan-N/schedule
    ...RELATED_MODULES.map(mid =>
      remove(ref(db, `visitors/<course>/${mid}`))   // forum-N, tugas-N
    )
    // CATATAN: TIDAK menghapus pins/<NIM> — PIN global tetap aman lintas-course
  ]).then(() => {
    // Clear localStorage modul ini + related modules
    localStorage.removeItem(LOCAL_IDENTITY);
    RELATED_MODULES.forEach(mid => {
      localStorage.removeItem(`${COURSE_SLUG}_identity_${mid}`);   // prefix course-scoped
    });
    _showResetToast('✅ Data modul berhasil dihapus. PIN global mahasiswa tetap aman — mereka bisa login langsung tanpa setup PIN ulang.');
  }).catch(err => {
    /* tampilkan error */
  });
}
```

Karena `remove(ref(db, DB_PATH))` menghapus seluruh node `visitors/<course>/modul-N`, semua field per-mahasiswa (termasuk `pinHash`, `pinSetAt`) otomatis terhapus bersamanya.

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
- [ ] Test separation: `saveSchedule` TIDAK hapus visitor data — setelah save schedule baru, cek Firebase `visitors/math4/modul-4` masih ada poin/visit mahasiswa sebelumnya
- [ ] Test separation: `saveSchedule` TIDAK force-logout dosen — kalau dosen sudah login lalu update schedule, sesi tetap aktif tanpa re-login
- [ ] Test error handling: hapus schedule via Firebase Console, lalu klik Atur Jadwal → form harus save sukses TANPA error palsu PERMISSION_DENIED
- [ ] Test Comp Hard partial credit: submit kode `print(0)` untuk C11 → dapat +1 poin, tombol `△ Usaha` amber
- [ ] Test Comp Hard partial credit: submit kode dengan Python runtime error → dapat +1 poin, tombol `△ Usaha` amber
- [ ] Test Comp Hard partial credit: submit kode kosong → warning, NO poin, tombol TIDAK locked (bisa retry setelah isi kode)
- [ ] Test Comp Hard benar: submit kode dengan output benar → +4 poin, tombol `✓ Selesai` hijau
- [ ] Test Comp Easy/Medium salah: submit kode salah → 0 poin, tombol `✗ Terkunci` pink (bukan amber)
- [ ] Test restore partial: setelah submit partial, refresh halaman → status `△ Usaha` + poin +1 harus tetap tersimpan
- [ ] Test Firebase marker: cek `scoredQuestions` CSV di DB berisi `c11_comp_partial` setelah submit salah
- [ ] Test MC shuffle (§16.3a): buka halaman, catat urutan konten untuk MC1 → reload (F5) → urutan opsi HARUS berbeda (95%+ probability)
- [ ] Test MC shuffle correctness: jawab MC1 dengan konten yang sama di 2 reload berbeda → feedback konsisten (benar/benar)
- [ ] Test MC anti-leak (§16.3): View Source → search `selectMC` → semua 40 instance HARUS pakai letter (`'A'|'B'|'C'|'D'`), TIDAK ADA `true`/`false`
- [ ] Test MC shuffle vs restore: jawab MC1 benar, refresh → status "✅ Sudah dijawab benar" muncul tanpa exposure letter
- [ ] Test MC shuffle Firebase consistency: dua mahasiswa di device berbeda, keduanya jawab MC1 benar → keduanya dapat marker `mc1` di Firebase, poin sama walaupun mereka klik letter berbeda
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

## Catatan Teknis Tambahan

### Kenapa `type="module"` di script Firebase?

Firebase v12 menggunakan ES modules. Script dengan `type="module"` berjalan di strict mode, scope terpisah, mendukung top-level `import`. Semua fungsi yang perlu diakses dari luar modul (`submitVisitor`, `confirmReset`, dll.) harus di-expose via `window.nama = fungsi`.

### Pesan Error Standar

Konsisten antar mata kuliah (untuk kemudahan support mahasiswa):

| Kondisi | Pesan |
|---------|-------|
| Jadwal belum diatur (dosen) | `⚠ Jadwal belum diatur. Silakan klik tombol "Atur Jadwal" di bawah untuk mengatur jadwal terlebih dahulu.` |
| Jadwal belum diatur (mahasiswa) | `⚠ Jadwal perkuliahan belum diatur oleh dosen. Mohon tunggu hingga jadwal tersedia.` |
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

*Pedoman ini berdasarkan implementasi `Modul-4.html` — PD Linier Orde N, Matematika 4, S1 Teknik Mesin UMB 2025/2026.*
*Mendukung mata kuliah: Matematika 4 (`math4`), Getaran Mekanik (`getaran_mekanik`), Optimalisasi & Otomasi (`optoauto`).*
*Terakhir diperbarui: April 2026 — refactor multi-course, countdown circular, palet per-tab, hero animations, schedule gating, Firebase Security Rules, sistem PIN mahasiswa 6-digit global lintas-course, password admin SHA-256 hashed, animasi login overlay constellation + electric charges + lightning blasts, Dosen Login Modal dengan password masking, role-based visibility untuk tombol Reset (Atur Jadwal tetap visible sebagai bootstrap action), scoring universal 50 poin (10 MC + 10 Comp E/M + 5 Comp Hard), partial credit +1 poin untuk Comp Hard yang salah, schedule-gated access control dengan force-logout on delete, anti-answer-leak MC dengan shuffleMCOptions() randomize ABCD tiap reload, saveSchedule vs reset separation of concerns (saveSchedule hanya set schedule, tidak hapus visitor data).*
