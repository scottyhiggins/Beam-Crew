# Beam Carry — focused next-course plan (planning only)

Championship/UI status: Milestone 6C fixes and polished UI are implemented; release validation is recorded in PROJECT_STATUS.md and DEPLOYMENT.md. This document adds no Beam gameplay. Wait for Championship/UI physical acceptance before beginning another gameplay milestone.

## Existing implementation reviewed

shared/beam.ts defines the current 20×20 yard, 6.4-unit beam, doorway at z=1.5, one post-door checkpoint, a deliberate ninety-degree turn and a 0.7-second delivery hold. Motion at 30Hz combines two assigned end inputs with support-dependent dragging, bounded torque, oriented collision and short deterministic substeps. server/room.ts assigns exactly two workers per team (ends 0/7), spectators for odd counts, independent team beams, host-only resets/restart, reconnect reservation and DNF. Existing client HUD makes grip/end/team state visible. Beam-to-beam blocking is absent and should stay absent.

## A longer construction delivery

Target a clear two-to-three-minute cooperative route, initially one fixed route with three readable sections. Keep the accepted short course recoverable and selectable during development.

1. Loading bay: wide practice straight, existing doorway/turn mechanics and an obvious first checkpoint. Teach matching inputs and deliberate rotation before hazards.
2. Active haul crossing: a narrow, clearly painted crossing with one unloaded low-poly forklift moving side-to-side. Flashing warning lights and a visible approach zone give at least two seconds of notice. A waiting pocket must fit the complete beam plus both workers. Every cycle leaves enough safe crossing time for an ordinary supported beam; an idle team cannot be permanently trapped.
3. Scaffold delivery: wider dogleg through static pallet racks, second checkpoint and a generous final alignment bay. Retain a short delivery hold. Add a second moving obstacle only after the single crossing is reliable on physical devices.

## Implementation boundaries for a future milestone

Extract a versioned Beam course descriptor shared by simulation and rendering: bounds, obstacle footprints, ordered progress gates, spawn/checkpoint poses and delivery bay. Extend beam/worker collision queries to accept that descriptor; preserve handling coefficients and the existing tests as the short-course fixture.

The server owns obstacle phase/pose and advances it only during racing. Publish a route ID and movement phase/clock sufficient for clients to render the same crossing; never accept client obstacle contacts or timing. Use relative-motion substeps/sweeps for both beam and carrier contacts, including a moving obstacle hitting a stationary beam. Begin with non-damaging solid stop/wait behavior and a reliable clear cycle, rather than forced shoves, crush states or new penalties. Reconnect restores the current obstacle phase; resets cannot desynchronize another team's course.

Retain exactly two workers per beam, independent teams, existing join/code/invite/host rules, odd-worker spectator behavior, grip proximity, release/reattach and reconnect. No team-to-team collision or changes to Wheelbarrow/Championship. Batch static scenery and reuse one small moving vehicle group; no extra physics engine, dynamic shadows, textures or postprocessing.

## Acceptance gates

First certify the longer static route with two natural driver inputs for every turn, carrier-clearance boundary and checkpoint reset. Then add the single crossing and deterministic tests for all approach phases, stationary-beam contacts, full-width clear windows, reverse attempts and no tunneling. Test two teams simultaneously, odd spectators, reload/reconnect in the warning and crossing phases, host migration, DNF and replay through real clients. Confirm collision matches the visible forklift on both devices. Keep the current course until laptop/iPhone physical timing, readability and performance pass. Report that checkpoint before adding a second moving obstacle.
