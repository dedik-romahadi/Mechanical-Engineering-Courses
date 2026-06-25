---
theme: default
title: Konsep Machine Learning
titleTemplate: '%s — Optimalisasi & Otomasi'
info: |
  ## Konsep Machine Learning
  Deteksi Kerusakan Mesin dari Data Getaran
  Mata Kuliah Optimalisasi & Otomasi — S1 Teknik Mesin
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

<div class="cover" style="background:#080e1a;position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden;color:#f1f5f9;">

  <!-- Motif jaringan saraf (faint, di belakang) -->
  <div class="nn-bg">
    <svg viewBox="0 0 520 300" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <g stroke="url(#nng)" stroke-width="1.6" opacity="0.55">
        <line x1="70" y1="70" x2="230" y2="60"/><line x1="70" y1="70" x2="230" y2="150"/><line x1="70" y1="70" x2="230" y2="240"/>
        <line x1="70" y1="150" x2="230" y2="60"/><line x1="70" y1="150" x2="230" y2="150"/><line x1="70" y1="150" x2="230" y2="240"/>
        <line x1="70" y1="230" x2="230" y2="60"/><line x1="70" y1="230" x2="230" y2="150"/><line x1="70" y1="230" x2="230" y2="240"/>
        <line x1="230" y1="60" x2="390" y2="110"/><line x1="230" y1="60" x2="390" y2="190"/>
        <line x1="230" y1="150" x2="390" y2="110"/><line x1="230" y1="150" x2="390" y2="190"/>
        <line x1="230" y1="240" x2="390" y2="110"/><line x1="230" y1="240" x2="390" y2="190"/>
      </g>
      <g>
        <circle class="nn-node" cx="70" cy="70" r="13" fill="#a78bfa" style="--d:0s"/>
        <circle class="nn-node" cx="70" cy="150" r="13" fill="#a78bfa" style="--d:.3s"/>
        <circle class="nn-node" cx="70" cy="230" r="13" fill="#a78bfa" style="--d:.6s"/>
        <circle class="nn-node" cx="230" cy="60" r="14" fill="#38bdf8" style="--d:.2s"/>
        <circle class="nn-node" cx="230" cy="150" r="14" fill="#38bdf8" style="--d:.5s"/>
        <circle class="nn-node" cx="230" cy="240" r="14" fill="#38bdf8" style="--d:.8s"/>
        <circle class="nn-node" cx="390" cy="110" r="16" fill="#34d399" style="--d:.4s"/>
        <circle class="nn-node" cx="390" cy="190" r="16" fill="#fb7185" style="--d:.7s"/>
      </g>
      <defs>
        <linearGradient id="nng" x1="0" y1="0" x2="520" y2="0" gradientUnits="userSpaceOnUse">
          <stop stop-color="#a78bfa"/><stop offset="0.5" stop-color="#38bdf8"/><stop offset="1" stop-color="#34d399"/>
        </linearGradient>
      </defs>
    </svg>
  </div>

  <header class="hdr">
    <div class="hdr-l">
      <img class="hdr-logo" src="./Logo/UMB.png" alt="Universitas Mercu Buana" />
      <div>
        <div class="hdr-uni">Universitas Mercu Buana</div>
        <div class="hdr-dept">Program Studi Teknik Mesin</div>
      </div>
    </div>
    <div class="hdr-tag">Optimalisasi &amp; Otomasi</div>
  </header>

  <main class="ctr">
    <div class="badge">🤖 &nbsp; Materi Kuliah · Otomatisasi Prediktif</div>
    <div class="ttl1">Konsep Machine Learning</div>
    <div class="ttl2">Deteksi Kerusakan Mesin dari Data Getaran</div>
    <div class="fml">ŷ = f( <span class="fx">x</span> ; θ )&nbsp;&nbsp;→&nbsp;&nbsp;<span class="ok">🟢 Sehat</span> &nbsp;/&nbsp; <span class="bad">🔴 Rusak</span></div>
    <div class="sep"></div>
    <div class="au">
      <span class="au-name">Dedik Romahadi, S.T., M.Sc.</span>
      <span class="au-sem">Semester Genap 2025/2026</span>
    </div>
  </main>

  <footer class="ftr">
    <span>Mata Kuliah Optimalisasi &amp; Otomasi</span>
    <span class="dot">•</span>
    <span>S1 Teknik Mesin</span>
    <span class="dot">•</span>
    <span>Universitas Mercu Buana</span>
    <span class="yr">{{ nowStr }}</span>
  </footer>
</div>

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

<style scoped>
.cover { background: #080e1a; position: absolute; inset: 0; display: flex; flex-direction: column; overflow: hidden; color: #f1f5f9; }
.nn-bg { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-46%); width: 92%; max-width: 980px; opacity: 0.22; pointer-events: none; }
.nn-bg svg { width: 100%; height: auto; }
.nn-node { transform-origin: center; animation: nn-pulse 2.6s ease-in-out infinite; animation-delay: var(--d); filter: drop-shadow(0 0 8px currentColor); }
@keyframes nn-pulse { 0%,100% { opacity: .5; r: 12px; } 50% { opacity: 1; r: 16px; } }
.hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 32px; border-bottom: none; position: relative; z-index: 10;
  background:
    radial-gradient(120% 180% at 50% -60%, rgba(124,77,255,0.14), transparent 60%),
    linear-gradient(90deg, #060c18 0%, #0d1526 50%, #060c18 100%);
}
.hdr::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1.5px;
  background: linear-gradient(90deg, #7c4dff, #a78bfa, #00e5ff, #fbbf24, #a78bfa, #7c4dff);
  background-size: 300% 100%; animation: rule-slide 4s linear infinite;
}
@keyframes rule-slide { from { background-position: 0% 0%; } to { background-position: 100% 0%; } }
.hdr-l { display: flex; align-items: center; gap: 14px; }
.hdr-logo { height: 46px; width: auto; }
.hdr-uni { font-size: 15px; font-weight: 700; color: #e2e8f0; }
.hdr-dept { font-size: 12px; color: #64748b; }
.hdr-tag { font-size: 12px; font-weight: 700; letter-spacing: .04em; color: #a78bfa; border: 1px solid rgba(167,139,250,.35); border-radius: 999px; padding: 5px 14px; background: rgba(167,139,250,.08); }
.ctr { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; z-index: 5; padding: 0 24px; }
.badge { font-size: 13px; font-weight: 700; letter-spacing: .03em; color: #38bdf8; background: rgba(56,189,248,.10); border: 1px solid rgba(56,189,248,.3); border-radius: 999px; padding: 6px 16px; margin-bottom: 22px; }
.ttl1 { font-size: 56px; font-weight: 800; line-height: 1.05; letter-spacing: -.02em; background: linear-gradient(120deg, #a78bfa 0%, #38bdf8 33%, #34d399 66%, #a78bfa 100%); background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: ttl-grad 5s linear infinite; }
@keyframes ttl-grad { from { background-position: 0% 0%; } to { background-position: -200% 0%; } }
.ttl2 { font-size: 21px; font-weight: 500; color: #cbd5e1; margin-top: 10px; }
.fml { margin-top: 22px; font-family: 'Fira Code', monospace; font-size: 19px; color: #e2e8f0; background: rgba(13,21,38,.7); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; padding: 9px 20px; }
.fml .fx { color: #fbbf24; }
.fml .ok  { color: #34d399; animation: glow-ok  2s ease-in-out infinite; }
.fml .bad { color: #fb7185; animation: glow-bad 2s ease-in-out infinite; animation-delay: 1s; }
@keyframes glow-ok  { 0%,100% { filter: drop-shadow(0 0 2px #34d399); opacity: .65; } 50% { filter: drop-shadow(0 0 14px #34d399) brightness(1.4); opacity: 1; } }
@keyframes glow-bad { 0%,100% { filter: drop-shadow(0 0 2px #fb7185); opacity: .65; } 50% { filter: drop-shadow(0 0 14px #fb7185) brightness(1.4); opacity: 1; } }
.sep { width: 120px; height: 2px; margin: 24px 0 16px; background: linear-gradient(90deg, transparent, #a78bfa, #38bdf8, transparent); }
.au { display: flex; flex-direction: column; gap: 3px; }
.au-name { font-size: 16px; font-weight: 700; color: #f1f5f9; }
.au-sem { font-size: 12px; color: #64748b; }
.ftr {
  display: flex; align-items: center; gap: 10px; padding: 9px 28px; font-size: 11.5px; color: #64748b;
  background: #060c18; position: relative; z-index: 10;
}
.ftr::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1.5px;
  background: linear-gradient(90deg, #7c4dff, #a78bfa, #00e5ff, #fbbf24, #a78bfa, #7c4dff);
  background-size: 300% 100%; animation: rule-slide 4s linear infinite;
}
.ftr .dot { color: #334155; } .ftr .yr { margin-left: auto; color: #475569; font-family: 'Fira Code', monospace; }
</style>

---
layout: default
transition: slide-left | slide-right
title: "Peta Materi"
---

Perjalanan dari **konsep dasar Machine Learning** menuju **penerapan nyata**: mendeteksi kerusakan mesin secara otomatis dari sinyal getaran.

<div class="ml-grid c2" style="margin-top:14px">
  <div class="ml-card v">
    <div class="ml-h">🧠 Fondasi</div>
    <div class="ml-t">Apa itu ML, AI vs ML vs Deep Learning, dan tiga paradigma pembelajaran (supervised, unsupervised, reinforcement).</div>
  </div>
  <div class="ml-card s">
    <div class="ml-h">🔄 Alur Kerja</div>
    <div class="ml-t">Pipeline ML end-to-end: dari sinyal getaran → ekstraksi fitur → model → prediksi.</div>
  </div>
  <div class="ml-card e">
    <div class="ml-h">📊 Klasifikasi</div>
    <div class="ml-t">Memisahkan kondisi <b>Sehat</b> vs <b>Rusak</b>, melatih model, dan algoritma populer (k-NN, Tree, RF, SVM).</div>
  </div>
  <div class="ml-card c">
    <div class="ml-h">🛠️ Studi Kasus</div>
    <div class="ml-t">Evaluasi (confusion matrix, precision/recall) dan deteksi kerusakan <i>bearing</i> dari getaran, lengkap dengan kode.</div>
  </div>
</div>

<div style="margin-top:14px;text-align:center;color:#94a3b8;font-size:13px">🎯 <b style="color:#c4b5fd">Tujuan</b>: paham <i>kapan</i> & <i>bagaimana</i> ML menggantikan aturan manual untuk <i>predictive maintenance</i>.</div>

---
layout: default
transition: fade
title: "Apa itu Machine Learning?"
---

> **Machine Learning** = membuat komputer **belajar pola dari data** untuk membuat keputusan, **tanpa diprogram aturan secara eksplisit**.

<div class="ml-grid c2" style="margin-top:8px">
<div>

### Pemrograman Klasik vs ML

<div class="ml-card a" style="margin:6px 0">
  <div class="ml-h">⚙️ Klasik</div>
  <div class="ml-t">Data + <b>Aturan</b> (ditulis manusia) → Jawaban</div>
</div>
<div class="ml-card e" style="margin:6px 0">
  <div class="ml-h">🤖 Machine Learning</div>
  <div class="ml-t">Data + <b>Jawaban</b> (contoh) → <b>Aturan</b> (model belajar sendiri)</div>
</div>

Model menemukan sendiri fungsi $f$ sehingga $\hat{y} = f(x;\theta)$ cocok dengan contoh.

</div>
<div>

### AI ⊃ ML ⊃ Deep Learning

<div style="display:flex;flex-direction:column;gap:6px;align-items:center;margin-top:8px">
  <div style="width:100%;background:rgba(167,139,250,.10);border:1px solid rgba(167,139,250,.35);border-radius:10px;padding:8px 12px;text-align:center;color:#c4b5fd;font-weight:700">🧩 Artificial Intelligence
    <div style="width:82%;margin:6px auto 0;background:rgba(56,189,248,.10);border:1px solid rgba(56,189,248,.35);border-radius:9px;padding:7px 10px;color:#7dd3fc">🤖 Machine Learning
      <div style="width:74%;margin:6px auto 0;background:rgba(52,211,153,.10);border:1px solid rgba(52,211,153,.35);border-radius:8px;padding:6px 8px;color:#6ee7b7">🧠 Deep Learning</div>
    </div>
  </div>
</div>

</div>
</div>

<Callout type="analogy">
Seperti <b>anak belajar mengenali kucing</b>: kita tak menjelaskan "kumis + 4 kaki + ekor". Kita cukup tunjukkan banyak <i>contoh</i> kucing — otaknya menyimpulkan polanya sendiri. ML bekerja persis begitu.
</Callout>

---
layout: two-cols
transition: slide-up | slide-down
title: "Rule-Based vs Machine Learning"
class: tight
---

<div class="col-center">

### 🔔 Rule-Based (Pertemuan 13)

Keputusan dari **aturan tetap** buatan engineer:

```text
JIKA RMS > 4.5 mm/s  → Alarm
JIKA Kurtosis > 5    → Cek bearing
```

<div class="ml-card a" style="margin-top:8px">
  <div class="ml-h">✔️ Unggul saat</div>
  <div class="ml-t">Aturan jelas, sedikit variabel, butuh transparansi & jaminan keselamatan (FSM, ANSI/ISA 18.2).</div>
</div>
<div class="ml-card c" style="margin-top:6px">
  <div class="ml-h">✘ Batasnya</div>
  <div class="ml-t">Tak skalabel: 50 fitur × 100 mode kerusakan → ribuan aturan manual yang mustahil dirawat.</div>
</div>

</div>

::right::

<div class="pl-5 col-center">

### 🤖 Machine Learning

Model **belajar batas keputusan** langsung dari data berlabel:

<div class="ml-card e" style="margin-top:6px">
  <div class="ml-h">✔️ Unggul saat</div>
  <div class="ml-t">Banyak fitur, pola rumit/non-linier, data historis melimpah, pola berubah seiring waktu.</div>
</div>
<div class="ml-card c" style="margin-top:6px">
  <div class="ml-h">✘ Batasnya</div>
  <div class="ml-t">Butuh data berkualitas + berlabel; model bisa jadi "kotak hitam" yang sulit ditafsirkan.</div>
</div>

<div class="pesan-kunci" style="margin-top:12px">
<strong>💡 Bukan saingan — tapi berlapis.</strong> <span>Rule-based jadi <i>safety net</i>; ML jadi lapisan adaptif di atasnya.</span>
</div>

</div>

---
layout: default
transition: zoom
title: "Tiga Paradigma Pembelajaran"
---

<div class="ml-grid c3" style="margin-top:10px">
  <div class="ml-card e">
    <div class="ml-h">🎯 Supervised</div>
    <div class="ml-t"><b>Data berlabel</b> (input → output diketahui). Model belajar memetakan keduanya.
    <br><br>• Klasifikasi: Sehat / Rusak<br>• Regresi: sisa umur (RUL)</div>
    <div style="margin-top:6px"><span class="chip e">← fokus kita</span></div>
  </div>
  <div class="ml-card s">
    <div class="ml-h">🔍 Unsupervised</div>
    <div class="ml-t"><b>Tanpa label</b>. Model mencari struktur tersembunyi sendiri.
    <br><br>• Clustering kondisi mesin<br>• <i>Anomaly detection</i> (deteksi pola asing)</div>
    <div style="margin-top:6px"><span class="chip s">data tak berlabel</span></div>
  </div>
  <div class="ml-card a">
    <div class="ml-h">🕹️ Reinforcement</div>
    <div class="ml-t">Agen belajar lewat <b>coba–salah</b> & <i>reward</i> dari lingkungan.
    <br><br>• Penjadwalan perawatan optimal<br>• Kontrol adaptif</div>
    <div style="margin-top:6px"><span class="chip a">reward-driven</span></div>
  </div>
</div>

<Callout type="concept" title="Deteksi kerusakan = Supervised Classification">
Kita punya data getaran historis yang sudah dilabeli teknisi (<b>sehat</b>/<b>rusak</b>). Tugas model: memetakan <b>fitur getaran → label kondisi</b>. Inilah klasifikasi terbimbing.
</Callout>

---
layout: default
transition: glide
title: "Alur Kerja Machine Learning"
---

<div style="color:#94a3b8;font-size:13px;margin-bottom:6px">Klik tiap tahap untuk melihat detailnya. Inilah <i>pipeline</i> yang sama dipakai di hampir semua sistem ML industri.</div>

<MLPipeline />

---
layout: default
transition: slide-left | slide-right
title: "Dari Getaran ke Fitur"
class: tight
---

Model tak "membaca" sinyal mentah ribuan titik. Sinyal diringkas jadi **fitur** — angka padat yang mewakili kondisi mesin.

| Fitur | Rumus singkat | Sensitif terhadap |
|-------|---------------|-------------------|
| **RMS** | $\sqrt{\frac{1}{N}\sum x_i^2}$ | Energi getaran keseluruhan (unbalance, kelonggaran) |
| **Peak** | $\max \lvert x_i \rvert$ | Impuls/benturan sesaat |
| **Crest Factor** | $\text{Peak}/\text{RMS}$ | Awal kerusakan (impulsif tapi RMS masih rendah) |
| **Kurtosis** | $\frac{1}{N}\sum\!\left(\frac{x_i-\mu}{\sigma}\right)^4$ | Ketajaman impuls → cacat *bearing*/gigi |
| **Puncak FFT** | amplitudo @ $f_{BPFO}, f_{BPFI}$ | Frekuensi cacat spesifik (outer/inner race) |

<Callout type="tip" title="Jembatan dari Getaran Mekanik">
RMS, kurtosis, dan puncak FFT adalah hasil <b>analisis getaran</b> (domain waktu & Fourier). Di sinilah ilmu Getaran Mekanik bertemu ML: <b>fitur yang baik = separuh keberhasilan model</b>.
</Callout>

---
layout: default
transition: slide-left | slide-right
title: "Memisahkan Sehat vs Rusak"
---

<div style="color:#94a3b8;font-size:13px;margin-bottom:4px">Tiap titik = satu mesin, diplot pada 2 fitur. Geser <b>garis batas keputusan</b> (slider) dan amati akurasinya — inilah inti kerja sebuah <i>classifier</i>.</div>

<FeatureScatter />

<div style="margin-top:6px;font-size:12px;color:#94a3b8">
<span class="chip e">🟢 Sehat = RMS &amp; Kurtosis rendah</span>
<span class="chip c">🔴 Rusak = RMS &amp; Kurtosis tinggi</span>
<span class="chip v">Garis = batas yang "dipelajari" model</span>
</div>

---
layout: two-cols
transition: flip
title: "Melatih Model: Train/Test & Overfitting"
class: tight
---

Data dibagi agar performa diukur **jujur** pada data yang belum pernah dilihat:

<div style="display:flex;gap:6px;margin:10px 0">
  <div style="flex:7;background:rgba(52,211,153,.14);border:1px solid rgba(52,211,153,.4);border-radius:8px;padding:8px;text-align:center;color:#6ee7b7;font-weight:700;font-size:12.5px">Training 70–80%<br><span style="font-weight:400;color:#94a3b8;font-size:11px">model belajar</span></div>
  <div style="flex:3;background:rgba(56,189,248,.14);border:1px solid rgba(56,189,248,.4);border-radius:8px;padding:8px;text-align:center;color:#7dd3fc;font-weight:700;font-size:12.5px">Test 20–30%<br><span style="font-weight:400;color:#94a3b8;font-size:11px">ujian</span></div>
</div>

- **Training set** → model menyesuaikan parameter $\theta$.
- **Test set** → mengukur *generalisasi* ke data baru.
- *Cross-validation* → bagi berulang agar estimasi stabil.

::right::

<div class="pl-5 col-center">

### Overfitting vs Underfitting

<div class="ml-card c" style="margin:5px 0">
  <div class="ml-h">📕 Overfitting</div>
  <div class="ml-t">Hafal data latih (termasuk noise). Akurasi latih tinggi, <b>uji jeblok</b>. → sederhanakan model / tambah data.</div>
</div>
<div class="ml-card a" style="margin:5px 0">
  <div class="ml-h">📘 Underfitting</div>
  <div class="ml-t">Model terlalu sederhana, pola pun tak tertangkap. Latih & uji sama-sama buruk. → model lebih kuat / fitur lebih baik.</div>
</div>
<div class="ml-card e" style="margin:5px 0">
  <div class="ml-h">📗 Pas (Good Fit)</div>
  <div class="ml-t">Menangkap pola, abaikan noise. Akurasi latih ≈ uji, dua-duanya tinggi.</div>
</div>

</div>

---
layout: default
transition: swirl
title: "Algoritma Klasifikasi Populer"
---

<div class="ml-grid c2" style="margin-top:10px">
  <div class="ml-card s">
    <div class="ml-h">📍 k-Nearest Neighbors</div>
    <div class="ml-t">Klasifikasikan berdasarkan <b>k tetangga terdekat</b> di ruang fitur. Sederhana & intuitif; lambat untuk data besar.</div>
  </div>
  <div class="ml-card a">
    <div class="ml-h">🌳 Decision Tree</div>
    <div class="ml-t">Rangkaian pertanyaan "jika–maka" (mis. <i>RMS &gt; 4.5?</i>). Sangat mudah ditafsirkan; rawan overfitting.</div>
  </div>
  <div class="ml-card e">
    <div class="ml-h">🌲 Random Forest</div>
    <div class="ml-t"><b>Banyak pohon</b> yang memilih bersama (<i>ensemble</i>). Akurat, tahan noise, andalan untuk data getaran. <span class="chip e">favorit PdM</span></div>
  </div>
  <div class="ml-card v">
    <div class="ml-h">🎯 SVM</div>
    <div class="ml-t">Cari <b>batas pemisah ber-margin maksimum</b>. Kuat di dimensi tinggi; mampu pola non-linier via <i>kernel</i>.</div>
  </div>
</div>

<Callout type="industry" title="Tidak ada algoritma 'terbaik' universal">
<i>No Free Lunch Theorem</i> — pilih lewat eksperimen & validasi. Untuk fitur getaran, <b>Random Forest</b> sering jadi baseline kuat karena akurat sekaligus tahan noise.
</Callout>

---
layout: default
transition: slide-up | slide-down
title: "Mengukur Performa Model"
---

<div style="color:#94a3b8;font-size:13px;margin-bottom:4px">Geser <b>ambang batas</b> dan amati pertukaran <b>Presisi ↔ Recall</b>. Tak ada ambang yang sempurna — semua soal kompromi.</div>

<ThresholdMetrics />

<Callout type="warning" title="Di deteksi kerusakan, Recall sering lebih kritis">
<b>Melewatkan</b> mesin rusak (False Negative) bisa berujung kegagalan katastrofik. Lebih baik sedikit alarm palsu (FP) daripada satu kerusakan lolos. Maka <b>Recall tinggi</b> kerap diprioritaskan.
</Callout>

---
layout: default
transition: glide
title: "Studi Kasus — Deteksi Kerusakan Bearing"
class: tight
---

<div class="step"><span class="step-no">1</span><b>Akuisisi</b> — akselerometer di rumah bearing merekam getaran (mis. 12 kHz).</div>
<div class="step"><span class="step-no">2</span><b>Ekstraksi fitur</b> — hitung RMS, Crest, Kurtosis, & puncak FFT @ BPFO/BPFI per cuplikan.</div>
<div class="step"><span class="step-no">3</span><b>Pelabelan</b> — beri label kondisi (Sehat / Outer race / Inner race / Ball) dari catatan teknisi.</div>
<div class="step"><span class="step-no">4</span><b>Pelatihan</b> — latih Random Forest dengan train/test split 80/20.</div>
<div class="step"><span class="step-no">5</span><b>Deploy</b> — model menilai mesin baru real-time → memicu alarm prediktif.</div>

<div class="ml-grid c4" style="margin-top:12px">
  <div class="metric e"><div class="mv">96%</div><div class="ml">Akurasi uji</div></div>
  <div class="metric s"><div class="mv">0.94</div><div class="ml">Recall (rusak)</div></div>
  <div class="metric a"><div class="mv">0.92</div><div class="ml">Presisi</div></div>
  <div class="metric v"><div class="mv">5</div><div class="ml">Fitur dipakai</div></div>
</div>

<div class="kesimpulan" style="margin-top:12px">✅ <b>Hasil</b>: kerusakan terdeteksi <b>sebelum</b> mesin gagal total — perawatan terencana, <i>downtime</i> turun drastis. Inilah inti <i>predictive maintenance</i> berbasis ML. <span style="color:#94a3b8">(angka ilustratif, lazim dilaporkan pada dataset benchmark seperti CWRU Bearing).</span></div>

---
layout: default
transition: zoom
title: "Contoh Kode Python (scikit-learn)"
class: tight
---

```python
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

# X = fitur getaran [RMS, Peak, CrestFactor, Kurtosis, FFT_BPFO]
# y = label kondisi  (0 = Sehat, 1 = Rusak)
X, y = load_vibration_features("bearing_data.csv")   # (n_sampel, 5)

# 1) Bagi data: 80% latih, 20% uji (stratify jaga proporsi kelas)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

# 2) Latih model
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# 3) Prediksi & evaluasi
y_pred = model.predict(X_test)
print(confusion_matrix(y_test, y_pred))
print(classification_report(y_test, y_pred, target_names=["Sehat", "Rusak"]))

# 4) Pakai untuk mesin baru
kondisi = model.predict([[3.9, 12.1, 3.1, 4.8, 0.21]])   # → array([1]) = Rusak
```

<div style="margin-top:8px;font-size:12px;color:#94a3b8">📦 <b style="color:#c4b5fd">Hanya ~15 baris</b> dari data berlabel ke detektor kerusakan yang berfungsi — kekuatan <i>library</i> ML modern.</div>

---
layout: two-cols
transition: blur-fade
title: "Analogi & Penerapan Industri"
class: tight
---

<Callout type="analogy">
ML seperti <b>dokter berpengalaman</b>: setelah membaca ribuan hasil lab (data berlabel), ia mengenali penyakit dari pola angka — tanpa menghafal satu per satu aturan kaku.
</Callout>

<Callout type="concept" title="Pola universal">
Sensor → Fitur → Model → Keputusan. Pola yang sama dipakai untuk getaran, suhu, arus motor, bahkan log server (DevOps).
</Callout>

::right::

<div class="pl-5">

<Callout type="industry" title="Predictive Maintenance (PdM)">
<b>SKF, Schaeffler, GE, Siemens</b> menjual sistem PdM berbasis ML untuk turbin, pompa, & gearbox. Target: prediksi kegagalan <b>sebelum</b> terjadi.
</Callout>

<Callout type="tip" title="Dampak nyata">
PdM yang baik memangkas <i>unplanned downtime</i> <b>30–50%</b> & biaya perawatan <b>10–40%</b> (laporan industri). ROI tinggi → keahlian yang dicari.
</Callout>

<div class="pesan-kunci" style="margin-top:10px">
<strong>🎓 Untuk lulusan Teknik Mesin:</strong> <span>paham mesin <i>plus</i> ML = kombinasi langka & bernilai tinggi di era Industri 4.0.</span>
</div>

</div>

---
layout: default
transition: slide-left
title: "Uji Pemahaman"
class: tight
---

<Quiz
  :n="1"
  q="Apa pembeda utama Machine Learning dari pemrograman klasik?"
  :options="[
    'ML selalu lebih cepat dieksekusi',
    'ML mempelajari aturan dari data, bukan diberi aturan eksplisit',
    'ML tidak membutuhkan data sama sekali',
    'ML hanya bisa dijalankan di superkomputer'
  ]"
  :answer="1"
  explain="Inti ML: model menemukan pola/aturan sendiri dari contoh (data + jawaban → aturan), berbeda dari pendekatan klasik yang aturannya ditulis manusia."
/>

<Quiz
  :n="2"
  q="Pada deteksi kerusakan mesin, mengapa Recall sering diprioritaskan?"
  :options="[
    'Karena Recall selalu sama dengan akurasi',
    'Agar jumlah alarm palsu nol',
    'Karena melewatkan mesin yang benar-benar rusak (False Negative) sangat berbahaya',
    'Karena Recall membuat model berjalan lebih cepat'
  ]"
  :answer="2"
  explain="False Negative = kerusakan tak terdeteksi → risiko kegagalan katastrofik. Recall tinggi memastikan sebagian besar kasus rusak tertangkap, meski ada sedikit alarm palsu."
/>

---
layout: default
transition: fade
title: "Rangkuman"
---

<div class="rangkuman">

### Poin-Poin Kunci

- 🧠 **Machine Learning** = belajar pola dari data, bukan aturan eksplisit — pelengkap, bukan pengganti rule-based.
- 🎯 Deteksi kerusakan = **supervised classification**: fitur getaran → label Sehat/Rusak.
- 🔄 Alur baku: **Sinyal → Fitur → Latih → Model → Prediksi**; fitur berkualitas adalah kunci.
- 📊 Evaluasi pakai **confusion matrix** & metrik (akurasi, presisi, **recall**, F1); waspadai **overfitting**.
- 🌲 **Random Forest** baseline kuat untuk fitur getaran; pilih algoritma lewat validasi.
- 🛠️ Penerapan: **predictive maintenance** — deteksi dini, hemat biaya & downtime.

</div>

<div class="pesan-kunci">
<strong>🔑 Pesan kunci:</strong> <span>ML mengubah <b>data getaran</b> menjadi <b>keputusan perawatan</b> otomatis. Engineer mesin yang menguasainya memegang masa depan Industri 4.0.</span>
</div>

---
layout: default
transition: slide-up
title: "Referensi"
---

<div class="ref-list">

1. **Géron, A.** (2022). *Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow* (3rd ed.). O'Reilly.
2. **Randall, R. B.** (2011). *Vibration-based Condition Monitoring*. Wiley.
3. **Lei, Y., et al.** (2020). *Applications of machine learning to machine fault diagnosis: A review and roadmap*. Mechanical Systems and Signal Processing, 138, 106587.
4. **Pedregosa, F., et al.** (2011). *Scikit-learn: Machine Learning in Python*. JMLR, 12, 2825–2830.
5. **Smith, W. A., & Randall, R. B.** (2015). *Rolling element bearing diagnostics using the Case Western Reserve University data*. MSSP, 64–65, 100–131.

</div>

---
layout: center
transition: zoom
title: "Terima Kasih"
---

<div style="text-align:center">

<div style="font-size:64px;margin-bottom:6px">🤖🔧</div>

# Terima Kasih

<div style="font-size:19px;color:#cbd5e1;margin-top:4px">Dari <span style="color:#a78bfa">data getaran</span> menuju <span style="color:#34d399">keputusan cerdas</span>.</div>

<div style="margin-top:18px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
  <span class="chip v">Machine Learning</span>
  <span class="chip s">Feature Extraction</span>
  <span class="chip e">Classification</span>
  <span class="chip a">Evaluation</span>
  <span class="chip c">Predictive Maintenance</span>
</div>

<div style="margin-top:22px;color:#64748b;font-size:14px">
<b style="color:#e2e8f0">Dedik Romahadi, S.T., M.Sc.</b><br>
Mata Kuliah Optimalisasi &amp; Otomasi · S1 Teknik Mesin · Universitas Mercu Buana
</div>

<div style="margin-top:14px;color:#475569;font-size:13px">Pertanyaan &amp; diskusi sangat diharapkan 🙌</div>

</div>
