/* eslint-disable max-len */
/**
 * Server-side authoritative data untuk Getaran Mekanik UTS.
 *
 * Modul ini berisi 45 definisi soal lengkap dengan kunci jawaban:
 *   - 10 True/False (BAGIAN A, 1 pt each)
 *   - 20 Pilihan Ganda (BAGIAN B, 1 pt each)
 *   - 10 Komputasi Easy/Medium (BAGIAN C, 2 pt each)
 *   - 5 Komputasi Hard (BAGIAN D, 4 pt each)
 *
 * Total: 70 poin.
 *
 * KRITIS — file ini HANYA boleh di-import dari Cloud Functions runtime.
 * Tidak boleh di-bundle ke client HTML, tidak boleh di-commit ke repo public
 * tanpa restriksi access. Source of truth untuk verifikasi server-side.
 *
 * Dipakai oleh: functions/index.js (checkExamAnswer, getMCOptions).
 */

"use strict";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: shuffle dengan seed deterministik (PRNG sederhana).
// Identik dengan client `shuffleSeed()` di UTS.html agar order konsisten.
// ─────────────────────────────────────────────────────────────────────────────
function shuffleSeed(arr, seed) {
  const result = arr.slice();
  let s = (seed * 9301 + 49297) % 233280;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Compute N dari NIM (2 digit terakhir, fallback 0).
// Identik dengan client `getN()`.
// ─────────────────────────────────────────────────────────────────────────────
function getNFromNim(nim) {
  const s = String(nim || "").replace(/[^0-9]/g, "");
  if (!s) return 0;
  return parseInt(s.slice(-2), 10) || 0;
}

// ═════════════════════════════════════════════════════════════════════════════
// BAGIAN A — TRUE/FALSE (10 soal × 1 poin = 10 poin)
// ═════════════════════════════════════════════════════════════════════════════
const TF_QUESTIONS = {
  tf1: {
    modul: 1, parametric: false, points: 1,
    answer: true,
  },
  tf2: {
    modul: 1, parametric: false, points: 1,
    answer: false,
  },
  tf3: {
    modul: 2, parametric: false, points: 1,
    answer: true,
  },
  tf4: {
    modul: 2, parametric: true, points: 1,
    compute: (N) => {
      const m = N + 1;
      const k = 1000;
      const T = 2 * Math.PI * Math.sqrt(m / k);
      return { answer: T > 1.5 };
    },
  },
  tf5: {
    modul: 3, parametric: true, points: 1,
    compute: (N) => {
      const m = 5;
      const k = 125;
      const c = N + 1;
      const c_crit = 2 * Math.sqrt(m * k);
      const zeta = c / c_crit;
      return { answer: zeta < 1 };
    },
  },
  tf6: {
    modul: 3, parametric: false, points: 1,
    answer: true,
  },
  tf7: {
    modul: 4, parametric: false, points: 1,
    answer: false,
  },
  tf8: {
    modul: 4, parametric: true, points: 1,
    compute: (N) => {
      const m = 1;
      const k = 2500;
      const omega = N + 1;
      const wn = Math.sqrt(k / m);
      const r = omega / wn;
      return { answer: r > 1 };
    },
  },
  tf9: {
    modul: 5, parametric: false, points: 1,
    answer: false,
  },
  tf10: {
    modul: 5, parametric: true, points: 1,
    compute: (N) => {
      const zeta = 0.05;
      const r = 0.5 + 0.025 * N;
      const TR = Math.sqrt((1 + Math.pow(2 * zeta * r, 2)) / (Math.pow(1 - r * r, 2) + Math.pow(2 * zeta * r, 2)));
      return { answer: TR < 1 };
    },
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// BAGIAN B — PILIHAN GANDA (20 soal × 1 poin = 20 poin)
//
// Untuk parametric MC, struktur internal: compute(N) → { opts: [{v, lbl}], correctV }
//   - opts: 4 kandidat dengan value (untuk verifikasi) + label (untuk display)
//   - correctV: nilai opsi yang benar (sebelum shuffle)
//   - Helper getMCShuffledOptions(qId, N) akan shuffle dan return label-only array
//   - Helper verifyMC(qId, N, idx) akan shuffle dan cek apakah idx menunjuk ke correctV
// ═════════════════════════════════════════════════════════════════════════════
const MC_QUESTIONS = {
  mc1: {
    modul: 1, parametric: false, points: 1,
    options: ["Perpindahan (mm)", "Kecepatan (mm/s)", "Percepatan (m/s²)", "Tekanan (Pa)"],
    correctIdx: 3,
  },
  mc2: {
    modul: 1, parametric: false, points: 1,
    options: ["a<sub>max</sub> = A·ω", "a<sub>max</sub> = A·ω²", "a<sub>max</sub> = A/ω", "a<sub>max</sub> = A·ω³"],
    correctIdx: 1,
  },
  mc3: {
    modul: 1, parametric: true, points: 1, shuffleOffset: 0,
    compute: (N) => {
      const rpm = (N + 1) * 30;
      const omega = 2 * Math.PI * (rpm / 60);
      const correct = omega;
      const opts = [
        { v: correct, lbl: correct.toFixed(2) + " rad/s" },
        { v: rpm / 60, lbl: (rpm / 60).toFixed(2) + " rad/s" },
        { v: 2 * rpm, lbl: (2 * rpm).toFixed(2) + " rad/s" },
        { v: omega / 2, lbl: (omega / 2).toFixed(2) + " rad/s" },
      ];
      return { opts, correctV: correct };
    },
  },
  mc4: {
    modul: 1, parametric: false, points: 1,
    options: ["Meredam getaran akibat angin & gempa", "Menambah massa total agar gedung lebih kokoh", "Memberikan dukungan struktural utama", "Sebagai cadangan generator listrik"],
    correctIdx: 0,
  },
  mc5: {
    modul: 2, parametric: true, points: 1, shuffleOffset: 5,
    compute: (N) => {
      const m = 1;
      const k = N + 1;
      const wn = Math.sqrt(k / m);
      const correct = wn;
      const opts = [
        { v: correct, lbl: correct.toFixed(2) + " rad/s" },
        { v: correct * 1.15, lbl: (correct * 1.15).toFixed(2) + " rad/s" },
        { v: correct / 1.15, lbl: (correct / 1.15).toFixed(2) + " rad/s" },
        { v: Math.sqrt(m / k), lbl: Math.sqrt(m / k).toFixed(4) + " rad/s" },
      ];
      return { opts, correctV: correct };
    },
  },
  mc6: {
    modul: 2, parametric: false, points: 1,
    options: ["mẍ + kx = 0", "mẍ + cẋ + kx = 0", "mẍ + cẋ + kx = F₀sin(ωt)", "mẍ = F₀sin(ωt)"],
    correctIdx: 2,
  },
  mc7: {
    modul: 2, parametric: true, points: 1, shuffleOffset: 7,
    compute: (N) => {
      const m = N + 1;
      const k = 1000;
      const T = 2 * Math.PI * Math.sqrt(m / k);
      const correct = T;
      const opts = [
        { v: correct, lbl: correct.toFixed(4) + " s" },
        { v: 1 / Math.sqrt(k / m), lbl: (1 / Math.sqrt(k / m)).toFixed(4) + " s" },
        { v: 2 * Math.PI * Math.sqrt(k / m), lbl: (2 * Math.PI * Math.sqrt(k / m)).toFixed(4) + " s" },
        { v: Math.PI * Math.sqrt(m / k), lbl: (Math.PI * Math.sqrt(m / k)).toFixed(4) + " s" },
      ];
      return { opts, correctV: correct };
    },
  },
  mc8: {
    modul: 2, parametric: false, points: 1,
    options: ["1", "2", "3", "Tergantung damping"],
    correctIdx: 1,
  },
  mc9: {
    modul: 3, parametric: false, points: 1,
    options: ["Underdamped (osilasi mengecil)", "Critically damped (kembali tercepat tanpa overshoot)", "Overdamped (kembali lambat tanpa osilasi)", "Undamped (osilasi konstan)"],
    correctIdx: 1,
  },
  mc10: {
    modul: 3, parametric: true, points: 1, shuffleOffset: 10,
    compute: (N) => {
      const m = 1;
      const k = 100;
      const c = N + 1;
      const cc = 2 * Math.sqrt(m * k);
      const zeta = c / cc;
      const correct = zeta;
      const opts = [
        { v: correct, lbl: correct.toFixed(4) },
        { v: c / Math.sqrt(m * k), lbl: (c / Math.sqrt(m * k)).toFixed(4) },
        { v: c / (2 * m * k), lbl: (c / (2 * m * k)).toFixed(6) },
        { v: c / (2 * Math.sqrt(k / m)), lbl: (c / (2 * Math.sqrt(k / m))).toFixed(4) },
      ];
      return { opts, correctV: correct };
    },
  },
  mc11: {
    modul: 3, parametric: true, points: 1, shuffleOffset: 11,
    compute: (N) => {
      const m = 1;
      const k = 100;
      const c = (N + 1) / 10;
      const wn = Math.sqrt(k / m);
      const zeta = c / (2 * Math.sqrt(m * k));
      const wd = wn * Math.sqrt(1 - zeta * zeta);
      const correct = wd;
      const opts = [
        { v: correct, lbl: correct.toFixed(3) + " rad/s" },
        { v: wn, lbl: wn.toFixed(3) + " rad/s" },
        { v: wn * (1 - zeta * zeta), lbl: (wn * (1 - zeta * zeta)).toFixed(3) + " rad/s" },
        { v: wn * Math.sqrt(1 + zeta * zeta), lbl: (wn * Math.sqrt(1 + zeta * zeta)).toFixed(3) + " rad/s" },
      ];
      return { opts, correctV: correct };
    },
  },
  mc12: {
    modul: 3, parametric: false, points: 1,
    options: ["δ ≈ 2πζ", "δ ≈ ζ²", "δ ≈ ζ/2π", "δ ≈ √ζ"],
    correctIdx: 0,
  },
  mc13: {
    modul: 4, parametric: false, points: 1,
    options: ["DMF = 1/(2ζ)", "DMF = 2ζ", "DMF = 1/ζ", "DMF → ∞"],
    correctIdx: 0,
  },
  mc14: {
    modul: 4, parametric: true, points: 1, shuffleOffset: 14,
    compute: (N) => {
      const r = (N + 1) / 50;
      const zeta = 0.1;
      const DMF = 1 / Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(2 * zeta * r, 2));
      const correct = DMF;
      const opts = [
        { v: correct, lbl: correct.toFixed(3) },
        { v: 1 / Math.abs(1 - r * r), lbl: (1 / Math.abs(1 - r * r)).toFixed(3) },
        { v: 1 / (2 * zeta), lbl: (1 / (2 * zeta)).toFixed(3) },
        { v: 1 / Math.sqrt(Math.pow(1 - r, 2) + Math.pow(2 * zeta * r, 2)), lbl: (1 / Math.sqrt(Math.pow(1 - r, 2) + Math.pow(2 * zeta * r, 2))).toFixed(3) },
      ];
      return { opts, correctV: correct };
    },
  },
  mc15: {
    modul: 4, parametric: true, points: 1, shuffleOffset: 15,
    compute: (N) => {
      const m = 10;
      const k = 10000;
      const F0 = (N + 1) * 10;
      const wn = Math.sqrt(k / m);
      const zeta = 0.1;
      const X_st = F0 / k;
      const X_res = X_st / (2 * zeta);
      const correct = X_res * 1000;
      const opts = [
        { v: correct, lbl: correct.toFixed(3) + " mm" },
        { v: X_st * 1000, lbl: (X_st * 1000).toFixed(3) + " mm" },
        { v: F0 / wn / 1000, lbl: (F0 / wn / 1000).toFixed(5) + " mm" },
        { v: F0 / k * (1 / zeta) * 1000, lbl: (F0 / k * (1 / zeta) * 1000).toFixed(3) + " mm" },
      ];
      return { opts, correctV: correct };
    },
  },
  mc16: {
    modul: 4, parametric: false, points: 1,
    options: ["Tambah massa untuk menggeser ωₙ jauh dari ω", "Naikkan damping ratio ζ", "Geser frekuensi natural ωₙ jauh dari ω operasi (tuning)", "Semua jawaban di atas dapat membantu, namun tuning ωₙ adalah pendekatan utama"],
    correctIdx: 3,
  },
  mc17: {
    modul: 5, parametric: false, points: 1,
    options: ["r = 1 (selalu, untuk semua ζ)", "r = √(1 - 2ζ²) (sedikit di bawah 1)", "r = √(1 + 2ζ²) (sedikit di atas 1)", "r = 1/(2ζ)"],
    correctIdx: 1,
  },
  mc18: {
    modul: 5, parametric: true, points: 1, shuffleOffset: 18,
    compute: (N) => {
      const zeta = (N + 1) / 200;
      const Q = 1 / (2 * zeta);
      const correct = Q;
      const opts = [
        { v: correct, lbl: correct.toFixed(2) },
        { v: 1 / zeta, lbl: (1 / zeta).toFixed(2) },
        { v: 2 * zeta, lbl: (2 * zeta).toFixed(4) },
        { v: 1 / (zeta * zeta), lbl: (1 / (zeta * zeta)).toFixed(2) },
      ];
      return { opts, correctV: correct };
    },
  },
  mc19: {
    modul: 5, parametric: true, points: 1, shuffleOffset: 19,
    compute: (N) => {
      const r = 1.5 + 0.04 * N;
      const zeta = 0.05;
      const TR = Math.sqrt((1 + Math.pow(2 * zeta * r, 2)) / (Math.pow(1 - r * r, 2) + Math.pow(2 * zeta * r, 2)));
      const correct = TR;
      const opts = [
        { v: correct, lbl: correct.toFixed(4) },
        { v: 1 / Math.abs(1 - r * r), lbl: (1 / Math.abs(1 - r * r)).toFixed(4) },
        { v: 1 / (r * r - 1), lbl: (1 / (r * r - 1)).toFixed(4) },
        { v: 1 / r, lbl: (1 / r).toFixed(4) },
      ];
      return { opts, correctV: correct };
    },
  },
  mc20: {
    modul: 5, parametric: false, points: 1,
    options: ["r &gt; 1", "r &gt; √2 ≈ 1.414", "r &gt; 2", "r &gt; π"],
    correctIdx: 1,
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// BAGIAN C — KOMPUTASI EASY/MEDIUM (10 soal × 2 poin = 20 poin)
// ═════════════════════════════════════════════════════════════════════════════
const COMP_EZ_QUESTIONS = {
  c1: {
    modul: 1, parametric: true, points: 2, tolerance: 0.05,
    compute: (N) => {
      const rpm = (N + 1) * 30;
      const omega = 2 * Math.PI * (rpm / 60);
      return { expected: omega };
    },
  },
  c2: {
    modul: 2, parametric: true, points: 2, tolerance: 0.02,
    compute: (N) => {
      const m = 1;
      const k = (N + 1) * 10;
      const wn = Math.sqrt(k / m);
      return { expected: wn };
    },
  },
  c3: {
    modul: 2, parametric: true, points: 2, tolerance: 0.01,
    compute: (N) => {
      const m = 1;
      const k = (N + 1) * 40;
      const fn = Math.sqrt(k / m) / (2 * Math.PI);
      return { expected: fn };
    },
  },
  c4: {
    modul: 3, parametric: true, points: 2, tolerance: 0.005,
    compute: (N) => {
      const m = 1;
      const k = 100;
      const c = N + 1;
      const zeta = c / (2 * Math.sqrt(m * k));
      return { expected: zeta };
    },
  },
  c5: {
    modul: 3, parametric: true, points: 2, tolerance: 0.02,
    compute: (N) => {
      const m = 1;
      const k = 100;
      const c = (N + 1) / 10;
      const wn = Math.sqrt(k / m);
      const zeta = c / (2 * Math.sqrt(m * k));
      const wd = wn * Math.sqrt(1 - zeta * zeta);
      return { expected: wd };
    },
  },
  c6: {
    modul: 3, parametric: true, points: 2, tolerance: 0.005,
    compute: (N) => {
      const x1 = 0.1;
      const ratio = Math.exp(-(N + 1) / 100);
      const x2 = x1 * ratio;
      const delta = Math.log(x1 / x2);
      return { expected: delta };
    },
  },
  c7: {
    modul: 4, parametric: true, points: 2, tolerance: 0.01,
    compute: (N) => {
      const r = (N + 1) / 50;
      const zeta = 0.1;
      const DMF = 1 / Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(2 * zeta * r, 2));
      return { expected: DMF };
    },
  },
  c8: {
    modul: 4, parametric: true, points: 2, tolerance: 0.05,
    compute: (N) => {
      const m = 10;
      const c = 50;
      const k = 10000;
      const F0 = (N + 1) * 10;
      const omega = 20;
      const denom = Math.sqrt(Math.pow(k - m * omega * omega, 2) + Math.pow(c * omega, 2));
      const X_mm = (F0 / denom) * 1000;
      return { expected: X_mm };
    },
  },
  c9: {
    modul: 5, parametric: true, points: 2, tolerance: 0.05,
    compute: (N) => {
      const m = 1;
      const k = 100;
      const c = (N + 1) / 10;
      const zeta = c / (2 * Math.sqrt(m * k));
      const Q = 1 / (2 * zeta);
      return { expected: Q };
    },
  },
  c10: {
    modul: 5, parametric: true, points: 2, tolerance: 0.005,
    compute: (N) => {
      const r = 1.6 + 0.04 * N;
      const zeta = 0.05;
      const TR = Math.sqrt((1 + Math.pow(2 * zeta * r, 2)) / (Math.pow(1 - r * r, 2) + Math.pow(2 * zeta * r, 2)));
      return { expected: TR };
    },
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// BAGIAN D — KOMPUTASI HARD (5 soal × 4 poin = 20 poin)
// ═════════════════════════════════════════════════════════════════════════════
const COMP_HARD_QUESTIONS = {
  c11: {
    modul: 3, parametric: true, points: 4, tolerance: 0.005,
    compute: (N) => {
      // RK4 integration untuk getaran bebas teredam — peak positif kedua.
      const m = 1;
      const k = 100;
      const c = (N + 1) / 10;
      function rhs(state) {
        const x = state[0], v = state[1];
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
      let state = [0.1, 0];
      const h = 0.001;
      const T = 3.0;
      const steps = Math.floor(T / h);
      let prev_v = 0;
      let crossedZero = false;
      let firstPositivePeakAfterCross = null;
      for (let i = 1; i <= steps; i++) {
        state = rk4(state, h);
        if (!crossedZero && state[0] < 0) crossedZero = true;
        if (crossedZero && state[0] > 0 && prev_v > 0 && state[1] <= 0) {
          firstPositivePeakAfterCross = state[0];
          break;
        }
        prev_v = state[1];
      }
      return { expected: firstPositivePeakAfterCross || 0 };
    },
  },
  c12: {
    modul: 3, parametric: true, points: 4, tolerance: 0.005,
    compute: (N) => {
      const zeta_true = (N + 1) / 200;
      const wn = 10;
      const wd = wn * Math.sqrt(1 - zeta_true * zeta_true);
      const Td = 2 * Math.PI / wd;
      const delta_expected = zeta_true * wn * Td;
      const zeta_est = delta_expected / Math.sqrt(4 * Math.PI * Math.PI + delta_expected * delta_expected);
      return { expected: zeta_est };
    },
  },
  c13: {
    modul: 4, parametric: true, points: 4, tolerance: 0.5,
    compute: (N) => {
      const f1 = N + 1;
      return { expected: f1 };
    },
  },
  c14: {
    modul: 4, parametric: true, points: 4, tolerance: 0.05,
    compute: (N) => {
      const m = 1;
      const k = 100;
      const c = (N + 1) / 10;
      const wn = Math.sqrt(k / m);
      const zeta = c / (2 * Math.sqrt(m * k));
      const r_peak = Math.sqrt(1 - 2 * zeta * zeta);
      const omega_peak = r_peak * wn;
      return { expected: omega_peak };
    },
  },
  c15: {
    modul: 5, parametric: true, points: 4, tolerance: 50,
    compute: (N) => {
      const m = 50;
      const omega_ex = N + 1;
      const TR_target = 0.10;
      const zeta = 0.05;
      let omega_n_max = 0;
      for (let wn_test = 0.01; wn_test < omega_ex; wn_test += 0.01) {
        const r = omega_ex / wn_test;
        const tr = Math.sqrt((1 + Math.pow(2 * zeta * r, 2)) / (Math.pow(1 - r * r, 2) + Math.pow(2 * zeta * r, 2)));
        if (tr <= TR_target) {
          omega_n_max = wn_test;
        }
      }
      const k_max = m * omega_n_max * omega_n_max;
      return { expected: k_max };
    },
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Cari definisi soal berdasarkan qId. Return undefined jika tidak ada.
 * Struktur internal di-merge dengan flag `type` (tf/mc/comp).
 */
function _getQuestion(qId) {
  if (TF_QUESTIONS[qId]) return Object.assign({ type: "tf", id: qId }, TF_QUESTIONS[qId]);
  if (MC_QUESTIONS[qId]) return Object.assign({ type: "mc", id: qId }, MC_QUESTIONS[qId]);
  if (COMP_EZ_QUESTIONS[qId]) return Object.assign({ type: "comp", category: "easy", id: qId }, COMP_EZ_QUESTIONS[qId]);
  if (COMP_HARD_QUESTIONS[qId]) return Object.assign({ type: "comp", category: "hard", id: qId }, COMP_HARD_QUESTIONS[qId]);
  return undefined;
}

/**
 * Return metadata soal yang AMAN untuk client (tidak ada answer/correctIdx/expected).
 * Format: { id, type, modul, points, category?, parametric, tolerance? }
 */
function getQuestionMeta(qId) {
  const q = _getQuestion(qId);
  if (!q) return undefined;
  const meta = { id: q.id, type: q.type, modul: q.modul, points: q.points, parametric: !!q.parametric };
  if (q.category) meta.category = q.category;
  if (q.type === "comp") meta.tolerance = q.tolerance;
  return meta;
}

/**
 * Untuk MC parametric: return label-only array dalam urutan SHUFFLED.
 * Untuk MC non-parametric: return options apa adanya.
 * Untuk non-MC: return undefined (caller harus cek type dulu).
 *
 * Shuffle deterministik berdasarkan N + shuffleOffset → konsisten antar request
 * untuk mahasiswa sama.
 */
function getMCOptions(qId, N) {
  const q = _getQuestion(qId);
  if (!q || q.type !== "mc") return undefined;
  if (!q.parametric) return q.options.slice();
  const result = q.compute(N);
  const shuffled = shuffleSeed(result.opts, N + (q.shuffleOffset || 0));
  return shuffled.map((o) => o.lbl);
}

/**
 * Verifikasi jawaban mahasiswa.
 *
 * @param {string} qId
 * @param {number} N - parameter dari NIM (0..99)
 * @param {*} userAnswer
 *        - TF: boolean
 *        - MC: number (index 0..3 dalam SHUFFLED order yang dilihat mahasiswa)
 *        - Comp: number (nilai numerik hasil komputasi)
 * @returns {{correct: boolean, points: number} | {error: string}}
 */
function verifyAnswer(qId, N, userAnswer) {
  const q = _getQuestion(qId);
  if (!q) return { error: "unknown-question" };

  if (q.type === "tf") {
    const expected = q.parametric ? q.compute(N).answer : q.answer;
    const got = (userAnswer === true || userAnswer === "true" || userAnswer === 1);
    const correct = (got === expected);
    return { correct, points: correct ? q.points : 0 };
  }

  if (q.type === "mc") {
    const idx = Number(userAnswer);
    if (!Number.isInteger(idx) || idx < 0 || idx > 3) {
      return { error: "invalid-mc-index" };
    }
    let correctIdxInShuffled;
    if (!q.parametric) {
      correctIdxInShuffled = q.correctIdx;
    } else {
      const result = q.compute(N);
      const shuffled = shuffleSeed(result.opts, N + (q.shuffleOffset || 0));
      correctIdxInShuffled = shuffled.findIndex((o) => o.v === result.correctV);
    }
    const correct = (idx === correctIdxInShuffled);
    return { correct, points: correct ? q.points : 0 };
  }

  if (q.type === "comp") {
    const got = Number(userAnswer);
    if (!Number.isFinite(got)) {
      return { correct: false, points: 0 };
    }
    const expected = q.compute(N).expected;
    const tol = q.tolerance;
    const correct = Math.abs(got - expected) <= tol;
    return { correct, points: correct ? q.points : 0 };
  }

  return { error: "unknown-type" };
}

/**
 * Untuk audit/debug: list semua qId yang terdaftar.
 */
function listAllQuestionIds() {
  return [
    ...Object.keys(TF_QUESTIONS),
    ...Object.keys(MC_QUESTIONS),
    ...Object.keys(COMP_EZ_QUESTIONS),
    ...Object.keys(COMP_HARD_QUESTIONS),
  ];
}

/**
 * Total skor maksimum exam (untuk konversi ke skala 100).
 */
const SCORE_TOTAL = 70;

module.exports = {
  getNFromNim,
  getQuestionMeta,
  getMCOptions,
  verifyAnswer,
  listAllQuestionIds,
  SCORE_TOTAL,
  // Diekspos untuk testing — JANGAN dipakai di production paths kecuali verifyAnswer.
  _internal: { shuffleSeed, TF_QUESTIONS, MC_QUESTIONS, COMP_EZ_QUESTIONS, COMP_HARD_QUESTIONS },
};
