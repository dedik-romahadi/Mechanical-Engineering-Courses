/* TEMA-PREMIUM: emoji berwarna -> siluet satu warna (kuning di latar gelap,
   hitam di latar kuning). Bayangan teks 0 0 0 tanpa blur = bentuk tegas, bukan cahaya. */
(function () {
  var RX = /\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*/gu;
  var LEWATI = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, NOSCRIPT: 1, svg: 1, SVG: 1, OPTION: 1 };

  var RGB = /rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/g;
  function kuning(r, g, b) { return r > 200 && g > 160 && b < 120; }
  var cache = new Map();
  /* Latar efektif: warna latar pekat, atau gradien yang semua warnanya pekat
     (latar kuning di tema ini sering berupa linear-gradient kuning-kuning). */
  function latar(el) {
    if (cache.has(el)) return cache.get(el);
    var hasil = null, cs = getComputedStyle(el);
    var m = cs.backgroundColor.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
    if (m && (m[4] === undefined || +m[4] > 0.5)) hasil = kuning(+m[1], +m[2], +m[3]);
    else if (cs.backgroundImage.indexOf('linear-gradient') === 0 &&
             cs.webkitBackgroundClip !== 'text' && cs.backgroundClip !== 'text' &&
             cs.backgroundImage.indexOf('), linear') < 0) {
      var w = cs.backgroundImage.match(RGB) || [], semua = w.length > 0;
      for (var i = 0; i < w.length; i++) {
        var k = w[i].match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
        if (!(k[4] === undefined || +k[4] > 0.5) || !kuning(+k[1], +k[2], +k[3])) { semua = false; break; }
      }
      if (semua) hasil = true;
    }
    if (hasil === null) hasil = el.parentElement && el.parentElement !== document.documentElement ? latar(el.parentElement) : false;
    cache.set(el, hasil);
    return hasil;
  }
  function latarKuning(el) { return latar(el); }

  /* Teks terang (putih/abu/kuning) di atas latar kuning -> hitam pekat. */
  function kontras() {
    var semua = document.body.querySelectorAll('*');
    for (var i = 0; i < semua.length; i++) {
      var el = semua[i];
      if (el.closest('svg') || el.classList.contains('tp-emoji')) continue;
      var adaTeks = false;
      for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.nodeValue.trim()) { adaTeks = true; break; }
      if (!adaTeks) continue;
      var ya = latar(el);
      if (ya) {
        var cs = getComputedStyle(el);
        if (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text') { el.classList.add('tp-teks-gelap'); continue; }
        var c = (cs.color.match(/\d+/g) || [0, 0, 0]).map(Number);
        if (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2] > 140) el.classList.add('tp-teks-gelap');
      } else if (el.classList.contains('tp-teks-gelap')) el.classList.remove('tp-teks-gelap');
    }
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
    warnai(akar);
  }

  function warnai(akar) {
    var el = akar.querySelectorAll ? akar.querySelectorAll('.tp-emoji') : [];
    for (var i = 0; i < el.length; i++) el[i].classList.toggle('tp-emoji-gelap', latarKuning(el[i]));
  }

  var antre = null;
  function jadwal() {
    if (antre) return;
    antre = setTimeout(function () { antre = null; cache = new Map(); bungkus(document.body); kontras(); }, 250);
  }

  function mulai() {
    bungkus(document.body);
    kontras();
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) {
        if (ms[i].type === 'childList' && ms[i].addedNodes.length) {
          var t = ms[i].target;
          if (!(t.classList && t.classList.contains('tp-emoji'))) { jadwal(); return; }
        }
        if (ms[i].type === 'attributes' && !ms[i].target.classList.contains('tp-emoji') &&
            ms[i].oldValue !== null && ms[i].oldValue.replace(/\s*tp-teks-gelap/g, '') !==
            (ms[i].target.getAttribute('class') || '').replace(/\s*tp-teks-gelap/g, '')) { jadwal(); return; }
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeOldValue: true, attributeFilter: ['class'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai);
  else mulai();
})();
