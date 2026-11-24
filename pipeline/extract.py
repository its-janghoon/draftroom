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
