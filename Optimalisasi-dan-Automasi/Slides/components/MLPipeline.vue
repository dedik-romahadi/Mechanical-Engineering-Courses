<!--
  MLPipeline.vue — Pipeline alur kerja Machine Learning yang interaktif.
  5 tahap: Sinyal Getaran → Ekstraksi Fitur → Latih Model → Model Terlatih → Prediksi.
  Klik kartu untuk memilih tahap; detail muncul di panel bawah.
  100% self-contained: hanya impor dari 'vue'.
-->
<template>
  <div class="mlp">
    <!-- Baris kartu tahap + konektor -->
    <div class="mlp-row">
      <template v-for="(s, i) in stages" :key="s.id">
        <button
          class="mlp-card"
          :class="{ 'is-active': selected === i }"
          :style="cardStyle(i)"
          type="button"
          :aria-pressed="selected === i"
          @click="selected = i"
        >
          <span class="mlp-step">{{ i + 1 }}</span>
          <span class="mlp-ico">{{ s.ico }}</span>
          <span class="mlp-label">{{ s.label }}</span>
        </button>

        <!-- Konektor beranimasi antar kartu (tidak setelah kartu terakhir) -->
        <div v-if="i < stages.length - 1" class="mlp-link" :style="linkStyle(i)">
          <span class="mlp-track"></span>
          <span class="mlp-dot"></span>
          <span class="mlp-arrow">▶</span>
        </div>
      </template>
    </div>

    <!-- Panel detail tahap terpilih -->
    <div class="mlp-detail" :style="detailStyle">
      <div class="mlp-detail-head">
        <span class="mlp-detail-ico">{{ active.ico }}</span>
        <span class="mlp-detail-title" :style="{ color: active.color }">
          {{ selected + 1 }}. {{ active.label }}
        </span>
        <span class="mlp-detail-tag" :style="tagStyle">{{ active.tag }}</span>
      </div>
      <p class="mlp-detail-body">{{ active.desc }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const stages = [
  {
    id: 'sinyal',
    label: 'Sinyal Getaran',
    ico: '📈',
    color: '#a78bfa',
    tag: 'Data Mentah',
    desc: 'Sensor akselerometer merekam getaran mesin sebagai sinyal domain-waktu. Ini adalah data mentah — kaya informasi tapi belum bisa langsung dipakai model.',
  },
  {
    id: 'fitur',
    label: 'Ekstraksi Fitur',
    ico: '🧮',
    color: '#38bdf8',
    tag: 'Feature Engineering',
    desc: "Sinyal diringkas jadi angka-angka bermakna: RMS (energi), Kurtosis (ketajaman impuls), Crest Factor, dan puncak FFT. Fitur inilah 'bahasa' yang dimengerti model.",
  },
  {
    id: 'latih',
    label: 'Latih Model',
    ico: '🎓',
    color: '#fbbf24',
    tag: 'Training',
    desc: 'Model belajar dari contoh berlabel (sehat/rusak). Data dibagi train/test agar performa diukur jujur pada data yang belum pernah dilihat.',
  },
  {
    id: 'model',
    label: 'Model Terlatih',
    ico: '🧠',
    color: '#34d399',
    tag: 'Fitted Model',
    desc: 'Hasil pelatihan: sebuah fungsi yang memetakan fitur → kelas. Siap dipakai untuk menilai mesin baru secara otomatis.',
  },
  {
    id: 'prediksi',
    label: 'Prediksi',
    ico: '🚦',
    color: '#fb7185',
    tag: 'Inference',
    desc: 'Mesin baru → ekstrak fitur → model memberi keputusan: Sehat atau Rusak, lengkap dengan tingkat keyakinan. Dasar untuk predictive maintenance.',
  },
]

const selected = ref(0)
const active = computed(() => stages[selected.value])

// Konversi hex → rgba untuk glow/aksen transparan.
function rgba(hex, a) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

function cardStyle(i) {
  const s = stages[i]
  if (selected.value === i) {
    return {
      borderColor: s.color,
      boxShadow: `0 0 0 1px ${rgba(s.color, 0.3)}, 0 6px 22px ${rgba(s.color, 0.22)}`,
      '--accent': s.color,
    }
  }
  return { '--accent': s.color }
}

// Konektor mengambil warna tahap di sebelah kirinya (sumber data).
function linkStyle(i) {
  return { '--flow': stages[i].color }
}

const detailStyle = computed(() => ({
  borderColor: rgba(active.value.color, 0.35),
  boxShadow: `inset 0 0 0 1px ${rgba(active.value.color, 0.1)}`,
}))

const tagStyle = computed(() => ({
  color: active.value.color,
  borderColor: rgba(active.value.color, 0.4),
  background: rgba(active.value.color, 0.1),
}))
</script>

<style scoped>
.mlp {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #0d1526;
  padding: 14px;
  color: #cbd5e1;
  font-family: 'Fira Code', ui-monospace, monospace;
}

/* ---- Baris kartu ---- */
.mlp-row {
  display: flex;
  align-items: stretch;
  gap: 0;
}

.mlp-card {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  position: relative;
  padding: 12px 6px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #060c18;
  color: #cbd5e1;
  cursor: pointer;
  opacity: 0.62;
  transition: transform 0.18s ease, opacity 0.18s ease,
    border-color 0.18s ease, box-shadow 0.18s ease;
}
.mlp-card:hover {
  transform: translateY(-3px);
  opacity: 1;
  border-color: var(--accent);
}
.mlp-card.is-active {
  opacity: 1;
}

.mlp-step {
  position: absolute;
  top: 5px;
  left: 6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9.5px;
  font-weight: 700;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.06);
  transition: color 0.18s ease, background 0.18s ease;
}
.mlp-card.is-active .mlp-step {
  color: #030712;
  background: var(--accent);
}

.mlp-ico {
  font-size: 26px;
  line-height: 1;
  filter: grayscale(0.55);
  opacity: 0.7;
  transition: filter 0.18s ease, opacity 0.18s ease, transform 0.18s ease;
}
.mlp-card:hover .mlp-ico,
.mlp-card.is-active .mlp-ico {
  filter: grayscale(0);
  opacity: 1;
  transform: scale(1.06);
}

.mlp-label {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  color: #94a3b8;
  transition: color 0.18s ease;
}
.mlp-card.is-active .mlp-label {
  color: var(--accent);
}

/* ---- Konektor beranimasi ---- */
.mlp-link {
  flex: 0 0 30px;
  align-self: center;
  position: relative;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mlp-track {
  position: absolute;
  left: 1px;
  right: 8px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06),
    var(--flow),
    rgba(255, 255, 255, 0.06)
  );
  opacity: 0.5;
}
.mlp-dot {
  position: absolute;
  left: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--flow);
  box-shadow: 0 0 7px var(--flow);
  animation: mlp-flow 1.9s linear infinite;
}
.mlp-arrow {
  position: absolute;
  right: -2px;
  font-size: 9px;
  line-height: 1;
  color: var(--flow);
  opacity: 0.85;
}
@keyframes mlp-flow {
  0% {
    left: 1px;
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    left: calc(100% - 14px);
    opacity: 0;
  }
}

/* ---- Panel detail ---- */
.mlp-detail {
  margin-top: 12px;
  padding: 11px 13px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #060c18;
  transition: border-color 0.22s ease, box-shadow 0.22s ease;
}
.mlp-detail-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}
.mlp-detail-ico {
  font-size: 16px;
  line-height: 1;
}
.mlp-detail-title {
  font-size: 13px;
  font-weight: 700;
}
.mlp-detail-tag {
  margin-left: auto;
  font-size: 9.5px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
  border: 1px solid transparent;
  white-space: nowrap;
}
.mlp-detail-body {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #cbd5e1;
}

@media (prefers-reduced-motion: reduce) {
  .mlp-dot {
    animation: none;
    left: 50%;
  }
}
</style>
