# Milestone 18 recovery checkpoint

- Isolated checkout: `Beam-Crew-podium`
- Branch: `feature/podium-results`
- Baseline: `1773767411546a92020c67b03cbec2d34a48555b`
- Preview: `http://localhost:2618/podium-preview.html` (sample fixtures only)
- Game: `http://localhost:2618/`
- Port: 2618; baseline default is 2567.
- The final milestone commit is the recovery checkpoint. `git rev-parse HEAD` records its hash.

Integration: review and cherry-pick the milestone commit onto the integration branch when appropriate. Shared ranking presentation is in `shared/podium.ts`; the reusable Three.js renderer is in `client/podium.ts`. Trivia cosmetic looks are optional view metadata. No authoritative score or protocol version changes are required. This task does not merge, push main, or deploy.

Wheelbarrow continues to use server-recorded spills-first places, Championship uses cumulative standings, Beam Carry uses server-recorded team results, and Trivia keeps its score/time standings. The podium does not invent a place for DNF or unranked workers. Awards use observed match results.

Browser checks: `docs/podium/browser-checks.json`. Screenshots: `docs/podium/`.
