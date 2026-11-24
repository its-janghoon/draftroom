# Session transcript

### Ran cat .junie/guidelines.md; ls web tests docs; wc -l web/style.css web/index.html; echo $CHROME; git status --short

```text
# Draft Room guidelines for Junie

- The app is plain HTML, CSS and JavaScript in `web/`. No frameworks, no build step, no new dependencies.
- `web/planner.js` holds the plan rules and must keep running in Node (`node tests/planner.test.js`).
- Every number shown to a coach comes from `web/data.js`. Never invent a number.
- Never commit GRID data or anything built from it: `web/data.js`, `cache/`, `*.zst`, `*.jsonl`.
- Match the existing look in `web/style.css`: paper background, Barlow and Barlow Condensed, Cloud9 blue for us, navy for the opponent, red only for bans.
- Every button needs a visible `:focus-visible` style.
- The whole app must fit one screen at 1366x680 with no scrolling.
docs:
ai-workflow.md
backtest.md

tests:
backtest.js
fit.py
planner.test.js

web:
app.js
data.js
index.html
planner.js
style.css
  360 web/style.css
  112 web/index.html
  472 total
/home/ubuntu/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
```

```text
The bash command read the project guidelines, listed the web, tests, and docs directories, reported line counts for the style and HTML files, and printed the headless Chromium path and git status, all of which completed with exit code 0.
```

### Read web/style.css

### Ran cat tests/fit.py; head -20 web/index.html; grep -n "#[0-9A-Fa-f]\{3,8\}\|rgb\|style\." web/app.js | head -50; grep -n "style=" web/index.html

```text
"""One-screen check: opens the app at three laptop sizes for several opponents,
at game 1 and at game 2 after loading a real series, and reports any page that scrolls.

    pip install playwright && python -m playwright install chromium
    python tests/fit.py [screenshot-prefix]
"""
import os, sys, pathlib
from playwright.sync_api import sync_playwright
EXE = os.environ.get('CHROME')
U = (pathlib.Path(__file__).resolve().parent.parent / 'web' / 'index.html').as_uri()
SH = os.environ.get('SHOTS', '')
tag = sys.argv[1] if len(sys.argv) > 1 else 'check'
bad = 0
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE, args=['--no-sandbox']) if EXE else p.chromium.launch()
    for w, h in [(1366, 680), (1440, 800), (1920, 960)]:
        ctx = b.new_context(viewport={'width': w, 'height': h})
        pg = ctx.new_page()
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
                bad += not ok
                if not ok:
                    print(f'SCROLLS {w}x{h} vs {vs} game {g + 1}: {sw}x{sh}')
        pg.goto(f'{U}?vs=SEN&t=40'); pg.wait_for_timeout(300)
        if SH:
            pg.screenshot(path=os.path.join(SH, f'{tag}-{w}.png'))
        print(w, h, 'errors', errs)
        ctx.close()
    b.close()
print('all fit' if not bad else f'{bad} cases scroll')
sys.exit(1 if bad else 0)
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Draft Room</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&display=swap">
<link rel="stylesheet" href="style.css">
</head>
<body>

<div class="top">
  <div class="title">
    <div class="match"><span class="us" id="usName"></span><span class="sc num" id="score"></span><span class="them" id="oppName"></span></div>
    <div class="game" id="gameLine"></div>
  </div>
  <div class="setup">
    <select id="usSel" aria-label="Our team"></select><span>vs</span>
    <select id="oppSel" aria-label="Opponent"></select>
    <select id="fmtSel" aria-label="Series length"><option value="3">Bo3</option><option value="5">Bo5</option></select>
141:    $('outlookHead').style.display = $('outlook').style.display = done ? 'none' : '';
171:    $('usedHead').style.display = S.games.length ? '' : 'none';
302:      bar.style.transform = `scaleX(${left / 30})`;
305:      secs.textContent = ''; bar.style.transform = 'scaleX(0)';
40:    <h3 style="margin-top:12px" id="recapHead"></h3>
65:    <h3 style="margin-top:12px" id="fpHead"></h3>
67:    <h3 style="margin-top:12px" id="mapHead"></h3>
87:      <label style="display:inline-flex;grid-template-columns:none;margin:0"><input type="radio" name="win" value="us"> <span id="dlgWinUs"></span></label>
88:      <label style="display:inline-flex;grid-template-columns:none;margin:0"><input type="radio" name="win" value="them"> <span id="dlgWinThem"></span></label>
```

```text
The bash command displayed the contents of a test script, the start of the HTML page, and matching style-related lines from the web app and HTML files, and it finished successfully.
```

## Thinking

I'm checking app.js and index.html to find where the SVG colors and fill attributes are set, so I can run the baseline fit and tests alongside the design work.

### Ran grep -n "fill=\|stroke=\|class=\"g\"\|river\|lane\|base" web/app.js web/index.html | head -30; (python tests/fit.py 2>&1 | tail -5); git status --short

```text
web/app.js:180:    const ground = `<rect x="0" y="0" width="150" height="150" rx="6" class="g"/><path d="M0 0 L150 150" class="river"/>` +
web/app.js:181:      `<path d="M12 138 L12 12 L138 12 M12 138 L138 138 L138 12 M12 138 L138 12" class="lane"/>` +
web/app.js:182:      `<circle cx="12" cy="138" r="9" class="base ${usBlue ? 'us' : 'them'}"/><circle cx="138" cy="12" r="9" class="base ${usBlue ? 'them' : 'us'}"/>`;
1366 680 errors []
1440 800 errors []
1920 960 errors []
all fit
```

```text
The grep search matched ground, river, lane, and base rendering code in the web app, and the fit tests at three viewport sizes all reported no errors and passed.
```

### Ran grep -n -i "plan ready\|ready" web/app.js web/index.html | head; sed -n 50,112p web/index.html

```text
web/app.js:240:      if (seen.has(c)) { inp.classList.add('bad'); err = err || `${c} is already used in this series. Fearless allows each champion once.`; continue; }
web/app.js:304:      turn.textContent = 'Plan ready'; turn.className = 'turn done';
web/app.js:344:      if (tag === 'BUTTON') return;          // a focused button already handles Space itself
      <div class="clock" aria-live="polite">
        <div class="clock-line"><span class="turn" id="turn"></span><span class="secs num" id="secs">30</span></div>
        <div class="clock-bar"><div id="bar"></div></div>
        <div class="ctrl"><button type="button" id="play">Pause</button><button type="button" id="again">Replay draft</button></div>
      </div>
    </div>
    <div class="sides"><span class="us" id="usSide"></span><span class="them" id="themSide"></span></div>
    <div class="phase"><div class="phase-name">First bans</div><div class="col" id="usBan"></div><div class="col" id="themBan"></div></div>
    <div class="phase"><div class="phase-name">First picks</div><div class="col" id="usPick"></div><div class="col" id="themPick"></div></div>
    <p class="later" id="later"></p>
  </section>

  <section class="sheet">
    <h3 id="habitHead"></h3>
    <div id="habits"></div>
    <h3 style="margin-top:12px" id="fpHead"></h3>
    <div class="fp num" id="fp"></div>
    <h3 style="margin-top:12px" id="mapHead"></h3>
    <div class="fbmap">
      <svg id="rift" viewBox="0 0 150 150" role="img"></svg>
      <p id="mapNote"></p>
    </div>
  </section>
</div>

<p class="src" id="src"></p>

<dialog class="dlg" id="lockDlg">
  <form method="dialog" id="lockForm">
    <h2 id="dlgTitle"></h2>
    <p>Enter the champions each team actually played. Fearless locks all of them for the rest of the series.
       The plan's picks are filled in; change any that went differently.</p>
    <div class="teams">
      <div><h3 class="us-h" id="dlgUs"></h3><div id="dlgUsPicks"></div></div>
      <div><h3 class="them-h" id="dlgThem"></h3><div id="dlgThemPicks"></div></div>
    </div>
    <div class="win">Winner
      <label style="display:inline-flex;grid-template-columns:none;margin:0"><input type="radio" name="win" value="us"> <span id="dlgWinUs"></span></label>
      <label style="display:inline-flex;grid-template-columns:none;margin:0"><input type="radio" name="win" value="them"> <span id="dlgWinThem"></span></label>
    </div>
    <div class="err" id="dlgErr" role="alert"></div>
    <div class="row"><button type="button" id="dlgCancel">Cancel</button><button type="submit" class="primary" id="dlgOk">Lock it in</button></div>
  </form>
</dialog>
<dialog class="dlg help" id="helpDlg" aria-labelledby="helpTitle">
  <h2 id="helpTitle">Keyboard shortcuts</h2>
  <dl>
    <dt><kbd>Space</kbd></dt><dd>Play or pause the replay</dd>
    <dt><kbd>R</kbd></dt><dd>Replay from the start</dd>
    <dt><kbd>L</kbd></dt><dd>Lock the game</dd>
    <dt><kbd>C</kbd></dt><dd>Copy plan</dd>
    <dt><kbd>P</kbd></dt><dd>Print sheet</dd>
    <dt><kbd>?</kbd></dt><dd>Show or hide this card</dd>
  </dl>
  <div class="row"><button type="button" id="helpClose">Close (Esc)</button></div>
</dialog>
<datalist id="champList"></datalist>

<script src="data.js"></script>
<script src="planner.js"></script>
<script src="app.js"></script>
</body>
</html>
```

```text
The search for "ready" in the web app files found a "Plan ready" status set in the app script, and the clock section of the HTML page was displayed.
```

### Ran sed -n 20,50p web/index.html

```text
    <select id="fmtSel" aria-label="Series length"><option value="3">Bo3</option><option value="5">Bo5</option></select>
    <div class="games-strip" id="strip" aria-label="Games in the series"></div>
    <select id="realSel" aria-label="Load a real series"></select>
    <button type="button" id="newSeries">New series</button>
  </div>
</div>

<section class="plan" aria-label="Plan for the next game">
  <h2 id="planHead"></h2>
  <ol id="planList"></ol>
  <div class="go"><button type="button" id="lockBtn"></button><div class="btns"><button type="button" id="copyBtn" class="secondary">Copy plan</button><button type="button" id="printBtn" class="secondary">Print sheet</button></div><small id="lockNote"></small></div>
</section>

<div class="board">
  <section class="sheet">
    <h3>What you still have</h3>
    <table class="pool num" id="pool"></table>
    <p class="thin" id="thin"></p>
    <h3 class="outlook-h" id="outlookHead">Fearless outlook</h3>
    <div class="outlook num" id="outlook"></div>
    <h3 style="margin-top:12px" id="recapHead"></h3>
    <ul class="g1 num" id="recap"></ul>
    <p class="used-h" id="usedHead">Locked for the series</p>
    <div id="used"></div>
  </section>

  <section class="sheet">
    <div class="draft-head">
      <div><h3 id="draftTitle"></h3>
      <p class="hint" id="draftHint"></p></div>
      <div class="clock" aria-live="polite">
```

```text
The command printed lines 20 to 50 of the web page's HTML file, which showed the series-length and game-strip controls, a plan section, and the start of a draft section, though part of the output was truncated.
```

## Thinking

I've mapped out the plan-design changes: gold accents on the Lock button, done checkmarks, the "Plan ready" label, the lock-in flash, and the lit plan line, with the baseline fit.py test passing. I'm now adding the new --raise, --ban-wash and --gold colour tokens and making all the edits in one pass.

### Ran cd web && sed -i 's|<meta name="viewport"[^>]*>|&\n<meta name="color-scheme" content="dark">|' index.html && sed -n 4,8p index.html; cd ..; grep -n -i "#fff\|#FBEFEE\|#EEF0EC\|#EBD3D0\|#AAB3BE\|#C3CBD4\|#2C3644\|#233142\|#1F3A50\|#[0-9a-f]\{6\}\|rgba\?(" web/style.css | grep -v "^\(29\|30\|31\|32\|33\|34\|35\)[0-9]:"

```text
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>Draft Room</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&display=swap">
2:    --paper: #F3F4F1; --sheet: #FFFFFF; --ink: #17202B; --pencil: #6B7480; --rule: #DADDD8;
3:    --c9: #1A9AD6; --c9-wash: #E3F2FA; --tl: #0B2545; --tl-wash: #E6E9EF; --ban: #C23B32;
43:  .is-ban { background: #FBEFEE; box-shadow: inset 3px 0 0 var(--ban); }
74:  .used span { padding: 1px 6px; border-radius: 3px; background: #EEF0EC; color: var(--pencil); }
93:  .fbmap .g { fill: #EEF0EC; }
94:  .fbmap .river { stroke: #D3E6F1; stroke-width: 14; }
95:  .fbmap .lane { fill: none; stroke: #DADDD8; stroke-width: 3; stroke-linecap: round; }
97:  .fbmap .dot { fill: #9AA3AD; opacity: 0; transform-box: fill-box; transform-origin: center; transform: scale(.2);
99:  .fbmap .dot.hit { fill: var(--ban); stroke: #fff; stroke-width: .8; }
103:  .fbmap .k { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #9AA3AD; margin: 0 4px 0 8px; }
117:  .pickopp button[aria-pressed="true"] { background: var(--tl); color: #fff; border-color: var(--tl); }
121:  .plan { display: grid; grid-template-columns: 1fr auto; background: var(--ink); color: #fff;
123:  .plan h2 { grid-column: 1 / -1; font: 500 14px/1 Barlow, sans-serif; color: #AAB3BE; padding: 12px 24px 2px; }
127:  .plan-line .n { width: 30px; height: 30px; border-radius: 50%; border: 2px solid #4A5563; color: #AAB3BE;
130:  .plan-line .say .ban { color: #FF8A80; }
131:  .plan-line .say .pick { color: #6CC8F2; }
132:  .plan-line .why { color: #C3CBD4; font-size: 14px; line-height: 1.35; }
133:  .plan-line .why b { color: #fff; font-weight: 600; }
134:  .plan-line.lit { background: #233142; box-shadow: inset 4px 0 0 var(--c9); }
135:  .plan-line.lit .n { border-color: var(--c9); color: #fff; }
136:  .plan-line.done .n { background: var(--c9); border-color: var(--c9); color: #fff; font-size: 0; }
139:              border-left: 1px solid #2C3644; }
140:  .plan .go small { color: #AAB3BE; font-size: 13px; text-align: center; }
141:  .plan button { font: 600 18px Barlow, sans-serif; background: var(--c9); color: #fff;
143:  .plan button:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
176:  .slot.locked::before { content: ""; position: absolute; inset: 0; border-radius: 4px; background: #fff;
247:.games-strip button.won { background: var(--c9); border-color: var(--c9); color: #fff; }
248:.games-strip button.lost { background: var(--tl); border-color: var(--tl); color: #fff; }
253:.plan .go button.secondary { font-size: 14px; background: transparent; color: #fff; border: 1px solid #AAB3BE; padding: 6px 14px; }
254:.plan .go button.secondary:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
257:.dlg { margin: auto; border: 0; border-radius: 8px; padding: 22px 24px; width: 640px; color: var(--ink); box-shadow: 0 12px 40px rgba(23,32,43,.25); }
258:.dlg::backdrop { background: rgba(23,32,43,.45); }
269:.dlg .row .primary { background: var(--c9); border-color: var(--c9); color: #fff; font-weight: 600; }
```

```text
The color-scheme dark meta tag was added to the HTML head, and a grep search listed the hex and color color values in the stylesheet, with part of the output truncated.
```

### Ran sed -n 43p web/style.css | od -c | head -5; file web/style.css

```text
0000000           .   i   s   -   b   a   n       {       b   a   c   k
0000020   g   r   o   u   n   d   :       #   F   B   E   F   E   E   ;
0000040       b   o   x   -   s   h   a   d   o   w   :       i   n   s
0000060   e   t       3   p   x       0       0       v   a   r   (   -
0000100   -   b   a   n   )   ;       }  \n
web/style.css: ASCII text
```

```text
The command inspected line 43 of the stylesheet and confirmed the file is plain ASCII text, showing a rule with a background color and an inset box-shadow.
```

### Ran cat > $JUNIE_TMPDIR/edit.py <<'EOF' import re p='web/style.css' s=open(p).read() E=[ ("    --paper: #F3F4F1; --sheet: #FFFFFF; --ink: #17202B; --pencil: #6B7480; --rule: #DADDD8;\n    --c9: #1A9AD6; --c9-wash: #E3F2FA; --tl: #0B2545; --tl-wash: #E6E9EF; --ban: #C23B32;\n",  "    --paper: #0B1118; --sheet: #121A24; --raise: #182230; --ink: #E8EDF2; --pencil: #8F9BAA; --rule: #243142;\n    --c9: #3DB4F0; --c9-wash: #12293B; --tl: #C3CEDC; --tl-wash: #1C2633; --ban: #F0695D; --ban-wash: #2A1719;\n    --gold: #D8B26A;\n"), (".is-ban { background: #FBEFEE;",".is-ban { background: var(--ban-wash);"), ("border-radius: 3px; background: #EEF0EC;","border-radius: 3px; background: var(--raise);"), (".fbmap .g { fill: #EEF0EC; }",".fbmap .g { fill: #182230; }"), ("stroke: #D3E6F1;","stroke: #1E3A52;"), ("fill: none; stroke: #DADDD8;","fill: none; stroke: #2B3A4D;"), (".fbmap .dot { fill: #9AA3AD;",".fbmap .dot { fill: var(--pencil);"), ("fill: var(--ban); stroke: #fff; stroke-width: .8;","fill: var(--ban); stroke: var(--paper); stroke-width: .8;"), ("border-radius: 50%; background: #9AA3AD;","border-radius: 50%; background: var(--pencil);"), ("color: var(--tl); background: var(--sheet);","color: var(--tl); background: var(--raise);"), ("{ background: var(--tl); color: #fff; border-color: var(--tl); }","{ background: var(--tl); color: var(--paper); border-color: var(--tl); }"), ("background: var(--ink); color: #fff;\n          border-radius: 8px;","background: var(--raise); color: var(--ink);\n          outline: 1px solid var(--rule); outline-offset: -1px;\n          border-radius: 8px;"), ("sans-serif; color: #AAB3BE; padding: 12px 24px 2px;","sans-serif; color: var(--pencil); padding: 12px 24px 2px;"), ("border: 2px solid #4A5563; color: #AAB3BE;","border: 2px solid var(--pencil); color: var(--pencil);"), (".plan-line .say .ban { color: #FF8A80; }",".plan-line .say .ban { color: var(--ban); }"), (".plan-line .say .pick { color: #6CC8F2; }",".plan-line .say .pick { color: var(--c9); }"), (".plan-line .why { color: #C3CBD4;",".plan-line .why { color: var(--pencil);"), (".plan-line .why b { color: #fff;",".plan-line .why b { color: var(--ink);"), (".plan-line.lit { background: #233142; box-shadow: inset 4px 0 0 var(--c9); }",".plan-line.lit { background: var(--rule); box-shadow: inset 4px 0 0 var(--gold); }\n  .plan-line.lit .why { color: var(--ink); }"), (".plan-line.lit .n { border-color: var(--c9); color: #fff; }",".plan-line.lit .n { border-color: var(--c9); color: var(--ink); }"), (".plan-line.done .n { background: var(--c9); border-color: var(--c9); color: #fff;",".plan-line.done .n { background: var(--gold); border-color: var(--gold); color: var(--paper);"), ("border-left: 1px solid #2C3644;","border-left: 1px solid var(--rule);"), (".plan .go small { color: #AAB3BE;",".plan .go small { color: var(--pencil);"), (".plan button { font: 600 18px Barlow, sans-serif; background: var(--c9); color: #fff;",".plan button { font: 600 18px Barlow, sans-serif; background: var(--gold); color: var(--paper);"), (".plan button:focus-visible { outline: 3px solid #fff;",".plan button:focus-visible { outline: 3px solid var(--c9);"), (".clock .turn.done { color: var(--ink); }",".clock .turn.done { color: var(--gold); }"), ("color: var(--ink); background: var(--sheet);\n                 border:","color: var(--ink); background: var(--raise);\n                 border:"), ("border-radius: 4px; background: #fff;\n","border-radius: 4px; background: var(--gold);\n"), ("color: var(--ink); background: var(--sheet);\n  border: 1px solid","color: var(--ink); background: var(--raise);\n  border: 1px solid"), ("border: 1px solid var(--rule); background: var(--sheet); color: var(--pencil); cursor: pointer; }","border: 1px solid var(--rule); background: var(--raise); color: var(--pencil); cursor: pointer; }"), ("button.won { background: var(--c9); border-color: var(--c9); color: #fff; }","button.won { background: var(--c9); border-color: var(--c9); color: var(--paper); }"), ("button.lost { background: var(--tl); border-color: var(--tl); color: #fff; }","button.lost { background: var(--tl); border-color: var(--tl); color: var(--paper); }"), ("background: transparent; color: #fff; border: 1px solid #AAB3BE;","background: var(--raise); color: var(--ink); border: 1px solid var(--rule);"), ("button.secondary:focus-visible { outline: 2px solid #fff;","button.secondary:focus-visible { outline: 2px solid var(--c9);"), ("color: var(--ink); box-shadow: 0 12px 40px rgba(23,32,43,.25); }","color: var(--ink); background: var(--raise); outline: 1px solid var(--rule); outline-offset: -1px; box-shadow: 0 12px 40px rgba(0,0,0,.5); }"), ("background: rgba(23,32,43,.45);","background: rgba(5,8,12,.65);"), (".primary { background: var(--c9); border-color: var(--c9); color: #fff;",".primary { background: var(--c9); border-color: var(--c9); color: var(--paper);"), ("  .plan { display: block; background: #fff; border: 1px solid #000;","  .plan { display: block; background: #fff; outline: 0; border: 1px solid #000;"), ] for a,b in E:     assert s.count(a)==1,(a,s.count(a))     s=s.replace(a,b) open(p,'w').write(s) EOF python $JUNIE_TMPDIR/edit.py && git diff --stat

```text
 web/index.html |  1 +
 web/style.css  | 81 ++++++++++++++++++++++++++++++----------------------------
 2 files changed, 43 insertions(+), 39 deletions(-)
```

```text
The style sheet was updated with a dark color theme by replacing 43 color and style rules, and the command completed successfully with changes across two files.
```

## Thinking

Color replacements are now applied to style.css, and the color-scheme meta tag is in index.html after the multi-edit tool kept failing on whitespace matches. Next I'll run the planner and fit tests, take screenshots, and compute the contrast ratios.

### Ran node tests/planner.test.js 2>&1 | tail -3; mkdir -p $JUNIE_TMPDIR/s; SHOTS=$JUNIE_TMPDIR/s python tests/fit.py dark 2>&1 | tail -5 cat > $JUNIE_TMPDIR/c.py <<'EOF' def L(h):     h=h.lstrip('#'); r=[int(h[i:i+2],16)/255 for i in (0,2,4)]     r=[x/12.92 if x<=.03928 else ((x+.055)/1.055)**2.4 for x in r]     return .2126*r[0]+.7152*r[1]+.0722*r[2] def cr(a,b):     x,y=sorted([L(a),L(b)],reverse=True); return (x+.05)/(y+.05) P='#0B1118';S='#121A24';R='#182230';I='#E8EDF2';PE='#8F9BAA';RU='#243142';C9='#3DB4F0';TL='#C3CEDC';BAN='#F0695D';G='#D8B26A' pairs=[('ink on paper',I,P),('ink on sheet',I,S),('ink on raise',I,R),('pencil on paper',PE,P),('pencil on sheet',PE,S),('pencil on raise',PE,R),('pencil on rule (lit line)',PE,RU),('ink on rule (lit line)',I,RU), ('c9 on sheet',C9,S),('c9 on c9-wash',C9,'#12293B'),('c9 on raise',C9,R),('c9 on rule',C9,RU),('tl on sheet',TL,S),('tl on tl-wash',TL,'#1C2633'),('tl on paper',TL,P),('ban on sheet',BAN,S),('ban on ban-wash',BAN,'#2A1719'),('ban on raise',BAN,R),('ban on rule',BAN,RU), ('paper on gold (Lock)',P,G),('gold on raise (Plan ready? on sheet)',G,S),('paper on c9 (won/primary)',P,C9),('paper on tl (lost/pressed)',P,TL),('pencil on c9-wash',PE,'#12293B'),('pencil on tl-wash',PE,'#1C2633'),('ink on ban-wash',I,'#2A1719')] for n,a,b in pairs: print(f'{cr(a,b):5.2f}  {n}') EOF python $JUNIE_TMPDIR/c.py

```text
ok: 360 plans across 9 teams
1366 680 errors []
1440 800 errors []
1920 960 errors []
all fit
16.10  ink on paper
14.87  ink on sheet
13.60  ink on raise
 6.71  pencil on paper
 6.20  pencil on sheet
 5.68  pencil on raise
 4.67  pencil on rule (lit line)
11.19  ink on rule (lit line)
 7.49  c9 on sheet
 6.39  c9 on c9-wash
 6.86  c9 on raise
 5.64  c9 on rule
10.99  tl on sheet
 9.59  tl on tl-wash
11.90  tl on paper
 5.74  ban on sheet
 5.57  ban on ban-wash
 5.25  ban on raise
 4.32  ban on rule
 9.48  paper on gold (Lock)
 8.75  gold on raise (Plan ready? on sheet)
 8.11  paper on c9 (won/primary)
11.90  paper on tl (lost/pressed)
 5.29  pencil on c9-wash
 5.41  pencil on tl-wash
14.43  ink on ban-wash
```

```text
The planner tests and layout fit checks passed across the tested screen sizes, and a contrast ratio script ran successfully, reporting ratios for the color pairs (ranging from about 4.3 to 16.1).
```
