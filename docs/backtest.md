# Backtest

If a coach had used the planner before each real LCS 2026 game, how often would its prediction of the opponent's picks have been right?

- **Date range:** 2026-02-22 to 2026-10-12
- **Games:** 141 (of 225 LCS games since 2026-01-01; left out: 71 for a team with under 10 prior games, 11 for incomplete draft, 2 for side unknown)
- **Runs:** 282 (every game is planned twice, once with each team as "us")
- **Split by date:** TUNE = games before 2026-07-01 (106 games, 212 runs), TEST = games from 2026-07-01 on (35 games, 70 runs)

## Method

- Each team's profile uses only LCS games dated before the series' scheduled date, and player roles are voted from those same games. A game is skipped if either team has fewer than 10 prior games.
- Champions picked in earlier games of the same series are locked (fearless).
- From each run, the 3 champions in `steps.them_pick` are the predicted opponent picks, scored against the opponent's real 5 picks in that game.
- The baseline ignores the draft logic: the opponent's 3 most-played champions this season that are not locked.
- Head-to-head history is left out of the planner input, because it would include this series or later ones.
- Every design decision and weight was chosen on TUNE only. TEST was run once, after the predictor was frozen, and is reported as it came out.

## What changed in the predictor

Before: the opponent's first-pick habit, then their most-played champions, one per role.

Now (`predictPicks` in `web/planner.js`, the same code the app uses): every champion still open scores the sum of three shares of the opponent's games before this series:

- **Season:** games played with it, divided by their games this season.
- **Recent:** games played with it in their last 10 games, divided by 10.
- **First pick:** times they opened a draft with it, divided by their games this season.

The top 3 are named, at most one per role. The slot reason reads like "Josedeodo, 6 of last 10 games, first pick 2x". Profiles gained a per-champion `recent` count (`pipeline/build.py`).

Tried on TUNE and left out: a win rate with a prior ((wins+2)/(games+4)) did not help; subtracting how often they ban a champion made it worse; a minimum-games filter made it worse; dropping any one of the three shares scored lower. Recent windows of 5 to 20 games were tried and 10 kept. One pick per role scored about the same as no limit, so the existing rule stayed. Several blends within a point or two of each other were indistinguishable on TUNE; the simplest equal-weight blend was kept.

## Results

### TUNE: 2026-02-22 to 2026-06-14, 106 games, 212 runs

| Measure | Planner | Baseline (3 most played, not locked) |
|---|---|---|
| Hit rate (at least 1 of 3 predicted picks really picked) | 43.4% (92/212) | 39.2% (83/212) |
| Precision (predicted picks really picked) | 17.0% (108/636) | 15.3% (97/636) |

Planned bans (our 3) that the opponent picked or banned themselves in that game: **27.7% (176/636)**.
Planner hit where the baseline missed: 47 runs. Baseline hit where the planner missed: 38 runs.

### TEST: 2026-07-26 to 2026-10-12, 35 games, 70 runs

| Measure | Planner | Baseline (3 most played, not locked) |
|---|---|---|
| Hit rate (at least 1 of 3 predicted picks really picked) | 20.0% (14/70) | 25.7% (18/70) |
| Precision (predicted picks really picked) | 7.1% (15/210) | 9.5% (20/210) |

Planned bans (our 3) that the opponent picked or banned themselves in that game: **25.2% (53/210)**.
Planner hit where the baseline missed: 9 runs. Baseline hit where the planner missed: 13 runs.

## What this means

On TUNE (212 runs): the planner beats the naive baseline on both measures, 43.4% hit rate and 17.0% precision against 39.2% and 15.3%. On TEST (70 runs): the planner loses to the naive baseline on both measures, 20.0% hit rate and 7.1% precision against 25.7% and 9.5%. TEST was run once, after every choice was fixed on TUNE, and is reported as it came out. The planner does not beat the baseline on TEST: the gain on TUNE did not carry over to games the weights never saw, so it should be read as fitted to TUNE, not as a real improvement. Head to head on TEST, the planner hit where the baseline missed in 9 runs and the baseline hit where the planner missed in 13. Of our planned bans, 25.2% on TEST (27.7% on TUNE) were champions the opponent picked or banned themselves in that game; the rest were champions the opponent neither picked nor banned. This shows whether the bans aimed at champions that mattered to them, not that they were good bans. What the numbers do not mean: the real teams ban too, so a correct prediction can be banned away before it is ever picked, and a miss can be a champion that was banned rather than a bad read. The planner only predicts three picks while a team picks five, so precision cannot reach 100% and is not comparable to a full-draft forecast. The score says nothing about whether our own picks or bans would have won games. TEST holds only 70 runs from 35 games, so a gap of a few points is a handful of runs and well within noise; TUNE numbers are flattered because the weights were picked on them. Early cases rest on only 10 to a few dozen prior games per team.

Rerun it:

```bash
python pipeline/backtest.py --data ../stl-hackathon-2026-grid-starter
node tests/backtest.js
```
