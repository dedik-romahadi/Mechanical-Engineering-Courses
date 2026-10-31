<!--
  MaxPower.vue — Transfer daya maksimum (Modul 3, Persamaan 9; Modul 4, Persamaan 8).
  Sumber E = 24 V dengan hambatan dalam r; geser R_L dan amati P_L serta η.
-->
<template>
  <div class="mp">
    <svg class="mp-svg" viewBox="0 0 360 190" xmlns="http://www.w3.org/2000/svg">
      <line x1="40" y1="160" x2="350" y2="160" stroke="#334155" />
      <line x1="40" y1="10" x2="40" y2="160" stroke="#334155" />
      <g v-for="t in [0.5, 1, 2, 3, 4]" :key="t">
        <line :x1="xOf(t)" y1="160" :x2="xOf(t)" y2="164" stroke="#64748b" />
        <text :x="xOf(t)" y="176" class="mp-ax" text-anchor="middle">{{ t }}r</text>
      </g>
      <text x="196" y="188" class="mp-ax" text-anchor="middle">resistansi beban (kelipatan r)</text>
      <path :d="curveP" fill="none" stroke="#a78bfa" stroke-width="2.4" />
      <path :d="curveE" fill="none" stroke="#34d399" stroke-width="2" stroke-dasharray="6 4" />
      <text x="300" y="30" class="mp-ax" fill="#a78bfa">P beban</text>
      <text x="300" :y="yE(4 * r) - 6" class="mp-ax" fill="#34d399">η</text>
      <line :x1="xOf(RL / r)" y1="12" :x2="xOf(RL / r)" y2="160" stroke="#fbbf24" stroke-dasharray="4 3" />
      <circle :cx="xOf(RL / r)" :cy="yP(RL)" r="5.5" fill="#fbbf24" class="mp-dot" />
    </svg>
    <div class="mp-side">
      <label class="mp-row"><span>R<sub>L</sub> (Ω)</span>
        <input type="range" min="0.1" max="4" step="0.05" v-model.number="RL" /><b>{{ fx(RL, 2) }}</b></label>
      <div class="mp-read">
        <div><span>I = E/(r+R<sub>L</sub>)</span><b>{{ fx(I, 2) }} A</b></div>
        <div><span>P<sub>L</sub></span><b>{{ fx(PL, 1) }} W</b></div>
        <div><span>η = R<sub>L</sub>/(r+R<sub>L</sub>)</span><b>{{ fx((eta * 100), 1) }} %</b></div>
      </div>
      <div class="mp-note">E = 24 V, r = 1 Ω → P<sub>L,maks</sub> = E²/4r = 144 W tepat saat R<sub>L</sub> = r, tetapi η hanya 50%.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
// Angka tampil dengan koma desimal (gaya Indonesia).
const fx = (v, d) => v.toFixed(d).replace('.', ',')
const E = 24, r = 1
const RL = ref(1)
const Pmax = (E * E) / (4 * r)
const pAt = (R) => (E * E * R) / (r + R) ** 2
const xOf = (k) => 40 + ((k - 0.1) / 4.0) * 310
const yP = (R) => 160 - (pAt(R) / Pmax) * 140
const yE = (R) => 160 - (R / (r + R)) * 140
const I = computed(() => E / (r + RL.value))
const PL = computed(() => pAt(RL.value))
const eta = computed(() => RL.value / (r + RL.value))
const path = (fn) => {
  const pts = []
  for (let R = 0.1; R <= 4.1001; R += 0.05) pts.push(`${xOf(R / r).toFixed(1)},${fn(R).toFixed(1)}`)
  return 'M' + pts.join(' L')
}
const curveP = computed(() => path(yP))
const curveE = computed(() => path(yE))
</script>

<style scoped>
.mp { display: flex; gap: 14px; align-items: center; background: #0d1526; border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 10px 14px; }
.mp-svg { width: 370px; height: auto; flex: none; }
.mp-ax { font-size: 9.5px; fill: #94a3b8; font-family: 'Fira Code', ui-monospace, monospace; }
.mp-dot { filter: drop-shadow(0 0 6px #fbbf24); }
.mp-side { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.mp-row { display: grid; grid-template-columns: 52px 1fr 36px; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1; }
.mp-row b { color: #f8fafc; font-family: 'Fira Code', ui-monospace, monospace; text-align: right; }
.mp-row input { accent-color: #a78bfa; width: 100%; }
.mp-read { display: grid; gap: 3px; margin-top: 4px; }
.mp-read div { display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; background: #060c18; border-radius: 6px; padding: 3px 9px; }
.mp-read b { color: #a78bfa; font-family: 'Fira Code', ui-monospace, monospace; }
.mp-note { font-size: 11px; color: #64748b; line-height: 1.35; }
</style>
