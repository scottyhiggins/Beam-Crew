# Beam Carry — laptop + iPhone playtest

## Launch
Open the canonical `C:\Users\higgi\OneDrive\Documents\Beam-Crew` folder and double-click `Start-BeamCrew.cmd`. Keep the window open. Laptop: `http://localhost:2571`. iPhone: same Wi-Fi, `http://<laptop-Wi-Fi-IPv4>:2571`; find the Wi-Fi IPv4 with `ipconfig`. Enter different names, create on the laptop, join by room code on the phone, then host selects Start test. The usual local server started during development is temporary; the launcher is the repeatable way to run it.

WASD / virtual joystick controls movement. Space / ACTION toggles grip. An attached worker stays at its grip and its input contributes force. Empty rings are white, nearby rings turn green, occupied rings and tethers use worker colors. HUD says FREE/GRIPPING and both ends carried/one end dragging/grounded. An unsupported end drops with a reddish ground marker. A disconnected worker releases its grip immediately; after refresh reconnect, grab again.

## Try these in order

1. Grab, release, then grab again on each device. Is the state clear immediately? Does Space/ACTION toggle once per press?
2. Carry with one worker near each end. Push the same direction, stop, then reverse. Can you deliberately translate and stop without it feeling trivial?
3. Try opposite directions. Along the beam, opposing inputs cancel; across the beam at opposite ends, they turn it. Is that understandable and funny?
4. Release one end. Compare movement and rotation with both ends supported. Is the lowered/dragging end obvious and meaningfully harder to move? Grab again.
5. Pass through the doorway together. Can you tell when workers or the beam are blocked? Did you communicate naturally?
6. Continue beyond the doorway and turn right around the column. Can you deliberately rotate, then translate? Avoid pushing straight into an obstacle; try changing alignment.
7. Place the entire beam in the green destination. Does DELIVERED appear on both screens? Does it stay delivered until reset?
8. Host: Lobby controls → Reset to doorway checkpoint. Both workers detach and return to the checkpoint. Restart course returns to START. Can you always recover without recreating the room?
9. Refresh the phone; it should recover the same worker, released from the beam. Test a short Wi-Fi interruption and reconnect within 30 seconds.
10. Return to lobby and replay. Have the host leave; the remaining connected worker should inherit host/reset controls. Verify quick signals and join-link behavior.

## Report
Phone model/browser, pass/fail for each step, any error text, whether movement felt delayed, the hardest maneuver, whether carrying prompted communication, and what was confusing. Decide whether the mechanic is fun after playing together; automated tests only establish behavior and synchronization. Milestone 3 awaits your approval.

## Tuning
`shared/beam.ts` → `BEAM_CONFIG`: supported effectiveness .9, dragging effectiveness .2, drive speed 2.8, turn gain 1.6, acceleration response 7, max turn speed 1.25, grab radius 1.25, length 6.4, width .32, carried/grounded height 1.05/.22. `GRIPS` defines eight positions; `COURSE` defines doorway walls, column, checkpoint and destination. Values are world units and seconds. Change one or two values between playtests rather than several at once.

## Milestone 3 — Wheelbarrow Race personal test

The launch window and browser should show **Milestone 3 · Wheelbarrow Race**. If the launcher reports an occupied port, close the existing Beam Crew server window with Ctrl+C before launching again. Refresh both browsers after restarting. If Beam Carry is already running, the host uses **Lobby controls → Return to lobby / change game mode** to reveal the Game mode selector. Only the host can change modes.

1. Double-click Start-BeamCrew.cmd in C:\Users\higgi\OneDrive\Documents\Beam-Crew. Keep its window open.
2. Laptop: http://localhost:2571. iPhone on the same Wi-Fi: http://192.168.1.166:2571 (current Wi-Fi address; check ipconfig if it changes).
3. Create a room on laptop; join its code on iPhone with a different name.
4. Host selects Wheelbarrow Race from Game mode, then Start test. Both carts wait for 3–2–1; GO unlocks driving.
5. WASD / existing joystick points the cart in the desired world direction and pushes it. No grab/action is needed. **Protect the load: fewest spills wins; finish time only breaks equal-spill ties.** Release keys or center the joystick before corners to brake; on desktop feather key presses, on mobile use partial joystick travel for lower speed.
6. Follow painted arrows through the bends, caution-marked rough strips and finish stripe. Your cart has a YOU label and your worker color. A wobbling load and red HUD warn of risk above 70%. At 100% the tray tips, six brick piles remain on the course and driving stops for 2.4 seconds before automatic reload at the same position.
7. Compare an aggressive lap against a careful lap. Try fast direction reversals, easing off before corners, crossing rough strips fast/slow, and recovering risk by stopping. Confirm that only your cart spills and your opponent continues. Compare keyboard feathering against partial joystick input for fairness.
8. Finish both racers and compare place, time and spill counts. Times include reload penalties. Host opens Lobby controls → Restart course for another countdown without refreshing. Return to lobby to select Beam Carry again.
9. Refresh one browser during a race: reconnect within 30 seconds and continue with the same cart/spills. Try host departure and confirm the remaining player gets restart/lobby controls.

Human acceptance is pending. Answer the twelve questions in the milestone request, especially whether fast versus careful driving creates interesting choices and whether you immediately want another race. Automated passes do not prove fun. Milestone 4 is not authorized.

### Playtest-fix pass

Close the previous Beam Crew server window with Ctrl+C, then launch Start-BeamCrew.cmd again and refresh both browsers. Confirm **Milestone 3 · Wheelbarrow Race · Playtest fixes**. The older server is deliberately rejected after the protocol update.

1. Hit an edge post gently, then at speed. The faster impact should brake/deflect the cart and add more load risk. Compare slow and fast crossings of the rough strips.
2. Deliberately spill. After reload, verify the bricks remain visible on both devices. Have the other racer hit them: bricks should move, and the impact should slow/add risk to that racer. Refresh the phone and confirm the same material is still there.
3. Let one racer finish while the other stays on course. The finished cart should disappear; the unfinished racer should keep driving. Results are provisional until both finish. Finish the second racer and check final ranking, times and spill counts.
4. Try a fast lap with a spill against a slower clean lap. The clean racer must rank higher. With equal spills, the faster finish must rank higher.
5. Restart course and confirm all spilled bricks clear. Return to the lobby, select Beam Carry and verify normal grab/carry controls on both devices.

Report whether arrows are easy to follow, impact/roughness feel fair, bricks are useful movable obstacles, finish independence works and the scoring priority is clear. Approval remains pending.
