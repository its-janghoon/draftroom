# Session transcript

## Thinking

I am starting by reviewing the project guidelines and layout so I can get oriented before working on the code task.

### Ran cd /home/ubuntu/workplace/draftroom && git status --short | head; ls -la . .junie web pipeline tests docs cache web/vendor 2>&1 | head -80; wc -l web/* pipeline/* tests/* README.md 2>/dev/null; ls ../stl-hackathon-2026-grid-starter | head

```text
.:
total 60
drwxr-xr-x  9 ubuntu ubuntu  4096 Nov 24 08:40 .
drwxr-xr-x 61 ubuntu ubuntu 12288 Nov 24 22:48 ..
drwxr-xr-x  7 ubuntu ubuntu  4096 Nov 24 22:52 .git
-rw-r--r--  1 ubuntu ubuntu   201 Nov 23 14:17 .gitignore
drwxr-xr-x  3 ubuntu ubuntu  4096 Nov 24 07:50 .junie
-rw-r--r--  1 ubuntu ubuntu  1069 Nov 23 14:17 LICENSE
-rw-r--r--  1 ubuntu ubuntu  5403 Nov 24 08:40 README.md
drwxr-xr-x  2 ubuntu ubuntu  4096 Nov 24 08:17 cache
drwxr-xr-x  2 ubuntu ubuntu  4096 Nov 24 08:29 docs
drwxr-xr-x  3 ubuntu ubuntu  4096 Nov 24 08:40 pipeline
drwxr-xr-x  2 ubuntu ubuntu  4096 Nov 24 08:27 tests
drwxr-xr-x  3 ubuntu ubuntu  4096 Nov 24 22:51 web

.junie:
total 16
drwxr-xr-x 3 ubuntu ubuntu 4096 Nov 24 07:50 .
drwxr-xr-x 9 ubuntu ubuntu 4096 Nov 24 08:40 ..
-rw-r--r-- 1 ubuntu ubuntu  938 Nov 24 22:52 guidelines.md
drwxr-xr-x 2 ubuntu ubuntu 4096 Nov 24 09:37 sessions

cache:
total 5024
drwxr-xr-x 2 ubuntu ubuntu    4096 Nov 24 08:17 .
drwxr-xr-x 9 ubuntu ubuntu    4096 Nov 24 08:40 ..
-rw-r--r-- 1 ubuntu ubuntu 1469664 Nov 24 08:23 backtest-cases.json
-rw-r--r-- 1 ubuntu ubuntu 3662372 Nov 23 14:10 games.json

docs:
total 28
drwxr-xr-x 2 ubuntu ubuntu  4096 Nov 24 08:29 .
drwxr-xr-x 9 ubuntu ubuntu  4096 Nov 24 08:40 ..
-rw-r--r-- 1 ubuntu ubuntu  4941 Nov 24 08:29 ai-workflow.md
-rw-r--r-- 1 ubuntu ubuntu 10516 Nov 24 08:27 backtest.md

pipeline:
total 40
drwxr-xr-x 3 ubuntu ubuntu 4096 Nov 24 08:40 .
drwxr-xr-x 9 ubuntu ubuntu 4096 Nov 24 08:40 ..
drwxr-xr-x 2 ubuntu ubuntu 4096 Nov 24 08:20 __pycache__
-rw-r--r-- 1 ubuntu ubuntu 4804 Nov 24 08:27 backtest.py
-rw-r--r-- 1 ubuntu ubuntu 8813 Nov 24 08:40 build.py
-rw-r--r-- 1 ubuntu ubuntu 6004 Nov 23 14:08 extract.py

tests:
total 40
drwxr-xr-x 2 ubuntu ubuntu  4096 Nov 24 08:27 .
drwxr-xr-x 9 ubuntu ubuntu  4096 Nov 24 08:40 ..
-rw-r--r-- 1 ubuntu ubuntu 20562 Nov 24 08:27 backtest.js
-rw-r--r-- 1 ubuntu ubuntu  2142 Nov 24 08:09 fit.py
-rw-r--r-- 1 ubuntu ubuntu  1959 Nov 24 08:09 planner.test.js

web:
total 252
drwxr-xr-x 3 ubuntu ubuntu   4096 Nov 24 22:51 .
drwxr-xr-x 9 ubuntu ubuntu   4096 Nov 24 08:40 ..
-rw-r--r-- 1 ubuntu ubuntu  22675 Nov 24 08:15 app.js
-rw-r--r-- 1 ubuntu ubuntu 172963 Nov 24 08:53 data.js
-rw-r--r-- 1 ubuntu ubuntu   5097 Nov 24 09:37 index.html
-rw-r--r-- 1 ubuntu ubuntu  10991 Nov 24 08:27 planner.js
-rw-r--r-- 1 ubuntu ubuntu  23338 Nov 24 09:47 style.css
drwxr-xr-x 2 ubuntu ubuntu   4096 Nov 24 22:51 vendor

web/vendor:
total 24
drwxr-xr-x 2 ubuntu ubuntu 4096 Nov 24 22:51 .
drwxr-xr-x 3 ubuntu ubuntu 4096 Nov 24 22:51 ..
-rw-r--r-- 1 ubuntu ubuntu 1069 Nov 24 22:51 fzstd.LICENSE
-rw-r--r-- 1 ubuntu ubuntu 8394 Nov 24 22:51 fzstd.js
    369 web/app.js
      2 web/data.js
    113 web/index.html
    177 web/planner.js
    364 web/style.css
      0 web/vendor
      0 pipeline/__pycache__
    105 pipeline/backtest.py
    179 pipeline/build.py
    123 pipeline/extract.py
    276 tests/backtest.js
     42 tests/fit.py
     32 tests/planner.test.js
     93 README.md
   1875 total
AGENTS.md
LICENSE.md
README.md
lol
meta
val
val-ability-supplements
```

```text
The bash command listed the draftroom project's directories and files, along with line counts for the web, pipeline, test, and README files, and it also listed the contents of the sibling starter directory. The command completed successfully with exit code 0.
```

### Ran cd /home/ubuntu/workplace/draftroom && cat .gitignore; cat pipeline/extract.py pipeline/build.py; ls ../stl-hackathon-2026-grid-starter/* | head -30; git log --oneline | head

```text
# Sky's The Limit 2026 hackathon data: licensed, must not be committed
stl-hackathon-2026-grid-starter/
*.zst
*.jsonl
*.parquet
*.sqlite
*.duckdb
# built from that data
cache/
web/data.js
__pycache__/
"""Read every League of Legends feed in the GRID starter repo once and keep the
few facts Draft Room needs per game: the draft, the first objectives, the first
death, early lane positions and the final clock and gold.

The output is derived from licensed data. It goes to cache/ and stays out of git.

    python pipeline/extract.py --data ../stl-hackathon-2026-grid-starter
"""
import argparse, csv, json
from datetime import datetime
from pathlib import Path

try:
    from compression import zstd as _z          # Python 3.14+
    def zopen(p): return _z.open(p, 'rt', encoding='utf-8')
except ImportError:                             # Python 3.13 and older
    import zstandard
    def zopen(p): return zstandard.open(p, 'rt', encoding='utf-8')


def ts(s):
    return datetime.fromisoformat(s.replace('Z', '+00:00')).timestamp()


def zone(p):
    """Rough Summoner's Rift area for a point in game units."""
    if not p:
        return None
    x, y = p['x'], p['y']
    if x < 3000 and y > 6000 or y > 12000 and x < 9000:
        return 'top'
    if y < 3000 and x > 6000 or x > 12000 and y < 9000:
        return 'bot'
    if abs(x - y) < 1800:
        return 'mid'
    return 'jungle'


def series_games(path, row):
    games, cur = [], None
    with zopen(path) as f:
        for line in f:
            env = json.loads(line)
            at = ts(env['occurredAt'])
            for ev in env['events']:
                t = ev['type']
                if t in ('team-banned-character', 'team-picked-character'):
                    for g in (ev.get('seriesStateDelta') or {}).get('games', []):
                        for d in g.get('draftActions', []):
                            if cur is None or cur['game_id'] != g['id']:
                                cur = {'series_id': row['series_id'], 'event': row['event'],
                                       'date': row['scheduled_start'][:10], 'game_id': g['id'],
                                       'draft': [], 'start': None}
                                games.append(cur)
                            cur['draft'].append([d['sequenceNumber'], d['type'], d['drafter']['id'], d['draftable']['name']])
                    continue
                if t == 'series-started-game' and cur is not None:
                    cur['start'] = at
                if t == 'series-!started-game':             # a rolled-back (abandoned) game
                    gid = (ev.get('target') or {}).get('id')
                    games[:] = [g for g in games if g['game_id'] != gid]
                    cur = games[-1] if games else None
                if cur is None or cur['start'] is None:
                    continue
                sec = round(at - cur['start'])
                actor = ev.get('actor', {})
                a = actor.get('state', {})
                team, pos = a.get('teamId'), a.get('game', {}).get('position')
                tgt = ev.get('target') or {}
                tid = tgt.get('id')
                if actor.get('type') == 'player' and pos and 90 <= sec <= 330:
                    lane = cur.setdefault('lane', {}).setdefault(a.get('name'), {})
                    zz = zone(pos)
                    lane[zz] = lane.get(zz, 0) + 1
                if t == 'player-purchased-item' and sec < 60:
                    items = [i.get('name') for i in a.get('game', {}).get('inventory', {}).get('items', [])]
                    cur.setdefault('start_items', {}).setdefault(a.get('name'), []).extend(i for i in items if i)
                if t == 'player-killed-player' and 'first_blood' not in cur:
                    v = tgt.get('state', {})
                    cur['first_blood'] = {'sec': sec, 'team': team, 'zone': zone(pos), 'killer': a.get('name'),
                                          'victim': v.get('name'), 'victim_id': tid,
                                          'pos': [round(pos['x']), round(pos['y'])] if pos else None}
                elif t == 'player-killed-BTierNPC' and tid and tid.startswith('riftScuttler') and 'first_scuttle' not in cur:
                    cur['first_scuttle'] = {'sec': sec, 'team': team, 'side': 'top' if tid.endswith('Top') else 'bot', 'who': a.get('name')}
                elif t == 'player-killed-ATierNPC' and tid and tid.endswith('Drake') and 'first_dragon' not in cur:
                    cur['first_dragon'] = {'sec': sec, 'team': team, 'kind': tid}
                elif t == 'player-killed-ATierNPC' and tid and tid.startswith('voidGrub') and 'first_grub' not in cur:
                    cur['first_grub'] = {'sec': sec, 'team': team}
                elif t == 'team-won-game':
                    st = tgt.get('state', {})
                    for tm in tgt.get('stateDelta', {}).get('teams', []):
                        if tm.get('won'):
                            cur['winner'] = tm['id']
                    cur['length'] = st.get('clock', {}).get('currentSeconds')
                    cur['gold'] = {tm['id']: tm.get('netWorth') for tm in st.get('teams', [])}
    for g in games:
        g.pop('start', None)
    return games


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--data', default='../stl-hackathon-2026-grid-starter')
    ap.add_argument('--out', default='cache/games.json')
    args = ap.parse_args()
    data = Path(args.data)
    rows = list(csv.DictReader(open(data / 'lol' / 'series.csv')))
    games = []
    for k, row in enumerate(rows, 1):
        games += series_games(data / row['file'], row)
        if k % 100 == 0:
            print(f'{k}/{len(rows)} series')
    # a remake keeps the same draft as the next game in the series: keep the replay only
    games = [g for i, g in enumerate(games)
             if not (i + 1 < len(games) and games[i + 1]['series_id'] == g['series_id'] and games[i + 1]['draft'] == g['draft'])]
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(games))
    print(f'{len(games)} games -> {out}')


if __name__ == '__main__':
    main()
"""Turn cache/games.json and the starter repo's meta tables into web/data.js:
one profile per team plus the real series, for the LCS 2026 season.

data.js holds aggregates derived from licensed data. It stays out of git;
judges build it from their own copy of the starter repo.

    python pipeline/build.py --data ../stl-hackathon-2026-grid-starter
"""
import argparse, collections, csv, json
from pathlib import Path

ROLES = ['top', 'jungle', 'mid', 'adc', 'support']
RECENT = 10   # "recent" means a team's last 10 games before the cutoff
TAGS = {'Cloud9 Kia': 'C9', 'Team Liquid Alienware': 'TL', 'FlyQuest': 'FLY', 'LYON': 'LYON', 'Sentinels': 'SEN',
        'Shopify Rebellion': 'SR', 'Disguised': 'DSG', 'Dignitas': 'DIG', '100 Thieves': '100'}
SHORT = {'Team Liquid Alienware': 'Team Liquid'}
# --anon: made-up team names, given out by games played (most games first)
ANON = [('Team Acme', 'ACM'), ('Team Birch', 'BIR'), ('Team Cobalt', 'COB'), ('Team Delta', 'DEL'),
        ('Team Ember', 'EMB'), ('Team Falcon', 'FAL'), ('Team Granite', 'GRA'), ('Team Harbor', 'HAR'),
        ('Team Iris', 'IRS'), ('Team Juniper', 'JUN'), ('Team Kestrel', 'KES'), ('Team Lumen', 'LUM')]


def role_of(g, player):
    """Guess a player's role from where they stood in minutes 1:30-5:30 and their starting item."""
    lane = g.get('lane', {}).get(player, {})
    items = g.get('start_items', {}).get(player, [])
    doran = [i for i in items if i.startswith('Doran')]
    z = {k: v for k, v in lane.items() if k in ('top', 'mid', 'bot')}
    mode = max(z, key=z.get) if z else None
    if doran:
        if "Doran's Bow" in doran or mode == 'bot':
            return 'adc'
        return mode if mode in ('top', 'mid') else None
    if lane and mode == 'bot' and lane.get('bot', 0) >= max(lane.values()):
        return 'support'
    return 'jungle' if lane else None


def vote_roles(games, roster):
    """Each player's main role, voted over the given games."""
    votes = collections.defaultdict(collections.Counter)
    for g in games:
        for r in roster.get(g['game_id'], []):
            ro = role_of(g, r['player_name'])
            if ro:
                votes[r['player_id']][ro] += 1
    return {p: c.most_common(1)[0][0] for p, c in votes.items()}


def build_profiles(games, roster, main_role, names, min_games=10, recent=RECENT):
    """One profile per team that has at least min_games of the given games.
    'recent' counts, per champion, the games it was played in the team's last `recent` games."""
    by_team = collections.defaultdict(list)
    for g in sorted(games, key=lambda g: g['date']):   # stable: oldest first
        for t in dict.fromkeys(d[2] for d in g['draft']):
            by_team[t].append(g)

    teams = {}
    for tid, tg in by_team.items():
        if len(tg) < min_games:
            continue
        pool = {r: collections.defaultdict(lambda: [0, 0]) for r in ROLES}
        champ_role, players = {}, collections.defaultdict(collections.Counter)
        bans, first_pick = collections.Counter(), collections.Counter()
        e = collections.Counter(); fd = []; fb_got = []; fb_gave = []
        last = collections.Counter()
        for g in tg[-recent:]:
            for r in roster.get(g['game_id'], []):
                if r['team_id'] == tid and main_role.get(r['player_id']):
                    last[r['character_name']] += 1
        for g in tg:
            won = g['winner'] == tid
            side = next((r['side'] for r in roster.get(g['game_id'], []) if r['team_id'] == tid), None)
            for r in roster.get(g['game_id'], []):
                if r['team_id'] == tid and main_role.get(r['player_id']):
                    ro = main_role[r['player_id']]
                    pool[ro][r['character_name']][0] += 1
                    pool[ro][r['character_name']][1] += won
                    champ_role.setdefault(r['character_name'], ro)
                    players[ro][r['player_name']] += 1
            for _, typ, who, ch in g['draft']:
                if typ == 'ban' and who == tid:
                    bans[ch] += 1
            ours = [d for d in g['draft'] if d[1] == 'pick' and d[2] == tid]
            if ours:
                first_pick[ours[0][3]] += 1
            fb = g.get('first_blood')
            if fb and fb['team'] == tid:
                e['fb'] += 1
                e['fb_jungle'] += fb['zone'] == 'jungle'
                fb_got.append(fb['sec'])
            elif fb:
                p = fb.get('pos') or [None, None]
                fb_gave.append([fb['zone'], main_role.get(fb.get('victim_id')), fb.get('victim'), p[0], p[1], side])
            d = g.get('first_dragon')
            if d:
                fd.append(d['sec'])
                e['drag'] += d['team'] == tid
            gr = g.get('first_grub')
            e['grub'] += bool(gr and gr['team'] == tid)
        name = names.get(tid, tid)
        teams[tid] = {
            'id': tid, 'name': SHORT.get(name, name), 'tag': TAGS.get(name, name[:3].upper()), 'n': len(tg),
            'recent': dict(last), 'recent_n': min(recent, len(tg)),
            'players': {r: players[r].most_common(1)[0][0] for r in ROLES if players[r]},
            'pool': {r: {c: v for c, v in pool[r].items()} for r in ROLES},
            'role': champ_role, 'bans': dict(bans), 'first_pick': dict(first_pick),
            'e': dict(e), 'fd_avg': round(sum(fd) / len(fd)) if fd else None,
            'fb_got': sorted(fb_got), 'fb_gave': fb_gave,
        }
    return teams


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--data', default='../stl-hackathon-2026-grid-starter')
    ap.add_argument('--games', default='cache/games.json')
    ap.add_argument('--out', default='web/data.js')
    ap.add_argument('--league', default='LCS')
    ap.add_argument('--since', default='2026-01-01')
    ap.add_argument('--anon', action='store_true', help='demo build: made-up names for every team but Cloud9')
    args = ap.parse_args()
    data = Path(args.data)
    G = json.load(open(args.games))
    gi = {g['game_id']: g for g in G}

    roster = collections.defaultdict(list)
    for r in csv.DictReader(open(data / 'meta' / 'rosters.csv')):
        if r['title'] == 'lol':
            roster[r['game_id']].append(r)
    names = {r['team_id']: r['name'] for r in csv.DictReader(open(data / 'meta' / 'teams.csv')) if r['title'] == 'lol'}
    champions = sorted({r['name'] for r in csv.DictReader(open(data / 'meta' / 'characters.csv')) if r['title'] == 'lol'})

    # each player's main role, voted over every game they played
    main_role = vote_roles([gi[gid] for gid in roster if gid in gi], roster)

    season = [g for g in G if g['date'] >= args.since and g.get('winner') and args.league in g['event']]
    teams = build_profiles(season, roster, main_role, names, 10)

    # the real series, so a coach can load one and replay it
    series = collections.defaultdict(list)
    for g in season:
        series[g['series_id']].append(g)
    out_series = []
    for sid, gs in series.items():
        pair = sorted({d[2] for d in gs[0]['draft']})
        if len(pair) != 2 or not all(t in teams for t in pair):
            continue
        games = []
        for g in gs:
            sides = {r['team_id']: r['side'] for r in roster.get(g['game_id'], [])}
            games.append({
                'winner': g['winner'], 'length': g.get('length'), 'gold': g.get('gold'), 'sides': sides,
                'picks': {t: [d[3] for d in g['draft'] if d[1] == 'pick' and d[2] == t] for t in pair},
                'bans': {t: [d[3] for d in g['draft'] if d[1] == 'ban' and d[2] == t] for t in pair},
                'first_scuttle': g.get('first_scuttle'), 'first_blood': g.get('first_blood'),
                'first_dragon': g.get('first_dragon'),
            })
        out_series.append({'id': sid, 'date': gs[0]['date'], 'event': gs[0]['event'], 'teams': pair, 'games': games})
    out_series.sort(key=lambda s: s['date'])

    if args.anon:
        # demo build: keep Cloud9, give every other team a made-up name (for videos and screenshots)
        fake = iter(ANON)
        for t in sorted(teams.values(), key=lambda t: -t['n']):
            if t['tag'] == 'C9':
                t['name'] = 'Cloud9'
            else:
                t['name'], t['tag'] = next(fake)

    payload = {'season': f'{args.league} {args.since[:4]}', 'champions': champions, 'teams': teams, 'series': out_series}
    out = Path(args.out)
    out.write_text('// Built by pipeline/build.py from the GRID starter data. Do not commit.\n'
                   'window.DRAFTROOM = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(f"{len(teams)} teams, {len(out_series)} series -> {out} ({out.stat().st_size // 1024} KB)")


if __name__ == '__main__':
    main()
../stl-hackathon-2026-grid-starter/AGENTS.md
../stl-hackathon-2026-grid-starter/LICENSE.md
../stl-hackathon-2026-grid-starter/README.md

../stl-hackathon-2026-grid-starter/lol:
events_2748702_grid.jsonl.zst
events_2748703_grid.jsonl.zst
events_2748704_grid.jsonl.zst
events_2748705_grid.jsonl.zst
events_2748706_grid.jsonl.zst
events_2748707_grid.jsonl.zst
events_2748708_grid.jsonl.zst
events_2748709_grid.jsonl.zst
events_2748710_grid.jsonl.zst
events_2748711_grid.jsonl.zst
events_2748712_grid.jsonl.zst
events_2748713_grid.jsonl.zst
events_2748714_grid.jsonl.zst
events_2748715_grid.jsonl.zst
events_2748716_grid.jsonl.zst
events_2748717_grid.jsonl.zst
events_2748718_grid.jsonl.zst
events_2748719_grid.jsonl.zst
events_2748720_grid.jsonl.zst
events_2748721_grid.jsonl.zst
events_2748722_grid.jsonl.zst
events_2748723_grid.jsonl.zst
events_2748724_grid.jsonl.zst
events_2748725_grid.jsonl.zst
events_2748726_grid.jsonl.zst
ls: Broken pipe
3c4f2b5 Vendor fzstd (MIT) and allow a public aggregates file
b54994c Vivid red, blue and yellow accents (#8)
19fc855 Dark theme with a single gold accent (built with Junie CLI) (#7)
7072991 Add --anon demo build with made-up team names (#6)
af2b5d9 Add the story of how Junie built Draft Room (#5)
0045928 Time-split backtest of the plan (built with Junie CLI) (#4)
9124212 Add print sheet and keyboard shortcuts (built with Junie CLI) (#3)
64300a5 Add Fearless outlook and one-screen fit check (built with Junie CLI) (#2)
68a330d Add Copy plan button (built with Junie CLI) (#1)
a853346 Draft Room: fearless draft planner for LoL coaches
```

```text
The bash command printed the .gitignore, the source of the extract and build scripts, a truncated listing of the starter repo, and the recent commit history, all succeeding with exit code 0 apart from a harmless broken-pipe message from the listing.
```

### Ran cd /home/ubuntu/workplace/draftroom && cat web/planner.js tests/planner.test.js tests/fit.py web/index.html

```text
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

  // How the opponent's picks are predicted. Each open champion scores the sum of three
  // shares of the opponent's own games: played this season, played in their last
  // `recent_n` games, and opened with as their first pick. The top 3 are named, one per role.
  // The weights were chosen on the TUNE games of the backtest only (see docs/backtest.md).
  const WEIGHTS = { season: 1, recent: 1, first: 1, perRole: 1 };

  function predictPicks(p, taken, W) {
    W = Object.assign({}, WEIGHTS, W);
    const rec = {};
    for (const ro of ROLES)
      for (const [ch, r] of Object.entries(p.pool[ro] || {})) {
        const x = rec[ch] || (rec[ch] = { ch, ro, g: 0, w: 0, best: 0 });
        x.g += r[0]; x.w += r[1];
        if (r[0] > x.best) { x.best = r[0]; x.ro = ro; }
      }
    const rn = p.recent_n || 0, last = p.recent || {};
    const out = Object.values(rec).filter(x => !taken.has(x.ch)).map(x => {
      const fp = (p.first_pick || {})[x.ch] || 0, rc = last[x.ch] || 0;
      const score = W.season * x.g / p.n + W.recent * (rn ? rc / rn : 0) + W.first * fp / p.n;
      return Object.assign(x, { score, rc, rn, fp });
    }).sort((a, b) => b.score - a.score || b.g - a.g || (a.ch < b.ch ? -1 : 1));
    const picked = [], used = {};
    for (const x of out) {
      if (picked.length === 3) break;
      if ((used[x.ro] || 0) >= W.perRole) continue;
      picked.push(x); used[x.ro] = (used[x.ro] || 0) + 1;
    }
    return picked;
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
    // 4. their picks: the open champions they are most likely to play (see predictPicks)
    const tp = predictPicks(op, taken);
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
          why: `${op.players[c.ro] || ROLE_NAME[c.ro]}, ` + (c.rn && c.rc ? `${c.rc} of last ${c.rn} games` : `${c.g} of ${op.n} games`) +
            (c.fp ? `, first pick ${c.fp}x` : '') })), themSide, 'pick'),
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

  // how deep each role stays for the rest of the series: proven champions (5+ games) not locked yet.
  // open = still free after this game's planned picks; planned = proven champions this game's plan uses.
  function outlook(D, usId, locked, plannedPicks) {
    const us = D.teams[usId], gone = new Set(locked);
    const used = new Set((plannedPicks || []).map(p => (typeof p === 'string' ? p : p.champ)));
    return ROLES.map(role => {
      const proven = Object.entries(us.pool[role] || {}).filter(([c, rec]) => rec[0] >= 5 && !gone.has(c)).map(([c]) => c);
      return { role, open: proven.filter(c => !used.has(c)), planned: proven.filter(c => used.has(c)) };
    });
  }

  const api = { plan, outlook, predictPicks, WEIGHTS, mmss, own, ROLES, ROLE_NAME };
  if (typeof module !== 'undefined') module.exports = api; else root.Planner = api;
})(this);
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
"""One-screen check: opens the app at three laptop sizes for several opponents,
at game 1 and at game 2 after loading a real series, and reports any page that scrolls.

    pip install playwright && python -m playwright install chromium
    python tests/fit.py [screenshot-prefix]
"""
import os, sys, pathlib
from playwright.sync_api import sync_playwright
EXE = os.environ.get('CHROME')
U = (pathlib.Path(__file__).resolve().parent.parent / 'web' / 'index.html').as_uri()
SH = os.environ.get('SHOTS', '')
tag = sys.argv[1] if len(sys.argv) > 1 else 'check'
bad = 0
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE, args=['--no-sandbox']) if EXE else p.chromium.launch()
    for w, h in [(1366, 680), (1440, 800), (1920, 960)]:
        ctx = b.new_context(viewport={'width': w, 'height': h})
        pg = ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        for vs in ['TL', 'FLY', 'LYON', 'SEN', 'SR', 'DIG']:
            pg.goto(f'{U}?vs={vs}&t=40'); pg.evaluate('localStorage.clear()'); pg.goto(f'{U}?vs={vs}&t=40')
            pg.wait_for_timeout(300)
            for g in range(2):            # game 1, then game 2 after loading a real series game 1
                if g == 1:
                    if pg.locator('#realSel option').count() < 2:
                        continue
                    pg.select_option('#realSel', index=1); pg.wait_for_timeout(200)
                    pg.evaluate('document.getElementById("play").click(); document.getElementById("play").click()')
                sw, sh = pg.evaluate('[document.documentElement.scrollWidth, document.documentElement.scrollHeight]')
                ok = sw <= w and sh <= h
                bad += not ok
                if not ok:
                    print(f'SCROLLS {w}x{h} vs {vs} game {g + 1}: {sw}x{sh}')
        pg.goto(f'{U}?vs=SEN&t=40'); pg.wait_for_timeout(300)
        if SH:
            pg.screenshot(path=os.path.join(SH, f'{tag}-{w}.png'))
        print(w, h, 'errors', errs)
        ctx.close()
    b.close()
print('all fit' if not bad else f'{bad} cases scroll')
sys.exit(1 if bad else 0)
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>Draft Room</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&display=swap">
<link rel="stylesheet" href="style.css">
</head>
<body>

<div class="top">
  <div class="title">
    <div class="match"><span class="us" id="usName"></span><span class="sc num" id="score"></span><span class="them" id="oppName"></span></div>
    <div class="game" id="gameLine"></div>
  </div>
  <div class="setup">
    <select id="usSel" aria-label="Our team"></select><span>vs</span>
    <select id="oppSel" aria-label="Opponent"></select>
    <select id="fmtSel" aria-label="Series length"><option value="3">Bo3</option><option value="5">Bo5</option></select>
    <div class="games-strip" id="strip" aria-label="Games in the series"></div>
    <select id="realSel" aria-label="Load a real series"></select>
    <button type="button" id="newSeries">New series</button>
  </div>
</div>

<section class="plan" aria-label="Plan for the next game">
  <h2 id="planHead"></h2>
  <ol id="planList"></ol>
  <div class="go"><button type="button" id="lockBtn"></button><div class="btns"><button type="button" id="copyBtn" class="secondary">Copy plan</button><button type="button" id="printBtn" class="secondary">Print sheet</button></div><small id="lockNote"></small></div>
</section>

<div class="board">
  <section class="sheet">
    <h3>What you still have</h3>
    <table class="pool num" id="pool"></table>
    <p class="thin" id="thin"></p>
    <h3 class="outlook-h" id="outlookHead">Fearless outlook</h3>
    <div class="outlook num" id="outlook"></div>
    <h3 style="margin-top:12px" id="recapHead"></h3>
    <ul class="g1 num" id="recap"></ul>
    <p class="used-h" id="usedHead">Locked for the series</p>
    <div id="used"></div>
  </section>

  <section class="sheet">
    <div class="draft-head">
      <div><h3 id="draftTitle"></h3>
      <p class="hint" id="draftHint"></p></div>
      <div class="clock" aria-live="polite">
        <div class="clock-line"><span class="turn" id="turn"></span><span class="secs num" id="secs">30</span></div>
        <div class="clock-bar"><div id="bar"></div></div>
        <div class="ctrl"><button type="button" id="play">Pause</button><button type="button" id="again">Replay draft</button></div>
      </div>
    </div>
    <div class="sides"><span class="us" id="usSide"></span><span class="them" id="themSide"></span></div>
    <div class="phase"><div class="phase-name">First bans</div><div class="col" id="usBan"></div><div class="col" id="themBan"></div></div>
    <div class="phase"><div class="phase-name">First picks</div><div class="col" id="usPick"></div><div class="col" id="themPick"></div></div>
    <p class="later" id="later"></p>
  </section>

  <section class="sheet">
    <h3 id="habitHead"></h3>
    <div id="habits"></div>
    <h3 style="margin-top:12px" id="fpHead"></h3>
    <div class="fp num" id="fp"></div>
    <h3 style="margin-top:12px" id="mapHead"></h3>
    <div class="fbmap">
      <svg id="rift" viewBox="0 0 150 150" role="img"></svg>
      <p id="mapNote"></p>
    </div>
  </section>
</div>

<p class="src" id="src"></p>

<dialog class="dlg" id="lockDlg">
  <form method="dialog" id="lockForm">
    <h2 id="dlgTitle"></h2>
    <p>Enter the champions each team actually played. Fearless locks all of them for the rest of the series.
       The plan's picks are filled in; change any that went differently.</p>
    <div class="teams">
      <div><h3 class="us-h" id="dlgUs"></h3><div id="dlgUsPicks"></div></div>
      <div><h3 class="them-h" id="dlgThem"></h3><div id="dlgThemPicks"></div></div>
    </div>
    <div class="win">Winner
      <label style="display:inline-flex;grid-template-columns:none;margin:0"><input type="radio" name="win" value="us"> <span id="dlgWinUs"></span></label>
      <label style="display:inline-flex;grid-template-columns:none;margin:0"><input type="radio" name="win" value="them"> <span id="dlgWinThem"></span></label>
    </div>
    <div class="err" id="dlgErr" role="alert"></div>
    <div class="row"><button type="button" id="dlgCancel">Cancel</button><button type="submit" class="primary" id="dlgOk">Lock it in</button></div>
  </form>
</dialog>
<dialog class="dlg help" id="helpDlg" aria-labelledby="helpTitle">
  <h2 id="helpTitle">Keyboard shortcuts</h2>
  <dl>
    <dt><kbd>Space</kbd></dt><dd>Play or pause the replay</dd>
    <dt><kbd>R</kbd></dt><dd>Replay from the start</dd>
    <dt><kbd>L</kbd></dt><dd>Lock the game</dd>
    <dt><kbd>C</kbd></dt><dd>Copy plan</dd>
    <dt><kbd>P</kbd></dt><dd>Print sheet</dd>
    <dt><kbd>?</kbd></dt><dd>Show or hide this card</dd>
  </dl>
  <div class="row"><button type="button" id="helpClose">Close (Esc)</button></div>
</dialog>
<datalist id="champList"></datalist>

<script src="data.js"></script>
<script src="planner.js"></script>
<script src="app.js"></script>
</body>
</html>
```

```text
The command printed the contents of the planner script, its test file, the fit-check script, and the page HTML, exiting with code 0 and no test results shown; the output was truncated and the full log was saved for later review.
```

## Thinking

I have only checked the start of the task so far, with no concrete findings yet. Next, I'm going to look through the pipeline files after reviewing the guidelines file at .junie/guidelines.md.

### Read pipeline/extract.py

### Read pipeline/build.py

### Read web/app.js [1-111]

### Ran cd ../stl-hackathon-2026-grid-starter && head -3 lol/series.csv; wc -l lol/series.csv meta/*.csv; head -3 meta/rosters.csv meta/teams.csv meta/characters.csv; cut -d, -f2 lol/series.csv | sort | uniq -c | head -30; ls lol | wc -l; git log -1 --format=%H 2>&1 | head -2; node -v; python3 --version

```text
series_id,event,stage,scheduled_start,teams,file
2754338,LCK - LCK Cup 2025,Groups,2025-01-15T08:00:00Z,HANJIN BRION vs KIWOOM DRX,lol/events_2754338_grid.jsonl.zst
2754339,LCK - LCK Cup 2025,Groups,2025-01-15T11:20:00Z,DN SOOPers vs NONGSHIM RED FORCE,lol/events_2754339_grid.jsonl.zst
    746 lol/series.csv
    185 meta/characters.csv
   3823 meta/games.csv
   1103 meta/players.csv
  38306 meta/rosters.csv
    206 meta/teams.csv
    109 meta/tournaments.csv
  44478 total
==> meta/rosters.csv <==
title,series_id,game_id,game_number,team_id,team_name,side,player_id,player_name,character_id,character_name,participation_status,session
lol,2754338,a314f0ab-93ec-4567-9eaf-db1fca0067f3,1,52817,OKSavingsBank BRION,blue,23325,Morgan,40cc8559-a028-35a5-a6dd-5e48c4601d66,K'Sante,active,1
lol,2754338,a314f0ab-93ec-4567-9eaf-db1fca0067f3,1,52817,OKSavingsBank BRION,blue,26275,HamBak,52ab36ab-7b94-31c7-afa5-e74badcd74ea,Skarner,active,1

==> meta/teams.csv <==
title,team_id,name,other_names,series_count,events,first_seen,last_seen
lol,47497,100 Thieves,,29,LTA Cross-Conference - Regional Championship 2025; LTA Cross-Conference - Split 1 2025; LTA North - Split 1 2025; LTA North - Split 2 2025; LTA North - Split 3 2025,2025-01-26T21:00:00Z,2025-09-27T20:00:00Z
lol,4035,BNK FearX,,39,LCK - LCK Cup 2025; LCK - Split 2 2025; LCK - Split 3 2025,2025-01-16T08:00:00Z,2025-09-17T08:00:00Z

==> meta/characters.csv <==
title,character_id,name,games_played
lol,e8ec9716-e9de-339a-add1-8dcef41ebdf4,Aatrox,160
lol,d50bfa6a-0179-375a-b583-e23a79a16908,Ahri,275
     38 LCK - LCK Cup 2025
     97 LCK - Split 2 2025
     75 LCK - Split 3 2025
      7 LCS - Promotion 2026
     21 LCS - Split 1 2026
     36 LCS - Split 2 2026
     11 LCS - Split 3 2026
     79 LEC - LEC Versus 2026
     54 LEC - Spring 2025
     53 LEC - Spring 2026
     30 LEC - Summer 2025
     59 LEC - Winter 2025
      6 LTA Cross-Conference - Regional Championship 2025
      7 LTA Cross-Conference - Split 1 2025
     12 LTA North - Split 1 2025
     52 LTA North - Split 2 2025
     22 LTA North - Split 3 2025
     12 LTA South - Split 1 2025
     52 LTA South - Split 2 2025
     22 LTA South - Split 3 2025
      1 event
746
af2355877299e99b27e247951415e6fb5a40fc82
v22.23.2
Python 3.13.17
```

```text
Bash command inspected the starter repository's series and metadata files and confirmed the Node.js and Python versions.
```

### Read web/app.js [100-220]

## Thinking

I found that the role vote could diverge from build.py if restricted to LCS season games, which would conflict with the requirement to keep the rules identical, so I'm checking whether the two votes actually differ. Next I'll count the series in the CSV and check whether the cached games include non-LCS ones before deciding anything.

### Read web/index.html

### Read web/planner.js

### Read web/app.js [210-370]

### Ran cd /home/ubuntu/workplace/draftroom && head -c 1500 web/vendor/fzstd.js; echo; grep -n "export\|decompress\|Decompress" web/vendor/fzstd.js | head -20; cat .junie/guidelines.md | head -5; grep -n "dlg\|focus-visible\|\.top\b\|\.setup\|secondary\|fbmap\|\.dot\|\.k\b\|\.hit\|--" web/style.css | head -120

```text
!function(f){typeof module!='undefined'&&typeof exports=='object'?module.exports=f():typeof define!='undefined'&&define.amd?define(['fzstd',f]):(typeof self!='undefined'?self:this).fzstd=f()}(function(){var _e={};"use strict";var r=ArrayBuffer,t=Uint8Array,e=Uint16Array,n=Int16Array,a=Uint32Array,s=Int32Array,i=function(r,e,n){if(t.prototype.slice)return t.prototype.slice.call(r,e,n);(null==e||e<0)&&(e=0),(null==n||n>r.length)&&(n=r.length);var a=new t(n-e);return a.set(r.subarray(e,n)),a},o=function(r,e,n,a){if(t.prototype.fill)return t.prototype.fill.call(r,e,n,a);for((null==n||n<0)&&(n=0),(null==a||a>r.length)&&(a=r.length);n<a;++n)r[n]=e;return r},u=function(r,e,n,a){if(t.prototype.copyWithin)return t.prototype.copyWithin.call(r,e,n,a);for((null==n||n<0)&&(n=0),(null==a||a>r.length)&&(a=r.length);n<a;)r[e++]=r[n++]};_e.ZstdErrorCode={InvalidData:0,WindowSizeTooLarge:1,InvalidBlockType:2,FSEAccuracyTooHigh:3,DistanceTooFarBack:4,UnexpectedEOF:5};var h=["invalid zstd data","window size too large (>2046MB)","invalid block type","FSE accuracy too high","match distance too far back","unexpected EOF"],f=function(r,t,e){var n=Error(t||h[r]);if(n.code=r,Error.captureStackTrace&&Error.captureStackTrace(n,f),!e)throw n;return n},l=function(r,t,e){for(var n=0,a=0;n<e;++n)a|=r[t++]<<(n<<3);return a},v=function(r,t){return(r[t]|r[t+1]<<8|r[t+2]<<16|r[t+3]<<24)>>>0},c=function(r,e){var n=r[0]|r[1]<<8|r[2]<<16;if(3126568==n&&253==r[3]){var a=r[4],i=a>>5&1,o=a>>2&1,u=3&a,h=a>>6;8&a&&f(0)
1:!function(f){typeof module!='undefined'&&typeof exports=='object'?module.exports=f():typeof define!='undefined'&&define.amd?define(['fzstd',f]):(typeof self!='undefined'?self:this).fzstd=f()}(function(){var _e={};"use strict";var r=ArrayBuffer,t=Uint8Array,e=Uint16Array,n=Int16Array,a=Uint32Array,s=Int32Array,i=function(r,e,n){if(t.prototype.slice)return t.prototype.slice.call(r,e,n);(null==e||e<0)&&(e=0),(null==n||n>r.length)&&(n=r.length);var a=new t(n-e);return a.set(r.subarray(e,n)),a},o=function(r,e,n,a){if(t.prototype.fill)return t.prototype.fill.call(r,e,n,a);for((null==n||n<0)&&(n=0),(null==a||a>r.length)&&(a=r.length);n<a;++n)r[n]=e;return r},u=function(r,e,n,a){if(t.prototype.copyWithin)return t.prototype.copyWithin.call(r,e,n,a);for((null==n||n<0)&&(n=0),(null==a||a>r.length)&&(a=r.length);n<a;)r[e++]=r[n++]};_e.ZstdErrorCode={InvalidData:0,WindowSizeTooLarge:1,InvalidBlockType:2,FSEAccuracyTooHigh:3,DistanceTooFarBack:4,UnexpectedEOF:5};var h=["invalid zstd data","window size too large (>2046MB)","invalid block type","FSE accuracy too high","match distance too far back","unexpected EOF"],f=function(r,t,e){var n=Error(t||h[r]);if(n.code=r,Error.captureStackTrace&&Error.captureStackTrace(n,f),!e)throw n;return n},l=function(r,t,e){for(var n=0,a=0;n<e;++n)a|=r[t++]<<(n<<3);return a},v=function(r,t){return(r[t]|r[t+1]<<8|r[t+2]<<16|r[t+3]<<24)>>>0},c=function(r,e){var n=r[0]|r[1]<<8|r[2]<<16;if(3126568==n&&253==r[3]){var a=r[4],i=a>>5&1,o=a>>2&1,u=3&a,h=a>>6;8&a&&f(0);var c=6-i,b=3==u?4:u,y=l(r,c,b),p=h?1<<h:i,w=l(r,c+=b,p)+(1==h&&256),g=w;if(!i){var d=1<<10+(r[5]>>3);g=d+(d>>3)*(7&r[5])}g>2145386496&&f(1);var m=new t((1==e?w||g:e?0:g)+12);return m[0]=1,m[4]=4,m[8]=8,{b:c+p,y:0,l:0,d:y,w:e&&1!=e?e:m.subarray(12),e:g,o:new s(m.buffer,0,3),u:w,c:o,m:Math.min(131072,g)}}if(25481893==(n>>4|r[3]<<20))return v(r,4)+8;f(0)},b=function(r){for(var t=0;1<<t<=r;++t);return t-1},y=function(a,s,i){var o=4+(s<<3),u=5+(15&a[s]);u>i&&f(3);for(var h=1<<u,l=h,v=-1,c=-1,y=-1,p=h,w=new r(512+(h<<2)),g=new n(w,0,256),d=new e(w,0,256),m=new e(w,512,h),z=512+(h<<1),E=new t(w,z,h),k=new t(w,z+h);v<255&&l>0;){var A=b(l+1),T=o>>3,x=(1<<A+1)-1,F=(a[T]|a[T+1]<<8|a[T+2]<<16)>>(7&o)&x,S=(1<<A)-1,B=x-l-1,I=F&S;if(I<B?(o+=A,F=I):(o+=A+1,F>S&&(F-=B)),g[++v]=--F,-1==F?(l+=F,E[--p]=v):l-=F,!F)do{var U=o>>3;c=(a[U]|a[U+1]<<8)>>(7&o)&3,o+=2,v+=c}while(3==c)}(v>255||l)&&f(0);for(var D=0,M=(h>>1)+(h>>3)+3,W=h-1,O=0;O<=v;++O){var j=g[O];if(j<1)d[O]=-j;else for(y=0;y<j;++y){E[D]=O;do{D=D+M&W}while(D>=p)}}for(D&&f(0),y=0;y<h;++y){var C=d[E[y]]++,H=k[y]=u-b(C);m[y]=(C<<H)-h}return[o+7>>3,{b:u,s:E,n:k,t:m}]},p=function(r,n){var a=0,s=-1,i=new t(292),u=r[n],h=i.subarray(0,256),l=i.subarray(256,268),v=new e(i.buffer,268);if(u<128){var c=y(r,n+1,6),p=c[1],w=c[0]<<3,g=r[n+=u];g||f(0);for(var d=0,m=0,z=p.b,E=z,k=(++n<<3)-8+b(g);!((k-=z)<w);){var A=k>>3;if(h[++s]=p.s[d+=(r[A]|r[A+1]<<8)>>(7&k)&(1<<z)-1],(k-=E)<w)break;h[++s]=p.s[m+=(r[A=k>>3]|r[A+1]<<8)>>(7&k)&(1<<E)-1],z=p.n[d],d=p.t[d],E=p.n[m],m=p.t[m]}++s>255&&f(0)}else{for(s=u-127;a<s;a+=2){var T=r[++n];h[a]=T>>4,h[a+1]=15&T}++n}var x=0;for(a=0;a<s;++a)(I=h[a])>11&&f(0),x+=I&&1<<I-1;var F=b(x)+1,S=1<<F,B=S-x;for(B&B-1&&f(0),h[s++]=b(B)+1,a=0;a<s;++a){var I;++l[h[a]=(I=h[a])&&F+1-I]}var U=new t(S<<1),D=U.subarray(0,S),M=U.subarray(S);for(v[F]=0,a=F;a>0;--a){var W=v[a];o(M,a,W,v[a-1]=W+l[a]*(1<<F-a))}for(v[0]!=S&&f(0),a=0;a<s;++a){var O=h[a];if(O){var j=v[O];o(D,a,j,v[O]=j+(1<<F-O))}}return[n,{n:M,b:F,s:D}]},w=y(new t([81,16,99,140,49,198,24,99,12,33,196,24,99,102,102,134,70,146,4]),0,6)[1],g=y(new t([33,20,196,24,99,140,33,132,16,66,8,33,132,16,66,8,33,68,68,68,68,68,68,68,68,36,9]),0,6)[1],d=y(new t([32,132,16,66,102,70,68,68,68,68,36,73,2]),0,5)[1],m=function(r,t){for(var e=r.length,n=new s(e),a=0;a<e;++a)n[a]=t,t+=1<<r[a];return n},z=new t(new s([0,0,0,0,16843009,50528770,134678020,202050057,269422093]).buffer,0,36),E=m(z,0),k=new t(new s([0,0,0,0,0,0,0,0,16843009,50528770,117769220,185207048,252579084,16]).buffer,0,53),A=m(k,3),T=function(r,t,e){var n=r.length,a=t.length,s=r[n-1],i=(1<<e.b)-1,o=-e.b;s||f(0);for(var u=0,h=e.b,l=(n<<3)-8+b(s)-h,v=-1;l>o&&v<a;){var c=l>>3;t[++v]=e.s[u=(u<<h|(r[c]|r[c+1]<<8|r[c+2]<<16)>>(7&l))&i],l-=h=e.n[u]}l==o&&v+1==a||f(0)},x=function(r,t,e){var n=6,a=t.length+3>>2,s=a<<1,i=a+s;T(r.subarray(n,n+=r[0]|r[1]<<8),t.subarray(0,a),e),T(r.subarray(n,n+=r[2]|r[3]<<8),t.subarray(a,s),e),T(r.subarray(n,n+=r[4]|r[5]<<8),t.subarray(s,i),e),T(r.subarray(n),t.subarray(i),e)},F=function(r,n,a){var s,u=n.b,h=r[u],l=h>>1&3;n.l=1&h;var v=h>>3|r[u+1]<<5|r[u+2]<<13,c=(u+=3)+v;if(1==l){if(u>=r.length)return;return n.b=u+1,a?(o(a,r[u],n.y,n.y+=v),a):o(new t(v),r[u])}if(!(c>r.length)){if(0==l)return n.b=c,a?(a.set(r.subarray(u,c),n.y),n.y+=v,a):i(r,u,c);if(2==l){var m=r[u],F=3&m,S=m>>2&3,B=m>>4,I=0,U=0;F<2?1&S?B|=r[++u]<<4|(2&S&&r[++u]<<12):B=m>>3:(U=S,S<2?(B|=(63&r[++u])<<4,I=r[u]>>6|r[++u]<<2):2==S?(B|=r[++u]<<4|(3&r[++u])<<12,I=r[u]>>2|r[++u]<<6):(B|=r[++u]<<4|(63&r[++u])<<12,I=r[u]>>6|r[++u]<<2|r[++u]<<10)),++u;var D=a?a.subarray(n.y,n.y+n.m):new t(n.m),M=D.length-B;if(0==F)D.set(r.subarray(u,u+=B),M);else if(1==F)o(D,r[u++],M);else{var W=n.h;if(2==F){var O=p(r,u);I+=u-(u=O[0]),n.h=W=O[1]}else W||f(0);(U?x:T)(r.subarray(u,u+=I),D.subarray(M),W)}var j=r[u++];if(j){255==j?j=32512+(r[u++]|r[u++]<<8):j>127&&(j=j-128<<8|r[u++]);var C=r[u++];3&C&&f(0);for(var H=[g,d,w],L=2;L>-1;--L){var Z=C>>2+(L<<1)&3;if(1==Z){var q=new t([0,0,r[u++]]);H[L]={s:q.subarray(2,3),n:q.subarray(0,1),t:new e(q.buffer,0,1),b:0}}else 2==Z?(u=(s=y(r,u,9-(1&L)))[0],H[L]=s[1]):3==Z&&(n.t||f(0),H[L]=n.t[L])}var G=n.t=H,J=G[0],K=G[1],N=G[2],P=r[c-1];P||f(0);var Q=(c<<3)-8+b(P)-N.b,R=Q>>3,V=0,X=(r[R]|r[R+1]<<8)>>(7&Q)&(1<<N.b)-1,Y=(r[R=(Q-=K.b)>>3]|r[R+1]<<8)>>(7&Q)&(1<<K.b)-1,$=(r[R=(Q-=J.b)>>3]|r[R+1]<<8)>>(7&Q)&(1<<J.b)-1;for(++j;--j;){var _=N.s[X],rr=N.n[X],tr=J.s[$],er=J.n[$],nr=K.s[Y],ar=K.n[Y],sr=1<<nr,ir=sr+((r[R=(Q-=nr)>>3]|r[R+1]<<8|r[R+2]<<16|r[R+3]<<24)>>>(7&Q)&sr-1);R=(Q-=k[tr])>>3;var or=A[tr]+((r[R]|r[R+1]<<8|r[R+2]<<16)>>(7&Q)&(1<<k[tr])-1);R=(Q-=z[_])>>3;var ur=E[_]+((r[R]|r[R+1]<<8|r[R+2]<<16)>>(7&Q)&(1<<z[_])-1);if(R=(Q-=rr)>>3,X=N.t[X]+((r[R]|r[R+1]<<8)>>(7&Q)&(1<<rr)-1),R=(Q-=er)>>3,$=J.t[$]+((r[R]|r[R+1]<<8)>>(7&Q)&(1<<er)-1),R=(Q-=ar)>>3,Y=K.t[Y]+((r[R]|r[R+1]<<8)>>(7&Q)&(1<<ar)-1),ir>3)n.o[2]=n.o[1],n.o[1]=n.o[0],n.o[0]=ir-=3;else{var hr=ir-(0!=ur);hr?(ir=3==hr?n.o[0]-1:n.o[hr],hr>1&&(n.o[2]=n.o[1]),n.o[1]=n.o[0],n.o[0]=ir):ir=n.o[0]}for(L=0;L<ur;++L)D[V+L]=D[M+L];M+=ur;var fr=(V+=ur)-ir;if(fr<0){var lr=-fr,vr=n.e+fr;for(lr>or&&(lr=or),L=0;L<lr;++L)D[V+L]=n.w[vr+L];V+=lr,or-=lr,fr=0}for(L=0;L<or;++L)D[V+L]=D[fr+L];V+=or}if(V!=M)for(;M<D.length;)D[V++]=D[M++];else V=D.length;a?n.y+=V:D=i(D,0,V)}else if(a){if(n.y+=B,M)for(L=0;L<B;++L)D[L]=D[M+L]}else M&&(D=i(D,M));return n.b=c,D}f(2)}},S=function(r,e){if(1==r.length)return r[0];for(var n=new t(e),a=0,s=0;a<r.length;++a){var i=r[a];n.set(i,s),s+=i.length}return n};function B(r,t){for(var e=[],n=+!t,a=0,s=0;r.length;){var i=c(r,n||t);if("object"==typeof i){for(n?(t=null,i.w.length==i.u&&(e.push(t=i.w),s+=i.u)):(e.push(t),i.e=0);!i.l;){var o=F(r,i,t);o||f(5),t?i.e=i.y:(e.push(o),s+=o.length,u(i.w,0,o.length),i.w.set(o,i.w.length-o.length))}a=i.b+4*i.c}else a=i;r=r.subarray(a)}return S(e,s)}_e.decompress=B;var I=function(){function r(r){this.ondata=r,this.c=[],this.l=0,this.z=0}return r.prototype.push=function(r,e){if("number"==typeof this.s){var n=Math.min(r.length,this.s);r=r.subarray(n),this.s-=n}var a=r.length+this.l;if(!this.s){if(e){if(!a)return void this.ondata(new t(0),!0);a<5&&f(5)}else if(a<18)return this.c.push(r),void(this.l=a);if(this.l&&(this.c.push(r),r=S(this.c,a),this.c=[],this.l=0),"number"==typeof(this.s=c(r)))return this.push(r,e)}if("number"!=typeof this.s){if(a<(this.z||3))return e&&f(5),this.c.push(r),void(this.l=a);if(this.l&&(this.c.push(r),r=S(this.c,a),this.c=[],this.l=0),!this.z&&a<(this.z=2&r[this.s.b]?4:3+(r[this.s.b]>>3|r[this.s.b+1]<<5|r[this.s.b+2]<<13)))return e&&f(5),this.c.push(r),void(this.l=a);for(this.z=0;;){var s=F(r,this.s);if(!s){e&&f(5);var i=r.subarray(this.s.b);return this.s.b=0,this.c.push(i),void(this.l+=i.length)}if(this.ondata(s,!1),u(this.s.w,0,s.length),this.s.w.set(s,this.s.w.length-s.length),this.s.l){var o=r.subarray(this.s.b);return this.s=4*this.s.c,void this.push(o,e)}}}else e&&f(5)},r}();_e.Decompress=I;return _e})
# Draft Room guidelines for Junie

- The app is plain HTML, CSS and JavaScript in `web/`. No frameworks, no build step. The only third-party code is `web/vendor/fzstd.js` (MIT, zstd decoder, vendored as a file). Ask before adding anything else.
- `web/planner.js` holds the plan rules and must keep running in Node (`node tests/planner.test.js`).
- Every number shown to a coach comes from `web/data.js`. Never invent a number.
2:    --paper: #0B1118; --sheet: #121A24; --raise: #182230; --ink: #E8EDF2; --pencil: #8F9BAA; --rule: #243142;
3:    --c9: #1E8BFF; --c9-wash: #12293B; --tl: #C3CEDC; --tl-wash: #1C2633; --ban: #FF3030; --ban-wash: #2A1719;
4:    --gold: #FFD000;
7:  body { max-width: 1440px; margin: 0 auto; background: var(--paper); color: var(--ink);
13:  .top { display: flex; align-items: center; gap: 24px; margin-bottom: 12px; }
15:  .match .us { color: var(--c9); } .match .them { color: var(--tl); }
17:  .top .game { color: var(--pencil); font-size: 14px; }
20:  .sheet { background: var(--sheet); border: 1px solid var(--rule); border-radius: 6px; padding: 14px 18px; }
22:  h3 + p.hint { color: var(--pencil); font-size: 13px; margin: -6px 0 10px; }
28:  .sides .us { color: var(--c9); } .sides .them { color: var(--tl); text-align: right; }
29:  .later { margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--rule); font-size: 13px; color: var(--pencil); }
30:  .phase + .phase { margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--rule); }
31:  .phase-name { grid-column: 1 / -1; text-align: center; color: var(--pencil); font-size: 13px; margin-bottom: 4px; }
34:  .slot .why { font-size: 13px; color: var(--pencil); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
38:  .slot .step { flex: none; width: 16px; font: 600 14px/1 "Barlow Condensed", sans-serif; color: var(--pencil); opacity: .8; }
39:  .us-pick { background: var(--c9-wash); }
40:  .us-pick .who { color: var(--c9); }
41:  .them-pick { background: var(--tl-wash); }
42:  .them-pick .who { color: var(--tl); }
43:  .is-ban .who { color: var(--ban); }
44:  .is-ban { background: var(--ban-wash); box-shadow: inset 3px 0 0 var(--ban); }
45:  .r.is-ban { box-shadow: inset -3px 0 0 var(--ban); }
46:  .open { border: 1px dashed var(--rule); color: var(--pencil); font-size: 13px; }
50:  .gone { display: flex; flex-wrap: wrap; gap: 2px 10px; margin-bottom: 10px; color: var(--pencil); font-size: 14px; }
53:  .pool td { padding: 4px 0; border-top: 1px solid var(--rule); vertical-align: baseline; }
54:  .pool td:first-child { color: var(--pencil); width: 58px; padding-right: 6px; }
56:  .pool i { font-style: normal; color: var(--pencil); }
60:  .pool .ch.ours b { color: var(--c9); }
61:  .pool .ch.ours::after { content: " \2713"; color: var(--c9); font-weight: 700; }
66:  .fp .took { color: var(--tl); font-weight: 600; }
68:                         font-size: 12.5px; color: var(--pencil); opacity: .7; }
73:  .used-h { font-size: 12.5px; color: var(--pencil); margin: 8px 0 4px; }
75:  .used span { padding: 1px 6px; border-radius: 3px; background: var(--raise); color: var(--pencil); }
77:  .used .t.us { color: var(--c9); } .used .t.them { color: var(--tl); }
78:  .thin { margin-top: 8px; font-size: 13.5px; color: var(--ban); }
80:  .orow { display: flex; align-items: center; gap: 6px; font-size: 13px; padding: 2px 0; border-top: 1px solid var(--rule); }
81:  .orow .role { width: 58px; flex: none; color: var(--pencil); }
82:  .orow .dots { display: flex; gap: 3px; flex: none; min-width: 86px; }
83:  .orow .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--c9); border: 1.5px solid var(--c9); }
84:  .orow .dot.plan { background: transparent; }
86:  .orow .warn { color: var(--ban); font-size: 12.5px; white-space: nowrap; margin-left: auto; }
89:  .habit { padding: 6px 0; border-top: 1px solid var(--rule); font-size: 14.5px; }
91:  .habit .big { font: 700 22px/1 "Barlow Condensed", sans-serif; color: var(--tl); margin-right: 6px; }
92:  .fbmap { display: grid; grid-template-columns: 132px 1fr; gap: 12px; align-items: center; margin-top: 4px; }
93:  .fbmap svg { width: 132px; height: 132px; display: block; }
94:  .fbmap .g { fill: #182230; }
95:  .fbmap .river { stroke: #1E3A52; stroke-width: 14; }
96:  .fbmap .lane { fill: none; stroke: #2B3A4D; stroke-width: 3; stroke-linecap: round; }
97:  .fbmap .base.us { fill: var(--c9); } .fbmap .base.them { fill: var(--tl); }
98:  .fbmap .dot { fill: var(--pencil); opacity: 0; transform-box: fill-box; transform-origin: center; transform: scale(.2);
100:  .fbmap .dot.hit { fill: var(--ban); stroke: var(--paper); stroke-width: .8; }
101:  .fbmap.show .dot { opacity: .9; transform: scale(1); }
102:  .fbmap p { font-size: 13.5px; line-height: 1.4; }
103:  .fbmap .key { display: block; margin-top: 6px; color: var(--pencil); font-size: 12.5px; }
104:  .fbmap .k { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--pencil); margin: 0 4px 0 8px; }
105:  .fbmap .k.hit { background: var(--ban); margin-left: 0; }
107:  .duel .h { color: var(--pencil); font-size: 12.5px; text-align: right; }
108:  .duel .h.c9 { color: var(--c9); } .duel .h.tl { color: var(--tl); }
110:  .duel .v.win { color: var(--c9); }
112:  .src { margin-top: 6px; color: var(--pencil); font-size: 12.5px; }
114:  .pickopp { margin-left: auto; display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--pencil); }
116:  .pickopp button { font: 600 14px "Barlow Condensed", sans-serif; color: var(--tl); background: var(--raise);
117:                    border: 1px solid var(--rule); border-radius: 4px; padding: 4px 10px; cursor: pointer; }
118:  .pickopp button[aria-pressed="true"] { background: var(--tl); color: var(--paper); border-color: var(--tl); }
119:  .pickopp button:focus-visible { outline: 2px solid var(--c9); outline-offset: 2px; }
120:  .duel .v.win.them { color: var(--tl); }
122:  .plan { display: grid; grid-template-columns: 1fr auto; background: var(--raise); color: var(--ink);
123:          outline: 1px solid var(--rule); outline-offset: -1px;
125:  .plan h2 { grid-column: 1 / -1; font: 500 14px/1 Barlow, sans-serif; color: var(--pencil); padding: 12px 24px 2px; }
129:  .plan-line .n { width: 30px; height: 30px; border-radius: 50%; border: 2px solid var(--pencil); color: var(--pencil);
132:  .plan-line .say .ban { color: var(--ban); }
133:  .plan-line .say .pick { color: var(--c9); }
134:  .plan-line .why { color: var(--pencil); font-size: 14px; line-height: 1.35; }
135:  .plan-line .why b { color: var(--ink); font-weight: 600; }
136:  .plan-line.lit { background: var(--rule); box-shadow: inset 4px 0 0 var(--gold); }
137:  .plan-line.lit .why { color: var(--ink); }
138:  .plan-line.lit .n { border-color: var(--c9); color: var(--ink); }
139:  .plan-line.done .n { background: var(--gold); border-color: var(--gold); color: var(--paper); font-size: 0; }
142:              border-left: 1px solid var(--rule); }
143:  .plan .go small { color: var(--pencil); font-size: 13px; text-align: center; }
144:  .plan button { font: 600 18px Barlow, sans-serif; background: var(--gold); color: var(--paper);
146:  .plan button:focus-visible { outline: 3px solid var(--c9); outline-offset: 2px; }
154:  .clock .turn { font-weight: 600; color: var(--c9); transition: color .2s; }
155:  .clock .turn.them { color: var(--tl); }
156:  .clock .turn.done { color: var(--gold); }
158:  .clock-bar { height: 4px; background: var(--rule); border-radius: 2px; margin-top: 5px; overflow: hidden; }
159:  .clock-bar div { height: 100%; width: 100%; background: var(--c9); transform-origin: left; }
160:  .clock-bar div.them { background: var(--tl); }
162:  .ctrl button { font: 500 12.5px Barlow, sans-serif; color: var(--ink); background: var(--raise);
163:                 border: 1px solid var(--rule); border-radius: 4px; padding: 4px 10px; cursor: pointer; }
164:  .ctrl button:focus-visible { outline: 2px solid var(--c9); outline-offset: 2px; }
168:  .slot.pending { background: transparent !important; box-shadow: inset 0 0 0 1px var(--rule) !important; }
170:  .slot.active { box-shadow: inset 0 0 0 2px var(--c9) !important; animation: hover-glow 1s ease-in-out infinite; }
171:  .slot.r.active { box-shadow: inset 0 0 0 2px var(--tl) !important; }
174:  .slot.active.us-pick, .slot.active.l.is-ban { background: var(--c9-wash) !important; }
175:  .slot.active.them-pick, .slot.active.r.is-ban { background: var(--tl-wash) !important; }
176:  .slot.active.is-ban .who { color: var(--ink); }
179:  .slot.locked::before { content: ""; position: absolute; inset: 0; border-radius: 4px; background: var(--gold);
184:  @keyframes ban-bar { 0% { box-shadow: inset 0 0 0 0 var(--ban); } }
185:  .slot .step.now { color: var(--ink); opacity: 1; }
186:  .phase-name.now { color: var(--ink); font-weight: 600; }
188:    .fbmap { grid-template-columns: 104px 1fr; } .fbmap svg { width: 104px; height: 104px; }
190:    .top { margin-bottom: 8px; }
213:    .orow .dot { width: 8px; height: 8px; }
221:    .top .game { margin-top: 2px; }
237:    .slot, .slot.locked, .slot.active, .plan-line, .slot.locked::before, .fbmap .dot { animation: none !important; transition: none !important; }
241:.setup { margin-left: auto; display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--pencil); }
242:.setup select, .setup button, .dlg select, .dlg input, .dlg button {
243:  font: 500 13.5px Barlow, sans-serif; color: var(--ink); background: var(--raise);
244:  border: 1px solid var(--rule); border-radius: 4px; padding: 5px 8px; }
245:.setup button, .dlg button { cursor: pointer; }
246:.setup :focus-visible, .dlg :focus-visible, .games-strip button:focus-visible { outline: 2px solid var(--c9); outline-offset: 1px; }
249:  border: 1px solid var(--rule); background: var(--raise); color: var(--pencil); cursor: pointer; }
250:.games-strip button.won { background: var(--c9); border-color: var(--c9); color: var(--paper); }
251:.games-strip button.lost { background: var(--tl); border-color: var(--tl); color: var(--paper); }
252:.games-strip button.now { border-color: var(--ink); color: var(--ink); }
254:.empty { color: var(--pencil); font-size: 13px; }
256:.plan .go button.secondary { font-size: 14px; background: var(--raise); color: var(--ink); border: 1px solid var(--rule); padding: 6px 14px; }
257:.plan .go button.secondary:focus-visible { outline: 2px solid var(--c9); outline-offset: 2px; }
260:.dlg { margin: auto; border: 0; border-radius: 8px; padding: 22px 24px; width: 640px; color: var(--ink); background: var(--raise); outline: 1px solid var(--rule); outline-offset: -1px; box-shadow: 0 12px 40px rgba(0,0,0,.5); }
```

```text
The bash command ran successfully and printed the vendored decoder, project guidelines, and style rules, with the output truncated.
```

### Read web/style.css

## Thinking

I've been porting the Python extraction and build logic into a JavaScript loader, working through rounding, tie-breaking, and key-order details so the output matches data.js exactly. Next I'm checking whether role votes computed only over the LCS 2026 games differ from the full-game profiles, then I'll write web/loader.js.

### Ran cd /home/ubuntu/workplace/draftroom && cat > $JUNIE_TMPDIR/votes.py <<'EOF' import sys, json, csv, collections sys.path.insert(0, 'pipeline') import build data = '../stl-hackathon-2026-grid-starter' G = json.load(open('cache/games.json')) gi = {g['game_id']: g for g in G} roster = collections.defaultdict(list) for r in csv.DictReader(open(data + '/meta/rosters.csv')):     if r['title'] == 'lol': roster[r['game_id']].append(r) names = {r['team_id']: r['name'] for r in csv.DictReader(open(data + '/meta/teams.csv')) if r['title'] == 'lol'} season = [g for g in G if g['date'] >= '2026-01-01' and g.get('winner') and 'LCS' in g['event']] allv = build.vote_roles([gi[k] for k in roster if k in gi], roster) sg = {g['game_id'] for g in season} # any LCS 2026 game (even without winner) would be fetched lcs = [g for g in G if g['date'] >= '2026-01-01' and 'LCS' in g['event']] lg = {g['game_id'] for g in lcs} sv = build.vote_roles([gi[k] for k in roster if k in lg], roster) print(len(G), len(season), len(lcs)) diff = {p for p in set(allv) | set(sv) if allv.get(p) != sv.get(p)} print('players differing', len(diff)) t1 = build.build_profiles(season, roster, allv, names, 10) t2 = build.build_profiles(season, roster, sv, names, 10) print(json.dumps(t1) == json.dumps(t2), len(t1), len(t2)) EOF python3 $JUNIE_TMPDIR/votes.py; ls -lS ../stl-hackathon-2026-grid-starter/lol | head -4; du -sh ../stl-hackathon-2026-grid-starter/lol; grep -c . /dev/null; grep -h "LCS" ../stl-hackathon-2026-grid-starter/lol/series.csv | cut -d, -f1,4 | head -2

```text
1775 212 225
players differing 216
True 9 9
total 363856
-rw-r--r-- 1 ubuntu ubuntu 1260119 Nov 23 14:07 events_2754374_grid.jsonl.zst
-rw-r--r-- 1 ubuntu ubuntu 1145062 Nov 23 14:07 events_2754370_grid.jsonl.zst
-rw-r--r-- 1 ubuntu ubuntu 1140702 Nov 23 14:07 events_2796222_grid.jsonl.zst
ls: Broken pipe
356M	../stl-hackathon-2026-grid-starter/lol
0
2893371,2026-01-24T22:10:00Z
2885335,2026-01-25T00:00:00Z
```

```text
The script compared player vote results for 2026 LCS games with and without the winner filter, finding that 216 players differed between the two sets, yet the resulting profile outputs (9 each) were identical.
```

### Ran cd /home/ubuntu/workplace/draftroom && node -e " const fz=require('./web/vendor/fzstd.js');const fs=require('fs'); const b=fs.readFileSync('../stl-hackathon-2026-grid-starter/lol/events_2893371_grid.jsonl.zst'); let t=Date.now();const o=fz.decompress(new Uint8Array(b));console.log(o.length,Date.now()-t,'ms'); const s=new TextDecoder().decode(o);const L=s.split('\n');console.log(L.length, JSON.parse(L[0]).occurredAt, JSON.parse(L[5]).occurredAt); const set=new Set();for(const l of L.slice(0,3000)){if(l)set.add(JSON.parse(l).occurredAt.replace(/\d/g,'9'))}console.log([...set]); "; python3 - <<'EOF' import csv rows=list(csv.DictReader(open('../stl-hackathon-2026-grid-starter/lol/series.csv'))) print(sorted({r['scheduled_start'].replace('0','9')[:30] for r in rows})[:3], len(rows)) EOF

```text
14224446 133 ms
2183 2026-01-24T21:21:41.451Z 2026-01-24T21:22:15.451Z
[ '9999-99-99T99:99:99.999Z' ]
['2925-91-15T11:29:99Z', '2925-91-15T98:99:99Z', '2925-91-16T11:99:99Z'] 745
```

```text
The command decompressed the events file (about 14.2 MB in 133 ms) into 2,183 lines, confirmed the timestamp format in the event records, and counted 745 rows in the series CSV with scheduled start values checked.
```

### Ran cd /home/ubuntu/workplace/draftroom && python3 - <<'EOF' import sys, collections sys.path.insert(0,'pipeline') from extract import zone for r in range(3):  # r0 = top of map (high y)     row=[]     for c in range(3):         cnt=collections.Counter()         for i in range(50):             for j in range(50):                 x=c*5000+i*100+50; y=(2-r)*5000+j*100+50                 cnt[zone({'x':x,'y':y})]+=1         row.append(dict(cnt.most_common(2)))     print(row) EOF python3 -c "import playwright;print('pw ok')"

```text
[{'top': 2100, 'jungle': 400}, {'top': 1200, 'jungle': 1147}, {'mid': 1444, 'jungle': 1056}]
[{'top': 1200, 'jungle': 1147}, {'mid': 1444, 'jungle': 1056}, {'bot': 1200, 'jungle': 1147}]
[{'mid': 1444, 'jungle': 1056}, {'bot': 1200, 'jungle': 1147}, {'bot': 2100, 'jungle': 400}]
pw ok
```

```text
The bash command ran a 3x3 zone classification check over the map grid, reporting the two most common zones per cell (such as top, mid, bot, and jungle), and confirmed that the Playwright module is available.
```

## Thinking

I confirmed that the LCS 2026 series alone gives the same team profiles as the full dataset, so I can skip the other files, and I sampled the map to lay out a 3x3 zone grid for the demo. Next I'm checking where `fb_got` and `fb_gave` are used before I edit planner.js.

### Searched fb_got|fb_gave|fb_map|data\.js|DRAFTROOM

```text
.junie/guidelines.md [3—8]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
.junie/sessions/2026 [11—11]
```

### Ran cd /home/ubuntu/workplace/draftroom && grep -n "fb_got\|fb_gave\|fb_map\|data\.js\|DRAFTROOM" web/*.js web/*.html tests/*.js tests/*.py pipeline/*.py README.md docs/*.md | grep -v "^web/data.js" | cut -c1-170

```text
web/app.js:4:  const D = window.DRAFTROOM, P = window.Planner;
web/app.js:12:  if (!D) { document.body.innerHTML = '<p style="padding:40px">web/data.js is missing. Run <code>python pipeline/build.py</code> first (see README).</p>'; r
web/app.js:183:    const dots = m.fb_map.map(([x, y, hit], k) =>
web/planner.js:99:    const gave = op.fb_gave;
web/planner.js:109:      const med = us.fb_got[Math.floor(us.fb_got.length / 2)];
web/planner.js:159:      fb_map: gave.filter(v => v[3] != null).map(v => [...flip(v), v[1] === vr ? 1 : 0]),
web/index.html:109:<script src="data.js"></script>
tests/planner.test.js:3:// Run: node tests/planner.test.js   (needs web/data.js from pipeline/build.py)
tests/planner.test.js:5:const src = fs.readFileSync(path.join(__dirname, '..', 'web', 'data.js'), 'utf8');
tests/planner.test.js:8:const D = window.DRAFTROOM;
pipeline/build.py:1:"""Turn cache/games.json and the starter repo's meta tables into web/data.js:
pipeline/build.py:4:data.js holds aggregates derived from licensed data. It stays out of git;
pipeline/build.py:65:        e = collections.Counter(); fd = []; fb_got = []; fb_gave = []
pipeline/build.py:91:                fb_got.append(fb['sec'])
pipeline/build.py:94:                fb_gave.append([fb['zone'], main_role.get(fb.get('victim_id')), fb.get('victim'), p[0], p[1], side])
pipeline/build.py:109:            'fb_got': sorted(fb_got), 'fb_gave': fb_gave,
pipeline/build.py:118:    ap.add_argument('--out', default='web/data.js')
pipeline/build.py:174:                   'window.DRAFTROOM = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n')
README.md:75:| `pipeline/build.py` | Builds team profiles and the real series into `web/data.js`. |
README.md:87:The match data is © GRID eSports GmbH and Riot Games, Inc. and is licensed only for building hackathon projects. It is not in this repository: `cache/` and `
```

```text
The grep search located references to the fb_got, fb_gave, and fb_map fields across the web, test, pipeline, and documentation files, showing where they are defined, used, and the data file is generated.
```

## Thinking

I found that the search was swamped by session files, so I'm narrowing it to the web, tests, pipeline and README folders to locate where fb_got, fb_gave and data.js are used. I'm now writing the planner code, starting with the rule for picking the victim name and the fallback values for the summary.

### Ran cd /home/ubuntu/workplace/draftroom && python3 - <<'EOF' p='web/planner.js' s=open(p).read() old=s[s.index("    const gave = op.fb_gave;"):s.index("    let line3, why3;")] new='''    // fb_gave is a list of deaths in the full form, or counts only in the demo form     const gave = op.fb_gave, summary = !Array.isArray(gave), gaveN = summary ? gave.n : gave.length;     let roleCount = {}, vicNames = {}, vicZones = {};     if (summary) roleCount = gave.by_role || {};     else gave.forEach(v => { if (v[1]) roleCount[v[1]] = (roleCount[v[1]] || 0) + 1; });     const [vr, vrN] = top(roleCount)[0] || [null, 0];     if (summary) {       // counts by name are not split by role: take the role's main player when they appear, else the most frequent name       vicNames = gave.by_name || {};       vicZones = (gave.by_role_zone || {})[vr] || {};     } else       gave.filter(v => v[1] === vr).forEach(v => { vicNames[v[2]] = (vicNames[v[2]] || 0) + 1; vicZones[v[0]] = (vicZones[v[0]] || 0) + 1; });     const mainName = op.players[vr];     const vicName = (summary && mainName in vicNames ? mainName : (top(vicNames)[0] || [mainName])[0]);     const [vz, vzN] = top(vicZones)[0] || ['jungle', 0]; ''' s=s.replace(old,new) s=s.replace("      const med = us.fb_got[Math.floor(us.fb_got.length / 2)];","      const med = Array.isArray(us.fb_got) ? us.fb_got[Math.floor(us.fb_got.length / 2)] : us.fb_got.median;") s=s.replace("<b>${vrN} of ${gave.length}</b> games","<b>${vrN} of ${gaveN}</b> games") s=s.replace("      fb_map: gave.filter(v => v[3] != null).map(v => [...flip(v), v[1] === vr ? 1 : 0]),\n      fb_victim: { name: vicName, role: ROLE_PERSON[vr] || '', n: vrN, of: gave.length },", "      fb_map: summary ? [] : gave.filter(v => v[3] != null).map(v => [...flip(v), v[1] === vr ? 1 : 0]),\n      fb_grid: summary ? { zones: gave.by_zone || {}, hit: vz } : null,\n      fb_victim: { name: vicName, role: ROLE_PERSON[vr] || '', n: vrN, of: gaveN },") open(p,'w').write(s) EOF git diff --stat; node tests/planner.test.js

```text
 web/planner.js | 28 ++++++++++++++++++----------
 1 file changed, 18 insertions(+), 10 deletions(-)
ok: 360 plans across 9 teams
```

```text
The planner script was updated to handle both full and summary forms of death data, and the planner tests passed with 360 plans across 9 teams.
```

### Ran cd /home/ubuntu/workplace/draftroom && python3 - <<'EOF' p='pipeline/build.py' s=open(p).read() s=s.replace('''    python pipeline/build.py --data ../stl-hackathon-2026-grid-starter """''','''    python pipeline/build.py --data ../stl-hackathon-2026-grid-starter      python pipeline/build.py --public     # web/demo-data.js: season aggregates only, safe to commit """''',1) s=s.replace('''def main():     ap = argparse.ArgumentParser()''','''def summarize(t):     """The public form of a profile: fb_got and fb_gave shrink to counts, so no per-game row,     position or time series is left. Everything else in a profile is already a count or an average."""     got, gave = t['fb_got'], t['fb_gave']     by_role, by_name, by_zone = collections.Counter(), collections.Counter(), collections.Counter()     by_role_zone = collections.defaultdict(collections.Counter)     for zone, role, victim, *_ in gave:         if role:             by_role[role] += 1         if victim:             by_name[victim] += 1         if zone:             by_zone[zone] += 1             if role:                 by_role_zone[role][zone] += 1     p = dict(t)     p['fb_got'] = {'n': len(got), 'median': got[len(got) // 2] if got else None}     p['fb_gave'] = {'n': len(gave), 'by_role': dict(by_role), 'by_name': dict(by_name), 'by_zone': dict(by_zone),                     'by_role_zone': {r: dict(c) for r, c in by_role_zone.items()}}     return p   def main():     ap = argparse.ArgumentParser()''',1) s=s.replace("ap.add_argument('--out', default='web/data.js')","ap.add_argument('--out', default=None, help='default: web/data.js, or web/demo-data.js with --public')") s=s.replace('''    args = ap.parse_args()     data = Path(args.data)''','''    ap.add_argument('--public', action='store_true',                     help='write web/demo-data.js: season aggregates only (no series, no positions, no per-game rows)')     args = ap.parse_args()     args.out = args.out or ('web/demo-data.js' if args.public else 'web/data.js')     data = Path(args.data)''',1) s=s.replace('''    payload = {'season': f'{args.league} {args.since[:4]}', 'champions': champions, 'teams': teams, 'series': out_series}     out = Path(args.out)     out.write_text('// Built by pipeline/build.py from the GRID starter data. Do not commit.\\n' ''','''    payload = {'season': f'{args.league} {args.since[:4]}', 'champions': champions, 'teams': teams, 'series': out_series}     if args.public:         payload['teams'] = {tid: summarize(t) for tid, t in teams.items()}         payload['series'] = []         payload['source'] = 'demo'         header = '// Built by pipeline/build.py --public: season aggregates only (counts, records, averages). No match rows.\\n'     else:         header = '// Built by pipeline/build.py from the GRID starter data. Do not commit.\\n'     out = Path(args.out)     out.write_text(header + ''',1) s=s.replace('''    print(f"{len(teams)} teams, {len(out_series)} series -> {out}''','''    print(f"{len(teams)} teams, {len(payload['series'])} series -> {out}''') open(p,'w').write(s) EOF sed -n 195,225p pipeline/build.py; python3 pipeline/build.py --public && python3 pipeline/build.py --out $JUNIE_TMPDIR/full.js && cmp $JUNIE_TMPDIR/full.js web/data.js && echo same; ls -la web/demo-data.js; head -c 600 web/demo-data.js

```text
            else:
                t['name'], t['tag'] = next(fake)

    payload = {'season': f'{args.league} {args.since[:4]}', 'champions': champions, 'teams': teams, 'series': out_series}
    if args.public:
        payload['teams'] = {tid: summarize(t) for tid, t in teams.items()}
        payload['series'] = []
        payload['source'] = 'demo'
        header = '// Built by pipeline/build.py --public: season aggregates only (counts, records, averages). No match rows.\n'
    else:
        header = '// Built by pipeline/build.py from the GRID starter data. Do not commit.\n'
    out = Path(args.out)
    out.write_text(header +
                   'window.DRAFTROOM = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(f"{len(teams)} teams, {len(payload['series'])} series -> {out} ({out.stat().st_size // 1024} KB)")


if __name__ == '__main__':
    main()
9 teams, 0 series -> web/demo-data.js (38 KB)
9 teams, 70 series -> /tmp/junie-session-261124-225411-1es7/full.js (168 KB)
same
-rw-r--r-- 1 ubuntu ubuntu 39906 Nov 24 22:57 web/demo-data.js
// Built by pipeline/build.py --public: season aggregates only (counts, records, averages). No match rows.
window.DRAFTROOM = {"season":"LCS 2026","champions":["Aatrox","Ahri","Akali","Alistar","Ambessa","Amumu","Anivia","Annie","Aphelios","Ashe","Aurelion Sol","Aurora","Azir","Bard","Blitzcrank","Brand","Braum","Caitlyn","Camille","Cassiopeia","Cho'Gath","Corki","Darius","Diana","Dr. Mundo","Draven","Ekko","Elise","Ezreal","Fiddlesticks","Fiora","Galio","Gangplank","Garen","Gnar","Gragas","Gwen","Hecarim","Hwei","Irelia","Ivern","Janna","Jarvan IV","Jax","Jayce","Jhin","Jinx","K'Sante","Kai'S
```

```text
The build script was updated with a `--public` option that writes a season-aggregates-only demo data file, and running it produced `web/demo-data.js` with 9 teams and no series, while the default full build matched the existing output.
```

### Read tests/planner.test.js

## Thinking

The planner now accepts both data forms, and build.py's `--public` flag produces a 38 KB demo file with 9 teams and no series. I'm next rewriting planner.test.js to loop over both data files, skip data.js when it's absent, and cross-check that the demo and full plans match on bans, picks, and steps.

### Ran cd /home/ubuntu/workplace/draftroom && python3 - <<'EOF' p='tests/planner.test.js' s=open(p).read() s=s.replace('''// Run: node tests/planner.test.js   (needs web/data.js from pipeline/build.py) const fs = require('fs'), path = require('path'), assert = require('assert'); const src = fs.readFileSync(path.join(__dirname, '..', 'web', 'data.js'), 'utf8'); const window = {}; new Function('window', src)(window); const D = window.DRAFTROOM; const { plan, outlook } = require('../web/planner.js');  let checked = 0; ''','''// Run: node tests/planner.test.js // It runs on web/data.js (full form, from pipeline/build.py, skipped when missing) and on // web/demo-data.js (aggregates only). When both exist, the plans must agree. const fs = require('fs'), path = require('path'), assert = require('assert'); const { plan, outlook } = require('../web/planner.js');  function read(name) {   const file = path.join(__dirname, '..', 'web', name);   if (!fs.existsSync(file)) return null;   const window = {};   new Function('window', fs.readFileSync(file, 'utf8'))(window);   return window.DRAFTROOM; }  function check(name, D) {   let checked = 0; ''') body=s[s.index("for (const us of Object.keys(D.teams))"):s.index("console.log(")] body='\n'.join(('  '+l if l.strip() else l) for l in body.split('\n')) s=s[:s.index("for (const us of Object.keys(D.teams))")]+body.rstrip()+'''   console.log(`ok: ${name}: ${checked} plans across ${Object.keys(D.teams).length} teams`); }  const full = read('data.js'), demo = read('demo-data.js'); assert(full || demo, 'neither web/data.js nor web/demo-data.js exists'); if (full) check('data.js', full); if (demo) {   assert.strictEqual(demo.source, 'demo');   assert.deepStrictEqual(demo.series, []);   check('demo-data.js', demo); } if (full && demo) {   // the demo form must give the same plan as the full form it was summarised from   let same = 0, same3 = 0;   for (const us of Object.keys(full.teams)) for (const them of Object.keys(full.teams)) {     if (us === them) continue;     const a = plan(full, us, them, [], true), b = plan(demo, us, them, [], true);     assert.deepStrictEqual(b.steps, a.steps, `${us} vs ${them}: demo steps differ`);     assert.deepStrictEqual(b.habits.slice(0, 2), a.habits.slice(0, 2));     same++;     if (b.plan.line3 === a.plan.line3 && b.plan.why3 === a.plan.why3) same3++;     else console.log(`note: ${us} vs ${them}: line 3 differs\\n  full: ${a.plan.line3}\\n  demo: ${b.plan.line3}`);   }   console.log(`ok: demo plans match full plans (${same}), game plan line identical in ${same3}`); } ''' open(p,'w').write(s) EOF tail -45 tests/planner.test.js | head -20; node tests/planner.test.js

```text
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
ok: data.js: 360 plans across 9 teams
ok: demo-data.js: 360 plans across 9 teams
ok: demo plans match full plans (72), game plan line identical in 72
```

```text
The planner test file was rewritten to check both the full and demo data forms, and running it passed: 360 plans were verified for each form across 9 teams, and all 72 demo plans matched their full-form counterparts.
```

### Edited web/loader.js +346

#### web/loader.js

```diff
--- a/web/loader.js
+++ b/web/loader.js
@@ -1,0 +1,346 @@
+// Draft Room loader: a port of pipeline/extract.py and pipeline/build.py that runs in the
+// browser (or in Node, for tests/loader.check.js). It reads the official starter data,
+// extracts the same facts per game, and builds the same profiles and series as web/data.js.
+// Keep the rules identical to the Python scripts; change both together.
+//
+// The data goes from GitHub to this browser only. Nothing is uploaded anywhere.
+(function (root) {
+  const REPO = 'cloud9esports/stl-hackathon-2026-grid-starter';
+  const RAW = `https://raw.githubusercontent.com/${REPO}/main/`;
+  const LATEST = `https://api.github.com/repos/${REPO}/commits/main`;
+  const ROLES = ['top', 'jungle', 'mid', 'adc', 'support'];
+  const RECENT = 10;
+  const TAGS = { 'Cloud9 Kia': 'C9', 'Team Liquid Alienware': 'TL', 'FlyQuest': 'FLY', 'LYON': 'LYON', 'Sentinels': 'SEN',
+    'Shopify Rebellion': 'SR', 'Disguised': 'DSG', 'Dignitas': 'DIG', '100 Thieves': '100' };
+  const SHORT = { 'Team Liquid Alienware': 'Team Liquid' };
+  const fz = typeof module !== 'undefined' && module.exports ? require('./vendor/fzstd.js') : root.fzstd;
+
+  // ---------- small Python-compatible helpers ----------
+  // Python's round(): halves go to the even number
+  function pyRound(x) {
+    const f = Math.floor(x), d = x - f;
+    if (d < 0.5) return f;
+    if (d > 0.5) return f + 1;
+    return f % 2 === 0 ? f : f + 1;
+  }
+  // datetime.fromisoformat(s).timestamp(): whole microseconds, divided once
+  function ts(s) {
+    const m = /^(\d{4})-(\d\d)-(\d\d)[T ](\d\d):(\d\d):(\d\d)(?:\.(\d+))?(Z|[+-]\d\d:?\d\d)?$/.exec(s);
+    if (!m) throw new Error(`bad timestamp ${s}`);
+    let micro = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) * 1000 + +((m[7] || '').padEnd(6, '0').slice(0, 6) || 0);
+    if (m[8] && m[8] !== 'Z') {
+      const sign = m[8][0] === '-' ? -1 : 1, hm = m[8].slice(1).replace(':', '');
+      micro -= sign * (+hm.slice(0, 2) * 60 + +hm.slice(2)) * 60e6;
+    }
+    return micro / 1e6;
+  }
+  // csv.DictReader
+  function parseCsv(text) {
+    const rows = [];
+    let row = [], field = '', quoted = false;
+    for (let i = 0; i < text.length; i++) {
+      const c = text[i];
+      if (quoted) {
+        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false; } else field += c;
+      } else if (c === '"') quoted = true;
+      else if (c === ',') { row.push(field); field = ''; }
+      else if (c === '\n' || c === '\r') {
+        if (c === '\r' && text[i + 1] === '\n') i++;
+        row.push(field); field = '';
+        if (row.length > 1 || row[0] !== '') rows.push(row);
+        row = [];
+      } else field += c;
+    }
+    if (field !== '' || row.length) { row.push(field); if (row.length > 1 || row[0] !== '') rows.push(row); }
+    const head = rows.shift() || [];
+    return rows.map(r => Object.fromEntries(head.map((h, i) => [h.replace(/^\uFEFF/, ''), r[i] === undefined ? '' : r[i]])));
+  }
+  const truthy = o => !!o && (typeof o !== 'object' || Object.keys(o).length > 0);
+
+  // ---------- extract.py ----------
+  // Rough Summoner's Rift area for a point in game units.
+  function zone(p) {
+    if (!truthy(p)) return null;
+    const x = p.x, y = p.y;
+    if (x < 3000 && y > 6000 || y > 12000 && x < 9000) return 'top';
+    if (y < 3000 && x > 6000 || x > 12000 && y < 9000) return 'bot';
+    if (Math.abs(x - y) < 1800) return 'mid';
+    return 'jungle';
+  }
+
+  function seriesGames(text, row) {
+    const games = [];
+    let cur = null;
+    for (const line of text.split('\n')) {
+      if (!line.trim()) continue;
+      const env = JSON.parse(line);
+      const at = ts(env.occurredAt);
+      for (const ev of env.events) {
+        const t = ev.type;
+        if (t === 'team-banned-character' || t === 'team-picked-character') {
+          for (const g of (ev.seriesStateDelta || {}).games || []) {
+            for (const d of g.draftActions || []) {
+              if (cur === null || cur.game_id !== g.id) {
+                cur = { series_id: row.series_id, event: row.event, date: row.scheduled_start.slice(0, 10), game_id: g.id, draft: [], start: null };
+                games.push(cur);
+              }
+              cur.draft.push([d.sequenceNumber, d.type, d.drafter.id, d.draftable.name]);
+            }
+          }
+          continue;
+        }
+        if (t === 'series-started-game' && cur !== null) cur.start = at;
+        if (t === 'series-!started-game') {            // a rolled-back (abandoned) game
+          const gid = (ev.target || {}).id;
+          for (let i = games.length - 1; i >= 0; i--) if (games[i].game_id === gid) games.splice(i, 1);
+          cur = games.length ? games[games.length - 1] : null;
+        }
+        if (cur === null || cur.start === null) continue;
+        const sec = pyRound(at - cur.start);
+        const actor = ev.actor || {};
+        const a = actor.state || {};
+        const team = a.teamId, pos = (a.game || {}).position;
+        const tgt = ev.target || {};
+        const tid = tgt.id;
+        if (actor.type === 'player' && truthy(pos) && sec >= 90 && sec <= 330) {
+          const lane = (cur.lane = cur.lane || {})[a.name] || (cur.lane[a.name] = {});
+          const zz = zone(pos);
+          lane[zz] = (lane[zz] || 0) + 1;
+        }
+        if (t === 'player-purchased-item' && sec < 60) {
+          const items = (((a.game || {}).inventory || {}).items || []).map(i => i.name);
+          const list = (cur.start_items = cur.start_items || {})[a.name] || (cur.start_items[a.name] = []);
+          for (const i of items) if (i) list.push(i);
+        }
+        if (t === 'player-killed-player' && !('first_blood' in cur)) {
+          const v = tgt.state || {};
+          cur.first_blood = { sec, team: team ?? null, zone: zone(pos), killer: a.name ?? null, victim: v.name ?? null,
+            victim_id: tid ?? null, pos: truthy(pos) ? [pyRound(pos.x), pyRound(pos.y)] : null };
+        } else if (t === 'player-killed-BTierNPC' && tid && tid.startsWith('riftScuttler') && !('first_scuttle' in cur)) {
+          cur.first_scuttle = { sec, team: team ?? null, side: tid.endsWith('Top') ? 'top' : 'bot', who: a.name ?? null };
+        } else if (t === 'player-killed-ATierNPC' && tid && tid.endsWith('Drake') && !('first_dragon' in cur)) {
+          cur.first_dragon = { sec, team: team ?? null, kind: tid };
+        } else if (t === 'player-killed-ATierNPC' && tid && tid.startsWith('voidGrub') && !('first_grub' in cur)) {
+          cur.first_grub = { sec, team: team ?? null };
+        } else if (t === 'team-won-game') {
+          const st = tgt.state || {};
+          for (const tm of (tgt.stateDelta || {}).teams || []) if (tm.won) cur.winner = tm.id;
+          cur.length = (st.clock || {}).currentSeconds ?? null;
+          cur.gold = Object.fromEntries((st.teams || []).map(tm => [tm.id, tm.netWorth ?? null]));
+        }
+      }
+    }
+    for (const g of games) delete g.start;
+    return games;
+  }
+
+  // a remake keeps the same draft as the next game in the series: keep the replay only
+  function dropRemakes(games) {
+    return games.filter((g, i) => !(i + 1 < games.length && games[i + 1].series_id === g.series_id &&
+      JSON.stringify(games[i + 1].draft) === JSON.stringify(g.draft)));
+  }
+
+  // ---------- build.py ----------
+  const mostCommon = m => { let best = null, n = -1; for (const [k, v] of m) if (v > n) { best = k; n = v; } return best; };
+  const bump = (m, k, by = 1) => m.set(k, (m.get(k) || 0) + by);
+
+  // Guess a player's role from where they stood in minutes 1:30-5:30 and their starting item.
+  function roleOf(g, player) {
+    const lane = (g.lane || {})[player] || {};
+    const items = (g.start_items || {})[player] || [];
+    const doran = items.filter(i => i.startsWith('Doran'));
+    let mode = null, best = -1;
+    for (const k of Object.keys(lane)) if (['top', 'mid', 'bot'].includes(k) && lane[k] > best) { mode = k; best = lane[k]; }
+    const vals = Object.values(lane);
+    if (doran.length) {
+      if (doran.includes("Doran's Bow") || mode === 'bot') return 'adc';
+      return mode === 'top' || mode === 'mid' ? mode : null;
+    }
+    if (vals.length && mode === 'bot' && (lane.bot || 0) >= Math.max(...vals)) return 'support';
+    return vals.length ? 'jungle' : null;
+  }
+
+  // Each player's main role, voted over the given games.
+  function voteRoles(games, roster) {
+    const votes = new Map();
+    for (const g of games)
+      for (const r of roster.get(g.game_id) || []) {
+        const ro = roleOf(g, r.player_name);
+        if (ro) { if (!votes.has(r.player_id)) votes.set(r.player_id, new Map()); bump(votes.get(r.player_id), ro); }
+      }
+    return new Map([...votes].map(([p, c]) => [p, mostCommon(c)]));
+  }
+
+  // One profile per team that has at least minGames of the given games.
+  function buildProfiles(games, roster, mainRole, names, minGames = 10, recent = RECENT) {
+    const byTeam = new Map();
+    [...games].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)).forEach(g => {
+      for (const t of new Set(g.draft.map(d => d[2]))) { if (!byTeam.has(t)) byTeam.set(t, []); byTeam.get(t).push(g); }
+    });
+    const teams = {};
+    for (const [tid, tg] of byTeam) {
+      if (tg.length < minGames) continue;
+      const pool = Object.fromEntries(ROLES.map(r => [r, {}]));
+      const champRole = {}, players = Object.fromEntries(ROLES.map(r => [r, new Map()]));
+      const bans = new Map(), firstPick = new Map(), e = new Map(), last = new Map();
+      const fd = [], fbGot = [], fbGave = [];
+      for (const g of tg.slice(-recent))
+        for (const r of roster.get(g.game_id) || []) if (r.team_id === tid && mainRole.get(r.player_id)) bump(last, r.character_name);
+      for (const g of tg) {
+        const won = g.winner === tid ? 1 : 0;
+        const rows = roster.get(g.game_id) || [];
+        const mine = rows.find(r => r.team_id === tid);
+        const side = mine ? mine.side : null;
+        for (const r of rows) {
+          if (r.team_id === tid && mainRole.get(r.player_id)) {
+            const ro = mainRole.get(r.player_id);
+            const rec = pool[ro][r.character_name] || (pool[ro][r.character_name] = [0, 0]);
+            rec[0] += 1; rec[1] += won;
+            if (!(r.character_name in champRole)) champRole[r.character_name] = ro;
+            bump(players[ro], r.player_name);
+          }
+        }
+        for (const [, typ, who, ch] of g.draft) if (typ === 'ban' && who === tid) bump(bans, ch);
+        const ours = g.draft.filter(d => d[1] === 'pick' && d[2] === tid);
+        if (ours.length) bump(firstPick, ours[0][3]);
+        const fb = g.first_blood;
+        if (fb && fb.team === tid) {
+          bump(e, 'fb'); bump(e, 'fb_jungle', fb.zone === 'jungle' ? 1 : 0);
+          fbGot.push(fb.sec);
+        } else if (fb) {
+          const p = fb.pos || [null, null];
+          fbGave.push([fb.zone, mainRole.get(fb.victim_id) ?? null, fb.victim, p[0], p[1], side]);
+        }
+        const d = g.first_dragon;
+        if (d) { fd.push(d.sec); bump(e, 'drag', d.team === tid ? 1 : 0); }
+        const gr = g.first_grub;
+        bump(e, 'grub', gr && gr.team === tid ? 1 : 0);
+      }
+      const name = names.get(tid) ?? tid;
+      teams[tid] = {
+        id: tid, name: SHORT[name] || name, tag: TAGS[name] || name.slice(0, 3).toUpperCase(), n: tg.length,
+        recent: Object.fromEntries(last), recent_n: Math.min(recent, tg.length),
+        players: Object.fromEntries(ROLES.filter(r => players[r].size).map(r => [r, mostCommon(players[r])])),
+        pool, role: champRole, bans: Object.fromEntries(bans), first_pick: Object.fromEntries(firstPick),
+        e: Object.fromEntries(e), fd_avg: fd.length ? pyRound(fd.reduce((x, y) => x + y, 0) / fd.length) : null,
+        fb_got: fbGot.sort((x, y) => x - y), fb_gave: fbGave,
+      };
+    }
+    return teams;
+  }
+
+  // The series files a build needs: the league's, from the date on. Nothing else is fetched.
+  function neededSeries(seriesRows, league = 'LCS', since = '2026-01-01') {
+    return seriesRows.filter(r => r.event.includes(league) && r.scheduled_start.slice(0, 10) >= since);
+  }
+
+  // meta: { series: [csv rows], rosters, teams, characters }; games: games of the needed series, in series.csv order
+  function build(meta, games, league = 'LCS', since = '2026-01-01') {
+    const gi = new Map(games.map(g => [g.game_id, g]));
+    const roster = new Map();
+    for (const r of meta.rosters) if (r.title === 'lol') { if (!roster.has(r.game_id)) roster.set(r.game_id, []); roster.get(r.game_id).push(r); }
+    const names = new Map(meta.teams.filter(r => r.title === 'lol').map(r => [r.team_id, r.name]));
+    const champions = [...new Set(meta.characters.filter(r => r.title === 'lol').map(r => r.name))].sort();
+
+    // each player's main role, voted over the games we have
+    const mainRole = voteRoles([...roster.keys()].filter(id => gi.has(id)).map(id => gi.get(id)), roster);
+    const season = games.filter(g => g.date >= since && g.winner && g.event.includes(league));
+    const teams = buildProfiles(season, roster, mainRole, names, 10);
+
+    // the real series, so a coach can load one and replay it
+    const bySeries = new Map();
+    for (const g of season) { if (!bySeries.has(g.series_id)) bySeries.set(g.series_id, []); bySeries.get(g.series_id).push(g); }
+    const series = [];
+    for (const [sid, gs] of bySeries) {
+      const pair = [...new Set(gs[0].draft.map(d => d[2]))].sort();
+      if (pair.length !== 2 || !pair.every(t => t in teams)) continue;
+      series.push({
+        id: sid, date: gs[0].date, event: gs[0].event, teams: pair,
+        games: gs.map(g => {
+          const sides = {};
+          for (const r of roster.get(g.game_id) || []) sides[r.team_id] = r.side;
+          return {
+            winner: g.winner, length: g.length ?? null, gold: g.gold ?? null, sides,
+            picks: Object.fromEntries(pair.map(t => [t, g.draft.filter(d => d[1] === 'pick' && d[2] === t).map(d => d[3])])),
+            bans: Object.fromEntries(pair.map(t => [t, g.draft.filter(d => d[1] === 'ban' && d[2] === t).map(d => d[3])])),
+            first_scuttle: g.first_scuttle ?? null, first_blood: g.first_blood ?? null, first_dragon: g.first_dragon ?? null,
+          };
+        }),
+      });
+    }
+    series.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
+    return { season: `${league} ${since.slice(0, 4)}`, champions, teams, series };
+  }
+
+  // ---------- fetching ----------
+  // A source reads a path under the starter repo: { text(path), bytes(path) }.
+  function remote(signal) {
+    const get = async path => {
+      const res = await fetch(RAW + path, { signal });
+      if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
+      return res;
+    };
+    return { text: async p => (await get(p)).text(), bytes: async p => new Uint8Array(await (await get(p)).arrayBuffer()) };
+  }
+
+  const decode = bytes => new TextDecoder('utf-8').decode(fz.decompress(bytes));
+
+  // Download (or read) everything the build needs. onProgress({ phase, done, total }) is called as series arrive.
+  async function load(source, { league = 'LCS', since = '2026-01-01', concurrency = 6, onProgress, signal } = {}) {
+    const stop = () => { if (signal && signal.aborted) throw new DOMException('Cancelled', 'AbortError'); };
+    const say = (phase, done, total) => onProgress && onProgress({ phase, done, total });
+    say('meta', 0, 0);
+    const [series, rosters, teams, characters] = (await Promise.all(
+      ['lol/series.csv', 'meta/rosters.csv', 'meta/teams.csv', 'meta/characters.csv'].map(p => source.text(p)))).map(parseCsv);
+    stop();
+    const need = neededSeries(series, league, since);
+    const results = new Array(need.length);
+    let next = 0, done = 0;
+    say('series', 0, need.length);
+    async function worker() {
+      while (next < need.length) {
+        stop();
+        const i = next++, row = need[i];
+        results[i] = dropRemakes(seriesGames(decode(await source.bytes(row.file)), row));
+        say('series', ++done, need.length);
+      }
+    }
+    await Promise.all(Array.from({ length: Math.min(concurrency, need.length) }, worker));
+    stop();
+    return build({ series, rosters, teams, characters }, results.flat(), league, since);
+  }
+
+  // ---------- browser: latest commit and the IndexedDB cache ----------
+  async function latestSha(signal) {
+    const res = await fetch(LATEST, { signal, headers: { Accept: 'application/vnd.github+json' } });
+    if (!res.ok) throw new Error(`GitHub answered HTTP ${res.status}`);
+    return (await res.json()).sha;
+  }
+  function db() {
+    return new Promise((resolve, reject) => {
+      const open = indexedDB.open('draftroom', 1);
+      open.onupgradeneeded = () => open.result.createObjectStore('data');
+      open.onsuccess = () => resolve(open.result);
+      open.onerror = () => reject(open.error);
+    });
+  }
+  async function store(mode, fn) {
+    const d = await db();
+    return new Promise((resolve, reject) => {
+      const tx = d.transaction('data', mode), req = fn(tx.objectStore('data'));
+      tx.oncomplete = () => { d.close(); resolve(req && req.result); };
+      tx.onerror = tx.onabort = () => { d.close(); reject(tx.error); };
+    });
+  }
+  const cache = {
+    // { sha, league, since, payload } or undefined
+    get: () => store('readonly', s => s.get('official')).catch(() => undefined),
+    put: (sha, league, since, payload) => store('readwrite', s => s.put({ sha, league, since, payload }, 'official')),
+    clear: () => store('readwrite', s => s.delete('official')),
+  };
+
+  const api = { load, build, buildProfiles, voteRoles, roleOf, seriesGames, dropRemakes, neededSeries, parseCsv, zone, ts, pyRound,
+    remote, latestSha, cache, RAW, LATEST };
+  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Loader = api;
+})(this);
+
```

### Ran cd /home/ubuntu/workplace/draftroom && cat > tests/loader.check.js <<'EOF' // Runs web/loader.js (the browser port of extract.py and build.py) on a local copy of the // starter repo instead of fetch, and compares the result with web/data.js from pipeline/build.py. // Needs Node 18+ and web/data.js. // //   node tests/loader.check.js [path to the starter repo]     (default ../stl-hackathon-2026-grid-starter) const fs = require('fs'), path = require('path'); const Loader = require('../web/loader.js');  const dir = path.resolve(process.argv[2] || path.join(__dirname, '..', '..', 'stl-hackathon-2026-grid-starter')); const source = {   text: async p => fs.readFileSync(path.join(dir, p), 'utf8'),   bytes: async p => new Uint8Array(fs.readFileSync(path.join(dir, p))), };  // the first place two values differ, as a path, or null function firstDiff(a, b, at = '') {   if (a === b) return null;   if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return `${at || 'value'}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`;   if (Array.isArray(a) !== Array.isArray(b)) return `${at}: list vs object`;   const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];   for (const k of keys) {     if (!(k in a)) return `${at}.${k}: missing from loader`;     if (!(k in b)) return `${at}.${k}: missing from data.js`;     const d = firstDiff(a[k], b[k], `${at}.${k}`);     if (d) return d;   }   return null; }  (async () => {   const window = {};   new Function('window', fs.readFileSync(path.join(__dirname, '..', 'web', 'data.js'), 'utf8'))(window);   const ref = window.DRAFTROOM;   const t0 = Date.now();   let lastLine = '';   const got = await Loader.load(source, {     onProgress: p => { if (p.phase === 'series' && p.done === p.total) lastLine = `${p.total} series`; },   });   console.log(`loaded ${lastLine} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);    const same = (name, a, b) => { const d = firstDiff(a, b, name); if (d) { console.log('first difference: ' + d); process.exit(1); } };   same('team ids', Object.keys(got.teams).sort(), Object.keys(ref.teams).sort());   for (const id of Object.keys(ref.teams)) {     same(`team ${id} games`, got.teams[id].n, ref.teams[id].n);     same(`team ${id} pool`, got.teams[id].pool, ref.teams[id].pool);   }   // then everything else: profiles, champions, series   same('teams', got.teams, ref.teams);   same('champions', got.champions, ref.champions);   same('series', got.series, ref.series);   same('season', got.season, ref.season);   console.log('loader matches build.py'); })().catch(e => { console.error(e); process.exit(1); }); EOF node tests/loader.check.js

```text
loaded 75 series in 15.9 s
loader matches build.py
```

```text
The browser loader check script was written and run, and it confirmed that the loader's output matches the reference data generated by the build script across all 75 series, taking about 16 seconds.
```

## Thinking

The loader check passed: it loaded 75 series in 16 seconds and matched the output of build.py, including teams, champions and series. Next I'm moving on to the UI files (index.html, app.js and style.css), then the README and the fit test.

### Ran cd /home/ubuntu/workplace/draftroom && python3 - <<'EOF' import re # ---------- planner: no head-to-head habit when the data has no series ---------- p='web/planner.js'; s=open(p).read() old="""        [`${h2h.filter(g => g.winner === themId).length}/${h2h.length}`, 'games won against us this year'],       ],""" new="""        ...(h2h.length ? [[`${h2h.filter(g => g.winner === themId).length}/${h2h.length}`, 'games won against us this year']] : []),       ],""" assert old in s; s=s.replace(old,new); open(p,'w').write(s)  # ---------- index.html ---------- p='web/index.html'; s=open(p).read() s=s.replace('''    <button type="button" id="newSeries">New series</button> ''','''    <button type="button" id="newSeries">New series</button>     <button type="button" id="connectBtn" class="secondary">Connect official data</button> ''') s=s.replace('''<dialog class="dlg help" id="helpDlg" aria-labelledby="helpTitle">''','''<dialog class="dlg data" id="dataDlg" aria-labelledby="dataTitle">   <h2 id="dataTitle">Connect official data</h2>   <p id="dataStatus" role="status" aria-live="polite"></p>   <div class="meter" id="meter" role="progressbar" aria-labelledby="dataStatus" aria-valuemin="0" aria-valuemax="100"><div id="meterBar"></div></div>   <p class="privacy" id="dataPrivacy">Nothing is uploaded: the data goes from GitHub to this browser only.</p>   <div class="row"><button type="button" id="dataCancel">Cancel</button></div> </dialog> <dialog class="dlg help" id="helpDlg" aria-labelledby="helpTitle">''') s=s.replace('''  <div class="row"><button type="button" id="helpClose">Close (Esc)</button></div> </dialog>''','''  <h3 class="data-h">Data</h3>   <p class="data-links"><button type="button" class="link" id="loadFile">Load data.js</button>     <button type="button" class="link" id="clearCache">Clear cached data</button></p>   <p class="data-note" id="helpMsg">Drop a data.js built by pipeline/build.py onto the page, or load one here. It stays in your browser.</p>   <div class="row"><button type="button" id="helpClose">Close (Esc)</button></div> </dialog> <input type="file" id="fileIn" accept=".js,text/javascript" hidden>''') s=s.replace('''<script src="data.js"></script> <script src="planner.js"></script> <script src="app.js"></script>''','''<script src="data.js"></script> <script>if (!window.DRAFTROOM) document.write('<script src="demo-data.js"><\\/script>');</script> <script src="vendor/fzstd.js"></script> <script src="planner.js"></script> <script src="loader.js"></script> <script src="app.js"></script>''') open(p,'w').write(s) EOF grep -n "demo-data\|fzstd\|connectBtn" web/index.html

```text
25:    <button type="button" id="connectBtn" class="secondary">Connect official data</button>
123:<script>if (!window.DRAFTROOM) document.write('<script src="demo-data.js"><\/script>');</script>
124:<script src="vendor/fzstd.js"></script>
```

```text
The planner now hides the head-to-head stat when there is no series data, and the index page gained a data-connect button, dialog, and new script references.
```

### Edited web/app.js +131 -11

#### web/app.js

```diff
--- a/web/app.js
+++ b/web/app.js
@@ -1,7 +1,8 @@
 // Draft Room UI: a fearless series, game by game. The coach locks in what was
 // actually played, and the plan for the next game is rebuilt from the data.
 (() => {
-  const D = window.DRAFTROOM, P = window.Planner;
+  let D = window.DRAFTROOM;
+  const P = window.Planner;
   const $ = id => document.getElementById(id);
   const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
   const list = (xs, cls) => xs.map((x, i) => (i && i === xs.length - 1 ? ' and ' : i ? ', ' : '') + `<span class="${cls}">${esc(x)}</span>`).join('');

@@ -9,10 +10,10 @@
   const KEY = 'draftroom.series.v1';
   const ROLE_LABEL = ['Top', 'Jungle', 'Mid', 'Bot', 'Support'];
 
-  if (!D) { document.body.innerHTML = '<p style="padding:40px">web/data.js is missing. Run <code>python pipeline/build.py</code> first (see README).</p>'; return; }
+  if (!D) { document.body.innerHTML = '<p style="padding:40px">web/demo-data.js is missing. Run <code>python pipeline/build.py --public</code> (see README).</p>'; return; }
 
   // ---------- series state ----------
-  const C9 = Object.keys(D.teams).find(id => D.teams[id].tag === 'C9') || Object.keys(D.teams)[0];
+  let C9 = Object.keys(D.teams).find(id => D.teams[id].tag === 'C9') || Object.keys(D.teams)[0];
   const firstOpp = id => Object.keys(D.teams).find(t => t !== id);
   let S = load() || fresh(C9, D.teams['47363'] ? '47363' : firstOpp(C9));
 

@@ -41,6 +42,7 @@
       return `<option value="${s.id}"${s.id === S.real ? ' selected' : ''}>${s.date}, ${team(S.us).tag} ${w}-${l}</option>`;
     }).join('');
     $('realSel').disabled = !real.length;
+    $('realSel').hidden = !D.series.length;          // the demo data has no series to replay
   }
   $('usSel').onchange = e => { const us = e.target.value; S = fresh(us, S.them === us ? firstOpp(us) : S.them); show(true); };
   $('oppSel').onchange = e => { S = fresh(S.us, e.target.value); show(true); };

@@ -132,8 +134,10 @@
     }).join('');
     drawMap(op);
     const real = S.real && D.series.find(s => s.id === S.real);
-    $('src').innerHTML = esc(`Official GRID data, ${D.season}. ${us.name} ${us.n} games, ${op.name} ${op.n} games.` + (real ? ` Game 1 from the ${real.date} series.` : '')) +
-      ' <span class="keys-hint">Press ? for shortcuts</span>';
+    $('src').innerHTML = esc((D.source === 'demo' ? `Demo data, ${D.season} season totals from the official GRID data.` : `Official GRID data, ${D.season}.`) +
+      ` ${us.name} ${us.n} games, ${op.name} ${op.n} games.` + (real ? ` Game 1 from the ${real.date} series.` : '')) +
+      ' <button type="button" class="link keys-hint" id="helpOpen">Press ? for shortcuts and data</button>';
+    $('connectBtn').textContent = D.source === 'demo' ? 'Connect official data' : 'Refresh official data';
   }
 
   // fearless outlook: one dot per proven champion still open after this game's picks, hollow if the plan uses it

@@ -182,13 +186,26 @@
       `<circle cx="12" cy="138" r="9" class="base ${usBlue ? 'us' : 'them'}"/><circle cx="138" cy="12" r="9" class="base ${usBlue ? 'them' : 'us'}"/>`;
     const dots = m.fb_map.map(([x, y, hit], k) =>
       `<circle cx="${X(x)}" cy="${Y(y)}" r="${hit ? 4 : 2.6}" class="dot${hit ? ' hit' : ''}" style="transition-delay:${(k * 0.03).toFixed(2)}s"/>`).join('');
-    $('rift').innerHTML = ground + dots;
+    // the demo data has counts, not positions: a 3x3 grid, each cell shaded by the count of its area
+    const grid = m.fb_grid ? zoneGrid(m.fb_grid) : '';
+    $('rift').innerHTML = ground + dots + grid;
     $('rift').setAttribute('aria-label', `Where ${op.name} gave up first blood this year`);
     $('mapHead').textContent = `Where ${op.name} die first`;
     const v = m.fb_victim;
-    $('mapNote').innerHTML = v.n ? `<b>${esc(v.name)}</b>, their ${v.role}, is the first to die in <b>${v.n} of ${v.of}</b> games.` +
-      `<span class="key"><i class="k hit"></i>${esc(v.name)} <i class="k"></i>others</span>` : 'Not enough games yet.';
+    const key = m.fb_grid ? `<span class="key"><i class="k hit"></i>${m.fb_grid.hit} is where ${esc(v.name)} dies most <i class="k"></i>other areas. Shade = first deaths.</span>`
+      : `<span class="key"><i class="k hit"></i>${esc(v.name)} <i class="k"></i>others</span>`;
+    $('mapNote').innerHTML = v.n ? `<b>${esc(v.name)}</b>, their ${v.role}, is the first to die in <b>${v.n} of ${v.of}</b> games.` + key : 'Not enough games yet.';
   }
+  // top lane in the top-left corner, bot lane bottom-right, mid on the diagonal, jungle between
+  const GRID = [['top', 'jungle', 'mid'], ['jungle', 'mid', 'jungle'], ['mid', 'jungle', 'bot']];
+  function zoneGrid({ zones, hit }) {
+    const max = Math.max(1, ...Object.values(zones));
+    return '<g class="grid">' + GRID.map((row, r) => row.map((z, c) => {
+      const n = zones[z] || 0, x = c * 50, y = r * 50;
+      return `<rect class="cell${z === hit ? ' hit' : ''}" x="${x + 1}" y="${y + 1}" width="48" height="48" rx="3" style="fill-opacity:${(0.08 + 0.6 * n / max).toFixed(2)}"><title>${z}: ${n}</title></rect>` +
+        `<text class="cnt" x="${x + 25}" y="${y + 31}">${n}</text>`;
+    }).join('')).join('') + '</g>';
+  }
 
   // ---------- copy the plan as plain text for the team chat ----------
   let copyTimer;

@@ -209,8 +226,12 @@
 
   // ---------- lock in what was played ----------
   const norm = s => s.trim().toLowerCase().replace(/[^a-z]/g, '');
-  const byNorm = Object.fromEntries(D.champions.map(c => [norm(c), c]));
-  $('champList').innerHTML = D.champions.map(c => `<option value="${esc(c)}">`).join('');
+  let byNorm;
+  function indexChampions() {
+    byNorm = Object.fromEntries(D.champions.map(c => [norm(c), c]));
+    $('champList').innerHTML = D.champions.map(c => `<option value="${esc(c)}">`).join('');
+  }
+  indexChampions();
   const roleIdx = { top: 0, jungle: 1, mid: 2, adc: 3, support: 4 };
   function openLock() {
     const us = team(S.us), op = team(S.them), N = gameNo();

@@ -337,7 +358,7 @@
     if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
     const el = e.target, tag = el && el.tagName;
     if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || (el && el.isContentEditable) || (el && el.closest && el.closest('#lockDlg'))) return;
-    if ($('lockDlg').open) return;
+    if ($('lockDlg').open || $('dataDlg').open) return;
     if (e.key === '?') { e.preventDefault(); helpDlg.open ? helpDlg.close() : helpDlg.showModal(); return; }
     if (helpDlg.open) return;
     if (e.key === ' ') {

@@ -353,6 +374,102 @@
     else if (k === 'p') { e.preventDefault(); printSheet(); }
   });
 
+  // ---------- swap in other data: official download, cached copy, or a data.js file ----------
+  // keeps the series state when both teams still exist
+  function useData(next) {
+    D = next;
+    C9 = Object.keys(D.teams).find(id => D.teams[id].tag === 'C9') || Object.keys(D.teams)[0];
+    indexChampions();
+    if (!(D.teams[S.us] && D.teams[S.them])) S = fresh(C9, D.teams['47363'] ? '47363' : firstOpp(C9));
+    else if (S.real && !D.series.some(s => s.id === S.real)) S.real = null;
+    show(true);
+  }
+
+  const dataDlg = $('dataDlg');
+  let job = null;                                     // AbortController of a download in progress
+  function dataMessage(title, text, meter) {
+    $('dataTitle').textContent = title;
+    $('dataStatus').textContent = text;
+    $('meter').style.display = meter === null ? 'none' : '';
+    $('dataPrivacy').style.display = meter === null ? 'none' : '';
+    if (meter !== null) { $('meterBar').style.transform = `scaleX(${meter})`; $('meter').setAttribute('aria-valuenow', Math.round(meter * 100)); }
+    $('dataCancel').textContent = job ? 'Cancel' : 'Close';
+    if (!dataDlg.open) { pause(); dataDlg.showModal(); }
+  }
+  dataDlg.addEventListener('close', () => { if (job) job.abort(); });
+  $('dataCancel').onclick = () => dataDlg.close();
+
+  async function connect() {
+    if (job) return;
+    const ctl = job = new AbortController();
+    dataMessage('Connect official data', 'Checking for the latest data', 0);
+    try {
+      let sha = null;
+      try { sha = await Loader.latestSha(ctl.signal); } catch (e) { if (ctl.signal.aborted) throw e; }
+      const cached = await Loader.cache.get();
+      let next;
+      if (cached && cached.payload && (sha ? cached.sha === sha : true)) next = cached.payload;       // no news from GitHub: use what we have
+      else {
+        next = await Loader.load(Loader.remote(ctl.signal), { signal: ctl.signal, onProgress: p => {
+          if (p.phase === 'series') dataMessage('Connect official data', `Downloading ${p.done} of ${p.total} series`, p.total ? p.done / p.total : 0);
+          else dataMessage('Connect official data', 'Reading the list of series', 0);
+        } });
+        dataMessage('Connect official data', 'Building the plan data', 1);
+        next.source = 'official';
+        if (sha) await Loader.cache.put(sha, 'LCS', '2026-01-01', next).catch(() => {});
+      }
+      job = null;
+      dataDlg.close();
+      useData(next);
+    } catch (e) {
+      const cancelled = ctl.signal.aborted;
+      job = null;
+      if (cancelled) { if (dataDlg.open) dataDlg.close(); return; }
+      dataMessage('Could not connect', `${e.message || e}. The page keeps the data it has. Try again, or load a data.js file from the help card.`, null);
+    }
+  }
+  $('connectBtn').onclick = connect;
+
+  // a data.js built by pipeline/build.py: window.DRAFTROOM = {...}; (the file is plain JSON after the assignment)
+  const NEED = ['id', 'name', 'tag', 'n', 'pool', 'players', 'bans', 'first_pick', 'e', 'recent', 'fb_got', 'fb_gave'];
+  function parseDataJs(text) {
+    const m = /window\.DRAFTROOM\s*=\s*/.exec(text);
+    if (!m) throw new Error('This file has no window.DRAFTROOM. Use the data.js that pipeline/build.py writes');
+    let d;
+    try { d = JSON.parse(text.slice(m.index + m[0].length).trim().replace(/;\s*$/, '')); } catch { throw new Error('This file is not a data.js built by pipeline/build.py'); }
+    const ids = d && d.teams && typeof d.teams === 'object' ? Object.keys(d.teams) : [];
+    if (!ids.length) throw new Error('window.DRAFTROOM has no teams');
+    if (!Array.isArray(d.champions)) throw new Error('window.DRAFTROOM has no champion list');
+    for (const id of ids) for (const k of NEED) if (!(k in d.teams[id])) throw new Error(`Team ${id} has no "${k}"`);
+    if (!Array.isArray(d.series)) d.series = [];
+    return d;
+  }
+  async function loadFile(file) {
+    try {
+      const next = parseDataJs(await file.text());
+      if (dataDlg.open) dataDlg.close();
+      if (helpDlg.open) helpDlg.close();
+      useData(next);
+    } catch (e) {
+      if (helpDlg.open) helpDlg.close();
+      dataMessage('Could not use that file', `${e.message || e}.`, null);
+    }
+  }
+  $('loadFile').onclick = () => $('fileIn').click();
+  $('fileIn').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) loadFile(f); };
+  document.addEventListener('dragover', e => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { e.preventDefault(); document.body.classList.add('drop'); } });
+  document.addEventListener('dragleave', e => { if (!e.relatedTarget) document.body.classList.remove('drop'); });
+  document.addEventListener('drop', e => {
+    document.body.classList.remove('drop');
+    if (!(e.dataTransfer && e.dataTransfer.files.length)) return;
+    e.preventDefault();
+    loadFile(e.dataTransfer.files[0]);
+  });
+  $('clearCache').onclick = () => Loader.cache.clear().then(
+    () => { $('helpMsg').textContent = 'Cached data removed. This page keeps what it has until you reload.'; },
+    () => { $('helpMsg').textContent = 'Could not clear the cache.'; });
+  $('src').addEventListener('click', e => { if (e.target.closest('#helpOpen')) { pause(); helpDlg.showModal(); } });
+
   function show(autoplay) {
     pause(); save(); fill(); build();
     t = 0; done = false;

@@ -366,5 +483,8 @@
   const vs = q.get('vs') && Object.values(D.teams).find(x => x.tag === q.get('vs'));
   if (vs && vs.id !== S.them) S = fresh(S.us, vs.id);
   if (q.has('t')) { show(false); t = parseFloat(q.get('t')); render(); } else show(true);
+
+  // a copy of the official data saved in this browser makes a reload instant (no network needed)
+  if (D.source === 'demo' && !q.has('t')) Loader.cache.get().then(c => { if (c && c.payload && D.source === 'demo') useData(c.payload); });
 })();
```

### Ran cd /home/ubuntu/workplace/draftroom && python3 - <<'EOF' p='web/style.css'; s=open(p).read() s=s.replace('''  .fbmap p { font-size: 13.5px; line-height: 1.4; }''','''  .fbmap .grid { opacity: 0; transition: opacity .4s ease-out; }   .fbmap.show .grid { opacity: 1; }   .fbmap .cell { fill: var(--pencil); }   .fbmap .cell.hit { fill: var(--ban); }   .fbmap .cnt { fill: var(--ink); font: 700 17px "Barlow Condensed", sans-serif; text-anchor: middle; paint-order: stroke; stroke: var(--paper); stroke-width: 2.5px; }   .fbmap p { font-size: 13.5px; line-height: 1.4; }''',1) s=s.replace(".fbmap .dot { animation: none !important","XX") if False else s s=s.replace(".slot.locked::before, .fbmap .dot { animation: none !important;",".slot.locked::before, .fbmap .dot, .fbmap .grid { animation: none !important;") s=s.replace('''.top .title { min-width: 0; }''','''/* connect official data, link buttons, the download dialog */ [hidden] { display: none !important; } .setup button.secondary { background: transparent; color: var(--c9); border-color: var(--c9); white-space: nowrap; } button.link, .dlg button.link { background: none; border: 0; padding: 0; color: var(--c9); font: inherit; text-decoration: underline; cursor: pointer; border-radius: 2px; } button.link:focus-visible { outline: 2px solid var(--c9); outline-offset: 2px; } .dlg.data { width: 440px; } .dlg .meter { height: 6px; background: var(--rule); border-radius: 3px; overflow: hidden; margin: 0 0 12px; } .dlg .meter div { height: 100%; width: 100%; background: var(--c9); transform-origin: left; transform: scaleX(0); transition: transform .2s; } .dlg .privacy { font-size: 12.5px; margin-bottom: 4px; } .dlg #dataStatus { color: var(--ink); font-size: 15px; margin-bottom: 10px; } .help .data-h { margin: 12px 0 4px; } .help .data-links { display: flex; gap: 16px; margin-bottom: 4px; } .help .data-note { font-size: 12.5px; margin-bottom: 0; } body.drop { outline: 3px dashed var(--c9); outline-offset: -8px; }  .top .title { min-width: 0; }''',1) s=s.replace('''  .fbmap .dot.hit { fill: #000; stroke: #fff; }''','''  .fbmap .dot.hit { fill: #000; stroke: #fff; }   .fbmap .grid { opacity: 1 !important; }   .fbmap .cell { fill: #666; } .fbmap .cell.hit { fill: #000; }   .fbmap .cnt { fill: #000; stroke: #fff; }''',1) open(p,'w').write(s) EOF grep -n "fbmap .grid\|\[hidden\]" web/style.css | head; cat tests/fit.py

```text
102:  .fbmap .grid { opacity: 0; transition: opacity .4s ease-out; }
242:    .slot, .slot.locked, .slot.active, .plan-line, .slot.locked::before, .fbmap .dot, .fbmap .grid { animation: none !important; transition: none !important; }
280:[hidden] { display: none !important; }
379:  .fbmap .grid { opacity: 1 !important; }
"""One-screen check: opens the app at three laptop sizes for several opponents,
at game 1 and at game 2 after loading a real series, and reports any page that scrolls.

    pip install playwright && python -m playwright install chromium
    python tests/fit.py [screenshot-prefix]
"""
import os, sys, pathlib
from playwright.sync_api import sync_playwright
EXE = os.environ.get('CHROME')
U = (pathlib.Path(__file__).resolve().parent.parent / 'web' / 'index.html').as_uri()
SH = os.environ.get('SHOTS', '')
tag = sys.argv[1] if len(sys.argv) > 1 else 'check'
bad = 0
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE, args=['--no-sandbox']) if EXE else p.chromium.launch()
    for w, h in [(1366, 680), (1440, 800), (1920, 960)]:
        ctx = b.new_context(viewport={'width': w, 'height': h})
        pg = ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        for vs in ['TL', 'FLY', 'LYON', 'SEN', 'SR', 'DIG']:
            pg.goto(f'{U}?vs={vs}&t=40'); pg.evaluate('localStorage.clear()'); pg.goto(f'{U}?vs={vs}&t=40')
            pg.wait_for_timeout(300)
            for g in range(2):            # game 1, then game 2 after loading a real series game 1
                if g == 1:
                    if pg.locator('#realSel option').count() < 2:
                        continue
                    pg.select_option('#realSel', index=1); pg.wait_for_timeout(200)
                    pg.evaluate('document.getElementById("play").click(); document.getElementById("play").click()')
                sw, sh = pg.evaluate('[document.documentElement.scrollWidth, document.documentElement.scrollHeight]')
                ok = sw <= w and sh <= h
                bad += not ok
                if not ok:
                    print(f'SCROLLS {w}x{h} vs {vs} game {g + 1}: {sw}x{sh}')
        pg.goto(f'{U}?vs=SEN&t=40'); pg.wait_for_timeout(300)
        if SH:
            pg.screenshot(path=os.path.join(SH, f'{tag}-{w}.png'))
        print(w, h, 'errors', errs)
        ctx.close()
    b.close()
print('all fit' if not bad else f'{bad} cases scroll')
sys.exit(1 if bad else 0)
```

```text
The style file was updated with new rules for grid, cell, and dialog styling, and the command completed successfully with exit code 0 and the test script's contents were displayed.
```

## Thinking

I updated app.js with swappable data, the connect flow, and startup restore, and added a DATA switch to the fit test that forces the demo path. Next I'm checking that the header stays on one line at 1366 wide, with the setup controls on the same row and the top bar under about 70 pixels tall.

### Ran cd /home/ubuntu/workplace/draftroom && python3 - <<'EOF' p='tests/fit.py'; s=open(p).read() s=s.replace('''    python tests/fit.py [screenshot-prefix] """''','''    python tests/fit.py [screenshot-prefix]     DATA=demo python tests/fit.py             # force web/demo-data.js (blocks web/data.js); DATA=full needs web/data.js  The header must also stay on one line at every size. """''') s=s.replace("tag = sys.argv[1] if len(sys.argv) > 1 else 'check'","tag = sys.argv[1] if len(sys.argv) > 1 else 'check'\nDATA = os.environ.get('DATA', '')\nHEADER = '''() => { const r = [...document.querySelectorAll(\".top .title, .top .setup > *\")].filter(e => e.offsetParent).map(e => e.getBoundingClientRect());\n  return Math.max(...r.map(x => x.bottom)) - Math.min(...r.map(x => x.top)); }'''") s=s.replace("        pg = ctx.new_page()\n","        pg = ctx.new_page()\n        if DATA == 'demo':\n            pg.route('**/web/data.js', lambda route: route.abort())\n",1) s=s.replace('''                ok = sw <= w and sh <= h ''','''                ok = sw <= w and sh <= h                 head = pg.evaluate(HEADER)                 if head > 56:                     print(f'HEADER WRAPS {w}x{h} vs {vs} game {g + 1}: {head:.0f}px tall')                     ok = False ''') s=s.replace("        print(w, h, 'errors', errs)","        print(w, h, 'data', pg.evaluate('window.DRAFTROOM.source || \"full\"'), 'errors', errs)") open(p,'w').write(s) EOF mkdir -p $JUNIE_TMPDIR/shots; python3 tests/fit.py; DATA=demo SHOTS=$JUNIE_TMPDIR/shots python3 tests/fit.py demo

```text
HEADER WRAPS 1366x680 vs TL game 2: 71px tall
SCROLLS 1366x680 vs TL game 2: 1366x692
HEADER WRAPS 1366x680 vs FLY game 2: 71px tall
SCROLLS 1366x680 vs FLY game 2: 1366x692
HEADER WRAPS 1366x680 vs LYON game 2: 71px tall
SCROLLS 1366x680 vs LYON game 2: 1366x692
HEADER WRAPS 1366x680 vs SEN game 2: 71px tall
SCROLLS 1366x680 vs SEN game 2: 1366x692
HEADER WRAPS 1366x680 vs SR game 2: 71px tall
SCROLLS 1366x680 vs SR game 2: 1366x692
HEADER WRAPS 1366x680 vs DIG game 2: 71px tall
SCROLLS 1366x680 vs DIG game 2: 1366x698
1366 680 data full errors []
HEADER WRAPS 1440x800 vs TL game 2: 71px tall
SCROLLS 1440x800 vs TL game 2: 1440x800
HEADER WRAPS 1440x800 vs FLY game 2: 71px tall
SCROLLS 1440x800 vs FLY game 2: 1440x800
HEADER WRAPS 1440x800 vs LYON game 2: 71px tall
SCROLLS 1440x800 vs LYON game 2: 1440x800
HEADER WRAPS 1440x800 vs SEN game 2: 71px tall
SCROLLS 1440x800 vs SEN game 2: 1440x800
HEADER WRAPS 1440x800 vs SR game 2: 71px tall
SCROLLS 1440x800 vs SR game 2: 1440x800
HEADER WRAPS 1440x800 vs DIG game 2: 71px tall
SCROLLS 1440x800 vs DIG game 2: 1440x800
1440 800 data full errors []
HEADER WRAPS 1920x960 vs TL game 2: 71px tall
SCROLLS 1920x960 vs TL game 2: 1920x960
HEADER WRAPS 1920x960 vs FLY game 2: 71px tall
SCROLLS 1920x960 vs FLY game 2: 1920x960
HEADER WRAPS 1920x960 vs LYON game 2: 71px tall
SCROLLS 1920x960 vs LYON game 2: 1920x960
HEADER WRAPS 1920x960 vs SEN game 2: 71px tall
SCROLLS 1920x960 vs SEN game 2: 1920x960
HEADER WRAPS 1920x960 vs SR game 2: 71px tall
SCROLLS 1920x960 vs SR game 2: 1920x960
HEADER WRAPS 1920x960 vs DIG game 2: 71px tall
SCROLLS 1920x960 vs DIG game 2: 1920x960
1920 960 data full errors []
18 cases scroll
1366 680 data demo errors []
1440 800 data demo errors []
1920 960 data demo errors []
all fit
```

```text
The fit test script now flags header wrapping and reports 18 scrolling cases.
```

### Failed to run cd /home/ubuntu/workplace/draftroom && cat > $JUNIE_TMPDIR/hdr.py <<'EOF' import pathlib from playwright.sync_api import sync_playwright U = pathlib.Path('web/index.html').resolve().as_uri() with sync_playwright() as p:     b = p.chromium.launch(); pg = b.new_context(viewport={'width':1366,'height':680}).new_page()     pg.goto(U+'?vs=TL&t=40'); pg.evaluate('localStorage.clear()'); pg.goto(U+'?vs=TL&t=40')     pg.select_option('#realSel', index=1); pg.wait_for_timeout(300)     print(pg.evaluate('''[...document.querySelectorAll(".top .title, .top .setup > *")].map(e=>[e.id||e.className||e.tagName, Math.round(e.getBoundingClientRect().left), Math.round(e.getBoundingClientRect().width), Math.round(e.getBoundingClientRect().top)])'''))     print(pg.evaluate('[document.querySelector(".top").getBoundingClientRect().width, getComputedStyle(document.querySelector(".top")).gap]')) EOF python3 $JUNIE_TMPDIR/hdr.py

```text
Traceback (most recent call last):
  File "/tmp/junie-session-261124-225411-1es7/hdr.py", line 5, in <module>
    b = p.chromium.launch(); pg = b.new_context(viewport={'width':1366,'height':680}).new_page()
  File "<venv>/lib/python3.13/site-packages/playwright/sync_api/_generated.py", line 4113, in launch
    self._sync(
    ~~~~~~~~~~^
        self._impl_obj.launch(
        ^^^^^^^^^^^^^^^^^^^^^^
    ...<17 lines>...
        )
        ^
    )
    ^
  File "<venv>/lib/python3.13/site-packages/playwright/_impl/_sync_base.py", line 124, in _sync
    return task.result()
           ~~~~~~~~~~~^^
  File "<venv>/lib/python3.13/site-packages/playwright/_impl/channel_owner.py", line 387, in finish
    raise e from None
  File "<venv>/lib/python3.13/site-packages/playwright/_impl/channel_owner.py", line 352, in finish
    result = await zone.run_async(lambda: awaitable)
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<venv>/lib/python3.13/site-packages/playwright/_impl/utils/zones.py", line 58, in run_async
    return await func()
           ^^^^^^^^^^^^
  File "<venv>/lib/python3.13/site-packages/playwright/_impl/browser_type.py", line 176, in launch
    await self._channel.launch(
    ...<2 lines>...
    )
  File "<venv>/lib/python3.13/site-packages/playwright/_impl/channel_owner.py", line 398, in _mapped
    return mapper(await awaitable)
                  ^^^^^^^^^^^^^^^
playwright._impl._errors.Error: BrowserType.launch: Executable doesn't exist at /home/ubuntu/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║                                                            ║
║     playwright install                                     ║
║                                                            ║
║ <3 Playwright Team                                         ║
╚════════════════════════════════════════════════════════════╝
```

### Ran cd /home/ubuntu/workplace/draftroom && sed -i "s|b = p.chromium.launch();|import os; b = p.chromium.launch(executable_path=os.environ.get('CHROME'), args=['--no-sandbox']);|" $JUNIE_TMPDIR/hdr.py && echo "CHROME=$CHROME" && python3 $JUNIE_TMPDIR/hdr.py

```text
CHROME=/home/ubuntu/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
[['title', 28, 313, 8], ['usSel', 365, 151, 28], ['SPAN', 526, 12, 34], ['oppSel', 548, 151, 28], ['fmtSel', 709, 61, 28], ['strip', 780, 186, 30], ['realSel', 976, 151, 28], ['newSeries', 1137, 54, 20], ['connectBtn', 1201, 137, 29]]
[1310, '24px']
```

```text
The script was modified to launch Chromium with the configured executable path and no-sandbox flag, and it ran successfully, printing a list of element positions and a layout value of 1310 with 24px.
```

## Thinking

I found that the setup row needs about 1341px against 1310px available, so it overflows by roughly 35px. Switching the connect button to a shorter "Refresh data" label would save about 50px, so I'm planning to apply that label change.

### Ran cd /home/ubuntu/workplace/draftroom && python3 - <<'EOF' p='web/app.js'; s=open(p).read() s=s.replace("'Connect official data' : 'Refresh official data';","'Connect official data' : 'Refresh data';\n    $('connectBtn').title = D.source === 'demo' ? 'Download the official starter data straight from GitHub into this browser' : 'Check GitHub for newer official data';") open(p,'w').write(s) p='web/style.css'; s=open(p).read() s=s.replace(".setup button.secondary { background: transparent; color: var(--c9); border-color: var(--c9); white-space: nowrap; }",".setup button { white-space: nowrap; }\n.setup button.secondary { background: transparent; color: var(--c9); border-color: var(--c9); }\n.top { gap: 16px; }") open(p,'w').write(s) EOF python3 $JUNIE_TMPDIR/hdr.py; python3 tests/fit.py; DATA=demo python3 tests/fit.py

```text
[['title', 28, 336, 8], ['usSel', 380, 151, 28], ['SPAN', 541, 12, 34], ['oppSel', 563, 151, 28], ['fmtSel', 724, 61, 28], ['strip', 795, 186, 30], ['realSel', 991, 151, 28], ['newSeries', 1152, 83, 29], ['connectBtn', 1245, 93, 29]]
[1310, '16px']
HEADER WRAPS 1366x680 vs TL game 2: 71px tall
SCROLLS 1366x680 vs TL game 2: 1366x692
HEADER WRAPS 1366x680 vs FLY game 2: 71px tall
SCROLLS 1366x680 vs FLY game 2: 1366x692
HEADER WRAPS 1366x680 vs LYON game 2: 71px tall
SCROLLS 1366x680 vs LYON game 2: 1366x692
HEADER WRAPS 1366x680 vs SEN game 2: 71px tall
SCROLLS 1366x680 vs SEN game 2: 1366x692
HEADER WRAPS 1366x680 vs SR game 2: 71px tall
SCROLLS 1366x680 vs SR game 2: 1366x692
HEADER WRAPS 1366x680 vs DIG game 2: 71px tall
SCROLLS 1366x680 vs DIG game 2: 1366x698
1366 680 data full errors []
1440 800 data full errors []
1920 960 data full errors []
6 cases scroll
1366 680 data demo errors []
1440 800 data demo errors []
1920 960 data demo errors []
all fit
```

```text
The header wrapped and caused scrolling at 1366x680 in six game layouts, though all resolution tests reported no errors and the final check said "all fit."
```

### Ran cd /home/ubuntu/workplace/draftroom && python3 - <<'EOF' p='web/style.css'; s=open(p).read() s=s.replace(".top { gap: 16px; }",".top { gap: 16px; }\n.top .title { flex: 1 1 auto; }\n.top .title .game { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.setup { flex: none; gap: 8px; }") open(p,'w').write(s) p='web/app.js'; s=open(p).read() old="    setupControls(); strip();" assert old in s s=s.replace(old,"    $('gameLine').title = $('gameLine').textContent;\n    setupControls(); strip();") open(p,'w').write(s) EOF python3 $JUNIE_TMPDIR/hdr.py; python3 tests/fit.py; DATA=demo SHOTS=$JUNIE_TMPDIR/shots python3 tests/fit.py demo

```text
[['title', 28, 350, 8], ['usSel', 394, 151, 18], ['SPAN', 553, 12, 24], ['oppSel', 573, 151, 18], ['fmtSel', 732, 61, 18], ['strip', 801, 186, 20], ['realSel', 995, 151, 18], ['newSeries', 1154, 83, 19], ['connectBtn', 1245, 93, 19]]
[1310, '16px']
1366 680 data full errors []
1440 800 data full errors []
1920 960 data full errors []
all fit
1366 680 data demo errors []
1440 800 data demo errors []
1920 960 data demo errors []
all fit
```

```text
The layout adjustments to the title bar and setup controls were applied, and the fit checks passed with no errors at all tested viewport sizes for both data and demo modes.
```

### Read /tmp/junie-session-261124-225411-1es7/shots/demo-1366.png

## Thinking

I confirmed the grid and labels render correctly, and both data files pass the fit check with the demo screenshot looking right. Next I'm running the Connect flow end to end in Chromium, with Playwright routes serving local files in place of GitHub.

### Ran cd /home/ubuntu/workplace/draftroom && cat > $JUNIE_TMPDIR/flow.py <<'EOF' import os, pathlib, json, re from playwright.sync_api import sync_playwright ROOT = pathlib.Path('/home/ubuntu/workplace/stl-hackathon-2026-grid-starter') U = pathlib.Path('web/index.html').resolve().as_uri() hits = {'raw': 0, 'api': 0} CORS = {'access-control-allow-origin': '*'} def raw(route):     hits['raw'] += 1     path = route.request.url.split('/main/', 1)[1]     route.fulfill(status=200, body=(ROOT / path).read_bytes(), headers=CORS) def api(route):     hits['api'] += 1     route.fulfill(status=200, body=json.dumps({'sha': 'abc123'}), headers={**CORS, 'content-type': 'application/json'}) with sync_playwright() as p:     b = p.chromium.launch(executable_path=os.environ.get('CHROME'), args=['--no-sandbox'])     ctx = b.new_context(viewport={'width': 1366, 'height': 680})     pg = ctx.new_page(); errs = []     pg.on('pageerror', lambda e: errs.append(str(e)))     pg.route('**/web/data.js', lambda r: r.abort())     pg.route('https://raw.githubusercontent.com/**', raw)     pg.route('https://api.github.com/**', api)     pg.goto(U); pg.wait_for_timeout(500)     print('start source', pg.evaluate('window.DRAFTROOM.source'), 'series opt hidden', pg.evaluate('document.getElementById("realSel").hidden'))     pg.click('#connectBtn')     seen = set()     for _ in range(200):         t = pg.inner_text('#dataStatus') if pg.is_visible('#dataDlg') else None         if t: seen.add(re.sub(r'\d+', 'N', t) if 'Downloading' in t else t)         if t is None: break         pg.wait_for_timeout(100)     print('statuses', seen)     pg.wait_for_timeout(800)     print('connected', pg.evaluate('document.getElementById("connectBtn").textContent'), 'raw hits', hits['raw'], 'series opts', pg.locator('#realSel option').count(), 'hidden', pg.evaluate('document.getElementById("realSel").hidden'))     pg.screenshot(path=os.environ['JUNIE_TMPDIR'] + '/shots/official.png')     # reload: instant from cache, no raw fetches     before = hits['raw']; pg.reload(); pg.wait_for_timeout(1500)     print('after reload label', pg.evaluate('document.getElementById("connectBtn").textContent'), 'raw hits added', hits['raw'] - before, 'dots', pg.locator('#rift circle.dot').count())     # click again: same sha -> cached, no series download     before = hits['raw']; pg.click('#connectBtn'); pg.wait_for_timeout(1500)     print('refresh same sha raw hits added', hits['raw'] - before, 'dialog open', pg.is_visible('#dataDlg'))     # clear cache     pg.keyboard.press('?'); pg.click('#clearCache'); print(pg.inner_text('#helpMsg')); pg.keyboard.press('Escape')     pg.reload(); pg.wait_for_timeout(800)     print('after clear + reload', pg.evaluate('window.DRAFTROOM.source'))     # file load: bad then good     pg.keyboard.press('?')     pg.set_input_files('#fileIn', files=[{'name': 'bad.js', 'mimeType': 'text/javascript', 'buffer': b'var x = 1;'}]); pg.wait_for_timeout(300)     print('bad:', pg.inner_text('#dataTitle'), '|', pg.inner_text('#dataStatus')); pg.click('#dataCancel')     pg.keyboard.press('?')     pg.set_input_files('#fileIn', files=[{'name': 'bad2.js', 'mimeType': 'text/javascript', 'buffer': b'window.DRAFTROOM = {"teams":{}};'}]); pg.wait_for_timeout(300)     print('bad2:', pg.inner_text('#dataStatus')); pg.click('#dataCancel')     good = pathlib.Path('web/data.js').read_bytes()     pg.evaluate('''() => { window.__src = document.getElementById("src").textContent; }''')     pg.keyboard.press('?')     pg.set_input_files('#fileIn', files=[{'name': 'data.js', 'mimeType': 'text/javascript', 'buffer': good}]); pg.wait_for_timeout(600)     print('good:', pg.evaluate('document.getElementById("src").textContent.slice(0,40)'), 'series opts', pg.locator('#realSel option').count())     # drag and drop     pg.goto(U); pg.wait_for_timeout(400)     pg.evaluate('''(txt) => { const dt = new DataTransfer(); dt.items.add(new File([txt], "data.js"));         document.dispatchEvent(new DragEvent("dragover", {dataTransfer: dt, bubbles: true, cancelable: true}));        document.dispatchEvent(new DragEvent("drop", {dataTransfer: dt, bubbles: true, cancelable: true})); }''', good.decode())     pg.wait_for_timeout(600)     print('drop:', pg.evaluate('document.getElementById("src").textContent.slice(0,40)'))     # cancel test     pg.evaluate('indexedDB.deleteDatabase("draftroom")');      pg.goto(U); pg.wait_for_timeout(400)     pg.click('#connectBtn'); pg.wait_for_timeout(700)     print('during:', pg.inner_text('#dataStatus')); pg.screenshot(path=os.environ['JUNIE_TMPDIR'] + '/shots/dialog.png')     pg.click('#dataCancel'); pg.wait_for_timeout(500)     print('cancelled, dialog open', pg.is_visible('#dataDlg'), 'source', pg.evaluate('window.DRAFTROOM.source'))     print('errors', errs)     b.close() EOF python3 $JUNIE_TMPDIR/flow.py

```text
start source demo series opt hidden True
statuses {'Building the plan data', 'Reading the list of series', 'Downloading N of N series'}
connected Refresh data raw hits 79 series opts 6 hidden False
after reload label Refresh data raw hits added 0 dots 29
refresh same sha raw hits added 0 dialog open False
Drop a data.js built by pipeline/build.py onto the page, or load one here. It stays in your browser.
after clear + reload demo
bad: Could not use that file | This file has no window.DRAFTROOM. Use the data.js that pipeline/build.py writes.
bad2: window.DRAFTROOM has no teams.
good: Official GRID data, LCS 2026. Cloud9 Kia series opts 6
drop: Official GRID data, LCS 2026. Cloud9 Kia
during: Downloading 6 of 75 series
cancelled, dialog open False source demo
errors []
```

```text
The test flow passed with no page errors, covering official data connection, caching, cache clearing, file and drag-and-drop loading, and cancellation.
```

### Read /tmp/junie-session-261124-225411-1es7/shots/dialog.png

### Ran cd /home/ubuntu/workplace/draftroom && cat README.md; git status --short

````text
# Draft Room

A fearless draft planner for League of Legends coaches. It reads official GRID match data and tells the coaching staff, before each game of a series, what to ban, what to pick first and what to play for in the early game, with the numbers behind each call.

Built for the Cloud9 x JetBrains "Sky's The Limit" hackathon, Category 2 (League of Legends macro scouting and draft management).

## What a coach sees

- **The plan for the next game, in order.** Three lines at the top of the screen: the three bans, the picks, and one early-game goal (for example "Kill Gryffinn in the jungle before 5:00"). Each line carries its reason in numbers.
- **Fearless tracking.** After each game the coach presses *Lock game N* and enters what was played. Every champion used is locked for the rest of the series, and the next plan is rebuilt from what is left.
- **The draft, step by step.** The 12 first-phase draft actions in pro draft order, replayed like champion select. Our slots are the plan; the opponent's slots are their most likely answer from their own history.
- **What we still have.** Our proven champions per role, with this season's record, and a warning when a role runs thin.
- **How the opponent plays early.** First dragon timing, where their first kills happen, the head-to-head record, their first-pick habit and a map of where they give up first blood.
- **Real series replay.** Load game 1 of any real series between the two teams and plan game 2 from there.

Everything fits one laptop screen (checked at 1366x680, 1440x800 and 1920x960).

## How the plan is chosen

All rules use this season's games for the two teams (LCS 2026 by default).

| Line | Rule |
|---|---|
| Our bans | The opponent's champions with the best record (wins minus losses, at least 4 games). If none of them wins more than it loses, their most-played champions. |
| Their bans | What they ban most, still open. |
| Our picks | Our best records, one per role. The first pick is the one the opponent bans least. |
| Their picks | Their most common first pick still open, then their most-played champion per remaining role. |
| Early goal | The early stat where we lead them most: first dragon, first blood or first void grub. For first blood, the opponent's player who dies first most often, and where. |
| Side | Game 1 side is set by the coach (or by the real series). After that, the loser of the previous game takes blue. |

Late in a fearless series, when the proven pools run dry, the thresholds drop to 3 and then 2 games.

## Run it

Requirements: Python 3.11+ (3.14 has zstd built in; older versions need `pip install zstandard`) and any modern browser.

```bash
# 1. get the official data next to this repo (never inside it)
git clone https://github.com/cloud9esports/stl-hackathon-2026-grid-starter.git ../stl-hackathon-2026-grid-starter

# 2. read the feeds once (about 2 minutes), then build the team profiles
python pipeline/extract.py --data ../stl-hackathon-2026-grid-starter
python pipeline/build.py   --data ../stl-hackathon-2026-grid-starter

# 3. open the app
open web/index.html        # or: python -m http.server 8000 --bind 127.0.0.1 --directory web
```

`pipeline/build.py --league LEC --since 2026-01-01` builds the same app for another league.

`pipeline/build.py --anon` builds a demo copy where every team but Cloud9 gets a made-up name (Team Acme, Team Birch, ...). The demo video uses it.

Check the planner on every team pair through a full Bo5:

```bash
node tests/planner.test.js
```

## Backtest

Had a coach used the planner before each real LCS 2026 game, how often would its prediction of the opponent's picks have been right? The planner is scored on past games using only what was known before each series, and compared with a naive "most played" baseline. Rerun it:

```bash
python pipeline/backtest.py --data ../stl-hackathon-2026-grid-starter
node tests/backtest.js
```

Results and what they do and do not mean: [docs/backtest.md](docs/backtest.md).

## Layout

| Path | Job |
|---|---|
| `pipeline/extract.py` | Streams every LoL feed once and keeps the per-game facts the app needs, in `cache/games.json`. |
| `pipeline/build.py` | Builds team profiles and the real series into `web/data.js`. |
| `pipeline/backtest.py` | Builds the backtest cases (profiles from prior games only) into `cache/backtest-cases.json`. |
| `web/planner.js` | The plan rules above. Plain JavaScript, no dependencies, also runs in Node. |
| `web/app.js` | Series state, the lock-in dialog and the champion-select replay. The series is kept in the browser's local storage. |
| `tests/planner.test.js` | Planner checks. |
| `docs/ai-workflow.md` | How Junie CLI built the later features, task by task. |
| `tests/backtest.js` | Scores the planner against real games and writes `docs/backtest.md`. |

Roles are inferred from where each player stood between 1:30 and 5:30 and their starting item, then voted over all of that player's games.

## Data

The match data is © GRID eSports GmbH and Riot Games, Inc. and is licensed only for building hackathon projects. It is not in this repository: `cache/` and `web/data.js` are built from your own copy and are ignored by git. The map in the app is drawn from plain shapes, with no Riot artwork.

League of Legends is a trademark of Riot Games, Inc. This project is not endorsed by Riot Games.

## License

MIT, see [LICENSE](LICENSE).
 M pipeline/build.py
 M tests/fit.py
 M tests/planner.test.js
 M web/app.js
 M web/index.html
 M web/planner.js
 M web/style.css
?? tests/loader.check.js
?? web/demo-data.js
?? web/loader.js
````

```text
The README was read, showing the Draft Room project as a League of Legends draft planner for coaches, and git status lists several modified files and three untracked files.
```

### Ran cd /home/ubuntu/workplace/draftroom && python3 - <<'EOF' p='README.md'; s=open(p).read() live='''## Live demo  https://its-janghoon.github.io/draftroom/  The site is plain files on GitHub Pages. **No match data is hosted by this project.** It works in three layers, from instant to complete:  1. **Instant demo.** The page opens on `web/demo-data.js`, which holds season totals only: records, counts and averages for each team. There are no individual games in it, so "Replay a real series" is hidden and the first-blood map shows how many first deaths happened in each area (top lane, mid, bot lane, jungle) instead of dots. 2. **Connect official data.** The button in the header downloads the official starter data straight from GitHub (`cloud9esports/stl-hackathon-2026-grid-starter`) into your browser, only the LCS 2026 games it needs, and builds the full data there. You see the progress and can cancel. The result is saved in your browser, keyed by the starter repo's latest commit, so a reload is instant. *Clear cached data* in the help card (press `?`) removes it. Nothing is uploaded anywhere: the data goes from GitHub to your browser only. 3. **Offline upload.** If you built `web/data.js` yourself with `pipeline/build.py`, drop it onto the page or use *Load data.js* in the help card. The file is read in your browser and never leaves it.  To make the demo file: `python pipeline/build.py --public`. It is the only data file that is committed.  ''' s=s.replace("## What a coach sees",live+"## What a coach sees",1) s=s.replace('''`pipeline/build.py --league LEC --since 2026-01-01` builds the same app for another league.''','''`pipeline/build.py --league LEC --since 2026-01-01` builds the same app for another league.  `pipeline/build.py --public` writes `web/demo-data.js` (season totals only, safe to commit).''') s=s.replace('''```bash node tests/planner.test.js ``` ''','''```bash node tests/planner.test.js                 # on web/data.js and web/demo-data.js node tests/loader.check.js                 # the browser loader against the Python pipeline (Node 18+) python tests/fit.py                        # one-screen check; DATA=demo for the demo file ```  `tests/loader.check.js` runs `web/loader.js` on `../stl-hackathon-2026-grid-starter` and prints `loader matches build.py` when the teams, games per team and every pool record equal `web/data.js`. ''',1) s=s.replace('''| `web/app.js` |''','''| `web/loader.js` | Browser port of `extract.py` and `build.py`: downloads the official data, builds the full data, caches it in IndexedDB. Keep the rules identical to the Python scripts. | | `web/vendor/fzstd.js` | MIT zstd decoder (the only third-party code). | | `web/demo-data.js` | Season totals only, committed. `web/data.js` is never committed. | | `web/app.js` |''',1) s=s.replace("It is not in this repository: `cache/` and `web/data.js` are built from your own copy and are ignored by git.","It is not in this repository: `cache/` and `web/data.js` are built from your own copy and are ignored by git. The only data file in git is `web/demo-data.js`, which has season totals (counts, records, averages) and no per-game rows.") open(p,'w').write(s) EOF node tests/planner.test.js && python3 - <<'EOF' import json,re t=open('/home/ubuntu/workplace/draftroom/web/demo-data.js').read() d=json.loads(t[t.index('{'):t.rindex('}')+1]) print(d['source'], d['series'], list(d['teams']['47363']['fb_gave']), d['teams']['47363']['fb_got']) EOF git check-ignore -v web/demo-data.js web/data.js

```text
ok: data.js: 360 plans across 9 teams
ok: demo-data.js: 360 plans across 9 teams
ok: demo plans match full plans (72), game plan line identical in 72
demo [] ['n', 'by_role', 'by_name', 'by_zone', 'by_role_zone'] {'n': 28, 'median': 369}
.gitignore:10:web/data.js	web/data.js
```

```text
The README was updated with a live demo section, loader and test documentation, and a committed demo data file, and the planner tests passed for both data files with the demo plans matching the full plans, while web/data.js is confirmed as git-ignored.
```
