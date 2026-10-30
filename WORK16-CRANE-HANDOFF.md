# Work #16 — Tower Rush handoff

## Scope
Tower Rush is implemented. Wrecking Ball Derby is deferred and explicitly labelled as planned in the game. There is no playable Derby selector. This is a Tower Rush focused delivery, not completion of both requested modes.

## Isolation and base
Checkout: Beam-Crew-crane-challenge, branch feature/crane-challenge.
Base: 94122866c5334f2220aab8c0e44aca07c1b64a08 (verified protocol 16 fallback).
Requested cffe2dcac37adbf935771ae28b68119a01442691 was absent from the root repository, beam-chaos checkout and local integration recovery bundle. No newer commit was substituted.
Local HTTP/WebSocket port 2616, development HMR port 2617.
No main merge, push, deployment or production setting changes were performed.

## Play locally (PowerShell, from this checkout)
```
pnpm install
pnpm build
$env:PORT='2616'
$env:NODE_ENV='production'
node build/server/index.js
```
Open http://localhost:2616 and select Crane Challenge, or open http://localhost:2616/crane.html directly. Create a room and share the six-character code. Join from a second browser tab/device. Requires 2–8 connected players to start. Devices must reach this computer on the same network; use its LAN address on phones.

A/D or arrows move; Space picks up/drops. Touch has LEFT / PICK UP-DROP / RIGHT. Move over the yellow left-hand bay to collect. Carry to the central grey pad and release; wait for the load to settle before its height counts. Each supported container is 10 ft. Higher support tolerances narrow. Host can select 50/100/150 ft or timer only, start/replay and reopen the lobby. Ties use lobby join order. Reconnection reserves a player for 30 seconds; host transfers immediately on disconnect.

## Validation
- Production build passes, including both HTML entry points.
- Full baseline regression suite plus new tests: 113 tests, 96 passed, 17 skipped, 0 failed. Skipped tests are existing opt-in live/network tests and were not claimed as passing.
- Four new automated tests cover pickup restrictions, airborne/held exclusion, stable scoring increments, stacking, tipping/falling, movement clamp, ties, fresh arena, target wins, timer freeze and server ticks for 2 through 8 players.
- Real WebSocket eight-client test passes: room join/start, late join rejection, pickup, reconnect, host transfer, target selection and replay. Run `node scripts/verify-crane.mjs` with port 2616 free after build. This starts and stops its own server. `node scripts/test-crane-live.mjs` tests an already running server.
- Browser smoke: two browser players joined and started; host transfer and reload reconnect observed. Portrait viewport 390x844 inspected; three controls fit without horizontal overflow after layout correction.
- Landscape viewport override did not take effect in the browser tool; landscape is NOT verified. No physical iPhone testing. No sustained mobile performance or human gameplay balance testing.

## Physics and performance limits
This is a deterministic fixed-step 2D arcade support/torque model rendered as Three.js boxes, not a full rigid-body solver. It allows slipping, tipping and falling without magnetic locks, but does not model full coupled stack mass, inter-body angular collision impulses or realistic pile interactions. It needs human balance testing before release. Scores require a settled chain to the ground, never a suspended load. Each arena is capped at 60 bodies, with offscreen bodies culled; pixel ratio caps at 1.5. Three.js bundle still triggers Vite's >500 kB chunk warning. Full own-arena snapshots are sent at 30 Hz, so bandwidth should be profiled before production rollout.

## Work #15 integration
Merge/cherry-pick this branch into an integration checkout only. Preserve newer protocol/build labels from #10/#14; this branch intentionally retains fallback labels. The new `crane` Colyseus room is independent of the existing `crew` schema. Integrate `server/crane-room.ts`, `shared/crane.ts`, `client/crane.ts`, `crane.html`, tests and scripts. Reconcile the small registrations/routes in `server/index.ts`, Crane tile change in `client/main.ts`, and multipage `vite.config.ts` with other mode/menu/build changes. Do not replace newer menu or server files wholesale. Existing five-character crew codes and six-character crane codes use different lookup routes. Add unified mode discovery/deep linking if required by final integration. Run production build, full suite and live checks in the merged branch. Derby and landscape/mobile balance QA remain outstanding.

Recovery bundle is `../Beam-Crew-crane-challenge-recovery.bundle`; tag `work16-tower-rush` identifies the delivery.
