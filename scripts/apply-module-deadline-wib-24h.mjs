import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const courses = [
  "Engineering-Mathematics",
  "Getaran-Mekanik",
  "Optimalisasi-dan-Automasi",
  "Sistem-Kendali-Cerdas",
];

const modalFieldsOld = `    <div style="display:flex;gap:10px;margin-bottom:14px;">
      <div style="flex:1;text-align:left;">
        <label style="font-size:.75rem;color:#94a3b8;font-weight:600;display:block;margin-bottom:4px;">Durasi (hari)</label>
        <input type="number" class="v-input" id="scheduleDuration" min="1" value="7" placeholder="7" style="margin-bottom:0;">
      </div>
      <div style="flex:1;text-align:left;">
        <label style="font-size:.75rem;color:#94a3b8;font-weight:600;display:block;margin-bottom:4px;">Batas Akhir (Due Date)</label>
        <input type="datetime-local" class="v-input" id="scheduleDue" style="margin-bottom:0;color-scheme:dark">
      </div>
    </div>`;

const modalFieldsNew = `    <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
      <div style="flex:0 1 130px;text-align:left;">
        <label style="font-size:.75rem;color:#94a3b8;font-weight:600;display:block;margin-bottom:4px;">Durasi (hari)</label>
        <input type="number" class="v-input" id="scheduleDuration" min="1" value="7" placeholder="7" style="margin-bottom:0;">
      </div>
      <div style="flex:1 1 260px;text-align:left;">
        <label for="scheduleDueDate" style="font-size:.75rem;color:#94a3b8;font-weight:600;display:block;margin-bottom:4px;">Batas Akhir (WIB)</label>
        <div style="display:grid;grid-template-columns:minmax(0,1fr) 92px;gap:8px;">
          <input type="date" class="v-input" id="scheduleDueDate" aria-label="Tanggal deadline WIB" style="margin-bottom:0;color-scheme:dark">
          <input type="text" class="v-input" id="scheduleDueTime" aria-label="Waktu deadline WIB format 24 jam" aria-describedby="scheduleDueHelp" inputmode="numeric" autocomplete="off" maxlength="5" pattern="(?:[01][0-9]|2[0-3]):[0-5][0-9]" placeholder="22:00" style="margin-bottom:0;font-variant-numeric:tabular-nums;text-align:center;">
        </div>
        <div id="scheduleDueHelp" style="margin-top:5px;color:#94a3b8;font-size:.68rem;line-height:1.35;">Format 24 jam WIB (UTC+7), contoh 22:00.</div>
      </div>
    </div>`;

const showScheduleOld = `function showScheduleModal(){
  document.getElementById('scheduleOverlay').classList.remove('hidden'); document.getElementById('schedulePw').value='';
  document.getElementById('scheduleError').textContent=''; document.getElementById('scheduleError').style.display='none';
  // Compute defaults: durasi=7, batas akhir = hari ini + 6 hari, 23:59 WIB (Asia/Jakarta)
  var _dueWibParts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(Date.now()+6*24*60*60*1000));
  var _y=_dueWibParts.find(p=>p.type==='year').value, _mo=_dueWibParts.find(p=>p.type==='month').value, _da=_dueWibParts.find(p=>p.type==='day').value;
  var _defaultDue=_y+'-'+_mo+'-'+_da+'T23:59';
  document.getElementById('scheduleDuration').value=(currentSchedule && currentSchedule.duration) || '7';
  document.getElementById('scheduleDue').value=(currentSchedule && currentSchedule.due) || _defaultDue;
  setTimeout(()=>document.getElementById('schedulePw').focus(),100);
}`;

const showScheduleNew = `function _dateToWibInputString(value) {
  const raw = String(value || '').trim();
  const wallClock = raw.match(/^(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2})/);
  if (wallClock && !/(?:Z|[+-]\\d{2}:?\\d{2})$/i.test(raw)) {
    return wallClock[1]+'-'+wallClock[2]+'-'+wallClock[3]+'T'+wallClock[4]+':'+wallClock[5];
  }
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const parts = {};
  new Intl.DateTimeFormat('en-CA', {
    timeZone:'Asia/Jakarta', year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', hourCycle:'h23'
  }).formatToParts(date).forEach(part => { parts[part.type] = part.value; });
  return parts.year+'-'+parts.month+'-'+parts.day+'T'+parts.hour+':'+parts.minute;
}
function _wibStringToDate(value) {
  const match = String(value || '').match(/^(\\d{4})-(\\d{2})-(\\d{2})T((?:[01]\\d|2[0-3])):([0-5]\\d)$/);
  if (!match) return new Date(NaN);
  return new Date(Date.UTC(+match[1], +match[2]-1, +match[3], +match[4]-7, +match[5]));
}
function _setScheduleDueWib(value) {
  const normalized = _dateToWibInputString(value);
  const pieces = normalized.split('T');
  document.getElementById('scheduleDueDate').value = pieces[0] || '';
  document.getElementById('scheduleDueTime').value = pieces[1] || '';
}
function _readScheduleDueWib() {
  const date = document.getElementById('scheduleDueDate').value;
  const time = document.getElementById('scheduleDueTime').value.trim();
  const due = date+'T'+time;
  const parsed = _wibStringToDate(due);
  return Number.isFinite(parsed.getTime()) && _dateToWibInputString(parsed) === due ? due : '';
}
function _formatWibDateTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Waktu tidak valid';
  const dateText = date.toLocaleDateString('id-ID', {
    day:'numeric', month:'short', year:'numeric', timeZone:'Asia/Jakarta'
  });
  const timeText = new Intl.DateTimeFormat('en-GB', {
    hour:'2-digit', minute:'2-digit', hourCycle:'h23', timeZone:'Asia/Jakarta'
  }).format(date);
  return dateText+' '+timeText+' WIB';
}
function showScheduleModal(){
  document.getElementById('scheduleOverlay').classList.remove('hidden'); document.getElementById('schedulePw').value='';
  document.getElementById('scheduleError').textContent=''; document.getElementById('scheduleError').style.display='none';
  // Compute defaults: durasi=7, batas akhir = hari ini + 6 hari, 23:59 WIB (Asia/Jakarta)
  var _dueWibParts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(Date.now()+6*24*60*60*1000));
  var _y=_dueWibParts.find(p=>p.type==='year').value, _mo=_dueWibParts.find(p=>p.type==='month').value, _da=_dueWibParts.find(p=>p.type==='day').value;
  var _defaultDue=_y+'-'+_mo+'-'+_da+'T23:59';
  document.getElementById('scheduleDuration').value=(currentSchedule && currentSchedule.duration) || '7';
  var _savedDue=currentSchedule && (currentSchedule.due || currentSchedule.end);
  _setScheduleDueWib(_savedDue || _defaultDue);
  setTimeout(()=>document.getElementById('schedulePw').focus(),100);
}`;

const saveReadOld = `  const dur=parseInt(document.getElementById('scheduleDuration').value), due=document.getElementById('scheduleDue').value;
  if(!dur||dur<1){errEl.textContent='\\u26a0 Durasi harus diisi (minimal 1 hari).';errEl.style.display='block';return;}
  if(!due){errEl.textContent='\\u26a0 Batas akhir (due date) harus diisi.';errEl.style.display='block';return;}
  errEl.style.display='none';
  const dueDate=new Date(due), startDate=new Date(dueDate.getTime()-dur*24*60*60*1000);`;

const saveReadNew = `  const dur=parseInt(document.getElementById('scheduleDuration').value), due=_readScheduleDueWib();
  if(!dur||dur<1){errEl.textContent='\\u26a0 Durasi harus diisi (minimal 1 hari).';errEl.style.display='block';return;}
  if(!due){errEl.textContent='\\u26a0 Isi tanggal dan waktu WIB dalam format 24 jam (HH:mm), contoh 22:00.';errEl.style.display='block';return;}
  const dueDate=_wibStringToDate(due);
  if(!Number.isFinite(dueDate.getTime())){errEl.textContent='\\u26a0 Tanggal atau waktu deadline tidak valid.';errEl.style.display='block';return;}
  errEl.style.display='none';
  const startDate=new Date(dueDate.getTime()-dur*24*60*60*1000);`;

const scheduleNormalizerAnchor = `function _wibStringToDate(value) {
  const match = String(value || '').match(/^(\\d{4})-(\\d{2})-(\\d{2})T((?:[01]\\d|2[0-3])):([0-5]\\d)$/);
  if (!match) return new Date(NaN);
  return new Date(Date.UTC(+match[1], +match[2]-1, +match[3], +match[4]-7, +match[5]));
}`;
const scheduleNormalizer = `function _normalizeModuleScheduleWib(schedule) {
  if (!schedule || !schedule.due) return schedule;
  const dueDate = _wibStringToDate(schedule.due);
  if (!Number.isFinite(dueDate.getTime())) return schedule;
  const normalized = Object.assign({}, schedule, {end:dueDate.toISOString()});
  const duration = Number(schedule.duration);
  if (Number.isFinite(duration) && duration > 0) {
    normalized.start = new Date(dueDate.getTime()-duration*24*60*60*1000).toISOString();
  }
  return normalized;
}`;

const displayOld = `    const fmt = (d) => d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric', timeZone:'Asia/Jakarta'})+' '+d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit', timeZone:'Asia/Jakarta'});
    range.textContent = fmt(s) + '  \\u2014  ' + fmt(e) + '  ('+dur+' hari)';
    const cdD = document.getElementById('cdDeadline');
    if(cdD) cdD.innerHTML = 'Deadline: <strong style="color:var(--violet)">' + e.toLocaleString('id-ID', {timeZone:'Asia/Jakarta'}) + '</strong>';`;

const displayNew = `    range.textContent = _formatWibDateTime(s) + '  \\u2014  ' + _formatWibDateTime(e) + '  ('+dur+' hari)';
    const cdD = document.getElementById('cdDeadline');
    if(cdD) cdD.innerHTML = 'Deadline: <strong style="color:var(--violet)">' + _formatWibDateTime(e) + '</strong>';`;

const timeListener = `document.getElementById('scheduleDueTime').addEventListener('input',function(){
  const digits=this.value.replace(/\\D/g,'').slice(0,4);
  this.value=digits.length>2 ? digits.slice(0,2)+':'+digits.slice(2) : digits;
});`;
const timeListenerAnchors = [
  `document.getElementById('schedulePw').addEventListener('keydown',function(e){if(e.key==='Enter')document.getElementById('scheduleDuration').focus();});`,
  `_bindListener('schedulePw',        'keydown', function(e){ if(e.key==='Enter') { const el=document.getElementById('scheduleDuration'); if(el) el.focus(); } });`,
];

const replacements = [
  [modalFieldsOld, modalFieldsNew, "field modal deadline"],
  [showScheduleOld, showScheduleNew, "helper dan default deadline"],
  [saveReadOld, saveReadNew, "parser penyimpanan deadline"],
  [displayOld, displayNew, "formatter tampilan deadline"],
];

let changed = 0;
for (const course of courses) {
  for (let moduleNumber = 1; moduleNumber <= 14; moduleNumber += 1) {
    const file = path.join(root, course, "Modul", `Modul-${moduleNumber}.html`);
    let source = fs.readFileSync(file, "utf8");
    const eol = source.includes("\r\n") ? "\r\n" : "\n";
    for (const [beforeLf, afterLf, label] of replacements) {
      const before = beforeLf.replaceAll("\n", eol);
      const after = afterLf.replaceAll("\n", eol);
      const count = source.split(before).length - 1;
      if (count === 1) {
        source = source.replace(before, after);
      } else if (count === 0 && source.includes(after)) {
        // Membuat script aman dijalankan ulang setelah sebagian batch selesai.
      } else {
        throw new Error(`${path.relative(root, file)}: ${label} ditemukan ${count} kali, seharusnya 1`);
      }
    }
    const normalizedScheduleHelper = scheduleNormalizer.replaceAll("\n", eol);
    if (!source.includes(normalizedScheduleHelper)) {
      const helperAnchor = scheduleNormalizerAnchor.replaceAll("\n", eol);
      const helperAnchorCount = source.split(helperAnchor).length - 1;
      if (helperAnchorCount !== 1) {
        throw new Error(`${path.relative(root, file)}: anchor parser WIB ditemukan ${helperAnchorCount} kali, seharusnya 1`);
      }
      source = source.replace(helperAnchor, helperAnchor+eol+normalizedScheduleHelper);
    }
    const scheduleAssignmentOld = `currentSchedule = snap.val();`;
    const scheduleAssignmentNew = `currentSchedule = _normalizeModuleScheduleWib(snap.val());`;
    const oldAssignmentCount = source.split(scheduleAssignmentOld).length - 1;
    if (oldAssignmentCount === 1) {
      source = source.replace(scheduleAssignmentOld, scheduleAssignmentNew);
    } else if (oldAssignmentCount !== 0 || !source.includes(scheduleAssignmentNew)) {
      throw new Error(`${path.relative(root, file)}: assignment jadwal ditemukan ${oldAssignmentCount} kali, seharusnya 1`);
    }
    const normalizedTimeListener = timeListener.replaceAll("\n", eol);
    if (!source.includes(normalizedTimeListener)) {
      const anchorsFound = timeListenerAnchors.filter((anchor) => source.includes(anchor));
      if (anchorsFound.length !== 1) {
        throw new Error(`${path.relative(root, file)}: anchor listener password ditemukan ${anchorsFound.length} kali, seharusnya 1`);
      }
      const anchor = anchorsFound[0];
      source = source.replace(anchor, anchor+eol+normalizedTimeListener);
    }
    fs.writeFileSync(file, source, "utf8");
    changed += 1;
  }
}

if (changed !== 56) throw new Error(`Jumlah modul berubah ${changed}, seharusnya 56`);
console.log(`Applied explicit WIB parsing and 24-hour deadline input to ${changed} modules.`);
