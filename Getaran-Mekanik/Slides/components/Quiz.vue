<!--
  Quiz.vue — Soal pilihan ganda interaktif dengan kunci jawaban.
  Props:
    q        : string  — pertanyaan
    options  : array   — daftar pilihan
    answer   : number  — index (0-based) jawaban benar
    explain  : string  — pembahasan singkat (muncul setelah dijawab)
    n        : number  — nomor soal (opsional)
-->
<template>
  <div class="quiz">
    <div class="quiz-head">
      <span class="quiz-no" v-if="n">{{ n }}</span>
      <span class="quiz-q" v-html="q"></span>
    </div>

    <div class="quiz-opts">
      <button
        v-for="(opt, i) in options"
        :key="i"
        class="quiz-opt"
        :class="stateOf(i)"
        @click="pick(i)"
      >
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
          <span class="quiz-ans" v-if="!correct">
            — Jawaban: <b>{{ letters[answer] }}</b>
          </span>
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

function pick(i) {
  if (revealed.value) return
  selected.value = i
  revealed.value = true
}
function reset() {
  selected.value = null
  revealed.value = false
}
function stateOf(i) {
  if (!revealed.value) return ''
  if (i === props.answer) return 'is-correct'
  if (i === selected.value) return 'is-wrong'
  return 'is-dim'
}
</script>

<style scoped>
.quiz {
  border: 1px solid #2e2a21;
  border-left: 3px solid #c8922a;
  border-radius: 0 8px 8px 0;
  background: #1c1a14;
  padding: 8px 12px;
  margin: 5px 0;
  color: #ece7dd;
  transition: border-color 0.22s ease, box-shadow 0.22s ease;
}
.quiz:hover {
  border-color: rgba(200,146,42,0.55);
  box-shadow: 0 0 0 1px rgba(200,146,42,0.18), 0 6px 24px rgba(200,146,42,0.12);
}
.quiz-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 7px; }
.quiz-no {
  flex: none; display: inline-flex; align-items: center; justify-content: center;
  width: 19px; height: 19px; border-radius: 50%;
  background: #c8922a; color: #1a1917; font-weight: 700; font-size: 11px;
}
.quiz-q { font-size: 12.5px; font-weight: 600; line-height: 1.32; }
.quiz-opts { display: flex; flex-direction: column; gap: 5px; }
.quiz-opt {
  display: flex; align-items: center; gap: 9px;
  text-align: left; width: 100%;
  padding: 5px 9px; border-radius: 6px;
  border: 1px solid #38332a; background: #232019;
  color: #ddd8cf; font-size: 11.5px; cursor: pointer;
  transition: all 0.15s ease;
}
.quiz-opt:hover { border-color: #c8922a; background: #2a261d; }
.quiz-key {
  flex: none; width: 17px; height: 17px; border-radius: 4px;
  display: inline-flex; align-items: center; justify-content: center;
  background: #38332a; color: #c8922a; font-weight: 700; font-size: 10.5px;
}
.quiz-text { flex: 1; }
.quiz-mark { font-weight: 800; color: #5fae5f; }
.quiz-mark.wrong { color: #d9655a; }
.quiz-opt.is-correct { border-color: #5fae5f; background: rgba(95,174,95,0.14); }
.quiz-opt.is-correct .quiz-key { background: #5fae5f; color: #14130f; }
.quiz-opt.is-wrong { border-color: #d9655a; background: rgba(217,101,90,0.14); }
.quiz-opt.is-wrong .quiz-key { background: #d9655a; color: #14130f; }
.quiz-opt.is-dim { opacity: 0.5; }
.quiz-feedback { margin-top: 12px; padding: 10px 12px; border-radius: 6px; font-size: 14px; }
.quiz-feedback.ok { background: rgba(95,174,95,0.12); border: 1px solid rgba(95,174,95,0.4); }
.quiz-feedback.no { background: rgba(217,101,90,0.12); border: 1px solid rgba(217,101,90,0.4); }
.quiz-verdict { font-weight: 700; margin-bottom: 4px; }
.quiz-ans { font-weight: 500; }
.quiz-explain { color: #cfc9bf; line-height: 1.45; }
.quiz-retry {
  margin-top: 8px; font-size: 12px; color: #c8922a;
  background: transparent; border: 1px solid #c8922a;
  border-radius: 4px; padding: 3px 10px; cursor: pointer;
}
.quiz-retry:hover { background: #c8922a; color: #1a1917; }
.quiz-fade-enter-active { transition: all 0.25s ease; }
.quiz-fade-enter-from { opacity: 0; transform: translateY(-6px); }
</style>
