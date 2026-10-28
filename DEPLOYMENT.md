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
