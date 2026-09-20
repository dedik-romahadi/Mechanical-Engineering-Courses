// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 1 PEMODELAN CAD — Pengenalan FreeCAD dan Menggambar 2D
// Kanvas: cvNavigasi, cvBidang, cvDraft, cvParametrik (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL).
// ════════════════════════════════════════════════════════════
const _CAD_X='#ef4444', _CAD_Y='#22c55e', _CAD_Z='#3b82f6';
// Proyeksi ortografis sederhana: putar sekeliling Z (azimut), lalu miringkan (elevasi).
function _cadProyeksi(p,az,el,zoom,cx,cy){
  const a=az*Math.PI/180, e=el*Math.PI/180;
  const x1=p[0]*Math.cos(a)-p[1]*Math.sin(a), y1=p[0]*Math.sin(a)+p[1]*Math.cos(a), z1=p[2];
  return [cx+zoom*x1, cy-zoom*(z1*Math.cos(e)+y1*Math.sin(e))];
}
function _cadGarisTiga(ctx,P,a,b,warna,lebar){ctx.strokeStyle=warna; ctx.lineWidth=lebar||1.2; ctx.beginPath(); ctx.moveTo(P[a][0],P[a][1]); ctx.lineTo(P[b][0],P[b][1]); ctx.stroke();}
function _cadSumbu(ctx,az,el,zoom,cx,cy,panjang){
  const O=_cadProyeksi([0,0,0],az,el,zoom,cx,cy);
  [[[panjang,0,0],_CAD_X,'X'],[[0,panjang,0],_CAD_Y,'Y'],[[0,0,panjang],_CAD_Z,'Z']].forEach(([v,w,n])=>{
    const P=_cadProyeksi(v,az,el,zoom,cx,cy);
    ctx.strokeStyle=w; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(O[0],O[1]); ctx.lineTo(P[0],P[1]); ctx.stroke();
    ctx.fillStyle=w; ctx.font="bold 11px 'JetBrains Mono',monospace"; ctx.fillText(n,P[0]+4,P[1]-4);
  });
}
// Profil braket L (mm) di bidang XY, diekstrusi setebal t searah Z.
function _cadBraket(W,H,t,tebal){
  const prof=[[0,0],[W,0],[W,t],[t,t],[t,H],[0,H]];
  const bawah=prof.map(([x,y])=>[x,y,0]), atas=prof.map(([x,y])=>[x,y,tebal]);
  const rusuk=[];
  for(let i=0;i<6;i++){rusuk.push([i,(i+1)%6]); rusuk.push([i+6,(i+1)%6+6]); rusuk.push([i,i+6]);}
  return {titik:[...bawah,...atas],rusuk};
}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Navigasi pandangan 3D: azimut, elevasi, zoom
// ════════════════════════════════════════════════════════════
let _nvFrame=0;
function toggleNavigasi(){_ttlToggle('navigasi','btnNavigasi',drawNavigasi);}
window.toggleNavigasi=toggleNavigasi;
function drawNavigasi(){
  const k=_ttlKanvas('cvNavigasi'); if(!k) return; const {ctx,W,H}=k;
  const azDasar=_ttlNilai('sl_nv_az',35), el=_ttlNilai('sl_nv_el',30), zoom=_ttlNilai('sl_nv_zoom',1.2);
  const az=(azDasar+(_ttlJalan('navigasi')?_nvFrame*0.4:0))%360;
  _ttlTulis('v_nv_az',azDasar.toFixed(0)+'°'); _ttlTulis('v_nv_el',el.toFixed(0)+'°'); _ttlTulis('v_nv_zoom',zoom.toFixed(2)+'×');
  const cx=W*0.5, cy=H*0.62, sk=zoom*Math.min(W,H)/150;
  // Kisi bidang XY sebagai acuan lantai
  ctx.strokeStyle='rgba(148,163,184,.14)'; ctx.lineWidth=1;
  for(let i=-3;i<=3;i++){
    const A=_cadProyeksi([i*40,-120,0],az,el,sk,cx,cy), B=_cadProyeksi([i*40,120,0],az,el,sk,cx,cy);
    const C=_cadProyeksi([-120,i*40,0],az,el,sk,cx,cy), D=_cadProyeksi([120,i*40,0],az,el,sk,cx,cy);
    ctx.beginPath(); ctx.moveTo(A[0],A[1]); ctx.lineTo(B[0],B[1]); ctx.moveTo(C[0],C[1]); ctx.lineTo(D[0],D[1]); ctx.stroke();
  }
  _cadSumbu(ctx,az,el,sk,cx,cy,70);
  const {titik,rusuk}=_cadBraket(100,80,15,12);
  const P=titik.map(p=>_cadProyeksi([p[0]-50,p[1]-40,p[2]],az,el,sk,cx,cy));
  // Bidang atas diarsir tipis agar bentuknya terbaca
  ctx.fillStyle='rgba(34,211,238,.10)'; ctx.beginPath(); for(let i=6;i<12;i++){const q=P[i]; i===6?ctx.moveTo(q[0],q[1]):ctx.lineTo(q[0],q[1]);} ctx.closePath(); ctx.fill();
  rusuk.forEach(([a,b])=>_cadGarisTiga(ctx,P,a,b,'rgba(34,211,238,.95)',1.6));
  // Nama pandangan baku FreeCAD yang paling dekat
  let nama='Isometrik (0 → tekan 0)';
  if(el>75) nama='Top / atas (tekan 2)'; else if(el<-75) nama='Bottom / bawah (tekan 5)';
  else if(Math.abs(el)<12){const s=((az%360)+360)%360; nama = s<22||s>338?'Front / depan (tekan 1)': Math.abs(s-90)<22?'Right / kanan (tekan 3)': Math.abs(s-180)<22?'Rear / belakang (tekan 4)': Math.abs(s-270)<22?'Left / kiri (tekan 6)':'Pandangan bebas';}
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillText('azimut '+az.toFixed(0)+'°  elevasi '+el.toFixed(0)+'°  zoom '+zoom.toFixed(2)+'×',12,18);
  ctx.fillText('roda mouse = zoom · tombol tengah = pan · tengah + kiri = putar',12,H-12);
  _ttlTulis('navigasiInfo','Pandangan saat ini ≈ '+nama+' · braket L 100 × 80 × 15 mm, tebal 12 mm');
  if(_ttlJalan('navigasi')){_nvFrame++; requestAnimationFrame(drawNavigasi);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Bidang kerja Draft (Top/Front/Side) dan koordinat
// ════════════════════════════════════════════════════════════
let _bdFrame=0;
function toggleBidang(){_ttlToggle('bidang','btnBidang',drawBidang);}
window.toggleBidang=toggleBidang;
function drawBidang(){
  const k=_ttlKanvas('cvBidang'); if(!k) return; const {ctx,W,H}=k;
  const pil=Math.round(_ttlNilai('sl_bd_plane',0)), a=_ttlNilai('sl_bd_a',80), b=_ttlNilai('sl_bd_b',50);
  const nama=['Top (XY)','Front (XZ)','Side (YZ)'][pil];
  _ttlTulis('v_bd_plane',nama); _ttlTulis('v_bd_a',a.toFixed(0)); _ttlTulis('v_bd_b',b.toFixed(0));
  const az=35, el=28, cx=W*0.5, cy=H*0.6, sk=Math.min(W,H)/210;
  const denyut=0.25+0.15*Math.sin(_bdFrame/18);
  // Tiga bidang acuan 120 × 120 mm
  const L=120;
  const bidang=[
    {n:'Top (XY)',pts:[[0,0,0],[L,0,0],[L,L,0],[0,L,0]],warna:'34,211,238'},
    {n:'Front (XZ)',pts:[[0,0,0],[L,0,0],[L,0,L],[0,0,L]],warna:'249,115,22'},
    {n:'Side (YZ)',pts:[[0,0,0],[0,L,0],[0,L,L],[0,0,L]],warna:'168,85,247'},
  ];
  bidang.forEach((bd,i)=>{
    const P=bd.pts.map(p=>_cadProyeksi([p[0]-40,p[1]-40,p[2]],az,el,sk,cx,cy));
    ctx.fillStyle=`rgba(${bd.warna},${i===pil?denyut:0.06})`; ctx.strokeStyle=`rgba(${bd.warna},${i===pil?0.95:0.35})`; ctx.lineWidth=i===pil?1.8:1;
    ctx.beginPath(); P.forEach((q,j)=>j?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle=`rgba(${bd.warna},.95)`; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText(bd.n,P[2][0]+4,P[2][1]);
  });
  _cadSumbu(ctx,az,el,sk,cx,cy,150);
  // Persegi panjang a × b pada bidang terpilih, sudut di titik asal
  const peta=[(x,y)=>[x,y,0],(x,y)=>[x,0,y],(x,y)=>[0,x,y]][pil];
  const R=[[0,0],[a,0],[a,b],[0,b]].map(([x,y])=>{const g=peta(x,y); return _cadProyeksi([g[0]-40,g[1]-40,g[2]],az,el,sk,cx,cy);});
  ctx.fillStyle='rgba(0,224,158,.35)'; ctx.strokeStyle='#00e09e'; ctx.lineWidth=2;
  ctx.beginPath(); R.forEach((q,j)=>j?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.closePath(); ctx.fill(); ctx.stroke();
  const sudut=[['(0, 0)',R[0]],['('+a+', 0)',R[1]],['('+a+', '+b+')',R[2]]];
  ctx.fillStyle='#e2e8f0'; ctx.font="10px 'JetBrains Mono',monospace";
  sudut.forEach(([s,q])=>ctx.fillText(s,q[0]+5,q[1]-4));
  const glob=[['(x, y, 0)','(x, 0, z)','(0, y, z)'][pil]];
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillText('Bidang kerja: '+nama+' → koordinat 2D (u, v) menjadi global '+glob[0],12,18);
  _ttlTulis('bidangInfo','Rectangle '+a+' × '+b+' mm digambar pada bidang '+nama+'; titik (u, v) yang Anda ketik di panel Tasks dipetakan ke '+glob[0]+' — luas tetap '+(a*b).toLocaleString('id-ID')+' mm² di bidang mana pun');
  if(_ttlJalan('bidang')){_bdFrame++; requestAnimationFrame(drawBidang);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Primitif Draft 2D: persegi panjang, lingkaran, poligon + luas/keliling
// ════════════════════════════════════════════════════════════
let _drFrame=0;
function toggleDraft(){_ttlToggle('draft','btnDraft',drawDraft);}
window.toggleDraft=toggleDraft;
function drawDraft(){
  const k=_ttlKanvas('cvDraft'); if(!k) return; const {ctx,W,H}=k;
  const bentuk=Math.round(_ttlNilai('sl_dr_bentuk',0)), a=_ttlNilai('sl_dr_a',100), b=_ttlNilai('sl_dr_b',60), n=Math.round(_ttlNilai('sl_dr_n',6));
  const namaBentuk=['Rectangle','Circle','Polygon'][bentuk];
  _ttlTulis('v_dr_bentuk',namaBentuk); _ttlTulis('v_dr_a',a.toFixed(0)); _ttlTulis('v_dr_b',b.toFixed(0)); _ttlTulis('v_dr_n',String(n));
  const padL=52,padB=34, sk=Math.min((W-padL-30)/220,(H-padB-30)/140);
  const ox=padL, oy=H-padB;
  const X=x=>ox+x*sk, Y=y=>oy-y*sk;
  // kisi 10 mm
  ctx.strokeStyle='rgba(148,163,184,.12)'; ctx.lineWidth=1;
  for(let x=0;x<=220;x+=10){ctx.beginPath(); ctx.moveTo(X(x),Y(0)); ctx.lineTo(X(x),Y(140)); ctx.stroke();}
  for(let y=0;y<=140;y+=10){ctx.beginPath(); ctx.moveTo(X(0),Y(y)); ctx.lineTo(X(220),Y(y)); ctx.stroke();}
  ctx.strokeStyle=_CAD_X; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(220),Y(0)); ctx.stroke();
  ctx.strokeStyle=_CAD_Y; ctx.beginPath(); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(0),Y(140)); ctx.stroke();
  ctx.fillStyle='rgba(148,163,184,.8)'; ctx.font="9px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  for(let x=0;x<=220;x+=50) ctx.fillText(String(x),X(x),oy+14);
  ctx.textAlign='right'; for(let y=0;y<=140;y+=50) ctx.fillText(String(y),ox-6,Y(y)+3);
  ctx.textAlign='left'; ctx.fillStyle=_CAD_X; ctx.fillText('X (mm)',X(200),oy+26); ctx.fillStyle=_CAD_Y; ctx.fillText('Y',ox-24,Y(135));
  // Bangun titik sudut (semua diletakkan dengan sudut/pusat di sekitar (60, 70))
  let pts=[], luas=0, kel=0, ket='';
  if(bentuk===0){pts=[[0,0],[a,0],[a,b],[0,b]]; luas=a*b; kel=2*(a+b); ket='Luas = a·b, keliling = 2(a + b)';}
  else if(bentuk===1){const r=a/2; for(let i=0;i<72;i++){const th=i/72*2*Math.PI; pts.push([60+r*Math.cos(th),70+r*Math.sin(th)]);} luas=Math.PI*r*r; kel=2*Math.PI*r; ket='Luas = πr², keliling = 2πr (r = a/2 = '+r.toFixed(1)+' mm)';}
  else {const R=a/2; for(let i=0;i<n;i++){const th=i/n*2*Math.PI; pts.push([60+R*Math.cos(th),70+R*Math.sin(th)]);} luas=n*R*R*Math.sin(2*Math.PI/n)/2; kel=2*n*R*Math.sin(Math.PI/n); ket='Luas = n·R²·sin(2π/n)/2, keliling = 2nR·sin(π/n) (R = a/2 = '+R.toFixed(1)+' mm)';}
  // Goresan progresif (meniru Draft yang menggambar segmen demi segmen)
  const total=pts.length, tampil=_ttlJalan('draft')?Math.min(total,1+Math.floor((_drFrame%(total*6+60))/6)):total;
  ctx.fillStyle='rgba(34,211,238,.14)'; ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1]))); ctx.closePath(); if(tampil>=total) ctx.fill();
  ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2.2; ctx.beginPath();
  for(let i=0;i<Math.min(tampil,total);i++){const p=pts[i]; i?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1]));}
  if(tampil>=total) ctx.closePath(); ctx.stroke();
  // Titik sudut/pusat
  ctx.fillStyle='#f59e0b'; if(bentuk===0) pts.forEach(p=>{ctx.beginPath(); ctx.arc(X(p[0]),Y(p[1]),3,0,Math.PI*2); ctx.fill();});
  else {ctx.beginPath(); ctx.arc(X(60),Y(70),3,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='rgba(245,158,11,.7)'; ctx.setLineDash([4,3]); ctx.beginPath(); ctx.moveTo(X(60),Y(70)); ctx.lineTo(X(60+a/2),Y(70)); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle='#f59e0b'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText((bentuk===1?'r':'R')+' = '+(a/2).toFixed(1),X(60+a/4),Y(70)-6);}
  // Garis dimensi persegi panjang
  if(bentuk===0){ctx.strokeStyle='#f59e0b'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(X(0),Y(b)+-12+12); ctx.stroke();
    ctx.fillStyle='#f59e0b'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('a = '+a+' mm',X(a/2),Y(b)-8); ctx.save(); ctx.translate(X(a)+14,Y(b/2)); ctx.rotate(-Math.PI/2); ctx.fillText('b = '+b+' mm',0,0); ctx.restore(); ctx.textAlign='left';}
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace";
  ctx.fillText('Draft '+namaBentuk+(bentuk===2?' ('+n+' sisi)':'')+' · properti Area = '+luas.toFixed(2)+' mm² · Shape.Length = '+kel.toFixed(2)+' mm',12,18);
  _ttlTulis('draftInfo',ket+' → Area '+luas.toLocaleString('id-ID',{maximumFractionDigits:2})+' mm², keliling '+kel.toLocaleString('id-ID',{maximumFractionDigits:2})+' mm');
  if(_ttlJalan('draft')){_drFrame++; requestAnimationFrame(drawDraft);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Model parametrik: pelat berlubang yang mengikuti dimensi
// ════════════════════════════════════════════════════════════
let _pmFrame=0;
function toggleParametrik(){_ttlToggle('parametrik','btnParametrik',drawParametrik);}
window.toggleParametrik=toggleParametrik;
function drawParametrik(){
  const k=_ttlKanvas('cvParametrik'); if(!k) return; const {ctx,W,H}=k;
  const a=_ttlNilai('sl_pm_a',150), b=_ttlNilai('sl_pm_b',70), d=_ttlNilai('sl_pm_d',16);
  _ttlTulis('v_pm_a',a.toFixed(0)); _ttlTulis('v_pm_b',b.toFixed(0)); _ttlTulis('v_pm_d',d.toFixed(0));
  const pohonW=Math.min(190,W*0.34), padL=40, area=W-pohonW-padL-24;
  const sk=Math.min(area/230,(H-70)/130), ox=padL, oy=H-38;
  const X=x=>ox+x*sk, Y=y=>oy-y*sk;
  // Pelat
  ctx.fillStyle='rgba(34,211,238,.16)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.rect(X(0),Y(b),a*sk,b*sk); ctx.fill(); ctx.stroke();
  // Lubang di a/4 dan 3a/4 (mengikuti a secara parametrik)
  const lubang=[[a/4,b/2],[3*a/4,b/2]];
  lubang.forEach(([x,y])=>{ctx.fillStyle='#0a101f'; ctx.strokeStyle='#f59e0b'; ctx.lineWidth=1.8; ctx.beginPath(); ctx.arc(X(x),Y(y),d/2*sk,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle='rgba(245,158,11,.5)'; ctx.setLineDash([3,3]); ctx.beginPath(); ctx.moveTo(X(x)-10,Y(y)); ctx.lineTo(X(x)+10,Y(y)); ctx.moveTo(X(x),Y(y)-10); ctx.lineTo(X(x),Y(y)+10); ctx.stroke(); ctx.setLineDash([]);});
  // Dimensi
  ctx.fillStyle='#f59e0b'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  ctx.fillText('a = '+a+' mm',X(a/2),Y(b)-8); ctx.fillText('a/4',X(a/4),oy+14); ctx.fillText('3a/4',X(3*a/4),oy+14);
  ctx.save(); ctx.translate(X(a)+14,Y(b/2)); ctx.rotate(-Math.PI/2); ctx.fillText('b = '+b+' mm',0,0); ctx.restore();
  ctx.fillText('⌀'+d,X(a/4),Y(b/2)+d/2*sk+12); ctx.textAlign='left';
  // Pohon dokumen mini dengan sorotan bergilir
  const px=W-pohonW-6, py=16;
  ctx.fillStyle='rgba(14,22,40,.92)'; ctx.strokeStyle='rgba(148,163,184,.25)'; ctx.lineWidth=1; ctx.beginPath(); ctx.rect(px,py,pohonW,H-32); ctx.fill(); ctx.stroke();
  const baris=['📄 Latihan1','  ▸ Rectangle  (Length=a, Height=b)','  ▸ Circle       (Radius=d/2 @ a/4)','  ▸ Circle001  (Radius=d/2 @ 3a/4)','  ▸ Cut          (Rectangle − Circle)','  ▸ Cut001      (Cut − Circle001)'];
  const sorot=1+Math.floor((_pmFrame/45)%5);
  ctx.font="10px 'JetBrains Mono',monospace";
  baris.forEach((s,i)=>{const y=py+18+i*19; if(i===sorot){ctx.fillStyle='rgba(0,224,158,.18)'; ctx.fillRect(px+4,y-12,pohonW-8,17);} ctx.fillStyle=i===0?'#e2e8f0':'rgba(203,213,225,.9)'; ctx.fillText(s,px+8,y);});
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="9px 'JetBrains Mono',monospace";
  ctx.fillText('Tree view: ubah properti Length',px+8,py+18+6*19); ctx.fillText('→ Cut001 dihitung ulang otomatis',px+8,py+30+6*19);
  const luas=a*b-2*Math.PI*d*d/4;
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace";
  ctx.fillText('Cut001.Shape.Area = '+luas.toFixed(2)+' mm²',12,18);
  _ttlTulis('parametrikInfo','Luas bersih = a·b − 2·π·d²/4 = '+(a*b).toLocaleString('id-ID')+' − '+(2*Math.PI*d*d/4).toLocaleString('id-ID',{maximumFractionDigits:2})+' = '+luas.toLocaleString('id-ID',{maximumFractionDigits:2})+' mm² · posisi lubang mengikuti a karena diikat sebagai a/4 dan 3a/4');
  if(_ttlJalan('parametrik')){_pmFrame++; requestAnimationFrame(drawParametrik);}
}

_TTL_DAFTAR.push(['cvNavigasi',()=>drawNavigasi(),'navigasi',['sl_nv_az','sl_nv_el','sl_nv_zoom']]);
_TTL_DAFTAR.push(['cvBidang',()=>drawBidang(),'bidang',['sl_bd_plane','sl_bd_a','sl_bd_b']]);
_TTL_DAFTAR.push(['cvDraft',()=>drawDraft(),'draft',['sl_dr_bentuk','sl_dr_a','sl_dr_b','sl_dr_n']]);
_TTL_DAFTAR.push(['cvParametrik',()=>drawParametrik(),'parametrik',['sl_pm_a','sl_pm_b','sl_pm_d']]);
_ttlMulai();
