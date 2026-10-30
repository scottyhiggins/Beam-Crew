Milestone 20 — Pumpkin Hard Hat verification

Base: 1773767411546a92020c67b03cbec2d34a48555b (Protocol 19)
Branch: feature/seasonal-pumpkin

Focused cosmetic regression: PASS (5/5)
- All 84 free looks validate; invalid selections fall back safely.
- Server join enforces the allowlist.
- Pumpkin worker model renders and preserves animated poses.
- Wheel and competitive multiplayer: appearance sync, reconnect and new rounds pass.

Production build: PASS (pnpm build; TypeScript checks and Vite production build).
Full regression suite: PASS (176/176, captured earlier in verification/milestone20-regression.txt).

Run locally on a separate port with PORT=25920 and NODE_ENV=production node build/server/index.js.
No deployment, push or merge performed.
