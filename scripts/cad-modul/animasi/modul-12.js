// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 12 PEMODELAN CAD — Identifikasi Masalah Desain dan Solusi Optimasi
// Kanvas: cvFit, cvTabrak, cvDinding, cvLengan (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// Layar sempit (W < _TTL_SEMPIT): gambar di atas, keterangan ditumpuk di bawahnya pada kanvas yang lebih tinggi.
// ════════════════════════════════════════════════════════════
const _C12C='#22d3ee', _C12A='#f59e0b', _C12G='#00e09e', _C12R='#ef4444', _C12V='#a855f7', _C12P='#ec4899', _C12T='rgba(226,232,240,.92)', _C12M='rgba(148,163,184,.85)';
const _F12_9="9px 'JetBrains Mono',monospace", _F12_10="10px 'JetBrains Mono',monospace", _F12_11="11px 'JetBrains Mono',monospace";
// ── Garis tercatat dan label bebas garis ─────────────────────────────────────────────
// Selama satu bingkai, setiap garis yang di-stroke dicatat sebagai ruas (setengah tebal e, kotak pembatas, dan tanda
// "lunak" untuk garis bantu putus-putus atau samar). Label yang menempel pada gambar ditulis SESUDAH semua garis lewat
// _cad12Label: dipakai calon posisi pertama yang tintanya berjarak ≥ 1,5 px dari semua ruas, tidak menimpa teks lain,
// dan di dalam kanvas. Di layar lebar calon pertama adalah posisi semula, jadi label hanya bergeser bila akan duduk di
// atas garis. Hanya bila tak ada calon bebas, label memakai pelat _ttlLabel di calon yang sekadar menyentuh garis bantu
// lunak (tidak pernah menutupi garis gambar utama, kecuali benar-benar tidak ada pilihan lain).
const _G12={r:[],k:[],W:0,H:0};
function _cad12Awal(W,H){_G12.r=[]; _G12.k=[]; _G12.W=W; _G12.H=H;}
function _cad12Alfa(w){const m=/rgba\(([^)]*)\)/.exec(String(w)); return m?+m[1].split(',')[3]:1;}
function _cad12Ruas(x1,y1,x2,y2,lw,lunak){_G12.r.push([x1,y1,x2,y2,(lw||1)/2,Math.min(x1,x2),Math.min(y1,y2),Math.max(x1,x2),Math.max(y1,y2),!!lunak]);}
function _cad12RuasBusur(cx,cy,r,a0,a1,lw,lunak){const n=Math.max(8,Math.ceil(Math.abs(a1-a0)*r/5)); let px=cx+r*Math.cos(a0), py=cy+r*Math.sin(a0); for(let i=1;i<=n;i++){const a=a0+(a1-a0)*i/n, qx=cx+r*Math.cos(a), qy=cy+r*Math.sin(a); _cad12Ruas(px,py,qx,qy,lw,lunak); px=qx; py=qy;}}
function _cad12RuasJalur(titik,lw,tutup,lunak){for(let i=1;i<titik.length;i++) _cad12Ruas(titik[i-1][0],titik[i-1][1],titik[i][0],titik[i][1],lw,lunak); if(tutup&&titik.length>2) _cad12Ruas(titik[titik.length-1][0],titik[titik.length-1][1],titik[0][0],titik[0][1],lw,lunak);}
// Liang–Barsky: true bila ruas (x1,y1)-(x2,y2) masuk persegi [a,b]-[c,d].
function _cad12Klip(x1,y1,x2,y2,a,b,c,d){let t0=0,t1=1; const dx=x2-x1, dy=y2-y1, p=[-dx,dx,-dy,dy], q=[x1-a,c-x1,y1-b,d-y1];
  for(let i=0;i<4;i++){if(p[i]===0){if(q[i]<0) return false;} else {const t=q[i]/p[i]; if(p[i]<0){if(t>t1) return false; if(t>t0) t0=t;} else {if(t<t0) return false; if(t<t1) t1=t;}}} return t0<=t1;}
// 0 = kotak k bebas garis, 1 = hanya disentuh garis bantu lunak, 2 = dilewati garis gambar.
function _cad12Kena(k,m){let h=0; for(const s of _G12.r){const e=s[4]+m; if(s[5]>k[2]+e||s[7]<k[0]-e||s[6]>k[3]+e||s[8]<k[1]-e) continue; if(_cad12Klip(s[0],s[1],s[2],s[3],k[0]-e,k[1]-e,k[2]+e,k[3]+e)){if(!s[9]) return 2; h=1;}} return h;}
function _cad12Tinta(ctx,s,x,y){const u=ctx.measureText(s); return [x-u.actualBoundingBoxLeft,y-u.actualBoundingBoxAscent,x+u.actualBoundingBoxRight,y+u.actualBoundingBoxDescent];}
function _cad12Daftar(k){_G12.k.push(k);}
function _cad12Tindih(k){return _G12.k.some(b=>Math.min(k[2],b[2])-Math.max(k[0],b[0])>-2&&Math.min(k[3],b[3])-Math.max(k[1],b[1])>-2);}
// calon = [[x, y, align, font?], ...]. Mengembalikan kotak tinta label yang ditulis.
function _cad12Label(ctx,s,calon,warna,font){
  let lunak=null, cadangan=null;
  for(const [x,y,al,f] of calon){
    ctx.font=f||font||_F12_10; ctx.textAlign=al||'left'; const k=_cad12Tinta(ctx,s,x,y);
    if(k[0]<2||k[1]<2||k[2]>_G12.W-2||k[3]>_G12.H-2||_cad12Tindih(k)) continue;
    const h=_cad12Kena(k,1.5);
    if(!h){ctx.fillStyle=warna; ctx.fillText(s,x,y); _cad12Daftar(k); return k;}
    if(h===1&&!lunak) lunak=[x,y,al,f,k]; if(!cadangan) cadangan=[x,y,al,f,k];
  }
  const [x,y,al,f,k]=lunak||cadangan||[calon[0][0],calon[0][1],calon[0][2],calon[0][3],[0,0,0,0]];
  ctx.font=f||font||_F12_10; ctx.textAlign=al||'left'; ctx.fillStyle=warna; _ttlLabel(ctx,s,x,y,{pad:1}); _cad12Daftar(k); return k;
}
// Calon melingkar di sekitar (x, y): cincin berjari-jari d0, d0+4, …, d1; 16 arah per cincin mulai dari arah a0
// (radian, sumbu y ke atas) lalu bergantian ke dua sisinya. Label rata tengah, pusat tintanya di titik calon.
function _cad12Cincin(x,y,d0,d1,a0){const c=[]; for(let d=d0;d<=d1;d+=4) for(let i=0;i<16;i++){const a=(a0||0)+(i%2?1:-1)*Math.ceil(i/2)*Math.PI/8; c.push([x+d*Math.cos(a),y-d*Math.sin(a)+3.5,'center']);} return c;}
// Garis yang dicatat: pembungkus _ttlGaris (putus-putus atau samar = garis bantu lunak).
function _cad12G(ctx,x1,y1,x2,y2,warna,lebar,putus){_cad12Ruas(x1,y1,x2,y2,lebar||1,(putus&&putus.length)||_cad12Alfa(warna)<=0.4); _ttlGaris(ctx,x1,y1,x2,y2,warna,lebar,putus);}
function _cad12Teks(ctx,s,x,y,warna,font,align){ctx.fillStyle=warna; ctx.font=font||"11px 'JetBrains Mono',monospace"; ctx.textAlign=align||'left'; ctx.fillText(s,x,y); _cad12Daftar(_cad12Tinta(ctx,s,x,y));}
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
    if(ctx.measureText(utuh).width<=maxW){ctx.fillText(utuh,x,y); _cad12Daftar(_cad12Tinta(ctx,utuh,x,y)); ctx.font=f; return 0;}
  }
  ctx.font=f;
  const baris=[]; let b='';
  for(const p of potong){const coba=b+p; if(b&&ctx.measureText(coba).width>maxW){baris.push(b); b=p.replace(/^ +/,'');} else b=coba;}
  if(b) baris.push(b);
  let yy=y;
  for(const s of baris){_cad12Daftar(_cad12Tinta(ctx,s,x,yy)); yy=_ttlTeks(ctx,s,x,yy,maxW,{lh});}
  ctx.font=f; return yy-y-lh;
}
function _cad12Kotak(ctx,x,y,w,h,isi,garis,lebar){if(garis) _cad12RuasJalur([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],lebar||1.4,true,_cad12Alfa(garis)<=0.4); if(isi){ctx.fillStyle=isi; ctx.fillRect(x,y,w,h);} if(garis){ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.4; ctx.strokeRect(x,y,w,h);}}
function _cad12Lingkar(ctx,x,y,r,isi,garis,lebar,putus){if(garis) _cad12RuasBusur(x,y,Math.max(0.1,r),0,2*Math.PI,lebar||1.2,(putus&&putus.length)||_cad12Alfa(garis)<=0.4); ctx.setLineDash(putus||[]); ctx.beginPath(); ctx.arc(x,y,Math.max(0.1,r),0,Math.PI*2); if(isi){ctx.fillStyle=isi; ctx.fill();} if(garis){ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.2; ctx.stroke();} ctx.setLineDash([]);}
function _cad12Panah(ctx,x1,y1,x2,y2,warna){const a=Math.atan2(y2-y1,x2-x1); _cad12G(ctx,x1,y1,x2,y2,warna,1.2); _cad12RuasJalur([[x2,y2],[x2-7*Math.cos(a)+3.5*Math.sin(a),y2-7*Math.sin(a)-3.5*Math.cos(a)],[x2-7*Math.cos(a)-3.5*Math.sin(a),y2-7*Math.sin(a)+3.5*Math.cos(a)]],1,true); ctx.fillStyle=warna; ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-7*Math.cos(a)+3.5*Math.sin(a),y2-7*Math.sin(a)-3.5*Math.cos(a)); ctx.lineTo(x2-7*Math.cos(a)-3.5*Math.sin(a),y2-7*Math.sin(a)+3.5*Math.cos(a)); ctx.closePath(); ctx.fill();}
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
  const k=_ttlKanvas('cvFit',_cad12TinggiSempit('cvFit',[[244,395],[369,356],[1e9,343]])); if(!k) return; const {ctx,W,H}=k; _cad12Awal(W,H);
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
  // xa = panah c_maks (labelnya di kanan panah, sebelum zona lubang), x1/x2 = zona lubang/poros selebar lb.
  // Garis nol berhenti tepat sesudah zona poros sehingga tidak melintasi label es/ei; keterangannya menjadi legenda
  // di atas zona (dulu tertulis di dalam zona lubang, di atas garis-garisnya).
  let sk, y0, x1, x2, lb, xa, xg0, yLeg, yZona;
  if(sempit){
    lb=Math.max(22,Math.min(70,(W-152)/2)); const off=Math.max(0,(W-24-(128+2*lb))/2);
    xa=16+off; x1=xa+42; x2=x1+lb+40; xg0=xa-6;
    yLeg=33+tb; yZona=yLeg+17; sk=Math.max(0.05,140/(atas-bawah)); y0=yZona+10+atas*sk;
  } else {
    sk=Math.max(0.05,(H*0.56)/(atas-bawah)); y0=H*0.30+atas*sk;
    xa=W*0.06; x1=Math.max(W*0.10,xa+44); lb=Math.max(20,Math.min(W*0.14,(W*0.52-x1-90)/2)); x2=Math.max(W*0.30,x1+lb+46); xg0=W*0.05;
    yLeg=44+tb; yZona=Math.max(H*0.20,yLeg+14);
  }
  const Z=v=>y0-v*sk, xg1=x2+lb+3;
  // garis nol, legenda, dan zona
  _cad12G(ctx,xg0,Z(0),xg1,Z(0),_C12R,1.4,[7,4]);
  const xl=sempit?xa-6:W*0.05;
  _cad12G(ctx,xl,yLeg-3,xl+18,yLeg-3,_C12R,1.4,[7,4]);
  _cad12Kotak(ctx,x1,Z(ES),lb,Math.max(1,(ES-EI)*sk),'rgba(34,211,238,.22)',_C12C,1.6);
  _cad12Kotak(ctx,x2,Z(es),lb,Math.max(1,IT*sk),'rgba(245,158,11,.22)',_C12A,1.6);
  _cad12Panah(ctx,xa,Z(ES),xa,Z(ei),warna); _cad12Panah(ctx,xa,Z(ei),xa,Z(ES),warna);
  // teks tetap: legenda, nama zona, kolom kanan (layar sempit: di bawah zona)
  _cad12Teks(ctx,'garis nol (ukuran nominal)',xl+24,yLeg,_C12R,_F12_9);
  _cad12Teks(ctx,'lubang H',x1+lb/2,yZona,_C12C,_F12_10,'center');
  _cad12Teks(ctx,'poros',x2+lb/2,yZona,_C12A,_F12_10,'center');
  const tx=sempit?14:W*0.58, ty=sempit?y0-bawah*sk+26:H*0.22, j=sempit?[14,17,15,18,15,15]:[18,26,20,28,20,24];
  _cad12Kolom(ctx,[
    [['lubang: '+(12+EI/1000).toFixed(4)+' … '+(12+ES/1000).toFixed(4)+' mm'],_C12C,_F12_10,j[0]],
    [['poros : '+(12+ei/1000).toFixed(4)+' … '+(12+es/1000).toFixed(4)+' mm'],_C12A,_F12_10,j[1]],
    [['c_maks = (ES − ei)/1000',' = '+cMaks.toFixed(4)+' mm'],warna,_F12_11,j[2]],
    [['c_min  = (EI − es)/1000',' = '+cMin.toFixed(4)+' mm'],warna,_F12_11,j[3]],
    [jenis,warna,"bold 12px 'JetBrains Mono',monospace",j[4]],
    [cMin>0?'poros selalu bebas berputar':(cMaks<0?'harus dipres atau dipanaskan':'bisa longgar, bisa sesak'),_C12M,_F12_10,j[5]],
    ['contoh nominal ⌀12 mm',_C12M,_F12_10,0]],tx,ty,sempit?W-28:W-tx-8,13);
  // Label batas zona dan c_maks ditulis terakhir, di calon pertama yang tidak dilewati garis nol atau tepi zona.
  const xL=x1+lb+6, xP=x2+lb+6, yC=(Z(ES)+Z(ei))/2;
  _cad12Label(ctx,'ES +'+ES,[[xL,Z(ES)+4,'left'],[xL,Z(ES)-3,'left'],[xL,Z(ES)+11,'left'],..._cad12Cincin(xL+16,Z(ES),8,28,Math.PI/2)],_C12C,_F12_9);
  _cad12Label(ctx,'EI 0',[[xL,Z(EI)+12,'left'],[xL,Z(EI)+19,'left'],[xL,Z(EI)-5,'left'],..._cad12Cincin(xL+12,Z(EI),10,30,-Math.PI/2)],_C12C,_F12_9);
  _cad12Label(ctx,'es '+(es<0?'−':'+')+Math.abs(es),[[xP,Z(es)+4,'left'],[xP,Z(es)-3,'left'],[xP,Z(es)+11,'left'],..._cad12Cincin(xP+16,Z(es),8,28,Math.PI/2)],_C12A,_F12_9);
  _cad12Label(ctx,'ei '+(ei<0?'−':'+')+Math.abs(ei),[[xP,Z(ei)+12,'left'],[xP,Z(ei)+4,'left'],[xP,Z(ei)+19,'left'],..._cad12Cincin(xP+16,Z(ei),8,28,-Math.PI/2)],_C12A,_F12_9);
  _cad12Label(ctx,'c_maks',[[xa+4,yC,'left'],[xa+4,Z(0)-7,'left'],[xa+4,Z(0)+14,'left'],[xa+4,(Z(ES)+Z(0))/2+3,'left'],[xa+4,(Z(0)+Z(ei))/2+3,'left'],..._cad12Cincin(xa+20,yC,6,30,0)],warna,_F12_9);
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
  const k=_ttlKanvas('cvTabrak',_cad12TinggiSempit('cvTabrak',[[244,405],[274,382],[298,375],[369,369],[1e9,357]])); if(!k) return; const {ctx,W,H}=k; _cad12Awal(W,H);
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
  const eL=sempit?_cad12Muat(ctx,['tampak atas (XY)',' — penampang bersama b × h'],W/2,yLab,W-24,_C12M,_F12_10,'center',12)
    :_cad12Muat(ctx,['tampak atas (XY)',' — penampang bersama b × h'],X(0),yLab,W*0.55-X(0)-8,_C12M,_F12_10,'left',12);
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
  _cad12G(ctx,gx,gy,gx+gw,gy,'rgba(148,163,184,.5)',1); _cad12G(ctx,gx,gy,gx,gy-gh,'rgba(148,163,184,.5)',1);
  const vmax=12*b*h;
  const kurva=[]; for(let i=0;i<=60;i++){const dv=-3+i/60*15; kurva.push([gx+i/60*gw,gy-(dv>0?dv*b*h:0)/vmax*gh]);}
  ctx.strokeStyle=_C12R; ctx.lineWidth=1.5; ctx.beginPath(); kurva.forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py)); ctx.stroke(); _cad12RuasJalur(kurva,1.5);
  _cad12Lingkar(ctx,gx+(d+3)/15*gw,gy-V/vmax*gh,4,_C12G,null);
  // label yang menempel pada gambar ditulis terakhir, di calon pertama yang tidak dilewati garis
  const FB="bold 11px 'JetBrains Mono',monospace";
  _cad12Label(ctx,'A',[[X(a1/2),Y(0)-8,'center'],[X(a1/2)-12,Y(0)-8,'center'],[X(a1/2)+12,Y(0)-8,'center'],..._cad12Cincin(X(a1/2),Y(0)-12,4,24,Math.PI/2)],_C12C,FB);
  _cad12Label(ctx,'B',[[X(a1-d+a2/2),Y(0)-8,'center'],[X(a1-d+a2/2)+12,Y(0)-8,'center'],[X(a1-d+a2/2)-12,Y(0)-8,'center'],..._cad12Cincin(X(a1-d+a2/2),Y(0)-12,4,24,Math.PI/2)],_C12A,FB);
  const sD=d>0?'δ = '+_cad12Koma(d,2):'celah = '+_cad12Koma(-d,2)+' mm', yDl=yLab+eL+18;
  ctx.font=_F12_10; const wD=ctx.measureText(sD).width/2+4, xD=Math.min(W-wD,Math.max(wD,X(a1-d/2)));
  _cad12Label(ctx,sD,[[xD,yDl,'center'],[xD+24,yDl,'center'],[xD-24,yDl,'center']],d>0?_C12R:_C12G,_F12_10);
  _cad12Label(ctx,'V_int(δ)',[[gx+4,gy-gh+10,'left'],[gx+4,gy-gh-4,'left'],[gx+gw*0.3,gy-gh+10,'left']],_C12M,_F12_9);
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
  const k=_ttlKanvas('cvDinding',_cad12TinggiSempit('cvDinding',[[244,325],[274,320],[298,310],[1e9,297]])); if(!k) return; const {ctx,W,H}=k; _cad12Awal(W,H);
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
  _cad12Panah(ctx,X(a)+12,Y(dasar),X(a)+12,Y(0),dasarTipis?_C12R:_C12M);
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
  // Label ukuran ditulis terakhir, di calon pertama yang tidak dilewati tepi penampang, rongga, atau panah ukur.
  // Label Pocket: di dalam rongga bila muat, lalu di tengah rongga, lalu di dinding dasar di bawah rongga.
  const F85="8.5px 'JetBrains Mono',monospace", xP=X(w+ai/2), sPk='Pocket p = '+p.toFixed(0);
  _cad12Label(ctx,sPk,[[xP,Y(h)+16,'center'],[xP,Y(h)+p*sk/2+4,'center'],[xP,Y(h)+p*sk+13,'center'],[xP,(Y(h)+p*sk+Y(0))/2+4,'center'],
    [xP,Y(h)+16,'center',F85],[xP,Y(h)+p*sk/2+4,'center',F85],[xP,Y(h)+p*sk+12,'center',F85],[X(a),Y(h)-14,'right'],..._cad12Cincin(xP,Y(h)+p*sk/2,6,30,-Math.PI/2)],_C12V,_F12_10);
  _cad12Label(ctx,'w = '+_cad12Koma(w,2),[[X(w)+8,Y(h)-14,'left'],[X(w)+8,Y(h)-17,'left'],[X(0),Y(h)-22,'left'],..._cad12Cincin(X(w)+30,Y(h)-16,6,26,Math.PI/2)],warna,_F12_10);
  _cad12Label(ctx,'dasar '+_cad12Koma(dasar,1),[[X(a)+18,Y(dasar/2)+4,'left'],[X(a)+18,Y(0)-2,'left'],[X(a)+18,Y(dasar)+9,'left'],[X(a)+18,Y(0)+11,'left'],..._cad12Cincin(X(a)+44,Y(dasar/2),6,26,0)],dasarTipis?_C12R:_C12M,_F12_10);
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
  const k=_ttlKanvas('cvLengan',_cad12TinggiSempit('cvLengan',[[244,370],[298,357],[1e9,330]])); if(!k) return; const {ctx,W,H}=k; _cad12Awal(W,H);
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
  else{oy=H*0.52; sk=Math.max(0.05,Math.min((W*0.50)/(Wd+rs*0.4+30),(H*0.46)/(rs+10),(H-22-oy)/rs,(W*0.56-26)/(rs+Wd))); ox=W*0.06+rs*sk; yDa=H*0.10; yDb=H*0.88; yTh=H-12;}
  const X=v=>ox+v*sk, Y=v=>oy-v*sk;
  _cad12Lingkar(ctx,X(0),Y(0),rs*sk,null,'rgba(236,72,153,.55)',1,[5,4]);
  // dinding
  _cad12Kotak(ctx,X(Wd),yDa,10,yDb-yDa,'rgba(148,163,184,.20)','rgba(148,163,184,.65)',1.2);
  for(let yy=yDa+H*0.02;yy<yDb-H*0.02;yy+=14) _cad12G(ctx,X(Wd)+10,yy,X(Wd)+18,yy-6,'rgba(148,163,184,.4)',0.8);
  // lengan
  ctx.beginPath(); sudut.forEach(([x,y],i)=>{i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y));}); ctx.closePath(); _cad12RuasJalur(sudut.map(([x,y])=>[X(x),Y(y)]),1.8,true);
  ctx.fillStyle=cSaat>0?'rgba(34,211,238,.20)':'rgba(239,68,68,.35)'; ctx.fill();
  ctx.strokeStyle=cSaat>0?_C12C:_C12R; ctx.lineWidth=1.8; ctx.stroke();
  _cad12Lingkar(ctx,X(0),Y(0),4,'#e2e8f0',null);
  // jarak sesaat
  const warna=cSaat>0?(Math.abs(cSaat-cMin)<0.5?_C12G:_C12A):_C12R;
  _cad12Panah(ctx,X(xMaks),Y(0)-24,X(Wd),Y(0)-24,warna);
  const tx=sempit?14:W*0.62, ty=sempit?yTh+22:H*0.22, j=sempit?[16,18,16,18,15,17]:[20,24,20,24,22,24];
  _cad12Kolom(ctx,[
    [['√(R² + (w/2)²)',' = '+rs.toFixed(3)+' mm'],_C12P,_F12_11,j[0]],
    [['W − R = '+(Wd-R).toFixed(3)+' mm',' (keliru)'],_C12M,_F12_10,j[1]],
    ['c_min = W − √(R² + (w/2)²)',_C12C,_F12_11,j[2]],
    ['      = '+cMin.toFixed(3)+' mm',cMin>0?_C12G:_C12R,"bold 12px 'JetBrains Mono',monospace",j[3]],
    [['θ* = arctan((w/2)/R)',' = '+thStar.toFixed(2)+'°'],_C12A,_F12_10,j[4]],
    [['jarak sesaat',' = '+_cad12Koma(cSaat,3)+' mm'],warna,_F12_10,j[5]],
    [cMin>0?'AMAN sepanjang putaran':'MENABRAK — perpendek R atau jauhkan dinding',cMin>0?_C12G:_C12R,"bold 11px 'JetBrains Mono',monospace",0]],tx,ty,sempit?W-28:W-tx-8,13);
  // Label ditulis terakhir, di calon pertama yang tidak dilewati lengan, lingkaran sapuan, dinding, atau panah.
  const sJ=_cad12Koma(cSaat,2), mJ=(X(xMaks)+X(Wd))/2;
  _cad12Label(ctx,sJ,[[mJ,Y(0)-30,'center'],[mJ,Y(0)-13,'center'],[mJ-18,Y(0)-30,'center'],[mJ+18,Y(0)-30,'center'],[X(Wd)-4,Y(0)-30,'right'],[X(Wd)+22,Y(0)-20,'left'],..._cad12Cincin(mJ,Y(0)-24,8,64,Math.PI/2)],warna,_F12_10);
  ctx.font=_F12_10; const sTh='θ = '+th.toFixed(0)+'°', wTh=ctx.measureText(sTh).width/2+4, xTh=Math.min(W-wTh,Math.max(wTh,X(0)));
  _cad12Label(ctx,sTh,[[xTh,yTh,'center'],[xTh+rs*sk*0.8,yTh,'center'],[xTh-rs*sk*0.8,yTh,'center'],..._cad12Cincin(xTh,yTh-6,6,24,-Math.PI/2)],_C12M,_F12_10);
  ctx.font=_F12_9; const wSb=ctx.measureText('sumbu putar').width, xSb=Math.max(wSb+4,X(0)-6);
  _cad12Label(ctx,'sumbu putar',[[xSb,Y(0)+18,'right'],[X(0),Y(0)+18,'center'],[X(0),Y(0)-12,'center'],..._cad12Cincin(X(0),Y(0),14,rs*sk+34,tr+Math.PI)],_C12M,_F12_9);
  _ttlTulis('lenganInfo','R = '+R+', w = '+w+', W = '+Wd+': jarak sudut terjauh ke sumbu = √('+R+'² + '+(w/2)+'²) = '+rs.toFixed(3)+' mm, sehingga c_min = '+Wd+' − '+rs.toFixed(3)+' = '+cMin.toFixed(3)+' mm pada θ* = '+thStar.toFixed(2)+'°. Memakai W − R = '+(Wd-R).toFixed(3)+' mm akan menaksir jarak bebas terlalu besar.');
  if(_ttlJalan('lengan')){_lgFrame++; requestAnimationFrame(drawLengan);}
}

_TTL_DAFTAR.push(['cvFit',()=>drawFit(),'fit',['sl_ft_ES','sl_ft_es','sl_ft_it']]);
_TTL_DAFTAR.push(['cvTabrak',()=>drawTabrak(),'tabrak',['sl_tb_d','sl_tb_b','sl_tb_h']]);
_TTL_DAFTAR.push(['cvDinding',()=>drawDinding(),'dinding',['sl_dd_w','sl_dd_p','sl_dd_min']]);
_TTL_DAFTAR.push(['cvLengan',()=>drawLengan(),'lengan',['sl_lg_R','sl_lg_w','sl_lg_W']]);
_ttlMulai();
