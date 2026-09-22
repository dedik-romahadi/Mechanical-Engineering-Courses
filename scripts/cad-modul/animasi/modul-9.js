// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 9 PEMODELAN CAD — Evaluasi Hasil Simulasi dan Analisis Kekuatan
// Kanvas: cvKonturVM, cvKonvergensi, cvKtLubang, cvTekuk (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// Kanvas sempit (W < _TTL_SEMPIT, ponsel) memakai tata letak bertumpuk yang lebih tinggi;
// kanvas lebar mempertahankan tata letak desktop. Teks panjang ditulis lewat _ttlTeks.
// ════════════════════════════════════════════════════════════
const _C9E=210000, _C9SY=250, _C9F="'JetBrains Mono',monospace";
// Skala kontur FEM: biru → cyan → hijau → kuning → merah untuk v = 0…1.
function _cad9Warna(v){
  const s=[[0,[59,130,246]],[0.25,[34,211,238]],[0.5,[34,197,94]],[0.75,[245,158,11]],[1,[239,68,68]]];
  v=Math.max(0,Math.min(1,v));
  for(let i=0;i<4;i++){const [a,ca]=s[i],[b,cb]=s[i+1]; if(v<=b){const f=(v-a)/(b-a); return 'rgb('+ca.map((c,k)=>Math.round(c+(cb[k]-c)*f)).join(',')+')';}}
  return 'rgb(239,68,68)';
}
function _cad9Legenda(ctx,x,y,h,teksMaks,teksMin){
  for(let i=0;i<h;i++){ctx.fillStyle=_cad9Warna(1-i/h); ctx.fillRect(x,y+i,10,1.2);}
  ctx.strokeStyle='rgba(226,232,240,.5)'; ctx.lineWidth=1; ctx.strokeRect(x,y,10,h);
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.font="10px "+_C9F; ctx.textAlign='left';
  ctx.fillText(teksMaks,x+16,y+8); ctx.fillText(teksMin,x+16,y+h);
}
// Legenda mendatar untuk ponsel: min di kiri, maks di kanan, label di bawah batang.
function _cad9LegendaDatar(ctx,x,y,w,teksMin,teksMaks){
  for(let i=0;i<w;i++){ctx.fillStyle=_cad9Warna(i/w); ctx.fillRect(x+i,y,1.2,10);}
  ctx.strokeStyle='rgba(226,232,240,.5)'; ctx.lineWidth=1; ctx.strokeRect(x,y,w,10);
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.font="10px "+_C9F;
  ctx.textAlign='left'; ctx.fillText(teksMin,x,y+24); ctx.textAlign='right'; ctx.fillText(teksMaks,x+w,y+24); ctx.textAlign='left';
}
function _cad9Dinding(ctx,x,y0,y1){
  ctx.strokeStyle='rgba(148,163,184,.8)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x,y0); ctx.lineTo(x,y1); ctx.stroke();
  ctx.lineWidth=1; for(let y=y0;y<y1;y+=8){ctx.beginPath(); ctx.moveTo(x,y+8); ctx.lineTo(x-8,y); ctx.stroke();}
}
function _cad9Panah(ctx,x1,y1,x2,y2,warna,lebar){
  const a=Math.atan2(y2-y1,x2-x1), bx=x2-9*Math.cos(a), by=y2-9*Math.sin(a);
  ctx.strokeStyle=warna; ctx.lineWidth=lebar||2; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(bx,by); ctx.stroke();
  ctx.fillStyle=warna; ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(bx+4.5*Math.sin(a),by-4.5*Math.cos(a)); ctx.lineTo(bx-4.5*Math.sin(a),by+4.5*Math.cos(a)); ctx.closePath(); ctx.fill();
}
// Sekolom baris [teks, warna, font, dy] mulai y (dy = jarak baku dari y). Tiap baris lewat _ttlTeks
// (dikecilkan, lalu dipecah bila masih tidak muat maxW); baris yang dipecah menggeser baris
// sesudahnya ke bawah. Bila semuanya muat, hasilnya sama dengan fillText biasa. Kembali: y berikutnya.
function _cad9Kolom(ctx,x,y,maxW,baris){
  let geser=0, akhir=y;
  for(const [teks,warna,font,dy] of baris){
    const lh=Math.round(parseFloat(/(\d+(?:\.\d+)?)px/.exec(font)[1])*1.3), yy=y+dy+geser;
    ctx.fillStyle=warna; ctx.font=font; akhir=_ttlTeks(ctx,teks,x,yy,maxW,{lh}); geser+=akhir-(yy+lh);
  }
  return akhir;
}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Kontur von Mises kantilever berbeban ujung
// ════════════════════════════════════════════════════════════
let _c9vmFrame=0;
function toggleKonturVM(){_ttlToggle('konturvm','btnKonturVM',drawKonturVM);}
window.toggleKonturVM=toggleKonturVM;
function drawKonturVM(){
  const k=_ttlKanvas('cvKonturVM',330); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT, f10="10px "+_C9F, f11="11px "+_C9F;
  const F=_ttlNilai('sl_vm_F',500), L=_ttlNilai('sl_vm_L',200), h=_ttlNilai('sl_vm_h',20), b=20;
  _ttlTulis('v_vm_F',F.toFixed(0)); _ttlTulis('v_vm_L',L.toFixed(0)); _ttlTulis('v_vm_h',h.toFixed(0));
  const lam=_ttlJalan('konturvm')?0.5+0.5*Math.sin(_c9vmFrame/45-Math.PI/2):1;
  const I=b*h*h*h/12, sigMaks=6*F*L/(b*h*h), delta=F*L*L*L/(3*_C9E*I);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font=f11; ctx.textAlign='left';
  const yJ=_ttlTeks(ctx,'Kantilever '+L+' × '+b+' × '+h+' mm, beban\u00a0ujung\u00a0berdenyut\u00a00\u00a0→\u00a0F',12,18,W-24,{lh:14});
  // Ponsel: balok selebar kanvas (tinggi gambar ≤ 44 px) di bawah judul; legenda mendatar,
  // rumus, dan keterangan warna bertumpuk di bawahnya.
  const x0=sempit?24:W*0.08, bw=sempit?W-x0-18:W*0.52, yc=sempit?yJ+70:H*0.42;
  const sk=Math.min(bw/L,(sempit?44:H*0.45)/h), bl=L*sk, bh=Math.max(h*sk,sempit?12:16), y0=yc-bh/2;
  const nx=48, nz=12;
  for(let i=0;i<nx;i++) for(let j=0;j<nz;j++){
    const xm=(i+0.5)/nx, ym=Math.abs((j+0.5)/nz-0.5)*2, v=lam*(1-xm)*ym;
    ctx.fillStyle=_cad9Warna(v); ctx.fillRect(x0+bl*i/nx,y0+bh*j/nz,bl/nx+0.5,bh/nz+0.5);
  }
  ctx.strokeStyle='rgba(226,232,240,.8)'; ctx.lineWidth=1.2; ctx.strokeRect(x0,y0,bl,bh);
  _cad9Dinding(ctx,x0,y0-10,y0+bh+10);
  ctx.setLineDash([6,3]); ctx.strokeStyle='rgba(226,232,240,.6)'; ctx.lineWidth=.8; ctx.beginPath(); ctx.moveTo(x0,y0+bh/2); ctx.lineTo(x0+bl,y0+bh/2); ctx.stroke(); ctx.setLineDash([]);
  // beban dan lendutan (visual); panjang panah dibatasi agar pangkalnya tidak menembus judul
  const pj=Math.max(6,Math.min(sempit?12+28*lam:16+40*lam,y0-4-(sempit?yJ-6:28)));
  _cad9Panah(ctx,x0+bl,y0-pj-4,x0+bl,y0-3,'#ef4444',2.2);
  // Label F di kiri panah dan label δ di bawah ujung balok: di kanan balok keduanya tertimpa legenda.
  ctx.fillStyle='#ef4444'; ctx.font="bold 11px "+_C9F; ctx.textAlign='right'; ctx.fillText('F = '+(lam*F).toFixed(0)+' N',x0+bl-8,Math.min(y0-pj/2+4,y0-4));
  ctx.strokeStyle='rgba(0,224,158,.8)'; ctx.lineWidth=1.6; ctx.setLineDash([3,3]); ctx.beginPath();
  const dv=Math.min(sempit?24:40,delta*lam*sk*12); for(let i=0;i<=30;i++){const u=i/30; const y=y0+bh/2+dv*u*u*(3-u)/2; i?ctx.lineTo(x0+bl*u,y):ctx.moveTo(x0,y);} ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='rgba(0,224,158,.9)'; ctx.font=f10; ctx.fillText('δ (diperbesar)',x0+bl,Math.max(y0+bh,y0+bh/2+dv)+13); ctx.textAlign='left';
  const teksMaks=(lam*sigMaks).toFixed(1)+' MPa (maks)';
  let tx,ty;
  if(sempit){const yL=yc+52; _cad9LegendaDatar(ctx,12,yL,W-24,'0 (min)',teksMaks); tx=12; ty=yL+46;}
  else {_cad9Legenda(ctx,W*0.66,H*0.16,H*0.42,teksMaks,'0 (min)'); tx=W*0.66; ty=H*0.66;}
  const yK=_cad9Kolom(ctx,tx,ty,W-tx-(sempit?12:6),[
    ['σ_maks = 6FL/(bh²)','#22d3ee',f11,0],
    ['= '+sigMaks.toFixed(2)+' MPa','#00e09e',f11,sempit?16:18],
    ['δ = FL³/(3EI) = '+delta.toFixed(3)+' mm','#f59e0b',f11,sempit?34:40],
    ['SF = 250/σ_maks = '+(_C9SY/sigMaks).toFixed(2)+(sigMaks>=_C9SY?' → luluh!':''),sigMaks<_C9SY?'rgba(148,163,184,.85)':'#ef4444',f10,sempit?52:60]]);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font=f10; ctx.textAlign='left';
  if(sempit) _ttlTeks(ctx,'biru = sumbu netral dan ujung bebas',12,_ttlTeks(ctx,'merah = serat terluar jepitan\u00a0(σ_maks)',12,yK+10,W-24,{lh:13}),W-24,{lh:13});
  else _ttlTeks(ctx,'merah = serat terluar jepitan (σ_maks) · biru = sumbu netral dan ujung bebas',12,H-14,W-24,{lh:13});
  _ttlTulis('infoKonturVM','I = '+b+'·'+h+'³/12 = '+I.toFixed(1)+' mm⁴; σ_maks = 6·'+F+'·'+L+'/('+b+'·'+h+'²) = '+sigMaks.toFixed(3)+' MPa di serat terluar jepitan (von Mises FEM ≈ nilai ini pada jarak ≥ h dari rusuk Fixed); δ = '+delta.toFixed(4)+' mm; SF luluh S235 = '+(_C9SY/sigMaks).toFixed(3));
  if(_ttlJalan('konturvm')){_c9vmFrame++; requestAnimationFrame(drawKonturVM);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Konvergensi mesh: σ_maks terhadap jumlah elemen
// ════════════════════════════════════════════════════════════
let _c9kvFrame=0;
const _C9SIG_EX=53.83;   // σ_maks analitis pelat berlubang contoh (Kt·σ_nom)
function toggleKonvergensi(){_ttlToggle('konvergensi','btnKonvergensi',drawKonvergensi);}
window.toggleKonvergensi=toggleKonvergensi;
function drawKonvergensi(){
  const k=_ttlKanvas('cvKonvergensi',362); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT, f10="10px "+_C9F, f11="11px "+_C9F;
  const tingkat=Math.round(_ttlNilai('sl_kv_tingkat',5)), p=_ttlNilai('sl_kv_orde',1.2);
  _ttlTulis('v_kv_tingkat',tingkat.toFixed(0)); _ttlTulis('v_kv_orde',p.toFixed(1).replace('.',','));
  const data=[]; for(let i=0;i<tingkat;i++){const h=8/Math.pow(2,i), n=900*Math.pow(8,i), e=0.15*Math.pow(h/8,p); data.push({h,n,s:_C9SIG_EX*(1-e)});}
  const tampil=_ttlJalan('konvergensi')?Math.min(tingkat,Math.floor((_c9kvFrame/55)%(tingkat+2))+1):tingkat;
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font=f11; ctx.textAlign='left';
  const yJ=_ttlTeks(ctx,'h dibagi dua tiap tingkat → elemen ×\u00a08; kesalahan ~ h^p',12,18,W-24,{lh:14});
  // Ponsel: grafik selebar kanvas di bawah judul, tabel di bawah grafik.
  const gx0=sempit?34:W*0.08, gx1=sempit?W-12:W*0.60, gy1=sempit?yJ+26:H*0.16, gy0=sempit?gy1+96:H*0.80;
  const X=n=>gx0+(gx1-gx0)*(Math.log10(n)-2.5)/(Math.log10(900*Math.pow(8,6))-2.5), Y=s=>gy0-(gy0-gy1)*(s-44)/12;
  ctx.strokeStyle='rgba(148,163,184,.25)'; ctx.lineWidth=1; for(let s=44;s<=56;s+=2){ctx.beginPath(); ctx.moveTo(gx0,Y(s)); ctx.lineTo(gx1,Y(s)); ctx.stroke();}
  ctx.strokeStyle='rgba(148,163,184,.8)'; ctx.beginPath(); ctx.moveTo(gx0,gy0); ctx.lineTo(gx1,gy0); ctx.moveTo(gx0,gy0); ctx.lineTo(gx0,gy1); ctx.stroke();
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font=f10; ctx.textAlign='right';
  for(let s=44;s<=56;s+=4) ctx.fillText(s,gx0-4,Y(s)+3);
  ctx.textAlign='center'; [1e3,1e4,1e5,1e6].forEach(n=>ctx.fillText(n.toExponential(0).replace('e+','e'),X(n),gy0+14));
  ctx.fillText('jumlah elemen (log)',(gx0+gx1)/2,gy0+28); ctx.textAlign='left'; ctx.fillText('σ_maks (MPa)',gx0,gy1-8);
  // pita ± 5 % dan garis analitis
  ctx.fillStyle='rgba(0,224,158,.10)'; ctx.fillRect(gx0,Y(_C9SIG_EX*1.05),gx1-gx0,Y(_C9SIG_EX*0.95)-Y(_C9SIG_EX*1.05));
  ctx.setLineDash([6,3]); ctx.strokeStyle='#00e09e'; ctx.lineWidth=1.3; ctx.beginPath(); ctx.moveTo(gx0,Y(_C9SIG_EX)); ctx.lineTo(gx1,Y(_C9SIG_EX)); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#00e09e'; ctx.textAlign='right'; _ttlTeks(ctx,'analitis '+_C9SIG_EX.toFixed(2)+' (pita ± 5 %)',gx1-2,Y(_C9SIG_EX)-(sempit?7:5),gx1-gx0-6,{lh:13});
  // kurva dan titik
  ctx.strokeStyle='#22d3ee'; ctx.lineWidth=1.6; ctx.beginPath(); for(let i=0;i<tampil;i++){const d=data[i]; i?ctx.lineTo(X(d.n),Y(d.s)):ctx.moveTo(X(d.n),Y(d.s));} ctx.stroke();
  for(let i=0;i<tampil;i++){const d=data[i]; ctx.fillStyle=i===tampil-1?'#f59e0b':'#22d3ee'; ctx.beginPath(); ctx.arc(X(d.n),Y(d.s),i===tampil-1?5:4,0,Math.PI*2); ctx.fill();}
  // tabel (kanan; ponsel: di bawah grafik). Huruf 10 px, diperkecil seragam bila baris terpanjang
  // dari SEMUA tingkat tidak muat, sehingga ukurannya tidak berubah saat baris bermunculan.
  const tx=sempit?12:W*0.66, ty=sempit?gy0+46:H*0.16, dy=sempit?14:16, maxW=W-tx-(sempit?12:4);
  const judulT='h (mm)   elemen    σ_maks   Δ';
  const baris=data.map((d,i)=>{const ubah=i?Math.abs(d.s-data[i-1].s)/data[i-1].s*100:null;
    return {ubah,teks:(d.h<1?d.h.toFixed(2):d.h.toFixed(d.h%1?1:0)).padStart(5)+'  '+Math.round(d.n).toLocaleString('id-ID').padStart(10)+'  '+d.s.toFixed(2).padStart(6)+'  '+(ubah===null?'   —':ubah.toFixed(1).padStart(4)+'%')};});
  ctx.textAlign='left'; ctx.font=f10;
  const lebarT=Math.max(ctx.measureText(judulT).width,...baris.map(r=>ctx.measureText(r.teks).width));
  ctx.font=Math.max(8,Math.min(10,10*maxW/lebarT)).toFixed(2)+'px '+_C9F;
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.fillText(judulT,tx,ty);
  let ubahAkhir=null;
  for(let i=0;i<tampil;i++){if(i===tampil-1) ubahAkhir=baris[i].ubah; ctx.fillStyle=i===tampil-1?'#f59e0b':'rgba(226,232,240,.8)'; ctx.fillText(baris[i].teks,tx,ty+dy*(i+1));}
  const konv=ubahAkhir!==null&&ubahAkhir<5;
  ctx.fillStyle=konv?'#00e09e':'#ef4444'; ctx.font=f11; _ttlTeks(ctx,ubahAkhir===null?'satu mesh: belum ada bukti':(konv?'konvergen (Δ < 5 %)':'belum konvergen (Δ ≥ 5 %)'),tx,ty+dy*(tampil+2),maxW,{lh:14});
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font=f10; _ttlTeks(ctx,'kesalahan thd analitis '+(Math.abs(data[tampil-1].s-_C9SIG_EX)/_C9SIG_EX*100).toFixed(1)+' %',tx,ty+dy*(tampil+3),maxW,{lh:13});
  _ttlTulis('infoKonvergensi','Tingkat '+tampil+'/'+tingkat+': h = '+data[tampil-1].h+' mm, ≈ '+Math.round(data[tampil-1].n).toLocaleString('id-ID')+' elemen, σ_maks = '+data[tampil-1].s.toFixed(2)+' MPa'+(ubahAkhir===null?'':', perubahan '+ubahAkhir.toFixed(2)+' % dari tingkat sebelumnya')+'; nilai analitis '+_C9SIG_EX+' MPa. Laju p besar (elemen orde 2) mencapai pita ± 5 % dengan lebih sedikit elemen.');
  if(_ttlJalan('konvergensi')){_c9kvFrame++; requestAnimationFrame(drawKonvergensi);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Kt pelat berlubang terhadap d/W
// ════════════════════════════════════════════════════════════
let _c9ktFrame=0;
function _cad9Kt(r){return 3.00-3.13*r+3.66*r*r-1.53*r*r*r;}
function toggleKtLubang(){_ttlToggle('ktlubang','btnKtLubang',drawKtLubang);}
window.toggleKtLubang=toggleKtLubang;
function drawKtLubang(){
  const k=_ttlKanvas('cvKtLubang',360); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT, f10="10px "+_C9F, f11="11px "+_C9F;
  const dS=_ttlNilai('sl_kt_d',15), Wp=_ttlNilai('sl_kt_W',60), F=_ttlNilai('sl_kt_F',5000), t=5;
  _ttlTulis('v_kt_d',dS.toFixed(0)); _ttlTulis('v_kt_W',Wp.toFixed(0)); _ttlTulis('v_kt_F',F.toFixed(0));
  const d=_ttlJalan('ktlubang')?Math.min(0.6*Wp,Wp*(0.05+0.55*(0.5+0.5*Math.sin(_c9ktFrame/60-Math.PI/2)))):Math.min(dS,0.6*Wp);
  const r=d/Wp, Kt=_cad9Kt(r), sigNom=F/((Wp-d)*t), sigMaks=Kt*sigNom, sigKotor=F/(Wp*t);
  // judul: σ_nom → σ_maks (ponsel: dua baris)
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font=f11; ctx.textAlign='left';
  const s1='σ_nom = F/((W − d)·t) = '+sigNom.toFixed(2)+' MPa', s2='σ_maks = Kt·σ_nom = '+sigMaks.toFixed(2)+' MPa';
  const yJ=sempit?_ttlTeks(ctx,'→  '+s2,12,_ttlTeks(ctx,s1,12,18,W-24,{lh:14,susut:0.8}),W-24,{lh:14,susut:0.8}):_ttlTeks(ctx,s1+'  →  '+s2,12,18,W-24,{lh:14});
  // pelat (tampak depan): panjang tetap 2,4·W agar proporsional. Ponsel: pelat di atas, grafik di bawah.
  // pa = panjang panah gaya; di kanvas sedang dipendekkan agar label F kiri tidak terpotong.
  const pa=sempit?22:Math.min(30,W*0.07-16);
  const sk=sempit?Math.min((W-2*(pa+23))/(2.4*Wp),64/Wp):Math.min((W*0.42)/(2.4*Wp),(H*0.5)/Wp);
  const pl=2.4*Wp*sk, ph=Wp*sk, px=sempit?(W-pl)/2:W*0.07, py=sempit?yJ+26:H*0.50-ph/2, cx=px+pl/2, cy=py+ph/2, rr=d/2*sk;
  ctx.fillStyle='rgba(34,211,238,.12)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=1.6; ctx.fillRect(px,py,pl,ph); ctx.strokeRect(px,py,pl,ph);
  ctx.fillStyle='#050b16'; ctx.strokeStyle='#a855f7'; ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2); ctx.fill(); ctx.stroke();
  // distribusi Kirsch pada ligamen (skala relatif terhadap Kt)
  ctx.fillStyle='rgba(239,68,68,.35)'; ctx.strokeStyle='#ef4444'; ctx.lineWidth=1.2;
  [-1,1].forEach(sg=>{ctx.beginPath(); ctx.moveTo(cx,cy+sg*rr); for(let i=0;i<=20;i++){const rho=rr+(ph/2-rr)*i/20; const s=rho>0?(1+0.5*Math.pow(rr/rho,2)+1.5*Math.pow(rr/rho,4))/3:1; ctx.lineTo(cx+Math.min(0.35*pl,ph*0.45)*s*Kt/3,cy+sg*rho);} ctx.lineTo(cx,cy+sg*ph/2); ctx.closePath(); ctx.fill(); ctx.stroke();});
  _cad9Panah(ctx,px,cy,px-pa,cy,'#f59e0b',2); _cad9Panah(ctx,px+pl,cy,px+pl+pa,cy,'#f59e0b',2);
  ctx.fillStyle='#f59e0b'; ctx.font="bold 11px "+_C9F; ctx.textAlign='right'; ctx.fillText('F',px-pa-4,cy+4); ctx.textAlign='left'; ctx.fillText('F',px+pl+pa+4,cy+4);
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.font=f10; ctx.textAlign='center'; _ttlTeks(ctx,'W = '+Wp+' · ⌀d = '+d.toFixed(1)+' · t = '+t,cx,py+ph+16,2*Math.min(cx-12,W-12-cx),{lh:13});
  ctx.fillStyle='#ef4444'; ctx.fillText('σ_maks di tepi lubang',cx,py-8);
  // grafik Kt(d/W) kanan (ponsel: di bawah pelat)
  const gx0=sempit?40:W*0.60, gx1=sempit?W-16:W*0.95, gy1=sempit?py+ph+50:H*0.16, gy0=sempit?gy1+90:H*0.80;
  const X=x=>gx0+(gx1-gx0)*x/0.6, Y=y=>gy0-(gy0-gy1)*(y-2)/1.1;
  ctx.strokeStyle='rgba(148,163,184,.8)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(gx0,gy0); ctx.lineTo(gx1,gy0); ctx.moveTo(gx0,gy0); ctx.lineTo(gx0,gy1); ctx.stroke();
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font=f10; ctx.textAlign='center'; [0,0.2,0.4,0.6].forEach(x=>ctx.fillText(x.toFixed(1).replace('.',','),X(x),gy0+14)); ctx.fillText('d/W',(gx0+gx1)/2,gy0+28);
  ctx.textAlign='right'; [2,2.5,3].forEach(y=>ctx.fillText(y.toFixed(1).replace('.',','),gx0-4,Y(y)+3)); ctx.textAlign='left'; ctx.fillText('Kt',gx0,gy1-8);
  ctx.strokeStyle='#22d3ee'; ctx.lineWidth=1.8; ctx.beginPath(); for(let i=0;i<=60;i++){const x=i/100; i?ctx.lineTo(X(x),Y(_cad9Kt(x))):ctx.moveTo(X(x),Y(_cad9Kt(x)));} ctx.stroke();
  ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.arc(X(r),Y(Kt),5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.textAlign='left'; _ttlTeks(ctx,'Kt = '+Kt.toFixed(3)+' pada d/W = '+r.toFixed(3),gx0+6,gy1+6,gx1-gx0-8,{lh:13});
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font=f10;
  const kaki1='tegangan kotor F/(W·t) = '+sigKotor.toFixed(2)+' MPa;', kaki2='Kt turun, σ_nom naik: σ_maks tetap membesar dengan d';
  if(sempit) _ttlTeks(ctx,kaki2,12,_ttlTeks(ctx,kaki1,12,gy0+46,W-24,{lh:13}),W-24,{lh:13});
  else _ttlTeks(ctx,kaki1+' '+kaki2,12,H-14,W-24,{lh:13});
  _ttlTulis('infoKtLubang','d/W = '+r.toFixed(3)+' → Kt = 3,00 − 3,13r + 3,66r² − 1,53r³ = '+Kt.toFixed(4)+'; σ_nom = '+F+'/(('+Wp+' − '+d.toFixed(1)+')·'+t+') = '+sigNom.toFixed(3)+' MPa; σ_maks = '+sigMaks.toFixed(3)+' MPa di tepi lubang (pembanding von Mises FEM dengan mesh halus di lubang).');
  if(_ttlJalan('ktlubang')){_c9ktFrame++; requestAnimationFrame(drawKtLubang);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Tekuk kolom sendi–sendi terhadap beban P
// ════════════════════════════════════════════════════════════
let _c9tkFrame=0;
function toggleTekuk(){_ttlToggle('tekuk','btnTekuk',drawTekuk);}
window.toggleTekuk=toggleTekuk;
function drawTekuk(){
  const k=_ttlKanvas('cvTekuk',378); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT, sedang=!sempit&&W<700, f10="10px "+_C9F, f11="11px "+_C9F;
  const L=_ttlNilai('sl_tk_L',500), h=_ttlNilai('sl_tk_h',10), Ps=_ttlNilai('sl_tk_P',10000), b=20;
  _ttlTulis('v_tk_L',L.toFixed(0)); _ttlTulis('v_tk_h',h.toFixed(1).replace('.',',')); _ttlTulis('v_tk_P',Ps.toFixed(0));
  const I=b*h*h*h/12, Pcr=Math.PI*Math.PI*_C9E*I/(L*L), A=b*h, lam=L/(h/Math.sqrt(12));
  const P=_ttlJalan('tekuk')?Ps*(0.5+0.5*Math.sin(_c9tkFrame/70-Math.PI/2)):Ps;
  const rasio=P/Pcr, amp=rasio<1?0:Math.min(1,Math.sqrt(rasio-1)*0.8+0.15);
  // judul; di ponsel dua baris selalu disediakan agar gambar tidak meloncat saat teksnya berganti
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font=f11; ctx.textAlign='left';
  _ttlTeks(ctx,rasio<1?'P < P_cr: kolom tetap lurus, von\u00a0Mises\u00a0kecil':'P ≥ P_cr: kolom menekuk pada sumbu\u00a0lemah walau\u00a0σ\u00a0≪\u00a0σ_y',12,18,W-24,{lh:14});
  const yJ=sempit?46:32;
  // Puncak kolom diturunkan sehingga panah beban (panjangnya sebanding P) selalu di bawah judul.
  const cx=W*0.26, yTop=sempit?yJ+54:H*0.30, yBot=sempit?yTop+100:H*0.86, sk=(yBot-yTop), tebal=Math.max(4,h*sk/L*2);
  // tumpuan sendi
  ctx.fillStyle='rgba(148,163,184,.8)'; [yTop,yBot].forEach(y=>{ctx.beginPath(); ctx.arc(cx,y,4,0,Math.PI*2); ctx.fill();});
  ctx.strokeStyle='rgba(148,163,184,.6)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(cx-40,yBot+6); ctx.lineTo(cx+40,yBot+6); ctx.stroke();
  // kolom
  ctx.setLineDash([4,4]); ctx.strokeStyle='rgba(148,163,184,.4)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cx,yTop); ctx.lineTo(cx,yBot); ctx.stroke(); ctx.setLineDash([]);
  const A0=amp*W*0.07, goyang=amp?1+0.05*Math.sin(_c9tkFrame/6):1;
  // Garis dipendekkan setengah tebal di kedua ujung sehingga ujung bulatnya tepat di sendi dan
  // kolom yang gemuk tidak menutupi panah beban, label P, maupun alas.
  const u0=Math.min(0.2,tebal/2/(yBot-yTop));
  ctx.strokeStyle=rasio<1?'#22d3ee':'#ef4444'; ctx.lineWidth=tebal; ctx.lineCap='round'; ctx.beginPath();
  for(let i=0;i<=40;i++){const u=u0+(1-2*u0)*i/40; const x=cx+A0*goyang*Math.sin(Math.PI*u), y=yBot-(yBot-yTop)*u; i?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.stroke(); ctx.lineCap='butt';
  // beban
  const pjMaks=yTop-6-(sempit?yJ+4:28), pj=14+(pjMaks-14)*Math.min(1,P/30000); _cad9Panah(ctx,cx,yTop-pj-6,cx,yTop-6,'#f59e0b',2.4);
  // label P: di kanvas sedang ditaruh di kiri panah karena meter P/P_cr lebih dekat ke kolom
  ctx.fillStyle='#f59e0b'; ctx.font="bold 11px "+_C9F; ctx.textAlign=sedang?'right':'left'; ctx.fillText('P = '+P.toFixed(0)+' N',sedang?cx-12:cx+12,yTop-pj/2);
  // Label dimensi di bawah tumpuan: di samping kolom ia tertimpa kolom yang menekuk.
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.font=f10; ctx.textAlign=sempit?'left':'center';
  _ttlTeks(ctx,'L = '+L+' · '+b+' × '+h.toFixed(1)+' (h sumbu lemah)',sempit?12:cx,yBot+(sempit?22:24),sempit?W-24:2*cx-24,{lh:13});
  // meter P/P_cr (kanvas sedang: digeser ke kiri agar kolom teks kanan muat)
  const mx=sempit?W*0.60:sedang?W*0.39:W*0.50, my=sempit?yTop+18:H*0.22, mw=sempit?W*0.12:sedang?W*0.08:W*0.10, mh=sempit?yBot-yTop-18:H*0.56;
  ctx.strokeStyle='rgba(226,232,240,.5)'; ctx.lineWidth=1; ctx.strokeRect(mx,my,mw,mh);
  const isi=Math.min(1,rasio/2)*mh; ctx.fillStyle=rasio<1?'rgba(34,211,238,.6)':'rgba(239,68,68,.7)'; ctx.fillRect(mx,my+mh-isi,mw,isi);
  ctx.strokeStyle='#ef4444'; ctx.setLineDash([4,3]); ctx.beginPath(); ctx.moveTo(mx-6,my+mh/2); ctx.lineTo(mx+mw+6,my+mh/2); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#ef4444'; ctx.textAlign='left'; ctx.fillText('P_cr',mx+mw+8,my+mh/2+4); ctx.fillStyle='rgba(148,163,184,.85)'; ctx.fillText('2·P_cr',mx+mw+8,my+4); ctx.fillText('0',mx+mw+8,my+mh+4);
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.textAlign='center'; ctx.fillText('P / P_cr',mx+mw/2,my-8); ctx.textAlign='left';
  // teks kanan (ponsel: di bawah gambar)
  const tx=sempit?12:sedang?W*0.57:W*0.68, ty=sempit?yBot+46:H*0.22, dg=sempit?[0,16,32,52,70,85,100]:[0,20,40,66,88,106,124];
  _cad9Kolom(ctx,tx,ty,W-tx-(sempit?12:8),[
    ['I = bh³/12 = '+I.toFixed(1)+' mm⁴','#22d3ee',f11,dg[0]],
    ['P_cr = π²EI/L²','#22d3ee',f11,dg[1]],
    ['= '+Pcr.toFixed(1)+' N','#00e09e',f11,dg[2]],
    ['SF tekuk = P_cr/P = '+(Pcr/P).toFixed(2)+(rasio>=1?' →\u00a0tekuk!':''),rasio<1?'#00e09e':'#ef4444',f11,dg[3]],
    ['σ = P/A = '+(P/A).toFixed(1)+' MPa (σ_y 250)','rgba(148,163,184,.85)',f10,dg[4]],
    ['σ_cr = P_cr/A = '+(Pcr/A).toFixed(1)+' MPa'+(Pcr/A<_C9SY?' → elastis':' > σ_y: bukan\u00a0Euler'),'rgba(148,163,184,.85)',f10,dg[5]],
    ['kelangsingan λ = L/r = '+lam.toFixed(0)+' (r\u00a0=\u00a0h/√12)','rgba(148,163,184,.85)',f10,dg[6]]]);
  _ttlTulis('infoTekuk','I sumbu lemah = '+b+'·'+h.toFixed(1)+'³/12 = '+I.toFixed(2)+' mm⁴; P_cr = π²·210000·'+I.toFixed(2)+'/'+L+'² = '+Pcr.toFixed(1)+' N; pada P = '+Ps.toFixed(0)+' N, SF tekuk = '+(Pcr/Ps).toFixed(3)+' dan tegangan hanya '+(Ps/A).toFixed(2)+' MPa — CalculiX Buckling memberi buckling factor ≈ P_cr/P yang dibandingkan dengan Euler.');
  if(_ttlJalan('tekuk')){_c9tkFrame++; requestAnimationFrame(drawTekuk);}
}

_TTL_DAFTAR.push(['cvKonturVM',()=>drawKonturVM(),'konturvm',['sl_vm_F','sl_vm_L','sl_vm_h']]);
_TTL_DAFTAR.push(['cvKonvergensi',()=>drawKonvergensi(),'konvergensi',['sl_kv_tingkat','sl_kv_orde']]);
_TTL_DAFTAR.push(['cvKtLubang',()=>drawKtLubang(),'ktlubang',['sl_kt_d','sl_kt_W','sl_kt_F']]);
_TTL_DAFTAR.push(['cvTekuk',()=>drawTekuk(),'tekuk',['sl_tk_L','sl_tk_h','sl_tk_P']]);
_ttlMulai();
