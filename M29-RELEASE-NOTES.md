# BREAK TIME — Milestone 29 all-features release candidate

Local release candidate, awaiting physical playtest and approval. Branch **feature/final-all-features-rc**, shared client/server **Protocol 23**. The exact final commit, bundle SHA-256 and recovery verification are in the sibling `Beam-Crew-m29-final-all-features-manifest.json`.

## Preview

- Laptop: http://localhost:2729/
- iPhone on the same Wi-Fi: http://192.168.1.166:2729/
- Diagnostics: http://192.168.1.166:2729/lan.html
- Candidate identity: http://192.168.1.166:2729/health

The dedicated production preview binds port 2729. Restart from this checkout with `pnpm m29:start` after `pnpm build`; the launcher refuses an occupied port and never stops another preview. Development launcher: `pnpm m29:dev`, with HMR 5229. M24 on 2724 and M28 on 2728 were preserved at their original commits and running process IDs.

## Exact sources and integration

An independent clone using copied Git objects (`--no-hardlinks`) started from exact M28 **e52fd3c5c2a7b4af495943bdc0702d6ab7cf7c88**. Rollback tag **rollback/m28-verified** preserves that exact checkpoint.

The requested M27 hash `c866eae344d8edbaf53a08b2a7e5c089917a7b59` is unavailable and differs by transposed characters from the delivered checkpoint. The explicitly authorized **verified recovery bundle** was used: exact head **c866eae344d8edba5f3a08b2a7e5c089917a7b59**, SHA-256 **792c0254cb248527d6d5d2e1be911f7d5bc0084845e34e1a57eb505709a6227e**. Bundle verification, a fresh bare import and Git fsck passed. No alternate feature implementation or unverified commit was substituted. See `qa/m29/source-verification.json`.

The recovered commit was cherry-picked into the isolated candidate. Client conflicts preserve M28's six-choice menu, FFA Trivia labels, Wheelbarrow HUD, 3/5/10 championship choices, staging notice, host game-switch disclosure and camera vector reuse. M27's Random course UI, shared course hazards, environment details, terrain offsets and portrait camera range were integrated. Party Night explicitly clears Random intent when setting its existing fixed Beam course ID 2; it has no new course chooser.

Protocol increments from 22 to **23** because `beamRandom` adds a synchronized CrewState boolean and changes the schema field layout. Both client and server import the same shared version. Valid course IDs remain 0–4; the UI's -1 Random sentinel never becomes a course ID.

## Feature and QA results

Rooftop Run and Muddy Monday append to the three original courses. Improved training-yard scenery, course-specific machinery timing, synchronized Random selection, checkpoint retention and rematches are present. All M28 features remain: Wheelbarrow HUD, six-choice menu, FFA Trivia, Party Night adapter, Tower Rush, Wrecking Ball Derby, Worker Store/Pumpkin Hat, podiums, Quick Match, reconnect, host transfer and replay.

**292 unique regression tests passed across 57 files, zero failed and zero skipped.** Final full regression results are in `qa/m29/full-regression-final/summary.json`; the earlier complete authorized run passed **291/291**, zero failures/skips, before one additional Party Night regression was added. Final production TypeScript/Vite build passed (`qa/m29/build-final.log`). The machine-readable `qa/m29/verification-summary.json` records the final unique test count.

**290 browser assertions passed**, zero recorded page errors. Desktop Edge and touch viewports include 390×844, 844×390 and narrow 319px layouts. An additional Crane socket matrix passed all seven room sizes, 2–8 players.

| Browser report | Passed |
|---|---:|
| Beam all-course/team matrix | 134 |
| Menu / individual Trivia / Quick Match | 31 |
| Wheelbarrow HUD / podium / replay | 38 |
| Party Night final scores / podium / replay | 16 |
| Production Crane / Party entry | 17 |
| Eight-player Crane / mobile layout | 24 |
| Cold-cache mobile layouts / Pumpkin Hat | 12 |
| Worker Store persistence | 13 |
| Invite / reconnect | 5 |
| **Total** | **290** |

Beam coverage includes all five courses at 2/4/6/8 workers, shared carry/release, host course selection and guest lock, simultaneous teams, Random, rematch and mobile host transfer. Eight real-socket new-course cases cover reconnect identity/end assignment, cosmetics and replay. Deterministic full-course tests cover supported delivery, checkpoints, timed moving loads, falls and recovery on all five courses. Party tests cover fixed-course selection through replay, scoring, reconnect and odd crews. Browser navigation did not manually drive every obstacle to completion; see physical QA checklist.

The initial restricted harness could not reach temporary servers and executed zero tests. Its logs remain available. Full authorized runs use the M28 harness with one fresh server per file; Quick Match capacity tests therefore cannot consume another file's pool. No assertions were removed and no aggregate of isolated reruns is presented as a full pass. See `qa/m29/QA-NOTES.md` for the investigation and Windows permission details.

LAN HTTP and two synchronized WebSocket clients passed through the actual Wi-Fi address. Only one inbound firewall rule was added: the preview Node executable, TCP 2729, local Wi-Fi address/interface, LocalSubnet sources and Private profile. Domain, Private and Public firewalls remain enabled. See `qa/m29/network-firewall.json` and `lan-check.json`.

## Performance and known limits

The existing shared Three.js/podium chunk is 539.46 kB minified / 139.32 kB gzip, above Vite's advisory threshold; the build passes. Cold-cache emulation at 150 ms latency, 200 kB/s and 4× CPU slowdown reached page-ready in approximately 4.1–5.3 seconds. Headless host frame samples are around 6.1 ms median / 6.2 ms p95 and are **not physical iPhone FPS**. Beam overview draw-call medians: original 131, Rooftop 133, Muddy 153.

New Beam courses reuse the existing route/checkpoint/delivery layout. Ramp elevation is visual; mud does not change handling. Decorative guardrails do not add collision; authoritative platform bounds determine falls. Existing hidden geometry remains allocated. Narrow phone Beam overlays occupy substantial space and need hands-on view/touch assessment. Derby retains its projected collision lane/support cascade; Tower retains simplified container physics. Real iPhone Safari, audio/touch ergonomics, heat and sustained performance remain pending.

## Recovery and approval

The sibling recovery bundle includes the final candidate branch, exact M28 rollback tag, M24 rollback tag and a source tag for the verified M27 recovery commit. Recover into a new directory with `git clone -b feature/final-all-features-rc <bundle-path> <new-directory>`, install frozen dependencies, build, and run `pnpm m29:start`. Never reset the original verified checkouts.

Screenshots: [gallery](qa/m29/SCREENSHOTS.md). Physical testing: [checklist](M29-PHYSICAL-QA.md). No push, deployment, contest submission or main modification was performed. Stop here pending the user's physical playtest and approval.
