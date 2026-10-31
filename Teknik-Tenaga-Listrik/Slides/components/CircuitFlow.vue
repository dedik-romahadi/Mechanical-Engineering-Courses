<!--
  CircuitFlow.vue — Jaringan seri–paralel Modul 3 (Gambar 3): 48 V, R1 = 4 Ω,
  lalu 12 Ω ∥ 6 Ω. Garis putus-putus bergerak = arus; kecepatan ∝ besar arus.
  Sorotan bergantian: KCL di simpul A (6 = 2 + 4) lalu KVL di loop (48 = 24 + 24).
-->
<template>
  <div class="anim-card cf">
    <svg viewBox="0 0 330 150" class="cf-svg" xmlns="http://www.w3.org/2000/svg">
      <!-- jalur kawat -->
      <path d="M40 120 V30 H150" class="cf-w" />
      <path d="M150 30 H210 M210 30 V120 M210 30 H290 V120 M290 120 H40" class="cf-w" />
      <!-- aliran arus -->
      <path d="M40 120 V30 H200" class="cf-f" style="animation-duration: .9s" />
      <path d="M210 40 V110" class="cf-f" style="animation-duration: 2.7s" />
      <path d="M220 30 H290 V110" class="cf-f" style="animation-duration: 1.35s" />
      <path d="M285 120 H45" class="cf-f" style="animation-duration: .9s" />
      <!-- sumber -->
      <circle cx="40" cy="75" r="15" fill="#060c18" stroke="#fbbf24" stroke-width="2" />
      <text x="40" y="79" class="cf-t" text-anchor="middle" fill="#fbbf24">48 V</text>
      <!-- resistor -->
      <rect x="85" y="22" width="40" height="16" rx="3" class="cf-r" />
      <text x="105" y="34" class="cf-t" text-anchor="middle">4 Ω</text>
      <rect x="202" y="60" width="16" height="32" rx="3" class="cf-r" />
      <text x="196" y="80" class="cf-t" text-anchor="end">12 Ω</text>
      <rect x="282" y="60" width="16" height="32" rx="3" class="cf-r" />
      <text x="304" y="80" class="cf-t">6 Ω</text>
      <!-- sorotan KCL / KVL -->
      <g :opacity="mode === 0 ? 1 : 0" class="cf-hl">
        <circle cx="210" cy="30" r="9" fill="none" stroke="#34d399" stroke-width="2.5" />
        <text x="150" y="14" class="cf-t" fill="#34d399">KCL: 6 A = 2 A + 4 A</text>
        <text x="60" y="48" class="cf-t" fill="#38bdf8">I = 6 A</text>
        <text x="224" y="108" class="cf-t" fill="#38bdf8">2 A</text>
        <text x="258" y="50" class="cf-t" fill="#38bdf8">4 A</text>
      </g>
      <g :opacity="mode === 1 ? 1 : 0" class="cf-hl">
        <rect x="34" y="24" width="182" height="102" rx="8" fill="none" stroke="#a78bfa" stroke-width="2" stroke-dasharray="6 4" />
        <text x="150" y="14" class="cf-t" fill="#a78bfa">KVL: 48 V = 24 V + 24 V</text>
        <text x="105" y="52" class="cf-t" text-anchor="middle" fill="#c4b5fd">24 V</text>
        <text x="196" y="100" class="cf-t" text-anchor="end" fill="#c4b5fd">24 V</text>
      </g>
      <circle cx="210" cy="30" r="3.5" fill="#f8fafc" />
      <text x="216" y="26" class="cf-t" fill="#94a3b8">A</text>
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
const mode = ref(0)
let tm
onMounted(() => { tm = setInterval(() => { mode.value = 1 - mode.value }, 3500) })
onBeforeUnmount(() => clearInterval(tm))
</script>

<style scoped>
.cf-svg { width: 100%; height: auto; display: block; }
.cf-w { fill: none; stroke: #475569; stroke-width: 3; }
.cf-f { fill: none; stroke: #38bdf8; stroke-width: 3; stroke-dasharray: 3 11; animation: cf-run linear infinite; stroke-linecap: round; }
@keyframes cf-run { to { stroke-dashoffset: -14; } }
.cf-r { fill: #0d1526; stroke: #fbbf24; stroke-width: 2; }
.cf-t { font-size: 10.5px; fill: #e2e8f0; font-family: 'Fira Code', ui-monospace, monospace; font-weight: 700; }
.cf-hl { transition: opacity .6s; }
</style>
