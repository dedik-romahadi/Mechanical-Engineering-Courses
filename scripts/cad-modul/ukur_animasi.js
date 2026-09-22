// Pengukur animasi kanvas modul CAD, dijalankan periksa_animasi_chrome.py di Chrome headless.
// requestAnimationFrame sudah dimatikan SEBELUM skrip animasi dimuat (lihat halaman uji), jadi
// setiap panggilan fungsi gambar = tepat satu bingkai dan hasilnya sama di setiap jalan.
// Untuk tiap kanvas di _TTL_DAFTAR dan tiap lebar di UJI_LEBAR:
//   1) BERJALAN: UJI_BINGKAI bingkai (bawaan 460, cukup untuk satu siklus penuh) pada tiga
//      keadaan slider (bawaan, semua min, semua maks);
//   2) DIJEDA (_ttlJeda[nama] = true; semua label fase tampil sekaligus): kisi nilai slider
//      min/tengah/maks (3^k kombinasi, dibatasi 81; bila lebih, tiap slider divariasikan sendiri).
// Dicatat: kotak TINTA teks (measureText actualBoundingBox, sesudah transformasi) yang keluar
// kanvas, huruf < 8 px, pasangan teks yang tintanya saling menimpa, titik bentuk yang keluar
// kanvas, dan galat JavaScript.
(async () => {
  await document.fonts.ready;
  await Promise.all(["10px 'JetBrains Mono'", "600 10px 'JetBrains Mono'", "bold 10px 'JetBrains Mono'"].map(f => document.fonts.load(f)));
  await new Promise(r => setTimeout(r, 200));
  const monoSiap = document.fonts.check("10px 'JetBrains Mono'");
  window.requestAnimationFrame = () => 0;
  const LEBAR = window.UJI_LEBAR || [1000, 800, 570, 369, 298, 274, 244, 204];
  const BINGKAI = window.UJI_BINGKAI || 460;
  const JEDA = window.UJI_JEDA !== false;
  const BATAS = 25;                                  // entri maksimum per daftar per lebar
  const norm = t => String(t).replace(/\d+([.,]\d+)?/g, '#');
  const P = CanvasRenderingContext2D.prototype, asli = {};
  let aktif = null, T = [], B = [];
  const peta = (ctx, x, y) => { const m = ctx.getTransform(); return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; };
  const kotak = (ctx, t, x, y) => {
    const u = ctx.measureText(t);
    const c = [[x - u.actualBoundingBoxLeft, y - u.actualBoundingBoxAscent], [x + u.actualBoundingBoxRight, y - u.actualBoundingBoxAscent],
               [x - u.actualBoundingBoxLeft, y + u.actualBoundingBoxDescent], [x + u.actualBoundingBoxRight, y + u.actualBoundingBoxDescent]].map(([a, b]) => peta(ctx, a, b));
    const xs = c.map(p => p[0]), ys = c.map(p => p[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  };
  const pxFont = ctx => { const m = /(\d+(?:\.\d+)?)px/.exec(ctx.font); if (!m) return 0; const s = ctx.getTransform(); return parseFloat(m[1]) * Math.sqrt(Math.abs(s.a * s.d - s.b * s.c)); };
  for (const n of ['fillText', 'strokeText']) {
    asli[n] = P[n];
    P[n] = function (t, x, y, w) { if (this.canvas === aktif && String(t).trim()) T.push({ t: String(t), k: kotak(this, String(t), x, y), px: pxFont(this) }); return asli[n].call(this, t, x, y, w); };
  }
  const titik = (ctx, x, y) => B.push(peta(ctx, x, y));
  for (const n of ['moveTo', 'lineTo']) { asli[n] = P[n]; P[n] = function (x, y) { if (this.canvas === aktif) titik(this, x, y); return asli[n].call(this, x, y); }; }
  for (const n of ['rect', 'fillRect', 'strokeRect']) {
    asli[n] = P[n];
    P[n] = function (x, y, w, h) { if (this.canvas === aktif) { titik(this, x, y); titik(this, x + w, y); titik(this, x, y + h); titik(this, x + w, y + h); } return asli[n].call(this, x, y, w, h); };
  }
  for (const n of ['quadraticCurveTo', 'bezierCurveTo']) {
    asli[n] = P[n];
    P[n] = function (...a) { if (this.canvas === aktif) titik(this, a[a.length - 2], a[a.length - 1]); return asli[n].apply(this, a); };
  }
  const sapu = (a0, a1, ccw) => {
    let e = a1;
    if (!ccw) { while (e < a0) e += 2 * Math.PI; e = Math.min(e, a0 + 2 * Math.PI); } else { while (e > a0) e -= 2 * Math.PI; e = Math.max(e, a0 - 2 * Math.PI); }
    return Array.from({ length: 17 }, (_, i) => a0 + (e - a0) * i / 16);
  };
  asli.arc = P.arc;
  P.arc = function (cx, cy, r, a0, a1, ccw) { if (this.canvas === aktif && r > 0) for (const a of sapu(a0, a1, ccw)) titik(this, cx + r * Math.cos(a), cy + r * Math.sin(a)); return asli.arc.call(this, cx, cy, r, a0, a1, ccw); };
  asli.ellipse = P.ellipse;
  P.ellipse = function (cx, cy, rx, ry, rot, a0, a1, ccw) {
    if (this.canvas === aktif && rx > 0 && ry > 0) for (const a of sapu(a0, a1, ccw)) { const x = rx * Math.cos(a), y = ry * Math.sin(a); titik(this, cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)); }
    return asli.ellipse.call(this, cx, cy, rx, ry, rot, a0, a1, ccw);
  };
  const tambah = (peta_, kunci, nilai) => { if (!peta_.has(kunci) && peta_.size < BATAS) peta_.set(kunci, nilai); };
  const hasil = {};
  for (const [cvId, gambar, nama, slider] of _TTL_DAFTAR) {
    const cv = document.getElementById(cvId); if (!cv) { hasil[cvId] = { galat: 'kanvas tidak ada' }; continue; }
    const els = (slider || []).map(id => document.getElementById(id)).filter(Boolean);
    const awal = els.map(e => e.value);
    const tiga = e => { const mn = +e.min, mx = +e.max, st = +e.step || 1; return [String(mn), String(mn + Math.round((mx - mn) / 2 / st) * st), String(mx)]; };
    let kisi = [[]];
    for (const e of els) { const baru = []; for (const k of kisi) for (const v of tiga(e)) baru.push([...k, v]); kisi = baru; }
    if (kisi.length > 81) {                               // terlalu banyak slider: variasikan satu per satu
      kisi = [els.map(e => tiga(e)[0]), els.map(e => tiga(e)[1]), els.map(e => tiga(e)[2])];
      els.forEach((e, i) => tiga(e).forEach(v => { const k = awal.slice(); k[i] = v; kisi.push(k); }));
    }
    const status = { bawaan: awal, min: els.map(e => e.min), maks: els.map(e => e.max) };
    const perLebar = {};
    for (const L of LEBAR) {
      cv.style.width = L + 'px';
      const potong = new Map(), tumpang = new Map(), kecil = new Map(), galat = new Map();
      let bentuk = 0, bentukDi = '';
      const tinggi = new Set();
      const periksa = kode => {
        const W = cv.width, H = cv.height; tinggi.add(H);
        for (const a of T) {
          if (a.px && a.px < 7.95) tambah(kecil, `"${norm(a.t).slice(0, 40)}"`, `${a.px.toFixed(1)} px (${kode})`);
          const [x0, y0, x1, y1] = a.k;
          const lewat = Math.max(-x0, x1 - W, -y0, y1 - H);
          if (lewat > 0.5) {
            const sisi = x1 - W > 0.5 ? 'kanan' : x0 < -0.5 ? 'kiri' : y0 < -0.5 ? 'atas' : 'bawah';
            const kunci = `"${norm(a.t).slice(0, 46)}" ${sisi}`;
            if (potong.has(kunci)) { if (potong.get(kunci).lewat < lewat) potong.set(kunci, { lewat, kode }); } else if (potong.size < BATAS) potong.set(kunci, { lewat, kode });
          }
        }
        for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) {
          const a = T[i], b = T[j];
          if (a.t === b.t && Math.abs(a.k[0] - b.k[0]) < 1.5 && Math.abs(a.k[1] - b.k[1]) < 1.5) continue;   // teks yang sama digambar ulang (efek pendar)
          const dx = Math.min(a.k[2], b.k[2]) - Math.max(a.k[0], b.k[0]), dy = Math.min(a.k[3], b.k[3]) - Math.max(a.k[1], b.k[1]);
          if (dx > 1 && dy > 1) tambah(tumpang, `"${norm(a.t).slice(0, 28)}" ↔ "${norm(b.t).slice(0, 28)}"`, kode);
        }
        for (const [x, y] of B) {
          const lewat = Math.max(-x, x - W, -y, y - H);
          if (lewat > bentuk) { bentuk = lewat; bentukDi = `(${x.toFixed(0)}, ${y.toFixed(0)}) ${kode}`; }
        }
      };
      const jalankan = kode => { aktif = cv; T = []; B = []; try { gambar(); } catch (err) { tambah(galat, `${kode}: ${err.message}`, 1); } aktif = null; periksa(kode); };
      const jeda = window._ttlJeda || (window._ttlJeda = {});
      jeda[nama] = false;
      for (const [kode, nilai] of Object.entries(status)) {
        els.forEach((e, i) => { e.value = nilai[i]; });
        for (let f = 0; f < BINGKAI; f++) jalankan(`jalan ${kode}`);
      }
      if (JEDA) {
        jeda[nama] = true;
        for (const nilai of kisi) { els.forEach((e, i) => { e.value = nilai[i]; }); jalankan(`jeda ${nilai.join('/')}`); }
        jeda[nama] = false;
      }
      let png = '';
      if ((window.UJI_GAMBAR || []).includes(L)) { els.forEach((e, i) => { e.value = awal[i]; }); for (let f = 0; f < 30; f++) gambar(); png = cv.toDataURL('image/png'); }
      perLebar[L] = {
        png, H: [...tinggi].join('/'),
        potong: [...potong].map(([k, v]) => `${k} +${v.lewat.toFixed(1)} (${v.kode})`),
        tumpang: [...tumpang].map(([k, v]) => `${k} (${v})`),
        kecil: [...kecil].map(([k, v]) => `${k} ${v}`),
        galat: [...galat.keys()],
        bentuk: bentuk > 2 ? `+${bentuk.toFixed(1)} di ${bentukDi}` : '',
      };
    }
    els.forEach((e, i) => { e.value = awal[i]; });
    cv.style.width = '';
    hasil[cvId] = perLebar;
  }
  const pre = document.createElement('pre');
  pre.textContent = 'DA' + 'TA>>' + JSON.stringify({ monoSiap, hasil }) + '<<DA' + 'TA';
  document.body.appendChild(pre);
})();
