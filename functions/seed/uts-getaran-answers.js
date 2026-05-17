/* eslint-disable max-len */
/**
 * UTS Getaran Mekanik — answer-key metadata (45 soal / 70 poin).
 *
 * SUMBER KEBENARAN: cermin rumus dari `Getaran-Mekanik/Exam/UTS.html`
 * (UTS_TF, UTS_MC, UTS_COMP_EZ, UTS_COMP_HARD).
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
 * (sync dgn `getN()` di UTS.html = 2 digit terakhir NIM).
 *
 * ⚠ PENTING: kalau definisi soal di UTS.html berubah, file ini WAJIB di-update.
 *    Jangan ubah formula di sini tanpa update UTS.html (atau sebaliknya).
 *    Phase 3 nanti, idealnya UTS.html & seed share file definisi (refactor v2).
 */

// Sync dengan `shuffleSeed()` di UTS.html line 1607-1616.
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
    explain: "Sesuai Modul 1 Bagian 01 — definisi getaran mesin & perannya sebagai sinyal kondisi mesin." },

  { qId: "tf2", type: "tf", points: 1, parametric: false,
    answer: false,
    explain: "Modul 1 Bagian 02 — pada frekuensi tinggi (>1 kHz), <b>percepatan</b> yang dominan dan paling sensitif. Velocity untuk frekuensi mid (10-1000 Hz)." },

  { qId: "tf3", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 2 Bagian 01 — F_pegas = -k·x dan F_peredam = -c·ẋ. Hukum dasar tiga elemen sistem getaran SDOF." },

  { qId: "tf4", type: "tf", points: 1, parametric: true,
    compute: (N) => {
      const m = N + 1;
      const k = 1000;
      const T = 2 * Math.PI * Math.sqrt(m / k);
      return {
        answer: T > 1.5,
        explain: `T = 2π·√(m/k) = 2π·√(${m}/1000) = <b>${T.toFixed(3)} s</b> ${T > 1.5 ? "> 1.5 → BENAR" : "≤ 1.5 → SALAH"}`,
      };
    } },

  { qId: "tf5", type: "tf", points: 1, parametric: true,
    compute: (N) => {
      const m = 5, k = 125;
      const c = N + 1;
      const cc = 2 * Math.sqrt(m * k);   // = 50
      const zeta = c / cc;
      return {
        answer: zeta < 1,
        explain: `c_crit = 2√(km) = 2√(${k}·${m}) = ${cc}; ζ = c/c_crit = ${c}/${cc} = <b>${zeta.toFixed(3)}</b> ${zeta < 1 ? "< 1 → underdamped (BENAR)" : "≥ 1 → bukan underdamped (SALAH)"}`,
      };
    } },

  { qId: "tf6", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 3 Bagian 04 — δ = (1/n)·ln(x₁/x_(n+1)) dan ζ = δ/√(4π² + δ²). Metode standar di lab vibrasi." },

  { qId: "tf7", type: "tf", points: 1, parametric: false,
    answer: false,
    explain: "Modul 4 Bagian 04 — pada resonansi dengan damping, X = X_st/(2ζ) yaitu <em>terbatas</em>. Hanya untuk sistem undamped (ζ=0) yang amplitudo → ∞." },

  { qId: "tf8", type: "tf", points: 1, parametric: true,
    compute: (N) => {
      const m = 1, k = 2500;
      const omega = N + 1;
      const wn = Math.sqrt(k / m);
      const r = omega / wn;
      return {
        answer: r > 1,
        explain: `ωₙ = √(k/m) = √(2500/1) = ${wn} rad/s; r = ω/ωₙ = ${omega}/${wn} = <b>${r.toFixed(3)}</b> ${r > 1 ? "> 1 (BENAR)" : "≤ 1 (SALAH)"}`,
      };
    } },

  { qId: "tf9", type: "tf", points: 1, parametric: false,
    answer: false,
    explain: "Modul 5 Bagian 04 — Q = 1/(2ζ), jadi Q ↑ berarti ζ ↓ (damping kecil). Sistem dengan Q tinggi punya puncak resonansi tajam." },

  { qId: "tf10", type: "tf", points: 1, parametric: true,
    compute: (N) => {
      const zeta = 0.05;
      const r = 0.5 + 0.025 * N;
      const TR = Math.sqrt((1 + Math.pow(2*zeta*r, 2)) / (Math.pow(1 - r*r, 2) + Math.pow(2*zeta*r, 2)));
      return {
        answer: TR < 1,
        explain: `T_R = √((1 + (2ζr)²) / ((1-r²)² + (2ζr)²)) = <b>${TR.toFixed(3)}</b> ${TR < 1 ? "< 1 → ter-isolasi (BENAR)" : "≥ 1 → tidak ter-isolasi (SALAH). Isolasi efektif hanya untuk r > √2 ≈ 1.414."}`,
      };
    } },
];

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN B — PILIHAN GANDA (20 soal × 1 poin = 20 poin)
// ─────────────────────────────────────────────────────────────────────────────
const MC = [
  { qId: "mc1", type: "mc", points: 1, parametric: false,
    correctIdx: 3,
    explain: "Modul 1 Bagian 02 — tiga parameter standar: perpindahan, kecepatan, percepatan. Tekanan bukan parameter getaran." },

  { qId: "mc2", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Turunan kedua x(t) = A·sin(ωt) adalah ẍ(t) = -A·ω²·sin(ωt), maka a_max = A·ω²." },

  { qId: "mc3", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const rpm = (N + 1) * 30;
      const omega = 2 * Math.PI * (rpm / 60);
      const correct = omega;
      const opts = [
        { v: correct },
        { v: rpm / 60 },
        { v: 2 * rpm },
        { v: omega / 2 },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N),
        explain: `ω = 2π·(RPM/60) = 2π·(${rpm}/60) = <b>${correct.toFixed(2)} rad/s</b>`,
      };
    } },

  { qId: "mc4", type: "mc", points: 1, parametric: false,
    correctIdx: 0,
    explain: "Modul 1 Bagian 07 — TMD digunakan untuk meredam osilasi struktur akibat eksitasi eksternal (angin, gempa)." },

  { qId: "mc5", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const m = 1, k = N + 1;
      const wn = Math.sqrt(k / m);
      const correct = wn;
      const opts = [
        { v: correct },
        { v: correct * 1.15 },
        { v: correct / 1.15 },
        { v: Math.sqrt(m / k) },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N + 5),
        explain: `ωₙ = √(k/m) = √(${k}/1) = √${k} = <b>${correct.toFixed(2)} rad/s</b>`,
      };
    } },

  { qId: "mc6", type: "mc", points: 1, parametric: false,
    correctIdx: 2,
    explain: "Modul 2 Bagian 02 & Modul 4 Bagian 01 — bentuk umum persamaan gerak getaran paksa." },

  { qId: "mc7", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const m = N + 1, k = 1000;
      const T = 2 * Math.PI * Math.sqrt(m / k);
      const correct = T;
      const opts = [
        { v: correct },
        { v: 1 / Math.sqrt(k / m) },
        { v: 2 * Math.PI * Math.sqrt(k / m) },
        { v: Math.PI * Math.sqrt(m / k) },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N + 7),
        explain: `T = 2π·√(m/k) = 2π·√(${m}/1000) = <b>${correct.toFixed(4)} s</b>`,
      };
    } },

  { qId: "mc8", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Modul 2 Bagian 04 — sistem n-DOF memiliki n frekuensi natural (eigenvalue dari matriks M⁻¹K)." },

  { qId: "mc9", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Modul 3 Bagian 03 — ζ = 1 adalah critical damping, mengembalikan sistem ke equilibrium paling cepat tanpa overshoot." },

  { qId: "mc10", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const m = 1, k = 100;
      const c = N + 1;
      const cc = 2 * Math.sqrt(m * k);     // = 20
      const zeta = c / cc;
      const correct = zeta;
      const opts = [
        { v: correct },
        { v: c / Math.sqrt(m * k) },
        { v: c / (2 * m * k) },
        { v: c / (2 * Math.sqrt(k / m)) },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N + 10),
        explain: `ζ = c/(2√(km)) = ${c}/(2·√(100·1)) = ${c}/${cc} = <b>${correct.toFixed(4)}</b>`,
      };
    } },

  { qId: "mc11", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const m = 1, k = 100;
      const c = (N + 1) / 10;
      const wn = Math.sqrt(k / m);
      const zeta = c / (2 * Math.sqrt(m * k));
      const wd = wn * Math.sqrt(1 - zeta * zeta);
      const correct = wd;
      const opts = [
        { v: correct },
        { v: wn },
        { v: wn * (1 - zeta * zeta) },
        { v: wn * Math.sqrt(1 + zeta * zeta) },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N + 11),
        explain: `ζ = c/(2√(km)) = ${c.toFixed(1)}/20 = ${zeta.toFixed(3)}; ω_d = ωₙ·√(1-ζ²) = 10·√(1-${zeta.toFixed(3)}²) = <b>${correct.toFixed(3)} rad/s</b>`,
      };
    } },

  { qId: "mc12", type: "mc", points: 1, parametric: false,
    correctIdx: 0,
    explain: "Modul 3 Bagian 04 — untuk ζ small, δ = 2πζ/√(1-ζ²) ≈ 2πζ. Approksimasi standar di teknik." },

  { qId: "mc13", type: "mc", points: 1, parametric: false,
    correctIdx: 0,
    explain: "Modul 4 Bagian 03 — pada r=1: DMF = 1/√((1-1)² + (2ζ)²) = 1/(2ζ). Inilah nilai amplifikasi maksimum (terbatas)." },

  { qId: "mc14", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const r = (N + 1) / 50;
      const zeta = 0.1;
      const DMF = 1 / Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(2 * zeta * r, 2));
      const correct = DMF;
      const opts = [
        { v: correct },
        { v: 1 / Math.abs(1 - r * r) },
        { v: 1 / (2 * zeta) },
        { v: 1 / Math.sqrt(Math.pow(1 - r, 2) + Math.pow(2 * zeta * r, 2)) },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N + 14),
        explain: `DMF = 1/√((1-r²)² + (2ζr)²) = 1/√((1-${(r*r).toFixed(3)})² + (${(2*zeta*r).toFixed(3)})²) = <b>${correct.toFixed(3)}</b>`,
      };
    } },

  { qId: "mc15", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const m = 10, k = 10000;
      const F0 = (N + 1) * 10;
      const wn = Math.sqrt(k / m);
      const zeta = 0.1;
      const X_st = F0 / k;
      const X_res = X_st / (2 * zeta);
      const correct = X_res * 1000;
      const opts = [
        { v: correct },
        { v: X_st * 1000 },
        { v: F0 / wn / 1000 },
        { v: F0 / k * (1 / zeta) * 1000 },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N + 15),
        explain: `Pada resonansi: X = F₀/(2ζk) = ${F0}/(2·0.1·10000) = ${X_res.toExponential(3)} m = <b>${correct.toFixed(3)} mm</b>`,
      };
    } },

  { qId: "mc16", type: "mc", points: 1, parametric: false,
    correctIdx: 3,
    explain: "Modul 4 Bagian 04 — untuk menghindari resonansi: (1) tuning ωₙ jauh dari ω, (2) tambah damping, (3) gunakan tuned mass damper. Tuning ωₙ paling efektif." },

  { qId: "mc17", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Modul 5 Bagian 02 — peak DMF terjadi pada r_peak = √(1-2ζ²), <em>sedikit</em> di bawah r=1 untuk ζ > 0. Untuk ζ = 0, r_peak = 1." },

  { qId: "mc18", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const zeta = (N + 1) / 200;
      const Q = 1 / (2 * zeta);
      const correct = Q;
      const opts = [
        { v: correct },
        { v: 1 / zeta },
        { v: 2 * zeta },
        { v: 1 / (zeta * zeta) },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N + 18),
        explain: `Q = 1/(2ζ) = 1/(2·${zeta.toFixed(3)}) = <b>${Q.toFixed(2)}</b>. Q tinggi → puncak resonansi tajam.`,
      };
    } },

  { qId: "mc19", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const r = 1.5 + 0.04 * N;
      const zeta = 0.05;
      const TR = Math.sqrt((1 + Math.pow(2*zeta*r, 2)) / (Math.pow(1-r*r, 2) + Math.pow(2*zeta*r, 2)));
      const correct = TR;
      const opts = [
        { v: correct },
        { v: 1 / Math.abs(1 - r * r) },
        { v: 1 / (r * r - 1) },
        { v: 1 / r },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N + 19),
        explain: `T_R = √((1+(2ζr)²)/((1-r²)²+(2ζr)²)) = <b>${correct.toFixed(4)}</b>`,
      };
    } },

  { qId: "mc20", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Modul 5 Bagian 03 — untuk semua ζ, T_R = 1 saat r = √2. Isolasi efektif (T_R < 1) hanya untuk r > √2." },
];

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN C — KOMPUTASI EASY/MEDIUM (10 soal × 2 poin = 20 poin)
// Semua parametric.
// ─────────────────────────────────────────────────────────────────────────────
const COMP_EZ = [
  { qId: "c1", type: "comp", points: 2, parametric: true, tolerance: 0.05,
    compute: (N) => {
      const rpm = (N + 1) * 30;
      const omega = 2 * Math.PI * (rpm / 60);
      return { answer: omega, explain: `ω = 2π·(${rpm}/60) = <b>${omega.toFixed(4)} rad/s</b>` };
    } },

  { qId: "c2", type: "comp", points: 2, parametric: true, tolerance: 0.02,
    compute: (N) => {
      const m = 1, k = (N + 1) * 10;
      const wn = Math.sqrt(k / m);
      return { answer: wn, explain: `ωₙ = √(k/m) = √(${k}/1) = <b>${wn.toFixed(4)} rad/s</b>` };
    } },

  { qId: "c3", type: "comp", points: 2, parametric: true, tolerance: 0.01,
    compute: (N) => {
      const m = 1, k = (N + 1) * 40;
      const fn = Math.sqrt(k / m) / (2 * Math.PI);
      return { answer: fn, explain: `f_n = (1/2π)·√(k/m) = (1/2π)·√(${k}/1) = <b>${fn.toFixed(4)} Hz</b>` };
    } },

  { qId: "c4", type: "comp", points: 2, parametric: true, tolerance: 0.005,
    compute: (N) => {
      const m = 1, k = 100;
      const c = N + 1;
      const zeta = c / (2 * Math.sqrt(m * k));
      return { answer: zeta, explain: `ζ = c/(2√(km)) = ${c}/(2·√100) = ${c}/20 = <b>${zeta.toFixed(4)}</b>` };
    } },

  { qId: "c5", type: "comp", points: 2, parametric: true, tolerance: 0.02,
    compute: (N) => {
      const m = 1, k = 100;
      const c = (N + 1) / 10;
      const wn = Math.sqrt(k / m);
      const zeta = c / (2 * Math.sqrt(m * k));
      const wd = wn * Math.sqrt(1 - zeta * zeta);
      return { answer: wd, explain: `ωn=10, ζ=${zeta.toFixed(3)}, ω_d = 10·√(1-ζ²) = <b>${wd.toFixed(3)} rad/s</b>` };
    } },

  { qId: "c6", type: "comp", points: 2, parametric: true, tolerance: 0.005,
    compute: (N) => {
      const x1 = 0.1;
      const x2 = x1 * Math.exp(-(N + 1) / 100);
      const delta = Math.log(x1 / x2);
      return { answer: delta, explain: `δ = ln(x₁/x₂) = ln(${x1}/${x2.toFixed(4)}) = <b>${delta.toFixed(4)}</b>` };
    } },

  { qId: "c7", type: "comp", points: 2, parametric: true, tolerance: 0.01,
    compute: (N) => {
      const r = (N + 1) / 50;
      const zeta = 0.1;
      const DMF = 1 / Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(2 * zeta * r, 2));
      return { answer: DMF, explain: `DMF = 1/√((1-r²)² + (2ζr)²) = <b>${DMF.toFixed(3)}</b>` };
    } },

  { qId: "c8", type: "comp", points: 2, parametric: true, tolerance: 0.05,
    compute: (N) => {
      const m = 10, c = 50, k = 10000;
      const F0 = (N + 1) * 10;
      const omega = 20;
      const denom = Math.sqrt(Math.pow(k - m * omega * omega, 2) + Math.pow(c * omega, 2));
      const X_mm = (F0 / denom) * 1000;
      return { answer: X_mm, explain: `X = F₀/√((k-mω²)² + (cω)²) = ${F0}/${denom.toFixed(2)} m = <b>${X_mm.toFixed(3)} mm</b>` };
    } },

  { qId: "c9", type: "comp", points: 2, parametric: true, tolerance: 0.05,
    compute: (N) => {
      const m = 1, k = 100;
      const c = (N + 1) / 10;
      const zeta = c / (2 * Math.sqrt(m * k));
      const Q = 1 / (2 * zeta);
      return { answer: Q, explain: `ζ = ${zeta.toFixed(3)}; Q = 1/(2ζ) = <b>${Q.toFixed(2)}</b>` };
    } },

  { qId: "c10", type: "comp", points: 2, parametric: true, tolerance: 0.005,
    compute: (N) => {
      const r = 1.6 + 0.04 * N;
      const zeta = 0.05;
      const TR = Math.sqrt((1 + Math.pow(2*zeta*r, 2)) / (Math.pow(1-r*r, 2) + Math.pow(2*zeta*r, 2)));
      return { answer: TR, explain: `T_R = √((1+(2ζr)²)/((1-r²)²+(2ζr)²)) = <b>${TR.toFixed(4)}</b>` };
    } },
];

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN D — KOMPUTASI HARD (5 soal × 4 poin = 20 poin)
// Semua parametric. allowPartial=true → partial credit +1 jika kode dijalankan
// (non-late) tapi output salah/error.
// ─────────────────────────────────────────────────────────────────────────────

// Helper: replikasi RK4 integrator utk c11 (cermin client UTS.html line 2643-2674).
function _c11FirstPositivePeakAfterCross(N) {
  const m = 1, k = 100;
  const c = (N + 1) / 10;
  const x0 = 0.1, v0 = 0;
  function rhs(state) {
    const [x, v] = state;
    return [v, (-c * v - k * x) / m];
  }
  function rk4(state, h) {
    const k1 = rhs(state);
    const k2 = rhs([state[0] + h / 2 * k1[0], state[1] + h / 2 * k1[1]]);
    const k3 = rhs([state[0] + h / 2 * k2[0], state[1] + h / 2 * k2[1]]);
    const k4 = rhs([state[0] + h * k3[0], state[1] + h * k3[1]]);
    return [
      state[0] + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
      state[1] + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    ];
  }
  let state = [x0, v0];
  const h = 0.001;
  const T = 3.0;
  const steps = Math.floor(T / h);
  let prev_v = v0;
  let crossedZero = false;
  for (let i = 1; i <= steps; i++) {
    state = rk4(state, h);
    if (!crossedZero && state[0] < 0) crossedZero = true;
    if (crossedZero && state[0] > 0 && prev_v > 0 && state[1] <= 0) {
      return state[0];
    }
    prev_v = state[1];
  }
  return 0;
}

// Helper: replikasi sweep DMF utk c15 (cermin client UTS.html line 2768-2776).
function _c15KMax(N) {
  const m = 50;
  const omega_ex = N + 1;
  const TR_target = 0.10;
  const zeta = 0.05;
  let omega_n_max = 0;
  for (let wn_test = 0.01; wn_test < omega_ex; wn_test += 0.01) {
    const r = omega_ex / wn_test;
    const tr = Math.sqrt((1 + Math.pow(2*zeta*r, 2)) / (Math.pow(1-r*r, 2) + Math.pow(2*zeta*r, 2)));
    if (tr <= TR_target) omega_n_max = wn_test;
  }
  return m * omega_n_max * omega_n_max;
}

const COMP_HARD = [
  { qId: "c11", type: "comp", points: 4, parametric: true, tolerance: 0.005,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const c = (N + 1) / 10;
      const peak = _c11FirstPositivePeakAfterCross(N);
      return { answer: peak, explain: `RK4 integration mẍ+cẋ+kx=0 dgn m=1, k=100, c=${c.toFixed(1)}, x₀=0.1, v₀=0 → peak positif pertama setelah crossing = <b>${peak.toFixed(4)} m</b>` };
    } },

  { qId: "c12", type: "comp", points: 4, parametric: true, tolerance: 0.005,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const zeta_true = (N + 1) / 200;
      const wn = 10;
      const wd = wn * Math.sqrt(1 - zeta_true * zeta_true);
      const Td = 2 * Math.PI / wd;
      const delta_expected = zeta_true * wn * Td;
      const zeta_est = delta_expected / Math.sqrt(4 * Math.PI * Math.PI + delta_expected * delta_expected);
      return { answer: zeta_est, explain: `ζ_true = ${zeta_true.toFixed(4)}; δ = ζ·ωₙ·Td = ${delta_expected.toFixed(4)}; ζ_est = δ/√(4π²+δ²) = <b>${zeta_est.toFixed(4)}</b>` };
    } },

  { qId: "c13", type: "comp", points: 4, parametric: true, tolerance: 0.5,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const f1 = N + 1;
      return { answer: f1, explain: `Sinyal: A₁·sin(2π·${f1}·t) + 0.3·sin(2π·80·t). FFT → frekuensi dominan = <b>${f1} Hz</b> (komponen A₁ paling besar)` };
    } },

  { qId: "c14", type: "comp", points: 4, parametric: true, tolerance: 0.05,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const m = 1, k = 100;
      const c = (N + 1) / 10;
      const wn = Math.sqrt(k / m);
      const zeta = c / (2 * Math.sqrt(m * k));
      const r_peak = Math.sqrt(1 - 2 * zeta * zeta);
      const omega_peak = r_peak * wn;
      return { answer: omega_peak, explain: `ωₙ=10, ζ=${zeta.toFixed(3)}, r_peak=√(1-2ζ²)=${r_peak.toFixed(4)}, ω_peak = r_peak·ωₙ = <b>${omega_peak.toFixed(3)} rad/s</b>` };
    } },

  { qId: "c15", type: "comp", points: 4, parametric: true, tolerance: 50,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const k_max = _c15KMax(N);
      return { answer: k_max, explain: `Sweep ωₙ dgn step 0.01, cari yg memenuhi T_R ≤ 0.10 → k_max = m·ωₙ_max² = <b>${k_max.toFixed(1)} N/m</b>` };
    } },
];

// ─────────────────────────────────────────────────────────────────────────────
// Export gabungan + ringkasan
// ─────────────────────────────────────────────────────────────────────────────
const UTS_QUESTIONS = [...TF, ...MC, ...COMP_EZ, ...COMP_HARD];

const SUMMARY = {
  examId: "getaran-mekanik-uts",
  totalQuestions: UTS_QUESTIONS.length,                                  // 45
  totalPoints: UTS_QUESTIONS.reduce((s, q) => s + q.points, 0),          // 70 (TF 10 + MC 20 + Comp E 20 + Comp Hard 20)
  parametricCount: UTS_QUESTIONS.filter((q) => q.parametric).length,     // 27
};

module.exports = { UTS_QUESTIONS, SUMMARY, shuffleSeed, mcShuffledIdx };
