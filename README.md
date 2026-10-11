# Beam Crew — Milestone 4

Browser multiplayer construction game for 2–8 workers. Cooperative Beam Carry, Competitive Beam Carry (two workers per beam), and individual Wheelbarrow Race. No deployment or Milestone 5 work is included.

## Laptop + iPhone

Close the previous server window with Ctrl+C. Double-click **Start-BeamCrew.cmd** in this folder; confirm **MILESTONE 4**. Laptop: http://localhost:2571. iPhone: same Wi-Fi, http://<laptop-Wi-Fi-IPv4>:2571 (find the address with ipconfig). Create a room, join with its code, choose a mode, and Start test. Allow Private network access if Windows asks; keep the launcher window open.

WASD / joystick moves; Space / ACTION grabs or releases in beam modes. Host uses Lobby controls to restart or return to lobby. Competitive teams are assigned by connected lobby join order, one worker per end. Odd worker spectates; Wheelbarrow lets all workers race. Two players is a team time trial. Team beams share the course but do not collide with each other.

Wheelbarrow: choose one of 12 loads before the host starts. Six category columns contain two vertically stacked choices; columns wrap on phones. Choices lock at countdown, duplicates allowed, Bricks is the default. Loaded handling is identical. Only spilled hazards differ. Fewest spills wins, then time. Finished racers remain visible and can move only in the separate green staging area.

## Development

Node 24, pnpm 11.25.0. Run pnpm install --frozen-lockfile, pnpm build, pnpm test. Development: pnpm dev. Production local LAN: Start-BeamCrew.cmd. For network coverage, run a fresh server separately and set TEST_URL=http://localhost:2571 before pnpm test; otherwise six network tests skip.

Server-authoritative custom math, 30 Hz simulation, 20 Hz patches. No physics engine. Material definitions: shared/materials.ts. Handling/hazard tuning: shared/wheelbarrow.ts. Beam math/course: shared/beam.ts. Room flow: server/room.ts. Detailed decisions and limitations: PROJECT_STATUS.md. Human acceptance checklist: PLAYTEST.md.
