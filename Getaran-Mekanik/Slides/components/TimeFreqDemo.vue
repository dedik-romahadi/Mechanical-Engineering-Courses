<!--
  TimeFreqDemo.vue — Ilustrasi interaktif: dari domain waktu ke domain frekuensi.
  Klik "Urai" → sinyal campuran (3 sinus) terpisah menjadi puncak-puncak spektrum.
-->
<template>
  <div class="tf">
    <div class="tf-row">
      <div class="tf-card">
        <div class="tf-cap">Domain Waktu — bertumpuk, sulit dibaca</div>
        <svg viewBox="0 0 360 120" preserveAspectRatio="none" class="tf-svg">
          <line x1="0" y1="60" x2="360" y2="60" class="tf-axis" />
          <path :d="mixPath" class="tf-mix" />
        </svg>
      </div>

      <div class="tf-arrow">
        <div class="tf-ft">ℱ</div>
        <div class="tf-arrowline">→</div>
      </div>

      <div class="tf-card">
        <div class="tf-cap">Domain Frekuensi — puncak terpisah jelas</div>
        <svg viewBox="0 0 360 120" preserveAspectRatio="none" class="tf-svg">
          <line x1="0" y1="105" x2="360" y2="105" class="tf-axis" />
          <g v-for="(c, i) in comps" :key="i">
            <rect :x="c.fx - 5" :y="105 - c.h * grown" width="10" :height="c.h * grown"
                  class="tf-peak" :style="{ fill: c.color }" />
            <text :x="c.fx" y="118" class="tf-tick">{{ c.f }}Hz</text>
          </g>
        </svg>
      </div>
    </div>

    <div class="tf-ctrl">
      <button class="tf-btn" @click="toggle">{{ exploded ? '↩ Gabung kembali' : '✨ Urai sinyal (FFT)' }}</button>
      <span class="tf-hint">{{ exploded ? 'Tiap warna = satu komponen frekuensi.' : 'Klik untuk memisahkan komponen.' }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// 3 komponen: (frekuensi tampilan, amplitudo, posisi-x spektrum, warna)
const comps = [
  { f: 30,  amp: 1.0, fx: 70,  h: 80, color: '#c8922a' },
  { f: 60,  amp: 0.5, fx: 170, h: 42, color: '#5b9bd5' },
  { f: 90,  amp: 0.3, fx: 270, h: 26, color: '#82c182' },
]

const W = 360, MID = 60
const mixPath = computed(() => {
  let d = ''
  for (let px = 0; px <= W; px += 2) {
    const t = (px / W) * 2 * Math.PI
    let y = 0
    comps.forEach((c, i) => { y += c.amp * Math.sin((i + 1) * 1.6 * t) })
    d += (px === 0 ? 'M' : 'L') + px + ',' + (MID - y * 22).toFixed(1) + ' '
  }
  return d
})

const exploded = ref(false)
const grown = ref(0)
let raf = null
function animate(target) {
  cancelAnimationFrame(raf)
  const step = () => {
    const diff = target - grown.value
    if (Math.abs(diff) < 0.01) { grown.value = target; return }
    grown.value += diff * 0.12
    raf = requestAnimationFrame(step)
  }
  step()
}
function toggle() {
  exploded.value = !exploded.value
  animate(exploded.value ? 1 : 0)
}
</script>

<style scoped>
.tf { border: 1px solid #2e2a21; border-radius: 10px; background: #161410; padding: 14px 16px; color: #e7e2d8; }
.tf-row { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 10px; }
.tf-card { background: #100e0a; border: 1px solid #26221a; border-radius: 8px; padding: 8px; }
.tf-cap { font-size: 11px; color: #968f84; margin-bottom: 4px; }
.tf-svg { width: 100%; height: 120px; display: block; }
.tf-axis { stroke: #3a352b; stroke-width: 1; stroke-dasharray: 3 3; }
.tf-mix { fill: none; stroke: #d9b15a; stroke-width: 2; }
.tf-peak { transition: none; }
.tf-tick { fill: #8a8478; font-size: 9px; text-anchor: middle; }
.tf-arrow { display: flex; flex-direction: column; align-items: center; color: #c8922a; }
.tf-ft { font-size: 22px; font-style: italic; font-weight: 700; }
.tf-arrowline { font-size: 26px; line-height: 1; }
.tf-ctrl { display: flex; align-items: center; gap: 14px; margin-top: 12px; }
.tf-btn {
  font-size: 13px; font-weight: 600; color: #1a1917; background: #c8922a;
  border: none; border-radius: 6px; padding: 6px 16px; cursor: pointer;
}
.tf-btn:hover { background: #d9a838; }
.tf-hint { font-size: 12px; color: #968f84; }
</style>
