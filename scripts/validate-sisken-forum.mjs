import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import { FORUM } from "./sisken-forum.mjs";

const root = path.resolve(import.meta.dirname, "..");
const moduleDir = path.join(root, "Sistem-Kendali-Cerdas", "Modul");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function hashForumAnswer(value) {
  let hash = 5381;
  const salted = `${value}mEKsP9k4tQ2`;
  for (let index = 0; index < salted.length; index += 1) {
    hash = ((hash << 5) + hash + salted.charCodeAt(index)) & 0xffffffff;
  }
  return (hash >>> 0).toString(36);
}

function extractRuntime(html, moduleNumber) {
  const match = html.match(/<script id="sisken-forum-runtime">([\s\S]*?)<\/script>/);
  assert(match, `Modul ${moduleNumber}: sisken-forum-runtime tidak ditemukan`);
  return match[1];
}

function extractFunction(html, name, moduleNumber) {
  const start = html.indexOf(`function ${name}(`);
  assert(start >= 0, `Modul ${moduleNumber}: function ${name} tidak ditemukan`);
  const open = html.indexOf("{", start);
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = open; index < html.length; index += 1) {
    const char = html[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (quote) {
      if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}" && --depth === 0) return html.slice(start, index + 1);
  }
  throw new Error(`Modul ${moduleNumber}: penutup function ${name} tidak ditemukan`);
}

function makeElement(initial = {}) {
  return {
    value: "",
    textContent: "",
    style: {},
    dataset: {},
    selected: false,
    focused: false,
    selection: null,
    focus() { this.focused = true; },
    select() { this.selected = true; },
    setSelectionRange(start, end) { this.selection = [start, end]; },
    scrollIntoView() {},
    ...initial,
  };
}

function createContext(moduleNumber, html, clipboardMode = "success") {
  const answer = Array.from({ length: 32 }, (_, index) => `kata${index + 1}`).join(" ");
  const elements = {
    "ans-fq1": makeElement({ value: answer }),
    "ans-fq2": makeElement({ value: answer }),
    "ans-fq3": makeElement({ value: answer }),
    "btn-copy-forum": makeElement(),
    "copy-forum-msg": makeElement(),
    "forum-html-output": makeElement({ style: { display: "none" } }),
    "forum-html-textarea": makeElement(),
  };
  const clipboardWrites = [];
  let fallbackCopies = 0;
  const context = {
    console: { log() {}, info() {}, warn() {}, error() {} },
    navigator: {
      clipboard: {
        async writeText(text) {
          if (clipboardMode === "reject") throw new Error("clipboard denied for validator");
          clipboardWrites.push(text);
        },
      },
    },
    document: {
      getElementById(id) { return elements[id] || null; },
      addEventListener() {},
      execCommand(command) {
        if (command === "copy") fallbackCopies += 1;
        return command === "copy";
      },
    },
    getIdentityLocal() { return { nama: "Mahasiswa Uji", nim: "123456789" }; },
    setTimeout() { return 1; },
    clearTimeout() {},
  };
  context.window = context;
  context.window.isSecureContext = true;
  vm.createContext(context);
  vm.runInContext(extractRuntime(html, moduleNumber), context, { filename: `Modul-${moduleNumber}-forum-runtime.js` });
  vm.runInContext(extractFunction(html, "voteForum", moduleNumber), context, { filename: `Modul-${moduleNumber}-voteForum.js` });
  context.checkForumReady = () => {};
  return { context, elements, clipboardWrites, getFallbackCopies: () => fallbackCopies };
}

function installPollDom(state, pollNumber) {
  const feedback = {
    right: makeElement({ classList: { add(name) { this.added = name; } } }),
    wrong: makeElement({ classList: { add(name) { this.added = name; } } }),
  };
  const options = Array.from({ length: 4 }, () => {
    const circle = makeElement();
    return makeElement({ querySelector() { return circle; }, circle });
  });
  const poll = makeElement({ querySelectorAll() { return options; } });
  const originalGet = state.context.document.getElementById;
  state.context.document.getElementById = (id) => {
    if (id === `fp${pollNumber}`) return poll;
    if (id === `fp${pollNumber}r`) return feedback.right;
    if (id === `fp${pollNumber}w`) return feedback.wrong;
    return originalGet(id);
  };
  return { poll, options, feedback };
}

async function flushPromises() {
  await Promise.resolve();
  await new Promise((resolve) => setImmediate(resolve));
}

for (let moduleNumber = 2; moduleNumber <= 14; moduleNumber += 1) {
  const file = path.join(moduleDir, `Modul-${moduleNumber}.html`);
  const html = fs.readFileSync(file, "utf8");
  const forum = FORUM[moduleNumber];
  assert(forum?.jajak?.length === 3, `Modul ${moduleNumber}: data forum harus mempunyai 3 PG`);
  assert(!html.includes("_ah(n+'_'+idx) === window._pa[n]"), `Modul ${moduleNumber}: voteForum masih memakai namespace legacy`);
  for (const helper of ["_execCopyFallback", "_showCopySuccess", "fallbackCopy"]) {
    assert(html.includes(`function ${helper}(`), `Modul ${moduleNumber}: helper ${helper} tidak tersedia`);
  }

  const hashMatch = html.match(/window\._forumPollAnswerHashes\s*=\s*\{([^}]*)\};/);
  assert(hashMatch, `Modul ${moduleNumber}: peta hash forum khusus tidak ditemukan`);
  for (let pollIndex = 0; pollIndex < 3; pollIndex += 1) {
    const pollNumber = pollIndex + 1;
    const expectedHash = hashForumAnswer(`${pollNumber}_${forum.jajak[pollIndex].jawab}`);
    assert(
      new RegExp(`${pollNumber}\\s*:\\s*'${expectedHash}'`).test(hashMatch[1]),
      `Modul ${moduleNumber} PG ${pollNumber}: hash jawaban tidak sesuai sumber forum`,
    );
    const optionCalls = [...html.matchAll(new RegExp(`voteForum\\(${pollNumber},this,(\\d)\\)`, "g"))]
      .map((match) => Number(match[1]));
    assert(optionCalls.join(",") === "0,1,2,3", `Modul ${moduleNumber} PG ${pollNumber}: opsi harus lengkap 0-3`);
  }

  const state = createContext(moduleNumber, html, "success");
  for (let pollNumber = 1; pollNumber <= 3; pollNumber += 1) {
    const correctIndex = forum.jajak[pollNumber - 1].jawab;
    for (let optionIndex = 0; optionIndex < 4; optionIndex += 1) {
      const pollState = installPollDom(state, pollNumber);
      state.context.voteForum(pollNumber, pollState.options[optionIndex], optionIndex);
      const expectedColor = optionIndex === correctIndex ? "var(--green)" : "var(--pink)";
      assert(
        pollState.options[optionIndex].style.borderColor === expectedColor,
        `Modul ${moduleNumber} PG ${pollNumber} opsi ${optionIndex}: hasil penilaian salah`,
      );
    }
  }

  state.context.copyForumHtml();
  await flushPromises();
  assert(state.clipboardWrites.length === 1, `Modul ${moduleNumber}: Clipboard API tidak menerima HTML`);
  assert(state.clipboardWrites[0].length > 1000, `Modul ${moduleNumber}: HTML forum terlalu pendek`);
  assert(state.elements["forum-html-textarea"].value === state.clipboardWrites[0], `Modul ${moduleNumber}: textarea backup tidak sinkron`);
  assert(state.elements["copy-forum-msg"].textContent.includes("sudah tersalin"), `Modul ${moduleNumber}: status sukses copy tidak tampil`);
}

const fallbackHtml = fs.readFileSync(path.join(moduleDir, "Modul-2.html"), "utf8");
const fallbackState = createContext(2, fallbackHtml, "reject");
fallbackState.context.copyForumHtml();
await flushPromises();
assert(fallbackState.getFallbackCopies() === 1, "Modul 2: fallback execCommand tidak dijalankan saat Clipboard API ditolak");
assert(fallbackState.elements["forum-html-textarea"].selected, "Modul 2: textarea fallback tidak dipilih");
assert(fallbackState.elements["copy-forum-msg"].textContent.includes("sudah tersalin"), "Modul 2: fallback copy tidak melaporkan sukses");

const moduleOne = fs.readFileSync(path.join(moduleDir, "Modul-1.html"), "utf8");
assert(moduleOne.includes("window._forumPollAnswerHashes ="), "Modul 1: namespace kunci forum belum dipisahkan");
assert(!moduleOne.includes("_ah(n+'_'+idx) === window._pa[n]"), "Modul 1: voteForum masih memakai namespace legacy");

console.log("Validated 156 Forum PG choices and HTML copy success/fallback on all 14 Sisken modules.");
