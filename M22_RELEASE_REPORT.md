# Milestone 22 — final feature integration release candidate

Date: October 30, 2026 (America/Denver). Repository: `https://github.com/scottyhiggins/Beam-Crew`.

**Automated candidate: GO for handoff. Deployment recommendation: NO-GO until the physical laptop + iPhone checklist is signed off.** There are no unresolved automated failures. Safari on a real iPhone, touch feel, heat, and sustained frame rate have not been established by desktop emulation. Nothing was pushed, merged into main, or deployed.

## Candidate and provenance

- NEW isolated checkout: `Beam-Crew-final-release-integration`.
- Branch: `feature/final-release-integration`.
- Protocol: **21**, shared by client and server; `/health` identifies `Final Release Integration M22`.
- Final commit is recorded in the sibling `Beam-Crew-m22-release-manifest.json` and final handoff. The manifest is external so the commit need not contain its own hash.
- Baseline: milestone 15, Protocol 19, `1773767411546a92020c67b03cbec2d34a48555b`.

| Input | Exact integrated commit |
| --- | --- |
| #16 Crane Challenge | `020974bb3a8335a1ac73f877928bdbc6dc20bb48` |
| #17 Menu & Onboarding | `2565752c34eb14db54e07616f39884230382a014` |
| #18 Podium & Comedy | `59560551fad5e46893566da98cd98f6104fda0a6` |
| #19 Party Night, user-confirmed correction | `4d1408321c00b954c9c06c87d9cfd9baab8edf48` |
| #20 Pumpkin Hard Hat | `0239ce61ed86b019a3dd3019e2b06ad12046ac26` |

All exact objects were located before merging. The originally supplied #19 SHA `d41d08321c00b954c9c06c87d9cfd9baab8edf48` was absent from local repositories and rejected by GitHub (`not our ref`). The user explicitly authorized the verified `4d14083...` checkout/bundle commit as authoritative. No unrelated commit was substituted.

The baseline and all five feature checkouts remain clean on their original branches. Main and production are untouched. The isolated checkout's origin is the GitHub repository; no push occurred.

## Integrated behavior

All six home choices work: Wheelbarrow Championship, Beam Carry, Toolbox Trivia, Crane Challenge, Party Night, Worker Store. Quick Match and private-room entry remain available.

Crane Challenge opens its chooser and runs the original authoritative Tower Rush and Wrecking Ball Derby simulations. Native 100-foot/60-second Tower rules, Derby scoring, and join-order tie breaking remain unchanged. Validated cosmetics now accompany Crane snapshots and render on the local operator and shared results podium. Other workers' private Crane arenas stay private.

The reusable 3D podium is connected to the existing Wheelbarrow/Championship/Beam result flow, standalone Trivia, Crane results, and Party Night's final standings. It presents recorded places and scores; it does not calculate replacement winners or alter scoring. Pumpkin and classic looks survive appropriate room transitions, reconnect, host transfer, and replay.

Party Night has **exactly three playable modes**: three-race Wheelbarrow Championship, Beam Carry Construction Chaos, and five-question Toolbox Trivia. Its normalized 0–100 points per mode, pairing/skip behavior, and overall tie breaking are preserved. Input epoch checks prevent old-mode messages from acting in later modes. Native crew results are suppressed during Party transitions so they cannot compete with the Party overlay.

A test-only Tower Rush adapter feasibility spike implements #19's intended `TowerRushPartyAdapter` interface using native Tower physics. It passes eight-arena privacy, epoch, timeout, reset, and disposal checks. It is NOT imported by the production room, registered in the playlist, or advertised as playable in Party Night. Completing it safely also requires a Tower snapshot/input/rendering path in the shared Party client and lifecycle/browser coverage. The current Party room assumes two native Crew modes followed by Trivia; simply enabling the fourth entry would be unsafe. The stable three-mode release is intentional.

## Integration fixes

- Resolved page entries, room/API registration, menu imports, onboarding, invite handling, result overlays, and protocol conflicts without removing baseline gameplay.
- Separated normal-room and Party Night reconnect storage.
- Fixed invited-page reloads: the saved reservation is used when its recorded room code matches the invitation; other-room stale tokens are ignored. Verified in Beam, Trivia, and Party Night.
- Kept authoritative host controls and existing score/rank rules. Added Crane cosmetic allowlist validation and explicit mismatch rejection for supplied protocol versions; Crane browser checks `/health` before joining/reconnecting.
- Disposed podium geometry/materials/textures and explicitly released its GPU context on close/replay. Resize still renders a finished podium after its short animation stops. Paused the hidden main scene behind Party overlays.

## Verification results

| Check | Passed | Failed | Skipped / cancelled |
| --- | ---: | ---: | ---: |
| Final full regression suite (`node scripts/test-live.mjs`) | **225** | **0** | **0 / 0** |
| Additional isolated Beam full-lifecycle repetitions | **3 of 3** | **0** | **0** |
| Menu/invites/store/narrow-layout browser assertions | **24** | **0** | **0** |
| Production desktop + mobile Crane/Party browser assertions | **17** | **0** | **0** |
| Three complete eight-client Party fixture playlists | **32 assertions** | **0** | **0** |
| Production five-question Trivia + Quick Match browser assertions | **21** | **0** | **0** |
| Targeted Beam/Party invited-reload browser assertions | **5** | **0** | **0** |
| Mobile cold-load/layout/store assertions | **12** | **0** | **0** |

**Browser/mobile total: 111 passing assertions, zero unresolved failures.** Browser suite errors arrays are empty. The two new eight-player combined network tests and two optional adapter-spike tests are included in the 225 regression total; do not add them again. The final suite ran in **445.163 seconds**, with a real isolated production server and all network checks enabled. `pnpm test` alone would skip network cases and was not used as release evidence.

**Production build: PASS** (`pnpm build`: client/server type checks, server compilation, Vite multi-page production bundle). Node 24.22.1, pnpm 11.25.0. Browser QA used installed Microsoft Edge 156.0.4314.50 via Playwright, desktop viewports and touch/mobile-sized contexts. Screen sizes include 319×740, 740×319, 390×844, 844×390, and desktop 1365/1440×900.

Production browser coverage includes a natural 60-second Tower round with a settled 10-foot stack, identical desktop/mobile winners, actual mobile touch events, reload reconnect, host transfer, fresh Derby start, and the Party menu/lobby. Standalone Trivia answered five questions through native reader/selector roles and reached 5,000 authoritative points; mobile reload, podium agreement, host transfer, and replay passed. Quick Match cancellation, two-browser race entry, active reload, and mobile joystick passed.

Party browser coverage uses the existing test-only `PartyRoom` subclass with eight-second mode deadlines, no score injection, and zero points for timed-out objectives. It runs two real browser clients plus six real SDK clients through all three modes, final podium, and replay three times, then tests host transfer. This proves combined lifecycle/rendering, not an unassisted full-duration Party playthrough. Separate native regression tests cover scoring and the 2–8-player matrix using deterministic completion fixtures.

The initial full suite had **221 tests: 220 passed, 1 failed** because an inherited test hardcoded Protocol 20. It was updated to the actual Protocol 21 contract; the final full suite is clean. Browser development also exposed two harness assumptions (waiting for an authoritative mode update; recognizing automatic reserved-place reconnect), synthetic pointer events without an active pointer, and the real invited-reload bug described above. Final verified browser runs pass with real touch events and the corrected flow. Initial runs are not represented as final passes.

## Intermittent Beam timeout investigation

No Beam timeout reproduced: the original full integration run, all three isolated repetitions, and final full suite passed the real two-client carry/release/reconnect/delivery/replay scenario. Isolated durations were 56.887, 46.519, and 46.477 seconds including test overhead. No Beam physics, speed, collision, scoring, or timeout allowance was changed. On a future failure, the test now prints the exact timed-out predicate, allowed wait, authoritative host/guest state, and steering state. A historical intermittent issue cannot be declared eliminated from five successful observations.

## Performance and memory

- One locked Three.js dependency: `three@0.180.0`. Browser runs emitted no duplicate-Three or exhausted-WebGL-context warnings.
- Candidate JavaScript across all pages: **799,571 bytes raw / 233,347 gzip**. Existing baseline built assets: **751,046 raw / 212,832 gzip**. The increase includes Crane, Party, and preview entries; all entries are not loaded on every page.
- The shared engine/podium chunk is **539,425 bytes raw / 139,312 gzip**, so Vite's >500 kB warning remains. The baseline's largest chunk was 615,384 bytes. The warning was measured and retained; the threshold was not raised to hide it. Engine code is shared across page entries.
- Cold local HTTP, disabled cache, 150 ms added latency, 200,000 bytes/sec download, 75,000 bytes/sec upload, 4× CPU slowdown: home **5.155–5.241 s**, Trivia **4.104–4.107 s**, Crane **4.500–4.580 s**, Party **5.126–5.164 s** to tested ready controls. The local static server served uncompressed assets. These are desktop-Edge emulation measurements, not public-host or physical-iPhone promises.
- Three eight-client Party cycles kept **two live GPU contexts** (game + current podium). Created contexts were 2, 3, 4 as old podium contexts were released; connected/live contexts remained 2. Observed JS heap was **21,884,556 → 21,773,618 → 21,931,680 bytes**, showing no monotonic increase over those cycles. This is short-run instrumentation, not a long-duration memory proof.
- Existing bounded hazard/geometry regression checks also pass. No unrelated renderer refactor was introduced.

## Limitations and deployment decision

1. Physical laptop+iPhone Safari QA remains pending. Use `M22_PHYSICAL_QA.md`; sign off before deploying. This is the deployment NO-GO condition, not an automated test failure.
2. Party Night intentionally has three modes. Tower Rush and Derby are standalone Crane modes. No fourth Party mode is claimed.
3. Eight-player network lifecycles pass; the browser Party matrix is two browser clients plus six SDK clients, not eight physical phones.
4. The Three.js size warning remains and cold emulated load is around five seconds. Real Wi-Fi/cellular load and sustained iPhone heat/FPS need measurement.
5. The old intermittent Beam timeout did not reproduce; diagnostics are improved, but root cause is not proven resolved.
6. No deployment smoke test was performed against production because deploying or overwriting production was forbidden. Matching Protocol 21 client/server assets must be released together in any later approved deployment.

## Evidence and recovery

- `verification/m22/full-regression.txt`, `production-build.txt`, `initial-regression.txt`, combined/network and Beam repeat logs.
- `qa/m22/*.json` and desktop/phone screenshots; `qa/browser-smoke.json` records the 24-check menu pass.
- Repeatable browser scripts: `scripts/m22-browser-production.mjs`, `m22-browser-party.mjs`, `m22-browser-trivia-quick.mjs`, `m22-browser-invites.mjs`, `m22-mobile-performance.mjs`; set `PLAYWRIGHT_PACKAGE` to the installed Playwright package when it is external. Local production QA used port 2722, test-only Party fixture 2723. The fixture is not part of production startup.
- `M22_RECOVERY.md` provides exact restoration and baseline rollback commands. The sibling final bundle and manifest preserve the final commit and all verified input histories. Production needs no rollback because it was never changed.
