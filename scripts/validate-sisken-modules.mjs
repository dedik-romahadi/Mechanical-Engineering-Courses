import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import { MATERI } from "./sisken-materi.mjs";
import { rumusLatex, tokenLatex } from "./sisken-rumus.mjs";
import { PENJELASAN_RUMUS } from "./sisken-rumus-jelas.mjs";

const root = path.resolve(import.meta.dirname, "..");
const failures = [];
// [nomorModul, inti judul tanpa awalan "Animasi k — "] — diisi per modul,
// diperiksa keunikannya lintas modul setelah loop.
const judulAnimasiSemua = [];

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
const ringkasSpasi = (teks) => teks.replace(/\s+/g, " ").trim();
const antara = (teks, awal, akhir) => {
  const mulai = teks.indexOf(awal);
  const selesai = mulai < 0 ? -1 : teks.indexOf(akhir, mulai + awal.length);
  return mulai < 0 || selesai < 0 ? null : teks.slice(mulai, selesai);
};
const acuanPanelHtml = fs.readFileSync(REFERENSI, "utf8");
const acuanPerilakuPanel = ringkasSpasi(antara(acuanPanelHtml, "function checkExportReady()", "// ── EXPORT TUGAS HTML ──") || "");

for (let n = 1; n <= 14; n += 1) {
  const file = path.join(root, "Sistem-Kendali-Cerdas", "Modul", `Modul-${n}.html`);
  const html = fs.readFileSync(file, "utf8");
  const exportEndMarker = n === 1 ? "// ── FORUM READY CHECK" : "// ── PREPROCESSING ANIMATION HELPERS";
  const exportCode = antara(html, "async function exportTugasHtml()", exportEndMarker) || "";

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
    [!/selectMC\('[^']+',this,'[A-D]'\)/.test(html), "onclick PG tidak membawa huruf kanonik"],
    [html.includes("payload.mcOrderVersion = 1"), "payload PG menandai urutan opsi v1"],
    [html.includes("function _shuffleModulOptions(arr, seed)") && !html.includes("function shuffleMCOptions() { /* no-op"), "shuffle opsi PG aktif"],
    [html.includes("N + modulNum * 101 + qNum * 17"), "formula seed shuffle PG sinkron"],
    [/\.cards\{[^}]*margin:16px 0 24px[^}]*\}/.test(html), "jarak di bawah .cards"],
    [/\.tbl-wrap\{[^}]*margin:16px 0 24px[^}]*\}/.test(html), "jarak di bawah .tbl-wrap"],
    [!html.includes("\u0000"), "tanpa token placeholder yang belum dipulihkan"],
    [(html.match(/id="modern-academic-design"/g) || []).length === 1, "satu blok desain modern academic bersama"],
    [(html.match(/class="formula-block reveal"/g) || []).length >= 5 && html.includes("#page-modul .formula-block:hover{transform:translate3d(5px,-5px,0)"), "seluruh kartu formula memiliki efek hover"],
    [html.includes("#page-modul .formula-block:hover::before{background-position:-40% 0;opacity:1}"), "kilau hover formula tidak memperlebar area scroll"],
    [!/<caption\b[^>]*\sstyle=/.test(html), "caption tabel tanpa style inline lama"],
    [html.includes("caption.removeAttribute('style')"), "runtime menetralkan style inline caption"],
    [(html.match(/class="reference-card"/g) || []).length === 5, "lima kartu daftar pustaka memiliki penanda hover"],
    [html.includes("card.classList.add('reference-card')"), "runtime memulihkan penanda hover pustaka lama"],
    [exportCode.includes("const html = `<!DOCTYPE html>") && exportCode.includes("new Blob([html], { type: 'text/html;charset=utf-8' })") && exportCode.includes("URL.createObjectURL(blob)"), "Export HTML membangun dokumen dan Blob unduhan"],
    [exportCode.includes(`a.download = 'Tugas${n}_' + nim + '_SistemKendaliCerdas.html'`), "nama file Export HTML sesuai nomor tugas"],
    [exportCode.includes("document.body.appendChild(a)") && exportCode.includes("a.remove()") && exportCode.includes("setTimeout(() => URL.revokeObjectURL(url), 1000)"), "download dipicu melalui anchor DOM dan URL dibersihkan setelah aman"],
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
      [/<div class="hero" data-tab="tugas"(?:\s[^>]*)?>/.test(html), "hero halaman Tugas seperti Modul 1"],
      // Sejak modul 2-14 memakai tata letak Modul 1, yang diperiksa adalah
      // kosakata desainnya: hero, bagian bernomor, dan tidak adanya halaman
      // yang khusus milik Modul 1.
      [!/id="(tab|page)-(setup|kelompok)"/.test(html), "tanpa tab Setup Python dan Pembagian Kelompok"],
      [(html.match(/<style[^>]*>/g) || []).some((_, i, a) => a.length >= 4)
        && /:root\s*\{[^}]*--bg:/.test(html), "blok gaya utama utuh"],
      [/<div class="hero(?: [^"]+)?" data-tab="modul"[^>]*>/.test(html), "hero seperti Modul 1"],
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

    // Setiap soal PG WAJIB punya tombol kirimnya sendiri. Pemeriksaan di atas
    // hanya menghitung grup radio, sehingga modul 2-14 sempat lolos padahal
    // seluruh <button id="sub-mcN"> hilang: selectMC() melempar TypeError di
    // baris getElementById('sub-'+qId).disabled sehingga PG tidak bisa dipilih
    // dan 10 poin per modul tak terjangkau. Urutannya juga diperiksa —
    // grup radio, lalu tombol, lalu kotak umpan balik.
    if ((html.match(/id="rg-mc\d+"/g) || []).length === 10) {
      const kurang = [];
      for (let k = 1; k <= 10; k += 1) {
        const adaTombol = new RegExp(`id="sub-mc${k}"[^>]*onclick="checkMC\\('mc${k}'\\)"`).test(html);
        const urutBenar = new RegExp(`id="rg-mc${k}"[\\s\\S]{0,4000}?id="sub-mc${k}"[\\s\\S]{0,300}?id="fb-mc${k}"`).test(html);
        if (!adaTombol || !urutBenar) kurang.push(`mc${k}${adaTombol ? " (urutan)" : ""}`);
      }
      checks.push([kurang.length === 0, `tombol Periksa Jawaban PG hilang/salah urutan: ${kurang.join(", ")}`]);
    }
  }

  if (n === 2) {
    checks.push(
      [html.includes('<body class="modern-academic-design">'), "desain modern academic bersama aktif melalui kelas body"],
      [(html.match(/id="modern-academic-design"/g) || []).length === 1, "satu blok gaya modern academic bersama"],
      [(html.match(/id="modern-academic-runtime"/g) || []).length === 1, "satu runtime modern academic bersama"],
      [html.includes('class="hero academic-hero"') && html.includes('class="academic-roadmap"'), "hero dan alur belajar modern academic"],
      [html.includes('id="readingPosition"') && html.includes("link.classList.toggle('is-current', current)"), "indikator dan navigasi bagian aktif"],
      [html.includes("@media screen{") && html.includes("@media screen and (max-width:700px)") && html.includes("@media(prefers-reduced-motion:reduce)"), "gaya bersama responsif, screen-only, dan reduced-motion"],
      [html.includes("#page-modul .section{--chapter-accent:#22d3ee") && html.includes("#page-modul .academic-hero .hero-content"), "chapter card dan panel hero pilot"],
      [html.includes("#page-modul .section-desc{width:100%;max-width:none"), "paragraf materi mengikuti lebar kontainer tanpa batas karakter"],
      [html.includes("#page-modul .formula-block .formula-main{font-size:clamp(16px,1.5vw,18px)") && html.includes("#page-modul .card .formula{font-size:14.5px;color:#eee7ff"), "persamaan materi lebih besar dan berkontras tinggi"],
      [html.includes("motionTaskHeroArrive") && html.includes("motionChapterScan"), "lapisan animasi Modul dan Tugas"],
      [html.includes("entry.target.classList.toggle('is-in-view', entry.isIntersecting)") && html.includes("@media(prefers-reduced-motion:reduce)"), "animasi bab mengikuti viewport dan menghormati reduced-motion"],
      [html.includes("#page-modul .formula-block::after{content:'';position:absolute;inset:0;") && html.includes("@keyframes motionFormulaSweep{0%,26%{background-position:140% 0"), "kilau persamaan tidak memperlebar area scroll"],
      [html.includes('<caption class="table-caption"><span class="anim-dot" aria-hidden="true"></span><span class="anim-title">Tabel 1 —') && html.includes("#page-modul .tbl-wrap table.academic-data-table .table-caption{caption-side:top"), "caption tabel mengikuti format grafik dan animasi"],
      [html.includes("table.classList.add('academic-data-table')") && html.includes("header.classList.add('equation-column')") && html.includes(".equation-column{width:1%;min-width:180px;overflow-wrap:normal;white-space:nowrap;word-break:normal}"), "format tabel seragam dan kolom rumus mengikuti lebar intrinsik"],
      [html.includes(".table-caption{caption-side:top;box-sizing:border-box;height:50px;max-height:50px") && !html.includes("table.academic-data-table th.equation-column{"), "caption setinggi Modul 2 dan header rumus berukuran normal"],
      [html.includes(".academic-table-wrap{--table-caption-indent:24px;") && (html.match(/padding:0 var\(--table-caption-indent\)/g) || []).length === 2, "indentasi caption mengikuti Modul 1 dan 2 pada semua ukuran layar"],
      [html.includes("#page-modul .reference-card:hover{transform:translate3d(5px,-5px,0)"), "setiap kartu daftar pustaka memiliki efek hover tanpa pembatas jenis pointer"],
    );
    const pilotRuntime = html.match(/<script id="modern-academic-runtime">([\s\S]*?)<\/script>/)?.[1];
    try { new vm.Script(pilotRuntime || "", { filename: "Modul-2:modern-academic-runtime" }); }
    catch (error) { checks.push([false, `runtime modern academic â€” ${error.message}`]); }
  }

  checks.push(
    [(html.match(/id="text-c(?:1[0-5]|[1-9])"/g) || []).length === 15, "15 wadah teks soal parametrik"],
    [(html.match(/id="hint-c(?:1[0-5]|[1-9])"/g) || []).length === 15, "15 wadah hint parametrik"],
    [(html.match(/id="input-c(?:1[0-5]|[1-9])"/g) || []).length === 15, "15 wadah label output parametrik"],
    [html.includes("httpsCallable(_functions, 'getModulQuestions')"), "callable getModulQuestions"],
    [html.includes("window._loadParametricModulQuestions = _loadParametricModulQuestions"), "loader soal parametrik"],
    [html.includes("text.textContent = question.text") && !html.includes("text.innerHTML = question.text"), "render teks server dengan textContent"],
    [!html.includes("Parameter acuan.</strong>"), "parameter numerik tugas lama tidak statis di HTML"],
    [(html.match(/Masuk untuk memuat soal parametrik C(?:1[0-5]|[1-9])/g) || []).length === 15, "placeholder terkunci untuk seluruh komputasi"],
    [(html.match(/id="parametric-modul-note"/g) || []).length === 1, "catatan soal parametrik"],
    [(html.match(/placeholder="Tulis atau paste kode Python Anda, lalu print\(\) hanya nilai akhir yang diminta server\."/g) || []).length === 15, "placeholder kode generik"],
    [!html.includes("Parameter Sistem Referensi (dipakai soal C1–C10)"), "tanpa kotak parameter tugas statis lama"],
    [["scoreDisplay", "scoreDetail", "scoreFill", "scoreMC", "scoreCompEz", "scoreCompHard", "btn-score-export", "export-blocked-msg"].every((id) => html.includes(`id="${id}"`)), "komponen panel skor/export lengkap"],
    [html.includes('<div class="hero" data-tab="tugas" style="min-height:60vh">'), "hero Tugas 60vh agar panel langsung terlihat seperti mata kuliah lain"],
    [!html.includes("const scoreBar = document.querySelector('#page-tugas .score-bar')") && html.includes("window.scrollTo({ top: 0, behavior: 'smooth' })"), "tab Tugas kembali ke hero/top halaman"],
    [html.includes("body{overflow-x:clip!important;overflow-y:visible!important}") && /\.score-bar\{position:sticky;top:64px;/.test(html), "panel sticky memakai viewport scroll utama"],
    [html.includes('class="score-bar score-bar-compact"') && html.includes(".score-bar-compact{border-radius:18px;padding:14px 20px;margin-bottom:32px;gap:14px}"), "panel skor memakai geometri compact"],
    [html.includes(".score-bar-compact{background:linear-gradient(135deg,rgba(42,25,74,.96),rgba(12,43,68,.96));border-color:rgba(192,132,252,.72)"), "warna panel skor kontras dengan latar"],
    [["score-value", "score-breakdown", "score-export-guide", "score-export-icon", "score-export-copy"].every((className) => html.includes(`class="${className}"`)), "bagian panel skor memiliki penanda compact"],
    [html.includes(".score-bar-compact #scoreDisplay{font-size:34px!important}") && html.includes(".score-bar-compact .score-value>div:last-child{font-size:10px!important"), "angka dan label panel skor terbaca"],
    [html.includes(".score-bar-compact .score-title{font-size:11px") && html.includes(".score-bar-compact .score-breakdown{font-size:11px!important"), "judul dan rincian panel skor terbaca"],
    [html.includes(".score-bar-compact .btn-export{padding:9px 16px;min-height:38px;font-size:11px") && html.includes(".score-bar-compact .score-export-copy{font-size:12px!important") && html.includes(".score-bar-compact #export-blocked-msg{font-size:11.5px!important;line-height:1.3}"), "tombol, petunjuk, dan pesan panel skor ringkas serta terbaca"],
    [/<button class="btn-export" id="btn-score-export" onclick="exportTugasHtml\(\)" disabled/.test(html), "Export HTML terkunci sampai tugas lengkap"],
    [["gdrive-link", "gdrive-feedback", "lateAccessBanner"].every((id) => html.includes(`id="${id}"`)), "prasyarat Google Drive dan banner jadwal tersedia"],
    [ringkasSpasi(antara(html, "function checkExportReady()", "// ── EXPORT TUGAS HTML ──") || "") === acuanPerilakuPanel, "perilaku panel skor/export tetap sama dengan Getaran Modul 1"],
  );

  // Uji perilaku panel dengan DOM minimal: keadaan awal harus menampilkan
  // rincian 10/10/5 + Drive dan mengunci Export; setelah seluruh prasyarat
  // dipenuhi tombol harus aktif. Ini menjaga perilaku, bukan sekadar markup.
  {
    const panelCode = antara(html, "function checkExportReady()", "// ── EXPORT TUGAS HTML ──");
    const elements = {
      "gdrive-link": { value: "", style: {} },
      "gdrive-feedback": { textContent: "", style: {} },
      "btn-score-export": { disabled: false, style: {} },
      "export-blocked-msg": { textContent: "", style: {} },
    };
    const sandbox = {
      SCORE_CONFIG: { MC_COUNT: 10, COMP_EZ_COUNT: 10, COMP_HARD_COUNT: 5 },
      mcAnswered: {},
      compAnswered: {},
      document: { getElementById: (id) => elements[id] || null },
      _saveDraft: () => {},
      window: {},
    };
    try {
      vm.createContext(sandbox);
      new vm.Script(panelCode, { filename: `Modul-${n}:score-panel` }).runInContext(sandbox);
      sandbox.checkExportReady();
      const blocked = elements["export-blocked-msg"].textContent;
      checks.push(
        [elements["btn-score-export"].disabled === true, "Export terkunci pada keadaan awal"],
        [blocked.includes("10 soal pilihan ganda belum dijawab") && blocked.includes("10 soal komputasi belum diisi") && blocked.includes("5 soal komputasi Hard belum diisi") && blocked.includes("Link Google Drive belum diisi"), "panel merinci seluruh prasyarat yang belum lengkap"],
      );

      for (let k = 1; k <= 10; k += 1) sandbox.mcAnswered[`mc${k}`] = true;
      for (let k = 1; k <= 15; k += 1) sandbox.compAnswered[`c${k}`] = true;
      elements["gdrive-link"].value = "https://drive.google.com/drive/folders/contoh";
      sandbox.checkExportReady();
      checks.push(
        [elements["btn-score-export"].disabled === false && elements["btn-score-export"].style.opacity === "1", "Export aktif setelah seluruh tugas dan Drive lengkap"],
        [elements["export-blocked-msg"].textContent === "", "pesan penghalang hilang setelah tugas lengkap"],
      );
    } catch (error) {
      checks.push([false, `uji perilaku panel gagal dijalankan: ${error.message}`]);
    }
  }

  // Angka pada hero harus cocok dengan isi halaman. Ketiganya pernah salah di
  // seluruh Modul 2-14 (tertulis 13/1/1 padahal 11/3/3) tanpa satu pun
  // pemeriksa mengeluh. Berlaku juga untuk Modul 1 yang ditulis tangan.
  {
    const markup = tanpaGaya(html);
    const teks = markup.replace(/<[^>]+>/g, " ");
    const klaim = (label) => {
      const m = teks.match(new RegExp(`(\\d+)\\s+${label}`));
      return m ? Number(m[1]) : null;
    };
    // "Bagian NN" = label bagian yang benar-benar tampil pada halaman modul.
    const bagianTampil = new Set(markup.match(/Bagian (\d{2})\b/g) || []).size;
    // Judul animasi ditulis dua kali (anim-title + aria-label kanvas) — kunci
    // ke .anim-title supaya tidak terhitung dobel.
    const animasi = (markup.match(/class="anim-title">Animasi \d+/g) || []).length;
    const python = (markup.match(/class="code-wrap/g) || []).length;
    for (const [label, klaimnya, nyata] of [
      ["Bagian Materi", klaim("Bagian Materi"), bagianTampil],
      ["Animasi", klaim("Animasi"), animasi],
      ["Cell Python", klaim("Cell Python"), python],
    ]) {
      if (klaimnya !== null) {
        checks.push([klaimnya === nyata, `hero "${label}": tertulis ${klaimnya}, isi sebenarnya ${nyata}`]);
      }
    }
  }

  // Animasi wajib MILIK modul itu. Dahulu ketiga belas modul memakai tiga
  // animasi yang sama (respons step, redaman, Bode) apa pun topiknya — respons
  // step sampai tampil di modul Logika Fuzzy. Judul dikumpulkan lintas modul
  // (termasuk Modul 1 yang ditulis tangan) dan diperiksa setelah loop.
  {
    const judul = [...tanpaGaya(html).matchAll(/class="anim-title">((?:Animasi|Grafik) \d+ — [^<]*)</g)]
      .map((m2) => m2[1].trim());
    const animasiSaja = judul.filter((j) => j.startsWith("Animasi"));
    if (n >= 2) {
      checks.push([animasiSaja.length === 3, `jumlah panel Animasi ${animasiSaja.length}, seharusnya 3`]);
      checks.push([judul.filter((j) => j.startsWith("Grafik 1")).length === 1, "panel Grafik 1 hilang"]);
      const runtimeIni = html.match(/<script id="sisken-rich-runtime">([\s\S]*?)<\/script>/)?.[1] || "";
      for (const fn of ["drawSiskenAnim1", "drawSiskenAnim2", "drawSiskenAnim3", "drawSiskenGrafik"]) {
        checks.push([runtimeIni.includes(`window.${fn}=function`), `runtime tanpa ${fn}`]);
      }
      // Keterangan pada kanvas tidak boleh terpotong tepi: _siskenSiapkan wajib
      // memasang fillText yang menyusut otomatis, dan regex ukuran fontnya
      // wajib utuh (\d) — pernah tergerus menjadi 'd' oleh escape template
      // literal sehingga penyusutan mati dan teks dipotong diam-diam.
      checks.push([runtimeIni.includes("_siskenPasangTeksPas(c,x)"), "runtime tanpa fillText anti-terpotong"]);
      checks.push([runtimeIni.includes("function _siskenBawah("), "runtime tanpa helper baris-bawah anti-tumpang-tindih"]);
      checks.push([runtimeIni.includes("fontAsli.match(/(\\d+(?:\\.\\d+)?)px/)"), "regex ukuran font tergerus escape template"]);
      // Tiap panel (3 animasi + 1 grafik) wajib diikuti kotak "Cara Membaca"
      // berisi legenda notasi variabelnya — mengikuti pola Modul 1. Panel
      // tanpa penjelasan pernah tayang bisu selama satu rilis penuh.
      const kotakCara = (tanpaGaya(html).match(/class="tip-box reveal anim-jelas"/g) || []).length;
      const legendaVar = (tanpaGaya(html).match(/class="anim-var"/g) || []).length;
      checks.push([kotakCara === 4, `kotak Cara Membaca ${kotakCara}, seharusnya 4 (satu per panel animasi/grafik)`]);
      checks.push([legendaVar >= 8, `legenda notasi variabel hanya ${legendaVar}, minimal 8`]);
    }
    for (const j of animasiSaja) judulAnimasiSemua.push([n, j.replace(/^Animasi \d+ — /, "")]);
  }

  // Persamaan bernomor pada HALAMAN: nomornya urut 1..N tanpa lubang, dan tiap
  // nomor punya kotak "Persamaan (k)" pasangannya. Berlaku juga utk Modul 1.
  {
    const markup2 = tanpaGaya(html);
    const nomor = [...markup2.matchAll(/class="formula-number">\((\d+)\)/g)].map((m2) => Number(m2[1]));
    const kotak = [...markup2.matchAll(/Persamaan \((\d+)\)<\/strong>/g)].map((m2) => Number(m2[1]));
    const urut = nomor.every((v, i) => v === i + 1);
    // Jumlah yang DIHARAPKAN dihitung dari sumbernya: materi (modul 2-14,
    // pengklasifikasi sama dengan generator) atau 5 utk Modul 1 yang ditulis
    // tangan. Modul tanpa persamaan matematis (mis. Modul 11) sah bernomor nol.
    const escY = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const harap = n === 1 ? 5
      : (MATERI[n]?.deep || []).filter((d) => d.formula && rumusLatex(d.formula, escY).includes("\\(")).length;
    checks.push([nomor.length === harap, `persamaan bernomor ${nomor.length}, seharusnya ${harap}`]);
    checks.push([urut, `nomor persamaan tidak urut 1..N: ${nomor.join(",")}`]);
    checks.push([JSON.stringify(kotak) === JSON.stringify(nomor),
      `kotak penjelasan (${kotak.join(",")}) tidak berpasangan dgn nomor (${nomor.join(",")})`]);
  }

  for (const [ok, label] of checks) if (!ok) failures.push(`Modul-${n}: ${label}`);

  const runtime = html.match(/<script id="sisken-rich-runtime">([\s\S]*?)<\/script>/)?.[1];
  if (runtime) {
    try { new vm.Script(runtime, { filename: `Modul-${n}:sisken-rich-runtime` }); }
    catch (error) { failures.push(`Modul-${n}: runtime syntax — ${error.message}`); }
  }
}

// ── Persamaan bernomor: kelengkapan data ─────────────────────────────────────
// Setiap persamaan matematis di materi wajib punya penjelasan, dan setiap
// notasi yang tampil pada persamaan wajib punya chip artinya. Diperiksa dari
// DATA (bukan halaman) supaya pesan galatnya menunjuk rumus yang bermasalah.
{
  const escX = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Perintah LaTeX struktural — bukan notasi yang butuh penjelasan.
  const STRUKTUR = new Set(["frac", "sqrt", "left", "right", "cdot", "quad", "qquad",
    "to", "sum", "int", "lim", "infty", "Rightarrow", "Leftrightarrow", "leftrightarrow",
    "pm", "mp", "gg", "ll", "approx", "sim", "le", "ge", "ne", "text", "mathrm",
    "dots", "ldots", "cdots", "times", "min", "max", "log", "exp", "cos", "sin",
    "operatorname"]);   // pembungkus nama operator; namanya sendiri tampil sbg kata
  for (const [n, mod] of Object.entries(MATERI)) {
    for (const d of (mod.deep || [])) {
      if (!d.formula) continue;
      const latex = rumusLatex(d.formula, escX);
      if (!latex.includes("\\(")) continue;   // prosa: tidak dinomori
      const j = PENJELASAN_RUMUS[d.formula];
      if (!j || !j.apa || !j.variabel?.length) {
        failures.push(`Modul ${n}: persamaan tanpa penjelasan: "${d.formula.slice(0, 60)}"`);
        continue;
      }
      // Notasi = perintah LaTeX non-struktural pada bagian matematisnya.
      const mat = [...latex.matchAll(/\\\((.+?)\\\)/g)].map((m2) => m2[1]).join(" ");
      const perintah = [...new Set([...mat.matchAll(/\\([a-zA-Z]+)/g)].map((m2) => m2[1]))]
        .filter((p) => !STRUKTUR.has(p));
      const tersedia = j.variabel.map(([tok]) => tokenLatex(tok)).join(" ") + " " + j.apa;
      for (const p of perintah) {
        if (!tersedia.includes(`\\${p}`)) {
          failures.push(`Modul ${n}: notasi \\${p} pada "${d.formula.slice(0, 45)}" tanpa penjelasan`);
        }
      }
    }
  }
}

// Keunikan judul animasi lintas modul: satu judul hanya boleh muncul di satu
// modul. Duplikat berarti animasi generik kembali dicap ke banyak modul.
{
  const pemilik = new Map();
  for (const [n, inti] of judulAnimasiSemua) {
    if (pemilik.has(inti) && pemilik.get(inti) !== n) {
      failures.push(`Judul animasi "${inti}" dipakai Modul ${pemilik.get(inti)} DAN Modul ${n} — animasi harus milik satu modul`);
    }
    pemilik.set(inti, n);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Validated 14 Sisken modules: Modul 1 mirrors Getaran Modul 1; Modul 2-14 content tabs, code panels, tasks, and runtime syntax.");
