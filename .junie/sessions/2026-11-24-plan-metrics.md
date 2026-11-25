# Session transcript

### Ran cat .junie/guidelines.md; cat docs/backtest.md; ls tests web docs cache pipeline; wc -l tests/* web/*.js

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
- **Split by date:** TUNE = games before 2026-07-01 (106 games, 212 runs), TEST = games from 2026-07-01 on (35 games, 70 runs)

## Method

- Each team's profile uses only LCS games dated before the series' scheduled date, and player roles are voted from those same games. A game is skipped if either team has fewer than 10 prior games.
- Champions picked in earlier games of the same series are locked (fearless).
- From each run, the 3 champions in `steps.them_pick` are the predicted opponent picks, scored against the opponent's real 5 picks in that game.
- The baseline ignores the draft logic: the opponent's 3 most-played champions this season that are not locked.
- Head-to-head history is left out of the planner input, because it would include this series or later ones.
- Every design decision and weight was chosen on TUNE only. TEST was run once, after the predictor was frozen, and is reported as it came out.

## What changed in the predictor

Before: the opponent's first-pick habit, then their most-played champions, one per role.

Now (`predictPicks` in `web/planner.js`, the same code the app uses): every champion still open scores the sum of three shares of the opponent's games before this series:

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
cache:
backtest-cases.json
games.json

docs:
backtest.md

pipeline:
__pycache__
backtest.py
build.py
extract.py

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
   167 tests/backtest.js
    42 tests/fit.py
    32 tests/planner.test.js
   369 web/app.js
     2 web/data.js
   177 web/planner.js
   789 total
````

```text
The bash command displayed the project guidelines and backtest documentation, listed the contents of the tests, web, docs, cache, and pipeline directories, and reported line counts for the test and web files, finishing with exit code 0.
```

### Read tests/backtest.js

### Ran cat pipeline/backtest.py; cat tests/fit.py; head -c 1500 cache/backtest-cases.json; git status --short; git log --oneline | head

```text
[output removed: it showed rows of the licensed GRID data, which this repo does not publish]
```

```text
The command printed the backtest case-builder script, a test script, the start of the generated backtest cases file, and the git status and recent commit history, with the output partly truncated.
```

### Read web/planner.js

## Thinking

I'm working out how to define and score the two baselines and the fearless check, so that the results table reports comparable numbers for each metric.

### Ran python3 - <<'E' import json G=json.load(open('cache/games.json')) print(len(G)); g=G[0]; print({k:(v if k!='draft' else v[:3]) for k,v in g.items() if k not in('events',)}) E ls ..; cat tests/planner.test.js | head -40; git check-ignore -v cache web/data.js

```text
[output removed: it showed rows of the licensed GRID data, which this repo does not publish]
```

```text
The command loaded a cache of 1775 game records and printed the first record's fields, listed the parent directory, displayed the start of a planner test file, and confirmed that the cache directory and web data file are git-ignored.
```

### Ran python3 - <<'E' p='pipeline/backtest.py' s=open(p).read() s=s.replace("""            'locked': [d[3] for e in earlier for d in e['draft'] if d[1] == 'pick'], ""","""            'locked': [d[3] for e in earlier for d in e['draft'] if d[1] == 'pick'],             # every champion picked in the whole series, this game and the later ones included:             # only for scoring afterwards (did a role run dry?), never an input to the planner             'series_picks': [d[3] for e in order for d in e['draft'] if d[1] == 'pick'],             'series_games': len(order), """) open(p,'w').write(s) E cp cache/backtest-cases.json /tmp/old-cases.json python pipeline/backtest.py --data ../stl-hackathon-2026-grid-starter && python3 - <<'E' import json a=json.load(open('/tmp/old-cases.json'))['cases'];b=json.load(open('cache/backtest-cases.json'))['cases'] print(len(a),len(b)) print(all({k:v for k,v in y.items() if k not in('series_picks','series_games')}==x for x,y in zip(a,b))) E

```text
141 cases of 225 LCS games since 2026-01-01 -> cache/backtest-cases.json (1435 KB)
  skipped 71: a team with under 10 prior games
  skipped 11: incomplete draft
  skipped 2: side unknown
141 141
True
```

```text
The backtest script was modified to add series-level pick and game-count fields to each case, and rerunning it regenerated 141 cases with all original fields unchanged.
```

### Ran python3 - <<'E' p='tests/backtest.js' s=open(p).read()  # 1. imports + helpers s=s.replace("const { plan } = require('../web/planner.js');","const { plan, ROLES, ROLE_NAME } = require('../web/planner.js');") s=s.replace("""const SPLIT_DATE""","""// our most-played open champions, one per role (a champion counts in the role it played most) function baselineByRole(profile, locked, k) {   const played = {};   for (const ro of ROLES)     for (const [ch, rec] of Object.entries(profile.pool[ro] || {})) {       const x = played[ch] || (played[ch] = { ch, ro, g: 0, best: 0 });       x.g += rec[0];       if (rec[0] > x.best) { x.best = rec[0]; x.ro = ro; }     }   const out = [], used = new Set();   for (const x of Object.values(played).filter(x => !locked.includes(x.ch)).sort((a, b) => b.g - a.g || (a.ch < b.ch ? -1 : 1))) {     if (out.length === k) break;     if (used.has(x.ro)) continue;     used.add(x.ro); out.push(x.ch);   }   return out; }  // the role a plan calls thin ("Mid is thin. ...") and whether our team really ran out of proven // champions (5+ games before the series) in a role once every game of the series was played const ROLE_OF_NAME = Object.fromEntries(Object.entries(ROLE_NAME).map(([r, n]) => [n, r])); const thinRole = p => ROLE_OF_NAME[p.thin.split(' is thin')[0]]; const ranOut = (profile, role, picked) =>   Object.entries(profile.pool[role] || {}).filter(([c, rec]) => rec[0] >= 5 && !picked.includes(c)).length === 0;  // Wilson score interval, 95% function wilson(k, n) {   if (!n) return [0, 0];   const z = 1.96, p = k / n, d = 1 + z * z / n, c = p + z * z / (2 * n), h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n));   return [(c - h) / d, (c + h) / d]; } const MIN_RUNS = 20;   // fewer runs than this and a share is not worth printing  const SPLIT_DATE""",1)  # 2. tallies s=s.replace("""const newSplit = () => ({ games: 0, model: tally(), naive: tally(), bans: { planned: 0, mattered: 0 }, onlyModel: 0, onlyNaive: 0 });""", """const pair = () => ({ n: 0, model: 0, naive: 0 }); const newSplit = () => ({ games: 0, model: tally(), naive: tally(), bans: { planned: 0, mattered: 0 }, onlyModel: 0, onlyNaive: 0,   first: pair(), three: pair(), mbans: pair(), thin: pair(), noThree: 0, thinTrivial: 0 });""")  # 3. per-run scoring s=s.replace("""    for (const s of p.steps.us_ban) { S.bans.planned++; S.bans.mattered += mattered.has(s.champ); } ""","""    for (const s of p.steps.us_ban) { S.bans.planned++; S.bans.mattered += mattered.has(s.champ); }      // our own picks against what the opponent really banned     const theirBans = c.actual[them].bans;     const mine = p.steps.us_pick.map(s => s.champ);     if (mine.length) {       const base1 = baselineByRole(c.profiles[us], c.locked, 1);   // single most-played open champion       S.first.n++; S.first.model += !theirBans.includes(mine[0]); S.first.naive += !theirBans.includes(base1[0]);     }     if (mine.length === 3) {       const base3 = baselineByRole(c.profiles[us], c.locked, 3);       if (base3.length === 3) {         S.three.n++; S.three.model += mine.every(ch => !theirBans.includes(ch)); S.three.naive += base3.every(ch => !theirBans.includes(ch));       }     } else S.noThree++;      // bans that mattered, per planned ban, against the opponent's 3 most-played open champions     const nb = baseline(c.profiles[them], c.locked);     S.mbans.n += p.steps.us_ban.length;     S.mbans.model += p.steps.us_ban.filter(s => mattered.has(s.champ)).length;     S.mbans.naive += nb.filter(ch => mattered.has(ch)).length;      // fearless warning: the thin role against the whole series as it was really played     const role = thinRole(p);     S.thin.n++; S.thin.model += ranOut(c.profiles[us], role, c.series_picks);     // baseline: any role picked blindly (all 5 roles), so n is 5 per run     S.thin.nBase = (S.thin.nBase || 0) + ROLES.length;     S.thin.naive += ROLES.filter(r => ranOut(c.profiles[us], r, c.series_picks)).length;     S.thinTrivial += !Object.values(c.profiles[us].pool[role] || {}).some(rec => rec[0] >= 5); """) open(p,'w').write(s) E node -e "1" && grep -n "thin" tests/backtest.js | head -3

```text
43:// the role a plan calls thin ("Mid is thin. ...") and whether our team really ran out of proven
46:const thinRole = p => ROLE_OF_NAME[p.thin.split(' is thin')[0]];
62:  first: pair(), three: pair(), mbans: pair(), thin: pair(), noThree: 0, thinTrivial: 0 });
```

```text
The backtest script was updated with new helper functions and additional scoring metrics, and the command completed successfully with exit code 0.
```

## Thinking

I added each case's full series picks and game count to the pipeline, leaving the 141 cases otherwise unchanged, and started rewriting the output section to build tables with sample sizes and confidence intervals. Next I'll set up the table columns, showing the planner's and baseline's shares with 95% intervals, and move the baseline definitions into a separate method list.

### Ran python3 - <<'E' p='tests/backtest.js' s=open(p).read() a=s.index("const tableOf") b=s.index("const sign =") new='''const ci = (k, n) => { const [lo, hi] = wilson(k, n); return `${(100 * lo).toFixed(1)}% to ${(100 * hi).toFixed(1)}%`; }; const HEAD = ['Measure', 'n', 'Planner', 'Planner 95% CI', 'Baseline n', 'Baseline', 'Baseline 95% CI']; const row = (name, n, k, nb, kb) => [name, String(n), cell(k, n), ci(k, n), String(nb), cell(kb, nb), ci(kb, nb)]; const skippedRow = (name, n) => [name, String(n), `skipped: under ${MIN_RUNS} runs`, '-', '-', '-', '-']; const rowsOf = S => [   row('Opponent picks: hit rate (at least 1 of 3 predicted picks really picked)', S.model.runs, S.model.hit, S.naive.runs, S.naive.hit),   row('Opponent picks: precision (predicted picks really picked)', S.model.predicted, S.model.correct, S.naive.predicted, S.naive.correct),   row('1. First pick survives (not banned by the opponent)', S.first.n, S.first.model, S.first.n, S.first.naive),   row('2. All 3 planned picks survive the opponent\\'s bans', S.three.n, S.three.model, S.three.n, S.three.naive),   row('3. Bans that mattered (opponent picked or banned it, per planned ban)', S.mbans.n, S.mbans.model, S.mbans.n, S.mbans.naive),   S.thin.n >= MIN_RUNS ? row('4. Fearless warning held (thin role really ran out of proven champions)', S.thin.n, S.thin.model, S.thin.nBase, S.thin.naive)     : skippedRow('4. Fearless warning held (thin role really ran out of proven champions)', S.thin.n)]; const tableOf = S => [HEAD, ...rowsOf(S)]; const mdTable = t => ['| ' + t[0].join(' | ') + ' |', '|' + t[0].map(() => '---').join('|') + '|', ...t.slice(1).map(r => '| ' + r.join(' | ') + ' |')].join('\\n'); const banLine = S => cell(S.bans.mattered, S.bans.planned);  ''' s=s[:a]+new+s[b:] # console print old=s[s.index("  const w = [Math.max"):s.index("  console.log(`Planned bans the opponent picked")] s=s.replace(old,"""  const w = HEAD.map((_, i) => Math.max(...table.map(r => r[i].length)));   for (const r of table) console.log(r.map((x, i) => x.padEnd(w[i])).join('  ')); """) open(p,'w').write(s) E node tests/backtest.js

```text
Backtest 2026-02-22 to 2026-10-12: 141 games, 282 runs (each team as "us")

TUNE (2026-02-22 to 2026-06-14): 106 games, 212 runs
Measure                                                                   n    Planner          Planner 95% CI  Baseline n  Baseline          Baseline 95% CI
Opponent picks: hit rate (at least 1 of 3 predicted picks really picked)  212  43.4% (92/212)   36.9% to 50.1%  212         39.2% (83/212)    32.8% to 45.9% 
Opponent picks: precision (predicted picks really picked)                 636  17.0% (108/636)  14.3% to 20.1%  636         15.3% (97/636)    12.7% to 18.3% 
1. First pick survives (not banned by the opponent)                       212  88.7% (188/212)  83.7% to 92.3%  212         86.3% (183/212)   81.0% to 90.3% 
2. All 3 planned picks survive the opponent's bans                        193  57.0% (110/193)  49.9% to 63.8%  193         64.8% (125/193)   57.8% to 71.2% 
3. Bans that mattered (opponent picked or banned it, per planned ban)     636  27.7% (176/636)  24.3% to 31.3%  636         22.2% (141/636)   19.1% to 25.6% 
4. Fearless warning held (thin role really ran out of proven champions)   212  87.3% (185/212)  82.1% to 91.1%  1060        64.9% (688/1060)  62.0% to 67.7% 
Planned bans the opponent picked or banned: 27.7% (176/636)
Planner hit, baseline missed: 47 runs. Baseline hit, planner missed: 38 runs.

TEST (2026-07-26 to 2026-10-12): 35 games, 70 runs
Measure                                                                   n    Planner         Planner 95% CI  Baseline n  Baseline        Baseline 95% CI
Opponent picks: hit rate (at least 1 of 3 predicted picks really picked)  70   20.0% (14/70)   12.3% to 30.8%  70          25.7% (18/70)   16.9% to 37.0% 
Opponent picks: precision (predicted picks really picked)                 210  7.1% (15/210)   4.4% to 11.4%   210         9.5% (20/210)   6.2% to 14.3%  
1. First pick survives (not banned by the opponent)                       70   97.1% (68/70)   90.2% to 99.2%  70          90.0% (63/70)   80.8% to 95.1% 
2. All 3 planned picks survive the opponent's bans                        69   75.4% (52/69)   64.0% to 84.0%  69          68.1% (47/69)   56.4% to 77.9% 
3. Bans that mattered (opponent picked or banned it, per planned ban)     210  25.2% (53/210)  19.8% to 31.5%  210         19.0% (40/210)  14.3% to 24.9% 
4. Fearless warning held (thin role really ran out of proven champions)   70   31.4% (22/70)   21.8% to 43.0%  350         14.9% (52/350)  11.5% to 19.0% 
Planned bans the opponent picked or banned: 25.2% (53/210)
Planner hit, baseline missed: 9 runs. Baseline hit, planner missed: 13 runs.
written docs/backtest.md
```

```text
The backtest script was rewritten to output a comparison table, and it ran successfully, writing the report to the docs.
```

### Ran python3 - <<'E' p='tests/backtest.js' s=open(p).read()  # method bullets s=s.replace("""- Head-to-head history is left out""","""- Our own plan is scored against what the opponent really banned in that game. Metric 1 (first pick survives): \\`steps.us_pick[0]\\` was not among the opponent's real bans; baseline is our single most-played champion this season that is not locked. Metric 2 (all three survive): none of the 3 planned picks was banned by them; baseline is our 3 most-played open champions, one per role (a champion counts in the role it played most). Runs where the planner named fewer than 3 picks, or the baseline could not fill 3 roles, are left out of metric 2 (${T.noThree + X.noThree} runs). - Metric 3 (bans that mattered): per planned ban, whether the opponent picked or banned it in that game; baseline is the opponent's 3 most-played open champions, scored the same way. - Metric 4 (fearless warning held): the role named in \\`plan.thin\\` counts as held when, after every game of the series as really played (this game and later ones, picks of both teams), our team had no champion left in that role with 5+ games before the series. The baseline is the same test for each of the 5 roles (so its n is 5 per run), that is, how often any role picked blindly would have run dry. It is skipped for a split with under ${MIN_RUNS} runs. - Intervals are 95% Wilson score intervals. They treat every run, pick or ban as independent, which they are not: the two runs of one game share a draft, bans of one run share a plan, and games of one series share the same locks. The true uncertainty is wider than printed. - Head-to-head history is left out""")  # results section: add note lines s=s.replace("""Planned bans (our 3) that the opponent picked or banned themselves in that game: **${banLine(S)}**. Planner hit""","""Planned bans (our 3) that the opponent picked or banned themselves in that game: **${banLine(S)}**. Of the ${S.thin.n} runs for metric 4, ${S.thinTrivial} named a role in which we had no proven champion even before the series started, so the warning could not fail there. Planner hit""")  # paragraph additions s=s.replace("""const paragraph =   `${line('On TUNE', T)}""","""const p1 = S => (100 * S.first.model / S.first.n).toFixed(1) + '%', b1 = S => (100 * S.first.naive / S.first.n).toFixed(1) + '%'; const ownParagraph =   `Our own plan, measured on TEST (TUNE in brackets). The first pick survived the opponent's real bans in ${cell(X.first.model, X.first.n)} of runs (${pct(T.first.model, T.first.n)}), against ${cell(X.first.naive, X.first.n)} (${pct(T.first.naive, T.first.n)}) for our most-played champion. ` +   `All three planned picks survived in ${cell(X.three.model, X.three.n)} (${pct(T.three.model, T.three.n)}), against ${cell(X.three.naive, X.three.n)} (${pct(T.three.naive, T.three.n)}) for our three most played. ` +   `Our planned bans were champions the opponent picked or banned in ${cell(X.mbans.model, X.mbans.n)} (${pct(T.mbans.model, T.mbans.n)}), against ${cell(X.mbans.naive, X.mbans.n)} (${pct(T.mbans.naive, T.mbans.n)}) for the opponent's three most played. ` +   (X.thin.n >= MIN_RUNS     ? `The fearless warning held in ${cell(X.thin.model, X.thin.n)} of runs (${pct(T.thin.model, T.thin.n)}), against ${cell(X.thin.naive, X.thin.nBase)} (${pct(T.thin.naive, T.thin.nBase)}) for a role picked blindly; ${X.thinTrivial} of those ${X.thin.n} TEST runs (${T.thinTrivial} of ${T.thin.n} on TUNE) named a role where we never had a proven champion, which cannot fail. `     : `The fearless warning was not scored on TEST: only ${X.thin.n} runs, under ${MIN_RUNS}. `) +   `What the plan gets right: the first pick is rarely banned and the planned bans land on champions the opponent used more often than the baseline's do. ` +   `What it does not: all three picks are banned away in a sizeable share of runs, and most planned bans (about three in four) were champions the opponent neither picked nor banned. ` +   `Where an interval for the planner overlaps the baseline's, the two are not told apart; check the tables above before reading any gap as real. ` +   `The sample is small: TEST is ${X.model.runs} runs from ${X.games} games, a first pick that was banned is ${X.first.n - X.first.model} runs, and the intervals above are 10 to 20 points wide. ` +   `The scores say nothing about whether the picks and bans would have won games, and the real opponent may have banned differently had it seen a different plan.`; const paragraph =   `${line('On TUNE', T)}""") s=s.replace("""## What this means  ${paragraph} ""","""## What this means  ${paragraph}  ${ownParagraph} """) open(p,'w').write(s) E node tests/backtest.js | tail -3; sed -n 1,40p docs/backtest.md

```text
Planned bans the opponent picked or banned: 25.2% (53/210)
Planner hit, baseline missed: 9 runs. Baseline hit, planner missed: 13 runs.
written docs/backtest.md
# Backtest

If a coach had used the planner before each real LCS 2026 game, how often would its prediction of the opponent's picks have been right?

- **Date range:** 2026-02-22 to 2026-10-12
- **Games:** 141 (of 225 LCS games since 2026-01-01; left out: 71 for a team with under 10 prior games, 11 for incomplete draft, 2 for side unknown)
- **Runs:** 282 (every game is planned twice, once with each team as "us")
- **Split by date:** TUNE = games before 2026-07-01 (106 games, 212 runs), TEST = games from 2026-07-01 on (35 games, 70 runs)

## Method

- Each team's profile uses only LCS games dated before the series' scheduled date, and player roles are voted from those same games. A game is skipped if either team has fewer than 10 prior games.
- Champions picked in earlier games of the same series are locked (fearless).
- From each run, the 3 champions in `steps.them_pick` are the predicted opponent picks, scored against the opponent's real 5 picks in that game.
- The baseline ignores the draft logic: the opponent's 3 most-played champions this season that are not locked.
- Our own plan is scored against what the opponent really banned in that game. Metric 1 (first pick survives): `steps.us_pick[0]` was not among the opponent's real bans; baseline is our single most-played champion this season that is not locked. Metric 2 (all three survive): none of the 3 planned picks was banned by them; baseline is our 3 most-played open champions, one per role (a champion counts in the role it played most). Runs where the planner named fewer than 3 picks, or the baseline could not fill 3 roles, are left out of metric 2 (20 runs).
- Metric 3 (bans that mattered): per planned ban, whether the opponent picked or banned it in that game; baseline is the opponent's 3 most-played open champions, scored the same way.
- Metric 4 (fearless warning held): the role named in `plan.thin` counts as held when, after every game of the series as really played (this game and later ones, picks of both teams), our team had no champion left in that role with 5+ games before the series. The baseline is the same test for each of the 5 roles (so its n is 5 per run), that is, how often any role picked blindly would have run dry. It is skipped for a split with under 20 runs.
- Intervals are 95% Wilson score intervals. They treat every run, pick or ban as independent, which they are not: the two runs of one game share a draft, bans of one run share a plan, and games of one series share the same locks. The true uncertainty is wider than printed.
- Head-to-head history is left out of the planner input, because it would include this series or later ones.
- Every design decision and weight was chosen on TUNE only. TEST was run once, after the predictor was frozen, and is reported as it came out.

## What changed in the predictor

Before: the opponent's first-pick habit, then their most-played champions, one per role.

Now (`predictPicks` in `web/planner.js`, the same code the app uses): every champion still open scores the sum of three shares of the opponent's games before this series:

- **Season:** games played with it, divided by their games this season.
- **Recent:** games played with it in their last 10 games, divided by 10.
- **First pick:** times they opened a draft with it, divided by their games this season.

The top 3 are named, at most one per role. The slot reason reads like "Josedeodo, 6 of last 10 games, first pick 2x". Profiles gained a per-champion `recent` count (`pipeline/build.py`).

Tried on TUNE and left out: a win rate with a prior ((wins+2)/(games+4)) did not help; subtracting how often they ban a champion made it worse; a minimum-games filter made it worse; dropping any one of the three shares scored lower. Recent windows of 5 to 20 games were tried and 10 kept. One pick per role scored about the same as no limit, so the existing rule stayed. Several blends within a point or two of each other were indistinguishable on TUNE; the simplest equal-weight blend was kept.

## Results

### TUNE: 2026-02-22 to 2026-06-14, 106 games, 212 runs
```

```text
The backtest script was edited to add a new "our own plan" section with four metrics and a summary paragraph, and it ran successfully, writing the updated docs/backtest.md with TUNE results for 106 games and 212 runs.
```

### Ran sed -n 40,80p docs/backtest.md

````text

| Measure | n | Planner | Planner 95% CI | Baseline n | Baseline | Baseline 95% CI |
|---|---|---|---|---|---|---|
| Opponent picks: hit rate (at least 1 of 3 predicted picks really picked) | 212 | 43.4% (92/212) | 36.9% to 50.1% | 212 | 39.2% (83/212) | 32.8% to 45.9% |
| Opponent picks: precision (predicted picks really picked) | 636 | 17.0% (108/636) | 14.3% to 20.1% | 636 | 15.3% (97/636) | 12.7% to 18.3% |
| 1. First pick survives (not banned by the opponent) | 212 | 88.7% (188/212) | 83.7% to 92.3% | 212 | 86.3% (183/212) | 81.0% to 90.3% |
| 2. All 3 planned picks survive the opponent's bans | 193 | 57.0% (110/193) | 49.9% to 63.8% | 193 | 64.8% (125/193) | 57.8% to 71.2% |
| 3. Bans that mattered (opponent picked or banned it, per planned ban) | 636 | 27.7% (176/636) | 24.3% to 31.3% | 636 | 22.2% (141/636) | 19.1% to 25.6% |
| 4. Fearless warning held (thin role really ran out of proven champions) | 212 | 87.3% (185/212) | 82.1% to 91.1% | 1060 | 64.9% (688/1060) | 62.0% to 67.7% |

Planned bans (our 3) that the opponent picked or banned themselves in that game: **27.7% (176/636)**.
Of the 212 runs for metric 4, 134 named a role in which we had no proven champion even before the series started, so the warning could not fail there.
Planner hit where the baseline missed: 47 runs. Baseline hit where the planner missed: 38 runs.

### TEST: 2026-07-26 to 2026-10-12, 35 games, 70 runs

| Measure | n | Planner | Planner 95% CI | Baseline n | Baseline | Baseline 95% CI |
|---|---|---|---|---|---|---|
| Opponent picks: hit rate (at least 1 of 3 predicted picks really picked) | 70 | 20.0% (14/70) | 12.3% to 30.8% | 70 | 25.7% (18/70) | 16.9% to 37.0% |
| Opponent picks: precision (predicted picks really picked) | 210 | 7.1% (15/210) | 4.4% to 11.4% | 210 | 9.5% (20/210) | 6.2% to 14.3% |
| 1. First pick survives (not banned by the opponent) | 70 | 97.1% (68/70) | 90.2% to 99.2% | 70 | 90.0% (63/70) | 80.8% to 95.1% |
| 2. All 3 planned picks survive the opponent's bans | 69 | 75.4% (52/69) | 64.0% to 84.0% | 69 | 68.1% (47/69) | 56.4% to 77.9% |
| 3. Bans that mattered (opponent picked or banned it, per planned ban) | 210 | 25.2% (53/210) | 19.8% to 31.5% | 210 | 19.0% (40/210) | 14.3% to 24.9% |
| 4. Fearless warning held (thin role really ran out of proven champions) | 70 | 31.4% (22/70) | 21.8% to 43.0% | 350 | 14.9% (52/350) | 11.5% to 19.0% |

Planned bans (our 3) that the opponent picked or banned themselves in that game: **25.2% (53/210)**.
Of the 70 runs for metric 4, 14 named a role in which we had no proven champion even before the series started, so the warning could not fail there.
Planner hit where the baseline missed: 9 runs. Baseline hit where the planner missed: 13 runs.

## What this means

On TUNE (212 runs): the planner beats the naive baseline on both measures, 43.4% hit rate and 17.0% precision against 39.2% and 15.3%. On TEST (70 runs): the planner loses to the naive baseline on both measures, 20.0% hit rate and 7.1% precision against 25.7% and 9.5%. TEST was run once, after every choice was fixed on TUNE, and is reported as it came out. The planner does not beat the baseline on TEST: the gain on TUNE did not carry over to games the weights never saw, so it should be read as fitted to TUNE, not as a real improvement. Head to head on TEST, the planner hit where the baseline missed in 9 runs and the baseline hit where the planner missed in 13. Of our planned bans, 25.2% on TEST (27.7% on TUNE) were champions the opponent picked or banned themselves in that game; the rest were champions the opponent neither picked nor banned. This shows whether the bans aimed at champions that mattered to them, not that they were good bans. What the numbers do not mean: the real teams ban too, so a correct prediction can be banned away before it is ever picked, and a miss can be a champion that was banned rather than a bad read. The planner only predicts three picks while a team picks five, so precision cannot reach 100% and is not comparable to a full-draft forecast. The score says nothing about whether our own picks or bans would have won games. TEST holds only 70 runs from 35 games, so a gap of a few points is a handful of runs and well within noise; TUNE numbers are flattered because the weights were picked on them. Early cases rest on only 10 to a few dozen prior games per team.

Our own plan, measured on TEST (TUNE in brackets). The first pick survived the opponent's real bans in 97.1% (68/70) of runs (88.7%), against 90.0% (63/70) (86.3%) for our most-played champion. All three planned picks survived in 75.4% (52/69) (57.0%), against 68.1% (47/69) (64.8%) for our three most played. Our planned bans were champions the opponent picked or banned in 25.2% (53/210) (27.7%), against 19.0% (40/210) (22.2%) for the opponent's three most played. The fearless warning held in 31.4% (22/70) of runs (87.3%), against 14.9% (52/350) (64.9%) for a role picked blindly; 14 of those 70 TEST runs (134 of 212 on TUNE) named a role where we never had a proven champion, which cannot fail. What the plan gets right: the first pick is rarely banned and the planned bans land on champions the opponent used more often than the baseline's do. What it does not: all three picks are banned away in a sizeable share of runs, and most planned bans (about three in four) were champions the opponent neither picked nor banned. Where an interval for the planner overlaps the baseline's, the two are not told apart; check the tables above before reading any gap as real. The sample is small: TEST is 70 runs from 35 games, a first pick that was banned is 2 runs, and the intervals above are 10 to 20 points wide. The scores say nothing about whether the picks and bans would have won games, and the real opponent may have banned differently had it seen a different plan.

Rerun it:

```bash
python pipeline/backtest.py --data ../stl-hackathon-2026-grid-starter
node tests/backtest.js
```
````

```text
The command printed lines 40 to 80 of the backtest document, showing a results table and a written discussion of the planner's TUNE and TEST performance, where the planner beat the naive baseline on TUNE but not on TEST.
```

## Thinking

I found that most of the metric 4 TUNE results (134 of 212) are trivial because no proven champion existed in the thin role, so I'll report the non-trivial figures separately. I'm now adding a helper that labels each metric's comparison as non-overlapping or overlapping, and subtracting the trivial counts to get the non-trivial numbers.

### Ran python3 - <<'E' p='tests/backtest.js' s=open(p).read() a=s.index("const p1 = S =>") b=s.index("const paragraph =") new='''// planner against baseline for one pair of counts: which is higher, and whether the 95% intervals overlap function vs(k, n, kb, nb) {   const a = k / n, b = kb / nb, [lo, hi] = wilson(k, n), [lob, hib] = wilson(kb, nb);   const apart = lo > hib || hi < lob;   return { ahead: a > b, level: a === b, apart, text: a === b ? 'level with the baseline' : `${a > b ? 'ahead of' : 'behind'} the baseline${apart ? ', intervals apart' : ', intervals overlap'}` }; } const metrics = S => ({   first: vs(S.first.model, S.first.n, S.first.naive, S.first.n),   three: vs(S.three.model, S.three.n, S.three.naive, S.three.n),   mbans: vs(S.mbans.model, S.mbans.n, S.mbans.naive, S.mbans.n),   thin: S.thin.n >= MIN_RUNS ? vs(S.thin.model, S.thin.n, S.thin.naive, S.thin.nBase) : null }); const mT = metrics(T), mX = metrics(X); const hard = (S, m) => S.thin.n - S.thinTrivial;   // runs where the thin role was not already empty before the series const ownParagraph =   `Our own plan. On TEST (TUNE in brackets): the first pick survived the opponent's real bans in ${cell(X.first.model, X.first.n)} of runs (${pct(T.first.model, T.first.n)}), ${mX.first.text}, baseline ${pct(X.first.naive, X.first.n)} (${pct(T.first.naive, T.first.n)}). ` +   `All three planned picks survived in ${cell(X.three.model, X.three.n)} (${pct(T.three.model, T.three.n)}), ${mX.three.text}, baseline ${pct(X.three.naive, X.three.n)} (${pct(T.three.naive, T.three.n)}). ` +   `Planned bans that mattered: ${cell(X.mbans.model, X.mbans.n)} (${pct(T.mbans.model, T.mbans.n)}), ${mX.mbans.text}, baseline ${pct(X.mbans.naive, X.mbans.n)} (${pct(T.mbans.naive, T.mbans.n)}). ` +   (X.thin.n >= MIN_RUNS     ? `Fearless warning held: ${cell(X.thin.model, X.thin.n)} (${pct(T.thin.model, T.thin.n)}), ${mX.thin.text}, baseline ${pct(X.thin.naive, X.thin.nBase)} (${pct(T.thin.naive, T.thin.nBase)}). `     : `The fearless warning was not scored on TEST: only ${X.thin.n} runs, under ${MIN_RUNS}. `) +   `What the plan gets right: a planned first pick is almost never banned away (${X.first.n - X.first.model} of ${X.first.n} runs on TEST, ${T.first.n - T.first.model} of ${T.first.n} on TUNE), ` +   `and the planned bans hit a champion the opponent used in about ${Math.round(100 * X.mbans.model / X.mbans.n)}% of cases on TEST, a little above the ${Math.round(100 * X.mbans.naive / X.mbans.n)}% of the plain most-played list. ` +   `What it does not get right: the planned first pick survives about as often as simply opening with our most-played champion, so the pick logic is not shown to add protection; ` +   `on TUNE all three picks survived less often than the baseline's (${pct(T.three.model, T.three.n)} against ${pct(T.three.naive, T.three.n)}), and the TEST lead on that is within the intervals; ` +   `about three in four planned bans were champions the opponent neither picked nor banned; ` +   `and the fearless warning is weak evidence on TUNE, because ${T.thinTrivial} of its ${T.thin.n} runs named a role where we had no proven champion even before the series, so it could not fail there ` +   `(${X.thinTrivial} of ${X.thin.n} on TEST). On the runs where the role still had proven champions at the start, it held in ${X.thin.model - X.thinTrivial} of ${hard(X)} on TEST (${ci(X.thin.model - X.thinTrivial, hard(X))}) and ${T.thin.model - T.thinTrivial} of ${hard(T)} on TUNE. ` +   `The sample is small: TEST is ${X.model.runs} runs from ${X.games} games, the two runs of a game share one draft, and most intervals above are 10 to 20 points wide, so a gap of a few points is noise. ` +   `Where the planner's interval overlaps the baseline's, the two are not told apart. None of this says whether the picks and bans would have won games, and a real opponent might have drafted differently against a different plan.`; ''' s=s[:a]+new+s[b:] open(p,'w').write(s) E node tests/backtest.js >/dev/null && sed -n '/Our own plan\./p' docs/backtest.md

```text
Our own plan. On TEST (TUNE in brackets): the first pick survived the opponent's real bans in 97.1% (68/70) of runs (88.7%), ahead of the baseline, intervals overlap, baseline 90.0% (86.3%). All three planned picks survived in 75.4% (52/69) (57.0%), ahead of the baseline, intervals overlap, baseline 68.1% (64.8%). Planned bans that mattered: 25.2% (53/210) (27.7%), ahead of the baseline, intervals overlap, baseline 19.0% (22.2%). Fearless warning held: 31.4% (22/70) (87.3%), ahead of the baseline, intervals apart, baseline 14.9% (64.9%). What the plan gets right: a planned first pick is almost never banned away (2 of 70 runs on TEST, 24 of 212 on TUNE), and the planned bans hit a champion the opponent used in about 25% of cases on TEST, a little above the 19% of the plain most-played list. What it does not get right: the planned first pick survives about as often as simply opening with our most-played champion, so the pick logic is not shown to add protection; on TUNE all three picks survived less often than the baseline's (57.0% against 64.8%), and the TEST lead on that is within the intervals; about three in four planned bans were champions the opponent neither picked nor banned; and the fearless warning is weak evidence on TUNE, because 134 of its 212 runs named a role where we had no proven champion even before the series, so it could not fail there (14 of 70 on TEST). On the runs where the role still had proven champions at the start, it held in 8 of 56 on TEST (7.4% to 25.7%) and 51 of 78 on TUNE. The sample is small: TEST is 70 runs from 35 games, the two runs of a game share one draft, and most intervals above are 10 to 20 points wide, so a gap of a few points is noise. Where the planner's interval overlaps the baseline's, the two are not told apart. None of this says whether the picks and bans would have won games, and a real opponent might have drafted differently against a different plan.
```

```text
The backtest was rewritten and rerun, showing the planner ahead of the baseline on most metrics on the test set.
```

### Ran python3 - <<'E' p='tests/backtest.js' s=open(p).read() s=s.replace("a planned first pick is almost never banned away (${X.first.n - X.first.model} of ${X.first.n} runs on TEST, ${T.first.n - T.first.model} of ${T.first.n} on TUNE), ","a planned first pick was banned away in only ${X.first.n - X.first.model} of ${X.first.n} runs on TEST (${T.first.n - T.first.model} of ${T.first.n} on TUNE), ") s=s.replace("it held in ${X.thin.model - X.thinTrivial} of ${hard(X)} on TEST (${ci(X.thin.model - X.thinTrivial, hard(X))}) and ${T.thin.model - T.thinTrivial} of ${hard(T)} on TUNE. ","it held in ${X.thin.model - X.thinTrivial} of ${hard(X)} on TEST (${ci(X.thin.model - X.thinTrivial, hard(X))}) and ${T.thin.model - T.thinTrivial} of ${hard(T)} on TUNE (${ci(T.thin.model - T.thinTrivial, hard(T))}). ") open(p,'w').write(s) E node tests/backtest.js | tail -2; node tests/planner.test.js; python tests/fit.py 2>&1 | tail -6; git status --short

```text
Planner hit, baseline missed: 9 runs. Baseline hit, planner missed: 13 runs.
written docs/backtest.md
ok: 360 plans across 9 teams
1366 680 errors []
1440 800 errors []
1920 960 errors []
all fit
 M docs/backtest.md
 M pipeline/backtest.py
 M tests/backtest.js
```

```text
The backtest script was edited to update two report strings, then the backtest, planner tests, and fit script all ran successfully with exit code 0, and the git status shows three modified files.
```
