/* TEMA-PREMIUM: (1) emoji berwarna -> ikon garis satu warna (font Noto Emoji),
   (2) teks terang di atas latar kuning -> hitam, (3) teks < 12 px -> 12 px.
   Bekerja bertahap: hanya subpohon yang berubah yang diproses ulang. */
(function () {
  var RX = /\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*/gu;
  var LEWATI = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, NOSCRIPT: 1, OPTION: 1 };
  var SATU = /rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/;
  var SEMUA = /rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/g;
  function kuning(r, g, b) { return r > 200 && g > 160 && b < 120; }

  /* Latar efektif: warna latar pekat, atau gradien yang semua warnanya kuning pekat. */
  var cache = new Map();
  function latar(el) {
    if (cache.has(el)) return cache.get(el);
    var hasil = null, cs = getComputedStyle(el);
    var m = cs.backgroundColor.match(SATU);
    if (m && (m[4] === undefined || +m[4] > 0.5)) hasil = kuning(+m[1], +m[2], +m[3]);
    else if (cs.backgroundImage.indexOf('linear-gradient') === 0 &&
             cs.webkitBackgroundClip !== 'text' && cs.backgroundClip !== 'text' &&
             cs.backgroundImage.indexOf('), linear') < 0) {
      var w = cs.backgroundImage.match(SEMUA) || [], semua = w.length > 0;
      for (var i = 0; i < w.length; i++) {
        var k = w[i].match(SATU);
        if (!(k[4] === undefined || +k[4] > 0.5) || !kuning(+k[1], +k[2], +k[3])) { semua = false; break; }
      }
      if (semua) hasil = true;
    }
    if (hasil === null) hasil = el.parentElement && el.parentElement !== document.documentElement ? latar(el.parentElement) : false;
    cache.set(el, hasil);
    return hasil;
  }

  function bungkus(akar) {
    var w = document.createTreeWalker(akar, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentElement;
        if (!p || LEWATI[p.tagName] || p.closest('svg,.tp-emoji,[contenteditable="true"]')) return NodeFilter.FILTER_REJECT;
        RX.lastIndex = 0;
        return RX.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var daftar = [];
    while (w.nextNode()) daftar.push(w.currentNode);
    daftar.forEach(function (n) {
      var teks = n.nodeValue, frag = document.createDocumentFragment(), akhir = 0, m;
      RX.lastIndex = 0;
      while ((m = RX.exec(teks))) {
        if (m.index > akhir) frag.appendChild(document.createTextNode(teks.slice(akhir, m.index)));
        var s = document.createElement('span');
        s.className = 'tp-emoji';
        s.textContent = m[0];
        frag.appendChild(s);
        akhir = m.index + m[0].length;
      }
      if (akhir < teks.length) frag.appendChild(document.createTextNode(teks.slice(akhir)));
      n.parentNode.replaceChild(frag, n);
    });
  }

  /* Warna ikon, kontras teks, dan ukuran minimum untuk satu subpohon. */
  function rapikan(akar) {
    var semua = akar.querySelectorAll ? akar.querySelectorAll('*') : [];
    for (var i = -1; i < semua.length; i++) {
      var el = i < 0 ? akar : semua[i];
      if (!el.classList || LEWATI[el.tagName] || el.closest('svg')) continue;
      if (el.classList.contains('tp-emoji')) { el.classList.toggle('tp-emoji-gelap', latar(el)); continue; }
      var adaTeks = false;
      for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.nodeValue.trim()) { adaTeks = true; break; }
      if (!adaTeks) continue;
      var cs = getComputedStyle(el);
      if (latar(el)) {
        if (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text') el.classList.add('tp-teks-gelap');
        else {
          var c = (cs.color.match(/\d+/g) || [0, 0, 0]).map(Number);
          if (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2] > 140) el.classList.add('tp-teks-gelap');
        }
      } else if (el.classList.contains('tp-teks-gelap')) el.classList.remove('tp-teks-gelap');
      if (!el.classList.contains('tp-min') && parseFloat(cs.fontSize) < 12 &&
          !el.closest('.katex,math,sup,sub')) el.classList.add('tp-min');
    }
  }

  function proses(akar) { bungkus(akar); rapikan(akar); }

  var antre = new Set(), tunggu = null;
  function jadwal(el) {
    if (!el || el.nodeType !== 1) return;
    antre.add(el);
    if (tunggu) return;
    tunggu = setTimeout(function () {
      tunggu = null;
      cache = new Map();
      var daftar = Array.from(antre);
      antre.clear();
      /* Buang simpul yang sudah tercakup leluhurnya atau sudah lepas dari dokumen. */
      daftar = daftar.filter(function (a) {
        if (!a.isConnected) return false;
        for (var j = 0; j < daftar.length; j++) if (daftar[j] !== a && daftar[j].contains(a)) return false;
        return true;
      });
      if (daftar.length > 40) daftar = [document.body];
      daftar.forEach(proses);
    }, 520);  /* sesudah transisi warna latar (.3 s) selesai */
  }

  function bersih(kelas) { return (kelas || '').replace(/\s*\btp-(?:teks-gelap|min|emoji-gelap)\b/g, '').trim(); }

  function mulai() {
    proses(document.body);
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) {
        var m = ms[i], t = m.target;
        if (m.type === 'childList') {
          if (t.classList && t.classList.contains('tp-emoji')) continue;
          if (m.addedNodes.length) jadwal(t);
        } else if (m.type === 'characterData') {
          if (t.parentElement && !t.parentElement.classList.contains('tp-emoji')) jadwal(t.parentElement);
        } else if (t.classList && !t.classList.contains('tp-emoji') &&
                   bersih(m.oldValue) !== bersih(t.getAttribute('class'))) jadwal(t);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeOldValue: true, attributeFilter: ['class'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai);
  else mulai();
})();
