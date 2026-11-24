# Session transcript

### Ran cd ~/workplace/draftroom; cat .junie/guidelines.md; ls -a . web tests; wc -l web/*; git status --short; cat tests/fit.py

```text
# Draft Room guidelines for Junie

- The app is plain HTML, CSS and JavaScript in `web/`. No frameworks, no build step, no new dependencies.
- `web/planner.js` holds the plan rules and must keep running in Node (`node tests/planner.test.js`).
- Every number shown to a coach comes from `web/data.js`. Never invent a number.
- Never commit GRID data or anything built from it: `web/data.js`, `cache/`, `*.zst`, `*.jsonl`.
- Match the existing look in `web/style.css`: paper background, Barlow and Barlow Condensed, Cloud9 blue for us, navy for the opponent, red only for bans.
- Every button needs a visible `:focus-visible` style.
- The whole app must fit one screen at 1366x680 with no scrolling.
.:
.
..
.git
.gitignore
.junie
LICENSE
README.md
cache
pipeline
tests
web

tests:
.
..
fit.py
planner.test.js

web:
.
..
app.js
data.js
index.html
planner.js
style.css
   339 web/app.js
     2 web/data.js
   100 web/index.html
   157 web/planner.js
   268 web/style.css
   866 total
 M tests/planner.test.js
 M web/app.js
 M web/index.html
 M web/planner.js
 M web/style.css
?? tests/fit.py
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
```

```text
The bash command read the project guidelines and listed the repository, showing a clean git status and the contents of the fit test script, though part of the output was truncated.
```

### Ran cd ~/workplace/draftroom; cat web/index.html web/style.css; python tests/fit.py 2>&1 | tail -25

```text
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
    <div class="games-strip" id="strip" aria-label="Games in the series"></div>
    <select id="realSel" aria-label="Load a real series"></select>
    <button type="button" id="newSeries">New series</button>
  </div>
</div>

<section class="plan" aria-label="Plan for the next game">
  <h2 id="planHead"></h2>
  <ol id="planList"></ol>
  <div class="go"><button type="button" id="lockBtn"></button><button type="button" id="copyBtn" class="secondary">Copy plan</button><small id="lockNote"></small></div>
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
<datalist id="champList"></datalist>

<script src="data.js"></script>
<script src="planner.js"></script>
<script src="app.js"></script>
</body>
</html>
:root {
    --paper: #F3F4F1; --sheet: #FFFFFF; --ink: #17202B; --pencil: #6B7480; --rule: #DADDD8;
    --c9: #1A9AD6; --c9-wash: #E3F2FA; --tl: #0B2545; --tl-wash: #E6E9EF; --ban: #C23B32;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { max-width: 1440px; margin: 0 auto; background: var(--paper); color: var(--ink);
         font: 15px/1.45 Barlow, sans-serif; padding: 16px 28px 12px; }
  .cond { font-family: "Barlow Condensed", sans-serif; }
  .num { font-variant-numeric: tabular-nums; }

  /* top line: match and clock, kept small so the plan leads */
  .top { display: flex; align-items: center; gap: 24px; margin-bottom: 12px; }
  .match { font: 600 26px/1 "Barlow Condensed", sans-serif; }
  .match .us { color: var(--c9); } .match .them { color: var(--tl); }
  .match .sc { margin: 0 10px; }
  .top .game { color: var(--pencil); font-size: 14px; }

  .board { display: grid; grid-template-columns: minmax(300px, 26%) minmax(0, 1fr) minmax(260px, 22%); gap: 16px; }
  .sheet { background: var(--sheet); border: 1px solid var(--rule); border-radius: 6px; padding: 14px 18px; }
  h3 { font: 600 16px/1.2 Barlow, sans-serif; margin-bottom: 8px; }
  h3 + p.hint { color: var(--pencil); font-size: 13px; margin: -6px 0 10px; }

  /* the draft spine */
  .phase { display: grid; grid-template-columns: 1fr 1fr; gap: 0 14px; }
  .phase .col { display: grid; gap: 5px; align-content: start; }
  .sides { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 13px; font-weight: 600; margin-bottom: 4px; }
  .sides .us { color: var(--c9); } .sides .them { color: var(--tl); text-align: right; }
  .later { margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--rule); font-size: 13px; color: var(--pencil); }
  .phase + .phase { margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--rule); }
  .phase-name { grid-column: 1 / -1; text-align: center; color: var(--pencil); font-size: 13px; margin-bottom: 4px; }
  .slot { display: flex; align-items: baseline; gap: 10px; padding: 6px 10px; border-radius: 4px; min-height: 32px; }
  .slot .who { font: 600 20px/1 "Barlow Condensed", sans-serif; }
  .slot .why { font-size: 13px; color: var(--pencil); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .slot .rec { white-space: nowrap; margin-left: auto; font: 600 16px/1 "Barlow Condensed", sans-serif; }
  .r { flex-direction: row-reverse; text-align: right; }
  .r .rec { margin-left: 0; margin-right: auto; }
  .slot .step { flex: none; width: 16px; font: 600 14px/1 "Barlow Condensed", sans-serif; color: var(--pencil); opacity: .8; }
  .us-pick { background: var(--c9-wash); }
  .us-pick .who { color: var(--c9); }
  .them-pick { background: var(--tl-wash); }
  .them-pick .who { color: var(--tl); }
  .is-ban .who { color: var(--ban); }
  .is-ban { background: #FBEFEE; box-shadow: inset 3px 0 0 var(--ban); }
  .r.is-ban { box-shadow: inset -3px 0 0 var(--ban); }
  .open { border: 1px dashed var(--rule); color: var(--pencil); font-size: 13px; }
  .guess { font-style: italic; }

  /* fearless */
  .gone { display: flex; flex-wrap: wrap; gap: 2px 10px; margin-bottom: 10px; color: var(--pencil); font-size: 14px; }
  .gone span { text-decoration: line-through; }
  .pool { width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed; }
  .pool td { padding: 4px 0; border-top: 1px solid var(--rule); vertical-align: baseline; }
  .pool td:first-child { color: var(--pencil); width: 58px; padding-right: 6px; }
  .pool b { font-weight: 600; }
  .pool i { font-style: normal; color: var(--pencil); }
  .pool .row3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0 6px; }
  .pool .ch { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; transition: color .3s, opacity .3s; }
  .pool .ch.banned { opacity: .35; text-decoration: line-through; }
  .pool .ch.ours b { color: var(--c9); }
  .pool .ch.ours::after { content: " \2713"; color: var(--c9); font-weight: 700; }
  .pool .ch.theirs { opacity: .35; }
  .fp { display: grid; grid-template-columns: 1fr auto 1fr auto; gap: 2px 10px; font-size: 14px; margin-top: 4px; }
  .fp span { transition: opacity .3s, color .3s; }
  .fp .out { opacity: .35; text-decoration: line-through; }
  .fp .took { color: var(--tl); font-weight: 600; }
  .slot.pending::after { content: attr(data-kind); position: absolute; top: 50%; transform: translateY(-50%);
                         font-size: 12.5px; color: var(--pencil); opacity: .7; }
  .slot.l.pending::after { left: 38px; }
  .slot.r.pending::after { right: 38px; }
  .g1 { list-style: none; font-size: 13.5px; }
  .g1 li { padding: 3px 0; }
  .used-h { font-size: 12.5px; color: var(--pencil); margin: 8px 0 4px; }
  .used { display: flex; flex-wrap: wrap; gap: 3px; margin-bottom: 4px; font-size: 12.5px; }
  .used span { padding: 1px 6px; border-radius: 3px; background: #EEF0EC; color: var(--pencil); }
  .used .t { background: none; padding-left: 0; min-width: 34px; font-weight: 600; }
  .used .t.us { color: var(--c9); } .used .t.them { color: var(--tl); }
  .thin { margin-top: 8px; font-size: 13.5px; color: var(--ban); }
  .outlook-h { margin-top: 10px; margin-bottom: 4px; }
  .orow { display: flex; align-items: center; gap: 6px; font-size: 13px; padding: 2px 0; border-top: 1px solid var(--rule); }
  .orow .role { width: 58px; flex: none; color: var(--pencil); }
  .orow .dots { display: flex; gap: 3px; flex: none; min-width: 86px; }
  .orow .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--c9); border: 1.5px solid var(--c9); }
  .orow .dot.plan { background: transparent; }
  .orow b { font-weight: 600; width: 12px; }
  .orow .warn { color: var(--ban); font-size: 12.5px; white-space: nowrap; margin-left: auto; }

  /* liquid habits */
  .habit { padding: 6px 0; border-top: 1px solid var(--rule); font-size: 14.5px; }
  .habit:first-of-type { border-top: 0; padding-top: 0; }
  .habit .big { font: 700 22px/1 "Barlow Condensed", sans-serif; color: var(--tl); margin-right: 6px; }
  .fbmap { display: grid; grid-template-columns: 132px 1fr; gap: 12px; align-items: center; margin-top: 4px; }
  .fbmap svg { width: 132px; height: 132px; display: block; }
  .fbmap .g { fill: #EEF0EC; }
  .fbmap .river { stroke: #D3E6F1; stroke-width: 14; }
  .fbmap .lane { fill: none; stroke: #DADDD8; stroke-width: 3; stroke-linecap: round; }
  .fbmap .base.us { fill: var(--c9); } .fbmap .base.them { fill: var(--tl); }
  .fbmap .dot { fill: #9AA3AD; opacity: 0; transform-box: fill-box; transform-origin: center; transform: scale(.2);
                transition: opacity .3s ease-out, transform .35s ease-out; }
  .fbmap .dot.hit { fill: var(--ban); stroke: #fff; stroke-width: .8; }
  .fbmap.show .dot { opacity: .9; transform: scale(1); }
  .fbmap p { font-size: 13.5px; line-height: 1.4; }
  .fbmap .key { display: block; margin-top: 6px; color: var(--pencil); font-size: 12.5px; }
  .fbmap .k { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #9AA3AD; margin: 0 4px 0 8px; }
  .fbmap .k.hit { background: var(--ban); margin-left: 0; }
  .duel { display: grid; grid-template-columns: 1fr 44px 44px; gap: 4px 8px; font-size: 14px; margin-top: 6px; }
  .duel .h { color: var(--pencil); font-size: 12.5px; text-align: right; }
  .duel .h.c9 { color: var(--c9); } .duel .h.tl { color: var(--tl); }
  .duel .v { text-align: right; font-weight: 600; }
  .duel .v.win { color: var(--c9); }

  .src { margin-top: 6px; color: var(--pencil); font-size: 12.5px; }

  .pickopp { margin-left: auto; display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--pencil); }
  .pickopp span { margin-right: 4px; }
  .pickopp button { font: 600 14px "Barlow Condensed", sans-serif; color: var(--tl); background: var(--sheet);
                    border: 1px solid var(--rule); border-radius: 4px; padding: 4px 10px; cursor: pointer; }
  .pickopp button[aria-pressed="true"] { background: var(--tl); color: #fff; border-color: var(--tl); }
  .pickopp button:focus-visible { outline: 2px solid var(--c9); outline-offset: 2px; }
  .duel .v.win.them { color: var(--tl); }
  /* the coach's call: the biggest thing on the page */
  .plan { display: grid; grid-template-columns: 1fr auto; background: var(--ink); color: #fff;
          border-radius: 8px; margin-bottom: 14px; overflow: hidden; }
  .plan h2 { grid-column: 1 / -1; font: 500 14px/1 Barlow, sans-serif; color: #AAB3BE; padding: 12px 24px 2px; }
  .plan ol { list-style: none; }
  .plan-line { display: grid; grid-template-columns: 34px minmax(0, 1fr) minmax(260px, 34%); align-items: center; gap: 14px;
               padding: 5px 24px; box-shadow: inset 4px 0 0 transparent; transition: background-color .3s, box-shadow .3s; }
  .plan-line .n { width: 30px; height: 30px; border-radius: 50%; border: 2px solid #4A5563; color: #AAB3BE;
                  display: grid; place-items: center; font: 700 18px/1 "Barlow Condensed", sans-serif; transition: all .3s; }
  .plan-line .say { font: 600 32px/1.05 "Barlow Condensed", sans-serif; }
  .plan-line .say .ban { color: #FF8A80; }
  .plan-line .say .pick { color: #6CC8F2; }
  .plan-line .why { color: #C3CBD4; font-size: 14px; line-height: 1.35; }
  .plan-line .why b { color: #fff; font-weight: 600; }
  .plan-line.lit { background: #233142; box-shadow: inset 4px 0 0 var(--c9); }
  .plan-line.lit .n { border-color: var(--c9); color: #fff; }
  .plan-line.done .n { background: var(--c9); border-color: var(--c9); color: #fff; font-size: 0; }
  .plan-line.done .n::after { content: "\2713"; font-size: 18px; }
  .plan .go { display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 0 28px;
              border-left: 1px solid #2C3644; }
  .plan .go small { color: #AAB3BE; font-size: 13px; text-align: center; }
  .plan button { font: 600 18px Barlow, sans-serif; background: var(--c9); color: #fff;
                 border: 0; border-radius: 6px; padding: 16px 26px; cursor: pointer; white-space: nowrap; }
  .plan button:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
  .plan { padding-bottom: 10px; }

  /* champ-select replay */
  .draft-head { display: flex; gap: 18px; align-items: flex-start; }
  .draft-head > div:first-child { flex: 1; min-width: 0; }
  .clock { width: 210px; flex: none; }
  .clock-line { display: flex; justify-content: space-between; align-items: baseline; font-size: 13.5px; }
  .clock .turn { font-weight: 600; color: var(--c9); transition: color .2s; }
  .clock .turn.them { color: var(--tl); }
  .clock .turn.done { color: var(--ink); }
  .clock .secs { font: 700 20px/1 "Barlow Condensed", sans-serif; }
  .clock-bar { height: 4px; background: var(--rule); border-radius: 2px; margin-top: 5px; overflow: hidden; }
  .clock-bar div { height: 100%; width: 100%; background: var(--c9); transform-origin: left; }
  .clock-bar div.them { background: var(--tl); }
  .ctrl { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
  .ctrl button { font: 500 12.5px Barlow, sans-serif; color: var(--ink); background: var(--sheet);
                 border: 1px solid var(--rule); border-radius: 4px; padding: 4px 10px; cursor: pointer; }
  .ctrl button:focus-visible { outline: 2px solid var(--c9); outline-offset: 2px; }

  .slot { position: relative; transition: background-color .25s, box-shadow .25s; }
  .slot .why, .slot .rec { transition: opacity .35s ease-out .12s; }
  .slot.pending { background: transparent !important; box-shadow: inset 0 0 0 1px var(--rule) !important; }
  .slot.pending .who, .slot.pending .why, .slot.pending .rec { opacity: 0; }
  .slot.active { box-shadow: inset 0 0 0 2px var(--c9) !important; animation: hover-glow 1s ease-in-out infinite; }
  .slot.r.active { box-shadow: inset 0 0 0 2px var(--tl) !important; }
  .slot.active .why, .slot.active .rec { opacity: 0; }
  .slot.active .who { opacity: .5; }
  .slot.active.us-pick, .slot.active.l.is-ban { background: var(--c9-wash) !important; }
  .slot.active.them-pick, .slot.active.r.is-ban { background: var(--tl-wash) !important; }
  .slot.active.is-ban .who { color: var(--ink); }
  @keyframes hover-glow { 50% { filter: brightness(1.04); } }
  .slot.locked { animation: lock-in .5s cubic-bezier(.2,.9,.3,1); }
  .slot.locked::before { content: ""; position: absolute; inset: 0; border-radius: 4px; background: #fff;
                         opacity: 0; animation: flash .45s ease-out; pointer-events: none; }
  @keyframes lock-in { 0% { transform: scale(1.045); } 100% { transform: scale(1); } }
  @keyframes flash { 0% { opacity: .85; } 100% { opacity: 0; } }
  .slot.is-ban.locked { animation: lock-in .5s cubic-bezier(.2,.9,.3,1), ban-bar .35s ease-out; }
  @keyframes ban-bar { 0% { box-shadow: inset 0 0 0 0 var(--ban); } }
  .slot .step.now { color: var(--ink); opacity: 1; }
  .phase-name.now { color: var(--ink); font-weight: 600; }
  @media (max-height: 740px) {
    .fbmap { grid-template-columns: 104px 1fr; } .fbmap svg { width: 104px; height: 104px; }
    body { padding-top: 10px; }
    .top { margin-bottom: 8px; }
    .plan-line .say { font-size: 26px; }
    .plan-line { padding: 3px 24px; }
    .plan-line .why { font-size: 13px; }
    .plan { margin-bottom: 10px; }
    .slot { min-height: 28px; padding: 4px 10px; }
    .slot .who { font-size: 18px; }
    .habit { padding: 3px 0; font-size: 13.5px; }
    .habit .big { font-size: 19px; }
    .duel { gap: 1px 8px; font-size: 13px; }
    h3 + p.hint { display: none; }
    .sheet { padding: 10px 14px; }
    .sheet h3[style] { margin-top: 6px !important; }
    .plan h2 { padding-top: 8px; }
    .phase + .phase { margin-top: 4px; padding-top: 4px; }
    .slot .why { font-size: 12px; }
    .g1 { font-size: 12.5px; } .g1 li { padding: 1px 0; }
    .pool td { padding: 2px 0; }
    .used { font-size: 12px; } .used span { padding: 0 5px; }
    .used-h { margin: 4px 0 3px; }
    .thin { font-size: 12.5px; margin-top: 4px; }
    .outlook-h { margin-top: 5px !important; margin-bottom: 2px; font-size: 15px; }
    .orow { padding: 0; font-size: 12.5px; line-height: 1.3; }
    .orow .dot { width: 8px; height: 8px; }
    .outlook-h { font-size: 14px; }
    .used { flex-wrap: nowrap; overflow: hidden; margin-bottom: 2px; -webkit-mask-image: linear-gradient(90deg, #000 92%, transparent); mask-image: linear-gradient(90deg, #000 92%, transparent); }
    .used span { flex: none; }
    .pool td { padding: 1px 0; }
    .sheet h3 { margin-bottom: 4px; }
    .board { grid-template-columns: minmax(300px, 30%) minmax(0, 1fr) minmax(260px, 22%); }
    body { padding-top: 8px; padding-bottom: 6px; }
    .top .game { margin-top: 2px; }
    .plan h2 { padding-top: 6px; font-size: 13px; }
    .plan-line .say { font-size: 24px; }
    .plan-line { padding: 2px 24px; }
    .plan button { padding: 10px 22px; font-size: 17px; }
    .plan .go { gap: 6px; }
    .plan { padding-bottom: 6px; margin-bottom: 8px; }
    .src { margin-top: 3px; line-height: 1.2; }
    .ctrl { margin-top: 4px; } .ctrl button { padding: 2px 8px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .slot, .slot.locked, .slot.active, .plan-line, .slot.locked::before, .fbmap .dot { animation: none !important; transition: none !important; }
  }

/* series controls */
.setup { margin-left: auto; display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--pencil); }
.setup select, .setup button, .dlg select, .dlg input, .dlg button {
  font: 500 13.5px Barlow, sans-serif; color: var(--ink); background: var(--sheet);
  border: 1px solid var(--rule); border-radius: 4px; padding: 5px 8px; }
.setup button, .dlg button { cursor: pointer; }
.setup :focus-visible, .dlg :focus-visible, .games-strip button:focus-visible { outline: 2px solid var(--c9); outline-offset: 1px; }
.games-strip { display: flex; gap: 4px; }
.games-strip button { font: 600 13px "Barlow Condensed", sans-serif; width: 34px; padding: 4px 0; border-radius: 4px;
  border: 1px solid var(--rule); background: var(--sheet); color: var(--pencil); cursor: pointer; }
.games-strip button.won { background: var(--c9); border-color: var(--c9); color: #fff; }
.games-strip button.lost { background: var(--tl); border-color: var(--tl); color: #fff; }
.games-strip button.now { border-color: var(--ink); color: var(--ink); }
.games-strip button:disabled { cursor: default; opacity: .5; }
.empty { color: var(--pencil); font-size: 13px; }
.plan button:disabled { opacity: .5; cursor: default; }
.plan .go button.secondary { font-size: 14px; background: transparent; color: #fff; border: 1px solid #AAB3BE; padding: 6px 14px; }
.plan .go button.secondary:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

/* lock-in dialog: what was actually played */
.dlg { margin: auto; border: 0; border-radius: 8px; padding: 22px 24px; width: 640px; color: var(--ink); box-shadow: 0 12px 40px rgba(23,32,43,.25); }
.dlg::backdrop { background: rgba(23,32,43,.45); }
.dlg h2 { font: 600 22px "Barlow Condensed", sans-serif; margin-bottom: 4px; }
.dlg p { color: var(--pencil); font-size: 13.5px; margin-bottom: 14px; }
.dlg .teams { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.dlg .teams h3 { margin-bottom: 6px; }
.dlg .teams .us-h { color: var(--c9); } .dlg .teams .them-h { color: var(--tl); }
.dlg label { display: grid; grid-template-columns: 62px 1fr; align-items: center; gap: 6px; font-size: 13px; color: var(--pencil); margin-bottom: 5px; }
.dlg input.bad { border-color: var(--ban); }
.dlg .win { display: flex; gap: 14px; align-items: center; margin: 14px 0 4px; font-size: 14px; }
.dlg .err { color: var(--ban); font-size: 13px; min-height: 18px; }
.dlg .row { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
.dlg .row .primary { background: var(--c9); border-color: var(--c9); color: #fff; font-weight: 600; }

.top .title { min-width: 0; }
.top .title .match { white-space: nowrap; }
.top .title .game { margin-top: 4px; }
SCROLLS 1366x680 vs TL game 2: 1366x700
SCROLLS 1366x680 vs FLY game 2: 1366x700
SCROLLS 1366x680 vs LYON game 2: 1366x700
SCROLLS 1366x680 vs SEN game 2: 1366x700
SCROLLS 1366x680 vs SR game 2: 1366x700
SCROLLS 1366x680 vs DIG game 2: 1366x700
1366 680 errors []
SCROLLS 1440x800 vs TL game 2: 1440x962
SCROLLS 1440x800 vs FLY game 2: 1440x943
SCROLLS 1440x800 vs LYON game 2: 1440x923
SCROLLS 1440x800 vs SEN game 2: 1440x946
SCROLLS 1440x800 vs SR game 1: 1440x806
SCROLLS 1440x800 vs SR game 2: 1440x966
SCROLLS 1440x800 vs DIG game 2: 1440x927
1440 800 errors []
SCROLLS 1920x960 vs TL game 2: 1920x962
SCROLLS 1920x960 vs SR game 2: 1920x966
1920 960 errors []
15 cases scroll
```

```text
The fit check script finished with exit code 0, reporting no JavaScript errors but 15 layouts that scroll rather than fit, including overflow at 1440x800 and 1366x680 viewports.
```

### Read web/style.css

### Read web/index.html

## Thinking

I am checking how app.js uses the recap and used rendering so I can confirm where those displays are wired in.

### Ran cd ~/workplace/draftroom; grep -n "recap\|usedHead\|'used'\|\"used\"\|later\|thin\|outlook" web/app.js | head -50; ls /tmp/junie*/ ; git diff --stat

```text
108:    $('thin').textContent = m.thin;
109:    outlook(N, done);
110:    recap(us, op, last, N);
122:    $('later').textContent = `Steps 13 to 20 open once you see their first three picks.` +
138:  // fearless outlook: one dot per proven champion still open after this game's picks, hollow if the plan uses it
139:  function outlook(N, done) {
140:    $('outlookHead').style.display = $('outlook').style.display = done ? 'none' : '';
141:    if (done) { $('outlook').innerHTML = ''; return; }
143:    $('outlook').innerHTML = P.outlook(D, S.us, locked(), m.steps.us_pick).map(r => {
152:  function recap(us, op, last, N) {
155:      $('recapHead').textContent = 'Before game 1';
156:      $('recap').innerHTML = `<li class="empty">Nothing is locked yet. After each game, press Lock and enter what was played.</li>`;
158:      $('recapHead').textContent = `Game ${N - 1}: ${last.winner === 'us' ? us.name : op.name} won` +
167:      $('recap').innerHTML = f.map(x => `<li>${x}</li>`).join('');
170:    $('usedHead').style.display = S.games.length ? '' : 'none';
171:    $('used').innerHTML = S.games.length ? [[us.tag, 'us', usedUs], [op.tag, 'them', usedThem]].map(([t, c, xs]) =>
172:      `<div class="used" title="${esc(xs.join(', '))}"><span class="t ${c}">${esc(t)}</span>${xs.map(x => `<span>${esc(x)}</span>`).join('')}</div>`).join('') : '';
/tmp/junie-session-261124-073925-1dbh/:

/tmp/junie-session-261124-074707-32ud/:

/tmp/junie-session-261124-075613-1vv6/:
g1.png
g2.png
m.js
m2.js
m3.js
s0.png
s1.png
s2.png
s3.png
s4.png
sen1.png
shot.js

/tmp/junie-session-261124-080118-12nl/:
 tests/planner.test.js |  8 +++++++-
 web/app.js            | 17 ++++++++++++++++-
 web/index.html        |  2 ++
 web/planner.js        | 13 ++++++++++++-
 web/style.css         | 26 ++++++++++++++++++++++++++
 5 files changed, 63 insertions(+), 3 deletions(-)
```

```text
The grep search of the web app code returned matches for outlook, recap, and related display logic, and git diff stats show 63 insertions and 3 deletions across five changed files.
```

### Read web/app.js [90-210]

## Thinking

I found that the recap and locked chips can move from the left panel into a two-column strip under the "later" line in the middle panel, since the recap code looks up its elements by id and needs no JavaScript changes. I'm now rebuilding that block as a two-column strip, adding the CSS, and rerunning fit.py, then I'll check the layout against the 15 scroll cases in game 2 and the SR game at 1440x800.

### Edited web/index.html +10 -4

#### web/index.html

```diff
--- a/web/index.html
+++ b/web/index.html
@@ -37,10 +37,6 @@
     <p class="thin" id="thin"></p>
     <h3 class="outlook-h" id="outlookHead">Fearless outlook</h3>
     <div class="outlook num" id="outlook"></div>
-    <h3 style="margin-top:12px" id="recapHead"></h3>
-    <ul class="g1 num" id="recap"></ul>
-    <p class="used-h" id="usedHead">Locked for the series</p>
-    <div id="used"></div>
   </section>
 
   <section class="sheet">

@@ -57,6 +53,16 @@
     <div class="phase"><div class="phase-name">First bans</div><div class="col" id="usBan"></div><div class="col" id="themBan"></div></div>
     <div class="phase"><div class="phase-name">First picks</div><div class="col" id="usPick"></div><div class="col" id="themPick"></div></div>
     <p class="later" id="later"></p>
+    <div class="strip2">
+      <div class="recap-col">
+        <h3 id="recapHead"></h3>
+        <ul class="g1 num" id="recap"></ul>
+      </div>
+      <div class="used-col" id="usedCol">
+        <p class="used-h" id="usedHead">Locked for the series</p>
+        <div id="used"></div>
+      </div>
+    </div>
   </section>
 
   <section class="sheet">
```

### Ran cd ~/workplace/draftroom; cat >> web/style.css <<'EOF'  /* game recap and locked champions: compact strip under the draft */ .strip2 { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 0 18px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--rule); } .strip2 h3 { font-size: 14px; margin-bottom: 3px; } .strip2 .used-h { margin: 0 0 3px; font: 600 14px/1.2 Barlow, sans-serif; color: var(--ink); } .strip2 .g1 { font-size: 12.5px; line-height: 1.3; } .strip2 .g1 li { padding: 1px 0; } .strip2 .used { margin-bottom: 3px; } EOF python tests/fit.py 2>&1 | tail -20

```text
SCROLLS 1366x680 vs SR game 1: 1366x694
SCROLLS 1366x680 vs SR game 2: 1366x735
SCROLLS 1366x680 vs DIG game 1: 1366x694
SCROLLS 1366x680 vs DIG game 2: 1366x753
1366 680 errors []
SCROLLS 1440x800 vs TL game 1: 1440x831
SCROLLS 1440x800 vs TL game 2: 1440x888
SCROLLS 1440x800 vs FLY game 1: 1440x831
SCROLLS 1440x800 vs FLY game 2: 1440x869
SCROLLS 1440x800 vs LYON game 1: 1440x831
SCROLLS 1440x800 vs LYON game 2: 1440x888
SCROLLS 1440x800 vs SEN game 1: 1440x831
SCROLLS 1440x800 vs SEN game 2: 1440x869
SCROLLS 1440x800 vs SR game 1: 1440x831
SCROLLS 1440x800 vs SR game 2: 1440x869
SCROLLS 1440x800 vs DIG game 1: 1440x831
SCROLLS 1440x800 vs DIG game 2: 1440x892
1440 800 errors []
1920 960 errors []
24 cases scroll
```

```text
The style rules for a game recap strip were appended to the stylesheet, and the fit test ran with exit code 0, reporting no errors across the 1366x680, 1440x800, and 1920x960 viewports for 24 scroll cases.
```

### Failed to run cd ~/workplace/draftroom; cat > $JUNIE_TMPDIR/m.py <<'EOF' import pathlib from playwright.sync_api import sync_playwright U = pathlib.Path('web/index.html').resolve().as_uri() with sync_playwright() as p:     b = p.chromium.launch()     for w,h in [(1366,680),(1440,800),(1920,960)]:         pg = b.new_page(viewport={'width':w,'height':h})         for vs in ['TL','DIG']:           pg.goto(f'{U}?vs={vs}&t=40'); pg.evaluate('localStorage.clear()'); pg.goto(f'{U}?vs={vs}&t=40'); pg.wait_for_timeout(300)           for g in (0,1):             if g:                 pg.select_option('#realSel', index=1); pg.wait_for_timeout(200)                 pg.evaluate('document.getElementById("play").click(); document.getElementById("play").click()')             print(w,h,vs,g+1,pg.evaluate('''()=>({doc:document.documentElement.scrollHeight, top:document.querySelector('.top').offsetHeight, plan:document.querySelector('.plan').offsetHeight, board:document.querySelector('.board').offsetHeight, panels:[...document.querySelectorAll('.board>.sheet')].map(e=>[e.offsetHeight,e.scrollHeight]), strip:document.querySelector('.strip2').offsetHeight})''')) EOF python $JUNIE_TMPDIR/m.py

```text
Traceback (most recent call last):
  File "/tmp/junie-session-261124-080118-12nl/m.py", line 5, in <module>
    b = p.chromium.launch()
  File "<venv>/site-packages/playwright/sync_api/_generated.py", line 4113, in launch
    self._sync(
    ~~~~~~~~~~^
        self._impl_obj.launch(
        ^^^^^^^^^^^^^^^^^^^^^^
    ...<17 lines>...
        )
        ^
    )
    ^
  File "<venv>/site-packages/playwright/_impl/_sync_base.py", line 124, in _sync
    return task.result()
           ~~~~~~~~~~~^^
  File "<venv>/site-packages/playwright/_impl/channel_owner.py", line 387, in finish
    raise e from None
  File "<venv>/site-packages/playwright/_impl/channel_owner.py", line 352, in finish
    result = await zone.run_async(lambda: awaitable)
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<venv>/site-packages/playwright/_impl/utils/zones.py", line 58, in run_async
    return await func()
           ^^^^^^^^^^^^
  File "<venv>/site-packages/playwright/_impl/browser_type.py", line 176, in launch
    await self._channel.launch(
    ...<2 lines>...
    )
  File "<venv>/site-packages/playwright/_impl/channel_owner.py", line 398, in _mapped
    return mapper(await awaitable)
                  ^^^^^^^^^^^^^^^
playwright._impl._errors.Error: BrowserType.launch: Executable doesn't exist at ~/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║                                                            ║
║     playwright install                                     ║
║                                                            ║
║ <3 Playwright Team                                         ║
╚════════════════════════════════════════════════════════════╝
```

### Ran cd ~/workplace/draftroom; echo "CHROME=$CHROME"; sed -i "s|p.chromium.launch()|p.chromium.launch(executable_path=__import__('os').environ.get('CHROME'), args=['--no-sandbox'])|" $JUNIE_TMPDIR/m.py; python $JUNIE_TMPDIR/m.py

```text
CHROME=~/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
1366 680 TL 1 {'doc': 694, 'top': 50, 'plan': 139, 'board': 457, 'panels': [[457, 455], [457, 455], [457, 455]], 'strip': 65}
1366 680 TL 2 {'doc': 750, 'top': 50, 'plan': 139, 'board': 513, 'panels': [[513, 511], [513, 511], [513, 511]], 'strip': 102}
1366 680 DIG 1 {'doc': 694, 'top': 50, 'plan': 139, 'board': 457, 'panels': [[457, 455], [457, 455], [457, 455]], 'strip': 65}
1366 680 DIG 2 {'doc': 753, 'top': 50, 'plan': 139, 'board': 516, 'panels': [[516, 514], [516, 514], [516, 514]], 'strip': 102}
1440 800 TL 1 {'doc': 831, 'top': 50, 'plan': 177, 'board': 526, 'panels': [[526, 524], [526, 524], [526, 524]], 'strip': 65}
1440 800 TL 2 {'doc': 888, 'top': 50, 'plan': 177, 'board': 583, 'panels': [[583, 581], [583, 581], [583, 581]], 'strip': 121}
1440 800 DIG 1 {'doc': 831, 'top': 50, 'plan': 177, 'board': 526, 'panels': [[526, 524], [526, 524], [526, 524]], 'strip': 65}
1440 800 DIG 2 {'doc': 892, 'top': 50, 'plan': 181, 'board': 583, 'panels': [[583, 581], [583, 581], [583, 581]], 'strip': 121}
1920 960 TL 1 {'doc': 960, 'top': 50, 'plan': 177, 'board': 526, 'panels': [[526, 524], [526, 524], [526, 524]], 'strip': 65}
1920 960 TL 2 {'doc': 960, 'top': 50, 'plan': 177, 'board': 583, 'panels': [[583, 581], [583, 581], [583, 581]], 'strip': 121}
1920 960 DIG 1 {'doc': 960, 'top': 50, 'plan': 177, 'board': 526, 'panels': [[526, 524], [526, 524], [526, 524]], 'strip': 65}
1920 960 DIG 2 {'doc': 960, 'top': 50, 'plan': 181, 'board': 583, 'panels': [[583, 581], [583, 581], [583, 581]], 'strip': 121}
```

```text
The script ran successfully (exit code 0) and printed layout measurements for four viewport sizes (1366x680, 1440x800, 1920x960) across two states (TL and DIG) at two steps each.
```

## Thinking

I found that the middle panel is the tallest, so the page still scrolls at 1440x800 and overflows by 14px at 1366x680, with 55–112px overflow in game 2. Next I'll measure each panel's natural height with the grid alignment set to start, so I can decide how to split the content across the three panels.

### Ran cd ~/workplace/draftroom; sed -i "s|print(w,h,vs|pg.add_style_tag(content='.board{align-items:start}'); print(w,h,vs|; s|'panels':|'x':0,'panels':|" $JUNIE_TMPDIR/m.py; python $JUNIE_TMPDIR/m.py | grep -v " DIG "

```text
1366 680 TL 1 {'doc': 694, 'top': 50, 'plan': 139, 'board': 457, 'panels': [[289, 287], [457, 455], [393, 391]], 'strip': 65}
1366 680 TL 2 {'doc': 750, 'top': 50, 'plan': 139, 'board': 513, 'panels': [[289, 287], [513, 511], [393, 391]], 'strip': 102}
1440 800 TL 1 {'doc': 831, 'top': 50, 'plan': 177, 'board': 526, 'panels': [[398, 396], [526, 524], [482, 480]], 'strip': 65}
1440 800 TL 2 {'doc': 888, 'top': 50, 'plan': 177, 'board': 583, 'panels': [[417, 415], [583, 581], [482, 480]], 'strip': 121}
1920 960 TL 1 {'doc': 960, 'top': 50, 'plan': 177, 'board': 526, 'panels': [[398, 396], [526, 524], [482, 480]], 'strip': 65}
1920 960 TL 2 {'doc': 960, 'top': 50, 'plan': 177, 'board': 583, 'panels': [[417, 415], [583, 581], [482, 480]], 'strip': 121}
```

```text
The script ran successfully and printed layout measurements for six viewport and layout combinations, with board heights varying by viewport size and layout variant.
```

### Edited web/index.html +4 -10

#### web/index.html

```diff
--- a/web/index.html
+++ b/web/index.html
@@ -37,6 +37,10 @@
     <p class="thin" id="thin"></p>
     <h3 class="outlook-h" id="outlookHead">Fearless outlook</h3>
     <div class="outlook num" id="outlook"></div>
+    <h3 style="margin-top:12px" id="recapHead"></h3>
+    <ul class="g1 num" id="recap"></ul>
+    <p class="used-h" id="usedHead">Locked for the series</p>
+    <div id="used"></div>
   </section>
 
   <section class="sheet">

@@ -53,16 +57,6 @@
     <div class="phase"><div class="phase-name">First bans</div><div class="col" id="usBan"></div><div class="col" id="themBan"></div></div>
     <div class="phase"><div class="phase-name">First picks</div><div class="col" id="usPick"></div><div class="col" id="themPick"></div></div>
     <p class="later" id="later"></p>
-    <div class="strip2">
-      <div class="recap-col">
-        <h3 id="recapHead"></h3>
-        <ul class="g1 num" id="recap"></ul>
-      </div>
-      <div class="used-col" id="usedCol">
-        <p class="used-h" id="usedHead">Locked for the series</p>
-        <div id="used"></div>
-      </div>
-    </div>
   </section>
 
   <section class="sheet">
```

### Ran cd ~/workplace/draftroom; python - <<'EOF' p='web/style.css' s=open(p).read() i=s.index('\n/* game recap and locked champions') open(p,'w').write(s[:i]) EOF tail -5 web/style.css; git diff web/index.html | head -30; git diff web/app.js web/style.css

```text
.dlg .row .primary { background: var(--c9); border-color: var(--c9); color: #fff; font-weight: 600; }

.top .title { min-width: 0; }
.top .title .match { white-space: nowrap; }
.top .title .game { margin-top: 4px; }
diff --git a/web/index.html b/web/index.html
index e797e8f..053fc37 100644
--- a/web/index.html
+++ b/web/index.html
@@ -35,6 +35,8 @@
     <h3>What you still have</h3>
     <table class="pool num" id="pool"></table>
     <p class="thin" id="thin"></p>
+    <h3 class="outlook-h" id="outlookHead">Fearless outlook</h3>
+    <div class="outlook num" id="outlook"></div>
     <h3 style="margin-top:12px" id="recapHead"></h3>
     <ul class="g1 num" id="recap"></ul>
     <p class="used-h" id="usedHead">Locked for the series</p>
diff --git a/web/app.js b/web/app.js
index 8880ac2..9b10e96 100644
--- a/web/app.js
+++ b/web/app.js
@@ -106,6 +106,7 @@
     $('pool').innerHTML = m.pool.map(r => `<tr><td>${r.role}</td><td><div class="row3">${
       r.champs.map(([c, rec]) => `<span class="ch" data-champ="${esc(c)}"><b>${esc(c)}</b> <i>${rec}</i></span>`).join('')}</div></td></tr>`).join('');
     $('thin').textContent = m.thin;
+    outlook(N, done);
     recap(us, op, last, N);
 
     $('draftTitle').textContent = `Draft plan for game ${N}`;
@@ -134,6 +135,20 @@
     $('src').textContent = `Official GRID data, ${D.season}. ${us.name} ${us.n} games, ${op.name} ${op.n} games.` + (real ? ` Game 1 from the ${real.date} series.` : '');
   }
 
+  // fearless outlook: one dot per proven champion still open after this game's picks, hollow if the plan uses it
+  function outlook(N, done) {
+    $('outlookHead').style.display = $('outlook').style.display = done ? 'none' : '';
+    if (done) { $('outlook').innerHTML = ''; return; }
+    const from = N + 1, games = from === S.fmt ? `game ${from}` : `games ${from}-${S.fmt}`;
+    $('outlook').innerHTML = P.outlook(D, S.us, locked(), m.steps.us_pick).map(r => {
+      const dots = r.open.map(c => `<i class="dot" title="${esc(c)}"></i>`).join('') +
+        r.planned.map(c => `<i class="dot plan" title="${esc(c)}, in this game's plan"></i>`).join('');
+      const warn = r.open.length <= 2 && from <= S.fmt ? `<span class="warn">${r.open.length} left for ${games}</span>` : '';
+      return `<div class="orow"><span class="role">${P.ROLE_NAME[r.role]}</span><span class="dots" role="img" aria-label="${r.open.length} proven open, ${r.planned.length} planned">${dots}</span>` +
+        `<b>${r.open.length}</b>${warn}</div>`;
+    }).join('');
+  }
+
   function recap(us, op, last, N) {
     const name = id => (id === S.us ? us.tag : op.tag);
     if (!last) {
@@ -154,7 +169,7 @@
     const usedUs = S.games.flatMap(g => g.picks.us), usedThem = S.games.flatMap(g => g.picks.them);
     $('usedHead').style.display = S.games.length ? '' : 'none';
     $('used').innerHTML = S.games.length ? [[us.tag, 'us', usedUs], [op.tag, 'them', usedThem]].map(([t, c, xs]) =>
-      `<div class="used"><span class="t ${c}">${esc(t)}</span>${xs.map(x => `<span>${esc(x)}</span>`).join('')}</div>`).join('') : '';
+      `<div class="used" title="${esc(xs.join(', '))}"><span class="t ${c}">${esc(t)}</span>${xs.map(x => `<span>${esc(x)}</span>`).join('')}</div>`).join('') : '';
   }
 
   // Summoner's Rift as plain shapes (no game art). Game units 0..15000, y up.
diff --git a/web/style.css b/web/style.css
index 1036bbf..ffc67ce 100644
--- a/web/style.css
+++ b/web/style.css
@@ -75,6 +75,14 @@
   .used .t { background: none; padding-left: 0; min-width: 34px; font-weight: 600; }
   .used .t.us { color: var(--c9); } .used .t.them { color: var(--tl); }
   .thin { margin-top: 8px; font-size: 13.5px; color: var(--ban); }
+  .outlook-h { margin-top: 10px; margin-bottom: 4px; }
+  .orow { display: flex; align-items: center; gap: 6px; font-size: 13px; padding: 2px 0; border-top: 1px solid var(--rule); }
+  .orow .role { width: 58px; flex: none; color: var(--pencil); }
+  .orow .dots { display: flex; gap: 3px; flex: none; min-width: 86px; }
+  .orow .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--c9); border: 1.5px solid var(--c9); }
+  .orow .dot.plan { background: transparent; }
+  .orow b { font-weight: 600; width: 12px; }
+  .orow .warn { color: var(--ban); font-size: 12.5px; white-space: nowrap; margin-left: auto; }
 
   /* liquid habits */
   .habit { padding: 6px 0; border-top: 1px solid var(--rule); font-size: 14.5px; }
@@ -197,6 +205,24 @@
     .used { font-size: 12px; } .used span { padding: 0 5px; }
     .used-h { margin: 4px 0 3px; }
     .thin { font-size: 12.5px; margin-top: 4px; }
+    .outlook-h { margin-top: 5px !important; margin-bottom: 2px; font-size: 15px; }
+    .orow { padding: 0; font-size: 12.5px; line-height: 1.3; }
+    .orow .dot { width: 8px; height: 8px; }
+    .outlook-h { font-size: 14px; }
+    .used { flex-wrap: nowrap; overflow: hidden; margin-bottom: 2px; -webkit-mask-image: linear-gradient(90deg, #000 92%, transparent); mask-image: linear-gradient(90deg, #000 92%, transparent); }
+    .used span { flex: none; }
+    .pool td { padding: 1px 0; }
+    .sheet h3 { margin-bottom: 4px; }
+    .board { grid-template-columns: minmax(300px, 30%) minmax(0, 1fr) minmax(260px, 22%); }
+    body { padding-top: 8px; padding-bottom: 6px; }
+    .top .game { margin-top: 2px; }
+    .plan h2 { padding-top: 6px; font-size: 13px; }
+    .plan-line .say { font-size: 24px; }
+    .plan-line { padding: 2px 24px; }
+    .plan button { padding: 10px 22px; font-size: 17px; }
+    .plan .go { gap: 6px; }
+    .plan { padding-bottom: 6px; margin-bottom: 8px; }
+    .src { margin-top: 3px; line-height: 1.2; }
     .ctrl { margin-top: 4px; } .ctrl button { padding: 2px 8px; }
   }
   @media (prefers-reduced-motion: reduce) {
```

```text
The command truncated the end of web/style.css to remove a trailing block of styles, then displayed the tail of that file and the git diffs for the HTML, JavaScript, and CSS files, which completed with exit code 0.
```

### Ran cd ~/workplace/draftroom; sed -i 's/@media (max-height: 740px)/@media (max-height: 820px)/' web/style.css; python tests/fit.py 2>&1 | tail -20

```text
SCROLLS 1366x680 vs TL game 2: 1366x700
SCROLLS 1366x680 vs FLY game 2: 1366x700
SCROLLS 1366x680 vs LYON game 2: 1366x700
SCROLLS 1366x680 vs SEN game 2: 1366x700
SCROLLS 1366x680 vs SR game 2: 1366x700
SCROLLS 1366x680 vs DIG game 2: 1366x700
1366 680 errors []
1440 800 errors []
SCROLLS 1920x960 vs TL game 2: 1920x962
SCROLLS 1920x960 vs SR game 2: 1920x966
1920 960 errors []
8 cases scroll
```

```text
The style.css media query threshold was changed from 740px to 820px and the fit test was run, which finished with exit code 0 and reported no errors across the tested resolutions (1366x680, 1440x800, and 1920x960).
```

## Thinking

I reverted the move so the used chips stay in the left panel, and widening the compact layout to 820px fixed the 1440x800 and game 1 cases, but 8 cases still scroll. Next I'm shortening each recap fact to one line in app.js.

### Ran cd ~/workplace/draftroom; python - <<'EOF' p='web/app.js' s=open(p).read() a=s.index("        if (r.first_scuttle)") b=s.index("      } else f.push(`Entered by hand") new='''        if (r.first_scuttle) f.push(`Scuttle: <b>${esc(r.first_scuttle.who)}</b> (${name(r.first_scuttle.team)}), ${r.first_scuttle.side}, ${P.mmss(r.first_scuttle.sec)}`);         if (r.first_blood) f.push(`First blood: <b>${esc(r.first_blood.killer)}</b> (${name(r.first_blood.team)}), ${r.first_blood.zone}, ${P.mmss(r.first_blood.sec)}`);         if (r.first_dragon) f.push(`First dragon: ${r.first_dragon.team === S.us ? us.tag : op.tag}, ${P.mmss(r.first_dragon.sec)}`);         if (r.gold) f.push(`Final gold: ${op.tag} ${(r.gold[S.them] / 1000).toFixed(1)}k, ${us.tag} ${(r.gold[S.us] / 1000).toFixed(1)}k`); ''' s=s[:a]+new+s[b:] open(p,'w').write(s) EOF grep -n "recap\b\|g1" web/style.css | head; python tests/fit.py 2>&1 | tail -12

```text
70:  .g1 { list-style: none; font-size: 13.5px; }
71:  .g1 li { padding: 3px 0; }
203:    .g1 { font-size: 12.5px; } .g1 li { padding: 1px 0; }
SCROLLS 1366x680 vs TL game 2: 1366x700
SCROLLS 1366x680 vs FLY game 2: 1366x700
SCROLLS 1366x680 vs LYON game 2: 1366x700
SCROLLS 1366x680 vs SEN game 2: 1366x700
SCROLLS 1366x680 vs SR game 2: 1366x700
SCROLLS 1366x680 vs DIG game 2: 1366x700
1366 680 errors []
1440 800 errors []
SCROLLS 1920x960 vs SR game 2: 1920x966
1920 960 errors []
7 cases scroll
```

```text
The web app recap section was rewritten, and the test script finished with 7 scroll cases and no errors.
```

### Ran cd ~/workplace/draftroom; python - <<'EOF' import re,os p=os.environ['JUNIE_TMPDIR']+'/m.py' s=open(p).read() s=s.replace("strip:document.querySelector('.strip2').offsetHeight","kids:[...document.querySelector('.board>.sheet').children].map(e=>e.id+':'+e.offsetHeight)") s=s.replace("[(1366,680),(1440,800),(1920,960)]","[(1366,680),(1920,960)]") open(p,'w').write(s) EOF python $JUNIE_TMPDIR/m.py | grep -v " DIG "

```text
1366 680 TL 1 {'doc': 680, 'top': 50, 'plan': 139, 'board': 393, 'panels': [[357, 355], [384, 382], [393, 391]], 'kids': [':19', 'pool:109', 'thin:18', 'outlookHead:17', 'outlook:86', 'recapHead:19', 'recap:40', 'usedHead:0', 'used:0']}
1366 680 TL 2 {'doc': 700, 'top': 50, 'plan': 139, 'board': 462, 'panels': [[462, 460], [403, 401], [393, 391]], 'kids': [':19', 'pool:109', 'thin:18', 'outlookHead:17', 'outlook:86', 'recapHead:19', 'recap:81', 'usedHead:18', 'used:37']}
1920 960 TL 1 {'doc': 960, 'top': 50, 'plan': 177, 'board': 482, 'panels': [[481, 479], [453, 451], [482, 480]], 'kids': [':19', 'pool:139', 'thin:20', 'outlookHead:19', 'outlook:141', 'recapHead:19', 'recap:44', 'usedHead:0', 'used:0']}
1920 960 TL 2 {'doc': 960, 'top': 50, 'plan': 177, 'board': 637, 'panels': [[637, 635], [453, 451], [482, 480]], 'kids': [':19', 'pool:139', 'thin:39', 'outlookHead:19', 'outlook:141', 'recapHead:19', 'recap:102', 'usedHead:18', 'used:44']}
```

```text
The script ran successfully and showed the board height rising from 393 to 462 pixels at 1366x680 and from 482 to 637 pixels at 1920x960 in the second state.
```

### Ran cd ~/workplace/draftroom; sed -i 's/@media (max-height: 820px)/@media (max-height: 980px)/' web/style.css python - <<'EOF' p='web/style.css' s=open(p).read() old="    .ctrl { margin-top: 4px; } .ctrl button { padding: 2px 8px; }\n  }" new="""    .ctrl { margin-top: 4px; } .ctrl button { padding: 2px 8px; }     .g1 { line-height: 1.25; }     .g1 li { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }     .sheet h3#recapHead { margin-top: 3px !important; margin-bottom: 2px; }     .used-h { margin: 3px 0 2px; }   }""" assert old in s open(p,'w').write(s.replace(old,new)) EOF python tests/fit.py 2>&1 | tail -12; python $JUNIE_TMPDIR/m.py | grep -v " DIG "

```text
SCROLLS 1366x680 vs TL game 2: 1366x683
SCROLLS 1366x680 vs FLY game 2: 1366x683
SCROLLS 1366x680 vs LYON game 2: 1366x683
SCROLLS 1366x680 vs SEN game 2: 1366x683
SCROLLS 1366x680 vs SR game 2: 1366x683
SCROLLS 1366x680 vs DIG game 2: 1366x683
1366 680 errors []
1440 800 errors []
1920 960 errors []
6 cases scroll
1366 680 TL 1 {'doc': 680, 'top': 50, 'plan': 139, 'board': 393, 'panels': [[331, 329], [384, 382], [393, 391]], 'kids': [':19', 'pool:109', 'thin:18', 'outlookHead:17', 'outlook:86', 'recapHead:19', 'recap:18', 'usedHead:0', 'used:0']}
1366 680 TL 2 {'doc': 683, 'top': 50, 'plan': 139, 'board': 445, 'panels': [[445, 443], [403, 401], [393, 391]], 'kids': [':19', 'pool:109', 'thin:18', 'outlookHead:17', 'outlook:86', 'recapHead:19', 'recap:71', 'usedHead:18', 'used:37']}
1920 960 TL 1 {'doc': 960, 'top': 50, 'plan': 139, 'board': 384, 'panels': [[331, 329], [384, 382], [374, 372]], 'kids': [':19', 'pool:109', 'thin:18', 'outlookHead:17', 'outlook:86', 'recapHead:19', 'recap:18', 'usedHead:0', 'used:0']}
1920 960 TL 2 {'doc': 960, 'top': 50, 'plan': 139, 'board': 445, 'panels': [[445, 443], [387, 385], [374, 372]], 'kids': [':19', 'pool:109', 'thin:18', 'outlookHead:17', 'outlook:86', 'recapHead:19', 'recap:71', 'usedHead:18', 'used:37']}
```

```text
The CSS layout was adjusted for smaller screens and the fit test ran, with all three viewport sizes reporting no errors, though the 1366x680 scroll checks show document heights of 683 pixels in game 2, slightly exceeding the 680 viewport.
```

## Thinking

I found that compacting the layout brought every case except 1366x680 game 2 within bounds, leaving that one only 3px over. I'm now trimming the recap row padding and line-height slightly, then rerunning both test suites.

### Ran cd ~/workplace/draftroom; sed -i 's/    .g1 { line-height: 1.25; }/    .g1 { line-height: 1.2; }\n    .g1 li { padding: 0; }/' web/style.css; python tests/fit.py 2>&1 | tail -6; node tests/planner.test.js 2>&1 | tail -4; git status --short

```text
1366 680 errors []
1440 800 errors []
1920 960 errors []
all fit
ok: 360 plans across 9 teams
 M tests/planner.test.js
 M web/app.js
 M web/index.html
 M web/planner.js
 M web/style.css
?? tests/fit.py
```

```text
The style update was applied, and the fit check reported no errors at three screen sizes while the planner test passed 360 plans across 9 teams.
```
