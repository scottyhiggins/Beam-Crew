# Work 14 — Free Worker Store

Baseline: Protocol 16, 94122866c5334f2220aab8c0e44aca07c1b64a08.
Branch: feature/worker-customization.
Isolated clone: Beam-Crew-worker-store-work14. Local preview: http://localhost:2614.

The existing Worker Store tile opens a modal with a lit 3D worker on a pedestal. Includes six hard hats, four vests, three expressions, drag / keyboard / button rotation, front view, classic reset, and explicit save. All options are free immediately. No account, currency, purchases, or unlocks.

Selections are validated when loaded and saved in browser localStorage under break-time-worker. A storage failure is explained and keeps the look for the current visit. Unsaved changes are discarded on reopening. The saved look is applied to this client's own worker when entering the next room. Other players retain their existing color identity; cosmetics are not network synchronized. No protocol or server changes.

Integration files: client/main.ts (store tile, installation, own worker look, slogan, input guard), client/worker.ts (optional cosmetic model), client/worker-store.ts (screen and persistence), client/style.css (responsive screen). Main menu slogan now uses WORK HARD. PLAY HARD.

Validation: production build passed; existing tests 92 passed, 17 skipped, 0 failed. Browser checked tile opening, visible 3D preview, blue hat / green vest / goofy selection, rotation button, save confirmation, and persistence after page reload. Desktop screenshot: worker-store-preview.png. Mobile layout is implemented but has not been visually checked. Network tests were skipped by the existing test configuration.

No merge, push, deployment, production environment changes, or edits to other Work folders. To run locally in PowerShell: set the PORT environment variable to 2614, then run pnpm dev in this clone.
