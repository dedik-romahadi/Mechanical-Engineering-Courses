<!--
  LineModels.vue — Model saluran menurut panjang + efek Ferranti (Modul 6, Persamaan 1–2, 5).
  Saluran contoh 132 kV: x = 0,4 Ω/km, b = 3 µS/km → |A| ≈ 1 − x·b·ℓ²/2.
  Geser panjang: model berganti, jumlah "kapasitor ke tanah" bertambah, tegangan
  ujung terima tanpa beban naik di atas tegangan kirim.
-->
<template>
  <div class="anim-card lm">
    <svg viewBox="0 0 330 104" class="lm-svg" xmlns="http://www.w3.org/2000/svg">
      <line x1="20" y1="30" x2="310" y2="30" stroke="#94a3b8" stroke-width="3" />
      <line x1="20" y1="30" x2="310" y2="30" class="lm-flow" />
      <line x1="20" y1="88" x2="310" y2="88" stroke="#334155" stroke-width="2" stroke-dasharray="3 4" />
      <text x="20" y="100" class="lm-t" fill="#64748b">tanah</text>
      <g v-for="(x, i) in kapasitor" :key="i">
        <line :x1="x" y1="30" :x2="x" y2="52" stroke="#a78bfa" stroke-width="2" />
        <line :x1="x - 8" y1="54" :x2="x + 8" y2="54" stroke="#a78bfa" stroke-width="2.5" />
        <line :x1="x - 8" y1="60" :x2="x + 8" y2="60" stroke="#a78bfa" stroke-width="2.5" />
        <line :x1="x" y1="62" :x2="x" y2="88" stroke="#a78bfa" stroke-width="2" />
      </g>
      <rect x="140" y="22" width="50" height="16" rx="3" fill="#0d1526" stroke="#fbbf24" stroke-width="2" />
      <text x="165" y="34" class="lm-t" text-anchor="middle" fill="#fde68a">R + jX</text>
      <text x="20" y="18" class="lm-t">V_S</text>
      <text x="310" y="18" class="lm-t" text-anchor="end" :fill="naik > 2 ? '#fb7185' : '#e2e8f0'">V_R,nl = {{ fx(100 + naik, 1) }} % V_S</text>
    </svg>
    <div class="lm-ctl">
      <label>panjang <input type="range" min="20" max="400" step="10" v-model.number="L" /> <b>{{ L }} km</b></label>
      <span class="chip" :class="model.c">{{ model.n }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const fx = (v, d) => v.toFixed(d).replace('.', ',')
const L = ref(150)
const A = computed(() => 1 - (0.4 * 3e-6 * L.value ** 2) / 2)
const naik = computed(() => (1 / A.value - 1) * 100)
const model = computed(() =>
  L.value < 80 ? { n: 'pendek: C diabaikan', c: 's' } : L.value <= 250 ? { n: 'menengah: nominal-π', c: 'v' } : { n: 'panjang: terdistribusi', c: 'a' })
const kapasitor = computed(() => (L.value < 80 ? [] : L.value <= 250 ? [40, 290] : [40, 85, 245, 290]))
</script>

<style scoped>
.lm-svg { width: 100%; height: auto; display: block; }
.lm-flow { stroke: #38bdf8; stroke-width: 3; stroke-dasharray: 3 12; animation: lm-run .9s linear infinite; }
@keyframes lm-run { to { stroke-dashoffset: -15; } }
.lm-t { font-size: 10.5px; fill: #e2e8f0; font-family: 'Fira Code', ui-monospace, monospace; font-weight: 700; }
.lm-ctl { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #cbd5e1; margin-top: 4px; }
.lm-ctl label { flex: 1; display: flex; align-items: center; gap: 6px; }
.lm-ctl input { flex: 1; accent-color: #a78bfa; }
.lm-ctl b { font-family: 'Fira Code', ui-monospace, monospace; color: #f8fafc; min-width: 52px; }
</style>
