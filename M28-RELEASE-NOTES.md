# BREAK TIME — Milestone 28 combined release candidate

Locally playable, tested, and awaiting physical QA and final approval. Branch: **feature/final-combined-rc**. Shared client/server protocol: **22**. The exact final commit and bundle SHA-256 are recorded in the sibling **Beam-Crew-m28-final-combined-manifest.json**.

## Play now

- Laptop: http://localhost:2728/
- iPhone on the same Wi-Fi: http://192.168.1.166:2728/
- Network diagnostic: http://192.168.1.166:2728/lan.html
- Matching server health: http://192.168.1.166:2728/health

The production preview listens on 0.0.0.0:2728. Start it again from this checkout with **pnpm m28:start** after **pnpm build**. The launcher refuses an occupied port and never stops another preview. Development uses **pnpm m28:dev**, HTTP 2728 and HMR 5228. Existing M24 at port 2724 and all earlier previews were left alone.

## Verified source history

A new independent clone with copied Git objects started at exact M24 commit 56ec6ab7d1ab2f791ac71f8329bb3f4733852e82. Exact M25 commit 789228c9085eff5b213c8f19ee48df4b47162342 and exact M26 commit 72f1595a6fd0e3f2e96741e1d7dd974bc55c6f9e were imported from their local checkouts and merged as real ancestors. All three exact object IDs were verified. Source checkouts remain clean at those commits. Main was not changed. See qa/m28/source-verification.json.

Menu HTML conflicts retained the new six-choice layout and host game-switch disclosure, while preserving M24's always-visible cumulative leaderboard, staging notice, and only 3/5/10 series. CSS retained both milestone blocks. The Vite port conflict was resolved with a new dedicated HMR port. The whole integrated client and server use Protocol 22, including individual Trivia and new Crane snapshots.

## Feature verification

- **Menu:** four illustrated tiles in a 2×2 grid, full-width Party Night above Worker Store, dark teal framing, BREAK TIME and WORK HARD. PLAY HARD.; creation, codes, invites and Quick Match work.
- **Wheelbarrow:** M24 server/physics/course code retained unchanged; compact cumulative standings, named course header, staging notice, 3/5/10 series, spills-first totals and time tiebreaks, podium, replay and reconnect verified. Real clients drove complete randomized 3-, 5-, and 10-race series. Eight-player browser checks cover standings and podium.
- **Trivia:** 2–8 individuals, shared questions and choices, server deadlines, one locked answer, individual live/final scores, individual podium, reconnect, host transfer and replay. The old team/reader roles are removed. Correct answers earn 1,000; wrong/unanswered earn zero; correct-response time breaks ties.
- **Crane:** suspended Tower bridle rig, missed-container settling and unchanged 100-ft/60-second rules. Derby rotation, hoist limits, momentum, boost, structural destruction, per-player arenas, scoring, results and replay verified. Eight-player reload correctly transfers host to a connected worker. The final presentation fix makes short-screen standings scroll above touch controls.
- **Beam:** existing pair mechanics, moving loads, checkpoints, respawns, deliveries and courses retained. Its lobby shows Beam courses, and hides the Wheelbarrow format dropdown. Necessary host course/reset/restart/game-switch controls remain.
- **Party Night:** Wheelbarrow → Beam → individual Trivia. Stable identities, cosmetics and accumulated scores, once-only individual Trivia score adapter, Employee of the Month podium and replay verified. Odd crews use the existing Beam pair wait/skip behavior while everyone can play Trivia.
- **Worker Store:** existing choices, Pumpkin Hat, save/reopen persistence, server synchronization and reconnect preserved.

## QA results

**255 unique regression tests passed, zero failed, zero skipped, across 54 files.** The complete initial shared-server run also passed 255/255. The complete final harness run isolates each file's matchmaking pool, with four files running concurrently, and passed 255/255. Counts are unique cases, not 510 different tests. Final production TypeScript/Vite build passed. A later presentation-only Crane CSS fix was rebuilt and verified by the expanded browser checks; server and simulation code did not change after regression validation.

**156 browser checks passed with zero page errors**, using Microsoft Edge desktop and touch-enabled phone viewports, including 319×740 portrait and 740×319 landscape.

| Suite/report | Checks |
|---|---:|
| menu-trivia-browser-results | 31 |
| wheel-browser-results | 38 |
| party-browser-results | 16 |
| production-browser | 17 |
| invite-reconnect-browser | 5 |
| store-browser | 13 |
| mobile-performance | 12 |
| overhaul-browser | 24 |
| **Total** | **156** |

Additional real-socket Crane controls matrix: **7/7 room sizes (2–8 players)**, checking slew, height, shared seed, private arenas, boost and replay. LAN HTTP and two synchronized WebSocket clients passed through the actual Wi-Fi IPv4 address. Regression lifecycle tests include Trivia and Party sizes 2–8, Crane eight-player host transfer/reconnect/replay, and Beam's supported even-sized pairs.

The original M26 Quick Match failures were investigated against its retained logs. They relied on an empty shared public pool while another test file could join it, and the capacity test filled that same pool. M28's complete shared-server run did not reproduce them. The harness now uses a fresh production server per file, retaining all assertions and concurrency. See qa/m28/QA-NOTES.md for this investigation and two corrected browser-harness assumptions; no failures were hidden with a union of isolated reruns.

## Performance and limitations

No significant problem was observed in local automated checks. Eight-player headless Edge Derby samples had approximately 6.2 ms p95 frame intervals; these are host measurements, not physical iPhone FPS. Eight arenas × 1,800 simulation ticks took 51.9 ms, peaking at 50/72 fragments per arena. Cold-cache, 150-ms-latency, 200-kB/s and 4× CPU-throttled page-ready times were about 4.1–5.6 seconds. See the JSON reports for raw samples and scope.

The existing shared Three.js/podium chunk remains **539.46 kB minified, 139.32 kB gzip**, above Vite's 500-kB advisory threshold; the build passes. Derby retains M26's projected 2.5D collision lane and deterministic support-bay cascade, and Tower retains its simplified container physics. Physical iPhone Safari rendering, touch/audio, heat and sustained performance remain pending user confirmation and hands-on QA.

## Network and rollback

Wi-Fi IPv4 verified: **192.168.1.166**, network category **Private**. Added one inbound allow rule scoped to the preview's Node executable, **TCP 2728**, that local Wi-Fi address/interface, **LocalSubnet** sources and **Private** profile. Domain, Private and Public firewalls remain enabled. Existing firewall rules were not modified. See qa/m28/network-firewall.json.

Rollback tag **rollback/m24-verified** points exactly to 56ec6ab7d1ab2f791ac71f8329bb3f4733852e82. The unchanged M24 checkout and port 2724 remain usable. The sibling recovery bundle includes the final branch, rollback tag and reachable histories of all three exact milestones. Recover into a new directory with **git clone -b feature/final-combined-rc <bundle-path> <new-directory>**, install the frozen lockfile dependencies, build, and run the M28 launcher. Do not reset the verified source checkouts.

Screenshots: [QA gallery](qa/m28/SCREENSHOTS.md). Full machine-readable results: [verification summary](qa/m28/verification-summary.json), [regression details](qa/m28/full-regression/summary.json). Raw full logs and TAP results are retained. Test-only browser fixtures use loopback-only ports and are stopped after QA; they are not the LAN preview.

No push, deployment, main modification, contest submission or physical iPhone operation was performed. Stop here for the user's physical QA and final approval.
