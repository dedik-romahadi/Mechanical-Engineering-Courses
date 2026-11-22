/* TEMA-PREMIUM (warna, di akhir badan dokumen): memetakan warna isi halaman ke palet premium di
   peramban, memakai pustaka window.__tp dari awal.js. Yang dipetakan:
     1. semua aturan CSS (CSSOM) blok style halaman, termasuk yang ditambahkan belakangan;
     2. gaya inline elemen HTML (juga yang ditulis JavaScript belakangan);
     3. warna gambar SVG (atribut fill/stroke/stop-color dan gaya inline) -> kuning-putih;
   lalu struktur tema: roda gigi di setiap cover, label bagian soal cukup nama bagiannya,
   dan ikon bagian soal (🅐–🅓 -> ikon bergambar). Pemetaan tidak pernah diterapkan dua kali pada nilai yang
   sama (abu menengah dicerahkan sekali saja). */
(function () {
  var T = window.__tp;
  if (!T) return;
  var MILIK = /^tema-premium/;
  var CSS_WARNA = /color|background|border|outline|shadow|fill|stroke|filter|^--|caret|column-rule|text-decoration/;

  /* Satu deklarasi: nilai baru, atau null bila tidak berubah. */
  function nilaiBaru(prop, v, mode) {
    var b = v;
    if (prop === 'box-shadow' || prop === 'text-shadow' || prop === 'backdrop-filter' || prop === '-webkit-backdrop-filter') {
      b = /^\s*none\s*$/.test(v) ? v : 'none';
    } else if (prop === 'filter' && /blur\(|drop-shadow\(/.test(v)) {
      b = 'none';
    } else {
      if (v.indexOf('radial-gradient(') >= 0) b = T.buangRadial(b);
      if (prop.indexOf('--') === 0) {
        var t = T.gantiTriplet(b, mode);
        b = t !== b ? t : T.gantiWarna(b, mode);
      } else b = T.gantiWarna(b, mode);
    }
    return b === v ? null : b;
  }

  /* Warna makna. Variabel --green/--pink di :root ikut dipetakan ke kuning (dipakai juga di luar
     makna), jadi deklarasi benar/salah yang merujuknya (".feedback.correct{color:var(--green)}",
     ".wrong-ans{border-color:var(--pink)}") diberi nilai literal: hijau/merah halaman itu sendiri,
     dibaca sebelum apa pun dipetakan. */
  function rgbDari(v) {
    var d = document.createElement('i');
    d.style.color = v;
    if (!d.style.color) return null;
    document.documentElement.appendChild(d);
    var m = getComputedStyle(d).color.match(/\d+(?:\.\d+)?/g);
    d.remove();
    return m ? [+m[0], +m[1], +m[2]] : null;
  }
  function warnaVar(nama, uji, cadangan) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(nama).trim();
    var c = v && rgbDari(v);
    return c && uji(c) ? 'rgb(' + c.join(', ') + ')' : cadangan;
  }
  var HIJAU_MAKNA = warnaVar('--green', T.hijauP, '#22c55e');
  var MERAH_MAKNA = warnaVar('--red', T.merah, warnaVar('--pink', T.merah, '#ef4444'));
  var RX_VAR_HIJAU = /var\(\s*--(?:green|hijau|success|emerald|lime)\b[^()]*\)/g;
  var RX_VAR_MERAH = /var\(\s*--(?:red|merah|pink|rose|danger|error)\b[^()]*\)/g;
  function sulihMakna(st, benar, salah) {
    if (!benar && !salah) return;
    var nama = [];
    for (var i = 0; i < st.length; i++) nama.push(st[i]);
    for (var q = 0; q < PINTAS.length; q++) if ((st.getPropertyValue(PINTAS[q]) || '').indexOf('var(') >= 0) nama.push(PINTAS[q]);
    for (i = 0; i < nama.length; i++) {
      var v = st.getPropertyValue(nama[i]);
      if (!v || v.indexOf('var(') < 0) continue;
      var b = v;
      if (benar) b = b.replace(RX_VAR_HIJAU, HIJAU_MAKNA);
      if (salah) b = b.replace(RX_VAR_MERAH, MERAH_MAKNA);
      if (b !== v) st.setProperty(nama[i], b, st.getPropertyPriority(nama[i]));
    }
  }

  /* Deklarasi gaya (aturan CSS atau gaya inline). Nilai yang sudah pernah dipetakan
     (dicatat per objek) tidak dipetakan ulang. */
  var catatan = new WeakMap();
  /* Deklarasi pintas bernilai var(): nilai panjangnya kosong di CSSOM, jadi yang dipetakan
     pintasnya sendiri. */
  var PINTAS = ['background', 'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
                'border-color', 'outline', 'border-block', 'border-inline'];
  function petakanDeklarasi(st, mode) {
    var sudah = catatan.get(st) || {}, ubah = [], nama = [];
    for (var i = 0; i < st.length; i++) nama.push(st[i]);
    for (var q = 0; q < PINTAS.length; q++) {
      var ps = st.getPropertyValue(PINTAS[q]);
      if (ps && ps.indexOf('var(') >= 0) nama.push(PINTAS[q]);
    }
    for (i = 0; i < nama.length; i++) {
      var p = nama[i];
      if (!CSS_WARNA.test(p)) continue;
      var v = st.getPropertyValue(p);
      if (!v || sudah[p] === v) continue;
      var b = nilaiBaru(p, v, mode);
      if (b !== null) ubah.push([p, b, st.getPropertyPriority(p)]);
      else sudah[p] = v;
    }
    for (var j = 0; j < ubah.length; j++) {
      st.setProperty(ubah[j][0], ubah[j][1], ubah[j][2]);
      sudah[ubah[j][0]] = st.getPropertyValue(ubah[j][0]);
    }
    catatan.set(st, sudah);
  }

  /* 1. CSSOM. */
  var lembarSelesai = new WeakSet();
  function aturan(daftar, gelap) {
    for (var i = 0; i < daftar.length; i++) {
      var r = daftar[i];
      if (r.cssRules && !r.style) aturan(r.cssRules, gelap);           /* @media, @supports, @keyframes */
      else if (r.style) {
        var sel = r.selectorText || r.keyText || '';
        if (!gelap) sulihMakna(r.style, T.BENAR.test(sel), T.SALAH.test(sel));
        petakanDeklarasi(r.style, gelap ? 'gelap' : (T.BENAR.test(sel) ? 'benar' : 'isi'));
        if (r.cssRules && r.cssRules.length) aturan(r.cssRules, gelap);  /* CSS bersarang */
      }
    }
  }
  function lembar(sh) {
    if (lembarSelesai.has(sh)) return;
    var pemilik = sh.ownerNode;
    if (pemilik && pemilik.id && MILIK.test(pemilik.id)) { lembarSelesai.add(sh); return; }
    var r;
    try { r = sh.cssRules; } catch (e) { lembarSelesai.add(sh); return; }  /* lintas asal (font, KaTeX) */
    if (!r) return;
    lembarSelesai.add(sh);
    aturan(r, !!(pemilik && pemilik.closest && pemilik.closest('svg')));
  }
  function semuaLembar() { for (var i = 0; i < document.styleSheets.length; i++) lembar(document.styleSheets[i]); }

  /* 2-3. Elemen: gaya inline dan warna SVG. */
  var ATR_SVG = ['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color', 'color'];
  var atrSudah = new WeakMap();
  function konteksTeks(el) {
    var t = (el.textContent || '').slice(0, 250) + ' ' + (el.className && el.className.baseVal === undefined ? el.className : '');
    return t;
  }
  /* Gambar/area yang warnanya bermakna di dunia nyata (lampu lalu lintas, zona alarm, ...):
     daftar selektor per halaman dari terapkan.py (window.__tpKecuali). Tidak dipetakan. */
  function dikecualikan(el) { return T.modeUnsur(el) === 'asli'; }
  function keluargaMode(v, makna) {
    return makna && T.dipertahankan(v) ? null : T.keluargaTeks(v);
  }

  /* Pola SVG bersama untuk keluarga berpola (arsir kuning / arsir abu). */
  function pasangPola() {
    if (document.getElementById('tp-pola-svg')) return;
    var d = document.createElement('div');
    d.innerHTML = '<svg id="tp-pola-svg" class="tp-pola" width="0" height="0" aria-hidden="true" ' +
      'style="position:absolute;width:0;height:0;overflow:hidden" xmlns="http://www.w3.org/2000/svg"><defs>' +
      '<pattern id="tp-arsir-merah" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">' +
      '<rect width="6" height="6" fill="rgba(255,214,10,0.14)"/><rect width="2.2" height="6" fill="#ffd60a"/></pattern>' +
      '<pattern id="tp-arsir-ungu" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">' +
      '<rect width="6" height="6" fill="rgba(150,150,156,0.14)"/><rect width="2.2" height="6" fill="#96969c"/></pattern>' +
      '</defs></svg>';
    document.body.insertBefore(d.firstChild, document.body.firstChild);
  }
  function nilaiAsli(el, a) { return el.getAttribute(a) || (el.style && el.style.getPropertyValue(a)) || ''; }
  function angka(v) { var n = parseFloat(v); return isNaN(n) ? null : n; }

  var polaSudah = new WeakSet();
  function polaSvg(el, makna) {
    if (polaSudah.has(el)) return;
    polaSudah.add(el);
    var tag = el.tagName.toLowerCase();
    if (/^(svg|g|defs|pattern|lineargradient|radialgradient|stop|clippath|mask|marker|symbol|use|title|desc)$/.test(tag)) return;
    var teksSvg = tag === 'text' || tag === 'tspan' || tag === 'textpath';
    var kS = keluargaMode(nilaiAsli(el, 'stroke'), makna), kF = keluargaMode(nilaiAsli(el, 'fill'), makna);
    var KL = T.KELUARGA;
    /* Garis keluarga berpola -> titik-titik (mengganti pola putus-putus aslinya). */
    if (!teksSvg && kS && KL[kS].pola) {
      var lw = parseFloat(nilaiAsli(el, 'stroke-width')) || 1;
      el.setAttribute('stroke-dasharray', '0.1 ' + Math.max(4.2, lw * 2.4).toFixed(1));
      el.setAttribute('stroke-linecap', 'round');
      el.style.removeProperty('stroke-dasharray');
      if (lw < 2) el.setAttribute('stroke-width', '2');
    }
    if (!teksSvg && kF && KL[kF].pola) {
      var r = angka(el.getAttribute('r')) || Math.max(angka(el.getAttribute('rx')) || 0, angka(el.getAttribute('ry')) || 0);
      var w = angka(el.getAttribute('width')), h = angka(el.getAttribute('height'));
      var kecil = (/^(circle|ellipse)$/.test(tag) && r !== null && r > 0 && r <= 7) ||
                  (tag === 'rect' && w !== null && h !== null && w <= 12 && h <= 12);
      var c = 'rgb(' + KL[kF].rgb.join(',') + ')';
      if (kecil) {                                    /* titik/penanda -> berongga */
        var sAsli = nilaiAsli(el, 'stroke');
        if (!sAsli || sAsli === 'none') el.setAttribute('stroke', c);
        if (!el.getAttribute('stroke-width')) el.setAttribute('stroke-width', '1.6');
        el.setAttribute('fill', 'none'); el.style.removeProperty('fill');
      } else {                                        /* area -> berarsir */
        pasangPola();
        el.setAttribute('fill', 'url(#tp-arsir-' + kF + ')'); el.style.removeProperty('fill');
      }
    }
  }

  /* Legenda HTML: teksnya menyebut warna gambar, atau diawali garis/penanda legenda. */
  var RX_GLIF = /^\s*[─━—–●■▬◆▲▼◼◾⬤○□╌┄]/;
  function teksSendiri(el) {
    var t = '';
    for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3) t += n.nodeValue;
    return t;
  }
  function legenda(el) {
    if (!unitDari(el)) return false;
    var t = teksSendiri(el);
    if (t.trim()) return RX_GLIF.test(t) || T.gantiTeks(t, false, true, true) !== t;   /* uji, tanpa catatan */
    /* Penanda tanpa teks (kotak/garis kecil berwarna) di samping teks legenda. */
    var w = angka(el.style.width), h = angka(el.style.height);
    if (w === null || h === null || w > 28 || h > 28) return false;
    var p = el.parentElement, tp = p ? (p.textContent || '') : '';
    return !!tp.trim() && tp.length < 160;
  }
  function polaPenanda(el, makna) {
    var st = el.style, bg = st.getPropertyValue('background-color') || st.getPropertyValue('background');
    var k = keluargaMode(bg, makna);
    if (!k || !T.KELUARGA[k].pola || teksSendiri(el).trim()) return;
    var c = 'rgb(' + T.KELUARGA[k].rgb.join(',') + ')', h = angka(st.height);
    st.setProperty('background', h !== null && h <= 4
      ? 'repeating-linear-gradient(90deg,' + c + ' 0 2px,transparent 2px 5px)'   /* titik-titik */
      : 'repeating-linear-gradient(45deg,' + c + ' 0 2px,transparent 2px 5px)', 'important');
  }

  function elemen(el) {
    if (el.nodeType !== 1) return;
    var mode = T.modeUnsur(el.namespaceURI === 'http://www.w3.org/2000/svg' ? el : (unitDari(el) || el));
    if (mode === 'asli') return;
    var makna = mode === 'makna', modeGbr = makna ? 'konteks' : 'gelap';
    var diSvg = el.namespaceURI === 'http://www.w3.org/2000/svg';
    if (diSvg) {
      if (el.closest('.tp-roda-gigi,.tp-pola')) return;
      polaSvg(el, makna);                             /* sebelum warna dipetakan */
      var sudah = atrSudah.get(el) || {};
      for (var i = 0; i < ATR_SVG.length; i++) {
        var a = ATR_SVG[i], v = el.getAttribute(a);
        if (!v || sudah[a] === v) continue;
        var b = T.gantiWarna(v, modeGbr);
        if (b !== v) el.setAttribute(a, b);
        sudah[a] = b;
      }
      atrSudah.set(el, sudah);
      var f = el.getAttribute('filter');
      if (f && /^url\(#/.test(f)) el.removeAttribute('filter');   /* glow/bayangan gambar */
      if (el.hasAttribute('style')) petakanDeklarasi(el.style, modeGbr);
      return;
    }
    if (!el.hasAttribute('style') || el.id && MILIK.test(el.id)) return;
    /* Legenda gambar: warnanya mengikuti gambar (kuning-putih-abu + pola), bukan warna UI. */
    if (legendaSudah.has(el) || (!catatan.has(el.style) && legenda(el))) {
      if (!legendaSudah.has(el)) { legendaSudah.add(el); polaPenanda(el, makna); }
      petakanDeklarasi(el.style, modeGbr);
      return;
    }
    var teks = konteksTeks(el);
    /* Rona merah tipis (alpha <= 0.2) hanyalah hiasan kotak, kecuali pesan salah/galat. */
    if (!T.SALAH.test(teks)) {
      var st = el.style;
      for (var k = 0; k < st.length; k++) {
        var p = st[k], val = st.getPropertyValue(p);
        if (!/rgba\(/.test(val)) continue;
        var baru = val.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*(0?\.\d+)\)/g, function (m, r, g, bb, al) {
          var t = T.petakan([+r, +g, +bb], false);
          return (+al <= 0.2 && t[0] === +r && t[1] === +g && t[2] === +bb && +r > 150 && +g < 120)
            ? 'rgba(255, 214, 10, ' + al + ')' : m;
        });
        if (baru !== val) st.setProperty(p, baru, st.getPropertyPriority(p));
      }
    }
    /* Gaya inline di HTML asli: hijau ikut dipetakan (seperti acuan). Gaya yang ditulis
       JavaScript belakangan (umpan balik jawaban): hijau/merah dipertahankan bila teksnya
       penanda benar/salah. */
    var bnr = !awal && T.BENAR.test(teks), slh = !awal && T.SALAH.test(teks);
    sulihMakna(el.style, bnr, slh);
    petakanDeklarasi(el.style, bnr || slh ? 'benar' : 'isi');
  }
  var legendaSudah = new WeakSet();

  /* Sebutan warna gambar di teks materi (tab Modul, Tugas, Forum; juga teks SVG dan teks
     yang ditulis JavaScript). Kode, rumus, dan kolom isian tidak disentuh. */
  /* Hanya teks yang melekat pada unit gambar (gambar statis + keterangannya, panel animasi +
     legenda dan "Cara membaca"-nya). Prosa umum ("lebih hijau", warna UI FreeCAD) tidak. */
  var UNIT = 'figure.ilustrasi,.anim-panel';
  /* Unit gambar sebuah elemen: unit itu sendiri, atau kotak "Cara membaca" (tip/info) yang
     tepat berada sesudah unit (pola Sisken: div.tip-box.anim-jelas sesudah .anim-panel). */
  function unitDari(el) {
    if (!el || !el.closest) return null;
    var u = el.closest(UNIT);
    if (u) return u;
    var t = el.closest('.tip-box,.info-box,.anim-jelas');
    var s = t && t.previousElementSibling;
    return s && s.matches(UNIT) ? s : null;
  }
  var LINGKUP = '#page-modul,#page-tugas,#page-forum,#page-uts';   /* #page-uts = soal UTS/UAS */
  var LEWATI_TEKS = 'script,style,textarea,pre,code,kbd,samp,.katex,.MathJax,math,[contenteditable="true"],.cell-code,.code-block,.cm-editor,.CodeMirror';
  var teksSudah = new WeakMap();
  function teks(akar) {
    if (!akar || akar.nodeType !== 1) return;
    var dalam = akar.closest && akar.closest(LINGKUP);
    if (!dalam && !(akar.querySelector && akar.querySelector(LINGKUP))) return;
    var w = document.createTreeWalker(akar, NodeFilter.SHOW_TEXT), n, ganti = [];
    while ((n = w.nextNode())) {
      var v = n.nodeValue;
      if (!v || v.length < 4 || teksSudah.get(n) === v) continue;
      var p = n.parentElement;
      if (!p || !p.closest(LINGKUP) || p.closest(LEWATI_TEKS)) continue;
      var unit = unitDari(p), md = T.modeUnsur(unit || p);
      if (md === 'asli') continue;
      /* Di luar unit gambar hanya frasa per halaman (tema-gambar.json) yang berlaku. */
      var b = T.gantiTeks(v, md === 'makna', !!unit);
      if (b !== v) ganti.push([n, b]); else teksSudah.set(n, v);
    }
    ganti.forEach(function (x) { x[0].nodeValue = x[1]; teksSudah.set(x[0], x[1]); });
  }
  function subpohon(akar) {
    if (!akar || akar.nodeType !== 1) return;
    elemen(akar);
    var d = akar.querySelectorAll('[style],svg *,svg');
    for (var i = 0; i < d.length; i++) elemen(d[i]);
    struktur(akar);
    teks(akar);
  }
  var awal = true;

  /* Struktur tema. */
  var GIGI = window.__tpGigi || '';
  var COVER = '.hero.academic-hero,.hero[data-tab],.sp-hero';
  /* Ikon bagian soal: huruf berlingkaran -> ikon bergambar (seperti modul: 📝 PG, 💻 komputasi,
     🧠 hard). Ujian memakai 🅐–🅓: UTS/UAS umum A benar-salah, B pilihan ganda, C komputasi
     sedang, D komputasi hard; ujian CAD A pilihan ganda, B tugas pemodelan (🧊 seperti modul CAD), C tugas rakitan. */
  var CAD = /\/Pemodelan-Computer-Aided-Design\//.test(location.pathname);
  var IKON = CAD ? { '🅐': '📝', '🅑': '🧊', '🅒': '⚙️', '🅓': '🧠' }
                 : { '🅐': '📝', '🅑': '🔘', '🅒': '💻', '🅓': '🧠' };
  var RX_A = /🅐|🅑|🅒|🅓/g;
  var ADA_IKON = /🅐|🅑|🅒|🅓/;
  function struktur(akar) {
    var covers = [];
    if (akar.matches && akar.matches(COVER)) covers.push(akar);
    if (akar.querySelectorAll) covers = covers.concat(Array.prototype.slice.call(akar.querySelectorAll(COVER)));
    covers.forEach(function (h) {
      if (!GIGI || h.querySelector(':scope > .tp-roda-gigi')) return;
      var w = h.querySelector(':scope > .hero-waves');
      var tmp = document.createElement('div');
      tmp.innerHTML = GIGI;
      var g = tmp.firstChild;
      if (w) h.replaceChild(g, w); else h.insertBefore(g, h.firstChild);
    });
    var badge = akar.querySelectorAll ? akar.querySelectorAll('.q-type-badge') : [];
    for (var i = 0; i < badge.length; i++) {
      var b = badge[i];
      if (b.dataset.tpPendek) continue;
      b.dataset.tpPendek = '1';
      var tn = document.createTreeWalker(b, NodeFilter.SHOW_TEXT), n, potong = false;
      while ((n = tn.nextNode())) {
        if (potong) { n.nodeValue = ''; continue; }
        var k = n.nodeValue.indexOf(' · ');
        if (k >= 0) { n.nodeValue = n.nodeValue.slice(0, k); potong = true; }
      }
    }
    var tw = document.createTreeWalker(akar, NodeFilter.SHOW_TEXT, {
      acceptNode: function (x) { return ADA_IKON.test(x.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; }
    }), t, ganti = [];
    while ((t = tw.nextNode())) ganti.push(t);
    ganti.forEach(function (x) { x.nodeValue = x.nodeValue.replace(RX_A, function (h) { return IKON[h]; }); });
  }

  /* Jalan pertama (sinkron, sebelum halaman ditampilkan), lalu pantau perubahan. */
  /* Selama pemetaan transisi CSS dimatikan (html.tp-memuat), lalu gaya dihitung ulang
     sebelum halaman ditampilkan: tanpa itu ratusan elemen memudar dari warna lama. */
  function tampilkan() {
    void document.body.offsetHeight;
    document.documentElement.classList.remove('tp-memuat');
  }
  function jalan() {
    document.documentElement.classList.add('tp-memuat');
    semuaLembar();
    subpohon(document.body);
    awal = false;
    tampilkan();
  }
  try { jalan(); } catch (e) { document.documentElement.classList.remove('tp-memuat'); if (window.console) console.error('tema-premium', e); }

  /* Simpul baru: seluruh subpohonnya. Atribut berubah: elemen itu saja (animasi gaya). */
  var antre = new Set(), antreAtr = new Set();
  function kerjakan() {
    var daftar = Array.from(antre), atr = Array.from(antreAtr);
    antre.clear(); antreAtr.clear();
    semuaLembar();
    daftar.forEach(function (x) { if (x.isConnected && x.nodeType === 1) subpohon(x); });
    atr.forEach(function (x) { if (x.isConnected) elemen(x); });
  }
  function jadwal(el, hanyaAtr) { (hanyaAtr ? antreAtr : antre).add(el); }
  var antreTeks = new Set();
  new MutationObserver(function (ms) {
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i];
      if (m.type === 'childList') {
        for (var j = 0; j < m.addedNodes.length; j++) {
          var n = m.addedNodes[j];
          if (n.nodeType === 1) jadwal(n);
          else if (n.nodeType === 3 && n.parentElement) antreTeks.add(n.parentElement);
        }
      } else if (m.type === 'attributes') {
        jadwal(m.target, true);
      } else if (m.type === 'characterData' && m.target.parentElement) {
        antreTeks.add(m.target.parentElement);   /* teks diubah JavaScript (legenda, keterangan) */
      }
    }
    var tk = Array.from(antreTeks);
    antreTeks.clear();
    tk.forEach(function (x) {
      if (!x.isConnected) return;
      teks(x);
      if (ADA_IKON.test(x.textContent)) struktur(x);
    });
    /* Langsung di callback (microtask, sebelum layar digambar): tanpa kilasan warna lama. */
    try { kerjakan(); } catch (e) { if (window.console) console.error('tema-premium', e); }
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true,
                                          attributeFilter: ['style', 'fill', 'stroke', 'stop-color', 'filter'] });
})();
