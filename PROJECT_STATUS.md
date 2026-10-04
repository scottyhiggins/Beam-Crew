# Beam Crew — project status

Updated October 4, 2026. Current milestone: Milestone 1 preserved; repository migration verification in progress. Milestone 2 has not started.

## Project and architecture
A low-poly browser construction party game for 2–8 players, targeting cooperative beam carrying. TypeScript, Three.js, Node.js, Express and Colyseus. One process serves browser assets and in-memory rooms. Custom deterministic movement; no conventional physics engine, accounts or database.

Canonical local repository: `C:\Users\higgi\OneDrive\Documents\Beam-Crew`, branch `main`. Merge `f5492da` retains Documents initial commit `43ca59d` and Milestone 1 commits `8acbd4c`, `172e5d6`, `133c999`. Backup branches: `backup/documents-initial-20261004` and `milestone1-preserved`. Old Codex project remains intact. No GitHub origin or public repository verified yet.

## Implemented behavior and controls
Room creation, five-character room codes, join links, colored/name-labelled workers, host-only start/return to lobby, host transfer, quick signals and reconnect. WASD moves; Space triggers the placeholder action. Phones use the virtual joystick and ACTION button. LIFT/WAIT/LEFT/RIGHT broadcast temporary signals.

Server receives inputs, never trusted player positions. Simulation runs at 30 Hz; patches at 20 Hz; clients interpolate positions and rotation. Inputs older than 300 ms stop movement. Disconnected slots remain reserved for 30 seconds with neutral input; host transfers immediately. Session-storage tokens restore the same worker on reload. Active tests reject late joins. Server restart destroys rooms.

## Run and verify locally
Node.js 24 and pnpm 11.25.0. Run `pnpm install --frozen-lockfile`, `pnpm build`, then `pnpm test`. For live network coverage, start the server separately and set `TEST_URL` to that server before testing; otherwise the multiplayer test is skipped.

Double-click `Start-BeamCrew.cmd` to build and run production locally on port 2568. Keep its window open. Laptop: `http://localhost:2568`. iPhone: connect to the same Wi-Fi and open `http://<laptop-Wi-Fi-IPv4>:2568`; get the current IPv4 with `ipconfig`. Use separate names, create on the laptop, join by code on the phone, then start. Test movement, action, signals, refresh reconnect, lobby return and host transfer. Allow private-network access if Windows prompts; do not disable the firewall.

Development: `pnpm dev` runs on 2567; browser changes refresh, server changes need restart. Production: `pnpm build`, set `NODE_ENV=production`, then `pnpm start`; `PORT` overrides the listening port.

## Verification and known issues
Canonical-folder frozen-lockfile install, TypeScript checks, production build and all six tests passed October 4, 2026. Live test used a server launched from this folder on port 2571 with eight WebSocket clients; none skipped. Fixed placeholder pnpm build permissions: allow esbuild, disable optional msgpackr-extract native build. Vite reports a large bundle warning; build succeeds.

Original user reports laptop+iPhone acceptance of Milestone 1. This task has not repeated physical-device testing. Current action is still a counter; there is no beam. Movement has no local prediction. LAN HTTP clipboard may fail; displayed join link is the fallback. Guest Wi-Fi isolation/VPN may prevent LAN access. Rooms are in memory; multi-room load and production abuse controls remain untested. Git metadata writes from the assistant remain denied; owner-side Git or GitHub Desktop is required until access is resolved. GitHub publication remains pending.

## Next
Finish Phase 1: commit/push setup and status changes, verify public GitHub origin and clean working tree, confirm canonical repository in GitHub Desktop. Only then build Beam Carry MVP: authoritative beam, eight grip slots, toggle grab/release, combined translation/torque, tunable supported/dragging effectiveness (0.9/0.2), simple doorway/column turn/destination course, checkpoint/reset, clear support and delivery feedback. Preserve lobby/mobile/reconnect behavior. Add deterministic and multi-client tests. Update this handoff, commit/push and stop for laptop+iPhone human playtest; do not declare fun or begin Milestone 3 without user approval. No public game hosting yet.
