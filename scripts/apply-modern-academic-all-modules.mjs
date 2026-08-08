import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const courseRoots = [
  "Engineering-Mathematics",
  "Getaran-Mekanik",
  "Optimalisasi-dan-Automasi",
  "Sistem-Kendali-Cerdas",
];

const roadmap = `<div class="academic-roadmap" aria-label="Alur belajar modul">
      <div class="road-step"><span>01</span><strong>Pelajari</strong><small>Konsep, prinsip, dan rumus</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>02</span><strong>Eksplorasi</strong><small>Contoh, tabel, dan animasi</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>03</span><strong>Terapkan</strong><small>Python, diskusi, dan tugas</small></div>
    </div>`;

const style = `<style id="modern-academic-design">
/* Desain modern academic lintas 56 modul. Screen-only agar cetak/export stabil. */
@media screen{
  body.modern-academic-design{background:radial-gradient(circle at 8% 12%,rgba(34,211,238,.07),transparent 24%),radial-gradient(circle at 92% 30%,rgba(168,85,247,.09),transparent 28%),#050914}
  body.modern-academic-design #scrollProgress{height:4px;background:linear-gradient(90deg,#22d3ee,#a855f7 52%,#fbbf24);box-shadow:0 0 18px rgba(34,211,238,.55)}
  .reading-position{position:fixed;left:20px;bottom:22px;z-index:88;display:flex;align-items:center;gap:9px;padding:9px 13px;border:1px solid rgba(34,211,238,.28);border-radius:999px;background:rgba(7,15,29,.86);backdrop-filter:blur(14px);box-shadow:0 10px 30px rgba(0,0,0,.28);font-family:'JetBrains Mono',monospace;opacity:0;transform:translateY(10px);pointer-events:none;transition:opacity .25s,transform .25s}
  .reading-position.is-visible{opacity:1;transform:translateY(0)}
  .reading-position span{font-size:9px;letter-spacing:1.6px;text-transform:uppercase;color:#7dd3fc}
  .reading-position strong{font-size:11px;color:#fff}

  #page-modul .academic-hero{min-height:calc(100vh - 12px);padding:132px 28px 72px;isolation:isolate}
  #page-modul .academic-hero::before{content:'';position:absolute;width:min(760px,78vw);aspect-ratio:1;border-radius:50%;background:conic-gradient(from 210deg,rgba(34,211,238,.14),rgba(168,85,247,.18),rgba(251,191,36,.08),rgba(34,211,238,.14));filter:blur(70px);opacity:.7;animation:academicAura 16s ease-in-out infinite;z-index:-1}
  #page-modul .academic-hero::after{content:attr(data-module-number);position:absolute;right:clamp(18px,6vw,88px);bottom:-.12em;font-family:'Playfair Display',serif;font-size:clamp(170px,30vw,420px);font-weight:900;line-height:1;color:rgba(148,163,184,.035);letter-spacing:-.08em;pointer-events:none;z-index:-1}
  #page-modul .academic-hero .hero-content{width:min(960px,100%);max-width:none;padding:clamp(28px,5vw,58px);border:1px solid rgba(148,163,184,.18);border-radius:32px;background:linear-gradient(145deg,rgba(13,24,43,.84),rgba(21,16,48,.72));backdrop-filter:blur(24px) saturate(135%);box-shadow:0 34px 90px rgba(0,0,0,.38),0 0 0 1px rgba(255,255,255,.035) inset;overflow:hidden}
  #page-modul .academic-hero .hero-content::before{content:'';position:absolute;inset:0 0 auto;height:3px;background:linear-gradient(90deg,#22d3ee,#a855f7,#fbbf24)}
  #page-modul .academic-hero .hero-eyebrow{background:rgba(5,12,24,.56);border-color:rgba(34,211,238,.3);color:#a5f3fc}
  #page-modul .academic-hero .hero-title{font-size:clamp(50px,7.2vw,94px);line-height:.94;letter-spacing:-.035em;text-wrap:balance;text-shadow:0 18px 54px rgba(0,0,0,.38)}
  #page-modul .academic-hero .hero-sub{max-width:760px;margin-bottom:26px;font-size:clamp(15px,1.65vw,18px);color:#c5d2e6;text-wrap:pretty}
  .academic-roadmap{display:flex;align-items:stretch;justify-content:center;gap:10px;margin:0 auto 30px;max-width:820px}
  .academic-roadmap .road-step{flex:1;min-width:0;display:grid;grid-template-columns:auto 1fr;column-gap:10px;align-items:center;padding:12px 14px;border:1px solid rgba(148,163,184,.14);border-radius:14px;background:rgba(4,10,20,.45);text-align:left;animation:motionRoadFloat 5.6s ease-in-out infinite}
  .academic-roadmap .road-step>span{grid-row:1/3;display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:rgba(34,211,238,.1);border:1px solid rgba(34,211,238,.25);font:700 10px 'JetBrains Mono',monospace;color:#67e8f9}
  .academic-roadmap .road-step:nth-child(3){animation-delay:-1.8s}.academic-roadmap .road-step:nth-child(3)>span{background:rgba(168,85,247,.12);border-color:rgba(168,85,247,.3);color:#c4b5fd}
  .academic-roadmap .road-step:nth-child(5){animation-delay:-3.6s}.academic-roadmap .road-step:nth-child(5)>span{background:rgba(251,191,36,.1);border-color:rgba(251,191,36,.25);color:#fde68a}
  .academic-roadmap strong{font-size:12px;color:#f8fafc;letter-spacing:.02em}.academic-roadmap small{font-size:10px;color:#8292aa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .academic-roadmap .road-arrow{align-self:center;color:#64748b;font:700 14px 'JetBrains Mono',monospace;animation:motionArrowFlow 1.8s ease-in-out infinite}
  #page-modul .academic-hero .hero-stats{gap:12px}
  #page-modul .academic-hero .stat{min-width:130px;padding:13px 18px;border-color:rgba(148,163,184,.17);background:linear-gradient(145deg,rgba(15,27,47,.75),rgba(17,13,40,.68));box-shadow:0 12px 28px rgba(0,0,0,.2)}

  #page-modul{padding-bottom:36px}
  #page-modul .divider{height:22px;border:0}
  #page-modul .section{--chapter-accent:#22d3ee;position:relative;width:min(1180px,calc(100% - 40px));max-width:none;margin:0 auto;padding:clamp(30px,5vw,64px);border:1px solid rgba(148,163,184,.14);border-radius:28px;background:linear-gradient(145deg,rgba(13,24,43,.78),rgba(8,14,27,.9));box-shadow:0 24px 70px rgba(0,0,0,.24),0 1px 0 rgba(255,255,255,.03) inset;overflow:hidden;scroll-margin-top:118px;transition:border-color .5s ease,box-shadow .5s ease,transform .5s ease}
  #page-modul .section::before{content:'';position:absolute;inset:0 auto 0 0;width:3px;background:linear-gradient(180deg,var(--chapter-accent),transparent 82%);box-shadow:0 0 22px var(--chapter-accent)}
  #page-modul #m-2,#page-modul #m-6,#page-modul #m-10,#page-modul #m-14{--chapter-accent:#a855f7}
  #page-modul #m-3,#page-modul #m-7,#page-modul #m-11{--chapter-accent:#fbbf24}
  #page-modul #m-4,#page-modul #m-8,#page-modul #m-12{--chapter-accent:#34d399}
  #page-modul #m-5,#page-modul #m-9,#page-modul #m-13{--chapter-accent:#ec4899}
  #page-modul .section.is-in-view{border-color:var(--chapter-accent);box-shadow:0 28px 80px rgba(0,0,0,.3),0 0 34px rgba(34,211,238,.08),0 1px 0 rgba(255,255,255,.04) inset}
  #page-modul .section::after{content:'';position:absolute;top:0;left:-32%;width:30%;height:2px;background:linear-gradient(90deg,transparent,var(--chapter-accent),#fff,transparent);opacity:0;filter:drop-shadow(0 0 8px var(--chapter-accent));pointer-events:none}
  #page-modul .section.is-in-view::after{animation:motionChapterScan 1.15s cubic-bezier(.2,.8,.2,1) both}
  #page-modul .section-label{width:max-content;padding:6px 11px;margin-bottom:16px;border:1px solid var(--chapter-accent);border-radius:999px;background:rgba(34,211,238,.07);color:var(--chapter-accent);letter-spacing:2.4px}
  #page-modul .section-label::before{width:7px;height:7px;border-radius:50%;background:var(--chapter-accent);box-shadow:0 0 9px var(--chapter-accent)}
  #page-modul .section-title{max-width:880px;margin-bottom:22px;font-size:clamp(30px,4.2vw,50px);letter-spacing:-.025em;text-wrap:balance}
  #page-modul .section-title::after{content:'';display:block;width:74px;height:3px;margin-top:17px;border-radius:999px;background:linear-gradient(90deg,var(--chapter-accent),transparent)}
  #page-modul .section-desc{width:100%;max-width:none;margin-bottom:20px;font-size:16.5px;line-height:1.9;color:#aebdd2;text-wrap:pretty}
  #page-modul .section>h3{margin-top:38px!important;color:#edf4ff!important;letter-spacing:-.015em}
  #page-modul .cards{gap:16px}
  #page-modul .card{position:relative;overflow:hidden;isolation:isolate;border-color:rgba(148,163,184,.15);background:linear-gradient(145deg,rgba(17,31,52,.88),rgba(11,18,34,.92));box-shadow:0 16px 36px rgba(0,0,0,.17)}
  #page-modul .card::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 18% 0%,rgba(34,211,238,.12),transparent 43%);opacity:0;transform:scale(.86);transition:opacity .45s ease,transform .55s ease;pointer-events:none;z-index:-1}
  #page-modul .card:hover{transform:translateY(-4px);border-color:var(--chapter-accent);box-shadow:0 22px 48px rgba(0,0,0,.28)}
  #page-modul .card:hover::after{opacity:1;transform:scale(1.08)}
  #page-modul .tip-box,#page-modul .info-box,#page-modul .warn-box{border-radius:15px;box-shadow:0 12px 30px rgba(0,0,0,.12)}
  #page-modul .formula-block{position:relative;isolation:isolate;margin:22px 0;padding:22px 26px;border-radius:16px;background:linear-gradient(135deg,rgba(168,85,247,.1),rgba(34,211,238,.055));box-shadow:0 14px 34px rgba(0,0,0,.15);outline:1px solid transparent;outline-offset:-1px;font-size:15.5px;color:#dff7ff;transition:transform .38s cubic-bezier(.2,.8,.2,1),border-color .3s ease,box-shadow .38s ease,outline-color .3s ease,filter .3s ease}
  #page-modul .formula-block>*{position:relative;z-index:2}
  #page-modul .formula-block::before{content:'';position:absolute;inset:0;z-index:1;background:linear-gradient(105deg,transparent 34%,rgba(255,255,255,.12) 46%,rgba(103,232,249,.2) 52%,transparent 65%);background-size:240% 100%;background-position:140% 0;opacity:0;transition:background-position .72s cubic-bezier(.2,.8,.2,1),opacity .34s ease;pointer-events:none}
  #page-modul .formula-block::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 36%,rgba(255,255,255,.08) 47%,rgba(103,232,249,.12) 52%,transparent 63%);background-size:240% 100%;background-position:140% 0;animation:motionFormulaSweep 6.4s ease-in-out infinite;pointer-events:none}
  #page-modul .formula-block .formula-main{font-size:clamp(16px,1.5vw,18px);line-height:1.7;font-weight:600;color:#e6f8ff;text-shadow:0 0 18px rgba(103,232,249,.12);transition:color .3s ease,text-shadow .3s ease,filter .3s ease}
  #page-modul .formula-block .formula-label,#page-modul .formula-block .label{transition:transform .36s cubic-bezier(.2,.8,.2,1),color .3s ease,text-shadow .3s ease}
  #page-modul .formula-block:hover{transform:translate3d(5px,-5px,0);border-color:#67e8f9;outline-color:rgba(103,232,249,.55);box-shadow:0 22px 52px rgba(0,0,0,.3),0 0 34px rgba(103,232,249,.14);filter:brightness(1.07)}
  #page-modul .formula-block:hover::before{background-position:-40% 0;opacity:1}
  #page-modul .formula-block:hover .formula-label,#page-modul .formula-block:hover .label{transform:translateY(-1px) scale(1.04);color:#a5f3fc;text-shadow:0 0 18px rgba(103,232,249,.68)}
  #page-modul .formula-block:hover .formula-main{color:#fff;filter:brightness(1.08);text-shadow:0 0 20px rgba(103,232,249,.28)}
  #page-modul .card .formula{font-size:14.5px;color:#eee7ff;background:rgba(139,92,246,.12);border-color:rgba(196,181,253,.28)}
  #page-modul .formula-block .katex,#page-modul .card .formula .katex{color:inherit}
  #page-modul .anim-panel,#page-modul .tbl-wrap,#page-modul .code-wrap{border-color:rgba(148,163,184,.18);box-shadow:0 18px 45px rgba(0,0,0,.2)}
  #page-modul .tbl-wrap,#page-modul .code-wrap{border-radius:18px}
  #page-modul .tbl-wrap .table-caption{caption-side:top;box-sizing:border-box;text-align:left;padding:16px 24px;background:linear-gradient(90deg,#0d3b4a,#25205f 58%,#3b155c);border-bottom:1px solid #38577e}
  #page-modul footer{margin-top:32px;border-top-color:rgba(148,163,184,.13)}
  #modulSubnav a.is-current{color:#e0f2fe;background:linear-gradient(180deg,rgba(34,211,238,.1),rgba(168,85,247,.08))}
  #modulSubnav a.is-current::after{transform:scaleX(1);background:linear-gradient(90deg,#22d3ee,#a855f7)}
  #page-modul .reference-card{--reference-accent:var(--cyan);position:relative;overflow:hidden;isolation:isolate;outline:1px solid transparent;outline-offset:-1px;transition:transform .38s cubic-bezier(.2,.8,.2,1),box-shadow .38s ease,outline-color .3s ease,filter .3s ease}
  #page-modul .reference-card:nth-child(2){--reference-accent:var(--amber)}#page-modul .reference-card:nth-child(3){--reference-accent:var(--violet)}#page-modul .reference-card:nth-child(4){--reference-accent:var(--green)}#page-modul .reference-card:nth-child(5){--reference-accent:var(--pink)}
  #page-modul .reference-card>*{position:relative;z-index:2}#page-modul .reference-card::before{content:'';position:absolute;inset:0;z-index:1;background:linear-gradient(105deg,transparent 34%,rgba(255,255,255,.15) 47%,rgba(103,232,249,.2) 53%,transparent 66%);background-size:240% 100%;background-position:140% 0;opacity:0;transition:background-position .72s cubic-bezier(.2,.8,.2,1),opacity .34s ease;pointer-events:none}
  #page-modul .reference-card::after{content:'';position:absolute;inset:0;z-index:1;background:radial-gradient(circle at 12% 20%,rgba(103,232,249,.14),transparent 43%);opacity:0;transform:scale(.82);transition:opacity .38s ease,transform .48s ease;pointer-events:none}
  #page-modul .reference-card:hover{transform:translate3d(5px,-5px,0);outline-color:var(--reference-accent);box-shadow:0 22px 52px rgba(0,0,0,.3),0 0 34px rgba(103,232,249,.12);filter:brightness(1.07)}#page-modul .reference-card:hover::before{background-position:-40% 0;opacity:1}#page-modul .reference-card:hover::after{opacity:1;transform:scale(1.06)}

  body.modern-academic-design #page-modul.active .academic-hero .hero-content{animation:motionHeroArrive .9s cubic-bezier(.2,.8,.2,1) both}
  body.modern-academic-design #page-modul .academic-hero .hero-content::after{content:'';position:absolute;top:-45%;left:-38%;width:24%;height:190%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.16),rgba(103,232,249,.2),transparent);filter:blur(8px);transform:skewX(-18deg);animation:motionHeroSweep 7s ease-in-out infinite;pointer-events:none;mix-blend-mode:screen}
  #page-tugas .hero[data-tab="tugas"]{overflow:hidden;isolation:isolate}
  #page-tugas .hero[data-tab="tugas"]::after{animation:motionTaskAura 16s ease-in-out infinite}
  #page-tugas.active .hero-content{animation:motionTaskHeroArrive .85s cubic-bezier(.2,.8,.2,1) both}
  #page-tugas .hero-stats .stat{animation:motionTaskStatFloat 5s ease-in-out infinite}
  #page-tugas .hero-stats .stat:nth-child(2){animation-delay:-1.65s}#page-tugas .hero-stats .stat:nth-child(3){animation-delay:-3.3s}
  #page-tugas.active .score-bar{animation:motionScoreDock .78s cubic-bezier(.16,1,.3,1) both}
  #page-tugas .q-type-badge{position:relative;overflow:hidden;isolation:isolate}#page-tugas .q-type-badge::after{content:'';position:absolute;inset:0 auto 0 -45%;width:36%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent);transform:skewX(-18deg);animation:motionBadgeSweep 4.8s ease-in-out infinite;pointer-events:none}
  #page-tugas .mc-card,#page-tugas .comp-card{--motion-accent:#22d3ee;position:relative;overflow:hidden;isolation:isolate;transition:border-color .35s ease,box-shadow .4s ease,transform .4s cubic-bezier(.2,.8,.2,1)}#page-tugas .comp-card{--motion-accent:#fbbf24}#page-tugas .comp-card.comp-hard{--motion-accent:#ec4899}
  #page-tugas .mc-card::before,#page-tugas .comp-card::before{content:'';position:absolute;inset:18px auto 18px 0;width:3px;border-radius:0 999px 999px 0;background:linear-gradient(180deg,transparent,var(--motion-accent),transparent);opacity:.7;box-shadow:0 0 16px var(--motion-accent);pointer-events:none}
  #page-tugas .mc-card:hover,#page-tugas .comp-card:hover{transform:translateY(-4px);border-color:var(--motion-accent);box-shadow:0 22px 54px rgba(0,0,0,.3),0 0 30px rgba(34,211,238,.09)}
  #page-tugas .radio-option{position:relative;overflow:hidden;isolation:isolate;transition:border-color .22s ease,background .22s ease,transform .25s ease,box-shadow .25s ease}#page-tugas .radio-option:hover{transform:translateX(4px);box-shadow:0 8px 24px rgba(14,165,233,.08)}
  #page-tugas .mc-submit,#page-tugas .comp-submit{position:relative;overflow:hidden;isolation:isolate;transition:background .22s ease,border-color .22s ease,box-shadow .25s ease,transform .22s ease}#page-tugas .mc-submit:hover:not(:disabled),#page-tugas .comp-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 26px rgba(34,211,238,.18)}

  @keyframes academicAura{0%,100%{transform:translate3d(-4%,-2%,0) rotate(-6deg) scale(.94)}50%{transform:translate3d(5%,3%,0) rotate(8deg) scale(1.06)}}
  @keyframes motionHeroArrive{from{opacity:0;transform:translateY(24px) scale(.975);filter:blur(9px)}to{opacity:1;transform:none;filter:none}}
  @keyframes motionHeroSweep{0%,18%{left:-38%;opacity:0}28%{opacity:1}48%,100%{left:128%;opacity:0}}
  @keyframes motionRoadFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
  @keyframes motionArrowFlow{0%,100%{transform:translateX(-2px);opacity:.35}50%{transform:translateX(3px);opacity:1}}
  @keyframes motionChapterScan{0%{left:-32%;opacity:0}22%{opacity:1}100%{left:108%;opacity:0}}
  @keyframes motionFormulaSweep{0%,26%{background-position:140% 0;opacity:0}38%{opacity:1}58%,100%{background-position:-140% 0;opacity:0}}
  @keyframes motionTaskAura{0%,100%{transform:scale(1) rotate(0);opacity:.76}50%{transform:scale(1.09) rotate(2deg);opacity:1}}
  @keyframes motionTaskHeroArrive{from{opacity:0;transform:translateY(30px) scale(.97);filter:blur(10px)}to{opacity:1;transform:none;filter:none}}
  @keyframes motionTaskStatFloat{0%,100%{transform:translateY(0);box-shadow:0 0 0 transparent}50%{transform:translateY(-4px);box-shadow:0 12px 30px rgba(14,165,233,.08)}}
  @keyframes motionScoreDock{from{opacity:0;transform:translateY(-20px) scale(.975);filter:blur(8px)}to{opacity:1;transform:none;filter:none}}
  @keyframes motionBadgeSweep{0%,34%{left:-45%;opacity:0}46%{opacity:1}66%,100%{left:128%;opacity:0}}
}
@media screen and (max-width:700px){
  .reading-position{display:none}#page-modul .academic-hero{min-height:auto;padding:116px 14px 36px}#page-modul .academic-hero .hero-content{padding:28px 18px;border-radius:22px}#page-modul .academic-hero .hero-title{font-size:clamp(42px,14vw,62px)}
  .academic-roadmap{display:grid;grid-template-columns:1fr;gap:8px}.academic-roadmap .road-arrow{display:none}.academic-roadmap small{white-space:normal}
  #page-modul .academic-hero .stat{min-width:calc(50% - 8px);padding:11px 12px}#page-modul .section{width:calc(100% - 24px);padding:26px 20px;border-radius:20px}#page-modul .divider{height:14px}#page-modul .section-desc{font-size:15.5px;line-height:1.78}#page-modul .cards{grid-template-columns:1fr}
}
@media(prefers-reduced-motion:reduce){
  #page-modul .academic-hero::before,#page-modul .academic-hero .hero-content,#page-modul .academic-hero .hero-content::after,#page-modul .academic-roadmap .road-step,#page-modul .academic-roadmap .road-arrow,#page-modul .section,#page-modul .section::after,#page-modul .formula-block::after,#page-tugas .hero[data-tab="tugas"]::after,#page-tugas .hero-content,#page-tugas .hero-stats .stat,#page-tugas .score-bar,#page-tugas .q-type-badge::after{animation:none!important;transition-duration:.01ms!important}
  #page-modul .card,#page-modul .formula-block,#page-modul .formula-block::before,#page-modul .formula-block .formula-label,#page-modul .formula-block .formula-main,.reading-position{transition:none!important}#page-modul .formula-block:hover{transform:none!important}
}
</style>`;

const runtime = `<script id="modern-academic-runtime">
(() => {
  const page = document.getElementById('page-modul');
  if (!page) return;
  document.body.classList.add('modern-academic-design');
  for (const selector of ['#subnavKiri','#subnavKanan']) {
    document.querySelectorAll(selector).forEach((element, index) => { if (index > 0) element.remove(); });
  }
  const hero = page.querySelector('.hero[data-tab="modul"]');
  if (hero) hero.classList.add('academic-hero');
  const moduleMatch = location.pathname.match(/Modul-(\\d+)\\.html/i) || document.title.match(/Modul\\s+(\\d+)/i);
  if (hero && moduleMatch) hero.dataset.moduleNumber = String(moduleMatch[1]).padStart(2, '0');

  let position = document.getElementById('readingPosition');
  if (!position) {
    position = document.createElement('div');
    position.className = 'reading-position';
    position.id = 'readingPosition';
    position.setAttribute('aria-hidden', 'true');
    position.innerHTML = '<span>Bagian</span><strong id="readingPositionValue">01 / 01</strong>';
    const progress = document.getElementById('scrollProgress');
    if (progress) progress.insertAdjacentElement('afterend', position); else document.body.prepend(position);
  }
  let positionValue = document.getElementById('readingPositionValue');
  const sections = [...page.querySelectorAll('.section[id^="m-"]')];
  const links = [...document.querySelectorAll('#modulSubnav a[href^="#m-"]')];
  const accents = ['#22d3ee','#a855f7','#fbbf24','#34d399','#ec4899'];
  sections.forEach((section, index) => section.style.setProperty('--chapter-accent', accents[index % accents.length]));
  const setCurrent = id => {
    const index = Math.max(0, sections.findIndex(section => section.id === id));
    if (positionValue) positionValue.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(sections.length).padStart(2, '0');
    links.forEach(link => {
      const current = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-current', current);
      if (current) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  };
  const syncVisibility = () => position.classList.toggle('is-visible', page.classList.contains('active'));
  new MutationObserver(syncVisibility).observe(page, {attributes:true, attributeFilter:['class']});
  if (sections.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-in-view', entry.isIntersecting));
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setCurrent(visible.target.id);
    }, {rootMargin:'-118px 0px -58% 0px', threshold:[0,.15,.35]});
    sections.forEach(section => observer.observe(section));
    setCurrent(sections[0].id);
  }
  syncVisibility();

  document.addEventListener('click', event => {
    if (!event.target.closest('.nav-tab')) return;
    requestAnimationFrame(() => window.scrollTo({top:0, behavior:'smooth'}));
  }, true);
})();
</script>`;

const removeBlock = (html, tag, id) => html.replace(
  new RegExp(`[\\r\\n]*<${tag} id="${id}">[\\s\\S]*?<\\/${tag}>`, "g"),
  "",
);

let changedFiles = 0;
let totalSections = 0;
for (const course of courseRoots) {
  for (let moduleNumber = 1; moduleNumber <= 14; moduleNumber += 1) {
    const file = path.join(root, course, "Modul", `Modul-${moduleNumber}.html`);
    const original = fs.readFileSync(file, "utf8");
    const eol = original.includes("\r\n") ? "\r\n" : "\n";
    let html = original;

    for (const id of ["modern-academic-design", "modern-academic-pilot", "modern-academic-motion", "sisken-formula-hover"]) html = removeBlock(html, "style", id);
    for (const id of ["modern-academic-runtime", "modern-academic-pilot-runtime"]) html = removeBlock(html, "script", id);

    html = html.replace(/<body(?: class="([^"]*)")?>/, (_, classes = "") => {
      const next = new Set(classes.split(/\s+/).filter(Boolean));
      next.delete("modern-academic-pilot");
      next.add("modern-academic-design");
      return `<body class="${[...next].join(" ")}">`;
    });

    const heroPattern = /<div class="hero(?: academic-hero)?" data-tab="modul"(?: data-module-number="\d+")?([^>]*)>/;
    if (!heroPattern.test(html)) throw new Error(`${course} Modul ${moduleNumber}: hero Modul tidak ditemukan`);
    html = html.replace(heroPattern, `<div class="hero academic-hero" data-tab="modul" data-module-number="${String(moduleNumber).padStart(2, "0")}"$1>`);

    const pageStart = html.indexOf('<div class="page active" id="page-modul">');
    const pageEnd = pageStart < 0 ? -1 : html.indexOf('<!-- end page-modul -->', pageStart);
    if (pageStart < 0 || pageEnd < 0) throw new Error(`${course} Modul ${moduleNumber}: batas page-modul tidak ditemukan`);
    const pageHtml = html.slice(pageStart, pageEnd);
    const sectionCount = (pageHtml.match(/<div class="section" id="m-[^"]+">/g) || []).length;
    if (sectionCount < 1) throw new Error(`${course} Modul ${moduleNumber}: section materi tidak ditemukan`);
    totalSections += sectionCount;

    if (!pageHtml.includes('class="academic-roadmap"')) {
      const statsIndex = html.indexOf('<div class="hero-stats">', pageStart);
      if (statsIndex < 0 || statsIndex > pageEnd) throw new Error(`${course} Modul ${moduleNumber}: hero-stats tidak ditemukan`);
      html = html.slice(0, statsIndex) + roadmap.replace(/\n/g, eol) + eol + "    " + html.slice(statsIndex);
    }

    if (!html.includes('id="readingPosition"')) {
      const progress = '<div id="scrollProgress"></div>';
      if (!html.includes(progress)) throw new Error(`${course} Modul ${moduleNumber}: scrollProgress tidak ditemukan`);
      const reading = `<div class="reading-position is-visible" id="readingPosition" aria-hidden="true"><span>Bagian</span><strong id="readingPositionValue">01 / ${String(sectionCount).padStart(2, "0")}</strong></div>`;
      html = html.replace(progress, `${progress}${eol}${reading}`);
    }

    html = html.replace(
      /\s*if \(tab === 'tugas'\) \{\s*const scoreBar = document\.querySelector\('#page-tugas \.score-bar'\);\s*const top = scoreBar \? window\.scrollY \+ scoreBar\.getBoundingClientRect\(\)\.top - 72 : 0;\s*window\.scrollTo\(\{ top, behavior: 'auto' \}\);\s*\} else \{\s*window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);\s*\}/g,
      `${eol}  window.scrollTo({ top: 0, behavior: 'smooth' });`,
    );
    if (html.includes("const scoreBar = document.querySelector('#page-tugas .score-bar')")) throw new Error(`${course} Modul ${moduleNumber}: scroll Tugas masih menuju panel skor`);

    if (!html.includes("</head>") || !html.includes("</body>")) throw new Error(`${course} Modul ${moduleNumber}: penutup dokumen tidak lengkap`);
    html = html.replace("</head>", `${eol}${style.replace(/\n/g, eol)}${eol}</head>`);
    const bodyClose = html.lastIndexOf("</body>");
    html = html.slice(0, bodyClose) + runtime.replace(/\n/g, eol) + eol + html.slice(bodyClose);
    if (html !== original) {
      fs.writeFileSync(file, html, "utf8");
      changedFiles += 1;
    }
  }
}

const guideFile = path.join(root, "Pedoman-Modul.md");
const guideOriginal = fs.readFileSync(guideFile, "utf8");
const oldGuideText = "Khusus Sisken, hero Tugas setinggi `60vh`, tab Tugas langsung menggulir ke panel, `body` memakai `overflow-x:clip` dan `overflow-y:visible`, sedangkan overlay login tetap menggulir di kontainernya sendiri.";
const newGuideText = "Hero Tugas setinggi `60vh`; ketika tab Tugas dibuka halaman kembali ke hero/top, bukan langsung ke panel skor. Khusus Sisken, `body` memakai `overflow-x:clip` dan `overflow-y:visible`, sedangkan overlay login tetap menggulir di kontainernya sendiri.";
if (guideOriginal.includes(oldGuideText)) fs.writeFileSync(guideFile, guideOriginal.replace(oldGuideText, newGuideText), "utf8");

console.log(`Applied modern academic design to 56 modules (${totalSections} sections); changed ${changedFiles} files.`);
