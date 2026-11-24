# How Junie built half of Draft Room

Draft Room started as a working planner: a data pipeline, the plan rules and a one-screen app. Everything after that first version was built by Junie CLI from written tasks. This page is the story of those tasks, what Junie did with them, and what I learned about working with a coding agent on a project that has hard rules.

Every task, Junie's full session and the diff it produced are in this repo:

- `.junie/guidelines.md`: the project rules Junie reads before every task
- `.junie/sessions/*.md`: the session transcripts, one per task
- Pull requests #1 to #4: the reviewed changes

## The setup

- **Junie CLI in headless mode**, one task per run, started from a terminal with a task file: `junie --provider=anthropic --model=claude-sonnet-5-5 "$(cat task.txt)"`.
- **Bring your own key.** Junie talked to the model with my own API key, so there was no extra account or subscription in the loop.
- **One branch and one pull request per task.** I read every diff, ran the checks myself and opened the app in a browser before merging.
- **Guidelines first.** `.junie/guidelines.md` holds the rules that must never break: plain HTML/CSS/JS with no new dependencies, every number from the data, never commit the licensed GRID data, keep the visual style, and the whole app fits one laptop screen.

## The tasks

### 1. Copy plan

A coach wants the plan in the team chat, not on a projector. The task described the exact text shape, the button's place and its states. Junie added the button, the clipboard handler and the style, and ran the planner tests. Its own report said it had not checked the layout in a browser. That was true, so I checked it: the copied text matched the plan and the page still fit.

### 2. Fearless outlook, and the screen that stopped fitting

The second task added a per-role depth bar: how many proven champions each role keeps after this game's picks. Junie put the logic in the planner as a pure function, added tests for it, and drew the rows.

Then Junie noticed something I had missed: the page already scrolled by 13 pixels at 1366x680 after task 1. I wrote a browser check, `tests/fit.py`, that opens the app at three laptop sizes for six opponents, at game 1 and after a real game 1 is loaded. It reported 15 cases that scrolled. The follow-up task was one sentence long: make `python tests/fit.py` print "all fit". Junie tried moving the recap into the middle panel, measured that it made things worse, reverted it, and found a layout that fits all 36 cases.

Lesson: a check that prints pass or fail is a better task than a description of a layout.

### 3. Print sheet and shortcuts

Coaches still print. Junie added a one-page landscape sheet and keyboard shortcuts with a help card. While testing the print state it found a real bug in the replay: a float rounding error left the last of 12 draft steps one tick short, so the replay never reached "Plan ready" and the first-blood map never drew its dots. It fixed it in the same task.

### 4. The backtest, and an answer I did not want

The last tasks asked the question a coach would ask first: would this have worked? Junie refactored the pipeline so profiles can be built from any slice of games, then wrote a backtest that replays every LCS 2026 game it can with only the data available before that series, fearless locks included.

The task set the rules before any number was seen. Games before July were for tuning. Games after July were scored once, at the end, and reported as they came out.

The first result: the planner's guess of the opponent's picks lost to a plain "their three most-played champions" list. Junie then tuned a better predictor on the early games. It won there, and lost again on the later games. Junie's report said so in its first line, and the published page does too.

The same backtest also scored the parts of the plan a coach acts on. On the held-out games, the plan's first pick was banned away in 2 of 70 runs. Its bans hit a champion the opponent really used in 25% of cases, against 19% for a most-played list. The full tables, with intervals and the caveats, are in [backtest.md](backtest.md).

Lesson: an agent will tell you an uncomfortable result if the task asks for honesty and fixes the rules in advance.

## What worked

- **Short tasks with one check at the end.** "Run `node tests/planner.test.js` and `python tests/fit.py`" did more than paragraphs of layout advice.
- **Guidelines as a contract.** Junie never added a dependency, never invented a number and never touched the licensed data.
- **Reading Junie's notes.** Every report ended with what it had not checked. Those notes are where the next task came from.

## What I would do differently

- Give Junie the browser check from the start, not after the first layout slip.
- Keep the tuning and test split in the very first backtest task, so there is only one round of "it won on data it had seen".
