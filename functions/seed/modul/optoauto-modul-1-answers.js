/* eslint-disable max-len */
/**
 * optoauto-modul-1 — answer-key metadata.
 *
 * DIAUTHOR / DIKOREKSI MANUAL pada 2026-06-23 dari soal asli di
 * Optimalisasi-dan-Automasi/Modul/Modul-1.html. Versi sebelumnya berisi
 * placeholder yang SALAH (jiplakan modul lain — topik stasioneritas/Box-Cox)
 * dan sudah diganti total.
 *
 * Nilai komputasi diverifikasi dengan numpy/scipy memakai "Dataset Referensi"
 * persis dari modul: np.random.seed(42), fs=1000, T=2s, N=2000,
 * f=25/60/120 Hz, A=1.0/0.5/0.25, noise = np.random.normal(0, 0.15, N).
 *
 * Topik: dasar time series untuk monitoring mesin — sampling & Teorema
 * Nyquist/aliasing (f_Nyquist = fs/2), RMS, Crest Factor (peak/RMS), ISO 10816,
 * dan fitur domain-waktu (mean, std, peak, SNR, THD, autokorelasi).
 *
 * Format: MC entries pakai letter answer (A/B/C/D), Comp pakai numeric answer +
 * tolerance. Explain WAJIB ada (modul reveal jawaban setelah submit untuk
 * pembelajaran formative).
 */

const MC = [
  { qId: "mc1", type: "mc", points: 1, answer: "B", explain: "Ciri khas <strong>time series</strong>: <strong>urutan observasi terhadap waktu</strong> adalah informasi yang harus dipertahankan (ada autokorelasi antar waktu, urutan tidak boleh diacak). (A) jumlah baris tidak relevan; (C) tidak wajib ada kolom kategori; (D) bisa dari sumber apa pun, bukan hanya sensor industri." },
  { qId: "mc2", type: "mc", points: 1, answer: "B", explain: "Periode sampling <code>&Delta;t = 1/f_s = 1/1000 = 0.001 s = <strong>1 ms</strong></code> per sampel. (A) 1 s berarti fs 1 Hz; (C) 1 &micro;s berarti fs 1 MHz; (D) salah satuan." },
  { qId: "mc3", type: "mc", points: 1, answer: "B", explain: "Teorema Nyquist-Shannon: <code>f_s &ge; 2&middot;f_maks</code> agar sinyal dapat direkonstruksi tanpa distorsi. (A) sama dengan f_maks tidak cukup; (C) setengahnya jelas under-sampling; (D) bukan rumus Nyquist." },
  { qId: "mc4", type: "mc", points: 1, answer: "B", explain: "Sinyal 80 Hz dengan <code>f_s = 100 Hz</code> punya Nyquist <code>= 50 Hz</code>; karena 80 &gt; 50 terjadi <strong>aliasing</strong> &mdash; sinyal tampak sebagai frekuensi palsu di bawah Nyquist (di sini <code>|80 &minus; 100| = 20 Hz</code>). (A) salah, syarat fs &ge; 2&times; tidak terpenuhi; (C)/(D) bukan efek aliasing." },
  { qId: "mc5", type: "mc", points: 1, answer: "C", explain: "Frekuensi Nyquist <code>f_N = f_s/2 = 10 kHz / 2 = <strong>5 kHz</strong></code>. (A) itu fs sendiri; (B) 2&times;fs; (D) salah." },
  { qId: "mc6", type: "mc", points: 1, answer: "B", explain: "Komponen berperiode TETAP & terkait kalender/jadwal (shift harian, weekend mingguan) = <strong>Musiman (Seasonal)</strong>. (A) Trend = arah jangka panjang; (C) Siklik = periode tidak tetap (mis. siklus bisnis); (D) Residual/Noise = sisa acak." },
  { qId: "mc7", type: "mc", points: 1, answer: "B", explain: "Untuk sinyal AC (berosilasi sekitar nol) ukuran energi efektif = <strong>RMS</strong>, karena Mean &asymp; 0 sehingga tidak informatif. (A) mean sinyal AC nol; (C) median & (D) mode tidak terkait energi sinyal." },
  { qId: "mc8", type: "mc", points: 1, answer: "C", explain: "Crest Factor tinggi (&gt;4, yaitu peak/RMS besar) berarti ada lonjakan tajam relatif terhadap energi rata-rata &rarr; <strong>impulsive event</strong> seperti spalling pada raceway bearing. (A) salah, CF sehat sinusoidal &asymp; 1.41; (B)/(D) bukan indikasi CF tinggi." },
  { qId: "mc9", type: "mc", points: 1, answer: "C", explain: "ISO 10816 machine class I (motor &lt;15 kW): RMS getaran <code>&lt; 0.71 mm/s</code> masuk zona <strong>A = Baik (Good)</strong>, mesin sehat. (A) Unsatisfactory & (B) Unacceptable adalah zona getaran jauh lebih tinggi; (D) salah, justru terkategori jelas." },
  { qId: "mc10", type: "mc", points: 1, answer: "C", explain: "Sinyal bearing high-speed bisa mencapai 5 kHz, jadi praktek industri pakai oversampling 5&ndash;10&times; &rarr; <strong>25&ndash;50 kHz</strong> demi margin keamanan & desain anti-aliasing filter. (A) 1 kHz under-sampling parah; (B) tepat di Nyquist tidak menyisakan margin; (D) 1 MHz boros tanpa manfaat nyata." }
];

const COMP_EZ = [
  { qId: "c1", type: "comp", points: 2, answer: 0.0068, tolerance: 0.05, explain: "Mean deret <code>= np.mean(x)</code>. Karena sinyal getaran ini AC (sinusoid + noise nol-mean), rata-ratanya <strong>mendekati nol</strong>; pada dataset referensi (seed 42) nilai persisnya <code>&asymp; 0.0068</code>." },
  { qId: "c2", type: "comp", points: 2, answer: 0.8282, tolerance: 0.02, explain: "RMS <code>= np.sqrt(np.mean(x**2))</code>, ukuran energi efektif sinyal. Untuk dataset referensi hasilnya <code>&asymp; <strong>0.828</strong></code> (cocok prediksi Parseval &radic;(&Sigma;A&sup2;/2 + &sigma;&sup2;) &asymp; 0.824)." },
  { qId: "c3", type: "comp", points: 2, answer: 0.8284, tolerance: 0.02, explain: "Sample std <code>= np.std(x, ddof=1)</code>. Karena mean <code>&asymp; 0</code>, standar deviasi praktis <strong>sama dengan RMS</strong>: <code>&asymp; <strong>0.828</strong></code>." },
  { qId: "c4", type: "comp", points: 2, answer: 1.9263, tolerance: 0.05, explain: "Peak <code>= np.max(np.abs(x))</code> &mdash; nilai absolut maksimum, menangkap lonjakan tertinggi. Pada dataset referensi <code>&asymp; <strong>1.93</strong></code> (puncak konstruktif 3 sinusoid + noise)." },
  { qId: "c5", type: "comp", points: 2, answer: 2.3259, tolerance: 0.05, explain: "Crest Factor <code>= peak/RMS = 1.9263 / 0.8282 &asymp; <strong>2.33</strong></code>. Khas sinyal multi-frekuensi normal (CF &asymp; 2&ndash;3); sinusoidal murni hanya <code>&radic;2 &asymp; 1.41</code>." },
  { qId: "c6", type: "comp", points: 2, answer: 5000, tolerance: 0.5, explain: "Frekuensi Nyquist <code>f_N = f_s/2 = 10000/2 = <strong>5000 Hz</strong></code> &mdash; batas frekuensi tertinggi yang bisa direkonstruksi tanpa aliasing pada sampling 10 kHz." },
  { qId: "c7", type: "comp", points: 2, answer: 1.0, tolerance: 0.01, explain: "Periode sampling <code>&Delta;t = 1/f_s = 1/1000 = 0.001 s</code>, dikali 1000 &rarr; <code><strong>1.0 ms</strong></code> per sampel." },
  { qId: "c8", type: "comp", points: 2, answer: 10000, tolerance: 0.5, explain: "Jumlah sampel <code>N = f_s &times; T = 2000 &times; 5 = <strong>10000</strong></code> sampel selama 5 detik pada sampling 2 kHz." },
  { qId: "c9", type: "comp", points: 2, answer: 1.4142, tolerance: 0.01, explain: "RMS sinusoidal murni <code>= A/&radic;2</code>. Untuk <code>A = 2.0</code>: <code>2.0/&radic;2 = <strong>1.4142</strong></code>; verifikasi numerik <code>np.sqrt(np.mean(x**2))</code> dari <code>x = 2&middot;sin(2&pi;&middot;10&middot;t)</code> memberi nilai sama." },
  { qId: "c10", type: "comp", points: 2, answer: 20, tolerance: 0.5, explain: "SNR dalam dB <code>= 10&middot;log&#8321;&#8320;(P_s/P_n) = 10&middot;log&#8321;&#8320;(100/1) = 10&middot;2 = <strong>20 dB</strong></code>." }
];

const COMP_HARD = [
  { qId: "c11", type: "comp", points: 4, answer: 0.8239, tolerance: 0.03, allowPartial: true, partialPoints: 1, explain: "RMS teoritis (Parseval): tiap sinusoid menyumbang power <code>A_i&sup2;/2</code>, noise menyumbang <code>&sigma;&sup2;</code>. <code>RMS = &radic;(1.0&sup2;/2 + 0.5&sup2;/2 + 0.25&sup2;/2 + 0.15&sup2;) = &radic;(0.5 + 0.125 + 0.03125 + 0.0225) &asymp; <strong>0.824</strong></code> &mdash; cocok dengan RMS empiris <code>np.sqrt(np.mean(x**2)) &asymp; 0.828</code>." },
  { qId: "c12", type: "comp", points: 4, answer: 10, tolerance: 0.5, allowPartial: true, partialPoints: 1, explain: "Sinyal 50 Hz disampel under-Nyquist pada <code>f_s = 60 Hz</code> (Nyquist 30 Hz). Frekuensi alias <code>= |f_signal &minus; k&middot;f_s|</code> dengan k integer terdekat <code>= round(50/60) = 1</code> &rarr; <code>|50 &minus; 1&middot;60| = <strong>10 Hz</strong></code>. FFT hasil downsampel menempatkan puncak tepat di 10 Hz." },
  { qId: "c13", type: "comp", points: 4, answer: 0.8501, tolerance: 0.05, allowPartial: true, partialPoints: 1, explain: "Rolling RMS window 256 sampel: geser window di sepanjang <code>x</code>, hitung <code>np.sqrt(np.mean(x[i:i+256]**2))</code> tiap posisi, lalu ambil maksimum. Untuk dataset referensi maksimumnya <code>&asymp; <strong>0.85</strong></code> (window dengan energi tertinggi)." },
  { qId: "c14", type: "comp", points: 4, answer: 50, tolerance: 1, allowPartial: true, partialPoints: 1, explain: "Autokorelasi (ACF) sinyal yang sudah di-center: <code>np.correlate(xc, xc, 'full')</code>, ambil sisi positif, normalisasi terhadap lag 0. Puncak lokal pertama setelah lag 5 ada di <strong>lag 50</strong> &mdash; tepat sama dengan periode TRUE sinyal <code>sin(2&pi;&middot;t/50)</code>." },
  { qId: "c15", type: "comp", points: 4, answer: 55.9, tolerance: 1.0, allowPartial: true, partialPoints: 1, explain: "THD% = RMS harmonik (h&ge;2) dibagi RMS fundamental, kali 100. <code>RMS_harm = &radic;(0.5&sup2;/2 + 0.25&sup2;/2) = &radic;0.15625</code>; <code>RMS_fund = 1.0/&radic;2</code>. <code>THD% = &radic;0.15625 / (1/&radic;2) &times; 100 &asymp; <strong>55.9%</strong></code>." }
];

const MODUL_QUESTIONS = [...MC, ...COMP_EZ, ...COMP_HARD];

const SUMMARY = {
  "modulId": "optoauto-modul-1",
  "totalSoal": 25,
  "totalPoin": 50,
  "breakdown": {
    "mc": 10,
    "compEz": 10,
    "compHard": 5
  }
};

module.exports = { MODUL_QUESTIONS, SUMMARY };
