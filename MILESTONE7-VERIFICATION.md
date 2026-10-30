# Milestone 7 verification - October 30, 2026

## Candidate and recovery

Protocol 16: BREAK TIME - Milestone 7 - Paired Beam Haul. Based directly on the user-accepted protocol 15 commit 0e768f1b141f135a81467177205260041cbc66a4. Recovery branch codex/protocol15-recovery and external Beam-Crew-protocol15-recovery.bundle verified with complete history. Existing recovery branches and unrelated untracked files were not changed.

## Local verification

- Production build passed (TypeScript client/server and Vite). Existing non-blocking large-bundle warning remains, approximately 734 kB minified.
- Full isolated production-server suite: **109 passed, 0 failed, 0 skipped**, 441.3 seconds. Real WebSocket tests enabled.
- Coverage: 2/4/6/8-player pair assignment and synchronized grabs; complete extended Beam delivery, release/regrab, non-host reset rejection, reconnect and replay; immutable deliveries and DNF; deterministic moving loads and worker/beam collisions; both supports required for delivery; all existing Championship 3/5/10, single-race, materials, scoring, countdown, host-transfer and reconnect regressions.
- Earlier exploratory runs failed on an overly close load spacing, an incorrectly chosen collision-test point and a legacy test fixture at the former goal with no held ends. Load spacing and fixtures were corrected. The complete 109-pass run supersedes those failures; no tests were skipped to obtain the result.
- Scope comparison: Wheelbarrow physics, Championship/course modules, menu artwork/material cards, reconnect implementation, synchronized schema and dependency lockfile are unchanged. Shared movement has an optional wider x bound used only for Beam Carry. Existing defaults stay unchanged.

## Browser verification

Two actual local browser clients created/joined Beam Carry, grabbed both ends, traversed the doorway, coordinated a turn and drove the moving-load corridor. Reload recovered the same assigned end; host transferred through existing behavior. Both clients completed with identical #1 delivery and frozen 890.97s time (includes extended inspection pauses; not a normal-course duration benchmark). Return to lobby and switch to Championship showed the unchanged three-race default, all twelve material cards, and existing 2/3/5/10 choices. Both verification clients left normally.

Visual inspection caught and corrected the old platform rail crossing the extended corridor, and lowered new corridor barriers to retain worker visibility. Actual screenshots: docs/beam-paired-preview.png, docs/beam-haul-preview.png, docs/beam-results-preview.png and docs/menu-preview.png. These are local preview evidence. A requested mobile viewport override did not change the actual browser viewport, so no mobile browser-emulation pass is claimed.

## Live status

Before rollout, public service srv-dbglagdg1s2s73bmg9u0 remained live at protocol 15 / 0e768f1, deploy dep-dbi99s8m7kps73c8frsg. User confirmed My Workspace (tea-dbgkg8sipgvc73dr3rtg). Automatic deployment is off; no service/plan/environment changes are required. Rollout and public checks are recorded after deployment below.

Physical laptop+iPhone acceptance of this upgrade is pending. Use PLAYTEST-M7.md. No physical touch latency, thermal or FPS improvement is claimed. Moving kinematic loads can transiently intersect a waiting beam as they sweep through; the server blocks attempted movement through their occupied footprint. Test the visual contact feel on devices before submission.

October 31 is user-supplied. Exact official cutoff/timezone and submission rules are unverified; SUBMISSION.md lists the remaining checks. Crane and Store remain unimplemented.
