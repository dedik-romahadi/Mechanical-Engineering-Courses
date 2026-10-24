/* Pemeriksa Format Tugas Akhir UMB — inti tanpa DOM.
 *
 * Dipakai Tugas-Akhir/Pemeriksa-Format-TA.html dan diuji scripts/uji-pemeriksa-ta.mjs.
 * Acuan: Pedoman Teknis Penyusunan dan Penulisan Tugas Akhir UMB (Agustus 2025,
 * SK Rektor 01/032/Skep/VIII/2025) dan templat TA S1 skema Publikasi Ilmiah 2025.
 * Berkas sumber kedua acuan itu disimpan di repo privat, bukan di sini.
 *
 * Alur: buka .docx (ZIP) → urai XML → model paragraf/halaman/section → kenali
 * bagian naskah → periksa aturan format dan kebahasaan → tulis ulang .docx dengan
 * sorotan kuning pada teks yang salah dan komentar Word untuk penjelasannya.
 * Semua berjalan di perangkat pengguna; tidak ada data yang dikirim ke mana pun.
 */
(function (global) {
'use strict';

const VERSI = '1.1.0';
const W_URI = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const PENULIS_KOMENTAR = 'Pemeriksa Format TA';

class GalatBerkas extends Error {
  constructor(kode, pesan) { super(pesan); this.name = 'GalatBerkas'; this.kode = kode; }
}

/* ================================================================ ZIP */

const u16 = (b, o) => b[o] | (b[o + 1] << 8);
const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;
const TABEL_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(b) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < b.length; i++) c = TABEL_CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function bukaZip(bytes) {
  if (!bytes || bytes.length < 4) throw new GalatBerkas('kosong', 'Berkas kosong atau rusak.');
  if (bytes[0] === 0xD0 && bytes[1] === 0xCF && bytes[2] === 0x11 && bytes[3] === 0xE0) {
    throw new GalatBerkas('ole', 'Berkas ini berformat Word lama (.doc) atau dikunci kata sandi. ' +
      'Buka di Word, pilih File → Save As → Word Document (.docx) tanpa kata sandi, lalu periksa lagi.');
  }
  if (bytes[0] !== 0x50 || bytes[1] !== 0x4B) {
    throw new GalatBerkas('bukan-docx', 'Berkas ini bukan dokumen .docx. Bila naskah berupa PDF, periksa versi .docx-nya.');
  }
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (u32(bytes, i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new GalatBerkas('rusak', 'Struktur berkas .docx rusak (direktori ZIP tidak ditemukan).');
  const jumlah = u16(bytes, eocd + 10);
  let p = u32(bytes, eocd + 16);
  if (jumlah === 0xFFFF || p === 0xFFFFFFFF) throw new GalatBerkas('rusak', 'Berkas terlalu besar untuk diperiksa (ZIP64).');
  const dek = new TextDecoder('utf-8');
  const entri = [];
  for (let k = 0; k < jumlah; k++) {
    if (p + 46 > bytes.length || u32(bytes, p) !== 0x02014b50) throw new GalatBerkas('rusak', 'Struktur berkas .docx rusak.');
    const nNama = u16(bytes, p + 28), nEkstra = u16(bytes, p + 30), nKom = u16(bytes, p + 32);
    entri.push({
      nama: dek.decode(bytes.subarray(p + 46, p + 46 + nNama)),
      flag: u16(bytes, p + 8), metode: u16(bytes, p + 10), crc: u32(bytes, p + 16),
      ukuranZ: u32(bytes, p + 20), ukuranAsli: u32(bytes, p + 24), ofsLokal: u32(bytes, p + 42),
    });
    p += 46 + nNama + nEkstra + nKom;
  }
  const peta = new Map(entri.map((e) => [e.nama.toLowerCase(), e]));
  const mentah = (e) => {
    const l = e.ofsLokal;
    if (u32(bytes, l) !== 0x04034b50) throw new GalatBerkas('rusak', 'Struktur berkas .docx rusak.');
    const mulai = l + 30 + u16(bytes, l + 26) + u16(bytes, l + 28);
    return bytes.subarray(mulai, mulai + e.ukuranZ);
  };
  return { entri, cari: (n) => peta.get(String(n).toLowerCase()) || null, mentah };
}

async function bacaEntri(zip, nama, inflateRaw) {
  const e = zip.cari(nama);
  if (!e) return null;
  if (e.flag & 1) throw new GalatBerkas('enkripsi', 'Berkas dilindungi kata sandi. Simpan ulang tanpa kata sandi.');
  const data = zip.mentah(e);
  if (e.metode === 0) return data;
  if (e.metode === 8) return inflateRaw(data);
  throw new GalatBerkas('rusak', 'Metode kompresi di dalam .docx tidak didukung.');
}

function dekodeTeks(b) {
  if (!b) return null;
  if (b.length >= 2 && b[0] === 0xFF && b[1] === 0xFE) return new TextDecoder('utf-16le').decode(b.subarray(2));
  if (b.length >= 2 && b[0] === 0xFE && b[1] === 0xFF) return new TextDecoder('utf-16be').decode(b.subarray(2));
  return new TextDecoder('utf-8').decode(b);
}

function tulisZip(daftar) {
  const enc = new TextEncoder();
  const d = new Date();
  const waktu = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF;
  const tanggal = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
  const bagian = [], pusat = [];
  let ofs = 0;
  for (const e of daftar) {
    const nm = enc.encode(e.nama);
    const lh = new Uint8Array(30 + nm.length), v = new DataView(lh.buffer);
    v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x0800, true);
    v.setUint16(8, e.metode, true); v.setUint16(10, waktu, true); v.setUint16(12, tanggal, true);
    v.setUint32(14, e.crc, true); v.setUint32(18, e.data.length, true); v.setUint32(22, e.ukuranAsli, true);
    v.setUint16(26, nm.length, true); lh.set(nm, 30);
    const ch = new Uint8Array(46 + nm.length), w = new DataView(ch.buffer);
    w.setUint32(0, 0x02014b50, true); w.setUint16(4, 20, true); w.setUint16(6, 20, true); w.setUint16(8, 0x0800, true);
    w.setUint16(10, e.metode, true); w.setUint16(12, waktu, true); w.setUint16(14, tanggal, true);
    w.setUint32(16, e.crc, true); w.setUint32(20, e.data.length, true); w.setUint32(24, e.ukuranAsli, true);
    w.setUint16(28, nm.length, true); w.setUint32(42, ofs, true); ch.set(nm, 46);
    bagian.push(lh, e.data); pusat.push(ch);
    ofs += lh.length + e.data.length;
  }
  const ukPusat = pusat.reduce((s, x) => s + x.length, 0);
  const eocd = new Uint8Array(22), z = new DataView(eocd.buffer);
  z.setUint32(0, 0x06054b50, true); z.setUint16(8, daftar.length, true); z.setUint16(10, daftar.length, true);
  z.setUint32(12, ukPusat, true); z.setUint32(16, ofs, true);
  const semua = [...bagian, ...pusat, eocd];
  const out = new Uint8Array(semua.reduce((s, x) => s + x.length, 0));
  let o = 0;
  for (const x of semua) { out.set(x, o); o += x.length; }
  return out;
}

/* ================================================================ XML */

// Prefiks kanonis per namespace, supaya pencocokan nama tidak bergantung pada
// prefiks yang kebetulan dipakai penulis berkas (Word, LibreOffice, Google Docs).
const NS = {
  [W_URI]: 'w',
  'http://purl.oclc.org/ooxml/wordprocessingml/main': 'w',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships': 'r',
  'http://purl.oclc.org/ooxml/officeDocument/relationships': 'r',
  'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing': 'wp',
  'http://purl.oclc.org/ooxml/drawingml/wordprocessingDrawing': 'wp',
  'http://schemas.openxmlformats.org/drawingml/2006/main': 'a',
  'http://purl.oclc.org/ooxml/drawingml/main': 'a',
  'http://schemas.openxmlformats.org/drawingml/2006/picture': 'pic',
  'http://purl.oclc.org/ooxml/drawingml/picture': 'pic',
  'http://schemas.openxmlformats.org/drawingml/2006/chart': 'c',
  'http://schemas.openxmlformats.org/markup-compatibility/2006': 'mc',
  'http://schemas.openxmlformats.org/officeDocument/2006/math': 'm',
  'http://purl.oclc.org/ooxml/officeDocument/math': 'm',
  'urn:schemas-microsoft-com:vml': 'v',
  'http://schemas.microsoft.com/office/word/2010/wordprocessingShape': 'wps',
  'http://schemas.openxmlformats.org/package/2006/relationships': 'pr',
  'http://schemas.openxmlformats.org/package/2006/content-types': 'ct',
  'http://schemas.openxmlformats.org/officeDocument/2006/extended-properties': 'ep',
  'http://purl.oclc.org/ooxml/officeDocument/extendedProperties': 'ep',
};
const ENTITAS = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" };
function dekodeEntitas(s) {
  if (s.indexOf('&') < 0) return s;
  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (m, k) => {
    if (k[0] === '#') {
      const c = k[1] === 'x' || k[1] === 'X' ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10);
      return Number.isFinite(c) && c > 0 && c < 0x110000 ? String.fromCodePoint(c) : m;
    }
    return ENTITAS[k] !== undefined ? ENTITAS[k] : m;
  });
}
const TEKS_UTUH = new Set(['w:t', 'w:instrText', 'w:delText', 'm:t', 'a:t']);
const RX_ATRIBUT = /([^\s=/]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

// Simpul elemen: n = nama kanonis, q = nama asli, a = atribut kanonis,
// o = atribut asli [k1, v1, k2, v2, ...] (termasuk xmlns) untuk ditulis ulang.
function uraiXml(src) {
  const akar = { n: '#akar', q: '#akar', a: {}, o: [], c: [], deklarasi: '' };
  const tumpuk = [akar];
  const petaNs = [{ xml: 'xml' }];
  const L = src.length;
  let i = 0;
  if (src.charCodeAt(0) === 0xFEFF) i = 1;
  const kanon = (qn, peta, atribut) => {
    const t = qn.indexOf(':');
    if (t < 0) return atribut ? qn : (peta[''] ? peta[''] + ':' + qn : qn);
    const pre = qn.slice(0, t);
    return (peta[pre] || pre) + ':' + qn.slice(t + 1);
  };
  const tambahTeks = (t) => {
    const ortu = tumpuk[tumpuk.length - 1];
    if (ortu === akar || !t) return;
    if (!TEKS_UTUH.has(ortu.n) && !/\S/.test(t)) return;
    ortu.c.push({ t: dekodeEntitas(t) });
  };
  while (i < L) {
    const lt = src.indexOf('<', i);
    if (lt < 0) { tambahTeks(src.slice(i)); break; }
    if (lt > i) tambahTeks(src.slice(i, lt));
    const c1 = src.charCodeAt(lt + 1);
    if (c1 === 33) { // !
      if (src.startsWith('<!--', lt)) { const e = src.indexOf('-->', lt + 4); i = e < 0 ? L : e + 3; continue; }
      if (src.startsWith('<![CDATA[', lt)) {
        const e = src.indexOf(']]>', lt + 9);
        const ortu = tumpuk[tumpuk.length - 1];
        if (ortu !== akar) ortu.c.push({ t: src.slice(lt + 9, e < 0 ? L : e) });
        i = e < 0 ? L : e + 3; continue;
      }
      throw new GalatBerkas('rusak', 'Dokumen memuat deklarasi DOCTYPE yang tidak didukung.');
    }
    if (c1 === 63) { // ?
      const e = src.indexOf('?>', lt + 2);
      if (!akar.deklarasi && src.startsWith('<?xml', lt)) akar.deklarasi = src.slice(lt, e < 0 ? L : e + 2);
      i = e < 0 ? L : e + 2; continue;
    }
    if (c1 === 47) { // /
      const e = src.indexOf('>', lt + 2);
      if (tumpuk.length > 1) { tumpuk.pop(); petaNs.pop(); }
      i = e < 0 ? L : e + 1; continue;
    }
    let j = lt + 1, kutip = 0;
    for (; j < L; j++) {
      const ch = src.charCodeAt(j);
      if (kutip) { if (ch === kutip) kutip = 0; } else if (ch === 34 || ch === 39) kutip = ch; else if (ch === 62) break;
    }
    let mentah = src.slice(lt + 1, j);
    const tutup = mentah.charCodeAt(mentah.length - 1) === 47;
    if (tutup) mentah = mentah.slice(0, -1);
    let s = 0;
    while (s < mentah.length && !/\s/.test(mentah[s])) s++;
    const qn = mentah.slice(0, s);
    const induk = petaNs[petaNs.length - 1];
    let peta = induk;
    const atrAsli = [];
    if (s < mentah.length) {
      RX_ATRIBUT.lastIndex = s;
      let m;
      while ((m = RX_ATRIBUT.exec(mentah))) {
        const k = m[1], v = dekodeEntitas(m[2] !== undefined ? m[2] : m[3]);
        atrAsli.push(k, v);
        if (k === 'xmlns' || k.startsWith('xmlns:')) {
          if (peta === induk) peta = Object.assign({}, induk);
          if (k === 'xmlns') peta[''] = NS[v] || '';
          else peta[k.slice(6)] = NS[v] || k.slice(6);
        }
      }
    }
    const el = { n: kanon(qn, peta, false), q: qn, a: {}, o: atrAsli, c: [] };
    for (let t = 0; t < atrAsli.length; t += 2) {
      const k = atrAsli[t];
      if (k !== 'xmlns' && !k.startsWith('xmlns:')) el.a[kanon(k, peta, true)] = atrAsli[t + 1];
    }
    tumpuk[tumpuk.length - 1].c.push(el);
    if (!tutup) { tumpuk.push(el); petaNs.push(peta); }
    i = j + 1;
  }
  return akar;
}
const uraiOpsional = (s) => (s ? uraiXml(s) : null);

const escTeks = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAtr = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/\r/g, '&#13;').replace(/\n/g, '&#10;').replace(/\t/g, '&#9;');
function serialXml(akar) {
  const out = [(akar.deklarasi || '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>') + '\r\n'];
  const tulis = (el) => {
    if (el.t !== undefined) { out.push(escTeks(el.t)); return; }
    let s = '<' + el.q;
    for (let i = 0; i < el.o.length; i += 2) s += ' ' + el.o[i] + '="' + escAtr(el.o[i + 1]) + '"';
    if (!el.c.length) { out.push(s + '/>'); return; }
    out.push(s + '>');
    for (const c of el.c) tulis(c);
    out.push('</' + el.q + '>');
  };
  for (const c of akar.c) tulis(c);
  return out.join('');
}

const anak = (el, n) => { if (!el) return null; for (const c of el.c) if (c.n === n) return c; return null; };
const semuaAnak = (el, n) => (el ? el.c.filter((c) => c.n === n) : []);
function cari(el, n) {
  if (!el) return null;
  for (const c of el.c) {
    if (!c.n) continue;
    if (c.n === n) return c;
    const r = cari(c, n);
    if (r) return r;
  }
  return null;
}
function cariSemua(el, n, out = []) {
  if (!el) return out;
  for (const c of el.c) {
    if (!c.n) continue;
    if (c.n === n) out.push(c);
    cariSemua(c, n, out);
  }
  return out;
}
const teksSimpul = (el) => { let s = ''; for (const c of el.c) s += c.t !== undefined ? c.t : teksSimpul(c); return s; };
const atr = (el, k) => (el && el.a[k] !== undefined ? el.a[k] : null);
const val = (el) => atr(el, 'w:val');
const togel = (el) => { if (!el) return false; const v = el.a['w:val']; return v == null || !(v === '0' || v === 'false' || v === 'off'); };
function ukur(v) { // twips
  if (v == null || v === '') return null;
  if (/^-?\d+(\.\d+)?$/.test(v)) return parseFloat(v);
  const m = /^(-?\d+(?:\.\d+)?)(mm|cm|in|pt|pc|pi)$/.exec(v);
  if (!m) { const x = parseFloat(v); return Number.isFinite(x) ? x : null; }
  return parseFloat(m[1]) * { mm: 56.6929, cm: 566.929, in: 1440, pt: 20, pc: 240, pi: 240 }[m[2]];
}
function ukurSetengahPt(v) {
  if (v == null || v === '') return null;
  if (/^\d+(\.\d+)?$/.test(v)) return parseFloat(v);
  const tw = ukur(v);
  return tw == null ? null : tw / 10;
}
function salinSimpul(el) {
  if (el.t !== undefined) return { t: el.t };
  return { n: el.n, q: el.q, a: Object.assign({}, el.a), o: el.o.slice(), c: el.c.map(salinSimpul) };
}

/* ================================================================ Gaya */

function normJc(v) {
  if (!v) return null;
  if (/^(both|distribute|thaiDistribute|highKashida|mediumKashida|lowKashida)$/.test(v)) return 'justify';
  if (v === 'center') return 'center';
  if (v === 'right' || v === 'end') return 'right';
  return 'left';
}
function terapkanPPr(o, pPr) {
  if (!pPr) return o;
  for (const c of pPr.c) {
    switch (c.n) {
      case 'w:jc': o.jc = normJc(val(c)); break;
      case 'w:spacing': {
        const g = (k) => atr(c, k);
        if (g('w:line') !== null) { o.line = ukur(g('w:line')); o.lineRule = g('w:lineRule') || 'auto'; }
        else if (g('w:lineRule')) o.lineRule = g('w:lineRule');
        if (g('w:before') !== null) o.before = ukur(g('w:before'));
        if (g('w:after') !== null) o.after = ukur(g('w:after'));
        if (g('w:beforeLines') !== null) o.before = ukur(g('w:beforeLines')) * 2.4;
        if (g('w:afterLines') !== null) o.after = ukur(g('w:afterLines')) * 2.4;
        if (g('w:beforeAutospacing') !== null) o.beforeAuto = !/^(0|false|off)$/.test(g('w:beforeAutospacing'));
        if (g('w:afterAutospacing') !== null) o.afterAuto = !/^(0|false|off)$/.test(g('w:afterAutospacing'));
        break;
      }
      case 'w:ind': {
        const g = (k) => atr(c, k);
        const kiri = g('w:left') !== null ? g('w:left') : g('w:start');
        const kanan = g('w:right') !== null ? g('w:right') : g('w:end');
        if (kiri !== null) o.kiri = ukur(kiri);
        if (kanan !== null) o.kanan = ukur(kanan);
        if (g('w:hanging') !== null) { o.gantung = ukur(g('w:hanging')); o.awal = 0; }
        if (g('w:firstLine') !== null) { o.awal = ukur(g('w:firstLine')); o.gantung = 0; }
        break;
      }
      case 'w:pageBreakBefore': o.pbb = togel(c); break;
      case 'w:outlineLvl': o.outline = parseInt(val(c), 10); break;
      case 'w:numPr': {
        const id = val(anak(c, 'w:numId'));
        if (id !== null) o.numId = id;
        break;
      }
      default: break;
    }
  }
  return o;
}
function terapkanRPr(o, rPr) {
  if (!rPr) return o;
  for (const c of rPr.c) {
    switch (c.n) {
      case 'w:rFonts': {
        const A = (k) => atr(c, k);
        // Font eksplisit pada tingkat yang lebih spesifik membatalkan font tema warisan.
        if (A('w:asciiTheme')) o.asciiTheme = A('w:asciiTheme'); else if (A('w:ascii')) o.asciiTheme = null;
        if (A('w:ascii')) o.ascii = A('w:ascii');
        if (A('w:hAnsiTheme')) o.hAnsiTheme = A('w:hAnsiTheme'); else if (A('w:hAnsi')) o.hAnsiTheme = null;
        if (A('w:hAnsi')) o.hAnsi = A('w:hAnsi');
        break;
      }
      case 'w:sz': o.sz = ukurSetengahPt(val(c)); break;
      case 'w:b': o.b = togel(c); break;
      case 'w:i': o.i = togel(c); break;
      case 'w:caps': o.caps = togel(c); break;
      case 'w:smallCaps': o.smallCaps = togel(c); break;
      case 'w:vanish': o.vanish = togel(c); break;
      case 'w:color': o.color = val(c); break;
      case 'w:highlight': o.highlight = val(c); break;
      case 'w:vertAlign': o.vert = val(c); break;
      default: break;
    }
  }
  return o;
}
function bacaGaya(stylesXml, themeXml) {
  const tema = { minor: 'Calibri', major: 'Calibri Light' };
  if (themeXml) {
    const lat = (x) => atr(anak(x, 'a:latin'), 'typeface');
    const mi = cari(themeXml, 'a:minorFont'), ma = cari(themeXml, 'a:majorFont');
    if (mi && lat(mi)) tema.minor = lat(mi);
    if (ma && lat(ma)) tema.major = lat(ma);
  }
  const daftar = new Map();
  let defP = null, ddR = null, ddP = null;
  const akar = stylesXml ? cari(stylesXml, 'w:styles') : null;
  if (akar) {
    const dd = anak(akar, 'w:docDefaults');
    if (dd) {
      ddR = anak(anak(dd, 'w:rPrDefault'), 'w:rPr');
      ddP = anak(anak(dd, 'w:pPrDefault'), 'w:pPr');
    }
    for (const s of semuaAnak(akar, 'w:style')) {
      const id = atr(s, 'w:styleId');
      if (!id) continue;
      const tipe = atr(s, 'w:type') || 'paragraph';
      daftar.set(id, {
        id, tipe, nama: val(anak(s, 'w:name')) || id, basis: val(anak(s, 'w:basedOn')),
        pPr: anak(s, 'w:pPr'), rPr: anak(s, 'w:rPr'), tblPr: anak(s, 'w:tblPr'),
      });
      const def = atr(s, 'w:default');
      if ((def === '1' || def === 'true') && tipe === 'paragraph') defP = id;
    }
  }
  const rantai = (id) => {
    const out = [], lihat = new Set();
    let cur = id;
    while (cur && daftar.has(cur) && !lihat.has(cur)) { lihat.add(cur); out.unshift(daftar.get(cur)); cur = daftar.get(cur).basis; }
    return out;
  };
  const cache = new Map();
  const simpan = (k, f) => { if (!cache.has(k)) cache.set(k, f()); return cache.get(k); };
  const dasarP = terapkanPPr({}, ddP);
  const dasarR = terapkanRPr({}, ddR);
  return {
    tema, defP, dasarP, dasarR,
    pGaya: (id) => simpan('p:' + (id || defP), () => { const o = {}; for (const s of rantai(id || defP)) terapkanPPr(o, s.pPr); return o; }),
    rGayaP: (id) => simpan('r:' + (id || defP), () => { const o = {}; for (const s of rantai(id || defP)) terapkanRPr(o, s.rPr); return o; }),
    rGayaK: (id) => (id ? simpan('k:' + id, () => { const o = {}; for (const s of rantai(id)) terapkanRPr(o, s.rPr); return o; }) : {}),
    jcTabel: (id) => { for (const s of rantai(id).reverse()) { const j = val(anak(s.tblPr, 'w:jc')); if (j) return normJc(j); } return null; },
    nama: (id) => (daftar.get(id || defP) || {}).nama || '',
  };
}
function namaFont(r, tema) {
  const t = (x) => (/^major/i.test(x) ? tema.major : tema.minor);
  if (r.asciiTheme) return t(r.asciiTheme);
  if (r.ascii) return r.ascii;
  if (r.hAnsiTheme) return t(r.hAnsiTheme);
  if (r.hAnsi) return r.hAnsi;
  return 'Times New Roman';
}
function warnaBukanHitam(c) {
  if (!c || c === 'auto') return false;
  if (!/^[0-9a-fA-F]{6}$/.test(c)) return false;
  const n = parseInt(c, 16);
  return Math.max((n >> 16) & 255, (n >> 8) & 255, n & 255) > 0x40;
}

/* ================================================================ Model dokumen */

function bangunModel(docXml, gaya) {
  const body = cari(docXml, 'w:body');
  if (!body) throw new GalatBerkas('rusak', 'Isi dokumen (w:body) tidak ditemukan.');
  const paragraf = [], tabel = [], blok = [], seksiXml = [], medan = [], tagSdt = [], kotakTeks = [];
  const tumpukMedan = [];
  const hitung = { revisi: 0, komentar: 0, altChunk: 0 };
  let indeksSeksi = 0;

  const tocAktif = () => tumpukMedan.some((f) => /^\s*TOC\b/i.test(f.instr));
  const catatMedan = (f, rec) => { const s = f.instr.trim(); if (s) { medan.push(s); rec.medan.push(s); } };

  function jelajahBlok(el, ctx) {
    for (const c of el.c) {
      if (!c.n) continue;
      switch (c.n) {
        case 'w:p': prosesParagraf(c, el, ctx); break;
        case 'w:tbl': prosesTabel(c, ctx); break;
        case 'w:sdt': {
          const pr = anak(c, 'w:sdtPr');
          const galeri = pr ? val(cari(pr, 'w:docPartGallery')) : null;
          const tag = pr ? val(anak(pr, 'w:tag')) : null;
          if (tag) tagSdt.push(tag);
          const isi = anak(c, 'w:sdtContent');
          if (isi) jelajahBlok(isi, galeri && /table of contents/i.test(galeri) ? Object.assign({}, ctx, { toc: true }) : ctx);
          break;
        }
        case 'w:customXml': case 'w:smartTag': jelajahBlok(c, ctx); break;
        case 'w:ins': case 'w:moveTo': hitung.revisi++; jelajahBlok(c, ctx); break;
        case 'w:del': case 'w:moveFrom': hitung.revisi++; break;
        case 'mc:AlternateContent': { const ch = anak(c, 'mc:Choice') || anak(c, 'mc:Fallback'); if (ch) jelajahBlok(ch, ctx); break; }
        case 'w:sectPr': seksiXml.push(c); break;
        case 'w:altChunk': hitung.altChunk++; break;
        default: break;
      }
    }
  }
  function anakLewatWadah(el, nama, out = []) {
    for (const c of el.c) {
      if (!c.n) continue;
      if (c.n === nama) out.push(c);
      else if (c.n === 'w:sdt') { const isi = anak(c, 'w:sdtContent'); if (isi) anakLewatWadah(isi, nama, out); }
      else if (c.n === 'w:customXml' || c.n === 'w:ins' || c.n === 'w:moveTo') anakLewatWadah(c, nama, out);
    }
    return out;
  }
  function prosesTabel(tbl, ctx) {
    const tblPr = anak(tbl, 'w:tblPr');
    const idGaya = tblPr ? val(anak(tblPr, 'w:tblStyle')) : null;
    const t = {
      i: tabel.length, jc: (tblPr && normJc(val(anak(tblPr, 'w:jc')))) || gaya.jcTabel(idGaya) || 'left',
      pAwal: paragraf.length, pAkhir: -1, blok: ctx.tabel == null ? blok.length : null,
    };
    tabel.push(t);
    if (ctx.tabel == null) blok.push({ jenis: 'tabel', t: t.i });
    const ctx2 = Object.assign({}, ctx, { tabel: ctx.tabel == null ? t.i : ctx.tabel });
    for (const tr of anakLewatWadah(tbl, 'w:tr')) for (const tc of anakLewatWadah(tr, 'w:tc')) jelajahBlok(tc, ctx2);
    t.pAkhir = paragraf.length - 1;
  }
  function prosesParagraf(p, ortu, ctx) {
    const pPr = anak(p, 'w:pPr');
    const idGaya = (pPr && val(anak(pPr, 'w:pStyle'))) || gaya.defP;
    const ef = terapkanPPr(Object.assign({}, gaya.dasarP, gaya.pGaya(idGaya)), pPr);
    const rDasar = Object.assign({}, gaya.dasarR, gaya.rGayaP(idGaya));
    if (pPr && (anak(pPr, 'w:pPrChange') || cari(anak(pPr, 'w:rPr'), 'w:ins') || cari(anak(pPr, 'w:rPr'), 'w:del'))) hitung.revisi++;
    const namaGaya = gaya.nama(idGaya);
    const rec = {
      i: paragraf.length, node: p, teks: '', seg: [], idGaya, namaGaya,
      jc: ef.jc || 'left', line: ef.line == null ? null : ef.line, lineRule: ef.lineRule || 'auto',
      before: ef.beforeAuto ? 280 : (ef.before || 0), after: ef.afterAuto ? 280 : (ef.after || 0),
      kiri: ef.kiri || 0, awal: ef.awal || 0, gantung: ef.gantung || 0,
      outline: Number.isFinite(ef.outline) && ef.outline < 9 ? ef.outline : null,
      bernomor: !!(ef.numId && ef.numId !== '0'), tabel: ctx.tabel == null ? null : ctx.tabel,
      toc: false, seksi: indeksSeksi, kejadian: [], gambar: [], kotakTeks: [], medan: [], math: false,
      stat: { n: 0, font: {}, ukuran: {}, tebal: 0, miring: 0, kapital: 0, warna: 0, warnaTautan: 0, sorot: 0, tersembunyi: 0 },
    };
    const tocMulai = tocAktif();
    if (ef.pbb) rec.kejadian.push('K');
    jelajahInline(p, rec, rDasar, { tautan: false });
    rec.toc = !!ctx.toc || tocMulai || tocAktif() || /^toc\s?\d|^daftar isi\s?\d|table of figures/i.test(namaGaya) || /^TOC\d/i.test(idGaya || '');
    rec.kosong = !rec.teks.trim() && !rec.gambar.length;
    if (pPr && anak(pPr, 'w:sectPr')) { rec.akhirSeksi = true; seksiXml.push(anak(pPr, 'w:sectPr')); indeksSeksi++; }
    paragraf.push(rec);
    if (ctx.tabel == null) blok.push({ jenis: 'p', p: rec.i });
  }
  function jelajahInline(el, rec, rDasar, ci) {
    for (const c of el.c) {
      if (!c.n) continue;
      switch (c.n) {
        case 'w:r': prosesRun(c, el, rec, rDasar, ci); break;
        case 'w:hyperlink': jelajahInline(c, rec, rDasar, Object.assign({}, ci, { tautan: true })); break;
        case 'w:ins': case 'w:moveTo': hitung.revisi++; jelajahInline(c, rec, rDasar, ci); break;
        case 'w:del': case 'w:moveFrom': hitung.revisi++; break;
        case 'w:smartTag': case 'w:customXml': case 'w:dir': case 'w:bdo': jelajahInline(c, rec, rDasar, ci); break;
        case 'w:sdt': {
          const pr = anak(c, 'w:sdtPr');
          const tag = pr ? val(anak(pr, 'w:tag')) : null;
          if (tag) tagSdt.push(tag);
          const isi = anak(c, 'w:sdtContent');
          if (isi) jelajahInline(isi, rec, rDasar, ci);
          break;
        }
        case 'w:fldSimple': {
          const f = { instr: atr(c, 'w:instr') || '', fase: 'hasil' };
          catatMedan(f, rec);
          tumpukMedan.push(f);
          jelajahInline(c, rec, rDasar, ci);
          tumpukMedan.pop();
          break;
        }
        case 'm:oMath': case 'm:oMathPara': rec.math = true; rec.teks += ' '; break;
        case 'mc:AlternateContent': { const ch = anak(c, 'mc:Choice') || anak(c, 'mc:Fallback'); if (ch) jelajahInline(ch, rec, rDasar, ci); break; }
        default: break;
      }
    }
  }
  function prosesRun(r, ortu, rec, rDasar, ci) {
    const rPr = anak(r, 'w:rPr');
    const rs = rPr ? val(anak(rPr, 'w:rStyle')) : null;
    const e = terapkanRPr(Object.assign({}, rDasar, gaya.rGayaK(rs)), rPr);
    if (rPr && anak(rPr, 'w:rPrChange')) hitung.revisi++;
    const font = namaFont(e, gaya.tema);
    const pt = (e.sz == null ? 20 : e.sz) / 2;
    for (const c of r.c) {
      if (!c.n) continue;
      switch (c.n) {
        case 'w:t': {
          const t = teksSimpul(c);
          if (!t) break;
          if (e.vanish) { rec.stat.tersembunyi += t.length; break; }
          if (tumpukMedan.some((f) => f.fase === 'kode')) break;
          rec.seg.push({ s: rec.teks.length, e: rec.teks.length + t.length, run: r, ortu, tNode: c, i: !!e.i, b: !!e.b, pt, font });
          rec.teks += t;
          tambahStat(rec.stat, t, font, pt, e, ci);
          rec.kejadian.push('T');
          break;
        }
        case 'w:tab': case 'w:ptab': rec.teks += '\t'; break;
        case 'w:br': { const tp = atr(c, 'w:type'); if (tp === 'page') rec.kejadian.push('K'); else if (tp !== 'column') rec.teks += '\n'; break; }
        case 'w:cr': rec.teks += '\n'; break;
        case 'w:noBreakHyphen': rec.teks += '-'; break;
        case 'w:sym': rec.teks += ' '; break;
        case 'w:lastRenderedPageBreak': rec.kejadian.push('L'); break;
        case 'w:fldChar': {
          const tp = atr(c, 'w:fldCharType');
          if (tp === 'begin') tumpukMedan.push({ instr: '', fase: 'kode' });
          else if (tp === 'separate') { const f = tumpukMedan[tumpukMedan.length - 1]; if (f && f.fase === 'kode') { f.fase = 'hasil'; catatMedan(f, rec); } }
          else if (tp === 'end') { const f = tumpukMedan.pop(); if (f && f.fase === 'kode') catatMedan(f, rec); }
          break;
        }
        case 'w:instrText': { const f = tumpukMedan[tumpukMedan.length - 1]; if (f && f.fase === 'kode') f.instr += teksSimpul(c); break; }
        case 'w:drawing': prosesGambar(c, rec); break;
        case 'w:pict': case 'w:object': prosesVml(c, rec); break;
        case 'mc:AlternateContent': {
          const ch = anak(c, 'mc:Choice') || anak(c, 'mc:Fallback');
          if (ch) for (const d of ch.c) { if (d.n === 'w:drawing') prosesGambar(d, rec); else if (d.n === 'w:pict') prosesVml(d, rec); }
          break;
        }
        case 'w:commentReference': hitung.komentar++; break;
        default: break;
      }
    }
  }
  function tambahStat(st, t, font, pt, e, ci) {
    const n = t.replace(/\s/g, '').length;
    if (!n) return;
    st.n += n;
    st.font[font] = (st.font[font] || 0) + n;
    const k = String(Math.round(pt * 2) / 2);
    st.ukuran[k] = (st.ukuran[k] || 0) + n;
    if (e.b) st.tebal += n;
    if (e.i) st.miring += n;
    if (e.caps || e.smallCaps) st.kapital += n;
    if (warnaBukanHitam(e.color)) { if (ci.tautan) st.warnaTautan += n; else st.warna += n; }
    if (e.highlight && e.highlight !== 'none') st.sorot += n;
  }
  function teksKotak(t) { return cariSemua(t, 'w:p').map((p) => cariSemua(p, 'w:t').map(teksSimpul).join('')).join('\n').trim(); }
  function prosesGambar(d, rec) {
    const ext = cari(d, 'wp:extent');
    const cx = parseFloat(atr(ext, 'cx')) || 0, cy = parseFloat(atr(ext, 'cy')) || 0;
    const kotak = cariSemua(d, 'w:txbxContent');
    for (const t of kotak) { const s = teksKotak(t); if (s) { rec.kotakTeks.push(s); kotakTeks.push({ p: rec.i, teks: s }); } }
    const gd = cari(d, 'a:graphicData');
    const uri = atr(gd, 'uri') || '';
    const citra = !!(cari(d, 'pic:pic') || cari(d, 'a:blip') || /chart|diagram/i.test(uri));
    if (citra) rec.gambar.push({ cx, cy, jangkar: !!anak(d, 'wp:anchor') });
    if (citra || !kotak.length) rec.kejadian.push('G');
  }
  function prosesVml(d, rec) {
    const kotak = cariSemua(d, 'w:txbxContent');
    for (const t of kotak) { const s = teksKotak(t); if (s) { rec.kotakTeks.push(s); kotakTeks.push({ p: rec.i, teks: s }); } }
    if (cari(d, 'v:imagedata') || d.n === 'w:object') {
      const shape = cari(d, 'v:shape');
      const st = (shape && atr(shape, 'style')) || '';
      const ukurPt = (k) => { const m = new RegExp(k + '\\s*:\\s*([\\d.]+)(pt|in|cm|mm|px)?').exec(st); if (!m) return 0; const x = parseFloat(m[1]); return x * ({ pt: 12700, in: 914400, cm: 360000, mm: 36000, px: 9525 }[m[2] || 'pt']); };
      rec.gambar.push({ cx: ukurPt('width'), cy: ukurPt('height'), jangkar: false });
      rec.kejadian.push('G');
    }
  }

  jelajahBlok(body, { tabel: null, toc: false });
  const seksi = seksiXml.map(bacaSeksi);
  if (!seksi.length) seksi.push(bacaSeksi(null));
  for (const p of paragraf) if (p.seksi >= seksi.length) p.seksi = seksi.length - 1;
  return { paragraf, tabel, blok, seksi, medan, tagSdt, kotakTeks, hitung };
}

function bacaSeksi(sp) {
  const sz = anak(sp, 'w:pgSz'), mar = anak(sp, 'w:pgMar'), pn = anak(sp, 'w:pgNumType');
  const refs = { footer: {}, header: {} };
  if (sp) for (const c of sp.c) {
    if (c.n === 'w:footerReference') refs.footer[atr(c, 'w:type') || 'default'] = atr(c, 'r:id');
    if (c.n === 'w:headerReference') refs.header[atr(c, 'w:type') || 'default'] = atr(c, 'r:id');
  }
  const m = (k, d) => { const x = ukur(atr(mar, k)); return x == null ? d : Math.abs(x); };
  return {
    jenis: val(anak(sp, 'w:type')) || 'nextPage',
    w: ukur(atr(sz, 'w:w')) || 12240, h: ukur(atr(sz, 'w:h')) || 15840,
    mar: { atas: m('w:top', 1440), bawah: m('w:bottom', 1440), kiri: m('w:left', 1440), kanan: m('w:right', 1440), header: m('w:header', 720), footer: m('w:footer', 720), gutter: m('w:gutter', 0) },
    fmt: atr(pn, 'w:fmt') || 'decimal',
    mulai: atr(pn, 'w:start') != null ? parseInt(atr(pn, 'w:start'), 10) : null,
    titlePg: !!anak(sp, 'w:titlePg') && togel(anak(sp, 'w:titlePg')),
    refs,
  };
}

// Halaman fisik: dihitung dari pemisah halaman keras (page break, section break,
// "page break before") dan, bila ada, penanda tata letak terakhir yang disimpan
// Word (w:lastRenderedPageBreak). Tanpa penanda itu, halaman yang penuh karena
// teks tidak terdeteksi, jadi nomor halaman hanya perkiraan.
function modelHalaman(model) {
  const { paragraf, seksi } = model;
  let hal = 0, adaIsi = false, keras = false, lunak = false, adaLRPB = false;
  for (const p of paragraf) {
    let mulai = false;
    p.kerasSebelum = false; p.lunakSebelum = false;
    for (const k of p.kejadian) {
      if (k === 'K') { if (adaIsi) { hal++; adaIsi = false; lunak = false; } keras = true; }
      else if (k === 'L') { adaLRPB = true; if (adaIsi) { hal++; adaIsi = false; lunak = true; } }
      else {
        if (!mulai) { p.hal = hal; p.kerasSebelum = keras; p.lunakSebelum = lunak && !keras; mulai = true; }
        adaIsi = true; keras = false; lunak = false;
      }
    }
    if (!mulai) p.hal = hal;
    p.halAkhir = hal;
    if (p.akhirSeksi) {
      const berikut = seksi[p.seksi + 1];
      if (berikut && berikut.jenis !== 'continuous') { if (adaIsi) { hal++; adaIsi = false; } keras = true; lunak = false; }
    }
  }
  let posisi = 0, halLalu = -1;
  for (const p of paragraf) {
    if (p.hal !== halLalu) { posisi = 0; halLalu = p.hal; }
    p.posHal = posisi;
    if (!p.kosong) posisi++;
  }
  for (let k = 0; k < seksi.length; k++) {
    const ps = paragraf.find((p) => p.seksi === k);
    seksi[k].halAwal = ps ? ps.hal : null;
    seksi[k].pAwal = ps ? ps.i : null;
  }
  model.totalHal = paragraf.length ? paragraf[paragraf.length - 1].halAkhir + 1 : 0;
  model.andal = adaLRPB;
}

function analisisHF(xml, gaya) {
  const out = { adaPage: false, jc: null, lewatTab: false, statis: '', diKotak: false };
  if (!xml) return out;
  for (const p of cariSemua(xml, 'w:p')) {
    const pPr = anak(p, 'w:pPr');
    const idG = pPr ? val(anak(pPr, 'w:pStyle')) : null;
    const ef = terapkanPPr(Object.assign({}, gaya.dasarP, gaya.pGaya(idG)), pPr);
    const tumpuk = [];
    let sebelum = '', adaDiSini = false, ptabKanan = false;
    const halaman = (f) => /\bPAGE\b/i.test(f.instr);
    const jalan = (el) => {
      for (const c of el.c) {
        if (!c.n) continue;
        if (c.n === 'w:fldSimple') { const f = { instr: atr(c, 'w:instr') || '', fase: 'hasil' }; if (halaman(f)) adaDiSini = true; tumpuk.push(f); jalan(c); tumpuk.pop(); continue; }
        if (c.n === 'w:fldChar') {
          const t = atr(c, 'w:fldCharType');
          if (t === 'begin') tumpuk.push({ instr: '', fase: 'kode' });
          else if (t === 'separate') { const f = tumpuk[tumpuk.length - 1]; if (f) f.fase = 'hasil'; }
          else if (t === 'end') tumpuk.pop();
          continue;
        }
        if (c.n === 'w:instrText') { const f = tumpuk[tumpuk.length - 1]; if (f && f.fase === 'kode') { f.instr += teksSimpul(c); if (halaman(f)) adaDiSini = true; } continue; }
        if (c.n === 'w:t') { const s = teksSimpul(c); if (!tumpuk.some(halaman)) { out.statis += s; if (!adaDiSini) sebelum += s; } continue; }
        if (c.n === 'w:tab') { if (!adaDiSini) sebelum += '\t'; continue; }
        if (c.n === 'w:ptab') { if (!adaDiSini) { sebelum += '\t'; if (atr(c, 'w:alignment') === 'right') ptabKanan = true; } continue; }
        if (c.n === 'mc:AlternateContent') { const ch = anak(c, 'mc:Choice'); if (ch) jalan(ch); continue; }
        if (c.n === 'mc:Fallback' || c.n === 'w:pPr' || c.n === 'w:rPr') continue;
        if (c.n === 'w:txbxContent') out.diKotak = true;
        jalan(c);
      }
    };
    jalan(p);
    if (adaDiSini && !out.adaPage) {
      out.adaPage = true;
      out.jc = ptabKanan ? 'right' : (ef.jc || 'left');
      out.lewatTab = !ptabKanan && sebelum.includes('\t');
    }
  }
  out.statis = out.statis.replace(/\s+/g, ' ').trim();
  return out;
}

function angkaRomawi(n) {
  if (!(n > 0) || n > 3999) return String(n);
  const t = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let s = '';
  for (const [v, r] of t) while (n >= v) { s += r; n -= v; }
  return s;
}
function dariRomawi(s) {
  const v = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let n = 0;
  for (let i = 0; i < s.length; i++) { const a = v[s[i]], b = v[s[i + 1]] || 0; n += a < b ? -a : a; }
  return angkaRomawi(n) === s ? n : null;
}
function formatNomor(n, fmt) {
  if (fmt === 'lowerRoman') return angkaRomawi(n).toLowerCase();
  if (fmt === 'upperRoman') return angkaRomawi(n);
  if (fmt === 'lowerLetter') return String.fromCharCode(96 + ((n - 1) % 26) + 1);
  if (fmt === 'upperLetter') return String.fromCharCode(64 + ((n - 1) % 26) + 1);
  return String(n);
}

// Nomor halaman yang tercetak per halaman fisik, mengikuti aturan Word: nomor
// berlanjut antar-section kecuali pgNumType@start; footer diwarisi dari section
// sebelumnya bila section itu tidak punya footer sendiri untuk jenis yang sama.
function simulasiNomor(model, hf, genapGanjil) {
  const { seksi } = model;
  const ef = { default: null, first: null, even: null };
  for (const s of seksi) {
    for (const j of ['default', 'first', 'even']) if (s.refs.footer[j]) ef[j] = s.refs.footer[j];
    s.efFooter = Object.assign({}, ef);
  }
  const efH = { default: null, first: null, even: null };
  for (const s of seksi) {
    for (const j of ['default', 'first', 'even']) if (s.refs.header[j]) efH[j] = s.refs.header[j];
    s.efHeader = Object.assign({}, efH);
  }
  const hasil = [];
  let terakhir = 0;
  for (let k = 0; k < seksi.length; k++) {
    const s = seksi[k];
    if (s.halAwal == null) continue;
    let akhir = model.totalHal - 1;
    for (let k2 = k + 1; k2 < seksi.length; k2++) if (seksi[k2].halAwal != null) { akhir = seksi[k2].halAwal - 1; break; }
    let n = s.mulai != null ? s.mulai : terakhir + 1;
    for (let pg = s.halAwal; pg <= akhir; pg++, n++) {
      const jenis = pg === s.halAwal && s.titlePg ? 'first' : (genapGanjil && n % 2 === 0 ? 'even' : 'default');
      const rid = s.efFooter[jenis];
      const info = rid && hf.has(rid) ? hf.get(rid).info : null;
      const ridH = s.efHeader[jenis];
      const infoH = ridH && hf.has(ridH) ? hf.get(ridH).info : null;
      hasil[pg] = { k, n, fmt: s.fmt, jenis, rid, info, infoH, tampil: !!(info && info.adaPage), diAtas: !!(infoH && infoH.adaPage) };
      terakhir = n;
    }
  }
  return hasil;
}

/* ================================================================ Bagian naskah */

const LABEL = {
  sampul: 'Halaman Sampul', judul: 'Halaman Judul', pernyataan: 'Halaman Pernyataan Karya Sendiri',
  turnitin: 'Surat Keterangan Hasil Uji Turnitin', loa: 'Letter of Acceptance (LoA)', pengesahan: 'Halaman Pengesahan',
  kataPengantar: 'Kata Pengantar', persetujuan: 'Pernyataan Persetujuan Publikasi di Repositori UMB',
  abstrak: 'Abstrak', abstract: 'Abstract', daftarIsi: 'Daftar Isi', daftarTabel: 'Daftar Tabel',
  daftarGambar: 'Daftar Gambar', daftarLampiran: 'Daftar Lampiran', naskah: 'Naskah Publikasi Ilmiah',
  bab: 'Bab Isi', daftarPustaka: 'Daftar Pustaka', lampiran: 'Lampiran',
};
const RX_BAGIAN = [
  ['pernyataan', /^(HALAMAN |LEMBAR )?(PERNYATAAN|PENYATAAN) (KARYA SENDIRI|ORISINALITAS|KEASLIAN)/],
  ['turnitin', /TURNITIN|UJI PLAGIASI|UJI KEMIRIPAN|SIMILARITY/],
  ['loa', /LETTER OF ACCEPTANCE|^(HALAMAN )?LOA\b/],
  ['pengesahan', /^(HALAMAN |LEMBAR )?PENGESAHAN/],
  ['kataPengantar', /^(KATA PENGANTAR|UCAPAN TERIMA ?KASIH)$/],
  ['persetujuan', /PERSETUJUAN PUBLIKASI/],
  ['abstrak', /^ABSTRAK$/],
  ['abstract', /^ABSTRACT$/],
  ['daftarIsi', /^DAFTAR ISI$/],
  ['daftarTabel', /^DAFTAR TABEL$/],
  ['daftarGambar', /^DAFTAR GAMBAR$/],
  ['daftarLampiran', /^DAFTAR LAMPIRAN$/],
  ['naskah', /^NASKAH PUBLIKASI/],
  ['daftarPustaka', /^(DAFTAR PUSTAKA|DAFTAR REFERENSI|REFERENSI|REFERENCES|BIBLIOGRAFI)$/],
  ['lampiran', /^LAMPIRAN( ?- ?LAMPIRAN)?$/],
];
const RX_BAB = /^BAB\s+([IVXLC]+|\d+)\b\.?\s*(.*)$/;
const URUTAN = {
  publikasi: ['sampul', 'judul', 'pernyataan', 'turnitin', 'loa', 'pengesahan', 'kataPengantar', 'persetujuan', 'abstrak', 'abstract', 'daftarIsi', 'daftarTabel', 'daftarGambar', 'daftarLampiran', 'naskah', 'lampiran'],
  skripsi: ['sampul', 'judul', 'pernyataan', 'turnitin', 'pengesahan', 'kataPengantar', 'persetujuan', 'abstrak', 'abstract', 'daftarIsi', 'daftarTabel', 'daftarGambar', 'daftarLampiran', 'bab', 'daftarPustaka', 'lampiran'],
};
const OPSIONAL = new Set(['daftarTabel', 'daftarGambar', 'daftarLampiran']);
const AWAL = new Set(['judul', 'pernyataan', 'turnitin', 'loa', 'pengesahan', 'kataPengantar', 'persetujuan', 'abstrak', 'abstract', 'daftarIsi', 'daftarTabel', 'daftarGambar', 'daftarLampiran']);

const rasio = (p, k) => (p.stat.n ? p.stat[k] / p.stat.n : 0);
const normJudul = (t) => t.replace(/[\t\n\u00a0]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/[.:]+$/, '').trim().toUpperCase();
const miripDaftar = (p) => { const t = p.teks.trim(); return /\t/.test(t) || /\.{4,}|…{2,}|_{4,}/.test(t); };
function hurufBesar(p) {
  const h = p.teks.replace(/[^\p{L}]/gu, '');
  return !!h && (h === h.toUpperCase() || rasio(p, 'kapital') > 0.9);
}
const gayaJudul = (p) => (p.outline != null && p.outline <= 2) || /^(heading|judul|title|bab)/i.test(p.namaGaya);
function layakJudul(p) {
  if (p.kosong || p.toc || p.tabel != null || miripDaftar(p)) return false;
  const t = normJudul(p.teks);
  if (!t || t.length > 160) return false;
  return p.jc === 'center' || rasio(p, 'tebal') >= 0.6 || gayaJudul(p) || hurufBesar(p);
}
function skorJudul(p) {
  let s = 4;
  if (p.jc === 'center') s += 2;
  if (rasio(p, 'tebal') >= 0.6) s += 2;
  if (gayaJudul(p)) s += 2;
  if (p.posHal <= 3) s += 3;
  if (p.posHal === 0) s += 1;
  return s;
}

function kenaliBagian(model) {
  const P = model.paragraf;
  const kandidat = {};
  for (const p of P) {
    if (!layakJudul(p)) continue;
    const t = normJudul(p.teks);
    if (t.length <= 100) for (const [k, rx] of RX_BAGIAN) if (rx.test(t)) (kandidat[k] = kandidat[k] || []).push(p);
    if (t.length <= 120 && RX_BAB.test(t) && (p.jc === 'center' || rasio(p, 'tebal') >= 0.6 || gayaJudul(p))) (kandidat.bab = kandidat.bab || []).push(p);
  }
  const terbaik = (k, luar) => {
    let pilih = null, sk = 5;
    for (const p of kandidat[k] || []) {
      if (luar && luar(p)) continue;
      const s = skorJudul(p);
      if (s > sk) { sk = s; pilih = p; }
    }
    return pilih;
  };
  // Daftar isi dikenali lebih dulu: entri di dalamnya (yang tidak bertab, mis.
  // "NASKAH PUBLIKASI ILMIAH" pada templat) jangan sampai dikira judul bagian.
  const di = terbaik('daftarIsi');
  let rentangToc = null;
  if (di) {
    let akhir = P.length - 1;
    for (let j = di.i + 1; j < P.length; j++) if (P[j].kerasSebelum && !P[j].kosong) { akhir = j - 1; break; }
    rentangToc = [di.i + 1, akhir];
  }
  const diToc = (p) => rentangToc && p.i >= rentangToc[0] && p.i <= rentangToc[1];
  const temu = {};
  if (di) temu.daftarIsi = di;
  for (const [k] of RX_BAGIAN) if (k !== 'daftarIsi') { const p = terbaik(k, diToc); if (p) temu[k] = p; }
  const bab = [];
  const lihat = new Set();
  for (const p of kandidat.bab || []) {
    if (diToc(p) || skorJudul(p) < 6) continue;
    const m = RX_BAB.exec(normJudul(p.teks));
    const nomor = /^\d+$/.test(m[1]) ? parseInt(m[1], 10) : dariRomawi(m[1]);
    const kunci = m[1];
    if (lihat.has(kunci)) continue;
    lihat.add(kunci);
    bab.push({ p, nomor, romawi: !/^\d+$/.test(m[1]), teksNomor: m[1], sisa: m[2] });
  }
  // Halaman judul = halaman yang memuat "Diajukan sebagai salah satu syarat ...".
  let pDiajukan = null;
  for (const p of P) {
    if (p.toc || p.hal > 4) continue;
    if (/DIAJUKAN\s+(SEBAGAI|UNTUK)|SALAH SATU SYARAT/.test(normJudul(p.teks))) { pDiajukan = p; break; }
  }
  const bagianTemu = Object.entries(temu).map(([k, p]) => ({ kunci: k, judul: p }));
  for (const b of bab) bagianTemu.push({ kunci: 'bab', judul: b.p, bab: b });
  bagianTemu.sort((a, b) => a.judul.i - b.judul.i);
  const halPertamaBagian = bagianTemu.length ? bagianTemu[0].judul.hal : model.totalHal;
  let halJudul = null, halSampul = null;
  if (pDiajukan && pDiajukan.hal < halPertamaBagian) {
    halJudul = pDiajukan.hal;
    if (halJudul > 0) halSampul = 0;
  } else if (halPertamaBagian >= 2) { halSampul = 0; halJudul = 1; }
  else if (halPertamaBagian === 1) halSampul = 0;
  const daftar = [];
  if (halSampul != null) {
    const ps = P.filter((p) => p.hal === halSampul);
    if (ps.length) daftar.push({ kunci: 'sampul', judul: null, mulai: ps[0].i, halaman: true });
  }
  if (halJudul != null) {
    const ps = P.filter((p) => p.hal === halJudul);
    if (ps.length) daftar.push({ kunci: 'judul', judul: null, mulai: ps[0].i, halaman: true, pDiajukan });
  }
  let batasLalu = daftar.length ? daftar[daftar.length - 1].mulai : -1;
  for (const b of bagianTemu) {
    const h = b.judul;
    let mulai = h.i;
    while (mulai - 1 > batasLalu && P[mulai - 1].hal === h.hal && P[mulai - 1].tabel == null && !(P[mulai].kerasSebelum && !P[mulai].kosong)) mulai--;
    while (mulai < h.i && P[mulai].kosong) mulai++;
    b.mulai = mulai;
    batasLalu = h.i;
    daftar.push(b);
  }
  daftar.sort((a, b) => a.mulai - b.mulai);
  for (let k = 0; k < daftar.length; k++) {
    const b = daftar[k];
    b.akhir = k + 1 < daftar.length ? daftar[k + 1].mulai - 1 : P.length - 1;
    b.label = b.kunci === 'bab' ? `BAB ${b.bab.teksNomor}` : LABEL[b.kunci];
    b.baris = [];
    if (b.judul) {
      b.baris.push(b.judul.i);
      const lanjut = (b.kunci === 'bab' && !b.bab.sisa) || b.kunci === 'persetujuan' || b.kunci === 'bab';
      if (lanjut) {
        for (let j = b.judul.i + 1; j <= Math.min(b.akhir, b.judul.i + 3); j++) {
          const q = P[j];
          if (q.kosong) continue;
          if (b.kunci === 'bab' && b.bab.sisa) break;
          if (q.hal === b.judul.hal && q.tabel == null && hurufBesar(q) && normJudul(q.teks).length <= 140 && (q.jc === 'center' || rasio(q, 'tebal') >= 0.6)) b.baris.push(j);
          break;
        }
      }
    }
    const tutup = new Set(b.baris);
    b.pra = [];
    if (b.judul) for (let j = b.mulai; j < b.judul.i; j++) if (!P[j].kosong) b.pra.push(j);
    for (const j of b.pra) tutup.add(j);
    b.isi = [];
    for (let j = b.mulai; j <= b.akhir; j++) if (!tutup.has(j) && !P[j].kosong) b.isi.push(j);
  }
  return { daftar, rentangToc };
}

/* ================================================================ Bantuan pemeriksaan */

const fmtAngka = (x, d = 2) => {
  const s = (Math.round(x * 10 ** d) / 10 ** d).toFixed(d).replace(/\.?0+$/, '');
  return s.replace('.', ',');
};
const cm = (tw) => fmtAngka(tw / 566.929, 2);
const hitungKata = (t) => t.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
function kaliSpasi(p) {
  if (p.line == null) return 1;
  if (!p.lineRule || p.lineRule === 'auto') return p.line / 240;
  return null;
}
function teksSpasi(p) {
  const k = kaliSpasi(p);
  if (k == null) return (p.lineRule === 'exact' ? 'tepat ' : 'minimal ') + fmtAngka(p.line / 20, 1) + ' pt';
  return fmtAngka(k);
}
const NAMA_SPASI = { 1: 'tunggal (1)', 1.5: '1,5', 2: 'ganda (2)' };
function fontDominan(p) {
  let best = null, n = -1;
  for (const [f, c] of Object.entries(p.stat.font)) if (c > n) { best = f; n = c; }
  return best;
}
function ukuranDominan(p) {
  let best = null, n = -1;
  for (const [f, c] of Object.entries(p.stat.ukuran)) if (c > n) { best = parseFloat(f); n = c; }
  return best;
}
const isTNR = (f) => /^times\s*new\s*roman/i.test(String(f).trim()) || /^times$/i.test(String(f).trim());
const FONT_ABAIKAN = /^(symbol|wingdings|webdings|cambria math|segoe ui (symbol|emoji)|mt extra|ms mincho|ms gothic|simsun|mangal)/i;
const kutip = (t, n = 70) => { const s = t.replace(/[\t\n]+/g, ' ').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

const KATA_KECIL = new Set('dan atau di ke dari yang untuk pada dengan terhadap dalam oleh sebagai serta antara bagi tentang per vs dll dsb melalui secara tanpa of and or the in on at to for with a an by from as via'.split(' '));
function bukanTitleCase(judul) {
  const salah = [];
  judul.split(/\s+/).filter(Boolean).forEach((w, idx) => {
    const h = w.replace(/^[^\p{L}\p{N}]+/u, '');
    if (!h || !/\p{L}/u.test(h[0])) return;
    if (/\p{Lu}/u.test(h.slice(1)) && /\p{Ll}/u.test(h)) return; // kW, dB, iPhone, e-Learning
    if (idx > 0 && KATA_KECIL.has(h.toLowerCase().replace(/[^\p{L}]/gu, ''))) return;
    if (h[0] !== h[0].toUpperCase()) salah.push(w);
  });
  return salah;
}
const STOP_ID = new Set('yang dan di ke dari untuk dengan pada ini dalam adalah tidak akan oleh sebagai serta juga atau dapat telah sehingga bahwa merupakan menggunakan hasil penelitian'.split(' '));
const STOP_EN = new Set('the and of to in is are for with on this that by as was were be from an which results study using based has have'.split(' '));
function bahasa(t) {
  let id = 0, en = 0;
  for (const w of t.toLowerCase().split(/[^\p{L}]+/u)) { if (STOP_ID.has(w)) id++; else if (STOP_EN.has(w)) en++; }
  if (id + en < 3) return '?';
  return id >= en * 1.5 ? 'id' : en >= id * 1.5 ? 'en' : '?';
}

/* ================================================================ Pemeriksaan */

function periksaModel(model, opsi) {
  const P = model.paragraf;
  const temuan = [];
  const label = (i) => {
    const p = P[i];
    if (!p) return '';
    const nm = model.nomor[p.hal];
    const tertulis = nm && nm.tampil ? ` (tertulis ${formatNomor(nm.n, nm.fmt)})` : '';
    return `hal. ${model.andal ? '' : '±'}${p.hal + 1}${tertulis}`;
  };
  const rinci = (i, teks) => ({ p: i, hal: label(i), teks: teks != null ? teks : kutip(P[i].teks) });
  const tambah = (grup, status, judul, ref, pesan, rincian = [], tanda = []) => {
    temuan.push({ grup, status, judul, ref, pesan, rincian, tanda });
  };
  // tanda: sorotan + komentar yang ditulis ke .docx. p = indeks paragraf, s/e = rentang
  // karakter (opsional; default seluruh teks paragraf).
  const tandaParagraf = (idx, komentarPertama, batas = 10) => {
    const out = [];
    idx.forEach((i, k) => { if (k < batas) out.push({ p: i, hl: true, komentar: k === 0 ? komentarPertama : null }); });
    if (idx.length > batas && out.length) out[0].komentar += ` (${idx.length} paragraf; yang disorot hanya ${batas} pertama.)`;
    return out;
  };
  const bagian = model.bagian.daftar;
  const cariB = (k) => bagian.find((b) => b.kunci === k) || null;
  const skema = model.skema;
  const babList = bagian.filter((b) => b.kunci === 'bab');
  const B = Object.fromEntries(bagian.filter((b) => b.kunci !== 'bab').map((b) => [b.kunci, b]));
  const dalam = (b, i) => b && i >= b.mulai && i <= b.akhir;
  const isiAwal = skema === 'publikasi' ? B.naskah : babList[0];

  // Cakupan aturan huruf/spasi umum: tanpa naskah jurnal (format jurnal), lampiran,
  // surat Turnitin dan LoA (dokumen pihak lain).
  const dikecualikan = (i) => [B.naskah, B.lampiran, B.turnitin, B.loa].some((b) => dalam(b, i));
  const cakupan = P.filter((p) => !p.kosong && !dikecualikan(p.i));
  const halSampulJudul = new Set(bagian.filter((b) => b.kunci === 'sampul' || b.kunci === 'judul').map((b) => P[b.mulai].hal));

  /* ---------- Kertas, margin & huruf ---------- */
  const G = 'umum';
  const seksiDipakai = model.seksi.map((s, k) => ({ s, k })).filter(({ s }) => s.halAwal != null);
  {
    const bukanA4 = seksiDipakai.filter(({ s }) => {
      const [a, b] = s.w <= s.h ? [s.w, s.h] : [s.h, s.w];
      return Math.abs(a - 11906) > 40 || Math.abs(b - 16838) > 40;
    });
    if (!bukanA4.length) tambah(G, 'lulus', 'Ukuran kertas A4', 'Pedoman 3.1', 'Semua halaman berukuran A4 (21 × 29,7 cm).');
    else tambah(G, 'gagal', 'Ukuran kertas bukan A4', 'Pedoman 3.1',
      'Atur Layout → Size → A4 untuk seluruh dokumen.',
      bukanA4.map(({ s }) => rinci(s.pAwal, `${cm(s.w)} × ${cm(s.h)} cm`)),
      bukanA4.map(({ s }) => ({ p: s.pAwal, hl: false, komentar: `Ukuran kertas section ini ${cm(s.w)} × ${cm(s.h)} cm. Pedoman 3.1: A4 (21 × 29,7 cm). Layout → Size → A4.` })));
  }
  {
    const tol = 34;
    const salah = [], miripTemplat = [];
    for (const { s } of seksiDipakai) {
      const kiri = s.mar.kiri + s.mar.gutter;
      const lanskap = s.w > s.h;
      const nilai = [s.mar.atas, s.mar.bawah, kiri, s.mar.kanan];
      let ok;
      if (lanskap) {
        const empat = nilai.filter((x) => Math.abs(x - 2268) <= tol).length, tiga = nilai.filter((x) => Math.abs(x - 1701) <= tol).length;
        ok = empat === 1 && tiga === 3;
      } else ok = Math.abs(s.mar.atas - 1701) <= tol && Math.abs(s.mar.bawah - 1701) <= tol && Math.abs(kiri - 2268) <= tol && Math.abs(s.mar.kanan - 1701) <= tol;
      const teks = `atas ${cm(s.mar.atas)}, bawah ${cm(s.mar.bawah)}, kiri ${cm(kiri)}, kanan ${cm(s.mar.kanan)} cm${lanskap ? ' (lanskap)' : ''}`;
      if (ok) continue;
      const hanyaKanan275 = !lanskap && Math.abs(s.mar.atas - 1701) <= tol && Math.abs(s.mar.bawah - 1701) <= tol && Math.abs(kiri - 2268) <= tol && Math.abs(s.mar.kanan - 1559) <= 20;
      (hanyaKanan275 ? miripTemplat : salah).push({ s, teks });
    }
    const komentar = (x) => `Margin section ini: ${x.teks}. Pedoman 3.2: kiri 4 cm, kanan 3 cm, atas 3 cm, bawah 3 cm (Layout → Margins → Custom Margins).`;
    if (!salah.length && !miripTemplat.length) tambah(G, 'lulus', 'Margin 4-3-3-3 cm', 'Pedoman 3.2', 'Kiri 4 cm, kanan 3 cm, atas 3 cm, bawah 3 cm di semua section.');
    if (miripTemplat.length) tambah(G, 'perhatian', 'Margin kanan 2,75 cm seperti templat', 'Pedoman 3.2',
      'Section bagian awal pada templat memakai margin kanan 2,75 cm, sedangkan pedoman meminta 3 cm. Ikuti pedoman kecuali prodi menetapkan lain.',
      miripTemplat.map((x) => rinci(x.s.pAwal, x.teks)), miripTemplat.map((x) => ({ p: x.s.pAwal, hl: false, komentar: komentar(x) })));
    if (salah.length) tambah(G, 'gagal', 'Margin tidak sesuai', 'Pedoman 3.2', 'Atur margin kiri 4 cm, kanan 3 cm, atas 3 cm, bawah 3 cm.',
      salah.map((x) => rinci(x.s.pAwal, x.teks)), salah.map((x) => ({ p: x.s.pAwal, hl: false, komentar: komentar(x) })));
  }
  {
    const beda = seksiDipakai.filter(({ s }) => Math.abs(s.mar.footer - 1134) > 60);
    if (!beda.length) tambah(G, 'lulus', 'Jarak nomor halaman 2 cm dari tepi bawah', 'Pedoman 3.4', 'Jarak footer 2 cm di semua section.');
    else tambah(G, 'perhatian', 'Jarak footer bukan 2 cm', 'Pedoman 3.4',
      'Pedoman meletakkan nomor halaman 2 cm dari tepi bawah (Header & Footer → Footer from Bottom: 2 cm). Templat memakai 1,27 cm.',
      beda.map(({ s }) => rinci(s.pAwal, `footer ${cm(s.mar.footer)} cm dari tepi bawah`)));
  }
  {
    let total = 0;
    const lain = {};
    const contoh = {};
    for (const p of cakupan) {
      if (p.math && !p.stat.n) continue;
      for (const [f, n] of Object.entries(p.stat.font)) {
        if (FONT_ABAIKAN.test(f)) continue;
        total += n;
        if (!isTNR(f)) {
          lain[f] = (lain[f] || 0) + n;
          if (n / p.stat.n > 0.3) (contoh[f] = contoh[f] || []).push(p.i);
        }
      }
    }
    const nLain = Object.values(lain).reduce((a, b) => a + b, 0);
    if (!total) tambah(G, 'info', 'Jenis huruf', 'Pedoman 3.2', 'Tidak ada teks yang dapat diperiksa.');
    else if (nLain / total <= 0.005) tambah(G, 'lulus', 'Huruf Times New Roman', 'Pedoman 3.2', 'Seluruh teks bagian awal dan isi memakai Times New Roman.');
    else {
      const urut = Object.entries(lain).sort((a, b) => b[1] - a[1]);
      const idx = [...new Set(urut.flatMap(([f]) => contoh[f] || []))].sort((a, b) => a - b);
      tambah(G, 'gagal', 'Huruf selain Times New Roman', 'Pedoman 3.2',
        'Terpakai: ' + urut.slice(0, 5).map(([f, n]) => `${f} (${fmtAngka((n / total) * 100, 1)}%)`).join(', ') + '. Ganti ke Times New Roman (pilih teks → Home → Font).',
        idx.slice(0, 40).map((i) => rinci(i, `${fontDominan(P[i])} — ${kutip(P[i].teks, 60)}`)),
        tandaParagraf(idx, 'Huruf paragraf ini bukan Times New Roman. Pedoman 3.2: Times New Roman 12 pt.'));
    }
  }
  {
    const salah = [];
    for (const p of cakupan) {
      if (p.tabel != null || halSampulJudul.has(p.hal) || !p.stat.n) continue;
      if (/^sumber\s*:/i.test(p.teks.trim())) continue;
      const u = ukuranDominan(p);
      if (u != null && Math.abs(u - 12) > 0.25) salah.push(p.i);
    }
    if (!salah.length) tambah(G, 'lulus', 'Ukuran huruf 12 pt', 'Pedoman 3.2', 'Teks bagian awal dan isi berukuran 12 pt.');
    else tambah(G, 'gagal', 'Ukuran huruf bukan 12 pt', 'Pedoman 3.2', `${salah.length} paragraf tidak berukuran 12 pt (di luar sampul, halaman judul, tabel, dan keterangan sumber).`,
      salah.slice(0, 40).map((i) => rinci(i, `${fmtAngka(ukuranDominan(P[i]), 1)} pt — ${kutip(P[i].teks, 60)}`)),
      tandaParagraf(salah, 'Ukuran huruf paragraf ini bukan 12 pt. Pedoman 3.2: Times New Roman 12 pt.'));
    const kecil = P.filter((p) => p.tabel != null && !dikecualikan(p.i) && p.stat.n && ukuranDominan(p) < 9.75).map((p) => p.i);
    if (model.tabel.length) {
      if (!kecil.length) tambah(G, 'lulus', 'Huruf di dalam tabel ≥ 10 pt', 'Pedoman 3.16', 'Tidak ada isi tabel yang lebih kecil dari 10 pt.');
      else tambah(G, 'gagal', 'Huruf di dalam tabel < 10 pt', 'Pedoman 3.16', 'Ukuran huruf dalam tabel/gambar tidak boleh lebih kecil dari 10 pt.',
        kecil.slice(0, 30).map((i) => rinci(i, `${fmtAngka(ukuranDominan(P[i]), 1)} pt — ${kutip(P[i].teks, 50)}`)),
        tandaParagraf(kecil, 'Huruf di dalam tabel lebih kecil dari 10 pt. Pedoman 3.16 butir 13: minimal 10 pt.'));
    }
  }
  // Paragraf teks berjalan: ≥ 15 kata, bukan judul, keterangan, tabel, atau daftar.
  const kunciProsa = new Set(['pernyataan', 'pengesahan', 'kataPengantar', 'persetujuan', 'abstrak', 'abstract', 'bab']);
  const prosa = [];
  for (const b of bagian) {
    if (!kunciProsa.has(b.kunci)) continue;
    for (const i of b.isi) {
      const p = P[i];
      if (p.tabel != null || p.toc || hitungKata(p.teks) < 15 || RX_KAPSI.test(p.teks.trim())) continue;
      prosa.push(i);
    }
  }
  {
    const salah = prosa.filter((i) => P[i].jc !== 'justify');
    if (!prosa.length) { /* tidak ada teks berjalan */ }
    else if (!salah.length) tambah(G, 'lulus', 'Teks rata kiri-kanan', 'Pedoman 3.2', 'Paragraf teks berjalan sudah justify.');
    else tambah(G, 'gagal', 'Teks belum rata kiri-kanan', 'Pedoman 3.2', 'Paragraf teks harus rata kiri-kanan (Ctrl+J).',
      salah.slice(0, 40).map((i) => rinci(i, `${({ left: 'rata kiri', right: 'rata kanan', center: 'tengah' })[P[i].jc] || P[i].jc} — ${kutip(P[i].teks, 60)}`)),
      tandaParagraf(salah, 'Paragraf ini belum rata kiri-kanan. Pedoman 3.2: teks diketik rata kiri-kanan (justify), Ctrl+J.'));
  }
  {
    const salah = prosa.filter((i) => P[i].after >= 120 || P[i].before >= 120);
    if (prosa.length && salah.length) tambah(G, 'perhatian', 'Ada jarak antarparagraf', 'Templat',
      'Templat memakai spasi sebelum/sesudah paragraf 0 pt; jarak tambahan membuat halaman bertambah dan spasi tidak seragam (Paragraph → Spacing Before/After: 0 pt).',
      salah.slice(0, 30).map((i) => rinci(i, `sebelum ${fmtAngka(P[i].before / 20, 0)} pt, sesudah ${fmtAngka(P[i].after / 20, 0)} pt — ${kutip(P[i].teks, 50)}`)));
  }
  {
    const warna = cakupan.filter((p) => p.stat.warna > 0).map((p) => p.i);
    const tautan = cakupan.filter((p) => p.stat.warnaTautan > 0).map((p) => p.i);
    if (!warna.length && !tautan.length) tambah(G, 'lulus', 'Teks berwarna hitam', 'Pedoman 3.2', 'Tidak ada teks berwarna.');
    if (warna.length) tambah(G, 'gagal', 'Teks berwarna selain hitam', 'Pedoman 3.2', 'Huruf harus hitam pekat dan seragam.',
      warna.slice(0, 30).map((i) => rinci(i)), tandaParagraf(warna, 'Paragraf ini memuat teks berwarna. Pedoman 3.2 butir 4: huruf berwarna hitam pekat.'));
    if (tautan.length) tambah(G, 'perhatian', 'Tautan berwarna', 'Pedoman 3.2', 'Tautan (hyperlink) tercetak biru. Ubah warnanya menjadi hitam sebelum dicetak.', tautan.slice(0, 20).map((i) => rinci(i)));
  }

  /* ---------- Kelengkapan & urutan ---------- */
  const S = 'struktur';
  {
    const urutan = URUTAN[skema];
    const ada = new Set(bagian.map((b) => b.kunci));
    const hilang = urutan.filter((k) => !ada.has(k) && !OPSIONAL.has(k) && !(skema === 'skripsi' && k === 'lampiran'));
    const pertama = bagian.find((b) => b.kunci !== 'sampul' && b.kunci !== 'judul') || bagian[0];
    if (!hilang.length) tambah(S, 'lulus', 'Semua bagian wajib ada', 'Pedoman 2.1–2.3', `Ditemukan ${bagian.length} bagian: ` + bagian.map((b) => b.label).join(', ') + '.');
    else tambah(S, 'gagal', 'Bagian wajib belum ada', 'Pedoman 2.1–2.3',
      'Tidak ditemukan: ' + hilang.map((k) => LABEL[k]).join(', ') + '. Bila sebenarnya ada, pastikan judulnya ditulis seperti templat (kapital, tebal, di tengah, di awal halaman).',
      [], pertama ? [{ p: pertama.judul ? pertama.judul.i : pertama.mulai, hl: false, komentar: 'Bagian wajib yang belum ditemukan: ' + hilang.map((k) => LABEL[k]).join(', ') + ' (Pedoman 2.1–2.3).' }] : []);
    if (ada.has('lampiran') && !ada.has('daftarLampiran')) tambah(S, 'perhatian', 'Daftar Lampiran belum ada', 'Pedoman 2.1', 'Naskah memiliki Lampiran, tetapi Daftar Lampiran tidak ditemukan.');
    const kapsiTabel = P.some((p) => !dikecualikan(p.i) && !p.toc && /^Tabel\s+\d/i.test(p.teks.trim()) && !dalam(B.daftarTabel, p.i) && !dalam(B.daftarIsi, p.i));
    const kapsiGambar = P.some((p) => !dikecualikan(p.i) && !p.toc && /^Gambar\s+\d/i.test(p.teks.trim()) && !dalam(B.daftarGambar, p.i) && !dalam(B.daftarIsi, p.i));
    if (skema === 'skripsi' && kapsiTabel && !ada.has('daftarTabel')) tambah(S, 'perhatian', 'Daftar Tabel belum ada', 'Pedoman 2.1', 'Naskah memuat tabel bernomor, tetapi Daftar Tabel tidak ditemukan.');
    if (skema === 'skripsi' && kapsiGambar && !ada.has('daftarGambar')) tambah(S, 'perhatian', 'Daftar Gambar belum ada', 'Pedoman 2.1', 'Naskah memuat gambar bernomor, tetapi Daftar Gambar tidak ditemukan.');
  }
  {
    const urutan = URUTAN[skema];
    const salah = [];
    let maks = -1, kunciMaks = null;
    for (const b of bagian) {
      const ix = urutan.indexOf(b.kunci);
      if (ix < 0) continue;
      if (ix < maks) salah.push({ b, setelah: kunciMaks });
      else { maks = ix; kunciMaks = b.kunci; }
    }
    if (!salah.length) tambah(S, 'lulus', 'Urutan bagian sesuai', 'Pedoman 2.1', 'Urutan bagian sama dengan pedoman dan templat.');
    else tambah(S, 'gagal', 'Urutan bagian tidak sesuai', 'Pedoman 2.1',
      'Urutan menurut pedoman: ' + urutan.filter((k) => bagian.some((b) => b.kunci === k)).map((k) => LABEL[k]).join(' → ') + '.',
      salah.map(({ b, setelah }) => rinci(b.judul ? b.judul.i : b.mulai, `${b.label} seharusnya sebelum ${LABEL[setelah]}`)),
      salah.map(({ b, setelah }) => ({ p: b.judul ? b.judul.i : b.mulai, hl: true, komentar: `${b.label} seharusnya diletakkan sebelum ${LABEL[setelah]} (Pedoman 2.1).` })));
  }
  {
    const tanpa = [], lunak = [];
    for (const b of bagian) {
      if (b.kunci === 'sampul') continue;
      const p = P[b.mulai];
      if (p.kerasSebelum || p.hal === 0) continue;
      (p.lunakSebelum ? lunak : tanpa).push(b);
    }
    if (!tanpa.length && !lunak.length) tambah(S, 'lulus', 'Setiap bagian dimulai di halaman baru', 'Pedoman 3.15', 'Semua bagian diawali pemisah halaman (page/section break).');
    if (tanpa.length) tambah(S, 'gagal', 'Bagian tidak dimulai di halaman baru', 'Pedoman 3.15',
      'Sisipkan pemisah halaman sebelum judul bagian (Insert → Page Break, atau Layout → Breaks → Next Page).',
      tanpa.map((b) => rinci(b.mulai, b.label)), tanpa.map((b) => ({ p: b.judul ? b.judul.i : b.mulai, hl: true, komentar: `${b.label} belum dimulai di halaman baru. Sisipkan Page Break atau Section Break (Next Page) sebelum judul ini.` })));
    if (lunak.length) tambah(S, 'perhatian', 'Pindah halaman karena teks penuh', 'Pedoman 3.15',
      'Bagian ini berada di halaman baru hanya karena halaman sebelumnya penuh. Bila isi sebelumnya berubah, judulnya bisa naik ke halaman lama — sisipkan Page Break.',
      lunak.map((b) => rinci(b.mulai, b.label)));
  }
  {
    const salah = [];
    for (const b of bagian) {
      if (!b.judul || b.kunci === 'bab') continue;
      for (const i of b.baris) {
        const p = P[i];
        const masalah = [];
        if (!hurufBesar(p)) masalah.push('belum kapital');
        if (rasio(p, 'tebal') < 0.9) masalah.push('belum tebal');
        if (p.jc !== 'center' && b.kunci !== 'turnitin') masalah.push('tidak di tengah');
        if (/[.]$/.test(p.teks.trim())) masalah.push('diakhiri titik');
        if (masalah.length) salah.push({ i, b, masalah });
      }
    }
    if (!salah.length) tambah(S, 'lulus', 'Judul bagian kapital, tebal, di tengah', 'Pedoman 3.10–3.14', 'Semua judul bagian ditulis kapital tebal di tengah.');
    else tambah(S, 'gagal', 'Judul bagian belum sesuai', 'Pedoman 3.10–3.14', 'Judul bagian ditulis huruf kapital, tebal, simetris di tengah, tanpa titik.',
      salah.map((x) => rinci(x.i, `${x.b.label}: ${x.masalah.join(', ')}`)),
      salah.map((x) => ({ p: x.i, hl: true, komentar: `Judul ${x.b.label} ${x.masalah.join(', ')}. Ketentuan: huruf kapital, tebal, di tengah, Times New Roman 12 pt.` })));
  }

  /* ---------- Penomoran halaman ---------- */
  const N = 'nomor';
  {
    const pg = model.nomor;
    const pS = cariB('sampul'), pJ = cariB('judul');
    const halAwalAkhir = (() => {
      const awal = bagian.filter((b) => AWAL.has(b.kunci));
      if (!awal.length) return null;
      return [P[awal[0].mulai].hal, P[awal[awal.length - 1].akhir].halAkhir];
    })();
    if (pS) {
      const n = pg[P[pS.mulai].hal];
      if (n && n.tampil) tambah(N, 'gagal', 'Halaman sampul bernomor', 'Pedoman 3.4.1', 'Halaman sampul tidak boleh diberi nomor (Header & Footer → Different First Page, atau sampul di section sendiri tanpa nomor).',
        [rinci(pS.mulai)], [{ p: pS.mulai, hl: false, komentar: 'Halaman sampul tidak diberi nomor dan tidak dihitung (Pedoman 3.4.1 butir c).' }]);
      else tambah(N, 'lulus', 'Halaman sampul tanpa nomor', 'Pedoman 3.4.1', 'Sampul tidak menampilkan nomor halaman.');
    }
    if (pJ) {
      const n = pg[P[pJ.mulai].hal];
      if (n && n.fmt === 'lowerRoman' && n.n === 1) tambah(N, 'lulus', 'Halaman judul bernomor i', 'Pedoman 3.4.1', 'Penomoran romawi dimulai dari halaman judul; sampul tidak dihitung.');
      else if (n && n.fmt === 'lowerRoman' && n.n === 2) tambah(N, 'gagal', 'Sampul ikut terhitung', 'Pedoman 3.4.1', 'Halaman judul bernomor ii: sampul ikut dihitung. Mulai section halaman judul dari i (Page Number → Format → Start at: i).',
        [rinci(pJ.mulai)], [{ p: pJ.mulai, hl: false, komentar: 'Halaman judul semestinya bernomor i; sampul tidak dihitung (Pedoman 3.4.1). Page Number → Format Page Numbers → Start at: i.' }]);
    }
    if (halAwalAkhir) {
      const seksiAwal = new Set();
      for (let h = halAwalAkhir[0]; h <= halAwalAkhir[1]; h++) if (pg[h]) seksiAwal.add(pg[h].k);
      const bukanRomawi = [...seksiAwal].filter((k) => model.seksi[k].fmt !== 'lowerRoman');
      if (!bukanRomawi.length) tambah(N, 'lulus', 'Bagian awal bernomor romawi kecil', 'Pedoman 3.4.1', 'Halaman bagian awal memakai angka romawi kecil (i, ii, iii, …).');
      else tambah(N, 'gagal', 'Bagian awal belum bernomor romawi kecil', 'Pedoman 3.4.1', 'Bagian awal (halaman judul s.d. daftar lampiran) memakai angka romawi kecil: Page Number → Format Page Numbers → i, ii, iii.',
        bukanRomawi.map((k) => rinci(model.seksi[k].pAwal, `format nomor: ${model.seksi[k].fmt}`)),
        bukanRomawi.map((k) => ({ p: model.seksi[k].pAwal, hl: false, komentar: `Nomor halaman section ini berformat ${model.seksi[k].fmt}; bagian awal memakai angka romawi kecil (Pedoman 3.4.1).` })));
    }
    if (isiAwal) {
      const n = pg[P[isiAwal.mulai].hal];
      const nama = skema === 'publikasi' ? 'Naskah Publikasi Ilmiah' : 'BAB I';
      if (n && n.fmt === 'decimal' && n.n === 1) tambah(N, 'lulus', `${nama} bernomor 1 (angka Latin)`, 'Pedoman 3.4.2', 'Bagian isi memakai angka Latin yang dimulai dari 1.');
      else tambah(N, 'gagal', `${nama} belum bernomor 1 (angka Latin)`, 'Pedoman 3.4.2',
        `Halaman pertama ${nama} tercetak ${n ? formatNomor(n.n, n.fmt) : '—'}. Sisipkan Section Break (Next Page) sebelum ${nama}, putuskan Link to Previous, lalu Format Page Numbers → 1, 2, 3 dengan Start at: 1.`,
        [rinci(isiAwal.mulai)], [{ p: isiAwal.judul ? isiAwal.judul.i : isiAwal.mulai, hl: false, komentar: `Halaman pertama ${nama} semestinya bernomor 1 (angka Latin), mulai di section baru (Pedoman 3.4.2).` }]);
    }
    const mulaiCek = pJ ? P[pJ.mulai].hal : (pS ? P[pS.mulai].hal + 1 : 0);
    const tanpaNomor = [], manual = [], salahLetak = [], imbuhan = [], diAtas = [];
    const babPertama = new Set(babList.map((b) => P[b.mulai].hal));
    for (let h = mulaiCek; h < model.totalHal; h++) {
      const n = pg[h];
      if (!n) continue;
      if (dikecualikan(P.findIndex((p) => p.hal === h)) && !n.tampil) continue;
      if (n.diAtas && !n.tampil) { diAtas.push(h); continue; }
      if (!n.tampil) { if (n.info && /^[\divxlcdm]+$/i.test(n.info.statis)) manual.push(h); else tanpaNomor.push(h); continue; }
      const jc = n.info.jc;
      const tengahBab = babPertama.has(h) && jc === 'center';
      if (!(jc === 'right' || tengahBab) && !(n.jenis === 'even' && jc === 'left')) salahLetak.push({ h, jc, tab: n.info.lewatTab });
      if (/[\p{L}]/u.test(n.info.statis.replace(/^[ivxlcdm]+$/i, '')) || /[-–—]/.test(n.info.statis)) imbuhan.push({ h, s: n.info.statis });
    }
    const rentang = (arr) => {
      const out = [];
      for (const h of arr) { const t = out[out.length - 1]; if (t && t[1] === h - 1) t[1] = h; else out.push([h, h]); }
      return out.map(([a, b]) => (a === b ? `hal. ${a + 1}` : `hal. ${a + 1}–${b + 1}`)).join(', ');
    };
    const pPadaHal = (h) => { const p = P.find((q) => q.hal === h && !q.kosong) || P.find((q) => q.hal === h); return p ? p.i : 0; };
    if (!tanpaNomor.length && !manual.length && !diAtas.length) tambah(N, 'lulus', 'Nomor halaman otomatis di setiap halaman', 'Pedoman 3.4', 'Setiap halaman sejak halaman judul menampilkan nomor otomatis (field PAGE).');
    if (tanpaNomor.length) tambah(N, 'gagal', 'Ada halaman tanpa nomor', 'Pedoman 3.4',
      `${tanpaNomor.length} halaman tidak menampilkan nomor: ${rentang(tanpaNomor)}. Sisipkan Insert → Page Number → Bottom of Page → Plain Number 3 di setiap section.`,
      [], [{ p: pPadaHal(tanpaNomor[0]), hl: false, komentar: `Halaman ini (dan ${rentang(tanpaNomor)}) tidak bernomor. Sisipkan Insert → Page Number → Bottom of Page (kanan bawah).` }]);
    if (manual.length) tambah(N, 'perhatian', 'Nomor halaman diketik manual', 'Pedoman 3.4',
      `Nomor di ${rentang(manual)} diketik sebagai teks, bukan field otomatis; nomor bisa salah bila halaman bergeser.`, []);
    if (diAtas.length) tambah(N, 'gagal', 'Nomor halaman di bagian atas', 'Pedoman 3.4', `Nomor halaman diletakkan di header (${rentang(diAtas)}); pedoman meletakkannya di kanan bawah.`, []);
    if (salahLetak.length) tambah(N, salahLetak.every((x) => x.tab) ? 'perhatian' : 'gagal', 'Nomor halaman tidak di kanan bawah', 'Pedoman 3.4',
      `Nomor halaman diletakkan ${[...new Set(salahLetak.map((x) => (x.tab ? 'dengan tab' : ({ left: 'kiri', center: 'tengah' })[x.jc] || x.jc)))].join('/')} di ${rentang(salahLetak.map((x) => x.h))}. Letakkan di sudut kanan bawah (halaman pertama bab boleh di tengah).`,
      [], [{ p: pPadaHal(salahLetak[0].h), hl: false, komentar: 'Nomor halaman semestinya di sudut kanan bawah, 2 cm dari tepi bawah dan 3 cm dari tepi kanan (Pedoman 3.4).' }]);
    if (imbuhan.length) tambah(N, 'gagal', 'Nomor halaman berimbuhan', 'Pedoman 3.4', `Nomor halaman tidak boleh diberi imbuhan (mis. "Halaman", "-"). Ditemukan: "${imbuhan[0].s}".`, []);
    if (skema === 'skripsi' && babList.length) {
      const tidakTengah = babList.filter((b) => { const n = pg[P[b.mulai].hal]; return !(n && n.tampil && n.info.jc === 'center' && n.jenis === 'first'); });
      if (tidakTengah.length) tambah(N, 'perhatian', 'Nomor halaman pertama bab belum di tengah', 'Pedoman 3.4.2',
        'Halaman pertama setiap bab bernomor di tengah bawah (2,5 cm dari tepi bawah): pakai Different First Page di section bab, lalu letakkan nomor di tengah.',
        tidakTengah.map((b) => rinci(b.mulai, b.label)));
    }
  }

  /* ---------- Sampul & halaman judul ---------- */
  const isiHal = (b) => (b ? range(b.mulai, b.akhir).filter((i) => !P[i].kosong) : []);
  const tahunAcuan = (() => {
    const s = cariB('sampul') || cariB('judul');
    for (const i of isiHal(s)) { const m = /^\(?((?:19|20)\d{2})\)?$/.exec(P[i].teks.trim()); if (m) return parseInt(m[1], 10); }
    return opsi.tahunSekarang;
  })();
  model.tahunAcuan = tahunAcuan;
  function cekHalamanJudul(b, grup, nama) {
    const idx = isiHal(b);
    if (!idx.length) return null;
    const tengah = idx.filter((i) => P[i].jc !== 'center' && !(P[i].gambar.length && !P[i].teks.trim()));
    if (!tengah.length) tambah(grup, 'lulus', 'Ditulis simetris di tengah', 'Pedoman 3.5', `Semua baris ${nama} di tengah.`);
    else tambah(grup, 'gagal', 'Baris tidak di tengah', 'Pedoman 3.5', `Semua baris ${nama} ditulis simetris di tengah (center).`,
      tengah.map((i) => rinci(i)), tandaParagraf(tengah, `Baris ${nama} ditulis simetris di tengah (Pedoman 3.5).`));
    const teks = idx.map((i) => normJudul(P[i].teks));
    const unsur = [
      ['jenis Tugas Akhir', /TUGAS AKHIR|SKRIPSI|TESIS|DISERTASI|LAPORAN MAGANG/],
      ['NIM', /\b\d{8,14}\b/],
      ['Program Studi', /PROGRAM STUDI/],
      ['Fakultas', /FAKULTAS/],
      ['Universitas Mercu Buana', /UNIVERSITAS MERCU BUANA/],
      ['tempat (Jakarta)', /^JAKARTA$/],
      ['tahun (4 digit)', /^\(?(19|20)\d{2}\)?$/],
    ];
    const hilang = unsur.filter(([, rx]) => !teks.some((t) => rx.test(t))).map(([n]) => n);
    const logo = idx.flatMap((i) => P[i].gambar).filter((g) => g.cx > 0);
    if (!logo.length) hilang.unshift('logo UMB');
    if (!hilang.length) tambah(grup, 'lulus', 'Unsur lengkap', 'Pedoman 3.5', 'Memuat logo, judul, jenis TA, nama, NIM, prodi, fakultas, universitas, tempat, dan tahun.');
    else tambah(grup, 'gagal', 'Unsur belum lengkap', 'Pedoman 3.5', 'Belum ditemukan: ' + hilang.join(', ') + '.', [],
      [{ p: idx[0], hl: false, komentar: `${nama[0].toUpperCase() + nama.slice(1)} belum memuat: ${hilang.join(', ')} (Pedoman 3.5).` }]);
    const iJenis = idx.find((i) => /^(TUGAS AKHIR|SKRIPSI|TESIS|DISERTASI|LAPORAN MAGANG)/.test(normJudul(P[i].teks)));
    const baris = idx.filter((i) => (iJenis == null || i < iJenis) && P[i].teks.trim() && !/^\(?UKURAN/i.test(P[i].teks.trim()));
    const judulTA = baris.map((i) => P[i].teks.replace(/\s+/g, ' ').trim()).join(' ').trim();
    if (judulTA) {
      const masalah = [];
      if (/[?]/.test(judulTA) || /^(APAKAH|BAGAIMANA|MENGAPA|KENAPA|SIAPA|KAPAN|DI ?MANA)\b/i.test(judulTA)) masalah.push('berbentuk kalimat tanya');
      if (/[.,;:!?]$/.test(judulTA)) masalah.push('diakhiri tanda baca');
      if (masalah.length) tambah(grup, 'gagal', 'Judul tidak sesuai ketentuan', 'Pedoman 3.5', `Judul ${masalah.join(' dan ')}. Judul bukan kalimat tanya dan tidak ditutup tanda baca.`,
        [rinci(baris[baris.length - 1], judulTA)], [{ p: baris[baris.length - 1], hl: true, komentar: `Judul ${masalah.join(' dan ')}. Pedoman 3.5: judul tidak disusun dalam kalimat tanya dan tidak ditutup tanda baca apa pun.` }]);
      else tambah(grup, 'lulus', 'Judul bukan kalimat tanya, tanpa tanda baca penutup', 'Pedoman 3.5', kutip(judulTA, 120));
    }
    const ukuranBeda = idx.filter((i) => P[i].stat.n && !/^\(?UKURAN/i.test(P[i].teks.trim()) && !/DIAJUKAN|SALAH SATU SYARAT/i.test(P[i].teks) && (Math.abs(ukuranDominan(P[i]) - 14) > 0.25 || rasio(P[i], 'tebal') < 0.9));
    if (!ukuranBeda.length) tambah(grup, 'lulus', 'Times New Roman 14 pt tebal', 'Templat', 'Ukuran dan ketebalan huruf sama dengan templat.');
    else tambah(grup, 'perhatian', 'Ukuran/ketebalan huruf berbeda dengan templat', 'Templat', 'Templat menulis semua baris dengan Times New Roman 14 pt tebal (keterangan tujuan 12 pt).',
      ukuranBeda.map((i) => rinci(i, `${fmtAngka(ukuranDominan(P[i]), 1)} pt${rasio(P[i], 'tebal') < 0.9 ? ', tidak tebal' : ''} — ${kutip(P[i].teks, 50)}`)));
    cekSpasi(grup, idx.filter((i) => P[i].teks.trim()), 1, 'Pedoman 3.5–3.6');
    return { idx, judulTA, teks };
  }
  function cekSpasi(grup, idx, harap, ref, opsiCek = {}) {
    if (!idx.length) return;
    const salah = [], templat = [];
    for (const i of idx) {
      const k = kaliSpasi(P[i]);
      if (k != null && Math.abs(k - harap) <= 0.04) continue;
      if (k != null && Math.abs(k - 1.2) <= 0.02 && harap !== 1.2) templat.push(i); else salah.push(i);
    }
    const nama = NAMA_SPASI[harap] || fmtAngka(harap);
    if (!salah.length && !templat.length) { tambah(grup, 'lulus', `Spasi ${nama}`, ref, `Spasi baris ${nama} sesuai pedoman.`); return; }
    if (templat.length) tambah(grup, opsiCek.lunak ? 'info' : 'perhatian', `Spasi 1,2 seperti templat; pedoman meminta ${nama}`, ref,
      `Templat resmi memakai spasi 1,2 di bagian ini, sedangkan pedoman meminta spasi ${nama}. Ikuti pedoman kecuali prodi menetapkan lain.`,
      templat.slice(0, 15).map((i) => rinci(i, `spasi 1,2 — ${kutip(P[i].teks, 50)}`)));
    if (salah.length) tambah(grup, opsiCek.lunak ? 'perhatian' : 'gagal', `Spasi baris bukan ${nama}`, ref, `${salah.length} paragraf berspasi lain. Paragraph → Line spacing → ${nama}.`,
      salah.slice(0, 30).map((i) => rinci(i, `spasi ${teksSpasi(P[i])} — ${kutip(P[i].teks, 50)}`)),
      tandaParagraf(salah, `Spasi baris paragraf ini ${teksSpasi(P[salah[0]])}; ${ref} meminta spasi ${nama}.`, 6));
  }
  let infoSampul = null;
  if (cariB('sampul')) infoSampul = cekHalamanJudul(cariB('sampul'), 'sampul', 'halaman sampul');
  if (cariB('sampul')) {
    const idx = isiHal(cariB('sampul'));
    const logo = idx.flatMap((i) => P[i].gambar).filter((g) => g.cx > 0).sort((a, b) => b.cx * b.cy - a.cx * a.cy)[0];
    if (logo) {
      const w = logo.cx / 360000, h = logo.cy / 360000;
      const dekat = (a, b, t) => Math.abs(a - b) <= t;
      const ukuranTeks = `${fmtAngka(w)} × ${fmtAngka(h)} cm`;
      if ((dekat(w, 3.5, 0.25) && dekat(h, 3, 0.25)) || (dekat(w, 3, 0.25) && dekat(h, 3.5, 0.25))) tambah('sampul', 'lulus', 'Logo UMB 3,5 × 3 cm', 'Pedoman 3.5', ukuranTeks);
      else if (dekat(w, 5, 0.2) && dekat(h, 4.31, 0.2)) tambah('sampul', 'perhatian', 'Logo seukuran templat (5 × 4,3 cm)', 'Pedoman 3.5', `Logo ${ukuranTeks} mengikuti templat; pedoman menyebut 3,5 × 3 cm. Ikuti arahan prodi.`);
      else tambah('sampul', 'perhatian', 'Ukuran logo', 'Pedoman 3.5', `Logo ${ukuranTeks}; pedoman 3,5 × 3 cm.`);
    }
  }
  if (cariB('judul')) {
    const bj = cariB('judul');
    const info = cekHalamanJudul(bj, 'judul', 'halaman judul');
    if (bj.pDiajukan) tambah('judul', 'lulus', 'Keterangan tujuan penyusunan ada', 'Pedoman 3.6', kutip(bj.pDiajukan.teks, 120));
    else tambah('judul', 'gagal', 'Keterangan tujuan belum ada', 'Pedoman 3.6', 'Halaman judul memuat keterangan "Diajukan Sebagai Salah Satu Syarat Untuk Memperoleh Gelar Sarjana".', [],
      [{ p: bj.mulai, hl: false, komentar: 'Halaman judul sama dengan sampul ditambah keterangan "Diajukan Sebagai Salah Satu Syarat Untuk Memperoleh Gelar Sarjana" (Pedoman 3.6).' }]);
    if (info && infoSampul && infoSampul.judulTA && info.judulTA && normJudul(info.judulTA) !== normJudul(infoSampul.judulTA)) {
      tambah('judul', 'perhatian', 'Judul berbeda dengan sampul', 'Pedoman 3.6', `Sampul: "${kutip(infoSampul.judulTA, 80)}" — halaman judul: "${kutip(info.judulTA, 80)}".`);
    }
  } else if (cariB('sampul')) {
    tambah('judul', 'gagal', 'Halaman judul tidak ditemukan', 'Pedoman 2.1.2', 'Halaman judul (sama dengan sampul + keterangan tujuan) tidak ditemukan sesudah sampul.');
  }

  /* ---------- Bagian awal lain ---------- */
  const isiBagian = (b) => (b ? b.isi.filter((i) => P[i].tabel == null) : []);
  const prosaB = (b, minKata = 3) => isiBagian(b).filter((i) => hitungKata(P[i].teks) >= minKata);
  if (B.pernyataan) {
    const b = B.pernyataan;
    cekSpasi('pernyataan', prosaB(b), 2, 'Pedoman 3.7');
    const teks = b.isi.map((i) => normJudul(P[i].teks)).join(' ');
    const hilang = [['Nama', /\bNAMA\b/], ['NIM', /\bNIM\b/], ['Fakultas/Program Studi', /FAKULTAS|PROGRAM STUDI/], ['pernyataan hasil karya sendiri', /KARYA SAYA SENDIRI|HASIL KARYA SENDIRI|KARYA SENDIRI/]].filter(([, rx]) => !rx.test(teks)).map(([n]) => n);
    if (!hilang.length) tambah('pernyataan', 'lulus', 'Isi pernyataan lengkap', 'Templat', 'Memuat nama, NIM, fakultas/prodi, dan pernyataan karya sendiri.');
    else tambah('pernyataan', 'perhatian', 'Isi pernyataan belum lengkap', 'Templat', 'Belum ditemukan: ' + hilang.join(', ') + '.');
  }
  if (B.turnitin) {
    const b = B.turnitin;
    const teks = b.isi.map((i) => P[i].teks).join(' ');
    const persen = [];
    const rx = /(\d{1,3}(?:[.,]\d{1,2})?)\s?%/g;
    let m;
    while ((m = rx.exec(teks))) {
      const sebelum = teks.slice(Math.max(0, m.index - 25), m.index).toLowerCase();
      if (/maks|batas|melebihi|lebih dari|≤|<=|kurang dari/.test(sebelum)) continue;
      persen.push(parseFloat(m[1].replace(',', '.')));
    }
    const adaGambar = b.isi.some((i) => P[i].gambar.length);
    if (persen.length) {
      const x = Math.max(...persen);
      if (x > 30) tambah('turnitin', 'gagal', `Kemiripan ${fmtAngka(x, 1)}% melebihi 30%`, 'Pedoman 2.1.4', 'Tingkat kemiripan Turnitin tidak boleh melebihi 30% (SE Rektor 01/027.1/S-Ed/V/2024).');
      else tambah('turnitin', 'lulus', `Kemiripan ${fmtAngka(x, 1)}% (≤ 30%)`, 'Pedoman 2.1.4', 'Persentase terbaca dari teks halaman ini.');
    } else tambah('turnitin', 'manual', 'Periksa persentase kemiripan', 'Pedoman 2.1.4',
      (adaGambar ? 'Surat berupa gambar/pindaian; ' : '') + 'pastikan kemiripan ≤ 30% dan surat dikeluarkan petugas perpustakaan/fakultas.');
  }
  if (B.loa) {
    const b = B.loa;
    const adaIsi = b.isi.some((i) => P[i].gambar.length) || b.isi.reduce((s, i) => s + hitungKata(P[i].teks), 0) > 60;
    if (adaIsi) tambah('loa', 'lulus', 'LoA terlampir', 'Templat', 'Halaman LoA berisi dokumen.');
    else tambah('loa', 'gagal', 'LoA belum dilampirkan', 'Templat', 'Lampirkan Letter of Acceptance dan bukti pembayaran biaya publikasi.', [],
      [{ p: b.judul.i, hl: false, komentar: 'Lampirkan Letter of Acceptance (LoA) dan bukti pembayaran biaya publikasi di halaman ini.' }]);
  }
  if (B.pengesahan) {
    const b = B.pengesahan;
    cekSpasi('pengesahan', prosaB(b), 1, 'Pedoman 3.9');
    const teks = b.isi.map((i) => normJudul(P[i].teks)).join(' ');
    const hilang = [['Pembimbing', /PEMBIMBING/], ['Dekan', /DEKAN/], ['Ketua Program Studi', /KETUA PROGRAM STUDI|KAPRODI|KETUA PRODI/], ['NIDN/NUPTK', /NIDN|NUPTK|NIDK/]].filter(([, rx]) => !rx.test(teks)).map(([n]) => n);
    if (!hilang.length) tambah('pengesahan', 'lulus', 'Pihak pengesah lengkap', 'Templat', 'Memuat pembimbing, dekan, ketua program studi, dan NIDN/NUPTK.');
    else tambah('pengesahan', 'perhatian', 'Pihak pengesah belum lengkap', 'Templat', 'Belum ditemukan: ' + hilang.join(', ') + '.');
  }
  if (B.kataPengantar) {
    const b = B.kataPengantar;
    cekSpasi('kataPengantar', prosaB(b), 1.5, 'Pedoman 3.10');
    const halTerpakai = P[b.akhir].halAkhir - b.judul.hal + 1;
    const kata = b.isi.reduce((s, i) => s + hitungKata(P[i].teks), 0);
    if (model.andal) {
      if (halTerpakai <= 2) tambah('kataPengantar', 'lulus', 'Maksimal 2 halaman', 'Pedoman 2.1.6', `${halTerpakai} halaman.`);
      else tambah('kataPengantar', 'gagal', `Kata Pengantar ${halTerpakai} halaman`, 'Pedoman 2.1.6', 'Kata Pengantar maksimal 2 halaman.', [],
        [{ p: b.judul.i, hl: false, komentar: `Kata Pengantar ${halTerpakai} halaman; maksimal 2 halaman (Pedoman 2.1.6). Ringkas ucapan terima kasih.` }]);
    } else {
      const taksir = kata / 330;
      if (taksir > 2) tambah('kataPengantar', 'perhatian', 'Kata Pengantar mungkin lebih dari 2 halaman', 'Pedoman 2.1.6', `${kata} kata (± ${fmtAngka(taksir, 1)} halaman pada spasi 1,5). Maksimal 2 halaman.`);
      else tambah('kataPengantar', 'lulus', 'Maksimal 2 halaman', 'Pedoman 2.1.6', `${kata} kata (± ${fmtAngka(taksir, 1)} halaman).`);
    }
    // Urutan ucapan terima kasih: Rektor → Dekan → Kaprodi → Pembimbing.
    const teks = b.isi.map((i) => normJudul(P[i].teks)).join(' \u0001 ');
    const pihak = [['Rektor', /(^|[^A-Z])REKTOR\b/], ['Dekan', /\bDEKAN\b/], ['Ketua Program Studi', /KETUA PROGRAM STUDI|KAPRODI|KETUA PRODI|KETUA JURUSAN/], ['Pembimbing', /PEMBIMBING/]];
    const posisi = pihak.map(([n, rx]) => { const m = rx.exec(teks); return { n, i: m ? m.index : -1 }; });
    const tidakAda = posisi.filter((x) => x.i < 0).map((x) => x.n);
    const ada = posisi.filter((x) => x.i >= 0);
    const terbalik = [];
    for (let k = 1; k < ada.length; k++) if (ada[k].i < ada[k - 1].i) terbalik.push(`${ada[k].n} disebut sebelum ${ada[k - 1].n}`);
    if (!terbalik.length && !tidakAda.length) tambah('kataPengantar', 'lulus', 'Urutan ucapan terima kasih sesuai', 'Pedoman 2.1.6', 'Rektor → Dekan → Ketua Program Studi → Pembimbing.');
    if (terbalik.length) tambah('kataPengantar', 'gagal', 'Urutan ucapan terima kasih tidak sesuai', 'Pedoman 2.1.6', terbalik.join('; ') + '. Urutan: Rektor, Dekan, Ketua Program Studi, Pembimbing, Penguji, lalu pihak lain.', [],
      [{ p: b.judul.i, hl: false, komentar: 'Urutan ucapan terima kasih: Rektor, Dekan Fakultas, Ketua Program Studi, Pembimbing Tugas Akhir, Penguji, lalu pihak lain (Pedoman 2.1.6 dan 3.10).' }]);
    if (tidakAda.length) tambah('kataPengantar', 'perhatian', 'Pihak yang belum disebut', 'Pedoman 2.1.6', 'Belum menyebut: ' + tidakAda.join(', ') + '.');
  }
  if (B.persetujuan) cekSpasi('persetujuan', prosaB(B.persetujuan), 1.5, 'Pedoman 3.11');

  function cekAbstrak(b, grup, inggris) {
    const P2 = b.isi.filter((i) => P[i].tabel == null);
    const rxKunci = inggris ? /^\s*key\s*words?\s*[:：]?/i : /^\s*kata[\s-]*kunci\s*[:：]?/i;
    const iKunci = P2.find((i) => rxKunci.test(P[i].teks));
    const isi = P2.filter((i) => iKunci == null || i < iKunci).filter((i) => hitungKata(P[i].teks) > 0);
    const nama = inggris ? 'Abstract' : 'Abstrak';
    if (b.pra.length >= 2) tambah(grup, 'lulus', 'Judul TA dan nama penulis di atas', 'Pedoman 3.12', `${kutip(P[b.pra[0]].teks, 60)} / ${kutip(P[b.pra[b.pra.length - 1]].teks, 40)}`);
    else tambah(grup, b.pra.length ? 'perhatian' : 'gagal', 'Judul TA dan nama penulis di atas ' + nama, 'Pedoman 3.12', `Di atas judul ${nama} ditulis judul Tugas Akhir dan nama penulis.`, [],
      [{ p: b.judul.i, hl: false, komentar: `Di atas judul ${nama} tuliskan judul Tugas Akhir dan nama penulis (Pedoman 3.12 butir 5).` }]);
    if (isi.length === 1) tambah(grup, 'lulus', 'Satu paragraf', 'Pedoman 3.12', `${nama} terdiri dari satu paragraf.`);
    else if (isi.length > 1) tambah(grup, 'gagal', `${nama} terdiri dari ${isi.length} paragraf`, 'Pedoman 3.12', `${nama} ditulis dalam satu paragraf.`, isi.map((i) => rinci(i)),
      [{ p: isi[1], hl: true, komentar: `${nama} ditulis dalam satu paragraf (Pedoman 3.12 butir 2); gabungkan paragraf ini dengan paragraf sebelumnya.` }]);
    const kata = isi.reduce((s, i) => s + hitungKata(P[i].teks), 0);
    if (isi.length) {
      if (kata >= 250 && kata <= 300) tambah(grup, 'lulus', `${kata} kata (250–300)`, 'Pedoman 3.12', 'Panjang sesuai.');
      else tambah(grup, 'gagal', `${nama} ${kata} kata`, 'Pedoman 3.12', `${nama} memuat 250–300 kata; sekarang ${kata} kata.`, [],
        [{ p: isi[0], hl: false, komentar: `${nama} ${kata} kata; ketentuan 250–300 kata dalam satu paragraf (Pedoman 3.12 butir 2). ${kata < 250 ? 'Tambahkan' : 'Kurangi'} ${kata < 250 ? 250 - kata : kata - 300} kata.` }]);
      cekSpasi(grup, isi, 1, 'Pedoman 3.12');
      const bhs = bahasa(isi.map((i) => P[i].teks).join(' '));
      if (bhs !== '?' && bhs !== (inggris ? 'en' : 'id')) tambah(grup, 'gagal', `${nama} tidak berbahasa ${inggris ? 'Inggris' : 'Indonesia'}`, 'Pedoman 3.12',
        `Isi ${nama} tampaknya berbahasa ${bhs === 'en' ? 'Inggris' : 'Indonesia'}.`, [], [{ p: isi[0], hl: false, komentar: `${nama} semestinya berbahasa ${inggris ? 'Inggris' : 'Indonesia'} (Pedoman 3.12 butir 3).` }]);
      if (inggris) {
        const n = isi.reduce((s, i) => s + P[i].stat.n, 0), mr = isi.reduce((s, i) => s + P[i].stat.miring, 0);
        if (n && mr / n < 0.9) tambah(grup, 'perhatian', 'Abstract belum dicetak miring', 'Templat', 'Templat menulis Abstract dengan huruf miring karena berbahasa asing (Pedoman 3.12 butir 7: istilah asing dicetak miring).');
      }
    }
    if (iKunci == null) tambah(grup, 'gagal', inggris ? 'Keywords belum ada' : 'Kata kunci belum ada', 'Pedoman 3.12', `Di bawah ${nama} dituliskan ${inggris ? 'Keywords' : 'Kata Kunci'} (3–5).`, [],
      [{ p: isi.length ? isi[isi.length - 1] : b.judul.i, hl: false, komentar: `Tambahkan ${inggris ? 'Keywords' : 'Kata Kunci'} (3–5) di bawah ${nama} (Pedoman 3.12 butir 6).` }]);
    else {
      const daftarKunci = P[iKunci].teks.replace(rxKunci, '').split(/[,;]/).map((s) => s.replace(/[.\s]+$/, '').trim()).filter((s) => /\p{L}/u.test(s));
      if (daftarKunci.length >= 3 && daftarKunci.length <= 5) tambah(grup, 'lulus', `${daftarKunci.length} ${inggris ? 'keywords' : 'kata kunci'} (3–5)`, 'Pedoman 3.12', daftarKunci.join(', '));
      else tambah(grup, 'gagal', `${daftarKunci.length} ${inggris ? 'keywords' : 'kata kunci'}`, 'Pedoman 3.12', `${inggris ? 'Keywords' : 'Kata kunci'} berjumlah 3–5.`, [rinci(iKunci)],
        [{ p: iKunci, hl: true, komentar: `${inggris ? 'Keywords' : 'Kata kunci'} berjumlah 3–5 (Pedoman 3.12 butir 6); sekarang ${daftarKunci.length}.` }]);
    }
  }
  if (B.abstrak) cekAbstrak(B.abstrak, 'abstrak', false);
  if (B.abstract) cekAbstrak(B.abstract, 'abstract', true);
  if (B.abstrak && B.abstract) {
    const pA = P[B.abstract.mulai];
    if (!pA.kerasSebelum && P[B.abstrak.mulai].hal === pA.hal) tambah('abstract', 'gagal', 'Abstrak dan Abstract satu halaman', 'Pedoman 3.12', 'Abstrak dan Abstract diletakkan di halaman berbeda.');
  }

  /* ---------- Daftar isi & daftar lain ---------- */
  const entriDaftar = (b) => (b ? b.isi.filter((i) => P[i].teks.trim()) : []);
  const bersihEntri = (t) => t.replace(/[\t ]*[.…_ ]{2,}[\t ]*([ivxlcdm]+|\d+)?\s*$/i, '').replace(/\t+\s*([ivxlcdm]+|\d+)\s*$/i, '').replace(/\s+/g, ' ').trim();
  if (B.daftarIsi) {
    const b = B.daftarIsi;
    const entri = entriDaftar(b);
    const baris = entri.map((i) => normJudul(bersihEntri(P[i].teks)));
    const rxEntri = {
      sampul: /SAMPUL/, judul: /^HALAMAN JUDUL/, pernyataan: /KARYA SENDIRI|ORISINALITAS/, turnitin: /TURNITIN/, loa: /LETTER OF ACCEPTANCE|\bLOA\b/,
      pengesahan: /PENGESAHAN/, kataPengantar: /KATA PENGANTAR|TERIMA ?KASIH/, persetujuan: /PERSETUJUAN PUBLIKASI/, abstrak: /^ABSTRAK\b/, abstract: /^ABSTRACT\b/,
      daftarIsi: /^DAFTAR ISI/, daftarTabel: /^DAFTAR TABEL/, daftarGambar: /^DAFTAR GAMBAR/, daftarLampiran: /^DAFTAR LAMPIRAN/, naskah: /^NASKAH PUBLIKASI/,
      daftarPustaka: /^DAFTAR PUSTAKA|^REFERENSI/, lampiran: /^LAMPIRAN\b/,
    };
    const hilang = [];
    for (const x of bagian) {
      if (x.kunci === 'bab') { if (!baris.some((t) => t.startsWith('BAB ' + x.bab.teksNomor))) hilang.push(x.label); continue; }
      const rx = rxEntri[x.kunci];
      if (rx && !baris.some((t) => rx.test(t))) hilang.push(x.label);
    }
    if (!entri.length) tambah('daftarIsi', 'gagal', 'Daftar isi kosong', 'Pedoman 2.1.9', 'Daftar isi belum berisi entri.');
    else if (!hilang.length) tambah('daftarIsi', 'lulus', 'Memuat semua bagian', 'Pedoman 2.1.9', `${entri.length} entri.`);
    else tambah('daftarIsi', 'perhatian', 'Bagian yang belum tercantum', 'Pedoman 2.1.9', 'Belum tercantum di daftar isi: ' + hilang.join(', ') + '.', [],
      [{ p: b.judul.i, hl: false, komentar: 'Daftar isi belum mencantumkan: ' + hilang.join(', ') + '. Perbarui daftar isi (klik kanan → Update Field → Update entire table).' }]);
    const tanpaNo = entri.filter((i) => !/([ivxlcdm]+|\d+)\s*$/i.test(P[i].teks.trim()) && !/^BAB\s/i.test(P[i].teks.trim()));
    if (entri.length && tanpaNo.length) tambah('daftarIsi', 'perhatian', 'Entri tanpa nomor halaman', 'Pedoman 2.1.9', `${tanpaNo.length} entri tidak mencantumkan nomor halaman.`, tanpaNo.slice(0, 15).map((i) => rinci(i)));
    cekSpasi('daftarIsi', entri, 1, 'Pedoman 3.13');
    if (skema === 'skripsi') {
      const babEntri = entri.filter((i) => /^BAB\s+[IVXLC]+/i.test(P[i].teks.trim()));
      const salah = babEntri.filter((i) => rasio(P[i], 'tebal') < 0.9 || !hurufBesar(P[i]));
      if (babEntri.length && salah.length) tambah('daftarIsi', 'gagal', 'Judul bab di daftar isi belum tebal kapital', 'Pedoman 3.13', 'Judul setiap bab di daftar isi ditulis tebal dan kapital.', salah.map((i) => rinci(i)),
        tandaParagraf(salah, 'Judul bab di daftar isi ditulis tebal dan huruf kapital (Pedoman 3.13 butir 2).'));
    }
    const otomatis = P.some((p) => p.toc && dalam(b, p.i));
    tambah('daftarIsi', 'info', otomatis ? 'Daftar isi otomatis' : 'Daftar isi diketik manual', 'Saran',
      otomatis ? 'Daftar isi dibuat dengan fitur Word. Perbarui (Update Field) sebelum dicetak.' : 'Daftar isi tidak dibuat dengan fitur Word (References → Table of Contents); nomor halaman harus dicocokkan manual.');
  }
  for (const [k, awalan] of [['daftarTabel', 'Tabel'], ['daftarGambar', 'Gambar'], ['daftarLampiran', 'Lampiran']]) {
    const b = B[k];
    if (!b) continue;
    const entri = entriDaftar(b).filter((i) => new RegExp('^' + awalan + '\\b', 'i').test(P[i].teks.trim()));
    const salah = [];
    for (const i of entri) {
      const judul = bersihEntri(P[i].teks).replace(new RegExp('^' + awalan + '\\s+[\\dIVXivx.]+\\s*[.:]?\\s*', 'i'), '');
      const kata = bukanTitleCase(judul);
      if (kata.length) salah.push({ i, kata });
    }
    if (!entri.length) tambah(k, 'info', 'Belum ada entri', 'Pedoman 3.14', `${LABEL[k]} belum berisi entri "${awalan} …".`);
    else if (!salah.length) tambah(k, 'lulus', 'Nama ditulis kapital di awal kata', 'Pedoman 2.1.10', `${entri.length} entri bertitle case.`);
    else tambah(k, 'gagal', 'Nama belum kapital di awal kata', 'Pedoman 2.1.10', `Nama ${awalan.toLowerCase()} ditulis dengan huruf kapital di awal kata (title case).`,
      salah.map((x) => rinci(x.i, `${kutip(P[x.i].teks, 50)} — ${x.kata.join(', ')}`)),
      salah.map((x, n) => ({ p: x.i, hl: true, komentar: n === 0 ? `Nama ${awalan.toLowerCase()} ditulis dengan huruf kapital di awal setiap kata (title case), kecuali kata tugas seperti "dan", "di", "pada" (Pedoman 2.1.10).` : null })));
    cekSpasi(k, entri, 1, 'Pedoman 3.14');
  }

  /* ---------- Isi: bab (skema skripsi) ---------- */
  if (babList.length) {
    const salah = [];
    babList.forEach((b, k) => {
      const masalah = [];
      if (!b.bab.romawi) masalah.push(`nomor "${b.bab.teksNomor}" bukan angka romawi`);
      if (b.bab.nomor !== k + 1) masalah.push(`nomor seharusnya ${angkaRomawi(k + 1)}`);
      for (const i of b.baris) {
        const p = P[i];
        if (!hurufBesar(p)) masalah.push('belum kapital');
        if (rasio(p, 'tebal') < 0.9) masalah.push('belum tebal');
        if (p.jc !== 'center') masalah.push('tidak di tengah');
        if (/\.$/.test(p.teks.trim())) masalah.push('diakhiri titik');
      }
      if (masalah.length) salah.push({ b, masalah: [...new Set(masalah)] });
    });
    if (!salah.length) tambah('isi', 'lulus', 'Judul bab sesuai', 'Pedoman 3.15', `${babList.length} bab: "BAB" + angka romawi, kapital, tebal, di tengah, tanpa titik.`);
    else tambah('isi', 'gagal', 'Judul bab belum sesuai', 'Pedoman 3.15', 'Judul bab diawali "BAB" + angka romawi, kapital, tebal, simetris di tengah, tanpa titik.',
      salah.map((x) => rinci(x.b.judul.i, `${x.b.label}: ${x.masalah.join(', ')}`)),
      salah.map((x) => ({ p: x.b.judul.i, hl: true, komentar: `${x.b.label}: ${x.masalah.join(', ')}. Pedoman 3.15: "BAB" + angka romawi, huruf kapital, tebal, di tengah, tanpa titik.` })));
    const babOutline = babList.map((b) => b.judul.outline).filter((x) => x != null);
    const dasar = babOutline.length ? Math.min(...babOutline) : null;
    const dalamIsi = [];
    for (let k = 0; k < babList.length; k++) for (const i of babList[k].isi) dalamIsi.push(i);
    const terlaluDalam = dalamIsi.filter((i) => {
      const p = P[i];
      if (p.tabel != null || p.toc) return false;
      if (/^(\d+\.){3,}\d+\.?\s+\S/.test(p.teks.trim())) return true;
      return dasar != null && p.outline != null && p.outline >= dasar + 3 && hitungKata(p.teks) <= 15;
    });
    if (!terlaluDalam.length) tambah('isi', 'lulus', 'Subbab maksimal 2 tingkat', 'Pedoman 3.15', 'Tidak ada subbab lebih dalam dari X.Y.Z.');
    else tambah('isi', 'gagal', 'Subbab lebih dari 2 tingkat', 'Pedoman 3.15', 'Tingkatan subbab maksimal 2 (mis. 1.1.1). Rincian lebih lanjut memakai huruf a., b., c.',
      terlaluDalam.map((i) => rinci(i)), terlaluDalam.map((i, n) => ({ p: i, hl: true, komentar: n === 0 ? 'Subbab maksimal 2 tingkat (1.1.1). Ubah rincian ini menjadi butir berhuruf a., b., c. (Pedoman 3.15).' : null })));
    const awalIsi = P[babList[0].mulai];
    const akhirIsi = B.daftarPustaka ? P[B.daftarPustaka.akhir] : P[babList[babList.length - 1].akhir];
    const jml = akhirIsi.halAkhir - awalIsi.hal + 1;
    if (model.andal) {
      if (jml >= 65 && jml <= 90) tambah('isi', 'lulus', `${jml} halaman (65–90)`, 'Pedoman 3.3', 'Jumlah halaman BAB I s.d. Daftar Pustaka sesuai.');
      else tambah('isi', 'perhatian', `Isi ${jml} halaman`, 'Pedoman 3.3', 'Skripsi 65–90 halaman dihitung dari BAB I sampai Daftar Pustaka (kecuali penelitian kualitatif).');
    } else tambah('isi', 'info', 'Jumlah halaman isi', 'Pedoman 3.3', `± ${jml} halaman menurut pemisah halaman yang tersimpan; simpan ulang dengan Microsoft Word agar terhitung tepat. Ketentuan: 65–90 halaman.`);
    cekSpasi('isi', dalamIsi.filter((i) => P[i].tabel == null && hitungKata(P[i].teks) >= 15 && !RX_KAPSI.test(P[i].teks.trim())), 1.5, 'Pedoman 3.2');
    cekKeteranganTabelGambar(babList);
  }
  function cekKeteranganTabelGambar(daftarBab) {
    const posBlok = new Map(model.blok.map((x, k) => [x.jenis === 'p' ? 'p' + x.p : 't' + x.t, k]));
    const blokBerisi = (k, arah) => {
      for (let j = k + arah; j >= 0 && j < model.blok.length; j += arah) {
        const x = model.blok[j];
        if (x.jenis === 'tabel') return x;
        if (!P[x.p].kosong) return x;
      }
      return null;
    };
    const kapsi = [];
    daftarBab.forEach((b) => {
      for (const i of b.isi) {
        const p = P[i];
        if (p.tabel != null || p.toc) continue;
        const m = RX_KAPSI.exec(p.teks.trim());
        if (!m) continue;
        const k = posBlok.get('p' + i);
        const sesudah = blokBerisi(k, 1), sebelum = blokBerisi(k, -1);
        const dekatObjek = (sesudah && (sesudah.jenis === 'tabel' || P[sesudah.p].gambar.length)) || (sebelum && (sebelum.jenis === 'tabel' || P[sebelum.p].gambar.length));
        if (!(p.jc === 'center' || /caption|keterangan/i.test(p.namaGaya) || dekatObjek)) continue;
        kapsi.push({ i, b, jenis: m[1].toLowerCase(), bab: parseInt(m[2], 10), urut: m[3] ? parseInt(m[3], 10) : null, titik: !!m[4], judul: m[5], sesudah, sebelum });
      }
    });
    if (!kapsi.length) return;
    const masalah = [];
    for (const c of kapsi) {
      const m = [];
      if (c.urut == null) m.push('nomor tidak menyertakan nomor bab (mis. ' + (c.jenis === 'tabel' ? 'Tabel' : 'Gambar') + ` ${c.b.bab.nomor}.1)`);
      else if (c.bab !== c.b.bab.nomor) m.push(`nomor bab ${c.bab} padahal berada di ${c.b.label}`);
      if (c.titik) m.push('ada titik sesudah nomor');
      const tc = bukanTitleCase(c.judul);
      if (tc.length) m.push('nama belum title case (' + tc.slice(0, 3).join(', ') + ')');
      if (c.jenis === 'tabel' && !(c.sesudah && c.sesudah.jenis === 'tabel')) m.push('judul tabel tidak tepat di atas tabel');
      if (c.jenis === 'gambar' && !(c.sebelum && c.sebelum.jenis === 'p' && P[c.sebelum.p].gambar.length)) m.push('judul gambar tidak tepat di bawah gambar');
      if (c.jenis === 'gambar' && P[c.i].jc !== 'center') m.push('judul gambar tidak di tengah');
      if (m.length) masalah.push({ c, m });
    }
    if (!masalah.length) tambah('isi', 'lulus', 'Judul tabel dan gambar sesuai', 'Pedoman 3.16', `${kapsi.length} judul tabel/gambar: bernomor bab, tanpa titik, title case, letaknya benar.`);
    else tambah('isi', 'gagal', 'Judul tabel/gambar belum sesuai', 'Pedoman 3.16', 'Nomor menyertakan nomor bab tanpa titik penutup (Tabel 1.1), title case; judul tabel di atas tabel, judul gambar di bawah gambar dan di tengah.',
      masalah.map((x) => rinci(x.c.i, `${kutip(P[x.c.i].teks, 45)} — ${x.m.join('; ')}`)),
      masalah.map((x) => ({ p: x.c.i, hl: true, komentar: x.m.join('; ') + ' (Pedoman 3.16).' })));
    const objekTidakTengah = [];
    for (const t of model.tabel) if (t.blok != null && babList.some((b) => t.pAwal >= b.mulai && t.pAwal <= b.akhir) && t.jc !== 'center') objekTidakTengah.push(t.pAwal);
    for (const b of babList) for (const i of b.isi) if (P[i].tabel == null && P[i].gambar.some((g) => !g.jangkar) && P[i].jc !== 'center') objekTidakTengah.push(i);
    if (objekTidakTengah.length) tambah('isi', 'perhatian', 'Tabel/gambar tidak di tengah', 'Pedoman 3.16', 'Tabel dan gambar selalu simetris di tengah halaman (Table Properties → Alignment: Center; paragraf gambar: Center).',
      objekTidakTengah.map((i) => rinci(i)), tandaParagraf(objekTidakTengah, 'Tabel/gambar diletakkan simetris di tengah halaman (Pedoman 3.16 butir 5).'));
    const sumber = [];
    for (const b of babList) for (const i of b.isi) if (/^sumber\s*:/i.test(P[i].teks.trim()) && Math.abs((ukuranDominan(P[i]) || 12) - 10) > 0.25) sumber.push(i);
    if (sumber.length) tambah('isi', 'gagal', 'Keterangan sumber bukan 10 pt', 'Pedoman 3.16', 'Sumber tabel/gambar ditulis huruf tegak Times New Roman 10 pt.', sumber.map((i) => rinci(i)),
      tandaParagraf(sumber, 'Keterangan sumber tabel/gambar ditulis Times New Roman 10 pt, huruf tegak (Pedoman 3.16 butir 9).'));
  }

  /* ---------- Naskah publikasi (skema publikasi) ---------- */
  if (skema === 'publikasi' && B.naskah) {
    const b = B.naskah;
    const kata = b.isi.reduce((s, i) => s + hitungKata(P[i].teks), 0);
    const gambar = b.isi.some((i) => P[i].gambar.length);
    if (kata >= 800 || (gambar && kata < 200 && b.isi.length > 3)) tambah('naskah', 'lulus', 'Naskah publikasi terlampir', 'Templat', `${kata} kata${gambar ? ' (dengan gambar/pindaian)' : ''}. Format naskah mengikuti jurnal tujuan dan tidak diperiksa terhadap aturan huruf/spasi pedoman.`);
    else tambah('naskah', 'gagal', 'Naskah publikasi belum lengkap', 'Templat', `Bagian naskah hanya ${kata} kata. Lampirkan utuh naskah yang sudah diterima (accepted) penerbit jurnal.`, [],
      [{ p: b.judul.i, hl: false, komentar: 'Lampirkan secara utuh naskah publikasi ilmiah yang sudah diterima (accepted) oleh penerbit jurnal.' }]);
    tambah('naskah', 'manual', 'Jurnal tujuan terindeks', 'Pedoman 3.20', 'Minimal Sinta 4, Scopus (Q1–non-Q), Clarivate/WoS, Copernicus, atau prosiding terindeks Scopus/WoS; mahasiswa penulis pertama.');
  }

  /* ---------- Daftar pustaka ---------- */
  if (B.daftarPustaka) {
    const b = B.daftarPustaka;
    const entri = b.isi.filter((i) => P[i].tabel == null && hitungKata(P[i].teks) >= 3);
    const kunci = (t) => t.replace(/^[^\p{L}]+/u, '').toLowerCase();
    const salahUrut = [];
    for (let k = 1; k < entri.length; k++) if (kunci(P[entri[k]].teks).localeCompare(kunci(P[entri[k - 1]].teks), 'id') < 0) salahUrut.push(entri[k]);
    if (!entri.length) tambah('pustaka', 'gagal', 'Daftar pustaka kosong', 'Pedoman 2.3.1', 'Belum ada entri daftar pustaka.');
    else {
      if (!salahUrut.length) tambah('pustaka', 'lulus', 'Urut abjad', 'APA 7', `${entri.length} entri urut abjad nama penulis.`);
      else tambah('pustaka', 'gagal', 'Belum urut abjad', 'APA 7', 'Entri daftar pustaka APA diurutkan menurut abjad nama belakang penulis pertama.', salahUrut.map((i) => rinci(i)),
        salahUrut.map((i, n) => ({ p: i, hl: true, komentar: n === 0 ? 'Entri ini tidak urut abjad. Daftar pustaka APA 7 diurutkan menurut nama belakang penulis pertama (Pedoman 3.18).' : null })));
      const tahun = [];
      const tanpaTahun = [];
      for (const i of entri) {
        const t = P[i].teks;
        const m = /\((\d{4})[a-z]?(?:[,;][^)]*)?\)/.exec(t) || /\b((?:19|20)\d{2})\b/.exec(t);
        if (!m) { tanpaTahun.push(i); continue; }
        const jurnal = /\b\d+\s*\(\s*\d+\s*\)|\bvol\.?\s*\d|\bjurnal\b|\bjournal\b|doi\.org|\bdoi\s*:|\bpp?\.\s*\d|\bproceedings?\b|\bprosiding\b/i.test(t);
        tahun.push({ i, th: parseInt(m[1], 10), jurnal });
      }
      if (tahun.length) {
        const baru = tahun.filter((x) => x.th >= tahunAcuan - (x.jurnal ? 3 : 8));
        const persen = (baru.length / tahun.length) * 100;
        const rincianLama = tahun.filter((x) => x.th < tahunAcuan - (x.jurnal ? 3 : 8));
        const pesan = `${baru.length} dari ${tahun.length} sumber (${fmtAngka(persen, 0)}%) terbaru, dihitung dari tahun ${tahunAcuan}: jurnal ≥ ${tahunAcuan - 3}, buku/sumber lain ≥ ${tahunAcuan - 8}.`;
        if (persen >= 70) tambah('pustaka', 'lulus', `${fmtAngka(persen, 0)}% sumber terbaru (≥ 70%)`, 'Pedoman 2.3.1', pesan);
        else tambah('pustaka', 'gagal', `Sumber terbaru baru ${fmtAngka(persen, 0)}%`, 'Pedoman 2.3.1', pesan + ' Ketentuan: 70% sumber terbaru.',
          rincianLama.slice(0, 20).map((x) => rinci(x.i, `${x.th} (${x.jurnal ? 'jurnal' : 'buku/lainnya'}) — ${kutip(P[x.i].teks, 50)}`)),
          [{ p: b.judul.i, hl: false, komentar: pesan + ' Pedoman 2.3.1: 70% sumber terbaru (buku 8 tahun terakhir, artikel jurnal 3 tahun terakhir).' }]);
      }
      if (tanpaTahun.length) tambah('pustaka', 'perhatian', 'Entri tanpa tahun', 'APA 7', `${tanpaTahun.length} entri tidak memuat tahun terbit (gunakan "n.d." bila memang tidak ada).`, tanpaTahun.slice(0, 15).map((i) => rinci(i)));
      const gantung = entri.filter((i) => P[i].gantung > 0 || P[i].awal < 0);
      if (gantung.length / entri.length >= 0.8) tambah('pustaka', 'lulus', 'Indentasi gantung (hanging)', 'APA 7', 'Baris kedua setiap entri menjorok ke dalam.');
      else tambah('pustaka', 'perhatian', 'Belum memakai indentasi gantung', 'APA 7', 'Format APA 7: baris kedua dan seterusnya menjorok 1,27 cm (Paragraph → Special: Hanging).');
      cekSpasi('pustaka', entri, 1.5, 'Pedoman 3.2', { lunak: true });
    }
  }
  {
    const alat = [];
    const semua = model.medan.join('\n') + '\n' + model.tagSdt.join('\n');
    if (/ADDIN\s+ZOTERO_/i.test(semua)) alat.push('Zotero');
    if (/ADDIN\s+(CSL_CITATION|Mendeley)|MENDELEY_|mendeley/i.test(semua)) alat.push('Mendeley');
    if (/ADDIN\s+EN\.(CITE|REFLIST)/i.test(semua)) alat.push('EndNote');
    if (/^\s*(CITATION|BIBLIOGRAPHY)\b/im.test(semua)) alat.push('fitur sitasi Word');
    const grup = B.daftarPustaka ? 'pustaka' : (B.naskah ? 'naskah' : 'umum');
    if (alat.some((a) => a !== 'fitur sitasi Word')) tambah(grup, 'lulus', 'Sitasi dibuat dengan reference manager', 'Pedoman 3.18', 'Terdeteksi: ' + alat.join(', ') + '.');
    else if (alat.length) tambah(grup, 'perhatian', 'Sitasi memakai fitur bawaan Word', 'Pedoman 3.18', 'Pedoman mewajibkan reference manager seperti Mendeley atau Zotero.');
    else tambah(grup, skema === 'skripsi' ? 'gagal' : 'perhatian', 'Reference manager tidak terdeteksi', 'Pedoman 3.18',
      'Tidak ditemukan field sitasi Mendeley/Zotero. Kutipan dan daftar pustaka wajib dibuat dengan reference manager (bila naskah ditempel ulang, field-nya hilang).');
  }

  /* ---------- Lampiran ---------- */
  if (B.lampiran) {
    const b = B.lampiran;
    const kata = b.isi.reduce((s, i) => s + hitungKata(P[i].teks), 0) + b.isi.filter((i) => P[i].gambar.length).length * 50;
    if (skema === 'publikasi') {
      if (kata < 30) tambah('lampiran', 'gagal', 'Lampiran belum berisi', 'Templat', 'Lampirkan kertas kerja penyusunan publikasi ilmiah.', [],
        [{ p: b.judul.i, hl: false, komentar: 'Mahasiswa wajib melampirkan kertas kerja penyusunan publikasi ilmiah (templat).' }]);
      else tambah('lampiran', 'lulus', 'Lampiran berisi', 'Templat', 'Bagian lampiran tidak kosong.');
    }
    const judulLampiran = b.isi.filter((i) => /^Lampiran\s+\d+/i.test(P[i].teks.trim()) && P[i].tabel == null);
    const tidakKanan = judulLampiran.filter((i) => P[i].jc !== 'right');
    if (judulLampiran.length) {
      if (!tidakKanan.length) tambah('lampiran', 'lulus', 'Judul lampiran di kanan atas', 'Pedoman 3.19', `${judulLampiran.length} judul lampiran rata kanan.`);
      else tambah('lampiran', 'gagal', 'Judul lampiran belum di kanan atas', 'Pedoman 3.19', 'Nomor dan judul lampiran ditulis di sudut kanan atas halaman (rata kanan).',
        tidakKanan.map((i) => rinci(i)), tandaParagraf(tidakKanan, 'Nomor dan judul lampiran ditulis di sudut kanan atas (rata kanan), huruf tegak TNR 12, title case (Pedoman 3.19).'));
    }
  }

  return temuan;
}
const RX_KAPSI = /^(Tabel|Gambar|Grafik|Diagram)\s+(\d+)(?:\.(\d+))?(\.)?(?:\s+|\s*[:\-–]\s*)(\S.*)$/i;
function range(a, b) { const out = []; for (let i = a; i <= b; i++) out.push(i); return out; }

/* ================================================================ Kebersihan & kebahasaan */

const POLA_TEMPLAT = [
  /\(\s*Ukuran\s*:/i, /^JUDUL TUGAS AKHIR$/, /^NAMA MAHASISWA\.?$/, /^NIM$/, /^\(?TAHUN\)?$/, /\(\s*tanggal\s*\)/i,
  /\(\s*Nama\s*&\s*gelar\s*\)/i, /\((nama prodi|nama fakultas|Nama Rektor|Nama Dekan|Nama Kaprodi|Nama Dosen Pembimbing)\)/i,
  /^NAMA PENULIS$/, /^THESIS TITLE$/, /^AUTHOR NAME$/, /\(\s*3\s*-\s*5\s*(kata|words)\s*\)/i, /\(\s*250\s*-\s*300\s*(kata|words)/i,
  /^Isi abstrak terdiri dari/i, /^Abstract contents are/i, /^Format naskah publikasi ilmiah atau artikel jurnal mengikuti/i,
  /^Lampirkan secara utuh naskah/i, /^Mahasiswa wajib melampirkan kertas kerja/i, /^Surat Keterangan Hasil Uji Turnitin dikeluarkan oleh/i,
  /^Dokumen Letter of Acceptance \(LoA\) dan bukti pembayaran/i, /dan seterusnya menurut penulis yang dianggap pantas/i,
  /^PROGRAM STUDI\s*[.…]+$/i, /^FAKULTAS\s*[.…]*$/i, /Materai\s*(dan|&)\s*ttd/i, /\(\s*nama mahasiswa\s*\)/i, /^Nama Mahasiswa\.$/,
  /Dekan Fakultas\s*[.…]{3,}/i, /NIDN\/NUPTK\s*:\s*[.…]+/i,
];
const POLA_LABEL_KOTAK = /HALAMAN (SAMPUL|JUDUL) TA|ABSTRAK BHS\.?|CONTOH DAFTAR/i;

function periksaKebersihan(model, tambahTemuan) {
  const P = model.paragraf;
  const sisa = [], titik = [];
  for (const p of P) {
    if (p.kosong) continue;
    const t = p.teks.replace(/\s+/g, ' ').trim();
    if (POLA_TEMPLAT.some((rx) => rx.test(t))) { sisa.push(p.i); continue; }
    if (p.toc || /\t/.test(p.teks.trim()) || /[.…]{4,}\s*([ivxlcdm]+|\d+)\s*$/i.test(t)) continue;
    if (/\.{5,}|…{2,}|(?:\.\s){4,}/.test(t)) titik.push(p.i);
  }
  const label = model.kotakTeks.filter((x) => POLA_LABEL_KOTAK.test(x.teks));
  if (!sisa.length) tambahTemuan('bersih', 'lulus', 'Tidak ada sisa petunjuk templat', 'Templat', 'Teks contoh/petunjuk templat sudah diganti.');
  else tambahTemuan('bersih', 'gagal', 'Sisa petunjuk templat', 'Templat', `${sisa.length} baris masih berisi teks contoh atau petunjuk templat. Ganti dengan isi sebenarnya atau hapus.`,
    sisa.map((i) => ({ p: i })), sisa.map((i, n) => ({ p: i, hl: true, komentar: n === 0 ? 'Teks yang disorot dengan komentar ini dan sorotan serupa adalah petunjuk/contoh templat; ganti dengan isi sebenarnya atau hapus.' : null })));
  if (label.length) tambahTemuan('bersih', 'gagal', 'Kotak label templat belum dihapus', 'Templat', 'Kotak teks penanda templat (mis. "HALAMAN SAMPUL TA", "CONTOH DAFTAR ISI") masih ada. Klik tepi kotak lalu tekan Delete.',
    label.map((x) => ({ p: x.p, teks: x.teks })), label.map((x) => ({ p: x.p, hl: false, komentar: `Kotak label templat "${kutip(x.teks, 40)}" masih ada; hapus kotaknya.` })));
  if (titik.length) tambahTemuan('bersih', 'gagal', 'Titik-titik isian belum diisi', 'Templat', `${titik.length} baris masih memuat titik-titik isian.`,
    titik.map((i) => ({ p: i })), titik.map((i) => {
      const m = /\.{5,}|…{2,}|(?:\.\s){4,}/.exec(P[i].teks);
      return { p: i, hl: true, s: m.index, e: m.index + m[0].length, komentar: null };
    }));
  const h = model.hitung;
  if (h.revisi) tambahTemuan('bersih', 'gagal', 'Masih ada Track Changes', 'Saran', `${h.revisi} tanda perubahan (Track Changes) belum diterima/ditolak. Review → Accept → Accept All Changes, lalu matikan Track Changes.`);
  if (h.komentar) tambahTemuan('bersih', 'perhatian', 'Masih ada komentar lama', 'Saran', `${h.komentar} komentar dari penyunting sebelumnya masih ada di naskah. Hapus setelah ditindaklanjuti.`);
  const sorot = P.filter((p) => p.stat.sorot > 0).map((p) => p.i);
  if (sorot.length) tambahTemuan('bersih', 'perhatian', 'Ada stabilo (highlight) lama', 'Saran', `${sorot.length} paragraf masih memakai highlight sebelum diperiksa. Hapus sebelum dicetak; sorotan kuning baru dari pemeriksa ini ditambahkan pada berkas hasil.`,
    sorot.slice(0, 15).map((i) => ({ p: i })));
  if (h.altChunk) tambahTemuan('bersih', 'info', 'Dokumen sisipan tidak diperiksa', 'Saran', `${h.altChunk} bagian sisipan (altChunk) tidak dapat dibaca.`);
}

// Kata tidak baku → bentuk baku (KBBI/EYD V). Daftar dikurasi dari kesalahan
// yang sering muncul pada naskah teknik; huruf kecil semua.
const TIDAK_BAKU = {
  analisa: 'analisis', menganalisa: 'menganalisis', dianalisa: 'dianalisis', aktifitas: 'aktivitas', efektifitas: 'efektivitas',
  kreatifitas: 'kreativitas', produktifitas: 'produktivitas', sensitifitas: 'sensitivitas', selektifitas: 'selektivitas',
  obyek: 'objek', obyektif: 'objektif', subyek: 'subjek', subyektif: 'subjektif', praktek: 'praktik', praktekkan: 'praktikkan',
  resiko: 'risiko', beresiko: 'berisiko', sistim: 'sistem', tehnik: 'teknik', tehnis: 'teknis', tehnologi: 'teknologi', tekhnologi: 'teknologi',
  kwalitas: 'kualitas', kwantitas: 'kuantitas', frekwensi: 'frekuensi', ekwivalen: 'ekuivalen', standarisasi: 'standardisasi',
  legalisir: 'legalisasi', merubah: 'mengubah', dirubah: 'diubah', mempengaruhi: 'memengaruhi',
  mentaati: 'menaati', mensukseskan: 'menyukseskan', mengkonsumsi: 'mengonsumsi', mengkoordinasikan: 'mengoordinasikan',
  mengkonversi: 'mengonversi', mengkonversikan: 'mengonversikan', mengkombinasikan: 'mengombinasikan', mengkonfirmasi: 'mengonfirmasi',
  mengkalibrasi: 'mengalibrasi', mengkategorikan: 'mengategorikan', mengkoreksi: 'mengoreksi', mengkomunikasikan: 'mengomunikasikan',
  mengkontrol: 'mengontrol', mengkonfigurasi: 'mengonfigurasi', mengkompres: 'mengompres', mengkalkulasi: 'mengalkulasi',
  mensurvei: 'menyurvei', mensimulasikan: 'menyimulasikan', mensimulasi: 'menyimulasi', mensintesis: 'menyintesis', mensuplai: 'menyuplai',
  mempopulerkan: 'memopulerkan', mempublikasikan: 'memublikasikan', memparkir: 'memarkir', mempesona: 'memesona',
  jaman: 'zaman', ijin: 'izin', ijasah: 'ijazah', nasehat: 'nasihat', silahkan: 'silakan', sekedar: 'sekadar', kadaluarsa: 'kedaluwarsa',
  kadaluwarsa: 'kedaluwarsa', trampil: 'terampil', ketrampilan: 'keterampilan', nampak: 'tampak', menyolok: 'mencolok', apotik: 'apotek',
  hutang: 'utang', karir: 'karier', atlit: 'atlet', diagnosa: 'diagnosis', hipotesa: 'hipotesis', sintesa: 'sintesis', metoda: 'metode',
  methode: 'metode', prosentase: 'persentase', persentasi: 'persentase', propinsi: 'provinsi', ekstrim: 'ekstrem', komplit: 'komplet',
  konkrit: 'konkret', kongkrit: 'konkret', jadual: 'jadwal', antri: 'antre', himbau: 'imbau', himbauan: 'imbauan', faham: 'paham',
  fikir: 'pikir', fikiran: 'pikiran', aktip: 'aktif', pasip: 'pasif', efektip: 'efektif', negatip: 'negatif', positip: 'positif',
  tradisionil: 'tradisional', formil: 'formal', azas: 'asas', azasi: 'asasi', varitas: 'varietas', katagori: 'kategori',
  kontinyu: 'kontinu', kontinyuitas: 'kontinuitas', konsekwen: 'konsekuen', konsekwensi: 'konsekuensi', sekertaris: 'sekretaris',
  teoritis: 'teoretis', teoritik: 'teoretis', kwadrat: 'kuadrat', ekivalen: 'ekuivalen', inpormasi: 'informasi', infomasi: 'informasi',
  sistimatis: 'sistematis', ekstrak: 'ekstrak', akurasi: 'akurasi', relatip: 'relatif', kualitatip: 'kualitatif', kuantitatip: 'kuantitatif',
  lembab: 'lembap', kelembaban: 'kelembapan', mengakses: 'mengakses', menerapkan: 'menerapkan', terlanjur: 'telanjur', sholat: 'salat',
  dimana: 'di mana', kemana: 'ke mana', disini: 'di sini', disana: 'di sana', disitu: 'di situ', diatas: 'di atas', dibawah: 'di bawah',
  didalam: 'di dalam', diluar: 'di luar', diantara: 'di antara', didepan: 'di depan', dibelakang: 'di belakang', disamping: 'di samping',
  disekitar: 'di sekitar', ditengah: 'di tengah', diakhir: 'di akhir', diawal: 'di awal', kedalam: 'ke dalam', keatas: 'ke atas',
  kebawah: 'ke bawah', kesana: 'ke sana', kesini: 'ke sini', kedepan: 'ke depan', kebelakang: 'ke belakang', kesamping: 'ke samping',
  dibidang: 'di bidang', dilapangan: 'di lapangan', dilaboratorium: 'di laboratorium', diperusahaan: 'di perusahaan', dikampus: 'di kampus',
  dirumah: 'di rumah', dikelas: 'di kelas', diindonesia: 'di Indonesia', dijakarta: 'di Jakarta', sebagaimana: 'sebagaimana',
};
for (const k of Object.keys(TIDAK_BAKU)) if (TIDAK_BAKU[k] === k) delete TIDAK_BAKU[k];

// Istilah asing yang sering muncul pada TA teknik dan tidak ada di KBBI dalam
// bentuk yang sama. Hanya ditandai bila tidak dicetak miring.
const ISTILAH_ASING = {
  software: 'perangkat lunak', hardware: 'perangkat keras', input: 'masukan', output: 'keluaran', monitoring: 'pemantauan',
  maintenance: 'pemeliharaan', 'predictive maintenance': 'pemeliharaan prediktif', 'preventive maintenance': 'pemeliharaan preventif',
  'machine learning': 'pembelajaran mesin', 'deep learning': 'pembelajaran mendalam', 'neural network': 'jaringan saraf tiruan',
  dataset: 'set data', database: 'basis data', online: 'daring', offline: 'luring', 'real time': 'waktu nyata', 'real-time': 'waktu nyata',
  error: 'galat', feedback: 'umpan balik', setting: 'pengaturan', setup: 'penyiapan', layout: 'tata letak', stakeholder: 'pemangku kepentingan',
  update: 'pembaruan', upload: 'unggah', download: 'unduh', website: 'situs web', user: 'pengguna', interface: 'antarmuka',
  framework: 'kerangka kerja', training: 'pelatihan', testing: 'pengujian', accuracy: 'akurasi', feature: 'fitur', preprocessing: 'prapemrosesan',
  performance: 'kinerja', overall: 'keseluruhan', downtime: 'waktu henti', breakdown: 'kerusakan', reliability: 'keandalan',
  availability: 'ketersediaan', troubleshooting: 'penelusuran gangguan', overhaul: 'turun mesin', 'spare part': 'suku cadang',
  sparepart: 'suku cadang', bearing: 'bantalan', shaft: 'poros', gearbox: 'kotak roda gigi', coupling: 'kopling', misalignment: 'ketidaklurusan',
  unbalance: 'ketakseimbangan', looseness: 'kelonggaran', failure: 'kegagalan', fault: 'kerusakan', 'root cause': 'akar penyebab',
  flowchart: 'diagram alir', meshing: 'penjaringan', 'boundary condition': 'kondisi batas', 'safety factor': 'faktor keamanan',
  stress: 'tegangan', strain: 'regangan', fatigue: 'kelelahan', 'heat treatment': 'perlakuan panas', welding: 'pengelasan',
  machining: 'pemesinan', cutting: 'pemotongan', assembly: 'perakitan', drawing: 'gambar teknik', workshop: 'bengkel', smartphone: 'ponsel pintar',
  controller: 'pengendali', microcontroller: 'mikrokontroler', overshoot: 'lewatan', 'steady state': 'keadaan tunak', 'settling time': 'waktu tunak',
  'rise time': 'waktu naik', tuning: 'penalaan', 'quality control': 'kendali mutu', plant: 'pabrik/objek kendali', prototype: 'prototipe',
  simulation: 'simulasi', 'condition monitoring': 'pemantauan kondisi', vibration: 'getaran', spectrum: 'spektrum', 'time domain': 'ranah waktu',
  'frequency domain': 'ranah frekuensi', threshold: 'ambang', sampling: 'pencuplikan', 'sampling rate': 'laju pencuplikan', noise: 'derau',
};

const BENTUK_TERIKAT = 'non|pasca|multi|sub|antar|semi|ultra|mikro|makro|swa|pra|purna|infra|intra|kontra|pseudo|mono|poli|bio';
const KATA_TUGAS = new Set('dan atau yang di ke dari pada untuk dengan serta maupun ini itu adalah sebagai dalam'.split(' '));
const SINGKATAN_TITIK = /(?:^|[\s(])(dll|dsb|dst|dkk|et al|mis|yth|no|hlm|hal|vol|pp|dr|ir|prof|drs|st|mt|msc|sdr|jl|kec|kab|e\.g|i\.e|vs|fig|eq|tbl|s\.d|a\.n|u\.p|cf|ca|approx|min|maks|max|ref|tab|gbr|sbb|tsb|bab|ps|pt|cv|ud|tbk|inc|ltd|co)\.$/i;
const SATUAN = 'kg|g|mg|ton|mm|cm|m|km|µm|um|nm|s|ms|µs|min|jam|Hz|kHz|MHz|GHz|rpm|N|kN|MN|Pa|kPa|MPa|GPa|bar|psi|W|kW|MW|Wh|kWh|V|kV|mV|A|mA|kA|J|kJ|MJ|°C|K|L|mL|dB|VA|kVA|MVA|Nm|kgf|lb';
const RX_SATUAN = new RegExp('(?<![\\p{L}\\p{N}.,])(\\d+(?:[.,]\\d+)?)(' + SATUAN + ')(?![\\p{L}\\p{N}])', 'gu');

/* ================================================================ Kamus ejaan (Hunspell) */

// Pengecek ejaan bergaya Hunspell, cukup untuk kamus hunspell-id (id_ID) dan
// SCOWL (en_US) di Tugas-Akhir/kamus/: FLAG long/num/karakter, PFX/SFX bersyarat,
// cross product, kelas lanjutan (awalan yang diizinkan akhiran, akhiran lapis
// kedua seperti -nya/-lah), CIRCUMFIX, NEEDAFFIX, FORBIDDENWORD, ONLYINCOMPOUND,
// ICONV, serta REP dan TRY untuk saran. COMPOUNDRULE tidak didukung; kata
// berangka dilewati sebelum sampai ke sini.
function buatKamus(affTeks, dicTeks) {
  const o = { flag: 'char', coba: '', rep: [], iconv: [], sirkum: null, perlu: null, terlarang: null, majemuk: null };
  const baris = affTeks.split(/\r?\n/).map((x) => x.trim().split(/\s+/));
  const silang = new Map();
  for (const t of baris) {
    switch (t[0]) {
      case 'FLAG': o.flag = t[1] === 'long' ? 'long' : t[1] === 'num' ? 'num' : 'char'; break;
      case 'TRY': o.coba = t[1] || ''; break;
      case 'CIRCUMFIX': o.sirkum = t[1]; break;
      case 'NEEDAFFIX': case 'PSEUDOROOT': o.perlu = t[1]; break;
      case 'FORBIDDENWORD': o.terlarang = t[1]; break;
      case 'ONLYINCOMPOUND': o.majemuk = t[1]; break;
      case 'REP': if (t.length >= 3) o.rep.push([t[1].replace(/_/g, ' '), t[2].replace(/_/g, ' ')]); break;
      case 'ICONV': if (t.length >= 3) o.iconv.push([t[1], t[2]]); break;
      case 'PFX': case 'SFX': if (t.length >= 4 && /^[YN]$/.test(t[2]) && /^\d+$/.test(t[3])) silang.set(t[0] + t[1], t[2] === 'Y'); break;
      default: break;
    }
  }
  const pecahFlag = (s) => {
    if (!s) return [];
    if (o.flag === 'long') { const out = []; for (let i = 0; i + 1 < s.length; i += 2) out.push(s.slice(i, i + 2)); return out; }
    if (o.flag === 'num') return s.split(',').filter(Boolean);
    return Array.from(s);
  };
  const punya = (f, flag) => {
    if (!f || !flag) return false;
    if (o.flag === 'long') { for (let i = 0; i + 1 < f.length; i += 2) if (f[i] === flag[0] && f[i + 1] === flag[1]) return true; return false; }
    if (o.flag === 'num') return f.split(',').includes(flag);
    return f.includes(flag);
  };
  const pfx = new Map(), sfx = new Map(), sfxLanjut = new Map();
  let maksP = 0, maksS = 0;
  for (const t of baris) {
    if ((t[0] !== 'PFX' && t[0] !== 'SFX') || t.length < 4 || (/^[YN]$/.test(t[2]) && /^\d+$/.test(t[3]))) continue;
    const pr = t[0] === 'PFX';
    const ix = t[3].search(/(?<!\\)\//);
    const tambahan = ix < 0 ? t[3] : t[3].slice(0, ix);
    const lanjut = new Set(pecahFlag(ix < 0 ? '' : t[3].slice(ix + 1)));
    const syaratTeks = t[4] && !t[4].startsWith('#') ? t[4] : '.';
    let syarat = null;
    if (syaratTeks !== '.') { try { syarat = new RegExp(pr ? '^(?:' + syaratTeks + ')' : '(?:' + syaratTeks + ')$', 'u'); } catch (_) { syarat = null; } }
    const r = {
      flag: t[1], silang: silang.get(t[0] + t[1]) !== false, strip: t[2] === '0' ? '' : t[2], add: tambahan === '0' ? '' : tambahan,
      lanjut, syarat, sirkum: !!o.sirkum && lanjut.has(o.sirkum), perlu: !!o.perlu && lanjut.has(o.perlu),
    };
    const peta = pr ? pfx : sfx;
    if (!peta.has(r.add)) peta.set(r.add, []);
    peta.get(r.add).push(r);
    if (pr) maksP = Math.max(maksP, r.add.length);
    else {
      maksS = Math.max(maksS, r.add.length);
      for (const f of lanjut) { if (!sfxLanjut.has(f)) sfxLanjut.set(f, new Map()); const m = sfxLanjut.get(f); if (!m.has(r.add)) m.set(r.add, []); m.get(r.add).push(r); }
    }
  }
  const kata = new Map();
  const d = dicTeks.split(/\r?\n/);
  for (let k = 1; k < d.length; k++) {
    let s = d[k];
    if (!s) continue;
    const sp = s.search(/[\t ]/);
    if (sp >= 0) s = s.slice(0, sp); // buang data morfologi
    const ix = s.search(/(?<!\\)\//);
    const w = (ix < 0 ? s : s.slice(0, ix)).replace(/\\\//g, '/');
    if (!w) continue;
    const f = ix < 0 ? '' : s.slice(ix + 1);
    kata.set(w, kata.has(w) ? kata.get(w) + (o.flag === 'num' && f ? ',' : '') + f : f);
  }
  const akarSah = (f) => f != null && !punya(f, o.terlarang) && !punya(f, o.majemuk);
  // Sah atau tidaknya gabungan awalan p (boleh null), akhiran dalam s2 dan akhiran luar s1.
  const sah = (f, p, s2, s1) => {
    if (p && !(punya(f, p.flag) || (s1 && s1.lanjut.has(p.flag)) || (s2 && s2.lanjut.has(p.flag)))) return false;
    const sirkP = !!(p && p.sirkum), sirkS = !!((s1 && s1.sirkum) || (s2 && s2.sirkum));
    if (sirkP !== sirkS) return false;
    const n = (p ? 1 : 0) + (s1 ? 1 : 0) + (s2 ? 1 : 0);
    return !(n < 2 && ((p && p.perlu) || (s1 && s1.perlu) || (s2 && s2.perlu)));
  };
  const cekAkhiran = (w, p) => {
    for (let L = 0; L <= Math.min(maksS, w.length - 1); L++) {
      const aturan = sfx.get(L ? w.slice(w.length - L) : '');
      if (!aturan) continue;
      for (const s1 of aturan) {
        if (p && !(s1.silang && p.silang)) continue;
        const batang = w.slice(0, w.length - L) + s1.strip;
        if (!batang || (s1.syarat && !s1.syarat.test(batang))) continue;
        const f = kata.get(batang);
        if (akarSah(f) && (punya(f, s1.flag) || (p && p.lanjut.has(s1.flag))) && sah(f, p, null, s1)) return true;
        const dalam = sfxLanjut.get(s1.flag);
        if (!dalam) continue;
        for (let L2 = 0; L2 <= Math.min(maksS, batang.length - 1); L2++) {
          const at2 = dalam.get(L2 ? batang.slice(batang.length - L2) : '');
          if (!at2) continue;
          for (const s2 of at2) {
            if (p && !s2.silang) continue;
            const akar = batang.slice(0, batang.length - L2) + s2.strip;
            if (!akar || (s2.syarat && !s2.syarat.test(akar))) continue;
            const f2 = kata.get(akar);
            if (akarSah(f2) && (punya(f2, s2.flag) || (p && p.lanjut.has(s2.flag))) && sah(f2, p, s2, s1)) return true;
          }
        }
      }
    }
    return false;
  };
  const cacheAfiks = new Map();
  const cekAfiks = (w) => {
    if (cacheAfiks.has(w)) return cacheAfiks.get(w);
    let ok = false;
    const f = kata.get(w);
    if (akarSah(f) && !punya(f, o.perlu)) ok = true;
    if (!ok) ok = cekAkhiran(w, null);
    for (let L = 1; !ok && L <= Math.min(maksP, w.length - 1); L++) {
      const aturan = pfx.get(w.slice(0, L));
      if (!aturan) continue;
      for (const p of aturan) {
        const batang = p.strip + w.slice(L);
        if (p.syarat && !p.syarat.test(batang)) continue;
        const fb = kata.get(batang);
        if (!p.sirkum && !p.perlu && akarSah(fb) && punya(fb, p.flag)) { ok = true; break; }
        if (cekAkhiran(batang, p)) { ok = true; break; }
      }
    }
    cacheAfiks.set(w, ok);
    return ok;
  };
  const cek = (w0) => {
    let w = w0;
    for (const [a, b] of o.iconv) w = w.split(a).join(b);
    if (cekAfiks(w)) return true;
    const kecil = w.toLowerCase();
    if (kecil !== w) {
      if (w === w.toUpperCase()) { if (cekAfiks(kecil) || cekAfiks(kecil[0].toUpperCase() + kecil.slice(1))) return true; }
      else if (w.slice(1) === kecil.slice(1) && cekAfiks(kecil)) return true;
    }
    if (/'s$/.test(w)) return cek(w.slice(0, -2));
    return false;
  };
  const huruf = [...new Set(Array.from((o.coba || 'abcdefghijklmnopqrstuvwxyz').toLowerCase()).filter((c) => /\p{Ll}/u.test(c)))];
  // Saran: ganti pola REP, tukar dua huruf, hapus, ganti, dan sisip satu huruf, lalu dua kata yang menyatu.
  const saran = (w, maks = 3) => {
    const kecil = w.toLowerCase();
    const calon = [];
    const coba = (c) => { if (calon.length < 8 && c && c !== kecil && !calon.includes(c) && cekAfiks(c)) calon.push(c); };
    for (const [a, b] of o.rep) for (let i = kecil.indexOf(a); i >= 0; i = kecil.indexOf(a, i + 1)) coba(kecil.slice(0, i) + b + kecil.slice(i + a.length));
    for (let i = 0; i < kecil.length - 1; i++) coba(kecil.slice(0, i) + kecil[i + 1] + kecil[i] + kecil.slice(i + 2));
    for (let i = 0; i < kecil.length; i++) coba(kecil.slice(0, i) + kecil.slice(i + 1));
    for (let i = 0; i < kecil.length; i++) for (const h of huruf) if (h !== kecil[i]) coba(kecil.slice(0, i) + h + kecil.slice(i + 1));
    for (let i = 0; i <= kecil.length; i++) for (const h of huruf) coba(kecil.slice(0, i) + h + kecil.slice(i));
    // Calon yang awal dan akhirnya paling banyak sama dengan kata asli didahulukan
    // (menggunkan → menggunakan, bukan mengagunkan).
    const mirip = (c) => {
      let a = 0, b = 0;
      while (a < c.length && c[a] === kecil[a]) a++;
      while (b < c.length - a && c[c.length - 1 - b] === kecil[kecil.length - 1 - b]) b++;
      return [a + b, Math.max(a, b)];
    };
    const out = calon.map((c, k) => [c, ...mirip(c), k]).sort((x, y) => y[1] - x[1] || y[2] - x[2] || x[3] - y[3]).map((x) => x[0]).slice(0, maks);
    for (let i = 3; !out.length && i < kecil.length - 2; i++) {
      if (cekAfiks(kecil.slice(0, i)) && cekAfiks(kecil.slice(i))) out.push(kecil.slice(0, i) + ' ' + kecil.slice(i));
    }
    return /^\p{Lu}/u.test(w) ? out.map((x) => x[0].toUpperCase() + x.slice(1)) : out;
  };
  const tambahKata = (daftar) => { for (const w of daftar) if (w && !kata.has(w)) kata.set(w, ''); cacheAfiks.clear(); };
  return { cek, saran, ada: (w) => kata.has(w) || kata.has(w.toLowerCase()), cekAfiks, tambahKata, jumlahKata: kata.size };
}

// Kamus dari data berkas kamus/kamus-*.js: { aff, dic, tambahan: [istilah] }.
function kamusDariData(d) {
  const k = buatKamus(d.aff, d.dic);
  k.tambahKata(d.tambahan || []);
  return k;
}

// Analisis imbuhan bahasa Indonesia yang longgar: hunspell-id belum memberi flag
// imbuhan pada banyak kata dasar, sehingga turunan sah (terintegrasi, cocokkan,
// jaraknya, memperburuk) ditolak. Kata diterima bila sesudah klitik, akhiran, dan
// awalan dilepas tersisa kata dasar yang ada di kamus. Salah ketik jarang
// menyisakan kata dasar yang sah, jadi tetap tertangkap.
const KLITIK = ['', 'nya', 'lah', 'kah', 'pun', 'ku', 'mu'];
const AKHIRAN = ['', 'kan', 'an', 'i'];
const AWALAN = ['', 'memper', 'diper', 'ketidak', 'keber', 'berke', 'ber', 'be', 'ter', 'te', 'per', 'pe', 'meng', 'meny', 'men', 'mem', 'me',
  'peng', 'peny', 'pen', 'pem', 'di', 'ke', 'se', 'ku', 'kau',
  // Bentuk terikat yang ditulis serangkai (EYD V): antarsumbu, nonlinear, subsistem.
  ...BENTUK_TERIKAT.split('|'), 'tak', 'tidak', 'nir', 'ekstra', 'tele', 'trans', 'dwi', 'tri', 'catur', 'eka', 'panca'];
function cekLonggarId(w, kamusId) {
  const kecil = w.toLowerCase();
  const dasar = (r) => r.length >= 3 && (kamusId.ada(r) || kamusId.cekAfiks(r));
  for (const k of KLITIK) {
    if (k && !kecil.endsWith(k)) continue;
    const t1 = kecil.slice(0, kecil.length - k.length);
    if (k && dasar(t1)) return true;
    for (const a of AKHIRAN) {
      if (a && !t1.endsWith(a)) continue;
      const t2 = t1.slice(0, t1.length - a.length);
      if ((k || a) && dasar(t2)) return true;
      for (const p of AWALAN) {
        if (!p || !t2.startsWith(p)) continue;
        const r = t2.slice(p.length);
        const calon = [r];
        // Peluluhan nasal: menyalin ← salin, menulis ← tulis, memukul ← pukul, mengirim ← kirim.
        if (/^(meny|peny)$/.test(p)) calon.push('s' + r);
        if (/^(men|pen)$/.test(p) && /^[aeiou]/.test(r)) calon.push('t' + r);
        if (/^(mem|pem)$/.test(p) && /^[aeiou]/.test(r)) calon.push('p' + r);
        if (/^(meng|peng)$/.test(p) && /^[aeiou]/.test(r)) calon.push('k' + r);
        if (calon.some(dasar)) return true;
      }
    }
  }
  return false;
}

// Kata yang tidak diperiksa ejaannya: singkatan dan satuan yang lazim di naskah teknik.
const KECUALI_EJAAN = new Set(('dll dsb dst dkk tsb sbb yth hlm mis kec kab prov tbk ttd rpm khz mhz ghz kpa mpa gpa kwh kva mva kgf psi etc ibid approx maks ' +
  'min max vol cos sin tan log exp lim det mod std rms fft dft pid nim nidn nuptk sks ess tanh sinh cosh arctan arcsin arccos atan sqrt').split(' '));

function periksaBahasa(model, temuan, kamus, kumpulTakDikenal) {
  const P = model.paragraf;
  const bagian = model.bagian.daftar;
  const kunciPeriksa = new Set(['pernyataan', 'pengesahan', 'kataPengantar', 'persetujuan', 'abstrak', 'abstract', 'bab', 'naskah', 'lampiran', 'daftarPustaka']);
  const hasil = [];
  const tambah = (jenis, p, s, e, saran, kunciKomentar) => hasil.push({ jenis, p, s, e, saran, kunciKomentar });
  const rxIstilah = new RegExp('(?<![\\p{L}\\p{N}-])(' + Object.keys(ISTILAH_ASING).sort((a, b) => b.length - a.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+')).join('|') + ')(?![\\p{L}\\p{N}-])', 'giu');
  const rxBaku = new RegExp('(?<![\\p{L}\\p{N}-])(' + Object.keys(TIDAK_BAKU).join('|') + ')(?![\\p{L}\\p{N}-])', 'giu');
  const rxTerikat = new RegExp('(?<![\\p{L}\\p{N}-])(' + BENTUK_TERIKAT + ')\\s+(\\p{Ll}[\\p{L}]+)', 'giu');
  // Ejaan dengan kamus: kata tak dikenal dikumpulkan dulu, lalu yang punya saran
  // dekat dan jarang muncul dianggap salah ketik (nama/istilah biasanya berulang).
  const tidakDikenal = new Map(); // kata huruf kecil → { bhs, muncul: [{ p, s, e, w }] }
  const rxKataEjaan = /\p{L}[\p{L}'’-]*/gu;
  function pindaiEjaan(i, p, t, bhsPar) {
    let m;
    rxKataEjaan.lastIndex = 0;
    while ((m = rxKataEjaan.exec(t))) {
      const w = m[0].replace(/[-'’]+$/, '');
      const s0 = m.index, e0 = s0 + w.length;
      if (w.length < 3) continue;
      const kiri = t[s0 - 1] || ' ', kanan = t[e0] || ' ';
      // Bagian kode, angka, URL, atau singkatan bertitik (S.T., e.g.).
      if (/[\p{N}_@/\\.]/u.test(kiri) || /[\p{N}_@/\\]/u.test(kanan) || (kanan === '.' && /\p{L}/u.test(t[e0 + 1] || ''))) continue;
      const awalToken = t.lastIndexOf(' ', s0) + 1, akhirToken = t.indexOf(' ', e0);
      if (/https?:|www\.|\.(com|org|net|id|ac)\b|@|doi/i.test(t.slice(awalToken, akhirToken < 0 ? t.length : akhirToken))) continue;
      // Variabel di dalam rumus atau potongan kode: x_baru, rmin = ω/ωn, kbaru = m*ω².
      if (/[=<>_*^√∑∫·×≈≤≥]/.test(t.slice(Math.max(0, s0 - 12), s0) + t.slice(e0, e0 + 12))) continue;
      if (KECUALI_EJAAN.has(w.toLowerCase()) || /^[ivxlcdm]+$/i.test(w)) continue;
      if (/[^\p{Script=Latin}'’-]/u.test(w)) continue; // huruf Yunani dsb. (τcl, ωn): notasi
      const huruf = w.replace(/[^\p{L}]/gu, '');
      if (huruf === huruf.toUpperCase()) continue; // akronim atau teks kapital semua
      if (/\p{Lu}/u.test(huruf.slice(1)) && !/-\p{Lu}/u.test(w)) continue; // MATLAB-an, iPhone, McDonald
      const kapital = /^\p{Lu}/u.test(w);
      if (kapital) {
        const sebelum = t.slice(0, s0).replace(/["“'‘(\[\s]+$/u, '');
        if (sebelum && !/[.!?]$/.test(sebelum)) continue; // nama diri di tengah kalimat atau sesudah titik dua
      }
      const seg = p.seg.filter((g) => g.e > s0 && g.s < e0);
      if (seg.some((g) => /consolas|courier|mono|menlo|code/i.test(g.font || ''))) continue; // kode program
      const miring = seg.length > 0 && seg.every((g) => g.i);
      const utama = miring ? 'en' : bhsPar;
      const ada = (x) => kamus[utama].cek(x) || ((miring || utama === 'en') && kamus.id.cek(x)) || cekLonggarId(x, kamus.id);
      let ok = ada(w);
      if (!ok && w.includes('-')) ok = w.split('-').every((bg) => bg.length < 3 || /^(nya|ku|mu)$/i.test(bg) || ada(bg) || kamus.en.cek(bg));
      if (ok) continue;
      const k = w.toLowerCase();
      // Nama variabel berupa satu huruf + kata (rlama, kbaru, cdiameter, xsteady).
      if (k.length >= 4 && /^\p{Ll}/u.test(w) && (kamus.id.ada(k.slice(1)) || kamus.en.cek(k.slice(1)) || cekLonggarId(k.slice(1), kamus.id))) continue;
      // Istilah Inggris berklitik Indonesia (polenya, loop-nya): yang miring cukup istilahnya.
      const tanpaKlitik = w.replace(/-?(nya|lah|kah|pun)$/i, '');
      const inggris = kamus.en.cek(w) || (tanpaKlitik !== w && tanpaKlitik.length >= 3 && kamus.en.cek(tanpaKlitik));
      if (utama === 'id' && inggris) {
        // Kata Inggris tegak di teks Indonesia: istilah asing yang belum miring. Satu komentar
        // penjelasan untuk semuanya (istilah dari daftar kurasi punya komentar sendiri).
        if (!kapital && !ISTILAH_ASING[k]) tambah('asing', i, s0, s0 + (kamus.en.cek(w) ? w.length : tanpaKlitik.length), `"${tanpaKlitik}" kata bahasa Inggris, dicetak miring`);
        continue;
      }
      if (!tidakDikenal.has(k)) tidakDikenal.set(k, { bhs: utama, muncul: [], kapital: true });
      const x = tidakDikenal.get(k);
      if (!kapital) x.kapital = false;
      x.muncul.push({ p: i, s: s0, e: e0, w });
    }
  }
  for (const b of bagian) {
    if (!kunciPeriksa.has(b.kunci)) continue;
    const pustaka = b.kunci === 'daftarPustaka';
    let sebelumnya = null; // paragraf berisi terakhir di bagian ini
    for (const i of b.isi) {
      const p = P[i];
      const lalu = sebelumnya;
      if (p.teks.trim()) sebelumnya = i;
      if (p.toc || !p.teks.trim() || POLA_TEMPLAT.some((rx) => rx.test(p.teks.replace(/\s+/g, ' ').trim()))) continue;
      const t = p.teks;
      const bhs = bahasa(t);
      const indonesia = bhs !== 'en' && b.kunci !== 'abstract' && !pustaka;
      const kata = hitungKata(t);
      let m;
      // Spasi ganda di antara kata (bukan di awal baris atau sebelum tab).
      const rxSpasi = / {2,}/g;
      while ((m = rxSpasi.exec(t))) {
        if (m.index === 0 || /[\t\n]/.test(t[m.index + m[0].length] || '\n') || kata < 4) continue;
        tambah('spasi', i, m.index, m.index + m[0].length, 'hapus spasi berlebih');
      }
      if (pustaka) continue;
      const rxUlang = /(?<![\p{L}\p{N}-])(\p{L}{2,})\s+(\1)(?![\p{L}\p{N}-])/giu;
      while ((m = rxUlang.exec(t))) {
        const s2 = m.index + m[0].length - m[2].length;
        tambah('ulang', i, s2, s2 + m[2].length, `"${m[1]}" ditulis dua kali`);
      }
      const rxBacaDobel = /([,;:!?])\1+|(?<![.…])\.\.(?![.…])/g;
      while ((m = rxBacaDobel.exec(t))) tambah('tandaBaca', i, m.index, m.index + m[0].length, 'tanda baca ganda');
      const rxSpasiTb = /(?<=\p{L}|\p{N}|\))( +)([,;.!?])(?=\s|$|\p{L})/gu;
      while ((m = rxSpasiTb.exec(t))) tambah('spasiTandaBaca', i, m.index, m.index + m[1].length + 1, `hapus spasi sebelum "${m[2]}"`);
      const rxTanpaSpasi = /(?<=\p{Ll}|\))([,;])(?=\p{L})/gu;
      while ((m = rxTanpaSpasi.exec(t))) {
        const kiri = t.slice(Math.max(0, m.index - 30), m.index);
        if (/(https?:|www\.|doi|@)\S*$/i.test(kiri)) continue;
        tambah('spasiTandaBaca', i, m.index, m.index + 1, `beri spasi sesudah "${m[1]}"`);
      }
      const rxTitikNempel = /(?<=\p{Ll}{2})\.(?=\p{Lu}\p{Ll})/gu;
      while ((m = rxTitikNempel.exec(t))) {
        const kiri = t.slice(Math.max(0, m.index - 30), m.index);
        if (/(https?:|www\.|doi|@)\S*$/i.test(kiri)) continue;
        tambah('spasiTandaBaca', i, m.index, m.index + 1, 'beri spasi sesudah titik');
      }
      const rxKurung = /\((\s+)|(\s+)\)/g;
      while ((m = rxKurung.exec(t))) {
        if (m[1]) tambah('spasiTandaBaca', i, m.index + 1, m.index + 1 + m[1].length, 'hapus spasi sesudah "("');
        else tambah('spasiTandaBaca', i, m.index, m.index + m[2].length, 'hapus spasi sebelum ")"');
      }
      // Kapital awal kalimat. Paragraf yang melanjutkan kalimat paragraf sebelumnya
      // (sebelumnya diakhiri titik dua, koma, kutipan, dsb.) tidak dihitung awal kalimat.
      const awalKalimat = lalu == null || /[.!?]["”’')\]]*$/.test(P[lalu].teks.trim());
      if (kata >= 5 && !p.bernomor && awalKalimat) {
        const awal = /^[\s"“'‘(]*(\p{Ll})/u.exec(t);
        if (awal && !/^[\s"“'‘(]*(\p{Ll}\p{Lu}|e-|i[A-Z])/u.test(t)) { const s0 = awal[0].length - 1; tambah('kapitalAwal', i, s0, s0 + kataDi(t, s0), 'huruf pertama kalimat kapital'); }
      }
      const rxKalimat = /([.!?])(["”')\]]?)(\s+)(\p{Ll})/gu;
      while ((m = rxKalimat.exec(t))) {
        const sebelum = t.slice(0, m.index + 1);
        // Singkatan: daftar umum, satu huruf (A.), bertitik ganda (S.T., M.Eng., Ph.D.),
        // atau kata pendek berhuruf kapital (Dr., Ir., Prof.) — lazim pada gelar.
        const token = (/(\S+)$/.exec(sebelum) || ['', ''])[1];
        if (m[1] === '.' && (SINGKATAN_TITIK.test(sebelum) || /(?:^|\s)\p{L}\.$/u.test(sebelum) || /\d\.$/.test(sebelum) ||
          /^[(\[]?(\p{L}{1,4}\.){2,}$/u.test(token) || /^[(\[]?\p{Lu}\p{L}{0,3}\.$/u.test(token))) continue;
        if (m[1] === '.' && /\.\.$/.test(sebelum)) continue;
        const s0 = m.index + m[1].length + m[2].length + m[3].length;
        tambah('kapitalAwal', i, s0, s0 + kataDi(t, s0), 'huruf pertama kalimat kapital');
      }
      if (kamus) pindaiEjaan(i, p, t, bhs === 'en' || b.kunci === 'abstract' ? 'en' : 'id');
      if (!indonesia) continue;
      // Kata tugas berhuruf kapital di tengah kalimat.
      const rxTugas = /(?<=\p{Ll}[,]?\s)(Dan|Atau|Yang|Di|Ke|Dari|Untuk|Dengan|Pada|Adalah|Serta|Dalam)(?=\s\p{Ll})/gu;
      while ((m = rxTugas.exec(t))) tambah('kapitalTengah', i, m.index, m.index + m[1].length, `"${m[1]}" ditulis "${m[1].toLowerCase()}"`);
      rxBaku.lastIndex = 0;
      while ((m = rxBaku.exec(t))) {
        const k = m[1].toLowerCase();
        tambah('tidakBaku', i, m.index, m.index + m[1].length, `${m[1]} → ${TIDAK_BAKU[k]}`, 'baku:' + k);
      }
      rxTerikat.lastIndex = 0;
      while ((m = rxTerikat.exec(t))) {
        if (KATA_TUGAS.has(m[2].toLowerCase())) continue;
        tambah('terikat', i, m.index, m.index + m[0].length, `${m[1]} ${m[2]} → ${m[1]}${m[2]}`, 'terikat:' + m[1].toLowerCase() + m[2].toLowerCase());
      }
      const rxDiPisah = /(?<![\p{L}\p{N}-])(di|Di)\s+(\p{Ll}+(?:kan|i|nya))(?![\p{L}\p{N}-])/gu;
      while ((m = rxDiPisah.exec(t))) {
        if (/^(sini|situ|sana|mana|antara|bawahnya|atasnya|dalamnya|luarnya|sampingnya|sekitarnya|tengahnya|depannya|belakangnya|akhirnya|awalnya|sisi|pagi|kiri|tepi|bagi|wilayahnya|lokasi|industri|negeri|pribadi)$/.test(m[2])) continue;
        tambah('awalanDi', i, m.index, m.index + m[0].length, `${m[1]} ${m[2]} → ${m[1]}${m[2]}`, 'di:' + m[2]);
      }
      RX_SATUAN.lastIndex = 0;
      while ((m = RX_SATUAN.exec(t))) tambah('satuan', i, m.index, m.index + m[0].length, `${m[1]}${m[2]} → ${m[1]} ${m[2]}`);
      rxIstilah.lastIndex = 0;
      while ((m = rxIstilah.exec(t))) {
        const s0 = m.index, e0 = s0 + m[0].length;
        const seg = p.seg.filter((g) => g.e > s0 && g.s < e0);
        if (!seg.length || seg.every((g) => g.i)) continue;
        if (/\p{Lu}/u.test(m[0][0]) && s0 > 0 && !/[.!?]\s*$/.test(t.slice(0, s0))) continue;
        const k = m[0].toLowerCase().replace(/\s+/g, ' ');
        tambah('asing', i, s0, e0, `"${m[0]}" dicetak miring${ISTILAH_ASING[k] ? ` (padanan: ${ISTILAH_ASING[k]})` : ''}`, 'asing:' + k);
      }
    }
  }
  const tanpaSaran = [];
  let dihitung = 0;
  if (kumpulTakDikenal) for (const [k, x] of tidakDikenal) kumpulTakDikenal.set(k, (kumpulTakDikenal.get(k) || 0) + x.muncul.length);
  for (const [k, x] of tidakDikenal) {
    const n = x.muncul.length;
    // Hanya kata huruf kecil yang jarang muncul yang dianggap salah ketik; kata berhuruf
    // kapital (nama, istilah di awal kalimat) dan yang berulang cukup didaftar.
    const saran = n <= 2 && !x.kapital && dihitung++ < 400
      ? [...new Set(kamus[x.bhs].saran(x.muncul[0].w).map((s) => TIDAK_BAKU[s.toLowerCase()] || s))] : [];
    if (saran.length) for (const o of x.muncul) tambah('typo', o.p, o.s, o.e, `${o.w} → ${saran.join(' / ')}`, 'typo:' + k);
    else tanpaSaran.push({ x, n });
  }
  // Satu temuan per rentang: rentang yang bertumpuk diambil yang pertama.
  hasil.sort((a, b) => a.p - b.p || a.s - b.s);
  const bersih = [];
  for (const h of hasil) {
    const lalu = bersih[bersih.length - 1];
    if (lalu && lalu.p === h.p && h.s < lalu.e) continue;
    bersih.push(h);
  }
  const JENIS = {
    spasi: ['Spasi ganda', 'Ada dua spasi atau lebih di antara kata. Hapus spasi berlebih (Ctrl+H: ganti dua spasi dengan satu spasi).'],
    ulang: ['Kata berulang', 'Kata yang sama ditulis dua kali berturut-turut. Hapus salah satunya; bentuk ulang ditulis dengan tanda hubung (mis. buku-buku).'],
    tandaBaca: ['Tanda baca ganda', 'Tanda baca ditulis dua kali.'],
    spasiTandaBaca: ['Spasi di sekitar tanda baca', 'Tanda koma, titik, titik koma, tanda tanya, dan tanda seru menempel pada kata sebelumnya dan diikuti satu spasi; tidak ada spasi sesudah "(" dan sebelum ")".'],
    kapitalAwal: ['Huruf pertama kalimat belum kapital', 'Huruf pertama awal kalimat ditulis dengan huruf kapital (EYD V).'],
    kapitalTengah: ['Kapital di tengah kalimat', 'Kata tugas (dan, atau, yang, di, ke, dari, untuk, dengan, pada) di tengah kalimat ditulis huruf kecil.'],
    tidakBaku: ['Kata tidak baku', 'Gunakan bentuk baku sesuai KBBI.'],
    terikat: ['Bentuk terikat ditulis terpisah', 'Bentuk terikat (non-, pasca-, multi-, sub-, antar-, semi-, mikro-, dan sejenisnya) ditulis serangkai dengan kata yang mengikutinya (EYD V), mis. nonlinear, subsistem, antarmuka.'],
    awalanDi: ['Awalan di- ditulis terpisah', 'Awalan di- pada kata kerja pasif ditulis serangkai (dilakukan, digunakan). Kata depan di yang menunjukkan tempat ditulis terpisah (di atas, di dalam).'],
    satuan: ['Angka menempel pada satuan', 'Angka dan simbol satuan dipisah satu spasi (mis. 10 kg, 50 Hz, 220 V), kecuali % dan °.'],
    asing: ['Istilah asing belum miring', 'Istilah asing dicetak miring (Pedoman 3.12 butir 7, EYD V). Bila ada padanan Indonesia yang lazim, pertimbangkan memakainya.'],
    typo: ['Kemungkinan salah ketik', 'Kata ini tidak ada di kamus ejaan (Hunspell id_ID/en_US) dan mirip dengan kata lain. Bila kata ini nama atau istilah yang memang benar, abaikan.'],
  };
  const perJenis = {};
  for (const h of bersih) (perJenis[h.jenis] = perJenis[h.jenis] || []).push(h);
  const lihatKunci = new Set();
  const jenisDiberiKomentar = new Set();
  for (const h of bersih) {
    const [judul, jelas] = JENIS[h.jenis];
    let komentar = null;
    if (h.kunciKomentar) {
      if (!lihatKunci.has(h.kunciKomentar)) {
        lihatKunci.add(h.kunciKomentar);
        const n = bersih.filter((x) => x.kunciKomentar === h.kunciKomentar).length;
        komentar = `${judul}: ${h.saran}. ${jelas}${n > 1 ? ` (${n} kali di naskah; sorotan berikutnya tanpa komentar.)` : ''}`;
      }
    } else if (!jenisDiberiKomentar.has(h.jenis)) {
      jenisDiberiKomentar.add(h.jenis);
      const n = perJenis[h.jenis].length;
      komentar = `${judul}: ${h.saran}. ${jelas}${n > 1 ? ` Ada ${n} temuan serupa di naskah; sorotan kuning berikutnya tidak diberi komentar.` : ''}`;
    }
    h.komentar = komentar;
  }
  const label = (i) => { const p = P[i]; const nm = model.nomor[p.hal]; return `hal. ${model.andal ? '' : '±'}${p.hal + 1}${nm && nm.tampil ? ` (tertulis ${formatNomor(nm.n, nm.fmt)})` : ''}`; };
  for (const [jenis, daftar] of Object.entries(perJenis)) {
    const [judul, jelas] = JENIS[jenis];
    temuan.push({
      grup: 'bahasa', status: jenis === 'asing' || jenis === 'satuan' ? 'perhatian' : 'gagal', judul: `${judul} (${daftar.length})`,
      ref: jenis === 'asing' ? 'Pedoman 3.12' : jenis === 'typo' ? 'Kamus ejaan' : 'EYD V',
      pesan: jelas, rincian: daftar.slice(0, 25).map((h) => ({ p: h.p, hal: label(h.p), teks: konteks(P[h.p].teks, h.s, h.e) + ' — ' + h.saran })),
      tanda: daftar.map((h) => ({ p: h.p, s: h.s, e: h.e, hl: true, komentar: h.komentar })),
    });
  }
  if (!bersih.length) temuan.push({ grup: 'bahasa', status: 'lulus', judul: 'Tidak ditemukan kesalahan penulisan', ref: 'EYD V', pesan: `Tidak ada ${kamus ? 'salah ketik, ' : ''}spasi ganda, kata berulang, kapital, tanda baca, kata tidak baku, atau istilah asing tegak yang terdeteksi.`, rincian: [], tanda: [] });
  if (tanpaSaran.length) {
    tanpaSaran.sort((a, b) => b.n - a.n);
    temuan.push({
      grup: 'bahasa', status: 'info', judul: `Kata tidak dikenal kamus (${tanpaSaran.length})`, ref: 'Kamus Hunspell',
      pesan: 'Kata berikut tidak ada di kamus ejaan dan tidak punya saran yang dekat, atau sering muncul — biasanya nama, istilah teknis, atau singkatan. Tidak disorot; periksa sekilas ejaannya.',
      rincian: tanpaSaran.slice(0, 40).map(({ x, n }) => { const o = x.muncul[0]; return { p: o.p, hal: label(o.p), teks: `${o.w}${n > 1 ? ` (${n}×)` : ''} — ${konteks(P[o.p].teks, o.s, o.e)}` }; }),
      tanda: [],
    });
  }
  if (!kamus) temuan.push({ grup: 'bahasa', status: 'manual', judul: 'Salah ketik (typo)', ref: 'EYD V', pesan: 'Kamus ejaan tidak termuat, jadi salah ketik tidak diperiksa. Muat ulang halaman, atau jalankan Review → Spelling & Grammar di Word dengan bahasa Indonesia.', rincian: [], tanda: [] });
  return bersih.length;
}
function kataDi(t, s) { const m = /^[\p{L}\p{N}'’-]+/u.exec(t.slice(s)); return m ? m[0].length : 1; }
function konteks(t, s, e) {
  const a = Math.max(0, s - 25), b = Math.min(t.length, e + 25);
  const rata = (x) => x.replace(/[\t\n]/g, ' ');
  return (a > 0 ? '…' : '') + rata(t.slice(a, s)) + '[' + rata(t.slice(s, e)).replace(/ /g, '·') + ']' + rata(t.slice(e, b)) + (b < t.length ? '…' : '');
}

/* ================================================================ Anotasi .docx */

const URUTAN_RPR = ['rStyle', 'rFonts', 'b', 'bCs', 'i', 'iCs', 'caps', 'smallCaps', 'strike', 'dstrike', 'outline', 'shadow', 'emboss', 'imprint', 'noProof', 'snapToGrid', 'vanish', 'webHidden', 'color', 'spacing', 'w', 'kern', 'position', 'sz', 'szCs', 'highlight', 'u', 'effect', 'bdr', 'shd', 'fitText', 'vertAlign', 'rtl', 'cs', 'em', 'lang', 'eastAsianLayout', 'specVanish', 'oMath'];

function buatAnotator(docXml) {
  const akar = docXml.c.find((c) => c.n);
  let pre = 'w';
  for (let i = 0; i < akar.o.length; i += 2) if (akar.o[i].startsWith('xmlns:') && NS[akar.o[i + 1]] === 'w') { pre = akar.o[i].slice(6); break; }
  const el = (lokal, attrs = {}, c = []) => {
    const o = [], a = {};
    for (const [k, v] of Object.entries(attrs)) { o.push(pre + ':' + k, String(v)); a['w:' + k] = String(v); }
    return { n: 'w:' + lokal, q: pre + ':' + lokal, a, o, c };
  };
  const tSimpul = (teks) => ({ n: 'w:t', q: pre + ':t', a: { 'xml:space': 'preserve' }, o: ['xml:space', 'preserve'], c: [{ t: teks }] });
  function rPrDenganSorot(rPr) {
    const r = rPr ? salinSimpul(rPr) : el('rPr');
    r.c = r.c.filter((c) => c.n !== 'w:highlight');
    const sorot = el('highlight', { val: 'yellow' });
    const posisi = URUTAN_RPR.indexOf('highlight');
    let k = 0;
    while (k < r.c.length) { const nm = (r.c[k].n || '').replace(/^w:/, ''); const ix = URUTAN_RPR.indexOf(nm); if (ix > posisi || (ix < 0 && nm === 'rPrChange')) break; k++; }
    r.c.splice(k, 0, sorot);
    return r;
  }
  // Pecah run sesuai batas-batas rentang; tiap potongan menjadi run sendiri yang
  // menyalin rPr aslinya, ditambah highlight bila berada dalam rentang sorotan.
  function terapkanParagraf(rec, rentangSorot, komentar) {
    const batas = new Set();
    for (const [s, e] of rentangSorot) { batas.add(s); batas.add(e); }
    for (const k of komentar) { batas.add(k.s); batas.add(k.e); }
    const disorot = (s, e) => rentangSorot.some(([a, b]) => s >= a && e <= b && b > a);
    const runBaru = []; // {node, s, e, ortu}
    const perRun = new Map();
    for (const g of rec.seg) { if (!perRun.has(g.run)) perRun.set(g.run, { ortu: g.ortu, seg: [] }); perRun.get(g.run).seg.push(g); }
    for (const [run, { ortu, seg }] of perRun) {
      const rPr = anak(run, 'w:rPr');
      const potong = [];
      for (const c of run.c) {
        if (c === rPr) continue;
        const g = seg.find((x) => x.tNode === c);
        if (!g) { potong.push({ node: c, s: null, e: null, hl: false }); continue; }
        const titik = [g.s, ...[...batas].filter((x) => x > g.s && x < g.e).sort((a, b) => a - b), g.e];
        for (let k = 0; k < titik.length - 1; k++) {
          const s = titik[k], e = titik[k + 1];
          if (e <= s) continue;
          potong.push({ node: tSimpul(rec.teks.slice(s, e)), s, e, hl: disorot(s, e) });
        }
      }
      const kelompok = [];
      for (const x of potong) {
        const lalu = kelompok[kelompok.length - 1];
        const putus = x.s != null && batas.has(x.s);
        if (lalu && lalu.hl === x.hl && !putus) { lalu.isi.push(x); if (x.e != null) { lalu.e = x.e; if (lalu.s == null) lalu.s = x.s; } }
        else kelompok.push({ hl: x.hl, isi: [x], s: x.s, e: x.e });
      }
      const pengganti = kelompok.map((kel) => {
        const r = { n: run.n, q: run.q, a: Object.assign({}, run.a), o: run.o.slice(), c: [] };
        if (kel.hl) r.c.push(rPrDenganSorot(rPr)); else if (rPr) r.c.push(salinSimpul(rPr));
        for (const x of kel.isi) r.c.push(x.node);
        const s = kel.isi.find((x) => x.s != null), e = [...kel.isi].reverse().find((x) => x.e != null);
        runBaru.push({ node: r, s: s ? s.s : null, e: e ? e.e : null, ortu });
        return r;
      });
      const ix = ortu.c.indexOf(run);
      if (ix >= 0) ortu.c.splice(ix, 1, ...pengganti);
    }
    for (const k of komentar) {
      const mulai = runBaru.find((r) => r.s === k.s) || runBaru.find((r) => r.s != null && r.s >= k.s && r.s < k.e);
      const akhirList = runBaru.filter((r) => r.e != null && r.e <= k.e && r.e > k.s);
      const akhir = akhirList[akhirList.length - 1];
      const rs = el('commentRangeStart', { id: k.id }), re = el('commentRangeEnd', { id: k.id });
      const ref = el('r', {}, [el('commentReference', { id: k.id })]);
      if (mulai && akhir) {
        mulai.ortu.c.splice(mulai.ortu.c.indexOf(mulai.node), 0, rs);
        const ia = akhir.ortu.c.indexOf(akhir.node);
        akhir.ortu.c.splice(ia + 1, 0, re, ref);
      } else {
        rec.node.c.push(rs, re, ref);
      }
    }
  }
  return { pre, el, terapkanParagraf };
}

async function tulisDocxBertanda(sumber, temuan, ringkasan, deflateRaw) {
  const { zip, docXml, model, utama, relNama, relXml, ctXml, komentarNama, komentarXml, purl } = sumber;
  const P = model.paragraf;
  const an = buatAnotator(docXml);
  let idKomentar = 0;
  const idLama = [...cariSemua(docXml, 'w:commentRangeStart'), ...cariSemua(docXml, 'w:commentReference')].map((x) => parseInt(atr(x, 'w:id'), 10)).filter(Number.isFinite);
  if (komentarXml) for (const c of cariSemua(komentarXml, 'w:comment')) { const n = parseInt(atr(c, 'w:id'), 10); if (Number.isFinite(n)) idLama.push(n); }
  idKomentar = idLama.length ? Math.max(...idLama) + 1 : 0;
  const daftarKomentar = [];
  const perParagraf = new Map();
  const ambil = (i) => { if (!perParagraf.has(i)) perParagraf.set(i, { sorot: [], komentar: [] }); return perParagraf.get(i); };
  const rentangPenuh = (p) => {
    const t = p.teks;
    const s = t.search(/\S/);
    if (s < 0) return [0, 0];
    return [s, t.replace(/\s+$/, '').length];
  };
  let jumlahSorot = 0;
  const tambahKomentar = (i, s, e, teks) => {
    const id = idKomentar++;
    daftarKomentar.push({ id, teks });
    ambil(i).komentar.push({ id, s, e });
  };
  if (ringkasan) {
    const pertama = P.find((p) => !p.kosong && p.seg.length);
    if (pertama) { const [s, e] = rentangPenuh(pertama); tambahKomentar(pertama.i, s, Math.min(e, s + kataDi(pertama.teks, s)), ringkasan); }
  }
  for (const t of temuan) {
    for (const tn of t.tanda || []) {
      const p = P[tn.p];
      if (!p) continue;
      let [s, e] = tn.s != null ? [tn.s, tn.e] : rentangPenuh(p);
      if (e <= s && tn.hl) continue;
      if (tn.hl && p.seg.length) { ambil(tn.p).sorot.push([s, e]); jumlahSorot++; }
      if (tn.komentar) {
        if (e <= s || !p.seg.length) { s = 0; e = 0; }
        else if (!tn.hl) e = Math.min(e, s + Math.max(kataDi(p.teks, s), 1));
        tambahKomentar(tn.p, s, e, tn.komentar);
      }
    }
  }
  for (const [i, x] of perParagraf) {
    const urut = x.sorot.sort((a, b) => a[0] - b[0]);
    const gabung = [];
    for (const r of urut) { const l = gabung[gabung.length - 1]; if (l && r[0] <= l[1]) l[1] = Math.max(l[1], r[1]); else gabung.push(r.slice()); }
    an.terapkanParagraf(P[i], gabung, x.komentar);
  }
  // Bagian komentar: pakai yang sudah ada bila ada, kalau tidak buat baru.
  const tgl = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  let akarKom, xmlKom = komentarXml;
  if (xmlKom) akarKom = cari(xmlKom, 'w:comments');
  if (!akarKom) {
    xmlKom = uraiXml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><${an.pre}:comments xmlns:${an.pre}="${purl ? 'http://purl.oclc.org/ooxml/wordprocessingml/main' : W_URI}"></${an.pre}:comments>`);
    akarKom = cari(xmlKom, 'w:comments');
  }
  for (const k of daftarKomentar) {
    const para = k.teks.split('\n').map((baris) => an.el('p', {}, [an.el('r', {}, [{ n: 'w:t', q: an.pre + ':t', a: {}, o: ['xml:space', 'preserve'], c: [{ t: baris }] }])]));
    akarKom.c.push(an.el('comment', { id: k.id, author: PENULIS_KOMENTAR, date: tgl, initials: 'PF' }, para));
  }
  const enc = new TextEncoder();
  const ganti = new Map(); // nama kecil → { nama, data }
  const setel = (nama, xml) => ganti.set(nama.toLowerCase(), { nama, data: enc.encode(serialXml(xml)) });
  setel(utama, docXml);
  setel(komentarNama, xmlKom);
  if (!sumber.adaKomentarPart) {
    const akarRel = cari(relXml, 'pr:Relationships');
    let n = 1;
    const id = () => { const ada = new Set(semuaAnak(akarRel, 'pr:Relationship').map((r) => atr(r, 'Id'))); while (ada.has('rIdPft' + n)) n++; return 'rIdPft' + n; };
    const qRel = (semuaAnak(akarRel, 'pr:Relationship')[0] || { q: 'Relationship' }).q;
    const relTipe = (purl ? 'http://purl.oclc.org/ooxml/officeDocument/relationships' : 'http://schemas.openxmlformats.org/officeDocument/2006/relationships') + '/comments';
    const target = komentarNama.slice(komentarNama.lastIndexOf('/') + 1);
    akarRel.c.push({ n: 'pr:Relationship', q: qRel, a: { Id: id(), Type: relTipe, Target: target }, o: ['Id', 'rIdPft' + n, 'Type', relTipe, 'Target', target], c: [] });
    setel(relNama, relXml);
    const akarCt = cari(ctXml, 'ct:Types');
    const nama = '/' + komentarNama;
    if (!semuaAnak(akarCt, 'ct:Override').some((o) => (atr(o, 'PartName') || '').toLowerCase() === nama.toLowerCase())) {
      const qO = (semuaAnak(akarCt, 'ct:Override')[0] || { q: 'Override' }).q;
      const tipe = 'application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml';
      akarCt.c.push({ n: 'ct:Override', q: qO, a: { PartName: nama, ContentType: tipe }, o: ['PartName', nama, 'ContentType', tipe], c: [] });
      setel('[Content_Types].xml', ctXml);
    }
  }
  const daftar = [];
  const sudah = new Set();
  for (const e of zip.entri) {
    const k = e.nama.toLowerCase();
    if (ganti.has(k)) { daftar.push(await entriBaru(e.nama, ganti.get(k).data, deflateRaw)); sudah.add(k); }
    else if (e.nama.endsWith('/') && e.ukuranAsli === 0) continue;
    else daftar.push({ nama: e.nama, data: zip.mentah(e), metode: e.metode, crc: e.crc, ukuranAsli: e.ukuranAsli });
  }
  for (const [k, x] of ganti) if (!sudah.has(k)) daftar.push(await entriBaru(x.nama, x.data, deflateRaw));
  return { bytes: tulisZip(daftar), jumlahSorot, jumlahKomentar: daftarKomentar.length };
}
async function entriBaru(nama, data, deflateRaw) {
  const crc = crc32(data);
  if (deflateRaw) {
    try { const z = await deflateRaw(data); return { nama, data: z, metode: 8, crc, ukuranAsli: data.length }; } catch (_) { /* simpan tanpa kompresi */ }
  }
  return { nama, data, metode: 0, crc, ukuranAsli: data.length };
}

/* ================================================================ Antarmuka utama */

function petaRelasi(relsXml, dir) {
  const peta = new Map();
  if (!relsXml) return peta;
  const akar = cari(relsXml, 'pr:Relationships');
  for (const r of semuaAnak(akar, 'pr:Relationship')) {
    const target = atr(r, 'Target') || '';
    const eksternal = atr(r, 'TargetMode') === 'External';
    peta.set(atr(r, 'Id'), { tipe: atr(r, 'Type') || '', target: eksternal ? target : gabungPath(dir, target), eksternal });
  }
  return peta;
}
function gabungPath(dir, target) {
  const bagian = (target.startsWith('/') ? target.slice(1) : (dir ? dir + '/' : '') + target).split('/');
  const out = [];
  for (const b of bagian) { if (b === '..') out.pop(); else if (b && b !== '.') out.push(b); }
  return out.join('/');
}

async function periksa(bytes, opsi = {}) {
  const inflateRaw = opsi.inflateRaw;
  if (typeof inflateRaw !== 'function') throw new Error('opsi.inflateRaw wajib diisi');
  const zip = bukaZip(bytes);
  const teks = async (n) => dekodeTeks(await bacaEntri(zip, n, inflateRaw));
  const relAkar = petaRelasi(uraiOpsional(await teks('_rels/.rels')), '');
  let utama = 'word/document.xml';
  for (const r of relAkar.values()) if (/\/officeDocument$/.test(r.tipe)) { utama = r.target; break; }
  const xmlUtama = await teks(utama);
  if (!xmlUtama) throw new GalatBerkas('bukan-docx', 'Bagian utama dokumen Word tidak ditemukan. Pastikan berkas berupa .docx dari Word, Google Docs, atau LibreOffice.');
  const dirUtama = utama.includes('/') ? utama.slice(0, utama.lastIndexOf('/')) : '';
  const relNama = (dirUtama ? dirUtama + '/' : '') + '_rels/' + utama.slice(utama.lastIndexOf('/') + 1) + '.rels';
  const relXml = uraiOpsional(await teks(relNama)) || uraiXml('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>');
  const rel = petaRelasi(relXml, dirUtama);
  const target = (akhiran) => { for (const r of rel.values()) if (!r.eksternal && r.tipe.endsWith(akhiran)) return r.target; return null; };
  const docXml = uraiXml(xmlUtama);
  const gaya = bacaGaya(uraiOpsional(await teks(target('/styles') || 'word/styles.xml')), uraiOpsional(await teks(target('/theme') || 'word/theme/theme1.xml')));
  const pengaturan = uraiOpsional(await teks(target('/settings') || 'word/settings.xml'));
  const genapGanjil = !!(pengaturan && togel(cari(pengaturan, 'w:evenAndOddHeaders')));
  const komentarTarget = target('/comments');
  const komentarNama = komentarTarget || ((dirUtama ? dirUtama + '/' : '') + 'comments.xml');
  const komentarXml = komentarTarget ? uraiOpsional(await teks(komentarTarget)) : null;
  const app = uraiOpsional(await teks('docProps/app.xml'));
  const hf = new Map();
  for (const [id, r] of rel) if (!r.eksternal && /\/(footer|header)$/.test(r.tipe)) hf.set(id, { info: analisisHF(uraiOpsional(await teks(r.target)), gaya) });

  const model = bangunModel(docXml, gaya);
  modelHalaman(model);
  model.nomor = simulasiNomor(model, hf, genapGanjil);
  model.bagian = kenaliBagian(model);
  const ada = (k) => model.bagian.daftar.some((b) => b.kunci === k);
  const skemaOtomatis = ada('naskah') || ada('loa') ? 'publikasi' : (ada('bab') ? 'skripsi' : 'publikasi');
  model.skema = opsi.skema === 'publikasi' || opsi.skema === 'skripsi' ? opsi.skema : skemaOtomatis;

  const tahunSekarang = opsi.tahunSekarang || new Date().getFullYear();
  const temuan = periksaModel(model, { tahunSekarang });
  periksaKebersihan(model, (grup, status, judul, ref, pesan, rincian = [], tanda = []) => {
    const label = (i) => { const p = model.paragraf[i]; if (!p) return ''; const nm = model.nomor[p.hal]; return `hal. ${model.andal ? '' : '±'}${p.hal + 1}${nm && nm.tampil ? ` (tertulis ${formatNomor(nm.n, nm.fmt)})` : ''}`; };
    temuan.push({ grup, status, judul, ref, pesan, rincian: rincian.map((r) => ({ p: r.p, hal: label(r.p), teks: r.teks || kutip(model.paragraf[r.p].teks) })), tanda });
  });
  const kamus = opsi.kamus && opsi.kamus.id && opsi.kamus.en ? opsi.kamus : null;
  const jumlahBahasa = periksaBahasa(model, temuan, kamus);
  temuan.push(...butirManual(model.skema));

  const ringkas = { lulus: 0, gagal: 0, perhatian: 0, info: 0, manual: 0 };
  for (const t of temuan) ringkas[t.status]++;
  const aplikasi = app ? teksSimpul(cari(app, 'ep:Application') || { c: [] }) : '';
  const halApp = app ? parseInt(teksSimpul(cari(app, 'ep:Pages') || { c: [] }), 10) : NaN;
  const meta = {
    versi: VERSI, skema: model.skema, skemaOtomatis, aplikasi: aplikasi || null, halamanWord: Number.isFinite(halApp) ? halApp : null,
    halamanTerhitung: model.totalHal, andal: model.andal, paragraf: model.paragraf.length, tahunAcuan: model.tahunAcuan,
    kata: model.paragraf.reduce((s, p) => s + hitungKata(p.teks), 0), jumlahBahasa,
  };
  const bagian = model.bagian.daftar.map((b) => ({ kunci: b.kunci, label: b.label, hal: model.paragraf[b.mulai].hal + 1 }));
  const purl = /purl\.oclc\.org/.test(xmlUtama.slice(0, 2000));
  const sumber = {
    zip, docXml, model, utama, relNama, relXml, komentarNama, komentarXml, adaKomentarPart: !!komentarTarget, purl,
    ctXml: uraiOpsional(await teks('[Content_Types].xml')),
  };
  let dipakai = false;
  return {
    meta, bagian, temuan, ringkas,
    // Berkas hasil hanya bisa dibuat sekali per pemeriksaan karena model XML-nya diubah di tempat.
    async buatDocxBertanda(deflateRaw) {
      if (dipakai) throw new Error('Periksa ulang berkas untuk membuat salinan bertanda baru.');
      dipakai = true;
      const t = ringkasTeks(meta, ringkas, temuan);
      return tulisDocxBertanda(sumber, temuan.filter((x) => x.status !== 'lulus'), t, deflateRaw);
    },
  };
}
const GRUP = {
  umum: 'Kertas, margin & huruf', struktur: 'Kelengkapan & urutan bagian', nomor: 'Penomoran halaman',
  sampul: 'Halaman Sampul', judul: 'Halaman Judul', pernyataan: 'Pernyataan Karya Sendiri', turnitin: 'Surat Hasil Uji Turnitin',
  loa: 'Letter of Acceptance', pengesahan: 'Halaman Pengesahan', kataPengantar: 'Kata Pengantar', persetujuan: 'Persetujuan Publikasi',
  abstrak: 'Abstrak', abstract: 'Abstract', daftarIsi: 'Daftar Isi', daftarTabel: 'Daftar Tabel', daftarGambar: 'Daftar Gambar',
  daftarLampiran: 'Daftar Lampiran', isi: 'Isi (bab)', naskah: 'Naskah Publikasi Ilmiah', pustaka: 'Daftar Pustaka', lampiran: 'Lampiran',
  bahasa: 'Kebahasaan', bersih: 'Kebersihan naskah', manual: 'Periksa sendiri',
};
function ringkasTeks(meta, ringkas, temuan) {
  const gagal = temuan.filter((t) => t.status === 'gagal').map((t) => `• ${GRUP[t.grup] || t.grup}: ${t.judul}`);
  return `Hasil Pemeriksa Format TA (${new Date().toLocaleDateString('id-ID')}): ${ringkas.gagal} perlu diperbaiki, ${ringkas.perhatian} perlu perhatian, ${ringkas.lulus} sudah sesuai. ` +
    `Skema: ${meta.skema === 'publikasi' ? 'Publikasi Ilmiah' : 'Skripsi/berbasis bab'}. Teks bersorot kuning perlu diperbaiki; komentar menjelaskan aturannya. ` +
    'Pemeriksaan otomatis ini membantu, bukan pengganti pemeriksaan pembimbing dan prodi.' + (gagal.length ? '\nPerlu diperbaiki:\n' + gagal.slice(0, 25).join('\n') : '');
}
function butirManual(skema) {
  const m = (judul, ref, pesan) => ({ grup: 'manual', status: 'manual', judul, ref, pesan, rincian: [], tanda: [] });
  const daftar = [
    m('Kertas dan cetakan', 'Pedoman 3.1–3.2', 'HVS putih 80 gram; tinta hitam pekat dan seragam; bab isi dicetak bolak-balik bila berupa hardcover.'),
    m('Sampul hardcover', 'Pedoman 3.5', 'Karton tebal berlapis linen sesuai warna fakultas, tinta kuning emas, logo UMB berwarna emas, tanpa siku besi; punggung memuat jenis TA dan judul, kapital TNR 12.'),
    m('Singkatan pada judul', 'Pedoman 3.5', 'Judul tidak memakai singkatan kecuali nama atau istilah (PT, UD, CV).'),
    m('Isi abstrak', 'Pedoman 2.1.8, 3.12', 'Memuat permasalahan/fenomena, tujuan, metode, hasil, dan kesimpulan; istilah asing (kecuali nama) dicetak miring.'),
    m('Gelar pada Kata Pengantar', 'Pedoman 2.1.6', 'Gelar ditulis sesuai gelar pendidikan tinggi, mis. Dr. Erna Setiany, S.E., M.Si.'),
    m('Jarak judul dan isi', 'Pedoman 3.7–3.13', 'Jarak antara judul bagian dan isinya 2 × 2 spasi.'),
    m('Format daftar pustaka dan kutipan', 'Pedoman 3.18', 'APA edisi ketujuh; jurnal diutamakan terindeks internasional, Sinta, Scopus, atau WoS.'),
  ];
  if (skema === 'skripsi') daftar.push(m('Notasi dan singkatan', 'Pedoman 3.16', 'Daftar notasi/singkatan ditulis dengan huruf aslinya dan disusun menurut abjad (huruf kecil, huruf besar, lalu simbol).'));
  return daftar;
}

// Pemeriksaan kebahasaan atas daftar paragraf polos (tanpa .docx), untuk uji dan kalibrasi.
function bahasaTeks(daftarTeks, kamus, kumpulTakDikenal) {
  const paragraf = daftarTeks.map((teks, i) => ({ i, teks, seg: [{ s: 0, e: teks.length, i: false }], toc: false, bernomor: false, hal: 0 }));
  const model = { paragraf, nomor: [], andal: true, bagian: { daftar: [{ kunci: 'bab', isi: paragraf.map((p) => p.i) }] } };
  const temuan = [];
  periksaBahasa(model, temuan, kamus || null, kumpulTakDikenal);
  return temuan;
}

global.PemeriksaTA = { periksa, buatKamus, kamusDariData, VERSI, GalatBerkas, LABEL, GRUP, _uji: { uraiXml, serialXml, bukaZip, tulisZip, crc32, bukanTitleCase, bahasa, bahasaTeks, TIDAK_BAKU, ISTILAH_ASING } };
})(typeof globalThis !== 'undefined' ? globalThis : this);
