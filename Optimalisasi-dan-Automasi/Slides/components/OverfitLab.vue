<!--
  OverfitLab.vue — Lab interaktif Overfitting vs Underfitting (bias-variance).
  Geser "Kompleksitas Model" (derajat polinom) → kurva fit kiri berubah, dan
  panel kanan menggambar train error (turun) vs test error (kurva-U). Tombol
  preset Underfit/Pas/Overfit + slider noise + toggle data uji.
  100% self-contained: hanya import dari 'vue'. Numerik: regresi polinom
  least-squares (x ternormalisasi [-1,1] + ridge + Gauss partial-pivoting),
  kurva-U di-cache (refit penuh hanya saat noise berubah).
-->
<template>
  <div class="ol">
    <div class="ol-head">
      <div class="ol-legend">
        <span class="ol-lg"><i class="ol-dot train"></i>Data Latih</span>
        <span class="ol-lg"><i class="ol-dot test"></i>Data Uji</span>
        <span class="ol-lg"><i class="ol-dash"></i>Pola Asli</span>
      </div>
      <div class="ol-readout">
        <span>Latih <b class="c-train">{{ fmt(curTrain) }}</b></span>
        <span class="ol-sep">·</span>
        <span>Uji <b class="c-test">{{ fmt(curTest) }}</b></span>
        <span class="ol-sep">·</span>
        <span>derajat <b class="c-deg">{{ deg }}</b></span>
        <span class="ol-badge" :class="status.key">{{ status.label }}</span>
      </div>
    </div>

    <div class="ol-grid">
      <div class="ol-panel">
        <div class="ol-cap">📈 Fit Model</div>
        <canvas ref="cvFit" class="ol-canvas"></canvas>
      </div>
      <div class="ol-panel">
        <div class="ol-cap">📉 Train vs Test Error</div>
        <canvas ref="cvCurve" class="ol-canvas"></canvas>
      </div>
    </div>

    <div class="ol-controls">
      <label class="ol-ctrl">
        <span class="ol-clbl">Kompleksitas Model</span>
        <input type="range" min="1" max="12" step="1" v-model.number="deg" @input="onDegInput" />
        <span class="ol-cval">{{ deg }}</span>
      </label>
      <label class="ol-ctrl">
        <span class="ol-clbl">Noise σ</span>
        <input type="range" min="0.06" max="0.20" step="0.01" v-model.number="sigma" @input="onNoiseInput" />
        <span class="ol-cval">{{ sigma.toFixed(2) }}</span>
      </label>
      <label class="ol-check">
        <input type="checkbox" v-model="showTest" @change="drawFit" />
        <span>Data Uji</span>
      </label>
      <div class="ol-presets">
        <button type="button" @click="preset(1)">Underfit</button>
        <button type="button" @click="preset(mStar)">Pas</button>
        <button type="button" @click="preset(11)">Overfit</button>
      </div>
    </div>

    <div class="ol-cards">
      <div class="ol-card a" :class="{ on: status.key === 'under' }">
        <b>📘 Underfit</b><span>Model kaku — pola lolos; latih &amp; uji sama-sama buruk.</span>
      </div>
      <div class="ol-card e" :class="{ on: status.key === 'good' }">
        <b>📗 Pas (Good Fit)</b><span>Tangkap pola, abaikan noise. Latih ≈ uji, dua-duanya baik.</span>
      </div>
      <div class="ol-card c" :class="{ on: status.key === 'over' }">
        <b>📕 Overfit</b><span>Hafal noise — latih nyaris sempurna, uji jeblok.</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

/* ---- Konstanta (dikunci agar deterministik & pedagogis benar) ---- */
const DEG_MAX = 12
const N_TRAIN = 11
const N_HOLD = 30
const TEST_SHOW_IDX = [2, 7, 12, 17, 22, 27] // subset holdout yang digambar
const LAMBDA = 1e-7
const Y_LO = -0.15
const Y_HI = 1.15

const deg = ref(3)
const sigma = ref(0.13)
const showTest = ref(true)

const cvFit = ref(null)
const cvCurve = ref(null)

/* ---- Data (dibangun sekali di onMounted, stabil antar-render) ---- */
let trainX = [], trainZ = [], trainY = []
let holdX = [], holdZ = [], holdY = []

/* ---- Cache kurva-U (refit penuh hanya saat noise berubah) ---- */
const coeffsByDeg = ref([]) // index 1..DEG_MAX
const trainRmse = ref([])
const testRmse = ref([])

function fTrue(x) {
  return 0.5 + 0.42 * Math.sin(2 * Math.PI * 0.85 * x + 0.4)
}

/* RNG deterministik (mulberry32) + normal Box-Muller — pola FeatureScatter. */
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function makeGauss(rng) {
  return function () {
    let u = 0, v = 0
    while (u === 0) u = rng()
    while (v === 0) v = rng()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
}
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v }

function buildData() {
  const rng = mulberry32(11)
  const g = makeGauss(rng)
  trainX = []; trainZ = []
  for (let i = 0; i < N_TRAIN; i++) {
    const x = clamp((i + 0.5) / N_TRAIN + (rng() - 0.5) * 0.04, 0, 1)
    trainX.push(x); trainZ.push(g()) // simpan noise standar; y = fTrue + σ·z
  }
  holdX = []; holdZ = []
  for (let j = 0; j < N_HOLD; j++) {
    holdX.push((j + 0.5) / N_HOLD); holdZ.push(g())
  }
}

/* ---- Regresi polinom least-squares derajat d (stabil) ---- */
function fitPoly(d) {
  const n = d + 1
  const ATA = Array.from({ length: n }, () => new Array(n).fill(0))
  const ATy = new Array(n).fill(0)
  for (let p = 0; p < trainX.length; p++) {
    const xn = 2 * trainX[p] - 1 // normalisasi ke [-1,1] → well-conditioned
    const y = trainY[p]
    const pow = new Array(n)
    pow[0] = 1
    for (let k = 1; k < n; k++) pow[k] = pow[k - 1] * xn
    for (let r = 0; r < n; r++) {
      ATy[r] += pow[r] * y
      for (let c = 0; c < n; c++) ATA[r][c] += pow[r] * pow[c]
    }
  }
  for (let r = 0; r < n; r++) ATA[r][r] += LAMBDA // ridge Tikhonov
  return solveGauss(ATA, ATy)
}

/* Eliminasi Gauss dengan partial pivoting; null bila singular. */
function solveGauss(A0, b0) {
  const n = b0.length
  const A = A0.map((row, i) => row.concat(b0[i])) // augmented (n × n+1)
  for (let col = 0; col < n; col++) {
    let piv = col
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r
    }
    if (Math.abs(A[piv][col]) < 1e-14) return null
    if (piv !== col) { const t = A[piv]; A[piv] = A[col]; A[col] = t }
    const pv = A[col][col]
    for (let c = col; c <= n; c++) A[col][c] /= pv
    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const f = A[r][col]
      if (f === 0) continue
      for (let c = col; c <= n; c++) A[r][c] -= f * A[col][c]
    }
  }
  return A.map((row) => row[n])
}

function evalPoly(c, x) {
  const xn = 2 * x - 1
  let p = 1, s = 0
  for (let k = 0; k < c.length; k++) { s += c[k] * p; p *= xn }
  return s
}
function rmseOn(c, xs, ys) {
  if (!c || xs.length === 0) return NaN
  let s = 0
  for (let i = 0; i < xs.length; i++) { const e = evalPoly(c, xs[i]) - ys[i]; s += e * e }
  return Math.sqrt(s / xs.length)
}

/* Recompute y dari σ + refit seluruh derajat (cache). */
function recompute() {
  trainY = trainX.map((x, i) => fTrue(x) + sigma.value * trainZ[i])
  holdY = holdX.map((x, i) => fTrue(x) + sigma.value * holdZ[i])
  const cf = [null], tr = [NaN], te = [NaN] // index 0 placeholder
  let lastValid = null
  for (let d = 1; d <= DEG_MAX; d++) {
    let c = fitPoly(d)
    if (!c) c = lastValid; else lastValid = c
    cf[d] = c
    tr[d] = rmseOn(c, trainX, trainY)
    te[d] = rmseOn(c, holdX, holdY)
  }
  coeffsByDeg.value = cf
  trainRmse.value = tr
  testRmse.value = te
}

/* ---- Turunan reaktif ---- */
const mStar = computed(() => {
  const te = testRmse.value
  if (!te || te.length <= 1) return 3
  let best = 1, bv = Infinity
  for (let d = 1; d <= DEG_MAX; d++) {
    if (Number.isFinite(te[d]) && te[d] < bv) { bv = te[d]; best = d }
  }
  return best
})
const status = computed(() => {
  const m = mStar.value
  if (deg.value < m) return { key: 'under', label: 'UNDERFIT', color: '#fbbf24' }
  if (deg.value <= m + 1) return { key: 'good', label: 'PAS', color: '#34d399' }
  return { key: 'over', label: 'OVERFIT', color: '#fb7185' }
})
const curTrain = computed(() => trainRmse.value[deg.value])
const curTest = computed(() => testRmse.value[deg.value])
function fmt(v) {
  return (v === null || v === undefined || Number.isNaN(v)) ? '–' : v.toFixed(3)
}

/* Jaring pengaman reaktif: redraw tiap state berubah dari jalur mana pun. */
watch(deg, () => drawAll())
watch(sigma, () => { recompute(); drawAll() })

/* ---- Gambar panel KIRI: fit model ---- */
function drawFit() {
  const c = cvFit.value
  if (!c) return
  const dpr = window.devicePixelRatio || 1
  const w = c.clientWidth, h = c.clientHeight || 205
  if (!w) return
  c.width = Math.round(w * dpr); c.height = Math.round(h * dpr)
  const ctx = c.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  const padL = 30, padR = 12, padT = 10, padB = 24
  const left = padL, right = w - padR, top = padT, bottom = h - padB
  const plotW = right - left, plotH = bottom - top
  const sx = (x) => left + x * plotW
  const sy = (y) => top + (1 - (y - Y_LO) / (Y_HI - Y_LO)) * plotH
  const syc = (y) => clamp(sy(y), top, bottom)

  ctx.fillStyle = '#06091a'; ctx.fillRect(0, 0, w, h)

  // grid
  ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1
  for (let g = 0; g <= 1.0001; g += 0.25) {
    const px = sx(g); ctx.beginPath(); ctx.moveTo(px, top); ctx.lineTo(px, bottom); ctx.stroke()
    const py = sy(g); ctx.beginPath(); ctx.moveTo(left, py); ctx.lineTo(right, py); ctx.stroke()
  }

  // pola asli (putus-putus)
  ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.4
  ctx.beginPath()
  for (let i = 0; i <= 120; i++) { const x = i / 120; const px = sx(x), py = sy(fTrue(x)); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py) }
  ctx.stroke(); ctx.restore()

  const coef = coeffsByDeg.value[deg.value]
  const col = status.value.color

  // kurva fit (clip ke rect plot agar blow-up tidak bocor)
  ctx.save()
  ctx.beginPath(); ctx.rect(left, top, plotW, plotH); ctx.clip()
  if (coef) {
    // residual data uji
    if (showTest.value) {
      ctx.strokeStyle = 'rgba(251,113,133,.45)'; ctx.lineWidth = 1
      for (const idx of TEST_SHOW_IDX) {
        const x = holdX[idx]
        ctx.beginPath(); ctx.moveTo(sx(x), syc(holdY[idx])); ctx.lineTo(sx(x), syc(evalPoly(coef, x))); ctx.stroke()
      }
    }
    ctx.beginPath()
    for (let i = 0; i <= 240; i++) { const x = i / 240; const px = sx(x), py = sy(evalPoly(coef, x)); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py) }
    ctx.lineWidth = 2.5; ctx.strokeStyle = col
    ctx.shadowColor = col; ctx.shadowBlur = 6
    ctx.stroke(); ctx.shadowBlur = 0
  }
  ctx.restore()

  // titik latih
  for (let i = 0; i < trainX.length; i++) {
    ctx.beginPath(); ctx.arc(sx(trainX[i]), syc(trainY[i]), 3.6, 0, Math.PI * 2)
    ctx.fillStyle = '#38bdf8'; ctx.fill()
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(6,9,26,.85)'; ctx.stroke()
  }
  // titik uji (cincin)
  if (showTest.value) {
    for (const idx of TEST_SHOW_IDX) {
      ctx.beginPath(); ctx.arc(sx(holdX[idx]), syc(holdY[idx]), 4.2, 0, Math.PI * 2)
      ctx.lineWidth = 1.6; ctx.strokeStyle = '#fb7185'; ctx.stroke()
    }
  }

  // label sumbu
  ctx.fillStyle = '#94a3b8'; ctx.font = "10.5px 'Fira Code', ui-monospace, monospace"
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
  ctx.fillText('Fitur', (left + right) / 2, h - 5)
  ctx.save(); ctx.translate(10, (top + bottom) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('Target', 0, 0); ctx.restore()
}

/* ---- Gambar panel KANAN: kurva train/test error ---- */
function drawCurve() {
  const c = cvCurve.value
  if (!c) return
  const dpr = window.devicePixelRatio || 1
  const w = c.clientWidth, h = c.clientHeight || 205
  if (!w) return
  c.width = Math.round(w * dpr); c.height = Math.round(h * dpr)
  const ctx = c.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  const padL = 32, padR = 12, padT = 10, padB = 24
  const left = padL, right = w - padR, top = padT, bottom = h - padB
  const plotW = right - left, plotH = bottom - top
  const tr = trainRmse.value, te = testRmse.value

  ctx.fillStyle = '#06091a'; ctx.fillRect(0, 0, w, h)

  let ymax = 0
  for (let d = 1; d <= DEG_MAX; d++) {
    if (Number.isFinite(tr[d])) ymax = Math.max(ymax, tr[d])
    if (Number.isFinite(te[d])) ymax = Math.max(ymax, te[d])
  }
  ymax = ymax > 0 ? ymax * 1.08 : 1
  const sx = (d) => left + ((d - 1) / (DEG_MAX - 1)) * plotW
  const sy = (v) => bottom - clamp(v / ymax, 0, 1) * plotH

  // grid
  ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1
  for (let d = 1; d <= DEG_MAX; d++) { const px = sx(d); ctx.beginPath(); ctx.moveTo(px, top); ctx.lineTo(px, bottom); ctx.stroke() }

  // pita zona good-fit [mStar, mStar+1]
  const m = mStar.value
  const bx0 = sx(Math.max(1, m)), bx1 = sx(Math.min(DEG_MAX, m + 1))
  ctx.fillStyle = 'rgba(52,211,153,.10)'
  ctx.fillRect(Math.min(bx0, bx1) - 5, top, Math.abs(bx1 - bx0) + 10, plotH)

  // kurva
  function plot(arr, color, width) {
    ctx.beginPath()
    let started = false
    for (let d = 1; d <= DEG_MAX; d++) {
      if (!Number.isFinite(arr[d])) continue
      const px = sx(d), py = sy(arr[d])
      started ? ctx.lineTo(px, py) : ctx.moveTo(px, py); started = true
    }
    ctx.lineWidth = width; ctx.strokeStyle = color; ctx.stroke()
  }
  plot(tr, '#38bdf8', 2)
  plot(te, '#fb7185', 2.4)

  // sweet spot (cincin hijau di minimum test)
  if (Number.isFinite(te[m])) {
    ctx.beginPath(); ctx.arc(sx(m), sy(te[m]), 4.6, 0, Math.PI * 2)
    ctx.lineWidth = 2; ctx.strokeStyle = '#34d399'
    ctx.shadowColor = '#34d399'; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0
  }

  // penanda derajat aktif
  const ax = sx(deg.value)
  ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(ax, top); ctx.lineTo(ax, bottom); ctx.stroke(); ctx.restore()
  if (Number.isFinite(tr[deg.value])) { ctx.beginPath(); ctx.arc(ax, sy(tr[deg.value]), 3.3, 0, Math.PI * 2); ctx.fillStyle = '#38bdf8'; ctx.fill() }
  if (Number.isFinite(te[deg.value])) { ctx.beginPath(); ctx.arc(ax, sy(te[deg.value]), 3.3, 0, Math.PI * 2); ctx.fillStyle = '#fb7185'; ctx.fill() }

  // label
  ctx.font = "10.5px 'Fira Code', ui-monospace, monospace"; ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#64748b'
  ctx.textAlign = 'left'; ctx.fillText('underfit', left, h - 5)
  ctx.textAlign = 'right'; ctx.fillText('overfit', right, h - 5)
  ctx.textAlign = 'center'; ctx.fillStyle = '#94a3b8'; ctx.fillText('derajat', (left + right) / 2, h - 5)
  ctx.save(); ctx.translate(11, (top + bottom) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('RMSE', 0, 0); ctx.restore()
}

function drawAll() { drawFit(); drawCurve() }

/* ---- Handler (gambar via watch; handler hanya batalkan tween preset) ---- */
function onDegInput() { cancelTween() }
function onNoiseInput() { cancelTween() }

/* preset: tween derajat (bilangan bulat) dengan easeInOutCubic */
let rafId = null
function cancelTween() { if (rafId) { cancelAnimationFrame(rafId); rafId = null } }
function prefersReduced() {
  return typeof window !== 'undefined' && window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
function preset(target) {
  cancelTween()
  target = clamp(Math.round(target), 1, DEG_MAX)
  if (prefersReduced()) { deg.value = target; return }
  const start = deg.value
  if (start === target) return
  const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now())
  const dur = 360
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
  function step(now) {
    const t = clamp(((now || Date.now()) - t0) / dur, 0, 1)
    const v = clamp(Math.round(start + (target - start) * ease(t)), 1, DEG_MAX)
    if (v !== deg.value) deg.value = v
    if (t < 1) { rafId = requestAnimationFrame(step) }
    else { rafId = null; if (deg.value !== target) deg.value = target }
  }
  rafId = requestAnimationFrame(step)
}

/* ---- Lifecycle ---- */
let ro = null
onMounted(() => {
  buildData()
  recompute()
  nextTick(() => {
    drawAll()
    // Observe satu canvas; keduanya relayout bersamaan (flex-row) → cukup sekali.
    if (typeof ResizeObserver !== 'undefined' && cvFit.value) {
      ro = new ResizeObserver(() => drawAll())
      ro.observe(cvFit.value)
    }
  })
})
onBeforeUnmount(() => {
  cancelTween()
  if (ro) { ro.disconnect(); ro = null }
})
</script>

<style scoped>
.ol {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #0d1526;
  padding: 12px;
  color: #e2e8f0;
  font-family: 'Inter', ui-sans-serif, sans-serif;
  box-sizing: border-box;
  max-width: 944px;
  margin-left: 48px;
  margin-right: auto;
}

.ol-head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; margin-bottom: 8px; flex-wrap: wrap;
}
.ol-legend { display: flex; gap: 12px; font-size: 11px; color: #94a3b8; }
.ol-lg { display: inline-flex; align-items: center; gap: 5px; }
.ol-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.ol-dot.train { background: #38bdf8; }
.ol-dot.test { background: transparent; border: 1.5px solid #fb7185; }
.ol-dash { width: 13px; height: 0; border-top: 2px dashed #64748b; display: inline-block; }
.ol-readout {
  font-size: 12px; color: #94a3b8; font-family: 'Fira Code', ui-monospace, monospace;
  display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
}
.ol-readout b { font-weight: 700; }
.c-train { color: #38bdf8; }
.c-test { color: #fb7185; }
.c-deg { color: #a78bfa; }
.ol-sep { color: #475569; }
.ol-badge {
  margin-left: 4px; padding: 1px 9px; border-radius: 999px;
  font-size: 10px; font-weight: 800; letter-spacing: 0.04em;
}
.ol-badge.under { color: #fbbf24; background: rgba(251, 191, 36, 0.14); border: 1px solid rgba(251, 191, 36, 0.4); }
.ol-badge.good { color: #34d399; background: rgba(52, 211, 153, 0.14); border: 1px solid rgba(52, 211, 153, 0.4); }
.ol-badge.over { color: #fb7185; background: rgba(251, 113, 133, 0.14); border: 1px solid rgba(251, 113, 133, 0.4); }

.ol-grid { display: flex; gap: 12px; align-items: stretch; }
.ol-panel { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.ol-panel:first-child { flex: 0 0 56%; }
.ol-panel:last-child { flex: 1 1 44%; }
.ol-cap { font-size: 11.5px; font-weight: 700; color: #cbd5e1; letter-spacing: 0.02em; }
.ol-canvas {
  width: 100%; height: 250px; display: block;
  border-radius: 8px; background: #06091a; border: 1px solid rgba(255, 255, 255, 0.06);
}

.ol-controls { display: flex; align-items: center; gap: 14px; margin-top: 9px; flex-wrap: wrap; }
.ol-ctrl { display: flex; align-items: center; gap: 8px; flex: 1 1 220px; font-size: 11.5px; color: #94a3b8; }
.ol-clbl { flex: none; color: #c4b5fd; white-space: nowrap; }
.ol-cval { flex: none; width: 34px; text-align: right; color: #fbbf24; font-weight: 700; font-family: 'Fira Code', ui-monospace, monospace; }
.ol-ctrl input[type='range'] { flex: 1; accent-color: #a78bfa; height: 4px; cursor: pointer; }
.ol-check { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: #cbd5e1; cursor: pointer; white-space: nowrap; }
.ol-check input { accent-color: #38bdf8; cursor: pointer; }
.ol-presets { display: flex; gap: 6px; }
.ol-presets button {
  font-size: 11px; font-weight: 700; color: #cbd5e1; background: #06091a;
  border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 7px; padding: 4px 9px;
  cursor: pointer; font-family: inherit; transition: border-color 0.15s, color 0.15s;
}
.ol-presets button:hover { border-color: #a78bfa; color: #fff; }

.ol-cards { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 8px; }
.ol-card {
  border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 6px 9px;
  background: #06091a; display: flex; flex-direction: column; gap: 1px;
  opacity: 0.5; transition: opacity 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.ol-card b { font-size: 12.5px; color: #cbd5e1; }
.ol-card span { font-size: 11px; color: #94a3b8; line-height: 1.32; }
.ol-card.on { opacity: 1; animation: ol-pulse 2.2s ease-in-out infinite; }
.ol-card.a.on { border-color: rgba(251, 191, 36, 0.55); box-shadow: 0 0 14px rgba(251, 191, 36, 0.22); }
.ol-card.a.on b { color: #fbbf24; }
.ol-card.e.on { border-color: rgba(52, 211, 153, 0.55); box-shadow: 0 0 14px rgba(52, 211, 153, 0.22); }
.ol-card.e.on b { color: #34d399; }
.ol-card.c.on { border-color: rgba(251, 113, 133, 0.55); box-shadow: 0 0 14px rgba(251, 113, 133, 0.22); }
.ol-card.c.on b { color: #fb7185; }
@keyframes ol-pulse { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.13); } }

@media (prefers-reduced-motion: reduce) {
  .ol-card.on { animation: none; }
}
@media (max-width: 620px) {
  .ol-grid { flex-direction: column; }
  .ol-panel:first-child, .ol-panel:last-child { flex: 1 1 auto; }
}
</style>
