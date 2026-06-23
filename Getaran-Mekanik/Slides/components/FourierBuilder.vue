<!--
  FourierBuilder.vue — Ilustrasi interaktif: membangun gelombang kotak dari harmonik.
  Geser slider → lihat penjumlahan sinus mendekati gelombang kotak + spektrum 1/n.
-->
<template>
  <div class="fb">
    <div class="fb-ctrl">
      <span class="fb-label">Jumlah harmonik</span>
      <input type="range" min="1" max="12" v-model.number="terms" class="fb-slider" />
      <span class="fb-badge">{{ terms }}</span>
      <button class="fb-play" @click="toggle">{{ playing ? '⏸ Stop' : '▶ Animasi' }}</button>
    </div>

    <div class="fb-plots">
      <div class="fb-card">
        <div class="fb-cap">Domain Waktu — sinyal terbentuk</div>
        <svg viewBox="0 0 400 150" preserveAspectRatio="none" class="fb-svg">
          <line x1="0" y1="75" x2="400" y2="75" class="fb-axis" />
          <path :d="idealPath" class="fb-ideal" />
          <path :d="sumPath" class="fb-sum" />
        </svg>
      </div>
      <div class="fb-card">
        <div class="fb-cap">Domain Frekuensi — spektrum amplitudo</div>
        <svg viewBox="0 0 220 150" class="fb-svg">
          <line x1="24" y1="128" x2="216" y2="128" class="fb-axis" />
          <g v-for="(b, i) in bars" :key="i">
            <rect :x="b.x" :y="b.y" width="12" :height="b.h" class="fb-bar" />
            <text :x="b.x + 6" y="142" class="fb-tick">{{ b.k }}f₀</text>
          </g>
        </svg>
      </div>
    </div>
    <div class="fb-note">
      Makin banyak harmonik ganjil (1f₀, 3f₀, 5f₀, …) dijumlahkan, makin tajam bentuk kotaknya —
      tepi yang menyisakan riak kecil itulah <b>fenomena Gibbs</b>.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

const terms = ref(1)
const playing = ref(false)
let timer = null

const W = 400, MID = 75, AMP = 52, PERIODS = 2

const sumPath = computed(() => {
  let d = ''
  for (let px = 0; px <= W; px += 2) {
    const t = (px / W) * 2 * Math.PI * PERIODS
    let y = 0
    for (let k = 1; k <= 2 * terms.value - 1; k += 2) {
      y += (4 / (k * Math.PI)) * Math.sin(k * t)
    }
    d += (px === 0 ? 'M' : 'L') + px + ',' + (MID - y * AMP).toFixed(1) + ' '
  }
  return d
})

const idealPath = computed(() => {
  const half = W / (2 * PERIODS)
  let d = 'M0,' + (MID - AMP)
  let up = true, x = 0
  for (let p = 0; p < 2 * PERIODS; p++) {
    const nx = x + half
    const yl = up ? MID - AMP : MID + AMP
    d += ` L${x},${yl} L${nx},${yl}`
    x = nx; up = !up
  }
  return d
})

const bars = computed(() => {
  const arr = []
  let i = 0
  for (let k = 1; k <= 2 * terms.value - 1; k += 2) {
    const h = (1 / k) * 100
    arr.push({ k, x: 30 + i * 26, y: 128 - h, h })
    i++
  }
  return arr
})

function toggle() {
  playing.value = !playing.value
  if (playing.value) {
    timer = setInterval(() => {
      terms.value = terms.value >= 12 ? 1 : terms.value + 1
    }, 700)
  } else {
    clearInterval(timer)
  }
}
onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.fb {
  border: 1px solid #2e2a21; border-radius: 10px;
  background: #161410; padding: 14px 16px; color: #e7e2d8;
}
.fb-ctrl { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.fb-label { font-size: 13px; color: #b6b0a5; }
.fb-slider { flex: 1; max-width: 240px; accent-color: #c8922a; }
.fb-badge {
  min-width: 26px; text-align: center; font-weight: 700;
  background: #c8922a; color: #1a1917; border-radius: 5px; padding: 2px 8px; font-size: 14px;
}
.fb-play {
  font-size: 12px; color: #c8922a; background: transparent;
  border: 1px solid #c8922a; border-radius: 5px; padding: 3px 12px; cursor: pointer;
}
.fb-play:hover { background: #c8922a; color: #1a1917; }
.fb-plots { display: grid; grid-template-columns: 1.7fr 1fr; gap: 12px; }
.fb-card { background: #100e0a; border: 1px solid #26221a; border-radius: 8px; padding: 8px; }
.fb-cap { font-size: 11px; color: #968f84; margin-bottom: 4px; }
.fb-svg { width: 100%; height: 150px; display: block; }
.fb-axis { stroke: #3a352b; stroke-width: 1; stroke-dasharray: 3 3; }
.fb-ideal { fill: none; stroke: #4a4536; stroke-width: 1.5; }
.fb-sum { fill: none; stroke: #c8922a; stroke-width: 2.2; }
.fb-bar { fill: #c8922a; }
.fb-tick { fill: #8a8478; font-size: 9px; text-anchor: middle; }
.fb-note { font-size: 12px; color: #b6b0a5; margin-top: 10px; line-height: 1.45; }
.fb-note b { color: #e0b455; }
</style>
