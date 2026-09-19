// RPS Teknik Tenaga Listrik — diselaraskan dengan SIA (kelas 2A51362F).
// Struktur capaian dan bobot dibaca dari Asesmen-Teknik-Tenaga-Listrik.json;
// baris mingguan (RENCANA) wajib mengikuti cakupan modul yang sudah terbit.
//
// Pakai (dari root repo):
//   npm install --no-save docx
//   node scripts/rps-teknik-tenaga-listrik/buat-rps.js RPS-Teknik-Tenaga-Listrik.docx
//   "C:\Program Files\LibreOffice\program\soffice.exe" --headless --convert-to pdf RPS-Teknik-Tenaga-Listrik.docx
//   lalu salin PDF ke Unduhan-Gabungan/ dan periksa render tiap halaman (target 10 halaman).
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  AlignmentType, WidthType, ShadingType, VerticalAlign, BorderStyle, PageOrientation,
  LevelFormat, Footer, PageNumber, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom,
  TextWrappingType, HeightRule,
} = require("docx");

const REPO = path.resolve(__dirname, "..", "..");
const A = JSON.parse(fs.readFileSync(path.join(REPO, "Teknik-Tenaga-Listrik/Attributes/Asesmen-Teknik-Tenaga-Listrik.json"), "utf8"));
const OUT = process.argv[2] || "RPS-Teknik-Tenaga-Listrik.docx";

const FONT = "Times New Roman";
const BIRU = "DDEBF7", KUNING = "FFF2CC", MERAH = "C00000";

// ---------- helper ----------
const run = (t, o = {}) => new TextRun({ text: t, font: FONT, size: o.size || 18, bold: o.bold, italics: o.italics, color: o.color });
function para(isi, o = {}) {
  const children = (Array.isArray(isi) ? isi : [isi]).map((x) => (typeof x === "string" ? run(x, o) : x));
  return new Paragraph({ children, alignment: o.align, spacing: { before: o.before || 0, after: o.after || 0, line: o.line || 240 }, numbering: o.numbering, border: o.border, keepNext: o.keepNext });
}
const bullet = (t, o = {}) => para(t, { ...o, numbering: { reference: "bul", level: 0 } });
let nomorInstance = 0;
const daftarNomor = (items, o = {}) => { const inst = ++nomorInstance; return items.map((t) => para(t, { ...o, numbering: { reference: "num", level: 0, instance: inst } })); };

function cell(isi, w, o = {}) {
  let children;
  if (isi instanceof Paragraph) children = [isi];
  else if (Array.isArray(isi)) children = isi.length ? isi.map((x) => (typeof x === "string" ? para(x, o) : x)) : [para("")];
  else children = [para(String(isi ?? ""), o)];
  return new TableCell({
    width: { size: w, type: WidthType.DXA }, columnSpan: o.span, rowSpan: o.rowSpan,
    shading: o.fill ? { type: ShadingType.CLEAR, color: "auto", fill: o.fill } : undefined,
    verticalAlign: o.valign || VerticalAlign.CENTER,
    margins: { top: 18, bottom: 18, left: 70, right: 70 }, children,
  });
}
function table(widths, rows, o = {}) {
  const total = widths.reduce((a, b) => a + b, 0);
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths, rows: rows.map((r) => (r instanceof TableRow ? r : new TableRow({ children: r, cantSplit: o.cantSplit }))) });
}
// Lebar sel yang membentang beberapa kolom.
const lebar = (widths, i, n = 1) => widths.slice(i, i + n).reduce((a, b) => a + b, 0);
const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18 })] })] });
const img = (f, w, h, floating) => new ImageRun({ type: "png", data: fs.readFileSync(path.join(__dirname, f)), transformation: { width: w, height: h }, floating });

// ---------- data capaian (SIA) ----------
const SUB = A.sub_cpmk; // 14 Sub-CPMK, urutan = Modul 1..14
const kodeSingkat = (k) => "SC" + k.replace("Sub-CPMK ", "");
const cpmkNo = (k) => k.replace("CPMK ", "").replace("CPMK-", "");
const CPL_CPMK = { CPL2: ["1"], CPL5: ["2", "3", "4", "5"], CPL6: ["6", "7"] };
{ // pastikan peta CPL→CPMK konsisten dengan bobot SIA
  const bobotCpmk = Object.fromEntries(A.cpmk.map((c) => [cpmkNo(c.kode), c.bobot]));
  for (const c of A.cpl) {
    const s = CPL_CPMK[c.kode].reduce((a, k) => a + bobotCpmk[k], 0);
    if (s !== c.bobot) throw new Error(`Peta ${c.kode}: ${s} ≠ ${c.bobot}`);
  }
}

// ---------- rencana mingguan: Modul N = Sub-CPMK ke-N, minggu 8 UTS, minggu 16 UAS ----------
const BK = { 5: "BK5", 14: "BK14", 18: "BK18" };
const RENCANA = [
  { bk: 5, materi: "Konsep-Konsep Dasar Sistem/Teknik Tenaga Listrik (STL)",
    // Mengikuti Modul 1 yang terbit (14 September 2026): sembilan bagian materi dan tugas C1–C15.
    bt: ["Kontrak kuliah; pengertian, peran, bagian, dan tingkat tegangan sistem tenaga listrik", "Energi, daya satu dan tiga fasa, faktor daya, arus dan rugi saluran", "Pembangkit, generator sinkron, frekuensi; kurva beban, faktor beban dan kapasitas", "Tren perkembangan (EBT, smart grid)"],
    ind: ["Ketepatan menjelaskan pengertian, bagian-bagian, tingkat tegangan, dan peran sistem tenaga listrik", "Ketepatan menghitung energi, daya, arus dan rugi saluran, efisiensi berantai, frekuensi dan torsi generator, faktor beban dan faktor kapasitas"],
    pustaka: "[Pustaka Utama 4; Pendukung 1, 3, 4, 5]" },
  { bk: 5, materi: "Komponen-Komponen Sistem/Teknik Tenaga Listrik",
    // Mengikuti Modul 2 yang terbit (19 September 2026).
    bt: ["Generator sinkron dan transformator: rating, rasio, rugi, efisiensi, Z%", "Saluran (ACSR, isolator) dan gardu induk (rel, PMT, PMS, CT/PT, arester)", "Komponen distribusi, trafo paralel, dan papan nama"],
    ind: ["Ketepatan menjelaskan fungsi dan spesifikasi komponen dari papan namanya", "Ketepatan menghitung arus nominal, efisiensi trafo, arus hubung singkat/rating PMT, dan pembagian beban trafo paralel"],
    pustaka: "[Pustaka Utama 4; Pendukung 1, 2, 5, 6]" },
  { bk: 14, materi: "Daya pada Jaringan Listrik DC dengan Satu Sumber Tegangan",
    // Mengikuti Modul 3 yang terbit (19 September 2026).
    bt: ["Hukum Ohm, daya, dan energi; seri–paralel; hukum Kirchhoff", "Rugi dan efisiensi penyaluran; sumber nyata dan transfer daya maksimum", "Jatuh tegangan dan pemilihan penampang kabel DC"],
    ind: ["Ketepatan menerapkan hukum Ohm dan Kirchhoff pada jaringan DC satu sumber", "Ketepatan menghitung daya, rugi, efisiensi, transfer daya maksimum, dan penampang kabel"],
    pustaka: "[Pustaka Utama 1, 4; Pendukung 5, 7, 8]" },
  { bk: 14, materi: "Daya pada Jaringan Listrik DC dengan Dua atau Lebih Sumber Tegangan",
    // Mengikuti Modul 4 yang terbit (19 September 2026).
    bt: ["Dua ggl dalam satu loop; analisis mesh dan nodal", "Teorema superposisi, Thevenin, dan Norton", "Sumber paralel: pembagian beban dan arus sirkulasi"],
    ind: ["Ketepatan menyusun dan menyelesaikan persamaan mesh/nodal serta ekuivalen Thevenin–Norton", "Ketepatan menghitung arus dan daya tiap sumber, termasuk tanda arus dan arus sirkulasi"],
    pustaka: "[Pustaka Utama 1, 3; Pendukung 6, 7, 8]" },
  { bk: 14, materi: "Daya pada Jaringan Listrik AC",
    // Mengikuti Modul 5 yang terbit (19 September 2026).
    bt: ["Sinusoid, nilai rms, fasor, dan impedansi R-L-C", "Daya aktif, reaktif, semu, faktor daya, dan daya kompleks", "Perbaikan faktor daya; sistem tiga fasa seimbang Y dan Δ"],
    ind: ["Ketepatan menghitung impedansi, S, P, Q, faktor daya, dan kapasitor perbaikannya", "Ketepatan menghitung tegangan, arus, dan daya sistem tiga fasa"],
    pustaka: "[Pustaka Utama 1, 4; Pendukung 5, 7, 8]" },
  { bk: 14, materi: "Aliran Daya dan Transien pada Saluran Transmisi serta Kompensasi Reaktif",
    // Mengikuti Modul 6 yang terbit (19 September 2026).
    bt: ["Model saluran pendek, menengah (nominal-π, ABCD), dan panjang; aliran daya dan jatuh tegangan", "Regulasi tegangan dan efisiensi; kompensasi shunt (Ferranti, SIL) dan seri (kurva P–δ)", "Transien gelombang berjalan: impedansi surja, pantulan, dan transmisi"],
    ind: ["Ketepatan menghitung tegangan kirim, regulasi, dan efisiensi saluran", "Ketepatan menentukan kompensasi reaktif dan tegangan surja yang diteruskan"],
    pustaka: "[Pustaka Utama 4; Pendukung 1, 3, 4, 5]" },
  { bk: 14, materi: "Reaktansi dan Impedansi di Sistem Tenaga Listrik",
    // Mengikuti Modul 7 yang terbit (19 September 2026).
    bt: ["Reaktansi generator (subtransien, transien, sinkron) dan impedansi transformator", "Sistem per unit: basis, konversi basis, transformasi Y–Δ, dan reduksi jaringan", "MVA dan arus hubung singkat; kapasitas pemutus dan start motor"],
    ind: ["Ketepatan menghitung besaran per unit dan impedansi ekuivalen", "Ketepatan menghitung MVA dan arus hubung singkat"],
    pustaka: "[Pustaka Utama 4; Pendukung 2, 3, 4, 6]" },
  { bk: 14, materi: "Sistem Tenaga Listrik Saluran Transmisi",
    // Mengikuti Modul 8 yang terbit (19 September 2026).
    bt: ["Klasifikasi saluran (SUTT, SUTET, SKTT); konduktor ACSR, resistansi, dan ampacity", "Menara, kawat tanah, dan isolator (distribusi tegangan rentengan); andongan dan jarak bebas", "Korona (Peek) dan pemilihan tingkat tegangan dari rugi transmisi"],
    ind: ["Ketepatan menjelaskan jenis dan konstruksi saluran transmisi serta menghitung andongan dan isolator", "Ketepatan menghitung rugi daya pada berbagai tingkat tegangan dan tegangan kritis korona"],
    pustaka: "[Pustaka Utama 2, 3; Pendukung 1, 4, 5]" },
  { bk: 14, materi: "Pemodelan Saluran Transmisi",
    bt: ["Parameter R, L, dan C saluran (GMR/GMD)", "Model nominal-π", "Konstanta ABCD", "Impedansi karakteristik saluran panjang"],
    ind: ["Ketepatan menghitung parameter R, L, dan C saluran", "Ketepatan menerapkan model nominal-π dan konstanta ABCD"] },
  { bk: 14, materi: "Kompensasi dalam Sistem Distribusi",
    bt: ["Kapasitor bank dan perbaikan faktor daya", "Pengurangan rugi daya dan jatuh tegangan", "Penempatan dan ukuran kompensator", "Regulator tegangan"],
    ind: ["Ketepatan menghitung kebutuhan kVAR untuk perbaikan faktor daya", "Ketepatan menghitung penurunan rugi dan jatuh tegangan"] },
  { bk: 14, materi: "Konsep dan Teori Dasar Sistem Distribusi Tenaga Listrik",
    bt: ["Konfigurasi radial, loop, spindle, dan mesh", "Jaringan tegangan menengah dan rendah", "Gardu distribusi", "Jatuh tegangan dan rugi pada penyulang"],
    ind: ["Ketepatan menjelaskan konfigurasi sistem distribusi", "Ketepatan menghitung jatuh tegangan dan rugi penyulang"] },
  { bk: 18, materi: "Aliran Daya, Peralatan, dan Pengembangan Sistem Distribusi",
    bt: ["Peralatan proteksi: fuse, recloser, relai arus lebih, PMT", "Arus gangguan dan koordinasi proteksi", "Peramalan beban dan pengembangan jaringan"],
    ind: ["Ketepatan menjelaskan fungsi dan koordinasi peralatan proteksi", "Ketepatan menghitung arus gangguan dan pertumbuhan beban"] },
  { bk: 14, materi: "Metode Single Line Diagram",
    bt: ["Simbol dan kaidah single line diagram", "Diagram impedansi dan reaktansi", "Penyusunan diagram per unit dari data peralatan"],
    ind: ["Ketepatan menyusun single line diagram", "Ketepatan mengubah data peralatan menjadi diagram impedansi per unit"] },
  { bk: 14, materi: "Metode Analisis Aliran Daya (Load Flow)",
    bt: ["Klasifikasi bus", "Matriks admitansi Ybus", "Persamaan aliran daya", "Metode Gauss–Seidel dan pengenalan Newton–Raphson"],
    ind: ["Ketepatan menyusun Ybus dan persamaan aliran daya", "Ketepatan menjalankan iterasi Gauss–Seidel"] },
];
if (RENCANA.length !== SUB.length) throw new Error("RENCANA harus 14 baris");
const UTS_SUB = SUB.filter((s) => s.bobot.uts > 0).map((s) => s.kode.replace("Sub-CPMK ", ""));
const UAS_SUB = SUB.filter((s) => s.bobot.uas > 0).map((s) => s.kode.replace("Sub-CPMK ", ""));
const MINGGU = []; // {minggu, jenis:'modul'|'uts'|'uas', i}
for (let i = 0; i < 14; i++) { MINGGU.push({ minggu: i < 7 ? i + 1 : i + 2, jenis: "modul", i }); if (i === 6) MINGGU.push({ minggu: 8, jenis: "uts" }); }
MINGGU.push({ minggu: 16, jenis: "uas" });

const PB = 1.6, PT = 2, PR = 0, KM = 2.5, UJIAN = 2;
const jamTotal = { pb: +(PB * 14).toFixed(1), pt: PT * 14, pr: 0, km: KM * 14 + UJIAN * 2 };

// ---------- halaman sampul ----------
const EMU = 914400;
const pojok = (f, x, y) => img(f, 62, 64, { horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: Math.round(x * EMU) }, verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: Math.round(y * EMU) }, wrap: { type: TextWrappingType.NONE }, behindDocument: true });
const garis = { top: { style: BorderStyle.SINGLE, size: 36, color: "1BA1E2", space: 4 } };
const garisBawah = { bottom: { style: BorderStyle.SINGLE, size: 36, color: "1BA1E2", space: 4 } };
const sampul = [
  new Paragraph({ children: [pojok("pojok-tl.png", 0.25, 0.2), pojok("pojok-tr.png", 7.6, 0.2), pojok("pojok-bl.png", 0.25, 10.1), pojok("pojok-br.png", 7.6, 10.1)] }),
  para("RENCANA PEMBELAJARAN SEMESTER", { size: 32, bold: true, align: AlignmentType.CENTER, before: 400, border: garis }),
  para("MATA KULIAH", { size: 24, bold: true, align: AlignmentType.CENTER }),
  para("TEKNIK TENAGA LISTRIK", { size: 22, bold: true, align: AlignmentType.CENTER, border: garisBawah, after: 400 }),
  para("SEMESTER 5", { size: 32, bold: true, align: AlignmentType.CENTER }),
  para("TAHUN KE – 3", { size: 32, bold: true, align: AlignmentType.CENTER, after: 500 }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [img("logo.png", 150, 141)] }),
  para("Dosen Pengembang RPS", { size: 20, bold: true, align: AlignmentType.CENTER, before: 500, after: 160 }),
  para("Rikko Putra Youlia, ST., M.Eng", { size: 20, align: AlignmentType.CENTER, after: 60 }),
  para("Nur Indah, S.ST, MT, Ph.D", { size: 20, align: AlignmentType.CENTER, after: 160 }),
  para("Diselaraskan dengan SIA oleh Dosen Pengampu:", { size: 20, bold: true, align: AlignmentType.CENTER, after: 60 }),
  para("Dedik Romahadi, ST, M.Sc", { size: 20, align: AlignmentType.CENTER }),
  ...["PROGRAM STUDI TEKNIK MESIN", "PROGRAM SARJANA", "FAKULTAS TEKNIK", "UNIVERSITAS MERCU BUANA", "JAKARTA", "JUNI 2025 (REVISI SEPTEMBER 2026)"]
    .map((t, k) => para(t, { size: 22, bold: true, align: AlignmentType.CENTER, before: k === 0 ? 1500 : 0 })),
];

// ---------- SATUAN ACARA PERKULIAHAN ----------
const W_SAP = [800, 1150, 2100, 3250, 2600, 2400, 500, 500, 500, 600]; // 14400
const vert = (t) => para(t, { bold: true, size: 16, align: AlignmentType.CENTER });
const sapKepala = table([2700, 300, 11400], [
  [cell("Kode Mata Kuliah", 2700, { bold: true }), cell(":", 300), cell("W132500023", 11400)],
  [cell("Mata Kuliah", 2700, { bold: true }), cell(":", 300), cell("TEKNIK TENAGA LISTRIK", 11400, { bold: true })],
]);
const sapCpl = table([1000, 2700, 10700], [
  [cell("CPL", 1000, { bold: true, fill: BIRU, align: AlignmentType.CENTER }), cell("CPMK yang dibentuk", 2700, { bold: true, fill: BIRU, align: AlignmentType.CENTER }), cell("Materi Pembelajaran Umum", 10700, { bold: true, fill: BIRU, align: AlignmentType.CENTER })],
  [cell("CPL 2", 1000), cell("CPMK 1", 2700), cell("Konsep dasar sistem tenaga listrik; komponen sistem tenaga listrik; daya pada jaringan DC satu sumber", 10700)],
  [cell("CPL 5", 1000), cell("CPMK 2, 3, 4, 5", 2700), cell("Jaringan DC banyak sumber; daya AC; aliran daya, transien, dan kompensasi saluran transmisi; reaktansi dan impedansi; sistem transmisi; sistem distribusi dan kompensasinya", 10700)],
  [cell("CPL 6", 1000), cell("CPMK 6, 7", 2700), cell("Peralatan proteksi dan pengembangan sistem distribusi; single line diagram; analisis aliran daya (load flow)", 10700)],
]);
const sapHead1 = [
  cell("Minggu Ke", W_SAP[0], { bold: true, fill: BIRU, align: AlignmentType.CENTER, rowSpan: 2 }),
  cell("BK Pembentuk", W_SAP[1], { bold: true, fill: BIRU, align: AlignmentType.CENTER, rowSpan: 2 }),
  cell("Materi Pembelajaran", W_SAP[2], { bold: true, fill: BIRU, align: AlignmentType.CENTER, rowSpan: 2 }),
  cell("Rincian dan Bentuk Kegiatan Pembelajaran", lebar(W_SAP, 3, 3), { bold: true, fill: BIRU, align: AlignmentType.CENTER, span: 3 }),
  cell("Estimasi Waktu (Jam)", lebar(W_SAP, 6, 4), { bold: true, fill: BIRU, align: AlignmentType.CENTER, span: 4 }),
];
const sapHead2 = [
  cell("Belajar Terbimbing", W_SAP[3], { bold: true, fill: BIRU, align: AlignmentType.CENTER }),
  cell("Penugasan Terstruktur", W_SAP[4], { bold: true, fill: BIRU, align: AlignmentType.CENTER }),
  cell("Penugasan Mandiri", W_SAP[5], { bold: true, fill: BIRU, align: AlignmentType.CENTER }),
  cell(vert("PB"), W_SAP[6], { fill: BIRU }), cell(vert("PT"), W_SAP[7], { fill: BIRU }), cell(vert("Prak"), W_SAP[8], { fill: BIRU }), cell(vert("KM/ Ujian"), W_SAP[9], { fill: BIRU }),
];
const sapBaris = MINGGU.map((m) => {
  const c = AlignmentType.CENTER;
  if (m.jenis !== "modul") {
    const label = m.jenis === "uts" ? `UJIAN TENGAH SEMESTER (Sub-CPMK ${UTS_SUB.join(", ")})` : `UJIAN AKHIR SEMESTER (Sub-CPMK ${UAS_SUB.join(", ")})`;
    return [cell(String(m.minggu), W_SAP[0], { align: c }), cell(label, lebar(W_SAP, 1, 8), { span: 8, bold: true, fill: KUNING, align: c }), cell(String(UJIAN), W_SAP[9], { align: c })];
  }
  const r = RENCANA[m.i], n = m.i + 1;
  return [
    cell(String(m.minggu), W_SAP[0], { align: c }),
    cell(BK[r.bk], W_SAP[1], { align: c }),
    cell(r.materi, W_SAP[2]),
    cell([para("Dosen menjelaskan:", { bold: true }), ...r.bt.map((t) => bullet(t))], W_SAP[3], { valign: VerticalAlign.TOP }),
    cell(`Mahasiswa mengerjakan Tugas Modul ${n} secara daring: 10 soal pilihan ganda, 10 soal komputasi, dan 5 soal komputasi lanjut (Python).`, W_SAP[4]),
    cell(`Mahasiswa mempelajari materi Modul ${n}, menuntaskan setiap bagian, dan menjawab tiga pertanyaan Forum diskusi.`, W_SAP[5]),
    cell(String(PB), W_SAP[6], { align: c }), cell(String(PT), W_SAP[7], { align: c }), cell("", W_SAP[8]), cell(String(KM), W_SAP[9], { align: c }),
  ];
});
const sapTotal = [
  cell("", lebar(W_SAP, 0, 5), { span: 5 }),
  cell("Jam per Bentuk Kegiatan Pembelajaran", W_SAP[5], { bold: true, fill: BIRU }),
  cell(String(jamTotal.pb), W_SAP[6], { bold: true, align: AlignmentType.CENTER, fill: KUNING }),
  cell(String(jamTotal.pt), W_SAP[7], { bold: true, align: AlignmentType.CENTER, fill: KUNING }),
  cell("0", W_SAP[8], { bold: true, align: AlignmentType.CENTER, fill: KUNING }),
  cell(String(jamTotal.km), W_SAP[9], { bold: true, align: AlignmentType.CENTER, fill: KUNING }),
];
const totalJam = +(jamTotal.pb + jamTotal.pt + jamTotal.pr + jamTotal.km).toFixed(1);
const sapTotal2 = [cell("", lebar(W_SAP, 0, 5), { span: 5 }), cell("Total Jam", W_SAP[5], { bold: true, fill: BIRU }), cell(String(totalJam), lebar(W_SAP, 6, 4), { span: 4, bold: true, align: AlignmentType.CENTER })];
const sapTotal3 = [cell("", lebar(W_SAP, 0, 5), { span: 5 }), cell("SKS", W_SAP[5], { bold: true, fill: BIRU }), cell("2", lebar(W_SAP, 6, 4), { span: 4, bold: true, align: AlignmentType.CENTER })];
const sap = [
  para("SATUAN ACARA PERKULIAHAN", { size: 28, bold: true, align: AlignmentType.CENTER, after: 120 }),
  sapKepala, para("", { after: 80 }), sapCpl, para("", { after: 80 }),
  table(W_SAP, [new TableRow({ children: sapHead1, tableHeader: true }), new TableRow({ children: sapHead2, tableHeader: true }), ...sapBaris.map((r) => new TableRow({ children: r, cantSplit: true })), sapTotal, sapTotal2, sapTotal3]),
  para("PB = Belajar Terbimbing; PT = Penugasan Terstruktur; Prak = Praktik; KM = Kegiatan Mandiri.", { size: 16, italics: true, before: 60 }),
];

// ---------- RPS: identitas ----------
const W_ID = [2000, 1600, 3300, 1650, 1650, 1600, 2600]; // 14400
const judulKiri = (t, catatan) => cell([para(t, { bold: true }), ...(catatan ? [para(catatan, { bold: true, color: MERAH, size: 16 })] : [])], 2000, { valign: VerticalAlign.TOP });
const identitas = table(W_ID, [
  [cell(new Paragraph({ alignment: AlignmentType.CENTER, children: [img("logo.png", 80, 75)] }), W_ID[0], { rowSpan: 1 }),
   cell([para("UNIVERSITAS MERCU BUANA", { size: 28, bold: true, align: AlignmentType.CENTER }), para("FAKULTAS TEKNIK", { size: 20, bold: true, align: AlignmentType.CENTER, before: 60 }), para("PROGRAM STUDI TEKNIK MESIN", { size: 18, bold: true, align: AlignmentType.CENTER }), para("PROGRAM SARJANA", { size: 18, bold: true, align: AlignmentType.CENTER })], lebar(W_ID, 1, 6), { span: 6 })],
  [cell("Nomor Dokumen", W_ID[0]), cell("01-1.4.21.00", lebar(W_ID, 1, 6), { span: 6 })],
  [cell("Tanggal Efektif", W_ID[0]), cell("2 Januari 2025", lebar(W_ID, 1, 6), { span: 6 })],
  [cell("RENCANA PEMBELAJARAN SEMESTER (RPS)", 14400, { span: 7, bold: true, size: 24, align: AlignmentType.CENTER })],
  ["Mata Kuliah", "Kode MK", "Rumpun Mata Kuliah", "Bobot (SKS)", null, "Semester", "Tanggal Penyusunan"].filter((x) => x !== null).map((t, k) => {
    const idx = [0, 1, 2, 3, 5, 6][k]; const span = k === 3 ? 2 : 1;
    return cell(t, lebar(W_ID, idx, span), { span, bold: true, fill: BIRU, align: AlignmentType.CENTER });
  }),
  [cell("TEKNIK TENAGA LISTRIK", W_ID[0], { rowSpan: 2, align: AlignmentType.CENTER, bold: true }), cell("W132500023", W_ID[1], { bold: true, align: AlignmentType.CENTER }), cell("MKWP", W_ID[2], { align: AlignmentType.CENTER }), cell("T: 2", W_ID[3], { align: AlignmentType.CENTER }), cell("P: 0", W_ID[4], { align: AlignmentType.CENTER }), cell("5", W_ID[5], { rowSpan: 2, align: AlignmentType.CENTER }), cell([para("Juni 2025", { align: AlignmentType.CENTER }), para("Revisi: 14 September 2026", { align: AlignmentType.CENTER })], W_ID[6], { rowSpan: 2 })],
  [cell([para("Muatan VMTS"), ...daftarNomor(["Terintegrasi dengan Penelitian/PkM", "Mengandung Unsur SDG's"])], lebar(W_ID, 1, 2), { span: 2 }), cell("Modalitas/Metode Pembelajaran", W_ID[3], { align: AlignmentType.CENTER }), cell("Non-PjBL (tatap muka + modul interaktif daring)", W_ID[4], { align: AlignmentType.CENTER })],
  [cell("Otorisasi / Pengesahan", W_ID[0], { bold: true, rowSpan: 2 }), cell("Dosen Pengembang RPS", lebar(W_ID, 1, 2), { span: 2, bold: true, fill: BIRU, align: AlignmentType.CENTER }), cell("Koordinator Mata Kuliah / Kelompok Bidang Ilmu", lebar(W_ID, 3, 3), { span: 3, bold: true, fill: BIRU, align: AlignmentType.CENTER }), cell("Ketua Program Studi", W_ID[6], { bold: true, fill: BIRU, align: AlignmentType.CENTER })],
  new TableRow({ height: { value: 1500, rule: HeightRule.ATLEAST }, children: [cell([para("Rikko Putra Youlia, ST., M.Eng", { align: AlignmentType.CENTER }), para("Nur Indah, S.ST, MT, Ph.D", { align: AlignmentType.CENTER })], lebar(W_ID, 1, 2), { span: 2 }), cell("Ir. Hadi Pranoto, ST, MT., Ph.D", lebar(W_ID, 3, 3), { span: 3, align: AlignmentType.CENTER }), cell("Dr. Eng. Imam Hidayat, ST., MT.", W_ID[6], { align: AlignmentType.CENTER })] }),
]);

// ---------- RPS: capaian ----------
const W2 = [2000, 1100, 11300];
const cplTabel = table(W2, [
  [judulKiri("Capaian Pembelajaran Lulusan (CPL)"), cell("CPL Prodi yang dibebankan pada MK", 12400, { span: 2, bold: true, fill: BIRU })],
  ...A.cpl.map((c) => [cell("", 2000), cell(c.kode.replace("CPL", "CPL "), 1100, { bold: true }), cell(`${c.deskripsi} (bobot ${c.bobot}%)`, 11300)]),
]);
const cpmkTabel = table(W2, [
  [judulKiri("Capaian Pembelajaran Mata Kuliah (CPMK)"), cell("Capaian Pembelajaran MK (CPMK)", 12400, { span: 2, bold: true, fill: BIRU })],
  ...A.cpmk.map((c) => [cell("", 2000), cell(c.kode.replace("-", " "), 1100, { bold: true }), cell(`${c.deskripsi.replace(/\.$/, "")}. (bobot ${c.bobot}%)`, 11300)]),
]);
const subTabel = table(W2, [
  [judulKiri("Sub-Capaian Pembelajaran Mata Kuliah (Sub-CPMK)"), cell("CPMK", 1100, { bold: true, fill: BIRU }), cell("Sub-Capaian Pembelajaran MK (Sub-CPMK)", 11300, { bold: true, fill: BIRU })],
  ...SUB.map((s) => [cell("", 2000), cell(s.cpmk_induk, 1100, { bold: true }), cell([para([run(`${s.kode} : `, { bold: true }), run(s.deskripsi.replace(/\.$/, "") + ".")])], 11300)]),
]);
const W_PETA = [2000, 1300, ...Array(7).fill(1300), 2000]; // 14400
const petaTabel = table(W_PETA, [
  [cell("", 2000), cell("CPL/CPMK", 1300, { bold: true, fill: BIRU, align: AlignmentType.CENTER }), ...A.cpmk.map((c) => cell(c.kode.replace("-", " "), 1300, { bold: true, fill: BIRU, align: AlignmentType.CENTER })), cell("Bobot CPL", 2000, { bold: true, fill: BIRU, align: AlignmentType.CENTER })],
  ...A.cpl.map((c) => [cell("", 2000), cell(c.kode.replace("CPL", "CPL "), 1300, { bold: true, align: AlignmentType.CENTER }), ...A.cpmk.map((m) => cell(CPL_CPMK[c.kode].includes(cpmkNo(m.kode)) ? `√ (${m.bobot}%)` : "", 1300, { align: AlignmentType.CENTER })), cell(`${c.bobot}%`, 2000, { align: AlignmentType.CENTER, bold: true })]),
].map((r, k) => (k === 0 ? [cell([para("Peta CPL dengan CPMK", { bold: true })], 2000, { rowSpan: 4, valign: VerticalAlign.TOP }), ...r.slice(1)] : r.slice(1))));

const W_KP = [2000, 900, 700, ...Array(14).fill(771)]; // 2000+900+700+10794 = 14394
W_KP[W_KP.length - 1] += 6;
const komp = [["Tugas", "tugas"], ["UTS", "uts"], ["UAS", "uas"]];
const kpTabel = table(W_KP, [
  [cell([para("Komponen Penilaian", { bold: true }), para("(bobot per Sub-CPMK sesuai SIA)", { size: 16, color: MERAH })], 2000, { rowSpan: 6, valign: VerticalAlign.TOP }), cell("Jenis Asesmen", 900, { bold: true, fill: BIRU, align: AlignmentType.CENTER, rowSpan: 2 }), cell("Bobot (%)", 700, { bold: true, fill: BIRU, align: AlignmentType.CENTER, rowSpan: 2 }), cell("Sub-CPMK", 10800, { span: 14, bold: true, fill: BIRU, align: AlignmentType.CENTER })],
  SUB.map((s, k) => cell(kodeSingkat(s.kode), W_KP[3 + k], { bold: true, fill: BIRU, align: AlignmentType.CENTER, size: 16 })),
  ...komp.map(([label, key]) => [cell(label, 900, { bold: true }), cell(String(A.asesmen.total_per_komponen[key]), 700, { align: AlignmentType.CENTER, bold: true }), ...SUB.map((s, k) => cell(s.bobot[key] ? String(s.bobot[key]) : "", W_KP[3 + k], { align: AlignmentType.CENTER }))]),
  [cell("Total", 900, { bold: true, fill: KUNING }), cell("100", 700, { bold: true, fill: KUNING, align: AlignmentType.CENTER }), ...SUB.map((s, k) => cell(String(s.total), W_KP[3 + k], { bold: true, fill: KUNING, align: AlignmentType.CENTER }))],
]);
{ // pemeriksaan bobot
  for (const [, key] of komp) { const s = SUB.reduce((a, x) => a + x.bobot[key], 0); if (s !== A.asesmen.total_per_komponen[key]) throw new Error(`Σ ${key} ${s}`); }
  if (SUB.reduce((a, x) => a + x.total, 0) !== 100) throw new Error("Σ total ≠ 100");
}

const deskripsi = "Mata kuliah Teknik Tenaga Listrik membekali mahasiswa dengan konsep dasar dan perhitungan sistem tenaga listrik: hukum dasar kelistrikan dan analisis jaringan DC satu maupun banyak sumber, daya pada jaringan AC dan sistem tiga fasa, aliran daya, transien, dan kompensasi reaktif saluran transmisi, reaktansi dan impedansi, pemodelan saluran transmisi, sistem distribusi beserta kompensasi dan peralatan proteksinya, serta metode perancangan melalui single line diagram dan analisis aliran daya (load flow). Pembelajaran memadukan tatap muka dengan modul interaktif daring yang memuat komputasi Python.";
const PUSTAKA_UTAMA = [
  "Irwin, J. D., & Kerns, D. V., Jr. (1995). Introduction to Electrical Engineering. Prentice Hall.",
  "Shultz, R. D., & Smith, R. A. (1988). Introduction to Electric Power Engineering. John Wiley & Sons.",
  "Zuhal. Dasar Tenaga Listrik dan Elektronika Daya. Gramedia.",
  "Glover, J. D., Overbye, T. J., & Sarma, M. S. (2017). Power System Analysis and Design (6th ed.). Cengage Learning.",
];
const PUSTAKA_PENDUKUNG = [
  "Arismunandar, A., & Kuwahara, S. (2004). Buku Pegangan Teknik Tenaga Listrik Jilid 2: Saluran Transmisi (Cet. 7). Pradnya Paramita.",
  "Arismunandar, A., & Kuwahara, S. (2004). Buku Pegangan Teknik Tenaga Listrik Jilid 3: Gardu Induk (Cet. 7). Pradnya Paramita.",
  "Saadat, H. (1999). Power System Analysis (International ed.). McGraw-Hill.",
  "Grainger, J. J., & Stevenson, W. D. (1994). Power System Analysis. McGraw-Hill.",
  "von Meier, A. (2006). Electric Power Systems: A Conceptual Introduction. Wiley-IEEE Press.",
  "Chapman, S. J. (2012). Electric Machinery Fundamentals (5th ed.). McGraw-Hill.",
  "Alexander, C. K., & Sadiku, M. N. O. (2021). Fundamentals of Electric Circuits (7th ed.). McGraw-Hill.",
  "Boylestad, R. L. (2016). Introductory Circuit Analysis (13th ed.). Pearson.",
];
const infoTabel = table([2000, 12400], [
  [judulKiri("Deskripsi Singkat Mata Kuliah"), cell(deskripsi, 12400, { align: AlignmentType.JUSTIFIED })],
  [judulKiri("Bahan Kajian"), cell("BK5 Pengantar Teknik dan Rekayasa; BK14 Dasar Analisis Teknik Mesin; BK18 Metode dan Teknik Pengukuran.", 12400)],
  [judulKiri("Materi Pembelajaran"), cell(daftarNomor(RENCANA.map((r) => r.materi)), 12400)],
  [judulKiri("Pustaka"), cell([para("Utama:", { bold: true }), ...daftarNomor(PUSTAKA_UTAMA), para("Pendukung:", { bold: true, before: 60 }), ...daftarNomor(PUSTAKA_PENDUKUNG)], 12400)],
  [judulKiri("Mata Kuliah Syarat"), cell("-", 12400)],
  [judulKiri("Catatan Revisi"), cell(`Revisi 14 September 2026 menyelaraskan RPS dengan SIA (kelas 2A51362F): ${A.cpmk.length} CPMK, ${SUB.length} Sub-CPMK, bobot Tugas ${A.asesmen.total_per_komponen.tugas}% / UTS ${A.asesmen.total_per_komponen.uts}% / UAS ${A.asesmen.total_per_komponen.uas}%, dan CPL 2/5/6 = ${A.cpl.map((c) => c.bobot).join("/")}%. Rencana mingguan mengikuti urutan Sub-CPMK: Modul 1–7 pada minggu 1–7, UTS minggu 8, Modul 8–14 pada minggu 9–15, UAS minggu 16. RPS versi Juni 2025 (6 CPMK, 13 Sub-CPMK, bobot 60/20/20) tidak berlaku lagi.`, 12400, { align: AlignmentType.JUSTIFIED })],
]);

// ---------- RPS: rencana mingguan ----------
const W_RM = [850, 2250, 2450, 1800, 1750, 1850, 2450, 1000]; // 14400
const rmHead = ["Minggu ke", "Sub-CPMK (Kemampuan Akhir yang Diharapkan)", "Indikator", "Kriteria & Bentuk Penilaian", "Tatap Muka / Luring", "Daring", "Materi Pembelajaran [Pustaka]", "Bobot Penilaian (%)"]
  .map((t, k) => cell(t, W_RM[k], { bold: true, fill: BIRU, align: AlignmentType.CENTER }));
const rmNo = ["(1)", "(2)", "(3)", "(4)", "(5)", "(6)", "(7)", "(8)"].map((t, k) => cell(t, W_RM[k], { fill: BIRU, align: AlignmentType.CENTER, size: 16 }));
const rmBaris = MINGGU.map((m) => {
  const c = AlignmentType.CENTER;
  if (m.jenis !== "modul") {
    const uts = m.jenis === "uts";
    const label = uts ? `UJIAN TENGAH SEMESTER — Sub-CPMK ${UTS_SUB.join(", ")}` : `UJIAN AKHIR SEMESTER — Sub-CPMK ${UAS_SUB.join(", ")}`;
    return [cell(String(m.minggu), W_RM[0], { align: c }), cell(label, lebar(W_RM, 1, 6), { span: 6, bold: true, fill: KUNING, align: c }), cell("tercakup di bobot Sub-CPMK", W_RM[7], { align: c, fill: KUNING, size: 14 })];
  }
  const s = SUB[m.i], r = RENCANA[m.i], n = m.i + 1;
  const bentuk = [para("Teknik test & non-test:", { bold: true }), bullet(`Tugas Modul ${n} (${s.bobot.tugas ? `bobot ${s.bobot.tugas}%` : "formatif, bobot 0%"})`), bullet("Forum diskusi")];
  if (s.bobot.uts) bentuk.push(bullet(`Diujikan di UTS (${s.bobot.uts}%)`));
  if (s.bobot.uas) bentuk.push(bullet(`Diujikan di UAS (${s.bobot.uas}%)`));
  return [
    cell(String(m.minggu), W_RM[0], { align: c }),
    cell([para(`${s.kode}:`, { bold: true }), para(s.deskripsi.replace(/\.$/, "") + "."), para(`(${s.cpmk_induk})`, { before: 40 })], W_RM[1], { valign: VerticalAlign.TOP }),
    cell(r.ind.map((t) => bullet(t)), W_RM[2], { valign: VerticalAlign.TOP }),
    cell(bentuk, W_RM[3], { valign: VerticalAlign.TOP }),
    cell([para("Kuliah, diskusi, latihan soal"), para("PB 2 × 50 mnt; PT 2 × 60 mnt; KM 2 × 60 mnt", { size: 16, before: 30 })], W_RM[4], { valign: VerticalAlign.TOP }),
    cell([para(`LMS fastlearning: modul interaktif ${n}, tugas, dan forum daring`)], W_RM[5], { valign: VerticalAlign.TOP }),
    cell([bullet(r.materi), para(r.pustaka || `[Pustaka Utama 1–4; Pendukung 1–8]`, { size: 16, before: 40 })], W_RM[6], { valign: VerticalAlign.TOP }),
    cell(String(s.total), W_RM[7], { align: c, bold: true }),
  ];
});
const rmTotal = [cell("Total bobot penilaian", lebar(W_RM, 0, 7), { span: 7, bold: true, align: AlignmentType.RIGHT, fill: KUNING }), cell("100", W_RM[7], { bold: true, align: AlignmentType.CENTER, fill: KUNING })];
const rencanaMingguan = table(W_RM, [new TableRow({ children: rmHead, tableHeader: true }), new TableRow({ children: rmNo, tableHeader: true }), ...rmBaris.map((r) => new TableRow({ children: r, cantSplit: true })), rmTotal]);

const CATATAN = [
  "Capaian Pembelajaran Lulusan PRODI (CPL-PRODI) adalah kemampuan yang dimiliki oleh setiap lulusan PRODI yang merupakan internalisasi dari sikap, penguasaan pengetahuan dan keterampilan sesuai dengan jenjang prodinya yang diperoleh melalui proses pembelajaran.",
  "CPL yang dibebankan pada mata kuliah adalah beberapa capaian pembelajaran lulusan program studi (CPL-PRODI) yang digunakan untuk pembentukan/pengembangan sebuah mata kuliah yang terdiri dari aspek sikap, keterampilan umum, keterampilan khusus dan pengetahuan.",
  "CP Mata kuliah (CPMK) adalah kemampuan yang dijabarkan secara spesifik dari CPL yang dibebankan pada mata kuliah, dan bersifat spesifik terhadap bahan kajian atau materi pembelajaran mata kuliah tersebut.",
  "Indikator penilaian kemampuan dalam proses maupun hasil belajar mahasiswa adalah pernyataan spesifik dan terukur yang mengidentifikasi kemampuan atau kinerja hasil belajar mahasiswa yang disertai bukti-bukti.",
  "Kriteria Penilaian adalah patokan yang digunakan sebagai ukuran atau tolok ukur ketercapaian pembelajaran dalam penilaian berdasarkan indikator-indikator yang telah ditetapkan. Kriteria penilaian merupakan pedoman bagi penilai agar penilaian konsisten dan tidak bias. Kriteria dapat berupa kuantitatif ataupun kualitatif.",
  "Teknik penilaian: tes dan non-tes.",
  "Bentuk pembelajaran: Kuliah, Responsi, Tutorial, Seminar atau yang setara, Praktikum, Praktik Studio, Praktik Bengkel, Praktik Lapangan, Penelitian, Pengabdian Kepada Masyarakat dan/atau bentuk pembelajaran lain yang setara.",
  "Metode Pembelajaran: Small Group Discussion, Role-Play & Simulation, Discovery Learning, Self-Directed Learning, Cooperative Learning, Collaborative Learning, Contextual Learning, Project Based Learning, dan metode lainnya yang setara.",
  "Materi Pembelajaran adalah rincian atau uraian dari bahan kajian yang dapat disajikan dalam bentuk beberapa pokok dan sub-pokok bahasan.",
  "Bobot penilaian adalah persentase penilaian terhadap setiap pencapaian Sub-CPMK yang besarnya proporsional dengan tingkat kesulitan pencapaian Sub-CPMK tersebut, dan totalnya 100%.",
  "PB = Kegiatan Belajar Terbimbing, PT = Kegiatan Penugasan Terstruktur, KM = Kegiatan Mandiri.",
];

const jarak = () => para("", { after: 100 });
const landscape = { page: { size: { width: 12240, height: 15840, orientation: PageOrientation.LANDSCAPE }, margin: { top: 600, bottom: 600, left: 720, right: 720 } } };
const doc = new Document({
  creator: "Dedik Romahadi", title: "RPS Teknik Tenaga Listrik (revisi September 2026)",
  styles: { default: { document: { run: { font: FONT, size: 18 } } } },
  numbering: { config: [
    { reference: "bul", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 220, hanging: 180 } } } }] },
    { reference: "num", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 320, hanging: 300 } } } }] },
  ] },
  sections: [
    { properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1000, bottom: 800, left: 1300, right: 1300 } } }, children: sampul },
    { properties: { ...landscape, page: { ...landscape.page, pageNumbers: { start: 1 } } }, footers: { default: footer }, children: sap },
    { properties: landscape, footers: { default: footer }, children: [identitas, jarak(), cplTabel, jarak(), cpmkTabel, jarak(), subTabel, jarak(), petaTabel, jarak(), kpTabel, jarak(), infoTabel] },
    { properties: landscape, footers: { default: footer }, children: [rencanaMingguan, para("Catatan:", { bold: true, before: 60, after: 20 }), ...daftarNomor(CATATAN, { align: AlignmentType.JUSTIFIED, size: 14 })] },
  ],
});
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(OUT, b); console.log("ditulis", OUT, b.length, "bita; total jam", totalJam, "; UTS", UTS_SUB.join(","), "; UAS", UAS_SUB.join(",")); });
