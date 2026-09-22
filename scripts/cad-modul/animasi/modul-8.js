// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 8 PEMODELAN CAD — Simulasi Kinerja Komponen (FEM Workbench + CalculiX)
// Kanvas: cvMesh, cvDefleksi, cvKalor, cvGetar (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// Kanvas sempit (W < _TTL_SEMPIT, ponsel): judul dipecah per frasa, gambar selebar kanvas, kolom rumus
// pindah ke bawah gambar; kanvas dipertinggi lewat _ttlKanvas(id, hSempit). Tata letak lebar tetap.
// ════════════════════════════════════════════════════════════
const _CAD8_E=210000, _CAD8_RHO=7850, _CAD8_BETA=[1.875104,4.694091,7.854757];
const _C8F11="11px 'JetBrains Mono',monospace", _C8F10="10px 'JetBrains Mono',monospace";
const _C8TEKS='rgba(226,232,240,.92)', _C8ABU='rgba(148,163,184,.85)';
function _cad8Dinding(ctx,x,y0,y1){
  ctx.strokeStyle='#e2e8f0'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x,y0); ctx.lineTo(x,y1); ctx.stroke();
  ctx.lineWidth=.8; ctx.strokeStyle='#94a3b8';
  for(let y=y0;y<y1;y+=7){ctx.beginPath(); ctx.moveTo(x,y+7); ctx.lineTo(x-6,y); ctx.stroke();}
}
function _cad8Panah(ctx,x1,y1,x2,y2,w,lebar){
  const a=Math.atan2(y2-y1,x2-x1);
  ctx.strokeStyle=w; ctx.fillStyle=w; ctx.lineWidth=lebar||1.6;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2-8*Math.cos(a),y2-8*Math.sin(a)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-9*Math.cos(a)+4*Math.sin(a),y2-9*Math.sin(a)-4*Math.cos(a)); ctx.lineTo(x2-9*Math.cos(a)-4*Math.sin(a),y2-9*Math.sin(a)+4*Math.cos(a)); ctx.closePath(); ctx.fill();
}
function _cad8Id(x,d){return x.toLocaleString('id-ID',{maximumFractionDigits:d,minimumFractionDigits:d});}
// Kolom teks: butir [warna, font, teks]; baris ke-i turun jarak[i] px dari baris sebelumnya (baris pertama di
// y + jarak[0]). Tiap baris dijaga muat maxW oleh _ttlTeks. Mengembalikan y baris terakhir.
function _cad8Kolom(ctx,x,y,maxW,butir,jarak){
  butir.forEach(([warna,font,teks],i)=>{y+=jarak[i]||0; ctx.fillStyle=warna; ctx.font=font; _ttlTeks(ctx,teks,x,y,maxW);});
  return y;
}
// Frasa digabung dengan penyambung (bawaan spasi) menjadi baris sesedikit mungkin selebar ≤ maxW pada ukuran
// huruf semula; baris hanya dipecah di antara frasa (penyambung di titik pecah dibuang). Tiap baris ditulis
// _ttlTeks dengan perataan ctx.textAlign, berjarak lh. Mengembalikan y sesudah baris terakhir.
function _cad8Frasa(ctx,frasa,x,y,maxW,lh,sambung){
  sambung=sambung||' '; let baris='';
  frasa.forEach(f=>{const coba=baris?baris+sambung+f:f; if(baris&&ctx.measureText(coba).width>maxW){_ttlTeks(ctx,baris,x,y,maxW); y+=lh; baris=f;} else baris=coba;});
  if(baris){_ttlTeks(ctx,baris,x,y,maxW); y+=lh;}
  return y;
}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Mesh makin halus (h-refinement) pada kantilever
// ════════════════════════════════════════════════════════════
let _cad8MsFrame=0;
function toggleMesh(){_ttlToggle('mesh8','btnMesh',drawMesh);}
window.toggleMesh=toggleMesh;
function drawMesh(){
  const k=_ttlKanvas('cvMesh',316); if(!k) return; const {ctx,W,H}=k; const sempit=W<_TTL_SEMPIT;
  const nM=Math.max(1,Math.round(_ttlNilai('sl_ms_n',4))), orde=Math.round(_ttlNilai('sl_ms_orde',2))===1?1:2;
  _ttlTulis('v_ms_n',String(nM)); _ttlTulis('v_ms_orde',orde===2?'2 (tet10)':'1 (tet4)');
  const n=_ttlJalan('mesh8')?1+Math.floor((_cad8MsFrame/45)%nM):nM;
  const L=180, h=15, b=30;
  // Ponsel: balok selebar kanvas (skala ≤ 2) di bawah judul dua baris; teks di bawah balok.
  const sk=sempit?Math.max(0.05,Math.min(2,(W-38)/L)):Math.max(0.05,Math.min((W*0.58)/(L+16),(H-90)/(h+10)));
  const ox=sempit?18:W*0.05, oy=sempit?82:H*0.42;
  const X=x=>ox+x*sk, Y=y=>oy+y*sk;
  const ny=n, nx=Math.round(n*L/h), dx=L/nx, dy=h/ny;
  ctx.fillStyle='rgba(34,211,238,.08)'; ctx.strokeStyle=orde===2?'rgba(245,158,11,.75)':'rgba(34,211,238,.75)'; ctx.lineWidth=n>5?0.5:0.8;
  for(let i=0;i<nx;i++) for(let j=0;j<ny;j++){
    const x0=X(i*dx), y0=Y(j*dy);
    ctx.beginPath(); ctx.rect(x0,y0,dx*sk,dy*sk); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x0+dx*sk,y0+dy*sk); ctx.stroke();
  }
  if(orde===2&&n<=3){
    ctx.fillStyle='#f59e0b';
    for(let i=0;i<=nx;i++) for(let j=0;j<ny;j++){ctx.beginPath(); ctx.arc(X(i*dx),Y((j+0.5)*dy),1.6,0,6.283); ctx.fill();}
    for(let i=0;i<nx;i++) for(let j=0;j<=ny;j++){ctx.beginPath(); ctx.arc(X((i+0.5)*dx),Y(j*dy),1.6,0,6.283); ctx.fill();}
    for(let i=0;i<nx;i++) for(let j=0;j<ny;j++){ctx.beginPath(); ctx.arc(X((i+0.5)*dx),Y((j+0.5)*dy),1.6,0,6.283); ctx.fill();}
  }
  _cad8Dinding(ctx,X(0),Y(0)-8,Y(h)+8);
  _cad8Panah(ctx,X(L)-3,Y(0)-34,X(L)-3,Y(0)-3,'#ef4444',1.6);
  ctx.fillStyle='#ef4444'; ctx.font="bold 11px 'JetBrains Mono',monospace"; ctx.textAlign='left'; ctx.fillText('F',X(L)+4,Y(0)-20);
  // Keterangan balok ditengahkan di bawahnya: satu baris bila muat (desktop); bila tidak, dipecah di antara frasa
  // tanpa melewati tepi kanvas atau masuk kolom rumus.
  const tx=W*0.66, xk=X(L/2);
  ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font=_C8F10; ctx.textAlign='center';
  const yKet=_cad8Frasa(ctx,['kantilever '+L+' × '+b+' × '+h+' mm',ny+' elemen sepanjang h, '+nx+' sepanjang L'],xk,Y(h)+26,2*Math.min(xk-8,(sempit?W-8:tx-10)-xk),13,' — ');
  ctx.textAlign='left';
  // taksiran jumlah elemen 3D dan konvergensi (model ilustratif, bukan hasil solver)
  const nz=Math.max(1,Math.round(n*b/h)); const nEl=nx*ny*nz*6;
  const nNode=orde===2?(2*nx+1)*(2*ny+1)*(2*nz+1):(nx+1)*(ny+1)*(nz+1);
  const rasio=orde===2?1-0.04/(n*n):1-0.55/Math.pow(n,1.1);
  const ukuran=h/n;
  const butir=[[_C8TEKS,_C8F11,'ukuran elemen ≈ '+ukuran.toFixed(2)+' mm'],['#22d3ee',_C8F11,'elemen tet ≈ '+_cad8Id(nEl,0)],['#22d3ee',_C8F11,'simpul ≈ '+_cad8Id(nNode,0)],
    [orde===2?'#f59e0b':'#22d3ee',_C8F11,(orde===2?'tet10 (orde 2)':'tet4 (orde 1)')+':'],['#00e09e',_C8F11,'δ_FEM/δ_rumus ≈ '+rasio.toFixed(3)],['#ef4444',_C8F11,'kesalahan ≈ '+((1-rasio)*100).toFixed(1)+' %']];
  let bx=tx, by=H*0.2+128, bw=W*0.28;
  if(sempit){by=_cad8Kolom(ctx,10,yKet+8,W-18,butir,[0,17,16,21,16,16])+12; bx=10; bw=Math.min(W-28,240);}
  else _cad8Kolom(ctx,tx,H*0.2,W-tx-2,butir,[0,22,20,30,20,20]);
  ctx.strokeStyle='rgba(148,163,184,.5)'; ctx.lineWidth=1; ctx.strokeRect(bx,by,bw,10);
  ctx.fillStyle='#00e09e'; ctx.fillRect(bx,by,bw*Math.max(0,rasio),10);
  ctx.strokeStyle='#f59e0b'; ctx.beginPath(); ctx.moveTo(bx+bw*0.98,by-3); ctx.lineTo(bx+bw*0.98,by+13); ctx.stroke();
  ctx.fillStyle=_C8ABU; ctx.font=_C8F10;
  _cad8Frasa(ctx,['konvergen bila > 98%','(garis kuning)','— ilustratif'],bx,by+26,W-bx-(sempit?8:2),13);
  const judul=['h-refinement: '+n+' elemen sepanjang','tebal, orde '+orde+(n===nM?' (mesh terhalus)':'')];
  if(sempit) _cad8Kolom(ctx,10,18,W-18,judul.map(s=>[_C8TEKS,_C8F11,s]),[0,15]);
  else {ctx.fillStyle=_C8TEKS; ctx.font=_C8F11; ctx.fillText(judul.join(' '),12,18);}
  _ttlTulis('infoMesh','Mesh '+n+' elemen sepanjang tebal (ukuran ≈ '+ukuran.toFixed(2)+' mm) ≈ '+nEl+' elemen tet; '+(orde===2?'tet10 mendekati rumus dengan cepat (rasio '+rasio.toFixed(3)+')':'tet4 terlalu kaku: rasio baru '+rasio.toFixed(3)+' sehingga δ terlalu kecil')+'. Perhalus sampai perubahan hasil antar-mesh < 2%.');
  if(_ttlJalan('mesh8')){_cad8MsFrame++; requestAnimationFrame(drawMesh);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Defleksi kantilever terhadap gaya F (skala tampilan diperbesar)
// ════════════════════════════════════════════════════════════
let _cad8DfFrame=0;
function toggleDefleksi(){_ttlToggle('defleksi8','btnDefleksi',drawDefleksi);}
window.toggleDefleksi=toggleDefleksi;
function drawDefleksi(){
  const k=_ttlKanvas('cvDefleksi',350); if(!k) return; const {ctx,W,H}=k; const sempit=W<_TTL_SEMPIT;
  const FM=_ttlNilai('sl_df_F',500), L=_ttlNilai('sl_df_L',180), b=_ttlNilai('sl_df_b',30), h=_ttlNilai('sl_df_h',15);
  _ttlTulis('v_df_F',FM.toFixed(0)); _ttlTulis('v_df_L',L.toFixed(0)); _ttlTulis('v_df_b',b.toFixed(0)); _ttlTulis('v_df_h',h.toFixed(0));
  const F=_ttlJalan('defleksi8')?FM*(0.5+0.5*Math.sin(_cad8DfFrame/40-Math.PI/2)):FM;
  const I=b*h*h*h/12, dM=FM*L*L*L/(3*_CAD8_E*I), d=F*L*L*L/(3*_CAD8_E*I), sM=6*FM*L/(b*h*h), s=6*F*L/(b*h*h);
  // Ponsel: balok selebar kanvas (L maks 300 mm tetap menyisakan tempat penanda δ, skala ≤ 1,2), lendutan tampilan maks 62 px.
  // Lebar: ujung balok L = 300 mm beserta label δ berhenti ≥ 12 px sebelum kolom rumus (hanya berpengaruh di tablet).
  const sk=Math.max(0.05,sempit?Math.min(1.2,(W-52)/300):Math.min(W*0.56,W*0.61-35)/300), ox=sempit?18:W*0.05, oy=sempit?84:H*0.4;
  const hp=Math.max(6,h*sk), amp=sempit?62:H*0.32;
  const faktor=amp/Math.max(dM,1e-6);
  const X=x=>ox+x*sk, yy=x=>F*x*x*(3*L-x)/(6*_CAD8_E*I)*faktor;
  ctx.strokeStyle='rgba(148,163,184,.4)'; ctx.setLineDash([5,4]); ctx.lineWidth=1; ctx.strokeRect(X(0),oy,L*sk,hp); ctx.setLineDash([]);
  _cad8Dinding(ctx,X(0),oy-10,oy+hp+10);
  ctx.beginPath();
  for(let i=0;i<=40;i++){const x=L*i/40; i?ctx.lineTo(X(x),oy+yy(x)):ctx.moveTo(X(x),oy+yy(x));}
  for(let i=40;i>=0;i--){const x=L*i/40; ctx.lineTo(X(x),oy+hp+yy(x));}
  ctx.closePath(); ctx.fillStyle='rgba(34,211,238,.18)'; ctx.fill(); ctx.strokeStyle='#22d3ee'; ctx.lineWidth=1.8; ctx.stroke();
  const tx=W*0.66, ax=X(L)-3, ay=oy+yy(L), ekor=ay-30-22*(F/Math.max(FM,1)), yD=oy+hp+yy(L)/2+4;
  _cad8Panah(ctx,ax,ekor,ax,ay-3,'#ef4444',1.8);
  // Label F di kanan panah, diangkat bila mendekati label δ. Bila pada F penuh label itu akan menabrak kolom rumus
  // atau tepi kanan (L panjang), label pindah ke kiri panah pada ketinggian tetap di atas garis putus-putus balok
  // semula, jadi tidak menimpa balok, garis putus-putus, maupun "σ maks". Sisi dipilih dari lebar label pada
  // F penuh sehingga tidak berganti selama animasi.
  ctx.fillStyle='#ef4444'; ctx.font="bold 11px 'JetBrains Mono',monospace";
  const sF='F = '+F.toFixed(0)+' N', wF=ctx.measureText('F = '+FM.toFixed(0)+' N').width, batas=sempit?W-8:tx-8;
  if(ax+6+wF<=batas){ctx.textAlign='left'; ctx.fillText(sF,ax+6,Math.min(ay-26,yD-12));}
  else {ctx.textAlign='right'; ctx.fillText(sF,Math.max(8+wF,ax-6),oy-22);}
  ctx.textAlign='left';
  ctx.strokeStyle='#00e09e'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(X(L)+12,oy+hp); ctx.lineTo(X(L)+12,oy+hp+yy(L)); ctx.stroke();
  ctx.fillStyle='#00e09e'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillText('δ',X(L)+16,yD);
  ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.arc(X(0)+3,oy-2,4,0,6.283); ctx.fill(); ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('σ maks',X(0)+10,oy-8);
  const sSkala='skala lendutan tampilan ×'+faktor.toFixed(0), sL='L = '+L+' mm';
  const butir=[[_C8TEKS,_C8F11,'I = b·h³/12 = '+_cad8Id(I,1)+' mm⁴'],['#22d3ee',_C8F11,'δ = F·L³/(3·E·I)'],['#00e09e',_C8F11,'= '+d.toFixed(4)+' mm'],['#f59e0b',_C8F11,'σ = 6·F·L/(b·h²)'],['#00e09e',_C8F11,'= '+s.toFixed(2)+' MPa'],
    [_C8ABU,_C8F10,'E = 210000 MPa (baja)'],[_C8ABU,_C8F10,'δ ∝ L³/h³ · σ ∝ L/h²']];
  const j1='Kantilever '+L+' × '+b+' × '+h+' mm,', j2='F naik sampai '+FM+' N';
  if(sempit){
    const yb=oy+Math.max(6,25*sk)+amp;   // bawah balok pada h dan F maksimum: teks di bawahnya tidak bergeser saat slider digeser
    _cad8Kolom(ctx,X(0),yb+22,W-X(0)-8,[[_C8ABU,_C8F10,sSkala],[_C8ABU,_C8F10,sL]],[0,13]);
    _cad8Kolom(ctx,10,yb+58,W-18,butir,[0,18,16,20,16,20,14]);
    _cad8Kolom(ctx,10,18,W-18,[[_C8TEKS,_C8F11,j1],[_C8TEKS,_C8F11,j2]],[0,15]);
  } else {
    ctx.fillStyle=_C8ABU; ctx.font=_C8F10; ctx.fillText(sSkala+' · '+sL,X(0),oy+hp+H*0.36+14);
    _cad8Kolom(ctx,tx,H*0.2,W-tx-2,butir,[0,24,20,30,20,24,18]);
    ctx.fillStyle=_C8TEKS; ctx.font=_C8F11; ctx.fillText(j1+' '+j2,12,18);
  }
  _ttlTulis('infoDefleksi','Kantilever '+L+' × '+b+' × '+h+' mm baja, F = '+FM+' N: I = '+I.toFixed(1)+' mm⁴, δ = '+dM.toFixed(4)+' mm, σ maks = '+sM.toFixed(2)+' MPa di tumpuan; FEM tet10 halus harus berada dalam beberapa persen dari kedua angka ini.');
  if(_ttlJalan('defleksi8')){_cad8DfFrame++; requestAnimationFrame(drawDefleksi);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Aliran kalor ΔT sepanjang batang (keadaan tunak)
// ════════════════════════════════════════════════════════════
let _cad8KlFrame=0;
function toggleKalor(){_ttlToggle('kalor8','btnKalor',drawKalor);}
window.toggleKalor=toggleKalor;
function drawKalor(){
  const k=_ttlKanvas('cvKalor',344); if(!k) return; const {ctx,W,H}=k; const sempit=W<_TTL_SEMPIT;
  const dT=_ttlNilai('sl_kl_dT',80), L=_ttlNilai('sl_kl_L',180), kk=_ttlNilai('sl_kl_k',50);
  _ttlTulis('v_kl_dT',dT.toFixed(0)); _ttlTulis('v_kl_L',L.toFixed(0)); _ttlTulis('v_kl_k',kk.toFixed(0));
  const b=30, h=15, A=b*h*1e-6, q=kk*A*dT/(L/1000), T1=300+dT, T2=300;
  // Ponsel: batang selebar kanvas (L maks 300 mm) di bawah judul dua baris, grafik T(x) di bawahnya, lalu kolom rumus.
  const sk=Math.max(0.05,sempit?(W-40)/300:(W*0.56)/300), ox=sempit?18:W*0.05, oy=sempit?62:H*0.22;
  const hp=sempit?Math.min(20,Math.max(10,h*sk*1.2)):Math.max(10,h*sk*1.2);
  const X=x=>ox+x*sk;
  const warna=f=>'rgb('+Math.round(60+190*f)+','+Math.round(80+40*(1-Math.abs(2*f-1)))+','+Math.round(240-190*f)+')';
  const n=40; for(let i=0;i<n;i++){ctx.fillStyle=warna(1-i/(n-1)); ctx.fillRect(X(i*L/n),oy,L*sk/n+.6,hp);}
  ctx.strokeStyle='#e2e8f0'; ctx.lineWidth=1.2; ctx.strokeRect(X(0),oy,L*sk,hp);
  const sT1='T₁ = '+T1+' K', sT2='T₂ = '+T2+' K';
  ctx.font="bold 11px 'JetBrains Mono',monospace"; ctx.fillStyle='#ef4444'; ctx.textAlign='left'; ctx.fillText(sT1,X(0),oy-8);
  // T₂ di atas ujung kanan; pindah ke bawah batang bila akan menimpa label T₁ (batang pendek atau kanvas sempit).
  const t2Bawah=X(0)+ctx.measureText(sT1).width+8>X(L)-ctx.measureText(sT2).width;
  ctx.fillStyle='#3b82f6'; ctx.textAlign='right'; ctx.fillText(sT2,X(L),t2Bawah?oy+hp+13:oy-8); ctx.textAlign='left';
  // partikel kalor: lajunya sebanding q (ilustratif)
  const laju=Math.min(6,0.4+q/8), jumlah=8;
  for(let i=0;i<jumlah;i++){
    const ph=((_cad8KlFrame*laju)+i*L*sk/jumlah)%(L*sk); const f=1-ph/(L*sk);
    ctx.fillStyle='rgba(255,255,255,'+(0.35+0.4*f).toFixed(2)+')'; ctx.beginPath(); ctx.arc(X(0)+ph,oy+hp/2+(i%2?-3:3),2.4,0,6.283); ctx.fill();
  }
  // grafik T(x); di ponsel keterangannya dua baris di atas grafik
  const gh=sempit?64:H*0.28, g0=sempit?oy+hp+53+gh:oy+hp+H*0.42;
  ctx.strokeStyle='rgba(148,163,184,.6)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(X(0),g0); ctx.lineTo(X(L),g0); ctx.moveTo(X(0),g0); ctx.lineTo(X(0),g0-gh-6); ctx.stroke();
  ctx.strokeStyle='#ef4444'; ctx.lineWidth=1.8; ctx.beginPath(); ctx.moveTo(X(0),g0-gh); ctx.lineTo(X(L),g0-gh*0.15); ctx.stroke();
  ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font=_C8F10; ctx.textAlign='left';
  const sGrad='gradien ΔT/L = '+(dT/L*1000).toFixed(0)+' K/m';
  if(sempit){ctx.fillText('T(x) linear:',X(0)+6,g0-gh-23); _ttlTeks(ctx,sGrad,X(0)+6,g0-gh-10,W-X(0)-14);}
  else ctx.fillText('T(x) linear: '+sGrad,X(0)+6,g0-gh-10);
  ctx.fillText('x',X(L)+6,g0+4);
  ctx.textAlign='right'; ctx.fillText('T',X(0)-4,g0-gh-2); ctx.textAlign='left';
  const butir=[[_C8TEKS,_C8F11,'batang '+b+' × '+h+' × '+L+' mm'],['#f59e0b',_C8F11,'A = '+(A*1e6).toFixed(0)+' mm² = '+A.toExponential(2)+' m²'],['#22d3ee',_C8F11,'q = k·A·ΔT/L'],
    ['#00e09e',_C8F11,'= '+kk+' × '+A.toExponential(2)+' × '+dT+' / '+(L/1000).toFixed(3)],['#00e09e',_C8F11,'= '+q.toFixed(3)+' W'],
    [_C8ABU,_C8F10,'fluks q/A = '+(q/A/1000).toFixed(1)+' kW/m²'],[_C8ABU,_C8F10,'k: baja 50 · Al 237 · Cu 400']];
  const j1='Hantaran kalor tunak:', j2='ΔT = '+dT+' K, k = '+kk+' W/(m·K)';
  if(sempit){
    _cad8Kolom(ctx,10,g0+24,W-18,butir,[0,18,22,17,16,20,14]);
    _cad8Kolom(ctx,10,18,W-18,[[_C8TEKS,_C8F11,j1],[_C8TEKS,_C8F11,j2]],[0,15]);
  } else {
    const tx=W*0.66; _cad8Kolom(ctx,tx,H*0.2,W-tx-2,butir,[0,22,28,20,20,24,18]);
    ctx.fillStyle=_C8TEKS; ctx.font=_C8F11; ctx.fillText(j1+' '+j2,12,18);
  }
  _ttlTulis('infoKalor','Batang '+b+' × '+h+' × '+L+' mm dengan ΔT = '+dT+' K dan k = '+kk+' W/(m·K): q = k·A·ΔT/L = '+q.toFixed(3)+' W; suhu turun linear dari '+T1+' K ke '+T2+' K, dan analisis thermomech tunak CalculiX memberi medan suhu yang sama.');
  if(_ttlJalan('kalor8')){_cad8KlFrame++; requestAnimationFrame(drawKalor);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Mode getar kantilever (mode 1–3) dan frekuensi alaminya
// ════════════════════════════════════════════════════════════
let _cad8GtFrame=0;
function toggleGetar(){_ttlToggle('getar8','btnGetar',drawGetar);}
window.toggleGetar=toggleGetar;
function drawGetar(){
  const k=_ttlKanvas('cvGetar',342); if(!k) return; const {ctx,W,H}=k; const sempit=W<_TTL_SEMPIT;
  const L=_ttlNilai('sl_gt_L',180), h=_ttlNilai('sl_gt_h',15), mode=Math.min(3,Math.max(1,Math.round(_ttlNilai('sl_gt_mode',1))));
  _ttlTulis('v_gt_L',L.toFixed(0)); _ttlTulis('v_gt_h',h.toFixed(0)); _ttlTulis('v_gt_mode',String(mode));
  const b=30, c=Math.sqrt(_CAD8_E*1e6/(12*_CAD8_RHO));
  const f=_CAD8_BETA.map(bn=>bn*bn/(2*Math.PI)*(h/1000)*c/Math.pow(L/1000,2));
  const bn=_CAD8_BETA[mode-1], sg=(Math.cosh(bn)+Math.cos(bn))/(Math.sinh(bn)+Math.sin(bn));
  const phi=xi=>{const bx=bn*xi; return Math.cosh(bx)-Math.cos(bx)-sg*(Math.sinh(bx)-Math.sin(bx));};
  const phiL=Math.abs(phi(1))||1;
  const amp=_ttlJalan('getar8')?Math.sin(_cad8GtFrame/(6+mode*2)):1;
  // Ponsel: balok selebar kanvas (L maks 300 mm) di bawah judul; ruang di atas dinding cukup untuk baris judul ketiga.
  const sk=Math.max(0.05,sempit?(W-36)/300:(W*0.56)/300), ox=sempit?18:W*0.05, oy=sempit?112:H*0.5, A0=sempit?50:H*0.3;
  const X=x=>ox+x*sk;
  _cad8Dinding(ctx,X(0),oy-A0-6,oy+A0+6);
  ctx.strokeStyle='rgba(148,163,184,.35)'; ctx.setLineDash([5,4]); ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(X(0),oy); ctx.lineTo(X(L),oy); ctx.stroke(); ctx.setLineDash([]);
  [1,-1].forEach(s=>{ctx.strokeStyle='rgba(168,85,247,.3)'; ctx.lineWidth=1; ctx.setLineDash([3,3]); ctx.beginPath(); for(let i=0;i<=60;i++){const xi=i/60, y=oy-s*phi(xi)/phiL*A0; i?ctx.lineTo(X(xi*L),y):ctx.moveTo(X(0),oy);} ctx.stroke(); ctx.setLineDash([]);});
  ctx.strokeStyle='#a855f7'; ctx.lineWidth=Math.max(2,h*sk*0.35); ctx.lineCap='round'; ctx.beginPath();
  for(let i=0;i<=60;i++){const xi=i/60, y=oy-amp*phi(xi)/phiL*A0; i?ctx.lineTo(X(xi*L),y):ctx.moveTo(X(0),oy);}
  ctx.stroke(); ctx.lineCap='butt';
  // Keterangan mode di bawah balok, dijepit agar tidak keluar kanvas (L pendek) atau masuk kolom rumus.
  const tx=W*0.66, kanan=sempit?W-8:tx-10;
  ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font=_C8F10; ctx.textAlign='center';
  const sMode='mode '+mode+' — β'+['₁','₂','₃'][mode-1]+' = '+bn.toFixed(6)+' · L = '+L+' mm', wM=Math.min(ctx.measureText(sMode).width,kanan-8);
  _ttlTeks(ctx,sMode,Math.max(8+wM/2,Math.min(kanan-wM/2,X(L/2))),oy+A0+22,kanan-8);
  ctx.textAlign='left';
  const fBaris=f.map((fn,i)=>[i===mode-1?'#00e09e':'rgba(226,232,240,.7)',_C8F11,(i===mode-1?'▶ ':'  ')+'f'+['₁','₂','₃'][i]+' = '+_cad8Id(fn,1)+' Hz']);
  const butir=[[_C8TEKS,_C8F11,'kantilever '+L+' × '+b+' × '+h+' mm baja'],['#a855f7',_C8F11,'f_n = (β_n²/2π)·√(EI/ρA)/L²'],[_C8ABU,_C8F10,'√(EI/ρA) = h·√(E/12ρ) = '+((h/1000)*c).toFixed(3)+' m/s'],...fBaris];
  const x0=sempit?10:tx, mw=sempit?W-18:W-tx-2;
  const yf=sempit?_cad8Kolom(ctx,10,oy+A0+46,mw,butir,[0,18,16,21,16,16]):_cad8Kolom(ctx,tx,H*0.2,mw,butir,[0,24,20,28,20,20]);
  ctx.fillStyle=_C8ABU; ctx.font=_C8F10;
  _cad8Frasa(ctx,['f ∝ h/L²','resonansi bila rpm/60 ≈ f_n'],x0,yf+(sempit?20:28),mw,13,' · ');
  const j1='Mode getar '+mode+' kantilever,', sFr='f = '+f[mode-1].toFixed(1)+' Hz', sArah='(lentur arah tebal h)';
  ctx.fillStyle=_C8TEKS; ctx.font=_C8F11;
  if(sempit){_ttlTeks(ctx,j1,10,18,W-18); _cad8Frasa(ctx,[sFr,sArah],10,33,W-18,13);}
  else ctx.fillText(j1+' '+sFr+' '+sArah,12,18);
  _ttlTulis('infoGetar','Kantilever '+L+' × '+b+' × '+h+' mm baja: f₁ = '+f[0].toFixed(2)+' Hz, f₂ = '+f[1].toFixed(1)+' Hz, f₃ = '+f[2].toFixed(1)+' Hz (lentur arah tebal h). Analisis frequency CalculiX memberi EigenmodeFrequency mendekati f₁; lentur arah lebar muncul pada ≈ f₁ × b/h = '+(f[0]*b/h).toFixed(1)+' Hz.');
  if(_ttlJalan('getar8')){_cad8GtFrame++; requestAnimationFrame(drawGetar);}
}

_TTL_DAFTAR.push(['cvMesh',()=>drawMesh(),'mesh8',['sl_ms_n','sl_ms_orde']]);
_TTL_DAFTAR.push(['cvDefleksi',()=>drawDefleksi(),'defleksi8',['sl_df_F','sl_df_L','sl_df_b','sl_df_h']]);
_TTL_DAFTAR.push(['cvKalor',()=>drawKalor(),'kalor8',['sl_kl_dT','sl_kl_L','sl_kl_k']]);
_TTL_DAFTAR.push(['cvGetar',()=>drawGetar(),'getar8',['sl_gt_L','sl_gt_h','sl_gt_mode']]);
_ttlMulai();
