<!--
  TrafoEff.vue — Efisiensi transformator terhadap beban (Modul 2, Persamaan 4–6).
  S = 630 kVA, cos φ = 0,85; geser rugi inti dan rugi tembaga beban penuh.
-->
<template>
  <div class="te">
    <svg class="te-svg" viewBox="0 0 360 190" xmlns="http://www.w3.org/2000/svg">
      <line x1="40" y1="160" x2="350" y2="160" stroke="#334155" />
      <line x1="40" y1="10" x2="40" y2="160" stroke="#334155" />
      <g v-for="t in [0.25, 0.5, 0.75, 1, 1.25]" :key="t">
        <line :x1="xOf(t)" y1="160" :x2="xOf(t)" y2="164" stroke="#64748b" />
        <text :x="xOf(t)" y="176" class="te-ax" text-anchor="middle">{{ t * 100 }}%</text>
      </g>
      <text x="196" y="188" class="te-ax" text-anchor="middle">beban x (fraksi rating)</text>
      <g v-for="e in [97, 98, 99]" :key="e">
        <line x1="40" :y1="yOf(e)" x2="350" :y2="yOf(e)" stroke="#1e293b" />
        <text x="34" :y="yOf(e) + 3" class="te-ax" text-anchor="end">{{ e }}%</text>
      </g>
      <path :d="curve" fill="none" stroke="#34d399" stroke-width="2.4" />
      <line :x1="xOf(xopt)" :y1="yOf(etaMax)" :x2="xOf(xopt)" y2="160" stroke="#fbbf24" stroke-dasharray="4 3" />
      <circle class="te-dot" :cx="xOf(xopt)" :cy="yOf(etaMax)" r="5.5" fill="#fbbf24" />
      <text :x="xOf(xopt) + 8" :y="yOf(etaMax) - 6" class="te-ax" fill="#fde68a">η maks</text>
    </svg>
    <div class="te-side">
      <label class="te-row"><span>P<sub>Fe</sub> (kW)</span>
        <input type="range" min="0.4" max="3" step="0.1" v-model.number="PFe" /><b>{{ fx(PFe, 1) }}</b></label>
      <label class="te-row"><span>P<sub>Cu</sub> (kW)</span>
        <input type="range" min="2" max="12" step="0.5" v-model.number="PCu" /><b>{{ fx(PCu, 1) }}</b></label>
      <div class="te-read">
        <div><span>x<sub>opt</sub> = √(P<sub>Fe</sub>/P<sub>Cu</sub>)</span><b>{{ fx((xopt * 100), 1) }} %</b></div>
        <div><span>η maks</span><b>{{ fx(etaMax, 2) }} %</b></div>
        <div><span>η beban penuh</span><b>{{ fx(eta(1), 2) }} %</b></div>
      </div>
      <div class="te-note">η maksimum saat rugi tembaga x²·P<sub>Cu</sub> = rugi inti P<sub>Fe</sub>.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
// Angka tampil dengan koma desimal (gaya Indonesia).
const fx = (v, d) => v.toFixed(d).replace('.', ',')
const S = 630, pf = 0.85
const PFe = ref(1.0)
const PCu = ref(6.0)
const eta = (x) => (x * S * pf) / (x * S * pf + PFe.value + x * x * PCu.value) * 100
const xOf = (x) => 40 + ((x - 0.05) / 1.25) * 310
const yOf = (e) => 160 - ((Math.max(e, 96.5) - 96.5) / 3) * 150
const xopt = computed(() => Math.sqrt(PFe.value / PCu.value))
const etaMax = computed(() => eta(xopt.value))
const curve = computed(() => {
  const pts = []
  for (let x = 0.05; x <= 1.3001; x += 0.01) pts.push(`${xOf(x).toFixed(1)},${yOf(eta(x)).toFixed(1)}`)
  return 'M' + pts.join(' L')
})
</script>

<style scoped>
.te { display: flex; gap: 14px; align-items: center; background: #0d1526; border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 10px 14px; }
.te-svg { width: 310px; height: auto; flex: none; }
.te-ax { font-size: 9.5px; fill: #94a3b8; font-family: 'Fira Code', ui-monospace, monospace; }
.te-dot { filter: drop-shadow(0 0 6px #fbbf24); }
.te-side { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.te-row { display: grid; grid-template-columns: 64px 1fr 32px; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1; }
.te-row b { color: #f8fafc; font-family: 'Fira Code', ui-monospace, monospace; text-align: right; }
.te-row input { accent-color: #34d399; width: 100%; }
.te-read { display: grid; gap: 3px; margin-top: 4px; }
.te-read div { display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; background: #060c18; border-radius: 6px; padding: 3px 9px; }
.te-read b { color: #34d399; font-family: 'Fira Code', ui-monospace, monospace; }
.te-note { font-size: 11px; color: #64748b; }
</style>
