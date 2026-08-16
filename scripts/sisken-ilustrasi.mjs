/**
 * Mesin ilustrasi SVG untuk badan penjelasan modul Sisken.
 *
 * Setiap sub-bagian materi mendapat satu gambar skematik bernomor
 * ("Gambar k — judul") yang dirender dari spesifikasi deklaratif di
 * sisken-ilustrasi-data.mjs. SVG digambar di sini supaya seluruh gambar
 * memakai palet, grid, dan tipografi yang sama — konsisten karena
 * konstruksi, bukan karena disiplin menggambar.
 */

const W = 660;
const H = 250;
const C = {
  cyan: "#22d3ee", violet: "#a855f7", hijau: "#00e09e", oranye: "#f97316",
  biru: "#0ea5e9", merah: "#ef4444", kuning: "#fbbf24", muted: "#94a3b8",
  teks: "#e2e8f0", grid: "#243653", bg: "#0a101f", panel: "#0e1628",
};

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function teks(x, y, t, o = {}) {
  const a = o.anchor || "start";
  const s = o.size || 12;
  const f = o.fill || C.muted;
  const w = o.weight ? `font-weight="${o.weight}"` : "";
  const mono = o.mono ? "font-family=\"'JetBrains Mono',monospace\"" : "font-family=\"'Inter',system-ui,sans-serif\"";
  return `<text x="${x}" y="${y}" text-anchor="${a}" font-size="${s}" fill="${f}" ${w} ${mono}>${esc(t)}</text>`;
}

function garis(x1, y1, x2, y2, warna, o = {}) {
  const putus = o.putus ? ` stroke-dasharray="${o.putus}"` : "";
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${warna}" stroke-width="${o.tebal || 1.6}"${putus} stroke-linecap="round"/>`;
}

function panah(x1, y1, x2, y2, warna, o = {}) {
  const dx = x2 - x1; const dy = y2 - y1;
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L; const uy = dy / L;
  const bx = x2 - ux * 9; const by = y2 - uy * 9;
  const kepala = `<polygon points="${x2},${y2} ${bx - uy * 4.5},${by + ux * 4.5} ${bx + uy * 4.5},${by - ux * 4.5}" fill="${warna}"/>`;
  return garis(x1, y1, bx, by, warna, o) + kepala;
}

function kotakLabel(x, y, w, h, label, warna, o = {}) {
  const fs = o.size || 13;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${C.panel}" stroke="${warna}" stroke-width="1.6"/>`
    + teks(x + w / 2, y + h / 2 + fs / 3, label, { anchor: "middle", size: fs, fill: C.teks, weight: 600, mono: o.mono });
}

/* ── bidang kurva bergaris kisi ─────────────────────────────────────── */

function bidang(padL, padT, padR, padB) {
  const x0 = padL; const y0 = padT; const x1 = W - padR; const y1 = H - padB;
  let g = `<rect x="0" y="0" width="${W}" height="${H}" fill="${C.bg}"/>`;
  for (let i = 0; i <= 10; i += 1) {
    const px = x0 + (i * (x1 - x0)) / 10;
    g += `<line x1="${px}" y1="${y0}" x2="${px}" y2="${y1}" stroke="${C.grid}" stroke-width="0.7"/>`;
  }
  for (let j = 0; j <= 5; j += 1) {
    const py = y0 + (j * (y1 - y0)) / 5;
    g += `<line x1="${x0}" y1="${py}" x2="${x1}" y2="${py}" stroke="${C.grid}" stroke-width="0.7"/>`;
  }
  g += garis(x0, y1, x1, y1, C.muted, { tebal: 1.4 }) + garis(x0, y0, x0, y1, C.muted, { tebal: 1.4 });
  const U = (u) => x0 + u * (x1 - x0);
  const V = (v) => y1 - v * (y1 - y0);
  return { g, U, V, x0, y0, x1, y1 };
}

/* Preset bentuk kurva: titik [u,v] dalam 0..1 — kosakata bersama supaya
   spesifikasi cukup menyebut nama bentuknya. */
const PRESET = {
  "step-lonjak": [[0, 0], [0.08, 0.25], [0.16, 0.78], [0.24, 1.02], [0.32, 0.88], [0.4, 0.99], [0.48, 0.93], [0.58, 0.96], [0.7, 0.95], [1, 0.95]],
  "step-mulus": [[0, 0], [0.1, 0.28], [0.2, 0.58], [0.3, 0.78], [0.42, 0.89], [0.56, 0.94], [0.72, 0.95], [1, 0.95]],
  "step-lambat": [[0, 0], [0.15, 0.18], [0.3, 0.38], [0.5, 0.6], [0.7, 0.76], [0.85, 0.84], [1, 0.88]],
  "step-tunak-kurang": [[0, 0], [0.1, 0.3], [0.2, 0.55], [0.32, 0.68], [0.5, 0.74], [0.7, 0.76], [1, 0.76]],
  "eks-turun": [[0, 0.95], [0.12, 0.62], [0.25, 0.4], [0.4, 0.24], [0.58, 0.13], [0.78, 0.07], [1, 0.04]],
  "eks-naik": [[0, 0.04], [0.15, 0.34], [0.3, 0.57], [0.5, 0.76], [0.7, 0.87], [1, 0.94]],
  "osilasi-tetap": [[0, 0.5], [0.08, 0.85], [0.16, 0.5], [0.24, 0.15], [0.32, 0.5], [0.4, 0.85], [0.48, 0.5], [0.56, 0.15], [0.64, 0.5], [0.72, 0.85], [0.8, 0.5], [0.88, 0.15], [1, 0.5]],
  "osilasi-membesar": [[0, 0.5], [0.09, 0.62], [0.18, 0.42], [0.27, 0.68], [0.36, 0.32], [0.45, 0.76], [0.54, 0.22], [0.63, 0.86], [0.72, 0.1], [0.81, 0.95], [0.9, 0.03], [1, 1]],
  "osilasi-teredam": [[0, 0.5], [0.07, 0.9], [0.15, 0.28], [0.23, 0.74], [0.31, 0.38], [0.4, 0.64], [0.5, 0.44], [0.6, 0.56], [0.72, 0.48], [0.85, 0.52], [1, 0.5]],
  "naik-linier": [[0, 0.05], [1, 0.9]],
  "resonansi": [[0, 0.18], [0.2, 0.24], [0.35, 0.38], [0.45, 0.72], [0.5, 0.97], [0.55, 0.72], [0.65, 0.38], [0.8, 0.24], [1, 0.18]],
  "lembah": [[0, 0.9], [0.15, 0.55], [0.3, 0.3], [0.45, 0.16], [0.55, 0.14], [0.7, 0.24], [0.85, 0.5], [1, 0.85]],
  "sigmoid": [[0, 0.06], [0.2, 0.12], [0.35, 0.25], [0.5, 0.5], [0.65, 0.75], [0.8, 0.88], [1, 0.94]],
  "jenuh": [[0, 0.05], [0.2, 0.45], [0.35, 0.72], [0.5, 0.85], [0.7, 0.9], [1, 0.9]],
  "datar": [[0, 0.5], [1, 0.5]],
  "turun-lambat": [[0, 0.85], [0.25, 0.74], [0.5, 0.6], [0.75, 0.44], [1, 0.3]],
  "naik-cepat-akhir": [[0, 0.08], [0.3, 0.12], [0.55, 0.2], [0.75, 0.38], [0.88, 0.62], [1, 0.95]],
  "derau": [[0, 0.5], [0.06, 0.58], [0.12, 0.45], [0.18, 0.56], [0.24, 0.48], [0.3, 0.6], [0.36, 0.44], [0.42, 0.55], [0.48, 0.5], [0.54, 0.6], [0.6, 0.42], [0.66, 0.57], [0.72, 0.47], [0.78, 0.56], [0.84, 0.44], [0.9, 0.58], [1, 0.5]],
};

function ambilPts(spec) {
  if (Array.isArray(spec)) return spec;
  const p = PRESET[spec];
  if (!p) throw new Error(`Preset kurva tidak dikenal: "${spec}"`);
  return p;
}

function jalurKurva(b, pts, warna, o = {}) {
  const d = pts.map(([u, v], i) => `${i === 0 ? "M" : "L"}${b.U(u).toFixed(1)},${b.V(v).toFixed(1)}`).join(" ");
  const putus = o.putus ? ` stroke-dasharray="5 4"` : "";
  return `<path d="${d}" fill="none" stroke="${warna}" stroke-width="${o.tebal || 2.4}"${putus} stroke-linejoin="round" stroke-linecap="round"/>`;
}

/* ── jenis-jenis diagram ────────────────────────────────────────────── */

function gKurva(p) {
  const b = bidang(46, 26, 16, 34);
  let g = b.g;
  const legenda = [];
  (p.kurva || []).forEach((k, i) => {
    const warna = k.warna || [C.cyan, C.oranye, C.hijau, C.violet][i % 4];
    g += jalurKurva(b, ambilPts(k.preset || k.pts), warna, { putus: k.putus });
    if (k.label) legenda.push([k.label, warna]);
  });
  (p.garisY || []).forEach((t) => {
    g += garis(b.x0, b.V(t.v), b.x1, b.V(t.v), t.warna || C.muted, { putus: "4 4", tebal: 1 });
    if (t.label) g += teks(b.x1 - 4, b.V(t.v) - 5, t.label, { anchor: "end", size: 11, fill: t.warna || C.muted });
  });
  (p.anotasi || []).forEach((a) => {
    g += teks(b.U(a.u), b.V(a.v), a.teks, { size: 11.5, fill: a.warna || C.teks, anchor: a.anchor || "start" });
  });
  let lx = b.x0 + 8;
  legenda.forEach(([label, warna]) => {
    g += garis(lx, b.y0 - 10, lx + 20, b.y0 - 10, warna, { tebal: 3 });
    g += teks(lx + 26, b.y0 - 6, label, { size: 11.5, fill: C.teks });
    lx += 34 + label.length * 6.6;
  });
  g += teks((b.x0 + b.x1) / 2, H - 8, p.sumbuX || "waktu", { anchor: "middle", size: 12 });
  g += `<g transform="rotate(-90 14 ${(b.y0 + b.y1) / 2})">${teks(14, (b.y0 + b.y1) / 2 + 4, p.sumbuY || "nilai", { anchor: "middle", size: 12 })}</g>`;
  return g;
}

function gBlok(p) {
  const kotak = p.kotak || ["C(s)", "G(s)"];
  const umpan = p.umpan !== undefined ? p.umpan : "H(s)";
  const y = 92; const tinggi = 44;
  const mulai = 60; const akhirX = W - 60;
  const nK = kotak.length;
  const lebar = Math.min(120, (akhirX - mulai - 90 - nK * 34) / nK + 30);
  let g = `<rect x="0" y="0" width="${W}" height="${H}" fill="${C.bg}"/>`;
  let x = mulai;
  g += teks(x - 34, y + tinggi / 2 + 4, p.masuk || "r", { size: 14, fill: C.hijau, weight: 700, mono: true });
  // penjumlah
  const cx = x + 16; const cy = y + tinggi / 2;
  g += `<circle cx="${cx}" cy="${cy}" r="13" fill="${C.panel}" stroke="${C.muted}" stroke-width="1.6"/>`;
  g += teks(cx - 6, cy - 4, "+", { size: 11, fill: C.teks, anchor: "middle" });
  g += teks(cx - 4, cy + 12, "−", { size: 11, fill: C.oranye, anchor: "middle" });
  g += panah(x - 26, cy, cx - 13, cy, C.muted);
  x = cx + 13;
  const warnaKotak = [C.cyan, C.violet, C.biru, C.oranye];
  kotak.forEach((t, i) => {
    g += panah(x, cy, x + 26, cy, C.muted);
    x += 26;
    g += kotakLabel(x, y, lebar, tinggi, t, warnaKotak[i % 4], { mono: true });
    x += lebar;
  });
  g += panah(x, cy, akhirX + 26, cy, C.muted);
  g += teks(akhirX + 32, cy + 4, p.keluar || "y", { size: 14, fill: C.hijau, weight: 700, mono: true });
  if (umpan) {
    const yb = y + tinggi + 46;
    const xTap = akhirX + 8;
    g += `<circle cx="${xTap}" cy="${cy}" r="3" fill="${C.muted}"/>`;
    g += garis(xTap, cy, xTap, yb, C.muted);
    if (umpan === true) {
      g += garis(xTap, yb, cx, yb, C.muted);
    } else {
      const lw = 86;
      const bx = (cx + xTap) / 2 - lw / 2;
      g += garis(xTap, yb, bx + lw, yb, C.muted);
      g += kotakLabel(bx, yb - 20, lw, 40, umpan, C.oranye, { mono: true });
      g += garis(bx, yb, cx, yb, C.muted);
    }
    g += panah(cx, yb, cx, cy + 13, C.muted);
  }
  if (p.catat) g += teks(W / 2, H - 14, p.catat, { anchor: "middle", size: 12, fill: C.muted });
  return g;
}

function gAlur(p) {
  const langkah = p.langkah || [];
  let g = `<rect x="0" y="0" width="${W}" height="${H}" fill="${C.bg}"/>`;
  const perBaris = Math.ceil(langkah.length / (langkah.length > 4 ? 2 : 1));
  const baris = [langkah.slice(0, perBaris), langkah.slice(perBaris)].filter((b) => b.length);
  const tinggi = 46;
  const warna = [C.cyan, C.biru, C.violet, C.oranye, C.hijau, C.kuning];
  baris.forEach((brs, bi) => {
    const total = brs.length;
    const lebar = Math.min(150, (W - 60 - (total - 1) * 40) / total);
    const y = baris.length === 1 ? H / 2 - tinggi / 2 - 8 : 46 + bi * (tinggi + 62);
    let x = (W - (total * lebar + (total - 1) * 40)) / 2;
    brs.forEach((t, i) => {
      const idx = bi * perBaris + i;
      const isi = typeof t === "string" ? t : t.t;
      g += kotakLabel(x, y, lebar, tinggi, isi, (typeof t === "object" && t.warna) || warna[idx % 6], { size: 12.5 });
      if (i < total - 1) g += panah(x + lebar, y + tinggi / 2, x + lebar + 40, y + tinggi / 2, C.muted);
      x += lebar + 40;
    });
    if (bi === 0 && baris.length === 2) {
      const xu = W - 32;
      g += garis(xu, y + tinggi, xu, y + tinggi + 62 - 14, C.muted);
      g += panah(xu, y + tinggi + 48, 30 + 6, y + tinggi + 48, C.muted);
    }
  });
  if (p.catat) g += teks(W / 2, H - 14, p.catat, { anchor: "middle", size: 12, fill: C.muted });
  return g;
}

function gSinyal(p) {
  const b = bidang(46, 26, 16, 34);
  let g = b.g;
  const N = 120;
  const f1 = p.f1 || 9; const f2 = p.f2 || 1;
  const sin1 = [];
  for (let i = 0; i <= N; i += 1) {
    const u = i / N;
    sin1.push([u, 0.5 + 0.4 * Math.sin(2 * Math.PI * f1 * u)]);
  }
  if (p.mode === "alias") {
    g += jalurKurva(b, sin1, C.muted, { tebal: 1.4 });
    const alias = [];
    for (let i = 0; i <= N; i += 1) {
      const u = i / N;
      alias.push([u, 0.5 + 0.4 * Math.sin(2 * Math.PI * f2 * u)]);
    }
    g += jalurKurva(b, alias, C.merah, { putus: true, tebal: 2.2 });
    const nS = 10;
    for (let i = 0; i <= nS; i += 1) {
      const u = i / nS;
      const v = 0.5 + 0.4 * Math.sin(2 * Math.PI * f1 * u);
      g += `<circle cx="${b.U(u)}" cy="${b.V(v)}" r="4.4" fill="${C.kuning}"/>`;
    }
    g += teks(b.x0 + 8, b.y0 - 6, "sinyal asli (cepat)", { size: 11.5, fill: C.muted });
    g += teks(b.x0 + 150, b.y0 - 6, "titik sampel", { size: 11.5, fill: C.kuning });
    g += teks(b.x0 + 244, b.y0 - 6, "frekuensi palsu yang terbaca", { size: 11.5, fill: C.merah });
  } else if (p.mode === "zoh") {
    const halus = [];
    for (let i = 0; i <= N; i += 1) {
      const u = i / N;
      halus.push([u, 0.5 + 0.34 * Math.sin(2 * Math.PI * 1.25 * u)]);
    }
    g += jalurKurva(b, halus, C.muted, { tebal: 1.4, putus: true });
    const nS = 12;
    let d = "";
    for (let i = 0; i < nS; i += 1) {
      const u0 = i / nS; const u1 = (i + 1) / nS;
      const v = 0.5 + 0.34 * Math.sin(2 * Math.PI * 1.25 * u0);
      d += `${i === 0 ? "M" : "L"}${b.U(u0).toFixed(1)},${b.V(v).toFixed(1)} L${b.U(u1).toFixed(1)},${b.V(v).toFixed(1)} `;
      g += `<circle cx="${b.U(u0)}" cy="${b.V(v)}" r="3.6" fill="${C.kuning}"/>`;
    }
    g += `<path d="${d}" fill="none" stroke="${C.cyan}" stroke-width="2.4"/>`;
    g += teks(b.x0 + 8, b.y0 - 6, "sinyal kontinu yang diinginkan", { size: 11.5, fill: C.muted });
    g += teks(b.x0 + 250, b.y0 - 6, "keluaran ZOH bertangga", { size: 11.5, fill: C.cyan });
  } else {
    const halus = [];
    for (let i = 0; i <= N; i += 1) {
      const u = i / N;
      halus.push([u, 0.5 + 0.34 * Math.sin(2 * Math.PI * 1.5 * u)]);
    }
    g += jalurKurva(b, halus, C.cyan, { tebal: 2 });
    const nS = p.nSampel || 14;
    for (let i = 0; i <= nS; i += 1) {
      const u = i / nS;
      const v = 0.5 + 0.34 * Math.sin(2 * Math.PI * 1.5 * u);
      g += garis(b.U(u), b.V(0.02), b.U(u), b.V(v), C.kuning, { tebal: 1 });
      g += `<circle cx="${b.U(u)}" cy="${b.V(v)}" r="4" fill="${C.kuning}"/>`;
    }
    g += teks(b.x0 + 8, b.y0 - 6, "sinyal kontinu", { size: 11.5, fill: C.cyan });
    g += teks(b.x0 + 120, b.y0 - 6, "nilai yang dibaca tiap periode sampling", { size: 11.5, fill: C.kuning });
  }
  g += teks((b.x0 + b.x1) / 2, H - 8, p.sumbuX || "waktu", { anchor: "middle", size: 12 });
  return g;
}

function gBanding(p) {
  const lebar = (W - 3 * 24) / 2;
  let g = `<rect x="0" y="0" width="${W}" height="${H}" fill="${C.bg}"/>`;
  [[24, p.kiri], [24 * 2 + lebar, p.kanan]].forEach(([ox, sisi]) => {
    const x0 = ox + 30; const x1 = ox + lebar - 8;
    const y0 = 48; const y1 = H - 44;
    g += `<rect x="${ox}" y="${y0 - 26}" width="${lebar}" height="${y1 - y0 + 26 + 26}" rx="12" fill="${C.panel}" stroke="${C.grid}"/>`;
    for (let i = 0; i <= 5; i += 1) {
      const px = x0 + (i * (x1 - x0)) / 5;
      g += `<line x1="${px}" y1="${y0}" x2="${px}" y2="${y1}" stroke="${C.grid}" stroke-width="0.6"/>`;
    }
    g += garis(x0, y1, x1, y1, C.muted, { tebal: 1.2 }) + garis(x0, y0, x0, y1, C.muted, { tebal: 1.2 });
    const mini = { U: (u) => x0 + u * (x1 - x0), V: (v) => y1 - v * (y1 - y0), x0, y0, x1, y1 };
    (sisi.kurva || [{ preset: sisi.preset, warna: sisi.warna }]).forEach((k, i) => {
      g += jalurKurva(mini, ambilPts(k.preset || k.pts), k.warna || [C.cyan, C.oranye][i % 2], { tebal: 2.2, putus: k.putus });
    });
    g += teks(ox + lebar / 2, y0 - 8, sisi.judul, { anchor: "middle", size: 12.5, fill: C.teks, weight: 700 });
    if (sisi.catat) g += teks(ox + lebar / 2, H - 16, sisi.catat, { anchor: "middle", size: 11.3, fill: C.muted });
  });
  return g;
}

function gPeta(p) {
  const b = bidang(52, 26, 16, 36);
  let g = b.g;
  (p.wilayah || []).forEach((wl) => {
    const d = wl.poly.map(([u, v], i) => `${i === 0 ? "M" : "L"}${b.U(u).toFixed(1)},${b.V(v).toFixed(1)}`).join(" ") + " Z";
    g += `<path d="${d}" fill="${wl.warna || C.cyan}" fill-opacity="0.16" stroke="${wl.warna || C.cyan}" stroke-width="1.4"/>`;
    if (wl.label) g += teks(b.U(wl.pusat?.[0] ?? 0.5), b.V(wl.pusat?.[1] ?? 0.5), wl.label, { anchor: "middle", size: 12, fill: wl.warna || C.cyan, weight: 700 });
  });
  (p.titik || []).forEach((t) => {
    g += `<circle cx="${b.U(t.u)}" cy="${b.V(t.v)}" r="5" fill="${t.warna || C.kuning}"/>`;
    if (t.label) g += teks(b.U(t.u) + 9, b.V(t.v) + 4, t.label, { size: 11.5, fill: t.warna || C.kuning });
  });
  g += teks((b.x0 + b.x1) / 2, H - 8, p.sumbuX || "", { anchor: "middle", size: 12 });
  g += `<g transform="rotate(-90 14 ${(b.y0 + b.y1) / 2})">${teks(14, (b.y0 + b.y1) / 2 + 4, p.sumbuY || "", { anchor: "middle", size: 12 })}</g>`;
  return g;
}

function gNeuron(p) {
  const lapis = p.lapis || [3, 4, 1];
  let g = `<rect x="0" y="0" width="${W}" height="${H}" fill="${C.bg}"/>`;
  const xs = lapis.map((_, i) => 90 + (i * (W - 180)) / (lapis.length - 1));
  const pos = lapis.map((nN, li) => {
    const ys = [];
    for (let i = 0; i < nN; i += 1) ys.push(H / 2 + (i - (nN - 1) / 2) * 46);
    return ys.map((y) => [xs[li], y]);
  });
  for (let li = 0; li < lapis.length - 1; li += 1) {
    for (const [x1, y1] of pos[li]) for (const [x2, y2] of pos[li + 1]) {
      g += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.grid}" stroke-width="1"/>`;
    }
  }
  const warna = [C.hijau, C.cyan, C.violet, C.oranye];
  pos.forEach((lp, li) => {
    for (const [x, y] of lp) {
      g += `<circle cx="${x}" cy="${y}" r="13" fill="${C.panel}" stroke="${warna[Math.min(li, 3)]}" stroke-width="2"/>`;
    }
  });
  (p.labelIn || []).forEach((t, i) => {
    if (pos[0][i]) g += teks(pos[0][i][0] - 20, pos[0][i][1] + 4, t, { anchor: "end", size: 11.5, fill: C.hijau, mono: true });
  });
  (p.labelOut || []).forEach((t, i) => {
    const lp = pos[pos.length - 1];
    if (lp[i]) g += teks(lp[i][0] + 20, lp[i][1] + 4, t, { size: 11.5, fill: C.oranye, mono: true });
  });
  (p.judulLapis || []).forEach((t, i) => {
    if (xs[i] !== undefined) g += teks(xs[i], 24, t, { anchor: "middle", size: 11.5, fill: C.muted });
  });
  if (p.catat) g += teks(W / 2, H - 10, p.catat, { anchor: "middle", size: 12, fill: C.muted });
  return g;
}

function gFuzzy(p) {
  const b = bidang(46, 30, 16, 36);
  let g = b.g;
  const label = p.label || ["Negatif", "Nol", "Positif"];
  const nL = label.length;
  const warna = [C.biru, C.hijau, C.oranye, C.violet, C.merah];
  label.forEach((t, i) => {
    const pusat = nL === 1 ? 0.5 : i / (nL - 1);
    const lebar = 1 / (nL - 1 || 1);
    const pts = [[Math.max(0, pusat - lebar), 0], [pusat, 1], [Math.min(1, pusat + lebar), 0]];
    g += jalurKurva(b, pts, warna[i % 5], { tebal: 2.2 });
    // Label himpunan tepi dijepit ke dalam bidang supaya tidak keluar kanvas.
    const xl = Math.min(Math.max(b.U(pusat), b.x0 + 30), b.x1 - 30);
    g += teks(xl, b.y0 - 8, t, { anchor: "middle", size: 11.5, fill: warna[i % 5], weight: 700 });
  });
  if (p.uContoh !== undefined) {
    g += garis(b.U(p.uContoh), b.y0, b.U(p.uContoh), b.y1, C.kuning, { putus: "4 4", tebal: 1.4 });
    g += teks(b.U(p.uContoh) + 6, b.y1 - 8, p.labelContoh || "nilai terukur", { size: 11, fill: C.kuning });
  }
  g += teks((b.x0 + b.x1) / 2, H - 8, p.sumbuX || "nilai masukan", { anchor: "middle", size: 12 });
  g += `<g transform="rotate(-90 14 ${(b.y0 + b.y1) / 2})">${teks(14, (b.y0 + b.y1) / 2 + 4, "keanggotaan", { anchor: "middle", size: 12 })}</g>`;
  return g;
}

function gPopulasi(p) {
  const b = bidang(46, 26, 16, 36);
  let g = b.g;
  const acak = (s) => { let x = s; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; };
  const target = [0.78, 0.3];
  const genN = p.gen || 3;
  const warna = [C.muted, C.biru, C.cyan, C.hijau];
  for (let gi = 0; gi < genN; gi += 1) {
    const r = acak(7 + gi * 13);
    const sebar = 0.42 - (gi * 0.34) / Math.max(1, genN - 1);
    for (let i = 0; i < 14; i += 1) {
      const u = target[0] + (r() - 0.5) * 2 * sebar * (0.9 + 0.4 * r());
      const v = target[1] + (r() - 0.5) * 2 * sebar;
      if (u < 0.02 || u > 0.98 || v < 0.02 || v > 0.95) continue;
      g += `<circle cx="${b.U(u)}" cy="${b.V(v)}" r="${3 + gi}" fill="${warna[Math.min(gi + 1, 3)]}" fill-opacity="${0.45 + 0.5 * (gi / genN)}"/>`;
    }
  }
  g += `<path d="M${b.U(target[0]) - 8},${b.V(target[1])} L${b.U(target[0]) + 8},${b.V(target[1])} M${b.U(target[0])},${b.V(target[1]) - 8} L${b.U(target[0])},${b.V(target[1]) + 8}" stroke="${C.kuning}" stroke-width="2.6"/>`;
  g += teks(b.U(target[0]) + 12, b.V(target[1]) - 8, p.labelTarget || "optimum", { size: 11.5, fill: C.kuning });
  g += teks(b.x0 + 8, b.y0 - 6, "generasi awal menyebar", { size: 11.5, fill: C.muted });
  g += teks(b.x0 + 200, b.y0 - 6, "generasi akhir mengumpul", { size: 11.5, fill: C.hijau });
  g += teks((b.x0 + b.x1) / 2, H - 8, p.sumbuX || "parameter 1", { anchor: "middle", size: 12 });
  g += `<g transform="rotate(-90 14 ${(b.y0 + b.y1) / 2})">${teks(14, (b.y0 + b.y1) / 2 + 4, p.sumbuY || "parameter 2", { anchor: "middle", size: 12 })}</g>`;
  return g;
}

function gPolezero(p) {
  let g = `<rect x="0" y="0" width="${W}" height="${H}" fill="${C.bg}"/>`;
  const cx = W * 0.58; const cy = H / 2 - 6;
  const sk = 34;
  g += `<rect x="0" y="${cy - 96}" width="${cx}" height="192" fill="${C.hijau}" fill-opacity="0.07"/>`;
  g += garis(30, cy, W - 30, cy, C.muted, { tebal: 1.3 });
  g += garis(cx, cy - 96, cx, cy + 96, C.muted, { tebal: 1.3 });
  g += teks(W - 28, cy + 16, "Re(s)", { size: 12 });
  g += teks(cx + 8, cy - 84, "Im(s)", { size: 12 });
  g += teks(cx / 2, cy + 88, p.labelKiri || "wilayah stabil", { anchor: "middle", size: 12, fill: C.hijau });
  (p.pole || []).forEach((pt) => {
    const x = cx + pt[0] * sk; const y = cy - pt[1] * sk;
    g += `<path d="M${x - 6},${y - 6} L${x + 6},${y + 6} M${x - 6},${y + 6} L${x + 6},${y - 6}" stroke="${C.merah}" stroke-width="2.6"/>`;
    if (pt[2]) g += teks(x + 9, y - 7, pt[2], { size: 11, fill: C.merah });
  });
  (p.zero || []).forEach((pt) => {
    const x = cx + pt[0] * sk; const y = cy - pt[1] * sk;
    g += `<circle cx="${x}" cy="${y}" r="6" fill="none" stroke="${C.cyan}" stroke-width="2.4"/>`;
    if (pt[2]) g += teks(x + 9, y - 7, pt[2], { size: 11, fill: C.cyan });
  });
  if (p.catat) g += teks(W / 2, H - 10, p.catat, { anchor: "middle", size: 12, fill: C.muted });
  return g;
}

function gTangga(p) {
  let g = `<rect x="0" y="0" width="${W}" height="${H}" fill="${C.bg}"/>`;
  const batang = p.batang || [];
  const x0 = 190; const x1 = W - 40;
  const tinggi = Math.min(34, (H - 70) / batang.length - 12);
  const warna = [C.cyan, C.violet, C.oranye, C.hijau, C.biru, C.kuning];
  batang.forEach((bt, i) => {
    const y = 34 + i * (tinggi + 14);
    const w = Math.max(10, bt.nilai * (x1 - x0));
    g += teks(x0 - 10, y + tinggi / 2 + 4, bt.label, { anchor: "end", size: 12, fill: C.teks });
    g += `<rect x="${x0}" y="${y}" width="${w}" height="${tinggi}" rx="7" fill="${bt.warna || warna[i % 6]}" fill-opacity="0.8"/>`;
    if (bt.tanda) g += teks(x0 + w + 8, y + tinggi / 2 + 4, bt.tanda, { size: 11.5, fill: C.muted });
  });
  if (p.catat) g += teks(W / 2, H - 12, p.catat, { anchor: "middle", size: 12, fill: C.muted });
  return g;
}

function gTimeline(p) {
  let g = `<rect x="0" y="0" width="${W}" height="${H}" fill="${C.bg}"/>`;
  const y = H / 2 + 12;
  g += panah(36, y, W - 28, y, C.muted, { tebal: 1.6 });
  (p.titik || []).forEach((t, i) => {
    const x = 60 + t.u * (W - 130);
    const atas = i % 2 === 0;
    g += `<circle cx="${x}" cy="${y}" r="6" fill="${t.warna || C.cyan}"/>`;
    g += garis(x, y, x, atas ? y - 34 : y + 34, t.warna || C.cyan, { tebal: 1.2 });
    g += teks(x, atas ? y - 42 : y + 50, t.label, { anchor: "middle", size: 11.6, fill: C.teks });
    if (t.sub) g += teks(x, atas ? y - 28 : y + 64, t.sub, { anchor: "middle", size: 10.6, fill: C.muted });
  });
  g += teks(W - 26, y + 18, p.sumbu || "waktu", { anchor: "end", size: 12 });
  if (p.catat) g += teks(W / 2, H - 10, p.catat, { anchor: "middle", size: 12, fill: C.muted });
  return g;
}

const JENIS = {
  kurva: gKurva, blok: gBlok, alur: gAlur, sinyal: gSinyal, banding: gBanding,
  peta: gPeta, neuron: gNeuron, fuzzy: gFuzzy, populasi: gPopulasi,
  polezero: gPolezero, tangga: gTangga, timeline: gTimeline,
};

/** Render satu figure lengkap dengan nomor dan caption yang merujuknya. */
export function renderIlustrasi(spec, nomor) {
  const gambarFn = JENIS[spec.jenis];
  if (!gambarFn) throw new Error(`Jenis ilustrasi tidak dikenal: "${spec.jenis}"`);
  if (!spec.judul || !spec.caption) throw new Error(`Ilustrasi tanpa judul/caption (jenis ${spec.jenis})`);
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gambar ${nomor} — ${esc(spec.judul)}" preserveAspectRatio="xMidYMid meet">${gambarFn(spec.p || {})}</svg>`;
  return `  <figure class="ilustrasi reveal">
    ${svg}
    <figcaption><strong>Gambar ${nomor}</strong> — ${esc(spec.judul)}. ${spec.caption}</figcaption>
  </figure>`;
}

export const CSS_ILUSTRASI = `
.ilustrasi{margin:18px 0 14px;padding:14px 16px 12px;background:#0a101f;border:1px solid #243653;border-radius:14px}
.ilustrasi svg{width:100%;height:auto;display:block;border-radius:8px}
.ilustrasi figcaption{margin-top:10px;font-size:13.5px;color:var(--muted);line-height:1.7}
.ilustrasi figcaption strong{color:var(--cyan)}
`;
