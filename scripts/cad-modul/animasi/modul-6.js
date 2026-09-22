// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 6 PEMODELAN CAD — Sudut Pandang, Proyeksi, dan Manajemen Tampilan 3D
// Kanvas: cvKamera, cvTigaPandangan, cvPotong, cvBoundBox (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// Tata letak: kanvas lebar mempertahankan susunan kiri-kanan (teks yang tidak muat digeser atau
// dibungkus); kanvas sempit (W < _TTL_SEMPIT, ponsel) dipertinggi lewat _ttlKanvas(id, hSempit)
// dan disusun atas-bawah agar keterangan tidak terpotong.
// ════════════════════════════════════════════════════════════
const _C6X='#ef4444', _C6Y='#22c55e', _C6Z='#3b82f6';
const _F6=(px,gaya)=>(gaya?gaya+' ':'')+px+"px 'JetBrains Mono',monospace";
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
// Sumbu X/Y/Z. Label dijepit ke dalam batas [x0,y0,x1,y1] (bawaan: tepi kanvas) agar tidak terpotong atau
// menimpa keterangan, dan digeser ke samping bila menumpuk label sebelumnya (X dan Y berimpit saat elevasi 0°).
function _cad6Sumbu(ctx,az,el,sk,cx,cy,L,D,batas){
  const O=_cad6P([0,0,0],az,el,sk,cx,cy,D), [x0,y0,x1,y1]=batas||[4,4,ctx.canvas.width-4,ctx.canvas.height-4], pos=[];
  [[[L,0,0],_C6X,'X'],[[0,L,0],_C6Y,'Y'],[[0,0,L],_C6Z,'Z']].forEach(([v,w,n])=>{const Q=_cad6P(v,az,el,sk,cx,cy,D); ctx.strokeStyle=w; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(O[0],O[1]); ctx.lineTo(Q[0],Q[1]); ctx.stroke(); ctx.fillStyle=w; ctx.font="bold 10px 'JetBrains Mono',monospace"; ctx.textAlign='left';
    let lx=Math.min(Math.max(Q[0]+4,x0),x1-7); const ly=Math.min(Math.max(Q[1]-3,y0+8),y1);
    pos.forEach(([px,py])=>{if(Math.abs(lx-px)<8&&Math.abs(ly-py)<9) lx=px+9>x1-7?px-9:px+9;});
    pos.push([lx,ly]); ctx.fillText(n,lx,ly);});
}
// Balok berpusat di titik asal: enam muka digambar dari yang terjauh ke yang terdekat (algoritma pelukis).
function _cad6Balok(ctx,a,b,h,az,el,sk,cx,cy,D,isi,garis){
  const c=[[-a/2,-b/2,-h/2],[a/2,-b/2,-h/2],[a/2,b/2,-h/2],[-a/2,b/2,-h/2],[-a/2,-b/2,h/2],[a/2,-b/2,h/2],[a/2,b/2,h/2],[-a/2,b/2,h/2]];
  const muka=[[0,1,2,3],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]];
  const urut=muka.map(m=>[m.reduce((s,i)=>s+_cad6V(c[i],az,el)[2],0)/4,m]).sort((p,q)=>p[0]-q[0]);
  urut.forEach(([dd,m],k)=>_cad6Poli(ctx,m.map(i=>_cad6P(c[i],az,el,sk,cx,cy,D)),isi,garis,k>=3?1.6:0.8));
  return c;
}
// Kotak batas proyeksi titik-titik pada sejumlah azimut (satuan model, sk = 1, pusat 0; y layar ke bawah).
function _cad6Kotak(pts,azs,el,D){
  let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
  azs.forEach(az=>pts.forEach(p=>{const q=_cad6P(p,az,el,1,0,0,D); x0=Math.min(x0,q[0]); x1=Math.max(x1,q[0]); y0=Math.min(y0,q[1]); y1=Math.max(y1,q[1]);}));
  return [x0,y0,x1,y1];
}
// Tata letak teks (aturan _ttlTeks, per bagian): satu baris bila muat maxW; bila tidak, tiap bagian mendapat
// baris sendiri dengan SATU ukuran huruf bersama (dikecilkan sampai susut × ukuran, bawaan 85%, tidak di
// bawah 8 px; susut = 1 berarti langsung dipecah) lalu dipecah per kata bila masih kepanjangan. Hasil {font, baris}.
function _cad6Tata(ctx,bagian,maxW,susut){
  const f=ctx.font, utuh=bagian.join(' ');
  if(ctx.measureText(utuh).width<=maxW) return {font:f,baris:[utuh]};
  const px=parseFloat(/(\d+(?:\.\d+)?)px/.exec(f)[1]), minPx=Math.max(8,px*(susut||0.85));
  let uk=px, font=f;
  const lebar=()=>Math.max(...bagian.map(b=>ctx.measureText(b).width));
  while(lebar()>maxW&&uk>minPx){uk=Math.max(minPx,uk-0.5); font=f.replace(/\d+(?:\.\d+)?px/,uk+'px'); ctx.font=font;}
  const baris=[];
  bagian.forEach(t=>{let b=''; for(const kata of t.split(' ')){const coba=b?b+' '+kata:kata; if(b&&ctx.measureText(coba).width>maxW){baris.push(b); b=kata;} else b=coba;} if(b) baris.push(b);});
  ctx.font=f; return {font,baris};
}
// Menulis hasil _cad6Tata mulai baseline y (perataan mengikuti ctx.textAlign); mengembalikan y baris berikutnya.
function _cad6Judul(ctx,bagian,x,y,maxW,lh,susut){
  const t=_cad6Tata(ctx,bagian,maxW,susut), f=ctx.font; ctx.font=t.font;
  t.baris.forEach(b=>{ctx.fillText(b,x,y); y+=lh;});
  ctx.font=f; return y;
}
// Jumlah baris yang akan ditulis _cad6Judul, tanpa menggambar (untuk menata gambar lebih dulu).
function _cad6Baris(ctx,bagian,maxW,susut){return _cad6Tata(ctx,bagian,maxW,susut).baris.length;}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Kamera ortografik vs perspektif: balok yang berputar
// ════════════════════════════════════════════════════════════
let _km6Frame=0;
function toggleKamera(){_ttlToggle('kamera','btnKamera',drawKamera);}
window.toggleKamera=toggleKamera;
function drawKamera(){
  const k=_ttlKanvas('cvKamera',420); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const D=_ttlNilai('sl_km_jarak',250), a=_ttlNilai('sl_km_a',100), el=_ttlNilai('sl_km_el',25);
  _ttlTulis('v_km_jarak',D.toFixed(0)); _ttlTulis('v_km_a',a.toFixed(0)); _ttlTulis('v_km_el',el.toFixed(0));
  const b=60, h=40;
  const az=_ttlJalan('kamera')?(_km6Frame*0.5)%360:35;
  const diag=Math.sqrt(a*a+b*b+h*h)/2, mP=D/(D-diag), L=Math.max(a,b)*0.75;
  const c=[[-a/2,-b/2,-h/2],[a/2,-b/2,-h/2],[a/2,b/2,-h/2],[-a/2,b/2,-h/2],[-a/2,-b/2,h/2],[a/2,-b/2,h/2],[a/2,b/2,h/2],[-a/2,b/2,h/2]];
  const dv=c.map(p=>_cad6V(p,az,el)[2]); const dekat=Math.max(...dv), jauh=Math.min(...dv);
  const rasio=(D-dekat)/(D-jauh);
  // [judul, jarak kamera, warna garis, keterangan bawah]
  const panel=[['Ortografik (V, O)',Infinity,'#22d3ee','rusuk sejajar tetap sejajar · ukuran hanya bergantung skala'],
               ['Perspektif (V, P) — D = '+D.toFixed(0)+' mm',D,'#f59e0b','sudut terjauh tampak '+(rasio*100).toFixed(0)+'% dari sudut terdekat']];
  const ketAz=s=>['azimut '+s+'° · elevasi '+el.toFixed(0)+'° ·','balok '+a+'\u00a0×\u00a0'+b+'\u00a0×\u00a0'+h];
  const ket=ketAz(az.toFixed(0));
  if(!sempit){
    const sk=Math.max(0.05,Math.min(W*0.40,H*0.80)/(2*diag*mP));
    const cy=H*0.52;
    // Keterangan bawah dibungkus dalam setengah lebar (rata bawah); baris azimut naik di atasnya bila perlu.
    ctx.font=_F6(10); const cat=panel.map(p=>_cad6Tata(ctx,[p[3]],W/2-16,1)), nC=Math.max(...cat.map(t=>t.baris.length));
    const yKet=Math.min(H-30,H-12-(nC-1)*12-18);
    ctx.font=_F6(11); const lKet=ctx.measureText(ket.join(' ')).width;
    _ttlGaris(ctx,W/2,30,W/2,12+lKet>W/2-8?yKet-14:H-30,'rgba(148,163,184,.25)',1,[4,4]);
    panel.forEach(([judul,Dk,warna],i)=>{
      const cx=W*(0.25+0.5*i);
      _cad6Sumbu(ctx,az,el,sk,cx,cy,L,Dk,[cx-W/4+4,28,cx+W/4-4,yKet-12]);
      _cad6Balok(ctx,a,b,h,az,el,sk,cx,cy,Dk,'rgba(34,211,238,.12)',warna);
      ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; _ttlTeks(ctx,judul,cx,20,W/2-12);
    });
    ctx.fillStyle='rgba(148,163,184,.9)'; ctx.textAlign='center';
    cat.forEach((t,i)=>{ctx.font=t.font; t.baris.forEach((s,j)=>ctx.fillText(s,W*(0.25+0.5*i),H-12-(t.baris.length-1-j)*12));});
    ctx.textAlign='left'; ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace";
    _ttlTeks(ctx,ket.join(' '),12,yKet,W-24);
  } else {
    // Sempit: panel ortografik di atas, perspektif di bawah (masing-masing selebar kanvas); baris azimut di dasar.
    ctx.font=_F6(11); const nK=_cad6Baris(ctx,ketAz('359'),W-24);   // azimut 3 digit agar tata letak tidak melompat
    const yKet=H-10-(nK-1)*14, tp=(yKet-16)/2;                         // tp = tinggi tiap panel
    ctx.font=_F6(10); const cat=panel.map(p=>_cad6Tata(ctx,[p[3]],W-16,1)), nC=Math.max(...cat.map(t=>t.baris.length));
    // Skala bersama dari batas proyeksi pada semua azimut (balok + ujung sumbu, kedua proyeksi): balok yang
    // berputar dan label sumbunya tetap di dalam panel pada nilai slider apa pun.
    const titik=c.concat([[0,0,0],[L,0,0],[0,L,0],[0,0,L]]), azs=Array.from({length:72},(_,i)=>i*5);
    const kb=[Infinity,D].map(Dk=>_cad6Kotak(titik,azs,el,Dk));
    const bx0=Math.min(kb[0][0],kb[1][0]), by0=Math.min(kb[0][1],kb[1][1]), bx1=Math.max(kb[0][2],kb[1][2]), by1=Math.max(kb[0][3],kb[1][3]);
    const zA=30, zB=tp-14-nC*12;                                      // batas gambar relatif terhadap puncak panel
    const sk=Math.max(0.05,Math.min((W-36)/(bx1-bx0),(zB-zA-10)/(by1-by0)));
    panel.forEach(([judul,Dk,warna],i)=>{
      const y0=i*tp, cx=(W-10)/2-sk*(bx0+bx1)/2, cy=y0+(zA+10+zB)/2-sk*(by0+by1)/2;
      _cad6Sumbu(ctx,az,el,sk,cx,cy,L,Dk,[6,y0+zA,W-6,y0+zB+4]);
      _cad6Balok(ctx,a,b,h,az,el,sk,cx,cy,Dk,'rgba(34,211,238,.12)',warna);
      ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font=_F6(11); ctx.textAlign='center'; _ttlTeks(ctx,judul,W/2,y0+18,W-16);
      ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font=cat[i].font; cat[i].baris.forEach((s,j)=>ctx.fillText(s,W/2,y0+tp-10-(cat[i].baris.length-1-j)*12));
    });
    _ttlGaris(ctx,12,tp,W-12,tp,'rgba(148,163,184,.25)',1,[4,4]);
    ctx.textAlign='left'; ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font=_F6(11);
    _cad6Judul(ctx,ket,12,yKet,W-24,14);
  }
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
  const k=_ttlKanvas('cvTigaPandangan',380); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const a=_ttlNilai('sl_tp_a',120), Hh=_ttlNilai('sl_tp_H',80), hn=Math.min(_ttlNilai('sl_tp_hn',24),Hh-5), metode=Math.round(_ttlNilai('sl_tp_metode',1));
  _ttlTulis('v_tp_a',a.toFixed(0)); _ttlTulis('v_tp_H',Hh.toFixed(0)); _ttlTulis('v_tp_hn',hn.toFixed(0)); _ttlTulis('v_tp_metode',metode?'sudut ketiga':'sudut pertama');
  const b=60;
  const prof=[[0,0],[a,0],[a,Hh-hn],[a/2,Hh-hn],[a/2,Hh],[0,Hh]];
  const F0=prof.map(([x,z])=>[x,0,z]), F1=prof.map(([x,z])=>[x,b,z]);
  const az=35, el=25, gap=12;
  const judul=metode?['Sudut ketiga: Atas di atas Depan,','Kanan di kanan Depan']:['Sudut pertama: Atas di bawah Depan,','Kanan di kiri Depan'];
  const Adepan=a*Hh-(a/2)*hn;
  const luas=['luas muka Depan = a·H − (a/2)·hₙ','= '+Adepan.toFixed(0)+' mm²'];
  let sk3,cx3,cy3,sk2,gx,gy,yBenda=0,yLuas=0;
  if(!sempit){
    // benda 3D (kiri, ortografik) dan tiga pandangan (kanan) seperti semula
    sk3=Math.max(0.05,Math.min(W*0.28/(a+b),(H-90)/(Hh+b*0.6))); cx3=W*0.15; cy3=H*0.72;
    sk2=Math.max(0.05,Math.min((W*0.50-gap)/(a+b),(H-70-gap)/(Hh+b)));
    const gw=(a+b)*sk2+gap, gh=(Hh+b)*sk2+gap;
    gx=W*0.66-gw/2; gy=H*0.50-gh/2;
  } else {
    // Sempit: judul, keterangan benda 3D, benda 3D, tiga pandangan, lalu rumus luas (rata bawah).
    ctx.font=_F6(11); const nJ=_cad6Baris(ctx,judul,W-24);
    ctx.font=_F6(10); const nL=_cad6Baris(ctx,luas,W-24);
    yBenda=18+14*nJ+2; yLuas=H-10-(nL-1)*13;
    const kb=_cad6Kotak(F0.concat(F1),[az],el,Infinity);
    const atas3=yBenda+10, bawah3=atas3+Math.round((yLuas-18-atas3)*0.36);
    sk3=Math.max(0.05,Math.min((W-24)/(kb[2]-kb[0]),(bawah3-atas3)/(kb[3]-kb[1])));
    cx3=W/2-sk3*(kb[0]+kb[2])/2; cy3=(atas3+bawah3)/2-sk3*(kb[1]+kb[3])/2;
    const atas2=bawah3+14, bawah2=yLuas-18;
    sk2=Math.max(0.05,Math.min((W-24-gap)/(a+b),(bawah2-atas2-gap)/(Hh+b)));
    const gw=(a+b)*sk2+gap, gh=(Hh+b)*sk2+gap;
    gx=W/2-gw/2; gy=atas2+(bawah2-atas2-gh)/2;
  }
  const P3=p=>_cad6P(p,az,el,sk3,cx3,cy3);
  _cad6Poli(ctx,F1.map(P3),'rgba(34,211,238,.06)','rgba(34,211,238,.35)',0.8);
  for(let i=0;i<6;i++){const j=(i+1)%6; _cad6Poli(ctx,[F0[i],F0[j],F1[j],F1[i]].map(P3),'rgba(34,211,238,.10)','rgba(34,211,238,.6)',1);}
  _cad6Poli(ctx,F0.map(P3),'rgba(34,211,238,.20)','#22d3ee',1.6);
  ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  if(!sempit) ctx.fillText('benda 3D: balok bertakik',cx3+10,H-12); else _ttlTeks(ctx,'benda 3D: balok bertakik',W/2,yBenda,W-24);
  // tiga pandangan 2D (kanan): susunan mengikuti metode proyeksi
  const fase=Math.floor((_tp6Frame/80)%3);   // 0 Depan, 1 Atas, 2 Kanan
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
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  if(!sempit) ctx.fillText(judul.join(' '),12,18); else _cad6Judul(ctx,judul,12,18,W-24,14);
  ctx.fillStyle='#00e09e'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='right';
  if(!sempit) ctx.fillText(luas.join(' '),W-12,H-12); else _cad6Judul(ctx,luas,W-12,yLuas,W-24,13);
  ctx.textAlign='left';
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
  const k=_ttlKanvas('cvPotong',400); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const b=70;
  const a=_ttlNilai('sl_pt_a',120), h=_ttlNilai('sl_pt_h',40), d=Math.min(_ttlNilai('sl_pt_d',24),b-6), fy=_ttlNilai('sl_pt_y',0.5);
  const y0=_ttlJalan('potong')?b*(0.5+0.44*Math.sin(_pt6Frame/45)):b*fy;
  _ttlTulis('v_pt_a',a.toFixed(0)); _ttlTulis('v_pt_h',h.toFixed(0)); _ttlTulis('v_pt_d',d.toFixed(0)); _ttlTulis('v_pt_y',(y0/b).toFixed(2).replace('.',','));
  const r=d/2, e=Math.abs(y0-b/2), w=e<r?2*Math.sqrt(r*r-e*e):0, A=h*(a-w);
  // Teks (sebagai bagian yang boleh dipecah di kanvas sempit); ukurTeks memberi versi terpanjang untuk menata.
  const cap=s=>['Pandangan atas '+a+'\u00a0×\u00a0'+b+', lubang ⌀'+d+',','bidang y₀ = '+s];
  const rumusA=ww=>ww>0?['A = h·(a − w)','= '+h+'·('+a+' − '+ww.toFixed(2)+')']:['A = a·h','(bidang tidak mengenai lubang)'];
  const rumusW=(ee,luar)=>['w = 2√(r² − e²),','e = |y₀ − b/2| = '+ee.toFixed(1)+(luar?' ≥ r':'')];
  let sk,ox,oy,sk2,ox2,oy2,yCap=0;
  if(!sempit){
    sk=Math.max(0.05,Math.min(W*0.38/a,(H-110)/b)); ox=W*0.07; oy=H*0.58+b*sk/2;
    sk2=Math.max(0.05,Math.min(W*0.38/a,(H-140)/h)); ox2=W*0.56; oy2=H*0.32;
  } else {
    // Sempit: pandangan atas (label A bisa 34 px di atas balok), keterangannya, lalu penampang A-A dan rumus.
    sk=Math.max(0.05,Math.min((W-32)/(a+24),110/b)); ox=(W-a*sk)/2; oy=44+b*sk;
    ctx.font=_F6(10); const nCap=_cad6Baris(ctx,cap('00.0'),W-20);
    yCap=oy+16; oy2=yCap+(nCap-1)*13+34;
    // Tinggi blok rumus diukur dari varian terpanjang agar penampang tidak berubah ukuran tiap bingkai.
    ctx.font=_F6(11); const nA=Math.max(_cad6Baris(ctx,rumusA(88.88),W-20),_cad6Baris(ctx,rumusA(0),W-20));
    ctx.font=_F6(10); const nW=_cad6Baris(ctx,rumusW(88.8,true),W-20);
    const tinggiR=22+(nA-1)*16+20+18+(nW-1)*13;
    sk2=Math.max(0.05,Math.min((W-24)/a,(H-10-tinggiR-oy2)/h)); ox2=(W-a*sk2)/2;
  }
  // pandangan atas dengan garis potong A-A
  const X=x=>ox+x*sk, Y=y=>oy-y*sk;
  _cad6Poli(ctx,[[X(0),Y(0)],[X(a),Y(0)],[X(a),Y(b)],[X(0),Y(b)]],'rgba(34,211,238,.14)','#22d3ee',1.6);
  ctx.beginPath(); ctx.arc(X(a/2),Y(b/2),r*sk,0,Math.PI*2); ctx.fillStyle='#020812'; ctx.fill(); ctx.strokeStyle='#22d3ee'; ctx.lineWidth=1.4; ctx.stroke();
  _ttlGaris(ctx,X(-12),Y(y0),X(a+12),Y(y0),'#ec4899',1.4,[10,3,2,3]);
  [X(-12),X(a+12)].forEach(x=>{ctx.strokeStyle='#ec4899'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(x,Y(y0)-22); ctx.lineTo(x,Y(y0)-6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x-4,Y(y0)-11); ctx.lineTo(x,Y(y0)-5); ctx.lineTo(x+4,Y(y0)-11); ctx.stroke(); ctx.fillStyle='#ec4899'; ctx.font="bold 11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('A',x,Y(y0)-26);});
  ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  const capT=cap(y0.toFixed(1));
  if(!sempit){
    // keterangan di tengah balok, dijepit agar tidak keluar tepi kiri saat balok sempit (a kecil) dan tidak
    // masuk kolom penampang di kanan (dikecilkan seperti _ttlTeks bila perlu, mis. tablet; rata bawah)
    const maxC=ox2-24; let t=_cad6Tata(ctx,[capT.join(' ')],maxC); if(t.baris.length>1) t=_cad6Tata(ctx,capT,maxC); ctx.font=t.font;
    const lc=Math.max(...t.baris.map(s=>ctx.measureText(s).width)), xc=Math.min(Math.max(12+lc/2,X(a/2)),ox2-12-lc/2);
    t.baris.forEach((s,j)=>ctx.fillText(s,xc,H-12-(t.baris.length-1-j)*12));
  } else _cad6Judul(ctx,capT,W/2,yCap,W-20,13);
  // penampang potongan (satu atau dua bagian diarsir)
  const ky=(a-w)/2;
  const bagian=w>0?[[ox2,ky],[ox2+(ky+w)*sk2,ky]]:[[ox2,a]];
  bagian.forEach(([xs,ws])=>{const wpx=ws*sk2, hp=h*sk2; _cad6Poli(ctx,[[xs,oy2],[xs+wpx,oy2],[xs+wpx,oy2+hp],[xs,oy2+hp]],'rgba(0,224,158,.10)','#00e09e',1.6);
    ctx.save(); ctx.beginPath(); ctx.rect(xs,oy2,wpx,hp); ctx.clip(); ctx.strokeStyle='rgba(0,224,158,.7)'; ctx.lineWidth=0.8;
    // garis arsir 45° dipotong ke dalam persegi (x0..x1) agar ujungnya tidak melewati tepi kanvas
    for(let c=-hp;c<wpx;c+=7){const x0=Math.max(xs,xs+c), x1=Math.min(xs+wpx,xs+c+hp); if(x1<=x0) continue; ctx.beginPath(); ctx.moveTo(x0,oy2+hp-(x0-xs-c)); ctx.lineTo(x1,oy2+hp-(x1-xs-c)); ctx.stroke();} ctx.restore();});
  const tx=ox2+a*sk2/2;
  ctx.fillStyle='#00e09e'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('Potongan A-A',tx,oy2-10);
  const rA=rumusA(w), rW=rumusW(e,e>=r);
  if(!sempit){
    ctx.fillStyle='rgba(226,232,240,.92)'; ctx.fillText(rA.join(' '),tx,oy2+h*sk2+22);
    ctx.fillStyle='#00e09e'; ctx.fillText('= '+A.toFixed(1)+' mm²',tx,oy2+h*sk2+42);
    ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText(rW.join(' '),tx,16);
  } else {
    let y=oy2+h*sk2+22;
    ctx.fillStyle='rgba(226,232,240,.92)'; y=_cad6Judul(ctx,rA,tx,y,W-20,16);
    ctx.fillStyle='#00e09e'; ctx.fillText('= '+A.toFixed(1)+' mm²',tx,y+4);
    ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font=_F6(10); _cad6Judul(ctx,rW,tx,y+22,W-20,13);
  }
  ctx.textAlign='left';
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
  const k=_ttlKanvas('cvBoundBox',420); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const a=_ttlNilai('sl_bb_a',120), b=_ttlNilai('sl_bb_b',80), thM=_ttlNilai('sl_bb_theta',30);
  const th=_ttlJalan('boundbox')?45-45*Math.cos(_bb6Frame/50):thM;
  _ttlTulis('v_bb_a',a.toFixed(0)); _ttlTulis('v_bb_b',b.toFixed(0)); _ttlTulis('v_bb_theta',th.toFixed(0));
  const r=th*Math.PI/180, c=Math.cos(r), s=Math.sin(r);
  const XL=a*c+b*s, YL=a*s+b*c, maks=Math.sqrt(a*a+b*b);
  const judul=['Alas '+a+'\u00a0×\u00a0'+b+' diputar θ;','kotak putus = Bounding box'];
  const tMaks=['maks √(a² + b²) = '+maks.toFixed(2),'saat tan θ = b/a (θ = '+(Math.atan2(b,a)*180/Math.PI).toFixed(1)+'°)'];
  let sk,ox,oy,gx0,gx1,gy0,gy1,atas=0,yLeg=18;
  if(!sempit){
    sk=Math.max(0.05,Math.min(W*0.42/(a+b),(H-76)/(a+b))); ox=W*0.04+b*sk; oy=H-40;
    gx0=W*0.60; gx1=W*0.96; gy0=H-40; gy1=44;
  } else {
    // Sempit: judul, tampak atas (selebar kanvas), lalu grafik XLength(θ)/YLength(θ) beserta keterangannya.
    ctx.font=_F6(11); const nJ=_cad6Baris(ctx,judul,W-24);
    ctx.font=_F6(10); const nM=_cad6Baris(ctx,tMaks,W-24);
    atas=18+14*nJ;
    // satuan tampak atas: x ∈ [−b, a], y ∈ [0, √(a² + b²)]; sisakan 22 px kanan (YLength) dan 24 px bawah (XLength)
    const tinggiA=Math.round((H-atas)*0.44);
    sk=Math.max(0.05,Math.min((W-24-22)/(a+b),(tinggiA-32)/maks));
    ox=12+b*sk+((W-24-22)-(a+b)*sk)/2; oy=atas+tinggiA-24;
    yLeg=atas+tinggiA+14;
    gx0=16; gx1=W-16; gy1=yLeg+24; gy0=H-10-(nM-1)*13-28;
  }
  // tampak atas alas yang diputar dan kotak pembatasnya
  const X=x=>ox+x*sk, Y=y=>oy-y*sk;
  ctx.setLineDash([4,4]); _cad6Poli(ctx,[[X(0),Y(0)],[X(a),Y(0)],[X(a),Y(b)],[X(0),Y(b)]],null,'rgba(148,163,184,.35)',1); ctx.setLineDash([]);
  const rot=[[0,0],[a,0],[a,b],[0,b]].map(([x,y])=>[X(x*c-y*s),Y(x*s+y*c)]);
  _cad6Poli(ctx,rot,'rgba(34,211,238,.16)','#22d3ee',2);
  const xmin=X(-b*s), xmax=X(a*c), ymin=Y(YL), ymax=Y(0);
  ctx.setLineDash([7,4]); _cad6Poli(ctx,[[xmin,ymin],[xmax,ymin],[xmax,ymax],[xmin,ymax]],null,'#f59e0b',1.4); ctx.setLineDash([]);
  ctx.strokeStyle='#ec4899'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(X(0),Y(0),26,0,-r,true); ctx.stroke();
  ctx.fillStyle='#ec4899'; ctx.font="bold 11px 'JetBrains Mono',monospace"; ctx.textAlign='left'; ctx.fillText('θ = '+th.toFixed(0)+'°',X(0)+30,Y(0)-8);
  // Baris "maks" kanvas lebar: tetap di gx0 kecuali keluar tepi kanan (tablet), lalu digeser ke kiri sehingga bisa
  // berada di bawah label YLength; posisinya dihitung lebih dulu agar label itu bisa menghindarinya.
  const tM=tMaks.join(' '); ctx.font=_F6(10); const lM=ctx.measureText(tM).width, mx=gx0+lM<=W?gx0:W-12-lM;
  // label ukuran kotak pembatas, dijepit ke dalam kanvas; label YLength (vertikal, berpusat di sisi kotak) dijaga
  // di atas label θ dan XLength (kanvas sempit) atau di atas baris "maks" yang bergeser ke bawahnya (kanvas lebar)
  ctx.fillStyle='#f59e0b'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  const tX='XLength = '+XL.toFixed(2), tY='YLength = '+YL.toFixed(2), lX=ctx.measureText(tX).width, lY=ctx.measureText(tY).width;
  ctx.fillText(tX,Math.min(Math.max((xmin+xmax)/2,lX/2+4),W-lX/2-4),ymax+16);
  const xY=Math.min(xmax+12,W-6);
  let yY=(ymin+ymax)/2;
  if(sempit) yY=Math.min(Math.max(yY,atas+4+lY/2),ymax-20-lY/2);
  else if(xY-9<mx+lM&&xY+4>mx) yY=Math.min(yY,gy0+17-lY/2);
  ctx.save(); ctx.translate(xY,Math.min(Math.max(yY,lY/2+4),H-lY/2-4)); ctx.rotate(-Math.PI/2); ctx.fillText(tY,0,0); ctx.restore();
  // grafik XLength(θ) dan YLength(θ)
  _ttlGaris(ctx,gx0,gy0,gx1,gy0,'rgba(148,163,184,.6)',1); _ttlGaris(ctx,gx0,gy0,gx0,gy1,'rgba(148,163,184,.6)',1);
  const kurva=(f,warna)=>{ctx.strokeStyle=warna; ctx.lineWidth=1.8; ctx.beginPath(); for(let i=0;i<=90;i++){const q=i*Math.PI/180, v=f(q); const px=gx0+(gx1-gx0)*i/90, py=gy0-(gy0-gy1)*v/maks*0.92; i?ctx.lineTo(px,py):ctx.moveTo(px,py);} ctx.stroke();};
  kurva(q=>a*Math.cos(q)+b*Math.sin(q),'#22d3ee'); kurva(q=>a*Math.sin(q)+b*Math.cos(q),'#a855f7');
  const px=gx0+(gx1-gx0)*th/90, py=gy0-(gy0-gy1)*XL/maks*0.92;
  ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2); ctx.fill();
  _ttlGaris(ctx,px,py,px,gy0,'rgba(245,158,11,.5)',1,[3,3]);
  ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('θ (°): 0 → 90',(gx0+gx1)/2,gy0+14);
  ctx.textAlign='left';
  const leg=['XLength = a·cosθ + b·sinθ','YLength = a·sinθ + b·cosθ'];
  if(!sempit){
    // legenda digeser ke kanan judul bila keduanya bertemu (tablet); baris "maks" hanya digeser ke kiri bila keluar tepi kanan
    ctx.font=_F6(11); const lJ=ctx.measureText(judul.join(' ')).width; ctx.font=_F6(10);
    const lx=Math.max(gx0,Math.min(12+lJ+14,W-12-ctx.measureText(leg[0]).width));
    ctx.fillStyle='#22d3ee'; ctx.fillText(leg[0],lx,18); ctx.fillStyle='#a855f7'; ctx.fillText(leg[1],lx,32);
    ctx.fillStyle='rgba(226,232,240,.9)'; ctx.fillText(tM,mx,gy0+28);
    ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillText(judul.join(' '),12,18);
  } else {
    ctx.fillStyle='#22d3ee'; _ttlTeks(ctx,leg[0],gx0,yLeg,W-24); ctx.fillStyle='#a855f7'; _ttlTeks(ctx,leg[1],gx0,yLeg+14,W-24);
    ctx.fillStyle='rgba(226,232,240,.9)'; _cad6Judul(ctx,tMaks,12,gy0+28,W-24,13);
    ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font=_F6(11); _cad6Judul(ctx,judul,12,18,W-24,14);
  }
  _ttlTulis('boundBoxInfo','θ = '+th.toFixed(1)+'°: XLength = a·cosθ + b·sinθ = '+XL.toFixed(3)+' mm, YLength = a·sinθ + b·cosθ = '+YL.toFixed(3)+' mm; kotak pembatas sejajar sumbu global membesar dari '+a+' × '+b+' menjadi '+XL.toFixed(1)+' × '+YL.toFixed(1)+' (ZLength tetap). XLength terbesar √(a² + b²) = '+maks.toFixed(2)+' mm saat tan θ = b/a.');
  if(_ttlJalan('boundbox')){_bb6Frame++; requestAnimationFrame(drawBoundBox);}
}

_TTL_DAFTAR.push(['cvKamera',()=>drawKamera(),'kamera',['sl_km_jarak','sl_km_a','sl_km_el']]);
_TTL_DAFTAR.push(['cvTigaPandangan',()=>drawTigaPandangan(),'tigapandangan',['sl_tp_a','sl_tp_H','sl_tp_hn','sl_tp_metode']]);
_TTL_DAFTAR.push(['cvPotong',()=>drawPotong(),'potong',['sl_pt_a','sl_pt_h','sl_pt_d','sl_pt_y']]);
_TTL_DAFTAR.push(['cvBoundBox',()=>drawBoundBox(),'boundbox',['sl_bb_a','sl_bb_b','sl_bb_theta']]);
_ttlMulai();
