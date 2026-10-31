# BREAK TIME - Milestone 22 Release Candidate

Local candidate: `feature/final-release-integration`, Protocol 21. See [M22 release report](M22_RELEASE_REPORT.md) and [laptop + iPhone QA](M22_PHYSICAL_QA.md). This checkout has not been pushed or deployed.

Historical gameplay notes follow.

[Play BREAK TIME](https://break-time-9n1k.onrender.com/) · [Submission checklist](SUBMISSION.md) · [Physical playtest](PLAYTEST-M7.md)

A browser construction party game for 2-8 workers. Create a room, share its five-letter code, and join from another laptop or phone. No installation or account is required for players.

## Beam Carry

Choose **Beam Carry** before creating a room, or select it from the host lobby. Use 2, 4, 6, or 8 workers for 1-4 independent two-person teams. An odd worker spectates that round; Wheelbarrow supports odd counts. Each worker owns one beam end. Teams share the course, but their beams do not collide with other teams.

After the countdown, press **Space / GRAB** or touch **ACTION** at your assigned ring. Move with **WASD** or the touch joystick. Match your partner's direction to translate; opposite sideways inputs turn the beam. Releasing an end slows the beam. Use LIFT / WAIT / LEFT / RIGHT to coordinate.

Carry through the doorway, continue north, rotate right around the column, then follow the yellow corridor past **two moving suspended loads** and a narrower passage to the green delivery zone. Stop with the whole beam inside while **both ends are held** for 0.7 seconds. The server awards one delivery, finish time and place per team. Fastest delivery wins. Delivered teams wait for the rest; permanently departed pairs receive DNF. Reserved disconnects retain the existing reconnect window; reconnect, approach your assigned end and grab again. Host **Restart course** restarts all teams fairly.

Beam Carry's haul distance is extended from the original goal at x=4.3 to x=26. Moving loads use the synchronized server race clock for collision and rendering; clients send directions and actions, never accepted positions. Touch joystick changes and release send immediate Beam inputs in addition to the existing 30 Hz updates. Beam mode alone uses the wider yard. Wheelbarrow Championship rules, materials, countdown, reconnect and score ledger are retained.

All six home choices are active: Wheelbarrow Championship, Beam Carry, Toolbox Trivia, Crane Challenge, Party Night, and Worker Store. Crane Challenge offers Tower Rush and Wrecking Ball Derby. Party Night has exactly three playable modes: Wheelbarrow, Beam Carry, and Toolbox Trivia. Pumpkin Hard Hat and classic cosmetics are free.

## Run and verify

Use the repository's pinned Node and pnpm versions:

```text
pnpm install --frozen-lockfile
pnpm build
node scripts/test-live.mjs
```

The test runner starts an isolated production server and enables all real WebSocket checks. `pnpm test` without TEST_URL skips network checks and is not release verification. Start manually with `NODE_ENV=production`, then `pnpm start`; PORT defaults to 2567. On Windows, use Start-BeamCrew.cmd. See shared/version.ts and /health for the build protocol.

## Recovery and release evidence

User-accepted protocol 15 source: **0e768f1b141f135a81467177205260041cbc66a4**. Recovery branch **codex/protocol15-recovery** and external **Beam-Crew-protocol15-recovery.bundle** preserve complete history. Milestone 7 is developed on **codex/milestone7-beam**. The active Documents repository was not used as an editing scratchpad. Current verification and deployment state are recorded in **MILESTONE7-VERIFICATION.md**; a build label alone does not prove deployment.

Screenshots in docs are labeled as local preview or public release evidence. Physical iPhone measurements require the user's device playtest; automated browser and network checks cannot establish touch feel, heat or sustained FPS.

---

## Earlier milestone records

# Milestone 6C — Championship polish and construction UI

The user physically accepted the protocol 13 ten-course Championship on laptop and iPhone through Course 10/10, with correct results; laptop had an occasional brief stutter. Recovery branch **codex/pre-milestone6c-protocol13-20261029** retains **2081c0c**, with a complete-history **Beam-Crew-pre-milestone6c-protocol13.bundle** outside the repository. All earlier recovery branches remain intact.

Gameplay checkpoint **ba72ae88988fc88afc5c45cc829cfaa36f88e4f3**, protocol **14**, was production-built and passed all **97 local tests**, then deployed to the existing service as **dep-dbi1kmom7kps73bkaisg** and verified live. A clean settled-service run passed **97 public tests**, zero failures/skips, plus HTTPS/WSS smoke. A first public run overlapped retirement of the prior deployment and failed on old three-second rooms/reconnect; the settled complete rerun supersedes it. Preserve **codex/milestone6c-gameplay-checkpoint** and its complete-history external bundle before further UI work.

Current candidate: **BREAK TIME · Championship 6C · Construction party polish**, protocol **15**. New rooms default to a randomized **3-race Championship**. Host-selectable 5/10, classic 2-course route, independent single race and two-person Beam Carry remain. Four illustrated main-menu tiles select Wheelbarrow or Beam Carry before room creation; Crane Challenge and Worker Store are clearly disabled Coming Soon. Twelve vector material cards retain all six categories, authoritative selection/lock and unchanged equal base handling. Custom-styled native selectors preserve keyboard and Safari behavior; safe-area spacing, scrolling, readable focus/selected/disabled states and compact touch HUD remain.

Course surfaces now stop at exact entry/exit planes. The finish neck and yard meet without differently colored coplanar overlap; finite underlying ground no longer overlaps neighboring section slabs. Visible barriers use shared clipped socket fences, with each shared yard owned/rendered once and cap wings rendered once. Tests sample all **90 ordered adjacencies** for surface ownership, covered yards and clear visible connections in addition to existing server collision and natural-route checks. Original yellow pylons/rope, server collision, finish lips and all ten layouts remain.

After the last eligible racer completes a leg, the server starts **five seconds** of intermission. The final seconds show centered **3, 2, 1, GO!**. Gate opening, new leg and timer zero remain one authoritative GO transition. Initial race countdown remains three seconds. Pose, speed, instability, reload, material, prior hazards and frozen score ledger survive; reconnection and DNF reservation rules are unchanged.

Performance changes target avoidable work: reuse spill allocations until record material/quantity changes; avoid rebuilding identical standings; retain route ID arrays; dispose owned ground geometry on replay. Prepare at most one nearby course per waiting frame into a reused 1px graphics target; racing performs no extra preparation pass. Only current/neighbor groups remain visible during play. Resource tests verify bounded scene size and graphics preparation restoring target, visibility and culling, including exceptions. No phone/desktop FPS or thermal improvement is claimed without a physical run.

Production build and the full protocol 15 local suite passed **98 tests**, zero failures/skips (all real network tests enabled, four files concurrently). Final public rollout evidence is recorded separately after deployment. No gameplay for Crane/Store, major Beam changes, new service, plan changes, dependencies, external images/fonts, material coefficients or physics engine changes.

---

# Milestone 6B — ten-course Championship

Build **BREAK TIME · Championship 6B · Ten-course Championship**, protocol **13**. Hosts can choose randomized **3, 5 or 10 races** from ten unique modules. The accepted **2-course 6A route** remains an independent choice, alongside single-race Wheelbarrow and Beam Carry. The server publishes one non-repeating ID order and seed; every client uses the same assembled module transforms. The selected order and named leg results appear in Standings. Restart creates a fresh shuffled route for 3/5/10 and retains the player's load selection.

The requested five-course checkpoint was implemented, production-built, passed **94 local and 94 public tests with zero failures/skips**, then deployed and verified **before** expanding to ten. Checkpoint source **4a3048cc6bf60fd47ac4d24d05248f01129551c9**, Render deploy **dep-dbhu1hijnfac73cbp0l0**, recovery branch **codex/milestone6b-five-course-checkpoint**, external **Beam-Crew-milestone6b-five-course-checkpoint.bundle**. The accepted 6A recovery branch/bundle and prior public deploy are also preserved. No destructive reset/clean or untracked-helper edits.

The final pool is Original Jobsite (sandy tan, original yellow pylons/rope), Concrete Scaffold (gray concrete), Dump Truck Haul Road (dark asphalt, raised-bed truck and gravel obstruction), Earthworks Dig (brown dirt), Utility Green (green grass), Brickworks Red (red masonry dust and brick pallets), Gravel Grade (pale compacted gravel and roller), Steel Deck Crossing (blue-gray deck/scaffolding), Service Court (cream concrete and tanks), and Clay Cut (ochre clay/excavator). New sections use orange cones with plastic chain links or tall delineators with red-and-white tape. All surfaces retain identical material-independent handling. The truck chassis and gravel use shared authoritative contacts; arrows show the fair route past the partially blocking heap.

Every legal ordered pair uses the same level, forward-facing 5.6m socket and 16m shared yard. The server preserves physical cart pose/speed/reload/instability, room/session, chosen load and permanent hazards across each synchronized three-second transition. Completed finish strips retain reverse protection. Per-leg official snapshots exclude staging/countdown spills and time, and cumulative scores use fewest racing spills then combined racing time. Existing reconnect reservation, host transfer, DNF progression and replay remain authoritative. Tests cover all 90 ordered adjacencies, all 12 loads on all ten natural routes, gate anti-shortcuts, a ten-leg eight-worker lifecycle with a later departure and countdown reloads, and real two-client 3/5/10 races/reconnect/replay.

The finite city uses cached geometry/materials and instanced scenery/barriers. At most current/neighbor course groups render; distant debris meshes are hidden without deleting server state. Replay disposes retired instance/line buffers and keeps scene growth bounded. Extended finite ground underlay avoids a visible void behind the starting yard. Automated active scene limits remain 130 course draw batches / 100k triangles across the ten-course pool; these are scene budgets, not a claim of physical iPhone frame rate or thermal performance. The accepted 6A pixel budget remains. No new assets/fonts, physics engine, postprocessing, paid service, plan/settings change, Crane Challenge or Toolbox Trivia.

Final validation and public release evidence will be recorded after rollout. Physical laptop/iPhone ten-leg acceptance is still required, particularly the previously reported brief hiccup and sustained heat/frame rate. See PLAYTEST.md.

---

# Milestone 6B — five-course checkpoint

The user accepted the 6A two-course Championship on laptop and iPhone, including cumulative scoring and multiplayer; one brief iPhone hiccup recovered. Accepted source 5728952 and live deployment dep-dbhsrhu7bikc73fs924g remain recoverable. Recovery branch codex/pre-milestone6b-20261029 at 0763bb4 and an external Beam-Crew-pre-milestone6b-20261029.bundle preserve the full local baseline. Existing untracked helpers are untouched.

Build **BREAK TIME · Championship 6B · Five-course checkpoint**, protocol **12**. The accepted fixed two-course route remains selectable. Hosts can choose 3 or 5 races; the server shuffles five unique module IDs without replacement and synchronizes the exact order and seed. Clients assemble only the published IDs. Ten remains unavailable in this checkpoint. Lobby-only host controls and strict length validation prevent bypassing unfinished options.

Five reusable sections: Original Jobsite (sandy tan, original yellow pylons/rope), Concrete Scaffold (gray concrete, orange cones/plastic chain), Dump Truck Haul Road (dark asphalt, tipped truck and partially blocking gravel), Earthworks Dig (brown dirt, tall delineators/red-white tape), Utility Green (green grass, utility pipes). Surface colors do not change handling or material behavior. Truck chassis and gravel footprints are authoritative; painted arrows lead along the open side of the pile. Every ordered adjacency has matching level 5.6m sockets and a shared 16m staging yard; the next gate stays closed until synchronized GO. No position/load/room reset occurs between legs. Finish lips, official/staging spill separation, frozen per-leg results, cumulative standings, host transfer and reconnect/DNF handling are retained.

Scenery uses shared geometry/material caches and instancing; only nearby current/neighbor modules render. Distant debris meshes are hidden without deleting server hazards. Replay replaces course batches and disposes retired buffers. Automated budgets cap active course draw batches and triangles and check bounded replay scene growth. The dump-truck browser preview showed 48 draws and about 56k triangles before the final road-edge trim. This measures scene complexity, not physical iPhone frame rate or heat.

The five-course checkpoint production build and complete local/public suites passed 94 tests, zero failures/skips. Source 4a3048c was verified live as dep-dbhu1hijnfac73cbp0l0 with protocol 12; HTTPS/WSS smoke and browser checks passed before ten-course work began. No Render plan/settings changes; automatic deployment remains off. No Crane or Trivia work.

---

# Milestone 6A — two-course Wheelbarrow Championship

Build **BREAK TIME · Championship 6A**, protocol **11**, October 29, 2026. The separately selectable **Wheelbarrow Championship · 2 courses** preserves the original Course 1 and continues through its existing yard into Scaffold Switchback. Beam Carry and the independent single-race Wheelbarrow option remain available. Refresh both devices after deployment and create a fresh room.

The server owns leg progression, ordered gates, finishing, scoring and the three-second intermission. Finished carts keep normal driving, reload, instability, contact and spill behavior in the common yard. Its next-course gate stays shut until GO. GO resets only the next leg's progress, finish latch, official spill counter and elapsed time; cart positions, rotation, speed, instability, reload, materials, room/session membership and old hazards survive. Both finish strips retain one-way protection, including Course 1's lip after GO. Course 2 has a pipe alley, tighter switchbacks, a rough scaffold straight, overhead tower cranes, exposed buildings and equipment. Obstacles are static in 6A.

Immutable leg snapshots record racing spills and official race time. Staging/intermission/results spills remain physical but are excluded from official totals. Cumulative standings sum completed-leg snapshots; fewest spills wins, combined racing time breaks ties, then final-leg finish order. The Standings control shows cumulative and per-course results; the final board opens after Course 2. Permanently departed racers are marked DNF and rank behind classified finishers. A disconnected unfinished racer remains eligible during the existing 30-second reconnect reservation; expiry or explicit Leave releases the next transition. Host transfer and replay use the existing room lifecycle. Restart resets the entire series; there is no host command to advance an individual leg early.

Shared versioned track data supplies gates, ropes, driveable ground, rough zones, ramp profile and yards to simulation and rendering. Course 2 is authored in local coordinates and placed at Course 1's exit socket (-3, -36), with a 5.6m clear lane, level ground and matching forward orientation. Its final yard ends at (-5, -90). Shared-yard end caps are removed only in Championship; the existing single-race cap remains. Fixed two-course ordering is intentional. The finite city corridor uses shared geometries/materials, instanced building/scaffold/equipment batches, fog, frustum culling and distance-hidden scenery chunks. The existing adaptive resolution budget remains. Physical iPhone heat/frame-rate and cross-network comfort still need the acceptance pass below.

Recovery: **codex/pre-milestone6a-20261029** at **34d2b0a**, plus **Beam-Crew-pre-milestone6a-20261029.bundle** in the ChatGPT project workspace. Prior public deployment **dep-dbhnrouc6qcc73ftgv40** is the October 29 repairs release. Existing untracked helpers were preserved. No additional Render service, plan or settings changes; auto-deploy remains off. No 3/5/10 selection, random ordering, extra eight courses, awards, Crane Challenge or Toolbox Trivia are included. Milestone 6B waits for physical acceptance.

Verified release: gameplay commit **57289523f303e488fe0dcf08f44648f7159d99d6**, Render deploy **dep-dbhsrhu7bikc73fs924g**, live October 29, 2026. Public URL: https://break-time-9n1k.onrender.com . Production build succeeded; complete local and deployed-service suites each passed **85 tests, zero failures/skips**. The real two-client Championship test completed both courses, reconnected during intermission and Course 2, compared frozen leg/cumulative scores and loads, replayed, then switched back to single-race Wheelbarrow. Existing Beam Carry, eight-client/host-transfer, all twelve material spills, finish and reconnect regressions passed. HTTPS/WSS room-code/mode smoke passed. Public health confirms **BREAK TIME · Championship 6A**, protocol **11**, source **5728952**. Browser lobby, Championship materials/standings and rendered local movement were inspected; physical iPhone Safari, sustained heat/frame rate and cross-network comfort remain human acceptance checks. The viewport override did not take effect in the browser, so no new browser-based iPhone emulation claim is made. Post-deploy Render error-log query returned no entries. GitHub Desktop published the source after command-line Git stalled; canceled that stalled push. Temporary local server stopped. Same service/plan/settings, automatic deployment remains off. This verification-only documentation commit requires no redeployment.

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
