/* eslint-disable max-len */
/**
 * optoauto-modul-2 — answer-key metadata.
 * Topik: Filtering & Smoothing Time Series (Moving Average, EMA, Savitzky-Golay,
 * Median filter, low-pass / penghapusan spike).
 *
 * DIAUTHOR/DIKOREKSI MANUAL pada 2026-06-23. Versi sebelumnya adalah placeholder
 * yang SALAH (hasil jiplak modul lain — topik stasioneritas Matematika 4) dan
 * sudah diganti total. Kunci di sini diturunkan langsung dari soal asli pada
 * source HTML (Optimalisasi-dan-Automasi/Modul/Modul-2.html) dan diverifikasi
 * numerik dengan numpy/scipy/pandas. BUKAN auto-generated.
 *
 * Dataset referensi yang dipakai SEMUA soal komputasi C1–C13 & C15 (SSOT, dari
 * info-box "Dataset Referensi" di HTML — JANGAN ubah seed/parameter):
 *
 *   import numpy as np
 *   np.random.seed(42)
 *   fs = 1000; T_dur = 2.0; N = int(fs * T_dur)            # N = 2000
 *   t = np.linspace(0, T_dur, N, endpoint=False)
 *   clean  = np.sin(2*np.pi*5*t)                            # 5 Hz baseline murni
 *   noise  = np.random.normal(0, 0.5, N)                   # gaussian noise berat
 *   spikes = np.zeros(N); spikes[[100,500,1000,1500]] = 5  # 4 impulse spike
 *   y = clean + noise + spikes                             # deret yang difilter
 *
 * C14 memakai sinyal turunan: y_anom = clean + noise (tanpa spike) lalu
 * y_anom[[250,750,1250]] += 4.0 (clean & noise sama dengan referensi di atas).
 *
 * Format: MC pakai letter answer (A/B/C/D), Comp pakai numeric answer + tolerance.
 * Explain WAJIB ada (modul reveal jawaban setelah submit untuk pembelajaran
 * formative).
 */

const MC = [
  { qId: "mc1", type: "mc", points: 1, answer: "B", explain: "Filter low-pass meloloskan komponen frekuensi rendah dan meredam frekuensi tinggi — tepatnya <strong>mengurangi noise frekuensi tinggi sambil mempertahankan komponen frekuensi rendah</strong> (sinyal asli). (A) salah, filter tidak memperbesar amplitudo asli; (C) itu transformasi Fourier (FFT), bukan low-pass; (D) itu autokorelasi." },
  { qId: "mc2", type: "mc", points: 1, answer: "B", explain: "Trailing (causal) MA hanya memakai sampel masa lalu + sekarang sehingga bisa dipakai <strong>real-time monitoring</strong>, tetapi memperkenalkan <strong>lag ≈ (k−1)/2 sampel</strong>. (A) salah — justru butuh data masa lalu; (C) zero phase shift hanya dicapai filter centered/non-causal (mis. filtfilt), bukan trailing; (D) polynomial fitting itu ciri Savitzky-Golay." },
  { qId: "mc3", type: "mc", points: 1, answer: "B", explain: "Pada <code>EMA_t = α·x_t + (1−α)·EMA_{t−1}</code> dengan α = 0.5, bobot observasi terbaru dan history <strong>setara (0.5 : 0.5)</strong> → filter sangat responsif tetapi masih cukup noisy. (A) dominasi history terjadi saat α kecil; (C) salah, EMA tetap menjejak sinyal; (D) α = 0.5 valid sempurna (0 ≤ α ≤ 1)." },
  { qId: "mc4", type: "mc", points: 1, answer: "B", explain: "Savitzky-Golay mem-fit polinomial lokal sehingga <strong>menjaga amplitudo puncak/lembah jauh lebih baik (preserve features)</strong> dibanding Moving Average yang cenderung memipihkan peak. (A) SG tidak selalu lebih cepat; (C) & (D) salah — SG justru WAJIB punya parameter window dan polynomial order." },
  { qId: "mc5", type: "mc", points: 1, answer: "C", explain: "Impulse spike tunggal paling efektif dihapus oleh <strong>median filter</strong> — sifat nonlinear-nya (mengambil nilai tengah window) menelan outlier sepenuhnya tanpa menyebar energinya. (A) MA hanya meredam & menyebarkan spike; (B) EMA responsif malah ikut melonjak; (D) SG (linear, polynomial) tetap terpengaruh spike." },
  { qId: "mc6", type: "mc", points: 1, answer: "B", explain: "Window MA yang terlalu besar membuat <strong>transient/lonjakan singkat ikut tersmoothing → anomali terlewat dan lag deteksi membesar</strong>. (A) jelas salah, ada dampak; (C) konsumsi memori bukan isu utama; (D) MA window besar tidak setara EMA α=1 (α=1 = passthrough tanpa smoothing)." },
  { qId: "mc7", type: "mc", points: 1, answer: "B", explain: "Hubungan baku faktor smoothing EMA dengan effective window: <strong>α = 2/(N+1)</strong>, ekuivalen <strong>N = 2/α − 1</strong>. Inilah relasi yang dipakai di C8 (α=0.1 → N=19). (A), (C), (D) bukan relasi yang benar." },
  { qId: "mc8", type: "mc", points: 1, answer: "D", explain: "<strong>Bias DC dari kalibrasi adalah systematic offset, BUKAN noise</strong> — ia konstan/deterministik dan dikoreksi dengan re-zero/kalibrasi, bukan difilter sebagai noise acak. Sebaliknya (A) thermal noise resistor, (B) quantization noise ADC, dan (C) EMI motor/inverter semuanya sumber noise nyata. Soal menanyakan yang BUKAN sumber noise → (D)." },
  { qId: "mc9", type: "mc", points: 1, answer: "B", explain: "Pipeline pre-processing standar untuk noise gaussian + spike: <strong>Median dulu (hapus spike) → Savitzky-Golay (smoothing yang preserve peak) → analisis</strong>. Spike harus dibuang lebih dulu agar tidak mencemari tahap smoothing. (A) FFT di awal tidak menghapus spike; (C) urutan tidak masuk akal; (D) ada urutan baku berbasis sifat tiap filter." },
  { qId: "mc10", type: "mc", points: 1, answer: "B", explain: "Smoothing time-domain (MA/EMA) sebelum FFT <strong>mendistorsi spektrum — amplitudo peak teratenuasi dan posisi/akurasi frekuensi bergeser</strong>, sehingga severity assessment getaran jadi salah. MA/EMA pada dasarnya low-pass yang mengubah konten frekuensi. (A) FFT tetap jalan; (C) salah arah; (D) Python jelas mendukung pipeline-nya." },
];

const COMP_EZ = [
  { qId: "c1", type: "comp", points: 2, answer: 0.9006, tolerance: 0.02, explain: "RMS sinyal mentah <code>= np.sqrt(np.mean(y**2))</code>. Untuk dataset referensi (5 Hz + noise σ=0.5 + 4 spike amplitudo 5), hasilnya <strong>≈ 0.9006</strong> — jauh di atas RMS clean (≈ 0.707) karena tambahan energi noise & spike." },
  { qId: "c2", type: "comp", points: 2, answer: 0.0326, tolerance: 0.01, explain: "Moving Average <code>np.convolve(y, np.ones(10)/10, mode='same')</code> lalu <code>np.mean</code>. MA tidak mengubah komponen DC, jadi mean hasil ≈ mean sinyal asli (sinusoida rata-rata ~0 plus kontribusi 4 spike/N) → <strong>≈ 0.0326</strong> (mendekati <code>np.mean(y)</code> ≈ 0.0325; selisih kecil dari zero-padding tepi mode 'same')." },
  { qId: "c3", type: "comp", points: 2, answer: 0.6495, tolerance: 0.02, explain: "MA window <code>k=50</code> lalu <code>np.std(..., ddof=1)</code>. Smoothing kuat menekan ragam noise sehingga std hasil <strong>≈ 0.6495</strong>, lebih kecil dari std raw (≈ 0.90); std di sini didominasi sisa gelombang 5 Hz yang masih sebagian lolos." },
  { qId: "c4", type: "comp", points: 2, answer: -0.2217, tolerance: 0.03, explain: "EMA <code>pd.Series(y).ewm(alpha=0.1, adjust=False).mean().values</code>, ambil <code>ema[-1]</code>. Nilai akhir mengikuti fase sinyal 5 Hz di ujung deret (plus sisa noise) → <strong>≈ −0.2217</strong>. α=0.1 cukup halus sehingga spike sebelumnya sudah teredam jauh di titik akhir." },
  { qId: "c5", type: "comp", points: 2, answer: 2.9566, tolerance: 0.05, explain: "EMA responsif <code>alpha=0.5</code>, ambil <code>ema[1500]</code> — tepat di spike ke-4 (y[1500] ≈ 5.39). Karena <code>EMA_t = 0.5·y_t + 0.5·EMA_{t−1}</code>, separuh lonjakan langsung masuk → <strong>≈ 2.9566</strong>. α besar 'menyerap' spike dengan kuat (bukan menolaknya), berbeda dari median filter." },
  { qId: "c6", type: "comp", points: 2, answer: 1.309, tolerance: 0.05, explain: "Savitzky-Golay <code>savgol_filter(y, 11, polyorder=3)</code>, ambil indeks 1000 (lokasi spike, y[1000] ≈ 5.70). SG (linear) tetap terkena spike tetapi meredamnya menjadi <strong>≈ 1.309</strong> — lebih halus dari raw namun TIDAK menghapus spike sepenuhnya seperti median filter." },
  { qId: "c7", type: "comp", points: 2, answer: -0.0859, tolerance: 0.03, explain: "Median filter <code>medfilt(y, kernel_size=5)</code>, ambil indeks 100 (spike pertama, y[100] ≈ 4.29). Median window 5 mengganti spike dengan nilai tengah tetangga sehingga spike <strong>terhapus total</strong> → tinggal nilai noise <strong>≈ −0.0859</strong>, bukan ~4–5. Ini membuktikan keunggulan median terhadap impulse." },
  { qId: "c8", type: "comp", points: 2, answer: 19, tolerance: 0.5, explain: "Effective window EMA <code>N = 2/α − 1</code>. Untuk α = 0.1: <code>N = 2/0.1 − 1 = 20 − 1 = <strong>19</strong></code> sampel. Ini kebalikan dari relasi <code>α = 2/(N+1)</code> pada MC7." },
  { qId: "c9", type: "comp", points: 2, answer: 0.5467, tolerance: 0.02, explain: "Residual <code>= y − clean</code> menyisakan murni (noise + spike), lalu RMS <code>= np.sqrt(np.mean(residual**2))</code> → <strong>≈ 0.5467</strong>. Nilai ini mengukur total kontaminasi: sedikit di atas σ noise (0.5) karena tambahan energi 4 spike." },
  { qId: "c10", type: "comp", points: 2, answer: 0.7066, tolerance: 0.02, explain: "MA <code>k=25</code> pada y lalu RMS hasil <code>= np.sqrt(np.mean(ma25**2))</code> → <strong>≈ 0.7066</strong>, hampir identik dengan RMS clean (0.707). Window 25 cukup besar untuk menekan noise & meratakan spike tetapi tetap mempertahankan energi gelombang 5 Hz, sehingga RMS pulih ke nilai aslinya." }
];

const COMP_HARD = [
  { qId: "c11", type: "comp", points: 4, answer: 0.0328, tolerance: 0.01, allowPartial: true, partialPoints: 1, explain: "MA from scratch (tanpa convolve/pandas), window <code>k=15</code> centered <code>y[max(0,i−7):min(N,i+8)]</code> dengan boundary handling, lalu <code>np.mean</code> seluruh output → <strong>≈ 0.0328</strong>. Hampir sama dengan mean(y) ≈ 0.0325; selisih tipis muncul karena window tepi memakai sampel lebih sedikit (rata-rata lokal sebenarnya, bukan zero-pad seperti mode 'same')." },
  { qId: "c12", type: "comp", points: 4, answer: 0.6215, tolerance: 0.02, allowPartial: true, partialPoints: 1, explain: "EMA from scratch α=0.05 dengan inisialisasi <code>EMA[0] = mean(y[:10])</code> (bukan y[0]), iterasi <code>EMA_i = α·y_i + (1−α)·EMA_{i−1}</code>, ambil indeks 100 → <strong>≈ 0.6215</strong>. α kecil membuat filter sangat halus; nilai di idx 100 masih terangkat oleh spike pertama (yang berada tepat di idx 100) yang baru mulai diserap." },
  { qId: "c13", type: "comp", points: 4, answer: 1.0013, tolerance: 0.03, allowPartial: true, partialPoints: 1, explain: "Savitzky-Golay from scratch: untuk pusat window di indeks 500, fit <code>np.polyfit(np.arange(−5,6), y[495:506], 3)</code> lalu evaluasi di pusat <code>np.polyval(coeffs, 0)</code> → <strong>≈ 1.0013</strong>. Hasil ini cocok persis dengan <code>savgol_filter(y,11,3)[500]</code> (validasi silang), membuktikan implementasi manual benar." },
  { qId: "c14", type: "comp", points: 4, answer: 6, tolerance: 0.5, allowPartial: true, partialPoints: 1, explain: "Anomaly detection EMA(α=0.05) + aturan 3σ. Sinyal <code>y_anom = clean + noise</code> (tanpa spike) lalu <code>y_anom[[250,750,1250]] += 4.0</code>; residual = y_anom − EMA; hitung titik dengan <code>|residual| &gt; 3·std(residual)</code>. Terdeteksi <strong>6</strong> titik (indeks ≈ 209, 250, 750, 1101, 1250, 1615) — yaitu 3 anomali injeksi PLUS 3 deteksi tambahan akibat lag EMA yang membuat residual besar di sekitar lonjakan, persis seperti dicatat soal." },
  { qId: "c15", type: "comp", points: 4, answer: 0.6896, tolerance: 0.02, allowPartial: true, partialPoints: 1, explain: "Pipeline lengkap pada y: (1) <code>medfilt(kernel_size=5)</code> menghapus 4 spike, (2) <code>savgol_filter(window=11, polyorder=3)</code> smoothing yang preserve peak, (3) <code>ewm(alpha=0.1).mean()</code> baseline halus; lalu RMS output akhir → <strong>≈ 0.6896</strong>. Mendekati RMS clean (0.707) — pipeline berhasil membersihkan noise & spike sambil mempertahankan gelombang 5 Hz (sedikit di bawah 0.707 karena EMA α=0.1 ikut meredam amplitudo sinyal)." }
];

const MODUL_QUESTIONS = [...MC, ...COMP_EZ, ...COMP_HARD];

const SUMMARY = {
  "modulId": "optoauto-modul-2",
  "totalSoal": 25,
  "totalPoin": 50,
  "breakdown": {
    "mc": 10,
    "compEz": 10,
    "compHard": 5
  }
};

module.exports = { MODUL_QUESTIONS, SUMMARY };
