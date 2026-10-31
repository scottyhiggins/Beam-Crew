# Milestone 23 — Wheelbarrow HUD and performance

Branch: `feature/wheelbarrow-hud-polish`.
Base: `380c834f5dad12dca8553f525ab6e8353e89f1be` (#22, Protocol 21).
The delivery commit is the commit containing this handoff. The recovery tag
`checkpoint/m23-wheelbarrow-hud` resolves to that same commit.

## Changes

- Actual randomized course name above `COURSE n/total`.
- Always-visible official cumulative leaderboard for all workers. No course-result
  history. Pending workers display “Awaiting result”; partial totals retain a
  completed-races count. Official server ordering remains authoritative: completion
  eligibility, spills first, then racing time, with existing DNF handling.
- Removed Wheelbarrow Results button, Standings dropdown, white status panel and
  redundant status readouts. Beam controls remain available.
- Post-finish staging notice hides at next GO. Physics, spike strips, reverse
  barriers, free movement and score freezing are unchanged.
- Existing 3D podium renderer appears in a small dock instead of the blocking
  championship popup. Cosmetics and all eight workers remain represented. Awards
  appear in the cumulative leaderboard. Host replay returns to the existing lobby
  flow; Quick Match retains its existing matchmaking replay flow.
- Only 3/5/10 are selectable and server-valid. Restart normalizes stale invalid
  lengths to three unique randomized courses. No schema, protocol or dependency
  changes.

## Validation and evidence

Final full-suite result is recorded in `qa/m23/regression-final.txt`.
**229 passed, 0 failed, 0 skipped, 0 cancelled.** Every test name, status and duration is retained there, including the real
WebSocket 3/5/10 series, reconnect, replay, host transfer, scoring, staging,
barriers, Quick Match, Beam, Trivia, Crane, Party, Worker Store and podium tests.

- HUD browser verification: **38 passed, 0 failed**, zero page errors.
- Worker Store browsers: **13 passed, 0 failed**, desktop and 319px; preview, seasonal cosmetics, save/reopen and close.
- Cross-mode browsers: **75 passed, 0 failed**: production/Crane 17,
  Trivia/Quick Match 21, Beam/Party invites 5, Party playlists 32.
- Cross-mode Party validation uses the existing eight-second deadline fixture,
  three complete eight-worker playlists, no injected scores, and checks cosmetics,
  replay cleanup, host transfer and WebGL-context limits.
- HUD visual fixture positions racers at legitimate server finish areas to test
  UI states quickly; it is not evidence of natural driving. Natural driving and
  physics are covered by the full regression suite. QA endpoints exist only in
  `scripts/m23-browser-fixture.mjs`, never in the production server.
- Headless Edge: desktop 1366×900, mobile emulation 390×844, 844×390 and 319×700.
  Eight-worker rows fit their container; leaderboard, podium, joystick and header
  controls are checked together. Reload reconnect and replay reset are checked.
- Production build: passed TypeScript client/server checks and Vite build.
  Existing shared Three.js/podium chunk still produces the >500 kB warning.
- `git diff --check`: passed.

An earlier complete run passed 228/229; its only failure required the old
Standings dropdown. That assertion was updated for this milestone and its focused
tests passed. See `qa/m23/regression-initial.txt`; the final run supersedes it.
Earlier attempts also exposed the obsolete two-course network-test assumptions;
those now verify randomized three-course racing and rejection of two courses.

Screenshots in `qa/m23/` pair the exact base archive with this implementation:

| State | Before | After |
|---|---|---|
| Desktop race | `before-desktop.png` | `after-desktop.png` |
| iPhone-sized race | `before-iphone.png` | `after-iphone.png` |
| Desktop podium | `before-podium-desktop.png` | `after-podium-desktop.png` |
| iPhone-sized podium | `before-podium-iphone.png` | `after-podium-iphone.png` |

Additional combined HUD/podium captures: `after-podium-319.png` and
`after-podium-844.png`. Cross-mode evidence is in `qa/m23/cross-mode/`.
Randomized routes differ between captures; these are layout comparisons, not
identical-scene rendering benchmarks.

## Performance findings

Clear avoidable CPU/allocation work was removed:

1. The scoreboard serialized the entire course-result history on network patches.
   Its change key now contains only displayed cumulative rows, and unchanged rows
   do not replace DOM nodes.
2. The hidden lobby roster rebuilt on every state patch. It now updates only when
   displayed membership, name, color, connection or host fields change.
3. Camera interpolation allocated temporary vectors every rendered frame. Those
   two vectors are reused.
4. Cosmetic validation recreated allowlist arrays for each worker each frame.
   Shared immutable lookup sets replace those temporary arrays.
5. Championship results rebuilt a hidden course-result list while staging. That
   duplicate list update was removed. The existing podium remains signature guarded.

CPU microbenchmark, seven trials after warmup, eight workers and ten races:

| Operation | Before median | After median |
|---|---:|---:|
| 2,000 scoreboard-key calculations | 453.33 ms | 6.92 ms |
| 100,000 cosmetic validations | 23.21 ms | 1.69 ms |

The score key shrank from 11,281 to 376 bytes in that fixture. These are isolated
CPU measurements, not FPS improvements. Raw trials: `qa/m23/performance.json`.

Three-second headless rAF samples had p50≈6.1 ms and p95≈6.2 ms both before and
after, with no >33.4 ms intervals. The unusually uniform headless timings and short
samples are insufficient to reproduce physical laptop/iPhone stutters or claim a
frame-rate improvement. Raw samples: `qa/m23/browser-results.json`.

No rendering quality, resolution limits, geometry detail or effects were reduced.
Existing course creation and countdown GPU warmup remain; initial course/shader
work is still a plausible source of device-specific stalls and needs physical
device profiling if those stalls persist.

## Reproduction

Use Node 24 and the locked dependencies. Build with the repository's `build`
script, then `node scripts/test-live.mjs` (the runner chooses its own free port).
On this desktop runtime, pnpm's automatic dependency-layout recheck attempted an
unnecessary reinstall; the successful build used
`pnpm --config.verify-deps-before-run=false run build` against the installed lockfile.

`node scripts/m23-cross-mode-run.mjs` uses ports 2843/2844. HUD comparison uses
`node scripts/m23-browser-run.mjs`, ports 2834/2835, and an ignored `baseline-m22/`
archive of the exact base compiled separately. `scripts/m23-performance.mjs`
compares against that baseline's compiled cosmetics implementation.
Playwright is supplied by the desktop's bundled runtime, not a new game dependency;
the QA scripts currently reference this desktop's runtime path.

All development/QA servers were separate from #22 and production. No other
checkout was edited. The new checkout has its own Git object database, no
alternates, and no hard-linked clone objects. Nothing was pushed, merged or deployed.

## Integration and recovery

Review the diff from the base to `feature/wheelbarrow-hud-polish`. For #22 integration,
apply this single delivery commit to an integration branch based on the stated
base, rerun build and regression checks, then perform physical device acceptance.
Do not copy ignored baseline builds or local dependency directories.

Recovery checkpoint: local tag `checkpoint/m23-wheelbarrow-hud` and standalone
`recovery/m23-wheelbarrow-hud.bundle` in this independent checkout. Bundle creation
and verification are recorded in `recovery/m23-checkpoint.txt` after committing.
The bundle includes the branch history and can be cloned independently; the tag
and final commit identify the same delivered state.

## Known limitations

- Physical iPhone Safari and the reported laptop hardware were unavailable.
  Browser results are desktop Edge and mobile emulation, not physical-device FPS.
- Narrow landscape layouts necessarily leave a compact view of the existing 3D
  podium; the authoritative full ranking and awards remain in the leaderboard.
- Existing historical geometry unit fixtures still directly construct the former
  two-section track to preserve barrier/physics coverage. They bypass production
  initialization explicitly; no two-course series is selectable or replayable.
- The inherited build label still identifies #22 / Protocol 21. The branch, commit,
  handoff and checkpoint identify this milestone; no protocol bump was necessary.
