# M29 verification notes

The supplied #27 object ID has transposed characters and is unavailable locally. The explicitly permitted verified recovery bundle was used. Its SHA-256 matches the M27 checkpoint, bundle verify passes, and a fresh bare import plus fsck confirms the recorded exact head. See source-verification.json.

The initial restricted regression attempt could not reach any temporary server: 56 infrastructure failures, zero tests executed. Retained in regression.log and full-regression/summary.json. The full authorized run then passed 291/291. A new Party Night stale-Random/replay regression was added and the complete final suite was run again: 292 passed, zero failed/skipped across 57 files. Counts are unique test cases, not totals across repeated runs.

The per-file fresh-server harness is inherited from #28. It avoids unrelated tests consuming the same public Quick Match pool. No assertion was removed or weakened. The prior M27 concurrent Quick Match interference is documented in M27-HANDOFF.md; both Quick Match files and all integrated tests run in the complete suites here. No application Quick Match changes were needed.

Windows restricted Git helper, dependency link, network/CIM and firewall operations required authorized execution. The first firewall attempt lacked administrator rights; the completed administrator run produced network-firewall.json. Firewalls remain enabled and existing preview rules were not modified.

Client conflicts retained M28 menu, FFA labels, 3/5/10 championship lengths, live leaderboard, staging notice, change-game controls and reused camera vectors. Added M27 Random intent UI and terrain height without replacing M28 presentation. Party Night explicitly clears beamRandom before setting its existing fixed course 2. No Party course chooser was added.

Browser checks use production M29 assets in Edge, desktop and touch viewports. Beam checks use two rendered browsers plus SDK clients for larger crews. Full-course delivery/checkpoints/hazards/falls have deterministic simulation coverage; the browser matrix checks carry/release, selection, synchronization and replay rather than human navigation through every obstacle. Wheel podium and Party final screens use clearly separate loopback-only fixtures to accelerate finish/timeouts; production LAN has no fixture endpoints. Physical iPhone Safari has not been operated.
