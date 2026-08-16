/**
 * Mesin ilustrasi SVG untuk badan penjelasan modul Sisken.
 *
 * Setiap sub-bagian materi mendapat satu gambar skematik bernomor
 * ("Gambar k — judul") yang dirender dari spesifikasi deklaratif di
 * sisken-ilustrasi-data.mjs. SVG digambar di sini supaya seluruh gambar
 * memakai palet, grid, dan tipografi yang sama — konsisten karena
 * konstruksi, bukan karena disiplin menggambar.
 *
 * Prinsip tata letak: tinggi kanvas menyesuaikan jenis diagram (tidak ada
 * ruang kosong), jalur teks dipesan terpisah dari jalur gambar (tidak ada
 * tumpang-tindih), setiap bidang kurva berlabel sumbu X dan Y, dan setiap
 * teks tampilan diawali huruf kapital lewat kapitalAwal().
 */

const W = 660;
const C = {
  cyan: "#22d3ee", violet: "#a855f7", hijau: "#00e09e", oranye: "#f97316",
  biru: "#0ea5e9", merah: "#ef4444", kuning: "#fbbf24", muted: "#94a3b8",
  teks: "#e2e8f0", grid: "#243653", bg: "#0a101f", panel: "#0e1628",
};

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Kata yang memang ditulis kecil (lambang, nama alat) tidak dikapitalkan.
const TETAP_KECIL = new Set(["scipy", "eig", "tanh", "sigmoid", "dt", "de", "exp",
  "ln", "log", "rms", "ipynb", "fuzzy"]);

/** Huruf pertama teks tampilan menjadi kapital; lambang matematika dibiarkan. */
export function kapitalAwal(t) {
  const s = String(t);
  const kata = s.match(/^([a-zà-ÿ][a-zà-ÿ-]{2,})\b/);
  if (!kata || TETAP_KECIL.has(kata[1])) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
const K = kapitalAwal;

function teks(x, y, t, o = {}) {
  const a = o.anchor || "start";
  const s = o.size || 12;
  const f = o.fill || C.muted;
  const w = o.weight ? `font-weight="${o.weight}"` : "";
  const mono = o.mono ? "font-family=\"'JetBrains Mono',monospace\"" : "font-family=\"'Inter',system-ui,sans-serif\"";
  const isi = o.mono ? esc(t) : esc(K(t));
  return `<text x="${x}" y="${y}" text-anchor="${a}" font-size="${s}" fill="${f}" ${w} ${mono}>${isi}</text>`;
}

function garis(x1, y1, x2, y2, warna, o = {}) {
  const putus = o.putus ? ` stroke-dasharray="${o.putus === true ? "5 4" : o.putus}"` : "";
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

function latar(h) {
  return `<rect x="0" y="0" width="${W}" height="${h}" fill="${C.bg}"/>`;
}

/* ── bidang kurva bergaris kisi + label sumbu X/Y ───────────────────── */

function bidang(padL, padT, padR, padB, h) {
  const x0 = padL; const y0 = padT; const x1 = W - padR; const y1 = h - padB;
  let g = latar(h);
  for (let i = 0; i <= 10; i += 1) {
    const px = x0 + (i * (x1 - x0)) / 10;
    g += `<line x1="${px}" y1="${y0}" x2="${px}" y2="${y1}" stroke="${C.grid}" stroke-width="0.7"/>`;
  }
  for (let j = 0; j <= 5; j += 1) {
    const py = y0 + (j * (y1 - y0)) / 5;
    g += `<line x1="${x0}" y1="${py}" x2="${x1}" y2="${py}" stroke="${C.grid}" stroke-width="0.7"/>`;
  }
  g += panah(x0, y1, x1 + 8, y1, C.muted, { tebal: 1.4 });
  g += panah(x0, y1, x0, y0 - 8, C.muted, { tebal: 1.4 });
  const U = (u) => x0 + u * (x1 - x0);
  const V = (v) => y1 - v * (y1 - y0);
  return { g, U, V, x0, y0, x1, y1, h };
}

function labelSumbu(b, sumbuX, sumbuY) {
  let g = teks((b.x0 + b.x1) / 2, b.h - 7, sumbuX || "Waktu", { anchor: "middle", size: 12, fill: C.teks });
  g += `<g transform="rotate(-90 15 ${(b.y0 + b.y1) / 2})">${teks(15, (b.y0 + b.y1) / 2 + 4, sumbuY || "Nilai", { anchor: "middle", size: 12, fill: C.teks })}</g>`;
  return g;
}

/* Baris legenda di jalur khusus ATAS bidang — tidak pernah menimpa kurva. */
function barisLegenda(x0, y, entri) {
  let g = "";
  let lx = x0;
  for (const [label, warna, putus] of entri) {
    g += garis(lx, y, lx + 22, y, warna, { tebal: 3, putus: putus ? "5 4" : "" });
    g += teks(lx + 27, y + 4, label, { size: 11.5, fill: C.teks });
    lx += 34 + String(label).length * 6.4;
  }
  return g;
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
  let g = `<path d="${d}" fill="none" stroke="${warna}" stroke-width="${o.tebal || 2.4}"${putus} stroke-linejoin="round" stroke-linecap="round"/>`;
  if (o.isi) {
    const dArea = `${d} L${b.U(pts[pts.length - 1][0]).toFixed(1)},${b.V(0).toFixed(1)} L${b.U(pts[0][0]).toFixed(1)},${b.V(0).toFixed(1)} Z`;
    g = `<path d="${dArea}" fill="${warna}" fill-opacity="0.09"/>` + g;
  }
  return g;
}

/* ── jenis-jenis diagram ────────────────────────────────────────────── */

function gKurva(p) {
  const h = 252;
  const b = bidang(48, 34, 18, 34, h);
  let g = b.g;
  const legenda = [];
  (p.kurva || []).forEach((k, i) => {
    const warna = k.warna || [C.cyan, C.oranye, C.hijau, C.violet][i % 4];
    g += jalurKurva(b, ambilPts(k.preset || k.pts), warna, { putus: k.putus, isi: i === 0 && !k.putus });
    if (k.label) legenda.push([K(k.label), warna, k.putus]);
  });
  (p.garisY || []).forEach((t) => {
    g += garis(b.x0, b.V(t.v), b.x1, b.V(t.v), t.warna || C.muted, { putus: "4 4", tebal: 1.1 });
    // Label garis acuan di KIRI atas garis: kurva step menanjak dan menumpuk
    // di kanan, sehingga sisi kiri hampir selalu kosong. Spesifikasi boleh
    // memaksa ke kanan (posisi: "kanan") bila sisi kiri terpakai legend.
    if (t.label) {
      const kanan = t.posisi === "kanan";
      g += teks(kanan ? b.x1 - 6 : b.x0 + 8, b.V(t.v) - 5, t.label, { anchor: kanan ? "end" : "start", size: 11, fill: t.warna || C.muted, weight: 600 });
    }
  });
  (p.anotasi || []).forEach((a) => {
    g += teks(b.U(a.u), b.V(a.v), a.teks, { size: 11.5, fill: a.warna || C.teks, anchor: a.anchor || "start" });
  });
  g += barisLegenda(b.x0, b.y0 - 16, legenda);
  g += labelSumbu(b, p.sumbuX, p.sumbuY);
  return { g, h };
}

function gBlok(p) {
  const kotak = p.kotak || ["C(s)", "G(s)"];
  const umpan = p.umpan !== undefined ? p.umpan : "H(s)";
  const h = (umpan ? 152 : 96) + (p.catat ? 24 : 0);
  const y = 22; const tinggi = 44;
  const nK = kotak.length;
  // Label masukan yang panjang ("Proses") butuh margin kiri lebih lebar agar
  // tidak menimpa lingkaran penjumlah maupun terpotong tepi kanvas.
  const masuk = p.masuk || "r";
  const mulai = Math.max(60, 34 + masuk.length * 8.2);
  const akhirX = W - 60;
  const lebar = Math.min(130, (akhirX - mulai - 90 - nK * 30) / nK + 30);
  let g = latar(h);
  let x = mulai;
  const cy = y + tinggi / 2;
  g += teks(x - 30, cy + 4, masuk, { size: 14, fill: C.hijau, weight: 700, mono: true, anchor: "end" });
  const cx = x + 16;
  g += `<circle cx="${cx}" cy="${cy}" r="13" fill="${C.panel}" stroke="${C.muted}" stroke-width="1.6"/>`;
  g += teks(cx - 6, cy - 4, "+", { size: 11, fill: C.teks, anchor: "middle", mono: true });
  g += teks(cx - 4, cy + 12, "−", { size: 11, fill: C.oranye, anchor: "middle", mono: true });
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
    const yb = y + tinggi + 44;
    const xTap = akhirX + 8;
    g += `<circle cx="${xTap}" cy="${cy}" r="3" fill="${C.muted}"/>`;
    g += garis(xTap, cy, xTap, yb, C.muted);
    if (umpan === true) {
      g += garis(xTap, yb, cx, yb, C.muted);
    } else {
      const lw = 96;
      const bx = (cx + xTap) / 2 - lw / 2;
      g += garis(xTap, yb, bx + lw, yb, C.muted);
      g += kotakLabel(bx, yb - 20, lw, 40, umpan, C.oranye, { mono: true });
      g += garis(bx, yb, cx, yb, C.muted);
    }
    g += panah(cx, yb, cx, cy + 13, C.muted);
  }
  if (p.catat) g += teks(W / 2, h - 12, p.catat, { anchor: "middle", size: 12, fill: C.muted });
  return { g, h };
}

function gAlur(p) {
  const langkah = p.langkah || [];
  const duaBaris = langkah.length > 4;
  const tinggi = 46;
  const selaBaris = 40;
  const h = (duaBaris ? 16 + 2 * tinggi + selaBaris + 16 : 16 + tinggi + 16) + (p.catat ? 26 : 0);
  let g = latar(h);
  const perBaris = Math.ceil(langkah.length / (duaBaris ? 2 : 1));
  const baris = [langkah.slice(0, perBaris), langkah.slice(perBaris)].filter((b) => b.length);
  const warna = [C.cyan, C.biru, C.violet, C.oranye, C.hijau, C.kuning];
  // Tata letak dihitung dahulu supaya garis penghubung antarbaris dapat
  // dirutekan dari KOTAK terakhir baris atas ke KOTAK pertama baris bawah,
  // bukan dari tepi kanvas yang kosong.
  const posisi = baris.map((brs, bi) => {
    const total = brs.length;
    const lebar = Math.min(158, (W - 76 - (total - 1) * 38) / total);
    const y = 16 + bi * (tinggi + selaBaris);
    const x0 = (W - (total * lebar + (total - 1) * 38)) / 2;
    return { y, lebar, xs: brs.map((_, i) => x0 + i * (lebar + 38)) };
  });
  baris.forEach((brs, bi) => {
    const { y, lebar, xs } = posisi[bi];
    brs.forEach((t, i) => {
      const idx = bi * perBaris + i;
      const isi = typeof t === "string" ? t : t.t;
      // Label yang lebih lebar dari kotak dipenggal menjadi dua baris di
      // spasi terdekat tengah; ukuran huruf baru menyusut bila masih kurang.
      // Label yang meluber pernah menabrak panah penghubung di sebelahnya.
      const wKotak = (typeof t === "object" && t.warna) || warna[idx % 6];
      const butuh = String(isi).length * 6.7;
      if (butuh > lebar - 14 && String(isi).includes(" ")) {
        const kata = String(isi).split(" ");
        let baris1 = kata[0]; let baris2 = kata.slice(1).join(" ");
        let terbaik = Infinity;
        for (let k = 1; k < kata.length; k += 1) {
          const atas2 = kata.slice(0, k).join(" "); const bawah2 = kata.slice(k).join(" ");
          const beda = Math.abs(atas2.length - bawah2.length);
          if (beda < terbaik) { terbaik = beda; baris1 = atas2; baris2 = bawah2; }
        }
        const terpanjang = Math.max(baris1.length, baris2.length) * 6.2;
        const uk2 = terpanjang > lebar - 12 ? Math.max(9, 11.5 * ((lebar - 12) / terpanjang)) : 11.5;
        g += `<rect x="${xs[i]}" y="${y}" width="${lebar}" height="${tinggi}" rx="9" fill="${C.panel}" stroke="${wKotak}" stroke-width="1.6"/>`
          + teks(xs[i] + lebar / 2, y + tinggi / 2 - 3, baris1, { anchor: "middle", size: uk2, fill: C.teks, weight: 600 })
          + teks(xs[i] + lebar / 2, y + tinggi / 2 + 12, baris2, { anchor: "middle", size: uk2, fill: C.teks, weight: 600 });
      } else {
        const ukuran = butuh > lebar - 14 ? Math.max(9.5, 12.5 * ((lebar - 14) / butuh)) : 12.5;
        g += kotakLabel(xs[i], y, lebar, tinggi, isi, wKotak, { size: ukuran });
      }
      if (i < brs.length - 1) g += panah(xs[i] + lebar, y + tinggi / 2, xs[i] + lebar + 38, y + tinggi / 2, C.muted);
    });
  });
  if (baris.length === 2) {
    // Serpentin: keluar dari sisi kanan kotak terakhir baris atas, memutar di
    // sela antarbaris, lalu masuk ke sisi kiri kotak pertama baris bawah.
    const a = posisi[0]; const b2 = posisi[1];
    const keluarX = a.xs[a.xs.length - 1] + a.lebar;
    const keluarY = a.y + tinggi / 2;
    const belokX = Math.min(W - 18, keluarX + 24);
    const tengahY = a.y + tinggi + selaBaris / 2;
    const masukX = b2.xs[0];
    const masukY = b2.y + tinggi / 2;
    const belokKiriX = Math.max(18, masukX - 24);
    g += garis(keluarX, keluarY, belokX, keluarY, C.muted);
    g += garis(belokX, keluarY, belokX, tengahY, C.muted);
    g += garis(belokX, tengahY, belokKiriX, tengahY, C.muted);
    g += garis(belokKiriX, tengahY, belokKiriX, masukY, C.muted);
    g += panah(belokKiriX, masukY, masukX, masukY, C.muted);
  }
  if (p.catat) g += teks(W / 2, h - 12, p.catat, { anchor: "middle", size: 12, fill: C.muted });
  return { g, h };
}

function gSinyal(p) {
  const h = 252;
  const b = bidang(48, 34, 18, 34, h);
  let g = b.g;
  const N = 120;
  const f1 = p.f1 || 9;
  const legenda = [];
  if (p.mode === "alias") {
    const sin1 = [];
    for (let i = 0; i <= N; i += 1) {
      const u = i / N;
      sin1.push([u, 0.5 + 0.4 * Math.sin(2 * Math.PI * f1 * u)]);
    }
    g += jalurKurva(b, sin1, C.muted, { tebal: 1.4 });
    const alias = [];
    for (let i = 0; i <= N; i += 1) {
      const u = i / N;
      alias.push([u, 0.5 + 0.4 * Math.sin(2 * Math.PI * (p.f2 || 1) * u)]);
    }
    g += jalurKurva(b, alias, C.merah, { putus: true, tebal: 2.4 });
    const nS = 10;
    for (let i = 0; i <= nS; i += 1) {
      const u = i / nS;
      const v = 0.5 + 0.4 * Math.sin(2 * Math.PI * f1 * u);
      g += `<circle cx="${b.U(u)}" cy="${b.V(v)}" r="4.4" fill="${C.kuning}" stroke="${C.bg}" stroke-width="1.4"/>`;
    }
    legenda.push(["Sinyal asli (cepat)", C.muted], ["Titik sampel", C.kuning], ["Frekuensi palsu terbaca", C.merah, true]);
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
      g += `<circle cx="${b.U(u0)}" cy="${b.V(v)}" r="3.6" fill="${C.kuning}" stroke="${C.bg}" stroke-width="1.2"/>`;
    }
    g += `<path d="${d}" fill="none" stroke="${C.cyan}" stroke-width="2.6"/>`;
    legenda.push(["Sinyal yang diinginkan", C.muted, true], ["Keluaran ZOH bertangga", C.cyan]);
  } else {
    const halus = [];
    for (let i = 0; i <= N; i += 1) {
      const u = i / N;
      halus.push([u, 0.5 + 0.34 * Math.sin(2 * Math.PI * 1.5 * u)]);
    }
    g += jalurKurva(b, halus, C.cyan, { tebal: 2.2 });
    const nS = p.nSampel || 14;
    for (let i = 0; i <= nS; i += 1) {
      const u = i / nS;
      const v = 0.5 + 0.34 * Math.sin(2 * Math.PI * 1.5 * u);
      g += garis(b.U(u), b.V(0.02), b.U(u), b.V(v), C.kuning, { tebal: 1 });
      g += `<circle cx="${b.U(u)}" cy="${b.V(v)}" r="4" fill="${C.kuning}" stroke="${C.bg}" stroke-width="1.2"/>`;
    }
    legenda.push(["Sinyal kontinu", C.cyan], ["Nilai terbaca tiap periode sampling", C.kuning]);
  }
  g += barisLegenda(b.x0, b.y0 - 16, legenda);
  g += labelSumbu(b, p.sumbuX, p.sumbuY || "Amplitudo");
  return { g, h };
}

function gBanding(p) {
  // Jalur bawah dipisah tegas: tepi kotak panel (h-52), baris catatan
  // (h-34), lalu label sumbu X (h-10) — dulu catatan memotong tepi kotak
  // dan menempel pada label sumbu.
  const h = 262;
  const lebar = (W - 44 - 2 * 20) / 2;
  let g = latar(h);
  const rectY = 12;
  const y0 = 44; const y1 = h - 64;
  const rectBawah = y1 + 12;
  [[30, p.kiri], [30 + lebar + 20, p.kanan]].forEach(([ox, sisi]) => {
    const x0 = ox + 14; const x1 = ox + lebar - 12;
    g += `<rect x="${ox}" y="${rectY}" width="${lebar}" height="${rectBawah - rectY}" rx="12" fill="${C.panel}" stroke="${C.grid}"/>`;
    for (let i = 1; i <= 4; i += 1) {
      const px = x0 + (i * (x1 - x0)) / 5;
      g += `<line x1="${px}" y1="${y0}" x2="${px}" y2="${y1}" stroke="${C.grid}" stroke-width="0.7"/>`;
      const py = y0 + (i * (y1 - y0)) / 5;
      g += `<line x1="${x0}" y1="${py}" x2="${x1}" y2="${py}" stroke="${C.grid}" stroke-width="0.7"/>`;
    }
    g += panah(x0, y1, x1 + 6, y1, C.muted, { tebal: 1.2 });
    g += panah(x0, y1, x0, y0 - 6, C.muted, { tebal: 1.2 });
    const mini = { U: (u) => x0 + u * (x1 - x0), V: (v) => y1 - v * (y1 - y0) };
    (sisi.kurva || [{ preset: sisi.preset, warna: sisi.warna }]).forEach((k, i) => {
      const warna = k.warna || [C.cyan, C.oranye][i % 2];
      g += jalurKurva(mini, ambilPts(k.preset || k.pts), warna, { tebal: 2.3, putus: k.putus, isi: i === 0 && !k.putus });
    });
    g += teks(ox + lebar / 2, rectY + 18, sisi.judul, { anchor: "middle", size: 12.5, fill: C.teks, weight: 700 });
    if (sisi.catat) g += teks(ox + lebar / 2, h - 34, sisi.catat, { anchor: "middle", size: 11.3, fill: C.muted });
  });
  g += teks(W / 2, h - 10, p.sumbuX || "Waktu", { anchor: "middle", size: 12, fill: C.teks });
  g += `<g transform="rotate(-90 13 ${(y0 + y1) / 2})">${teks(13, (y0 + y1) / 2 + 4, p.sumbuY || "Keluaran", { anchor: "middle", size: 12, fill: C.teks })}</g>`;
  return { g, h };
}

function gPeta(p) {
  const h = 250;
  const b = bidang(52, 26, 18, 34, h);
  let g = b.g;
  (p.wilayah || []).forEach((wl) => {
    const d = wl.poly.map(([u, v], i) => `${i === 0 ? "M" : "L"}${b.U(u).toFixed(1)},${b.V(v).toFixed(1)}`).join(" ") + " Z";
    g += `<path d="${d}" fill="${wl.warna || C.cyan}" fill-opacity="0.16" stroke="${wl.warna || C.cyan}" stroke-width="1.4"/>`;
    if (wl.label) g += teks(b.U(wl.pusat?.[0] ?? 0.5), b.V(wl.pusat?.[1] ?? 0.5), wl.label, { anchor: "middle", size: 12, fill: wl.warna || C.cyan, weight: 700 });
  });
  (p.titik || []).forEach((t) => {
    g += `<circle cx="${b.U(t.u)}" cy="${b.V(t.v)}" r="5" fill="${t.warna || C.kuning}" stroke="${C.bg}" stroke-width="1.4"/>`;
    if (t.label) {
      const kanan = t.u > 0.72;
      g += teks(b.U(t.u) + (kanan ? -9 : 9), b.V(t.v) + 4, t.label, { size: 11.5, fill: t.warna || C.kuning, anchor: kanan ? "end" : "start" });
    }
  });
  g += labelSumbu(b, p.sumbuX || "", p.sumbuY || "");
  return { g, h };
}

function gNeuron(p) {
  const lapis = p.lapis || [3, 4, 1];
  const maksimal = Math.max(...lapis);
  const h = 60 + maksimal * 46 + (p.catat ? 24 : 0);
  let g = latar(h);
  const tengah = 34 + (maksimal * 46) / 2;
  const xs = lapis.map((_, i) => 92 + (i * (W - 184)) / (lapis.length - 1));
  const pos = lapis.map((nN, li) => {
    const ys = [];
    for (let i = 0; i < nN; i += 1) ys.push(tengah + (i - (nN - 1) / 2) * 46);
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
    if (t && xs[i] !== undefined) g += teks(xs[i], 20, t, { anchor: "middle", size: 11.5, fill: C.muted });
  });
  if (p.catat) g += teks(W / 2, h - 10, p.catat, { anchor: "middle", size: 12, fill: C.muted });
  return { g, h };
}

function gFuzzy(p) {
  const h = 240;
  const b = bidang(48, 34, 18, 34, h);
  let g = b.g;
  const label = p.label || ["Negatif", "Nol", "Positif"];
  const nL = label.length;
  const warna = [C.biru, C.hijau, C.oranye, C.violet, C.merah];
  label.forEach((t, i) => {
    const pusat = nL === 1 ? 0.5 : i / (nL - 1);
    const lebar = 1 / (nL - 1 || 1);
    const pts = [[Math.max(0, pusat - lebar), 0], [pusat, 1], [Math.min(1, pusat + lebar), 0]];
    g += jalurKurva(b, pts, warna[i % 5], { tebal: 2.2 });
    const xl = Math.min(Math.max(b.U(pusat), b.x0 + 30), b.x1 - 30);
    g += teks(xl, b.y0 - 8, t, { anchor: "middle", size: 11.5, fill: warna[i % 5], weight: 700, mono: true });
  });
  if (p.uContoh !== undefined) {
    g += garis(b.U(p.uContoh), b.y0, b.U(p.uContoh), b.y1, C.kuning, { putus: "4 4", tebal: 1.5 });
    // Label tumbuh ke KANAN garis di dekat sumbu bawah: kaki segitiga di
    // kanan garis contoh berada tinggi di atas pita teks, sehingga teks
    // tidak berpotongan dengan sisi keanggotaan mana pun.
    const kanan = p.uContoh > 0.72;
    g += teks(b.U(p.uContoh) + (kanan ? -7 : 7), b.y1 - 8, p.labelContoh || "Nilai terukur", { size: 11, fill: C.kuning, anchor: kanan ? "end" : "start" });
  }
  g += labelSumbu(b, p.sumbuX || "Nilai masukan", "Keanggotaan");
  return { g, h };
}

function gPopulasi(p) {
  const h = 252;
  const b = bidang(48, 34, 18, 34, h);
  let g = b.g;
  const acak = (s) => { let x = s; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; };
  const target = [0.76, 0.32];
  const genN = p.gen || 3;
  const warna = [C.muted, C.biru, C.cyan, C.hijau];
  for (let gi = 0; gi < genN; gi += 1) {
    const r = acak(7 + gi * 13);
    const sebar = 0.4 - (gi * 0.32) / Math.max(1, genN - 1);
    for (let i = 0; i < 14; i += 1) {
      const u = target[0] + (r() - 0.5) * 2 * sebar * (0.9 + 0.4 * r());
      const v = target[1] + (r() - 0.5) * 2 * sebar;
      if (u < 0.03 || u > 0.97 || v < 0.03 || v > 0.9) continue;
      g += `<circle cx="${b.U(u)}" cy="${b.V(v)}" r="${3 + gi}" fill="${warna[Math.min(gi + 1, 3)]}" fill-opacity="${0.45 + 0.5 * (gi / genN)}"/>`;
    }
  }
  g += `<path d="M${b.U(target[0]) - 8},${b.V(target[1])} L${b.U(target[0]) + 8},${b.V(target[1])} M${b.U(target[0])},${b.V(target[1]) - 8} L${b.U(target[0])},${b.V(target[1]) + 8}" stroke="${C.kuning}" stroke-width="2.6"/>`;
  g += teks(b.U(target[0]) - 12, b.V(target[1]) - 10, p.labelTarget || "Optimum", { size: 11.5, fill: C.kuning, anchor: "end", weight: 700 });
  g += barisLegenda(b.x0, b.y0 - 16, [["Generasi awal menyebar", C.muted], ["Generasi akhir mengumpul", C.hijau]]);
  g += labelSumbu(b, p.sumbuX || "Parameter 1", p.sumbuY || "Parameter 2");
  return { g, h };
}

function gPolezero(p) {
  const h = 206 + (p.catat ? 22 : 0);
  let g = latar(h);
  const cx = W * 0.58; const cy = 102;
  const sk = 32;
  g += `<rect x="0" y="${cy - 92}" width="${cx}" height="184" fill="${C.hijau}" fill-opacity="0.07"/>`;
  g += panah(30, cy, W - 26, cy, C.muted, { tebal: 1.3 });
  g += panah(cx, cy + 92, cx, cy - 92, C.muted, { tebal: 1.3 });
  g += teks(W - 28, cy + 16, "Re(s)", { size: 12, anchor: "end", mono: true, fill: C.teks });
  g += teks(cx + 8, cy - 80, "Im(s)", { size: 12, mono: true, fill: C.teks });
  g += teks(cx / 2, cy + 84, p.labelKiri || "Wilayah stabil", { anchor: "middle", size: 12, fill: C.hijau, weight: 700 });
  // Label titik tumbuh MENJAUHI sumbu imajiner supaya tidak menyeberanginya:
  // titik di kiri sumbu berlabel ke kiri, titik di kanan berlabel ke kanan.
  // Elemen keempat "bawah" menaruh label di bawah titik — dipakai saat dua
  // titik seaxis sama-sama berlabel supaya labelnya tidak saling menimpa.
  const labelTitik = (x, y, isi, warna, kiri, bawah) =>
    teks(x + (kiri ? -10 : 10), bawah ? y + 17 : y - 8, isi, { size: 11, fill: warna, anchor: kiri ? "end" : "start" });
  (p.pole || []).forEach((pt) => {
    const x = cx + pt[0] * sk; const y = cy - pt[1] * sk;
    g += `<path d="M${x - 6},${y - 6} L${x + 6},${y + 6} M${x - 6},${y + 6} L${x + 6},${y - 6}" stroke="${C.merah}" stroke-width="2.6"/>`;
    if (pt[2]) g += labelTitik(x, y, pt[2], C.merah, pt[0] < 0, pt[3] === "bawah");
  });
  (p.zero || []).forEach((pt) => {
    const x = cx + pt[0] * sk; const y = cy - pt[1] * sk;
    g += `<circle cx="${x}" cy="${y}" r="6" fill="none" stroke="${C.cyan}" stroke-width="2.4"/>`;
    if (pt[2]) g += labelTitik(x, y, pt[2], C.cyan, pt[0] < 0, pt[3] === "bawah");
  });
  g += barisLegenda(34, 16, [["× pole", C.merah], ["○ zero", C.cyan]]);
  if (p.catat) g += teks(W / 2, h - 10, p.catat, { anchor: "middle", size: 12, fill: C.muted });
  return { g, h };
}

function gTangga(p) {
  const batang = p.batang || [];
  const tinggi = 30;
  const h = 24 + batang.length * (tinggi + 13) + (p.catat ? 24 : 8);
  let g = latar(h);
  const x0 = 196; const x1 = W - 36;
  batang.forEach((bt, i) => {
    const y = 16 + i * (tinggi + 13);
    const w = Math.max(10, bt.nilai * (x1 - x0));
    g += teks(x0 - 10, y + tinggi / 2 + 4, bt.label, { anchor: "end", size: 12, fill: C.teks });
    g += `<rect x="${x0}" y="${y}" width="${w}" height="${tinggi}" rx="7" fill="${bt.warna || [C.cyan, C.violet, C.oranye, C.hijau, C.biru, C.kuning][i % 6]}" fill-opacity="0.82"/>`;
    if (bt.tanda) g += teks(x0 + w + 8, y + tinggi / 2 + 4, bt.tanda, { size: 11.5, fill: C.muted });
  });
  if (p.catat) g += teks(W / 2, h - 10, p.catat, { anchor: "middle", size: 12, fill: C.muted });
  return { g, h };
}

function gTimeline(p) {
  const h = 140 + (p.catat ? 22 : 0);
  let g = latar(h);
  const y = 64;
  // Jalur kanan selebar 92px dipesan untuk judul sumbu — titik kejadian tidak
  // pernah masuk ke sana, jadi label tidak mungkin bertabrakan.
  const xAkhir = W - 96;
  g += panah(34, y, xAkhir + 18, y, C.muted, { tebal: 1.6 });
  g += teks(xAkhir + 24, y + 4, p.sumbu || "Waktu", { size: 11.5, fill: C.teks });
  (p.titik || []).forEach((t, i) => {
    const x = 56 + t.u * (xAkhir - 104);
    const atas = i % 2 === 0;
    g += `<circle cx="${x}" cy="${y}" r="6" fill="${t.warna || C.cyan}" stroke="${C.bg}" stroke-width="1.6"/>`;
    // Batang pendek berhenti SEBELUM jalur teks: sub dekat sumbu, label di
    // luarnya — batang tidak pernah menembus keduanya.
    g += garis(x, y, x, atas ? y - 14 : y + 14, t.warna || C.cyan, { tebal: 1.2 });
    g += teks(x, atas ? y - 36 : y + 44, t.label, { anchor: "middle", size: 11.6, fill: C.teks, weight: 600 });
    if (t.sub) g += teks(x, atas ? y - 22 : y + 30, t.sub, { anchor: "middle", size: 10.6, fill: C.muted });
  });
  if (p.catat) g += teks(W / 2, h - 10, p.catat, { anchor: "middle", size: 12, fill: C.muted });
  return { g, h };
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
  const { g, h } = gambarFn(spec.p || {});
  const svg = `<svg viewBox="0 0 ${W} ${h}" role="img" aria-label="Gambar ${nomor} — ${esc(spec.judul)}" preserveAspectRatio="xMidYMid meet">${g}</svg>`;
  return `  <figure class="ilustrasi reveal">
    ${svg}
    <figcaption><strong>Gambar ${nomor}</strong> — ${esc(spec.judul)}. ${spec.caption}</figcaption>
  </figure>`;
}

export const CSS_ILUSTRASI = `
.ilustrasi{margin:18px 0 14px;padding:12px 14px 10px;background:#0a101f;border:1px solid #243653;border-radius:14px}
.ilustrasi svg{width:100%;height:auto;display:block;border-radius:8px}
.ilustrasi figcaption{margin-top:9px;font-size:15px;color:var(--muted);line-height:1.72}
.ilustrasi figcaption strong{color:var(--cyan)}
`;
