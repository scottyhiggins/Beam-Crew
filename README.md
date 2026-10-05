# BEAM CREW

Low-poly browser multiplayer construction game for 2–8 players. Milestone 2 adds cooperative Beam Carry: carry one steel beam through a doorway, turn around a column and deliver it to the green destination. No player login or install.

Public source: https://github.com/scottyhiggins/Beam-Crew
Canonical local folder: `C:\Users\higgi\OneDrive\Documents\Beam-Crew` (branch `main`). Open this folder in VS Code or GitHub Desktop. The original Documents commit and all three Milestone 1 commits are preserved; the old Codex copy remains intact.

## Play locally on laptop + iPhone

1. Double-click **Start-BeamCrew.cmd** in the canonical folder. Keep its window open. It builds and starts the game on **2571** using bundled Node when available, or Node on your PATH. Ctrl+C stops it.
2. Laptop: open `http://localhost:2571`.
3. iPhone: use the same Wi-Fi and open `http://<laptop-Wi-Fi-IPv4>:2571`. Find the current Wi-Fi IPv4 with `ipconfig`.
4. Use different names; create on the laptop, join by the five-character code on the phone, then select **Start test** on the host.
5. Stand by a numbered white grip. **Space** / **ACTION** toggles grab and release. Two workers start near opposite ends. **WASD** / joystick applies movement while free and force while gripping.
6. Carry through the doorway, coordinate a right turn around the column, and put the whole beam inside the green area. **Lobby controls** lets the host reset to the doorway checkpoint or restart from the beginning.

See **PLAYTEST.md** for the full human acceptance checklist. This milestone is ready for your playtest; automated success does not establish that it is fun.

The canonical launcher uses 2571 because the earlier prototype may still occupy 2568. This is local LAN play, not public game hosting. A join link must use the laptop's Wi-Fi URL to work on a phone. Clipboard may be unavailable over LAN HTTP; the UI displays the link as a fallback. If the phone cannot connect, check non-guest Wi-Fi, network isolation and VPN LAN access. Allow Private network access if Windows prompts; do not disable the firewall.

## Develop and test

Node.js 24; pnpm 11.25.0 (pinned in package.json):

```text
corepack pnpm install --frozen-lockfile
corepack pnpm dev
corepack pnpm build
corepack pnpm test
```

Development serves on 2567. Client edits refresh; server edits require restart. Production: build, set `NODE_ENV=production`, then `corepack pnpm start`; `PORT` overrides the server port. Dependencies must be installed before using the launcher.

For all multiplayer tests, run the game separately and set `TEST_URL=http://localhost:2571` before testing. Without TEST_URL, three network tests explicitly skip. There are 24 tests: deterministic movement/beam math, schema encoding, an eight-client lifecycle and a two-client carry/delivery/reconnect/reset run.

## Architecture and tuning

TypeScript, Three.js, Express and Colyseus. The server owns all movement and beam state; clients send inputs and interpolate authoritative poses. Custom deterministic math; no conventional physics engine. Simulation: 30 Hz, patches: 20 Hz. In-memory rooms, 30-second reconnect reservation, immediate host transfer, no late join during active tests.

- `shared/beam.ts`: `BEAM_CONFIG`, `GRIPS`, `COURSE`, deterministic beam math and collisions. Supported/dragging mobility is **0.9 / 0.2**.
- `server/room.ts` and `server/state.ts`: validated room actions, grip ownership, lifecycle and synchronized beam state.
- `client/main.ts` and `client/style.css`: lobby, desktop/touch input, feedback and Three.js scene.
- `shared/movement.ts`: free-worker movement settings.
- `PROJECT_STATUS.md`: current handoff, verification and limitations.

Milestone 3 Wheelbarrow Race is available from the host’s Game mode selector. See PLAYTEST.md for race instructions and tuning details in PROJECT_STATUS.md. Personal acceptance is pending; Milestone 4 and public hosting remain deferred.
