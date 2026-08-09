import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const failures = [];

function exportSource(html, moduleNumber) {
  const startMarker = "async function exportTugasHtml()";
  const endMarker = moduleNumber === 1
    ? "// ── FORUM READY CHECK"
    : "// ── PREPROCESSING ANIMATION HELPERS";
  const start = html.indexOf(startMarker);
  const end = start < 0 ? -1 : html.indexOf(endMarker, start);
  return start >= 0 && end >= 0 ? html.slice(start, end) : "";
}

for (let moduleNumber = 1; moduleNumber <= 14; moduleNumber += 1) {
  const file = path.join(root, "Sistem-Kendali-Cerdas", "Modul", `Modul-${moduleNumber}.html`);
  const html = fs.readFileSync(file, "utf8");
  const source = exportSource(html, moduleNumber);
  const state = {
    appended: false,
    clicked: false,
    removed: false,
    revoked: false,
    download: "",
    href: "",
    blob: null,
    payload: null,
  };
  const button = { disabled: false, textContent: "📄 Export HTML" };
  const anchor = {
    style: {},
    href: "",
    download: "",
    click() {
      state.clicked = true;
      state.download = this.download;
      state.href = this.href;
    },
    remove() { state.removed = true; },
  };
  const sandbox = {
    window: {
      MODUL_ID: `sistem_kendali_cerdas-modul-${moduleNumber}`,
      _sessionPinHash: "a".repeat(64),
      _previewExportGuard: () => false,
      _isHardComp: (qId) => Number(String(qId).replace("c", "")) >= 11,
      _generateExportCodeCallable: async (payload) => {
        state.payload = payload;
        return { data: { code: "QA00-QA00-QA00", points: 42.5, nilai: 85, generatedAt: "2026-08-09T00:00:00.000Z" } };
      },
    },
    document: {
      body: { appendChild(node) { state.appended = node === anchor; } },
      createElement(tag) { if (tag !== "a") throw new Error(`elemen tidak diharapkan: ${tag}`); return anchor; },
      getElementById(id) {
        if (id === "btn-score-export") return button;
        if (id === "gdrive-link") return { value: "https://drive.google.com/drive/folders/qa" };
        if (/^code-c\d+$/.test(id)) return { value: `print('jawaban ${id}')` };
        if (/^rg-mc\d+$/.test(id)) return { querySelector: () => null };
        return null;
      },
      querySelectorAll: () => [],
    },
    getIdentityLocal: () => ({ nama: "QA Student", nim: "00000000000" }),
    mcAnswered: {},
    mcScores: {},
    compScores: {},
    SCORE_CONFIG: {
      MC_COUNT: 10,
      MC_TOTAL: 10,
      COMP_EZ_TOTAL: 20,
      COMP_HARD_TOTAL: 20,
      COMP_HARD_POINT: 4,
      TOTAL: 50,
    },
    _fmtPts: (value) => String(value),
    alert: (message) => { throw new Error(`alert tidak diharapkan: ${message}`); },
    Blob: function Blob(parts, options) { state.blob = { parts, type: options?.type || "" }; },
    URL: {
      createObjectURL(blob) { if (!blob) throw new Error("Blob kosong"); return "blob:qa-export"; },
      revokeObjectURL(url) { state.revoked = url === "blob:qa-export"; },
    },
    setTimeout(callback) { callback(); return 1; },
  };

  try {
    if (!source) throw new Error("sumber fungsi export tidak ditemukan");
    const context = vm.createContext(sandbox);
    new vm.Script(source, { filename: `Modul-${moduleNumber}:exportTugasHtml` }).runInContext(context);
    await context.exportTugasHtml();
    const documentText = state.blob?.parts?.join("") || "";
    const expectedName = `Tugas${moduleNumber}_00000000000_SistemKendaliCerdas.html`;
    const checks = [
      [state.payload?.modulId === `sistem_kendali_cerdas-modul-${moduleNumber}`, "modulId callable"],
      [state.payload?.nim === "00000000000" && state.payload?.pinHash === "a".repeat(64), "identitas callable"],
      [state.blob?.type === "text/html;charset=utf-8" && documentText.length > 20000, "dokumen Blob HTML lengkap"],
      [documentText.includes(`<title>Tugas ${moduleNumber} — QA Student</title>`), "judul dokumen"],
      [documentText.includes("QA00-QA00-QA00") && documentText.includes("https://drive.google.com/drive/folders/qa"), "kode verifikasi dan Drive"],
      [state.appended && state.clicked && state.removed, "anchor download dipasang, diklik, dan dibuang"],
      [state.download === expectedName && state.href === "blob:qa-export", "nama dan URL download"],
      [state.revoked, "object URL dibersihkan"],
      [button.textContent === "📄 Export HTML" && button.disabled === false, "label tombol dipulihkan"],
    ];
    for (const [ok, label] of checks) if (!ok) failures.push(`Modul ${moduleNumber}: ${label}`);
  } catch (error) {
    failures.push(`Modul ${moduleNumber}: ${error.message}`);
  }
}

if (failures.length) {
  console.error(`Sisken Export HTML validation failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("Validated executable Export HTML downloads on all 14 Sisken modules.");
