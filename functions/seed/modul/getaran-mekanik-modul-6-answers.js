/* eslint-disable max-len */
/**
 * getaran-mekanik-modul-6 — answer-key metadata.
 *
 * DIAUTHOR / DIKOREKSI MANUAL pada 2026-06-23 dari soal asli di
 * Getaran-Mekanik/Modul/Modul-6.html. Versi sebelumnya berisi placeholder
 * yang SALAH (kunci hasil jiplak modul lain — parameter & topik tidak cocok).
 * File ini BUKAN auto-generated; setiap jawaban diturunkan & diverifikasi
 * numerik dari soal Modul 6 (getaran paksa: base motion & rotating unbalance).
 *
 * Topik: base motion (displacement transmissibility T_d = X/Y, isolasi getaran)
 * + rotating unbalance (massa eksentrik m0·e, faktor pembesaran R = X·M/(m0·e)).
 *
 * Parameter Sistem Referensi (info-box Pertemuan 6):
 *   Base Motion        : m = 300 kg, k = 22500 N/m, c = 1500 Ns/m, Y = 0.05 m
 *                        => wn = sqrt(k/m) = 8.6603 rad/s, zeta = c/(2*sqrt(km)) = 0.28868
 *   Rotating Unbalance : M = 50 kg, m0 = 2 kg, e = 0.15 m, k = 120000 N/m, zeta = 0.08
 *                        => wn = sqrt(k/M) = 48.990 rad/s
 *
 * Rumus standar:
 *   T_d = sqrt( (1 + (2*zeta*r)^2) / ((1-r^2)^2 + (2*zeta*r)^2) )   (displacement transmissibility)
 *   R   = r^2 / sqrt( (1-r^2)^2 + (2*zeta*r)^2 )                    (rotating-unbalance magnification)
 *   r   = omega / wn
 *
 * Format: MC entries pakai letter answer (A/B/C/D), Comp pakai numeric answer +
 * tolerance. Explain WAJIB ada (modul reveal jawaban setelah submit untuk
 * pembelajaran formative).
 */

const MC = [
  { qId: "mc1", type: "mc", points: 1, answer: "B", explain: "Pada <strong>base motion</strong> gaya pegas & peredam bekerja pada perpindahan/kecepatan <em>relatif</em> massa terhadap pondasi. EOM yang benar: <code>m·ẍ + c·(ẋ − ẏ) + k·(x − y) = 0</code> (opsi B). (A) menganggap forcing langsung Y·sin(ωt) — keliru. (C) salah faktor m pada gaya pegas. (D) menghilangkan suku peredam relatif." },
  { qId: "mc2", type: "mc", points: 1, answer: "B", explain: "Displacement transmissibility base motion: <code>T_d = √[1+(2ζr)²] / √[(1−r²)²+(2ζr)²]</code> (opsi B). Suku <code>√[1+(2ζr)²]</code> di pembilang muncul karena pondasi mentransmisikan gerakan lewat <em>pegas dan peredam</em>. (A) itu DMF gaya konstan (tanpa numerator), (C) bentuk rotating unbalance (r² di pembilang), (D) bukan formula transmissibility." },
  { qId: "mc3", type: "mc", points: 1, answer: "C", explain: "Di <code>r = √2 ≈ 1.414</code> semua kurva T_d berpotongan di <strong>T_d = 1</strong> tanpa bergantung ζ — titik <em>crossover</em>. Untuk r &lt; √2 redaman menurunkan T_d; untuk r &gt; √2 redaman justru menaikkannya (zona isolasi, T_d &lt; 1). (A) isolasi sempurna tak pernah tercapai, (B) resonansi ada di r≈1, (D) bukan di r=√2." },
  { qId: "mc4", type: "mc", points: 1, answer: "B", explain: "Gaya eksitasi rotating unbalance = proyeksi gaya sentrifugal <code>m₀·e·ω²</code>, jadi EOM: <code>M·ẍ + c·ẋ + k·x = m₀·e·ω²·sin(ωt)</code> (opsi B). Amplitudo forcing tumbuh ∝ ω² (ciri khas unbalance). (A) lupa ω² (gaya tak bergantung kecepatan — salah), (C) m₀·g itu berat statik, (D) salah massa & suku forcing." },
  { qId: "mc5", type: "mc", points: 1, answer: "B", explain: "Faktor pembesaran rotating unbalance <code>R = X·M/(m₀·e) = r² / √[(1−r²)²+(2ζr)²]</code> (opsi B). Suku <code>r²</code> di pembilang berasal dari forcing ∝ ω². (A) DMF gaya konstan, (C) bentuk transmissibility (pembilang √[1+(2ζr)²]), (D) bukan magnification." },
  { qId: "mc6", type: "mc", points: 1, answer: "C", explain: "Saat <code>r → ∞</code>, R = r²/√[(1−r²)²+…] → 1, sehingga <code>X → m₀·e/M</code> (opsi C) — amplitudo jenuh di asimptot konstan, batas teoretis terendah yang tak bisa ditembus dengan menaikkan ω. (A) X tidak nol, (B) X tidak membesar tanpa batas (justru jenuh), (D) bukan e melainkan m₀e/M." },
  { qId: "mc7", type: "mc", points: 1, answer: "B", explain: "Pada <code>r → 0</code> (eksitasi sangat lambat) massa menyatu dengan pondasi → <code>T_d → 1</code> (rigid coupling, opsi B). Substitusi r=0: T_d = √1/√1 = 1. (A) T_d nol hanya di r→∞, (C) resonansi di r≈1, (D) 1/(2ζ) nilai di resonansi, bukan r→0." },
  { qId: "mc8", type: "mc", points: 1, answer: "B", explain: "Amplitudo asimptotik (r≫1) <code>X → m₀·e/M = 0.05/2000 = 2.5×10⁻⁵ m = 25 µm = 0.025 mm</code> (opsi B, lengkap dengan turunannya). Opsi A menyebut 25 µm tanpa pembenaran/satuan lengkap — jawaban paling tepat B. (C) 2.5 mm & (D) 25 mm salah dua–tiga orde besaran." },
  { qId: "mc9", type: "mc", points: 1, answer: "A", explain: "Akselerometer: ωₙ_sensor ≫ ω eksitasi ⇒ <code>r ≪ 1</code>. EOM relatif <code>m·z̈ + c·ż + k·z = m·Y·ω²·sin(ωt)</code>; pada r≪1 inersia & redaman diabaikan ⇒ <code>k·z ≈ m·Y·ω²</code> ⇒ <code>Z → m·Y·ω²/k = Y·r²</code> — perpindahan relatif sebanding akselerasi pondasi (Y·ω²). Inilah dasar kerja accelerometer (opsi A). (B) Z→Y berlaku untuk seismometer (r≫1), (C)/(D) salah." },
  { qId: "mc10", type: "mc", points: 1, answer: "B", explain: "Pada putaran kerja tetap (r≫1) amplitudo getaran rangka ≈ <code>m₀·e/M</code>. Cara menurunkannya tanpa mengubah rotor: <strong>menambah massa rangka M</strong> (blok inersia beton), opsi B. (A) menurunkan ω tidak praktis untuk turbin operasi, (C) menambah k justru menaikkan ωₙ → mendekatkan ke resonansi & memperbesar getaran, (D) gravitasi tak relevan." },
];

const COMP_EZ = [
  { qId: "c1", type: "comp", points: 2, answer: 8.6603, tolerance: 0.05, explain: "Frekuensi natural base motion <code>ωₙ = √(k/m) = √(22500/300) = √75 = <strong>8.6603 rad/s</strong></code>. Pakai <code>np.sqrt(k/m)</code> dengan k=22500, m=300." },
  { qId: "c2", type: "comp", points: 2, answer: 0.28868, tolerance: 0.005, explain: "Rasio redaman <code>ζ = c/(2√(km)) = 1500/(2·√(22500·300)) = 1500/5196.15 = <strong>0.28868</strong></code> (tak berdimensi). Redaman kritis <code>c_c = 2√(km) = 5196.15 Ns/m</code>." },
  { qId: "c3", type: "comp", points: 2, answer: 1.0504, tolerance: 0.02, explain: "Pada ω=12 rad/s, <code>r = ω/ωₙ = 12/8.6603 = 1.3856</code>. Maka <code>T_d = √[(1+(2·0.28868·1.3856)²)/((1−1.3856²)²+(2·0.28868·1.3856)²)] = <strong>1.0504</strong></code>. Di sekitar r=√2 nilai T_d masih ≈1." },
  { qId: "c4", type: "comp", points: 2, answer: 0.05252, tolerance: 0.002, explain: "Amplitudo absolut massa <code>X = T_d·Y = 1.0504·0.05 = <strong>0.05252 m</strong></code> (≈52.5 mm). T_d sedikit di atas 1, jadi massa bergetar nyaris sebesar pondasi (Y=0.05 m)." },
  { qId: "c5", type: "comp", points: 2, answer: 2.0, tolerance: 0.02, explain: "Saat resonansi r=1: <code>T_d = √(1+(2ζ)²)/(2ζ)</code>. Dengan ζ=0.28868: <code>2ζ=0.5774</code>, <code>T_d = √(1+0.3333)/0.5774 = √1.3333/0.5774 = 1.1547/0.5774 = <strong>2.0</strong></code> (nilai bulat: ζ=1/(2√3))." },
  { qId: "c6", type: "comp", points: 2, answer: 48.99, tolerance: 0.05, explain: "Frekuensi natural rangka rotating unbalance <code>ωₙ = √(k/M) = √(120000/50) = √2400 = <strong>48.990 rad/s</strong></code>. Pakai k=120000, M=50." },
  { qId: "c7", type: "comp", points: 2, answer: 83.776, tolerance: 0.1, explain: "Konversi 800 RPM ke rad/s: <code>ω = RPM·2π/60 = 800·2π/60 = <strong>83.776 rad/s</strong></code> (gunakan <code>np.pi</code>)." },
  { qId: "c8", type: "comp", points: 2, answer: 1.5045, tolerance: 0.02, explain: "Pada 800 RPM: <code>r = 83.776/48.990 = 1.7101</code>. Faktor pembesaran <code>R = r²/√[(1−r²)²+(2ζr)²] = 2.9244/√[(1−2.9244)²+(2·0.08·1.7101)²] = <strong>1.5045</strong></code> (ζ=0.08). Karena r&gt;1 dan ζ kecil, R masih &gt;1." },
  { qId: "c9", type: "comp", points: 2, answer: 2105.5, tolerance: 5, explain: "Gaya unbalance <code>F = m₀·e·ω² = 2·0.15·83.776² = 0.3·7018.4 = <strong>2105.5 N</strong></code>. Gaya tumbuh ∝ ω², jadi pada putaran tinggi gaya menjadi sangat besar." },
  { qId: "c10", type: "comp", points: 2, answer: 0.006, tolerance: 0.0003, explain: "Amplitudo asimptotik (r→∞) <code>X_∞ = m₀·e/M = (2·0.15)/50 = 0.3/50 = <strong>0.006 m</strong></code> (=6 mm). Ini batas teoretis terendah amplitudo getaran rangka pada kecepatan sangat tinggi." }
];

const COMP_HARD = [
  { qId: "c11", type: "comp", points: 4, answer: 1.4142, tolerance: 0.03, allowPartial: true, partialPoints: 1, explain: "Grid <code>r = np.linspace(0.5, 3.0, 5000)</code>, hitung <code>T_d(r, ζ=0.1)</code>, lalu deteksi titik di mana T_d melewati 1 via perubahan tanda (<code>np.diff(np.sign(T_d−1))</code>). Crossover numerik ≈ <strong>1.4142</strong>, persis di <code>√2 ≈ 1.41421</code> (titik crossover universal, independen ζ)." },
  { qId: "c12", type: "comp", points: 4, answer: 1.0065, tolerance: 0.02, allowPartial: true, partialPoints: 1, explain: "Puncak R(r) rotating unbalance bergeser sedikit DI ATAS 1. Dengan <code>scipy.optimize.minimize_scalar</code> atas −R(r), ζ=0.08, diperoleh <code>r_max = <strong>1.0065</strong></code>, cocok dengan analitik <code>r_max = 1/√(1−2ζ²) = 1/√(1−0.0128) = 1.00646</code>." },
  { qId: "c13", type: "comp", points: 4, answer: 5.12, tolerance: 0.15, allowPartial: true, partialPoints: 1, explain: "Frequency sweep T_d: <code>r = np.linspace(0.1, 3.0, 1000)</code>, ζ=0.1, ambil <code>np.max(T_d)</code>. Maksimum grid ≈ <strong>5.12</strong> (puncak sejati di r≈0.990, sedikit di bawah 1). Verifikasi analitik di r=1: <code>T_d = √(1+(2·0.1)²)/(2·0.1) = √1.04/0.2 = 5.099</code> — sedikit di bawah puncak sejati karena pergeseran resonansi base motion." },
  { qId: "c14", type: "comp", points: 4, answer: 0.327, tolerance: 0.06, allowPartial: true, partialPoints: 1, explain: "Run-up turbin: M=2000, k=2e7, c=8000, m₀e=0.05; ω(t)=(314/5)·t naik linear 0→314 rad/s dalam 5 s, fasa <code>φ(t)=½·(314/5)·t²</code>, forcing <code>m₀e·ω(t)²·sin(φ(t))</code>. Integrasi <code>scipy.integrate.odeint</code> EOM <code>m·ẍ+c·ẋ+k·x=…</code>. Sistem melewati resonansi (ωₙ=√(k/M)=100 rad/s pada t≈1.59 s); perpindahan puncak <code>X_max ≈ <strong>0.327 mm</strong></code> (stabil lintas resolusi & solver)." },
  { qId: "c15", type: "comp", points: 4, answer: 173050, tolerance: 3000, allowPartial: true, partialPoints: 1, explain: "Desain isolator: M=200, ω=100, ζ_iso=0.05, syarat T_d ≤ 0.1. Iterative search k_iso: untuk tiap k hitung <code>ωₙ=√(k/M)</code>, <code>r=ω/ωₙ</code>, <code>T_d</code>; ambil k_iso terbesar yang masih T_d≤0.1. Hasil <code>k_iso_max ≈ <strong>173050 N/m</strong></code> (≈1.73×10⁵; pada nilai ini T_d tepat ≈0.10). k lebih besar → ωₙ naik → r turun mendekati 1 → isolasi gagal." }
];

const MODUL_QUESTIONS = [...MC, ...COMP_EZ, ...COMP_HARD];

const SUMMARY = {
  "modulId": "getaran-mekanik-modul-6",
  "totalSoal": 25,
  "totalPoin": 50,
  "breakdown": {
    "mc": 10,
    "compEz": 10,
    "compHard": 5
  }
};

module.exports = { MODUL_QUESTIONS, SUMMARY };
