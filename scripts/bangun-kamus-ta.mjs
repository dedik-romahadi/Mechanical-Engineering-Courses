#!/usr/bin/env node
// Bangkitkan kamus ejaan Pemeriksa Format TA untuk peramban.
//
// Sumber: Tugas-Akhir/kamus/sumber/ — kamus Hunspell id_ID (hunspell-id, LGPL-3.0)
// dan en_US (SCOWL), keduanya dari github.com/LibreOffice/dictionaries, ditambah
// daftar istilah teknik (istilah-teknik-id.txt, istilah-teknik-en.txt).
// Keluaran: Tugas-Akhir/kamus/kamus-id_ID.js dan kamus-en_US.js, dimuat halaman
// sebagai <script> sehingga CSP connect-src 'none' tetap berlaku.
//
//   node scripts/bangun-kamus-ta.mjs            tulis ulang keluaran
//   node scripts/bangun-kamus-ta.mjs --periksa  gagal bila keluaran basi

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'Tugas-Akhir', 'kamus');
const sumber = path.join(dir, 'sumber');
const baca = (n) => fs.readFileSync(path.join(sumber, n), 'utf8');
const daftar = (n) => baca(n).split(/\r?\n/).map((x) => x.trim()).filter((x) => x && !x.startsWith('#'));

const KAMUS = [
  { kode: 'id_ID', lisensi: 'hunspell-id, LGPL-3.0-only (sumber/LICENSE-id_ID.txt)', tambahan: 'istilah-teknik-id.txt' },
  { kode: 'en_US', lisensi: 'SCOWL/Ispell, izin Kevin Atkinson dan Geoff Kuenning (sumber/README-en_US.txt)', tambahan: 'istilah-teknik-en.txt' },
];

const periksa = process.argv.includes('--periksa');
let basi = 0;
for (const k of KAMUS) {
  const data = { aff: baca(`${k.kode}.aff`), dic: baca(`${k.kode}.dic`), tambahan: daftar(k.tambahan) };
  const isi = `/* Kamus ejaan ${k.kode} untuk Pemeriksa Format TA — ${k.lisensi}.\n` +
    ' * DIBANGKITKAN oleh scripts/bangun-kamus-ta.mjs dari kamus/sumber/; jangan disunting langsung. */\n' +
    `(globalThis.KamusTA = globalThis.KamusTA || {})[${JSON.stringify(k.kode)}] = ${JSON.stringify(data)};\n`;
  const target = path.join(dir, `kamus-${k.kode}.js`);
  const lama = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
  if (periksa) {
    if (lama !== isi) { basi++; console.error(`✗ ${path.relative(root, target)} basi; jalankan node scripts/bangun-kamus-ta.mjs`); }
  } else if (lama !== isi) {
    fs.writeFileSync(target, isi);
    console.log(`ditulis ${path.relative(root, target)} (${(isi.length / 1024).toFixed(0)} KB, ${data.tambahan.length} istilah tambahan)`);
  } else console.log(`${path.relative(root, target)} sudah mutakhir`);
}
if (periksa && !basi) console.log('Kamus ejaan mutakhir.');
process.exit(basi ? 1 : 0);
