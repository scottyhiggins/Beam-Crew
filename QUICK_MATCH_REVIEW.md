# Work B: Wheelbarrow Quick Match candidate

Base: Protocol 16, `94122866c5334f2220aab8c0e44aca07c1b64a08`.
Branch: `feature/quick-match`. Candidate protocol: 17.
No main merge, remote push, Render deploy, hosting edit, or environment change.

## Behavior

- Wheelbarrow menu has Quick Match, Create Private Room, and Join with Code.
- Public `wheel_public` rooms use Colyseus seat reservations and joinOrCreate; private `crew` rooms remain separate and only private rooms enter the room-code registry.
- Public rooms support 2-8 connected people, accept arrivals throughout the 15-second server countdown, lock before Championship startup, and use three randomized courses plus the existing race-ready countdown.
- Dropping below two cancels the countdown. Leaving with at least two remaining keeps it running.
- Public host commands are rejected on the server. Names and material selection remain available; no accounts or bots are used.
- Waiting disconnects immediately release their slot. The UI retries public matchmaking after a network loss or waiting-page refresh; it may select another waiting room. Active races retain the existing 30-second reservation and same-session reconnect flow.
- Public match keys prevent duplicate assignments within the running server process. UI cancellation observes late joins and releases them rather than attaching them.
- Play Again leaves the completed match and requests a new public waiting place.
- Empty rooms auto-dispose after outstanding reservations expire. At most 64 public rooms can coexist in this server process; the next creation gets an explicit busy error.

## Hazard cap

`CrewRoom.hazardCap` is a server-owned per-room setting, default 150. Configure it before room creation (e.g. in a specialized room class). Valid range: 1-191; the upper bound stays below the legacy 192-record aggregation threshold so new inserts always reach FIFO cleanup. No client message changes the setting.

Each spill insertion removes the oldest excess records from the synchronized material collection and the current tick's collision array. The client already reconciles its visual list against that collection, including shifted indices and updated material plans. Its cached geometry/materials are shared and deliberately retained, rather than disposed with one removed instance.

Only spilled-material records enter this queue. Course gates, fixed obstacles, scenery, player spill counters, official times, leg ledgers, and results are untouched. The same queue persists, with the same bound, across connected courses and results-stage driving; restart still clears it.

150 is experimental. The local server-only profile in `validation/hazard-profile.json` excludes WebGL rendering, network patch costs, thermals, and mobile Safari. It does not establish desktop-browser or iPhone safety.

## Validation

`pnpm test:all` passed on October 30, 2026: production build succeeded; 115 tests passed, zero failed, zero skipped (434.9 seconds). This includes all existing tests and the new real-socket public-room and FIFO tests. Vite retains its existing large-chunk warning (about 734 kB uncompressed main JS); it is not a build failure.

Final clone: `C:/Users/higgi/.codex/visualizations/2026/10/30/01a18e1b-b4f7-74c2-b3bd-09fe2e1c186f/Beam-Crew-quick-match`. This is an independent clone, outside the shared Beam-Crew tree. The initial clone was made from the local Protocol 16 recovery bundle, whose exact base hash matches the requested checkpoint. The original shared tracked files and Work A checkout were not edited.

Automated coverage includes real-socket public/private separation, two-player startup, seven simultaneous arrivals to fill eight places, direct ninth-seat rejection and ninth-worker allocation to a new room, duplicate assignment rejection, cancellation, waiting disconnect/re-entry, authoritative countdown, racing reconnect, late-race join exclusion, replay re-entry, empty-room cleanup, the 64-room ceiling, FIFO order, collision-array removal, two-client patches, reconnect snapshots, and immutable score snapshots.

Existing tests cover 3/5/10-course Championship completion, all 12 materials, finish/start sockets, legal finish routes, connected staging, immutable scores, private reconnect, and Beam Carry behavior.

## Manual acceptance checklist (pending)

- [ ] Desktop browser: prominent Quick Match button and clearly separate private actions.
- [ ] Two desktop/phone browsers: synchronized count and countdown; material choice works before start.
- [ ] Eight human sessions: late arrivals during countdown; ninth quick-match worker enters a new waiting room.
- [ ] Cancel during an in-flight search, immediately retry, and confirm only one eventual room attachment.
- [ ] Lose network in the public waiting room, restore it, and check automatic re-entry; refresh in waiting and while racing.
- [ ] Complete a public three-course Championship and press Play Again from results.
- [ ] Desktop and physical iPhone Safari: prolonged eight-player spill stress at 150, compare 75 if frame pacing/heat/memory is poor.
- [ ] With mixed debris near narrow start/finish passages, verify full-lane arrival, staging, and all connected course exits remain playable.
- [ ] Verify oldest visible debris disappears on both clients while recorded spills/times remain frozen.

## Integration notes

Likely conflicts with Work A: `client/main.ts`, `client/style.css`, `server/room.ts`, `server/state.ts`, `server/index.ts`, `shared/version.ts`. Resolve protocol numbering jointly during approved integration. Added public-room, tests, profile, and review files should be independent unless Work A creates matching paths.

The in-memory assignment and room-limit registries assume the existing single server process. Horizontal/multi-process deployment needs a shared assignment/limit mechanism first. Match keys identify a browser attempt, not a verified human identity; the system does not claim abuse-resistant identity without accounts.

Do not integrate or deploy until explicitly approved. Keep Protocol 16's public entry available for the October 30, 2026, 11:59 PM Pacific submission deadline.
