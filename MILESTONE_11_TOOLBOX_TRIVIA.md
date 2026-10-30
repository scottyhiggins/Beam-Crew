# Milestone 11 — Toolbox Trivia

Base: protocol 16, `94122866c5334f2220aab8c0e44aca07c1b64a08`.
Branch: `feature/toolbox-trivia`. Independent HTTPS clone; no shared Git objects, worktree, index, or node_modules with the integration checkout. No remote push, merge, Render action, production setting, or production environment change is part of this milestone.

## Play

Choose Toolbox Trivia from the landing menu, or open `/trivia.html`. Create a private room. Teammates open the shared `/trivia.html?trivia=CODE` link, or enter the code on the Trivia screen. Existing driving-game codes and `/api/rooms/:code` stay unchanged; Trivia uses `/api/trivia/:code` so the two code namespaces remain independent.

2/4/6/8 players form 1/2/3/4 teams, in join order. Exactly two per team. Odd player counts or disconnected reservations block starting. To change pairs before starting, leave and rejoin in the desired order. The host chooses 5/10/15 questions (default 10).

Reader gets the question; selector gets four shuffled choices. Only the selector may submit, once per question. Roles alternate. All teams receive the same question and answer ordering, with a server deadline of 20 seconds. All submissions trigger an early reveal; otherwise timeout does. Reveals last six seconds. A correct answer gives 1,000 points. Lower summed server-measured response time on correct answers breaks score ties. Equal score/time shares a podium position.

42 original questions span tools, safety, equipment, materials, engineering and jobsite humor. Each round shuffles a unique subset without replacement. Correct answers and the question bank remain in server-only files; neither is imported into client bundles. Reveals intentionally disclose the question, choices and correct answer to both roles. No answer key or correctness flag is sent during questions. Previous revealed questions cannot be made secret again in a browser that already saw them.

Disconnects reserve the exact player/role for up to 60 seconds and transfer host immediately to a connected worker. Browser refresh reconnects using a session-storage token. Timers continue during disconnects; a team with an absent partner can time out. No replacement joins mid-round. Return to lobby and wait for reconnection/expiry to form new pairs. Replay resets teams, question deck, and scores. Rooms are in-memory; restarting the server loses rooms and reconnect reservations.

## Laptop + iPhone check (before integration)

1. In this isolated folder, run `pnpm build`, then start with an unused port, e.g. in PowerShell: `$env:PORT='26712'; $env:NODE_ENV='production'; pnpm start`. Avoid a port used by Milestone 10. This changes only the current shell environment.
2. On the laptop, open `http://localhost:26712/trivia.html`. For iPhone on the same Wi-Fi, use `http://<laptop-LAN-address>:26712/trivia.html`. The server binds to 0.0.0.0. Firewall/network policy must already allow the connection; do not change production hosting to test.
3. Create on the laptop; join using the five-character code on the iPhone. Confirm Team 1 and the 10-question default. Select 5 for a quick test.
4. Start. Confirm the reader sees only the question and the selector only four choices. Communicate and submit. Verify the locked answer, reveal, scoring and role reversal. Rotate the phone in both roles; scroll if needed, confirm all cards are reachable and text stays readable.
5. Let a question expire. Verify no late answer earns points. Finish the round; inspect podium and replay. Repeat with 4/6/8 browser/device sessions for multiple teams.
6. Refresh the phone during a question and verify its place and submitted status return. Briefly disconnect the host to verify host transfer. Reconnect within 60 seconds; then separately test expiration and re-pairing in the lobby.
7. Return to All games. Exercise existing Wheelbarrow and Beam Carry private rooms and join links.

Browser verification used desktop, 390×844 portrait and 844×390 landscape sizes, including private creation/join, split-role screens, and refresh reconnection. These are browser-sized checks, not physical iPhone/Safari validation. Physical laptop+iPhone testing remains outstanding. Clipboard copying may require HTTPS or localhost; the fallback displays a copyable URL.

## Merge notes for Milestone 10

Do not merge until explicit approval. Rebase/cherry-pick onto the completed Milestone 10 only after it is stable, then run the combined suite and device checks.

Likely conflict: `client/main.ts`, whose large menu-template line gains one Trivia link. Preserve M10 mode cards, quick-match controls and handlers; insert only the Trivia card. It links to a separate screen rather than changing the existing mode schema.

Likely conflict: `server/index.ts`, which adds a Trivia room registration and a separate code-lookup endpoint. Preserve M10 room registration, matchmaking routes, health/version checks, middleware and hosting behavior.

Possible conflict: `index.html` removes the maximum zoom restriction for accessibility. Keep M10 viewport/assets. New `trivia.html` and `vite.config.ts` add a separate Vite build entry for Trivia, preserving the original main client entry. If M10 adds a Vite configuration, combine the build input entries with its settings.

All other implementation files are new, primarily prefixed trivia; the build config and Trivia HTML entry are also new. No changes to `server/room.ts`, `server/state.ts`, driving physics, existing test sources, `shared/version.ts`, dependencies, lockfile or Render configuration. Protocol 16 and its existing build label remain unchanged intentionally; choose the final combined release label/protocol during approved integration. Trivia uses private per-client messages rather than adding hidden fields to shared Colyseus schemas.

Known limitations: fixed join-order pair assignment; no mid-round substitutes or spectators; no server-restart persistence; one shared question per round rather than unique team questions; physical Safari checks outstanding. At most 8 clients per room. This is a party quiz, not official OSHA certification or safety training.

## Validation

See `TRIVIA_VALIDATION.md` for final command results and recovery instructions. `scripts/test-trivia-live.mjs` runs the isolated Trivia unit and real-WebSocket tests against a fresh local production server after a build. Existing `pnpm test:all` runs every compiled test against a fresh server.
