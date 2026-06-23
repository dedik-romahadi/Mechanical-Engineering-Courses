/* eslint-disable max-len */
/**
 * optoauto-modul-4 — answer-key metadata.
 *
 * DIAUTHOR / DIKOREKSI MANUAL pada 2026-06-23 dari soal asli di
 * Optimalisasi-dan-Automasi/Modul/Modul-4.html.
 * Versi sebelumnya adalah PLACEHOLDER yang salah (tanpa field explain, huruf
 * jawaban MC tak terverifikasi, dan c5 keliru). File ini menggantinya total:
 * setiap huruf jawaban MC ditentukan ulang dari nol, dan setiap nilai komputasi
 * diverifikasi memakai numpy/scipy/pandas/statistics.
 *
 * Topik modul: Data cleaning sinyal mesin — imputasi missing value
 * (mean/median/interpolasi linear/forward-fill), deteksi outlier
 * (Z-score, MAD/Modified Z-score, IQR, Hampel), resampling & Nyquist,
 * smoothing (moving average / EMA), penghapusan duplikat timestamp, scaling.
 *
 * Format: MC entries pakai letter answer (A/B/C/D), Comp pakai numeric answer +
 * tolerance. Explain WAJIB ada (modul reveal jawaban setelah submit untuk
 * pembelajaran formative).
 */

const MC = [
  { qId: "mc1", type: "mc", points: 1, answer: "B", explain: "Gap missing yang <strong>pendek (1–3 sampel)</strong> akibat noise komunikasi paling aman diisi dengan <strong>interpolasi linear / forward-fill</strong> — mempertahankan kontinuitas waktu dan mendekati nilai sebenarnya. (A) drop baris menghilangkan kontinuitas time series; (C) mean seluruh kolom menumpulkan dinamika lokal; (D) membiarkan NaN membuat model error." },
  { qId: "mc2", type: "mc", points: 1, answer: "B", explain: "Spike amplitudo besar yang <strong>berulang dengan periode tetap</strong> pada accelerometer bearing adalah <strong>impulse dari bearing yang mulai retak</strong> (sinyal kerusakan dini, mis. BPFO/BPFI), bukan noise — membuangnya sebagai outlier justru menghapus indikator fault. (A) kecepatan algoritma, (C) bentuk distribusi, (D) penurunan std bukan alasan bahayanya." },
  { qId: "mc3", type: "mc", points: 1, answer: "B", explain: "Untuk data <strong>non-Gaussian + banyak outlier ekstrem</strong>, <strong>IQR</strong> (<code>Q1 − 1.5·IQR</code>, <code>Q3 + 1.5·IQR</code>) paling robust karena bebas asumsi distribusi dan kuartil tidak terdistorsi oleh outlier. (A) Z-score: μ &amp; σ justru ditarik oleh outlier; (C) mean ± 2σ sama rapuhnya; (D) min/max scaling bukan metode deteksi." },
  { qId: "mc4", type: "mc", points: 1, answer: "C", explain: "Window moving average yang <strong>terlalu besar</strong> melakukan over-smoothing: <strong>puncak/transien tertumpul atau terhapus</strong> sehingga indikator kerusakan dini (impulse, spike) bisa hilang. (A) hasil justru lebih halus bukan lebih noisy; (B) keliru — lebih besar tidak selalu lebih baik; (D) tidak error selama window ≤ panjang data." },
  { qId: "mc5", type: "mc", points: 1, answer: "C", explain: "Resampling 100 Hz → 10 Hz: Nyquist baru = <code>fs_baru/2 = 10/2 = 5 Hz</code>. Agar tidak aliasing, <strong>frekuensi tertinggi sinyal harus &lt; 5 Hz</strong> (idealnya difilter low-pass anti-aliasing dulu). (A) rata-rata nol tak relevan; (B) paritas window tak relevan; (D) interpolasi cubic tidak mencegah aliasing." },
  { qId: "mc6", type: "mc", points: 1, answer: "B", explain: "Timestamp duplikat ditangani dengan <strong><code>df.drop_duplicates()</code> atau agregasi (mean/last) per timestamp</strong> — indeks waktu jadi unik &amp; valid. (A) duplikat merusak resampling/indexing; (C) menambah +1 ms memalsukan waktu &amp; bisa menggeser sinyal; (D) konversi ke string malah merusak indeks temporal." },
  { qId: "mc7", type: "mc", points: 1, answer: "B", explain: "<strong>Modified Z-score berbasis MAD</strong> memakai <strong>median &amp; MAD (median absolute deviation) yang tidak terdistorsi oleh outlier itu sendiri</strong>, sedangkan Z-score standar memakai mean &amp; std yang ditarik nilai ekstrem (masking). (A) kecepatan bukan alasan; (C) threshold MAD umumnya 3.5, bukan selalu 2; (D) MAD justru tidak butuh asumsi normal ketat." },
  { qId: "mc8", type: "mc", points: 1, answer: "B", explain: "Downsampling 1 kHz → 10 Hz via rata-rata blok 100 sampel adalah low-pass + decimation: <strong>spike pendek tertumpul dan baseline level tetap, tetapi komponen frekuensi tinggi (&gt; Nyquist baru 5 Hz) hilang</strong>. (A) amplitudo spike justru mengecil bukan membesar; (C) averaging meredam aliasing, tidak selalu menyebabkannya; (D) tidak ada pembagian nol." },
  { qId: "mc9", type: "mc", points: 1, answer: "B", explain: "<strong>Rolling Z-score</strong> menghitung μ &amp; σ dalam window bergerak sehingga <strong>adaptif terhadap tren / drift / perubahan baseline lambat</strong> — outlier dinilai relatif ke kondisi lokal, bukan statistik global yang bias. (A) data stasioner Gaussian cukup pakai Z-score global; (C) dataset kecil malah membuat window tidak stabil; (D) butuh konteks urutan/waktu." },
  { qId: "mc10", type: "mc", points: 1, answer: "A", explain: "<strong>Min-Max scaling [0,1]</strong> dipilih saat <strong>algoritma butuh batas terdefinisi</strong> — mis. k-NN (jarak), atau neural network dengan aktivasi sigmoid yang mengharapkan input ter-bound. (B) &amp; (C) data sangat skewed / banyak outlier justru BURUK untuk min-max (rentang terkompresi) → pilih Z-score/robust scaler; (D) jumlah baris/kecepatan bukan kriterianya." },
];

const COMP_EZ = [
  { qId: "c1", type: "comp", points: 2, answer: 1200, tolerance: 0.5, explain: "Jumlah baris <code>N = laju sampling × durasi</code>. Untuk <code>10 Hz × 120 s = <strong>1200</strong></code> baris data (tanpa header)." },
  { qId: "c2", type: "comp", points: 2, answer: 12, tolerance: 0.5, explain: "Aturan Sturges <code>bins = ceil(log₂(N) + 1)</code>. Untuk <code>N = 1500</code>: <code>log₂(1500) ≈ 10.55</code>, <code>+1 = 11.55</code>, <code>ceil = <strong>12</strong></code> bin." },
  { qId: "c3", type: "comp", points: 2, answer: 5.0, tolerance: 0.01, explain: "Z-score <code>= (x − μ) / σ</code>. Untuk <code>x = 8.5</code>, <code>μ = 2.5</code>, <code>σ = 1.2</code>: <code>(8.5 − 2.5)/1.2 = 6/1.2 = <strong>5.0</strong></code> — pembacaan ekstrem 5σ dari mean." },
  { qId: "c4", type: "comp", points: 2, answer: 17.5, tolerance: 0.5, explain: "Dengan <code>np.percentile</code>: <code>Q1 = 11.25</code>, <code>Q3 = 13.75</code>, <code>IQR = 2.5</code>. Upper bound IQR <code>= Q3 + 1.5×IQR = 13.75 + 3.75 = <strong>17.5</strong></code> (nilai 100 terdeteksi outlier)." },
  { qId: "c5", type: "comp", points: 2, answer: 8.0, tolerance: 0.05, explain: "Rolling mean window 5 pada <code>[1..10]</code>: nilai di indeks terakhir = rata-rata 5 elemen terakhir <code>(6+7+8+9+10)/5 = 40/5 = <strong>8.0</strong></code>. (<code>Series.rolling(5).mean().iloc[-1]</code>.)" },
  { qId: "c6", type: "comp", points: 2, answer: 5.0, tolerance: 0.05, explain: "Persentase missing <code>= (baris NaN / total) × 100 = (75/1500) × 100 = <strong>5.0%</strong></code>." },
  { qId: "c7", type: "comp", points: 2, answer: 2.0, tolerance: 0.05, explain: "Frekuensi Nyquist pada laju baru <code>= fs_baru / 2</code>. Untuk resampling ke <code>4 Hz</code>: <code>4/2 = <strong>2 Hz</strong></code> — batas atas frekuensi sinyal yang masih aman tanpa aliasing." },
  { qId: "c8", type: "comp", points: 2, answer: 0.625, tolerance: 0.005, explain: "Min-max scaling <code>= (x − min)/(max − min)</code>. Untuk <code>x = 35</code>, <code>min = 10</code>, <code>max = 50</code>: <code>(35 − 10)/(50 − 10) = 25/40 = <strong>0.625</strong></code>." },
  { qId: "c9", type: "comp", points: 2, answer: 1.5, tolerance: 0.02, explain: "Z-score standardization <code>= (x − μ)/σ</code>. Untuk <code>x = 27.5</code>, <code>μ = 20</code>, <code>σ = 5</code>: <code>(27.5 − 20)/5 = 7.5/5 = <strong>1.5</strong></code>." },
  { qId: "c10", type: "comp", points: 2, answer: 10.0, tolerance: 0.05, explain: "Interpolasi linear pandas pada <code>[2, 4, 6, NaN, NaN, 12, 14]</code> mengisi dua NaN secara merata antara 6 dan 12 → <code>[..., 6, 8, 10, 12, ...]</code>. Nilai pada indeks ke-4 (NaN kedua) <code>= <strong>10.0</strong></code>." }
];

const COMP_HARD = [
  { qId: "c11", type: "comp", points: 4, answer: 2, tolerance: 0.5, allowPartial: true, partialPoints: 1, explain: "Modified Z-score (MAD): <code>median = 12.1</code>, <code>MAD = median(|xᵢ − median|) = 0.1</code>, <code>z_mod = 0.6745·(xᵢ − median)/MAD</code>. Hanya <code>45.0</code> (z≈222) dan <code>−8.0</code> (z≈−136) yang <code>|z_mod| &gt; 3.5</code> → <strong>2 outlier</strong>. Metode robust: median &amp; MAD tak terdistorsi nilai ekstrem." },
  { qId: "c12", type: "comp", points: 4, answer: 2, tolerance: 0.5, allowPartial: true, partialPoints: 1, explain: "Hampel filter, window 5 (centered), threshold <code>3 × 1.4826 × MAD_lokal</code>, dicek di indeks window penuh <code>i = 2..len−3</code>. Hanya indeks 4 (<code>25.0</code>) dan indeks 9 (<code>−10.0</code>) yang deviasinya melebihi ambang lokal (≈0.445) → <strong>2 outlier</strong>." },
  { qId: "c13", type: "comp", points: 4, answer: 126.0, tolerance: 0.5, allowPartial: true, partialPoints: 1, explain: "Interpolasi linear manual pada <code>[10, 11, NaN, NaN, 14, 15, NaN, 17, 18]</code>: tiap NaN diisi <code>v[i] = v[ip] + (i−ip)/(inx−ip)·(v[inx]−v[ip])</code> → hasil <code>[10,11,12,13,14,15,16,17,18]</code>. <code>sum = <strong>126.0</strong></code>." },
  { qId: "c14", type: "comp", points: 4, answer: 13.2, tolerance: 0.05, allowPartial: true, partialPoints: 1, explain: "EMA iteratif <code>α = 0.3</code>, <code>EMA₀ = data₀</code>, <code>EMAᵢ = α·dataᵢ + (1−α)·EMAᵢ₋₁</code> pada <code>[10,12,11,13,14,13,15]</code>. EMA terakhir ≈ <code>13.1996</code> → dibulatkan 2 desimal <code>= <strong>13.2</strong></code>." },
  { qId: "c15", type: "comp", points: 4, answer: 5.55, tolerance: 0.05, allowPartial: true, partialPoints: 1, explain: "Pipeline IQR: <code>Q1 = 5.25</code>, <code>Q3 = 5.95</code>, <code>IQR = 0.7</code>, batas <code>[4.2, 7.0]</code> → outlier <code>{50, −20, 100}</code>. Diganti dengan median data bersih <code>= 5.55</code>. Mean array hasil replacement <code>= <strong>5.55</strong></code> (dibulatkan 2 desimal)." }
];

const MODUL_QUESTIONS = [...MC, ...COMP_EZ, ...COMP_HARD];

const SUMMARY = {
  "modulId": "optoauto-modul-4",
  "totalSoal": 25,
  "totalPoin": 50,
  "breakdown": {
    "mc": 10,
    "compEz": 10,
    "compHard": 5
  }
};

module.exports = { MODUL_QUESTIONS, SUMMARY };
