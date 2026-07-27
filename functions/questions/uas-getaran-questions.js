/* eslint-disable max-len */
/**
 * Getaran Mekanik UAS — bank soal (teks/opsi/hint), diekstrak VERBATIM dari
 * `Getaran-Mekanik/Exam/UAS.html` (UAS_TF/UAS_MC/UAS_COMP_EZ/UAS_COMP_HARD).
 *
 * SUMBER KEBENARAN: file ini HARUS byte-identik (isi compute()/text/options)
 * dengan blok const yang sama di UAS.html — satu-satunya perbedaan adalah
 * exposure: di sini lewat module.exports (server, dibaca getExamQuestions
 * SETELAH PIN+jadwal terverifikasi), bukan window.UAS_TF (client, dulu
 * ter-embed statis & bisa dibaca via View Source sebelum jadwal buka).
 *
 * TIDAK berisi kunci jawaban (correctIdx/answer/expected) — itu tetap di
 * functions/seed/uas-getaran-answers.js + Firestore examAnswers/. Lihat
 * Pedoman §40.29.
 *
 * ⚠ Kalau UAS.html diedit (soal ditambah/diubah), file ini WAJIB disamakan
 * ulang (re-extract), lalu `firebase deploy --only functions`.
 */

const UAS_TF = [
  // ── MODUL 8: Persamaan Gerak Multibody ──
  {
    id: 'tf1', modul: 8, parametric: false,
    text: "Persamaan Lagrange L = T − V (Lagrangian) digunakan untuk derivasi EoM sistem multibody dengan koordinat generalized — tidak butuh Free Body Diagram eksplisit."
  },
  {
    id: 'tf2', modul: 8, parametric: true,
    compute: (N) => {
      const dof = (N % 4) + 2;  // 2 to 5
      return {
        text: `Sistem 2-DoF mass-spring-damper dengan matriks [M], [K] berukuran 2×2 menghasilkan <b>${dof}</b> frekuensi natural pribadi (eigenvalues). Apakah pernyataan benar?`
      };
    }
  },
  // ── MODUL 9: Modal Analysis ──
  {
    id: 'tf3', modul: 9, parametric: false,
    text: "Mode shape adalah RASIO defleksi antar DoF (bukan amplitudo absolut). Konvensi mass-normalization: φᵀMφ = 1."
  },
  {
    id: 'tf4', modul: 9, parametric: true,
    compute: (N) => {
      const n = (N % 5) + 3;  // 3 to 7
      return {
        text: `Pada gedung shear-building <b>${n} lantai</b> (m identik per lantai), mode 1 (fundamental) selalu memiliki frekuensi <em>terendah</em> dengan semua lantai sefase. Apakah pernyataan benar?`
      };
    }
  },
  // ── MODUL 10: TMD/Vibration Absorber ──
  {
    id: 'tf5', modul: 10, parametric: false,
    text: "Tuned Mass Damper (TMD) bekerja dengan menambah massa absorber kecil yang di-tune ke frekuensi eksitasi — menciptakan dua puncak baru di kiri-kanan ω_target dengan anti-resonance di tengah."
  },
  // ── MODUL 11: Fourier/FFT ──
  {
    id: 'tf6', modul: 11, parametric: false,
    text: "Teorema Nyquist mensyaratkan sample rate fs ≥ 2·f_max untuk merekonstruksi sinyal frekuensi f_max tanpa aliasing."
  },
  {
    id: 'tf7', modul: 11, parametric: true,
    compute: (N) => {
      const fmax = 50 + N*2;  // 50 to 248 Hz
      const fs_required = 2 * fmax;
      const fs_actual = 100 + N;  // 100 to 199 Hz
      const ok = fs_actual >= fs_required;
      return {
        text: `Sinyal vibration mengandung frekuensi maksimum <b>f_max = 50 + 2N = ${fmax} Hz</b>. Sample rate yang tersedia: <b>fs = 100 + N = ${fs_actual} Hz</b>. Apakah aliasing TERHINDAR?`
      };
    }
  },
  // ── MODUL 12: Time-domain stats ──
  {
    id: 'tf8', modul: 12, parametric: false,
    text: "Crest Factor (CF = peak/RMS) lebih sensitif terhadap impulsive defect (early bearing fault) dibanding RMS biasa — CF > 5 mengindikasikan abnormality."
  },
  // ── MODUL 13: Spectrum Diagnosis ──
  {
    id: 'tf9', modul: 13, parametric: true,
    compute: (N) => {
      // BPFO calculation: BPFO = (Nb/2)·fr·(1 - (d/D)·cos(α))
      // Untuk SKF 6203: Nb=8 balls, d/D ≈ 0.41, α=0
      const rpm = 1500 + N*30;  // 1500 to 4470 rpm
      return {
        text: `Bearing SKF 6203 (Nb=8 bola, d/D=0.41) berputar pada <b>RPM = 1500 + 30N = ${rpm}</b>. Frekuensi BPFO (Ball Pass Frequency Outer race) ≈ <b>100 Hz</b>?`
      };
    }
  },
  // ── MODUL 14: Condition Monitoring ──
  {
    id: 'tf10', modul: 14, parametric: false,
    text: "Predictive Maintenance (CM-based) typically saves 30-40% dari biaya maintenance dibanding reactive (run-to-failure), karena early detection mencegah collateral damage."
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// BAGIAN B — PILIHAN GANDA (20 soal × 1 poin = 20 poin)
// ═══════════════════════════════════════════════════════════════════════════
// Setiap MC: 4 opsi, correctIdx menandai jawaban benar
// Untuk parametric MC, opsi di-shuffle dengan seed N agar urutan stabil per NIM
const UAS_MC = [
  // ── MODUL 8: Persamaan Gerak Multibody (3 soal) ──
  {
    id: 'mc1', modul: 8, parametric: false,
    text: "Metode Lagrange untuk derivasi EoM sistem multibody menggunakan...",
    options: [
      "Free Body Diagram setiap body dengan ΣF=ma",
      "Lagrangian L = T − V dan ∂/∂t(∂L/∂q̇) − ∂L/∂q = Q",
      "Newton II Law langsung dalam koordinat global",
      "Persamaan Bernoulli untuk fluid coupling"
    ]
  },
  {
    id: 'mc2', modul: 8, parametric: false,
    text: "Pada sistem 2-DoF dengan matriks massa [M] = [[m₁,0],[0,m₂]] dan kekakuan [K] = [[k₁+k₂,-k₂],[-k₂,k₂+k₃]], jumlah frekuensi pribadi yang dihasilkan adalah:",
    options: ["1 frekuensi", "2 frekuensi", "3 frekuensi", "4 frekuensi"]
  },
  {
    id: 'mc3', modul: 8, parametric: true,
    compute: (N) => {
      const m1 = 2 + (N % 5);  // 2 to 6
      return {
        text: `Sistem 2-DoF simetris: m₁ = m₂ = <b>2 + (N mod 5) = ${m1} kg</b>, k = 100 N/m (semua pegas). Frekuensi mode 1 (in-phase) adalah ω₁ = √(k/m). Berapa nilai ω₁?`,
        options: ["< 5 rad/s", "5–7 rad/s", "7–10 rad/s", "≥ 10 rad/s"]
      };
    }
  },
  // ── MODUL 9: Modal Analysis (3 soal) ──
  {
    id: 'mc4', modul: 9, parametric: false,
    text: "Generalized eigenvalue problem [K]{φ} = ω²[M]{φ} di Modal Analysis menghasilkan...",
    options: [
      "Eigenvalues = mode shape; eigenvectors = frekuensi natural",
      "Eigenvalues = ω² (frekuensi natural²); eigenvectors = mode shape",
      "Eigenvalues = damping ratio; eigenvectors = frequency response",
      "Eigenvalues = transient solution; eigenvectors = steady-state"
    ]
  },
  {
    id: 'mc5', modul: 9, parametric: false,
    text: "Mass-orthogonality property mode shapes φᵢ dan φⱼ untuk i≠j adalah...",
    options: [
      "φᵢᵀ·M·φⱼ = 0 (mode orthogonal terhadap M)",
      "φᵢᵀ·φⱼ = 1 (unit vectors)",
      "φᵢᵀ·K·φⱼ = ω² (proporsional eigenvalue)",
      "φᵢ × φⱼ = 0 (cross product zero)"
    ]
  },
  {
    id: 'mc6', modul: 9, parametric: true,
    compute: (N) => {
      const stories = 3 + (N % 4);  // 3-6 stories
      return {
        text: `Untuk gedung shear-building <b>${stories} lantai</b> (m identik, k identik per kolom), berapa banyak mode shape yang harus dianalisis untuk modal superposition lengkap?`,
        options: [`${stories - 1} mode`, `${stories} mode`, `${stories + 1} mode`, `${stories + 2} mode`]
      };
    }
  },
  // ── MODUL 10: TMD (3 soal) ──
  {
    id: 'mc7', modul: 10, parametric: false,
    text: "Den Hartog optimal tuning untuk TMD passive dengan mass ratio μ memberikan frekuensi tuning ω_a*:",
    options: [
      "ω_a* = ω_target (sama dengan frekuensi target)",
      "ω_a* = ω_target / (1 + μ)",
      "ω_a* = ω_target × (1 + μ)",
      "ω_a* = ω_target × √(1 + μ)"
    ]
  },
  {
    id: 'mc8', modul: 10, parametric: true,
    compute: (N) => {
      const mu = 0.05 + (N % 10) * 0.02;  // 0.05 to 0.23
      const muPercent = (mu * 100).toFixed(0);
      return {
        text: `TMD design dengan mass ratio <b>μ = m_a/M = ${(mu).toFixed(2)} (${muPercent}%)</b>. Bandwidth isolasi (lebar zona attenuasi) tergolong:`,
        options: ["Sempit (< 10% μ)", "Sedang (10-20% μ)", "Lebar (≥ 20% μ)", "Tidak ada bandwidth (μ=0)"]
      };
    }
  },
  {
    id: 'mc9', modul: 10, parametric: false,
    text: "Taipei 101 menggunakan Tuned Mass Damper paling visible di dunia — sphere kuning 660 ton di lantai 88-92. Tipe TMD ini adalah:",
    options: [
      "Active TMD dengan power supply + control system",
      "Pendulum TMD (PTMD) dengan cable suspension",
      "Semi-active TMD dengan adjustable damping",
      "Wire-rope shock isolator"
    ]
  },
  // ── MODUL 11: Fourier/FFT (3 soal) ──
  {
    id: 'mc10', modul: 11, parametric: false,
    text: "Algoritma Fast Fourier Transform (FFT) Cooley-Tukey memiliki kompleksitas:",
    options: ["O(N²)", "O(N log N)", "O(N³)", "O(2^N)"]
  },
  {
    id: 'mc11', modul: 11, parametric: true,
    compute: (N) => {
      const fmax = 200 + N*5;  // 200 to 695 Hz
      return {
        text: `Sinyal getaran motor dengan f_max = <b>200 + 5N = ${fmax} Hz</b>. Sample rate minimum (anti-aliasing) yang diperlukan:`,
        options: ["≤ 500 Hz", "500–1000 Hz", "1000–1500 Hz", "> 1500 Hz"]
      };
    }
  },
  {
    id: 'mc12', modul: 11, parametric: false,
    text: "Hanning window mengurangi spectral leakage dengan side-lobe -32 dB (vs rectangular -13 dB). Kompromi yang harus diterima:",
    options: [
      "Tidak ada kompromi — Hanning selalu lebih baik",
      "Resolusi frekuensi turun ~1.5×",
      "Nyquist rate naik 2×",
      "Phase information hilang"
    ]
  },
  // ── MODUL 12: Time-domain stats (3 soal) ──
  {
    id: 'mc13', modul: 12, parametric: false,
    text: "RMS (Root Mean Square) sinyal getaran adalah indikator dari:",
    options: [
      "Frekuensi dominan sinyal",
      "Energi total sinyal",
      "Distribusi statistik (skewness)",
      "Crest factor"
    ]
  },
  {
    id: 'mc14', modul: 12, parametric: true,
    compute: (N) => {
      const rms = 1.5 + N*0.1;  // 1.5 to 11.4 mm/s
      return {
        text: `Pengukuran RMS getaran motor 50 kW: <b>v_rms = 1.5 + 0.1N = ${rms.toFixed(1)} mm/s</b>. Berdasarkan ISO 10816-3 Class II, mesin ini berada di zona:`,
        options: ["A — Good (acceptable)", "B — Acceptable (monitor)", "C — Unsatisfactory (action soon)", "D — Stop immediately"]
      };
    }
  },
  {
    id: 'mc15', modul: 12, parametric: false,
    text: "Kurtosis sinyal getaran > 3.5 mengindikasikan...",
    options: [
      "Distribusi Gaussian normal — tidak ada masalah",
      "Sinyal sinusoidal stabil",
      "Impulsive content — early bearing fault signature",
      "Signal saturated (clipping)"
    ]
  },
  // ── MODUL 13: Spectrum Diagnosis (3 soal) ──
  {
    id: 'mc16', modul: 13, parametric: false,
    text: "Order tracking spectrum (sumbu X dalam orders bukan Hz) dipakai untuk:",
    options: [
      "Mesin variable-speed (RPM bervariasi)",
      "Bearing dengan diameter besar",
      "Sinyal sangat low-frequency (< 1 Hz)",
      "Reduce phase noise"
    ]
  },
  {
    id: 'mc17', modul: 13, parametric: false,
    text: "Envelope analysis (Hilbert transform → demodulasi) digunakan untuk diagnosis:",
    options: [
      "Unbalance (1× RPM)",
      "Misalignment (2× RPM)",
      "Bearing faults (BPFO, BPFI hidden under structural resonance)",
      "Soft foot looseness"
    ]
  },
  {
    id: 'mc18', modul: 13, parametric: true,
    compute: (N) => {
      const rpm = 1200 + N*30;  // 1200 to 4170 rpm
      return {
        text: `Bearing 6203 (Nb=8, d/D=0.41) di motor RPM = <b>1200 + 30N = ${rpm}</b>. Frekuensi BPFI (inner race fault):`,
        options: ["< 100 Hz", "100–200 Hz", "200–400 Hz", "≥ 400 Hz"]
      };
    }
  },
  // ── MODUL 14: Condition Monitoring (2 soal) ──
  {
    id: 'mc19', modul: 14, parametric: false,
    text: "Sensor mounting untuk vibration measurement frekuensi tinggi (>5 kHz) terbaik adalah:",
    options: [
      "Magnet mount (cepat, easy)",
      "Adhesive (cyanoacrylate)",
      "Stud-mount (drilled+tapped, gold standard)",
      "Hand-held probe"
    ]
  },
  {
    id: 'mc20', modul: 14, parametric: true,
    compute: (N) => {
      // Trending: degradation t to threshold
      const rate = 0.5 + N*0.05;  // 0.5 to 5.45 mm/s per month
      const current = 4.5 + N*0.1;  // 4.5 to 14.4 mm/s
      return {
        text: `Motor saat ini RMS = <b>${current.toFixed(1)} mm/s</b>, degradation rate = <b>${rate.toFixed(2)} mm/s/bulan</b>, threshold ISO Zone D = 11.2 mm/s. RUL (Remaining Useful Life):`,
        options: ["> 12 bulan", "6–12 bulan", "0–6 bulan", "Sudah melewati threshold (urgent!)"]
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// BAGIAN C — KOMPUTASI EASY/MEDIUM (10 soal × 2 poin = 20 poin)
// ═══════════════════════════════════════════════════════════════════════════
// Setiap soal: 5-15 baris kode Python. Hint berisi kerangka kode lengkap.
// IDs: c1 - c10
const UAS_COMP_EZ = [
  // ── MODUL 8: 2 soal komputasi sedang ──
  {
    id: 'c1', modul: 8, parametric: true,
    compute: (N) => {
      return {
        text: `Sistem 2-DoF: m₁=2 kg, m₂=1 kg, k₁=k₃=100 N/m, k₂=50 N/m. Hitung frekuensi mode 1 (ω₁, terendah) dalam rad/s. (Round 2 desimal)`
      };
    }
  },
  {
    id: 'c2', modul: 8, parametric: true,
    compute: (N) => {
      const m = 5 + (N % 6);  // 5-10 kg
      return {
        text: `Sistem SDOF dengan m = <b>5 + (N mod 6) = ${m} kg</b>, k = 200 N/m. Hitung frekuensi natural ω_n (rad/s, 2 desimal).`
      };
    }
  },
  // ── MODUL 9: Modal Analysis ──
  {
    id: 'c3', modul: 9, parametric: true,
    compute: (N) => {
      // Gedung shear: stories=N%4+3, m=1, k=100
      const stories = (N % 4) + 3;
      return {
        text: `Gedung shear-building <b>${stories} lantai</b> (m=1, k=100 per lantai). Hitung frekuensi mode 1 (rad/s, 3 desimal). Gunakan ω₁ = 2·sin(π/(2(2n+1)))·√(k/m).`
      };
    }
  },
  // ── MODUL 10: TMD ──
  {
    id: 'c4', modul: 10, parametric: true,
    compute: (N) => {
      const mu = 0.05 + (N % 10) * 0.01;  // 0.05 to 0.14
      return {
        text: `TMD untuk struktur dengan ω_target = 50 rad/s. Mass ratio <b>μ = 0.05 + 0.01·(N mod 10) = ${mu.toFixed(2)}</b>. Hitung frekuensi tuning optimal Den Hartog ω_a* (rad/s, 3 desimal).`
      };
    }
  },
  {
    id: 'c5', modul: 10, parametric: true,
    compute: (N) => {
      const mu = 0.05 + (N % 10) * 0.01;
      return {
        text: `Lanjutan: dengan μ yang sama (<b>μ = ${mu.toFixed(2)}</b>), hitung damping ratio TMD optimal ζ_a* (4 desimal). Formula: ζ_a* = √(3μ/(8(1+μ)³))`
      };
    }
  },
  // ── MODUL 11: FFT ──
  {
    id: 'c6', modul: 11, parametric: true,
    compute: (N) => {
      const fmax = 200 + N*3;  // 200 to 497 Hz
      return {
        text: `Sinyal vibration dengan f_max = <b>200 + 3N = ${fmax} Hz</b>. Hitung sample rate Nyquist minimum fs (Hz, integer).`
      };
    }
  },
  {
    id: 'c7', modul: 11, parametric: true,
    compute: (N) => {
      const fs = 1000 + N*10;  // 1000 to 1990 Hz
      return {
        text: `FFT dengan sample rate fs = <b>${fs} Hz</b>, window length T = 1 detik. Hitung resolusi frekuensi Δf (Hz, 4 desimal).`
      };
    }
  },
  // ── MODUL 12: Time-domain stats ──
  {
    id: 'c8', modul: 12, parametric: true,
    compute: (N) => {
      const A = 1 + N*0.05;  // 1 to 5.95 mm/s peak
      return {
        text: `Sinyal sinusoidal pure dengan amplitude peak <b>A = 1 + 0.05N = ${A.toFixed(2)} mm/s</b>. Hitung RMS (mm/s, 3 desimal).`
      };
    }
  },
  {
    id: 'c9', modul: 12, parametric: true,
    compute: (N) => {
      const peak = 8 + N*0.1;  // 8 to 17.9
      const rms = 2 + N*0.03;  // 2 to 4.97
      return {
        text: `Sinyal getaran: peak = <b>8 + 0.1N = ${peak.toFixed(1)} mm/s</b>, RMS = <b>2 + 0.03N = ${rms.toFixed(2)} mm/s</b>. Hitung Crest Factor CF = peak/RMS (3 desimal).`
      };
    }
  },
  // ── MODUL 13: Spectrum Diagnosis ──
  {
    id: 'c10', modul: 13, parametric: true,
    compute: (N) => {
      const rpm = 1200 + N*30;  // 1200 to 4170 rpm
      return {
        text: `Bearing SKF 6204 (Nb=8, d=7.94mm, D=33.5mm, α=0). RPM = <b>${rpm}</b>. Hitung BPFO = (Nb/2)·fr·(1−d/D·cos α) dalam Hz (3 desimal).`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// BAGIAN D — KOMPUTASI HARD (5 soal × 4 poin = 20 poin)
// ═══════════════════════════════════════════════════════════════════════════
// Setiap soal: 20-50+ baris kode. Algoritma lengkap.
// IDs: c11 - c15
// Partial credit +1 poin jika kode di-submit (non-empty) tapi output salah/error.
const UAS_COMP_HARD = [
  // ── MODUL 9: Modal Analysis 2-DoF eigenvalue full computation ──
  {
    id: 'c11', modul: 9, parametric: true,
    compute: (N) => {
      // 2-DoF: m1=1, m2=1+N%5, k1=100, k2=50, k3=100
      const m2 = 1 + (N % 5);  // 1-5 kg
      return {
        text: `Sistem 2-DoF: m₁=1, m₂=<b>1 + (N mod 5) = ${m2} kg</b>, k₁=k₃=100, k₂=50. Hitung frekuensi mode 2 (ω₂, tertinggi) dalam rad/s, 3 desimal. <em>Petunjuk: dengan numpy: import numpy as np; M = np.diag([1, ${m2}]); K = np.array([[150,-50],[-50,150]]); from scipy.linalg import eig; w² = eig(K, M)[0]; ω = np.sqrt(np.real(w²)); print(np.sort(ω)[-1])</em>`
      };
    }
  },
  // ── MODUL 11: FFT magnitude computation ──
  {
    id: 'c12', modul: 11, parametric: true,
    compute: (N) => {
      // Sinyal: x(t) = A·sin(2π·f·t), durasi T, fs
      const A = 2 + (N % 8);  // 2 to 9
      const f = 50 + (N % 10) * 5;  // 50 to 95 Hz
      return {
        text: `Sinyal x(t) = <b>${A}·sin(2π·${f}·t)</b>, sampling fs=1000 Hz, T=1 detik (N=1000 samples). Hitung magnitude FFT one-sided di bin frekuensi ${f} Hz (no normalisasi, integer).`
      };
    }
  },
  // ── MODUL 12: ISO 10816 zone classification ──
  {
    id: 'c13', modul: 12, parametric: true,
    compute: (N) => {
      // Hitung RMS dari histogram amplitudes
      const A1 = 1 + N*0.1;  // 1 to 10.9
      const A2 = 0.5 + N*0.05;  // 0.5 to 5.45
      return {
        text: `Sinyal getaran motor besar: x(t) = <b>${A1.toFixed(1)}·sin(2π·30·t) + ${A2.toFixed(2)}·sin(2π·90·t)</b> mm/s. Hitung RMS total (mm/s, 3 desimal). <em>Tip: untuk multi-frekuensi orthogonal, RMS_total = √(Σ(Aᵢ²/2))</em>`
      };
    }
  },
  // ── MODUL 13: Bearing fault frequency complete ──
  {
    id: 'c14', modul: 13, parametric: true,
    compute: (N) => {
      // BPFI for SKF 6307: Nb=8, d=12.7mm, D=51mm
      const rpm = 1500 + N*25;  // 1500 to 3975 rpm
      return {
        text: `Bearing 6307 (Nb=8, d=12.7mm, D=51mm). Mesin RPM = <b>${rpm}</b>. Identifikasi jarak antara dua sideband BPFI ± fr di spektrum (Hz, 3 desimal).`
      };
    }
  },
  // ── MODUL 14: RUL prediction with degradation model ──
  {
    id: 'c15', modul: 14, parametric: true,
    compute: (N) => {
      // Linear degradation model: y(t) = y0 + r·t
      // y(0) = current, y(t_RUL) = threshold
      const current = 4.5 + (N % 7) * 0.5;  // 4.5 to 7.5 mm/s
      const rate = 0.3 + (N % 8) * 0.1;  // 0.3 to 1.0 mm/s/month
      return {
        text: `Vibration trending motor: current RMS = <b>${current.toFixed(1)} mm/s</b>, degradation rate = <b>${rate.toFixed(1)} mm/s/bulan</b>. Threshold ISO 10816 Zone D (alarm) = 11.2 mm/s. Hitung RUL (Remaining Useful Life) dalam bulan, 2 desimal.`
      };
    }
  }
];

module.exports = { UAS_TF, UAS_MC, UAS_COMP_EZ, UAS_COMP_HARD };
