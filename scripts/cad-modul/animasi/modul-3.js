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
// Garis yang harus dihindari label (alat periksa menghitung garis yang mencoret kotak tinta teks):
// {pts, lw} dengan titik tiap ≤ 1,5 px di sepanjang polyline (_cad3Ruas) atau busur (_cad3Busur).
function _cad3Ruas(pts,lw){const out=[pts[0]]; for(let i=1;i<pts.length;i++){const [x1,y1]=pts[i-1],[x2,y2]=pts[i], n=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)/1.5)); for(let j=1;j<=n;j++) out.push([x1+(x2-x1)*j/n,y1+(y2-y1)*j/n]);} return {pts:out,lw:lw||1};}
function _cad3Busur(cx,cy,r,a0,a1,lw){const n=Math.max(8,Math.ceil(Math.abs(a1-a0)*r/1.5)), p=[]; for(let i=0;i<=n;i++){const t=a0+(a1-a0)*i/n; p.push([cx+r*Math.cos(t),cy+r*Math.sin(t)]);} return {pts:p,lw:lw||1};}
// Banyaknya titik garis di dalam kotak k = [x0,y0,x1,y1] yang diperlebar celah + setengah tebal garis.
function _cad3Kena(k,garis,celah){let n=0; for(const g of garis){const e=celah+g.lw/2; for(const [x,y] of g.pts) if(x>k[0]-e&&x<k[2]+e&&y>k[1]-e&&y<k[3]+e) n++;} return n;}
// Menaruh label rata kiri tanpa saling menimpa dan tanpa dicoret garis. label = [{s, warna, calon:[[x,y],...]}]
// (font 10 px; [x,y] = awal garis dasar). Untuk tiap label dipilih calon pertama yang, sesudah dijepit ke dalam
// batas [x0,y0,x1,y1], tidak mengiris kotak di `terpakai` dan (bila `garis` diberikan) berjarak ≥ 2 px dari tiap
// garis; bila semua calon kena, dipakai calon dengan pelanggaran terkecil. Kotak yang dipilih ditambahkan ke
// `terpakai` (jarak 2 px), jadi urutan label = urutan prioritas.
function _cad3Tata(ctx,label,terpakai,batas,garis){
  const iris=(p,q)=>Math.max(0,Math.min(p[2],q[2])-Math.max(p[0],q[0]))*Math.max(0,Math.min(p[3],q[3])-Math.max(p[1],q[1]));
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  label.forEach(L=>{
    const u=ctx.measureText(L.s), kr=u.actualBoundingBoxLeft, kn=u.actualBoundingBoxRight, at=u.actualBoundingBoxAscent, bw=u.actualBoundingBoxDescent;
    let pilih=null, sisa=Infinity;
    for(const [cx,cy] of L.calon){
      const x=Math.max(batas[0]+kr,Math.min(batas[2]-kn,cx)), y=Math.max(batas[1]+at,Math.min(batas[3]-bw,cy));
      const k=[x-kr-2,y-at-2,x+kn+2,y+bw+2], luas=terpakai.reduce((t,q)=>t+iris(k,q),0)+(garis?1e4*_cad3Kena([x-kr,y-at,x+kn,y+bw],garis,2):0);
      if(luas<sisa){sisa=luas; pilih=[x,y,k];}
      if(!luas) break;
    }
    terpakai.push(pilih[2]); ctx.fillStyle=L.warna; ctx.fillText(L.s,pilih[0],pilih[1]);
  });
}
// Calon untuk _cad3Tata dari titik-titik pusat: awal garis dasar agar kotak tinta s (10 px) berpusat di tiap titik.
function _cad3Pusat(ctx,s,pusat){ctx.font="10px 'JetBrains Mono',monospace"; const u=ctx.measureText(s); return pusat.map(([cx,cy])=>[cx-(u.actualBoundingBoxRight-u.actualBoundingBoxLeft)/2,cy+(u.actualBoundingBoxAscent-u.actualBoundingBoxDescent)/2]);}
// Titik-titik pusat pada lingkaran-lingkaran berjari-jari rs di sekitar p (16 arah), untuk label satu huruf.
function _cad3Cincin(p,rs){const out=[]; rs.forEach(r=>{for(let i=0;i<16;i++){const t=i*Math.PI/8; out.push([p[0]+r*Math.cos(t),p[1]-r*Math.sin(t)]);}}); return out;}
// Baris nilai berwarna di tempat tetap (tidak meloncat antarfase): [tampil, warna, teks], mulai (x, y) berjarak lh.
function _cad3Nilai(ctx,baris,x,y,lh,maxW){ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='left'; baris.forEach(([tampil,w,s],i)=>{if(tampil){ctx.fillStyle=w; _ttlTeks(ctx,s,x,y+i*lh,maxW);}});}
// Tata letak nilai: kolom kanan bila kolom itu memberi skala gambar yang tidak lebih kecil daripada menaruh
// baris nilai di bawah teks kepala. lebarMm/tinggiMm = bidang kisi, wNilai = lebar teks nilai terpanjang,
// yAtas = batas bawah baris nilai di bawah teks kepala. Kembali: {kolom, sk}.
function _cad3Letak(W,H,lebarMm,tinggiMm,wNilai,yAtas){
  const skKolom=Math.min((H-60)/tinggiMm,(W-108-wNilai)/lebarMm), skAtas=Math.min((W-76)/lebarMm,(H-34-yAtas)/tinggiMm);
  return skKolom>=skAtas?{kolom:true,sk:Math.max(0.05,skKolom)}:{kolom:false,sk:Math.max(0.05,skAtas)};
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
  // Ponsel: kanvas sedikit ditinggikan agar baris-baris nilai ukur muat di atas segitiga.
  const k=_ttlKanvas('cvUkur',320); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const a=_ttlNilai('sl_uk_a',120), c=_ttlNilai('sl_uk_c',40), h=_ttlNilai('sl_uk_h',70);
  _ttlTulis('v_uk_a',a.toFixed(0)); _ttlTulis('v_uk_c',c.toFixed(0)); _ttlTulis('v_uk_h',h.toFixed(0));
  const fase=_ttlJalan('ukur')?Math.floor((_ukFrame/80)%3):3;
  const frase=[['Shape.CenterOfMass →','titik berat G'],['Std Measure Distance:','vertex A → edge BC'],['Std Measure Angle:','edge AB dan edge BC'],['Tiga pengukuran sekaligus']];
  const kp=_cad3Kepala(ctx,W,frase[fase],' '), kotakKepala=_cad3KotakBaris(ctx,kp.baris,12,18,kp.lh);
  const nMaks=Math.max(...frase.map(f=>_cad3Pecah(ctx,f,' ',W-24).length)), yLeg=18+nMaks*kp.lh+3;
  const G=[(a+c)/3,h/3];
  // kaki tegak lurus dari A ke BC
  const bx=c-a, by=h, L2=bx*bx+by*by, tt=((0-a)*bx+(0-0)*by)/L2, F=[a+tt*bx,tt*by];
  const dAG=Math.hypot(c-G[0],h-G[1]), dABC=Math.abs(a*h)/Math.sqrt((c-a)**2+h*h), sudutB=Math.atan2(h,a-c)*180/Math.PI;
  const tB='∠B = '+sudutB.toFixed(3)+'°', tG='G ('+G[0].toFixed(2)+', '+G[1].toFixed(2)+')', tCG='CG = '+dAG.toFixed(3), tD='d(A, BC) = '+dABC.toFixed(3);
  // Nilai ukur ditulis sebagai baris berwarna (warna garis ukurnya) di tempat tetap, tidak meloncat antarfase:
  // di kolom kanan bila kolom itu memberi segitiga yang lebih besar, selain itu di bawah teks fase. Dulu di layar
  // lebar nilai itu menempel di dalam segitiga dan dicoret median, sisi, dan sumbu.
  ctx.font="10px 'JetBrains Mono',monospace"; const wNilai=Math.max(...[tG,tCG,tD,tB].map(s=>ctx.measureText(s).width));
  // Bila sudut B tumpul (c > a), kaki tegak lurus F jatuh di perpanjangan CB di bawah sumbu X: kisi diperpanjang
  // ke bawah agar F tetap di dalam kanvas (dulu keluar tepi bawah).
  const yB=Math.min(-10,10*Math.floor((F[1]-6)/10)), tinggi=120-yB;
  const tata=_cad3Letak(W,H,200,tinggi,wNilai,yLeg+3*kp.lh+6);
  const {X,Y}=_cad3Kisi(ctx,W,H,200,tinggi,52,34,10,-yB,tata.sk);
  const A=[0,0],B=[a,0],C=[c,h], P=q=>[X(q[0]),Y(q[1])];
  // Semua garis (termasuk garis ukur fase lain) dicatat untuk dihindari label titik, sehingga label C dan G
  // tidak berpindah tempat antarfase.
  const garis=[_cad3Ruas([[X(-10),Y(0)],[X(190),Y(0)]],1.4),_cad3Ruas([[X(0),Y(yB)],[X(0),Y(120)]],1.4),_cad3Ruas([A,B,C,A].map(P),2)];
  _cad3Poli(ctx,X,Y,[A,B,C],'rgba(34,211,238,.14)','#22d3ee',2);
  // median ke titik berat
  ctx.strokeStyle='rgba(148,163,184,.35)'; ctx.setLineDash([3,3]); ctx.lineWidth=1;
  [[A,[(a+c)/2,h/2]],[B,[c/2,h/2]],[C,[a/2,0]]].forEach(([p,q])=>{ctx.beginPath(); ctx.moveTo(X(p[0]),Y(p[1])); ctx.lineTo(X(q[0]),Y(q[1])); ctx.stroke(); garis.push(_cad3Ruas([P(p),P(q)],1));}); ctx.setLineDash([]);
  _cad3Titik(ctx,X(G[0]),Y(G[1]),'#00e09e',4.5);
  // |a − c|: bila C di kanan B (c > a) radius busur tidak boleh negatif (arc melempar galat).
  const rB=Math.min(Math.abs(a-c),40)*0.35*(X(1)-X(0));
  garis.push(_cad3Ruas([P(C),P(G)],1.6),_cad3Ruas([P(A),P(F)],1.6)); if(rB>0) garis.push(_cad3Busur(X(a),Y(0),rB,Math.PI,Math.PI+Math.atan2(h,a-c),1.2));
  if(fase===0||fase===3){ctx.strokeStyle='#00e09e'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(X(c),Y(h)); ctx.lineTo(X(G[0]),Y(G[1])); ctx.stroke();}
  if(fase===1||fase===3){ctx.strokeStyle='#f59e0b'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(F[0]),Y(F[1])); ctx.stroke(); _cad3Titik(ctx,X(F[0]),Y(F[1]),'#f59e0b',3);}
  // Busur ∠B di antara BA (arah kiri) dan BC (ke atas); dulu tercermin ke bawah sumbu X.
  if((fase===2||fase===3)&&rB>0){ctx.strokeStyle='#a855f7'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(X(a),Y(0),rB,Math.PI,Math.PI+Math.atan2(h,a-c)); ctx.stroke();}
  // Label titik: A dan B di bawah sumbu X; C dan G dipilih dari calon di sekeliling titiknya yang tidak dicoret
  // sisi, median, sumbu, atau garis ukur (dulu C dicoret sumbu Y saat c = 0 dan G dicoret median).
  ctx.fillStyle='#e2e8f0'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  const titikLbl=[['A',X(0)-12,Y(0)+12],['B',X(a)+4,Y(0)+12]];
  titikLbl.forEach(([s,x,y])=>ctx.fillText(s,x,y));
  const xN=tata.kolom?X(190)+24:12, yN=tata.kolom?H*0.16:yLeg, lhN=tata.kolom?18:kp.lh;
  const terpakai=titikLbl.map(([s,x,y])=>_cad3Kotak(ctx,s,x,y,2)); terpakai.push(kotakKepala,[xN-2,yN-11,xN+wNilai+2,yN+3*lhN+5]);
  const pc=P(C), pg=P(G);
  _cad3Tata(ctx,[
    {s:'C',warna:'#e2e8f0',calon:[[pc[0]+4,pc[1]-5],[pc[0]-10,pc[1]-5],[pc[0]-3,pc[1]-9],[pc[0]+7,pc[1]+4],[pc[0]-13,pc[1]+4],...
      _cad3Pusat(ctx,'C',_cad3Cincin(pc,[11,16]))]},
    {s:'G',warna:'#00e09e',calon:_cad3Pusat(ctx,'G',_cad3Cincin(pg,[11,15,20,26]))}],terpakai,[4,4,W-4,H-4],garis);
  // Teks fase: di ponsel dipecah per bagian kalimat.
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font=sempit?"10px 'JetBrains Mono',monospace":"11px 'JetBrains Mono',monospace";
  _cad3Baris(ctx,kp.baris,12,18,W-24,kp.lh);
  _cad3Nilai(ctx,[[true,'#00e09e',tG],[fase===0||fase===3,'#00e09e',tCG],[fase===1||fase===3,'#f59e0b',tD],[fase===2||fase===3,'#a855f7',tB]],xN,yN,lhN,W-xN-8);
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
  const L=_ttlNilai('sl_pt_L',100), thMaks=_ttlNilai('sl_pt_th',40);
  _ttlTulis('v_pt_L',L.toFixed(0)); _ttlTulis('v_pt_th',thMaks.toFixed(0)+'°');
  const th=_ttlJalan('putar')?thMaks*(0.5+0.5*Math.sin(_ptFrame/50-Math.PI/2)):thMaks;
  const rad=th*Math.PI/180, radM=thMaks*Math.PI/180;
  const d=2*L*Math.sin(rad/2), tD='d = 2L·sin(θ/2) = '+d.toFixed(3);
  // Bidang kisi mengikuti L dan θ slider (tetap selama animasi): garis yang diputar sampai 120° dulu keluar tepi
  // kiri dan menembus teks kepala.
  const xMin=Math.min(-20,10*Math.floor((L*Math.cos(radM)-12)/10)), xMax=Math.max(160,10*Math.ceil((L+20)/10));
  const yMax=Math.max(120,10*Math.ceil((L*(radM>=Math.PI/2?1:Math.sin(radM))+14)/10)), lebar=xMax-xMin, tinggi=yMax+20;
  const kp=_cad3Kepala(ctx,W,['Draft Rotate (Copy):','pusat (0,0),','sudut acuan 0°,','sudut rotasi θ'],' '), kotakKepala=_cad3KotakBaris(ctx,kp.baris,12,18,kp.lh);
  const yBawah=18+kp.baris.length*kp.lh;
  // Nilai d di kolom kanan bila kolom itu memberi gambar yang lebih besar, selain itu satu baris di bawah teks
  // kepala (dulu di layar lebar menempel di tengah tali busur dan dicoret sumbu X saat θ kecil).
  ctx.font="10px 'JetBrains Mono',monospace"; const wD=ctx.measureText('d = 2L·sin(θ/2) = 000.000').width;
  const tata=_cad3Letak(W,H,lebar,tinggi,wD,yBawah+8);
  const {X,Y}=_cad3Kisi(ctx,W,H,lebar,tinggi,52,34,-xMin,20,tata.sk);
  const P=[L,0], Q=[L*Math.cos(rad),L*Math.sin(rad)], s1=X(1)-X(0), O=[X(0),Y(0)], rr=Math.min(L,40)*0.5*s1;
  ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(P[0]),Y(P[1])); ctx.stroke();
  ctx.strokeStyle='#f59e0b'; ctx.beginPath(); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(Q[0]),Y(Q[1])); ctx.stroke();
  ctx.strokeStyle='rgba(245,158,11,.5)'; ctx.lineWidth=1; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.arc(X(0),Y(0),L*s1,-rad,0); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle='#a855f7'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(X(0),Y(0),rr,-rad,0); ctx.stroke();
  ctx.strokeStyle='#00e09e'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(X(P[0]),Y(P[1])); ctx.lineTo(X(Q[0]),Y(Q[1])); ctx.stroke();
  _cad3Titik(ctx,X(P[0]),Y(P[1]),'#22d3ee'); _cad3Titik(ctx,X(Q[0]),Y(Q[1]),'#f59e0b'); _cad3Titik(ctx,X(0),Y(0),'#e2e8f0',3);
  const garis=[_cad3Ruas([[X(xMin),Y(0)],[X(xMax),Y(0)]],2.4),_cad3Ruas([[X(0),Y(-20)],[X(0),Y(yMax)]],1.4),_cad3Ruas([O,[X(Q[0]),Y(Q[1])]],2.4),
    _cad3Busur(O[0],O[1],L*s1,-rad,0,1),_cad3Busur(O[0],O[1],rr,-rad,0,1.2),_cad3Ruas([[X(P[0]),Y(P[1])],[X(Q[0]),Y(Q[1])]],1.6)];
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.textAlign='left'; ctx.font=W<_TTL_SEMPIT?"10px 'JetBrains Mono',monospace":"11px 'JetBrains Mono',monospace";
  _cad3Baris(ctx,kp.baris,12,18,W-24,kp.lh);
  const xN=tata.kolom?X(xMax)+24:12, yN=tata.kolom?H*0.16:yBawah+2;
  ctx.fillStyle='#00e09e'; ctx.font="10px 'JetBrains Mono',monospace"; _ttlTeks(ctx,tD,xN,yN,W-xN-8);
  // Label θ: di dalam sudut sepanjang garis bagi (bagian kuadran I bila θ > 90°), sedekat mungkin dengan busur
  // dan tetap di dalam segitiga O–P–Q, tanpa dicoret kaki sudut, busur, tali busur, maupun sumbu. Bila sudutnya
  // terlalu sempit: di bawah sumbu X dekat titik asal, lalu di atas kaki yang diputar.
  const tTh='θ = '+th.toFixed(1)+'°', bagi=Math.min(rad,Math.PI/2)/2, rTali=L*s1*Math.cos(rad/2), pusat=[];
  for(let r=rr+12;r<=Math.max(rr+12,rTali-6);r+=6) pusat.push([O[0]+r*Math.cos(bagi),O[1]-r*Math.sin(bagi)]);
  pusat.push([O[0]+rr+34,O[1]+11],[O[0]+48,O[1]+11],[O[0]+rr+60,O[1]+11]);
  [0.35,0.6].forEach(f=>{const t=Math.min(rad+f,Math.PI/2+0.3); [26,44].forEach(r=>pusat.push([O[0]+(rr+r)*Math.cos(t),O[1]-(rr+r)*Math.sin(t)]));});
  const terpakai=[kotakKepala,[xN-2,yN-11,xN+wD+2,yN+5],...[P,Q,[0,0]].map(q=>[X(q[0])-5,Y(q[1])-5,X(q[0])+5,Y(q[1])+5])];
  _cad3Tata(ctx,[{s:tTh,warna:'#a855f7',calon:_cad3Pusat(ctx,tTh,pusat)}],terpakai,[4,4,W-4,H-4],garis);
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
  const dx=_ttlNilai('sl_tf_dx',80), dy=_ttlNilai('sl_tf_dy',45), th=_ttlNilai('sl_tf_th',30), kf=_ttlNilai('sl_tf_k',1.5);
  _ttlTulis('v_tf_dx',dx.toFixed(0)); _ttlTulis('v_tf_dy',dy.toFixed(0)); _ttlTulis('v_tf_th',th.toFixed(0)+'°'); _ttlTulis('v_tf_k',kf.toFixed(2));
  const a=100,b=40, rad=th*Math.PI/180;
  const fase=_ttlJalan('transform')?Math.floor((_tfFrame/90)%3):3;
  const frase=[['Draft Move (Copy)','vektor (dx, dy)'],['Draft Rotate','di titik asal','sebesar θ'],['Draft Scale (Copy)','faktor k','di titik asal'],['Tiga transformasi','pada persegi panjang',a+' × '+b]];
  const kp=_cad3Kepala(ctx,W,frase[fase],' ');
  // Tempat baris nilai tetap (dihitung dari teks fase terpanjang) agar tidak meloncat antarfase.
  const nMaks=Math.max(...frase.map(f=>_cad3Pecah(ctx,f,' ',W-24).length)), yLeg=18+nMaks*kp.lh+3;
  const ymax=a*Math.sin(rad)+b*Math.cos(rad), xmin=-b*Math.sin(rad);
  const lMove='Move |v| = '+Math.hypot(dx,dy).toFixed(3), lRot='Rotate θ: BoundBox YMax = '+ymax.toFixed(3), lSkala='Scale k: luas = k²·'+(a*b)+' = '+(kf*kf*a*b).toFixed(1);
  // Label tiap transformasi ditulis sebagai baris berwarna sama dengan bentuknya: di kolom kanan bila kolom itu
  // memberi gambar yang lebih besar, selain itu di bawah teks kepala. Dulu di layar lebar label menempel pada
  // bentuknya dan dicoret tepi bentuk lain, kotak pembatas, dan sumbu.
  ctx.font="10px 'JetBrains Mono',monospace"; const wNilai=Math.max(...[lMove,lRot,lSkala].map(s=>ctx.measureText(s).width));
  const tata=_cad3Letak(W,H,300,180,wNilai,yLeg+2*kp.lh+6);
  const {X,Y}=_cad3Kisi(ctx,W,H,300,180,52,34,40,30,tata.sk);
  const asal=[[0,0],[a,0],[a,b],[0,b]];
  _cad3Poli(ctx,X,Y,asal,'rgba(34,211,238,.16)','#22d3ee',2);
  const pindah=asal.map(([x,y])=>[x+dx,y+dy]);
  const putar=asal.map(([x,y])=>[x*Math.cos(rad)-y*Math.sin(rad),x*Math.sin(rad)+y*Math.cos(rad)]);
  const skala=asal.map(([x,y])=>[x*kf,y*kf]);
  if(fase===0||fase===3){_cad3Poli(ctx,X,Y,pindah,'rgba(0,224,158,.10)','#00e09e',1.6,[6,4]); ctx.strokeStyle='#00e09e'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(dx),Y(dy)); ctx.stroke();}
  if(fase===1||fase===3){_cad3Poli(ctx,X,Y,putar,'rgba(245,158,11,.10)','#f59e0b',1.6); ctx.strokeStyle='rgba(245,158,11,.5)'; ctx.setLineDash([3,3]); ctx.strokeRect(X(xmin),Y(ymax),(a*Math.cos(rad)-xmin)*(X(1)-X(0)),ymax*(X(1)-X(0))); ctx.setLineDash([]);}
  if(fase===2||fase===3){_cad3Poli(ctx,X,Y,skala,null,'#a855f7',1.6,[2,3]);}
  _cad3Titik(ctx,X(0),Y(0),'#e2e8f0',3);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.textAlign='left';
  _cad3Baris(ctx,kp.baris,12,18,W-24,kp.lh);
  const xN=tata.kolom?X(260)+24:12, yN=tata.kolom?H*0.16:yLeg, lhN=tata.kolom?18:kp.lh;
  _cad3Nilai(ctx,[[fase===0||fase===3,'#00e09e',lMove],[fase===1||fase===3,'#f59e0b',lRot],[fase===2||fase===3,'#a855f7',lSkala]],xN,yN,lhN,W-xN-8);
  _ttlTulis('transformInfo','Move: jarak sudut asal–salinan √('+dx+'² + '+dy+'²) = '+Math.hypot(dx,dy).toFixed(3)+' mm · Rotate: YMax = a·sin θ + b·cos θ = '+(a*Math.sin(rad)+b*Math.cos(rad)).toFixed(3)+' mm · Scale: luas '+(kf*kf*a*b).toFixed(1)+' mm² (k² = '+(kf*kf).toFixed(3)+')');
  if(_ttlJalan('transform')){_tfFrame++; requestAnimationFrame(drawTransform);}
}

_TTL_DAFTAR.push(['cvBentuk',()=>drawBentuk(),'bentuk',['sl_bt_n','sl_bt_R','sl_bt_mode']]);
_TTL_DAFTAR.push(['cvUkur',()=>drawUkur(),'ukur',['sl_uk_a','sl_uk_c','sl_uk_h']]);
_TTL_DAFTAR.push(['cvPutar',()=>drawPutar(),'putar',['sl_pt_L','sl_pt_th']]);
_TTL_DAFTAR.push(['cvTransform',()=>drawTransform(),'transform',['sl_tf_dx','sl_tf_dy','sl_tf_th','sl_tf_k']]);
_ttlMulai();
