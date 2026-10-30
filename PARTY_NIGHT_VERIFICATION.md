# Party Night — verification, October 30, 2026

## Release identity

- Branch: `feature/party-night`, independent `Beam-Crew-party-night` clone.
- Base: `1773767411546a92020c67b03cbec2d34a48555b`.
- Protocol 20. Three playable modes; Tower Rush explicitly unavailable.
- First tested recovery commit: `d365db1585e185e5877139c17918fccf2b851086`.
- The final verification commit follows that checkpoint. Resolve it with `git rev-parse feature/party-night`; final tag is `party-night-verified-m19`.

## Automated results

| Check | Result |
| --- | --- |
| Locked independent dependency installation | PASS: pnpm 11.25.0, Node 24.22.1; private local node_modules and .pnpm-store |
| Production build (`pnpm build`) | PASS: TypeScript client/server checks and Vite production output for main, Party and Trivia |
| Full regression (`node scripts/test-live.mjs`) | **182 passed, 0 failed, 0 skipped**, about 443 seconds |
| Final Party suite (`node scripts/test-live.mjs party`) | **7 passed, 0 failed, 0 skipped**, about 7 seconds |
| Recovery bundle verification | PASS: complete Git history, independent restore supported |

The full regression run includes the earlier six Party tests. The final targeted rerun includes the new seventh award test and the latest replay/cosmetic refinements; these counts are not 189 distinct tests. The full native suite includes real Beam multiplayer delivery/replay, Wheelbarrow two-course and randomized 3/5/10-race sessions, 2/4/6/8-worker Beam pairs, Trivia 2/4/6/8-worker behavior, cosmetics, physics, hazards, reconnect, matchmaking and production startup.

Fast Party matrix: **2, 3, 4, 5, 6, 7 and 8 actual WebSocket clients**, one room ID/code throughout, native three-race finish/rank collection, team-mode scores, whole-group odd-count skips, matching final podium payloads on every client. Server-side finish positions and native team result fixtures keep this contract test fast; it is not presented as a human steering playthrough.

Separate real-time Party test: countdown reaches racing and elapsed time advances, host authority rejects non-host commands, stale native input/Party commands/Trivia epochs are rejected, a disconnected host reconnects with the same identity and look across a mode boundary, host ownership remains transferred, replay clears the ledger and accepts an additional friend in the same room.

Additional controller tests: 120-second race expiry; Beam watchdog; Trivia fallback roles; fewer-than-two/odd pairing windows; bounded automatic progression; one result application per mode; normalized solo/team points; deterministic ties; clean replay state; awards require recorded statistics.

Two pre-existing test assumptions were updated: production startup now checks every entry script because Vite emits a shared script before the game script; Trivia waits for both clients' second-question snapshots before asserting their roles. The protocol assertion is updated from 19 to 20. Native scoring and physics assertions were retained.

## Browser checks

Two independent in-app browser tabs were used. Production preview was isolated on 2599; a separate explicit QA fixture ran on 2600.

- Dedicated Party entry renders, and the unavailable Crane mode is described as outside the playable playlist.
- Host creates; guest joins via the same code/invite URL; both names appear in the same lobby.
- Host starts; intermission shows mode name, controls and overall leaderboard.
- Existing native Wheelbarrow and Beam rendering/controls appear during their modes; Trivia uses per-player private reader/selector views.
- Full timeout journey reaches one shared Employee of the Month screen with identical code, names, rankings and per-mode point breakdowns on both tabs.
- Replay returns both clients to the same code/lobby with cleared standings.
- Reloading the host reconnects the same named worker; the connected guest becomes host and retains authority after the original host returns.
- The new host can start another playlist in the same room.

The full browser journey uses `scripts/party-browser-fixture.mjs`: eight-second mode watchdogs and five-second intermissions, with a visible fixture notice. It injects no scores/finishes. Inactive workers correctly get zero points. Production deadlines are unchanged. Browser checks supplement the 2–8-client network matrix; no claim is made of a complete manual eight-player physical steering playthrough.

Final screenshot: `verification/party-night-browser-final.jpg`. Its zero scores are the expected outcome of the inactive-player timeout fixture. The final replay was checked again on both tabs after taking the screenshot: same code `WLUZ9`, both identities present, guest remains host, and the old score ledger is cleared.

Browser testing caught and fixed an integration defect: installing a second Colyseus simulation interval replaced the native timer. Party now uses the existing timer, and a permanent real-time countdown regression assertion covers this.

## Build and remaining limitations

Production output passes; Vite reports its large-chunk advisory (~622 kB main JS, ~171 kB gzip). No build error.

Acceptance limitations are documented in `PARTY_NIGHT_HANDOFF.md`: odd groups may skip paired modes; a disconnected Beam teammate may cause a team timeout; reconnection is limited to the existing 60-second reservation; sessions are in-memory; finished Crane integration, shared podium rendering and final menu layout are future handoffs. No unfinished external milestone code is included.

No main checkout, production service, or other Work checkout was edited. No branch was pushed, merged or deployed. Local recovery bundles contain the branch history and checkpoint refs.
