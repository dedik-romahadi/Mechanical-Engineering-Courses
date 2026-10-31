<!--
  MeshLoops.vue — Dua arus mesh (Modul 4, Gambar 2): E1 = 18 V, R1 = 3 Ω,
  R3 = 4 Ω (bersama), R2 = 6 Ω, E2 = 12 V. Tiap loop punya arus sendiri yang
  berputar searah jarum jam; cabang tengah dilalui selisihnya I1 − I2.
-->
<template>
  <div class="anim-card ml">
    <svg viewBox="0 0 330 150" class="ml-svg" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 20 H300 V130 H30 Z M165 20 V130" class="ml-w" />
      <!-- arus mesh berputar (searah jarum jam) -->
      <rect x="44" y="34" width="107" height="82" rx="10" class="ml-loop l1" />
      <rect x="179" y="34" width="107" height="82" rx="10" class="ml-loop l2" />
      <text x="97" y="80" class="ml-t big" text-anchor="middle" fill="#38bdf8">↻ I₁</text>
      <text x="232" y="80" class="ml-t big" text-anchor="middle" fill="#fbbf24">↻ I₂</text>
      <text x="97" y="98" class="ml-t" text-anchor="middle" fill="#7dd3fc">{{ step >= 2 ? '4,2222 A' : '?' }}</text>
      <text x="232" y="98" class="ml-t" text-anchor="middle" fill="#fde68a">{{ step >= 2 ? '2,8889 A' : '?' }}</text>
      <!-- komponen -->
      <circle cx="30" cy="75" r="13" class="ml-src" /><text x="30" y="79" class="ml-t" text-anchor="middle">18V</text>
      <circle cx="300" cy="75" r="13" class="ml-src" /><text x="300" y="79" class="ml-t" text-anchor="middle">12V</text>
      <rect x="80" y="12" width="34" height="16" rx="3" class="ml-r" /><text x="97" y="24" class="ml-t" text-anchor="middle">3Ω</text>
      <rect x="216" y="12" width="34" height="16" rx="3" class="ml-r" /><text x="233" y="24" class="ml-t" text-anchor="middle">6Ω</text>
      <rect x="157" y="58" width="16" height="34" rx="3" class="ml-r" :class="{ hot: step >= 3 }" />
      <text x="165" y="146" class="ml-t" text-anchor="middle" :fill="step >= 3 ? '#34d399' : '#94a3b8'">{{ step >= 3 ? 'R₃: I₁ − I₂ = 1,3333 A' : 'R₃ = 4 Ω (bersama)' }}</text>
    </svg>
    <div class="ml-steps">
      <span v-for="(s, i) in langkah" :key="i" :class="{ on: step === i + 1 }">{{ i + 1 }}. {{ s }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
const langkah = ['KVL tiap loop', 'selesaikan 2 persamaan', 'cabang bersama = selisih']
const step = ref(1)
let tm
onMounted(() => { tm = setInterval(() => { step.value = (step.value % 3) + 1 }, 2800) })
onBeforeUnmount(() => clearInterval(tm))
</script>

<style scoped>
.ml-svg { width: 100%; height: auto; display: block; }
.ml-w { fill: none; stroke: #475569; stroke-width: 3; }
.ml-loop { fill: none; stroke-width: 2.4; stroke-dasharray: 6 8; animation: ml-run linear infinite; }
.ml-loop.l1 { stroke: #38bdf8; animation-duration: 1s; }
.ml-loop.l2 { stroke: #fbbf24; animation-duration: 1.46s; }
@keyframes ml-run { to { stroke-dashoffset: -14; } }
.ml-src { fill: #060c18; stroke: #a78bfa; stroke-width: 2; }
.ml-r { fill: #0d1526; stroke: #94a3b8; stroke-width: 2; transition: stroke .4s; }
.ml-r.hot { stroke: #34d399; filter: drop-shadow(0 0 6px #34d399); }
.ml-t { font-size: 10px; fill: #e2e8f0; font-family: 'Fira Code', ui-monospace, monospace; font-weight: 700; }
.ml-t.big { font-size: 15px; }
.ml-steps { display: flex; gap: 4px; justify-content: space-between; margin-top: 4px; }
.ml-steps span { flex: 1; text-align: center; font-size: 10.5px; color: #64748b; background: #060c18; border-radius: 6px; padding: 3px 4px; transition: all .3s; }
.ml-steps span.on { color: #0b1020; background: #a78bfa; font-weight: 700; }
</style>
