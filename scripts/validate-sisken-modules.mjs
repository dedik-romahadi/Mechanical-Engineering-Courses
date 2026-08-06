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
const hitung = (teks, jarum) => teks.split(jarum).length - 1;

for (let n = 1; n <= 14; n += 1) {
  const file = path.join(root, "Sistem-Kendali-Cerdas", "Modul", `Modul-${n}.html`);
  const html = fs.readFileSync(file, "utf8");

  const checks = [
    [!html.match(/pengalaman pribadi/gi), "no personal assessment copy"],
    [html.includes('id="visitorTableBody" style="max-height:min(72vh,820px);overflow-y:auto;"'), "tall responsive student list"],
    [(html.match(/<span class="nav-brand">/g) || []).length === 1 && html.includes(`<span>SISKENCERDAS // M${n}</span></span>`), "clean module navigation brand"],
    [html.includes("overflow-y:auto!important;overscroll-behavior:contain"), "scroll-safe login overlays"],
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
      [!html.match(/Tugas Pertemuan|10 soal pilihan/gi), "no legacy assessment copy"],
      [html.includes(`id="sisken-module-${n}"`), "rich module root"],
      [(html.match(/class="sisken-tab(?: active)?"/g) || []).length === 6, "six content tabs"],
      [(html.match(/data-sisken-pane=/g) || []).length === 6, "six content panes"],
      [(html.match(/class="code-wrap/g) || []).length === 1, "one visible Python code panel"],
      [html.includes("class=\"code-dots\"") && html.includes("class=\"code-copy\""), "reference code-panel design"],
      [(html.match(/id="sisken-rich-runtime"/g) || []).length === 1, "one runtime"],
      [html.includes("Asesmen Teknis") && html.includes("Implementasi Python"), "technical assignment panel"],
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
