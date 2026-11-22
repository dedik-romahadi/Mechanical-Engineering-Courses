/* TEMA-PREMIUM: emoji berwarna -> siluet satu warna (kuning di latar gelap,
   hitam di latar kuning). Bayangan teks 0 0 0 tanpa blur = bentuk tegas, bukan cahaya. */
(function () {
  var RX = /\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*/gu;
  var LEWATI = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, NOSCRIPT: 1, svg: 1, SVG: 1, OPTION: 1 };

  function latarKuning(el) {
    for (var e = el; e && e !== document.documentElement; e = e.parentElement) {
      var m = getComputedStyle(e).backgroundColor.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
      if (m && (m[4] === undefined || +m[4] > 0.5)) return +m[1] > 200 && +m[2] > 160 && +m[3] < 120;
    }
    return false;
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
    antre = setTimeout(function () { antre = null; bungkus(document.body); }, 250);
  }

  function mulai() {
    bungkus(document.body);
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) {
        if (ms[i].type === 'childList' && ms[i].addedNodes.length) {
          var t = ms[i].target;
          if (!(t.classList && t.classList.contains('tp-emoji'))) { jadwal(); return; }
        }
        if (ms[i].type === 'attributes' && !ms[i].target.classList.contains('tp-emoji')) { jadwal(); return; }
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai);
  else mulai();
})();
