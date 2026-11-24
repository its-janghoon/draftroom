# Backtest

If a coach had used the planner before each real LCS 2026 game, how often would its prediction of the opponent's picks have been right?

- **Date range:** 2026-02-22 to 2026-10-12
- **Games:** 141 (of 225 LCS games since 2026-01-01; left out: 71 for a team with under 10 prior games, 11 for incomplete draft, 2 for side unknown)
- **Runs:** 282 (every game is planned twice, once with each team as "us")

## Method

- Each team's profile uses only LCS games dated before the series' scheduled date, and player roles are voted from those same games. A game is skipped if either team has fewer than 10 prior games.
- Champions picked in earlier games of the same series are locked (fearless).
- From each run, the 3 champions in `steps.them_pick` are the predicted opponent picks, scored against the opponent's real 5 picks in that game.
- The baseline ignores the draft logic: the opponent's 3 most-played champions this season that are not locked.
- Head-to-head history is left out of the planner input, because it would include this series or later ones.

## Results

| Measure | Planner | Baseline (3 most played, not locked) |
|---|---|---|
| Hit rate (at least 1 of 3 predicted picks really picked) | 33.7% (95/282) | 35.8% (101/282) |
| Precision (predicted picks really picked) | 12.4% (105/846) | 13.8% (117/846) |

Planned bans (our 3) that the opponent picked or banned themselves in that game: **27.1% (229/846)**.

Planner hit where the baseline missed: 42 runs. Baseline hit where the planner missed: 48 runs.

## What this means

In 282 runs the planner named at least one champion the opponent really picked 33.7% of the time, and 12.4% of its individual predictions were right. The baseline scores 35.8% and 13.8%. The planner loses to the naive baseline on both measures. Its draft logic (first-pick habit, one pick per role, leaving out champions already named in the plan) did not predict the opponent better than simply listing what they play most. Head to head, the planner hit where the baseline missed in 42 runs and the baseline hit where the planner missed in 48. 27.1% of our planned bans were champions the opponent picked or banned themselves in that game; 72.9% were champions the opponent neither picked nor banned. This shows whether the bans aimed at champions that mattered to them, not that they were good bans. What the numbers do not mean: the real teams ban too, so a correct prediction can be banned away before it is ever picked, and a miss can be a champion that was banned rather than a bad read. The planner only predicts three picks while a team picks five, so precision cannot reach 100% and is not comparable to a full-draft forecast. The score says nothing about whether our own picks or bans would have won games, and 282 runs from one season is a small sample, so differences of a few points are within noise. Early cases rest on only 10 to a few dozen prior games per team.

Rerun it:

```bash
python pipeline/backtest.py --data ../stl-hackathon-2026-grid-starter
node tests/backtest.js
```
