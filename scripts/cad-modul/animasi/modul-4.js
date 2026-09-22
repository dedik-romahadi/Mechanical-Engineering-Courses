// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 4 PEMODELAN CAD — Dimensi, Anotasi, dan Format Gambar Teknik
// Kanvas: cvJenis, cvChain, cvSektor, cvFormat (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// Kaidah angka dimensi (ISO 129): angka sejajar garis dimensinya, DI ATAS garis itu dan tidak tercoret
// garis apa pun; angka dimensi tegak dibaca dari kanan. Label leader (R, ⌀, °) diletakkan di ruang bersih.
// ════════════════════════════════════════════════════════════
function _cad4Kisi(ctx,W,H,lebarMm,tinggiMm,padL,padB,ox0,oy0){
  const sk=Math.max(0.05,Math.min((W-padL-24)/lebarMm,(H-padB-26)/tinggiMm));
  const ox=padL+(ox0||0)*sk, oy=H-padB-(oy0||0)*sk;
  const X=x=>ox+x*sk, Y=y=>oy-y*sk;
  ctx.strokeStyle='rgba(148,163,184,.10)'; ctx.lineWidth=1;
  for(let x=-(ox0||0);x<=lebarMm-(ox0||0);x+=10){ctx.beginPath(); ctx.moveTo(X(x),Y(-(oy0||0))); ctx.lineTo(X(x),Y(tinggiMm-(oy0||0))); ctx.stroke();}
  for(let y=-(oy0||0);y<=tinggiMm-(oy0||0);y+=10){ctx.beginPath(); ctx.moveTo(X(-(ox0||0)),Y(y)); ctx.lineTo(X(lebarMm-(ox0||0)),Y(y)); ctx.stroke();}
  return {X,Y,sk};
}
// Mata panah terisi berujung di (x, y) dan menunjuk ke arah sudut ang (rad).
function _cad4Panah(ctx,x,y,ang,warna,p){p=p||7; ctx.fillStyle=warna; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-p*Math.cos(ang)+p*0.35*Math.sin(ang),y-p*Math.sin(ang)-p*0.35*Math.cos(ang)); ctx.lineTo(x-p*Math.cos(ang)-p*0.35*Math.sin(ang),y-p*Math.sin(ang)+p*0.35*Math.cos(ang)); ctx.closePath(); ctx.fill();}
// Dimensi linear antara dua titik layar, digeser tegak lurus sejauh ofs px. Angka ditulis sejajar garis dimensi,
// di ATAS garisnya menurut arah baca (dimensi tegak dibaca dari kanan) dengan celah tinta 3 px, jadi tidak pernah
// tercoret garis dimensinya sendiri. gaya: font (px), panah (px), ext (garis bantu sampai ext·ofs) atau lebih (px
// tetap melewati garis dimensi, menggantikan ext), tebal, geser (px: angka dijauhkan lagi dari garis, untuk angka
// berselang-seling), sisi (px: angka digeser sepanjang garis), pelat ('auto' = berpelat _ttlLabel bila angka lebih
// panjang daripada dimensinya sehingga garis bantu melintas di belakangnya; true/false memaksa), tunda (larik:
// angka baru ditulis setelah semua garis gambar selesai, agar pelatnya menutup garis yang melintas).
function _cad4Dim(ctx,x1,y1,x2,y2,teks,warna,ofs,gaya){
  const g=Object.assign({font:10,panah:8,ext:1.15,lebih:null,tebal:1,geser:0,sisi:0,pelat:'auto',tunda:null},gaya||{});
  const dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy)||1, ux=dx/L, uy=dy/L, nx=-uy*ofs, ny=ux*ofs;
  const fe=g.lebih!=null&&ofs?(Math.abs(ofs)+g.lebih)/Math.abs(ofs):g.ext;
  ctx.strokeStyle=warna; ctx.lineWidth=g.tebal; ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x1+nx*fe,y1+ny*fe); ctx.moveTo(x2,y2); ctx.lineTo(x2+nx*fe,y2+ny*fe); ctx.stroke();
  // Dimensi yang lebih pendek daripada dua mata panah: panah di luar garis bantu (menunjuk ke dalam) dan garis
  // dimensinya diteruskan sepanjang panah + 2 px, seperti kaidah ISO untuk ruang sempit.
  const p=g.panah, luar=L<2*p+4, e=luar?p+2:0;
  ctx.beginPath(); ctx.moveTo(x1+nx-ux*e,y1+ny-uy*e); ctx.lineTo(x2+nx+ux*e,y2+ny+uy*e); ctx.stroke();
  [[x1+nx,y1+ny,luar?-1:1],[x2+nx,y2+ny,luar?1:-1]].forEach(([px,py,s])=>{ctx.fillStyle=warna; ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+s*ux*p-uy*p*0.35,py+s*uy*p+ux*p*0.35); ctx.lineTo(px+s*ux*p+uy*p*0.35,py+s*uy*p-ux*p*0.35); ctx.closePath(); ctx.fill();});
  const tulis=()=>{
    let ang=Math.atan2(dy,dx); if(ang>=Math.PI/2-1e-6) ang-=Math.PI; else if(ang<-Math.PI/2-1e-6) ang+=Math.PI;
    ctx.save(); ctx.translate((x1+x2)/2+nx+Math.cos(ang)*g.sisi,(y1+y2)/2+ny+Math.sin(ang)*g.sisi); ctx.rotate(ang);
    ctx.font=g.font+"px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillStyle=warna;
    // celah tinta–garis 3 px; bila angka menjangkau daerah mata panah, dijauhkan melewati setengah lebar panahnya
    const u=ctx.measureText(teks), lebar=u.actualBoundingBoxLeft+u.actualBoundingBoxRight;
    const celah=lebar/2+2>(luar?L/2:L/2-p)?Math.max(3,p*0.35+1.5):3, yb=-(g.tebal/2+celah+u.actualBoundingBoxDescent+g.geser);
    const pelat=g.pelat===true||(g.pelat==='auto'&&lebar+6>L);
    if(pelat) _ttlLabel(ctx,teks,0,yb,{pad:1.5}); else ctx.fillText(teks,0,yb);
    ctx.restore(); ctx.textAlign='left';
  };
  if(g.tunda) g.tunda.push(tulis); else tulis();
}
// Memecah bagian-bagian teks menjadi baris selebar maksimal maxW (font ctx saat ini): bagian digabung
// dengan pemisah sep (string, atau larik: sep[i] dipakai sebelum bagian[i]) selama masih muat.
function _cad4Pecah(ctx,bagian,sep,maxW){
  const baris=[]; let kini='';
  bagian.forEach((b,i)=>{const s=Array.isArray(sep)?sep[i]:sep; const coba=kini?kini+s+b:b; if(kini&&ctx.measureText(coba).width>maxW){baris.push(kini); kini=b;} else kini=coba;});
  if(kini) baris.push(kini);
  return baris;
}
// Menulis baris-baris mulai dari y (jarak lh); baris yang tetap kepanjangan dikecilkan/dipecah _ttlTeks.
function _cad4Baris(ctx,baris,x,y,maxW,lh){let yy=y; baris.forEach(t=>{yy=_ttlTeks(ctx,t,x,yy,maxW,{lh});}); return yy;}
// Baris teks kepala kanvas: di layar lebar satu baris 11 px (bagian digabung dengan sep, sama persis
// dengan teks semula); di ponsel (W < _TTL_SEMPIT) 10 px dan dipecah per bagian selebar kanvas.
// Mengembalikan {baris, lh, font}; tulis dengan ctx.font = font lalu _cad4Baris(ctx, baris, 12, 18, W-24, lh).
function _cad4Kepala(ctx,W,bagian,sep){
  const sempit=W<_TTL_SEMPIT, font=sempit?"10px 'JetBrains Mono',monospace":"11px 'JetBrains Mono',monospace";
  ctx.font=font;
  const baris=sempit?_cad4Pecah(ctx,bagian,sep,W-24):[bagian.map((b,i)=>i?(Array.isArray(sep)?sep[i]:sep)+b:b).join('')];
  return {baris,lh:sempit?13:14,font};
}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Jenis Draft Dimension pada satu pelat
// ════════════════════════════════════════════════════════════
let _jnFrame=0;
function toggleJenis(){_ttlToggle('jenis','btnJenis',drawJenis);}
window.toggleJenis=toggleJenis;
function drawJenis(){
  const k=_ttlKanvas('cvJenis'); if(!k) return; const {ctx,W,H}=k;
  const a=_ttlNilai('sl_jn_a',120), b=_ttlNilai('sl_jn_b',70), d=_ttlNilai('sl_jn_d',20), c=_ttlNilai('sl_jn_c',15);
  _ttlTulis('v_jn_a',a.toFixed(0)); _ttlTulis('v_jn_b',b.toFixed(0)); _ttlTulis('v_jn_d',d.toFixed(0)); _ttlTulis('v_jn_c',c.toFixed(0));
  const {X,Y}=_cad4Kisi(ctx,W,H,a+80,b+70,60,44,30,26);
  const sk=X(1)-X(0), f10="10px 'JetBrains Mono',monospace";
  const pts=[[0,0],[a,0],[a,b-c],[a-c,b],[0,b]];
  ctx.fillStyle='rgba(34,211,238,.12)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2;
  ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1]))); ctx.closePath(); ctx.fill(); ctx.stroke();
  const hx=X(a/2), hy=Y(b/2), hr=d/2*sk;
  ctx.fillStyle='#0a101f'; ctx.beginPath(); ctx.arc(hx,hy,hr,0,Math.PI*2); ctx.fill(); ctx.stroke();
  const jenis=['linear','aligned','diameter','angular','radius'];
  const aktif=_ttlJalan('jenis')?Math.floor((_jnFrame/70)%5):5;
  const tampil=(j)=>aktif===5||jenis[aktif]===j;
  // Semua garis digambar dulu, semua angka dan label sesudahnya (antrean `label`), supaya angka aligned yang
  // berpelat menutupi garis di belakangnya. Dulu label R dan ⌀ menumpang tepi pelat dan label 45° menumpang tepi
  // atasnya: kini leader R berujung di kiri bawah pelat, leader ⌀ di kanan pelat, dan 45° tepat di kanan sudut chamfer.
  const label=[];
  const tulis=(s,x,y,warna,align)=>label.push(()=>{ctx.fillStyle=warna; ctx.font=f10; ctx.textAlign=align||'left'; ctx.fillText(s,x,y); ctx.textAlign='left';});
  if(tampil('linear')){_cad4Dim(ctx,X(0),Y(0),X(a),Y(0),a.toFixed(0),'#00e09e',24,{lebih:2,tunda:label}); _cad4Dim(ctx,X(0),Y(b),X(0),Y(0),b.toFixed(0),'#00e09e',26,{lebih:2,tunda:label});}
  const r=c*sk*0.9;
  // aligned: garis dimensi cukup jauh dari chamfer agar angkanya lepas dari busur 45° dan garis perpanjangan tepinya;
  // angka miring berpelat karena kotak miringnya melingkupi ujung garis perpanjangan itu.
  if(tampil('aligned')) _cad4Dim(ctx,X(a),Y(b-c),X(a-c),Y(b),(c*Math.SQRT2).toFixed(2),'#f59e0b',Math.max(16,(1.125*c*sk+7.2)/Math.SQRT2-7.15),{lebih:2,pelat:true,tunda:label});
  // ⌀ di kanan pelat, di bawah label 45°; bila tepi kanan di bawah chamfer terlalu pendek, di kanan dimensi a.
  const yDia=Y(b-c)+28<=Y(0)+6?Math.max(Y(b*0.3),Y(b-c)+28):Y(0)+22;
  if(tampil('diameter')){
    const xe=X(a)+12, ang=Math.atan2(yDia-hy,xe-hx), x0=hx+hr*Math.cos(ang), y0=hy+hr*Math.sin(ang);
    ctx.strokeStyle='#a855f7'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(xe,yDia); ctx.stroke();
    _cad4Panah(ctx,x0,y0,ang+Math.PI,'#a855f7');
    tulis('⌀'+d.toFixed(0),xe+3,yDia+3.5,'#a855f7');
  }
  // Sudut chamfer 45° diukur antara garis chamfer (arah 225° di kanvas) dan perpanjangan tepi kanan ke atas (270°).
  if(tampil('angular')){
    _ttlGaris(ctx,X(a),Y(b-c),X(a),Y(b-c)-r*1.25,'rgba(236,72,153,.55)',0.8,[3,3]);
    ctx.strokeStyle='#ec4899'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(X(a),Y(b-c),r,Math.PI*1.25,Math.PI*1.5); ctx.stroke();
    tulis('45°',X(a)+5,Y(b-c)+8,'#ec4899');
  }
  if(tampil('radius')){
    const xe=X(0)-6, ye=Y(0)+14, ang=Math.atan2(ye-hy,xe-hx);
    ctx.strokeStyle='#f97316'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(hx,hy); ctx.lineTo(xe,ye); ctx.stroke();
    _cad4Panah(ctx,hx+hr*Math.cos(ang),hy+hr*Math.sin(ang),ang,'#f97316');
    tulis('R'+(d/2).toFixed(1),xe-3,ye+3.5,'#f97316','right');
  }
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillText(aktif===5?'Semua jenis dimensi':'Draft Dimension '+jenis[aktif],12,18);
  label.forEach(f=>f());
  _ttlTulis('jenisInfo','Linear (hijau): '+a+' dan '+b+' · aligned (kuning) sisi chamfer '+(c*Math.SQRT2).toFixed(2)+' · diameter ⌀'+d+' (ungu) · angular 45° (merah muda) · radius R'+(d/2).toFixed(1)+' (jingga); luas bersih = a·b − c²/2 − πd²/4 = '+(a*b-c*c/2-Math.PI*d*d/4).toFixed(2)+' mm²');
  if(_ttlJalan('jenis')){_jnFrame++; requestAnimationFrame(drawJenis);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Chain vs baseline: akumulasi toleransi
// ════════════════════════════════════════════════════════════
let _chFrame=0;
function toggleChain(){_ttlToggle('chain','btnChain',drawChain);}
window.toggleChain=toggleChain;
function drawChain(){
  const k=_ttlKanvas('cvChain',330); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const n=Math.round(_ttlNilai('sl_ch_n',4)), t=_ttlNilai('sl_ch_t',0.2), seg=_ttlNilai('sl_ch_l',30);
  _ttlTulis('v_ch_n',String(n)); _ttlTulis('v_ch_t','±'+t.toFixed(2)); _ttlTulis('v_ch_l',seg.toFixed(0));
  const total=n*seg;
  // indikator penyimpangan bergerak
  const fase=_ttlJalan('chain')?Math.sin(_chFrame/30):1;
  const kepala=['posisi lubang terakhir:','chain '+(total+fase*n*t).toFixed(2)+'  vs','baseline '+(total+fase*t).toFixed(2)], sepK=['',' ','  '];
  const lblChain=['CHAIN — toleransi keseluruhan','±'+(n*t).toFixed(2)+' (menumpuk)'];
  const lblBase=['BASELINE — toleransi tiap fitur','±'+t.toFixed(2)+' dari acuan'];
  const f9="9px 'JetBrains Mono',monospace", f10="10px 'JetBrains Mono',monospace", lh=13, maxW=W-24;
  const gabung=(bagian,sep)=>[bagian.map((b,i)=>i?(Array.isArray(sep)?sep[i]:sep)+b:b).join('')];
  ctx.font=f10;
  const bKepala=sempit?_cad4Pecah(ctx,kepala,sepK,maxW):gabung(kepala,sepK);
  const nKepala=sempit?_cad4Pecah(ctx,['posisi lubang terakhir:','chain 000.00  vs','baseline 000.00'],sepK,maxW).length:1;
  const bChain=sempit?_cad4Pecah(ctx,lblChain,' ',maxW):gabung(lblChain,' '), bBase=sempit?_cad4Pecah(ctx,lblBase,' ',maxW):gabung(lblBase,' ');
  // Tata letak tegak dalam px untuk semua lebar. Dimensi di LUAR pelat seperti gambar kerja: chain di atas pelat
  // pertama, baseline bertumpuk di atas pelat kedua (jarak antargaris 13 px), angka di atas garisnya. Garis bantu
  // hanya 2 px melewati garis dimensinya sehingga tidak mencoret angka; angka baseline pertama digeser ke kanan bila
  // menyentuh garis bantu acuan. Dulu dimensi menumpang di dalam pelat, angkanya tercoret garis dan lubang.
  const x0=sempit?16:60, sk=Math.min((W-x0-(sempit?16:60))/total,4), X=v=>x0+v*sk;
  const hP=sempit?20:24, rL=Math.min(hP*0.3,seg*sk*0.3), pita=10.7;   // pita = tinggi angka 9 px di atas garisnya
  ctx.font=f9; const selang=seg*sk<ctx.measureText(seg+'±'+t).width+6;   // angka chain berselang-seling bila ruas sempit
  const yLbl1=18+nKepala*lh+6, yA1=yLbl1+(bChain.length-1)*lh+8+14+pita+(selang?11:0);
  const yLbl2=yA1+hP+18, yA2=yLbl2+(bBase.length-1)*lh+8+pita+12+(n-1)*13;
  // kisi samar di belakang gambar (tiap 10 mm, atau 20 mm bila terlalu rapat)
  const langkah=10*sk<8?20:10, yK0=yLbl1-10, yK1=yA2+hP+6;
  ctx.strokeStyle='rgba(148,163,184,.10)'; ctx.lineWidth=1;
  for(let v=-10;v<=total+10;v+=langkah){const x=X(v); if(x<4||x>W-4) continue; ctx.beginPath(); ctx.moveTo(x,yK0); ctx.lineTo(x,yK1); ctx.stroke();}
  for(let y=yK1;y>=yK0;y-=langkah*sk){ctx.beginPath(); ctx.moveTo(Math.max(4,X(-10)),y); ctx.lineTo(Math.min(W-4,X(total+10)),y); ctx.stroke();}
  const pelat=yA=>{ctx.strokeStyle='#22d3ee'; ctx.lineWidth=1.6; ctx.strokeRect(X(0),yA,total*sk,hP);
    for(let i=1;i<n;i++){ctx.fillStyle='#0a101f'; ctx.beginPath(); ctx.arc(X(i*seg),yA+hP/2,rL,0,Math.PI*2); ctx.fill(); ctx.stroke();}};
  pelat(yA1); pelat(yA2);
  for(let i=0;i<n;i++) _cad4Dim(ctx,X(i*seg),yA1,X((i+1)*seg),yA1,seg+'±'+t,'#f59e0b',-14,{font:9,panah:6,lebih:2,pelat:false,geser:selang&&i%2?11:0});
  for(let i=1;i<=n;i++){
    const tb=(i*seg)+'±'+t; ctx.font=f9; const w=ctx.measureText(tb).width;
    _cad4Dim(ctx,X(0),yA2,X(i*seg),yA2,tb,'#00e09e',-(12+(i-1)*13),{font:9,panah:6,lebih:2,pelat:false,sisi:Math.max(0,X(0)+3+w/2-X(i*seg/2))});
  }
  ctx.font=f10;
  ctx.fillStyle='#f59e0b'; _cad4Baris(ctx,bChain,X(0),yLbl1,W-X(0)-6,lh);
  ctx.fillStyle='#00e09e'; _cad4Baris(ctx,bBase,X(0),yLbl2,W-X(0)-6,lh);
  ctx.fillStyle='rgba(239,68,68,.9)'; _cad4Baris(ctx,bKepala,12,18,maxW,lh);
  _ttlTulis('chainInfo','Dengan '+n+' ruas @'+seg+' ±'+t+': dimensi berantai membiarkan penyimpangan bertambah sampai ±'+(n*t).toFixed(2)+' pada ukuran keseluruhan, sedangkan baseline menahan tiap fitur pada ±'+t+' dari acuan yang sama');
  if(_ttlJalan('chain')){_chFrame++; requestAnimationFrame(drawChain);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Radius, diameter, sudut: sektor lingkaran dan slot
// ════════════════════════════════════════════════════════════
let _skFrame=0;
function toggleSektor(){_ttlToggle('sektor','btnSektor',drawSektor);}
window.toggleSektor=toggleSektor;
function drawSektor(){
  const k=_ttlKanvas('cvSektor',330); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const r=_ttlNilai('sl_sk_r',40), thMaks=_ttlNilai('sl_sk_th',60), L=_ttlNilai('sl_sk_L',60), d=_ttlNilai('sl_sk_d',16);
  _ttlTulis('v_sk_r',r.toFixed(0)); _ttlTulis('v_sk_th',thMaks.toFixed(0)+'°'); _ttlTulis('v_sk_L',L.toFixed(0)); _ttlTulis('v_sk_d',d.toFixed(0));
  const th=_ttlJalan('sektor')?thMaks*(0.55+0.45*Math.sin(_skFrame/45)):thMaks;
  const rad=th*Math.PI/180, rr=d/2, f10="10px 'JetBrains Mono',monospace";
  const kp=_cad4Kepala(ctx,W,['Radius (R),','diameter (⌀),','dan angular (°)','pada sektor dan slot'],' ');
  const yKep=18+(kp.baris.length-1)*kp.lh;                       // garis dasar baris judul terakhir
  ctx.font=f10; const tR='R'+r, tRs='R'+rr, tS=th.toFixed(1)+'°', wR=ctx.measureText(tR).width, wRs=ctx.measureText(tRs).width, wS=ctx.measureText(tS).width;
  const kiri=Math.max(0,-Math.cos(thMaks*Math.PI/180));          // bagian busur di kiri pusat bila θ maks > 90°
  const luasSektor=0.5*r*r*rad, tSektor='sektor: ½r²θ = '+luasSektor.toFixed(2)+' mm²';
  const luasSlot=2*rr*L+Math.PI*rr*rr, tSlot='slot: 2rL + πr² = '+luasSlot.toFixed(2)+' mm²';
  // Tata letak. Layar lebar: sektor kiri (jari-jari gambar R px) dan slot kanan; label R sektor di luar busur tidak
  // boleh masuk daerah slot. Ponsel: sektor di atas, slot di bawahnya, dua baris luas di dasar kanvas (dulu
  // berdampingan sehingga label R dan sudut menumpang garis sektor maupun slot).
  let R, cx, cy, sk2, ox, oy;
  if(!sempit){
    sk2=Math.max(0.05,Math.min(W*0.4/(L+d+20),(H-70)/(d*3))); ox=W*0.56; oy=H*0.5;
    R=Math.max(40,Math.min(W*0.42/1.4,(H-60)/1.6,(ox-rr*sk2-29-wR)/(1+kiri)));
    cx=Math.max(W*0.06+R/14+20,8+R*kiri); cy=H*0.72;
  } else {
    sk2=Math.max(0.05,Math.min((W-32-wRs)/(L+1.825*rr),48/d));
    R=Math.max(30,Math.min((W-43-wR)/(1+kiri),100,H-42-(yKep+20)-(74+2*rr*sk2)));
    cx=12+R*kiri; cy=yKep+20+R;
    ox=12+rr*sk2; oy=cy+54+rr*sk2;
  }
  ctx.fillStyle='rgba(34,211,238,.14)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,R,0,-rad,true); ctx.closePath(); ctx.fill(); ctx.stroke();
  // R sektor: garis dari pusat pada garis bagi sudut, mata panah di busur, lalu keluar 8 px ke label di luar sektor
  const am=-rad/2, xe=cx+(R+8)*Math.cos(am), ye=cy+(R+8)*Math.sin(am);
  ctx.strokeStyle='#f97316'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(xe,ye); ctx.stroke();
  _cad4Panah(ctx,cx+R*Math.cos(am),cy+R*Math.sin(am),am,'#f97316',6);
  // sudut θ: busur kecil; angkanya di bawah jari-jari alas (di luar sektor), jadi tidak dicoret garis R
  const ra=R*0.3; ctx.strokeStyle='#ec4899'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(cx,cy,ra,0,-rad,true); ctx.stroke();
  // slot
  ctx.fillStyle='rgba(0,224,158,.12)'; ctx.strokeStyle='#00e09e'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(ox,oy-rr*sk2); ctx.lineTo(ox+L*sk2,oy-rr*sk2); ctx.arc(ox+L*sk2,oy,rr*sk2,-Math.PI/2,Math.PI/2); ctx.lineTo(ox,oy+rr*sk2); ctx.arc(ox,oy,rr*sk2,Math.PI/2,Math.PI*1.5); ctx.closePath(); ctx.fill(); ctx.stroke();
  _cad4Dim(ctx,ox,oy,ox+L*sk2,oy,L.toFixed(0),'#f59e0b',-(rr*sk2+22),{font:9,panah:6,lebih:2});
  _cad4Dim(ctx,ox-rr*sk2,oy+rr*sk2,ox+(L+rr)*sk2,oy+rr*sk2,(L+d).toFixed(0),'#f59e0b',18,{font:9,panah:6,lebih:2});
  // R ujung slot: leader dari pusat busur kanan keluar slot, label di ujungnya (dulu menumpang garis tepi slot)
  const as=-0.6, xs=ox+L*sk2+(rr*sk2+10)*Math.cos(as), ys=oy+(rr*sk2+10)*Math.sin(as);
  ctx.strokeStyle='#f97316'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(ox+L*sk2,oy); ctx.lineTo(xs,ys); ctx.stroke();
  _cad4Panah(ctx,ox+L*sk2+rr*sk2*Math.cos(as),oy+rr*sk2*Math.sin(as),as,'#f97316',6);
  // label (sesudah semua garis)
  ctx.font=f10;
  ctx.fillStyle='#f97316'; ctx.fillText(tR,xe+3,ye+3.5); ctx.fillText(tRs,xs+3,ys+3.5);
  ctx.fillStyle='#ec4899'; ctx.textAlign='center'; ctx.fillText(tS,Math.max(cx+ra,6+wS/2),cy+13); ctx.textAlign='left';
  ctx.fillStyle='rgba(226,232,240,.92)';
  if(!sempit){ctx.fillText(tSektor,cx-20,H-12); ctx.fillText(tSlot,ox-10,H-12);}
  else {_ttlTeks(ctx,tSektor,12,H-26,W-24); _ttlTeks(ctx,tSlot,12,H-12,W-24);}
  ctx.font=kp.font; _cad4Baris(ctx,kp.baris,12,18,W-24,kp.lh);
  _ttlTulis('sektorInfo','Sektor r = '+r+', θ = '+th.toFixed(1)+'°: luas ½·r²·θ(rad) = '+luasSektor.toFixed(2)+' mm² · slot L = '+L+', d = '+d+': luas 2·r·L + π·r² = '+luasSlot.toFixed(2)+' mm², panjang total L + d = '+(L+d));
  if(_ttlJalan('sektor')){_skFrame++; requestAnimationFrame(drawSektor);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Format dimensi: FontSize, ArrowSize, Decimals, ExtLines
// ════════════════════════════════════════════════════════════
let _fmFrame=0;
function toggleFormat(){_ttlToggle('format','btnFormat',drawFormat);}
window.toggleFormat=toggleFormat;
function drawFormat(){
  const k=_ttlKanvas('cvFormat'); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const font=_ttlNilai('sl_fm_font',3.5), panah=_ttlNilai('sl_fm_panah',2), dec=Math.round(_ttlNilai('sl_fm_dec',2)), ext=_ttlNilai('sl_fm_ext',1.2);
  _ttlTulis('v_fm_font',font.toFixed(1)); _ttlTulis('v_fm_panah',panah.toFixed(1)); _ttlTulis('v_fm_dec',String(dec)); _ttlTulis('v_fm_ext',ext.toFixed(1));
  const nilai=120.4567;
  const {X,Y}=_cad4Kisi(ctx,W,H,200,110,52,34,20,20);
  const sk=X(1)-X(0);
  ctx.fillStyle='rgba(34,211,238,.12)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.strokeRect(X(0),Y(60),120.4567*sk,60*sk);
  // FontSize (mm kertas) → px layar: 2 mm = 8 px (batas terbaca), 3,5 mm = 11,2 px seperti semula, 7 mm ≈ 18,7 px.
  // Angka di atas garis dimensinya; bila lebih panjang daripada dimensinya (ponsel, FontSize besar), angka berpelat
  // sehingga garis bantu (ExtLines) terputus di belakangnya alih-alih mencoretnya.
  const gaya={font:8+(font-2)*3.2/1.5,panah:panah*4,ext:ext};
  const teks=nilai.toFixed(dec)+(dec===0?'':'');
  _cad4Dim(ctx,X(0),Y(0),X(nilai),Y(0),teks,'#00e09e',26,gaya);
  _cad4Dim(ctx,X(0),Y(60),X(0),Y(0),(60).toFixed(dec),'#00e09e',28,gaya);
  const denyut=_ttlJalan('format')?0.5+0.5*Math.sin(_fmFrame/25):1;
  // Baris AnnotationStyle: di layar lebar tetap di atas persegi (dikecilkan seperlunya, dulu keluar tepi kanan
  // pada lebar 570); di ponsel dipecah per properti dan ditulis di bawah teks kepala.
  const kp=_cad4Kepala(ctx,W,['Nilai geometri tetap '+nilai+' mm;','yang berubah hanya tampilannya'],' ');
  const gayaTeks=['AnnotationStyle "ISO-A4":','FontSize '+font.toFixed(1),'ArrowSize '+panah.toFixed(1),'Decimals '+dec,'ExtLines '+ext.toFixed(1)], gayaSep=['',' ',' · ',' · ',' · '];
  ctx.fillStyle='rgba(168,85,247,'+(0.5+0.5*denyut)+')'; ctx.font="10px 'JetBrains Mono',monospace";
  if(!sempit) _ttlTeks(ctx,gayaTeks.map((b,i)=>i?gayaSep[i]+b:b).join(''),X(0),Y(60)-40,W-X(0)-8);
  else _cad4Baris(ctx,_cad4Pecah(ctx,gayaTeks,gayaSep,W-24),12,18+kp.baris.length*kp.lh+4,W-24,13);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font=kp.font;
  _cad4Baris(ctx,kp.baris,12,18,W-24,kp.lh);
  _ttlTulis('formatInfo','Decimals '+dec+' menampilkan "'+teks+'" dari nilai '+nilai+'; FontSize/ArrowSize dalam mm kertas (ISO: teks 3,5 mm, panah 2–3 mm untuk A4); ExtLines mengatur seberapa jauh garis perpanjangan melewati garis dimensi');
  if(_ttlJalan('format')){_fmFrame++; requestAnimationFrame(drawFormat);}
}

_TTL_DAFTAR.push(['cvJenis',()=>drawJenis(),'jenis',['sl_jn_a','sl_jn_b','sl_jn_d','sl_jn_c']]);
_TTL_DAFTAR.push(['cvChain',()=>drawChain(),'chain',['sl_ch_n','sl_ch_t','sl_ch_l']]);
_TTL_DAFTAR.push(['cvSektor',()=>drawSektor(),'sektor',['sl_sk_r','sl_sk_th','sl_sk_L','sl_sk_d']]);
_TTL_DAFTAR.push(['cvFormat',()=>drawFormat(),'format',['sl_fm_font','sl_fm_panah','sl_fm_dec','sl_fm_ext']]);
_ttlMulai();
