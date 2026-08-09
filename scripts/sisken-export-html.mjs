import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const moduleDir = path.join(root, "Sistem-Kendali-Cerdas", "Modul");
const exportStartMarker = "async function exportTugasHtml() {";
const mcArrayMarker = "  const MC_QUESTIONS = [";
const referenceTailMarker = "  // Collect MC answers";
const referenceEndMarker = "\n// ── FORUM READY CHECK";
const targetEndMarkers = [
  "\n// ── PREPROCESSING ANIMATION HELPERS",
  referenceEndMarker,
];

const referenceFile = path.join(moduleDir, "Modul-1.html");
const referenceHtml = fs.readFileSync(referenceFile, "utf8");
const referenceExportStart = referenceHtml.indexOf(exportStartMarker);
const referenceTailStart = referenceHtml.indexOf(referenceTailMarker, referenceExportStart);
const referenceTailEnd = referenceHtml.indexOf(referenceEndMarker, referenceTailStart);
if (referenceExportStart < 0 || referenceTailStart < 0 || referenceTailEnd < 0) {
  throw new Error("Modul 1: template lengkap Export HTML tidak ditemukan");
}
const referenceTail = referenceHtml.slice(referenceTailStart, referenceTailEnd).trimEnd();

function findQuestionArrayEnd(html, start) {
  const mcStart = html.indexOf(mcArrayMarker, start);
  if (mcStart < 0) return -1;
  const match = html.slice(mcStart).match(/\n\s*\];/);
  return match ? mcStart + match.index + match[0].length : -1;
}

function findTargetEnd(html, start) {
  const positions = targetEndMarkers
    .map((marker) => html.indexOf(marker, start))
    .filter((position) => position >= 0);
  return positions.length ? Math.min(...positions) : -1;
}

function titleFromHtml(html, moduleNumber) {
  const title = html.match(new RegExp(`<title>Modul\\s+${moduleNumber}\\s+—\\s+([\\s\\S]*?)\\s+\\|\\s+Sistem Kendali Cerdas<\\/title>`, "i"))?.[1];
  if (!title) throw new Error(`Modul ${moduleNumber}: judul modul tidak ditemukan`);
  return title.trim();
}

function customizedTail(moduleNumber, moduleTitle) {
  return referenceTail
    .replaceAll("Tugas 1", `Tugas ${moduleNumber}`)
    .replaceAll("Tugas1_", `Tugas${moduleNumber}_`)
    .replaceAll("Pengantar Sistem Kontrol Cerdas", moduleTitle);
}

export function normalizeSiskenExportHtml(html, moduleNumber, moduleTitle = null) {
  if (moduleNumber === 1) return html;
  const start = html.indexOf(exportStartMarker);
  if (start < 0) throw new Error(`Modul ${moduleNumber}: fungsi exportTugasHtml tidak ditemukan`);
  const prefixEnd = findQuestionArrayEnd(html, start);
  if (prefixEnd < 0) throw new Error(`Modul ${moduleNumber}: daftar pertanyaan PG untuk export tidak ditemukan`);
  const end = findTargetEnd(html, prefixEnd);
  if (end < 0) throw new Error(`Modul ${moduleNumber}: batas akhir fungsi exportTugasHtml tidak ditemukan`);
  const title = moduleTitle || titleFromHtml(html, moduleNumber);
  return html.slice(0, prefixEnd) + "\n\n" + customizedTail(moduleNumber, title) + "\n" + html.slice(end);
}

export function applySiskenExportHtml() {
  let changed = 0;
  for (let moduleNumber = 2; moduleNumber <= 14; moduleNumber += 1) {
    const file = path.join(moduleDir, `Modul-${moduleNumber}.html`);
    const original = fs.readFileSync(file, "utf8");
    const normalized = normalizeSiskenExportHtml(original, moduleNumber);
    if (normalized === original) continue;
    fs.writeFileSync(file, normalized, "utf8");
    changed += 1;
  }
  return changed;
}

const cliUrl = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === cliUrl) {
  console.log(`Repaired complete Export HTML flow in ${applySiskenExportHtml()} Sisken modules.`);
}
