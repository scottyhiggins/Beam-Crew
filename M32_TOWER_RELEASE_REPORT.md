# M32 urgent release change — Tower-only Crane

## Preserved candidate and new branch

Original verified release candidate remains unchanged: `5a733e658a38018a5600bc2f2e296377f8241064`, branch `feature/final-release-candidate`, checkout `Beam-Crew-m32-final-release-candidate`. Its verified recovery bundle remains intact. This change is isolated in `Beam-Crew-m32-release-fix`, branch `feature/final-release-candidate-no-derby`. The final new commit and recovery digest are recorded in adjacent workspace `Beam-Crew-m32-no-derby-manifest.json` after committing.

## Exact release changes

- Main menu: remove Derby from the Crane selector; update Crane subtitle/instructions to Tower Rush only.
- Crane page: hide Derby selection and lobby mode buttons. Add a narrowly scoped CSS override because the existing game-card display rule otherwise overrides the hidden attribute.
- Old `crane.html?game=derby&intent=create` / join links: show an unavailable message and do not auto-connect. Tower selection remains usable.
- Server: reject `create('crane', {mode:'derby'})` with ServerError 403 before room-code allocation/registration. Reject every non-Tower mode setting, including attempts from stale clients. A rejected setting leaves the Tower room intact.
- Build label identifies M32 Tower Release Candidate. Protocol remains **23**; no schema or message-contract change.
- Update availability-dependent network assertions to verify rejection while retaining Tower's eight-player private snapshots, reconnect, host transfer and replay coverage. Retained Derby simulation tests still pass.

No Derby implementation was deleted. Shared Crane physics, orientation, rigging and effects are retained without refactoring. Wheelbarrow, Beam Carry, individual Trivia, Worker Store, Quick Match and three-mode Party Night are preserved. No gameplay simulation or reconnect behavior was changed.

## Verification

- Production build: PASS (client TypeScript, server TypeScript, Vite). Existing shared 539.46 kB podium chunk advisory remains.
- Focused isolated regression: **20 files / 109 tests passed, 0 failed, 0 skipped**. See `qa/release-fix/focused/summary.json`. Covers release gates, retained Crane physics, Tower eight-player lifecycle, Beam including all-course/network/replay cases, reconnect reservation expiry/cancel, Party/scoring/transitions, protocol/schema/startup, Quick Match and cosmetics.
- Browser: **13 checks passed**, zero JS exceptions. See `qa/release-fix/browser.json`. Portrait/landscape Derby controls are hidden; Tower remains visible; stale Derby link opens no multiplayer socket; Derby lobby setting is hidden; a phone-layout Beam browser reconnects after a real unexpected socket close and after reload, preserving the same room/player.
- The browser check initially exposed CSS overriding hidden; that defect was fixed and the build/browser checks rerun successfully. A harness wait for transient status copy was corrected to observe the actual new socket/HUD state; the resulting reconnect check passed.
- Full 297-test milestone suite was not rerun for this urgent focused change. Prior complete results belong to the preserved original candidate.

## iPhone disconnect investigation

The prior LAN firewall fix remains in place. Actual Safari main-menu loading was confirmed by the user, but no physical disconnect timing, mode, iOS console trace or room code was supplied. The reported iPhone-specific failure was **not reproduced** here and is not claimed fixed.

Real socket regression covers short-drop recovery, same player/room, host transfer, cancellation and actual server reservation expiry. Server holds disconnected places for 30 seconds; the client uses a 29-second reconnect budget. After reservation expiry a fresh lobby join is required. That behavior is an intentional bound, not proof of the cause of the reported phone disconnect. Phone-layout Edge checks exercise code paths but do not substitute for physical Safari background/network behavior.

## Beam moving-obstacle jitter investigation

The client assigns moving-load positions and excavator yaw directly from `state.elapsed`, while CrewRoom patches state every 50 ms. Existing worker/beam visuals interpolate; obstacle motion does not. A deterministic sampling check using the actual shipped `courseLoads` function at a 60 Hz render cadence and 50 ms network clock produced repeated stationary frames followed by position steps (see browser.json for count). This reproduces a rendering mechanism for visible stepping, not a measured physical iPhone frame trace or a demonstrated network desynchronization.

Focused Beam authoritative movement, course and multiplayer/reconnect tests passed; no reproducible server stability failure was found. Rendering interpolation was deliberately not introduced in this urgent gating change because it needs testing against collision timing and physical Safari feel. Visual stepping remains a known issue requiring acceptance or a separately verified presentation fix.

## Recommendation and preview status

**GO for reviewing this Tower-only candidate. NO-GO for unconditional release until the reported physical iPhone disconnect is retested and the remaining Beam visual stepping is accepted or corrected.** The original Tower maximum-density stress/tick-budget limitation and other M32 documented limits remain.

Nothing was pushed, merged, deployed to Render or submitted. Existing LAN preview on 2732 still serves the preserved original M32 build; it was not silently replaced by this candidate. Browser verification used a temporary isolated server on 2733 which was stopped after the checks. New candidate is built and ready for approval.

Suggested final phone smoke: load the approved candidate, create/join Tower, confirm Derby is absent; test Beam simultaneous touch input, short background/resume and reload; verify same-room recovery within 30 seconds; note device/iOS, exact outage duration and any visible message. Retest the complete Party order if approving the remaining presentation limits.
