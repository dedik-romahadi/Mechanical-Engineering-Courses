import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const courses = ["Engineering-Mathematics", "Getaran-Mekanik", "Optimalisasi-dan-Automasi", "Sistem-Kendali-Cerdas"];
const failures = [];
let files = 0;
let sections = 0;

for (const course of courses) {
  for (let moduleNumber = 1; moduleNumber <= 14; moduleNumber += 1) {
    const label = `${course}/Modul-${moduleNumber}`;
    const file = path.join(root, course, "Modul", `Modul-${moduleNumber}.html`);
    const html = fs.readFileSync(file, "utf8");
    const style = html.match(/<style id="modern-academic-design">([\s\S]*?)<\/style>/)?.[1] || "";
    const runtime = html.match(/<script id="modern-academic-runtime">([\s\S]*?)<\/script>/)?.[1] || "";
    const markup = html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<script[\s\S]*?<\/script>/g, "");
    const checks = [
      [(html.match(/id="modern-academic-design"/g) || []).length === 1, "satu style modern academic"],
      [(html.match(/id="modern-academic-runtime"/g) || []).length === 1, "satu runtime modern academic"],
      [html.includes('<body class="modern-academic-design">'), "kelas tema pada body"],
      [html.includes(`<div class="hero academic-hero" data-tab="modul" data-module-number="${String(moduleNumber).padStart(2, "0")}"`), "hero academic dan nomor modul dinamis"],
      [(html.match(/class="academic-roadmap"/g) || []).length === 1, "satu roadmap hero"],
      [(markup.match(/id="readingPosition"/g) || []).length === 1 && (markup.match(/id="readingPositionValue"/g) || []).length === 1, "satu indikator posisi baca"],
      [style.includes("#page-modul .section-desc{width:100%;max-width:none"), "paragraf mengikuti lebar kontainer"],
      [style.includes("content:attr(data-module-number)"), "nomor latar hero tidak dipatok"],
      [style.includes("#page-modul .formula-block:hover{transform:translate3d(5px,-5px,0)"), "hover kartu formula"],
      [style.includes("#page-modul .formula-block:hover::before{background-position:-40% 0;opacity:1}"), "kilau formula tanpa overflow"],
      [style.includes("#page-modul .reference-card:hover{transform:translate3d(5px,-5px,0)"), "hover kartu daftar pustaka"],
      [(markup.match(/class="reference-card"/g) || []).length >= 5, "seluruh kartu daftar pustaka ditandai untuk hover"],
      [style.includes("#page-modul .tbl-wrap table.academic-data-table.has-equation-column{table-layout:auto") && style.includes(".equation-column{width:1%;min-width:180px;overflow-wrap:normal;white-space:nowrap;word-break:normal}"), "kolom persamaan mengikuti lebar intrinsik tanpa terpotong"],
      [style.includes(".table-caption{caption-side:top;box-sizing:border-box;height:50px;max-height:50px;padding:0 var(--table-caption-indent);overflow:hidden") && style.includes(".anim-title{display:inline-block;max-width:calc(100% - 30px);overflow:hidden"), "tinggi caption seragam dan teks panjang memakai elipsis"],
      [style.includes(".academic-table-wrap{--table-caption-indent:24px;") && (style.match(/padding:0 var\(--table-caption-indent\)/g) || []).length === 2, "indentasi caption 24 px konsisten pada desktop dan ponsel"],
      [style.includes("table.academic-data-table td.equation-column{background:") && !style.includes("table.academic-data-table th.equation-column{"), "header kolom persamaan sama dengan header lain"],
      [style.includes("#page-modul .tbl-wrap table.academic-data-table tbody tr:hover td"), "format tabel modern academic seragam"],
      [style.includes("@media(prefers-reduced-motion:reduce)"), "reduced motion"],
      [runtime.includes("entry.target.classList.toggle('is-in-view', entry.isIntersecting)"), "observer chapter card"],
      [runtime.includes("const moduleTables = [...page.querySelectorAll('.tbl-wrap table')]") && runtime.includes("table.classList.add('academic-data-table')"), "runtime normalisasi seluruh tabel materi"],
      [runtime.includes("const equationHeaderPattern = /(?:persamaan|rumus|formula|\\beom\\b)/i") && runtime.includes("header.classList.add('equation-column')"), "deteksi semantik kolom persamaan"],
      [!runtime.includes("--equation-column-width"), "runtime tidak memaksakan persentase kolom persamaan"],
      [runtime.includes("title.textContent = 'Tabel ' + String(tableIndex + 1) + ' — ' + sectionTitle"), "caption tabel otomatis dan konsisten"],
      [runtime.includes("caption.removeAttribute('style')"), "runtime membersihkan style inline caption lama"],
      [runtime.includes("card.classList.add('reference-card')"), "runtime memulihkan penanda kartu pustaka lama"],
      [!/<caption\b[^>]*\sstyle=/.test(markup), "caption materi tanpa style inline yang mengalahkan tema"],
      [runtime.includes("requestAnimationFrame(() => window.scrollTo({top:0, behavior:'smooth'}))"), "klik tab kembali ke hero"],
      [!html.includes("const scoreBar = document.querySelector('#page-tugas .score-bar')"), "Tugas tidak melompat ke panel skor"],
      [html.includes('id="scheduleDueDate"') && html.includes('id="scheduleDueTime"'), "editor deadline memisahkan tanggal dan jam"],
      [html.includes("Format 24 jam WIB (UTC+7), contoh 22:00."), "petunjuk deadline 24 jam WIB"],
      [html.includes("function _wibStringToDate(value)") && html.includes("Date.UTC(+match[1], +match[2]-1, +match[3], +match[4]-7, +match[5])"), "deadline diparse eksplisit sebagai WIB"],
      [html.includes("function _normalizeModuleScheduleWib(schedule)") && html.includes("currentSchedule = _normalizeModuleScheduleWib(snap.val());"), "jadwal lama dinormalisasi dari due WIB"],
      [html.includes("const dur=parseInt(document.getElementById('scheduleDuration').value), due=_readScheduleDueWib();"), "penyimpanan membaca editor deadline WIB"],
      [html.includes("hourCycle:'h23', timeZone:'Asia/Jakarta'") && html.includes("return dateText+' '+timeText+' WIB';"), "tampilan deadline memakai 24 jam dan label WIB"],
      [!html.includes('type="datetime-local" class="v-input" id="scheduleDue"') && !/const dueDate\s*=\s*new Date\(due\)/.test(html), "deadline tidak bergantung pada locale atau zona waktu browser"],
      [!html.includes('id="modern-academic-pilot"') && !html.includes('id="modern-academic-motion"') && !html.includes('id="sisken-formula-hover"'), "tanpa style rollout lama"],
    ];
    for (const [ok, message] of checks) if (!ok) failures.push(`${label}: ${message}`);
    try { new vm.Script(runtime, {filename:`${label}:modern-academic-runtime`}); }
    catch (error) { failures.push(`${label}: runtime tidak valid — ${error.message}`); }
    files += 1;
    sections += (html.match(/<div class="section" id="m-[^"]+">/g) || []).length;
  }
}

if (files !== 56) failures.push(`jumlah modul ${files}, seharusnya 56`);

const parseWibForValidation = (value) => {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})T((?:[01]\d|2[0-3])):([0-5]\d)$/);
  if (!match) return new Date(NaN);
  return new Date(Date.UTC(+match[1], +match[2] - 1, +match[3], +match[4] - 7, +match[5]));
};
const tenPmWib = parseWibForValidation("2026-08-10T22:00");
if (tenPmWib.toISOString() !== "2026-08-10T15:00:00.000Z") {
  failures.push(`parser WIB 22:00 menghasilkan ${tenPmWib.toISOString()}, seharusnya 15:00 UTC`);
}
for (const invalid of ["2026-08-10T10:00 PM", "2026-08-10T24:00", "2026-08-10T22:60", ""]) {
  if (Number.isFinite(parseWibForValidation(invalid).getTime())) failures.push(`parser WIB menerima waktu tidak valid: ${invalid}`);
}
if (failures.length) {
  console.error(`Modern academic validation failed (${failures.length}):`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Validated modern academic design on ${files} modules across 4 courses (${sections} sections).`);
