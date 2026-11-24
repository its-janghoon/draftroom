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
| `tests/backtest.js` | Scores the planner against real games and writes `docs/backtest.md`. |

Roles are inferred from where each player stood between 1:30 and 5:30 and their starting item, then voted over all of that player's games.

## Data

The match data is © GRID eSports GmbH and Riot Games, Inc. and is licensed only for building hackathon projects. It is not in this repository: `cache/` and `web/data.js` are built from your own copy and are ignored by git. The map in the app is drawn from plain shapes, with no Riot artwork.

League of Legends is a trademark of Riot Games, Inc. This project is not endorsed by Riot Games.

## License

MIT, see [LICENSE](LICENSE).
