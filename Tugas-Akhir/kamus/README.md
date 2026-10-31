# Kamus ejaan Pemeriksa Format TA

| Berkas | Isi |
|---|---|
| `sumber/id_ID.aff`, `sumber/id_ID.dic` | Kamus Hunspell bahasa Indonesia ([hunspell-id](https://github.com/shuLhan/hunspell-id)), lisensi LGPL-3.0-only — `sumber/LICENSE-id_ID.txt`, `sumber/README-id_ID.adoc` |
| `sumber/en_US.aff`, `sumber/en_US.dic` | Kamus Hunspell bahasa Inggris AS dari SCOWL 2020.12.07; izin Kevin Atkinson dan Geoff Kuenning ada di `sumber/README-en_US.txt` (bagian COPYRIGHT) |
| `sumber/istilah-teknik-id.txt` | Istilah teknik Indonesia yang belum ada di hunspell-id (parametrik, histeresis, surja, …) |
| `sumber/istilah-teknik-en.txt` | Istilah teknik Inggris yang belum ada di en_US (underdamped, setpoint, cepstrum, …); tetap ditandai "istilah asing belum miring" bila tegak |
| `kamus-id_ID.js`, `kamus-en_US.js` | Dibangkitkan dari `sumber/`; dimuat halaman sebagai `<script>` supaya CSP `connect-src 'none'` tetap berlaku |

Kedua kamus Hunspell diunduh 24 Oktober 2026 dari
[LibreOffice/dictionaries](https://github.com/LibreOffice/dictionaries) commit `67032ee9`
(folder `id/` dan `en/`) tanpa perubahan. Berkas `license.txt` di folder `en/` repo itu
(GPL v2, untuk berkas tanda hubung dan tesaurus) tidak diikutkan karena berkas tersebut tidak dipakai.

Daftar istilah dihimpun dari 84 modul kuliah S1 Teknik Mesin UMB lalu ditinjau manual.
Menambah istilah: sunting berkas `istilah-teknik-*.txt` (satu kata per baris, cukup bentuk
dasar), lalu

```bash
node scripts/bangun-kamus-ta.mjs
```

`scripts/uji-pemeriksa-ta.mjs` (ikut CI) gagal bila `kamus-*.js` tidak sama dengan hasil bangun ulang.
