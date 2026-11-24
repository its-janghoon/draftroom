# Session transcript

### Ran cd ~/workplace/draftroom; cat .junie/guidelines.md; cat docs/backtest.md; ls -la . web tests pipeline cache docs; git status --short | head; wc -l web/planner.js tests/*.js pipeline/*.py

````text
# Draft Room guidelines for Junie

- The app is plain HTML, CSS and JavaScript in `web/`. No frameworks, no build step, no new dependencies.
- `web/planner.js` holds the plan rules and must keep running in Node (`node tests/planner.test.js`).
- Every number shown to a coach comes from `web/data.js`. Never invent a number.
- Never commit GRID data or anything built from it: `web/data.js`, `cache/`, `*.zst`, `*.jsonl`.
- Match the existing look in `web/style.css`: paper background, Barlow and Barlow Condensed, Cloud9 blue for us, navy for the opponent, red only for bans.
- Every button needs a visible `:focus-visible` style.
- The whole app must fit one screen at 1366x680 with no scrolling.
# Backtest

If a coach had used the planner before each real LCS 2026 game, how often would its prediction of the opponent's picks have been right?

- **Date range:** 2026-02-22 to 2026-10-12
- **Games:** 141 (of 225 LCS games since 2026-01-01; left out: 71 for a team with under 10 prior games, 11 for incomplete draft, 2 for side unknown)
- **Runs:** 282 (every game is planned twice, once with each team as "us")

## Method

- Each team's profile uses only LCS games dated before the series' scheduled date, and player roles are voted from those same games. A game is skipped if either team has fewer than 10 prior games.
- Champions picked in earlier games of the same series are locked (fearless).
- From each run, the 3 champions in `steps.them_pick` are the predicted opponent picks, scored against the opponent's real 5 picks in that game.
- The baseline ignores the draft logic: the opponent's 3 most-played champions this season that are not locked.
- Head-to-head history is left out of the planner input, because it would include this series or later ones.

## Results

| Measure | Planner | Baseline (3 most played, not locked) |
|---|---|---|
| Hit rate (at least 1 of 3 predicted picks really picked) | 33.7% (95/282) | 35.8% (101/282) |
| Precision (predicted picks really picked) | 12.4% (105/846) | 13.8% (117/846) |

Planned bans (our 3) that the opponent picked or banned themselves in that game: **27.1% (229/846)**.

Planner hit where the baseline missed: 42 runs. Baseline hit where the planner missed: 48 runs.

## What this means

In 282 runs the planner named at least one champion the opponent really picked 33.7% of the time, and 12.4% of its individual predictions were right. The baseline scores 35.8% and 13.8%. The planner loses to the naive baseline on both measures. Its draft logic (first-pick habit, one pick per role, leaving out champions already named in the plan) did not predict the opponent better than simply listing what they play most. Head to head, the planner hit where the baseline missed in 42 runs and the baseline hit where the planner missed in 48. 27.1% of our planned bans were champions the opponent picked or banned themselves in that game; 72.9% were champions the opponent neither picked nor banned. This shows whether the bans aimed at champions that mattered to them, not that they were good bans. What the numbers do not mean: the real teams ban too, so a correct prediction can be banned away before it is ever picked, and a miss can be a champion that was banned rather than a bad read. The planner only predicts three picks while a team picks five, so precision cannot reach 100% and is not comparable to a full-draft forecast. The score says nothing about whether our own picks or bans would have won games, and 282 runs from one season is a small sample, so differences of a few points are within noise. Early cases rest on only 10 to a few dozen prior games per team.

Rerun it:

```bash
python pipeline/backtest.py --data ../stl-hackathon-2026-grid-starter
node tests/backtest.js
```
.:
total 60
drwxr-xr-x  9 ubuntu ubuntu  4096 Nov 24 08:18 .
drwxr-xr-x 49 ubuntu ubuntu 12288 Nov 24 08:16 ..
drwxr-xr-x  7 ubuntu ubuntu  4096 Nov 24 08:19 .git
-rw-r--r--  1 ubuntu ubuntu   201 Nov 23 14:17 .gitignore
drwxr-xr-x  3 ubuntu ubuntu  4096 Nov 24 07:50 .junie
-rw-r--r--  1 ubuntu ubuntu  1069 Nov 23 14:17 LICENSE
-rw-r--r--  1 ubuntu ubuntu  5172 Nov 24 08:18 README.md
drwxr-xr-x  2 ubuntu ubuntu  4096 Nov 24 08:17 cache
drwxr-xr-x  2 ubuntu ubuntu  4096 Nov 24 08:18 docs
drwxr-xr-x  3 ubuntu ubuntu  4096 Nov 24 08:17 pipeline
drwxr-xr-x  2 ubuntu ubuntu  4096 Nov 24 08:18 tests
drwxr-xr-x  2 ubuntu ubuntu  4096 Nov 24 08:15 web

cache:
total 4844
drwxr-xr-x 2 ubuntu ubuntu    4096 Nov 24 08:17 .
drwxr-xr-x 9 ubuntu ubuntu    4096 Nov 24 08:18 ..
-rw-r--r-- 1 ubuntu ubuntu 1284119 Nov 24 08:17 backtest-cases.json
-rw-r--r-- 1 ubuntu ubuntu 3662372 Nov 23 14:10 games.json

docs:
total 12
drwxr-xr-x 2 ubuntu ubuntu 4096 Nov 24 08:18 .
drwxr-xr-x 9 ubuntu ubuntu 4096 Nov 24 08:18 ..
-rw-r--r-- 1 ubuntu ubuntu 3052 Nov 24 08:18 backtest.md

pipeline:
total 36
drwxr-xr-x 3 ubuntu ubuntu 4096 Nov 24 08:17 .
drwxr-xr-x 9 ubuntu ubuntu 4096 Nov 24 08:18 ..
drwxr-xr-x 2 ubuntu ubuntu 4096 Nov 24 08:17 __pycache__
-rw-r--r-- 1 ubuntu ubuntu 4340 Nov 24 08:17 backtest.py
-rw-r--r-- 1 ubuntu ubuntu 7422 Nov 24 08:16 build.py
-rw-r--r-- 1 ubuntu ubuntu 6004 Nov 23 14:08 extract.py

tests:
total 24
drwxr-xr-x 2 ubuntu ubuntu 4096 Nov 24 08:18 .
drwxr-xr-x 9 ubuntu ubuntu 4096 Nov 24 08:18 ..
-rw-r--r-- 1 ubuntu ubuntu 7962 Nov 24 08:18 backtest.js
-rw-r--r-- 1 ubuntu ubuntu 2142 Nov 24 08:09 fit.py
-rw-r--r-- 1 ubuntu ubuntu 1959 Nov 24 08:09 planner.test.js

web:
total 244
drwxr-xr-x 2 ubuntu ubuntu   4096 Nov 24 08:15 .
drwxr-xr-x 9 ubuntu ubuntu   4096 Nov 24 08:18 ..
-rw-r--r-- 1 ubuntu ubuntu  22675 Nov 24 08:15 app.js
-rw-r--r-- 1 ubuntu ubuntu 169052 Nov 24 08:16 data.js
-rw-r--r-- 1 ubuntu ubuntu   5055 Nov 24 08:15 index.html
-rw-r--r-- 1 ubuntu ubuntu  10112 Nov 24 08:09 planner.js
-rw-r--r-- 1 ubuntu ubuntu  22813 Nov 24 08:15 style.css
  157 web/planner.js
  137 tests/backtest.js
   32 tests/planner.test.js
  100 pipeline/backtest.py
  157 pipeline/build.py
  123 pipeline/extract.py
  706 total
````

```text
The bash command read the project guidelines and backtest documentation, listed directory contents, checked git status, and counted lines in several files, and it completed successfully with exit code 0.
```

### Read pipeline/build.py

### Read pipeline/backtest.py

### Read web/planner.js

### Read tests/backtest.js

### Ran cd ~/workplace/draftroom; cat tests/fit.py tests/planner.test.js; cat .gitignore; ls ..; git log --oneline | head; grep -n "them_pick\|Planner\." web/app.js | head -20; python3 -c " import json;G=json.load(open('cache/games.json'));print(G[0].keys(), G[0]['date'], G[0]['draft'][:3])"

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
// Checks the planner on every team pair and through a full fearless Bo5:
// no crash, no champion planned twice, nothing planned that fearless has locked.
// Run: node tests/planner.test.js   (needs web/data.js from pipeline/build.py)
const fs = require('fs'), path = require('path'), assert = require('assert');
const src = fs.readFileSync(path.join(__dirname, '..', 'web', 'data.js'), 'utf8');
const window = {};
new Function('window', src)(window);
const D = window.DRAFTROOM;
const { plan, outlook } = require('../web/planner.js');

let checked = 0;
for (const us of Object.keys(D.teams)) for (const them of Object.keys(D.teams)) {
  if (us === them) continue;
  const locked = [];
  for (let game = 1; game <= 5; game++) {
    const p = plan(D, us, them, locked, game % 2 === 1);
    const named = [...p.steps.us_ban, ...p.steps.them_ban, ...p.steps.us_pick, ...p.steps.them_pick].map(s => s.champ);
    assert.strictEqual(new Set(named).size, named.length, `${us} vs ${them} game ${game}: a champion is planned twice`);
    for (const c of named) assert(!locked.includes(c), `${us} vs ${them} game ${game}: ${c} is locked by fearless`);
    assert(p.plan.line3 && p.plan.ban_why, `${us} vs ${them} game ${game}: empty plan line`);
    const ol = outlook(D, us, locked, p.steps.us_pick);
    assert.strictEqual(ol.length, 5, `${us} vs ${them} game ${game}: outlook needs one row per role`);
    for (const r of ol) {
      for (const c of [...r.open, ...r.planned]) assert(!locked.includes(c), `${us} game ${game}: outlook lists locked ${c}`);
      for (const c of r.open) assert(!r.planned.includes(c), `${us} game ${game}: ${c} is both open and planned`);
    }
    // play the game as planned, plus the next champions in each pool, then lock all of it
    locked.push(...p.steps.us_pick.map(s => s.champ), ...p.steps.them_pick.map(s => s.champ));
    checked++;
  }
}
console.log(`ok: ${checked} plans across ${Object.keys(D.teams).length} teams`);
# Sky's The Limit 2026 hackathon data: licensed, must not be committed
stl-hackathon-2026-grid-starter/
*.zst
*.jsonl
*.parquet
*.sqlite
*.duckdb
# built from that data
cache/
web/data.js
__pycache__/
draftroom
stl-hackathon-2026-grid-starter
579300f Add time-split backtest of the opponent-pick prediction (built with Junie CLI)
9124212 Add print sheet and keyboard shortcuts (built with Junie CLI) (#3)
64300a5 Add Fearless outlook and one-screen fit check (built with Junie CLI) (#2)
68a330d Add Copy plan button (built with Junie CLI) (#1)
a853346 Draft Room: fearless draft planner for LoL coaches
121:    $('themPick').innerHTML = st.them_pick.map(s => slot(s, 'r them-pick guess')).join('');
224:    $('dlgThemPicks').innerHTML = field('them', pre(m.steps.them_pick));
dict_keys(['series_id', 'event', 'date', 'game_id', 'draft', 'start_items', 'lane', 'first_scuttle', 'first_grub', 'first_blood', 'first_dragon', 'winner', 'length', 'gold']) 2025-01-15 [[1, 'ban', '52817', 'Ashe'], [2, 'ban', '47961', 'Kalista'], [3, 'ban', '52817', 'Varus']]
```

```text
The command ran successfully and printed the contents of the fit check and planner test files, the git ignore rules, recent commit history, matches for opponent-pick references in the app, and the structure of the first game record in the cached games data.
```

## Thinking

I'm going to add a `recent` count of each champion's appearances in the last 10 games, using a fixed RECENT=10 constant in build.py, and sort games by date in backtest.py first so the counts line up.

### Ran cd ~/workplace/draftroom; python3 - <<'E' import re s=open('pipeline/build.py').read() s=s.replace("""ROLES = ['top', 'jungle', 'mid', 'adc', 'support'] ""","""ROLES = ['top', 'jungle', 'mid', 'adc', 'support'] RECENT = 10   # "recent" means a team's last 10 games before the cutoff """,1) s=s.replace("""def build_profiles(games, roster, main_role, names, min_games=10):     \"\"\"One profile per team that has at least min_games of the given games.\"\"\"     by_team = collections.defaultdict(list)     for g in games:         for t in dict.fromkeys(d[2] for d in g['draft']):             by_team[t].append(g) ""","""def build_profiles(games, roster, main_role, names, min_games=10, recent=RECENT):     \"\"\"One profile per team that has at least min_games of the given games.     'recent' counts, per champion, the games it was played in the team's last `recent` games.\"\"\"     by_team = collections.defaultdict(list)     for g in sorted(games, key=lambda g: g['date']):   # stable: oldest first         for t in dict.fromkeys(d[2] for d in g['draft']):             by_team[t].append(g) """,1) s=s.replace("""        for g in tg:             won = g['winner'] == tid""","""        last = collections.Counter()         for g in tg[-recent:]:             for r in roster.get(g['game_id'], []):                 if r['team_id'] == tid and main_role.get(r['player_id']):                     last[r['character_name']] += 1         for g in tg:             won = g['winner'] == tid""",1) s=s.replace("""'n': len(tg), ""","""'n': len(tg),             'recent': dict(last), 'recent_n': min(recent, len(tg)), """,1) open('pipeline/build.py','w').write(s) E git diff --stat; ls ../stl-hackathon-2026-grid-starter | head

```text
 pipeline/build.py | 14 +++++++++++---
 1 file changed, 11 insertions(+), 3 deletions(-)
AGENTS.md
LICENSE.md
README.md
lol
meta
val
val-ability-supplements
```

```text
The build script was edited to add a recent-games option to team profiles, and the change applied to one file with 11 insertions and 3 deletions.
```

### Ran cd ~/workplace/draftroom; python3 pipeline/build.py --data ../stl-hackathon-2026-grid-starter && python3 pipeline/backtest.py --data ../stl-hackathon-2026-grid-starter && node -e " const {cases}=JSON.parse(require('fs').readFileSync('cache/backtest-cases.json')); console.log(cases.filter(c=>c.date<'2026-07-01').length, cases.filter(c=>c.date>='2026-07-01').length); const p=Object.values(cases[0].profiles)[0];console.log(p.recent_n,Object.keys(p.recent).length)"

```text
9 teams, 70 series -> web/data.js (168 KB)
141 cases of 225 LCS games since 2026-01-01 -> cache/backtest-cases.json (1386 KB)
  skipped 71: a team with under 10 prior games
  skipped 11: incomplete draft
  skipped 2: side unknown
106 35
10 28
```

```text
The build and backtest scripts ran successfully, producing the web data and 141 backtest cases from 225 LCS games since 2026-01-01, with 106 cases before July 2026 and 35 on or after it.
```

## Thinking

I added a per-champion recent-count field to the profile build and set up the predictor in planner.js with tunable weights for season, recent, first-pick, win-rate, and ban signals. Next I'll regenerate the cases and data, then tune the weights on the TUNE split only, testing win-rate as a plain blend term versus multiplied by play rate and a per-role cap of one, two, or none.

### Ran cd ~/workplace/draftroom; python3 - <<'E' s=open('web/planner.js').read() a=s.index("    // 4. their picks") b=s.index("    const backups") new="""    // 4. their picks: the open champions they are most likely to play (see predictPicks)     const tp = predictPicks(op, taken);     tp.forEach(c => taken.add(c.ch)); """ s=s[:a]+new+s[b:] fn="""  // How the opponent's picks are predicted. Each open champion gets a score from four   // shares of the opponent's own record; higher is likelier. Weights were chosen on the   // TUNE games of the backtest only (see docs/backtest.md).   const WEIGHTS = { season: 1, recent: 1, first: 1, win: 0, ban: 0, perRole: 5, minGames: 1 };    function predictPicks(p, taken, W) {     W = Object.assign({}, WEIGHTS, W);     const rec = {};     for (const ro of ROLES)       for (const [ch, r] of Object.entries(p.pool[ro] || {})) {         const x = rec[ch] || (rec[ch] = { ch, ro, g: 0, w: 0, best: 0 });         x.g += r[0]; x.w += r[1];         if (r[0] > x.best) { x.best = r[0]; x.ro = ro; }       }     const rn = p.recent_n || 0, last = p.recent || {};     const out = Object.values(rec).filter(x => !taken.has(x.ch) && x.g >= W.minGames).map(x => {       const fp = (p.first_pick || {})[x.ch] || 0, rc = last[x.ch] || 0;       const winRate = (x.w + 2) / (x.g + 4);       const score = W.season * x.g / p.n + W.recent * (rn ? rc / rn : 0) + W.first * fp / p.n +         W.win * winRate * x.g / p.n - W.ban * ((p.bans || {})[x.ch] || 0) / p.n;       return Object.assign(x, { score, rc, rn, fp });     }).sort((a, b) => b.score - a.score || b.g - a.g || (a.ch < b.ch ? -1 : 1));     const picked = [], used = {};     for (const x of out) {       if (picked.length === 3) break;       if ((used[x.ro] || 0) >= W.perRole) continue;       picked.push(x); used[x.ro] = (used[x.ro] || 0) + 1;     }     return picked;   }  """ s=s.replace("  function plan(D,",fn+"  function plan(D,",1) s=s.replace("const api = { plan, outlook,","const api = { plan, outlook, predictPicks, WEIGHTS,") open('web/planner.js','w').write(s) E sed -n 125,140p web/planner.js | grep -n "them_pick"

```text
15:        them_pick: step(tp.map(c => ({ champ: c.ch, rec: wl(op.pool[c.ro][c.ch]), role: c.ro,
```

```text
The script replaced the opponent pick-prediction logic in the planner with a new scoring-based predictPicks function and exported it, and the final grep check confirmed the updated them_pick reference exists.
```

### Ran cd ~/workplace/draftroom; cat > $JUNIE_TMPDIR/tune.js <<'E' // TUNE ONLY: cases dated before 2026-07-01 const fs=require('fs'); const P=require('~/workplace/draftroom/web/planner.js'); const {cases:all}=JSON.parse(fs.readFileSync('~/workplace/draftroom/cache/backtest-cases.json')); const cases=all.filter(c=>c.date<'2026-07-01'); function baseline(p,locked){const m={};for(const r of Object.values(p.pool))for(const [c,x] of Object.entries(r))m[c]=(m[c]||0)+x[0];  return Object.entries(m).filter(([c])=>!locked.includes(c)).sort((a,b)=>b[1]-a[1]||(a[0]<b[0]?-1:1)).slice(0,3).map(x=>x[0]);} function run(W,useBase){Object.assign(P.WEIGHTS,W);let hit=0,cor=0,n=0,pred=0;  for(const c of cases){const D={teams:c.profiles,series:[]};for(const us of c.teams){const them=c.teams.find(t=>t!==us);   const pr=useBase?baseline(c.profiles[them],c.locked):P.plan(D,us,them,c.locked,c.blue===us).steps.them_pick.map(s=>s.champ);   const k=pr.filter(x=>c.actual[them].picks.includes(x)).length;n++;hit+=k>0;cor+=k;pred+=pr.length;}}  return {hit:+(100*hit/n).toFixed(1),prec:+(100*cor/pred).toFixed(1),n};} module.exports={run,P}; if(require.main===module){  console.log('baseline',run({},true));  const base={season:0,recent:0,first:0,win:0,ban:0,perRole:5,minGames:1};  const res=[];  for(const season of [0,1])for(const recent of [0,0.5,1,2])for(const first of [0,0.5,1,2])for(const win of [0,1])for(const ban of [0,0.5,1])for(const perRole of [1,2,5]){   if(!season&&!recent&&!first&&!win)continue;   const W={...base,season,recent,first,win,ban,perRole};const r=run(W);res.push({W:JSON.stringify([season,recent,first,win,ban,perRole]),...r});}  res.sort((a,b)=>b.prec+b.hit-a.prec-a.hit);  console.log('season,recent,first,win,ban,perRole');  res.slice(0,15).forEach(r=>console.log(r.W,r.hit,r.prec));  console.log('...worst');res.slice(-3).forEach(r=>console.log(r.W,r.hit,r.prec)); } E node $JUNIE_TMPDIR/tune.js

```text
baseline { hit: 39.2, prec: 15.3, n: 212 }
season,recent,first,win,ban,perRole
[1,2,1,1,0,1] 43.9 17.3
[1,1,0.5,1,0,1] 43.4 17.3
[0,1,1,1,0,1] 42.9 17.6
[1,0.5,1,1,0,2] 43.4 17
[1,1,1,0,0,1] 43.4 17
[1,0.5,1,1,0,1] 43.4 16.8
[1,2,0,0,0.5,5] 43.4 16.7
[1,2,0,0,0.5,2] 43.4 16.7
[1,1,0,0,0.5,2] 43.4 16.7
[1,1,0,0,0.5,5] 43.4 16.5
[1,1,0.5,0,0,1] 42.9 17
[1,2,0.5,1,0,1] 42.9 17
[1,2,2,1,0,1] 42.9 17
[1,0.5,1,0,0,2] 43.4 16.4
[1,0.5,1,1,0,5] 42.9 16.8
...worst
[0,0,0,1,1,5] 29.7 11
[0,0,0,1,1,1] 28.3 10.5
[0,0,0,1,0.5,1] 27.8 10.5
```

```text
A tuning script on pre-July 2026 cases compared the planner against a baseline, which scored 39.2% hit rate and 15.3% precision, and the best weight configurations reached about 43.9% hit rate and 17.3% precision.
```

### Ran cd ~/workplace/draftroom; cat > $JUNIE_TMPDIR/t2.js <<'E' const {run}=require('./tune.js'); const b={season:1,recent:1,first:1,win:0,ban:0,perRole:5,minGames:1}; for(const [k,v] of [['perRole',1],['perRole',2],['perRole',5],['ban',0.5],['ban',1],['win',1],['minGames',2],['minGames',3]])  console.log(k,v,JSON.stringify(run({...b,[k]:v}))); console.log('no first',JSON.stringify(run({...b,first:0})),'no recent',JSON.stringify(run({...b,recent:0})),'no season',JSON.stringify(run({...b,season:0}))); E node $JUNIE_TMPDIR/t2.js # recent window N, rebuilt into scratch files (TUNE-only evaluation) for N in 5 15 20; do python3 - <<E import sys,json,collections,csv sys.path.insert(0,'pipeline') import build, backtest E done; grep -n "build_profiles(prior" pipeline/backtest.py

```text
perRole 1 {"hit":43.4,"prec":17,"n":212}
perRole 2 {"hit":42.9,"prec":16,"n":212}
perRole 5 {"hit":42.9,"prec":16,"n":212}
ban 0.5 {"hit":39.6,"prec":15.3,"n":212}
ban 1 {"hit":39.2,"prec":14.9,"n":212}
win 1 {"hit":41.5,"prec":16.2,"n":212}
minGames 2 {"hit":41.5,"prec":15.9,"n":212}
minGames 3 {"hit":36.8,"prec":15.9,"n":212}
no first {"hit":42,"prec":15.9,"n":212} no recent {"hit":38.7,"prec":14.6,"n":212} no season {"hit":40.6,"prec":15.6,"n":212}
57:            cutoff[date] = build_profiles(prior, roster, roles, names, args.min_games)
```

```text
The tuning script ran successfully across several parameter variations, showing hit rates between 36.8% and 43.4%, with the best result at perRole set to 1 and the worst at minGames set to 3.
```

## Thinking

I finished the grid search on the TUNE cases, found the baseline at 39.2% hit rate with many blends around 43%, and settled on one-per-role cap plus equal weights because the ban term hurt and the win-rate prior didn't help. Next I'm adding a `--recent` option to the backtest script so I can run a final check on the recent-window size.

### Ran cd ~/workplace/draftroom; python3 - <<'E' s=open('pipeline/backtest.py').read() s=s.replace("from build import build_profiles, vote_roles","from build import RECENT, build_profiles, vote_roles") s=s.replace("    ap.add_argument('--min-games', type=int, default=10)\n","    ap.add_argument('--min-games', type=int, default=10)\n    ap.add_argument('--recent', type=int, default=RECENT, help='size of the \"recent games\" window')\n") s=s.replace("names, args.min_games)","names, args.min_games, args.recent)") s=s.replace("'min_games': args.min_games,","'min_games': args.min_games, 'recent': args.recent,") open('pipeline/backtest.py','w').write(s) t=open(f'/tmp/junie-session-261124-081931-abng/tune.js').read() t=t.replace("'~/workplace/draftroom/cache/backtest-cases.json'","process.env.CASES||'~/workplace/draftroom/cache/backtest-cases.json'") open('/tmp/junie-session-261124-081931-abng/tune.js','w').write(t) E cat > $JUNIE_TMPDIR/t3.js <<'E' const {run}=require('./tune.js'); console.log(process.env.CASES, JSON.stringify(run({season:1,recent:1,first:1,win:0,ban:0,perRole:1,minGames:1}))); E for N in 5 8 10 15 20; do python3 pipeline/backtest.py --recent $N --out $JUNIE_TMPDIR/c$N.json >/dev/null && CASES=$JUNIE_TMPDIR/c$N.json node $JUNIE_TMPDIR/t3.js | sed "s|.*/c|N=|"; done for r in 0.5 2; do node -e " const {run}=require('$JUNIE_TMPDIR/tune.js');" ; done

```text
N=5.json {"hit":42.5,"prec":16.7,"n":212}
N=8.json {"hit":44.3,"prec":16.5,"n":212}
N=10.json {"hit":43.4,"prec":17,"n":212}
N=15.json {"hit":38.2,"prec":15.3,"n":212}
N=20.json {"hit":40.1,"prec":14.6,"n":212}
```

```text
The backtest was run with recent-window sizes of 5, 8, 10, 15, and 20, yielding hit rates from 38.2% to 44.3% and precision from 14.6% to 17%, with the best hit rate at a window size of 8.
```

### Ran cd ~/workplace/draftroom; python3 - <<'E' s=open('web/planner.js').read() a=s.index("  // How the opponent's picks") b=s.index("  function plan(D,") fn="""  // How the opponent's picks are predicted. Each open champion scores the sum of three   // shares of the opponent's own games: played this season, played in their last   // `recent_n` games, and opened with as their first pick. The top 3 are named, one per role.   // The weights were chosen on the TUNE games of the backtest only (see docs/backtest.md).   const WEIGHTS = { season: 1, recent: 1, first: 1, perRole: 1 };    function predictPicks(p, taken, W) {     W = Object.assign({}, WEIGHTS, W);     const rec = {};     for (const ro of ROLES)       for (const [ch, r] of Object.entries(p.pool[ro] || {})) {         const x = rec[ch] || (rec[ch] = { ch, ro, g: 0, w: 0, best: 0 });         x.g += r[0]; x.w += r[1];         if (r[0] > x.best) { x.best = r[0]; x.ro = ro; }       }     const rn = p.recent_n || 0, last = p.recent || {};     const out = Object.values(rec).filter(x => !taken.has(x.ch)).map(x => {       const fp = (p.first_pick || {})[x.ch] || 0, rc = last[x.ch] || 0;       const score = W.season * x.g / p.n + W.recent * (rn ? rc / rn : 0) + W.first * fp / p.n;       return Object.assign(x, { score, rc, rn, fp });     }).sort((a, b) => b.score - a.score || b.g - a.g || (a.ch < b.ch ? -1 : 1));     const picked = [], used = {};     for (const x of out) {       if (picked.length === 3) break;       if ((used[x.ro] || 0) >= W.perRole) continue;       picked.push(x); used[x.ro] = (used[x.ro] || 0) + 1;     }     return picked;   }  """ s=s[:a]+fn+s[b:] s=s.replace("""          why: (op.players[c.ro] || '') + (c.note ? ', ' + c.note : '') })), themSide, 'pick'),""","""          why: `${op.players[c.ro] || ROLE_NAME[c.ro]}, ` + (c.rn && c.rc ? `${c.rc} of last ${c.rn} games` : `${c.g} of ${op.n} games`) +             (c.fp ? `, first pick ${c.fp}x` : '') })), themSide, 'pick'),""") open('web/planner.js','w').write(s) E sed -i 's/win:0,ban:0,perRole:1,minGames:1/perRole:1/' $JUNIE_TMPDIR/t3.js node $JUNIE_TMPDIR/t3.js; grep -n "note\|byPlay" web/*.js | grep -v data.js; node -e " const fs=require('fs');const w={};new Function('window',fs.readFileSync('web/data.js','utf8'))(w);const P=require('./web/planner.js');const D=w.DRAFTROOM;const ids=Object.keys(D.teams); console.log(JSON.stringify(P.plan(D,ids[0],ids[1],[],true).steps.them_pick))"

```text
undefined {"hit":43.4,"prec":17,"n":212}
[{"champ":"Viktor","rec":"2-1","role":"mid","why":"AoJune, 3 of last 10 games, first pick 1x","step":8},{"champ":"Gnar","rec":"2-1","role":"top","why":"Crimson, 2 of last 10 games, first pick 1x","step":9},{"champ":"Lee Sin","rec":"0-3","role":"jungle","why":"Yuuji, 2 of last 10 games, first pick 1x","step":12}]
```

```text
The planner's opponent pick prediction was rewritten to score champions by season games, recent games, and first picks, and the test run completed with exit code 0 and an accuracy result of 43.4% hit rate over 212 games, with three predicted picks listed.
```

### Ran cd ~/workplace/draftroom; python3 - <<'E' s=open('tests/backtest.js').read() a=s.index("const tally") b=s.index("const rows = [") loop="""const SPLIT_DATE = '2026-07-01';   // TUNE = games before it (all design choices), TEST = games from it on (run once, at the end) const tally = () => ({ runs: 0, hit: 0, predicted: 0, correct: 0 }); const newSplit = () => ({ games: 0, model: tally(), naive: tally(), bans: { planned: 0, mattered: 0 }, onlyModel: 0, onlyNaive: 0 }); const splits = { TUNE: newSplit(), TEST: newSplit() }; let runs = 0; const failures = [];  function score(t, predicted, realPicks) {   const right = predicted.filter(c => realPicks.includes(c)).length;   t.runs++; t.hit += right > 0; t.predicted += predicted.length; t.correct += right;   return right > 0; }  for (const c of cases) {   const S = splits[c.date < SPLIT_DATE ? 'TUNE' : 'TEST'];   S.games++;   const D = { teams: c.profiles, series: [] };   // no head-to-head: it would be this series or later   for (const us of c.teams) {     const them = c.teams.find(t => t !== us);     let p;     try { p = plan(D, us, them, c.locked, c.blue === us); }     catch (e) { failures.push(`${c.game_id} (${us} vs ${them}): ${e.message}`); continue; }     const real = c.actual[them];     const predicted = p.steps.them_pick.map(s => s.champ);     const a = score(S.model, predicted, real.picks);     const b = score(S.naive, baseline(c.profiles[them], c.locked), real.picks);     S.onlyModel += a && !b; S.onlyNaive += b && !a;     const mattered = new Set([...real.picks, ...real.bans]);     for (const s of p.steps.us_ban) { S.bans.planned++; S.bans.mattered += mattered.has(s.champ); }     runs++;   } } if (failures.length) { console.error(`planner failed on ${failures.length} runs:\\n` + failures.join('\\n')); process.exit(1); }  const pct = (n, d) => (d ? (100 * n / d).toFixed(1) : '0.0') + '%'; const frac = (n, d) => `${n}/${d}`; const cell = (n, d) => `${pct(n, d)} (${frac(n, d)})`; const dates = cases.map(c => c.date).sort(); const range = `${dates[0]} to ${dates[dates.length - 1]}`; const rangeOf = f => { const d = cases.map(c => c.date).filter(f).sort(); return d.length ? `${d[0]} to ${d[d.length - 1]}` : 'no games'; }; const ranges = { TUNE: rangeOf(d => d < SPLIT_DATE), TEST: rangeOf(d => d >= SPLIT_DATE) }; const skipped = Object.entries(meta.skipped).map(([why, n]) => `${n} for ${why}`).join(', ');  const tableOf = S => [['Measure', 'Planner', 'Baseline (3 most played, not locked)'],   ['Hit rate (at least 1 of 3 predicted picks really picked)', cell(S.model.hit, S.model.runs), cell(S.naive.hit, S.naive.runs)],   ['Precision (predicted picks really picked)', cell(S.model.correct, S.model.predicted), cell(S.naive.correct, S.naive.predicted)]]; const mdTable = t => ['| ' + t[0].join(' | ') + ' |', '|---|---|---|', ...t.slice(1).map(r => '| ' + r.join(' | ') + ' |')].join('\\n'); const banLine = S => cell(S.bans.mattered, S.bans.planned);  const sign = (m, n) => (m > n ? 'ahead of' : m < n ? 'behind' : 'level with'); function verdict(S) {   const mh = S.model.hit / S.model.runs, nh = S.naive.hit / S.naive.runs;   const mp = S.model.correct / S.model.predicted, np = S.naive.correct / S.naive.predicted;   if (mh < nh && mp < np) return 'loses to the naive baseline on both measures';   if (mh > nh && mp > np) return 'beats the naive baseline on both measures';   if (mh === nh && mp === np) return 'scores exactly the same as the naive baseline';   return `is mixed: ${sign(mh, nh)} the baseline on hit rate and ${sign(mp, np)} it on precision`; } const line = (name, S) => `${name} (${S.model.runs} runs): the planner ${verdict(S)}, ${pct(S.model.hit, S.model.runs)} hit rate and ${pct(S.model.correct, S.model.predicted)} precision against ${pct(S.naive.hit, S.naive.runs)} and ${pct(S.naive.correct, S.naive.predicted)}.`; const T = splits.TUNE, X = splits.TEST;  const paragraph =   `${line('On TUNE', T)} ${line('On TEST', X)} TEST was run once, after every choice was fixed on TUNE, and is reported as it came out. ` +   `Head to head on TEST, the planner hit where the baseline missed in ${X.onlyModel} runs and the baseline hit where the planner missed in ${X.onlyNaive}. ` +   `Of our planned bans, ${banLine(X).split(' ')[0]} on TEST (${banLine(T).split(' ')[0]} on TUNE) were champions the opponent picked or banned themselves in that game; the rest were champions the opponent neither picked nor banned. ` +   `This shows whether the bans aimed at champions that mattered to them, not that they were good bans. ` +   `What the numbers do not mean: the real teams ban too, so a correct prediction can be banned away before it is ever picked, and a miss can be a champion that was banned rather than a bad read. ` +   `The planner only predicts three picks while a team picks five, so precision cannot reach 100% and is not comparable to a full-draft forecast. ` +   `The score says nothing about whether our own picks or bans would have won games. TEST holds only ${X.model.runs} runs from ${X.games} games, so a gap of a few points is a handful of runs and well within noise; ` +   `TUNE numbers are flattered because the weights were picked on them. Early cases rest on only 10 to a few dozen prior games per team.`;  console.log(`Backtest ${range}: ${cases.length} games, ${runs} runs (each team as "us")`); for (const [name, S] of Object.entries(splits)) {   const table = tableOf(S);   console.log(`\\n${name} (${ranges[name]}): ${S.games} games, ${S.model.runs} runs`);   const w = [Math.max(...table.map(r => r[0].length)), Math.max(...table.map(r => r[1].length))];   for (const r of table) console.log(`${r[0].padEnd(w[0])}  ${r[1].padEnd(w[1])}  ${r[2]}`);   console.log(`Planned bans the opponent picked or banned: ${banLine(S)}`);   console.log(`Planner hit, baseline missed: ${S.onlyModel} runs. Baseline hit, planner missed: ${S.onlyNaive} runs.`); }  """ c=s.index("const md = `") s=s[:a]+loop+s[c:] open('tests/backtest.js','w').write(s) E grep -n "paragraph\|banLine\|onlyModel" tests/backtest.js | tail -8

```text
86:const paragraph =
88:  `Head to head on TEST, the planner hit where the baseline missed in ${X.onlyModel} runs and the baseline hit where the planner missed in ${X.onlyNaive}. ` +
89:  `Of our planned bans, ${banLine(X).split(' ')[0]} on TEST (${banLine(T).split(' ')[0]} on TUNE) were champions the opponent picked or banned themselves in that game; the rest were champions the opponent neither picked nor banned. ` +
102:  console.log(`Planned bans the opponent picked or banned: ${banLine(S)}`);
103:  console.log(`Planner hit, baseline missed: ${S.onlyModel} runs. Baseline hit, planner missed: ${S.onlyNaive} runs.`);
128:Planned bans (our 3) that the opponent picked or banned themselves in that game: **${banLine}**.
130:Planner hit where the baseline missed: ${onlyModel} runs. Baseline hit where the planner missed: ${onlyNaive} runs.
134:${paragraph}
```

```text
The backtest script was rewritten to split games into TUNE (before 2026-07-01) and TEST (from that date) sets, with scoring for the planner versus a baseline, and the file was updated successfully with exit code 0.
```

## Thinking

I've settled on a window of N=10 with equal weights and dropped the ban, win-rate, and minimum-games filters, and I'm adding a first-pick count to the reason text. Next I'm splitting tests/backtest.js into TUNE and TEST sets, running TEST once, and then updating the docs.

### Ran cd ~/workplace/draftroom; python3 - <<'E' s=open('tests/backtest.js').read() a=s.index("const md = `") b=s.index("Rerun it:") new="""const section = (name, S) => `### ${name}: ${ranges[name]}, ${S.games} games, ${S.model.runs} runs  ${mdTable(tableOf(S))}  Planned bans (our 3) that the opponent picked or banned themselves in that game: **${banLine(S)}**. Planner hit where the baseline missed: ${S.onlyModel} runs. Baseline hit where the planner missed: ${S.onlyNaive} runs.`;  const md = `# Backtest  If a coach had used the planner before each real ${meta.league} ${meta.since.slice(0, 4)} game, how often would its prediction of the opponent's picks have been right?  - **Date range:** ${range} - **Games:** ${cases.length} (of ${meta.league_games_in_range} ${meta.league} games since ${meta.since}; left out: ${skipped}) - **Runs:** ${runs} (every game is planned twice, once with each team as "us") - **Split by date:** TUNE = games before ${SPLIT_DATE} (${T.games} games, ${T.model.runs} runs), TEST = games from ${SPLIT_DATE} on (${X.games} games, ${X.model.runs} runs)  ## Method  - Each team's profile uses only ${meta.league} games dated before the series' scheduled date, and player roles are voted from those same games. A game is skipped if either team has fewer than ${meta.min_games} prior games. - Champions picked in earlier games of the same series are locked (fearless). - From each run, the 3 champions in \\`steps.them_pick\\` are the predicted opponent picks, scored against the opponent's real 5 picks in that game. - The baseline ignores the draft logic: the opponent's 3 most-played champions this season that are not locked. - Head-to-head history is left out of the planner input, because it would include this series or later ones. - Every design decision and weight was chosen on TUNE only. TEST was run once, after the predictor was frozen, and is reported as it came out.  ## What changed in the predictor  Before: the opponent's first-pick habit, then their most-played champions, one per role.  Now (\\`predictPicks\\` in \\`web/planner.js\\`, the same code the app uses): every champion still open scores the sum of three shares of the opponent's games before this series:  - **Season:** games played with it, divided by their games this season. - **Recent:** games played with it in their last ${meta.recent || 10} games, divided by ${meta.recent || 10}. - **First pick:** times they opened a draft with it, divided by their games this season.  The top 3 are named, at most one per role. The slot reason reads like "Josedeodo, 6 of last 10 games, first pick 2x". Profiles gained a per-champion \\`recent\\` count (\\`pipeline/build.py\\`).  Tried on TUNE and left out: a win rate with a prior ((wins+2)/(games+4)) did not help; subtracting how often they ban a champion made it worse; a minimum-games filter made it worse; dropping any one of the three shares scored lower. Recent windows of 5 to 20 games were tried and 10 kept. One pick per role scored about the same as no limit, so the existing rule stayed. Several blends within a point or two of each other were indistinguishable on TUNE; the simplest equal-weight blend was kept.  ## Results  ${section('TUNE', T)}  ${section('TEST', X)}  ## What this means  ${paragraph}  """ s=s[:a]+new+s[b:] open('tests/backtest.js','w').write(s) E node tests/backtest.js

```text
Backtest 2026-02-22 to 2026-10-12: 141 games, 282 runs (each team as "us")

TUNE (2026-02-22 to 2026-06-14): 106 games, 212 runs
Measure                                                   Planner          Baseline (3 most played, not locked)
Hit rate (at least 1 of 3 predicted picks really picked)  43.4% (92/212)   39.2% (83/212)
Precision (predicted picks really picked)                 17.0% (108/636)  15.3% (97/636)
Planned bans the opponent picked or banned: 27.7% (176/636)
Planner hit, baseline missed: 47 runs. Baseline hit, planner missed: 38 runs.

TEST (2026-07-26 to 2026-10-12): 35 games, 70 runs
Measure                                                   Planner        Baseline (3 most played, not locked)
Hit rate (at least 1 of 3 predicted picks really picked)  20.0% (14/70)  25.7% (18/70)
Precision (predicted picks really picked)                 7.1% (15/210)  9.5% (20/210)
Planned bans the opponent picked or banned: 25.2% (53/210)
Planner hit, baseline missed: 9 runs. Baseline hit, planner missed: 13 runs.
written docs/backtest.md
```

```text
The backtest ran successfully, with the planner ahead on the tuning split but behind the baseline on the test split, and the results were written to the backtest doc.
```

### Ran cd ~/workplace/draftroom; python3 - <<'E' s=open('tests/backtest.js').read() s=s.replace("""const paragraph =   `${line('On TUNE', T)} ${line('On TEST', X)} TEST was run once, after every choice was fixed on TUNE, and is reported as it came out. ` +""","""const beatsTest = X.model.hit > X.naive.hit && X.model.correct / X.model.predicted > X.naive.correct / X.naive.predicted; const paragraph =   `${line('On TUNE', T)} ${line('On TEST', X)} TEST was run once, after every choice was fixed on TUNE, and is reported as it came out. ` +   (beatsTest ? 'The gain held on games the weights never saw. '     : 'The planner does not beat the baseline on TEST: the gain on TUNE did not carry over to games the weights never saw, so it should be read as fitted to TUNE, not as a real improvement. ') +""") open('tests/backtest.js','w').write(s) E node tests/backtest.js >/dev/null && node tests/planner.test.js && python3 tests/fit.py 2>&1 | tail -5; cat docs/backtest.md | sed -n 25,70p; git status --short

````text
ok: 360 plans across 9 teams
1366 680 errors []
1440 800 errors []
1920 960 errors []
all fit
- **Season:** games played with it, divided by their games this season.
- **Recent:** games played with it in their last 10 games, divided by 10.
- **First pick:** times they opened a draft with it, divided by their games this season.

The top 3 are named, at most one per role. The slot reason reads like "Josedeodo, 6 of last 10 games, first pick 2x". Profiles gained a per-champion `recent` count (`pipeline/build.py`).

Tried on TUNE and left out: a win rate with a prior ((wins+2)/(games+4)) did not help; subtracting how often they ban a champion made it worse; a minimum-games filter made it worse; dropping any one of the three shares scored lower. Recent windows of 5 to 20 games were tried and 10 kept. One pick per role scored about the same as no limit, so the existing rule stayed. Several blends within a point or two of each other were indistinguishable on TUNE; the simplest equal-weight blend was kept.

## Results

### TUNE: 2026-02-22 to 2026-06-14, 106 games, 212 runs

| Measure | Planner | Baseline (3 most played, not locked) |
|---|---|---|
| Hit rate (at least 1 of 3 predicted picks really picked) | 43.4% (92/212) | 39.2% (83/212) |
| Precision (predicted picks really picked) | 17.0% (108/636) | 15.3% (97/636) |

Planned bans (our 3) that the opponent picked or banned themselves in that game: **27.7% (176/636)**.
Planner hit where the baseline missed: 47 runs. Baseline hit where the planner missed: 38 runs.

### TEST: 2026-07-26 to 2026-10-12, 35 games, 70 runs

| Measure | Planner | Baseline (3 most played, not locked) |
|---|---|---|
| Hit rate (at least 1 of 3 predicted picks really picked) | 20.0% (14/70) | 25.7% (18/70) |
| Precision (predicted picks really picked) | 7.1% (15/210) | 9.5% (20/210) |

Planned bans (our 3) that the opponent picked or banned themselves in that game: **25.2% (53/210)**.
Planner hit where the baseline missed: 9 runs. Baseline hit where the planner missed: 13 runs.

## What this means

On TUNE (212 runs): the planner beats the naive baseline on both measures, 43.4% hit rate and 17.0% precision against 39.2% and 15.3%. On TEST (70 runs): the planner loses to the naive baseline on both measures, 20.0% hit rate and 7.1% precision against 25.7% and 9.5%. TEST was run once, after every choice was fixed on TUNE, and is reported as it came out. The planner does not beat the baseline on TEST: the gain on TUNE did not carry over to games the weights never saw, so it should be read as fitted to TUNE, not as a real improvement. Head to head on TEST, the planner hit where the baseline missed in 9 runs and the baseline hit where the planner missed in 13. Of our planned bans, 25.2% on TEST (27.7% on TUNE) were champions the opponent picked or banned themselves in that game; the rest were champions the opponent neither picked nor banned. This shows whether the bans aimed at champions that mattered to them, not that they were good bans. What the numbers do not mean: the real teams ban too, so a correct prediction can be banned away before it is ever picked, and a miss can be a champion that was banned rather than a bad read. The planner only predicts three picks while a team picks five, so precision cannot reach 100% and is not comparable to a full-draft forecast. The score says nothing about whether our own picks or bans would have won games. TEST holds only 70 runs from 35 games, so a gap of a few points is a handful of runs and well within noise; TUNE numbers are flattered because the weights were picked on them. Early cases rest on only 10 to a few dozen prior games per team.

Rerun it:

```bash
python pipeline/backtest.py --data ../stl-hackathon-2026-grid-starter
node tests/backtest.js
```
 M docs/backtest.md
 M pipeline/backtest.py
 M pipeline/build.py
 M tests/backtest.js
 M web/planner.js
````

```text
The backtest script now reports whether the planner beats the baseline on the test set, and all checks passed.
```
