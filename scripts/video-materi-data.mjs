/**
 * Data video penjelasan MATERI lengkap (Bagian 01 sampai akhir) modul Teknik Tenaga Listrik.
 * Dibaca scripts/video-materi.mjs (pemasang) dan scripts/validate-public-security.mjs (validator).
 *
 * `bab` = [label, detik mulai]; waktu mengikuti komposisi Remotion (repo video terpisah, C:\Video-Remotion,
 * komposisi MateriTTL<N>). Berkas MP4 + poster JPG + halaman tonton publik (`halaman`, tanpa login, tujuan
 * tombol Bagikan) berada di Teknik-Tenaga-Listrik/Video/ dan ikut tersebar lewat rsync folder kursus.
 */
export const KURSUS = "Teknik-Tenaga-Listrik";
export const SITUS = "https://dedik-romahadi.github.io/Mechanical-Engineering-Courses";

export const VIDEO_MATERI = [
  {
    modul: 6,
    berkas: "Modul-6-Materi-Saluran-Transmisi.mp4",
    poster: "Modul-6-Materi-Saluran-Transmisi.jpg",
    halaman: "Modul-6-Materi.html",
    judul: "Aliran Daya dan Transien Saluran Transmisi",
    durasi: "26:38",
    bagianAkhir: "08",
    ringkas: "Penjelasan seluruh materi Modul 6 dari Bagian 01 sampai 08: model saluran, aliran daya dan jatuh tegangan, regulasi dan efisiensi, kompensasi shunt dan seri, gelombang berjalan, lalu animasi dan cell Python.",
    bab: [
      ["Pendahuluan", 4],
      ["Bagian 01 · Model saluran", 40.4],
      ["Bagian 02 · Aliran daya dan jatuh tegangan", 215.3],
      ["Bagian 03 · Regulasi dan efisiensi", 392.6],
      ["Bagian 04 · Kompensasi shunt dan SIL", 555.1],
      ["Bagian 05 · Kompensasi seri", 732.4],
      ["Bagian 06 · Gelombang berjalan", 871.8],
      ["Bagian 07–08 · Animasi dan Python", 1048.1],
    ],
  },
];
