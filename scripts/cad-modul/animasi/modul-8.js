// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 8 PEMODELAN CAD — Simulasi Kinerja Komponen (FEM Workbench + CalculiX)
// Kanvas: cvMesh, cvDefleksi, cvKalor, cvGetar (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// ════════════════════════════════════════════════════════════
const _CAD8_E=210000, _CAD8_RHO=7850, _CAD8_BETA=[1.875104,4.694091,7.854757];
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

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Mesh makin halus (h-refinement) pada kantilever
// ════════════════════════════════════════════════════════════
let _cad8MsFrame=0;
function toggleMesh(){_ttlToggle('mesh8','btnMesh',drawMesh);}
window.toggleMesh=toggleMesh;
function drawMesh(){
  const k=_ttlKanvas('cvMesh'); if(!k) return; const {ctx,W,H}=k;
  const nM=Math.max(1,Math.round(_ttlNilai('sl_ms_n',4))), orde=Math.round(_ttlNilai('sl_ms_orde',2))===1?1:2;
  _ttlTulis('v_ms_n',String(nM)); _ttlTulis('v_ms_orde',orde===2?'2 (tet10)':'1 (tet4)');
  const n=_ttlJalan('mesh8')?1+Math.floor((_cad8MsFrame/45)%nM):nM;
  const L=180, h=15, b=30;
  const sk=Math.max(0.05,Math.min((W*0.58)/(L+16),(H-90)/(h+10)));
  const ox=W*0.05, oy=H*0.42;
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
  ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  ctx.fillText('kantilever '+L+' × '+b+' × '+h+' mm — '+ny+' elemen sepanjang h, '+nx+' sepanjang L',X(L/2),Y(h)+26); ctx.textAlign='left';
  // taksiran jumlah elemen 3D dan konvergensi (model ilustratif, bukan hasil solver)
  const nz=Math.max(1,Math.round(n*b/h)); const nEl=nx*ny*nz*6;
  const nNode=orde===2?(2*nx+1)*(2*ny+1)*(2*nz+1):(nx+1)*(ny+1)*(nz+1);
  const rasio=orde===2?1-0.04/(n*n):1-0.55/Math.pow(n,1.1);
  const ukuran=h/n;
  const tx=W*0.66;
  ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(226,232,240,.92)'; ctx.fillText('ukuran elemen ≈ '+ukuran.toFixed(2)+' mm',tx,H*0.2);
  ctx.fillStyle='#22d3ee'; ctx.fillText('elemen tet ≈ '+_cad8Id(nEl,0),tx,H*0.2+22); ctx.fillText('simpul ≈ '+_cad8Id(nNode,0),tx,H*0.2+42);
  ctx.fillStyle=orde===2?'#f59e0b':'#22d3ee'; ctx.fillText((orde===2?'tet10 (orde 2)':'tet4 (orde 1)')+':',tx,H*0.2+72);
  ctx.fillStyle='#00e09e'; ctx.fillText('δ_FEM/δ_rumus ≈ '+rasio.toFixed(3),tx,H*0.2+92);
  ctx.fillStyle='#ef4444'; ctx.fillText('kesalahan ≈ '+((1-rasio)*100).toFixed(1)+' %',tx,H*0.2+112);
  const bx=tx, by=H*0.2+128, bw=W*0.28;
  ctx.strokeStyle='rgba(148,163,184,.5)'; ctx.lineWidth=1; ctx.strokeRect(bx,by,bw,10);
  ctx.fillStyle='#00e09e'; ctx.fillRect(bx,by,bw*Math.max(0,rasio),10);
  ctx.strokeStyle='#f59e0b'; ctx.beginPath(); ctx.moveTo(bx+bw*0.98,by-3); ctx.lineTo(bx+bw*0.98,by+13); ctx.stroke();
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('konvergen bila > 98% (garis kuning) — ilustratif',bx,by+26);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillText('h-refinement: '+n+' elemen sepanjang tebal, orde '+orde+(n===nM?' (mesh terhalus)':''),12,18);
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
  const k=_ttlKanvas('cvDefleksi'); if(!k) return; const {ctx,W,H}=k;
  const FM=_ttlNilai('sl_df_F',500), L=_ttlNilai('sl_df_L',180), b=_ttlNilai('sl_df_b',30), h=_ttlNilai('sl_df_h',15);
  _ttlTulis('v_df_F',FM.toFixed(0)); _ttlTulis('v_df_L',L.toFixed(0)); _ttlTulis('v_df_b',b.toFixed(0)); _ttlTulis('v_df_h',h.toFixed(0));
  const F=_ttlJalan('defleksi8')?FM*(0.5+0.5*Math.sin(_cad8DfFrame/40-Math.PI/2)):FM;
  const I=b*h*h*h/12, dM=FM*L*L*L/(3*_CAD8_E*I), d=F*L*L*L/(3*_CAD8_E*I), sM=6*FM*L/(b*h*h), s=6*F*L/(b*h*h);
  const sk=Math.max(0.05,(W*0.56)/300), ox=W*0.05, oy=H*0.4;
  const hp=Math.max(6,h*sk);
  const faktor=(H*0.32)/Math.max(dM,1e-6);
  const X=x=>ox+x*sk, yy=x=>F*x*x*(3*L-x)/(6*_CAD8_E*I)*faktor;
  ctx.strokeStyle='rgba(148,163,184,.4)'; ctx.setLineDash([5,4]); ctx.lineWidth=1; ctx.strokeRect(X(0),oy,L*sk,hp); ctx.setLineDash([]);
  _cad8Dinding(ctx,X(0),oy-10,oy+hp+10);
  ctx.beginPath();
  for(let i=0;i<=40;i++){const x=L*i/40; i?ctx.lineTo(X(x),oy+yy(x)):ctx.moveTo(X(x),oy+yy(x));}
  for(let i=40;i>=0;i--){const x=L*i/40; ctx.lineTo(X(x),oy+hp+yy(x));}
  ctx.closePath(); ctx.fillStyle='rgba(34,211,238,.18)'; ctx.fill(); ctx.strokeStyle='#22d3ee'; ctx.lineWidth=1.8; ctx.stroke();
  const ax=X(L)-3, ay=oy+yy(L);
  _cad8Panah(ctx,ax,ay-30-22*(F/Math.max(FM,1)),ax,ay-3,'#ef4444',1.8);
  ctx.fillStyle='#ef4444'; ctx.font="bold 11px 'JetBrains Mono',monospace"; ctx.textAlign='left'; ctx.fillText('F = '+F.toFixed(0)+' N',ax+6,ay-26);
  ctx.strokeStyle='#00e09e'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(X(L)+12,oy+hp); ctx.lineTo(X(L)+12,oy+hp+yy(L)); ctx.stroke();
  ctx.fillStyle='#00e09e'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillText('δ',X(L)+16,oy+hp+yy(L)/2+4);
  ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.arc(X(0)+3,oy-2,4,0,6.283); ctx.fill(); ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('σ maks',X(0)+10,oy-8);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('skala lendutan tampilan ×'+faktor.toFixed(0)+' · L = '+L+' mm',X(0),oy+hp+H*0.36+14);
  const tx=W*0.66;
  ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(226,232,240,.92)'; ctx.fillText('I = b·h³/12 = '+_cad8Id(I,1)+' mm⁴',tx,H*0.2);
  ctx.fillStyle='#22d3ee'; ctx.fillText('δ = F·L³/(3·E·I)',tx,H*0.2+24); ctx.fillStyle='#00e09e'; ctx.fillText('= '+d.toFixed(4)+' mm',tx,H*0.2+44);
  ctx.fillStyle='#f59e0b'; ctx.fillText('σ = 6·F·L/(b·h²)',tx,H*0.2+74); ctx.fillStyle='#00e09e'; ctx.fillText('= '+s.toFixed(2)+' MPa',tx,H*0.2+94);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('E = 210000 MPa (baja)',tx,H*0.2+118); ctx.fillText('δ ∝ L³/h³ · σ ∝ L/h²',tx,H*0.2+136);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillText('Kantilever '+L+' × '+b+' × '+h+' mm, F naik sampai '+FM+' N',12,18);
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
  const k=_ttlKanvas('cvKalor'); if(!k) return; const {ctx,W,H}=k;
  const dT=_ttlNilai('sl_kl_dT',80), L=_ttlNilai('sl_kl_L',180), kk=_ttlNilai('sl_kl_k',50);
  _ttlTulis('v_kl_dT',dT.toFixed(0)); _ttlTulis('v_kl_L',L.toFixed(0)); _ttlTulis('v_kl_k',kk.toFixed(0));
  const b=30, h=15, A=b*h*1e-6, q=kk*A*dT/(L/1000), T1=300+dT, T2=300;
  const sk=Math.max(0.05,(W*0.56)/300), ox=W*0.05, oy=H*0.22, hp=Math.max(10,h*sk*1.2);
  const X=x=>ox+x*sk;
  const warna=f=>'rgb('+Math.round(60+190*f)+','+Math.round(80+40*(1-Math.abs(2*f-1)))+','+Math.round(240-190*f)+')';
  const n=40; for(let i=0;i<n;i++){ctx.fillStyle=warna(1-i/(n-1)); ctx.fillRect(X(i*L/n),oy,L*sk/n+.6,hp);}
  ctx.strokeStyle='#e2e8f0'; ctx.lineWidth=1.2; ctx.strokeRect(X(0),oy,L*sk,hp);
  ctx.font="bold 11px 'JetBrains Mono',monospace"; ctx.fillStyle='#ef4444'; ctx.textAlign='left'; ctx.fillText('T₁ = '+T1+' K',X(0),oy-8);
  ctx.fillStyle='#3b82f6'; ctx.textAlign='right'; ctx.fillText('T₂ = '+T2+' K',X(L),oy-8); ctx.textAlign='left';
  // partikel kalor: lajunya sebanding q (ilustratif)
  const laju=Math.min(6,0.4+q/8), jumlah=8;
  for(let i=0;i<jumlah;i++){
    const ph=((_cad8KlFrame*laju)+i*L*sk/jumlah)%(L*sk); const f=1-ph/(L*sk);
    ctx.fillStyle='rgba(255,255,255,'+(0.35+0.4*f).toFixed(2)+')'; ctx.beginPath(); ctx.arc(X(0)+ph,oy+hp/2+(i%2?-3:3),2.4,0,6.283); ctx.fill();
  }
  // grafik T(x)
  const g0=oy+hp+H*0.42, gh=H*0.28;
  ctx.strokeStyle='rgba(148,163,184,.6)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(X(0),g0); ctx.lineTo(X(L),g0); ctx.moveTo(X(0),g0); ctx.lineTo(X(0),g0-gh-6); ctx.stroke();
  ctx.strokeStyle='#ef4444'; ctx.lineWidth=1.8; ctx.beginPath(); ctx.moveTo(X(0),g0-gh); ctx.lineTo(X(L),g0-gh*0.15); ctx.stroke();
  ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillText('T(x) linear: gradien ΔT/L = '+(dT/L*1000).toFixed(0)+' K/m',X(0)+6,g0-gh-10); ctx.fillText('x',X(L)+6,g0+4);
  ctx.textAlign='right'; ctx.fillText('T',X(0)-4,g0-gh-2); ctx.textAlign='left';
  const tx=W*0.66;
  ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(226,232,240,.92)'; ctx.fillText('batang '+b+' × '+h+' × '+L+' mm',tx,H*0.2);
  ctx.fillStyle='#f59e0b'; ctx.fillText('A = '+(A*1e6).toFixed(0)+' mm² = '+A.toExponential(2)+' m²',tx,H*0.2+22);
  ctx.fillStyle='#22d3ee'; ctx.fillText('q = k·A·ΔT/L',tx,H*0.2+50);
  ctx.fillStyle='#00e09e'; ctx.fillText('= '+kk+' × '+A.toExponential(2)+' × '+dT+' / '+(L/1000).toFixed(3),tx,H*0.2+70); ctx.fillText('= '+q.toFixed(3)+' W',tx,H*0.2+90);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('fluks q/A = '+(q/A/1000).toFixed(1)+' kW/m²',tx,H*0.2+114); ctx.fillText('k: baja 50 · Al 237 · Cu 400',tx,H*0.2+132);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillText('Hantaran kalor tunak: ΔT = '+dT+' K, k = '+kk+' W/(m·K)',12,18);
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
  const k=_ttlKanvas('cvGetar'); if(!k) return; const {ctx,W,H}=k;
  const L=_ttlNilai('sl_gt_L',180), h=_ttlNilai('sl_gt_h',15), mode=Math.min(3,Math.max(1,Math.round(_ttlNilai('sl_gt_mode',1))));
  _ttlTulis('v_gt_L',L.toFixed(0)); _ttlTulis('v_gt_h',h.toFixed(0)); _ttlTulis('v_gt_mode',String(mode));
  const b=30, c=Math.sqrt(_CAD8_E*1e6/(12*_CAD8_RHO));
  const f=_CAD8_BETA.map(bn=>bn*bn/(2*Math.PI)*(h/1000)*c/Math.pow(L/1000,2));
  const bn=_CAD8_BETA[mode-1], sg=(Math.cosh(bn)+Math.cos(bn))/(Math.sinh(bn)+Math.sin(bn));
  const phi=xi=>{const bx=bn*xi; return Math.cosh(bx)-Math.cos(bx)-sg*(Math.sinh(bx)-Math.sin(bx));};
  const phiL=Math.abs(phi(1))||1;
  const amp=_ttlJalan('getar8')?Math.sin(_cad8GtFrame/(6+mode*2)):1;
  const sk=Math.max(0.05,(W*0.56)/300), ox=W*0.05, oy=H*0.5, A0=H*0.3;
  const X=x=>ox+x*sk;
  _cad8Dinding(ctx,X(0),oy-A0-6,oy+A0+6);
  ctx.strokeStyle='rgba(148,163,184,.35)'; ctx.setLineDash([5,4]); ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(X(0),oy); ctx.lineTo(X(L),oy); ctx.stroke(); ctx.setLineDash([]);
  [1,-1].forEach(s=>{ctx.strokeStyle='rgba(168,85,247,.3)'; ctx.lineWidth=1; ctx.setLineDash([3,3]); ctx.beginPath(); for(let i=0;i<=60;i++){const xi=i/60, y=oy-s*phi(xi)/phiL*A0; i?ctx.lineTo(X(xi*L),y):ctx.moveTo(X(0),oy);} ctx.stroke(); ctx.setLineDash([]);});
  ctx.strokeStyle='#a855f7'; ctx.lineWidth=Math.max(2,h*sk*0.35); ctx.lineCap='round'; ctx.beginPath();
  for(let i=0;i<=60;i++){const xi=i/60, y=oy-amp*phi(xi)/phiL*A0; i?ctx.lineTo(X(xi*L),y):ctx.moveTo(X(0),oy);}
  ctx.stroke(); ctx.lineCap='butt';
  ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  ctx.fillText('mode '+mode+' — β'+['₁','₂','₃'][mode-1]+' = '+bn.toFixed(6)+' · L = '+L+' mm',X(L/2),oy+A0+22); ctx.textAlign='left';
  const tx=W*0.66;
  ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(226,232,240,.92)'; ctx.fillText('kantilever '+L+' × '+b+' × '+h+' mm baja',tx,H*0.2);
  ctx.fillStyle='#a855f7'; ctx.fillText('f_n = (β_n²/2π)·√(EI/ρA)/L²',tx,H*0.2+24);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('√(EI/ρA) = h·√(E/12ρ) = '+((h/1000)*c).toFixed(3)+' m/s',tx,H*0.2+44);
  ctx.font="11px 'JetBrains Mono',monospace";
  f.forEach((fn,i)=>{ctx.fillStyle=i===mode-1?'#00e09e':'rgba(226,232,240,.7)'; ctx.fillText((i===mode-1?'▶ ':'  ')+'f'+['₁','₂','₃'][i]+' = '+_cad8Id(fn,1)+' Hz',tx,H*0.2+72+i*20);});
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('f ∝ h/L² · resonansi bila rpm/60 ≈ f_n',tx,H*0.2+140);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillText('Mode getar '+mode+' kantilever, f = '+f[mode-1].toFixed(1)+' Hz (lentur arah tebal h)',12,18);
  _ttlTulis('infoGetar','Kantilever '+L+' × '+b+' × '+h+' mm baja: f₁ = '+f[0].toFixed(2)+' Hz, f₂ = '+f[1].toFixed(1)+' Hz, f₃ = '+f[2].toFixed(1)+' Hz (lentur arah tebal h). Analisis frequency CalculiX memberi EigenmodeFrequency mendekati f₁; lentur arah lebar muncul pada ≈ f₁ × b/h = '+(f[0]*b/h).toFixed(1)+' Hz.');
  if(_ttlJalan('getar8')){_cad8GtFrame++; requestAnimationFrame(drawGetar);}
}

_TTL_DAFTAR.push(['cvMesh',()=>drawMesh(),'mesh8',['sl_ms_n','sl_ms_orde']]);
_TTL_DAFTAR.push(['cvDefleksi',()=>drawDefleksi(),'defleksi8',['sl_df_F','sl_df_L','sl_df_b','sl_df_h']]);
_TTL_DAFTAR.push(['cvKalor',()=>drawKalor(),'kalor8',['sl_kl_dT','sl_kl_L','sl_kl_k']]);
_TTL_DAFTAR.push(['cvGetar',()=>drawGetar(),'getar8',['sl_gt_L','sl_gt_h','sl_gt_mode']]);
_ttlMulai();
