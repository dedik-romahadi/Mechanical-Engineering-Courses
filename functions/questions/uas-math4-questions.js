/* eslint-disable max-len */
/**
 * Matematika 4 UAS — bank soal (teks/opsi/hint), diekstrak VERBATIM dari
 * `Engineering-Mathematics/Exam/UAS.html` (UAS_TF/UAS_MC/UAS_COMP_EZ/UAS_COMP_HARD).
 *
 * SUMBER KEBENARAN: file ini HARUS byte-identik (isi compute()/text/options)
 * dengan blok const yang sama di UAS.html — satu-satunya perbedaan adalah
 * exposure: di sini lewat module.exports (server, dibaca getExamQuestions
 * SETELAH PIN+jadwal terverifikasi), bukan window.UAS_TF (client, dulu
 * ter-embed statis & bisa dibaca via View Source sebelum jadwal buka).
 *
 * TIDAK berisi kunci jawaban (correctIdx/answer/expected) — itu tetap di
 * functions/seed/uas-math4-answers.js + Firestore examAnswers/. Lihat
 * Pedoman §40.29.
 *
 * ⚠ Kalau UAS.html diedit (soal ditambah/diubah), file ini WAJIB disamakan
 * ulang (re-extract), lalu `firebase deploy --only functions`.
 */

const UAS_TF = [
  // ── MODUL 8: PD Non-Homogen ──
  {
    id: 'tf1', modul: 8, parametric: false,
    text: "Solusi umum PD Non-Homogen y'' + py' + qy = r(x) adalah y = y_h + y_p, dengan y_h solusi homogen dan y_p solusi partikular.",
  },
  {
    id: 'tf2', modul: 8, parametric: true,
    compute: (N) => {
      // y'' + 2y' + y = e^x → trial y_p = A·e^x. Substitute: A + 2A + A = 1 → A = 1/4
      const target = 1/4;
      const proposed = (N % 4 === 0) ? 1/4 : 1/2;
      return {
        text: `Untuk PD <b>y'' + 2y' + y = e^x</b>, gunakan Undetermined Coefficients dengan y_p = A·e^x. Apakah nilai A = <b>${proposed.toFixed(2)}</b>?`,
      };
    }
  },
  // ── MODUL 9: Reduksi Orde ──
  {
    id: 'tf3', modul: 9, parametric: false,
    text: "Method of Reduction of Order: jika y₁ solusi PD orde 2 homogen, maka y₂ = y₁·∫(e^(-∫p dx)/y₁²) dx adalah solusi independen kedua.",
  },
  // ── MODUL 10: Laplace Transform ──
  {
    id: 'tf4', modul: 10, parametric: false,
    text: "Laplace Transform L{f'(t)} = sF(s) - f(0), di mana F(s) = L{f(t)}. Ini fundamental property untuk solving PD via transform algebraic.",
  },
  {
    id: 'tf5', modul: 10, parametric: true,
    compute: (N) => {
      // L{e^at} = 1/(s-a)
      const a = 1 + (N % 5);  // 1-5
      return {
        text: `L{e^(${a}t)} = 1/(s − a). Apakah nilai a = <b>${a}</b>?`,
      };
    }
  },
  // ── MODUL 11: Laplace untuk PD ──
  {
    id: 'tf6', modul: 11, parametric: false,
    text: "Untuk solving IVP via Laplace: take L of both sides → solve algebraic equation for Y(s) → inverse Laplace → y(t).",
  },
  // ── MODUL 12: Heaviside ──
  {
    id: 'tf7', modul: 12, parametric: false,
    text: "Unit step function u(t-a) memiliki Laplace L{u(t-a)} = e^(-as)/s. Shift theorem: L{f(t-a)·u(t-a)} = e^(-as)·F(s).",
  },
  // ── MODUL 13: Pecahan Parsial ──
  {
    id: 'tf8', modul: 13, parametric: false,
    text: "Untuk inverse Laplace 1/((s-1)(s-2)), pecahan parsial: A/(s-1) + B/(s-2). Cover-up method: A = 1/(1-2) = -1, B = 1/(2-1) = 1.",
  },
  {
    id: 'tf9', modul: 13, parametric: true,
    compute: (N) => {
      const a = 2 + (N % 4);  // 2-5
      const b = 6 + (N % 3);  // 6-8
      // F(s) = 1/((s-a)(s-b)) → A = 1/(a-b), B = 1/(b-a)
      const A = 1 / (a - b);
      const B = 1 / (b - a);
      const correct_A = Math.abs(A) < 0.5;
      return {
        text: `Pecahan parsial 1/((s−<b>${a}</b>)(s−<b>${b}</b>)) = A/(s−${a}) + B/(s−${b}). Apakah |A| < 0.5?`,
      };
    }
  },
  // ── MODUL 14: Deret Fourier ──
  {
    id: 'tf10', modul: 14, parametric: false,
    text: "Square wave (-π,π) → Σ (4/(π(2n-1))) sin((2n-1)x), n=1,2,3... Hanya komponen sin (odd harmonics) karena fungsi ganjil.",
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// BAGIAN B — PILIHAN GANDA (20 soal × 1 poin = 20 poin)
// ═══════════════════════════════════════════════════════════════════════════
const UAS_MC = [
  // ── MODUL 8: PD Non-Homogen (3 soal) ──
  {
    id: 'mc1', modul: 8, parametric: false,
    text: "Untuk PD y'' + 4y = sin(2x), method Undetermined Coefficients gagal karena resonansi. Trial yang benar:",
    options: [
      "y_p = A·sin(2x) + B·cos(2x)",
      "y_p = x·(A·sin(2x) + B·cos(2x))",
      "y_p = e^(2x)",
      "y_p = A·sin(2x)·cos(2x)"
    ],
  },
  {
    id: 'mc2', modul: 8, parametric: false,
    text: "Variation of Parameters lebih general dari Undetermined Coefficients karena:",
    options: [
      "Lebih cepat dihitung",
      "Berlaku untuk r(x) sembarang (e^x, sin, polynomial, atau gabungan)",
      "Tidak butuh y_h (homogeneous solution)",
      "Hanya untuk PD orde 1"
    ],
  },
  {
    id: 'mc3', modul: 8, parametric: true,
    compute: (N) => {
      // y'' - y = e^x → resonance, y_p = (1/2)·x·e^x
      const correct_A = 0.5;
      const proposed = [0.25, 0.5, 1.0, 2.0][N % 4];
      const correctIdx = proposed === 0.5 ? 1 : (proposed === 0.25 ? 0 : (proposed === 1.0 ? 2 : 3));
      return {
        text: `PD y'' − y = e^x. Trial y_p = A·x·e^x (resonansi). Nilai A:`,
        options: ["A = 0.25", "A = 0.5", "A = 1.0", "A = 2.0"],
      };
    }
  },
  // ── MODUL 9: Reduksi Orde (2 soal) ──
  {
    id: 'mc4', modul: 9, parametric: false,
    text: "Inverse Operator Method: 1/D · f(x) = ∫f(x)dx. Operator (D - a)⁻¹ untuk f(x) = e^(ax) menghasilkan:",
    options: [
      "x·e^(ax) (resonance case)",
      "(1/a)·e^(ax)",
      "0",
      "e^(ax)/(1-a)"
    ],
  },
  {
    id: 'mc5', modul: 9, parametric: false,
    text: "Annihilator Method untuk PD non-homogen: cari operator polinomial L_a sehingga L_a[r(x)] = 0. Untuk r(x) = e^(2x)·cos(3x):",
    options: [
      "L_a = D - 2",
      "L_a = D² - 4D + 13",
      "L_a = D² + 9",
      "L_a = D - 3"
    ],
  },
  // ── MODUL 10: Laplace (3 soal) ──
  {
    id: 'mc6', modul: 10, parametric: false,
    text: "L{cos(ωt)} = ?",
    options: ["1/(s-ω)", "ω/(s²+ω²)", "s/(s²+ω²)", "s/(s²-ω²)"],
  },
  {
    id: 'mc7', modul: 10, parametric: false,
    text: "First shift theorem: L{e^(at)·f(t)} = ?",
    options: ["F(s)·e^(-at)", "F(s+a)", "F(s-a)", "F(s)/(s-a)"],
  },
  {
    id: 'mc8', modul: 10, parametric: true,
    compute: (N) => {
      const a = 2 + (N % 5);  // 2-6
      // L{e^(at)·sin(ωt)} = ω/((s-a)² + ω²)
      // Question: identify shift
      return {
        text: `L{e^(<b>${a}</b>t)·sin(3t)} hasilnya:`,
        options: [`3/((s-${a})² + 9)`, `3/(s² + 9)`, `s/((s-${a})² + 9)`, `(s-${a})/((s-${a})² + 9)`],
      };
    }
  },
  // ── MODUL 11: Laplace untuk PD (3 soal) ──
  {
    id: 'mc9', modul: 11, parametric: false,
    text: "IVP: y'' + y = 0, y(0)=1, y'(0)=0. Setelah ambil Laplace, persamaan aljabar untuk Y(s):",
    options: [
      "(s² + 1)Y = 0 → Y = 0 (trivial!)",
      "s²Y - s - 0 + Y = 0 → Y(s² + 1) = s → Y = s/(s²+1)",
      "s·Y + Y = 1",
      "Y(s+1) = 1"
    ],
  },
  {
    id: 'mc10', modul: 11, parametric: false,
    text: "Convolution Theorem: L{f * g} = F(s)·G(s), dimana f * g = ∫₀^t f(τ)·g(t-τ) dτ. Aplikasi:",
    options: [
      "Hanya untuk fungsi periodik",
      "Inverse Laplace untuk produk F(s)·G(s)",
      "Solving sistem linear",
      "Tidak applicable untuk PD"
    ],
  },
  {
    id: 'mc11', modul: 11, parametric: true,
    compute: (N) => {
      // y' + 2y = 0, y(0) = 1+N
      const y0 = 1 + (N % 5);  // 1-5
      // L: sY - y0 + 2Y = 0 → Y(s+2) = y0 → Y = y0/(s+2) → y = y0·e^(-2t)
      return {
        text: `IVP: y' + 2y = 0, y(0) = <b>1 + (N mod 5) = ${y0}</b>. Pakai Laplace, hitung y(t):`,
        options: [`${y0}·e^(-2t)`, `${y0}·e^(2t)`, `${y0}·sin(2t)`, `${y0}·t`],
      };
    }
  },
  // ── MODUL 12: Heaviside (3 soal) ──
  {
    id: 'mc12', modul: 12, parametric: false,
    text: "L{u(t-3)} = ?",
    options: ["1/s", "e^(-3s)/s", "3/s", "s/(s²+9)"],
  },
  {
    id: 'mc13', modul: 12, parametric: false,
    text: "Dirac delta L{δ(t-a)} = ?",
    options: ["1", "e^(-as)", "a", "e^(-as)/s"],
  },
  {
    id: 'mc14', modul: 12, parametric: true,
    compute: (N) => {
      const a = 1 + (N % 4);
      // L{u(t-a)·(t-a)²} = e^(-as)·2/s³
      return {
        text: `L{u(t-<b>${a}</b>)·(t-${a})²} = ?`,
        options: [`e^(-${a}s)·2/s³`, `2/s³`, `e^(-${a}s)/s²`, `(t-${a})²·e^(-${a}s)`],
      };
    }
  },
  // ── MODUL 13: Pecahan Parsial (2 soal) ──
  {
    id: 'mc15', modul: 13, parametric: false,
    text: "Pecahan parsial untuk 1/(s²-1) = 1/((s-1)(s+1)):",
    options: [
      "1/(s-1) + 1/(s+1)",
      "1/2·[1/(s-1) - 1/(s+1)]",
      "1/(s-1) - 1/(s+1)",
      "(s-1)/(s²-1)"
    ],
  },
  {
    id: 'mc16', modul: 13, parametric: true,
    compute: (N) => {
      const a = 2 + (N % 4);  // 2-5
      const A = 1/a;
      const correctIdx = Math.abs(A - 0.25) < 0.001 ? 0 : (Math.abs(A - 0.5) < 0.001 ? 1 : (Math.abs(A - 0.33) < 0.01 ? 2 : 3));
      return {
        text: `1/(s(s+<b>${a}</b>)) = A/s + B/(s+${a}). Hitung A:`,
        options: ["1/4", "1/2", "1/3", `1/${a}`],
      };
    }
  },
  // ── MODUL 14: Deret Fourier (4 soal) ──
  {
    id: 'mc17', modul: 14, parametric: false,
    text: "Fourier Series untuk fungsi periodik f(x) periode 2L: f(x) = a₀/2 + Σ(aₙ·cos(nπx/L) + bₙ·sin(nπx/L)). Untuk f(x) ganjil:",
    options: [
      "Hanya komponen aₙ (cos)",
      "Hanya komponen bₙ (sin)",
      "Hanya a₀ (DC)",
      "Tidak ada Fourier series"
    ],
  },
  {
    id: 'mc18', modul: 14, parametric: false,
    text: "Square wave amplitude 1, periode 2π memiliki Fourier series. Magnitude koefisien fundamental b₁:",
    options: ["1/π", "2/π", "4/π", "1"],
  },
  {
    id: 'mc19', modul: 14, parametric: false,
    text: "Gibbs phenomenon di Fourier Series:",
    options: [
      "Konvergensi sangat cepat di mana-mana",
      "Overshoot ~9% di sekitar diskontinuitas, tidak hilang dengan menambah harmonics",
      "Fourier series tidak konvergen untuk fungsi periodik",
      "Hanya muncul untuk fungsi continuous"
    ],
  },
  {
    id: 'mc20', modul: 14, parametric: true,
    compute: (N) => {
      // For square wave, magnitude of harmonic n
      const n = 1 + 2*(N % 5);  // 1, 3, 5, 7, 9
      const b_n = 4 / (n * Math.PI);
      const correctIdx = b_n > 1 ? 0 : (b_n > 0.4 ? 1 : (b_n > 0.2 ? 2 : 3));
      return {
        text: `Square wave amp 1: harmonic ke-<b>${n}</b> (n=${n} ganjil), bₙ = 4/(nπ). Magnitude:`,
        options: ["> 1", "0.4–1", "0.2–0.4", "< 0.2"],
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// BAGIAN C — KOMPUTASI EASY/MEDIUM (10 soal × 2 poin = 20 poin)
// ═══════════════════════════════════════════════════════════════════════════
const UAS_COMP_EZ = [
  // ── MODUL 8: Undetermined Coefficients ──
  {
    id: 'c1', modul: 8, parametric: true,
    compute: (N) => {
      const a = 2 + (N % 5);  // 2-6
      // y'' + 4y' + 4y = a·e^x → y_p = A·e^x with A = a/9
      // (D² + 4D + 4)·A·e^x = A(1+4+4)e^x = 9A·e^x = a·e^x → A = a/9
      const A = a / 9;
      return {
        text: `PD y'' + 4y' + 4y = <b>${a}·e^x</b>. Trial y_p = A·e^x. Hitung A (4 desimal). Tip: substitute trial, samakan koefisien.`,
      };
    }
  },
  // ── MODUL 9: Inverse Operator ──
  {
    id: 'c2', modul: 9, parametric: true,
    compute: (N) => {
      // (N%4)+2 → a∈{2,3,4,5}; ketika a=5 dgn b=5 divergence 1/0=Infinity.
      // Fix: (N%3)+2 → a∈{2,3,4}, selalu b≠a, formula well-defined utk semua NIM.
      const a = 2 + (N % 3);  // 2-4
      const b = 5;
      const result = 1 / (b - a);
      return {
        text: `Inverse Operator: <b>1/(D−${a}) · e^(${b}x)</b>. Hitung koefisien hasil (4 desimal). Tip: 1/(D-a)·e^(bx) = e^(bx)/(b-a) untuk b≠a.`,
      };
    }
  },
  // ── MODUL 10: Laplace transform ──
  {
    id: 'c3', modul: 10, parametric: true,
    compute: (N) => {
      const a = 1 + (N % 5);  // 1-5
      // L{e^(at)·t} = 1/(s-a)²; evaluate at s=a+2 → 1/4
      const s_eval = a + 2;
      const value = 1 / Math.pow(s_eval - a, 2);
      return {
        text: `Hitung F(s) = L{t·e^(<b>${a}</b>t)} pada s = <b>${s_eval}</b> (4 desimal). Tip: L{t·e^(at)} = 1/(s-a)².`,
      };
    }
  },
  {
    id: 'c4', modul: 10, parametric: true,
    compute: (N) => {
      const omega = 1 + (N % 5);  // 1-5
      // L{cos(ωt)} = s/(s²+ω²); at s = ω → ω/(ω²+ω²) = 1/(2ω)
      const s_eval = omega;
      const value = s_eval / (s_eval*s_eval + omega*omega);
      return {
        text: `Hitung F(s) = L{cos(<b>${omega}</b>t)} pada s = <b>${s_eval}</b> (4 desimal). Tip: L{cos(ωt)} = s/(s²+ω²).`,
      };
    }
  },
  // ── MODUL 11: Laplace solving IVP ──
  {
    id: 'c5', modul: 11, parametric: true,
    compute: (N) => {
      const y0 = 1 + (N % 5);  // 1-5
      // y' + 3y = 0, y(0)=y0 → y = y0·e^(-3t); y(1) = y0·e^(-3)
      const value = y0 * Math.exp(-3);
      return {
        text: `IVP: y' + 3y = 0, y(0) = <b>1 + (N mod 5) = ${y0}</b>. Pakai Laplace untuk solve, kemudian hitung y(1) (4 desimal).`,
      };
    }
  },
  // ── MODUL 12: Heaviside ──
  {
    id: 'c6', modul: 12, parametric: true,
    compute: (N) => {
      const a = 1 + (N % 4);  // 1-4
      // L{u(t-a)·sin(t-a)} = e^(-as)/(s²+1); at s=1 → e^(-a)/2
      const value = Math.exp(-a) / 2;
      return {
        text: `L{u(t−<b>${a}</b>)·sin(t−${a})} pada s = 1 (4 desimal). Tip: second shift theorem.`,
      };
    }
  },
  // ── MODUL 13: Pecahan Parsial ──
  {
    id: 'c7', modul: 13, parametric: true,
    compute: (N) => {
      // (N%4)+2 → a∈{2,3,4,5}; ketika a=b=5 divergence 1/0=Infinity.
      // Fix: (N%3)+2 → a∈{2,3,4}, selalu b≠a.
      const a = 2 + (N % 3);  // 2-4
      const b = 5;
      const A = 1 / (a - b);
      return {
        text: `Pecahan parsial 1/((s−<b>${a}</b>)(s−5)) = A/(s−${a}) + B/(s−5). Hitung A (4 desimal). Tip: cover-up method at s=${a}.`,
      };
    }
  },
  {
    id: 'c8', modul: 13, parametric: true,
    compute: (N) => {
      // (s+3)/((s+1)(s+2)) → A/(s+1) + B/(s+2)
      // A = (s+3)/(s+2) at s=-1 = 2/1 = 2; B = (s+3)/(s+1) at s=-2 = 1/(-1) = -1
      // Generic: (s+a) variable
      const a = 2 + (N % 5);  // 2-6
      // (s+a)/((s+1)(s+2))
      // A = (s+a)/(s+2) at s=-1 = (a-1)/1 = a-1
      const A = a - 1;
      return {
        text: `Pecahan parsial (s+<b>${a}</b>)/((s+1)(s+2)) = A/(s+1) + B/(s+2). Hitung A (integer).`,
      };
    }
  },
  // ── MODUL 14: Fourier Series ──
  {
    id: 'c9', modul: 14, parametric: true,
    compute: (N) => {
      const n = 1 + 2*(N % 5);  // 1, 3, 5, 7, 9
      // Square wave amp 1: bₙ = 4/(nπ) untuk n ganjil
      const bn = 4 / (n * Math.PI);
      return {
        text: `Square wave amplitude 1, periode 2π. Hitung koefisien Fourier b_<b>${n}</b> (4 desimal). Tip: bₙ = 4/(nπ) untuk n ganjil.`,
      };
    }
  },
  {
    id: 'c10', modul: 14, parametric: true,
    compute: (N) => {
      // Triangle wave: aₙ = (4/(n²π²)) for n odd
      const n = 1 + 2*(N % 5);  // 1, 3, 5, 7, 9
      const an = 4 / (n*n * Math.PI * Math.PI);
      return {
        text: `Triangle wave (-π,π) symmetric: aₙ = 4/(n²π²) untuk n ganjil. Hitung a_<b>${n}</b> (5 desimal).`,
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// BAGIAN D — KOMPUTASI HARD (5 soal × 4 poin = 20 poin)
// ═══════════════════════════════════════════════════════════════════════════
const UAS_COMP_HARD = [
  // ── MODUL 8: Variation of Parameters ──
  {
    id: 'c11', modul: 8, parametric: true,
    compute: (N) => {
      // y'' + y = sec(x) → y_h = c₁cos(x) + c₂sin(x)
      // y_p = u₁cos + u₂sin, u₁'cos + u₂'sin = 0, -u₁'sin + u₂'cos = sec(x)
      // u₁' = -sin·sec = -tan, u₂' = cos·sec = 1
      // u₁ = ln|cos(x)|, u₂ = x
      // y_p = cos·ln|cos| + x·sin
      // Evaluate at x = N/100 (small)
      const x = (N % 10) * 0.05 + 0.1;  // 0.1 to 0.55
      const yp = Math.cos(x) * Math.log(Math.abs(Math.cos(x))) + x * Math.sin(x);
      return {
        text: `PD y'' + y = sec(x). Hitung solusi partikular y_p pada x = <b>${x.toFixed(2)}</b> (4 desimal). Pakai Variation of Parameters: y_p = cos(x)·ln|cos(x)| + x·sin(x).`,
      };
    }
  },
  // ── MODUL 11: IVP via Laplace ──
  {
    id: 'c12', modul: 11, parametric: true,
    compute: (N) => {
      // y'' + 4y = 0, y(0) = a, y'(0) = b
      // Y(s) = (as + b)/(s² + 4) → y = a·cos(2t) + (b/2)·sin(2t)
      const a = 1 + (N % 5);
      const b = 2 + (N % 4);
      const t = 0.5;
      const y_t = a * Math.cos(2*t) + (b/2) * Math.sin(2*t);
      return {
        text: `IVP via Laplace: y'' + 4y = 0, y(0) = <b>${a}</b>, y'(0) = <b>${b}</b>. Solusi y(t) = ${a}·cos(2t) + (${b}/2)·sin(2t). Hitung y(0.5) (4 desimal).`,
      };
    }
  },
  // ── MODUL 12: Piecewise Heaviside Laplace inverse ──
  {
    id: 'c13', modul: 12, parametric: true,
    compute: (N) => {
      // L⁻¹{e^(-2s)/(s²+1)} = u(t-2)·sin(t-2)
      // Evaluate at t = 3 → u(1)·sin(1) = sin(1)
      const a = 1 + (N % 4);  // shift 1-4
      const t = a + 0.5;
      // F(s) = e^(-as)/(s²+1) → f(t) = u(t-a)·sin(t-a); for t > a
      const value = Math.sin(t - a);  // since t > a, u = 1
      return {
        text: `Inverse Laplace: L⁻¹{e^(−<b>${a}</b>s)/(s²+1)} = u(t−${a})·sin(t−${a}). Hitung nilai pada t = <b>${t}</b> (4 desimal).`,
      };
    }
  },
  // ── MODUL 13: Repeated roots partial fractions ──
  {
    id: 'c14', modul: 13, parametric: true,
    compute: (N) => {
      // 1/((s-a)²(s-b)) = A/(s-a)² + B/(s-a) + C/(s-b)
      const a = 1 + (N % 3);  // 1-3
      const b = 5 + (N % 2);  // 5-6
      // A = 1/(a-b)
      // For B, derivative: B = -1/(a-b)²
      // C = 1/(b-a)²
      const A_val = 1 / (a - b);
      return {
        text: `Pecahan parsial 1/((s−<b>${a}</b>)²(s−<b>${b}</b>)) = A/(s−${a})² + B/(s−${a}) + C/(s−${b}). Hitung A (4 desimal). Tip: cover-up at repeated root with quadratic numerator.`,
      };
    }
  },
  // ── MODUL 14: Fourier Series partial sum approximation ──
  {
    id: 'c15', modul: 14, parametric: true,
    compute: (N) => {
      // Square wave: f(x) ≈ Σ (4/(nπ))·sin(nx), n=1,3,5,...
      // Evaluate at x = π/4 with first 5 terms (n=1,3,5,7,9)
      const x = Math.PI / 4 + (N % 4) * 0.05;
      let sum = 0;
      for(let n=1; n<=9; n+=2) {
        sum += (4/(n*Math.PI)) * Math.sin(n*x);
      }
      return {
        text: `Square wave Fourier series: f(x) ≈ Σ_{n=1,3,5,7,9} (4/(nπ))·sin(nx). Hitung partial sum (5 terms) pada x = <b>π/4 + ${((N%4)*0.05).toFixed(2)} = ${x.toFixed(4)}</b> rad (4 desimal).`,
      };
    }
  }
];

module.exports = { UAS_TF, UAS_MC, UAS_COMP_EZ, UAS_COMP_HARD };
