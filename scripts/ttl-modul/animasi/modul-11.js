// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 11 TEKNIK TENAGA LISTRIK — Konsep dan Teori Dasar Sistem Distribusi
// Kanvas: cvKurvaBeban, cvKonfigurasi, cvProfilJTR, cvKeandalan
// ════════════════════════════════════════════════════════════
const _SQ3_11=Math.sqrt(3);
function _sumbu11(ctx,padL,padT,plotW,plotH){
  _ttlGaris(ctx,padL,padT,padL,padT+plotH,'rgba(148,163,184,.45)',1.2);
  _ttlGaris(ctx,padL,padT+plotH,padL+plotW,padT+plotH,'rgba(148,163,184,.45)',1.2);
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.7)';
}

// ── ANIMASI 1 — Kurva beban harian gabungan dan faktor-faktor beban ──
let _kbFrame=0;
function toggleKurvaBeban(){_ttlToggle('kurvabeban','btnKurvaBeban',drawKurvaBeban);}
window.toggleKurvaBeban=toggleKurvaBeban;
// profil per jam (kW per unit) tiga jenis pelanggan
const _PROF_RUMAH=[0.35,0.3,0.28,0.28,0.32,0.45,0.7,0.65,0.5,0.45,0.45,0.5,0.55,0.5,0.48,0.5,0.6,0.85,1.0,0.98,0.9,0.75,0.55,0.42];
const _PROF_RUKO=[0.15,0.12,0.1,0.1,0.1,0.15,0.3,0.55,0.8,0.95,1.0,1.0,0.95,0.98,1.0,0.95,0.9,0.85,0.8,0.7,0.55,0.35,0.25,0.2];
const _PROF_IND=[0.45,0.45,0.45,0.45,0.45,0.5,0.7,0.95,1.0,1.0,1.0,0.95,0.85,1.0,1.0,1.0,0.95,0.7,0.5,0.45,0.45,0.45,0.45,0.45];
function drawKurvaBeban(){
  const k=_ttlKanvas('cvKurvaBeban'); if(!k) return; const {ctx,W,H}=k;
  const nR=_ttlNilai('sl_kb_rumah',120), nK=_ttlNilai('sl_kb_ruko',10), pI=_ttlNilai('sl_kb_ind',100);
  _ttlTulis('v_kb_rumah',nR.toFixed(0)); _ttlTulis('v_kb_ruko',nK.toFixed(0)); _ttlTulis('v_kb_ind',pI.toFixed(0));
  const dR=1.3, dK=5.0; // kW puncak per rumah / per ruko
  const jam=[], tot=[]; let pmax=0, hmax=0, e=0;
  for(let h=0;h<24;h++){const r=nR*dR*_PROF_RUMAH[h], kk=nK*dK*_PROF_RUKO[h], i=pI*_PROF_IND[h]; jam.push([r,kk,i]); const s=r+kk+i; tot.push(s); e+=s; if(s>pmax){pmax=s;hmax=h;}}
  const terhubung=nR*dR*2.4+nK*dK*1.8+pI*1.3; // beban terhubung ≈ beberapa kali kebutuhan maksimum
  const sumIndiv=nR*dR+nK*dK+pI; // Σ kebutuhan maksimum kelompok (bila tiap unit puncak sendiri)
  const lf=e/(pmax*24), lossf=0.3*lf+0.7*lf*lf, df=pmax/terhubung, fd=sumIndiv/pmax;
  const padL=56,padR=170,padT=20,padB=32,plotW=W-padL-padR,plotH=H-padT-padB;
  const ymax=Math.max(10,Math.ceil(pmax/50)*50*1.1);
  const X=h=>padL+h/24*plotW, Y=v=>padT+plotH-v/ymax*plotH;
  _sumbu11(ctx,padL,padT,plotW,plotH);
  ctx.textAlign='right'; for(let i=0;i<=4;i++){const v=ymax*i/4; _ttlGaris(ctx,padL,Y(v),padL+plotW,Y(v),'rgba(148,163,184,.12)',1); ctx.fillText(v.toFixed(0)+' kW',padL-4,Y(v)+4);}
  ctx.textAlign='center'; for(let h=0;h<=24;h+=4) ctx.fillText(h+':00',X(h),padT+plotH+16);
  // area bertumpuk
  const warna=['rgba(0,229,255,.55)','rgba(255,179,0,.55)','rgba(168,85,247,.55)'], nama=['rumah tangga','ruko/komersial','industri'];
  for(let lay=2;lay>=0;lay--){ctx.fillStyle=warna[lay]; ctx.beginPath(); ctx.moveTo(X(0),Y(0)); for(let h=0;h<24;h++){let s=0; for(let j=0;j<=lay;j++) s+=jam[h][j]; ctx.lineTo(X(h+0.5),Y(s));} ctx.lineTo(X(24),Y(0)); ctx.closePath(); ctx.fill();}
  ctx.strokeStyle='rgba(239,68,68,.95)'; ctx.lineWidth=2; ctx.beginPath(); for(let h=0;h<24;h++){h?ctx.lineTo(X(h+0.5),Y(tot[h])):ctx.moveTo(X(h+0.5),Y(tot[h]));} ctx.stroke();
  // garis rata-rata dan puncak
  _ttlGaris(ctx,padL,Y(e/24),padL+plotW,Y(e/24),'rgba(0,224,158,.9)',1.4,[5,4]);
  _ttlGaris(ctx,padL,Y(pmax),padL+plotW,Y(pmax),'rgba(239,68,68,.6)',1,[3,3]);
  // titik jam berjalan
  const hj=(_kbFrame*0.08)%24; const hi=Math.floor(hj);
  const a=0.6+0.4*Math.sin(_kbFrame*0.15); ctx.fillStyle='rgba(255,255,255,'+a.toFixed(2)+')'; ctx.beginPath(); ctx.arc(X(hj),Y(tot[hi]),5,0,Math.PI*2); ctx.fill();
  ctx.textAlign='left'; ctx.font="600 10px 'JetBrains Mono',monospace";
  ctx.fillStyle='rgba(239,68,68,.95)'; ctx.fillText('P_maks '+pmax.toFixed(0)+' kW @ '+hmax+':00',padL+6,Y(pmax)-6);
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('P_rata '+(e/24).toFixed(0)+' kW',padL+6,Y(e/24)-6);
  ctx.fillStyle='rgba(255,255,255,.9)'; ctx.fillText(hi+':00 → '+tot[hi].toFixed(0)+' kW',X(hj)+8,Y(tot[hi])-8);
  // legenda & kotak faktor
  const lx=padL+plotW+14; nama.forEach((n,i)=>{ctx.fillStyle=warna[i]; ctx.fillRect(lx,padT+i*15,10,10); ctx.fillStyle='rgba(226,232,240,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText(n,lx+14,padT+9+i*15);});
  const baris=[['faktor beban',lf.toFixed(3)],['faktor rugi',lossf.toFixed(3)],['faktor kebutuhan',df.toFixed(2)],['faktor keragaman',fd.toFixed(2)],['energi/hari',(e/1000).toFixed(1)+' MWh']];
  baris.forEach(([n,v],i)=>{ctx.fillStyle='rgba(148,163,184,.8)'; ctx.fillText(n,lx,padT+62+i*15); ctx.fillStyle='rgba(0,229,255,.95)'; ctx.textAlign='right'; ctx.fillText(v,lx+150,padT+62+i*15); ctx.textAlign='left';});
  _ttlTulis('kurvaBebanInfo',nR+' rumah × '+dR+' kW, '+nK+' ruko × '+dK+' kW, industri '+pI+' kW   |   P_maks gabungan '+pmax.toFixed(0)+' kW pada '+hmax+':00 (Σ puncak individu '+sumIndiv.toFixed(0)+' kW → faktor keragaman '+fd.toFixed(2)+')   |   energi '+(e/1000).toFixed(2)+' MWh/hari, P_rata '+(e/24).toFixed(0)+' kW → faktor beban '+lf.toFixed(3)+', faktor rugi '+lossf.toFixed(3)+'   |   beban terhubung ≈ '+terhubung.toFixed(0)+' kW → faktor kebutuhan '+df.toFixed(2)+'   |   trafo gardu ≥ '+(pmax/0.9).toFixed(0)+' kVA pada pf 0,9');
  if(_ttlJalan('kurvabeban')){_kbFrame++; requestAnimationFrame(drawKurvaBeban);}
}

// ── ANIMASI 2 — Konfigurasi jaringan dan pemulihan pasokan saat gangguan ──
let _kfFrame=0;
function toggleKonfigurasi(){_ttlToggle('konfigurasi','btnKonfigurasi',drawKonfigurasi);}
window.toggleKonfigurasi=toggleKonfigurasi;
function drawKonfigurasi(){
  const k=_ttlKanvas('cvKonfigurasi'); if(!k) return; const {ctx,W,H}=k;
  const mode=Math.round(_ttlNilai('sl_kf_mode',0)), gg=_ttlNilai('sl_kf_gangguan',0.55), nSeksi=Math.round(_ttlNilai('sl_kf_seksi',4));
  const namaMode=['radial','loop (ring) dengan titik NO','spindle (penyulang ekspres)'][mode];
  _ttlTulis('v_kf_mode',namaMode); _ttlTulis('v_kf_gangguan',(gg*100).toFixed(0)+' %'); _ttlTulis('v_kf_seksi',nSeksi.toFixed(0));
  const fase=(_kfFrame%240)/240; // 0–0,25 gangguan, 0,25–0,5 isolasi, 0,5–1 pemulihan
  const seksiG=Math.min(nSeksi-1,Math.floor(gg*nSeksi));
  const padL=70,padR=40,y=H*0.42,plotW=W-padL-padR;
  const X=p=>padL+p*plotW;
  const ambang=[0.25,0.5];
  // status tiap seksi: 1 nyala, 0 padam, 2 dipasok dari arah lain
  const status=[]; for(let s=0;s<nSeksi;s++){let st=1;
    if(fase>=0) st=(fase<ambang[0])?0:1; // gangguan: seluruh penyulang trip
    if(fase>=ambang[0]){ // setelah isolasi seksi gangguan
      if(s<seksiG) st=1; else if(s===seksiG) st=0; else st=(mode===0)?0:(fase>=ambang[1]?2:0);
    }
    if(fase<ambang[0]) st=0; status.push(st);}
  // gambar sumber & penyulang
  ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.beginPath(); ctx.arc(padL-30,y,10,0,Math.PI*2); ctx.fill(); ctx.fillText('GI A',padL-30,y-18);
  if(mode>0){ctx.fillStyle=mode===1?'rgba(0,229,255,.95)':'rgba(255,179,0,.95)'; ctx.beginPath(); ctx.arc(padL+plotW+30,y,10,0,Math.PI*2); ctx.fill(); ctx.fillText(mode===1?'GI B':'GH',padL+plotW+30,y-18);}
  _ttlGaris(ctx,padL-20,y,padL,y,'rgba(148,163,184,.8)',2.5);
  for(let s=0;s<nSeksi;s++){
    const x1=X(s/nSeksi), x2=X((s+1)/nSeksi);
    const warna=status[s]===1?'rgba(0,224,158,.95)':status[s]===2?(mode===1?'rgba(0,229,255,.95)':'rgba(255,179,0,.95)'):'rgba(100,116,139,.6)';
    _ttlGaris(ctx,x1,y,x2,y,warna,3);
    // pemisah (sectionalizer) — kotak
    if(s>0){const buka=(fase>=ambang[0])&&(s===seksiG||s===seksiG+1); ctx.fillStyle=buka?'rgba(239,68,68,.95)':'rgba(226,232,240,.9)'; ctx.fillRect(x1-5,y-7,10,14); ctx.fillStyle='rgba(148,163,184,.8)'; ctx.font="9px 'JetBrains Mono',monospace"; ctx.fillText(buka?'OPEN':'LBS',x1,y-12);}
    // beban seksi
    for(let b=0;b<3;b++){const xb=x1+(b+0.5)/3*(x2-x1); _ttlGaris(ctx,xb,y,xb,y+26,warna,1.2); ctx.fillStyle=warna; ctx.fillRect(xb-5,y+26,10,10);}
    ctx.fillStyle='rgba(148,163,184,.8)'; ctx.font="9px 'JetBrains Mono',monospace"; ctx.fillText('seksi '+(s+1),(x1+x2)/2,y+52);
  }
  // titik NO / ekspres di ujung
  if(mode===1){const no=fase>=ambang[1]; ctx.fillStyle=no?'rgba(0,229,255,.95)':'rgba(226,232,240,.9)'; ctx.fillRect(X(1)-5,y-7,10,14); ctx.fillStyle='rgba(148,163,184,.8)'; ctx.fillText(no?'NC':'NO',X(1),y-12); _ttlGaris(ctx,X(1),y,padL+plotW+20,y,no?'rgba(0,229,255,.95)':'rgba(100,116,139,.5)',2.5,no?[]:[4,4]);}
  if(mode===2){const on=fase>=ambang[1]; _ttlGaris(ctx,padL-20,y+80,padL+plotW+30,y+80,on?'rgba(255,179,0,.95)':'rgba(255,179,0,.35)',2.5,[6,4]); ctx.fillStyle='rgba(255,179,0,.9)'; ctx.fillText('penyulang ekspres (tanpa beban) → GH',padL+plotW/2,y+95); _ttlGaris(ctx,padL+plotW+30,y+80,padL+plotW+30,y+10,on?'rgba(255,179,0,.95)':'rgba(255,179,0,.35)',2.5); _ttlGaris(ctx,X(1),y,padL+plotW+20,y,on?'rgba(255,179,0,.95)':'rgba(100,116,139,.5)',2.5,on?[]:[4,4]);}
  // gangguan berkedip
  const xg=X(gg); const a=0.5+0.5*Math.sin(_kfFrame*0.3); ctx.strokeStyle='rgba(239,68,68,'+a.toFixed(2)+')'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(xg-8,y-22); ctx.lineTo(xg+2,y-8); ctx.lineTo(xg-4,y-6); ctx.lineTo(xg+8,y+8); ctx.stroke();
  ctx.fillStyle='rgba(239,68,68,.95)'; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.fillText('gangguan',xg,y-28);
  // status teks
  const padam=status.filter(s=>s===0).length, dipulih=status.filter(s=>s===2).length;
  const tahap=fase<ambang[0]?'1. Gangguan: PMT penyulang trip, seluruh '+nSeksi+' seksi padam':fase<ambang[1]?'2. Isolasi: LBS di kedua sisi seksi '+(seksiG+1)+' dibuka, hulu dipasok kembali dari GI A':'3. Pemulihan: '+(mode===0?'hilir tetap padam sampai perbaikan selesai':'hilir dipasok dari arah lain lewat titik NO/ekspres');
  ctx.fillStyle='rgba(226,232,240,.95)'; ctx.textAlign='left'; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.fillText(tahap,padL-40,H-14);
  const pelSeksi=1000/nSeksi;
  _ttlTulis('konfigurasiInfo','Konfigurasi '+namaMode+', '+nSeksi+' seksi (≈ '+pelSeksi.toFixed(0)+' pelanggan/seksi), gangguan di seksi '+(seksiG+1)+'   |   tahap sekarang: '+padam+' seksi padam, '+dipulih+' seksi dipasok dari arah lain   |   setelah manuver: radial → '+(nSeksi-seksiG)+' seksi ('+((nSeksi-seksiG)*pelSeksi).toFixed(0)+' pelanggan) padam sampai perbaikan (± 3 jam); loop/spindle → hanya seksi gangguan ('+pelSeksi.toFixed(0)+' pelanggan)   |   SAIDI per kejadian: radial '+(3*(nSeksi-seksiG)*pelSeksi/1000+0.5*seksiG*pelSeksi/1000).toFixed(2)+' jam, loop/spindle '+(3*pelSeksi/1000+0.5*(nSeksi-1)*pelSeksi/1000).toFixed(2)+' jam (isolasi 0,5 jam, perbaikan 3 jam)');
  if(_ttlJalan('konfigurasi')){_kfFrame++; requestAnimationFrame(drawKonfigurasi);}
}

// ── ANIMASI 3 — Profil tegangan dan rugi jaringan tegangan rendah ──
let _jtFrame=0;
function toggleProfilJTR(){_ttlToggle('profiljtr','btnProfilJTR',drawProfilJTR);}
window.toggleProfilJTR=toggleProfilJTR;
function drawProfilJTR(){
  const k=_ttlKanvas('cvProfilJTR'); if(!k) return; const {ctx,W,H}=k;
  const L=_ttlNilai('sl_jt_l',300), I=_ttlNilai('sl_jt_i',80), A=_ttlNilai('sl_jt_a',70), pf=_ttlNilai('sl_jt_pf',0.9), sebar=_ttlNilai('sl_jt_sebar',1);
  _ttlTulis('v_jt_l',L.toFixed(0)); _ttlTulis('v_jt_i',I.toFixed(0)); _ttlTulis('v_jt_a',A.toFixed(0)); _ttlTulis('v_jt_pf',pf.toFixed(2)); _ttlTulis('v_jt_sebar',sebar.toFixed(2));
  const r=28.3/A, x=0.08, Vf=380/_SQ3_11, sin=Math.sqrt(1-pf*pf), seg=60;
  // arus sepanjang saluran: I(s) = I[1 − sebar·s]  (sebar 1: merata → nol di ujung; 0: terpusat di ujung)
  const V=[Vf]; let v=Vf, rugi=0;
  for(let s=0;s<seg;s++){const ps=(s+0.5)/seg; const is=I*(1-sebar*ps); v-=is*(r*pf+x*sin)*(L/1000)/seg; V.push(v); rugi+=3*is*is*r*(L/1000)/seg;}
  const dv=(Vf-V[seg])/Vf*100;
  const padL=60,padR=20,padT=24,padB=34,plotW=W-padL-padR,plotH=H-padT-padB;
  const vmin=0.85,vmax=1.01; const X=i=>padL+i/seg*plotW, Y=p=>padT+plotH-(p-vmin)/(vmax-vmin)*plotH;
  _sumbu11(ctx,padL,padT,plotW,plotH);
  ctx.textAlign='right'; for(const p of [0.85,0.9,0.95,1.0]){_ttlGaris(ctx,padL,Y(p),padL+plotW,Y(p),p===0.9?'rgba(239,68,68,.6)':'rgba(148,163,184,.12)',1,p===0.9?[4,4]:[]); ctx.fillText((p*380).toFixed(0)+' V',padL-4,Y(p)+4);}
  ctx.textAlign='center'; for(let i=0;i<=5;i++) ctx.fillText((L*i/5).toFixed(0)+' m',X(seg*i/5),padT+plotH+16);
  // beban (rumah) sepanjang saluran
  const nRumah=12; for(let b=0;b<nRumah;b++){const p=sebar>0.5?(b+0.5)/nRumah:1-(b*0.02); const xb=X(p*seg); const ib=sebar>0.5?I/nRumah:I/nRumah; const al=0.35+0.5*(0.5+0.5*Math.sin(_jtFrame*0.1+b)); ctx.fillStyle='rgba(255,179,0,'+al.toFixed(2)+')'; ctx.fillRect(xb-4,padT+plotH-10,8,8);}
  ctx.strokeStyle='rgba(0,224,158,.95)'; ctx.lineWidth=2.6; ctx.beginPath(); V.forEach((vv,i)=>{const yy=Y(Math.max(vmin,Math.min(vmax,vv/Vf))); i?ctx.lineTo(X(i),yy):ctx.moveTo(X(i),yy);}); ctx.stroke();
  // pembanding beban terpusat di ujung
  const dvT=I*(r*pf+x*sin)*(L/1000)/Vf; ctx.strokeStyle='rgba(239,68,68,.6)'; ctx.lineWidth=1.4; ctx.setLineDash([5,4]); ctx.beginPath(); ctx.moveTo(X(0),Y(1)); ctx.lineTo(X(seg),Y(Math.max(vmin,1-dvT))); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign='left'; ctx.font="600 10px 'JetBrains Mono',monospace";
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('ΔV ujung '+dv.toFixed(2)+' % ('+((Vf-V[seg])*_SQ3_11).toFixed(1)+' V antar-saluran), rugi '+(rugi/1000).toFixed(2)+' kW',padL+6,padT+12);
  ctx.fillStyle='rgba(239,68,68,.9)'; ctx.fillText('pembanding: seluruh beban terpusat di ujung → ΔV '+(dvT*100).toFixed(2)+' %',padL+6,padT+26);
  ctx.fillStyle='rgba(148,163,184,.9)'; ctx.fillText('kabel Al '+A+' mm²: r = '+r.toFixed(3)+' Ω/km, x = 0,08 Ω/km',padL+6,padT+40);
  _ttlTulis('profilJTRInfo','JTR tiga fasa 380 V, panjang '+L+' m, arus pangkal '+I+' A pf '+pf.toFixed(2)+', kabel Al '+A+' mm² (r = '+r.toFixed(3)+' Ω/km)   |   sebaran '+sebar.toFixed(2)+' ('+(sebar>0.99?'merata':sebar<0.01?'terpusat di ujung':'campuran')+'): ΔV ujung '+dv.toFixed(2)+' % dari 220 V fasa, rugi '+(rugi/1000).toFixed(3)+' kW   |   terpusat di ujung: ΔV '+(dvT*100).toFixed(2)+' %, rugi '+(3*I*I*r*L/1000/1000).toFixed(3)+' kW → merata = ½ ΔV dan ⅓ rugi   |   batas SPLN −10 % (342 V): '+(dv>10?'⚠ terlampaui, perbesar penampang atau perpendek jurusan':'aman'));
  if(_ttlJalan('profiljtr')){_jtFrame++; requestAnimationFrame(drawProfilJTR);}
}

// ── ANIMASI 4 — Indeks keandalan SAIFI, SAIDI, CAIDI, ENS ──
let _kdFrame=0;
function toggleKeandalan(){_ttlToggle('keandalan','btnKeandalan',drawKeandalan);}
window.toggleKeandalan=toggleKeandalan;
function drawKeandalan(){
  const k=_ttlKanvas('cvKeandalan'); if(!k) return; const {ctx,W,H}=k;
  const freq=_ttlNilai('sl_kd_freq',6), dur=_ttlNilai('sl_kd_durasi',2.5), nSeksi=Math.round(_ttlNilai('sl_kd_seksi',1)), loop=Math.round(_ttlNilai('sl_kd_loop',0)), pel=_ttlNilai('sl_kd_pel',2000);
  _ttlTulis('v_kd_freq',freq.toFixed(0)); _ttlTulis('v_kd_durasi',dur.toFixed(1)); _ttlTulis('v_kd_seksi',nSeksi.toFixed(0)); _ttlTulis('v_kd_loop',loop?'ya':'tidak'); _ttlTulis('v_kd_pel',pel.toFixed(0));
  const tIso=0.5, pAvg=1.2; // jam isolasi; MW beban rata-rata
  // gangguan tersebar merata di nSeksi seksi; tiap gangguan: seluruh pelanggan padam tIso (bila nSeksi>1) atau dur (bila 1 seksi);
  // setelah isolasi: hulu pulih; seksi gangguan padam dur; hilir padam dur (radial) atau tIso (loop).
  let pelJam=0, pelKali=freq*pel;
  for(let s=0;s<nSeksi;s++){const f=freq/nSeksi; const hulu=s/nSeksi, sendiri=1/nSeksi, hilir=(nSeksi-1-s)/nSeksi;
    const jamH=nSeksi>1?tIso:dur; pelJam+=f*pel*(hulu*jamH+sendiri*dur+hilir*(loop?tIso:dur));}
  const saifi=pelKali/pel, saidi=pelJam/pel, caidi=saidi/saifi, asai=1-saidi/8760, ens=pAvg*saidi;
  // pembanding: radial 1 seksi
  const saidi0=freq*dur;
  const padL=60,padT=24,padB=34,plotW=W-padL-190,plotH=H-padT-padB;
  _sumbu11(ctx,padL,padT,plotW,plotH);
  const bar=[['SAIFI',saifi,freq,'kali/plg/th','rgba(0,229,255,.9)'],['SAIDI',saidi,saidi0,'jam/plg/th','rgba(255,179,0,.9)'],['CAIDI',caidi,dur,'jam/gangguan','rgba(168,85,247,.9)'],['ENS',ens,pAvg*saidi0,'MWh/th','rgba(239,68,68,.9)']];
  const ymax=Math.max(1,Math.ceil(Math.max(saidi0,pAvg*saidi0,freq)*1.15));
  const Y=v=>padT+plotH-Math.min(v,ymax)/ymax*plotH;
  ctx.textAlign='right'; for(let i=0;i<=4;i++){const v=ymax*i/4; _ttlGaris(ctx,padL,Y(v),padL+plotW,Y(v),'rgba(148,163,184,.12)',1); ctx.fillText(v.toFixed(1),padL-4,Y(v)+4);}
  const bw=plotW/bar.length; const grow=Math.min(1,(_kdFrame%180)/60);
  bar.forEach(([n,v,v0,sat,warna],i)=>{const x0=padL+i*bw+bw*0.15;
    ctx.fillStyle='rgba(148,163,184,.25)'; ctx.fillRect(x0,Y(v0*grow),bw*0.3,padT+plotH-Y(v0*grow));
    ctx.fillStyle=warna; ctx.fillRect(x0+bw*0.35,Y(v*grow),bw*0.3,padT+plotH-Y(v*grow));
    ctx.fillStyle='rgba(226,232,240,.95)'; ctx.textAlign='center'; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.fillText(n,x0+bw*0.35,padT+plotH+14); ctx.font="9px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.8)'; ctx.fillText(sat,x0+bw*0.35,padT+plotH+26);
    ctx.fillStyle=warna; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.fillText(v.toFixed(2),x0+bw*0.5,Y(v*grow)-5); ctx.fillStyle='rgba(148,163,184,.8)'; ctx.fillText(v0.toFixed(2),x0+bw*0.3,Y(v0*grow)-5);});
  const lx=padL+plotW+16; ctx.textAlign='left'; ctx.font="10px 'JetBrains Mono',monospace";
  ctx.fillStyle='rgba(148,163,184,.4)'; ctx.fillRect(lx,padT,10,10); ctx.fillStyle='rgba(226,232,240,.9)'; ctx.fillText('radial 1 seksi (pembanding)',lx+14,padT+9);
  ctx.fillStyle='rgba(255,179,0,.9)'; ctx.fillRect(lx,padT+16,10,10); ctx.fillText(nSeksi+' seksi'+(loop?' + loop':' radial'),lx+14,padT+25);
  const baris=[['ASAI',(asai*100).toFixed(4)+' %'],['plg-jam padam',pelJam.toFixed(0)],['isolasi',tIso+' jam'],['beban rata',pAvg+' MW'],['target PLN kota','SAIDI < 5 jam']];
  baris.forEach(([n,v],i)=>{ctx.fillStyle='rgba(148,163,184,.8)'; ctx.fillText(n,lx,padT+52+i*15); ctx.fillStyle='rgba(0,229,255,.95)'; ctx.textAlign='right'; ctx.fillText(v,lx+170,padT+52+i*15); ctx.textAlign='left';});
  _ttlTulis('keandalanInfo',freq+' gangguan/tahun, perbaikan '+dur.toFixed(1)+' jam, '+pel+' pelanggan, '+nSeksi+' seksi'+(loop?' dengan pasokan alternatif (loop)':' radial')+'   |   SAIFI = '+saifi.toFixed(2)+' kali/pelanggan/tahun (tidak berubah oleh seksi: PMT tetap trip), SAIDI = '+saidi.toFixed(2)+' jam (pembanding radial 1 seksi '+saidi0.toFixed(2)+' jam), CAIDI = '+caidi.toFixed(2)+' jam/gangguan, ASAI = '+(asai*100).toFixed(4)+' %   |   ENS ≈ '+ens.toFixed(2)+' MWh/tahun pada beban rata-rata '+pAvg+' MW   |   seksi + loop memangkas SAIDI, recloser/fuse yang memangkas SAIFI');
  if(_ttlJalan('keandalan')){_kdFrame++; requestAnimationFrame(drawKeandalan);}
}

_TTL_DAFTAR.push(['cvKurvaBeban',()=>drawKurvaBeban(),'kurvabeban',['sl_kb_rumah','sl_kb_ruko','sl_kb_ind']]);
_TTL_DAFTAR.push(['cvKonfigurasi',()=>drawKonfigurasi(),'konfigurasi',['sl_kf_mode','sl_kf_gangguan','sl_kf_seksi']]);
_TTL_DAFTAR.push(['cvProfilJTR',()=>drawProfilJTR(),'profiljtr',['sl_jt_l','sl_jt_i','sl_jt_a','sl_jt_pf','sl_jt_sebar']]);
_TTL_DAFTAR.push(['cvKeandalan',()=>drawKeandalan(),'keandalan',['sl_kd_freq','sl_kd_durasi','sl_kd_seksi','sl_kd_loop','sl_kd_pel']]);
_ttlMulai();
