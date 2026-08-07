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

  5: {
    deep: [
      {
        head: "Simulasi Sebagai Eksperimen, Bukan Sekadar Gambar",
        body: [
          "Simulasi yang berguna dirancang seperti eksperimen: ada pertanyaan yang hendak dijawab, ada besaran yang divariasikan, ada besaran yang dijaga tetap, dan ada kriteria untuk menyatakan hasilnya bermakna. Tanpa pertanyaan yang jelas, simulasi hanya menghasilkan kurva yang enak dipandang namun tidak menuntun keputusan apa pun.",
          "Setiap eksperimen simulasi perlu menyebutkan enam hal: model beserta asumsinya, nilai seluruh parameter, kondisi awal, jenis masukan uji, solver dan langkah waktu, serta metrik yang akan dibandingkan. Enam hal itu pula yang memungkinkan orang lain mengulang hasil dan memperoleh angka yang sama.",
          "Masukan uji dipilih sesuai sifat yang ingin diperiksa. Step menguji respons terhadap perubahan mendadak dan memperlihatkan overshoot serta waktu menetap. Ramp menguji kemampuan mengikuti target yang bergerak dan memperlihatkan error kecepatan. Sinus pada beberapa frekuensi memperlihatkan bandwidth dan penguatan. Impuls memperlihatkan respons alami sistem secara langsung.",
          "Membandingkan hasil simulasi dengan data pengukuran menuntut kehati-hatian pada titik kerja. Model linier hanya berlaku di sekitar titik kerja tempat ia diturunkan, sehingga membandingkan simulasi pada beban ringan dengan pengukuran pada beban penuh akan memberi selisih yang tampak seperti kesalahan model padahal hanya perbedaan kondisi.",
        ],
        formula: "eksperimen = {model, parameter, kondisi awal, masukan, solver, metrik}",
      },
      {
        head: "Ruang Keadaan dan Fungsi Transfer: Dua Sudut Pandang",
        body: [
          "Model ruang keadaan menyatakan sistem sebagai sekumpulan persamaan diferensial orde satu yang saling terkait, dengan vektor keadaan sebagai ingatan sistem. Bentuk ini menampung sistem banyak masukan dan banyak keluaran secara alami, sedangkan fungsi transfer pada dasarnya menggambarkan satu pasangan masukan-keluaran.",
          "Perbedaan yang lebih mendasar adalah bahwa ruang keadaan menampakkan seluruh dinamika internal, termasuk yang tidak terlihat dari keluaran. Dua sistem dapat memiliki fungsi transfer identik namun ruang keadaan berbeda; yang satu bisa memiliki mode internal tidak stabil yang tersembunyi, dan perbedaan itu menentukan apakah sistem aman dipakai.",
          "Perpindahan antar keduanya bersifat searah tanpa kehilangan pada satu arah dan berisiko kehilangan pada arah lain. Dari ruang keadaan ke fungsi transfer selalu dapat dilakukan dengan rumus baku. Dari fungsi transfer ke ruang keadaan menghasilkan realisasi yang tidak tunggal, dan realisasi minimum hanya memuat bagian yang terkendali sekaligus teramati.",
          "Untuk keperluan simulasi, bentuk ruang keadaan biasanya lebih disukai karena solver numerik bekerja langsung atas sistem persamaan orde satu. Integrasi dilakukan atas vektor keadaan, dan keluaran dihitung dari keadaan tersebut pada setiap langkah.",
        ],
        formula: "x' = A*x + B*u,  y = C*x + D*u   |   G(s) = C*(sI - A)^-1*B + D",
      },
      {
        head: "Solver Numerik dan Perangkap Kekakuan",
        body: [
          "Solver numerik memperkirakan penyelesaian dengan melangkah maju dalam waktu. Metode Euler maju paling sederhana namun paling tidak akurat dan paling mudah kehilangan kestabilan numerik. Runge-Kutta orde empat memberi ketepatan jauh lebih baik untuk biaya hitung yang masih wajar, dan menjadi pilihan baku pada banyak persoalan kontrol.",
          "Kekakuan muncul ketika sistem memuat mode yang lajunya berbeda jauh, misalnya dinamika listrik dalam milidetik bersama dinamika termal dalam menit. Solver eksplisit terpaksa memakai langkah sekecil mode tercepat meskipun yang menarik hanya mode lambat, sehingga simulasi menjadi sangat lambat. Solver implisit dirancang untuk keadaan ini dan tetap stabil pada langkah besar.",
          "Langkah waktu yang terlalu besar tidak selalu memberi hasil yang tampak salah. Bahayanya justru pada hasil yang terlihat masuk akal namun keliru, misalnya osilasi yang teredam padahal sistem sebenarnya tidak stabil. Karena itu pemeriksaan wajib dilakukan dengan mengulang simulasi pada langkah setengahnya; bila hasilnya berubah bermakna, langkah semula terlalu besar.",
          "Pada simulasi controller digital, langkah waktu solver harus dibedakan dari waktu cacah controller. Plant berjalan kontinu sedangkan controller memperbarui keluarannya secara berkala, dan pemodelan yang menyamakan keduanya akan menyembunyikan pengaruh waktu cacah terhadap kestabilan.",
        ],
        formula: "dt <= 0,1 * tau_tercepat   |   kekakuan = tau_lambat/tau_cepat >> 1",
      },
      {
        head: "Validasi Model Terhadap Data Nyata",
        body: [
          "Model belum berguna sebelum dibandingkan dengan perilaku perangkat sesungguhnya. Prosedur yang lazim memisahkan data menjadi bagian untuk identifikasi dan bagian untuk pengujian. Model disetel memakai bagian pertama, lalu dinilai memakai bagian kedua yang belum pernah dilihat.",
          "Model yang cocok sempurna pada data identifikasi namun buruk pada data pengujian merupakan gejala terlalu banyak parameter. Menambah parameter selalu memperbaiki kecocokan pada data yang dipakai menyetelnya, dan perbaikan itu menyesatkan. Kriteria pemilihan model yang baik memberi hukuman terhadap jumlah parameter agar kecenderungan tersebut terkendali.",
          "Metrik kecocokan perlu dipilih sesuai kepentingan. Galat kuadrat rata-rata memberi bobot besar pada penyimpangan besar dan cocok bila lonjakan berbahaya. Galat mutlak rata-rata lebih tahan terhadap pencilan. Untuk keperluan kontrol, kecocokan pada rentang frekuensi kerja controller jauh lebih penting daripada kecocokan rata-rata di seluruh rentang.",
          "Perbedaan yang tersisa antara model dan perangkat bukan kegagalan melainkan informasi. Selisih itu perlu dinyatakan sebagai rentang ketidakpastian, dan controller dirancang agar tetap memenuhi spesifikasi di seluruh rentang tersebut, bukan hanya pada nilai nominalnya.",
        ],
        formula: "RMSE = sqrt(mean((y_ukur - y_model)^2))   |   pisahkan data latih dan data uji",
      },
      {
        head: "Dari Simulasi ke Perangkat Keras Secara Bertahap",
        body: [
          "Pengujian bertahap mengurangi risiko dengan menambahkan satu unsur nyata pada satu waktu. Tahap pertama menjalankan seluruhnya di komputer. Tahap berikutnya menjalankan controller pada perangkat sasaran yang sesungguhnya sementara plant masih berupa model, sehingga pengaruh waktu cacah, aritmetika terbatas, dan jeda perhitungan mulai terlihat.",
          "Tahap selanjutnya memakai plant nyata dengan pengaman tambahan berupa pembatasan keluaran, batas darurat, dan kemampuan mengembalikan kendali ke operator seketika. Setiap tahap memiliki kriteria lulus sendiri, dan kegagalan pada satu tahap mengembalikan pekerjaan ke tahap sebelumnya alih-alih dipaksakan maju.",
          "Perbedaan yang paling sering mengejutkan pada peralihan ke perangkat keras adalah derau pengukuran. Sinyal yang bersih di simulasi menjadi bergetar di lapangan, dan aksi turunan yang tampak menguntungkan di komputer dapat membuat actuator bergetar terus-menerus. Penapis pada jalur turunan hampir selalu diperlukan.",
          "Catatan pengujian setiap tahap merupakan bagian dari hasil kerja, bukan pelengkap. Ketika sistem bermasalah di kemudian hari, catatan itulah yang memungkinkan pembedaan antara masalah baru dan perilaku yang sejak awal memang sudah ada namun belum pernah menjadi persoalan.",
        ],
        formula: "simulasi murni -> controller nyata + plant model -> plant nyata terbatas -> operasi",
      },
    ],
    derivation: {
      head: "Menurunkan Ruang Keadaan Sistem Massa-Pegas-Peredam",
      intro: "Penurunan berikut memperlihatkan cara mengubah satu persamaan orde dua menjadi dua persamaan orde satu yang siap diintegrasikan solver numerik.",
      steps: [
        ["Hukum Newton", "m*x'' + b*x' + k*x = F(t)", "Jumlah gaya pada massa sama dengan massa dikali percepatan."],
        ["Pilih variabel keadaan", "x1 = x (posisi),  x2 = x' (kecepatan)", "Dipilih besaran yang menyimpan energi: potensial pada pegas, kinetik pada massa."],
        ["Persamaan pertama", "x1' = x2", "Definisi langsung: turunan posisi adalah kecepatan."],
        ["Persamaan kedua", "x2' = (F - b*x2 - k*x1)/m", "Diperoleh dengan menyelesaikan hukum Newton terhadap percepatan."],
        ["Susun bentuk matriks", "A = [[0, 1], [-k/m, -b/m]],  B = [[0], [1/m]]", "Keluaran posisi memberi C = [1, 0] dan D = [0]."],
        ["Periksa lewat pole", "det(sI - A) = s^2 + (b/m)*s + k/m", "Polinomial karakteristik sama dengan penyebut fungsi transfernya, sebagaimana seharusnya."],
      ],
      closing: "Bentuk ini siap diserahkan ke solver numerik karena hanya memuat turunan pertama. Dari sini pula terbaca bahwa rasio redaman adalah b dibagi dua akar km, dan frekuensi alami adalah akar k per m.",
    },
    worked: {
      head: "Contoh Terhitung: Memilih Langkah Waktu Simulasi",
      given: [
        "Sistem massa-pegas-peredam dengan m = 2 kg, b = 12 N.s/m, k = 50 N/m",
        "Simulasi memakai solver langkah tetap",
      ],
      steps: [
        ["Hitung frekuensi alami", "wn = sqrt(k/m) = sqrt(50/2) = 5 rad/s", "Menentukan skala waktu dasar sistem."],
        ["Hitung rasio redaman", "z = b/(2*sqrt(k*m)) = 12/(2*sqrt(100)) = 0,6", "Nilai di antara nol dan satu, jadi respons berosilasi teredam."],
        ["Cari pole", "s = -z*wn +/- j*wn*sqrt(1-z^2) = -3 +/- j4", "Bagian nyata -3 memberi konstanta waktu peluruhan 1/3 detik."],
        ["Tentukan mode tercepat", "tau_tercepat = 1/3 = 0,333 s", "Hanya ada satu pasangan pole sehingga inilah skala tercepat."],
        ["Pilih langkah waktu", "dt <= 0,1 * 0,333 = 0,033 s", "Diambil dt = 0,01 s untuk margin, sekitar sepertiga batas."],
        ["Verifikasi", "ulangi pada dt = 0,005 s", "Bila puncak overshoot dan waktu menetap tidak berubah bermakna, dt = 0,01 s memadai."],
      ],
      answer: "Langkah waktu 0,01 detik memadai dan terbukti lewat pengulangan pada setengahnya. Bila kemudian ditambahkan dinamika actuator dengan konstanta waktu 5 milidetik, sistem menjadi kaku dan langkah harus turun ke 0,0005 detik atau solver diganti ke jenis implisit.",
    },
    pitfalls: [
      ["Menyimpulkan dari satu simulasi tanpa memeriksa langkah waktu", "Hasil yang salah karena langkah terlalu besar sering tetap terlihat wajar. Pengulangan pada setengah langkah adalah pemeriksaan termurah yang tersedia."],
      ["Menilai model dari data yang dipakai menyetelnya", "Kecocokan pada data identifikasi selalu membaik saat parameter ditambah. Hanya data uji yang belum pernah dilihat yang memberi penilaian jujur."],
      ["Menyamakan langkah solver dengan waktu cacah controller", "Plant berjalan kontinu, controller memperbarui berkala. Menyamakannya menyembunyikan pengaruh waktu cacah terhadap kestabilan."],
      ["Mengabaikan mode internal saat memakai fungsi transfer", "Dua sistem berfungsi transfer sama dapat berbeda keamanannya bila salah satunya menyimpan mode tidak stabil yang tidak teramati."],
      ["Membandingkan simulasi dan pengukuran pada titik kerja berbeda", "Selisihnya akan tampak seperti kesalahan model padahal hanya akibat linearisasi di titik yang berlainan."],
    ],
    checklist: [
      "Pertanyaan yang hendak dijawab simulasi dinyatakan lebih dulu",
      "Seluruh parameter, kondisi awal, dan asumsi tercatat",
      "Masukan uji dipilih sesuai sifat yang diperiksa",
      "Langkah waktu diverifikasi dengan pengulangan pada setengahnya",
      "Kekakuan sistem diperiksa sebelum memilih solver",
      "Model diuji pada data yang tidak dipakai menyetelnya",
      "Ketidakpastian model dinyatakan sebagai rentang, bukan diabaikan",
      "Rencana pengujian bertahap ke perangkat keras sudah disusun",
    ],
  },

  6: {
    deep: [
      {
        head: "Mengapa Controller Digital Berbeda dari Rancangan Kontinu",
        body: [
          "Controller yang berjalan di komputer tidak mengamati sinyal secara terus-menerus. Ia mencuplik keluaran pada selang tetap, menghitung, lalu menahan keluarannya sampai cuplikan berikutnya. Tiga kegiatan itu memasukkan sifat yang tidak ada pada rancangan kontinu, dan mengabaikannya adalah sumber kegagalan yang paling sering terjadi pada penerapan pertama.",
          "Penahanan orde nol membuat sinyal kendali berbentuk tangga. Terhadap plant, tangga tersebut setara dengan tundaan rata-rata sebesar setengah waktu cacah. Tundaan mengurangi margin fase, dan margin fase yang menipis berarti sistem lebih dekat ke ambang ketidakstabilan meskipun penguatannya tidak diubah sama sekali.",
          "Pemilihan waktu cacah karena itu bukan urusan kenyamanan perangkat, melainkan bagian dari perancangan kontrol. Aturan praktis yang lazim menuntut sekitar dua puluh sampai empat puluh cuplikan sepanjang waktu naik sistem tertutup. Terlalu jarang membuat sistem tidak stabil; terlalu rapat memboroskan sumber daya dan memperkuat derau pada aksi turunan.",
          "Selain waktu cacah, aritmetika terbatas ikut berperan. Bilangan pecahan terbatas menimbulkan pembulatan yang dapat menumpuk pada aksi integral, dan pada perangkat kecil dengan bilangan bulat berskala, pemilihan skala menentukan apakah controller masih berperilaku seperti rancangannya.",
        ],
        formula: "penahanan orde nol ~ tundaan T/2   |   20 sampai 40 cuplikan per waktu naik",
      },
      {
        head: "Diskretisasi: Menerjemahkan Rancangan ke Kode",
        body: [
          "Controller yang dirancang di domain kontinu harus diterjemahkan menjadi persamaan beda sebelum dapat dijalankan. Beberapa cara tersedia, dan pilihan di antaranya memengaruhi ketepatan serta kestabilan hasil terjemahan.",
          "Metode beda mundur sederhana dan selalu memetakan sistem stabil menjadi stabil, namun ketepatannya menurun pada frekuensi tinggi. Metode trapesium, yang juga dikenal sebagai transformasi bilinear, memberi ketepatan lebih baik dan tetap menjaga kestabilan, dengan konsekuensi terjadinya pergeseran frekuensi yang perlu dikoreksi bila titik frekuensi tertentu harus dipertahankan.",
          "Untuk aksi integral, terjemahan yang lazim menambahkan hasil kali error dengan waktu cacah pada akumulator. Untuk aksi turunan, terjemahan yang lazim membagi selisih dua cuplikan dengan waktu cacah, dan bentuk mentah ini hampir selalu tidak dapat dipakai langsung karena memperkuat derau secara berlebihan.",
          "Alternatif yang lebih baik adalah merancang langsung di domain diskret. Model plant diubah lebih dahulu menjadi bentuk diskret yang memperhitungkan penahanan orde nol, lalu controller dirancang atas model itu. Cara ini menghindari kekeliruan akibat terjemahan dan memperlihatkan pengaruh waktu cacah sejak awal perancangan.",
        ],
        formula: "integral: I += Ki*e*T   |   turunan: D = Kd*(e - e_lalu)/T, wajib ditapis",
      },
      {
        head: "Anti-Windup dan Perpindahan Mode",
        body: [
          "Ketika actuator mencapai batasnya, keluaran controller tidak lagi berpengaruh pada plant. Aksi integral yang tetap menumpuk selama keadaan itu akan membesar tanpa guna, dan ketika error akhirnya berbalik tanda, akumulator yang telanjur besar harus dikosongkan lebih dahulu sebelum keluaran turun. Akibatnya keluaran melewati setpoint jauh dan lama.",
          "Penanggulangan paling sederhana adalah menghentikan penumpukan ketika keluaran sedang mentok dan error masih mendorong ke arah yang sama. Cara yang lebih halus mengumpanbalikkan selisih antara keluaran yang diminta dan keluaran yang benar-benar terjadi ke akumulator, sehingga akumulator menyesuaikan diri secara mulus alih-alih dibekukan.",
          "Persoalan serupa muncul pada perpindahan antara mode manual dan otomatis. Bila akumulator tidak disiapkan, perpindahan ke otomatis menimbulkan lompatan keluaran yang mengejutkan. Perpindahan tanpa lompatan dicapai dengan menyiapkan akumulator agar keluaran controller pada saat perpindahan sama persis dengan keluaran manual terakhir.",
          "Struktur pengaman ini bukan tambahan opsional. Pada sistem nyata, actuator mentok adalah kejadian biasa, bukan pengecualian, dan perpindahan mode terjadi setiap kali operator mengambil alih. Controller yang tidak menanganinya akan berperilaku baik di simulasi dan mengecewakan di lapangan.",
        ],
        formula: "anti-windup: I += Ki*e*T hanya bila tidak mentok, atau I += Kt*(u_nyata - u_minta)",
      },
      {
        head: "Waktu Nyata, Penjadwalan, dan Keandalan",
        body: [
          "Controller digital harus menyelesaikan perhitungannya sebelum cuplikan berikutnya tiba. Yang menentukan bukan waktu hitung rata-rata melainkan waktu hitung terburuk, karena satu keterlambatan saja dapat menggeser perilaku sistem. Karena itu tugas kontrol biasanya diberi prioritas tertinggi dan dijauhkan dari kegiatan yang waktunya tidak dapat diperkirakan.",
          "Ketidakteraturan selang cuplikan sama merusaknya dengan tundaan. Selang yang berubah-ubah membuat aksi integral dan turunan salah menghitung, karena keduanya bergantung langsung pada waktu cacah. Bila selang tidak dapat dijamin tetap, waktu sesungguhnya harus diukur dan dipakai pada perhitungan alih-alih memakai nilai nominal.",
          "Keandalan menuntut penanganan kejadian tidak normal secara eksplisit: sensor yang tidak memberi data, nilai di luar rentang wajar, dan komunikasi terputus. Controller harus memiliki perilaku yang ditetapkan untuk setiap keadaan tersebut, umumnya berupa penahanan keluaran terakhir yang aman disertai pemberitahuan, bukan melanjutkan perhitungan atas data yang tidak sahih.",
          "Watchdog melengkapi pengaman dengan memaksa sistem ke keadaan aman bila putaran kendali berhenti berjalan. Perangkat ini bekerja di luar jalur perhitungan utama, tepat karena kegagalan jalur utama itulah yang harus diantisipasi.",
        ],
        formula: "waktu hitung terburuk < T   |   jitter kecil, atau ukur dt sesungguhnya",
      },
      {
        head: "Verifikasi Kode Kontrol Sebelum Menyentuh Mesin",
        body: [
          "Kode kontrol perlu diuji dengan cara yang sama ketatnya dengan perangkat lunak lain. Fungsi perhitungan controller sebaiknya dipisahkan dari kode yang berurusan dengan perangkat, sehingga dapat diuji sendiri dengan masukan yang ditentukan dan keluaran yang dapat diperiksa.",
          "Pengujian yang paling berharga justru pada keadaan tepi: error nol, error sangat besar, keluaran mentok di kedua arah, waktu cacah berubah, dan perpindahan mode. Keadaan inilah yang jarang muncul di simulasi normal namun sering muncul di lapangan.",
          "Menjalankan kode controller yang sesungguhnya terhadap model plant memberi keyakinan yang jauh lebih besar daripada menjalankan model controller. Cara ini menangkap kekeliruan penerjemahan, kesalahan satuan, dan masalah pembulatan yang tidak akan pernah muncul bila controller ikut disimulasikan sebagai rumus.",
          "Setiap parameter yang dapat diubah operator perlu dibatasi rentangnya di dalam kode. Batas itu melindungi sistem dari nilai yang keliru dimasukkan, dan biayanya hanya beberapa baris dibandingkan kerusakan yang mungkin ditimbulkan.",
        ],
        formula: "pisahkan hitung dari perangkat keras   |   uji keadaan tepi, bukan hanya keadaan normal",
      },
    ],
    derivation: {
      head: "Menurunkan Bentuk Diskret PID untuk Diprogram",
      intro: "Penurunan berikut mengubah PID kontinu menjadi persamaan beda yang langsung dapat ditulis menjadi kode.",
      steps: [
        ["PID kontinu", "u(t) = Kp*e + Ki*integral(e dt) + Kd*de/dt", "Tiga aksi bekerja atas error yang sama."],
        ["Dekati integral", "integral(e dt) ~ sum(e_k * T)", "Luas di bawah kurva didekati sebagai jumlah persegi selebar T."],
        ["Dekati turunan", "de/dt ~ (e_k - e_(k-1))/T", "Selisih dua cuplikan berurutan dibagi selang waktunya."],
        ["Bentuk posisi", "u_k = Kp*e_k + Ki*T*sum(e) + Kd*(e_k - e_(k-1))/T", "Menghitung keluaran secara mutlak; memerlukan penanganan windup tersendiri."],
        ["Bentuk kenaikan", "du = Kp*(e_k - e_(k-1)) + Ki*T*e_k + Kd*(e_k - 2*e_(k-1) + e_(k-2))/T", "Diperoleh dengan mengurangkan u_(k-1) dari u_k."],
        ["Keluaran akhir", "u_k = u_(k-1) + du", "Bentuk kenaikan menangani windup secara alami karena pembatasan pada u_k langsung menghentikan penumpukan."],
      ],
      closing: "Bentuk kenaikan lebih disukai pada penerapan industri karena perpindahan mode menjadi mulus dengan sendirinya dan pembatasan keluaran sekaligus berperan sebagai anti-windup. Aksi turunan pada kedua bentuk tetap memerlukan penapis agar derau sensor tidak diperkuat.",
    },
    worked: {
      head: "Contoh Terhitung: Memilih Waktu Cacah",
      given: [
        "Sistem tertutup dirancang memiliki waktu naik sekitar 0,4 detik",
        "Sensor menghasilkan derau yang cukup berarti pada frekuensi tinggi",
      ],
      steps: [
        ["Terapkan aturan cuplikan", "T = t_r/30 = 0,4/30", "Diambil tiga puluh cuplikan sepanjang waktu naik, di tengah rentang anjuran."],
        ["Hitung waktu cacah", "T = 0,0133 s", "Dibulatkan ke nilai yang mudah dijadwalkan, yaitu 0,01 detik atau 100 hertz."],
        ["Perkirakan tundaan tambahan", "T/2 = 0,005 s", "Penahanan orde nol setara tundaan setengah waktu cacah."],
        ["Ubah menjadi susut fase", "fase = wc * T/2, dengan wc ~ 2/t_r = 5 rad/s", "Diperoleh 0,025 radian atau sekitar 1,4 derajat."],
        ["Nilai dampaknya", "margin fase berkurang sekitar 1,4 derajat", "Masih kecil terhadap margin fase rancangan yang umumnya 45 sampai 60 derajat."],
      ],
      answer: "Waktu cacah 0,01 detik memadai: cukup rapat sehingga susut fase akibat penahanan hanya sekitar 1,4 derajat, dan tidak terlalu rapat sehingga aksi turunan tidak memperkuat derau secara berlebihan. Penapis turunan dengan frekuensi potong sekitar sepuluh kali bandwidth tertutup dapat ditambahkan tanpa mengganggu kinerja.",
    },
    pitfalls: [
      ["Memakai penguatan rancangan kontinu tanpa memeriksa waktu cacah", "Tundaan akibat penahanan mengurangi margin fase. Sistem yang stabil di atas kertas dapat berosilasi saat diprogram."],
      ["Menerapkan aksi turunan tanpa penapis", "Selisih dua cuplikan memperkuat derau sensor. Actuator akan bergetar terus-menerus dan cepat aus."],
      ["Melupakan anti-windup", "Actuator mentok adalah kejadian biasa. Tanpa penanganan, keluaran melewati setpoint jauh melebihi perkiraan simulasi."],
      ["Membiarkan selang cuplikan tidak teratur", "Aksi integral dan turunan bergantung langsung pada T. Selang yang berubah membuat keduanya salah hitung."],
      ["Menguji hanya keadaan normal", "Kekeliruan paling mahal muncul pada keadaan tepi: error besar, keluaran mentok, dan perpindahan mode."],
    ],
    checklist: [
      "Waktu cacah dipilih dari waktu naik target, bukan dari kemudahan perangkat",
      "Susut fase akibat penahanan orde nol diperhitungkan",
      "Aksi turunan dilengkapi penapis dan pembatasan penguatan",
      "Anti-windup diterapkan dan diuji pada keadaan mentok",
      "Perpindahan manual ke otomatis diuji bebas lompatan",
      "Waktu hitung terburuk diukur dan lebih kecil daripada waktu cacah",
      "Perilaku saat sensor gagal atau data tidak sahih ditetapkan eksplisit",
      "Kode controller yang sesungguhnya diuji terhadap model plant",
    ],
  },

  7: {
    deep: [
      {
        head: "Membaca Grafik Sebagai Bukti, Bukan Hiasan",
        body: [
          "Grafik respons adalah bukti utama yang dipakai untuk menyatakan sebuah sistem memenuhi atau tidak memenuhi spesifikasi. Karena itu membacanya perlu dilakukan secara terstruktur, bukan dengan kesan sekilas. Urutan yang membantu adalah memeriksa nilai akhir, lalu kecepatan menuju nilai itu, lalu perilaku di sekitar nilai itu, dan terakhir sinyal kendali yang menghasilkannya.",
          "Nilai akhir menjawab apakah sistem menuju sasaran. Selisih yang tersisa terhadap setpoint adalah error tunak, dan keberadaannya menunjukkan sesuatu tentang struktur controller, bukan tentang penyetelan. Error tunak yang tetap ada terhadap masukan step menandakan tidak adanya aksi integral pada loop.",
          "Kecepatan dibaca dari waktu naik dan waktu menetap. Keduanya berbeda dan sering tertukar: waktu naik mengukur seberapa cepat sistem menempuh sebagian besar perubahan, sedangkan waktu menetap mengukur kapan sistem berhenti bergerak berarti di dalam pita toleransi. Sistem dapat naik cepat namun lama menetap bila osilasinya berkepanjangan.",
          "Sinyal kendali sering tidak ditampilkan padahal ia menentukan apakah hasil tersebut dapat diwujudkan. Respons keluaran yang tampak sangat baik namun menuntut sinyal kendali di luar kemampuan actuator adalah hasil yang menyesatkan. Grafik respons tanpa grafik sinyal kendali adalah bukti yang belum lengkap.",
        ],
        formula: "urutan baca: nilai akhir -> kecepatan -> osilasi -> sinyal kendali",
      },
      {
        head: "Menyimpulkan Parameter Sistem dari Bentuk Kurva",
        body: [
          "Bentuk kurva memuat informasi kuantitatif yang dapat ditarik tanpa mengetahui model sistemnya lebih dahulu. Respons step yang naik mulus tanpa melewati nilai akhir menunjukkan sistem teredam lebih atau berorde satu. Respons yang melewati nilai akhir lalu berayun menunjukkan sepasang pole kompleks dengan rasio redaman di antara nol dan satu.",
          "Besar overshoot langsung memberi rasio redaman melalui hubungan baku, dan jarak antarpuncak memberi frekuensi teredam. Dari kedua besaran itu frekuensi alami dapat dihitung, sehingga sepasang pole dominan sistem dapat diperkirakan hanya dari satu grafik respons step.",
          "Untuk sistem yang naik mulus, gain statik diperoleh dari perbandingan perubahan keluaran terhadap perubahan masukan, dan konstanta waktu dari waktu mencapai 63,2 persen perubahan akhir. Bila keluaran tidak segera bergerak setelah masukan berubah, jeda tersebut adalah dead time yang harus dicatat terpisah karena pengaruhnya terhadap kestabilan sangat besar.",
          "Perkiraan semacam ini sengaja bersifat kasar dan justru berguna karena kekasarannya. Ia memberi angka awal yang masuk akal untuk memulai penyetelan, dan lebih penting lagi memberi dasar untuk menilai apakah hasil identifikasi yang lebih rumit masuk akal atau tidak.",
        ],
        formula: "z dari M_p   |   wd = 2*pi/periode   |   wn = wd/sqrt(1-z^2)",
      },
      {
        head: "Membedakan Sumber Masalah dari Pola Respons",
        body: [
          "Pola respons yang bermasalah memiliki tanda khas yang menunjuk ke penyebab berbeda, dan mengenalinya menghemat banyak waktu penelusuran. Osilasi yang amplitudonya tetap menunjukkan sistem berada tepat di ambang kestabilan, umumnya karena penguatan terlalu besar atau tundaan lebih besar daripada yang diperkirakan.",
          "Osilasi yang membesar menunjukkan ketidakstabilan yang sesungguhnya dan menuntut penurunan penguatan segera. Sebaliknya, respons yang sangat lambat dan tidak pernah mencapai setpoint menunjukkan penguatan terlalu kecil atau adanya pembatasan pada actuator yang belum disadari.",
          "Keluaran yang bergerak berlawanan arah pada saat awal sebelum akhirnya menuju setpoint menandakan zero fase non-minimum. Gejala ini tidak dapat dihilangkan dengan penyetelan dan membatasi seberapa agresif sistem boleh dikendalikan; memaksakan penguatan besar justru mempercepat hilangnya kestabilan.",
          "Keluaran yang tampak bergetar rapat dengan amplitudo kecil biasanya bukan masalah kestabilan melainkan derau pengukuran yang diperkuat aksi turunan. Membedakan keduanya penting karena penanganannya berlawanan: yang pertama menuntut penurunan penguatan, yang kedua menuntut penapisan.",
        ],
        formula: "amplitudo tetap: ambang stabil | membesar: tidak stabil | awal berlawanan: zero kanan",
      },
      {
        head: "Respons Terhadap Gangguan dan Terhadap Setpoint",
        body: [
          "Dua jenis pengujian menjawab pertanyaan berbeda dan tidak dapat saling menggantikan. Perubahan setpoint menguji kemampuan mengikuti perintah, sedangkan gangguan menguji kemampuan menolak pengaruh luar. Sistem dapat sangat baik pada satu hal dan buruk pada hal lain.",
          "Perbedaan itu berakar pada struktur. Fungsi transfer dari setpoint ke keluaran berbeda dari fungsi transfer gangguan ke keluaran, meskipun keduanya memiliki penyebut yang sama. Karena pembilangnya berbeda, bentuk responsnya pun berbeda, dan penyetelan yang mengoptimalkan salah satunya belum tentu memperbaiki yang lain.",
          "Pada penerapan proses, penolakan gangguan biasanya lebih penting karena setpoint jarang berubah sedangkan gangguan datang terus-menerus. Pada penerapan gerak seperti robot dan mesin perkakas, pengikutan lintasan biasanya lebih penting. Menentukan mana yang diutamakan adalah keputusan yang harus diambil sebelum penyetelan dimulai.",
          "Struktur dua derajat kebebasan memungkinkan keduanya disetel terpisah. Jalur umpan balik disetel untuk penolakan gangguan dan kestabilan, sementara jalur setpoint diberi penapis atau bobot tersendiri untuk membentuk respons pengikutan tanpa mengubah sifat loop.",
        ],
        formula: "T_r = G*C/(1+G*C*H)   |   T_d = G/(1+G*C*H)   |   penyebut sama, pembilang berbeda",
      },
      {
        head: "Menyusun Laporan Respons yang Dapat Diverifikasi",
        body: [
          "Laporan yang baik memungkinkan orang lain menilai kesimpulan tanpa harus mempercayai penulisnya. Itu berarti setiap grafik disertai keterangan kondisi pengambilan: nilai setpoint, besar gangguan yang diberikan, parameter controller yang berlaku, dan kondisi operasi plant.",
          "Sumbu harus berlabel lengkap dengan satuan, dan skala dipilih agar tidak menyesatkan. Skala yang terlalu lebar menyembunyikan osilasi kecil yang berarti; skala yang terlalu sempit membesar-besarkan derau yang sebenarnya tidak penting. Menampilkan pita toleransi sebagai garis bantu memudahkan pembacaan waktu menetap.",
          "Angka hasil pembacaan sebaiknya dicantumkan di samping grafik, bukan dibiarkan dibaca sendiri oleh pembaca. Overshoot dalam persen, waktu naik dan waktu menetap dalam detik, dan error tunak dalam satuan besaran yang dikendalikan. Angka tersebut kemudian dibandingkan langsung dengan spesifikasi yang disepakati di awal.",
          "Kesimpulan harus dinyatakan sebagai pemenuhan atau ketidakpemenuhan terhadap spesifikasi, disertai alasan bila tidak terpenuhi. Kalimat seperti responsnya sudah bagus tidak memiliki nilai teknis; kalimat seperti overshoot 8 persen memenuhi batas 10 persen sedangkan waktu menetap 3,2 detik melampaui batas 2 detik memiliki nilai teknis.",
        ],
        formula: "grafik + kondisi + angka terbaca + perbandingan spesifikasi = bukti lengkap",
      },
    ],
    derivation: {
      head: "Menurunkan Rasio Redaman dari Overshoot Terukur",
      intro: "Penurunan berikut menunjukkan cara memperoleh parameter sistem langsung dari grafik respons step, tanpa mengetahui model sebelumnya.",
      steps: [
        ["Respons step orde dua", "y(t) = 1 - exp(-z*wn*t)*(cos(wd*t) + (z/sqrt(1-z^2))*sin(wd*t))", "Bentuk baku dengan wd = wn*sqrt(1-z^2)."],
        ["Cari puncak pertama", "dy/dt = 0 pada t_p = pi/wd", "Turunan bernilai nol pertama kali setelah t = 0 pada setengah periode teredam."],
        ["Nilai pada puncak", "y(t_p) = 1 + exp(-z*pi/sqrt(1-z^2))", "Substitusi t_p ke persamaan respons."],
        ["Definisi overshoot", "M_p = exp(-z*pi/sqrt(1-z^2))", "Selisih puncak terhadap nilai akhir, dinyatakan relatif."],
        ["Balik hubungannya", "z = -ln(M_p)/sqrt(pi^2 + ln(M_p)^2)", "Overshoot terukur langsung memberi rasio redaman."],
        ["Lengkapi dengan periode", "wd = 2*pi/T_osilasi,  wn = wd/sqrt(1-z^2)", "Jarak antarpuncak pada grafik memberi frekuensi teredam."],
      ],
      closing: "Dengan dua besaran yang terbaca langsung dari grafik, yaitu overshoot dan jarak antarpuncak, sepasang pole dominan sistem dapat diperkirakan tanpa satu pun percobaan tambahan. Perkiraan ini menjadi titik awal yang jauh lebih baik daripada menebak.",
    },
    worked: {
      head: "Contoh Terhitung: Membaca Parameter dari Grafik Respons",
      given: [
        "Respons step satuan mencapai puncak 1,25 pada detik ke-0,60",
        "Puncak kedua terjadi pada detik ke-1,80",
        "Nilai akhir keluaran adalah 1,00",
      ],
      steps: [
        ["Hitung overshoot", "M_p = (1,25 - 1,00)/1,00 = 0,25", "Overshoot 25 persen terhadap nilai akhir."],
        ["Hitung rasio redaman", "z = -ln(0,25)/sqrt(pi^2 + ln(0,25)^2)", "ln(0,25) = -1,3863 sehingga z = 1,3863/sqrt(9,8696+1,9218) = 1,3863/3,4340 = 0,404"],
        ["Baca periode osilasi", "T_osilasi = 1,80 - 0,60 = 1,20 s", "Jarak antara dua puncak berurutan."],
        ["Hitung frekuensi teredam", "wd = 2*pi/1,20 = 5,236 rad/s", "Frekuensi osilasi yang teramati."],
        ["Hitung frekuensi alami", "wn = 5,236/sqrt(1-0,404^2) = 5,236/0,9148 = 5,724 rad/s", "Mengembalikan wd ke frekuensi tanpa redaman."],
        ["Perkirakan waktu menetap", "t_s ~ 4/(z*wn) = 4/(0,404*5,724) = 1,73 s", "Kriteria pita dua persen."],
      ],
      answer: "Sistem memiliki pole dominan di s = -2,31 plus minus j5,24 dengan rasio redaman 0,404. Overshoot 25 persen tergolong besar untuk sebagian besar penerapan; menurunkannya ke 10 persen menuntut rasio redaman naik ke 0,591, yang dapat dicapai dengan menurunkan penguatan atau menambahkan aksi turunan.",
    },
    pitfalls: [
      ["Menilai respons tanpa melihat sinyal kendali", "Respons yang tampak sempurna bisa saja menuntut aksi kontrol di luar kemampuan actuator, sehingga tidak akan pernah terwujud."],
      ["Menukar waktu naik dengan waktu menetap", "Keduanya mengukur hal berbeda. Sistem dapat naik cepat namun lama menetap bila osilasinya berkepanjangan."],
      ["Mengira semua getaran adalah ketidakstabilan", "Getaran rapat beramplitudo kecil biasanya derau yang diperkuat aksi turunan; penanganannya penapisan, bukan penurunan penguatan."],
      ["Menguji hanya perubahan setpoint", "Penolakan gangguan memiliki fungsi transfer yang berbeda. Sistem yang baik mengikuti perintah bisa buruk menolak gangguan."],
      ["Memilih skala sumbu yang menyesatkan", "Skala terlalu lebar menyembunyikan osilasi berarti, terlalu sempit membesar-besarkan derau yang tidak penting."],
    ],
    checklist: [
      "Nilai akhir dan error tunak dibaca lebih dahulu",
      "Waktu naik dan waktu menetap dibedakan dan dicatat terpisah",
      "Overshoot dihitung terhadap nilai akhir, bukan terhadap setpoint bila keduanya berbeda",
      "Sinyal kendali ditampilkan bersama respons keluaran",
      "Pengujian mencakup perubahan setpoint dan pemberian gangguan",
      "Sumbu berlabel lengkap dengan satuan dan pita toleransi ditampilkan",
      "Angka hasil pembacaan dibandingkan langsung dengan spesifikasi",
      "Kesimpulan dinyatakan sebagai terpenuhi atau tidak, disertai alasan",
    ],
  },

  8: {
    deep: [
      {
        head: "Empat Besaran yang Merangkum Seluruh Respons",
        body: [
          "Respons sistem umpan balik terhadap perubahan setpoint dapat dirangkum oleh empat besaran yang saling melengkapi. Waktu naik menyatakan seberapa cepat keluaran menempuh sebagian besar perubahan, umumnya dari sepuluh sampai sembilan puluh persen. Waktu puncak menyatakan kapan keluaran mencapai nilai tertingginya. Overshoot menyatakan seberapa jauh keluaran melewati nilai akhirnya. Waktu menetap menyatakan kapan keluaran berhenti bergerak berarti di dalam pita toleransi.",
          "Keempatnya bukan besaran bebas. Pada model orde dua baku, seluruhnya ditentukan hanya oleh dua parameter, yaitu rasio redaman dan frekuensi alami. Karena itu menuntut perbaikan pada satu besaran selalu berarti perubahan pada yang lain, dan hubungan itu dapat dihitung sebelum satu percobaan pun dilakukan.",
          "Rasio redaman menentukan bentuk respons. Nilai nol memberi osilasi yang tidak pernah mereda. Nilai di antara nol dan satu memberi osilasi teredam dengan overshoot. Nilai satu memberi respons tercepat yang masih tanpa overshoot, disebut teredam kritis. Nilai lebih dari satu memberi respons tanpa osilasi namun lebih lambat, disebut teredam lebih.",
          "Frekuensi alami menentukan skala waktu. Menaikkannya mempercepat seluruh peristiwa secara proporsional tanpa mengubah bentuk responsnya sama sekali. Inilah sebabnya perancangan sering dipisah menjadi dua langkah: menetapkan rasio redaman dari batas overshoot, lalu menetapkan frekuensi alami dari tuntutan kecepatan.",
        ],
        formula: "T(s) = wn^2/(s^2 + 2*z*wn*s + wn^2)   |   z mengatur bentuk, wn mengatur kecepatan",
      },
      {
        head: "Tipe Sistem dan Error Tunak",
        body: [
          "Error tunak tidak ditentukan oleh penyetelan melainkan oleh struktur. Yang menentukan adalah jumlah integrator pada lintasan terbuka, yang disebut tipe sistem. Sistem tipe nol tidak memiliki integrator, tipe satu memiliki satu, dan seterusnya.",
          "Sistem tipe nol menyisakan error tetap terhadap masukan step, dan errornya mengecil bila gain dinaikkan namun tidak pernah menjadi nol. Terhadap masukan ramp, sistem tipe nol bahkan gagal total karena errornya membesar tanpa batas. Sistem tipe satu menghapus error terhadap step sepenuhnya dan menyisakan error tetap terhadap ramp.",
          "Kesimpulan praktisnya tegas. Bila spesifikasi menuntut error nol terhadap perubahan setpoint yang bersifat step, controller wajib memuat aksi integral; tidak ada nilai penguatan proporsional yang dapat menggantikannya. Sebaliknya, bila sistem harus mengikuti target yang bergerak dengan laju tetap, satu integrator saja tidak cukup untuk menghapus error.",
          "Konstanta error memberi cara ringkas menghitungnya. Konstanta posisi diperoleh dari limit gain lintasan terbuka saat s menuju nol, dan error terhadap step sama dengan satu dibagi satu ditambah konstanta itu. Konstanta kecepatan diperoleh dari limit s dikali gain lintasan terbuka, dan error terhadap ramp sama dengan kebalikannya.",
        ],
        formula: "tipe 0: e_step = 1/(1+Kp)   |   tipe 1: e_step = 0, e_ramp = 1/Kv",
      },
      {
        head: "Menolak Gangguan Berbeda dari Mengikuti Setpoint",
        body: [
          "Sistem umpan balik menghadapi dua tuntutan yang tidak sama. Yang pertama adalah mengikuti perintah, yang kedua adalah menolak pengaruh luar. Keduanya memiliki fungsi transfer berbeda meskipun penyebutnya sama, sehingga bentuk responsnya pun berbeda.",
          "Perbedaan itu berakar pada letak masuknya sinyal. Setpoint masuk di depan controller sehingga dilewatkan seluruh lintasan maju. Gangguan beban umumnya masuk di sisi masukan plant sehingga hanya dilewatkan plant, tidak melewati controller. Akibatnya pembilang kedua fungsi transfer berbeda.",
          "Konsekuensinya nyata di lapangan. Penyetelan yang memberi pengikutan setpoint mulus dapat memberi penolakan gangguan yang lambat, dan sebaliknya. Karena itu pengujian harus mencakup keduanya: satu percobaan mengubah setpoint, satu percobaan lagi memberi gangguan buatan pada beban.",
          "Struktur dua derajat kebebasan memungkinkan keduanya disetel terpisah. Jalur umpan balik disetel untuk penolakan gangguan dan kestabilan, sementara jalur setpoint diberi penapis atau pembobotan tersendiri untuk membentuk respons pengikutan tanpa mengubah sifat loop.",
        ],
        formula: "T_r = GC/(1+GCH)   |   T_d = G/(1+GCH)   |   penyebut sama, pembilang berbeda",
      },
      {
        head: "Margin Kestabilan sebagai Ukuran Jarak Aman",
        body: [
          "Menyatakan sistem stabil saja tidak memadai. Yang perlu diketahui adalah seberapa jauh sistem dari batas ketidakstabilan, karena parameter plant selalu berubah akibat keausan, suhu, dan beban. Ukuran jarak itu disebut margin.",
          "Margin penguatan menyatakan berapa kali penguatan boleh dinaikkan sebelum sistem kehilangan kestabilan, diukur pada frekuensi saat fase mencapai seratus delapan puluh derajat. Margin fase menyatakan berapa banyak tambahan susut fase yang masih dapat ditoleransi, diukur pada frekuensi saat besar gain sama dengan satu.",
          "Nilai yang lazim dituntut pada penerapan industri adalah margin fase empat puluh lima sampai enam puluh derajat dan margin penguatan sekitar dua kali. Margin fase juga berhubungan erat dengan rasio redaman: aturan kasar yang sering dipakai menyatakan rasio redaman kira-kira sama dengan margin fase dalam derajat dibagi seratus.",
          "Dead time adalah pemakan margin fase yang paling sering diabaikan. Susut fase yang ditimbulkannya membesar sebanding dengan frekuensi, sehingga sistem yang tampak aman pada frekuensi rendah dapat kehabisan margin begitu penguatan dinaikkan dan frekuensi kerja bergeser ke atas.",
        ],
        formula: "z kira-kira PM/100   |   fase dead time = -w*L, membesar terhadap frekuensi",
      },
      {
        head: "Membaca Umpan Balik sebagai Pertukaran, Bukan Perbaikan Gratis",
        body: [
          "Umpan balik memberi banyak hal sekaligus: error yang mengecil, respons yang lebih cepat, dan kepekaan terhadap perubahan plant yang menurun. Semuanya membaik seiring naiknya gain loop, sehingga menaikkan penguatan tampak seperti perbaikan tanpa biaya.",
          "Biayanya muncul di tempat lain. Gain yang tinggi memperbesar aksi kontrol sehingga actuator lebih cepat jenuh. Ia juga memperkuat derau sensor, karena derau dilewatkan lintasan yang sama dengan sinyal. Dan ia mendekatkan sistem ke batas kestabilan karena margin fase menipis.",
          "Terdapat pula batasan yang bersifat mendasar, bukan sekadar praktis. Penekanan sensitivitas pada satu rentang frekuensi harus dibayar dengan penguatan pada rentang frekuensi lain; sensitivitas tidak dapat ditekan di semua frekuensi sekaligus. Kesadaran ini mengubah cara merancang: yang dikejar bukan gain setinggi mungkin, melainkan penempatan penekanan pada rentang tempat gangguan sesungguhnya berada.",
          "Karena itu perancangan yang matang selalu menyebutkan di mana batasnya. Sampai berapa gain boleh naik sebelum actuator jenuh pada perubahan setpoint terbesar yang diperkirakan, dan sampai berapa sebelum derau sensor membuat actuator bergetar terus-menerus. Kedua angka itu, bukan selera, yang menentukan penyetelan akhir.",
        ],
        formula: "S + T = 1 selalu   |   menekan S pada satu rentang berarti membesarkan di rentang lain",
      },
    ],
    derivation: {
      head: "Menurunkan Error Tunak dari Tipe Sistem",
      intro: "Penurunan berikut menunjukkan mengapa aksi integral, bukan besar penguatan, yang menentukan apakah error terhadap step dapat dihapus.",
      steps: [
        ["Error dalam domain-s", "E(s) = R(s)/(1 + L(s))", "L adalah gain lintasan terbuka, yaitu hasil kali controller, plant, dan sensor."],
        ["Masukan step satuan", "R(s) = 1/s", "Transformasi step bertinggi satu."],
        ["Terapkan teorema nilai akhir", "e_ss = lim s->0 s*E(s) = lim s->0 1/(1 + L(s))", "Suku s saling menghapus dengan penyebut R(s)."],
        ["Kasus tipe nol", "L(0) = Kp berhingga  =>  e_ss = 1/(1+Kp)", "Error mengecil saat Kp naik namun tidak pernah nol."],
        ["Kasus tipe satu", "L(s) = K/s * G'(s)  =>  L(0) tak hingga", "Integrator membuat gain lintasan terbuka membesar tanpa batas saat s menuju nol."],
        ["Hasil tipe satu", "e_ss = 1/(1 + tak hingga) = 0", "Error terhadap step terhapus sepenuhnya, berapa pun nilai K."],
      ],
      closing: "Kesimpulannya bersifat struktural: yang menghapus error terhadap step adalah keberadaan integrator, bukan besarnya penguatan. Menaikkan Kp pada sistem tipe nol hanya mengecilkan error sambil memperbesar risiko kejenuhan dan penurunan margin.",
    },
    worked: {
      head: "Contoh Terhitung: Membandingkan Dua Struktur Controller",
      given: [
        "Plant G(s) = 4/(s + 2) dengan umpan balik satuan",
        "Rancangan A memakai controller proporsional Kp = 6",
        "Rancangan B memakai controller integral murni Ki/s dengan Ki = 6",
      ],
      steps: [
        ["Gain lintasan terbuka A", "L_A(s) = 24/(s+2), L_A(0) = 12", "Sistem tipe nol karena tidak ada integrator."],
        ["Error tunak A", "e_ss = 1/(1+12) = 0,0769", "Menyisakan 7,69 persen terhadap step satuan."],
        ["Pole tertutup A", "s + 2 + 24 = 0  =>  s = -26", "Sangat cepat, konstanta waktu 1/26 detik."],
        ["Gain lintasan terbuka B", "L_B(s) = 24/(s*(s+2))", "Sistem tipe satu karena memuat satu integrator."],
        ["Error tunak B", "e_ss = 0", "Integrator menghapus error terhadap step sepenuhnya."],
        ["Pole tertutup B", "s^2 + 2s + 24 = 0  =>  s = -1 +/- j4,796", "Muncul osilasi yang tidak ada pada rancangan A."],
        ["Rasio redaman B", "z = 2/(2*sqrt(24)) = 0,204", "Overshoot sekitar 51 persen — sangat besar."],
      ],
      answer: "Rancangan A cepat dan tanpa osilasi namun menyisakan error 7,69 persen. Rancangan B menghapus error sepenuhnya namun berosilasi hebat dan jauh lebih lambat. Keduanya menunjukkan bahwa integral tidak gratis: ia menambah satu pole di titik asal yang menggeser pole tertutup ke arah yang kurang teredam. Inilah alasan aksi integral hampir selalu dipadukan dengan proporsional dan turunan, bukan dipakai sendiri.",
    },
    pitfalls: [
      ["Mengira error tunak dapat dihapus dengan menaikkan penguatan", "Pada sistem tipe nol, error hanya mengecil dan tidak pernah nol. Yang menghapusnya adalah aksi integral, dan itu keputusan struktur bukan penyetelan."],
      ["Menguji hanya perubahan setpoint", "Penolakan gangguan memiliki pembilang berbeda. Sistem yang mulus mengikuti perintah bisa lambat menolak gangguan beban."],
      ["Menyatakan sistem stabil tanpa menyebut marginnya", "Parameter plant selalu berubah. Tanpa margin, tidak ada jaminan sistem tetap stabil setelah beberapa bulan beroperasi."],
      ["Melupakan bahwa dead time memakan margin fase", "Susut fasenya membesar terhadap frekuensi, sehingga menaikkan penguatan justru mempercepat habisnya margin."],
      ["Mengejar gain setinggi mungkin", "Error dan kecepatan memang membaik, tetapi actuator lebih cepat jenuh, derau sensor menguat, dan jarak ke batas kestabilan menyempit."],
    ],
    checklist: [
      "Rasio redaman ditetapkan dari batas overshoot sebelum kecepatan diatur",
      "Tipe sistem diperiksa untuk menentukan apakah aksi integral diperlukan",
      "Konstanta error dihitung dan dibandingkan dengan spesifikasi",
      "Pengujian mencakup perubahan setpoint dan pemberian gangguan",
      "Margin fase dan margin penguatan dihitung, bukan hanya kestabilannya",
      "Dead time diperhitungkan sebagai pemakan margin fase",
      "Batas penguatan ditetapkan dari kejenuhan actuator dan penguatan derau",
    ],
  },

  9: {
    deep: [
      {
        head: "Tiga Aksi, Tiga Pertanyaan Berbeda",
        body: [
          "Controller PID menjumlahkan tiga aksi yang bekerja atas error yang sama namun menjawab pertanyaan berbeda. Aksi proporsional menjawab seberapa besar error saat ini. Aksi integral menjawab seberapa lama error itu bertahan. Aksi turunan menjawab ke arah mana error sedang bergerak.",
          "Aksi proporsional memberi respons segera yang sebanding dengan error. Menaikkannya mempercepat sistem dan mengecilkan error tunak, namun memperbesar overshoot dan mendekatkan sistem ke batas kestabilan. Aksi ini sendirian tidak dapat menghapus error tunak pada plant tanpa integrator.",
          "Aksi integral mengakumulasi error terhadap waktu, sehingga selama masih ada error sekecil apa pun, keluarannya terus bertambah. Sifat inilah yang menghapus error tunak. Harganya adalah tambahan satu pole di titik asal yang menurunkan redaman dan memperlambat sistem, ditambah risiko penumpukan saat actuator jenuh.",
          "Aksi turunan bereaksi terhadap laju perubahan error, sehingga ia mulai menahan sebelum keluaran melewati setpoint. Aksi ini menambah redaman dan memungkinkan penguatan proporsional yang lebih besar dipakai dengan aman. Kelemahannya ia memperkuat derau, sehingga hampir selalu memerlukan penapis.",
        ],
        formula: "u = Kp*e + Ki*integral(e) + Kd*de/dt   |   sekarang, masa lalu, dan arah",
      },
      {
        head: "Bentuk Baku dan Arti Fisik Parameternya",
        body: [
          "Selain bentuk penjumlahan tiga gain, PID sering dinyatakan dalam bentuk baku yang memakai waktu integral dan waktu turunan. Bentuk ini lebih disukai di dunia proses karena kedua parameternya bersatuan waktu sehingga dapat dibandingkan langsung dengan dinamika plant.",
          "Waktu integral menyatakan berapa lama aksi integral memerlukan waktu untuk menyumbang sebesar sumbangan aksi proporsional pada error tetap. Nilai yang kecil berarti aksi integral agresif. Aturan kasar yang lazim menetapkannya sebanding dengan konstanta waktu dominan plant.",
          "Waktu turunan menyatakan seberapa jauh ke depan controller memperkirakan gerak error. Nilai yang terlalu besar membuat controller bereaksi berlebihan terhadap perubahan kecil, dan bersama derau sensor menghasilkan getaran pada actuator. Praktik yang lazim menetapkannya sekitar seperempat waktu integral.",
          "Perlu diperhatikan bahwa mengubah penguatan proporsional pada bentuk baku ikut mengubah kekuatan aksi integral dan turunan, karena keduanya dikalikan penguatan yang sama. Pada bentuk penjumlahan tiga gain, ketiganya bebas satu sama lain. Kekeliruan menyamakan kedua bentuk adalah sumber kebingungan yang sering terjadi saat memindahkan parameter antarperangkat.",
        ],
        formula: "u = Kp*(e + (1/Ti)*integral(e) + Td*de/dt)   |   Ti dan Td bersatuan detik",
      },
      {
        head: "Penyetelan: Dari Aturan Praktis ke Penyetelan Berbasis Model",
        body: [
          "Metode Ziegler-Nichols memberi titik awal dari dua percobaan sederhana. Cara pertama menaikkan penguatan proporsional sampai sistem berosilasi dengan amplitudo tetap, lalu mencatat penguatan kritis dan periode osilasinya. Cara kedua memakai respons step lintasan terbuka untuk menaksir gain, konstanta waktu, dan dead time.",
          "Yang perlu disadari, aturan ini dirancang untuk mengejar peredaman seperempat amplitudo, yang menghasilkan respons cukup agresif dengan overshoot sekitar dua puluh sampai lima puluh persen. Untuk banyak penerapan modern hasil itu terlalu berayun, sehingga aturan ini lebih tepat dipakai sebagai titik awal daripada nilai akhir.",
          "Penyetelan berbasis model bekerja dari arah berlawanan. Spesifikasi diterjemahkan menjadi letak pole yang dituju, lalu parameter controller dihitung agar pole loop tertutup mendarat di sana. Cara ini menuntut model yang cukup baik, namun memberi kendali langsung atas overshoot dan waktu menetap.",
          "Apa pun metodenya, penyetelan tidak berhenti di simulasi. Nilai hasil hitungan dipakai sebagai titik awal, lalu diperiksa di perangkat dengan menaikkan agresivitas bertahap sambil mengamati sinyal kendali. Yang menghentikan proses bukan grafik yang indah, melainkan tercapainya spesifikasi tanpa menjenuhkan actuator dan tanpa memperkuat derau berlebihan.",
        ],
        formula: "Ziegler-Nichols: Kp = 0,6*Ku, Ti = 0,5*Tu, Td = 0,125*Tu",
      },
      {
        head: "Anti-Windup dan Pembatasan yang Wajib Ada",
        body: [
          "Ketika actuator mencapai batasnya, keluaran controller tidak lagi memengaruhi plant. Aksi integral yang tetap menumpuk selama itu akan membesar tanpa guna, dan ketika error akhirnya berbalik tanda, akumulator yang telanjur besar harus dikosongkan lebih dahulu sebelum keluaran turun. Akibatnya keluaran melewati setpoint jauh dan lama.",
          "Gejalanya khas dan mudah dikenali: overshoot yang jauh lebih besar daripada perkiraan simulasi, terutama setelah perubahan setpoint yang besar, disertai keluaran yang bertahan mentok cukup lama. Bila gejala ini muncul, memeriksa anti-windup jauh lebih tepat daripada menurunkan penguatan.",
          "Penanganan paling sederhana menghentikan penumpukan ketika keluaran sedang mentok dan error masih mendorong ke arah yang sama. Cara yang lebih halus mengumpanbalikkan selisih antara keluaran yang diminta dan yang benar-benar terjadi ke akumulator, sehingga akumulator menyesuaikan diri secara mulus alih-alih dibekukan.",
          "Selain kejenuhan, laju perubahan actuator juga sering terbatas. Katup memerlukan waktu untuk bergerak, dan motor memiliki batas percepatan. Pembatasan laju ini menimbulkan gejala serupa dan perlu dimodelkan bila dinamikanya sebanding dengan dinamika loop.",
        ],
        formula: "anti-windup: I += Kt*(u_nyata - u_minta)*T bersama pembatasan keluaran",
      },
      {
        head: "Varian Struktur yang Sering Diperlukan",
        body: [
          "PID dasar sering perlu disesuaikan agar berperilaku baik di lapangan. Salah satu penyesuaian yang paling umum adalah menghitung aksi turunan dari keluaran terukur, bukan dari error. Dengan cara ini, perubahan setpoint yang mendadak tidak lagi menghasilkan lonjakan turunan yang besar, sementara kemampuan meredam tetap terjaga.",
          "Pembobotan setpoint pada aksi proporsional bekerja dengan semangat serupa. Aksi proporsional dihitung dari selisih antara setpoint berbobot dan keluaran, sehingga respons terhadap perubahan setpoint dapat dilunakkan tanpa mengubah sifat penolakan gangguan maupun kestabilan loop.",
          "Untuk proses berdead-time besar, struktur prediktor memisahkan pengaruh tundaan dari perhitungan umpan balik dengan memakai model plant. Sistem menjadi jauh lebih agresif secara aman, namun kinerjanya kini bergantung pada ketepatan model. Bila model meleset, keunggulannya cepat hilang.",
          "Pada sistem dengan besaran cepat di dalam besaran lambat, struktur bersarang biasanya lebih efektif daripada satu PID tunggal yang disetel sangat agresif. Loop dalam menekan gangguan di dekat sumbernya dan menyederhanakan penyetelan, karena tiap loop dapat disetel bergiliran dari dalam ke luar.",
        ],
        formula: "turunan dari keluaran: D = -Kd*dy/dt   |   bobot setpoint: P = Kp*(b*r - y)",
      },
    ],
    derivation: {
      head: "Menurunkan Parameter PI dari Letak Pole yang Dituju",
      intro: "Penurunan berikut menunjukkan cara menghitung parameter controller langsung dari spesifikasi, bukan lewat coba-coba.",
      steps: [
        ["Plant dan controller", "G = K/(tau*s+1),  C = Kp + Ki/s", "Dipilih PI karena spesifikasi menuntut error tunak nol terhadap step."],
        ["Gain lintasan terbuka", "L = (Kp*s + Ki)*K/(s*(tau*s+1))", "Controller disatukan menjadi satu pecahan."],
        ["Persamaan karakteristik", "tau*s^2 + (1 + K*Kp)*s + K*Ki = 0", "Diperoleh dari 1 + L = 0 lalu dikalikan penyebutnya."],
        ["Bentuk baku orde dua", "s^2 + (1+K*Kp)/tau * s + K*Ki/tau = 0", "Seluruh persamaan dibagi tau."],
        ["Cocokkan suku konstanta", "wn^2 = K*Ki/tau  =>  Ki = tau*wn^2/K", "Frekuensi alami menentukan Ki."],
        ["Cocokkan koefisien s", "2*z*wn = (1 + K*Kp)/tau  =>  Kp = (2*z*wn*tau - 1)/K", "Rasio redaman menentukan Kp."],
      ],
      closing: "Kedua parameter kini diperoleh langsung dari z dan wn, yang sendiri diturunkan dari batas overshoot dan waktu menetap. Perhatikan Kp dapat bernilai negatif bila wn yang diminta terlalu kecil — pertanda spesifikasinya sendiri tidak masuk akal untuk plant tersebut.",
    },
    worked: {
      head: "Contoh Terhitung: Merancang PI dari Spesifikasi",
      given: [
        "Plant G(s) = 2/(5s + 1), yaitu K = 2 dan tau = 5 detik",
        "Spesifikasi: overshoot maksimum 10 persen dan waktu menetap maksimum 4 detik pada pita dua persen",
      ],
      steps: [
        ["Rasio redaman dari overshoot", "z = -ln(0,10)/sqrt(pi^2 + ln(0,10)^2) = 0,5912", "Batas overshoot menetapkan z."],
        ["Frekuensi alami dari waktu menetap", "wn = 4/(z*t_s) = 4/(0,5912*4) = 1,6917", "Tuntutan kecepatan menetapkan wn."],
        ["Hitung Ki", "Ki = tau*wn^2/K = 5*2,8619/2 = 7,1547", "Memakai hasil pencocokan suku konstanta."],
        ["Hitung Kp", "Kp = (2*z*wn*tau - 1)/K = (2*0,5912*1,6917*5 - 1)/2", "Memakai hasil pencocokan koefisien s."],
        ["Selesaikan Kp", "= (10,0 - 1)/2 = 4,5", "Perhatikan 2*z*wn = 4/t_s = 1, sehingga 2*z*wn*tau = 5."],
        ["Periksa waktu integral", "Ti = Kp/Ki = 4,5/7,1547 = 0,629 s", "Jauh lebih kecil daripada tau = 5 s, artinya aksi integral memang agresif."],
      ],
      answer: "Diperoleh Kp = 4,5 dan Ki = 7,1547. Nilai ini titik awal, bukan nilai akhir: sebelum dipakai, sinyal kendali pada saat awal harus diperiksa terhadap batas actuator, dan aksi integral yang agresif menuntut anti-windup yang benar-benar bekerja.",
    },
    pitfalls: [
      ["Menambah aksi integral tanpa anti-windup", "Actuator mentok adalah kejadian biasa. Tanpa penanganan, keluaran melewati setpoint jauh melebihi perkiraan simulasi."],
      ["Memakai aksi turunan tanpa penapis", "Selisih memperkuat derau sensor sehingga actuator bergetar terus-menerus dan cepat aus."],
      ["Menyamakan bentuk baku dengan bentuk tiga gain", "Pada bentuk baku, mengubah Kp ikut mengubah kekuatan integral dan turunan. Memindahkan parameter antarperangkat tanpa memeriksa bentuknya menghasilkan perilaku yang jauh berbeda."],
      ["Memperlakukan Ziegler-Nichols sebagai nilai akhir", "Aturan itu mengejar peredaman seperempat amplitudo yang menghasilkan overshoot dua puluh sampai lima puluh persen — terlalu agresif untuk banyak penerapan."],
      ["Menghitung turunan dari error saat setpoint berubah mendadak", "Lonjakan turunan yang besar mengagetkan actuator. Menghitungnya dari keluaran terukur menghilangkan gejala itu tanpa mengurangi kemampuan meredam."],
    ],
    checklist: [
      "Kebutuhan aksi integral ditentukan dari tipe sistem, bukan dari selera",
      "Bentuk PID yang dipakai perangkat diperiksa sebelum memindahkan parameter",
      "Parameter awal diturunkan dari spesifikasi lewat z dan wn, bukan coba-coba",
      "Anti-windup diterapkan dan diuji pada keadaan actuator mentok",
      "Aksi turunan dilengkapi penapis dan dihitung dari keluaran bila setpoint sering berubah",
      "Sinyal kendali diperiksa terhadap batas actuator sebelum penerapan",
      "Penyetelan akhir diverifikasi lewat pengujian setpoint dan gangguan",
    ],
  },

  10: {
    deep: [
      {
        head: "Ketika Reduksi Blok Menjadi Tidak Praktis",
        body: [
          "Reduksi diagram blok bekerja baik selama loop-loopnya bersarang rapi. Kesulitan muncul ketika loop saling bersilangan sehingga tidak ada loop dalam yang berdiri sendiri, atau ketika terdapat banyak lintasan maju dari masukan ke keluaran.",
          "Dalam keadaan itu titik cabang dan titik penjumlahan harus dipindahkan lebih dahulu, dan setiap pemindahan menyisipkan blok tambahan sekaligus membuka peluang kekeliruan tanda. Pada sistem dengan empat atau lima loop bersilangan, proses ini menjadi panjang dan sulit diperiksa.",
          "Aturan Mason menyelesaikan persoalan yang sama dalam satu langkah. Hasilnya diperoleh langsung dari daftar lintasan maju dan daftar loop, tanpa manipulasi bertahap sama sekali. Karena tidak ada langkah antara, tidak ada pula tempat bagi kekeliruan tanda untuk menyelinap.",
          "Keduanya harus memberi jawaban yang sama. Karena itu praktik yang baik memakai salah satunya untuk memeriksa yang lain pada sistem yang cukup rumit, terutama ketika hasilnya akan dipakai sebagai dasar perancangan.",
        ],
        formula: "reduksi blok: bertahap dan rawan tanda   |   Mason: sekali hitung dari daftar",
      },
      {
        head: "Kosakata Grafik Aliran Sinyal",
        body: [
          "Grafik aliran sinyal menyatakan sistem sebagai simpul dan cabang berarah. Simpul mewakili sinyal, sedangkan cabang mewakili perkalian dengan suatu fungsi transfer. Sinyal pada sebuah simpul adalah jumlah seluruh cabang yang masuk ke simpul itu.",
          "Lintasan maju adalah jalur dari simpul masukan ke simpul keluaran yang tidak melewati simpul mana pun lebih dari sekali. Gain lintasan maju adalah hasil kali seluruh gain cabang di sepanjang jalur itu.",
          "Loop adalah jalur tertutup yang berawal dan berakhir pada simpul yang sama tanpa melewati simpul lain lebih dari sekali. Gain loop adalah hasil kali gain cabang di sepanjang loop tersebut, dan tandanya mengikuti tanda pada titik penjumlahan yang dilewatinya.",
          "Dua loop disebut tidak bersentuhan bila keduanya tidak berbagi satu simpul pun. Pengertian ini menjadi kunci karena determinan grafik memuat suku-suku hasil kali loop yang tidak bersentuhan, dan justru bagian inilah yang paling sering keliru saat pertama kali dipelajari.",
        ],
        formula: "simpul = sinyal, cabang = fungsi transfer, loop = jalur tertutup",
      },
      {
        head: "Determinan Grafik dan Maknanya",
        body: [
          "Determinan grafik disusun sebagai satu dikurangi jumlah seluruh gain loop, ditambah jumlah hasil kali pasangan loop yang tidak bersentuhan, dikurangi jumlah hasil kali tripel loop yang tidak bersentuhan, dan seterusnya berganti tanda.",
          "Bentuk berganti tanda ini bukan kebetulan. Ia muncul dari prinsip inklusi dan eksklusi: bila seluruh gain loop dijumlahkan begitu saja, pengaruh loop yang dapat aktif bersamaan terhitung ganda, sehingga harus dikurangkan kembali.",
          "Determinan grafik ternyata sama persis dengan penyebut fungsi transfer, yaitu persamaan karakteristik sistem. Karena itu kestabilan dapat dinilai langsung dari determinan tanpa menyelesaikan seluruh rumus Mason, dan ini sering menjadi jalan tercepat pada sistem yang rumit.",
          "Untuk setiap lintasan maju terdapat kofaktor tersendiri, yaitu determinan yang dihitung ulang dengan menghapus seluruh loop yang bersentuhan dengan lintasan tersebut. Bila seluruh loop bersentuhan dengan sebuah lintasan, kofaktornya bernilai satu.",
        ],
        formula: "Delta = 1 - sum(L_i) + sum(L_i*L_j tak bersentuhan) - sum(tripel) + ...",
      },
      {
        head: "Menerapkan Rumus Mason Secara Sistematis",
        body: [
          "Penerapan yang tertib mengikuti urutan tetap. Mulai dengan menggambar grafik aliran sinyal dari diagram blok, menandai setiap sinyal sebagai simpul. Lalu daftarkan seluruh lintasan maju beserta gainnya, dan seluruh loop beserta gainnya.",
          "Berikutnya tentukan pasangan loop mana yang tidak bersentuhan. Langkah inilah yang paling sering dilewati, dan melewatkannya menghasilkan determinan yang keliru sehingga seluruh jawaban ikut salah.",
          "Setelah determinan disusun, hitung kofaktor untuk setiap lintasan maju. Kemudian gabungkan seluruhnya: jumlahkan hasil kali gain lintasan dengan kofaktornya, lalu bagi dengan determinan.",
          "Hasilnya wajib diperiksa dengan dua uji murah. Pertama, evaluasi pada s sama dengan nol dan bandingkan dengan gain arus searah yang diharapkan secara fisik. Kedua, periksa apakah satuan keluaran terhadap masukan masuk akal. Kedua uji ini menangkap sebagian besar kekeliruan aritmetika.",
        ],
        formula: "T = (1/Delta) * sum(P_k * Delta_k)",
      },
      {
        head: "Batas Penerapan dan Hubungannya dengan Ruang Keadaan",
        body: [
          "Aturan Mason berlaku untuk sistem linier waktu-invarian yang dapat digambarkan sebagai grafik aliran sinyal. Ia tidak berlaku untuk sistem nonlinier maupun sistem yang parameternya berubah terhadap waktu, dan tidak menangkap dinamika internal yang tidak terhubung ke masukan maupun keluaran.",
          "Batas terakhir itu sama dengan batas fungsi transfer pada umumnya. Grafik aliran sinyal menggambarkan hubungan masukan dan keluaran; keadaan internal yang tidak terkendali atau tidak teramati tidak akan muncul, meskipun tetap ada dan tetap dapat membahayakan.",
          "Sebaliknya, grafik aliran sinyal berguna sebagai jembatan menuju ruang keadaan. Setiap simpul integrator pada grafik berhubungan dengan satu variabel keadaan, sehingga grafik dapat dibaca langsung menjadi persamaan keadaan tanpa melewati fungsi transfer sama sekali.",
          "Pada praktik modern, perhitungan simbolik dan numerik banyak menggantikan penerapan tangan. Nilai aturan Mason karena itu bergeser: bukan sebagai alat hitung utama, melainkan sebagai cara memahami dari mana persamaan karakteristik berasal dan mengapa loop yang saling bersentuhan berperilaku berbeda dari yang tidak.",
        ],
        formula: "Delta = penyebut fungsi transfer = persamaan karakteristik",
      },
    ],
    derivation: {
      head: "Menurunkan Fungsi Transfer Umpan Balik Baku dengan Mason",
      intro: "Penurunan berikut menerapkan rumus Mason pada susunan paling sederhana, agar hasilnya dapat dibandingkan langsung dengan rumus umpan balik yang sudah dikenal.",
      steps: [
        ["Gambar grafiknya", "R -> E -> Y dengan cabang balik dari Y ke E", "Simpul E adalah error, cabang maju bergain G, cabang balik bergain -H."],
        ["Daftarkan lintasan maju", "P1 = G", "Hanya ada satu lintasan dari R ke Y."],
        ["Daftarkan loop", "L1 = -G*H", "Satu-satunya loop, bertanda negatif karena umpan baliknya negatif."],
        ["Periksa loop tak bersentuhan", "tidak ada", "Hanya ada satu loop, sehingga tidak ada pasangan."],
        ["Susun determinan", "Delta = 1 - (-G*H) = 1 + G*H", "Inilah persamaan karakteristik yang sudah dikenal."],
        ["Hitung kofaktor lintasan", "Delta_1 = 1", "Loop L1 bersentuhan dengan lintasan P1, sehingga dihapus seluruhnya."],
        ["Terapkan rumus Mason", "T = P1*Delta_1/Delta = G/(1 + G*H)", "Hasilnya sama persis dengan rumus umpan balik baku."],
      ],
      closing: "Kesesuaian ini menunjukkan rumus umpan balik yang biasa dipakai sebenarnya kasus khusus aturan Mason. Keunggulan Mason baru terasa ketika lintasan maju lebih dari satu atau loop saling bersilangan, keadaan yang membuat reduksi bertahap menjadi berbelit.",
    },
    worked: {
      head: "Contoh Terhitung: Dua Loop yang Tidak Bersentuhan",
      given: [
        "Lintasan maju tunggal dengan gain P1 = G1*G2*G3",
        "Loop pertama L1 = -G1*H1 berada di bagian awal lintasan",
        "Loop kedua L2 = -G3*H2 berada di bagian akhir lintasan",
        "Kedua loop tidak berbagi simpul mana pun",
      ],
      steps: [
        ["Jumlahkan gain loop", "sum L = -G1*H1 - G3*H2", "Kedua loop bertanda negatif karena umpan baliknya negatif."],
        ["Periksa persentuhan", "L1 dan L2 tidak bersentuhan", "Keduanya berada di bagian berbeda pada lintasan dan tidak berbagi simpul."],
        ["Hitung hasil kali pasangan", "L1*L2 = G1*H1*G3*H2", "Perkalian dua bilangan negatif menghasilkan positif."],
        ["Susun determinan", "Delta = 1 + G1*H1 + G3*H2 + G1*H1*G3*H2", "Suku terakhir inilah yang paling sering terlupakan."],
        ["Faktorkan determinan", "Delta = (1 + G1*H1)*(1 + G3*H2)", "Bentuk terfaktor ini muncul justru karena kedua loop tidak bersentuhan."],
        ["Hitung kofaktor", "Delta_1 = 1", "Kedua loop bersentuhan dengan lintasan maju, sehingga seluruhnya dihapus."],
        ["Susun hasil akhir", "T = G1*G2*G3/((1+G1*H1)*(1+G3*H2))", "Hasilnya berupa perkalian dua faktor umpan balik yang terpisah."],
      ],
      answer: "Bentuk terfaktor pada penyebut mengandung makna fisik: karena kedua loop tidak berinteraksi, sistem berperilaku seperti dua subsistem berumpan balik yang dipasang seri. Bila suku hasil kali loop terlupakan, penyebutnya menjadi 1 + G1*H1 + G3*H2 yang tidak dapat difaktorkan, dan letak pole yang dihitung akan meleset — kekeliruan yang tidak akan terdeteksi oleh pemeriksaan gain arus searah sederhana.",
    },
    pitfalls: [
      ["Melupakan suku hasil kali loop yang tidak bersentuhan", "Inilah kekeliruan paling umum. Determinannya menjadi salah sehingga seluruh jawaban ikut salah, dan gejalanya tidak selalu tampak pada pemeriksaan gain arus searah."],
      ["Salah menentukan tanda gain loop", "Tanda mengikuti titik penjumlahan yang dilewati. Satu kekeliruan tanda dapat memindahkan pole ke sebelah kanan dan membalikkan kesimpulan kestabilan."],
      ["Menganggap lintasan boleh melewati simpul dua kali", "Baik lintasan maju maupun loop tidak boleh melewati simpul yang sama lebih dari sekali; melanggarnya menghasilkan daftar yang tidak sah."],
      ["Memakai kofaktor yang sama untuk semua lintasan", "Setiap lintasan memiliki kofaktornya sendiri, dihitung dengan menghapus loop yang bersentuhan dengan lintasan itu saja."],
      ["Mengira Mason menangkap seluruh dinamika sistem", "Sama seperti fungsi transfer, keadaan internal yang tidak terkendali atau tidak teramati tidak muncul sama sekali."],
    ],
    checklist: [
      "Grafik aliran sinyal digambar lengkap dengan seluruh simpul sinyal",
      "Seluruh lintasan maju didaftar beserta gainnya",
      "Seluruh loop didaftar beserta tanda gainnya",
      "Pasangan loop yang tidak bersentuhan diperiksa satu per satu",
      "Determinan disusun dengan tanda berganti sesuai inklusi dan eksklusi",
      "Kofaktor dihitung tersendiri untuk setiap lintasan maju",
      "Hasil diperiksa lewat gain arus searah dan kelayakan satuan",
      "Pada sistem rumit, hasilnya dibandingkan dengan reduksi blok atau perhitungan numerik",
    ],
  },

  11: {
    deep: [
      {
        head: "Kapan Kontrol Klasik Kehabisan Jawaban",
        body: [
          "Kontrol klasik bekerja sangat baik ketika tiga syarat terpenuhi: sistem dapat didekati linier di sekitar titik kerja, parameternya cukup stabil terhadap waktu, dan model yang memadai dapat diperoleh dengan biaya wajar. Sebagian besar loop di industri memenuhi ketiganya, dan pada kasus itu PID yang disetel baik sulit dikalahkan.",
          "Kesulitan muncul ketika salah satu syarat runtuh. Ada proses yang sangat nonlinier sehingga satu himpunan parameter tidak berlaku di seluruh rentang operasi. Ada proses yang sifatnya berubah terhadap waktu karena keausan, pengotoran, atau perubahan bahan baku. Ada pula proses yang modelnya secara teori dapat disusun namun terlalu mahal atau terlalu lama untuk diidentifikasi.",
          "Metode kontrol cerdas menjawab keadaan itu dengan cara berbeda-beda. Logika fuzzy memindahkan pengetahuan operator berpengalaman menjadi aturan yang dapat dieksekusi tanpa memerlukan model matematis. Jaringan saraf tiruan mempelajari hubungan masukan-keluaran langsung dari data. Algoritma evolusioner mencari parameter terbaik pada ruang pencarian yang rumit tanpa memerlukan turunan.",
          "Yang perlu ditegaskan sejak awal: metode ini bukan pengganti universal. Memakai jaringan saraf pada proses yang sebenarnya linier dan modelnya mudah diperoleh hanya menambah kerumitan, memperbesar kebutuhan data, dan menghilangkan jaminan kestabilan yang sebenarnya sudah tersedia gratis lewat analisis klasik.",
        ],
        formula: "syarat klasik: linier di titik kerja + parameter stabil + model terjangkau",
      },
      {
        head: "Tiga Keluarga dan Watak Masing-Masing",
        body: [
          "Logika fuzzy bekerja dari pengetahuan, bukan dari data. Aturannya ditulis manusia dalam bentuk pernyataan jika-maka memakai istilah samar seperti panas, sedang, dan dingin. Kekuatannya terletak pada keterbacaan: setiap keputusan dapat ditelusuri ke aturan tertentu, sehingga mudah diaudit dan mudah diperbaiki bersama operator.",
          "Jaringan saraf bekerja dari data, bukan dari pengetahuan. Ia menyesuaikan bobot sambungan sampai keluarannya mendekati data pelatihan. Kekuatannya adalah kemampuan menangkap hubungan nonlinier yang rumit tanpa perlu dirumuskan. Kelemahannya adalah sifatnya yang gelap: sulit menjelaskan mengapa suatu keluaran dihasilkan, dan ekstrapolasi di luar rentang data pelatihan tidak punya jaminan sama sekali.",
          "Algoritma evolusioner bukan pengendali melainkan pencari. Ia tidak menggantikan controller, melainkan mencarikan parameter terbaik untuk controller yang sudah ada, termasuk parameter PID maupun parameter fungsi keanggotaan fuzzy. Kekuatannya adalah kemampuan bekerja pada fungsi tujuan yang tidak dapat diturunkan dan memiliki banyak minimum lokal.",
          "Ketiganya kerap dipakai bersama alih-alih bersaing. Susunan yang lazim memakai algoritma evolusioner untuk menyetel controller fuzzy, atau memakai jaringan saraf untuk memperkirakan besaran yang tidak terukur lalu menyerahkan pengendaliannya kepada PID biasa.",
        ],
        formula: "fuzzy: dari pengetahuan | ANN: dari data | evolusioner: pencari parameter",
      },
      {
        head: "Lapisan Keselamatan Tetap Klasik",
        body: [
          "Apa pun metode cerdas yang dipakai, lapisan keselamatan hampir selalu tetap memakai logika klasik yang sederhana dan dapat diverifikasi. Alasannya bukan konservatisme melainkan sifat jaminannya: perilaku pembatas keras dan interlock dapat dibuktikan lengkap, sedangkan perilaku jaringan saraf di luar rentang data pelatihan tidak.",
          "Susunan yang lazim menempatkan metode cerdas di lapisan pengoptimalan, sementara lapisan di bawahnya tetap berupa loop klasik yang terbukti stabil. Bila lapisan cerdas gagal atau memberi keluaran di luar batas wajar, sistem kembali ke perilaku klasik yang aman tanpa menghentikan proses.",
          "Mekanisme pengenalan kondisi di luar cakupan menjadi wajib pada sistem berbasis data. Model harus mampu menyatakan bahwa masukan saat ini berada jauh dari data yang pernah dipelajarinya, dan pada keadaan itu kendali dikembalikan ke logika cadangan alih-alih memaksakan tebakan.",
          "Konsekuensinya pada rancangan cukup besar. Sistem kontrol cerdas yang layak dipasang bukan hanya memuat model cerdasnya, melainkan juga mekanisme pemantauan, batas, dan jalur mundur — dan bagian terakhir inilah yang sering terlupakan pada penerapan pertama.",
        ],
        formula: "cerdas di lapisan optimasi, klasik di lapisan keselamatan dan cadangan",
      },
      {
        head: "Memilih Metode dengan Jujur",
        body: [
          "Pemilihan metode sebaiknya dimulai dari pertanyaan yang tidak nyaman: apakah persoalan ini benar-benar tidak dapat diselesaikan kontrol klasik. Banyak kegagalan loop yang dianggap menuntut metode cerdas ternyata berasal dari sensor yang salah tempat, dead time yang tidak disadari, atau anti-windup yang tidak ada.",
          "Bila persoalannya memang nonlinier dan pengetahuan operator tersedia namun model tidak, fuzzy adalah pilihan yang wajar. Bila data historis berlimpah dan hubungan yang dicari rumit namun tidak perlu dijelaskan secara terbuka, jaringan saraf masuk akal. Bila strukturnya sudah tepat namun parameternya sulit dicari, algoritma evolusioner tepat sasaran.",
          "Biaya pemeliharaan sering menjadi penentu yang terlupakan. Controller fuzzy dapat dirawat teknisi pabrik karena aturannya terbaca. Model berbasis data menuntut pengumpulan data ulang dan pelatihan ulang setiap kali proses berubah, dan menuntut orang yang mampu melakukannya.",
          "Terakhir, setiap metode cerdas menuntut cara pengujian sendiri. Kestabilan tidak lagi dapat dibuktikan sekadar lewat letak pole, sehingga pengujian bergeser ke pengujian menyeluruh atas rentang operasi, pengujian keadaan tepi, dan pemantauan berkelanjutan setelah pemasangan.",
        ],
        formula: "urutan bertanya: benarkah klasik gagal -> pengetahuan atau data -> biaya rawat",
      },
      {
        head: "Ukuran Keberhasilan yang Tidak Berubah",
        body: [
          "Meskipun metodenya berbeda, ukuran keberhasilannya tetap sama seperti pada kontrol klasik. Keluaran harus mengikuti sasaran dalam toleransi yang disepakati, gangguan harus ditolak dalam waktu yang ditetapkan, aksi kontrol harus berada dalam kemampuan actuator, dan sistem harus tetap aman pada seluruh kondisi yang mungkin terjadi.",
          "Karena itu spesifikasi tetap harus ditulis dalam angka sebelum metode dipilih. Menyatakan bahwa sistem akan memakai jaringan saraf tidak menjawab satu pun pertanyaan tentang overshoot, waktu menetap, maupun error tunak yang dituntut.",
          "Perbandingan yang jujur menuntut pembanding yang jujur pula. Kinerja metode cerdas harus dibandingkan dengan PID yang disetel dengan sungguh-sungguh, bukan dengan PID yang sengaja disetel buruk. Banyak klaim keunggulan yang menguap begitu pembandingnya diperbaiki.",
          "Pengujian akhir tetap dilakukan pada perangkat, bertahap, dengan jalan keluar yang siap. Sifat cerdas suatu metode tidak mengurangi kebutuhan itu sedikit pun; kalau ada, justru menambahnya karena perilakunya lebih sulit diperkirakan dari analisis semata.",
        ],
        formula: "spesifikasi ditulis sebelum metode dipilih, bukan sesudahnya",
      },
    ],
    derivation: {
      head: "Menurunkan Kapan Penjadwalan Gain Sudah Memadai",
      intro: "Sebelum melompat ke metode cerdas, banyak persoalan nonlinier dapat diselesaikan penjadwalan gain. Penurunan berikut menunjukkan syaratnya.",
      steps: [
        ["Sistem nonlinier umum", "x' = f(x, u)", "Belum dapat dianalisis dengan perkakas linier."],
        ["Pilih titik kerja", "(x0, u0) dengan f(x0, u0) = 0", "Titik setimbang tempat sistem biasa beroperasi."],
        ["Linearisasi di sekitarnya", "dx' = A*dx + B*du", "A dan B adalah turunan parsial f terhadap x dan u di titik itu."],
        ["Ulangi untuk beberapa titik", "A(p), B(p) untuk p = p1, p2, ...", "p adalah besaran terukur yang mencirikan titik kerja, misalnya laju alir."],
        ["Rancang controller per titik", "C(p) dari spesifikasi yang sama", "Tiap titik memberi satu himpunan parameter."],
        ["Jadwalkan berdasarkan p", "parameter dipilih dari p yang terukur saat itu", "Peralihan dibuat mulus agar tidak menimbulkan lompatan keluaran."],
      ],
      closing: "Penjadwalan gain memadai bila titik kerja berubah jauh lebih lambat daripada dinamika loop dan besaran penjadwalnya dapat diukur. Bila kedua syarat itu tidak terpenuhi — misalnya nonlinieritas berubah cepat atau penjadwalnya tidak terukur — barulah metode cerdas memberi keuntungan nyata.",
    },
    worked: {
      head: "Contoh Terhitung: Menilai Kelayakan Sebelum Memilih Metode",
      given: [
        "Reaktor dengan gain proses yang berubah dari 1,5 sampai 6,0 tergantung laju umpan",
        "Laju umpan terukur dan berubah lambat, dengan konstanta waktu perubahan sekitar 30 menit",
        "Dinamika loop temperatur memiliki konstanta waktu sekitar 40 detik",
      ],
      steps: [
        ["Hitung rasio perubahan gain", "6,0/1,5 = 4", "Gain berubah empat kali lipat di seluruh rentang operasi."],
        ["Nilai dampaknya pada gain loop", "L berubah empat kali pula", "Penyetelan yang pas di satu ujung akan terlalu agresif atau terlalu lamban di ujung lain."],
        ["Bandingkan skala waktu", "1800 detik berbanding 40 detik = 45", "Titik kerja berubah 45 kali lebih lambat daripada dinamika loop."],
        ["Periksa keterukuran penjadwal", "laju umpan terukur", "Syarat kedua penjadwalan gain terpenuhi."],
        ["Simpulkan kelayakan", "penjadwalan gain memadai", "Kedua syarat terpenuhi, sehingga metode klasik masih mencukupi."],
        ["Perkirakan biaya alternatif", "ANN menuntut data seluruh rentang + pelatihan ulang", "Biaya pemeliharaannya jauh lebih besar tanpa keuntungan kinerja yang jelas."],
      ],
      answer: "Kasus ini tidak menuntut metode cerdas. Nonlinieritasnya terwakili satu besaran terukur yang berubah jauh lebih lambat daripada loop, sehingga penjadwalan gain menyelesaikannya dengan perkakas yang seluruhnya dapat diverifikasi. Memilih jaringan saraf di sini menambah kebutuhan data, menghilangkan keterbacaan, dan memindahkan beban pemeliharaan ke pihak yang mungkin tidak tersedia di pabrik.",
    },
    pitfalls: [
      ["Memakai metode cerdas untuk menutupi kesalahan dasar", "Sensor salah tempat, dead time tak disadari, dan anti-windup yang tidak ada tetap menjadi masalah berapa pun cerdasnya lapisan di atasnya."],
      ["Membandingkan dengan PID yang sengaja disetel buruk", "Banyak klaim keunggulan menguap begitu pembandingnya diperbaiki dengan sungguh-sungguh."],
      ["Melupakan biaya pemeliharaan", "Model berbasis data menuntut pengumpulan dan pelatihan ulang setiap kali proses berubah, beserta orang yang mampu melakukannya."],
      ["Menaruh metode cerdas di lapisan keselamatan", "Perilaku pembatas keras dapat dibuktikan lengkap; perilaku model berbasis data di luar rentang pelatihan tidak."],
      ["Menulis spesifikasi setelah metode dipilih", "Menyebut nama metode tidak menjawab satu pun pertanyaan tentang overshoot, waktu menetap, maupun error tunak."],
    ],
    checklist: [
      "Kemungkinan penyebab dasar sudah disingkirkan sebelum metode cerdas dipertimbangkan",
      "Spesifikasi ditulis dalam angka sebelum metode dipilih",
      "Ketersediaan pengetahuan operator dan data historis dinilai terpisah",
      "Kelayakan penjadwalan gain diperiksa lebih dahulu",
      "Lapisan keselamatan tetap memakai logika klasik yang dapat diverifikasi",
      "Mekanisme pengenalan kondisi di luar cakupan dan jalur mundur dirancang",
      "Pembanding PID disetel dengan sungguh-sungguh sebelum perbandingan dibuat",
      "Biaya pemeliharaan jangka panjang dinilai, bukan hanya kinerja awal",
    ],
  },

  12: {
    deep: [
      {
        head: "Neuron Buatan dan Alasan Nonlinieritas Diperlukan",
        body: [
          "Satu neuron buatan melakukan dua hal berurutan. Pertama ia menghitung jumlah berbobot seluruh masukannya ditambah satu suku bias. Kedua ia melewatkan hasil itu melalui fungsi aktivasi yang bersifat nonlinier.",
          "Bagian kedua itulah yang menentukan segalanya. Tanpa fungsi aktivasi nonlinier, susunan berlapis berapa pun banyaknya tetap setara dengan satu transformasi linier tunggal, karena gabungan transformasi linier tetaplah linier. Kedalaman jaringan menjadi tidak berarti sama sekali.",
          "Pilihan fungsi aktivasi memengaruhi pelatihan. Fungsi sigmoid dan tangen hiperbolik menghasilkan keluaran terbatas namun turunannya mengecil pada nilai masukan besar, sehingga sinyal pelatihan meredup pada jaringan dalam. Fungsi rectified linear mempertahankan turunan pada sisi positif dan karena itu banyak dipakai pada jaringan berlapis banyak.",
          "Untuk keperluan kontrol, sifat keluaran menjadi pertimbangan tersendiri. Keluaran yang terbatas secara alami memberi lapisan pengaman tambahan, sedangkan keluaran tak terbatas menuntut pembatasan eksplisit sebelum diteruskan ke actuator.",
        ],
        formula: "y = f(sum(w_i*x_i) + b)   |   tanpa f nonlinier, kedalaman tidak berarti",
      },
      {
        head: "Pelatihan sebagai Persoalan Pengoptimalan",
        body: [
          "Melatih jaringan berarti mencari bobot yang meminimumkan selisih antara keluaran jaringan dan keluaran yang dikehendaki pada data pelatihan. Selisih itu dirangkum dalam satu bilangan yang disebut fungsi kerugian, umumnya berupa galat kuadrat rata-rata untuk persoalan regresi.",
          "Pencariannya dilakukan bertahap dengan menuruni gradien. Perambatan balik menghitung turunan fungsi kerugian terhadap setiap bobot secara efisien dengan menerapkan aturan rantai dari lapisan keluaran mundur ke lapisan masukan, lalu setiap bobot digeser berlawanan arah gradiennya.",
          "Besar langkah penggeseran, yang disebut laju pembelajaran, menentukan perilaku pelatihan. Terlalu besar membuat proses melompati minimum dan berayun atau bahkan menyimpang. Terlalu kecil membuat pelatihan sangat lambat dan mudah terjebak di daerah datar.",
          "Perlu disadari bahwa permukaan fungsi kerugian jaringan saraf tidak cembung, sehingga tidak ada jaminan minimum yang ditemukan adalah minimum global. Praktik yang lazim menjalankan pelatihan beberapa kali dengan bobot awal berbeda dan memilih hasil terbaik menurut data pengujian.",
        ],
        formula: "w := w - eta * dL/dw   |   permukaan tidak cembung, minimum global tidak dijamin",
      },
      {
        head: "Menghindari Hafalan: Pemisahan Data dan Pengaturan",
        body: [
          "Bahaya terbesar pada model berbasis data adalah menghafal derau alih-alih menangkap hubungan. Gejalanya khas: kerugian pada data pelatihan terus mengecil sementara kerugian pada data pengujian berhenti membaik lalu memburuk.",
          "Pencegahannya dimulai dari pemisahan data yang tertib menjadi tiga bagian: data pelatihan untuk menyesuaikan bobot, data validasi untuk memilih arsitektur dan menghentikan pelatihan, dan data pengujian yang hanya dipakai sekali di akhir untuk menilai secara jujur.",
          "Penghentian dini memanfaatkan data validasi secara langsung: pelatihan dihentikan ketika kerugian validasi berhenti membaik meskipun kerugian pelatihan masih menurun. Cara ini sederhana dan sangat efektif.",
          "Pengaturan lain menambahkan hukuman terhadap bobot besar pada fungsi kerugian, sehingga jaringan cenderung memilih penjelasan yang lebih sederhana. Pada data yang terbatas, jaringan kecil yang diatur baik hampir selalu mengungguli jaringan besar yang dibiarkan bebas.",
        ],
        formula: "pisahkan latih / validasi / uji   |   hentikan saat kerugian validasi berbalik naik",
      },
      {
        head: "Peran Jaringan Saraf di Dalam Sistem Kontrol",
        body: [
          "Jaringan saraf jarang dipasang sebagai pengganti langsung controller. Peran yang paling sering dan paling aman adalah sebagai penaksir besaran yang tidak terukur, misalnya memperkirakan komposisi produk dari temperatur dan tekanan yang murah diukur. Keluarannya lalu diserahkan ke loop klasik yang tetap memegang kendali.",
          "Peran kedua adalah sebagai model plant untuk keperluan perancangan atau prediksi. Model berbasis data dipakai menggantikan model fisik yang sulit disusun, lalu controller dirancang atau dioptimalkan terhadap model itu.",
          "Peran ketiga, yang paling jarang dan paling menuntut kehati-hatian, adalah sebagai controller langsung. Jaringan dilatih meniru controller yang sudah ada atau meniru operator berpengalaman. Karena keluarannya langsung menggerakkan actuator, pembatasan keras dan pemantauan menjadi mutlak.",
          "Pada seluruh peran itu, batas keberlakuan model harus dinyatakan eksplisit. Jaringan hanya dapat dipercaya di dalam rentang yang terwakili data pelatihannya, sehingga sistem harus mampu mengenali masukan di luar rentang tersebut dan bertindak konservatif ketika itu terjadi.",
        ],
        formula: "peran teraman: penaksir besaran tak terukur, kendali tetap di loop klasik",
      },
      {
        head: "Praktik Penerapan yang Sering Menentukan Keberhasilan",
        body: [
          "Penskalaan masukan hampir selalu diperlukan. Bila satu masukan bersatuan ribuan dan lainnya bersatuan satuan, gradien terhadap keduanya berbeda ordenya sehingga pelatihan menjadi lambat dan tidak seimbang. Penskalaan ke rentang yang sebanding menyelesaikan persoalan ini dengan biaya hampir nol.",
          "Pemilihan masukan lebih menentukan daripada arsitektur. Menambah lapisan pada masukan yang tidak informatif tidak akan memperbaiki apa pun, sedangkan menambahkan satu masukan yang benar-benar berhubungan sering memperbaiki hasil secara dramatis.",
          "Data pelatihan harus mewakili seluruh rentang operasi, termasuk keadaan yang jarang terjadi. Data yang seluruhnya diambil pada operasi normal menghasilkan model yang gagal justru pada saat paling dibutuhkan, yaitu ketika proses menyimpang.",
          "Terakhir, model yang dipasang harus dipantau terus-menerus. Proses berubah, dan model yang dilatih setahun lalu dapat menjadi tidak sahih tanpa memberi tanda apa pun. Pemantauan selisih antara perkiraan dan pengukuran acuan adalah cara termurah mendeteksinya.",
        ],
        formula: "skala masukan, pilih masukan yang tepat, wakili seluruh rentang, pantau terus",
      },
    ],
    derivation: {
      head: "Menurunkan Perambatan Balik pada Satu Neuron",
      intro: "Penurunan berikut memperlihatkan asal-usul aturan pembaruan bobot pada kasus paling sederhana, agar tidak diperlakukan sebagai rumus ajaib.",
      steps: [
        ["Keluaran neuron", "z = w*x + b,  y = f(z)", "Dua tahap: penjumlahan berbobot lalu aktivasi."],
        ["Fungsi kerugian", "L = 0,5*(y - t)^2", "Setengah galat kuadrat; faktor setengah dipakai agar turunannya rapi."],
        ["Turunan terhadap keluaran", "dL/dy = y - t", "Selisih antara keluaran jaringan dan target."],
        ["Turunan aktivasi", "dy/dz = f'(z)", "Bergantung fungsi aktivasi yang dipakai."],
        ["Turunan terhadap masukan bersih", "dL/dz = (y - t)*f'(z)", "Aturan rantai tahap pertama; besaran ini disebut galat lokal."],
        ["Turunan terhadap bobot", "dL/dw = (y - t)*f'(z)*x", "Aturan rantai tahap kedua, karena dz/dw = x."],
        ["Aturan pembaruan", "w := w - eta*(y - t)*f'(z)*x", "Bobot digeser berlawanan arah gradien sebesar laju pembelajaran."],
      ],
      closing: "Perhatikan kemunculan f'(z) pada rumus akhir. Bila fungsi aktivasi jenuh, misalnya sigmoid pada masukan besar, turunannya mendekati nol sehingga bobot hampir tidak bergerak meskipun galatnya besar. Inilah asal masalah gradien yang meredup, dan alasan fungsi rectified linear banyak dipakai pada jaringan dalam.",
    },
    worked: {
      head: "Contoh Terhitung: Satu Langkah Pembaruan Bobot",
      given: [
        "Satu neuron dengan masukan x = 2,0 ; bobot w = 0,5 ; bias b = 0,1",
        "Fungsi aktivasi sigmoid, f(z) = 1/(1 + exp(-z)) dengan f'(z) = f(z)*(1 - f(z))",
        "Target t = 0,0 dan laju pembelajaran eta = 0,5",
      ],
      steps: [
        ["Hitung masukan bersih", "z = 0,5*2,0 + 0,1 = 1,1", "Penjumlahan berbobot ditambah bias."],
        ["Hitung keluaran", "y = 1/(1 + exp(-1,1)) = 0,750260", "exp(-1,1) = 0,332871 sehingga y = 1/1,332871."],
        ["Hitung galat", "y - t = 0,750260", "Target nol sehingga galatnya sama dengan keluaran."],
        ["Hitung turunan aktivasi", "f'(z) = 0,750260*(1 - 0,750260) = 0,187370", "Memakai sifat khas sigmoid."],
        ["Hitung galat lokal", "dL/dz = 0,750260*0,187370 = 0,140597", "Perkalian galat dengan turunan aktivasi."],
        ["Hitung gradien bobot", "dL/dw = 0,140597*2,0 = 0,281194", "Dikalikan masukan."],
        ["Perbarui bobot", "w := 0,5 - 0,5*0,281194 = 0,359403", "Bobot bergeser turun karena keluaran terlalu tinggi."],
      ],
      answer: "Bobot baru 0,359403. Perhatikan bahwa meskipun galatnya cukup besar yaitu 0,75, pergeseran bobotnya hanya sekitar 0,14 karena turunan sigmoid di titik itu hanya 0,187. Bila z jauh lebih besar, misalnya 5, turunannya turun menjadi sekitar 0,0066 dan bobot praktis berhenti bergerak — persis gejala gradien meredup yang membuat pelatihan jaringan dalam bersigmoid menjadi sulit.",
    },
    pitfalls: [
      ["Memakai jaringan saraf pada persoalan yang linier dan modelnya mudah diperoleh", "Kerumitan bertambah, data dibutuhkan, dan jaminan kestabilan dari analisis klasik justru hilang."],
      ["Menilai model dari data yang dipakai melatihnya", "Kerugian pelatihan selalu membaik saat kapasitas ditambah. Hanya data uji yang belum pernah dilihat yang memberi penilaian jujur."],
      ["Melatih hanya dengan data operasi normal", "Model akan gagal justru pada saat paling dibutuhkan, yaitu ketika proses menyimpang."],
      ["Melupakan penskalaan masukan", "Masukan yang ordenya berbeda jauh membuat pelatihan lambat dan tidak seimbang, padahal biayanya hampir nol untuk diperbaiki."],
      ["Memasang keluaran jaringan langsung ke actuator tanpa pembatasan", "Di luar rentang data pelatihan, keluarannya tidak punya jaminan apa pun. Pembatas keras dan pemantauan mutlak diperlukan."],
    ],
    checklist: [
      "Kelayakan pendekatan klasik sudah dinilai lebih dahulu",
      "Masukan dipilih berdasarkan hubungan fisik, bukan sekadar ketersediaan",
      "Data dipisah menjadi latih, validasi, dan uji dengan tertib",
      "Masukan diskalakan ke rentang yang sebanding",
      "Penghentian dini atau pengaturan lain diterapkan terhadap hafalan",
      "Rentang keberlakuan model dinyatakan eksplisit",
      "Mekanisme pengenalan masukan di luar cakupan tersedia",
      "Keluaran dibatasi keras sebelum diteruskan ke actuator",
      "Pemantauan berkelanjutan disiapkan untuk mendeteksi model yang menua",
    ],
  },

  13: {
    deep: [
      {
        head: "Keanggotaan Bertingkat dan Alasannya",
        body: [
          "Himpunan klasik memaksa keputusan biner: sebuah nilai termasuk atau tidak termasuk. Pada besaran fisik yang berubah mulus, pemaksaan itu menimbulkan perilaku yang aneh di sekitar batas, karena perubahan sangat kecil dapat membalikkan keputusan sepenuhnya.",
          "Himpunan fuzzy melunakkan batas itu dengan derajat keanggotaan bernilai antara nol dan satu. Sebuah temperatur dapat termasuk himpunan hangat dengan derajat 0,7 dan sekaligus termasuk himpunan panas dengan derajat 0,3. Perubahan kecil pada temperatur menghasilkan perubahan kecil pada derajat keanggotaan, bukan lompatan.",
          "Perlu ditegaskan bahwa derajat keanggotaan bukan peluang. Peluang menyatakan ketidakpastian tentang kejadian yang sebenarnya pasti, sedangkan derajat keanggotaan menyatakan seberapa cocok sebuah nilai dengan istilah yang memang samar batasnya. Menyamakan keduanya sumber kekeliruan yang sering terjadi.",
          "Bentuk fungsi keanggotaan yang paling banyak dipakai adalah segitiga dan trapesium, semata karena murah dihitung dan mudah dijelaskan kepada operator. Bentuk yang lebih halus jarang memberi perbaikan berarti pada penerapan kontrol.",
        ],
        formula: "mu(x) di antara 0 dan 1   |   derajat keanggotaan bukan peluang",
      },
      {
        head: "Basis Aturan sebagai Pengetahuan yang Dieksekusi",
        body: [
          "Inti controller fuzzy adalah kumpulan aturan berbentuk jika-maka yang ditulis dalam istilah samar. Sebuah aturan berbunyi jika error positif besar dan laju error mendekati nol, maka keluaran dinaikkan besar. Aturan seperti ini dapat ditulis bersama operator berpengalaman tanpa satu persamaan pun.",
          "Masukan yang lazim adalah error dan laju perubahan error, meniru cara manusia mengendalikan: melihat seberapa jauh dari sasaran dan ke mana arah geraknya. Dengan tujuh istilah untuk masing-masing, basis aturan lengkap berisi empat puluh sembilan aturan yang dapat disusun sebagai tabel.",
          "Struktur tabel itu memiliki pola yang bermakna. Diagonalnya biasanya berisi keluaran nol karena error dan lajunya saling meniadakan, sementara sudut-sudutnya berisi aksi paling kuat. Pola ini membuat pemeriksaan kelengkapan menjadi mudah secara visual.",
          "Kelengkapan dan konsistensi wajib diperiksa. Basis aturan harus mencakup seluruh kombinasi yang mungkin agar tidak ada keadaan yang tidak menghasilkan keluaran, dan tidak boleh memuat dua aturan yang memberi kesimpulan berlawanan untuk kondisi yang sama.",
        ],
        formula: "jika error = A dan d(error) = B maka keluaran = C   |   7 x 7 = 49 aturan",
      },
      {
        head: "Tiga Tahap Pemrosesan",
        body: [
          "Tahap pertama, fuzzifikasi, mengubah nilai terukur menjadi derajat keanggotaan pada setiap himpunan masukan. Satu nilai temperatur menghasilkan beberapa derajat sekaligus, umumnya dua yang tidak nol bila fungsi keanggotaannya bertumpang tindih secara wajar.",
          "Tahap kedua, inferensi, menerapkan seluruh aturan. Kekuatan setiap aturan dihitung dari derajat keanggotaan bagian jika-nya, umumnya memakai operasi minimum untuk hubungan dan. Kekuatan itu lalu memotong atau menskalakan himpunan keluaran aturan yang bersangkutan, dan seluruh hasilnya digabungkan.",
          "Tahap ketiga, defuzzifikasi, mengubah himpunan keluaran gabungan menjadi satu bilangan yang dapat dikirim ke actuator. Metode pusat massa paling banyak dipakai karena menghasilkan keluaran yang berubah mulus terhadap masukan.",
          "Tumpang tindih fungsi keanggotaan menentukan kemulusan keluaran. Tumpang tindih yang terlalu kecil membuat keluaran melompat saat berpindah antaraturan, sedangkan yang terlalu besar membuat aksi kontrol menjadi lemah karena terlalu banyak aturan aktif bersamaan dan saling menetralkan.",
        ],
        formula: "fuzzifikasi -> inferensi (min untuk dan) -> defuzzifikasi (pusat massa)",
      },
      {
        head: "Hubungannya dengan PID dan Kapan Ia Menang",
        body: [
          "Controller fuzzy dengan masukan error dan laju error pada dasarnya menjalankan peran serupa PD, dan bila akumulasi error ditambahkan sebagai masukan ketiga, perannya menyerupai PID. Perbedaannya terletak pada hubungan masukan dan keluaran yang tidak harus linier.",
          "Kebebasan itulah keuntungannya. Aksi kontrol dapat dibuat lembut di sekitar setpoint untuk menghindari getaran akibat derau, sekaligus sangat agresif saat error besar untuk mempercepat pemulihan. Satu himpunan parameter PID tidak dapat melakukan keduanya sekaligus.",
          "Karena itu fuzzy paling unggul pada proses yang nonlinier atau yang tuntutan perilakunya berbeda di daerah operasi berbeda. Pada proses yang benar-benar linier dan modelnya tersedia, PID yang disetel baik biasanya setara atau lebih baik dengan kerumitan jauh lebih kecil.",
          "Keunggulan lain yang sering menentukan di lapangan adalah keterbacaan. Setiap keputusan dapat ditelusuri ke aturan tertentu, sehingga teknisi pabrik dapat memahami, memeriksa, dan memperbaiki perilakunya tanpa memerlukan latar belakang pemodelan yang dalam.",
        ],
        formula: "fuzzy(e, de) ~ PD nonlinier   |   unggul saat perilaku harus berbeda per daerah",
      },
      {
        head: "Penyetelan dan Pengujian Controller Fuzzy",
        body: [
          "Penyetelan fuzzy dilakukan pada tiga tempat: rentang semesta pembicaraan tiap masukan dan keluaran, bentuk serta letak fungsi keanggotaan, dan isi basis aturan. Praktik yang tertib menetapkan rentang lebih dahulu dari data operasi, lalu menyusun aturan, dan baru terakhir menghaluskan fungsi keanggotaan.",
          "Faktor penskalaan pada masukan dan keluaran berperan mirip penguatan pada PID. Menaikkan penskalaan error setara menaikkan aksi proporsional, dan menaikkan penskalaan laju error setara menaikkan aksi turunan. Menyadari kesetaraan ini membuat penyetelan awal jauh lebih terarah.",
          "Karena hubungan masukan-keluarannya nonlinier, kestabilan tidak dapat dinilai sekadar dari letak pole. Pengujian bergeser ke penelusuran menyeluruh atas rentang operasi, termasuk memetakan permukaan kendali untuk memastikan tidak ada daerah dengan aksi yang berlawanan dari yang diharapkan.",
          "Pemeriksaan permukaan kendali itu murah dan sangat berguna. Permukaan yang bergelombang tidak wajar atau memiliki daerah datar yang luas menandakan basis aturan atau fungsi keanggotaan yang perlu diperbaiki, dan gejalanya terlihat jauh sebelum controller menyentuh perangkat.",
        ],
        formula: "penskalaan error ~ Kp   |   penskalaan laju error ~ Kd   |   periksa permukaan kendali",
      },
    ],
    derivation: {
      head: "Menurunkan Keluaran Fuzzy Lengkap dari Dua Aturan Aktif",
      intro: "Penurunan berikut menelusuri satu siklus penuh dari nilai terukur sampai keluaran actuator, agar ketiga tahapnya tidak menjadi kotak hitam.",
      steps: [
        ["Nilai terukur", "error e = 2,0 pada semesta -10 sampai 10", "Satu bilangan tegas dari sensor."],
        ["Fuzzifikasi", "mu(Nol) = 0,6 ; mu(Positif Kecil) = 0,4", "Dua himpunan aktif karena fungsi keanggotaannya bertumpang tindih."],
        ["Kekuatan aturan pertama", "Jika e Nol maka u Nol; kekuatan 0,6", "Hanya satu masukan sehingga kekuatannya sama dengan derajat keanggotaan."],
        ["Kekuatan aturan kedua", "Jika e Positif Kecil maka u Positif Kecil; kekuatan 0,4", "Aturan kedua ikut aktif dengan kekuatan lebih rendah."],
        ["Wakil himpunan keluaran", "u Nol berpusat di 0 ; u Positif Kecil berpusat di 5", "Dipakai pusat masing-masing himpunan keluaran."],
        ["Defuzzifikasi berbobot", "u = (0,6*0 + 0,4*5)/(0,6 + 0,4)", "Rata-rata berbobot kekuatan aturan."],
        ["Hasil akhir", "u = 2,0/1,0 = 2,0", "Satu bilangan tegas siap dikirim ke actuator."],
      ],
      closing: "Perhatikan penyebutnya berupa jumlah seluruh kekuatan aturan. Bila basis aturan tidak lengkap sehingga pada suatu keadaan tidak ada aturan yang aktif, penyebutnya menjadi nol dan keluarannya tidak terdefinisi — inilah alasan pemeriksaan kelengkapan bersifat wajib, bukan anjuran.",
    },
    worked: {
      head: "Contoh Terhitung: Keluaran pada Dua Masukan",
      given: [
        "Error e = 3,0 dengan mu(Nol) = 0,4 dan mu(Positif Kecil) = 0,6",
        "Laju error de = -1,0 dengan mu(Nol) = 0,7 dan mu(Negatif Kecil) = 0,3",
        "Aturan memakai operasi minimum untuk hubungan dan; pusat keluaran: Nol = 0, Positif Kecil = 5, Negatif Kecil = -5",
      ],
      steps: [
        ["Aturan 1", "e Nol dan de Nol -> u Nol; kekuatan min(0,4 ; 0,7) = 0,4", "Operasi minimum mengambil yang terlemah."],
        ["Aturan 2", "e PK dan de Nol -> u PK; kekuatan min(0,6 ; 0,7) = 0,6", "Aturan terkuat pada keadaan ini."],
        ["Aturan 3", "e Nol dan de NK -> u NK; kekuatan min(0,4 ; 0,3) = 0,3", "Laju error negatif menarik keluaran ke bawah."],
        ["Aturan 4", "e PK dan de NK -> u Nol; kekuatan min(0,6 ; 0,3) = 0,3", "Kedua pengaruh saling meniadakan."],
        ["Hitung pembilang", "0,4*0 + 0,6*5 + 0,3*(-5) + 0,3*0 = 1,5", "Jumlah kekuatan dikali pusat keluarannya."],
        ["Hitung penyebut", "0,4 + 0,6 + 0,3 + 0,3 = 1,6", "Jumlah seluruh kekuatan aturan."],
        ["Defuzzifikasi", "u = 1,5/1,6 = 0,9375", "Rata-rata berbobot."],
      ],
      answer: "Keluaran 0,9375. Perhatikan bahwa meskipun error cukup besar dan condong ke Positif Kecil, keluarannya jauh lebih kecil daripada pusat himpunan Positif Kecil yang bernilai 5. Penyebabnya laju error yang negatif: sistem sudah bergerak menuju setpoint, sehingga aturan-aturan yang mengandung Negatif Kecil menahan aksi. Inilah wujud aksi turunan pada controller fuzzy, muncul dari basis aturan tanpa satu pun rumus turunan.",
    },
    pitfalls: [
      ["Menyamakan derajat keanggotaan dengan peluang", "Keduanya menjawab pertanyaan berbeda: peluang tentang ketidakpastian kejadian, keanggotaan tentang kecocokan dengan istilah yang batasnya memang samar."],
      ["Membiarkan basis aturan tidak lengkap", "Bila pada suatu keadaan tidak ada aturan aktif, penyebut defuzzifikasi menjadi nol dan keluarannya tidak terdefinisi."],
      ["Tumpang tindih fungsi keanggotaan yang terlalu kecil", "Keluaran melompat saat berpindah antaraturan, menghasilkan aksi kontrol yang tersentak."],
      ["Tumpang tindih yang terlalu besar", "Terlalu banyak aturan aktif bersamaan dan saling menetralkan, sehingga aksi kontrol menjadi lemah."],
      ["Menilai kestabilan dari letak pole", "Hubungan masukan-keluarannya nonlinier. Pengujian harus menelusuri seluruh rentang operasi dan memetakan permukaan kendali."],
    ],
    checklist: [
      "Rentang semesta pembicaraan ditetapkan dari data operasi nyata",
      "Basis aturan diperiksa kelengkapannya untuk seluruh kombinasi masukan",
      "Konsistensi antaraturan diperiksa, tidak ada kesimpulan berlawanan",
      "Tumpang tindih fungsi keanggotaan diperiksa tidak terlalu kecil maupun terlalu besar",
      "Faktor penskalaan disetel dengan menyadari kesetaraannya terhadap Kp dan Kd",
      "Permukaan kendali dipetakan dan diperiksa kewajarannya",
      "Pengujian menelusuri seluruh rentang operasi, bukan hanya di sekitar setpoint",
      "Aturan ditinjau bersama operator yang memahami prosesnya",
    ],
  },

  14: {
    deep: [
      {
        head: "Ketika Pencarian Berbasis Turunan Tidak Dapat Dipakai",
        body: [
          "Metode pengoptimalan klasik bekerja dengan mengikuti gradien menuruni permukaan fungsi tujuan. Cara ini sangat efisien, namun menuntut tiga hal: fungsi tujuannya dapat diturunkan, turunannya dapat dihitung dengan biaya wajar, dan permukaannya tidak memiliki terlalu banyak minimum lokal.",
          "Pada penyetelan controller, ketiga syarat itu sering runtuh sekaligus. Fungsi tujuan biasanya berupa hasil simulasi, misalnya integral galat mutlak terhadap waktu, yang tidak memiliki bentuk analitik sehingga turunannya tidak tersedia. Kehadiran kejenuhan actuator dan pembatasan lain membuat permukaannya patah-patah.",
          "Algoritma genetika tidak memerlukan turunan sama sekali. Ia hanya memerlukan kemampuan menilai seberapa baik sebuah kandidat, sehingga fungsi tujuan boleh berupa apa saja, termasuk hasil simulasi penuh dengan seluruh nonlinieritasnya.",
          "Harganya adalah jumlah penilaian yang jauh lebih banyak. Bila satu penilaian menuntut simulasi yang lama, biaya totalnya bisa menjadi penghalang, sehingga perancangan fungsi tujuan yang murah dihitung menjadi bagian penting dari pekerjaan.",
        ],
        formula: "GA hanya perlu menilai, tidak perlu menurunkan   |   harganya: banyak penilaian",
      },
      {
        head: "Empat Operator dan Peran Masing-Masing",
        body: [
          "Seleksi menentukan kandidat mana yang berpeluang menurunkan sifatnya. Metode turnamen paling banyak dipakai karena sederhana dan tekanan seleksinya mudah diatur lewat ukuran turnamen. Tekanan yang terlalu besar membuat populasi cepat seragam dan pencarian berhenti dini.",
          "Persilangan menggabungkan dua kandidat menjadi keturunan baru. Operator inilah yang bertanggung jawab menggabungkan bagian-bagian baik dari dua penyelesaian berbeda, dan menjadi pembeda utama algoritma genetika dari pencarian acak biasa.",
          "Mutasi mengubah sedikit nilai secara acak. Perannya menjaga keragaman dan membuka kembali daerah pencarian yang sudah ditinggalkan populasi. Laju yang terlalu kecil membuat pencarian terjebak, sedangkan yang terlalu besar mengubahnya menjadi pencarian acak yang tidak terarah.",
          "Elitisme menyalin beberapa kandidat terbaik langsung ke generasi berikutnya tanpa perubahan. Tanpa ini, penyelesaian terbaik yang sudah ditemukan dapat hilang akibat persilangan atau mutasi, sehingga kualitas terbaik dapat menurun antargenerasi — hal yang seharusnya tidak pernah terjadi.",
        ],
        formula: "seleksi -> persilangan -> mutasi -> elitisme, berulang tiap generasi",
      },
      {
        head: "Merancang Fungsi Tujuan yang Jujur",
        body: [
          "Fungsi tujuan adalah tempat seluruh keinginan perancang dinyatakan, dan algoritma akan mengejarnya secara harfiah termasuk celahnya. Fungsi tujuan yang hanya menghukum galat akan menghasilkan penyetelan yang sangat agresif dengan sinyal kendali di luar kemampuan actuator, karena aspek itu tidak pernah dihukum.",
          "Karena itu fungsi tujuan pada penyetelan controller umumnya menggabungkan beberapa suku: ukuran galat terhadap waktu, hukuman terhadap besar aksi kontrol, dan hukuman terhadap overshoot yang melewati batas. Bobot antarsuku menyatakan prioritas perancang secara eksplisit.",
          "Ukuran galat yang dipilih memengaruhi hasil. Integral galat kuadrat menghukum penyimpangan besar jauh lebih keras sehingga menghasilkan respons agresif. Integral galat mutlak dikali waktu menghukum galat yang bertahan lama, sehingga cenderung menghasilkan penetapan yang cepat tanpa terlalu mengejar puncak awal.",
          "Batasan keras sebaiknya ditangani terpisah dari bobot. Kandidat yang membuat sistem tidak stabil atau melanggar batas keselamatan lebih baik langsung diberi nilai sangat buruk, alih-alih sekadar dihukum, agar tidak pernah terpilih meskipun unggul pada aspek lain.",
        ],
        formula: "J = w1*ITAE + w2*integral(u^2) + w3*penalti overshoot   |   pelanggaran keras: tolak",
      },
      {
        head: "Membaca Perilaku Pencarian",
        body: [
          "Grafik nilai terbaik terhadap generasi memberi banyak informasi. Penurunan yang cepat lalu mendatar menunjukkan pencarian sudah menemukan daerah yang baik; bila mendatarnya terjadi sangat dini, biasanya keragaman populasi habis terlalu cepat akibat tekanan seleksi yang berlebihan.",
          "Memantau keragaman populasi sama pentingnya dengan memantau nilai terbaik. Populasi yang seluruh anggotanya hampir sama tidak akan menghasilkan perbaikan lagi berapa pun generasi ditambahkan, karena persilangan antaranggota yang identik tidak menghasilkan apa pun yang baru.",
          "Karena algoritma ini bersifat acak, satu kali jalan tidak membuktikan apa-apa. Praktik yang benar menjalankannya beberapa kali dengan benih acak berbeda, lalu melaporkan sebaran hasilnya, bukan hanya hasil terbaik yang kebetulan diperoleh.",
          "Perlu diingat pula bahwa hasil terbaik menurut fungsi tujuan belum tentu terbaik menurut kebutuhan sesungguhnya. Kandidat pemenang wajib diperiksa ulang lewat simulasi penuh dan pengujian keadaan tepi sebelum dianggap layak.",
        ],
        formula: "pantau nilai terbaik DAN keragaman   |   jalankan beberapa kali, laporkan sebarannya",
      },
      {
        head: "Menempatkan Algoritma Genetika pada Alur Perancangan",
        body: [
          "Algoritma genetika bukan pengganti pemahaman sistem. Ia bekerja paling baik ketika struktur controller sudah ditetapkan dengan benar dan yang tersisa hanyalah mencari nilai parameternya. Memakainya untuk menutupi struktur yang keliru hanya menghasilkan penyetelan terbaik dari pilihan yang buruk.",
          "Penggunaan yang lazim mencakup penyetelan parameter PID pada plant yang nonlinier, pencarian letak dan bentuk fungsi keanggotaan pada controller fuzzy, serta penentuan bobot antartujuan yang saling bertentangan.",
          "Karena penilaiannya berbasis simulasi, kualitas hasil dibatasi kualitas model. Model yang tidak memuat kejenuhan actuator akan menghasilkan penyetelan yang tampak unggul di komputer dan mengecewakan di lapangan — persoalan yang sama dengan simulasi pada umumnya, hanya diperbesar karena algoritma mengejar celah model secara sistematis.",
          "Karena itu langkah akhir tetap sama seperti metode lain: nilai hasil pencarian diperlakukan sebagai titik awal, diperiksa terhadap batas actuator dan derau, lalu diuji bertahap pada perangkat dengan jalan keluar yang siap.",
        ],
        formula: "struktur ditetapkan lebih dahulu, GA mencari parameternya",
      },
    ],
    derivation: {
      head: "Menurunkan Satu Generasi Lengkap",
      intro: "Penurunan berikut menelusuri satu generasi pada populasi kecil, agar keempat operator terlihat bekerja berurutan.",
      steps: [
        ["Populasi awal", "empat kandidat dengan nilai tujuan J = 12 ; 8 ; 20 ; 15", "Nilai lebih kecil berarti lebih baik."],
        ["Ubah menjadi kebugaran", "F = 1/J = 0,0833 ; 0,125 ; 0,05 ; 0,0667", "Dibalik karena persoalannya meminimumkan."],
        ["Seleksi turnamen ukuran dua", "adu acak berpasangan, ambil yang lebih bugar", "Kandidat berkebugaran 0,125 paling sering terpilih."],
        ["Persilangan aritmetik", "anak = a*induk1 + (1-a)*induk2", "Dengan a acak antara nol dan satu untuk parameter bernilai nyata."],
        ["Mutasi", "tambahkan derau acak kecil pada sebagian gen", "Laju mutasi menentukan berapa banyak gen yang tersentuh."],
        ["Elitisme", "salin kandidat terbaik apa adanya", "Menjamin nilai terbaik tidak pernah memburuk antargenerasi."],
        ["Bentuk generasi baru", "gabungkan elite dan keturunan sampai ukuran populasi terpenuhi", "Siklus berulang sampai kriteria berhenti terpenuhi."],
      ],
      closing: "Perhatikan urutannya bukan kebetulan. Elitisme diterapkan terakhir justru agar melindungi kandidat terbaik dari kerusakan akibat persilangan dan mutasi yang baru saja terjadi. Tanpa langkah itu, grafik nilai terbaik terhadap generasi dapat naik-turun, padahal seharusnya tidak pernah memburuk.",
    },
    worked: {
      head: "Contoh Terhitung: Seleksi dan Persilangan",
      given: [
        "Empat kandidat parameter Kp dengan nilai 2,0 ; 5,0 ; 8,0 ; 11,0",
        "Nilai fungsi tujuan berturut-turut J = 40 ; 12 ; 18 ; 55 (lebih kecil lebih baik)",
        "Persilangan aritmetik dengan a = 0,3 ; elitisme menyalin satu kandidat terbaik",
      ],
      steps: [
        ["Urutkan menurut J", "5,0 (12) ; 8,0 (18) ; 2,0 (40) ; 11,0 (55)", "Kandidat Kp = 5,0 paling baik."],
        ["Tentukan elite", "Kp = 5,0 disalin apa adanya", "Elitisme menjamin nilai terbaik bertahan."],
        ["Turnamen pertama", "adu 5,0 melawan 11,0 -> menang 5,0", "J = 12 lebih kecil daripada 55."],
        ["Turnamen kedua", "adu 8,0 melawan 2,0 -> menang 8,0", "J = 18 lebih kecil daripada 40."],
        ["Persilangan aritmetik", "anak = 0,3*5,0 + 0,7*8,0", "Memakai kedua pemenang turnamen sebagai induk."],
        ["Hitung anak", "= 1,5 + 5,6 = 7,1", "Nilai berada di antara kedua induknya."],
        ["Mutasi anak", "7,1 + 0,4 = 7,5", "Derau acak kecil ditambahkan untuk menjaga keragaman."],
      ],
      answer: "Generasi berikutnya memuat elite Kp = 5,0 dan keturunan Kp = 7,5, ditambah kandidat lain hasil turnamen berikutnya. Perhatikan bahwa persilangan aritmetik hanya menghasilkan nilai di antara kedua induknya, sehingga populasi cenderung menyusut ke satu titik. Mutasi itulah satu-satunya operator yang dapat membawa pencarian keluar dari rentang yang sudah ada — dan karena itu menolkan laju mutasi hampir selalu membuat pencarian berhenti dini.",
    },
    pitfalls: [
      ["Memakai algoritma genetika untuk menutupi struktur controller yang keliru", "Hasilnya hanya penyetelan terbaik dari pilihan yang buruk. Struktur harus ditetapkan lebih dahulu."],
      ["Menyusun fungsi tujuan yang hanya menghukum galat", "Algoritma akan mengejarnya secara harfiah dan menghasilkan penyetelan agresif dengan sinyal kendali di luar kemampuan actuator."],
      ["Melupakan elitisme", "Penyelesaian terbaik dapat hilang akibat persilangan atau mutasi, sehingga kualitas terbaik memburuk antargenerasi."],
      ["Menolkan laju mutasi", "Persilangan aritmetik hanya menghasilkan nilai di antara induknya, sehingga populasi menyusut ke satu titik dan pencarian berhenti dini."],
      ["Melaporkan satu kali jalan sebagai bukti", "Algoritma ini bersifat acak. Beberapa kali jalan dengan benih berbeda beserta sebaran hasilnya jauh lebih jujur."],
    ],
    checklist: [
      "Struktur controller ditetapkan sebelum pencarian parameter dimulai",
      "Fungsi tujuan memuat suku galat, usaha kontrol, dan hukuman pelanggaran batas",
      "Pelanggaran batas keras ditolak langsung, bukan sekadar dihukum",
      "Ukuran populasi, laju persilangan, dan laju mutasi dicatat",
      "Elitisme diterapkan agar nilai terbaik tidak pernah memburuk",
      "Keragaman populasi dipantau bersama nilai terbaik",
      "Pencarian dijalankan beberapa kali dengan benih berbeda",
      "Kandidat pemenang diperiksa ulang lewat simulasi penuh dan pengujian keadaan tepi",
      "Model yang dipakai menilai sudah memuat kejenuhan actuator",
    ],
  },
};

export default MATERI;
