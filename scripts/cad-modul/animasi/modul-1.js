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
// Sumbu X/Y/Z dari titik asal. batas (opsional) {x0,y0,x1,y1,hindari} menjaga label di dalam persegi itu:
// bila ujung sumbu keluar batas (zoom besar), label ditaruh di titik tempat sumbu memotong tepinya;
// hindari = [[kotak, 'bawah'|'atas'], ...] menggeser label ke bawah/atas kotak teks yang ditabraknya;
// kumpul = [] (opsional): label tidak digambar, tetapi {s, warna, x, y} dimasukkan ke larik itu.
function _cadSumbu(ctx,az,el,zoom,cx,cy,panjang,batas){
  const O=_cadProyeksi([0,0,0],az,el,zoom,cx,cy);
  [[[panjang,0,0],_CAD_X,'X'],[[0,panjang,0],_CAD_Y,'Y'],[[0,0,panjang],_CAD_Z,'Z']].forEach(([v,w,n])=>{
    const P=_cadProyeksi(v,az,el,zoom,cx,cy);
    ctx.strokeStyle=w; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(O[0],O[1]); ctx.lineTo(P[0],P[1]); ctx.stroke();
    ctx.fillStyle=w; ctx.font="bold 11px 'JetBrains Mono',monospace";
    let lx=P[0]+4, ly=P[1]-4;
    if(batas){
      const dx=P[0]-O[0], dy=P[1]-O[1]; let t=1;
      if(dx>0) t=Math.min(t,(batas.x1-O[0])/dx); else if(dx<0) t=Math.min(t,(batas.x0-O[0])/dx);
      if(dy>0) t=Math.min(t,(batas.y1-O[1])/dy); else if(dy<0) t=Math.min(t,(batas.y0-O[1])/dy);
      t=Math.max(0,t);
      const lw=ctx.measureText(n).width;
      lx=Math.max(batas.x0,Math.min(batas.x1-lw,O[0]+t*dx+4)); ly=Math.max(batas.y0+9,Math.min(batas.y1,O[1]+t*dy-4));
      (batas.hindari||[]).forEach(([[a0,b0,a1,b1],arah])=>{if(lx<a1&&lx+lw>a0&&ly-9<b1&&ly>b0) ly=arah==='bawah'?b1+10:b0-1;});
    }
    if(batas&&batas.kumpul) batas.kumpul.push({s:n,warna:w,x:lx,y:ly}); else ctx.fillText(n,lx,ly);
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
// Memecah bagian-bagian teks menjadi baris selebar maksimal maxW (font ctx saat ini): bagian digabung
// dengan pemisah sep (string, atau larik: sep[i] dipakai sebelum bagian[i]) selama masih muat.
function _cad1Pecah(ctx,bagian,sep,maxW){
  const baris=[]; let kini='';
  bagian.forEach((b,i)=>{const s=Array.isArray(sep)?sep[i]:sep; const coba=kini?kini+s+b:b; if(kini&&ctx.measureText(coba).width>maxW){baris.push(kini); kini=b;} else kini=coba;});
  if(kini) baris.push(kini);
  return baris;
}
// Menulis baris-baris mulai dari y (jarak lh); baris yang tetap kepanjangan dikecilkan/dipecah _ttlTeks.
function _cad1Baris(ctx,baris,x,y,maxW,lh){let yy=y; baris.forEach(t=>{yy=_ttlTeks(ctx,t,x,yy,maxW,{lh});}); return yy;}
// Kotak tinta teks rata ctx.textAlign di (x, y) dengan font ctx saat ini, diperlebar pad px: [x0, y0, x1, y1].
function _cad1KotakTeks(ctx,s,x,y,pad){const u=ctx.measureText(s), p=pad||0; return [x-u.actualBoundingBoxLeft-p,y-u.actualBoundingBoxAscent-p,x+u.actualBoundingBoxRight+p,y+u.actualBoundingBoxDescent+p];}
// Menaruh label rata kiri tanpa saling menimpa. label = [{s, warna, font?, calon:[[x,y],...]}] (font bawaan 10 px);
// untuk tiap label dipilih calon pertama yang, sesudah dijepit ke dalam batas [x0,y0,x1,y1], tidak mengiris kotak
// di `terpakai`; bila semua calon mengiris, dipakai calon dengan irisan tersempit. Kotak yang dipilih ditambahkan
// ke `terpakai` (jarak 2 px), jadi urutan label = urutan prioritas.
function _cad1Tata(ctx,label,terpakai,batas){
  const iris=(p,q)=>Math.max(0,Math.min(p[2],q[2])-Math.max(p[0],q[0]))*Math.max(0,Math.min(p[3],q[3])-Math.max(p[1],q[1]));
  ctx.textAlign='left';
  label.forEach(L=>{
    ctx.font=L.font||"10px 'JetBrains Mono',monospace";
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
// Kotak tinta perkiraan untuk baris-baris teks rata kiri mulai (x, y) berjarak lh (font ctx saat ini).
function _cad1Kotak(ctx,baris,x,y,lh){return [x-2,y-10,x+Math.max(...baris.map(t=>ctx.measureText(t).width))+2,y+(baris.length-1)*lh+4];}
// Memilih skala (≤ skMaks) dan pusat (cx, cy) agar semua titik 3D beserta kotak labelnya muat di dalam
// [4, W−4] × [atas, H−4], dengan pusat sedekat mungkin ke (cxMau, cyMau). item = [[x,y,z], [dx0,dy0,dx1,dy1]]:
// kotak px relatif terhadap titik terproyeksi (label berukuran tetap, tidak ikut skala).
function _cad1Muat(item,az,el,skMaks,W,H,atas,cxMau,cyMau){
  const u=item.map(([p,kt])=>[_cadProyeksi(p,az,el,1,0,0),kt]);
  const rentang=sk=>{let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; u.forEach(([[x,y],[a,b,c,d]])=>{x0=Math.min(x0,sk*x+a); y0=Math.min(y0,sk*y+b); x1=Math.max(x1,sk*x+c); y1=Math.max(y1,sk*y+d);}); return [x0,y0,x1,y1];};
  const muat=sk=>{const [x0,y0,x1,y1]=rentang(sk); return x1-x0<=W-8&&y1-y0<=H-4-atas;};
  let sk=skMaks;
  if(!muat(sk)){let lo=0.05,hi=skMaks; for(let i=0;i<30;i++){const m=(lo+hi)/2; if(muat(m)) lo=m; else hi=m;} sk=lo;}
  const [x0,y0,x1,y1]=rentang(sk);
  const jepit=(v,a,b)=>a<=b?Math.max(a,Math.min(b,v)):(a+b)/2;
  return {sk,cx:jepit(cxMau,4-x0,W-4-x1),cy:jepit(cyMau,atas-y0,H-4-y1)};
}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Navigasi pandangan 3D: azimut, elevasi, zoom
// ════════════════════════════════════════════════════════════
let _nvFrame=0;
function toggleNavigasi(){_ttlToggle('navigasi','btnNavigasi',drawNavigasi);}
window.toggleNavigasi=toggleNavigasi;
function drawNavigasi(){
  const k=_ttlKanvas('cvNavigasi',320); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const azDasar=_ttlNilai('sl_nv_az',35), el=_ttlNilai('sl_nv_el',30), zoom=_ttlNilai('sl_nv_zoom',1.2);
  const az=(azDasar+(_ttlJalan('navigasi')?_nvFrame*0.4:0))%360;
  _ttlTulis('v_nv_az',azDasar.toFixed(0)+'°'); _ttlTulis('v_nv_el',el.toFixed(0)+'°'); _ttlTulis('v_nv_zoom',zoom.toFixed(2)+'×');
  // Teks kepala (sudut pandang) dan kaki (tombol mouse): satu baris di layar lebar; di ponsel dipecah per
  // bagian, kaki rata bawah. Jumlah baris kepala dihitung dari nilai terlebar agar gambar tidak meloncat.
  const lh=sempit?13:14, maxW=W-24, fontTeks=sempit?"10px 'JetBrains Mono',monospace":"11px 'JetBrains Mono',monospace";
  ctx.font=fontTeks; ctx.textAlign='left';
  const kepala=['azimut '+az.toFixed(0)+'°','elevasi '+el.toFixed(0)+'°','zoom '+zoom.toFixed(2)+'×'];
  const kaki=['roda mouse = zoom','tombol tengah = pan','tengah + kiri = putar'];
  const bKepala=sempit?_cad1Pecah(ctx,kepala,'  ',maxW):[kepala.join('  ')];
  const bKaki=sempit?_cad1Pecah(ctx,kaki,' · ',maxW):[kaki.join(' · ')];
  const nKepala=sempit?_cad1Pecah(ctx,['azimut 359°','elevasi -80°','zoom 2.50×'],'  ',maxW).length:1;
  const yKaki=H-12-(bKaki.length-1)*lh;
  const atas=18+(nKepala-1)*lh+4, bawah=yKaki-11;
  // Label sumbu tidak boleh keluar kanvas atau menimpa teks kepala/kaki pada zoom berapa pun.
  const batas={x0:4,y0:4,x1:W-4,y1:H-4,hindari:[[_cad1Kotak(ctx,bKepala,12,18,lh),'bawah'],[_cad1Kotak(ctx,bKaki,12,yKaki,lh),'atas']]};
  const cx=W*0.5, cy=sempit?atas+(bawah-atas)*0.6:H*0.62, sk=zoom*Math.min(W,H)/150;
  // Kisi bidang XY sebagai acuan lantai
  ctx.strokeStyle='rgba(148,163,184,.14)'; ctx.lineWidth=1;
  for(let i=-3;i<=3;i++){
    const A=_cadProyeksi([i*40,-120,0],az,el,sk,cx,cy), B=_cadProyeksi([i*40,120,0],az,el,sk,cx,cy);
    const C=_cadProyeksi([-120,i*40,0],az,el,sk,cx,cy), D=_cadProyeksi([120,i*40,0],az,el,sk,cx,cy);
    ctx.beginPath(); ctx.moveTo(A[0],A[1]); ctx.lineTo(B[0],B[1]); ctx.moveTo(C[0],C[1]); ctx.lineTo(D[0],D[1]); ctx.stroke();
  }
  _cadSumbu(ctx,az,el,sk,cx,cy,70,batas);
  const {titik,rusuk}=_cadBraket(100,80,15,12);
  const P=titik.map(p=>_cadProyeksi([p[0]-50,p[1]-40,p[2]],az,el,sk,cx,cy));
  // Bidang atas diarsir tipis agar bentuknya terbaca
  ctx.fillStyle='rgba(34,211,238,.10)'; ctx.beginPath(); for(let i=6;i<12;i++){const q=P[i]; i===6?ctx.moveTo(q[0],q[1]):ctx.lineTo(q[0],q[1]);} ctx.closePath(); ctx.fill();
  rusuk.forEach(([a,b])=>_cadGarisTiga(ctx,P,a,b,'rgba(34,211,238,.95)',1.6));
  // Nama pandangan baku FreeCAD yang paling dekat
  let nama='Isometrik (0 → tekan 0)';
  if(el>75) nama='Top / atas (tekan 2)'; else if(el<-75) nama='Bottom / bawah (tekan 5)';
  else if(Math.abs(el)<12){const s=((az%360)+360)%360; nama = s<22||s>338?'Front / depan (tekan 1)': Math.abs(s-90)<22?'Right / kanan (tekan 3)': Math.abs(s-180)<22?'Rear / belakang (tekan 4)': Math.abs(s-270)<22?'Left / kiri (tekan 6)':'Pandangan bebas';}
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.font=fontTeks; ctx.textAlign='left';
  _cad1Baris(ctx,bKepala,12,18,maxW,lh);
  _cad1Baris(ctx,bKaki,12,yKaki,maxW,lh);
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
  const sempit=W<_TTL_SEMPIT;
  const pil=Math.round(_ttlNilai('sl_bd_plane',0)), a=_ttlNilai('sl_bd_a',80), b=_ttlNilai('sl_bd_b',50);
  const nama=['Top (XY)','Front (XZ)','Side (YZ)'][pil];
  _ttlTulis('v_bd_plane',nama); _ttlTulis('v_bd_a',a.toFixed(0)); _ttlTulis('v_bd_b',b.toFixed(0));
  const az=35, el=28;
  const denyut=0.25+0.15*Math.sin(_bdFrame/18);
  // Tiga bidang acuan 120 × 120 mm
  const L=120;
  const bidang=[
    {n:'Top (XY)',pts:[[0,0,0],[L,0,0],[L,L,0],[0,L,0]],warna:'34,211,238'},
    {n:'Front (XZ)',pts:[[0,0,0],[L,0,0],[L,0,L],[0,0,L]],warna:'249,115,22'},
    {n:'Side (YZ)',pts:[[0,0,0],[0,L,0],[0,L,L],[0,0,L]],warna:'168,85,247'},
  ];
  const glob=[['(x, y, 0)','(x, 0, z)','(0, y, z)'][pil]];
  const peta=[(x,y)=>[x,y,0],(x,y)=>[x,0,y],(x,y)=>[0,x,y]];
  const geser=p=>[p[0]-40,p[1]-40,p[2]];
  // Teks kepala: satu baris di layar lebar; di ponsel dipecah per bagian (jumlah baris dihitung dari
  // nama bidang terpanjang agar gambar tidak meloncat saat bidang diganti).
  const lh=sempit?13:14, maxW=W-24, fontTeks=sempit?"10px 'JetBrains Mono',monospace":"11px 'JetBrains Mono',monospace";
  ctx.font=fontTeks;
  const bagian=s=>['Bidang kerja: '+s,'→ koordinat 2D (u, v)','menjadi global '+glob[0]];
  const kepala=sempit?_cad1Pecah(ctx,bagian(nama),' ',maxW):[bagian(nama).join(' ')];
  const atas=18+((sempit?_cad1Pecah(ctx,bagian('Front (XZ)'),' ',maxW).length:1)-1)*lh+8;
  // Skala dan pusat dipilih agar ketiga bidang, sumbu, dan semua label muat di bawah teks kepala (dulu
  // ujung sumbu Z dan label Side (YZ) keluar tepi atas; di ponsel label Front dan X keluar tepi kanan).
  // Label persegi dihitung pada a, b maksimum slider sehingga gambar tidak bergeser saat slider digeser.
  ctx.font="10px 'JetBrains Mono',monospace";
  const lb=s=>ctx.measureText(s).width;
  const aM=+(document.getElementById('sl_bd_a')||{}).max||110, bM=+(document.getElementById('sl_bd_b')||{}).max||100;
  const item=[];
  bidang.forEach(bd=>{bd.pts.forEach(p=>item.push([geser(p),[-2,-2,2,2]])); item.push([geser(bd.pts[2]),[4,-10,4+lb(bd.n),3]]);});
  peta.forEach(m=>[[0,0,'(0, 0)'],[aM,0,'('+aM+', 0)'],[aM,bM,'('+aM+', '+bM+')']].forEach(([x,y,s])=>item.push([geser(m(x,y)),[5,-14,5+lb(s),-1]])));
  item.push([[-40,-40,0],[-5-lb('(0, 0)'),-14,5+lb('(0, 0)'),16]]);   // label (0, 0) bisa pindah ke kiri/bawah titiknya
  ctx.font="bold 11px 'JetBrains Mono',monospace";
  [[150,0,0,'X'],[0,150,0,'Y'],[0,0,150,'Z']].forEach(([x,y,z,s])=>item.push([[x,y,z],[-2,-14,6+lb(s),2]]));
  const {sk,cx,cy}=_cad1Muat(item,az,el,Math.min(W,H)/210,W,H,atas,W*0.5,H*0.6);
  // Bidang (isi dan garis) lebih dulu; namanya ditaruh bersama label lain di akhir.
  const Pb=bidang.map(bd=>bd.pts.map(p=>_cadProyeksi(geser(p),az,el,sk,cx,cy)));
  bidang.forEach((bd,i)=>{
    const P=Pb[i];
    ctx.fillStyle=`rgba(${bd.warna},${i===pil?denyut:0.06})`; ctx.strokeStyle=`rgba(${bd.warna},${i===pil?0.95:0.35})`; ctx.lineWidth=i===pil?1.8:1;
    ctx.beginPath(); P.forEach((q,j)=>j?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.closePath(); ctx.fill(); ctx.stroke();
  });
  const lblSumbu=[];
  _cadSumbu(ctx,az,el,sk,cx,cy,150,{x0:4,y0:atas,x1:W-4,y1:H-4,kumpul:lblSumbu});
  // Persegi panjang a × b pada bidang terpilih, sudut di titik asal
  const R=[[0,0],[a,0],[a,b],[0,b]].map(([x,y])=>_cadProyeksi(geser(peta[pil](x,y)),az,el,sk,cx,cy));
  ctx.fillStyle='rgba(0,224,158,.35)'; ctx.strokeStyle='#00e09e'; ctx.lineWidth=2;
  ctx.beginPath(); R.forEach((q,j)=>j?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Semua label (sumbu, sudut persegi, lalu nama bidang) ditaruh berurutan, masing-masing dengan beberapa calon
  // posisi, agar tidak saling menimpa: dulu nama bidang terpilih menimpa label sudut (a, b) saat a dan b besar,
  // dan label sudut saling menimpa saat a dan b kecil. Calon pertama = posisi semula (kanan-atas titiknya).
  const F10="10px 'JetBrains Mono',monospace", F11B="bold 11px 'JetBrains Mono',monospace";
  ctx.font=fontTeks; const terpakai=[_cad1Kotak(ctx,kepala,12,18,lh)];
  const lebarF=(f,t)=>{ctx.font=f; return ctx.measureText(t).width;};
  const lbl=[];
  lblSumbu.forEach(({s:t,warna,x,y})=>{const w=lebarF(F11B,t); lbl.push({s:t,warna,font:F11B,calon:[[x,y],[x,y+14],[x-w-8,y],[x-w-8,y+14],[x,y-12]]});});
  const gx=R.reduce((t,q)=>t+q[0],0)/4, gy=R.reduce((t,q)=>t+q[1],0)/4;
  [['(0, 0)',R[0]],['('+a+', 0)',R[1]],['('+a+', '+b+')',R[2]]].forEach(([t,q])=>{
    const w=lebarF(F10,t), dx=q[0]-gx, dy=q[1]-gy;
    const luar=[dx>=0?q[0]+5:q[0]-5-w, Math.abs(dy)<Math.abs(dx)*0.5?q[1]+4:dy>0?q[1]+12:q[1]-4];
    lbl.push({s:t,warna:'#e2e8f0',font:F10,calon:[[q[0]+5,q[1]-4],luar,[q[0]+5,q[1]+12],[q[0]-5-w,q[1]-4],[q[0]-5-w,q[1]+12],[q[0]+5,q[1]-16],[q[0]-5-w,q[1]-16],[q[0]+5,q[1]+24],[q[0]-5-w,q[1]+24]]});
  });
  bidang.forEach((bd,i)=>{const P=Pb[i], w=lebarF(F10,bd.n);
    lbl.push({s:bd.n,warna:`rgba(${bd.warna},.95)`,font:F10,calon:[[P[2][0]+4,P[2][1]],[P[2][0]+4,P[2][1]+13],[P[2][0]-4-w,P[2][1]],[P[2][0]-4-w,P[2][1]+13],[P[3][0]+4,P[3][1]],[P[1][0]+4,P[1][1]],[P[3][0]-4-w,P[3][1]]]});});
  _cad1Tata(ctx,lbl,terpakai,[4,4,W-4,H-4]);
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.font=fontTeks; ctx.textAlign='left';
  _cad1Baris(ctx,kepala,12,18,maxW,lh);
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
  const sempit=W<_TTL_SEMPIT;
  const bentuk=Math.round(_ttlNilai('sl_dr_bentuk',0)), a=_ttlNilai('sl_dr_a',100), b=_ttlNilai('sl_dr_b',60), n=Math.round(_ttlNilai('sl_dr_n',6));
  const namaBentuk=['Rectangle','Circle','Polygon'][bentuk];
  _ttlTulis('v_dr_bentuk',namaBentuk); _ttlTulis('v_dr_a',a.toFixed(0)); _ttlTulis('v_dr_b',b.toFixed(0)); _ttlTulis('v_dr_n',String(n));
  // Di ponsel jumlah baris teks kepala (kasus terpanjang, agar kisi tidak meloncat saat bentuk diganti) membatasi
  // tinggi kisi, supaya label Y di puncak sumbu tidak naik menimpa teks kepala (lebar 420-500).
  const fontK=sempit?"10px 'JetBrains Mono',monospace":"11px 'JetBrains Mono',monospace", lhK=sempit?13:14;
  ctx.font=fontK;
  const nK=sempit?_cad1Pecah(ctx,['Draft Polygon (12 sisi)','properti Area = 20106.19 mm²','Shape.Length = 502.65 mm'],' · ',W-24).length:1;
  const padL=52,padB=34, sk=Math.min((W-padL-30)/220,(H-padB-30)/140,(H-padB-(18+(nK-1)*lhK+4)-10)/135);
  const ox=padL, oy=H-padB;
  const X=x=>ox+x*sk, Y=y=>oy-y*sk;
  // kisi 10 mm
  ctx.strokeStyle='rgba(148,163,184,.12)'; ctx.lineWidth=1;
  for(let x=0;x<=220;x+=10){ctx.beginPath(); ctx.moveTo(X(x),Y(0)); ctx.lineTo(X(x),Y(140)); ctx.stroke();}
  for(let y=0;y<=140;y+=10){ctx.beginPath(); ctx.moveTo(X(0),Y(y)); ctx.lineTo(X(220),Y(y)); ctx.stroke();}
  ctx.strokeStyle=_CAD_X; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(220),Y(0)); ctx.stroke();
  ctx.strokeStyle=_CAD_Y; ctx.beginPath(); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(0),Y(140)); ctx.stroke();
  // Angka dan nama sumbu; kotaknya dicatat agar label dimensi tidak menimpanya.
  const tetap=[], tulis=(t,x,y)=>{ctx.fillText(t,x,y); tetap.push(_cad1KotakTeks(ctx,t,x,y,1));};
  ctx.fillStyle='rgba(148,163,184,.8)'; ctx.font="9px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  for(let x=0;x<=220;x+=50) tulis(String(x),X(x),oy+14);
  ctx.textAlign='right'; for(let y=0;y<=140;y+=50) tulis(String(y),ox-6,Y(y)+3);
  ctx.textAlign='left'; ctx.fillStyle=_CAD_X; tulis('X (mm)',X(200),oy+26); ctx.fillStyle=_CAD_Y; tulis('Y',ox-24,Y(135));
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
  // Teks kepala: satu baris di layar lebar; di ponsel dipecah per bagian (nama, Area, Shape.Length).
  ctx.font=fontK;
  const kepala=['Draft '+namaBentuk+(bentuk===2?' ('+n+' sisi)':''),'properti Area = '+luas.toFixed(2)+' mm²','Shape.Length = '+kel.toFixed(2)+' mm'];
  const bKepala=sempit?_cad1Pecah(ctx,kepala,' · ',W-24):[kepala.join(' · ')];
  tetap.push(_cad1Kotak(ctx,bKepala,12,18,lhK));
  // Dimensi persegi panjang: label b (tegak) dijaga di atas deret angka sumbu X (b kecil dulu menimpanya);
  // label a memakai calon posisi (tengah, rata sisi kanan, rata sumbu Y, lebih tinggi, di dalam persegi) agar
  // tidak menimpa label b, angka sumbu, maupun label Y.
  if(bentuk===0){ctx.strokeStyle='#f59e0b'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(X(0),Y(b)+-12+12); ctx.stroke();
    ctx.fillStyle='#f59e0b'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center';
    const ta='a = '+a+' mm', tb='b = '+b+' mm', wa=ctx.measureText(ta).width, wb=ctx.measureText(tb).width, uB=ctx.measureText(tb);
    const xB=X(a)+14, yB=Math.min(Y(b/2),oy-wb/2-3);
    ctx.save(); ctx.translate(xB,yB); ctx.rotate(-Math.PI/2); ctx.fillText(tb,0,0); ctx.restore();
    tetap.push([xB-uB.actualBoundingBoxAscent-2,yB-wb/2-2,xB+uB.actualBoundingBoxDescent+2,yB+wb/2+2]);
    _cad1Tata(ctx,[{s:ta,warna:'#f59e0b',calon:[[X(a/2)-wa/2,Y(b)-8],[X(a)+2-wa,Y(b)-8],[X(0)+4,Y(b)-8],[X(a/2)-wa/2,Y(b)-20],[X(0)+4,Y(b)-20],[X(a/2)-wa/2,Y(b)+14],[X(0)+4,yB-wb/2-6],[X(a/2)-wa/2,yB-wb/2-6]]}],tetap,[4,4,W-4,H-4]);}
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font=fontK; ctx.textAlign='left';
  _cad1Baris(ctx,bKepala,12,18,W-24,lhK);
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
  // Ponsel: pelat di atas dan pohon dokumen selebar kanvas di bawahnya (kanvas ditinggikan); dulu pohon di kanan
  // membuat pelat sangat kecil sehingga label a/4, 3a/4, ⌀, a, dan b saling menimpa.
  const k=_ttlKanvas('cvParametrik',400); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const a=_ttlNilai('sl_pm_a',150), b=_ttlNilai('sl_pm_b',70), d=_ttlNilai('sl_pm_d',16);
  _ttlTulis('v_pm_a',a.toFixed(0)); _ttlTulis('v_pm_b',b.toFixed(0)); _ttlTulis('v_pm_d',d.toFixed(0));
  // Lebar panel pohon mengikuti teks terpanjang yang DIUKUR, bukan dipatok: dulu dipatok
  // 190 px sehingga baris seperti "▸ Cut (Rectangle − Circle)" (±222 px) keluar kanvas.
  // Panel yang tidak cukup lebar memakai label ringkas; keterangannya ada di teks di bawah kanvas.
  const barisPenuh=['📄 Latihan1','  ▸ Rectangle  (Length=a, Height=b)','  ▸ Circle       (Radius=d/2 @ a/4)','  ▸ Circle001  (Radius=d/2 @ 3a/4)','  ▸ Cut          (Rectangle − Circle)','  ▸ Cut001      (Cut − Circle001)'];
  const kakiPenuh=['Tree view: ubah properti Length','→ Cut001 dihitung ulang otomatis'];
  const lebarTeksDari=(bs,ks)=>{ctx.font="10px 'JetBrains Mono',monospace"; const w=Math.max(...bs.map(t=>ctx.measureText(t).width)); ctx.font="9px 'JetBrains Mono',monospace"; return Math.max(w,...ks.map(t=>ctx.measureText(t).width));};
  const ringkas=sempit?lebarTeksDari(barisPenuh,kakiPenuh)+16>W-12:W<600;
  const baris=ringkas?['📄 Latihan1','  ▸ Rectangle','  ▸ Circle','  ▸ Circle001','  ▸ Cut','  ▸ Cut001']:barisPenuh;
  const kaki=ringkas?['ubah Length →','Cut001 dihitung ulang']:kakiPenuh;
  const lebarTeks=lebarTeksDari(baris,kaki);
  const pohonW=sempit?W-12:Math.ceil(lebarTeks)+16, pohonH=sempit?152:H-32, px=sempit?6:W-pohonW-6, py=sempit?H-8-pohonH:16;
  // Skala pelat: dibatasi juga agar label a (di atas pelat pada b maksimum) tidak naik menimpa teks kepala.
  const bawahKepala=ringkas?37:22, bM=+(document.getElementById('sl_pm_b')||{}).max||120, aM=+(document.getElementById('sl_pm_a')||{}).max||220;
  const padL=40, oy=sempit?py-26:H-38, ox=padL;
  const sk=sempit?Math.min((W-65)/aM,(oy-bawahKepala-22)/bM):Math.min(Math.max(60,W-pohonW-padL-30)/230,(H-70)/130,(oy-bawahKepala-18)/bM);
  const X=x=>ox+x*sk, Y=y=>oy-y*sk;
  // Pelat
  ctx.fillStyle='rgba(34,211,238,.16)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.rect(X(0),Y(b),a*sk,b*sk); ctx.fill(); ctx.stroke();
  // Lubang di a/4 dan 3a/4 (mengikuti a secara parametrik)
  const lubang=[[a/4,b/2],[3*a/4,b/2]];
  lubang.forEach(([x,y])=>{ctx.fillStyle='#0a101f'; ctx.strokeStyle='#f59e0b'; ctx.lineWidth=1.8; ctx.beginPath(); ctx.arc(X(x),Y(y),d/2*sk,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle='rgba(245,158,11,.5)'; ctx.setLineDash([3,3]); ctx.beginPath(); ctx.moveTo(X(x)-10,Y(y)); ctx.lineTo(X(x)+10,Y(y)); ctx.moveTo(X(x),Y(y)-10); ctx.lineTo(X(x),Y(y)+10); ctx.stroke(); ctx.setLineDash([]);});
  // Dimensi; kotak tintanya dicatat agar label ⌀ tidak menimpanya.
  const tetap=[];
  ctx.fillStyle='#f59e0b'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  [['a = '+a+' mm',X(a/2),Y(b)-8],['a/4',X(a/4),oy+14],['3a/4',X(3*a/4),oy+14]].forEach(([t,x,y])=>{ctx.fillText(t,x,y); tetap.push(_cad1KotakTeks(ctx,t,x,y,1));});
  const tb='b = '+b+' mm', uB=ctx.measureText(tb);
  ctx.save(); ctx.translate(X(a)+14,Y(b/2)); ctx.rotate(-Math.PI/2); ctx.fillText(tb,0,0); ctx.restore();
  tetap.push([X(a)+14-uB.actualBoundingBoxAscent-1,Y(b/2)-uB.width/2-1,X(a)+14+uB.actualBoundingBoxDescent+1,Y(b/2)+uB.width/2+1]);
  tetap.push([px,py,px+pohonW,py+pohonH]);
  // Teks kepala (luas Cut001); di kanvas sempit dua baris.
  const luas=a*b-2*Math.PI*d*d/4;
  ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  const kepala=ringkas?['Cut001.Shape.Area','= '+luas.toFixed(2)+' mm²']:['Cut001.Shape.Area = '+luas.toFixed(2)+' mm²'];
  tetap.push(_cad1Kotak(ctx,kepala,12,18,15));
  // Label ⌀ di bawah lubang kiri seperti semula; bila menimpa label a/4 (pelat tipis, lubang besar) atau label
  // lain, dipakai calon di atas, kanan, atau kiri lubang.
  ctx.font="10px 'JetBrains Mono',monospace"; const tD='⌀'+d, wD=ctx.measureText(tD).width, rL=d/2*sk;
  _cad1Tata(ctx,[{s:tD,warna:'#f59e0b',calon:[[X(a/4)-wD/2,Y(b/2)+rL+12],[X(a/4)-wD/2,Y(b/2)-rL-5],[X(a/4)+rL+4,Y(b/2)+4],[X(a/4)-rL-4-wD,Y(b/2)+4],[X(a/2)-wD/2,Y(b/2)+4]]}],tetap,[4,4,W-4,H-4]);
  // Pohon dokumen mini dengan sorotan bergilir
  ctx.fillStyle='rgba(14,22,40,.92)'; ctx.strokeStyle='rgba(148,163,184,.25)'; ctx.lineWidth=1; ctx.beginPath(); ctx.rect(px,py,pohonW,pohonH); ctx.fill(); ctx.stroke();
  const sorot=1+Math.floor((_pmFrame/45)%5);
  ctx.font="10px 'JetBrains Mono',monospace";
  baris.forEach((t,i)=>{const y=py+18+i*19; if(i===sorot){ctx.fillStyle='rgba(0,224,158,.18)'; ctx.fillRect(px+4,y-12,pohonW-8,17);} ctx.fillStyle=i===0?'#e2e8f0':'rgba(203,213,225,.9)'; ctx.fillText(t,px+8,y);});
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="9px 'JetBrains Mono',monospace";
  ctx.fillText(kaki[0],px+8,py+18+6*19); ctx.fillText(kaki[1],px+8,py+30+6*19);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace";
  kepala.forEach((t,i)=>ctx.fillText(t,12,18+i*15));
  _ttlTulis('parametrikInfo','Luas bersih = a·b − 2·π·d²/4 = '+(a*b).toLocaleString('id-ID')+' − '+(2*Math.PI*d*d/4).toLocaleString('id-ID',{maximumFractionDigits:2})+' = '+luas.toLocaleString('id-ID',{maximumFractionDigits:2})+' mm² · posisi lubang mengikuti a karena diikat sebagai a/4 dan 3a/4');
  if(_ttlJalan('parametrik')){_pmFrame++; requestAnimationFrame(drawParametrik);}
}

_TTL_DAFTAR.push(['cvNavigasi',()=>drawNavigasi(),'navigasi',['sl_nv_az','sl_nv_el','sl_nv_zoom']]);
_TTL_DAFTAR.push(['cvBidang',()=>drawBidang(),'bidang',['sl_bd_plane','sl_bd_a','sl_bd_b']]);
_TTL_DAFTAR.push(['cvDraft',()=>drawDraft(),'draft',['sl_dr_bentuk','sl_dr_a','sl_dr_b','sl_dr_n']]);
_TTL_DAFTAR.push(['cvParametrik',()=>drawParametrik(),'parametrik',['sl_pm_a','sl_pm_b','sl_pm_d']]);
_ttlMulai();
