<!--
  SurgeWave.vue — Gelombang berjalan di titik sambungan (Modul 6, Persamaan 10).
  Surja 200 kV dari saluran Z1 menuju Z2: hitung ρ, τ, lalu animasikan pantul/terus.
-->
<template>
  <div class="sw">
    <svg class="sw-svg" viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="86" width="170" height="8" rx="3" fill="#1e293b" />
      <rect x="180" y="86" width="170" height="8" rx="3" :fill="z2Color" />
      <line x1="180" y1="6" x2="180" y2="128" stroke="#fbbf24" stroke-dasharray="4 3" />
      <text x="95" y="140" class="sw-ax" text-anchor="middle">Z₁ = {{ Z1 }} Ω</text>
      <text x="265" y="140" class="sw-ax" text-anchor="middle">Z₂ = {{ Z2label }}</text>
      <text x="180" y="154" class="sw-ax" text-anchor="middle" fill="#fde68a">titik sambungan</text>
      <!-- skala: 200 kV = 35 px di atas/bawah garis dasar y = 86 -->
      <g v-if="phase === 0">
        <rect :x="10 + pos * 1.7 - 40" :y="barY(200)" width="40" :height="h(200)" fill="rgba(56,189,248,.55)" />
        <text :x="10 + pos * 1.7 - 20" y="12" class="sw-ax" text-anchor="middle" fill="#38bdf8">datang 200 kV</text>
      </g>
      <g v-else>
        <rect :x="180 - pos * 1.7" :y="barY(Vr)" width="40" :height="h(Vr)" fill="rgba(251,113,133,.55)" />
        <text :x="200 - pos * 1.7" y="12" class="sw-ax" text-anchor="middle" fill="#fb7185">{{ fx(Vr, 1) }} kV</text>
        <rect :x="180 + pos * 1.7 - 40" :y="barY(Vt)" width="40" :height="h(Vt)" fill="rgba(52,211,153,.55)" />
        <text :x="160 + pos * 1.7" y="12" class="sw-ax" text-anchor="middle" fill="#34d399">{{ fx(Vt, 1) }} kV</text>
      </g>
    </svg>
    <div class="sw-side">
      <div class="sw-btns">
        <button v-for="o in opts" :key="o.lb" :class="{ on: o.z === Z2 }" @click="Z2 = o.z">{{ o.lb }}</button>
      </div>
      <div class="sw-read">
        <div><span>ρ = (Z₂−Z₁)/(Z₁+Z₂)</span><b>{{ fx(rho, 3) }}</b></div>
        <div><span>τ = 1 + ρ</span><b>{{ fx(tau, 3) }}</b></div>
        <div><span>diteruskan / dipantulkan</span><b>{{ fx(Vt, 1) }} / {{ fx(Vr, 1) }} kV</b></div>
      </div>
      <div class="sw-note">Ujung terbuka: tegangan berlipat dua. Masuk kabel (Z kecil): surja mengecil.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
// Angka tampil dengan koma desimal (gaya Indonesia).
const fx = (v, d) => v.toFixed(d).replace('.', ',')
const Z1 = 400
const opts = [
  { lb: 'Kabel 50 Ω', z: 50 },
  { lb: 'Saluran sama', z: 400 },
  { lb: 'Trafo 2000 Ω', z: 2000 },
  { lb: 'Ujung terbuka', z: Infinity },
  { lb: 'Hubung singkat', z: 0 },
]
const Z2 = ref(50)
const rho = computed(() => (Z2.value === Infinity ? 1 : (Z2.value - Z1) / (Z1 + Z2.value)))
const tau = computed(() => 1 + rho.value)
const Vr = computed(() => rho.value * 200)
const Vt = computed(() => tau.value * 200)
const Z2label = computed(() => (Z2.value === Infinity ? '∞ (terbuka)' : `${Z2.value} Ω`))
const z2Color = computed(() => (Z2.value === Infinity ? '#0b1020' : Z2.value < Z1 ? '#334155' : '#3b2f5c'))
const h = (v) => (Math.abs(v) / 200) * 35
const barY = (v) => (v >= 0 ? 86 - h(v) : 94)
// Fase 0: surja datang (pos 0→100); fase 1: pantul & teruskan (pos 0→100).
const pos = ref(0)
const phase = ref(0)
let raf
function step() {
  pos.value += 0.9
  if (pos.value > 100) { pos.value = 0; phase.value = 1 - phase.value }
  raf = requestAnimationFrame(step)
}
onMounted(() => { raf = requestAnimationFrame(step) })
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<style scoped>
.sw { display: flex; gap: 14px; align-items: center; background: #0d1526; border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 10px 14px; }
.sw-svg { width: 370px; height: auto; flex: none; overflow: hidden; }
.sw-ax { font-size: 9.5px; fill: #94a3b8; font-family: 'Fira Code', ui-monospace, monospace; }
.sw-side { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.sw-btns { display: flex; flex-wrap: wrap; gap: 4px; }
.sw-btns button { font-size: 11px; padding: 3px 8px; border-radius: 999px; border: 1px solid rgba(167,139,250,.35); color: #cbd5e1; background: #060c18; cursor: pointer; }
.sw-btns button.on { background: rgba(167,139,250,.22); color: #f8fafc; border-color: #a78bfa; }
.sw-read { display: grid; gap: 3px; }
.sw-read div { display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; background: #060c18; border-radius: 6px; padding: 3px 9px; }
.sw-read b { color: #fbbf24; font-family: 'Fira Code', ui-monospace, monospace; }
.sw-note { font-size: 11px; color: #64748b; line-height: 1.35; }
</style>
