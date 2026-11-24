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

const tally = () => ({ runs: 0, hit: 0, predicted: 0, correct: 0 });
const model = tally(), naive = tally();
const bans = { planned: 0, mattered: 0 };
let onlyModel = 0, onlyNaive = 0, runs = 0;
const failures = [];

function score(t, predicted, realPicks) {
  const right = predicted.filter(c => realPicks.includes(c)).length;
  t.runs++; t.hit += right > 0; t.predicted += predicted.length; t.correct += right;
  return right > 0;
}

for (const c of cases) {
  const D = { teams: c.profiles, series: [] };   // no head-to-head: it would be this series or later
  for (const us of c.teams) {
    const them = c.teams.find(t => t !== us);
    let p;
    try { p = plan(D, us, them, c.locked, c.blue === us); }
    catch (e) { failures.push(`${c.game_id} (${us} vs ${them}): ${e.message}`); continue; }
    const real = c.actual[them];
    const predicted = p.steps.them_pick.map(s => s.champ);
    const a = score(model, predicted, real.picks);
    const b = score(naive, baseline(c.profiles[them], c.locked), real.picks);
    onlyModel += a && !b; onlyNaive += b && !a;
    const mattered = new Set([...real.picks, ...real.bans]);
    for (const s of p.steps.us_ban) { bans.planned++; bans.mattered += mattered.has(s.champ); }
    runs++;
  }
}
if (failures.length) { console.error(`planner failed on ${failures.length} runs:\n` + failures.join('\n')); process.exit(1); }

const pct = (n, d) => (d ? (100 * n / d).toFixed(1) : '0.0') + '%';
const frac = (n, d) => `${n}/${d}`;
const dates = cases.map(c => c.date).sort();
const range = `${dates[0]} to ${dates[dates.length - 1]}`;
const skipped = Object.entries(meta.skipped).map(([why, n]) => `${n} for ${why}`).join(', ');

const rows = [
  ['Hit rate (at least 1 of 3 predicted picks really picked)', model.hit, model.runs, naive.hit, naive.runs],
  ['Precision (predicted picks really picked)', model.correct, model.predicted, naive.correct, naive.predicted],
];
const table = [['Measure', 'Planner', 'Baseline (3 most played, not locked)'],
  ...rows.map(r => [r[0], `${pct(r[1], r[2])} (${frac(r[1], r[2])})`, `${pct(r[3], r[4])} (${frac(r[3], r[4])})`])];
const banLine = `${pct(bans.mattered, bans.planned)} (${frac(bans.mattered, bans.planned)})`;

const mh = model.hit / model.runs, nh = naive.hit / naive.runs;
const mp = model.correct / model.predicted, np = naive.correct / naive.predicted;
const sign = (m, n) => (m > n ? 'ahead of' : m < n ? 'behind' : 'level with');
let verdict;
if (mh < nh && mp < np) verdict = 'The planner loses to the naive baseline on both measures. Its draft logic (first-pick habit, one pick per role, leaving out champions already named in the plan) did not predict the opponent better than simply listing what they play most.';
else if (mh > nh && mp > np) verdict = 'The planner beats the naive baseline on both measures.';
else if (mh === nh && mp === np) verdict = 'The planner and the naive baseline score exactly the same.';
else verdict = `The result is mixed: the planner is ${sign(mh, nh)} the baseline on hit rate and ${sign(mp, np)} it on precision.`;

const paragraph =
  `In ${model.runs} runs the planner named at least one champion the opponent really picked ${pct(model.hit, model.runs)} of the time, ` +
  `and ${pct(model.correct, model.predicted)} of its individual predictions were right. The baseline scores ${pct(naive.hit, naive.runs)} and ` +
  `${pct(naive.correct, naive.predicted)}. ${verdict} Head to head, the planner hit where the baseline missed in ${onlyModel} runs and the baseline hit where ` +
  `the planner missed in ${onlyNaive}. ` +
  `${banLine.split(' ')[0]} of our planned bans were champions the opponent picked or banned themselves in that game; ${pct(bans.planned - bans.mattered, bans.planned)} were champions the opponent neither picked nor banned. ` +
  `This shows whether the bans aimed at champions that mattered to them, not that they were good bans. ` +
  `What the numbers do not mean: the real teams ban too, so a correct prediction can be banned away before it is ever picked, and a miss can be a champion that was banned rather than a bad read. ` +
  `The planner only predicts three picks while a team picks five, so precision cannot reach 100% and is not comparable to a full-draft forecast. ` +
  `The score says nothing about whether our own picks or bans would have won games, and ${model.runs} runs from one season is a small sample, ` +
  `so differences of a few points are within noise. Early cases rest on only 10 to a few dozen prior games per team.`;


console.log(`Backtest ${range}: ${cases.length} games, ${runs} runs (each team as "us")`);
const w = [Math.max(...table.map(r => r[0].length)), Math.max(...table.map(r => r[1].length))];
for (const r of table) console.log(`${r[0].padEnd(w[0])}  ${r[1].padEnd(w[1])}  ${r[2]}`);
console.log(`Planned bans the opponent picked or banned: ${banLine}`);
console.log(`Planner hit, baseline missed: ${onlyModel} runs. Baseline hit, planner missed: ${onlyNaive} runs.`);

const md = `# Backtest

If a coach had used the planner before each real ${meta.league} ${meta.since.slice(0, 4)} game, how often would its prediction of the opponent's picks have been right?

- **Date range:** ${range}
- **Games:** ${cases.length} (of ${meta.league_games_in_range} ${meta.league} games since ${meta.since}; left out: ${skipped})
- **Runs:** ${runs} (every game is planned twice, once with each team as "us")

## Method

- Each team's profile uses only ${meta.league} games dated before the series' scheduled date, and player roles are voted from those same games. A game is skipped if either team has fewer than ${meta.min_games} prior games.
- Champions picked in earlier games of the same series are locked (fearless).
- From each run, the 3 champions in \`steps.them_pick\` are the predicted opponent picks, scored against the opponent's real 5 picks in that game.
- The baseline ignores the draft logic: the opponent's 3 most-played champions this season that are not locked.
- Head-to-head history is left out of the planner input, because it would include this series or later ones.

## Results

${'| ' + table[0].join(' | ') + ' |'}
|---|---|---|
${table.slice(1).map(r => '| ' + r.join(' | ') + ' |').join('\n')}

Planned bans (our 3) that the opponent picked or banned themselves in that game: **${banLine}**.

Planner hit where the baseline missed: ${onlyModel} runs. Baseline hit where the planner missed: ${onlyNaive} runs.

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
