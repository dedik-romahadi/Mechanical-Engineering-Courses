/* eslint-disable max-len */
/**
 * Optimalisasi & Automasi UAS — bank soal (teks/opsi/hint), diekstrak VERBATIM dari
 * `Optimalisasi-dan-Automasi/Exam/UAS.html` (UAS_TF/UAS_MC/UAS_COMP_EZ/UAS_COMP_HARD).
 *
 * SUMBER KEBENARAN: file ini HARUS byte-identik (isi compute()/text/options)
 * dengan blok const yang sama di UAS.html — satu-satunya perbedaan adalah
 * exposure: di sini lewat module.exports (server, dibaca getExamQuestions
 * SETELAH PIN+jadwal terverifikasi), bukan window.UAS_TF (client, dulu
 * ter-embed statis & bisa dibaca via View Source sebelum jadwal buka).
 *
 * TIDAK berisi kunci jawaban (correctIdx/answer/expected) — itu tetap di
 * functions/seed/uas-optoauto-answers.js + Firestore examAnswers/. Lihat
 * Pedoman §40.29.
 *
 * ⚠ Kalau UAS.html diedit (soal ditambah/diubah), file ini WAJIB disamakan
 * ulang (re-extract), lalu `firebase deploy --only functions`.
 */

const UAS_TF = [
  // ── MODUL 8: Linear Programming ──
  {
    id: 'tf1', modul: 8, parametric: false,
    text: "Linear Programming (LP) standard form: min cᵀx s.t. Ax ≤ b, x ≥ 0. scipy.optimize.linprog SELALU MEMINIMUMKAN — untuk maksimasi, kirim c_negate = -c_orig."
  },
  {
    id: 'tf2', modul: 8, parametric: true,
    compute: (N) => {
      const c1 = 3 + (N % 5);
      const c2 = 5;
      // max c1·x1 + c2·x2; constraint x1+x2 <= 10
      const Z = Math.max(c1*10, c2*10);
      return {
        text: `LP: <b>max ${c1}x₁ + 5x₂</b> s.t. x₁+x₂ ≤ 10, x₁,x₂ ≥ 0. Apakah solusi optimal Z* = ${Z} (vertex check)?`
      };
    }
  },
  // ── MODUL 9: NLP ──
  {
    id: 'tf3', modul: 9, parametric: false,
    text: "Gradient Descent dengan learning rate α terlalu besar dapat menyebabkan oscillation atau divergence — convergence butuh α < 2/L (L = Lipschitz constant of gradient)."
  },
  {
    id: 'tf4', modul: 9, parametric: false,
    text: "Newton's Method konvergen kuadratik dekat optimum, tetapi butuh Hessian (matrix orde 2). BFGS approximate Hessian → quasi-Newton."
  },
  // ── MODUL 10: ANOVA ──
  {
    id: 'tf5', modul: 10, parametric: false,
    text: "Full Factorial Design dengan k faktor 2-level memerlukan 2^k runs. k=10 → 1024 runs (mahal!). Fractional Factorial 2^(k-p) menghemat namun confounds beberapa interactions."
  },
  // ── MODUL 11: Sensor Monitoring ──
  {
    id: 'tf6', modul: 11, parametric: false,
    text: "Accelerometer IEPE 100mV/g untuk frekuensi tinggi (>5 kHz) HARUS pakai stud-mount (drilled+tapped). Magnet-mount terbatas ~2 kHz karena resonansi mounting."
  },
  // ── MODUL 12: Alarm/FSM ──
  {
    id: 'tf7', modul: 12, parametric: false,
    text: "ANSI/ISA 18.2 standard memerlukan hysteresis di alarm threshold untuk mencegah chatter (alarm bolak-balik di sekitar threshold)."
  },
  // ── MODUL 7: FFT/PSD/Bearing Fault (Sub-CPMK 3.1) ──
  {
    id: 'tf8', modul: 7, parametric: false,
    text: "Sebelum menghitung FFT, sinyal harus dibuang DC offset-nya dan diterapkan window function (Hann/Hamming/Blackman) untuk menekan spectral leakage — tanpa langkah ini, hasil magnitude spectrum bisa menyesatkan."
  },
  // ── MODUL 13: Logistic Regression ──
  {
    id: 'tf9', modul: 13, parametric: true,
    compute: (N) => {
      // Sigmoid threshold for fault decision
      const z = -2 + (N % 10) * 0.5;  // -2 to 2.5
      return {
        text: `Logistic Regression: untuk z = <b>-2 + 0.5·(N mod 10) = ${z.toFixed(1)}</b>, σ(z) = 1/(1+e^(-z)) > 0.5? (Jika ya, prediksi class POSITIF/fault)`
      };
    }
  },
  // ── MODUL 14: Random Forest ──
  {
    id: 'tf10', modul: 14, parametric: false,
    text: "Random Forest mengurangi overfitting via bagging (bootstrap aggregating) + random feature subset per split. Hyperparameter kunci: n_estimators, max_depth, min_samples_split."
  }
];;

// ═══════════════════════════════════════════════════════════════════════════
// BAGIAN B — PILIHAN GANDA (20 soal × 1 poin = 20 poin)
// ═══════════════════════════════════════════════════════════════════════════
// Setiap MC: 4 opsi, correctIdx menandai jawaban benar
// Untuk parametric MC, opsi di-shuffle dengan seed N agar urutan stabil per NIM
const UAS_MC = [
  // ── MODUL 8: Linear Programming (3 soal) ──
  {
    id: 'mc1', modul: 8, parametric: false,
    text: "Untuk LP dengan constraint Ax ≥ b, transformasi ke bentuk standard scipy.linprog (Ax ≤ b) adalah:",
    options: [
      "Tetap Ax ≥ b (tidak perlu transform)",
      "Negate kedua sisi: -Ax ≤ -b",
      "Tukar variable basis",
      "Tambah slack variable +s"
    ]
  },
  {
    id: 'mc2', modul: 8, parametric: false,
    text: "Production mix LP: 2 produk A,B; profit (5,8); resource limit 10x_A + 6x_B ≤ 60. Maksimasi profit dengan x_A,x_B ≥ 0:",
    options: ["Z* = 50 di (10,0)", "Z* = 80 di (0,10)", "Z* = 60 di (6,0)", "Z* = 30 di (0,5)"]
  },
  {
    id: 'mc3', modul: 8, parametric: true,
    compute: (N) => {
      const c1 = 4 + (N % 5);
      const c2 = 3 + (N % 4);
      return {
        text: `LP: max <b>${c1}·x₁ + ${c2}·x₂</b>, x₁ ≤ 5, x₂ ≤ 8, x₁,x₂ ≥ 0. Objective optimal Z*:`,
        options: [`Z = ${c1*5}`, `Z = ${c2*8}`, `Z = ${c1*5 + c2*8}`, `Z = ${(c1+c2)*5}`]
      };
    }
  },
  // ── MODUL 9: NLP (3 soal) ──
  {
    id: 'mc4', modul: 9, parametric: false,
    text: "Gradient Descent step: x_new = x_old - α·∇f(x_old). α terlalu kecil:",
    options: [
      "Convergence cepat (good)",
      "Convergence sangat lambat",
      "Divergence/oscillation",
      "Loss function naik"
    ]
  },
  {
    id: 'mc5', modul: 9, parametric: false,
    text: "Method paling robust untuk fungsi non-convex dengan banyak local minima:",
    options: [
      "Gradient Descent (mudah stuck di local)",
      "Newton's Method (butuh Hessian)",
      "Genetic Algorithm (population-based, global)",
      "Linear Programming (untuk linear only)"
    ]
  },
  {
    id: 'mc6', modul: 9, parametric: true,
    compute: (N) => {
      const x0 = 1 + (N % 5);  // 1-5
      return {
        text: `Gradient Descent untuk f(x)=x², α=0.1, x₀=<b>1+(N mod 5)=${x0}</b>. Setelah 1 iterasi, nilai x₁:`,
        options: [`${(0.5*x0).toFixed(2)}`, `${(0.8*x0).toFixed(2)}`, `${(1.0*x0).toFixed(2)}`, `${(1.2*x0).toFixed(2)}`]
      };
    }
  },
  // ── MODUL 10: ANOVA (3 soal) ──
  {
    id: 'mc7', modul: 10, parametric: false,
    text: "F-test pada ANOVA: F = MS_between / MS_within. Jika F > F_critical (α=0.05), kesimpulan:",
    options: [
      "H₀ diterima — tidak ada perbedaan signifikan",
      "H₀ ditolak — ada perbedaan signifikan antara groups",
      "F-test tidak applicable",
      "Need more samples"
    ]
  },
  {
    id: 'mc8', modul: 10, parametric: false,
    text: "Untuk screening 12 faktor dengan budget 16 runs, design optimal:",
    options: [
      "Full factorial (2^12 = 4096 runs, infeasible)",
      "Fractional 2^(12-8) = 16 runs (Resolution III)",
      "Plackett-Burman 12-factor 16-run",
      "Response Surface Methodology"
    ]
  },
  {
    id: 'mc9', modul: 10, parametric: true,
    compute: (N) => {
      const k = 3 + (N % 4);  // 3-6 faktor
      const fullRuns = Math.pow(2, k);
      return {
        text: `Full Factorial 2-level dengan <b>k = 3 + (N mod 4) = ${k} faktor</b>. Jumlah runs:`,
        options: [`${k} runs`, `${k*2} runs`, `${fullRuns} runs`, `${fullRuns*2} runs`]
      };
    }
  },
  // ── MODUL 11: Sensor (3 soal) ──
  {
    id: 'mc10', modul: 11, parametric: false,
    text: "Proximity probe (eddy current) mengukur:",
    options: [
      "Acceleration absolute massa",
      "Velocity radial/axial",
      "Displacement gap shaft-housing (relative)",
      "Strain pada bearing housing"
    ]
  },
  {
    id: 'mc11', modul: 11, parametric: true,
    compute: (N) => {
      const accel = 0.5 + N*0.05;  // 0.5 to 5.45 g
      return {
        text: `Accelerometer 100 mV/g membaca getaran <b>${accel.toFixed(2)} g</b>. Output voltage:`,
        options: ["< 100 mV", "100–300 mV", "300–500 mV", "> 500 mV"]
      };
    }
  },
  {
    id: 'mc12', modul: 11, parametric: false,
    text: "Mounting accelerometer untuk monitoring continuous online di motor 5 kW:",
    options: [
      "Stud-mount (best, drilled hole permanent)",
      "Adhesive (cyanoacrylate) — semi-permanent",
      "Magnet (untuk spot check)",
      "Hand-held probe"
    ]
  },
  // ── MODUL 12: Alarm/FSM (3 soal) ──
  {
    id: 'mc13', modul: 12, parametric: false,
    text: "ANSI/ISA 18.2 alarm priority levels untuk machine vibration:",
    options: [
      "1 level: ON/OFF",
      "2 levels: Warning + Trip",
      "4 levels: Normal/Alert/Alarm/Shutdown",
      "10 levels: Continuous severity"
    ]
  },
  {
    id: 'mc14', modul: 12, parametric: true,
    compute: (N) => {
      const rms = 1.0 + N*0.1;  // 1.0 to 10.9 mm/s
      return {
        text: `Motor 50 kW (Class II) RMS = <b>1.0 + 0.1N = ${rms.toFixed(1)} mm/s</b>. Zone ISO 10816 + tindakan:`,
        options: [
          "Zone A (Normal) — Continue",
          "Zone B (Alert) — Monitor weekly",
          "Zone C (Alarm) — Schedule maintenance",
          "Zone D (Shutdown) — STOP IMMEDIATELY"
        ]
      };
    }
  },
  {
    id: 'mc15', modul: 12, parametric: false,
    text: "Finite State Machine (FSM) untuk alarm system memerlukan:",
    options: [
      "Hanya state Normal/Alarm",
      "States + transitions + guards (hysteresis) + actions",
      "Continuous PID controller",
      "Probabilistic Bayesian network"
    ]
  },
  // ── MODUL 7: FFT/PSD/Bearing Fault (Sub-CPMK 3.1, 3 soal) ──
  {
    id: 'mc16', modul: 7, parametric: false,
    text: "Resolusi frekuensi FFT: Δf = fs/N. Untuk membedakan dua peak berdekatan (mis. BPFO 177 Hz vs line frequency 180 Hz di spektrum), strategi paling tepat adalah:",
    options: [
      "Perkecil N (window pendek) supaya komputasi lebih cepat",
      "Perbesar N (window panjang), dengan syarat sinyal tetap stasioner sepanjang window",
      "Naikkan sampling rate fs tanpa mengubah N",
      "Zero-padding sinyal untuk mendapat resolusi frekuensi sejati lebih tinggi"
    ]
  },
  {
    id: 'mc17', modul: 7, parametric: true,
    compute: (N) => {
      const fr = 20 + (N % 10) * 0.8;  // 20 to 27.2 Hz
      const dOverD = 7.94 / 39;
      const BPFO = 4.5 * (1 - dOverD) * fr;
      const BPFI = 4.5 * (1 + dOverD) * fr;
      const FTF = 0.5 * (1 - dOverD) * fr;
      const naive = 9 * fr;
      return {
        text: `Bearing 6205 (n=9 bola, d=7.94mm, D=39mm, α=0°) pada motor dengan fr = 20 + 0.8·(N mod 10) = <b>${fr.toFixed(1)} Hz</b>. Berapa BPFO (Ball Pass Frequency Outer race)?`,
        options: [`${BPFO.toFixed(1)} Hz`, `${BPFI.toFixed(1)} Hz`, `${FTF.toFixed(1)} Hz`, `${naive.toFixed(1)} Hz`]
      };
    }
  },
  {
    id: 'mc18', modul: 7, parametric: false,
    text: "Teknik envelope analysis (bandpass ke band resonansi struktural 5–20 kHz → Hilbert transform → FFT envelope) dipakai untuk deteksi bearing fault karena:",
    options: [
      "Menghilangkan noise broadband secara permanen dari sinyal asli",
      "Mendemodulasi sinyal impact yang termodulasi pada frekuensi resonansi struktural, sehingga peak BPFO/BPFI/BSF tampak lebih jelas dibanding FFT sinyal mentah",
      "Mengubah domain frekuensi kembali ke domain waktu untuk hitung RMS",
      "Menggantikan kebutuhan FFT sepenuhnya dengan metode statistik non-frekuensi"
    ]
  },
  // ── MODUL 14: RF/SVM (2 soal) ──
  {
    id: 'mc19', modul: 14, parametric: false,
    text: "Random Forest hyperparameter tuning paling efisien untuk 5+ hyperparameter:",
    options: [
      "Grid Search (exhaustive, mahal)",
      "Random Search (efficient sampling)",
      "Bayesian Optimization (surrogate model)",
      "Manual tuning"
    ]
  },
  {
    id: 'mc20', modul: 14, parametric: true,
    compute: (N) => {
      const n_total = 100 + N*5;  // 100-595
      return {
        text: `5-fold Cross-Validation pada dataset N = <b>${n_total} samples</b>. Setiap fold validasi pakai 1/5 data, training pakai sisanya. Training size per fold:`,
        options: ["< 200", "200–400", "400–500", "≥ 500"]
      };
    }
  }
];;

// ═══════════════════════════════════════════════════════════════════════════
// BAGIAN C — KOMPUTASI EASY/MEDIUM (10 soal × 2 poin = 20 poin)
// ═══════════════════════════════════════════════════════════════════════════
// Setiap soal: 5-15 baris kode Python. Hint berisi kerangka kode lengkap.
// IDs: c1 - c10
const UAS_COMP_EZ = [
  // ── MODUL 8: LP (2 soal) ──
  {
    id: 'c1', modul: 8, parametric: true,
    compute: (N) => {
      const c1 = 3 + (N % 5);
      return {
        text: `LP: max <b>${c1}·x₁ + 5·x₂</b> s.t. x₁ ≤ 8, x₂ ≤ 6, x₁+x₂ ≤ 10, x₁,x₂ ≥ 0. Hitung Z* (integer).`,
        hint: `# N = ${N} (dari NIM Anda)\nc1 = ${c1}\nc2 = 5\n# Constraint: x1 ≤ 8, x2 ≤ 6, x1 + x2 ≤ 10, x1,x2 ≥ 0\n# TODO: hitung Z* optimal (integer), lalu print`
      };
    }
  },
  {
    id: 'c2', modul: 8, parametric: true,
    compute: (N) => {
      // Transportation: 2 sources, 2 destinations
      const cost = [[2 + (N % 4), 3], [4, 1 + (N % 3)]];  // cost matrix
      return {
        text: `Transportation Problem: cost matrix [[<b>${cost[0][0]}</b>, 3], [4, <b>${cost[1][1]}</b>]], supply [10, 15], demand [12, 13]. Hitung total cost dengan northwest corner method (integer).`,
        hint: `# N = ${N} (dari NIM Anda)\ncost = [[${cost[0][0]}, 3], [4, ${cost[1][1]}]]\nsupply = [10, 15]\ndemand = [12, 13]\n# TODO: terapkan northwest corner method, hitung total cost, lalu print`
      };
    }
  },
  // ── MODUL 9: NLP ──
  {
    id: 'c3', modul: 9, parametric: true,
    compute: (N) => {
      const x0 = 1 + (N % 8);  // 1-8
      return {
        text: `Gradient Descent untuk f(x) = (x − 5)², α = 0.2, x₀ = <b>1 + (N mod 8) = ${x0}</b>. Hitung x₁ setelah 1 iterasi (3 desimal).`,
        hint: `# N = ${N} (dari NIM Anda)\nx0 = ${x0}\nalpha = 0.2\n# f(x) = (x - 5)^2\n# TODO: lakukan 1 iterasi gradient descent dan print x1 (3 desimal)`
      };
    }
  },
  // ── MODUL 10: ANOVA ──
  {
    id: 'c4', modul: 10, parametric: true,
    compute: (N) => {
      const m1 = 10 + (N % 5);  // 10-14
      const m2 = 12 + (N % 5);
      const m3 = 14 + (N % 5);
      return {
        text: `ANOVA: 3 groups, n=4 per group, group means: μ₁=<b>${m1}</b>, μ₂=<b>${m2}</b>, μ₃=<b>${m3}</b>. Hitung SS_between (sum of squares between, 2 desimal).`,
        hint: `# N = ${N} (dari NIM Anda)\nimport numpy as np\nm1, m2, m3 = ${m1}, ${m2}, ${m3}\nn = 4   # samples per group\n# TODO: hitung SS_between (sum of squares antar grup), lalu print (2 desimal)`
      };
    }
  },
  {
    id: 'c5', modul: 10, parametric: true,
    compute: (N) => {
      const k = 3 + (N % 4);  // 3-6 faktor
      return {
        text: `Full Factorial 2-level dengan k = <b>3 + (N mod 4) = ${k}</b> faktor. Hitung jumlah runs (integer).`,
        hint: `# N = ${N} (dari NIM Anda)\nk = ${k}\n# Full factorial 2-level\n# TODO: hitung jumlah runs (integer), lalu print`
      };
    }
  },
  // ── MODUL 11: Sensor ──
  {
    id: 'c6', modul: 11, parametric: true,
    compute: (N) => {
      const a_g = 0.5 + N*0.05;  // 0.5-5.45 g
      return {
        text: `Accelerometer IEPE 100 mV/g membaca akselerasi <b>0.5 + 0.05N = ${a_g.toFixed(2)} g</b>. Hitung output voltage (mV, 2 desimal).`,
        hint: `# N = ${N} (dari NIM Anda)\nsens = 100      # mV/g (sensitivitas accelerometer)\na_g = ${a_g.toFixed(2)}    # akselerasi terbaca (g)\n# TODO: hitung output voltage (mV, 2 desimal), lalu print`
      };
    }
  },
  {
    id: 'c7', modul: 11, parametric: true,
    compute: (N) => {
      return {
        text: `ADC 16-bit, range ±10V, accelerometer 100 mV/g (sens=0.1 V/g). Hitung quantization step dalam <b>milli-g</b> per LSB (4 desimal).`,
        hint: `# N = ${N} (dari NIM Anda)\nbits = 16\nrange_V = 20    # ±10V → total 20V\nsens = 0.1      # V/g (100 mV/g)\n# TODO: hitung quantization step per LSB dalam milli-g (4 desimal), lalu print`
      };
    }
  },
  // ── MODUL 12: Alarm/FSM ──
  {
    id: 'c8', modul: 12, parametric: true,
    compute: (N) => {
      const hysteresis_pct = 5 + (N % 8);  // 5-12%
      const hysteresis = 4.5 * hysteresis_pct / 100;
      return {
        text: `Alarm threshold trigger ON di <b>4.5 mm/s</b>. Hysteresis <b>${hysteresis_pct}% (=${hysteresis.toFixed(3)} mm/s)</b>. Hitung threshold trigger OFF (3 desimal).`,
        hint: `# N = ${N} (dari NIM Anda)\nthreshold_on = 4.5         # mm/s (trigger ON)\nhysteresis_pct = ${hysteresis_pct}        # persen\n# TODO: hitung threshold trigger OFF (mm/s, 3 desimal), lalu print`
      };
    }
  },
  // ── MODUL 7: FFT/PSD/Bearing Fault (Sub-CPMK 3.1) ──
  {
    id: 'c9', modul: 7, parametric: true,
    compute: (N) => {
      const fftN = 4096 + 1024 * (N % 5);  // 4096 to 8192
      const fs = 25600;
      const df = fs / fftN;
      return {
        text: `FFT dilakukan pada sinyal vibrasi dengan sampling rate fs = <b>25600 Hz (25.6 kHz)</b> dan N = <b>4096 + 1024·(N mod 5) = ${fftN} titik</b>. Hitung resolusi frekuensi Δf = fs/N (Hz, 3 desimal).`,
        hint: `# N = ${N} (dari NIM Anda)\nfs = 25600      # Hz, sampling rate\nfft_N = ${fftN} # jumlah titik FFT\n# TODO: hitung df = fs/fft_N (Hz, 3 desimal), lalu print`
      };
    }
  },
  // ── MODUL 14: RF/SVM ──
  {
    id: 'c10', modul: 14, parametric: true,
    compute: (N) => {
      const n = 200 + N*5;  // 200-695
      return {
        text: `5-fold CV pada dataset n = <b>200 + 5N = ${n} samples</b>. Hitung training set size per fold (integer).`,
        hint: `# N = ${N} (dari NIM Anda)\nn = ${n}     # total samples\nk = 5       # k-fold\n# TODO: hitung training set size per fold (integer), lalu print`
      };
    }
  }
];;

// ═══════════════════════════════════════════════════════════════════════════
// BAGIAN D — KOMPUTASI HARD (5 soal × 4 poin = 20 poin)
// ═══════════════════════════════════════════════════════════════════════════
// Setiap soal: 20-50+ baris kode. Algoritma lengkap.
// IDs: c11 - c15
// Partial credit +1 poin jika kode di-submit (non-empty) tapi output salah/error.
const UAS_COMP_HARD = [
  // ── MODUL 8: LP optimization full ──
  {
    id: 'c11', modul: 8, parametric: true,
    compute: (N) => {
      const c1 = 5 + (N % 4);
      const c2 = 7 + (N % 3);
      return {
        text: `LP 2-variable: max <b>${c1}x₁ + ${c2}x₂</b> s.t. 2x₁+3x₂ ≤ 24, 4x₁+2x₂ ≤ 32, x₁,x₂ ≥ 0. Hitung Z* (integer).`,
        hint: `# N = ${N} (dari NIM Anda)\nc1 = ${c1}\nc2 = ${c2}\n# Constraints: 2x1 + 3x2 ≤ 24, 4x1 + 2x2 ≤ 32, x1,x2 ≥ 0\n# TODO: selesaikan LP (boleh vertex search atau scipy.optimize.linprog),\n#       hitung Z* optimal (integer), lalu print`
      };
    }
  },
  // ── MODUL 9: NLP gradient descent multiple iterations ──
  {
    id: 'c12', modul: 9, parametric: true,
    compute: (N) => {
      const x0 = 1 + (N % 6);  // 1-6
      return {
        text: `Gradient Descent untuk f(x) = (x − 10)², α = 0.15, x₀ = <b>1 + (N mod 6) = ${x0}</b>. Hitung x setelah <b>5 iterasi</b> (4 desimal).`,
        hint: `# N = ${N} (dari NIM Anda)\nx = ${x0}\nalpha = 0.15\n# f(x) = (x - 10)^2, target = 10\n# TODO: loop 5 iterasi gradient descent, kemudian print x final (4 desimal)`
      };
    }
  },
  // ── MODUL 10: ANOVA F-statistic ──
  {
    id: 'c13', modul: 10, parametric: true,
    compute: (N) => {
      const m1 = 8 + (N % 5);
      const m2 = 10 + (N % 4);
      const m3 = 12 + (N % 3);
      return {
        text: `ANOVA: 3 grup, n=5 per grup, means μ₁=<b>${m1}</b>, μ₂=<b>${m2}</b>, μ₃=<b>${m3}</b>. SS_within = 50. Hitung F-statistic (3 desimal).`,
        hint: `# N = ${N} (dari NIM Anda)\nimport numpy as np\nm1, m2, m3 = ${m1}, ${m2}, ${m3}\nn_per_group = 5\nss_within = 50\nk = 3            # jumlah grup\nn_total = k * n_per_group\n# TODO: hitung SS_between → MS_between, MS_within, lalu F = MS_b / MS_w (3 desimal),\n#       lalu print`
      };
    }
  },
  // ── MODUL 13: Logistic Regression with cross-entropy loss ──
  {
    id: 'c14', modul: 13, parametric: true,
    compute: (N) => {
      const z = 0.5 + (N % 8) * 0.2;  // 0.5 to 1.9
      return {
        text: `Logistic Regression sample dengan y=1 (true class), z = <b>0.5 + 0.2·(N mod 8) = ${z.toFixed(2)}</b>. Hitung cross-entropy loss = -log(σ(z)) (4 desimal).`,
        hint: `# N = ${N} (dari NIM Anda)\nimport numpy as np\nz = ${z.toFixed(2)}\ny_true = 1\n# TODO: hitung sigmoid σ(z), lalu cross-entropy loss = -log(σ(z)) (4 desimal),\n#       lalu print`
      };
    }
  },
  // ── MODUL 14: SVM hyperplane decision ──
  {
    id: 'c15', modul: 14, parametric: true,
    compute: (N) => {
      const x1 = 1 + (N % 5);  // 1-5
      const x2 = 2 + (N % 4);  // 2-5
      return {
        text: `SVM linear hyperplane: 2x₁ + 3x₂ − 10 = 0. Test sample x = (<b>${x1}, ${x2}</b>). Hitung margin distance dari sample ke hyperplane (3 desimal).`,
        hint: `# N = ${N} (dari NIM Anda)\nimport numpy as np\nw = np.array([2, 3])\nb = -10\nx = np.array([${x1}, ${x2}])\n# Hyperplane: w · x + b = 0\n# TODO: hitung margin distance dari titik x ke hyperplane (3 desimal),\n#       lalu print`
      };
    }
  }
];;

module.exports = { UAS_TF, UAS_MC, UAS_COMP_EZ, UAS_COMP_HARD };
