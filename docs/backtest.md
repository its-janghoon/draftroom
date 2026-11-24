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
- Our own plan is scored against what the opponent really banned in that game. Metric 1 (first pick survives): `steps.us_pick[0]` was not among the opponent's real bans; baseline is our single most-played champion this season that is not locked. Metric 2 (all three survive): none of the 3 planned picks was banned by them; baseline is our 3 most-played open champions, one per role (a champion counts in the role it played most). Runs where the planner named fewer than 3 picks, or the baseline could not fill 3 roles, are left out of metric 2 (20 runs).
- Metric 3 (bans that mattered): per planned ban, whether the opponent picked or banned it in that game; baseline is the opponent's 3 most-played open champions, scored the same way.
- Metric 4 (fearless warning held): the role named in `plan.thin` counts as held when, after every game of the series as really played (this game and later ones, picks of both teams), our team had no champion left in that role with 5+ games before the series. The baseline is the same test for each of the 5 roles (so its n is 5 per run), that is, how often any role picked blindly would have run dry. It is skipped for a split with under 20 runs.
- Intervals are 95% Wilson score intervals. They treat every run, pick or ban as independent, which they are not: the two runs of one game share a draft, bans of one run share a plan, and games of one series share the same locks. The true uncertainty is wider than printed.
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

| Measure | n | Planner | Planner 95% CI | Baseline n | Baseline | Baseline 95% CI |
|---|---|---|---|---|---|---|
| Opponent picks: hit rate (at least 1 of 3 predicted picks really picked) | 212 | 43.4% (92/212) | 36.9% to 50.1% | 212 | 39.2% (83/212) | 32.8% to 45.9% |
| Opponent picks: precision (predicted picks really picked) | 636 | 17.0% (108/636) | 14.3% to 20.1% | 636 | 15.3% (97/636) | 12.7% to 18.3% |
| 1. First pick survives (not banned by the opponent) | 212 | 88.7% (188/212) | 83.7% to 92.3% | 212 | 86.3% (183/212) | 81.0% to 90.3% |
| 2. All 3 planned picks survive the opponent's bans | 193 | 57.0% (110/193) | 49.9% to 63.8% | 193 | 64.8% (125/193) | 57.8% to 71.2% |
| 3. Bans that mattered (opponent picked or banned it, per planned ban) | 636 | 27.7% (176/636) | 24.3% to 31.3% | 636 | 22.2% (141/636) | 19.1% to 25.6% |
| 4. Fearless warning held (thin role really ran out of proven champions) | 212 | 87.3% (185/212) | 82.1% to 91.1% | 1060 | 64.9% (688/1060) | 62.0% to 67.7% |

Planned bans (our 3) that the opponent picked or banned themselves in that game: **27.7% (176/636)**.
Of the 212 runs for metric 4, 134 named a role in which we had no proven champion even before the series started, so the warning could not fail there.
Planner hit where the baseline missed: 47 runs. Baseline hit where the planner missed: 38 runs.

### TEST: 2026-07-26 to 2026-10-12, 35 games, 70 runs

| Measure | n | Planner | Planner 95% CI | Baseline n | Baseline | Baseline 95% CI |
|---|---|---|---|---|---|---|
| Opponent picks: hit rate (at least 1 of 3 predicted picks really picked) | 70 | 20.0% (14/70) | 12.3% to 30.8% | 70 | 25.7% (18/70) | 16.9% to 37.0% |
| Opponent picks: precision (predicted picks really picked) | 210 | 7.1% (15/210) | 4.4% to 11.4% | 210 | 9.5% (20/210) | 6.2% to 14.3% |
| 1. First pick survives (not banned by the opponent) | 70 | 97.1% (68/70) | 90.2% to 99.2% | 70 | 90.0% (63/70) | 80.8% to 95.1% |
| 2. All 3 planned picks survive the opponent's bans | 69 | 75.4% (52/69) | 64.0% to 84.0% | 69 | 68.1% (47/69) | 56.4% to 77.9% |
| 3. Bans that mattered (opponent picked or banned it, per planned ban) | 210 | 25.2% (53/210) | 19.8% to 31.5% | 210 | 19.0% (40/210) | 14.3% to 24.9% |
| 4. Fearless warning held (thin role really ran out of proven champions) | 70 | 31.4% (22/70) | 21.8% to 43.0% | 350 | 14.9% (52/350) | 11.5% to 19.0% |

Planned bans (our 3) that the opponent picked or banned themselves in that game: **25.2% (53/210)**.
Of the 70 runs for metric 4, 14 named a role in which we had no proven champion even before the series started, so the warning could not fail there.
Planner hit where the baseline missed: 9 runs. Baseline hit where the planner missed: 13 runs.

## What this means

On TUNE (212 runs): the planner beats the naive baseline on both measures, 43.4% hit rate and 17.0% precision against 39.2% and 15.3%. On TEST (70 runs): the planner loses to the naive baseline on both measures, 20.0% hit rate and 7.1% precision against 25.7% and 9.5%. TEST was run once, after every choice was fixed on TUNE, and is reported as it came out. The planner does not beat the baseline on TEST: the gain on TUNE did not carry over to games the weights never saw, so it should be read as fitted to TUNE, not as a real improvement. Head to head on TEST, the planner hit where the baseline missed in 9 runs and the baseline hit where the planner missed in 13. Of our planned bans, 25.2% on TEST (27.7% on TUNE) were champions the opponent picked or banned themselves in that game; the rest were champions the opponent neither picked nor banned. This shows whether the bans aimed at champions that mattered to them, not that they were good bans. What the numbers do not mean: the real teams ban too, so a correct prediction can be banned away before it is ever picked, and a miss can be a champion that was banned rather than a bad read. The planner only predicts three picks while a team picks five, so precision cannot reach 100% and is not comparable to a full-draft forecast. The score says nothing about whether our own picks or bans would have won games. TEST holds only 70 runs from 35 games, so a gap of a few points is a handful of runs and well within noise; TUNE numbers are flattered because the weights were picked on them. Early cases rest on only 10 to a few dozen prior games per team.

Our own plan. On TEST (TUNE in brackets): the first pick survived the opponent's real bans in 97.1% (68/70) of runs (88.7%), ahead of the baseline, intervals overlap, baseline 90.0% (86.3%). All three planned picks survived in 75.4% (52/69) (57.0%), ahead of the baseline, intervals overlap, baseline 68.1% (64.8%). Planned bans that mattered: 25.2% (53/210) (27.7%), ahead of the baseline, intervals overlap, baseline 19.0% (22.2%). Fearless warning held: 31.4% (22/70) (87.3%), ahead of the baseline, intervals apart, baseline 14.9% (64.9%). What the plan gets right: a planned first pick was banned away in only 2 of 70 runs on TEST (24 of 212 on TUNE), and the planned bans hit a champion the opponent used in about 25% of cases on TEST, a little above the 19% of the plain most-played list. What it does not get right: the planned first pick survives about as often as simply opening with our most-played champion, so the pick logic is not shown to add protection; on TUNE all three picks survived less often than the baseline's (57.0% against 64.8%), and the TEST lead on that is within the intervals; about three in four planned bans were champions the opponent neither picked nor banned; and the fearless warning is weak evidence on TUNE, because 134 of its 212 runs named a role where we had no proven champion even before the series, so it could not fail there (14 of 70 on TEST). On the runs where the role still had proven champions at the start, it held in 8 of 56 on TEST (7.4% to 25.7%) and 51 of 78 on TUNE (54.3% to 75.0%). The sample is small: TEST is 70 runs from 35 games, the two runs of a game share one draft, and most intervals above are 10 to 20 points wide, so a gap of a few points is noise. Where the planner's interval overlaps the baseline's, the two are not told apart. None of this says whether the picks and bans would have won games, and a real opponent might have drafted differently against a different plan.

Rerun it:

```bash
python pipeline/backtest.py --data ../stl-hackathon-2026-grid-starter
node tests/backtest.js
```
