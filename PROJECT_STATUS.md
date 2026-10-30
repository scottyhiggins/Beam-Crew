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

# October 29 repairs 1

Build **BREAK TIME · October 29 repairs 1**, protocol **10**. Focused physical-playtest repairs only; Championship/Crane remain unimplemented. Recovery branch `codex/pre-oct29-repairs` and external `Beam-Crew-pre-oct29-repairs.bundle` preserve the prior release.

Reconnect now stores the reservation deadline, bounds stalled transport waits, stops on expired/invalid reservations, exposes Cancel outside the disconnected room panel, releases late successful responses and ignores stale room callbacks. Explicit Leave immediately clears local state and unlocks Create/Join. Offline startup has Retry connection and retries verification on online/visible events. Server host-transfer, capacity, reservation duration and race lifecycle are unchanged.

Solid spill objects retain full loaded dimensions/counts, distributed across the existing six records with individual angles/offsets rather than repeated small stacks. Cement/sand use one full-size heap per load; the other five records have no geometry or contact. Client and server use the same allocation/scatter/contact shapes, including capped aggregation. Geometry audits checked all twelve using actual spill record positions. All six effects, permanent records, effect coefficients and scoring remain unchanged. The footprint of loose loads is intentionally consolidated to the visible heap.

The wheel worker sits 0.7 units behind the cart origin, with lowered grip arms and a pose locked to the rendered cart through turns. A lightweight knee/step/lean reaction uses synchronized race elapsed time plus authoritative instability/reload. Beam worker pose remains unchanged. No extra messages, assets, physics or animation loops.

Final local production build succeeded; all 76 tests passed with zero failures/skips. Render deployment verification follows in the release record. See PLAYTEST.md for the fastest physical acceptance pass. Physical Safari tab suspension, networking and comfort remain human checks.

---

# Playtest corrections 1 — debris alignment and iPhone landscape

Build **BREAK TIME · Playtest corrections 1**, compatibility protocol **9**. Refresh both clients after deployment. No schema, message format, room lifecycle, race rules, scoring, finish/staging rules, material persistence, or effect coefficients changed. Protocol 9 prevents freshly loaded mismatched clients from treating the new shared contact contract as the old renderer-only arrangement.

## Debris is the hazard

Removed the translucent spill rings completely. The client and server now share the exact logical-object allocation, piece offsets/rotation/scale and per-material simplified contact shapes. Empty fractional-object records have no mesh and no collision/effect. Contact normals and separation come from the visible debris shapes rather than the former generic circles. Wet cement/sand match their ten-sided heap footprint; rods/boards/bricks/blocks/barricades use tight rotated boxes; hose and stones use close-fitting circles. A cart's unchanged body radius is included in contact checks. Loose heaps retain one load's total volume, and solid counts remain 2/5/6/4/12 as appropriate. Cached geometry remains bounded; a broadphase avoids detailed checks for distant debris. Permanent records and existing cap aggregation stay authoritative and synchronized.

Removed the persistent debris bounce/tilt that briefly moved a visible hazard away from its active footprint. Cart tipping animation remains. All six effects remain: sticky slowdown, rolling, fixed/blocking, pushable heavy debris, bumpy and rough spill-risk. Ground inspection confirmed no spill rings for all twelve materials. Tests compare rendered vertices to server bounds at normal and aggregated quantities, confirm empty slots have no effect, and verify all six effects on actual contact. Existing fixtures that placed fake hazards in empty slots were corrected; the finishing fixture now places its finisher in the legitimate staging yard rather than on the race course.

## Touch landscape presentation

Dedicated short touch-landscape profile (height at most 540 CSS px and wide aspect), leaving desktop/portrait framing intact. Compact 12px HUD text, smaller world labels, nearby-player name culling, a 92px joystick, 74px action button, and at least 44px menu/close targets. Collapsible standings replace the large persistent ranking text. Final results are a small scrollable side overlay, can be dismissed, and can be reopened with Results. Closer north-up camera with forward look-ahead keeps the player and upcoming route visible while preserving control direction.

`viewport-fit=cover`, dynamic viewport sizing and all four safe-area insets protect touch controls and panels from the notch, home indicator and Safari chrome. Portrait retains its existing layout with safe-area padding; landscape text inflation is disabled without rasterizing HUD text.

Browser QA used controlled 844×390 and 667×375 landscape previews with production markup/CSS/framing. Controls and close button stayed within bounds, results dismissed/reopened, and standings opened/closed. Camera projection tests cover 844×390, 915×412, 667×375 and 740×320 plus unchanged portrait/desktop profiles. User-referenced screenshots were not attached in the received message; these checks do not replace a fresh physical-iPhone acceptance test.

Recovery: branch `codex/pre-playtest-corrections-20261028` at `4370e72`, external `Beam-Crew-pre-playtest-corrections-20261028.bundle` in the ChatGPT project workspace. Prior recovery branches and Visual polish 2 Render deployment remain preserved. Same Render service/workspace/plan; automatic deploys off. No Championship, Crane Challenge or new courses.

Final production build and full local suite: **68 passed, zero failures/skips**, including real two-client spills for all twelve materials. Verified public release: **e1774590d1ec83be8c191e0cfca904c9987791dc**, Render deploy **dep-dbhacc88v5cc73ftrjn0**, build **BREAK TIME · Playtest corrections 1**, protocol **9**. Production build and all **68 tests passed locally and against Render**, zero failures/skips, including all twelve materials across real connected clients. HTTPS/WSS smoke passed. Public browser showed the correct build with no console errors; post-deploy Render error query returned no entries. Same service/settings/plan, auto-deploy off, recovery branch and bundle preserved. Physical iPhone landscape/notch/Safari-chrome acceptance remains the next human check. Documentation-only follow-up needs no deployment. An initial local asset check failed after Windows blocked build-output creation; retrying the build produced the assets. Final clean-run evidence supersedes that attempt.

---

# Visual polish 2 — focused sharpness and spill quantity fixes

Build **BREAK TIME · Visual polish 2**, protocol **8**. October 28, 2026. The accepted Visual polish 1 remains recoverable: branch `codex/pre-visual-polish2-20261028` at `034a68f`, existing `codex/pre-graphics-20261028` untouched, external `Beam-Crew-pre-visual-polish2-20261028.bundle` in the ChatGPT project workspace. Previous live deploy `dep-dbh3fbsipgvc73dm2ju0` used gameplay source `ca5ec18`.

## Sharpness

The old renderer capped device pixel ratio at 1.5 and only resized its buffer on a window resize. Antialiasing was already enabled. The canvas now uses an explicit fixed viewport display size, matching drawing-buffer dimensions, with no CSS transform/filter; resize observation handles orientation/address-bar changes and DPR changes handle zoom/display moves. HUD and menus stay native DOM text, outside the adaptive 3D buffer. The results panel no longer uses a centering transform.

Start at up to 2x DPR, capped at 2 million drawing-buffer pixels on coarse-pointer devices and 5 million on desktop. Two sustained slow 3-second windows lower the resolution multiplier, while thirty seconds of frame-rate headroom raises it gradually. Background gaps reset sampling. Normal laptop rendering never drops below one buffer pixel per CSS pixel; on very large displays the explicit pixel budget still applies. No postprocessing, extra lighting, high-performance GPU request, or native 3x iPhone full-resolution rendering was added. Physical iPhone sharpness, sustained frame rate and heat need acceptance testing; browser viewport tests cannot establish thermal behavior.

## Spill quantities and unchanged difficulty

Root cause: the server correctly emits six hazard records per spill, but Visual polish 1 rendered a whole loaded arrangement for each record. The fix distributes one load across those six unchanged records. Counts: PVC/rebar 5, mini barricades/hose 2, bricks/blocks 6, lumber/plywood 4, gravel/rubble 12. Cement/sand use six smaller patches whose combined modeled volume is one load.

Client allocation is deterministic from ordered synchronized records and `amount`. Each solid object's original mesh parts, shape and colors are retained; cached baked pieces use at most one draw call per record. Empty fractional-object slots have a visible ground spill mark, so their existing collision/effect zones do not become invisible. All six server hazards, radii, material effects, permanent persistence, scoring and synchronization are unchanged. Repeated spills and existing cap aggregation retain quantities; extreme aggregated piles retain a bounded visual representation (up to 12 visible pieces per record), with unchanged server amounts/effects.

All twelve materials were visually inspected loaded versus a complete six-record spill. Automated checks compare total object counts, geometry vertex totals, color histograms, loose volume, cache reuse and capped mixed-material aggregation. A new real two-client test spills every material, compares deterministic presentation on both clients, and verifies reload persistence/reconnect. Initial test-driver fence stopping and stale previous-round reads were corrected in tests only.

## Championship planning only

See CHAMPIONSHIP_PLAN.md: ten distinct modules, unique randomized 3/5/10-course routes, standardized continuous connectors/shared yards, no teleports/loading screens, last-finisher synchronized 3-second countdown, material persistence, cumulative spills/time and champion/most-spills/slowest awards. It covers a finite city construction corridor, instancing/culling/fog and mobile budgets. Implementation gates are two connected courses first, then ordering/scoring, then expansion toward ten. No courses, Championship runtime, Crane Challenge, Trivia or new city scenery were implemented.

Final production build and all **64 local tests passed**, zero failures/skips, including all twelve materials across two connected clients. Canvas buffer/display dimensions matched at desktop and phone viewport sizes with no CSS transform/filter. Verified live October 28, 2026: **BREAK TIME · Visual polish 2**, protocol **8**, gameplay commit **5a6eb1d61be968d601265b55c3eb9b15d9adc4c3**, Render deploy **dep-dbh5h1flk1mc73facagg**. Production build and all **64 tests passed locally and against the public Render server**, zero failures/skips. HTTPS/WSS smoke passed. All twelve materials were spilled across two real connected clients with identical one-load allocations; shapes/colors and total loose volume were checked separately. Render and browser error checks found no entries. The same service/plan/settings remain in use; automatic deploys remain off. GitHub Desktop published the release. Refresh both devices and make a fresh room. Physical iPhone sustained sharpness/frame-rate/heat acceptance is still required. Championship remains planning only. This verification-only documentation follow-up requires no redeploy.

---

# Milestone 5 — Visual polish 1 — October 28, 2026

Build **BREAK TIME · Visual polish 1**, protocol **8**. Connected finish 1 passed the user's five-check acceptance gate. This release changes presentation only: rounded hard hats, faces, reflective vests, boots and walk/carry poses; cart rims, grips, supports and hubs; Beam Carry fasteners; site office, excavator, scaffolding, lumber and trees; grounded scenery, warm lighting, contact shadows and worn ground-painted arrows; compact connected lobby, title, HUD and results styling.

All 12 materials were visually inspected in loaded, spilling and resting states using a temporary local audit (not shipped). Ground hazards now reuse and bake the existing loaded geometry and colors, one cached draw call per hazard. PVC keeps round hollow cylinders/rims; rebar has metal ribs; cement is cool gray; sand/cement keep low piles; barricades, hose, bricks, open cinder blocks, boards, plywood, gravel and rubble retain their silhouettes. A brief client-only spill bounce preserves the server positions and all hazard behavior. A new geometry test checks all 12 identities, finite/bounded geometry and cache reuse.

Final production build and full local suite: **60 passed, zero failures/skips**. Vite reports the existing large bundle advisory (about 189 KB gzipped); no external art/fonts, postprocessing, physics or dynamic shadow maps were added. iPhone physical performance and final visual acceptance require a fresh device playtest. No server gameplay, simulation, scoring, collision, persistence, network schema or protocol changes. No Crane Challenge, Championship or Trivia.

Recovery: branch `codex/pre-graphics-20261028` at `a1845b9`; external `Beam-Crew-pre-graphics-20261028.bundle` saved in the ChatGPT project workspace. Previous public Render deploy `dep-dbgnrek9v7es73avebjg` (source `fc5c981`) remains the recovery deployment. Same service `srv-dbglagdg1s2s73bmg9u0`, workspace `tea-dbgkg8sipgvc73dr3rtg`, unchanged plan/settings, automatic deployment off. Verified public release: **ca5ec181e53453a075910ceb356d310001386c57**, Render deploy **dep-dbh3fbsipgvc73dm2ju0** live October 28, 2026. Public HTTPS/WSS smoke passed; **60 tests passed against Render**, zero failures/skips. Public browser shows Visual polish 1 and no console errors; Render post-deploy error query returned no entries. GitHub Desktop published the release successfully after CLI push stalled. Refresh both devices and create a fresh room for physical iPhone visual/performance acceptance. This documentation follow-up needs no deployment; auto-deploy remains off.

---

# Connected finish verified publicly — October 27, 2026

Public play: https://break-time-9n1k.onrender.com . Build **BREAK TIME · Connected finish 1**, protocol **8**, source **fc5c9815a56be44c8990cd6f1d38f6a4eb99b77e**, Render deploy **dep-dbgnrek9v7es73avebjg** confirmed live. Gameplay commit pushed via GitHub Desktop. Same single approved service, plan and workspace; no billing/configuration changes. Auto-deploy remains off.

- Final local production build/full suite: **59 passed, zero failures/skips**.
- Public HTTPS/WSS smoke and full suite against Render: **59 passed, zero failures/skips**. Real two-client tests cover continuous finish/staging movement, post-finish spills with identical frozen official scores, stopped elapsed clock, reconnect/restart, material choices, ropes/checkpoints, eight clients and Beam Carry. A prior local Beam network timeout passed on clean rerun and publicly; Beam gameplay was not changed.
- Browser keyboard play on the local production build verified natural crossing at speed, connected yard, visible segmented spike strip, staging spill/reload with official 27.87s/0-spill result unchanged, and reverse blocking. Screenshot saved outside the repository as BREAK-TIME-connected-finish.png. The public browser loaded the new label and compatible server; screenshot BREAK-TIME-connected-public-version.png.
- Post-deploy Render error-log query returned no entries. Test rooms/temporary local server were cleaned up; public browser left at the new build lobby.
- Human acceptance remains: refresh laptop and iPhone, confirm Connected finish 1, create a fresh room and run the new PLAYTEST.md checklist. Check ramp appearance/rise and phone performance, natural finish motion, bumps/spills, reverse blocking, both final boards and score freezing on separate networks.

This verification follow-up changes documentation only; publishing it does not require another deployment. The gameplay release is already public. No Championship, second course, Trivia or Crane work was added.

---

# Connected finish update — October 27, 2026

Build **BREAK TIME · Connected finish 1**, protocol **8**. Previous public finish/scoreboard/timer/ropes and laptop Wi-Fi + iPhone cellular multiplayer accepted by the user. Recoverable prior version: `backup/before-connected-finish-20261027`.

Removed finish teleport and stopped resetting movement on finish. Full normal cart physics/reload/spills continue in racing and results, while official RaceResult snapshots and final elapsed time remain frozen. A shared mathematical invisible wedge provides the visible rise and a server-enforced one-way lip; decorative segmented plates/spikes/bolts have no individual colliders or tire damage. During partial crossing a finished cart cannot retreat, and after clearing it stays entirely on the staging side. No physics engine added.

The original approach ropes are clipped at the strip and connected through a short neck to a 16m-wide, 16m-deep yard. No cap, separate pad or relocated spawn. Its far boundary can join a later race; no Championship logic or extra course implemented. Finished carts bump and yield to unfinished arrivals. Stage debris is ignored by unfinished carts to prevent permanent finish blocking. All 12 materials, 192-pile cap, checkpoint scoring, automatic board and Beam Carry preserved. Pair contacts are bounded O(8²); rendering reuses spike/bolt geometry and materials.

Tests cover exact continuous pose/speed at finish, traversable ramp and blocked reverse, preserved approach ropes/open neck, post-finish spills/reload and immutable official scores, pushable contacts, real two-client staging spills/results/reconnect/replay, materials, eight clients and Beam Carry. Browser keyboard play verified continuous finish travel at speed, staging spill/reload with an unchanged official 27.87s/0-spill result, and reverse blocking. Final local production build and complete suite: **59 passed, zero failures/skips**. One earlier Beam Carry network run timed out while browser QA was active; the unchanged Beam test passed in the clean final suite. Deployment and public verification completed; see the current record above. Physical laptop+iPhone acceptance of this update remains pending; see PLAYTEST.md.

---

# Finish hotfix verified publicly — October 27, 2026

Live URL: https://break-time-9n1k.onrender.com . Render deploy dep-dbgmodflk1mc738vl3q0 is live with source **bca25d93e1558c3eafa700cafa5a6fcc9135f375**, build **BREAK TIME · Finish fix 1**, protocol **7**. The source fix is pushed to GitHub. Existing approved service/plan/ropes/course/modes are unchanged.

- Local isolated production suite: **55 passed, zero failures/skips**.
- Public HTTPS/WSS smoke and complete suite against the Render URL: **55 passed, zero failures/skips**, including the exact formerly missed fence-line route with two clients, matching times/spills/ranks, frozen clock, staging containment, reconnect and reset. Beam Carry and material/rope coverage pass.
- Actual public browser race completed with a second network client. Before the browser racer finished, the first racer's 18.07s/0-spill result appeared provisionally. On the browser's finish at 128.70s/0 spills, the Final results panel opened automatically with both rows and correct ranking. The race clock remained 128.70s after waiting and driving in staging.
- Phone-width emulation: viewport 390x844, results panel x=12..378, y=90..385; both scores and the dismissal button fit. This is browser layout verification, not physical iPhone acceptance.
- Dismissed the panel and held movement toward the course: the finished cart stayed behind the stripe in staging, with unchanged time/results. Cleaned up the test room and left the public page at the new build's lobby.
- Public runtime error-log query since this deploy returned no entries. Browser proof saved outside the repo: BREAK-TIME-fixed-scoreboard.png and BREAK-TIME-fixed-scoreboard-phone.png in the chat workspace. Use the normal-size screenshot for the clearest preview.

Next human action: refresh both devices, confirm Finish fix 1 and create a fresh room, then repeat the formerly failing fence-line finish on laptop Wi-Fi + iPhone cellular. No account/hosting changes are needed. Any follow-up documentation-only commit can be published through GitHub Desktop Push origin; auto-deploy stays off and the gameplay fix is already deployed.

---

# Wheelbarrow finish hotfix — October 27, 2026

User's physical public test confirmed laptop Wi-Fi + iPhone cellular multiplayer and ropes work. They found legal races had no finish/scoreboard. Treat this report as the acceptance finding; earlier automated passes did not cover ordinary fence-line paths.

## Reproduction and cause

Reproduced using the unmodified production math: drive from the start via (-4.3,1), (-4,-0.3), (-3.6,-1.2), (0,-5), then the remaining existing course. Every simulated position stays on course and respects the existing fences. The closest approach to the first hidden checkpoint is 2.5197587m, outside its 2.4m circle. At (-3.002,-19.940), checkpoint remains 1 and finishOrder stays 0. Thus crossing the visible finish cannot record a result. The old test driver aimed at checkpoint centers and therefore concealed this failure.

## Fix and decisions

- Replace circular bend targets with ordered full-lane crossing gates at the start straight, diagonal exit and finish approach. The short overlapping hairpin has no invisible apex requirement. Existing course, rope geometry, barriers, controls, materials and Beam Carry are preserved.
- Last gate is the painted finish at z=-18. The server detects a continuous forward crossing by the cart's leading edge, including crossings near either lane edge. It latches the validated crossing in a server-only field, then records finish time/order/spills once in the same tick. Static positions beyond the line, backward crossings, out-of-lane crossings and skipped route gates cannot finish.
- Existing result reconciliation now receives real finish records. Fewest spills remains primary, fastest finish time breaks ties. First finisher continues moving only in isolated staging; others keep racing. Last finisher freezes elapsed time and publishes final ranking to all clients. Reconnect preserves results/staging; restart clears the crossing latch, checkpoints and results.
- HUD shows route gate progress and the next required gate. Final results are announced through the existing panel. Build label BREAK TIME · Finish fix 1, protocol 7: refresh both clients and create a new room after deployment.
- Ranking/staging unit fixtures explicitly model an already validated crossing; detection is independently exercised by real movement and network tests. Drivers follow route waypoints independently of server checkpoint indices.

## Verification and delivery

pnpm test:all passed: **55 tests, zero failures/skips**, including seven live network tests against an isolated production server. Added five deterministic exact-failure/crossing tests and one two-client fence-line race that verifies identical scores, frozen time, staging containment, reconnect and reset. Legacy multiplayer, material selection/spills, ropes and complete Beam Carry pass. Build/TypeScript and diff formatting pass; the existing bundle-size warning remains.

This section records the tested implementation before public rollout. Public deploy ID, source commit and protocol/build verification will be recorded after deployment. Do not call the public fix verified until the actual service is redeployed and the new fence-line regression passes there. No Championship, second course or unrelated lobby changes.

Backup branch backup/before-finish-fix-20261027 preserves 29a63be. Existing untracked helpers/work remain untouched. Public service remains srv-dbglagdg1s2s73bmg9u0, approved single paid instance; reuse it for the hotfix.

---

## Historical notes (superseded above)

# BREAK TIME is public — October 27, 2026

**Verified playable URL: https://break-time-9n1k.onrender.com**

Render service srv-dbglagdg1s2s73bmg9u0 is live in the confirmed My Workspace, Oregon, one 0.5c-512mb instance on the explicitly approved approximately $7/month base plan. User reported $0 credits and added payment details directly to Render. Budget remains $10/month; no extra services were created. Auto-deploy off; /health configured. Live deploy dep-dbglie6gekts73897epg serves gameplay commit e57c254d04de9cdd195712e6419e910321ce2aa4.

Production build/TypeScript passed on Render. HTTPS/WSS public smoke passed. **Full public-server suite: 49 passed, zero failed/skipped**. Browser smoke also verified two clients, room invite link, material selection, countdown and rendered carts/course/rope. Runtime error query was empty; observed small-load CPU/memory usage remained well inside the approved plan. Details, deployment fix, service settings and repeatable verification commands are in DEPLOYMENT.md.

Public-network testing exposed assumptions in local test scripts: initial/reconnect state was read too early, one-sided resets were asserted before the other peer synchronized, and a beam driver braked too late with WAN latency. Tests now wait for both peers and use feedback braking. Production gameplay logic was unchanged during these test refinements.

Remaining human checks: physical iPhone portrait/landscape, cellular joining while laptop server is off, simultaneous-team readability, long-run touch performance and fun/balance. Browser smoke observed the existing explicit Leave sometimes showing a reconnect message; refresh returns to the lobby. No lobby behavior changes were made; record this for a focused follow-up rather than mixing it into deployment. No Milestone 5, championships, briefing, new courses, trivia, crane or economy implementation.

Backup branch and external recovery bundle remain intact. Gameplay source e57c254 is pushed; follow-up deployment/test/docs commits may require GitHub Desktop Push origin if CLI authentication remains unavailable. Keep the existing untracked helpers/work folder untouched. Updating docs/test files does not require restarting the live server.

---

## Historical implementation and preparation notes (superseded above)

# BREAK TIME — October 27, 2026 competition preparation

This section supersedes historical milestone restrictions below. The user explicitly authorized gameplay fixes, the BREAK TIME title and public deployment preparation. Public service activation is still pending account access/credit inspection and the user's explicit paid-service approval. Budget up to $10/month, use credits first. No service was activated; no public URL is verified.

## Recovery point and scope

Before editing: main at 31e85bf, no tracked changes. Preserved branch backup/pre-break-time-20261027 and an external Git bundle at C:\Users\higgi\.codex\.chatgpt-projects\g-p-6ac291cf8ecc81919bbc636308fbf05d\Beam-Crew-pre-break-time-20261027.bundle. Existing untracked Finish-BeamCrew-PlaytestFixes.cmd, work-guest.mjs and work/ were left untouched. No reset, clean, history rewrite or folder/repository rename.

## Implemented decisions

- Public Beam Carry now exposes only two-worker teams. Legacy mode value beam maps to competitive; no more shared eight-worker beam option. Accepted movement/turn/support/drag math and the current doorway/column course are unchanged. Multiple teams, assigned opposite ends, odd-player spectator, disconnect reservation, DNF, team places and replay remain. Restart increments synchronized race generation so clients reset interpolation/input reliably.
- Twelve material choices now produce real low-cost load silhouettes: slurry/heap, cylinders, mini barricades, coiled torus hose, bricks/hollow blocks, boards/sheets and polygon stones. Generated geometry bounds and shape types are tested. Shared cart tuning and all six spill behaviors are preserved. Cart/worker geometry, materials and label textures are disposed when removed/restarted to prevent GPU resource accumulation.
- Continuous rope follows the exterior of the existing corridor, including curved joins/caps; interior bend edges are clipped away. Rendering uses a single line-segment object. The same bounded 139 fence segments enforce server body/tray collision, alongside existing pylons, corridor and ordered checkpoint validation. No new course was added.
- Finished workers/carts remain visible and movable before and after final results. Server staging x −6..1, z −27..−22 keeps the complete cart strictly behind the finish at z −18 in every direction. Finish identity/time never changes, no course hazards interact with finishers, and finished loads settle. Removed the extra colored pad; expanded the normal construction ground to cover staging.
- Result reconciliation publishes finish/ranking/round state in the same server tick and after permanent departures. Reserved disconnects still have 30 seconds to resume. Final race elapsed time freezes when the last remaining racer finishes (or an unfinished racer permanently departs). Fewest spills wins; elapsed finish time breaks ties.
- A separate responsive final-results panel opens from synchronized state automatically for every client, including iPhone, and after reconnect. Dismiss it to keep driving in staging. No lobby-panel/menu-open behavior was changed. A new round clears the panel dismissal. Players' names are rendered as text, not inserted HTML.
- BREAK TIME title in browser/game/launcher; repository and folder unchanged. Protocol 6 rejects stale builds. Earn & Unlock and all requested future modes/briefing/championship/art are documentation only in FUTURE_FEATURES.md.
- Ready Render configuration: single always-on Node Web Service, current 0.5c-512mb compute, Node 24.22.1, /health, native PORT, auto-deploy disabled. HTTPS/wss origin logic was already correct. No database, tunnel, laptop dependency or extra replicas. DEPLOYMENT.md records account/budget/credit blockers and exact deployment/verification steps.
- pnpm test:all now builds, starts an isolated production server, runs the entire test suite and stops it. GitHub CI uses that same command. pnpm smoke:public checks a real supplied HTTPS URL and two-client secure WebSockets after deployment; it must not be reported passed before a public host exists.

## Verification

Baseline: 38 tests passed, six network tests skipped without a server. New deterministic checks cover actual load meshes, fence gaps, all staging directions, frozen time, result ordering and permanent departure. Final full-suite outcome and Git status are recorded in the completion section below. Build retains the existing Three.js bundle-size warning.

No physical iPhone acceptance or account credit balance has been claimed. Native Windows browser inspection stopped because its helper could not verify the current browser URL; that session was left alone. The in-app Render login required GitHub sign-in. Complete Render account connection, inspect credits and obtain paid activation approval before deployment. Use PLAYTEST.md for physical-device acceptance and DEPLOYMENT.md for public verification.

---

## Historical project notes (superseded by the current section)

# Current status — October 11, 2026

Milestone 4 is implemented under the user's explicit authorization. Milestones 1–3 remain available; Milestone 2's previously recorded personal acceptance stands. Milestone 3/4 personal acceptance remains pending. Do not start Milestone 5 or deploy.

## Milestone 4 decisions

- Separate Competitive Beam Carry mode preserves the accepted cooperative eight-grip mode. Connected players are paired in lobby join order on every restart: two workers, one assigned grip at each end (indices 0 and 7), one independent server beam per team. Two players is a time trial; 4/6/8 gives 2/3/4 simultaneous teams. Odd last player spectates, explicitly directed toward Wheelbarrow for an all-player round. A disconnected teammate releases its grip and may reconnect within the existing 30-second reservation; permanent departure marks the incomplete team DNF. No substitute during a round.
- Teams share the existing bounded doorway/column course. Beams and workers from other teams do not collide; this preserves phone performance and prevents blocking/griefing. Team name, members, arrival place and elapsed time are synchronized. Countdown prevents movement; delivered beams cannot finish twice. Equal simulation-tick deliveries use team assignment order. Host restart reassigns teams and clears results. Cooperative reset remains available only in cooperative mode.
- Twelve loads, six category columns with two choices vertically stacked: wet cement/sand (sticky); PVC/rebar (rolling); mini barricades/drainage hose (fixed); bricks/cinder blocks (heavy pushable); scrap lumber/plywood offcuts (bumpy); gravel/concrete rubble (rough). Grid wraps to three columns under 700px, two under 380px; each category remains intact. Labels, selected state and accessible pressed state included. Default Bricks; duplicates allowed; server accepts only integer IDs 0–11 in lobby. Start locks choices through countdown/race/restart; return to lobby to change. Loads persist across reloads.
- Base cart acceleration, speed, steering, risk and threshold are identical for all twelve materials. Server spill contact math implements six behaviors: sticky exponential braking; rolling mobile debris with low damping; immovable fixed debris; slower heavy movable debris; nonmoving bumpy risk debris; wider rough risk patches. Each pair shares behavior, with different names/colors. Lightweight box silhouettes are intentional; detailed material art and spray-painted arrow polish remain deferred. Existing simple arrows remain.
- Hazards persist through reload/reconnect/departure, reset on restart, and cap at 192 objects. At the cap spills aggregate into nearest matching material (amount capped at 9999); a material with no existing matching pile produces no additional object at cap. No cross-material conversion, pile-pile physics or unbounded growth. Footprints never grow with aggregate count. Rendering reuses shared spill geometry and 12 materials.
- Finishers transfer immediately to an isolated green staging area, x −6..1, z −27..−22; movement is capped at 2.5 units/sec and clamped there. Visible carts/workers remain movable during racing and final results. No hazards, course collisions, risk, spills or repeat finishes are evaluated for them. Results retain spill-first ranking and immutable finish time; unfinished racers continue without a forced timeout.
- Wheelbarrow retains ordered checkpoints, corridor containment and shared solid edge posts. Beam delivery now requires a checkpoint earned by crossing the doorway threshold, rather than merely being beyond it. Inputs remain bounded and expire after 300 ms. Protocol 5 rejects stale servers; launcher and page identify Milestone 4.

## Verification and remaining human work

Production build and TypeScript pass. The existing Three.js bundle size warning remains. Automated coverage includes legacy full courses/lobby/reconnect, paired assignments for every count 2–8, odd spectators, independent team movement/results/DNF, locked/duplicate/invalid choices, identical loaded handling, six hazard behaviors, 1000 mixed spills bounded at 192, finish movement/isolation, and checkpoint bypass prevention. Final full-suite totals are recorded below after verification.

Browser smoke check confirmed the Milestone 4 label, three mode choices, rendered selection states and vertically paired categories at narrow phone-sized width. This does not establish physical iPhone performance or fun. Human testing must cover four simultaneous teams, readability at common phone sizes, crowded start fairness, all material impacts, long repeated-spill phone performance, latency, and finish staging. See PLAYTEST.md.

Git inspection found main tracking origin/main and existing untracked Finish-BeamCrew-PlaytestFixes.cmd, work-guest.mjs and work/. These are unrelated local artifacts and are excluded from this milestone commit. No reset, clean, deletion, history rewrite, deployment or source-mirror edits were performed.

---

## Historical Milestones 1–3 notes (superseded where stated above)

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
- Colored wheelbarrows, front wheel/handles, worker pushing pose, visible brick load, wobble/lean, tipping and persistent movable course bricks on spill, automatic reload at the same position/heading. YOU label, countdown, speed/risk/spill HUD and spill-first finish results. Host can restart without refresh or return to lobby to switch modes.
- Existing WASD and mobile joystick. Direction indicates desired heading; cart turns gradually. Release to brake/recover. Keyboard feathering and partial joystick travel provide careful driving. Laptop/mobile fairness and fun require the personal test.
- Existing room codes, host transfer, no late joins, 30-second reconnect and input expiry remain. Disconnected carts brake; reserved racers can resume, and do not prematurely end the race. Results survive a finisher leaving; next-place numbering remains monotonic.

### Wheelbarrow tuning

All gameplay tuning is in shared/wheelbarrow.ts, WHEEL_CONFIG and WHEEL_COURSE (world units, seconds, radians). Maximum speed 5.5, acceleration 3.8, braking 7, steering cap 2.8 radians/sec. Instability adds speedGain .24 × speedRatio³, turnGain .65 × absolute turnRate × speedRatio², plus roughGain 1.35 × speedRatio² inside shared WHEEL_ROUGH bounds regardless of checkpoint; recovery subtracts .3/sec. Physical impacts add .65 × normalized normal impact speed² (material multiplier .6), brake and separate/deflect the cart. Risk threshold 1; reload 2.4 sec; countdown 3 sec; corridor radius 2.8; checkpoint radius 2.4. Full-speed smooth straight driving is safe; turning, rough ground and impacts can spill. Server flow: server/room.ts; synchronized fields/results/material: server/state.ts; render/HUD: client/main.ts.

### Verification and limits

TypeScript and production build pass; the Three.js bundle-size warning remains. Full automated suite: 24 tests with live TEST_URL, none skipped, including all 16 existing tests and deterministic Wheelbarrow risk/recovery/threshold/reload/independence/roughness/checkpoint/finish/full traversal plus a two-client countdown/authority/reconnect/finish/restart/mode-switch run. Final verification is recorded by the completion response. Browser inspection covers two rendered independent carts, course and HUD; personal iPhone testing is pending.

This is deliberately lightweight custom math: no rigid-body physics, individually simulated spilled bricks, prediction, awards, persistent results, public hosting or final art. Finish position uses the worker/cart origin. Larger lobbies use two starting rows, so eight-player start fairness needs further tuning. No dedicated spectator system; an unfinished connected racer keeps the race active until finishing or the host restarts. Identical-tick ordering favors join order. Race data lives only in memory and resets on restart. Desktop has binary keys while joystick supports analog throttle; compare fairness during the personal test.

See PLAYTEST.md for simple start, URLs, mode selection, controls and risk-versus-reward checks.

## Next and stop condition

### October 4 recovery: stale production server

Recovery inspection confirmed local HEAD and live GitHub main remained at `4343e2a`; no subsequent commit had been saved or pushed. The interrupted troubleshooting left uncommitted startup/version safeguards and a temporary `work-guest.mjs` diagnostic script. Useful safeguards were retained; the temporary script remains local and untracked.

Port 2571 was held by Node PID 27972, started at 5:30 PM before the 6:36 PM Milestone 3 commit. Its health response was only `{ok:true}`, while it served rebuilt Milestone 3 browser assets from disk. The stale in-memory server could therefore remain on Beam Carry despite newer assets. The user closed that exact PID. Replacement server health identifies protocol 3 and the canonical repository, and is reachable through both localhost and Wi-Fi `192.168.1.166`.

The launcher now checks port availability before building, shows the repository and milestone, and explicitly refuses to appear to start over an existing server. Production assets resolve relative to the compiled server rather than its working directory. HTML/health responses disable caching; the browser verifies server compatibility with a five-second timeout, displays the milestone, and drops old reconnect tokens when the server restarts. Host recovery controls explicitly label returning to the lobby to change modes. Mode selection remains host-only and available before Start test; use Lobby controls → Return to lobby / change game mode during a game.

Recovery verification: TypeScript checks and production build pass; **27 tests passed, zero skipped**, against the fresh server at 2571. Coverage includes both complete Beam Carry and Wheelbarrow courses, host mode selection, Wheelbarrow countdown/reconnect/results/restart and switch back to Beam Carry, served production selector assets/build identity, and available/occupied launcher ports. The existing Three.js bundle-size warning remains. No new computer-control session was used. Laptop + iPhone personal Wheelbarrow acceptance remains pending; Milestone 4 is not authorized.

Stop after Milestone 3 implementation, testing, commit and push. Await the user’s laptop + iPhone personal playtest and explicit acceptance. Do NOT mark Milestone 3 personally approved and do NOT begin Milestone 4. Production hosting remains deferred.

## Milestone 3 personal playtest fixes — October 4, 2026

The user personally tested Wheelbarrow Race on laptop + iPhone, confirmed the core mechanic works and liked tipping/instability, but requested this fix pass before approval. Milestone 3 is NOT approved. Scope is gameplay obstacles, persistent movable spills, independent finishes, construction wayfinding and spill-first scoring; Beam Carry and the camera are preserved.

- Course edge posts now use shared server/render geometry. Posts crossing the adjoining lane at bends are removed so the route remains traversable. Impact severity controls braking, separation/deflection and added load risk; corridor-edge impacts also brake and destabilize. Shared rough bounds affect all racers regardless of checkpoint and create more risk at speed.
- Each spill deposits six synchronized movable brick piles, persisting through reload, disconnect/reconnect and racer departure for the rest of the race. Hits push piles with capped velocity and damping; no physics engine or cart-to-cart shoving. At 192 piles, further bricks merge into the nearest pile's material count rather than vanishing. Pile footprint remains small and visual height is capped. Restart clears the course. Piles do not collide with one another; this keeps costs bounded for eight racers.
- Arrival order/time/spills are recorded independently of placement. Results rank **fewest spills first, then fastest finish time**, with arrival order breaking exact ties. Reload delay remains part of elapsed time but there is no scoring conversion from spills to time. Provisional ranks may change as later racers finish; the UI explicitly states the hierarchy.
- The first finisher waits while unfinished racers continue. Finished workers/carts are hidden and skip gameplay simulation. Reconnect reservations remain; results survive a finisher leaving. The round ends when all remaining racers finish. `postFinishTimeoutSeconds` and `firstFinishAt` support a grace period; zero disables it by default, so no premature cutoff is enabled.
- Floating numbered tutorial signs are replaced by painted directional arrows, yellow/black edge posts and caution markings, rough strips and a finish stripe. Lobby controls hide touch steering and clear movement input so the joystick cannot cover mobile menu buttons. Camera behavior is unchanged.
- The existing mode handler is registered in current source and worked during fresh launch/tests. The earlier unregistered-mode warning is consistent with the diagnosed pre-Milestone-3 stale process. No `ined` command exists in the launcher; its line endings are normalized to CRLF and `.gitattributes` enforces that for command files. Fresh launch and multiplayer/UI checks emitted neither reported error. The existing Vite bundle-size warning remains.

Verification: TypeScript check and production build pass. **35 automated tests pass, zero skipped**, on the launcher-started production server at temporary port 2573. New coverage includes severity-dependent obstacle impacts, spatial rough risk, material pushing/persistence/cap/reset, live synchronization/reconnect of spills, independent two-racer completion, and a slower clean finish beating a faster spilled finish plus equal-spill time ties. Existing Beam Carry full-course and eight-client lifecycle tests pass. Separate headless desktop and mobile viewport checks passed Wheelbarrow selection/countdown/rendering/scoring guidance and return to Beam Carry; screenshots were inspected. This is not a replacement for the user's fresh physical iPhone playtest. Protocol is bumped to 4 to reject older running servers.

## Milestone 4 final verification — October 11, 2026
Production TypeScript/build passed. Full live suite on temporary localhost port 2574: 44 passed, zero failed/skipped, including all six network tests. Final symmetric rolling-damping correction was rebuilt and validated by 20 targeted deterministic milestone/hazard/course tests, all passed. Git diff --check passed. Physical laptop+iPhone acceptance remains pending; no deployment.


## Competition-pass final verification — October 27, 2026
- pnpm test:all: build and TypeScript passed; 49 tests passed, zero failed/skipped, including all six live network tests on an isolated local production server. Test server stopped automatically.
- Full beam course/drag/rotation/reconnect/replay, eight-client lifecycle, Wheelbarrow finish/results/timer/staging/replay, persistent spills and all new geometry/fence/result checks passed.
- Deployment helper syntax checks and git diff --check passed. External recovery bundle verified complete history.
- Existing Three.js bundle-size warning remains. Physical iPhone rendering/performance and public HTTPS/WSS verification are pending.
- Render service not activated. Authenticated workspace/credit inspection and explicit paid activation approval still required. Windows browser automation stopped because the helper could not establish the current URL with enough confidence. No credit eligibility or public URL claimed.


## Render activation and first build — October 27, 2026
The user confirmed My Workspace (tea-dbgkg8sipgvc73dr3rtg), reported $0 credits, explicitly approved one approximately $7/month 0.5c-512mb service within a $10/month budget, and added a payment method. Created only srv-dbglagdg1s2s73bmg9u0 in Oregon, one instance, auto-deploy off. Source e57c254 is verified on GitHub. Assigned URL https://break-time-9n1k.onrender.com is NOT yet a verified playable URL.
First deploy dep-dbglaglg1s2s73bmgb0g failed at corepack enable: EROFS unlink /usr/bin/pnpm. No game compilation occurred. The corrected build command invokes corepack pnpm directly and is saved in render.yaml/DEPLOYMENT.md. Existing-service build-command and HTTP health-check updates are not exposed by the connected Render tools; the user was asked to set the command and /health in Dashboard Settings. Reuse this same service; do not create another paid resource. After settings are corrected, trigger and verify a fresh deploy. GitHub connector writes returned 403; use normal Git push or GitHub Desktop if necessary.
