/* eslint-disable max-len */
/**
 * UAS Getaran Mekanik — answer-key metadata (45 soal / 70 poin).
 *
 * SUMBER KEBENARAN: cermin rumus dari `Getaran-Mekanik/Exam/UAS.html`
 * (UAS_TF, UAS_MC, UAS_COMP_EZ, UAS_COMP_HARD).
 *
 * Setiap entry hanya berisi data yang dibutuhkan server untuk validasi
 * (type/answer/correctIdx/tolerance/points/allowPartial/partialPoints/explain).
 * TEXT soal & diagram TIDAK disertakan — itu tetap di client HTML.
 *
 * Format entry:
 *   STATIC:
 *     { qId, type, points, parametric:false, answer|correctIdx, tolerance?, explain }
 *   PARAMETRIC:
 *     { qId, type, points, parametric:true, tolerance?, allowPartial?, partialPoints?,
 *       explain (default, fallback), compute: (N) => ({ answer|correctIdx, explain? }) }
 *
 * Saat seeding, parametric question dibangun byN[N] untuk N=0..99
 * (sync dgn `getN()` di UAS.html = 2 digit terakhir NIM).
 *
 * CATATAN UAS vs UTS:
 *   - UAS MC TIDAK shuffle options (lihat UAS.html line 2858 — `correctIdx` dipakai
 *     langsung tanpa shuffleSeed). Helper `mcShuffledIdx` tetap di-export utk
 *     compatibility tapi tidak dipakai di file ini.
 *
 * ⚠ PENTING: kalau definisi soal di UAS.html berubah, file ini WAJIB di-update.
 *    Jangan ubah formula di sini tanpa update UAS.html (atau sebaliknya).
 */

// Sync dengan `shuffleSeed()` di UAS.html line 1667-1676.
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
// (Tidak dipakai untuk UAS — disediakan agar konsisten dgn UTS seed signature.)
function mcShuffledIdx(opts, correctValue, seed) {
  const shuffled = shuffleSeed(opts, seed);
  return shuffled.findIndex((o) => o.v === correctValue);
}

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN A — TRUE / FALSE (10 soal × 1 poin = 10 poin)
// Cakupan: Modul 8 (Multibody), 9 (Modal), 10 (TMD), 11 (FFT),
//          12 (Time-domain stats), 13 (Spectrum diagnosis), 14 (CM/PdM)
// ─────────────────────────────────────────────────────────────────────────────
const TF = [
  { qId: "tf1", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 8 — Lagrange method: ∂/∂t(∂L/∂q̇) − ∂L/∂q = Q. Cocok untuk sistem dengan constraint/koordinat kompleks (Newton butuh FBD per body)." },

  { qId: "tf2", type: "tf", points: 1, parametric: true,
    explain: "Sistem 2-DoF → matriks 2×2 → 2 frekuensi pribadi.",
    compute: (N) => {
      const dof = (N % 4) + 2; // 2..5
      return {
        answer: dof === 2,
        explain: `2-DoF → 2 DoF → 2 frekuensi pribadi. Pernyataan ${dof === 2 ? "BENAR" : "SALAH (seharusnya 2, bukan " + dof + ")"}.`,
      };
    } },

  { qId: "tf3", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 9 — Mode shape ratio menentukan POLA defleksi, amplitudo absolut tergantung initial condition. Mass-norm dipakai standard di software FEA." },

  { qId: "tf4", type: "tf", points: 1, parametric: true,
    explain: "Mode 1 fundamental selalu memiliki frekuensi terendah dengan semua lantai sefase.",
    compute: (N) => {
      const n = (N % 5) + 3;
      return {
        answer: true,
        explain: `Modul 9 — Mode 1 fundamental untuk shear-building ${n} lantai selalu terendah, semua lantai bergerak sefase (dominan untuk earthquake response).`,
      };
    } },

  { qId: "tf5", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 10 — TMD passive: dua peak baru ω_a± menjauh saat μ naik. Den Hartog optimal tuning: ω_a* = ω_target/(1+μ), ζ_a* = √(3μ/(8(1+μ)³))." },

  { qId: "tf6", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 11 — Nyquist-Shannon: fs minimal 2× frekuensi tertinggi. Praktik: fs ≥ 2.5× untuk margin + anti-alias filter sebelum ADC." },

  { qId: "tf7", type: "tf", points: 1, parametric: true,
    explain: "Aliasing terhindar jika fs ≥ 2·f_max.",
    compute: (N) => {
      const fmax = 50 + N * 2;
      const fs_required = 2 * fmax;
      const fs_actual = 100 + N;
      const ok = fs_actual >= fs_required;
      return {
        answer: ok,
        explain: `fs_required = 2·${fmax} = ${fs_required} Hz. fs_actual = ${fs_actual} ${ok ? "≥" : "<"} ${fs_required} → aliasing ${ok ? "TERHINDAR" : "TERJADI"}.`,
      };
    } },

  { qId: "tf8", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 12 — CF reveal impulsive content. Sinusoidal pure: CF = √2 ≈ 1.414. CF > 5 = early bearing fault signature." },

  { qId: "tf9", type: "tf", points: 1, parametric: true,
    explain: "BPFO = (Nb/2)·fr·(1−d/D·cos α). Cek apakah ≈ 100 Hz.",
    compute: (N) => {
      const rpm = 1500 + N * 30;
      const fr = rpm / 60;
      const bpfo = (8 / 2) * fr * (1 - 0.41 * 1);
      const target = 100;
      const ok = Math.abs(bpfo - target) < 20;
      return {
        answer: ok,
        explain: `fr = ${rpm}/60 = ${fr.toFixed(2)} Hz. BPFO = (8/2)·fr·(1−0.41) = <b>${bpfo.toFixed(2)} Hz</b>. ${ok ? "Mendekati 100 Hz (BENAR)" : "Jauh dari 100 Hz (SALAH)"}.`,
      };
    } },

  { qId: "tf10", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 14 — RoI predictive maintenance: deteksi dini bearing defect → ganti sebelum chip metal masuk gear → save 5-10× downtime cost." },
];

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN B — PILIHAN GANDA (20 soal × 1 poin = 20 poin)
// CATATAN: UAS MC tidak shuffle options — `correctIdx` di sini = `correct` field
// di UAS.html, langsung tanpa shuffleSeed.
// ─────────────────────────────────────────────────────────────────────────────
const MC = [
  { qId: "mc1", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Lagrange method: derive dari energi kinetik T dan potensial V, gunakan koordinat generalized q. Tidak butuh FBD eksplisit." },

  { qId: "mc2", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Sistem 2-DoF → matriks 2×2 → karakteristik polynomial orde 4 di ω², menghasilkan 2 akar ω² → 2 frekuensi natural ω₁ < ω₂." },

  { qId: "mc3", type: "mc", points: 1, parametric: true,
    explain: "ω₁ = √(k/m) untuk mode in-phase symmetric 2-DoF.",
    compute: (N) => {
      const m1 = 2 + (N % 5);
      const k = 100;
      const w1 = Math.sqrt(k / m1);
      const correctIdx = w1 < 5 ? 0 : (w1 < 7 ? 1 : (w1 < 10 ? 2 : 3));
      return {
        correctIdx,
        explain: `ω₁ = √(${k}/${m1}) = ${w1.toFixed(2)} rad/s → ${["<5", "5-7", "7-10", "≥10"][correctIdx]}`,
      };
    } },

  { qId: "mc4", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Modal Analysis: eigenvalue ω² + eigenvector φ. Untuk gedung 5 lantai → 5 mode (5 ω + 5 φ)." },

  { qId: "mc5", type: "mc", points: 1, parametric: false,
    correctIdx: 0,
    explain: "Modal orthogonality: φᵢᵀMφⱼ = 0 dan φᵢᵀKφⱼ = 0 untuk i≠j. Ini yang memungkinkan modal decoupling (transformasi {x}={Φ}{η})." },

  { qId: "mc6", type: "mc", points: 1, parametric: true,
    explain: "N-DoF system → N mode shapes.",
    compute: (N) => {
      const stories = 3 + (N % 4);
      return {
        correctIdx: 1,
        explain: `N-DoF → N mode shapes. Gedung ${stories} lantai = ${stories}-DoF → ${stories} mode pribadi.`,
      };
    } },

  { qId: "mc7", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Den Hartog (1956) optimal tuning untuk damped main: ω_a* = ω_target/(1+μ) dengan ζ_a* = √(3μ/(8(1+μ)³))." },

  { qId: "mc8", type: "mc", points: 1, parametric: true,
    explain: "Bandwidth isolasi proporsional dengan mass ratio μ.",
    compute: (N) => {
      const mu = 0.05 + (N % 10) * 0.02;
      const correctIdx = mu < 0.10 ? 0 : (mu < 0.20 ? 1 : 2);
      return {
        correctIdx,
        explain: `μ = ${mu.toFixed(2)} → bandwidth ${["sempit", "sedang", "lebar"][correctIdx]}. Trade-off: μ kecil = sensitive ke detuning, μ besar = robust tapi mass penalty.`,
      };
    } },

  { qId: "mc9", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Taipei 101 TMD = sphere 5.5m, 660 ton, suspended dengan 4 sets kabel = pendulum TMD. Frekuensi ~0.15 Hz untuk wind/earthquake." },

  { qId: "mc10", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "FFT Cooley-Tukey 1965: O(N log N) — game-changer dari DFT naive O(N²). Kunci modern signal processing." },

  { qId: "mc11", type: "mc", points: 1, parametric: true,
    explain: "Nyquist sample rate minimum = 2·f_max.",
    compute: (N) => {
      const fmax = 200 + N * 5;
      const fs_min = 2 * fmax;
      const correctIdx = fs_min <= 500 ? 0 : (fs_min <= 1000 ? 1 : (fs_min <= 1500 ? 2 : 3));
      return {
        correctIdx,
        explain: `Nyquist: fs ≥ 2·f_max = 2·${fmax} = <b>${fs_min} Hz</b> → ${["≤500", "500-1000", "1000-1500", ">1500"][correctIdx]}`,
      };
    } },

  { qId: "mc12", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Hanning: bandwidth main-lobe ~1.5× lebih lebar dari rectangular → resolusi frekuensi turun, tapi side-lobe jauh lebih rendah." },

  { qId: "mc13", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "RMS = √(mean(x²)) ≈ amplitudo equivalent untuk power perhitungan. ISO 10816 standard untuk machinery condition." },

  { qId: "mc14", type: "mc", points: 1, parametric: true,
    explain: "ISO 10816-3 Class II zone classification berdasarkan v_rms.",
    compute: (N) => {
      const rms = 1.5 + N * 0.1;
      const zone = rms < 2.8 ? 0 : (rms < 4.5 ? 1 : (rms < 11.2 ? 2 : 3));
      return {
        correctIdx: zone,
        explain: `ISO 10816 Class II: A < 2.8, B < 4.5, C < 11.2, D ≥ 11.2 mm/s. v_rms = ${rms.toFixed(1)} → Zone <b>${["A", "B", "C", "D"][zone]}</b>.`,
      };
    } },

  { qId: "mc15", type: "mc", points: 1, parametric: false,
    correctIdx: 2,
    explain: "Gaussian noise: kurt ≈ 3. Sinusoidal: kurt = 1.5. Bearing impulsive: kurt > 3.5 — gold standard early bearing fault detection." },

  { qId: "mc16", type: "mc", points: 1, parametric: false,
    correctIdx: 0,
    explain: "Order tracking: spectrum dalam x·RPM (orders). Untuk mesin run-up/coast-down, fault frequencies tetap konstan dalam orders." },

  { qId: "mc17", type: "mc", points: 1, parametric: false,
    correctIdx: 2,
    explain: "Bearing fault hidden di carrier frekuensi tinggi (3-10 kHz). Envelope: bandpass + squaring + low-pass → reveal sidebands BPFO/BPFI/BSF." },

  { qId: "mc18", type: "mc", points: 1, parametric: true,
    explain: "BPFI = (Nb/2)·fr·(1+d/D·cos α).",
    compute: (N) => {
      const rpm = 1200 + N * 30;
      const fr = rpm / 60;
      const bpfi = (8 / 2) * fr * (1 + 0.41);
      const correctIdx = bpfi < 100 ? 0 : (bpfi < 200 ? 1 : (bpfi < 400 ? 2 : 3));
      return {
        correctIdx,
        explain: `fr = ${fr.toFixed(2)} Hz. BPFI = (8/2)·fr·(1+0.41) = ${bpfi.toFixed(2)} Hz → ${["<100", "100-200", "200-400", "≥400"][correctIdx]}`,
      };
    } },

  { qId: "mc19", type: "mc", points: 1, parametric: false,
    correctIdx: 2,
    explain: "Mounting frequency response: stud-mount > glue/wax > magnet > probe. Stud usable up to >10 kHz, magnet limited ~2 kHz." },

  { qId: "mc20", type: "mc", points: 1, parametric: true,
    explain: "RUL = (threshold − current) / rate.",
    compute: (N) => {
      const rate = 0.5 + N * 0.05;
      const threshold = 11.2;
      const current = 4.5 + N * 0.1;
      const remaining = (threshold - current) / rate;
      const correctIdx = remaining < 0 ? 3 : (remaining < 6 ? 2 : (remaining < 12 ? 1 : 0));
      const remainStr = remaining < 0 ? "sudah lewat" : remaining.toFixed(1) + " bulan";
      return {
        correctIdx,
        explain: `RUL = (11.2 − ${current.toFixed(1)}) / ${rate.toFixed(2)} = <b>${remainStr}</b> → ${["> 12", "6-12", "0-6", "urgent"][correctIdx]}`,
      };
    } },
];

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN C — KOMPUTASI EASY/MEDIUM (10 soal × 2 poin = 20 poin)
// Semua parametric.
// ─────────────────────────────────────────────────────────────────────────────
const COMP_EZ = [
  { qId: "c1", type: "comp", points: 2, parametric: true, tolerance: 0.05,
    compute: (N) => {
      const m1 = 2, m2 = 1;
      const k1 = 100, k2 = 50, k3 = 100;
      const a = m1 * m2;
      const b = -((k1 + k2) * m2 + (k2 + k3) * m1);
      const c = (k1 + k2) * (k2 + k3) - k2 * k2;
      const D = b * b - 4 * a * c;
      const w1sq = (-b - Math.sqrt(D)) / (2 * a);
      const w1 = Math.sqrt(w1sq);
      const expected = parseFloat(w1.toFixed(2));
      return {
        expected,
        explain: `[M] = diag(2,1), [K] = [[150,-50],[-50,150]]. ω₁² = ${w1sq.toFixed(2)} → ω₁ = <b>${w1.toFixed(2)} rad/s</b>`,
      };
    } },

  { qId: "c2", type: "comp", points: 2, parametric: true, tolerance: 0.05,
    compute: (N) => {
      const m = 5 + (N % 6);
      const k = 200;
      const wn = Math.sqrt(k / m);
      const expected = parseFloat(wn.toFixed(2));
      return {
        expected,
        explain: `ω_n = √(k/m) = √(200/${m}) = <b>${wn.toFixed(2)} rad/s</b>`,
      };
    } },

  { qId: "c3", type: "comp", points: 2, parametric: true, tolerance: 0.01,
    compute: (N) => {
      const stories = (N % 4) + 3;
      const m = 1, k = 100;
      const w1 = 2 * Math.sin(Math.PI / (2 * (2 * stories + 1))) * Math.sqrt(k / m);
      const expected = parseFloat(w1.toFixed(3));
      return {
        expected,
        explain: `n=${stories}, ω₁ = 2·sin(π/(${2 * stories + 1}·2))·√(100/1) = <b>${w1.toFixed(3)} rad/s</b>`,
      };
    } },

  { qId: "c4", type: "comp", points: 2, parametric: true, tolerance: 0.01,
    compute: (N) => {
      const mu = 0.05 + (N % 10) * 0.01;
      const omega_target = 50;
      const omega_a_opt = omega_target / (1 + mu);
      const expected = parseFloat(omega_a_opt.toFixed(3));
      return {
        expected,
        explain: `Den Hartog: ω_a* = ω_target/(1+μ) = 50/(1+${mu.toFixed(2)}) = <b>${omega_a_opt.toFixed(3)} rad/s</b>`,
      };
    } },

  { qId: "c5", type: "comp", points: 2, parametric: true, tolerance: 0.001,
    compute: (N) => {
      const mu = 0.05 + (N % 10) * 0.01;
      const zeta_a_opt = Math.sqrt(3 * mu / (8 * Math.pow(1 + mu, 3)));
      const expected = parseFloat(zeta_a_opt.toFixed(4));
      return {
        expected,
        explain: `ζ_a* = √(3·${mu.toFixed(2)}/(8·(1+${mu.toFixed(2)})³)) = <b>${zeta_a_opt.toFixed(4)}</b>`,
      };
    } },

  { qId: "c6", type: "comp", points: 2, parametric: true, tolerance: 1,
    compute: (N) => {
      const fmax = 200 + N * 3;
      const fs = 2 * fmax;
      return {
        expected: fs,
        explain: `Nyquist: fs ≥ 2·f_max = 2·${fmax} = <b>${fs} Hz</b>`,
      };
    } },

  { qId: "c7", type: "comp", points: 2, parametric: true, tolerance: 0.01,
    compute: (N) => {
      const fs = 1000 + N * 10;
      const T_window = 1.0;
      const N_samples = Math.round(fs * T_window);
      const df = fs / N_samples;
      const expected = parseFloat(df.toFixed(4));
      return {
        expected,
        explain: `Δf = fs/N = ${fs}/${N_samples} = <b>${df.toFixed(4)} Hz</b>`,
      };
    } },

  { qId: "c8", type: "comp", points: 2, parametric: true, tolerance: 0.01,
    compute: (N) => {
      const A = 1 + N * 0.05;
      const rms = A / Math.sqrt(2);
      const expected = parseFloat(rms.toFixed(3));
      return {
        expected,
        explain: `Untuk sinusoidal: RMS = A/√2 = ${A.toFixed(2)}/1.414 = <b>${rms.toFixed(3)} mm/s</b>`,
      };
    } },

  { qId: "c9", type: "comp", points: 2, parametric: true, tolerance: 0.05,
    compute: (N) => {
      const peak = 8 + N * 0.1;
      const rms = 2 + N * 0.03;
      const cf = peak / rms;
      const expected = parseFloat(cf.toFixed(3));
      return {
        expected,
        explain: `CF = ${peak.toFixed(1)}/${rms.toFixed(2)} = <b>${cf.toFixed(3)}</b>`,
      };
    } },

  { qId: "c10", type: "comp", points: 2, parametric: true, tolerance: 0.1,
    compute: (N) => {
      const rpm = 1200 + N * 30;
      const fr = rpm / 60;
      const dD = 7.94 / 33.5;
      const bpfo = (8 / 2) * fr * (1 - dD);
      const expected = parseFloat(bpfo.toFixed(3));
      return {
        expected,
        explain: `fr = ${rpm}/60 = ${fr.toFixed(3)} Hz. BPFO = 4·${fr.toFixed(3)}·(1−${dD.toFixed(3)}) = <b>${bpfo.toFixed(3)} Hz</b>`,
      };
    } },
];

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN D — KOMPUTASI HARD (5 soal × 4 poin = 20 poin)
// Semua parametric. allowPartial=true → partial credit +1 jika kode dijalankan
// (non-late) tapi output salah/error.
// ─────────────────────────────────────────────────────────────────────────────
const COMP_HARD = [
  { qId: "c11", type: "comp", points: 4, parametric: true, tolerance: 0.05,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const m1 = 1, m2 = 1 + (N % 5);
      const k1 = 100, k2 = 50, k3 = 100;
      const a = m1 * m2;
      const b = -((k1 + k2) * m2 + (k2 + k3) * m1);
      const c = (k1 + k2) * (k2 + k3) - k2 * k2;
      const D = b * b - 4 * a * c;
      const w1sq = (-b - Math.sqrt(D)) / (2 * a);
      const w2sq = (-b + Math.sqrt(D)) / (2 * a);
      const w2 = Math.sqrt(w2sq);
      const expected = parseFloat(w2.toFixed(3));
      return {
        expected,
        explain: `[M]=diag(1,${m2}), [K]=[[150,-50],[-50,150]]. ω² = ${w1sq.toFixed(2)} or ${w2sq.toFixed(2)} → ω₂ = <b>${w2.toFixed(3)} rad/s</b>`,
      };
    } },

  { qId: "c12", type: "comp", points: 4, parametric: true, tolerance: 5,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const A = 2 + (N % 8);
      const f = 50 + (N % 10) * 5;
      const fs = 1000;
      const T = 1.0;
      const N_samples = fs * T;
      const peak_mag = A * N_samples / 2;
      return {
        expected: peak_mag,
        explain: `Peak FFT one-sided untuk sinusoidal: |X[k]| = A·N/2 = ${A}·1000/2 = <b>${peak_mag}</b> (di bin k = f·T = ${f})`,
      };
    } },

  { qId: "c13", type: "comp", points: 4, parametric: true, tolerance: 0.05,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const A1 = 1 + N * 0.1;
      const A2 = 0.5 + N * 0.05;
      const rms = Math.sqrt((A1 * A1 + A2 * A2) / 2);
      const expected = parseFloat(rms.toFixed(3));
      return {
        expected,
        explain: `RMS = √((A₁²+A₂²)/2) = √((${A1.toFixed(1)}² + ${A2.toFixed(2)}²)/2) = <b>${rms.toFixed(3)} mm/s</b>`,
      };
    } },

  { qId: "c14", type: "comp", points: 4, parametric: true, tolerance: 0.1,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const rpm = 1500 + N * 25;
      const fr = rpm / 60;
      const Nb = 8;
      const dD = 12.7 / 51;
      const bpfi = (Nb / 2) * fr * (1 + dD);
      const sideband_diff = fr;
      const expected = parseFloat((2 * sideband_diff).toFixed(3));
      return {
        expected,
        explain: `fr = ${fr.toFixed(3)} Hz. BPFI = 4·${fr.toFixed(3)}·(1+${dD.toFixed(3)}) = ${bpfi.toFixed(3)} Hz. Sidebands BPFI ± fr → jarak = <b>2·fr = ${(2 * fr).toFixed(3)} Hz</b>`,
      };
    } },

  { qId: "c15", type: "comp", points: 4, parametric: true, tolerance: 0.05,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const current = 4.5 + (N % 7) * 0.5;
      const rate = 0.3 + (N % 8) * 0.1;
      const threshold = 11.2;
      const rul = (threshold - current) / rate;
      const expected = parseFloat(rul.toFixed(2));
      return {
        expected,
        explain: `RUL = (threshold − current) / rate = (11.2 − ${current.toFixed(1)}) / ${rate.toFixed(1)} = <b>${rul.toFixed(2)} bulan</b>`,
      };
    } },
];

// ─────────────────────────────────────────────────────────────────────────────
// Export gabungan + ringkasan
// ─────────────────────────────────────────────────────────────────────────────
const UAS_QUESTIONS = [...TF, ...MC, ...COMP_EZ, ...COMP_HARD];

const SUMMARY = {
  examId: "getaran-mekanik-uas",
  totalSoal: UAS_QUESTIONS.length,                                          // 45
  totalPoin: UAS_QUESTIONS.reduce((s, q) => s + q.points, 0),               // 70
  breakdown: { tf: TF.length, mc: MC.length, compEz: COMP_EZ.length, compHard: COMP_HARD.length },
  parametricCount: UAS_QUESTIONS.filter((q) => q.parametric).length,
};

module.exports = { UAS_QUESTIONS, SUMMARY, shuffleSeed, mcShuffledIdx };
