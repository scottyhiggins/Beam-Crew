# BREAK TIME — competition readiness checklist

Close the previous server, relaunch Start-BeamCrew.cmd, confirm BREAK TIME and refresh both browsers. Laptop http://localhost:2571; iPhone on the same Wi-Fi at http://<current-laptop-IPv4>:2571. Public play URL: https://break-time-9n1k.onrender.com . The full 49-test suite passed against this public server; physical iPhone acceptance remains pending. Record device/iOS/browser, network, player count and any error text.

## Wheelbarrow fixes

1. Inspect all 12 loads. Cement/sand should look like slurry/heap; PVC/rebar like tubes/rods; barricade/hose like barriers/coils; bricks/blocks like bricks/hollow blocks; lumber/plywood like boards/sheets; gravel/rubble like small/large stones. Reload keeps the selected load. Loaded handling remains equal. Six paired categories and duplicates still work.
2. Drive into gaps between every pair of yellow pylons, at corners and at full speed. The visible rope must block the worker/cart; bends remain traversable. Try reaching finish from the wrong side or missing any ordered checkpoint: no result. Reverse/turn to recover after hitting a fence.
3. Finish one player while another races. The finished worker/cart remains visible and freely moves around staging. Drive backward and in every direction for 30 seconds: never cross the finish line, reach active racers, push hazards, spill or finish twice. Construction ground continues through staging with no blue/green pad. Phone and laptop agree on position.
4. Finish everyone. The main elapsed timer must stop on both screens. A final-results panel must open automatically on laptop and iPhone without opening Lobby controls. Score fewest spills first, then fastest time. Dismiss with Keep driving in staging; movement remains available. Refresh phone after results: the final panel and unchanged timer reappear. Restart: fresh countdown, zero clock, empty results/piles, no stale final panel.
5. Finish one racer, disconnect the unfinished phone, reconnect within 30 seconds and continue. Repeat with permanent Leave room: remaining completed results should become final. Finished-player departure preserves recorded results; host transfer/restart remains available. A connected unfinished racer is never timed out prematurely.

## Beam Carry regression

1. There is one Beam Carry option: two-worker teams. With two workers verify opposite assigned ends, Space/ACTION grab/release, matching movement, deliberate rotation, lowered unsupported end/drag, doorway/column and delivery. Team time/place appears once. Restart and replay.
2. Repeat with 4/6/8 workers: independent simultaneous beams, exactly two workers per beam and a unique end per worker. Non-host cannot restart/start/switch modes. Other teams cannot block/grab your beam. With 3/5/7 workers, one spectator; select Wheelbarrow for everyone to race.
3. Refresh/disconnect while gripping: end drops, reconnect resumes the same team, re-grab required. Permanent departure produces DNF. Host departure transfers controls. Watch overlapping teams for readability and phone smoothness; no course expansion should be present.

## Lobby, mobile and long-run regression

1. Create, code join, share-link join, material selection, start, Lobby controls, restart, return and leave behave as before. Joystick still hides when the lobby/menu is open; menus are reachable in portrait/landscape. No change to lobby auto-opening/closing behavior.
2. Compare aggressive versus careful laps for each hazard pair. Sticky slows, rolling coasts, fixed blocks, heavy pushes, bumpy adds risk, rough raises spill risk over an area. Identical base steering/stability/speed. Verify piles remain bounded after repeated spills.
3. Race/restart for at least 10 minutes on physical iPhone, including an eight-player room. Watch frame rate, input latency, heat and memory/resource accumulation. Test app backgrounding, rejoin within 30 seconds and stale-server rejection after relaunch. Automated geometry/network success does not establish phone performance or fun.

## Public competition gate (deployed)

1. Verify actual HTTPS URL and /health protocol 6; run pnpm smoke:public with that URL. Room codes and links must work over secure WebSockets.
2. Turn off the laptop game server. Join from iPhone cellular and another device/network; complete both modes, results and replay. This proves the public game runs independently of the laptop.
3. Verify Render single instance, credits/actual bill and no unapproved paid add-ons. Avoid deployment/restart during a match; rooms/results are in-memory. Record the exact successful public URL and deployed commit.

Mark pass/fail and report screenshots/errors, device model, delay, most confusing action and whether another round feels fun. Graphics polish, championships, briefing, trivia, crane and rewards remain future work.

Observed browser recovery quirk: after explicitly leaving, a reconnect message may appear. Refresh to start from a clean lobby; record whether the same occurs on iPhone. This pre-existing behavior was not changed in the deployment pass.
