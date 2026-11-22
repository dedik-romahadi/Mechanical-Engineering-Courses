/* TEMA-PREMIUM (awal, di kepala dokumen): pustaka pemetaan warna hitam-kuning-putih + kanvas.
   Port langsung fungsi petakan/petakan_gelap di scripts/tema-premium/terapkan.py (acuan:
   Modul 1 CAD premium yang disetujui dosen 22 Nov 2026). Isi halaman tidak diubah di
   berkas; warnanya dipetakan di peramban (warna.js di akhir badan dokumen), sehingga skrip
   penyuntik dan validator repo tetap membaca isi aslinya.
   Bagian ini dipasang di kepala dokumen supaya kanvas animasi sudah memakai palet sejak bingkai
   pertama, dan halaman disembunyikan sebentar sampai warna.js selesai (cadangan 4 s). */
(function () {
  var KUNING = [255, 214, 10];
  var BENAR = /benar|correct|tepat|lulus|sukses|success/i;
  var SALAH = /salah|wrong|error|galat|gagal|terlambat|telat|missing|danger|hapus|delete|reset|peringatan|logout|log out|absen|invalid|❌|⚠/i;

  function hls(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0;
    if (mx !== mn) {
      var d = mx - mn;
      s = l <= 0.5 ? d / (mx + mn) : d / (2 - mx - mn);
      if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
      h = h / 6; if (h < 0) h += 1;
    }
    return [h * 360, l, s];
  }
  function abu(l) {
    if (l >= 0.38 && l < 0.8) l = Math.min(0.86, l + 0.16);
    var x = l * 255, f = Math.floor(x), v = x - f === 0.5 ? (f % 2 ? f + 1 : f) : Math.round(x);  /* seperti round() Python */
    return [v, v, v];
  }
  /* Isi halaman (CSS, gaya inline). hijau=true: penanda benar boleh tetap hijau. */
  function petakan(c, hijau) {
    var t = hls(c[0], c[1], c[2]), deg = t[0], l = t[1], s = t[2];
    if (s < 0.38 || l < 0.24) return abu(l);
    if (deg >= 348 || deg < 14) return c;
    if (hijau && deg >= 75 && deg < 170) return c;
    if (l > 0.8) return [250, 248, 240];
    if (l < 0.3) return abu(l);
    return KUNING;
  }
  /* Gambar (SVG, kanvas): kuning-putih-abu. Warna jenuh dikelompokkan per keluarga rona
     supaya seri yang berbeda tetap terbedakan; keluarga merah dan ungu memakai pola
     (garis putus-putus, area berarsir, titik berongga). Kamus kata di bawah memakai
     keluarga yang sama, jadi teks yang menyebut warna gambar ikut benar.
       biru/cyan/toska/teal/indigo (170-255) -> putih          utuh
       kuning/amber/oranye/jingga  (14-70)   -> kuning         utuh
       merah/merah muda/pink/rose  (315-14)  -> kuning         POLA
       hijau/lime/emerald          (70-170)  -> abu terang     utuh
       ungu/violet/magenta/fuchsia (255-315) -> abu            POLA */
  var KELUARGA = {
    putih: { rgb: [245, 245, 245], pola: false, kata: 'putih' },
    kuning: { rgb: KUNING, pola: false, kata: 'kuning' },
    merah: { rgb: KUNING, pola: true, kata: 'kuning' },
    hijau: { rgb: [190, 190, 196], pola: false, kata: 'abu-abu' },
    ungu: { rgb: [150, 150, 156], pola: true, kata: 'abu-abu' }
  };
  function keluarga(c) {
    var t = hls(c[0], c[1], c[2]), deg = t[0], l = t[1], s = t[2];
    if (l < 0.24 || s < 0.38 || l > 0.92) return null;
    if (deg >= 315 || deg < 14) return 'merah';
    if (deg < 70) return 'kuning';
    if (deg < 170) return 'hijau';
    if (deg < 255) return 'putih';
    return 'ungu';
  }
  function petakanGelap(c) {
    var t = hls(c[0], c[1], c[2]), l = t[1], s = t[2];
    if (l < 0.24 || (s < 0.38 && l < 0.8)) return abu(l);
    var k = keluarga(c);
    if (!k) return [250, 248, 240];
    return KELUARGA[k].rgb;
  }
  /* Keluarga warna dari teks warna CSS (hex/rgb[a]/hsl), atau null. */
  function keluargaTeks(v) {
    if (typeof v !== 'string') return null;
    var m = /#([0-9a-fA-F]{6})/.exec(v), c = null;
    if (m) c = [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
    else if ((m = /#([0-9a-fA-F]{3})\b/.exec(v))) c = m[1].split('').map(function (x) { return parseInt(x + x, 16); });
    else if ((m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(v))) c = [+m[1], +m[2], +m[3]];
    return c ? keluarga(c) : null;
  }

  /* Kata warna di teks yang merujuk ke gambar -> kata warna baru (keluarga yang sama). */
  var KATA = [
    ['merah muda', 'merah'], ['biru muda', 'putih'], ['biru tua', 'putih'], ['hijau muda', 'hijau'],
    ['hijau tua', 'hijau'], ['biru', 'putih'], ['cyan', 'putih'], ['sian', 'putih'], ['toska', 'putih'],
    ['tosca', 'putih'], ['teal', 'putih'], ['indigo', 'putih'], ['nila', 'putih'], ['blue', 'putih'],
    ['amber', 'kuning'], ['oranye', 'kuning'], ['orange', 'kuning'], ['jingga', 'kuning'],
    ['yellow', 'kuning'],   /* 'emas'/'gold' sengaja tidak: kiasan "aturan emas", "standar emas" */ ['kuning', 'kuning'], ['merah', 'merah'], ['pink', 'merah'],
    ['rose', 'merah'], ['red', 'merah'], ['hijau', 'hijau'], ['lime', 'hijau'], ['emerald', 'hijau'],
    ['green', 'hijau'], ['ungu', 'ungu'], ['violet', 'ungu'], ['magenta', 'ungu'], ['fuchsia', 'ungu'],
    ['purple', 'ungu']
  ];
  var KATA_PETA = {};
  KATA.forEach(function (k) { KATA_PETA[k[0]] = k[1]; });
  var W = '(' + KATA.map(function (k) { return k[0]; }).join('|') + ')';
  var GARIS = 'garis bantu|garis-garis|garis|kurva|panah|lintasan|jalur|sinyal|vektor|tangga|segmen|busur|kontur|' +
              'poligon|segitiga|heksagon|persegi panjang|persegi|lingkaran|elips|gelombang|trend|tren|spike|plot|' +
              'sabuk|tali busur|tali|tepi|rusuk|sisi|profil|lubang|induk|amplop|envelope|selubung|trajectory|trayektori|pulsa|line|curve';
  var AREA = 'area|daerah|bidang|kotak|blok|batang|bar|zona|pita|bayangan|arsiran|wilayah|region|irisan|sektor|' +
             'solid|volume|bahan|pelat|balok|permukaan|muka|cakram|potongan|penampang|benda|objek|bentuk';
  var TITIK = 'titik-titik|titik|bulatan|marker|bintik|noktah|dot|bola|simbol|pusat massa|penanda';
  var TEKS = 'angka|tulisan|label|teks|nilai|huruf|keterangan|anotasi';
  var SIFAT = '(?:putus-putus|solid|tebal|tipis|vertikal|horizontal|tegak|mendatar|pendek|panjang|besar|kecil|' +
              'terang|utama|tegas|halus|bergerak|diam|referensi|acuan|induk|luar|dalam|awal|akhir|bawah|atas|arsir)';
  var RX_BENDA = new RegExp('(^|[^\\w-])(' + TEKS + '|' + GARIS + '|' + AREA + '|' + TITIK + ')((?:\\s+' + SIFAT + '){0,2})\\s+' + W +
                            '(?![\\w-])(\\s+putus-putus(?![\\w-]))?', 'gi');
  /* "(cyan)", "(cyan LOESS)"; bukan daftar warna "(Hijau, Kuning, Merah)". */
  var RX_KURUNG = new RegExp('\\(\\s*' + W + '(?=\\s*\\)|\\s+[A-Za-z0-9]|\\s*,(?!\\s*' + W + '(?![\\w-])))', 'gi');
  var RX_BERWARNA = new RegExp('(^|[^\\w-])(berwarna|warna)\\s+' + W + '(?![\\w-])', 'gi');
  var RX_SAMA = new RegExp('(^|[^\\w-])' + W + '(\\s*(?:=|:)\\s*)(?=[^\\s=])', 'gi');
  var RX_AREA = new RegExp('^(?:' + AREA + ')$', 'i'), RX_TITIK = new RegExp('^(?:' + TITIK + ')$', 'i'),
      RX_TEKS = new RegExp('^(?:' + TEKS + ')$', 'i');
  function jenis(benda) {
    benda = (benda || '').toLowerCase();
    if (RX_TEKS.test(benda)) return 'teks';
    if (RX_AREA.test(benda)) return 'area';
    if (RX_TITIK.test(benda)) return 'titik';
    return 'garis';
  }
  /* makna: unit gambar yang merah/hijaunya bermakna (benar/salah, layak/melanggar, batas):
     kata merah/hijau tidak diganti. */
  function kataBaru(asli, jenisBenda, sudahPutus, makna) {
    var kel = KATA_PETA[asli.toLowerCase()], k = KELUARGA[kel];
    /* Mode makna mempertahankan merah murni dan hijau (bukan merah muda/pink, yang tetap
       dipetakan ke kuning berpola seperti di gambarnya). */
    if (!k || (makna && /^(merah|red|rose|hijau|hijau muda|hijau tua|green|lime|emerald)$/i.test(asli))) return asli;
    var s = k.kata;
    /* Garis keluarga berpola selalu titik-titik (mengganti pola putus-putus aslinya), supaya
       tidak tertukar dengan garis kuning/abu-abu yang memang putus-putus di gambar aslinya. */
    if (k.pola && jenisBenda !== 'teks') s += jenisBenda === 'area' ? ' berarsir' : jenisBenda === 'titik' ? ' berongga' : ' titik-titik';
    if (asli[0] === asli[0].toUpperCase() && asli[0] !== asli[0].toLowerCase()) s = s[0].toUpperCase() + s.slice(1);
    return s;
  }
  /* Penggantian frasa persis per halaman (window.__tpGambar.teks), sebelum aturan umum. */
  /* Spasi di frasa cocok dengan spasi apa pun di teks (spasi biasa, NBSP, spasi tipis). */
  var rxFrasa = null;
  function gantiFrasa(s) {
    var d = (window.__tpGambar || {}).teks || [];
    if (!d.length) return s;
    if (!rxFrasa) rxFrasa = d.map(function (x) {
      var pola = x[0].split(/\s+/).map(function (b) { return b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); })
                     .join('[\\s\\u00a0\\u2009\\u202f]+');
      return [new RegExp(pola, 'g'), x[1]];
    });
    for (var i = 0; i < rxFrasa.length; i++) s = s.replace(rxFrasa[i][0], rxFrasa[i][1].replace(/\$/g, '$$$$'));
    return s;
  }
  /* Ganti sebutan warna gambar di satu teks. Kembalikan teks yang sama bila tidak ada.
     umum=false: hanya frasa per halaman (teks di luar unit gambar). */
  function gantiTeks(s, makna, umum, uji) {
    if (!s || typeof s !== 'string' || !/[a-z]/i.test(s)) return s;
    var awalTeks = s;
    s = gantiFrasa(s);
    if (umum !== false) {
      s = s.replace(RX_BENDA, function (m, pra, benda, sifat, warna, putusSesudah) {
        var baru = kataBaru(warna, jenis(benda), false, makna);
        /* Kata "putus-putus" di sekitar warna berpola diganti "titik-titik" (pola garisnya). */
        if (/titik-titik$/.test(baru)) {
          sifat = sifat.replace(/\s+putus-putus/i, '');
          putusSesudah = '';
        }
        return pra + benda + sifat + ' ' + baru + (putusSesudah || '');
      });
      s = s.replace(RX_BERWARNA, function (m, pra, kata, warna) { return pra + kata + ' ' + kataBaru(warna, 'garis', false, makna); });
      s = s.replace(RX_KURUNG, function (m, warna) { return m.replace(warna, kataBaru(warna, 'garis', false, makna)); });
      s = s.replace(RX_SAMA, function (m, pra, warna, sama) { return pra + kataBaru(warna, 'garis', false, makna) + sama; });
      /* Garis legenda "──" di depan seri berpola -> putus-putus. */
      if (s !== awalTeks && /titik-titik/.test(s) && !/titik-titik/.test(awalTeks)) s = s.replace(/[─━—╌]{2}/, '┈┈');
    }
    if (s !== awalTeks && !uji) {               /* catatan untuk pemeriksaan (maks. 3000) */
      var log = window.__tpGanti || (window.__tpGanti = []);
      if (log.length < 3000) log.push([awalTeks, s]);
    }
    return s;
  }
  function merah(c) { var t = hls(c[0], c[1], c[2]); return t[2] >= 0.38 && (t[0] >= 348 || t[0] < 14); }
  function hijauP(c) { var t = hls(c[0], c[1], c[2]); return t[2] >= 0.38 && t[0] >= 75 && t[0] < 170; }
  function hex2(n) { return (n < 16 ? '0' : '') + n.toString(16); }

  /* Ganti setiap literal warna dalam satu nilai/teks.
     mode: 'isi' (petakan), 'benar' (petakan, hijau dipertahankan), 'gelap' (petakanGelap),
     'konteks' (gambar, tetapi merah/hijau dipertahankan: umpan balik benar/salah). */
  function peta(mode) {
    if (mode === 'gelap') return petakanGelap;
    if (mode === 'benar') return function (c) { return petakan(c, true); };
    if (mode === 'konteks') return function (c) { return (merah(c) || hijauP(c)) ? c : petakanGelap(c); };
    return function (c) { return petakan(c, false); };
  }
  function gantiWarna(teks, mode) {
    if (!teks || typeof teks !== 'string') return teks;
    var f = peta(mode), gelap = mode === 'gelap' || mode === 'konteks';
    /* #rrggbb dan #rrggbbaa (alfa dipertahankan); #rgb/#rgba hanya di isi halaman (di
       gambar/skrip #abc bisa berupa rujukan id). */
    var pola = gelap ? /#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?\b/g
                     : /#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?\b|#[0-9a-fA-F]{3}[0-9a-fA-F]?\b(?![0-9a-fA-F])/g;
    teks = teks.replace(pola, function (m, i, semua) {
      if (/url\(\s*["']?$/.test(semua.slice(Math.max(0, i - 6), i))) return m;  /* url(#id) */
      var h = m.slice(1), alfa = '';
      if (h.length <= 4) h = h.split('').map(function (x) { return x + x; }).join('');
      if (h.length === 8) { alfa = h.slice(6); h = h.slice(0, 6); }
      var c = f([parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]);
      return '#' + hex2(c[0]) + hex2(c[1]) + hex2(c[2]) + alfa;
    });
    /* hsl()/hsla() -> rgb()/rgba() lalu dipetakan seperti rgb di bawah. */
    teks = teks.replace(/hsla?\(\s*([\d.]+)(?:deg)?\s*[, ]\s*([\d.]+)%\s*[, ]\s*([\d.]+)%\s*(?:[,/]\s*([\d.]+%?)\s*)?\)/g,
      function (m, h, s, l, a) {
        h = (+h % 360) / 360; s = +s / 100; l = +l / 100;
        function k(t) { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
        var rgb = s === 0 ? [l, l, l] : [k(h + 1 / 3), k(h), k(h - 1 / 3)];
        rgb = rgb.map(function (x) { return Math.round(x * 255); });
        if (a !== undefined) a = /%$/.test(a) ? parseFloat(a) / 100 : +a;
        return a === undefined ? 'rgb(' + rgb.join(', ') + ')' : 'rgba(' + rgb.concat([a]).join(', ') + ')';
      });
    teks = teks.replace(/(rgba?)\(([^()]*)\)/g, function (m, fn, isi) {
      var bag = isi.split(',').map(function (x) { return x.trim(); });
      if (bag.length < 3 || !bag.slice(0, 3).every(function (x) { return /^\d+(\.\d+)?$/.test(x); })) return m;
      var c = f(bag.slice(0, 3).map(function (x) { return Math.floor(+x); }));
      /* Rona kuning tembus pandang tampak keruh di atas hitam: tipis -> putih tipis, tebal -> kuning pekat. */
      if (!gelap && c[0] === 255 && c[1] === 214 && c[2] === 10 && bag.length > 3) {
        var a = parseFloat(bag[3]);
        if (isNaN(a)) a = 1;
        if (a < 0.35) return 'rgba(255, 255, 255, ' + (Math.round(a / 2 * 1000) / 1000) + ')';
        return 'rgb(255, 214, 10)';
      }
      return fn + '(' + [c[0], c[1], c[2]].concat(bag.slice(3)).join(', ') + ')';
    });
    return teks;
  }
  /* Variabel CSS berisi triplet "R,G,B". */
  function gantiTriplet(teks, mode) {
    var m = /^\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*$/.exec(teks || '');
    if (!m) return teks;
    var c = peta(mode)([+m[1], +m[2], +m[3]]);
    return c[0] + ',' + c[1] + ',' + c[2];
  }
  /* Tanpa blur dan cahaya. */
  function buangRadial(teks) {
    var i = 0, hasil = '';
    for (;;) {
      var j = teks.indexOf('radial-gradient(', i);
      if (j < 0) return hasil + teks.slice(i);
      var k = j + 16, d = 1;
      while (k < teks.length && d) { if (teks[k] === '(') d++; else if (teks[k] === ')') d--; k++; }
      hasil += teks.slice(i, j) + 'linear-gradient(transparent, transparent)';
      i = k;
    }
  }

  window.__tp = { petakan: petakan, petakanGelap: petakanGelap, gantiWarna: gantiWarna,
                  gantiTriplet: gantiTriplet, buangRadial: buangRadial, BENAR: BENAR, SALAH: SALAH,
                  merah: merah, hijauP: hijauP,
                  keluarga: keluarga, keluargaTeks: keluargaTeks, KELUARGA: KELUARGA, gantiTeks: gantiTeks,
                  modeUnsur: function (el) { return modeUnsur(el); },
                  dipertahankan: function (v) { return dipertahankan(v); } };

  /* Kanvas: warna isian/garis/gradien -> palet gambar; bayangan dan halo dimatikan.
     Keluarga warna asli dicatat per konteks (ikut save/restore) untuk memberi pola. */
  var P = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
  /* Mode unit gambar per halaman (window.__tpGambar dari tema-gambar.json):
       'asli'  -> warna dunia nyata (peta warna FEM, warna FreeCAD, ...): tidak dipetakan;
       'makna' -> merah/hijau bermakna (benar/salah, layak/melanggar, batas): dipertahankan,
                  warna lain dipetakan. */
  function modeUnsur(el) {
    var g = window.__tpGambar;
    if (!g || !el || !el.closest) return '';
    if (g.asli && g.asli.length && el.closest(g.asli.join(','))) return 'asli';
    if (g.makna && g.makna.length && el.closest(g.makna.join(','))) return 'makna';
    return '';
  }
  function modeKanvas(ctx) {
    var c = ctx && ctx.canvas;
    if (!c || !c.closest) return '';
    if (c.__tpMode === undefined && c.isConnected) c.__tpMode = modeUnsur(c);
    return c.__tpMode || '';
  }
  function kecuali(ctx) { return modeKanvas(ctx) === 'asli'; }
  /* Warna yang dipertahankan di mode makna (merah murni, hijau): tanpa pola. */
  function rgbTeks(v) {
    var m = /#([0-9a-fA-F]{6})/.exec(v || '');
    if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
    if ((m = /#([0-9a-fA-F]{3})\b/.exec(v || ''))) return m[1].split('').map(function (x) { return parseInt(x + x, 16); });
    if ((m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(v || ''))) return [+m[1], +m[2], +m[3]];
    return null;
  }
  function dipertahankan(v) { var c = rgbTeks(v); return !!(c && (merah(c) || hijauP(c))); }
  function keluargaMode(v, mode) {
    return mode === 'makna' && dipertahankan(v) ? null : keluargaTeks(v);
  }
  function bungkusWarna(nama, ubah, catat) {
    var d = P && Object.getOwnPropertyDescriptor(P, nama);
    if (!d || !d.set) return;
    Object.defineProperty(P, nama, {
      configurable: true, enumerable: d.enumerable, get: d.get,
      set: function (v) {
        var mode = modeKanvas(this);
        if (mode === 'asli') { if (catat) this[catat] = null; return d.set.call(this, v); }
        if (catat) this[catat] = typeof v === 'string' ? keluargaMode(v, mode) : null;
        d.set.call(this, typeof v === 'string' ? ubah(v, this, mode) : v);
      }
    });
  }
  function login(ctx) { var c = ctx && ctx.canvas; return !!(c && c.id && /WaveCanvas$/.test(c.id)); }
  function berpola(k) { return !!(k && KELUARGA[k] && KELUARGA[k].pola); }
  var cacheArsir = {};
  function arsir(ctx, warna) {
    var kunci = String(warna);
    if (cacheArsir[kunci]) return cacheArsir[kunci];
    var c = document.createElement('canvas');
    c.width = c.height = 8;
    var x = c.getContext('2d');
    x.__tpLewat = true;
    x.strokeStyle = warna; x.lineWidth = 2;
    x.beginPath(); x.moveTo(-2, 10); x.lineTo(10, -2); x.moveTo(-2, 2); x.lineTo(2, -2); x.moveTo(6, 10); x.lineTo(10, 6);
    x.stroke();
    return (cacheArsir[kunci] = ctx.createPattern(c, 'repeat'));
  }
  if (P) {
    function ubahKanvas(v, ctx, mode) { return gantiWarna(v, mode === 'makna' ? 'konteks' : 'gelap'); }
    bungkusWarna('fillStyle', ubahKanvas, '__tpKF');
    bungkusWarna('strokeStyle', ubahKanvas, '__tpKS');
    var asliSave = P.save, asliRestore = P.restore;
    P.save = function () { (this.__tpTumpuk = this.__tpTumpuk || []).push([this.__tpKF, this.__tpKS]); return asliSave.apply(this, arguments); };
    P.restore = function () { var t = this.__tpTumpuk && this.__tpTumpuk.pop(); if (t) { this.__tpKF = t[0]; this.__tpKS = t[1]; } return asliRestore.apply(this, arguments); };
    /* Bentuk lintasan: satu busur kecil = titik (penanda). */
    var asliBegin = P.beginPath, asliArc = P.arc, asliEllipse = P.ellipse, asliLineTo = P.lineTo, asliRectP = P.rect;
    P.beginPath = function () { this.__tpLin = { busur: 0, r: 0, lain: false }; return asliBegin.apply(this, arguments); };
    P.arc = function (x, y, r) { var l = this.__tpLin; if (l) { l.busur++; l.r = Math.max(l.r, r); } return asliArc.apply(this, arguments); };
    P.ellipse = function (x, y, rx, ry) { var l = this.__tpLin; if (l) { l.busur++; l.r = Math.max(l.r, rx, ry); } return asliEllipse.apply(this, arguments); };
    P.lineTo = function () { if (this.__tpLin) this.__tpLin.lain = true; return asliLineTo.apply(this, arguments); };
    P.rect = function () { if (this.__tpLin) this.__tpLin.lain = true; return asliRectP.apply(this, arguments); };
    /* Garis keluarga berpola -> putus-putus (kecuali kode sudah memakai pola sendiri). */
    /* Garis keluarga berpola -> titik-titik, MENGGANTI pola putus-putus aslinya (pola asli
       tetap berarti putus-putus untuk keluarga lain, jadi keduanya tidak tertukar). */
    function denganPutus(ctx, f, args) {
      if (ctx.__tpLewat || !berpola(ctx.__tpKS)) return f.apply(ctx, args);
      var d = ctx.getLineDash ? ctx.getLineDash() : [], cap = ctx.lineCap, lw = ctx.lineWidth;
      if (lw < 2) ctx.lineWidth = 2;                   /* titik cukup besar untuk terlihat */
      ctx.setLineDash([0.1, Math.max(4.2, ctx.lineWidth * 2.2)]);
      ctx.lineCap = 'round';
      try { return f.apply(ctx, args); } finally { ctx.setLineDash(d); ctx.lineCap = cap; ctx.lineWidth = lw; }
    }
    var asliStroke = P.stroke, asliStrokeRect = P.strokeRect;
    P.stroke = function () { return denganPutus(this, asliStroke, arguments); };
    P.strokeRect = function () { return denganPutus(this, asliStrokeRect, arguments); };
    /* Isian keluarga berpola: titik kecil -> berongga, area -> berarsir. */
    var asliFill = P.fill;
    P.fill = function () {
      if (this.__tpLewat || !berpola(this.__tpKF) || typeof this.fillStyle !== 'string') return asliFill.apply(this, arguments);
      var l = this.__tpLin, warna = this.fillStyle;
      if (l && l.busur && !l.lain && l.r <= 7 && !(arguments[0] && typeof arguments[0] === 'object')) {
        var s = this.strokeStyle, w = this.lineWidth, kS = this.__tpKS, d = this.getLineDash();
        this.strokeStyle = warna; this.__tpKS = null; this.lineWidth = 1.6; this.setLineDash([]);
        asliStroke.call(this);
        this.strokeStyle = s; this.__tpKS = kS; this.lineWidth = w; this.setLineDash(d);
        return;
      }
      var kF = this.__tpKF;
      this.fillStyle = arsir(this, warna); this.__tpKF = null;
      try { return asliFill.apply(this, arguments); } finally { this.fillStyle = warna; this.__tpKF = kF; }
    };
    /* Teks di kanvas: sebutan warna gambar ikut diganti. */
    ['fillText', 'strokeText'].forEach(function (n) {
      var asli = P[n];
      P[n] = function (t) {
        var a = Array.prototype.slice.call(arguments);
        var mk = modeKanvas(this);
        if (typeof t === 'string' && mk !== 'asli') {
          a[0] = gantiTeks(t, mk === 'makna');
          /* Catatan pemeriksaan: teks kanvas yang masih menyebut warna (maks. 500). */
          if (/(biru|merah|hijau|ungu|oranye|jingga|toska|cyan|magenta|pink|amber|violet|teal|lime)/i.test(a[0])) {
            var ks = window.__tpKanvasSisa || (window.__tpKanvasSisa = {});
            if (Object.keys(ks).length < 500) ks[(this.canvas && this.canvas.id || '?') + ' | ' + a[0]] = 1;
          }
        }
        var kF = this.__tpKF; this.__tpKF = null;
        try { return asli.apply(this, a); } finally { this.__tpKF = kF; }
      };
    });
    bungkusWarna('shadowColor', function () { return 'rgba(0, 0, 0, 0)'; });
    var dB = Object.getOwnPropertyDescriptor(P, 'shadowBlur');
    if (dB && dB.set) Object.defineProperty(P, 'shadowBlur', { configurable: true, get: dB.get, set: function () { dB.set.call(this, 0); } });
    var asliStop = window.CanvasGradient && CanvasGradient.prototype.addColorStop;
    if (asliStop) {
      CanvasGradient.prototype.addColorStop = function (o, w) {
        if (this.__tpAsli) return asliStop.call(this, o, w);
        return asliStop.call(this, o, this.__tpHalo ? 'rgba(0, 0, 0, 0)' : gantiWarna(String(w), this.__tpMakna ? 'konteks' : 'gelap'));
      };
      var asliRadial = P.createRadialGradient, asliLinear = P.createLinearGradient;
      P.createRadialGradient = function () {
        var g = asliRadial.apply(this, arguments);
        if (kecuali(this)) g.__tpAsli = true;
        else if (modeKanvas(this) === 'makna') g.__tpMakna = true;
        else if (login(this)) g.__tpHalo = true;  /* halo/kilat latar login: tidak digambar */
        return g;
      };
      P.createLinearGradient = function () {
        var g = asliLinear.apply(this, arguments);
        if (kecuali(this)) g.__tpAsli = true;
        else if (modeKanvas(this) === 'makna') g.__tpMakna = true;
        return g;
      };
    }
    /* Kilat layar penuh pada latar login (tembus pandang) tidak digambar. */
    var asliRect = P.fillRect;
    P.fillRect = function (x, y, w, h) {
      if (login(this) && w >= this.canvas.width * 0.9 && h >= this.canvas.height * 0.9 &&
          /rgba\([^)]*,\s*0?\.\d+\s*\)$/.test(String(this.fillStyle))) return;
      if (!this.__tpLewat && berpola(this.__tpKF) && typeof this.fillStyle === 'string' && w * h > 0) {
        var warna = this.fillStyle, kF = this.__tpKF;
        if (Math.abs(w) <= 12 && Math.abs(h) <= 12) {          /* penanda kecil -> berongga */
          var s = this.strokeStyle, lw = this.lineWidth, kS = this.__tpKS, d = this.getLineDash();
          this.strokeStyle = warna; this.__tpKS = null; this.lineWidth = 1.6; this.setLineDash([]);
          asliStrokeRect.call(this, x + 0.8, y + 0.8, w - 1.6, h - 1.6);
          this.strokeStyle = s; this.__tpKS = kS; this.lineWidth = lw; this.setLineDash(d);
          return;
        }
        if (Math.min(Math.abs(w), Math.abs(h)) <= 4) {            /* garis tipis -> putus-putus */
          var dat = Math.abs(w) >= Math.abs(h), pj = dat ? w : h, arah = pj < 0 ? -1 : 1;
          for (var o = 0; o < Math.abs(pj); o += 5) {          /* titik-titik */
            var p = Math.min(2, Math.abs(pj) - o) * arah;
            if (dat) asliRect.call(this, x + o * arah, y, p, h); else asliRect.call(this, x, y + o * arah, w, p);
          }
          return;
        }
        this.fillStyle = arsir(this, warna); this.__tpKF = null;   /* area -> berarsir */
        try { return asliRect.apply(this, arguments); } finally { this.fillStyle = warna; this.__tpKF = kF; }
      }
      return asliRect.apply(this, arguments);
    };
  }

  /* Halaman disembunyikan sampai warna.js selesai memetakan warna (cadangan 4 detik). */
  var akar = document.documentElement;
  akar.classList.add('tp-memuat');
  setTimeout(function () { akar.classList.remove('tp-memuat'); }, 4000);
})();
