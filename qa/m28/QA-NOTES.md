# QA investigation notes

## Historical M26 intermittent Quick Match failures

The exact M26 commit records two concurrent failures in verification/m26/m26-live-tests.txt. Its first public-match lifecycle case timed out waiting for a single player; its capacity case received “Quick Match is busy” before filling its own 64 rooms. Another test file, final-integration-network.test.ts, concurrently calls joinOrCreate on the same wheel_public type. PublicWheelRoom uses shared room and assignment collections and a 64-room bound. A pre-existing public player changes the first test's expected room size and consumes the capacity test's room budget. These are conflicting test assumptions about shared public matchmaking state. The isolated passes recorded by M26 are consistent with this cause.

M28's first complete shared-server run passed all 255 tests; the historical failures were not reproduced in that run. To remove the source of interference, scripts/test-live.mjs now gives every file a fresh production server while retaining four concurrent file workers and every original assertion. The complete new run passed 255/255 with zero skips. This is a full-suite result, not a union of isolated failure reruns. No production matchmaking limits, timing, scoring, or behavior were weakened.

## Browser harness issues investigated

- The original M25 question-ready predicate dereferenced an answer button during a DOM transition. The integrated test now waits for an existing enabled button with optional chaining; the complete 31-check suite passes.
- The expanded Crane script incorrectly assumed a reloaded host retains host authority. The game correctly transfers authority to an online worker. The corrected test explicitly verifies this and uses the new host for switching modes. Initial report and log are retained.
- The inherited Wheelbarrow and menu scripts wrote the same report filename. Reports were separated; the complete 31-check menu report was reconstructed from its passing stdout, and the 38-check Wheelbarrow report retained.

## Presentation correction from visual review

With eight Crane workers at 740×319, the unbounded live leaderboard continued behind touch controls. The final CSS bounds its height and enables scrolling, including a landscape-specific height. The final browser assertions check separation from controls and scroll access to the eighth standing at desktop, 319px portrait, and landscape. No gameplay or server code changed for this correction.

## Execution environment

The first restricted test launch could not reach its spawned server and ran no tests. The subsequent complete runs used approved local process access. Firewall creation first failed with Access Denied; a Windows administrator prompt then installed the one requested Private-network rule. All firewall profiles remained enabled.
