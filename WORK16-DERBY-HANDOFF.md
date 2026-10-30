# Work #16 — Crane Challenge: Tower Rush + Wrecking Ball Derby

## State and recovery
This delivery continues the SAME isolated `Beam-Crew-crane-challenge` checkout and `feature/crane-challenge` branch directly from Tower Rush commit `01abc3d509b1a91a4ea7aa1c3a01c2cee4d9c0d8`.

The completed Tower Rush checkpoint is preserved by tags `work16-tower-rush-3d` and `work16-pre-derby`. Its original `../Beam-Crew-crane-challenge-3d-recovery.bundle` was verified and left intact. `WORK16-CRANE-HANDOFF.md` describes that historical Tower Rush checkpoint, including earlier LAN findings; this document describes the current two-game delivery.

No #15 checkout, main branch, Render service, production environment or external deployment was changed. No merge or push was performed.

## Completed modes
The Crane Challenge entry now opens a two-game selection screen. Both modes use the existing Three.js crane/camera/site, three controls, private-room lookup, server timer, leaderboard, reconnect reservation, host transfer and replay. The host may switch games only in the lobby; every client follows the server-selected mode. Late joins are rejected during play/results.

Tower Rush: unchanged `shared/crane.ts` (verified against `01abc3d`). First stable supported tower to 100 ft wins immediately; otherwise highest at exactly 60 seconds wins. Existing Tower Rush tests remain passing, including 100-ft reachability, supported-only scoring and exact timeout. Rendering changes for Derby are conditional; Tower Rush keeps its stacking pad, containers and adaptive camera.

Derby: 2–8 players, free-for-all, exactly 60 seconds, highest demolition points wins. Each player receives/renders ONLY their own arena and target damage. The shared leaderboard contains scores, not other arenas. The result includes synchronized winner, reason, timer and final points. Ties use lobby join order. Derby does not stop at 100 points.

## Derby controls and targets
- A/D or arrows: move trolley left/right and build swing momentum.
- Space / ACTION / POWER SWING: pump the ball in the movement direction (or current swing direction when stationary). There is a server-owned 0.7-second recharge; repeated packets cannot bypass it.
- Touch: LEFT / POWER SWING / RIGHT.

Inside the striped demolition pad there are **31 intended destructible targets**: 12 wall panels, 9 scaffold bays, 5 pallet stacks and 5 barriers. Every one can be destroyed. A deterministic digital-control sweep destroys all 31 in one round in the automated test. Maximum available points: **1205**. Objects do not respawn during a round; clearing everything does not shorten the 60-second round.

Points: pallets 20; wall panels 30/40/50 by row; barriers 35; scaffold bays 50. Harder impacts do more damage. Yellow bars show damaged targets. Points are awarded ONLY once when server-owned HP reaches zero. Merely overlapping or continually rubbing a target cannot farm points/damage: a new scoring impact requires sufficient speed and separation from the previous contact. Clients send movement/action only, never points or destruction claims.

The crane, ground, perimeter fence and distant/outside scenery are essential/decorative and are NOT destructible or scoreable. The game instructions define this boundary; this delivery does not claim every mesh can be destroyed.

## Physics and rendering limits
The ball reuses Tower Rush's deterministic trolley/pendulum stepping. Derby adds bounded angular pumping, a swing limit, swept sphere-versus-box contact checks, target HP and impact momentum loss. Graphics are full 3D; gameplay remains in a single vertical plane with fixed depth. This is an arcade model, not a full rigid-body engine. Scaffolds and other detailed meshes use coarse solid collision proxies. Target modules are independently destroyed; they do not simulate structural support collapse or target-to-target physics, so upper modules can remain in place after a lower module is removed. This is a known approximation, not a fully simulated building.

Visible feedback: faceted metal ball, tilted cable, impact ring, dust, chunks, HP bars and point popups. Debris is visual only and cannot score or obstruct the ball. Server chunks are capped at **72**, expire after roughly **1.6–2.64 seconds**, are culled outside yard bounds and are cleared on results/replay. Chunks use one instanced draw; client dust is capped at 18 particles. Replay restores all target meshes from authoritative flags. Reduced-motion preference removes popup movement.

Physical iPhone frame rate, sustained mobile performance and LAN access remain unverified. The full own-arena snapshot is sent at 30 Hz, so bandwidth under sustained eight-player use should be profiled. The existing Three.js bundle warning (>500 kB) remains. Human gameplay balance is not established by the automated all-targets control sequence.

## Verification and exact test accounting
Production build and both TypeScript checks passed. No new dependencies or heavyweight physics engine were added.

Focused tests: **24 passed / 24**, comprising 14 preserved Tower Rush tests plus 10 Derby tests. Derby coverage includes all-target reachability/destruction, deterministic swing/boost cooldown, idle overlap, swept collision, one-time points, separation before repeated damage, debris cap/expiry, 2–8-player exact timer/private results, host-only selection, replay and switching back to Tower Rush.

Full suite with real network tests enabled:
```
$env:TEST_URL='http://127.0.0.1:2616'
node --test --test-reporter=spec --test-reporter-destination=derby-regression-results.txt build/tests/*.test.js
```
Result: **135 tests; 134 passed; 1 failed; 0 skipped**. The sole failure was the unchanged Beam Carry live delivery test (`tests/beam-multiplayer.test.ts`) timing out while waiting for delivery under concurrent test load. It was rerun in isolation and **passed 1/1** in about 41.7 seconds. The original full-suite failure is retained in `derby-regression-results.txt`; this is NOT reported as a single clean 135/135 run. No Beam code or test was changed to hide the timeout. Rerun evidence is recorded in `derby-beam-rerun.txt`.

The new real-network Derby tests BOTH passed inside the full run:
- Two players: real input/boost produces destruction, opponent arena stays intact, scores above 100 do not end early, and both receive identical final winner and points, elapsed=60 and clean debris.
- Eight players: private progress, reconnect reservation, host transfer, late-join rejection, replacement join, replay restoration and switching Derby → Tower Rush → Derby with Tower Rush's 100-ft target preserved.

Browser smoke: two browser clients joined a Derby room and played. Host destruction/points were visible while the idle guest's score remained zero. Chooser and gameplay screenshots were saved. Browser control briefly lost old-tab access after the user's resume message; fresh tabs restored testing. Portrait 390x844 and landscape 844x390 were checked in the existing explicit iframe harness. Portrait touch buttons successfully produced server-confirmed destruction and points. Outer QA-page scrolling was needed because the 844px test iframe exceeded the desktop window; this is not phone-page scrolling. No physical iPhone testing was performed or claimed.

Screenshots:
- `crane-challenge-chooser.png`
- `wrecking-ball-derby-preview.png`
- `derby-portrait-controls.png`
- `derby-landscape-controls.png`

## Play locally
The #16 local playtest server is left running on **0.0.0.0:2616**, serving the built client and multiplayer server on the same port. It is a local process, not a production deployment. PID/log paths remain `crane-playtest.pid`, `crane-playtest.stdout.log`, `crane-playtest.stderr.log`. Do not kill unrelated Node processes.

Open http://localhost:2616/crane.html (or select Crane Challenge from the main game).
1. Select WRECKING BALL DERBY.
2. Enter a name and choose CREATE PRIVATE ROOM.
3. On a second browser tab/device, select Derby, enter another name and the six-character code, then JOIN. The room's server mode is authoritative even if a guest entered through the other game.
4. Host clicks START WRECKING BALL DERBY.
5. Move left/right and use POWER SWING to smash the colored targets inside the striped pad.
6. At 60 seconds results show winner/final points. Host can REPLAY or OPEN LOBBY and switch games.

To build: `pnpm build`. To run from this checkout in normal PowerShell (after checking port 2616 is free):
```
$env:PORT='2616'
$env:NODE_ENV='production'
& 'C:\Users\higgi\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' build/server/index.js
```
For live source editing use NODE_ENV=development instead; HMR uses #16 port 2617. No additional fixed ports are introduced.

iPhone/LAN remains unverified and should wait until the user can test. The previously observed address 172.20.10.3 was on an iPhone hotspot and may now be stale. Get the Preferred current Wi-Fi IPv4 address:
```
Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi' | Select-Object IPAddress,AddressState
```
Then open `http://<that-IP>:2616/lan.html` first and `/crane.html` after the connection checks pass. The client uses `location.host`, not a hardcoded localhost WebSocket URL. Retain the prior firewall findings in `WORK16-CRANE-HANDOFF.md`; the explicit non-loopback inbound block requires owner/admin review and has NOT been disabled or bypassed. No firewall rules were changed in this work.

## Work #15 integration
This Derby commit depends on Tower Rush checkpoint `01abc3d`. Bring that checkpoint into a separate integration checkout first if absent, then review/cherry-pick the Derby commit. Do not replace #15 files wholesale or modify its working checkout.

New files: `shared/derby.ts`, `client/derby-visual.ts`, `tests/derby.test.ts`, `tests/derby-network.test.ts`. Updated: `server/crane-room.ts` (mode selection/Derby dispatch/private snapshot), `client/crane.ts` (chooser/mode-specific UI), `client/crane-world.ts` (conditional visual layer using the same renderer/camera/crane), `client/crane.css`, and the main Crane tile copy. `shared/crane.ts` is unchanged. Existing server room registration, room-code route, multipage Vite entries and LAN diagnostic remain from Tower Rush. No crew-schema or shared protocol-label change is made here; retain the newer integration build/protocol metadata from #10/#14/#15.

Crane snapshot now includes mode and an own-player `derby` object only in Derby. Client and server must be integrated together. Tower-only clients from the old checkpoint are not the intended Derby client. Keep the 100-ft finish test conditional on mode=tower and the 60-second timer common to both. Run the merged build, full regression and real 2/8-player tests. Do not suppress the recorded Beam timing flake; investigate it independently if it recurs.

Final recovery tag: `work16-crane-derby`. Bundle: `../Beam-Crew-crane-challenge-derby-recovery.bundle`, containing the completed branch plus the Tower Rush recovery refs. Previous recovery artifacts remain untouched.

