/**
 * Data rekaman layar Praktik Terbimbing (Bagian 09) tiap modul CAD.
 * Dibaca scripts/video-praktik.mjs (pemasang) dan scripts/validate-public-security.mjs (validator).
 *
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
    durasi: "1:43",
    bab: [
      ["1–2 · Dokumen dan bidang kerja", 4],
      ["3 · Pelat", 15.4],
      ["4 · Lubang", 30.6],
      ["5 · Cut", 55.9],
      ["6–7 · Luas dan simpan", 80.2],
    ],
  },
  {
    modul: 2,
    berkas: "Modul-2-Praktik-Flens-Delapan-Baut.mp4",
    poster: "Modul-2-Praktik-Flens-Delapan-Baut.jpg",
    judul: "Flens Pelat Delapan Baut",
    durasi: "4:56",
    bab: [
      ["1 · Dokumen dan bidang kerja", 4],
      ["2 · Layer", 15.7],
      ["3 · Garis konstruksi", 31.2],
      ["4 · Kontur flens", 71.7],
      ["5 · Lubang baut dan Polar Array", 111.5],
      ["6 · Cut dan luas", 134.3],
      ["7 · Dimensi", 173.5],
      ["7 · Sudut, layer, simpan", 220.8],
      ["7 · Rapikan dimensi", 280.8],
    ],
  },
  {
    modul: 3,
    berkas: "Modul-3-Praktik-Panel-Heksagon.mp4",
    poster: "Modul-3-Praktik-Panel-Heksagon.jpg",
    judul: "Panel Heksagon dengan Tiga Transformasi",
    durasi: "2:51",
    bab: [
      ["1 · Dokumen dan panel", 4],
      ["2 · Heksagon induk", 26.9],
      ["3 · Salin dengan Move", 41.2],
      ["4 · Putar salinan", 70.5],
      ["5 · Skala salinan", 103.7],
      ["6 · Ukur dan periksa", 142.7],
      ["7 · Simpan", 154.5],
    ],
  },
  {
    modul: 4,
    berkas: "Modul-4-Praktik-Gambar-Kerja-Pelat.mp4",
    poster: "Modul-4-Praktik-Gambar-Kerja-Pelat.jpg",
    judul: "Gambar Kerja Pelat Berpinggul",
    durasi: "4:39",
    bab: [
      ["1 · Dokumen, layer, gaya", 4],
      ["2 · Kontur dan lubang", 39.6],
      ["3 · Dimensi ukuran", 92.8],
      ["4 · Teks dan label", 165.1],
      ["4 · Rapikan letak", 217.4],
      ["5–6 · Periksa dan TechDraw", 224.9],
      ["7 · Simpan dan ekspor", 253.8],
    ],
  },
  {
    modul: 6,
    berkas: "Modul-6-Praktik-Balok-Bertingkat.mp4",
    poster: "Modul-6-Praktik-Balok-Bertingkat.jpg",
    judul: "Gambar Kerja Balok Bertingkat",
    durasi: "4:31",
    bab: [
      ["1 · Model balok", 4],
      ["2 · Pandangan dan kamera", 80.5],
      ["3–4 · Lembar dan Projection Group", 104.7],
      ["5–6 · Potongan dan dimensi", 142.7],
      ["6 · Rapikan letak", 189.3],
      ["7 · Bacaan dan simpan", 225.1],
    ],
  },
  {
    modul: 5,
    berkas: "Modul-5-Praktik-Braket-L.mp4",
    poster: "Modul-5-Praktik-Braket-L.jpg",
    judul: "Braket L Tiga Dimensi",
    durasi: "5:05",
    bab: [
      ["1 · Body dan profil L", 4],
      ["2 · Pad", 61.5],
      ["3 · Lubang", 93.8],
      ["4 · Fillet", 161.2],
      ["5 · Chamfer", 189.3],
      ["6 · Ubah parameter", 226],
      ["7 · Massa dan simpan", 277.1],
    ],
  },
];
