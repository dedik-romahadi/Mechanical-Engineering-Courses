<!--
  TheveninMorph.vue — Langkah Thevenin (Modul 4, Gambar 5): jaringan 24 V dengan
  pembagi 8 Ω/8 Ω dan seri 2 Ω "menyusut" menjadi satu sumber 12 V + 6 Ω.
  Berjalan otomatis per langkah; klik titik langkah untuk berhenti di sana.
-->
<template>
  <div class="anim-card tv">
    <svg viewBox="0 0 330 130" class="tv-svg" xmlns="http://www.w3.org/2000/svg">
      <!-- jaringan asli -->
      <g class="tv-g" :opacity="step < 4 ? 1 : 0.08">
        <path d="M30 105 V25 H150 V105 H30 M150 25 H260 M150 105 H260" class="tv-w" />
        <circle cx="30" cy="65" r="13" class="tv-src" :class="{ off: step === 3 }" />
        <text x="30" y="69" class="tv-t" text-anchor="middle">{{ step === 3 ? '—' : '24V' }}</text>
        <rect x="70" y="17" width="34" height="16" rx="3" class="tv-r" /><text x="87" y="29" class="tv-t" text-anchor="middle">8Ω</text>
        <rect x="142" y="48" width="16" height="34" rx="3" class="tv-r" /><text x="164" y="68" class="tv-t">8Ω</text>
        <rect x="190" y="17" width="34" height="16" rx="3" class="tv-r" /><text x="207" y="29" class="tv-t" text-anchor="middle">2Ω</text>
        <path v-if="step === 3" d="M30 52 V78" stroke="#34d399" stroke-width="3" />
      </g>
      <!-- ekuivalen -->
      <g class="tv-g" :opacity="step === 4 ? 1 : 0">
        <path d="M90 105 V25 H260 M90 105 H260" class="tv-w" />
        <circle cx="90" cy="65" r="15" class="tv-src" /><text x="90" y="69" class="tv-t" text-anchor="middle" fill="#fde68a">12V</text>
        <rect x="160" y="17" width="40" height="16" rx="3" class="tv-r hot" /><text x="180" y="29" class="tv-t" text-anchor="middle" fill="#6ee7b7">6Ω</text>
      </g>
      <circle cx="262" cy="25" r="4" fill="#f8fafc" /><circle cx="262" cy="105" r="4" fill="#f8fafc" />
      <text x="270" y="29" class="tv-t">a</text><text x="270" y="109" class="tv-t">b</text>
      <g v-if="step === 2"><path d="M262 32 V98" class="tv-meas" /><text x="318" y="69" class="tv-t" text-anchor="end" fill="#fde68a">12 V</text></g>
      <g v-if="step === 3"><text x="318" y="69" class="tv-t" text-anchor="end" fill="#6ee7b7">4+2 = 6 Ω</text></g>
    </svg>
    <div class="tv-steps">
      <span v-for="(s, i) in langkah" :key="i" :class="{ on: step === i + 1 }" @click="pilih(i + 1)">{{ i + 1 }}. {{ s }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
const langkah = ['jaringan asli', 'buka a–b: V_th', 'sumber mati: R_th', 'ekuivalen']
const step = ref(1)
let tm
const mulai = () => { tm = setInterval(() => { step.value = (step.value % 4) + 1 }, 2600) }
function pilih(i) { clearInterval(tm); step.value = i }
onMounted(mulai)
onBeforeUnmount(() => clearInterval(tm))
</script>

<style scoped>
.tv-svg { width: 100%; height: auto; display: block; }
.tv-g { transition: opacity .7s; }
.tv-w { fill: none; stroke: #475569; stroke-width: 3; }
.tv-src { fill: #060c18; stroke: #a78bfa; stroke-width: 2; }
.tv-src.off { stroke: #334155; }
.tv-r { fill: #0d1526; stroke: #94a3b8; stroke-width: 2; }
.tv-r.hot { stroke: #34d399; filter: drop-shadow(0 0 6px #34d399); }
.tv-meas { stroke: #fbbf24; stroke-width: 2; stroke-dasharray: 4 4; animation: tv-run .8s linear infinite; }
@keyframes tv-run { to { stroke-dashoffset: -8; } }
.tv-t { font-size: 10.5px; fill: #e2e8f0; font-family: 'Fira Code', ui-monospace, monospace; font-weight: 700; }
.tv-steps { display: flex; gap: 4px; margin-top: 4px; }
.tv-steps span { flex: 1; text-align: center; font-size: 10px; color: #64748b; background: #060c18; border-radius: 6px; padding: 3px 2px; cursor: pointer; transition: all .3s; }
.tv-steps span.on { color: #0b1020; background: #34d399; font-weight: 700; }
</style>
