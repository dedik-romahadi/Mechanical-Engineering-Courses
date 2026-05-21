/* eslint-disable max-len */
/**
 * Optoauto UTS — answer-key metadata (45 soal / 70 poin).
 *
 * SUMBER KEBENARAN: cermin rumus dari `Optimalisasi-dan-Automasi/Exam/UTS.html`
 * (UTS_TF, UTS_MC, UTS_COMP_EZ, UTS_COMP_HARD).
 *
 * Setiap entry hanya berisi data yang dibutuhkan server untuk validasi
 * (type/answer/correctIdx/tolerance/points/allowPartial/partialPoints/explain).
 * TEXT soal, hint, dan diagram TIDAK disertakan — itu tetap di client HTML.
 *
 * Format entry: lihat uts-getaran-answers.js (struktur identik).
 *
 * Catatan source diff vs UTS Getaran:
 *   - Source pakai field name `expected` (bukan `answer`) untuk Comp.
 *     Di seed ini dipertahankan `expected` agar match source.
 *   - Parametric MC source pakai `shuffleSeed(opts, N)` (seed = N saja,
 *     tidak ada offset seperti UTS Getaran). Mirror tepat di sini.
 *   - Comp HARD tidak punya `allowPartial` di source (cuma komentar header
 *     "Partial credit +1 poin jika kode di-submit"). Tetap kami enable
 *     allowPartial=true + partialPoints=1 sesuai konvensi UTS Getaran
 *     (server-side partial credit policy).
 *   - Source MC/Comp HARD/EZ ID memakai prefix `ce`/`ch` (ce1..ce10, ch1..ch5),
 *     bukan `c1..c15` seperti UTS Getaran. Dipertahankan persis.
 *
 * ⚠ PENTING: kalau definisi soal di UTS.html berubah, file ini WAJIB di-update.
 */

// Sync dengan `shuffleSeed()` di Optoauto/Exam/UTS.html line 1667-1676.
function shuffleSeed(arr, seed) {
  const result = [...arr];
  let s = (seed * 9301 + 49297) % 233280;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Helper utk parametric MC: hitung correctIdx setelah shuffle.
function mcShuffledIdx(opts, correctValue, seed) {
  const shuffled = shuffleSeed(opts, seed);
  return shuffled.findIndex((o) => o.v === correctValue);
}

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN A — TRUE / FALSE (10 soal × 1 poin = 10 poin)
// ─────────────────────────────────────────────────────────────────────────────
const TF = [
  { qId: "tf1", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Pertemuan 1 Bagian 01 — definisi time series. Urutan waktu adalah karakteristik fundamental yang membedakannya dari data tabular biasa." },

  { qId: "tf2", type: "tf", points: 1, parametric: true,
    compute: (N) => {
      const fs = (N + 1) * 100;
      const f_nyquist = fs / 2;
      const claim_freq = 600;
      return {
        answer: f_nyquist > claim_freq,
        explain: `f_Nyquist = fs/2 = ${fs}/2 = <b>${f_nyquist} Hz</b>. ${f_nyquist > claim_freq ? `${f_nyquist} > 600 → BENAR` : `${f_nyquist} ≤ 600 → SALAH (aliasing)`}`,
      };
    } },

  { qId: "tf3", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Pertemuan 2 Bagian 04 — operasi nonlinear median 'menelan' spike sepenuhnya, sedangkan MA hanya mengurangi (menyebar spike ke window)." },

  { qId: "tf4", type: "tf", points: 1, parametric: true,
    compute: (N) => {
      let alpha = (N + 1) / 200;
      if (alpha > 0.5) alpha = 0.5;
      if (alpha < 0.01) alpha = 0.01;
      const N_eff = 2 / alpha - 1;
      const claim = 25;
      return {
        answer: N_eff > claim,
        explain: `N_eff = 2/α − 1 = 2/${alpha.toFixed(4)} − 1 = <b>${N_eff.toFixed(1)}</b>. ${N_eff > claim ? `${N_eff.toFixed(1)} > ${claim} → BENAR` : `${N_eff.toFixed(1)} ≤ ${claim} → SALAH`}`,
      };
    } },

  { qId: "tf5", type: "tf", points: 1, parametric: false,
    answer: false,
    explain: "Pertemuan 3 Bagian 02 — Nyquist mensyaratkan fs ≥ 2·fmax = 10 kHz. Praktik industri pakai oversampling 5-10× → 25-50 kHz. 1 kHz akan menyebabkan aliasing parah." },

  { qId: "tf6", type: "tf", points: 1, parametric: true,
    compute: (N) => {
      let bits = 8 + (N % 17);
      if (bits > 24) bits = 24;
      const DR = 6.02 * bits + 1.76;
      const claim = 96;
      return {
        answer: DR > claim,
        explain: `DR = 6.02·${bits} + 1.76 = <b>${DR.toFixed(2)} dB</b>. ${DR > claim ? `${DR.toFixed(2)} > ${claim} → BENAR` : `${DR.toFixed(2)} ≤ ${claim} → SALAH`}`,
      };
    } },

  { qId: "tf7", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Pertemuan 4 Bagian 03 — 3σ asumsi Gaussian. Untuk data non-normal, IQR (1.5×IQR) atau MAD (Median Absolute Deviation) lebih robust." },

  { qId: "tf8", type: "tf", points: 1, parametric: true,
    compute: (N) => {
      const missing_pct = ((N + 1) % 30) + 1;
      const claim = 5;
      return {
        answer: missing_pct < claim,
        explain: `Pertemuan 4 Bagian 04 — complete-case deletion aman jika missing < 5%. ${missing_pct < claim ? `${missing_pct}% < 5% → AMAN (BENAR)` : `${missing_pct}% ≥ 5% → tidak aman, butuh imputation (SALAH)`}`,
      };
    } },

  { qId: "tf9", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Pertemuan 5 Bagian 02 — pilihan aditif vs multiplikatif tergantung apakah amplitudo musiman skala dengan tren (multiplikatif) atau konstan (aditif)." },

  { qId: "tf10", type: "tf", points: 1, parametric: true,
    compute: (N) => {
      const lambda_bc = (N + 1) / 100;
      return {
        answer: lambda_bc < 0.2,
        explain: `Box-Cox λ = ${lambda_bc.toFixed(2)}. λ → 0 setara log transform. ${lambda_bc < 0.2 ? "BENAR (mendekati log)" : "SALAH (tidak setara log)"}`,
      };
    } },
];

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN B — PILIHAN GANDA (20 soal × 1 poin = 20 poin)
// ─────────────────────────────────────────────────────────────────────────────
const MC = [
  { qId: "mc1", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Pertemuan 1 Bagian 01 — definisi time series. Urutan terhadap waktu adalah karakteristik fundamental yang membuat analisis i.i.d. tidak applicable." },

  { qId: "mc2", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Pertemuan 1 Bagian 04 — Teorema Nyquist: fs ≥ 2·fmax. Praktik industri pakai oversampling 5-10× untuk margin anti-aliasing filter." },

  { qId: "mc3", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const rpm = (N + 1) * 30;
      const f_rotational_hz = rpm / 60;
      const correct = f_rotational_hz;
      const opts = [
        { v: correct },
        { v: rpm },
        { v: rpm / 30 },
        { v: 2 * Math.PI * f_rotational_hz },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N),
        explain: `f_1× = RPM/60 = ${rpm}/60 = <b>${correct.toFixed(2)} Hz</b>`,
      };
    } },

  { qId: "mc4", type: "mc", points: 1, parametric: false,
    correctIdx: 2,
    explain: "Pertemuan 1 Bagian 03 — CF tinggi mengindikasikan sinyal punya peak yang jauh di atas energi rata-rata, khas pada bearing fault dengan periodic impacts." },

  { qId: "mc5", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Pertemuan 2 Bagian 02 — trailing MA hanya butuh data masa lalu (causal), tapi output tertinggal di belakang sinyal sejati sebesar setengah window." },

  { qId: "mc6", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      let alpha = (N + 1) / 200;
      if (alpha > 0.5) alpha = 0.5;
      if (alpha < 0.01) alpha = 0.01;
      const N_eff = 2 / alpha - 1;
      const correct = N_eff;
      const opts = [
        { v: correct },
        { v: 1 / alpha },
        { v: alpha * 100 },
        { v: 2 * alpha + 1 },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N),
        explain: `N_eff = 2/α − 1 = 2/${alpha.toFixed(4)} − 1 = <b>${N_eff.toFixed(1)} sampel</b>`,
      };
    } },

  { qId: "mc7", type: "mc", points: 1, parametric: false,
    correctIdx: 2,
    explain: "Pertemuan 2 Bagian 04 — Median filter operasinya nonlinear (pilih nilai tengah), sehingga spike tunggal akan diabaikan oleh median." },

  { qId: "mc8", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Pertemuan 2 Bagian 04 — MA/EMA punya frequency response sinc-like dengan attenuation pada pita rendah; smoothing time-domain akan menumpulkan peak FFT." },

  { qId: "mc9", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Pertemuan 3 Bagian 01 — pipeline standar 5 tahap: sensor → conditioning → ADC → edge processing → storage/cloud." },

  { qId: "mc10", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      let bits = 8 + (N % 17);
      if (bits > 24) bits = 24;
      const DR = 6.02 * bits + 1.76;
      const correct = DR;
      const opts = [
        { v: correct },
        { v: 6.02 * bits },
        { v: bits },
        { v: Math.pow(2, bits) },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N),
        explain: `DR = 6.02·${bits} + 1.76 = <b>${DR.toFixed(2)} dB</b>`,
      };
    } },

  { qId: "mc11", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Pertemuan 3 Bagian 04 — banyak line di satu plot menjadi clutter. Heatmap memungkinkan pattern anomalies terlihat sebagai band warna mencolok." },

  { qId: "mc12", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Pertemuan 3 Bagian 03 — MQTT adalah standar de-facto untuk IoT industrial monitoring: lightweight, support QoS 0-2, integrasi mudah dengan TSDB." },

  { qId: "mc13", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Pertemuan 4 Bagian 03 — 3σ menghasilkan ~99.7% coverage hanya untuk distribusi normal. Untuk data skewed/heavy-tailed, gunakan IQR atau MAD." },

  { qId: "mc14", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const missing_count = N + 5;
      const total_data = 1000;
      const missing_pct = (missing_count / total_data) * 100;
      const correct = missing_pct;
      const opts = [
        { v: correct },
        { v: missing_count },
        { v: missing_count / 100 },
        { v: missing_count * 10 },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N),
        explain: `% missing = (${missing_count}/1000) × 100 = <b>${correct.toFixed(2)}%</b>`,
      };
    } },

  { qId: "mc15", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Pertemuan 4 Bagian 04 — gap pendek pada time series biasanya disebabkan jeda akuisisi sesaat. Linear interpolation memanfaatkan struktur temporal data." },

  { qId: "mc16", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Pertemuan 4 Bagian 06 — Z-score: (x − μ)/σ → mean 0, std 1. Min-Max: (x − min)/(max − min) → range [0, 1]. Min-Max lebih sensitif outlier." },

  { qId: "mc17", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Pertemuan 5 Bagian 01 — log transform: kompresi range, menstabilkan varians, dan mengubah relasi multiplikatif menjadi aditif." },

  { qId: "mc18", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const y = Math.exp((N + 1) / 50);
      const log_y = Math.log(y);
      const correct = log_y;
      const opts = [
        { v: correct },
        { v: y },
        { v: 1 / y },
        { v: y * 2 },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N),
        explain: `log(${y.toFixed(4)}) = (N+1)/50 = <b>${log_y.toFixed(4)}</b>`,
      };
    } },

  { qId: "mc19", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Pertemuan 5 Bagian 02 — centered MA dengan window = periode musiman menghapus seasonal & noise → estimasi smooth trend. S = y/T setelahnya." },

  { qId: "mc20", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Pertemuan 5 Bagian 03 — ADF test, H₀: deret memiliki unit root (non-stationary). p-value < 0.05 → tolak H₀ → deret stationary." },
];

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN C — KOMPUTASI EASY/MEDIUM (10 soal × 2 poin = 20 poin)
// Semua parametric. Field name `expected` mengikuti source UTS.html.
// ─────────────────────────────────────────────────────────────────────────────
const COMP_EZ = [
  { qId: "ce1", type: "comp", points: 2, parametric: true, tolerance: 0.05,
    compute: (N) => {
      const rpm = (N + 1) * 30;
      const f_rot = rpm / 60;
      return { expected: f_rot, explain: `f = RPM/60 = ${rpm}/60 = <b>${f_rot.toFixed(2)} Hz</b>` };
    } },

  { qId: "ce2", type: "comp", points: 2, parametric: true, tolerance: 0.01,
    compute: (N) => {
      const A = (N + 1) / 10;
      const rms = A / Math.sqrt(2);
      return { expected: rms, explain: `RMS_sin = A/√2 = ${A.toFixed(2)}/√2 = <b>${rms.toFixed(4)}</b>` };
    } },

  { qId: "ce3", type: "comp", points: 2, parametric: true, tolerance: 0.01,
    compute: (N) => {
      const signal_value = N + 1;
      return { expected: signal_value, explain: `Sinyal konstan x = N+1 = ${signal_value} → MA juga konstan → mean = <b>${signal_value}</b>` };
    } },

  { qId: "ce4", type: "comp", points: 2, parametric: true, tolerance: 0.5,
    compute: (N) => {
      let alpha = (N + 1) / 200;
      if (alpha > 0.5) alpha = 0.5;
      if (alpha < 0.01) alpha = 0.01;
      const N_eff = 2 / alpha - 1;
      return { expected: N_eff, explain: `N_eff = 2/α − 1 = 2/${alpha.toFixed(4)} − 1 = <b>${N_eff.toFixed(1)}</b>` };
    } },

  { qId: "ce5", type: "comp", points: 2, parametric: true, tolerance: 0.5,
    compute: (N) => {
      const fs = (N + 1) * 100;
      const bits = 16;
      const channels = 1;
      const seconds = 3600;
      const storage_MB = fs * bits / 8 * channels * seconds / Math.pow(1024, 2);
      return { expected: storage_MB, explain: `storage = ${fs}·(16/8)·1·3600/1024² = <b>${storage_MB.toFixed(3)} MB</b>` };
    } },

  { qId: "ce6", type: "comp", points: 2, parametric: true, tolerance: 0.1,
    compute: (N) => {
      let bits = 8 + (N % 17);
      if (bits > 24) bits = 24;
      const DR = 6.02 * bits + 1.76;
      return { expected: DR, explain: `DR = 6.02·${bits} + 1.76 = <b>${DR.toFixed(2)} dB</b>` };
    } },

  { qId: "ce7", type: "comp", points: 2, parametric: true, tolerance: 0.05,
    compute: (N) => {
      const missing_count = N + 5;
      const total = 1000;
      const missing_pct = (missing_count / total) * 100;
      return { expected: missing_pct, explain: `% missing = (${missing_count}/1000)·100 = <b>${missing_pct.toFixed(2)}%</b>` };
    } },

  { qId: "ce8", type: "comp", points: 2, parametric: true, tolerance: 0.01,
    compute: (N) => {
      const x = N + 50;
      const mu = 50;
      const sigma = 10;
      const z = (x - mu) / sigma;
      return { expected: z, explain: `z = (x − μ)/σ = (${x} − 50)/10 = <b>${z.toFixed(2)}</b>` };
    } },

  { qId: "ce9", type: "comp", points: 2, parametric: true, tolerance: 0.001,
    compute: (N) => {
      const y = Math.exp((N + 1) / 50);
      const log_y = Math.log(y);
      return { expected: log_y, explain: `log(exp((N+1)/50)) = (N+1)/50 = <b>${log_y.toFixed(4)}</b>` };
    } },

  { qId: "ce10", type: "comp", points: 2, parametric: true, tolerance: 0.01,
    compute: (N) => {
      const y_0 = N + 1;
      const y_1 = (N + 1) + 0.5;
      const first_diff = y_1 - y_0;
      return { expected: first_diff, explain: `Δy₁ = y₁ − y₀ = ${y_1} − ${y_0} = <b>${first_diff}</b> (slope konstan)` };
    } },
];

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN D — KOMPUTASI HARD (5 soal × 4 poin = 20 poin)
// Semua parametric. allowPartial=true → partial credit +1 (server policy).
// ─────────────────────────────────────────────────────────────────────────────
const COMP_HARD = [
  { qId: "ch1", type: "comp", points: 4, parametric: true, tolerance: 0.01,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const A = (N + 1) / 10;
      const rms_theoretical = A / Math.sqrt(2);
      return { expected: rms_theoretical, explain: `Generate x = A·sin(2π·50·t), A = ${A.toFixed(2)}, fs=1000, T=1s → RMS = A/√2 = <b>${rms_theoretical.toFixed(4)}</b>` };
    } },

  { qId: "ch2", type: "comp", points: 4, parametric: true, tolerance: 0.15,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      // Signal baseline=5 + noise σ=0.1, EMA convergence → ~5.0 (independent of α)
      let alpha = (N + 1) / 200;
      if (alpha > 0.5) alpha = 0.5;
      if (alpha < 0.01) alpha = 0.01;
      return { expected: 5.0, explain: `EMA dari scratch dgn α=${alpha.toFixed(4)} pada signal baseline=5 + noise σ=0.1 → konvergen ke <b>~5.0</b>` };
    } },

  { qId: "ch3", type: "comp", points: 4, parametric: true, tolerance: 1.0,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const f_signal = Math.min(200, (N + 1) * 5);
      return { expected: f_signal, explain: `Sinyal sin(2π·${f_signal}·t) @ fs=1000 → FFT peak freq = <b>${f_signal} Hz</b>` };
    } },

  { qId: "ch4", type: "comp", points: 4, parametric: true, tolerance: 1,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const n_outliers = N + 5;
      return { expected: n_outliers, explain: `Inject ${n_outliers} outliers (=5.0) ke base N(0, 0.5) → threshold |x|>3 detect = <b>${n_outliers}</b>` };
    } },

  { qId: "ch5", type: "comp", points: 4, parametric: true, tolerance: 0.5,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      // y_t = 10 + 0.1·t + 2·sin(2π·t/12) + noise(seed=N); centered MA w=12 di t=50 → ~15
      return { expected: 15.0, explain: `y_t = 10 + 0.1·t + 2·sin(2π·t/12) + noise; centered MA window=12 di t=50 → trend ≈ 10 + 0.1·50 = <b>15.0</b>` };
    } },
];

// ─────────────────────────────────────────────────────────────────────────────
// Export gabungan + ringkasan
// ─────────────────────────────────────────────────────────────────────────────
const UTS_QUESTIONS = [...TF, ...MC, ...COMP_EZ, ...COMP_HARD];

const SUMMARY = {
  examId: "optoauto-uts",
  totalSoal: UTS_QUESTIONS.length,                                       // 45
  totalPoin: UTS_QUESTIONS.reduce((s, q) => s + q.points, 0),            // 70
  breakdown: { tf: 10, mc: 20, compEz: 10, compHard: 5 },
  parametricCount: UTS_QUESTIONS.filter((q) => q.parametric).length,
};

module.exports = { UTS_QUESTIONS, SUMMARY, shuffleSeed, mcShuffledIdx };
