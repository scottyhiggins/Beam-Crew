# BREAK TIME

Construction party multiplayer for 2–8 players. Wheelbarrow Race and Beam Carry (exactly two workers per team/beam). The repository and Windows folder remain Beam-Crew.

**Play publicly: https://break-time-9n1k.onrender.com**

Verified live October 27, 2026 on Render: HTTPS, secure WebSockets, room-code/invite-link joining and all 49 automated checks against the public server (zero failures/skips). This runs independently of the laptop. Physical laptop+iPhone/cellular acceptance remains pending. See DEPLOYMENT.md for the service record and costs.

## Play locally

Close the old server with Ctrl+C, then double-click Start-BeamCrew.cmd. Confirm BREAK TIME. Laptop: http://localhost:2571. iPhone: same Wi-Fi, http://<laptop-Wi-Fi-IPv4>:2571 (find the current address with ipconfig). Keep the launcher open. Create a room, join by code/link, choose mode, Start test. The lobby panel/menu behavior is preserved.

WASD / joystick moves. Space / ACTION grabs/releases your assigned beam end. Beam Carry pairs connected workers in join order; an odd worker spectates. Two workers is a team time trial. Multiple teams race simultaneously without beam-to-beam blocking. The existing doorway and turn course is unchanged.

Wheelbarrow has 12 material choices in six paired categories. Loaded handling is identical; spills create different hazards. Loads now look like cement/sand, pipes/rebar, barricades/coiled hose, bricks/hollow blocks, boards/offcuts, gravel/rubble. Choices lock at countdown. Fewest spills wins; fastest finish time breaks ties. Follow arrows inside continuous rope barriers and ordered server checkpoints.

Finishers stay visible and can drive within the staging bounds, strictly beyond the finish line. They cannot re-enter the course, interact with active hazards or finish twice. There is no colored staging pad. Final results open automatically for all clients, with the timer stopped; dismiss results to keep driving. Host uses the unchanged Lobby controls to restart or return.

## Build and verify

Node 24.19–24.x, pnpm 11.25.0. Run pnpm install --frozen-lockfile, then pnpm test:all. This builds the client/server, starts an isolated local production server, runs every test including multiplayer, and stops that server. pnpm test alone skips six network tests without TEST_URL. pnpm dev starts development. pnpm smoke:public https://<actual-host> checks HTTPS/WSS, room-code joining and both modes after deployment.

Authoritative custom math at 30 Hz, patches at 20 Hz; no physics engine. Hazards cap at 192. Shared rules: shared/wheelbarrow.ts, shared/fences.ts, shared/beam.ts. Rendering: client/main.ts and client/load-visual.ts. Decisions/verification: PROJECT_STATUS.md. Physical device acceptance: PLAYTEST.md.
