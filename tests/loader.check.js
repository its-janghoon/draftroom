// Runs web/loader.js (the browser port of extract.py and build.py) on a local copy of the
// starter repo instead of fetch, and compares the result with web/data.js from pipeline/build.py.
// Needs Node 18+ and web/data.js.
//
//   node tests/loader.check.js [path to the starter repo]     (default ../stl-hackathon-2026-grid-starter)
const fs = require('fs'), path = require('path');
const Loader = require('../web/loader.js');

const dir = path.resolve(process.argv[2] || path.join(__dirname, '..', '..', 'stl-hackathon-2026-grid-starter'));
const source = {
  text: async p => fs.readFileSync(path.join(dir, p), 'utf8'),
  bytes: async p => new Uint8Array(fs.readFileSync(path.join(dir, p))),
};

// the first place two values differ, as a path, or null
function firstDiff(a, b, at = '') {
  if (a === b) return null;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return `${at || 'value'}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`;
  if (Array.isArray(a) !== Array.isArray(b)) return `${at}: list vs object`;
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  for (const k of keys) {
    if (!(k in a)) return `${at}.${k}: missing from loader`;
    if (!(k in b)) return `${at}.${k}: missing from data.js`;
    const d = firstDiff(a[k], b[k], `${at}.${k}`);
    if (d) return d;
  }
  return null;
}

(async () => {
  const window = {};
  new Function('window', fs.readFileSync(path.join(__dirname, '..', 'web', 'data.js'), 'utf8'))(window);
  const ref = window.DRAFTROOM;
  const t0 = Date.now();
  let lastLine = '';
  const got = await Loader.load(source, {
    onProgress: p => { if (p.phase === 'series' && p.done === p.total) lastLine = `${p.total} series`; },
  });
  console.log(`loaded ${lastLine} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);

  const same = (name, a, b) => { const d = firstDiff(a, b, name); if (d) { console.log('first difference: ' + d); process.exit(1); } };
  same('team ids', Object.keys(got.teams).sort(), Object.keys(ref.teams).sort());
  for (const id of Object.keys(ref.teams)) {
    same(`team ${id} games`, got.teams[id].n, ref.teams[id].n);
    same(`team ${id} pool`, got.teams[id].pool, ref.teams[id].pool);
  }
  // then everything else: profiles, champions, series
  same('teams', got.teams, ref.teams);
  same('champions', got.champions, ref.champions);
  same('series', got.series, ref.series);
  same('season', got.season, ref.season);
  console.log('loader matches build.py');
})().catch(e => { console.error(e); process.exit(1); });
