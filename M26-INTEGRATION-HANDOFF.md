# Milestone 26 — Crane Gameplay Overhaul

Independent checkout: `Beam-Crew-m26-crane-gameplay`
Branch: `feature/crane-gameplay-overhaul`
Base: `380c834f5dad12dca8553f525ab6e8353e89f1be` (Protocol 21).

## Implementation

Tower Rush now suspends its container from one overhead cable and a triangular two-sling bridle. Sling endpoints follow the carried container's rotation. The lateral attachment at load height is gone; a crane rail extension remains at the top. Missed containers dissipate angular and lateral energy on the yard, stop, never score, and remain subject to the existing 60-body/off-map bounds. The supported-stack, centre-of-mass, collapse and 100-ft/60-second rules remain authoritative.

Derby has its own angular slew state, smoothed turn velocity, clamped hoist height (5–12 units), pendulum dynamics and cooldown-limited boost. A visible boom rotates about the mast. A fixed three-storey, three-bay scaffold/wall structure replaces the disconnected target rows. Thirteen movable jobsite props use a server-created round seed shared across every private arena; replay creates a new seed. Lower support failure destroys the upper objects in that bay, awarding each once and producing bounded falling fragments. Collision checks sweep the ball path, require impact speed and require separation before another damage award. Visual fragments never score. Impacts have particles, a short synthesized thump after user interaction, and restrained camera feedback disabled by reduced-motion preference.

Keyboard: A/D or Left/Right rotate; W/S or Up/Down raise/lower; Space boosts. Five touch controls provide the same actions. Tower Rush keeps its three controls. Existing private snapshots, leaderboard, join-order ties, 60-second timing, host transfer, reconnect, podium and replay remain in the Crane room.

## Run and integration

Install the existing locked dependencies with `pnpm install --frozen-lockfile` in this checkout when moving to another machine. Validation here used the already available parent workspace dependencies without changing them.

Build: `pnpm build`.
Production preview: `pnpm m26:start` → HTTP/WebSocket port **3126**.
Development: `pnpm m26:dev` → HTTP/WebSocket **3126**, Vite HMR **5226**.
The launcher refuses occupied ports and never stops another process. Build before first start. No production configuration or deployment was changed.

The clone has its own Git object database (`--no-hardlinks`); origin is the local M24 checkout. Nothing was pushed, merged or deployed. Do not use this local origin for publishing. Integrate only after review into a separate integration branch, inspect the complete diff from the base, rerun `pnpm build`, then run `TEST_URL=http://127.0.0.1:3126 node --test build/tests/*.test.js` (set the environment variable using your shell). `node scripts/m26-controls-live.mjs` checks all room sizes. The optional screenshot guest helper accepts a local six-character room code. Protocol remains 21; coordinate any protocol bump with the integration owner before public release.

## Validation and evidence

- TypeScript client and server compilation: pass.
- Production Vite build: pass; existing shared Three.js chunk remains above the 500 kB advisory threshold.
- Offline regression: 230 discovered, 196 pass, 34 live-server skips, 0 failures.
- Focused real-network tests: 4/4 pass, including sustained Derby results, eight-player reconnect/host transfer/replay, and existing M22 Crane/Party integration.
- New live controls matrix: all room sizes 2, 3, 4, 5, 6, 7 and 8 pass rotation, hoist, shared seed, arena privacy and replay.
- Added deterministic tests cover seeds, turn response, height bounds, support collapse, duplicate prevention, missed high-energy container settling, and eight full-round simulations.
- Desktop simulation sample: eight arenas × 1800 ticks in 80.3 ms, peak 65 fragments/arena (cap 72). This measures physics computation, not mobile rendering or network throughput.
- Browser checks: pointer rotation/boost/raise, keyboard rotation/raise, seeded replay reset, mode switch, scores and podium. Screenshots: `verification/m26/tower-hoist.jpg`, `tower-narrow.jpg`, `derby-desktop.jpg`, `derby-portrait.jpg`, `derby-landscape.jpg`, `derby-narrow.jpg`, `derby-results-landscape.jpg`.
- Full live regression: 230 executed, 228 passed and 2 Quick Match failures under parallel shared-server traffic. Both failed tests passed (2/2) on a clean isolated rerun. All 230 cases therefore have passing evidence; this was not a single all-green concurrent run. See `verification/m26/m26-live-tests.txt` and `m26-quickmatch-isolated.txt`. Run capacity-sensitive public-match tests on a clean server.

## Known limitations

- Derby intentionally projects the angular sweep into a 2.5D facade collision lane. It is not full spatial rigid-body or structural simulation. The boom has a shallow visual depth projection to preserve the existing camera and target readability.
- Structural failure uses an immediate deterministic bay cascade with falling fragment effects, rather than articulated, weight-bearing falling floors. Supports are scaffold bays rather than separately simulated steel members.
- Containers retain the base simplified upright stacking/contact model. The new friction fixes missed-load settling; it does not replace the tower solver with general-purpose box collisions.
- Browser viewport checks emulate phone sizes; no physical iPhone thermal, GPU, audio or multi-touch endurance measurement was performed. Audio depends on browser audio unlock. Optional camera feedback respects reduced motion.
- Every player has a finite private set of 31 scoring objects; no respawning or debris scoring. Skilled players can clear the site before 60 seconds; ties use earlier join order.

## Recovery

The bundle beside the checkout, `../Beam-Crew-m26-crane-gameplay.bundle`, contains the branch and its complete reachable history. Verify with `git bundle verify <bundle>`, then clone it to a new directory and check out `feature/crane-gameplay-overhaul`. The original release candidate and milestones 22–25 were never edited. A separate recovery manifest records the exact final commit and bundle SHA-256; the committed handoff can be located from that manifest without embedding a self-referential commit hash here.

