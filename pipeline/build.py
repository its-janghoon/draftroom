"""Turn cache/games.json and the starter repo's meta tables into web/data.js:
one profile per team plus the real series, for the LCS 2026 season.

data.js holds aggregates derived from licensed data. It stays out of git;
judges build it from their own copy of the starter repo.

    python pipeline/build.py --data ../stl-hackathon-2026-grid-starter
"""
import argparse, collections, csv, json
from pathlib import Path

ROLES = ['top', 'jungle', 'mid', 'adc', 'support']
TAGS = {'Cloud9 Kia': 'C9', 'Team Liquid Alienware': 'TL', 'FlyQuest': 'FLY', 'LYON': 'LYON', 'Sentinels': 'SEN',
        'Shopify Rebellion': 'SR', 'Disguised': 'DSG', 'Dignitas': 'DIG', '100 Thieves': '100'}
SHORT = {'Team Liquid Alienware': 'Team Liquid'}


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


def build_profiles(games, roster, main_role, names, min_games=10):
    """One profile per team that has at least min_games of the given games."""
    by_team = collections.defaultdict(list)
    for g in games:
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

    payload = {'season': f'{args.league} {args.since[:4]}', 'champions': champions, 'teams': teams, 'series': out_series}
    out = Path(args.out)
    out.write_text('// Built by pipeline/build.py from the GRID starter data. Do not commit.\n'
                   'window.DRAFTROOM = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(f"{len(teams)} teams, {len(out_series)} series -> {out} ({out.stat().st_size // 1024} KB)")


if __name__ == '__main__':
    main()
