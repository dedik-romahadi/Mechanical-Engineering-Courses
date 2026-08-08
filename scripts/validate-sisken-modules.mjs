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
      [/<div class="hero(?: [^"]+)?" data-tab="modul">/.test(html), "hero seperti Modul 1"],
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
      [html.includes('<body class="modern-academic-pilot">'), "pilot modern academic aktif hanya melalui kelas body"],
      [(html.match(/id="modern-academic-pilot"/g) || []).length === 1, "satu blok gaya pilot modern academic"],
      [(html.match(/id="modern-academic-pilot-runtime"/g) || []).length === 1, "satu runtime pilot modern academic"],
      [html.includes('class="hero academic-hero"') && html.includes('class="academic-roadmap"'), "hero dan alur belajar pilot"],
      [html.includes('id="readingPosition"') && html.includes("link.classList.toggle('is-current', current)"), "indikator dan navigasi bagian aktif"],
      [html.includes("@media screen{") && html.includes("@media screen and (max-width:700px)") && html.includes("@media(prefers-reduced-motion:reduce)"), "gaya pilot responsif, screen-only, dan reduced-motion"],
      [html.includes("#page-modul .section{--chapter-accent:#22d3ee") && html.includes("#page-modul .academic-hero .hero-content"), "chapter card dan panel hero pilot"],
    );
    const pilotRuntime = html.match(/<script id="modern-academic-pilot-runtime">([\s\S]*?)<\/script>/)?.[1];
    try { new vm.Script(pilotRuntime || "", { filename: "Modul-2:modern-academic-pilot-runtime" }); }
    catch (error) { checks.push([false, `runtime pilot modern academic â€” ${error.message}`]); }
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
    [html.includes("const scoreBar = document.querySelector('#page-tugas .score-bar')") && html.includes("window.scrollTo({ top, behavior: 'auto' })"), "tab Tugas langsung menggulir ke panel skor"],
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
