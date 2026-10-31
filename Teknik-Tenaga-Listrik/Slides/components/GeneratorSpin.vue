<!--
  GeneratorSpin.vue — Rotor p kutub berputar n rpm; gelombang tegangan di kanan
  (Modul 1, Persamaan 7). Putaran digambar diperlambat: 3000 rpm = 0,5 putaran/detik.
  Pada putaran sinkron gelombang selalu sama cepat (50 Hz), berapa pun jumlah kutubnya.
-->
<template>
  <div class="anim-card gs">
    <svg viewBox="0 0 330 120" class="gs-svg" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="52" fill="#060c18" stroke="#334155" stroke-width="6" />
      <g :transform="`rotate(${angle} 60 60)`">
        <path v-for="k in p" :key="k" :d="wedge(k - 1)" :fill="k % 2 ? '#fb7185' : '#38bdf8'" opacity=".85" />
        <circle cx="60" cy="60" r="7" fill="#0d1526" stroke="#94a3b8" />
      </g>
      <rect x="52" y="2" width="16" height="7" rx="2" fill="#fbbf24" />
      <text x="60" y="118" class="gs-ax" text-anchor="middle">kumparan stator ▲</text>
      <line x1="125" y1="60" x2="325" y2="60" stroke="#1e293b" />
      <path :d="wave" fill="none" stroke="#fbbf24" stroke-width="2.2" />
      <text x="325" y="14" class="gs-ax" text-anchor="end" :fill="ok ? '#34d399' : '#fb7185'">f = {{ fx(f, 1) }} Hz</text>
    </svg>
    <div class="gs-ctl">
      <button v-for="o in [2, 4, 40]" :key="o" :class="{ on: p === o }" @click="pilih(o)">{{ o }} kutub</button>
      <label>n <input type="range" :min="nSync * 0.9" :max="nSync * 1.1" :step="nSync / 200" v-model.number="n" /> <b>{{ Math.round(n) }} rpm</b></label>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
const fx = (v, d) => v.toFixed(d).replace('.', ',')
const p = ref(4)
const nSync = computed(() => 6000 / p.value)
const n = ref(1500)
const f = computed(() => (p.value * n.value) / 120)
const ok = computed(() => Math.abs(f.value - 50) <= 0.5)
function pilih(o) { p.value = o; n.value = 6000 / o }
const wedge = (k) => {
  const a0 = (k / p.value) * 2 * Math.PI, a1 = ((k + 1) / p.value) * 2 * Math.PI
  const pt = (a) => `${60 + 44 * Math.sin(a)},${60 - 44 * Math.cos(a)}`
  return `M60,60 L${pt(a0)} A44,44 0 0 1 ${pt(a1)} Z`
}
const angle = ref(0)
const phase = ref(0)
let raf, t0
function step(t) {
  if (t0 != null) {
    const dt = (t - t0) / 1000
    const rev = (n.value / 3000) * 0.5 * dt
    angle.value = (angle.value + rev * 360) % 360
    phase.value += rev * (p.value / 2) * 2 * Math.PI
  }
  t0 = t
  raf = requestAnimationFrame(step)
}
// Gelombang menggeser ke kanan: titik x lebih jauh = tegangan yang lebih lampau.
const wave = computed(() => {
  const pts = []
  for (let x = 0; x <= 200; x += 4) pts.push(`${125 + x},${(60 - 40 * Math.sin(phase.value - x * 0.06)).toFixed(1)}`)
  return 'M' + pts.join(' L')
})
onMounted(() => { raf = requestAnimationFrame(step) })
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<style scoped>
.gs-svg { width: 100%; height: auto; display: block; }
.gs-ax { font-size: 10px; fill: #94a3b8; font-family: 'Fira Code', ui-monospace, monospace; font-weight: 700; }
.gs-ctl { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; font-size: 11px; color: #cbd5e1; margin-top: 4px; }
.gs-ctl label { display: flex; align-items: center; gap: 5px; margin-left: auto; }
.gs-ctl input { width: 90px; accent-color: #fbbf24; }
.gs-ctl b { font-family: 'Fira Code', ui-monospace, monospace; color: #fde68a; min-width: 62px; }
</style>
