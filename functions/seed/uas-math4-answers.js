/* eslint-disable max-len */
/**
 * Engineering Mathematics UAS — answer-key metadata (45 soal / 70 poin).
 *
 * SUMBER KEBENARAN: cermin rumus dari `Engineering-Mathematics/Exam/UAS.html`
 * (UAS_TF, UAS_MC, UAS_COMP_EZ, UAS_COMP_HARD).
 *
 * Setiap entry hanya berisi data yang dibutuhkan server untuk validasi
 * (type/answer/correctIdx/tolerance/points/allowPartial/partialPoints/explain).
 * TEXT soal, hint, options, dan diagram TIDAK disertakan — itu tetap di client HTML.
 *
 * Format entry: lihat uas-getaran-answers.js (struktur identik).
 *
 * CATATAN UAS Math4 vs UTS Math4:
 *   - UAS MC TIDAK shuffle options (lihat UAS.html line 7443-7450 — `shuffleMCOptions`
 *     no-op untuk UAS). Renderer (line 2813-2815) langsung pakai `q.correctIdx` /
 *     `data.correctIdx`. Helper `mcShuffledIdx` tetap di-export utk compatibility
 *     dgn UTS seed signature, tapi TIDAK dipakai di file ini.
 *   - Source UAS.html pakai field name `correct:` (bukan `correctIdx:`) untuk MC,
 *     tetapi renderer baca `q.correctIdx` — quirk source. Di seed ini kami pakai
 *     `correctIdx:` (konvensi konsisten dgn TF `answer:` / Comp `expected:`).
 *   - Source UAS.html pakai field name `expected` untuk Comp (sama dgn UTS).
 *     Di seed ini juga dipertahankan `expected` agar match source.
 *   - Source TF/MC pakai `id` (bukan `qId`); di seed ini kami pakai `qId`
 *     mengikuti konvensi seed lain (uas-getaran/uas-optoauto/uts-math4).
 *   - Comp EZ id: c1..c10, Comp HARD id: c11..c15.
 *   - Comp HARD source TIDAK punya `allowPartial`; kami enable `allowPartial=true` +
 *     `partialPoints=1` sesuai konvensi seed lain (server-side policy).
 *   - Beberapa parametric Comp di source pakai `tolerance` di dalam compute()
 *     return value (varies per N case). Di seed ini kami expose `tolerance` di
 *     level entry (nilai dari source — sama untuk semua N karena tolerance hardcoded).
 *
 * ⚠ PENTING: kalau definisi soal di UAS.html berubah, file ini WAJIB di-update.
 */

// Sync dengan `shuffleSeed()` di Engineering-Mathematics/Exam/UAS.html line 1667-1676.
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
// (Tidak dipakai untuk UAS Math4 — disediakan agar konsisten dgn UTS Math4 seed signature.)
function mcShuffledIdx(opts, correctValue, seed) {
  const shuffled = shuffleSeed(opts, seed);
  return shuffled.findIndex((o) => o.v === correctValue);
}

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN A — TRUE / FALSE (10 soal × 1 poin = 10 poin)
// Cakupan: Modul 8 (PD Non-Homogen), 9 (Reduksi Orde), 10-11 (Laplace),
//          12 (Heaviside), 13 (Pecahan Parsial), 14 (Fourier).
// ─────────────────────────────────────────────────────────────────────────────
const TF = [
  { qId: "tf1", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 8 — Superposition principle untuk PD linier. y_h = αy₁+βy₂ (basis solutions), y_p ditemukan via Undetermined Coefficients atau Variation of Parameters." },

  { qId: "tf2", type: "tf", points: 1, parametric: true,
    compute: (N) => {
      // y'' + 2y' + y = e^x → trial y_p = A·e^x. Substitute: A + 2A + A = 1 → A = 1/4
      const proposed = (N % 4 === 0) ? 1/4 : 1/2;
      return {
        answer: Math.abs(proposed - 0.25) < 0.001,
        explain: `y_p = A·e^x → y_p' = A·e^x, y_p'' = A·e^x. Substitute: A + 2A + A = 1 → 4A = 1 → A = <b>0.25</b>. ${Math.abs(proposed-0.25)<0.001 ? "BENAR" : "SALAH"}.`,
      };
    } },

  { qId: "tf3", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 9 — Reduction of Order: dari 1 solusi y₁, derive y₂ via Abel formula. Wronskian W = y₁y₂' - y₂y₁' = C·e^(-∫p dx)." },

  { qId: "tf4", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 10 — Derivative theorem: L{f'} = sF - f(0). Untuk orde 2: L{f''} = s²F - sf(0) - f'(0). Mengubah PD menjadi persamaan aljabar." },

  { qId: "tf5", type: "tf", points: 1, parametric: true,
    compute: (N) => {
      // L{e^at} = 1/(s-a). Statement always true (a parametric, no contradiction in question).
      const a = 1 + (N % 5);
      return {
        answer: true,
        explain: `Modul 10 — Basic Laplace pair: L{e^(${a}t)} = 1/(s-${a}) untuk Re(s) > ${a}. BENAR.`,
      };
    } },

  { qId: "tf6", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 11 — Workflow: PD → algebra di s-domain → Y(s) = ... → L⁻¹{Y(s)} = y(t). Tidak butuh integrating factor atau eigenvalue." },

  { qId: "tf7", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 12 — Heaviside u(t-a) → e^(-as)/s. Second shift theorem critical untuk piecewise functions." },

  { qId: "tf8", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 13 — Cover-up (Heaviside) method: A = 1/((s-1)(s-2)) at s=1 = 1/(1-2) = -1. B at s=2 = 1/(2-1) = 1. Inverse: -e^t + e^(2t)." },

  { qId: "tf9", type: "tf", points: 1, parametric: true,
    compute: (N) => {
      const a = 2 + (N % 4);
      const b = 6 + (N % 3);
      const A = 1 / (a - b);
      const B = 1 / (b - a);
      const correct_A = Math.abs(A) < 0.5;
      return {
        answer: correct_A,
        explain: `Cover-up: A = 1/(${a}-${b}) = ${A.toFixed(4)}, B = 1/(${b}-${a}) = ${B.toFixed(4)}. |A| = ${Math.abs(A).toFixed(4)} ${correct_A ? "< 0.5 (BENAR)" : "≥ 0.5 (SALAH)"}.`,
      };
    } },

  { qId: "tf10", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 14 — Square wave odd function → only sin terms. Konvergen lambat (1/n decay). Gibbs phenomenon di diskontinuitas." },
];

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN B — PILIHAN GANDA (20 soal × 1 poin = 20 poin)
// UAS Math4 MC TIDAK shuffle (shuffleMCOptions = no-op). correctIdx langsung
// dari posisi opsi di source array (field source: `correct:`).
// ─────────────────────────────────────────────────────────────────────────────
const MC = [
  { qId: "mc1", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Resonansi: r(x)=sin(2x) sama dengan y_h (akar ±2i). Multiply trial dengan x → y_p = x·(A sin 2x + B cos 2x)." },

  { qId: "mc2", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "VoP: y_p = u₁(x)y₁ + u₂(x)y₂, u_i' ditemukan dari sistem 2 persamaan. Berlaku untuk SEMBARANG r(x). UC hanya untuk r(x) tipe khusus." },

  { qId: "mc3", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      // y'' - y = e^x → resonance, y_p = (1/2)·x·e^x. Source hardcodes correct: 1.
      return {
        correctIdx: 1,
        explain: `y_p' = A(e^x + xe^x), y_p'' = A(2e^x + xe^x). Substitute: A(2e^x + xe^x) - A·xe^x = e^x → 2A·e^x = e^x → <b>A = 0.5</b>`,
      };
    } },

  { qId: "mc4", type: "mc", points: 1, parametric: false,
    correctIdx: 0,
    explain: "Inverse operator dengan resonance: 1/(D-a)·e^(ax) = x·e^(ax). Tanpa resonance: 1/(D-b)·e^(ax) = e^(ax)/(a-b)." },

  { qId: "mc5", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "e^(2x)·cos(3x) di-annihilate oleh (D-2-3i)(D-2+3i) = D² - 4D + 4 + 9 = D² - 4D + 13." },

  { qId: "mc6", type: "mc", points: 1, parametric: false,
    correctIdx: 2,
    explain: "Basic Laplace pair: L{cos(ωt)} = s/(s²+ω²), L{sin(ωt)} = ω/(s²+ω²)." },

  { qId: "mc7", type: "mc", points: 1, parametric: false,
    correctIdx: 2,
    explain: "Shift di t-domain → shift di s-domain: L{e^(at)·f(t)} = F(s-a). Dipakai untuk damping problems." },

  { qId: "mc8", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const a = 2 + (N % 5);
      return {
        correctIdx: 0,
        explain: `First shift: L{e^(at)·sin(ωt)} = ω/((s-a)² + ω²) = <b>3/((s-${a})² + 9)</b>`,
      };
    } },

  { qId: "mc9", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "L{y''} = s²Y - sy(0) - y'(0) = s²Y - s. So s²Y - s + Y = 0 → Y(s²+1) = s → Y = s/(s²+1) → y = cos(t)." },

  { qId: "mc10", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "L⁻¹{F(s)·G(s)} = (f*g)(t). Powerful untuk inverse Laplace yang sulit dipisah ke pecahan parsial." },

  { qId: "mc11", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const y0 = 1 + (N % 5);
      return {
        correctIdx: 0,
        explain: `L: sY - ${y0} + 2Y = 0 → Y = ${y0}/(s+2) → y(t) = <b>${y0}·e^(-2t)</b>`,
      };
    } },

  { qId: "mc12", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Unit step function: L{u(t-a)} = e^(-as)/s. Untuk a=3: e^(-3s)/s." },

  { qId: "mc13", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "L{δ(t-a)} = e^(-as). Tanpa /s seperti unit step. Untuk impulsive forcing (palu, kejutan)." },

  { qId: "mc14", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const a = 1 + (N % 4);
      return {
        correctIdx: 0,
        explain: `Second shift: L{u(t-a)·f(t-a)} = e^(-as)·F(s). f(t)=t² → F(s)=2/s³. Result: <b>e^(-${a}s)·2/s³</b>`,
      };
    } },

  { qId: "mc15", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Cover-up: A=1/(1+1)=1/2 di s=1, B=1/(-1-1)=-1/2 di s=-1. So 1/(s²-1) = 1/2·[1/(s-1) - 1/(s+1)]." },

  { qId: "mc16", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const a = 2 + (N % 4);
      const A = 1/a;
      return {
        correctIdx: 3,
        explain: `Cover-up at s=0: A = 1/(0+${a}) = <b>1/${a} = ${A.toFixed(4)}</b>`,
      };
    } },

  { qId: "mc17", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Fungsi ganjil (f(-x) = -f(x)): cos symmetric → aₙ = 0. Hanya sin (bₙ). Sebaliknya, fungsi genap: hanya cos." },

  { qId: "mc18", type: "mc", points: 1, parametric: false,
    correctIdx: 2,
    explain: "Square wave: bₙ = (4/(nπ)) untuk n ganjil. b₁ = <b>4/π</b> ≈ 1.273. Decay 1/n untuk diskontinuitas." },

  { qId: "mc19", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Gibbs: di diskontinuitas, partial sum overshoot ~8.95% dari jump magnitude. Tidak hilang meskipun N → ∞ (tetapi width zone shrinks)." },

  { qId: "mc20", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const n = 1 + 2*(N % 5);
      const b_n = 4 / (n * Math.PI);
      const correctIdx = b_n > 1 ? 0 : (b_n > 0.4 ? 1 : (b_n > 0.2 ? 2 : 3));
      return {
        correctIdx,
        explain: `b_${n} = 4/(${n}·π) = ${b_n.toFixed(4)} → ${["> 1", "0.4-1", "0.2-0.4", "< 0.2"][correctIdx]}`,
      };
    } },
];

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN C — KOMPUTASI EASY/MEDIUM (10 soal × 2 poin = 20 poin)
// Semua parametric. Field `expected` mirror source UAS.html.
// ─────────────────────────────────────────────────────────────────────────────
const COMP_EZ = [
  { qId: "c1", type: "comp", points: 2, parametric: true, tolerance: 0.001,
    compute: (N) => {
      const a = 2 + (N % 5);
      const A = a / 9;
      return {
        expected: parseFloat(A.toFixed(4)),
        explain: `(D² + 4D + 4)·Ae^x = A(1+4+4)·e^x = 9A·e^x. Set = ${a}·e^x → A = ${a}/9 = <b>${A.toFixed(4)}</b>`,
      };
    } },

  { qId: "c2", type: "comp", points: 2, parametric: true, tolerance: 0.001,
    compute: (N) => {
      // SOURCE FIX: (N%4)+2 → (N%3)+2 utk hindari divergence 1/0 saat a=b=5
      const a = 2 + (N % 3);
      const b = 5;
      const result = 1 / (b - a);
      return {
        expected: parseFloat(result.toFixed(4)),
        explain: `1/(D-${a})·e^(${b}x) = e^(${b}x)/(${b}-${a}) = (1/${b-a})·e^(${b}x) = <b>${result.toFixed(4)}·e^(${b}x)</b>`,
      };
    } },

  { qId: "c3", type: "comp", points: 2, parametric: true, tolerance: 0.001,
    compute: (N) => {
      const a = 1 + (N % 5);
      const s_eval = a + 2;
      const value = 1 / Math.pow(s_eval - a, 2);
      return {
        expected: parseFloat(value.toFixed(4)),
        explain: `F(s) = 1/(s-${a})². At s=${s_eval}: F = 1/(${s_eval}-${a})² = 1/${(s_eval-a)**2} = <b>${value.toFixed(4)}</b>`,
      };
    } },

  { qId: "c4", type: "comp", points: 2, parametric: true, tolerance: 0.001,
    compute: (N) => {
      const omega = 1 + (N % 5);
      const s_eval = omega;
      const value = s_eval / (s_eval*s_eval + omega*omega);
      return {
        expected: parseFloat(value.toFixed(4)),
        explain: `F(${omega}) = ${omega}/(${omega}²+${omega}²) = ${omega}/(${2*omega*omega}) = <b>${value.toFixed(4)}</b>`,
      };
    } },

  { qId: "c5", type: "comp", points: 2, parametric: true, tolerance: 0.005,
    compute: (N) => {
      const y0 = 1 + (N % 5);
      const value = y0 * Math.exp(-3);
      return {
        expected: parseFloat(value.toFixed(4)),
        explain: `L: sY - ${y0} + 3Y = 0 → Y = ${y0}/(s+3) → y(t) = ${y0}·e^(-3t). y(1) = ${y0}·e^(-3) = <b>${value.toFixed(4)}</b>`,
      };
    } },

  { qId: "c6", type: "comp", points: 2, parametric: true, tolerance: 0.001,
    compute: (N) => {
      const a = 1 + (N % 4);
      const value = Math.exp(-a) / 2;
      return {
        expected: parseFloat(value.toFixed(4)),
        explain: `L{u(t-a)·f(t-a)} = e^(-as)·F(s). f=sin → F=1/(s²+1). At s=1: e^(-${a})/2 = <b>${value.toFixed(4)}</b>`,
      };
    } },

  { qId: "c7", type: "comp", points: 2, parametric: true, tolerance: 0.001,
    compute: (N) => {
      // SOURCE FIX: (N%4)+2 → (N%3)+2 utk hindari divergence 1/0 saat a=b=5
      const a = 2 + (N % 3);
      const A = 1 / (a - 5);
      return {
        expected: parseFloat(A.toFixed(4)),
        explain: `Cover-up at s=${a}: A = 1/(${a}-5) = 1/${a-5} = <b>${A.toFixed(4)}</b>`,
      };
    } },

  { qId: "c8", type: "comp", points: 2, parametric: true, tolerance: 0.05,
    compute: (N) => {
      const a = 2 + (N % 5);
      const A = a - 1;
      return {
        expected: A,
        explain: `Cover-up at s=-1: A = (s+${a})/(s+2) at s=-1 = (-1+${a})/(-1+2) = ${A}/1 = <b>${A}</b>`,
      };
    } },

  { qId: "c9", type: "comp", points: 2, parametric: true, tolerance: 0.001,
    compute: (N) => {
      const n = 1 + 2*(N % 5);
      const bn = 4 / (n * Math.PI);
      return {
        expected: parseFloat(bn.toFixed(4)),
        explain: `b_${n} = 4/(${n}·π) = 4/${(n*Math.PI).toFixed(4)} = <b>${bn.toFixed(4)}</b>`,
      };
    } },

  { qId: "c10", type: "comp", points: 2, parametric: true, tolerance: 0.0001,
    compute: (N) => {
      const n = 1 + 2*(N % 5);
      const an = 4 / (n*n * Math.PI * Math.PI);
      return {
        expected: parseFloat(an.toFixed(5)),
        explain: `a_${n} = 4/(${n}²·π²) = 4/(${(n*n).toFixed(0)}·${(Math.PI*Math.PI).toFixed(4)}) = <b>${an.toFixed(5)}</b>`,
      };
    } },
];

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN D — KOMPUTASI HARD (5 soal × 4 poin = 20 poin)
// Semua parametric. allowPartial=true → partial credit +1 (server policy).
// ─────────────────────────────────────────────────────────────────────────────
const COMP_HARD = [
  { qId: "c11", type: "comp", points: 4, parametric: true, tolerance: 0.005,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const x = (N % 10) * 0.05 + 0.1;
      const yp = Math.cos(x) * Math.log(Math.abs(Math.cos(x))) + x * Math.sin(x);
      return {
        expected: parseFloat(yp.toFixed(4)),
        explain: `y_p(${x.toFixed(2)}) = cos(${x.toFixed(2)})·ln|cos(${x.toFixed(2)})| + ${x.toFixed(2)}·sin(${x.toFixed(2)}) = <b>${yp.toFixed(4)}</b>`,
      };
    } },

  { qId: "c12", type: "comp", points: 4, parametric: true, tolerance: 0.005,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const a = 1 + (N % 5);
      const b = 2 + (N % 4);
      const t = 0.5;
      const y_t = a * Math.cos(2*t) + (b/2) * Math.sin(2*t);
      return {
        expected: parseFloat(y_t.toFixed(4)),
        explain: `y(0.5) = ${a}·cos(1) + ${b/2}·sin(1) = ${a}·${Math.cos(1).toFixed(4)} + ${b/2}·${Math.sin(1).toFixed(4)} = <b>${y_t.toFixed(4)}</b>`,
      };
    } },

  { qId: "c13", type: "comp", points: 4, parametric: true, tolerance: 0.001,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const a = 1 + (N % 4);
      const t = a + 0.5;
      const value = Math.sin(t - a);
      return {
        expected: parseFloat(value.toFixed(4)),
        explain: `t = ${t} > ${a}, so u(t-${a}) = 1. Result = sin(${t}-${a}) = sin(${(t-a).toFixed(1)}) = <b>${value.toFixed(4)}</b>`,
      };
    } },

  { qId: "c14", type: "comp", points: 4, parametric: true, tolerance: 0.001,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const a = 1 + (N % 3);
      const b = 5 + (N % 2);
      const A_val = 1 / (a - b);
      return {
        expected: parseFloat(A_val.toFixed(4)),
        explain: `A = lim_(s→${a}) (s-${a})²·F(s) = 1/(${a}-${b}) = 1/${a-b} = <b>${A_val.toFixed(4)}</b>`,
      };
    } },

  { qId: "c15", type: "comp", points: 4, parametric: true, tolerance: 0.005,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const x = Math.PI / 4 + (N % 4) * 0.05;
      let sum = 0;
      for (let n = 1; n <= 9; n += 2) {
        sum += (4/(n*Math.PI)) * Math.sin(n*x);
      }
      return {
        expected: parseFloat(sum.toFixed(4)),
        explain: `Sum = Σ (4/(nπ))·sin(${x.toFixed(4)}·n) for n=1,3,5,7,9 = <b>${sum.toFixed(4)}</b> (mendekati 1, square wave value)`,
      };
    } },
];

// ─────────────────────────────────────────────────────────────────────────────
// Export gabungan + ringkasan
// ─────────────────────────────────────────────────────────────────────────────
const UAS_QUESTIONS = [...TF, ...MC, ...COMP_EZ, ...COMP_HARD];

const SUMMARY = {
  examId: "math4-uas",
  totalSoal: UAS_QUESTIONS.length,                                       // 45
  totalPoin: UAS_QUESTIONS.reduce((s, q) => s + q.points, 0),            // 70
  breakdown: { tf: 10, mc: 20, compEz: 10, compHard: 5 },
  parametricCount: UAS_QUESTIONS.filter((q) => q.parametric).length,
};

module.exports = { UAS_QUESTIONS, SUMMARY, shuffleSeed, mcShuffledIdx };
