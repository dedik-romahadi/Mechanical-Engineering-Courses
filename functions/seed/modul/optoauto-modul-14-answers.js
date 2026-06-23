/* eslint-disable max-len */
/**
 * optoauto-modul-14 — answer-key metadata.
 *
 * Source of truth untuk kunci jawaban (server-side validation via
 * checkModulAnswer). Modul-14 = ML lanjutan untuk PdM (imbalanced data,
 * ROC-AUC, threshold tuning, cost-sensitive) — DIBEDAKAN dari Modul-13
 * (ML baseline / core classifiers).
 *
 * Format: MC entries pakai letter answer (A/B/C/D), Comp pakai numeric answer +
 * tolerance. Explain WAJIB ada (modul reveal jawaban setelah submit untuk
 * pembelajaran formative).
 */

const MC = [
  { qId: "mc1", type: "mc", points: 1, answer: "C", explain: "Pada imbalance ekstrem, classifier naif (selalu prediksi kelas mayoritas) mencapai accuracy = proporsi mayoritas (99%) tetapi recall fault = 0 → tak berguna untuk PdM. Gunakan <strong>recall, F1, balanced accuracy, ROC-AUC, PR-AUC</strong> yang sensitif ke kelas minoritas." },
  { qId: "mc2", type: "mc", points: 1, answer: "B", explain: "<strong>ROC-AUC</strong> = P(skor sampel positif acak &gt; skor sampel negatif acak) = area di bawah kurva TPR vs FPR. Tidak bergantung pada satu threshold, sehingga mengukur kualitas <em>ranking</em> probabilitas. 0.5 = tebak acak, 1.0 = pemisahan sempurna." },
  { qId: "mc3", type: "mc", points: 1, answer: "D", explain: "Saat negatif berlimpah, FPR = FP/(FP+TN) tetap kecil meski FP banyak → ROC terlihat bagus secara menyesatkan. <strong>PR curve</strong> (precision vs recall) hanya melibatkan kelas positif/minoritas, sehingga lebih jujur menggambarkan kemampuan deteksi fault." },
  { qId: "mc4", type: "mc", points: 1, answer: "B", explain: "<strong>SMOTE</strong> menambah sampel minoritas dengan interpolasi linier antara sampel minoritas dan k tetangga terdekatnya — menghasilkan titik baru yang plausibel, bukan duplikat. Mengurangi bias mayoritas tanpa overfitting yang muncul dari random oversampling (duplikasi). (A) itu undersampling." },
  { qId: "mc5", type: "mc", points: 1, answer: "A", explain: "<code>class_weight='balanced'</code> memberi bobot <code>n_samples/(n_classes×n_class_samples)</code> → kelas minoritas dapat bobot besar, sehingga loss menalti misklasifikasi fault lebih berat. Alternatif algoritmik untuk SMOTE tanpa menambah data." },
  { qId: "mc6", type: "mc", points: 1, answer: "C", explain: "Default 0.5 mengasumsikan biaya FP = FN dan kelas seimbang. Di PdM, FN jauh lebih mahal dan data imbalanced → threshold optimal digeser (mis. turunkan agar recall fault naik), dipilih lewat <strong>Youden's J</strong>, target recall, atau kurva biaya." },
  { qId: "mc7", type: "mc", points: 1, answer: "B", explain: "<strong>FN</strong> = fault lolos → potensi kegagalan katastrofik, downtime tak terjadwal, risiko keselamatan (biaya sangat tinggi). <strong>FP</strong> = false alarm → inspeksi tambahan (biaya kecil). Karena itu PdM keselamatan mengutamakan <em>recall</em> (minimalkan FN), menerima beberapa FP." },
  { qId: "mc8", type: "mc", points: 1, answer: "D", explain: "<strong>Random Forest</strong>: bagging — banyak pohon dalam (deep) dilatih paralel pada bootstrap sample, hasil di-vote → mengurangi <em>varians</em>. <strong>Gradient Boosting</strong>: pohon dangkal dilatih sekuensial, tiap pohon fit residual/gradien pohon sebelumnya → mengurangi <em>bias</em>. GB sering lebih akurat tetapi lebih sensitif tuning." },
  { qId: "mc9", type: "mc", points: 1, answer: "B", explain: "<strong>Permutation importance</strong>: acak satu kolom fitur (rusak hubungannya dengan target), ukur penurunan metrik (mis. AUC). Penurunan besar = fitur penting. Model-agnostic, dihitung pada data test, dan menghindari bias impurity importance pada fitur kardinalitas tinggi." },
  { qId: "mc10", type: "mc", points: 1, answer: "C", explain: "<strong>Drift</strong>: distribusi data produksi bergeser dari data training (mesin menua, sensor diganti, kondisi operasi berubah) → kinerja model turun. Solusi: monitoring distribusi fitur (PSI/KS test) &amp; metrik (AUC/recall), alert saat drift, lalu <em>retrain</em> berkala dengan data baru." }
];

const COMP_EZ = [
  { qId: "c1", type: "comp", points: 2, answer: 0.8947, tolerance: 0.01, explain: "<code>85/(85+10) = 0.8947</code>. Specificity = kemampuan mengenali healthy yang benar-benar healthy (1 − FPR)." },
  { qId: "c2", type: "comp", points: 2, answer: 0.918, tolerance: 0.01, explain: "recall = 80/85 = 0.9412; specificity = 85/95 = 0.8947; <code>(0.9412+0.8947)/2 = 0.918</code>. Balanced accuracy adil untuk data imbalanced (tidak bias ke mayoritas)." },
  { qId: "c3", type: "comp", points: 2, answer: 19, tolerance: 0.1, explain: "<code>950/50 = 19.0</code>. Rasio 19:1 tergolong imbalanced berat → perlu SMOTE / class_weight / metrik yang tepat (bukan accuracy)." },
  { qId: "c4", type: "comp", points: 2, answer: 900, tolerance: 1, explain: "<code>950 − 50 = 900</code> sampel sintetis (mis. via SMOTE) untuk mencapai keseimbangan 1:1." },
  { qId: "c5", type: "comp", points: 2, answer: 0.8359, tolerance: 0.01, explain: "sensitivity = 0.9412; specificity = 0.8947; <code>J = 0.9412 + 0.8947 − 1 = 0.8359</code>. Youden's J dipakai memilih threshold optimal (J maksimum)." },
  { qId: "c6", type: "comp", points: 2, answer: 0.625, tolerance: 0.01, explain: "<code>5(0.75)(0.6)/(4(0.75)+0.6) = 2.25/3.6 = 0.625</code>. F2 memberi bobot recall 2× precision — cocok untuk PdM yang anti-FN." },
  { qId: "c7", type: "comp", points: 2, answer: 0.7778, tolerance: 0.02, explain: "Pasangan pos&gt;neg: 0.9&gt;{0.5,0.3,0.6}=3; 0.4&gt;{0.3}=1; 0.8&gt;{0.5,0.3,0.6}=3 → 7 dari 9 = <code>0.7778</code>. AUC = statistik Mann-Whitney U dinormalkan." },
  { qId: "c8", type: "comp", points: 2, answer: 10, tolerance: 0.1, explain: "<code>1000/(2×50) = 10.0</code>. Misklasifikasi 1 sampel fault dihitung setara 10 sampel healthy saat training." },
  { qId: "c9", type: "comp", points: 2, answer: 60, tolerance: 0.5, explain: "<code>10×1 + 5×10 = 60</code>. Evaluasi cost-sensitive: model dipilih untuk meminimalkan total biaya, bukan sekadar accuracy." },
  { qId: "c10", type: "comp", points: 2, answer: 0.9177, tolerance: 0.01, explain: "<code>√(0.9412 × 0.8947) = √0.8421 = 0.9177</code>. G-mean tinggi hanya bila KEDUA kelas dikenali baik — metrik favorit untuk imbalanced." }
];

const COMP_HARD = [
  { qId: "c11", type: "comp", points: 4, answer: 0.917, tolerance: 0.03, allowPartial: true, partialPoints: 1, explain: "AUC ≈ 0.917 dari 100×100 pasangan. Setara dengan <code>sklearn.metrics.roc_auc_score</code>. Mengukur seberapa baik model memisahkan dua distribusi skor." },
  { qId: "c12", type: "comp", points: 4, answer: 0.73, tolerance: 0.05, allowPartial: true, partialPoints: 1, explain: "Max Youden's J ≈ 0.73 menandai threshold optimal yang menyeimbangkan sensitivity &amp; specificity. Titik ini adalah sudut kiri-atas kurva ROC." },
  { qId: "c13", type: "comp", points: 4, answer: 380, tolerance: 5, allowPartial: true, partialPoints: 1, explain: "Target = 0.5×920 = 460; sudah ada 80 → tambah <code>460 − 80 = 380</code> sampel sintetis. Strategi parsial (tidak selalu 1:1) untuk mengurangi risiko overfitting SMOTE." },
  { qId: "c14", type: "comp", points: 4, answer: 0.8036, tolerance: 0.05, allowPartial: true, partialPoints: 1, explain: "Precision ≈ 0.80 saat recall mencapai 0.9 — artinya untuk menangkap 90% fault, ~20% alarm adalah false positive. Trade-off precision-recall inti PdM." },
  { qId: "c15", type: "comp", points: 4, answer: 0.8657, tolerance: 0.05, allowPartial: true, partialPoints: 1, explain: "F1 maksimum ≈ 0.866 pada threshold optimal — lebih baik daripada F1 di threshold default 0.5. Menunjukkan pentingnya threshold tuning untuk metrik gabungan." }
];

const MODUL_QUESTIONS = [...MC, ...COMP_EZ, ...COMP_HARD];

const SUMMARY = {
  "modulId": "optoauto-modul-14",
  "totalSoal": 25,
  "totalPoin": 50,
  "breakdown": {
    "mc": 10,
    "compEz": 10,
    "compHard": 5
  }
};

module.exports = { MODUL_QUESTIONS, SUMMARY };
