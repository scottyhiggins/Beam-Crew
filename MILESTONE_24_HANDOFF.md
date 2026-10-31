# Milestone 24 — safe Wheelbarrow release candidate

Branch: `feature/m24-safe-wheelbarrow-rc`. Protocol: **21**.

Independent repository: `Beam-Crew-m24-release-candidate`. Created at exact base
`380c834f5dad12dca8553f525ab6e8353e89f1be`, then merged exact delivery
`2135b262d636f03c85c573467212e4a83d38bc2b` with a merge commit.
Integration commit: `cb0fc46c05d139dee7d6ff35accdc893c9072d22`.
The final checkpoint adds only validation evidence, scripts and documentation.

## Verification and conflicts

The source bundle verified as complete history, with both its branch and checkpoint
tag pointing at the exact requested #23 commit. SHA-256:
`3DAF0F4FCD937B37D1BB58EC4EA2894DDE2EC963DE61A158C42C19B58089C14F`.
No substituted commits, no conflicts, no conflict resolutions. The integration
tree equals #23 exactly. No other feature branches integrated.

Fresh production build passed: TypeScript client/server checks and Vite.
Existing shared podium chunk warning remains (539.46 kB before gzip).
Fresh full network regression: **229 passed, 0 failed, 0 skipped, 0 cancelled**.
The preliminary run without TEST_URL passed 195 and skipped 34; the full run in
`qa/m24/regression-live.txt` supersedes it.

Fresh browser checks: **126 passed** = 38 Wheelbarrow HUD + 75 cross-mode + 13 Store.
Desktop Edge and mobile emulation cover 390px portrait, 319px narrow screens and
844px landscape; they do not establish physical iPhone Safari acceptance.
Wheelbarrow checks include eight-player live rankings, course name/counter,
immutable results, staging reminder visibility, course transition, shared 3D
podium, scoreboard with podium, replay cleanup, and reconnect restoring standings.
Full regression includes authoritative 3/5/10-series network lifecycles with
countdowns, reconnect, frozen ledgers and replay. Cross-mode coverage includes
Beam Carry, Trivia, Quick Match, both Crane games, three-mode Party Night,
host transfer, cosmetics and Pumpkin Hat. No FPS improvement is claimed.

HUD fixtures accelerate finishes only in isolated loopback QA servers. The LAN
preview uses the production server, without fixture endpoints. Fresh browser
evidence is copied to `qa/m24/browser-evidence`; its before/reference images and
performance.json are inherited #23 baseline material, not new M24 measurements.

## Physical laptop and iPhone QA

Open **http://192.168.1.166:2724/** on both devices on the same Private Wi-Fi.
Health: **http://192.168.1.166:2724/health**. Check repository ends in
`Beam-Crew-m24-release-candidate`; the inherited display label still says M22.
The client derives `ws://192.168.1.166:2724` from the page URL.
Firewall helper verifies an enabled inbound TCP 2724 rule limited to Private,
192.168.1.166, the local /24 subnet and this Node executable. Firewall stays on.

1. Create on laptop, join iPhone with code/invite; confirm both list the crew.
2. Complete 3 races; compare course names, live board, spills/time, staging reminder,
   final order and podium on both devices. Check joystick and lobby controls.
3. Select 5 then 10 races; verify course counter, transitions and unique courses.
4. Reload/reconnect during racing and staging; verify identity and scores persist.
5. Replay; confirm old totals/podium clear. Leave host; verify host transfer.
6. Smoke all six home buttons, Beam Carry, Trivia, both Crane games, Quick Match,
   Party Night and saved Pumpkin Hat. Note stutters and portrait/landscape issues.

Physical acceptance remains **pending user testing**. GO for physical QA;
deployment decision remains pending physical acceptance. Nothing pushed or deployed.

## Recovery and baseline safety

Final commit and bundle SHA-256 are recorded in `recovery/m24-checkpoint.txt`.
Tag: `checkpoint/m24-safe-wheelbarrow`. Bundle: `recovery/m24-safe-wheelbarrow.bundle`.
To recover, clone that bundle into a new empty directory and switch to
`feature/m24-safe-wheelbarrow-rc`; install locked dependencies and build.
To use the previous baseline, open port 2722; its checkout and process were untouched.
Do not reset or replace the original checkout. No merge into main, push or deployment.
Preview process ID is in `recovery/preview.pid`; stop only that candidate process
after verifying its identity, never the port 2722 process.

Reproduce: `pnpm install --frozen-lockfile`, `pnpm build`,
`node scripts/test-live.mjs`. Browser runners: `m23-browser-run.mjs`,
`m23-cross-mode-run.mjs`, `m23-store-check.mjs`; bundled Playwright path is
desktop-specific. HUD comparison requires an ignored Protocol 21 `baseline-m22`
build/dist. Package-manager copy/link setup failures were resolved with a fresh
locked install; no source changes were required.
