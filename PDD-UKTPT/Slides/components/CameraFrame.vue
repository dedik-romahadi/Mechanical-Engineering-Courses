<!--
  CameraFrame.vue — Frame kamera presenter berbentuk kotak potrait dengan
  sudut membulat (fillet). Webcam live (getUserMedia) + tombol nyala/mati.
  Saat mati menampilkan placeholder. Dipakai di salah satu kolom isi slide.
-->
<template>
  <div class="cf" :class="{ 'cf-off': !on }">
    <video v-show="on" ref="video" class="cf-video" autoplay playsinline muted></video>
    <div v-if="!on" class="cf-ph">
      <div class="cf-ph-ic">👤</div>
      <button class="cf-start" @click="start">📷 Aktifkan Kamera</button>
    </div>
    <div class="cf-cap" v-if="name">
      <span class="cf-name">{{ name }}</span>
      <span class="cf-role" v-if="role">{{ role }}</span>
    </div>
    <button v-if="on" class="cf-toggle" @click="stop" title="Matikan kamera">⏻</button>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

defineProps({
  name: { type: String, default: '' },
  role: { type: String, default: '' },
})

const on = ref(false)
const video = ref(null)
let stream = null

async function start() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } },
      audio: false,
    })
    on.value = true
    await Promise.resolve()
    if (video.value) video.value.srcObject = stream
  } catch (e) {
    on.value = false
  }
}

function stop() {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop())
    stream = null
  }
  if (video.value) video.value.srcObject = null
  on.value = false
}

onUnmounted(stop)
</script>

<style scoped>
.cf {
  position: relative; width: 100%; max-width: 290px; aspect-ratio: 3 / 4;
  border-radius: 24px; overflow: hidden;
  background: linear-gradient(160deg, #eef2f8, #dde6f2);
  border: 1px solid #d4ddea;
  box-shadow: 0 20px 44px -20px rgba(15, 28, 52, 0.5), inset 0 0 0 4px #ffffff;
}
.cf::after {
  content: ''; position: absolute; inset: 0; border-radius: 24px; pointer-events: none;
  box-shadow: inset 0 0 0 2px rgba(21, 65, 143, 0.16);
}
.cf-video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); display: block; }
.cf-ph {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 18px;
}
.cf-ph-ic { font-size: 66px; opacity: 0.32; }
.cf-start {
  font-size: 13px; font-weight: 700; color: #fff; cursor: pointer; border: none;
  background: linear-gradient(135deg, #15418f, #0f9d8f);
  padding: 9px 16px; border-radius: 999px;
  box-shadow: 0 6px 16px rgba(21, 65, 143, 0.3);
}
.cf-cap {
  position: absolute; left: 0; right: 0; bottom: 0; padding: 20px 14px 12px;
  display: flex; flex-direction: column; gap: 1px;
  background: linear-gradient(0deg, rgba(8, 16, 30, 0.8), transparent);
}
.cf-name { font-size: 14px; font-weight: 800; color: #fff; }
.cf-role { font-size: 11px; font-weight: 600; letter-spacing: 0.05em; color: #bcd2ff; }
.cf-toggle {
  position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-radius: 50%;
  border: none; cursor: pointer; background: rgba(8, 16, 30, 0.5); color: #fff; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
}
</style>
