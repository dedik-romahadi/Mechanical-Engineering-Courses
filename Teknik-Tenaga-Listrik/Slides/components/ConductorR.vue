<!--
  ConductorR.vue — Resistansi penghantar R = ρ·L/A (Modul 2, Persamaan 8).
  Kawat makin panjang → R naik; makin tebal → R turun. Warna kawat = panasnya
  pada arus 200 A (rugi I²R). Titik bergerak = elektron (arus).
-->
<template>
  <div class="anim-card cr">
    <svg viewBox="0 0 330 74" class="cr-svg" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" :y="37 - tebal / 2" :width="panjang" :height="tebal" rx="4" :fill="warna" class="cr-wire" />
      <line x1="12" y1="37" :x2="8 + panjang" y2="37" class="cr-flow" stroke="#f8fafc" stroke-width="2.4" stroke-linecap="round" />
      <text x="10" y="10" class="cr-ax">L = {{ L }} km</text>
      <text :x="10 + panjang" y="70" class="cr-ax" text-anchor="end">A = {{ A }} mm²</text>
    </svg>
    <div class="cr-ctl">
      <label>L <input type="range" min="2" max="24" step="1" v-model.number="L" /></label>
      <label>A <input type="range" min="50" max="400" step="10" v-model.number="A" /></label>
    </div>
    <div class="cr-read">
      <span>R = ρ·L/A <b>{{ fx(R, 2) }} Ω</b></span>
      <span>rugi pada 200 A <b>{{ fx(rugi, 1) }} kW</b></span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const fx = (v, d) => v.toFixed(d).replace('.', ',')
const rho = 0.0282 // Ω·mm²/m (aluminium)
const L = ref(12)
const A = ref(240)
const R = computed(() => (rho * L.value * 1000) / A.value)
const rugi = computed(() => (200 ** 2 * R.value) / 1000)
const panjang = computed(() => 60 + (L.value / 24) * 250)
const tebal = computed(() => 6 + (A.value / 400) * 22)
// 0 kW → biru dingin, ≥ 300 kW → merah panas.
const warna = computed(() => {
  const k = Math.min(rugi.value / 300, 1)
  return `rgb(${Math.round(56 + k * 195)},${Math.round(189 - k * 76)},${Math.round(248 - k * 115)})`
})
</script>

<style scoped>
.cr-svg { width: 100%; height: auto; display: block; }
.cr-wire { transition: fill .3s; filter: drop-shadow(0 0 6px rgba(251,113,133,.25)); }
.cr-flow { stroke-dasharray: 2 12; animation: cr-run .8s linear infinite; opacity: .85; }
@keyframes cr-run { to { stroke-dashoffset: -14; } }
.cr-ax { font-size: 10px; fill: #94a3b8; font-family: 'Fira Code', ui-monospace, monospace; font-weight: 700; }
.cr-ctl { display: flex; gap: 12px; font-size: 11px; color: #cbd5e1; }
.cr-ctl label { flex: 1; display: flex; align-items: center; gap: 6px; }
.cr-ctl input { width: 100%; accent-color: #fbbf24; }
.cr-read { display: flex; justify-content: space-between; font-size: 11.5px; color: #94a3b8; margin-top: 3px; }
.cr-read b { color: #fde68a; font-family: 'Fira Code', ui-monospace, monospace; }
</style>
