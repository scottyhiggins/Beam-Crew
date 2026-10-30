# Milestone 19 — Party Night integration handoff

## Isolation and starting point

- Independent Git clone: `Beam-Crew-party-night`, branch `feature/party-night`.
- Exact parent: `1773767411546a92020c67b03cbec2d34a48555b` (milestone 15, protocol 19).
- This commit was unavailable from GitHub; its Git object was fetched read-only from the local integration checkout. No source checkout was edited.
- Branch protocol: **20**, label `BREAK TIME - Party Night M19 - Protocol 20`. Final integration must allocate its combined protocol version and update the version assertion.
- Normal isolated preview: **2599**. Browser fixture: **2600**. Automated tests allocate ephemeral ports.
- No merge, deployment, main push, or remote branch push.

## Playable scope

One Colyseus `party` room, one five-character code, persistent session/player objects and validated cosmetics. No accounts or installation. `/party.html` has the dedicated entry; the existing landing page receives one additional Party Night link.

1. Existing randomized Wheelbarrow Championship, exactly three races.
2. Existing Beam Carry competition, Construction Chaos's Excavator Alley course (`beamMap=2`), one two-person-team course.
3. Existing Toolbox Trivia game engine, five questions, two-person teams.

Crane/Tower Rush is explicitly unavailable and absent from `PARTY_PLAYLIST`. No code from #16, #17, or #18 was copied. The playlist is intentionally three modes.

## Scoring specification

Party Night points are a separate server-owned ledger. Each mode contributes at most **100 points per individual**, once per mode; three Wheelbarrow races do not create three independent awards. Maximum total is **300** if all three modes are scored.

For `N > 1` competitors and competition rank `r`:

`round(100 × (N − r) / (N − 1))`

Competitors are individual racers for Wheelbarrow and teams for Beam/Trivia. Examples: two competitors get 100/0; three get 100/50/0; four get 100/67/33/0. **Both members receive the full team award individually**, not half. With one team, each member earns 100 only if that team meets the eligibility condition below. A skipped mode awards everyone zero and appears with its reason in the ledger.

- Wheelbarrow eligibility: complete all three races. Order by number completed, cumulative official racing spills (fewest), then combined official racing time (fastest). Native spills-first scoring remains unchanged. DNFs earn zero Party points.
- Beam eligibility: deliver the beam. Order by completed delivery, then native final time including recovery penalties. DNFs earn zero. Native gameplay and penalty timing remain unchanged.
- Trivia eligibility: at least one correct answer. Order by native team score descending, then accumulated correct-answer time ascending. Native correct answers remain worth 1,000 team points; wrong answers/timeouts score zero. A zero-correct team earns zero Party points.
- Native result ties share competition rank and Party points; e.g. tied first among three gives 100/100/0. Eligible tied-first competitors each receive one mode win.
- Overall order: total Party points descending, mode wins descending, then original join order ascending. Session identity/order, not display names, determines ties. One overall Employee of the Month is always selected deterministically.
- Final payload includes winner ID, top three, full ranking, individual looks, mode result breakdown, and awards derived from recorded spills, recoveries and correct answers.

## Lifecycle and failure policies

`lobby → intermission → playing → intermission … → final → replay lobby`

The host starts the session and may continue after a three-second intermission minimum. Intermissions auto-continue after 20 seconds, so an absent host cannot stall the playlist. Every host command and gameplay input has a current mode epoch. Old continue/replay/answer/movement/grab/recovery packets are rejected. Scores are derived only on the server and each mode is finalized once.

At a mode boundary, native timers, route plan, debris, result arrays, standings, teams, grips, velocities, inputs, spills, crossing latches and action counts reset. Existing player identities, looks, material choice, room ID and code persist. The original native simulation timer drives both gameplay and Party publication; a second Colyseus simulation timer must not be installed.

Wheelbarrow accepts 2–8 workers, including odd counts. Beam and Trivia require complete connected pairs. Teams follow join order **at each paired-mode start**. An odd group (or fewer than two connected workers) gets a 20-second pairing window. The host can restore pairs and continue, or skip for everyone immediately. At the deadline, a valid group starts; otherwise everyone skips that mode with no points. No arbitrary spectator is chosen to complete a pair.

Every Wheelbarrow race has a 120-second deadline; unfinished racers receive native DNF records, and the next race proceeds. Whole-mode watchdog is nine minutes. Beam retains its native 240-second timeout, backed by a 250-second watchdog. Trivia retains 20 seconds per question and six seconds per reveal, backed by a 140-second watchdog. During Trivia, a connected worker covers both reader and selector if their partner disconnects. This changes access to controls, not team scoring.

Unexpected disconnects use the existing native reconnection reservation (60 seconds) and preserve the same session ID and Player object across mode boundaries. The first connected worker receives host authority immediately; returning hosts do not steal it back. A worker who misses pairing must wait until the next mode to participate; active teams are never silently reassigned. After reservation expiry or an intentional leave, the worker remains in the overall historical ledger but cannot rejoin an active playlist as a new identity. Replay keeps the room and connected roster, clears scores/results, unlocks the lobby, and permits new friends to join.

Sessions are in-memory and do not survive a server restart. Closed/expired browser reservations cannot be recovered through accounts because accounts are intentionally absent.

## Integration surfaces

- `server/party-room.ts`: controller around existing `CrewRoom` and `TriviaGame`; code lookup uses `/api/party/:code`.
- `shared/party.ts`: adapter metadata, `PartyModeResult`, normalization, podium DTO, and `TowerRushPartyAdapter` contract.
- #16: implement the exported Tower Rush contract only after finished native code is integrated. It accepts persistent player IDs/looks, 60 seconds, epoch and server time; exposes server input/tick/private view/result/reset/dispose. Return a `PartyModeResult`, then route it through `applyPartyResult`. Cancel every timer/listener on reset/dispose. Extend controller routing and final UI along with the playlist; simply flipping `available` is **not sufficient**. Keep the unavailable flag false until 2–8-player, disconnect, timeout and replay tests pass. Four scored modes would have a 400-point maximum and require updating the scoring copy/tests.
- #18: consume `partyPodium(...): {version:1, kind:'party-night', winnerId, topThree, ranking, results, awards}`. IDs are stable session identities; names are display text. `look` contains validated hat, vest and expression. No dependency on unfinished podium code or markup.
- #17: retain the `/party.html` target and replace/reposition the one added menu link as desired. Existing mode tiles and menu artwork were not redesigned. Party UI reuses the existing 3D renderer and movement/touch controls.
- `CrewRoom.acceptModeMessage` defaults to true, preserving native room behavior; Party overrides it to reject stale/unauthorized mode inputs. No native scoring engine was rewritten.

## Reproduce and validation

With Node 24 and pnpm 11: `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm test:all`. `Start-Party-Night.cmd` checks port 2599 and starts only this checkout. The default server port remains unchanged for existing consumers; the dedicated launcher supplies isolation explicitly.

Targeted Party tests cover scoring, 2–8-player full lifecycle, odd skips, watchdogs, role fallback, stale messages, replay, native race finish capture, and a real 2–8-client matrix with shared final payloads. A real two-client test waits for the native countdown to reach racing, then verifies host transfer and reconnect across a mode boundary. Native result fixture positions are used in the fast matrix; this is not claimed as an end-to-end steering playthrough.

`scripts/party-browser-fixture.mjs` is a separate test-only server on 2600. It shortens mode deadlines to eight seconds and intermissions to five seconds, exercises the real simulations and timeout/result paths, and does not inject scores or finishes. Its visible notice identifies the fixture. It is never imported by the production server.

Final test/build counts and browser observations are recorded in `PARTY_NIGHT_VERIFICATION.md`. Full regression output is kept locally in ignored `recovery/regression.log`. Recovery bundle/checkpoint metadata are in ignored `recovery/`; the committed branch and recovery tag are the source of truth.

## Known limitations / acceptance decisions

- Odd groups race together but can skip the two paired modes; this is the deliberate safe policy until native modes support other team sizes.
- Reconnect reservations last 60 seconds. Expired/departed workers can join again only in a replay lobby or fresh room.
- A team that loses a worker during Beam may time out; the playlist advances without waiting forever.
- Award ties use original join order. All-zero overall ties also crown by join order; no hidden randomness or sudden-death mode.
- Crane integration and shared podium/menu polish remain future handoffs. Production asset bundle retains Vite's existing large-chunk warning.
