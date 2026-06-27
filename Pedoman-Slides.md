# Pedoman-Slides.md — Panduan Pembuatan Slide Slidev

Dokumen ini adalah quick-start untuk Claude sesi baru yang mengerjakan slide Slidev di repo ini. Baca sebelum menyentuh file apapun di `*/Slides/`.

---

## 1. Deck yang Ada

| Deck | Folder | File utama | Port dev | URL deploy |
|------|--------|-----------|----------|-----------|
| Getaran Mekanik | `Getaran-Mekanik/Slides/` | `Analisis-Getaran-Berbasis-Fourier-Transform.md` | 3030 | `.../Getaran-Mekanik/Slides/Analisis-Getaran-Berbasis-Fourier-Transform/` |
| Optimalisasi & Otomasi | `Optimalisasi-dan-Automasi/Slides/` | `penerapan-machine-learning.md` | 3031 | `.../Optimalisasi-dan-Automasi/Slides/penerapan-machine-learning/` |

> Deck Opto `penerapan-machine-learning.md`: **22 slide**. Brand di SLIDE memakai **"Optimalisasi & Automasi"** (huruf A — sengaja beda dari LMS lain yang "Otomasi", atas permintaan dosen). Punya **2 sesi kuis interaktif** (§17) + **webcam terkunci** (§16). Penyesuaian per-slide via `.slidev-page-N` (§14).

### Struktur tiap deck
```
<Course>/Slides/
├── <nama-deck>.md        # sumber utama semua slide
├── global-top.vue        # header fixed (muncul di slide 2+)
├── global-bottom.vue     # footer fixed (muncul di slide 2+)
├── style.css             # override global Slidev + komponen CSS
├── package.json          # script dev/build/export
├── components/           # Vue komponen interaktif (dipanggil di .md)
├── Logo/                 # aset logo (UMB.png, dll.)
├── public/               # aset publik (bisa diakses via root URL)
└── dist/                 # artefak build (jangan diedit manual — deploy workflow membangun ulang)
```

---

## 2. Frontmatter Slide

### Slide pertama (cover) — `layout: none`
Selalu gunakan `layout: none` dan tulis HTML mentah (lihat cover di `penerapan-machine-learning.md`). Cover **tidak** memiliki header/footer global.

### Slide konten — frontmatter minimal
```yaml
---
layout: default          # atau two-cols, center
transition: slide-left   # lihat §7 untuk daftar transisi
title: "Judul Slide"     # ditampilkan di header global otomatis
---
```

### Class tambahan di frontmatter
```yaml
class: tight   # font lebih kecil (12.5px) untuk konten padat
```

> ⚠️ **Jangan ulang H1 (`# Judul`) di body slide** — header global sudah menampilkan `title` dari frontmatter. Hanya slide penutup "Terima Kasih" yang boleh punya H1 (karena headernya menampilkan animasi gelombang, bukan teks judul).

---

## 3. Layout

| Layout | Kegunaan |
|--------|---------|
| `default` | Slide konten tunggal (paling umum) |
| `two-cols` | Dua kolom; gunakan `::right::` sebagai pemisah |
| `center` | Konten di tengah vertikal & horizontal (slide penutup) |
| `none` | Full HTML custom (cover saja) |

### Two-cols: vertical alignment
```md
---
layout: two-cols
---

<div class="col-center">   ← kolom kiri vertikal tengah

### Konten kiri

</div>

::right::

<div class="pl-5 col-center">   ← kolom kanan vertikal tengah

### Konten kanan

</div>
```

Tanpa `col-center`, kolom mulai dari atas (default).

---

## 4. Komponen Vue (dipanggil di .md)

### Semua deck: `Callout`
```md
<Callout type="tip" title="Judul Opsional">
Isi teks. <b>Bold</b> didukung via :deep(strong).
</Callout>
```
| `type` | Ikon | Warna bar |
|--------|------|-----------|
| `tip` | ✅ | hijau |
| `concept` | 🧭 | ungu |
| `warning` | ⚠️ | merah |
| `analogy` | 💡 | amber |
| `industry` | 🏭 | cyan |

### Semua deck: `Quiz`
```md
<Quiz
  :n="1"
  q="Pertanyaan pilihan ganda?"
  :options="['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D']"
  :answer="1"
  explain="Penjelasan singkat mengapa B benar."
/>
```
- `:answer` adalah index berbasis 0.
- Tombol "Coba lagi" sudah built-in. Saat jawaban **benar** → muncul **reward konfeti + 🎉** (hormati `prefers-reduced-motion`).
- **Variasikan posisi jawaban benar — JANGAN selalu B.** Sebar A/B/C/D.
- `q`/`options`/`explain` dirender via `v-html` (boleh `<b>`). Untuk slide kuis lengkap (layout `class: qz` + ilustrasi + ruang penjelasan) lihat **§17**.

### Opto deck: komponen interaktif
| Komponen | Fungsi |
|----------|--------|
| `<MLPipeline />` | Diagram alur ML end-to-end yang bisa diklik |
| `<FeatureScatter />` | Scatter plot Sehat vs Rusak + slider batas keputusan |
| `<ThresholdMetrics />` | Confusion matrix + slider ambang batas (Presisi↔Recall) |
| `<OverfitLab />` | Lab overfitting/underfitting: slider derajat polinom + noise + preset, plot fit (kiri) & kurva train/test error U (kanan), kartu diagnosis menyala. Numerik least-squares ternormalisasi + ridge + Gauss pivoting (di komponen). |

### Getaran deck: komponen interaktif
| Komponen | Fungsi |
|----------|--------|
| `<FourierBuilder />` | Builder sinyal harmonik interaktif |
| `<AliasingDemo />` | Demo aliasing nyquist |
| `<TimeFreqDemo />` | Demo domain waktu vs frekuensi |
| `<ResonanceCurve />` | Kurva resonansi interaktif |

---

## 5. Palet Warna & CSS Classes

### Palet utama (tema navy)
| Token | Hex | Penggunaan |
|-------|-----|-----------|
| background utama | `#080e1a` | latar slide |
| background gelap | `#04060d` | slide ganjil (selang-seling) |
| panel kartu | `#0d1526` | bg kartu |
| teks utama | `#f1f5f9` | heading |
| teks sekunder | `#cbd5e1` | body text |
| ungu aksen | `#a78bfa` | H1, aksen primer |
| cyan aksen | `#38bdf8` / `#00e5ff` | H2, garis aksen |
| hijau | `#34d399` | positif, Sehat |
| merah | `#fb7185` | negatif, Rusak |
| amber | `#fbbf24` | variabel, penekanan |

### Kartu: `.ml-card`
```html
<div class="ml-card v">  <!-- v=ungu, e=hijau, a=amber, c=merah, s=cyan -->
  <div class="ml-h">Judul Kartu</div>
  <div class="ml-t">Isi kartu.</div>
</div>
```

### Grid: `.ml-grid`
```html
<div class="ml-grid c2">  <!-- c2, c3, c4 -->
  <div class="ml-card e">...</div>
  <div class="ml-card s">...</div>
</div>
```

### Chip/pill: `.chip`
```html
<span class="chip e">label</span>  <!-- v/e/a/c/s -->
```

### Metrik angka besar: `.metric`
```html
<div class="ml-grid c4">
  <div class="metric e"><div class="mv">96%</div><div class="ml">Akurasi</div></div>
</div>
```

### Langkah bernomor: `.step`
```html
<div class="step"><span class="step-no">1</span><b>Label</b> — Penjelasan.</div>
```

### Kotak highlight: `.pesan-kunci`
```html
<div class="pesan-kunci">
<strong>🔑 Label:</strong> <span>Isi pesan.</span>
</div>
```

### Blok rangkuman (ubah list jadi kartu)
```html
<div class="rangkuman">

### Poin-Poin Kunci

- 🧠 **Item satu** — penjelasan singkat.
- 🎯 **Item dua** — penjelasan singkat.

</div>
```

### Daftar pustaka
```html
<div class="ref-list">

1. **Nama, A.** (2024). *Judul Buku*. Penerbit.

</div>
```

---

## 6. Header & Footer Global

### `global-top.vue` — Header (slide 2+)
- Fixed, tinggi **44px**, z-index 100.
- Kiri: logo UMB + brand name (hard-coded per deck).
- Tengah: **judul slide** dari `title` frontmatter (animated transition antar slide).
- Kanan: icon animasi (gear untuk Opto, lainnya untuk Getaran).
- Slide penutup dengan `title: "Terima Kasih"` → judul diganti animasi gelombang.
- `padding-top: 68px` di `style.css` sudah menyediakan ruang di bawah header — jangan ubah tanpa pertimbangan.

### `global-bottom.vue` — Footer (slide 2+)
- Fixed, tinggi **32px**.
- Kiri: nama dosen.
- Tengah: dot progress bar (dot aktif = pill ungu melebar).
- Kanan: `halaman / total`.

---

## 7. Transisi Antar-Slide

| Nilai | Efek |
|-------|------|
| `slide-left` | geser kiri (default) |
| `slide-right` | geser kanan |
| `slide-up \| slide-down` | geser naik masuk / turun keluar |
| `fade` | pudar |
| `zoom` | zoom masuk/keluar |
| `flip` | putar 3D sumbu Y |
| `glide` | geser halus + scale |
| `swirl` | putar + scale |
| `blur-fade` | pudar + blur |

Durasi global: `480ms` (set di `style.css` via `--slidev-transition-duration`).

`zoom`, `flip`, `glide`, `swirl`, `blur-fade` adalah transisi **custom** (didefinisikan di `style.css` sebagai `.<nama>-enter-active/-leave-active` + `-enter-from/-leave-to`) — sisanya bawaan Slidev. **Variasikan transisi tiap slide**: idealnya tidak ada dua slide berurutan dengan transisi sama, dan semua efek terpakai.

---

## 8. Cover Slide — Pattern

Cover selalu `layout: none` dan berisi HTML penuh. Elemen wajib:

```
.nn-bg         — diagram dekoratif (SVG jaringan saraf / sinyal)
.hdr           — header cover (logo UMB + tag mata kuliah)
.ctr           — area tengah: badge, ttl1, ttl2, fml (formula), sep, au (author)
.ftr           — footer: nama MK · prodi · kampus + jam live (nowStr)
```

Script Vue di cover:
```vue
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
const nowStr = ref('')
let timer
function tick() {
  const d = new Date()
  const day = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  nowStr.value = `${day} · ${time}`
}
onMounted(() => { tick(); timer = setInterval(tick, 30000) })
onBeforeUnmount(() => clearInterval(timer))
</script>
```

---

## 9. Menambah Slide Baru

```md
---
layout: default
transition: slide-left | slide-right
title: "Judul Slide Baru"
---

Konten langsung di sini — **tanpa H1**.

<div class="ml-grid c2">
  <div class="ml-card e">...</div>
  <div class="ml-card s">...</div>
</div>
```

---

## 10. Menambah Deck Baru

1. Buat folder `<Course>/Slides/` baru.
2. Copy `global-top.vue`, `global-bottom.vue`, `style.css`, `package.json` dari deck yang ada, sesuaikan nama file & port.
3. Buat `<nama-deck>.md` dengan frontmatter global + slide cover.
4. Tambah entry di `.github/workflows/deploy-slides.yml` (build + copy ke `_site`).
5. Tambah entry `forwardPorts` + `postStartCommand` di `.devcontainer/devcontainer.json`.

---

## 11. Dev & Deploy

```bash
# Dev lokal
cd Optimalisasi-dan-Automasi/Slides && npm run dev   # → port 3031
cd Getaran-Mekanik/Slides && npm run dev              # → port 3030

# Build manual
npm run build   # output ke dist/

# Export PDF
npm run export
```

Deploy ke GitHub Pages: jalankan workflow `Deploy Slides ke GitHub Pages` dari tab Actions (manual dispatch). Workflow **selalu build ulang** dari `.md` — tidak bergantung pada `dist/` yang ter-commit.

---

## 12. Git Workflow

- Branch: `claude/<feature-slug>` (lihat instruksi per sesi).
- Setelah edit: `git checkout -B <branch> main` → `git add` → `git commit` → `git push --force-with-lease -u origin <branch>`.
- Merge via `mcp__github__create_pull_request` + `mcp__github__merge_pull_request` (squash).
- Selalu sync main lokal setelah merge: `git checkout main && git pull origin main`.

---

## 13. Anti-Pola

| Jangan | Kenapa |
|--------|--------|
| Tulis `# H1` di body slide konten | Header sudah menampilkan `title` frontmatter — jadi duplikat |
| Edit `dist/` manual | Deploy workflow membangun ulang; perubahan manual akan tertimpa |
| Gunakan `layout: none` untuk slide konten | Hanya untuk cover; konten akan kehilangan header/footer global |
| Ubah `padding-top` di `.slidev-layout` tanpa pertimbangan | Akan menggeser seluruh konten dan bisa tumpang tindih header |
| Gunakan `String` namespaced CSS di `<style scoped>` cover untuk override global | Scope cover terpisah dari layout — gunakan `style.css` untuk override global |
| Sisip/hapus slide tanpa renumber selector `.slidev-page-N` | Nomor halaman bergeser → styling spesifik-slide salah sasaran. **Lihat §14** |
| Tafsir kata **"panjang" = tinggi** | Untuk dosen ini, **"panjang" = lebar (horizontal/width)**, **"tinggi" = height (vertikal)** |
| Netralkan notch (`margin-right:0 !important`) lalu andalkan `margin:0 auto` untuk center | `margin-right:0 !important` mengalahkan auto → konten kedorong ke kanan. Pakai `margin-left/right: auto !important`. **Lihat §15** |

---

## 14. Tata Letak Per-Slide via `.slidev-page-N` (+ GOTCHA renumber)

Penyesuaian posisi/animasi khusus SATU slide ditaruh di `style.css` pakai selector `.slidev-page-N` (N = nomor halaman; cover = 1).

```css
/* "Geser isi slide ke atas" — default-nya .slidev-layout.default ter-center vertikal */
.slidev-page-12 .slidev-layout.default { justify-content: flex-start; padding-top: 58px !important; }
```
- Default `.slidev-layout.default` = `flex-direction: column; justify-content: center`. Override `justify-content: flex-start` + atur `padding-top` untuk menggeser isi ke atas. `padding-top` lebih besar → jarak dari header lebih lega (header global 44px; default mulai 68px; ≥46px aman dari header).
- Latar selang-seling pakai DAFTAR paritas `.slidev-page-3,5,7,…,25` (slide ganjil → `#04060d`). **Berbasis paritas, bukan konten.**

### ⚠️ GOTCHA paling berbahaya: nomor halaman bergeser saat sisip/hapus slide
Menyisipkan/menghapus slide **menggeser nomor semua slide setelahnya** → semua selector `.slidev-page-N` untuk slide yang bergeser jadi **salah sasaran**. Setelah sisip/hapus:
1. Renumber selector spesifik-slide `±k` (k = jumlah slide yang disisip/hapus) untuk N ≥ titik sisip.
2. **JANGAN** ubah daftar latar paritas — alternasinya tetap benar.
3. Page ganjil (9, 11, 15, 17, 19…) muncul DI DUA tempat: daftar paritas **dan** aturan spesifik. Renumber HANYA yang spesifik → pakai regex shift pada region SETELAH daftar paritas (anchor pada selector unik spesifik-slide, mis. `.slidev-page-17 .slidev-layout.default`).

```powershell
$s = [IO.File]::ReadAllText($p)
$i = $s.IndexOf('.slidev-page-17 .slidev-layout.default')   # awal blok spesifik (BUKAN daftar paritas)
$h = $s.Substring(0,$i); $t = $s.Substring($i)
$t = [regex]::Replace($t, '\.slidev-page-(\d+)', { param($m) '.slidev-page-' + ([int]$m.Groups[1].Value + 3) })
[IO.File]::WriteAllText($p, $h + $t)
```

---

## 15. Notch Kamera (zona webcam pojok kanan-bawah)

Aturan global di `style.css`: `.slidev-layout.default > :last-child { margin-right: 150px !important }` → menyisihkan ~150px kanan untuk overlay kamera (pojok kanan-bawah, ±x≥818 & y≥363 pada kanvas 980×552). **Elemen TERAKHIR slide otomatis menyempit di kanan.**

- Taruh `<style>` di ATAS slide agar elemen konten asli tetap `:last-child`.
- Untuk konten **ter-center** (komponen/kuis), notch malah mendorong ke kanan. Solusi: center eksplisit `margin-left: auto !important; margin-right: auto !important` + batasi lebar ≤ ~660px (tepi kanan < 818, bebas kamera).
- Komponen lebar (FeatureScatter/OverfitLab/ThresholdMetrics) biasanya di-anchor kiri (`margin-left:Npx; margin-right:auto`) atau membiarkan notch reserve 150px.

---

## 16. Webcam Terkunci (toggle on/off) — Opto deck

`global-bottom.vue` merender **frame kamera** (`.cam-space` = bingkai roda-gigi) + `<video>` webcam yang **terkunci di posisi guide** (ikut scale slide) — beda dari kamera bawaan Slidev (`WebCamera.vue`) yang `position:fixed` ke viewport & draggable, jadi melenceng saat rasio window berubah.

- State dipusatkan di **`useCamera.js`** (modul shared): `camOn` (ref), `toggleCam`, `startCam/stopCam` (`getUserMedia`), `registerVideo`. Dipakai bersama `global-bottom.vue` (render video) & cover (tombol di footer cover).
- Tombol 📷 di footer global (slide 2+) **dan** footer cover. Status di `localStorage('opto-cam-on')` + auto-resume. `.cam-space` `v-show="camOn"` → frame ikut hilang saat kamera mati.
- Posisi `.cam-space { bottom: 50px }`; di cover `.cam-space.on-cover { bottom: 56px }`. Diameter webcam = lubang tengah roda gigi (SVG: radius hole 60); diameter LUAR gear tetap.
- Butuh konteks aman: `localhost` (dev) / `https` (Pages).

---

## 17. Slide Kuis Interaktif (`<Quiz>` + `class: qz`)

```md
---
layout: default
transition: <bervariasi, lihat §7>
title: "🙋 Sesi Interaktif — Soal N dari 3"
class: qz
---

<div class="qz-ill"> …strip ikon relevan… <span class="qz-tag">materi slide X</span> </div>

<Quiz :n="1" q="…" :options="[…]" :answer="2" explain="…" />
```
- `class: qz` (CSS `.slidev-layout.qz …` di style.css) → layout **top-align + `padding-top`** (sisakan ruang untuk panel penjelasan yang muncul setelah dijawab), kartu kuis **ter-center**, teks kuis diperbesar.
- **Variasikan `:answer`** (jangan selalu B). Reward konfeti otomatis dari `Quiz.vue` saat benar.
- Ilustrasi `.qz-ill` page-agnostic (pakai class `qz`, bukan `.slidev-page-N`) → tahan terhadap sisip/hapus slide.
