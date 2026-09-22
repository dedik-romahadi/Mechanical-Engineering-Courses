// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 12 PEMODELAN CAD — Identifikasi Masalah Desain dan Solusi Optimasi
// Kanvas: cvFit, cvTabrak, cvDinding, cvLengan (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// Layar sempit (W < _TTL_SEMPIT): gambar di atas, keterangan ditumpuk di bawahnya pada kanvas yang lebih tinggi.
// ════════════════════════════════════════════════════════════
const _C12C='#22d3ee', _C12A='#f59e0b', _C12G='#00e09e', _C12R='#ef4444', _C12V='#a855f7', _C12P='#ec4899', _C12T='rgba(226,232,240,.92)', _C12M='rgba(148,163,184,.85)';
const _F12_9="9px 'JetBrains Mono',monospace", _F12_10="10px 'JetBrains Mono',monospace", _F12_11="11px 'JetBrains Mono',monospace";
function _cad12Teks(ctx,s,x,y,warna,font,align){ctx.fillStyle=warna; ctx.font=font||"11px 'JetBrains Mono',monospace"; ctx.textAlign=align||'left'; ctx.fillText(s,x,y);}
// Memecah string per kata, tetapi "nama = nilai satuan", operasi seperti "a × b", "A ∩ B", "R² + x" dan panah dengan kata sesudahnya tetap satu potongan.
function _cad12Kata(s){const o=[]; for(const t of String(s).split(/(?= )/)){const p=o[o.length-1]; if(p!==undefined&&(/^ (=|∩|×|\+|−|mm³|mm²|mm|rpm|µm|°)(?![\wÀ-ɏ])/.test(t)||/[=→∩×+−]$/.test(p))) o[o.length-1]=p+t; else o.push(t);} return o;}
// Menulis teks agar muat dalam lebar maxW (perataan align). bagian = string (dipecah per kata) atau array potongan
// yang bila digabung sama persis dengan teks utuhnya (dipecah hanya di batas potongan, spasi awal baris dibuang).
// Bila teks utuh tidak muat, huruf boleh dikecilkan sampai 85% (min 8 px) asal tetap satu baris; bila masih
// kepanjangan, teks dipecah dengan ukuran huruf semula, baris berjarak lh. Potongan yang sendirian masih kepanjangan
// diserahkan ke _ttlTeks. Mengembalikan tinggi tambahan akibat pemecahan: 0 bila satu baris, (n − 1)·lh bila n baris.
function _cad12Muat(ctx,bagian,x,y,maxW,warna,font,align,lh){
  ctx.fillStyle=warna; ctx.font=font||_F12_11; ctx.textAlign=align||'left';
  const f=ctx.font, px=parseFloat((/(\d+(?:\.\d+)?)px/.exec(f)||[0,11])[1]);
  const potong=Array.isArray(bagian)?bagian:_cad12Kata(bagian), utuh=potong.join('');
  lh=lh||Math.round(px*1.3);
  for(let uk=px;uk>=Math.max(8,px*0.85)-1e-6;uk-=0.5){
    ctx.font=f.replace(/\d+(?:\.\d+)?px/,uk+'px');
    if(ctx.measureText(utuh).width<=maxW){ctx.fillText(utuh,x,y); ctx.font=f; return 0;}
  }
  ctx.font=f;
  const baris=[]; let b='';
  for(const p of potong){const coba=b+p; if(b&&ctx.measureText(coba).width>maxW){baris.push(b); b=p.replace(/^ +/,'');} else b=coba;}
  if(b) baris.push(b);
  let yy=y;
  for(const s of baris) yy=_ttlTeks(ctx,s,x,yy,maxW,{lh});
  ctx.font=f; return yy-y-lh;
}
function _cad12Kotak(ctx,x,y,w,h,isi,garis,lebar){if(isi){ctx.fillStyle=isi; ctx.fillRect(x,y,w,h);} if(garis){ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.4; ctx.strokeRect(x,y,w,h);}}
function _cad12Lingkar(ctx,x,y,r,isi,garis,lebar,putus){ctx.setLineDash(putus||[]); ctx.beginPath(); ctx.arc(x,y,Math.max(0.1,r),0,Math.PI*2); if(isi){ctx.fillStyle=isi; ctx.fill();} if(garis){ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.2; ctx.stroke();} ctx.setLineDash([]);}
function _cad12Panah(ctx,x1,y1,x2,y2,warna){const a=Math.atan2(y2-y1,x2-x1); _ttlGaris(ctx,x1,y1,x2,y2,warna,1.2); ctx.fillStyle=warna; ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-7*Math.cos(a)+3.5*Math.sin(a),y2-7*Math.sin(a)-3.5*Math.cos(a)); ctx.lineTo(x2-7*Math.cos(a)-3.5*Math.sin(a),y2-7*Math.sin(a)+3.5*Math.cos(a)); ctx.closePath(); ctx.fill();}
function _cad12Koma(x,d){return x.toFixed(d).replace('.',',');}
// Tinggi kanvas di layar sempit menurut lebarnya: tabel [[lebar batas, tinggi], ...] berurutan naik; dipakai tinggi
// pertama yang batasnya melebihi lebar kanvas (teks dipecah makin banyak baris saat kanvas makin sempit).
function _cad12TinggiSempit(id,tabel){const cv=document.getElementById(id), W=cv?(cv.clientWidth||cv.width):1000; const t=tabel.find(([L])=>W<L); return t?t[1]:tabel[tabel.length-1][1];}
// Menulis baris-baris [teks, warna, font, jarak ke baris berikut] mulai (x, y); baris yang dipecah mendorong baris
// sesudahnya sejauh tinggi tambahannya, jadi posisi di layar lebar tetap sama bila tidak ada yang dipecah.
// Mengembalikan y baris terakhir.
function _cad12Kolom(ctx,baris,x,y,maxW,lh){
  let yy=y;
  baris.forEach(([s,warna,font,jarak],i)=>{yy+=_cad12Muat(ctx,s,x,yy,maxW,warna,font,'left',lh||13); if(i<baris.length-1) yy+=jarak;});
  return yy;
}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Zona toleransi bergeser: dari suaian longgar ke sesak
// ════════════════════════════════════════════════════════════
let _ftFrame=0;
function toggleFit(){_ttlToggle('fit','btnFit',drawFit);}
window.toggleFit=toggleFit;
function drawFit(){
  const k=_ttlKanvas('cvFit',_cad12TinggiSempit('cvFit',[[244,395],[369,356],[1e9,343]])); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const ES=_ttlNilai('sl_ft_ES',18), esS=_ttlNilai('sl_ft_es',-6), IT=_ttlNilai('sl_ft_it',11);
  _ttlTulis('v_ft_ES',ES.toFixed(0)); _ttlTulis('v_ft_es',(esS<0?'−':'')+Math.abs(esS).toFixed(0)); _ttlTulis('v_ft_it',IT.toFixed(0));
  const es=_ttlJalan('fit')?Math.round(-40+70*(0.5+0.5*Math.sin(_ftFrame/90))):esS;
  const ei=es-IT, EI=0;
  const cMaks=(ES-ei)/1000, cMin=(EI-es)/1000;
  const jenis=cMin>0?'SUAIAN LONGGAR':(cMaks<0?'SUAIAN SESAK':'SUAIAN TRANSISI');
  const warna=cMin>0?_C12G:(cMaks<0?_C12R:_C12A);
  const atas=Math.max(ES,es,0)+6, bawah=Math.min(ei,0)-6;
  const judul='Zona toleransi (µm): huruf menetapkan letaknya terhadap garis nol, angka IT menetapkan lebarnya';
  const tb=sempit?_cad12Muat(ctx,judul,12,16,W-24,_C12T,_F12_10,'left',13):_cad12Muat(ctx,judul,12,18,W-16,_C12T,_F12_11,'left',14);
  const sGN='garis nol (ukuran nominal)';
  // xa = panah c_maks, x1/x2 = zona lubang/poros selebar lb, xg0..xg1 = garis nol. Label garis nol ditulis di atas
  // garisnya bila muat di kiri label ES/EI; bila tidak (tablet, ponsel), menjadi legenda di atas zona.
  let sk, y0, x1, x2, lb, xa, xg0, xg1, yZona, yLeg=0;
  ctx.font=_F12_9; const wGN=ctx.measureText(sGN).width;
  if(sempit){
    lb=Math.max(22,Math.min(70,(W-152)/2)); const off=Math.max(0,(W-24-(128+2*lb))/2);
    xa=16+off; x1=xa+42; x2=x1+lb+40; xg0=xa-6; xg1=x2+lb+46;
    yLeg=33+tb; yZona=yLeg+17; sk=Math.max(0.05,140/(atas-bawah)); y0=yZona+10+atas*sk;
  } else {
    sk=Math.max(0.05,(H*0.56)/(atas-bawah)); y0=H*0.30+atas*sk;
    x1=W*0.10; x2=W*0.30; lb=Math.max(20,W*0.14); xa=W*0.06; xg0=W*0.05; xg1=W*0.52; yZona=H*0.20;
    if(W*0.05+wGN+4>x1+lb+6){yLeg=44+tb; yZona=Math.max(yZona,yLeg+14);}
  }
  const Z=v=>y0-v*sk;
  // garis nol
  _ttlGaris(ctx,xg0,Z(0),xg1,Z(0),_C12R,1.4,[7,4]);
  if(yLeg){const xl=sempit?xa-6:W*0.05; _ttlGaris(ctx,xl,yLeg-3,xl+18,yLeg-3,_C12R,1.4,[7,4]); _cad12Teks(ctx,sGN,xl+24,yLeg,_C12R,_F12_9);}
  else _cad12Teks(ctx,sGN,W*0.05,Z(0)-6,_C12R,_F12_9);
  // zona lubang (H: EI = 0) dan zona poros
  _cad12Kotak(ctx,x1,Z(ES),lb,Math.max(1,(ES-EI)*sk),'rgba(34,211,238,.22)',_C12C,1.6);
  _cad12Kotak(ctx,x2,Z(es),lb,Math.max(1,IT*sk),'rgba(245,158,11,.22)',_C12A,1.6);
  _cad12Teks(ctx,'lubang H',x1+lb/2,yZona,_C12C,_F12_10,'center');
  _cad12Teks(ctx,'poros',x2+lb/2,yZona,_C12A,_F12_10,'center');
  _cad12Teks(ctx,'ES +'+ES,x1+lb+6,Z(ES)+4,_C12C,_F12_9);
  _cad12Teks(ctx,'EI 0',x1+lb+6,Z(EI)+12,_C12C,_F12_9);
  _cad12Teks(ctx,'es '+(es<0?'−':'+')+Math.abs(es),x2+lb+6,Z(es)+4,_C12A,_F12_9);
  _cad12Teks(ctx,'ei '+(ei<0?'−':'+')+Math.abs(ei),x2+lb+6,Z(ei)+12,_C12A,_F12_9);
  // pita kelonggaran maksimum (ES .. ei); labelnya menyingkir bila akan menimpa label garis nol
  _cad12Panah(ctx,xa,Z(ES),xa,Z(ei),warna); _cad12Panah(ctx,xa,Z(ei),xa,Z(ES),warna);
  let yC=(Z(ES)+Z(ei))/2;
  if(!yLeg&&xa+4<W*0.05+wGN&&yC+2>Z(0)-14&&yC-8<Z(0)-4) yC=yC<Z(0)-6?Z(0)-17:Z(0)+12;
  _cad12Teks(ctx,'c_maks',xa+4,yC,warna,_F12_9);
  // kolom kanan (layar sempit: di bawah zona)
  const tx=sempit?14:W*0.58, ty=sempit?y0-bawah*sk+26:H*0.22, j=sempit?[14,17,15,18,15,15]:[18,26,20,28,20,24];
  _cad12Kolom(ctx,[
    [['lubang: '+(12+EI/1000).toFixed(4)+' … '+(12+ES/1000).toFixed(4)+' mm'],_C12C,_F12_10,j[0]],
    [['poros : '+(12+ei/1000).toFixed(4)+' … '+(12+es/1000).toFixed(4)+' mm'],_C12A,_F12_10,j[1]],
    [['c_maks = (ES − ei)/1000',' = '+cMaks.toFixed(4)+' mm'],warna,_F12_11,j[2]],
    [['c_min  = (EI − es)/1000',' = '+cMin.toFixed(4)+' mm'],warna,_F12_11,j[3]],
    [jenis,warna,"bold 12px 'JetBrains Mono',monospace",j[4]],
    [cMin>0?'poros selalu bebas berputar':(cMaks<0?'harus dipres atau dipanaskan':'bisa longgar, bisa sesak'),_C12M,_F12_10,j[5]],
    ['contoh nominal ⌀12 mm',_C12M,_F12_10,0]],tx,ty,sempit?W-28:W-tx-8,13);
  _ttlTulis('fitInfo','ES = +'+ES+', EI = 0, es = '+es+', ei = '+ei+' µm → c_maks = ('+ES+' − ('+ei+'))/1000 = '+cMaks.toFixed(4)+' mm dan c_min = (0 − ('+es+'))/1000 = '+cMin.toFixed(4)+' mm — '+jenis.toLowerCase()+'. Kelonggaran maksimum selalu dibaca dari lubang terbesar bertemu poros terkecil.');
  if(_ttlJalan('fit')){_ftFrame++; requestAnimationFrame(drawFit);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Dua komponen saling masuk: volume interferensi vs δ
// ════════════════════════════════════════════════════════════
let _tbFrame=0;
function toggleTabrak(){_ttlToggle('tabrak','btnTabrak',drawTabrak);}
window.toggleTabrak=toggleTabrak;
function drawTabrak(){
  const k=_ttlKanvas('cvTabrak',_cad12TinggiSempit('cvTabrak',[[244,405],[274,382],[298,375],[369,369],[1e9,357]])); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const dS=_ttlNilai('sl_tb_d',2.5), b=_ttlNilai('sl_tb_b',45), h=_ttlNilai('sl_tb_h',28);
  _ttlTulis('v_tb_d',_cad12Koma(dS,1)); _ttlTulis('v_tb_b',b.toFixed(0)); _ttlTulis('v_tb_h',h.toFixed(0));
  const d=_ttlJalan('tabrak')?(-3+7.5*(0.5+0.5*Math.sin(_tbFrame/70))):dS;
  const a1=60, a2=50, V=d>0?d*b*h:0;
  const judul='Part → Boolean → Common menyisakan irisan A ∩ B; volumenya adalah ukuran tabrakan';
  const tb=sempit?_cad12Muat(ctx,judul,12,16,W-24,_C12T,_F12_10,'left',13):_cad12Muat(ctx,judul,12,18,W-16,_C12T,_F12_11,'left',14);
  // layar sempit: balok selebar kanvas (B bergeser sampai δ = −3, b maks 60) dengan pita tetap, angka dan grafik di bawahnya
  let sk, ox, oy, yLab;
  if(sempit){sk=Math.max(0.05,Math.min((W-28)/(a1+a2+3),76/60)); ox=(W-(a1+a2+3)*sk)/2; oy=29+tb+14; yLab=oy+b*sk+16;}
  else{sk=Math.max(0.05,Math.min((W*0.50)/(a1+a2+14),(H*0.44)/(b+10))); ox=W*0.05; oy=H*0.30; yLab=oy+b*sk+16;}
  const X=v=>ox+v*sk, Y=v=>oy+v*sk;
  _cad12Kotak(ctx,X(0),Y(0),a1*sk,b*sk,'rgba(34,211,238,.12)',_C12C,1.6);
  _cad12Kotak(ctx,X(a1-d),Y(0),a2*sk,b*sk,'rgba(245,158,11,.12)',_C12A,1.6);
  if(d>0) _cad12Kotak(ctx,X(a1-d),Y(0),d*sk,b*sk,'rgba(239,68,68,.45)',_C12R,1.4);
  _cad12Teks(ctx,'A',X(a1/2),Y(0)-8,_C12C,"bold 11px 'JetBrains Mono',monospace",'center');
  _cad12Teks(ctx,'B',X(a1-d+a2/2),Y(0)-8,_C12A,"bold 11px 'JetBrains Mono',monospace",'center');
  const eL=sempit?_cad12Muat(ctx,['tampak atas (XY)',' — penampang bersama b × h'],W/2,yLab,W-24,_C12M,_F12_10,'center',12)
    :_cad12Muat(ctx,['tampak atas (XY)',' — penampang bersama b × h'],X(0),yLab,W*0.55-X(0)-8,_C12M,_F12_10,'left',12);
  const sD=d>0?'δ = '+_cad12Koma(d,2):'celah = '+_cad12Koma(-d,2)+' mm';
  ctx.font=_F12_10; const wD=ctx.measureText(sD).width/2+4;
  _cad12Teks(ctx,sD,Math.min(W-wD,Math.max(wD,X(a1-d/2))),yLab+eL+18,d>0?_C12R:_C12G,_F12_10,'center');
  // kolom kanan (layar sempit: di bawah balok)
  const tx=sempit?14:W*0.60, ty=sempit?yLab+eL+42:H*0.22, j=sempit?[16,20,20,20]:[18,22,24,24];
  const yAkhir=_cad12Kolom(ctx,[
    ['V_int = δ · b · h',_C12C,_F12_11,j[0]],
    [d>0?('= '+_cad12Koma(d,2)+' × '+b+' × '+h):['= 0',' (tidak bertabrakan)'],_C12M,_F12_10,j[1]],
    ['= '+V.toFixed(2)+' mm³',d>0?_C12R:_C12G,"bold 12px 'JetBrains Mono',monospace",j[2]],
    [['distToShape',' = '+(d>0?'0,000 (menembus)':_cad12Koma(-d,3)+' mm')],d>0?_C12R:_C12G,_F12_10,j[3]],
    [d>0?'TABRAKAN — model harus diperbaiki':'AMAN — masih ada celah',d>0?_C12R:_C12G,"bold 11px 'JetBrains Mono',monospace",0]],tx,ty,sempit?W-28:W-tx-8,13);
  // grafik V_int(δ)
  let gx=tx, gy=H-16, gw=Math.max(40,W-14-tx), gh=H*0.26;
  if(sempit){gx=14; gw=W-28; gh=Math.max(30,Math.min(60,H-14-(yAkhir+18))); gy=yAkhir+18+gh;}
  _ttlGaris(ctx,gx,gy,gx+gw,gy,'rgba(148,163,184,.5)',1); _ttlGaris(ctx,gx,gy,gx,gy-gh,'rgba(148,163,184,.5)',1);
  const vmax=12*b*h;
  ctx.strokeStyle=_C12R; ctx.lineWidth=1.5; ctx.beginPath();
  for(let i=0;i<=60;i++){const dv=-3+i/60*15; const vv=dv>0?dv*b*h:0; const px=gx+i/60*gw, py=gy-vv/vmax*gh; i?ctx.lineTo(px,py):ctx.moveTo(px,py);}
  ctx.stroke();
  _cad12Lingkar(ctx,gx+(d+3)/15*gw,gy-V/vmax*gh,4,_C12G,null);
  _cad12Teks(ctx,'V_int(δ)',gx+4,gy-gh+10,_C12M,_F12_9);
  _ttlTulis('tabrakInfo',d>0?('δ = '+_cad12Koma(d,2)+' mm: V_int = δ·b·h = '+_cad12Koma(d,2)+' × '+b+' × '+h+' = '+V.toFixed(2)+' mm³; Part Common menghasilkan solid dan distToShape bernilai 0, jadi kedua komponen benar-benar menembus.'):('Tidak ada tumpang tindih: Part Common kosong (V_int = 0) dan distToShape memberi jarak terdekat '+_cad12Koma(-d,3)+' mm — itulah kelonggaran rakit yang tersedia.'));
  if(_ttlJalan('tabrak')){_tbFrame++; requestAnimationFrame(drawTabrak);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Dinding tipis: tebal dinding w terhadap volume dan batas proses
// ════════════════════════════════════════════════════════════
let _ddFrame=0;
function toggleDinding(){_ttlToggle('dinding','btnDinding',drawDinding);}
window.toggleDinding=toggleDinding;
function drawDinding(){
  const k=_ttlKanvas('cvDinding',_cad12TinggiSempit('cvDinding',[[244,325],[274,320],[298,310],[1e9,297]])); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const a=80, bb=60, h=40;
  const wS=_ttlNilai('sl_dd_w',4), pS=_ttlNilai('sl_dd_p',30), wMin=_ttlNilai('sl_dd_min',3);
  _ttlTulis('v_dd_w',_cad12Koma(wS,1)); _ttlTulis('v_dd_p',pS.toFixed(0)); _ttlTulis('v_dd_min',_cad12Koma(wMin,1));
  const w=_ttlJalan('dinding')?(1+11*(0.5+0.5*Math.sin(_ddFrame/80))):wS;
  const p=Math.min(pS,h-1), ai=Math.max(0.1,a-2*w), bi=Math.max(0.1,bb-2*w);
  const V=a*bb*h-ai*bi*p, dasar=h-p;
  const tipis=w<wMin, dasarTipis=dasar<wMin;
  const warna=tipis?_C12R:_C12G;
  const judul='Menipiskan dinding memang mengurangi volume, tetapi di bawah batas proses ia menjadi cacat';
  const tb=sempit?_cad12Muat(ctx,judul,12,16,W-24,_C12T,_F12_10,'left',13):_cad12Muat(ctx,judul,12,18,W-16,_C12T,_F12_11,'left',14);
  // layar sempit: penampang di tengah (sisakan 78 px di kanannya untuk label dasar), angka di bawahnya
  let sk, ox, oy;
  if(sempit){sk=Math.max(0.05,Math.min((W-106)/a,72/h)); ox=Math.max(14,(W-a*sk-78)/2); oy=29+tb+24+h*sk;}
  else{sk=Math.max(0.05,Math.min((W*0.46)/(a+16),(H*0.46)/(h+16))); ox=W*0.06; oy=H*0.30+h*sk;}
  const X=v=>ox+v*sk, Y=v=>oy-v*sk;
  // penampang XZ: badan penuh lalu rongga Pocket
  _cad12Kotak(ctx,X(0),Y(h),a*sk,h*sk,tipis?'rgba(239,68,68,.16)':'rgba(34,211,238,.16)',tipis?_C12R:_C12C,1.8);
  _cad12Kotak(ctx,X(w),Y(h),ai*sk,p*sk,'#0a101f','rgba(168,85,247,.85)',1.4);
  // penanda tebal dinding dan dasar
  _cad12Panah(ctx,X(0),Y(h)-10,X(w),Y(h)-10,warna); _cad12Panah(ctx,X(w),Y(h)-10,X(0),Y(h)-10,warna);
  _cad12Teks(ctx,'w = '+_cad12Koma(w,2),X(w)+8,Y(h)-14,warna,_F12_10);
  _cad12Panah(ctx,X(a)+12,Y(dasar),X(a)+12,Y(0),dasarTipis?_C12R:_C12M);
  _cad12Teks(ctx,'dasar '+_cad12Koma(dasar,1),X(a)+18,Y(dasar/2)+4,dasarTipis?_C12R:_C12M,_F12_10);
  _cad12Teks(ctx,'Pocket p = '+p.toFixed(0),X(w+ai/2),Y(h)+16,_C12V,_F12_10,'center');
  const sP='penampang rumah '+a+' × '+h+' mm (b = '+bb+' mm)';
  const eP=sempit?_cad12Muat(ctx,sP,W/2,Y(0)+18,W-24,_C12M,_F12_10,'center',12):_cad12Muat(ctx,sP,X(0),Y(0)+18,W*0.58-X(0)-8,_C12M,_F12_10,'left',12);
  // batas proses (layar sempit: di bawah penampang)
  const tx=sempit?14:W*0.60, ty=sempit?Y(0)+eP+44:H*0.22, j=sempit?[15,18,19,16,18,16]:[18,22,26,20,24,22];
  _cad12Kolom(ctx,[
    ['V = a·b·h − (a−2w)(b−2w)·p',_C12C,_F12_10,j[0]],
    ['= '+(a*bb*h).toFixed(0)+' − '+(ai*bi*p).toFixed(0),_C12M,_F12_10,j[1]],
    ['= '+V.toFixed(2)+' mm³',_C12G,"bold 12px 'JetBrains Mono',monospace",j[2]],
    [['tebal dinding w',' = '+_cad12Koma(w,2)+' mm'],warna,_F12_11,j[3]],
    [['batas proses w_min',' = '+_cad12Koma(wMin,1)+' mm'],_C12M,_F12_10,j[4]],
    [tipis?['DI BAWAH BATAS —',' cacat isi / melengkung']:'MEMENUHI BATAS PROSES',warna,"bold 11px 'JetBrains Mono',monospace",j[5]],
    [dasarTipis?['dasar '+_cad12Koma(dasar,1)+' mm',' juga di bawah batas']:['dasar h − p',' = '+_cad12Koma(dasar,1)+' mm'],dasarTipis?_C12R:_C12M,_F12_10,0]],tx,ty,sempit?W-28:W-tx-8,13);
  _ttlTulis('dindingInfo','w = '+_cad12Koma(w,2)+' mm, p = '+p.toFixed(0)+' mm: V = '+(a*bb*h).toFixed(0)+' − '+ai.toFixed(2)+' × '+bi.toFixed(2)+' × '+p.toFixed(0)+' = '+V.toFixed(2)+' mm³, dasar '+_cad12Koma(dasar,1)+' mm. '+(tipis?'Tebal dinding di bawah batas proses '+_cad12Koma(wMin,1)+' mm: hemat bahan tetapi berisiko cacat.':'Tebal dinding memenuhi batas proses '+_cad12Koma(wMin,1)+' mm.'));
  if(_ttlJalan('dinding')){_ddFrame++; requestAnimationFrame(drawDinding);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Lengan berputar mendekati dinding: jarak bebas minimum
// ════════════════════════════════════════════════════════════
let _lgFrame=0;
function toggleLengan(){_ttlToggle('lengan','btnLengan',drawLengan);}
window.toggleLengan=toggleLengan;
function drawLengan(){
  const k=_ttlKanvas('cvLengan',_cad12TinggiSempit('cvLengan',[[244,370],[298,357],[1e9,330]])); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT;
  const R=_ttlNilai('sl_lg_R',70), w=_ttlNilai('sl_lg_w',24), Wd=_ttlNilai('sl_lg_W',100);
  _ttlTulis('v_lg_R',R.toFixed(0)); _ttlTulis('v_lg_w',w.toFixed(0)); _ttlTulis('v_lg_W',Wd.toFixed(0));
  const rs=Math.hypot(R,w/2), cMin=Wd-rs, thStar=Math.atan2(w/2,R)*180/Math.PI;
  const th=_ttlJalan('lengan')?(_lgFrame*0.9)%360:(360-thStar);
  const tr=th*Math.PI/180;
  const sudut=[[0,-w/2],[R,-w/2],[R,w/2],[0,w/2]].map(([x,y])=>[x*Math.cos(tr)-y*Math.sin(tr),x*Math.sin(tr)+y*Math.cos(tr)]);
  const xMaks=Math.max.apply(null,sudut.map(q=>q[0]));
  const cSaat=Wd-xMaks;
  const judul='Titik terjauh lengan adalah sudut ujungnya: ia menyapu lingkaran √(R² + (w/2)²), bukan R';
  const tb=sempit?_cad12Muat(ctx,judul,12,16,W-24,_C12T,_F12_10,'left',13):_cad12Muat(ctx,judul,12,18,W-16,_C12T,_F12_11,'left',14);
  // layar sempit: lingkaran sapuan (jari-jari maks. 62 px) dan dinding selebar kanvas, angka di bawahnya
  let sk, ox, oy, yDa, yDb, yTh;
  if(sempit){sk=Math.max(0.05,Math.min((W-46)/(Wd+rs),62/rs)); ox=(W-18-(Wd+rs)*sk)/2+rs*sk; oy=29+tb+68; yDa=oy-68; yDb=oy+68; yTh=oy+84;}
  else{sk=Math.max(0.05,Math.min((W*0.50)/(Wd+rs*0.4+30),(H*0.46)/(rs+10))); ox=W*0.06+rs*sk; oy=H*0.52; yDa=H*0.10; yDb=H*0.88; yTh=H-12;}
  const X=v=>ox+v*sk, Y=v=>oy-v*sk;
  _cad12Lingkar(ctx,X(0),Y(0),rs*sk,null,'rgba(236,72,153,.55)',1,[5,4]);
  // dinding
  _cad12Kotak(ctx,X(Wd),yDa,10,yDb-yDa,'rgba(148,163,184,.20)','rgba(148,163,184,.65)',1.2);
  for(let yy=yDa+H*0.02;yy<yDb-H*0.02;yy+=14) _ttlGaris(ctx,X(Wd)+10,yy,X(Wd)+18,yy-6,'rgba(148,163,184,.4)',0.8);
  // lengan
  ctx.beginPath(); sudut.forEach(([x,y],i)=>{i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y));}); ctx.closePath();
  ctx.fillStyle=cSaat>0?'rgba(34,211,238,.20)':'rgba(239,68,68,.35)'; ctx.fill();
  ctx.strokeStyle=cSaat>0?_C12C:_C12R; ctx.lineWidth=1.8; ctx.stroke();
  _cad12Lingkar(ctx,X(0),Y(0),4,'#e2e8f0',null);
  // label sumbu dijepit ke dalam tepi kiri kanvas
  ctx.font=_F12_9; const wSb=ctx.measureText('sumbu putar').width;
  _cad12Teks(ctx,'sumbu putar',Math.max(wSb+4,X(0)-6),Y(0)+18,_C12M,_F12_9,'right');
  // jarak sesaat
  const warna=cSaat>0?(Math.abs(cSaat-cMin)<0.5?_C12G:_C12A):_C12R;
  _cad12Panah(ctx,X(xMaks),Y(0)-24,X(Wd),Y(0)-24,warna);
  _cad12Teks(ctx,_cad12Koma(cSaat,2),(X(xMaks)+X(Wd))/2,Y(0)-30,warna,_F12_10,'center');
  ctx.font=_F12_10; const sTh='θ = '+th.toFixed(0)+'°', wTh=ctx.measureText(sTh).width/2+4;
  _cad12Teks(ctx,sTh,Math.min(W-wTh,Math.max(wTh,X(0))),yTh,_C12M,_F12_10,'center');
  const tx=sempit?14:W*0.62, ty=sempit?yTh+22:H*0.22, j=sempit?[16,18,16,18,15,17]:[20,24,20,24,22,24];
  _cad12Kolom(ctx,[
    [['√(R² + (w/2)²)',' = '+rs.toFixed(3)+' mm'],_C12P,_F12_11,j[0]],
    [['W − R = '+(Wd-R).toFixed(3)+' mm',' (keliru)'],_C12M,_F12_10,j[1]],
    ['c_min = W − √(R² + (w/2)²)',_C12C,_F12_11,j[2]],
    ['      = '+cMin.toFixed(3)+' mm',cMin>0?_C12G:_C12R,"bold 12px 'JetBrains Mono',monospace",j[3]],
    [['θ* = arctan((w/2)/R)',' = '+thStar.toFixed(2)+'°'],_C12A,_F12_10,j[4]],
    [['jarak sesaat',' = '+_cad12Koma(cSaat,3)+' mm'],warna,_F12_10,j[5]],
    [cMin>0?'AMAN sepanjang putaran':'MENABRAK — perpendek R atau jauhkan dinding',cMin>0?_C12G:_C12R,"bold 11px 'JetBrains Mono',monospace",0]],tx,ty,sempit?W-28:W-tx-8,13);
  _ttlTulis('lenganInfo','R = '+R+', w = '+w+', W = '+Wd+': jarak sudut terjauh ke sumbu = √('+R+'² + '+(w/2)+'²) = '+rs.toFixed(3)+' mm, sehingga c_min = '+Wd+' − '+rs.toFixed(3)+' = '+cMin.toFixed(3)+' mm pada θ* = '+thStar.toFixed(2)+'°. Memakai W − R = '+(Wd-R).toFixed(3)+' mm akan menaksir jarak bebas terlalu besar.');
  if(_ttlJalan('lengan')){_lgFrame++; requestAnimationFrame(drawLengan);}
}

_TTL_DAFTAR.push(['cvFit',()=>drawFit(),'fit',['sl_ft_ES','sl_ft_es','sl_ft_it']]);
_TTL_DAFTAR.push(['cvTabrak',()=>drawTabrak(),'tabrak',['sl_tb_d','sl_tb_b','sl_tb_h']]);
_TTL_DAFTAR.push(['cvDinding',()=>drawDinding(),'dinding',['sl_dd_w','sl_dd_p','sl_dd_min']]);
_TTL_DAFTAR.push(['cvLengan',()=>drawLengan(),'lengan',['sl_lg_R','sl_lg_w','sl_lg_W']]);
_ttlMulai();
