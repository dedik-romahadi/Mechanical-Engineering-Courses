/**
 * Data rekaman layar Praktik Terbimbing (Bagian 09) tiap modul CAD.
 * Dibaca scripts/video-praktik.mjs (pemasang) dan scripts/validate-public-security.mjs (validator).
 *
 * `narasi: true` = video bernarasi suara (Edge TTS id-ID-ArdiNeural) + caption; catatan panel menyesuaikan.
 * `bab` = [label, detik mulai]; waktu mengikuti komposisi Remotion (repo video terpisah,
 * C:\Video-Remotion, komposisi PraktikModul<N>). Berkas MP4 + poster JPG berada di
 * Pemodelan-Computer-Aided-Design/Video/ dan ikut tersebar lewat rsync folder kursus di deploy-slides.yml.
 */
export const KURSUS = "Pemodelan-Computer-Aided-Design";

export const VIDEO_PRAKTIK = [
  {
    modul: 1,
    berkas: "Modul-1-Praktik-Pelat-Berlubang.mp4",
    poster: "Modul-1-Praktik-Pelat-Berlubang.jpg",
    judul: "Pelat Berlubang",
    durasi: "3:43",
    narasi: true, // 21 Okt 2026: versi bernarasi (komposisi PraktikModul1Narasi)
    bab: [
      ["1 · Siapkan dokumen", 4],
      ["2 · Bidang kerja", 37.1],
      ["3 · Pelat", 52.1],
      ["4 · Lubang", 91.8],
      ["5 · Cut", 130.8],
      ["6 · Baca luas", 180.8],
      ["7 · Simpan", 200.2],
    ],
  },
  {
    modul: 2,
    berkas: "Modul-2-Praktik-Flens-Delapan-Baut.mp4",
    poster: "Modul-2-Praktik-Flens-Delapan-Baut.jpg",
    judul: "Flens Pelat Delapan Baut",
    durasi: "9:04",
    narasi: true, // 21 Okt 2026: versi bernarasi (komposisi PraktikModul2Narasi)
    bab: [
      ["1 · Dokumen dan layer", 4],
      ["2 · Acuan konstruksi", 115.8],
      ["3 · Lubang baut", 189.4],
      ["4 · Kontur flens", 236],
      ["5 · Potong", 279.7],
      ["6 · Dimensi", 329.3],
      ["7 · Simpan", 516],
    ],
  },
  {
    modul: 3,
    berkas: "Modul-3-Praktik-Panel-Heksagon.mp4",
    poster: "Modul-3-Praktik-Panel-Heksagon.jpg",
    judul: "Panel Heksagon dengan Tiga Transformasi",
    durasi: "6:55",
    narasi: true, // 21 Okt 2026: versi bernarasi (komposisi PraktikModul3Narasi)
    bab: [
      ["1 · Dokumen, layer, dan panel", 4],
      ["2 · Heksagon induk", 117.5],
      ["3 · Salin dengan Move", 160.5],
      ["4 · Putar", 216.3],
      ["5 · Skala", 301.6],
      ["6 · Periksa BoundBox", 369.1],
      ["7 · Simpan", 391.3],
    ],
  },
  {
    modul: 4,
    berkas: "Modul-4-Praktik-Gambar-Kerja-Pelat.mp4",
    poster: "Modul-4-Praktik-Gambar-Kerja-Pelat.jpg",
    judul: "Gambar Kerja Pelat Berpinggul",
    durasi: "13:51",
    narasi: true, // 21 Okt 2026: versi bernarasi (komposisi PraktikModul4Narasi)
    bab: [
      ["1 · Dokumen, layer, gaya", 4],
      ["2 · Kontur, lubang, sumbu", 157.6],
      ["3 · Dimensi Draft", 313.9],
      ["4 · Label dan teks", 487.9],
      ["5 · Periksa", 564.8],
      ["6 · Lembar TechDraw", 589.5],
      ["7 · Simpan dan ekspor", 796.9],
    ],
  },
  {
    modul: 6,
    berkas: "Modul-6-Praktik-Balok-Bertingkat.mp4",
    poster: "Modul-6-Praktik-Balok-Bertingkat.jpg",
    judul: "Gambar Kerja Balok Bertingkat",
    durasi: "13:04",
    narasi: true, // 21 Okt 2026: versi bernarasi (komposisi PraktikModul6Narasi)
    bab: [
      ["1 · Model balok", 4],
      ["2 · Pandangan dan kamera", 251.4],
      ["3 · Lembar dan Projection Group", 280.9],
      ["4 · Isometrik padat", 371.6],
      ["5 · Section View A-A", 467.6],
      ["6 · Kepala gambar dan dimensi", 522.8],
      ["7 · Bacaan, simpan, ekspor", 713.2],
    ],
  },
  {
    modul: 5,
    berkas: "Modul-5-Praktik-Braket-L.mp4",
    poster: "Modul-5-Praktik-Braket-L.jpg",
    judul: "Braket L Tiga Dimensi",
    durasi: "7:59",
    narasi: true, // 21 Okt 2026: versi bernarasi (komposisi PraktikModul5Narasi)
    bab: [
      ["1 · Body dan sketsa", 4],
      ["2 · Pad", 118],
      ["3 · Lubang", 154.1],
      ["4 · Fillet dalam", 309.5],
      ["5 · Chamfer luar", 350.7],
      ["6 · Ubah parameter", 383.6],
      ["7 · Massa dan simpan", 444.7],
    ],
  },
  {
    modul: 7,
    berkas: "Modul-7-Praktik-Braket-Flens.mp4",
    poster: "Modul-7-Praktik-Braket-Flens.jpg",
    judul: "Braket Flens dengan Pola Lubang dan Link Boss",
    durasi: "11:56",
    narasi: true, // 21 Okt 2026: versi bernarasi (komposisi PraktikModul7Narasi)
    bab: [
      ["1 · Body Flens", 4],
      ["2 · Lubang pusat", 103],
      ["3 · Lubang baut dan Polar Pattern", 184],
      ["4 · Boss sekali saja", 323.8],
      ["5 · Link boss ×2", 431.9],
      ["6 · Part container dan rakitan", 560.9],
      ["7 · Periksa dan simpan", 647.5],
    ],
  },
  {
    modul: 8,
    berkas: "Modul-8-Praktik-Kantilever-FEM.mp4",
    poster: "Modul-8-Praktik-Kantilever-FEM.jpg",
    judul: "Kantilever Statik, Termal, dan Frekuensi",
    durasi: "11:45",
    narasi: true, // 21 Okt 2026: versi bernarasi (komposisi PraktikModul8Narasi)
    bab: [
      ["1 · Geometri dan massa", 4],
      ["2 · Analysis dan material", 66.7],
      ["3 · Tumpuan dan beban", 115.7],
      ["4 · Mesh Gmsh", 193.1],
      ["5 · Solver statik", 230.2],
      ["6 · Validasi dan konvergensi", 296.9],
      ["7 · Termal", 485.7],
      ["7 · Frekuensi dan simpan", 621.9],
    ],
  },
  {
    modul: 9,
    berkas: "Modul-9-Praktik-Pelat-Berlubang-FEM.mp4",
    poster: "Modul-9-Praktik-Pelat-Berlubang-FEM.jpg",
    judul: "Pelat Berlubang Tarik",
    durasi: "11:24",
    narasi: true, // 21 Okt 2026: versi bernarasi (komposisi PraktikModul9Narasi)
    bab: [
      ["1 · Model pelat", 4],
      ["2 · Analysis dan material", 194.3],
      ["3 · Tumpuan dan beban", 232],
      ["4 · Mesh awal dan solver", 296.5],
      ["5 · Membaca hasil", 357.9],
      ["6 · Konvergensi", 406.2],
      ["7 · Kesimpulan dan simpan", 586.9],
    ],
  },
  {
    modul: 10,
    berkas: "Modul-10-Praktik-Braket-Iteratif.mp4",
    poster: "Modul-10-Praktik-Braket-Iteratif.jpg",
    judul: "Optimasi Braket L Berbasis Spreadsheet",
    durasi: "37:05",
    narasi: true, // 21 Okt 2026: versi bernarasi (komposisi PraktikModul10Narasi)
    bab: [
      ["1 · Parameter Spreadsheet", 4],
      ["1 · Model parametrik", 97.9],
      ["2 · FEM iterasi 0", 456.3],
      ["3 · Fillet daerah kritis", 693],
      ["4 · Rusuk untuk kekakuan", 831.5],
      ["4 · Singularitas dan fillet rusuk", 1141.4],
      ["5 · Pengurangan massa", 1423.5],
      ["6 · Alternatif material", 1754.4],
      ["7 · Tabel iterasi dan simpan", 1954.4],
    ],
  },
  {
    modul: 11,
    berkas: "Modul-11-Praktik-Rakitan-Engkol-Peluncur.mp4",
    poster: "Modul-11-Praktik-Rakitan-Engkol-Peluncur.jpg",
    judul: "Rakitan Engkol-Peluncur",
    durasi: "19:36",
    narasi: true, // 21 Okt 2026: versi bernarasi (komposisi PraktikModul11Narasi)
    bab: [
      ["1 · Dasar beralur rel", 4],
      ["1 · Engkol, batang, peluncur", 157.8],
      ["2 · Rakitan dan acuan", 459.7],
      ["3 · Joint engkol", 524.2],
      ["4 · Joint batang dan peluncur", 574.2],
      ["5 · Kunci dan ukur", 697.1],
      ["6 · Titik mati dan tabrakan", 752.2],
      ["7 · BOM dan gambar rakitan", 841.4],
      ["7 · Massa dan simpan", 1088.5],
    ],
  },
  {
    modul: 12,
    berkas: "Modul-12-Praktik-Audit-Dokumen.mp4",
    poster: "Modul-12-Praktik-Audit-Dokumen.jpg",
    judul: "Audit Satu Dokumen dari Fit sampai Gerak",
    durasi: "17:20",
    narasi: true, // 21 Okt 2026: versi bernarasi (komposisi PraktikModul12Narasi)
    bab: [
      ["1–2 · Tabrakan A–B", 4],
      ["3 · Perbaiki lalu verifikasi", 128.9],
      ["4 · Fit ekstrem ⌀12 H7/g6", 196.9],
      ["5 · Rumah berdinding tipis", 392.3],
      ["6 · Slot dan jarak tepi", 608.6],
      ["7 · Jarak bebas gerak", 801],
      ["7 · Check Geometry dan simpan", 980.2],
    ],
  },
  {
    modul: 13,
    berkas: "Modul-13-Praktik-Housing-Jejak.mp4",
    poster: "Modul-13-Praktik-Housing-Jejak.jpg",
    judul: "Housing Ringan Berlabel Jejak",
    durasi: "11:11",
    narasi: true, // 21 Okt 2026: versi bernarasi (komposisi PraktikModul13Narasi)
    bab: [
      ["1 · Body housing dan Spreadsheet", 4],
      ["2 · Massa pejal", 148],
      ["3 · Cangkang Thickness", 182],
      ["4 · Sapuan tebal dinding", 255.7],
      ["5 · Neraca jejak", 375.1],
      ["6 · Alternatif material", 489.2],
      ["7 · Dokumentasi dan simpan", 617.9],
    ],
  },
  {
    modul: 14,
    berkas: "Modul-14-Praktik-Lengan-Braket.mp4",
    poster: "Modul-14-Praktik-Lengan-Braket.jpg",
    judul: "Optimasi Lengan Braket dari Rumusan sampai Laporan",
    durasi: "23:37",
    narasi: true, // 21 Okt 2026: versi bernarasi (komposisi PraktikModul14Narasi)
    bab: [
      ["1 · Rumuskan masalahnya", 4],
      ["2 · Model parametrik", 242.3],
      ["3 · Tinggi dari kendala", 362.6],
      ["4 · Sapu parameter", 470.4],
      ["5 · Bandingkan alternatif", 527.6],
      ["6 · Matriks keputusan", 611.7],
      ["7 · Desain pemenang (profil I)", 803.6],
      ["8 · Gambar kerja sudut ketiga", 1068.5],
    ],
  },
];
