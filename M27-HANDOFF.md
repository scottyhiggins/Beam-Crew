# Milestone 27 — Beam Carry expansion handoff

Independent checkout: `Beam-Crew-beam-expansion`  
Branch: `feature/beam-course-expansion`  
Base: `380c834f5dad12dca8553f525ab6e8353e89f1be` (Protocol 21)

## Changes

All three existing course IDs remain unchanged. IDs 3 and 4 add Rooftop Run and Muddy Monday. Rooftop Run uses a scaffolded steel deck, temporary walkway, partial guardrails, visible open edges and crossing lift cages. Muddy Monday uses mud, puddles, shallow bridge approach ramps, a sweeping excavator and crossing loads. The courses deliberately reuse the established start, doorway/turn checkpoints and delivery zone; they are course variants built on the proven carry route, rather than independent route graphs. Machinery timing and platform boundaries distinguish them.

The existing host-only lobby select now includes Random. `beamMap` always holds an actual 0–4 course ID. The new synchronized boolean `beamRandom` records selection intent. Sending `beamMap: -1` enables Random without putting an invalid course ID in state. Only full round starts/rematches select a new course, excluding the previous ID. Checkpoint resets retain the current course. Guests and mid-round selection messages cannot change it.

Lower-right training-yard scenery includes parked equipment, lumber, pallets, a container and fencing. Details use instanced colour batches with shared geometry/materials, stay outside the critical carry route and add no collision boxes. Existing moving-obstacle pushes, wall crushing recovery, penalties and server movement remain intact. Shallow ramp height is presentation only, preserving the established planar collision solver and movement speed. Mud does not change controls or speed.

The course overview camera far plane increases from 100 to 250 so narrow portrait overviews do not clip the whole course. Beam, workers and grip markers receive matching bridge elevation offsets.

## Verification and exact results

- Production build: TypeScript client check, TypeScript server compilation and Vite production build PASS. See `qa/m27/production-build.txt`. Existing >500 kB shared podium/Three bundle warning remains.
- Full serialized regression run: **252 passed, 0 failed, 0 skipped**, including the original suite and the first 25 expansion checks (`qa/m27/full-regression.txt`). This run completed after the Random correction was compiled; no network tests were skipped.
- Expanded full concurrent run: **258 passed, 2 failed, 0 skipped, 260 total** (`qa/m27/full-regression-final.txt`). The two Quick Match tests interfered with other tests sharing global public matchmaking capacity. This is a test-isolation limitation; do not describe this run as entirely green.
- Fresh-server final isolated checks: **60 passed, 0 failed, 0 skipped** (`qa/m27/final-isolated-checks.txt`). Includes both Quick Match tests, all carry-through tests, all expansion unit checks including the added ramp-height case, presentation and production startup. No application Quick Match code was changed.
- New-course real socket matrix: **8 passed, 0 failed** (`qa/m27/new-course-network.txt`): 2/4/6/8 clients on each new course; both grips/release, preserved cosmetics, reconnect identity/end assignment, host transfer and rematch. Also included successfully in the expanded full run.
- Browser matrix: **134 assertions passed**, zero page errors and zero WebGL/Three warnings (`qa/m27/browser-results.json`). Headless Microsoft Edge: two rendered browser players plus SDK players for 4/6/8 counts; all five courses; host/guest synchronization, guest select disabled, both ends carry/release, simultaneous teams, replay, Random and mobile host transfer. Full human/browser navigation of every obstacle was not performed.
- Final screenshot refresh after ramp and camera changes: **52 assertions passed**, zero page errors (`qa/m27/screenshot-checks.json`). Desktop 1365×900, touch portrait 390×844, landscape 844×390 and narrow 319×700; all five courses; visible action controls and no page-width overflow.
- Supported delivery on all five courses is covered by deterministic movement tests using both workers and real collision/hazard timing. Fall recovery, checkpoint recovery, scoring order and multiple-team lifecycle are tested at 2/4/6/8 players. Network tests cover reconnect/host transfer; existing suite covers Party Night scores and podiums. Browser podium rendering for each new course was not separately driven to completion.
- Physical iPhone testing: **not performed**. Viewport emulation is not device performance validation.

Across the runs, all 261 current test cases have a passing result. The full concurrent run's two failures are retained above and in raw evidence rather than hidden.

## Screenshots

- Rooftop Run: `qa/m27/course-3-desktop.png`
- Muddy Monday: `qa/m27/course-4-desktop.png`
- Improved original yard: `qa/m27/course-0-desktop.png`
- All five courses also have `-portrait.png`, `-landscape.png` and `-319px.png` screenshots.

## Performance and limits

`qa/m27/performance.json` records headless desktop Edge samples at an emulated 390×844/DPR 2 viewport. Overview median draw calls: training 131, rooftop 133, muddy 153. Frame callback medians were about 6.1 ms in this environment; these synthetic measurements are not evidence of phone frame rates. One selected decoration group is visible; shared instanced geometry avoids individual prop draw calls. No shadows or network streams were added; the only schema addition is one room boolean. Existing team snapshots and hazard clock are reused.

The new courses share the existing checkpoint/delivery layout. Ramp height is cosmetic and does not add vertical physics. Decorative guardrails do not add collision; authoritative platform bounds remain the fall rule. Older hidden course geometry remains allocated as in the existing renderer. Phone GPU/thermal/battery behavior and real touch ergonomics still need physical-device testing. The existing production build label remains M22/Protocol 21; #28 should set its final integrated build label and protocol policy for the combined schema.

## Integration for #28

Use the exact commit from the adjacent `Beam-Crew-m27-checkpoint.json` / final handoff. Fetch the recovery bundle into #28, then cherry-pick that commit. Do not merge or deploy from this checkout.

Resolve any simultaneous edits in `client/main.ts`, `server/room.ts`, `server/state.ts`, and `shared/beam-chaos.ts` while retaining #24/#25/#26 menu, trivia and crane work. Add `client/beam-jobsite.ts` and both `m27-beam-expansion` test files. Preserve original IDs 0/1/2; append IDs 3/4. Keep `beamRandom` in both the schema declaration and `defineTypes`; retain the -1 selection-message handling and the full-restart-only course resolution. Keep deterministic courseLoads in both the server world and moving-load renderer. Preserve the portrait overview far-plane fix.

Party Night currently launches valid ID 2 and needs no adapter, scoring or roster change. Existing Party tests passed. If #28 adds a Party course chooser, use the same 0–4 IDs and `beamRandom` flag; explicitly set `beamRandom=false` when Party intends to force its fixed ID 2. Do not copy the -1 UI sentinel into `beamMap`. Keep room identity and cosmetics on the existing Player objects.

Recommended integration verification: clean build, full suite with files serialized against a fresh dedicated server, the eight new network cases, browser matrix, and physical phones. Avoid parallel public matchmaking tests against one server.

## Recovery

The adjacent recovery bundle contains the committed branch and its full reachable history. The checkpoint manifest records its SHA-256 and commit. Verification imports it into a fresh temporary bare repository, runs fsck and confirms its branch head matches the delivered commit. The verification directory is not part of the commit.

Nothing was pushed, merged or deployed, and no other checkout or synced reference file was edited. Dedicated ports used: 2787–2790 only.
