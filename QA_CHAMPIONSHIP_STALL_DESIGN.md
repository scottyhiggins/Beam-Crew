# Championship stall investigation and recommended follow-up

Status: investigated; behavior change deferred under the user's explicit scoring-risk exception. This document proposes a future change and does not enable a timeout or host DNF control in Protocol 18.

## Current behavior

`CrewRoom.reconcileChampionship()` advances only when every remaining player has a positive finish order. A disconnected player retains their reservation; a permanent departure marks the cumulative standing DNF and removes the player. `departChampionship()` and `rankChampionship()` are written around that removal. PublicWheelRoom changes lobby matching/countdown but inherits this same race completion logic.

Consequently a connected non-finisher can still hold either a private Championship or a public Quick Match leg indefinitely. The existing Wheelbarrow test explicitly preserves the no-default-grace rule; it is not already solved in the integrated code. The Beam four-minute DNF limit is separate and does not protect Wheelbarrow Championship.

The ranked ledgers currently put DNF entrants after eligible finishers, retain completed leg results, and compare official spills then cumulative racing time within the eligible ranking. `rankChampionship()` derives totals from non-DNF leg records. Finished/staging/countdown spills must never be added to frozen official results.

## Why a small timeout patch is unsafe

Marking a connected racer DNF does not satisfy the current positive-finish-order completion condition. Assigning a fabricated finish order or finish time would falsely create a completed leg. Deleting a still-connected worker would break membership/reconnect handling and leave an active socket without its player. A DNF needs an explicit eligibility state, consistent next-leg input/position handling, frozen ledgers, and client presentation. It also needs a published limit so a legitimate slow player is not penalized by an invisible rule.

These are scoring and round-lifecycle changes beyond the confirmed replay/UI fixes. The user explicitly allowed documenting the design rather than rushing this case before submission. No timeout, fabricated finish result, score adjustment, or elimination is introduced in this QA patch.

## Recommended policy for a follow-up

- Private Championship: provide host-only **End leg / mark unfinished workers DNF** while racing. Present a confirmation that names the unfinished workers and states that they become Championship DNF. Cancel must have no side effects. The server rechecks host identity, room type, phase and leg revision on confirmation; stale/replayed requests must be ignored. A host transfer must invalidate an outstanding request. Private rooms retain unlimited play unless the host confirms this action.
- Public Quick Match: initially propose a **180-second maximum racing duration per leg**, plus a **60-second grace period after the first official finisher**, using whichever deadline arrives first. These values require product/device acceptance, not an unannounced deployment. Show the exact rule before matching and a server-synchronized remaining-time display during racing. Countdown, intermission and staging are not racing time. The first finisher must not let a guest shorten the configured grace by a client message.
- Deadline expiry/confirmed host action: first reconcile any valid same-tick finishes, then atomically freeze a DNF record for each unfinished entrant. Preserve their completed-leg spill/time snapshots and record unfinished-leg diagnostic spills/time separately; do not invent a completed-leg time or let a partial course produce a winning zero-spill score. Keep the current DNF-after-eligible ordering and official spills/time tiebreakers.
- Keep DNF workers connected as spectators for the rest of that Championship. A synchronized eligibility flag (and reason/leg) is preferable to deleting players or overloading `finishOrder`. Exclude them from future completion barriers and starting grids, block racing input/material changes, and preserve identity/reconnect until leave or replay.
- If no eligible racers remain, end the Championship with a nonempty DNF ledger. Otherwise use the existing five-second transition and immutable previous-leg records. Reset all new deadline/eligibility state only on a valid replay.
- Advertise the policy in client/server shared configuration and synchronize deadline/eligibility state. Review a new protocol revision for that schema change; this QA patch deliberately keeps Protocol 18's schema unchanged.

## Required acceptance before implementing/releasing

Test first-finisher boundary ticks; no-finisher deadline; legitimate finish at deadline; reserved disconnect/reconnect; consented leave; all entrants DNF; several DNF legs; 2/3/5/10-course routes; immutable staging scores; host transfer and stale confirmation; repeated end-leg messages; results and replay; public/private command isolation. Compare complete official ledgers on at least two real clients. Publish the rule and physically test slow laptop+iPhone players before enabling public expiry.

Until that follow-up is accepted, the connected non-finisher stall remains a known limitation. Do not describe public Quick Match as protected against indefinite stalls or ready for unconditional deployment approval.
