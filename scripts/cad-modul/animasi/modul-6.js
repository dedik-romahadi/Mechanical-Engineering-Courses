// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 6 PEMODELAN CAD — Sudut Pandang, Proyeksi, dan Manajemen Tampilan 3D
// Kanvas: cvKamera, cvTigaPandangan, cvPotong, cvBoundBox (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// ════════════════════════════════════════════════════════════
const _C6X='#ef4444', _C6Y='#22c55e', _C6Z='#3b82f6';
// Koordinat pandang: putar azimut sekeliling Z lalu miringkan elevasi; hasil [kanan, atas, kedalaman ke arah pengamat].
function _cad6V(p,az,el){
  const a=az*Math.PI/180, e=el*Math.PI/180;
  const x1=p[0]*Math.cos(a)-p[1]*Math.sin(a), y1=p[0]*Math.sin(a)+p[1]*Math.cos(a), z1=p[2];
  return [x1, z1*Math.cos(e)+y1*Math.sin(e), -y1*Math.cos(e)+z1*Math.sin(e)];
}
// Proyeksi ke layar: ortografik bila D tak hingga, perspektif bila kamera berjarak D dari titik asal (h' = h·D/(D − kedalaman)).
function _cad6P(p,az,el,sk,cx,cy,D){
  const v=_cad6V(p,az,el);
  const m=(D&&isFinite(D))?D/(D-v[2]):1;
  return [cx+sk*m*v[0], cy-sk*m*v[1]];
}
function _cad6Poli(ctx,P,isi,garis,lebar){
  ctx.beginPath(); P.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.closePath();
  if(isi){ctx.fillStyle=isi; ctx.fill();} ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.2; ctx.stroke();
}
function _cad6Sumbu(ctx,az,el,sk,cx,cy,L,D){
  const O=_cad6P([0,0,0],az,el,sk,cx,cy,D);
  [[[L,0,0],_C6X,'X'],[[0,L,0],_C6Y,'Y'],[[0,0,L],_C6Z,'Z']].forEach(([v,w,n])=>{const Q=_cad6P(v,az,el,sk,cx,cy,D); ctx.strokeStyle=w; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(O[0],O[1]); ctx.lineTo(Q[0],Q[1]); ctx.stroke(); ctx.fillStyle=w; ctx.font="bold 10px 'JetBrains Mono',monospace"; ctx.textAlign='left'; ctx.fillText(n,Q[0]+4,Q[1]-3);});
}
// Balok berpusat di titik asal: enam muka digambar dari yang terjauh ke yang terdekat (algoritma pelukis).
function _cad6Balok(ctx,a,b,h,az,el,sk,cx,cy,D,isi,garis){
  const c=[[-a/2,-b/2,-h/2],[a/2,-b/2,-h/2],[a/2,b/2,-h/2],[-a/2,b/2,-h/2],[-a/2,-b/2,h/2],[a/2,-b/2,h/2],[a/2,b/2,h/2],[-a/2,b/2,h/2]];
  const muka=[[0,1,2,3],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]];
  const urut=muka.map(m=>[m.reduce((s,i)=>s+_cad6V(c[i],az,el)[2],0)/4,m]).sort((p,q)=>p[0]-q[0]);
  urut.forEach(([dd,m],k)=>_cad6Poli(ctx,m.map(i=>_cad6P(c[i],az,el,sk,cx,cy,D)),isi,garis,k>=3?1.6:0.8));
  return c;
}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Kamera ortografik vs perspektif: balok yang berputar
// ════════════════════════════════════════════════════════════
let _km6Frame=0;
function toggleKamera(){_ttlToggle('kamera','btnKamera',drawKamera);}
window.toggleKamera=toggleKamera;
function drawKamera(){
  const k=_ttlKanvas('cvKamera'); if(!k) return; const {ctx,W,H}=k;
  const D=_ttlNilai('sl_km_jarak',250), a=_ttlNilai('sl_km_a',100), el=_ttlNilai('sl_km_el',25);
  _ttlTulis('v_km_jarak',D.toFixed(0)); _ttlTulis('v_km_a',a.toFixed(0)); _ttlTulis('v_km_el',el.toFixed(0));
  const b=60, h=40;
  const az=_ttlJalan('kamera')?(_km6Frame*0.5)%360:35;
  const diag=Math.sqrt(a*a+b*b+h*h)/2, mP=D/(D-diag);
  const sk=Math.max(0.05,Math.min(W*0.40,H*0.80)/(2*diag*mP));
  const cy=H*0.52;
  _ttlGaris(ctx,W/2,30,W/2,H-30,'rgba(148,163,184,.25)',1,[4,4]);
  [[W*0.25,'Ortografik (V, O)',Infinity,'#22d3ee'],[W*0.75,'Perspektif (V, P) — D = '+D.toFixed(0)+' mm',D,'#f59e0b']].forEach(([cx,judul,Dk,warna])=>{
    _cad6Sumbu(ctx,az,el,sk,cx,cy,Math.max(a,b)*0.75,Dk);
    _cad6Balok(ctx,a,b,h,az,el,sk,cx,cy,Dk,'rgba(34,211,238,.12)',warna);
    ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText(judul,cx,20);
  });
  const c=[[-a/2,-b/2,-h/2],[a/2,-b/2,-h/2],[a/2,b/2,-h/2],[-a/2,b/2,-h/2],[-a/2,-b/2,h/2],[a/2,-b/2,h/2],[a/2,b/2,h/2],[-a/2,b/2,h/2]];
  const dv=c.map(p=>_cad6V(p,az,el)[2]); const dekat=Math.max(...dv), jauh=Math.min(...dv);
  const rasio=(D-dekat)/(D-jauh);
  ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  ctx.fillText('rusuk sejajar tetap sejajar · ukuran hanya bergantung skala',W*0.25,H-12);
  ctx.fillText('sudut terjauh tampak '+(rasio*100).toFixed(0)+'% dari sudut terdekat',W*0.75,H-12);
  ctx.textAlign='left'; ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace";
  ctx.fillText('azimut '+az.toFixed(0)+'° · elevasi '+el.toFixed(0)+'° · balok '+a+' × '+b+' × '+h,12,H-30);
  _ttlTulis('kameraInfo','Perspektif: ukuran tampak h′ = h·f/D. Pada D = '+D.toFixed(0)+' mm, sudut balok yang terdekat kamera berjarak '+(D-dekat).toFixed(1)+' mm dan yang terjauh '+(D-jauh).toFixed(1)+' mm, sehingga bagian terjauh tampak '+(rasio*100).toFixed(1)+'% dari bagian terdekat; pada ortografik keduanya 100% (garis proyeksi sejajar).');
  if(_ttlJalan('kamera')){_km6Frame++; requestAnimationFrame(drawKamera);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Tiga pandangan dari satu benda: proyeksi bergerak ke bidang gambar
// ════════════════════════════════════════════════════════════
let _tp6Frame=0;
function toggleTigaPandangan(){_ttlToggle('tigapandangan','btnTigaPandangan',drawTigaPandangan);}
window.toggleTigaPandangan=toggleTigaPandangan;
function drawTigaPandangan(){
  const k=_ttlKanvas('cvTigaPandangan'); if(!k) return; const {ctx,W,H}=k;
  const a=_ttlNilai('sl_tp_a',120), Hh=_ttlNilai('sl_tp_H',80), hn=Math.min(_ttlNilai('sl_tp_hn',24),Hh-5), metode=Math.round(_ttlNilai('sl_tp_metode',1));
  _ttlTulis('v_tp_a',a.toFixed(0)); _ttlTulis('v_tp_H',Hh.toFixed(0)); _ttlTulis('v_tp_hn',hn.toFixed(0)); _ttlTulis('v_tp_metode',metode?'sudut ketiga':'sudut pertama');
  const b=60;
  const prof=[[0,0],[a,0],[a,Hh-hn],[a/2,Hh-hn],[a/2,Hh],[0,Hh]];
  const F0=prof.map(([x,z])=>[x,0,z]), F1=prof.map(([x,z])=>[x,b,z]);
  // benda 3D (kiri, ortografik)
  const az=35, el=25, sk3=Math.max(0.05,Math.min(W*0.28/(a+b),(H-90)/(Hh+b*0.6))), cx3=W*0.15, cy3=H*0.72;
  const P3=p=>_cad6P(p,az,el,sk3,cx3,cy3);
  _cad6Poli(ctx,F1.map(P3),'rgba(34,211,238,.06)','rgba(34,211,238,.35)',0.8);
  for(let i=0;i<6;i++){const j=(i+1)%6; _cad6Poli(ctx,[F0[i],F0[j],F1[j],F1[i]].map(P3),'rgba(34,211,238,.10)','rgba(34,211,238,.6)',1);}
  _cad6Poli(ctx,F0.map(P3),'rgba(34,211,238,.20)','#22d3ee',1.6);
  ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('benda 3D: balok bertakik',cx3+10,H-12);
  // tiga pandangan 2D (kanan): susunan mengikuti metode proyeksi
  const fase=Math.floor((_tp6Frame/80)%3);   // 0 Depan, 1 Atas, 2 Kanan
  const gap=12, sk2=Math.max(0.05,Math.min((W*0.50-gap)/(a+b),(H-70-gap)/(Hh+b)));
  const gw=(a+b)*sk2+gap, gh=(Hh+b)*sk2+gap;
  const gx=W*0.66-gw/2, gy=H*0.50-gh/2;
  let depan, atas, kanan;
  if(metode){ atas={x:gx,y:gy,w:a*sk2,h:b*sk2}; depan={x:gx,y:gy+b*sk2+gap,w:a*sk2,h:Hh*sk2}; kanan={x:gx+a*sk2+gap,y:depan.y,w:b*sk2,h:Hh*sk2}; }
  else { kanan={x:gx,y:gy,w:b*sk2,h:Hh*sk2}; depan={x:gx+b*sk2+gap,y:gy,w:a*sk2,h:Hh*sk2}; atas={x:depan.x,y:gy+Hh*sk2+gap,w:a*sk2,h:b*sk2}; }
  const warna=['#22d3ee','#f59e0b','#a855f7'], nama=['Depan','Atas','Kanan'];
  const pDepan=prof.map(([x,z])=>[depan.x+x*sk2,depan.y+depan.h-z*sk2]);
  const kotak2=r=>[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]];
  const pAtas=kotak2(atas), pKanan=kotak2(kanan);
  [[pDepan,0],[pAtas,1],[pKanan,2]].forEach(([pts,i])=>{const aktif=i===fase; _cad6Poli(ctx,pts,aktif?'rgba(255,255,255,.10)':'rgba(255,255,255,.03)',warna[i],aktif?2:1);});
  _ttlGaris(ctx,atas.x+a/2*sk2,atas.y,atas.x+a/2*sk2,atas.y+atas.h,warna[1],1);
  _ttlGaris(ctx,kanan.x,kanan.y+hn*sk2,kanan.x+kanan.w,kanan.y+hn*sk2,warna[2],1);
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  [depan,atas,kanan].forEach((r,i)=>{ctx.fillStyle=warna[i]; ctx.fillText(nama[i],r.x+r.w/2,r.y+r.h-5);});
  // garis proyeksi bergerak dari sudut benda ke sudut pandangan aktif
  const sumberAtas=metode?[[0,b,Hh],[a,b,Hh-hn],[a,0,Hh-hn],[0,0,Hh]]:[[0,0,Hh],[a,0,Hh-hn],[a,b,Hh-hn],[0,b,Hh]];
  const sumberKanan=metode?[[a/2,0,Hh],[a/2,b,Hh],[a,b,0],[a,0,0]]:[[a/2,b,Hh],[a/2,0,Hh],[a,0,0],[a,b,0]];
  const sumber=[F0,sumberAtas,sumberKanan][fase], tujuan=[pDepan,pAtas,pKanan][fase];
  ctx.setLineDash([6,5]); ctx.lineDashOffset=-((_tp6Frame*0.8)%22); ctx.strokeStyle=warna[fase]; ctx.lineWidth=0.9;
  sumber.forEach((p,i)=>{const s=P3(p), q=tujuan[i]; ctx.beginPath(); ctx.moveTo(s[0],s[1]); ctx.lineTo(q[0],q[1]); ctx.stroke();});
  ctx.setLineDash([]); ctx.lineDashOffset=0;
  const Adepan=a*Hh-(a/2)*hn;
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillText(metode?'Sudut ketiga: Atas di atas Depan, Kanan di kanan Depan':'Sudut pertama: Atas di bawah Depan, Kanan di kiri Depan',12,18);
  ctx.fillStyle='#00e09e'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='right';
  ctx.fillText('luas muka Depan = a·H − (a/2)·hₙ = '+Adepan.toFixed(0)+' mm²',W-12,H-12); ctx.textAlign='left';
  _ttlTulis('tigaPandanganInfo','Pandangan '+nama[fase]+' sedang diproyeksikan. Muka depan (profil XZ) luasnya a·H − (a/2)·h_n = '+a+'·'+Hh+' − '+(a/2)+'·'+hn+' = '+Adepan.toFixed(2)+' mm²; pandangan Atas '+a+' × '+b+' memperlihatkan rusuk takik di x = a/2, pandangan Kanan '+b+' × '+Hh+' memperlihatkan rusuk takik di z = H − h_n = '+(Hh-hn)+'.');
  if(_ttlJalan('tigapandangan')){_tp6Frame++; requestAnimationFrame(drawTigaPandangan);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Bidang potong bergeser: luas potongan balok berlubang
// ════════════════════════════════════════════════════════════
let _pt6Frame=0;
function togglePotong(){_ttlToggle('potong','btnPotong',drawPotong);}
window.togglePotong=togglePotong;
function drawPotong(){
  const k=_ttlKanvas('cvPotong'); if(!k) return; const {ctx,W,H}=k;
  const b=70;
  const a=_ttlNilai('sl_pt_a',120), h=_ttlNilai('sl_pt_h',40), d=Math.min(_ttlNilai('sl_pt_d',24),b-6), fy=_ttlNilai('sl_pt_y',0.5);
  const y0=_ttlJalan('potong')?b*(0.5+0.44*Math.sin(_pt6Frame/45)):b*fy;
  _ttlTulis('v_pt_a',a.toFixed(0)); _ttlTulis('v_pt_h',h.toFixed(0)); _ttlTulis('v_pt_d',d.toFixed(0)); _ttlTulis('v_pt_y',(y0/b).toFixed(2).replace('.',','));
  const r=d/2, e=Math.abs(y0-b/2), w=e<r?2*Math.sqrt(r*r-e*e):0, A=h*(a-w);
  // kiri: pandangan atas dengan garis potong A-A
  const sk=Math.max(0.05,Math.min(W*0.38/a,(H-110)/b)); const ox=W*0.07, oy=H*0.58+b*sk/2;
  const X=x=>ox+x*sk, Y=y=>oy-y*sk;
  _cad6Poli(ctx,[[X(0),Y(0)],[X(a),Y(0)],[X(a),Y(b)],[X(0),Y(b)]],'rgba(34,211,238,.14)','#22d3ee',1.6);
  ctx.beginPath(); ctx.arc(X(a/2),Y(b/2),r*sk,0,Math.PI*2); ctx.fillStyle='#020812'; ctx.fill(); ctx.strokeStyle='#22d3ee'; ctx.lineWidth=1.4; ctx.stroke();
  _ttlGaris(ctx,X(-12),Y(y0),X(a+12),Y(y0),'#ec4899',1.4,[10,3,2,3]);
  [X(-12),X(a+12)].forEach(x=>{ctx.strokeStyle='#ec4899'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(x,Y(y0)-22); ctx.lineTo(x,Y(y0)-6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x-4,Y(y0)-11); ctx.lineTo(x,Y(y0)-5); ctx.lineTo(x+4,Y(y0)-11); ctx.stroke(); ctx.fillStyle='#ec4899'; ctx.font="bold 11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('A',x,Y(y0)-26);});
  ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  ctx.fillText('Pandangan atas '+a+' × '+b+', lubang ⌀'+d+', bidang y₀ = '+y0.toFixed(1),X(a/2),H-12);
  // kanan: penampang potongan (satu atau dua bagian diarsir)
  const sk2=Math.max(0.05,Math.min(W*0.38/a,(H-140)/h)); const ox2=W*0.56, oy2=H*0.32;
  const ky=(a-w)/2;
  const bagian=w>0?[[ox2,ky],[ox2+(ky+w)*sk2,ky]]:[[ox2,a]];
  bagian.forEach(([xs,ws])=>{const wpx=ws*sk2, hp=h*sk2; _cad6Poli(ctx,[[xs,oy2],[xs+wpx,oy2],[xs+wpx,oy2+hp],[xs,oy2+hp]],'rgba(0,224,158,.10)','#00e09e',1.6);
    ctx.save(); ctx.beginPath(); ctx.rect(xs,oy2,wpx,hp); ctx.clip(); ctx.strokeStyle='rgba(0,224,158,.7)'; ctx.lineWidth=0.8;
    for(let c=-hp;c<wpx;c+=7){ctx.beginPath(); ctx.moveTo(xs+c,oy2+hp); ctx.lineTo(xs+c+hp,oy2); ctx.stroke();} ctx.restore();});
  const tx=ox2+a*sk2/2;
  ctx.fillStyle='#00e09e'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('Potongan A-A',tx,oy2-10);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.fillText(w>0?'A = h·(a − w) = '+h+'·('+a+' − '+w.toFixed(2)+')':'A = a·h (bidang tidak mengenai lubang)',tx,oy2+h*sk2+22);
  ctx.fillStyle='#00e09e'; ctx.fillText('= '+A.toFixed(1)+' mm²',tx,oy2+h*sk2+42);
  ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('w = 2√(r² − e²), e = |y₀ − b/2| = '+e.toFixed(1)+(e<r?'':' ≥ r'),tx,16);
  _ttlTulis('potongInfo','Bidang potong y₀ = '+y0.toFixed(2)+' mm berjarak e = '+e.toFixed(2)+' dari pusat lubang (r = '+r+'): '+(e<r?'celah selebar w = 2√(r² − e²) = '+w.toFixed(2)+' mm hilang dari penampang, A = h·(a − w) = '+A.toFixed(2)+' mm²':'bidang tidak mengenai lubang, penampang utuh A = a·h = '+A.toFixed(2)+' mm²')+'; tepat di pusat A = h·(a − d) = '+(h*(a-d)).toFixed(2)+' mm² (Tugas 4).');
  if(_ttlJalan('potong')){_pt6Frame++; requestAnimationFrame(drawPotong);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Kotak pembatas balok yang diputar θ: BoundBox.XLength
// ════════════════════════════════════════════════════════════
let _bb6Frame=0;
function toggleBoundBox(){_ttlToggle('boundbox','btnBoundBox',drawBoundBox);}
window.toggleBoundBox=toggleBoundBox;
function drawBoundBox(){
  const k=_ttlKanvas('cvBoundBox'); if(!k) return; const {ctx,W,H}=k;
  const a=_ttlNilai('sl_bb_a',120), b=_ttlNilai('sl_bb_b',80), thM=_ttlNilai('sl_bb_theta',30);
  const th=_ttlJalan('boundbox')?45-45*Math.cos(_bb6Frame/50):thM;
  _ttlTulis('v_bb_a',a.toFixed(0)); _ttlTulis('v_bb_b',b.toFixed(0)); _ttlTulis('v_bb_theta',th.toFixed(0));
  const r=th*Math.PI/180, c=Math.cos(r), s=Math.sin(r);
  const XL=a*c+b*s, YL=a*s+b*c, maks=Math.sqrt(a*a+b*b);
  // kiri: tampak atas alas yang diputar dan kotak pembatasnya
  const sk=Math.max(0.05,Math.min(W*0.42/(a+b),(H-76)/(a+b)));
  const ox=W*0.04+b*sk, oy=H-40;
  const X=x=>ox+x*sk, Y=y=>oy-y*sk;
  ctx.setLineDash([4,4]); _cad6Poli(ctx,[[X(0),Y(0)],[X(a),Y(0)],[X(a),Y(b)],[X(0),Y(b)]],null,'rgba(148,163,184,.35)',1); ctx.setLineDash([]);
  const rot=[[0,0],[a,0],[a,b],[0,b]].map(([x,y])=>[X(x*c-y*s),Y(x*s+y*c)]);
  _cad6Poli(ctx,rot,'rgba(34,211,238,.16)','#22d3ee',2);
  const xmin=X(-b*s), xmax=X(a*c), ymin=Y(YL), ymax=Y(0);
  ctx.setLineDash([7,4]); _cad6Poli(ctx,[[xmin,ymin],[xmax,ymin],[xmax,ymax],[xmin,ymax]],null,'#f59e0b',1.4); ctx.setLineDash([]);
  ctx.strokeStyle='#ec4899'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(X(0),Y(0),26,0,-r,true); ctx.stroke();
  ctx.fillStyle='#ec4899'; ctx.font="bold 11px 'JetBrains Mono',monospace"; ctx.textAlign='left'; ctx.fillText('θ = '+th.toFixed(0)+'°',X(0)+30,Y(0)-8);
  ctx.fillStyle='#f59e0b'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('XLength = '+XL.toFixed(2),(xmin+xmax)/2,ymax+16);
  ctx.save(); ctx.translate(xmax+12,(ymin+ymax)/2); ctx.rotate(-Math.PI/2); ctx.fillText('YLength = '+YL.toFixed(2),0,0); ctx.restore();
  // kanan: grafik XLength(θ) dan YLength(θ)
  const gx0=W*0.60, gx1=W*0.96, gy0=H-40, gy1=44;
  _ttlGaris(ctx,gx0,gy0,gx1,gy0,'rgba(148,163,184,.6)',1); _ttlGaris(ctx,gx0,gy0,gx0,gy1,'rgba(148,163,184,.6)',1);
  const kurva=(f,warna)=>{ctx.strokeStyle=warna; ctx.lineWidth=1.8; ctx.beginPath(); for(let i=0;i<=90;i++){const q=i*Math.PI/180, v=f(q); const px=gx0+(gx1-gx0)*i/90, py=gy0-(gy0-gy1)*v/maks*0.92; i?ctx.lineTo(px,py):ctx.moveTo(px,py);} ctx.stroke();};
  kurva(q=>a*Math.cos(q)+b*Math.sin(q),'#22d3ee'); kurva(q=>a*Math.sin(q)+b*Math.cos(q),'#a855f7');
  const px=gx0+(gx1-gx0)*th/90, py=gy0-(gy0-gy1)*XL/maks*0.92;
  ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2); ctx.fill();
  _ttlGaris(ctx,px,py,px,gy0,'rgba(245,158,11,.5)',1,[3,3]);
  ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('θ (°): 0 → 90',(gx0+gx1)/2,gy0+14);
  ctx.textAlign='left'; ctx.fillStyle='#22d3ee'; ctx.fillText('XLength = a·cosθ + b·sinθ',gx0,18); ctx.fillStyle='#a855f7'; ctx.fillText('YLength = a·sinθ + b·cosθ',gx0,32);
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.fillText('maks √(a² + b²) = '+maks.toFixed(2)+' saat tan θ = b/a (θ = '+(Math.atan2(b,a)*180/Math.PI).toFixed(1)+'°)',gx0,gy0+28);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillText('Alas '+a+' × '+b+' diputar θ; kotak putus = Bounding box',12,18);
  _ttlTulis('boundBoxInfo','θ = '+th.toFixed(1)+'°: XLength = a·cosθ + b·sinθ = '+XL.toFixed(3)+' mm, YLength = a·sinθ + b·cosθ = '+YL.toFixed(3)+' mm; kotak pembatas sejajar sumbu global membesar dari '+a+' × '+b+' menjadi '+XL.toFixed(1)+' × '+YL.toFixed(1)+' (ZLength tetap). XLength terbesar √(a² + b²) = '+maks.toFixed(2)+' mm saat tan θ = b/a.');
  if(_ttlJalan('boundbox')){_bb6Frame++; requestAnimationFrame(drawBoundBox);}
}

_TTL_DAFTAR.push(['cvKamera',()=>drawKamera(),'kamera',['sl_km_jarak','sl_km_a','sl_km_el']]);
_TTL_DAFTAR.push(['cvTigaPandangan',()=>drawTigaPandangan(),'tigapandangan',['sl_tp_a','sl_tp_H','sl_tp_hn','sl_tp_metode']]);
_TTL_DAFTAR.push(['cvPotong',()=>drawPotong(),'potong',['sl_pt_a','sl_pt_h','sl_pt_d','sl_pt_y']]);
_TTL_DAFTAR.push(['cvBoundBox',()=>drawBoundBox(),'boundbox',['sl_bb_a','sl_bb_b','sl_bb_theta']]);
_ttlMulai();
