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
- Build: corepack enable && pnpm install --frozen-lockfile --prod=false && pnpm run build
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
