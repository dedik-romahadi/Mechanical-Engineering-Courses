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
function _cad2Dim(ctx,x1,y1,x2,y2,teks,warna,ofs){
  // garis dimensi sejajar antara dua titik layar, digeser tegak lurus sejauh ofs px
  const dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy)||1, nx=-dy/L*ofs, ny=dx/L*ofs;
  ctx.strokeStyle=warna; ctx.lineWidth=1; ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x1+nx*1.15,y1+ny*1.15); ctx.moveTo(x2,y2); ctx.lineTo(x2+nx*1.15,y2+ny*1.15); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1+nx,y1+ny); ctx.lineTo(x2+nx,y2+ny); ctx.stroke();
  const ux=dx/L, uy=dy/L;
  [[x1+nx,y1+ny,1],[x2+nx,y2+ny,-1]].forEach(([px,py,s])=>{ctx.fillStyle=warna; ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+s*ux*8-uy*3,py+s*uy*8+ux*3); ctx.lineTo(px+s*ux*8+uy*3,py+s*uy*8-ux*3); ctx.closePath(); ctx.fill();});
  ctx.fillStyle=warna; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  ctx.save(); ctx.translate((x1+x2)/2+nx*1.35,(y1+y2)/2+ny*1.35); let ang=Math.atan2(dy,dx); if(ang>Math.PI/2||ang<-Math.PI/2) ang+=Math.PI; ctx.rotate(ang); ctx.fillText(teks,0,3); ctx.restore();
  ctx.textAlign='left';
}
// Memecah bagian-bagian teks menjadi baris selebar maksimal maxW (font ctx saat ini): bagian digabung
// dengan pemisah sep (string, atau larik: sep[i] dipakai sebelum bagian[i]) selama masih muat.
function _cad2Pecah(ctx,bagian,sep,maxW){
  const baris=[]; let kini='';
  bagian.forEach((b,i)=>{const s=Array.isArray(sep)?sep[i]:sep; const coba=kini?kini+s+b:b; if(kini&&ctx.measureText(coba).width>maxW){baris.push(kini); kini=b;} else kini=coba;});
  if(kini) baris.push(kini);
  return baris;
}
// Menulis baris-baris mulai dari y (jarak lh); baris yang tetap kepanjangan dikecilkan/dipecah _ttlTeks.
function _cad2Baris(ctx,baris,x,y,maxW,lh){let yy=y; baris.forEach(t=>{yy=_ttlTeks(ctx,t,x,yy,maxW,{lh});}); return yy;}
// Baris teks kepala kanvas: di layar lebar satu baris 11 px (bagian digabung dengan sep, sama persis
// dengan teks semula); di ponsel (W < _TTL_SEMPIT) 10 px dan dipecah per bagian selebar kanvas.
// Font ctx diatur di sini; {baris, lh} diteruskan ke _cad2Baris(ctx, baris, 12, 18, W-24, lh).
function _cad2Kepala(ctx,W,bagian,sep){
  const sempit=W<_TTL_SEMPIT;
  ctx.font=sempit?"10px 'JetBrains Mono',monospace":"11px 'JetBrains Mono',monospace";
  const baris=sempit?_cad2Pecah(ctx,bagian,sep,W-24):[bagian.map((b,i)=>i?(Array.isArray(sep)?sep[i]:sep)+b:b).join('')];
  return {baris,lh:sempit?13:14};
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
  const bawahKepala=18+(kp.baris.length-1)*kp.lh+4;
  const {X,Y}=_cad2Kisi(ctx,W,H,220,140,52,34,30,30);
  // kontur asal
  ctx.fillStyle='rgba(34,211,238,.12)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.beginPath(); ctx.rect(X(0),Y(b),a*(X(1)-X(0)),b*(X(1)-X(0))); ctx.fill(); ctx.stroke();
  // offset luar (sudut lancip, seperti Draft Offset polyline)
  ctx.strokeStyle='#f59e0b'; ctx.setLineDash([6,4]); ctx.beginPath(); ctx.rect(X(-t),Y(b+t),(a+2*t)*(X(1)-X(0)),(b+2*t)*(X(1)-X(0))); ctx.stroke();
  // offset dalam (bila masih mungkin)
  if(t<Math.min(a,b)/2){ctx.strokeStyle='#a855f7'; ctx.beginPath(); ctx.rect(X(t),Y(b-t),(a-2*t)*(X(1)-X(0)),(b-2*t)*(X(1)-X(0))); ctx.stroke();}
  ctx.setLineDash([]);
  // Dimensi t di atas sisi atas; dipindah ke bawah sisi atas bila labelnya akan menimpa teks kepala (b besar).
  _cad2Dim(ctx,X(a),Y(b),X(a+t),Y(b),'t = '+t.toFixed(1),'#f59e0b',Y(b)-14*1.35-9<bawahKepala?14:-14);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font=sempit?"10px 'JetBrains Mono',monospace":"11px 'JetBrains Mono',monospace";
  _cad2Baris(ctx,kp.baris,12,18,W-24,kp.lh);
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
  const {X,Y}=_cad2Kisi(ctx,W,H,200,130,52,34,100,60);
  const sk=X(1)-X(0);
  ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(X(0),Y(0),r*sk,0,Math.PI*2); ctx.stroke();
  const c=Math.sqrt(Math.max(0,r*r-h*h));
  // fase animasi: 0 garis penuh, 1 ujung kiri dipotong, 2 kedua ujung
  const fase=_ttlJalan('trim')?Math.floor((_trFrame/70)%3):2;
  const x1=fase>=1?-c:-80, x2=fase>=2?c:80;
  ctx.strokeStyle='rgba(148,163,184,.35)'; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(X(-80),Y(h)); ctx.lineTo(X(80),Y(h)); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle='#f59e0b'; ctx.lineWidth=2.6; ctx.beginPath(); ctx.moveTo(X(x1),Y(h)); ctx.lineTo(X(x2),Y(h)); ctx.stroke();
  ctx.fillStyle='#00e09e'; [[-c,h],[c,h]].forEach(([px,py])=>{ctx.beginPath(); ctx.arc(X(px),Y(py),3.5,0,Math.PI*2); ctx.fill();});
  _cad2Dim(ctx,X(0),Y(0),X(0),Y(h),'h = '+h.toFixed(0),'#a855f7',-16);
  _cad2Dim(ctx,X(0),Y(0),X(c),Y(h),'r = '+r.toFixed(0),'#22d3ee',12);
  // Dimensi tali busur di atas tali busur: dulu di bawahnya dan menimpa label h dan r di semua lebar.
  if(fase>=2) _cad2Dim(ctx,X(-c),Y(h),X(c),Y(h),'c = '+(2*c).toFixed(3),'#00e09e',-22);
  // Teks fase: di ponsel dipecah per bagian kalimat.
  ctx.fillStyle='rgba(226,232,240,.92)';
  const kp=_cad2Kepala(ctx,W,[['1. garis melintasi lingkaran'],['2. Trimex:','ujung kiri dipotong','ke perpotongan'],['3. Trimex:','ujung kanan dipotong','→ tali busur']][fase],' ');
  _cad2Baris(ctx,kp.baris,12,18,W-24,kp.lh);
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
  const {X,Y}=_cad2Kisi(ctx,W,H,240,150,56,40,40,40);
  const pts=[[0,0],[Wp,0],[Wp-s,Hp],[0,Hp]];
  ctx.fillStyle='rgba(34,211,238,.12)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1]))); ctx.closePath(); ctx.fill(); ctx.stroke();
  _cad2Dim(ctx,X(0),Y(0),X(Wp),Y(0),Wp.toFixed(0),'#f59e0b',26);
  _cad2Dim(ctx,X(0),Y(Hp),X(0),Y(0),Hp.toFixed(0),'#f59e0b',26);
  // Dimensi aligned di dalam trapesium; bila labelnya akan turun ke bawah alas (H kecil) dan menimpa label
  // sudut, dimensinya dipindah ke luar sisi miring (jarak 12 px agar muat di margin kanan kisi).
  const xa=X(Wp), ya=Y(0), xb=X(Wp-s), yb=Y(Hp), La=Math.hypot(xb-xa,yb-ya)||1, tAl=Math.hypot(s,Hp).toFixed(2);
  ctx.font="10px 'JetBrains Mono',monospace";
  const cyDalam=(ya+yb)/2+(xb-xa)/La*(-18)*1.35, turun=ctx.measureText(tAl).width/2*Math.abs(yb-ya)/La+6*Math.abs(xb-xa)/La;
  _cad2Dim(ctx,xa,ya,xb,yb,tAl,'#a855f7',cyDalam+turun>ya+3?12:-18);
  // dimensi angular di sudut kanan-bawah
  const th=Math.atan2(Hp,s), thDeg=th*180/Math.PI, rad=Math.min(Wp,Hp)*0.35*(X(1)-X(0));
  // Busur di antara alas (arah kiri) dan sisi miring (kiri-atas); dulu tercermin ke bawah alas.
  ctx.strokeStyle='#00e09e'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(X(Wp),Y(0),rad,Math.PI,Math.PI+th); ctx.stroke();
  // Label sudut di bawah alas, rata kanan di kiri sudutnya: di dalam trapesium dulu menimpa label aligned
  // (H kecil) di semua lebar.
  ctx.fillStyle='#00e09e'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='right';
  ctx.fillText(thDeg.toFixed(3)+'°',X(Wp)-5,Y(0)+13); ctx.textAlign='left';
  // Teks kepala: di ponsel dipecah per jenis dimensi.
  ctx.fillStyle='rgba(226,232,240,.92)';
  const kp=_cad2Kepala(ctx,W,['Draft Dimension:','linear '+Wp+' & '+Hp+',','aligned '+Math.hypot(s,Hp).toFixed(2)+',','angular '+thDeg.toFixed(3)+'°','(s = '+s.toFixed(1)+')'],' ');
  _cad2Baris(ctx,kp.baris,12,18,W-24,kp.lh);
  _ttlTulis('dimensiInfo','Sudut alas–sisi miring = arctan(H/s) = arctan('+Hp+'/'+s.toFixed(1)+') = '+thDeg.toFixed(3)+'°; ketika s berubah, semua dimensi diperbarui karena terikat ke titik-titik wire (parametrik)');
  if(_ttlJalan('dimensi')){_dmFrame++; requestAnimationFrame(drawDimensi);}
}

_TTL_DAFTAR.push(['cvOffset',()=>drawOffset(),'offset',['sl_of_a','sl_of_b','sl_of_t']]);
_TTL_DAFTAR.push(['cvTrim',()=>drawTrim(),'trim',['sl_tr_r','sl_tr_h']]);
_TTL_DAFTAR.push(['cvArray',()=>drawArray(),'array',['sl_ar_n','sl_ar_R','sl_ar_d']]);
_TTL_DAFTAR.push(['cvDimensi',()=>drawDimensi(),'dimensi',['sl_dm_w','sl_dm_h','sl_dm_s']]);
_ttlMulai();
