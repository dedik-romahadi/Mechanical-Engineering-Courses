# Pedoman Desain Sistem & Konten — Modul Pertemuan (LMS Multi-Course)

> **Referensi Implementasi:** `Modul-4.html` — PD Linier Orde N, Bernoulli, Reduksi Orde
> **Mata Kuliah Pendukung:** Matematika 4 · Getaran Mekanik · Optimalisasi & Otomasi
> **Program Studi:** S1 Teknik Mesin · Universitas Mercu Buana
> **Dosen:** Dedik Romahadi
> **Tujuan:** Dokumentasi lengkap arsitektur, sistem, dan konten sehingga modul baru dapat dibuat dengan desain identik di tiga mata kuliah berbeda.
>
> **Diperbarui:** April 2026 — mencerminkan refactor Modul-4 (countdown circular, palet per-tab, hero animation per-tab, scoring rule lengkap, Firebase Security Rules, blokir akses di luar jadwal, **sistem PIN 6-digit untuk mahasiswa**, **password admin ter-hash SHA-256**, **animasi login constellation + electric charges + lightning blasts**, **Dosen Login Modal dengan password masking**, **role-based visibility untuk tombol Reset** — tombol Atur Jadwal tetap visible sebagai bootstrap action, **scoring universal 50 poin** dengan 5 soal Komputasi Hard @4 poin, **partial credit +1 poin** untuk Hard yang salah, **status label butuh poin** — Tepat Waktu/Terlambat hanya diberikan jika mahasiswa memperoleh poin > 0 (akses tanpa poin = Belum), **Bolos diperluas** — mencakup juga mahasiswa yang akses tapi 0 poin saat jadwal sudah berakhir).

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

## 8. Sistem PIN Keamanan Mahasiswa

### 8.1 Tujuan

Mencegah mahasiswa B login dengan identitas mahasiswa A (yang namanya/NIM-nya diketahui publik). PIN 6-digit adalah kredensial personal yang hanya diketahui mahasiswa sendiri.

### 8.2 Alur First-Time Setup

```
Mahasiswa baru pertama kali login
         │
         ▼
  Validasi Nama + NIM (cocok students.json)
         │
         ▼
  Cek Firebase: pinHash ada? — TIDAK ADA
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
  SHA-256 hash input → simpan ke Firebase:
    pinHash, pinSetAt, nama, nim, role, timestamp,
    visitCount: 1, lastVisit
         │
         ▼
  Auto-login — overlay tertutup, FAB muncul
```

### 8.3 Alur Returning Login

```
Mahasiswa yang sudah punya PIN login
         │
         ▼
  Validasi Nama + NIM (cocok students.json)
         │
         ▼
  Cek Firebase: pinHash ada? — ADA
         │
         ▼
  Muncul Modal Input PIN 🔑
         │
         ▼
  Mahasiswa input PIN 6 digit
         │
         ▼
  Hash input → bandingkan dengan pinHash di Firebase
         │
   ┌─────┴─────┐
   │ MATCH     │ MISMATCH
   ▼           ▼
 Auto-login  Error: "⚠ PIN salah..."
             (boleh coba lagi, tidak ada counter)
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
let _pinFlow = { nama: null, nim: null, nowISO: null, existingRecord: null, schedOpen: false };

// Cek PIN lemah
const WEAK_PINS = new Set([
  '123456', '654321',               // berurutan
  '000000', '111111', ..., '999999',// repetitif
  '012345', '098765',
  '123123', '456456', '789789',    // pola 3-3
  '121212', '212121', '131313',    // pola 2-2
  '112233', '332211',               // pola pasangan
  '102030', '010203'                // pola jarak tetap
]);

function _isWeakPin(pin) {
  if (!/^[0-9]{6}$/.test(pin)) return true;
  if (WEAK_PINS.has(pin)) return true;
  return false;
}

// Setup PIN baru (first-time)
async function submitPinSetup() {
  // ... validasi 6 digit, konfirmasi cocok, tidak lemah ...
  const pinHash = await _sha256Hex(p1);
  await set(ref(db, DB_PATH + '/' + key), {
    nama, nim, role: 'student', timestamp: nowISO,
    visitCount: 1, lastVisit: nowISO,
    pinHash, pinSetAt: nowISO
  });
}

// Verifikasi PIN (returning login)
async function submitPinVerify() {
  const inputHash = await _sha256Hex(pin);
  if (inputHash !== existingRecord.pinHash) {
    // PIN salah — tampilkan error, user bisa coba lagi
    return;
  }
  // PIN match — lanjut login normal (bump visitCount kalau > cooldown)
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
| **Firebase Security Rules** | `pinHash` validate format SHA-256 (64 char hex), field `pinHash` dan `pinSetAt` IMMUTABLE setelah ditetapkan (tidak bisa diubah via write biasa) |
| **SHA-256 hash** | PIN tersimpan sebagai hash, bukan plaintext |
| **Ketiadaan auto-sync** | PIN tidak disync antar module — jika reset satu module, mahasiswa setup PIN lagi hanya untuk module itu |

### 8.7 HTML Modal — Setup PIN

```html
<div class="visitor-overlay hidden" id="pinSetupOverlay" style="z-index:100001;">
  <div class="visitor-modal" style="max-width:420px;">
    <div style="font-size:2.4rem;margin-bottom:12px;">🔐</div>
    <h2>Buat PIN Keamanan</h2>
    <p class="sub">Hai <strong id="pinSetupName"></strong>! Buat PIN 6 digit untuk melindungi identitas Anda.</p>
    <p class="v-error" id="pinSetupError"></p>
    <input type="password" class="v-input" id="pinSetupInput1" placeholder="PIN (6 digit)" inputmode="numeric" maxlength="6" style="letter-spacing:8px;text-align:center;">
    <input type="password" class="v-input" id="pinSetupInput2" placeholder="Konfirmasi PIN" inputmode="numeric" maxlength="6" style="letter-spacing:8px;text-align:center;">
    <div style="background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.2);border-radius:8px;padding:10px 14px;margin:10px 0;font-size:.78rem;color:#fcd34d;">
      💡 <strong>Penting:</strong> Ingat PIN Anda! Jika lupa, hubungi dosen untuk reset.
    </div>
    <button class="v-btn-primary" id="pinSetupBtn" onclick="submitPinSetup()">Simpan PIN & Masuk</button>
    <button class="v-btn-cancel" onclick="cancelPinFlow()">Batal</button>
  </div>
</div>
```

### 8.8 HTML Modal — Input PIN (Returning)

```html
<div class="visitor-overlay hidden" id="pinInputOverlay" style="z-index:100001;">
  <div class="visitor-modal" style="max-width:420px;">
    <div style="font-size:2.4rem;margin-bottom:12px;">🔑</div>
    <h2>Masukkan PIN</h2>
    <p class="sub">Halo <strong id="pinInputName"></strong>, masukkan PIN 6 digit Anda.</p>
    <p class="v-error" id="pinInputError"></p>
    <input type="password" class="v-input" id="pinInputField" placeholder="PIN (6 digit)" inputmode="numeric" maxlength="6" style="letter-spacing:8px;text-align:center;">
    <button class="v-btn-primary" id="pinInputBtn" onclick="submitPinVerify()">Verifikasi & Masuk</button>
    <button class="v-btn-cancel" onclick="cancelPinFlow()">Batal</button>
    <p style="font-size:.72rem;color:#64748b;text-align:center;">Lupa PIN? Hubungi dosen untuk reset.</p>
  </div>
</div>
```

### 8.9 Skenario Reset PIN

Ada **dua cara** reset PIN, dengan efek berbeda:

**A. Reset Total via Tombol Reset di Halaman** (Semua mahasiswa)
- Dosen klik tombol Reset di overlay login → masukkan password admin
- Efek: seluruh data module (poin, visit, PIN, scoredQuestions) terhapus
- Kapan dipakai: awal semester, ganti pertemuan, clear development data

**B. Reset PIN Individual via Firebase Console** (Satu mahasiswa)
- Dosen buka Firebase Console → `visitors/<course>/<module>/mhs_<NIM>`
- Hapus field `pinHash` dan `pinSetAt`
- Efek: **hanya PIN yang terhapus**, poin + visit + riwayat TETAP AMAN
- Kapan dipakai: mahasiswa lupa PIN, atau curiga PIN bocor

Selengkapnya di §20 (Reset & Administrasi Data).

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
/visitors
  /math4              ← course slug 1
    /modul-N          ← module ID
      /mhs_<NIM>      ← per-student record
        - nama, nim, role, timestamp, lastVisit
        - visitCount, points, pointTimestamp
        - scoredQuestions (CSV string)
        - consolationAwarded (bool)
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

### 13.2 Schema Field per Visitor

| Field | Type | Constraint |
|-------|------|------------|
| `nama` | string | 2–80 char |
| `nim` | string | 1–20 digit, atau `'DOSEN'` |
| `role` | string | `'student'` / `'dosen'` / `'guest'` |
| `timestamp` | ISO string | Login pertama (terkunci) |
| `lastVisit` | ISO string | Update tiap visit baru |
| `visitCount` | number | 1–500, hanya bisa naik +1 |
| `points` | number | 0–**50**, hanya bisa naik +0/+1/+2/+4 per write (lihat §13.4) |
| `pointTimestamp` | ISO string | Update tiap dapat poin |
| `scoredQuestions` | string | CSV `"mc1,c1_comp,..."`, max 2000 char |
| `consolationAwarded` | bool | `true` saja, mencegah retrigger konsolasi |
| `pinHash` | string | **64 char hex** (SHA-256), **immutable** setelah ditetapkan |
| `pinSetAt` | ISO string | Kapan PIN diset pertama kali, **immutable** |

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
    }
  }
}
```

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
| `pinHash` immutable setelah create | Mahasiswa tidak bisa ganti PIN orang lain |
| `pinSetAt` immutable setelah create | Timestamp setup PIN dijaga integritasnya |
| `pinHash` format validate (64 char hex) | Tidak bisa inject data selain SHA-256 hash |
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

### 16.3 Export HTML Forum

`copyForumHtml()` membangun string HTML dari template, copy ke clipboard. Format:
- Header dengan info mahasiswa (nama, NIM, tanggal)
- Skenario card
- 3 jawaban diskusi dengan styling per-warna
- Footer dengan branding mata kuliah

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
  ]).then(() => {
    // Clear localStorage modul ini + related modules
    localStorage.removeItem(LOCAL_IDENTITY);
    RELATED_MODULES.forEach(mid => {
      localStorage.removeItem(`${COURSE_SLUG}_identity_${mid}`);   // prefix course-scoped
      localStorage.removeItem(`optoauto_identity_${mid}`);         // legacy cleanup (transisi, opsional)
    });
    _showResetToast('✅ Semua data berhasil dihapus...');
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

## Catatan Teknis Tambahan

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

*Pedoman ini berdasarkan implementasi `Modul-4.html` — PD Linier Orde N, Matematika 4, S1 Teknik Mesin UMB 2025/2026.*
*Mendukung mata kuliah: Matematika 4 (`math4`), Getaran Mekanik (`getaran_mekanik`), Optimalisasi & Otomasi (`optoauto`).*
*Terakhir diperbarui: April 2026 — refactor multi-course, countdown circular, palet per-tab, hero animations, schedule gating, Firebase Security Rules, sistem PIN mahasiswa 6-digit, password admin SHA-256 hashed, animasi login overlay constellation + electric charges + lightning blasts, Dosen Login Modal dengan password masking, role-based visibility untuk tombol Reset (Atur Jadwal tetap visible sebagai bootstrap action), scoring universal 50 poin (10 MC + 10 Comp E/M + 5 Comp Hard), partial credit +1 poin untuk Comp Hard yang salah.*
