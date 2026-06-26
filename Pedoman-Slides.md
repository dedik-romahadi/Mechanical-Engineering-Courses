# Pedoman-Slides.md — Panduan Pembuatan Slide Slidev

Dokumen ini adalah quick-start untuk Claude sesi baru yang mengerjakan slide Slidev di repo ini. Baca sebelum menyentuh file apapun di `*/Slides/`.

---

## 1. Deck yang Ada

| Deck | Folder | File utama | Port dev | URL deploy |
|------|--------|-----------|----------|-----------|
| Getaran Mekanik | `Getaran-Mekanik/Slides/` | `Analisis-Getaran-Berbasis-Fourier-Transform.md` | 3030 | `.../Getaran-Mekanik/Slides/Analisis-Getaran-Berbasis-Fourier-Transform/` |
| Optimalisasi & Otomasi | `Optimalisasi-dan-Automasi/Slides/` | `penerapan-machine-learning.md` | 3031 | `.../Optimalisasi-dan-Automasi/Slides/penerapan-machine-learning/` |

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
- Tombol "Coba lagi" sudah built-in.

### Opto deck: komponen interaktif
| Komponen | Fungsi |
|----------|--------|
| `<MLPipeline />` | Diagram alur ML end-to-end yang bisa diklik |
| `<FeatureScatter />` | Scatter plot Sehat vs Rusak + slider batas keputusan |
| `<ThresholdMetrics />` | Confusion matrix + slider ambang batas (Presisi↔Recall) |

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
