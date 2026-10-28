# Visual polish 2 — focused sharpness and spill quantity fixes

Build **BREAK TIME · Visual polish 2**, protocol **8**. October 28, 2026. The accepted Visual polish 1 remains recoverable: branch `codex/pre-visual-polish2-20261028` at `034a68f`, existing `codex/pre-graphics-20261028` untouched, external `Beam-Crew-pre-visual-polish2-20261028.bundle` in the ChatGPT project workspace. Previous live deploy `dep-dbh3fbsipgvc73dm2ju0` used gameplay source `ca5ec18`.

## Sharpness

The old renderer capped device pixel ratio at 1.5 and only resized its buffer on a window resize. Antialiasing was already enabled. The canvas now uses an explicit fixed viewport display size, matching drawing-buffer dimensions, with no CSS transform/filter; resize observation handles orientation/address-bar changes and DPR changes handle zoom/display moves. HUD and menus stay native DOM text, outside the adaptive 3D buffer. The results panel no longer uses a centering transform.

Start at up to 2x DPR, capped at 2 million drawing-buffer pixels on coarse-pointer devices and 5 million on desktop. Two sustained slow 3-second windows lower the resolution multiplier, while thirty seconds of frame-rate headroom raises it gradually. Background gaps reset sampling. Normal laptop rendering never drops below one buffer pixel per CSS pixel; on very large displays the explicit pixel budget still applies. No postprocessing, extra lighting, high-performance GPU request, or native 3x iPhone full-resolution rendering was added. Physical iPhone sharpness, sustained frame rate and heat need acceptance testing; browser viewport tests cannot establish thermal behavior.

## Spill quantities and unchanged difficulty

Root cause: the server correctly emits six hazard records per spill, but Visual polish 1 rendered a whole loaded arrangement for each record. The fix distributes one load across those six unchanged records. Counts: PVC/rebar 5, mini barricades/hose 2, bricks/blocks 6, lumber/plywood 4, gravel/rubble 12. Cement/sand use six smaller patches whose combined modeled volume is one load.

Client allocation is deterministic from ordered synchronized records and `amount`. Each solid object's original mesh parts, shape and colors are retained; cached baked pieces use at most one draw call per record. Empty fractional-object slots have a visible ground spill mark, so their existing collision/effect zones do not become invisible. All six server hazards, radii, material effects, permanent persistence, scoring and synchronization are unchanged. Repeated spills and existing cap aggregation retain quantities; extreme aggregated piles retain a bounded visual representation (up to 12 visible pieces per record), with unchanged server amounts/effects.

All twelve materials were visually inspected loaded versus a complete six-record spill. Automated checks compare total object counts, geometry vertex totals, color histograms, loose volume, cache reuse and capped mixed-material aggregation. A new real two-client test spills every material, compares deterministic presentation on both clients, and verifies reload persistence/reconnect. Initial test-driver fence stopping and stale previous-round reads were corrected in tests only.

## Championship planning only

See CHAMPIONSHIP_PLAN.md: ten distinct modules, unique randomized 3/5/10-course routes, standardized continuous connectors/shared yards, no teleports/loading screens, last-finisher synchronized 3-second countdown, material persistence, cumulative spills/time and champion/most-spills/slowest awards. It covers a finite city construction corridor, instancing/culling/fog and mobile budgets. Implementation gates are two connected courses first, then ordering/scoring, then expansion toward ten. No courses, Championship runtime, Crane Challenge, Trivia or new city scenery were implemented.

Final production build and all **64 local tests passed**, zero failures/skips, including all twelve materials across two connected clients. Canvas buffer/display dimensions matched at desktop and phone viewport sizes with no CSS transform/filter. Verified live October 28, 2026: **BREAK TIME · Visual polish 2**, protocol **8**, gameplay commit **5a6eb1d61be968d601265b55c3eb9b15d9adc4c3**, Render deploy **dep-dbh5h1flk1mc73facagg**. Production build and all **64 tests passed locally and against the public Render server**, zero failures/skips. HTTPS/WSS smoke passed. All twelve materials were spilled across two real connected clients with identical one-load allocations; shapes/colors and total loose volume were checked separately. Render and browser error checks found no entries. The same service/plan/settings remain in use; automatic deploys remain off. GitHub Desktop published the release. Refresh both devices and make a fresh room. Physical iPhone sustained sharpness/frame-rate/heat acceptance is still required. Championship remains planning only. This verification-only documentation follow-up requires no redeploy.

---

# Milestone 5 — Visual polish 1 — October 28, 2026

Build **BREAK TIME · Visual polish 1**, protocol **8**. Connected finish 1 passed the user's five-check acceptance gate. This release changes presentation only: rounded hard hats, faces, reflective vests, boots and walk/carry poses; cart rims, grips, supports and hubs; Beam Carry fasteners; site office, excavator, scaffolding, lumber and trees; grounded scenery, warm lighting, contact shadows and worn ground-painted arrows; compact connected lobby, title, HUD and results styling.

All 12 materials were visually inspected in loaded, spilling and resting states using a temporary local audit (not shipped). Ground hazards now reuse and bake the existing loaded geometry and colors, one cached draw call per hazard. PVC keeps round hollow cylinders/rims; rebar has metal ribs; cement is cool gray; sand/cement keep low piles; barricades, hose, bricks, open cinder blocks, boards, plywood, gravel and rubble retain their silhouettes. A brief client-only spill bounce preserves the server positions and all hazard behavior. A new geometry test checks all 12 identities, finite/bounded geometry and cache reuse.

Final production build and full local suite: **60 passed, zero failures/skips**. Vite reports the existing large bundle advisory (about 189 KB gzipped); no external art/fonts, postprocessing, physics or dynamic shadow maps were added. iPhone physical performance and final visual acceptance require a fresh device playtest. No server gameplay, simulation, scoring, collision, persistence, network schema or protocol changes. No Crane Challenge, Championship or Trivia.

Recovery: branch `codex/pre-graphics-20261028` at `a1845b9`; external `Beam-Crew-pre-graphics-20261028.bundle` saved in the ChatGPT project workspace. Previous public Render deploy `dep-dbgnrek9v7es73avebjg` (source `fc5c981`) remains the recovery deployment. Same service `srv-dbglagdg1s2s73bmg9u0`, workspace `tea-dbgkg8sipgvc73dr3rtg`, unchanged plan/settings, automatic deployment off. Verified public release: **ca5ec181e53453a075910ceb356d310001386c57**, Render deploy **dep-dbh3fbsipgvc73dm2ju0** live October 28, 2026. Public HTTPS/WSS smoke passed; **60 tests passed against Render**, zero failures/skips. Public browser shows Visual polish 1 and no console errors; Render post-deploy error query returned no entries. GitHub Desktop published the release successfully after CLI push stalled. Refresh both devices and create a fresh room for physical iPhone visual/performance acceptance. This documentation follow-up needs no deployment; auto-deploy remains off.

---

# Connected finish verified publicly — October 27, 2026

Public play: https://break-time-9n1k.onrender.com . Build **BREAK TIME · Connected finish 1**, protocol **8**, source **fc5c9815a56be44c8990cd6f1d38f6a4eb99b77e**, Render deploy **dep-dbgnrek9v7es73avebjg** confirmed live. Gameplay commit pushed via GitHub Desktop. Same single approved service, plan and workspace; no billing/configuration changes. Auto-deploy remains off.

- Final local production build/full suite: **59 passed, zero failures/skips**.
- Public HTTPS/WSS smoke and full suite against Render: **59 passed, zero failures/skips**. Real two-client tests cover continuous finish/staging movement, post-finish spills with identical frozen official scores, stopped elapsed clock, reconnect/restart, material choices, ropes/checkpoints, eight clients and Beam Carry. A prior local Beam network timeout passed on clean rerun and publicly; Beam gameplay was not changed.
- Browser keyboard play on the local production build verified natural crossing at speed, connected yard, visible segmented spike strip, staging spill/reload with official 27.87s/0-spill result unchanged, and reverse blocking. Screenshot saved outside the repository as BREAK-TIME-connected-finish.png. The public browser loaded the new label and compatible server; screenshot BREAK-TIME-connected-public-version.png.
- Post-deploy Render error-log query returned no entries. Test rooms/temporary local server were cleaned up; public browser left at the new build lobby.
- Human acceptance remains: refresh laptop and iPhone, confirm Connected finish 1, create a fresh room and run the new PLAYTEST.md checklist. Check ramp appearance/rise and phone performance, natural finish motion, bumps/spills, reverse blocking, both final boards and score freezing on separate networks.

This verification follow-up changes documentation only; publishing it does not require another deployment. The gameplay release is already public. No Championship, second course, Trivia or Crane work was added.

---

# Connected finish release preparation

Build **BREAK TIME · Connected finish 1**, protocol **8**. Same approved service `srv-dbglagdg1s2s73bmg9u0`, workspace My Workspace, HTTPS/WSS URL https://break-time-9n1k.onrender.com . No plan/billing/resource changes. Manual deployment required after source is pushed; the previous public version remains live until verified.

Local production build and full suite: **59 passed, zero failures/skips**. Local browser play passed continuous crossing, natural speed retention, yard movement, a post-finish spill with unchanged official score, and reverse blocking. Source commit/Render deploy/public verification are added when confirmed. Refresh both devices and create a new room after updating; physical iPhone acceptance remains pending.

---

## Previous verified deployment

# Current public finish-fix release

Verified October 27, 2026: https://break-time-9n1k.onrender.com . Live source **bca25d93e1558c3eafa700cafa5a6fcc9135f375**, deploy **dep-dbgmodflk1mc738vl3q0**, protocol **7**, build **BREAK TIME · Finish fix 1**. Reused the existing single approved Render service; auto-deploy off, /health configured, same corrected build command.

All **55 tests passed locally and against the public server**, none skipped. HTTPS/WSS smoke passed. Real browser play verified the final scoreboard opens with both racers' times/spills/places, and remains frozen while the finished cart drives only within staging. Phone-width 390x844 layout bounds passed; physical iPhone hotfix acceptance remains pending. No runtime errors were returned by the post-deploy log query.

The user pushed the gameplay fix with GitHub Desktop before this deploy. This verification record is a documentation-only follow-up; pushing it does not restart the game. Refresh both devices after the deploy and use a fresh room to test the fixed finish. No new paid services, Championship mode or second course were added.

---

## Previous deployment record (superseded above)

# Verified live BREAK TIME — October 27, 2026

**Public play URL: https://break-time-9n1k.onrender.com**

- Render workspace: My Workspace (tea-dbgkg8sipgvc73dr3rtg), explicitly confirmed by the user.
- Service: srv-dbglagdg1s2s73bmg9u0; one Oregon Node instance, 0.5c-512mb (formerly Starter), approximately $7/month base. User approved this paid service within a $10/month budget, reported $0 credits, and added a payment method. No other resources were created.
- Dashboard: https://dashboard.render.com/web/srv-dbglagdg1s2s73bmg9u0
- Live deploy: dep-dbglie6gekts73897epg, source e57c254d04de9cdd195712e6419e910321ce2aa4. Render reported live at 2026-10-28T02:09:30Z (October 27 in America/Denver).
- Build: corepack pnpm install --frozen-lockfile --prod=false && corepack pnpm run build
- Start: node build/server/index.js; Node 24.22.1; NODE_ENV=production; HTTP health check /health; protocol 6. Auto-deploy is off to prevent interrupting matches.
- The first build failed at corepack enable because /usr/bin/pnpm is read-only. The corrected direct corepack command succeeded. The user saved the build command and /health in Dashboard; render.yaml now matches.
- Public smoke passed: HTTPS/title/health/protocol, WSS, two-client room-code lookup/join, assigned beam ends and Wheelbarrow countdown.
- Full suite against TEST_URL=https://break-time-9n1k.onrender.com: **49 passed, zero failed/skipped**. Automated drivers now wait for both clients' synchronized state and brake using feedback to handle public-network latency. No game physics or controls changed for those test refinements.
- Public browser smoke passed creating a room, following its invite link with a second client, selecting materials, and showing synchronized Wheelbarrow countdown/course/carts/rope. Preview saved outside the repo as BREAK-TIME-public-race.png in the chat workspace.
- Runtime error-log query after launch returned no errors. Observed one-minute CPU samples stayed below .03 CPU and memory below about 56 MB during these tests, versus .5 CPU/512 MB allocated. This is a small functional load check, not a production capacity guarantee.
- Physical iPhone/cellular performance and fun acceptance remain human tests. Browser smoke also observed a pre-existing Leave-room reconnect-message quirk; refreshing returns to a clean lobby. Lobby behavior was not changed in this release. Track that small client recovery issue separately.

Run pnpm smoke:public https://break-time-9n1k.onrender.com for a short recheck. Avoid deploying/restarting during a race: rooms/results are in-memory. For an intentional new release, push the tested source and trigger exactly one manual deploy for this same service, then verify its deploy ID, /health and multiplayer. Code for this game does not run on the laptop in production.

The ready production gameplay commit e57c254 is already on GitHub. Local follow-up commits contain the build recipe, network-test refinements and this record; if CLI authentication fails, GitHub Desktop → Beam-Crew → main → Push origin publishes them. Auto-deploy remains off, so documentation/test-only pushes do not restart the live game.

---

## Historical preparation and account handoff (superseded above)

# BREAK TIME — public hosting handoff

Status October 27, 2026: source/build/test preparation complete; **no service activated and no verified public play URL**. Do not call deployment finished until the checks below pass.

## Budget and account

The user created Render using a school GitHub account. Use available credits first. Budget is up to $10/month, **but ask before activating any paid service**, even if credits would initially cover it. Do not assume a school GitHub login grants credits. The current GitHub Student Developer Pack catalog does not list Render; account-specific promotions/credits are still unverified. In Render open the workspace Billing page and inspect credit balance, promotions, estimated cost and taxes/usage before proceeding. No payment details were read or entered.

Render is installed in ChatGPT, but authenticated account tools were not available in this run. The in-app browser reached GitHub sign-in. Inspection of the user's existing Windows Chrome window was stopped by the Computer Use helper because it could not verify the current browser URL. Account credits remain unknown. Finish connecting Render/sign in before continuing account-side work.

## Concrete service configuration (awaiting approval)

Use one Render **Web Service**, never a Static Site: this game needs a persistent Node/Colyseus WebSocket process. No database, disk, paid workspace upgrade, extra replica or autoscaling is needed. Proposed compute: 0.5 CPU / 512 MB (formerly Starter), typically $7/month base; verify the actual checkout and credit coverage first. Keep the total within the $10/month limit. Free compute is possible for a smoke preview but sleeps after 15 minutes without inbound traffic and can take about a minute to wake; it is not the recommended competition setup.

The ready Blueprint is render.yaml:

- Name break-time (Render may assign a suffix if taken); source https://github.com/scottyhiggins/Beam-Crew, branch main; Oregon region.
- Node 24.22.1; NODE_ENV=production; one instance. Rooms live in memory, so replicas would split room lookup and joins.
- Build: corepack pnpm install --frozen-lockfile --prod=false && corepack pnpm run build
- Start: node build/server/index.js
- Health check: /health
- Auto-deploy off. Publish only a tested commit between matches; a server restart/deploy destroys in-memory rooms and results.

After source is pushed and account/budget approval is complete, Render Dashboard → New → Blueprint → select Beam-Crew/main → review render.yaml → review exact bill/credits → approve the service activation. Alternatively New → Web Service → Public Git Repository → paste the source URL and enter the values above. Do not create duplicate services.

Render provides managed TLS/HTTPS and supports WebSockets. The client derives wss:// from the HTTPS page origin, so no separate socket host, custom domain, tunnel or laptop process is required. The server binds 0.0.0.0 and Render's PORT. Share only the actual HTTPS URL shown on the deployed service.

## Verify before declaring live

1. Build/deploy must finish successfully. Open the assigned HTTPS URL and /health; confirm BREAK TIME, protocol 6, and a fresh startedAt value.
2. In the repository run pnpm smoke:public https://<actual-service-host>. It checks TLS/page, build identity, secure two-client WebSockets, room-code lookup/join, assigned beam grips and Wheelbarrow countdown. It closes test rooms. This script has been syntax checked but cannot be exercised publicly until a real service exists.
3. Run the full network acceptance suite with TEST_URL set to that HTTPS origin if possible (pnpm test); expect zero skips. Never send test traffic to an unrelated service.
4. Physical laptop and iPhone: join by code and HTTPS link; finish a Wheelbarrow race, verify both final panels/timers/staging; complete a paired beam race. Turn the laptop server off and use iPhone cellular to prove hosting independence. Compare latency/smoothness and verify no insecure WebSocket or mixed-content errors.
5. Record the exact URL, deployed commit, credit balance/estimated cost, smoke result and physical-device findings in PROJECT_STATUS.md. Until then public deployment is pending.

## GitHub Desktop fallback

If command-line authentication fails, open GitHub Desktop → File → Add local repository → C:\Users\higgi\OneDrive\Documents\Beam-Crew. Select main. The tested release is already committed; click Push origin, sign in if asked, and verify the new commit on GitHub. Leave pre-existing untracked helper/work files unselected. No reset, clean, force push, repository rename or folder move is needed. If Desktop says Fetch origin, fetch and inspect divergence before taking any merging action.

## References checked October 27

- https://render.com/docs/web-services
- https://render.com/docs/websocket
- https://render.com/docs/tls
- https://render.com/docs/blueprint-spec (current compute ID 0.5c-512mb)
- https://render.com/docs/free (free instance limitations)
- https://render.com/pricing (confirm the live bill before activation)
- https://education.github.com/pack/ (no Render offer found in the current catalog)
