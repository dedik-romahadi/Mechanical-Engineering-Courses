// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 14 PEMODELAN CAD — Optimasi Desain untuk Efisiensi dan Lingkungan
// Kanvas: cvKaleng, cvBalokMassa, cvTabung, cvJejak (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// Layar lebar (W >= _TTL_SEMPIT) memakai tata letak berdampingan; ponsel memakai kanvas
// lebih tinggi dengan panel bertumpuk ke bawah dan teks yang dipecah agar tidak terpotong.
// ════════════════════════════════════════════════════════════
const _C14_EST = 210000, _C14_EAL = 70000;
const _C14_RHO_ST = 7.85e-6, _C14_RHO_AL = 2.70e-6;   // kg/mm³
const _C14_FST = 2.0, _C14_FAL = 12.0;                // kg CO₂ per kg
const _C14_SIZIN = 100;                               // MPa
const _C14_F10 = "10px 'JetBrains Mono',monospace";
function _cad14Teks(ctx, s, x, y, warna, font, align) { ctx.fillStyle = warna; ctx.font = font || "11px 'JetBrains Mono',monospace"; ctx.textAlign = align || 'left'; ctx.fillText(s, x, y); ctx.textAlign = 'left'; }
// Seperti _cad14Teks, tetapi dijaga muat selebar maxW (dikecilkan lalu dipecah per kata oleh
// _ttlTeks). Mengembalikan y baris berikutnya.
function _cad14Muat(ctx, s, x, y, maxW, warna, font, align, opsi) { ctx.fillStyle = warna; ctx.font = font || "11px 'JetBrains Mono',monospace"; ctx.textAlign = align || 'left'; const yy = _ttlTeks(ctx, s, x, y, maxW, opsi); ctx.textAlign = 'left'; return yy; }
// x untuk label rata tengah (font ctx saat ini) yang dijepit agar seluruh teks tetap di [tepi, W − tepi].
function _cad14Tengah(ctx, s, xc, W, tepi) { const w = ctx.measureText(s).width / 2; return Math.max(tepi + w, Math.min(W - tepi - w, xc)); }
// Batang ukur tegak: nilai v terhadap skala maks; garis batas (mis. rasio 1,0) opsional.
// lebarLabel (opsional, dipakai di ponsel): label di bawah batang dijaga muat selebar itu.
function _cad14Gauge(ctx, x, y0, w, h, v, maks, warna, label, batas, lebarLabel) {
  ctx.strokeStyle = 'rgba(148,163,184,.35)'; ctx.lineWidth = 1; ctx.strokeRect(x, y0 - h, w, h);
  const f = Math.max(0, Math.min(1, v / maks)); ctx.fillStyle = warna; ctx.globalAlpha = .55; ctx.fillRect(x, y0 - h * f, w, h * f); ctx.globalAlpha = 1;
  if (batas) { const yb = y0 - h * Math.min(1, batas / maks); _ttlGaris(ctx, x - 6, yb, x + w + 6, yb, '#ef4444', 1.2, [4, 3]); }
  if (lebarLabel) _cad14Muat(ctx, label, x + w / 2, y0 + 14, lebarLabel, 'rgba(226,232,240,.85)', _C14_F10, 'center');
  else _cad14Teks(ctx, label, x + w / 2, y0 + 14, 'rgba(226,232,240,.85)', _C14_F10, 'center');
}
// Spasi tak terputus: _ttlTeks hanya memecah baris di spasi biasa, jadi rumus dan pasangan nilai–satuan
// yang diikat tidak terbelah saat teks dipecah di ponsel (tampilannya sama persis dengan spasi biasa).
function _cad14Ikat(s) { return s.replace(/ /g, '\u00a0'); }
function _cad14Num(v, d) { return v.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d }); }
// Luas permukaan kaleng tertutup bervolume V0 (mm³) sebagai fungsi jari-jari r (mm).
function _cad14Kaleng(r, V0) { return 2 * Math.PI * r * r + 2 * V0 / r; }

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Kaleng tertutup: luas permukaan terhadap jari-jari pada volume tetap
// ════════════════════════════════════════════════════════════
let _klFrame = 0;
function toggleKaleng() { _ttlToggle('kaleng', 'btnKaleng', drawKaleng); }
window.toggleKaleng = toggleKaleng;
function drawKaleng() {
  const k = _ttlKanvas('cvKaleng', 420); if (!k) return; const { ctx, W, H } = k;
  const sempit = W < _TTL_SEMPIT;
  const Vml = _ttlNilai('sl_kl_V', 500), rM = _ttlNilai('sl_kl_r', 43);
  _ttlTulis('v_kl_V', Vml.toFixed(0)); _ttlTulis('v_kl_r', rM.toFixed(0));
  const V0 = Vml * 1000;                                   // mL → mm³
  const rOpt = Math.cbrt(V0 / (2 * Math.PI)), hOpt = 2 * rOpt, aOpt = 6 * Math.PI * rOpt * rOpt;
  const r = _ttlJalan('kaleng') ? rOpt * (1.05 + 0.55 * Math.sin(_klFrame / 60)) : rM;
  const h = V0 / (Math.PI * r * r), A = _cad14Kaleng(r, V0);
  const f10 = _C14_F10;
  const judul = 'Kaleng tertutup ' + _cad14Ikat('V₀ = ' + _cad14Num(V0, 0) + ' mm³') + ' (tetap)';
  const tAs = 'A* = ' + _cad14Num(aOpt, 0) + ' mm²', tA = 'A = ' + _cad14Num(A, 0) + ' mm² (+' + (100 * (A - aOpt) / aOpt).toFixed(1) + ' %)';
  // Tata letak. Layar lebar: kaleng kiri, kurva A(r) kanan. Ponsel: judul dan tiga keterangan kurva
  // di atas, kurva selebar kanvas, lalu kaleng di bawahnya.
  let sk, cx, yb, px0, px1, py0, py1, yAtas, xKanan;
  if (!sempit) {
    sk = Math.max(0.05, Math.min((W * 0.16) / (2 * rOpt * 1.7), (H - 90) / (hOpt * 2.2)));
    cx = W * 0.15; yb = H * 0.82; px0 = W * 0.36; px1 = W * 0.94; py0 = H * 0.82; py1 = H * 0.24;
    yAtas = 36; xKanan = px0 - 8;
  } else {
    let y = _cad14Muat(ctx, judul, 12, 18, W - 24, 'rgba(226,232,240,.92)');
    y = _cad14Muat(ctx, 'A(r) = 2πr² + 2V₀/r', 12, y + 2, W - 24, 'rgba(148,163,184,.9)', f10);
    y = _cad14Muat(ctx, tAs, 12, y, W - 24, '#00e09e', f10);
    y = _cad14Muat(ctx, tA, 12, y, W - 24, '#f59e0b', f10);
    px0 = 14; px1 = W - 14; py1 = y + 4; py0 = py1 + 100;
    cx = W * 0.3; yb = H - 46; yAtas = py0 + 44; xKanan = W - 8;
    sk = Math.max(0.05, Math.min((W * 0.40) / (2 * rOpt * 1.7), 44 / (rOpt * 1.7), (yb - yAtas) / (hOpt * 2.2)));
  }
  // Skala per bingkai dijepit: kaleng tinggi-ramping (r kecil) dan label r tetap di bawah judul/kurva,
  // kaleng pendek-lebar tidak keluar tepi kiri dan label r-nya tidak masuk ke area kurva, dan elips dasar
  // menyisakan ruang bagi dua label h di bawahnya (di ponsel jari-jari gambar paling besar 44 px).
  ctx.font = f10; const tR = 'r = ' + r.toFixed(1), wR = ctx.measureText(tR).width;
  const skF = Math.max(0.01, Math.min(sk, (cx - 6) / r, (xKanan - wR - 6 - cx) / r, (yb - yAtas) / (h + 0.28 * r), (H - 31.5 - yb) / (0.28 * r), sempit ? 44 / r : Infinity));
  const rr = r * skF, hh = h * skF;
  ctx.beginPath(); ctx.ellipse(cx, yb - hh, rr, rr * 0.28, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(34,211,238,.28)'; ctx.fill(); ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.8; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - rr, yb - hh); ctx.lineTo(cx - rr, yb); ctx.ellipse(cx, yb, rr, rr * 0.28, 0, Math.PI, 0, true); ctx.lineTo(cx + rr, yb - hh);
  ctx.fillStyle = 'rgba(34,211,238,.12)'; ctx.fill(); ctx.strokeStyle = '#22d3ee'; ctx.stroke();
  _ttlGaris(ctx, cx, yb - hh, cx + rr, yb - hh, '#f59e0b', 1.2);
  _cad14Teks(ctx, tR, cx + rr + 6, yb - hh - 4, '#f59e0b', f10);
  const yH = yb + Math.max(22, 0.28 * rr + 9.5);   // label h tepat di bawah elips dasar kaleng yang lebar
  _cad14Teks(ctx, 'h = ' + h.toFixed(1), cx, yH, '#f59e0b', f10, 'center');
  _cad14Teks(ctx, 'h/2r = ' + (h / (2 * r)).toFixed(2), cx, yH + 16, h / (2 * r) > 0.96 && h / (2 * r) < 1.04 ? '#00e09e' : 'rgba(148,163,184,.9)', f10, 'center');
  if (!sempit) _cad14Teks(ctx, judul, 12, 18, 'rgba(226,232,240,.92)');
  // kurva A(r) dengan minimum; rentang r diperlebar hanya bila r slider (jeda) di luar 0,45–1,9·r*,
  // supaya titiknya tetap di atas kurva dan di dalam grafik (rentang animasi 0,5–1,6·r* tidak berubah)
  const rMin = Math.min(rOpt * 0.45, r * 0.9), rMax = Math.max(rOpt * 1.9, r * 1.1), aMax = Math.max(_cad14Kaleng(rMin, V0), _cad14Kaleng(rMax, V0));
  const X = v => px0 + (v - rMin) / (rMax - rMin) * (px1 - px0);
  const Y = v => py0 - (v - aOpt * 0.9) / (aMax - aOpt * 0.9) * (py0 - py1);
  _ttlGaris(ctx, px0, py0, px1, py0, 'rgba(148,163,184,.6)', 1.2); _ttlGaris(ctx, px0, py0, px0, py1 - 10, 'rgba(148,163,184,.6)', 1.2);
  ctx.beginPath();
  for (let i = 0; i <= 80; i++) { const rv = rMin + (rMax - rMin) * i / 80; const xx = X(rv), yy = Y(_cad14Kaleng(rv, V0)); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
  ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2.4; ctx.stroke();
  _ttlGaris(ctx, X(rOpt), Y(aOpt), X(rOpt), py0, '#00e09e', 1, [5, 3]);
  ctx.beginPath(); ctx.arc(X(rOpt), Y(aOpt), 5, 0, Math.PI * 2); ctx.fillStyle = '#00e09e'; ctx.fill();
  const xr = X(Math.max(rMin, Math.min(rMax, r)));
  ctx.beginPath(); ctx.arc(xr, Y(A), 4.5, 0, Math.PI * 2); ctx.fillStyle = '#f59e0b'; ctx.fill();
  _ttlGaris(ctx, xr, Y(A), xr, py0, '#f59e0b', 1, [3, 3]);
  const tRo = 'r* = ' + rOpt.toFixed(2);
  ctx.font = f10; _cad14Teks(ctx, tRo, _cad14Tengah(ctx, tRo, X(rOpt), W, 6), py0 + 16, '#00e09e', f10, 'center');
  if (!sempit) {
    _cad14Teks(ctx, 'A(r) = 2πr² + 2V₀/r', px0 + 10, py1 - 14, 'rgba(148,163,184,.9)', f10);
    _cad14Teks(ctx, tAs, px1, py1 - 14, '#00e09e', f10, 'right');
    _cad14Teks(ctx, tA, px1, py1 + 4, '#f59e0b', f10, 'right');
  }
  _ttlTulis('kalengInfo', 'V₀ = ' + _cad14Num(V0, 0) + ' mm³ → r* = ' + rOpt.toFixed(3) + ' mm, h* = 2r* = ' + hOpt.toFixed(3) + ' mm, A* = ' + aOpt.toFixed(2) + ' mm²; pada r = ' + r.toFixed(2) + ' mm tinggi menjadi ' + h.toFixed(2) + ' mm dan luasnya ' + A.toFixed(2) + ' mm² (' + (100 * (A - aOpt) / aOpt).toFixed(2) + ' % di atas minimum)');
  if (_ttlJalan('kaleng')) { _klFrame++; requestAnimationFrame(drawKaleng); }
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Sapuan tebal pelat: dua kendala dan massa minimum
// ════════════════════════════════════════════════════════════
let _bmFrame = 0;
function toggleBalokMassa() { _ttlToggle('balokmassa', 'btnBalokMassa', drawBalokMassa); }
window.toggleBalokMassa = toggleBalokMassa;
function drawBalokMassa() {
  const k = _ttlKanvas('cvBalokMassa', 380); if (!k) return; const { ctx, W, H } = k;
  const sempit = W < _TTL_SEMPIT;
  const F = _ttlNilai('sl_bm_F', 3000), L = _ttlNilai('sl_bm_L', 500), dIz = Math.max(0.1, _ttlNilai('sl_bm_d', 1));
  _ttlTulis('v_bm_F', F.toFixed(0)); _ttlTulis('v_bm_L', L.toFixed(0)); _ttlTulis('v_bm_d', _cad14Num(dIz, 1));
  const b = 60;
  const tS = Math.sqrt(6 * F * L / (b * _C14_SIZIN)), tD = Math.cbrt(4 * F * L * L * L / (_C14_EST * b * dIz));
  const tReq = Math.max(tS, tD);
  const t = _ttlJalan('balokmassa') ? tReq * (1.0 + 0.42 * Math.sin(_bmFrame / 55)) : tReq;
  const sg = 6 * F * L / (b * t * t), dl = 4 * F * L * L * L / (_C14_EST * b * t * t * t), ms = _C14_RHO_ST * b * L * t;
  const layak = sg <= _C14_SIZIN && dl <= dIz;
  const f10 = _C14_F10;
  const judul = 'Pelat kantilever baja ' + _cad14Ikat('b = ' + b + ' mm;') + ' sapuan tebal t terhadap dua kendala';
  const baris = [['t_σ = ' + tS.toFixed(2) + '  t_δ = ' + tD.toFixed(2) + ' mm', 'rgba(148,163,184,.95)', f10],
                 ['t_req = maks = ' + tReq.toFixed(3) + ' mm', '#00e09e'],
                 ['kendala aktif: ' + (tD >= tS ? 'defleksi' : 'tegangan'), '#ec4899', f10]];
  // Label t di kanan ujung pelat: sisakan ruang selebar label terlebar selama sapuan (t ≤ 1,42·t_req).
  ctx.font = f10; const wT = ctx.measureText('t = ' + (tReq * 1.42).toFixed(2) + ' mm').width;
  let x0, cy, sk, gx, gy, gh, gd, gw, lebarLabel;
  if (!sempit) {
    x0 = W * 0.09; cy = H * 0.50; gx = W * 0.64; gy = H * 0.80; gh = H * 0.46; gd = 66; gw = 34;
    // di tablet pelat dipendekkan agar label t tidak menimpa batang ukur; desktop tetap W·0,44
    sk = Math.max(0.03, Math.min((W * 0.44) / L, (gx - x0 - wT - 16) / L, (H * 0.30) / Math.max(tReq * 1.6, 20)));
    _cad14Teks(ctx, judul, 12, 18, 'rgba(226,232,240,.92)');
    baris.forEach(([s, w, f], i) => _cad14Teks(ctx, s, W * 0.64, H * 0.15 + 18 * i, w, f));
  } else {
    // Ponsel: judul, pelat selebar kanvas, tiga baris angka, lalu tiga batang ukur berjajar.
    let y = _cad14Muat(ctx, judul, 12, 18, W - 24, 'rgba(226,232,240,.92)');
    x0 = 22;
    sk = Math.max(0.03, Math.min((W - x0 - wT - 20) / L, 34 / Math.max(tReq * 1.6, 20)));
    cy = y + 66;
    y = cy + 64;
    baris.forEach(([s, w, f]) => { y = _cad14Muat(ctx, s, 12, y, W - 24, w, f) + 4; });
    gd = (W - 24) / 3; gw = Math.min(34, gd - 22); gx = 12 + (gd - gw) / 2; gy = H - 22; gh = gy - (y - 8); lebarLabel = gd - 4;
  }
  // pelat kantilever dilihat dari samping, tebal t
  const x1 = x0 + L * sk, th = t * sk;
  for (let i = 0; i <= 6; i++) { _ttlGaris(ctx, x0, cy - th / 2 - 10 + i * (th + 20) / 6, x0 - 8, cy - th / 2 - 2 + i * (th + 20) / 6, '#94a3b8', 1); }
  _ttlGaris(ctx, x0, cy - th / 2 - 12, x0, cy + th / 2 + 12, '#94a3b8', 1.6);
  ctx.fillStyle = layak ? 'rgba(0,224,158,.16)' : 'rgba(239,68,68,.16)'; ctx.strokeStyle = layak ? '#00e09e' : '#ef4444'; ctx.lineWidth = 2;
  ctx.fillRect(x0, cy - th / 2, x1 - x0, th); ctx.strokeRect(x0, cy - th / 2, x1 - x0, th);
  _ttlGaris(ctx, x1 - 6, cy - th / 2 - 34, x1 - 6, cy - th / 2 - 6, '#f59e0b', 1.8);
  ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.moveTo(x1 - 6, cy - th / 2 - 2); ctx.lineTo(x1 - 11, cy - th / 2 - 11); ctx.lineTo(x1 - 1, cy - th / 2 - 11); ctx.fill();
  _cad14Teks(ctx, 'F = ' + F.toFixed(0) + ' N', x1 - 2, cy - th / 2 - 40, '#f59e0b', f10, 'right');
  _cad14Teks(ctx, 'L = ' + L.toFixed(0) + ' mm', (x0 + x1) / 2, cy + th / 2 + 26, 'rgba(148,163,184,.9)', f10, 'center');
  _cad14Teks(ctx, 't = ' + t.toFixed(2) + ' mm', x1 + 8, cy + 4, layak ? '#00e09e' : '#ef4444', f10);
  // dua rasio kendala + massa
  _cad14Gauge(ctx, gx, gy, gw, gh, sg / _C14_SIZIN, 2.4, sg <= _C14_SIZIN ? '#00e09e' : '#ef4444', 'σ/σ_izin', 1, lebarLabel);
  _cad14Gauge(ctx, gx + gd, gy, gw, gh, dl / dIz, 2.4, dl <= dIz ? '#00e09e' : '#ef4444', 'δ/δ_izin', 1, lebarLabel);
  _cad14Gauge(ctx, gx + 2 * gd, gy, gw, gh, ms, _C14_RHO_ST * b * L * tReq * 1.6, '#22d3ee', 'massa', undefined, lebarLabel);
  _ttlTulis('balokMassaInfo', 'F = ' + F.toFixed(0) + ' N, L = ' + L.toFixed(0) + ' mm, δ_izin = ' + dIz.toFixed(1) + ' mm → t_σ = ' + tS.toFixed(3) + ' mm dan t_δ = ' + tD.toFixed(3) + ' mm, sehingga t_req = ' + tReq.toFixed(3) + ' mm (kendala ' + (tD >= tS ? 'defleksi' : 'tegangan') + ' aktif); pada t = ' + t.toFixed(2) + ' mm: σ = ' + sg.toFixed(1) + ' MPa, δ = ' + dl.toFixed(3) + ' mm, massa = ' + ms.toFixed(3) + ' kg (' + (layak ? 'layak' : 'belum layak') + ')');
  if (_ttlJalan('balokmassa')) { _bmFrame++; requestAnimationFrame(drawBalokMassa); }
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Tabung berongga menggantikan poros pejal dengan momen inersia sama
// ════════════════════════════════════════════════════════════
let _tbFrame = 0;
function toggleTabung() { _ttlToggle('tabung', 'btnTabung', drawTabung); }
window.toggleTabung = toggleTabung;
function drawTabung() {
  const k = _ttlKanvas('cvTabung', 400); if (!k) return; const { ctx, W, H } = k;
  const sempit = W < _TTL_SEMPIT;
  const ds = _ttlNilai('sl_tb_ds', 50), kM = Math.min(0.9, _ttlNilai('sl_tb_k', 0.75));
  _ttlTulis('v_tb_ds', ds.toFixed(0)); _ttlTulis('v_tb_k', _cad14Num(kM, 2));
  const kNow = _ttlJalan('tabung') ? kM * (0.5 + 0.5 * Math.sin(_tbFrame / 55 - Math.PI / 2)) : kM;
  const dO = ds / Math.pow(1 - Math.pow(kNow, 4), 0.25), dI = kNow * dO;
  const aPejal = Math.PI * ds * ds / 4, aTab = Math.PI * (dO * dO - dI * dI) / 4;
  const iP = Math.PI * Math.pow(ds, 4) / 64, iT = Math.PI * (Math.pow(dO, 4) - Math.pow(dI, 4)) / 64;
  const f10 = _C14_F10;
  const judul = 'Kekakuan sama ' + _cad14Ikat('(I tetap):') + ' ' + _cad14Ikat('d_o = d_s/(1 − k⁴)^(1/4)');
  const lPejal = 'poros pejal ⌀' + ds.toFixed(0), lTabung = 'tabung ⌀' + dO.toFixed(2) + ' / ⌀' + dI.toFixed(2);
  const baris = [['k = d_i/d_o = ' + kNow.toFixed(3), '#22d3ee'], [_cad14Ikat('I pejal ' + _cad14Num(iP, 0) + ' ≈') + ' ' + _cad14Ikat('I tabung ' + _cad14Num(iT, 0)), 'rgba(148,163,184,.9)', f10],
                 ['volume ' + (100 * aTab / aPejal).toFixed(1) + ' % → hemat ' + (100 * (1 - aTab / aPejal)).toFixed(1) + ' %', '#00e09e']];
  let sk, cy, cx1, cx2, yL1, yL2, gx, gy, gh, gd, y;
  if (!sempit) {
    sk = Math.max(0.05, Math.min((W * 0.17) / (ds * 1.35), (H - 96) / (ds * 1.35)));
    cy = H * 0.50; cx1 = W * 0.16; cx2 = W * 0.44; yL1 = cy + ds / 2 * sk + 22; yL2 = cy + dO / 2 * sk + 22;
    _cad14Teks(ctx, judul, 12, 18, 'rgba(226,232,240,.92)');
    gx = W * 0.66; gy = H * 0.80; gd = 72;
    // kolom kanan: baris yang terlalu panjang (tablet, d_s besar) dikecilkan atau dipecah; batang ukur
    // lalu dimulai di bawah baris terakhir (desktop tetap H·0,48)
    y = H * 0.15;
    baris.forEach(([s, w, f]) => { y = _cad14Muat(ctx, s, gx, y, W - gx - 8, w, f, 'left', { lh: 12 }) + 6; });
    gh = Math.min(H * 0.48, gy - (y - 8));
  } else {
    // Ponsel: dua lingkaran berdampingan (skala dari tabung terbesar, k = 0,9), label bertingkat,
    // tiga baris angka, lalu dua batang ukur.
    y = _cad14Muat(ctx, judul, 12, 18, W - 24, 'rgba(226,232,240,.92)');
    const dMaks = ds / Math.pow(1 - Math.pow(0.9, 4), 0.25);
    sk = Math.max(0.05, Math.min((W * 0.40) / dMaks, 110 / dMaks));
    const R = dMaks / 2 * sk;
    cx1 = W * 0.27; cx2 = W * 0.72; cy = y + 4 + R;
    yL1 = cy + R + 16; yL2 = yL1 + 14;
    y = yL2 + 22;
    baris.forEach(([s, w, f]) => { y = _cad14Muat(ctx, s, 12, y, W - 24, w, f, 'left', { lh: 12 }) + 6; });
    gd = W * 0.34; gx = W / 3 - 18; gy = H - 22; gh = gy - (y - 8);
  }
  ctx.beginPath(); ctx.arc(cx1, cy, ds / 2 * sk, 0, Math.PI * 2); ctx.fillStyle = 'rgba(148,163,184,.30)'; ctx.fill(); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx2, cy, dO / 2 * sk, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,224,158,.28)'; ctx.fill(); ctx.strokeStyle = '#00e09e'; ctx.lineWidth = 2; ctx.stroke();
  if (dI > 0.5) { ctx.beginPath(); ctx.arc(cx2, cy, dI / 2 * sk, 0, Math.PI * 2); ctx.fillStyle = '#020812'; ctx.fill(); ctx.strokeStyle = '#00e09e'; ctx.lineWidth = 1.6; ctx.stroke(); }
  ctx.font = f10; _cad14Teks(ctx, lPejal, sempit ? _cad14Tengah(ctx, lPejal, cx1, W, 6) : cx1, yL1, '#94a3b8', f10, 'center');
  ctx.font = f10; _cad14Teks(ctx, lTabung, sempit ? _cad14Tengah(ctx, lTabung, cx2, W, 6) : cx2, yL2, '#00e09e', f10, 'center');
  _cad14Gauge(ctx, gx, gy, 36, gh, aPejal, aPejal * 1.1, '#94a3b8', 'A pejal');
  _cad14Gauge(ctx, gx + gd, gy, 36, gh, aTab, aPejal * 1.1, '#00e09e', 'A tabung');
  _ttlTulis('tabungInfo', 'Poros pejal ⌀' + ds.toFixed(0) + ' mm diganti tabung dengan k = ' + kNow.toFixed(3) + ': d_o = ' + dO.toFixed(3) + ' mm, d_i = ' + dI.toFixed(3) + ' mm; momen inersia tetap ' + iT.toFixed(0) + ' mm⁴ sementara luas penampang turun dari ' + aPejal.toFixed(0) + ' ke ' + aTab.toFixed(0) + ' mm² (hemat bahan ' + (100 * (1 - aTab / aPejal)).toFixed(1) + ' %)');
  if (_ttlJalan('tabung')) { _tbFrame++; requestAnimationFrame(drawTabung); }
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Jejak CO₂ dua material terhadap beban pada kekakuan sama
// ════════════════════════════════════════════════════════════
let _jjFrame = 0;
function toggleJejak() { _ttlToggle('jejak', 'btnJejak', drawJejak); }
window.toggleJejak = toggleJejak;
function drawJejak() {
  const k = _ttlKanvas('cvJejak', 400); if (!k) return; const { ctx, W, H } = k;
  const sempit = W < _TTL_SEMPIT;
  const FM = _ttlNilai('sl_jj_F', 4000), L = _ttlNilai('sl_jj_L', 700), b = _ttlNilai('sl_jj_b', 100);
  _ttlTulis('v_jj_F', FM.toFixed(0)); _ttlTulis('v_jj_L', L.toFixed(0)); _ttlTulis('v_jj_b', b.toFixed(0));
  const F = _ttlJalan('jejak') ? FM * (0.55 + 0.45 * Math.sin(_jjFrame / 60)) : FM;
  const dIz = 1.5;
  const hS = Math.cbrt(4 * F * L * L * L / (_C14_EST * b * dIz)), hA = Math.cbrt(4 * F * L * L * L / (_C14_EAL * b * dIz));
  const mS = _C14_RHO_ST * b * L * hS, mA = _C14_RHO_AL * b * L * hA;
  const cS = _C14_FST * mS, cA = _C14_FAL * mA;
  const f10 = _C14_F10;
  const judul = 'Kekakuan sama: ' + ['h ∝ E^(−1/3) ·', 'massa ∝ ρ·h ·', 'CO₂ = f·massa'].map(_cad14Ikat).join(' ');
  const tParam = ['F = ' + F.toFixed(0) + ' N ·', 'L = ' + L.toFixed(0) + ' ·', 'b = ' + b.toFixed(0) + ' ·', 'δ_izin 1,5 mm'].map(_cad14Ikat).join(' ');
  const tHS = 'baja h = ' + hS.toFixed(1), tHA = 'alu h = ' + hA.toFixed(1);
  const baris = [['massa (kg): ' + mS.toFixed(2) + ' vs ' + mA.toFixed(2), '#22d3ee'], ['CO₂ (kg): ' + cS.toFixed(1) + ' vs ' + cA.toFixed(1), '#ef4444'],
                 [['aluminium', (mA / mS).toFixed(2) + '× massa,', 'tetapi', (cA / cS).toFixed(2) + '× jejak'].map(_cad14Ikat).join(' '), 'rgba(148,163,184,.9)']];
  const mMax = Math.max(mS, mA) * 1.15, cMax = Math.max(cS, cA) * 1.15;
  const batang = [[mS, mMax, '#94a3b8', 'm baja'], [mA, mMax, '#22d3ee', 'm alu'], [cS, cMax, '#00e09e', 'CO₂ baja'], [cA, cMax, '#ef4444', 'CO₂ alu']];
  if (!sempit) {
    // kiri: dua penampang b × h dengan tinggi sebenarnya
    const sk = Math.max(0.04, Math.min((W * 0.12) / b, (H * 0.42) / Math.max(hA, 10)));
    const yb = H * 0.74, x1 = W * 0.08, x2 = W * 0.26;
    _ttlGaris(ctx, x1 - 10, yb, x2 + b * sk + 10, yb, 'rgba(148,163,184,.6)', 1.2);
    ctx.fillStyle = 'rgba(148,163,184,.24)'; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.8;
    ctx.fillRect(x1, yb - hS * sk, b * sk, hS * sk); ctx.strokeRect(x1, yb - hS * sk, b * sk, hS * sk);
    ctx.fillStyle = 'rgba(34,211,238,.20)'; ctx.strokeStyle = '#22d3ee';
    ctx.fillRect(x2, yb - hA * sk, b * sk, hA * sk); ctx.strokeRect(x2, yb - hA * sk, b * sk, hA * sk);
    _cad14Teks(ctx, tHS, x1 + b * sk / 2, yb + 18, '#94a3b8', f10, 'center');
    _cad14Teks(ctx, tHA, x2 + b * sk / 2, yb + 34, '#22d3ee', f10, 'center');
    _cad14Teks(ctx, judul, 12, 18, 'rgba(226,232,240,.92)');
    _cad14Teks(ctx, tParam, 12, H - 10, 'rgba(148,163,184,.85)', f10);
    // kanan: dua pasang batang — massa dan jejak CO₂
    const gy = H * 0.76, gh = H * 0.46;
    const gx1 = W * 0.46, gx2 = W * 0.74;
    batang.forEach(([v, maks, w, lab], i) => _cad14Gauge(ctx, (i < 2 ? gx1 : gx2) + (i % 2) * 60, gy, 32, gh, v, maks, w, lab));
    baris.forEach(([s, w], i) => _cad14Teks(ctx, s, gx1, H * 0.15 + 18 * i, w, f10));
  } else {
    // Ponsel: judul, dua penampang berdampingan (label bertingkat), baris parameter dan angka,
    // lalu keempat batang ukur berjajar di bawah.
    let y = _cad14Muat(ctx, judul, 12, 18, W - 24, 'rgba(226,232,240,.92)');
    const hPx = 70, sk = Math.max(0.04, Math.min((W * 0.30) / b, hPx / Math.max(hA, 10)));
    const yb = y + 6 + hPx, x1 = W * 0.12, x2 = W * 0.56, wb = b * sk;
    _ttlGaris(ctx, x1 - 10, yb, x2 + wb + 10, yb, 'rgba(148,163,184,.6)', 1.2);
    ctx.fillStyle = 'rgba(148,163,184,.24)'; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.8;
    ctx.fillRect(x1, yb - hS * sk, wb, hS * sk); ctx.strokeRect(x1, yb - hS * sk, wb, hS * sk);
    ctx.fillStyle = 'rgba(34,211,238,.20)'; ctx.strokeStyle = '#22d3ee';
    ctx.fillRect(x2, yb - hA * sk, wb, hA * sk); ctx.strokeRect(x2, yb - hA * sk, wb, hA * sk);
    ctx.font = f10; _cad14Teks(ctx, tHS, _cad14Tengah(ctx, tHS, x1 + wb / 2, W, 6), yb + 16, '#94a3b8', f10, 'center');
    ctx.font = f10; _cad14Teks(ctx, tHA, _cad14Tengah(ctx, tHA, x2 + wb / 2, W, 6), yb + 30, '#22d3ee', f10, 'center');
    y = _cad14Muat(ctx, tParam, 12, yb + 50, W - 24, 'rgba(148,163,184,.85)', f10, 'left', { lh: 12 }) + 8;
    baris.forEach(([s, w]) => { y = _cad14Muat(ctx, s, 12, y, W - 24, w, f10, 'left', { lh: 12 }) + 6; });
    const gy = H - 22, gh = gy - (y - 8), gd = (W - 16) / 4, gw = Math.min(32, gd - 16);
    batang.forEach(([v, maks, w, lab], i) => _cad14Gauge(ctx, 8 + gd * (i + 0.5) - gw / 2, gy, gw, gh, v, maks, w, lab, undefined, gd - 4));
  }
  _ttlTulis('jejakInfo', 'F = ' + F.toFixed(0) + ' N, L = ' + L.toFixed(0) + ' mm, b = ' + b.toFixed(0) + ' mm, δ_izin = 1,5 mm → h baja ' + hS.toFixed(2) + ' mm dan h aluminium ' + hA.toFixed(2) + ' mm; massa ' + mS.toFixed(2) + ' kg vs ' + mA.toFixed(2) + ' kg, tetapi jejak CO₂ bahan ' + cS.toFixed(2) + ' kg vs ' + cA.toFixed(2) + ' kg — baja ' + (cA / cS).toFixed(2) + '× lebih rendah untuk kekakuan yang sama');
  if (_ttlJalan('jejak')) { _jjFrame++; requestAnimationFrame(drawJejak); }
}

_TTL_DAFTAR.push(['cvKaleng', () => drawKaleng(), 'kaleng', ['sl_kl_V', 'sl_kl_r']]);
_TTL_DAFTAR.push(['cvBalokMassa', () => drawBalokMassa(), 'balokmassa', ['sl_bm_F', 'sl_bm_L', 'sl_bm_d']]);
_TTL_DAFTAR.push(['cvTabung', () => drawTabung(), 'tabung', ['sl_tb_ds', 'sl_tb_k']]);
_TTL_DAFTAR.push(['cvJejak', () => drawJejak(), 'jejak', ['sl_jj_F', 'sl_jj_L', 'sl_jj_b']]);
_ttlMulai();
