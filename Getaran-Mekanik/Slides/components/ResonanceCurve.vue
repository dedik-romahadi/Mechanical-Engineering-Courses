<!--
  ResonanceCurve.vue — FRF interaktif. Geser damping ratio ζ → lihat puncak resonansi
  makin tinggi & tajam saat ζ kecil. Memvisualkan |H(ω)| = 1/√((1-r²)²+(2ζr)²).
-->
<template>
  <div class="rc">
    <div class="rc-ctrl">
      <span class="rc-label">Rasio redaman ζ</span>
      <input type="range" min="2" max="50" v-model.number="zPct" class="rc-slider" />
      <span class="rc-badge">ζ = {{ (zPct/100).toFixed(2) }}</span>
      <span class="rc-q">Q ≈ {{ (1/(2*zPct/100)).toFixed(1) }}</span>
    </div>

    <svg viewBox="0 0 420 200" preserveAspectRatio="none" class="rc-svg">
      <line x1="40" y1="170" x2="410" y2="170" class="rc-axis" />
      <line x1="40" y1="10" x2="40" y2="170" class="rc-axis" />
      <!-- garis resonansi r=1 -->
      <line :x1="xAt(1)" y1="10" :x2="xAt(1)" y2="170" class="rc-rline" />
      <text :x="xAt(1)" y="186" class="rc-tick">ω/ωₙ = 1</text>
      <path :d="curve" class="rc-curve" />
      <text x="46" y="20" class="rc-ylab">|H|</text>
    </svg>
    <div class="rc-note">
      Puncak terjadi pada frekuensi natural ωₙ. Makin kecil ζ (redaman), puncak makin
      <b>tinggi dan runcing</b> — inilah yang membuat resonansi berbahaya bagi mesin & struktur.
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const zPct = ref(10)                 // ζ dalam persen (2..50 → 0.02..0.50)
const X0 = 40, X1 = 410, Y0 = 170, RMAX = 2.5, HMAX = 12

function xAt(r) { return X0 + (r / RMAX) * (X1 - X0) }

const curve = computed(() => {
  const z = zPct.value / 100
  let d = ''
  let first = true
  for (let r = 0; r <= RMAX; r += 0.02) {
    const H = 1 / Math.sqrt((1 - r * r) ** 2 + (2 * z * r) ** 2)
    const y = Y0 - Math.min(H, HMAX) / HMAX * (Y0 - 12)
    const x = xAt(r)
    d += (first ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' '
    first = false
  }
  return d
})
</script>

<style scoped>
.rc { border: 1px solid #2e2a21; border-radius: 10px; background: #161410; padding: 14px 16px; color: #e7e2d8; }
.rc-ctrl { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.rc-label { font-size: 13px; color: #b6b0a5; }
.rc-slider { flex: 1; max-width: 220px; accent-color: #c8922a; }
.rc-badge { font-weight: 700; background: #c8922a; color: #1a1917; border-radius: 5px; padding: 2px 8px; font-size: 13px; }
.rc-q { font-size: 12px; color: #968f84; }
.rc-svg { width: 100%; height: 200px; display: block; background: #100e0a; border-radius: 8px; }
.rc-axis { stroke: #4a4536; stroke-width: 1.2; }
.rc-rline { stroke: #5b9bd5; stroke-width: 1; stroke-dasharray: 4 3; opacity: 0.7; }
.rc-curve { fill: none; stroke: #c8922a; stroke-width: 2.4; }
.rc-tick { fill: #7fb4e3; font-size: 9px; text-anchor: middle; }
.rc-ylab { fill: #8a8478; font-size: 10px; }
.rc-note { font-size: 12px; color: #b6b0a5; margin-top: 10px; line-height: 1.45; }
.rc-note b { color: #e0b455; }
</style>
