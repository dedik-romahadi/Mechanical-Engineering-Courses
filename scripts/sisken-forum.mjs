// Data forum diskusi Modul 2-14 Sistem Kendali Cerdas.
//
// Modul 1 tidak ada di sini — halaman forumnya ditulis tangan dan dilewati
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
        benar: "Tepat. Saat actuator mentok, keluaran controller tidak lagi berpengaruh. Aksi integral yang terus menumpuk selama itu akan membuat keluaran melewati setpoint jauh melebihi perkiraan — persis 12 derajat yang dilaporkan operator.",
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
        petunjuk: "(1) Nyatakan overshoot, waktu menetap, dan error tunak dalam angka bersatuan. (2) Sebutkan batas actuator dan rentang sensor. (3) Tentukan kondisi operasi mana yang dipakai sebagai acuan pengujian — beban ringan atau beban penuh?",
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
};

export default FORUM;
