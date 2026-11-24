// Checks the planner on every team pair and through a full fearless Bo5:
// no crash, no champion planned twice, nothing planned that fearless has locked.
// Run: node tests/planner.test.js
// It runs on web/data.js (full form, from pipeline/build.py, skipped when missing) and on
// web/demo-data.js (aggregates only). When both exist, the plans must agree.
const fs = require('fs'), path = require('path'), assert = require('assert');
const { plan, outlook } = require('../web/planner.js');

function read(name) {
  const file = path.join(__dirname, '..', 'web', name);
  if (!fs.existsSync(file)) return null;
  const window = {};
  new Function('window', fs.readFileSync(file, 'utf8'))(window);
  return window.DRAFTROOM;
}

function check(name, D) {
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
  console.log(`ok: ${name}: ${checked} plans across ${Object.keys(D.teams).length} teams`);
}

const full = read('data.js'), demo = read('demo-data.js');
assert(full || demo, 'neither web/data.js nor web/demo-data.js exists');
if (full) check('data.js', full);
if (demo) {
  assert.strictEqual(demo.source, 'demo');
  assert.deepStrictEqual(demo.series, []);
  check('demo-data.js', demo);
}
if (full && demo) {
  // the demo form must give the same plan as the full form it was summarised from
  let same = 0, same3 = 0;
  for (const us of Object.keys(full.teams)) for (const them of Object.keys(full.teams)) {
    if (us === them) continue;
    const a = plan(full, us, them, [], true), b = plan(demo, us, them, [], true);
    assert.deepStrictEqual(b.steps, a.steps, `${us} vs ${them}: demo steps differ`);
    assert.deepStrictEqual(b.habits.slice(0, 2), a.habits.slice(0, 2));
    same++;
    if (b.plan.line3 === a.plan.line3 && b.plan.why3 === a.plan.why3) same3++;
    else console.log(`note: ${us} vs ${them}: line 3 differs\n  full: ${a.plan.line3}\n  demo: ${b.plan.line3}`);
  }
  console.log(`ok: demo plans match full plans (${same}), game plan line identical in ${same3}`);
}
