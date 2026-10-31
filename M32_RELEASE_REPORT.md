# M32 — Final integration release candidate

Branch: `feature/final-release-candidate`. Final commit and recovery digest are recorded in the adjacent workspace `Beam-Crew-m32-release-manifest.json` after committing. No push, main merge, Render deployment, or Handshake submission was performed.

## Verified provenance

Both original recovery bundles passed `git bundle verify` as complete histories. A new independent repository was cloned from the M30 bundle and the M31 bundle fetched into it. `git fsck --full` passed. Exact restored source objects:

- M29 base: `cfd655ce72976b4af16e3c412ab4015d07ef96ee`.
- M30 UX: `dfbc6c81381318906cc509400d853c541f7bedf6`; tree `66ad2f7ff0616e4b19f391a64f0435063e127f3d`; bundle SHA-256 `687fa7a99c0e8d6101a9a361ca367ef84943f33930fe60f08f573f698e503b77`.
- M31 Crane: `3e7d42a7e3fe80e7063843c62d95e979895d274d`; tree `fecc941fce0043dc20572dbcf6fb35fec8f311eb`; bundle SHA-256 `78ed5cbd13dc4506279e237902eab714941864218f6cd4586271dcd9b8af9235`.

Both source commits have the exact M29 commit as parent. M30 was restored locally without depending on its canceled GitHub sign-in. Neither source was reconstructed. The original M29, M30 and M31 working directories remained clean.

## Integration

A true two-parent merge preserves both exact source commits. Three conflicts were resolved: retain both lobby sharing and compact in-game standings CSS; retain both preview command sets and add M32; identify the candidate in the shared build label. No gameplay or protocol contract was changed during integration. Both clients and servers import shared/version.ts, protocol **23**. Version-rejection and multiplayer regression tests passed.

Wheelbarrow Championship, Beam Carry (all five courses), individual free-for-all Toolbox Trivia, Tower Rush, Wrecking Ball Derby, Worker Store, Quick Match, private rooms/codes/invite links, reconnect, host transfer and replay are retained. Party Night remains Wheelbarrow (3 races) → Beam (Construction Chaos) → Trivia (5 questions), maximum 300 normalized points. Crane remains standalone. M30 menus/HUD/sharing/presentation and M31 contacts/orientation/rigging/destruction are preserved.

## Verification

- Production build passed: client and server TypeScript checks plus Vite.
- Complete isolated regression: **58 files, 297 passed, 0 failed, 0 skipped**. Includes actual randomized 3/5/10-leg Championship sessions, protocol rejection, Party lifecycle/scoring, both Crane games, reconnect, host transfer and replay.
- All **10 UX browser suites passed**, with 261 named assertions plus immediate Trivia duplicate-submission/latency measurement and Beam rendering samples.
- **21 Crane browser checks and 17 lifecycle checks passed**; no page exceptions or WebGL warnings. Includes actual natural 60-second Tower results, shared winner, reconnect, host transfer, Derby replay, eight-player controls and reachable standings.
- **Seven multiplayer control cases passed**, covering every room size 2–8.
- Desktop, 390×844 portrait, 844×390 landscape, 319px narrow and 740×319 short landscape checks passed. Cold-cache, 150 ms latency, 200 kB/s download and 4× CPU slowdown checks passed.
- Party browser fixture traverses the three-mode session, individual answers, final podium and replay. It shortens Wheelbarrow/Beam deadlines to eight seconds and awards zero for unfinished objectives; it is not evidence of human-completed objectives. Production logic/scoring/sequence are independently covered by regression tests. The unchanged fixture is local-only, on 2933, separate from the production preview.
- LAN HTTP health and two actual clients passed through `http://192.168.1.166:2732`. Health identifies this checkout and protocol 23.

Raw evidence: `qa/m32/summary.json`, `qa/m32/full-regression/summary.json`, `qa/m32/browser-suite.json`, `qa/m32/lifecycle/production-browser.json`, and `qa/m31/m32-integrated/browser.json`. M32 browser runners are copies of verified source runners with candidate-specific addresses/output paths; the lifecycle runner also follows M30's select-then-create menu.

## Performance and known limits

On this laptop, eight Tower arenas with 10/30/60 containers each: physics p95 **8.10 / 13.67 / 23.76 ms**, maxima **18.76 / 17.03 / 31.54 ms**. Normal rounds end at ten stable levels. M31 previously recorded **42.63 ms** maximum at 480 total containers, exceeding the **33.33 ms** tick budget; the better M32 sample does not eliminate this limit.

Eight Derby arenas over 180 simulated seconds: physics p95 **0.0395 ms**, max **0.835 ms**, peak 40 fragments per arena, all expired by the end. A second eight-worker CraneRoom benchmark including JSON encoding of all eight snapshots measured normal p95 **0.909 ms**, max **2.247 ms**; maximum 72-fragment density p95 **1.438 ms**, max **2.295 ms**. These benchmarks exclude actual transport costs and do not establish server fleet capacity or physical phone FPS.

The requested maximum-density Derby tick-budget concern remains documented as an unclosed capacity risk: it was not reproduced in these bounded measurements, which cannot guarantee all destruction/network/host-contention patterns. The verified M31 historical over-budget sample specifically concerns Tower's maximum container density, not Derby. Keep those findings distinct; neither is concealed or reclassified as a proven fix.

Other known limits: Derby target collision uses the established x/y facade projection; 3D depth is visual. Whole falling panels are client animations. The existing shared Three.js/podium chunk is 539.46 kB and triggers Vite's 500 kB advisory. Headless Edge touch/viewport emulation does not establish Safari performance, sustained thermal behavior, touch feel, clipboard fallback, or real-device safe-area behavior.

## LAN preview and physical iPhone checklist

Open **http://192.168.1.166:2732/** in Safari on the same Wi-Fi as this laptop. Laptop: http://localhost:2732/. Production preview binds all interfaces; `pnpm m32:start` restarts it after a build and refuses an occupied port. Keep the laptop awake. Local HTTP supports the game's copy-link fallback when secure clipboard access is unavailable. The actual iPhone-to-laptop network/firewall path must still be confirmed from the phone.

1. Confirm M32 / protocol 23 on the menu; check portrait, landscape, notch/home indicator, scrolling and tap targets.
2. Create a room; join from laptop using its code and invite link. Try Copy Code/Link and fallback selection.
3. Play Wheelbarrow and Beam: movement/action simultaneously, compact HUD, checkpoint/recovery controls, menu navigation and results.
4. Play the full Party Night: Wheelbarrow → Beam → individual Trivia; verify answer feedback, standings, final podium and replay. Confirm no Crane fourth round.
5. Play both standalone Crane games for a full round: pickup/drop and persistent rig; rotate/raise/lower/boost; destruction, eight-worker standings, controls and results.
6. Reload, background/return within the reconnect window, leave the host, transfer host, return to lobby, switch mode and replay. Check Quick Match and saved Worker Store appearance.
7. Play repeatedly for 10–15 minutes; record device/iOS, frame hitches, heat, battery behavior and any unresponsive controls.

## Recommendation

**GO for candidate review and physical iPhone testing. NO-GO for release** until physical Safari checks pass and the owner approves. No automated functional blocker was found. Dense-load performance remains a documented limitation, not a demonstrated production capacity guarantee. Do not push, merge main, deploy or submit without subsequent approval.
