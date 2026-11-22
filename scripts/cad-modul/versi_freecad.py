"""Nomor versi FreeCAD di halaman CAD mengikuti rilis stabil terbaru (seperti tab Setup FreeCAD).

Mengganti teks lama "FreeCAD 1.0 atau lebih baru" dengan
    FreeCAD <span data-fc-versi="seri">1.1</span>
(cadangan = FC_VERSI di modul_1.py), lalu memasang skrip VERSI-FREECAD-HALAMAN sebelum
</body> di halaman yang belum punya skrip VERSI-FREECAD (Modul 2-14, UTS, UAS). Skrip itu
memakai sumber dan cache yang sama dengan tab Setup (rilis GitHub FreeCAD/FreeCAD,
localStorage 'fc_versi_terbaru' 12 jam) dan ikut memperbarui elemen yang dirender belakangan.

Idempoten. Dipanggil oleh bangun-modul-1.py, bangun.py (Modul N), dan cad-exam/bangun.py,
dan bisa dijalankan sendiri:
    python scripts/cad-modul/versi_freecad.py            # terapkan ke 16 halaman CAD
    python scripts/cad-modul/versi_freecad.py --periksa  # gagal bila masih ada versi tetap
"""
import pathlib
import re
import sys

AKAR = pathlib.Path(__file__).resolve().parents[2]
CAD = AKAR / "Pemodelan-Computer-Aided-Design"
_m = re.search(r'FC_VERSI\s*=\s*"([\d.]+)"', (pathlib.Path(__file__).parent / "modul_1.py").read_text(encoding="utf-8"))
FC_SERI = ".".join(_m.group(1).split(".")[:2])

LAMA = re.compile(r"FreeCAD 1\.0 atau lebih baru")
BARU = f'FreeCAD <span data-fc-versi="seri">{FC_SERI}</span>'
PENANDA = "VERSI-FREECAD-HALAMAN"

SKRIP = """<script>
/* VERSI-FREECAD-HALAMAN v1: nomor versi FreeCAD di halaman ini mengikuti rilis stabil terbaru
   (sumber dan cache sama dengan tab Setup FreeCAD Modul 1); elemen yang dirender belakangan
   ikut diperbarui. Dipasang scripts/cad-modul/versi_freecad.py. */
(function () {
  var KUNCI = 'fc_versi_terbaru', UMUR = 12 * 3600 * 1000, POLA = /^\\d+\\.\\d+(\\.\\d+)?$/, aktif = null;
  function pasang(v) {
    if (!POLA.test(v)) return;
    aktif = v;
    var seri = v.split('.').slice(0, 2).join('.');
    document.querySelectorAll('[data-fc-versi="penuh"]').forEach(function (el) { if (el.textContent !== v) el.textContent = v; });
    document.querySelectorAll('[data-fc-versi="seri"]').forEach(function (el) { if (el.textContent !== seri) el.textContent = seri; });
  }
  function amati() {
    if (!window.MutationObserver || !document.body) return;
    var t = null;
    new MutationObserver(function () {
      if (!aktif || t) return;
      t = setTimeout(function () { t = null; pasang(aktif); }, 200);
    }).observe(document.body, { childList: true, subtree: true });
  }
  amati();
  try {
    var c = JSON.parse(localStorage.getItem(KUNCI) || 'null');
    if (c && c.v) { pasang(c.v); if (Date.now() - c.t < UMUR) return; }
  } catch (e) {}
  if (!window.fetch) return;
  var ctl = window.AbortController ? new AbortController() : null;
  if (ctl) setTimeout(function () { ctl.abort(); }, 8000);
  fetch('https://api.github.com/repos/FreeCAD/FreeCAD/releases/latest', { headers: { Accept: 'application/vnd.github+json' }, signal: ctl ? ctl.signal : undefined })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d || d.prerelease || d.draft) return;
      var v = String(d.tag_name || '').replace(/^v/i, '').trim();
      if (!POLA.test(v)) return;
      pasang(v);
      try { localStorage.setItem(KUNCI, JSON.stringify({ v: v, t: Date.now() })); } catch (e) {}
    })
    .catch(function () {});
})();
</script>
"""


def terapkan(s: str) -> str:
    s = LAMA.sub(BARU, s)
    if "data-fc-versi" in s and "VERSI-FREECAD" not in s:
        i = s.rfind("</body>")
        if i < 0:
            raise SystemExit("versi_freecad: </body> tidak ditemukan")
        s = s[:i] + SKRIP + s[i:]
    return s


def halaman():
    hs = sorted((CAD / "Modul").glob("Modul-*.html")) + sorted((CAD / "Exam").glob("*.html"))
    return [h for h in hs if "DEDIK-PC" not in h.name]


def main():
    periksa = "--periksa" in sys.argv
    gagal = 0
    for h in halaman():
        s = h.read_bytes().decode("utf-8")
        baru = terapkan(s)
        if periksa:
            if baru != s:
                print(f"BELUM: {h.relative_to(AKAR)}")
                gagal += 1
        elif baru != s:
            h.write_bytes(baru.encode("utf-8"))
            print(f"diperbarui: {h.relative_to(AKAR)}")
    if periksa:
        print("versi_freecad: OK" if not gagal else f"versi_freecad: {gagal} halaman belum diperbarui")
        sys.exit(1 if gagal else 0)


if __name__ == "__main__":
    main()
