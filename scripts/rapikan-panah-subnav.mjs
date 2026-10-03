#!/usr/bin/env node
// Merapikan tombol panah bilah subnav (#subnavKiri / #subnavKanan) di halaman modul.
//
// enrich-sisken-modules.mjs dulu hanya mengganti <div id="modulSubnav"> lalu menambah sepasang
// tombol panah baru di kiri dan kanannya, tanpa membuang pasangan dari jalan sebelumnya.
// Setiap regenerasi Sisken menumpuk satu pasang lagi, sampai 69–76 pasang dengan id yang sama
// di Modul 2–14 (runtime modern-academic hanya menyembunyikannya dengan menghapus duplikat di
// peramban). Generatornya sudah diperbaiki; skrip ini membersihkan halaman yang sudah terbit
// menjadi tepat satu tombol kiri + bilah + satu tombol kanan.
//
// Idempoten. --periksa: tidak menulis, keluar 1 bila ada halaman yang akan berubah.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");
const courses = ["Engineering-Mathematics", "Getaran-Mekanik", "Optimalisasi-dan-Automasi", "Sistem-Kendali-Cerdas", "Teknik-Tenaga-Listrik", "Pemodelan-Computer-Aided-Design"];
const RX = /((?:<button class="subnav-geser kiri"[^>]*>[^<]*<\/button>\s*)+)(<div id="modulSubnav" class="subnav-bar show">[\s\S]*?<\/div>)((?:\s*<button class="subnav-geser kanan"[^>]*>[^<]*<\/button>)+)/;
const SATU_KIRI = /<button class="subnav-geser kiri"[^>]*>[^<]*<\/button>/;
const SATU_KANAN = /<button class="subnav-geser kanan"[^>]*>[^<]*<\/button>/;

let berubah = 0, diperiksa = 0;
for (const course of courses) {
  for (let n = 1; n <= 14; n++) {
    const rel = `${course}/Modul/Modul-${n}.html`;
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) continue;
    diperiksa++;
    const asli = fs.readFileSync(file, "utf8");
    const kiriTotal = (asli.match(/id="subnavKiri"/g) || []).length;
    const kananTotal = (asli.match(/id="subnavKanan"/g) || []).length;
    if (kiriTotal <= 1 && kananTotal <= 1) continue;
    const m = RX.exec(asli);
    if (!m) throw new Error(`${rel}: ${kiriTotal} tombol kiri / ${kananTotal} tombol kanan, tetapi tidak dalam satu deret di sekitar #modulSubnav — periksa dengan tangan`);
    const kiri = SATU_KIRI.exec(m[1])[0], kanan = SATU_KANAN.exec(m[3])[0];
    const baru = asli.slice(0, m.index) + kiri + m[2] + kanan + asli.slice(m.index + m[0].length);
    const sisaKiri = (baru.match(/id="subnavKiri"/g) || []).length, sisaKanan = (baru.match(/id="subnavKanan"/g) || []).length;
    if (sisaKiri !== 1 || sisaKanan !== 1) throw new Error(`${rel}: sesudah dirapikan masih ${sisaKiri}/${sisaKanan} tombol`);
    berubah++;
    if (!periksa) fs.writeFileSync(file, baru);
  }
}
console.log(`${berubah} dari ${diperiksa} halaman modul ${periksa ? "akan " : ""}dirapikan (tombol panah subnav ganda).`);
if (periksa && berubah) process.exit(1);
