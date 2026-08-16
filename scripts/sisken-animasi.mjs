// Spesifikasi animasi PER MODUL untuk Sisken Modul 2-14.
//
// Dahulu ketiga belas modul memakai tiga animasi yang sama (respons step,
// rasio redaman, Bode) apa pun topiknya, sampai-sampai animasi respons step tampil
// di modul Logika Fuzzy. Berkas ini memberi tiap modul animasinya sendiri;
// trio lama pindah ke satu-satunya rumah yang tepat, Modul 8 (Karakteristik
// Respons Sistem Umpan Balik).
//
// Kontrak dengan enrich-sisken-modules.mjs:
// - `panel` berisi TEPAT tiga entri (Animasi 1-3). Judul wajib berawalan
//   "Animasi k — " karena hero dan validator menghitung pola itu.
// - `grafik` satu entri statis berjudul "Gambar 1 — ...", tanpa slider.
// - `gambar` adalah BADAN fungsi runtime (ES5, tanpa backtick dan tanpa
//   `${`). Variabel yang tersedia: n (nomor modul), v (nilai slider, null
//   pada grafik), phase (fase animasi tombol ▶, bisa undefined), serta
//   helper _sisken* yang didefinisikan bangunRuntime().
// - Panel 1 satu-satunya yang mendapat tombol "▶ Jalankan Animasi";
//   badan gambarnya harus memanfaatkan phase.
// - `bantu` (opsional) berisi fungsi pembantu khusus modul itu, disuntik
//   sekali sebelum keempat fungsi gambar.
//
// Judul animasi harus UNIK antar modul (termasuk terhadap Modul 1 yang
// ditulis tangan), dan validate-sisken-modules.mjs menegakkannya.

export const ANIMASI_MODUL = {

  // ── Modul 2 — Proses Perancangan Sistem Kontrol ────────────────────────────
  2: {
    intro: "Perancangan adalah siklus: tetapkan spesifikasi, uji kandidat, revisi, lalu uji lagi. Tiga animasi berikut memperlihatkan siklus itu, mulai dari iterasi gain menuju spesifikasi, batas fisik aktuator yang membatasi hasil, dan peta ruang rancangan tempat semua spesifikasi terpenuhi.",
    panel: [
      {
        judul: "Animasi 1 — Iterasi Perancangan Menuju Spesifikasi",
        label: "Batas lonjakan maksimum (%)", min: 10, max: 40, step: 1, nilai: 20, des: 0,
        gambar: `var s=_siskenSiapkan('siskenAnim1Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,8,0,1.8);
var K=[0.6,0.9,1.4,2.1,3.1,4.6], data=[], pilih=-1;
_siskenGarisDatar(x,s,sk.y(1),'#fbbf24');
_siskenGarisDatar(x,s,sk.y(1+v/100),'#ec4899');
for(var i=0;i<K.length;i++){
  var z=Math.max(.18,1.05-.14*K[i]), wn=.7+.65*K[i];
  var mp=z<1?100*Math.exp(-Math.PI*z/Math.sqrt(1-z*z)):0;
  data.push([z,wn,mp]);
  if(mp<=v)pilih=i;
}
var sorot=Math.floor(((phase||0)*1.4)%K.length);
for(var j=0;j<K.length;j++){
  var d=data[j];
  var warna=(j===sorot)?'#67e8f9':(j===pilih?'#5eead4':'rgba(103,132,168,.4)');
  _siskenKurva(x,sk,function(t){return _siskenStep2(d[0],d[1],t)},0,8,warna,(j===sorot)?3.5:(j===pilih?3:1.5));
}
_siskenLegenda(x,[['iterasi disorot','#67e8f9'],['rancangan terpilih','#5eead4'],['batas lonjakan','#ec4899'],['setpoint','#fbbf24']],s.pad,s.atas-13);
var dd=data[sorot];
x.font='17px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText('iterasi ke-'+(sorot+1)+': K='+K[sorot].toFixed(1)+' → lonjakan '+dd[2].toFixed(0)+'% '+(dd[2]<=v?'✓ memenuhi':'✗ melanggar'),s.pad,s.h-13);
x.textAlign='right';x.fillText('waktu →',s.w-s.pad,s.h-13);x.textAlign='left';`,
      },
      {
        judul: "Animasi 2 — Saturasi Aktuator Membatasi Hasil Rancangan",
        label: "Batas sinyal kendali |u|maks", min: 0.5, max: 5, step: 0.1, nilai: 1.5, des: 1,
        gambar: `var s=_siskenSiapkan('siskenAnim2Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,6,-0.1,1.9);
var dt=0.01,y=0,ty=[],tu=[],jenuh=0;
for(var i=0;i<=600;i++){var t=i*dt,mentah=6*(1-y),u=Math.max(-v,Math.min(v,mentah));
  if(Math.abs(mentah)>v)jenuh++;
  ty.push([t,y]);tu.push([t,u/5]);y+=dt*(u-y);}
_siskenGarisDatar(x,s,sk.y(1),'#fbbf24');
_siskenJalur(x,sk,tu,'#a78bfa',2);
_siskenJalur(x,sk,ty,'#67e8f9',3);
_siskenLegenda(x,[['keluaran y(t)','#67e8f9'],['sinyal kendali u/5','#a78bfa'],['setpoint','#fbbf24']],s.pad,s.atas-13);
x.font='17px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText(jenuh>5?('aktuator jenuh '+(jenuh*dt).toFixed(1)+' s, sehingga kenaikan y dibatasi kemampuan fisik, bukan gain'):'aktuator tidak pernah jenuh, jadi respons ditentukan gain',s.pad,s.h-13);
x.textAlign='right';x.fillText('waktu →',s.w-s.pad,s.h-13);x.textAlign='left';`,
      },
      {
        judul: "Animasi 3 — Peta Ruang Rancangan pada Bidang (Kp, Kd)",
        label: "Gain proporsional Kp", min: 1, max: 16, step: 0.5, nilai: 6, des: 1,
        gambar: `var s=_siskenSiapkan('siskenAnim3Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,16,0,8);
function butuh(kp){return Math.max(0.912*Math.sqrt(kp),2)}
x.fillStyle='rgba(94,234,212,.10)';x.beginPath();x.moveTo(sk.x(0),sk.y(butuh(0)));
for(var i=0;i<=200;i++){var kp=16*i/200;x.lineTo(sk.x(kp),sk.y(butuh(kp)))}
x.lineTo(sk.x(16),sk.y(8));x.lineTo(sk.x(0),sk.y(8));x.closePath();x.fill();
_siskenKurva(x,sk,function(kp){return 0.912*Math.sqrt(kp)},0.01,16,'#ec4899',2.5);
_siskenGarisDatar(x,s,sk.y(2),'#fbbf24');
var kd=butuh(v);
_siskenTitik(x,sk.x(v),sk.y(kd),7,'#67e8f9');
_siskenLegenda(x,[['wilayah layak (arsir)','#5eead4'],['batas lonjakan 20%','#ec4899'],['batas waktu menetap','#fbbf24']],s.pad,s.atas-13);
x.font='17px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText('plant 1/s² + kendali PD: Kp='+v.toFixed(1)+' menuntut Kd ≥ '+kd.toFixed(2),s.pad,s.h-13);
x.textAlign='right';x.fillText('Kp →',s.w-s.pad,s.h-13);x.textAlign='left';x.fillText('Kd ↑',s.pad,s.atas+18);`,
      },
    ],
    grafikIntro: "Semakin akhir sebuah kesalahan rancangan ditemukan, semakin mahal memperbaikinya. Itulah alasan siklus spesifikasi–simulasi–revisi pada modul ini dijalankan tuntas sebelum perangkat keras dibuat.",
    grafik: {
      judul: "Gambar 1 — Biaya Revisi Membengkak di Tahap Akhir",
      gambar: `var s=_siskenSiapkan('siskenGrafikCanvas'+n,36,26,6); if(!s)return;
var x=s.ctx, tahap=[['Spesifikasi',1],['Model',3],['Simulasi',10],['Prototipe',30],['Produksi',100]];
var lebar=s.lebar/tahap.length;
for(var i=0;i<tahap.length;i++){
  var tinggi=s.tinggi*(Math.log10(tahap[i][1])+0.3)/2.6;
  var kiri=s.pad+i*lebar+lebar*0.18;
  x.fillStyle=i<3?'rgba(103,232,249,.75)':'rgba(236,72,153,.75)';
  x.fillRect(kiri,s.bawah-tinggi,lebar*0.64,tinggi);
  x.font='17px JetBrains Mono';x.textAlign='center';
  x.fillStyle='#e2ecf9';x.fillText(tahap[i][1]+'×',kiri+lebar*0.32,s.bawah-tinggi-10);
  x.fillStyle='#9fb2cc';x.fillText(tahap[i][0],kiri+lebar*0.32,s.h-13);
}
x.textAlign='left';
_siskenLegenda(x,[['masih di atas kertas','#67e8f9'],['sudah jadi barang','#ec4899']],s.pad,s.atas-14);`,
    },
  },

  // ── Modul 3 — Transformasi Laplace untuk Sistem Dinamik ────────────────────
  3: {
    intro: "Transformasi Laplace mengganti persamaan diferensial dengan aljabar: sinyal waktu menjadi titik pole di bidang-s. Tiga animasi berikut memperlihatkan pemetaan itu, mengapa letak pole memutuskan stabil atau tidak, dan cara membaca nilai akhir tanpa menunggu.",
    panel: [
      {
        judul: "Animasi 1 — Sinyal Waktu dan Pasangan Pole-nya di Bidang-s",
        label: "Laju peluruhan a", min: 0.1, max: 2.5, step: 0.05, nilai: 0.6, des: 2,
        gambar: `var s=_siskenSiapkan('siskenAnim1Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, lebarKiri=s.lebar*0.55;
var skT={x:function(t){return s.pad+t/6*lebarKiri},y:function(f){return s.atas+(1-f)*s.tinggi/2}};
var pts=[];for(var i=0;i<=500;i++){var t=6*i/500;pts.push([t,Math.exp(-v*t)*Math.cos(4*t)])}
_siskenJalur(x,skT,pts,'#67e8f9',3);
var idx=Math.floor((((phase||0)%1)+1)%1*(pts.length-1));
_siskenTitik(x,skT.x(pts[idx][0]),skT.y(pts[idx][1]),6,'#ec4899');
var ox=s.pad+s.lebar*0.78, oy=s.atas+s.tinggi/2, skS=60, skW=22;
x.strokeStyle='#3b5170';x.lineWidth=1.5;
x.beginPath();x.moveTo(ox-s.lebar*0.17,oy);x.lineTo(ox+s.lebar*0.1,oy);x.stroke();
x.beginPath();x.moveTo(ox,s.atas);x.lineTo(ox,s.bawah);x.stroke();
x.strokeStyle='#ec4899';x.lineWidth=3;
[[ -v,4],[-v,-4]].forEach(function(p){
  var px=ox+p[0]*skS, py=oy-p[1]*skW;
  x.beginPath();x.moveTo(px-7,py-7);x.lineTo(px+7,py+7);x.moveTo(px+7,py-7);x.lineTo(px-7,py+7);x.stroke();
});
x.font='17px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText('f(t) = e^(-at)·cos 4t',s.pad,s.h-13);
x.fillStyle='#f9a8d4';x.fillText('pole: -'+v.toFixed(2)+' ± j4',ox-s.lebar*0.16,s.atas-13);
x.fillStyle='#9fb2cc';x.fillText('σ',ox+s.lebar*0.1-14,oy-8);x.fillText('jω',ox+8,s.atas+16);
x.textAlign='right';x.fillText('bidang-s →',s.w-s.pad,s.h-13);x.textAlign='left';
_siskenLegenda(x,[['sinyal waktu','#67e8f9'],['pole di bidang-s','#ec4899']],s.pad,s.atas-13);`,
      },
      {
        judul: "Animasi 2 — Letak Pole Menentukan Stabil atau Tidak",
        label: "Bagian nyata pole σ", min: -1.5, max: 0.6, step: 0.05, nilai: -0.5, des: 2,
        gambar: `var s=_siskenSiapkan('siskenAnim2Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, puncak=Math.max(1.15,Math.exp(v*8));
var sk=_siskenSkala(s,0,8,-puncak,puncak);
var pts=[];for(var i=0;i<=700;i++){var t=8*i/700;pts.push([t,Math.exp(v*t)*Math.cos(3*t)])}
_siskenGarisDatar(x,s,sk.y(0),'#3b5170');
x.fillStyle=v<-0.02?'rgba(94,234,212,.08)':'rgba(236,72,153,.10)';
x.fillRect(s.pad,s.atas,s.lebar,s.tinggi);
_siskenJalur(x,sk,pts,v<-0.02?'#67e8f9':(v>0.02?'#ec4899':'#fbbf24'),3);
var status=v<-0.02?'σ < 0 → pole di kiri: STABIL, amplitudo meluruh':(v>0.02?'σ > 0 → pole di kanan: TAK STABIL, amplitudo meledak':'σ ≈ 0 → di sumbu: batas kestabilan, berosilasi terus');
x.font='17px JetBrains Mono';x.fillStyle=v<-0.02?'#5eead4':(v>0.02?'#f9a8d4':'#fbbf24');
x.fillText(status,s.pad,s.h-13);
x.fillStyle='#9fb2cc';x.textAlign='right';x.fillText('waktu →',s.w-s.pad,s.h-13);x.textAlign='left';
_siskenLegenda(x,[['e^(σt)·cos 3t','#67e8f9']],s.pad,s.atas-13);`,
      },
      {
        judul: "Animasi 3 — Teorema Nilai Akhir: Membaca y(∞) dari s·Y(s)",
        label: "Gain plant K", min: 0.5, max: 5, step: 0.1, nilai: 2, des: 1,
        gambar: `var s=_siskenSiapkan('siskenAnim3Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, akhir=v/2, sk=_siskenSkala(s,0,8,0,2.9);
_siskenGarisDatar(x,s,sk.y(akhir),'#fbbf24');
_siskenKurva(x,sk,function(t){return akhir*(1-Math.exp(-2*t))},0,8,'#67e8f9',3);
_siskenTitik(x,sk.x(8),sk.y(akhir*(1-Math.exp(-16))),6,'#5eead4');
_siskenLegenda(x,[['y(t) hasil simulasi','#67e8f9'],['ramalan teorema nilai akhir','#fbbf24']],s.pad,s.atas-13);
x.font='17px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText('G(s)=K/(s+2), masukan step: lim s·Y(s) = K/2 = '+akhir.toFixed(2)+', tanpa menunggu t→∞',s.pad,s.h-13);
x.textAlign='right';x.fillText('waktu →',s.w-s.pad,s.h-13);x.textAlign='left';`,
      },
    ],
    grafikIntro: "Tiga sinyal uji baku dan pasangan Laplace-nya. Ketiganya adalah kosakata dasar setiap kali tabel transformasi dibuka pada perhitungan tugas.",
    grafik: {
      judul: "Gambar 1 — Tiga Pasangan Transformasi Paling Sering Dipakai",
      gambar: `var s=_siskenSiapkan('siskenGrafikCanvas'+n,36,26,6); if(!s)return;
var x=s.ctx, kolom=s.lebar/3;
function panel(i,nama,rumus,gambarkan){
  var kiri=s.pad+i*kolom+18, lebarP=kolom-36, dasar=s.bawah-14, tinggiP=s.tinggi-56;
  x.strokeStyle='#3b5170';x.lineWidth=1.5;
  x.beginPath();x.moveTo(kiri,dasar);x.lineTo(kiri+lebarP,dasar);x.stroke();
  gambarkan(kiri,dasar,lebarP,tinggiP);
  x.font='18px JetBrains Mono';x.textAlign='center';
  x.fillStyle='#cfe3ff';x.fillText(nama,kiri+lebarP/2,s.atas+8);
  x.fillStyle='#fbbf24';x.fillText(rumus,kiri+lebarP/2,s.h-13);
  x.textAlign='left';
}
panel(0,'impuls δ(t)','L = 1',function(k,d,l,t){
  x.strokeStyle='#67e8f9';x.lineWidth=4;
  x.beginPath();x.moveTo(k+14,d);x.lineTo(k+14,d-t);x.stroke();
  x.fillStyle='#67e8f9';x.beginPath();x.moveTo(k+14,d-t-2);x.lineTo(k+7,d-t+14);x.lineTo(k+21,d-t+14);x.closePath();x.fill();
});
panel(1,'step u(t)','L = 1/s',function(k,d,l,t){
  x.strokeStyle='#67e8f9';x.lineWidth=3;
  x.beginPath();x.moveTo(k,d);x.lineTo(k+14,d);x.lineTo(k+14,d-t*0.72);x.lineTo(k+l,d-t*0.72);x.stroke();
});
panel(2,'ramp t·u(t)','L = 1/s²',function(k,d,l,t){
  x.strokeStyle='#67e8f9';x.lineWidth=3;
  x.beginPath();x.moveTo(k,d);x.lineTo(k+l,d-t*0.9);x.stroke();
});`,
    },
  },

  // ── Modul 4 — Fungsi Transfer dan Diagram Blok ─────────────────────────────
  4: {
    intro: "Fungsi transfer meringkas seluruh dinamika ke satu pecahan dalam s, dan diagram blok menyusunnya menjadi sistem utuh. Animasi berikut menunjukkan reduksi blok tahap demi tahap, pengaruh zero pada bentuk respons, dan bagaimana umpan balik menggeser pole.",
    panel: [
      {
        judul: "Animasi 1 — Mereduksi Diagram Blok Tahap demi Tahap",
        label: "Tahap reduksi", min: 1, max: 3, step: 1, nilai: 1, des: 0,
        gambar: `var s=_siskenSiapkan('siskenAnim1Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, tengah=s.atas+s.tinggi*0.42;
function kotak(cx,label,warna){
  x.strokeStyle=warna;x.lineWidth=2;x.fillStyle='rgba(13,59,74,.5)';
  x.beginPath();if(x.roundRect)x.roundRect(cx-62,tengah-30,124,60,10);else x.rect(cx-62,tengah-30,124,60);
  x.fill();x.stroke();
  x.font='19px JetBrains Mono';x.textAlign='center';x.fillStyle='#e2ecf9';
  x.fillText(label,cx,tengah+7);x.textAlign='left';
}
function panah(x1,x2,y){x.strokeStyle='#8ea6c8';x.lineWidth=2;x.beginPath();x.moveTo(x1,y);x.lineTo(x2-8,y);x.stroke();
  x.fillStyle='#8ea6c8';x.beginPath();x.moveTo(x2,y);x.lineTo(x2-11,y-6);x.lineTo(x2-11,y+6);x.closePath();x.fill();}
var tahap=Math.round(v), kiri=s.pad+40, kanan=s.w-s.pad-40;
x.font='17px JetBrains Mono';
if(tahap===1){
  var c1=s.pad+s.lebar*0.33, c2=s.pad+s.lebar*0.62, jum=s.pad+s.lebar*0.16;
  x.strokeStyle='#8ea6c8';x.lineWidth=2;x.beginPath();x.arc(jum,tengah,16,0,Math.PI*2);x.stroke();
  x.fillStyle='#e2ecf9';x.fillText('+',jum-5,tengah+6);
  panah(kiri-30,jum-16,tengah);kotakInfo();
  panah(jum+16,c1-62,tengah);kotak(c1,'G1 = 2','#67e8f9');
  panah(c1+62,c2-62,tengah);kotak(c2,'G2 = 3','#67e8f9');
  panah(c2+62,kanan+20,tengah);
  var yb=tengah+86;
  x.strokeStyle='#f9a8d4';x.lineWidth=2;
  x.beginPath();x.moveTo(kanan-14,tengah+30);x.lineTo(kanan-14,yb);x.lineTo(jum,yb);x.lineTo(jum,tengah+16);x.stroke();
  x.fillStyle='#f9a8d4';x.fillText('H = 0.5',s.pad+s.lebar*0.42,yb-10);
  x.fillText('umpan balik masih terbentang',s.pad,s.h-13);
}else if(tahap===2){
  var cg=s.pad+s.lebar*0.45, jum2=s.pad+s.lebar*0.2;
  x.strokeStyle='#8ea6c8';x.lineWidth=2;x.beginPath();x.arc(jum2,tengah,16,0,Math.PI*2);x.stroke();
  x.fillStyle='#e2ecf9';x.fillText('+',jum2-5,tengah+6);
  panah(kiri-30,jum2-16,tengah);
  panah(jum2+16,cg-62,tengah);kotak(cg,'G1·G2 = 6','#5eead4');
  panah(cg+62,kanan+20,tengah);
  var yb2=tengah+86;
  x.strokeStyle='#f9a8d4';x.lineWidth=2;
  x.beginPath();x.moveTo(kanan-14,tengah+30);x.lineTo(kanan-14,yb2);x.lineTo(jum2,yb2);x.lineTo(jum2,tengah+16);x.stroke();
  x.fillStyle='#f9a8d4';x.fillText('H = 0.5',s.pad+s.lebar*0.42,yb2-10);
  x.fillStyle='#9fb2cc';x.fillText('blok seri dikalikan: 2 × 3 = 6',s.pad,s.h-13);
}else{
  kotak(s.pad+s.lebar*0.45,'T = 1.50','#fbbf24');
  panah(kiri-30,s.pad+s.lebar*0.45-62,tengah);
  panah(s.pad+s.lebar*0.45+62,kanan+20,tengah);
  x.fillStyle='#9fb2cc';x.fillText('loop ditutup: T = 6/(1 + 6·0.5) = 1.50',s.pad,s.h-13);
}
function kotakInfo(){}
var maju=[kiri-30,kanan+20];
var pj=maju[0]+((((phase||0)*0.7)%1)+1)%1*(maju[1]-maju[0]);
_siskenTitik(x,pj,tengah,6,'#fbbf24');
x.fillStyle='#fde68a';x.font='17px JetBrains Mono';x.textAlign='right';
x.fillText('gain ekivalen SELALU 1.50: bentuk boleh berubah, sistemnya tidak',s.w-s.pad,s.atas-13);x.textAlign='left';`,
      },
      {
        judul: "Animasi 2 — Zero Membentuk Respons: Efek Mendahului",
        label: "Posisi zero z₀", min: 0.6, max: 8, step: 0.1, nilai: 4, des: 1,
        gambar: `var s=_siskenSiapkan('siskenAnim2Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,8,0,2.1);
function dasar(t){return _siskenStep2(0.5,2,t)}
function turunan(t){var h=0.004;return (dasar(t+h)-dasar(Math.max(0,t-h)))/(2*h)}
_siskenGarisDatar(x,s,sk.y(1),'#fbbf24');
_siskenKurva(x,sk,dasar,0,8,'rgba(103,132,168,.55)',2);
_siskenKurva(x,sk,function(t){return dasar(t)+turunan(t)/v},0,8,'#67e8f9',3);
_siskenLegenda(x,[['tanpa zero','rgba(103,132,168,.9)'],['dengan zero di -z₀','#67e8f9'],['setpoint','#fbbf24']],s.pad,s.atas-13);
x.font='17px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText('y_zero(t) = y(t) + y\\u0027(t)/z\\u2080, sebab zero dekat titik asal (z\\u2080 kecil) menambah lonjakan',s.pad,s.h-13);
x.textAlign='right';x.fillText('waktu →',s.w-s.pad,s.h-13);x.textAlign='left';`,
      },
      {
        judul: "Animasi 3 — Umpan Balik Menggeser Pole dan Mempercepat Respons",
        label: "Gain loop K", min: 0, max: 10, step: 0.2, nilai: 2, des: 1,
        gambar: `var s=_siskenSiapkan('siskenAnim3Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, pole=-(1+v)/2, yss=v<0.01?0:v/(1+v);
var lebarKiri=s.lebar*0.34;
var oy=s.atas+s.tinggi/2, ox=s.pad+lebarKiri*0.88, skS=lebarKiri*0.14;
x.strokeStyle='#3b5170';x.lineWidth=1.5;
x.beginPath();x.moveTo(s.pad,oy);x.lineTo(s.pad+lebarKiri,oy);x.stroke();
x.beginPath();x.moveTo(ox,s.atas+14);x.lineTo(ox,s.bawah-14);x.stroke();
x.strokeStyle='#67e8f9';x.lineWidth=2;x.setLineDash([5,5]);
x.beginPath();x.moveTo(ox-0.5*skS,oy);x.lineTo(ox-5.5*skS,oy);x.stroke();x.setLineDash([]);
var px=ox+pole*skS;
x.strokeStyle='#ec4899';x.lineWidth=3;
x.beginPath();x.moveTo(px-7,oy-7);x.lineTo(px+7,oy+7);x.moveTo(px+7,oy-7);x.lineTo(px-7,oy+7);x.stroke();
x.font='16px JetBrains Mono';x.fillStyle='#f9a8d4';
x.fillText('pole '+pole.toFixed(2),Math.max(s.pad,px-40),oy+30);
x.fillStyle='#9fb2cc';x.fillText('σ',s.pad+lebarKiri-16,oy-10);
var skY={x:function(t){return s.pad+s.lebar*0.44+t/6*(s.lebar*0.56)},y:function(f){return s.bawah-f/1.1*s.tinggi}};
var pts=[];for(var i=0;i<=400;i++){var t=6*i/400;pts.push([t,yss*(1-Math.exp(pole*t))])}
x.setLineDash([9,7]);x.strokeStyle='#fbbf24';x.lineWidth=2;
x.beginPath();x.moveTo(skY.x(0),skY.y(1));x.lineTo(skY.x(6),skY.y(1));x.stroke();x.setLineDash([]);
_siskenJalur(x,skY,pts,'#67e8f9',3);
x.fillStyle='#9fb2cc';
x.fillText('τ_tutup = '+(v>-0.99?(2/(1+v)).toFixed(2):'-')+' s · y(∞) = K/(1+K) = '+yss.toFixed(2),s.pad+s.lebar*0.44,s.h-13);
x.fillText('plant 1/(2s+1), loop K: makin besar K, pole makin kiri → makin cepat',s.pad,s.atas-13-0);`,
      },
    ],
    grafikIntro: "Dengan blok yang sama (G₁ = 2, G₂ = 3, H = 0,5), susunanlah yang menentukan gain ekivalen. Umpan balik menukar gain mentah menjadi kecepatan dan ketahanan, tema yang kembali dibedah di Modul 8.",
    grafik: {
      judul: "Gambar 1 — Gain Ekivalen: Seri, Paralel, dan Umpan Balik",
      gambar: `var s=_siskenSiapkan('siskenGrafikCanvas'+n,36,26,6); if(!s)return;
var x=s.ctx, susun=[['Seri  G1·G2',6,'#67e8f9'],['Paralel  G1+G2',5,'#5eead4'],['Umpan balik  G/(1+GH)',1.5,'#fbbf24']];
var lebar=s.lebar/susun.length;
for(var i=0;i<susun.length;i++){
  var tinggi=s.tinggi*susun[i][1]/7;
  var kiri=s.pad+i*lebar+lebar*0.2;
  x.fillStyle=susun[i][2];x.globalAlpha=0.78;
  x.fillRect(kiri,s.bawah-tinggi,lebar*0.6,tinggi);x.globalAlpha=1;
  x.font='18px JetBrains Mono';x.textAlign='center';
  x.fillStyle='#e2ecf9';x.fillText(susun[i][1].toFixed(1),kiri+lebar*0.3,s.bawah-tinggi-10);
  x.font='15px JetBrains Mono';x.fillStyle='#9fb2cc';
  x.fillText(susun[i][0],kiri+lebar*0.3,s.h-13);
}
x.textAlign='left';x.font='17px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText('G1=2, G2=3, H=0.5',s.pad,s.atas-14);`,
    },
  },

  // ── Modul 5 — Pemodelan dan Simulasi Sistem Kontrol ────────────────────────
  5: {
    intro: "Model adalah jembatan antara mesin nyata dan simulasi. Tiga animasi berikut memperlihatkan sistem massa–pegas–peredam menjawab gaya, jebakan ukuran langkah integrasi, dan cara mencocokkan parameter model dengan data ukur.",
    panel: [
      {
        judul: "Animasi 1 — Massa–Pegas–Peredam Menjawab Gaya Step",
        label: "Koefisien redaman c", min: 0.4, max: 7, step: 0.1, nilai: 1.6, des: 1,
        gambar: `var s=_siskenSiapkan('siskenAnim1Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, z=v/4, wn=2;
var skY={x:function(t){return s.pad+s.lebar*0.36+t/8*(s.lebar*0.64)},y:function(f){return s.bawah-f/1.9*s.tinggi}};
x.setLineDash([9,7]);x.strokeStyle='#fbbf24';x.lineWidth=2;
x.beginPath();x.moveTo(skY.x(0),skY.y(1));x.lineTo(skY.x(8),skY.y(1));x.stroke();x.setLineDash([]);
_siskenKurva(x,skY,function(t){return _siskenStep2(z,wn,t)},0,8,'#67e8f9',3);
var tSekarang=(((phase||0)*1.1)%1)*8;
var posisi=_siskenStep2(z,wn,tSekarang);
_siskenTitik(x,skY.x(tSekarang),skY.y(posisi),6,'#ec4899');
var dindingX=s.pad+14, tengah=s.atas+s.tinggi*0.45;
var jangkau=s.lebar*0.22, xm=dindingX+30+posisi*jangkau*0.55+jangkau*0.25;
x.strokeStyle='#8ea6c8';x.lineWidth=3;
x.beginPath();x.moveTo(dindingX,tengah-56);x.lineTo(dindingX,tengah+56);x.stroke();
x.strokeStyle='#5eead4';x.lineWidth=2;x.beginPath();x.moveTo(dindingX,tengah);
var seg=8;for(var i2=1;i2<seg;i2++){var sx=dindingX+(xm-34-dindingX)*i2/seg;x.lineTo(sx,tengah+((i2%2)?-13:13))}
x.lineTo(xm-34,tengah);x.stroke();
x.fillStyle='rgba(103,232,249,.8)';x.fillRect(xm-34,tengah-27,54,54);
x.fillStyle='#06202b';x.font='bold 18px JetBrains Mono';x.textAlign='center';x.fillText('m',xm-7,tengah+7);x.textAlign='left';
x.font='16px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText('m=1, k=4 → ζ = c/4 = '+z.toFixed(2),s.pad,s.h-13);
x.textAlign='right';x.fillText('waktu →',s.w-s.pad,s.h-13);x.textAlign='left';
_siskenLegenda(x,[['posisi massa x(t)','#67e8f9'],['posisi akhir','#fbbf24']],s.pad,s.atas-13);`,
      },
      {
        judul: "Animasi 2 — Ukuran Langkah Euler Menentukan Akurasi",
        label: "Langkah integrasi h (s)", min: 0.05, max: 2.4, step: 0.05, nilai: 0.6, des: 2,
        gambar: `var s=_siskenSiapkan('siskenAnim2Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,8,-0.6,2.2);
_siskenGarisDatar(x,s,sk.y(1),'#fbbf24');
_siskenKurva(x,sk,function(t){return 1-Math.exp(-t)},0,8,'#67e8f9',3);
var y=0, pts=[[0,0]];
for(var t=0;t<8;t+=v){var yb=y+v*(1-y);pts.push([Math.min(t+v,8),yb]);y=yb;}
x.strokeStyle='#ec4899';x.lineWidth=2;x.beginPath();
for(var i=0;i<pts.length;i++){var px=sk.x(pts[i][0]),py=sk.y(Math.max(-0.6,Math.min(2.2,pts[i][1])));if(i===0)x.moveTo(px,py);else x.lineTo(px,py)}
x.stroke();
for(var j=0;j<pts.length;j++){_siskenTitik(x,sk.x(pts[j][0]),sk.y(Math.max(-0.6,Math.min(2.2,pts[j][1]))),4,'#ec4899')}
var faktor=Math.abs(1-v);
var status=v<1?'h kecil: Euler menempel solusi eksak':(faktor<1?'h besar: berosilasi tapi masih menuju jawaban':'h > 2τ: tiap langkah MEMPERBESAR galat hingga simulasi meledak');
_siskenLegenda(x,[['solusi eksak','#67e8f9'],['Euler, langkah h','#ec4899'],['nilai akhir','#fbbf24']],s.pad,s.atas-13);
x.font='17px JetBrains Mono';x.fillStyle=faktor<1?'#9fb2cc':'#f9a8d4';
x.fillText('dy/dt=(1−y)/τ, τ=1 · faktor per langkah |1−h/τ| = '+faktor.toFixed(2)+' · '+status,s.pad,s.h-13);`,
      },
      {
        judul: "Animasi 3 — Mencocokkan Model dengan Data Ukur",
        label: "Konstanta waktu model τ", min: 0.5, max: 4, step: 0.05, nilai: 1.2, des: 2,
        gambar: `var s=_siskenSiapkan('siskenAnim3Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,7.5,0,1.35);
var data=[];for(var i=1;i<=14;i++){var t=i*0.5;data.push([t,1-Math.exp(-t/2)+0.04*Math.sin(7.3*i+1.7)])}
_siskenKurva(x,sk,function(t){return 1-Math.exp(-t/v)},0,7.5,'#67e8f9',3);
for(var j=0;j<data.length;j++){_siskenTitik(x,sk.x(data[j][0]),sk.y(data[j][1]),5,'#fbbf24')}
var jumlah=0;for(var k=0;k<data.length;k++){var e=data[k][1]-(1-Math.exp(-data[k][0]/v));jumlah+=e*e}
var rmse=Math.sqrt(jumlah/data.length);
_siskenLegenda(x,[['data ukur','#fbbf24'],['model 1−e^(−t/τ)','#67e8f9']],s.pad,s.atas-13);
x.font='17px JetBrains Mono';x.fillStyle=rmse<0.05?'#5eead4':'#9fb2cc';
x.fillText('RMSE = '+rmse.toFixed(3)+(rmse<0.05?', artinya model sudah menempel data (τ sebenarnya = 2)':', jadi geser τ sampai kurva menempel data'),s.pad,s.h-13);
x.textAlign='right';x.fillText('waktu →',s.w-s.pad,s.h-13);x.textAlign='left';`,
      },
    ],
    grafikIntro: "Kurva galat dari animasi ketiga, dihitung untuk semua kandidat τ sekaligus: identifikasi parameter adalah mencari lembah kurva ini. Lembahnya jatuh di τ ≈ 2, tepat nilai yang dipakai membangkitkan data.",
    grafik: {
      judul: "Gambar 1 — Galat RMSE terhadap Pilihan τ: Lembah di Parameter Benar",
      gambar: `var s=_siskenSiapkan('siskenGrafikCanvas'+n,36,26,6); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0.5,4,0,0.45);
var data=[];for(var i=1;i<=14;i++){var t=i*0.5;data.push([t,1-Math.exp(-t/2)+0.04*Math.sin(7.3*i+1.7)])}
function rmse(tau){var j=0;for(var k=0;k<data.length;k++){var e=data[k][1]-(1-Math.exp(-data[k][0]/tau));j+=e*e}return Math.sqrt(j/data.length)}
var terbaik=0.5,nilaiMin=1e9;
for(var m2=0;m2<=350;m2++){var tau=0.5+3.5*m2/350,r=rmse(tau);if(r<nilaiMin){nilaiMin=r;terbaik=tau}}
_siskenKurva(x,sk,rmse,0.5,4,'#67e8f9',3);
_siskenTitik(x,sk.x(terbaik),sk.y(nilaiMin),7,'#5eead4');
x.font='17px JetBrains Mono';x.fillStyle='#5eead4';x.textAlign='center';
x.fillText('lembah: τ = '+terbaik.toFixed(2),sk.x(terbaik),sk.y(nilaiMin)-16);
x.textAlign='left';x.fillStyle='#9fb2cc';
x.fillText('RMSE ↑',s.pad,s.atas-14);
x.textAlign='right';x.fillText('kandidat τ →',s.w-s.pad,s.h-13);x.textAlign='left';`,
    },
  },

  // ── Modul 6 — Perancangan Kontrol melalui Komputer ─────────────────────────
  6: {
    intro: "Komputer memungkinkan ratusan kandidat rancangan diuji sebelum satu pun perangkat dibuat. Animasi berikut memperlihatkan sapuan gain massal, efek periode sampling ketika kendali menjadi kode, dan lintasan pole saat gain dinaikkan.",
    panel: [
      {
        judul: "Animasi 1 — Menyapu Puluhan Kandidat Gain Sekaligus",
        label: "Batas lonjakan spesifikasi (%)", min: 5, max: 40, step: 1, nilai: 15, des: 0,
        gambar: `var s=_siskenSiapkan('siskenAnim1Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,8,0,1.8), lolos=0, terbaik=-1, data=[];
_siskenGarisDatar(x,s,sk.y(1),'#fbbf24');
_siskenGarisDatar(x,s,sk.y(1+v/100),'#ec4899');
for(var i=0;i<24;i++){
  var K=0.4+11.6*i/23, z=Math.max(.15,1.02-.11*K), wn=.6+.5*K;
  var mp=z<1?100*Math.exp(-Math.PI*z/Math.sqrt(1-z*z)):0;
  data.push([z,wn,mp,K]);
  if(mp<=v){lolos++;terbaik=i;}
}
var sorot=Math.floor(((phase||0)*3)%24);
for(var j=0;j<24;j++){
  var d=data[j];
  var warna=(j===sorot)?'#67e8f9':(j===terbaik?'#fbbf24':(d[2]<=v?'rgba(94,234,212,.4)':'rgba(103,132,168,.22)'));
  _siskenKurva(x,sk,function(t){return _siskenStep2(d[0],d[1],t)},0,8,warna,(j===sorot||j===terbaik)?3.2:1.2);
}
_siskenLegenda(x,[['kandidat disorot','#67e8f9'],['tercepat yang lolos','#fbbf24'],['lolos spesifikasi','#5eead4']],s.pad,s.atas-13);
_siskenBawah(x,s,lolos+' dari 24 kandidat memenuhi batas '+v.toFixed(0)+'% · kandidat #'+(sorot+1)+': K='+data[sorot][3].toFixed(1)+', lonjakan '+data[sorot][2].toFixed(0)+'%','waktu →');`,
      },
      {
        judul: "Animasi 2 — Periode Sampling: Kendali Hanya Bertindak Tiap Ts",
        label: "Periode sampling Ts (s)", min: 0.02, max: 0.9, step: 0.02, nilai: 0.2, des: 2,
        gambar: `var s=_siskenSiapkan('siskenAnim2Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,6,-0.4,2.3);
_siskenGarisDatar(x,s,sk.y(1),'#fbbf24');
_siskenKurva(x,sk,function(t){return 0.8*(1-Math.exp(-5*t))},0,6,'rgba(103,132,168,.5)',2);
var dt=0.005,y=0,u=0,berikut=0,ty=[],tu=[];
for(var i=0;i<=1200;i++){var t=i*dt;
  if(t>=berikut){u=4*(1-y);berikut+=v;}
  ty.push([t,y]);tu.push([t,u/5]);
  y+=dt*(u-y);}
_siskenJalur(x,sk,tu,'#a78bfa',2);
_siskenJalur(x,sk,ty,'#67e8f9',3);
var kasar=4*v;
_siskenLegenda(x,[['y(t) kendali digital','#67e8f9'],['u/5 (tangga ZOH)','#a78bfa'],['acuan kontinu','rgba(103,132,168,.9)']],s.pad,s.atas-13);
x.font='17px JetBrains Mono';x.fillStyle=kasar<1?'#9fb2cc':'#f9a8d4';
x.fillText('K·Ts = '+kasar.toFixed(2)+(kasar<1?', artinya sampel cukup rapat, perilaku ≈ kontinu':(kasar<2?', tandanya mulai berdering karena kendali selalu terlambat':', artinya melewati batas sehingga loop digital tak stabil')),s.pad,s.h-13);
x.textAlign='right';x.fillText('waktu →',s.w-s.pad,s.h-13);x.textAlign='left';`,
      },
      {
        judul: "Animasi 3 — Root Locus: Lintasan Pole Saat K Naik",
        label: "Gain K", min: 0, max: 12, step: 0.1, nilai: 1, des: 1,
        gambar: `var s=_siskenSiapkan('siskenAnim3Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, ox=s.pad+s.lebar*0.62, oy=s.atas+s.tinggi/2, skS=s.lebar*0.115, skW=s.tinggi*0.13;
x.strokeStyle='#3b5170';x.lineWidth=1.5;
x.beginPath();x.moveTo(s.pad,oy);x.lineTo(s.w-s.pad,oy);x.stroke();
x.beginPath();x.moveTo(ox,s.atas);x.lineTo(ox,s.bawah);x.stroke();
x.strokeStyle='rgba(103,232,249,.5)';x.lineWidth=2;
x.beginPath();x.moveTo(ox-1*skS,oy);x.lineTo(ox-2*skS,oy);x.stroke();
x.beginPath();x.moveTo(ox-3*skS,oy);x.lineTo(ox-2*skS,oy);x.stroke();
x.beginPath();x.moveTo(ox-2*skS,oy-Math.sqrt(11)*skW);x.lineTo(ox-2*skS,oy+Math.sqrt(11)*skW);x.stroke();
var polea,poleb;
if(v<=1){var akar=Math.sqrt(1-v);polea=[-2+akar,0];poleb=[-2-akar,0];}
else{var im=Math.sqrt(v-1);polea=[-2,im];poleb=[-2,-im];}
[polea,poleb].forEach(function(p){
  var px=ox+p[0]*skS, py=oy-p[1]*skW;
  x.strokeStyle='#ec4899';x.lineWidth=3;
  x.beginPath();x.moveTo(px-7,py-7);x.lineTo(px+7,py+7);x.moveTo(px+7,py-7);x.lineTo(px-7,py+7);x.stroke();
});
x.font='17px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText('(s+1)(s+3)+K = 0 → pole: '+(v<=1?(polea[0].toFixed(2)+' dan '+poleb[0].toFixed(2)):('-2 ± j'+polea[1].toFixed(2))),s.pad,s.h-13);
x.fillStyle='#5eead4';x.textAlign='right';
x.fillText('pole tetap di kiri utk semua K, padahal tak semua sistem seberuntung ini',s.w-s.pad,s.bawah-14);x.textAlign='left';
x.fillStyle='#9fb2cc';x.fillText('σ',s.w-s.pad-16,oy-8);x.fillText('jω',ox+8,s.atas+16);
_siskenLegenda(x,[['lintasan pole','rgba(103,232,249,.85)'],['pole pada K ini','#ec4899']],s.pad,s.atas-13);`,
      },
    ],
    grafikIntro: "Dua sumbu keputusan implementasi digital: periode sampling Ts dan gain K. Wilayah arsir memenuhi dua-duanya, yakni cukup cepat menuruti spesifikasi error, cukup lambat agar loop digital tetap stabil.",
    grafik: {
      judul: "Gambar 1 — Wilayah Layak pada Bidang (Ts, K)",
      gambar: `var s=_siskenSiapkan('siskenGrafikCanvas'+n,36,26,6); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0.05,0.9,0,20);
function atap(ts){return Math.min(20,2/ts)}
x.fillStyle='rgba(94,234,212,.10)';x.beginPath();
x.moveTo(sk.x(0.05),sk.y(3));
for(var i=0;i<=220;i++){var ts=0.05+0.85*i/220;x.lineTo(sk.x(ts),sk.y(Math.max(3,atap(ts))))}
for(var j=220;j>=0;j--){var t2=0.05+0.85*j/220;x.lineTo(sk.x(t2),sk.y(Math.min(3,atap(t2))))}
x.closePath();x.fill();
_siskenKurva(x,sk,atap,0.05,0.9,'#ec4899',2.5);
_siskenGarisDatar(x,s,sk.y(3),'#fbbf24');
_siskenLegenda(x,[['batas kestabilan K=2/Ts','#ec4899'],['K minimum utk error','#fbbf24'],['wilayah layak','#5eead4']],s.pad,s.atas-14);
x.font='17px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText('K ↑',s.pad,s.atas+18);
x.textAlign='right';x.fillText('periode sampling Ts →',s.w-s.pad,s.h-13);x.textAlign='left';`,
    },
  },

  // ── Modul 7 — Membaca Grafik Keluaran dan Respons ──────────────────────────
  7: {
    intro: "Sebelum merancang, seorang insinyur harus bisa membaca. Tiga animasi berikut melatih membaca empat indikator langsung dari kurva, mengukur error tunak dari jarak dua garis, dan membedakan orde sistem dari bentuknya.",
    panel: [
      {
        judul: "Animasi 1 — Membaca tr, tp, Mp, dan ts dari Kurva",
        label: "Rasio redaman ζ", min: 0.2, max: 0.9, step: 0.02, nilai: 0.45, des: 2,
        gambar: `var s=_siskenSiapkan('siskenAnim1Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, wn=2, sk=_siskenSkala(s,0,8,0,1.8);
var wd=wn*Math.sqrt(1-v*v), tp=Math.PI/wd, mp=Math.exp(-Math.PI*v/Math.sqrt(1-v*v)), ts=4/(v*wn);
var t10=-1,t90=-1;
for(var i=0;i<=2000;i++){var t=8*i/2000,y=_siskenStep2(v,wn,t);
  if(t10<0&&y>=0.1)t10=t; if(t90<0&&y>=0.9)t90=t;}
_siskenGarisDatar(x,s,sk.y(1),'#fbbf24');
x.setLineDash([5,5]);x.lineWidth=1.5;
x.strokeStyle='#ec4899';x.beginPath();x.moveTo(sk.x(tp),s.atas);x.lineTo(sk.x(tp),s.bawah);x.stroke();
x.strokeStyle='#5eead4';x.beginPath();x.moveTo(sk.x(Math.min(ts,8)),s.atas);x.lineTo(sk.x(Math.min(ts,8)),s.bawah);x.stroke();
x.strokeStyle='#a78bfa';x.beginPath();x.moveTo(s.pad,sk.y(1+mp));x.lineTo(s.w-s.pad,sk.y(1+mp));x.stroke();
x.setLineDash([]);
_siskenKurva(x,sk,function(t){return _siskenStep2(v,wn,t)},0,8,'#67e8f9',3);
var tk=(((phase||0)*0.8)%1)*8;
_siskenTitik(x,sk.x(tk),sk.y(_siskenStep2(v,wn,tk)),6,'#fbbf24');
_siskenLegenda(x,[['y(t)','#67e8f9'],['puncak tp','#ec4899'],['menetap ts','#5eead4'],['lonjakan Mp','#a78bfa']],s.pad,s.atas-13);
x.font='17px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText('tr(10−90%) = '+(t90-t10).toFixed(2)+' s · tp = '+tp.toFixed(2)+' s · Mp = '+(100*mp).toFixed(0)+'% · ts = '+ts.toFixed(2)+' s',s.pad,s.h-13);
x.textAlign='right';x.fillText('waktu →',s.w-s.pad,s.h-13);x.textAlign='left';`,
      },
      {
        judul: "Animasi 2 — Mengukur Error Tunak dari Jarak Dua Garis",
        label: "Gain loop K", min: 1, max: 30, step: 0.5, nilai: 4, des: 1,
        gambar: `var s=_siskenSiapkan('siskenAnim2Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,9,0,1.25);
var akhir=v/(1+v), ess=1/(1+v);
_siskenGarisDatar(x,s,sk.y(1),'#fbbf24');
_siskenGarisDatar(x,s,sk.y(akhir),'#5eead4');
_siskenKurva(x,sk,function(t){return akhir*(1-Math.exp(-(1+v)*t/3))},0,9,'#67e8f9',3);
var bx=sk.x(7.6);
x.strokeStyle='#ec4899';x.lineWidth=2;
x.beginPath();x.moveTo(bx,sk.y(1));x.lineTo(bx,sk.y(akhir));x.stroke();
x.beginPath();x.moveTo(bx-7,sk.y(1)+8);x.lineTo(bx,sk.y(1));x.lineTo(bx+7,sk.y(1)+8);x.stroke();
x.beginPath();x.moveTo(bx-7,sk.y(akhir)-8);x.lineTo(bx,sk.y(akhir));x.lineTo(bx+7,sk.y(akhir)-8);x.stroke();
x.font='17px JetBrains Mono';x.fillStyle='#f9a8d4';
x.fillText('e_ss = '+(100*ess).toFixed(1)+'%',bx-150,(sk.y(1)+sk.y(akhir))/2+6);
_siskenLegenda(x,[['keluaran','#67e8f9'],['setpoint','#fbbf24'],['nilai akhir','#5eead4']],s.pad,s.atas-13);
_siskenBawah(x,s,'sistem tipe-0: e_ss = 1/(1+K), jadi menaikkan K menyempitkan celah, tak pernah menutupnya','waktu →');`,
      },
      {
        judul: "Animasi 3 — Orde Satu atau Orde Dua? Kenali dari Bentuknya",
        label: "Rasio redaman ζ (kurva orde dua)", min: 0.3, max: 1.3, step: 0.05, nilai: 0.5, des: 2,
        gambar: `var s=_siskenSiapkan('siskenAnim3Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,8,0,1.7), tau=0.8;
_siskenGarisDatar(x,s,sk.y(1),'#fbbf24');
_siskenKurva(x,sk,function(t){return 1-Math.exp(-t/tau)},0,8,'rgba(251,191,36,.8)',2.5);
_siskenKurva(x,sk,function(t){return _siskenStep2(Math.min(v,0.999),2,t)},0,8,'#67e8f9',3);
_siskenTitik(x,sk.x(tau),sk.y(0.632),6,'#fbbf24');
x.font='16px JetBrains Mono';x.fillStyle='#fde68a';
x.fillText('63% di t = τ',sk.x(tau)+10,sk.y(0.632)+22);
_siskenLegenda(x,[['orde dua (ζ digeser)','#67e8f9'],['orde satu, τ=0.8','#fbbf24']],s.pad,s.atas-13);
_siskenBawah(x,s,v<1?'ada lonjakan & osilasi → pasti orde dua kurang teredam':'ζ ≥ 1: tanpa lonjakan sehingga mirip orde satu; bedakan dari landai awal kurva','waktu →');`,
      },
    ],
    grafikIntro: "Kurva hafalan praktis: lonjakan hanya bergantung pada ζ. Sekali ζ terbaca dari lonjakan, seluruh indikator lain menyusul dari rumus; inilah alasan Mp selalu dibaca lebih dulu.",
    grafik: {
      judul: "Gambar 1 — Kurva Baku: Lonjakan Mp sebagai Fungsi ζ",
      gambar: `var s=_siskenSiapkan('siskenGrafikCanvas'+n,36,26,6); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,1,0,90);
function mp(z){return 100*Math.exp(-Math.PI*z/Math.sqrt(1-z*z))}
_siskenKurva(x,sk,mp,0.02,0.98,'#67e8f9',3);
[[0.2,'ζ=0.2'],[0.45,'ζ=0.45'],[0.7,'ζ=0.7']].forEach(function(p){
  _siskenTitik(x,sk.x(p[0]),sk.y(mp(p[0])),6,'#fbbf24');
  x.font='16px JetBrains Mono';x.fillStyle='#fde68a';
  x.fillText(p[1]+' → '+mp(p[0]).toFixed(0)+'%',sk.x(p[0])+12,sk.y(mp(p[0]))-10);
});
x.font='17px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText('Mp (%) ↑',s.pad,s.atas-14);
x.textAlign='right';x.fillText('rasio redaman ζ →',s.w-s.pad,s.h-13);x.textAlign='left';`,
    },
  },

  // ── Modul 8 — Karakteristik Respons Sistem Umpan Balik ─────────────────────
  // Trio lama (respons step, redaman, Bode) pulang ke rumahnya: modul yang
  // memang membahas karakteristik respons. Matematikanya dipertahankan.
  8: {
    intro: "Geser parameter untuk mengamati perubahan kecepatan, overshoot, dan error. Visual ini menjadi jembatan antara konsep karakteristik respons sistem umpan balik dan perilaku sistem yang sebenarnya.",
    panel: [
      {
        judul: "Animasi 1 — Respons Step Loop Tertutup terhadap Gain",
        label: "Agresivitas controller", min: 0.2, max: 5, step: 0.1, nilai: 1.5, des: 1,
        gambar: `var s=_siskenSiapkan('siskenAnim1Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,8,0,1.43);
var z=Math.max(.18,1.05-.14*v), wn=.7+v*.65;
_siskenGarisDatar(x,s,sk.y(1),'#fbbf24');
var pts=[];for(var k=0;k<650;k++){var t=8*k/649;pts.push([t,_siskenStep2(z,wn,t)])}
_siskenJalur(x,sk,pts,'#67e8f9',3);
var idx=Math.floor((((phase||0)%1)+1)%1*(pts.length-1));
_siskenTitik(x,sk.x(pts[idx][0]),sk.y(pts[idx][1]),7,'#ec4899');
_siskenLegenda(x,[['keluaran y(t)','#67e8f9'],['setpoint','#fbbf24']],s.pad,s.atas-13);
x.font='17px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText('gain naik → lebih cepat tapi lebih melonjak: ζ = '+z.toFixed(2)+', ωn = '+wn.toFixed(2),s.pad,s.h-13);
x.textAlign='right';x.fillText('waktu →',s.w-s.pad,s.h-13);x.textAlign='left';`,
      },
      {
        judul: "Animasi 2 — Pengaruh Rasio Redaman terhadap Bentuk Respons",
        label: "Rasio redaman ζ", min: 0.1, max: 1.4, step: 0.05, nilai: 0.5, des: 2,
        gambar: `var s=_siskenSiapkan('siskenAnim2Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, wn=1.6, sk=_siskenSkala(s,0,10,0,1.62);
_siskenGarisDatar(x,s,sk.y(1),'#fbbf24');
_siskenKurva(x,sk,function(t){return _siskenStep2(v,wn,t)},0,10,'#67e8f9',3);
_siskenLegenda(x,[['keluaran y(t)','#67e8f9'],['setpoint','#fbbf24']],s.pad,s.atas-13);
var label=v<1?'kurang teredam, ada lonjakan':(v>1.02?'lebih teredam, lambat tanpa lonjakan':'teredam kritis');
x.font='17px JetBrains Mono';x.textAlign='right';
x.fillStyle=v<1?'#ec4899':'#5eead4';x.fillText(label,s.w-s.pad,s.atas-13);
x.fillStyle='#aebbd0';x.fillText('waktu →',s.w-s.pad,s.h-13);
x.textAlign='left';x.fillText('y(t)',s.pad,s.h-13);`,
      },
      {
        judul: "Animasi 3 — Tanggapan Frekuensi dan Lebar Pita",
        label: "Gain loop L", min: 0.5, max: 40, step: 0.5, nilai: 8, des: 1,
        gambar: `var s=_siskenSiapkan('siskenAnim3Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, tau=3.0, minDb=-42, maxDb=6;
function py(db){return s.atas+(maxDb-db)/(maxDb-minDb)*s.tinggi}
x.strokeStyle='#67e8f9';x.lineWidth=3;x.beginPath();
for(var k=0;k<700;k++){
  var lw=-2+4*k/699, om=Math.pow(10,lw);
  var mag=v/Math.sqrt(Math.pow(1+v,2)+Math.pow(om*tau,2));
  var db=20*Math.log10(Math.max(mag,1e-6));
  var pxv=s.pad+k*s.lebar/699;
  if(k===0)x.moveTo(pxv,py(db));else x.lineTo(pxv,py(db))}
x.stroke();
var db3=20*Math.log10(v/(1+v))-3;
_siskenGarisDatar(x,s,py(db3),'#fbbf24');
_siskenLegenda(x,[['magnitudo |T|','#67e8f9'],['batas -3 dB (lebar pita)','#fbbf24']],s.pad,s.atas-13);
x.font='17px JetBrains Mono';x.fillStyle='#aebbd0';
x.textAlign='right';x.fillText('frekuensi →',s.w-s.pad,s.h-13);
x.textAlign='left';x.fillText('|T| dB',s.pad,s.h-13);`,
      },
    ],
    grafikIntro: "Grafik berikut memakai parameter acuan tugas modul ini. Dua kurvanya menunjukkan bahwa menaikkan gain memperbaiki error tunak sekaligus mempercepat sistem, tetapi hanya sampai batas yang ditetapkan kestabilan dan kemampuan actuator.",
    grafik: {
      judul: "Gambar 1 — Indikator Kinerja terhadap Gain, beserta Garis Spesifikasi",
      gambar: `var s=_siskenSiapkan('siskenGrafikCanvas'+n,36,26,6); if(!s)return;
var x=s.ctx, K=2.0, tau=3.0;
var kpMin=0.5, kpMaks=25, eBatas=0.05, tsBatas=2.0;
function px(kp){return s.pad+(kp-kpMin)/(kpMaks-kpMin)*s.lebar}
function pyE(e){return s.bawah-(e/0.6)*s.tinggi}
function pyT(t){return s.bawah-(t/6.0)*s.tinggi}
x.strokeStyle='#67e8f9';x.lineWidth=3;x.beginPath();
for(var i=0;i<=200;i++){var kp=kpMin+(kpMaks-kpMin)*i/200,e=1/(1+kp*K);
  if(i===0)x.moveTo(px(kp),pyE(e));else x.lineTo(px(kp),pyE(e))}
x.stroke();
x.strokeStyle='#5eead4';x.beginPath();
for(var j=0;j<=200;j++){var kq=kpMin+(kpMaks-kpMin)*j/200,ts=4*tau/(1+kq*K);
  if(j===0)x.moveTo(px(kq),pyT(ts));else x.lineTo(px(kq),pyT(ts))}
x.stroke();
_siskenGarisDatar(x,s,pyE(eBatas),'#fbbf24');
_siskenGarisDatar(x,s,pyT(tsBatas),'#ec4899');
var kpLayak=Math.max((1/eBatas-1)/K,(4*tau/tsBatas-1)/K);
x.strokeStyle='#a78bfa';x.lineWidth=2;x.beginPath();x.moveTo(px(kpLayak),s.atas);x.lineTo(px(kpLayak),s.bawah);x.stroke();
_siskenLegenda(x,[['error tunak','#67e8f9'],['waktu menetap','#5eead4'],['batas error 5%','#fbbf24'],['batas 2 detik','#ec4899']],s.pad,s.atas-14);
x.font='17px JetBrains Mono';x.fillStyle='#c4b5fd';x.textAlign='center';
x.fillText('Kp minimum ≈ '+kpLayak.toFixed(1),Math.min(Math.max(px(kpLayak),s.pad+130),s.w-s.pad-130),s.h-13);
x.textAlign='left';x.fillStyle='#aebbd0';x.fillText('gain Kp →',s.pad,s.h-13);`,
    },
  },

  // ── Modul 9 — Analisis dan Perancangan Kontrol PID ─────────────────────────
  9: {
    intro: "PID adalah kuda beban industri: tiga suku dengan tiga tugas berbeda. Animasi berikut membedah kontribusi tiap suku, cara aksi integral menghapus error tunak, dan cara aksi derivatif meredam lonjakan.",
    panel: [
      {
        judul: "Animasi 1 — Tiga Suku PID Bekerja Bersama",
        label: "Gain integral Ki", min: 0, max: 4, step: 0.1, nilai: 1.2, des: 1,
        gambar: `var s=_siskenSiapkan('siskenAnim1Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,6,-0.4,1.8);
var dt=0.005, y=0, ie=0, eLama=1, ty=[], tp=[], ti=[], td=[];
for(var i=0;i<=1200;i++){var t=i*dt, e=1-y;
  ie+=e*dt; var de=(e-eLama)/dt; eLama=e;
  var uP=4*e, uI=v*ie, uD=0.6*de;
  ty.push([t,y]); tp.push([t,uP/6]); ti.push([t,uI/6]); td.push([t,Math.max(-0.4,Math.min(1.8,uD/6))]);
  y+=dt*((uP+uI+uD)-y);}
_siskenGarisDatar(x,s,sk.y(1),'#fbbf24');
_siskenJalur(x,sk,tp,'#fbbf24',1.8);
_siskenJalur(x,sk,ti,'#5eead4',1.8);
_siskenJalur(x,sk,td,'#ec4899',1.8);
_siskenJalur(x,sk,ty,'#67e8f9',3.2);
var idx=Math.floor((((phase||0)%1)+1)%1*(ty.length-1));
_siskenTitik(x,sk.x(ty[idx][0]),sk.y(ty[idx][1]),6,'#a78bfa');
_siskenLegenda(x,[['keluaran y','#67e8f9'],['suku P/6','#fbbf24'],['suku I/6','#5eead4'],['suku D/6','#ec4899']],s.pad,s.atas-13);
_siskenBawah(x,s,'P memikul awal, I mengambil alih beban tunak, D hanya bicara saat e berubah (Kp=4, Kd=0.6)','waktu →');`,
      },
      {
        judul: "Animasi 2 — Aksi Integral Menghapus Error Tunak",
        label: "Gain integral Ki", min: 0, max: 3, step: 0.05, nilai: 0, des: 2,
        gambar: `var s=_siskenSiapkan('siskenAnim2Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,10,0,1.35);
function sim(ki){var dt=0.005,y=0,ie=0,pts=[];
  for(var i=0;i<=2000;i++){var t=i*dt,e=1-y;ie+=e*dt;
    pts.push([t,y]);y+=dt*((3*e+ki*ie-0.4)-y);}
  return pts}
_siskenGarisDatar(x,s,sk.y(1),'#fbbf24');
var pOnly=sim(0), dgn=sim(v);
_siskenJalur(x,sk,pOnly,'rgba(103,132,168,.6)',2);
_siskenJalur(x,sk,dgn,'#67e8f9',3);
var akhir=dgn[dgn.length-1][1], celah=1-akhir;
_siskenLegenda(x,[['P saja (Kp=3)','rgba(103,132,168,.95)'],['PI dengan Ki ini','#67e8f9'],['setpoint','#fbbf24']],s.pad,s.atas-13);
_siskenBawah(x,s,'gangguan tetap −0.4 · sisa error: '+(100*celah).toFixed(1)+'%'+(celah<0.02?', lalu integral menutupnya sampai nol':', sedangkan P saja berhenti di '+(100*(1-pOnly[pOnly.length-1][1])).toFixed(0)+'%'),'waktu →',celah<0.02?'#5eead4':'#9fb2cc');`,
      },
      {
        judul: "Animasi 3 — Aksi Derivatif Meredam Lonjakan",
        label: "Gain derivatif Kd", min: 0, max: 2.5, step: 0.05, nilai: 0, des: 2,
        gambar: `var s=_siskenSiapkan('siskenAnim3Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,8,0,1.9);
function sim(kd){var dt=0.004,y=0,dy=0,pts=[],puncak=0;
  for(var i=0;i<=2000;i++){var t=i*dt,e=1-y;
    var u=8*e-kd*dy;
    pts.push([t,y]);if(y>puncak)puncak=y;
    var ddy=u-dy; dy+=dt*ddy; y+=dt*dy;}
  return {pts:pts,puncak:puncak}}
_siskenGarisDatar(x,s,sk.y(1),'#fbbf24');
var tanpa=sim(0), dgn=sim(v);
_siskenJalur(x,sk,tanpa.pts,'rgba(103,132,168,.6)',2);
_siskenJalur(x,sk,dgn.pts,'#67e8f9',3);
_siskenLegenda(x,[['tanpa D','rgba(103,132,168,.95)'],['dengan Kd ini','#67e8f9'],['setpoint','#fbbf24']],s.pad,s.atas-13);
_siskenBawah(x,s,'plant 1/(s(s+1)), Kp=8 · lonjakan: '+(100*(tanpa.puncak-1)).toFixed(0)+'% → '+(100*Math.max(0,dgn.puncak-1)).toFixed(0)+'%'+(v>1.8?', tanda Kd berlebih mulai melambatkan':''),'waktu →');`,
      },
    ],
    grafikIntro: "Peta hafalan tuning manual: arah pengaruh menaikkan tiap gain terhadap empat sifat respons. Ini pegangan awal sebelum menyetel, bukan hukum mutlak, karena interaksi antar suku tetap harus diperiksa lewat simulasi.",
    grafik: {
      judul: "Gambar 1 — Arah Pengaruh Menaikkan Kp, Ki, Kd",
      gambar: `var s=_siskenSiapkan('siskenGrafikCanvas'+n,36,26,6); if(!s)return;
var x=s.ctx;
var kolom=['Kecepatan','Lonjakan','Error tunak','Kestabilan'];
var baris=[
  ['Kp ↑',[['naik','#5eead4'],['naik','#f9a8d4'],['turun','#5eead4'],['turun','#f9a8d4']]],
  ['Ki ↑',[['naik','#5eead4'],['naik','#f9a8d4'],['HAPUS','#5eead4'],['turun','#f9a8d4']]],
  ['Kd ↑',[['~','#9fb2cc'],['turun','#5eead4'],['~','#9fb2cc'],['naik','#5eead4']]]];
var lebarSel=s.lebar/(kolom.length+1), tinggiSel=s.tinggi/(baris.length+1);
x.font='16px JetBrains Mono';x.textAlign='center';
for(var k=0;k<kolom.length;k++){
  x.fillStyle='#cfe3ff';
  x.fillText(kolom[k],s.pad+(k+1.5)*lebarSel,s.atas+tinggiSel*0.55);
}
for(var b=0;b<baris.length;b++){
  x.fillStyle='#fbbf24';x.font='bold 17px JetBrains Mono';
  x.fillText(baris[b][0],s.pad+lebarSel*0.5,s.atas+(b+1.62)*tinggiSel);
  x.font='16px JetBrains Mono';
  for(var c=0;c<4;c++){
    var sel=baris[b][1][c];
    var cx=s.pad+(c+1)*lebarSel+lebarSel*0.12, cy=s.atas+(b+1.18)*tinggiSel;
    x.fillStyle='rgba(13,59,74,.55)';
    x.fillRect(cx,cy,lebarSel*0.76,tinggiSel*0.68);
    x.fillStyle=sel[1];
    x.fillText(sel[0],cx+lebarSel*0.38,cy+tinggiSel*0.44);
  }
}
x.textAlign='left';x.font='15px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText('hijau = menguntungkan · merah muda = harga yang dibayar',s.pad,s.h-12);`,
    },
  },

  // ── Modul 10 — Aturan Mason dan Grafik Aliran Sinyal ───────────────────────
  10: {
    bantu: `function _m10Grafik(x,s,sorot){
  var oy=s.atas+s.tinggi*0.46;
  var N={R:[s.pad+30,oy],A:[s.pad+s.lebar*0.28,oy],B:[s.pad+s.lebar*0.5,oy],C:[s.pad+s.lebar*0.72,oy],Y:[s.w-s.pad-30,oy]};
  function busur(a,b,naik,warna,tebal,label){
    var p=N[a],q=N[b],cx=(p[0]+q[0])/2,cy=oy+(naik?-72:72);
    x.strokeStyle=warna;x.lineWidth=tebal;
    x.beginPath();x.moveTo(p[0],p[1]);x.quadraticCurveTo(cx,cy,q[0],q[1]);x.stroke();
    var arah=q[0]>p[0]?1:-1;
    x.fillStyle=warna;x.beginPath();
    x.moveTo(q[0]-arah*10,q[1]+(naik?-9:9));x.lineTo(q[0],q[1]);x.lineTo(q[0]-arah*16,q[1]+(naik?-1:1));x.closePath();x.fill();
    x.font='15px JetBrains Mono';x.textAlign='center';
    x.fillText(label,cx,cy+(naik?-8:20));x.textAlign='left';
  }
  function garis(a,b,warna,tebal,label){
    var p=N[a],q=N[b];
    x.strokeStyle=warna;x.lineWidth=tebal;
    x.beginPath();x.moveTo(p[0],p[1]);x.lineTo(q[0],q[1]);x.stroke();
    x.fillStyle=warna;x.beginPath();
    x.moveTo(q[0]-16,q[1]-6);x.lineTo(q[0]-2,q[1]);x.lineTo(q[0]-16,q[1]+6);x.closePath();x.fill();
    x.font='15px JetBrains Mono';x.textAlign='center';
    x.fillText(label,(p[0]+q[0])/2,oy-12);x.textAlign='left';
  }
  var redup='rgba(142,166,200,.5)';
  garis('R','A',(sorot&&sorot.jalur)?'#67e8f9':redup,2,'1');
  garis('A','B',(sorot&&(sorot.jalur===1||sorot.loop===1))?(sorot.loop===1?'#ec4899':'#67e8f9'):redup,2,'G1=2');
  garis('B','C',(sorot&&(sorot.jalur===1||sorot.loop===2))?(sorot.loop===2?'#f97316':'#67e8f9'):redup,2,'G2=3');
  garis('C','Y',(sorot&&sorot.jalur===1)?'#67e8f9':redup,2,'1');
  busur('A','Y',true,(sorot&&sorot.jalur===2)?'#5eead4':redup,2,'G3=4');
  busur('B','A',false,(sorot&&sorot.loop===1)?'#ec4899':redup,2,'-H1=-0.5');
  busur('C','B',false,(sorot&&sorot.loop===2)?'#f97316':redup,2,'-H2=-0.2');
  for(var nama in N){
    var p=N[nama];
    x.fillStyle='#0d3b4a';x.strokeStyle='#67e8f9';x.lineWidth=2;
    x.beginPath();x.arc(p[0],p[1],17,0,Math.PI*2);x.fill();x.stroke();
    x.fillStyle='#e2ecf9';x.font='bold 16px JetBrains Mono';x.textAlign='center';
    x.fillText(nama,p[0],p[1]+6);x.textAlign='left';
  }
  return N;
}`,
    intro: "Aturan Mason menghitung fungsi transfer langsung dari grafik aliran sinyal, tanpa reduksi blok bertingkat. Ketiga animasi memakai SATU contoh yang sama: kenali jalur majunya, kenali loop-nya, lalu rakit rumusnya sampai angka akhir.",
    panel: [
      {
        judul: "Animasi 1 — Dua Jalur Maju pada Grafik Aliran Sinyal",
        label: "Pilih jalur maju", min: 1, max: 2, step: 1, nilai: 1, des: 0,
        gambar: `var s=_siskenSiapkan('siskenAnim1Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, jalur=Math.round(v);
var N=_m10Grafik(x,s,{jalur:jalur});
var rute=jalur===1?[N.R,N.A,N.B,N.C,N.Y]:[N.R,N.A,N.Y];
var maju=(((phase||0)*0.9)%1)*(rute.length-1);
var seg=Math.min(Math.floor(maju),rute.length-2), f=maju-seg;
var p=rute[seg], q=rute[seg+1];
var lengkung=(jalur===2&&seg===1)?-72:0;
var bx=p[0]+(q[0]-p[0])*f, by=p[1]+(q[1]-p[1])*f+lengkung*4*f*(1-f);
_siskenTitik(x,bx,by,7,'#fbbf24');
x.font='17px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText(jalur===1?'P1 = 1·2·3·1 = 6, menyentuh SEMUA loop → Δ1 = 1':'P2 = 4 (lompatan G3), tidak menyentuh loop B–C → Δ2 = 1 − L2 = 1.6',s.pad,s.h-13);`,
      },
      {
        judul: "Animasi 2 — Loop dan Sentuhan Antar-Loop",
        label: "Pilih loop", min: 1, max: 2, step: 1, nilai: 1, des: 0,
        gambar: `var s=_siskenSiapkan('siskenAnim2Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, loop=Math.round(v);
_m10Grafik(x,s,{loop:loop});
x.font='17px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText(loop===1?'L1 = G1·(−H1) = 2·(−0.5) = −1.0, berputar lewat simpul A dan B':'L2 = G2·(−H2) = 3·(−0.2) = −0.6, berputar lewat simpul B dan C',s.pad,s.h-13);
x.fillStyle='#fde68a';x.textAlign='right';
x.fillText('L1 dan L2 sama-sama memakai simpul B → BERSENTUHAN, suku L1·L2 gugur dari Δ',s.w-s.pad,s.atas-13);
x.textAlign='left';`,
      },
      {
        judul: "Animasi 3 — Merakit Δ dan Menghitung T Langkah demi Langkah",
        label: "Langkah", min: 1, max: 4, step: 1, nilai: 1, des: 0,
        gambar: `var s=_siskenSiapkan('siskenAnim3Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, langkah=Math.round(v);
var barisRumus=[
  'Δ  = 1 − (L1 + L2) = 1 − (−1.0 − 0.6) = 2.6',
  'P1 = 6, menyentuh semua loop → Δ1 = 1',
  'P2 = 4, tak menyentuh L2 → Δ2 = 1 − (−0.6) = 1.6',
  'T  = (P1·Δ1 + P2·Δ2)/Δ = (6 + 6.4)/2.6 = 4.77'];
x.font='19px JetBrains Mono';
for(var i=0;i<barisRumus.length;i++){
  var y=s.atas+34+i*(s.tinggi-40)/4;
  if(i<langkah){
    x.fillStyle=(i===langkah-1)?'#67e8f9':'#8ea6c8';
    x.fillText(barisRumus[i],s.pad+16,y);
    if(i===langkah-1){x.fillStyle='#fbbf24';x.fillText('◀',s.pad+s.lebar-40,y);}
  }else{
    x.fillStyle='rgba(103,132,168,.25)';
    x.fillText((i+1)+'. …',s.pad+16,y);
  }
}
x.font='16px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText(langkah<4?'geser slider untuk membuka langkah berikutnya':'selesai: fungsi transfer R→Y bernilai 4.77',s.pad,s.h-13);`,
      },
    ],
    grafikIntro: "Cek silang yang wajib dilakukan: Mason dan reduksi blok bertahap adalah dua rute menuju angka yang sama. Kalau keduanya tidak bertemu, salah satu perhitungan pasti keliru, biasanya pada suku sentuhan loop-nya.",
    grafik: {
      judul: "Gambar 1 — Mason dan Reduksi Blok Memberi Hasil yang Sama",
      gambar: `var s=_siskenSiapkan('siskenGrafikCanvas'+n,36,26,6); if(!s)return;
var x=s.ctx, metode=[['Aturan Mason',4.77,'#67e8f9'],['Reduksi blok bertahap',4.77,'#5eead4']];
var lebar=s.lebar/metode.length;
for(var i=0;i<metode.length;i++){
  var tinggi=s.tinggi*metode[i][1]/6;
  var kiri=s.pad+i*lebar+lebar*0.22;
  x.fillStyle=metode[i][2];x.globalAlpha=0.78;
  x.fillRect(kiri,s.bawah-tinggi,lebar*0.56,tinggi);x.globalAlpha=1;
  x.font='19px JetBrains Mono';x.textAlign='center';
  x.fillStyle='#e2ecf9';x.fillText('T = '+metode[i][1].toFixed(2),kiri+lebar*0.28,s.bawah-tinggi-10);
  x.font='16px JetBrains Mono';x.fillStyle='#9fb2cc';
  x.fillText(metode[i][0],kiri+lebar*0.28,s.h-13);
}
x.textAlign='left';`,
    },
  },

  // ── Modul 11 — Ikhtisar Metode Kontrol Cerdas ──────────────────────────────
  11: {
    intro: "Ketika plant berubah-ubah atau sukar dimodelkan, gain tetap mulai kewalahan; di situlah keluarga kendali cerdas masuk. Animasi berikut memperlihatkan masalahnya, peta metodenya, dan satu contoh adaptasi gain daring.",
    panel: [
      {
        judul: "Animasi 1 — Plant Berubah, Gain Tetap Kewalahan",
        label: "Kekuatan ketaklinieran β", min: 0, max: 1.5, step: 0.05, nilai: 0.6, des: 2,
        gambar: `var s=_siskenSiapkan('siskenAnim1Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,8,0,1.9);
function sim(jadwalkan){
  var dt=0.004, tunda=Math.round(0.18/dt), buf=[], y=0, pts=[];
  for(var i=0;i<tunda;i++)buf.push(0);
  for(var k=0;k<=2000;k++){var t=k*dt;
    var g=1+v*Math.max(0,y);
    var kIni=jadwalkan?6/(1+v*Math.max(0,y)):6;
    buf.push(kIni*(1-y));
    var uT=buf.shift();
    pts.push([t,y]);
    y+=dt*((g*uT-y)/0.5);}
  return pts}
_siskenGarisDatar(x,s,sk.y(1),'#fbbf24');
var tetap=sim(false), cerdas=sim(true);
_siskenJalur(x,sk,tetap,'#ec4899',2.5);
_siskenJalur(x,sk,cerdas,'#67e8f9',3);
var idx=Math.floor((((phase||0)%1)+1)%1*(tetap.length-1));
_siskenTitik(x,sk.x(tetap[idx][0]),sk.y(Math.max(0,Math.min(1.9,tetap[idx][1]))),6,'#f9a8d4');
_siskenLegenda(x,[['gain tetap K=6','#ec4899'],['gain dijadwalkan','#67e8f9'],['setpoint','#fbbf24']],s.pad,s.atas-13);
_siskenBawah(x,s,'gain plant membesar bersama y (β='+v.toFixed(2)+'), sebab setelan titik kerja rendah tak berlaku di titik tinggi','waktu →');`,
      },
      {
        judul: "Animasi 2 — Peta Keluarga Metode Kendali",
        label: "Tingkat ketaklinieran masalah", min: 0, max: 10, step: 0.5, nilai: 3, des: 1,
        gambar: `var s=_siskenSiapkan('siskenAnim2Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,10,0,10);
var metode=[['PID',1.5,2,'#fbbf24'],['Fuzzy',3,6,'#5eead4'],['GA-tuning',6,7.5,'#f97316'],['Hibrid',7,8.5,'#a78bfa'],['ANN',8,9,'#ec4899']];
_siskenGarisDatar(x,s,sk.y(v),'#67e8f9');
for(var i=0;i<metode.length;i++){
  var m2=metode[i], mampu=m2[2]>=v;
  x.globalAlpha=mampu?0.95:0.3;
  _siskenTitik(x,sk.x(m2[1]),sk.y(m2[2]),15,m2[3]);
  x.font=(mampu?'bold ':'')+'16px JetBrains Mono';x.fillStyle=mampu?'#e2ecf9':'#6d7f9c';
  x.textAlign='center';x.fillText(m2[0],sk.x(m2[1]),sk.y(m2[2])-24);x.textAlign='left';
  x.globalAlpha=1;
}
var kandidat=[];
for(var j=0;j<metode.length;j++)if(metode[j][2]>=v)kandidat.push(metode[j][0]);
x.font='17px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText('jangkauan ketaklinieran ↑',s.pad,s.atas-13);
_siskenBawah(x,s,'kandidat utk tingkat ini: '+kandidat.join(', '),'kebutuhan data →');`,
      },
      {
        judul: "Animasi 3 — Adaptasi Gain Secara Daring",
        label: "Laju adaptasi γ", min: 0, max: 2, step: 0.05, nilai: 0.5, des: 2,
        gambar: `var s=_siskenSiapkan('siskenAnim3Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,12,0,1.5);
var dt=0.006, y=0, K=2, ty=[], tk=[];
for(var i=0;i<=2000;i++){var t=i*dt;
  var g=t<5?1:0.45;
  var e=1-y;
  K+=dt*v*e; K=Math.max(0.2,Math.min(9,K));
  ty.push([t,y]); tk.push([t,K/7]);
  y+=dt*(g*K*e-y);}
_siskenGarisDatar(x,s,sk.y(1),'#fbbf24');
x.setLineDash([5,5]);x.strokeStyle='#f97316';x.lineWidth=1.5;
x.beginPath();x.moveTo(sk.x(5),s.atas);x.lineTo(sk.x(5),s.bawah);x.stroke();x.setLineDash([]);
_siskenJalur(x,sk,tk,'#a78bfa',2);
_siskenJalur(x,sk,ty,'#67e8f9',3);
_siskenLegenda(x,[['keluaran y','#67e8f9'],['gain K/7 (adaptif)','#a78bfa'],['plant melemah di t=5','#f97316']],s.pad,s.atas-13);
_siskenBawah(x,s,v<0.05?'γ=0: gain diam, keluaran turun dan tak pernah pulih':'plant melemah di t=5; K dinaikkan sendiri utk menebusnya'+(v>1.4?', tanda γ terlalu besar hingga berosilasi':''),'waktu →');`,
      },
    ],
    grafikIntro: "Ringkasan empat metode yang dibedah pada Modul 12–14. Tidak ada pemenang mutlak: kolom-kolom inilah yang dipertimbangkan setiap kali memilih pendekatan untuk satu masalah nyata.",
    grafik: {
      judul: "Gambar 1 — Matriks Pemilihan Metode Kendali Cerdas",
      gambar: `var s=_siskenSiapkan('siskenGrafikCanvas'+n,36,26,6); if(!s)return;
var x=s.ctx;
var kolom=['Butuh model?','Butuh data?','Mudah ditafsir?','Beban hitung'];
var baris=[
  ['PID',[['Ya','#f9a8d4'],['Tidak','#5eead4'],['Ya','#5eead4'],['Rendah','#5eead4']]],
  ['Fuzzy',[['Tidak','#5eead4'],['Aturan pakar','#fde68a'],['Ya','#5eead4'],['Rendah','#5eead4']]],
  ['ANN',[['Tidak','#5eead4'],['Banyak','#f9a8d4'],['Tidak','#f9a8d4'],['Tinggi','#f9a8d4']]],
  ['GA',[['Simulator','#fde68a'],['Tidak','#5eead4'],['Sedang','#fde68a'],['Tinggi','#f9a8d4']]]];
var lebarSel=s.lebar/(kolom.length+1), tinggiSel=s.tinggi/(baris.length+1);
x.font='15px JetBrains Mono';x.textAlign='center';
for(var k=0;k<kolom.length;k++){
  x.fillStyle='#cfe3ff';
  x.fillText(kolom[k],s.pad+(k+1.5)*lebarSel,s.atas+tinggiSel*0.55);
}
for(var b=0;b<baris.length;b++){
  x.fillStyle='#fbbf24';x.font='bold 16px JetBrains Mono';
  x.fillText(baris[b][0],s.pad+lebarSel*0.5,s.atas+(b+1.6)*tinggiSel);
  x.font='15px JetBrains Mono';
  for(var c=0;c<4;c++){
    var sel=baris[b][1][c];
    var cx=s.pad+(c+1)*lebarSel+lebarSel*0.1, cy=s.atas+(b+1.16)*tinggiSel;
    x.fillStyle='rgba(13,59,74,.55)';
    x.fillRect(cx,cy,lebarSel*0.8,tinggiSel*0.66);
    x.fillStyle=sel[1];
    x.fillText(sel[0],cx+lebarSel*0.4,cy+tinggiSel*0.43);
  }
}
x.textAlign='left';`,
    },
  },

  // ── Modul 12 — Sistem Kontrol Artificial Neural Network ────────────────────
  12: {
    bantu: `var _m12W1=[[1.8,-1.2],[0.9,0.7],[-1.5,0.4]], _m12B1=[0,0.2,-0.2], _m12W2=[1.4,0.8,-1.1];
function _m12Maju(e,de){
  var h=[],u=0;
  for(var j=0;j<3;j++){h.push(Math.tanh(_m12W1[j][0]*e+_m12W1[j][1]*de+_m12B1[j]));u+=_m12W2[j]*h[j];}
  return {h:h,u:u};
}`,
    intro: "Jaringan saraf tiruan belajar memetakan masukan ke keluaran tanpa model eksplisit. Tiga animasi berikut membedah umpan maju pada jaringan kecil, peran fungsi aktivasi, dan proses pelatihan yang menurunkan galat, termasuk kegagalannya bila laju belajar terlalu besar.",
    panel: [
      {
        judul: "Animasi 1 — Umpan Maju pada Jaringan 2–3–1",
        label: "Masukan error e", min: -1, max: 1, step: 0.05, nilai: 0.4, des: 2,
        gambar: `var s=_siskenSiapkan('siskenAnim1Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, de=0.3, hasil=_m12Maju(v,de);
var lapis=Math.floor(((phase||0)*1.6)%3);
var X=[s.pad+s.lebar*0.14,s.pad+s.lebar*0.5,s.pad+s.lebar*0.86];
var masuk=[v,de], tengahY=s.atas+s.tinggi/2;
var posIn=[tengahY-55,tengahY+55];
var posH=[tengahY-90,tengahY,tengahY+90];
for(var j=0;j<3;j++)for(var i=0;i<2;i++){
  var w=_m12W1[j][i];
  x.strokeStyle=(lapis===0)?(w>0?'#67e8f9':'#ec4899'):'rgba(103,132,168,.35)';
  x.lineWidth=Math.min(5,Math.abs(w)*2.2);
  x.beginPath();x.moveTo(X[0]+20,posIn[i]);x.lineTo(X[1]-20,posH[j]);x.stroke();}
for(var j2=0;j2<3;j2++){
  var w2=_m12W2[j2];
  x.strokeStyle=(lapis===1)?(w2>0?'#67e8f9':'#ec4899'):'rgba(103,132,168,.35)';
  x.lineWidth=Math.min(5,Math.abs(w2)*2.2);
  x.beginPath();x.moveTo(X[1]+20,posH[j2]);x.lineTo(X[2]-20,tengahY);x.stroke();}
function simpul(px,py,nilai,label){
  var a=Math.max(-1,Math.min(1,nilai));
  x.fillStyle=a>=0?'rgba(103,232,249,'+(0.18+0.72*Math.abs(a))+')':'rgba(236,72,153,'+(0.18+0.72*Math.abs(a))+')';
  x.strokeStyle='#8ea6c8';x.lineWidth=1.5;
  x.beginPath();x.arc(px,py,20,0,Math.PI*2);x.fill();x.stroke();
  x.font='14px JetBrains Mono';x.fillStyle='#e2ecf9';x.textAlign='center';
  x.fillText(nilai.toFixed(2),px,py+5);
  if(label){x.fillStyle='#9fb2cc';x.fillText(label,px,py-30);}
  x.textAlign='left';}
simpul(X[0],posIn[0],v,'e');simpul(X[0],posIn[1],de,'de');
for(var j3=0;j3<3;j3++)simpul(X[1],posH[j3],hasil.h[j3],j3===0?'tanh':null);
simpul(X[2],tengahY,hasil.u,'u');
x.font='17px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText('lapisan aktif: '+(lapis===0?'masukan → tersembunyi':(lapis===1?'tersembunyi → keluaran':'keluaran u = '+hasil.u.toFixed(2)))+' · tebal garis = |bobot|, biru positif, merah muda negatif',s.pad,s.h-13);`,
      },
      {
        judul: "Animasi 2 — Fungsi Aktivasi: Sumber Ketaklinieran",
        label: "Kemiringan k", min: 0.5, max: 4, step: 0.1, nilai: 1, des: 1,
        gambar: `var s=_siskenSiapkan('siskenAnim2Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,-3,3,-1.25,1.25);
_siskenGarisDatar(x,s,sk.y(0),'#3b5170');
x.strokeStyle='#3b5170';x.lineWidth=1.5;
x.beginPath();x.moveTo(sk.x(0),s.atas);x.lineTo(sk.x(0),s.bawah);x.stroke();
_siskenKurva(x,sk,function(t){return Math.tanh(v*t)},-3,3,'#67e8f9',3);
_siskenKurva(x,sk,function(t){return 2/(1+Math.exp(-v*t))-1},-3,3,'#5eead4',2.5);
_siskenKurva(x,sk,function(t){return Math.max(-1.25,Math.min(1.25,Math.max(0,v*t)/2))},-3,3,'#fbbf24',2);
_siskenLegenda(x,[['tanh(kx)','#67e8f9'],['sigmoid (skala ±1)','#5eead4'],['ReLU/2','#fbbf24']],s.pad,s.atas-13);
_siskenBawah(x,s,v<1.2?'k kecil: hampir linier, jaringan berperilaku seperti gain biasa':'k besar: cepat jenuh, gradien nyaris nol, belajar melambat','masukan x →');`,
      },
      {
        judul: "Animasi 3 — Pelatihan Menurunkan Galat Jika Laju Belajar Tepat",
        label: "Laju belajar η", min: 0.02, max: 1.3, step: 0.02, nilai: 0.3, des: 2,
        gambar: `var s=_siskenSiapkan('siskenAnim3Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, data=[];
for(var i=0;i<8;i++){var xi=-1+2*i/7;data.push([xi,0.8*xi+0.15+0.06*Math.sin(9.1*i+2)])}
var w=0,b=0,riwayat=[];
for(var ep=0;ep<60;ep++){
  var gw=0,gb=0,rugi=0;
  for(var k=0;k<8;k++){var er=(w*data[k][0]+b)-data[k][1];gw+=er*data[k][0];gb+=er;rugi+=er*er}
  riwayat.push(rugi/8);
  w-=v*gw/8*2; b-=v*gb/8*2;
  if(!isFinite(w)||Math.abs(w)>1e3)break;}
var skKiri={x:function(t){return s.pad+(t+1)/2*(s.lebar*0.44)},y:function(f){return s.atas+s.tinggi/2-f*s.tinggi/2.6}};
for(var d=0;d<8;d++)_siskenTitik(x,skKiri.x(data[d][0]),skKiri.y(data[d][1]),5,'#fbbf24');
if(isFinite(w)&&Math.abs(w)<50){
  x.strokeStyle='#67e8f9';x.lineWidth=3;
  x.beginPath();x.moveTo(skKiri.x(-1),skKiri.y(-w+b));x.lineTo(skKiri.x(1),skKiri.y(w+b));x.stroke();}
var maksRugi=Math.max(0.4,Math.min(3,riwayat[0]*1.2));
var skKanan={x:function(ep2){return s.pad+s.lebar*0.54+ep2/60*(s.lebar*0.46)},y:function(r){return s.bawah-Math.min(r,maksRugi)/maksRugi*s.tinggi*0.9}};
var ptsR=[];for(var r2=0;r2<riwayat.length;r2++)ptsR.push([r2,riwayat[r2]]);
_siskenJalur(x,skKanan,ptsR,riwayat[riwayat.length-1]<riwayat[0]?'#5eead4':'#ec4899',2.5);
_siskenLegenda(x,[['data latih','#fbbf24'],['model hasil belajar','#67e8f9'],['kurva galat','#5eead4']],s.pad,s.atas-13);
x.font='17px JetBrains Mono';
var meledak=!isFinite(w)||riwayat[riwayat.length-1]>riwayat[0];
x.fillStyle=meledak?'#f9a8d4':'#9fb2cc';
x.fillText(meledak?'η terlalu besar: tiap langkah MELOMPATI lembah sehingga galat justru membesar':'60 epoch: galat '+riwayat[0].toFixed(3)+' → '+riwayat[riwayat.length-1].toFixed(4),s.pad,s.h-13);
x.textAlign='right';x.fillText('epoch →',s.w-s.pad,s.h-13);x.textAlign='left';`,
      },
    ],
    grafikIntro: "Posisi jaringan di dalam loop kendali: ANN menggantikan kotak pengendali, bukan plant. Masukannya sinyal error (dan turunannya), keluarannya sinyal kendali, yakni struktur yang sama seperti PID, isinya yang dipelajari dari data.",
    grafik: {
      judul: "Gambar 1 — Arsitektur Kendali Berbasis ANN di Dalam Loop",
      gambar: `var s=_siskenSiapkan('siskenGrafikCanvas'+n,36,26,6); if(!s)return;
var x=s.ctx, tengah=s.atas+s.tinggi*0.42;
function kotak(cx,lebar,label,warna){
  x.strokeStyle=warna;x.lineWidth=2;x.fillStyle='rgba(13,59,74,.5)';
  x.beginPath();if(x.roundRect)x.roundRect(cx-lebar/2,tengah-30,lebar,60,10);else x.rect(cx-lebar/2,tengah-30,lebar,60);
  x.fill();x.stroke();
  x.font='17px JetBrains Mono';x.textAlign='center';x.fillStyle='#e2ecf9';
  x.fillText(label,cx,tengah+6);x.textAlign='left';}
function panah(x1,x2){x.strokeStyle='#8ea6c8';x.lineWidth=2;
  x.beginPath();x.moveTo(x1,tengah);x.lineTo(x2-8,tengah);x.stroke();
  x.fillStyle='#8ea6c8';x.beginPath();x.moveTo(x2,tengah);x.lineTo(x2-11,tengah-6);x.lineTo(x2-11,tengah+6);x.closePath();x.fill();}
var jum=s.pad+s.lebar*0.12, cAnn=s.pad+s.lebar*0.38, cPlant=s.pad+s.lebar*0.68, ujung=s.w-s.pad-30;
x.strokeStyle='#8ea6c8';x.lineWidth=2;x.beginPath();x.arc(jum,tengah,15,0,Math.PI*2);x.stroke();
x.font='16px JetBrains Mono';x.fillStyle='#e2ecf9';x.fillText('+',jum-5,tengah+5);
panah(s.pad-10,jum-15);
panah(jum+15,cAnn-80);kotak(cAnn,160,'ANN 2–3–1','#67e8f9');
panah(cAnn+80,cPlant-70);kotak(cPlant,140,'Plant','#fbbf24');
panah(cPlant+70,ujung);
var yb=tengah+80;
x.strokeStyle='#f9a8d4';x.lineWidth=2;
x.beginPath();x.moveTo(ujung-16,tengah+8);x.lineTo(ujung-16,yb);x.lineTo(jum,yb);x.lineTo(jum,tengah+15);x.stroke();
x.fillStyle='#9fb2cc';x.font='15px JetBrains Mono';
x.fillText('r →',s.pad-10,tengah-10);
x.fillText('e, de',jum+22,tengah-12);
x.fillText('u',cAnn+90,tengah-12);
x.fillText('y',cPlant+80,tengah-12);
x.fillStyle='#f9a8d4';x.fillText('umpan balik',s.pad+s.lebar*0.42,yb-8);`,
    },
  },

  // ── Modul 13 — Sistem Kontrol Logika Fuzzy ─────────────────────────────────
  13: {
    bantu: `function _m13Tri(a,b,c,t){
  if(t<=a||t>=c)return 0;
  return t<b?(t-a)/(b-a):(c-t)/(c-b);
}
function _m13Mu(e,w){
  return [_m13Tri(-2*w,-w,0,Math.max(-2*w+0.001,Math.min(2*w-0.001,e))),
          _m13Tri(-w,0,w,Math.max(-2*w+0.001,Math.min(2*w-0.001,e))),
          _m13Tri(0,w,2*w,Math.max(-2*w+0.001,Math.min(2*w-0.001,e)))];
}
function _m13Agregat(mu,w,u){
  return Math.max(Math.min(mu[2],_m13Tri(-2*w,-w,0,u)),
                  Math.min(mu[1],_m13Tri(-w,0,w,u)),
                  Math.min(mu[0],_m13Tri(0,w,2*w,u)));
}
function _m13Centroid(mu,w){
  var atas=0,bawah=0;
  for(var i=0;i<=80;i++){var u=-1.2+2.4*i/80,m=_m13Agregat(mu,w,u);atas+=u*m;bawah+=m;}
  return bawah>1e-9?atas/bawah:0;
}`,
    intro: "Logika fuzzy menerjemahkan aturan kata-kata menjadi sinyal kendali kontinu. Tiga animasi berikut mengikuti satu nilai error melewati fuzzifikasi, inferensi min–maks, sampai defuzzifikasi titik berat, lalu permukaan kendali yang dihasilkannya.",
    panel: [
      {
        judul: "Animasi 1 — Fuzzifikasi: Satu Angka Menjadi Derajat Keanggotaan",
        label: "Error e", min: -1, max: 1, step: 0.02, nilai: 0.3, des: 2,
        gambar: `var s=_siskenSiapkan('siskenAnim1Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, w=0.6;
var e=(phase!==undefined&&phase>0)?(-1+2*((((phase*0.5)%1)+1)%1)):v;
var sk=_siskenSkala(s,-1.3,1.3,0,1.25);
var him=[['Negatif',-2*w,-w,0,'#ec4899'],['Nol',-w,0,w,'#5eead4'],['Positif',0,w,2*w,'#67e8f9']];
var mu=_m13Mu(e,w);
for(var i=0;i<3;i++){
  var h=him[i];
  _siskenKurva(x,sk,function(t){return _m13Tri(h[1],h[2],h[3],t)},-1.3,1.3,h[4],2.5);
  x.font='16px JetBrains Mono';x.fillStyle=h[4];x.textAlign='center';
  x.fillText(h[0],sk.x(Math.max(-1.15,Math.min(1.15,h[2]))),sk.y(1.06));x.textAlign='left';
}
x.strokeStyle='#fbbf24';x.lineWidth=2;x.setLineDash([5,5]);
x.beginPath();x.moveTo(sk.x(e),s.atas);x.lineTo(sk.x(e),s.bawah);x.stroke();x.setLineDash([]);
for(var j=0;j<3;j++){
  if(mu[j]>0.01)_siskenTitik(x,sk.x(e),sk.y(mu[j]),6,him[j][4]);
}
_siskenBawah(x,s,'e = '+e.toFixed(2)+' → μN = '+mu[0].toFixed(2)+' · μZ = '+mu[1].toFixed(2)+' · μP = '+mu[2].toFixed(2),'error e →');`,
      },
      {
        judul: "Animasi 2 — Inferensi Min–Maks: Dari Derajat ke Bentuk Keluaran",
        label: "Error e", min: -1, max: 1, step: 0.02, nilai: 0.3, des: 2,
        gambar: `var s=_siskenSiapkan('siskenAnim2Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, w=0.6, mu=_m13Mu(v,w);
var sk=_siskenSkala(s,-1.3,1.3,0,1.25);
x.fillStyle='rgba(94,234,212,.25)';x.beginPath();
x.moveTo(sk.x(-1.2),sk.y(0));
for(var i=0;i<=160;i++){var u=-1.2+2.4*i/160;x.lineTo(sk.x(u),sk.y(_m13Agregat(mu,w,u)))}
x.lineTo(sk.x(1.2),sk.y(0));x.closePath();x.fill();
var himU=[['u Negatif',-2*w,-w,0,'#ec4899',mu[2]],['u Nol',-w,0,w,'#5eead4',mu[1]],['u Positif',0,w,2*w,'#67e8f9',mu[0]]];
for(var j=0;j<3;j++){
  var h=himU[j];
  _siskenKurva(x,sk,function(t){return _m13Tri(h[1],h[2],h[3],t)},-1.3,1.3,h[4],1.5,[4,5]);
  if(h[5]>0.01)_siskenGarisDatar(x,s,sk.y(h[5]),h[4]);
}
x.font='16px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText('aturan: e Positif → u Negatif · e Nol → u Nol · e Negatif → u Positif (regulator)',s.pad,s.atas-13);
_siskenBawah(x,s,'aturan DIPOTONG di derajatnya (min), gabungan potongan (max) → bentuk teal','keluaran u →');`,
      },
      {
        judul: "Animasi 3 — Defuzzifikasi Titik Berat dan Permukaan Kendali",
        label: "Lebar himpunan w", min: 0.3, max: 0.9, step: 0.02, nilai: 0.6, des: 2,
        gambar: `var s=_siskenSiapkan('siskenAnim3Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, eContoh=0.3, mu=_m13Mu(eContoh,v);
var skKiri={x:function(u){return s.pad+(u+1.25)/2.5*(s.lebar*0.4)},y:function(f){return s.bawah-f/1.2*s.tinggi*0.95}};
x.fillStyle='rgba(94,234,212,.25)';x.beginPath();
x.moveTo(skKiri.x(-1.2),skKiri.y(0));
for(var i=0;i<=120;i++){var u=-1.2+2.4*i/120;x.lineTo(skKiri.x(u),skKiri.y(_m13Agregat(mu,v,u)))}
x.lineTo(skKiri.x(1.2),skKiri.y(0));x.closePath();x.fill();
var pusat=_m13Centroid(mu,v);
x.strokeStyle='#fbbf24';x.lineWidth=2.5;
x.beginPath();x.moveTo(skKiri.x(pusat),skKiri.y(0));x.lineTo(skKiri.x(pusat),skKiri.y(1));x.stroke();
x.font='15px JetBrains Mono';x.fillStyle='#fde68a';x.textAlign='center';
x.fillText('titik berat u* = '+pusat.toFixed(2),skKiri.x(pusat),skKiri.y(1)-8);x.textAlign='left';
var skKanan={x:function(e2){return s.pad+s.lebar*0.52+(e2+1)/2*(s.lebar*0.48)},y:function(u2){return s.atas+s.tinggi/2-u2*s.tinggi/2.4}};
var pts=[];for(var k=0;k<=80;k++){var e3=-1+2*k/80;pts.push([e3,_m13Centroid(_m13Mu(e3,v),v)])}
x.strokeStyle='#3b5170';x.lineWidth=1;
x.beginPath();x.moveTo(skKanan.x(-1),skKanan.y(0));x.lineTo(skKanan.x(1),skKanan.y(0));x.stroke();
_siskenJalur(x,skKanan,pts,'#67e8f9',3);
_siskenTitik(x,skKanan.x(eContoh),skKanan.y(pusat),6,'#fbbf24');
x.font='17px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText('kiri: bentuk gabungan utk e=0.3 · kanan: ulangi utk semua e → permukaan kendali u*(e)',s.pad,s.h-13);
_siskenLegenda(x,[['bentuk gabungan','#5eead4'],['permukaan kendali','#67e8f9'],['titik berat','#fbbf24']],s.pad,s.atas-13);`,
      },
    ],
    grafikIntro: "Permukaan kendali fuzzy dibandingkan dengan kendali linier u = −e. Kurva fuzzy melandai di ujung karena aksi kendalinya jenuh secara halus, perilaku yang pada kendali linier harus ditambahkan lewat saturator terpisah.",
    grafik: {
      judul: "Gambar 1 — Permukaan Kendali Fuzzy vs Kendali Linier",
      gambar: `var s=_siskenSiapkan('siskenGrafikCanvas'+n,36,26,6); if(!s)return;
var x=s.ctx, w=0.6, sk=_siskenSkala(s,-1,1,-1,1);
x.strokeStyle='#3b5170';x.lineWidth=1;
x.beginPath();x.moveTo(sk.x(-1),sk.y(0));x.lineTo(sk.x(1),sk.y(0));x.stroke();
x.beginPath();x.moveTo(sk.x(0),s.atas);x.lineTo(sk.x(0),s.bawah);x.stroke();
_siskenKurva(x,sk,function(e){return -e},-1,1,'rgba(251,191,36,.85)',2,[6,5]);
var pts=[];for(var k=0;k<=80;k++){var e=-1+2*k/80;pts.push([e,_m13Centroid(_m13Mu(e,w),w)])}
_siskenJalur(x,sk,pts,'#67e8f9',3);
_siskenLegenda(x,[['permukaan fuzzy','#67e8f9'],['linier u = −e','#fbbf24']],s.pad,s.atas-14);
x.font='17px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText('u ↑',s.pad,s.atas+18);
x.textAlign='right';x.fillText('error e →',s.w-s.pad,s.h-13);x.textAlign='left';`,
    },
  },

  // ── Modul 14 — Optimasi Kontrol dengan Algoritma Genetika ──────────────────
  14: {
    bantu: `function _m14Fitness(x2){
  return Math.exp(-Math.pow(x2-7,2)/4)+0.6*Math.exp(-Math.pow(x2-2.2,2)/0.8);
}
function _m14Evolusi(mutasi,generasi){
  var acak=_siskenAcak(42), pop=[];
  for(var i=0;i<16;i++)pop.push(10*acak());
  for(var g=0;g<generasi;g++){
    var baru=[];
    for(var k=0;k<16;k++){
      var a=pop[Math.floor(acak()*16)], b=pop[Math.floor(acak()*16)];
      var ortu1=_m14Fitness(a)>_m14Fitness(b)?a:b;
      var c=pop[Math.floor(acak()*16)], d=pop[Math.floor(acak()*16)];
      var ortu2=_m14Fitness(c)>_m14Fitness(d)?c:d;
      var anak=0.5*(ortu1+ortu2);
      if(acak()<mutasi)anak+=(acak()+acak()+acak()-1.5)*2.4;
      baru.push(Math.max(0,Math.min(10,anak)));
    }
    pop=baru;
  }
  return pop;
}`,
    intro: "Algoritma genetika mencari rancangan terbaik dengan meniru seleksi alam: populasi kandidat, yang unggul berkembang biak, sesekali bermutasi. Tiga animasi berikut memperlihatkan pendakian lanskap fitness, mekanisme persilangan-mutasi, dan penerapannya menyetel gain PID.",
    panel: [
      {
        judul: "Animasi 1 — Populasi Mendaki Lanskap Fitness",
        label: "Laju mutasi", min: 0, max: 0.6, step: 0.02, nilai: 0.15, des: 2,
        gambar: `var s=_siskenSiapkan('siskenAnim1Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,10,0,1.25);
var gen=Math.floor(((phase||0)*2.2)%31);
var pop=_m14Evolusi(v,gen);
_siskenKurva(x,sk,_m14Fitness,0,10,'#67e8f9',3);
var terbaik=pop[0];
for(var i=0;i<pop.length;i++){
  if(_m14Fitness(pop[i])>_m14Fitness(terbaik))terbaik=pop[i];
  _siskenTitik(x,sk.x(pop[i]),sk.y(_m14Fitness(pop[i])),5,'rgba(251,191,36,.85)');
}
_siskenTitik(x,sk.x(terbaik),sk.y(_m14Fitness(terbaik)),8,'#ec4899');
x.font='15px JetBrains Mono';x.fillStyle='#9fb2cc';x.textAlign='center';
x.fillText('puncak lokal',sk.x(2.2),sk.y(0.62)-14);
x.fillText('puncak global',sk.x(7),sk.y(1.02)-14);x.textAlign='left';
_siskenLegenda(x,[['lanskap fitness','#67e8f9'],['populasi','#fbbf24'],['terbaik','#ec4899']],s.pad,s.atas-13);
_siskenBawah(x,s,'generasi '+gen+' · fitness terbaik '+_m14Fitness(terbaik).toFixed(3)+(v<0.04?', padahal tanpa mutasi bisa macet di puncak lokal':(v>0.45?', tanda mutasi terlalu besar hingga populasi tercerai-berai':'')),'parameter x →');`,
      },
      {
        judul: "Animasi 2 — Persilangan dan Mutasi pada Kromosom",
        label: "Titik potong", min: 1, max: 11, step: 1, nilai: 6, des: 0,
        gambar: `var s=_siskenSiapkan('siskenAnim2Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx, potong=Math.round(v);
var p1='101101011010'.split(''), p2='010011100111'.split('');
var a1=p1.slice(0,potong).concat(p2.slice(potong));
var a2=p2.slice(0,potong).concat(p1.slice(potong));
var mutasiDi=9; a2[mutasiDi]=a2[mutasiDi]==='1'?'0':'1';
var lebarBit=Math.min(46,s.lebar/14), mulai=s.pad+(s.lebar-12*lebarBit)/2;
function barisBit(bits,py,label,warnaPer){
  x.font='15px JetBrains Mono';x.fillStyle='#9fb2cc';x.fillText(label,s.pad,py+19);
  for(var i=0;i<12;i++){
    x.fillStyle=warnaPer(i);
    x.fillRect(mulai+i*lebarBit,py,lebarBit-4,30);
    x.fillStyle='#06121f';x.font='bold 16px JetBrains Mono';x.textAlign='center';
    x.fillText(bits[i],mulai+i*lebarBit+(lebarBit-4)/2,py+21);x.textAlign='left';
  }
}
var y0=s.atas+8, jarak=(s.tinggi-30)/4;
barisBit(p1,y0,'Induk 1',function(){return 'rgba(103,232,249,.85)'});
barisBit(p2,y0+jarak,'Induk 2',function(){return 'rgba(94,234,212,.85)'});
barisBit(a1,y0+2.2*jarak,'Anak 1',function(i){return i<potong?'rgba(103,232,249,.85)':'rgba(94,234,212,.85)'});
barisBit(a2,y0+3.2*jarak,'Anak 2',function(i){return i===mutasiDi?'rgba(236,72,153,.95)':(i<potong?'rgba(94,234,212,.85)':'rgba(103,232,249,.85)')});
x.strokeStyle='#fbbf24';x.lineWidth=2.5;x.setLineDash([6,5]);
x.beginPath();x.moveTo(mulai+potong*lebarBit-2,y0-8);x.lineTo(mulai+potong*lebarBit-2,y0+3.2*jarak+38);x.stroke();x.setLineDash([]);
x.font='16px JetBrains Mono';x.fillStyle='#f9a8d4';
x.fillText('bit ke-'+(mutasiDi+1)+' pada Anak 2 BERMUTASI, itulah sumber keragaman di luar warisan induk',s.pad,s.h-13);`,
      },
      {
        judul: "Animasi 3 — GA Menyetel Gain PID",
        label: "Bobot penalti lonjakan", min: 0, max: 2, step: 0.1, nilai: 0.5, des: 1,
        gambar: `var s=_siskenSiapkan('siskenAnim3Canvas'+n,58,36,26); if(!s)return;
var x=s.ctx;
function nilaiRancangan(kp,ki){
  var dt=0.02,y=0,ie=0,ise=0,puncak=0;
  for(var i=0;i<=300;i++){var e=1-y;ie+=e*dt;ise+=e*e*dt;
    if(y>puncak)puncak=y;
    y+=dt*((kp*e+ki*ie)-y);}
  return ise+v*Math.max(0,puncak-1)*10+0.02;
}
var acak=_siskenAcak(7), pop=[];
for(var i0=0;i0<12;i0++)pop.push([0.5+11.5*acak(),4*acak()]);
var jejak=[], terbaik=pop[0], nilaiTerbaik=1e9;
for(var g=0;g<20;g++){
  for(var i1=0;i1<12;i1++){var c=nilaiRancangan(pop[i1][0],pop[i1][1]);
    if(c<nilaiTerbaik){nilaiTerbaik=c;terbaik=pop[i1];}}
  jejak.push(1/nilaiTerbaik);
  var baru=[];
  for(var k=0;k<12;k++){
    var a=pop[Math.floor(acak()*12)], b=pop[Math.floor(acak()*12)];
    var o1=nilaiRancangan(a[0],a[1])<nilaiRancangan(b[0],b[1])?a:b;
    var anak=[0.5*(o1[0]+terbaik[0]),0.5*(o1[1]+terbaik[1])];
    if(acak()<0.3){anak[0]+=(acak()-0.5)*3;anak[1]+=(acak()-0.5)*1.5;}
    baru.push([Math.max(0.5,Math.min(12,anak[0])),Math.max(0,Math.min(4,anak[1]))]);
  }
  pop=baru;
}
var skKiri={x:function(t){return s.pad+t/6*(s.lebar*0.44)},y:function(f){return s.bawah-f/1.6*s.tinggi*0.95}};
x.setLineDash([9,7]);x.strokeStyle='#fbbf24';x.lineWidth=2;
x.beginPath();x.moveTo(skKiri.x(0),skKiri.y(1));x.lineTo(skKiri.x(6),skKiri.y(1));x.stroke();x.setLineDash([]);
var dt2=0.02,y2=0,ie2=0,ptsY=[];
for(var i2=0;i2<=300;i2++){var e2=1-y2;ie2+=e2*dt2;ptsY.push([i2*dt2,y2]);y2+=dt2*((terbaik[0]*e2+terbaik[1]*ie2)-y2);}
_siskenJalur(x,skKiri,ptsY,'#67e8f9',3);
var maksJejak=jejak[jejak.length-1]*1.15;
var skKanan={x:function(g2){return s.pad+s.lebar*0.54+g2/19*(s.lebar*0.46)},y:function(f2){return s.bawah-f2/maksJejak*s.tinggi*0.9}};
var ptsJ=[];for(var j2=0;j2<jejak.length;j2++)ptsJ.push([j2,jejak[j2]]);
_siskenJalur(x,skKanan,ptsJ,'#5eead4',2.5);
_siskenLegenda(x,[['respons gain terbaik','#67e8f9'],['fitness terbaik per generasi','#5eead4']],s.pad,s.atas-13);
_siskenBawah(x,s,'GA memilih Kp='+terbaik[0].toFixed(1)+', Ki='+terbaik[1].toFixed(1)+'; penalti besar menghasilkan rancangan lebih kalem','generasi →');`,
      },
    ],
    grafikIntro: "Kurva konvergensi dari pendakian lanskap pada animasi pertama (mutasi 0,15): fitness terbaik menanjak cepat lalu mendatar, sedangkan rata-rata populasi mengekor di bawahnya. Jarak keduanya adalah keragaman yang tersisa.",
    grafik: {
      judul: "Gambar 1 — Kurva Konvergensi: Terbaik vs Rata-rata Populasi",
      gambar: `var s=_siskenSiapkan('siskenGrafikCanvas'+n,36,26,6); if(!s)return;
var x=s.ctx, sk=_siskenSkala(s,0,30,0,1.25);
var ptsTerbaik=[], ptsRata=[];
for(var g=0;g<=30;g++){
  var pop=_m14Evolusi(0.15,g), terbaik=0, jumlah=0;
  for(var i=0;i<pop.length;i++){var f=_m14Fitness(pop[i]);jumlah+=f;if(f>terbaik)terbaik=f;}
  ptsTerbaik.push([g,terbaik]);ptsRata.push([g,jumlah/pop.length]);
}
_siskenJalur(x,sk,ptsRata,'#fbbf24',2);
_siskenJalur(x,sk,ptsTerbaik,'#67e8f9',3);
_siskenLegenda(x,[['fitness terbaik','#67e8f9'],['rata-rata populasi','#fbbf24']],s.pad,s.atas-14);
x.font='17px JetBrains Mono';x.fillStyle='#9fb2cc';
x.fillText('fitness ↑',s.pad,s.atas+18);
x.textAlign='right';x.fillText('generasi →',s.w-s.pad,s.h-13);x.textAlign='left';`,
    },
  },
};

// ── Penjelasan tiap panel: cara membaca + arti setiap notasi variabel ────────
// Dipisah dari ANIMASI_MODUL supaya badan fungsi gambar tetap ringkas dibaca.
// Strukturnya sejajar: panel[i] menjelaskan ANIMASI_MODUL[n].panel[i], grafik
// menjelaskan grafiknya. Entri yang hilang membuat enrich GAGAL FATAL, jadi
// panel baru tidak mungkin tayang tanpa penjelasan.
export const PENJELASAN_ANIMASI = {
  2: {
    panel: [
      { apa: "Tiap kurva adalah satu percobaan rancangan dengan gain berbeda; komputer menaikkan gain langkah demi langkah sampai lonjakan menabrak batas yang Anda setel (garis merah muda). Kurva teal adalah rancangan terakhir yang masih lolos.",
        variabel: [["K", "gain controller: seberapa kuat controller mengoreksi error: makin besar makin cepat, tapi makin melonjak"], ["Mp (lonjakan)", "jarak puncak kurva di atas setpoint, dihitung % dari nilai akhir"], ["setpoint", "nilai sasaran yang ingin dicapai keluaran (garis kuning)"]] },
      { apa: "Aktuator nyata punya batas tenaga. Saat sinyal kendali (ungu) menabrak batas, ia terpotong rata, dan keluaran (cyan) naik lebih lambat dari yang diminta gain.",
        variabel: [["u", "sinyal kendali: perintah controller ke aktuator (di grafik dibagi 5 agar sekanvas)"], ["|u|maks", "batas fisik aktuator, mis. bukaan katup penuh atau arus motor maksimum"], ["y(t)", "keluaran sistem pada waktu t"]] },
      { apa: "Wilayah arsir teal adalah semua pasangan (Kp, Kd) yang memenuhi dua spesifikasi sekaligus. Geser Kp dan lihat berapa Kd minimum yang dituntutnya; titik cyan selalu menempel tepi wilayah.",
        variabel: [["Kp", "gain proporsional: koreksi sebanding besar error"], ["Kd", "gain derivatif: rem yang menahan laju perubahan"], ["1/s²", "model plant dua kali integrasi (gaya→percepatan→posisi), mis. massa yang didorong"]] },
    ],
    grafik: { apa: "Membetulkan kesalahan di tahap spesifikasi hanya mengubah dokumen; membetulkannya setelah produksi berarti menarik barang. Itulah alasan siklus simulasi dijalankan tuntas sebelum perangkat keras dibuat.",
      variabel: [["×", "biaya relatif memperbaiki kesalahan, dibanding memperbaikinya di tahap spesifikasi (1×)"]] },
  },
  3: {
    panel: [
      { apa: "Kiri: sinyal yang meluruh sambil berosilasi. Kanan: ringkasan Laplace-nya, cukup dua tanda ×. Geser a dan lihat pole berpindah; bentuk sinyal dan letak pole selalu berpasangan.",
        variabel: [["f(t)", "sinyal dalam domain waktu"], ["a", "laju peluruhan: makin besar, makin cepat sinyal mengecil"], ["pole", "akar penyebut fungsi transfer alias 'alamat' perilaku sinyal di bidang-s, ditandai ×"], ["σ", "sumbu nyata bidang-s: seberapa cepat meluruh"], ["jω", "sumbu khayal: frekuensi osilasi (di sini 4 rad/s)"]] },
      { apa: "Satu-satunya penentu nasib sinyal adalah letak pole-nya. Di kiri sumbu tegak amplitudo meluruh (stabil), di kanan meledak (tak stabil), tepat di sumbu berosilasi selamanya.",
        variabel: [["σ", "bagian nyata pole yang sedang Anda geser"], ["e^(σt)", "amplop amplitudo: menyusut bila σ negatif, tumbuh bila positif"], ["cos 3t", "osilasi 3 rad/s yang dibungkus amplop itu"]] },
      { apa: "Nilai akhir keluaran bisa dihitung tanpa menunggu kurva mendatar: substitusikan s→0 pada s·Y(s). Garis kuning (ramalan teorema) dan ujung kurva (simulasi) selalu bertemu.",
        variabel: [["G(s) = K/(s+2)", "fungsi transfer plant"], ["K", "gain plant"], ["s", "peubah Laplace"], ["y(∞)", "nilai keluaran setelah lama sekali, yakni nilai tunak"]] },
    ],
    grafik: { apa: "Tiga sinyal uji yang paling sering dipakai beserta pasangan Laplace-nya. Hampir semua pembacaan tabel transformasi pada tugas berangkat dari ketiganya.",
      variabel: [["δ(t)", "impuls: sentakan sesaat berenergi satu"], ["u(t)", "step: nilai 1 menyala dan bertahan"], ["t·u(t)", "ramp: naik linier terhadap waktu"], ["1/s, 1/s²", "pasangan Laplace-nya, karena tiap integrasi menambah satu pembagi s"]] },
  },
  4: {
    panel: [
      { apa: "Diagram blok disederhanakan dua langkah: blok seri dikalikan, lalu loop ditutup dengan G/(1+GH). Angka kanan-atas membuktikan gain ekivalen tidak pernah berubah; yang berubah hanya bentuk gambarnya.",
        variabel: [["G1, G2", "gain blok yang tersusun seri"], ["H", "gain jalur umpan balik"], ["T", "fungsi transfer ekivalen: satu blok pengganti seluruh diagram"]] },
      { apa: "Zero tidak mengubah nilai akhir, tapi menyuntikkan turunan di awal respons. Makin dekat zero ke titik asal (z₀ kecil), makin besar suntikan itu sehingga lonjakan membengkak.",
        variabel: [["z₀", "posisi zero: akar pembilang fungsi transfer"], ["y'(t)", "laju perubahan keluaran"], ["y_zero(t) = y(t) + y'(t)/z₀", "respons setelah zero ditambahkan"]] },
      { apa: "Menutup loop menggeser pole ke kiri: plant yang sama menjadi lebih cepat. Harganya terlihat di nilai akhir, sebab K/(1+K) selalu sedikit di bawah sasaran.",
        variabel: [["K", "gain loop yang Anda geser"], ["pole", "di sini −(1+K)/2: makin kiri makin cepat"], ["σ", "sumbu nyata tempat pole itu bergeser"], ["τ_tutup = 2/(1+K)", "konstanta waktu setelah loop ditutup"], ["y(∞) = K/(1+K)", "nilai akhir yang tidak pernah tepat 1"]] },
    ],
    grafik: { apa: "Blok yang sama, tiga susunan, tiga gain ekivalen. Umpan balik justru MENURUNKAN gain; itulah harga yang dibayar untuk kecepatan dan ketahanan yang dibedah di Modul 8.",
      variabel: [["seri", "gain dikalikan: G1·G2"], ["paralel", "gain dijumlahkan: G1+G2"], ["umpan balik", "G/(1+G·H) dengan G = G1·G2"]] },
  },
  5: {
    panel: [
      { apa: "Kiri: massa ditarik pegas dan ditahan peredam, bergerak mengikuti kurva di kanan. Naikkan c dan lihat osilasi memudar sampai hilang sama sekali begitu ζ melewati 1.",
        variabel: [["m", "massa (1 kg)"], ["k", "kekakuan pegas (4 N/m)"], ["c", "koefisien redaman: gesekan yang membuang energi osilasi"], ["ζ = c/4", "rasio redaman: di bawah 1 berosilasi, 1 ke atas tidak"], ["x(t)", "posisi massa terhadap waktu"]] },
      { apa: "Euler menyusuri kurva selangkah demi selangkah sebesar h. Langkah kecil menempel solusi eksak; melewati h = 2τ tiap langkah justru MEMPERBESAR galat, padahal plant-nya benar, simulasinya yang meledak.",
        variabel: [["h", "langkah waktu integrasi: jarak antar titik hitung"], ["τ", "konstanta waktu plant (1 s)"], ["|1−h/τ|", "faktor pengali galat per langkah: aman selama di bawah 1"]] },
      { apa: "Titik kuning adalah data ukur yang bernoise. Geser τ sampai kurva model menempel data; RMSE adalah jarak rata-rata model ke data, dan tugas identifikasi adalah membuatnya sekecil mungkin.",
        variabel: [["τ", "konstanta waktu model yang sedang dicoba"], ["RMSE", "akar rata-rata kuadrat galat: 0 berarti model menembus semua titik data"]] },
    ],
    grafik: { apa: "RMSE dihitung untuk semua kandidat τ sekaligus. Lembahnya jatuh di τ ≈ 2, persis nilai yang dipakai membangkitkan data. Identifikasi parameter adalah mencari lembah kurva ini.",
      variabel: [["sumbu datar", "kandidat nilai τ yang diuji"], ["sumbu tegak", "RMSE model dengan τ itu terhadap data ukur"]] },
  },
  6: {
    panel: [
      { apa: "24 kandidat gain diuji serentak: yang memenuhi batas lonjakan diberi warna teal, dan yang tercepat di antaranya disorot kuning. Beginilah komputer memilih gain: bukan menebak, melainkan menyaring.",
        variabel: [["K", "gain kandidat yang sedang diuji"], ["Mp", "lonjakan tiap kandidat, % di atas nilai akhir"], ["batas lonjakan", "spesifikasi yang Anda setel (garis merah muda)"]] },
      { apa: "Kendali digital hanya bertindak setiap Ts detik; di antaranya sinyal ditahan rata (tangga ungu). Ts kecil nyaris kontinu; Ts besar membuat kendali selalu terlambat sampai akhirnya berdering.",
        variabel: [["Ts", "periode sampling: jeda antar eksekusi kode kendali"], ["ZOH", "tahan-orde-nol: nilai u dibekukan sampai sampel berikutnya"], ["K·Ts", "indikator kasar keamanan: nyaman jauh di bawah 1, bahaya mendekati 2"]] },
      { apa: "Root locus adalah jejak pole loop tertutup saat K dinaikkan dari nol: dua pole saling mendekat di sumbu nyata, bertemu, lalu berbelok tegak; hasilnya tetap stabil, tapi mulai berosilasi.",
        variabel: [["K", "gain loop"], ["pole", "akar persamaan (s+1)(s+3)+K = 0, ditandai ×"], ["σ, jω", "sumbu nyata dan khayal bidang-s"]] },
    ],
    grafik: { apa: "Dua syarat implementasi digital dalam satu bidang: kurva merah muda plafon kestabilan, garis kuning lantai akurasi. Rancangan yang sehat memilih titik di dalam wilayah arsir.",
      variabel: [["Ts", "periode sampling"], ["K = 2/Ts", "plafon: gain di atas kurva ini membuat loop digital tak stabil"], ["K_min", "K minimum (lantai): gain di bawah garis ini menyisakan error tunak terlalu besar"]] },
  },
  7: {
    panel: [
      { apa: "Empat angka baku dibaca langsung dari satu kurva: kapan naik, kapan memuncak, seberapa jauh melewati sasaran, kapan menetap. Geser ζ dan lihat keempatnya bergerak bersama.",
        variabel: [["tr", "waktu naik: dari 10% ke 90% nilai akhir"], ["tp", "waktu mencapai puncak pertama"], ["Mp", "lonjakan: % puncak di atas nilai akhir"], ["ts", "waktu menetap: masuk dan bertahan di pita ±2%"], ["ζ", "rasio redaman yang membentuk semuanya"]] },
      { apa: "Error tunak adalah celah permanen antara garis kuning (sasaran) dan teal (nilai akhir), diukur dengan kurung merah muda. Menaikkan K menyempitkannya, tapi pada sistem tipe-0 celah itu tidak pernah tertutup.",
        variabel: [["e_ss = 1/(1+K)", "error tunak: sisa selisih setelah semuanya tenang"], ["K", "gain loop"], ["tipe-0", "sistem tanpa integrator di loop-nya, itulah sumber celah permanen ini"]] },
      { apa: "Ciri pembeda yang bisa dilihat mata: orde satu tidak pernah melewati sasarannya dan menempuh 63% jalan tepat pada t = τ; orde dua kurang teredam selalu melonjak dulu sebelum menetap.",
        variabel: [["τ", "konstanta waktu kurva orde satu"], ["63%", "nilai baku 1−e⁻¹ yang dicapai orde satu pada t = τ"], ["ζ", "rasio redaman kurva orde dua yang Anda geser"]] },
    ],
    grafik: { apa: "Lonjakan HANYA ditentukan ζ, tidak peduli cepat-lambatnya sistem. Karena itu Mp selalu dibaca lebih dulu: dari Mp diperoleh ζ, dan dari ζ indikator lain menyusul lewat rumus.",
      variabel: [["Mp = e^(−πζ/√(1−ζ²))", "rumus lonjakan sebagai fungsi redaman"], ["ζ", "rasio redaman"]] },
  },
  8: {
    panel: [
      { apa: "Menaikkan gain membuat keluaran mengejar setpoint lebih cepat sekaligus melewatinya lebih jauh. Titik merah muda menyusuri kurva ketika animasi dijalankan.",
        variabel: [["gain", "agresivitas controller yang Anda geser"], ["ζ", "rasio redaman hasil gain itu (tertulis di bawah kurva)"], ["ωn", "frekuensi alami (rad/s): tempo dasar sistem"], ["y(t)", "keluaran sistem"]] },
      { apa: "Satu parameter membentuk seluruh kurva: ζ di bawah 1 berosilasi (makin kecil makin liar), tepat 1 tercepat tanpa lonjakan, di atas 1 aman tapi lamban.",
        variabel: [["ζ", "rasio redaman: perbandingan redaman aktual terhadap redaman kritis"], ["ωn", "frekuensi alami (di sini 1,6 rad/s)"]] },
      { apa: "Kurva menunjukkan seberapa setia sistem mengikuti perintah pada tiap frekuensi: di kiri (perintah lambat) diikuti penuh, melewati garis −3 dB kesetiaannya rontok. Gain besar memperluas jangkauan itu.",
        variabel: [["L", "gain loop"], ["|T| dB", "perbandingan amplitudo keluaran/perintah dalam desibel: 0 dB berarti diikuti penuh"], ["f_bw", "lebar pita: frekuensi tempat kurva memotong −3 dB alias batas kemampuan mengikuti"]] },
    ],
    grafik: { apa: "Dua kurva kinerja dibaca bersama garis spesifikasinya: error tunak harus di bawah garis kuning, waktu menetap di bawah garis merah muda. Garis ungu menandai Kp terkecil yang memenuhi keduanya.",
      variabel: [["Kp", "gain controller pada sumbu datar"], ["e_ss", "error tunak: sisa selisih permanen terhadap sasaran"], ["t_s", "waktu menetap: lamanya sistem mencapai pita ±2%"]] },
  },
  9: {
    panel: [
      { apa: "Keluaran (cyan) adalah kerja tiga suku sekaligus: P memikul beban saat error masih besar, I mengambil alih beban tunak, dan D hanya bersuara ketika error berubah cepat.",
        variabel: [["e", "error: sasaran dikurangi keluaran"], ["Kp, Ki, Kd", "gain suku P, I, dan D"], ["suku P = Kp·e", "koreksi sebanding error saat ini"], ["suku I = Ki·∫e dt", "akumulasi seluruh error yang pernah ada"], ["suku D = Kd·de/dt", "rem terhadap laju perubahan error (ketiga suku dibagi 6 agar sekanvas)"]] },
      { apa: "Gangguan tetap menekan keluaran, dan controller P menyisakan offset permanen, sebab ia butuh error agar menghasilkan sinyal. Suku I mengakumulasi error itu terus-menerus sampai celahnya tertutup habis.",
        variabel: [["Ki", "gain integral yang Anda geser"], ["gangguan", "beban tetap −0,4 yang menekan masukan plant"], ["offset", "sisa error yang tidak akan pernah dihapus oleh P sendirian"]] },
      { apa: "Tanpa D plant ini melonjak jauh. Menaikkan Kd menambahkan rem yang menahan laju keluaran sehingga lonjakan menyusut; berlebihan sedikit, sistem berubah jadi lamban.",
        variabel: [["Kd", "gain derivatif yang Anda geser"], ["1/(s(s+1))", "plant ber-integrator: gampang melonjak"], ["Mp", "lonjakan yang sedang dipadamkan (angka di bawah kurva)"]] },
    ],
    grafik: { apa: "Peta hafalan sebelum menyetel: baris adalah gain yang dinaikkan, kolom akibatnya. Hijau menguntungkan, merah muda harga yang harus dibayar, tanda ~ pengaruh kecil.",
      variabel: [["Kp / Ki / Kd", "tiga gain PID"], ["kestabilan", "jarak sistem dari mulai berosilasi liar"]] },
  },
  10: {
    panel: [
      { apa: "Sinyal punya dua rute dari R ke Y: rute panjang melewati semua blok, dan lompatan langsung G3. Nilai satu jalur = hasil kali semua gain di sepanjang rutenya; titik kuning menyusurinya saat animasi berjalan.",
        variabel: [["P1, P2", "gain jalur maju: hasil kali gain sepanjang rute"], ["G1…G3", "gain tiap cabang grafik"], ["Δk", "determinan sisa jalur k: dihitung dari bagian grafik yang TIDAK disentuh jalur itu"]] },
      { apa: "Loop adalah rute yang kembali ke simpul asalnya lewat cabang umpan balik. Kedua loop di sini berbagi simpul B alias bersentuhan, sehingga suku hasil-kali L1·L2 gugur dari Δ.",
        variabel: [["L1, L2", "gain tiap loop (negatif karena umpan baliknya negatif)"], ["−H1, −H2", "gain cabang umpan balik"], ["bersentuhan", "dua loop berbagi minimal satu simpul"]] },
      { apa: "Rumus Mason dirakit bertahap: kumpulkan semua loop menjadi Δ, nilai tiap jalur dengan Δk-nya, jumlahkan, lalu bagi. Hasil akhirnya satu angka, yakni fungsi transfer keseluruhan.",
        variabel: [["Δ = 1 − ΣL", "determinan grafik (suku L1·L2 gugur karena kedua loop bersentuhan)"], ["Δk", "Δ yang dihitung tanpa loop yang disentuh jalur k"], ["T = ΣPkΔk / Δ", "fungsi transfer total dari R ke Y"]] },
    ],
    grafik: { apa: "Dua rute perhitungan, yakni aturan Mason dan reduksi blok bertahap, wajib bertemu di angka yang sama. Bila tidak, yang keliru hampir selalu suku sentuhan antar-loop.",
      variabel: [["T", "fungsi transfer total: 4,77 lewat kedua metode"]] },
  },
  11: {
    panel: [
      { apa: "Gain plant ikut membesar bersama titik kerja, sehingga penyetelan yang pas di titik rendah menjadi terlalu agresif di titik tinggi; kurva merah muda mulai berdering. Kurva cyan menjadwalkan gain-nya mengikuti keadaan dan tetap tenang.",
        variabel: [["β", "kekuatan ketaklinieran: seberapa cepat gain plant membesar bersama keluaran"], ["K", "gain controller: tetap 6 pada kurva merah muda"], ["gain dijadwalkan", "K dibagi faktor yang sama dengan pembesaran plant, sehingga hasil kalinya konstan"]] },
      { apa: "Peta pemilihan metode: makin ke kanan makin lapar data dan komputasi, makin ke atas makin sanggup menangani ketaklinieran. Garis cyan adalah tingkat kesulitan masalah Anda, dan kandidatnya semua metode di atas garis; pilih yang paling kiri.",
        variabel: [["sumbu datar", "kebutuhan data dan beban komputasi metode"], ["sumbu tegak", "jangkauan ketaklinieran yang mampu ditangani"]] },
      { apa: "Pada t = 5 plant kehilangan lebih dari separuh tenaganya (garis jingga). Pengendali adaptif menaikkan gain-nya sendiri (ungu) sampai keluaran pulih; γ kecil pulih lamban, γ berlebihan membuat gain ikut berosilasi.",
        variabel: [["γ", "laju adaptasi: seberapa cepat gain dikoreksi oleh error"], ["K(t)", "gain yang berubah sendiri sepanjang waktu (dibagi 7 agar sekanvas)"], ["gangguan", "gain plant anjlok dari 1 ke 0,45 pada t = 5"]] },
    ],
    grafik: { apa: "Empat metode dibaca per kolom kebutuhannya. Tidak ada juara umum: PID paling murah tapi menuntut model dan plant jinak; ANN paling sanggup tapi lapar data dan sulit dijelaskan.",
      variabel: [["butuh model?", "perlu persamaan plant sebelum merancang"], ["butuh data?", "perlu contoh pasangan masukan-keluaran"], ["mudah ditafsir?", "perilakunya dapat dijelaskan dan diaudit"], ["beban hitung", "daya komputasi saat beroperasi"]] },
  },
  12: {
    panel: [
      { apa: "Sinyal masuk dari kiri, tiap simpul tersembunyi menimbangnya dengan bobot lalu melewatkannya ke tanh, dan hasilnya dijumlah menjadi sinyal kendali. Tebal garis menunjukkan besar bobot; biru positif, merah muda negatif.",
        variabel: [["e", "error yang menjadi masukan pertama"], ["de", "laju perubahan error, masukan kedua"], ["w (bobot)", "kekuatan tiap sambungan; inilah yang dipelajari saat pelatihan"], ["tanh", "fungsi aktivasi yang memberi ketaklinieran"], ["u", "sinyal kendali keluaran jaringan"]] },
      { apa: "Tanpa fungsi aktivasi, jaringan sedalam apa pun cuma gain linier. Kemiringan k menentukan wataknya: kecil nyaris linier, besar cepat jenuh, dan di wilayah jenuh gradien nyaris nol sehingga belajar melambat.",
        variabel: [["k", "kemiringan fungsi aktivasi yang Anda geser"], ["tanh / sigmoid", "kurva jenuh halus yang mengunci keluaran di ±1"], ["ReLU", "lurus di kanan nol, mati total di kirinya"], ["jenuh", "wilayah datar tempat perubahan masukan hampir tak mengubah keluaran"]] },
      { apa: "Kiri: model belajar menempatkan garis di tengah data. Kanan: galat tiap epoch. η yang pas menurunkan galat dengan mulus; η terlalu besar membuat tiap langkah melompati lembah sehingga galat justru meledak.",
        variabel: [["η", "laju belajar: ukuran langkah koreksi bobot tiap epoch"], ["epoch", "satu putaran belajar atas seluruh data"], ["galat (loss)", "rata-rata kuadrat selisih keluaran model terhadap data"], ["w, b", "kemiringan dan geseran garis yang sedang dipelajari"]] },
    ],
    grafik: { apa: "ANN duduk di kursi pengendali, bukan menggantikan plant: masukannya error dan turunannya, keluarannya sinyal kendali. Kursinya sama dengan PID; hanya isinya yang dipelajari dari data.",
      variabel: [["r", "setpoint yang diminta"], ["e, de", "error dan laju perubahannya, masukan jaringan"], ["u", "sinyal kendali keluaran jaringan"], ["y", "keluaran plant yang diumpanbalikkan"]] },
  },
  13: {
    panel: [
      { apa: "Satu angka error boleh menjadi anggota beberapa himpunan sekaligus; itulah fuzzifikasi. Jarum kuning memotong ketiga kurva; tinggi tiap potongan adalah derajat keanggotaannya.",
        variabel: [["e", "error masukan yang sedang difuzzifikasi"], ["μ", "derajat keanggotaan 0–1: seberapa pantas e disebut anggota himpunan itu"], ["N / Z / P", "himpunan Negatif, Nol (Zero), dan Positif"]] },
      { apa: "Tiap aturan dipotong setinggi derajat pemicunya (operasi min), lalu semua potongan digabungkan (operasi max) menjadi satu bentuk teal, yakni pendapat kolektif seluruh aturan tentang u.",
        variabel: [["min", "pemotongan: aturan tidak boleh bersuara melebihi derajat pemicunya"], ["max", "penggabungan pendapat antar aturan"], ["u", "kandidat sinyal kendali pada sumbu datar"]] },
      { apa: "Bentuk gabungan diringkas menjadi satu angka lewat titik beratnya. Ulangi untuk semua nilai e, maka lahirlah kurva permukaan kendali di kanan; lebar himpunan w mengatur landai-curamnya.",
        variabel: [["u*", "keluaran akhir: titik berat (centroid) bentuk gabungan"], ["w", "lebar himpunan keanggotaan yang Anda geser"], ["permukaan kendali", "peta lengkap dari setiap e ke u*-nya"]] },
    ],
    grafik: { apa: "Dibanding garis lurus u = −e, permukaan fuzzy melandai di ujung: aksi kendalinya jenuh secara halus. Pada kendali linier, perilaku ini harus ditambahkan lewat saturator terpisah.",
      variabel: [["u*(e)", "permukaan kendali fuzzy hasil defuzzifikasi"], ["u = −e", "pembanding: kendali linier bergain 1"]] },
  },
  14: {
    panel: [
      { apa: "Titik kuning adalah kandidat rancangan; ketinggiannya adalah mutunya. Tiap generasi kandidat unggul dipilih dan disilangkan sehingga populasi merayap mendaki. Tanpa mutasi bisa macet di bukit kecil; mutasi berlebihan membubarkan pendakian.",
        variabel: [["fitness", "skor mutu kandidat: makin tinggi makin baik"], ["x", "parameter rancangan yang sedang dicari"], ["laju mutasi", "peluang seorang anak diberi perubahan acak"], ["generasi", "satu putaran seleksi → persilangan → mutasi"]] },
      { apa: "Dua induk dipotong di titik yang sama lalu ekornya dipertukarkan sehingga dua anak mewarisi campuran keduanya. Satu bit pada Anak 2 dibalik paksa (merah muda): mutasi, sumber keragaman di luar warisan induk.",
        variabel: [["kromosom", "untai bit yang menyandikan satu kandidat rancangan"], ["titik potong", "posisi pertukaran ekor antar induk (garis kuning)"], ["mutasi", "pembalikan satu bit secara acak"]] },
      { apa: "GA menyetel gain dengan menyimulasikan tiap kandidat lalu menilai responsnya. Menaikkan bobot penalti membuat lonjakan lebih mahal, maka GA bergeser memilih pasangan gain yang lebih kalem.",
        variabel: [["Kp, Ki", "pasangan gain PID yang dicari GA"], ["ISE", "integral kuadrat error: ukuran keseluruhan penyimpangan respons, makin kecil makin baik"], ["penalti lonjakan", "hukuman tambahan bila respons melewati setpoint"], ["fitness", "kebalikan total hukuman, yang dimaksimalkan GA"]] },
    ],
    grafik: { apa: "Kurva cyan (terbaik) menanjak cepat lalu mendatar; kuning (rata-rata) mengekor di bawahnya. Jarak keduanya adalah keragaman yang tersisa; begitu keduanya menempel, populasi sudah seragam dan pencarian selesai.",
      variabel: [["fitness terbaik", "skor kandidat teratas pada tiap generasi"], ["rata-rata populasi", "skor tengah seluruh kandidat, pengukur keragaman yang tersisa"]] },
  },
};
