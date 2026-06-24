<!--
  TimeFreqDemo.vue — Ilustrasi interaktif: domain waktu ke domain frekuensi.
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
import { ref, computed } from 'vue'
const comps = [
  { f: 30, amp: 1.0, fx: 70,  h: 80, color: '#a78bfa' },
  { f: 60, amp: 0.5, fx: 170, h: 42, color: '#00e5ff' },
  { f: 90, amp: 0.3, fx: 270, h: 26, color: '#fbbf24' },
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
function toggle() { exploded.value = !exploded.value; animate(exploded.value ? 1 : 0) }
</script>

<style scoped>
.tf {
  border: 1px solid rgba(255,255,255,.08); border-radius: 10px;
  background: #0d1526; padding: 14px 16px; color: #f1f5f9;
  transition: border-color 0.22s ease, box-shadow 0.22s ease;
}
.tf:hover { border-color: rgba(167,139,250,0.5); box-shadow: 0 0 0 1px rgba(167,139,250,0.15), 0 6px 28px rgba(167,139,250,0.12); }
.tf-row { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 10px; }
.tf-card { background: #06091a; border: 1px solid rgba(255,255,255,.06); border-radius: 8px; padding: 8px; }
.tf-cap { font-size: 11px; color: #64748b; margin-bottom: 4px; }
.tf-svg { width: 100%; height: 120px; display: block; }
.tf-axis { stroke: rgba(255,255,255,.1); stroke-width: 1; stroke-dasharray: 3 3; }
.tf-mix { fill: none; stroke: #c4b5fd; stroke-width: 2; }
.tf-peak { transition: none; }
.tf-tick { fill: #64748b; font-size: 9px; text-anchor: middle; }
.tf-arrow { display: flex; flex-direction: column; align-items: center; color: #a78bfa; }
.tf-ft { font-size: 22px; font-style: italic; font-weight: 700; }
.tf-arrowline { font-size: 26px; line-height: 1; }
.tf-ctrl { display: flex; align-items: center; gap: 14px; margin-top: 12px; }
.tf-btn { font-size: 13px; font-weight: 600; color: #030712; background: #a78bfa; border: none; border-radius: 6px; padding: 6px 16px; cursor: pointer; }
.tf-btn:hover { background: #c4b5fd; }
.tf-hint { font-size: 12px; color: #64748b; }
</style>
