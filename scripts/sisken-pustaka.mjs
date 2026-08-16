/**
 * Daftar pustaka rinci tiap modul Sistem Kendali Cerdas.
 *
 * Bentuknya mengikuti bagian Daftar Pustaka pada Modul 1: kutipan lengkap
 * (penulis, judul, edisi, penerbit, tahun) diikuti satu baris keterangan yang
 * menyebut bab mana yang relevan dan mengapa. Buku yang dipakai sama dengan
 * yang tercantum pada berkas Word tiap modul supaya mahasiswa menemukan
 * rujukan yang sama di kedua tempat.
 *
 * Bentuk data: [nomor modul]: { intro, ref: [[kutipan, keterangan], ...], daring }
 */

const B = {
  nise: 'N. S. Nise. <em style="color:#fff">Control Systems Engineering</em>, Eighth Edition. Wiley, 2019.',
  ogata: 'K. Ogata. <em style="color:#fff">Modern Control Engineering</em>, Fifth Edition. Pearson, 2010.',
  dorf: 'R. C. Dorf &amp; R. H. Bishop. <em style="color:#fff">Modern Control Systems</em>, Fourteenth Edition. Pearson, 2022.',
  franklin: 'G. F. Franklin, J. D. Powell &amp; A. Emami-Naeini. <em style="color:#fff">Feedback Control of Dynamic Systems</em>, Eighth Edition. Pearson, 2019.',
  astrom: 'K. J. Åström &amp; R. M. Murray. <em style="color:#fff">Feedback Systems: An Introduction for Scientists and Engineers</em>, Second Edition. Princeton University Press, 2021.',
  astromPid: 'K. J. Åström &amp; T. Hägglund. <em style="color:#fff">Advanced PID Control</em>. ISA — The Instrumentation, Systems, and Automation Society, 2006.',
  skogestad: 'S. Skogestad &amp; I. Postlethwaite. <em style="color:#fff">Multivariable Feedback Control: Analysis and Design</em>, Second Edition. Wiley, 2005.',
  ljung: 'L. Ljung. <em style="color:#fff">System Identification: Theory for the User</em>, Second Edition. Prentice Hall, 1999.',
  seborg: 'D. E. Seborg, T. F. Edgar, D. A. Mellichamp &amp; F. J. Doyle. <em style="color:#fff">Process Dynamics and Control</em>, Fourth Edition. Wiley, 2016.',
  shinskey: 'F. G. Shinskey. <em style="color:#fff">Process Control Systems: Application, Design, and Tuning</em>, Fourth Edition. McGraw-Hill, 1996.',
  isermann: 'R. Isermann. <em style="color:#fff">Fault-Diagnosis Systems: An Introduction from Fault Detection to Fault Tolerance</em>. Springer, 2006.',
  passino: 'K. M. Passino &amp; S. Yurkovich. <em style="color:#fff">Fuzzy Control</em>. Addison-Wesley, 1998.',
  haykin: 'S. Haykin. <em style="color:#fff">Neural Networks and Learning Machines</em>, Third Edition. Pearson, 2009.',
  goodfellow: 'I. Goodfellow, Y. Bengio &amp; A. Courville. <em style="color:#fff">Deep Learning</em>. MIT Press, 2016.',
  goldberg: 'D. E. Goldberg. <em style="color:#fff">Genetic Algorithms in Search, Optimization, and Machine Learning</em>. Addison-Wesley, 1989.',
  eiben: 'A. E. Eiben &amp; J. E. Smith. <em style="color:#fff">Introduction to Evolutionary Computing</em>, Second Edition. Springer, 2015.',
  mason: 'S. J. Mason. <em style="color:#fff">Feedback Theory: Further Properties of Signal Flow Graphs</em>. Proceedings of the IRE, 44(7), 920-926, 1956.',
  zn: 'J. G. Ziegler &amp; N. B. Nichols. <em style="color:#fff">Optimum Settings for Automatic Controllers</em>. Transactions of the ASME, 64(11), 759-768, 1942.',
  zadeh: 'L. A. Zadeh. <em style="color:#fff">Fuzzy Sets</em>. Information and Control, 8(3), 338-353, 1965.',
  mamdani: 'E. H. Mamdani &amp; S. Assilian. <em style="color:#fff">An Experiment in Linguistic Synthesis with a Fuzzy Logic Controller</em>. International Journal of Man-Machine Studies, 7(1), 1-13, 1975.',
  takagi: 'T. Takagi &amp; M. Sugeno. <em style="color:#fff">Fuzzy Identification of Systems and Its Applications to Modeling and Control</em>. IEEE Transactions on Systems, Man, and Cybernetics, 15(1), 116-132, 1985.',
  precup: 'R.-E. Precup &amp; H. Hellendoorn. <em style="color:#fff">A Survey on Industrial Applications of Fuzzy Control</em>. Computers in Industry, 62(3), 213-226, 2011.',
  rumelhart: 'D. E. Rumelhart, G. E. Hinton &amp; R. J. Williams. <em style="color:#fff">Learning Representations by Back-Propagating Errors</em>. Nature, 323(6088), 533-536, 1986.',
  hunt: 'K. J. Hunt, D. Sbarbaro, R. Żbikowski &amp; P. J. Gawthrop. <em style="color:#fff">Neural Networks for Control Systems: A Survey</em>. Automatica, 28(6), 1083-1112, 1992.',
  lewis: 'F. L. Lewis, D. Vrabie &amp; K. G. Vamvoudakis. <em style="color:#fff">Reinforcement Learning and Feedback Control</em>. IEEE Control Systems Magazine, 32(6), 76-105, 2012.',
  fleming: 'P. J. Fleming &amp; R. C. Purshouse. <em style="color:#fff">Evolutionary Algorithms in Control Systems Engineering: A Survey</em>. Control Engineering Practice, 10(11), 1223-1241, 2002.',
  qin: 'S. J. Qin &amp; T. A. Badgwell. <em style="color:#fff">A Survey of Industrial Model Predictive Control Technology</em>. Control Engineering Practice, 11(7), 733-764, 2003.',
  virtanen: 'P. Virtanen, dkk. <em style="color:#fff">SciPy 1.0: Fundamental Algorithms for Scientific Computing in Python</em>. Nature Methods, 17(3), 261-272, 2020.',
  harris: 'C. R. Harris, dkk. <em style="color:#fff">Array Programming with NumPy</em>. Nature, 585(7825), 357-362, 2020.',
  hunter: 'J. D. Hunter. <em style="color:#fff">Matplotlib: A 2D Graphics Environment</em>. Computing in Science &amp; Engineering, 9(3), 90-95, 2007.',
  fuller: 'S. Fuller, B. Greiner, J. Moore, R. Murray, R. van Paassen &amp; R. Yorke. <em style="color:#fff">The Python Control Systems Library (python-control)</em>. IEEE Conference on Decision and Control, 4875-4881, 2021.',
  vanloan: 'C. Moler &amp; C. Van Loan. <em style="color:#fff">Nineteen Dubious Ways to Compute the Exponential of a Matrix, Twenty-Five Years Later</em>. SIAM Review, 45(1), 3-49, 2003.',
  bennett: 'S. Bennett. <em style="color:#fff">A Brief History of Automatic Control</em>. IEEE Control Systems Magazine, 16(3), 17-25, 1996.',
};

const DARING = {
  numerik: 'dokumentasi <code style="font-family:\'JetBrains Mono\',monospace;color:var(--cyan)">numpy</code> dan <code style="font-family:\'JetBrains Mono\',monospace;color:var(--cyan)">scipy.signal</code> berguna untuk memverifikasi hasil hitungan tangan Anda. Untuk tugas modul ini cukup pakai <code style="font-family:\'JetBrains Mono\',monospace;color:var(--cyan)">numpy</code> , sebab tujuannya melatih penurunan rumus, bukan memanggil pustaka siap pakai.',
  kontrol: 'dokumentasi <code style="font-family:\'JetBrains Mono\',monospace;color:var(--cyan)">python-control</code> memuat contoh yang setara dengan pembahasan modul ini. Pakai untuk memeriksa jawaban, bukan untuk menggantikan penurunannya, karena soal komputasi menilai angka yang Anda cetak, dan angka itu harus bisa Anda pertanggungjawabkan.',
  cerdas: 'dokumentasi <code style="font-family:\'JetBrains Mono\',monospace;color:var(--cyan)">scikit-fuzzy</code>, <code style="font-family:\'JetBrains Mono\',monospace;color:var(--cyan)">scikit-learn</code>, dan <code style="font-family:\'JetBrains Mono\',monospace;color:var(--cyan)">DEAP</code> berguna untuk bereksperimen di luar kelas. Untuk tugas modul ini tetap pakai <code style="font-family:\'JetBrains Mono\',monospace;color:var(--cyan)">numpy</code> supaya proses hitungnya terlihat.',
};

export const PUSTAKA = {
  2: {
    intro: "Lima rujukan yang memandu urutan kerja perancangan: menetapkan spesifikasi terukur, memilih model secukupnya, menentukan arsitektur, lalu memverifikasi dan memvalidasi.",
    daring: DARING.kontrol,
    ref: [
      [B.nise, "Bab 1 dan 4 membahas spesifikasi respons transien beserta cara menerjemahkan kebutuhan operasi menjadi angka yang dapat diuji."],
      [B.franklin, "Bab 3 dan 4 mengupas hubungan spesifikasi dengan letak pole yang harus dicapai; dasar penurunan pada modul ini."],
      [B.skogestad, "Bab 1-2 menyajikan mengapa spesifikasi selalu mengandung pertukaran, dan bagaimana batas fisik membatasi yang boleh dituntut."],
      [B.astrom, "Bab 1 dan 12 memuat kerangka berpikir perancangan umpan balik beserta batas yang tidak dapat dilanggar rancangan apa pun."],
      [B.isermann, "Bab 1 menjelaskan analisis bahaya dan lapisan perlindungan; dibaca sebelum menetapkan lapisan alarm dan interlock."],
    ],
  },
  3: {
    intro: "Rujukan untuk perkakas matematis yang dipakai sepanjang sisa mata kuliah: transformasi Laplace, letak pole, dan teorema nilai akhir.",
    daring: DARING.numerik,
    ref: [
      [B.ogata, "Bab 2 membahas Mathematical Modeling of Control Systems; tabel pasangan transformasi dan sifat-sifatnya."],
      [B.nise, "Bab 2 mengupas Modeling in the Frequency Domain; banyak contoh terselesaikan yang setara dengan soal komputasi modul ini."],
      [B.dorf, "Bab 2 menyajikan Mathematical Models of Systems; penekanan pada arti fisik tiap suku, bukan sekadar manipulasi aljabar."],
      [B.vanloan, "Rujukan lanjutan tentang bahaya menghitung eksponensial matriks secara naif; dibaca bila tertarik sisi numeriknya."],
      [B.virtanen, "Dokumentasi dan makalah SciPy; modul memakai numpy, tetapi scipy.signal berguna untuk memeriksa hasil."],
    ],
  },
  4: {
    intro: "Rujukan tentang fungsi transfer, penyederhanaan diagram blok, serta pengaruh pole dan zero terhadap bentuk respons.",
    daring: DARING.kontrol,
    ref: [
      [B.nise, "Bab 5 memuat Reduction of Multiple Subsystems; aturan seri, paralel, dan umpan balik beserta latihannya."],
      [B.ogata, "Bab 3 menjelaskan Mathematical Modeling of Mechanical and Electrical Systems; penurunan fungsi transfer dari hukum fisika."],
      [B.dorf, "Bab 2 dan 5 membahas pengaruh pole dominan dan zero terhadap respons, termasuk gejala fase non-minimum."],
      [B.franklin, "Bab 3 mengupas Dynamic Response; hubungan letak pole dengan bentuk respons yang dipakai di seluruh modul ini."],
      [B.mason, "Makalah asli aturan Mason; dibaca bersama Modul 10 ketika loopnya mulai saling bersilang."],
    ],
  },
  5: {
    intro: "Rujukan tentang membangun model dari data dan menjalankan simulasi yang hasilnya dapat dipercaya.",
    daring: DARING.numerik,
    ref: [
      [B.ljung, "Bab 1-6 menyajikan identifikasi sistem dari data uji; dasar penentuan gain statik, konstanta waktu, dan dead time."],
      [B.seborg, "Bab 5-7 memuat pemodelan proses dan uji step di lapangan; contohnya dekat dengan praktik industri."],
      [B.franklin, "Bab 3 dan 8 menjelaskan pengaruh sampling dan langkah waktu terhadap kesahihan hasil simulasi."],
      [B.harris, "Makalah NumPy; pustaka yang dipakai seluruh soal komputasi mata kuliah ini."],
      [B.virtanen, "Makalah SciPy; berguna ketika model mulai memerlukan pengintegral yang lebih baik daripada Euler."],
    ],
  },
  6: {
    intro: "Rujukan untuk bekerja di depan komputer: menyapu parameter, membaca hasilnya, dan memilih rancangan dari gambar.",
    daring: DARING.kontrol,
    ref: [
      [B.fuller, "Makalah python-control; perkakas yang setara dengan alur kerja pada modul ini."],
      [B.virtanen, "Makalah SciPy; scipy.signal menyediakan fungsi respons yang dipakai memeriksa hasil sapuan parameter."],
      [B.harris, "Makalah NumPy; dasar seluruh perhitungan vektor pada sapuan parameter."],
      [B.hunter, "Makalah Matplotlib; membaca rancangan dari gambar menuntut grafik yang dibuat dengan benar."],
      [B.franklin, "Bab 4 membahas analisis kinerja lingkar tertutup yang menjadi isi tiap titik pada kurva sapuan."],
    ],
  },
  7: {
    intro: "Rujukan untuk membaca grafik respons: membedakan gangguan dari perubahan setpoint, mengenali pola kegagalan, dan mewaspadai jebakan sampling.",
    daring: DARING.numerik,
    ref: [
      [B.nise, "Bab 4 mengupas Time Response; anatomi kurva respons beserta seluruh indikator yang dibaca darinya."],
      [B.seborg, "Bab 5 dan 12 menyajikan pola respons pada proses nyata beserta penyebab yang lazim di baliknya."],
      [B.shinskey, "Bab 1-3 memuat pengalaman lapangan membaca trend; banyak pola yang tidak muncul di buku teori."],
      [B.isermann, "Bab 2-4 untuk mengenali gejala kegagalan dari data terukur sebelum kerusakannya membesar."],
      [B.hunter, "Makalah Matplotlib; laju perekaman dan skala sumbu menentukan apakah grafik dapat ditafsirkan."],
    ],
  },
  8: {
    intro: "Rujukan tentang apa yang berubah begitu umpan balik dipasang: error tunak, kecepatan, sensitivitas, dan batas kestabilan.",
    daring: DARING.kontrol,
    ref: [
      [B.nise, "Bab 6-7 menjelaskan Stability dan Steady-State Errors; inti pembahasan modul ini."],
      [B.ogata, "Bab 5 membahas Transient and Steady-State Response Analysis; contoh perhitungan yang setara dengan soal komputasi."],
      [B.franklin, "Bab 4 dan 6 mengupas fungsi sensitivitas serta margin gain dan margin fase."],
      [B.skogestad, "Bab 2-3 menyajikan hubungan S + T = 1 dan batas mendasar yang ditimbulkannya."],
      [B.astrom, "Bab 11-12 memuat penjelasan konseptual mengapa menekan gangguan dan menolak derau tidak dapat dimenangkan bersamaan."],
    ],
  },
  9: {
    intro: "Rujukan tentang controller yang paling banyak dipakai di industri, mulai dari peran tiap suku sampai penyetelan dan windup.",
    daring: DARING.kontrol,
    ref: [
      [B.astromPid, "Seluruh buku adalah rujukan paling lengkap tentang PID, termasuk anti-windup dan penyetelan praktis."],
      [B.zn, "Makalah asli Ziegler-Nichols; sumber rumus penyetelan yang dipakai pada modul ini."],
      [B.seborg, "Bab 8-12 menjelaskan penerapan PID pada proses beserta penanganan dead time."],
      [B.shinskey, "Bab 4-6 membahas penyetelan di lapangan dan alasan penyetelan buku sering perlu dikoreksi."],
      [B.nise, "Bab 9 mengupas Design via Root Locus; melihat pengaruh tiap suku PID pada letak pole."],
    ],
  },
  10: {
    intro: "Rujukan tentang grafik aliran sinyal dan aturan Mason, dipakai ketika penyederhanaan blok satu per satu menjadi terlalu panjang.",
    daring: DARING.kontrol,
    ref: [
      [B.mason, "Makalah asli; sumber aturan yang dibahas modul ini, termasuk definisi loop yang tidak bersentuhan."],
      [B.nise, "Bab 5 menyajikan Signal-Flow Graphs and Mason's Rule; penyajian paling terstruktur untuk pemula."],
      [B.ogata, "Bab 3 memuat penyederhanaan diagram blok sebagai pembanding jalur penyelesaian."],
      [B.dorf, "Bab 2 menjelaskan contoh sistem bertingkat yang loopnya bersilang; kasus tempat Mason benar-benar menghemat waktu."],
      [B.franklin, "Bab 3 membahas pemodelan sistem bertingkat beserta cara memeriksa hasil penurunannya."],
    ],
  },
  11: {
    intro: "Rujukan untuk memetakan metode kendali cerdas: kapan diperlukan, kapan metode klasik sudah cukup, dan bagaimana keduanya digabung.",
    daring: DARING.cerdas,
    ref: [
      [B.passino, "Bab 1-2 mengupas posisi kendali fuzzy di antara metode lain beserta alasan pemakaiannya."],
      [B.hunt, "Survei klasik penerapan jaringan saraf pada sistem kontrol; memberi peta jenis pemakaiannya."],
      [B.lewis, "Hubungan reinforcement learning dengan kontrol umpan balik; sisi adaptif dari metode cerdas."],
      [B.qin, "Survei kontrol prediktif di industri; pembanding penting sebelum memilih metode yang lebih rumit."],
      [B.astrom, "Bab 1 dan 13 menyajikan penjadwalan gain dan kontrol adaptif sebagai batas bawah yang perlu dilewati metode cerdas."],
    ],
  },
  12: {
    intro: "Rujukan tentang jaringan saraf untuk kontrol: arsitektur secukupnya, pelatihan, dan bahaya menghafal.",
    daring: DARING.cerdas,
    ref: [
      [B.haykin, "Bab 1-4 memuat struktur jaringan, backpropagation, dan generalisasi; dasar seluruh pembahasan modul ini."],
      [B.rumelhart, "Makalah asli backpropagation; sumber aturan pembaruan bobot yang diturunkan pada modul ini."],
      [B.hunt, "Survei penerapan pada sistem kontrol; menunjukkan peran penaksir besaran yang paling banyak dipakai."],
      [B.goodfellow, "Bab 5 dan 7 menjelaskan regularisasi dan pemisahan data; bagian yang menentukan model menua atau bertahan."],
      [B.lewis, "Penerapan pembelajaran pada loop kendali beserta syarat kestabilannya."],
    ],
  },
  13: {
    intro: "Rujukan tentang logika fuzzy untuk kontrol, dari gagasan himpunan samar sampai penerapan industrinya.",
    daring: DARING.cerdas,
    ref: [
      [B.zadeh, "Makalah asli himpunan fuzzy; sumber gagasan derajat keanggotaan yang dipakai modul ini."],
      [B.mamdani, "Percobaan pertama controller fuzzy pada mesin uap; asal bentuk inferensi yang paling banyak dipakai."],
      [B.takagi, "Bentuk inferensi dengan kesimpulan berupa fungsi linier; alternatif yang lebih ringan dihitung."],
      [B.passino, "Bab 2-5 membahas perancangan lengkap controller fuzzy, termasuk penskalaan dan permukaan kendali."],
      [B.precup, "Survei penerapan fuzzy di industri; menunjukkan di kasus mana fuzzy benar-benar unggul."],
    ],
  },
  14: {
    intro: "Rujukan tentang algoritma genetik dan pemakaiannya untuk mencari parameter controller.",
    daring: DARING.cerdas,
    ref: [
      [B.goldberg, "Bab 1-4 mengupas seleksi, crossover, mutasi, dan elitisme; dasar seluruh pembahasan modul ini."],
      [B.eiben, "Bab 2-6 menyajikan penyetelan parameter algoritma dan penanganan kendala secara sistematis."],
      [B.fleming, "Survei pemakaian algoritma evolusioner pada sistem kontrol; contoh perumusan fungsi kebugaran."],
      [B.skogestad, "Bab 2-3 memuat ukuran kinerja yang layak dijadikan fungsi biaya beserta batas yang menyertainya."],
      [B.astromPid, "Bab 6-7 menjelaskan pembanding hasil optimasi terhadap penyetelan PID yang baik; uji kelayakan yang wajib dilakukan."],
    ],
  },
};
