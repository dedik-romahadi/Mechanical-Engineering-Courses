<!--
  PhasorDrop.vue — Diagram fasor saluran pendek (Modul 6, Persamaan 3):
  V_S = V_R + I·R + jI·X, beban 60 MW pada 132 kV, R = 15 Ω, X = 60 Ω.
  Vektor digambar berurutan (V_R → IR → jIX → V_S); geser faktor daya.
-->
<template>
  <div class="anim-card pf">
    <svg viewBox="0 0 330 140" class="pf-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="pf-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 10 5 0 10z" fill="context-stroke" /></marker>
      </defs>
      <line x1="20" y1="110" x2="320" y2="110" stroke="#1e293b" />
      <line :key="'r' + k" x1="20" y1="110" :x2="p.vr[0]" :y2="p.vr[1]" class="pf-v d1" stroke="#38bdf8" marker-end="url(#pf-ar)" />
      <line :key="'i' + k" x1="20" y1="110" :x2="p.i[0]" :y2="p.i[1]" class="pf-v d1" stroke="#64748b" stroke-dasharray="4 3" />
      <line :key="'ir' + k" :x1="p.vr[0]" :y1="p.vr[1]" :x2="p.ir[0]" :y2="p.ir[1]" class="pf-v d2" stroke="#fb7185" marker-end="url(#pf-ar)" />
      <line :key="'ix' + k" :x1="p.ir[0]" :y1="p.ir[1]" :x2="p.vs[0]" :y2="p.vs[1]" class="pf-v d3" stroke="#fbbf24" marker-end="url(#pf-ar)" />
      <line :key="'s' + k" x1="20" y1="110" :x2="p.vs[0]" :y2="p.vs[1]" class="pf-v d4" stroke="#34d399" marker-end="url(#pf-ar)" />
      <text :x="p.vr[0] - 4" y="104" text-anchor="end" class="pf-t" fill="#38bdf8">V_R = 76,2 kV</text>
      <text :x="p.vs[0] - 4" :y="p.vs[1] - 6" class="pf-t" text-anchor="end" fill="#34d399">V_S</text>
      <text :x="p.ir[0] + 4" :y="(p.ir[1] + p.vs[1]) / 2" class="pf-t" fill="#fbbf24">jI·X</text>
      <text :x="p.i[0] + 6" :y="p.i[1] + 4" class="pf-t" fill="#94a3b8">I (φ = {{ fx(phiDeg, 1) }}°)</text>
      <text x="26" y="84" class="pf-t" fill="#34d399">δ = {{ fx(delta, 1) }}°</text>
    </svg>
    <div class="pf-ctl">
      <label>cos φ <input type="range" min="0.7" max="1" step="0.01" v-model.number="pfv" /> <b>{{ fx(pfv, 2) }}</b></label>
    </div>
    <div class="pf-read">
      <span>I <b>{{ fx(I, 1) }} A</b></span>
      <span>ΔV ≈ <b>{{ fx(dV, 2) }} kV/fasa</b></span>
      <span>|V_S| <b>{{ fx(VsLL, 1) }} kV</b></span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
const fx = (v, d) => v.toFixed(d).replace('.', ',')
const R = 15, X = 60, VR = 132 / Math.sqrt(3) // kV per fasa
const pfv = ref(0.9)
const k = ref(0)
watch(pfv, () => { k.value++ }) // gambar ulang berurutan setiap kali cos φ diubah
const phi = computed(() => Math.acos(pfv.value))
const phiDeg = computed(() => (phi.value * 180) / Math.PI)
const I = computed(() => 60e6 / (Math.sqrt(3) * 132e3 * pfv.value))
// I∠−φ; drop dalam kV
const dRe = computed(() => (I.value * (R * pfv.value + X * Math.sin(phi.value))) / 1000)
const dIm = computed(() => (I.value * (X * pfv.value - R * Math.sin(phi.value))) / 1000)
const dV = computed(() => dRe.value)
const Vs = computed(() => Math.hypot(VR + dRe.value, dIm.value))
const VsLL = computed(() => Vs.value * Math.sqrt(3))
const delta = computed(() => (Math.atan2(dIm.value, VR + dRe.value) * 180) / Math.PI)
const sc = 3.2 // px per kV
const p = computed(() => {
  const o = [20, 110]
  const at = (re, im) => [o[0] + re * sc, o[1] - im * sc]
  const irRe = (I.value * R * pfv.value) / 1000, irIm = -(I.value * R * Math.sin(phi.value)) / 1000
  return {
    vr: at(VR, 0),
    i: at(14 * pfv.value, -14 * Math.sin(phi.value)),
    ir: at(VR + irRe, irIm),
    vs: at(VR + dRe.value, dIm.value),
  }
})
</script>

<style scoped>
.pf-svg { width: 100%; height: auto; display: block; overflow: visible; }
.pf-v { stroke-width: 2.6; stroke-dasharray: 400; stroke-dashoffset: 400; animation: pf-draw .7s ease-out forwards; }
.pf-v.d2 { animation-delay: .6s; } .pf-v.d3 { animation-delay: 1.2s; } .pf-v.d4 { animation-delay: 1.8s; }
.pf-v[stroke-dasharray="4 3"] { stroke-dasharray: 4 3; stroke-dashoffset: 0; animation: none; stroke-width: 1.6; }
@keyframes pf-draw { to { stroke-dashoffset: 0; } }
.pf-t { font-size: 10px; fill: #e2e8f0; font-family: 'Fira Code', ui-monospace, monospace; font-weight: 700; }
.pf-ctl { font-size: 11px; color: #cbd5e1; margin-top: 2px; }
.pf-ctl label { display: flex; align-items: center; gap: 6px; }
.pf-ctl input { flex: 1; accent-color: #34d399; }
.pf-ctl b { font-family: 'Fira Code', ui-monospace, monospace; color: #f8fafc; }
.pf-read { display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; margin-top: 2px; }
.pf-read b { color: #6ee7b7; font-family: 'Fira Code', ui-monospace, monospace; }
</style>
