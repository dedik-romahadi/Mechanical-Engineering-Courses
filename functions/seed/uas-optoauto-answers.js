/* eslint-disable max-len */
/**
 * Optoauto UAS — answer-key metadata (45 soal / 70 poin).
 *
 * SUMBER KEBENARAN: cermin rumus dari `Optimalisasi-dan-Automasi/Exam/UAS.html`
 * (UAS_TF, UAS_MC, UAS_COMP_EZ, UAS_COMP_HARD).
 *
 * Setiap entry hanya berisi data yang dibutuhkan server untuk validasi
 * (type/answer/correctIdx/tolerance/points/allowPartial/partialPoints/explain).
 * TEXT soal, hint, dan diagram TIDAK disertakan — itu tetap di client HTML.
 *
 * Format entry: lihat uts-optoauto-answers.js (struktur identik).
 *
 * Catatan source diff vs UTS Optoauto:
 *   - Source UAS MC TIDAK shuffle options (lihat UAS.html line 7841-7845:
 *     "SHUFFLE MC OPTIONS — DISABLED untuk UAS", shuffleMCOptions is no-op).
 *     Maka tidak perlu helper `shuffleSeed`/`mcShuffledIdx`; nilai `correct:`
 *     dari source langsung jadi `correctIdx:` di seed.
 *   - Source MC pakai field name `correct:` (bukan `correctIdx:`); di seed
 *     ini di-normalize jadi `correctIdx:` mengikuti konvensi UTS Optoauto.
 *   - Source Comp pakai field `expected:` (bukan `answer:`). Dipertahankan
 *     persis di seed agar match source (server fallback support both).
 *   - Comp HARD tidak punya `allowPartial` di source (cuma komentar header
 *     "Partial credit +1 poin jika kode di-submit"). Tetap kami enable
 *     allowPartial=true + partialPoints=1 sesuai konvensi UTS (server-side
 *     partial credit policy).
 *   - Source MC ID memakai prefix `mc1..mc20`, Comp pakai `c1..c10` (EZ) dan
 *     `c11..c15` (HARD). Dipertahankan persis.
 *
 * ⚠ PENTING: kalau definisi soal di UAS.html berubah, file ini WAJIB di-update.
 */

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN A — TRUE / FALSE (10 soal × 1 poin = 10 poin)
// ─────────────────────────────────────────────────────────────────────────────
const TF = [
  { qId: "tf1", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 8 — scipy.linprog hanya minimize. Trick maksimasi: negasikan c, hasil Z_max = -result.fun, x* tetap valid." },

  { qId: "tf2", type: "tf", points: 1, parametric: true,
    compute: (N) => {
      const c1 = 3 + (N % 5);
      const c2 = 5;
      const Z = Math.max(c1 * 10, c2 * 10);
      return {
        answer: true,
        explain: `Vertex search: (10,0) → ${c1 * 10}, (0,10) → ${c2 * 10}, (0,0) → 0. Max = ${Z}.`,
      };
    } },

  { qId: "tf3", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 9 — α optimal: 1/L. α > 2/L = divergence. Adaptive: line search, Adam, RMSprop." },

  { qId: "tf4", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 9 — BFGS update Hessian dari 2 gradient. scipy.minimize default. L-BFGS untuk dimensi tinggi (low memory)." },

  { qId: "tf5", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 10 — Cost vs resolution trade-off. Plackett-Burman untuk screening 7-15 faktor (resolution III)." },

  { qId: "tf6", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 11 — Mounting frequency response: stud > glue > magnet > probe. Stud usable >10 kHz." },

  { qId: "tf7", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 12 — Hysteresis: alarm aktif di X+δ, deaktif di X-δ. Mencegah false alarms dari noise." },

  { qId: "tf8", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 7 — Prinsip utama pre-FFT: (1) buang DC offset, (2) window function (Hann/Hamming/Blackman) menekan spectral leakage. Tanpa ini, magnitude spectrum bisa bias/menyesatkan." },

  { qId: "tf9", type: "tf", points: 1, parametric: true,
    compute: (N) => {
      const z = -2 + (N % 10) * 0.5;
      const sig = 1 / (1 + Math.exp(-z));
      return {
        answer: sig > 0.5,
        explain: `σ(${z.toFixed(1)}) = ${sig.toFixed(4)} ${sig > 0.5 ? "> 0.5 → POSITIF" : "≤ 0.5 → NEGATIF"}`,
      };
    } },

  { qId: "tf10", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 14 — RF menggabungkan banyak decision trees dengan diversity. Tuning: GridSearch atau Bayesian optimization." },
];

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN B — PILIHAN GANDA (20 soal × 1 poin = 20 poin)
// MC source tidak shuffle (lihat UAS.html line 7841-7845). Nilai `correct:`
// dari source langsung dipakai sebagai `correctIdx:` di sini.
// ─────────────────────────────────────────────────────────────────────────────
const MC = [
  { qId: "mc1", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Untuk Ax ≥ b → -Ax ≤ -b. Library scipy butuh form ≤. Equivalent transformation." },

  { qId: "mc2", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Vertex (0,10): 6·10=60 ≤ 60 ✓, profit = 8·10 = 80. Vertex (6,0): 10·6=60, profit 30. Vertex (10,0): 10·10=100 > 60 (infeasible)." },

  { qId: "mc3", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const c1 = 4 + (N % 5);
      const c2 = 3 + (N % 4);
      return {
        correctIdx: 2,
        explain: `Vertex (5,8): Z = ${c1}·5 + ${c2}·8 = ${c1 * 5} + ${c2 * 8} = <b>${c1 * 5 + c2 * 8}</b>`,
      };
    } },

  { qId: "mc4", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "α kecil → step kecil → butuh banyak iterations. α optimal balance: cukup besar untuk progress, cukup kecil untuk stability." },

  { qId: "mc5", type: "mc", points: 1, parametric: false,
    correctIdx: 2,
    explain: "GA: population-based stochastic, eksplorasi space global. Newton/Gradient lokal, gampang stuck." },

  { qId: "mc6", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const x0 = 1 + (N % 5);
      const alpha = 0.1;
      const x1 = x0 * (1 - 2 * alpha);
      return {
        correctIdx: 1,
        explain: `∇f = 2x. x₁ = x₀ - α·2x₀ = ${x0} - 0.1·2·${x0} = <b>${x1.toFixed(2)}</b>`,
      };
    } },

  { qId: "mc7", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "F > F_crit → reject H₀. p-value < 0.05 → signifikan. Salah satu group berbeda dari yang lain." },

  { qId: "mc8", type: "mc", points: 1, parametric: false,
    correctIdx: 2,
    explain: "Plackett-Burman optimal untuk screening main effects 7-19 faktor dalam 12, 20, 24 runs. Resolution III, no interactions." },

  { qId: "mc9", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const k = 3 + (N % 4);
      const fullRuns = Math.pow(2, k);
      return {
        correctIdx: 2,
        explain: `Full factorial 2-level: 2^k = 2^${k} = <b>${fullRuns} runs</b>`,
      };
    } },

  { qId: "mc10", type: "mc", points: 1, parametric: false,
    correctIdx: 2,
    explain: "Proximity probe: gap shaft-housing 0.5-2.5 mm. Untuk sleeve/journal bearings (turbin besar). 0-1 kHz freq range." },

  { qId: "mc11", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const sens = 100;
      const accel = 0.5 + N * 0.05;
      const voltage = sens * accel;
      const correctIdx = voltage < 100 ? 0 : (voltage < 300 ? 1 : (voltage < 500 ? 2 : 3));
      return {
        correctIdx,
        explain: `V = 100·${accel.toFixed(2)} = <b>${voltage.toFixed(1)} mV</b>`,
      };
    } },

  { qId: "mc12", type: "mc", points: 1, parametric: false,
    correctIdx: 0,
    explain: "Online continuous: stud-mount best — permanent, high frequency response, no degradation. Magnet/probe untuk routine check." },

  { qId: "mc13", type: "mc", points: 1, parametric: false,
    correctIdx: 2,
    explain: "ISO 10816 + ISA 18.2: 4-zone (A/B/C/D atau Normal/Alert/Alarm/Shutdown). Hysteresis untuk avoid chatter." },

  { qId: "mc14", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const rms = 1.0 + N * 0.1;
      const zone = rms < 2.8 ? 0 : (rms < 4.5 ? 1 : (rms < 11.2 ? 2 : 3));
      const action = ["Continue", "Monitor weekly", "Schedule maintenance", "STOP IMMEDIATELY"][zone];
      return {
        correctIdx: zone,
        explain: `${rms.toFixed(1)} mm/s → Zone <b>${["A", "B", "C", "D"][zone]}</b> → ${action}`,
      };
    } },

  { qId: "mc15", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "FSM: states (Normal/Alert/Alarm/Shutdown) + transitions trigger by threshold + guards (hysteresis) + actions (notify, stop)." },

  { qId: "mc16", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Modul 7 — Δf=fs/N, perbesar N menurunkan Δf (resolusi lebih tajam), syarat sinyal tetap stasioner. Naikkan fs tanpa ubah N justru memperbesar Δf (resolusi memburuk). Zero-padding cuma interpolasi spektral, bukan resolusi sejati tambahan." },

  { qId: "mc17", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const fr = 20 + (N % 10) * 0.8;
      const dOverD = 7.94 / 39;
      const BPFO = 4.5 * (1 - dOverD) * fr;
      return {
        correctIdx: 0,
        explain: `BPFO = (n/2)·fr·(1-(d/D)cosα) = 4.5·${fr.toFixed(1)}·${(1 - dOverD).toFixed(4)} = <b>${BPFO.toFixed(1)} Hz</b>`,
      };
    } },

  { qId: "mc18", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Modul 7 — Bearing fault impact termodulasi pada resonansi struktural (5-20kHz). Envelope (Hilbert transform) mendemodulasi carrier ini, FFT envelope menampilkan peak BPFO/BPFI/BSF jauh lebih bersih drpd FFT raw signal. Teknik standar industri (SKF Multilog, Bently Nevada)." },

  { qId: "mc19", type: "mc", points: 1, parametric: false,
    correctIdx: 2,
    explain: "Bayesian Optimization (Gaussian Process surrogate): smartest for expensive functions. Grid mahal, Random baik kalau dimensi rendah." },

  { qId: "mc20", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const k = 5;
      const n_total = 100 + N * 5;
      const fold_size = Math.floor(n_total / k);
      const train_size = n_total - fold_size;
      const correctIdx = train_size < 200 ? 0 : (train_size < 400 ? 1 : (train_size < 500 ? 2 : 3));
      return {
        correctIdx,
        explain: `Train size = N - N/k = ${n_total} - ${fold_size} = <b>${train_size}</b>`,
      };
    } },
];

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN C — KOMPUTASI EASY/MEDIUM (10 soal × 2 poin = 20 poin)
// Semua parametric. Field name `expected` mengikuti source UAS.html.
// ─────────────────────────────────────────────────────────────────────────────
const COMP_EZ = [
  { qId: "c1", type: "comp", points: 2, parametric: true, tolerance: 0.5,
    compute: (N) => {
      const c1 = 3 + (N % 5);
      const c2 = 5;
      const v1 = c1 * 8 + c2 * 2;
      const v2 = c1 * 4 + c2 * 6;
      const v3 = c2 * 6;
      const v4 = c1 * 8;
      const Zopt = Math.max(v1, v2, v3, v4);
      return {
        expected: Zopt,
        explain: `Vertices: (8,2)→${v1}, (4,6)→${v2}, (0,6)→${v3}, (8,0)→${v4}. Z* = <b>${Zopt}</b>`,
      };
    } },

  { qId: "c2", type: "comp", points: 2, parametric: true, tolerance: 0.5,
    compute: (N) => {
      const cost = [[2 + (N % 4), 3], [4, 1 + (N % 3)]];
      const total = 10 * cost[0][0] + 2 * cost[1][0] + 13 * cost[1][1];
      return {
        expected: total,
        explain: `NW: x₁₁=10, x₂₁=2, x₂₂=13. Total = 10·${cost[0][0]} + 2·4 + 13·${cost[1][1]} = <b>${total}</b>`,
      };
    } },

  { qId: "c3", type: "comp", points: 2, parametric: true, tolerance: 0.01,
    compute: (N) => {
      const target = 5;
      const x0 = 1 + (N % 8);
      const alpha = 0.2;
      const grad = 2 * (x0 - target);
      const x1 = x0 - alpha * grad;
      return {
        expected: parseFloat(x1.toFixed(3)),
        explain: `∇f = 2(x-5). x₁ = ${x0} - 0.2·2·(${x0}-5) = ${x0} - 0.4·${x0 - 5} = <b>${x1.toFixed(3)}</b>`,
      };
    } },

  { qId: "c4", type: "comp", points: 2, parametric: true, tolerance: 0.05,
    compute: (N) => {
      const m1 = 10 + (N % 5);
      const m2 = 12 + (N % 5);
      const m3 = 14 + (N % 5);
      const grandMean = (m1 + m2 + m3) / 3;
      const ssb = 4 * ((m1 - grandMean) ** 2 + (m2 - grandMean) ** 2 + (m3 - grandMean) ** 2);
      return {
        expected: parseFloat(ssb.toFixed(2)),
        explain: `Grand mean = (${m1}+${m2}+${m3})/3 = ${grandMean.toFixed(2)}. SS_b = 4·[(${m1}-${grandMean.toFixed(2)})² + (${m2}-${grandMean.toFixed(2)})² + (${m3}-${grandMean.toFixed(2)})²] = <b>${ssb.toFixed(2)}</b>`,
      };
    } },

  { qId: "c5", type: "comp", points: 2, parametric: true, tolerance: 0,
    compute: (N) => {
      const k = 3 + (N % 4);
      const runs = Math.pow(2, k);
      return {
        expected: runs,
        explain: `Full factorial: 2^k = 2^${k} = <b>${runs} runs</b>`,
      };
    } },

  { qId: "c6", type: "comp", points: 2, parametric: true, tolerance: 0.1,
    compute: (N) => {
      const sens = 100;
      const a_g = 0.5 + N * 0.05;
      const v_mV = sens * a_g;
      return {
        expected: parseFloat(v_mV.toFixed(2)),
        explain: `V = sens × a = 100 × ${a_g.toFixed(2)} = <b>${v_mV.toFixed(2)} mV</b>`,
      };
    } },

  { qId: "c7", type: "comp", points: 2, parametric: true, tolerance: 0.01,
    compute: (N) => {
      const bits = 16;
      const range_V = 20;
      const step_V = range_V / Math.pow(2, bits);
      const sens = 0.1;
      const step_g = step_V / sens;
      return {
        expected: parseFloat((step_g * 1000).toFixed(4)),
        explain: `LSB_V = 20/65536 = ${step_V.toExponential(3)}. LSB_g = LSB_V / 0.1 = ${step_g.toExponential(3)} g = <b>${(step_g * 1000).toFixed(4)} mg</b>`,
      };
    } },

  { qId: "c8", type: "comp", points: 2, parametric: true, tolerance: 0.01,
    compute: (N) => {
      const threshold = 4.5;
      const hysteresis_pct = 5 + (N % 8);
      const hysteresis = threshold * hysteresis_pct / 100;
      const trigger_off = threshold - hysteresis;
      return {
        expected: parseFloat(trigger_off.toFixed(3)),
        explain: `Trigger OFF = trigger ON - hysteresis = 4.5 - ${hysteresis.toFixed(3)} = <b>${trigger_off.toFixed(3)} mm/s</b>`,
      };
    } },

  { qId: "c9", type: "comp", points: 2, parametric: true, tolerance: 0.01,
    compute: (N) => {
      const fftN = 4096 + 1024 * (N % 5);
      const fs = 25600;
      const df = fs / fftN;
      return {
        expected: parseFloat(df.toFixed(3)),
        explain: `Δf = fs/N = 25600/${fftN} = <b>${df.toFixed(3)} Hz</b>`,
      };
    } },

  { qId: "c10", type: "comp", points: 2, parametric: true, tolerance: 1,
    compute: (N) => {
      const n = 200 + N * 5;
      const k = 5;
      const fold = Math.floor(n / k);
      const train = n - fold;
      return {
        expected: train,
        explain: `Validation per fold = floor(${n}/5) = ${fold}. Training = ${n} - ${fold} = <b>${train}</b>`,
      };
    } },
];

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN D — KOMPUTASI HARD (5 soal × 4 poin = 20 poin)
// Semua parametric. allowPartial=true → partial credit +1 (server policy).
// ─────────────────────────────────────────────────────────────────────────────
const COMP_HARD = [
  { qId: "c11", type: "comp", points: 4, parametric: true, tolerance: 0.5,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const c1 = 5 + (N % 4);
      const c2 = 7 + (N % 3);
      const v1 = 8 * c2;
      const v2 = 8 * c1;
      const v3 = 6 * c1 + 4 * c2;
      const Zopt = Math.max(v1, v2, v3);
      return {
        expected: Zopt,
        explain: `Vertices: (0,8)→${v1}, (8,0)→${v2}, (6,4)→${v3}. Z* = <b>${Zopt}</b>`,
      };
    } },

  { qId: "c12", type: "comp", points: 4, parametric: true, tolerance: 0.005,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const target = 10;
      const x0 = 1 + (N % 6);
      const alpha = 0.15;
      let x = x0;
      for (let i = 0; i < 5; i++) {
        x = x - alpha * 2 * (x - target);
      }
      return {
        expected: parseFloat(x.toFixed(4)),
        explain: `Iteration: x_new = x - 0.3·(x-10) = 0.7x + 3. After 5 iter: x = <b>${x.toFixed(4)}</b> (converging to 10).`,
      };
    } },

  { qId: "c13", type: "comp", points: 4, parametric: true, tolerance: 0.05,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const m1 = 8 + (N % 5);
      const m2 = 10 + (N % 4);
      const m3 = 12 + (N % 3);
      const grand = (m1 + m2 + m3) / 3;
      const ssb = 5 * ((m1 - grand) ** 2 + (m2 - grand) ** 2 + (m3 - grand) ** 2);
      const ssw = 50;
      const dfb = 2;
      const dfw = 12;
      const msb = ssb / dfb;
      const msw = ssw / dfw;
      const F = msb / msw;
      return {
        expected: parseFloat(F.toFixed(3)),
        explain: `Grand = ${grand.toFixed(2)}. SS_b = 5·[(${m1}-${grand.toFixed(2)})²+...] = ${ssb.toFixed(2)}. MS_b = ${ssb.toFixed(2)}/2 = ${msb.toFixed(2)}. MS_w = 50/12 = ${msw.toFixed(3)}. F = <b>${F.toFixed(3)}</b>`,
      };
    } },

  { qId: "c14", type: "comp", points: 4, parametric: true, tolerance: 0.005,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const z = 0.5 + (N % 8) * 0.2;
      const p = 1 / (1 + Math.exp(-z));
      const loss = -Math.log(p);
      return {
        expected: parseFloat(loss.toFixed(4)),
        explain: `σ(${z.toFixed(2)}) = ${p.toFixed(4)}. Loss = -ln(${p.toFixed(4)}) = <b>${loss.toFixed(4)}</b>`,
      };
    } },

  { qId: "c15", type: "comp", points: 4, parametric: true, tolerance: 0.005,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const w1 = 2;
      const w2 = 3;
      const b = -10;
      const x1 = 1 + (N % 5);
      const x2 = 2 + (N % 4);
      const decision = w1 * x1 + w2 * x2 + b;
      const norm_w = Math.sqrt(w1 * w1 + w2 * w2);
      const margin = Math.abs(decision) / norm_w;
      return {
        expected: parseFloat(margin.toFixed(3)),
        explain: `decision = 2·${x1} + 3·${x2} - 10 = ${decision}. ||w|| = √(4+9) = ${norm_w.toFixed(3)}. margin = |${decision}|/${norm_w.toFixed(3)} = <b>${margin.toFixed(3)}</b>`,
      };
    } },
];

// ─────────────────────────────────────────────────────────────────────────────
// Export gabungan + ringkasan
// ─────────────────────────────────────────────────────────────────────────────
const UAS_QUESTIONS = [...TF, ...MC, ...COMP_EZ, ...COMP_HARD];

const SUMMARY = {
  examId: "optoauto-uas",
  totalSoal: UAS_QUESTIONS.length,                                       // 45
  totalPoin: UAS_QUESTIONS.reduce((s, q) => s + q.points, 0),            // 70
  breakdown: { tf: 10, mc: 20, compEz: 10, compHard: 5 },
  parametricCount: UAS_QUESTIONS.filter((q) => q.parametric).length,
};

module.exports = { UAS_QUESTIONS, SUMMARY };
