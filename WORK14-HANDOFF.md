# Work 14 — Multiplayer Worker Store handoff

## Isolated delivery

- Checkout: `Beam-Crew-worker-store-work14`.
- Branch: `feature/worker-customization`, based on Protocol 16 / `94122866c5334f2220aab8c0e44aca07c1b64a08`.
- Approved store design: `04e6822fec1f7a9e2592cf3132431bdf95051ca2`.
- Development port remains 2614. No other Work directories, branches, terminals, or browsers were changed.
- No main merge, push, deployment, or production environment changes.

## Behavior

The approved UI, all 72 free combinations, rotation controls, and local browser persistence remain intact. Creating/joining a room supplies the saved selection. Attaching a room (including reconnect) resubmits the saved selection through the authenticated client connection. Saving while connected also sends the selection.

The authoritative Player schema now synchronizes `hat`, `vest`, and `expression`. Join options and the `cosmetics` message both use the same allowlist validator. Missing, incomplete, or invalid selections become the full classic look (yellow hat, orange vest, happy expression). Only these three sanitized fields are assigned. A client cannot select another player's ID or inject movement, color slot, or scoring fields.

Clients render every worker from that player's synchronized fields, keyed by session ID. A changed look rebuilds only that worker's decorative model, disposes its old resources, and preserves its position and rotation. Both Wheelbarrow and Beam Carry use this path. Server reservations retain cosmetics across reconnects; round resets leave them untouched. Simulation, collision, scoring, and hitbox code are unchanged.

The wire schema changed, so this isolated branch uses Protocol 17. Client and server must be released together.

## Integration conflict check (no merge performed)

Read-only snapshots were imported into this clone; the other checkouts were not modified. `git merge-tree --write-tree --name-only` checked the complete feature against:

- Work #10 `cffe2dcac37adbf935771ae28b68119a01442691` (`feature/integration-chaos-quickmatch`): content conflicts in `client/main.ts`, `client/style.css`, `server/room.ts`, and `shared/version.ts`. `server/state.ts` merges textually, but its combined schema still needs validation.
- Work #11 `10ffe3e7ae9f83a4ef8e8350f38b801b989b75ca` (`feature/toolbox-trivia`): content conflict in `client/main.ts` (menu tile additions).

Work #10 already uses Protocol 18. During integration choose a new shared version newer than both (for example 19), retain the approved Worker Store and Trivia tiles, preserve #10's gameplay handlers, and add the cosmetic join option to Quick Match's `joinOrCreate` paths. Keep the cosmetic send in the combined `attach` path so reconnects and public matches receive the saved look. Append both sets of styles. Run the combined full suite after resolution. These are committed snapshot checks; subsequent work in #10/#11 may add conflicts.

## Recovery

The original `../Beam-Crew-protocol16-stable.bundle` remains unchanged. SHA256: `F3A305D9ED778373E7849C4A67EAF233D973B00B669DAE4766E822769362B1FE`.

`recovery/work14-approved-store.bundle` preserves the approved UI commit and complete history. SHA256: `A143C0B631C613FC371A9B1F625EDE2F699D423379FBD06ED92210438E130EB3`.

The final multiplayer checkpoint bundle is created after the final validation commit at `recovery/work14-multiplayer-checkpoint.bundle`; its commit and SHA256 are recorded in `recovery/checkpoint.json`. Bundles are local recovery artifacts, intentionally excluded from Git to avoid embedding repository archives in their own history.

## Validation

Full suite results are recorded in `verification/WORK14-full-suite.txt` after completion. Tests added in `tests/cosmetics.test.ts` cover all 72 allowed combinations; malformed values and safe defaults; authoritative join sanitization; injected fields; cosmetic model colors and both grip poses; two real clients with distinct cosmetics in both modes; changes addressed to the sender; malformed network messages; reconnects; restarts; lobby-to-round starts; and fresh joins.

Await integration approval. Do not merge or deploy this branch automatically.

Final validation: `pnpm test:all` passed the production build and all 114 tests, with 0 failures and 0 skipped (438.35 seconds). The focused live cosmetics run passed all 5 tests. The initial cosmetic test restart wait was corrected to respect the existing one-second server cooldown; gameplay behavior was unchanged. Approved store markup and CSS were compared against 04e6822 and are unchanged.
