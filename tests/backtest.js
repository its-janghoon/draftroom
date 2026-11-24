// Backtest: had a coach used the planner before each real LCS game, how often
// would its prediction of the opponent's picks have been right?
// Run: python pipeline/backtest.py --data ../stl-hackathon-2026-grid-starter
//      node tests/backtest.js        (prints a table, writes docs/backtest.md)
const fs = require('fs'), path = require('path');
const { plan } = require('../web/planner.js');

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

const SPLIT_DATE = '2026-07-01';   // TUNE = games before it (all design choices), TEST = games from it on (run once, at the end)
const tally = () => ({ runs: 0, hit: 0, predicted: 0, correct: 0 });
const newSplit = () => ({ games: 0, model: tally(), naive: tally(), bans: { planned: 0, mattered: 0 }, onlyModel: 0, onlyNaive: 0 });
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

const tableOf = S => [['Measure', 'Planner', 'Baseline (3 most played, not locked)'],
  ['Hit rate (at least 1 of 3 predicted picks really picked)', cell(S.model.hit, S.model.runs), cell(S.naive.hit, S.naive.runs)],
  ['Precision (predicted picks really picked)', cell(S.model.correct, S.model.predicted), cell(S.naive.correct, S.naive.predicted)]];
const mdTable = t => ['| ' + t[0].join(' | ') + ' |', '|---|---|---|', ...t.slice(1).map(r => '| ' + r.join(' | ') + ' |')].join('\n');
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
  const w = [Math.max(...table.map(r => r[0].length)), Math.max(...table.map(r => r[1].length))];
  for (const r of table) console.log(`${r[0].padEnd(w[0])}  ${r[1].padEnd(w[1])}  ${r[2]}`);
  console.log(`Planned bans the opponent picked or banned: ${banLine(S)}`);
  console.log(`Planner hit, baseline missed: ${S.onlyModel} runs. Baseline hit, planner missed: ${S.onlyNaive} runs.`);
}

const section = (name, S) => `### ${name}: ${ranges[name]}, ${S.games} games, ${S.model.runs} runs

${mdTable(tableOf(S))}

Planned bans (our 3) that the opponent picked or banned themselves in that game: **${banLine(S)}**.
Planner hit where the baseline missed: ${S.onlyModel} runs. Baseline hit where the planner missed: ${S.onlyNaive} runs.`;

const md = `# Backtest

If a coach had used the planner before each real ${meta.league} ${meta.since.slice(0, 4)} game, how often would its prediction of the opponent's picks have been right?

- **Date range:** ${range}
- **Games:** ${cases.length} (of ${meta.league_games_in_range} ${meta.league} games since ${meta.since}; left out: ${skipped})
- **Runs:** ${runs} (every game is planned twice, once with each team as "us")
- **Split by date:** TUNE = games before ${SPLIT_DATE} (${T.games} games, ${T.model.runs} runs), TEST = games from ${SPLIT_DATE} on (${X.games} games, ${X.model.runs} runs)

## Method

- Each team's profile uses only ${meta.league} games dated before the series' scheduled date, and player roles are voted from those same games. A game is skipped if either team has fewer than ${meta.min_games} prior games.
- Champions picked in earlier games of the same series are locked (fearless).
- From each run, the 3 champions in \`steps.them_pick\` are the predicted opponent picks, scored against the opponent's real 5 picks in that game.
- The baseline ignores the draft logic: the opponent's 3 most-played champions this season that are not locked.
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

Rerun it:

\`\`\`bash
python pipeline/backtest.py --data ../stl-hackathon-2026-grid-starter
node tests/backtest.js
\`\`\`
`;
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs', 'backtest.md'), md);
console.log('written docs/backtest.md');
