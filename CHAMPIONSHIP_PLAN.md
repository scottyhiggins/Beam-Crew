# Milestone 6B complete implementation boundary

After the five-course checkpoint passed 94 local/public tests and was deployed, the pool expanded to ten authored local-coordinate modules and enabled host 3/5/10 unique shuffled selections. The fixed accepted 6A 2-course option remains. Module version 2 uses level 5.6m sockets, parallel forward orientation and 16m shared yards; all 90 ordered pairs and all materials/routes are tested. Server-published IDs/seed, generalized leg count and named route display replace two-leg assumptions only for expanded routes. Current/neighbor rendering, cached instances and bounded buffer disposal keep distant sections out of draw work. The existing gameplay/material/network lifecycle is retained. Final awards are outside this focused request; no Crane or Trivia. Physical ten-leg phone acceptance remains the release follow-up.

---

# Milestone 6B checkpoint implementation

The fixed two-course 6A option is preserved. A five-module local-coordinate pool now supports server-selected, unique randomized 3/5 routes. Entry/exit connections remain level, forward-facing, 5.6m wide with 16m shared yards. All ordered pairs are tested. Surfaces, barrier families, static landmark/contact descriptors, drive paths and finish profiles live in shared/course-modules.ts. The server alone chooses and publishes IDs; rendering and simulation use identical assembled transforms. Active/neighbor module culling and cached instances bound visual work. Longer selections stay disabled until their full pool passes tests and the stable five-course checkpoint is deployed.

---

# Milestone 6A implementation boundary — October 29, 2026

Implemented: the fixed Original → Scaffold Switchback two-course Championship; a local-coordinate course contract and continuous level 5.6m-wide socket; shared yard and visible authoritative gate; synchronized three-second transition; permanent debris and material/pose persistence; immutable per-course scores and cumulative standings; disconnect reservation/DNF progression; separate single-race and Beam Carry modes; finite batched city scenery with distance culling. See PROJECT_STATUS.md for validation and PLAYTEST.md for the physical gate.

The roadmap below remains the long-term design. Its former statement that Championship is entirely unimplemented describes the pre-6A release. Random selection, host 3/5/10 choice, the remaining courses, all-order adjacency certification and final awards remain **6B work after physical acceptance**. Do not expose incomplete longer-route options. The current rigid translation/level socket contract deliberately supports future assembly; it does not claim that ten modules or all permutations have been certified.

---

# Wheelbarrow Championship — future architecture

Planning only. No new mode, course, city scenery, Crane Challenge or Trivia is implemented in Visual polish 2. Keep the October 31 competition release focused on accepted, stable gameplay. Advance through the gates below in order.

## Player experience and rules

- A pool of **10 individually designed Wheelbarrow courses**, each with distinct obstacles and scenery.
- In the lobby, the host selects a **3-, 5-, or 10-race Championship**.
- The authoritative server shuffles the course pool once, without replacement, and publishes the selected unique IDs, their order and world transforms. Clients never independently randomize the route.
- The ordered courses form one continuous construction-site route. Each finish/staging yard is the next leg's starting area. Players keep their actual positions: **no teleports, loading screens or scene replacement between legs**.
- Once the last eligible player finishes a leg, the server atomically freezes that leg's official scores and begins a synchronized **3-second countdown**. The next course opens on the server's countdown transition. Clients display server time; they do not decide when a gate opens.
- Keep each player's chosen wheelbarrow material across every leg. Lock selection for the entire Championship.
- Accumulate official racing spills. **Fewest cumulative spills wins; combined racing time breaks ties**. Preserve existing finish-order behavior for an exact final tie unless a different tie policy is accepted later.
- Final results include **overall champion, most spills, and slowest worker**. Define slowest as greatest combined official racing time among classified finishers; list DNFs separately. Show tied award recipients when appropriate.

## Course contract and continuous assembly

Define a versioned data contract for each course: stable ID/version, local bounds, driveable areas, collision/fence geometry, ordered gates, rough zones, start/finish planes, entry and exit anchors, shared staging/start area, scenery instance descriptors and performance budget.

Standardize entry/exit lane width, clearance, ground height/slope, travel direction and minimum staging capacity for eight carts. A connecting staging socket belongs to both neighbors and must never be duplicated or capped by an end fence. Translate course-local data into server world coordinates with the same rigid transform used by the client. Keep the city axis straight by requiring parallel entry/exit orientations; internal courses can wind around that axis. Validate that each module advances sufficiently along it, with no overlapping collision bounds or shared-yard dead ends.

Place the next entry anchor at the previous exit anchor. Design sockets so their elevation and tangent match, with shared visual seam pieces and consistent ground materials. Course boundaries should be invisible to movement and camera follow. Decorative cranes are background scenery, separate from any future Crane Challenge gameplay.

Prove gate geometry at the seam: one-way finish protection must prevent reentry to the completed leg without blocking forward travel. A closed next-leg gate must leave the common staging yard fully driveable. Open it after the countdown; do not reposition carts. Start timing at synchronized GO and keep the start line reachable from anywhere in the shared yard.

## Authoritative state and lifecycle

Proposed server state includes championship ID/route seed and ordered course IDs, contract version, leg index, phase (`lobby`, `countdown`, `racing`, `intermission`, `results`), countdown deadline, per-leg elapsed time/results and per-player cumulative official spills/time/completion status. Evolve the network protocol deliberately when implementing this; do not reuse the current race schema ambiguously.

Keep current input validation, collision and hazard effects authoritative. Partition gates, progress, result snapshots and persistent hazards by leg/world location. Hazards persist in the physical route through the session; completed-leg visuals can be culled, but client culling never deletes server hazards. Reconnect restores route order, leg, countdown, material, position and score ledger.

Freeze each leg once. Sum the per-leg racing snapshots rather than repeatedly adding live counters. Track staging spills separately from official racing spills, following the current frozen-score rule; countdown/intermission time is excluded from combined racing time. Clear only the next leg's progress/finish latch at GO, without resetting cart positions, material or earlier results. Confirm the handling of instability/reload at intermission during the two-course prototype rather than silently changing cart mechanics.

Disconnected reserved players remain eligible during the existing reconnect grace period. A permanently departed racer is DNF for that leg/Championship and must not prevent progress forever. The host cannot individually force an early next leg. Define host transfer, spectators/odd player counts, restart/abandon and DNF ranking before implementing Championship scoring. Proposed default: complete classified finishers rank ahead of DNFs, with partial progress displayed separately.

## One enormous construction project through a city

Build a finite forward corridor with a horizon that suggests continued construction. Place low-poly skyscrapers, partly built structures, cranes, scaffolding and equipment along **both sides**. Give each course recognizable landmarks and distinct obstacle/scenery composition while using a consistent palette, scale, lighting and connection treatment.

Use shared geometry/material caches and `InstancedMesh` batches for repeated windows, columns, scaffold poles, barriers, lumber and skyline blocks. Keep colliders separate from scenery batches. Use fog plus actual distance/frustum culling: fog by itself does not reduce draw calls. Render the current leg, the common yard, the next approach and low-detail distant silhouettes. Prewarm/reuse resources before they enter view; never require a loading screen at the seam. Dispose retired visual batches safely or pool them with bounded memory. Maintain gameplay state even for offscreen hazards.

The assembled route contains at most ten finite courses. Recycle purely decorative skyline clusters beyond the playable corridor to imply an endless city; never recycle a live course, collider, checkpoint or hazard under a player. Measure long-route precision before considering floating-origin rendering, keeping server world coordinates authoritative. Preserve the sharpness pixel budget and mobile fallback. Budget draw calls, triangles, textures, transparent overdraw and memory using a busy eight-player repeated-spill run on physical iPhone.

## Staged implementation and acceptance gates

1. **Two connected courses first:** author two distinct modules and standardized sockets. Prove continuous traversal in both client views, shared staging, finish protection, persistent hazards, reconnect on either side, last-player completion, exactly one synchronized 3-second countdown and next-course opening. No reset/teleport, artificial seam collision, loading pause or score mutation. Physical iPhone acceptance gates further work.
2. **Random ordering and scoring:** publish a seeded unique route, then add host 3/5/10 selection once enough validated modules exist. Verify no repeated course, deterministic transforms, per-leg/cumulative snapshots, material persistence, ties/awards/DNFs, reconnect, host migration and replay. Keep incomplete 5/10 options unavailable until their pool exists.
3. **Expand toward ten:** individually design, playtest and certify each new module against the socket contract. Validate all legal adjacent combinations. Profile 10-leg memory/heat and crowded hazard persistence; optimize scenery batches and culling before adding visual complexity. Release only after the prior gates pass.

Future tests must cover matching ordered routes on all clients, seam bounds/collisions, progress anti-shortcuts, frozen leg scores, staging spills, authoritative countdown under latency/backgrounding, materials across legs, mid-countdown reconnect, permanently departed last racers, unique course selection, final rankings/awards and long-session mobile performance.
