# BREAK TIME

Construction party multiplayer for 2–8 players. Wheelbarrow Race and Beam Carry (exactly two workers per team/beam). The repository and Windows folder remain Beam-Crew.

**Play publicly: https://break-time-9n1k.onrender.com**

Verified live October 27, 2026 on Render: HTTPS, secure WebSockets, room-code/invite-link joining and all 55 automated checks against the public server (zero failures/skips). This runs independently of the laptop. The user confirmed laptop Wi-Fi + iPhone cellular multiplayer and the previous finish fix. The connected staging update requires a fresh device playtest. See DEPLOYMENT.md for the service record and costs.

Hotfix build: **BREAK TIME · Connected finish 1** (protocol 8). After an update, refresh both devices and create a new room.

## Play locally

Close the old server with Ctrl+C, then double-click Start-BeamCrew.cmd. Confirm BREAK TIME. Laptop: http://localhost:2571. iPhone: same Wi-Fi, http://<laptop-Wi-Fi-IPv4>:2571 (find the current address with ipconfig). Keep the launcher open. Create a room, join by code/link, choose mode, Start test. The lobby panel/menu behavior is preserved.

WASD / joystick moves. Space / ACTION grabs/releases your assigned beam end. Beam Carry pairs connected workers in join order; an odd worker spectates. Two workers is a team time trial. Multiple teams race simultaneously without beam-to-beam blocking. The existing doorway and turn course is unchanged.

Wheelbarrow has 12 material choices in six paired categories. Loaded handling is identical; spills create different hazards. Loads now look like cement/sand, pipes/rebar, barricades/coiled hose, bricks/hollow blocks, boards/offcuts, gravel/rubble. Choices lock at countdown. Fewest spills wins; fastest finish time breaks ties. Ordered full-lane route gates validate progress; the cart’s leading edge crossing the painted finish records the finish. The HUD shows route progress. Follow arrows inside continuous rope barriers and ordered server checkpoints.

Finishers drive continuously over a low-profile one-way spike strip into a connected 16m-wide staging yard; there is no teleport or colored pad. The invisible server-authoritative wedge raises carts slightly and blocks reverse course entry. Finished carts use normal handling, can bump/push each other and spill. Official result snapshots never change after finishing. Arriving unfinished carts have priority over parked finishers and ignore staging debris, so playful blocking cannot prevent a finish. Final results open automatically for everyone and the timer stops when all racers finish. Dismiss results to keep driving. Lobby controls are unchanged. The far end of the yard is reserved for future connected-course geometry; Championship mode is not implemented.

## Build and verify

Node 24.19–24.x, pnpm 11.25.0. Run pnpm install --frozen-lockfile, then pnpm test:all. This builds the client/server, starts an isolated local production server, runs every test including multiplayer, and stops that server. pnpm test alone skips six network tests without TEST_URL. pnpm dev starts development. pnpm smoke:public https://<actual-host> checks HTTPS/WSS, room-code joining and both modes after deployment.

Authoritative custom math at 30 Hz, patches at 20 Hz; no physics engine. Hazards cap at 192. Shared rules: shared/wheelbarrow.ts, shared/fences.ts, shared/beam.ts. Rendering: client/main.ts and client/load-visual.ts. Decisions/verification: PROJECT_STATUS.md. Physical device acceptance: PLAYTEST.md.
