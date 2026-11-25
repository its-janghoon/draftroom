// Backtest: had a coach used the planner before each real LCS game, how often
// would its prediction of the opponent's picks have been right?
// Run: python pipeline/backtest.py --data ../stl-hackathon-2026-grid-starter
//      node tests/backtest.js        (prints a table, writes docs/backtest.md)
const fs = require('fs'), path = require('path');
const { plan, ROLES, ROLE_NAME } = require('../web/planner.js');

const root = path.join(__dirname, '..');
const file = path.join(root, 'cache', 'backtest-cases.json');
if (!fs.existsSync(file)) {
  console.error('cache/backtest-cases.json is missing. Run: python pipeline/backtest.py --data ../stl-hackathon-2026-grid-starter');
  process.exit(1);
}
const { meta, cases } = JSON.parse(fs.readFileSync(file, 'utf8'));

// naive baseline: the opponent's 3 most-played champions this season that are not locked
function baseline(profile, locked) {
  const played = {};
  for (const role of Object.values(profile.pool))
    for (const [ch, rec] of Object.entries(role)) played[ch] = (played[ch] || 0) + rec[0];
  return Object.entries(played).filter(([ch]) => !locked.includes(ch))
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, 3).map(([ch]) => ch);
}

// our most-played open champions, one per role (a champion counts in the role it played most)
function baselineByRole(profile, locked, k) {
  const played = {};
  for (const ro of ROLES)
    for (const [ch, rec] of Object.entries(profile.pool[ro] || {})) {
      const x = played[ch] || (played[ch] = { ch, ro, g: 0, best: 0 });
      x.g += rec[0];
      if (rec[0] > x.best) { x.best = rec[0]; x.ro = ro; }
    }
  const out = [], used = new Set();
  for (const x of Object.values(played).filter(x => !locked.includes(x.ch)).sort((a, b) => b.g - a.g || (a.ch < b.ch ? -1 : 1))) {
    if (out.length === k) break;
    if (used.has(x.ro)) continue;
    used.add(x.ro); out.push(x.ch);
  }
  return out;
}

// the role a plan calls thin ("Mid is thin. ...") and whether our team really ran out of proven
// champions (5+ games before the series) in a role once every game of the series was played
const ROLE_OF_NAME = Object.fromEntries(Object.entries(ROLE_NAME).map(([r, n]) => [n, r]));
const thinRole = p => ROLE_OF_NAME[p.thin.split(' is thin')[0]];
const ranOut = (profile, role, picked) =>
  Object.entries(profile.pool[role] || {}).filter(([c, rec]) => rec[0] >= 5 && !picked.includes(c)).length === 0;

// Wilson score interval, 95%
function wilson(k, n) {
  if (!n) return [0, 0];
  const z = 1.96, p = k / n, d = 1 + z * z / n, c = p + z * z / (2 * n), h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n));
  return [(c - h) / d, (c + h) / d];
}
const MIN_RUNS = 20;   // fewer runs than this and a share is not worth printing

const SPLIT_DATE = '2026-07-01';   // TUNE = games before it (all design choices), TEST = games from it on (run once, at the end)
const tally = () => ({ runs: 0, hit: 0, predicted: 0, correct: 0 });
const pair = () => ({ n: 0, model: 0, naive: 0 });
const newSplit = () => ({ games: 0, model: tally(), naive: tally(), bans: { planned: 0, mattered: 0 }, onlyModel: 0, onlyNaive: 0,
  first: pair(), three: pair(), mbans: pair(), thin: pair(), noThree: 0, thinTrivial: 0 });
const splits = { TUNE: newSplit(), TEST: newSplit() };
let runs = 0;
const failures = [];

function score(t, predicted, realPicks) {
  const right = predicted.filter(c => realPicks.includes(c)).length;
  t.runs++; t.hit += right > 0; t.predicted += predicted.length; t.correct += right;
  return right > 0;
}

for (const c of cases) {
  const S = splits[c.date < SPLIT_DATE ? 'TUNE' : 'TEST'];
  S.games++;
  const D = { teams: c.profiles, series: [] };   // no head-to-head: it would be this series or later
  for (const us of c.teams) {
    const them = c.teams.find(t => t !== us);
    let p;
    try { p = plan(D, us, them, c.locked, c.blue === us); }
    catch (e) { failures.push(`${c.game_id} (${us} vs ${them}): ${e.message}`); continue; }
    const real = c.actual[them];
    const predicted = p.steps.them_pick.map(s => s.champ);
    const a = score(S.model, predicted, real.picks);
    const b = score(S.naive, baseline(c.profiles[them], c.locked), real.picks);
    S.onlyModel += a && !b; S.onlyNaive += b && !a;
    const mattered = new Set([...real.picks, ...real.bans]);
    for (const s of p.steps.us_ban) { S.bans.planned++; S.bans.mattered += mattered.has(s.champ); }

    // our own picks against what the opponent really banned
    const theirBans = c.actual[them].bans;
    const mine = p.steps.us_pick.map(s => s.champ);
    if (mine.length) {
      const base1 = baselineByRole(c.profiles[us], c.locked, 1);   // single most-played open champion
      S.first.n++; S.first.model += !theirBans.includes(mine[0]); S.first.naive += !theirBans.includes(base1[0]);
    }
    if (mine.length === 3) {
      const base3 = baselineByRole(c.profiles[us], c.locked, 3);
      if (base3.length === 3) {
        S.three.n++; S.three.model += mine.every(ch => !theirBans.includes(ch)); S.three.naive += base3.every(ch => !theirBans.includes(ch));
      }
    } else S.noThree++;

    // bans that mattered, per planned ban, against the opponent's 3 most-played open champions
    const nb = baseline(c.profiles[them], c.locked);
    S.mbans.n += p.steps.us_ban.length;
    S.mbans.model += p.steps.us_ban.filter(s => mattered.has(s.champ)).length;
    S.mbans.naive += nb.filter(ch => mattered.has(ch)).length;

    // fearless warning: the thin role against the whole series as it was really played
    const role = thinRole(p);
    S.thin.n++; S.thin.model += ranOut(c.profiles[us], role, c.series_picks);
    // baseline: any role picked blindly (all 5 roles), so n is 5 per run
    S.thin.nBase = (S.thin.nBase || 0) + ROLES.length;
    S.thin.naive += ROLES.filter(r => ranOut(c.profiles[us], r, c.series_picks)).length;
    S.thinTrivial += !Object.values(c.profiles[us].pool[role] || {}).some(rec => rec[0] >= 5);
    runs++;
  }
}
if (failures.length) { console.error(`planner failed on ${failures.length} runs:\n` + failures.join('\n')); process.exit(1); }

const pct = (n, d) => (d ? (100 * n / d).toFixed(1) : '0.0') + '%';
const frac = (n, d) => `${n}/${d}`;
const cell = (n, d) => `${pct(n, d)} (${frac(n, d)})`;
const dates = cases.map(c => c.date).sort();
const range = `${dates[0]} to ${dates[dates.length - 1]}`;
const rangeOf = f => { const d = cases.map(c => c.date).filter(f).sort(); return d.length ? `${d[0]} to ${d[d.length - 1]}` : 'no games'; };
const ranges = { TUNE: rangeOf(d => d < SPLIT_DATE), TEST: rangeOf(d => d >= SPLIT_DATE) };
const skipped = Object.entries(meta.skipped).map(([why, n]) => `${n} for ${why}`).join(', ');

const ci = (k, n) => { const [lo, hi] = wilson(k, n); return `${(100 * lo).toFixed(1)}% to ${(100 * hi).toFixed(1)}%`; };
const HEAD = ['Measure', 'n', 'Planner', 'Planner 95% CI', 'Baseline n', 'Baseline', 'Baseline 95% CI'];
const row = (name, n, k, nb, kb) => [name, String(n), cell(k, n), ci(k, n), String(nb), cell(kb, nb), ci(kb, nb)];
const skippedRow = (name, n) => [name, String(n), `skipped: under ${MIN_RUNS} runs`, '-', '-', '-', '-'];
const rowsOf = S => [
  row('Opponent picks: hit rate (at least 1 of 3 predicted picks really picked)', S.model.runs, S.model.hit, S.naive.runs, S.naive.hit),
  row('Opponent picks: precision (predicted picks really picked)', S.model.predicted, S.model.correct, S.naive.predicted, S.naive.correct),
  row('1. First pick survives (not banned by the opponent)', S.first.n, S.first.model, S.first.n, S.first.naive),
  row('2. All 3 planned picks survive the opponent\'s bans', S.three.n, S.three.model, S.three.n, S.three.naive),
  row('3. Bans that mattered (opponent picked or banned it, per planned ban)', S.mbans.n, S.mbans.model, S.mbans.n, S.mbans.naive),
  S.thin.n >= MIN_RUNS ? row('4. Fearless warning held (thin role really ran out of proven champions)', S.thin.n, S.thin.model, S.thin.nBase, S.thin.naive)
    : skippedRow('4. Fearless warning held (thin role really ran out of proven champions)', S.thin.n)];
const tableOf = S => [HEAD, ...rowsOf(S)];
const mdTable = t => ['| ' + t[0].join(' | ') + ' |', '|' + t[0].map(() => '---').join('|') + '|', ...t.slice(1).map(r => '| ' + r.join(' | ') + ' |')].join('\n');
const banLine = S => cell(S.bans.mattered, S.bans.planned);

const sign = (m, n) => (m > n ? 'ahead of' : m < n ? 'behind' : 'level with');
function verdict(S) {
  const mh = S.model.hit / S.model.runs, nh = S.naive.hit / S.naive.runs;
  const mp = S.model.correct / S.model.predicted, np = S.naive.correct / S.naive.predicted;
  if (mh < nh && mp < np) return 'loses to the naive baseline on both measures';
  if (mh > nh && mp > np) return 'beats the naive baseline on both measures';
  if (mh === nh && mp === np) return 'scores exactly the same as the naive baseline';
  return `is mixed: ${sign(mh, nh)} the baseline on hit rate and ${sign(mp, np)} it on precision`;
}
const line = (name, S) => `${name} (${S.model.runs} runs): the planner ${verdict(S)}, ${pct(S.model.hit, S.model.runs)} hit rate and ${pct(S.model.correct, S.model.predicted)} precision against ${pct(S.naive.hit, S.naive.runs)} and ${pct(S.naive.correct, S.naive.predicted)}.`;
const T = splits.TUNE, X = splits.TEST;

const beatsTest = X.model.hit > X.naive.hit && X.model.correct / X.model.predicted > X.naive.correct / X.naive.predicted;
// planner against baseline for one pair of counts: which is higher, and whether the 95% intervals overlap
function vs(k, n, kb, nb) {
  const a = k / n, b = kb / nb, [lo, hi] = wilson(k, n), [lob, hib] = wilson(kb, nb);
  const apart = lo > hib || hi < lob;
  return { ahead: a > b, level: a === b, apart, text: a === b ? 'level with the baseline' : `${a > b ? 'ahead of' : 'behind'} the baseline${apart ? ', intervals apart' : ', intervals overlap'}` };
}
const metrics = S => ({
  first: vs(S.first.model, S.first.n, S.first.naive, S.first.n),
  three: vs(S.three.model, S.three.n, S.three.naive, S.three.n),
  mbans: vs(S.mbans.model, S.mbans.n, S.mbans.naive, S.mbans.n),
  thin: S.thin.n >= MIN_RUNS ? vs(S.thin.model, S.thin.n, S.thin.naive, S.thin.nBase) : null });
const mT = metrics(T), mX = metrics(X);
const hard = (S, m) => S.thin.n - S.thinTrivial;   // runs where the thin role was not already empty before the series
const ownParagraph =
  `Our own plan. On TEST (TUNE in brackets): the first pick survived the opponent's real bans in ${cell(X.first.model, X.first.n)} of runs (${pct(T.first.model, T.first.n)}), ${mX.first.text}, baseline ${pct(X.first.naive, X.first.n)} (${pct(T.first.naive, T.first.n)}). ` +
  `All three planned picks survived in ${cell(X.three.model, X.three.n)} (${pct(T.three.model, T.three.n)}), ${mX.three.text}, baseline ${pct(X.three.naive, X.three.n)} (${pct(T.three.naive, T.three.n)}). ` +
  `Planned bans that mattered: ${cell(X.mbans.model, X.mbans.n)} (${pct(T.mbans.model, T.mbans.n)}), ${mX.mbans.text}, baseline ${pct(X.mbans.naive, X.mbans.n)} (${pct(T.mbans.naive, T.mbans.n)}). ` +
  (X.thin.n >= MIN_RUNS
    ? `Fearless warning held: ${cell(X.thin.model, X.thin.n)} (${pct(T.thin.model, T.thin.n)}), ${mX.thin.text}, baseline ${pct(X.thin.naive, X.thin.nBase)} (${pct(T.thin.naive, T.thin.nBase)}). `
    : `The fearless warning was not scored on TEST: only ${X.thin.n} runs, under ${MIN_RUNS}. `) +
  `What the plan gets right: a planned first pick was banned away in only ${X.first.n - X.first.model} of ${X.first.n} runs on TEST (${T.first.n - T.first.model} of ${T.first.n} on TUNE), ` +
  `and the planned bans hit a champion the opponent used in about ${Math.round(100 * X.mbans.model / X.mbans.n)}% of cases on TEST, a little above the ${Math.round(100 * X.mbans.naive / X.mbans.n)}% of the plain most-played list. ` +
  `What it does not get right: the planned first pick survives about as often as simply opening with our most-played champion, so the pick logic is not shown to add protection; ` +
  `on TUNE all three picks survived less often than the baseline's (${pct(T.three.model, T.three.n)} against ${pct(T.three.naive, T.three.n)}), and the TEST lead on that is within the intervals; ` +
  `about three in four planned bans were champions the opponent neither picked nor banned; ` +
  `and the fearless warning is weak evidence on TUNE, because ${T.thinTrivial} of its ${T.thin.n} runs named a role where we had no proven champion even before the series, so it could not fail there ` +
  `(${X.thinTrivial} of ${X.thin.n} on TEST). On the runs where the role still had proven champions at the start, it held in ${X.thin.model - X.thinTrivial} of ${hard(X)} on TEST (${ci(X.thin.model - X.thinTrivial, hard(X))}) and ${T.thin.model - T.thinTrivial} of ${hard(T)} on TUNE (${ci(T.thin.model - T.thinTrivial, hard(T))}). ` +
  `The sample is small: TEST is ${X.model.runs} runs from ${X.games} games, the two runs of a game share one draft, and most intervals above are 10 to 20 points wide, so a gap of a few points is noise. ` +
  `Where the planner's interval overlaps the baseline's, the two are not told apart. None of this says whether the picks and bans would have won games, and a real opponent might have drafted differently against a different plan.`;
const paragraph =
  `${line('On TUNE', T)} ${line('On TEST', X)} TEST was run once, after every choice was fixed on TUNE, and is reported as it came out. ` +
  (beatsTest ? 'The gain held on games the weights never saw. '
    : 'The planner does not beat the baseline on TEST: the gain on TUNE did not carry over to games the weights never saw, so it should be read as fitted to TUNE, not as a real improvement. ') +
  `Head to head on TEST, the planner hit where the baseline missed in ${X.onlyModel} runs and the baseline hit where the planner missed in ${X.onlyNaive}. ` +
  `Of our planned bans, ${banLine(X).split(' ')[0]} on TEST (${banLine(T).split(' ')[0]} on TUNE) were champions the opponent picked or banned themselves in that game; the rest were champions the opponent neither picked nor banned. ` +
  `This shows whether the bans aimed at champions that mattered to them, not that they were good bans. ` +
  `What the numbers do not mean: the real teams ban too, so a correct prediction can be banned away before it is ever picked, and a miss can be a champion that was banned rather than a bad read. ` +
  `The planner only predicts three picks while a team picks five, so precision cannot reach 100% and is not comparable to a full-draft forecast. ` +
  `The score says nothing about whether our own picks or bans would have won games. TEST holds only ${X.model.runs} runs from ${X.games} games, so a gap of a few points is a handful of runs and well within noise; ` +
  `TUNE numbers are flattered because the weights were picked on them. Early cases rest on only 10 to a few dozen prior games per team.`;

console.log(`Backtest ${range}: ${cases.length} games, ${runs} runs (each team as "us")`);
for (const [name, S] of Object.entries(splits)) {
  const table = tableOf(S);
  console.log(`\n${name} (${ranges[name]}): ${S.games} games, ${S.model.runs} runs`);
  const w = HEAD.map((_, i) => Math.max(...table.map(r => r[i].length)));
  for (const r of table) console.log(r.map((x, i) => x.padEnd(w[i])).join('  '));
  console.log(`Planned bans the opponent picked or banned: ${banLine(S)}`);
  console.log(`Planner hit, baseline missed: ${S.onlyModel} runs. Baseline hit, planner missed: ${S.onlyNaive} runs.`);
}

const section = (name, S) => `### ${name}: ${ranges[name]}, ${S.games} games, ${S.model.runs} runs

${mdTable(tableOf(S))}

Planned bans (our 3) that the opponent picked or banned themselves in that game: **${banLine(S)}**.
Of the ${S.thin.n} runs for metric 4, ${S.thinTrivial} named a role in which we had no proven champion even before the series started, so the warning could not fail there.
Planner hit where the baseline missed: ${S.onlyModel} runs. Baseline hit where the planner missed: ${S.onlyNaive} runs.`;

const md = `# Backtest

If a coach had used the planner before each real ${meta.league} ${meta.since.slice(0, 4)} game, how much of the plan would have held up, and how often would its guess of the opponent's picks have been right?

- **Date range:** ${range}
- **Games:** ${cases.length} (of ${meta.league_games_in_range} ${meta.league} games since ${meta.since}; left out: ${skipped})
- **Runs:** ${runs} (every game is planned twice, once with each team as "us")
- **Split by date:** TUNE = games before ${SPLIT_DATE} (${T.games} games, ${T.model.runs} runs), TEST = games from ${SPLIT_DATE} on (${X.games} games, ${X.model.runs} runs)

## Method

- Each team's profile uses only ${meta.league} games dated before the series' scheduled date, and player roles are voted from those same games. A game is skipped if either team has fewer than ${meta.min_games} prior games.
- Champions picked in earlier games of the same series are locked (fearless).
- From each run, the 3 champions in \`steps.them_pick\` are the predicted opponent picks, scored against the opponent's real 5 picks in that game.
- The baseline ignores the draft logic: the opponent's 3 most-played champions this season that are not locked.
- Our own plan is scored against what the opponent really banned in that game. Metric 1 (first pick survives): \`steps.us_pick[0]\` was not among the opponent's real bans; baseline is our single most-played champion this season that is not locked. Metric 2 (all three survive): none of the 3 planned picks was banned by them; baseline is our 3 most-played open champions, one per role (a champion counts in the role it played most). Runs where the planner named fewer than 3 picks, or the baseline could not fill 3 roles, are left out of metric 2 (${T.noThree + X.noThree} runs).
- Metric 3 (bans that mattered): per planned ban, whether the opponent picked or banned it in that game; baseline is the opponent's 3 most-played open champions, scored the same way.
- Metric 4 (fearless warning held): the role named in \`plan.thin\` counts as held when, after every game of the series as really played (this game and later ones, picks of both teams), our team had no champion left in that role with 5+ games before the series. The baseline is the same test for each of the 5 roles (so its n is 5 per run), that is, how often any role picked blindly would have run dry. It is skipped for a split with under ${MIN_RUNS} runs.
- Intervals are 95% Wilson score intervals. They treat every run, pick or ban as independent, which they are not: the two runs of one game share a draft, bans of one run share a plan, and games of one series share the same locks. The true uncertainty is wider than printed.
- Head-to-head history is left out of the planner input, because it would include this series or later ones.
- Every design decision and weight was chosen on TUNE only. TEST was run once, after the predictor was frozen, and is reported as it came out.

## What changed in the predictor

Before: the opponent's first-pick habit, then their most-played champions, one per role.

Now (\`predictPicks\` in \`web/planner.js\`, the same code the app uses): every champion still open scores the sum of three shares of the opponent's games before this series:

- **Season:** games played with it, divided by their games this season.
- **Recent:** games played with it in their last ${meta.recent || 10} games, divided by ${meta.recent || 10}.
- **First pick:** times they opened a draft with it, divided by their games this season.

The top 3 are named, at most one per role. The slot reason reads like "Josedeodo, 6 of last 10 games, first pick 2x". Profiles gained a per-champion \`recent\` count (\`pipeline/build.py\`).

Tried on TUNE and left out: a win rate with a prior ((wins+2)/(games+4)) did not help; subtracting how often they ban a champion made it worse; a minimum-games filter made it worse; dropping any one of the three shares scored lower. Recent windows of 5 to 20 games were tried and 10 kept. One pick per role scored about the same as no limit, so the existing rule stayed. Several blends within a point or two of each other were indistinguishable on TUNE; the simplest equal-weight blend was kept.

## Results

${section('TUNE', T)}

${section('TEST', X)}

## What this means

${paragraph}

${ownParagraph}

Rerun it:

\`\`\`bash
python pipeline/backtest.py --data ../stl-hackathon-2026-grid-starter
node tests/backtest.js
\`\`\`
`;
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs', 'backtest.md'), md);
console.log('written docs/backtest.md');
