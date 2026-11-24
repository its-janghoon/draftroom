// Draft Room UI: a fearless series, game by game. The coach locks in what was
// actually played, and the plan for the next game is rebuilt from the data.
(() => {
  const D = window.DRAFTROOM, P = window.Planner;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const list = (xs, cls) => xs.map((x, i) => (i && i === xs.length - 1 ? ' and ' : i ? ', ' : '') + `<span class="${cls}">${esc(x)}</span>`).join('');
  const team = id => D.teams[id];
  const KEY = 'draftroom.series.v1';
  const ROLE_LABEL = ['Top', 'Jungle', 'Mid', 'Bot', 'Support'];

  if (!D) { document.body.innerHTML = '<p style="padding:40px">web/data.js is missing. Run <code>python pipeline/build.py</code> first (see README).</p>'; return; }

  // ---------- series state ----------
  const C9 = Object.keys(D.teams).find(id => D.teams[id].tag === 'C9') || Object.keys(D.teams)[0];
  const firstOpp = id => Object.keys(D.teams).find(t => t !== id);
  let S = load() || fresh(C9, D.teams['47363'] ? '47363' : firstOpp(C9));

  function fresh(us, them) { return { us, them, fmt: 5, side1Blue: true, games: [], real: null }; }
  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); return s && D.teams[s.us] && D.teams[s.them] ? s : null; } catch { return null; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* private mode */ } }
  const wins = who => S.games.filter(g => g.winner === who).length;
  const need = () => Math.floor(S.fmt / 2) + 1;
  const over = () => wins('us') >= need() || wins('them') >= need() || S.games.length >= S.fmt;
  const gameNo = () => S.games.length + 1;
  const usBlueNow = () => (S.games.length ? S.games[S.games.length - 1].winner === 'them' : S.side1Blue); // loser takes blue
  const locked = () => S.games.flatMap(g => [...g.picks.us, ...g.picks.them]);

  // ---------- setup controls ----------
  const teamOpts = (sel, skip) => Object.values(D.teams).filter(t => t.id !== skip)
    .sort((a, b) => a.name.localeCompare(b.name)).map(t => `<option value="${t.id}"${t.id === sel ? ' selected' : ''}>${esc(t.name)}</option>`).join('');
  function setupControls() {
    $('usSel').innerHTML = teamOpts(S.us, null);
    $('oppSel').innerHTML = teamOpts(S.them, S.us);
    $('fmtSel').value = String(S.fmt);
    const real = D.series.filter(s => s.teams.includes(S.us) && s.teams.includes(S.them)).reverse();
    $('realSel').innerHTML = `<option value="">Replay a real series</option>` + real.map(s => {
      const w = s.games.filter(g => g.winner === S.us).length, l = s.games.length - w;
      return `<option value="${s.id}"${s.id === S.real ? ' selected' : ''}>${s.date}, ${team(S.us).tag} ${w}-${l}</option>`;
    }).join('');
    $('realSel').disabled = !real.length;
  }
  $('usSel').onchange = e => { const us = e.target.value; S = fresh(us, S.them === us ? firstOpp(us) : S.them); show(true); };
  $('oppSel').onchange = e => { S = fresh(S.us, e.target.value); show(true); };
  $('fmtSel').onchange = e => { S.fmt = +e.target.value; show(false); };
  $('newSeries').onclick = () => { S = fresh(S.us, S.them); show(true); };
  $('realSel').onchange = e => {
    const s = D.series.find(x => x.id === e.target.value);
    S = fresh(S.us, S.them);
    if (s) {                 // load game 1 as played, then plan game 2
      const g = s.games[0];
      S.real = s.id; S.fmt = s.games.length > 3 || s.event.includes('Playoffs') ? 5 : S.fmt;
      S.side1Blue = g.sides[S.us] === 'blue';
      S.games = [{ picks: { us: g.picks[S.us], them: g.picks[S.them] }, winner: g.winner === S.us ? 'us' : 'them', real: g }];
    }
    show(true);
  };

  function strip() {
    $('strip').innerHTML = Array.from({ length: S.fmt }, (_, i) => {
      const g = S.games[i];
      const cls = g ? (g.winner === 'us' ? 'won' : 'lost') : i === S.games.length && !over() ? 'now' : '';
      const label = g ? `Game ${i + 1}, ${g.winner === 'us' ? team(S.us).tag : team(S.them).tag} won. Click to undo from here` : `Game ${i + 1}`;
      return `<button type="button" class="${cls}" data-g="${i}" title="${label}" aria-label="${label}"${g ? '' : ' disabled'}>G${i + 1}</button>`;
    }).join('');
    $('strip').querySelectorAll('button[data-g]').forEach(b => b.onclick = () => {
      const i = +b.dataset.g;
      if (S.games[i] && confirm(`Remove game ${i + 1}${i + 1 < S.games.length ? ' and the games after it' : ''} from this series?`)) {
        S.games = S.games.slice(0, i); if (!S.games.length) S.real = null; show(true);
      }
    });
  }

  // ---------- fill the page ----------
  let m;
  function fill() {
    const us = team(S.us), op = team(S.them), N = gameNo(), done = over(), usBlue = usBlueNow();
    m = P.plan(D, S.us, S.them, locked(), usBlue);
    $('usName').textContent = us.name;
    $('oppName').textContent = op.name;
    $('score').textContent = `${wins('us')}–${wins('them')}`;
    const last = S.games[S.games.length - 1];
    $('gameLine').textContent = done
      ? `Series over. ${wins('us') > wins('them') ? us.name : op.name} won ${Math.max(wins('us'), wins('them'))}-${Math.min(wins('us'), wins('them'))}.`
      : `Game ${N} of ${S.fmt}, fearless. ${us.tag} on ${m.usSide} side.` + (last ? ` ${last.winner === 'us' ? us.name : op.name} took game ${N - 1}.` : '');
    setupControls(); strip();

    const st = m.steps, bans = m.plan.bans, picks = m.plan.picks;
    const say2 = usBlue ? `First-pick ${list([picks[0]], 'pick')}, then ${list(picks.slice(1), 'pick')}`
                        : `Pick ${list(picks.slice(0, 2), 'pick')}, then ${list(picks.slice(2), 'pick')}`;
    $('planHead').textContent = done ? 'Series over. Start a new one to plan again' : `Game ${N} plan, in order`;
    $('planList').innerHTML = `
      <li class="plan-line" data-steps="${st.us_ban.map(b => b.step)}"><span class="n">1</span>
        <span class="say">Ban ${list(bans, 'ban')}</span><span class="why">${m.plan.ban_why}</span></li>
      <li class="plan-line" data-steps="${st.us_pick.map(b => b.step)}"><span class="n">2</span>
        <span class="say">${say2}</span><span class="why">${m.plan.pick_why}</span></li>
      <li class="plan-line" data-steps="end"><span class="n">3</span>
        <span class="say">${esc(m.plan.line3)}</span><span class="why">${m.plan.why3}</span></li>`;
    $('lockBtn').textContent = `Lock game ${N}`;
    $('lockBtn').disabled = done;
    $('copyBtn').disabled = done;
    $('lockNote').textContent = done ? '' : N < S.fmt ? `Then plan game ${N + 1}` : 'Last possible game';

    $('pool').innerHTML = m.pool.map(r => `<tr><td>${r.role}</td><td><div class="row3">${
      r.champs.map(([c, rec]) => `<span class="ch" data-champ="${esc(c)}"><b>${esc(c)}</b> <i>${rec}</i></span>`).join('')}</div></td></tr>`).join('');
    $('thin').textContent = m.thin;
    outlook(N, done);
    recap(us, op, last, N);

    $('draftTitle').textContent = `Draft plan for game ${N}`;
    $('draftHint').textContent = `Blue slots are our plan. Navy slots are ${P.own(op.name)} most likely answer, from their ${op.n} games this year.`;
    $('usSide').textContent = `${us.tag}, ${m.usSide} side`;
    $('themSide').textContent = `${op.name}, ${m.themSide} side`;
    const slot = (s, cls) => `<div class="slot ${cls}"><span class="step num">${s.step}</span><span class="who">${esc(s.champ)}</span>` +
      `<span class="why">${esc(s.why)}</span>${s.rec ? `<span class="rec num">${s.rec}</span>` : ''}</div>`;
    $('usBan').innerHTML = st.us_ban.map(s => slot(s, 'l is-ban')).join('');
    $('themBan').innerHTML = st.them_ban.map(s => slot(s, 'r is-ban guess')).join('');
    $('usPick').innerHTML = st.us_pick.map(s => slot(s, 'l us-pick')).join('');
    $('themPick').innerHTML = st.them_pick.map(s => slot(s, 'r them-pick guess')).join('');
    $('later').textContent = `Steps 13 to 20 open once you see their first three picks.` +
      (m.backup.length ? ` Backup pair: ${m.backup.map(b => b.join(' ')).join(' and ')}.` : '');

    $('habitHead').textContent = `How ${op.name} plays the early game`;
    $('habits').innerHTML = m.habits.map(([n, t]) => `<div class="habit"><span class="big num">${n}</span>${esc(t)}</div>`).join('');
    $('fpHead').textContent = `${P.own(op.name)} first pick this year`;
    const lk = new Set(locked());
    $('fp').innerHTML = m.first_picks.map(([c, k]) => {
      const a = lk.has(c) ? ' class="out"' : ` data-fp="${esc(c)}"`;
      return `<span${a}>${esc(c)}</span><span${a}>${k}</span>`;
    }).join('');
    drawMap(op);
    const real = S.real && D.series.find(s => s.id === S.real);
    $('src').innerHTML = esc(`Official GRID data, ${D.season}. ${us.name} ${us.n} games, ${op.name} ${op.n} games.` + (real ? ` Game 1 from the ${real.date} series.` : '')) +
      ' <span class="keys-hint">Press ? for shortcuts</span>';
  }

  // fearless outlook: one dot per proven champion still open after this game's picks, hollow if the plan uses it
  function outlook(N, done) {
    $('outlookHead').style.display = $('outlook').style.display = done ? 'none' : '';
    if (done) { $('outlook').innerHTML = ''; return; }
    const from = N + 1, games = from === S.fmt ? `game ${from}` : `games ${from}-${S.fmt}`;
    $('outlook').innerHTML = P.outlook(D, S.us, locked(), m.steps.us_pick).map(r => {
      const dots = r.open.map(c => `<i class="dot" title="${esc(c)}"></i>`).join('') +
        r.planned.map(c => `<i class="dot plan" title="${esc(c)}, in this game's plan"></i>`).join('');
      const warn = r.open.length <= 2 && from <= S.fmt ? `<span class="warn">${r.open.length} left for ${games}</span>` : '';
      return `<div class="orow"><span class="role">${P.ROLE_NAME[r.role]}</span><span class="dots" role="img" aria-label="${r.open.length} proven open, ${r.planned.length} planned">${dots}</span>` +
        `<b>${r.open.length}</b>${warn}</div>`;
    }).join('');
  }

  function recap(us, op, last, N) {
    const name = id => (id === S.us ? us.tag : op.tag);
    if (!last) {
      $('recapHead').textContent = 'Before game 1';
      $('recap').innerHTML = `<li class="empty">Nothing is locked yet. After each game, press Lock and enter what was played.</li>`;
    } else {
      $('recapHead').textContent = `Game ${N - 1}: ${last.winner === 'us' ? us.name : op.name} won` +
        (last.real && last.real.length ? ` in ${P.mmss(last.real.length)}` : '');
      const r = last.real, f = [];
      if (r) {
        if (r.first_scuttle) f.push(`Scuttle: <b>${esc(r.first_scuttle.who)}</b> (${name(r.first_scuttle.team)}), ${r.first_scuttle.side}, ${P.mmss(r.first_scuttle.sec)}`);
        if (r.first_blood) f.push(`First blood: <b>${esc(r.first_blood.killer)}</b> (${name(r.first_blood.team)}), ${r.first_blood.zone}, ${P.mmss(r.first_blood.sec)}`);
        if (r.first_dragon) f.push(`First dragon: ${r.first_dragon.team === S.us ? us.tag : op.tag}, ${P.mmss(r.first_dragon.sec)}`);
        if (r.gold) f.push(`Final gold: ${op.tag} ${(r.gold[S.them] / 1000).toFixed(1)}k, ${us.tag} ${(r.gold[S.us] / 1000).toFixed(1)}k`);
      } else f.push(`Entered by hand: ${last.picks.us.join(', ')} against ${last.picks.them.join(', ')}.`);
      $('recap').innerHTML = f.map(x => `<li>${x}</li>`).join('');
    }
    const usedUs = S.games.flatMap(g => g.picks.us), usedThem = S.games.flatMap(g => g.picks.them);
    $('usedHead').style.display = S.games.length ? '' : 'none';
    $('used').innerHTML = S.games.length ? [[us.tag, 'us', usedUs], [op.tag, 'them', usedThem]].map(([t, c, xs]) =>
      `<div class="used" title="${esc(xs.join(', '))}"><span class="t ${c}">${esc(t)}</span>${xs.map(x => `<span>${esc(x)}</span>`).join('')}</div>`).join('') : '';
  }

  // Summoner's Rift as plain shapes (no game art). Game units 0..15000, y up.
  function drawMap(op) {
    const X = x => (x / 100).toFixed(1), Y = y => (150 - y / 100).toFixed(1);
    const usBlue = m.usSide === 'blue';
    const ground = `<rect x="0" y="0" width="150" height="150" rx="6" class="g"/><path d="M0 0 L150 150" class="river"/>` +
      `<path d="M12 138 L12 12 L138 12 M12 138 L138 138 L138 12 M12 138 L138 12" class="lane"/>` +
      `<circle cx="12" cy="138" r="9" class="base ${usBlue ? 'us' : 'them'}"/><circle cx="138" cy="12" r="9" class="base ${usBlue ? 'them' : 'us'}"/>`;
    const dots = m.fb_map.map(([x, y, hit], k) =>
      `<circle cx="${X(x)}" cy="${Y(y)}" r="${hit ? 4 : 2.6}" class="dot${hit ? ' hit' : ''}" style="transition-delay:${(k * 0.03).toFixed(2)}s"/>`).join('');
    $('rift').innerHTML = ground + dots;
    $('rift').setAttribute('aria-label', `Where ${op.name} gave up first blood this year`);
    $('mapHead').textContent = `Where ${op.name} die first`;
    const v = m.fb_victim;
    $('mapNote').innerHTML = v.n ? `<b>${esc(v.name)}</b>, their ${v.role}, is the first to die in <b>${v.n} of ${v.of}</b> games.` +
      `<span class="key"><i class="k hit"></i>${esc(v.name)} <i class="k"></i>others</span>` : 'Not enough games yet.';
  }

  // ---------- copy the plan as plain text for the team chat ----------
  let copyTimer;
  function copyPlan() {
    const us = team(S.us), op = team(S.them), btn = $('copyBtn');
    const text = `Game ${gameNo()} vs ${op.name} (${us.tag} ${m.usSide} side)\n` +
      `1. Ban ${m.plan.bans.join(', ')}\n2. Pick ${m.plan.picks.join(', ')}\n3. ${m.plan.line3}`;
    const flash = label => {
      btn.textContent = label;
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => (btn.textContent = 'Copy plan'), 1500);
    };
    try {
      navigator.clipboard.writeText(text).then(() => flash('Copied'), () => flash('Copy failed'));
    } catch (e) { flash('Copy failed'); }
  }
  $('copyBtn').onclick = copyPlan;

  // ---------- lock in what was played ----------
  const norm = s => s.trim().toLowerCase().replace(/[^a-z]/g, '');
  const byNorm = Object.fromEntries(D.champions.map(c => [norm(c), c]));
  $('champList').innerHTML = D.champions.map(c => `<option value="${esc(c)}">`).join('');
  const roleIdx = { top: 0, jungle: 1, mid: 2, adc: 3, support: 4 };
  function openLock() {
    const us = team(S.us), op = team(S.them), N = gameNo();
    $('dlgTitle').textContent = `Lock game ${N}`;
    $('dlgUs').textContent = us.name; $('dlgThem').textContent = op.name;
    $('dlgWinUs').textContent = us.tag; $('dlgWinThem').textContent = op.tag;
    const pre = (picks) => { const a = ['', '', '', '', '']; picks.forEach(p => { if (p.role in roleIdx) a[roleIdx[p.role]] = p.champ; }); return a; };
    const field = (side, vals) => ROLE_LABEL.map((r, i) =>
      `<label>${r}<input list="champList" name="${side}${i}" value="${esc(vals[i])}" autocomplete="off" required></label>`).join('');
    $('dlgUsPicks').innerHTML = field('us', pre(m.steps.us_pick));
    $('dlgThemPicks').innerHTML = field('them', pre(m.steps.them_pick));
    $('lockForm').querySelectorAll('input[type=radio]').forEach(r => (r.checked = false));
    $('dlgErr').textContent = '';
    pause();
    $('lockDlg').showModal();
  }
  $('lockBtn').onclick = openLock;
  $('dlgCancel').onclick = () => $('lockDlg').close();
  $('lockForm').onsubmit = e => {
    e.preventDefault();
    const f = $('lockForm'), seen = new Set(locked()), out = { us: [], them: [] };
    let err = '';
    f.querySelectorAll('input[list]').forEach(inp => inp.classList.remove('bad'));
    for (const side of ['us', 'them']) for (let i = 0; i < 5; i++) {
      const inp = f.elements[side + i], c = byNorm[norm(inp.value)];
      if (!c) { inp.classList.add('bad'); err = err || `"${inp.value || ROLE_LABEL[i]}" is not a champion name.`; continue; }
      if (seen.has(c)) { inp.classList.add('bad'); err = err || `${c} is already used in this series. Fearless allows each champion once.`; continue; }
      seen.add(c); out[side].push(c);
    }
    const win = f.querySelector('input[name=win]:checked');
    if (!err && !win) err = 'Choose who won the game.';
    if (err) { $('dlgErr').textContent = err; return; }
    S.games.push({ picks: out, winner: win.value, real: null });
    $('lockDlg').close();
    show(true);
  };

  // ---------- champ-select replay: the side on the clock hovers, then locks in ----------
  const STEP = 1.9, LOCK_AT = 1.25;
  const turn = $('turn'), secs = $('secs'), bar = $('bar'), playBtn = $('play');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let order = [], lines = [], t = 0, last = null, running = false, done = false;

  function build() {
    const poolNames = m.pool.flatMap(r => r.champs.map(c => c[0]));
    const steps = [...document.querySelectorAll('.slot .step')].sort((a, b) => +a.textContent - +b.textContent);
    order = steps.map((st, k) => {
      const slot = st.closest('.slot'), who = slot.querySelector('.who');
      const ban = slot.classList.contains('is-ban'), them = slot.classList.contains('r');
      slot.dataset.kind = (them ? team(S.them).tag + ' ' : team(S.us).tag + ' ') + (ban ? 'ban' : 'pick');
      const name = who.textContent, decoys = poolNames.filter(c => c !== name);
      return { st, slot, who, name, ban, them, tries: decoys.length ? [decoys[(k * 3) % decoys.length], name] : [name] };
    });
    lines = [...document.querySelectorAll('.plan-line')];
  }
  function render() {
    const i = t >= order.length * STEP ? order.length : Math.floor(t / STEP), local = t - i * STEP;   // exact end check: 12 * 1.9 / 1.9 floors to 11
    order.forEach((o, k) => {
      const isLocked = k < i || (k === i && local >= LOCK_AT), active = k === i && !isLocked;
      o.slot.classList.toggle('pending', k > i);
      o.slot.classList.toggle('active', active);
      if (isLocked) o.slot.classList.add('locked'); else o.slot.classList.remove('locked');
      o.st.classList.toggle('now', k === i);
      o.who.textContent = active ? o.tries[Math.min(Math.floor(local / (LOCK_AT / o.tries.length)), o.tries.length - 1)] : o.name;
    });
    const lockedNow = order.filter(o => o.slot.classList.contains('locked'));
    document.querySelectorAll('.pool .ch').forEach(c => {
      const o = lockedNow.find(x => x.name === c.dataset.champ);
      c.classList.toggle('banned', !!o && o.ban);
      c.classList.toggle('ours', !!o && !o.ban && !o.them);
      c.classList.toggle('theirs', !!o && !o.ban && o.them);
    });
    document.querySelectorAll('[data-fp]').forEach(c => {
      const o = lockedNow.find(x => x.name === c.dataset.fp);
      c.classList.toggle('out', !!o && (o.ban || !o.them));
      c.classList.toggle('took', !!o && !o.ban && o.them);
    });
    document.querySelectorAll('.phase-name').forEach(p => p.classList.remove('now'));
    const finished = i >= order.length;
    document.querySelector('.fbmap').classList.toggle('show', finished);
    if (!finished) {
      const o = order[i];
      o.st.closest('.phase').querySelector('.phase-name').classList.add('now');
      turn.textContent = (o.them ? team(S.them).name + ' ' : team(S.us).tag + ' ') + (o.ban ? 'banning' : 'picking');
      turn.className = 'turn' + (o.them ? ' them' : '');
      bar.className = o.them ? 'them' : '';
      const left = Math.max(0, 30 - Math.min(local, LOCK_AT) / LOCK_AT * 13);
      secs.textContent = Math.ceil(left);
      bar.style.transform = `scaleX(${left / 30})`;
    } else {
      turn.textContent = 'Plan ready'; turn.className = 'turn done';
      secs.textContent = ''; bar.style.transform = 'scaleX(0)';
    }
    lines.forEach(l => {
      const ks = l.dataset.steps === 'end' ? [] : l.dataset.steps.split(',').map(Number);
      const idx = ks.map(s => order.findIndex(o => +o.st.textContent === s)).filter(k => k >= 0);
      l.classList.toggle('lit', finished ? l.dataset.steps === 'end' : idx.includes(i));
      l.classList.toggle('done', idx.length ? idx.every(k => order[k].slot.classList.contains('locked')) : finished);
    });
  }
  function frame(now) {
    if (!running) return;
    const dt = last === null ? 0 : Math.min((now - last) / 1000, 1 / 30);
    last = now; t += dt;
    if (t >= order.length * STEP) { t = order.length * STEP; running = false; done = true; playBtn.textContent = 'Play'; }
    render();
    if (running) requestAnimationFrame(frame);
  }
  function play() { if (done) { t = 0; done = false; } running = true; last = null; playBtn.textContent = 'Pause'; requestAnimationFrame(frame); }
  function pause() { running = false; playBtn.textContent = 'Play'; }
  playBtn.onclick = () => (running ? pause() : play());
  $('again').onclick = () => { t = 0; done = false; play(); };

  // ---------- print sheet: finish the replay so every slot is locked, then print ----------
  function finishReplay() { pause(); t = order.length * STEP; done = true; render(); }
  function printSheet() { finishReplay(); window.print(); }
  $('printBtn').onclick = printSheet;
  window.addEventListener('beforeprint', finishReplay);   // Ctrl+P from the browser menu too

  // ---------- keyboard shortcuts ----------
  const helpDlg = $('helpDlg');
  $('helpClose').onclick = () => helpDlg.close();
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
    const el = e.target, tag = el && el.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || (el && el.isContentEditable) || (el && el.closest && el.closest('#lockDlg'))) return;
    if ($('lockDlg').open) return;
    if (e.key === '?') { e.preventDefault(); helpDlg.open ? helpDlg.close() : helpDlg.showModal(); return; }
    if (helpDlg.open) return;
    if (e.key === ' ') {
      if (tag === 'BUTTON') return;          // a focused button already handles Space itself
      e.preventDefault(); running ? pause() : play();
      return;
    }
    if (e.repeat) return;
    const k = e.key.toLowerCase();
    if (k === 'r') { e.preventDefault(); t = 0; done = false; play(); }
    else if (k === 'l') { e.preventDefault(); if (!$('lockBtn').disabled) openLock(); }
    else if (k === 'c') { e.preventDefault(); if (!$('copyBtn').disabled) copyPlan(); }
    else if (k === 'p') { e.preventDefault(); printSheet(); }
  });

  function show(autoplay) {
    pause(); save(); fill(); build();
    t = 0; done = false;
    if (calm || over()) { t = order.length * STEP; done = true; render(); return; }
    render();
    if (autoplay) setTimeout(play, 400);
  }

  // ?vs=TAG&t=seconds for screenshots and links
  const q = new URLSearchParams(location.search);
  const vs = q.get('vs') && Object.values(D.teams).find(x => x.tag === q.get('vs'));
  if (vs && vs.id !== S.them) S = fresh(S.us, vs.id);
  if (q.has('t')) { show(false); t = parseFloat(q.get('t')); render(); } else show(true);
})();
