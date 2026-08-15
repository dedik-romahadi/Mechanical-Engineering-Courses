// Penjelasan rinci SETIAP persamaan bernomor pada Modul Sisken.
// Kunci = string rumus PERSIS seperti di sisken-materi.mjs (deep[].formula).
// enrich GAGAL FATAL bila persamaan matematis tidak punya entri di sini.
//
// apa      : 1-3 kalimat bahasa sehari-hari; {{token}} dirender tokenLatex
//            sehingga notasinya identik dengan di persamaan (hasil KaTeX).
// variabel : [token ASCII utk tokenLatex, arti] utk SETIAP notasi persamaan.
// ── Kamus notasi GLOBAL untuk legenda kartu & tabel ──────────────────────────
// Persamaan pada kartu konsep, Tabel 1, dan kartu langkah penurunan tidak
// dinomori satu-satu; notasinya dijelaskan lewat SATU legenda per bagian yang
// dirakit otomatis: token diekstrak tokenNotasi() lalu dicari artinya di sini.
// Token tanpa entri = generator GAGAL FATAL. Kunci multi-huruf otomatis menjadi
// "nama dikenal" pengekstrak (RMSE tidak dipecah jadi R,M,S,E).
export const NOTASI_KAMUS = {
  // sinyal & waktu
  "e": "error: setpoint dikurangi keluaran", "t": "waktu", "r": "setpoint (perintah)",
  "y": "keluaran sistem", "u": "sinyal kendali", "d": "awalan diferensial: perubahan kecil",
  "de": "perubahan kecil error", "dt": "selang waktu kecil", "y'": "laju perubahan keluaran",
  "x'": "turunan pertama x terhadap waktu", "x''": "turunan kedua x (percepatan)",
  "f'": "turunan fungsi f", "G'": "plant yang parameternya sudah bergeser",
  "t_r": "waktu naik 10%→90%", "t_s": "waktu menetap (pita ±2%)", "t_p": "waktu puncak",
  "t_{90}": "saat keluaran mencapai 90%", "t_{10}": "saat keluaran mencapai 10%",
  "T_{osilasi}": "periode satu ayunan osilasi",
  // domain-s & fungsi transfer
  "s": "peubah Laplace", "\\mathcal": "operator transformasi Laplace",
  "L": "gain loop (atau lambang transformasi Laplace pada L{ })",
  "F": "transformasi Laplace dari f(t)", "X": "transformasi Laplace dari x(t)",
  "Y": "keluaran dalam domain-s", "U": "masukan dalam domain-s",
  "E": "error dalam domain-s", "G": "fungsi transfer plant", "H": "fungsi transfer sensor",
  "C": "fungsi transfer controller", "T": "fungsi transfer loop tertutup",
  "S": "fungsi sensitivitas", "G_{eq}": "fungsi transfer ekivalen",
  "A_i": "residu mode ke-i", "p_i": "pole ke-i", "p": "parameter atau pole",
  "Re": "bagian nyata bilangan kompleks", "j": "satuan khayal √(−1)",
  "\\det": "determinan matriks",
  // orde dua & margin
  "\\zeta": "rasio redaman", "ζ": "rasio redaman", "\\omega_n": "frekuensi alami (rad/s)",
  "ω_n": "frekuensi alami (rad/s)", "\\omega_d": "frekuensi osilasi teredam (rad/s)",
  "\\pi": "konstanta lingkaran 3,14159…", "M_p": "lonjakan maksimum (%)",
  "e_{ss}": "error tunak", "y_{peak}": "nilai puncak keluaran", "y_{ss}": "nilai tunak keluaran",
  "\\tau": "konstanta waktu", "\\tau_{tercepat}": "konstanta waktu terkecil sistem",
  "\\tau_{cl}": "konstanta waktu loop tertutup",
  "K": "gain", "wc": "frekuensi silang (rad/s)", "wd": "frekuensi teredam (rad/s)",
  "wn": "frekuensi alami (rad/s)", "n": "indeks atau orde", "fase": "sudut fase (derajat/radian)",
  // ruang keadaan & model
  "x": "keadaan (atau posisi)", "A": "matriks dinamika (atau gain jalur)",
  "B": "matriks masukan", "m": "massa", "b": "koefisien redaman (atau bias neuron)",
  "k": "kekakuan pegas (atau indeks cuplikan)", "M": "massa (atau label matriks)",
  // digital
  "T_s": "periode cuplik", "f_s": "frekuensi cuplik", "f_{bw}": "lebar pita sistem",
  "bandwidth": "lebar pita: batas frekuensi yang masih diikuti",
  "e_k": "error pada cuplikan ke-k", "e_{k-1}": "error satu cuplikan sebelumnya",
  "e_{k-2}": "error dua cuplikan sebelumnya", "u_k": "sinyal kendali cuplikan ke-k",
  "u_{k-1}": "sinyal kendali cuplikan sebelumnya",
  // PID & pembatasan
  "K_p": "gain proporsional", "K_i": "gain integral", "K_d": "gain derivatif",
  "T_i": "waktu integral (detik)", "T_d": "waktu derivatif (detik)",
  "u_P": "suku P: koreksi kini", "u_I": "suku I: akumulasi error", "u_D": "suku D: rem perubahan",
  "I": "akumulator integral", "I_{aw}": "akumulator setelah anti-windup",
  "K_{aw}": "gain anti-windup", "u_{sat}": "sinyal kendali setelah dibatasi",
  "u_{min}": "batas bawah aktuator", "u_{max}": "batas atas aktuator",
  // Mason
  "P_k": "gain jalur maju ke-k", "L_i": "gain loop ke-i", "L_j": "gain loop ke-j",
  "L_A": "gain loop A", "L_B": "gain loop B", "\\Delta": "determinan grafik",
  "Δ": "determinan grafik", "\\Delta_1": "determinan sisa jalur 1", "Δ_k": "determinan sisa jalur k",
  // cerdas: ANN / fuzzy / GA
  "Kecerdasan": "pemetaan cerdas (fuzzy/ANN) pengganti rumus tetap",
  "data": "contoh pengukuran yang dipelajari", "uji": "hasil pengujian", "asumsi": "anggapan model",
  "f": "fungsi (aktivasi pada ANN)", "f_W": "jaringan dengan kumpulan bobot W",
  "w": "bobot neuron", "z": "penjumlah neuron sebelum aktivasi", "a": "keluaran aktivasi neuron",
  "ᵀ": "transpose vektor/matriks", "φ": "fungsi aktivasi", "λ": "bobot regularisasi",
  "J": "fungsi tujuan/kebugaran", "R": "suku regularisasi (atau setpoint domain-s)",
  "MSE": "rata-rata kuadrat galat", "RMSE": "akar rata-rata kuadrat galat",
  "ITAE": "integral |error| berbobot waktu",
  "u_{baseline}": "sinyal kendali dasar (PID)", "u_{NN}": "koreksi tambahan dari jaringan",
  "\\mu": "derajat keanggotaan fuzzy 0–1", "μ_A": "derajat keanggotaan pada himpunan A",
  "μ_e": "derajat keanggotaan error", "μ_{de}": "derajat keanggotaan laju error",
  "α": "derajat pemicu aturan", "α_i": "derajat pemicu aturan ke-i",
  "z_i": "keluaran singleton aturan ke-i", "P": "label fuzzy Positif", "N": "label fuzzy Negatif",
  "PM": "label fuzzy Positif Menengah", "Nol": "label fuzzy Nol",
  "Positif": "label fuzzy Positif", "Kecil": "pengecil label fuzzy (mis. Positif Kecil)",
  "i": "indeks penjumlahan",
  "θ": "vektor parameter yang dicari (mis. [Kp, Ki, Kd])",
  "σ": "simpangan baku langkah mutasi",
};

export const PENJELASAN_RUMUS = {

  // ── Modul 2 ──────────────────────────────────────────────
  // [Spesifikasi: Mengubah Keinginan Menjadi Angka]
  "spesifikasi = {t_r, t_s, M_p, e_ss, |u|max, robustness}": {
    apa: "menuliskan keinginan pelanggan sebagai himpunan angka yang bisa diuji. 'Cepat dan halus' tidak bisa diperiksa; enam besaran ini bisa — sebuah rancangan lulus atau gagal tanpa perdebatan.",
    variabel: [
      ["t_r", "waktu naik: lamanya keluaran menempuh 10% → 90% nilai akhir"],
      ["t_s", "waktu menetap: lamanya masuk dan bertahan di pita ±2%"],
      ["M_p", "lonjakan maksimum: % puncak di atas nilai akhir"],
      ["e_ss", "error tunak: sisa selisih permanen terhadap sasaran"],
      ["|u|max", "batas sinyal kendali terbesar yang boleh diminta dari aktuator"],
      ["robustness", "ketahanan: spesifikasi tetap terpenuhi walau parameter plant bergeser"],
    ],
  },
  // [Model: Cukup Akurat, Bukan Selengkap Mungkin]
  "G(s) = K*exp(-Ls)/(tau*s+1)   |   m*x'' + b*x' + k*x = F(t)": {
    apa: "dua model baku yang menutupi sebagian besar plant industri: ruas kiri fungsi transfer orde satu dengan waktu mati (proses termal, aliran), ruas kanan persamaan gerak massa–pegas–peredam (sistem mekanik). Pilih yang paling sederhana yang masih menangkap perilaku pentingnya.",
    variabel: [
      ["G(s)", "fungsi transfer plant: perbandingan keluaran terhadap masukan dalam domain-s"],
      ["K", "gain statis: perbandingan keluaran/masukan setelah semuanya tenang"],
      ["L", "waktu mati: jeda sebelum keluaran mulai bereaksi"],
      ["tau", "konstanta waktu: ukuran kelambanan — 63% jalan ditempuh dalam satu {{tau}}"],
      ["m", "massa benda yang bergerak"],
      ["b", "koefisien redaman: gesekan pembuang energi"],
      ["k", "kekakuan pegas"],
      ["x''", "percepatan (turunan kedua posisi terhadap waktu)"],
      ["F(t)", "gaya luar yang menggerakkan sistem"],
    ],
  },
  // [Simulasi: Menguji Kegagalan Sebelum Ia Mahal]
  "dt <= 0.1 * tau_tercepat, lalu ulangi pada dt/2 untuk verifikasi": {
    apa: "aturan memilih langkah waktu simulasi: paling besar sepersepuluh dari konstanta waktu tercepat di sistem. Ulangi simulasi pada langkah setengahnya — bila hasilnya berubah berarti langkah pertama masih terlalu kasar.",
    variabel: [
      ["dt", "langkah waktu simulasi: jarak antar titik hitung"],
      ["tau_tercepat", "konstanta waktu terkecil di antara semua dinamika sistem — dialah yang menentukan seberapa rapat simulasi harus melangkah"],
    ],
  },
  // [Implementasi dan Validasi: Dari Angka ke Perangkat]
  "verifikasi: dibuat dengan benar   |   validasi: yang benar yang dibuat": {
    apa: "dua pertanyaan berbeda yang sering tertukar. Verifikasi memeriksa kesesuaian dengan rancangan (kode sesuai diagram?); validasi memeriksa kesesuaian dengan kebutuhan (rancangannya sendiri menjawab masalah?). Lulus yang satu tidak menjamin lulus yang lain.",
    variabel: [
      ["verifikasi", "membandingkan hasil buatan terhadap rancangannya"],
      ["validasi", "membandingkan rancangan terhadap kebutuhan nyata pemakainya"],
    ],
  },
  // [Dokumentasi yang Benar-Benar Dipakai Orang Lain]
  "catat alasan, bukan hanya nilai   |   rekaman uji = acuan pembanding kelak": {
    apa: "prinsip dokumentasi teknik: angka tanpa alasan tidak bisa ditinjau ulang ('mengapa Kp = 4?'), dan rekaman pengujian hari ini adalah garis dasar yang dipakai membandingkan perilaku mesin bertahun-tahun kemudian.",
    variabel: [
      ["rekaman uji", "grafik dan kondisi pengujian yang disimpan bersama tanggal dan versi perangkatnya"],
    ],
  },

  // ── Modul 3 ──────────────────────────────────────────────
  // [Mengapa Domain-s Menyederhanakan Persoalan Dinamik]
  "F(s) = integral_0^inf f(t)*exp(-st) dt   |   L{f*g} = F(s)*G(s)": {
    apa: "definisi transformasi Laplace: sinyal waktu ditimbang peluruhan {{exp(-st)}} lalu dijumlahkan dari nol sampai tak hingga — hasilnya fungsi dalam {{s}}. Hadiah terbesarnya di ruas kanan: konvolusi yang rumit di domain waktu menjadi perkalian biasa di domain-s.",
    variabel: [
      ["F(s)", "hasil transformasi: sinyal yang sama, dipandang dari domain-s"],
      ["f(t)", "sinyal asli dalam domain waktu"],
      ["s", "peubah Laplace: gabungan laju peluruhan dan frekuensi osilasi"],
      ["L{f*g}", "transformasi Laplace dari konvolusi dua sinyal"],
    ],
  },
  // [Sifat Turunan dan Peran Kondisi Awal]
  "L{x'} = sX(s) - x(0)   |   L{x''} = s^2*X(s) - s*x(0) - x'(0)   |   L{f(t-L)} = exp(-Ls)*F(s)": {
    apa: "tiga sifat yang membuat persamaan diferensial berubah menjadi aljabar: setiap turunan waktu menjadi perkalian dengan {{s}} (kondisi awal ikut terbawa sebagai suku pengurang), dan penundaan sebesar {{L}} menjadi faktor {{exp(-Ls)}}.",
    variabel: [
      ["L{x}", "operator transformasi Laplace: 'terjemahkan sinyal di kurungnya ke domain-s'"],
      ["x'", "turunan pertama sinyal terhadap waktu"],
      ["x''", "turunan kedua (percepatan)"],
      ["X(s)", "transformasi Laplace dari x(t)"],
      ["x(0)", "nilai awal sinyal saat t = 0"],
      ["x'(0)", "nilai awal turunannya"],
      ["f(t-L)", "sinyal yang sama, tertunda L detik"],
      ["exp(-Ls)", "jejak waktu mati di domain-s"],
    ],
  },
  // [Pecahan Parsial: Membongkar Respons Menjadi Mode]
  "Y(s) = sum A_i/(s - p_i)   |   A_i = [(s - p_i)*Y(s)] pada s = p_i": {
    apa: "memecah respons menjadi jumlahan suku sederhana, satu per pole. Tiap suku adalah satu 'mode' gerak; ruas kanan (rumus residu) memberi resep menghitung bobot tiap mode: kalikan dengan {{(s - p_i)}} lalu evaluasi di pole-nya.",
    variabel: [
      ["Y(s)", "respons sistem di domain-s"],
      ["A_i", "residu: bobot seberapa kuat mode ke-i hadir dalam respons"],
      ["p_i", "pole ke-i: akar penyebut, penentu watak tiap mode"],
      ["sum", "penjumlahan atas semua pole"],
    ],
  },
  // [Pole, Zero, dan Pembacaan Kestabilan]
  "stabil <=> Re(p_i) < 0 untuk semua i   |   y(inf) = lim s->0 s*Y(s)": {
    apa: "dua alat baca tercepat di domain-s. Kiri: sistem stabil jika dan hanya jika SEMUA pole berada di kiri sumbu khayal — satu saja di kanan, respons meledak. Kanan: teorema nilai akhir menghitung nilai tunak tanpa menunggu, cukup substitusi {{s}} menuju 0.",
    variabel: [
      ["Re(p_i)", "bagian nyata pole ke-i: negatif berarti mode-nya meluruh"],
      ["y(inf)", "nilai keluaran setelah lama sekali (nilai tunak)"],
      ["lim s->0", "limit s menuju nol — hanya sah bila sistemnya stabil"],
    ],
  },
  // [Membaca Kembali ke Domain Waktu]
  "pole -a  =>  exp(-a*t), tau = 1/a   |   pole -a +/- jb  =>  exp(-a*t)*cos(b*t)": {
    apa: "kamus pole → perilaku waktu. Pole nyata di {{-a}} berarti peluruhan eksponensial dengan konstanta waktu {{1/a}}; pasangan pole kompleks berarti osilasi berfrekuensi {{b}} yang amplopnya meluruh secepat {{exp(-a*t)}}. Makin kiri pole, makin cepat tenangnya.",
    variabel: [
      ["a", "jarak pole dari sumbu khayal: laju peluruhan"],
      ["tau = 1/a", "konstanta waktu mode itu"],
      ["b", "bagian khayal pole: frekuensi osilasi (rad/s)"],
      ["exp(-a*t)", "amplop amplitudo yang menyusut"],
    ],
  },
  // [Menurunkan Fungsi Transfer Pertama dari Persamaan Fisik]
  "termal: C*dT/dt = q_in - h*(T - T_amb)  =>  G(s) = K/(tau*s + 1)": {
    apa: "contoh lengkap dari fisika ke fungsi transfer: neraca energi benda dipanaskan (kalor masuk dikurangi kalor terbuang) di-Laplace-kan menjadi model orde satu. Semua sistem 'tangki bocor' — termal, tangki air, RC — berujung pada bentuk yang sama ini.",
    variabel: [
      ["C", "kapasitas termal: berapa joule untuk menaikkan suhu satu derajat"],
      ["T", "suhu benda (keluaran)"],
      ["q_in", "laju kalor masuk (masukan)"],
      ["h", "koefisien pelepasan kalor ke lingkungan"],
      ["T_amb", "suhu lingkungan"],
      ["K", "gain statis hasil penurunan: 1/h"],
      ["tau", "konstanta waktu hasil penurunan: C/h"],
    ],
  },
  // [Respons Impuls dan Makna Konvolusi]
  "L{impuls} = 1  =>  L{respons impuls} = G(s)   |   konvolusi <-> perkalian": {
    apa: "alasan respons impuls istimewa: transformasi impuls adalah 1, sehingga respons sistem terhadap impuls LANGSUNG memperlihatkan {{G(s)}} itu sendiri — sidik jari lengkap sistem dalam satu ketukan. Dan karena konvolusi ↔ perkalian, respons terhadap masukan apa pun tinggal perkalian di domain-s.",
    variabel: [
      ["L{x}", "operator transformasi Laplace"],
      ["impuls", "sentakan sesaat berenergi satu (delta Dirac)"],
      ["G(s)", "fungsi transfer sistem"],
      ["konvolusi", "cara domain waktu menggabungkan masukan dengan ingatan sistem"],
    ],
  },
  // [Teorema Nilai Awal dan Pemeriksaan Cepat]
  "y(0+) = lim s->inf s*Y(s)   |   y(inf) = lim s->0 s*Y(s)": {
    apa: "sepasang teorema untuk memeriksa jawaban tanpa inversi penuh: nilai sesaat setelah mulai dibaca dari limit {{s}} besar, nilai akhir dari limit {{s}} kecil. Keduanya alat deteksi salah hitung tercepat — bila y(0+) atau y(∞) hasil inversi tidak cocok, pasti ada langkah yang keliru.",
    variabel: [
      ["y(0+)", "nilai keluaran sesaat setelah t = 0"],
      ["y(inf)", "nilai keluaran setelah lama sekali"],
      ["lim s->inf", "limit s menuju tak hingga (perilaku awal)"],
      ["lim s->0", "limit s menuju nol (perilaku akhir; sah hanya bila stabil)"],
    ],
  },

  // ── Modul 4 ──────────────────────────────────────────────
  // [Apa yang Diwakili dan Tidak Diwakili Fungsi Transfer]
  "G(s) = Y(s)/U(s) pada kondisi awal nol   |   orde penyebut >= orde pembilang": {
    apa: "definisi fungsi transfer sekaligus dua syarat sahnya: ia perbandingan keluaran/masukan HANYA saat kondisi awal nol, dan sistem fisik selalu punya orde penyebut minimal sama dengan pembilang — bila lebih kecil, modelnya menuntut sistem meramal masa depan.",
    variabel: [
      ["G(s)", "fungsi transfer sistem"],
      ["Y(s)", "keluaran dalam domain-s"],
      ["U(s)", "masukan dalam domain-s"],
      ["orde", "pangkat tertinggi s pada pembilang atau penyebut"],
    ],
  },
  // [Susunan Seri dan Syarat yang Sering Dilanggar]
  "G_eq = G1*G2 hanya bila blok kedua tidak membebani blok pertama": {
    apa: "aturan blok seri: gain ekivalennya hasil kali — TAPI hanya bila blok kedua tidak menyedot daya dari blok pertama. Dua rangkaian RC yang disambung langsung TIDAK boleh dikalikan begitu saja; sisipkan penyangga dulu, baru rumus ini sah.",
    variabel: [
      ["G_eq", "fungsi transfer ekivalen pengganti kedua blok"],
      ["G1", "blok pertama (hulu)"],
      ["G2", "blok kedua (hilir)"],
    ],
  },
  // [Susunan Paralel dan Umpan Balik]
  "G_eq = G1 +/- G2   |   T = G/(1 + G*H)   |   bila G*H >> 1 maka T ~ 1/H": {
    apa: "tiga rumus penyusun diagram: paralel dijumlahkan, loop tertutup memakai rumus baku {{G/(1 + G*H)}}, dan konsekuensi terpentingnya di ruas kanan — saat gain loop sangat besar, perilaku sistem ditentukan oleh sensor {{H}}, bukan oleh plant. Itulah mengapa kualitas sensor menentukan kualitas kendali.",
    variabel: [
      ["G_eq", "fungsi transfer ekivalen"],
      ["G", "gain jalur maju"],
      ["H", "gain jalur umpan balik (sensor)"],
      ["T", "fungsi transfer loop tertutup"],
      ["G*H", "gain loop: hasil kali sekeliling lingkaran"],
    ],
  },
  // [Mereduksi Diagram Blok Secara Sistematis]
  "cabang dipindah ke hulu blok G: sisipkan G   |   ke hilir: sisipkan 1/G": {
    apa: "aturan pemindahan titik cabang saat merapikan diagram: sinyal yang dicabangkan harus tetap sama nilainya. Pindah melawan arah (ke hulu) berarti sinyal belum melewati {{G}}, jadi cabangnya harus diberi {{G}}; pindah searah (ke hilir) berarti sudah terlanjur dikali {{G}}, jadi dikompensasi {{1/G}}.",
    variabel: [
      ["G", "blok yang dilompati titik cabang"],
      ["1/G", "kompensasi kebalikan agar nilai sinyal cabang tidak berubah"],
    ],
  },
  // [Sensitivitas: Alasan Sesungguhnya Memakai Umpan Balik]
  "S = 1/(1 + G*H)   |   dT/T = S * dG/G": {
    apa: "alasan kuantitatif umpan balik dipakai: bila plant bergeser 20% ({{dG/G}} = 0,2), perilaku loop tertutup hanya bergeser {{S}} kalinya. Dengan gain loop 9, S = 0,1 — pergeseran 20% di plant tinggal terasa 2%. Umpan balik menukar gain menjadi kekebalan terhadap ketidakpastian.",
    variabel: [
      ["S", "fungsi sensitivitas: seberapa tembus pergeseran plant ke perilaku tertutup"],
      ["G", "gain jalur maju"],
      ["H", "gain umpan balik"],
      ["dT/T", "perubahan relatif perilaku loop tertutup"],
      ["dG/G", "perubahan relatif plant (penuaan, suhu, beban)"],
    ],
  },
  // [Superposisi pada Sistem Banyak Masukan]
  "Y = T_r*R + T_d*D + T_n*N   |   penyebut sama, pembilang berbeda": {
    apa: "sistem linier melayani semua masukan sekaligus lewat penjumlahan: keluaran = jatah setpoint + jatah gangguan + jatah derau, masing-masing lewat fungsi transfernya sendiri. Ketiga fungsi itu berbagi PENYEBUT yang sama (dinamika loop hanya satu) tapi pembilangnya berbeda — itulah mengapa cepat mengikuti setpoint tidak otomatis kebal gangguan.",
    variabel: [
      ["Y", "keluaran total"],
      ["R", "setpoint (perintah)"],
      ["D", "gangguan (beban, angin, gesekan)"],
      ["N", "derau pengukuran sensor"],
      ["T_r", "fungsi transfer setpoint → keluaran"],
      ["T_d", "fungsi transfer gangguan → keluaran"],
      ["T_n", "fungsi transfer derau → keluaran"],
    ],
  },
  // [Dari Diagram Blok ke Kode Simulasi]
  "satu integrator = satu variabel keadaan   |   hitung mengikuti arah aliran sinyal": {
    apa: "resep menerjemahkan diagram menjadi kode: setiap integrator pada diagram menjadi satu variabel yang disimpan antar-langkah, dan urutan baris kode mengikuti arah panah sinyal. Diagram dengan tiga integrator = simulasi dengan tepat tiga variabel keadaan, tidak lebih.",
    variabel: [
      ["integrator", "blok 1/s: penjumlah berjalan yang punya ingatan"],
      ["variabel keadaan", "nilai yang harus disimpan agar langkah berikut bisa dihitung"],
    ],
  },

  // ── Modul 5 ──────────────────────────────────────────────
  // [Simulasi Sebagai Eksperimen, Bukan Sekadar Gambar]
  "eksperimen = {model, parameter, kondisi awal, masukan, solver, metrik}": {
    apa: "daftar isi sebuah simulasi yang bisa diulang orang lain: enam komponen ini harus tercatat semua. Grafik tanpa keenam komponen pendampingnya bukan hasil eksperimen — cuma gambar yang tidak bisa diperiksa maupun diulang.",
    variabel: [
      ["model", "persamaan yang mewakili plant"],
      ["parameter", "angka-angka pengisi model (K, tau, m, ...)"],
      ["kondisi awal", "keadaan sistem saat simulasi dimulai"],
      ["masukan", "sinyal uji yang diberikan (step, ramp, sinus)"],
      ["solver", "metode numerik beserta langkah waktunya"],
      ["metrik", "besaran yang diukur dari hasil (Mp, ts, RMSE)"],
    ],
  },
  // [Ruang Keadaan dan Fungsi Transfer: Dua Sudut Pandang]
  "x' = A*x + B*u,  y = C*x + D*u   |   G(s) = C*(sI - A)^-1*B + D": {
    apa: "dua bahasa untuk sistem yang sama. Ruang keadaan (kiri) memandang dari dalam: vektor keadaan {{x}} berevolusi menurut matriks-matriks sistem. Fungsi transfer (kanan) memandang dari luar: hanya hubungan masukan-keluaran. Rumus kanan adalah jembatan resmi dari pandangan dalam ke pandangan luar.",
    variabel: [
      ["x", "vektor keadaan: kumpulan ingatan internal sistem"],
      ["x'", "laju perubahan keadaan"],
      ["u", "masukan"],
      ["y", "keluaran"],
      ["A", "matriks dinamika: bagaimana keadaan mempengaruhi laju perubahannya sendiri"],
      ["B", "matriks masukan: bagaimana u mendorong keadaan"],
      ["C", "matriks keluaran: keadaan mana yang terbaca di y"],
      ["D", "jalur langsung masukan ke keluaran (sering nol)"],
      ["I", "matriks identitas"],
    ],
  },
  // [Solver Numerik dan Perangkap Kekakuan]
  "dt <= 0,1 * tau_tercepat   |   kekakuan = tau_lambat/tau_cepat >> 1": {
    apa: "dua fakta solver yang menjelaskan simulasi lambat atau meledak: langkah waktu dibatasi dinamika TERCEPAT, sedangkan lama simulasi ditentukan dinamika TERLAMBAT. Sistem kaku (rasio keduanya besar) memaksa jutaan langkah kecil — di situlah solver implisit menggantikan Euler.",
    variabel: [
      ["dt", "langkah waktu simulasi"],
      ["tau_tercepat", "konstanta waktu terkecil di sistem"],
      ["tau_lambat", "konstanta waktu terbesar di sistem"],
      ["kekakuan", "rasio keduanya: makin besar, makin menyiksa solver eksplisit"],
    ],
  },
  // [Validasi Model Terhadap Data Nyata]
  "RMSE = sqrt(mean((y_ukur - y_model)^2))   |   pisahkan data latih dan data uji": {
    apa: "ukuran baku jarak model ke kenyataan: selisih tiap titik dikuadratkan (biar plus-minus tidak saling menghapus), dirata-rata, lalu diakarkan agar satuannya kembali sama dengan sinyalnya. Syarat kanan yang sering dilupakan: nilai RMSE hanya jujur bila dihitung pada data yang TIDAK dipakai menyetel model.",
    variabel: [
      ["RMSE", "akar rata-rata kuadrat galat — 0 berarti model menembus semua titik data"],
      ["y_ukur", "data pengukuran dari plant sungguhan"],
      ["y_model", "keluaran model pada masukan yang sama"],
      ["mean", "rata-rata atas seluruh titik data"],
      ["sqrt", "akar kuadrat"],
    ],
  },
  // [Linearisasi: Menjinakkan Nonlinieritas di Titik Kerja]
  "dx' = A*dx + B*du dengan A dan B turunan parsial di titik kerja": {
    apa: "cara memakai seluruh perkakas linier pada sistem nonlinier: bekerja dengan SIMPANGAN kecil di sekitar titik kerja, bukan nilai mutlaknya. Matriks {{A}} dan {{B}} adalah kemiringan lokal (turunan parsial) di titik itu — sah selama simpangan tetap kecil, dan harus dihitung ulang bila titik kerjanya pindah.",
    variabel: [
      ["dx", "simpangan keadaan dari titik kerja"],
      ["du", "simpangan masukan dari nilai kerjanya"],
      ["A", "turunan parsial dinamika terhadap keadaan, dievaluasi di titik kerja"],
      ["B", "turunan parsial dinamika terhadap masukan, di titik yang sama"],
    ],
  },
  // [Memodelkan Gangguan dan Derau]
  "gangguan: frekuensi rendah di masukan plant | derau: frekuensi tinggi di umpan balik": {
    apa: "dua musuh yang menuntut obat berlawanan, dibedakan dari tempat masuk dan frekuensinya: gangguan (beban berubah, angin) masuk di plant dan berfrekuensi rendah — dilawan dengan gain besar; derau sensor masuk di umpan balik dan berfrekuensi tinggi — justru DIPERPARAH gain besar. Kompromi inilah inti perancangan.",
    variabel: [
      ["gangguan", "sinyal tak diinginkan yang mendorong plant sungguhan"],
      ["derau", "kesalahan baca sensor — plant-nya sendiri tidak terdorong"],
    ],
  },

  // ── Modul 6 ──────────────────────────────────────────────
  // [Mengapa Controller Digital Berbeda dari Rancangan Kontinu]
  "penahanan orde nol ~ tundaan T/2   |   20 sampai 40 cuplikan per waktu naik": {
    apa: "dua angka praktis implementasi digital: menahan sinyal rata antar-cuplikan (ZOH) berperilaku seperti menambah waktu mati setengah periode cuplik — margin fase termakan; dan agar rancangan kontinu tetap sah, waktu naik sistem harus memuat 20–40 cuplikan.",
    variabel: [
      ["T", "periode cuplik: jeda antar eksekusi kode kendali"],
      ["T/2", "tundaan efektif yang disumbangkan penahanan orde nol"],
    ],
  },
  // [Diskretisasi: Menerjemahkan Rancangan ke Kode]
  "integral: I += Ki*e*T   |   turunan: D = Kd*(e - e_lalu)/T, wajib ditapis": {
    apa: "PID versi kode: integral menjadi penjumlah berjalan (luas persegi tiap langkah), turunan menjadi selisih dua cuplikan dibagi {{T}}. Peringatan di ekornya serius — selisih beda-hingga memperkuat derau, jadi suku turunan wajib melewati tapis lolos-rendah sebelum dipakai.",
    variabel: [
      ["I", "akumulator suku integral"],
      ["Ki", "gain integral"],
      ["e", "error pada cuplikan ini"],
      ["e_lalu", "error pada cuplikan sebelumnya"],
      ["T", "periode cuplik"],
      ["D", "suku derivatif hasil beda-hingga"],
      ["Kd", "gain derivatif"],
    ],
  },
  // [Anti-Windup dan Perpindahan Mode]
  "anti-windup: I += Ki*e*T hanya bila tidak mentok, atau I += Kt*(u_nyata - u_minta)": {
    apa: "dua resep mencegah integral menggelembung saat aktuator mentok: berhenti mengakumulasi selama jenuh (kiri), atau back-calculation (kanan) — selisih antara yang benar-benar keluar dan yang diminta dipakai MENGURAS akumulator. Tanpa salah satunya, lonjakan raksasa menunggu begitu aktuator lepas dari batasnya.",
    variabel: [
      ["I", "akumulator suku integral"],
      ["Ki", "gain integral"],
      ["Kt", "gain anti-windup: seberapa cepat akumulator dikuras"],
      ["u_nyata", "sinyal kendali yang benar-benar keluar (sudah terpotong batas)"],
      ["u_minta", "sinyal kendali yang diminta perhitungan PID"],
      ["T", "periode cuplik"],
    ],
  },
  // [Waktu Nyata, Penjadwalan, dan Keandalan]
  "waktu hitung terburuk < T   |   jitter kecil, atau ukur dt sesungguhnya": {
    apa: "syarat waktu-nyata yang tidak bisa ditawar: perhitungan kendali TERLAMA harus selesai sebelum cuplikan berikutnya datang — rata-rata cepat tidak menolong bila sesekali telat. Bila jadwal eksekusi bergetar (jitter), ukur selang waktu sebenarnya dan pakai itu dalam rumus, jangan mengasumsikan T ideal.",
    variabel: [
      ["T", "periode cuplik yang dijanjikan"],
      ["jitter", "getaran jadwal: selisih waktu eksekusi nyata dari jadwal idealnya"],
      ["dt", "selang waktu antar eksekusi yang sesungguhnya terukur"],
    ],
  },
  // [Verifikasi Kode Kontrol Sebelum Menyentuh Mesin]
  "pisahkan hitung dari perangkat keras   |   uji keadaan tepi, bukan hanya keadaan normal": {
    apa: "dua kebiasaan yang membuat kode kendali bisa diuji: logika hitung dipisah dari akses perangkat keras supaya bisa diuji di komputer biasa tanpa mesin, dan pengujian justru menyasar keadaan tepi — error terbesar, aktuator jenuh, sensor putus — karena di sanalah kecelakaan terjadi, bukan di keadaan normal.",
    variabel: [
      ["keadaan tepi", "kombinasi masukan paling ekstrem yang masih mungkin terjadi"],
    ],
  },
  // [Aliasing: Komponen yang Menyamar Setelah Dicuplik]
  "batas = setengah frekuensi cuplikan   |   penapis harus analog, sebelum pencuplikan": {
    apa: "batas Nyquist dan konsekuensi praktisnya: komponen sinyal di atas setengah frekuensi cuplik tidak hilang saat dicuplik — ia MENYAMAR sebagai frekuensi rendah palsu yang tak bisa dibedakan lagi. Karena penyamaran terjadi PADA saat pencuplikan, penapis pencegahnya wajib analog dan dipasang sebelum ADC; menapis sesudahnya sudah terlambat selamanya.",
    variabel: [
      ["batas", "frekuensi Nyquist: sinyal tertinggi yang masih terwakili jujur"],
      ["frekuensi cuplikan", "berapa kali per detik sinyal dibaca"],
    ],
  },

  // ── Modul 7 ──────────────────────────────────────────────
  // [Menyimpulkan Parameter Sistem dari Bentuk Kurva]
  "zeta dari M_p   |   wd = 2*pi/periode   |   wn = wd/sqrt(1-zeta^2)": {
    apa: "resep identifikasi dari satu kurva step: baca lonjakan → dapat {{zeta}}; ukur jarak antar puncak osilasi → dapat {{wd}}; gabungkan keduanya → dapat {{wn}}. Tiga pengukuran penggaris ini memberi model orde dua lengkap tanpa satu pun persamaan diferensial diselesaikan.",
    variabel: [
      ["zeta", "rasio redaman, disimpulkan dari besarnya lonjakan"],
      ["M_p", "lonjakan maksimum, % di atas nilai akhir"],
      ["wd", "frekuensi osilasi teredam yang terlihat di kurva (rad/s)"],
      ["periode", "jarak waktu antara dua puncak berurutan"],
      ["pi", "konstanta lingkaran 3,14159…"],
      
      ["wn", "frekuensi alami: tempo dasar sistem seandainya tanpa redaman"],
    ],
  },
  // [Membedakan Sumber Masalah dari Pola Respons]
  "amplitudo tetap: ambang stabil | membesar: tidak stabil | awal berlawanan: zero kanan": {
    apa: "kamus diagnosis cepat dari bentuk osilasi: amplitudo yang bertahan konstan berarti sistem tepat di ambang kestabilan (gain sedikit lagi meledak); amplitudo membesar berarti sudah lewat ambang; dan keluaran yang berangkat ke arah SALAH sebelum berbalik adalah tanda tangan zero di kanan bidang-s — bukan salah penyetelan.",
    variabel: [
      ["amplitudo", "tinggi ayunan osilasi dari puncak ke puncak"],
      ["zero kanan", "zero di kanan sumbu khayal: pembawa watak 'mundur dulu baru maju'"],
    ],
  },
  // [Respons Terhadap Gangguan dan Terhadap Setpoint]
  "T_r = G*C/(1+G*C*H)   |   T_d = G/(1+G*C*H)   |   penyebut sama, pembilang berbeda": {
    apa: "dua fungsi transfer yang menjelaskan mengapa uji setpoint saja tidak cukup: jalur setpoint lewat controller ({{G*C}} di pembilang), jalur gangguan tidak ({{G}} saja). Penyebutnya sama sehingga kestabilannya satu, tetapi kecepatan menolak gangguan bisa jauh berbeda dari kecepatan mengikuti perintah — keduanya harus diuji terpisah.",
    variabel: [
      ["T_r", "fungsi transfer setpoint → keluaran"],
      ["T_d", "fungsi transfer gangguan → keluaran"],
      ["G", "plant"],
      ["C", "controller"],
      ["H", "sensor / umpan balik"],
    ],
  },
  // [Membaca Grafik Sinyal Kendali]
  "menyentuh batas: kejenuhan | getaran rapat: derau | lonjakan awal: turunan atas setpoint": {
    apa: "grafik sinyal kendali u(t) sering lebih banyak bercerita daripada grafik keluaran: garis yang menempel rata di batas berarti aktuator jenuh (respons dibatasi fisik, bukan gain); bulu-bulu rapat berarti derau sensor diperkuat suku D; dan paku raksasa tepat saat setpoint diubah berarti suku turunan bekerja atas setpoint — pindahkan turunannya ke keluaran.",
    variabel: [
      ["kejenuhan", "aktuator mentok di kemampuan maksimumnya"],
      ["derau", "kesalahan baca sensor yang ikut diperkuat controller"],
    ],
  },
  // [Kesalahan Pengukuran yang Menyamar Sebagai Masalah Kendali]
  "datar sempurna: curigai sensor beku | selisih tetap: curigai kalibrasi": {
    apa: "dua pola yang menyaru sebagai keberhasilan atau kegagalan kendali padahal masalah instrumentasi: kurva yang RATA SEMPURNA tanpa riak sekecil apa pun hampir pasti sensor berhenti memperbarui (dunia nyata selalu beriak); selisih konstan yang tak kunjung hilang padahal ada aksi integral hampir pasti kesalahan kalibrasi sensor, bukan kendali.",
    variabel: [
      ["sensor beku", "pembacaan berhenti diperbarui namun terus dilaporkan"],
      ["kalibrasi", "pemetaan nilai baca sensor terhadap besaran sesungguhnya"],
    ],
  },

  // ── Modul 8 ──────────────────────────────────────────────
  // [Empat Besaran yang Merangkum Seluruh Respons]
  "T(s) = wn^2/(s^2 + 2*zeta*wn*s + wn^2)   |   zeta mengatur bentuk, wn mengatur kecepatan": {
    apa: "bentuk baku orde dua — acuan pembanding hampir semua sistem umpan balik. Kekuatannya pada pembagian kerja yang bersih: {{zeta}} SENDIRIAN menentukan bentuk kurva (melonjak atau tidak, berapa persen), {{wn}} SENDIRIAN menentukan skala waktunya. Dua tombol, dua urusan, tidak saling campur.",
    variabel: [
      ["T(s)", "fungsi transfer loop tertutup baku"],
      ["wn", "frekuensi alami (rad/s): tempo dasar — makin besar makin cepat segalanya"],
      ["zeta", "rasio redaman: di bawah 1 melonjak dan berosilasi, 1 kritis, di atas 1 lamban tanpa lonjakan"],
      ["s", "peubah Laplace"],
    ],
  },
  // [Tipe Sistem dan Error Tunak]
  "tipe 0: e_step = 1/(1+Kp)   |   tipe 1: e_step = 0, e_ramp = 1/Kv": {
    apa: "tabel nasib error tunak menurut jumlah integrator di dalam loop: sistem tipe 0 (tanpa integrator) selalu menyisakan celah terhadap step; tipe 1 (satu integrator) menghapus celah step sampai NOL persis, tetapi terhadap sasaran yang bergerak (ramp) tetap tertinggal sebesar {{1/Kv}}. Menambah integrator menaikkan kelas sasaran yang bisa dikejar tanpa sisa.",
    variabel: [
      ["tipe", "jumlah integrator (faktor 1/s) di dalam loop terbuka"],
      ["e_step", "error tunak terhadap setpoint lompatan"],
      ["e_ramp", "error tunak terhadap setpoint yang naik linier"],
      ["Kp", "konstanta error posisi: gain loop pada frekuensi nol"],
      ["Kv", "konstanta error kecepatan"],
    ],
  },
  // [Menolak Gangguan Berbeda dari Mengikuti Setpoint]
  "T_r = GC/(1+GCH)   |   T_d = G/(1+GCH)   |   penyebut sama, pembilang berbeda": {
    apa: "pasangan fungsi transfer yang memisahkan dua tugas kendali: mengikuti perintah (jalur setpoint melewati controller, {{GC}} di pembilang) dan menolak gangguan (jalur gangguan hanya melewati plant, {{G}}). Penyebut yang sama berarti satu kestabilan bersama; pembilang yang berbeda berarti kinerja keduanya TIDAK otomatis sama — dan harus diuji masing-masing.",
    variabel: [
      ["T_r", "fungsi transfer setpoint → keluaran"],
      ["T_d", "fungsi transfer gangguan → keluaran"],
      ["G", "plant"],
      ["C", "controller"],
      ["H", "sensor / umpan balik"],
    ],
  },
  // [Margin Kestabilan sebagai Ukuran Jarak Aman]
  "zeta kira-kira PM/100   |   fase dead time = -w*L, membesar terhadap frekuensi": {
    apa: "dua aturan jempol margin: margin fase (derajat) dibagi 100 memberi taksiran kasar rasio redaman — PM 45° berarti sistem berperilaku seperti {{zeta}} ≈ 0,45; dan waktu mati adalah pemakan margin paling rakus karena sumbangan fasenya {{-w*L}} terus membesar terhadap frekuensi tanpa batas. Itulah mengapa proses ber-dead-time besar sulit dikendalikan agresif.",
    variabel: [
      ["zeta", "rasio redaman efektif loop tertutup"],
      ["PM", "margin fase (derajat): jarak fase loop dari titik kritis −180°"],
      ["w", "frekuensi (rad/s)"],
      ["L", "waktu mati sistem"],
    ],
  },
  // [Membaca Umpan Balik sebagai Pertukaran, Bukan Perbaikan Gratis]
  "S + T = 1 selalu   |   menekan S pada satu rentang berarti membesarkan di rentang lain": {
    apa: "hukum kekekalan umpan balik: fungsi sensitivitas dan fungsi transfer komplementer SELALU berjumlah satu, di setiap frekuensi, tanpa pengecualian. Konsekuensinya keras — menekan pengaruh gangguan ({{S}} kecil) di satu rentang frekuensi pasti dibayar dengan penguatan di rentang lain. Perancangan bukan menghapus keburukan, melainkan memindahkannya ke frekuensi yang paling tidak merugikan.",
    variabel: [
      ["S", "fungsi sensitivitas: seberapa tembus gangguan dan pergeseran plant"],
      ["T", "fungsi transfer komplementer: seberapa setia mengikuti setpoint (dan meneruskan derau)"],
    ],
  },

  // ── Modul 9 ──────────────────────────────────────────────
  // [Tiga Aksi, Tiga Pertanyaan Berbeda]
  "u = Kp*e + Ki*integral(e) + Kd*de/dt   |   sekarang, masa lalu, dan arah": {
    apa: "hukum PID dalam bentuk paralel: sinyal kendali adalah jumlahan tiga jawaban atas tiga pertanyaan — seberapa besar error SEKARANG (suku P), berapa banyak error yang sudah MENUMPUK (suku I), dan ke mana error sedang BERGERAK (suku D). Tiga sudut pandang waktu dalam satu baris.",
    variabel: [
      ["u", "sinyal kendali ke aktuator"],
      ["e", "error: setpoint dikurangi keluaran"],
      ["Kp", "gain proporsional: koreksi sebanding error saat ini"],
      ["Ki", "gain integral: kecepatan menumpuk koreksi dari error masa lalu"],
      ["Kd", "gain derivatif: rem terhadap laju perubahan error"],
      ["integral(e)", "akumulasi seluruh error sejak awal"],
      ["de/dt", "laju perubahan error saat ini"],
    ],
  },
  // [Bentuk Baku dan Arti Fisik Parameternya]
  "u = Kp*(e + (1/Ti)*integral(e) + Td*de/dt)   |   Ti dan Td bersatuan detik": {
    apa: "PID yang sama ditulis dalam bentuk baku industri: satu gain keseluruhan {{Kp}}, lalu dua parameter WAKTU. Kelebihannya bisa dirasakan: {{Ti}} adalah 'berapa detik integral butuh untuk menyamai kerja P', {{Td}} adalah 'berapa detik ke depan controller mencoba menengok'. Angka bersatuan detik jauh lebih mudah ditakar daripada gain gundul.",
    variabel: [
      ["u", "sinyal kendali"],
      ["Kp", "gain keseluruhan"],
      ["Ti", "waktu integral (detik): makin kecil, integral makin agresif"],
      ["Td", "waktu derivatif (detik): seberapa jauh menengok ke depan"],
      ["e", "error"],
    ],
  },
  // [Penyetelan: Dari Aturan Praktis ke Penyetelan Berbasis Model]
  "Ziegler-Nichols: Kp = 0,6*Ku, Ti = 0,5*Tu, Td = 0,125*Tu": {
    apa: "resep penyetelan klasik dari eksperimen ambang: naikkan gain P murni sampai sistem berosilasi tetap — catat gain kritisnya {{Ku}} dan periode osilasinya {{Tu}} — lalu ketiga parameter PID dibaca dari tabel ini. Hasilnya agresif (lonjakan ±25%); pakai sebagai titik awal yang kemudian dihaluskan, bukan jawaban akhir.",
    variabel: [
      ["Ku", "gain ultimate: gain P saat sistem mulai berosilasi dengan amplitudo tetap"],
      ["Tu", "periode ultimate: periode osilasi pada gain itu"],
      ["Kp", "gain proporsional hasil resep"],
      ["Ti", "waktu integral hasil resep"],
      ["Td", "waktu derivatif hasil resep"],
    ],
  },
  // [Anti-Windup dan Pembatasan yang Wajib Ada]
  "anti-windup: I += Kt*(u_nyata - u_minta)*T bersama pembatasan keluaran": {
    apa: "back-calculation: selama aktuator jenuh, selisih antara yang benar-benar keluar dan yang diminta bernilai negatif — suku ini MENGURAS akumulator integral secepat {{Kt}}, sehingga saat error berbalik, controller siap bereaksi seketika, bukan menunggu gelembung integralnya kempes dulu.",
    variabel: [
      ["I", "akumulator suku integral"],
      ["Kt", "gain anti-windup: laju pengurasan akumulator saat jenuh"],
      ["u_nyata", "sinyal yang benar-benar keluar (sudah dibatasi)"],
      ["u_minta", "sinyal yang diminta perhitungan PID"],
      ["T", "periode cuplik"],
    ],
  },
  // [Varian Struktur yang Sering Diperlukan]
  "turunan dari keluaran: D = -Kd*dy/dt   |   bobot setpoint: P = Kp*(b*r - y)": {
    apa: "dua modifikasi struktur yang menghilangkan hentakan saat setpoint diubah mendadak: suku turunan dihitung dari KELUARAN saja (keluaran tidak pernah melompat, setpoint bisa) sehingga 'tendangan derivatif' lenyap; dan setpoint diberi bobot {{b}} < 1 pada suku P untuk memperhalus reaksi awal tanpa mengubah perilaku terhadap gangguan.",
    variabel: [
      ["D", "suku derivatif"],
      ["Kd", "gain derivatif"],
      ["dy/dt", "laju perubahan keluaran (bukan error)"],
      ["b", "bobot setpoint 0..1 pada suku proporsional"],
      ["r", "setpoint"],
      ["y", "keluaran"],
    ],
  },
  // [PID pada Proses Berdead-Time Besar]
  "L/tau besar => penguatan aman mengecil; kurangi L dulu sebelum menyetel": {
    apa: "rasio {{L/tau}} adalah indeks kesulitan proses: makin besar porsi waktu mati dibanding konstanta waktunya, makin kecil gain yang masih aman — dan makin sia-sia penyetelan canggih. Urutan kerja yang benar: perangi dulu waktu matinya (pindahkan sensor, percepat komunikasi), baru setel; menyetel keras pada L besar hanya mengundang osilasi.",
    variabel: [
      ["L", "waktu mati: jeda sebelum efek aksi kendali mulai terlihat"],
      ["tau", "konstanta waktu proses"],
      ["L/tau", "indeks kesulitan: di atas ±0,5 proses mulai tergolong sulit"],
    ],
  },

  // ── Modul 10 ──────────────────────────────────────────────
  // [Ketika Reduksi Blok Menjadi Tidak Praktis]
  "reduksi blok: bertahap dan rawan tanda   |   Mason: sekali hitung dari daftar": {
    apa: "perbandingan dua rute menghitung fungsi transfer: reduksi blok menyederhanakan diagram selangkah demi selangkah — tiap langkah adalah kesempatan salah tanda; rumus Mason menghitung SEKALI dari daftar yang disusun sistematis (jalur maju, loop, sentuhan). Pada diagram berloop bersilangan, Mason bukan sekadar lebih cepat — reduksi bertahap nyaris mustahil.",
    variabel: [
      ["reduksi blok", "menyusutkan diagram bertahap dengan aturan seri/paralel/umpan balik"],
      ["Mason", "rumus penguatan Mason: satu perhitungan dari daftar jalur dan loop"],
    ],
  },
  // [Kosakata Grafik Aliran Sinyal]
  "simpul = sinyal, cabang = fungsi transfer, loop = jalur tertutup": {
    apa: "kamus penerjemah diagram blok menjadi grafik aliran sinyal: setiap sinyal menjadi titik (simpul), setiap blok menjadi anak panah berlabel gain (cabang), dan rute yang kembali ke titik awalnya sendiri disebut loop. Setelah diagram diterjemahkan ke kosakata ini, rumus Mason tinggal membaca daftarnya.",
    variabel: [
      ["simpul", "titik yang mewakili satu sinyal"],
      ["cabang", "panah berarah dengan gain: dari sinyal asal ke sinyal tujuan"],
      ["loop", "rute tertutup yang kembali ke simpul awal tanpa melewati simpul yang sama dua kali"],
    ],
  },
  // [Determinan Grafik dan Maknanya]
  "Delta = 1 - sum(L_i) + sum(L_i*L_j tak bersentuhan) - sum(tripel) + ...": {
    apa: "determinan grafik: satu dikurangi jumlah semua gain loop, ditambah hasil kali PASANGAN loop yang tak bersentuhan, dikurangi hasil kali tripel tak bersentuhan, berselang-seling seterusnya. Suku hasil-kali hanya diisi loop yang tidak berbagi simpul — di situlah hampir semua kesalahan hitung Mason terjadi.",
    variabel: [
      ["Delta", "determinan grafik: 'penyebut bersama' seluruh sistem"],
      ["L_i", "gain loop ke-i (hasil kali gain sekeliling rutenya)"],
      ["L_i*L_j", "hasil kali pasangan loop yang TIDAK bersentuhan"],
      ["sum", "penjumlahan atas semua kombinasi yang memenuhi syarat"],
    ],
  },
  // [Menerapkan Rumus Mason Secara Sistematis]
  "T = (1/Delta) * sum(P_k * Delta_k)": {
    apa: "rumus penguatan Mason selengkapnya: fungsi transfer total adalah jumlahan tiap jalur maju dikali determinan sisanya, dibagi determinan penuh. {{Delta_k}} dihitung seperti {{Delta}} tetapi HANYA dari loop yang tidak disentuh jalur ke-k — jalur yang menyentuh semua loop mendapat {{Delta_k}} = 1.",
    variabel: [
      ["T", "fungsi transfer total dari masukan ke keluaran"],
      ["P_k", "gain jalur maju ke-k: hasil kali gain sepanjang rutenya"],
      ["Delta", "determinan grafik penuh"],
      ["Delta_k", "determinan yang dihitung tanpa loop-loop yang disentuh jalur k"],
    ],
  },
  // [Batas Penerapan dan Hubungannya dengan Ruang Keadaan]
  "Delta = penyebut fungsi transfer = persamaan karakteristik": {
    apa: "tiga nama untuk satu benda: determinan grafik yang dihitung Mason IDENTIK dengan penyebut fungsi transfer, dan penyebut yang disamakan nol itulah persamaan karakteristik penentu kestabilan. Rumus Mason bukan trik terpisah — ia jalan lain menuju objek yang sama dengan aljabar blok dan ruang keadaan.",
    variabel: [
      ["Delta", "determinan grafik aliran sinyal"],
      ["persamaan karakteristik", "penyebut = 0: akar-akarnya adalah pole sistem"],
    ],
  },
  // [Loop Bersarang, Bersilangan, dan Berdiri Sendiri]
  "berdiri sendiri: menyumbang hasil kali | bersarang dan bersilangan: tidak": {
    apa: "aturan seleksi suku hasil-kali pada {{Delta}}: hanya pasangan loop yang benar-benar terpisah (tidak berbagi satu simpul pun) yang menyumbang suku {{L_i*L_j}}. Loop yang bersarang di dalam loop lain atau bersilangan dengannya otomatis bersentuhan — sukunya gugur. Salah menilai sentuhan = salah determinan = salah semua.",
    variabel: [
      ["berdiri sendiri", "dua loop tanpa satu pun simpul bersama"],
      ["bersarang", "loop kecil seluruhnya di dalam rute loop besar"],
      ["bersilangan", "dua loop berbagi sebagian rute"],
    ],
  },
  // [Menilai Kestabilan Langsung dari Determinan]
  "Delta = 0 adalah persamaan karakteristik; pembilang tidak diperlukan": {
    apa: "jalan pintas analisis kestabilan: karena kestabilan hanya ditentukan pole, dan pole adalah akar {{Delta}} = 0, maka cukup determinannya saja yang dihitung — daftar jalur maju dan seluruh pembilang boleh dilewati. Setengah pekerjaan Mason sudah menjawab pertanyaan stabil-atau-tidak.",
    variabel: [
      ["Delta", "determinan grafik"],
      ["pembilang", "bagian rumus Mason yang memuat jalur maju — tak berpengaruh pada kestabilan"],
    ],
  },

  // ── Modul 11 ──────────────────────────────────────────────
  // [Tiga Keluarga dan Watak Masing-Masing]
  "fuzzy: dari pengetahuan | ANN: dari data | evolusioner: pencari parameter": {
    apa: "peta singkat tiga keluarga kendali cerdas menurut BAHAN BAKUNYA: fuzzy menyandikan pengetahuan pakar yang sudah ada menjadi aturan; jaringan saraf menyuling perilaku dari data pengukuran; metode evolusioner tidak mengendalikan apa pun — ia mesin pencari parameter untuk struktur yang dirancang orang lain.",
    variabel: [
      ["fuzzy", "kendali berbasis aturan kata-kata dengan keanggotaan bertingkat"],
      ["ANN", "jaringan saraf tiruan: pemetaan yang dipelajari dari data"],
      ["evolusioner", "GA dan kerabatnya: pencarian parameter meniru seleksi alam"],
    ],
  },
  // [Menggabungkan Metode: Susunan yang Lazim]
  "evolusioner menyetel fuzzy | ANN menaksir, PID mengendalikan | cerdas di lapisan setpoint": {
    apa: "tiga pola gabungan yang terbukti aman di industri: GA menyetel parameter controller fuzzy (offline); jaringan saraf hanya MENAKSIR besaran yang tak terukur sementara loop kendali tetap PID klasik; dan metode cerdas duduk di lapisan atas yang memilih setpoint, bukan di loop cepat yang menyentuh aktuator. Kesamaannya: bagian cerdas tidak pernah dibiarkan memegang kemudi keselamatan sendirian.",
    variabel: [
      ["lapisan setpoint", "tingkat pengambil keputusan sasaran, di atas loop kendali cepat"],
    ],
  },

  // ── Modul 12 ──────────────────────────────────────────────
  // [Neuron Buatan dan Alasan Nonlinieritas Diperlukan]
  "y = f(sum(w_i*x_i) + b)   |   tanpa f nonlinier, kedalaman tidak berarti": {
    apa: "satu neuron: masukan-masukan ditimbang bobotnya, dijumlah bersama bias, lalu dilewatkan fungsi aktivasi {{f}}. Klausa kanannya alasan hidup fungsi itu: tanpa {{f}} nonlinier, jaringan seribu lapis pun runtuh menjadi satu perkalian matriks — kedalaman baru bermakna karena ada tikungannya.",
    variabel: [
      ["y", "keluaran neuron"],
      ["x_i", "masukan ke-i"],
      ["w_i", "bobot masukan ke-i: kekuatan sambungan yang dipelajari"],
      ["b", "bias: geseran ambang aktifnya neuron"],
      ["f", "fungsi aktivasi nonlinier (tanh, sigmoid, ReLU)"],
      ["sum", "penjumlahan atas seluruh masukan"],
    ],
  },
  // [Pelatihan sebagai Persoalan Pengoptimalan]
  "w := w - eta * dL/dw   |   permukaan tidak cembung, minimum global tidak dijamin": {
    apa: "gradient descent, jantung semua pelatihan: tiap bobot digeser MELAWAN arah tanjakan kerugian, selangkah sebesar {{eta}}. Peringatan kanannya jujur: permukaan kerugian jaringan saraf berbukit-bukit — penurunan gradien hanya menjamin sampai di SUATU lembah, belum tentu lembah terdalam. Karena itu pelatihan diulang dari beberapa titik awal.",
    variabel: [
      ["w", "bobot yang sedang dilatih"],
      [":=", "operator pembaruan: nilai baru menggantikan nilai lama"],
      ["eta", "laju belajar: ukuran langkah tiap pembaruan"],
      ["dL/dw", "gradien: arah dan curamnya kerugian terhadap bobot itu"],
      ["L", "fungsi kerugian yang sedang diminimumkan"],
    ],
  },
  // [Menghindari Hafalan: Pemisahan Data dan Pengaturan]
  "pisahkan latih / validasi / uji   |   hentikan saat kerugian validasi berbalik naik": {
    apa: "protokol anti-menghafal: data dibagi tiga peran yang tidak boleh saling bocor — latih untuk memperbarui bobot, validasi untuk memutuskan kapan berhenti, uji disegel sampai penilaian akhir. Sinyal berhentinya di klausa kanan: begitu kerugian VALIDASI berbalik naik padahal kerugian latih masih turun, jaringan sudah mulai menghafal, bukan belajar.",
    variabel: [
      ["latih", "porsi data untuk memperbarui bobot"],
      ["validasi", "porsi untuk memantau kapan belajar harus dihentikan"],
      ["uji", "porsi tersegel untuk penilaian akhir sekali saja"],
    ],
  },
  // [Memilih Arsitektur yang Cukup, Bukan yang Besar]
  "jumlah bobot << jumlah contoh   |   pilih terkecil yang kinerjanya sudah memadai": {
    apa: "dua aturan ukuran jaringan untuk kendali: parameter yang dipelajari harus JAUH lebih sedikit daripada contoh data (kalau tidak, jaringan sanggup menghafal semuanya), dan di antara arsitektur yang lolos target, pilih yang TERKECIL — lebih cepat dihitung di loop kendali, lebih mudah diperiksa, lebih kecil ruang kejutannya.",
    variabel: [
      ["jumlah bobot", "banyaknya parameter yang dipelajari jaringan"],
      ["jumlah contoh", "banyaknya pasangan data latih"],
      ["<<", "jauh lebih kecil daripada"],
    ],
  },

  // ── Modul 13 ──────────────────────────────────────────────
  // [Keanggotaan Bertingkat dan Alasannya]
  "mu(x) di antara 0 dan 1   |   derajat keanggotaan bukan peluang": {
    apa: "fondasi logika fuzzy: keanggotaan pada sebuah himpunan bukan ya/tidak melainkan derajat 0–1 — suhu 28° boleh 'agak panas' sebesar 0,6. Klausa kanan menepis salah paham tersering: 0,6 itu BUKAN peluang 60% panas; ia mengukur kekaburan batas kata, bukan ketidakpastian kejadian, dan jumlah derajat antar-himpunan tidak wajib satu.",
    variabel: [
      ["mu(x)", "derajat keanggotaan nilai x pada sebuah himpunan"],
      ["x", "besaran masukan yang sedang dinilai (mis. error)"],
    ],
  },
  // [Basis Aturan sebagai Pengetahuan yang Dieksekusi]
  "jika error = A dan d(error) = B maka keluaran = C   |   7 x 7 = 49 aturan": {
    apa: "bentuk baku satu aturan fuzzy: sepasang kondisi kata-kata (error dan laju perubahannya) memetakan ke satu keluaran kata-kata. Hitungan kanannya konsekuensi kombinatorik: 7 tingkat untuk tiap masukan berarti 49 sel aturan yang semuanya harus terisi dan konsisten — alasan praktisi sering cukup memakai 5, bahkan 3 tingkat.",
    variabel: [
      ["error", "selisih setpoint terhadap keluaran"],
      ["d(error)", "laju perubahan error"],
      ["A, B, C", "label linguistik: Negatif Besar … Nol … Positif Besar"],
      ["7 x 7", "banyak kombinasi aturan bila tiap masukan punya 7 label"],
    ],
  },
  // [Tiga Tahap Pemrosesan]
  "fuzzifikasi -> inferensi (min untuk dan) -> defuzzifikasi (pusat massa)": {
    apa: "jalur pipa lengkap satu siklus fuzzy: angka mentah diubah menjadi derajat keanggotaan, kata sambung 'dan' dihitung dengan operasi min lalu semua aturan yang menyala digabung, dan bentuk gabungan diringkas kembali menjadi SATU angka lewat titik pusat massanya. Masuk angka, keluar angka — kata-kata hanya hidup di tengah.",
    variabel: [
      ["fuzzifikasi", "angka → derajat keanggotaan tiap label"],
      ["inferensi", "mengevaluasi semua aturan; 'dan' = min, penggabungan = max"],
      ["defuzzifikasi", "bentuk gabungan → satu angka lewat pusat massa (centroid)"],
    ],
  },
  // [Hubungannya dengan PID dan Kapan Ia Menang]
  "fuzzy(e, de) ~ PD nonlinier   |   unggul saat perilaku harus berbeda per daerah": {
    apa: "posisi jujur fuzzy terhadap PID: controller fuzzy atas error dan laju error pada dasarnya kendali PD yang permukaannya boleh DITEKUK. Pada plant linier sederhana ia takkan mengalahkan PID yang disetel baik; keunggulannya muncul saat daerah kerja berbeda menuntut perilaku berbeda — lembut dekat sasaran, agresif saat jauh — yang bagi PID butuh penjadwalan gain terpisah.",
    variabel: [
      ["e", "error"],
      ["de", "laju perubahan error"],
      ["PD", "kendali proporsional-derivatif"],
    ],
  },
  // [Penyetelan dan Pengujian Controller Fuzzy]
  "penskalaan error ~ Kp   |   penskalaan laju error ~ Kd   |   periksa permukaan kendali": {
    apa: "cara menjinakkan penyetelan fuzzy: faktor skala masukan error berperan seperti {{Kp}} dan faktor skala laju error seperti {{Kd}} — intuisi PID langsung terpakai, tak perlu menyentuh 49 aturan satu-satu. Pemeriksaan wajibnya menggambar permukaan kendali u(e, de): permukaan yang berlubang atau bertangga menandakan aturan yang bolong atau bertabrakan.",
    variabel: [
      ["penskalaan error", "faktor pengali sebelum error masuk semesta fuzzy"],
      ["penskalaan laju error", "faktor pengali untuk laju perubahan error"],
      ["Kp", "padanannya pada PID: gain proporsional"],
      ["Kd", "padanannya pada PID: gain derivatif"],
      ["permukaan kendali", "peta lengkap keluaran u untuk setiap kombinasi (e, de)"],
    ],
  },
  // [Dua Bentuk Inferensi dan Kapan Memilihnya]
  "kesimpulan berupa himpunan: terbaca | kesimpulan berupa bilangan: ringan dan mudah dioptimalkan": {
    apa: "dua mazhab inferensi dan alasan memilihnya: Mamdani menyimpulkan HIMPUNAN fuzzy — enak dibaca dan diaudit pakar, cocok saat kejelasan diutamakan; Sugeno menyimpulkan BILANGAN (atau fungsi) langsung — lebih ringan dihitung di perangkat tertanam dan lebih ramah untuk dioptimalkan otomatis, mis. disetel GA.",
    variabel: [
      ["Mamdani", "inferensi berkesimpulan himpunan fuzzy, didefuzzifikasi di akhir"],
      ["Sugeno", "inferensi berkesimpulan bilangan/fungsi, dirata-rata berbobot"],
    ],
  },

  // ── Modul 14 ──────────────────────────────────────────────
  // [Ketika Pencarian Berbasis Turunan Tidak Dapat Dipakai]
  "GA hanya perlu menilai, tidak perlu menurunkan   |   harganya: banyak penilaian": {
    apa: "syarat masuk GA yang sangat rendah: cukup BISA MENILAI mutu sebuah kandidat (jalankan simulasi, hitung skor) — tak perlu rumus turunan, tak peduli fungsi patah-patah atau bertingkat. Tagihannya di klausa kanan: tanpa petunjuk arah gradien, GA meraba lewat ribuan penilaian; bila satu penilaian mahal, di situlah GA berhenti masuk akal.",
    variabel: [
      ["GA", "algoritma genetika: pencarian meniru seleksi alam"],
      ["menilai", "menghitung fitness satu kandidat, biasanya lewat simulasi"],
      ["menurunkan", "menghitung gradien fungsi tujuan — yang justru tidak dibutuhkan"],
    ],
  },
  // [Merancang Fungsi Tujuan yang Jujur]
  "J = w1*ITAE + w2*integral(u^2) + w3*penalti overshoot   |   pelanggaran keras: tolak": {
    apa: "resep fungsi tujuan penyetelan kendali: gabungan tertimbang antara kecepatan koreksi (ITAE menghukum error yang betah lama), penghematan energi aktuator, dan hukuman lonjakan. Aturan kanan tak bisa ditawar: batas keselamatan bukan suku penalti — kandidat yang melanggarnya DITOLAK, berapa pun bagus skor lainnya, agar GA tidak menemukan celah menukar keselamatan dengan kecepatan.",
    variabel: [
      ["J", "fungsi tujuan: skor total yang diminimumkan"],
      ["w1, w2, w3", "bobot kepentingan tiap kriteria"],
      ["ITAE", "integral |error| berbobot waktu: error yang berlarut dihukum makin berat"],
      ["integral(u^2)", "total energi sinyal kendali"],
      ["penalti overshoot", "hukuman untuk lonjakan melewati sasaran"],
    ],
  },
  // [Membaca Perilaku Pencarian]
  "pantau nilai terbaik DAN keragaman   |   jalankan beberapa kali, laporkan sebarannya": {
    apa: "dua kebiasaan membaca GA dengan jujur: kurva nilai terbaik saja bisa menipu — pantau juga keragaman populasi, sebab keragaman yang runtuh dini berarti pencarian macet di lembah lokal walau kurvanya tampak 'sudah rapi'. Dan karena GA berangkat dari undian, satu kali jalan bukan bukti: ulangi beberapa kali dan laporkan sebaran hasilnya.",
    variabel: [
      ["nilai terbaik", "fitness kandidat teratas tiap generasi"],
      ["keragaman", "seberapa tersebar populasi di ruang pencarian"],
    ],
  },
  // [Merancang Fungsi Kebugaran yang Jujur]
  "J = w1*integral e^2 + w2*integral u^2 + w3*lonjakan + denda pelanggaran batas": {
    apa: "fungsi kebugaran untuk penyetelan gain: kuadrat error menghukum penyimpangan besar, kuadrat sinyal kendali menghukum pemborosan aktuator, suku lonjakan menjaga kehalusan, dan denda pelanggaran memagari batas operasi. Bobot-bobotnya adalah kemudi Anda — GA hanya sejujur fungsi yang disodorkan kepadanya.",
    variabel: [
      ["J", "skor kebugaran yang diminimumkan"],
      ["w1, w2, w3", "bobot kepentingan tiap kriteria"],
      ["integral e^2", "akumulasi kuadrat error sepanjang simulasi"],
      ["integral u^2", "akumulasi kuadrat sinyal kendali (energi)"],
      ["lonjakan", "besar overshoot respons"],
      ["denda", "hukuman tambahan bila batas operasi dilanggar"],
    ],
  },
  // [Menyetel Ukuran Populasi, Laju Mutasi, dan Elitisme]
  "populasi puluhan | mutasi beberapa persen | elitisme 1-2 individu": {
    apa: "titik awal yang waras untuk tiga tombol GA pada soal penyetelan kendali: populasi berukuran puluhan (bukan ribuan — tiap individu adalah satu simulasi), peluang mutasi beberapa persen (penjaga keragaman, bukan mesin pengacak), dan 1–2 individu terbaik diloloskan utuh ke generasi berikut supaya pencapaian tak pernah mundur.",
    variabel: [
      ["populasi", "banyak kandidat yang hidup bersamaan tiap generasi"],
      ["mutasi", "peluang sebuah gen diubah acak setelah persilangan"],
      ["elitisme", "banyak kandidat terbaik yang dijamin lolos tanpa diubah"],
    ],
  },
};
