<!--
  AliasingDemo.vue — Demo interaktif aliasing.
  Geser frekuensi sampling → lihat sinyal asli (cepat) "menyamar" jadi alias (lambat)
  ketika fs terlalu rendah (di bawah Nyquist 2·f_sinyal).
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
      <!-- sinyal asli -->
      <path :d="truePath" class="al-true" />
      <!-- titik sampling -->
      <circle v-for="(p, i) in samples" :key="'s'+i" :cx="p.x" :cy="p.y" r="3.2" class="al-dot" />
      <!-- alias rekonstruksi -->
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
const fSig = 8           // frekuensi sinyal asli (Hz), tetap
const cycles = fSig      // tampilkan 1 detik
const fs = ref(20)

const truePath = computed(() => {
  let d = ''
  for (let px = 0; px <= W; px += 2) {
    const t = px / W                       // 0..1 detik
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

// frekuensi alias = |fSig - round(fSig/fs)*fs|
const fAlias = computed(() => {
  const k = Math.round(fSig / fs.value)
  return Math.abs(fSig - k * fs.value)
})
const aliased = computed(() => fs.value < 2 * fSig)

const aliasPath = computed(() => {
  let d = ''
  const fa = fAlias.value
  // fase cocokkan ke sampel pertama
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
  border: 1px solid #2e2a21; border-radius: 10px;
  background: #161410; padding: 14px 16px; color: #e7e2d8;
  transition: border-color 0.22s ease, box-shadow 0.22s ease;
}
.al:hover {
  border-color: rgba(200,146,42,0.55);
  box-shadow: 0 0 0 1px rgba(200,146,42,0.18), 0 6px 28px rgba(200,146,42,0.13);
}
.al-ctrl { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.al-label { font-size: 13px; color: #b6b0a5; }
.al-slider { flex: 1; max-width: 260px; accent-color: #c8922a; }
.al-badge {
  min-width: 54px; text-align: center; font-weight: 700;
  background: #c8922a; color: #1a1917; border-radius: 5px; padding: 2px 8px; font-size: 13px;
}
.al-svg { width: 100%; height: 150px; display: block; background: #100e0a; border-radius: 8px; }
.al-axis { stroke: #3a352b; stroke-width: 1; stroke-dasharray: 3 3; }
.al-true { fill: none; stroke: #5b9bd5; stroke-width: 2; opacity: 0.85; }
.al-dot { fill: #c8922a; }
.al-alias { fill: none; stroke: #d9655a; stroke-width: 2.2; stroke-dasharray: 6 4; }
.al-legend { display: flex; gap: 16px; flex-wrap: wrap; font-size: 11.5px; margin-top: 8px; }
.al-lg-true { color: #7fb4e3; }
.al-lg-dot { color: #e0b455; }
.al-lg-alias { color: #e58a80; }
.al-verdict { margin-top: 8px; font-size: 13px; padding: 8px 12px; border-radius: 6px; line-height: 1.45; }
.al-verdict.good { background: rgba(95,174,95,0.12); border: 1px solid rgba(95,174,95,0.4); }
.al-verdict.bad { background: rgba(217,101,90,0.12); border: 1px solid rgba(217,101,90,0.4); }
.al-verdict b { color: #e58a80; }
</style>
