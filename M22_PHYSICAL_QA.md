# M22 physical laptop + iPhone QA

This is a local release candidate. It has not been deployed. Automated mobile browser emulation does not establish Safari compatibility, real touch feel, battery drain, or sustained frame rate.

## Start the isolated candidate

1. Open PowerShell in `Beam-Crew-final-release-integration`, not a feature checkout or production checkout.
2. Set `$env:PORT='2722'` and run `.\Start-BeamCrew.cmd`. If that port is occupied by the QA server, close that QA server first or choose another unused port. Do not stop or replace production.
3. On the laptop, open `http://localhost:2722/health`. Confirm **Protocol 21** and **Final Release Integration M22**. Keep the server window open.
4. Put the laptop and iPhone on the same trusted Wi-Fi. Find the laptop's Wi-Fi IPv4 address with `ipconfig`. On iPhone Safari, open `http://<laptop Wi-Fi IPv4>:2722/`. If Windows asks about network access, allow it only for your trusted private network. Do not change router forwarding or expose this server publicly.
5. Use the Wi-Fi address on the laptop too when sharing invite links: links created from `localhost` cannot work on the phone. If clipboard copying is unavailable over local HTTP, use the visible fallback link or room code.

## Required pass before production sign-off

- Tap all six home choices: Wheelbarrow Championship, Beam Carry, Toolbox Trivia, Crane Challenge, Party Night, Worker Store. Confirm the Crane chooser offers Tower Rush and Wrecking Ball Derby. Party Night must advertise exactly three modes.
- Select and save Pumpkin Hard Hat, a vest, and an expression on the phone. Rotate the store preview, close/reopen it, and reload. Confirm the selection persists. Try one classic hard hat too.
- Create a private Wheelbarrow room on the laptop; join on the phone using both a code and an invite link. Complete a race/Championship, compare official spills and times, inspect podium names, then replay with the same crew. Repeat a Quick Match; cancel once while waiting, then rejoin, start, and reload during the race.
- Play Beam Carry together. Grab both assigned ends, release/re-grab, use a signal, recover with its existing penalty, complete the delivery, and compare results. Reload the invited phone page while playing: it must reconnect to the same room. Leave the host and confirm the remaining worker receives host controls; return/replay without stale grips or score.
- Play a five-question Trivia round. Confirm reader/selector roles alternate and only the selector submits. Reload the invited phone page during a round. Compare final score and podium, then replay. Confirm host transfer after the host leaves.
- Play Tower Rush through its natural 60-second result or a 100-foot win. Check touch left/right/action, stack stability, winner agreement, Pumpkin cosmetics, shared podium, and replay. Return to the lobby, switch to Derby, play a complete 60-second round, inspect destruction/points, results, and replay. Crane rooms use six-character hexadecimal codes; the other private modes use five-character codes.
- Play one complete **three-mode Party Night**: three Wheelbarrow races, Beam Carry, five Trivia questions. Check the instructions at every boundary, no carried-over movement/grips/debris, matching per-mode totals and final podium, Pumpkin appearances, and same-room replay. Reload during one boundary and leave the host once. With three workers, confirm paired modes wait/skip for everyone rather than award invented points. With eight devices/players available, repeat joining, reconnect, host transfer, and replay at full capacity.
- Rotate the phone between portrait and landscape during a game and on each results screen. Scroll to replay/leave buttons. Background Safari briefly, return, and verify reconnect and neutral controls. Check that no browser zoom/scroll gesture traps the joystick.
- Run 10–15 minutes on the actual phone. Note loading time, responsiveness, heat, frame-rate deterioration, visual corruption, and any Safari reload or WebGL failure. Repeat after two replays; a gradual decline is a failure.

Record laptop/browser, iPhone model/iOS/Safari version, Wi-Fi conditions, observed failures, and pass/fail for each item. Capture the build label with screenshots. Stop and retain the existing production release if scoring disagrees, reconnect strands a player, the host cannot replay, a mode is unplayable, or Safari becomes unstable.

## Recovery

The source baseline is `1773767411546a92020c67b03cbec2d34a48555b` (Protocol 19). Production was never changed, so current rollback is simply to stop this local candidate and keep using the existing release. Do not reset a feature checkout or main.

For an independent restoration, clone `Beam-Crew-m22-final-release.bundle` into a new directory and select `feature/final-release-integration`. To inspect the baseline, create another new clone and check out the exact baseline commit detached. Run the locked dependency installation and build separately in each new directory. See `M22_RECOVERY.md` and the external release manifest for the final commit and bundle SHA-256.
