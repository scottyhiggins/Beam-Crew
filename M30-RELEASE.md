# Milestone 30 — final UI, mobile HUD and Party Night polish

Branch: `feature/final-ux-party-polish`
Base: `cfd655ce72976b4af16e3c412ab4015d07ef96ee` (#29)
Protocol: 23 (unchanged)
Independent checkout: `Beam-Crew-m30-final-ux`
Preview: `http://localhost:2730` (`pnpm m30:start` after `pnpm build`)
Development preview: `pnpm m30:dev` (HTTP 2730, HMR 5230). The launcher refuses occupied ports and never stops another server.

## Delivered

- All five game tiles select first with one consistent highlight and Create/Join controls. Crane offers Tower Rush and Wrecking Ball Derby before creation. Worker Store retains its customization flow. Selection brings the entry controls into view without leaving the menu.
- The approved dark teal, four illustrated tiles and two full-width buttons remain. Menu and lobby spacing, alignment and copy have been tightened.
- Large high-contrast codes, Copy Code and Copy Invite Link are available in every private lobby. Crane now supports native invite links. Codes and sharing controls fit 319px portrait and short landscape without scrolling. Lobby entry resets stale scroll positions.
- Mobile Wheelbarrow shows its course, course number, timer, local spills and one local ledger row during play. Full standings remain available through Menu, and the results podium is retained. Spills-first/time-tiebreak simulation and scoring are unchanged.
- Mobile Beam shows course/time, team, checkpoint, teammate and current carry state. Course View and crew signals live in Menu; recovery stays immediately available. Joystick and action controls remain clear. All five existing Beam maps remain available.
- Active native Party Night games show only a small non-interactive Round n/3 chip. Overall standings appear between games and at the final Employee of the Month podium. Native HUDs and transition countdowns remain.
- Standalone and Party Trivia respond on pointer-down, mark the choice immediately and lock duplicate taps/clicks. Keyboard activation remains supported. The server still validates answers and owns scores and reveal timing.
- Beam world labels now respect depth instead of drawing backplates through geometry. Sweep markings no longer write transparent depth; delivery paint is opaque. Decorative excavator arms use connected joints; existing obstacles, terrain, checkpoints and cooperative physics are unchanged.

## Party Night fallback

This release deliberately retains the verified three-mode session: Wheelbarrow Championship (3 races), Beam Carry (Construction Chaos), then individual Toolbox Trivia (5 questions), maximum 300 normalized points.

Crane is **not integrated into Party Night**. The existing Tower adapter spike covers simulation only. Crane still has a separate room, private arena snapshots, input messages and renderer, while PartyRoom relies on CrewState plus its Trivia view. A four-stage release would need a complete new client scene/input adapter and lifecycle validation for epochs, reconnect, host transfer and replay. The authorized three-mode fallback preserves the verified lifecycle rather than shipping a partly connected fourth stage. Both Crane games remain fully playable standalone.

## Verification and evidence

- Production build: `pnpm build` passes. The pre-existing shared 3D chunk size warning remains.
- Full regression: `QA_OUTPUT=qa/m30/full-regression node scripts/test-live.mjs`; 57 files, 292 tests, no failures or skips. Tests use independent local servers and include 2–8 player cases, normalized scoring, native gameplay, reconnect, host transfer, replay and checkpoint regression coverage.
- Browser checks: `node scripts/m30-browser-suite.mjs`. The runner accepts individual check names for focused reruns and records latest actual exit statuses in `qa/m30/browser-suite.json`.
- Browser evidence covers all six home buttons, unified Create/Join, all five Beam maps with eight workers, portrait/landscape/319px, simultaneous individual Trivia, Quick Match, invite reload reconnect, Crane multiplayer, sharing, Party transitions and replay, and store persistence.
- The Party browser fixture runs on 2931 and shortens native game timeouts only, awarding zero for unfinished objectives. It checks UI and lifecycle transitions without claiming completed human play. Full scoring and lifecycle behavior also has server/network regression coverage. The store test uses its own temporary server on 2932.
- Immediate Trivia feedback and one-message duplicate protection are measured by `scripts/m30-trivia-tap.mjs`, with results in `qa/m30/trivia-tap.json`.
- Sampled Beam draw counts match #29: 131 / 133 / 153 for maps 0 / 3 / 4. Median frame time is approximately 6.1 ms and p95 approximately 6.2 ms in this host's headless Edge sample, comparable with recorded #29 measurements. See `qa/m30/performance.json` and the inherited `qa/m29/performance.json`. These are desktop-host measurements, not physical phone FPS.

Physical laptop/iPhone playtesting, Safari behavior and confirmation of the originally reported visual layer on that device remain a manual follow-up. No changes were made to #29, #31, main or production.
