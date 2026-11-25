# Draft Room guidelines for Junie

- The app is plain HTML, CSS and JavaScript in `web/`. No frameworks, no build step. The only third-party code is `web/vendor/fzstd.js` (MIT, zstd decoder, vendored as a file). Ask before adding anything else.
- `web/planner.js` holds the plan rules and must keep running in Node (`node tests/planner.test.js`).
- Every number shown to a coach comes from `web/data.js`. Never invent a number.
- Never commit GRID data or anything built from it: `web/data.js`, `cache/`, `*.zst`, `*.jsonl`. The one exception is `web/demo-data.js`: season aggregates only (counts, records, averages), no per-game rows, no positions, no series.
- Match the existing look in `web/style.css`: dark background, Barlow and Barlow Condensed, blue `--c9` for us, grey `--tl` for the opponent, red `--ban` only for bans, yellow `--gold` only for decided moments. Print stays white.
- Every button needs a visible `:focus-visible` style.
- The whole app must fit one screen at 1366x680 with no scrolling.
