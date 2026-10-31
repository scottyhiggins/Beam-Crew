# Milestone 31 — crane physics and demolition polish

Branch: `feature/final-crane-physics`  
Verified base: `cfd655ce72976b4af16e3c412ab4015d07ef96ee` (`feature/final-all-features-rc`)  
Protocol: **23**. Snapshot fields and message contracts are unchanged; ball depth is derived from existing authoritative state. The build label identifies M31. Stale-protocol rejection remains covered by regression tests.

The final commit and bundle SHA-256 are recorded in the adjacent workspace release manifest, `Beam-Crew-m31-crane-physics-manifest.json`, after committing. No push, merge, production operation, or change to #29/#30 is authorized or performed.

## Changes

Tower Rush uses oriented rectangle contacts with swept-distance substeps, contact impulses, Coulomb friction and small air damping. Containers tumble and settle without angle interpolation, alignment snapping or permanent constraints. Contact manifolds are reused between geometry refreshes; dense piles receive a bounded iteration budget. Quiet containers resting on the yard can sleep and wake on collision. Off-map bodies are discarded and each arena retains at most 60 containers. Stable scoring is reconstructed from physical supports. Existing 2–8-player rules, 100-foot instant victory, 60-second timeout, join-order ties and server authority remain intact.

Paint assignment now follows the container ID throughout pickup, carry and release. The main cable, triangular bridle, spreader and two lower slings remain visible after release. The empty assembly retains pendulum movement and its lower slings hang freely.

Derby uses a shared boom-tip transform and a continuous three-dimensional pendulum arc. Slew stops prevent rotation away from the jobsite. Rope length changes with raise/lower controls, hoisting changes angular momentum, and acceleration/reversal drive the pendulum. The cable and ball eye align with the pendulum. Whole panels and scaffold bays briefly fall and rotate when destroyed, alongside the existing capped, instanced debris. Seeded prop variation, structural support propagation, one-time awards and all 31 target identities are preserved. **30/31 remains a valid result when a target survives.**

The in-round standings are compact and scrollable, exposing the crane and ball on narrow screens while retaining access to all eight workers.

## Verification

- Production build: TypeScript client/server checks and Vite production build pass. The existing shared Three.js/podium chunk exceeds Vite's advisory 500 kB threshold; no new build error.
- Full isolated regression: 58 files / 297 tests, zero failures and zero skips. See `qa/m31/full-regression-final/summary.json` and per-file TAP records. Each test file receives its own production server and matchmaking pool.
- Five dedicated M31 tests cover fast angled drops onto the yard/pad/edges, natural rotation, repeated releases and cleanup, the connected 3D cable-length invariant, hoisting momentum and continued swing after stopping.
- Existing Tower tests cover native-control 100-foot construction within 60 seconds, genuine overhang collapse, support removal, exact timeout, instant victory, private snapshots and deterministic ties.
- Existing network tests cover two/eight actual clients, reconnect reservations, host transfer, replay, mode switching, scoring isolation and protocol rejection. Dedicated control checks exercise every lobby size from two through eight. Browser bots operate seven cranes simultaneously while the browser operates the eighth.
- Browser lifecycle: 17 checks, zero page errors and zero WebGL warnings. Natural 60-second results agree between desktop and touch-emulated clients; reload/reconnect, host transfer, replay and the unchanged Party entry remain functional.
- Matching before/after browser captures: desktop 1366×900, portrait 390×844, landscape 844×390 and narrow 319×740. Tower pickup, released rig, next assigned color, Derby controls and standings scrolling are checked. See `qa/m31/after/browser.json` for final checks and timings.

Two old assertions were updated for the physical solver: a resting rotated rectangle is checked within contact tolerance rather than forced to an exact upright coordinate, and overhang tipping is observed over 0.7 seconds rather than requiring an artificial impulse on the first tick. The original normal-control 100-foot test remains unchanged apart from formatting. Initial environment failures (local clone helper, offline dependency metadata and restricted localhost access) were resolved; a browser harness stale-snapshot race was corrected by waiting for a fresh reconnect snapshot. They were not ignored or counted as passes.

## Performance and limits

Measured on this laptop, with other verification work running. Eight Tower arenas, respectively 10/30/60 containers each: physics tick p95 **11.50 / 17.76 / 30.31 ms**. At the artificial maximum of 480 total containers, one sampled tick reached **42.63 ms**, beyond the 33.33 ms server step budget. Normal 100-foot rounds terminate at ten stable levels; the maximum-density stress case is a remaining performance limit, not an iPhone frame-rate claim.

Eight Derby arenas simulated for 180 seconds: p95 **0.050 ms** per combined tick; peak observed debris 40 per arena, bounded by 72, and zero debris remaining at the end. Simultaneous-destruction regression independently exercises the 72-fragment cap. Browser frame interval/heap samples are in `qa/m31/after/browser.json`; headless Edge timing is not physical display FPS.

**Physical iPhone Safari verification remains outstanding.** The mobile evidence uses Edge touch/viewport emulation on the laptop. No claim of physical iPhone performance or feel is made. Derby still uses its established x/y facade projection for target collision and scoring while rendering a three-dimensional sweep; it is not a full 3D rigid-body demolition engine. Consequently depth separation is visual, not part of target hit qualification. Falling whole panels are bounded client animations; fragments and awards remain authoritative.

## Integration and recovery

Only the M31 checkout is changed. #29 remains the verified base; #30 is neither read nor changed. The final Git worktree is clean. The self-contained recovery bundle is created after the commit, verified with `git bundle verify`, restored into a separate checkout, checked with `git fsck --full`, and compared to the final commit/tree. Exact outcomes are in the external release manifest.

To review: compare this branch directly with the verified base. Do not include another milestone's checkout. To preview: install the lockfile dependencies, run `pnpm build`, then `pnpm m31:start`; the dedicated production preview port is **2731** (development reservation **5231**). The launcher refuses an occupied port and never stops another process. The temporary #29 comparison copy used port 2732.

To restore: `git clone Beam-Crew-m31-crane-physics-recovery.bundle recovered-m31`, then check out `feature/final-crane-physics`, install the locked dependencies, build, and run the same verification scripts. No external Git history is required by the bundle.

## Visual evidence

| Scenario | Before (#29) | After (#31) |
|---|---|---|
| Empty rig after release | [Before](qa/m31/before/tower-released.png) | [After](qa/m31/after/tower-released.png) |
| Next assigned color | [Before](qa/m31/before/tower-next-color.png) | [After](qa/m31/after/tower-next-color.png) |
| Derby desktop | [Before](qa/m31/before/derby-desktop.png) | [After](qa/m31/after/derby-desktop.png) |
| Derby portrait | [Before](qa/m31/before/derby-portrait.png) | [After](qa/m31/after/derby-portrait.png) |
| Derby landscape | [Before](qa/m31/before/derby-landscape.png) | [After](qa/m31/after/derby-landscape.png) |
| Derby narrow | [Before](qa/m31/before/derby-narrow.png) | [After](qa/m31/after/derby-narrow.png) |
