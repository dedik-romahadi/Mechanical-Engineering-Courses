/**
 * Data video penjelasan simulasi (Bagian 07 Animasi + Python) modul Teknik Tenaga Listrik.
 * Dibaca scripts/video-simulasi.mjs (pemasang) dan scripts/validate-public-security.mjs (validator).
 *
 * `bab` = [label, detik mulai]; waktu mengikuti komposisi Remotion (repo video terpisah,
 * C:\Video-Remotion, komposisi SimulasiTTL<N>). Berkas MP4 + poster JPG + halaman tonton publik
 * (`halaman`, tanpa login, tujuan tombol Bagikan) berada di Teknik-Tenaga-Listrik/Video/ dan ikut
 * tersebar lewat rsync folder kursus di deploy-slides.yml.
 */
export const KURSUS = "Teknik-Tenaga-Listrik";
export const COURSE_ID = "teknik_tenaga_listrik";
export const SITUS = "https://dedik-romahadi.github.io/Mechanical-Engineering-Courses";

export const VIDEO_SIMULASI = [
  {
    modul: 1,
    berkas: "Modul-1-Simulasi-Konsep-Dasar.mp4",
    poster: "Modul-1-Simulasi-Konsep-Dasar.jpg",
    halaman: "Modul-1-Simulasi.html",
    judul: "Konsep Dasar Sistem Tenaga Listrik",
    durasi: "10:58",
    ringkas: "Lima animasi interaktif dan empat cell Python Modul 1: efisiensi berantai, rugi saluran, tiga fasa, kurva beban, dan generator sinkron.",
    bab: [
      ["1 · Pembuka", 4],
      ["2 · Besaran dasar (Cell 1)", 40.5],
      ["3 · Efisiensi berantai", 91.9],
      ["4 · Rugi saluran", 208.9],
      ["5 · Tiga fasa", 348.0],
      ["6 · Kurva beban", 425.0],
      ["7 · Generator sinkron", 538.7],
    ],
  },
];
