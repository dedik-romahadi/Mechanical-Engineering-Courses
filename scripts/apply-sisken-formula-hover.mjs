import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const moduleDir = path.join(root, "Sistem-Kendali-Cerdas", "Modul");
const marker = "sisken-formula-hover";

const style = `<style id="${marker}">
/* Hover seragam untuk seluruh kartu ringkasan rumus. Kilau digerakkan melalui
   background-position agar pseudo-element tidak memperlebar area scroll. */
#page-modul .formula-block{--formula-hover-accent:var(--cyan,#67e8f9);position:relative;isolation:isolate;outline:1px solid transparent;outline-offset:-1px;overflow-y:hidden;transition:transform .38s cubic-bezier(.2,.8,.2,1),border-color .3s ease,box-shadow .38s ease,outline-color .3s ease,filter .3s ease}
#page-modul .formula-block>*{position:relative;z-index:2}
#page-modul .formula-block::before{content:'';position:absolute;inset:0;z-index:1;background:linear-gradient(105deg,transparent 34%,rgba(255,255,255,.12) 46%,rgba(103,232,249,.2) 52%,transparent 65%);background-size:240% 100%;background-position:140% 0;opacity:0;transition:background-position .72s cubic-bezier(.2,.8,.2,1),opacity .34s ease;pointer-events:none}
#page-modul .formula-block .formula-label{transition:transform .36s cubic-bezier(.2,.8,.2,1),color .3s ease,text-shadow .3s ease}
#page-modul .formula-block .formula-main{transition:color .3s ease,text-shadow .3s ease,filter .3s ease}
@media screen{
  #page-modul .formula-block:hover{transform:translate3d(5px,-5px,0);border-color:#67e8f9;outline-color:rgba(103,232,249,.55);box-shadow:0 22px 52px rgba(0,0,0,.3),0 0 34px rgba(103,232,249,.14);filter:brightness(1.07)}
  #page-modul .formula-block:hover::before{background-position:-40% 0;opacity:1}
  #page-modul .formula-block:hover .formula-label{transform:translateY(-1px) scale(1.04);color:#a5f3fc;text-shadow:0 0 18px rgba(103,232,249,.68)}
  #page-modul .formula-block:hover .formula-main{color:#fff;filter:brightness(1.08);text-shadow:0 0 20px rgba(103,232,249,.28)}
}
@media(prefers-reduced-motion:reduce){
  #page-modul .formula-block,#page-modul .formula-block::before,#page-modul .formula-block .formula-label,#page-modul .formula-block .formula-main{transition:none!important}
  #page-modul .formula-block:hover{transform:none!important}
}
</style>`;

let totalCards = 0;
for (let moduleNumber = 1; moduleNumber <= 14; moduleNumber += 1) {
  const file = path.join(moduleDir, `Modul-${moduleNumber}.html`);
  const original = fs.readFileSync(file, "utf8");
  const cardCount = (original.match(/class="formula-block reveal"/g) || []).length;
  if (cardCount === 0) throw new Error(`Modul ${moduleNumber} tidak memiliki formula-block`);

  const eol = original.includes("\r\n") ? "\r\n" : "\n";
  const localStyle = style.replace(/\n/g, eol);
  const withoutOldStyle = original.replace(
    /(?:\r?\n)?<style id="sisken-formula-hover">[\s\S]*?<\/style>/g,
    "",
  );
  if (!withoutOldStyle.includes("</head>")) throw new Error(`Penutup head Modul ${moduleNumber} tidak ditemukan`);

  const next = withoutOldStyle.replace("</head>", `${eol}${localStyle}${eol}</head>`);
  if (next !== original) fs.writeFileSync(file, next, "utf8");
  totalCards += cardCount;
}

console.log(`Applied formula hover to ${totalCards} cards across 14 Sisken modules.`);
