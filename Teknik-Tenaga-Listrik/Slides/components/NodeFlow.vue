<!--
  NodeFlow.vue — Analisis nodal + superposisi (Modul 4, Gambar 3–4):
  E1 = 14 V/2 Ω, E2 = 11 V/4 Ω, R3 = 5 Ω ke simpul bersama V.
  Pilih "keduanya" atau satu sumber saja; arah & kecepatan aliran mengikuti arus.
-->
<template>
  <div class="anim-card nf">
    <svg viewBox="0 0 330 140" class="nf-svg" xmlns="http://www.w3.org/2000/svg">
      <path d="M55 30 H275 M55 30 V125 H275 V30 M165 30 V125" class="nf-w" />
      <path v-for="(c, i) in cab" :key="i" :d="c.d" class="nf-f" :style="gaya(arus[i], c.naik)" />
      <circle cx="55" cy="78" r="13" class="nf-src" :class="{ off: mode === 2 }" />
      <text x="55" y="82" class="nf-t" text-anchor="middle">{{ mode === 2 ? '0' : '14V' }}</text>
      <circle cx="275" cy="78" r="13" class="nf-src" :class="{ off: mode === 1 }" />
      <text x="275" y="82" class="nf-t" text-anchor="middle">{{ mode === 1 ? '0' : '11V' }}</text>
      <rect x="157" y="62" width="16" height="32" rx="3" class="nf-r" /><text x="178" y="82" class="nf-t">5Ω</text>
      <circle cx="165" cy="30" r="7" fill="#fbbf24" class="nf-node" />
      <text x="165" y="16" class="nf-t" text-anchor="middle" fill="#fde68a">V = {{ s.V }} V</text>
      <text x="62" y="50" class="nf-t" fill="#38bdf8">I₁ {{ s.I[0] }}</text>
      <text x="268" y="50" class="nf-t" text-anchor="end" fill="#38bdf8">I₂ {{ s.I[1] }}</text>
      <text x="178" y="112" class="nf-t" fill="#34d399">I₃ {{ s.I[2] }}</text>
    </svg>
    <div class="nf-ctl">
      <button v-for="(m, i) in ['Keduanya', 'Hanya E₁', 'Hanya E₂']" :key="i" :class="{ on: mode === i }" @click="mode = i">{{ m }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
// Nilai dari Modul 4: nodal langsung dan dua kasus superposisi (A, positif = menuju simpul untuk I1, I2; turun untuk I3).
const data = [
  { V: '10,263', I: ['1,868 A', '0,184 A', '2,053 A'], a: [1.868, 0.184, 2.053] },
  { V: '7,368', I: ['3,316 A', '−1,842 A', '1,474 A'], a: [3.316, -1.842, 1.474] },
  { V: '2,895', I: ['−1,447 A', '2,026 A', '0,579 A'], a: [-1.447, 2.026, 0.579] },
]
const mode = ref(0)
const s = computed(() => data[mode.value])
const arus = computed(() => s.value.a)
// Arah positif: I1 naik di kiri lalu ke simpul; I2 naik di kanan lalu ke simpul; I3 turun di tengah.
const cab = [
  { d: 'M55 118 V30 H158', naik: true },
  { d: 'M275 118 V30 H172', naik: true },
  { d: 'M165 38 V118', naik: false },
]
const gaya = (I) => {
  const v = Math.abs(I)
  return {
    animationDuration: `${(2.4 / Math.max(v, 0.15)).toFixed(2)}s`,
    animationDirection: I < 0 ? 'reverse' : 'normal',
    opacity: v < 0.3 ? 0.45 : 1,
  }
}
</script>

<style scoped>
.nf-svg { width: 100%; height: auto; display: block; }
.nf-w { fill: none; stroke: #475569; stroke-width: 3; }
.nf-f { fill: none; stroke: #38bdf8; stroke-width: 3; stroke-dasharray: 3 11; stroke-linecap: round; animation: nf-run linear infinite; }
@keyframes nf-run { to { stroke-dashoffset: -14; } }
.nf-src { fill: #060c18; stroke: #a78bfa; stroke-width: 2; transition: all .3s; }
.nf-src.off { stroke: #334155; stroke-dasharray: 3 3; }
.nf-r { fill: #0d1526; stroke: #34d399; stroke-width: 2; }
.nf-node { filter: drop-shadow(0 0 8px #fbbf24); }
.nf-t { font-size: 10.5px; fill: #e2e8f0; font-family: 'Fira Code', ui-monospace, monospace; font-weight: 700; }
.nf-ctl { display: flex; gap: 5px; justify-content: center; margin-top: 4px; }
</style>
