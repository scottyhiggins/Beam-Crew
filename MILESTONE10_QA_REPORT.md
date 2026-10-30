# Milestone 10: final integration QA fixes

Date: October 30, 2026. Work continued only in the existing isolated checkout:
`C:\Users\higgi\.codex\.chatgpt-projects\g-p-6ac291cf8ecc81919bbc636308fbf05d\Beam-Crew-integration`.
Branch: `feature/integration-chaos-quickmatch`.
Starting checkpoint: `08ca34d759f28d4765aaa447be08d6ac1562e14a`.
Protocol remains **18**; client/server synchronized schema and version constant are unchanged.

## Fixed

1. **Invalid Beam replay/start (Priority 1).** Confirmed still present in the integrated checkpoint, then reproduced with failing focused tests before modification. `restart()` now checks connected eligible workers before changing teams, poses, clocks, route IDs or reset counters. Fewer than two returns failure and publishes the waiting-for-a-teammate feedback. Start enters the active/locked phase only after a successful restart. Disconnected reservations do not count until reconnection; connected spectators may form a new valid pair on replay. Valid 2/4/6/8-player rounds retain exactly two workers per beam; odd counts retain complete pairs plus the existing spectator. Failed restart/reset preserves the completed DNF/team results and room phase. The client defensively suppresses an empty Beam results overlay.
2. **Spectator/stale action UI (Priority 2).** Shared `beamActionState()` guards authoritative action messages and client controls. Spectators, missing teams, countdown/results, DNF/delivered teams, reconnect waits and recovery protection have inactive actions. Desktop and mobile buttons reset their labels, disabled/hidden states and attached styling before any early return; inapplicable feedback is not appended to spectator/ended-round instructions. Team departure/DNF/delivery clears stale grips and input. Keyboard actions use the same rule. Active paired workers still grab/release normally.
3. **319px Championship HUD (Priority 3).** Portrait Championship HUD uses separate flow/grid rows for the race header/menu, status, scoring explanation, and Standings/Results. Text wraps, the standings dropdown starts below the summary, and safe-area offsets remain applied. Menu/Standings targets remain at least 44px high. Changes are scoped to portrait widths up to 600px; the existing desktop and touch-landscape rules are retained.

## Investigated and deferred

**Priority 4: Championship stalls.** A connected non-finisher can still stall private or public Championship. Existing DNF handling assumes player removal; a safe connected-player DNF requires eligibility, result/next-leg/reconnect rules and a published deadline. Under the user's explicit scoring-risk exception, this patch leaves competition scoring unchanged and records the concrete private-host-confirmation/public-time-limit design in `QA_CHAMPIONSHIP_STALL_DESIGN.md`. This is a remaining public-release limitation, not a fixed issue.

## Regression and browser evidence

- Fourteen focused QA regressions cover solo replay, reserved disconnects, re-entry, 2/4/6/8 pairs, odd/zero connected counts, team DNF, actual desktop/mobile label reset, inactive action policy, real-socket guest departure, host transfer, spectator promotion and reconnect replay. `verification/qa-focused-tests.txt`: **14 passed, 0 failed/skipped**.
- The first full run passed **154 tests, 0 failed/skipped**, including all previously integrated features and the then-current QA tests (`verification/qa-full-suite.txt`). Two control-adapter tests were added during browser QA; the final complete run includes those as well.
- Real browser clients verified active grab/release, valid replay, spectator controls, teammate departure clearing RELEASE/attached state, a nonempty DNF ledger, and solo-host replay rejection preserving that ledger. Data: `verification/qa-browser-active-controls.json`, `qa-browser-spectator.json`, `qa-browser-departure.json`, `qa-browser-solo-replay.json`.
- A real game instance in the local responsive iframe harness had measured widths **319, 320, 375, 390, 430, 844 and 1280px**. At each size, Standings did not intersect score/status bounds and Menu/Standings heights were 44px. At 319px, the open standings dropdown stayed within the 295px usable width and below the scoring text. See `verification/qa-browser-layout.json`, `qa-hud-319.png` and `qa-spectator-319.png`.
- The in-app browser's viewport override did not change its observed 1280x720 viewport, so it was not used as responsive proof. The iframe supplies the verified inner viewport widths. This exercises real DOM/CSS and WebGL game clients, but does not emulate physical iPhone touch, nonzero notch insets, GPU performance or Safari.
- Reproduce responsive testing after a production build by copying `verification/qa-responsive.html` into `dist/qa-responsive.html`, starting the temporary local preview with `node verification/qa-preview.mjs`, and opening its printed local endpoint plus `/qa-responsive.html`. The fixture is not part of Vite's published production output. The preview uses an unused local port, has a 15-minute stop timer, and only sets temporary child-process test configuration.

## Safety and physical acceptance

No main merge, remote push, Render action or production environment edit. Original checkout and Milestone 8/9/11 worktrees/branches remain outside the edited paths. Existing recovery refs and bundles are retained; the new checkpoint uses a local tag and bundle without creating another development branch.

Physical laptop+iPhone checklist:

1. Create a two-worker Beam room, grab, let the guest leave, close DNF results, then restart. Expect the waiting-for-a-teammate message, the previous result retained, no spectator-only countdown and no RELEASE/action controls.
2. Return to lobby, invite the guest back, replay, then reload/disconnect during countdown and carry. Check host transfer, same-team reconnection, action restoration, penalties and results. Repeat with 4/6/8 workers and an odd spectator.
3. Try all three Beam courses, excavator, knockback, elevated falls, checkpoints, +5-second recovery, finish and replay. Verify both phone orientations and normal grab/release.
4. At narrow portrait widths, open/close Standings during Championship. Confirm score text remains readable, targets are usable near notches/safe areas, and landscape layout stays usable.
5. Quick Match: 2–8 workers, synchronized 15-second countdown, cancel/rejoin, public/private separation, racing reconnect, three-course results and Play Again; ninth client enters another waiting room.
6. Run a ten-course Championship with mixed materials. Check unique courses, five-second 3/2/1/GO transitions, cumulative official spills/time, frozen post-finish scores, staging/spikes and FIFO removal during long eight-client debris stress. Physical iPhone frame pacing/heat/memory acceptance is still required.
7. Account for the documented Championship idle-player stall; do not assume an automatic public DNF deadline exists in this build.

Deployment recommendation: fixed QA issues are ready for review after automated validation, but **not ready for unconditional public deployment approval** while the Championship-stall decision and physical laptop+iPhone acceptance remain outstanding. Keep stable Protocol 16 (`9412286`) live for the October 30, 11:59 PM Pacific contest deadline. Stop after testing/reporting and wait for explicit user approval before merging or deploying.

## Final automated verification

Final `pnpm run test:all` passed on the final code: **156 tests passed, 0 failed, 0 skipped, 0 cancelled**, duration **450.857 seconds**. This includes the 142 integrated tests and all 14 new QA tests in one complete run. Full output: `verification/qa-final-full-suite.txt`.

The same run passed client/server TypeScript checks and the production Vite build (79 modules; JS 739.90 kB / 207.28 kB gzip, CSS 23.49 kB / 5.61 kB gzip). The existing >500 kB JavaScript chunk warning remains nonfatal. `verification/qa-production-build.txt` contains the final build portion of that run. Startup/protocol tests passed 3/3 within the full suite. No dependency or lockfile change was made.

Final source diff check passed. No new timers, room message registrations or event listeners were added by the gameplay/UI patch; the shared policy and control adapter are synchronous. Existing socket cleanup/capacity/FIFO/coexistence regressions also passed. Browser heap/GPU soak and physical Safari testing are not claimed.

The temporary preview server stopped successfully on its 15-minute timer; temporary browser tabs were closed and the browser viewport override reset. The responsive test page was removed from `dist/` after testing. Only the reproducible QA fixture source remains in `verification/`.

Recovery checkpoint: local tag `milestone10-integration-qa-20261030` on this branch's final QA commit. Bundle and exact commit/SHA256 manifest are in `verification/recovery/`, excluded locally from Git to avoid embedding a repository bundle into its own history. The bundle includes stable/feature/integration recovery refs and is checked with `git bundle verify`. No additional development branch was created.
