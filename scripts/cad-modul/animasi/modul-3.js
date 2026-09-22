// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 3 PEMODELAN CAD — Bentuk Dasar 2D, Pengukuran, dan Transformasi Objek
// Kanvas: cvBentuk, cvUkur, cvPutar, cvTransform (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// ════════════════════════════════════════════════════════════
const _CAD3_X='#ef4444', _CAD3_Y='#22c55e';
// skMaks (opsional): batas atas skala px/mm, mis. agar gambar tidak naik ke baris keterangan di atasnya.
function _cad3Kisi(ctx,W,H,lebarMm,tinggiMm,padL,padB,ox0,oy0,skMaks){
  const sk=Math.max(0.05,Math.min((W-padL-24)/lebarMm,(H-padB-26)/tinggiMm,skMaks||Infinity));
  const ox=padL+(ox0||0)*sk, oy=H-padB-(oy0||0)*sk;
  const X=x=>ox+x*sk, Y=y=>oy-y*sk;
  ctx.strokeStyle='rgba(148,163,184,.12)'; ctx.lineWidth=1;
  for(let x=-(ox0||0);x<=lebarMm-(ox0||0);x+=10){ctx.beginPath(); ctx.moveTo(X(x),Y(-(oy0||0))); ctx.lineTo(X(x),Y(tinggiMm-(oy0||0))); ctx.stroke();}
  for(let y=-(oy0||0);y<=tinggiMm-(oy0||0);y+=10){ctx.beginPath(); ctx.moveTo(X(-(ox0||0)),Y(y)); ctx.lineTo(X(lebarMm-(ox0||0)),Y(y)); ctx.stroke();}
  ctx.strokeStyle=_CAD3_X; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(X(-(ox0||0)),Y(0)); ctx.lineTo(X(lebarMm-(ox0||0)),Y(0)); ctx.stroke();
  ctx.strokeStyle=_CAD3_Y; ctx.beginPath(); ctx.moveTo(X(0),Y(-(oy0||0))); ctx.lineTo(X(0),Y(tinggiMm-(oy0||0))); ctx.stroke();
  return {X,Y,sk};
}
function _cad3Poli(ctx,X,Y,pts,isi,garis,lebar,putus){
  ctx.fillStyle=isi; ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.6; ctx.setLineDash(putus||[]);
  ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1]))); ctx.closePath(); if(isi) ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
}
function _cad3Titik(ctx,x,y,warna,r){ctx.fillStyle=warna; ctx.beginPath(); ctx.arc(x,y,r||3.5,0,Math.PI*2); ctx.fill();}
// Memecah bagian-bagian teks menjadi baris selebar maksimal maxW (font ctx saat ini): bagian digabung
// dengan pemisah sep (string, atau larik: sep[i] dipakai sebelum bagian[i]) selama masih muat.
function _cad3Pecah(ctx,bagian,sep,maxW){
  const baris=[]; let kini='';
  bagian.forEach((b,i)=>{const s=Array.isArray(sep)?sep[i]:sep; const coba=kini?kini+s+b:b; if(kini&&ctx.measureText(coba).width>maxW){baris.push(kini); kini=b;} else kini=coba;});
  if(kini) baris.push(kini);
  return baris;
}
// Menulis baris-baris mulai dari y (jarak lh); baris yang tetap kepanjangan dikecilkan/dipecah _ttlTeks.
function _cad3Baris(ctx,baris,x,y,maxW,lh){let yy=y; baris.forEach(t=>{yy=_ttlTeks(ctx,t,x,yy,maxW,{lh});}); return yy;}
// Baris teks kepala kanvas: di layar lebar satu baris 11 px (bagian digabung dengan sep, sama persis
// dengan teks semula); di ponsel (W < _TTL_SEMPIT) 10 px dan dipecah per bagian selebar kanvas.
// Font ctx diatur di sini; {baris, lh} diteruskan ke _cad3Baris(ctx, baris, 12, 18, W-24, lh).
function _cad3Kepala(ctx,W,bagian,sep){
  const sempit=W<_TTL_SEMPIT;
  ctx.font=sempit?"10px 'JetBrains Mono',monospace":"11px 'JetBrains Mono',monospace";
  const baris=sempit?_cad3Pecah(ctx,bagian,sep,W-24):[bagian.map((b,i)=>i?(Array.isArray(sep)?sep[i]:sep)+b:b).join('')];
  return {baris,lh:sempit?13:14};
}
// Kotak tinta teks rata ctx.textAlign di (x, y) dengan font ctx saat ini, diperlebar pad px: [x0, y0, x1, y1].
function _cad3Kotak(ctx,s,x,y,pad){const u=ctx.measureText(s), p=pad||0; return [x-u.actualBoundingBoxLeft-p,y-u.actualBoundingBoxAscent-p,x+u.actualBoundingBoxRight+p,y+u.actualBoundingBoxDescent+p];}
// Kotak baris-baris teks rata kiri mulai (x, y) berjarak lh (font ctx saat ini), untuk dihindari label lain.
function _cad3KotakBaris(ctx,baris,x,y,lh){return [x-2,y-11,x+Math.max(...baris.map(t=>ctx.measureText(t).width))+2,y+(baris.length-1)*lh+5];}
// Menaruh label rata kiri tanpa saling menimpa. label = [{s, warna, calon:[[x,y],...]}] (font 10 px); untuk tiap
// label dipilih calon pertama yang, sesudah dijepit ke dalam batas [x0,y0,x1,y1], tidak mengiris kotak di
// `terpakai`; bila semua calon mengiris, dipakai calon dengan irisan tersempit. Kotak yang dipilih ditambahkan
// ke `terpakai` (jarak 2 px), jadi urutan label = urutan prioritas.
function _cad3Tata(ctx,label,terpakai,batas){
  const iris=(p,q)=>Math.max(0,Math.min(p[2],q[2])-Math.max(p[0],q[0]))*Math.max(0,Math.min(p[3],q[3])-Math.max(p[1],q[1]));
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  label.forEach(L=>{
    const u=ctx.measureText(L.s), kr=u.actualBoundingBoxLeft, kn=u.actualBoundingBoxRight, at=u.actualBoundingBoxAscent, bw=u.actualBoundingBoxDescent;
    let pilih=null, sisa=Infinity;
    for(const [cx,cy] of L.calon){
      const x=Math.max(batas[0]+kr,Math.min(batas[2]-kn,cx)), y=Math.max(batas[1]+at,Math.min(batas[3]-bw,cy));
      const k=[x-kr-2,y-at-2,x+kn+2,y+bw+2], luas=terpakai.reduce((t,q)=>t+iris(k,q),0);
      if(luas<sisa){sisa=luas; pilih=[x,y,k];}
      if(!luas) break;
    }
    terpakai.push(pilih[2]); ctx.fillStyle=L.warna; ctx.fillText(L.s,pilih[0],pilih[1]);
  });
}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Poligon beraturan: DrawMode inscribed vs circumscribed
// ════════════════════════════════════════════════════════════
let _btFrame=0;
function toggleBentuk(){_ttlToggle('bentuk','btnBentuk',drawBentuk);}
window.toggleBentuk=toggleBentuk;
function drawBentuk(){
  // Layar lebar: poligon di kiri, keterangan di kanan. Ponsel: poligon di atas dan keterangan di bawahnya
  // (kanvas ditinggikan), karena kolom keterangan di x = 0,66W dulu keluar tepi kanan.
  const k=_ttlKanvas('cvBentuk',330); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const n=Math.round(_ttlNilai('sl_bt_n',6)), R=_ttlNilai('sl_bt_R',40), mode=Math.round(_ttlNilai('sl_bt_mode',2));
  _ttlTulis('v_bt_n',String(n)); _ttlTulis('v_bt_R',R.toFixed(0)); _ttlTulis('v_bt_mode',['inscribed','circumscribed','keduanya'][mode]);
  const Rc=R/Math.cos(Math.PI/n);
  const rPx=sempit?Math.min(W*0.4,95):Math.min(W*0.3,H*0.42);
  const cx=sempit?W*0.5:W*0.34, cy=sempit?12+rPx:H*0.52;
  // Skala mengikuti lingkaran R seperti semula, tetapi dibatasi agar sudut poligon circumscribed
  // (Rc = R/cos(π/n), sampai 2R pada n = 3) tidak keluar kanvas.
  const rBatas=sempit?rPx:Math.min(cy,H-cy)-4;
  const sk=Math.max(0.05,Math.min(rPx/(R*1.15),mode!==0?rBatas/Rc:Infinity));
  const putar=_ttlJalan('bentuk')?_btFrame*0.003:0;
  ctx.strokeStyle='rgba(245,158,11,.75)'; ctx.lineWidth=1.4; ctx.setLineDash([5,4]); ctx.beginPath(); ctx.arc(cx,cy,R*sk,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
  const poli=(rad)=>{const p=[]; for(let i=0;i<n;i++){const th=putar+Math.PI/2+i*2*Math.PI/n; p.push([cx+rad*sk*Math.cos(th),cy-rad*sk*Math.sin(th)]);} return p;};
  const gambar=(p,isi,garis)=>{ctx.fillStyle=isi; ctx.strokeStyle=garis; ctx.lineWidth=2; ctx.beginPath(); p.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.closePath(); ctx.fill(); ctx.stroke();};
  if(mode!==0){const pc=poli(Rc).map(([x,y])=>{const dx=x-cx,dy=y-cy,ang=Math.atan2(dy,dx)+Math.PI/n; const r=Math.hypot(dx,dy); return [cx+r*Math.cos(ang),cy+r*Math.sin(ang)];}); gambar(pc,'rgba(168,85,247,.10)','#a855f7');}
  if(mode!==1) gambar(poli(R),'rgba(34,211,238,.16)','#22d3ee');
  _cad3Titik(ctx,cx,cy,'#f59e0b',3);
  ctx.strokeStyle='#f59e0b'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+R*sk*Math.cos(putar+Math.PI/2),cy-R*sk*Math.sin(putar+Math.PI/2)); ctx.stroke();
  const Ain=n*R*R*Math.sin(2*Math.PI/n)/2, Acirc=n*R*R*Math.tan(Math.PI/n);
  // Keterangan: [font, warna, teks, jarak y di layar lebar, jarak y di ponsel]. Di layar lebar kolomnya
  // digeser ke kiri seperlunya bila baris terlebar akan melewati tepi kanan (lebar 570).
  const teks=[
    ["11px",'rgba(226,232,240,.92)','Draft Polygon n = '+n+', R = '+R+' mm',0,0],
    ["11px",'#22d3ee','inscribed (bawaan):',26,21], ["11px",'#22d3ee','A = ½nR²sin(2π/n) = '+Ain.toFixed(2),44,36],
    ["11px",'#a855f7','circumscribed:',72,57], ["11px",'#a855f7','A = nR²tan(π/n) = '+Acirc.toFixed(2),90,72],
    ["10px",'rgba(148,163,184,.85)','rasio = 1/cos²(π/n) = '+(Acirc/Ain).toFixed(4),114,92]];
  ctx.textAlign='left';
  const lebarMaks=Math.max(...teks.map(([f,,s])=>{ctx.font=f+" 'JetBrains Mono',monospace"; return ctx.measureText(s).width;}));
  const tx=sempit?12:Math.min(W*0.66,W-lebarMaks-10), ty=sempit?cy+rPx+24:H*0.28;
  teks.forEach(([f,w,s,dy,dyS])=>{ctx.font=f+" 'JetBrains Mono',monospace"; ctx.fillStyle=w; _ttlTeks(ctx,s,tx,ty+(sempit?dyS:dy),W-tx-6);});
  _ttlTulis('bentukInfo','Sudut poligon inscribed berada pada lingkaran radius R (luas '+Ain.toFixed(2)+' mm²); sisi poligon circumscribed menyinggung lingkaran yang sama (luas '+Acirc.toFixed(2)+' mm²); makin banyak sisi, keduanya makin mendekati luas lingkaran '+(Math.PI*R*R).toFixed(2)+' mm²');
  if(_ttlJalan('bentuk')){_btFrame++; requestAnimationFrame(drawBentuk);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Pengukuran segitiga: titik berat, jarak titik–garis, sudut
// ════════════════════════════════════════════════════════════
let _ukFrame=0;
function toggleUkur(){_ttlToggle('ukur','btnUkur',drawUkur);}
window.toggleUkur=toggleUkur;
function drawUkur(){
  // Ponsel: kanvas sedikit ditinggikan agar baris-baris keterangan ukuran muat di atas segitiga.
  const k=_ttlKanvas('cvUkur',320); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const a=_ttlNilai('sl_uk_a',120), c=_ttlNilai('sl_uk_c',40), h=_ttlNilai('sl_uk_h',70);
  _ttlTulis('v_uk_a',a.toFixed(0)); _ttlTulis('v_uk_c',c.toFixed(0)); _ttlTulis('v_uk_h',h.toFixed(0));
  const fase=_ttlJalan('ukur')?Math.floor((_ukFrame/80)%3):3;
  // Teks fase dihitung lebih dulu: kotaknya dihindari label ukuran, dan di ponsel baris keterangan di bawahnya
  // membatasi skala segitiga agar puncaknya (h maksimum 110) tidak naik menimpa keterangan.
  const frase=[['Shape.CenterOfMass →','titik berat G'],['Std Measure Distance:','vertex A → edge BC'],['Std Measure Angle:','edge AB dan edge BC'],['Tiga pengukuran sekaligus']];
  const kp=_cad3Kepala(ctx,W,frase[fase],' '), kotakKepala=_cad3KotakBaris(ctx,kp.baris,12,18,kp.lh);
  const nMaks=Math.max(...frase.map(f=>_cad3Pecah(ctx,f,' ',W-24).length)), yLeg=18+nMaks*kp.lh+3;
  const {X,Y}=_cad3Kisi(ctx,W,H,200,130,52,34,10,10,sempit?(H-50-(yLeg+3*kp.lh+4))/120:0);
  const A=[0,0],B=[a,0],C=[c,h];
  _cad3Poli(ctx,X,Y,[A,B,C],'rgba(34,211,238,.14)','#22d3ee',2);
  const G=[(a+c)/3,h/3];
  // kaki tegak lurus dari A ke BC
  const bx=c-a, by=h, L2=bx*bx+by*by, tt=((0-a)*bx+(0-0)*by)/L2, F=[a+tt*bx,tt*by];
  const dAG=Math.hypot(c-G[0],h-G[1]), dABC=Math.abs(a*h)/Math.sqrt((c-a)**2+h*h), sudutB=Math.atan2(h,a-c)*180/Math.PI;
  // median ke titik berat
  ctx.strokeStyle='rgba(148,163,184,.35)'; ctx.setLineDash([3,3]); ctx.lineWidth=1;
  [[A,[(a+c)/2,h/2]],[B,[c/2,h/2]],[C,[a/2,0]]].forEach(([p,q])=>{ctx.beginPath(); ctx.moveTo(X(p[0]),Y(p[1])); ctx.lineTo(X(q[0]),Y(q[1])); ctx.stroke();}); ctx.setLineDash([]);
  _cad3Titik(ctx,X(G[0]),Y(G[1]),'#00e09e',4.5);
  ctx.fillStyle='#e2e8f0'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  const titikLbl=[['A',X(0)-12,Y(0)+12],['B',X(a)+4,Y(0)+12],['C',X(c)-4,Y(h)-6]];
  titikLbl.forEach(([s,x,y])=>ctx.fillText(s,x,y));
  // |a − c|: bila C di kanan B (c > a) radius busur tidak boleh negatif (arc melempar galat).
  const rB=Math.min(Math.abs(a-c),40)*0.35*(X(1)-X(0)), tB='∠B = '+sudutB.toFixed(3)+'°';
  const tG='G ('+G[0].toFixed(2)+', '+G[1].toFixed(2)+')', tCG='CG = '+dAG.toFixed(3), tD='d(A, BC) = '+dABC.toFixed(3);
  if(fase===0||fase===3){ctx.strokeStyle='#00e09e'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(X(c),Y(h)); ctx.lineTo(X(G[0]),Y(G[1])); ctx.stroke();}
  if(fase===1||fase===3){ctx.strokeStyle='#f59e0b'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(F[0]),Y(F[1])); ctx.stroke(); _cad3Titik(ctx,X(F[0]),Y(F[1]),'#f59e0b',3);}
  // Busur ∠B di antara BA (arah kiri) dan BC (ke atas); dulu tercermin ke bawah sumbu X.
  if(fase===2||fase===3){ctx.strokeStyle='#a855f7'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(X(a),Y(0),rB,Math.PI,Math.PI+Math.atan2(h,a-c)); ctx.stroke();}
  if(!sempit){
    // Layar lebar: label ukuran menempel pada gambarnya. Tiap label punya beberapa calon posisi; yang dipilih
    // tidak menimpa label titik A/B/C, teks fase, maupun label lain (saat dijeda keempatnya tampil sekaligus).
    const terpakai=titikLbl.map(([s,x,y])=>_cad3Kotak(ctx,s,x,y,2)); terpakai.push(kotakKepala);
    const w=s=>ctx.measureText(s).width, g=[X(G[0]),Y(G[1])], mCG=[X((c+G[0])/2),Y((h+G[1])/2)], mD=[X(F[0]/2),Y(F[1]/2)];
    const lbl=[];
    if(fase>=2) lbl.push({s:tB,warna:'#a855f7',calon:[[X(a)-rB*2.4,Y(0)-rB*0.6],[X(a)-rB-8-w(tB),Y(0)-5],[X(a)-w(tB)-6,Y(0)-rB-8],[X(a)+8,Y(0)-rB-4],[X(a)-w(tB)/2,Y(0)+26]]});
    if(fase===1||fase===3) lbl.push({s:tD,warna:'#f59e0b',calon:[[mD[0]+6,mD[1]-8],[mD[0]-6-w(tD),mD[1]-8],[mD[0]+6,mD[1]+14],[mD[0]-6-w(tD),mD[1]+14],[mD[0]+6,mD[1]-20],[mD[0]-6-w(tD),mD[1]-20]]});
    if(fase===0||fase===3) lbl.push({s:tCG,warna:'#00e09e',calon:[[mCG[0]+8,mCG[1]],[mCG[0]-8-w(tCG),mCG[1]],[mCG[0]+8,mCG[1]-12],[mCG[0]+8,mCG[1]+14],[mCG[0]-8-w(tCG),mCG[1]-12],[mCG[0]-8-w(tCG),mCG[1]+14]]});
    lbl.push({s:tG,warna:'#00e09e',calon:[[g[0]+6,g[1]+12],[g[0]+6,g[1]-8],[g[0]-6-w(tG),g[1]+12],[g[0]-6-w(tG),g[1]-8],[g[0]-w(tG)/2,g[1]+24],[g[0]-w(tG)/2,g[1]-18]]});
    _cad3Tata(ctx,lbl,terpakai,[4,4,W-4,H-4]);
  } else {ctx.fillStyle='#00e09e'; ctx.fillText('G',X(G[0])+6,Y(G[1])+12);}
  // Teks fase: di ponsel dipecah per bagian kalimat.
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font=sempit?"10px 'JetBrains Mono',monospace":"11px 'JetBrains Mono',monospace";
  _cad3Baris(ctx,kp.baris,12,18,W-24,kp.lh);
  if(sempit){
    // Ponsel: segitiganya terlalu kecil untuk empat label (saat dijeda saling menimpa), jadi titik berat cukup
    // ditandai "G" dan nilainya ditulis sebagai baris keterangan berwarna di tempat tetap (tidak meloncat antarfase).
    let y=yLeg;
    ctx.font="10px 'JetBrains Mono',monospace";
    [[true,'#00e09e',tG],[fase===0||fase===3,'#00e09e',tCG],[fase===1||fase===3,'#f59e0b',tD],[fase===2||fase===3,'#a855f7',tB]].forEach(([tampil,w,s])=>{if(tampil){ctx.fillStyle=w; _ttlTeks(ctx,s,12,y,W-24);} y+=kp.lh;});
  }
  _ttlTulis('ukurInfo','G = ((0 + '+a+' + '+c+')/3, (0 + 0 + '+h+')/3); jarak CG = '+dAG.toFixed(3)+' mm; jarak A ke garis BC = a·h/|BC| = '+dABC.toFixed(3)+' mm; sudut di B = arctan(h/(a − c)) = '+sudutB.toFixed(3)+'°');
  if(_ttlJalan('ukur')){_ukFrame++; requestAnimationFrame(drawUkur);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Rotate: garis diputar di titik asal, jarak kedua ujung bebas
// ════════════════════════════════════════════════════════════
let _ptFrame=0;
function togglePutar(){_ttlToggle('putar','btnPutar',drawPutar);}
window.togglePutar=togglePutar;
function drawPutar(){
  const k=_ttlKanvas('cvPutar'); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const L=_ttlNilai('sl_pt_L',100), thMaks=_ttlNilai('sl_pt_th',40);
  _ttlTulis('v_pt_L',L.toFixed(0)); _ttlTulis('v_pt_th',thMaks.toFixed(0)+'°');
  const th=_ttlJalan('putar')?thMaks*(0.5+0.5*Math.sin(_ptFrame/50-Math.PI/2)):thMaks;
  const {X,Y}=_cad3Kisi(ctx,W,H,180,140,52,34,20,20);
  const rad=th*Math.PI/180, P=[L,0], Q=[L*Math.cos(rad),L*Math.sin(rad)];
  ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(P[0]),Y(P[1])); ctx.stroke();
  ctx.strokeStyle='#f59e0b'; ctx.beginPath(); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(Q[0]),Y(Q[1])); ctx.stroke();
  ctx.strokeStyle='rgba(245,158,11,.5)'; ctx.lineWidth=1; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.arc(X(0),Y(0),L*(X(1)-X(0)),-rad,0); ctx.stroke(); ctx.setLineDash([]);
  const rr=Math.min(L,40)*0.5*(X(1)-X(0)); ctx.strokeStyle='#a855f7'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(X(0),Y(0),rr,-rad,0); ctx.stroke();
  ctx.fillStyle='#a855f7'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('θ = '+th.toFixed(1)+'°',X(0)+rr*1.1,Y(0)-rr*0.4);
  const d=2*L*Math.sin(rad/2), tD='d = 2L·sin(θ/2) = '+d.toFixed(3);
  ctx.strokeStyle='#00e09e'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(X(P[0]),Y(P[1])); ctx.lineTo(X(Q[0]),Y(Q[1])); ctx.stroke();
  _cad3Titik(ctx,X(P[0]),Y(P[1]),'#22d3ee'); _cad3Titik(ctx,X(Q[0]),Y(Q[1]),'#f59e0b'); _cad3Titik(ctx,X(0),Y(0),'#e2e8f0',3);
  // Label d: di layar lebar menempel di tengah tali busur; di ponsel labelnya keluar tepi kanan dan menimpa
  // label θ, jadi ditulis sebagai baris hijau (warna tali busur) di bawah teks kepala.
  if(!sempit){ctx.fillStyle='#00e09e'; ctx.fillText(tD,X((P[0]+Q[0])/2)+8,Y((P[1]+Q[1])/2));}
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.textAlign='left';
  const kp=_cad3Kepala(ctx,W,['Draft Rotate (Copy):','pusat (0,0),','sudut acuan 0°,','sudut rotasi θ'],' ');
  const yBawah=_cad3Baris(ctx,kp.baris,12,18,W-24,kp.lh);
  if(sempit){ctx.fillStyle='#00e09e'; ctx.font="10px 'JetBrains Mono',monospace"; _ttlTeks(ctx,tD,12,yBawah+2,W-24);}
  _ttlTulis('putarInfo','Kedua ujung bebas berjarak L = '+L+' dari pusat; tali busur di antara keduanya d = 2·'+L+'·sin('+(th/2).toFixed(2)+'°) = '+d.toFixed(3)+' mm; ujung yang diputar berada di ('+Q[0].toFixed(2)+', '+Q[1].toFixed(2)+')');
  if(_ttlJalan('putar')){_ptFrame++; requestAnimationFrame(drawPutar);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Move, Rotate, Scale pada satu persegi panjang + kotak pembatas
// ════════════════════════════════════════════════════════════
let _tfFrame=0;
function toggleTransform(){_ttlToggle('transform','btnTransform',drawTransform);}
window.toggleTransform=toggleTransform;
function drawTransform(){
  const k=_ttlKanvas('cvTransform'); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const dx=_ttlNilai('sl_tf_dx',80), dy=_ttlNilai('sl_tf_dy',45), th=_ttlNilai('sl_tf_th',30), kf=_ttlNilai('sl_tf_k',1.5);
  _ttlTulis('v_tf_dx',dx.toFixed(0)); _ttlTulis('v_tf_dy',dy.toFixed(0)); _ttlTulis('v_tf_th',th.toFixed(0)+'°'); _ttlTulis('v_tf_k',kf.toFixed(2));
  const a=100,b=40, rad=th*Math.PI/180;
  const {X,Y}=_cad3Kisi(ctx,W,H,300,180,52,34,40,30);
  const asal=[[0,0],[a,0],[a,b],[0,b]];
  const fase=_ttlJalan('transform')?Math.floor((_tfFrame/90)%3):3;
  _cad3Poli(ctx,X,Y,asal,'rgba(34,211,238,.16)','#22d3ee',2);
  const pindah=asal.map(([x,y])=>[x+dx,y+dy]);
  const putar=asal.map(([x,y])=>[x*Math.cos(rad)-y*Math.sin(rad),x*Math.sin(rad)+y*Math.cos(rad)]);
  const skala=asal.map(([x,y])=>[x*kf,y*kf]);
  const ymax=a*Math.sin(rad)+b*Math.cos(rad), xmin=-b*Math.sin(rad);
  // Label tiap transformasi: di layar lebar menempel pada bentuknya; di ponsel labelnya keluar tepi kanan
  // dan saling menimpa, jadi ditulis sebagai baris keterangan berwarna sama di bawah teks kepala.
  const lMove='Move |v| = '+Math.hypot(dx,dy).toFixed(3), lRot='Rotate θ: BoundBox YMax = '+ymax.toFixed(3), lSkala='Scale k: luas = k²·'+(a*b)+' = '+(kf*kf*a*b).toFixed(1);
  if(fase===0||fase===3){_cad3Poli(ctx,X,Y,pindah,'rgba(0,224,158,.10)','#00e09e',1.6,[6,4]); ctx.strokeStyle='#00e09e'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(dx),Y(dy)); ctx.stroke();}
  if(fase===1||fase===3){_cad3Poli(ctx,X,Y,putar,'rgba(245,158,11,.10)','#f59e0b',1.6); ctx.strokeStyle='rgba(245,158,11,.5)'; ctx.setLineDash([3,3]); ctx.strokeRect(X(xmin),Y(ymax),(a*Math.cos(rad)-xmin)*(X(1)-X(0)),ymax*(X(1)-X(0))); ctx.setLineDash([]);}
  if(fase===2||fase===3){_cad3Poli(ctx,X,Y,skala,null,'#a855f7',1.6,[2,3]);}
  _cad3Titik(ctx,X(0),Y(0),'#e2e8f0',3);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.textAlign='left';
  const frase=[['Draft Move (Copy)','vektor (dx, dy)'],['Draft Rotate','di titik asal','sebesar θ'],['Draft Scale (Copy)','faktor k','di titik asal'],['Tiga transformasi','pada persegi panjang',a+' × '+b]];
  const kp=_cad3Kepala(ctx,W,frase[fase],' '), kotakKepala=_cad3KotakBaris(ctx,kp.baris,12,18,kp.lh);
  _cad3Baris(ctx,kp.baris,12,18,W-24,kp.lh);
  if(!sempit){
    // Layar lebar: tiap label menempel pada bentuknya dengan beberapa calon posisi (termasuk di bawah sumbu X)
    // agar tidak saling menimpa saat dijeda dan tidak keluar tepi kanan pada lebar 520-540.
    ctx.font="10px 'JetBrains Mono',monospace"; const w=s=>ctx.measureText(s).width, yb=Y(0)+14;
    const lbl=[];
    if(fase===0||fase===3) lbl.push({s:lMove,warna:'#00e09e',calon:[[X(dx)+6,Y(dy)-6],[X(dx)+6,Y(dy)+14],[X(dx+a)+6,Y(dy+b)+12],[X(dx)-6-w(lMove),Y(dy)-6],[X(dx+a/2)-w(lMove)/2,Y(dy+b)-6],[X(0)+8,yb]]});
    if(fase===1||fase===3) lbl.push({s:lRot,warna:'#f59e0b',calon:[[X(xmin),Y(ymax)-6],[X(xmin),Y(ymax)-18],[X(xmin)+4,Y(ymax)+14],[X(a*Math.cos(rad))+6,Y(ymax)+12],[X(0)+8,yb+12],[X(0)+8,yb]]});
    if(fase===2||fase===3) lbl.push({s:lSkala,warna:'#a855f7',calon:[[X(a*kf)-60,Y(b*kf)-6],[X(a*kf)-w(lSkala),Y(b*kf)-6],[X(a*kf)-w(lSkala),Y(b*kf)-18],[X(a*kf)+6,Y(b*kf)-6],[X(a*kf)-w(lSkala),Y(b*kf)+14],[X(0)+8,yb+24]]});
    _cad3Tata(ctx,lbl,[kotakKepala],[4,4,W-4,H-4]);
  }
  if(sempit){
    // Tempat baris keterangan tetap (dihitung dari teks fase terpanjang) agar tidak meloncat antarfase.
    const nMaks=Math.max(...frase.map(f=>_cad3Pecah(ctx,f,' ',W-24).length));
    let y=18+nMaks*kp.lh+3;
    ctx.font="10px 'JetBrains Mono',monospace";
    [[fase===0||fase===3,'#00e09e',lMove],[fase===1||fase===3,'#f59e0b',lRot],[fase===2||fase===3,'#a855f7',lSkala]].forEach(([tampil,w,s])=>{if(tampil){ctx.fillStyle=w; _ttlTeks(ctx,s,12,y,W-24);} y+=kp.lh;});
  }
  _ttlTulis('transformInfo','Move: jarak sudut asal–salinan √('+dx+'² + '+dy+'²) = '+Math.hypot(dx,dy).toFixed(3)+' mm · Rotate: YMax = a·sin θ + b·cos θ = '+(a*Math.sin(rad)+b*Math.cos(rad)).toFixed(3)+' mm · Scale: luas '+(kf*kf*a*b).toFixed(1)+' mm² (k² = '+(kf*kf).toFixed(3)+')');
  if(_ttlJalan('transform')){_tfFrame++; requestAnimationFrame(drawTransform);}
}

_TTL_DAFTAR.push(['cvBentuk',()=>drawBentuk(),'bentuk',['sl_bt_n','sl_bt_R','sl_bt_mode']]);
_TTL_DAFTAR.push(['cvUkur',()=>drawUkur(),'ukur',['sl_uk_a','sl_uk_c','sl_uk_h']]);
_TTL_DAFTAR.push(['cvPutar',()=>drawPutar(),'putar',['sl_pt_L','sl_pt_th']]);
_TTL_DAFTAR.push(['cvTransform',()=>drawTransform(),'transform',['sl_tf_dx','sl_tf_dy','sl_tf_th','sl_tf_k']]);
_ttlMulai();
