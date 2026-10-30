# Quick Match candidate verification

Date: October 30, 2026.
Command: `pnpm test:all`.
Result: PASS. Production TypeScript/server/client build succeeded.
Tests: 115 passed, 0 failed, 0 skipped, 0 canceled.
Duration: 434858.878 ms.

New real-socket cases passed: public/private separation, concurrent eight-player filling, full-room ninth-seat rejection, ninth Quick Match allocation to another room, duplicate assignment rejection, waiting cancellation/disconnect/re-entry, server countdown, racing reconnect, late-join exclusion, replay re-entry, 64-room limit and cleanup, FIFO deletion on two clients and reconnect snapshots with frozen scores.

All pre-existing tests passed, including Beam Carry, private reconnect, all materials, finish gates and connected sockets, and full randomized 3/5/10-course Championships.

Local server-only profile: see hazard-profile.json. At 150 hazards with eight players: mean approximately 0.20 ms/tick, p95 approximately 0.35 ms/tick. This excludes rendering, network patch cost, and physical device performance.

Pending: desktop-browser and physical iPhone stress/playability checks, including dense mixed-material debris at critical passages and end-to-end Play Again from the visible public results screen. See QUICK_MATCH_REVIEW.md for the complete checklist.
