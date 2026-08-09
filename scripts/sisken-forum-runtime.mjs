import fs from "node:fs";
import path from "node:path";

import { FORUM } from "./sisken-forum.mjs";

const root = path.resolve(import.meta.dirname, "..");
const moduleDir = path.join(root, "Sistem-Kendali-Cerdas", "Modul");
const forumScript = fs.readFileSync(path.join(import.meta.dirname, "sisken-forum-script.js"), "utf8").trim();

function hashForumAnswer(value) {
  let hash = 5381;
  const salted = `${value}mEKsP9k4tQ2`;
  for (let index = 0; index < salted.length; index += 1) {
    hash = ((hash << 5) + hash + salted.charCodeAt(index)) & 0xffffffff;
  }
  return (hash >>> 0).toString(36);
}

function answerHashLiteral(moduleNumber) {
  const forum = FORUM[moduleNumber];
  if (!forum) return null;
  return forum.jajak
    .map((poll, index) => `${index + 1}:'${hashForumAnswer(`${index + 1}_${poll.jawab}`)}'`)
    .join(",");
}

export function normalizeSiskenForumRuntime(html, moduleNumber) {
  const answerHashes = answerHashLiteral(moduleNumber);
  if (!answerHashes) return html;

  const openMarker = '<script id="sisken-forum-runtime">';
  const runtimeStart = html.indexOf(openMarker);
  const runtimeEnd = runtimeStart < 0 ? -1 : html.indexOf("</script>", runtimeStart);
  if (runtimeStart < 0 || runtimeEnd < 0) {
    throw new Error(`Modul ${moduleNumber}: sisken-forum-runtime tidak ditemukan`);
  }

  let runtime = html.slice(runtimeStart, runtimeEnd);
  runtime = runtime.replace(
    /window\._(?:pa|forumPollAnswerHashes)\s*=\s*\{[^;]*\};/,
    `window._forumPollAnswerHashes = {${answerHashes}};`,
  );

  const scriptStart = runtime.indexOf("const FORUM_MIN_WORDS = 30;");
  const buildStart = runtime.indexOf("function buildForumHtml()", scriptStart);
  if (scriptStart < 0 || buildStart < 0) {
    throw new Error(`Modul ${moduleNumber}: batas runtime Copy Forum tidak ditemukan`);
  }
  runtime = runtime.slice(0, scriptStart) + forumScript + "\n" + runtime.slice(buildStart);

  let normalized = html.slice(0, runtimeStart) + runtime + html.slice(runtimeEnd);
  normalized = normalized.replace(
    "const correct = (_ah(n+'_'+idx) === window._pa[n]);",
    "const correct = (_ah(n+'_'+idx) === (window._forumPollAnswerHashes || {})[n]);",
  );
  return normalized;
}

function runCli() {
  let changed = 0;
  for (let moduleNumber = 2; moduleNumber <= 14; moduleNumber += 1) {
    const file = path.join(moduleDir, `Modul-${moduleNumber}.html`);
    const original = fs.readFileSync(file, "utf8");
    const normalized = normalizeSiskenForumRuntime(original, moduleNumber);
    if (normalized !== original) {
      fs.writeFileSync(file, normalized, "utf8");
      changed += 1;
    }
  }
  console.log(`Normalized Forum copy and poll answers on Sisken Modul 2-14; changed ${changed} files.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) runCli();
