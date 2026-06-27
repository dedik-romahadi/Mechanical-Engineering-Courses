<!--
  ThresholdMetrics.vue — Demo interaktif trade-off AMBANG BATAS (threshold)
  klasifikasi + Confusion Matrix untuk deteksi kerusakan dari getaran (RMS).
  Geser ambang batas → lihat TP/FP/FN/TN + Akurasi/Presisi/Recall/F1 berubah.
  100% self-contained (hanya import dari 'vue'), tanpa library eksternal.
-->
<template>
  <div class="tm">
    <div class="tm-grid">
      <!-- KIRI: kanvas distribusi -->
      <div class="tm-left">
        <canvas
          ref="cv"
          class="tm-canvas"
          @pointerdown="onCanvasPick"
          @pointermove="onCanvasDrag"
          @pointerup="dragging = false"
          @pointerleave="dragging = false"
        ></canvas>
        <div class="tm-slider">
          <label class="tm-slabel">
            Ambang batas (threshold RMS)
            <span class="tm-sval">{{ thr.toFixed(2) }} mm/s</span>
          </label>
          <input
            class="tm-range"
            type="range"
            :min="XMIN"
            :max="XMAX"
            step="0.05"
            v-model.number="thr"
          />
          <div class="tm-legend">
            <span class="tm-lg"><i class="dot ok"></i>Sehat</span>
            <span class="tm-lg"><i class="dot bad"></i>Rusak</span>
            <span class="tm-lg"><i class="dot thr"></i>Ambang</span>
          </div>
        </div>
      </div>

      <!-- KANAN: confusion matrix + metrik -->
      <div class="tm-right">
        <div class="tm-cm">
          <div class="cm-cell tp">
            <div class="cm-tag">TP</div>
            <div class="cm-num">{{ TP }}</div>
            <div class="cm-sub">Rusak <span class="cm-arr">→</span> Rusak</div>
          </div>
          <div class="cm-cell fp">
            <div class="cm-tag">FP</div>
            <div class="cm-num">{{ FP }}</div>
            <div class="cm-sub">Sehat <span class="cm-arr">→</span> Rusak</div>
          </div>
          <div class="cm-cell fn">
            <div class="cm-tag">FN</div>
            <div class="cm-num">{{ FN }}</div>
            <div class="cm-sub">Rusak <span class="cm-arr">→</span> Sehat</div>
          </div>
          <div class="cm-cell tn">
            <div class="cm-tag">TN</div>
            <div class="cm-num">{{ TN }}</div>
            <div class="cm-sub">Sehat <span class="cm-arr">→</span> Sehat</div>
          </div>
        </div>
        <div class="tm-metrics">
          <div class="mt">
            <span class="mt-k">Akurasi</span>
            <span class="mt-v acc">{{ fmt(accuracy) }}</span>
          </div>
          <div class="mt">
            <span class="mt-k">Presisi</span>
            <span class="mt-v pre">{{ fmt(precision) }}</span>
          </div>
          <div class="mt">
            <span class="mt-k">Recall</span>
            <span class="mt-v rec">{{ fmt(recall) }}</span>
          </div>
          <div class="mt">
            <span class="mt-k">F1</span>
            <span class="mt-v f1">{{ fmt(f1) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'

/* ---- Sumbu & parameter distribusi (deterministik, tanpa randomness) ---- */
const XMIN = 0
const XMAX = 12
const N_PER = 100 // jumlah sampel per kelas (100 sehat + 100 rusak)

// Distribusi Gaussian: Sehat di kiri (mu=3.5), Rusak di kanan (mu=7), overlap di tengah.
const SEHAT = { mu: 3.5, sigma: 1.25 }
const RUSAK = { mu: 7.0, sigma: 1.45 }

const thr = ref(5.2) // posisi ambang batas (mm/s)
const cv = ref(null)
const dragging = ref(false)

/* ---- Fungsi Gaussian & integrasi numerik (komposit) ---- */
function gauss(x, mu, sigma) {
  return Math.exp(-((x - mu) * (x - mu)) / (2 * sigma * sigma))
}
// massa relatif distribusi pada [a,b] dibagi total [XMIN,XMAX] (aturan trapesium)
function fraction(dist, a, b) {
  const lo = Math.max(XMIN, Math.min(a, b))
  const hi = Math.min(XMAX, Math.max(a, b))
  const STEPS = 400
  const full = integ(dist, XMIN, XMAX, STEPS)
  if (hi <= lo || full <= 0) return 0
  return integ(dist, lo, hi, STEPS) / full
}
function integ(dist, a, b, steps) {
  const h = (b - a) / steps
  let s = 0
  for (let i = 0; i <= steps; i++) {
    const x = a + i * h
    const w = i === 0 || i === steps ? 0.5 : 1
    s += w * gauss(x, dist.mu, dist.sigma)
  }
  return s * h
}

/* ---- Confusion matrix (positif = "Rusak") ---- */
// Rusak di kanan ambang = TP; Rusak di kiri = FN.
// Sehat di kiri ambang = TN; Sehat di kanan = FP.
const TP = computed(() => Math.round(N_PER * fraction(RUSAK, thr.value, XMAX)))
const FN = computed(() => Math.round(N_PER * fraction(RUSAK, XMIN, thr.value)))
const TN = computed(() => Math.round(N_PER * fraction(SEHAT, XMIN, thr.value)))
const FP = computed(() => Math.round(N_PER * fraction(SEHAT, thr.value, XMAX)))

const total = computed(() => TP.value + FP.value + FN.value + TN.value)
const accuracy = computed(() =>
  total.value ? (TP.value + TN.value) / total.value : null
)
const precision = computed(() => {
  const d = TP.value + FP.value
  return d ? TP.value / d : null
})
const recall = computed(() => {
  const d = TP.value + FN.value
  return d ? TP.value / d : null
})
const f1 = computed(() => {
  const p = precision.value
  const r = recall.value
  if (p === null || r === null || p + r === 0) return null
  return (2 * p * r) / (p + r)
})

function fmt(v) {
  if (v === null || Number.isNaN(v)) return '–'
  return v.toFixed(3)
}

/* ---- Pemetaan koordinat & gambar ---- */
function xToPx(x, w, padL, padR) {
  return padL + ((x - XMIN) / (XMAX - XMIN)) * (w - padL - padR)
}
function pxToX(px, w, padL, padR) {
  const t = (px - padL) / (w - padL - padR)
  return XMIN + Math.min(1, Math.max(0, t)) * (XMAX - XMIN)
}

function draw() {
  const c = cv.value
  if (!c) return
  const dpr = window.devicePixelRatio || 1
  const w = c.clientWidth || 420
  const h = c.clientHeight || 230
  c.width = Math.round(w * dpr)
  c.height = Math.round(h * dpr)
  const ctx = c.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  const padL = 30
  const padR = 12
  const padT = 12
  const padB = 26
  const baseY = h - padB
  const plotH = baseY - padT

  // latar kanvas
  ctx.fillStyle = '#06091a'
  ctx.fillRect(0, 0, w, h)

  const tx = xToPx(thr.value, w, padL, padR)

  // tint region: kiri = prediksi Sehat (emerald), kanan = prediksi Rusak (coral)
  ctx.fillStyle = 'rgba(52,211,153,0.06)'
  ctx.fillRect(padL, padT, tx - padL, plotH)
  ctx.fillStyle = 'rgba(251,113,133,0.06)'
  ctx.fillRect(tx, padT, w - padR - tx, plotH)

  // skala tinggi puncak → koordinat layar
  const peak = Math.max(
    gauss(SEHAT.mu, SEHAT.mu, SEHAT.sigma),
    gauss(RUSAK.mu, RUSAK.mu, RUSAK.sigma)
  )
  const yScale = (plotH * 0.92) / peak
  const yOf = (val) => baseY - val * yScale

  // builder titik kurva
  const STEPS = 160
  const curvePts = (dist) => {
    const pts = []
    for (let i = 0; i <= STEPS; i++) {
      const x = XMIN + (i / STEPS) * (XMAX - XMIN)
      pts.push([xToPx(x, w, padL, padR), yOf(gauss(x, dist.mu, dist.sigma))])
    }
    return pts
  }
  const sehatPts = curvePts(SEHAT)
  const rusakPts = curvePts(RUSAK)

  // helper: isi area di bawah kurva untuk x dalam [xa,xb]
  function fillUnder(dist, xa, xb, style) {
    const pa = xToPx(Math.max(XMIN, xa), w, padL, padR)
    const pb = xToPx(Math.min(XMAX, xb), w, padL, padR)
    if (pb <= pa) return
    ctx.beginPath()
    ctx.moveTo(pa, baseY)
    for (let i = 0; i <= STEPS; i++) {
      const x = XMIN + (i / STEPS) * (XMAX - XMIN)
      const px = xToPx(x, w, padL, padR)
      if (px < pa - 0.5 || px > pb + 0.5) continue
      ctx.lineTo(px, yOf(gauss(x, dist.mu, dist.sigma)))
    }
    ctx.lineTo(pb, baseY)
    ctx.closePath()
    ctx.fillStyle = style
    ctx.fill()
  }

  // area dasar (lembut) tiap distribusi
  fillUnder(SEHAT, XMIN, XMAX, 'rgba(52,211,153,0.10)')
  fillUnder(RUSAK, XMIN, XMAX, 'rgba(251,113,133,0.10)')

  // area ERROR yang ditonjolkan:
  // FN = massa Rusak di KIRI ambang (coral kuat)
  fillUnder(RUSAK, XMIN, thr.value, 'rgba(251,113,133,0.42)')
  // FP = massa Sehat di KANAN ambang (emerald kuat)
  fillUnder(SEHAT, thr.value, XMAX, 'rgba(52,211,153,0.42)')

  // garis kurva
  function stroke(pts, color) {
    ctx.beginPath()
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)))
    ctx.lineWidth = 2
    ctx.strokeStyle = color
    ctx.stroke()
  }
  stroke(sehatPts, '#34d399')
  stroke(rusakPts, '#fb7185')

  // sumbu X + grid label
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padL, baseY)
  ctx.lineTo(w - padR, baseY)
  ctx.stroke()
  ctx.fillStyle = '#64748b'
  ctx.font = "10.5px 'Fira Code', ui-monospace, monospace"
  ctx.textAlign = 'center'
  for (let gx = 0; gx <= XMAX; gx += 2) {
    const px = xToPx(gx, w, padL, padR)
    ctx.fillText(String(gx), px, baseY + 13)
  }
  ctx.textAlign = 'right'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText('RMS (mm/s)', w - padR, h - 4)

  // garis AMBANG (violet)
  ctx.beginPath()
  ctx.setLineDash([5, 4])
  ctx.moveTo(tx, padT - 2)
  ctx.lineTo(tx, baseY)
  ctx.lineWidth = 2
  ctx.strokeStyle = '#a78bfa'
  ctx.stroke()
  ctx.setLineDash([])
  // gagang ambang
  ctx.beginPath()
  ctx.arc(tx, padT + 4, 3.5, 0, Math.PI * 2)
  ctx.fillStyle = '#a78bfa'
  ctx.fill()
}

/* ---- Interaksi kanvas (opsional: klik/seret set ambang) ---- */
function setThrFromEvent(e) {
  const c = cv.value
  if (!c) return
  const rect = c.getBoundingClientRect()
  const w = c.clientWidth || rect.width
  const px = e.clientX - rect.left
  const x = pxToX(px, w, 30, 12)
  thr.value = Math.min(XMAX, Math.max(XMIN, Number(x.toFixed(2))))
}
function onCanvasPick(e) {
  dragging.value = true
  setThrFromEvent(e)
}
function onCanvasDrag(e) {
  if (!dragging.value) return
  setThrFromEvent(e)
}

/* ---- Reaktif: gambar ulang saat ambang berubah / mount / resize ---- */
watch(thr, () => draw())
let ro = null
onMounted(() => {
  nextTick(() => {
    draw()
    if (typeof ResizeObserver !== 'undefined' && cv.value) {
      ro = new ResizeObserver(() => draw())
      ro.observe(cv.value)
    }
  })
})
</script>

<style scoped>
.tm {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #0d1526;
  padding: 12px;
  color: #e2e8f0;
  font-family: 'Fira Code', ui-monospace, monospace;
  box-sizing: border-box;
}
.tm-grid {
  display: flex;
  gap: 12px;
  align-items: stretch;
}
.tm-left {
  flex: 0 0 55%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tm-right {
  flex: 1 1 45%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.tm-canvas {
  width: 100%;
  height: 228px;
  display: block;
  border-radius: 8px;
  background: #06091a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: ew-resize;
  touch-action: none;
}

/* slider */
.tm-slider {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tm-slabel {
  font-size: 11.5px;
  color: #94a3b8;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.tm-sval {
  color: #a78bfa;
  font-weight: 700;
  font-size: 12px;
}
.tm-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 5px;
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(52, 211, 153, 0.5), rgba(251, 113, 133, 0.5));
  outline: none;
  cursor: pointer;
}
.tm-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #a78bfa;
  border: 2px solid #0d1526;
  box-shadow: 0 0 0 1px #a78bfa;
  cursor: pointer;
}
.tm-range::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #a78bfa;
  border: 2px solid #0d1526;
  box-shadow: 0 0 0 1px #a78bfa;
  cursor: pointer;
}
.tm-legend {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 1px;
}
.tm-lg {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  display: inline-block;
}
.dot.ok {
  background: #34d399;
}
.dot.bad {
  background: #fb7185;
}
.dot.thr {
  background: #a78bfa;
}

/* confusion matrix */
.tm-cm {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.cm-cell {
  border-radius: 7px;
  padding: 6px 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1px;
  line-height: 1.1;
}
.cm-tag {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
  opacity: 0.85;
}
.cm-num {
  font-size: 19px;
  font-weight: 800;
}
.cm-sub {
  font-size: 10px;
  color: #94a3b8;
}
.cm-arr {
  color: #f1f5f9;
  font-weight: 800;
  font-size: 1.2em;
  padding: 0 1px;
}
.cm-cell.tp {
  background: rgba(52, 211, 153, 0.12);
  border-color: rgba(52, 211, 153, 0.4);
}
.cm-cell.tp .cm-tag,
.cm-cell.tp .cm-num {
  color: #34d399;
}
.cm-cell.tn {
  background: rgba(52, 211, 153, 0.08);
  border-color: rgba(52, 211, 153, 0.28);
}
.cm-cell.tn .cm-tag,
.cm-cell.tn .cm-num {
  color: #6ee7b7;
}
.cm-cell.fp {
  background: rgba(251, 191, 36, 0.12);
  border-color: rgba(251, 191, 36, 0.4);
}
.cm-cell.fp .cm-tag,
.cm-cell.fp .cm-num {
  color: #fbbf24;
}
.cm-cell.fn {
  background: rgba(251, 113, 133, 0.13);
  border-color: rgba(251, 113, 133, 0.42);
}
.cm-cell.fn .cm-tag,
.cm-cell.fn .cm-num {
  color: #fb7185;
}

/* metrics */
.tm-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}
.mt {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  background: #06091a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 4px 8px;
}
.mt-k {
  font-size: 11px;
  color: #94a3b8;
}
.mt-v {
  font-size: 13px;
  font-weight: 700;
  color: #38bdf8;
}
.mt-v.acc {
  color: #38bdf8;
}
.mt-v.pre {
  color: #a78bfa;
}
.mt-v.rec {
  color: #34d399;
}
.mt-v.f1 {
  color: #fbbf24;
}

/* fallback: tumpuk bila sempit */
@media (max-width: 560px) {
  .tm-grid {
    flex-direction: column;
  }
  .tm-left,
  .tm-right {
    flex: 1 1 auto;
  }
}
</style>
