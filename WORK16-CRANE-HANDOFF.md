# Work #16 — Tower Rush 3D overhaul

## Delivery and isolation
Branch: `feature/crane-challenge`, based directly on `46fee89ef7807523615be01d93f03b7e5c4c98a6` in the existing isolated `Beam-Crew-crane-challenge` checkout. No #15 checkout changes, main merge, push, Render deployment or production environment changes.

Tower Rush has a full perspective Three.js jobsite: lattice tower crane, trolley, suspension arm, tilted cable and hook, ribbed containers, striped pad, pickup bay, scaffolding, pallets, barriers, perimeter fence, skyline, hemisphere/sun lighting and shadows. The lobby uses a wide establishing view; play moves closer and automatically reframes as the active load/stack rises. Only the local arena is transmitted/rendered; the shared leaderboard contains heights only. Derby remains deferred.

## Rules and physics
Every round ALWAYS uses: **FIRST TO 100 FT OR HIGHEST AFTER 60 SECONDS**. There is no target selector or target-setting message. A supported settled 100-ft tower ends the round for all clients on that server tick. Otherwise the round ends at tick 1800 (60 seconds at 30 Hz). Scheduler delays catch up fixed steps rather than extending the simulation. Same-tick target arrivals use lobby join order; equal heights at timeout also use lobby join order. Server winner, reason, elapsed time and heights freeze in results.

Trolley acceleration drives a damped nonlinear pendulum. Released loads inherit pendulum position, linear velocity and angular motion. Contact/support chains and stack centre of mass govern stability, slide and collapse. Each valid supported container adds exactly 10 ft. Held, falling, unsupported and yard-floor containers do not score. A digital left/right/action simulation builds 100 ft in about 53.1 seconds. This validates reachability, not human difficulty or fun.

Honest approximations: visuals are full 3D, but physical gameplay is constrained to a single vertical travel plane, with fixed container depth. No depth control or crane slewing is needed. Hoisting from the pickup bay is automatic and instantaneous. This is a lightweight contact/support and torque model, not a full rigid-body engine: it does not solve continuous oriented-box manifolds, friction cones or all coupled angular impulses. Some interpenetration during tumbling/pile collisions remains possible. Contact damping helps loads settle; there is no positional x snapping, magnetic attachment or welded stack. Bodies are retained while falling and culled beyond the yard bounds, with a 60-body cap. Shadows use a 1024 map; pixel ratio caps at 1.5. HUD updates skip unchanged values. Human balancing and physical iPhone performance remain unverified. Three.js still triggers Vite's >500-kB chunk warning.

## Verification
- Production build and both TypeScript checks pass. Three page entries: main game, crane game, LAN diagnostic.
- Full existing + new regression suite with `TEST_URL=http://127.0.0.1:2616`: **121 passed / 121, no skips or failures**. Includes all baseline real network tests; run took about 440 seconds. Evidence: `crane-test-results.txt`.
- Final focused Tower Rush suite after damping/scheduler polish and two added tests: **14 passed / 14**. Evidence: `crane-physics-results.txt`. Covers lag/oscillation/determinism, release trajectory, off-centre landing, falling visibility, unsupported scoring, support removal/collapse, centre-of-mass tipping, score increments, fixed target, ties, exact tick-1800 timeout, scheduler jitter, synchronized private snapshots, replay and a playable 100-ft control sequence. Full regression was not needlessly repeated after isolated crane-only polish.
- Final eight-real-client test passes for join/start, pickup, late join rejection, reconnect, host transfer, fixed target and replay: `node scripts/test-crane-live.mjs`.
- Final two-real-client complete timeout test passes with identical server results, `elapsed=60`, same winner and final heights; measured about 59.955 seconds after observing the first playing snapshot: `node scripts/test-crane-results-live.mjs`.
- Two actual browser players joined and played. Tilted cable and moving suspended load visually inspected. Final screenshot: `tower-rush-3d-preview.png`.
- Actual 390x844 portrait and 844x390 landscape iframe viewports inspected using `public/crane-viewport-check.html`. Three touch controls stay inside the frame (portrait bottom 812/844, landscape bottom 369/390). The browser-level resize override did not affect the tab, so the explicit iframe harness was used. No physical iPhone test or mobile performance claim.
- LAN diagnostic page locally passed HTTP health, WebSocket room creation and authoritative snapshot reception. This is NOT evidence of phone reachability.

## Play now
The #16 background **development** server is left running on HTTP/WebSocket port **2616**, bound to **0.0.0.0**, with HMR on **2617**. The PID is recorded in ignored `crane-playtest.pid`. Logs are `crane-playtest.stdout.log` / `.stderr.log`. Do not stop unrelated Node processes.

Laptop: http://localhost:2616/crane.html

1. Open that URL in two tabs, or one tab and a second device.
2. Enter a name, choose CREATE PRIVATE ROOM, and share the six-character code.
3. Second player enters another name and the room code, then JOIN.
4. Host clicks START TOWER RUSH. Both conditions are already active.
5. A/D or arrows move; Space picks up/drops. Phone uses LEFT / PICK UP-DROP / RIGHT.
6. Collect at the yellow bay. Move over the striped stacking pad, watch the swing and footprint marker, and release. Allow the load to settle for height credit.
7. Results show winner/final heights; host can REPLAY or OPEN LOBBY.

To restart manually from this checkout in normal Windows PowerShell:
```
$env:PORT='2616'
$env:NODE_ENV='development'
& 'C:\Users\higgi\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' build/server/index.js
```
If port 2616 is already in use, the existing #16 server may still be running. Do not launch a second copy or kill arbitrary processes. For a clean installation/build, run `pnpm install` then `pnpm build` first.

## iPhone LAN diagnosis and later test
The user clarified that physical phone testing has NOT happened yet and will wait for Wi-Fi. Earlier Wi-Fi IP `192.168.1.166` became stale during this session. The latest observed connection is Wi-Fi on **Scotty’s iPhone 4** hotspot, laptop **172.20.10.3**, network profile **Public**. Current candidate URLs:
- Game: http://172.20.10.3:2616/crane.html
- Connection check: http://172.20.10.3:2616/lan.html
These can change on the next network. Phone-to-laptop access on a hotspot depends on that device/network and is unverified.

When both devices are on the same trusted Wi-Fi, get the current laptop address with:
```
Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi' | Select-Object IPAddress,AddressState
```
Use the Preferred Wi-Fi address, not localhost, 127.0.0.1, a VPN address or a stale address. Open `http://<that-IP>:2616/lan.html` in Safari first. If it cannot load, the failure is before the game client (address, route, firewall or access-point isolation). If it loads, it separately checks HTTP and real multiplayer; report the exact failed stage. When all checks pass, open `/crane.html` and join the laptop’s room.

Code/network checks: Express/Colyseus listens on 0.0.0.0:2616; Vite runs as middleware on that same server and explicitly has host 0.0.0.0. The gameplay client uses `location.host` for HTTP and ws/wss, so a phone does not try localhost. HMR uses a separate 2617 port with the requesting page hostname; HMR is not required for gameplay. Client/API/WebSocket are same-origin, so cross-origin CORS permission is not needed.

Read-only Windows Firewall findings (no rules were altered):
- All firewall profiles are enabled with effective default inbound Block.
- Node TCP/UDP allow rules apply to Public only. At the first check Wi-Fi was Private; at the latest check it is Public.
- Existing `Beam Crew LAN test` rule is Private and actually allows TCP **2571**, not 2616.
- Enabled `codex_sandbox_offline_block_inbound` is an explicit Any-profile, Any-program, Any-port inbound Block covering non-loopback addresses. An ordinary allow rule cannot override an explicit block. This is a concrete LAN restriction; it must not be silently disabled or bypassed.

If the later phone test is blocked, open `wf.msc` (Windows Defender Firewall with Advanced Security), choose Inbound Rules and have the owner/administrator review that named restriction and whether this execution environment is permitted to accept LAN traffic. Do not globally disable the firewall or sandbox rule. After an administrator provides an appropriately permitted environment/policy, any needed #16-specific allow should be TCP local port 2616, RemoteAddress LocalSubnet, and only the applicable trusted-network profile. 2617 is optional for live reload. Existing rules on unrelated ports do not authorize 2616. Re-test `/lan.html`; do not claim success solely from loopback or same-laptop connections.

## Work #15 integration
Review/cherry-pick the overhaul commit into a separate integration checkout only. Primary files: `client/crane-world.ts`, `client/crane.ts`, `client/crane.css`, `shared/crane.ts`, `server/crane-room.ts`, `tests/crane.test.ts`, and live-test scripts. Include `lan.html`, `client/crane-lan.ts` and the Vite multipage input if retaining the diagnostic. The public viewport harness is QA-only. Retain the initial #16 server room registration/API lookup route and menu tile from the base #16 commit. Reconcile Vite config with newer integration builds; do not replace newer menus/server/schema wholesale. This branch retains protocol-16 base labels and does not change the existing `crew` schema. Preserve #10/#14/#15 protocol/build metadata. Crane snapshots gained v/swing/omega/pivotY, winner/reason and fixed target semantics: deploy client/server together in any future authorized release. No deployment is performed here.

Recovery: tag `work16-tower-rush-3d`, bundle `../Beam-Crew-crane-challenge-3d-recovery.bundle`. Prior tag/bundle retained.
