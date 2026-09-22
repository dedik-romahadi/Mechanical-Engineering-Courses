// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 11 PEMODELAN CAD — Perakitan Komponen dan Analisis Sistem
// Kanvas: cvEngkol, cvPusatMassa, cvSabuk, cvClearance (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// Layar sempit (W < _TTL_SEMPIT): gambar di atas, keterangan ditumpuk di bawahnya pada kanvas yang lebih tinggi.
// ════════════════════════════════════════════════════════════
const _C11C='#22d3ee', _C11A='#f59e0b', _C11G='#00e09e', _C11R='#ef4444', _C11V='#a855f7', _C11P='#ec4899', _C11T='rgba(226,232,240,.92)', _C11M='rgba(148,163,184,.85)';
const _F11_9="9px 'JetBrains Mono',monospace", _F11_10="10px 'JetBrains Mono',monospace", _F11_11="11px 'JetBrains Mono',monospace";
function _cad11Teks(ctx,s,x,y,warna,font,align){ctx.fillStyle=warna; ctx.font=font||"11px 'JetBrains Mono',monospace"; ctx.textAlign=align||'left'; ctx.fillText(s,x,y);}
// Memecah string per kata, tetapi "nama = nilai satuan", operasi seperti "a × b", "A ∩ B", "R² + x" dan panah dengan kata sesudahnya tetap satu potongan.
function _cad11Kata(s){const o=[]; for(const t of String(s).split(/(?= )/)){const p=o[o.length-1]; if(p!==undefined&&(/^ (=|∩|×|\+|−|mm³|mm²|mm|rpm|µm|°)(?![\wÀ-ɏ])/.test(t)||/[=→∩×+−]$/.test(p))) o[o.length-1]=p+t; else o.push(t);} return o;}
// Menulis teks agar muat dalam lebar maxW (perataan align). bagian = string (dipecah per kata) atau array potongan
// yang bila digabung sama persis dengan teks utuhnya (dipecah hanya di batas potongan, spasi awal baris dibuang).
// Bila teks utuh tidak muat, huruf boleh dikecilkan sampai 85% (min 8 px) asal tetap satu baris; bila masih
// kepanjangan, teks dipecah dengan ukuran huruf semula, baris berjarak lh. Potongan yang sendirian masih kepanjangan
// diserahkan ke _ttlTeks. Mengembalikan tinggi tambahan akibat pemecahan: 0 bila satu baris, (n − 1)·lh bila n baris.
function _cad11Muat(ctx,bagian,x,y,maxW,warna,font,align,lh){
  ctx.fillStyle=warna; ctx.font=font||_F11_11; ctx.textAlign=align||'left';
  const f=ctx.font, px=parseFloat((/(\d+(?:\.\d+)?)px/.exec(f)||[0,11])[1]);
  const potong=Array.isArray(bagian)?bagian:_cad11Kata(bagian), utuh=potong.join('');
  lh=lh||Math.round(px*1.3);
  for(let uk=px;uk>=Math.max(8,px*0.85)-1e-6;uk-=0.5){
    ctx.font=f.replace(/\d+(?:\.\d+)?px/,uk+'px');
    if(ctx.measureText(utuh).width<=maxW){ctx.fillText(utuh,x,y); ctx.font=f; return 0;}
  }
  ctx.font=f;
  const baris=[]; let b='';
  for(const p of potong){const coba=b+p; if(b&&ctx.measureText(coba).width>maxW){baris.push(b); b=p.replace(/^ +/,'');} else b=coba;}
  if(b) baris.push(b);
  let yy=y;
  for(const s of baris) yy=_ttlTeks(ctx,s,x,yy,maxW,{lh});
  ctx.font=f; return yy-y-lh;
}
// Kotak tinta teks (sama dengan yang diukur pemeriksa) dan uji bebas-tumpang terhadap daftar kotak lain.
function _cad11Tinta(ctx,s,x,y,font,align){ctx.font=font; ctx.textAlign=align||'left'; const u=ctx.measureText(s); return [x-u.actualBoundingBoxLeft,y-u.actualBoundingBoxAscent,x+u.actualBoundingBoxRight,y+u.actualBoundingBoxDescent];}
function _cad11Bebas(k,daftar){return daftar.every(b=>Math.min(k[2],b[2])-Math.max(k[0],b[0])<=0||Math.min(k[3],b[3])-Math.max(k[1],b[1])<=0);}
function _cad11Lingkar(ctx,x,y,r,isi,garis,lebar,putus){ctx.setLineDash(putus||[]); ctx.beginPath(); ctx.arc(x,y,Math.max(0.1,r),0,Math.PI*2); if(isi){ctx.fillStyle=isi; ctx.fill();} if(garis){ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.2; ctx.stroke();} ctx.setLineDash([]);}
function _cad11Panah(ctx,x1,y1,x2,y2,warna){const a=Math.atan2(y2-y1,x2-x1); _ttlGaris(ctx,x1,y1,x2,y2,warna,1.2); ctx.fillStyle=warna; ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-7*Math.cos(a)+3.5*Math.sin(a),y2-7*Math.sin(a)-3.5*Math.cos(a)); ctx.lineTo(x2-7*Math.cos(a)-3.5*Math.sin(a),y2-7*Math.sin(a)+3.5*Math.cos(a)); ctx.closePath(); ctx.fill();}
function _cad11Kotak(ctx,x,y,w,h,isi,garis,lebar){ctx.fillStyle=isi; ctx.fillRect(x,y,w,h); ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.4; ctx.strokeRect(x,y,w,h);}
// Tinggi kanvas di layar sempit menurut lebarnya: tabel [[lebar batas, tinggi], ...] berurutan naik; dipakai tinggi
// pertama yang batasnya melebihi lebar kanvas (teks dipecah makin banyak baris saat kanvas makin sempit).
function _cad11TinggiSempit(id,tabel){const cv=document.getElementById(id), W=cv?(cv.clientWidth||cv.width):1000; const t=tabel.find(([L])=>W<L); return t?t[1]:tabel[tabel.length-1][1];}
function _cad11X(r,l,th){const s=r*Math.sin(th); return r*Math.cos(th)+Math.sqrt(Math.max(0,l*l-s*s));}
// Menulis baris-baris [teks, warna, font, jarak ke baris berikut] mulai (x, y); baris yang dipecah mendorong baris
// sesudahnya sejauh tinggi tambahannya, jadi posisi di layar lebar tetap sama bila tidak ada yang dipecah.
// Mengembalikan y baris terakhir.
function _cad11Kolom(ctx,baris,x,y,maxW,lh){
  let yy=y;
  baris.forEach(([s,warna,font,jarak],i)=>{yy+=_cad11Muat(ctx,s,x,yy,maxW,warna,font,'left',lh||13); if(i<baris.length-1) yy+=jarak;});
  return yy;
}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Engkol-peluncur: Revolute + Slider menyisakan satu DOF
// ════════════════════════════════════════════════════════════
let _ekFrame=0;
function toggleEngkol(){_ttlToggle('engkol','btnEngkol',drawEngkol);}
window.toggleEngkol=toggleEngkol;
function drawEngkol(){
  const k=_ttlKanvas('cvEngkol',360); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const r=_ttlNilai('sl_ek_r',25), l=Math.max(_ttlNilai('sl_ek_l',90),r+10), thS=_ttlNilai('sl_ek_th',60);
  _ttlTulis('v_ek_r',r.toFixed(0)); _ttlTulis('v_ek_l',l.toFixed(0)); _ttlTulis('v_ek_th',thS.toFixed(0));
  const thD=_ttlJalan('engkol')?(_ekFrame*1.5)%360:thS, th=thD*Math.PI/180;
  const x=_cad11X(r,l,th), xmin=l-r, xmax=l+r, phi=Math.asin(r*Math.sin(th)/l);
  // judul: satu baris di layar lebar; dipecah per frasa bila tidak muat
  const judul=['Engkol r = '+r+' (Revolute O),',' batang l = '+l+' (Revolute A, B),',' peluncur pada rel (Slider)',' — dasar grounded'];
  const yA=sempit?29+_cad11Muat(ctx,judul,12,16,W-24,_C11T,_F11_10,'left',13):18+_cad11Muat(ctx,judul,12,18,W-16,_C11T,_F11_11,'left',14);
  // skala: layar lebar = mekanisme di kiri; layar sempit = selebar kanvas pada pita ±104 px di bawah judul
  let sk, ox, oy;
  if(sempit){sk=Math.max(0.05,Math.min((W-28)/(l+3*r+14),36/r,2)); ox=(W-(l+3*r+14)*sk)/2+r*sk; oy=yA+52;}
  else{sk=Math.max(0.05,Math.min((W*0.56)/(xmax+r+40),(H-80)/(2*r+40))); ox=W*0.04+(r+10)*sk; oy=H*0.52;}
  const X=v=>ox+v*sk, Y=v=>oy-v*sk;
  // rel dan arsir dasar (grounded)
  const yRel=oy+12*sk;
  _ttlGaris(ctx,X(xmin-r-8),yRel,X(xmax+r+14),yRel,'rgba(148,163,184,.6)',1.4);
  for(let xx=X(xmin-r-8);xx<X(xmax+r+14);xx+=12) _ttlGaris(ctx,xx,yRel,xx-6,yRel+8,'rgba(148,163,184,.3)',1);
  _ttlGaris(ctx,X(xmin-r-8),oy,X(xmax+r+14),oy,'rgba(148,163,184,.25)',1,[5,4]);
  // batas langkah
  [xmin,xmax].forEach(v=>_ttlGaris(ctx,X(v),oy-16*sk,X(v),yRel,'rgba(0,224,158,.35)',1,[3,3]));
  _cad11Lingkar(ctx,X(0),Y(0),r*sk,null,'rgba(245,158,11,.35)',1,[4,4]);
  const A=[X(r*Math.cos(th)),Y(r*Math.sin(th))], B=[X(x),Y(0)];
  _cad11Kotak(ctx,B[0]-12*sk,oy-10*sk,24*sk,22*sk,'rgba(168,85,247,.25)',_C11V,1.6);
  _ttlGaris(ctx,A[0],A[1],B[0],B[1],_C11C,Math.max(3,4*sk));
  _ttlGaris(ctx,X(0),Y(0),A[0],A[1],_C11A,Math.max(4,5*sk));
  // Label A menghindari label dimensi x (bisa bertemu saat pin A di bawah rel): calon posisi dicoba berurutan.
  // Layar lebar: calon pertama = posisi semula A + (7, −7); layar sempit: radial ke luar dari O.
  const FB="bold 10px 'JetBrains Mono',monospace", FT="bold 11px 'JetBrains Mono',monospace", PIN=[4,'#0a101f','#e2e8f0',1.5];
  ctx.font=_F11_10; const wx=ctx.measureText('x = '+x.toFixed(2)).width/2+2, cxL=(X(0)+B[0])/2, yL=yRel+17;
  const ur=[Math.cos(th),-Math.sin(th)], up=[-Math.sin(th),-Math.cos(th)];
  const calonA=[sempit?[A[0]+11*ur[0],A[1]+11*ur[1]]:[A[0]+10,A[1]-11],[A[0]+11*up[0],A[1]+11*up[1]],[A[0]-11*up[0],A[1]-11*up[1]],
    [A[0]-11*ur[0],A[1]-11*ur[1]],[A[0],A[1]-14],[A[0],A[1]+16],[A[0]-14,A[1]],[A[0]+14,A[1]]];
  const iA=Math.max(0,calonA.findIndex(([px,py])=>px+5<cxL-wx||px-5>cxL+wx||py+5<yL-9||py-5>yL+3));
  const tulisA=()=>{if(iA===0&&!sempit) _cad11Teks(ctx,'A',A[0]+7,A[1]-7,'#e2e8f0',FB); else _cad11Teks(ctx,'A',calonA[iA][0],calonA[iA][1]+4,'#e2e8f0',FB,'center');};
  // sudut θ; di layar sempit busurnya ikut skala dan label O, θ diletakkan menjauhi engkol agar tidak bertumpuk
  const rho=sempit?Math.min(18,0.6*r*sk):18, bis=th/2;
  const busur=()=>{ctx.strokeStyle=_C11G; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(X(0),Y(0),rho,0,-th,true); ctx.stroke();};
  if(sempit){
    [[X(0),Y(0)],A,B].forEach(([px,py])=>_cad11Lingkar(ctx,px,py,...PIN)); busur(); tulisA();
    _cad11Teks(ctx,'O',X(0)-12*Math.cos(bis),Y(0)+12*Math.sin(bis)+4,'#e2e8f0',FB,'center');
    _cad11Teks(ctx,'θ',X(0)+(rho+8)*Math.cos(bis),Y(0)-(rho+8)*Math.sin(bis)+4,_C11G,FT,'center');
    _cad11Teks(ctx,'B',B[0]+7,B[1]-7,'#e2e8f0',FB);
  } else {
    _cad11Lingkar(ctx,X(0),Y(0),...PIN); _cad11Teks(ctx,'O',X(0)+7,Y(0)-7,'#e2e8f0',FB);
    _cad11Lingkar(ctx,A[0],A[1],...PIN); tulisA();
    _cad11Lingkar(ctx,B[0],B[1],...PIN); _cad11Teks(ctx,'B',B[0]+7,B[1]-7,'#e2e8f0',FB);
    busur();
    // θ di posisi semula, kecuali menimpa label O, A, B, atau x (terjadi saat r kecil di θ ≈ 0°, atau l ≈ r di θ ≈ 180°)
    const lain=[_cad11Tinta(ctx,'O',X(0)+7,Y(0)-7,FB,'left'),iA===0?_cad11Tinta(ctx,'A',A[0]+7,A[1]-7,FB,'left'):_cad11Tinta(ctx,'A',calonA[iA][0],calonA[iA][1]+4,FB,'center'),
      _cad11Tinta(ctx,'B',B[0]+7,B[1]-7,FB,'left'),_cad11Tinta(ctx,'x = '+x.toFixed(2),cxL,yL,_F11_10,'center')];
    const calonT=[[X(0)+22,Y(0)-6,'left'],[X(0)+22,Y(0)+16,'left'],[X(0)-12,Y(0)-6,'right'],[X(0)-12,Y(0)+16,'right'],[X(0)+(rho+10)*Math.cos(bis),Y(0)-(rho+10)*Math.sin(bis)+4,'center']];
    const pT=calonT.find(([px,py,al])=>_cad11Bebas(_cad11Tinta(ctx,'θ',px,py,FT,al),lain))||calonT[0];
    _cad11Teks(ctx,'θ',pT[0],pT[1],_C11G,FT,pT[2]);
  }
  // dimensi x
  const yD=yRel+22;
  _ttlGaris(ctx,X(0),yRel+4,X(0),yD+6,_C11G,0.8,[3,2]); _ttlGaris(ctx,B[0],yRel+4,B[0],yD+6,_C11G,0.8,[3,2]);
  _cad11Panah(ctx,X(0),yD,B[0],yD,_C11G); _cad11Panah(ctx,B[0],yD,X(0),yD,_C11G);
  _cad11Teks(ctx,'x = '+x.toFixed(2),(X(0)+B[0])/2,yD-5,_C11G,_F11_10,'center');
  // kolom kanan (layar sempit: ditumpuk di bawah mekanisme): DOF dan rumus
  const tx=sempit?14:W*0.64, ty=sempit?yA+120:H*0.14, jarak=sempit?[16,16,16,16,16]:[18,20,20,18,18];
  const yAkhir=_cad11Kolom(ctx,[
    ['Revolute ×3 + Slider ×1',_C11T,_F11_11,jarak[0]],
    ['F = 3(4 − 1) − 2·4 = 1 DOF',_C11G,_F11_11,jarak[1]],
    ['θ = '+thD.toFixed(0)+'°  →  φ = '+(phi*180/Math.PI).toFixed(2)+'°',_C11A,_F11_11,jarak[2]],
    ['x = r cosθ + √(l² − r² sin²θ)',_C11C,_F11_11,jarak[3]],
    ['  = '+x.toFixed(3)+' mm',_C11G,_F11_11,jarak[4]],
    [['x ∈ ['+xmin+', '+xmax+'],',' langkah 2r = '+(2*r)],_C11M,_F11_10,0]],tx,ty,sempit?W-28:W-tx-8);
  // grafik x(θ)
  let gx=tx, gy=H-14, gw=W-12-tx, gh=H*0.34;
  if(sempit){gx=14; gw=W-28; gh=Math.max(30,Math.min(70,H-16-(yAkhir+18))); gy=yAkhir+18+gh;}
  _ttlGaris(ctx,gx,gy,gx+gw,gy,'rgba(148,163,184,.5)',1); _ttlGaris(ctx,gx,gy,gx,gy-gh,'rgba(148,163,184,.5)',1);
  ctx.strokeStyle=_C11C; ctx.lineWidth=1.5; ctx.beginPath();
  for(let i=0;i<=72;i++){const tt=i/72*2*Math.PI; const xv=_cad11X(r,l,tt); const px=gx+i/72*gw, py=gy-(xv-xmin)/(2*r)*gh; i?ctx.lineTo(px,py):ctx.moveTo(px,py);} ctx.stroke();
  _cad11Lingkar(ctx,gx+thD/360*gw,gy-(x-xmin)/(2*r)*gh,4,_C11G,null);
  _cad11Teks(ctx,'x(θ)',gx+4,gy-gh+10,_C11M,_F11_9); _cad11Teks(ctx,'0°',gx,gy+10,_C11M,_F11_9); _cad11Teks(ctx,'360°',gx+gw,gy+10,_C11M,_F11_9,'right');
  _ttlTulis('engkolInfo','θ = '+thD.toFixed(0)+'°: x = '+r+'·cos θ + √('+l+'² − '+r+'²·sin² θ) = '+x.toFixed(3)+' mm; kemiringan batang φ = '+(phi*180/Math.PI).toFixed(2)+'°. Titik mati luar x = '+xmax+' (θ = 0°), titik mati dalam x = '+xmin+' (θ = 180°); satu sudut engkol menentukan seluruh posisi karena F = 1.');
  if(_ttlJalan('engkol')){_ekFrame++; requestAnimationFrame(drawEngkol);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Placement komponen menggeser pusat massa rakitan
// ════════════════════════════════════════════════════════════
let _pmFrame=0;
function togglePusatMassa(){_ttlToggle('pusatmassa','btnPusatMassa',drawPusatMassa);}
window.togglePusatMassa=togglePusatMassa;
function drawPusatMassa(){
  const k=_ttlKanvas('cvPusatMassa',_cad11TinggiSempit('cvPusatMassa',[[244,400],[274,385],[298,360],[369,335],[1e9,310]])); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const a=120, b=70, t=15;
  const xS=_ttlNilai('sl_pm_x',60), dB=_ttlNilai('sl_pm_d',30), hB=_ttlNilai('sl_pm_h',40);
  _ttlTulis('v_pm_x',xS.toFixed(0)); _ttlTulis('v_pm_d',dB.toFixed(0)); _ttlTulis('v_pm_h',hB.toFixed(0));
  const lo=dB/2+2, hi=a-dB/2-2;
  const xB=_ttlJalan('pusatmassa')?(lo+hi)/2+(hi-lo)/2*Math.sin(_pmFrame/45):Math.min(hi,Math.max(lo,xS));
  const V1=a*b*t, V2=Math.PI/4*dB*dB*hB;
  const xbar=(V1*a/2+V2*xB)/(V1+V2), zbar=(V1*t/2+V2*(t+hB/2))/(V1+V2);
  const judul='Pusat massa gabungan G bergeser mengikuti Placement boss: x̄ ke arah boss, z̄ naik bila boss makin tinggi/besar';
  const tb=sempit?_cad11Muat(ctx,judul,12,16,W-24,_C11T,_F11_10,'left',13):_cad11Muat(ctx,judul,12,18,W-16,_C11T,_F11_11,'left',14);
  const labelAtas=['tampak atas (XY)',' — pelat '+a+' × '+b+' grounded'];
  // Layar lebar: tampak atas di kiri, tampak samping di kanan atas, angka di kanan bawah.
  // Layar sempit: tampak atas lalu tampak samping (skala x sama, seperti proyeksi ortogonal), angka di bawahnya.
  let skT, ox, oy, skS, sx, sz, yLA, ySamping, yTeks;
  if(sempit){
    yLA=31+tb; const tl=_cad11Muat(ctx,labelAtas,14,yLA,W-28,_C11M,_F11_10,'left',12);
    skT=Math.min((W-44)/a,0.9); ox=(W-a*skT)/2; oy=yLA+tl+8+b*skT;
    ySamping=oy+31; skS=Math.min(skT,70/(t+70)); sx=ox; sz=ySamping+8+(t+70)*skS; yTeks=sz+20;
  } else {
    skT=Math.max(0.05,Math.min((W*0.40)/(a+10),(H-90-tb)/(b+10))); ox=W*0.04; oy=H*0.16+tb+b*skT;
    // batas skala tampak samping: labelnya tidak boleh naik menimpa judul saat boss tinggi
    skS=Math.max(0.05,Math.min((W*0.46)/(a+10),(H*0.5)/(t+hB+10),(H*0.56-42-tb)/(t+hB))); sx=W*0.52; sz=H*0.56; yTeks=H*0.66;
  }
  // tampak atas
  const X=v=>ox+v*skT, Y=v=>oy-v*skT;
  _cad11Kotak(ctx,X(0),Y(b),a*skT,b*skT,'rgba(34,211,238,.14)',_C11C,1.6);
  _cad11Lingkar(ctx,X(xB),Y(b/2),dB/2*skT,'rgba(245,158,11,.25)',_C11A,1.6);
  _cad11Lingkar(ctx,X(a/2),Y(b/2),3.5,null,_C11C,1.4); _cad11Lingkar(ctx,X(xB),Y(b/2),3.5,null,_C11A,1.4);
  _cad11Lingkar(ctx,X(xbar),Y(b/2),4.5,_C11G,'#0a101f',1.2);
  const sXbar='x̄ = '+xbar.toFixed(2);
  if(sempit){
    ctx.font=_F11_10; const w2=ctx.measureText(sXbar).width/2+2;
    _cad11Teks(ctx,sXbar,Math.min(W-14-w2,Math.max(14+w2,X(xbar))),oy+14,_C11G,_F11_10,'center');
  } else {
    _cad11Muat(ctx,labelAtas,X(0),Y(b)-8,W*0.48-8,_C11M,_F11_10,'left',12);
    _cad11Teks(ctx,sXbar,X(xbar),Y(b/2)+dB/2*skT+16,_C11G,_F11_10,'center');
  }
  // tampak samping
  const XS=v=>sx+v*skS, ZS=v=>sz-v*skS;
  _cad11Kotak(ctx,XS(0),ZS(t),a*skS,t*skS,'rgba(34,211,238,.14)',_C11C,1.6);
  _cad11Kotak(ctx,XS(xB-dB/2),ZS(t+hB),dB*skS,hB*skS,'rgba(245,158,11,.22)',_C11A,1.6);
  [[XS(a/2),ZS(t/2),_C11C],[XS(xB),ZS(t+hB/2),_C11A]].forEach(([px,py,c])=>{_cad11Lingkar(ctx,px,py,3.5,'#0a101f',c,1.4); _ttlGaris(ctx,px-7,py,px+7,py,c,1); _ttlGaris(ctx,px,py-7,px,py+7,c,1);});
  _cad11Lingkar(ctx,XS(xbar),ZS(zbar),4.5,_C11G,'#0a101f',1.2);
  _cad11Teks(ctx,'tampak samping (XZ)',XS(0),sempit?ySamping:ZS(t+hB)-10,_C11M,_F11_10);
  _cad11Teks(ctx,'G₁',XS(0)-6,ZS(t/2)+4,_C11C,_F11_9,'right');
  const FB="bold 10px 'JetBrains Mono',monospace";
  if(sempit){
    // G₂ di sisi boss yang menjauhi G, label G di sisi G yang menjauhi boss: keduanya tidak pernah bertumpuk
    const kanan=xbar<xB;
    _cad11Teks(ctx,'G₂',kanan?XS(xB)+dB/2*skS+5:XS(xB)-dB/2*skS-5,ZS(t+hB/2)+4,_C11A,_F11_9,kanan?'left':'right');
    _cad11Teks(ctx,'G',kanan?XS(xbar)-8:XS(xbar)+8,ZS(zbar)-6,_C11G,FB,kanan?'right':'left');
  } else {
    _cad11Teks(ctx,'G₂',XS(xB)+dB/2*skS+5,ZS(t+hB/2)+4,_C11A,_F11_9);
    _cad11Teks(ctx,'G',XS(xbar)+8,ZS(zbar)-6,_C11G,FB);
  }
  // angka
  const V1s=V1.toLocaleString('id-ID'), jk=sempit?16:(W<640?15:18);
  _cad11Kolom(ctx,[
    [['V₁ = '+V1s+' mm³ (pelat),',' V₂ = '+V2.toFixed(0)+' mm³ (boss ⌀'+dB+' × '+hB+')'],_C11T,_F11_10,jk],
    [['x̄ = (V₁·a/2 + V₂·x_B)/(V₁ + V₂)',' = '+xbar.toFixed(3)+' mm'],_C11G,_F11_10,jk],
    [['z̄ = (V₁·t/2 + V₂·(t + h_B/2))','/(V₁ + V₂)',' = '+zbar.toFixed(3)+' mm'],_C11G,_F11_10,jk],
    [['Placement boss x_B = '+xB.toFixed(1)+' mm',' (Fixed joint + Offset)'],_C11M,_F11_10,0]],sempit?14:sx,yTeks,sempit?W-28:W-sx-8,13);
  _ttlTulis('pusatMassaInfo','Boss pada x_B = '+xB.toFixed(1)+' mm: x̄ = '+xbar.toFixed(3)+' mm, z̄ = '+zbar.toFixed(3)+' mm dari V₁ = '+V1+' dan V₂ = '+V2.toFixed(1)+' mm³; itulah CenterOfMass dari Part.makeCompound(Shape semua link) untuk bahan seragam.');
  if(_ttlJalan('pusatmassa')){_pmFrame++; requestAnimationFrame(drawPusatMassa);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Transmisi sabuk dua puli: panjang sabuk dan rasio putaran
// ════════════════════════════════════════════════════════════
let _sbFrame=0;
function toggleSabuk(){_ttlToggle('sabuk','btnSabuk',drawSabuk);}
window.toggleSabuk=toggleSabuk;
function drawSabuk(){
  const k=_ttlKanvas('cvSabuk',_cad11TinggiSempit('cvSabuk',[[224,362],[274,350],[1e9,335]])); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const D1=_ttlNilai('sl_sb_d1',75), D2=Math.max(_ttlNilai('sl_sb_d2',150),D1), C=Math.max(_ttlNilai('sl_sb_c',250),(D1+D2)/2+20);
  _ttlTulis('v_sb_d1',D1.toFixed(0)); _ttlTulis('v_sb_d2',D2.toFixed(0)); _ttlTulis('v_sb_c',C.toFixed(0));
  const R1=D1/2, R2=D2/2, beta=Math.asin((R2-R1)/C);
  const Ldekat=2*C+Math.PI*(D1+D2)/2+(D2-D1)*(D2-D1)/(4*C);
  const Ltepat=2*Math.sqrt(C*C-(R2-R1)*(R2-R1))+Math.PI*(D1+D2)/2+(D2-D1)*beta;
  const i=D2/D1, n1=1450, n2=n1/i, lilit=180-2*beta*180/Math.PI;
  const judul='Puli penggerak n₁ = 1450 rpm (Revolute grounded) → puli ⌀D₂ berjarak C (Distance joint); joint Belt mengopling putaran';
  const tb=sempit?_cad11Muat(ctx,judul,12,16,W-24,_C11T,_F11_10,'left',13):_cad11Muat(ctx,judul,12,18,W-16,_C11T,_F11_11,'left',14);
  // layar lebar: puli di kiri, rumus di kanan; layar sempit: puli selebar kanvas (puli besar maks. 92 px), rumus di bawahnya
  let sk, c1x, cy, yD, tx, ty;
  if(sempit){sk=Math.max(0.05,Math.min((W-28)/(C+R1+R2),92/D2)); c1x=(W-(C+R1+R2)*sk)/2+R1*sk; cy=29+tb+50; yD=cy+80; tx=14; ty=yD+24;}
  else{sk=Math.max(0.05,Math.min((W*0.60)/(C+R1+R2+20),(H-70)/(D2+30))); c1x=W*0.04+R1*sk+10; cy=H*0.55; yD=H-16; tx=W*0.68; ty=H*0.16;}
  const c2x=c1x+C*sk;
  // sabuk (2 busur lilit + 2 garis singgung)
  ctx.strokeStyle=_C11V; ctx.lineWidth=2.4; ctx.beginPath();
  const n=40; let a0=Math.PI/2+beta, a1=3*Math.PI/2-beta;
  for(let j=0;j<=n;j++){const ang=a0+(a1-a0)*j/n; const px=c1x+R1*sk*Math.cos(ang), py=cy-R1*sk*Math.sin(ang); j?ctx.lineTo(px,py):ctx.moveTo(px,py);}
  a0=-Math.PI/2-beta; a1=Math.PI/2+beta;
  for(let j=0;j<=n;j++){const ang=a0+(a1-a0)*j/n; ctx.lineTo(c2x+R2*sk*Math.cos(ang),cy-R2*sk*Math.sin(ang));}
  ctx.closePath(); ctx.stroke();
  _cad11Lingkar(ctx,c1x,cy,R1*sk,'rgba(34,211,238,.15)',_C11C,1.4); _cad11Lingkar(ctx,c2x,cy,R2*sk,'rgba(245,158,11,.15)',_C11A,1.4);
  // jari-jari berputar (rasio i)
  const th1=_sbFrame*4*Math.PI/180, th2=th1/i;
  for(let j=0;j<3;j++){const a=th1+j*2*Math.PI/3; _ttlGaris(ctx,c1x,cy,c1x+R1*sk*0.85*Math.cos(a),cy-R1*sk*0.85*Math.sin(a),'rgba(34,211,238,.6)',1.4);}
  for(let j=0;j<3;j++){const a=th2+j*2*Math.PI/3; _ttlGaris(ctx,c2x,cy,c2x+R2*sk*0.85*Math.cos(a),cy-R2*sk*0.85*Math.sin(a),'rgba(245,158,11,.6)',1.4);}
  _cad11Lingkar(ctx,c1x,cy,3,'#e2e8f0',null); _cad11Lingkar(ctx,c2x,cy,3,'#e2e8f0',null);
  // label diameter di bawah tiap puli; di layar sempit dijepit ke dalam tepi kanvas
  ctx.font=_F11_10;
  const jepit=(s,x)=>{if(!sempit) return x; const w=ctx.measureText(s).width/2+4; return Math.min(W-w,Math.max(w,x));};
  const sD1='⌀D₁ = '+D1, sD2='⌀D₂ = '+D2;
  _cad11Teks(ctx,sD1,jepit(sD1,c1x),cy+R1*sk+16,_C11C,_F11_10,'center');
  _cad11Teks(ctx,sD2,jepit(sD2,c2x),cy+R2*sk+16,_C11A,_F11_10,'center');
  _cad11Panah(ctx,c1x,yD,c2x,yD,_C11G); _cad11Panah(ctx,c2x,yD,c1x,yD,_C11G);
  _cad11Teks(ctx,'C = '+C,(c1x+c2x)/2,yD-5,_C11G,_F11_10,'center');
  const j=sempit?[14,16,16,16,19,15,16]:[16,20,20,20,28,18,20];
  _cad11Kolom(ctx,[
    ['L = 2C + π(D₁+D₂)/2',_C11C,_F11_11,j[0]],
    ['    + (D₂−D₁)²/(4C)',_C11C,_F11_11,j[1]],
    [['= '+(2*C).toFixed(1),' + '+(Math.PI*(D1+D2)/2).toFixed(1),' + '+((D2-D1)*(D2-D1)/(4*C)).toFixed(2)],_C11M,_F11_10,j[2]],
    ['= '+Ldekat.toFixed(2)+' mm',_C11G,_F11_11,j[3]],
    ['singgung tepat: '+Ltepat.toFixed(2)+' mm',_C11M,_F11_10,j[4]],
    ['i = D₂/D₁ = '+i.toFixed(3),_C11A,_F11_11,j[5]],
    ['n₂ = n₁/i = '+n2.toFixed(0)+' rpm',_C11A,_F11_11,j[6]],
    [['lilit puli kecil = '+lilit.toFixed(1)+'°',lilit<120?' (< 120°!)':''],lilit<120?_C11R:_C11M,_F11_10,0]],tx,ty,sempit?W-28:W-tx-8,13);
  _ttlTulis('sabukInfo','D₁ = '+D1+', D₂ = '+D2+', C = '+C+': L = 2·'+C+' + π·'+((D1+D2)/2)+' + '+((D2-D1)*(D2-D1)/(4*C)).toFixed(3)+' = '+Ldekat.toFixed(2)+' mm (panjang singgung tepat '+Ltepat.toFixed(2)+' mm, selisih '+Math.abs(Ltepat-Ldekat).toFixed(3)+' mm); rasio i = '+i.toFixed(3)+', puli besar '+n2.toFixed(0)+' rpm; sudut lilit puli kecil '+lilit.toFixed(1)+'°.');
  if(_ttlJalan('sabuk')){_sbFrame++; requestAnimationFrame(drawSabuk);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Kelonggaran poros-lubang: dari longgar ke interferensi
// ════════════════════════════════════════════════════════════
let _clFrame=0;
function toggleClearance(){_ttlToggle('clearance','btnClearance',drawClearance);}
window.toggleClearance=toggleClearance;
function drawClearance(){
  const k=_ttlKanvas('cvClearance',_cad11TinggiSempit('cvClearance',[[244,400],[274,385],[298,348],[1e9,335]])); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const D=_ttlNilai('sl_cl_D',25), dS=_ttlNilai('sl_cl_d',24.94);
  _ttlTulis('v_cl_D',D.toFixed(1).replace('.',',')); _ttlTulis('v_cl_d',dS.toFixed(2).replace('.',','));
  const d=_ttlJalan('clearance')?dS+0.08*Math.sin(_clFrame/40):dS;
  const c=(D-d)/2, zoom=300;
  const judul='Penampang poros di dalam lubang — celah radial diperbesar '+zoom+'× agar terlihat';
  const tb=sempit?_cad11Muat(ctx,judul,12,16,W-24,_C11T,_F11_10,'left',13):_cad11Muat(ctx,judul,12,18,W-16,_C11T,_F11_11,'left',14);
  // Bus persegi berjarak m dari lubang. Layar lebar: lubang di kiri dan dua label di bawah bus kini di dalam kanvas
  // (dulu jatuh di bawah tepi bawah, dan bus menyentuh judul); layar sempit: lubang di tengah, angka di bawahnya.
  let m, R, cx, cy, yL, tx, ty;
  if(sempit){m=14; R=Math.max(10,Math.min((W-28-2*m)/2,50)); cx=W/2; cy=29+tb+6+m+R; yL=cy+R+m+14; tx=14; ty=yL+35;}
  else{m=24; R=Math.max(10,Math.min(W*0.22,(H-112-tb)/2)); cx=W*0.26; cy=30+tb+m+R; yL=cy+R+m+12; tx=W*0.56; ty=H*0.2;}
  // celah diperbesar 300x relatif (skala gambar: R setara 120 px); jari-jari poros dijepit agar tetap di dalam bus
  const rd=Math.max(4,Math.min(R+m-4,R-c*zoom*R/120));
  const warna=c>0?_C11G:(c<0?_C11R:_C11A);
  // bus (persegi) dan lubang
  _cad11Kotak(ctx,cx-R-m,cy-R-m,2*R+2*m,2*R+2*m,'rgba(148,163,184,.08)','rgba(148,163,184,.6)',1.2);
  _cad11Lingkar(ctx,cx,cy,R,'#0a101f',_C11C,1.8);
  // poros; bila interferensi, cincin tumpang tindih merah
  if(c<0){_cad11Lingkar(ctx,cx,cy,rd,'rgba(239,68,68,.35)',_C11R,1.8); _cad11Lingkar(ctx,cx,cy,R,null,_C11C,1.8,[4,3]);}
  else {_cad11Lingkar(ctx,cx,cy,rd,'rgba(245,158,11,.25)',_C11A,1.8);}
  // panah celah radial
  const ang=-0.6;
  if(c>0){_cad11Panah(ctx,cx+rd*Math.cos(ang),cy+rd*Math.sin(ang),cx+R*Math.cos(ang),cy+R*Math.sin(ang),_C11G); _cad11Teks(ctx,'c',cx+R*Math.cos(ang)+8,cy+R*Math.sin(ang)-4,_C11G,"bold 11px 'JetBrains Mono',monospace");}
  const lL=sempit?W-24:W*0.56-16;
  _cad11Muat(ctx,'lubang ⌀D (bus, grounded)',cx,yL,lL,_C11C,_F11_10,'center');
  _cad11Muat(ctx,'poros ⌀d (Cylindrical joint)',cx,yL+13,lL,_C11A,_F11_10,'center');
  const j=sempit?[16,15,18,16,15,16]:[22,18,26,24,18,22];
  const status=c>0?['KELONGGARAN',' — suaian longgar,',' poros bebas']:(c<0?['INTERFERENSI',' — poros menembus',' dinding']:['PAS — c = 0']);
  _cad11Kolom(ctx,[
    [['D = '+D.toFixed(2)+' mm,',' d = '+d.toFixed(3)+' mm'],_C11T,_F11_11,j[0]],
    [['c = (D − d)/2',' = '+c.toFixed(4)+' mm'],warna,_F11_11,j[1]],
    ['celah diameter = '+(2*c).toFixed(4)+' mm',_C11M,_F11_10,j[2]],
    [status,warna,"bold 11px 'JetBrains Mono',monospace",j[3]],
    [['Std Measure Distance',' dua silinder',' = '+(c>0?c.toFixed(4):'0')],_C11M,_F11_10,j[4]],
    [['Part Common volume',' = '+(c<0?'> 0 (tabrakan!)':'0')],c<0?_C11R:_C11M,_F11_10,j[5]],
    [['joint tetap terbentuk;',' tabrakan harus Anda periksa'],_C11M,_F11_10,0]],tx,ty,sempit?W-28:W-tx-8,13);
  _ttlTulis('clearanceInfo','D = '+D.toFixed(2)+', d = '+d.toFixed(3)+': c = ('+D.toFixed(2)+' − '+d.toFixed(3)+')/2 = '+c.toFixed(4)+' mm — '+(c>0?'kelonggaran (Std Measure Distance membaca angka ini)':(c<0?'interferensi: Part Common bervolume > 0, model harus dikoreksi':'pas'))+'.');
  if(_ttlJalan('clearance')){_clFrame++; requestAnimationFrame(drawClearance);}
}

_TTL_DAFTAR.push(['cvEngkol',()=>drawEngkol(),'engkol',['sl_ek_r','sl_ek_l','sl_ek_th']]);
_TTL_DAFTAR.push(['cvPusatMassa',()=>drawPusatMassa(),'pusatmassa',['sl_pm_x','sl_pm_d','sl_pm_h']]);
_TTL_DAFTAR.push(['cvSabuk',()=>drawSabuk(),'sabuk',['sl_sb_d1','sl_sb_d2','sl_sb_c']]);
_TTL_DAFTAR.push(['cvClearance',()=>drawClearance(),'clearance',['sl_cl_D','sl_cl_d']]);
_ttlMulai();
