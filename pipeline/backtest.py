"""Build the backtest cases: for every real LCS game from --since on, the two team
profiles as a coach would have had them the day before the series, the champions
fearless had locked, and what the teams really picked and banned.

No future data: profiles and player roles use only LCS games dated before the
series' scheduled date. Written to cache/backtest-cases.json (derived from GRID
data, so it stays in cache/, which git ignores). Score it with tests/backtest.js.

    python pipeline/backtest.py --data ../stl-hackathon-2026-grid-starter
"""
import argparse, collections, csv, json
from pathlib import Path

from build import build_profiles, vote_roles


def picks_of(g, tid):
    return [d[3] for d in g['draft'] if d[1] == 'pick' and d[2] == tid]


def bans_of(g, tid):
    return [d[3] for d in g['draft'] if d[1] == 'ban' and d[2] == tid]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--data', default='../stl-hackathon-2026-grid-starter')
    ap.add_argument('--games', default='cache/games.json')
    ap.add_argument('--out', default='cache/backtest-cases.json')
    ap.add_argument('--league', default='LCS')
    ap.add_argument('--since', default='2026-01-01')
    ap.add_argument('--min-games', type=int, default=10)
    args = ap.parse_args()
    data = Path(args.data)
    G = json.load(open(args.games))

    roster = collections.defaultdict(list)
    for r in csv.DictReader(open(data / 'meta' / 'rosters.csv')):
        if r['title'] == 'lol':
            roster[r['game_id']].append(r)
    names = {r['team_id']: r['name'] for r in csv.DictReader(open(data / 'meta' / 'teams.csv')) if r['title'] == 'lol'}

    league = [g for g in G if args.league in g['event']]
    # a series is scheduled on one date; its games all carry it
    series = collections.defaultdict(list)
    for g in league:
        series[g['series_id']].append(g)
    sdate = {sid: min(g['date'] for g in gs) for sid, gs in series.items()}

    # profiles are built once per series date, from games dated strictly before it
    cutoff = {}

    def known_on(date):
        if date not in cutoff:
            prior = [g for g in league if g['date'] >= args.since and g['date'] < date and g.get('winner')]
            roles = vote_roles(prior, roster)
            cutoff[date] = build_profiles(prior, roster, roles, names, args.min_games)
        return cutoff[date]

    cases, skipped = [], collections.Counter()
    for g in sorted((g for g in league if g['date'] >= args.since), key=lambda g: g['date']):
        sid = g['series_id']
        pair = list(dict.fromkeys(d[2] for d in g['draft']))
        if len(pair) != 2 or any(len(picks_of(g, t)) != 5 for t in pair):
            skipped['incomplete draft'] += 1
            continue
        sides = {r['team_id']: r['side'] for r in roster.get(g['game_id'], [])}
        blue = [t for t in pair if sides.get(t) == 'blue']
        if len(blue) != 1:
            skipped['side unknown'] += 1
            continue
        profiles = known_on(sdate[sid])
        if not all(t in profiles for t in pair):
            skipped[f'a team with under {args.min_games} prior games'] += 1
            continue
        order = series[sid]
        earlier = order[:order.index(g)]
        cases.append({
            'series_id': sid, 'game_id': g['game_id'], 'game_number': len(earlier) + 1,
            'date': g['date'], 'series_date': sdate[sid], 'blue': blue[0],
            'teams': pair,
            'profiles': {t: profiles[t] for t in pair},
            'locked': [d[3] for e in earlier for d in e['draft'] if d[1] == 'pick'],
            'actual': {t: {'picks': picks_of(g, t), 'bans': bans_of(g, t)} for t in pair},
        })

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    meta = {'league': args.league, 'since': args.since, 'min_games': args.min_games,
            'league_games_in_range': sum(1 for g in league if g['date'] >= args.since),
            'skipped': dict(skipped)}
    out.write_text(json.dumps({'meta': meta, 'cases': cases}, ensure_ascii=False))
    print(f"{len(cases)} cases of {meta['league_games_in_range']} {args.league} games since {args.since} -> {out} "
          f"({out.stat().st_size // 1024} KB)")
    for why, n in skipped.items():
        print(f'  skipped {n}: {why}')


if __name__ == '__main__':
    main()
