<!--
  AliasingDemo.vue — Demo interaktif aliasing.
-->
<template>
  <div class="al">
    <div class="al-ctrl">
      <span class="al-label">Frekuensi sampling f<sub>s</sub></span>
      <input type="range" min="3" max="40" v-model.number="fs" class="al-slider" />
      <span class="al-badge">{{ fs }} Hz</span>
    </div>
    <svg viewBox="0 0 460 150" preserveAspectRatio="none" class="al-svg">
      <line x1="0" y1="75" x2="460" y2="75" class="al-axis" />
      <path :d="truePath" class="al-true" />
      <circle v-for="(p, i) in samples" :key="'s'+i" :cx="p.x" :cy="p.y" r="3.2" class="al-dot" />
      <path v-if="aliased" :d="aliasPath" class="al-alias" />
    </svg>
    <div class="al-legend">
      <span class="al-lg al-lg-true">— sinyal asli {{ fSig }} Hz</span>
      <span class="al-lg al-lg-dot">● titik sampel</span>
      <span class="al-lg al-lg-alias" v-if="aliased">— alias {{ fAlias.toFixed(1) }} Hz (palsu!)</span>
    </div>
    <div class="al-verdict" :class="aliased ? 'bad' : 'good'">
      <template v-if="aliased">
        ⚠️ f<sub>s</sub> = {{ fs }} Hz &lt; 2·{{ fSig }} = {{ 2*fSig }} Hz (Nyquist).
        Sinyal {{ fSig }} Hz tampak seolah <b>{{ fAlias.toFixed(1) }} Hz</b> — diagnosis bisa salah!
      </template>
      <template v-else>
        ✅ f<sub>s</sub> = {{ fs }} Hz ≥ 2·{{ fSig }} = {{ 2*fSig }} Hz. Sinyal terwakili dengan benar.
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const W = 460, MID = 75, AMP = 50
const fSig = 8
const fs = ref(20)
const truePath = computed(() => {
  let d = ''
  for (let px = 0; px <= W; px += 2) {
    const t = px / W
    const y = MID - AMP * Math.sin(2 * Math.PI * fSig * t)
    d += (px === 0 ? 'M' : 'L') + px + ',' + y.toFixed(1) + ' '
  }
  return d
})
const samples = computed(() => {
  const arr = []
  const n = fs.value
  for (let i = 0; i <= n; i++) {
    const t = i / n
    if (t > 1) break
    const y = MID - AMP * Math.sin(2 * Math.PI * fSig * t)
    arr.push({ x: t * W, y })
  }
  return arr
})
const fAlias = computed(() => {
  const k = Math.round(fSig / fs.value)
  return Math.abs(fSig - k * fs.value)
})
const aliased = computed(() => fs.value < 2 * fSig)
const aliasPath = computed(() => {
  let d = ''
  const fa = fAlias.value
  for (let px = 0; px <= W; px += 2) {
    const t = px / W
    const y = MID - AMP * Math.sin(2 * Math.PI * fa * t)
    d += (px === 0 ? 'M' : 'L') + px + ',' + y.toFixed(1) + ' '
  }
  return d
})
</script>

<style scoped>
.al {
  border: 1px solid rgba(255,255,255,.08); border-radius: 10px;
  background: #0d1526; padding: 14px 16px; color: #f1f5f9;
  transition: border-color 0.22s ease, box-shadow 0.22s ease;
}
.al:hover { border-color: rgba(167,139,250,0.5); box-shadow: 0 0 0 1px rgba(167,139,250,0.15), 0 6px 28px rgba(167,139,250,0.12); }
.al-ctrl { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.al-label { font-size: 13px; color: #94a3b8; }
.al-slider { flex: 1; max-width: 260px; accent-color: #a78bfa; }
.al-badge { min-width: 54px; text-align: center; font-weight: 700; background: #a78bfa; color: #030712; border-radius: 5px; padding: 2px 8px; font-size: 13px; }
.al-svg { width: 100%; height: 118px; display: block; background: #06091a; border-radius: 8px; }
.al-axis { stroke: rgba(255,255,255,.1); stroke-width: 1; stroke-dasharray: 3 3; }
.al-true { fill: none; stroke: #00e5ff; stroke-width: 2; opacity: 0.85; }
.al-dot { fill: #fbbf24; }
.al-alias { fill: none; stroke: #fb7185; stroke-width: 2.2; stroke-dasharray: 6 4; }
.al-legend { display: flex; gap: 16px; flex-wrap: wrap; font-size: 11.5px; margin-top: 8px; }
.al-lg-true { color: #67e8f9; }
.al-lg-dot { color: #fbbf24; }
.al-lg-alias { color: #fca5a5; }
.al-verdict { margin-top: 8px; font-size: 13px; padding: 8px 12px; border-radius: 6px; line-height: 1.45; }
.al-verdict.good { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.35); }
.al-verdict.bad { background: rgba(251,113,133,0.1); border: 1px solid rgba(251,113,133,0.35); }
.al-verdict b { color: #fca5a5; }
</style>
