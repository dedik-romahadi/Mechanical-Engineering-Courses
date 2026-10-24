#!/usr/bin/env node
// Uji Pemeriksa Format TA (Tugas-Akhir/pemeriksa-inti.js).
//
// Membangun naskah .docx sintetis di memori: satu naskah yang mematuhi pedoman
// (tidak boleh ada temuan "gagal") dan varian-varian cacat yang masing-masing
// harus tertangkap. Naskah bertanda yang dihasilkan diurai ulang untuk
// memastikan sorotan/komentar tertulis dan teks naskah tidak berubah.
//
// Templat resmi tidak ikut di repo ini (rahasia, repo privat
// kurikulum-teknik-mesin). Bila tersedia di folder sebelah atau di TEMPLAT_TA,
// templat ikut diperiksa: ke-16 bagian harus dikenali.
//
//   node scripts/uji-pemeriksa-ta.mjs

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fileInti = path.join(root, 'Tugas-Akhir', 'pemeriksa-inti.js');
const fileHalaman = path.join(root, 'Tugas-Akhir', 'Pemeriksa-Format-TA.html');

let gagal = 0, lulus = 0;
const cek = (kondisi, nama, info = '') => {
  if (kondisi) { lulus++; return; }
  gagal++;
  console.error(`✗ ${nama}${info ? '\n    ' + info : ''}`);
};

// Skrip di halaman harus lolos kompilasi (setara node --check di validator).
const html = fs.readFileSync(fileHalaman, 'utf8');
for (const [, attrs, isi] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (/\bsrc\s*=/.test(attrs) || !isi.trim()) continue;
  try { new vm.Script(isi); lulus++; } catch (e) { cek(false, 'skrip halaman terkompilasi', e.message); }
}
cek(/<script src="pemeriksa-inti\.js\?v=[\d.]+"><\/script>/.test(html), 'halaman memuat pemeriksa-inti.js');
cek(/connect-src 'none'/.test(html), "CSP halaman memuat connect-src 'none' (naskah tidak bisa dikirim ke luar)");

const ctx = { TextDecoder, TextEncoder, console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(fileInti, 'utf8'), ctx, { filename: fileInti });
const PT = ctx.PemeriksaTA;
cek(html.includes(`pemeriksa-inti.js?v=${PT.VERSI}`), `versi skrip di halaman sama dengan VERSI inti (${PT.VERSI})`);
const inflateRaw = async (d) => new Uint8Array(zlib.inflateRawSync(d));
const deflateRaw = async (d) => new Uint8Array(zlib.deflateRawSync(d));

// Kamus ejaan: berkas peramban harus sama dengan hasil bangun ulang dari kamus/sumber/.
const bangun = spawnSync(process.execPath, [path.join(root, 'scripts', 'bangun-kamus-ta.mjs'), '--periksa'], { encoding: 'utf8' });
cek(bangun.status === 0, 'kamus/kamus-*.js mutakhir terhadap kamus/sumber/', bangun.stderr.trim());
for (const kode of ['id_ID', 'en_US']) vm.runInContext(fs.readFileSync(path.join(root, 'Tugas-Akhir', 'kamus', `kamus-${kode}.js`), 'utf8'), ctx);
const kamus = { id: PT.kamusDariData(ctx.KamusTA.id_ID), en: PT.kamusDariData(ctx.KamusTA.en_US) };
for (const n of ['LICENSE-id_ID.txt', 'README-en_US.txt']) cek(fs.existsSync(path.join(root, 'Tugas-Akhir', 'kamus', 'sumber', n)), `lisensi kamus ikut: ${n}`);
{
  // Imbuhan Hunspell: awalan + akhiran (circumfix me-…-kan, di-…-kan), akhiran lapis kedua (-nya).
  const benar = 'menggunakan menggunakannya digunakan dilakukan pengujian perancangan keberhasilan memperlihatkan dikembangkan dianalisis pengukuran menghasilkan dipertahankan getaran sistem frekuensi'.split(' ');
  const tolak = benar.filter((w) => !kamus.id.cek(w));
  cek(!tolak.length, 'kamus id_ID menerima kata berimbuhan', tolak.join(' '));
  for (const [salah, harapan] of [['pengujain', 'pengujian'], ['dilakuakn', 'dilakukan'], ['perancanagn', 'perancangan'], ['getran', 'getaran'], ['menggunkan', 'menggunakan']]) {
    const s = kamus.id.saran(salah);
    cek(!kamus.id.cek(salah) && s[0] === harapan, `salah ketik "${salah}" ditolak, saran pertama "${harapan}"`, JSON.stringify(s));
  }
  cek(kamus.en.cek('vibration') && kamus.en.cek('maintenance') && !kamus.en.cek('vibraton'), 'kamus en_US menerima/menolak dengan benar');
  cek(kamus.id.cek('parametrik') && kamus.en.cek('underdamped'), 'istilah teknik tambahan termuat');
}

/* ---------------------------------------------------------------- pembangun .docx */

const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function r(teks, o = {}) {
  const rp = [];
  if (o.font) rp.push(`<w:rFonts w:ascii="${o.font}" w:hAnsi="${o.font}"/>`);
  if (o.b) rp.push('<w:b/>');
  if (o.i) rp.push('<w:i/>');
  if (o.color) rp.push(`<w:color w:val="${o.color}"/>`);
  if (o.sz) rp.push(`<w:sz w:val="${o.sz * 2}"/>`);
  return `<w:r>${rp.length ? `<w:rPr>${rp.join('')}</w:rPr>` : ''}<w:t xml:space="preserve">${esc(teks)}</w:t></w:r>`;
}
function p(isi, o = {}) {
  const pp = [];
  if (o.pbb) pp.push('<w:pageBreakBefore/>');
  pp.push(`<w:spacing w:after="${o.after || 0}" w:line="${Math.round((o.line || 1) * 240)}" w:lineRule="auto"/>`);
  if (o.hanging) pp.push(`<w:ind w:left="720" w:hanging="720"/>`);
  if (o.jc) pp.push(`<w:jc w:val="${o.jc}"/>`);
  if (o.sect) pp.push(o.sect);
  const runs = Array.isArray(isi) ? isi.join('') : (isi === '' ? '' : r(isi, o));
  return `<w:p><w:pPr>${pp.join('')}</w:pPr>${runs}</w:p>`;
}
const pb = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
const kosong = '<w:p/>';
function sect({ fmt, start, titlePg, footer = 'rIdF1', footerFirst, kanan = 1701, footerJarak = 1134 } = {}) {
  const pn = fmt || start != null ? `<w:pgNumType${fmt ? ` w:fmt="${fmt}"` : ''}${start != null ? ` w:start="${start}"` : ''}/>` : '';
  return `<w:sectPr>${footer ? `<w:footerReference w:type="default" r:id="${footer}"/>` : ''}${footerFirst ? `<w:footerReference w:type="first" r:id="${footerFirst}"/>` : ''}` +
    `<w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1701" w:right="${kanan}" w:bottom="1701" w:left="2268" w:header="720" w:footer="${footerJarak}" w:gutter="0"/>${pn}${titlePg ? '<w:titlePg/>' : ''}</w:sectPr>`;
}
const gambar = (wCm, hCm) => `<w:r><w:drawing><wp:inline><wp:extent cx="${Math.round(wCm * 360000)}" cy="${Math.round(hCm * 360000)}"/><wp:docPr id="1" name="Gambar"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="1" name="g.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdImg"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${Math.round(wCm * 360000)}" cy="${Math.round(hCm * 360000)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
const zotero = (teks) => `<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> ADDIN ZOTERO_ITEM CSL_CITATION {"citationID":"a1"} </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r>${r(teks)}<w:r><w:fldChar w:fldCharType="end"/></w:r>`;
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

function paketDocx(bodyXml, { tambahan = {} } = {}) {
  const bagian = {
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/word/footer2.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>',
    'docProps/app.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Uji Pemeriksa</Application><Pages>20</Pages></Properties>',
    'word/_rels/document.xml.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdS" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdF1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/><Relationship Id="rIdF2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer2.xml"/><Relationship Id="rIdImg" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/></Relationships>',
    'word/styles.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles ${NS}><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style></w:styles>`,
    'word/footer1.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr ${NS}><w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>`,
    'word/footer2.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr ${NS}><w:p/></w:ftr>`,
    'word/media/image1.png': PNG,
    'word/document.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${NS}><w:body>${bodyXml}</w:body></w:document>`,
    ...tambahan,
  };
  const enc = new TextEncoder();
  const daftar = Object.entries(bagian).map(([nama, isi]) => {
    const data = typeof isi === 'string' ? enc.encode(isi) : new Uint8Array(isi);
    return { nama, data: new Uint8Array(zlib.deflateRawSync(data)), metode: 8, crc: PT._uji.crc32(data), ukuranAsli: data.length };
  });
  return PT._uji.tulisZip(daftar);
}

/* ---------------------------------------------------------------- isi naskah contoh */

const KALIMAT_ID = [
  'Penelitian ini bertujuan merancang sistem pemantauan getaran pompa sentrifugal berbasis sensor MEMS untuk mendeteksi kerusakan bantalan sejak dini.',
  'Data getaran direkam pada tiga kondisi operasi dan diolah dengan transformasi Fourier cepat untuk memperoleh spektrum frekuensi.',
  'Hasil pengujian menunjukkan bahwa amplitudo pada frekuensi cacat lintasan luar meningkat seiring bertambahnya tingkat kerusakan.',
  'Sistem yang dirancang mampu membedakan kondisi normal dan rusak dengan ketepatan yang memadai untuk keperluan perawatan prediktif di industri.',
];
const KALIMAT_EN = [
  'This study designs a vibration monitoring system for centrifugal pumps based on MEMS sensors to detect bearing faults at an early stage.',
  'Vibration data were recorded under three operating conditions and processed with the fast Fourier transform to obtain the frequency spectrum.',
  'The test results show that the amplitude at the outer race defect frequency increases as the damage level grows.',
  'The proposed system distinguishes normal and faulty conditions with sufficient accuracy for predictive maintenance in industry.',
];
function teksKata(kalimat, n) {
  const kata = [];
  for (let k = 0; kata.length < n; k++) kata.push(...kalimat[k % kalimat.length].split(' '));
  let t = kata.slice(0, n).join(' ');
  if (!/[.!?]$/.test(t)) t = t.replace(/[,;:]$/, '') + '.';
  return t;
}
const JUDUL = 'SISTEM PEMANTAUAN GETARAN POMPA SENTRIFUGAL BERBASIS SENSOR MEMS';

function naskahPublikasi(o = {}) {
  const tengah = { jc: 'center', b: true, sz: 14 };
  const baris = (t, x = {}) => p(t, Object.assign({}, tengah, x));
  const judulBagian = (t) => p(t, { jc: 'center', b: true });
  const prosa = (t, x = {}) => p(t, Object.assign({ jc: 'both', line: 1.5 }, x));
  const halamanJudul = (diajukan) => [
    p([gambar(3.5, 3)], { jc: 'center' }), kosong,
    baris(o.judul || JUDUL), kosong, baris('TUGAS AKHIR'), baris('PUBLIKASI ILMIAH'), kosong,
    diajukan ? p('Diajukan Sebagai Salah Satu Syarat Untuk Memperoleh Gelar Sarjana', { jc: 'center', b: true }) : '',
    kosong, baris('BUDI SANTOSO'), baris('41320010001'), kosong,
    o.placeholder && !diajukan ? p('(Ukuran: 14 Times New Roman )', { jc: 'center', b: true }) : '',
    baris('PROGRAM STUDI TEKNIK MESIN'), baris('FAKULTAS TEKNIK'), baris('UNIVERSITAS MERCU BUANA'), baris('JAKARTA'), baris('2026'),
  ].join('');
  const kp = [
    judulBagian('KATA PENGANTAR'), kosong,
    prosa('Puji syukur saya panjatkan kepada Tuhan Yang Maha Esa karena atas berkat dan rahmat-Nya saya dapat menyelesaikan Tugas Akhir ini dengan baik. Penulisan Tugas Akhir ini dilakukan untuk memenuhi salah satu syarat mencapai gelar Sarjana Teknik pada Program Studi Teknik Mesin.' + (o.bahasa ? ' Pengujian  dilakukan pada data data hasil analisa di lakukan dengan beban 10kg secara online sehingga hasil ,dan kalimat ini selesai. kemudian Dan pembahasan berlanjut.' : '') +
      (o.typo ? ' Tahap pengujain alat dilakuakn di laboratorium dengan pompa yang dipasang pada rangka.' : '')),
    prosa('Saya mengucapkan terima kasih kepada pihak-pihak berikut:'),
    ...(o.urutanKP ? [
      prosa('Dr. Siti Rahayu, M.T. selaku Dekan Fakultas Teknik;'),
      prosa('Prof. Dr. Ahmad Sutrisno, M.Eng. selaku Rektor Universitas Mercu Buana;'),
    ] : [
      prosa('Prof. Dr. Ahmad Sutrisno, M.Eng. selaku Rektor Universitas Mercu Buana;', o.calibri ? { font: 'Calibri' } : {}),
      prosa('Dr. Siti Rahayu, M.T. selaku Dekan Fakultas Teknik;'),
    ]),
    prosa('Dr. Bambang Wijaya, S.T., M.T. selaku Ketua Program Studi Teknik Mesin;'),
    prosa('Dr. Rina Kartika, S.T., M.Sc. selaku Dosen Pembimbing yang telah menyediakan waktu, tenaga, dan pikiran untuk mengarahkan saya dalam penyusunan Tugas Akhir ini.'),
    prosa('Akhir kata, saya berharap Tuhan Yang Maha Esa berkenan membalas segala kebaikan semua pihak yang telah membantu. Semoga Tugas Akhir ini membawa manfaat bagi pengembangan ilmu.'),
  ].join('');
  const abstrak = (inggris) => {
    const kunci = inggris ? 'Keywords: vibration, centrifugal pump, MEMS sensor, condition monitoring' : (o.kunci7 ? 'Kata Kunci: a1, b2, c3, d4, e5, f6, g7' : 'Kata Kunci: getaran, pompa sentrifugal, sensor MEMS, pemantauan kondisi');
    const n = !inggris && o.abstrak200 ? 200 : 270;
    return [
      p(inggris ? 'VIBRATION MONITORING SYSTEM OF CENTRIFUGAL PUMPS BASED ON MEMS SENSORS' : JUDUL, { jc: 'center', b: true }), p('BUDI SANTOSO', { jc: 'center', b: true }), kosong,
      judulBagian(inggris ? 'ABSTRACT' : 'ABSTRAK'), kosong,
      p(teksKata(inggris ? KALIMAT_EN : KALIMAT_ID, n), { jc: 'both', i: inggris }), kosong,
      p(kunci, { jc: 'both', b: true, i: inggris }),
    ].join('');
  };
  const isiDaftar = ['HALAMAN SAMPUL\t0', 'HALAMAN JUDUL\ti', 'HALAMAN PERNYATAAN KARYA SENDIRI\tii', 'HALAMAN SURAT KETERANGAN HASIL UJI TURNITIN\tiii',
    'HALAMAN LETTER OF ACCEPTANCE\tiv', 'HALAMAN PENGESAHAN\tv', 'KATA PENGANTAR\tvi', 'HALAMAN PERNYATAAN PERSETUJUAN PUBLIKASI\tvii', 'ABSTRAK\tviii',
    'ABSTRACT\tix', 'DAFTAR ISI\tx', 'DAFTAR LAMPIRAN\txi', 'NASKAH PUBLIKASI ILMIAH\t1', 'LAMPIRAN\t9'];
  const blokPers = [p('HALAMAN PERNYATAAN PERSETUJUAN PUBLIKASI', { jc: 'center', b: true }), p('TUGAS AKHIR DI REPOSITORI UMB', { jc: 'center', b: true }), kosong,
    prosa('Sebagai sivitas akademik Universitas Mercu Buana, saya yang bertanda tangan di bawah ini memberikan izin kepada Universitas Mercu Buana untuk menyimpan dan memublikasikan Tugas Akhir saya.'),
    prosa('Demikian pernyataan ini saya buat dengan sebenarnya untuk digunakan sebagaimana mestinya oleh pihak yang memerlukan.')].join('');
  const blokAbs = abstrak(false) + pb + abstrak(true);
  const tengahBlok = o.tukarUrutan ? [blokAbs, pb, kp, pb, blokPers] : [kp, pb, blokPers, pb, blokAbs];
  const sebelumKP = o.tanpaPutusKP ? '' : pb;
  const naskahArtikel = Array.from({ length: 6 }, (_, k) => p(k === 0 ? [r(teksKata(KALIMAT_ID, 150) + ' ', { font: 'Arial', sz: 10 }), zotero('(Santoso, 2025)'), r('.', { font: 'Arial', sz: 10 })] : [r(teksKata(KALIMAT_ID, 150), { font: 'Arial', sz: 10 })], { jc: 'both' })).join('');
  const body = [
    halamanJudul(false),
    p('', { sect: sect({ fmt: 'lowerRoman', titlePg: true, footerFirst: 'rIdF2', footer: 'rIdF2' }) }),
    halamanJudul(true), pb,
    judulBagian('HALAMAN PERNYATAAN KARYA SENDIRI'), kosong,
    p('Saya yang bertanda tangan di bawah ini:', { line: 2 }), p('Nama\t: Budi Santoso', { line: 2 }), p('NIM\t: 41320010001', { line: 2 }),
    p('Fakultas/Program Studi\t: Teknik/Teknik Mesin', { line: 2 }),
    p('Menyatakan dengan sebenar-benarnya bahwa Tugas Akhir berjudul Sistem Pemantauan Getaran Pompa Sentrifugal Berbasis Sensor MEMS adalah hasil karya saya sendiri dan tidak mengandung unsur plagiarisme.', { jc: 'both', line: 2 }),
    pb, judulBagian('HALAMAN SURAT KETERANGAN HASIL UJI TURNITIN'), kosong,
    p(`Tingkat kemiripan naskah ini berdasarkan pemeriksaan Turnitin sebesar ${o.turnitin35 ? 35 : 18}%.`, { jc: 'both' }),
    ...(o.tanpaLoA ? [] : [pb, judulBagian('HALAMAN LETTER OF ACCEPTANCE (LOA)'), kosong, p([gambar(15, 20)], { jc: 'center' })]),
    pb, judulBagian('HALAMAN PENGESAHAN'), kosong,
    p('Tugas Akhir ini diajukan oleh:'), p('Nama\t: Budi Santoso'), p('NIM\t: 41320010001'),
    p('Telah berhasil dipertahankan pada sidang tanggal 20 Agustus 2026 dan diterima sebagai bagian persyaratan yang diperlukan untuk memperoleh gelar Sarjana pada Program Studi Teknik Mesin, Fakultas Teknik, Universitas Mercu Buana.', { jc: 'both' }),
    p('Disahkan oleh:', { jc: 'center' }), p('Pembimbing', { jc: 'center' }), p('Dr. Rina Kartika, S.T., M.Sc.', { jc: 'center' }), p('NIDN: 0312345678', { jc: 'center' }),
    p('Dekan Fakultas Teknik\tKetua Program Studi Teknik Mesin'),
    sebelumKP, ...tengahBlok,
    pb, judulBagian('DAFTAR ISI'), kosong, ...isiDaftar.map((t) => p(t)),
    pb, judulBagian('DAFTAR LAMPIRAN'), kosong, p('Lampiran 1. Kertas Kerja Penyusunan Publikasi\t9'),
    p('', { sect: sect({ fmt: o.awalDesimal ? 'decimal' : 'lowerRoman', start: 1, kanan: o.marginKanan || 1701 }) }),
    judulBagian('NASKAH PUBLIKASI ILMIAH'), kosong, naskahArtikel,
    pb, judulBagian('LAMPIRAN'), kosong, p('Lampiran 1. Kertas Kerja Penyusunan Publikasi', { jc: 'right' }),
    prosa('Kertas kerja ini memuat catatan bimbingan, korespondensi dengan penyunting jurnal, dan perbaikan naskah dari setiap tahap penelaahan sebelum naskah diterima untuk diterbitkan. Setiap catatan dilengkapi tanggal, nama penelaah, dan ringkasan perubahan yang dilakukan.'),
    o.revisi ? '<w:p><w:ins w:id="9" w:author="Uji" w:date="2026-10-01T00:00:00Z"><w:r><w:t>Sisipan revisi.</w:t></w:r></w:ins></w:p>' : '',
    sect({ start: 1 }),
  ].join('');
  return paketDocx(body);
}

function naskahSkripsi(o = {}) {
  const baris = (t) => p(t, { jc: 'center', b: true, sz: 14 });
  const judulBagian = (t) => p(t, { jc: 'center', b: true });
  const prosa = (t, x = {}) => p(t, Object.assign({ jc: 'both', line: 1.5 }, x));
  const halamanJudul = (diajukan) => [p([gambar(3.5, 3)], { jc: 'center' }), baris(JUDUL), baris('SKRIPSI'),
    diajukan ? p('Diajukan Sebagai Salah Satu Syarat Untuk Memperoleh Gelar Sarjana', { jc: 'center', b: true }) : '',
    baris('BUDI SANTOSO'), baris('41320010001'), baris('PROGRAM STUDI TEKNIK MESIN'), baris('FAKULTAS TEKNIK'), baris('UNIVERSITAS MERCU BUANA'), baris('JAKARTA'), baris('2026')].join('');
  const tabel = `<w:tbl><w:tblPr><w:jc w:val="center"/></w:tblPr><w:tr><w:tc>${p('Kondisi')}</w:tc><w:tc>${p('Amplitudo')}</w:tc></w:tr><w:tr><w:tc>${p('Normal')}</w:tc><w:tc>${p('0,8')}</w:tc></w:tr></w:tbl>`;
  const pustaka = o.pustakaAcak
    ? ['Wahyudi, B. (2024). Analisis getaran mesin. Jurnal Teknik Mesin, 12(2), 45–52.', 'Anggraini, D. (2025). Perawatan prediktif. Jurnal Rekayasa, 8(1), 1–9.']
    : ['Anggraini, D. (2025). Perawatan prediktif. Jurnal Rekayasa, 8(1), 1–9.', 'Wahyudi, B. (2024). Analisis getaran mesin. Jurnal Teknik Mesin, 12(2), 45–52.'];
  if (o.pustakaLama) pustaka.push('Zainal, A. (1999). Dasar getaran mekanik. Penerbit Teknik.', 'Zulkifli, B. (2001). Mesin fluida. Penerbit Teknik.', 'Zuhri, C. (2002). Teori bantalan. Penerbit Teknik.');
  const body = [
    halamanJudul(false), p('', { sect: sect({ fmt: 'lowerRoman', titlePg: true, footerFirst: 'rIdF2', footer: 'rIdF2' }) }),
    halamanJudul(true), pb,
    judulBagian('HALAMAN PERNYATAAN KARYA SENDIRI'), p('Saya yang bertanda tangan di bawah ini, Nama Budi Santoso, NIM 41320010001, Fakultas Teknik Program Studi Teknik Mesin, menyatakan bahwa Tugas Akhir ini adalah hasil karya saya sendiri.', { jc: 'both', line: 2 }),
    pb, judulBagian('HALAMAN SURAT KETERANGAN HASIL UJI TURNITIN'), p('Tingkat kemiripan sebesar 12%.'),
    pb, judulBagian('HALAMAN PENGESAHAN'), p('Telah berhasil dipertahankan pada sidang tanggal 20 Agustus 2026 dan diterima sebagai persyaratan memperoleh gelar Sarjana pada Program Studi Teknik Mesin.', { jc: 'both' }),
    p('Pembimbing, Dekan Fakultas Teknik, Ketua Program Studi Teknik Mesin, NIDN 0312345678'),
    pb, judulBagian('KATA PENGANTAR'), prosa('Puji syukur saya panjatkan kepada Tuhan Yang Maha Esa karena atas berkat dan rahmat-Nya saya dapat menyelesaikan skripsi ini. Terima kasih kepada Rektor, Dekan, Ketua Program Studi, dan Pembimbing yang telah membantu penyusunan skripsi ini.'),
    pb, p('HALAMAN PERNYATAAN PERSETUJUAN PUBLIKASI', { jc: 'center', b: true }), p('TUGAS AKHIR DI REPOSITORI UMB', { jc: 'center', b: true }),
    prosa('Saya memberikan izin kepada Universitas Mercu Buana untuk menyimpan, mengelola, dan memublikasikan Tugas Akhir saya untuk kepentingan akademis.'),
    pb, p(JUDUL, { jc: 'center', b: true }), p('BUDI SANTOSO', { jc: 'center', b: true }), judulBagian('ABSTRAK'), p(teksKata(KALIMAT_ID, 260), { jc: 'both' }), p('Kata Kunci: getaran, pompa, bantalan', { b: true }),
    pb, p('VIBRATION MONITORING OF CENTRIFUGAL PUMPS', { jc: 'center', b: true }), p('BUDI SANTOSO', { jc: 'center', b: true }), judulBagian('ABSTRACT'), p(teksKata(KALIMAT_EN, 260), { jc: 'both', i: true }), p('Keywords: vibration, pump, bearing', { b: true, i: true }),
    pb, judulBagian('DAFTAR ISI'), ...['KATA PENGANTAR\tvi', 'ABSTRAK\tviii', 'ABSTRACT\tix', 'BAB I PENDAHULUAN\t1', 'BAB II TINJAUAN PUSTAKA\t3', 'DAFTAR PUSTAKA\t5'].map((t) => p(/^BAB/.test(t) ? t : t, /^BAB/.test(t) ? { b: true } : {})),
    pb, judulBagian('DAFTAR TABEL'), p('Tabel 1.1 Data Pengujian Getaran\t2'),
    pb, judulBagian('DAFTAR GAMBAR'), p('Gambar 1.1 Skema Alat Uji\t2'),
    p('', { sect: sect({ fmt: 'lowerRoman', start: 1 }) }),
    judulBagian('BAB I'), judulBagian('PENDAHULUAN'),
    p('1.1 Latar Belakang', { b: true }), prosa(teksKata(KALIMAT_ID, 60)),
    p('1.1.1 Rumusan Masalah', { b: true }), prosa(teksKata(KALIMAT_ID, 40)),
    o.subbabDalam ? p('1.1.1.1 Batasan Rinci', { b: true }) : '',
    p(o.kapsiTitik ? 'Tabel 1.1. Data Pengujian Getaran' : 'Tabel 1.1 Data Pengujian Getaran', { jc: 'center' }), tabel,
    p('Sumber: Data pengujian', { sz: 10 }),
    p([gambar(10, 6)], { jc: 'center' }), p('Gambar 1.1 Skema Alat Uji', { jc: 'center' }),
    pb, judulBagian('BAB II'), judulBagian('TINJAUAN PUSTAKA'), p('2.1 Getaran Mesin', { b: true }), p([r(teksKata(KALIMAT_ID, 50) + ' '), zotero('(Wahyudi, 2024)')], { jc: 'both', line: 1.5 }),
    pb, judulBagian('DAFTAR PUSTAKA'), ...pustaka.map((t) => p(t, { hanging: true, line: 1.5, jc: 'both' })),
    sect({ start: 1 }),
  ].join('');
  return paketDocx(body);
}

/* ---------------------------------------------------------------- pengujian */

const periksa = (bytes, opsi = {}) => PT.periksa(bytes, Object.assign({ inflateRaw, tahunSekarang: 2026, kamus }, opsi));
const temukan = (h, grup, judul) => h.temuan.filter((t) => t.grup === grup && (judul instanceof RegExp ? judul.test(t.judul) : t.judul.includes(judul)));
const gagalSaja = (h) => h.temuan.filter((t) => t.status === 'gagal').map((t) => `${t.grup}: ${t.judul} — ${t.pesan.slice(0, 120)}`);
function harap(h, grup, judul, status, nama) {
  const t = temukan(h, grup, judul);
  cek(t.some((x) => x.status === status), nama, `harap [${status}] ${grup} "${judul}", ditemukan: ${t.map((x) => `[${x.status}] ${x.judul}`).join(' | ') || '(tidak ada)'}`);
}
async function bolakBalik(bytes, nama) {
  const h = await periksa(bytes);
  const out = await h.buatDocxBertanda(deflateRaw);
  if (process.env.SIMPAN_CONTOH) {
    // Untuk diperiksa dengan Word sungguhan: SIMPAN_CONTOH=<folder> node scripts/uji-pemeriksa-ta.mjs
    const berkas = nama.replace(/[^a-z0-9]+/gi, '-');
    fs.writeFileSync(path.join(process.env.SIMPAN_CONTOH, `${berkas}.docx`), bytes);
    fs.writeFileSync(path.join(process.env.SIMPAN_CONTOH, `${berkas}-diperiksa.docx`), out.bytes);
  }
  const asli = PT._uji.bukaZip(bytes), baru = PT._uji.bukaZip(out.bytes);
  const teksDoc = async (zip) => {
    const e = zip.cari('word/document.xml');
    return new TextDecoder().decode(e.metode === 8 ? zlib.inflateRawSync(zip.mentah(e)) : zip.mentah(e));
  };
  const xmlBaru = await teksDoc(baru);
  const teksDari = (xml) => xml.replace(/^<\?xml[^>]*\?>\s*/, '').replace(/<w:p\/>/g, '<w:p></w:p>').replace(/<w:instrText[^>]*>[\s\S]*?<\/w:instrText>/g, '').replace(/<w:p[ >][\s\S]*?<\/w:p>/g, (m) => '\n' + [...m.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('')).replace(/<[^>]+>/g, '');
  const barisAsli = teksDari(await teksDoc(asli)).split('\n'), barisBaru = teksDari(xmlBaru).split('\n');
  const beda = barisAsli.findIndex((b, k) => b !== barisBaru[k]);
  cek(beda < 0 && barisAsli.length === barisBaru.length, `${nama}: teks naskah bertanda identik dengan aslinya`,
    beda < 0 ? `jumlah paragraf ${barisAsli.length} → ${barisBaru.length}` : `paragraf ${beda}:\n    asli: ${JSON.stringify(barisAsli[beda])}\n    baru: ${JSON.stringify(barisBaru[beda])}`);
  const kom = baru.cari('word/comments.xml');
  cek(!!kom, `${nama}: word/comments.xml ditulis`);
  const xmlKom = kom ? new TextDecoder().decode(zlib.inflateRawSync(baru.mentah(kom))) : '';
  const nKom = (xmlKom.match(/<w:comment /g) || []).length;
  cek(nKom === out.jumlahKomentar && nKom > 0, `${nama}: jumlah komentar ${nKom} = ${out.jumlahKomentar}`);
  cek((xmlBaru.match(/<w:commentRangeStart /g) || []).length === nKom && (xmlBaru.match(/<w:commentReference /g) || []).length === nKom, `${nama}: tiap komentar punya jangkar di naskah`);
  if (out.jumlahSorot) cek(/<w:highlight w:val="yellow"\/>/.test(xmlBaru), `${nama}: sorotan kuning tertulis`);
  const rels = new TextDecoder().decode(zlib.inflateRawSync(baru.mentah(baru.cari('word/_rels/document.xml.rels'))));
  cek(/relationships\/comments" Target="comments\.xml"/.test(rels), `${nama}: relasi comments ditambahkan`);
  const ct = baru.cari('[Content_Types].xml');
  const xmlCt = new TextDecoder().decode(ct.metode === 8 ? zlib.inflateRawSync(baru.mentah(ct)) : baru.mentah(ct));
  cek(/PartName="\/word\/comments\.xml"/.test(xmlCt), `${nama}: content type comments ditambahkan`);
  const ulang = await periksa(out.bytes);
  cek(ulang.bagian.length === h.bagian.length, `${nama}: naskah bertanda dapat diperiksa ulang`);
  return { h, out };
}

const baik = await periksa(naskahPublikasi());
cek(baik.meta.skema === 'publikasi', 'naskah publikasi dikenali sebagai skema publikasi', baik.meta.skema);
// Naskah contoh tanpa tabel dan gambar, jadi tanpa Daftar Tabel dan Daftar Gambar.
cek(baik.bagian.length === 14, 'naskah publikasi: 14 bagian dikenali', baik.bagian.map((b) => b.kunci).join(','));
cek(gagalSaja(baik).length === 0, 'naskah publikasi patuh: tanpa temuan gagal', gagalSaja(baik).join('\n    '));
harap(baik, 'nomor', 'Halaman judul bernomor i', 'lulus', 'halaman judul bernomor i');
harap(baik, 'nomor', 'Naskah Publikasi Ilmiah bernomor 1', 'lulus', 'naskah mulai halaman 1');
harap(baik, 'umum', 'Margin 4-3-3-3 cm', 'lulus', 'margin 4-3-3-3');
harap(baik, 'abstrak', /^270 kata/, 'lulus', 'abstrak 270 kata');
harap(baik, 'turnitin', 'Kemiripan 18%', 'lulus', 'turnitin 18% terbaca');
harap(baik, 'naskah', 'reference manager', 'lulus', 'Zotero terdeteksi');
harap(baik, 'sampul', 'Logo UMB 3,5 × 3 cm', 'lulus', 'ukuran logo');
await bolakBalik(naskahPublikasi(), 'publikasi patuh');

const kasus = [
  ['margin kanan 2,54 cm', { marginKanan: 1440 }, 'umum', 'Margin tidak sesuai', 'gagal'],
  ['huruf Calibri', { calibri: true }, 'umum', 'Huruf selain Times New Roman', 'gagal'],
  ['abstrak 200 kata', { abstrak200: true }, 'abstrak', 'Abstrak 200 kata', 'gagal'],
  ['7 kata kunci', { kunci7: true }, 'abstrak', '7 kata kunci', 'gagal'],
  ['tanpa LoA', { tanpaLoA: true }, 'struktur', 'Bagian wajib belum ada', 'gagal'],
  ['urutan tertukar', { tukarUrutan: true }, 'struktur', 'Urutan bagian tidak sesuai', 'gagal'],
  ['sisa petunjuk templat', { placeholder: true }, 'bersih', 'Sisa petunjuk templat', 'gagal'],
  ['track changes', { revisi: true }, 'bersih', 'Masih ada Track Changes', 'gagal'],
  ['bagian awal angka Latin', { awalDesimal: true }, 'nomor', 'Bagian awal belum bernomor romawi kecil', 'gagal'],
  ['judul bertanda tanya', { judul: 'BAGAIMANA MEMANTAU GETARAN POMPA?' }, 'sampul', 'Judul tidak sesuai ketentuan', 'gagal'],
  ['urutan terima kasih', { urutanKP: true }, 'kataPengantar', 'Urutan ucapan terima kasih tidak sesuai', 'gagal'],
  ['turnitin 35%', { turnitin35: true }, 'turnitin', 'Kemiripan 35% melebihi 30%', 'gagal'],
  ['kata pengantar tanpa page break', { tanpaPutusKP: true }, 'struktur', 'Bagian tidak dimulai di halaman baru', 'gagal'],
];
for (const [nama, o, grup, judul, status] of kasus) harap(await periksa(naskahPublikasi(o)), grup, judul, status, nama);

const bhs = await periksa(naskahPublikasi({ bahasa: true }));
for (const [jenis, judul] of [['spasi', 'Spasi ganda'], ['ulang', 'Kata berulang'], ['baku', 'Kata tidak baku'], ['di', 'Awalan di- ditulis terpisah'],
  ['satuan', 'Angka menempel pada satuan'], ['asing', 'Istilah asing belum miring'], ['tanda baca', 'Spasi di sekitar tanda baca'],
  ['kapital awal', 'Huruf pertama kalimat belum kapital'], ['kapital tengah', 'Kapital di tengah kalimat']]) {
  cek(temukan(bhs, 'bahasa', judul).length > 0, `kebahasaan: ${jenis} terdeteksi`, bhs.temuan.filter((t) => t.grup === 'bahasa').map((t) => t.judul).join(' | '));
}
cek(temukan(baik, 'bahasa', 'Huruf pertama kalimat').length === 0, 'kebahasaan: singkatan gelar (M.Eng., S.T.) tidak dianggap akhir kalimat',
  temukan(baik, 'bahasa', 'Huruf pertama kalimat').flatMap((t) => t.rincian.map((x) => x.teks)).join(' | '));
const { out: outBhs } = await bolakBalik(naskahPublikasi({ bahasa: true }), 'publikasi berkesalahan bahasa');
cek(outBhs.jumlahSorot >= 9, `kebahasaan: sorotan tertulis (${outBhs.jumlahSorot})`);

// Ejaan: naskah patuh tanpa salah ketik maupun istilah asing tegak; salah ketik tertangkap dan bersaran.
cek(temukan(baik, 'bahasa', /salah ketik|Istilah asing/).length === 0, 'ejaan: naskah patuh tanpa salah ketik/istilah asing',
  temukan(baik, 'bahasa', /salah ketik|Istilah asing/).flatMap((t) => t.rincian.map((x) => x.teks)).join(' | '));
{
  const h = await periksa(naskahPublikasi({ typo: true }));
  const t = temukan(h, 'bahasa', 'Kemungkinan salah ketik')[0];
  const teks = t ? t.rincian.map((x) => x.teks).join(' | ') : '';
  cek(t && t.status === 'gagal' && /pengujain → pengujian/.test(teks) && /dilakuakn → dilakukan/.test(teks), 'ejaan: salah ketik tertangkap dengan saran', teks);
  cek(t && t.tanda.length === 2 && t.tanda.every((x) => x.hl), 'ejaan: tiap salah ketik disorot');
  const tanpa = await periksa(naskahPublikasi({ typo: true }), { kamus: null });
  cek(!temukan(tanpa, 'bahasa', 'Kemungkinan salah ketik').length && temukan(tanpa, 'bahasa', 'Salah ketik (typo)').some((x) => x.status === 'manual'),
    'ejaan: tanpa kamus, salah ketik menjadi butir periksa sendiri');
  await bolakBalik(naskahPublikasi({ typo: true }), 'publikasi bersalah ketik');
}

try { await periksa(new Uint8Array([0xD0, 0xCF, 0x11, 0xE0, 0, 0, 0, 0])); cek(false, '.doc lama ditolak'); }
catch (e) { cek(e.kode === 'ole', '.doc lama ditolak dengan pesan simpan sebagai .docx', e.message); }
try { await periksa(new TextEncoder().encode('%PDF-1.7')); cek(false, 'PDF ditolak'); }
catch (e) { cek(e.kode === 'bukan-docx', 'PDF ditolak', e.message); }

const skripsi = await periksa(naskahSkripsi());
cek(skripsi.meta.skema === 'skripsi', 'naskah berbab dikenali sebagai skema skripsi', skripsi.meta.skema);
cek(gagalSaja(skripsi).length === 0, 'naskah skripsi patuh: tanpa temuan gagal', gagalSaja(skripsi).join('\n    '));
harap(skripsi, 'isi', 'Judul bab sesuai', 'lulus', 'judul bab');
harap(skripsi, 'isi', 'Judul tabel dan gambar sesuai', 'lulus', 'keterangan tabel/gambar');
harap(skripsi, 'pustaka', 'Urut abjad', 'lulus', 'pustaka urut abjad');
harap(skripsi, 'nomor', 'BAB I bernomor 1', 'lulus', 'BAB I halaman 1');
harap(await periksa(naskahSkripsi({ subbabDalam: true })), 'isi', 'Subbab lebih dari 2 tingkat', 'gagal', 'subbab 1.1.1.1');
harap(await periksa(naskahSkripsi({ kapsiTitik: true })), 'isi', 'Judul tabel/gambar belum sesuai', 'gagal', 'titik sesudah nomor tabel');
harap(await periksa(naskahSkripsi({ pustakaAcak: true })), 'pustaka', 'Belum urut abjad', 'gagal', 'pustaka tidak urut');
harap(await periksa(naskahSkripsi({ pustakaLama: true })), 'pustaka', /^Sumber terbaru baru/, 'gagal', 'pustaka lama');
await bolakBalik(naskahSkripsi({ subbabDalam: true, kapsiTitik: true }), 'skripsi bercacat');

// Templat resmi (privat): hanya bila tersedia di mesin ini.
const templat = process.env.TEMPLAT_TA || path.join(root, '..', 'kurikulum-teknik-mesin', 'tugas-akhir', 'Template-TA-S1-Publikasi-Ilmiah-UMB-2025.docx');
if (fs.existsSync(templat)) {
  const bytes = new Uint8Array(fs.readFileSync(templat));
  const h = await periksa(bytes);
  cek(h.bagian.length === 16, 'templat resmi: 16 bagian dikenali', h.bagian.map((b) => b.kunci).join(','));
  harap(h, 'bersih', 'Sisa petunjuk templat', 'gagal', 'templat resmi: petunjuk templat ditandai');
  harap(h, 'bersih', 'Kotak label templat belum dihapus', 'gagal', 'templat resmi: kotak label ditandai');
  await bolakBalik(bytes, 'templat resmi');
  console.log('Templat resmi ikut diuji.');
} else {
  console.log('Templat resmi tidak tersedia di mesin ini; uji templat dilewati.');
}

console.log(`${lulus} lulus, ${gagal} gagal`);
process.exit(gagal ? 1 : 0);
