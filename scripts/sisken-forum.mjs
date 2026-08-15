// Data forum diskusi Modul 2-14 Sistem Kendali Cerdas.
//
// Modul 1 tidak ada di sini karena halaman forumnya ditulis tangan dan dilewati
// generator (lihat LEWATI di enrich-sisken-modules.mjs).
//
// Tiap entri:
//   judul     judul kasus, dipakai di hero dan seksi
//   eyebrow   label kecil di atas judul hero
//   ringkas   satu kalimat pengantar di hero
//   narasi    [paragraf]  deskripsi kasus industri
//   chip      [teks]      parameter kunci yang ditampilkan sebagai kartu kecil
//   jajak     [{ q, opts:[4], jawab: index benar, benar, salah }]
//   diskusi   [{ q, petunjuk }]  tiga pertanyaan esai, minimal 30 kata
//
// Jawaban jajak pendapat TIDAK disimpan mentah di HTML; generator mengubahnya
// menjadi hash lewat _ah() yang sama seperti dipakai Modul 1, sehingga tidak
// terbaca langsung dari sumber halaman.

export const FORUM = {
  2: {
    judul: "Spesifikasi yang Tidak Pernah Ditulis",
    eyebrow: "Forum Diskusi · Pertemuan 2 · Proses Perancangan",
    ringkas: "Sebuah proyek retrofit gagal serah terima karena tidak ada satu pun angka yang disepakati di awal. Bedah kasusnya memakai kerangka perancangan Pertemuan 2.",
    narasi: [
      "Sebuah pabrik kimia meng-<strong>upgrade</strong> kendali temperatur reaktor. Permintaan dari kepala produksi hanya satu kalimat: <strong style=\"color:var(--amber)\">\"pokoknya responsnya cepat dan stabil\"</strong>. Vendor memasang controller baru, menyetel gain sampai grafik terlihat bagus di layar, lalu menyatakan pekerjaan selesai.",
      "Tiga minggu kemudian operator melapor. Saat beban ringan sistem bekerja mulus, tetapi saat produksi penuh temperatur <strong style=\"color:var(--pink)\">melewati setpoint sampai 12 derajat</strong> sebelum kembali turun. Vendor berkeras sistemnya sudah sesuai permintaan; pabrik berkeras hasilnya tidak dapat diterima. Tidak ada dokumen yang bisa dipakai memutuskan siapa yang benar, karena tidak pernah ada angka yang disepakati.",
      "Pemeriksaan menemukan hal lain: katup pemanas ternyata sudah <strong>mentok terbuka penuh</strong> selama fase awal pemanasan, dan tidak ada satu pun grafik sinyal kendali yang pernah diambil selama commissioning.",
    ],
    chip: ["Setpoint: 240 °C", "Overshoot terukur: 12 °C", "Katup: mentok 100%", "Spesifikasi tertulis: tidak ada"],
    jajak: [
      {
        q: "Menurut kerangka Pertemuan 2, akar masalah proyek ini paling tepat disebut...",
        opts: [
          "Penyetelan gain yang kurang teliti oleh vendor",
          "Kegagalan menerjemahkan permintaan menjadi spesifikasi terukur sebelum perancangan dimulai",
          "Pemilihan jenis controller yang keliru",
          "Sensor temperatur yang terlalu lambat",
        ],
        jawab: 1,
        benar: "Tepat. Tanpa angka target, tidak ada dasar untuk menyatakan pekerjaan selesai maupun untuk menolaknya. Penyetelan berubah menjadi selera, dan perselisihan seperti ini tidak terhindarkan.",
        salah: "Semua itu bisa jadi ikut berperan, tetapi tidak satu pun dapat dinilai benar atau salah tanpa spesifikasi. Persoalan pertamanya bukan teknik penyetelan melainkan tidak adanya angka yang disepakati.",
      },
      {
        q: "Katup yang mentok terbuka penuh selama pemanasan berarti selama periode itu...",
        opts: [
          "Sistem bekerja pada penguatan maksimum sehingga responsnya paling cepat",
          "Sensor berhenti mengirim data ke controller",
          "Loop praktis terputus, dan aksi integral dapat menumpuk tanpa memengaruhi plant",
          "Sistem menjadi loop terbuka yang justru lebih stabil",
        ],
        jawab: 2,
        benar: "Tepat. Saat actuator mentok, keluaran controller tidak lagi berpengaruh. Aksi integral yang terus menumpuk selama itu akan membuat keluaran melewati setpoint jauh melebihi perkiraan; persis itulah 12 derajat yang dilaporkan operator.",
        salah: "Perhatikan bahwa saat mentok, perubahan keluaran controller tidak lagi mengubah apa pun pada plant. Loop terputus secara efektif, dan itu bukan keadaan yang lebih cepat maupun lebih stabil.",
      },
      {
        q: "Tidak adanya rekaman sinyal kendali selama commissioning berakibat...",
        opts: [
          "Tidak ada, karena yang penting hanya grafik keluaran",
          "Hanya menyulitkan pembuatan laporan akhir",
          "Membuat simulasi tidak dapat diulang, tetapi tidak memengaruhi keputusan teknis",
          "Kejenuhan actuator tidak pernah terlihat, padahal itulah penyebab yang menentukan",
        ],
        jawab: 3,
        benar: "Tepat. Respons keluaran yang tampak baik bisa saja menuntut aksi kontrol di luar kemampuan actuator. Grafik respons tanpa grafik sinyal kendali adalah bukti yang belum lengkap.",
        salah: "Justru sinyal kendali yang mengungkap masalah ini. Tanpa rekamannya, kejenuhan katup tidak akan pernah terlihat dan diskusi berputar pada gejala, bukan penyebab.",
      },
    ],
    diskusi: [
      {
        q: "Susun spesifikasi terukur yang seharusnya disepakati di awal proyek ini",
        petunjuk: "(1) Nyatakan overshoot, waktu menetap, dan error tunak dalam angka bersatuan. (2) Sebutkan batas actuator dan rentang sensor. (3) Tentukan kondisi operasi mana yang dipakai sebagai acuan pengujian: beban ringan atau beban penuh?",
      },
      {
        q: "Jelaskan mengapa sistem bekerja mulus saat beban ringan namun gagal saat produksi penuh",
        petunjuk: "(1) Kaitkan dengan titik kerja dan berlakunya model linier. (2) Jelaskan peran kejenuhan katup pada beban penuh. (3) Apa yang seharusnya diuji pada simulasi agar keadaan ini ketahuan sebelum pemasangan?",
      },
      {
        q: "Rancang urutan commissioning yang seharusnya dipakai, beserta bukti yang harus direkam pada tiap tahap",
        petunjuk: "(1) Susun tahapannya dari pengujian komponen sampai penutupan loop. (2) Sebutkan kriteria lulus tiap tahap. (3) Tentukan grafik dan angka apa yang wajib direkam sebagai bukti serah terima, dan jelaskan mengapa verifikasi berbeda dari validasi di kasus ini.",
      },
    ],
  },

  3: {
    judul: "Respons yang Terlambat Terbaca",
    eyebrow: "Forum Diskusi · Pertemuan 3 · Transformasi Laplace",
    ringkas: "Dua penukar panas dengan gain sama berperilaku sangat berbeda. Pakai domain-s untuk menjelaskan mengapa.",
    narasi: [
      "Dua penukar panas dipasang pada jalur berbeda di pabrik yang sama. Keduanya diuji dengan <strong style=\"color:var(--cyan)\">uji step</strong> yang identik, dan keduanya berakhir pada temperatur akhir yang sama persis. Namun operator menyebut jalur A <strong>\"enak dikendalikan\"</strong> sementara jalur B <strong style=\"color:var(--pink)\">\"selalu telat dan gampang berayun\"</strong>.",
      "Data logger menunjukkan jalur A mulai bergerak segera setelah katup dibuka dan mencapai 63 persen perubahan dalam <strong style=\"color:var(--cyan)\">40 detik</strong>. Jalur B tidak bergerak sama sekali selama <strong style=\"color:var(--pink)\">25 detik pertama</strong>, baru kemudian naik dengan laju yang mirip jalur A.",
      "Engineer proses mengusulkan menaikkan penguatan controller jalur B agar mengejar ketertinggalan. Sebelum usulan itu dijalankan, Anda diminta menjelaskan apa yang sebenarnya berbeda di antara kedua jalur dari sudut pandang domain-s.",
    ],
    chip: ["Gain statik: sama", "A: tau = 40 s, L = 0", "B: tau = 40 s, L = 25 s", "Usulan: naikkan Kp jalur B"],
    jajak: [
      {
        q: "Perbedaan pokok antara jalur A dan B dalam domain-s adalah...",
        opts: [
          "Jalur B memiliki faktor exp(-Ls) yang bukan fungsi rasional",
          "Jalur B memiliki gain statik yang lebih kecil",
          "Jalur B memiliki pole yang letaknya jauh lebih ke kiri",
          "Jalur B berorde dua sedangkan jalur A berorde satu",
        ],
        jawab: 0,
        benar: "Tepat. Dead time memetakan menjadi exp(-Ls), yang tidak dapat dinyatakan sebagai pecahan polinomial. Itulah sumber kesulitannya, bukan gain maupun letak pole.",
        salah: "Perhatikan bahwa gain akhirnya sama dan laju kenaikannya mirip, jadi gain statik dan konstanta waktunya serupa. Yang berbeda adalah jeda 25 detik sebelum keluaran mulai bergerak sama sekali.",
      },
      {
        q: "Menaikkan penguatan controller pada jalur B kemungkinan besar akan...",
        opts: [
          "Menghilangkan jeda 25 detik karena sistem bereaksi lebih cepat",
          "Memperbesar risiko ketidakstabilan karena susut fase akibat dead time bertambah berarti",
          "Tidak berpengaruh sama sekali terhadap kestabilan",
          "Memperkecil konstanta waktu menjadi kurang dari 40 detik",
        ],
        jawab: 1,
        benar: "Tepat. Dead time menyumbang susut fase yang membesar seiring frekuensi. Menaikkan penguatan menggeser frekuensi kerja ke atas, tempat susut fasenya makin besar, sehingga margin kestabilan menipis.",
        salah: "Jeda 25 detik adalah waktu tempuh fisik fluida; tidak ada penguatan controller yang dapat menghapusnya. Yang berubah justru margin kestabilannya.",
      },
      {
        q: "Untuk memperkirakan nilai tunak jalur B tanpa melakukan invers Laplace penuh, engineer dapat memakai teorema nilai akhir asalkan...",
        opts: [
          "Sistem berorde tidak lebih dari dua",
          "Masukannya berupa impuls, bukan step",
          "Dead time-nya lebih kecil daripada konstanta waktu",
          "Seluruh pole sY(s) berada di sebelah kiri sumbu imajiner",
        ],
        jawab: 3,
        benar: "Tepat. Syaratnya semata letak pole. Pada sistem tidak stabil teorema tetap memberi angka, dan angka itu selalu keliru.",
        salah: "Syaratnya bukan orde, jenis masukan, maupun besar dead time, melainkan letak pole sY(s). Memakainya tanpa memeriksa itu menghasilkan angka yang tampak masuk akal namun salah.",
      },
    ],
    diskusi: [
      {
        q: "Tuliskan model kedua jalur dalam domain-s dan jelaskan makna fisik tiap sukunya",
        petunjuk: "(1) Susun G(s) untuk jalur A dan jalur B. (2) Jelaskan arti gain statik, konstanta waktu, dan dead time dalam bahasa proses. (3) Tunjukkan suku mana yang membedakan keduanya dan mengapa suku itu tidak rasional.",
      },
      {
        q: "Jelaskan mengapa usulan menaikkan penguatan jalur B berisiko, memakai bahasa pole dan fase",
        petunjuk: "(1) Uraikan pengaruh dead time terhadap fase pada frekuensi kerja. (2) Kaitkan susut fase dengan margin kestabilan. (3) Sebutkan gejala apa yang akan operator lihat bila penguatan tetap dinaikkan.",
      },
      {
        q: "Usulkan penanganan yang lebih tepat untuk jalur B beserta alasan teknisnya",
        petunjuk: "(1) Sebutkan minimal dua pilihan, misalnya memindahkan sensor lebih dekat, memakai struktur prediktor, atau menurunkan target kecepatan. (2) Jelaskan apa yang diperbaiki tiap pilihan dan apa biayanya. (3) Tentukan pilihan mana yang Anda rekomendasikan dan mengapa.",
      },
    ],
  },

  4: {
    judul: "Sensor yang Menentukan Segalanya",
    eyebrow: "Forum Diskusi · Pertemuan 4 · Fungsi Transfer dan Diagram Blok",
    ringkas: "Setelah penguatan dinaikkan tinggi, kinerja sistem justru mengikuti sensor, bukan plant. Telusuri sebabnya lewat reduksi diagram blok.",
    narasi: [
      "Sebuah meja posisi presisi dikendalikan servo dengan penguatan yang sengaja dibuat <strong style=\"color:var(--cyan)\">sangat tinggi</strong> agar respons cepat dan error kecil. Hasil pengujian awal memuaskan: meja mencapai posisi target dengan cepat dan selisihnya nyaris nol menurut pembacaan encoder.",
      "Enam bulan kemudian, bagian mutu melaporkan produk mulai keluar toleransi meskipun layar operator tetap menunjukkan <strong>posisi tepat sasaran</strong>. Pengukuran independen memakai alat ukur luar menemukan meja sebenarnya meleset <strong style=\"color:var(--pink)\">0,08 mm</strong> dari target, padahal encoder melaporkan selisih nol.",
      "Pemeriksaan menemukan kopling encoder sedikit bergeser sehingga pembacaannya <strong>meleset secara sistematis</strong>. Tim mengusulkan menaikkan penguatan lagi agar errornya makin kecil.",
    ],
    chip: ["Gain loop: sangat tinggi", "Error menurut encoder: ~0", "Error sebenarnya: 0,08 mm", "Usulan: naikkan gain lagi"],
    jajak: [
      {
        q: "Ketika gain loop jauh lebih besar daripada satu, fungsi transfer tertutup mendekati...",
        opts: [
          "Fungsi transfer plant G(s)",
          "Hasil kali G(s) dan H(s)",
          "Kebalikan fungsi transfer sensor, yaitu 1/H(s)",
          "Nilai satu, tidak bergantung komponen apa pun",
        ],
        jawab: 2,
        benar: "Tepat. Inilah inti kasusnya: pada penguatan tinggi, perilaku sistem ditentukan sensor di jalur umpan balik, bukan oleh plant. Sensor yang meleset akan diikuti dengan setia oleh sistem.",
        salah: "Susun T = G/(1+GH) lalu bayangkan GH jauh lebih besar daripada satu. Suku satu pada penyebut menjadi tidak berarti, sehingga T mendekati G/(GH) = 1/H.",
      },
      {
        q: "Usulan menaikkan penguatan lagi akan berakibat...",
        opts: [
          "Error sebenarnya makin kecil karena sistem makin agresif",
          "Sistem makin setia mengikuti pembacaan sensor yang keliru, sehingga error sebenarnya tidak membaik",
          "Kesalahan kalibrasi sensor ikut terkoreksi otomatis",
          "Tidak ada perubahan sama sekali pada perilaku sistem",
        ],
        jawab: 1,
        benar: "Tepat. Umpan balik hanya dapat mengecilkan selisih terhadap apa yang diukur. Bila yang diukur salah, menaikkan penguatan justru memperkuat kesalahan itu.",
        salah: "Umpan balik bekerja terhadap sinyal yang diukur sensor, bukan terhadap kenyataan fisik. Menaikkan penguatan membuat sistem makin patuh pada pembacaan yang keliru.",
      },
      {
        q: "Fungsi sensitivitas S = 1/(1 + GH) pada kasus ini menjelaskan bahwa penguatan tinggi menekan...",
        opts: [
          "Pengaruh ketidakpastian plant, tetapi tidak menekan kesalahan sensor",
          "Seluruh sumber kesalahan termasuk kesalahan sensor",
          "Hanya derau berfrekuensi tinggi",
          "Pengaruh perubahan setpoint",
        ],
        jawab: 0,
        benar: "Tepat. Umpan balik memang menekan kepekaan terhadap perubahan plant, namun kesalahan pada jalur pengukuran masuk langsung ke keluaran dan tidak ikut tertekan.",
        salah: "Perhatikan letak sensor pada diagram blok: ia berada di jalur umpan balik, bukan di lintasan maju. Kesalahan di sana tidak diperlakukan sebagai gangguan yang bisa ditolak.",
      },
    ],
    diskusi: [
      {
        q: "Turunkan fungsi transfer tertutup sistem ini dan tunjukkan mengapa sensor mendominasi pada penguatan tinggi",
        petunjuk: "(1) Susun T = G/(1+GH) dari diagram bloknya. (2) Tunjukkan limitnya saat GH jauh lebih besar daripada satu. (3) Terjemahkan hasilnya ke bahasa kasus: apa artinya bagi meja posisi ini?",
      },
      {
        q: "Bandingkan bagaimana umpan balik memperlakukan ketidakpastian plant dan kesalahan sensor",
        petunjuk: "(1) Tunjukkan letak keduanya pada diagram blok. (2) Turunkan pengaruh masing-masing terhadap keluaran. (3) Jelaskan mengapa yang satu tertekan oleh penguatan tinggi sementara yang lain tidak.",
      },
      {
        q: "Usulkan tindakan perbaikan beserta urutan prioritasnya",
        petunjuk: "(1) Tentukan tindakan pertama yang harus dilakukan sebelum menyentuh parameter controller sama sekali. (2) Sebutkan mekanisme pemeriksaan berkala apa yang perlu ditambahkan. (3) Jelaskan mengapa menaikkan penguatan bukan jawaban, memakai istilah teknis.",
      },
    ],
  },

  5: {
    judul: "Simulasi yang Terlalu Meyakinkan",
    eyebrow: "Forum Diskusi · Pertemuan 5 · Pemodelan dan Simulasi",
    ringkas: "Sebuah rancangan lolos seluruh pengujian simulasi lalu merusak perangkat pada hari pertama. Telusuri di mana simulasinya berbohong.",
    narasi: [
      "Tim merancang kendali posisi untuk lengan robot pemindah. Seluruh pengujian simulasi lolos: respons cepat, tanpa overshoot berarti, dan error tunak nyaris nol. Laporan dilengkapi grafik yang rapi, dan rancangan disetujui.",
      "Pada hari pertama pemasangan, lengan bergerak <strong style=\"color:var(--pink)\">menghentak keras</strong> lalu melewati posisi target cukup jauh sebelum kembali. Setelah beberapa siklus, kopling gearbox retak. Nilai parameter controller yang dipakai persis sama dengan yang disimulasikan.",
      "Pemeriksaan menemukan tiga hal. Simulasi memakai solver langkah tetap dengan <strong>dt = 0,05 detik</strong>, sedangkan konstanta waktu tercepat sistem sekitar 0,02 detik. Model tidak memuat <strong style=\"color:var(--amber)\">batas arus motor</strong>. Dan model dinamika actuator diabaikan sepenuhnya karena dianggap terlalu cepat untuk berpengaruh.",
    ],
    chip: ["dt simulasi: 0,05 s", "tau tercepat: 0,02 s", "Batas arus: tidak dimodelkan", "Actuator: diabaikan"],
    jajak: [
      {
        q: "Langkah waktu 0,05 detik terhadap konstanta waktu tercepat 0,02 detik berarti...",
        opts: [
          "Sudah memadai karena lebih kecil daripada waktu menetap sistem",
          "Terlalu besar; aturan praktis menuntut dt di bawah sepersepuluh konstanta waktu tercepat",
          "Tidak berpengaruh selama solvernya Runge-Kutta",
          "Terlalu kecil sehingga simulasi boros waktu komputasi",
        ],
        jawab: 1,
        benar: "Tepat. Dengan aturan itu, dt seharusnya di bawah 0,002 detik, alias dua puluh lima kali lebih kecil daripada yang dipakai. Pada langkah sebesar itu mode tercepat praktis tidak terwakili sama sekali.",
        salah: "Yang menjadi acuan bukan waktu menetap melainkan konstanta waktu tercepat, dan aturannya dt di bawah sepersepuluhnya. Runge-Kutta memang lebih teliti, tetapi tetap tidak menyelamatkan langkah yang terlalu besar.",
      },
      {
        q: "Tidak dimodelkannya batas arus motor membuat simulasi...",
        opts: [
          "Terlalu pesimistis sehingga rancangan sebenarnya lebih baik daripada yang terlihat",
          "Tidak berpengaruh karena arus bukan besaran yang dikendalikan",
          "Terlalu optimistis, karena actuator dianggap sanggup menghasilkan gaya sebesar apa pun",
          "Gagal konvergen sehingga hasilnya seharusnya sudah ditolak sejak awal",
        ],
        jawab: 2,
        benar: "Tepat. Respons yang tampak sempurna ternyata menuntut aksi kontrol di luar kemampuan perangkat. Di lapangan actuator mentok, loop praktis terputus, dan perilakunya menyimpang jauh dari simulasi.",
        salah: "Tanpa batas, simulasi memberi actuator kemampuan tak terbatas, dan itu membuat hasilnya terlalu bagus, bukan terlalu buruk. Justru inilah sumber hentakan yang merusak kopling.",
      },
      {
        q: "Bukti apa yang paling menentukan seandainya sejak awal ikut direkam pada laporan simulasi?",
        opts: [
          "Grafik sinyal kendali, bukan hanya grafik posisi keluaran",
          "Grafik posisi dengan resolusi lebih tinggi",
          "Durasi simulasi yang lebih panjang",
          "Jumlah titik data yang lebih banyak",
        ],
        jawab: 0,
        benar: "Tepat. Grafik respons tanpa grafik sinyal kendali adalah bukti yang belum lengkap. Sinyal kendali yang melampaui kemampuan actuator akan langsung terlihat, dan persoalan ini tidak akan pernah sampai ke lapangan.",
        salah: "Memperhalus atau memperpanjang grafik posisi tidak menampakkan apa pun tentang tuntutan terhadap actuator. Yang menyingkap masalah ini justru sinyal kendalinya.",
      },
    ],
    diskusi: [
      {
        q: "Susun ulang rancangan eksperimen simulasi yang seharusnya dipakai pada proyek ini",
        petunjuk: "1) Tentukan langkah waktu dari konstanta waktu tercepat dan sebutkan angkanya. 2) Sebutkan unsur nonlinier apa saja yang wajib dimodelkan beserta alasannya. 3) Tentukan cara memverifikasi bahwa langkah waktunya sudah memadai. 4) Sebutkan grafik apa saja yang wajib direkam sebagai bukti.",
      },
      {
        q: "Jelaskan mengapa mengabaikan dinamika actuator karena dianggap terlalu cepat justru berbahaya di sini",
        petunjuk: "1) Kaitkan dengan rasio kekakuan antara mode actuator dan mode mekanik. 2) Jelaskan pengaruh mode cepat terhadap pemilihan solver dan langkah waktu. 3) Jelaskan pengaruhnya terhadap margin kestabilan. 4) Sebutkan kapan pengabaian semacam itu sebenarnya sah dilakukan.",
      },
      {
        q: "Rancang urutan pengujian bertahap agar kejadian seperti ini tidak terulang",
        petunjuk: "1) Susun tahapannya dari simulasi murni sampai plant nyata. 2) Tentukan kriteria lulus tiap tahap dalam angka. 3) Sebutkan pengaman yang harus aktif saat pertama kali menyentuh perangkat nyata. 4) Jelaskan bukti apa yang harus direkam pada tiap tahap agar dapat diverifikasi orang lain.",
      },
    ],
  },

  6: {
    judul: "Controller yang Berubah Perilaku Setelah Diprogram",
    eyebrow: "Forum Diskusi · Pertemuan 6 · Perancangan Kontrol lewat Komputer",
    ringkas: "Rancangan kontinu yang sudah terbukti baik justru berosilasi setelah dipindahkan ke mikrokontroler. Cari sebabnya.",
    narasi: [
      "Kendali suhu sebuah tungku dirancang di domain kontinu dan disimulasikan dengan hasil sangat baik: overshoot 6 persen, waktu menetap 40 detik, error tunak nol karena memakai aksi integral. Parameter controller kemudian diprogram apa adanya ke mikrokontroler.",
      "Di lapangan, suhu <strong style=\"color:var(--pink)\">berayun terus tanpa pernah menetap</strong>, dan katup gas terdengar bergetar cepat. Operator juga melaporkan bahwa setiap kali sistem dipindahkan dari mode manual ke otomatis, keluaran <strong>melompat tiba-tiba</strong> sebelum kembali turun.",
      "Pemeriksaan program menemukan tiga hal. Waktu cacah ditetapkan <strong style=\"color:var(--amber)\">2 detik</strong> karena dianggap sudah cukup cepat untuk proses termal. Aksi turunan dihitung sebagai selisih dua cuplikan dibagi waktu cacah, tanpa penapis. Dan akumulator integral tidak pernah disiapkan saat perpindahan mode.",
    ],
    chip: ["Waktu cacah: 2 s", "Waktu naik target: 18 s", "Aksi turunan: tanpa penapis", "Perpindahan mode: tanpa persiapan"],
    jajak: [
      {
        q: "Waktu cacah 2 detik terhadap waktu naik target 18 detik memberi sekitar sembilan cuplikan sepanjang waktu naik. Menurut aturan praktis, ini...",
        opts: [
          "Sudah memadai karena lebih dari lima cuplikan",
          "Terlalu jarang; anjurannya dua puluh sampai empat puluh cuplikan sepanjang waktu naik",
          "Terlalu rapat sehingga memboroskan sumber daya",
          "Tidak berhubungan dengan kestabilan sama sekali",
        ],
        jawab: 1,
        benar: "Tepat. Penahanan orde nol setara tundaan setengah waktu cacah, yaitu 1 detik di sini. Tundaan itu memangkas margin fase dan mendekatkan sistem ke ambang ketidakstabilan meskipun penguatannya tidak diubah.",
        salah: "Jumlah cuplikan yang terlalu sedikit menimbulkan tundaan efektif yang besar. Anjuran dua puluh sampai empat puluh cuplikan justru ada untuk menjaga margin fase.",
      },
      {
        q: "Katup yang bergetar cepat paling mungkin disebabkan oleh...",
        opts: [
          "Aksi integral yang terlalu besar",
          "Setpoint yang berubah terlalu sering",
          "Aksi turunan tanpa penapis yang memperkuat derau sensor",
          "Gain proporsional yang terlalu kecil",
        ],
        jawab: 2,
        benar: "Tepat. Selisih dua cuplikan memperkuat komponen frekuensi tinggi, dan derau sensor adalah komponen frekuensi tinggi. Getaran rapat beramplitudo kecil adalah tanda khasnya, bukan tanda ketidakstabilan loop.",
        salah: "Perhatikan cirinya: getaran rapat dan cepat, bukan ayunan besar. Aksi integral yang berlebihan menghasilkan ayunan lambat, bukan getaran cepat pada actuator.",
      },
      {
        q: "Lompatan keluaran saat perpindahan dari manual ke otomatis menunjukkan bahwa...",
        opts: [
          "Akumulator integral tidak disiapkan agar keluaran controller sama dengan keluaran manual terakhir",
          "Sensor gagal membaca pada saat perpindahan",
          "Waktu cacah terlalu cepat untuk mode manual",
          "Gain proporsional harus dinolkan saat mode manual",
        ],
        jawab: 0,
        benar: "Tepat. Perpindahan tanpa lompatan dicapai dengan menyiapkan akumulator sehingga keluaran controller pada saat perpindahan persis sama dengan keluaran manual terakhir. Tanpa itu, keluaran melompat ke nilai yang dihitung dari akumulator yang belum sesuai.",
        salah: "Persoalannya bukan pada sensor maupun waktu cacah, melainkan pada keadaan awal akumulator integral saat mode berpindah.",
      },
    ],
    diskusi: [
      {
        q: "Tentukan waktu cacah yang seharusnya dipakai beserta perhitungannya, dan jelaskan akibatnya terhadap margin fase",
        petunjuk: "1) Pakai aturan dua puluh sampai empat puluh cuplikan sepanjang waktu naik dan hitung rentang waktu cacah yang sah. 2) Hitung tundaan setara penahanan orde nol. 3) Ubah tundaan itu menjadi susut fase pada frekuensi kerja. 4) Bandingkan dengan susut fase pada waktu cacah 2 detik.",
      },
      {
        q: "Rancang penanganan aksi turunan agar tidak lagi menggetarkan katup",
        petunjuk: "1) Jelaskan mengapa selisih dua cuplikan memperkuat derau. 2) Usulkan penapis beserta letak frekuensi potongnya relatif terhadap bandwidth tertutup. 3) Sebutkan pembatasan penguatan turunan yang lazim dipakai. 4) Jelaskan apa yang hilang dan apa yang didapat setelah penapisan.",
      },
      {
        q: "Susun daftar pemeriksaan penerapan digital yang seharusnya dilalui sebelum controller ini dipasang",
        petunjuk: "1) Sebutkan pemeriksaan terkait waktu cacah dan keteraturannya. 2) Sebutkan pemeriksaan anti-windup beserta cara mengujinya. 3) Sebutkan pemeriksaan perpindahan mode tanpa lompatan. 4) Sebutkan keadaan tepi yang wajib diuji, misalnya sensor gagal dan keluaran mentok.",
      },
    ],
  },

  7: {
    judul: "Dua Grafik, Dua Kesimpulan Berbeda",
    eyebrow: "Forum Diskusi · Pertemuan 7 · Membaca Grafik Respons",
    ringkas: "Dua tim membaca grafik dari mesin yang sama dan mengambil kesimpulan berlawanan. Tentukan siapa yang benar dan mengapa.",
    narasi: [
      "Sebuah mesin pengisi botol dikendalikan servo. Bagian produksi melaporkan hasil isian tidak konsisten, dan dua tim diminta memeriksa rekaman responsnya.",
      "Tim A menampilkan grafik posisi dengan sumbu vertikal <strong>0 sampai 200 mm</strong> dan menyimpulkan sistem <strong style=\"color:var(--green)\">sudah baik</strong>: kurvanya naik mulus dan terlihat menempel di setpoint. Tim B menampilkan grafik yang sama dengan sumbu vertikal <strong>99 sampai 101 mm</strong> dan menyimpulkan sistem <strong style=\"color:var(--pink)\">bermasalah</strong>: terlihat ayunan kecil yang tidak pernah berhenti, sekitar plus minus 0,4 mm pada frekuensi tetap.",
      "Keduanya memakai berkas rekaman yang persis sama. Tidak satu pun tim menampilkan grafik sinyal kendali, dan tidak ada yang mencatat berapa toleransi isian yang sebenarnya dituntut bagian mutu.",
    ],
    chip: ["Setpoint: 100 mm", "Ayunan: ±0,4 mm", "Toleransi mutu: tidak tercatat", "Sinyal kendali: tidak direkam"],
    jajak: [
      {
        q: "Perbedaan kesimpulan kedua tim terutama disebabkan oleh...",
        opts: [
          "Perbedaan perangkat lunak yang dipakai menggambar grafik",
          "Tim B memakai data yang lebih panjang",
          "Pemilihan skala sumbu, yang membuat ayunan kecil tersembunyi atau tampak menonjol",
          "Kesalahan kalibrasi sensor pada salah satu rekaman",
        ],
        jawab: 2,
        benar: "Tepat. Skala terlalu lebar menyembunyikan osilasi yang berarti; skala terlalu sempit membesar-besarkan derau yang tidak penting. Karena itu skala harus dipilih relatif terhadap toleransi yang dituntut, bukan selera penyaji.",
        salah: "Keduanya memakai berkas rekaman yang sama, jadi perbedaannya bukan pada data maupun perangkat lunak melainkan pada cara menampilkannya.",
      },
      {
        q: "Untuk memutuskan apakah ayunan plus minus 0,4 mm itu bermasalah, informasi yang paling menentukan adalah...",
        opts: [
          "Toleransi isian yang dituntut bagian mutu",
          "Merek servo yang dipakai",
          "Panjang rekaman data",
          "Jumlah botol yang diproduksi per jam",
        ],
        jawab: 0,
        benar: "Tepat. Angka tanpa pembanding tidak bermakna. Ayunan 0,4 mm bisa sepenuhnya dapat diterima atau sama sekali tidak, bergantung pada toleransi yang disepakati; justru itulah yang tidak tercatat.",
        salah: "Tanpa toleransi yang disepakati, tidak ada dasar untuk menyatakan sistem memenuhi atau tidak memenuhi. Informasi lain tidak menjawab pertanyaan itu.",
      },
      {
        q: "Ayunan kecil berfrekuensi tetap yang tidak pernah berhenti paling mungkin menandakan...",
        opts: [
          "Sistem tidak stabil sehingga penguatan harus segera diturunkan drastis",
          "Sistem berada di sekitar ambang kestabilan, atau derau sensor yang diperkuat aksi turunan",
          "Sensor rusak total",
          "Setpoint yang berubah-ubah",
        ],
        jawab: 1,
        benar: "Tepat, dan membedakan keduanya penting karena penanganannya berlawanan: yang pertama menuntut penurunan penguatan, yang kedua menuntut penapisan. Amplitudo yang tetap, bukan membesar, menunjukkan sistem belum benar-benar tidak stabil.",
        salah: "Amplitudo yang tetap dan tidak membesar menunjukkan sistem belum tidak stabil. Menurunkan penguatan drastis tanpa memastikan penyebabnya justru dapat memperlambat sistem tanpa menyelesaikan masalah.",
      },
    ],
    diskusi: [
      {
        q: "Tentukan cara penyajian grafik yang benar untuk kasus ini beserta alasannya",
        petunjuk: "1) Tentukan skala sumbu berdasarkan toleransi mutu, bukan selera. 2) Sebutkan garis bantu apa yang harus ditampilkan. 3) Sebutkan keterangan kondisi pengambilan yang wajib menyertai grafik. 4) Sebutkan angka hasil pembacaan yang harus dicantumkan di samping grafik.",
      },
      {
        q: "Susun prosedur membedakan ayunan akibat ambang kestabilan dari ayunan akibat derau sensor",
        petunjuk: "1) Sebutkan ciri yang membedakan keduanya pada grafik keluaran. 2) Jelaskan apa yang akan terlihat pada grafik sinyal kendali untuk masing-masing. 3) Usulkan satu percobaan sederhana yang memisahkan keduanya. 4) Sebutkan penanganan yang tepat untuk masing-masing penyebab.",
      },
      {
        q: "Tulis kesimpulan teknis yang layak diserahkan ke bagian produksi",
        petunjuk: "1) Nyatakan hasil pembacaan dalam angka bersatuan. 2) Bandingkan langsung dengan spesifikasi, dan sebutkan bila spesifikasinya memang belum ada. 3) Nyatakan terpenuhi atau tidak terpenuhi beserta alasannya. 4) Sebutkan langkah lanjutan beserta bukti tambahan yang perlu diambil.",
      },
    ],
  },

  8: {
    judul: "Lolos Uji Setpoint, Gagal di Lapangan",
    eyebrow: "Forum Diskusi · Pertemuan 8 · Karakteristik Respons Umpan Balik",
    ringkas: "Sebuah loop lolos seluruh pengujian serah terima lalu bermasalah pada minggu pertama produksi. Yang diuji ternyata bukan yang dibutuhkan.",
    narasi: [
      "Kendali tekanan sebuah jalur uap diserahterimakan setelah lolos pengujian lengkap. Prosedurnya jelas: setpoint diubah dari 4 bar ke 5 bar, dan responsnya diukur. Hasilnya bagus, yakni overshoot 6 persen, waktu menetap 12 detik, tanpa error tunak karena controller memakai aksi integral.",
      "Minggu pertama produksi, operator melapor tekanan <strong style=\"color:var(--pink)\">turun sampai 4,3 bar selama hampir satu menit</strong> setiap kali mesin pengguna uap dinyalakan, lalu perlahan kembali. Setpoint tidak pernah diubah sama sekali selama kejadian itu.",
      "Tim yang memasang berkeras sistem sudah sesuai spesifikasi, dan secara tertulis mereka benar: dokumen serah terima hanya memuat <strong style=\"color:var(--amber)\">angka untuk perubahan setpoint</strong>. Tidak ada satu pun angka yang mengatur seberapa dalam tekanan boleh turun akibat perubahan beban, maupun berapa lama ia boleh pulih.",
    ],
    chip: ["Setpoint: 5 bar", "Penurunan: sampai 4,3 bar", "Lama pulih: ~60 detik", "Spesifikasi gangguan: tidak ada"],
    jajak: [
      {
        q: "Alasan teknis sistem dapat lolos uji setpoint namun buruk menolak gangguan adalah...",
        opts: [
          "Sensor hanya akurat pada satu rentang tekanan",
          "Fungsi transfer setpoint dan fungsi transfer gangguan memiliki pembilang berbeda meskipun penyebutnya sama",
          "Aksi integral hanya bekerja pada perubahan setpoint",
          "Gangguan selalu lebih besar daripada perubahan setpoint",
        ],
        jawab: 1,
        benar: "Tepat. Setpoint dilewatkan seluruh lintasan maju, sedangkan gangguan beban hanya dilewatkan plant tanpa melewati controller. Karena pembilangnya berbeda, bentuk responsnya pun berbeda meskipun pole-nya sama.",
        salah: "Perhatikan letak masuknya kedua sinyal pada diagram blok. Keduanya berbagi penyebut yang sama, tetapi tidak berbagi pembilang, padahal pembilang itulah yang membentuk responsnya.",
      },
      {
        q: "Dokumen serah terima yang hanya memuat angka untuk perubahan setpoint berakibat...",
        opts: [
          "Tidak ada, karena penolakan gangguan otomatis mengikuti",
          "Hanya menyulitkan pembuatan laporan",
          "Tidak ada dasar untuk menyatakan sistem gagal, meskipun operasinya jelas terganggu",
          "Sistem menjadi tidak stabil",
        ],
        jawab: 2,
        benar: "Tepat, dan inilah inti persoalannya. Perselisihan ini tidak dapat diselesaikan secara teknis karena kriteria yang diperdebatkan memang tidak pernah disepakati di awal.",
        salah: "Penolakan gangguan tidak otomatis mengikuti pengikutan setpoint. Tanpa angka yang disepakati, tidak ada dasar menyatakan sistem memenuhi maupun tidak memenuhi.",
      },
      {
        q: "Untuk memperbaiki penolakan gangguan tanpa mengubah kestabilan loop, pendekatan yang paling tepat adalah...",
        opts: [
          "Struktur dua derajat kebebasan, yaitu menyetel jalur umpan balik untuk gangguan dan memberi penapis tersendiri pada jalur setpoint",
          "Menaikkan setpoint agar tekanan tidak pernah turun di bawah batas",
          "Mengganti sensor dengan yang lebih cepat",
          "Menghapus aksi integral",
        ],
        jawab: 0,
        benar: "Tepat. Dengan struktur ini, jalur umpan balik dapat dibuat lebih agresif demi penolakan gangguan, sementara respons terhadap perubahan setpoint dilunakkan terpisah tanpa mengubah sifat loop.",
        salah: "Menaikkan setpoint hanya menyembunyikan gejala dan memboroskan energi. Mengganti sensor belum tentu menyentuh persoalan, dan menghapus aksi integral justru mengembalikan error tunak.",
      },
    ],
    diskusi: [
      {
        q: "Susun spesifikasi penolakan gangguan yang seharusnya ada pada dokumen serah terima",
        petunjuk: "1) Tentukan besar gangguan uji beserta cara memberikannya. 2) Tentukan batas penyimpangan puncak yang diizinkan dalam satuan bar. 3) Tentukan batas waktu pemulihan. 4) Jelaskan mengapa ketiganya tidak dapat disimpulkan dari spesifikasi setpoint.",
      },
      {
        q: "Jelaskan secara struktur mengapa kedua tuntutan itu tidak dapat dipenuhi satu penyetelan tunggal",
        petunjuk: "1) Tuliskan kedua fungsi transfer dan tunjukkan bagian mana yang berbeda. 2) Jelaskan pengaruh menaikkan gain terhadap masing-masing. 3) Sebutkan apa yang memburuk bila loop disetel hanya untuk gangguan. 4) Jelaskan bagaimana struktur dua derajat kebebasan memisahkan keduanya.",
      },
      {
        q: "Rancang prosedur pengujian serah terima yang lebih lengkap untuk loop semacam ini",
        petunjuk: "1) Sebutkan pengujian apa saja yang harus dilakukan beserta urutannya. 2) Tentukan besaran yang wajib direkam pada tiap pengujian, termasuk sinyal kendali. 3) Tentukan kriteria lulus dalam angka bersatuan. 4) Jelaskan bagaimana prosedur ini akan menangkap persoalan yang lolos pada kasus di atas.",
      },
    ],
  },

  9: {
    judul: "Aturan Praktis yang Diterapkan Tanpa Memeriksa",
    eyebrow: "Forum Diskusi · Pertemuan 9 · Analisis dan Perancangan PID",
    ringkas: "Penyetelan Ziegler-Nichols dipakai apa adanya dan menghasilkan lonjakan yang merusak. Telusuri di mana aturan itu tidak lagi berlaku.",
    narasi: [
      "Seorang teknisi menyetel kendali aliran memakai metode Ziegler-Nichols. Uji penguatan kritis memberi <strong style=\"color:var(--cyan)\">Ku = 8</strong> dengan periode osilasi <strong>Tu = 2 detik</strong>, dan tabel PID diterapkan apa adanya: Kp = 4,8 ; Ti = 1,0 detik ; Td = 0,25 detik.",
      "Pada perubahan setpoint kecil, hasilnya memuaskan. Namun ketika operator menaikkan setpoint <strong style=\"color:var(--amber)\">tiga satuan sekaligus</strong>, katup langsung membuka penuh dan bertahan di sana cukup lama, lalu aliran <strong style=\"color:var(--pink)\">melonjak jauh melewati sasaran</strong> sebelum akhirnya turun. Kejadian itu berulang setiap kali perubahan setpoint besar dilakukan.",
      "Pemeriksaan menemukan actuator hanya mampu mengeluarkan <strong>5 satuan</strong>, sementara aksi proporsional saja pada saat awal sudah menuntut 4,8 dikali 3. Program controller tidak memuat penanganan apa pun untuk keadaan actuator mentok.",
    ],
    chip: ["Ku / Tu: 8 / 2 s", "Kp ZN: 4,8", "Batas actuator: 5 satuan", "Perubahan setpoint: 3 satuan"],
    jajak: [
      {
        q: "Keluaran aksi proporsional pada saat awal untuk perubahan setpoint 3 satuan adalah...",
        opts: ["1,6 satuan", "4,8 satuan", "14,4 satuan sehingga actuator jenuh hampir tiga kali batasnya", "5 satuan, tepat di batas"],
        jawab: 2,
        benar: "Tepat. Pada saat awal seluruh perubahan setpoint menjadi error, sehingga u(0) = 4,8 x 3 = 14,4 sementara batasnya hanya 5. Aksi integral dan turunan bahkan belum diperhitungkan.",
        salah: "Pada saat awal seluruh perubahan setpoint menjadi error, sehingga aksi proporsional bernilai Kp dikali besar perubahan itu, bukan Kp saja.",
      },
      {
        q: "Lonjakan yang jauh melewati sasaran setelah katup lama mentok paling tepat dijelaskan sebagai...",
        opts: [
          "Penumpukan aksi integral selama actuator jenuh",
          "Derau sensor yang diperkuat aksi turunan",
          "Kesalahan kalibrasi sensor aliran",
          "Sistem yang memang tidak stabil",
        ],
        jawab: 0,
        benar: "Tepat. Selama mentok, keluaran controller tidak lagi memengaruhi plant namun akumulator terus bertambah. Ketika error akhirnya berbalik, akumulator yang telanjur besar harus dikosongkan lebih dahulu sebelum keluaran turun.",
        salah: "Cirinya khas: lonjakan besar yang muncul setelah keluaran lama bertahan mentok, dan hanya pada perubahan setpoint besar. Derau menghasilkan getaran rapat, bukan lonjakan tunggal.",
      },
      {
        q: "Langkah perbaikan yang paling tepat didahulukan adalah...",
        opts: [
          "Menurunkan Kp sampai lonjakan hilang",
          "Menerapkan anti-windup dan pembatasan keluaran, lalu meninjau ulang penyetelan",
          "Mengganti actuator dengan yang lebih besar",
          "Menghapus aksi turunan",
        ],
        jawab: 1,
        benar: "Tepat. Menurunkan Kp memang mengurangi gejala, tetapi mengorbankan kinerja pada seluruh keadaan lain demi menutupi satu keadaan yang seharusnya ditangani anti-windup.",
        salah: "Gejalanya berasal dari penumpukan integral saat jenuh, bukan dari Kp yang terlalu besar secara umum. Menangani sebabnya lebih tepat daripada menurunkan kinerja di semua keadaan.",
      },
    ],
    diskusi: [
      {
        q: "Hitung dan bandingkan penyetelan Ziegler-Nichols dengan penyetelan berbasis spesifikasi untuk kasus ini",
        petunjuk: "1) Hitung Kp, Ti, dan Td menurut Ziegler-Nichols dari Ku dan Tu. 2) Tetapkan spesifikasi overshoot dan waktu menetap yang wajar lalu turunkan z dan wn. 3) Hitung parameter dari letak pole yang dituju. 4) Bandingkan kedua himpunan parameter dan jelaskan mana yang lebih agresif pada tiap aksinya.",
      },
      {
        q: "Jelaskan mekanisme penumpukan integral pada kasus ini beserta cara mengujinya",
        petunjuk: "1) Uraikan apa yang terjadi pada akumulator selama katup mentok. 2) Jelaskan mengapa keluaran baru turun setelah akumulator berkurang. 3) Usulkan skema anti-windup beserta cara kerjanya. 4) Rancang pengujian yang membuktikan anti-windup itu benar-benar bekerja.",
      },
      {
        q: "Tentukan batas penerapan aturan praktis semacam Ziegler-Nichols",
        petunjuk: "1) Sebutkan sasaran yang dikejar aturan itu dan overshoot yang menyertainya. 2) Sebutkan keadaan ketika aturan itu tidak layak dipakai apa adanya. 3) Jelaskan pemeriksaan apa yang wajib dilakukan sebelum parameter hasil tabel dipasang. 4) Simpulkan cara memakainya yang bertanggung jawab.",
      },
    ],
  },

  10: {
    judul: "Dua Jawaban untuk Satu Diagram",
    eyebrow: "Forum Diskusi · Pertemuan 10 · Aturan Mason",
    ringkas: "Reduksi blok dan aturan Mason memberi penyebut berbeda untuk sistem yang sama. Temukan mana yang keliru dan mengapa tidak ketahuan.",
    narasi: [
      "Sebuah sistem kendali dengan dua loop umpan balik yang letaknya berjauhan pada lintasan maju dianalisis dua orang. Yang pertama memakai reduksi diagram blok bertahap dan memperoleh penyebut <strong style=\"color:var(--cyan)\">(1 + G1H1)(1 + G3H2)</strong>. Yang kedua memakai aturan Mason dan memperoleh <strong style=\"color:var(--pink)\">1 + G1H1 + G3H2</strong>.",
      "Keduanya memeriksa hasil masing-masing dengan menghitung gain arus searah, dan angkanya <strong>berbeda tipis</strong> sehingga sempat dianggap kesalahan pembulatan. Karena tenggat mendesak, hasil yang kedua dipakai untuk menentukan letak pole dan menyetel controller.",
      "Setelah dipasang, sistem berperilaku lebih berayun daripada perkiraan. Peninjauan ulang menemukan bahwa kedua loop <strong style=\"color:var(--amber)\">tidak berbagi satu simpul pun</strong>, dan orang kedua tidak memeriksa hal itu sama sekali saat menyusun determinannya.",
    ],
    chip: ["Loop 1: -G1H1", "Loop 2: -G3H2", "Berbagi simpul: tidak", "Suku hasil kali loop: terlupakan"],
    jajak: [
      {
        q: "Determinan grafik yang benar untuk dua loop yang tidak bersentuhan adalah...",
        opts: [
          "1 + G1H1 + G3H2",
          "1 + G1H1 + G3H2 + G1H1G3H2",
          "1 - G1H1 - G3H2",
          "1 + G1H1G3H2",
        ],
        jawab: 1,
        benar: "Tepat, dan bentuk itu dapat difaktorkan menjadi (1 + G1H1)(1 + G3H2), persis hasil reduksi blok. Suku hasil kali loop muncul justru karena kedua loop tidak berbagi simpul.",
        salah: "Determinan memuat suku hasil kali untuk setiap pasangan loop yang tidak bersentuhan. Melupakannya adalah kekeliruan paling umum pada penerapan aturan Mason.",
      },
      {
        q: "Alasan pemeriksaan gain arus searah tidak menangkap kekeliruan ini adalah...",
        opts: [
          "Gain arus searah tidak bergantung pada penyebut",
          "Selisihnya kecil sehingga mudah dikira pembulatan, padahal letak pole sudah bergeser jauh",
          "Kedua penyebut memberi gain arus searah yang persis sama",
          "Pemeriksaan itu hanya berlaku untuk sistem orde satu",
        ],
        jawab: 1,
        benar: "Tepat. Suku hasil kali loop sering kecil pada s = 0 sehingga selisih gainnya tipis, tetapi pengaruhnya terhadap koefisien polinomial, dan karena itu terhadap letak akar, jauh lebih besar.",
        salah: "Gain arus searah memang bergantung pada penyebut, dan kedua penyebut memberi nilai berbeda. Persoalannya selisih itu terlalu kecil untuk memicu kecurigaan.",
      },
      {
        q: "Makna fisik bentuk penyebut yang terfaktor adalah...",
        opts: [
          "Sistem berperilaku seperti dua subsistem berumpan balik yang dipasang seri karena kedua loop tidak berinteraksi",
          "Sistem memiliki dua masukan terpisah",
          "Salah satu loop dapat diabaikan",
          "Sistem selalu stabil",
        ],
        jawab: 0,
        benar: "Tepat. Karena kedua loop tidak berbagi simpul, keduanya tidak saling memengaruhi, dan penyebutnya terpisah menjadi dua faktor yang masing-masing menyerupai umpan balik tunggal.",
        salah: "Bentuk terfaktor muncul karena kedua loop tidak berinteraksi, bukan karena salah satunya dapat diabaikan maupun karena sistemnya punya dua masukan.",
      },
    ],
    diskusi: [
      {
        q: "Susun determinan yang benar langkah demi langkah dan tunjukkan kesetaraannya dengan hasil reduksi blok",
        petunjuk: "1) Daftarkan seluruh loop beserta tanda gainnya. 2) Periksa pasangan mana yang tidak bersentuhan dan jelaskan dasarnya. 3) Susun determinan lengkap dengan tanda berganti. 4) Faktorkan hasilnya dan bandingkan dengan penyebut hasil reduksi blok.",
      },
      {
        q: "Jelaskan mengapa kekeliruan ini lolos dari pemeriksaan yang dilakukan",
        petunjuk: "1) Hitung gain arus searah kedua versi dan tunjukkan selisihnya kecil. 2) Bandingkan koefisien polinomial kedua versi. 3) Jelaskan mengapa selisih koefisien berdampak besar pada letak akar. 4) Usulkan pemeriksaan tambahan yang akan menangkapnya.",
      },
      {
        q: "Susun daftar periksa penerapan aturan Mason yang layak dipakai tim",
        petunjuk: "1) Urutkan langkah dari menggambar grafik sampai memperoleh hasil. 2) Sebutkan langkah mana yang paling sering dilewati beserta akibatnya. 3) Tentukan pemeriksaan silang yang wajib dilakukan. 4) Jelaskan kapan sebaiknya memakai Mason dan kapan reduksi blok sudah memadai.",
      },
    ],
  },

  11: {
    judul: "Proyek Kecerdasan Buatan yang Salah Sasaran",
    eyebrow: "Forum Diskusi · Pertemuan 11 · Ikhtisar Metode Kontrol Cerdas",
    ringkas: "Sebuah pabrik menganggarkan proyek machine learning untuk loop yang bermasalah. Nilai apakah anggaran itu menjawab persoalan yang sebenarnya.",
    narasi: [
      "Sebuah loop kendali temperatur pengering dilaporkan tidak pernah stabil. Manajemen menyetujui usulan mengganti controller dengan model berbasis <strong style=\"color:var(--amber)\">machine learning</strong>, lengkap dengan anggaran pengumpulan data selama enam bulan dan tenaga ahli dari luar.",
      "Sebelum proyek berjalan, seorang engineer muda memeriksa loopnya. Ia menemukan tiga hal. Termokopel dipasang <strong style=\"color:var(--pink)\">di saluran keluar</strong>, tiga meter dari zona pemanas, sehingga perubahan baru terbaca sekitar 70 detik kemudian. Katup gas sering mentok terbuka penuh selama pemanasan awal, sementara program controller tidak memuat penanganan apa pun untuk keadaan itu. Dan parameter controller ternyata <strong>tidak pernah diubah</strong> sejak dipasang delapan tahun lalu, padahal kapasitas pengering sudah dinaikkan dua kali.",
      "Tim proyek berpendapat temuan itu tidak mengubah rencana, karena model berbasis data justru akan belajar menangani semua ketidaksempurnaan tersebut.",
    ],
    chip: ["Jeda sensor: ~70 detik", "Katup: sering mentok", "Anti-windup: tidak ada", "Penyetelan terakhir: 8 tahun lalu"],
    jajak: [
      {
        q: "Pendapat tim proyek bahwa model berbasis data akan belajar menangani ketidaksempurnaan itu...",
        opts: [
          "Benar, karena model dilatih dari data nyata termasuk ketidaksempurnaannya",
          "Keliru, karena jeda sensor dan kejenuhan actuator adalah batasan fisik yang tetap ada berapa pun cerdasnya controller",
          "Benar, asalkan datanya cukup banyak",
          "Keliru, karena model berbasis data tidak dapat menangani sistem nonlinier",
        ],
        jawab: 1,
        benar: "Tepat. Jeda 70 detik tidak dapat dihapus algoritma mana pun; ia menentukan batas seberapa cepat loop boleh dikendalikan. Kejenuhan actuator juga batas fisik, bukan pola yang bisa dipelajari.",
        salah: "Model berbasis data memang belajar dari kenyataan, tetapi belajar bukan berarti mengatasi. Jeda sensor dan batas actuator tetap membatasi kinerja setinggi apa pun kecerdasan controllernya.",
      },
      {
        q: "Urutan penanganan yang paling bertanggung jawab adalah...",
        opts: [
          "Pindahkan sensor, tambahkan anti-windup, setel ulang, lalu nilai ulang apakah masih perlu metode cerdas",
          "Jalankan proyek machine learning sesuai rencana lalu perbaiki sensor belakangan",
          "Ganti katup dengan yang lebih besar",
          "Naikkan penguatan controller sampai respons terasa cepat",
        ],
        jawab: 0,
        benar: "Tepat. Ketiga temuan itu murah diperbaiki dibanding anggaran proyek, dan sebagian besar kasus semacam ini selesai di sini. Penilaian ulang setelah perbaikan barulah dasar yang jujur untuk memutuskan.",
        salah: "Menjalankan proyek besar di atas persoalan dasar yang belum diperbaiki berarti membayar mahal untuk menutupi hal yang murah diselesaikan.",
      },
      {
        q: "Seandainya setelah semua perbaikan loop masih bermasalah karena gain berubah jauh terhadap laju umpan yang terukur, pendekatan yang paling tepat adalah...",
        opts: [
          "Jaringan saraf, karena hubungannya nonlinier",
          "Penjadwalan gain, karena penjadwalnya terukur dan berubah lambat",
          "Logika fuzzy, karena operator berpengalaman",
          "Algoritma genetika, karena parameternya banyak",
        ],
        jawab: 1,
        benar: "Tepat. Bila nonlinieritas terwakili satu besaran terukur yang berubah jauh lebih lambat daripada loop, penjadwalan gain menyelesaikannya dengan perkakas yang seluruhnya dapat diverifikasi.",
        salah: "Kedua syarat penjadwalan gain terpenuhi di sini, yaitu penjadwal terukur dan berubah lambat. Memilih metode yang lebih rumit tanpa keuntungan yang jelas menambah biaya pemeliharaan tanpa alasan.",
      },
    ],
    diskusi: [
      {
        q: "Susun urutan pemeriksaan yang seharusnya dilakukan sebelum menyetujui proyek semacam ini",
        petunjuk: "1) Daftarkan pemeriksaan dasar yang murah beserta gejala yang dicarinya. 2) Tentukan bukti apa yang harus direkam pada tiap pemeriksaan. 3) Tetapkan kriteria kapan pendekatan klasik dinyatakan benar-benar gagal. 4) Jelaskan mengapa urutan ini menghemat biaya sekaligus menghasilkan keputusan yang lebih jujur.",
      },
      {
        q: "Jelaskan mengapa jeda sensor 70 detik membatasi kinerja berapa pun metode yang dipakai",
        petunjuk: "1) Uraikan pengaruh dead time terhadap fase pada frekuensi kerja. 2) Kaitkan dengan margin kestabilan dan batas penguatan. 3) Jelaskan mengapa ini batasan fisik, bukan persoalan algoritma. 4) Sebutkan penanganan yang benar-benar menyentuh sebabnya.",
      },
      {
        q: "Bandingkan biaya pemeliharaan jangka panjang ketiga pilihan: perbaikan klasik, penjadwalan gain, dan model berbasis data",
        petunjuk: "1) Sebutkan siapa yang mampu merawat masing-masing di lingkungan pabrik. 2) Sebutkan apa yang harus dilakukan setiap kali proses berubah. 3) Sebutkan risiko bila orang yang menguasainya tidak lagi tersedia. 4) Berikan rekomendasi beserta alasannya.",
      },
    ],
  },

  12: {
    judul: "Model yang Percaya Diri di Tempat yang Salah",
    eyebrow: "Forum Diskusi · Pertemuan 12 · Jaringan Saraf Tiruan",
    ringkas: "Penaksir berbasis jaringan saraf bekerja sangat baik selama setahun, lalu memberi angka yang meyakinkan namun keliru saat paling dibutuhkan.",
    narasi: [
      "Sebuah kilang memakai jaringan saraf untuk menaksir <strong>kemurnian produk</strong> dari temperatur, tekanan, dan laju alir yang murah diukur, menggantikan analisis laboratorium yang memakan waktu dua jam. Selama setahun hasilnya sangat baik, dengan selisih rata-rata di bawah 0,3 persen terhadap hasil laboratorium.",
      "Suatu hari terjadi gangguan pada umpan sehingga komposisinya berubah jauh di luar kebiasaan. Selama gangguan itu, penaksir tetap melaporkan kemurnian <strong style=\"color:var(--green)\">99,2 persen</strong> dengan tampilan yang sama meyakinkannya seperti hari-hari biasa. Hasil laboratorium yang keluar dua jam kemudian menunjukkan kemurnian sebenarnya <strong style=\"color:var(--pink)\">96,4 persen</strong>, jauh di bawah batas jual.",
      "Peninjauan menemukan data pelatihan seluruhnya diambil pada <strong style=\"color:var(--amber)\">operasi normal</strong> selama tiga bulan. Model tidak pernah melihat keadaan seperti saat gangguan, dan tidak ada mekanisme apa pun yang memberi tahu bahwa masukannya berada di luar rentang yang pernah dipelajari.",
    ],
    chip: ["Taksiran: 99,2 %", "Sebenarnya: 96,4 %", "Data latih: operasi normal saja", "Peringatan luar cakupan: tidak ada"],
    jajak: [
      {
        q: "Penyebab pokok kegagalan ini adalah...",
        opts: [
          "Arsitektur jaringan yang terlalu kecil",
          "Laju pembelajaran yang keliru saat pelatihan",
          "Data pelatihan tidak mewakili keadaan yang jarang terjadi, dan model tidak mengenali masukan di luar cakupannya",
          "Sensor temperatur yang rusak",
        ],
        jawab: 2,
        benar: "Tepat. Model hanya dapat dipercaya di dalam rentang yang terwakili data pelatihannya. Data yang seluruhnya diambil pada operasi normal menghasilkan model yang gagal justru pada saat paling dibutuhkan.",
        salah: "Arsitektur dan laju pembelajaran memengaruhi kualitas pelatihan, tetapi tidak dapat menciptakan pengetahuan tentang keadaan yang tidak pernah ada di data.",
      },
      {
        q: "Model tetap tampil meyakinkan saat keliru karena...",
        opts: [
          "Jaringan saraf selalu memberi keluaran untuk masukan apa pun, tanpa menyatakan seberapa jauh masukan itu dari data pelatihannya",
          "Keluarannya sengaja dibulatkan",
          "Tampilan operator tidak menampilkan angka desimal",
          "Sensor memberi data yang salah",
        ],
        jawab: 0,
        benar: "Tepat. Inilah sifat yang membuat model berbasis data berbahaya bila dipakai tanpa pengaman: ekstrapolasi menghasilkan angka yang bentuknya wajar namun tidak memiliki jaminan apa pun.",
        salah: "Persoalannya bukan pada penyajian angka, melainkan pada tidak adanya mekanisme yang menyatakan bahwa masukan saat itu berada di luar wilayah yang pernah dipelajari model.",
      },
      {
        q: "Pengaman yang paling tepat ditambahkan adalah...",
        opts: [
          "Melatih ulang model setiap minggu",
          "Mekanisme pengenalan masukan di luar cakupan yang mengembalikan kendali ke logika cadangan",
          "Menambah jumlah lapisan jaringan",
          "Mengganti fungsi aktivasi",
        ],
        jawab: 1,
        benar: "Tepat. Model harus mampu menyatakan bahwa masukan saat ini jauh dari data yang pernah dipelajarinya, dan pada keadaan itu kendali dikembalikan ke logika cadangan alih-alih memaksakan tebakan.",
        salah: "Menambah kapasitas atau melatih lebih sering tidak menyelesaikan persoalan pokoknya, yaitu tidak adanya mekanisme yang mengenali kapan model sedang berada di luar wilayah yang dikuasainya.",
      },
    ],
    diskusi: [
      {
        q: "Rancang strategi pengumpulan data yang seharusnya dipakai sejak awal",
        petunjuk: "1) Tentukan keadaan operasi apa saja yang wajib terwakili, termasuk yang jarang terjadi. 2) Jelaskan cara memperoleh data pada keadaan yang jarang tanpa membahayakan proses. 3) Tentukan pemisahan data latih, validasi, dan uji. 4) Tentukan kriteria kapan data dinyatakan cukup mewakili.",
      },
      {
        q: "Rancang mekanisme pengenalan kondisi di luar cakupan beserta tindakan yang menyertainya",
        petunjuk: "1) Usulkan cara mengukur seberapa jauh masukan saat ini dari data pelatihan. 2) Tentukan ambang yang memicu peringatan. 3) Tentukan tindakan sistem saat ambang terlampaui. 4) Jelaskan mengapa tindakan itu harus konservatif, bukan sekadar memberi peringatan.",
      },
      {
        q: "Susun prosedur pemantauan model setelah dipasang",
        petunjuk: "1) Tentukan besaran acuan yang dipakai membandingkan taksiran model. 2) Tentukan seberapa sering pembandingan dilakukan. 3) Tentukan gejala yang menandakan model mulai menua. 4) Tentukan kriteria kapan model wajib dilatih ulang atau ditarik dari pemakaian.",
      },
    ],
  },

  13: {
    judul: "Aturan yang Saling Meniadakan",
    eyebrow: "Forum Diskusi · Pertemuan 13 · Logika Fuzzy",
    ringkas: "Controller fuzzy hasil lokakarya bersama operator justru bergerak lamban dan tersentak. Bedah basis aturannya.",
    narasi: [
      "Sebuah pabrik menyusun controller fuzzy untuk kendali ketebalan lembaran, dengan basis aturan ditulis bersama tiga operator senior. Semua pihak puas dengan aturannya karena terbaca dan masuk akal.",
      "Di lapangan hasilnya mengecewakan. Saat error besar, aksi kontrolnya <strong style=\"color:var(--pink)\">terasa lemah</strong> sehingga pemulihan lambat. Sebaliknya pada beberapa titik operasi tertentu keluaran <strong>melompat tiba-tiba</strong> meskipun masukannya berubah sedikit saja.",
      "Pemeriksaan menemukan dua hal. Fungsi keanggotaan masukan dibuat <strong style=\"color:var(--amber)\">sangat lebar</strong> sehingga pada hampir setiap titik kerja ada lima sampai enam aturan aktif bersamaan, sebagian dengan kesimpulan berlawanan. Sementara pada rentang lain, dua himpunan bersebelahan justru <strong>nyaris tidak bertumpang tindih</strong>.",
    ],
    chip: ["Aturan aktif: 5-6 sekaligus", "Tumpang tindih: sangat lebar", "Sebagian rentang: nyaris tanpa tumpang tindih", "Permukaan kendali: belum dipetakan"],
    jajak: [
      {
        q: "Aksi kontrol yang terasa lemah saat error besar paling mungkin disebabkan oleh...",
        opts: [
          "Terlalu banyak aturan aktif bersamaan dengan kesimpulan berlawanan sehingga saling menetralkan pada defuzzifikasi",
          "Jumlah aturan yang terlalu sedikit",
          "Pusat himpunan keluaran yang terlalu besar",
          "Operasi minimum yang keliru dipakai",
        ],
        jawab: 0,
        benar: "Tepat. Defuzzifikasi rata-rata berbobot menjumlahkan seluruh sumbangan; aturan yang menarik ke arah berlawanan mengecilkan pembilang sementara penyebutnya tetap membesar, sehingga keluarannya menyusut.",
        salah: "Perhatikan gejalanya muncul justru saat banyak aturan aktif. Menambah aturan atau memperbesar pusat keluaran tidak menyentuh sebabnya.",
      },
      {
        q: "Keluaran yang melompat meskipun masukan berubah sedikit menandakan...",
        opts: [
          "Operasi minimum harus diganti perkalian",
          "Tumpang tindih yang terlalu kecil sehingga perpindahan antaraturan tidak mulus",
          "Basis aturan yang tidak konsisten",
          "Defuzzifikasi yang salah metode",
        ],
        jawab: 1,
        benar: "Tepat. Bila dua himpunan bersebelahan nyaris tidak bertumpang tindih, keanggotaan berpindah hampir seketika dari satu aturan ke aturan lain, dan keluarannya ikut melompat.",
        salah: "Gejala melompat berkaitan dengan bagaimana keanggotaan berpindah antarhimpunan, bukan dengan metode inferensi atau defuzzifikasinya.",
      },
      {
        q: "Pemeriksaan yang paling murah dan paling cepat menampakkan kedua persoalan ini adalah...",
        opts: [
          "Menjalankan controller di perangkat selama seminggu",
          "Menambah jumlah istilah pada tiap masukan",
          "Memetakan permukaan kendali terhadap kedua masukan",
          "Mengganti seluruh fungsi keanggotaan menjadi trapesium",
        ],
        jawab: 2,
        benar: "Tepat. Permukaan yang datar luas menandakan aksi yang saling menetralkan, sedangkan tebing tajam menandakan tumpang tindih yang terlalu kecil. Keduanya terlihat sekaligus, jauh sebelum controller menyentuh perangkat.",
        salah: "Menjalankan di perangkat mahal dan lambat, sedangkan mengubah himpunan tanpa mengetahui bentuk permukaannya berarti menebak. Pemetaan permukaan menampakkan kedua gejala sekaligus.",
      },
    ],
    diskusi: [
      {
        q: "Jelaskan secara perhitungan mengapa aturan yang berlawanan melemahkan aksi kontrol",
        petunjuk: "1) Tuliskan rumus defuzzifikasi rata-rata berbobot. 2) Susun contoh dengan dua aturan berlawanan aktif dan hitung keluarannya. 3) Bandingkan dengan keadaan hanya satu aturan aktif. 4) Jelaskan peran penyebut yang tetap membesar meskipun pembilang saling meniadakan.",
      },
      {
        q: "Tentukan tumpang tindih yang wajar beserta alasannya",
        petunjuk: "1) Jelaskan akibat tumpang tindih yang terlalu kecil pada kemulusan keluaran. 2) Jelaskan akibat yang terlalu besar pada kekuatan aksi. 3) Usulkan pedoman praktis, misalnya berapa banyak himpunan yang boleh aktif serentak. 4) Jelaskan cara memeriksanya tanpa menyentuh perangkat.",
      },
      {
        q: "Susun prosedur peninjauan basis aturan bersama operator",
        petunjuk: "1) Tentukan cara memeriksa kelengkapan seluruh kombinasi masukan. 2) Tentukan cara memeriksa konsistensi antaraturan. 3) Tentukan bagaimana permukaan kendali dipakai sebagai bahan diskusi dengan operator. 4) Tentukan kriteria kapan basis aturan dinyatakan siap diuji di perangkat.",
      },
    ],
  },

  14: {
    judul: "Pencarian yang Menemukan Celah Model",
    eyebrow: "Forum Diskusi · Pertemuan 14 · Algoritma Genetika",
    ringkas: "Algoritma menemukan parameter dengan nilai tujuan terbaik yang pernah dicapai, dan hasilnya tidak dapat dipakai. Cari sebabnya.",
    narasi: [
      "Tim memakai algoritma genetika untuk menyetel PID sebuah loop posisi. Fungsi tujuannya <strong>integral galat mutlak dikali waktu</strong> yang dihitung dari simulasi, dan pencarian dijalankan 60 generasi dengan populasi 40.",
      "Hasilnya mengesankan di layar: nilai tujuan turun jauh di bawah seluruh penyetelan manual yang pernah dicoba, dan grafik responsnya nyaris tanpa galat. Namun ketika parameter itu dipasang, sistem <strong style=\"color:var(--pink)\">bergetar keras</strong> dan segera dimatikan operator.",
      "Peninjauan menemukan parameter pemenang memiliki <strong style=\"color:var(--amber)\">Kd sangat besar</strong>, dan model simulasi yang dipakai menilai <strong>tidak memuat batas actuator maupun derau sensor</strong>. Di dalam model, aksi turunan sebesar itu memang menghasilkan galat yang mendekati nol.",
    ],
    chip: ["Populasi 40, 60 generasi", "Fungsi tujuan: ITAE saja", "Model: tanpa batas actuator", "Kd pemenang: sangat besar"],
    jajak: [
      {
        q: "Penyebab pokok kegagalan ini adalah...",
        opts: [
          "Jumlah generasi terlalu sedikit",
          "Fungsi tujuan hanya menghukum galat, sehingga usaha kontrol dan penguatan derau tidak pernah dinilai",
          "Ukuran populasi terlalu kecil",
          "Laju mutasi terlalu besar",
        ],
        jawab: 1,
        benar: "Tepat. Algoritma mengejar fungsi tujuan secara harfiah termasuk celahnya. Aspek yang tidak dihukum akan diabaikan sepenuhnya, dan di sini yang tidak dihukum justru yang merusak perangkat.",
        salah: "Menambah generasi atau populasi hanya membuat algoritma menemukan celah yang sama dengan lebih baik. Persoalannya pada apa yang dinilai, bukan pada seberapa keras mencarinya.",
      },
      {
        q: "Model yang tidak memuat batas actuator berakibat algoritma...",
        opts: [
          "Gagal konvergen",
          "Menemukan penyelesaian yang lebih konservatif",
          "Secara sistematis mengejar celah model itu, karena di dalam model aksi tak terbatas memang memberi galat terkecil",
          "Menghasilkan hasil yang sama dengan penyetelan manual",
        ],
        jawab: 2,
        benar: "Tepat, dan inilah yang membuat pencarian otomatis lebih berbahaya daripada penyetelan tangan: manusia biasanya berhenti pada nilai yang terasa wajar, sedangkan algoritma tidak punya rasa itu.",
        salah: "Justru sebaliknya. Karena di dalam model tidak ada yang menghukum aksi besar, algoritma akan terus mendorong ke arah itu selama nilai tujuannya membaik.",
      },
      {
        q: "Perbaikan yang paling tepat didahulukan adalah...",
        opts: [
          "Memperbaiki fungsi tujuan dan model, lalu mengulang pencarian",
          "Menurunkan Kd pemenang secara manual sampai getarannya hilang",
          "Menambah jumlah generasi",
          "Mengganti algoritma dengan metode berbasis gradien",
        ],
        jawab: 0,
        benar: "Tepat. Menurunkan Kd secara manual memang menghilangkan gejala, tetapi hasil pencarian berikutnya akan mengulangi kesalahan yang sama karena kriteria penilaiannya belum diperbaiki.",
        salah: "Menambal hasil satu kali jalan tidak memperbaiki proses yang menghasilkannya. Selama fungsi tujuan dan modelnya belum menghukum aksi berlebihan, pencarian berikutnya akan menemukan celah yang sama.",
      },
    ],
    diskusi: [
      {
        q: "Susun ulang fungsi tujuan yang seharusnya dipakai beserta alasan tiap sukunya",
        petunjuk: "1) Sebutkan suku galat yang dipakai dan alasan memilihnya. 2) Tambahkan suku usaha kontrol beserta cara menghitungnya. 3) Tambahkan penanganan pelanggaran batas keras dan jelaskan mengapa berbeda dari sekadar hukuman berbobot. 4) Jelaskan cara menentukan bobot antarsuku.",
      },
      {
        q: "Tentukan perbaikan model yang wajib dilakukan sebelum pencarian diulang",
        petunjuk: "1) Sebutkan unsur nonlinier yang wajib dimodelkan beserta alasannya. 2) Jelaskan cara memodelkan derau sensor dan pengaruhnya pada aksi turunan. 3) Tentukan cara memverifikasi model sudah cukup mewakili. 4) Jelaskan hubungan antara kualitas model dan kualitas hasil pencarian.",
      },
      {
        q: "Rancang prosedur pelaporan hasil pencarian yang layak dipercaya",
        petunjuk: "1) Tentukan berapa kali pencarian dijalankan dan mengapa satu kali tidak memadai. 2) Tentukan apa yang dilaporkan selain nilai terbaik. 3) Tentukan pemeriksaan yang wajib dilalui kandidat pemenang sebelum dipasang. 4) Tentukan bukti yang harus menyertai laporan agar dapat diverifikasi orang lain.",
      },
    ],
  },
};

export default FORUM;
