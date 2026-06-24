<!--
  Quiz.vue — Soal pilihan ganda interaktif.
-->
<template>
  <div class="quiz">
    <div class="quiz-head">
      <span class="quiz-no" v-if="n">{{ n }}</span>
      <span class="quiz-q" v-html="q"></span>
    </div>
    <div class="quiz-opts">
      <button v-for="(opt, i) in options" :key="i" class="quiz-opt" :class="stateOf(i)" @click="pick(i)">
        <span class="quiz-key">{{ letters[i] }}</span>
        <span class="quiz-text" v-html="opt"></span>
        <span class="quiz-mark" v-if="revealed && i === answer">✓</span>
        <span class="quiz-mark wrong" v-else-if="revealed && i === selected">✗</span>
      </button>
    </div>
    <transition name="quiz-fade">
      <div v-if="revealed" class="quiz-feedback" :class="correct ? 'ok' : 'no'">
        <div class="quiz-verdict">
          {{ correct ? '✓ Tepat!' : '✗ Belum tepat' }}
          <span class="quiz-ans" v-if="!correct">— Jawaban: <b>{{ letters[answer] }}</b></span>
        </div>
        <div class="quiz-explain" v-if="explain" v-html="explain"></div>
        <button class="quiz-retry" @click="reset">Coba lagi ↺</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  q: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  answer: { type: Number, default: 0 },
  explain: { type: String, default: '' },
  n: { type: [Number, String], default: null },
})
const letters = ['A', 'B', 'C', 'D', 'E', 'F']
const selected = ref(null)
const revealed = ref(false)
const correct = computed(() => selected.value === props.answer)
function pick(i) { if (revealed.value) return; selected.value = i; revealed.value = true }
function reset() { selected.value = null; revealed.value = false }
function stateOf(i) {
  if (!revealed.value) return ''
  if (i === props.answer) return 'is-correct'
  if (i === selected.value) return 'is-wrong'
  return 'is-dim'
}
</script>

<style scoped>
.quiz {
  border: 1px solid rgba(255,255,255,.08);
  border-left: 3px solid #a78bfa;
  border-radius: 0 8px 8px 0;
  background: #0d1526;
  padding: 8px 12px;
  margin: 5px 0;
  color: #f1f5f9;
  transition: border-color 0.22s ease, box-shadow 0.22s ease;
}
.quiz:hover { border-color: rgba(167,139,250,0.5); box-shadow: 0 0 0 1px rgba(167,139,250,0.15), 0 6px 24px rgba(167,139,250,0.12); }
.quiz-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 7px; }
.quiz-no {
  flex: none; display: inline-flex; align-items: center; justify-content: center;
  width: 19px; height: 19px; border-radius: 50%;
  background: #a78bfa; color: #030712; font-weight: 700; font-size: 11px;
}
.quiz-q { font-size: 12.5px; font-weight: 600; line-height: 1.32; }
.quiz-opts { display: flex; flex-direction: column; gap: 5px; }
.quiz-opt {
  display: flex; align-items: center; gap: 9px;
  text-align: left; width: 100%;
  padding: 5px 9px; border-radius: 6px;
  border: 1px solid rgba(255,255,255,.1); background: #060c18;
  color: #cbd5e1; font-size: 11.5px; cursor: pointer;
  transition: all 0.15s ease;
}
.quiz-opt:hover { border-color: #a78bfa; background: #0d1526; }
.quiz-key {
  flex: none; width: 17px; height: 17px; border-radius: 4px;
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(124,77,255,.2); color: #a78bfa; font-weight: 700; font-size: 10.5px;
}
.quiz-text { flex: 1; }
.quiz-mark { font-weight: 800; color: #34d399; }
.quiz-mark.wrong { color: #fb7185; }
.quiz-opt.is-correct { border-color: #34d399; background: rgba(52,211,153,0.1); }
.quiz-opt.is-correct .quiz-key { background: #34d399; color: #030712; }
.quiz-opt.is-wrong { border-color: #fb7185; background: rgba(251,113,133,0.1); }
.quiz-opt.is-wrong .quiz-key { background: #fb7185; color: #030712; }
.quiz-opt.is-dim { opacity: 0.5; }
.quiz-feedback { margin-top: 12px; padding: 10px 12px; border-radius: 6px; font-size: 14px; }
.quiz-feedback.ok { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.35); }
.quiz-feedback.no { background: rgba(251,113,133,0.1); border: 1px solid rgba(251,113,133,0.35); }
.quiz-verdict { font-weight: 700; margin-bottom: 4px; }
.quiz-ans { font-weight: 500; }
.quiz-explain { color: #94a3b8; line-height: 1.45; }
.quiz-retry {
  margin-top: 8px; font-size: 12px; color: #a78bfa;
  background: transparent; border: 1px solid #a78bfa;
  border-radius: 4px; padding: 3px 10px; cursor: pointer;
}
.quiz-retry:hover { background: #a78bfa; color: #030712; }
.quiz-fade-enter-active { transition: all 0.25s ease; }
.quiz-fade-enter-from { opacity: 0; transform: translateY(-6px); }
</style>
