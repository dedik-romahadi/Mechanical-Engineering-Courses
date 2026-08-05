#!/usr/bin/env python3
"""
Analyzer korban bug penilaian comp (angka pertama vs terakhir).

Membaca export RTDB Firebase (JSON) dari node visitor sebuah modul, lalu untuk
tiap mahasiswa yang dapat skor SALAH/PARTIAL di soal komputasi:
  - Re-run kode Python yang mereka submit (tersimpan di field `codes`).
  - Ekstrak angka dari output (regex sama dgn client).
  - Bandingkan: logic LAMA (angka pertama) vs logic BARU (angka terakhir/pertama)
    terhadap kunci jawaban.
  - Flag "KORBAN BUG" jika: LAMA = salah, tapi BARU = benar.

Output: daftar (NIM → qIds) yang perlu di-reset, siap di-paste ke Admin tool.

USAGE:
  python3 Admin/analyze-affected.py <export.json> <modulId>

  <export.json> = export dari Firebase Console:
     Realtime Database → visitors/<course>/<seg> → ⋮ → Export JSON
     (boleh export node visitor itu saja, atau seluruh DB — script auto-cari)
  <modulId>     = mis. getaran-mekanik-modul-8

CONTOH:
  python3 Admin/analyze-affected.py /tmp/visitors-export.json getaran-mekanik-modul-8
"""
import sys, json, re, subprocess, tempfile, os
from pathlib import Path

# ── Client number-extraction regex (sama persis dgn modul HTML parseNumbers) ──
NUM_RE = re.compile(r'-?\d+\.?\d*(?:[eE][+-]?\d+)?')

def parse_numbers(text):
    out = []
    for tok in NUM_RE.findall(text):
        try:
            v = float(tok)
            if v == v and abs(v) != float('inf'):  # finite
                out.append(v)
        except ValueError:
            pass
    return out

# ── Server eval (post-fix): cek angka terakhir + pertama; lama: cek pertama saja ──
def eval_old(nums, target, tol):
    """Logic LAMA: hanya angka pertama."""
    if not nums:
        return False
    return abs(nums[0] - target) <= tol

def eval_new(nums, target, tol):
    """Logic BARU (#312): angka terakhir + pertama."""
    if not nums:
        return False
    cands = [nums[-1], nums[0]]
    return any(abs(c - target) <= tol for c in cands)

# ── Load answer keys dari seed file ──
def load_answers(modul_id):
    seed = Path(__file__).parent.parent / 'functions' / 'seed' / 'modul' / f'{modul_id}-answers.js'
    if not seed.exists():
        sys.exit(f'Seed file tidak ditemukan: {seed}')
    src = seed.read_text(encoding='utf-8')
    # Ekstrak entri comp: { qId: "cN", ..., answer: X, tolerance: Y, ... }
    answers = {}
    for m in re.finditer(r'\{\s*qId:\s*"(c\d+)"[^}]*?answer:\s*(-?[0-9.]+)[^}]*?tolerance:\s*(-?[0-9.]+)', src):
        qid, ans, tol = m.group(1), float(m.group(2)), float(m.group(3))
        answers[qid] = (ans, tol)
    return answers

# ── Run kode Python mahasiswa, capture stdout (sandboxed: timeout, subprocess) ──
def run_student_code(code, timeout=20):
    # Inject import umum yang biasa dipakai (numpy/scipy/sympy) supaya kode yg
    # asumsikan sudah di-import tetap jalan. Tapi JANGAN override kalau kode sudah import.
    preamble = (
        "import sys\n"
        "try:\n import numpy as np\nexcept Exception: pass\n"
        "try:\n import numpy\nexcept Exception: pass\n"
        "try:\n import scipy\n from scipy import integrate, linalg, optimize\nexcept Exception: pass\n"
        "try:\n import sympy\n from sympy import *\nexcept Exception: pass\n"
        "try:\n import math\nexcept Exception: pass\n"
    )
    full = preamble + "\n" + code
    with tempfile.NamedTemporaryFile('w', suffix='.py', delete=False, encoding='utf-8') as f:
        f.write(full)
        tmp = f.name
    try:
        r = subprocess.run([sys.executable, tmp], capture_output=True, text=True,
                           timeout=timeout)
        return r.stdout + ("\n" + r.stderr if r.returncode != 0 else "")
    except subprocess.TimeoutExpired:
        return "__TIMEOUT__"
    except Exception as e:
        return f"__ERROR__ {e}"
    finally:
        try: os.unlink(tmp)
        except OSError: pass

# ── Cari node visitor dari export (bisa full-DB export atau node langsung) ──
def find_visitors(data, modul_id):
    # modulId getaran-mekanik-modul-8 → course=getaran_mekanik, seg=pertemuan-9
    # Mapping sederhana (sesuai _segmentsForModul):
    parts = modul_id.rsplit('-modul-', 1)
    course_id, n = parts[0], int(parts[1])
    course_slug = {'math4':'math4','getaran-mekanik':'getaran_mekanik','optoauto':'optoauto','sistem_kendali_cerdas':'sistem_kendali_cerdas'}[course_id]
    seg = ('modul-%d' % n) if course_id == 'math4' else ('pertemuan-%d' % (n if n <= 7 else n+1))

    # Coba beberapa kemungkinan struktur export:
    candidates = [
        data,                                                # node visitor langsung
        data.get('visitors', {}).get(course_slug, {}).get(seg, {}),  # full DB
        data.get(course_slug, {}).get(seg, {}),
        data.get(seg, {}),
    ]
    for c in candidates:
        if isinstance(c, dict) and any(k.startswith('mhs_') for k in c.keys()):
            return c, course_slug, seg
    # fallback: cari rekursif
    found = {}
    def walk(o):
        if isinstance(o, dict):
            if any(k.startswith('mhs_') for k in o.keys()):
                found.update(o)
            for v in o.values(): walk(v)
    walk(data)
    return found, course_slug, seg

def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    export_path, modul_id = sys.argv[1], sys.argv[2]

    answers = load_answers(modul_id)
    if not answers:
        sys.exit('Tidak ada answer key comp ditemukan di seed.')
    data = json.loads(Path(export_path).read_text(encoding='utf-8'))
    visitors, course_slug, seg = find_visitors(data, modul_id)
    if not visitors:
        sys.exit('Tidak menemukan node visitor mhs_* di export. Cek path export.')

    print(f'Modul: {modul_id}  (visitors/{course_slug}/{seg})')
    print(f'Mahasiswa di-scan: {len(visitors)}\n')
    print(f'{"NIM":<16}{"qId":<6}{"target":<10}{"output→nums (last,first)":<32}{"STATUS"}')
    print('='*90)

    victims = {}   # nim → [qIds]
    for key, rec in sorted(visitors.items()):
        if not isinstance(rec, dict): continue
        nim = rec.get('nim', key.replace('mhs_',''))
        scored = (rec.get('scoredQuestions') or '').split(',')
        codes = rec.get('codes') or {}
        # cari comp question yg salah/partial (marker _comp_used / _comp_partial)
        for marker in scored:
            mm = re.match(r'^(c\d+)_comp_(used|partial)$', marker)
            if not mm: continue
            qid = mm.group(1)
            if qid not in answers: continue
            code = codes.get(qid)
            if not code:
                print(f'{nim:<16}{qid:<6}{"":<10}{"(tidak ada code tersimpan)":<32}SKIP')
                continue
            target, tol = answers[qid]
            output = run_student_code(code)
            if output in ('__TIMEOUT__',) or output.startswith('__ERROR__'):
                print(f'{nim:<16}{qid:<6}{target:<10}{output[:30]:<32}RUN-FAIL (cek manual)')
                continue
            nums = parse_numbers(output)
            old_ok = eval_old(nums, target, tol)
            new_ok = eval_new(nums, target, tol)
            lastfirst = f'last={nums[-1] if nums else "-"}, first={nums[0] if nums else "-"}'
            if (not old_ok) and new_ok:
                status = '🐛 KORBAN BUG → RESET'
                victims.setdefault(nim, []).append(qid)
            elif old_ok and new_ok:
                status = 'sudah benar (aneh, cek)'
            else:
                status = 'memang salah (no reset)'
            print(f'{nim:<16}{qid:<6}{target:<10}{lastfirst[:30]:<32}{status}')

    print('\n' + '='*90)
    print('RINGKASAN — mahasiswa yang perlu di-RESET (korban bug):\n')
    if not victims:
        print('  (tidak ada korban bug terdeteksi)')
    for nim, qids in sorted(victims.items()):
        print(f'  NIM {nim}  →  reset soal: {",".join(sorted(set(qids), key=lambda q:int(q[1:])))}')
    print(f'\nTotal korban: {len(victims)} mahasiswa')

if __name__ == '__main__':
    main()
