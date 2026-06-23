/* eslint-disable max-len */
/**
 * optoauto-modul-3 — answer-key metadata.
 *
 * DIAUTHOR/DIKOREKSI MANUAL pada 2026-06-23. Versi sebelumnya adalah
 * placeholder yang SALAH (kunci jiplakan dari modul lain — topik stasioneritas
 * deret waktu, tidak relevan). Kunci di file ini diturunkan langsung dari soal
 * asli pada source HTML (Optimalisasi-dan-Automasi/Modul/Modul-3.html) dan
 * diverifikasi numerik dengan numpy/pandas/scipy. JANGAN tandai sebagai
 * auto-generated.
 *
 * Topik: Akuisisi data industri — rantai sensor -> signal conditioning -> ADC,
 * dynamic range & resolusi ADC (DR = 6.02N + 1.76 dB, LSB = Vrange/2^N),
 * sampling/Nyquist & aliasing, penyimpanan bertingkat (hot/warm/cold),
 * protokol streaming (MQTT/OPC-UA), dan visualisasi dashboard time series.
 *
 * Catatan dataset referensi (dipakai C5-C9, C13, C14): soal komputasi memakai
 * DataFrame sintetis dari "Cell 1" modul, yang DETERMINISTIK karena
 * <code>np.random.seed(42)</code>. Parameter: 4 motor, 3600 sampel @1 Hz,
 * baseline = 1.5 + 0.3*i mm/s, noise = N(0, 0.15), motor_2 mendapat event
 * <code>linspace(0, 1.5, 300)</code> pada indeks 1800:2100. Jawaban berbasis
 * dataset ini reproducible bila urutan pemanggilan RNG sama persis dengan Cell 1.
 *
 * Format: MC pakai letter answer (A/B/C/D), Comp pakai numeric answer +
 * tolerance. Explain WAJIB ada (modul reveal jawaban setelah submit untuk
 * pembelajaran formative).
 */

const MC = [
  { qId: "mc1", type: "mc", points: 1, answer: "B", explain: "Rantai akuisisi data industri yang lengkap adalah <strong>Sensor -> Signal Conditioning -> ADC -> Edge Device -> Storage/Cloud</strong>. Signal conditioning (amplifikasi, filtering, isolasi) menyiapkan sinyal analog sebelum dikuantisasi ADC. (A) melewatkan conditioning & ADC; (C) tidak ada digitisasi; (D) urutan terbalik." },
  { qId: "mc2", type: "mc", points: 1, answer: "B", explain: "Dynamic range ADC ideal = <strong>6.02*N + 1.76 dB</strong> (turunan dari rasio sinyal full-scale sinus terhadap noise kuantisasi). Tiap bit menambah ~6 dB. (A) <code>N dB</code>, (C) <code>2N dB</code>, (D) <code>log2(N) dB</code> semuanya keliru." },
  { qId: "mc3", type: "mc", points: 1, answer: "C", explain: "Untuk mendeteksi bearing fault sampai 5 kHz, Nyquist menuntut fs > 10 kHz, tapi praktiknya dipakai <strong>oversampling 5-10x (25-50 kHz)</strong> agar ada margin untuk roll-off anti-aliasing filter. (A) 1 kHz pasti aliasing; (B) tepat di Nyquist tanpa margin; (D) 1 MHz boros & tidak perlu." },
  { qId: "mc4", type: "mc", points: 1, answer: "B", explain: "Tiered storage (hot/warm/cold) <strong>mengoptimalkan biaya</strong>: data panas yang sering di-query di SSD cepat, data lama di-downsample & dipindah ke tier murah. (A) performa query justru berbeda antar tier; (C) database tetap dibutuhkan; (D) data lama tetap bisa di-query." },
  { qId: "mc5", type: "mc", points: 1, answer: "B", explain: "Plot 100 line sekaligus menimbulkan <strong>visual clutter</strong> -- pola abnormal tersembunyi di tumpukan garis. <strong>Heatmap</strong> (baris=sensor, kolom=waktu, warna=nilai) jauh lebih terbaca. (A) line plot bukan selalu terbaik; (C)/(D) bukan masalah utamanya." },
  { qId: "mc6", type: "mc", points: 1, answer: "C", explain: "Perubahan frekuensi dominan terhadap waktu (mis. motor startup) divisualisasikan dengan <strong>spectrogram</strong> (sumbu waktu vs frekuensi, warna = amplitudo). (A) line plot tak menampakkan frekuensi; (B) boxplot membuang info waktu; (D) pie chart tidak relevan." },
  { qId: "mc7", type: "mc", points: 1, answer: "B", explain: "<strong>Parquet</strong> (columnar, terkompresi) jauh lebih efisien dari CSV untuk batch analytics -- tipikal 10-20x lebih kecil dan jauh lebih cepat dibaca. (A) CSV buruk untuk dataset besar; (C) JSON boros untuk numerik; (D) XML tidak wajib." },
  { qId: "mc8", type: "mc", points: 1, answer: "C", explain: "Soal mencari yang BUKAN masalah saat ADC range terlalu LEBAR untuk sinyal lemah. (A) resolusi efektif anjlok, (B) SNR rendah, (D) solusi pakai gain amplifier -- semuanya valid. <strong>(C) clipping/distorsi justru terjadi saat range terlalu SEMPIT</strong>, bukan terlalu lebar -- maka (C) yang BUKAN masalah." },
  { qId: "mc9", type: "mc", points: 1, answer: "B", explain: "Monitoring puluhan motor dengan latency rendah + resource gateway terbatas paling cocok pakai <strong>MQTT</strong> (pub/sub ringan, overhead kecil, standar IoT). (A) HTTP polling boros; (C) FTP per menit lambat & batch; (D) email jelas tidak layak untuk telemetri real-time." },
  { qId: "mc10", type: "mc", points: 1, answer: "C", explain: "Anti-pattern visualisasi time series: <strong>plot ribuan titik tanpa downsampling</strong> (browser hang, PDF membengkak) dan pakai <strong>rainbow colormap</strong> yang tidak perceptually uniform. (A) label sumbu, (B) colormap viridis, (D) judul informatif justru praktik baik." }
];

const COMP_EZ = [
  { qId: "c1", type: "comp", points: 2, answer: 20000, tolerance: 1, explain: "Bandwidth data ADC = <code>fs * (bits/8) * channels</code>. Untuk <code>fs = 10000 Hz</code>, 16-bit, 1 channel: <code>10000 * (16/8) * 1 = <strong>20000 byte/detik</strong></code> (= 2 byte/sample x 10k sample/detik)." },
  { qId: "c2", type: "comp", points: 2, answer: 68.6646, tolerance: 0.05, explain: "Storage 1 jam = <code>bandwidth * 3600 / 1024^2</code>. Dengan bandwidth 20000 byte/s: <code>20000 * 3600 / 1048576 = <strong>68.66 MB</strong></code> untuk 1 jam data ADC 16-bit 10 kHz." },
  { qId: "c3", type: "comp", points: 2, answer: 98.08, tolerance: 0.1, explain: "Dynamic range ADC <code>DR = 6.02*N + 1.76</code> dB. Untuk <code>N = 16</code> bit: <code>6.02*16 + 1.76 = 96.32 + 1.76 = <strong>98.08 dB</strong></code>." },
  { qId: "c4", type: "comp", points: 2, answer: 305.1758, tolerance: 0.5, explain: "LSB (resolusi tegangan) <code>= V_range / 2^N</code>. Untuk range +-10 V (<code>V_range = 20 V</code>), 16-bit: <code>20 / 65536 = 3.0518e-4 V = <strong>305.18 uV</strong></code> (dikali 1e6 untuk uV)." },
  { qId: "c5", type: "comp", points: 2, answer: 1.504, tolerance: 0.02, explain: "Mean <code>motor_1_rms</code> dari dataset referensi (seed 42). Motor 1 = baseline 1.5 + noise N(0,0.15) tanpa event, sehingga rata-ratanya mendekati baseline: <code>np.mean(df['motor_1_rms']) ~= <strong>1.504 mm/s</strong></code>." },
  { qId: "c6", type: "comp", points: 2, answer: 3.5932, tolerance: 0.1, explain: "Max <code>motor_2_rms</code>. Motor 2 (baseline 1.8) mendapat event ramp <code>linspace(0,1.5,300)</code> di indeks 1800:2100, jadi puncaknya jauh di atas baseline: <code>df['motor_2_rms'].max() ~= <strong>3.59 mm/s</strong></code>." },
  { qId: "c7", type: "comp", points: 2, answer: 102, tolerance: 4, explain: "Jumlah titik <code>motor_2_rms > 2.8</code> (threshold ISO 10816 warning). Lonjakan akibat event mendorong sebagian sampel di atas 2.8: <code>(df['motor_2_rms'] > 2.8).sum() = <strong>102</strong></code>. Toleransi sedikit longgar karena bergantung noise." },
  { qId: "c8", type: "comp", points: 2, answer: 12, tolerance: 0.5, explain: "Resample 5 menit max atas 60 menit data: <code>df.resample('5min').max()</code> menghasilkan <code>60/5 = <strong>12</strong></code> baris (12 bin waktu)." },
  { qId: "c9", type: "comp", points: 2, answer: 3, tolerance: 0.5, explain: "Jumlah motor dengan max RMS > 2.5 mm/s. Max per motor ~= [2.09, 3.59, 2.61, 2.91]; motor 1 di bawah ambang, tiga lainnya di atas: <code>(df.max() > 2.5).sum() = <strong>3</strong></code>." },
  { qId: "c10", type: "comp", points: 2, answer: 50, tolerance: 0.5, explain: "FFT sinus murni 50 Hz, <code>fs = 5000 Hz</code>, 1 detik. Sumbu <code>np.fft.rfftfreq(N, 1/fs)</code> pada <code>np.argmax(|np.fft.rfft(x)|)</code> memberi puncak tepat di <strong>50 Hz</strong>." }
];

const COMP_HARD = [
  { qId: "c11", type: "comp", points: 4, answer: 31.25, tolerance: 4, allowPartial: true, partialPoints: 1, explain: "Spectrogram sinyal 30 Hz murni (<code>fs = 1000</code>, 2 s, <code>nperseg = 128, noverlap = 64</code>). Resolusi bin = <code>fs/nperseg = 1000/128 = 7.8125 Hz</code>, jadi bin terdekat ke 30 Hz adalah <code>31.25 Hz</code>. Rata-ratakan power sepanjang waktu (<code>np.mean(Sxx, axis=1)</code>) lalu ambil <code>f[np.argmax(...)] = <strong>31.25 Hz</strong></code>." },
  { qId: "c12", type: "comp", points: 4, answer: 20, tolerance: 1, allowPartial: true, partialPoints: 1, explain: "Aliasing: sinyal 120 Hz disampel di <code>fs = 100 Hz</code> (di bawah Nyquist 50 Hz). Frekuensi alias = <code>|f - k*fs|</code> dengan k integer terdekat = <code>|120 - 100| = <strong>20 Hz</strong></code>. FFT memang menampakkan puncak di 20 Hz, bukan 120 Hz asli." },
  { qId: "c13", type: "comp", points: 4, answer: 21, tolerance: 2, allowPartial: true, partialPoints: 1, explain: "Pipeline heatmap: resample 5 menit max (12x4), transpose (rows=motor, cols=bin), lalu hitung sel > 2.5 mm/s. Per motor: 0 + 1 + 8 + 12 = <code>(mat.values > 2.5).sum() = <strong>21</strong></code> sel anomali yang akan ditandai di heatmap." },
  { qId: "c14", type: "comp", points: 4, answer: 0.0, tolerance: 0.08, allowPartial: true, partialPoints: 1, explain: "Rata-rata pairwise correlation off-diagonal (<code>df.corr()</code> diambil <code>np.triu_indices_from(.., k=1)</code> lalu di-mean). Karena motor independen (hanya 1 punya event), korelasinya sangat kecil mendekati nol: <code>~= -0.008 ~= <strong>0</strong></code>." },
  { qId: "c15", type: "comp", points: 4, answer: 193.119, tolerance: 0.5, allowPartial: true, partialPoints: 1, explain: "Storage tier edge GB = <code>fs * (bits/8) * channels * detik_per_hari * hari / 1024^3</code>. Untuk 8 motor, <code>fs = 10000</code>, 16-bit, retensi 15 hari: <code>10000 * 2 * 8 * 86400 * 15 / 1073741824 ~= <strong>193.12 GB</strong></code>." }
];

const MODUL_QUESTIONS = [...MC, ...COMP_EZ, ...COMP_HARD];

const SUMMARY = {
  "modulId": "optoauto-modul-3",
  "totalSoal": 25,
  "totalPoin": 50,
  "breakdown": {
    "mc": 10,
    "compEz": 10,
    "compHard": 5
  }
};

module.exports = { MODUL_QUESTIONS, SUMMARY };
