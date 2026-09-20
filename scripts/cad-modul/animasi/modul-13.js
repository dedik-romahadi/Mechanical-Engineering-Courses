// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 13 PEMODELAN CAD — Prinsip Desain Berkelanjutan dalam CAD
// Kanvas: cvMaterial, cvBillet, cvJejak, cvCangkang (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// ════════════════════════════════════════════════════════════
const _C13C='#22d3ee', _C13A='#f59e0b', _C13G='#00e09e', _C13R='#ef4444', _C13V='#a855f7', _C13P='#ec4899', _C13T='rgba(226,232,240,.92)', _C13M='rgba(148,163,184,.85)';
function _cad13Teks(ctx,s,x,y,warna,font,align){ctx.fillStyle=warna; ctx.font=font||"11px 'JetBrains Mono',monospace"; ctx.textAlign=align||'left'; ctx.fillText(s,x,y);}
function _cad13Kotak(ctx,x,y,w,h,isi,garis,lebar){if(w<=0||h<=0) return; if(isi){ctx.fillStyle=isi; ctx.fillRect(x,y,w,h);} if(garis){ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.4; ctx.strokeRect(x,y,w,h);}}
function _cad13Panah(ctx,x1,y1,x2,y2,warna){const a=Math.atan2(y2-y1,x2-x1); _ttlGaris(ctx,x1,y1,x2,y2,warna,1.2); ctx.fillStyle=warna; ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-7*Math.cos(a)+3.5*Math.sin(a),y2-7*Math.sin(a)-3.5*Math.cos(a)); ctx.lineTo(x2-7*Math.cos(a)-3.5*Math.sin(a),y2-7*Math.sin(a)+3.5*Math.cos(a)); ctx.closePath(); ctx.fill();}
function _cad13Ind(x,d){return x.toFixed(d).replace('.',',');}
// material: nama pendek, E (MPa), rho (g/mm3), f (kg CO2/kg), warna
const _CAD13_MAT=[['Baja',210000,7.85e-3,2.0,_C13C],['Alumin.',70000,2.70e-3,12.0,_C13A],['Titan.',110000,4.50e-3,35.0,_C13V],['Magnes.',45000,1.80e-3,20.0,_C13P],['CFRP',70000,1.60e-3,25.0,_C13G]];

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Kekakuan lentur sama: tinggi penampang naik, massa turun
// ════════════════════════════════════════════════════════════
let _mtFrame=0;
function toggleMaterial(){_ttlToggle('material','btnMaterial',drawMaterial);}
window.toggleMaterial=toggleMaterial;
function drawMaterial(){
  const k=_ttlKanvas('cvMaterial'); if(!k) return; const {ctx,W,H}=k;
  const L=_ttlNilai('sl_mt_L',700), b=_ttlNilai('sl_mt_b',60), h0=_ttlNilai('sl_mt_h',28);
  _ttlTulis('v_mt_L',L.toFixed(0)); _ttlTulis('v_mt_b',b.toFixed(0)); _ttlTulis('v_mt_h',h0.toFixed(0));
  const E0=210000;
  const data=_CAD13_MAT.map(m=>{const hi=h0*Math.pow(E0/m[1],1/3); return {nama:m[0],h:hi,m:m[2]*L*b*hi,idx:Math.pow(m[1],1/3)/(m[2]*1000),f:m[3],warna:m[4]};});
  const hMaks=Math.max.apply(null,data.map(d=>d.h)), mMaks=Math.max.apply(null,data.map(d=>d.m));
  const sorot=_ttlJalan('material')?Math.floor(_mtFrame/70)%5:0;
  _cad13Teks(ctx,'Lima penampang di bawah memiliki E·I yang sama persis — tingginya berbeda karena h ∝ E^(−1/3)',12,18,_C13T);
  // penampang b x h_i (kiri)
  const sk=Math.max(0.05,Math.min((W*0.40)/(5*(b+14)),(H*0.46)/hMaks));
  const dasar=H*0.70, x0=W*0.04;
  data.forEach((d,i)=>{
    const wpx=Math.max(4,b*sk), hpx=Math.max(3,d.h*sk), x=x0+i*(wpx+12*sk+6);
    const tebal=i===sorot?2.2:1.2;
    _cad13Kotak(ctx,x,dasar-hpx,wpx,hpx,i===sorot?'rgba(226,232,240,.18)':'rgba(148,163,184,.10)',d.warna,tebal);
    _cad13Teks(ctx,d.nama,x+wpx/2,dasar+14,i===sorot?_C13T:_C13M,"9px 'JetBrains Mono',monospace",'center');
    _cad13Teks(ctx,'h '+_cad13Ind(d.h,1),x+wpx/2,dasar+26,d.warna,"9px 'JetBrains Mono',monospace",'center');
  });
  _ttlGaris(ctx,x0-6,dasar,x0+W*0.40,dasar,'rgba(148,163,184,.45)',1.2);
  _cad13Teks(ctx,'penampang b × h_i (skala sama)',x0,dasar+42,_C13M,"10px 'JetBrains Mono',monospace");
  // batang massa (kanan)
  const bx=W*0.50, bw=W*0.30;
  _cad13Teks(ctx,'massa balok (g) pada kekakuan sama',bx,H*0.14,_C13T,"10px 'JetBrains Mono',monospace");
  data.forEach((d,i)=>{
    const y=H*0.22+i*22;
    const lb=Math.max(2,bw*d.m/mMaks);
    _cad13Kotak(ctx,bx,y,lb,14,i===sorot?'rgba(226,232,240,.20)':'rgba(148,163,184,.10)',d.warna,i===sorot?2:1.2);
    _cad13Teks(ctx,_cad13Ind(d.m,0)+' g',bx+lb+6,y+11,i===sorot?_C13T:_C13M,"10px 'JetBrains Mono',monospace");
  });
  // kolom kanan: indeks material
  const tx=W*0.50;
  const d=data[sorot];
  _cad13Teks(ctx,d.nama+': h = '+_cad13Ind(d.h,2)+' mm',tx,H*0.70,d.warna);
  _cad13Teks(ctx,'m = ρ·L·b·h = '+_cad13Ind(d.m,0)+' g',tx,H*0.70+18,_C13G,"10px 'JetBrains Mono',monospace");
  _cad13Teks(ctx,'indeks M = E^(1/3)/ρ = '+_cad13Ind(d.idx,2),tx,H*0.70+36,_C13A,"10px 'JetBrains Mono',monospace");
  _cad13Teks(ctx,'massa relatif baja = '+_cad13Ind(100*d.m/data[0].m,1)+' %',tx,H*0.70+54,_C13M,"10px 'JetBrains Mono',monospace");
  _ttlTulis('materialInfo',d.nama+': h = '+_cad13Ind(d.h,2)+' mm agar E·I sama dengan baja '+h0.toFixed(0)+' mm; massa '+_cad13Ind(d.m,0)+' g ('+_cad13Ind(100*d.m/data[0].m,1)+' % massa baja) dengan indeks E^(1/3)/ρ = '+_cad13Ind(d.idx,2)+'. Jejak karbonnya masih harus dikalikan faktor emisi f = '+_cad13Ind(d.f,1)+' kg CO₂/kg — massa terkecil belum tentu jejak terkecil.');
  if(_ttlJalan('material')){_mtFrame++; requestAnimationFrame(drawMaterial);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Billet menjadi braket L: serpihan dan pemanfaatan material U
// ════════════════════════════════════════════════════════════
let _blFrame=0;
function toggleBillet(){_ttlToggle('billet','btnBillet',drawBillet);}
window.toggleBillet=toggleBillet;
function drawBillet(){
  const k=_ttlKanvas('cvBillet'); if(!k) return; const {ctx,W,H}=k;
  const a=_ttlNilai('sl_bl_a',120), c=_ttlNilai('sl_bl_c',80), t=Math.min(_ttlNilai('sl_bl_t',25),Math.min(a,c)/2);
  const b=60;
  _ttlTulis('v_bl_a',a.toFixed(0)); _ttlTulis('v_bl_c',c.toFixed(0)); _ttlTulis('v_bl_t',t.toFixed(0));
  const p=_ttlJalan('billet')?Math.min(1,(_blFrame%220)/150):1;      // kemajuan pemesinan 0..1
  const vPart=b*(a*t+(c-t)*t), vBillet=a*b*c, U=100*vPart/vBillet;
  const sk=Math.max(0.05,Math.min((W*0.46)/a,(H-80)/c));
  const ox=W*0.05, oy=H*0.80;
  const X=v=>ox+v*sk, Y=v=>oy-v*sk;
  // billet penuh (garis putus)
  _cad13Kotak(ctx,X(0),Y(c),a*sk,c*sk,'rgba(148,163,184,.05)',null);
  ctx.setLineDash([6,4]); _cad13Kotak(ctx,X(0),Y(c),a*sk,c*sk,null,'rgba(148,163,184,.65)',1.2); ctx.setLineDash([]);
  // bahan yang belum terbuang (menyusut mengikuti p)
  const xs=X(t)+(X(a)-X(t))*0, ys=Y(c);
  const wSisa=(a-t)*sk*(1-p), hSisa=(c-t)*sk*(1-p);
  if(wSisa>1&&hSisa>1){
    _cad13Kotak(ctx,X(t),Y(c),wSisa,hSisa,'rgba(239,68,68,.20)','rgba(239,68,68,.75)',1.2);
    for(let i=0;i<14;i++){const dx=i*12; if(dx<wSisa) _ttlGaris(ctx,X(t)+dx,Y(c)+Math.min(hSisa,0),X(t)+Math.min(dx+22,wSisa),Y(c)+Math.min(22,hSisa),'rgba(239,68,68,.35)',1);}
    _cad13Teks(ctx,'serpihan',X(t)+wSisa/2,Y(c)+hSisa/2,'rgba(239,68,68,.95)',"10px 'JetBrains Mono',monospace",'center');
  }
  // profil L (produk)
  ctx.beginPath();
  ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(a),Y(0)); ctx.lineTo(X(a),Y(t)); ctx.lineTo(X(t),Y(t)); ctx.lineTo(X(t),Y(c)); ctx.lineTo(X(0),Y(c)); ctx.closePath();
  ctx.fillStyle='rgba(34,211,238,.22)'; ctx.fill(); ctx.strokeStyle=_C13C; ctx.lineWidth=1.8; ctx.stroke();
  _cad13Teks(ctx,'t = '+t.toFixed(0),X(a/2),Y(t/2)+4,_C13C,"10px 'JetBrains Mono',monospace",'center');
  _cad13Panah(ctx,X(0),oy+18,X(a),oy+18,_C13A); _cad13Panah(ctx,X(a),oy+18,X(0),oy+18,_C13A);
  _cad13Teks(ctx,'a = '+a.toFixed(0),X(a/2),oy+14,_C13A,"10px 'JetBrains Mono',monospace",'center');
  _cad13Teks(ctx,'c = '+c.toFixed(0),X(0)-6,Y(c/2),_C13A,"10px 'JetBrains Mono',monospace",'right');
  _cad13Teks(ctx,'Billet a × b × c dipesin menjadi braket L (kedalaman b = '+b+' mm); merah = bahan yang menjadi serpihan',12,18,_C13T);
  // kolom kanan
  const tx=W*0.58;
  _cad13Teks(ctx,'V_part = b·(a·t + (c − t)·t)',tx,H*0.24,_C13C);
  _cad13Teks(ctx,'  = '+vPart.toFixed(0)+' mm³',tx,H*0.24+18,_C13M,"10px 'JetBrains Mono',monospace");
  _cad13Teks(ctx,'V_billet = a·b·c = '+vBillet.toFixed(0)+' mm³',tx,H*0.24+38,_C13M,"10px 'JetBrains Mono',monospace");
  _cad13Teks(ctx,'U = 100·V_part/V_billet = '+_cad13Ind(U,3)+' %',tx,H*0.24+62,U<30?_C13R:_C13G);
  _cad13Teks(ctx,'serpihan = '+_cad13Ind(100-U,3)+' %',tx,H*0.24+82,_C13R,"10px 'JetBrains Mono',monospace");
  // batang U vs serpihan
  const gx=tx, gy=H*0.24+100, gw=W-16-tx;
  _cad13Kotak(ctx,gx,gy,gw*U/100,14,'rgba(0,224,158,.30)',_C13G,1.2);
  _cad13Kotak(ctx,gx+gw*U/100,gy,gw*(100-U)/100,14,'rgba(239,68,68,.25)',_C13R,1.2);
  _cad13Teks(ctx,'produk',gx+2,gy+26,_C13G,"9px 'JetBrains Mono',monospace");
  _cad13Teks(ctx,'serpihan',gx+gw,gy+26,_C13R,"9px 'JetBrains Mono',monospace",'right');
  _ttlTulis('billetInfo','a = '+a.toFixed(0)+', c = '+c.toFixed(0)+', t = '+t.toFixed(0)+' mm: V_part = '+vPart.toFixed(0)+' mm³ dari V_billet = '+vBillet.toFixed(0)+' mm³, sehingga U = '+_cad13Ind(U,3)+' % dan serpihan '+_cad13Ind(100-U,3)+' %. Menipiskan kaki t memang meringankan produk, tetapi menurunkan U — energi terkandung serpihan tetap dibayar.');
  if(_ttlJalan('billet')){_blFrame++; requestAnimationFrame(drawBillet);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Jejak CO₂ dua material terhadap volume komponen
// ════════════════════════════════════════════════════════════
let _jjFrame=0;
function toggleJejak(){_ttlToggle('jejak','btnJejak',drawJejak);}
window.toggleJejak=toggleJejak;
function drawJejak(){
  const k=_ttlKanvas('cvJejak'); if(!k) return; const {ctx,W,H}=k;
  const vS=_ttlNilai('sl_jj_v',600), fSt=_ttlNilai('sl_jj_fst',2), fAl=_ttlNilai('sl_jj_fal',12);
  _ttlTulis('v_jj_v',vS.toFixed(0)); _ttlTulis('v_jj_fst',_cad13Ind(fSt,1)); _ttlTulis('v_jj_fal',_cad13Ind(fAl,1));
  const vMaks=2000, fAlR=1.2;
  const V=_ttlJalan('jejak')?100+(vMaks-100)*(0.5+0.5*Math.sin(_jjFrame/70)):vS;   // cm³
  const co2=(f,rho)=>f*rho*V/1000;                                                  // rho g/cm³ → kg
  const cSt=co2(fSt,7.85), cAl=co2(fAl,2.70), cAlR=co2(fAlR,2.70);
  const maks=Math.max(co2(fSt,7.85*vMaks/V||1),0);
  const yMaks=Math.max(fSt*7.85,fAl*2.70)*vMaks/1000*1.08;
  const gx=W*0.08, gy=H-42, gw=W*0.52, gh=H-78;
  _ttlGaris(ctx,gx,gy,gx+gw,gy,'rgba(148,163,184,.55)',1.2); _ttlGaris(ctx,gx,gy,gx,gy-gh,'rgba(148,163,184,.55)',1.2);
  _cad13Teks(ctx,'V (cm³)',gx+gw,gy+16,_C13M,"9px 'JetBrains Mono',monospace",'right');
  _cad13Teks(ctx,'kg CO₂',gx+4,gy-gh+10,_C13M,"9px 'JetBrains Mono',monospace");
  const garis=(f,rho,warna,lebar)=>{ctx.strokeStyle=warna; ctx.lineWidth=lebar||1.6; ctx.beginPath(); for(let i=0;i<=40;i++){const vv=i/40*vMaks, yy=gy-Math.min(gh,f*rho*vv/1000/yMaks*gh); const xx=gx+i/40*gw; i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);} ctx.stroke();};
  garis(fAl,2.70,_C13A); garis(fSt,7.85,_C13C); garis(fAlR,2.70,_C13G);
  const px=gx+V/vMaks*gw;
  _ttlGaris(ctx,px,gy,px,gy-gh,'rgba(226,232,240,.25)',1,[4,4]);
  [[cAl,_C13A],[cSt,_C13C],[cAlR,_C13G]].forEach(([c,w])=>{const py=gy-Math.min(gh,c/yMaks*gh); ctx.fillStyle=w; ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2); ctx.fill();});
  _cad13Teks(ctx,'Aluminium primer f = '+_cad13Ind(fAl,1),gx+6,gy-gh+26,_C13A,"10px 'JetBrains Mono',monospace");
  _cad13Teks(ctx,'Baja f = '+_cad13Ind(fSt,1),gx+6,gy-gh+42,_C13C,"10px 'JetBrains Mono',monospace");
  _cad13Teks(ctx,'Aluminium daur ulang f = '+_cad13Ind(fAlR,1),gx+6,gy-gh+58,_C13G,"10px 'JetBrains Mono',monospace");
  _cad13Teks(ctx,'Jejak CO₂ = f × ρ × V pada volume yang sama — bandingkan tinggi ketiga garis',12,18,_C13T);
  const tx=W*0.66;
  _cad13Teks(ctx,'V = '+V.toFixed(0)+' cm³ = '+(V*1000).toFixed(0)+' mm³',tx,H*0.22,_C13T,"10px 'JetBrains Mono',monospace");
  _cad13Teks(ctx,'baja: m = '+_cad13Ind(7.85*V/1000,3)+' kg → '+_cad13Ind(cSt,3)+' kg CO₂',tx,H*0.22+22,_C13C,"10px 'JetBrains Mono',monospace");
  _cad13Teks(ctx,'Al primer: m = '+_cad13Ind(2.70*V/1000,3)+' kg → '+_cad13Ind(cAl,3)+' kg',tx,H*0.22+42,_C13A,"10px 'JetBrains Mono',monospace");
  _cad13Teks(ctx,'Al daur ulang → '+_cad13Ind(cAlR,3)+' kg CO₂',tx,H*0.22+62,_C13G,"10px 'JetBrains Mono',monospace");
  _cad13Teks(ctx,'rasio Al primer / baja = '+_cad13Ind(cAl/Math.max(cSt,1e-9),2)+'×',tx,H*0.22+88,cAl>cSt?_C13R:_C13G,"10px 'JetBrains Mono',monospace");
  _cad13Teks(ctx,'pada volume sama, bukan fungsi sama',tx,H*0.22+108,_C13M,"9px 'JetBrains Mono',monospace");
  _cad13Teks(ctx,'(kekakuan sama: lihat Animasi 1)',tx,H*0.22+124,_C13M,"9px 'JetBrains Mono',monospace");
  _ttlTulis('jejakInfo','V = '+V.toFixed(0)+' cm³: baja '+_cad13Ind(cSt,3)+' kg CO₂, aluminium primer '+_cad13Ind(cAl,3)+' kg ('+_cad13Ind(cAl/Math.max(cSt,1e-9),2)+'× baja), aluminium daur ulang '+_cad13Ind(cAlR,3)+' kg. Perbandingan ini pada volume sama; untuk keputusan desain, samakan dahulu fungsinya (kekakuan atau kekuatan) lalu kalikan faktor emisi.');
  if(_ttlJalan('jejak')){_jjFrame++; requestAnimationFrame(drawJejak);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Cangkang Thickness: massa terhadap tebal dinding
// ════════════════════════════════════════════════════════════
let _cgFrame=0;
function toggleCangkang(){_ttlToggle('cangkang','btnCangkang',drawCangkang);}
window.toggleCangkang=toggleCangkang;
function drawCangkang(){
  const k=_ttlKanvas('cvCangkang'); if(!k) return; const {ctx,W,H}=k;
  const a=_ttlNilai('sl_cg_a',160), h=_ttlNilai('sl_cg_h',80), tS=_ttlNilai('sl_cg_t',5), b=120;
  _ttlTulis('v_cg_a',a.toFixed(0)); _ttlTulis('v_cg_h',h.toFixed(0)); _ttlTulis('v_cg_t',_cad13Ind(tS,1));
  const tMin=2, tMaks=12;
  const t=Math.min(Math.min(a,b)/2-0.5,_ttlJalan('cangkang')?tMin+(tMaks-tMin)*(0.5+0.5*Math.sin(_cgFrame/60)):tS);
  const vol=tt=>a*b*h-(a-2*tt)*(b-2*tt)*(h-tt);
  const vSolid=a*b*h, vShell=vol(t);
  const mSolid=7.85e-3*vSolid, mShell=7.85e-3*vShell, hemat=100*(1-vShell/vSolid);
  const sk=Math.max(0.05,Math.min((W*0.42)/a,(H-90)/h));
  const ox=W*0.05, oy=H*0.76;
  const X=v=>ox+v*sk, Y=v=>oy-v*sk;
  _cad13Teks(ctx,'Penampang housing a × h (kedalaman b = '+b+' mm): Thickness t, muka atas dibuang',12,18,_C13T);
  ctx.setLineDash([5,4]); _cad13Kotak(ctx,X(0),Y(h),a*sk,h*sk,null,'rgba(148,163,184,.5)',1.1); ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(X(0),Y(h)); ctx.lineTo(X(t),Y(h)); ctx.lineTo(X(t),Y(t)); ctx.lineTo(X(a-t),Y(t)); ctx.lineTo(X(a-t),Y(h)); ctx.lineTo(X(a),Y(h)); ctx.lineTo(X(a),Y(0)); ctx.lineTo(X(0),Y(0)); ctx.closePath();
  ctx.fillStyle='rgba(0,224,158,.22)'; ctx.fill(); ctx.strokeStyle=_C13G; ctx.lineWidth=1.8; ctx.stroke();
  _cad13Panah(ctx,X(t),Y(h)+16,X(0),Y(h)+16,_C13A);
  _cad13Teks(ctx,'t = '+_cad13Ind(t,1)+' mm',X(t)+8,Y(h)+20,_C13A,"10px 'JetBrains Mono',monospace");
  _cad13Teks(ctx,'muka atas dibuang',X(a/2),Y(h)-8,_C13M,"10px 'JetBrains Mono',monospace",'center');
  _cad13Panah(ctx,X(0),oy+22,X(a),oy+22,_C13A); _cad13Panah(ctx,X(a),oy+22,X(0),oy+22,_C13A);
  _cad13Teks(ctx,'a = '+a.toFixed(0),X(a/2),oy+18,_C13A,"10px 'JetBrains Mono',monospace",'center');
  // kurva massa terhadap tebal dinding
  const gx=W*0.56, gy=H-34, gw=W*0.40, gh=H*0.46;
  const mMaks=7.85e-3*vol(tMaks);
  _ttlGaris(ctx,gx,gy,gx+gw,gy,'rgba(148,163,184,.55)',1.2); _ttlGaris(ctx,gx,gy,gx,gy-gh,'rgba(148,163,184,.55)',1.2);
  ctx.strokeStyle=_C13G; ctx.lineWidth=1.6; ctx.beginPath();
  for(let i=0;i<=40;i++){const tt=tMin+(tMaks-tMin)*i/40; const xx=gx+i/40*gw, yy=gy-Math.min(gh,7.85e-3*vol(tt)/mMaks*gh); i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}
  ctx.stroke();
  const px=gx+Math.max(0,Math.min(1,(t-tMin)/(tMaks-tMin)))*gw, py=gy-Math.min(gh,mShell/mMaks*gh);
  ctx.fillStyle=_C13A; ctx.beginPath(); ctx.arc(px,py,4.5,0,Math.PI*2); ctx.fill();
  _cad13Teks(ctx,'m (g)',gx+4,gy-gh+10,_C13M,"9px 'JetBrains Mono',monospace");
  _cad13Teks(ctx,'t = '+tMin,gx,gy+14,_C13M,"9px 'JetBrains Mono',monospace");
  _cad13Teks(ctx,'t = '+tMaks+' mm',gx+gw,gy+14,_C13M,"9px 'JetBrains Mono',monospace",'right');
  _cad13Teks(ctx,'V_pejal = '+vSolid.toFixed(0)+' mm³ → '+mSolid.toFixed(0)+' g',gx,H*0.16,_C13M,"10px 'JetBrains Mono',monospace");
  _cad13Teks(ctx,'V_cangkang = '+vShell.toFixed(0)+' mm³',gx,H*0.16+18,_C13C,"10px 'JetBrains Mono',monospace");
  _cad13Teks(ctx,'massa = '+_cad13Ind(mShell,2)+' g (hemat '+_cad13Ind(hemat,1)+' %)',gx,H*0.16+38,_C13G,"10px 'JetBrains Mono',monospace");
  _ttlTulis('cangkangInfo','t = '+_cad13Ind(t,1)+' mm: V_cangkang = a·b·h − (a − 2t)(b − 2t)(h − t) = '+vShell.toFixed(0)+' mm³, massa '+_cad13Ind(mShell,2)+' g dari '+mSolid.toFixed(0)+' g pejal (hemat '+_cad13Ind(hemat,1)+' %). Perhatikan kurva yang melandai: menipiskan dinding di bawah batas proses menambah risiko cacat jauh lebih cepat daripada menghemat massa.');
  if(_ttlJalan('cangkang')){_cgFrame++; requestAnimationFrame(drawCangkang);}
}

_TTL_DAFTAR.push(['cvMaterial',()=>drawMaterial(),'material',['sl_mt_L','sl_mt_b','sl_mt_h']]);
_TTL_DAFTAR.push(['cvBillet',()=>drawBillet(),'billet',['sl_bl_a','sl_bl_c','sl_bl_t']]);
_TTL_DAFTAR.push(['cvJejak',()=>drawJejak(),'jejak',['sl_jj_v','sl_jj_fst','sl_jj_fal']]);
_TTL_DAFTAR.push(['cvCangkang',()=>drawCangkang(),'cangkang',['sl_cg_a','sl_cg_h','sl_cg_t']]);
_ttlMulai();
