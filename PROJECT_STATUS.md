# Beam Crew — project status

Updated October 4, 2026. **Milestone 2 personal playtest PASSED on laptop + iPhone as two separate players.** Milestone 3 Wheelbarrow Race MVP is implemented and awaiting the user’s laptop + iPhone playtest; it is NOT personally approved. Public game hosting is deferred.

## Project and repository
Low-poly construction party game for 2–8 browser players. Cooperative carry/turn/delivery of a steel beam is the current mechanic. Built for the Handshake AI Skills Studio x OpenAI multiplayer game challenge.

Canonical local repository: `C:\Users\higgi\OneDrive\Documents\Beam-Crew`, branch `main`. Public GitHub: https://github.com/scottyhiggins/Beam-Crew; origin: `https://github.com/scottyhiggins/Beam-Crew.git`. GitHub Desktop recognizes this folder and offers Open in Visual Studio Code.

Migration merge `f5492da` retains Documents initial commit `43ca59d` and Milestone 1 commits `8acbd4c`, `172e5d6`, `133c999`. Backup branches `backup/documents-initial-20261004` and `milestone1-preserved` remain. Setup commit `75f8b66` was pushed and verified against GitHub before Milestone 2. Old Codex project remains intact. Assistant shell Git metadata writes are denied by Windows; native GitHub Desktop successfully commits/pushes. Use the canonical folder for future work, not the old mirror.

## Architecture and controls
TypeScript, Three.js, Node.js, Express and Colyseus. One process serves browser assets and in-memory rooms. Custom deterministic movement/beam math; no conventional physics engine, accounts or database. Server owns all worker/beam positions and grip assignments. Clients send bounded inputs and action toggles, interpolate poses and render visual support feedback.

WASD / virtual joystick moves free workers or applies force while attached. Space / ACTION toggles grab/release. Desktop also has a labelled grab/release button. LIFT/WAIT/LEFT/RIGHT broadcast temporary signals. Host uses Lobby controls for reset, restart, return to lobby and leave.

## Implemented features and decisions
- Existing lobby, five-character room codes, direct join links, 2–8 workers/colors, host-only start/return, immediate host transfer, 30-second reconnect reservation, quick signals and mobile input remain.
- One beam, eight available numbered grips. Proximity and occupancy are checked server-side. Two-player spawn starts near opposite ends. Rings/tethers use occupant colors; nearby empty grips turn green. HUD and action button show attachment.
- Attached input averages drive translation; torque at longitudinal grip positions drives turning. Opposite axial forces cancel; opposite crosswise forces at opposite ends rotate predictably. End mobility couples support/drag to turning and movement; smooth response and caps are configurable.
- Supported ends lift; unsupported ends lower and drag. Ground markers and HUD show support state. Geometry is inexpensive visual feedback; vertical motion is not a rigid-body simulation.
- Doorway walls, one column requiring a roughly 90-degree maneuver, green delivery area. Shared collision geometry covers workers and beam; small deterministic substeps prevent beam tunneling. Full beam must be inside the goal for .7 seconds to deliver.
- Doorway checkpoint saves after the entire beam passes the wall. Host reset returns beam/workers to checkpoint, releasing grips; full restart returns to start. Delivery freezes the beam until reset/restart. Inputs clear on client reset.
- Simulation 30 Hz, patches 20 Hz. Input older than 300 ms becomes neutral. Disconnect releases the grip immediately; reconnect restores the worker but requires grabbing again. Active tests reject late joins. Restarting server destroys rooms.

## Tuning locations
`shared/beam.ts`: `BEAM_CONFIG` (carried effectiveness .9, dragging .2, speed 2.8, turn gain 1.6, acceleration 7, maximum turn speed 1.25, grab radius 1.25, beam length 6.4/width .32, lifted/grounded height 1.05/.22), `GRIPS` and `COURSE`. Units are world units and seconds. `shared/movement.ts` controls free-worker movement, bounds and room limits. Server room logic is in `server/room.ts`; synchronized schema in `server/state.ts`; rendering/input in `client/main.ts`.

## Run and verify locally
Double-click `Start-BeamCrew.cmd` in the canonical folder. It builds and runs production on **2571**; keep the window open, Ctrl+C stops it. Bundled Node is used if available; otherwise Node on PATH. Dependencies are already installed in the canonical folder. Port 2571 avoids the earlier prototype on 2568.

Laptop: `http://localhost:2571`. iPhone: same Wi-Fi, `http://<laptop-Wi-Fi-IPv4>:2571`; use `ipconfig` for the current address. Separate names, create on laptop, join by room code on phone, host starts. See `PLAYTEST.md` for the full test sequence. Open via Wi-Fi address before sharing phone join links. Clipboard may fall back to displaying the URL on plain LAN HTTP.

Development: Node.js 24, pnpm 11.25.0. `corepack pnpm install --frozen-lockfile`, `corepack pnpm dev` (port 2567), `corepack pnpm build`, `corepack pnpm test`. Client changes refresh; server changes need restart. Production: build, set `NODE_ENV=production`, then `corepack pnpm start`; `PORT` overrides the port. For live integration coverage, run a server separately and set `TEST_URL=http://localhost:2571` before testing; otherwise both network tests skip.

## Verification and limitations
Canonical frozen-lockfile install, TypeScript checks and production build pass. All **16 tests pass**, none skipped with TEST_URL: nine deterministic beam tests including complete course traversal, four movement tests, schema encoding, original eight-client lifecycle and new two-client beam carry/release/reconnect/delivery/reset/replay. Both network tests also pass over the laptop Wi-Fi address. Browser checks verified lobby/direct join, opposite-end grips, synchronized support HUD, refresh reconnect with release, transferred host recovery controls and unobstructed beam rendering. Vite warns about the large Three.js bundle; build succeeds.

**Human acceptance — October 4, 2026:** The user personally tested Milestone 2 on laptop and iPhone as two separate players and reported that grabbing, movement, rotation, dragging, the doorway/turn challenge, synchronization and the overall mechanic worked well. They deliberately tried to break the mechanic or get the beam stuck and found no significant issues. Milestone 2 is accepted on the strength of this human playtest, in addition to automated verification. Simultaneous multi-team racing is a future design and has not been implemented or playtested. No local prediction, worker-worker collision or physical balance/falling. Fixed-shape beam collisions and visual-only height intentionally simplify physics. Guest Wi-Fi isolation/VPN can block LAN access. Multi-room load and production abuse protection are future work.

## Final Beam Carry direction — documented, not implemented
Beam Carry is primarily a **team race with teams of exactly two players per beam**. One teammate controls/grips each end; multiple teams should eventually race through the construction course simultaneously.

| Players | Intended Beam Carry structure |
| --- | --- |
| 2 | One two-person team / time trial |
| 4 | Two teams |
| 6 | Three teams |
| 8 | Four teams |

**Wheelbarrow Race is the individual mode and works well for odd player counts.** This records the intended future mode structure; The Milestone 3 individual Wheelbarrow MVP is now implemented; personal acceptance remains pending.

The current multiple numbered grip points were useful for validating the MVP. The eventual Beam Carry design should move toward clear front/end grip ownership for the two teammates. The current implementation remains one shared beam with eight available grips; no teams, simultaneous race, per-end ownership or time trial have been added by this documentation update.

## Milestone 3 — Wheelbarrow Race MVP

Authorized by the new milestone request. Beam Carry mechanics and its accepted two-person future direction are preserved; no expansion of Beam Carry or Milestone 4.

- Host-only lobby mode selector launches Beam Carry or individual Wheelbarrow Race. Independent carts and loads for up to eight workers; two racers spawn symmetrically alongside each other. Five to eight use a second starting row.
- Server-owned fixed-step steering, acceleration, instability, per-player spills, reload, ordered course checkpoints, finish detection, times and places. Three-second countdown freezes carts; elapsed simulation time starts at GO. Times include reload delay. Simultaneous finish ticks share a time, with join order deciding placing.
- Small repeatable construction corridor: straight, moderate diagonal bend, sharp turn, rough strips and finish straight. Ordered checkpoints and corridor containment prevent skipping the course. Course edges stop motion; reverse/turn to recover. No cart-cart collision or shoving.
- Colored wheelbarrows, front wheel/handles, worker pushing pose, visible brick load, wobble/lean, tipping and disappearing load on spill, automatic reload at the same position/heading. YOU label, countdown, speed/risk/spill HUD and simple finish results. Host can restart without refresh or return to lobby to switch modes.
- Existing WASD and mobile joystick. Direction indicates desired heading; cart turns gradually. Release to brake/recover. Keyboard feathering and partial joystick travel provide careful driving. Laptop/mobile fairness and fun require the personal test.
- Existing room codes, host transfer, no late joins, 30-second reconnect and input expiry remain. Disconnected carts brake; reserved racers can resume, and do not prematurely end the race. Results survive a finisher leaving; next-place numbering remains monotonic.

### Wheelbarrow tuning

All gameplay tuning is in shared/wheelbarrow.ts, WHEEL_CONFIG and WHEEL_COURSE (world units, seconds, radians). Maximum speed 5.5, acceleration 3.8, braking 7, steering cap 2.8 radians/sec. Instability adds speedGain .24 × speedRatio³, turnGain .65 × absolute turnRate × speedRatio², plus roughGain .65 × speedRatio² in the marked rough section; recovery subtracts .3/sec. Risk threshold 1; reload 2.4 sec; countdown 3 sec; corridor radius 2.8; checkpoint radius 2.4. Full-speed straight driving is safe; accumulated turning/rough risk can spill. Lean is visual feedback for authoritative turn rate. Server flow: server/room.ts; synchronized fields/results: server/state.ts; render/HUD: client/main.ts.

### Verification and limits

TypeScript and production build pass; the Three.js bundle-size warning remains. Full automated suite: 24 tests with live TEST_URL, none skipped, including all 16 existing tests and deterministic Wheelbarrow risk/recovery/threshold/reload/independence/roughness/checkpoint/finish/full traversal plus a two-client countdown/authority/reconnect/finish/restart/mode-switch run. Final verification is recorded by the completion response. Browser inspection covers two rendered independent carts, course and HUD; personal iPhone testing is pending.

This is deliberately lightweight custom math: no rigid-body physics, individually simulated spilled bricks, prediction, awards, persistent results, public hosting or final art. Finish position uses the worker/cart origin. Larger lobbies use two starting rows, so eight-player start fairness needs further tuning. No dedicated spectator system; an unfinished connected racer keeps the race active until finishing or the host restarts. Identical-tick ordering favors join order. Race data lives only in memory and resets on restart. Desktop has binary keys while joystick supports analog throttle; compare fairness during the personal test.

See PLAYTEST.md for simple start, URLs, mode selection, controls and risk-versus-reward checks.

## Next and stop condition

Stop after Milestone 3 implementation, testing, commit and push. Await the user’s laptop + iPhone personal playtest and explicit acceptance. Do NOT mark Milestone 3 personally approved and do NOT begin Milestone 4. Production hosting remains deferred.
