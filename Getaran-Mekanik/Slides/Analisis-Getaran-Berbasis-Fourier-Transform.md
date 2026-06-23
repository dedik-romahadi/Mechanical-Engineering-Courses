---
theme: default
title: Analisis Getaran Berbasis Fourier Transform
titleTemplate: '%s — Getaran Mekanik'
info: |
  ## Analisis Getaran Berbasis Fourier Transform
  Materi Kuliah Getaran Mekanik — S1 Teknik Mesin
  Universitas Mercu Buana
author: Dedik Romahadi
colorSchema: dark
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
transition: slide-left
mdc: true
fonts:
  sans: 'Inter'
  mono: 'Fira Code'
layout: none
---

<div class="cover" style="background:#020817;position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden;color:#fff;">
  <div class="bg-grid"></div>
  <div class="bg-glow"></div>

  <div class="wave-track">
    <svg viewBox="0 0 2880 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,40 C90,8 180,72 270,40 C360,8 450,72 540,40 C630,8 720,72 810,40 C900,8 990,72 1080,40 C1170,8 1260,72 1350,40 C1440,8 1530,72 1620,40 C1710,8 1800,72 1890,40 C1980,8 2070,72 2160,40 C2250,8 2340,72 2430,40 C2520,8 2610,72 2700,40 C2790,8 2880,72 2880,40" fill="none" stroke="rgba(59,130,246,0.55)" stroke-width="2.5"/>
    </svg>
  </div>
  <div class="wave-track w2">
    <svg viewBox="0 0 2880 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,40 C120,12 240,68 360,40 C480,12 600,68 720,40 C840,12 960,68 1080,40 C1200,12 1320,68 1440,40 C1560,12 1680,68 1800,40 C1920,12 2040,68 2160,40 C2280,12 2400,68 2520,40 C2640,12 2760,68 2880,40" fill="none" stroke="rgba(16,185,129,0.35)" stroke-width="1.5"/>
    </svg>
  </div>

  <header class="hdr">
    <div class="hdr-l">
      <span class="hdr-ico">🎓</span>
      <div>
        <div class="hdr-uni">Universitas Mercu Buana</div>
        <div class="hdr-dept">Program Studi Teknik Mesin</div>
      </div>
    </div>
    <div class="hdr-tag">Getaran Mekanik</div>
  </header>

  <main class="ctr">
    <div class="badge">📊 &nbsp; Materi Kuliah</div>
    <div class="ttl1">Analisis Getaran</div>
    <div class="ttl2">Berbasis Fourier Transform</div>
    <div class="fml">X(f) = ∫<sub>−∞</sub><sup>+∞</sup> x(t) &middot; e<sup>−j2πft</sup> dt</div>
    <div class="sep"></div>
    <div class="au">
      <span class="au-name">Dedik Romahadi, S.T., M.T.</span>
      <span class="au-sem">Semester Genap 2025/2026</span>
    </div>
  </main>

  <div class="spectrum">
    <div class="bar" style="--pk:14px;--d:0.00s"></div>
    <div class="bar" style="--pk:32px;--d:0.10s"></div>
    <div class="bar" style="--pk:58px;--d:0.05s"></div>
    <div class="bar" style="--pk:82px;--d:0.20s"></div>
    <div class="bar" style="--pk:64px;--d:0.15s"></div>
    <div class="bar" style="--pk:38px;--d:0.30s"></div>
    <div class="bar" style="--pk:72px;--d:0.08s"></div>
    <div class="bar" style="--pk:92px;--d:0.25s"></div>
    <div class="bar" style="--pk:76px;--d:0.12s"></div>
    <div class="bar" style="--pk:50px;--d:0.18s"></div>
    <div class="bar" style="--pk:28px;--d:0.22s"></div>
    <div class="bar" style="--pk:62px;--d:0.35s"></div>
    <div class="bar" style="--pk:86px;--d:0.05s"></div>
    <div class="bar" style="--pk:54px;--d:0.28s"></div>
    <div class="bar" style="--pk:44px;--d:0.14s"></div>
    <div class="bar" style="--pk:68px;--d:0.32s"></div>
    <div class="bar" style="--pk:40px;--d:0.07s"></div>
    <div class="bar" style="--pk:24px;--d:0.19s"></div>
    <div class="bar" style="--pk:66px;--d:0.11s"></div>
    <div class="bar" style="--pk:48px;--d:0.26s"></div>
    <div class="bar" style="--pk:80px;--d:0.03s"></div>
    <div class="bar" style="--pk:36px;--d:0.17s"></div>
  </div>

  <footer class="ftr">
    <span>Mata Kuliah Getaran Mekanik</span>
    <span class="dot">•</span>
    <span>S1 Teknik Mesin</span>
    <span class="dot">•</span>
    <span>Universitas Mercu Buana</span>
    <span class="yr">2026</span>
  </footer>
</div>

<style scoped>
.cover {
  background: #020817;
  position: absolute;
  inset: 0;
  display: flex; flex-direction: column;
  overflow: hidden;
  color: #fff;
}
.bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59,130,246,0.07) 1px, transparent 1px);
  background-size: 48px 48px;
}
.bg-glow {
  position: absolute; top: 38%; left: 50%;
  transform: translate(-50%, -50%);
  width: 620px; height: 320px;
  background: radial-gradient(ellipse, rgba(59,130,246,0.2) 0%, transparent 70%);
  pointer-events: none;
}
.wave-track {
  position: absolute; top: 60%; left: 0;
  width: 200%; height: 80px;
  animation: wscroll 10s linear infinite;
}
.wave-track.w2 {
  top: 65%;
  animation-duration: 15s;
  animation-direction: reverse;
}
.wave-track svg { width: 100%; height: 100%; }
@keyframes wscroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 32px;
  border-bottom: 1px solid rgba(59,130,246,0.25);
  background: rgba(2,8,23,0.85);
  position: relative; z-index: 10;
}
.hdr-l   { display: flex; align-items: center; gap: 10px; }
.hdr-ico  { font-size: 22px; }
.hdr-uni  { font-size: 13px; font-weight: 600; color: #93c5fd; }
.hdr-dept { font-size: 11px; color: #64748b; margin-top: 2px; }
.hdr-tag  {
  font-size: 12px; font-weight: 600; color: #10b981;
  border: 1px solid rgba(16,185,129,0.4);
  padding: 4px 16px; border-radius: 20px;
  background: rgba(16,185,129,0.08); letter-spacing: 0.5px;
}
.ctr {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; padding: 0 80px;
  position: relative; z-index: 10;
}
.badge {
  font-size: 11px; letter-spacing: 3px;
  text-transform: uppercase; color: #3b82f6;
  margin-bottom: 18px;
  animation: fadeup 0.6s ease both;
}
.ttl1 {
  font-size: 56px; font-weight: 800;
  color: #f1f5f9; line-height: 1.1; margin: 0;
  text-shadow: 0 0 40px rgba(59,130,246,0.5);
  animation: fadeup 0.7s 0.1s ease both;
}
.ttl2 {
  font-size: 56px; font-weight: 800;
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1; margin: 0 0 20px;
  animation: fadeup 0.7s 0.2s ease both;
}
.fml {
  font-size: 15px; color: rgba(255,255,255,0.4);
  font-family: 'Fira Code', 'Courier New', monospace;
  padding: 8px 22px;
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: 8px;
  background: rgba(59,130,246,0.05);
  margin-bottom: 20px;
  animation: fadeup 0.7s 0.3s ease both;
}
.sep {
  width: 0; height: 2px;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 2px; margin: 0 auto 16px;
  animation: expand 0.9s 0.4s ease both;
}
@keyframes expand { to { width: 60px; } }
.au { display: flex; flex-direction: column; gap: 4px; animation: fadeup 0.7s 0.5s ease both; }
.au-name { font-size: 17px; font-weight: 600; color: #e2e8f0; }
.au-sem  { font-size: 12px; color: #64748b; }
.spectrum {
  display: flex; justify-content: center;
  align-items: flex-end; gap: 5px;
  height: 96px; padding: 0 32px;
  position: relative; z-index: 10; opacity: 0.65;
}
.bar {
  width: 11px; height: 4px; min-height: 4px;
  background: linear-gradient(to top, #1d4ed8, #3b82f6, #10b981);
  border-radius: 3px 3px 0 0;
  animation: bpulse 1.4s ease-in-out infinite alternate;
  animation-delay: var(--d, 0s);
}
@keyframes bpulse {
  from { height: 4px; }
  to   { height: var(--pk, 20px); }
}
.ftr {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 32px;
  border-top: 1px solid rgba(59,130,246,0.2);
  background: rgba(2,8,23,0.85);
  font-size: 11px; color: #475569;
  position: relative; z-index: 10;
}
.dot { color: #1e3a5f; }
.yr  { margin-left: auto; color: #3b82f6; font-weight: 600; }
@keyframes fadeup {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>

<style>
/* Sembunyikan slide navigator/overview panel kanan */
.slidev-slide-list,
.slidev-slides-list,
nav.slidev-nav,
.nav-start,
.slide-nav,
[class*="SlidesList"],
[class*="slides-list"] {
  display: none !important;
}
/* Pastikan slide container tidak override background */
.slidev-layout.none {
  background: transparent !important;
}
</style>

---
layout: default
---

# Peta Materi

<div class="grid grid-cols-3 gap-4 mt-4">

<div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
<h3 class="text-blue-700 font-bold mb-2">📐 Fondasi Matematis</h3>
<ul class="text-sm space-y-1">
<li>Sinyal & domain waktu</li>
<li>Deret Fourier</li>
<li>Transformasi Fourier kontinu</li>
</ul>
</div>

<div class="bg-green-50 p-4 rounded-lg border border-green-200">
<h3 class="text-green-700 font-bold mb-2">🔢 Komputasi Digital</h3>
<ul class="text-sm space-y-1">
<li>DFT & FFT</li>
<li>Sampling & Aliasing</li>
<li>Windowing</li>
</ul>
</div>

<div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
<h3 class="text-orange-700 font-bold mb-2">⚙️ Aplikasi Teknik</h3>
<ul class="text-sm space-y-1">
<li>Identifikasi frekuensi natural</li>
<li>Fungsi Respons Frekuensi</li>
<li>Condition monitoring</li>
</ul>
</div>

</div>

<div class="mt-6 bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
💡 <strong>Tujuan:</strong> Memahami bagaimana sinyal getaran dalam domain waktu dapat dianalisis lebih efektif dalam domain frekuensi menggunakan Transformasi Fourier.
</div>

---
layout: default
---

# Capaian Pembelajaran (CPMK)

Setelah mempelajari materi ini, mahasiswa mampu:

<v-clicks>

1. **Menjelaskan** konsep Deret Fourier dan Transformasi Fourier serta relevansinya dalam analisis getaran mekanik

2. **Menghitung** koefisien Deret Fourier dari sinyal getaran periodik sederhana

3. **Menerapkan** DFT/FFT untuk menganalisis sinyal getaran diskrit dan menginterpretasi spektrum frekuensi

4. **Mengidentifikasi** frekuensi natural, harmonik, dan anomali dari spektrum getaran mesin

5. **Menggunakan** Python/MATLAB untuk analisis spektral sinyal getaran nyata

</v-clicks>

<div class="mt-4 text-sm text-gray-500" v-click>
📚 Referensi utama: Rao, S.S. (2018). <em>Mechanical Vibrations</em>, 6th Ed. Pearson.
</div>

---
layout: two-cols
---

# Mengapa Domain Frekuensi?

## Domain Waktu
Melihat **bagaimana** amplitudo berubah terhadap waktu

- Komponen harmonik bertumpuk satu sama lain
- Sulit menentukan frekuensi natural secara visual
- Diagnosis kerusakan mesin sangat sulit
- Noise mengaburkan informasi penting

<div class="mt-4 p-3 bg-red-50 rounded border border-red-200 text-sm">
❌ Sinyal: $x(t) = 2\sin(30t) + 0.8\sin(60t) + \text{noise}$\
Sulit dibaca langsung dari grafik waktu.
</div>

::right::

<div class="pl-4">

## Domain Frekuensi
Melihat **frekuensi apa** yang terkandung dalam sinyal

- Setiap komponen frekuensi terpisah jelas
- Frekuensi natural langsung terlihat sebagai puncak
- Diagnosis kerusakan jauh lebih mudah
- Noise tersebar merata, sinyal tetap menonjol

<div class="mt-4 p-3 bg-green-50 rounded border border-green-200 text-sm">
✅ Spektrum: Puncak tajam di 30 Hz (1X) dan 60 Hz (2X) langsung teridentifikasi.
</div>

<div class="mt-3 p-3 bg-blue-50 rounded text-sm">
💡 <strong>Analogi:</strong> Seperti prisma yang memisahkan cahaya putih menjadi warna pelangi — Fourier Transform memisahkan sinyal getaran menjadi komponen frekuensinya.
</div>

</div>

---
layout: default
---

# Sinyal Getaran & Representasinya

## Getaran Harmonik Sederhana (1-DOF, tanpa redaman)

$$x(t) = A\cos(\omega_n t + \phi)$$

di mana: $A$ = amplitudo [m], $\omega_n$ = frekuensi natural [rad/s], $\phi$ = sudut fasa [rad]

<div class="grid grid-cols-2 gap-4 mt-4">

<div class="bg-gray-50 p-4 rounded">

**Sinyal periodik umum (superposisi harmonik):**

$$x(t) = \sum_{k=1}^{N} A_k \cos(k\omega_0 t + \phi_k)$$

Terdiri dari komponen **fundamental** $\omega_0$ dan **harmonik-harmoniknya** $2\omega_0, 3\omega_0, \ldots$

</div>

<div class="bg-gray-50 p-4 rounded">

**Hubungan besaran frekuensi:**

| Besaran | Simbol | Satuan |
|---------|--------|--------|
| Periode | $T$ | s |
| Frekuensi | $f_0 = 1/T$ | Hz |
| Frekuensi sudut | $\omega_0 = 2\pi f_0$ | rad/s |

</div>

</div>

---
layout: default
---

# Deret Fourier — Representasi Sinyal Periodik

Setiap sinyal periodik $x(t)$ dengan periode $T$ dapat dinyatakan sebagai:

$$\boxed{x(t) = \frac{a_0}{2} + \sum_{n=1}^{\infty}\left[a_n \cos\!\left(\frac{2\pi n t}{T}\right) + b_n \sin\!\left(\frac{2\pi n t}{T}\right)\right]}$$

**Koefisien Fourier:**

$$a_0 = \frac{2}{T}\int_0^T x(t)\,dt$$

$$a_n = \frac{2}{T}\int_0^T x(t)\cos\!\left(\frac{2\pi n t}{T}\right)dt, \qquad b_n = \frac{2}{T}\int_0^T x(t)\sin\!\left(\frac{2\pi n t}{T}\right)dt$$

**Amplitudo dan fasa komponen ke-$n$:**

$$C_n = \sqrt{a_n^2 + b_n^2}, \qquad \phi_n = \arctan\!\left(\frac{-b_n}{a_n}\right)$$

<div class="mt-2 bg-blue-50 p-3 rounded text-sm">
$C_n$ adalah <strong>amplitudo spektral</strong> — inilah yang ditampilkan dalam grafik spektrum frekuensi!
</div>

---
layout: default
---

# Deret Fourier — Bentuk Kompleks

Menggunakan identitas Euler $e^{j\theta} = \cos\theta + j\sin\theta$, deret Fourier menjadi:

$$\boxed{x(t) = \sum_{n=-\infty}^{\infty} X_n \, e^{\,j n \omega_0 t}}$$

dengan koefisien kompleks:

$$X_n = \frac{1}{T}\int_0^T x(t)\,e^{-jn\omega_0 t}\,dt$$

<div class="grid grid-cols-2 gap-4 mt-4">

<div class="bg-blue-50 p-4 rounded">

**Hubungan dengan bentuk trigonometri:**
$$X_0 = \frac{a_0}{2}, \quad X_n = \frac{a_n - jb_n}{2}, \quad X_{-n} = X_n^*$$
$$|X_n| = \frac{C_n}{2}, \quad \angle X_n = \phi_n$$

</div>

<div class="bg-green-50 p-4 rounded">

**Keunggulan bentuk kompleks:**
- Notasi jauh lebih ringkas
- Manipulasi aljabar lebih mudah
- Dasar langsung dari DFT/FFT
- Untuk sinyal real: $X_{-n} = X_n^*$ (simetri)

</div>

</div>

---
layout: default
---

# Contoh: Deret Fourier Gelombang Kotak

Gelombang kotak dengan amplitudo $A$ dan periode $T$:

$$x(t) = \begin{cases} +A & 0 < t < T/2 \\ -A & T/2 < t < T \end{cases}$$

**Karena fungsi ganjil:** $a_n = 0$ untuk semua $n$, dan $a_0 = 0$

$$b_n = \frac{4A}{n\pi} \quad (n = 1,3,5,\ldots), \qquad b_n = 0 \quad (n = 2,4,6,\ldots)$$

**Hasil Deret Fourier:**

$$\boxed{x(t) = \frac{4A}{\pi}\left[\sin(\omega_0 t) + \frac{1}{3}\sin(3\omega_0 t) + \frac{1}{5}\sin(5\omega_0 t) + \cdots\right]}$$

<div class="grid grid-cols-2 gap-3 mt-3 text-sm">
<div class="bg-yellow-50 p-3 rounded">
💡 Makin banyak harmonik → approximasi makin mendekati bentuk kotak asli.
</div>
<div class="bg-orange-50 p-3 rounded">
⚠️ <strong>Gibbs phenomenon:</strong> Lonjakan ~9% terjadi di tepi diskontinuitas, tidak hilang meski harmonik → ∞.
</div>
</div>

---
layout: default
---

# Transformasi Fourier Kontinu (CFT)

Untuk sinyal **non-periodik** (periode $T \to \infty$), deret Fourier menjadi integral Fourier:

$$\boxed{X(f) = \int_{-\infty}^{\infty} x(t)\,e^{-j2\pi ft}\,dt} \qquad \text{(Transformasi Fourier)}$$

$$\boxed{x(t) = \int_{-\infty}^{\infty} X(f)\,e^{\,j2\pi ft}\,df} \qquad \text{(Transformasi Fourier Invers)}$$

<div class="grid grid-cols-2 gap-4 mt-4">

<div class="bg-blue-50 p-4 rounded">

**Interpretasi $X(f)$:**
- $|X(f)|$ = **spektrum amplitudo** → kontribusi tiap frekuensi
- $\angle X(f)$ = **spektrum fasa**
- $|X(f)|^2$ = densitas spektral daya (PSD)
- Satuan: [satuan sinyal / Hz]

</div>

<div class="bg-green-50 p-4 rounded">

**Pasangan Fourier penting:**

| $x(t)$ | $X(f)$ |
|--------|--------|
| $\delta(t)$ | $1$ |
| $e^{-at}u(t)$ | $\frac{1}{a+j2\pi f}$ |
| $\cos(2\pi f_0 t)$ | $\frac{\delta(f-f_0)+\delta(f+f_0)}{2}$ |
| Rect$(t/\tau)$ | $\tau\,\text{sinc}(f\tau)$ |

</div>

</div>

---
layout: default
---

# Sifat-Sifat Transformasi Fourier

<div class="text-sm mt-2">

| Sifat | Domain Waktu | Domain Frekuensi |
|-------|-------------|------------------|
| **Linearitas** | $\alpha x(t) + \beta y(t)$ | $\alpha X(f) + \beta Y(f)$ |
| **Pergeseran waktu** | $x(t - t_0)$ | $X(f)\,e^{-j2\pi f t_0}$ |
| **Pergeseran frekuensi** | $x(t)\,e^{\,j2\pi f_0 t}$ | $X(f - f_0)$ |
| **Penskalaan** | $x(at)$ | $\frac{1}{|a|}X\!\left(\frac{f}{a}\right)$ |
| **Diferensiasi** | $\dot{x}(t)$ | $j2\pi f\,X(f)$ |
| **Konvolusi** | $x(t) * h(t)$ | $X(f)\cdot H(f)$ |
| **Perkalian** | $x(t)\cdot y(t)$ | $X(f) * Y(f)$ |
| **Parseval** | $\int|x|^2dt$ | $\int|X|^2df$ |

</div>

<div class="bg-orange-50 p-3 rounded mt-3">

**Sifat diferensiasi — kunci untuk analisis getaran:**
$$\dot{x}(t) \xrightarrow{\mathcal{F}} j\omega\,X(\omega) \qquad \ddot{x}(t) \xrightarrow{\mathcal{F}} -\omega^2 X(\omega)$$

Artinya: spektrum **kecepatan** = $j\omega$ × spektrum perpindahan; spektrum **akselerasi** = $-\omega^2$ × spektrum perpindahan.

</div>

---
layout: default
---

# Transformasi Fourier Diskrit (DFT)

Dalam praktik, sinyal diukur sebagai **sekuens diskrit** $x[n]$ dari $N$ sampel:

$$\boxed{X[k] = \sum_{n=0}^{N-1} x[n]\,e^{-j\frac{2\pi}{N}kn}, \quad k = 0, 1, \ldots, N-1}$$

$$\boxed{x[n] = \frac{1}{N}\sum_{k=0}^{N-1} X[k]\,e^{\,j\frac{2\pi}{N}kn}, \quad n = 0, 1, \ldots, N-1}$$

**Pemetaan bin frekuensi ke frekuensi fisik:**

$$f_k = \frac{k}{N\,\Delta t} = \frac{k \cdot f_s}{N}, \quad k = 0, 1, \ldots, \frac{N}{2}$$

<div class="grid grid-cols-2 gap-3 mt-3 text-sm">

<div class="bg-blue-50 p-3 rounded">

**Parameter DFT:**
- $N$ = jumlah sampel
- $\Delta t = 1/f_s$ = interval sampling [s]
- $f_s$ = frekuensi sampling [Hz]
- Resolusi frekuensi: $\Delta f = f_s / N = 1/(N\Delta t)$

</div>

<div class="bg-green-50 p-3 rounded">

**Kompleksitas komputasi:**
- DFT langsung: $\mathcal{O}(N^2)$ operasi
- FFT (Cooley-Tukey): $\mathcal{O}(N\log_2 N)$
- Untuk $N=1024$: DFT ≈ $10^6$, FFT ≈ $10^4$ ✨

</div>

</div>

---
layout: two-cols
---

# FFT — Fast Fourier Transform

## Algoritma Cooley-Tukey (1965)

Membagi DFT $N$ titik menjadi dua DFT $N/2$ titik (divide & conquer). Misalkan $W_N = e^{-j2\pi/N}$:

$$X[k] = \underbrace{\sum_{n\,\text{genap}} x[n]\,W_N^{kn}}_{E[k]} + W_N^k \underbrace{\sum_{n\,\text{ganjil}} x[n]\,W_N^{kn}}_{O[k]}$$

**Butterfly computation:**
$$X[k] = E[k] + W_N^k \cdot O[k]$$
$$X[k+N/2] = E[k] - W_N^k \cdot O[k]$$

Proses ini berulang secara rekursif sampai $N=1$, menghasilkan $\log_2 N$ tahap.

::right::

<div class="pl-4">

## Implementasi Python

```python
import numpy as np
from scipy.fft import fft, fftfreq

# Sinyal: 3sin(2π·50t) + sin(2π·120t)
fs = 1000        # sampling rate [Hz]
T  = 1.0         # durasi [s]
N  = int(T * fs)

t = np.linspace(0, T, N, endpoint=False)
x = (3*np.sin(2*np.pi*50*t)
   +   np.sin(2*np.pi*120*t))

# Hitung FFT
X     = fft(x)
freqs = fftfreq(N, 1/fs)

# Ambil sisi positif
idx = freqs >= 0
amp = 2*np.abs(X[idx])/N
f   = freqs[idx]
```

</div>

---
layout: default
---

# Resolusi Frekuensi & Parameter Akuisisi

<div class="grid grid-cols-3 gap-4 mt-3">

<div class="bg-blue-50 p-4 rounded">

### Resolusi Frekuensi
$$\Delta f = \frac{f_s}{N} = \frac{1}{T_{total}}$$

- Makin panjang sinyal → resolusi makin halus
- **Trade-off:** akurasi frekuensi vs. durasi akuisisi

</div>

<div class="bg-green-50 p-4 rounded">

### Frekuensi Nyquist
$$f_{Nyq} = \frac{f_s}{2}$$

- Batas frekuensi tertinggi yang bisa dianalisis
- Wajib: $f_{Nyq} > f_{\max,\text{sinyal}}$
- Praktik: $f_s \geq 2.56\,f_{\max}$

</div>

<div class="bg-orange-50 p-4 rounded">

### Spectral Lines
$$N_{lines} = \frac{N}{2.56}$$

- Konvensi analyzer industri
- $N=1024$ → 400 lines
- $N=2048$ → 800 lines
- $N=4096$ → 1600 lines

</div>

</div>

<div class="mt-4 bg-gray-50 p-4 rounded text-sm">

**Contoh perancangan akuisisi:**
- Frekuensi tertinggi: $f_{\max} = 500$ Hz → $f_s = 2.56 \times 500 = 1280$ Hz
- Resolusi yang diinginkan: $\Delta f = 0.5$ Hz
- Jumlah sampel: $N = f_s / \Delta f = 1280 / 0.5 = 2560$ sampel
- Waktu akuisisi: $T = N/f_s = 2560/1280 = \mathbf{2}$ **detik**

</div>

---
layout: two-cols
---

# Teorema Nyquist & Aliasing

## Teorema Nyquist-Shannon

Sinyal harus di-sampling minimal **dua kali** frekuensi tertingginya:
$$f_s \geq 2\,f_{\max}$$

**Aliasing** terjadi bila $f_s < 2f_{\max}$:

$$f_{alias} = \left|f_{sinyal} - n\cdot f_s\right|, \quad n \in \mathbb{Z}$$

Frekuensi tinggi "terlipat" menjadi frekuensi rendah yang tidak nyata!

**Contoh:**
Sinyal $f_0 = 800$ Hz, $f_s = 1000$ Hz:
$$f_{alias} = |800 - 1 \times 1000| = 200 \text{ Hz}$$

Terlihat seolah ada komponen 200 Hz yang tidak pernah ada!

::right::

<div class="pl-4">

## Pencegahan Aliasing

<div class="bg-green-50 p-4 rounded mb-3">

**Anti-aliasing filter (hardware):**
- Low-pass filter analog sebelum ADC
- Potong di $f_s/2$ (Nyquist)
- Wajib ada pada setiap sistem akuisisi getaran

</div>

<div class="bg-blue-50 p-4 rounded">

**Oversampling + decimation (software):**
- Sample jauh lebih cepat dari Nyquist
- Terapkan digital low-pass filter
- Downsample ke $f_s$ target
- Digunakan pada sistem modern (sigma-delta ADC)

</div>

<div class="bg-red-50 p-3 rounded mt-3 text-sm">
⚠️ Aliasing dalam getaran mesin dapat menyebabkan <strong>salah diagnosis kerusakan</strong>!
</div>

</div>

---
layout: default
---

# Windowing — Mengatasi Spectral Leakage

**Masalah:** DFT mengasumsikan sinyal periodik dalam window. Jika sinyal tidak berakhir sempurna → *spectral leakage* (energi bocor ke bin frekuensi tetangga).

**Solusi:** Kalikan sinyal dengan fungsi window $w[n]$ yang memudar ke nol di kedua tepi:

$$x_w[n] = x[n] \cdot w[n]$$

<div class="grid grid-cols-2 gap-4 mt-3">

<div>

| Window | Keunggulan | Cocok untuk |
|--------|-----------|-------------|
| **Rectangular** | Resolusi terbaik | Sinyal transien |
| **Hanning** | Leakage rendah | Getaran acak |
| **Hamming** | Side lobe rendah | Sinyal campuran |
| **Flattop** | Akurasi amplitudo | Kalibrasi |
| **Exponential** | Transien meredam | Impact test |

</div>

<div class="bg-blue-50 p-4 rounded">

**Window Hanning (paling umum dipakai):**
$$w[n] = 0.5\left[1 - \cos\!\left(\frac{2\pi n}{N-1}\right)\right]$$

**Koreksi amplitudo setelah windowing:**
$$A_{koreksi} = \frac{2\,|X[k]|}{N \cdot \bar{w}}$$

di mana $\bar{w} = \frac{1}{N}\sum w[n]$ adalah nilai rata-rata window.

</div>

</div>

---
layout: default
---

# Spektrum Amplitudo & Fasa

Dari DFT $X[k]$ diperoleh dua jenis spektrum:

<div class="grid grid-cols-2 gap-4 mt-3">

<div class="bg-blue-50 p-4 rounded">

### Spektrum Amplitudo

$$|X[k]| = \sqrt{\text{Re}(X[k])^2 + \text{Im}(X[k])^2}$$

- Single-sided (untuk sinyal real): $A_k = \dfrac{2|X[k]|}{N}$ untuk $k > 0$
- Komponen DC: $A_0 = \dfrac{|X[0]|}{N}$
- Satuan sama dengan satuan input [m, m/s, m/s²]
- **Power Spectral Density:** $S_{xx}(f) = \dfrac{|X(f)|^2}{\Delta f}$

</div>

<div class="bg-green-50 p-4 rounded">

### Spektrum Fasa

$$\angle X[k] = \arctan\!\left(\frac{\text{Im}(X[k])}{\text{Re}(X[k])}\right)$$

- Satuan: radian atau derajat
- Digunakan untuk: analisis modal, ODS (Operational Deflection Shape), balancing rotor
- Pada monitoring kondisi sederhana sering diabaikan

**RMS dari spektrum:**
$$x_{rms} = \sqrt{\sum_{k} |X[k]|^2 / N^2}$$

</div>

</div>

---
layout: default
---

# Analisis Getaran Mesin dengan FFT

**Prosedur analisis:**

<div class="grid grid-cols-4 gap-3 mt-4">

<div class="bg-blue-50 p-3 rounded text-center">
<div class="text-3xl mb-1">📡</div>
<div class="font-bold text-sm">1. Akuisisi</div>
<div class="text-xs mt-1">Akselerometer → kondisioner sinyal → ADC → data digital $x[n]$</div>
</div>

<div class="bg-green-50 p-3 rounded text-center">
<div class="text-3xl mb-1">🔲</div>
<div class="font-bold text-sm">2. Preprocessing</div>
<div class="text-xs mt-1">Anti-alias filter, detrending DC, windowing</div>
</div>

<div class="bg-orange-50 p-3 rounded text-center">
<div class="text-3xl mb-1">⚡</div>
<div class="font-bold text-sm">3. FFT</div>
<div class="text-xs mt-1">Hitung DFT → spektrum amplitudo $|X[k]|$</div>
</div>

<div class="bg-purple-50 p-3 rounded text-center">
<div class="text-3xl mb-1">🔍</div>
<div class="font-bold text-sm">4. Interpretasi</div>
<div class="text-xs mt-1">Identifikasi puncak, bandingkan baseline</div>
</div>

</div>

<div class="mt-4 bg-gray-50 p-4 rounded text-sm">

**Pola frekuensi khas pada spektrum getaran mesin:**

| Frekuensi | Sumber |
|-----------|--------|
| $1\times$ RPM | Unbalance (ketidakseimbangan massa) |
| $2\times$ RPM | Misalignment, bearing wear |
| $n\times$ RPM ($n\geq3$) | Cacat mekanis, kelonggaran (looseness) |
| $f_{mesh}$ = (RPM/60) × jumlah gigi | Kerusakan gear |
| $f_{BPFO}, f_{BPFI}, f_{BSF}$ | Kerusakan bearing |

</div>

---
layout: default
---

# Identifikasi Frekuensi Natural via FRF

## Fungsi Respons Frekuensi (FRF)

FRF adalah rasio respons output terhadap input gaya dalam domain frekuensi:

$$H(\omega) = \frac{X(\omega)}{F(\omega)} = \frac{1}{k - m\omega^2 + jc\omega}$$

$$|H(\omega)| = \frac{1}{\sqrt{(k-m\omega^2)^2 + (c\omega)^2}}$$

<div class="grid grid-cols-2 gap-4 mt-3">

<div class="bg-blue-50 p-4 rounded">

**Puncak FRF → Frekuensi Natural**

Pada resonans $\omega = \omega_n = \sqrt{k/m}$:
$$|H(\omega_n)|_{\max} = \frac{1}{c\,\omega_n} = \frac{1}{2k\zeta}$$

Makin kecil $\zeta$ → puncak makin tajam dan tinggi.

</div>

<div class="bg-green-50 p-4 rounded">

**Metode Half-Power (−3 dB Band):**

$$\zeta \approx \frac{f_2 - f_1}{2f_n}$$

di mana $f_1, f_2$ adalah frekuensi saat amplitudo FRF turun ke $|H|_{\max}/\sqrt{2}$.

Disebut **bandwidth method** untuk identifikasi damping ratio experimentally.

</div>

</div>

---
layout: default
---

# Contoh Soal 1 — Identifikasi Sumber Getaran

**Soal:** Sensor akselerometer pada poros mengukur getaran mesin yang berputar pada 1800 RPM. Hasil FFT menunjukkan puncak signifikan pada: **30 Hz, 60 Hz, 90 Hz, dan 340 Hz**.

Tentukan sumber masing-masing komponen frekuensi!

<v-clicks>

**Penyelesaian:**

Frekuensi putaran: $f_{rot} = 1800\,\text{RPM} / 60 = 30\,\text{Hz}$

| Frekuensi | Rasio | Diagnosis |
|-----------|-------|-----------|
| 30 Hz | $1\times$ | **Unbalance** (ketidakseimbangan massa rotor) |
| 60 Hz | $2\times$ | **Misalignment** aksial atau keausan bearing |
| 90 Hz | $3\times$ | Harmonik ke-3 → kelonggaran mekanis |
| 340 Hz | $11.3\times$ | Bukan harmonik bulat → kemungkinan **frekuensi meshing** gear (perlu cek jumlah gigi) |

**Parameter akuisisi yang digunakan:**
$$\Delta f = \frac{f_s}{N} = \frac{5000}{4096} \approx 1.22\,\text{Hz} \quad (\text{cukup untuk memisahkan 30-60-90 Hz})$$

</v-clicks>

---
layout: default
---

# Contoh Soal 2 — Identifikasi Frekuensi Natural

**Soal:** Uji impak (hammer test) pada pelat baja menghasilkan FRF dengan:
- Puncak pada $f_n = 125$ Hz, $|H|_{\max} = 4.2 \times 10^{-4}$ m/N
- Titik half-power: $f_1 = 121.5$ Hz, $f_2 = 128.5$ Hz
- Massa efektif pelat: $m = 2.5$ kg

Tentukan $\omega_n$, $\zeta$, $k$, dan $c$!

<v-clicks>

**Penyelesaian:**

$$\omega_n = 2\pi \times 125 = 785.4\,\text{rad/s}$$

$$\zeta = \frac{f_2 - f_1}{2f_n} = \frac{128.5 - 121.5}{2 \times 125} = \frac{7}{250} = 0.028 = \mathbf{2.8\%}$$

$$k = m\,\omega_n^2 = 2.5 \times (785.4)^2 = 1.54 \times 10^6\,\text{N/m}$$

$$c = 2\,m\,\omega_n\,\zeta = 2 \times 2.5 \times 785.4 \times 0.028 = 110.0\,\text{N·s/m}$$

</v-clicks>

---
layout: two-cols
---

# Aplikasi Industri — Predictive Maintenance

## Frekuensi Cacat Bearing

Untuk bearing dengan $N_r$ rolling element, diameter rolling $d$, pitch diameter $D$, sudut kontak $\alpha$:

$$f_{BPFO} = \frac{N_r \cdot n}{120}\left(1 - \frac{d}{D}\cos\alpha\right)$$

$$f_{BPFI} = \frac{N_r \cdot n}{120}\left(1 + \frac{d}{D}\cos\alpha\right)$$

$$f_{BSF} = \frac{D \cdot n}{120\,d}\left[1 - \left(\frac{d}{D}\cos\alpha\right)^2\right]$$

di mana $n$ = RPM poros.

::right::

<div class="pl-4">

## Pola Diagnosis

| Kondisi | Pola Spektrum |
|---------|---------------|
| **Unbalance** | Puncak $1\times$ dominan |
| **Misalignment** | $1\times$ + $2\times$ kuat |
| **Looseness** | Banyak sub/super harmonik |
| **Bearing BPFO** | Puncak $f_{BPFO}$ + sidebands |
| **Gear mesh** | $f_{mesh}$ + harmonik |

<div class="mt-4 bg-blue-50 p-3 rounded text-sm">

**Frekuensi fundamental putaran (FTF):**
$$f_{FTF} = \frac{n}{120}\left(1 - \frac{d}{D}\cos\alpha\right)$$

FTF adalah frekuensi putar sangkar (cage). Kerusakan dini bearing sering muncul sebagai sidebands di sekitar BPFO/BPFI dengan jarak $f_{FTF}$.

</div>

</div>

---
layout: default
---

# Indikator Kondisi Getaran

Selain spektrum FFT, indikator statistik digunakan untuk monitoring:

<div class="grid grid-cols-3 gap-4 mt-3">

<div class="bg-blue-50 p-4 rounded">

### RMS
$$x_{rms} = \sqrt{\frac{1}{N}\sum_{n=1}^{N}x[n]^2}$$
- Terkait energi total getaran
- ISO 10816: batas per kelas mesin
- Satuan: mm/s (kecepatan)

</div>

<div class="bg-green-50 p-4 rounded">

### Crest Factor
$$CF = \frac{x_{\text{peak}}}{x_{rms}}$$
- Normal: $CF \approx 1.4$ – $2.0$
- Impak/cacat: CF meningkat
- Deteksi dini kerusakan bearing

</div>

<div class="bg-orange-50 p-4 rounded">

### Kurtosis
$$K = \frac{\frac{1}{N}\sum(x-\bar{x})^4}{\left(\frac{1}{N}\sum(x-\bar{x})^2\right)^2}$$
- Normal: $K = 3$
- Cacat bearing: $K > 3$
- Sangat sensitif di tahap awal

</div>

</div>

<div class="mt-3 bg-gray-50 p-3 rounded text-sm">

**Standar ISO 10816-3:** Batas kecepatan getaran RMS [mm/s] untuk mesin industri: Baik <2.3 / Memuaskan 2.3–4.5 / Tidak Memuaskan 4.5–7.1 / Tidak Dapat Diterima >7.1

</div>

---
layout: default
---

# Implementasi Python — Analisis FFT Lengkap

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.fft import fft, fftfreq
from scipy.signal import windows

# Simulasi sinyal getaran mesin (1800 RPM)
fs    = 5000
T     = 2.0
N     = int(T * fs)
t     = np.linspace(0, T, N, endpoint=False)
f_rot = 30   # 1X = 30 Hz

x = (2.5 * np.sin(2*np.pi * f_rot * t)       # 1X unbalance
   + 0.8 * np.sin(2*np.pi * 2*f_rot * t)     # 2X misalignment
   + 0.3 * np.sin(2*np.pi * 3*f_rot * t)     # 3X harmonik
   + 0.1 * np.random.randn(N))               # noise

# Windowing (Hanning) + FFT
win   = windows.hann(N)
X     = fft(x * win)
freqs = fftfreq(N, 1/fs)

# Amplitudo single-sided (koreksi window Hanning)
amp   = 2 * np.abs(X[:N//2]) / (N * np.mean(win))
f_pos = freqs[:N//2]

# Plot
plt.figure(figsize=(10, 4))
plt.plot(f_pos, amp)
plt.xlabel('Frekuensi [Hz]'); plt.ylabel('Amplitudo [m/s²]')
plt.title('Spektrum FFT Getaran Poros (1800 RPM)')
plt.xlim([0, 200]); plt.grid(True); plt.tight_layout(); plt.show()
```

---
layout: default
---

# Implementasi MATLAB — Analisis Spektral

```matlab
%% Analisis FFT Getaran Mesin
clear; clc; close all;

% Parameter sinyal
fs    = 5000;       % frekuensi sampling [Hz]
T     = 2.0;        % durasi [s]
N     = fs * T;
t     = (0:N-1) / fs;
f_rot = 30;         % 1X rotasi = 30 Hz (1800 RPM)

% Simulasi sinyal getaran
x = 2.5*sin(2*pi*f_rot*t) + 0.8*sin(2*pi*2*f_rot*t) ...
  + 0.3*sin(2*pi*3*f_rot*t) + 0.1*randn(1,N);

% Window Hanning + FFT
win    = hann(N)';
X      = fft(x .* win);
f      = (0:N/2-1) * fs/N;

% Koreksi amplitudo untuk window Hanning
amp    = 2 * abs(X(1:N/2)) / (N * mean(win));

% Visualisasi
subplot(2,1,1);
plot(t(1:2000), x(1:2000));
xlabel('Waktu [s]'); ylabel('Akselerasi [m/s²]');
title('Sinyal Getaran — Domain Waktu');

subplot(2,1,2);
plot(f, amp);
xlabel('Frekuensi [Hz]'); ylabel('Amplitudo [m/s²]');
title('Spektrum FFT (Hanning window)'); xlim([0 200]); grid on;
```

---
layout: default
---

# Latihan & Tugas

## Latihan Mandiri

<v-clicks>

1. **Deret Fourier:** Hitung 5 koefisien pertama Deret Fourier untuk sinyal getaran *segitiga* (triangular wave) dengan amplitudo $A = 1$ m dan periode $T = 0.02$ s.

2. **Parameter DFT:** Sistem getaran perlu dianalisis hingga $f_{\max} = 2000$ Hz dengan resolusi $\Delta f = 0.5$ Hz. Tentukan: (a) $f_s$ minimum, (b) jumlah sampel $N$, (c) waktu akuisisi.

3. **Aliasing:** Sinyal mengandung komponen pada 80 Hz, 150 Hz, dan 600 Hz. Jika $f_s = 500$ Hz, tentukan frekuensi alias yang muncul di spektrum.

4. **Interpretasi spektrum:** Dari spektrum FFT poros yang berputar 24 Hz, teridentifikasi puncak pada 24, 48, 72, dan 288 Hz. Berapa jumlah gigi gear jika 288 Hz adalah frekuensi meshing?

</v-clicks>

## Tugas Kelompok (2 orang)

<v-click>

Ukur sinyal getaran menggunakan aplikasi akselerometer smartphone. Ekspor data CSV, lakukan analisis FFT dengan Python, dan identifikasi komponen frekuensi dominan. Kumpulkan laporan 3–5 halaman + kode Python.

</v-click>

---
layout: default
---

# Rangkuman

<div class="grid grid-cols-2 gap-6">

<div>

### Konsep Kunci

<v-clicks>

- **Deret Fourier:** sinyal periodik = jumlah sinusoidal harmonik dengan koefisien $a_n$, $b_n$
- **Transformasi Fourier:** perpindahan domain waktu ↔ frekuensi untuk sinyal umum
- **DFT/FFT:** implementasi diskrit & efisien ($\mathcal{O}(N\log N)$) untuk komputer
- **Spektrum:** memperlihatkan amplitudo dan fasa tiap komponen frekuensi
- **FRF:** alat identifikasi parameter modal (frekuensi natural, damping)

</v-clicks>

</div>

<div>

### Aturan Praktis

<v-clicks>

- $f_s \geq 2.56\,f_{\max}$ — standar industri analyzer
- $\Delta f = 1/T_{total}$ — resolusi frekuensi
- Selalu gunakan **window** untuk sinyal stasioner
- **Anti-alias filter** wajib sebelum ADC
- Puncak $1\times, 2\times, 3\times$ RPM = panduan diagnosis dasar
- Validasi spektrum dengan domain waktu!

</v-clicks>

</div>

</div>

<div class="mt-5 bg-blue-50 p-4 rounded" v-click>

**Pesan kunci:** Fourier Transform adalah "kacamata" yang memungkinkan kita melihat sinyal getaran dari sudut pandang frekuensi. Apa yang sulit dibaca dalam domain waktu menjadi jelas dalam domain frekuensi — inilah dasar dari seluruh teknologi predictive maintenance modern.

</div>

---
layout: default
---

# Referensi

<div class="space-y-2 mt-4 text-sm">

1. **Rao, S.S.** (2018). *Mechanical Vibrations*, 6th Ed. Pearson Education. *(Bab 11 — Signal Processing)*

2. **Brandt, A.** (2011). *Noise and Vibration Analysis: Signal Analysis and Experimental Procedures*. Wiley.

3. **Proakis, J.G. & Manolakis, D.G.** (2006). *Digital Signal Processing*, 4th Ed. Pearson.

4. **Randall, R.B.** (2021). *Vibration-based Condition Monitoring*, 2nd Ed. Wiley.

5. **Cooley, J.W. & Tukey, J.W.** (1965). An Algorithm for the Machine Calculation of Complex Fourier Series. *Mathematics of Computation*, 19(90), 297–301.

6. **ISO 10816-3:2009** — Mechanical vibration — Evaluation of machine vibration by measurements on non-rotating parts.

7. **Dokumentasi Python:**
   - `scipy.fft`: scipy.org/doc/scipy/reference/fft.html
   - `scipy.signal.windows`: untuk berbagai jenis window functions

</div>

---
layout: center
class: text-center
---

# Terima Kasih

**Ada pertanyaan?**

<div class="mt-6 text-gray-600">

Dedik Romahadi, S.T., M.T.\
📧 dedik.romahadi@mercubuana.ac.id\
Program Studi Teknik Mesin — Universitas Mercu Buana

</div>

<div class="mt-6 text-sm text-gray-400">

*Slide ini dibuat dengan [Slidev](https://sli.dev) — presentasi berbasis Markdown*

</div>

<div class="abs-br m-6 text-sm text-gray-400">
Getaran Mekanik — Universitas Mercu Buana | 2026
</div>
