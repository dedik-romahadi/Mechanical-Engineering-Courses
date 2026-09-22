// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 13 PEMODELAN CAD — Prinsip Desain Berkelanjutan dalam CAD
// Kanvas: cvMaterial, cvBillet, cvJejak, cvCangkang (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// Layar lebar (W >= _TTL_SEMPIT) memakai tata letak berdampingan; ponsel memakai kanvas
// lebih tinggi dengan panel bertumpuk ke bawah dan teks yang dipecah agar tidak terpotong.
// ════════════════════════════════════════════════════════════
const _C13C='#22d3ee', _C13A='#f59e0b', _C13G='#00e09e', _C13R='#ef4444', _C13V='#a855f7', _C13P='#ec4899', _C13T='rgba(226,232,240,.92)', _C13M='rgba(148,163,184,.85)';
function _cad13Teks(ctx,s,x,y,warna,font,align){ctx.fillStyle=warna; ctx.font=font||"11px 'JetBrains Mono',monospace"; ctx.textAlign=align||'left'; ctx.fillText(s,x,y);}
// Seperti _cad13Teks, tetapi dijaga muat selebar maxW (dikecilkan lalu dipecah per kata oleh
// _ttlTeks). Mengembalikan y baris berikutnya.
function _cad13Muat(ctx,s,x,y,maxW,warna,font,align,opsi){ctx.fillStyle=warna; ctx.font=font||"11px 'JetBrains Mono',monospace"; ctx.textAlign=align||'left'; return _ttlTeks(ctx,s,x,y,maxW,opsi);}
function _cad13Kotak(ctx,x,y,w,h,isi,garis,lebar){if(w<=0||h<=0) return; if(isi){ctx.fillStyle=isi; ctx.fillRect(x,y,w,h);} if(garis){ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.4; ctx.strokeRect(x,y,w,h);}}
function _cad13Panah(ctx,x1,y1,x2,y2,warna){const a=Math.atan2(y2-y1,x2-x1); _ttlGaris(ctx,x1,y1,x2,y2,warna,1.2); ctx.fillStyle=warna; ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-7*Math.cos(a)+3.5*Math.sin(a),y2-7*Math.sin(a)-3.5*Math.cos(a)); ctx.lineTo(x2-7*Math.cos(a)-3.5*Math.sin(a),y2-7*Math.sin(a)+3.5*Math.cos(a)); ctx.closePath(); ctx.fill();}
function _cad13Ind(x,d){return x.toFixed(d).replace('.',',');}
// Spasi tak terputus: _ttlTeks hanya memecah baris di spasi biasa, jadi rumus dan pasangan nilai–satuan
// yang diikat tidak terbelah saat judul dipecah di ponsel (tampilannya sama persis dengan spasi biasa).
function _cad13Ikat(s){return s.replace(/ /g,'\u00a0');}
// material: nama pendek, E (MPa), rho (g/mm3), f (kg CO2/kg), warna
const _CAD13_MAT=[['Baja',210000,7.85e-3,2.0,_C13C],['Alumin.',70000,2.70e-3,12.0,_C13A],['Titan.',110000,4.50e-3,35.0,_C13V],['Magnes.',45000,1.80e-3,20.0,_C13P],['CFRP',70000,1.60e-3,25.0,_C13G]];

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Kekakuan lentur sama: tinggi penampang naik, massa turun
// ════════════════════════════════════════════════════════════
let _mtFrame=0;
function toggleMaterial(){_ttlToggle('material','btnMaterial',drawMaterial);}
window.toggleMaterial=toggleMaterial;
function drawMaterial(){
  const k=_ttlKanvas('cvMaterial',380); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const L=_ttlNilai('sl_mt_L',700), b=_ttlNilai('sl_mt_b',60), h0=_ttlNilai('sl_mt_h',28);
  _ttlTulis('v_mt_L',L.toFixed(0)); _ttlTulis('v_mt_b',b.toFixed(0)); _ttlTulis('v_mt_h',h0.toFixed(0));
  const E0=210000;
  const data=_CAD13_MAT.map(m=>{const hi=h0*Math.pow(E0/m[1],1/3); return {nama:m[0],h:hi,m:m[2]*L*b*hi,idx:Math.pow(m[1],1/3)/(m[2]*1000),f:m[3],warna:m[4]};});
  const hMaks=Math.max.apply(null,data.map(d=>d.h)), mMaks=Math.max.apply(null,data.map(d=>d.m));
  const sorot=_ttlJalan('material')?Math.floor(_mtFrame/70)%5:0;
  const f9="9px 'JetBrains Mono',monospace", f10="10px 'JetBrains Mono',monospace";
  const judul='Lima penampang di bawah memiliki E·I yang sama persis — tingginya berbeda karena '+_cad13Ikat('h ∝ E^(−1/3)');
  const d=data[sorot];
  const ringkas=[[d.nama+': h = '+_cad13Ind(d.h,2)+' mm',d.warna],['m = ρ·L·b·h = '+_cad13Ind(d.m,0)+' g',_C13G,f10],
                 ['indeks M = E^(1/3)/ρ = '+_cad13Ind(d.idx,2),_C13A,f10],['massa relatif baja = '+_cad13Ind(100*d.m/data[0].m,1)+' %',_C13M,f10]];
  if(!sempit){
    _cad13Muat(ctx,judul,12,18,W-24,_C13T);
    // penampang b x h_i (kiri)
    const sk=Math.max(0.05,Math.min((W*0.40)/(5*(b+14)),(H*0.46)/hMaks));
    const dasar=H*0.70, x0=W*0.04;
    data.forEach((dd,i)=>{
      const wpx=Math.max(4,b*sk), hpx=Math.max(3,dd.h*sk), x=x0+i*(wpx+12*sk+6);
      const tebal=i===sorot?2.2:1.2;
      _cad13Kotak(ctx,x,dasar-hpx,wpx,hpx,i===sorot?'rgba(226,232,240,.18)':'rgba(148,163,184,.10)',dd.warna,tebal);
      _cad13Teks(ctx,dd.nama,x+wpx/2,dasar+14,i===sorot?_C13T:_C13M,f9,'center');
      _cad13Teks(ctx,'h '+_cad13Ind(dd.h,1),x+wpx/2,dasar+26,dd.warna,f9,'center');
    });
    _ttlGaris(ctx,x0-6,dasar,x0+W*0.40,dasar,'rgba(148,163,184,.45)',1.2);
    _cad13Teks(ctx,'penampang b × h_i (skala sama)',x0,dasar+42,_C13M,f10);
    // batang massa (kanan)
    const bx=W*0.50, bw=W*0.30;
    _cad13Teks(ctx,'massa balok (g) pada kekakuan sama',bx,H*0.14,_C13T,f10);
    data.forEach((dd,i)=>{
      const y=H*0.22+i*22;
      const lb=Math.max(2,bw*dd.m/mMaks);
      _cad13Kotak(ctx,bx,y,lb,14,i===sorot?'rgba(226,232,240,.20)':'rgba(148,163,184,.10)',dd.warna,i===sorot?2:1.2);
      _cad13Teks(ctx,_cad13Ind(dd.m,0)+' g',bx+lb+6,y+11,i===sorot?_C13T:_C13M,f10);
    });
    // kolom kanan: indeks material
    const tx=W*0.50;
    ringkas.forEach(([s,w,f],i)=>_cad13Teks(ctx,s,tx,H*0.70+18*i,w,f));
  } else {
    // Ponsel: judul dipecah; lima penampang dalam lima kolom selebar kanvas; batang massa dan
    // ringkasan material yang disorot bertumpuk di bawahnya.
    let y=_cad13Muat(ctx,judul,12,18,W-24,_C13T);
    const m=8, kol=(W-2*m)/5, hPen=64;
    const sk=Math.max(0.05,Math.min((kol-8)/b,hPen/hMaks));
    const dasar=y+4+hPen;
    data.forEach((dd,i)=>{
      const wpx=Math.max(4,b*sk), hpx=Math.max(3,dd.h*sk), xc=m+kol*(i+0.5);
      _cad13Kotak(ctx,xc-wpx/2,dasar-hpx,wpx,hpx,i===sorot?'rgba(226,232,240,.18)':'rgba(148,163,184,.10)',dd.warna,i===sorot?2.2:1.2);
      _cad13Muat(ctx,dd.nama,xc,dasar+13,kol-3,i===sorot?_C13T:_C13M,f9,'center');
      _cad13Muat(ctx,'h '+_cad13Ind(dd.h,1),xc,dasar+25,kol-3,dd.warna,f9,'center');
    });
    _ttlGaris(ctx,m,dasar,W-m,dasar,'rgba(148,163,184,.45)',1.2);
    y=_cad13Muat(ctx,'penampang b × h_i (skala sama)',12,dasar+41,W-24,_C13M,f10);
    y=_cad13Muat(ctx,'massa balok (g) pada kekakuan sama',12,y+8,W-24,_C13T,f10);
    ctx.font=f10; const wLab=ctx.measureText(_cad13Ind(mMaks,0)+' g').width;
    const bx=12, bw=Math.max(40,W-bx-18-wLab);
    data.forEach((dd,i)=>{
      const yy=y-6+i*17, lb=Math.max(2,bw*dd.m/mMaks);
      _cad13Kotak(ctx,bx,yy,lb,12,i===sorot?'rgba(226,232,240,.20)':'rgba(148,163,184,.10)',dd.warna,i===sorot?2:1.2);
      _cad13Teks(ctx,_cad13Ind(dd.m,0)+' g',bx+lb+6,yy+10,i===sorot?_C13T:_C13M,f10);
    });
    y+=5*17+8;
    ringkas.forEach(([s,w,f])=>{y=_cad13Muat(ctx,s,12,y,W-24,w,f)+2;});
  }
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
  const k=_ttlKanvas('cvBillet',400); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const a=_ttlNilai('sl_bl_a',120), c=_ttlNilai('sl_bl_c',80), t=Math.min(_ttlNilai('sl_bl_t',25),Math.min(a,c)/2);
  const b=60;
  _ttlTulis('v_bl_a',a.toFixed(0)); _ttlTulis('v_bl_c',c.toFixed(0)); _ttlTulis('v_bl_t',t.toFixed(0));
  const p=_ttlJalan('billet')?Math.min(1,(_blFrame%220)/150):1;      // kemajuan pemesinan 0..1
  const vPart=b*(a*t+(c-t)*t), vBillet=a*b*c, U=100*vPart/vBillet;
  const f9="9px 'JetBrains Mono',monospace", f10="10px 'JetBrains Mono',monospace";
  // Judul lebih dulu: bila terpecah menjadi dua baris (tablet), gambar billet diturunkan secukupnya.
  const yT=_cad13Muat(ctx,'Billet '+_cad13Ikat('a × b × c')+' dipesin menjadi braket L '+_cad13Ikat('(kedalaman b = '+b+' mm);')+' '+_cad13Ikat('merah = bahan')+' yang menjadi serpihan',12,18,W-24,_C13T);
  // Label c ditulis rata kanan di kiri gambar. Bila 0,05·W tidak cukup untuk labelnya (≤ 800 px), gambar
  // digeser agar label berjarak 6 px dari tepi kiri; di 1000 px ruangnya cukup sehingga tidak berubah.
  ctx.font=f10; const wC=ctx.measureText('c = '+c.toFixed(0)).width;
  const ox=!sempit&&W*0.05>=wC+8?W*0.05:Math.max(sempit?12:W*0.05,wC+12);
  let sk, oy;
  if(!sempit){sk=Math.max(0.05,Math.min((W*0.46)/a,(H-80-(yT>33?yT-29:0))/c)); oy=H*0.80;}
  else {const hGb=Math.max(80,H-yT-196); sk=Math.max(0.05,Math.min((W-ox-12)/a,hGb/c)); oy=yT+6+hGb;}
  const X=v=>ox+v*sk, Y=v=>oy-v*sk;
  // billet penuh (garis putus)
  _cad13Kotak(ctx,X(0),Y(c),a*sk,c*sk,'rgba(148,163,184,.05)',null);
  ctx.setLineDash([6,4]); _cad13Kotak(ctx,X(0),Y(c),a*sk,c*sk,null,'rgba(148,163,184,.65)',1.2); ctx.setLineDash([]);
  // bahan yang belum terbuang (menyusut mengikuti p)
  const wSisa=(a-t)*sk*(1-p), hSisa=(c-t)*sk*(1-p);
  if(wSisa>1&&hSisa>1){
    _cad13Kotak(ctx,X(t),Y(c),wSisa,hSisa,'rgba(239,68,68,.20)','rgba(239,68,68,.75)',1.2);
    for(let i=0;i<14;i++){const dx=i*12; if(dx<wSisa) _ttlGaris(ctx,X(t)+dx,Y(c)+Math.min(hSisa,0),X(t)+Math.min(dx+22,wSisa),Y(c)+Math.min(22,hSisa),'rgba(239,68,68,.35)',1);}
    // label di bawah pita arsir (arsir mengisi 22 px teratas), hanya selama muat di dalam sisa bahan; arti warna
    // merah juga tertulis di judul. Dulu label di tengah sisa bahan sehingga tercoret garis arsir saat bahan menipis.
    ctx.font=f10; if(wSisa>=ctx.measureText('serpihan').width+8&&hSisa>=40) _cad13Teks(ctx,'serpihan',X(t)+wSisa/2,Y(c)+Math.max(31.5,14.6+hSisa/2),'rgba(239,68,68,.95)',f10,'center');
  }
  // profil L (produk)
  ctx.beginPath();
  ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(a),Y(0)); ctx.lineTo(X(a),Y(t)); ctx.lineTo(X(t),Y(t)); ctx.lineTo(X(t),Y(c)); ctx.lineTo(X(0),Y(c)); ctx.closePath();
  ctx.fillStyle='rgba(34,211,238,.22)'; ctx.fill(); ctx.strokeStyle=_C13C; ctx.lineWidth=1.8; ctx.stroke();
  // label t di tengah kaki; bila kaki lebih tipis dari hurufnya (ponsel, t kecil) label diletakkan tepat di atas kaki
  _cad13Teks(ctx,'t = '+t.toFixed(0),X(a/2),t*sk>=13?Y(t/2)+4:Y(t)-5,_C13C,f10,'center');
  _cad13Panah(ctx,X(0),oy+18,X(a),oy+18,_C13A); _cad13Panah(ctx,X(a),oy+18,X(0),oy+18,_C13A);
  _cad13Teks(ctx,'a = '+a.toFixed(0),X(a/2),oy+14,_C13A,f10,'center');
  _cad13Teks(ctx,'c = '+c.toFixed(0),X(0)-6,Y(c/2),_C13A,f10,'right');
  const baris=[['V_part = b·(a·t + (c − t)·t)',_C13C,undefined,0,2],['  = '+vPart.toFixed(0)+' mm³',_C13M,f10,18,2],['V_billet = a·b·c = '+vBillet.toFixed(0)+' mm³',_C13M,f10,38,6],
               ['U = 100·V_part/V_billet = '+_cad13Ikat(_cad13Ind(U,3)+' %'),U<30?_C13R:_C13G,undefined,62,2],['serpihan = '+_cad13Ind(100-U,3)+' %',_C13R,f10,82,0]];
  // kolom angka: di kanan gambar (layar lebar) atau di bawahnya (ponsel)
  let gx, gy, gw;
  if(!sempit){
    const tx=W*0.58;
    // tepat di atas batas ponsel (520–570 px) baris U terlalu lebar: dikecilkan agar muat sampai tepi kanan
    baris.forEach(([s,w,f,dy])=>_cad13Muat(ctx,s,tx,H*0.24+dy,W-tx-8,w,f));
    gx=tx; gy=H*0.24+100; gw=W-16-tx;
  } else {
    let y=oy+42;
    baris.forEach(([s,w,f,,sela])=>{y=_cad13Muat(ctx,s,12,y,W-24,w,f)+sela;});
    gx=12; gy=y-4; gw=W-24;
  }
  // batang U vs serpihan
  _cad13Kotak(ctx,gx,gy,gw*U/100,14,'rgba(0,224,158,.30)',_C13G,1.2);
  _cad13Kotak(ctx,gx+gw*U/100,gy,gw*(100-U)/100,14,'rgba(239,68,68,.25)',_C13R,1.2);
  _cad13Teks(ctx,'produk',gx+2,gy+26,_C13G,f9);
  _cad13Teks(ctx,'serpihan',gx+gw,gy+26,_C13R,f9,'right');
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
  const k=_ttlKanvas('cvJejak',400); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const vS=_ttlNilai('sl_jj_v',600), fSt=_ttlNilai('sl_jj_fst',2), fAl=_ttlNilai('sl_jj_fal',12);
  _ttlTulis('v_jj_v',vS.toFixed(0)); _ttlTulis('v_jj_fst',_cad13Ind(fSt,1)); _ttlTulis('v_jj_fal',_cad13Ind(fAl,1));
  const vMaks=2000, fAlR=1.2;
  const V=_ttlJalan('jejak')?100+(vMaks-100)*(0.5+0.5*Math.sin(_jjFrame/70)):vS;   // cm³
  const co2=(f,rho)=>f*rho*V/1000;                                                  // rho g/cm³ → kg
  const cSt=co2(fSt,7.85), cAl=co2(fAl,2.70), cAlR=co2(fAlR,2.70);
  const yMaks=Math.max(fSt*7.85,fAl*2.70)*vMaks/1000*1.08;
  const f9="9px 'JetBrains Mono',monospace", f10="10px 'JetBrains Mono',monospace";
  const yT=_cad13Muat(ctx,'Jejak '+_cad13Ikat('CO₂ = f × ρ × V')+' pada volume yang sama — bandingkan tinggi ketiga garis',12,18,W-24,_C13T);
  // Ponsel: grafik selebar kanvas di bawah judul; legenda dan kolom angka dipindah ke bawah grafik.
  const gx=sempit?16:W*0.08, gy=sempit?H-200:H-42, gw=sempit?W-32:W*0.52, gh=sempit?gy-yT-4:H-78;
  _ttlGaris(ctx,gx,gy,gx+gw,gy,'rgba(148,163,184,.55)',1.2); _ttlGaris(ctx,gx,gy,gx,gy-gh,'rgba(148,163,184,.55)',1.2);
  _cad13Teks(ctx,'V (cm³)',gx+gw,gy+16,_C13M,f9,'right');
  _cad13Teks(ctx,'kg CO₂',gx+4,gy-gh+10,_C13M,f9);
  const garis=(f,rho,warna,lebar)=>{ctx.strokeStyle=warna; ctx.lineWidth=lebar||1.6; ctx.beginPath(); for(let i=0;i<=40;i++){const vv=i/40*vMaks, yy=gy-Math.min(gh,f*rho*vv/1000/yMaks*gh); const xx=gx+i/40*gw; i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);} ctx.stroke();};
  garis(fAl,2.70,_C13A); garis(fSt,7.85,_C13C); garis(fAlR,2.70,_C13G);
  const px=gx+V/vMaks*gw;
  // penanda V: garis putus dari sumbu sampai 8 px di atas titik tertinggi (dulu setinggi grafik dan mencoret
  // legenda serta label sumbu kg CO₂ saat V kecil)
  const titik=[[cAl,_C13A],[cSt,_C13C],[cAlR,_C13G]].map(([c,w])=>[gy-Math.min(gh,c/yMaks*gh),w]);
  _ttlGaris(ctx,px,gy,px,Math.min(...titik.map(q=>q[0]))-8,'rgba(226,232,240,.25)',1,[4,4]);
  titik.forEach(([py,w])=>{ctx.fillStyle=w; ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2); ctx.fill();});
  const legenda=[['Aluminium primer f = '+_cad13Ind(fAl,1),_C13A],['Baja f = '+_cad13Ind(fSt,1),_C13C],['Aluminium daur ulang f = '+_cad13Ind(fAlR,1),_C13G]];
  const baris=[['V = '+V.toFixed(0)+' cm³ = '+(V*1000).toFixed(0)+' mm³',_C13T,f10,0,4],
               ['baja: m = '+_cad13Ind(7.85*V/1000,3)+' kg → '+_cad13Ind(cSt,3)+' kg CO₂',_C13C,f10,22,2],
               ['Al primer: m = '+_cad13Ind(2.70*V/1000,3)+' kg → '+_cad13Ind(cAl,3)+' kg',_C13A,f10,42,2],
               ['Al daur ulang → '+_cad13Ind(cAlR,3)+' kg CO₂',_C13G,f10,62,6],
               ['rasio Al primer / baja = '+_cad13Ind(cAl/Math.max(cSt,1e-9),2)+'×',cAl>cSt?_C13R:_C13G,f10,88,2],
               ['pada volume sama, bukan fungsi sama',_C13M,f9,108,2],
               ['(kekakuan sama: lihat Animasi 1)',_C13M,f9,124,0]];
  if(!sempit){
    legenda.forEach(([s,w],i)=>_cad13Teks(ctx,s,gx+6,gy-gh+26+16*i,w,f10));
    // kolom kanan: di tablet (570 px) digeser ke kiri sampai 14 px dari grafik agar baris terpanjang
    // (35 karakter 10 px) nyaris tanpa pengecilan; desktop tetap di 0,66·W
    ctx.font=f10; const tx=Math.max(gx+gw+14,Math.min(W*0.66,W-8-ctx.measureText('Al primer: m = 5,400 kg → 86,400 kg').width));
    baris.forEach(([s,w,f,dy])=>_cad13Muat(ctx,s,tx,H*0.22+dy,W-tx-8,w,f));
  } else {
    let y=gy+32;
    legenda.forEach(([s,w])=>{y=_cad13Muat(ctx,s,12,y,W-24,w,f10);});
    y+=8;
    baris.forEach(([s,w,f,,sela])=>{y=_cad13Muat(ctx,s,12,y,W-24,w,f)+sela;});
  }
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
  const k=_ttlKanvas('cvCangkang',400); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const a=_ttlNilai('sl_cg_a',160), h=_ttlNilai('sl_cg_h',80), tS=_ttlNilai('sl_cg_t',5), b=120;
  _ttlTulis('v_cg_a',a.toFixed(0)); _ttlTulis('v_cg_h',h.toFixed(0)); _ttlTulis('v_cg_t',_cad13Ind(tS,1));
  const tMin=2, tMaks=12;
  const t=Math.min(Math.min(a,b)/2-0.5,_ttlJalan('cangkang')?tMin+(tMaks-tMin)*(0.5+0.5*Math.sin(_cgFrame/60)):tS);
  const vol=tt=>a*b*h-(a-2*tt)*(b-2*tt)*(h-tt);
  const vSolid=a*b*h, vShell=vol(t);
  const mSolid=7.85e-3*vSolid, mShell=7.85e-3*vShell, hemat=100*(1-vShell/vSolid);
  const f9="9px 'JetBrains Mono',monospace", f10="10px 'JetBrains Mono',monospace";
  const yT=_cad13Muat(ctx,'Penampang housing '+_cad13Ikat('a × h')+' '+_cad13Ikat('(kedalaman b = '+b+' mm):')+' Thickness t, muka atas dibuang',12,18,W-24,_C13T);
  // Layar lebar: dasar penampang di H − 40 (bukan 0,76·H) supaya label "muka atas dibuang" di atas
  // garis putus tidak menimpa judul saat penampang setinggi-tingginya. Ponsel: penampang di bawah judul.
  let sk, ox, oy;
  if(!sempit){sk=Math.max(0.05,Math.min((W*0.42)/a,(H-90)/h)); ox=W*0.05; oy=H-40;}
  else {const hGb=110; sk=Math.max(0.05,Math.min((W-24)/a,hGb/h)); ox=12; oy=yT+14+hGb;}
  const X=v=>ox+v*sk, Y=v=>oy-v*sk;
  ctx.setLineDash([5,4]); _cad13Kotak(ctx,X(0),Y(h),a*sk,h*sk,null,'rgba(148,163,184,.5)',1.1); ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(X(0),Y(h)); ctx.lineTo(X(t),Y(h)); ctx.lineTo(X(t),Y(t)); ctx.lineTo(X(a-t),Y(t)); ctx.lineTo(X(a-t),Y(h)); ctx.lineTo(X(a),Y(h)); ctx.lineTo(X(a),Y(0)); ctx.lineTo(X(0),Y(0)); ctx.closePath();
  ctx.fillStyle='rgba(0,224,158,.22)'; ctx.fill(); ctx.strokeStyle=_C13G; ctx.lineWidth=1.8; ctx.stroke();
  _cad13Panah(ctx,X(t),Y(h)+16,X(0),Y(h)+16,_C13A);
  _cad13Teks(ctx,'t = '+_cad13Ind(t,1)+' mm',X(t)+8,Y(h)+20,_C13A,sempit?f9:f10);
  _cad13Teks(ctx,'muka atas dibuang',X(a/2),Y(h)-8,_C13M,f10,'center');
  _cad13Panah(ctx,X(0),oy+22,X(a),oy+22,_C13A); _cad13Panah(ctx,X(a),oy+22,X(0),oy+22,_C13A);
  _cad13Teks(ctx,'a = '+a.toFixed(0),X(a/2),oy+18,_C13A,f10,'center');
  const baris=[['V_pejal = '+vSolid.toFixed(0)+' mm³ → '+mSolid.toFixed(0)+' g',_C13M,0,4],['V_cangkang = '+vShell.toFixed(0)+' mm³',_C13C,18,6],
               ['massa = '+_cad13Ind(mShell,2)+' g (hemat '+_cad13Ind(hemat,1)+' %)',_C13G,38,0]];
  // kurva massa terhadap tebal dinding (kanan bawah; di ponsel di bawah baris angka)
  let gx, gy, gw, gh;
  if(!sempit){
    gx=W*0.56; gy=H-34; gw=W*0.40; gh=H*0.46;
    baris.forEach(([s,w,dy])=>_cad13Muat(ctx,s,gx,H*0.16+dy,W-gx-8,w,f10));
  } else {
    let y=oy+44;
    baris.forEach(([s,w,,sela])=>{y=_cad13Muat(ctx,s,12,y,W-24,w,f10)+sela;});
    gx=16; gy=H-22; gw=W-32; gh=gy-y-4;
  }
  const mMaks=7.85e-3*vol(tMaks);
  _ttlGaris(ctx,gx,gy,gx+gw,gy,'rgba(148,163,184,.55)',1.2); _ttlGaris(ctx,gx,gy,gx,gy-gh,'rgba(148,163,184,.55)',1.2);
  ctx.strokeStyle=_C13G; ctx.lineWidth=1.6; ctx.beginPath();
  for(let i=0;i<=40;i++){const tt=tMin+(tMaks-tMin)*i/40; const xx=gx+i/40*gw, yy=gy-Math.min(gh,7.85e-3*vol(tt)/mMaks*gh); i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}
  ctx.stroke();
  const px=gx+Math.max(0,Math.min(1,(t-tMin)/(tMaks-tMin)))*gw, py=gy-Math.min(gh,mShell/mMaks*gh);
  ctx.fillStyle=_C13A; ctx.beginPath(); ctx.arc(px,py,4.5,0,Math.PI*2); ctx.fill();
  _cad13Teks(ctx,'m (g)',gx+4,gy-gh+10,_C13M,f9);
  _cad13Teks(ctx,'t = '+tMin,gx,gy+14,_C13M,f9);
  _cad13Teks(ctx,'t = '+tMaks+' mm',gx+gw,gy+14,_C13M,f9,'right');
  _ttlTulis('cangkangInfo','t = '+_cad13Ind(t,1)+' mm: V_cangkang = a·b·h − (a − 2t)(b − 2t)(h − t) = '+vShell.toFixed(0)+' mm³, massa '+_cad13Ind(mShell,2)+' g dari '+mSolid.toFixed(0)+' g pejal (hemat '+_cad13Ind(hemat,1)+' %). Perhatikan kurva yang melandai: menipiskan dinding di bawah batas proses menambah risiko cacat jauh lebih cepat daripada menghemat massa.');
  if(_ttlJalan('cangkang')){_cgFrame++; requestAnimationFrame(drawCangkang);}
}

_TTL_DAFTAR.push(['cvMaterial',()=>drawMaterial(),'material',['sl_mt_L','sl_mt_b','sl_mt_h']]);
_TTL_DAFTAR.push(['cvBillet',()=>drawBillet(),'billet',['sl_bl_a','sl_bl_c','sl_bl_t']]);
_TTL_DAFTAR.push(['cvJejak',()=>drawJejak(),'jejak',['sl_jj_v','sl_jj_fst','sl_jj_fal']]);
_TTL_DAFTAR.push(['cvCangkang',()=>drawCangkang(),'cangkang',['sl_cg_a','sl_cg_h','sl_cg_t']]);
_ttlMulai();
