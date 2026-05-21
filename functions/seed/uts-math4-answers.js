/* eslint-disable max-len */
/**
 * Engineering Mathematics UTS — answer-key metadata (45 soal / 70 poin).
 *
 * SUMBER KEBENARAN: cermin rumus dari `Engineering-Mathematics/Exam/UTS.html`
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
 *   - Parametric MC source pakai `shuffleSeed(opts, N + 100·k)` (offset
 *     berbeda-beda per soal: mc3→100, mc6→200, mc8→300, mc11→400,
 *     mc14→500, mc16→600, mc18→700). mc20 parametric tapi TIDAK pakai
 *     shuffle (opsi fixed-order kategorikal).
 *   - Source TF/MC pakai `id` (bukan `qId`); di seed ini kami pakai `qId`
 *     mengikuti konvensi uts-getaran/uts-optoauto.
 *   - Comp EZ id: c1..c10, Comp HARD id: c11..c15 (sama seperti UTS Getaran).
 *   - Comp HARD source TIDAK punya `allowPartial` (cuma komentar header
 *     "5 soal × 4 poin = 20 poin"). Kami enable `allowPartial=true` +
 *     `partialPoints=1` sesuai konvensi seed lain (server-side policy).
 *
 * ⚠ PENTING: kalau definisi soal di UTS.html berubah, file ini WAJIB di-update.
 */

// Sync dengan `shuffleSeed()` di Engineering-Mathematics/Exam/UTS.html line 1667-1676.
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
    explain: "Modul 1 — Linieritas: y, y', y'' berderajat 1, koefisien (1, 3, 2) konstan. Suku sin(x) di ruas kanan tidak mengubah linieritas (hanya membuat non-homogen)." },

  { qId: "tf2", type: "tf", points: 1, parametric: false,
    answer: false,
    explain: "Modul 1 — Pangkat y' adalah 2 (bukan 1), sehingga <b>non-linier</b>. Definisi linier: setiap turunan dan fungsi y berderajat 1, tanpa produk antar turunan/fungsi." },

  { qId: "tf3", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 2 — Pemisahan: dy/y = x dx → ln|y| = x²/2 + C → y = C·e^(x²/2)." },

  { qId: "tf4", type: "tf", points: 1, parametric: true,
    compute: (N) => {
      const T0 = N + 50;
      const Tm = 20;
      const k = 0.05;
      const t = 15;
      const T = Tm + (T0 - Tm) * Math.exp(-k * t);
      return {
        answer: T < 55,
        explain: `T(15) = T_m + (T₀ - T_m)·e^(-k·t) = 20 + (${T0}-20)·e^(-0.05·15) = 20 + ${(T0-20).toFixed(0)}·${Math.exp(-0.75).toFixed(4)} = <b>${T.toFixed(2)}°C</b> ${T < 55 ? "< 55 → BENAR" : "≥ 55 → SALAH"}`,
      };
    } },

  { qId: "tf5", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 3 — f(αx, αy) = α³x³ - 2αx·α²y² + α³y³ = α³(x³-2xy²+y³) = α³·f(x,y) → derajat 3. Jika g juga derajat 3, PD = homogen → substitusi y=ux." },

  { qId: "tf6", type: "tf", points: 1, parametric: true,
    compute: (N) => {
      const a = (N % 2 === 0) ? 2 : (N % 3 === 0 ? 4 : 3);
      const isExact = (a === 2);
      return {
        answer: isExact,
        explain: `M = ${a}xy + 1 → ∂M/∂y = ${a}x; N = x²+5 → ∂N/∂x = 2x. ${isExact ? "Sama (a=2): EKSAK ✓" : `${a}x ≠ 2x: BUKAN EKSAK ✗ (BENAR jawab False)`}`,
      };
    } },

  { qId: "tf7", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 4 — Substitusi standar Bernoulli: z = y^(1-n) → dz/dx = (1-n)y^(-n) dy/dx, hasilnya PD linier dalam z." },

  { qId: "tf8", type: "tf", points: 1, parametric: true,
    compute: (N) => {
      const P = (N + 1) / 10;
      const Q = 5;
      const y_ss = Q / P;
      return {
        answer: y_ss > 10,
        explain: `y_ss = Q/P = 5/${P.toFixed(2)} = <b>${y_ss.toFixed(3)}</b> ${y_ss > 10 ? "> 10 → BENAR" : "≤ 10 → SALAH"}`,
      };
    } },

  { qId: "tf9", type: "tf", points: 1, parametric: false,
    answer: true,
    explain: "Modul 5 — Diskriminan = 16 - 16 = 0 → akar berulang r = -2. Untuk akar berulang, solusi umum berbentuk (C₁ + C₂x)·e^(rx)." },

  { qId: "tf10", type: "tf", points: 1, parametric: true,
    compute: (N) => {
      const b = (N + 1) / 5;
      const c = 10;
      const disc = b*b - 4*c;
      const isUnderdamped = disc < 0;
      return {
        answer: isUnderdamped,
        explain: `Diskriminan = b² - 4c = ${b.toFixed(2)}² - 40 = <b>${disc.toFixed(2)}</b>. ${isUnderdamped ? "< 0 → kompleks (underdamped) → BENAR" : (disc > 0 ? "> 0 → real berbeda (overdamped) → SALAH" : "= 0 → real berulang (critically damped) → SALAH")}`,
      };
    } },
];

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN B — PILIHAN GANDA (20 soal × 1 poin = 20 poin)
// Parametric MC pakai shuffleSeed dengan offset berbeda per soal:
//   mc3→N+100, mc6→N+200, mc8→N+300, mc11→N+400, mc14→N+500, mc16→N+600,
//   mc18→N+700. mc20 parametric tapi TIDAK shuffle (kategorikal fixed-order).
// ─────────────────────────────────────────────────────────────────────────────
const MC = [
  { qId: "mc1", type: "mc", points: 1, parametric: false,
    correctIdx: 2,
    explain: "Orde = pangkat turunan tertinggi. Turunan tertinggi adalah d³y/dx³ → orde 3. (Catatan: derajat PD ini adalah 1 karena d³y/dx³ berpangkat 1.)" },

  { qId: "mc2", type: "mc", points: 1, parametric: false,
    correctIdx: 2,
    explain: "PDE = melibatkan turunan parsial (∂) terhadap ≥ 2 variabel bebas. Opsi C adalah persamaan panas (heat equation). Opsi A, B, D semua ODE." },

  { qId: "mc3", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const a = (N + 1) / 10;
      const correct = a;
      const opts = [
        { v: correct },
        { v: correct * correct },
        { v: 1/correct },
        { v: -correct },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N + 100),
        explain: `y = e^(a·x) → dy/dx = a·e^(a·x) = a·y → (dy/dx)/y = a = <b>${a.toFixed(2)}</b>. Verifikasi solusi PD y' = a·y.`,
      };
    } },

  { qId: "mc4", type: "mc", points: 1, parametric: false,
    correctIdx: 0,
    explain: "Solusi umum mengandung konstanta sembarang (C, C₁, C₂...) yang nilainya ditentukan dari syarat awal/batas. Solusi khusus = solusi umum dengan C tertentu yang memenuhi IC." },

  { qId: "mc5", type: "mc", points: 1, parametric: false,
    correctIdx: 2,
    explain: "Opsi C: ekspresi (x+y)/(x-y) tidak dapat dipisahkan menjadi bentuk g(x)·h(y) — ini adalah PD homogen, butuh substitusi y=ux. Opsi A, B, D semua dapat dipisahkan." },

  { qId: "mc6", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const k = (N + 1) / 100;
      const y10 = 5 * Math.exp(10 * k);
      const correct = y10;
      const opts = [
        { v: correct },
        { v: 5 + 10*k },
        { v: 5 * Math.exp(k) },
        { v: 5 / Math.exp(10*k) },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N + 200),
        explain: `y = 5·e^(k·t); y(10) = 5·e^(${k.toFixed(3)}·10) = 5·e^${(10*k).toFixed(3)} = <b>${correct.toFixed(3)}</b>`,
      };
    } },

  { qId: "mc7", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "N(t) = N₀·e^(-λt). Half-life: N(t_½) = N₀/2 → e^(-λ·t_½) = 1/2 → -λ·t_½ = -ln(2) → <b>t_½ = ln(2)/λ ≈ 0.693/λ</b>." },

  { qId: "mc8", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const r = 0.5;
      const K = (N + 1) * 100;
      const N0 = 10;
      const correct = K;
      const opts = [
        { v: correct },
        { v: K/2 },
        { v: K*r },
        { v: N0*K },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N + 300),
        explain: `Steady state: dN/dt = 0 → r·N·(1-N/K) = 0 → N=0 atau N=K. Karena N₀=10>0, populasi konvergen ke <b>K = ${K}</b>.`,
      };
    } },

  { qId: "mc9", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "PD homogen: substitusi y = ux mereduksi ke variabel terpisah. Aturan rantai: dy/dx = d(ux)/dx = u + x·du/dx." },

  { qId: "mc10", type: "mc", points: 1, parametric: false,
    correctIdx: 0,
    explain: "Cek eksak: M_y = 2x = N_x ✓. Integralkan M dx: F = x²y + x³ + g(y). F_y = x² + g'(y) = N = x² + 2y → g'(y) = 2y → g = y². Solusi: x²y + x³ + y² = C." },

  { qId: "mc11", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const a = (N % 4) + 2;
      const correct = a;
      const opts = [
        { v: correct },
        { v: correct - 1 },
        { v: correct + 1 },
        { v: 2*correct },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N + 400),
        explain: `f(αx, αy) = (αx)^${a} + (αy)^${a} = α^${a}(x^${a} + y^${a}) = α^${a}·f(x,y) → derajat = <b>${a}</b>`,
      };
    } },

  { qId: "mc12", type: "mc", points: 1, parametric: false,
    correctIdx: 2,
    explain: "Solusi PD eksak adalah F(x,y) = C (kontur fungsi potensial F). Opsi B salah karena syarat eksak adalah ∂M/∂y = ∂N/∂x (bukan ∂M/∂x = ∂N/∂y)." },

  { qId: "mc13", type: "mc", points: 1, parametric: false,
    correctIdx: 0,
    explain: "Faktor integrasi: μ(x) = e^(∫P dx). Setelah dikalikan, ruas kiri menjadi d(μ·y)/dx = μ·Q sehingga dapat diintegralkan langsung." },

  { qId: "mc14", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const b = N + 1;
      const y_ss = b / 2;
      const correct = y_ss;
      const opts = [
        { v: correct },
        { v: b },
        { v: 2*b },
        { v: b/4 },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N + 500),
        explain: `Saat steady-state, y' = 0 → 2y = b → y_ss = b/2 = ${b}/2 = <b>${y_ss}</b>. Solusi penuh: y(x) = (b/2)(1 - e^(-2x)).`,
      };
    } },

  { qId: "mc15", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Bernoulli y' + Py = Qy^n: substitusi z = y^(1-n). Di sini n=3 → z = y^(1-3) = y^(-2). Setelah substitusi, PD menjadi linier dalam z." },

  { qId: "mc16", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const C_uF = N + 1;
      const tau_ms = C_uF;
      const correct = tau_ms;
      const opts = [
        { v: correct },
        { v: 2*tau_ms },
        { v: tau_ms/2 },
        { v: tau_ms*0.63 },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N + 600),
        explain: `Time constant τ = R·C = 1000Ω · ${C_uF}·10⁻⁶ F = <b>${tau_ms} ms</b>. Pada t=τ, V = V_in·(1-e⁻¹) = 0.632·V_in (63.2%).`,
      };
    } },

  { qId: "mc17", type: "mc", points: 1, parametric: false,
    correctIdx: 0,
    explain: "Persamaan karakteristik: r²-5r+6=0 → (r-2)(r-3)=0 → r=2, r=3 (real berbeda). Solusi: y = C₁·e^(2x) + C₂·e^(3x)." },

  { qId: "mc18", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const omega2 = N + 1;
      const omega = Math.sqrt(omega2);
      const correct = omega;
      const opts = [
        { v: correct },
        { v: omega2 },
        { v: 2*Math.PI/omega },
        { v: omega/(2*Math.PI) },
      ];
      return {
        correctIdx: mcShuffledIdx(opts, correct, N + 700),
        explain: `Persamaan karakteristik r² + (N+1) = 0 → r = ±i·√(N+1). Solusi: y = cos(ωt) dengan ω = √(${omega2}) = <b>${omega.toFixed(3)} rad/s</b>.`,
      };
    } },

  { qId: "mc19", type: "mc", points: 1, parametric: false,
    correctIdx: 1,
    explain: "Akar berulang r=-2 (multiplisitas 2): solusi umum = (C₁ + C₂·x)·e^(rx). Faktor x diperlukan karena 2 solusi berasal dari 1 akar (2 fungsi linear independent)." },

  // mc20: parametric TAPI tanpa shuffle — opsi fixed-order kategorikal.
  { qId: "mc20", type: "mc", points: 1, parametric: true,
    compute: (N) => {
      const b = (N + 1) / 10;
      const omega_n = 10;
      const zeta = b / omega_n;
      let actualCat;
      if (zeta < 0.3) actualCat = 0;
      else if (zeta < 0.7) actualCat = 1;
      else if (zeta < 1.0) actualCat = 2;
      else actualCat = 3;
      return {
        correctIdx: actualCat,
        explain: `ζ = ${zeta.toFixed(3)} → ${zeta < 0.3 ? "Light (osilasi lama, decay lambat)" : zeta < 0.7 ? "Moderate (osilasi terlihat, decay sedang)" : zeta < 1.0 ? "Heavy underdamped (osilasi sedikit, decay cepat)" : "Overdamped (tanpa osilasi)"}`,
      };
    } },
];

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN C — KOMPUTASI EASY/MEDIUM (10 soal × 2 poin = 20 poin)
// Semua parametric. Field name `expected` mengikuti source UTS.html.
// ─────────────────────────────────────────────────────────────────────────────
const COMP_EZ = [
  { qId: "c1", type: "comp", points: 2, parametric: true, tolerance: 0.5,
    compute: (N) => {
      const orde = (N % 5) + 1;
      return { expected: orde, explain: `PD: (d^${orde}y/dx^${orde}) - 3(dy/dx)² + y = sin(x). Turunan tertinggi d^${orde}y/dx^${orde} → orde = <b>${orde}</b>` };
    } },

  { qId: "c2", type: "comp", points: 2, parametric: true, tolerance: 0.05,
    compute: (N) => {
      const a = (N + 1) / 10;
      return { expected: a, explain: `y = e^(a·x) → y' = a·e^(a·x); y'(0) = a·e⁰ = a = <b>${a.toFixed(2)}</b>` };
    } },

  { qId: "c3", type: "comp", points: 2, parametric: true, tolerance: 0.05,
    compute: (N) => {
      const k = (N + 1) / 100;
      const y5 = 5 * Math.exp(5 * k);
      return { expected: y5, explain: `y(t) = 5·e^(k·t); y(5) = 5·e^(${k.toFixed(3)}·5) = 5·e^${(5*k).toFixed(3)} = <b>${y5.toFixed(4)}</b>` };
    } },

  { qId: "c4", type: "comp", points: 2, parametric: true, tolerance: 0.1,
    compute: (N) => {
      const T0 = N + 50;
      const Tm = 20;
      const k = 0.1;
      const t = 10;
      const T = Tm + (T0 - Tm) * Math.exp(-k * t);
      return { expected: T, explain: `T(t) = T_m + (T₀ - T_m)·e^(-k·t) = 20 + (${T0}-20)·e^(-0.1·10) = 20 + ${(T0-20)}·${Math.exp(-1).toFixed(4)} = <b>${T.toFixed(3)}°C</b>` };
    } },

  { qId: "c5", type: "comp", points: 2, parametric: true, tolerance: 0.5,
    compute: (N) => {
      const a = (N % 3) + 2;
      const K = 1 - a*a;
      return { expected: K, explain: `Substitusi IC y(1)=${a} ke x²-y² = K·x: 1² - ${a}² = K·1 → K = 1 - ${a*a} = <b>${K}</b>` };
    } },

  { qId: "c6", type: "comp", points: 2, parametric: true, tolerance: 0.001,
    compute: (N) => {
      // M = 2xy + b, N = x² + 2y → M_y = 2x, N_x = 2x → selisih = 0 (selalu eksak)
      const b = N + 1;
      return { expected: 0, explain: `M = 2xy + ${b}; N = x² + 2y. ∂M/∂y = 2x; ∂N/∂x = 2x → selisih = <b>0</b> (EKSAK ✓)` };
    } },

  { qId: "c7", type: "comp", points: 2, parametric: true, tolerance: 0.05,
    compute: (N) => {
      const b = N + 1;
      const y1 = (b/2) * (1 - Math.exp(-2));
      return { expected: y1, explain: `y(x) = (b/2)·(1 - e^(-2x)); y(1) = (${b}/2)·(1 - e⁻²) = ${(b/2).toFixed(2)}·${(1-Math.exp(-2)).toFixed(4)} = <b>${y1.toFixed(4)}</b>` };
    } },

  { qId: "c8", type: "comp", points: 2, parametric: true, tolerance: 0.5,
    compute: (N) => {
      const n = (N % 4) + 2;
      const exponent = 1 - n;
      return { expected: exponent, explain: `Substitusi Bernoulli: z = y^(1-n); 1 - n = 1 - ${n} = <b>${exponent}</b>` };
    } },

  { qId: "c9", type: "comp", points: 2, parametric: true, tolerance: 0.5,
    compute: (N) => {
      const b = N + 1;
      const sumOfRoots = -b;
      return { expected: sumOfRoots, explain: `Vieta: untuk r² + b·r + c = 0, jumlah akar = -b = -${b} = <b>${sumOfRoots}</b>` };
    } },

  { qId: "c10", type: "comp", points: 2, parametric: true, tolerance: 0.02,
    compute: (N) => {
      const omega2 = N + 1;
      const omega = Math.sqrt(omega2);
      return { expected: omega, explain: `y'' + (N+1)·y = 0 → ω² = ${omega2}, ω = √${omega2} = <b>${omega.toFixed(4)} rad/s</b>` };
    } },
];

// ─────────────────────────────────────────────────────────────────────────────
// BAGIAN D — KOMPUTASI HARD (5 soal × 4 poin = 20 poin)
// Semua parametric. allowPartial=true → partial credit +1 (server policy).
// ─────────────────────────────────────────────────────────────────────────────
const COMP_HARD = [
  { qId: "c11", type: "comp", points: 4, parametric: true, tolerance: 0.05,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const a = (N + 1) / 10;
      const y2 = a * Math.exp(2);
      return { expected: y2, explain: `dy/dx = x·y, y(0)=${a.toFixed(2)} → y = a·e^(x²/2); y(2) = ${a.toFixed(2)}·e² = <b>${y2.toFixed(4)}</b>` };
    } },

  { qId: "c12", type: "comp", points: 4, parametric: true, tolerance: 0.05,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const a = N + 1;
      const b = 5;
      const F23 = 4*3 + a*2 + b*3;
      return { expected: F23, explain: `F(x,y) = x²y + a·x + b·y; F(2,3) = 4·3 + ${a}·2 + ${b}·3 = 12 + ${2*a} + 15 = <b>${F23}</b>` };
    } },

  { qId: "c13", type: "comp", points: 4, parametric: true, tolerance: 0.005,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const b = (N + 1) / 10;
      const y1 = b * (Math.exp(-1) - Math.exp(-2));
      return { expected: y1, explain: `Faktor integrasi μ=e^(2x) → y = b(e^(-x) - e^(-2x)); y(1) = ${b.toFixed(2)}·(e⁻¹-e⁻²) = ${b.toFixed(2)}·${(Math.exp(-1)-Math.exp(-2)).toFixed(4)} = <b>${y1.toFixed(5)}</b>` };
    } },

  { qId: "c14", type: "comp", points: 4, parametric: true, tolerance: 0.01,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      let y2;
      if (N === 0) {
        y2 = (1 + 2) * Math.exp(-2);
      } else {
        const sqrtN = Math.sqrt(N);
        y2 = Math.exp(-2) * (Math.cos(sqrtN * 2) + (1/sqrtN) * Math.sin(sqrtN * 2));
      }
      return {
        expected: y2,
        explain: N === 0
          ? `N=0: r = -1 (berulang) → y = (1+t)·e^(-t); y(2) = 3·e⁻² = <b>${y2.toFixed(5)}</b>`
          : `N=${N}: r = -1 ± i·√${N} → y = e^(-t)·(cos(√${N}·t) + (1/√${N})·sin(√${N}·t)); y(2) = <b>${y2.toFixed(5)}</b>`,
      };
    } },

  { qId: "c15", type: "comp", points: 4, parametric: true, tolerance: 0.005,
    allowPartial: true, partialPoints: 1,
    compute: (N) => {
      const m = 1;
      const k = 100;
      const c = (N + 1) / 10;
      const wn = Math.sqrt(k / m);
      const zeta = c / (2 * Math.sqrt(k * m));
      const wd = wn * Math.sqrt(1 - zeta * zeta);
      const A = 0.1;
      const B = (zeta * wn * A) / wd;
      const t_eval = 0.5;
      const x_t = Math.exp(-zeta * wn * t_eval) * (A * Math.cos(wd * t_eval) + B * Math.sin(wd * t_eval));
      return {
        expected: x_t,
        explain: `m=1, k=100, c=${c.toFixed(2)} → ωₙ=10, ζ=${zeta.toFixed(4)}, ω_d=${wd.toFixed(4)}; x(t) = e^(-ζωₙt)·(A·cos(ω_d·t)+B·sin(ω_d·t)), A=0.1, B=${B.toFixed(5)}; x(0.5) = <b>${x_t.toFixed(5)} m</b>`,
      };
    } },
];

// ─────────────────────────────────────────────────────────────────────────────
// Export gabungan + ringkasan
// ─────────────────────────────────────────────────────────────────────────────
const UTS_QUESTIONS = [...TF, ...MC, ...COMP_EZ, ...COMP_HARD];

const SUMMARY = {
  examId: "math4-uts",
  totalSoal: UTS_QUESTIONS.length,                                       // 45
  totalPoin: UTS_QUESTIONS.reduce((s, q) => s + q.points, 0),            // 70
  breakdown: { tf: 10, mc: 20, compEz: 10, compHard: 5 },
  parametricCount: UTS_QUESTIONS.filter((q) => q.parametric).length,
};

module.exports = { UTS_QUESTIONS, SUMMARY, shuffleSeed, mcShuffledIdx };
