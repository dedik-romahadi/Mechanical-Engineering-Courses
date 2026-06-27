// State webcam terpusat — dipakai bersama oleh global-bottom.vue (yang merender
// elemen <video> di .cam-space) dan slide cover (tombol toggle di footer-nya).
// Dengan begini tombol di mana pun mengontrol kamera yang sama.
import { ref } from 'vue'

export const camOn = ref(false)

let stream = null
const videos = new Set()

function attachAll() {
  videos.forEach((el) => { el.srcObject = stream })
}

export function registerVideo(el) {
  if (!el) return
  videos.add(el)
  if (stream) el.srcObject = stream
}

export function unregisterVideo(el) {
  if (el) videos.delete(el)
}

export async function startCam() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    camOn.value = true
    attachAll()
    try { localStorage.setItem('opto-cam-on', '1') } catch (e) {}
  } catch (e) {
    stream = null
    camOn.value = false
  }
}

export function stopCam() {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop())
    stream = null
  }
  videos.forEach((el) => { el.srcObject = null })
  camOn.value = false
  try { localStorage.setItem('opto-cam-on', '0') } catch (e) {}
}

export function toggleCam() {
  camOn.value ? stopCam() : startCam()
}

// Lanjutkan kamera bila sebelumnya nyala (disimpan di localStorage).
export function resumeCam() {
  let saved = '0'
  try { saved = localStorage.getItem('opto-cam-on') || '0' } catch (e) {}
  if (saved === '1' && !camOn.value) startCam()
}
