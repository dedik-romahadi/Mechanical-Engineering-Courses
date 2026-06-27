<!--
  FeatureScatter.vue — Scatter plot 2-fitur interaktif untuk klasifikasi
  kondisi bearing (Sehat vs Rusak) dari data getaran.
  Self-contained: hanya `vue`, tanpa library eksternal. Slidev v0.49 / Vue 3.

  Dua slider mengatur garis batas keputusan y = m*x + b.
  Sisi atas garis (RMS tinggi / Kurtosis tinggi) = "Rusak".
  Titik yang salah klasifikasi diberi cincin amber.
-->
<template>
  <div class="fs">
    <div class="fs-head">
      <div class="fs-legend">
        <span class="fs-chip"><span class="fs-dot sehat"></span>Sehat</span>
        <span class="fs-chip"><span class="fs-dot rusak"></span>Rusak</span>
      </div>
      <div class="fs-readout">
        Akurasi = <b class="acc">{{ accPct }}%</b>
        <span class="sep">·</span>
        <span class="ok">benar={{ pad(correct) }}</span>,
        <span class="no">salah={{ pad(wrong) }}</span>
      </div>
    </div>

    <canvas ref="cv" class="fs-canvas"></canvas>

    <div class="fs-controls">
      <label class="fs-ctrl">
        <span class="fs-ctrl-lbl">Posisi batas (b)</span>
        <input
          type="range"
          min="-2" max="11" step="0.05"
          v-model.number="b"
          @input="draw"
        />
        <span class="fs-ctrl-val">{{ b.toFixed(2) }}</span>
      </label>
      <label class="fs-ctrl">
        <span class="fs-ctrl-lbl">Kemiringan (m)</span>
        <input
          type="range"
          min="-1.2" max="1.2" step="0.01"
          v-model.number="m"
          @input="draw"
        />
        <span class="fs-ctrl-val">{{ m.toFixed(2) }}</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

/* ---- Slider state (garis batas y = m*x + b) ---- */
const b = ref(4.2)   // intercept
const m = ref(0.42)  // slope

/* ---- Readout state ---- */
const correct = ref(0)
const wrong = ref(0)
const accPct = ref('0')

const cv = ref(null)

/* ---- Deterministic seeded RNG (mulberry32) ---- */
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
// Box-Muller normal from a uniform RNG
function makeGauss(rng) {
  return function (mean, sd) {
    let u = 0, v = 0
    while (u === 0) u = rng()
    while (v === 0) v = rng()
    const n = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
    return mean + sd * n
  }
}

/* ---- Data domain ---- */
const X_MIN = 0, X_MAX = 12   // RMS (mm/s)
const Y_MIN = 2, Y_MAX = 9    // Kurtosis

// Points generated ONCE on mount and kept stable across redraws.
// Each point: { x, y, healthy }
let points = []

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v }

function generatePoints() {
  const rng = mulberry32(20260625) // fixed seed -> stable layout
  const g = makeGauss(rng)
  const pts = []

  // Sehat (healthy): low RMS (~2-4), low Kurtosis (~3)
  for (let i = 0; i < 40; i++) {
    pts.push({
      x: clamp(g(3.0, 0.9), X_MIN + 0.2, X_MAX - 0.2),
      y: clamp(g(3.1, 0.55), Y_MIN + 0.15, Y_MAX - 0.15),
      healthy: true,
    })
  }

  // Rusak (faulty): high RMS (~6-10), high Kurtosis (~5-8)
  for (let i = 0; i < 40; i++) {
    pts.push({
      x: clamp(g(7.8, 1.6), X_MIN + 0.2, X_MAX - 0.2),
      y: clamp(g(6.2, 1.05), Y_MIN + 0.15, Y_MAX - 0.15),
      healthy: false,
    })
  }

  // A few borderline points near the gap so the classifier isn't trivially perfect.
  const border = [
    { x: 4.6, y: 4.6, healthy: true },
    { x: 5.0, y: 4.2, healthy: true },
    { x: 4.2, y: 5.0, healthy: true },
    { x: 5.5, y: 4.9, healthy: false },
    { x: 5.1, y: 5.4, healthy: false },
    { x: 6.0, y: 4.5, healthy: false },
  ]
  for (const p of border) pts.push({ ...p })

  return pts
}

/* ---- Coordinate mapping (data -> pixels) ---- */
let geom = null
function computeGeom(w, h) {
  const padL = 46, padR = 14, padT = 12, padB = 30
  const plotW = w - padL - padR
  const plotH = h - padT - padB
  return {
    padL, padR, padT, padB, plotW, plotH, w, h,
    sx: (x) => padL + ((x - X_MIN) / (X_MAX - X_MIN)) * plotW,
    sy: (y) => padT + (1 - (y - Y_MIN) / (Y_MAX - Y_MIN)) * plotH,
  }
}

/* Decide side: "Rusak" side = above the line (boundary y vs point y).
   A point is predicted FAULTY when its Kurtosis exceeds the boundary
   line value at its RMS, i.e. py > m*px + b. */
function predictFaulty(p) {
  return p.y > (m.value * p.x + b.value)
}

/* ---- Draw ---- */
function draw() {
  const cvs = cv.value
  if (!cvs) return
  const ctx = cvs.getContext('2d')
  if (!ctx) return

  // Responsive sizing: pixel buffer matches CSS box (handle HiDPI).
  const cssW = cvs.clientWidth || 700
  const cssH = cvs.clientHeight || 230
  const dpr = window.devicePixelRatio || 1
  if (cvs.width !== Math.round(cssW * dpr) || cvs.height !== Math.round(cssH * dpr)) {
    cvs.width = Math.round(cssW * dpr)
    cvs.height = Math.round(cssH * dpr)
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cssW, cssH)

  const G = computeGeom(cssW, cssH)
  geom = G

  // Background
  ctx.fillStyle = '#06091a'
  ctx.fillRect(0, 0, cssW, cssH)

  const left = G.padL
  const right = cssW - G.padR
  const top = G.padT
  const bottom = cssH - G.padB

  // ---- Shade half-planes ----
  // Boundary line in pixel space at the two plot edges.
  const yAtLeft = m.value * X_MIN + b.value
  const yAtRight = m.value * X_MAX + b.value
  const pxL = { x: G.sx(X_MIN), y: G.sy(yAtLeft) }
  const pxR = { x: G.sx(X_MAX), y: G.sy(yAtRight) }

  // Clip to plot rect so shading never bleeds over axes.
  ctx.save()
  ctx.beginPath()
  ctx.rect(left, top, right - left, bottom - top)
  ctx.clip()

  // "Rusak" half-plane = ABOVE the line in data space (smaller pixel-y).
  ctx.fillStyle = 'rgba(251,113,133,.08)'
  ctx.beginPath()
  ctx.moveTo(pxL.x, pxL.y)
  ctx.lineTo(pxR.x, pxR.y)
  ctx.lineTo(right, top)
  ctx.lineTo(left, top)
  ctx.closePath()
  ctx.fill()

  // "Sehat" half-plane = BELOW the line.
  ctx.fillStyle = 'rgba(52,211,153,.08)'
  ctx.beginPath()
  ctx.moveTo(pxL.x, pxL.y)
  ctx.lineTo(pxR.x, pxR.y)
  ctx.lineTo(right, bottom)
  ctx.lineTo(left, bottom)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // ---- Grid ----
  ctx.strokeStyle = 'rgba(255,255,255,.06)'
  ctx.lineWidth = 1
  ctx.font = "10px 'Fira Code', ui-monospace, monospace"
  ctx.fillStyle = '#64748b'

  // Vertical grid + X ticks (RMS)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  for (let xv = 0; xv <= X_MAX; xv += 2) {
    const px = G.sx(xv)
    ctx.beginPath()
    ctx.moveTo(px, top)
    ctx.lineTo(px, bottom)
    ctx.stroke()
    ctx.fillText(String(xv), px, bottom + 5)
  }

  // Horizontal grid + Y ticks (Kurtosis)
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  for (let yv = Y_MIN; yv <= Y_MAX; yv += 1) {
    const py = G.sy(yv)
    ctx.beginPath()
    ctx.moveTo(left, py)
    ctx.lineTo(right, py)
    ctx.stroke()
    ctx.fillText(String(yv), left - 6, py)
  }

  // ---- Axes frame ----
  ctx.strokeStyle = 'rgba(255,255,255,.22)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(left, top)
  ctx.lineTo(left, bottom)
  ctx.lineTo(right, bottom)
  ctx.stroke()

  // Axis labels
  ctx.fillStyle = '#94a3b8'
  ctx.font = "11px 'Fira Code', ui-monospace, monospace"
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText('RMS (mm/s)', (left + right) / 2, cssH - 1)

  ctx.save()
  ctx.translate(11, (top + bottom) / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.textBaseline = 'top'
  ctx.fillText('Kurtosis', 0, 0)
  ctx.restore()

  // ---- Boundary line (violet, slight glow) ----
  ctx.save()
  ctx.beginPath()
  ctx.rect(left, top, right - left, bottom - top)
  ctx.clip()
  ctx.shadowColor = 'rgba(167,139,250,.7)'
  ctx.shadowBlur = 6
  ctx.strokeStyle = '#a78bfa'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(pxL.x, pxL.y)
  ctx.lineTo(pxR.x, pxR.y)
  ctx.stroke()
  ctx.restore()

  // ---- Points + classification ----
  let nCorrect = 0
  let nWrong = 0
  for (const p of points) {
    const px = G.sx(p.x)
    const py = G.sy(p.y)
    const predFaulty = predictFaulty(p)
    const isCorrect = predFaulty === !p.healthy
    if (isCorrect) nCorrect++; else nWrong++

    // Dot
    ctx.beginPath()
    ctx.arc(px, py, 3.6, 0, Math.PI * 2)
    ctx.fillStyle = p.healthy ? '#34d399' : '#fb7185'
    ctx.fill()
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(6,9,26,.85)'
    ctx.stroke()

    // Misclassified -> amber ring
    if (!isCorrect) {
      ctx.beginPath()
      ctx.arc(px, py, 6.2, 0, Math.PI * 2)
      ctx.lineWidth = 1.6
      ctx.strokeStyle = '#fbbf24'
      ctx.stroke()
    }
  }

  correct.value = nCorrect
  wrong.value = nWrong
  const total = nCorrect + nWrong
  accPct.value = total ? ((nCorrect / total) * 100).toFixed(1) : '0'
}

function pad(n) { return String(n).padStart(2, '0') }

/* Redraw if sliders change programmatically too. */
watch([m, b], draw)

let onResize = null
onMounted(() => {
  points = generatePoints()
  draw()
  onResize = () => draw()
  window.addEventListener('resize', onResize)
})
</script>

<style scoped>
.fs {
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,.08);
  background: #0d1526;
  padding: 10px;
  color: #f1f5f9;
  font-family: 'Fira Code', ui-monospace, monospace;
  max-width: 960px;
  margin-left: 36px;
  margin-right: auto;
}

.fs-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}
.fs-legend { display: flex; gap: 12px; font-size: 12px; }
.fs-chip { display: inline-flex; align-items: center; gap: 5px; color: #cbd5e1; }
.fs-dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
.fs-dot.sehat { background: #34d399; }
.fs-dot.rusak { background: #fb7185; }

.fs-readout { font-size: 12px; color: #94a3b8; letter-spacing: .2px; }
.fs-readout .acc { color: #38bdf8; font-weight: 700; }
.fs-readout .ok { color: #34d399; }
.fs-readout .no { color: #fb7185; }
.fs-readout .sep { margin: 0 6px; color: #475569; }

.fs-canvas {
  display: block;
  width: 100%;
  height: 340px;
  background: #06091a;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,.05);
}

.fs-controls {
  display: flex;
  gap: 16px;
  margin-top: 5px;
  flex-wrap: wrap;
}
.fs-ctrl {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 250px;
  font-size: 11px;
  color: #94a3b8;
}
.fs-ctrl-lbl { flex: none; width: 108px; color: #c4b5fd; }
.fs-ctrl-val {
  flex: none; width: 42px; text-align: right;
  color: #fbbf24; font-weight: 700;
}
.fs-ctrl input[type='range'] {
  flex: 1;
  accent-color: #a78bfa;
  height: 4px;
  cursor: pointer;
}
</style>
