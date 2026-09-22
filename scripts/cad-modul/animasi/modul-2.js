// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 2 PEMODELAN CAD — Drafting dan Penyuntingan 2D
// Kanvas: cvOffset, cvTrim, cvArray, cvDimensi (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// ════════════════════════════════════════════════════════════
const _CAD2_X='#ef4444', _CAD2_Y='#22c55e';
// Kisi 2D + sumbu; mengembalikan fungsi pemetaan X(x), Y(y) untuk rentang (lebar × tinggi mm).
function _cad2Kisi(ctx,W,H,lebarMm,tinggiMm,padL,padB,ox0,oy0){
  const sk=Math.max(0.05,Math.min((W-padL-24)/lebarMm,(H-padB-26)/tinggiMm));
  const ox=padL+(ox0||0)*sk, oy=H-padB-(oy0||0)*sk;
  const X=x=>ox+x*sk, Y=y=>oy-y*sk;
  ctx.strokeStyle='rgba(148,163,184,.12)'; ctx.lineWidth=1;
  for(let x=-(ox0||0);x<=lebarMm-(ox0||0);x+=10){ctx.beginPath(); ctx.moveTo(X(x),Y(-(oy0||0))); ctx.lineTo(X(x),Y(tinggiMm-(oy0||0))); ctx.stroke();}
  for(let y=-(oy0||0);y<=tinggiMm-(oy0||0);y+=10){ctx.beginPath(); ctx.moveTo(X(-(ox0||0)),Y(y)); ctx.lineTo(X(lebarMm-(ox0||0)),Y(y)); ctx.stroke();}
  ctx.strokeStyle=_CAD2_X; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(X(-(ox0||0)),Y(0)); ctx.lineTo(X(lebarMm-(ox0||0)),Y(0)); ctx.stroke();
  ctx.strokeStyle=_CAD2_Y; ctx.beginPath(); ctx.moveTo(X(0),Y(-(oy0||0))); ctx.lineTo(X(0),Y(tinggiMm-(oy0||0))); ctx.stroke();
  return {X,Y,sk};
}
// Panah terisi di titik (px, py) mengarah ke (ux, uy).
function _cad2Panah(ctx,px,py,ux,uy,warna,p){p=p||8; ctx.fillStyle=warna; ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px-ux*p-uy*3,py-uy*p+ux*3); ctx.lineTo(px-ux*p+uy*3,py-uy*p-ux*3); ctx.closePath(); ctx.fill();}
// Garis dimensi sejajar antara dua titik layar, digeser tegak lurus sejauh ofs px. Teksnya TIDAK digambar di
// sini: dikembalikan {s, warna, calon} untuk _cad2Tempat, yang menaruhnya sesudah semua garis. Calon pertama =
// tengah, di luar garis dimensi dan ujung garis bantu (dulu 1,35 ofs, sehingga garis dimensinya sendiri
// melintasi teks); calon berikutnya di luar ujung kanan/kiri garis dimensi.
function _cad2Dim(ctx,x1,y1,x2,y2,teks,warna,ofs){
  const dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy)||1, nx=-dy/L*ofs, ny=dx/L*ofs;
  ctx.strokeStyle=warna; ctx.lineWidth=1; ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x1+nx*1.15,y1+ny*1.15); ctx.moveTo(x2,y2); ctx.lineTo(x2+nx*1.15,y2+ny*1.15); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1+nx,y1+ny); ctx.lineTo(x2+nx,y2+ny); ctx.stroke();
  const ux=dx/L, uy=dy/L;
  _cad2Panah(ctx,x1+nx,y1+ny,-ux,-uy,warna); _cad2Panah(ctx,x2+nx,y2+ny,ux,uy,warna);
  ctx.font="10px 'JetBrains Mono',monospace";
  const w=ctx.measureText(teks).width, a=Math.abs(ofs)||1, mx=(x1+x2)/2, my=(y1+y2)/2;
  let ang=Math.atan2(dy,dx); if(ang>Math.PI/2||ang<-Math.PI/2) ang+=Math.PI;
  // Jarak pusat teks dari garis dimensi: ujung garis bantu (0,15 ofs) + celah + setengah tinggi kotak teks yang
  // diputar (kotak tinta sejajar sumbu, seperti pemeriksa: teks miring butuh jarak lebih besar).
  const f=1+(0.15*a+2+w*Math.abs(Math.sin(ang)*Math.cos(ang))+5.5)/a;
  // titik fillText (textAlign tengah) untuk pusat teks (cx, cy): garis dasar 3 px di bawah pusat, searah rotasi
  const titik=(cx,cy)=>[cx-3*Math.sin(ang),cy+3*Math.cos(ang),ang,'center'];
  const geser=L/2+w/2+8, nu=[nx/a,ny/a];
  const dekat=[mx+nx+nu[0]*3.5,my+ny+nu[1]*3.5];   // tepat di luar garis dimensi (untuk calon di luar ujung)
  return {s:teks,warna,calon:[titik(mx+nx*f,my+ny*f),titik(dekat[0]+ux*geser,dekat[1]+uy*geser),titik(dekat[0]-ux*geser,dekat[1]-uy*geser)]};
}
// Memecah bagian-bagian teks menjadi baris selebar maksimal maxW (font ctx saat ini): bagian digabung
// dengan pemisah sep (string, atau larik: sep[i] dipakai sebelum bagian[i]) selama masih muat.
function _cad2Pecah(ctx,bagian,sep,maxW){
  const baris=[]; let kini='';
  bagian.forEach((b,i)=>{const s=Array.isArray(sep)?sep[i]:sep; const coba=kini?kini+s+b:b; if(kini&&ctx.measureText(coba).width>maxW){baris.push(kini); kini=b;} else kini=coba;});
  if(kini) baris.push(kini);
  return baris;
}
// Baris teks kepala kanvas: di layar lebar satu baris 11 px (bagian digabung dengan sep, sama persis
// dengan teks semula); di ponsel (W < _TTL_SEMPIT) 10 px dan dipecah per bagian selebar kanvas.
// Font ctx diatur di sini; {baris, lh, font} diteruskan ke _cad2TulisBaris(ctx, baris, 12, 18, W-24, lh, ruas).
function _cad2Kepala(ctx,W,bagian,sep){
  const sempit=W<_TTL_SEMPIT, font=sempit?"10px 'JetBrains Mono',monospace":"11px 'JetBrains Mono',monospace";
  ctx.font=font;
  const baris=sempit?_cad2Pecah(ctx,bagian,sep,W-24):[bagian.map((b,i)=>i?(Array.isArray(sep)?sep[i]:sep)+b:b).join('')];
  return {baris,lh:sempit?13:14,font};
}
// ── Garis tidak boleh melintasi teks ──
// Merekam ruas garis yang di-stroke pada ctx selama gambar (koordinat layar; hanya opasitas efektif >= 0,2,
// seperti aturan pemeriksa, jadi kisi samar diabaikan): lineTo, closePath, rect, arc, strokeRect.
// Mengembalikan {ruas: [[x1,y1,x2,y2,tebal], ...], selesai()}; selesai() memulihkan metode ctx.
function _cad2Rekam(ctx){
  const ruas=[], P=Object.getPrototypeOf(ctx); let jalur=[], kini=null, awal=null;
  const m=(x,y)=>{const t=ctx.getTransform(); return [t.a*x+t.c*y+t.e,t.b*x+t.d*y+t.f];};
  const alfa=()=>{let a=ctx.globalAlpha; const s=ctx.strokeStyle; if(typeof s==='string'){const r=/rgba?\(([^)]*)\)/.exec(s); if(r){const v=r[1].split(',').map(Number); if(v.length===4) a*=v[3];}} return a;};
  const ruasBaru=(p,q)=>jalur.push([p[0],p[1],q[0],q[1]]);
  ctx.beginPath=function(){jalur=[]; kini=awal=null; return P.beginPath.call(ctx);};
  ctx.moveTo=function(x,y){kini=awal=m(x,y); return P.moveTo.call(ctx,x,y);};
  ctx.lineTo=function(x,y){const q=m(x,y); if(kini) ruasBaru(kini,q); else awal=q; kini=q; return P.lineTo.call(ctx,x,y);};
  ctx.closePath=function(){if(kini&&awal) ruasBaru(kini,awal); kini=awal; return P.closePath.call(ctx);};
  ctx.rect=function(x,y,w,h){const c=[m(x,y),m(x+w,y),m(x+w,y+h),m(x,y+h)]; for(let i=0;i<4;i++) ruasBaru(c[i],c[(i+1)%4]); kini=awal=c[0]; return P.rect.call(ctx,x,y,w,h);};
  ctx.arc=function(cx,cy,r,a0,a1,ccw){
    if(r>0){
      let e=a1; if(!ccw){while(e<a0) e+=2*Math.PI; e=Math.min(e,a0+2*Math.PI);} else {while(e>a0) e-=2*Math.PI; e=Math.max(e,a0-2*Math.PI);}
      const n=Math.max(8,Math.ceil(Math.abs(e-a0)*r/3)); let p=m(cx+r*Math.cos(a0),cy+r*Math.sin(a0));
      if(kini) ruasBaru(kini,p); else awal=p;
      for(let i=1;i<=n;i++){const t=a0+(e-a0)*i/n, q=m(cx+r*Math.cos(t),cy+r*Math.sin(t)); ruasBaru(p,q); p=q;} kini=p;
    }
    return P.arc.call(ctx,cx,cy,r,a0,a1,ccw);
  };
  ctx.stroke=function(){if(alfa()>=0.2){const lw=ctx.lineWidth; jalur.forEach(s=>ruas.push([...s,lw]));} return P.stroke.call(ctx);};
  ctx.strokeRect=function(x,y,w,h){if(alfa()>=0.2){const c=[m(x,y),m(x+w,y),m(x+w,y+h),m(x,y+h)]; for(let i=0;i<4;i++) ruas.push([c[i][0],c[i][1],c[(i+1)%4][0],c[(i+1)%4][1],ctx.lineWidth]);} return P.strokeRect.call(ctx,x,y,w,h);};
  return {ruas,selesai(){['beginPath','moveTo','lineTo','closePath','rect','arc','stroke','strokeRect'].forEach(k=>delete ctx[k]);}};
}
// Kotak tinta teks s di titik fillText (x, y), diputar ang, dengan ctx.font dan ctx.textAlign saat ini (AABB).
function _cad2KotakTinta(ctx,s,x,y,ang){
  const u=ctx.measureText(s), co=Math.cos(ang||0), si=Math.sin(ang||0), xs=[], ys=[];
  [[-u.actualBoundingBoxLeft,-u.actualBoundingBoxAscent],[u.actualBoundingBoxRight,-u.actualBoundingBoxAscent],[-u.actualBoundingBoxLeft,u.actualBoundingBoxDescent],[u.actualBoundingBoxRight,u.actualBoundingBoxDescent]]
    .forEach(([a,b])=>{xs.push(x+a*co-b*si); ys.push(y+a*si+b*co);});
  return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
}
// Apakah ruas [x1,y1,x2,y2] memotong kotak [x0,y0,x1,y1]? (pemotongan Liang–Barsky)
function _cad2Potong(r,k){
  let t0=0,t1=1; const dx=r[2]-r[0], dy=r[3]-r[1], p=[-dx,dx,-dy,dy], q=[r[0]-k[0],k[2]-r[0],r[1]-k[1],k[3]-r[1]];
  for(let i=0;i<4;i++){if(p[i]===0){if(q[i]<0) return false;} else {const t=q[i]/p[i]; if(p[i]<0){if(t>t1) return false; if(t>t0) t0=t;} else {if(t<t0) return false; if(t<t1) t1=t;}}}
  return true;
}
// Banyak ruas yang melintasi kotak k (diperlebar celah 1,5 px + setengah tebal garis).
function _cad2Lintas(ruas,k){let n=0; for(const r of ruas){const e=1.5+r[4]/2; if(_cad2Potong(r,[k[0]-e,k[1]-e,k[2]+e,k[3]+e])) n++;} return n;}
// Menaruh label sesudah semua garis. label = [{s, warna, font?, calon:[[x, y, ang?, align?], ...]}]. Tiap calon
// digeser ke dalam batas; dipilih calon pertama yang tidak menimpa kotak teks di `terpakai` (celah 3 px) dan
// tidak dilintasi ruas garis. Bila tidak ada, dipakai calon bebas-teks dengan lintasan tersedikit dan ditulis
// berpelat (_ttlLabel) sehingga garis di belakangnya terputus seperti angka dimensi pada gambar teknik.
function _cad2Tempat(ctx,label,ruas,terpakai,batas){
  label.forEach(L=>{
    ctx.font=L.font||"10px 'JetBrains Mono',monospace";
    let pilih=null, skorMin=Infinity;
    for(const [x,y,ang,al] of L.calon){
      ctx.textAlign=al||'left';
      const k0=_cad2KotakTinta(ctx,L.s,x,y,ang);
      const gx=Math.max(0,batas[0]-k0[0])-Math.max(0,k0[2]-batas[2]), gy=Math.max(0,batas[1]-k0[1])-Math.max(0,k0[3]-batas[3]);
      const k=[k0[0]+gx,k0[1]+gy,k0[2]+gx,k0[3]+gy];
      const teks=terpakai.some(q=>k[0]-3<q[2]&&q[0]<k[2]+3&&k[1]-3<q[3]&&q[1]<k[3]+3);
      const skor=(teks?1000:0)+_cad2Lintas(ruas,k);
      if(skor<skorMin){skorMin=skor; pilih={x:x+gx,y:y+gy,ang:ang||0,al:al||'left',k};}
      if(!skor) break;
    }
    ctx.fillStyle=L.warna; ctx.textAlign=pilih.al;
    ctx.save(); ctx.translate(pilih.x,pilih.y); if(pilih.ang) ctx.rotate(pilih.ang);
    if(skorMin>0) _ttlLabel(ctx,L.s,0,0,{pad:2}); else ctx.fillText(L.s,0,0);
    ctx.restore();
    terpakai.push(pilih.k);
  });
  ctx.textAlign='left';
}
// Kotak baris-baris teks rata kiri mulai (x, y) berjarak lh (font ctx saat ini).
function _cad2KotakBaris(ctx,baris,x,y,lh){return [x-2,y-11,x+Math.max(...baris.map(t=>ctx.measureText(t).width))+2,y+(baris.length-1)*lh+5];}
// Menulis baris-baris teks kepala mulai dari y (jarak lh), dikecilkan sampai 85 % bila perlu (seperti _ttlTeks);
// baris yang dilintasi ruas garis (gambar yang naik ke teks kepala) ditulis berpelat.
function _cad2TulisBaris(ctx,baris,x,y,maxW,lh,ruas){
  let yy=y;
  baris.forEach(t=>{
    const f=ctx.font, m=/(\d+(?:\.\d+)?)px/.exec(f), px=m?parseFloat(m[1]):10, minPx=Math.max(8,px*0.85);
    let uk=px; while(ctx.measureText(t).width>maxW&&uk>minPx){uk=Math.max(minPx,uk-0.5); ctx.font=f.replace(/\d+(?:\.\d+)?px/,uk+'px');}
    if(ctx.measureText(t).width>maxW){ctx.font=f; yy=_ttlTeks(ctx,t,x,yy,maxW,{lh}); return;}
    ctx.textAlign='left';
    if(ruas&&_cad2Lintas(ruas,_cad2KotakTinta(ctx,t,x,yy,0))) _ttlLabel(ctx,t,x,yy,{pad:2}); else ctx.fillText(t,x,yy);
    ctx.font=f; yy+=lh;
  });
  return yy;
}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Offset kontur: luas dan keliling mengikuti jarak t
// ════════════════════════════════════════════════════════════
let _ofFrame=0;
function toggleOffset(){_ttlToggle('offset','btnOffset',drawOffset);}
window.toggleOffset=toggleOffset;
function drawOffset(){
  const k=_ttlKanvas('cvOffset'); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const a=_ttlNilai('sl_of_a',100), b=_ttlNilai('sl_of_b',60), tMaks=_ttlNilai('sl_of_t',10);
  _ttlTulis('v_of_a',a.toFixed(0)); _ttlTulis('v_of_b',b.toFixed(0)); _ttlTulis('v_of_t',tMaks.toFixed(1));
  const t=_ttlJalan('offset')?tMaks*(0.5+0.5*Math.sin(_ofFrame/40)):tMaks;
  const luar=(a+2*t)*(b+2*t), dalam=Math.max(0,(a-2*t)*(b-2*t));
  // Teks kepala: di ponsel dipecah (rumus luar, hasilnya, luas dalam) agar tidak keluar tepi kanan.
  const kp=_cad2Kepala(ctx,W,['Offset luar:','('+a+' + 2t) × ('+b+' + 2t)','= '+luar.toFixed(2)+' mm²','dalam: '+dalam.toFixed(2)+' mm²'],['',' ',' ',sempit?' · ':'   ·   ']);
  const kotakKepala=_cad2KotakBaris(ctx,kp.baris,12,18,kp.lh);
  const rek=_cad2Rekam(ctx);
  // Kisi 150 mm tinggi (dulu 140): offset luar b + t sampai 120 mm tetap di bawah teks kepala.
  const {X,Y}=_cad2Kisi(ctx,W,H,220,150,52,34,30,30);
  // kontur asal
  ctx.fillStyle='rgba(34,211,238,.12)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.beginPath(); ctx.rect(X(0),Y(b),a*(X(1)-X(0)),b*(X(1)-X(0))); ctx.fill(); ctx.stroke();
  // offset luar (sudut lancip, seperti Draft Offset polyline)
  ctx.strokeStyle='#f59e0b'; ctx.setLineDash([6,4]); ctx.beginPath(); ctx.rect(X(-t),Y(b+t),(a+2*t)*(X(1)-X(0)),(b+2*t)*(X(1)-X(0))); ctx.stroke();
  // offset dalam (bila masih mungkin)
  if(t<Math.min(a,b)/2){ctx.strokeStyle='#a855f7'; ctx.beginPath(); ctx.rect(X(t),Y(b-t),(a-2*t)*(X(1)-X(0)),(b-2*t)*(X(1)-X(0))); ctx.stroke();}
  ctx.setLineDash([]);
  // Dimensi t di atas sisi atas (di bawahnya bila terlalu dekat teks kepala). Teksnya di kanan offset luar, pada
  // tinggi garis dimensi (ruang bersih); bila tidak muat, di kiri sisi kanan persegi atau di atas garis dimensi.
  const ofsT=Y(b)-24<kotakKepala[3]+2?14:-14, yD=Y(b)+ofsT+3.5;
  const dT=_cad2Dim(ctx,X(a),Y(b),X(a+t),Y(b),'t = '+t.toFixed(1),'#f59e0b',ofsT);
  rek.selesai();
  _cad2Tempat(ctx,[{s:dT.s,warna:'#f59e0b',calon:[[X(a+t)+6,yD,0,'left'],[X(a)-6,yD,0,'right'],[X(a+t)+6,Y(b+t)-5,0,'left'],[X(a+t),Y(b+t)-5,0,'right'],[X(a+t)+6,Y(b)+ofsT*2+3.5,0,'left'],...dT.calon]}],rek.ruas,[kotakKepala],[4,4,W-4,H-4]);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font=kp.font;
  _cad2TulisBaris(ctx,kp.baris,12,18,W-24,kp.lh,rek.ruas);
  _ttlTulis('offsetInfo','t = '+t.toFixed(2)+' mm → luas luar '+luar.toLocaleString('id-ID',{maximumFractionDigits:2})+' mm², keliling luar '+(2*(a+b)+8*t).toFixed(2)+' mm; luas dalam '+dalam.toLocaleString('id-ID',{maximumFractionDigits:2})+' mm² (sudut tetap lancip pada Draft Offset polyline)');
  if(_ttlJalan('offset')){_ofFrame++; requestAnimationFrame(drawOffset);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Trimex: garis dipotong lingkaran → tali busur
// ════════════════════════════════════════════════════════════
let _trFrame=0;
function toggleTrim(){_ttlToggle('trim','btnTrim',drawTrim);}
window.toggleTrim=toggleTrim;
function drawTrim(){
  const k=_ttlKanvas('cvTrim'); if(!k) return; const {ctx,W,H}=k;
  const r=_ttlNilai('sl_tr_r',35), h=Math.min(_ttlNilai('sl_tr_h',12),r-0.5);
  _ttlTulis('v_tr_r',r.toFixed(0)); _ttlTulis('v_tr_h',h.toFixed(0));
  // fase animasi: 0 garis penuh, 1 ujung kiri dipotong, 2 kedua ujung
  const fase=_ttlJalan('trim')?Math.floor((_trFrame/70)%3):2;
  const kp=_cad2Kepala(ctx,W,[['1. garis melintasi lingkaran'],['2. Trimex:','ujung kiri dipotong','ke perpotongan'],['3. Trimex:','ujung kanan dipotong','→ tali busur']][fase],' ');
  const kotakKepala=_cad2KotakBaris(ctx,kp.baris,12,18,kp.lh);
  const rek=_cad2Rekam(ctx);
  const {X,Y}=_cad2Kisi(ctx,W,H,200,130,52,34,100,60);
  const sk=X(1)-X(0), X0=X(0), Y0=Y(0), rp=r*sk, yH=Y(h);
  ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(X0,Y0,rp,0,Math.PI*2); ctx.stroke();
  const c=Math.sqrt(Math.max(0,r*r-h*h));
  const x1=fase>=1?-c:-80, x2=fase>=2?c:80;
  ctx.strokeStyle='rgba(148,163,184,.35)'; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(X(-80),yH); ctx.lineTo(X(80),yH); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle='#f59e0b'; ctx.lineWidth=2.6; ctx.beginPath(); ctx.moveTo(X(x1),yH); ctx.lineTo(X(x2),yH); ctx.stroke();
  ctx.fillStyle='#00e09e'; [[-c,h],[c,h]].forEach(([px,py])=>{ctx.beginPath(); ctx.arc(X(px),Y(py),3.5,0,Math.PI*2); ctx.fill();});
  // Dimensi dipindah keluar lingkaran (dulu ketiganya berdesakan di pusat dan dilintasi sumbu, lingkaran,
  // dan garis). h: garis dimensi tegak di kiri lingkaran, antara sumbu X dan garis y = h (keduanya jadi garis
  // bantu). r: garis penunjuk dari pusat ke kiri-bawah, teks di luar lingkaran. c: di atas tali busur.
  const xh=X(-r)-14, dH=Y0-yH;
  ctx.strokeStyle='#a855f7'; ctx.lineWidth=1;
  if(xh<X(-80)+2){ctx.beginPath(); ctx.moveTo(X(-80),yH); ctx.lineTo(xh-3,yH); ctx.stroke();}
  if(dH>=4){ctx.beginPath(); ctx.moveTo(xh,Y0); ctx.lineTo(xh,yH); ctx.stroke(); if(dH>=18){_cad2Panah(ctx,xh,yH,0,-1,'#a855f7',6); _cad2Panah(ctx,xh,Y0,0,1,'#a855f7',6);}}
  const ua=Math.cos(Math.PI*0.75), va=Math.sin(Math.PI*0.75);
  ctx.strokeStyle='#22d3ee'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(X0,Y0); ctx.lineTo(X0+ua*rp,Y0+va*rp); ctx.stroke();
  _cad2Panah(ctx,X0+ua*rp,Y0+va*rp,ua,va,'#22d3ee',7);
  const dC=fase>=2?_cad2Dim(ctx,X(-c),yH,X(c),yH,'c = '+(2*c).toFixed(3),'#00e09e',-22):null;
  rek.selesai();
  const tH='h = '+h.toFixed(0), tR='r = '+r.toFixed(0), yTgh=(Y0+yH)/2+3.5, pr=[X0+ua*(rp+6),Y0+va*(rp+6)];
  const lbl=[
    {s:tH,warna:'#a855f7',calon:[[xh-6,yTgh,0,'right'],[xh-6,yH-5,0,'right'],[xh-6,Y0+12,0,'right'],[xh+6,yH-5,0,'left'],[xh-6,yH-17,0,'right']]},
    {s:tR,warna:'#22d3ee',calon:[[pr[0],pr[1]+9,0,'right'],[pr[0]-4,pr[1]+2,0,'right'],[pr[0]+4,pr[1]+14,0,'left'],[pr[0],pr[1]+21,0,'right']]}];
  if(dC) lbl.push({s:dC.s,warna:'#00e09e',calon:[[X(c)+6,yH-22+3.5,0,'left'],[X(-c)-6,yH-22+3.5,0,'right'],...dC.calon]});
  _cad2Tempat(ctx,lbl,rek.ruas,[kotakKepala],[4,4,W-4,H-4]);
  // Teks fase: di ponsel dipecah per bagian kalimat.
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font=kp.font;
  _cad2TulisBaris(ctx,kp.baris,12,18,W-24,kp.lh,rek.ruas);
  _ttlTulis('trimInfo','Tali busur c = 2·√(r² − h²) = 2·√('+r+'² − '+h+'²) = '+(2*c).toFixed(3)+' mm; Trimex memotong sampai objek batas terdekat pada sisi yang diklik');
  if(_ttlJalan('trim')){_trFrame++; requestAnimationFrame(drawTrim);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Polar array: pola lubang baut pada lingkaran jarak
// ════════════════════════════════════════════════════════════
let _arFrame=0;
function toggleArray(){_ttlToggle('array','btnArray',drawArray);}
window.toggleArray=toggleArray;
function drawArray(){
  // Layar lebar: flens di kiri, keterangan di kanan. Ponsel: flens di atas dan keterangan di bawahnya
  // (kanvas ditinggikan), karena kolom keterangan di x = 0,7W dulu keluar tepi kanan.
  const k=_ttlKanvas('cvArray',340); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const n=Math.round(_ttlNilai('sl_ar_n',8)), R=_ttlNilai('sl_ar_R',50), d=_ttlNilai('sl_ar_d',10);
  _ttlTulis('v_ar_n',String(n)); _ttlTulis('v_ar_R',R.toFixed(0)); _ttlTulis('v_ar_d',d.toFixed(0));
  const rPx=sempit?Math.min(W*0.42,95):Math.min(W*0.3,H*0.42);
  const cx=sempit?W*0.5:W*0.36, cy=sempit?14+rPx:H*0.52, sk=Math.max(0.05,rPx/(R+d));
  const putar=_ttlJalan('array')?_arFrame*0.004:0;
  // flens dan lingkaran jarak (PCD)
  ctx.fillStyle='rgba(34,211,238,.08)'; ctx.strokeStyle='rgba(34,211,238,.6)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(cx,cy,(R+d)*sk,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle='rgba(245,158,11,.6)'; ctx.setLineDash([5,4]); ctx.beginPath(); ctx.arc(cx,cy,R*sk,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
  const tampil=_ttlJalan('array')?Math.min(n,1+Math.floor((_arFrame/25)%(n+3))):n;
  const pusat=[];
  for(let i=0;i<n;i++){const th=putar+i*2*Math.PI/n; pusat.push([cx+R*sk*Math.cos(th),cy-R*sk*Math.sin(th)]);}
  pusat.slice(0,tampil).forEach(([px,py],i)=>{ctx.fillStyle='#0a101f'; ctx.strokeStyle=i===0?'#00e09e':'#f59e0b'; ctx.lineWidth=1.8; ctx.beginPath(); ctx.arc(px,py,d/2*sk,0,Math.PI*2); ctx.fill(); ctx.stroke();});
  if(tampil>=2){const [p0,p1]=pusat; ctx.strokeStyle='#00e09e'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(p0[0],p0[1]); ctx.lineTo(p1[0],p1[1]); ctx.stroke();}
  const jarak=2*R*Math.sin(Math.PI/n);
  ctx.textAlign='left';
  // Di layar lebar kolom keterangan di x = 0,7W, digeser ke kiri seperlunya bila baris terlebar akan melewati
  // tepi kanan (lebar 520-560 dengan n kecil).
  ctx.font="10px 'JetBrains Mono',monospace"; const wSudut=ctx.measureText('sudut pusat 360°/n = '+(360/n).toFixed(2)+'°').width;
  ctx.font="11px 'JetBrains Mono',monospace"; const wMaks=Math.max(wSudut,...['n = '+n+' lubang ⌀'+d,'R (PCD/2) = '+R+' mm','2R·sin(π/n) = '+jarak.toFixed(3)].map(t=>ctx.measureText(t).width));
  ctx.fillStyle='rgba(226,232,240,.92)';
  const tx=sempit?Math.max(12,cx-rPx):Math.min(W*0.7,W-wMaks-8), ty=sempit?cy+rPx+26:H*0.3;
  ctx.fillText('PolarArray',tx,ty); ctx.fillText('n = '+n+' lubang ⌀'+d,tx,ty+18); ctx.fillText('R (PCD/2) = '+R+' mm',tx,ty+36);
  ctx.fillStyle='#00e09e'; ctx.fillText('jarak tetangga',tx,ty+62); ctx.fillText('2R·sin(π/n) = '+jarak.toFixed(3),tx,ty+80);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('sudut pusat 360°/n = '+(360/n).toFixed(2)+'°',tx,ty+104);
  _ttlTulis('arrayInfo','Satu lingkaran di ('+R+', 0) disalin '+n+' kali mengelilingi titik asal; jarak antar-pusat bertetangga = 2·'+R+'·sin(180°/'+n+') = '+jarak.toFixed(3)+' mm, total luas lubang '+(n*Math.PI*d*d/4).toFixed(2)+' mm²');
  if(_ttlJalan('array')){_arFrame++; requestAnimationFrame(drawArray);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Dimensi parametrik pada profil trapesium (linear + angular)
// ════════════════════════════════════════════════════════════
let _dmFrame=0;
function toggleDimensi(){_ttlToggle('dimensi','btnDimensi',drawDimensi);}
window.toggleDimensi=toggleDimensi;
function drawDimensi(){
  const k=_ttlKanvas('cvDimensi'); if(!k) return; const {ctx,W,H}=k;
  const Wp=_ttlNilai('sl_dm_w',140), Hp=_ttlNilai('sl_dm_h',70), sMaks=_ttlNilai('sl_dm_s',40);
  _ttlTulis('v_dm_w',Wp.toFixed(0)); _ttlTulis('v_dm_h',Hp.toFixed(0)); _ttlTulis('v_dm_s',sMaks.toFixed(0));
  const s=_ttlJalan('dimensi')?sMaks*(0.55+0.45*Math.sin(_dmFrame/45)):sMaks;
  const th=Math.atan2(Hp,s), thDeg=th*180/Math.PI;
  // Teks kepala: di ponsel dipecah per jenis dimensi.
  const kp=_cad2Kepala(ctx,W,['Draft Dimension:','linear '+Wp+' & '+Hp+',','aligned '+Math.hypot(s,Hp).toFixed(2)+',','angular '+thDeg.toFixed(3)+'°','(s = '+s.toFixed(1)+')'],' ');
  const kotakKepala=_cad2KotakBaris(ctx,kp.baris,12,18,kp.lh);
  const rek=_cad2Rekam(ctx);
  // Kisi 260 × 160 mm (dulu 240 × 150): ruang di kanan untuk dimensi aligned yang kini selalu di luar sisi
  // miring, dan di atas agar garis bantunya pada H maksimum tidak naik ke teks kepala.
  const {X,Y}=_cad2Kisi(ctx,W,H,260,160,56,40,40,40);
  const pts=[[0,0],[Wp,0],[Wp-s,Hp],[0,Hp]];
  ctx.fillStyle='rgba(34,211,238,.12)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1]))); ctx.closePath(); ctx.fill(); ctx.stroke();
  const dW=_cad2Dim(ctx,X(0),Y(0),X(Wp),Y(0),Wp.toFixed(0),'#f59e0b',26);
  const dHp=_cad2Dim(ctx,X(0),Y(Hp),X(0),Y(0),Hp.toFixed(0),'#f59e0b',26);
  // Dimensi aligned di luar sisi miring: di dalam, garis bantunya turun ke bawah alas dan melintasi label sudut.
  const dAl=_cad2Dim(ctx,X(Wp),Y(0),X(Wp-s),Y(Hp),Math.hypot(s,Hp).toFixed(2),'#a855f7',14);
  // dimensi angular di sudut kanan-bawah: busur di antara alas (arah kiri) dan sisi miring (kiri-atas)
  const rad=Math.min(Wp,Hp)*0.35*(X(1)-X(0));
  ctx.strokeStyle='#00e09e'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(X(Wp),Y(0),rad,Math.PI,Math.PI+th); ctx.stroke();
  rek.selesai();
  // Label sudut di bawah alas (kiri atau kanan sudutnya); teks dimensi di luar garis dimensinya.
  const tS=thDeg.toFixed(3)+'°';
  _cad2Tempat(ctx,[{s:tS,warna:'#00e09e',calon:[[X(Wp)-5,Y(0)+13,0,'right'],[X(Wp)+5,Y(0)+13,0,'left'],[X(Wp)-rad-6,Y(0)-5,0,'right']]},dW,dHp,dAl],rek.ruas,[kotakKepala],[4,4,W-4,H-4]);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font=kp.font;
  _cad2TulisBaris(ctx,kp.baris,12,18,W-24,kp.lh,rek.ruas);
  _ttlTulis('dimensiInfo','Sudut alas–sisi miring = arctan(H/s) = arctan('+Hp+'/'+s.toFixed(1)+') = '+thDeg.toFixed(3)+'°; ketika s berubah, semua dimensi diperbarui karena terikat ke titik-titik wire (parametrik)');
  if(_ttlJalan('dimensi')){_dmFrame++; requestAnimationFrame(drawDimensi);}
}

_TTL_DAFTAR.push(['cvOffset',()=>drawOffset(),'offset',['sl_of_a','sl_of_b','sl_of_t']]);
_TTL_DAFTAR.push(['cvTrim',()=>drawTrim(),'trim',['sl_tr_r','sl_tr_h']]);
_TTL_DAFTAR.push(['cvArray',()=>drawArray(),'array',['sl_ar_n','sl_ar_R','sl_ar_d']]);
_TTL_DAFTAR.push(['cvDimensi',()=>drawDimensi(),'dimensi',['sl_dm_w','sl_dm_h','sl_dm_s']]);
_ttlMulai();
