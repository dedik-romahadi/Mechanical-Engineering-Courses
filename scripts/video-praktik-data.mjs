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
