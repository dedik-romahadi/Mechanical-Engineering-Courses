/* eslint-disable max-len */
/**
 * getaran-mekanik-modul-9 — answer-key metadata.
 *
 * Konten: MDoF Modal Analysis (N-DoF). Sinkron dengan Modul-9.html versi
 * current. Sebelumnya seed ini berisi konten 2-DoF lama (jun 2026 audit
 * menemukan mismatch) — di-rewrite full.
 *
 * Format: MC entries pakai letter answer (A/B/C/D), Comp pakai numeric answer +
 * tolerance. Explain WAJIB ada (modul reveal jawaban setelah submit untuk
 * pembelajaran formative).
 */

const MC = [
  { qId: "mc1", type: "mc", points: 1, answer: "B", explain: "Modal analysis mengubah sistem coupled N-DoF (matriks penuh) menjadi N persamaan independent 1-DoF dalam koordinat modal (<strong>decoupling</strong>). Setiap mode dianalisis terpisah lalu di-superposisi. Bukan untuk reduce noise atau FFT — itu beda topik." },
  { qId: "mc2", type: "mc", points: 1, answer: "C", explain: "Sistem N-DoF punya <strong>tepat N frekuensi pribadi</strong> (eigenvalue) dan N mode shape (eigenvector). Misal: 2-DoF → 2 frekuensi, 5-DoF building → 5 frekuensi. Setiap pasang (ωᵢ, φᵢ) merupakan eigenmode sistem." },
  { qId: "mc3", type: "mc", points: 1, answer: "B", explain: "Substitusi solusi harmonik <code>x = X·sin(ωt)</code> ke <code>[M]ẍ + [K]x = 0</code> menghasilkan <code>(K − ω²M)X = 0</code>, atau ekuivalen <code>[K]{φ} = ω²[M]{φ}</code>. Disebut <em>generalized</em> karena melibatkan dua matriks (K dan M), bukan standard <code>A{φ} = λ{φ}</code>." },
  { qId: "mc4", type: "mc", points: 1, answer: "B", explain: "Mass-normalization: scaling mode shape supaya modal mass = 1, yaitu <code>φᵀMφ = 1</code>. Konsekuensi langsung: modal stiffness <code>φᵀKφ = ω²</code> (langsung jadi kuadrat frekuensi). Decoupled equations jadi simple: <code>η̈ᵢ + ωᵢ²·ηᵢ = fᵢ</code>." },
  { qId: "mc5", type: "mc", points: 1, answer: "C", explain: "Mode shape dengan frekuensi distinct (ωᵢ ≠ ωⱼ) <strong>orthogonal terhadap matriks M</strong>: <code>φᵢᵀMφⱼ = 0</code> untuk i ≠ j. Juga orthogonal terhadap K: <code>φᵢᵀKφⱼ = 0</code>. Sifat orthogonality ini lah yang memungkinkan decoupling modal." },
  { qId: "mc6", type: "mc", points: 1, answer: "A", explain: "Modal matrix <code>[Φ] = [φ₁ φ₂ ... φₙ]</code> — stack semua N mode shape sebagai <strong>kolom</strong>. Ukuran N×N. Untuk mass-normalized: <code>ΦᵀMΦ = I</code> (identitas), <code>ΦᵀKΦ = diag(ωᵢ²)</code> (diagonal of squared freqs)." },
  { qId: "mc7", type: "mc", points: 1, answer: "B", explain: "Forward transform: <code>{x} = [Φ]{η}</code> (respons fisik = kombinasi linier mode dengan amplitudo modal η). Inverse (untuk mass-normalized): <code>{η} = [Φ]ᵀ[M]{x}</code> (gunakan orthogonality property). Transformasi linier antara N koordinat fisik ↔ N koordinat modal." },
  { qId: "mc8", type: "mc", points: 1, answer: "B", explain: "Modal superposition: respons total = <strong>jumlah kontribusi setiap mode</strong>: <code>x(t) = Σᵢ φᵢ·ηᵢ(t)</code>. Setiap modal coord ηᵢ(t) dipecahkan independent (1-DoF, simple), lalu di-combine via mode shape. Berlaku untuk linear systems (superposition principle)." },
  { qId: "mc9", type: "mc", points: 1, answer: "B", explain: "Mode truncation: hanya gunakan beberapa mode dengan <strong>effective modal mass tertinggi</strong> (umumnya 5-10 mode untuk struktur civil/mechanical). Modes dengan ω tinggi tapi excitation kecil bisa diabaikan tanpa kehilangan akurasi signifikan. Hemat komputasi orders of magnitude." },
  { qId: "mc10", type: "mc", points: 1, answer: "B", explain: "Effective modal mass: <code>m_eff,i = (Γᵢ)²</code> dengan <code>Γᵢ = φᵢᵀM·{r}</code> (modal participation factor), <code>{r}</code> = influence vector eksitasi. Γᵢ mengukur 'coupling' mode-i terhadap distribusi eksitasi. Jumlah semua m_eff = total mass sistem (mass participation property)." }
];

const COMP_EZ = [
  { qId: "c1", type: "comp", points: 2, answer: 10, tolerance: 0.05, explain: "<code>scipy.linalg.eigh(K, M)</code> return eigenvalues λ = ω² (BUKAN ω langsung). Untuk K=[[200,-100],[-100,200]], M=I: <code>det(K - λI) = (200-λ)² - 10000 = 0</code> → λ = 100 atau 300. ω₁ = <code>np.sqrt(min(λ)) = √100 = <strong>10 rad/s</strong></code>. Common mistake: print eigvals[0] mentah (= 100, salah)." },
  { qId: "c2", type: "comp", points: 2, answer: 1.591, tolerance: 0.01, explain: "Konversi frekuensi sudut → ordinal: <code>f = ω/(2π)</code>. Dengan ω=10: <code>f = 10/(2π) = 10/6.2832 ≈ <strong>1.591 Hz</strong></code>. Gunakan <code>f = w / (2*np.pi)</code>. Periode T = 1/f ≈ 0.628 s (lihat c10)." },
  { qId: "c3", type: "comp", points: 2, answer: 0.707, tolerance: 0.01, explain: "Cari scaling c sehingga (cφ)ᵀM(cφ) = 1 → <code>c²·(φᵀMφ) = 1</code>. Untuk φ=[1,1], M=I: <code>φᵀMφ = 1²+1² = 2</code>. Jadi <code>c² = 1/2 → c = 1/√2 ≈ <strong>0.707</strong></code>. Mode shape mass-normalized = c·φ = [0.707, 0.707]." },
  { qId: "c4", type: "comp", points: 2, answer: 0, tolerance: 0.001, explain: "Mass-normalized modal matrix Φ punya property <code>ΦᵀMΦ = I</code> (identitas). Jadi norm dari (ΦᵀMΦ - I) harus ≈ 0 (machine precision, ~1e-15). Gunakan <code>np.linalg.norm(Phi.T @ M @ Phi - np.eye(N))</code>. Verifikasi numerik dari orthogonality property." },
  { qId: "c5", type: "comp", points: 2, answer: 1.414, tolerance: 0.01, explain: "Modal participation factor: <code>Γ₁ = φ₁ᵀM·r</code>. Untuk mass-normalized φ₁=[1/√2, 1/√2], M=I, r=[1,1]: <code>Γ₁ = (1/√2)(1) + (1/√2)(1) = 2/√2 = √2 ≈ <strong>1.414</strong></code>. Mengukur 'coupling' mode 1 dengan distribusi ground motion r." },
  { qId: "c6", type: "comp", points: 2, answer: 2000, tolerance: 0.5, explain: "Shear building 3-DoF uniform k: <code>K = [[2k,-k,0],[-k,2k,-k],[0,-k,k]]</code>. K[1,1] (lantai tengah, indexing dari 0) = 2k karena ada 2 pegas (atas+bawah lantai itu). Dengan k=1000: <code>K[1,1] = 2·1000 = <strong>2000 N/m</strong></code>. Lantai paling atas K[2,2]=k (hanya 1 pegas)." },
  { qId: "c7", type: "comp", points: 2, answer: 1, tolerance: 0.001, explain: "By definition mass-normalized: <code>φᵢᵀMφᵢ = 1</code>. Jadi modal mass untuk mass-normalized mode shape = <strong>1</strong> (selalu, untuk semua mode). Setelah scaling mass-norm, m̃ᵢ = 1 untuk semua i. Property fundamental yg memudahkan modal equations." },
  { qId: "c8", type: "comp", points: 2, answer: 100, tolerance: 0.5, explain: "Untuk mass-normalized mode: <code>φᵢᵀKφᵢ = ωᵢ²</code> (modal stiffness = kuadrat frekuensi). Dengan ω₁=10: <code>k̃₁ = ω₁² = 10² = <strong>100</strong></code>. Modal equation jadi <code>η̈₁ + 100·η₁ = f₁</code> — simple harmonic oscillator independent." },
  { qId: "c9", type: "comp", points: 2, answer: 0.01, tolerance: 0.001, explain: "Rayleigh damping: <code>c = αM + βK</code>. Modal damping ratio: <code>ζᵢ = (α + β·ωᵢ²) / (2·ωᵢ)</code>. Dengan α=0.1, β=0.001, ω₁=10: <code>ζ₁ = (0.1 + 0.001×100)/(2×10) = (0.1 + 0.1)/20 = 0.2/20 = <strong>0.01</strong></code> (1% damping, lightly damped)." },
  { qId: "c10", type: "comp", points: 2, answer: 0.628, tolerance: 0.01, explain: "Periode = waktu 1 osilasi lengkap. <code>T = 2π/ω</code>. Dengan ω₁=10 rad/s: <code>T = 2π/10 = 6.2832/10 ≈ <strong>0.628 detik</strong></code>. Atau ekuivalen <code>T = 1/f = 1/1.591 ≈ 0.628 s</code>. Periode mode 1 (yg paling rendah) selalu paling panjang dari semua mode." }
];

const COMP_HARD = [
  { qId: "c11", type: "comp", points: 4, answer: 11.5, tolerance: 1.5, allowPartial: true, partialPoints: 1, explain: "5-DoF shear building tridiagonal: K[i,i] = 2k kecuali K[4,4]=k (top); K[i,i±1]=-k. M = m·I. Dengan k=1.6e6, m=1000: build K (5×5), M (5×5), lalu <code>eigvals, _ = scipy.linalg.eigh(K, M)</code>. ω₁ = sqrt(eigvals[0]) ≈ <strong>11.5 rad/s</strong> (lowest mode, paling rendah)." },
  { qId: "c12", type: "comp", points: 4, answer: 0.7, tolerance: 0.4, allowPartial: true, partialPoints: 1, explain: "Free vibration modal superposition 3-DoF (k=1000, m=1): build K, M, solve eigh untuk dapat Φ, ωᵢ. Modal initial conditions: <code>η₀ = ΦᵀMx₀</code> (project x₀=[1,0,0] ke modal coords). Solusi: <code>x(t) = Σᵢ φᵢ·η₀ᵢ·cos(ωᵢ·t)</code>. Evaluasi di t spesifik (mis. t=0.5 s) untuk dapat respons fisik mass 1 (x[0])." },
  { qId: "c13", type: "comp", points: 4, answer: 1.5, tolerance: 1, allowPartial: true, partialPoints: 1, explain: "Modal participation factors untuk shear building 3-DoF dengan ground motion r=[1,1,1]: setelah dapat Φ mass-normalized, hitung <code>Γᵢ = Φ[:,i].T @ M @ r</code> untuk i=0,1,2. |Γ₁| ≈ <strong>1.5</strong> (mode 1 punya participation tinggi karena monotonic shape, in-phase dgn ground motion uniform)." },
  { qId: "c14", type: "comp", points: 4, answer: 85, tolerance: 10, allowPartial: true, partialPoints: 1, explain: "5-DoF building: hitung effective modal mass <code>m_eff,i = Γᵢ²</code> untuk semua mode (mass-normalized). Total mass sistem = N·m = 5000 (untuk 5 lantai × 1000 kg). Cumulative untuk 2 mode pertama: <code>(m_eff,1 + m_eff,2) / total × 100%</code>. Hasil ≈ <strong>85%</strong> — 2 mode pertama sudah capture mayoritas response (mode truncation rule of thumb)." },
  { qId: "c15", type: "comp", points: 4, answer: 0.5, tolerance: 1, allowPartial: true, partialPoints: 1, explain: "2-DoF forced harmonic via modal superposition: M=I, K=[[200,-100],[-100,200]], F₁(t)=10cos(8t), F₂=0. Solve eigh → Φ, ω. Modal force: <code>f̃ = ΦᵀF₀</code>. Steady-state modal: <code>ηᵢ = f̃ᵢ/(ωᵢ² - 8²)</code>. Respons fisik amplitudo: <code>X = Φ·η_steady</code>. |X₁| ≈ <strong>0.5</strong> (steady-state amplitudo mass 1)." }
];

const MODUL_QUESTIONS = [...MC, ...COMP_EZ, ...COMP_HARD];

const SUMMARY = {
  "modulId": "getaran-mekanik-modul-9",
  "totalSoal": 25,
  "totalPoin": 50,
  "breakdown": {
    "mc": 10,
    "compEz": 10,
    "compHard": 5
  }
};

module.exports = { MODUL_QUESTIONS, SUMMARY };
