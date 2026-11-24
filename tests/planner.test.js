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
