// Draft Room loader: a port of pipeline/extract.py and pipeline/build.py that runs in the
// browser (or in Node, for tests/loader.check.js). It reads the official starter data,
// extracts the same facts per game, and builds the same profiles and series as web/data.js.
// Keep the rules identical to the Python scripts; change both together.
//
// The data goes from GitHub to this browser only. Nothing is uploaded anywhere.
(function (root) {
  const REPO = 'cloud9esports/stl-hackathon-2026-grid-starter';
  const RAW = `https://raw.githubusercontent.com/${REPO}/main/`;
  const LATEST = `https://api.github.com/repos/${REPO}/commits/main`;
  const ROLES = ['top', 'jungle', 'mid', 'adc', 'support'];
  const RECENT = 10;
  const TAGS = { 'Cloud9 Kia': 'C9', 'Team Liquid Alienware': 'TL', 'FlyQuest': 'FLY', 'LYON': 'LYON', 'Sentinels': 'SEN',
    'Shopify Rebellion': 'SR', 'Disguised': 'DSG', 'Dignitas': 'DIG', '100 Thieves': '100' };
  const SHORT = { 'Team Liquid Alienware': 'Team Liquid' };
  const fz = typeof module !== 'undefined' && module.exports ? require('./vendor/fzstd.js') : root.fzstd;

  // ---------- small Python-compatible helpers ----------
  // Python's round(): halves go to the even number
  function pyRound(x) {
    const f = Math.floor(x), d = x - f;
    if (d < 0.5) return f;
    if (d > 0.5) return f + 1;
    return f % 2 === 0 ? f : f + 1;
  }
  // datetime.fromisoformat(s).timestamp(): whole microseconds, divided once
  function ts(s) {
    const m = /^(\d{4})-(\d\d)-(\d\d)[T ](\d\d):(\d\d):(\d\d)(?:\.(\d+))?(Z|[+-]\d\d:?\d\d)?$/.exec(s);
    if (!m) throw new Error(`bad timestamp ${s}`);
    let micro = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) * 1000 + +((m[7] || '').padEnd(6, '0').slice(0, 6) || 0);
    if (m[8] && m[8] !== 'Z') {
      const sign = m[8][0] === '-' ? -1 : 1, hm = m[8].slice(1).replace(':', '');
      micro -= sign * (+hm.slice(0, 2) * 60 + +hm.slice(2)) * 60e6;
    }
    return micro / 1e6;
  }
  // csv.DictReader
  function parseCsv(text) {
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false; } else field += c;
      } else if (c === '"') quoted = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); field = '';
        if (row.length > 1 || row[0] !== '') rows.push(row);
        row = [];
      } else field += c;
    }
    if (field !== '' || row.length) { row.push(field); if (row.length > 1 || row[0] !== '') rows.push(row); }
    const head = rows.shift() || [];
    return rows.map(r => Object.fromEntries(head.map((h, i) => [h.replace(/^\uFEFF/, ''), r[i] === undefined ? '' : r[i]])));
  }
  const truthy = o => !!o && (typeof o !== 'object' || Object.keys(o).length > 0);

  // ---------- extract.py ----------
  // Rough Summoner's Rift area for a point in game units.
  function zone(p) {
    if (!truthy(p)) return null;
    const x = p.x, y = p.y;
    if (x < 3000 && y > 6000 || y > 12000 && x < 9000) return 'top';
    if (y < 3000 && x > 6000 || x > 12000 && y < 9000) return 'bot';
    if (Math.abs(x - y) < 1800) return 'mid';
    return 'jungle';
  }

  function seriesGames(text, row) {
    const games = [];
    let cur = null;
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      const env = JSON.parse(line);
      const at = ts(env.occurredAt);
      for (const ev of env.events) {
        const t = ev.type;
        if (t === 'team-banned-character' || t === 'team-picked-character') {
          for (const g of (ev.seriesStateDelta || {}).games || []) {
            for (const d of g.draftActions || []) {
              if (cur === null || cur.game_id !== g.id) {
                cur = { series_id: row.series_id, event: row.event, date: row.scheduled_start.slice(0, 10), game_id: g.id, draft: [], start: null };
                games.push(cur);
              }
              cur.draft.push([d.sequenceNumber, d.type, d.drafter.id, d.draftable.name]);
            }
          }
          continue;
        }
        if (t === 'series-started-game' && cur !== null) cur.start = at;
        if (t === 'series-!started-game') {            // a rolled-back (abandoned) game
          const gid = (ev.target || {}).id;
          for (let i = games.length - 1; i >= 0; i--) if (games[i].game_id === gid) games.splice(i, 1);
          cur = games.length ? games[games.length - 1] : null;
        }
        if (cur === null || cur.start === null) continue;
        const sec = pyRound(at - cur.start);
        const actor = ev.actor || {};
        const a = actor.state || {};
        const team = a.teamId, pos = (a.game || {}).position;
        const tgt = ev.target || {};
        const tid = tgt.id;
        if (actor.type === 'player' && truthy(pos) && sec >= 90 && sec <= 330) {
          const lane = (cur.lane = cur.lane || {})[a.name] || (cur.lane[a.name] = {});
          const zz = zone(pos);
          lane[zz] = (lane[zz] || 0) + 1;
        }
        if (t === 'player-purchased-item' && sec < 60) {
          const items = (((a.game || {}).inventory || {}).items || []).map(i => i.name);
          const list = (cur.start_items = cur.start_items || {})[a.name] || (cur.start_items[a.name] = []);
          for (const i of items) if (i) list.push(i);
        }
        if (t === 'player-killed-player' && !('first_blood' in cur)) {
          const v = tgt.state || {};
          cur.first_blood = { sec, team: team ?? null, zone: zone(pos), killer: a.name ?? null, victim: v.name ?? null,
            victim_id: tid ?? null, pos: truthy(pos) ? [pyRound(pos.x), pyRound(pos.y)] : null };
        } else if (t === 'player-killed-BTierNPC' && tid && tid.startsWith('riftScuttler') && !('first_scuttle' in cur)) {
          cur.first_scuttle = { sec, team: team ?? null, side: tid.endsWith('Top') ? 'top' : 'bot', who: a.name ?? null };
        } else if (t === 'player-killed-ATierNPC' && tid && tid.endsWith('Drake') && !('first_dragon' in cur)) {
          cur.first_dragon = { sec, team: team ?? null, kind: tid };
        } else if (t === 'player-killed-ATierNPC' && tid && tid.startsWith('voidGrub') && !('first_grub' in cur)) {
          cur.first_grub = { sec, team: team ?? null };
        } else if (t === 'team-won-game') {
          const st = tgt.state || {};
          for (const tm of (tgt.stateDelta || {}).teams || []) if (tm.won) cur.winner = tm.id;
          cur.length = (st.clock || {}).currentSeconds ?? null;
          cur.gold = Object.fromEntries((st.teams || []).map(tm => [tm.id, tm.netWorth ?? null]));
        }
      }
    }
    for (const g of games) delete g.start;
    return games;
  }

  // a remake keeps the same draft as the next game in the series: keep the replay only
  function dropRemakes(games) {
    return games.filter((g, i) => !(i + 1 < games.length && games[i + 1].series_id === g.series_id &&
      JSON.stringify(games[i + 1].draft) === JSON.stringify(g.draft)));
  }

  // ---------- build.py ----------
  const mostCommon = m => { let best = null, n = -1; for (const [k, v] of m) if (v > n) { best = k; n = v; } return best; };
  const bump = (m, k, by = 1) => m.set(k, (m.get(k) || 0) + by);

  // Guess a player's role from where they stood in minutes 1:30-5:30 and their starting item.
  function roleOf(g, player) {
    const lane = (g.lane || {})[player] || {};
    const items = (g.start_items || {})[player] || [];
    const doran = items.filter(i => i.startsWith('Doran'));
    let mode = null, best = -1;
    for (const k of Object.keys(lane)) if (['top', 'mid', 'bot'].includes(k) && lane[k] > best) { mode = k; best = lane[k]; }
    const vals = Object.values(lane);
    if (doran.length) {
      if (doran.includes("Doran's Bow") || mode === 'bot') return 'adc';
      return mode === 'top' || mode === 'mid' ? mode : null;
    }
    if (vals.length && mode === 'bot' && (lane.bot || 0) >= Math.max(...vals)) return 'support';
    return vals.length ? 'jungle' : null;
  }

  // Each player's main role, voted over the given games.
  function voteRoles(games, roster) {
    const votes = new Map();
    for (const g of games)
      for (const r of roster.get(g.game_id) || []) {
        const ro = roleOf(g, r.player_name);
        if (ro) { if (!votes.has(r.player_id)) votes.set(r.player_id, new Map()); bump(votes.get(r.player_id), ro); }
      }
    return new Map([...votes].map(([p, c]) => [p, mostCommon(c)]));
  }

  // One profile per team that has at least minGames of the given games.
  function buildProfiles(games, roster, mainRole, names, minGames = 10, recent = RECENT) {
    const byTeam = new Map();
    [...games].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)).forEach(g => {
      for (const t of new Set(g.draft.map(d => d[2]))) { if (!byTeam.has(t)) byTeam.set(t, []); byTeam.get(t).push(g); }
    });
    const teams = {};
    for (const [tid, tg] of byTeam) {
      if (tg.length < minGames) continue;
      const pool = Object.fromEntries(ROLES.map(r => [r, {}]));
      const champRole = {}, players = Object.fromEntries(ROLES.map(r => [r, new Map()]));
      const bans = new Map(), firstPick = new Map(), e = new Map(), last = new Map();
      const fd = [], fbGot = [], fbGave = [];
      for (const g of tg.slice(-recent))
        for (const r of roster.get(g.game_id) || []) if (r.team_id === tid && mainRole.get(r.player_id)) bump(last, r.character_name);
      for (const g of tg) {
        const won = g.winner === tid ? 1 : 0;
        const rows = roster.get(g.game_id) || [];
        const mine = rows.find(r => r.team_id === tid);
        const side = mine ? mine.side : null;
        for (const r of rows) {
          if (r.team_id === tid && mainRole.get(r.player_id)) {
            const ro = mainRole.get(r.player_id);
            const rec = pool[ro][r.character_name] || (pool[ro][r.character_name] = [0, 0]);
            rec[0] += 1; rec[1] += won;
            if (!(r.character_name in champRole)) champRole[r.character_name] = ro;
            bump(players[ro], r.player_name);
          }
        }
        for (const [, typ, who, ch] of g.draft) if (typ === 'ban' && who === tid) bump(bans, ch);
        const ours = g.draft.filter(d => d[1] === 'pick' && d[2] === tid);
        if (ours.length) bump(firstPick, ours[0][3]);
        const fb = g.first_blood;
        if (fb && fb.team === tid) {
          bump(e, 'fb'); bump(e, 'fb_jungle', fb.zone === 'jungle' ? 1 : 0);
          fbGot.push(fb.sec);
        } else if (fb) {
          const p = fb.pos || [null, null];
          fbGave.push([fb.zone, mainRole.get(fb.victim_id) ?? null, fb.victim, p[0], p[1], side]);
        }
        const d = g.first_dragon;
        if (d) { fd.push(d.sec); bump(e, 'drag', d.team === tid ? 1 : 0); }
        const gr = g.first_grub;
        bump(e, 'grub', gr && gr.team === tid ? 1 : 0);
      }
      const name = names.get(tid) ?? tid;
      teams[tid] = {
        id: tid, name: SHORT[name] || name, tag: TAGS[name] || name.slice(0, 3).toUpperCase(), n: tg.length,
        recent: Object.fromEntries(last), recent_n: Math.min(recent, tg.length),
        players: Object.fromEntries(ROLES.filter(r => players[r].size).map(r => [r, mostCommon(players[r])])),
        pool, role: champRole, bans: Object.fromEntries(bans), first_pick: Object.fromEntries(firstPick),
        e: Object.fromEntries(e), fd_avg: fd.length ? pyRound(fd.reduce((x, y) => x + y, 0) / fd.length) : null,
        fb_got: fbGot.sort((x, y) => x - y), fb_gave: fbGave,
      };
    }
    return teams;
  }

  // The series files a build needs: the league's, from the date on. Nothing else is fetched.
  function neededSeries(seriesRows, league = 'LCS', since = '2026-01-01') {
    return seriesRows.filter(r => r.event.includes(league) && r.scheduled_start.slice(0, 10) >= since);
  }

  // meta: { series: [csv rows], rosters, teams, characters }; games: games of the needed series, in series.csv order
  function build(meta, games, league = 'LCS', since = '2026-01-01') {
    const gi = new Map(games.map(g => [g.game_id, g]));
    const roster = new Map();
    for (const r of meta.rosters) if (r.title === 'lol') { if (!roster.has(r.game_id)) roster.set(r.game_id, []); roster.get(r.game_id).push(r); }
    const names = new Map(meta.teams.filter(r => r.title === 'lol').map(r => [r.team_id, r.name]));
    const champions = [...new Set(meta.characters.filter(r => r.title === 'lol').map(r => r.name))].sort();

    // each player's main role, voted over the games we have
    const mainRole = voteRoles([...roster.keys()].filter(id => gi.has(id)).map(id => gi.get(id)), roster);
    const season = games.filter(g => g.date >= since && g.winner && g.event.includes(league));
    const teams = buildProfiles(season, roster, mainRole, names, 10);

    // the real series, so a coach can load one and replay it
    const bySeries = new Map();
    for (const g of season) { if (!bySeries.has(g.series_id)) bySeries.set(g.series_id, []); bySeries.get(g.series_id).push(g); }
    const series = [];
    for (const [sid, gs] of bySeries) {
      const pair = [...new Set(gs[0].draft.map(d => d[2]))].sort();
      if (pair.length !== 2 || !pair.every(t => t in teams)) continue;
      series.push({
        id: sid, date: gs[0].date, event: gs[0].event, teams: pair,
        games: gs.map(g => {
          const sides = {};
          for (const r of roster.get(g.game_id) || []) sides[r.team_id] = r.side;
          return {
            winner: g.winner, length: g.length ?? null, gold: g.gold ?? null, sides,
            picks: Object.fromEntries(pair.map(t => [t, g.draft.filter(d => d[1] === 'pick' && d[2] === t).map(d => d[3])])),
            bans: Object.fromEntries(pair.map(t => [t, g.draft.filter(d => d[1] === 'ban' && d[2] === t).map(d => d[3])])),
            first_scuttle: g.first_scuttle ?? null, first_blood: g.first_blood ?? null, first_dragon: g.first_dragon ?? null,
          };
        }),
      });
    }
    series.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    return { season: `${league} ${since.slice(0, 4)}`, champions, teams, series };
  }

  // ---------- fetching ----------
  // A source reads a path under the starter repo: { text(path), bytes(path) }.
  function remote(signal) {
    const get = async path => {
      const res = await fetch(RAW + path, { signal });
      if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
      return res;
    };
    return { text: async p => (await get(p)).text(), bytes: async p => new Uint8Array(await (await get(p)).arrayBuffer()) };
  }

  const decode = bytes => new TextDecoder('utf-8').decode(fz.decompress(bytes));

  // Download (or read) everything the build needs. onProgress({ phase, done, total }) is called as series arrive.
  async function load(source, { league = 'LCS', since = '2026-01-01', concurrency = 6, onProgress, signal } = {}) {
    const stop = () => { if (signal && signal.aborted) throw new DOMException('Cancelled', 'AbortError'); };
    const say = (phase, done, total) => onProgress && onProgress({ phase, done, total });
    say('meta', 0, 0);
    const [series, rosters, teams, characters] = (await Promise.all(
      ['lol/series.csv', 'meta/rosters.csv', 'meta/teams.csv', 'meta/characters.csv'].map(p => source.text(p)))).map(parseCsv);
    stop();
    const need = neededSeries(series, league, since);
    const results = new Array(need.length);
    let next = 0, done = 0;
    say('series', 0, need.length);
    async function worker() {
      while (next < need.length) {
        stop();
        const i = next++, row = need[i];
        results[i] = dropRemakes(seriesGames(decode(await source.bytes(row.file)), row));
        say('series', ++done, need.length);
      }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, need.length) }, worker));
    stop();
    return build({ series, rosters, teams, characters }, results.flat(), league, since);
  }

  // ---------- browser: latest commit and the IndexedDB cache ----------
  async function latestSha(signal) {
    const res = await fetch(LATEST, { signal, headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error(`GitHub answered HTTP ${res.status}`);
    return (await res.json()).sha;
  }
  function db() {
    return new Promise((resolve, reject) => {
      const open = indexedDB.open('draftroom', 1);
      open.onupgradeneeded = () => open.result.createObjectStore('data');
      open.onsuccess = () => resolve(open.result);
      open.onerror = () => reject(open.error);
    });
  }
  async function store(mode, fn) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const tx = d.transaction('data', mode), req = fn(tx.objectStore('data'));
      tx.oncomplete = () => { d.close(); resolve(req && req.result); };
      tx.onerror = tx.onabort = () => { d.close(); reject(tx.error); };
    });
  }
  const cache = {
    // { sha, league, since, payload } or undefined
    get: () => store('readonly', s => s.get('official')).catch(() => undefined),
    put: (sha, league, since, payload) => store('readwrite', s => s.put({ sha, league, since, payload }, 'official')),
    clear: () => store('readwrite', s => s.delete('official')),
  };

  const api = { load, build, buildProfiles, voteRoles, roleOf, seriesGames, dropRemakes, neededSeries, parseCsv, zone, ts, pyRound,
    remote, latestSha, cache, RAW, LATEST };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Loader = api;
})(this);
