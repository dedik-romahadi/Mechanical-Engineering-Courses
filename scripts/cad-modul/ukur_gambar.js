// Pengukur tata letak gambar SVG modul CAD, dijalankan di Chrome headless oleh
// periksa_gambar_chrome.py: kotak teks nyata (getBBox), kotak TINTA (batas glif dari
// measureText), dan titik sampel setiap garis/tepi untuk mendeteksi garis yang mencoret teks.
const SUSUT = (typeof window.SUSUT === 'number') ? window.SUSUT : 1;  // bbox dikecilkan sekian px (aturan laporan: 1)
const LANGKAH = 1.5;        // jarak sampel <= 2 px
const TANDA_KECIL = 12;     // isian tanpa stroke berukuran <= ini (titik, kepala panah) tetap dihitung
function matriks(svg, el) { return svg.getCTM().inverse().multiply(el.getCTM()); }
function pt(m, x, y) { return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; }
function takTampil(el) { return !!el.closest('defs,marker,pattern,clipPath,mask,symbol'); }
function sampel(el) {
  const tg = el.tagName.toLowerCase(), A = n => parseFloat(el.getAttribute(n) || 0), P = [];
  const ruas = (x1, y1, x2, y2) => { const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / LANGKAH)); for (let i = 0; i <= n; i++) P.push([x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n]); };
  if (tg === 'line') ruas(A('x1'), A('y1'), A('x2'), A('y2'));
  else if (tg === 'rect') { const x = A('x'), y = A('y'), w = A('width'), h = A('height'); ruas(x, y, x + w, y); ruas(x + w, y, x + w, y + h); ruas(x + w, y + h, x, y + h); ruas(x, y + h, x, y); }
  else if (tg === 'circle' || tg === 'ellipse') {
    const cx = A('cx'), cy = A('cy'), rx = tg === 'circle' ? A('r') : A('rx'), ry = tg === 'circle' ? A('r') : A('ry');
    const n = Math.max(12, Math.ceil(2 * Math.PI * Math.max(rx, ry) / LANGKAH));
    for (let i = 0; i < n; i++) P.push([cx + rx * Math.cos(2 * Math.PI * i / n), cy + ry * Math.sin(2 * Math.PI * i / n)]);
  } else if (el.getTotalLength) {
    const L = el.getTotalLength(), n = Math.max(1, Math.ceil(L / LANGKAH));
    for (let i = 0; i <= n; i++) { const q = el.getPointAtLength(L * i / n); P.push([q.x, q.y]); }
    if (tg === 'polygon' && el.points && el.points.numberOfItems) { const q0 = el.points.getItem(0), q1 = el.points.getItem(el.points.numberOfItems - 1); ruas(q1.x, q1.y, q0.x, q0.y); }
  }
  return P;
}
const KANVAS = document.createElement('canvas').getContext('2d');
function tinta(el, m) {
  // kotak tinta (batas glif nyata) dari canvas measureText; font sama dengan teks SVG
  const cs = getComputedStyle(el);
  KANVAS.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const an = el.getAttribute('text-anchor') || 'start';
  KANVAS.textAlign = an === 'middle' ? 'center' : an === 'end' ? 'right' : 'left';
  const t = KANVAS.measureText(el.textContent.trim()), x = +el.getAttribute('x'), y = +el.getAttribute('y');
  const c = [pt(m, x - t.actualBoundingBoxLeft, y - t.actualBoundingBoxAscent), pt(m, x + t.actualBoundingBoxRight, y + t.actualBoundingBoxDescent)];
  return [Math.min(c[0][0], c[1][0]), Math.min(c[0][1], c[1][1]), Math.max(c[0][0], c[1][0]), Math.max(c[0][1], c[1][1]), t.width];
}
function ukurSvg(svg) {
  const vb = svg.viewBox.baseVal, W = vb.width, H = vb.height;
  const T = [...svg.querySelectorAll('text')].filter(el => el.textContent.trim() && !takTampil(el)).map(el => {
    const b = el.getBBox(), m = matriks(svg, el);
    const c = [pt(m, b.x, b.y), pt(m, b.x + b.width, b.y), pt(m, b.x, b.y + b.height), pt(m, b.x + b.width, b.y + b.height)];
    const xs = c.map(p => p[0]), ys = c.map(p => p[1]);
    return {s: el.textContent, x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys),
            size: +el.getAttribute('font-size'), wt: el.getAttribute('font-weight') || '', an: el.getAttribute('text-anchor'),
            ax: +el.getAttribute('x'), ay: +el.getAttribute('y'), ink: tinta(el, m), hits: []};
  });
  const R = [], B = [];
  for (const el of svg.querySelectorAll('line,polyline,polygon,path,circle,ellipse,rect')) {
    if (takTampil(el)) continue;
    const cs = getComputedStyle(el), tg = el.tagName.toLowerCase();
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const sw = parseFloat(cs.strokeWidth) || 0, adaStroke = cs.stroke && cs.stroke !== 'none' && sw > 0 && parseFloat(cs.strokeOpacity || 1) > 0;
    const bb = el.getBBox(), m = matriks(svg, el);
    if (tg === 'rect') {
      const w = +el.getAttribute('width'), h = +el.getAttribute('height');
      if (w >= W * 0.95 && h >= H * 0.95) continue;             // latar kanvas
      // kotak dalam koordinat kanvas (ikut transform elemen/grup), sama seperti teks
      const x = +el.getAttribute('x') || 0, y = +el.getAttribute('y') || 0;
      const q = [pt(m, x, y), pt(m, x + w, y), pt(m, x, y + h), pt(m, x + w, y + h)];
      const qx = q.map(v => v[0]), qy = q.map(v => v[1]);
      R.push([Math.min(...qx), Math.min(...qy), Math.max(...qx) - Math.min(...qx), Math.max(...qy) - Math.min(...qy)]);
    }
    const kecil = Math.max(bb.width, bb.height) <= TANDA_KECIL && tg !== 'rect' && tg !== 'line';
    if (!adaStroke && !kecil) continue;                         // bidang isian tanpa stroke
    const P = sampel(el).map(p => pt(m, p[0], p[1]));
    if (!adaStroke) P.push(pt(m, bb.x + bb.width / 2, bb.y + bb.height / 2));
    const tambah = adaStroke ? Math.max(0, sw / 2 - 1) : 0;     // stroke tebal ikut dihitung
    let desk = tg === 'line' ? `line ${(+el.getAttribute('x1')).toFixed(1)},${(+el.getAttribute('y1')).toFixed(1)}→${(+el.getAttribute('x2')).toFixed(1)},${(+el.getAttribute('y2')).toFixed(1)}`
                             : `${tg} [${bb.x.toFixed(1)}..${(bb.x + bb.width).toFixed(1)}×${bb.y.toFixed(1)}..${(bb.y + bb.height).toFixed(1)}]`;
    desk += adaStroke ? ` ${el.getAttribute('stroke') || cs.stroke} w${sw}${el.getAttribute('stroke-dasharray') ? ' putus' : ''}` : ` isian ${el.getAttribute('fill') || cs.fill}`;
    B.push({desk, P, tambah});
  }
  for (const a of T) for (const b of B) {
    const x0 = a.x0 + SUSUT - b.tambah, x1 = a.x1 - SUSUT + b.tambah, y0 = a.y0 + SUSUT - b.tambah, y1 = a.y1 - SUSUT + b.tambah;
    const k = a.ink, i0 = k[0] + 0.5 - b.tambah, i1 = k[2] - 0.5 + b.tambah, j0 = k[1] + 0.5 - b.tambah, j1 = k[3] - 0.5 + b.tambah;
    let n = 0, ni = 0;
    for (const [x, y] of b.P) { if (x > x0 && x < x1 && y > y0 && y < y1) n++; if (x > i0 && x < i1 && y > j0 && y < j1) ni++; }
    if (n || ni) a.hits.push([b.desk, n, ni]);
  }
  return {id: svg.dataset.id, W, H, T, R};
}
const pre = document.createElement('pre');
pre.textContent = 'DA' + 'TA>>' + JSON.stringify([...document.querySelectorAll('svg[data-id]')].map(ukurSvg)) + '<<DA' + 'TA';
document.body.appendChild(pre);
