// Materi mendalam Modul 2-14 Sistem Kendali Cerdas.
//
// Dipisah dari enrich-sisken-modules.mjs supaya generator tetap terbaca:
// generator mengurus struktur dan HTML, berkas ini mengurus isi.
//
// Modul 1 TIDAK ada di sini — modul itu ditulis tangan mengikuti Modul 1
// Getaran Mekanik dan dilewati generator (lihat LEWATI di generator).
//
// Bentuk tiap entri:
//   deep       [{ head, body:[paragraf], formula? }]  badan materi utama
//   derivation { head, intro, steps:[[label, ekspresi, catatan]], closing }
//   worked     { head, given:[], steps:[[label, ekspresi, catatan]], answer }
//   pitfalls   [[judul, penjelasan]]                  salah kaprah yang sering terjadi
//   checklist  [butir]                                daftar periksa sebelum lanjut
//
// Rumus ditulis sebagai teks biasa (bukan LaTeX) mengikuti gaya kartu konsep
// yang sudah ada, mis. "T(s) = G(s)/(1+G(s)H(s))".

export const MATERI = {
  2: {
    deep: [
      {
        head: "Spesifikasi: Mengubah Keinginan Menjadi Angka",
        body: [
          "Permintaan yang datang ke meja engineer hampir tidak pernah berbentuk angka. Yang terdengar adalah \"suhunya jangan naik-turun\", \"responnya harus cepat\", atau \"jangan sampai kebablasan\". Kalimat semacam itu tidak bisa diuji, tidak bisa disimulasikan, dan tidak bisa dijadikan dasar penerimaan pekerjaan. Langkah pertama perancangan adalah menerjemahkannya menjadi besaran yang punya satuan dan batas.",
          "Empat besaran menjadi tulang punggung spesifikasi respons transien. Rise time menyatakan berapa lama keluaran menempuh sepuluh sampai sembilan puluh persen perubahan setpoint. Settling time menyatakan kapan keluaran menetap di dalam pita toleransi, umumnya dua atau lima persen. Overshoot menyatakan seberapa jauh keluaran melewati setpoint sebelum kembali. Error tunak menyatakan selisih yang tersisa setelah semua transien hilang.",
          "Keempatnya saling tarik-menarik dan tidak bisa dioptimalkan bersamaan tanpa biaya. Menuntut rise time yang sangat singkat berarti menuntut aksi kontrol yang besar, dan aksi besar berarti actuator harus mampu, konsumsi energi naik, serta overshoot cenderung membesar. Menekan overshoot sampai nol biasanya memperlambat respons. Karena itu spesifikasi yang baik selalu menyebutkan mana yang boleh dikorbankan, bukan hanya mana yang diinginkan.",
          "Di luar respons, spesifikasi wajib memuat batas fisik dan batas keselamatan: rentang keluaran actuator, laju perubahan maksimum, rentang pengukuran sensor, serta kondisi yang harus memicu penghentian. Batas inilah yang paling sering dilanggar oleh desain yang hanya dikejar di simulasi, karena simulasi dengan senang hati memberikan sinyal kendali yang tidak mungkin dihasilkan perangkat nyata.",
        ],
        formula: "spesifikasi = {t_r, t_s, M_p, e_ss, |u|max, robustness}",
      },
      {
        head: "Model: Cukup Akurat, Bukan Selengkap Mungkin",
        body: [
          "Model bukan tiruan sempurna plant, melainkan alat untuk menjawab pertanyaan tertentu. Model yang tepat adalah model paling sederhana yang masih menangkap dinamika di rentang frekuensi kerja controller. Menambah detail di luar rentang itu tidak membuat desain lebih baik; ia hanya membuat perhitungan lebih lambat dan parameter lebih sulit diidentifikasi.",
          "Untuk sebagian besar proses termal, fluida, dan mekanik lambat, model orde satu ditambah dead time sudah memadai. Tiga parameternya — gain statik, konstanta waktu, dan dead time — dapat diperoleh dari satu uji step yang dijalankan pada titik kerja normal. Gain diperoleh dari perbandingan perubahan keluaran terhadap perubahan masukan, konstanta waktu dari waktu mencapai 63,2 persen perubahan akhir, dan dead time dari jeda sebelum keluaran mulai bergerak.",
          "Sistem mekanik dengan massa, redaman, dan kekakuan menuntut model orde dua karena ia menyimpan energi dalam dua bentuk sekaligus, yaitu kinetik dan potensial. Kemampuan menyimpan energi dalam dua bentuk itulah yang memungkinkan osilasi, dan osilasi tidak akan pernah muncul pada model orde satu betapapun parameternya diubah. Salah memilih orde model berarti salah memperkirakan seluruh karakter respons.",
          "Ketika fisika terlalu rumit atau parameternya tidak terjangkau, model berbasis data menjadi pilihan. Konsekuensinya harus disadari: model semacam itu hanya berlaku pada rentang operasi yang terwakili di data pelatihan. Di luar rentang tersebut ekstrapolasinya tidak punya jaminan apa pun, sehingga sistem harus dilengkapi mekanisme yang mengenali kondisi di luar cakupan dan mengembalikan kendali ke logika yang aman.",
        ],
        formula: "G(s) = K*exp(-Ls)/(tau*s+1)   |   m*x'' + b*x' + k*x = F(t)",
      },
      {
        head: "Arsitektur: Memutuskan Sebelum Menyetel",
        body: [
          "Pemilihan arsitektur mendahului penyetelan parameter, dan pengaruhnya jauh lebih besar. Controller PID yang disetel sempurna pada arsitektur yang keliru akan kalah oleh PID biasa pada arsitektur yang tepat. Keputusan arsitektural mencakup penempatan sensor, jumlah loop, hubungan antarloop, keberadaan feedforward, serta lapisan mana yang bertanggung jawab atas keselamatan.",
          "Loop bersarang dipakai ketika satu besaran cepat berada di dalam besaran lambat, misalnya arus di dalam kecepatan, atau kecepatan di dalam posisi. Loop dalam dibuat jauh lebih cepat daripada loop luar, umumnya lima sampai sepuluh kali, sehingga loop luar dapat memperlakukan loop dalam sebagai penguat sederhana. Susunan ini menekan gangguan di dekat sumbernya dan menyederhanakan penyetelan karena setiap loop dapat disetel bergiliran dari dalam ke luar.",
          "Feedforward dipakai ketika gangguan dapat diukur sebelum pengaruhnya muncul di keluaran. Umpan balik selalu bereaksi setelah error terbentuk; umpan maju bertindak lebih dulu berdasarkan pengukuran gangguan. Keduanya bukan pengganti melainkan pelengkap: feedforward menangani gangguan yang diketahui, feedback menangani sisa kesalahan model dan gangguan yang tidak terukur.",
          "Lapisan keselamatan harus berdiri terpisah dari lapisan kendali. Interlock, batas keras, dan mekanisme penghentian tidak boleh bergantung pada perhitungan controller yang sama, karena kegagalan perhitungan itulah yang justru harus diantisipasi. Prinsipnya sederhana: bagian yang menjaga keselamatan harus tetap bekerja meskipun bagian yang mengejar kinerja gagal total.",
        ],
        formula: "loop dalam >= 5x lebih cepat daripada loop luar",
      },
      {
        head: "Simulasi: Menguji Kegagalan Sebelum Ia Mahal",
        body: [
          "Nilai simulasi bukan pada mempercantik kurva respons, melainkan pada memurahkan kegagalan. Skenario yang harus diuji justru yang tidak nyaman: setpoint berubah jauh, gangguan datang bersamaan, sensor memberi nilai membeku, actuator mentok di batasnya, dan parameter plant bergeser dari nilai nominal.",
          "Kejenuhan actuator wajib dimasukkan ke model sejak awal karena ia mengubah perilaku sistem secara mendasar. Ketika actuator mentok, loop praktis terputus, dan pada controller dengan aksi integral kondisi ini menimbulkan penumpukan integral yang membuat keluaran melewati setpoint jauh melebihi perkiraan. Mekanisme anti-windup bukan hiasan; ia bagian dari desain dasar setiap controller berintegral.",
          "Pemilihan solver dan langkah waktu ikut menentukan apakah hasil simulasi dapat dipercaya. Sistem dengan konstanta waktu yang sangat berbeda bersifat kaku, dan solver langkah tetap akan menuntut langkah sangat kecil atau memberi hasil yang menyesatkan. Aturan praktis yang aman adalah memakai langkah waktu di bawah sepersepuluh konstanta waktu tercepat, lalu memverifikasi dengan mengulang simulasi pada langkah setengahnya dan memastikan hasilnya tidak berubah bermakna.",
          "Setiap simulasi yang dipakai sebagai dasar keputusan harus dapat diulang orang lain. Itu berarti mencatat versi kode, nilai seluruh parameter, kondisi awal, jenis solver, dan langkah waktu. Grafik tanpa catatan tersebut tidak bisa diverifikasi, dan hasil yang tidak bisa diverifikasi tidak layak dijadikan dasar commissioning.",
        ],
        formula: "dt <= 0.1 * tau_tercepat, lalu ulangi pada dt/2 untuk verifikasi",
      },
      {
        head: "Implementasi dan Validasi: Dari Angka ke Perangkat",
        body: [
          "Perpindahan dari simulasi ke perangkat nyata memunculkan persoalan yang tidak ada di komputer: derau pengukuran, resolusi konverter, jeda komunikasi, dan waktu cacah yang tidak sepenuhnya seragam. Aksi turunan paling terpengaruh karena ia memperkuat komponen frekuensi tinggi, sehingga hampir selalu memerlukan penapis dan pembatasan penguatan.",
          "Commissioning dilakukan bertahap dan selalu dengan jalan keluar yang siap. Urutan yang lazim adalah menguji sensor dan actuator secara terpisah, menjalankan loop dalam mode manual, menutup loop dengan penguatan konservatif, lalu menaikkan kinerja sedikit demi sedikit sambil mengamati sinyal kendali. Menutup loop langsung pada penguatan hasil simulasi adalah cara tercepat merusak perangkat.",
          "Validasi menjawab pertanyaan yang berbeda dari verifikasi. Verifikasi menanyakan apakah sistem dibangun sesuai rancangan; validasi menanyakan apakah sistem yang dibangun benar-benar memenuhi kebutuhan operasi. Sistem bisa lolos verifikasi sepenuhnya namun gagal validasi, misalnya ketika spesifikasi awal ternyata tidak mencerminkan cara operator sebenarnya menjalankan mesin.",
          "Dokumen serah terima yang baik memuat bukti, bukan klaim. Rekaman respons terhadap perubahan setpoint dan gangguan, nilai akhir parameter controller, hasil uji interlock, serta catatan penyimpangan yang diterima beserta alasannya. Berkas inilah yang dipakai ketika sistem bermasalah setahun kemudian dan tidak ada seorang pun yang masih mengingat alasan setiap keputusan.",
        ],
        formula: "verifikasi: dibuat dengan benar   |   validasi: yang benar yang dibuat",
      },
    ],
    derivation: {
      head: "Menurunkan Spesifikasi Orde Dua Menjadi Target Pole",
      intro: "Spesifikasi transien yang dinyatakan operator dapat diterjemahkan menjadi letak pole yang harus dicapai. Penurunan berikut memakai model orde dua baku sebagai penghubungnya.",
      steps: [
        ["Model baku orde dua", "T(s) = wn^2/(s^2 + 2*z*wn*s + wn^2)", "Dua parameter, yaitu rasio redaman z dan frekuensi alami wn, menentukan seluruh karakter respons."],
        ["Overshoot dari redaman", "M_p = exp(-pi*z/sqrt(1-z^2))", "Overshoot hanya bergantung pada z, sama sekali tidak pada wn. Inilah alasan overshoot disetel lebih dulu."],
        ["Redaman dari overshoot", "z = -ln(M_p)/sqrt(pi^2 + ln(M_p)^2)", "Membalik hubungan sebelumnya sehingga batas overshoot langsung memberi nilai z minimum."],
        ["Settling time menentukan wn", "t_s ~ 4/(z*wn)  =>  wn ~ 4/(z*t_s)", "Setelah z diketahui, tuntutan kecepatan menetapkan wn. Kriteria 4/(z*wn) memakai pita dua persen."],
        ["Letak pole yang dituju", "s = -z*wn +/- j*wn*sqrt(1-z^2)", "Pasangan pole inilah sasaran perancangan; bagian nyata mengatur peluruhan, bagian imajiner mengatur osilasi."],
      ],
      closing: "Hasil penurunan ini adalah target, bukan jaminan. Model baku mengandaikan tidak ada zero dan tidak ada pole tambahan; kehadirannya akan menggeser respons sebenarnya sehingga verifikasi lewat simulasi tetap wajib.",
    },
    worked: {
      head: "Contoh Terhitung: Dari Permintaan Operator ke Target Pole",
      given: [
        "Operator meminta overshoot tidak lebih dari 10 persen",
        "Keluaran harus menetap dalam 2 detik pada pita dua persen",
        "Plant didekati model orde dua tanpa zero",
      ],
      steps: [
        ["Hitung redaman minimum", "z = -ln(0,10)/sqrt(pi^2 + ln(0,10)^2)", "ln(0,10) = -2,3026 sehingga z = 2,3026/sqrt(9,8696 + 5,3020) = 2,3026/3,8951 = 0,591"],
        ["Hitung frekuensi alami", "wn = 4/(z*t_s) = 4/(0,591*2)", "Diperoleh wn = 3,384 rad/s."],
        ["Tentukan letak pole", "s = -0,591*3,384 +/- j*3,384*sqrt(1-0,591^2)", "Bagian nyata -2,000 dan bagian imajiner +/-2,731."],
        ["Periksa kembali", "M_p = exp(-pi*0,591/sqrt(1-0,591^2)) = 0,0999", "Overshoot hasil hitung 9,99 persen, tepat di bawah batas yang diminta."],
      ],
      answer: "Pole sasaran adalah s = -2,000 +/- j2,731. Setiap kandidat controller sekarang dapat dinilai secara objektif: apakah ia menempatkan pole loop tertutup di sekitar titik tersebut tanpa menuntut sinyal kendali di luar kemampuan actuator.",
    },
    pitfalls: [
      ["Menyetel sebelum menetapkan spesifikasi", "Tanpa angka target, penyetelan berubah menjadi selera. Tidak ada dasar untuk menyatakan pekerjaan selesai, dan tidak ada dasar untuk menolak permintaan perubahan berikutnya."],
      ["Mengabaikan batas actuator saat simulasi", "Simulasi tanpa kejenuhan memberi hasil yang terlalu optimistis. Di perangkat nyata sinyal kendali terpotong, respons melambat, dan aksi integral menumpuk."],
      ["Menganggap model lebih rumit selalu lebih baik", "Model dengan banyak parameter sulit diidentifikasi dan mudah keliru. Ketidakpastian parameternya sering lebih besar daripada perbaikan akurasi yang dijanjikan."],
      ["Menyamakan verifikasi dengan validasi", "Sistem dapat memenuhi seluruh spesifikasi tertulis namun tetap tidak berguna di lapangan bila spesifikasinya sendiri keliru menangkap kebutuhan."],
      ["Menutup loop langsung pada penguatan hasil simulasi", "Selisih antara model dan perangkat selalu ada. Menaikkan penguatan bertahap sambil mengamati sinyal kendali jauh lebih murah daripada mengganti komponen yang rusak."],
    ],
    checklist: [
      "Seluruh spesifikasi sudah berupa angka bersatuan, bukan kata sifat",
      "Batas actuator dan rentang sensor tercatat eksplisit",
      "Orde model dipilih berdasarkan mekanisme fisik penyimpan energi",
      "Parameter model diperoleh dari uji pada titik kerja normal",
      "Arsitektur ditetapkan sebelum parameter disetel",
      "Skenario gangguan, kejenuhan, dan kegagalan sensor sudah disimulasikan",
      "Langkah waktu solver diverifikasi dengan mengulang pada setengahnya",
      "Rencana commissioning bertahap beserta jalan keluarnya sudah disiapkan",
    ],
  },

  3: {
    deep: [
      {
        head: "Mengapa Domain-s Menyederhanakan Persoalan Dinamik",
        body: [
          "Persamaan diferensial menyulitkan karena turunan menghubungkan nilai fungsi dengan lajunya pada saat yang sama. Transformasi Laplace memetakan operasi turunan menjadi perkalian dengan s, sehingga persamaan diferensial linier berubah menjadi persamaan aljabar. Persoalan yang semula menuntut integrasi berubah menjadi persoalan manipulasi pecahan.",
          "Definisinya adalah integral dari nol sampai tak hingga atas f(t) dikalikan exp(-st). Batas bawah nol menjelaskan mengapa Laplace cocok untuk persoalan teknik: sistem fisik selalu memiliki saat mulai, dan kondisi sebelum saat itu diringkas menjadi kondisi awal. Faktor exp(-st) juga menjelaskan syarat keberadaan, yaitu bahwa pertumbuhan f(t) tidak boleh melampaui laju eksponensial tertentu.",
          "Keuntungan terpenting bagi perancangan kontrol adalah bahwa konvolusi di domain waktu menjadi perkalian di domain-s. Respons sistem terhadap masukan sembarang, yang di domain waktu berupa integral konvolusi yang merepotkan, di domain-s cukup berupa perkalian antara fungsi transfer dan transformasi masukan.",
          "Yang perlu dijaga adalah kesadaran bahwa domain-s hanyalah representasi. Tidak ada besaran fisik bernama s yang dapat diukur. Seluruh kesimpulan yang diambil di domain-s pada akhirnya harus dibaca kembali sebagai perilaku terhadap waktu, dan itulah gunanya invers transformasi.",
        ],
        formula: "F(s) = integral_0^inf f(t)*exp(-st) dt   |   L{f*g} = F(s)*G(s)",
      },
      {
        head: "Sifat Turunan dan Peran Kondisi Awal",
        body: [
          "Sifat yang paling sering dipakai dalam analisis sistem adalah transformasi turunan. Transformasi turunan pertama menghasilkan sX(s) dikurangi nilai awal, dan turunan kedua menghasilkan s kuadrat dikali X(s) dikurangi s dikali nilai awal dikurangi laju awal. Kondisi awal masuk secara eksplisit, bukan sebagai konstanta integrasi yang harus dicari belakangan.",
          "Struktur ini memberi keuntungan praktis yang besar. Pada penyelesaian klasik, konstanta integrasi baru dapat ditentukan setelah solusi umum diperoleh; pada Laplace, kondisi awal sudah ikut sejak baris pertama. Kesalahan yang sering terjadi justru muncul ketika kondisi awal diabaikan karena dianggap nol tanpa memeriksa keadaan fisik sistem.",
          "Fungsi transfer didefinisikan pada kondisi awal nol. Definisi tersebut bukan penyederhanaan sembarangan melainkan konsekuensi dari tujuan: fungsi transfer dimaksudkan menggambarkan sifat sistem itu sendiri, terlepas dari keadaan penyimpanan energinya pada saat tertentu. Ketika kondisi awal tidak nol, pengaruhnya muncul sebagai suku tambahan yang terpisah dari suku akibat masukan.",
          "Sifat lain yang penting adalah pergeseran waktu, yang memetakan tundaan murni menjadi faktor exp(-Ls). Faktor ini bukan fungsi rasional, sehingga sistem dengan dead time tidak dapat dinyatakan sebagai pecahan polinomial biasa. Itulah sumber kesulitan pengendalian proses dengan tundaan besar, dan alasan lahirnya struktur khusus seperti prediktor Smith.",
        ],
        formula: "L{x'} = sX(s) - x(0)   |   L{x''} = s^2*X(s) - s*x(0) - x'(0)   |   L{f(t-L)} = exp(-Ls)*F(s)",
      },
      {
        head: "Pecahan Parsial: Membongkar Respons Menjadi Mode",
        body: [
          "Hasil penyelesaian aljabar di domain-s hampir selalu berupa fungsi rasional. Untuk kembali ke domain waktu, fungsi itu diuraikan menjadi jumlah pecahan sederhana yang masing-masing punya pasangan invers yang sudah dikenal. Setiap pecahan mewakili satu mode respons.",
          "Pole nyata yang berbeda menghasilkan suku eksponensial murni. Pole nyata berulang menghasilkan suku eksponensial yang dikalikan pangkat t, sehingga responsnya sempat naik sebelum akhirnya meluruh. Pasangan pole kompleks konjugat menghasilkan eksponensial yang dikalikan sinus atau kosinus, yaitu osilasi teredam.",
          "Cara tercepat memperoleh koefisien pada pole sederhana adalah metode penutupan: kalikan seluruh ekspresi dengan faktor pole yang bersangkutan, lalu evaluasi pada nilai pole tersebut. Untuk pole berulang diperlukan turunan, dan untuk pole kompleks perhitungannya menghasilkan pasangan konjugat yang bila digabung memberi bentuk amplitudo dan fase.",
          "Manfaat konseptualnya melampaui perhitungan. Dengan melihat uraian pecahan parsial, engineer dapat langsung mengenali mode mana yang paling lambat dan karenanya mendominasi respons. Mode dengan pole jauh di kiri meluruh cepat dan pengaruhnya singkat, sehingga sistem berorde tinggi sering dapat didekati oleh sepasang pole dominan saja.",
        ],
        formula: "Y(s) = sum A_i/(s - p_i)   |   A_i = [(s - p_i)*Y(s)] pada s = p_i",
      },
      {
        head: "Pole, Zero, dan Pembacaan Kestabilan",
        body: [
          "Pole adalah akar penyebut fungsi transfer dan menentukan bentuk dasar respons alami. Bagian nyata pole menentukan laju peluruhan atau pertumbuhan, sedangkan bagian imajiner menentukan frekuensi osilasi. Syarat kestabilan sistem linier waktu-invarian sepenuhnya ditentukan olehnya: seluruh pole harus memiliki bagian nyata negatif.",
          "Zero adalah akar pembilang dan tidak menentukan kestabilan, namun sangat memengaruhi bentuk respons. Zero mengubah bobot setiap mode dalam respons total. Zero di sebelah kanan sumbu imajiner menimbulkan gejala yang khas, yaitu keluaran mula-mula bergerak berlawanan arah dengan tujuan sebelum akhirnya menuju nilai akhir.",
          "Gejala arah berlawanan tersebut membatasi seberapa agresif sistem boleh dikendalikan. Menaikkan penguatan pada sistem dengan zero fase non-minimum memperbesar gerakan awal yang salah arah dan mempercepat hilangnya kestabilan. Batas ini bersifat mendasar dan tidak dapat dihilangkan hanya dengan penyetelan.",
          "Teorema nilai akhir memberi jalan pintas yang berguna untuk memeriksa nilai tunak tanpa melakukan invers penuh. Syarat pemakaiannya harus dipatuhi: teorema hanya berlaku bila seluruh pole sY(s) berada di sebelah kiri sumbu imajiner. Memakainya pada sistem tidak stabil akan menghasilkan angka yang tampak masuk akal namun sepenuhnya keliru.",
        ],
        formula: "stabil <=> Re(p_i) < 0 untuk semua i   |   y(inf) = lim s->0 s*Y(s)",
      },
      {
        head: "Membaca Kembali ke Domain Waktu",
        body: [
          "Setiap analisis di domain-s harus berakhir pada pernyataan tentang perilaku terhadap waktu, karena itulah yang dialami operator dan mesin. Pole di -2 berarti mode yang meluruh dengan konstanta waktu setengah detik. Pasangan pole di -1 plus minus j3 berarti osilasi sekitar 0,48 hertz yang amplitudonya menyusut dengan konstanta waktu satu detik.",
          "Kebiasaan menerjemahkan angka menjadi kalimat semacam itu membedakan pemakaian Laplace sebagai alat berpikir dari pemakaiannya sebagai prosedur hitung. Engineer yang terbiasa membaca letak pole dapat memperkirakan bentuk respons sebelum menjalankan satu simulasi pun, dan kemampuan itu sangat berharga ketika harus mendiagnosis masalah di lapangan.",
          "Pemeriksaan sederhana yang selalu layak dilakukan adalah membandingkan nilai awal dan nilai akhir hasil hitung dengan yang diketahui secara fisik. Bila hasil invers memberi nilai awal yang tidak sesuai kondisi awal yang dipakai, pasti ada kekeliruan aljabar di suatu tempat, dan memeriksanya sekarang jauh lebih murah daripada menemukannya setelah controller dipasang.",
          "Perlu diingat pula bahwa seluruh kerangka ini berlaku untuk sistem linier waktu-invarian. Pada sistem nyata, linearitas hanya berlaku di sekitar titik kerja. Ketika sistem bergerak jauh dari titik itu, misalnya karena kejenuhan actuator atau perubahan beban besar, kesimpulan yang diperoleh dari fungsi transfer perlu diperiksa ulang.",
        ],
        formula: "pole -a  =>  exp(-a*t), tau = 1/a   |   pole -a +/- jb  =>  exp(-a*t)*cos(b*t)",
      },
    ],
    derivation: {
      head: "Menurunkan Respons Step Sistem Orde Satu",
      intro: "Penurunan berikut menunjukkan seluruh alur Laplace pada kasus paling dasar: dari persamaan diferensial, ke domain-s, kembali ke domain waktu.",
      steps: [
        ["Persamaan sistem", "tau*y' + y = K*u,  y(0) = 0", "Model orde satu baku dengan gain statik K dan konstanta waktu tau."],
        ["Transformasikan tiap suku", "tau*(s*Y - 0) + Y = K*U", "Sifat turunan dipakai; kondisi awal nol membuat suku y(0) hilang."],
        ["Susun fungsi transfer", "Y/U = K/(tau*s + 1)", "Y difaktorkan lalu dibagi U. Inilah fungsi transfer sistem."],
        ["Masukkan masukan step", "U = A/s  =>  Y = A*K/(s*(tau*s+1))", "Step bertinggi A memiliki transformasi A/s."],
        ["Uraikan pecahan parsial", "Y = A*K*[1/s - tau/(tau*s+1)]", "Koefisien diperoleh dengan metode penutupan pada pole s = 0 dan s = -1/tau."],
        ["Invers ke domain waktu", "y(t) = A*K*(1 - exp(-t/tau))", "Pecahan pertama memberi konstanta, pecahan kedua memberi eksponensial meluruh."],
      ],
      closing: "Hasilnya menjelaskan makna fisik kedua parameter sekaligus: K menentukan nilai akhir A*K, sedangkan tau menentukan kecepatan menuju nilai itu. Pada t sama dengan tau keluaran mencapai 63,2 persen perubahan akhir, dan pada t sama dengan empat tau sudah mencapai 98,2 persen.",
    },
    worked: {
      head: "Contoh Terhitung: Sistem Orde Dua dengan Masukan Step",
      given: [
        "Persamaan sistem x'' + 4x' + 13x = 10, dengan x(0) = 0 dan x'(0) = 0",
        "Yang dicari: nilai tunak, jenis respons, dan konstanta waktu peluruhan",
      ],
      steps: [
        ["Transformasikan", "s^2*X + 4s*X + 13X = 10/s", "Seluruh kondisi awal nol sehingga tidak ada suku tambahan."],
        ["Susun X(s)", "X(s) = 10/(s*(s^2 + 4s + 13))", "Penyebut memuat pole masukan di s = 0 dan pole sistem dari polinomial kuadrat."],
        ["Cari akar penyebut sistem", "s = (-4 +/- sqrt(16 - 52))/2 = -2 +/- j3", "Diskriminan negatif sehingga pole berupa pasangan kompleks konjugat."],
        ["Baca jenis respons", "z = 2/sqrt(13) = 0,5547", "Rasio redaman di antara nol dan satu, jadi respons berupa osilasi teredam dengan overshoot."],
        ["Hitung nilai tunak", "x(inf) = lim s->0 s*X(s) = 10/13", "Seluruh pole sX(s) berada di kiri sumbu imajiner sehingga teorema nilai akhir sah dipakai."],
      ],
      answer: "Nilai tunak 10/13 atau sekitar 0,769. Responsnya berosilasi teredam pada frekuensi 3 rad/s dengan selubung yang meluruh menurut exp(-2t), berarti konstanta waktu peluruhan 0,5 detik. Overshoot dapat diperkirakan dari z = 0,5547 yakni sekitar 12,2 persen.",
    },
    pitfalls: [
      ["Melupakan kondisi awal pada sistem yang tidak dimulai dari diam", "Suku s*x(0) dan x'(0) sering diabaikan karena kebiasaan mengerjakan soal berkondisi awal nol. Pada sistem nyata yang sedang beroperasi, keadaan awal jarang nol."],
      ["Memakai teorema nilai akhir tanpa memeriksa syaratnya", "Pada sistem tidak stabil teorema tetap memberi angka, dan angka itu selalu salah. Periksa letak pole sebelum memakainya."],
      ["Mengira zero tidak berpengaruh karena tidak menentukan kestabilan", "Zero mengubah bobot tiap mode. Zero di kanan sumbu imajiner bahkan membalik arah gerak awal keluaran."],
      ["Menyamakan dead time dengan pole tambahan", "Faktor exp(-Ls) bukan fungsi rasional. Pendekatan Pade dapat dipakai, namun sifatnya pendekatan dan hanya berlaku pada rentang frekuensi terbatas."],
      ["Berhenti di domain-s", "Letak pole tidak berarti apa pun bagi operator. Selalu terjemahkan menjadi konstanta waktu, frekuensi osilasi, dan nilai tunak."],
    ],
    checklist: [
      "Persamaan sistem sudah linier dan waktu-invarian di sekitar titik kerja",
      "Kondisi awal diperiksa terhadap keadaan fisik, bukan diasumsikan nol",
      "Penyebut difaktorkan dan letak seluruh pole diketahui",
      "Jenis respons disimpulkan dari rasio redaman, bukan dari bentuk grafik semata",
      "Syarat teorema nilai akhir diperiksa sebelum dipakai",
      "Hasil invers dicek terhadap nilai awal dan nilai akhir yang diketahui",
      "Kesimpulan dinyatakan kembali sebagai perilaku terhadap waktu",
    ],
  },

  4: {
    deep: [
      {
        head: "Apa yang Diwakili dan Tidak Diwakili Fungsi Transfer",
        body: [
          "Fungsi transfer adalah rasio transformasi keluaran terhadap transformasi masukan pada kondisi awal nol. Ia memusatkan perhatian pada hubungan masukan dan keluaran, dan sengaja mengabaikan apa yang terjadi di dalam sistem. Pemusatan itulah kekuatannya sekaligus batasnya.",
          "Karena kondisi awal ditetapkan nol, fungsi transfer tidak memuat informasi tentang energi yang tersimpan di dalam sistem pada saat pengamatan dimulai. Ia juga tidak memuat keadaan internal yang tidak terhubung ke masukan atau tidak terlihat di keluaran. Dinamika semacam itu tetap ada dan tetap dapat membahayakan, namun tidak akan tampak sama sekali pada fungsi transfer.",
          "Konsekuensi praktisnya nyata. Sebuah sistem dapat memiliki fungsi transfer yang tampak sepenuhnya stabil sementara ada keadaan internal yang tumbuh tanpa batas, asalkan keadaan itu tidak muncul di keluaran yang diukur. Karena itu analisis berbasis fungsi transfer perlu dilengkapi pemahaman fisik tentang seluruh besaran yang menyimpan energi.",
          "Sifat lain yang layak diingat adalah bahwa orde penyebut menyatakan jumlah penyimpan energi bebas dalam sistem, dan selisih orde penyebut terhadap pembilang menentukan seberapa cepat penguatan turun pada frekuensi tinggi. Sistem fisik selalu memiliki penyebut berorde lebih tinggi daripada pembilang, karena tidak ada perangkat nyata yang meneruskan sinyal berfrekuensi tak hingga.",
        ],
        formula: "G(s) = Y(s)/U(s) pada kondisi awal nol   |   orde penyebut >= orde pembilang",
      },
      {
        head: "Susunan Seri dan Syarat yang Sering Dilanggar",
        body: [
          "Dua blok yang tersusun seri memiliki fungsi transfer gabungan berupa perkalian keduanya. Aturan ini begitu sederhana sehingga syaratnya kerap terlupakan, padahal syarat itulah yang menentukan apakah perkalian sah dilakukan.",
          "Syaratnya adalah tidak adanya pembebanan, yaitu bahwa blok kedua tidak mengubah perilaku blok pertama ketika keduanya disambungkan. Pada rangkaian listrik, syarat ini terpenuhi bila impedansi masukan blok kedua jauh lebih besar daripada impedansi keluaran blok pertama. Ketika tidak terpenuhi, fungsi transfer gabungan bukan sekadar perkalian dan harus diturunkan ulang dari persamaan rangkaian yang tersambung.",
          "Kasus yang paling sering menjebak adalah dua tapis RC pasif yang disambung langsung. Perkalian dua fungsi transfer orde satu memberi hasil yang berbeda dari penurunan langsung rangkaian gabungan, karena tapis kedua menarik arus dari tapis pertama. Solusi praktisnya adalah menyisipkan penyangga di antara keduanya, sehingga syarat tanpa pembebanan benar-benar terpenuhi.",
          "Pada sistem mekanik, pembebanan muncul sebagai reaksi dari beban terhadap penggerak. Gearbox dan poros elastis mengubah inersia efektif yang dirasakan motor, sehingga model motor yang diukur tanpa beban tidak berlaku lagi setelah beban terpasang. Mengabaikannya menghasilkan penyetelan yang tampak benar di meja uji namun meleset di mesin sesungguhnya.",
        ],
        formula: "G_eq = G1*G2 hanya bila blok kedua tidak membebani blok pertama",
      },
      {
        head: "Susunan Paralel dan Umpan Balik",
        body: [
          "Cabang paralel menerima masukan yang sama dan hasilnya dijumlahkan di titik penjumlahan, sehingga fungsi transfer gabungannya adalah penjumlahan atau pengurangan sesuai tanda pada titik tersebut. Struktur ini muncul secara alami pada controller PID, yang ketiga aksinya bekerja atas error yang sama dan hasilnya dijumlahkan.",
          "Umpan balik mengubah struktur secara jauh lebih mendalam daripada seri maupun paralel. Fungsi transfer loop tertutup memiliki penyebut satu ditambah gain loop, dan penyebut itulah yang menentukan seluruh sifat kestabilan sistem tertutup. Pole loop tertutup adalah akar dari persamaan karakteristik, yaitu penyebut tersebut disamakan dengan nol.",
          "Inilah alasan umpan balik begitu berharga sekaligus begitu berbahaya. Berharga karena penyebut yang berubah memungkinkan perancang memindahkan pole ke tempat yang dikehendaki, menekan sensitivitas terhadap perubahan parameter plant, dan mengurangi pengaruh gangguan. Berbahaya karena penyebut yang sama dapat memiliki akar di sebelah kanan sumbu imajiner, dan ketika itu terjadi sistem yang semula stabil menjadi tidak stabil.",
          "Ketika gain loop jauh lebih besar daripada satu, fungsi transfer tertutup mendekati kebalikan dari fungsi transfer umpan balik. Kesimpulan ini penting dan sering mengejutkan: pada penguatan tinggi, perilaku sistem lebih ditentukan oleh sensor pada jalur umpan balik daripada oleh plant itu sendiri. Karena itu kualitas dan kalibrasi sensor menjadi penentu kinerja yang tidak bisa ditawar.",
        ],
        formula: "G_eq = G1 +/- G2   |   T = G/(1 + G*H)   |   bila G*H >> 1 maka T ~ 1/H",
      },
      {
        head: "Mereduksi Diagram Blok Secara Sistematis",
        body: [
          "Diagram blok yang rumit direduksi dengan menerapkan aturan dasar berulang kali, bukan dengan menebak. Urutan yang aman adalah menyederhanakan seri dan paralel yang jelas terlebih dahulu, lalu menyelesaikan loop paling dalam, dan bergerak ke luar selapis demi selapis sampai tersisa satu blok.",
          "Kesulitan muncul ketika loop saling bersilangan sehingga tidak ada loop dalam yang berdiri sendiri. Dalam keadaan itu titik cabang atau titik penjumlahan perlu dipindahkan lebih dahulu. Memindahkan titik cabang ke hulu suatu blok mengharuskan penyisipan blok yang sama pada cabang tersebut, sedangkan memindahkannya ke hilir mengharuskan penyisipan kebalikannya.",
          "Setiap langkah pemindahan berpotensi menimbulkan kekeliruan tanda, dan kekeliruan tanda pada umpan balik mengubah kesimpulan kestabilan secara total. Karena itu setiap hasil reduksi perlu diperiksa dengan dua uji sederhana yang murah: memeriksa gain arus searah dengan mengevaluasi pada s sama dengan nol, dan memeriksa apakah satuan keluaran terhadap masukan masuk akal secara fisik.",
          "Pada sistem dengan banyak lintasan, aturan Mason memberi jalan yang lebih ringkas karena hasilnya diperoleh langsung tanpa reduksi bertahap. Metode itu dibahas tersendiri pada modul selanjutnya; yang perlu ditegaskan di sini adalah bahwa keduanya harus memberi jawaban yang sama, sehingga salah satunya dapat dipakai untuk memeriksa yang lain.",
        ],
        formula: "cabang dipindah ke hulu blok G: sisipkan G   |   ke hilir: sisipkan 1/G",
      },
      {
        head: "Sensitivitas: Alasan Sesungguhnya Memakai Umpan Balik",
        body: [
          "Manfaat umpan balik sering dijelaskan sebatas mengurangi error, padahal manfaat yang lebih mendasar adalah mengurangi kepekaan terhadap ketidakpastian. Fungsi sensitivitas menyatakan seberapa besar perubahan relatif pada fungsi transfer tertutup akibat perubahan relatif pada plant.",
          "Hasilnya menunjukkan bahwa sensitivitas berbanding terbalik dengan satu ditambah gain loop. Bila gain loop bernilai sembilan, perubahan sepuluh persen pada plant hanya menghasilkan perubahan sekitar satu persen pada perilaku tertutup. Inilah alasan sistem berumpan balik tetap bekerja baik meskipun parameter plant berubah karena keausan, suhu, atau beban.",
          "Perlindungan itu tidak gratis. Gain loop yang tinggi memperbesar aksi kontrol, memperkuat derau sensor, dan mendekatkan sistem ke batas kestabilan. Terdapat pula batasan mendasar yang menyatakan bahwa penekanan gangguan pada satu rentang frekuensi harus dibayar dengan penguatan pada rentang frekuensi lain; sensitivitas tidak dapat ditekan di semua frekuensi sekaligus.",
          "Karena itu perancangan yang matang tidak mengejar gain setinggi mungkin, melainkan menempatkan penekanan sensitivitas pada rentang frekuensi tempat gangguan sesungguhnya berada, sambil menjaga jarak aman terhadap kestabilan pada frekuensi tempat model plant sudah tidak dapat dipercaya.",
        ],
        formula: "S = 1/(1 + G*H)   |   dT/T = S * dG/G",
      },
    ],
    derivation: {
      head: "Menurunkan Fungsi Transfer Loop Tertutup",
      intro: "Penurunan singkat berikut memperlihatkan dari mana penyebut satu ditambah gain loop berasal, dan mengapa tanda pada titik penjumlahan begitu menentukan.",
      steps: [
        ["Definisikan sinyal error", "E(s) = R(s) - H(s)*Y(s)", "Titik penjumlahan mengurangkan sinyal umpan balik dari referensi."],
        ["Nyatakan keluaran", "Y(s) = G(s)*E(s)", "Keluaran adalah error yang dilewatkan lintasan maju."],
        ["Substitusikan error", "Y = G*(R - H*Y)", "Persamaan kini hanya memuat Y dan R."],
        ["Kumpulkan suku Y", "Y + G*H*Y = G*R", "Suku umpan balik dipindahkan ke ruas kiri."],
        ["Faktorkan dan bagi", "T = Y/R = G/(1 + G*H)", "Penyebut 1 + G*H inilah persamaan karakteristik sistem tertutup."],
      ],
      closing: "Bila tanda pada titik penjumlahan positif, penyebutnya menjadi satu dikurangi gain loop. Perubahan tanda tunggal ini dapat memindahkan pole ke sebelah kanan sumbu imajiner, sehingga sistem yang dirancang stabil justru menjadi tidak stabil. Memeriksa tanda umpan balik adalah pemeriksaan pertama saat sistem berperilaku aneh.",
    },
    worked: {
      head: "Contoh Terhitung: Reduksi Seri dengan Umpan Balik",
      given: [
        "Lintasan maju terdiri atas dua blok seri, G1 = 5/(2s+1) dan G2 = 3/(s+4)",
        "Umpan balik berupa sensor dengan penguatan tetap H = 0,2",
      ],
      steps: [
        ["Gabungkan blok seri", "G = G1*G2 = 15/((2s+1)*(s+4))", "Diandaikan tidak ada pembebanan antara kedua blok."],
        ["Uraikan penyebut", "(2s+1)*(s+4) = 2s^2 + 9s + 4", "Bentuk polinomial memudahkan langkah berikutnya."],
        ["Bentuk loop tertutup", "T = G/(1 + G*H) = 15/(2s^2 + 9s + 4 + 3)", "G*H = 3/(2s^2+9s+4), sehingga penyebut bertambah 3."],
        ["Sederhanakan", "T = 15/(2s^2 + 9s + 7)", "Persamaan karakteristik loop tertutup adalah 2s^2 + 9s + 7 = 0."],
        ["Cari pole tertutup", "s = (-9 +/- sqrt(81 - 56))/4 = (-9 +/- 5)/4", "Diperoleh s = -1 dan s = -3,5, keduanya nyata dan negatif."],
        ["Periksa gain arus searah", "T(0) = 15/7 = 2,143", "Bandingkan dengan terbuka: G(0) = 15/4 = 3,75. Umpan balik menurunkan gain seperti yang diharapkan."],
      ],
      answer: "Sistem tertutup stabil dengan dua pole nyata di -1 dan -3,5, sehingga responsnya teredam lebih tanpa overshoot. Pole di -1 paling lambat dan mendominasi, memberi konstanta waktu sekitar satu detik. Error tunak terhadap step satuan adalah 1 dikurangi 0,2 dikali 2,143 dibagi satu, menyisakan selisih yang hanya dapat dihilangkan dengan menambahkan aksi integral.",
    },
    pitfalls: [
      ["Mengalikan blok seri tanpa memeriksa pembebanan", "Dua tapis RC yang disambung langsung tidak menghasilkan perkalian fungsi transfernya. Sisipkan penyangga atau turunkan ulang dari rangkaian gabungan."],
      ["Salah tanda pada titik penjumlahan", "Penyebut berubah dari 1 + GH menjadi 1 - GH. Sistem yang dirancang stabil dapat langsung menjadi tidak stabil."],
      ["Mengira fungsi transfer menggambarkan seluruh sistem", "Keadaan internal yang tidak terkendali atau tidak teramati tidak muncul sama sekali, padahal tetap dapat tumbuh tanpa batas."],
      ["Mencoret pole dengan zero yang berdekatan", "Pencoretan hanya sah secara matematis. Bila pole yang dicoret berada di sebelah kanan, sistem tetap tidak stabil meskipun fungsi transfernya tampak bersih."],
      ["Mengejar gain loop setinggi mungkin", "Sensitivitas memang menurun, tetapi derau sensor menguat, actuator lebih cepat jenuh, dan jarak ke batas kestabilan menyempit."],
    ],
    checklist: [
      "Masukan dan keluaran yang ditinjau dinyatakan dengan jelas",
      "Kondisi awal nol dipastikan sebelum memakai fungsi transfer",
      "Syarat tanpa pembebanan diperiksa pada setiap sambungan seri",
      "Tanda pada setiap titik penjumlahan ditelusuri ulang",
      "Hasil reduksi diperiksa lewat gain arus searah dan kelayakan satuan",
      "Letak pole loop tertutup dihitung, bukan hanya bentuk fungsi transfernya",
      "Pencoretan pole dengan zero tidak dilakukan pada daerah tidak stabil",
    ],
  },
};

export default MATERI;
