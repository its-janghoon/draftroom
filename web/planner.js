// Draft Room planner: turns two team profiles and the champions fearless has
// already locked into a plan for the next game. Every number it shows comes
// from the profiles; nothing here is a model guess.
(function (root) {
  const ROLES = ['top', 'jungle', 'mid', 'adc', 'support'];
  const ROLE_NAME = { top: 'Top', jungle: 'Jungle', mid: 'Mid', adc: 'Bot', support: 'Support' };
  const ROLE_PERSON = { top: 'top laner', jungle: 'jungler', mid: 'mid laner', adc: 'bot laner', support: 'support' };
  const PLACE = { top: 'top lane', mid: 'mid lane', bot: 'bot lane', jungle: 'jungle' };
  // pro draft order: blue bans 1,3,5 and picks 7,10,11; red bans 2,4,6 and picks 8,9,12
  const STEPS = { blue: { ban: [1, 3, 5], pick: [7, 10, 11] }, red: { ban: [2, 4, 6], pick: [8, 9, 12] } };

  const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const wl = ([g, w]) => `${w}-${g - w}`;
  const own = n => n + (n.endsWith('s') ? "'" : "'s");
  const top = counter => Object.entries(counter).sort((a, b) => b[1] - a[1]);

  // a team's champions still open, best record first (wins minus losses, then games)
  function ranked(p, taken, minGames) {
    const out = [];
    for (const ro of ROLES)
      for (const [ch, rec] of Object.entries(p.pool[ro] || {}))
        if (!taken.has(ch) && rec[0] >= minGames) out.push({ ch, ro, rec, score: 2 * rec[1] - rec[0], g: rec[0] });
    return out.sort((a, b) => b.score - a.score || b.g - a.g);
  }
  // fall back to thinner samples late in a series, when fearless has eaten the pool
  function rankedAny(p, taken, mins) {
    for (const m of mins) { const r = ranked(p, taken, m); if (r.length >= 3) return r; }
    return ranked(p, taken, 1);
  }

  function plan(D, usId, themId, locked, usBlue) {
    const us = D.teams[usId], op = D.teams[themId];
    const taken = new Set(locked);
    const usSide = usBlue ? 'blue' : 'red', themSide = usBlue ? 'red' : 'blue';

    // 1. our bans: their best champions still open; if none of them win, their most played
    const pool = rankedAny(op, taken, [4, 3, 2]);
    const good = pool.filter(c => c.score > 0), busy = [...pool].sort((a, b) => b.g - a.g || b.score - a.score);
    const ourBans = [];
    for (const c of [...good, ...busy]) {
      if (ourBans.length === 3) break;
      if (taken.has(c.ch)) continue;
      ourBans.push({ champ: c.ch, rec: wl(c.rec), why: ourBans.length ? (op.players[c.ro] || '') : `${own(op.players[c.ro] || op.tag)} best`, win: c.rec[1] > c.rec[0] - c.rec[1] });
      taken.add(c.ch);
    }
    // 2. their bans: what they ban most, still open
    const theirBans = [];
    for (const [ch, k] of top(op.bans)) {
      if (theirBans.length === 3) break;
      if (taken.has(ch)) continue;
      theirBans.push({ champ: ch, why: theirBans.length ? `${k} of ${op.n}` : `their top ban, ${k} of ${op.n}` });
      taken.add(ch);
    }
    // 3. our picks: best record, one per role; the first is the one they ban least
    const cands = rankedAny(us, taken, [5, 3, 2]);
    const first = cands.slice(0, 6).sort((a, b) => (op.bans[a.ch] || 0) - (op.bans[b.ch] || 0) || b.score - a.score)[0];
    const picks = first ? [first] : [], roles = new Set(first ? [first.ro] : []);
    for (const c of cands) if (picks.length < 3 && c !== first && !roles.has(c.ro)) { picks.push(c); roles.add(c.ro); }
    picks.forEach(c => taken.add(c.ch));
    // 4. their picks: their first-pick habit, then what they play most, one per role
    const tp = [], troles = new Set();
    const fpRank = Object.entries(op.first_pick).sort((a, b) => b[1] - a[1] ||
      ((op.pool[op.role[b[0]]] || {})[b[0]] || [0, 0])[1] - ((op.pool[op.role[a[0]]] || {})[a[0]] || [0, 0])[1]);
    for (const [ch] of fpRank) {
      const ro = op.role[ch];
      if (!taken.has(ch) && ro && op.pool[ro][ch][0] >= 3) { tp.push({ ch, ro, note: 'first-pick habit' }); troles.add(ro); break; }
    }
    const byPlay = ROLES.flatMap(ro => Object.entries(op.pool[ro] || {}).map(([ch, rec]) => ({ ch, ro, g: rec[0] }))).sort((a, b) => b.g - a.g);
    for (const c of byPlay) {
      if (tp.length === 3) break;
      if (!taken.has(c.ch) && !troles.has(c.ro) && !tp.some(x => x.ch === c.ch)) { tp.push(c); troles.add(c.ro); }
    }
    tp.forEach(c => taken.add(c.ch));
    const backups = rankedAny(us, taken, [5, 3, 2]).filter(c => !roles.has(c.ro)).slice(0, 2);

    // 5. the game plan: the early edge where we lead by the most
    const rate = (p, k) => Math.round(100 * (p.e[k] || 0) / p.n);
    const edges = { drag: [rate(us, 'drag'), rate(op, 'drag')], fb: [rate(us, 'fb'), rate(op, 'fb')], grub: [rate(us, 'grub'), rate(op, 'grub')] };
    const best = Object.keys(edges).sort((a, b) => (edges[b][0] - edges[b][1]) - (edges[a][0] - edges[a][1]))[0];
    const gave = op.fb_gave;
    const roleCount = {};
    gave.forEach(v => { if (v[1]) roleCount[v[1]] = (roleCount[v[1]] || 0) + 1; });
    const [vr, vrN] = top(roleCount)[0] || [null, 0];
    const vicNames = {}, vicZones = {};
    gave.filter(v => v[1] === vr).forEach(v => { vicNames[v[2]] = (vicNames[v[2]] || 0) + 1; vicZones[v[0]] = (vicZones[v[0]] || 0) + 1; });
    const vicName = (top(vicNames)[0] || [op.players[vr]])[0];
    const [vz, vzN] = top(vicZones)[0] || ['jungle', 0];
    let line3, why3;
    if (best === 'fb' && vr) {
      const med = us.fb_got[Math.floor(us.fb_got.length / 2)];
      line3 = `Kill ${vicName} in the ${PLACE[vz]} before ${mmss(Math.floor(med / 30) * 30 + 30)}`;
      why3 = `Their ${ROLE_PERSON[vr]} is the first to die in <b>${vrN} of ${gave.length}</b> games, ${vzN} in the ${PLACE[vz]}. Half our first kills come by <b>${mmss(med)}</b>.`;
    } else if (best === 'drag') {
      line3 = `Take the first dragon before ${mmss(Math.floor(us.fd_avg / 30) * 30 + 30)}`;
      why3 = `We get the first dragon in <b>${edges.drag[0]}%</b> of games, ${op.tag} in <b>${edges.drag[1]}%</b>. It falls at ${mmss(us.fd_avg)} in our games, ${mmss(op.fd_avg)} in theirs.`;
    } else {
      line3 = 'Take the first void grubs';
      why3 = `We get the first grub in <b>${edges.grub[0]}%</b> of games, ${op.tag} in <b>${edges.grub[1]}%</b>.`;
    }

    // 6. the thin role: fewest proven champions left for us
    const left = Object.fromEntries(ROLES.map(r => [r, Object.entries(us.pool[r] || {}).filter(([c, rec]) => rec[0] >= 5 && !locked.includes(c)).map(([c]) => c)]));
    const thin = ROLES.reduce((a, b) => (left[b].length < left[a].length ? b : a));
    const gone = Object.entries(us.pool[thin] || {}).filter(([c, rec]) => rec[0] >= 5 && locked.includes(c)).map(([c]) => c);

    const h2h = D.series.filter(s => s.teams.includes(usId) && s.teams.includes(themId)).flatMap(s => s.games);
    const step = (list, side, kind) => list.map((x, i) => Object.assign(x, { step: STEPS[side][kind][i] }));
    const allBest = ourBans.every(b => b.win);
    // their deaths, mirrored onto the side they play this game
    const flip = v => (!v[5] || v[5] === themSide ? [v[3], v[4]] : [15000 - v[3], 14400 - v[4]]);

    return {
      usSide, themSide,
      steps: {
        us_ban: step(ourBans, usSide, 'ban'),
        them_ban: step(theirBans, themSide, 'ban'),
        us_pick: step(picks.map((c, i) => ({ champ: c.ch, rec: wl(c.rec), role: c.ro,
          why: i ? (us.players[c.ro] || '') : (op.bans[c.ch] ? `${op.bans[c.ch]} ${op.tag} bans in ${op.n}` : `never banned by ${op.tag}`) })), usSide, 'pick'),
        them_pick: step(tp.map(c => ({ champ: c.ch, rec: wl(op.pool[c.ro][c.ch]), role: c.ro,
          why: (op.players[c.ro] || '') + (c.note ? ', ' + c.note : '') })), themSide, 'pick'),
      },
      plan: {
        bans: ourBans.map(b => b.champ), picks: picks.map(c => c.ch),
        ban_why: `${own(op.name)} ${allBest ? 'three best picks' : 'most-played champions'} still open. They are ` +
          ourBans.map(b => `<b>${b.rec}</b>`).join(', ').replace(/, ([^,]*)$/, ' and $1') + ' on them this year.',
        pick_why: first ? `${op.tag} banned ${first.ch} <b>${op.bans[first.ch] || 0} times in ${op.n} games</b>. ${us.players[first.ro]} is <b>${wl(first.rec)}</b> on it.` : '',
        line3, why3,
      },
      backup: backups.map(c => [c.ch, wl(c.rec)]),
      thin: `${ROLE_NAME[thin]} is thin.` + (gone.length ? ` ${gone.join(', ').replace(/, ([^,]*)$/, ' and $1')} ${gone.length === 1 ? 'is' : 'are'} gone.` : '') + ` Only ${left[thin].length} proven picks left.`,
      pool: ROLES.map(ro => ({ role: ROLE_NAME[ro], champs: Object.entries(us.pool[ro] || {}).filter(([c]) => !locked.includes(c))
        .sort((a, b) => b[1][0] - a[1][0]).slice(0, 3).map(([c, rec]) => [c, wl(rec)]) })),
      habits: [
        [mmss(op.fd_avg), `when the first dragon falls in their games, ${Math.abs(op.fd_avg - us.fd_avg)} seconds ${op.fd_avg > us.fd_avg ? 'later' : 'earlier'} than in ours`],
        [`${op.e.fb_jungle || 0}/${op.e.fb || 0}`, 'of their first kills happen in the jungle'],
        [`${h2h.filter(g => g.winner === themId).length}/${h2h.length}`, 'games won against us this year'],
      ],
      first_picks: top(op.first_pick).slice(0, 5),
      fb_map: gave.filter(v => v[3] != null).map(v => [...flip(v), v[1] === vr ? 1 : 0]),
      fb_victim: { name: vicName, role: ROLE_PERSON[vr] || '', n: vrN, of: gave.length },
    };
  }

  const api = { plan, mmss, own, ROLES };
  if (typeof module !== 'undefined') module.exports = api; else root.Planner = api;
})(this);
