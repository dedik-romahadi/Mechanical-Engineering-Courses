// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 5 PEMODELAN CAD — Pemodelan 3D Berbasis Sketsa
// Kanvas: cvSketsa, cvPad, cvRevolve, cvFillet (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// Tata letak: kanvas lebar menaruh gambar di kiri dan keterangan di kanan (kolom keterangan
// digeser ke kiri bila tidak muat, gambar menyesuaikan); kanvas sempit (W < _TTL_SEMPIT, ponsel)
// dipertinggi lewat _ttlKanvas(id, hSempit) dan disusun atas-bawah: judul, gambar, keterangan.
// ════════════════════════════════════════════════════════════
const _C5X='#ef4444', _C5Y='#22c55e', _C5Z='#3b82f6';
const _F5=(px,gaya)=>(gaya?gaya+' ':'')+px+"px 'JetBrains Mono',monospace";
// Proyeksi ortografis: putar sekeliling Z (azimut), lalu miringkan (elevasi); Z ke atas layar.
function _cad5P(p,az,el,sk,cx,cy){
  const a=az*Math.PI/180, e=el*Math.PI/180;
  const x1=p[0]*Math.cos(a)-p[1]*Math.sin(a), y1=p[0]*Math.sin(a)+p[1]*Math.cos(a), z1=p[2];
  return [cx+sk*x1, cy-sk*(z1*Math.cos(e)+y1*Math.sin(e))];
}
// Sumbu X/Y/Z dengan panjang masing-masing L = [Lx, Ly, Lz]. Garis digambar SEBELUM benda
// (_cad5SumbuGaris) dan label SESUDAHNYA (_cad5SumbuLabel). Panjang sumbu dipilih pemanggil agar ujungnya
// keluar dari siluet benda, lalu label ditaruh di luar ujung itu (letak = [dx, dy, perataan] per sumbu, px)
// sehingga tidak ada garis gambar yang melintasi huruf; posisi label juga dijepit ke dalam kanvas.
function _cad5SumbuGaris(ctx,az,el,sk,cx,cy,L){
  const O=_cad5P([0,0,0],az,el,sk,cx,cy);
  [[[L[0],0,0],_C5X],[[0,L[1],0],_C5Y],[[0,0,L[2]],_C5Z]].forEach(([v,w])=>{const P=_cad5P(v,az,el,sk,cx,cy); ctx.strokeStyle=w; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(O[0],O[1]); ctx.lineTo(P[0],P[1]); ctx.stroke();});
}
function _cad5SumbuLabel(ctx,az,el,sk,cx,cy,L,letak){
  const W=ctx.canvas.width, H=ctx.canvas.height;
  ctx.font="bold 10px 'JetBrains Mono',monospace";
  [[[L[0],0,0],_C5X,'X'],[[0,L[1],0],_C5Y,'Y'],[[0,0,L[2]],_C5Z,'Z']].forEach(([v,w,n],i)=>{const P=_cad5P(v,az,el,sk,cx,cy), [dx,dy,rata]=letak[i]; ctx.fillStyle=w; ctx.textAlign=rata; ctx.fillText(n,Math.min(Math.max(P[0]+dx,10),W-10),Math.min(Math.max(P[1]+dy,12),H-4));});
  ctx.textAlign='left';
}
function _cad5Poli3(ctx,pts,az,el,sk,cx,cy,isi,garis,lebar){
  const P=pts.map(p=>_cad5P(p,az,el,sk,cx,cy));
  ctx.beginPath(); P.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.closePath();
  if(isi){ctx.fillStyle=isi; ctx.fill();} ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.4; ctx.stroke();
}
// Kotak batas proyeksi sekumpulan titik dalam satuan model (sk = 1, pusat 0; y layar ke bawah).
function _cad5Kotak(pts,az,el){
  const q=pts.map(p=>_cad5P(p,az,el,1,0,0)), xs=q.map(v=>v[0]), ys=q.map(v=>v[1]);
  return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
}
// Skala dan pusat agar kotak batas kb muat (dipusatkan) di persegi [x0,y0]–[x1,y1].
function _cad5Muat(kb,x0,y0,x1,y1){
  const sk=Math.max(0.05,Math.min((x1-x0)/(kb[2]-kb[0]),(y1-y0)/(kb[3]-kb[1])));
  return {sk,cx:(x0+x1-sk*(kb[0]+kb[2]))/2,cy:(y0+y1-sk*(kb[1]+kb[3]))/2};
}
// Tata letak teks kanvas sempit (aturan _ttlTeks, per bagian): satu baris bila muat maxW; bila tidak,
// tiap bagian mendapat baris sendiri dengan SATU ukuran huruf bersama (dikecilkan sampai 85%, tidak di
// bawah 8 px) dan dipecah per kata bila masih kepanjangan. Mengembalikan {font, baris}.
function _cad5Tata(ctx,bagian,maxW){
  const f=ctx.font, utuh=bagian.join(' ');
  if(ctx.measureText(utuh).width<=maxW) return {font:f,baris:[utuh]};
  const px=parseFloat(/(\d+(?:\.\d+)?)px/.exec(f)[1]), minPx=Math.max(8,px*0.85);
  let uk=px, font=f;
  const lebar=()=>Math.max(...bagian.map(b=>ctx.measureText(b).width));
  while(lebar()>maxW&&uk>minPx){uk=Math.max(minPx,uk-0.5); font=f.replace(/\d+(?:\.\d+)?px/,uk+'px'); ctx.font=font;}
  const baris=[];
  bagian.forEach(t=>{let b=''; for(const kata of t.split(' ')){const coba=b?b+' '+kata:kata; if(b&&ctx.measureText(coba).width>maxW){baris.push(b); b=kata;} else b=coba;} if(b) baris.push(b);});
  ctx.font=f; return {font,baris};
}
// Menulis teks hasil _cad5Tata mulai baseline y; mengembalikan y baris berikutnya.
function _cad5Judul(ctx,bagian,x,y,maxW,lh){
  const t=_cad5Tata(ctx,bagian,maxW), f=ctx.font; ctx.font=t.font;
  t.baris.forEach(b=>{ctx.fillText(b,x,y); y+=lh;});
  ctx.font=f; return y;
}
// Jumlah baris yang akan ditulis _cad5Judul, tanpa menggambar (untuk menata gambar lebih dulu).
function _cad5Baris(ctx,bagian,maxW){return _cad5Tata(ctx,bagian,maxW).baris.length;}
// Blok keterangan kanvas sempit; entri [bagian, warna, px, lh, jarakAtas]. _cad5TinggiBlok memberi
// jarak baseline baris pertama ke baris terakhir (untuk meratakan blok ke bawah); _cad5TulisBlok menggambar.
function _cad5TinggiBlok(ctx,ket,maxW){
  let t=0; ket.forEach(([s,,px,lh,jarak],i)=>{ctx.font=_F5(px); t+=(i?jarak||0:0)+_cad5Baris(ctx,s,maxW)*lh;});
  return t-ket[ket.length-1][3];
}
function _cad5TulisBlok(ctx,ket,x,y,maxW){
  ket.forEach(([s,warna,px,lh,jarak],i)=>{ctx.fillStyle=warna; ctx.font=_F5(px); if(i) y+=jarak||0; y=_cad5Judul(ctx,s,x,y,maxW,lh);});
  return y;
}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Sketsa terkonstrain: derajat kebebasan turun ke nol
// ════════════════════════════════════════════════════════════
let _skFrame=0;
function toggleSketsa(){_ttlToggle('sketsa','btnSketsa',drawSketsa);}
window.toggleSketsa=toggleSketsa;
function drawSketsa(){
  const k=_ttlKanvas('cvSketsa',330); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const w=_ttlNilai('sl_sk_w',80), h=_ttlNilai('sl_sk_h',50);
  _ttlTulis('v_sk_w',w.toFixed(0)); _ttlTulis('v_sk_h',h.toFixed(0));
  const langkah=['4 garis lepas','Coincident ×4 (kotak tertutup)','Horizontal ×2, Vertical ×2','Coincident sudut ke titik asal','Distance H = w, Distance V = h'];
  const dof=[16,8,4,2,0];
  const fase=_ttlJalan('sketsa')?Math.floor((_skFrame/75)%5):4;
  // Lebar teks langkah terpanjang (dengan/tanpa tanda ✓) agar kolom DOF tidak menimpanya.
  const lebarLangkah=px=>{ctx.font=_F5(px); return Math.max(...langkah.map(s=>Math.max(ctx.measureText('✓ '+s).width,ctx.measureText('  '+s).width)));};
  let sk,ox,oy,tx,dofX,uk=11,yL,dyL;
  if(!sempit){
    // Lebar: daftar langkah di kanan (digeser ke kiri bila tidak muat); sketsa tidak melewatinya.
    const lL=lebarLangkah(11), lD=ctx.measureText('DOF 16').width;
    tx=Math.min(W*0.66,W-12-lL-14-lD); dofX=tx+lL+14; yL=H*0.22; dyL=22;
    sk=Math.max(0.05,Math.min((W*0.55)/(w+40),(H-60)/(h+40),(tx-16-W*0.08)/(w+40)));
    ox=W*0.08+20*sk; oy=H*0.5+h*sk/2;
  } else {
    // Sempit: sketsa di tengah; daftar langkah di bawahnya dengan kolom DOF rata kanan.
    ctx.font=_F5(10); const lN=ctx.measureText('16').width, maks=W-20-lN-8, l10=lebarLangkah(10);
    uk=l10<=maks?10:Math.max(8,Math.floor(20*maks/l10)/2);
    dyL=15; yL=H-10-5*dyL;
    const atas=48, bawah=yL-14;
    sk=Math.max(0.05,Math.min((W-20)/(w+40),(bawah-atas)/(h+40)));
    ox=(W-(w+40)*sk)/2+20*sk; oy=atas+(bawah-atas-(h+40)*sk)/2+(h+20)*sk;
  }
  const X=x=>ox+x*sk, Y=y=>oy-y*sk;
  ctx.strokeStyle='rgba(148,163,184,.12)'; for(let x=-20;x<=w+20;x+=10){ctx.beginPath(); ctx.moveTo(X(x),Y(-20)); ctx.lineTo(X(x),Y(h+20)); ctx.stroke();} for(let y=-20;y<=h+20;y+=10){ctx.beginPath(); ctx.moveTo(X(-20),Y(y)); ctx.lineTo(X(w+20),Y(y)); ctx.stroke();}
  ctx.strokeStyle=_C5X; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(X(-20),Y(0)); ctx.lineTo(X(w+20),Y(0)); ctx.stroke(); ctx.strokeStyle=_C5Y; ctx.beginPath(); ctx.moveTo(X(0),Y(-20)); ctx.lineTo(X(0),Y(h+20)); ctx.stroke();
  // goyangan sebanding DOF (elemen belum terkunci)
  const g=fase===4?0:(dof[fase]/16)*6*Math.sin(_skFrame/9);
  const geser=[[g,-g],[-g,g],[g,g],[-g,-g]];
  let pts=[[0,0],[w,0],[w,h],[0,h]].map((p,i)=>fase>=3?p:[p[0]+geser[i][0],p[1]+geser[i][1]]);
  if(fase===0) pts=pts.map((p,i)=>[p[0]+(i%2?4:-4)*Math.sin(_skFrame/7+i),p[1]]);
  const warna=fase===4?'#00e09e':'#e2e8f0';
  ctx.strokeStyle=warna; ctx.lineWidth=2.2;
  for(let i=0;i<4;i++){const a=pts[i],b=pts[(i+1)%4]; const putus=fase===0&&i%2? [6,4]:[]; ctx.setLineDash(putus); ctx.beginPath(); ctx.moveTo(X(a[0]),Y(a[1])); ctx.lineTo(X(b[0]),Y(b[1])); ctx.stroke();}
  ctx.setLineDash([]);
  pts.forEach(p=>{ctx.fillStyle=fase>=1?'#f59e0b':'#94a3b8'; ctx.beginPath(); ctx.arc(X(p[0]),Y(p[1]),3.5,0,Math.PI*2); ctx.fill();});
  // Dimensi H di bawah tepi bawah; dimensi V (tegak) di kanan tepi kanan, dinaikkan bila sisi itu lebih pendek
  // dari labelnya supaya ujung bawah label tetap di atas sumbu X (garis merah) dan tidak ditimpanya.
  if(fase>=4){ctx.fillStyle='#00e09e'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('H '+w,X(w/2),Y(0)+16); const lV=ctx.measureText('V '+h).width; ctx.save(); ctx.translate(X(w)+14,Math.min(Y(h/2),Y(0)-4-lV/2)); ctx.rotate(-Math.PI/2); ctx.fillText('V '+h,0,0); ctx.restore(); ctx.textAlign='left';}
  const warnaL=i=>i===fase?'#00e09e':(i<fase?'rgba(226,232,240,.8)':'rgba(148,163,184,.45)'), warnaD=i=>i===fase?'#f59e0b':'rgba(148,163,184,.5)';
  if(!sempit){
    ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
    langkah.forEach((s,i)=>{ctx.fillStyle=warnaL(i); ctx.fillText((i<=fase?'✓ ':'  ')+s,tx,yL+i*dyL); ctx.fillStyle=warnaD(i); ctx.fillText('DOF '+dof[i],dofX,yL+i*dyL);});
    ctx.fillStyle='rgba(226,232,240,.92)'; ctx.fillText(fase===4?'Fully constrained — hijau, 0 derajat kebebasan':'Under-constrained — geometri masih bisa bergeser',12,18);
  } else {
    ctx.font=_F5(uk); ctx.textAlign='right'; ctx.fillStyle='rgba(148,163,184,.6)'; ctx.fillText('DOF',W-10,yL);
    langkah.forEach((s,i)=>{const y=yL+(i+1)*dyL; ctx.textAlign='left'; ctx.fillStyle=warnaL(i); ctx.fillText((i<=fase?'✓ ':'  ')+s,10,y); ctx.textAlign='right'; ctx.fillStyle=warnaD(i); ctx.fillText(String(dof[i]),W-10,y);});
    ctx.font=_F5(11); ctx.textAlign='left'; ctx.fillStyle='rgba(226,232,240,.92)';
    _cad5Judul(ctx,fase===4?['Fully constrained —','hijau, 0 derajat kebebasan']:['Under-constrained —','geometri masih bisa bergeser'],12,18,W-24,14);
  }
  _ttlTulis('sketsaInfo','Empat garis bebas punya 16 derajat kebebasan (2 titik × 2 koordinat × 4 garis). Setiap konstrain mengurangi DOF; persegi panjang '+w+' × '+h+' terkunci penuh setelah coincident, horizontal/vertical, jangkar ke titik asal, dan dua konstrain jarak.');
  if(_ttlJalan('sketsa')){_skFrame++; requestAnimationFrame(drawSketsa);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Pad dan Pocket: balok berlubang tumbuh setinggi h
// ════════════════════════════════════════════════════════════
let _pdFrame=0;
function togglePad(){_ttlToggle('pad','btnPad',drawPad);}
window.togglePad=togglePad;
function drawPad(){
  const k=_ttlKanvas('cvPad',300); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const a=_ttlNilai('sl_pd_a',80), b=_ttlNilai('sl_pd_b',50), hM=_ttlNilai('sl_pd_h',25), d=_ttlNilai('sl_pd_d',16);
  _ttlTulis('v_pd_a',a.toFixed(0)); _ttlTulis('v_pd_b',b.toFixed(0)); _ttlTulis('v_pd_h',hM.toFixed(0)); _ttlTulis('v_pd_d',d.toFixed(0));
  const h=_ttlJalan('pad')?hM*(0.5+0.5*Math.sin(_pdFrame/40-Math.PI/2)):hM;
  const az=35, el=28, A=az*Math.PI/180, E=el*Math.PI/180;
  const V=(a*b-Math.PI*d*d/4)*h;
  const t1='V = (a·b − πd²/4)·h', t2='= '+V.toLocaleString('id-ID',{maximumFractionDigits:1})+' mm³', t3='= '+(V/1000).toFixed(3)+' cm³ → baja '+(V/1000*7.85).toFixed(1)+' g';
  // Spasi tak-terputus (\u00a0) menjaga pasangan ukuran seperti '80 × 50' tetap satu baris saat judul dipecah.
  const judulPad=hh=>['Pad '+hh.toFixed(1)+'\u00a0mm dari sketsa '+a+'\u00a0×\u00a0'+b+',','Pocket ⌀'+d+' through all'];
  // Sumbu X dan Y menjulur 12 px melewati pojok balok, sumbu Z 14 px di atas siluet balok setinggi hM
  // (tinggi terbesar selama animasi), sehingga label X/Y/Z selalu di ruang kosong di luar balok.
  const panjang=s=>[a+12/s,b+12/s,(hM*Math.cos(E)+Math.sin(E)*Math.min(b/Math.cos(A),a/Math.sin(A))+14/s)/Math.cos(E)];
  // Kotak batas balok setinggi hM dan ujung sumbu, satuan model.
  const kotak=Ls=>_cad5Kotak([[0,0,0],[a,0,0],[a,b,0],[0,b,0],[0,0,hM],[a,0,hM],[a,b,hM],[0,b,hM],[Ls[0],0,0],[0,Ls[1],0],[0,0,Ls[2]]],az,el);
  let sk,cx,cy,tx,ty,Ls,kb;
  if(!sempit){
    // Lebar: balok di kiri, rumus di kanan; skala dibatasi agar balok dan label sumbu tidak menyentuh rumus/judul.
    ctx.font=_F5(11); let lT=Math.max(ctx.measureText(t1).width,ctx.measureText(t2).width); ctx.font=_F5(10); lT=Math.max(lT,ctx.measureText(t3).width);
    tx=Math.min(W*0.68,W-12-lT); ty=H*0.35; cx=W*0.36; cy=H*0.68;
    const sk0=Math.min(W*0.55,H*1.1)/(a+b+hM)*1.1;
    sk=sk0; for(let i=0;i<3;i++){Ls=panjang(sk); kb=kotak(Ls); sk=Math.max(0.05,Math.min(sk0,(tx-26-cx)/kb[2],(cy-30)/-kb[1],(cx-16)/-kb[0]));}
  } else {
    // Sempit: judul di atas (barisnya dihitung dengan h terpanjang agar balok tidak melompat), balok di tengah, rumus di bawah.
    ctx.font=_F5(11); const nJ=_cad5Baris(ctx,judulPad(hM),W-24);
    tx=12; ty=H-50;
    sk=1; for(let i=0;i<3;i++){Ls=panjang(sk); kb=kotak(Ls); ({sk,cx,cy}=_cad5Muat(kb,18,30+14*nJ,W-24,ty-24));}
  }
  _cad5SumbuGaris(ctx,az,el,sk,cx,cy,Ls);
  const ka=[[0,0,0],[a,0,0],[a,b,0],[0,b,0]], atas=ka.map(p=>[p[0],p[1],h]);
  // sisi samping
  [[0,1],[1,2],[2,3],[3,0]].forEach(([i,j])=>_cad5Poli3(ctx,[ka[i],ka[j],atas[j],atas[i]],az,el,sk,cx,cy,'rgba(34,211,238,.10)','rgba(34,211,238,.7)',1.2));
  _cad5Poli3(ctx,atas,az,el,sk,cx,cy,'rgba(34,211,238,.22)','#22d3ee',1.8);
  // lubang (pocket) pada muka atas dan bawah
  const ling=(z)=>{const p=[]; for(let i=0;i<40;i++){const t=i/40*2*Math.PI; p.push([a/2+d/2*Math.cos(t),b/2+d/2*Math.sin(t),z]);} return p;};
  _cad5Poli3(ctx,ling(h),az,el,sk,cx,cy,'#0a101f','#f59e0b',1.4);
  // label sumbu sesudah balok: X di kanan-bawah ujungnya, Y di kiri-bawah, Z di kanan (semuanya di luar balok)
  _cad5SumbuLabel(ctx,az,el,sk,cx,cy,Ls,[[4,8,'left'],[-4,8,'right'],[5,4,'left']]);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  const judul=judulPad(h);
  if(!sempit) ctx.fillText(judul.join(' '),12,18); else _cad5Judul(ctx,judul,12,18,W-24,14);
  const lebarT=W-12-tx;
  ctx.fillStyle='#22d3ee'; _ttlTeks(ctx,t1,tx,ty,lebarT); ctx.fillStyle='#00e09e'; _ttlTeks(ctx,t2,tx,ty+20,lebarT);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; _ttlTeks(ctx,t3,tx,ty+40,lebarT);
  _ttlTulis('padInfo','Pad menebalkan penampang sketsa a·b − π·d²/4 = '+(a*b-Math.PI*d*d/4).toFixed(2)+' mm² setinggi h = '+h.toFixed(1)+' mm → V = '+V.toFixed(2)+' mm³; massa baja (ρ = 7,85 g/cm³) ≈ '+(V/1000*7.85).toFixed(1)+' g');
  if(_ttlJalan('pad')){_pdFrame++; requestAnimationFrame(drawPad);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Revolution: profil XZ diputar mengelilingi sumbu Z
// ════════════════════════════════════════════════════════════
let _rvFrame=0;
function toggleRevolve(){_ttlToggle('revolve','btnRevolve',drawRevolve);}
window.toggleRevolve=toggleRevolve;
function drawRevolve(){
  const k=_ttlKanvas('cvRevolve',360); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const ri=_ttlNilai('sl_rv_ri',12), ro=Math.max(_ttlNilai('sl_rv_ro',24),ri+2), h=_ttlNilai('sl_rv_h',36);
  _ttlTulis('v_rv_ri',ri.toFixed(0)); _ttlTulis('v_rv_ro',ro.toFixed(0)); _ttlTulis('v_rv_h',h.toFixed(0));
  const phi=_ttlJalan('revolve')?((_rvFrame*1.5)%400>360?360:(_rvFrame*1.5)%400):360;
  const az=35, el=24, A=az*Math.PI/180, E=el*Math.PI/180;
  const Vpenuh=Math.PI*(ro*ro-ri*ri)*h, V=Vpenuh*phi/360;
  // Keterangan kanan/bawah: [bagian teks (dipecah di sini bila tidak muat), warna, px, jarak baris, jarak atas].
  const ket=[[['A_profil = (r_o − r_i)·h','= '+((ro-ri)*h).toFixed(1)],'#f59e0b',11,18],
             [['V(360°) = π(r_o² − r_i²)h'],'#22d3ee',11,18],
             [['= '+Vpenuh.toLocaleString('id-ID',{maximumFractionDigits:1})+' mm³'],'#00e09e',11,18],
             [['Pappus: 2π·ȳ·A,','ȳ = (r_i + r_o)/2 = '+((ri+ro)/2).toFixed(1)],'rgba(148,163,184,.85)',10,14,2],
             [['V('+phi.toFixed(0)+'°) = '+V.toFixed(1)],'rgba(148,163,184,.85)',10,14]];
  const judulRv=p=>['Revolution '+p.toFixed(0)+'° profil ('+ri+'…'+ro+')\u00a0×\u00a0'+h,'pada XZ terhadap sumbu Z'];
  // Sumbu X dan Y menjulur sampai 12 px di luar garis siluet samping silinder, sumbu Z 14 px di atas pelek
  // atas (paling tidak 1,4·r_o seperti semula), sehingga label X/Y/Z berada di ruang kosong di luar benda.
  const panjang=s=>[Math.max(1.4*ro,(ro+12/s)/Math.cos(A)),Math.max(1.4*ro,(ro+12/s)/Math.sin(A)),Math.max(1.4*ro,h+ro*Math.tan(E)+14/(s*Math.cos(E)))];
  // Kotak batas silinder penuh (r_o, tinggi h) dan ujung sumbu, satuan model.
  const kotak=Ls=>{const t=[[Ls[0],0,0],[0,Ls[1],0],[0,0,Ls[2]]]; for(let i=0;i<24;i++){const q=i*Math.PI/12, x=ro*Math.cos(q), y=ro*Math.sin(q); t.push([x,y,0],[x,y,h]);} return _cad5Kotak(t,az,el);};
  let sk,cx,cy,tx,ty,Ls,kb;
  if(!sempit){
    let lT=0; ket.forEach(([s,,px])=>{ctx.font=_F5(px); lT=Math.max(lT,ctx.measureText(s.join(' ')).width);});
    tx=Math.min(W*0.66,W-12-lT); ty=H*0.3;
    // Skala asal dibatasi dan benda digeser seperlunya agar benda dan label sumbunya tidak keluar tepi atau menimpa judul/rumus.
    const sk0=Math.min(W*0.5,H*1.2)/(2*ro+h)*1.05;
    sk=sk0; for(let i=0;i<3;i++){Ls=panjang(sk); kb=kotak(Ls); sk=Math.max(0.05,Math.min(sk0,(H-46)/(kb[3]-kb[1]),(tx-44)/(kb[2]-kb[0])));}
    cx=Math.min(Math.max(W*0.34,18-sk*kb[0]),tx-26-sk*kb[2]);
    cy=Math.min(Math.max(H*0.62,38-sk*kb[1]),H-8-sk*kb[3]);
  } else {
    // Sempit: judul (barisnya dihitung dengan sudut 360° agar benda tidak melompat), benda, lalu keterangan rata bawah.
    ctx.font=_F5(11); const nJ=_cad5Baris(ctx,judulRv(360),W-24);
    tx=12; ty=H-12-_cad5TinggiBlok(ctx,ket,W-24);
    sk=1; for(let i=0;i<3;i++){Ls=panjang(sk); kb=kotak(Ls); ({sk,cx,cy}=_cad5Muat(kb,18,30+14*nJ,W-24,ty-24));}
  }
  _cad5SumbuGaris(ctx,az,el,sk,cx,cy,Ls);
  // profil pada bidang XZ
  const prof=[[ri,0,0],[ro,0,0],[ro,0,h],[ri,0,h]];
  const n=Math.max(2,Math.round(phi/6));
  const rot=(p,t)=>[p[0]*Math.cos(t),p[0]*Math.sin(t),p[2]];
  for(let i=0;i<n;i++){const t0=i/n*phi*Math.PI/180, t1=(i+1)/n*phi*Math.PI/180;
    _cad5Poli3(ctx,[rot(prof[1],t0),rot(prof[1],t1),rot(prof[2],t1),rot(prof[2],t0)],az,el,sk,cx,cy,'rgba(34,211,238,.10)','rgba(34,211,238,.35)',0.8);
    _cad5Poli3(ctx,[rot(prof[2],t0),rot(prof[2],t1),rot(prof[3],t1),rot(prof[3],t0)],az,el,sk,cx,cy,'rgba(34,211,238,.18)','rgba(34,211,238,.35)',0.8);
  }
  _cad5Poli3(ctx,prof,az,el,sk,cx,cy,'rgba(245,158,11,.25)','#f59e0b',2);
  const tEnd=phi*Math.PI/180; _cad5Poli3(ctx,prof.map(p=>rot(p,tEnd)),az,el,sk,cx,cy,'rgba(245,158,11,.15)','#f59e0b',1.4);
  // label sumbu sesudah benda: X di kanan ujungnya, Y di kiri, Z di kanan (semuanya di luar siluet)
  _cad5SumbuLabel(ctx,az,el,sk,cx,cy,Ls,[[5,4,'left'],[-5,4,'right'],[5,4,'left']]);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  const judul=judulRv(phi);
  if(!sempit){
    ctx.fillText(judul.join(' '),12,18);
    const dy=[0,22,42,64,84]; ket.forEach(([s,warna,px],i)=>{ctx.fillStyle=warna; ctx.font=_F5(px); ctx.fillText(s.join(' '),tx,ty+dy[i]);});
  } else {
    _cad5Judul(ctx,judul,12,18,W-24,14);
    _cad5TulisBlok(ctx,ket,tx,ty,W-24);
  }
  _ttlTulis('revolveInfo','Bus berongga r_i = '+ri+', r_o = '+ro+', h = '+h+': V = π·('+ro+'² − '+ri+'²)·'+h+' = '+Vpenuh.toFixed(2)+' mm³; sama dengan teorema Pappus 2π × '+((ri+ro)/2).toFixed(2)+' × '+((ro-ri)*h).toFixed(1)+' = '+(2*Math.PI*(ri+ro)/2*(ro-ri)*h).toFixed(2));
  if(_ttlJalan('revolve')){_rvFrame++; requestAnimationFrame(drawRevolve);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Fillet dan Chamfer: penampang yang hilang di sudut
// ════════════════════════════════════════════════════════════
let _flFrame=0;
function toggleFillet(){_ttlToggle('fillet','btnFillet',drawFillet);}
window.toggleFillet=toggleFillet;
function drawFillet(){
  const k=_ttlKanvas('cvFillet',320); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const a=_ttlNilai('sl_fl_a',80), b=_ttlNilai('sl_fl_b',50), fM=Math.min(_ttlNilai('sl_fl_f',10),Math.min(a,b)/2-1), mode=Math.round(_ttlNilai('sl_fl_mode',0));
  _ttlTulis('v_fl_a',a.toFixed(0)); _ttlTulis('v_fl_b',b.toFixed(0)); _ttlTulis('v_fl_f',fM.toFixed(0)); _ttlTulis('v_fl_mode',mode?'chamfer':'fillet');
  const f=_ttlJalan('fillet')?fM*(0.5+0.5*Math.sin(_flFrame/40)):fM;
  const hilang=mode===0?(4-Math.PI)*f*f:2*f*f, luas=a*b-hilang, nama=mode?'Chamfer':'Fillet';
  // Keterangan kanan/bawah: [bagian teks (dipecah di sini bila tidak muat), warna, px, jarak baris, jarak atas].
  const ket=[[[nama+' empat rusuk vertikal'],'rgba(226,232,240,.92)',11,17],
             [mode?['hilang = 4·(f²/2) = 2f²']:['hilang = 4·(1 − π/4)·f²','= (4 − π)f²'],'#ef4444',11,17],
             [['= '+hilang.toFixed(2)+' mm²'],'#ef4444',11,17],
             [['penampang = '+luas.toFixed(2)+' mm²'],'#00e09e',11,17,4],
             [['× tinggi Pad = volume solid'],'rgba(148,163,184,.85)',10,14]];
  const judulFl=ff=>['Penampang balok '+a+'\u00a0×\u00a0'+b+' setelah',nama+' '+ff.toFixed(1)+'\u00a0mm pada rusuk vertikal'];
  ctx.font=_F5(10); const lLab=ctx.measureText((mode?'C':'R')+fM.toFixed(1)).width;
  let sk,ox,oy,tx,ty;
  if(!sempit){
    let lT=0; ket.forEach(([s,,px])=>{ctx.font=_F5(px); lT=Math.max(lT,ctx.measureText(s.join(' ')).width);});
    tx=Math.min(W*0.66,W-12-lT); ty=H*0.28;
    sk=Math.max(0.05,Math.min((W*0.55)/(a+20),(H-56)/(b+20),(tx-20-lLab-W*0.06)/a));
    ox=W*0.06; oy=H*0.5+b*sk/2;
  } else {
    // Sempit: judul (barisnya dihitung dengan f terbesar), penampang di tengah dengan tempat label R/C
    // di kanan dan di atasnya, lalu keterangan rata bawah.
    ctx.font=_F5(11); const nJ=_cad5Baris(ctx,judulFl(fM),W-24);
    tx=12; ty=H-12-_cad5TinggiBlok(ctx,ket,W-24);
    const atas=28+14*nJ, bawah=ty-24;
    sk=Math.max(0.05,Math.min((W-24-lLab-6)/a,(bawah-atas)/b));
    ox=(W-lLab-6-a*sk)/2; oy=atas+(bawah-atas+b*sk)/2;
  }
  const X=x=>ox+x*sk, Y=y=>oy-y*sk;
  // penampang asli (putus)
  ctx.strokeStyle='rgba(148,163,184,.4)'; ctx.setLineDash([5,4]); ctx.lineWidth=1; ctx.strokeRect(X(0),Y(b),a*sk,b*sk); ctx.setLineDash([]);
  ctx.fillStyle='rgba(34,211,238,.16)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.beginPath();
  if(mode===0){ctx.moveTo(X(f),Y(0)); ctx.lineTo(X(a-f),Y(0)); ctx.arc(X(a-f),Y(f),f*sk,Math.PI/2,0,true); ctx.lineTo(X(a),Y(b-f)); ctx.arc(X(a-f),Y(b-f),f*sk,0,-Math.PI/2,true); ctx.lineTo(X(f),Y(b)); ctx.arc(X(f),Y(b-f),f*sk,-Math.PI/2,-Math.PI,true); ctx.lineTo(X(0),Y(f)); ctx.arc(X(f),Y(f),f*sk,Math.PI,Math.PI/2,true);}
  else {[[f,0],[a-f,0],[a,f],[a,b-f],[a-f,b],[f,b],[0,b-f],[0,f]].forEach((p,i)=>i?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1])));}
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // sudut yang hilang disorot
  ctx.fillStyle='rgba(239,68,68,.35)';
  // Tiap sudut: pojok → titik singgung di tepi mendatar → busur fillet (seperempat lingkaran yang
  // menghadap pojok) → titik singgung di tepi tegak. Dulu keempat sudut memakai sudut busur yang
  // sama, sehingga hanya sudut kanan bawah yang benar dan sudut lain tergambar sebagai bulatan.
  [[0,0,1,1],[a,0,-1,1],[a,b,-1,-1],[0,b,1,-1]].forEach(([px,py,sx,sy])=>{ctx.beginPath(); ctx.moveTo(X(px),Y(py)); ctx.lineTo(X(px+sx*f),Y(py));
    if(mode===0){const a1=sy>0?Math.PI/2:-Math.PI/2, a2=sx>0?Math.PI:0; let d=a2-a1; while(d>Math.PI) d-=2*Math.PI; while(d<=-Math.PI) d+=2*Math.PI; ctx.arc(X(px+sx*f),Y(py+sy*f),f*sk,a1,a2,d<0);}
    ctx.lineTo(X(px),Y(py+sy*f)); ctx.closePath(); ctx.fill();});
  // Label R/C di ruang kosong di luar pojok kanan atas penampang asli (bukan di atas konturnya), dengan garis
  // penunjuk dari titik tengah busur fillet / sisi chamfer yang berhenti 2 px sebelum pojok, jauh dari huruf.
  const tgh=mode?[X(a-f/2),Y(b-f/2)]:[X(a-f)+f*sk*Math.SQRT1_2,Y(b-f)-f*sk*Math.SQRT1_2];
  _ttlGaris(ctx,tgh[0],tgh[1],X(a)+2,Y(b)-2,'rgba(245,158,11,.75)',1);
  ctx.fillStyle='#f59e0b'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='left'; ctx.fillText((mode?'C':'R')+f.toFixed(1),Math.min(X(a)+5,W-4-lLab),Y(b)-5);
  const judul=judulFl(f);
  if(!sempit){
    const dy=[0,22,42,70,90]; ket.forEach(([s,warna,px],i)=>{ctx.fillStyle=warna; ctx.font=_F5(px); ctx.fillText(s.join(' '),tx,ty+dy[i]);});
    ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font=_F5(11); ctx.fillText(judul.join(' '),12,18);
  } else {
    _cad5TulisBlok(ctx,ket,tx,ty,W-24);
    ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font=_F5(11); _cad5Judul(ctx,judul,12,18,W-24,14);
  }
  // Info mengikuti mode: chamfer membuang 2f² (empat segitiga siku f²/2), sedangkan rumus Tugas 4 memakai fillet.
  _ttlTulis('filletInfo',mode
    ?'Chamfer f = '+f.toFixed(2)+' mm pada empat rusuk vertikal membuang '+hilang.toFixed(2)+' mm² (empat segitiga siku f²/2 = 2f²) dari penampang '+(a*b)+' mm²; setiap mm tinggi Pad kehilangan volume sebesar itu. Tugas 4 memakai fillet, jadi sukunya (4 − π)·f², bukan 2f²'
    :'Fillet f = '+f.toFixed(2)+' mm pada empat rusuk vertikal membuang '+hilang.toFixed(2)+' mm² dari penampang '+(a*b)+' mm²; setiap mm tinggi Pad kehilangan volume sebesar itu — itulah suku (4 − π)·f² pada rumus Tugas 4');
  if(_ttlJalan('fillet')){_flFrame++; requestAnimationFrame(drawFillet);}
}

_TTL_DAFTAR.push(['cvSketsa',()=>drawSketsa(),'sketsa',['sl_sk_w','sl_sk_h']]);
_TTL_DAFTAR.push(['cvPad',()=>drawPad(),'pad',['sl_pd_a','sl_pd_b','sl_pd_h','sl_pd_d']]);
_TTL_DAFTAR.push(['cvRevolve',()=>drawRevolve(),'revolve',['sl_rv_ri','sl_rv_ro','sl_rv_h']]);
_TTL_DAFTAR.push(['cvFillet',()=>drawFillet(),'fillet',['sl_fl_a','sl_fl_b','sl_fl_f','sl_fl_mode']]);
_ttlMulai();
