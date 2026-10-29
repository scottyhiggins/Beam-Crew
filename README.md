# Milestone 6A — two-course Wheelbarrow Championship

Build **BREAK TIME · Championship 6A**, protocol **11**, October 29, 2026. The separately selectable **Wheelbarrow Championship · 2 courses** preserves the original Course 1 and continues through its existing yard into Scaffold Switchback. Beam Carry and the independent single-race Wheelbarrow option remain available. Refresh both devices after deployment and create a fresh room.

The server owns leg progression, ordered gates, finishing, scoring and the three-second intermission. Finished carts keep normal driving, reload, instability, contact and spill behavior in the common yard. Its next-course gate stays shut until GO. GO resets only the next leg's progress, finish latch, official spill counter and elapsed time; cart positions, rotation, speed, instability, reload, materials, room/session membership and old hazards survive. Both finish strips retain one-way protection, including Course 1's lip after GO. Course 2 has a pipe alley, tighter switchbacks, a rough scaffold straight, overhead tower cranes, exposed buildings and equipment. Obstacles are static in 6A.

Immutable leg snapshots record racing spills and official race time. Staging/intermission/results spills remain physical but are excluded from official totals. Cumulative standings sum completed-leg snapshots; fewest spills wins, combined racing time breaks ties, then final-leg finish order. The Standings control shows cumulative and per-course results; the final board opens after Course 2. Permanently departed racers are marked DNF and rank behind classified finishers. A disconnected unfinished racer remains eligible during the existing 30-second reconnect reservation; expiry or explicit Leave releases the next transition. Host transfer and replay use the existing room lifecycle. Restart resets the entire series; there is no host command to advance an individual leg early.

Shared versioned track data supplies gates, ropes, driveable ground, rough zones, ramp profile and yards to simulation and rendering. Course 2 is authored in local coordinates and placed at Course 1's exit socket (-3, -36), with a 5.6m clear lane, level ground and matching forward orientation. Its final yard ends at (-5, -90). Shared-yard end caps are removed only in Championship; the existing single-race cap remains. Fixed two-course ordering is intentional. The finite city corridor uses shared geometries/materials, instanced building/scaffold/equipment batches, fog, frustum culling and distance-hidden scenery chunks. The existing adaptive resolution budget remains. Physical iPhone heat/frame-rate and cross-network comfort still need the acceptance pass below.

Recovery: **codex/pre-milestone6a-20261029** at **34d2b0a**, plus **Beam-Crew-pre-milestone6a-20261029.bundle** in the ChatGPT project workspace. Prior public deployment **dep-dbhnrouc6qcc73ftgv40** is the October 29 repairs release. Existing untracked helpers were preserved. No additional Render service, plan or settings changes; auto-deploy remains off. No 3/5/10 selection, random ordering, extra eight courses, awards, Crane Challenge or Toolbox Trivia are included. Milestone 6B waits for physical acceptance.

Validation/release evidence is recorded below after the final local and public runs.

---

# BREAK TIME — October 29 repairs 1

Focused reconnect, one-load debris scatter, worker handle position and procedural stumble repairs. Build **October 29 repairs 1**, protocol **10**. Refresh both devices and create a fresh room. Recovery version preserved; no Championship or Crane Challenge. See PLAYTEST.md for the short acceptance pass.

---

# BREAK TIME — Playtest corrections 1

Play: https://break-time-9n1k.onrender.com . Debris contact now follows the visible objects with no ghost rings or empty active slots. Dedicated iPhone landscape HUD, standings, results, touch controls and forward camera framing; portrait/desktop presentation retained. Build label **Playtest corrections 1**, compatibility protocol **9**: refresh both devices and create a fresh room. Full local suite: **68 passed, zero failures/skips**. Verified public release: **e1774590d1ec83be8c191e0cfca904c9987791dc**, Render deploy **dep-dbhacc88v5cc73ftrjn0**, build **BREAK TIME · Playtest corrections 1**, protocol **9**. Production build and all **68 tests passed locally and against Render**, zero failures/skips, including all twelve materials across real connected clients. HTTPS/WSS smoke passed. Public browser showed the correct build with no console errors; post-deploy Render error query returned no entries. Same service/settings/plan, auto-deploy off, recovery branch and bundle preserved. Physical iPhone landscape/notch/Safari-chrome acceptance remains the next human check. Documentation-only follow-up needs no deployment. See PLAYTEST.md and DEPLOYMENT.md. No Championship or Crane Challenge implementation.

---

# BREAK TIME — Visual polish 2

Play: https://break-time-9n1k.onrender.com . Focused fixes for adaptive rendering sharpness and one-load spill quantities; network protocol remains 8. Production build and **64 local automated tests passed**, zero failures/skips. Physical iPhone sharpness/frame-rate/heat acceptance is in PLAYTEST.md. Championship is **planning only** in [CHAMPIONSHIP_PLAN.md](CHAMPIONSHIP_PLAN.md); no new modes/courses were added. Verified live October 28, 2026: **BREAK TIME · Visual polish 2**, protocol **8**, gameplay commit **5a6eb1d61be968d601265b55c3eb9b15d9adc4c3**, Render deploy **dep-dbh5h1flk1mc73facagg**. Production build and all **64 tests passed locally and against the public Render server**, zero failures/skips. HTTPS/WSS smoke passed. All twelve materials were spilled across two real connected clients with identical one-load allocations; shapes/colors and total loose volume were checked separately. Render and browser error checks found no entries. The same service/plan/settings remain in use; automatic deploys remain off. GitHub Desktop published the release. Refresh both devices and make a fresh room. Physical iPhone sustained sharpness/frame-rate/heat acceptance is still required. Championship remains planning only. This verification-only documentation follow-up requires no redeploy.

---

# BREAK TIME — Visual polish 1

Play: https://break-time-9n1k.onrender.com . Verified public release: **ca5ec181e53453a075910ceb356d310001386c57**, Render deploy **dep-dbh3fbsipgvc73dm2ju0** live October 28, 2026. Public HTTPS/WSS smoke passed; **60 tests passed against Render**, zero failures/skips. Public browser shows Visual polish 1 and no console errors; Render post-deploy error query returned no entries. GitHub Desktop published the release successfully after CLI push stalled. Refresh both devices and create a fresh room for physical iPhone visual/performance acceptance. This documentation follow-up needs no deployment; auto-deploy remains off.

---

# BREAK TIME

Construction party multiplayer for 2–8 players. Wheelbarrow Race and Beam Carry (exactly two workers per team/beam). The repository and Windows folder remain Beam-Crew.

**Play publicly: https://break-time-9n1k.onrender.com**

Verified live October 27, 2026 on Render: **Connected finish 1**, source **fc5c981**, protocol **8**. HTTPS/WSS smoke passed; all **59 automated checks passed locally and against the public server**, zero failures/skips. Runs independently of the laptop. The user accepted the previous finish/scoreboard and cross-network multiplayer; the connected staging update needs the fresh physical-device checklist in PLAYTEST.md. See DEPLOYMENT.md for the verified deployment record and costs.

Hotfix build: **BREAK TIME · Connected finish 1** (protocol 8). After an update, refresh both devices and create a new room.

## Play locally

Close the old server with Ctrl+C, then double-click Start-BeamCrew.cmd. Confirm BREAK TIME. Laptop: http://localhost:2571. iPhone: same Wi-Fi, http://<laptop-Wi-Fi-IPv4>:2571 (find the current address with ipconfig). Keep the launcher open. Create a room, join by code/link, choose mode, Start test. The lobby panel/menu behavior is preserved.

WASD / joystick moves. Space / ACTION grabs/releases your assigned beam end. Beam Carry pairs connected workers in join order; an odd worker spectates. Two workers is a team time trial. Multiple teams race simultaneously without beam-to-beam blocking. The existing doorway and turn course is unchanged.

Wheelbarrow has 12 material choices in six paired categories. Loaded handling is identical; spills create different hazards. Loads now look like cement/sand, pipes/rebar, barricades/coiled hose, bricks/hollow blocks, boards/offcuts, gravel/rubble. Choices lock at countdown. Fewest spills wins; fastest finish time breaks ties. Ordered full-lane route gates validate progress; the cart’s leading edge crossing the painted finish records the finish. The HUD shows route progress. Follow arrows inside continuous rope barriers and ordered server checkpoints.

Finishers drive continuously over a low-profile one-way spike strip into a connected 16m-wide staging yard; there is no teleport or colored pad. The invisible server-authoritative wedge raises carts slightly and blocks reverse course entry. Finished carts use normal handling, can bump/push each other and spill. Official result snapshots never change after finishing. Arriving unfinished carts have priority over parked finishers and ignore staging debris, so playful blocking cannot prevent a finish. Final results open automatically for everyone and the timer stops when all racers finish. Dismiss results to keep driving. Lobby controls are unchanged. The far end of the yard is reserved for future connected-course geometry; Championship mode is not implemented.

## Build and verify

Node 24.19–24.x, pnpm 11.25.0. Run pnpm install --frozen-lockfile, then pnpm test:all. This builds the client/server, starts an isolated local production server, runs every test including multiplayer, and stops that server. pnpm test alone skips six network tests without TEST_URL. pnpm dev starts development. pnpm smoke:public https://<actual-host> checks HTTPS/WSS, room-code joining and both modes after deployment.

Authoritative custom math at 30 Hz, patches at 20 Hz; no physics engine. Hazards cap at 192. Shared rules: shared/wheelbarrow.ts, shared/fences.ts, shared/beam.ts. Rendering: client/main.ts and client/load-visual.ts. Decisions/verification: PROJECT_STATUS.md. Physical device acceptance: PLAYTEST.md.
