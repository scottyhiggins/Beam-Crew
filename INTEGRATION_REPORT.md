# Work C integration verification

Integration branch: `feature/integration-chaos-quickmatch` (local only).
Checkout: `C:\Users\higgi\.codex\.chatgpt-projects\g-p-6ac291cf8ecc81919bbc636308fbf05d\Beam-Crew-integration`.
Date: October 30, 2026. Submission deadline: October 30, 2026, 11:59 PM Pacific (October 31, 12:59 AM Denver).

## Source and recovery audit

- Original game: `C:\Users\higgi\OneDrive\Documents\Beam-Crew`, main at `94122866c5334f2220aab8c0e44aca07c1b64a08`. No tracked changes. Pre-existing untracked entries: `Finish-BeamCrew-PlaytestFixes.cmd`, `work-guest.mjs`, `work/`. These remain untouched; the checkout is not completely clean because of those entries.
- Construction Chaos: `C:\Users\higgi\.codex\.chatgpt-projects\g-p-6ac291cf8ecc81919bbc636308fbf05d\beam-chaos`, clean at `678d8f80cc76df0265c3e2aad60162d7664c5dfc` on `feature/beam-chaos`.
- Quick Match: `C:\Users\higgi\.codex\visualizations\2026\10\30\01a18e1b-b4f7-74c2-b3bd-09fe2e1c186f\Beam-Crew-quick-match`, clean at `01ac469cecaaec8a4c6784b24207bf166b396c85` on `feature/quick-match`.
- Both feature merge bases with Protocol 16 equal the full `9412286` hash above.
- The project mirror at this checkout's parent is an older Git repository with existing untracked reference/work files; it was not used as the baseline and was not edited.
- Verified complete-history bundles: parent `Beam-Crew-protocol16-stable.bundle`; Chaos `verification/recovery/beam-chaos-final.bundle`; Quick Match sibling `Beam-Crew-quick-match-recovery.bundle`. All pass `git bundle verify` and contain the exact requested tips.
- This is an independent clone with its own Git storage, created using `--no-hardlinks`. Construction Chaos was fast-forwarded first from Protocol 16, followed by a true merge of Quick Match.
- Recovery refs inside this clone: `codex/protocol16-stable`, `feature/beam-chaos`, `feature/quick-match`, and the integration branch. Original recovery branches remain untouched.

## Conflict and compatibility decisions

- `client/main.ts`: retained all four tiles, Beam map selector, overview and rescue; added Quick Match/cancel/private entry and public replay controls. Retained both game render paths and reconnect behavior. Repaired inherited replacement characters in Quick Match status text.
- `client/style.css`: retained both Beam controls and Quick Match styling.
- `server/room.ts`: retained Chaos map selection, recovery, checkpoints, physics and paired results; retained public host-command guards and FIFO trimming in both Wheelbarrow paths. Map selection also rejects public commands. One handler per message remains.
- `server/state.ts`: retained the union of Beam team recovery fields, map selection, public match flag, and lobby countdown in both class fields and synchronized type definitions.
- `shared/version.ts`: integrated Protocol **18**. Both independent candidates used 17 with different state layouts; reusing 17 would misidentify compatibility. Client and server import the same version; the client health preflight rejects differing server versions. Protocol 16 remains the deployment baseline.
- `scripts/test-live.mjs`: retained Chaos's four-worker test concurrency and optional test-file prefix. Quick Match had no competing edit here. Tests start temporary local servers; no configured environment variables or .env files were changed.
- Added a simultaneous public/private real-socket regression and production-asset assertions for all integrated controls and four menu tiles.

## Lifecycle and concurrency review

- Public waiting leaves remove player/assignment keys immediately and cancel countdown below two. Racing reconnects retain existing reservations; final departure/disposal releases assignment keys and room capacity.
- Match allocation uses Colyseus seat reservations, capacity and locking. Existing tests cover concurrent arrivals, ninth-player overflow, duplicate keys and the 64-room ceiling.
- The added test runs public allocation/countdown/cancel/replay alongside private Chaos map selection/rescue/reconnect, checks schema fields on real clients, and verifies both room registries clean up.
- Client callbacks guard room identity; matchmaking/reconnect use cancellation epochs to discard stale results. The reconnect status interval clears in `finally`. Page-level input/reservation timers are registered once. Colyseus 0.16.22 removes room listeners and schema callbacks on leave (`Room.removeAllListeners`).
- FIFO bounds synchronized spilled hazards at 150. Collision arrays trim with synchronized state; scoring and permanent geometry remain separate. Client spill visual lists track schema length, worker/cart visuals dispose when removed, and spill geometry/material caches are deliberately shared.
- No integration-specific leak or duplicate handler was identified in review and automated lifecycle checks. This is not a browser heap/GPU soak or proof of leak-free Safari operation.

## Physical laptop + iPhone acceptance (required before deployment)

1. Run this candidate separately from the stable game. Confirm both devices display the combined Protocol 18 build; confirm the four-tile menu, private room code/share and Quick Match controls in portrait and landscape.
2. Join Quick Match from both devices. Confirm matching worker counts, material selection and synchronized 15-second public countdown, then three-race Championship. Cancel before start; drop below two and verify countdown resets. Cancel an in-flight search and retry without duplicate attachments.
3. Keep a private Beam room open while other browsers use Quick Match. Verify public workers never enter the private room; public clients cannot change mode/map/length or issue host commands. Add clients to eight; a ninth must enter a different waiting room.
4. Complete Championship with different materials. Check hazards, course connections, standings, fewest-spills/time ranking, frozen official results, staging and Play Again. Stress 150 hazards with eight clients and watch iPhone frame pacing, heat and memory. Verify oldest debris disappears on both devices without removing fixed obstacles or altering scores.
5. Play all three Beam courses, including Excavator alley. Test attached and free-worker knockback, timed machinery, unsupported edges, checkpoints, team rescue, +5-second penalties, protection, results and replay. Use overview and verify the host-only map selector.
6. Reload/interrupt iPhone networking in public waiting, public racing, Beam countdown and active carry. Verify waiting re-entry, racing reservation/reconnect, team identity and recovery state, then regrab. Confirm the remaining client's hazards continue moving.
7. Repeat leave/rejoin/replay cycles and test phone orientation/background/foreground transitions. Confirm no stuck movement or doubled actions. Leave all clients, then create fresh public/private rooms and verify no stale membership/capacity remains.

## Limits and approval gate

- Physical laptop+iPhone testing, mobile Safari GPU/memory/thermal soak, and real external-network latency acceptance remain pending. Automated socket tests are not physical-device acceptance.
- Public assignment and room-limit registries assume a single server process. Multi-process/horizontal scaling requires shared coordination. Match keys are not verified user identities.
- Hazard cap 150 remains an experimental mobile-performance setting; server-only timing does not validate browser performance.
- Existing Beam limitations remain: immediate checkpoint recovery instead of ragdolls, conservative collision boxes, and odd-worker spectating.
- Vite retains a large-JavaScript-chunk warning; this is not a build failure.
- No push, main merge, Render action, live-game action, or configured environment change was performed. No original checkout, source material, feature branch, or feature worktree was altered.
- Keep Protocol 16 live for the competition submission. This candidate is for review and physical acceptance; deployment requires the user's explicit approval after those checks.

## Test results

- Locked dependency install succeeded with pnpm 11.25.0 and Node 24.22.1; lockfile unchanged.
- `pnpm run test:all`: production build passed; **141 tests passed, 0 failed, 0 skipped, 0 cancelled**, duration **448.289 seconds**. Full output: `verification/integration-full-suite.txt`.
- Added coexistence regression: **1 passed, 0 failed/skipped**, duration **4.982 seconds** including runner overhead. Output: `verification/integration-coexistence.txt`. This additional file was added while the full suite was running and therefore run separately; total distinct tests verified is **142**.
- Final production build after menu-text repair and additional checks: passed TypeScript client/server checks and Vite production output. JS 738.16 kB (206.57 kB gzip), CSS 22.26 kB. Output: `verification/integration-final-build.txt`.
- Focused startup recheck against final production assets: **3 passed, 0 failed/skipped**. Includes combined UI controls, exactly four mode tiles, Protocol 18 health response, and launcher port handling. Output: `verification/integration-startup.txt`. These 3 tests are already part of the full suite count.
- Server-only eight-player spill profile at 150 hazards: mean tick **0.179 ms**, p95 **0.311 ms**, p99 **0.424 ms**. Also profiled 75 and 192 hazards. Output: `verification/integration-hazard-profile.json`. This does not measure mobile rendering or memory.
- `git diff --check`: passed.
- Initial restricted execution built successfully but failed to reach its temporary local test server. The verified full run used approved local networking and exited successfully; no game regression was attributed to the restricted-run failure.

## Final disposition

Automated integration is successful. Ready for review and physical acceptance; **not yet ready for unconditional deployment approval**, because physical iPhone performance/latency and gameplay acceptance remain pending. No unresolved automated-test failure or integration-specific correctness bug was found. Stop here and retain Protocol 16 live until the user explicitly approves deployment.

The merge commit is the integration branch tip (`git rev-parse feature/integration-chaos-quickmatch`). A complete-history recovery bundle and exact commit/hash manifest are saved beside this checkout in `integration-recovery-20261030/`. The bundle is verified after creation and can restore both feature tips, stable Protocol 16, and the integrated merge. No remote push was performed.
