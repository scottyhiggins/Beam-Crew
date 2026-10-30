# Work 15 browser smoke evidence — October 30, 2026

Target: isolated production assets at http://localhost:2615, Protocol 19. Two independent Colyseus browser clients in the in-app Chromium browser; same browser profile, separate tabs/session storage. No physical iPhone or Safari testing. No contact with production.

- Main menu: Wheelbarrow, Beam Carry, Toolbox Trivia and free Worker Store present. Crane Challenge disabled / Coming Soon. WORK HARD. PLAY HARD. branding present.
- Store: saved blue hat/green vest/goofy and white hat/blue vest/serious selections on separate clients. Both workers rendered with distinct appearances on both Championship and Beam Carry screens. Saved white/blue appearance loaded on subsequent page navigation/refresh.
- Championship: two clients joined private room, started a three-race series and rendered countdown/racing/standings. Complete series and finish/replay paths are covered by automated real-socket tests, not a complete human-driven browser race.
- Beam/Chaos: all three course options present; selected Excavator Alley, started paired play, inspected moving excavator and course overview. Guest page refresh restored the same player and prompted regrab. Host leave transferred controls to guest.
- Quick Match: single-client waiting, cancel back to menu, retry, two-client public countdown and automatic Championship start passed. Complete public replay/capacity/reconnect covered by automated real-socket tests.
- Trivia: both menu links opened the separate screen; created/joined a five-question room. Reader saw only the question and selector only four choices. Spirit level answer awarded 1000 points at reveal. Next question swapped roles. Guest refresh restored role and score. Host return-to-lobby/restart reset score to zero and question one. Host departure exposed replay control to remaining guest. Complete podium rounds covered automatically.
- 319x740 viewport: document width and scroll width both 319. Championship HUD text, status, Menu and Standings rectangles fit without overlap; buttons 44px high. Found and repaired Beam course-control/status overlap, then visually rechecked the repaired production CSS. Desktop pointer semantics remain: this does not test actual iPhone touch input.
- 844x390 viewport: Beam HUD and recovery/course controls remained visible with no horizontal document overflow. No device-user-agent or touch emulation was used.
- Captured browser logs: zero warnings or errors for either client during the primary smoke run.
- Screenshots: work15-menu.png; work15-championship-319.png; work15-beam-319.png.

Temporary test rooms were left. Viewport override reset. Physical device rendering, Safari, gestures, network background/resume, thermal behavior and eight-client GPU/memory soak remain pending.
- Compatibility fixture: both main and Trivia rejected a server reporting Protocol 16; main disabled joining and Trivia showed the version-mismatch message before connection. Fixture used 127.0.0.1:2617; localhost:2617 resolved to a different existing IPv6 listener, which was not altered.
