# WORK A — Beam Carry / Construction Chaos

## Isolation and checkpoints

Independent clone: `C:\Users\higgi\.codex\.chatgpt-projects\g-p-6ac291cf8ecc81919bbc636308fbf05d\beam-chaos`.
Branch: `feature/beam-chaos`. Base: `94122866c5334f2220aab8c0e44aca07c1b64a08` (Protocol 16).
The original checkout was inspected before cloning; its existing untracked work was left alone.
This clone was made from the verified Protocol 16 bundle. Its origin is that local bundle, not an automatic deployment remote.

Recoverable commits:

- `5ea362e`: authoritative hazard collision, team recovery and initial tests.
- `346c595`: courses, excavator, host selection, checkpoints, preview UI and multiplayer coverage.
- `ab417bd`: reconnect collision correction, boundary protection and final regression cases.
- The final documentation commit is available through `git rev-parse HEAD`.

Complete-history recovery bundles are kept in `verification/recovery/`, excluded only through this clone's local Git exclude file. `beam-chaos-stages.bundle` preserves the three development commits above; `beam-chaos-final.bundle` preserves the final feature branch. Each is checked with `git bundle verify`. Restore into another independent directory with `git clone --branch feature/beam-chaos <bundle-path> <new-directory>`.

No pushes, merges, deployments, environment changes, Quick Match work, or edits to the original checkout or another worktree were performed. Explicit approval is required before integration or deployment. The user is handling Handshake submission separately using stable Protocol 16.

## Playable changes

- Three host-selected courses: Crew training; Skyway haul with an elevated dogleg around a parked load; Excavator alley with a narrower crossing and sweeping machinery. They share the doorway, coordinated turn and delivery yard, with different obstacle/platform arrangements.
- The server advances hazards in substeps of at most 1/120 second. Minimum-separation box contacts push the beam and attached workers as one assembly; detached workers also receive authoritative contact resolution.
- The excavator has tracks, cabin, rotating upper body, boom and bucket. Its continuous predictable sweep uses 16 small collision boxes. A warning ring and an advance sweep marker give visible timing cues.
- Elevated decks have unsupported regions. A worker or beam leaving supported ground recovers the whole pair. Crushing contacts recover instead of trapping the team indefinitely.
- Checkpoints follow the doorway and the completed turn. Recovery restores the most recent reached checkpoint, releases both grips, clears motion, adds five seconds and protects the team for 1.2 seconds. The recovery button offers the same team-local escape route and penalty.
- Exactly two assigned workers per beam; 2/4/6/8 workers form 1/2/3/4 independent teams. Existing odd-player spectator behavior remains. Teams do not physically block competing teams.
- Delivery requires the whole beam in the goal, checkpoint progress, both ends supported and a 0.7-second hold. Results rank elapsed time plus recovery penalties. The clock continues during reconnects; hazard physics continues while controls wait for a missing partner. Completed times are frozen.
- A four-minute round limit resolves unfinished or abandoned teams as DNF. Replay clears penalties and preserves the selected course. Reset sequence numbers stay monotonic after automatic recoveries.
- Course view toggles between the worker camera and a full-course overview. Keyboard, touch joystick, action and signal controls continue to use the existing input system.
- Preview protocol is 17 so this client does not silently connect to the stable Protocol 16 server.

## Verification

Final full-suite result: **135 passed, 0 failed, 0 skipped**, 443.90 seconds, all network tests enabled against a temporary local production server. This comprises the existing 109 tests plus 25 new physics/lifecycle tests and one new four-client network test. Full output is preserved in `verification/full-suite.txt`; the original runner log is `beam-chaos-final-tests.log`.
Production TypeScript client/server compilation and Vite build passed. The existing bundle-size warning remains: about 736 kB minified / 206 kB gzip, compared with about 732 kB / 204 kB at the stable release.

New coverage includes stationary beam/worker contacts, excavator contacts, bounded contact recovery, fall boundaries, both checkpoints, respawn protection, team-local penalties, 2/4/6/8-worker replay, reset numbering, reconnect-time obstacle physics, adjusted ranking, three simulated complete courses, and four real WebSocket clients testing map authority, recovery, reconnect and replay. Existing multiplayer tests still exercise 2/4/6/8 workers and a complete carried delivery/replay.

The full test runner starts its own temporary production server, enables all network tests, limits file concurrency to four and shuts down its server when finished. Optional filename prefixes select a subset, e.g. `node scripts/test-live.mjs beam`.

Builds used the already-installed dependencies in the parent project through Node's normal package resolution. No dependency or lockfile was changed. Commands equivalent to the package build script were run directly: TypeScript no-emit, TypeScript server compilation, and Vite build. A fresh dependency installation remains an integration-environment check.

Performance spot check: 1,200 forced-contact ticks, eight workers/four teams, Excavator alley, Node 24 on this Windows machine during concurrent regression testing: mean 3.97 ms, p95 11.58 ms, max 15.93 ms per 33.33 ms server tick. This measures server CPU, not iPhone rendering or Internet latency.

Two browser clients verified room-code joining, host map selection, guest selection lockout, the elevated/excavator overview and visible team recovery with its five-second penalty. Browser reload reconnected the same worker, transferred host control to the remaining client, and retained results. The idle round reached DNF at four minutes; the transferred host replayed successfully, clearing penalties and retaining the course. Screenshot: `verification/excavator-course-desktop.png`.

## Laptop + physical iPhone acceptance

Use this isolated checkout and a separate local port, never the public stable URL. Install the lockfile dependencies if needed, run the production build, then start with `PORT=3187` and `NODE_ENV=production`. On Windows PowerShell: `$env:PORT='3187'; $env:NODE_ENV='production'; node build/server/index.js`. The server must report this checkout and Construction Chaos / protocol 17. Use the laptop's LAN address and port 3187 on an iPhone on the same Wi-Fi; allow the test connection only if necessary. Do not change Render settings.

1. Laptop creates Beam Carry. iPhone joins with its room code. Check all three course choices and confirm only the host can change them in the lobby.
2. Start Crew training. Each worker grabs its assigned end. Carry through the doorway together, turn with opposing inputs, and pass the loads by timing openings. Check release/regrab and both phone orientations.
3. Remain stationary in a moving load's path, first attached and then detached. Confirm workers/beam are pushed or the whole pair recovers when crushed; verify neither can remain stuck in a wall. Check the +5-second penalty and short protection feedback.
4. Run Skyway haul and Excavator alley. Use Course view to inspect edges and the sweep. Intentionally leave a platform with one free worker, then let a load push a carried beam off. Both workers and the beam must return together. After reaching the turn checkpoint, a recovery should restore a horizontal beam near the crossing.
5. At the excavator, observe a full sweep and its advance marker. Make stationary contact with both worker and beam; watch for visual overlap, clipping or jitter under real Wi-Fi latency. Time a clean crossing.
6. Deliver with both ends held. Check the result equals elapsed time plus five seconds per recovery. Replay from host controls; verify grips release, penalties clear, both clients reset and course selection persists.
7. Reload Safari mid-carry and reconnect within the existing reconnect window. The remaining client must retain team identity and live hazard contact; the rejoining worker must return beside its own beam and regrab. Repeat a reload during countdown and after a recovery.
8. Add browser/device clients for 4/6/8 workers. Check each pair's beam, recovery isolation, independent deliveries and adjusted ranking. Let a round time out to verify DNF and replay.
9. Return to lobby. Check room-code/share flow and a Wheelbarrow Championship with the existing materials, spill hazards and scoreboard. No Wheelbarrow mechanics were changed.

## Remaining limits

- Physical laptop+iPhone gameplay and iPhone Safari frame rate have not been accepted for this branch. Automated device presentation tests do not replace this.
- The browser viewport override did not change the observed 1280x720 viewport in this environment, so no mobile-sized visual pass is claimed.
- Falls trigger immediate checkpoint recovery rather than a simulated downward ragdoll animation. Protection is a short stationary reset period at a safe checkpoint.
- Obstacle boxes are conservative approximations, including square worker footprints for depenetration. Physical feel and rendering interpolation under latency need the device checks above.
- The courses share their opening and destination; this is a three-course variation set, not a new procedural world generator.
- No real iPhone stress or external-network latency test, fresh dependency install, cloud deployment or integration with WORK B was performed.

## Integration conflicts to review with WORK B

Likely shared edit points: `client/main.ts` (menu controls, room rendering, results/camera), `client/style.css`, `server/room.ts` (messages, restart and competitive tick), `server/state.ts` (additive Beam fields), `shared/version.ts` (protocol negotiation), and `scripts/test-live.mjs` (concurrency and optional prefix filter). Existing `tests/beam-multiplayer.test.ts` now steers around solid loads and accounts for automatic recoveries.

Keep the Beam-specific module and tests separate: `shared/beam-chaos.ts`, `tests/beam-chaos.test.ts`, `tests/beam-chaos-network.test.ts`. `shared/beam.ts` gains optional world arguments with legacy defaults. No Wheelbarrow material, spill, scoring, championship-world or track source files changed. Coordinate a single integrated protocol version after merging; do not independently reuse protocol 17 for an incompatible schema. Rerun the complete suite and physical acceptance on the integrated revision before considering deployment.
