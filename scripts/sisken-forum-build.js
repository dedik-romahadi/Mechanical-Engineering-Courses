function buildForumHtml() {
  const identity = getIdentityLocal();
  const name = identity ? identity.nama : 'Mahasiswa';
  const nim  = identity ? identity.nim  : '-';
  const _d = new Date(); const _p = n => String(n).padStart(2,'0'); const now = _d.getDate()+'-'+(_d.getMonth()+1)+'-'+_d.getFullYear()+', '+_p(_d.getHours())+':'+_p(_d.getMinutes())+':'+_p(_d.getSeconds());

  function esc(s) {
    return (s || '(Belum diisi)')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\n/g,'<br>');
  }

  const ans1 = esc(document.getElementById('ans-fq1').value);
  const ans2 = esc(document.getElementById('ans-fq2').value);
  const ans3 = esc(document.getElementById('ans-fq3').value);

  return `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:720px;margin:0 auto;color:#1e293b;">

  <table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background:#0a1628;border-radius:12px 12px 0 0;">
    <tr><td style="padding:20px 28px;">
      <div style="font-size:1.3rem;font-weight:800;color:#a855f7;margin-bottom:4px;">&#128172; Forum Diskusi &#8212; Pertemuan __PERTEMUAN__</div>
      <div style="font-size:.82rem;color:#94a3b8;">__JUDUL__ &middot; Sistem Kendali Cerdas &middot; S1 Teknik Mesin UMB &middot; 2025/2026</div>
      <div style="font-size:.8rem;color:#a855f7;margin-top:2px;">Dosen: Dedik Romahadi</div>
    </td></tr>
  </table>

  <table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background:#f1f5f9;border-left:4px solid #a855f7;">
    <tr><td style="padding:14px 28px;">
      <table cellpadding="0" cellspacing="0" border="0" style="font-size:14px;line-height:1.9;color:#1e293b;">
        <tr>
          <td style="color:#64748b;font-weight:700;padding-right:6px;width:80px"><strong>Nama</strong></td>
          <td style="color:#64748b;font-weight:700;padding-right:10px">:</td>
          <td style="color:#1e293b;font-weight:600">${name}</td>
        </tr>
        <tr>
          <td style="color:#64748b;font-weight:700;padding-right:6px"><strong>NIM</strong></td>
          <td style="color:#64748b;font-weight:700;padding-right:10px">:</td>
          <td style="color:#1e293b;font-weight:600">${nim}</td>
        </tr>
        <tr>
          <td style="color:#64748b;font-weight:700;padding-right:6px"><strong>Tanggal</strong></td>
          <td style="color:#64748b;font-weight:700;padding-right:10px">:</td>
          <td style="color:#1e293b;font-weight:600">${now}</td>
        </tr>
      </table>
    </td></tr>
  </table>

  <table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background:#f0f4ff;border-left:4px solid #a855f7;margin-top:2px;">
    <tr><td style="padding:16px 28px;">
      <div style="font-weight:700;color:#5b35d0;margin-bottom:8px;font-size:15px;">&#128203; Skenario: Oven Konveyor yang Suhunya Tidak Pernah Diam</div>
      <div style="font-size:.88rem;color:#475569;margin-bottom:10px;line-height:1.65;">Oven konveyor pabrik roti diminta menjaga suhu 180 °C, tetapi suhu aktual naik-turun antara 172–188 °C sehingga hasil panggangan tidak konsisten. Sistem memakai kontrol on–off dan termokopelnya terpasang jauh dari zona pemanas. Diperlukan diagnosa berbasis konsep dasar sistem kontrol. Data lapangan:</div>
      <div style="margin-top:10px;line-height:2.2;"><div style="display:inline-block;margin:2px 6px 2px 0;background:#dbeafe;border:1px solid #93c5fd;color:#1d4ed8;padding:3px 10px;border-radius:12px;font-size:.78rem;font-family:monospace;;margin-bottom:4px;">setpoint = 180 °C</div>
      <div style="display:inline-block;margin:2px 6px 2px 0;background:#dbeafe;border:1px solid #93c5fd;color:#1d4ed8;padding:3px 10px;border-radius:12px;font-size:.78rem;font-family:monospace;;margin-bottom:4px;">suhu aktual = 172-188 °C</div>
      <div style="display:inline-block;margin:2px 6px 2px 0;background:#dbeafe;border:1px solid #93c5fd;color:#1d4ed8;padding:3px 10px;border-radius:12px;font-size:.78rem;font-family:monospace;;margin-bottom:4px;">heater on-off = 40x/jam</div>
      <div style="display:inline-block;margin:2px 6px 2px 0;background:#fce7f3;border:1px solid #f9a8d4;color:#be185d;padding:3px 10px;border-radius:12px;font-size:.78rem;font-family:monospace;;margin-bottom:4px;">jeda sensor = 45 s</div>
    </td></tr>
  </table>
  </div>

  <table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #e2e8f0;margin-top:8px;">
    <tr><td style="padding:20px 28px;">
      <h3 style="margin:0 0 10px 0;font-size:15px;color:#1e293b;line-height:1.55;font-weight:700;"><span style="display:inline-block;background:#a855f7;color:#fff;padding:3px 12px;border-radius:6px;font-weight:700;font-size:13px;margin-right:8px;">1</span>__Q1__</h3>
      <div style="font-size:.82rem;color:#64748b;margin-bottom:14px;padding-left:40px;font-style:italic;">__H1__</div>
      <div style="margin-left:40px;margin-top:10px;">
        <div style="font-size:.7rem;font-weight:700;color:#a855f7;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">&#9998; JAWABAN</div>
        <div style="background:#f8f5ff;border:1px solid #c4b5fd;border-radius:8px;padding:14px 16px;font-size:.88rem;color:#1e293b;line-height:1.75;min-height:48px;">${ans1}</div>
      </div>
    </td></tr>
  </table>

  <table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #e2e8f0;margin-top:4px;">
    <tr><td style="padding:20px 28px;">
      <h3 style="margin:0 0 10px 0;font-size:15px;color:#1e293b;line-height:1.55;font-weight:700;"><span style="display:inline-block;background:#0ea5e9;color:#fff;padding:3px 12px;border-radius:6px;font-weight:700;font-size:13px;margin-right:8px;">2</span>__Q2__</h3>
      <div style="font-size:.82rem;color:#64748b;margin-bottom:14px;padding-left:40px;font-style:italic;">__H2__</div>
      <div style="margin-left:40px;margin-top:10px;">
        <div style="font-size:.7rem;font-weight:700;color:#0ea5e9;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">&#9998; JAWABAN</div>
        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px 16px;font-size:.88rem;color:#1e293b;line-height:1.75;min-height:48px;">${ans2}</div>
      </div>
    </td></tr>
  </table>

  <table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #e2e8f0;margin-top:4px;">
    <tr><td style="padding:20px 28px;">
      <h3 style="margin:0 0 10px 0;font-size:15px;color:#1e293b;line-height:1.55;font-weight:700;"><span style="display:inline-block;background:#00e09e;color:#fff;padding:3px 12px;border-radius:6px;font-weight:700;font-size:13px;margin-right:8px;">3</span>__Q3__</h3>
      <div style="font-size:.82rem;color:#64748b;margin-bottom:14px;padding-left:40px;font-style:italic;">__H3__</div>
      <div style="margin-left:40px;margin-top:10px;">
        <div style="font-size:.7rem;font-weight:700;color:#00e09e;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">&#9998; JAWABAN</div>
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:14px 16px;font-size:.88rem;color:#1e293b;line-height:1.75;min-height:48px;">${ans3}</div>
      </div>
    </td></tr>
  </table>

  <table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background:#0a1628;border-radius:0 0 12px 12px;margin-top:4px;">
    <tr><td style="padding:14px 28px;text-align:center;font-size:.72rem;color:#94a3b8;border-top:1px solid rgba(168,85,247,.25);">
      Forum Diskusi Pertemuan __PERTEMUAN__ &mdash; <span style="color:#a855f7;font-weight:700">__JUDUL__</span> &middot; Sistem Kendali Cerdas &middot; S1 Teknik Mesin UMB &middot; 2025/2026
    </td></tr>
  </table>

</div>`;
}