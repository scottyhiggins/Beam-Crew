# BREAK TIME — Work 15 final integration release candidate

Date: October 30, 2026 (America/Denver).
Disposition: **READY FOR PHYSICAL QA**.
Branch: feature/final-integration, local independent checkout Beam-Crew-final-integration.
Protocol: **19**, imported from shared/version.ts by server, main client and Trivia client.
Final release commit: recorded in the sibling Beam-Crew-final-integration-release.json manifest and completion message. That external manifest avoids a self-referential commit hash in this file.

## Verified inputs and isolation

| Milestone | Exact integrated commit |
| --- | --- |
| #10 — Chaos + Quick Match + QA | cffe2dcac37adbf935771ae28b68119a01442691 |
| #11 — Toolbox Trivia | 10ffe3e7ae9f83a4ef8e8350f38b801b989b75ca |
| #14 — Worker Store + multiplayer cosmetics | fc4dcac3597047b91e1ce6eb0bb2e1c92932eea4 |

All three are ancestors of the candidate. Read M10 integration/QA reports, M11 handoff/validation and WORK14-HANDOFF.md. Created independent Git storage using clone --no-hardlinks from M10, switched to feature/final-integration at the exact base, imported exact local feature objects and made two true merges. Sources/checkouts were read only. Work #16 was neither edited, integrated nor waited on. Crane Challenge stays disabled / Coming Soon.

Before merging, preserved complete history and all three source tips in ../Beam-Crew-final-integration-recovery.bundle. git bundle verify passed. SHA256: 02B1FF85148F2A637FAA9A39E62FB78AF1056F54063B88D1CF7730686A855D8B. Recovery refs: recovery/work15-base, recovery/work15-trivia, recovery/work15-cosmetics. A final release bundle is recorded in the sibling release manifest.

No main change, remote push, Render operation, deployment or production environment-variable change. Origin points to https://github.com/scottyhiggins/Beam-Crew.git; this branch remains local. Production Protocol 16 / 9412286 was left untouched.

## Conflict resolution and preserved behavior

- Main menu combines all five tiles: Wheelbarrow, Beam Carry, playable Toolbox Trivia, free Worker Store and Coming Soon Crane Challenge. Uses BREAK TIME / WORK HARD. PLAY HARD. branding.
- Main client retains M10 Quick Match cancellation epochs, reconnect, public replay, Beam course selector, overview, rescue and stale-action resets. Adds only Trivia navigation, Worker Store initialization, sanitized remote appearance rendering and cosmetic options at private join/create and both public joinOrCreate paths. Combined attach sends saved appearance on reconnect. Approved worker/store implementation is unchanged from M14.
- Server index registers crew, wheel_public and trivia rooms. Independent room-code namespaces and both lookup endpoints coexist; existing health/static behavior retained.
- Server room retains M10 public host-command guards, Chaos physics/checkpoints/recovery and bounded spills. Adds allowlisted cosmetic validation at join and sender-scoped cosmetics messages. Shared schema is the union of cosmetic, public-match and Chaos state fields.
- CSS preserves both branches and the 319px Championship fix. Browser QA found Beam course controls overlapping status at 319px; added separate portrait grid rows, then rechecked production assets. Worker Store styles remain intact.
- Protocol 19 is newer than the incompatible 17/18 feature layouts. Both clients preflight health/version; main and Trivia were browser-tested rejecting a local fixture reporting Protocol 16. Release server and both client pages must ship together.
- Startup test now expects five tiles and the store control; inherited integration test now explicitly expects Protocol 19. No gameplay assertion was removed. Added real-socket Quick Match cosmetic cancellation/countdown/reconnect/fresh-replay coverage.
- Source comparisons confirm M10 public-room logic, Beam session/action policy and Chaos simulation are unchanged; M14 worker models, store and validator are unchanged.

## Validation

Final full automated suite: **176 tests passed, zero failures, zero skipped, zero cancelled**, 446.69 seconds. `pnpm test:all` exited 0 and included the production build. This final run includes every compiled test and the new public-cosmetics integration test. Evidence: verification/work15-full-suite.txt.

Build: TypeScript client/server and Vite two-entry production output passed. Latest build transcript: verification/work15-final-build.txt; the final full-suite log also includes a build. Existing >500kB main JavaScript chunk advisory remains (about 615kB main JS before gzip); no build errors. Dependencies installed from locked versions; lockfile and dependency declarations unchanged.

Initial full run: 175 tests, 174 passed, one failed, zero skipped; 443.27 seconds. Failure was the inherited public/private integration test hardcoding Protocol 18; it stopped at 19 !== 18 before exercising its lifecycle. Updated expectation to 19, reran that coexistence test successfully and reran the entire suite. Retained initial evidence as verification/work15-initial-full-suite.txt. Do not present that initial run as green.

Final-build focused run: 37 passed, zero failures/cancelled/skipped; 119.70 seconds. Covers Trivia unit/network/privacy/roles/scoring/podium/replay, cosmetics, startup, public cosmetic integration and Beam solo replay/stale spectator-action policies. These overlap the full suite and are not added to its count.

Separate new public-cosmetics test: one passed, zero failed/skipped, 15.66 seconds; also included in the final full suite. Corrected public/private coexistence test: passed, verification/work15-coexistence.txt. git diff --check passed.

Automated coverage includes complete 3/5/10-race Championship series with real clients, reconnects, frozen results and replay; public queue/capacity/countdown/cancel/reconnect/replay; all three Chaos courses, excavator/moving obstacles, falls/checkpoints/recovery; paired Beam Carry and 2/4/6/8 workers; solo replay rejection and stale spectator actions; Trivia roles/scoring/timeouts/podium/replay/host transfer; cosmetic sanitization/remote synchronization/reconnect/new rounds. These are scripted server/real-WebSocket tests, not physical playtests.

Browser smoke: two in-app Chromium clients against local production assets. Main menu/store saving; distinct remote workers in Championship and Beam/Chaos; private start, course selection, Excavator Alley/overview, refresh reconnect and host transfer; public waiting/cancel/retry/countdown-to-race; Trivia private roles, correct answer awarding 1000 points, role swap, refresh, reset/restart and transfer; no warnings/errors in captured primary browser logs. Full browser-driven course completion was not performed; complete gameplay sequences are covered by automated tests.

Responsive browser checks: 319x740 (Championship HUD rectangles within viewport, no overlap and scrollWidth=319; Beam overlap fixed/rechecked), 844x390 Beam layout. Pointer remained desktop; no touch, Safari or physical iPhone claim. Screenshots and details: verification/work15-browser-smoke.md. Physical-device testing: **not performed**.

## Physical laptop + iPhone QA instructions

1. Use only this isolated checkout. The preview server may already be running at http://localhost:2615. Verify /health says Protocol 19 and repository ends in Beam-Crew-final-integration. If stopped, double-click Start-Final-Integration.cmd (requires installed Node/pnpm). It checks port availability and refuses to replace an existing listener, builds, then runs on 2615. Close only this candidate server with Ctrl+C when finished; do not stop another Work session.
2. Laptop: http://localhost:2615. iPhone on the same Wi-Fi: http://<laptop-WiFi-IP>:2615. Check matching Protocol 19 on both devices. Do not use the production Render URL to test this candidate. If local Wi-Fi/firewall prevents access, record the limitation; do not change production settings.
3. Save different hat/vest/expression looks on each device. Create/join a private room. Confirm the other device sees the right worker in Wheelbarrow and Beam Carry; reload/reconnect, change rounds, leave/rejoin and verify saved looks persist.
4. Run a three-race Championship end to end, with different loads. Check spills/time standings, inter-race countdown/staging, final results and replay. Sample 5/10-race lengths. Check narrow portrait HUD, landscape, joystick, ACTION, orientation, background/foreground and no stuck input.
5. Quick Match: queue alone, cancel, retry with both devices, check 15-second public countdown; leave below two and verify reset. Play series/replay. Interrupt and restore networking while waiting and racing. Keep a separate private room open to confirm separation.
6. Beam Carry: play all three courses, including Excavator Alley. Check moving machinery, falls, checkpoint recovery, +5-second rescue, grips, overview, finish and replay. Leave a partner; lone worker must not create a fresh team by replay. Spectators/disconnected-team workers must not retain stale RELEASE/ACTION controls. Test host departure and reconnect.
7. Toolbox Trivia: from menu create a five-question round, join on other device. Check private reader/selector roles, role swaps, answer lock, 1000-point correct answers, timeout, podium and replay. Reload during a question and verify role/score; leave host and verify transfer. Try 4/6/8 workers using extra browsers when available.
8. Repeat several leave/rejoin/replay cycles. Record iPhone model/iOS/Safari, laptop/browser, network, orientation, failures, frame pacing, heat and memory symptoms. Physical acceptance is still required before any deployment decision.

## Remaining risks and disposition

No known unresolved merge conflict or missing requested feature. Crane Challenge is intentionally Coming Soon. No deployment approval is implied by readiness for physical QA.

Physical Safari rendering, touch controls, real network interruptions/latency, GPU/memory/thermal soak and eight-client mobile performance remain unverified. The 150-spill cap is inherited from M10 and still needs mobile performance acceptance. Public matchmaking assumes one server process; horizontal scaling needs shared coordination. Rooms/results/reconnect reservations are in memory and do not survive a server restart. Existing Beam constraints include immediate checkpoint recovery and odd-worker spectating. Trivia pairs follow join order, allow no mid-round substitutes and use the documented fixed question bank. The large JavaScript chunk advisory remains.
