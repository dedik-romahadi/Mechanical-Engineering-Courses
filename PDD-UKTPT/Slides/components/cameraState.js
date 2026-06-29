// cameraState.js — Status kamera BERSAMA untuk semua instance CameraFrame.
// Modul ini dievaluasi sekali, jadi state di bawah bersifat singleton dan
// dipakai bersama lintas-slide: satu izin kamera, satu MediaStream dipakai
// ulang, dan status on/off konsisten di semua slide.
import { ref } from 'vue'

// enabled = true -> kamera otomatis menyala (default). Tetap menyala saat
// pindah slide; hanya mati jika ditekan tombol matikan (disable()).
export const enabled = ref(true)

let sharedStream = null
let pending = null

// Pastikan ada satu stream aktif; panggilan berikutnya memakai ulang yang sama.
export async function ensureStream() {
  if (sharedStream && sharedStream.active) return sharedStream
  if (pending) return pending
  pending = navigator.mediaDevices
    .getUserMedia({
      video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } },
      audio: false,
    })
    .then((s) => {
      sharedStream = s
      pending = null
      return s
    })
    .catch((e) => {
      pending = null
      enabled.value = false // gagal/ditolak -> tampilkan placeholder
      throw e
    })
  return pending
}

// Benar-benar matikan perangkat (lampu kamera mati).
export function stopShared() {
  if (sharedStream) {
    sharedStream.getTracks().forEach((t) => t.stop())
    sharedStream = null
  }
}

export function enable() {
  enabled.value = true
}

export function disable() {
  enabled.value = false
}
