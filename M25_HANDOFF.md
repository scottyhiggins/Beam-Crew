# Milestone 25 — Menu and free-for-all Toolbox Trivia

Branch: `feature/menu-trivia-polish`
Base: `380c834f5dad12dca8553f525ab6e8353e89f1be` (Protocol 21)
Independent clone: `Beam-Crew-m25-menu-trivia` (separate .git and copied objects; no worktree links).
No push, merge, deploy, or edits to other checkouts.

## Behavior

- Dark teal menu, centered title, yellow subtitle, four illustrated colorful tiles, Party Night immediately above the matching Worker Store button. Existing illustrations and actual playable modes retained.
- Trivia: 2–8 individuals, including odd crews; one shared question and shuffled four-choice order per room. One locked answer per player and epoch. Server-owned 20-second deadline, early reveal after all participants answer, four-second reveal, and 5/10/15 unique questions.
- Correct = 1,000 points; wrong/unanswered = zero. Only correct-answer response milliseconds break ties; exact ties share rank. Correctness and new scores remain private until reveal.
- Individual live standings and final podium, reconnect reservations, host transfer, same-room replay. Departed players retain recorded standings but do not hold later questions open.
- Party Night retains Wheelbarrow → Beam → Trivia. Trivia results contain one stable player ID per entry; existing 0–100 rank normalization, eligibility, ties and once-only ledger application retained. Odd crews only wait/skip Beam. No remaining integration work for this adapter.
- Beam lobby now shows its course selector. Wheelbarrow shows Championship/single-race options and relevant length/load controls. Host-only cross-game switching remains behind the collapsed “Change this room’s game” disclosure and explicit switch button. Guests cannot change settings; controls hide during play.

## Isolation and running

`pnpm install --frozen-lockfile`, then `pnpm dev` uses port **2525**, Vite HMR **2527**. For production preview, set `NODE_ENV=production` and `PORT=2526`, then `pnpm build` / `pnpm start`. Production's default port remains 2567 for existing deployment compatibility. Browser-only Party fixture uses `QA_PORT=2528`; it shortens unfinished racing objectives to eight seconds and retains the real Trivia timers/questions. Never deploy the fixture.

## Integration contract

This is Protocol **22**, because `TriviaView` replaces `teams`, `role` and `partner` with individual `standings` keyed by player ID. Integrate server and clients together; reconcile the final protocol number if other milestone branches allocate 22. Question bank unchanged. No new dependencies or lockfile changes. Existing room-code endpoints, invitation routes, matchmaking and reconnection tokens retained.

Review/cherry-pick this branch into a separate integration branch based on the verified base. Reconcile shared edits in `client/main.ts`, CSS, `server/party-room.ts`, `shared/version.ts` and related tests with milestones 22–24; no changes from those work checkouts were imported. Do not merge blindly over their menu/adapter changes.

## Verification

- Full live regression: **245 passed, 0 failed, 0 skipped**, including 2–8 Trivia clients and all existing construction-mode/network tests. `qa/m25/regression.log`.
- Final focused Party suite: **8 passed**, including an added five-question, odd-crew, individual-tie test (7 overlap the full suite; **246 unique automated tests validated**).
- Production build passed; existing large podium chunk warning remains.
- `scripts/m25-browser.mjs`: desktop + phone menu, Beam lobby, same-question/four-choice Trivia, full question-bank layout at 390×844 / 319×740 / 740×319, individual scoring/podium, phone reload, replay, host transfer, Quick Match cancellation/shared race/reload. Results: `qa/m25/browser-results.json`.
- `scripts/m25-party-browser.mjs`: actual three-mode browser transitions, individual right/wrong scores, compact layouts, final rankings and replay using the test-only fixture. Results: `qa/m25/party-browser-results.json`.
- Screenshots in `qa/m25/`: menu before/after desktop and phone, Beam lobby, Trivia desktop/portrait/319px/landscape/podium, Party Trivia and final podium.

Browser checks use headless Microsoft Edge with iPhone-sized touch viewports; physical iOS Safari was not available. The Party fixture verifies real room/answer/scoring paths but uses bounded racing timeouts; full native racing coverage is in the regression suite. Historical M22 browser scripts describe the old paired Trivia interface; use the M25 scripts for this branch.

## Recovery

The sibling `Beam-Crew-m25-menu-trivia-recovery.bundle` contains the branch and reachable base history. Verify with `git bundle verify <bundle>`. Recover into a new directory with `git clone -b feature/menu-trivia-polish <bundle> <new-directory>`, then install dependencies. See the sibling manifest for the exact commit and bundle SHA-256.

Final browser totals: 31 menu/Trivia checks and 16 Party checks passed, with zero browser errors. All previews were stopped after validation.
