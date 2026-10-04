# Beam Crew — Milestone 1

Browser multiplayer foundation for 2–8 workers. One Node.js process serves the browser client and authoritative Colyseus rooms. No physics engine, database, login, or player installation.

## Verification status — October 4, 2026

TypeScript checks and production build passed. All six automated tests passed, including the eight-client real-WebSocket test through the laptop's Wi-Fi address. Two real browser tabs verified room creation/joining, synchronized lobby, entry into the 3D platform, Space action, quick signals, and refresh reconnect. Actual phone joystick/action behavior, cross-device smoothness, and remote public hosting remain unverified and are the next acceptance gate.

## Try it on this laptop and a phone

The server started during development uses port **2568**.

1. Keep the laptop awake. Connect the phone to the same Wi-Fi network.
2. On the laptop, open `http://localhost:2568` in Chrome or Edge.
3. On the phone, open `http://192.168.1.166:2568` in Safari or Chrome. That was the laptop's Wi-Fi address during setup; if it changes, find its IPv4 address with `ipconfig` and substitute it.
4. Enter different names. Create a room on the laptop. Enter its five-character code on the phone and select **Join**.
5. Confirm both names and distinct colors appear on both devices. Only the host should have **Start test**; it requires two connected players.
6. Start the test. Move using **WASD** on the laptop and the left joystick on the phone. Both devices should show the workers moving and turning independently.
7. Press **Space** on the laptop and **ACTION** on the phone. The local action counter should increment once per press. These are synchronized placeholder actions; grabbing a beam comes in Milestone 2.
8. Try **LIFT / WAIT / LEFT / RIGHT**. A temporary message with the sender's name should appear on both devices.
9. Refresh the phone browser. It should reconnect to the same worker and test session. Then turn phone Wi-Fi off for about five seconds and back on (mobile data off for this test). Restore it within 30 seconds. Reconnection starts once the browser detects the disconnect.
10. On the host select **Lobby controls → Return to lobby**. Confirm both devices return, then start again without rejoining.
11. During a test, have the host select **Lobby controls → Leave room**. The other connected worker should inherit host controls and keep the session running.

Report the phone model/browser, whether each step passed, movement smoothness/delay, and any error text. **Stop here: Milestone 2 is gated on the actual-device results.**

If the phone cannot load the page, check that both devices use the same non-guest Wi-Fi and that VPN software permits local network access. If Windows asks about Node.js network access, allow **Private networks** for this trusted home-network test. Do not disable the firewall. A network with client isolation needs another network or public hosting. No firewall or VPN settings were changed by this project.

The server is local; there is no public deployment yet. LAN play does not need Internet hosting or player installations. Share links generated from `localhost` only work on the laptop: open the game using the laptop's Wi-Fi URL before copying a link for the phone. Clipboard access on plain LAN HTTP may be unavailable, so the UI displays the link as a fallback.

## Restart

If the current server has stopped, double-click **Start-BeamCrew.cmd** in this folder. It builds the app and runs the server using the bundled Node runtime when available. Keep the window open; Ctrl+C stops it. If port 2568 is already occupied by the running game, use that game instead of starting another copy.

## Development

Use Node.js 24 and pnpm 11.25.0 (pinned in package.json):

```text
corepack enable
pnpm install
pnpm dev
pnpm build
pnpm test
```

`pnpm dev` compiles the server and runs a Vite middleware development client on port 2567. Client edits refresh normally; server edits require restarting. For production, run `pnpm build`, set `NODE_ENV=production`, and run `pnpm start`. The PORT environment variable controls listening port.

For live integration checks, run a server separately and set `TEST_URL=http://localhost:2568` before `pnpm test`. Without TEST_URL, the network test is explicitly skipped. Tests cover speed caps, bounds, stopping, determinism, schema encoding, and an eight-client lifecycle with movement, actions, invalid/full/active joins, reconnect, host transfer, and replay.

## Structure and behavior

- `client/main.ts`: lobby, desktop/touch input, reconnect, Three.js rendering.
- `client/style.css`: responsive controls.
- `server/index.ts`: HTTP, room-code lookup, WebSocket transport, production/development serving.
- `server/room.ts`: room lifecycle, host commands, validated input, authoritative fixed-step movement.
- `server/state.ts`: synchronized schema; internal input/velocity fields stay server-side.
- `shared/movement.ts`: configurable, deterministic movement math for later prediction and carrying.
- `tests/`: movement/schema unit tests and real-network integration test.
- `render.yaml`: **free** Render deployment configuration.

Simulation runs at 30 Hz and patches at 20 Hz. Clients send inputs, not trusted positions. Workers interpolate server positions and rotations. Initial local movement also waits for server state; predictive movement can be added if actual-device latency warrants it. A fixed-orientation elevated camera keeps joystick directions consistent. Workers are bounded by the platform barriers; falling is outside this milestone.

Disconnected slots are reserved for 30 seconds; neutral input prevents runaway movement. Host controls transfer immediately to a connected worker. Reconnect tokens are stored in sessionStorage for reloads in the same tab; a new tab or cleared storage does not recover the previous identity. After the grace period, the old worker is removed. Late joins are locked during a test. The host may return everyone to the lobby and unlock it. Rooms live in memory; restarting the server ends them. Server capacity across multiple concurrent rooms has not been load-tested. Room creation and matchmaking use framework defaults; production-wide abuse controls are future work.

## Free public deployment

Requires an owner-controlled Git remote and Render account. Neither was configured during this task. Push this project to your chosen Git repository, create a Render Blueprint from it, and verify the service uses **Free**. The checked-in blueprint builds and serves both assets and WebSockets on the assigned HTTPS URL. No database is needed. Test /health, then repeat the laptop–phone checklist on the HTTPS URL, including a phone using mobile data.

Free hosting can sleep and restart; rooms can disappear when the process restarts. Do not switch to a paid plan without the user's approval. Local tests do not establish reliability on a public host or cellular connection.

Synced materials under `sources/` remain read-only references.
