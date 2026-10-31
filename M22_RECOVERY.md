# M22 recovery and rollback

No push, merge into main, deployment, production configuration change, or feature-checkout modification was performed.

- Candidate branch: `feature/final-release-integration` in the NEW `Beam-Crew-final-release-integration` checkout.
- Baseline: `1773767411546a92020c67b03cbec2d34a48555b`, Protocol 19.
- Input checkpoint: sibling `Beam-Crew-m22-input-checkpoint.bundle` (created before merging; Party SHA correction is documented in the release report).
- Final checkpoint: sibling `Beam-Crew-m22-final-release.bundle`. Includes the final branch and exact input commit objects, including the user-confirmed Party Night commit.
- External manifest: sibling `Beam-Crew-m22-release-manifest.json`. Records final commit, protocol, exact input SHAs, checks, and bundle SHA-256. It is outside the repository to avoid a self-referential commit hash.

Verify and restore into a NEW directory:

```powershell
git bundle verify ..\Beam-Crew-m22-final-release.bundle
git clone ..\Beam-Crew-m22-final-release.bundle ..\Beam-Crew-m22-restored
git -C ..\Beam-Crew-m22-restored switch feature/final-release-integration
```

Inspect/restore the previous baseline independently:

```powershell
git clone ..\Beam-Crew-m22-final-release.bundle ..\Beam-Crew-m15-rollback
git -C ..\Beam-Crew-m15-rollback switch --detach 1773767411546a92020c67b03cbec2d34a48555b
```

From the chosen new checkout, run `pnpm install --frozen-lockfile`, `pnpm build`, and `node scripts/test-live.mjs`. These commands do not deploy. Do not restore build output over a running production service. A future approved deployment must publish matching client/server artifacts together: Protocol 19/20 clients are not this Protocol 21 candidate.

For the current task there is nothing to roll back in production. Stop only the candidate's local server if abandoning it; preserve the baseline and feature checkouts unchanged.
