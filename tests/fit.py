"""One-screen check: opens the app at three laptop sizes for several opponents,
at game 1 and at game 2 after loading a real series, and reports any page that scrolls.

    pip install playwright && python -m playwright install chromium
    python tests/fit.py [screenshot-prefix]
    DATA=demo python tests/fit.py             # force web/demo-data.js (blocks web/data.js); DATA=full needs web/data.js

The header must also stay on one line at every size.
"""
import os, sys, pathlib
from playwright.sync_api import sync_playwright
EXE = os.environ.get('CHROME')
U = (pathlib.Path(__file__).resolve().parent.parent / 'web' / 'index.html').as_uri()
SH = os.environ.get('SHOTS', '')
tag = sys.argv[1] if len(sys.argv) > 1 else 'check'
DATA = os.environ.get('DATA', '')
HEADER = '''() => { const r = [...document.querySelectorAll(".top .title, .top .setup > *")].filter(e => e.offsetParent).map(e => e.getBoundingClientRect());
  return Math.max(...r.map(x => x.bottom)) - Math.min(...r.map(x => x.top)); }'''
bad = 0
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE, args=['--no-sandbox']) if EXE else p.chromium.launch()
    for w, h in [(1366, 680), (1440, 800), (1920, 960)]:
        ctx = b.new_context(viewport={'width': w, 'height': h})
        pg = ctx.new_page()
        if DATA == 'demo':
            pg.route('**/web/data.js', lambda route: route.abort())
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        for vs in ['TL', 'FLY', 'LYON', 'SEN', 'SR', 'DIG']:
            pg.goto(f'{U}?vs={vs}&t=40'); pg.evaluate('localStorage.clear()'); pg.goto(f'{U}?vs={vs}&t=40')
            pg.wait_for_timeout(300)
            for g in range(2):            # game 1, then game 2 after loading a real series game 1
                if g == 1:
                    if pg.locator('#realSel option').count() < 2:
                        continue
                    pg.select_option('#realSel', index=1); pg.wait_for_timeout(200)
                    pg.evaluate('document.getElementById("play").click(); document.getElementById("play").click()')
                sw, sh = pg.evaluate('[document.documentElement.scrollWidth, document.documentElement.scrollHeight]')
                ok = sw <= w and sh <= h
                head = pg.evaluate(HEADER)
                if head > 56:
                    print(f'HEADER WRAPS {w}x{h} vs {vs} game {g + 1}: {head:.0f}px tall')
                    ok = False
                bad += not ok
                if not ok:
                    print(f'SCROLLS {w}x{h} vs {vs} game {g + 1}: {sw}x{sh}')
        pg.goto(f'{U}?vs=SEN&t=40'); pg.wait_for_timeout(300)
        if SH:
            pg.screenshot(path=os.path.join(SH, f'{tag}-{w}.png'))
        print(w, h, 'data', pg.evaluate('window.DRAFTROOM.source || "full"'), 'errors', errs)
        ctx.close()
    b.close()
print('all fit' if not bad else f'{bad} cases scroll')
sys.exit(1 if bad else 0)
