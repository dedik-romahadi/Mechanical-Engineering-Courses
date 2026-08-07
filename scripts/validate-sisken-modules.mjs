import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const failures = [];

// Modul 1 ditulis tangan mengikuti Modul 1 Getaran Mekanik, bukan hasil
// generator sisken-rich. Jadi strukturnya diuji dengan membandingkan langsung
// ke modul acuan itu, sementara Modul 2-14 tetap diuji sebagai keluaran
// generator. Penanda yang berlaku untuk semua modul diuji terpisah di bawah.
const REFERENSI = path.join(root, "Getaran-Mekanik", "Modul", "Modul-1.html");
const PENANDA_STRUKTUR = [
  ['id="page-modul"', "halaman modul"],
  ['id="page-tugas"', "halaman tugas"],
  ['id="page-forum"', "halaman forum"],
  ['class="hero"', "kartu hero"],
  ["anim-panel", "panel animasi"],
  ["code-wrap", "panel kode"],
  ["data-tab=", "tab konten"],
];
// Penanda dihitung pada markup saja. Blok gaya juga menyebut nama kelas
// seperti .anim-panel dan .code-wrap, sehingga ikut terhitung dan membuat
// perbandingan terhadap modul acuan meleset begitu ada aturan gaya baru.
const tanpaGaya = (teks) => teks.replace(/<style[\s\S]*?<\/style>/g, "");
const hitung = (teks, jarum) => tanpaGaya(teks).split(jarum).length - 1;

for (let n = 1; n <= 14; n += 1) {
  const file = path.join(root, "Sistem-Kendali-Cerdas", "Modul", `Modul-${n}.html`);
  const html = fs.readFileSync(file, "utf8");

  const checks = [
    [!html.match(/pengalaman pribadi/gi), "no personal assessment copy"],
    [html.includes('id="visitorTableBody" style="max-height:min(72vh,820px);overflow-y:auto;"'), "tall responsive student list"],
    [(html.match(/<span class="nav-brand">/g) || []).length === 1 && html.includes(`<span>SISKENCERDAS // M${n}</span></span>`), "clean module navigation brand"],
    [html.includes("overflow-y:auto!important;overscroll-behavior:contain"), "scroll-safe login overlays"],
    // Repo ini publik. Penilaian sisken sepenuhnya di server (checkModulAnswer),
    // jadi kunci jawaban tidak boleh ikut ke HTML. runAndCheck harus dipanggil
    // dengan qId saja — bentuk lama runAndCheck('c1', 2.6, 0.005) milik modul
    // Getaran membocorkan jawaban beserta toleransinya.
    // Argumen kedua yang sah hanyalah label kesulitan ('easy'/'hard'); argumen
    // berupa angka berarti jawaban dan toleransi ikut terkirim ke peramban.
    [!/runAndCheck\('[^']+'\s*,\s*-?[\d.]/.test(html), "runAndCheck tanpa kunci jawaban"],
    [!/(MC_HINTS|COMP_HINTS)\s*=/.test(html), "tanpa tabel kunci jawaban di HTML"],
    [/\.cards\{[^}]*margin:16px 0 24px[^}]*\}/.test(html), "jarak di bawah .cards"],
    [/\.tbl-wrap\{[^}]*margin:16px 0 24px[^}]*\}/.test(html), "jarak di bawah .tbl-wrap"],
    [!html.includes("\u0000"), "tanpa token placeholder yang belum dipulihkan"],
  ];

  if (n === 1) {
    const acuan = fs.readFileSync(REFERENSI, "utf8");
    for (const [jarum, label] of PENANDA_STRUKTUR) {
      const ada = hitung(html, jarum);
      const harus = hitung(acuan, jarum);
      checks.push([ada === harus, `${label}: ${ada} penanda, Modul 1 Getaran punya ${harus}`]);
    }
  } else {
    checks.push(
      // Frasa "Tugas Pertemuan" dan "10 soal pilihan ganda" dahulu dianggap
      // sisa salinan lama. Sejak halaman Tugas mengikuti Modul 1, keduanya
      // justru ada di sana, jadi yang diperiksa kini strukturnya.
      [/<div class="hero" data-tab="tugas">/.test(html), "hero halaman Tugas seperti Modul 1"],
      // Sejak modul 2-14 memakai tata letak Modul 1, yang diperiksa adalah
      // kosakata desainnya: hero, bagian bernomor, dan tidak adanya halaman
      // yang khusus milik Modul 1.
      [!/id="(tab|page)-(setup|kelompok)"/.test(html), "tanpa tab Setup Python dan Pembagian Kelompok"],
      [(html.match(/<style[^>]*>/g) || []).some((_, i, a) => a.length >= 4)
        && /:root\s*\{[^}]*--bg:/.test(html), "blok gaya utama utuh"],
      [html.includes('<div class="hero" data-tab="modul">'), "hero seperti Modul 1"],
      [(html.match(/<div class="section-label reveal">Bagian \d\d<\/div>/g) || []).length >= 10, "bagian bernomor minimal 10"],
      [(() => {
        // Dihitung hanya di dalam halaman modul; halaman lain pada berkas yang
        // sama juga memakai kelas .section untuk keperluannya sendiri.
        const blok = html.match(/<div class="page active" id="page-modul">[\s\S]*?<!-- end page-modul -->/);
        if (!blok) return false;
        const pemisah = (blok[0].match(/<hr class="divider">/g) || []).length;
        const bagian = (blok[0].match(/<div class="section" id="m-\d+">/g) || []).length;
        return pemisah === bagian && pemisah >= 10;
      })(), "tiap bagian didahului pemisah"],
      [(html.match(/<footer>/g) || []).length >= 1, "footer seperti Modul 1"],
      [(html.match(/class="code-wrap/g) || []).length === 3, "tiga panel kode Python"],
      [html.includes("class=\"code-dots\"") && html.includes("class=\"code-copy\""), "reference code-panel design"],
      [(html.match(/id="sisken-rich-runtime"/g) || []).length === 1, "one runtime"],
      // Halaman tugas ada dalam dua keadaan sah: panel generik (belum ada soal)
      // atau 25 soal sungguhan yang dibangun dari repo backend.
      [
        (html.includes("Asesmen Teknis") && html.includes("Implementasi Python"))
        || ((html.match(/id="rg-mc\d+"/g) || []).length === 10 && (html.match(/onclick="runAndCheck\('c\d+'[^"]*\)"/g) || []).length === 15),
        "technical assignment panel atau 25 soal lengkap",
      ],
    );
  }

  for (const [ok, label] of checks) if (!ok) failures.push(`Modul-${n}: ${label}`);

  const runtime = html.match(/<script id="sisken-rich-runtime">([\s\S]*?)<\/script>/)?.[1];
  if (runtime) {
    try { new vm.Script(runtime, { filename: `Modul-${n}:sisken-rich-runtime` }); }
    catch (error) { failures.push(`Modul-${n}: runtime syntax — ${error.message}`); }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Validated 14 Sisken modules: Modul 1 mirrors Getaran Modul 1; Modul 2-14 content tabs, code panels, tasks, and runtime syntax.");
