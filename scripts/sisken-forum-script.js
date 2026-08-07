const FORUM_MIN_WORDS = 30;

function countWords(str) {
  return (str || '').trim().split(/\s+/).filter(w => w.length > 0).length;
}

function checkForumReady() {
  const ids = ['ans-fq1', 'ans-fq2', 'ans-fq3'];
  const btn = document.getElementById('btn-copy-forum');

  let allFilled = true;
  let totalWords = 0, doneCount = 0;
  const wcs = [];
  ids.forEach((id, i) => {
    const el  = document.getElementById(id);
    const wc  = countWords(el ? el.value : '');
    const ok  = wc >= FORUM_MIN_WORDS;
    wcs.push(wc);
    totalWords += wc;
    if (ok) doneCount++;
    const ind = document.getElementById('wc-fq' + (i + 1));
    if (ind) {
      ind.textContent = wc + ' / min ' + FORUM_MIN_WORDS + ' kata';
      ind.style.color = ok ? 'var(--green)' : (wc > 0 ? 'var(--amber)' : 'var(--muted)');
    }
    const stat = document.getElementById('forumQ' + (i + 1) + 'Stat');
    if (stat) stat.textContent = wc;
    if (!ok) allFilled = false;
  });

  // Forum pilihan ganda (PG) status — count answered polls
  const pollEls = document.querySelectorAll('.poll-opts[id^="fp"]');
  const totalPolls = pollEls.length;
  let pollsDone = 0;
  pollEls.forEach(p => { if (p.dataset.done) pollsDone++; });
  const pgStatEl = document.getElementById('forumPGStat');
  if (pgStatEl) pgStatEl.textContent = pollsDone;
  const pgTotalEl = document.getElementById('forumPGTotal');
  if (pgTotalEl) pgTotalEl.textContent = totalPolls;
  const pgRemaining = Math.max(0, totalPolls - pollsDone);
  if (pgRemaining > 0) allFilled = false;

  // Update forum status panel (mirrors the Tugas score-bar)
  const minTotal = FORUM_MIN_WORDS * ids.length;
  const totEl = document.getElementById('forumWordTotal');
  if (totEl) {
    const prevTotal = parseInt(totEl.textContent, 10) || 0;
    totEl.textContent = totalWords;
    if (totalWords > prevTotal) {
      totEl.classList.remove('forum-word-pulse');
      void totEl.offsetWidth;
      totEl.classList.add('forum-word-pulse');
      setTimeout(() => totEl.classList.remove('forum-word-pulse'), 700);
    }
  }
  const detEl = document.getElementById('forumWordDetail');
  if (detEl) detEl.textContent = totalWords + ' / ' + minTotal + ' kata · ' + doneCount + ' / ' + ids.length + ' jawaban lengkap';
  const fillEl = document.getElementById('forumWordFill');
  if (fillEl) fillEl.style.width = Math.min(100, (totalWords / minTotal) * 100) + '%';
  const blockedEl = document.getElementById('forum-blocked-msg');
  if (blockedEl) {
    if (allFilled) {
      blockedEl.textContent = '';
    } else {
      const parts = [];
      ids.forEach((_, i) => {
        if (wcs[i] < FORUM_MIN_WORDS) parts.push('Q' + (i + 1) + ' kurang ' + (FORUM_MIN_WORDS - wcs[i]) + ' kata');
      });
      if (pgRemaining > 0) parts.push(pgRemaining + ' pilihan ganda belum dipilih');
      blockedEl.textContent = '⚠ ' + parts.join(' · ');
    }
  }

  if (!btn) return;
  _setBtnState(btn, allFilled);   // PEDOMAN §15.4b: explicit setters
  _saveDraft();                    // PEDOMAN §15.4: persist forum textareas on every check

  // FIX v2 (Apr 2026): auto-populate output textarea when forum is ready.
  // Ini menghilangkan dependency pada button click — mahasiswa tidak perlu
  // klik tombol Copy untuk mendapat HTML; cukup isi 3 jawaban (≥30 kata),
  // HTML otomatis muncul di textarea bawah, mahasiswa Ctrl+C manual.
  if (allFilled) {
    try {
      const _autoHtml = buildForumHtml();
      if (_autoHtml && _autoHtml.length > 100) {
        _populateForumOutput(_autoHtml);
      }
    } catch(e) { /* identity belum ada / textarea belum ready — silent */ }
  }
}

// ── COPY FORUM HTML TO CLIPBOARD ──
function copyForumHtml() {
  const btn = document.getElementById('btn-copy-forum');
  const msg = document.getElementById('copy-forum-msg');
  const ids = ['ans-fq1', 'ans-fq2', 'ans-fq3'];
  const labels = ['Pertanyaan 1', 'Pertanyaan 2', 'Pertanyaan 3'];
  const short = ids.map((id, i) => {
    const wc = countWords(document.getElementById(id)?.value || '');
    return wc < FORUM_MIN_WORDS ? `${labels[i]} (${wc}/${FORUM_MIN_WORDS} kata)` : null;
  }).filter(Boolean);
  if (short.length) {
    if (msg) { msg.style.color = 'var(--amber)'; msg.textContent = '⚠ Jawaban terlalu singkat: ' + short.join(' · '); }
    return;
  }
  let htmlCode;
  try { htmlCode = buildForumHtml(); }
  catch(err) {
    console.error('[Forum] buildForumHtml failed:', err);
    if (msg) { msg.style.color = 'var(--pink, #ef4444)'; msg.textContent = '❌ Gagal generate HTML: ' + (err.message || err); }
    return;
  }
  if (!htmlCode || htmlCode.length < 100) {
    if (msg) { msg.style.color = 'var(--pink, #ef4444)'; msg.textContent = '❌ HTML kosong atau invalid. Cek console.'; }
    console.error('[Forum] HTML output too short:', htmlCode);
    return;
  }
  // ALWAYS populate output textarea + show output area FIRST (foolproof manual fallback)
  _populateForumOutput(htmlCode);

  if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
    navigator.clipboard.writeText(htmlCode).then(() => { _showCopySuccess(btn, msg); })
      .catch((err) => { console.warn('[Forum] Clipboard API failed, trying fallback:', err); fallbackCopy(htmlCode, btn, msg); });
  } else {
    fallbackCopy(htmlCode, btn, msg);
  }
}

// ── ALWAYS-VISIBLE HTML OUTPUT (foolproof manual copy fallback) ──
function _populateForumOutput(htmlCode) {
  const out = document.getElementById('forum-html-output');
  const ta  = document.getElementById('forum-html-textarea');
  if (out && ta) {
    ta.value = htmlCode;
    out.style.display = 'block';
    setTimeout(() => {
      try { out.scrollIntoView({behavior:'smooth', block:'nearest'}); } catch(e){}
    }, 100);
  }
}

function selectForumHtmlAll() {
  const ta = document.getElementById('forum-html-textarea');
  if (!ta || !ta.value) return;
  ta.focus();
  ta.select();
  ta.setSelectionRange(0, ta.value.length);
}

function copyForumHtmlManual() {
  const ta = document.getElementById('forum-html-textarea');
  const msg = document.getElementById('copy-forum-msg');
  if (!ta || !ta.value) return;

  selectForumHtmlAll();

  if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
    navigator.clipboard.writeText(ta.value).then(() => {
      if (msg) {
        msg.style.color = 'var(--green)';
        msg.textContent = '✅ Tersalin lagi! Paste sekarang di Fast Learning.';
      }
    }).catch(() => {
      _execCopyFallback(ta, msg);
    });
  } else {
    _execCopyFallback(ta, msg);
  }
}