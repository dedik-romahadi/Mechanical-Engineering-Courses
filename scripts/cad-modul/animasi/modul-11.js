// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 11 PEMODELAN CAD — Perakitan Komponen dan Analisis Sistem
// Kanvas: cvEngkol, cvPusatMassa, cvSabuk, cvClearance (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// Layar sempit (W < _TTL_SEMPIT): gambar di atas, keterangan ditumpuk di bawahnya pada kanvas yang lebih tinggi.
// ════════════════════════════════════════════════════════════
const _C11C='#22d3ee', _C11A='#f59e0b', _C11G='#00e09e', _C11R='#ef4444', _C11V='#a855f7', _C11P='#ec4899', _C11T='rgba(226,232,240,.92)', _C11M='rgba(148,163,184,.85)';
const _F11_9="9px 'JetBrains Mono',monospace", _F11_10="10px 'JetBrains Mono',monospace", _F11_11="11px 'JetBrains Mono',monospace";
// ── Garis tercatat dan label bebas garis ─────────────────────────────────────────────
// Selama satu bingkai, setiap garis yang di-stroke dicatat sebagai ruas (setengah tebal e, kotak pembatas, dan tanda
// "lunak" untuk garis bantu putus-putus atau samar). Label yang menempel pada gambar ditulis SESUDAH semua garis lewat
// _cad11Label: dipakai calon posisi pertama yang tintanya berjarak ≥ 1,5 px dari semua ruas, tidak menimpa teks lain,
// dan di dalam kanvas. Di layar lebar calon pertama adalah posisi semula, jadi label hanya bergeser bila akan duduk di
// atas garis. Hanya bila tak ada calon bebas, label memakai pelat _ttlLabel di calon yang sekadar menyentuh garis bantu
// lunak (tidak pernah menutupi garis gambar utama, kecuali benar-benar tidak ada pilihan lain).
const _G11={r:[],k:[],W:0,H:0};
function _cad11Awal(W,H){_G11.r=[]; _G11.k=[]; _G11.W=W; _G11.H=H;}
function _cad11Alfa(w){const m=/rgba\(([^)]*)\)/.exec(String(w)); return m?+m[1].split(',')[3]:1;}
function _cad11Ruas(x1,y1,x2,y2,lw,lunak){_G11.r.push([x1,y1,x2,y2,(lw||1)/2,Math.min(x1,x2),Math.min(y1,y2),Math.max(x1,x2),Math.max(y1,y2),!!lunak]);}
function _cad11RuasBusur(cx,cy,r,a0,a1,lw,lunak){const n=Math.max(8,Math.ceil(Math.abs(a1-a0)*r/5)); let px=cx+r*Math.cos(a0), py=cy+r*Math.sin(a0); for(let i=1;i<=n;i++){const a=a0+(a1-a0)*i/n, qx=cx+r*Math.cos(a), qy=cy+r*Math.sin(a); _cad11Ruas(px,py,qx,qy,lw,lunak); px=qx; py=qy;}}
function _cad11RuasJalur(titik,lw,tutup,lunak){for(let i=1;i<titik.length;i++) _cad11Ruas(titik[i-1][0],titik[i-1][1],titik[i][0],titik[i][1],lw,lunak); if(tutup&&titik.length>2) _cad11Ruas(titik[titik.length-1][0],titik[titik.length-1][1],titik[0][0],titik[0][1],lw,lunak);}
// Liang–Barsky: true bila ruas (x1,y1)-(x2,y2) masuk persegi [a,b]-[c,d].
function _cad11Klip(x1,y1,x2,y2,a,b,c,d){let t0=0,t1=1; const dx=x2-x1, dy=y2-y1, p=[-dx,dx,-dy,dy], q=[x1-a,c-x1,y1-b,d-y1];
  for(let i=0;i<4;i++){if(p[i]===0){if(q[i]<0) return false;} else {const t=q[i]/p[i]; if(p[i]<0){if(t>t1) return false; if(t>t0) t0=t;} else {if(t<t0) return false; if(t<t1) t1=t;}}} return t0<=t1;}
// 0 = kotak k bebas garis, 1 = hanya disentuh garis bantu lunak, 2 = dilewati garis gambar.
function _cad11Kena(k,m){let h=0; for(const s of _G11.r){const e=s[4]+m; if(s[5]>k[2]+e||s[7]<k[0]-e||s[6]>k[3]+e||s[8]<k[1]-e) continue; if(_cad11Klip(s[0],s[1],s[2],s[3],k[0]-e,k[1]-e,k[2]+e,k[3]+e)){if(!s[9]) return 2; h=1;}} return h;}
function _cad11Tinta(ctx,s,x,y){const u=ctx.measureText(s); return [x-u.actualBoundingBoxLeft,y-u.actualBoundingBoxAscent,x+u.actualBoundingBoxRight,y+u.actualBoundingBoxDescent];}
function _cad11Daftar(k){_G11.k.push(k);}
function _cad11Tindih(k){return _G11.k.some(b=>Math.min(k[2],b[2])-Math.max(k[0],b[0])>-2&&Math.min(k[3],b[3])-Math.max(k[1],b[1])>-2);}
// calon = [[x, y, align, font?], ...]. Mengembalikan kotak tinta label yang ditulis.
function _cad11Label(ctx,s,calon,warna,font){
  let lunak=null, cadangan=null;
  for(const [x,y,al,f] of calon){
    ctx.font=f||font||_F11_10; ctx.textAlign=al||'left'; const k=_cad11Tinta(ctx,s,x,y);
    if(k[0]<2||k[1]<2||k[2]>_G11.W-2||k[3]>_G11.H-2||_cad11Tindih(k)) continue;
    const h=_cad11Kena(k,1.5);
    if(!h){ctx.fillStyle=warna; ctx.fillText(s,x,y); _cad11Daftar(k); return k;}
    if(h===1&&!lunak) lunak=[x,y,al,f,k]; if(!cadangan) cadangan=[x,y,al,f,k];
  }
  const [x,y,al,f,k]=lunak||cadangan||[calon[0][0],calon[0][1],calon[0][2],calon[0][3],[0,0,0,0]];
  ctx.font=f||font||_F11_10; ctx.textAlign=al||'left'; ctx.fillStyle=warna; _ttlLabel(ctx,s,x,y,{pad:1}); _cad11Daftar(k); return k;
}
// Calon melingkar di sekitar (x, y): cincin berjari-jari d0, d0+4, …, d1; 16 arah per cincin mulai dari arah a0
// (radian, sumbu y ke atas) lalu bergantian ke dua sisinya. Label rata tengah, pusat tintanya di titik calon.
function _cad11Cincin(x,y,d0,d1,a0){const c=[]; for(let d=d0;d<=d1;d+=4) for(let i=0;i<16;i++){const a=(a0||0)+(i%2?1:-1)*Math.ceil(i/2)*Math.PI/8; c.push([x+d*Math.cos(a),y-d*Math.sin(a)+3.5,'center']);} return c;}
// Garis yang dicatat: pembungkus _ttlGaris (putus-putus atau samar = garis bantu lunak).
function _cad11G(ctx,x1,y1,x2,y2,warna,lebar,putus){_cad11Ruas(x1,y1,x2,y2,lebar||1,(putus&&putus.length)||_cad11Alfa(warna)<=0.4); _ttlGaris(ctx,x1,y1,x2,y2,warna,lebar,putus);}
function _cad11Teks(ctx,s,x,y,warna,font,align){ctx.fillStyle=warna; ctx.font=font||"11px 'JetBrains Mono',monospace"; ctx.textAlign=align||'left'; ctx.fillText(s,x,y); _cad11Daftar(_cad11Tinta(ctx,s,x,y));}
// Memecah string per kata, tetapi "nama = nilai satuan", operasi seperti "a × b", "A ∩ B", "R² + x" dan panah dengan kata sesudahnya tetap satu potongan.
function _cad11Kata(s){const o=[]; for(const t of String(s).split(/(?= )/)){const p=o[o.length-1]; if(p!==undefined&&(/^ (=|∩|×|\+|−|mm³|mm²|mm|rpm|µm|°)(?![\wÀ-ɏ])/.test(t)||/[=→∩×+−]$/.test(p))) o[o.length-1]=p+t; else o.push(t);} return o;}
// Menulis teks agar muat dalam lebar maxW (perataan align). bagian = string (dipecah per kata) atau array potongan
// yang bila digabung sama persis dengan teks utuhnya (dipecah hanya di batas potongan, spasi awal baris dibuang).
// Bila teks utuh tidak muat, huruf boleh dikecilkan sampai 85% (min 8 px) asal tetap satu baris; bila masih
// kepanjangan, teks dipecah dengan ukuran huruf semula, baris berjarak lh. Potongan yang sendirian masih kepanjangan
// diserahkan ke _ttlTeks. Mengembalikan tinggi tambahan akibat pemecahan: 0 bila satu baris, (n − 1)·lh bila n baris.
function _cad11Muat(ctx,bagian,x,y,maxW,warna,font,align,lh){
  ctx.fillStyle=warna; ctx.font=font||_F11_11; ctx.textAlign=align||'left';
  const f=ctx.font, px=parseFloat((/(\d+(?:\.\d+)?)px/.exec(f)||[0,11])[1]);
  const potong=Array.isArray(bagian)?bagian:_cad11Kata(bagian), utuh=potong.join('');
  lh=lh||Math.round(px*1.3);
  for(let uk=px;uk>=Math.max(8,px*0.85)-1e-6;uk-=0.5){
    ctx.font=f.replace(/\d+(?:\.\d+)?px/,uk+'px');
    if(ctx.measureText(utuh).width<=maxW){ctx.fillText(utuh,x,y); _cad11Daftar(_cad11Tinta(ctx,utuh,x,y)); ctx.font=f; return 0;}
  }
  ctx.font=f;
  const baris=[]; let b='';
  for(const p of potong){const coba=b+p; if(b&&ctx.measureText(coba).width>maxW){baris.push(b); b=p.replace(/^ +/,'');} else b=coba;}
  if(b) baris.push(b);
  let yy=y;
  for(const s of baris){_cad11Daftar(_cad11Tinta(ctx,s,x,yy)); yy=_ttlTeks(ctx,s,x,yy,maxW,{lh});}
  ctx.font=f; return yy-y-lh;
}
function _cad11Lingkar(ctx,x,y,r,isi,garis,lebar,putus){if(garis) _cad11RuasBusur(x,y,Math.max(0.1,r),0,2*Math.PI,lebar||1.2,(putus&&putus.length)||_cad11Alfa(garis)<=0.4); ctx.setLineDash(putus||[]); ctx.beginPath(); ctx.arc(x,y,Math.max(0.1,r),0,Math.PI*2); if(isi){ctx.fillStyle=isi; ctx.fill();} if(garis){ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.2; ctx.stroke();} ctx.setLineDash([]);}
function _cad11Panah(ctx,x1,y1,x2,y2,warna){const a=Math.atan2(y2-y1,x2-x1); _cad11G(ctx,x1,y1,x2,y2,warna,1.2); _cad11RuasJalur([[x2,y2],[x2-7*Math.cos(a)+3.5*Math.sin(a),y2-7*Math.sin(a)-3.5*Math.cos(a)],[x2-7*Math.cos(a)-3.5*Math.sin(a),y2-7*Math.sin(a)+3.5*Math.cos(a)]],1,true); ctx.fillStyle=warna; ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-7*Math.cos(a)+3.5*Math.sin(a),y2-7*Math.sin(a)-3.5*Math.cos(a)); ctx.lineTo(x2-7*Math.cos(a)-3.5*Math.sin(a),y2-7*Math.sin(a)+3.5*Math.cos(a)); ctx.closePath(); ctx.fill();}
function _cad11Kotak(ctx,x,y,w,h,isi,garis,lebar){_cad11RuasJalur([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],lebar||1.4,true); ctx.fillStyle=isi; ctx.fillRect(x,y,w,h); ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.4; ctx.strokeRect(x,y,w,h);}
// Tinggi kanvas di layar sempit menurut lebarnya: tabel [[lebar batas, tinggi], ...] berurutan naik; dipakai tinggi
// pertama yang batasnya melebihi lebar kanvas (teks dipecah makin banyak baris saat kanvas makin sempit).
function _cad11TinggiSempit(id,tabel){const cv=document.getElementById(id), W=cv?(cv.clientWidth||cv.width):1000; const t=tabel.find(([L])=>W<L); return t?t[1]:tabel[tabel.length-1][1];}
function _cad11X(r,l,th){const s=r*Math.sin(th); return r*Math.cos(th)+Math.sqrt(Math.max(0,l*l-s*s));}
// Menulis baris-baris [teks, warna, font, jarak ke baris berikut] mulai (x, y); baris yang dipecah mendorong baris
// sesudahnya sejauh tinggi tambahannya, jadi posisi di layar lebar tetap sama bila tidak ada yang dipecah.
// Mengembalikan y baris terakhir.
function _cad11Kolom(ctx,baris,x,y,maxW,lh){
  let yy=y;
  baris.forEach(([s,warna,font,jarak],i)=>{yy+=_cad11Muat(ctx,s,x,yy,maxW,warna,font,'left',lh||13); if(i<baris.length-1) yy+=jarak;});
  return yy;
}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Engkol-peluncur: Revolute + Slider menyisakan satu DOF
// ════════════════════════════════════════════════════════════
let _ekFrame=0;
function toggleEngkol(){_ttlToggle('engkol','btnEngkol',drawEngkol);}
window.toggleEngkol=toggleEngkol;
function drawEngkol(){
  const k=_ttlKanvas('cvEngkol',360); if(!k) return; const {ctx,W,H}=k; _cad11Awal(W,H);
  const sempit=W<_TTL_SEMPIT;
  const r=_ttlNilai('sl_ek_r',25), l=Math.max(_ttlNilai('sl_ek_l',90),r+10), thS=_ttlNilai('sl_ek_th',60);
  _ttlTulis('v_ek_r',r.toFixed(0)); _ttlTulis('v_ek_l',l.toFixed(0)); _ttlTulis('v_ek_th',thS.toFixed(0));
  const thD=_ttlJalan('engkol')?(_ekFrame*1.5)%360:thS, th=thD*Math.PI/180;
  const x=_cad11X(r,l,th), xmin=l-r, xmax=l+r, phi=Math.asin(r*Math.sin(th)/l);
  // judul: satu baris di layar lebar; dipecah per frasa bila tidak muat
  const judul=['Engkol r = '+r+' (Revolute O),',' batang l = '+l+' (Revolute A, B),',' peluncur pada rel (Slider)',' — dasar grounded'];
  const yA=sempit?29+_cad11Muat(ctx,judul,12,16,W-24,_C11T,_F11_10,'left',13):18+_cad11Muat(ctx,judul,12,18,W-16,_C11T,_F11_11,'left',14);
  // skala: layar lebar = mekanisme di kiri; layar sempit = selebar kanvas pada pita ±104 px di bawah judul
  let sk, ox, oy;
  if(sempit){sk=Math.max(0.05,Math.min((W-28)/(l+3*r+14),36/r,2)); ox=(W-(l+3*r+14)*sk)/2+r*sk; oy=yA+52;}
  else{sk=Math.max(0.05,Math.min((W*0.56)/(xmax+r+40),(H-80)/(2*r+40),(W*0.58)/(xmax+2*r+24))); ox=W*0.04+(r+10)*sk; oy=H*0.52;}
  const X=v=>ox+v*sk, Y=v=>oy-v*sk;
  // rel dan arsir dasar (grounded)
  const yRel=oy+12*sk;
  _cad11G(ctx,X(xmin-r-8),yRel,X(xmax+r+14),yRel,'rgba(148,163,184,.6)',1.4);
  for(let xx=X(xmin-r-8);xx<X(xmax+r+14);xx+=12) _cad11G(ctx,xx,yRel,xx-6,yRel+8,'rgba(148,163,184,.3)',1);
  _cad11G(ctx,X(xmin-r-8),oy,X(xmax+r+14),oy,'rgba(148,163,184,.25)',1,[5,4]);
  // batas langkah
  [xmin,xmax].forEach(v=>_cad11G(ctx,X(v),oy-16*sk,X(v),yRel,'rgba(0,224,158,.35)',1,[3,3]));
  _cad11Lingkar(ctx,X(0),Y(0),r*sk,null,'rgba(245,158,11,.35)',1,[4,4]);
  const A=[X(r*Math.cos(th)),Y(r*Math.sin(th))], B=[X(x),Y(0)];
  _cad11Kotak(ctx,B[0]-12*sk,oy-10*sk,24*sk,22*sk,'rgba(168,85,247,.25)',_C11V,1.6);
  _cad11G(ctx,A[0],A[1],B[0],B[1],_C11C,Math.max(3,4*sk));
  _cad11G(ctx,X(0),Y(0),A[0],A[1],_C11A,Math.max(4,5*sk));
  [[X(0),Y(0)],A,B].forEach(([px,py])=>_cad11Lingkar(ctx,px,py,4,'#0a101f','#e2e8f0',1.5));
  // sudut θ (di layar sempit busurnya ikut skala)
  const rho=sempit?Math.min(18,0.6*r*sk):18, bis=th/2;
  ctx.strokeStyle=_C11G; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(X(0),Y(0),rho,0,-th,true); ctx.stroke(); _cad11RuasBusur(X(0),Y(0),rho,0,-th,1.2);
  // dimensi x
  const yD=yRel+22;
  _cad11G(ctx,X(0),yRel+4,X(0),yD+6,_C11G,0.8,[3,2]); _cad11G(ctx,B[0],yRel+4,B[0],yD+6,_C11G,0.8,[3,2]);
  _cad11Panah(ctx,X(0),yD,B[0],yD,_C11G); _cad11Panah(ctx,B[0],yD,X(0),yD,_C11G);
  // kolom kanan (layar sempit: ditumpuk di bawah mekanisme): DOF dan rumus
  const tx=sempit?14:W*0.64, ty=sempit?yA+120:H*0.14, jarak=sempit?[16,16,16,16,16]:[18,20,20,18,18];
  const yAkhir=_cad11Kolom(ctx,[
    ['Revolute ×3 + Slider ×1',_C11T,_F11_11,jarak[0]],
    ['F = 3(4 − 1) − 2·4 = 1 DOF',_C11G,_F11_11,jarak[1]],
    ['θ = '+thD.toFixed(0)+'°  →  φ = '+(phi*180/Math.PI).toFixed(2)+'°',_C11A,_F11_11,jarak[2]],
    ['x = r cosθ + √(l² − r² sin²θ)',_C11C,_F11_11,jarak[3]],
    ['  = '+x.toFixed(3)+' mm',_C11G,_F11_11,jarak[4]],
    [['x ∈ ['+xmin+', '+xmax+'],',' langkah 2r = '+(2*r)],_C11M,_F11_10,0]],tx,ty,sempit?W-28:W-tx-8,13);
  // grafik x(θ)
  let gx=tx, gy=H-14, gw=W-12-tx, gh=H*0.34;
  if(sempit){gx=14; gw=W-28; gh=Math.max(30,Math.min(70,H-16-(yAkhir+18))); gy=yAkhir+18+gh;}
  _cad11G(ctx,gx,gy,gx+gw,gy,'rgba(148,163,184,.5)',1); _cad11G(ctx,gx,gy,gx,gy-gh,'rgba(148,163,184,.5)',1);
  const kurva=[]; for(let i=0;i<=72;i++){const tt=i/72*2*Math.PI; kurva.push([gx+i/72*gw,gy-(_cad11X(r,l,tt)-xmin)/(2*r)*gh]);}
  ctx.strokeStyle=_C11C; ctx.lineWidth=1.5; ctx.beginPath(); kurva.forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py)); ctx.stroke(); _cad11RuasJalur(kurva,1.5);
  _cad11Lingkar(ctx,gx+thD/360*gw,gy-(x-xmin)/(2*r)*gh,4,_C11G,null);
  // Label ditulis terakhir, masing-masing di calon posisi pertama yang tidak dilewati garis (di layar lebar: posisi
  // semula lebih dulu). Nama sumbu grafik x(θ) di atas sumbunya, bukan di dalam area kurva.
  const FB="bold 10px 'JetBrains Mono',monospace", FT="bold 11px 'JetBrains Mono',monospace";
  const ur=[Math.cos(th),-Math.sin(th)], up=[-Math.sin(th),-Math.cos(th)];
  const cA=[[A[0]+11*ur[0],A[1]+11*ur[1]+4,'center'],[A[0]+11*up[0],A[1]+11*up[1]+4,'center'],[A[0]-11*up[0],A[1]-11*up[1]+4,'center'],..._cad11Cincin(A[0],A[1],12,40,th)];
  if(!sempit) cA.unshift([A[0]+7,A[1]-7,'left']);
  _cad11Label(ctx,'A',cA,'#e2e8f0',FB);
  const yB=oy-10*sk-6;
  _cad11Label(ctx,'B',[[B[0],yB,'center'],[B[0]+4,yB,'left'],[B[0]-4,yB,'right'],[B[0]+12*sk+4,oy-2,'left'],[B[0]-12*sk-4,oy-2,'right'],..._cad11Cincin(B[0],yB-4,8,40,Math.PI/2)],'#e2e8f0',FB);
  const cO=sempit?[[X(0)-12*Math.cos(bis),Y(0)+12*Math.sin(bis)+4,'center'],..._cad11Cincin(X(0),Y(0),12,44,bis+Math.PI)]
                 :[[X(0)+7,Y(0)-7,'left'],..._cad11Cincin(X(0),Y(0),12,44,th+Math.PI)];
  _cad11Label(ctx,'O',cO,'#e2e8f0',FB);
  const cT=[[X(0)+(rho+8)*Math.cos(bis),Y(0)-(rho+8)*Math.sin(bis)+4,'center'],[X(0)+(rho+13)*Math.cos(bis),Y(0)-(rho+13)*Math.sin(bis)+4,'center'],..._cad11Cincin(X(0),Y(0),rho+9,rho+41,bis)];
  if(!sempit) cT.unshift([X(0)+22,Y(0)-6,'left']);
  _cad11Label(ctx,'θ',cT,_C11G,FT);
  const sX='x = '+x.toFixed(2), dxB=B[0]-X(0);
  _cad11Label(ctx,sX,[[X(0)+dxB/2,yD-5,'center'],[X(0)+dxB/2,yD+15,'center'],[X(0)+dxB*0.72,yD-5,'center'],[X(0)+dxB*0.28,yD-5,'center'],
    [X(0)+dxB*0.72,yD+15,'center'],[X(0)+dxB*0.28,yD+15,'center'],[B[0]+10,yD+4,'left'],[X(0)-10,yD+4,'right'],..._cad11Cincin(X(0)+dxB/2,yD,12,48,-Math.PI/2)],_C11G,_F11_10);
  _cad11Label(ctx,'x(θ)',[[gx+4,gy-gh-4,'left'],[gx+22,gy-gh-4,'left'],[gx+gw,gy-gh-4,'right'],[gx+gw/2,gy-gh-4,'center'],[gx+4,gy-gh+10,'left'],[gx+gw/2,gy-gh/2+3,'center']],_C11M,_F11_9);
  _cad11Label(ctx,'0°',[[gx,gy+10,'left']],_C11M,_F11_9); _cad11Label(ctx,'360°',[[gx+gw,gy+10,'right']],_C11M,_F11_9);
  _ttlTulis('engkolInfo','θ = '+thD.toFixed(0)+'°: x = '+r+'·cos θ + √('+l+'² − '+r+'²·sin² θ) = '+x.toFixed(3)+' mm; kemiringan batang φ = '+(phi*180/Math.PI).toFixed(2)+'°. Titik mati luar x = '+xmax+' (θ = 0°), titik mati dalam x = '+xmin+' (θ = 180°); satu sudut engkol menentukan seluruh posisi karena F = 1.');
  if(_ttlJalan('engkol')){_ekFrame++; requestAnimationFrame(drawEngkol);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Placement komponen menggeser pusat massa rakitan
// ════════════════════════════════════════════════════════════
let _pmFrame=0;
function togglePusatMassa(){_ttlToggle('pusatmassa','btnPusatMassa',drawPusatMassa);}
window.togglePusatMassa=togglePusatMassa;
function drawPusatMassa(){
  const k=_ttlKanvas('cvPusatMassa',_cad11TinggiSempit('cvPusatMassa',[[244,400],[274,385],[298,360],[369,335],[1e9,310]])); if(!k) return; const {ctx,W,H}=k; _cad11Awal(W,H);
  const sempit=W<_TTL_SEMPIT;
  const a=120, b=70, t=15;
  const xS=_ttlNilai('sl_pm_x',60), dB=_ttlNilai('sl_pm_d',30), hB=_ttlNilai('sl_pm_h',40);
  _ttlTulis('v_pm_x',xS.toFixed(0)); _ttlTulis('v_pm_d',dB.toFixed(0)); _ttlTulis('v_pm_h',hB.toFixed(0));
  const lo=dB/2+2, hi=a-dB/2-2;
  const xB=_ttlJalan('pusatmassa')?(lo+hi)/2+(hi-lo)/2*Math.sin(_pmFrame/45):Math.min(hi,Math.max(lo,xS));
  const V1=a*b*t, V2=Math.PI/4*dB*dB*hB;
  const xbar=(V1*a/2+V2*xB)/(V1+V2), zbar=(V1*t/2+V2*(t+hB/2))/(V1+V2);
  const judul='Pusat massa gabungan G bergeser mengikuti Placement boss: x̄ ke arah boss, z̄ naik bila boss makin tinggi/besar';
  const tb=sempit?_cad11Muat(ctx,judul,12,16,W-24,_C11T,_F11_10,'left',13):_cad11Muat(ctx,judul,12,18,W-16,_C11T,_F11_11,'left',14);
  const labelAtas=['tampak atas (XY)',' — pelat '+a+' × '+b+' grounded'];
  // Layar lebar: tampak atas di kiri, tampak samping di kanan atas, angka di kanan bawah.
  // Layar sempit: tampak atas lalu tampak samping (skala x sama, seperti proyeksi ortogonal), angka di bawahnya.
  let skT, ox, oy, skS, sx, sz, yLA, ySamping, yTeks;
  if(sempit){
    yLA=31+tb; const tl=_cad11Muat(ctx,labelAtas,14,yLA,W-28,_C11M,_F11_10,'left',12);
    skT=Math.min((W-44)/a,0.9); ox=(W-a*skT)/2; oy=yLA+tl+8+b*skT;
    ySamping=oy+31; skS=Math.min(skT,70/(t+70)); sx=ox; sz=ySamping+8+(t+70)*skS; yTeks=sz+20;
  } else {
    skT=Math.max(0.05,Math.min((W*0.40)/(a+10),(H-90-tb)/(b+10))); ox=W*0.04; oy=H*0.16+tb+b*skT;
    // batas skala tampak samping: labelnya tidak boleh naik menimpa judul saat boss tinggi
    skS=Math.max(0.05,Math.min((W*0.46)/(a+10),(H*0.5)/(t+hB+10),(H*0.56-42-tb)/(t+hB))); sx=W*0.52; sz=H*0.56; yTeks=H*0.66;
  }
  // tampak atas
  const X=v=>ox+v*skT, Y=v=>oy-v*skT;
  _cad11Kotak(ctx,X(0),Y(b),a*skT,b*skT,'rgba(34,211,238,.14)',_C11C,1.6);
  _cad11Lingkar(ctx,X(xB),Y(b/2),dB/2*skT,'rgba(245,158,11,.25)',_C11A,1.6);
  _cad11Lingkar(ctx,X(a/2),Y(b/2),3.5,null,_C11C,1.4); _cad11Lingkar(ctx,X(xB),Y(b/2),3.5,null,_C11A,1.4);
  _cad11Lingkar(ctx,X(xbar),Y(b/2),4.5,_C11G,'#0a101f',1.2);
  if(!sempit) _cad11Muat(ctx,labelAtas,X(0),Y(b)-8,W*0.48-8,_C11M,_F11_10,'left',12);
  // tampak samping
  const XS=v=>sx+v*skS, ZS=v=>sz-v*skS;
  _cad11Kotak(ctx,XS(0),ZS(t),a*skS,t*skS,'rgba(34,211,238,.14)',_C11C,1.6);
  _cad11Kotak(ctx,XS(xB-dB/2),ZS(t+hB),dB*skS,hB*skS,'rgba(245,158,11,.22)',_C11A,1.6);
  [[XS(a/2),ZS(t/2),_C11C],[XS(xB),ZS(t+hB/2),_C11A]].forEach(([px,py,c])=>{_cad11Lingkar(ctx,px,py,3.5,'#0a101f',c,1.4); _cad11G(ctx,px-7,py,px+7,py,c,1); _cad11G(ctx,px,py-7,px,py+7,c,1);});
  _cad11Lingkar(ctx,XS(xbar),ZS(zbar),4.5,_C11G,'#0a101f',1.2);
  _cad11Teks(ctx,'tampak samping (XZ)',XS(0),sempit?ySamping:ZS(t+hB)-10,_C11M,_F11_10);
  // angka
  const V1s=V1.toLocaleString('id-ID'), jk=sempit?16:(W<640?15:18);
  _cad11Kolom(ctx,[
    [['V₁ = '+V1s+' mm³ (pelat),',' V₂ = '+V2.toFixed(0)+' mm³ (boss ⌀'+dB+' × '+hB+')'],_C11T,_F11_10,jk],
    [['x̄ = (V₁·a/2 + V₂·x_B)/(V₁ + V₂)',' = '+xbar.toFixed(3)+' mm'],_C11G,_F11_10,jk],
    [['z̄ = (V₁·t/2 + V₂·(t + h_B/2))','/(V₁ + V₂)',' = '+zbar.toFixed(3)+' mm'],_C11G,_F11_10,jk],
    [['Placement boss x_B = '+xB.toFixed(1)+' mm',' (Fixed joint + Offset)'],_C11M,_F11_10,0]],sempit?14:sx,yTeks,sempit?W-28:W-sx-8,13);
  // Label yang menempel pada gambar ditulis terakhir di calon posisi pertama yang tidak dilewati garis.
  const FB="bold 10px 'JetBrains Mono',monospace", kanan=xbar<xB, rS=dB/2*skS;
  _cad11Label(ctx,'G₁',[[XS(0)-6,ZS(t/2)+4,'right'],[XS(0)-6,ZS(t/2)+12,'right'],[XS(0)-6,ZS(t)-3,'right'],..._cad11Cincin(XS(0),ZS(t/2),10,34,Math.PI)],_C11C,_F11_9);
  const kiriB=[XS(xB)-rS-5,ZS(t+hB/2)+4,'right'], kananB=[XS(xB)+rS+5,ZS(t+hB/2)+4,'left'];
  _cad11Label(ctx,'G₂',[...(sempit&&!kanan?[kiriB,kananB]:[kananB,kiriB]),[XS(xB),ZS(t+hB)-5,'center'],[XS(xB),ZS(t+hB)+12,'center'],
    [XS(xB)+rS+5,ZS(t+hB)+9,'left'],[XS(xB)-rS-5,ZS(t+hB)+9,'right'],..._cad11Cincin(XS(xB),ZS(t+hB/2),rS+8,rS+44,kanan?0:Math.PI)],_C11A,_F11_9);
  const kiriG=[XS(xbar)-8,ZS(zbar)-6,'right'], kananG=[XS(xbar)+8,ZS(zbar)-6,'left'];
  _cad11Label(ctx,'G',[...(sempit&&kanan?[kiriG,kananG]:[kananG,kiriG]),[XS(xbar)+8,ZS(zbar)+13,'left'],[XS(xbar)-8,ZS(zbar)+13,'right'],..._cad11Cincin(XS(xbar),ZS(zbar),11,47,Math.PI/2)],_C11G,FB);
  const sXbar='x̄ = '+xbar.toFixed(2), rT=dB/2*skT;
  _cad11Label(ctx,sXbar,sempit?[[X(xbar),oy+14,'center'],[X(xbar)+30,oy+14,'center'],[X(xbar)-30,oy+14,'center'],..._cad11Cincin(X(xbar),oy+14,8,32,0)]
    :[[X(xbar),Y(b/2)+rT+16,'center'],[X(xbar),Y(b/2)-rT-9,'center'],[X(xbar),oy+14,'center'],[X(xbar),Y(b)+13,'center'],..._cad11Cincin(X(xbar),Y(b/2),rT+10,rT+46,-Math.PI/2)],_C11G,_F11_10);
  _ttlTulis('pusatMassaInfo','Boss pada x_B = '+xB.toFixed(1)+' mm: x̄ = '+xbar.toFixed(3)+' mm, z̄ = '+zbar.toFixed(3)+' mm dari V₁ = '+V1+' dan V₂ = '+V2.toFixed(1)+' mm³; itulah CenterOfMass dari Part.makeCompound(Shape semua link) untuk bahan seragam.');
  if(_ttlJalan('pusatmassa')){_pmFrame++; requestAnimationFrame(drawPusatMassa);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Transmisi sabuk dua puli: panjang sabuk dan rasio putaran
// ════════════════════════════════════════════════════════════
let _sbFrame=0;
function toggleSabuk(){_ttlToggle('sabuk','btnSabuk',drawSabuk);}
window.toggleSabuk=toggleSabuk;
function drawSabuk(){
  const k=_ttlKanvas('cvSabuk',_cad11TinggiSempit('cvSabuk',[[224,362],[274,350],[1e9,335]])); if(!k) return; const {ctx,W,H}=k; _cad11Awal(W,H);
  const sempit=W<_TTL_SEMPIT;
  const D1=_ttlNilai('sl_sb_d1',75), D2=Math.max(_ttlNilai('sl_sb_d2',150),D1), C=Math.max(_ttlNilai('sl_sb_c',250),(D1+D2)/2+20);
  _ttlTulis('v_sb_d1',D1.toFixed(0)); _ttlTulis('v_sb_d2',D2.toFixed(0)); _ttlTulis('v_sb_c',C.toFixed(0));
  const R1=D1/2, R2=D2/2, beta=Math.asin((R2-R1)/C);
  const Ldekat=2*C+Math.PI*(D1+D2)/2+(D2-D1)*(D2-D1)/(4*C);
  const Ltepat=2*Math.sqrt(C*C-(R2-R1)*(R2-R1))+Math.PI*(D1+D2)/2+(D2-D1)*beta;
  const i=D2/D1, n1=1450, n2=n1/i, lilit=180-2*beta*180/Math.PI;
  const judul='Puli penggerak n₁ = 1450 rpm (Revolute grounded) → puli ⌀D₂ berjarak C (Distance joint); joint Belt mengopling putaran';
  const tb=sempit?_cad11Muat(ctx,judul,12,16,W-24,_C11T,_F11_10,'left',13):_cad11Muat(ctx,judul,12,18,W-16,_C11T,_F11_11,'left',14);
  // layar lebar: puli di kiri, rumus di kanan; layar sempit: puli selebar kanvas (puli besar maks. 92 px), rumus di bawahnya
  let sk, c1x, cy, yD, tx, ty;
  if(sempit){sk=Math.max(0.05,Math.min((W-28)/(C+R1+R2),92/D2)); c1x=(W-(C+R1+R2)*sk)/2+R1*sk; cy=29+tb+50; yD=cy+80; tx=14; ty=yD+24;}
  else{sk=Math.max(0.05,Math.min((W*0.60)/(C+R1+R2+20),(H-70)/(D2+30))); c1x=W*0.04+R1*sk+10; cy=H*0.55; yD=H-16; tx=W*0.68; ty=H*0.16;}
  const c2x=c1x+C*sk;
  // sabuk (2 busur lilit + 2 garis singgung)
  const n=40, sabuk=[]; let a0=Math.PI/2+beta, a1=3*Math.PI/2-beta;
  for(let j=0;j<=n;j++){const ang=a0+(a1-a0)*j/n; sabuk.push([c1x+R1*sk*Math.cos(ang),cy-R1*sk*Math.sin(ang)]);}
  a0=-Math.PI/2-beta; a1=Math.PI/2+beta;
  for(let j=0;j<=n;j++){const ang=a0+(a1-a0)*j/n; sabuk.push([c2x+R2*sk*Math.cos(ang),cy-R2*sk*Math.sin(ang)]);}
  ctx.strokeStyle=_C11V; ctx.lineWidth=2.4; ctx.beginPath(); sabuk.forEach(([px,py],j)=>j?ctx.lineTo(px,py):ctx.moveTo(px,py)); ctx.closePath(); ctx.stroke(); _cad11RuasJalur(sabuk,2.4,true);
  _cad11Lingkar(ctx,c1x,cy,R1*sk,'rgba(34,211,238,.15)',_C11C,1.4); _cad11Lingkar(ctx,c2x,cy,R2*sk,'rgba(245,158,11,.15)',_C11A,1.4);
  // jari-jari berputar (rasio i)
  const th1=_sbFrame*4*Math.PI/180, th2=th1/i;
  for(let j=0;j<3;j++){const a=th1+j*2*Math.PI/3; _cad11G(ctx,c1x,cy,c1x+R1*sk*0.85*Math.cos(a),cy-R1*sk*0.85*Math.sin(a),'rgba(34,211,238,.6)',1.4);}
  for(let j=0;j<3;j++){const a=th2+j*2*Math.PI/3; _cad11G(ctx,c2x,cy,c2x+R2*sk*0.85*Math.cos(a),cy-R2*sk*0.85*Math.sin(a),'rgba(245,158,11,.6)',1.4);}
  _cad11Lingkar(ctx,c1x,cy,3,'#e2e8f0',null); _cad11Lingkar(ctx,c2x,cy,3,'#e2e8f0',null);
  _cad11Panah(ctx,c1x,yD,c2x,yD,_C11G); _cad11Panah(ctx,c2x,yD,c1x,yD,_C11G);
  const j=sempit?[14,16,16,16,19,15,16]:[16,20,20,20,28,18,20];
  _cad11Kolom(ctx,[
    ['L = 2C + π(D₁+D₂)/2',_C11C,_F11_11,j[0]],
    ['    + (D₂−D₁)²/(4C)',_C11C,_F11_11,j[1]],
    [['= '+(2*C).toFixed(1),' + '+(Math.PI*(D1+D2)/2).toFixed(1),' + '+((D2-D1)*(D2-D1)/(4*C)).toFixed(2)],_C11M,_F11_10,j[2]],
    ['= '+Ldekat.toFixed(2)+' mm',_C11G,_F11_11,j[3]],
    ['singgung tepat: '+Ltepat.toFixed(2)+' mm',_C11M,_F11_10,j[4]],
    ['i = D₂/D₁ = '+i.toFixed(3),_C11A,_F11_11,j[5]],
    ['n₂ = n₁/i = '+n2.toFixed(0)+' rpm',_C11A,_F11_11,j[6]],
    [['lilit puli kecil = '+lilit.toFixed(1)+'°',lilit<120?' (< 120°!)':''],lilit<120?_C11R:_C11M,_F11_10,0]],tx,ty,sempit?W-28:W-tx-8,13);
  // Label diameter dan jarak C ditulis terakhir, di calon pertama yang tidak dilewati sabuk, jari-jari, atau garis ukur.
  ctx.font=_F11_10;
  const jepit=(s,x)=>{if(!sempit) return x; const w=ctx.measureText(s).width/2+4; return Math.min(W-w,Math.max(w,x));};
  const sD1='⌀D₁ = '+D1, sD2='⌀D₂ = '+D2, r1=R1*sk, r2=R2*sk;
  _cad11Label(ctx,sD1,[[jepit(sD1,c1x),cy+r1+16,'center'],[jepit(sD1,c1x),cy+r1+13,'center'],[jepit(sD1,c1x),cy+r1+28,'center'],[c1x-r1*0.7-4,cy+r1*0.7+12,'right'],[c1x-r1-6,cy+4,'right'],[jepit(sD1,c1x),cy-r1-8,'center'],..._cad11Cincin(c1x,cy,r1+12,r1+52,-Math.PI/2)],_C11C,_F11_10);
  _cad11Label(ctx,sD2,[[jepit(sD2,c2x),cy+r2+16,'center'],[jepit(sD2,c2x),cy+r2+13,'center'],[c2x+r2*0.7+4,cy+r2*0.7+12,'left'],[c2x+r2+6,cy+4,'left'],[jepit(sD2,c2x),cy+r2+28,'center'],[c2x-r2*0.7-4,cy+r2*0.7+12,'right'],[jepit(sD2,c2x),cy-r2-8,'center'],..._cad11Cincin(c2x,cy,r2+12,r2+52,-Math.PI/2)],_C11A,_F11_10);
  const mC=(c1x+c2x)/2;
  _cad11Label(ctx,'C = '+C,[[mC,yD-5,'center'],[mC,yD+13,'center'],[mC-40,yD-5,'center'],[mC+40,yD-5,'center'],[mC-40,yD+13,'center'],[mC+40,yD+13,'center'],..._cad11Cincin(mC,yD,10,42,Math.PI/2)],_C11G,_F11_10);
  _ttlTulis('sabukInfo','D₁ = '+D1+', D₂ = '+D2+', C = '+C+': L = 2·'+C+' + π·'+((D1+D2)/2)+' + '+((D2-D1)*(D2-D1)/(4*C)).toFixed(3)+' = '+Ldekat.toFixed(2)+' mm (panjang singgung tepat '+Ltepat.toFixed(2)+' mm, selisih '+Math.abs(Ltepat-Ldekat).toFixed(3)+' mm); rasio i = '+i.toFixed(3)+', puli besar '+n2.toFixed(0)+' rpm; sudut lilit puli kecil '+lilit.toFixed(1)+'°.');
  if(_ttlJalan('sabuk')){_sbFrame++; requestAnimationFrame(drawSabuk);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Kelonggaran poros-lubang: dari longgar ke interferensi
// ════════════════════════════════════════════════════════════
let _clFrame=0;
function toggleClearance(){_ttlToggle('clearance','btnClearance',drawClearance);}
window.toggleClearance=toggleClearance;
function drawClearance(){
  const k=_ttlKanvas('cvClearance',_cad11TinggiSempit('cvClearance',[[244,400],[274,385],[298,348],[1e9,335]])); if(!k) return; const {ctx,W,H}=k; _cad11Awal(W,H);
  const sempit=W<_TTL_SEMPIT;
  const D=_ttlNilai('sl_cl_D',25), dS=_ttlNilai('sl_cl_d',24.94);
  _ttlTulis('v_cl_D',D.toFixed(1).replace('.',',')); _ttlTulis('v_cl_d',dS.toFixed(2).replace('.',','));
  const d=_ttlJalan('clearance')?dS+0.08*Math.sin(_clFrame/40):dS;
  const c=(D-d)/2, zoom=300;
  const judul='Penampang poros di dalam lubang — celah radial diperbesar '+zoom+'× agar terlihat';
  const tb=sempit?_cad11Muat(ctx,judul,12,16,W-24,_C11T,_F11_10,'left',13):_cad11Muat(ctx,judul,12,18,W-16,_C11T,_F11_11,'left',14);
  // Bus persegi berjarak m dari lubang. Layar lebar: lubang di kiri dan dua label di bawah bus kini di dalam kanvas
  // (dulu jatuh di bawah tepi bawah, dan bus menyentuh judul); layar sempit: lubang di tengah, angka di bawahnya.
  let m, R, cx, cy, yL, tx, ty;
  if(sempit){m=14; R=Math.max(10,Math.min((W-28-2*m)/2,50)); cx=W/2; cy=29+tb+6+m+R; yL=cy+R+m+14; tx=14; ty=yL+35;}
  else{m=24; R=Math.max(10,Math.min(W*0.22,(H-112-tb)/2)); cx=W*0.26; cy=30+tb+m+R; yL=cy+R+m+12; tx=W*0.56; ty=H*0.2;}
  // celah diperbesar 300x relatif (skala gambar: R setara 120 px); jari-jari poros dijepit agar tetap di dalam bus
  const rd=Math.max(4,Math.min(R+m-4,R-c*zoom*R/120));
  const warna=c>0?_C11G:(c<0?_C11R:_C11A);
  // bus (persegi) dan lubang
  _cad11Kotak(ctx,cx-R-m,cy-R-m,2*R+2*m,2*R+2*m,'rgba(148,163,184,.08)','rgba(148,163,184,.6)',1.2);
  _cad11Lingkar(ctx,cx,cy,R,'#0a101f',_C11C,1.8);
  // poros; bila interferensi, cincin tumpang tindih merah
  if(c<0){_cad11Lingkar(ctx,cx,cy,rd,'rgba(239,68,68,.35)',_C11R,1.8); _cad11Lingkar(ctx,cx,cy,R,null,_C11C,1.8,[4,3]);}
  else {_cad11Lingkar(ctx,cx,cy,rd,'rgba(245,158,11,.25)',_C11A,1.8);}
  // panah celah radial
  const ang=-0.6;
  if(c>0) _cad11Panah(ctx,cx+rd*Math.cos(ang),cy+rd*Math.sin(ang),cx+R*Math.cos(ang),cy+R*Math.sin(ang),_C11G);
  const lL=sempit?W-24:W*0.56-16;
  _cad11Muat(ctx,'lubang ⌀D (bus, grounded)',cx,yL,lL,_C11C,_F11_10,'center');
  _cad11Muat(ctx,'poros ⌀d (Cylindrical joint)',cx,yL+13,lL,_C11A,_F11_10,'center');
  const j=sempit?[16,15,18,16,15,16]:[22,18,26,24,18,22];
  const status=c>0?['KELONGGARAN',' — suaian longgar,',' poros bebas']:(c<0?['INTERFERENSI',' — poros menembus',' dinding']:['PAS — c = 0']);
  _cad11Kolom(ctx,[
    [['D = '+D.toFixed(2)+' mm,',' d = '+d.toFixed(3)+' mm'],_C11T,_F11_11,j[0]],
    [['c = (D − d)/2',' = '+c.toFixed(4)+' mm'],warna,_F11_11,j[1]],
    ['celah diameter = '+(2*c).toFixed(4)+' mm',_C11M,_F11_10,j[2]],
    [status,warna,"bold 11px 'JetBrains Mono',monospace",j[3]],
    [['Std Measure Distance',' dua silinder',' = '+(c>0?c.toFixed(4):'0')],_C11M,_F11_10,j[4]],
    [['Part Common volume',' = '+(c<0?'> 0 (tabrakan!)':'0')],c<0?_C11R:_C11M,_F11_10,j[5]],
    [['joint tetap terbentuk;',' tabrakan harus Anda periksa'],_C11M,_F11_10,0]],tx,ty,sempit?W-28:W-tx-8,13);
  // label c di ujung panah celah, di calon pertama yang tidak dilewati lingkaran lubang, poros, atau tepi bus
  if(c>0){const ux=cx+R*Math.cos(ang), uy=cy+R*Math.sin(ang);
    _cad11Label(ctx,'c',[[ux+8,uy-4,'left'],[ux+9,uy+9,'left'],[ux+4,uy-9,'left'],[cx+(R+m/2)*Math.cos(ang),cy+(R+m/2)*Math.sin(ang)+4,'center'],..._cad11Cincin(ux,uy,10,34,-ang)],_C11G,"bold 11px 'JetBrains Mono',monospace");}
  _ttlTulis('clearanceInfo','D = '+D.toFixed(2)+', d = '+d.toFixed(3)+': c = ('+D.toFixed(2)+' − '+d.toFixed(3)+')/2 = '+c.toFixed(4)+' mm — '+(c>0?'kelonggaran (Std Measure Distance membaca angka ini)':(c<0?'interferensi: Part Common bervolume > 0, model harus dikoreksi':'pas'))+'.');
  if(_ttlJalan('clearance')){_clFrame++; requestAnimationFrame(drawClearance);}
}

_TTL_DAFTAR.push(['cvEngkol',()=>drawEngkol(),'engkol',['sl_ek_r','sl_ek_l','sl_ek_th']]);
_TTL_DAFTAR.push(['cvPusatMassa',()=>drawPusatMassa(),'pusatmassa',['sl_pm_x','sl_pm_d','sl_pm_h']]);
_TTL_DAFTAR.push(['cvSabuk',()=>drawSabuk(),'sabuk',['sl_sb_d1','sl_sb_d2','sl_sb_c']]);
_TTL_DAFTAR.push(['cvClearance',()=>drawClearance(),'clearance',['sl_cl_D','sl_cl_d']]);
_ttlMulai();
