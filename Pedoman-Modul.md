# Pedoman Desain Sistem & Konten — Modul Pertemuan (LMS Multi-Course)

> **Referensi Implementasi:** `Modul-4.html` — PD Linier Orde N, Bernoulli, Reduksi Orde
> **Mata Kuliah Pendukung:** Matematika 4 · Getaran Mekanik · Optimalisasi & Otomasi
> **Program Studi:** S1 Teknik Mesin · Universitas Mercu Buana
> **Dosen:** Dedik Romahadi
> **Tujuan:** Dokumentasi lengkap arsitektur, sistem, dan konten sehingga modul baru dapat dibuat dengan desain identik di tiga mata kuliah berbeda.
>
> **Diperbarui:** April 2026 — mencerminkan refactor Modul-4 (countdown circular, palet per-tab, hero animation per-tab, scoring rule lengkap, Firebase Security Rules, blokir akses di luar jadwal, **sistem PIN 6-digit untuk mahasiswa**, **password admin ter-hash SHA-256**).

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

| Mata Kuliah | Course Slug | DB Path | Settings Path |
|-------------|-------------|---------|---------------|
| Matematika 4 | `math4` | `visitors/math4/...` | `settings/math4/...` |
| Getaran Mekanik | `getaran_mekanik` | `visitors/getaran_mekanik/...` | `settings/getaran_mekanik/...` |
| Optimalisasi & Otomasi | `optoauto` | `visitors/optoauto/...` | `settings/optoauto/...` |

**Aturan penamaan slug:**
- Lowercase + underscore (bukan tanda hubung) untuk konsistensi
- Maks 40 karakter, regex `^[a-z0-9_-]{1,40}$`
- Slug **harus terdaftar** di Firebase Security Rules — kalau tidak, semua write akan ditolak

### 3.2 Konstanta yang Membedakan Mata Kuliah di HTML

```javascript
// Matematika 4
const MODULE_ID       = 'modul-4';
const DB_PATH         = `visitors/math4/${MODULE_ID}`;
const PERTEMUAN       = 'pertemuan-4';
const RELATED_MODULES = ['forum-4', 'tugas-4'];
const SCHEDULE_PATH   = `settings/math4/${PERTEMUAN}/schedule`;
const LOCAL_IDENTITY  = `optoauto_identity_${MODULE_ID}`;
const STUDENTS_JSON_URL = 'https://dedik-romahadi.github.io/Mechanical-Engineering-Courses/Engineering-Mathematics/Attributes/students.json';

// Getaran Mekanik
const DB_PATH         = `visitors/getaran_mekanik/${MODULE_ID}`;
const SCHEDULE_PATH   = `settings/getaran_mekanik/${PERTEMUAN}/schedule`;
const STUDENTS_JSON_URL = '.../Mechanical-Vibration/Attributes/students.json';

// Optimalisasi & Otomasi
const DB_PATH         = `visitors/optoauto/${MODULE_ID}`;
const SCHEDULE_PATH   = `settings/optoauto/${PERTEMUAN}/schedule`;
const STUDENTS_JSON_URL = '.../Optimization-Automation/Attributes/students.json';
```

### 3.3 Menambah Mata Kuliah Baru

1. Tentukan slug baru (misal `elemen_mesin`)
2. Buat folder repo (misal `Element-Machine/Modul-N.html`)
3. Update `Attributes/students.json` dengan daftar mahasiswa MK tersebut
4. Edit Firebase Security Rules — tambahkan slug ke validate (lihat §12.4)
5. Publish ulang rules

### 3.4 Reset & Migrasi Data

`RELATED_MODULES` harus mengikuti slug yang sama. Saat reset Modul-N di Matematika 4, juga membersihkan node `forum-N` dan `tugas-N` di path `visitors/math4/`.

```javascript
// CONTOH BENAR — semua di bawah course yang sama
RELATED_MODULES.forEach(mid =>
  remove(ref(db, `visitors/math4/${mid}`))
);
```

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
2. Muncul **browser prompt native**: `"Login sebagai Dosen\n\nMasukkan password admin:"`
3. Password dihash SHA-256 → bandingkan dengan `ADMIN_PW_HASH`
4. Jika match → identitas dosen disimpan di `localStorage`, overlay tertutup
5. Jika salah → pesan error di overlay login, tidak ada counter (bisa coba lagi)

```javascript
if (isDosen) {
  const pwInput = prompt('Login sebagai Dosen\n\nMasukkan password admin:');
  if (!pwInput) { err.textContent = '⚠ Login dibatalkan.'; return; }
  const ok = await _verifyAdminPw(pwInput);
  if (!ok) { err.textContent = '⚠ Password admin salah.'; return; }
  saveIdentity({ nama, nim: 'DOSEN', role: 'dosen', timestamp: new Date().toISOString() });
  document.getElementById('visitorOverlay').classList.add('hidden');
  return;
}
```

**Catatan:** Dosen TIDAK perlu setup PIN. Password admin digunakan langsung sebagai kredensial dosen (sudah cukup kuat untuk konteks kelas).

### 7.4 Identitas Lokal (localStorage)

Saat login berhasil, identitas disimpan di `localStorage` dengan key `LOCAL_IDENTITY`:

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

### 7.5 Role: Dosen — Hak Akses Khusus

- NIM otomatis = `'DOSEN'`
- Tidak dihitung di leaderboard / stats / visitor table
- Bisa lakukan **reset** (hapus semua data) dengan password admin
- Bisa **set jadwal** dengan password admin
- Tidak perlu PIN

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

| Zona | Waktu | Status Label | Poin & Akses |
|------|-------|--------------|--------------|
| **Tepat Waktu** | `[start, end − 24jam)` | ✅ Tepat Waktu | ✅ Disimpan normal |
| **Terlambat** | `[end − 24jam, end]` | ⏰ Terlambat | ✅ Disimpan normal (perlakuan sama dengan Tepat Waktu) |
| **Di Luar Jadwal** | `< start` atau `> end` | ❌ Bolos (kalau `> end`) / ditolak (kalau `< start`) | ❌ TIDAK disimpan |

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

Konsep visual harus **relevan dengan topik mata kuliah**:

| Mata Kuliah | Saran Animasi Modul | Saran Animasi Forum |
|-------------|---------------------|---------------------|
| Matematika 4 | Slope field PD | Cooling curves (pendinginan) |
| Getaran Mekanik | Sine wave dengan envelope | Resonance amplitude curve |
| Optimalisasi & Otomasi | Gradient descent path / contour | Convergence iteration |

Tab Tugas dan Hasil bisa **tetap sama** lintas-mata kuliah karena karakter konten serupa (orbital = soal/pencapaian, constellation = data agregat).

---

## 12. Animasi Login Overlay

Login overlay menampilkan animasi background dengan formula floating, partikel, dan kanvas wave. Formula floating disesuaikan per mata kuliah:

```javascript
const formulas = [
  // Matematika 4 — PD Linier
  { t: "y' + P(x)y = Q(x)", s: 13 },
  { t: 'u = e^∫P dx',       s: 13 },
  { t: 'z = y^(1−n)',       s: 13 },
  // ...

  // Getaran Mekanik
  // { t: 'mẍ + cẋ + kx = F₀sin(ωt)', s: 12 },
  // { t: 'ωₙ = √(k/m)', s: 14 },
  // ...

  // Optimalisasi & Otomasi
  // { t: 'min f(x) s.t. g(x) ≤ 0', s: 12 },
  // { t: '∇L = 0', s: 14 },
  // ...
];
```

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
| `points` | number | 0–30, hanya bisa naik +0/+1/+2 per write |
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
| `points` max +2 per write | Tidak bisa lompat ke 30 langsung |
| `points` tidak bisa turun | Mencegah cheat dengan reset |
| `points` cap = 30 | Hard limit (10 MC × 1 + 10 Comp × 2) |
| `visitCount` max +1 per write | Mencegah inflasi kunjungan |
| `consolationAwarded` once-only | Tidak bisa retrigger 1 poin konsolasi |
| `pinHash` immutable setelah create | Mahasiswa tidak bisa ganti PIN orang lain |
| `pinSetAt` immutable setelah create | Timestamp setup PIN dijaga integritasnya |
| `pinHash` format validate (64 char hex) | Tidak bisa inject data selain SHA-256 hash |
| Field `$other` ditolak | Mencegah injeksi data |

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

### 15.1 Struktur

- **10 soal MC** × 1 poin = 10 poin
- **10 soal Komputasi** × 2 poin = 20 poin
- **Total maksimal**: 30 poin (= nilai 100)
- **Konsolasi**: 1 poin (kalau salah semua tapi attempt semua)

### 15.2 Soal Pilihan Ganda (MC)

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

### 15.3 Soal Komputasi

```html
<div class="comp-card reveal">
  <div class="comp-header">
    <div class="comp-num">C1</div>
    <div class="comp-q">Soal komputasi...</div>
    <div class="comp-pts">2 poin</div>
  </div>
  <div class="comp-hint">💡 <code>hint kode...</code></div>
  <div class="comp-code-wrap">
    <div class="input-label"><span class="col-badge">Python</span> Kode Jupyter</div>
    <textarea class="code-textarea" id="code-c1" oninput="onCodeInput('c1')"></textarea>
    <div class="stdout-box" id="stdout-c1"></div>
  </div>
  <button class="comp-submit run-btn" id="sub-c1"
          onclick="runAndCheck('c1', expectedAnswer, tolerance)">▶ Run &amp; Validasi</button>
  <div class="feedback" id="fb-c1"></div>
</div>
```

Fungsi `runAndCheck(qId, expected, tolerance)`:
1. Cek `_isScheduleOpen()` — kalau false, tampilkan info, tidak save
2. Load Pyodide (singleton)
3. Run kode, capture stdout
4. Cek apakah ada nilai numerik yang match `expected ± tolerance`
5. Award +2 poin (`_awardCompPoint`) atau record fail (`_recordCompAttempt`)

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
  if (!v) {
    if (schedExpired) absen++;   // Bolos = belum akses + jadwal sudah berakhir
    continue;
  }
  if ((v.points || 0) > 0) hadir++;   // Hadir = punya poin
}
```

| Kategori | Definisi |
|----------|----------|
| **Total Mahasiswa** | `masterStudents.length` (dari `students.json`) |
| **Hadir** | Punya `points > 0` (otomatis berarti akses dalam jadwal — diblokir jika di luar) |
| **Absen** | Status `Bolos` SAJA — tidak akses + jadwal sudah berakhir |

### 17.3 Status Logic

```javascript
const hasVisit = !!v, late = hasVisit && isLate(v.timestamp), bolos = !hasVisit && schedExpired;
let statusCol;
if (bolos)         statusCol = '❌ Bolos';
else if (!hasVisit) statusCol = '⏳ Belum';
else if (late)     statusCol = '⏰ Terlambat';
else               statusCol = '✅ Tepat Waktu';
```

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

Selalu tampilkan **poin (nilai)** di mana `nilai = round(poin/30 × 100)`:

```javascript
const nilai = Math.round(pts / 30 * 100);
const ptsDisplay = `${pts} (${nilai})`;   // contoh: "25 (83)"
```

Berlaku di:
- Card Top Skor di leaderboard
- Kolom "Poin (Nilai)" di visitor table

---

## 18. Sistem Penilaian & Anti-Manipulasi

### 18.1 Aturan Poin

| Aksi | Poin |
|------|------|
| MC benar | +1 |
| MC salah | 0 (terkunci, tidak bisa retry) |
| Comp benar | +2 |
| Comp salah | 0 (terkunci) |
| Konsolasi (semua 20 soal di-attempt + total = 0) | +1 (set `points = 1`) |
| **Maksimum total** | **30** |

### 18.2 Anti-Manipulasi Layered

**Layer 1 — Client-side (tidak fool-proof tapi mencegah double-submit casual):**
- Tombol disable setelah submit
- Radio option dinonaktifkan
- Set `_answeredQ` in-memory

**Layer 2 — Firebase write (server-trusted, tapi data dari client):**
- `scoredQuestions` CSV menandai soal yang sudah di-attempt (suffix `_used`)
- Cek `if (scored.includes(qId)) return;` mencegah double-award
- `consolationAwarded: true` flag mencegah retrigger konsolasi

**Layer 3 — Firebase Security Rules (server-side, fool-proof):**
- `points` hanya bisa naik +0/+1/+2 per write (mencegah lompat ke 30)
- `points` tidak bisa turun
- `points` max = 30 (hard cap)
- Identitas (nim, nama, role, timestamp) terkunci setelah create
- `visitCount` max +1 per write
- `consolationAwarded` hanya bisa diset `true`

**Layer 4 — Schedule gate:**
- Semua write di-blokir saat di luar jadwal aktif via `_isScheduleOpen()`

### 18.3 Helper Konsolasi

```javascript
function _checkConsolationPoint(nodeRef, state) {
  const scored = (state.scoredQuestions || '').split(',').filter(Boolean);
  // Hitung distinct base IDs (abaikan suffix _used / _comp)
  const baseIds = new Set();
  scored.forEach(tag => {
    let base = tag;
    if (/_mc_used$/.test(base))   base = base.replace(/_mc_used$/, '');
    else if (/_comp_used$/.test(base)) base = base.replace(/_comp_used$/, '');
    else if (/_comp$/.test(base)) base = base.replace(/_comp$/, '');
    baseIds.add(base);
  });
  const allAttempted = baseIds.size >= 20;
  const zeroPoints = (state.points || 0) === 0;
  const alreadyConsoled = (state.consolationAwarded === true);
  if (allAttempted && zeroPoints && !alreadyConsoled) {
    set(nodeRef, Object.assign({}, state, {
      points: 1,
      pointTimestamp: new Date().toISOString(),
      consolationAwarded: true
    }));
  }
}
```

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
5. Muncul browser prompt: `Login sebagai Dosen — Masukkan password admin:`
6. Ketik `TeknikMesin0602`
7. Jika match → langsung masuk sebagai dosen
8. Badge `👨‍🏫 DEDIK ROMAHADI` muncul di navbar

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
    RELATED_MODULES.forEach(mid => localStorage.removeItem('optoauto_identity_' + mid));
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
- [ ] Tentukan **10 soal MC** (sesuai struktur Modul-4 — bukan 5)
- [ ] Tentukan **10 soal Komputasi** dengan expected answer dan tolerance
- [ ] Siapkan 3 pertanyaan diskusi forum

### B. Konfigurasi Sistem (Multi-Course Aware)

- [ ] Pilih course slug yang sesuai (`math4` / `getaran_mekanik` / `optoauto`)
- [ ] Set `MODULE_ID` → `'modul-N'` atau `'pertemuan-N'`
- [ ] Set `DB_PATH` → `visitors/<course>/${MODULE_ID}`
- [ ] Set `SCHEDULE_PATH` → `settings/<course>/${PERTEMUAN}/schedule`
- [ ] Set `RELATED_MODULES` → `['forum-N', 'tugas-N']`
- [ ] Set `STUDENTS_JSON_URL` → URL `students.json` mata kuliah
- [ ] Set `LOCAL_IDENTITY` → unique key (boleh kept `optoauto_identity_${MODULE_ID}` atau diganti)
- [ ] Update brand di navbar (`MATEMATIKA4` / `GETARANMESIN` / `OPTOAUTO`)
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

### D. Tab Tugas

- [ ] Set `data-tab="tugas"` pada hero
- [ ] **Tulis 10 soal MC** baru (jangan 5 — ikut struktur 30 poin total)
- [ ] **PASTIKAN tidak ada bocoran jawaban** di radio-option (no `✓`, no penjelasan dalam kurung)
- [ ] Tulis 10 soal komputasi baru
- [ ] Set `expected_answer` dan `tolerance` yang tepat
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
- [ ] Pastikan kolom "Poin (Nilai)" di header tabel

### G. Konfigurasi Firebase

- [ ] Pastikan course slug terdaftar di `database.rules.json` (kalau MK baru)
- [ ] Pastikan rules memvalidasi `pinHash` (format 64-char hex) dan `pinSetAt`
- [ ] Pastikan rules `.write` pada `$visitorKey` memuat immutability untuk `pinHash`
- [ ] Publish ulang rules di Firebase Console
- [ ] Test di Rules Playground:
  - Read `/visitors/<slug>/...` → ALLOWED
  - Set `points: 30` langsung → DENIED
  - Set `points: 1` (record baru) → ALLOWED
  - Update `pinHash` yang sudah ada → DENIED (immutability)

### H. Validasi Akhir

- [ ] Test login dosen: nama "Dedik Romahadi" + prompt password admin
- [ ] Test login dosen dengan password salah → ditolak
- [ ] Test login mahasiswa first-time → muncul modal Setup PIN
- [ ] Test setup PIN dengan PIN lemah (`123456`, `111111`, `121212`) → ditolak
- [ ] Test setup PIN dengan PIN valid → tersimpan, auto-login
- [ ] Test login mahasiswa returning → muncul modal Input PIN
- [ ] Test input PIN benar → login berhasil
- [ ] Test input PIN salah → pesan error, bisa coba lagi
- [ ] Test semua 10 MC (benar dan salah) — pastikan keduanya terkunci
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
const LOCAL_IDENTITY  = `optoauto_identity_${MODULE_ID}`;
const STUDENTS_JSON_URL = 'https://dedik-romahadi.github.io/Mechanical-Engineering-Courses/Engineering-Mathematics/Attributes/students.json';
```

**Getaran Mekanik:**
```javascript
const MODULE_ID       = 'pertemuan-N';
const DB_PATH         = `visitors/getaran_mekanik/${MODULE_ID}`;
const PERTEMUAN       = 'pertemuan-N';
const RELATED_MODULES = ['forum-N', 'tugas-N'];
const SCHEDULE_PATH   = `settings/getaran_mekanik/${PERTEMUAN}/schedule`;
const LOCAL_IDENTITY  = `getaran_identity_${MODULE_ID}`;
const STUDENTS_JSON_URL = 'https://dedik-romahadi.github.io/Mechanical-Engineering-Courses/Mechanical-Vibration/Attributes/students.json';
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

### 23.2 Find & Replace HTML

```
GETARANMESIN // P4   →   <BRAND> // <CODE>N
Masuk ke Modul 4 →   →   Masuk ke Modul N →
Pertemuan 4          →   Pertemuan N
Modul 4 — [Topik]    →   Modul N — [Topik Baru]
2025/2026            →   [Tahun Akademik]
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
  points: 25,                               // ← max +2 per write, 0-30
  pointTimestamp: "2026-04-18T13:15:00.000Z",
  scoredQuestions: "mc1,mc2_mc_used,c1_comp,c2_comp_used,...",
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
*Terakhir diperbarui: April 2026 — refactor multi-course, countdown circular, palet per-tab, hero animations, schedule gating, Firebase Security Rules, sistem PIN mahasiswa 6-digit, password admin SHA-256 hashed.*
