---
version: 1
slug: "src-pages-foco-jsx"
primary_target: "src/pages/Foco.jsx"
related_targets: ["src/lib/foco.js","src/lib/spotify.js","src/lib/push.js"]
---

## Scope

App page `/foco` ("Foco", in the side menu): a pomodoro timer with configurable intervals, a set of tasks from any category worked on during the session, and a Spotify player embedded from a pasted playlist link. Mode: **Operate**. Inherits the world in DESIGN.md and the app-level contract in `.impeccable/surfaces/src-app-jsx.md`; no world change.

## Decisions (user, 2026-09-11)

- Page name: Foco.
- XP comes only from completing tasks; a focus block earns nothing by itself.
- Spotify: the embedded player from a pasted link (no account connection, works on free and Premium, desktop and phone). Account connection (Web Playback SDK) is out for now.
- Focus history goes to the Painel (minutes of focus per day).
- Structure: "Montar e rodar", locked on the decision page.

## Direction contract

THESIS: A focus session is something you assemble, then run. The page has two phases in one place: while stopped it is a setup desk (intervals, tasks, music); pressing Iniciar folds the setup away and the clock takes the stage. It refuses the category default of a lone timer ring with settings hidden behind a gear.

OWN-WORLD: RoutinXP's own dark chrome: Ground, Panel cards, 1px Rules, Archivo. The clock is Archivo 800 at monumental size with tabular figures. Purple only on the actions (Iniciar, Adicionar); the phase is marked in neutrals, never green (green stays for XP and completion). Session tasks are the same task cards as Lista (category cover, labels, deadline badge, green check with the XP flight).

STORY: The user picks a preset or sets their own intervals, adds the tasks they will attack (any category), pastes a playlist once, and presses Iniciar. During focus they see only the time left, the current task and the queue; completing a task there gives XP as anywhere. Nothing starts on its own (user decision, 2026-09-11, after a distracted user missed a break that had started silently): when focus ends the clock stops at "Hora da pausa", the music pauses, three chime pairs play, the phone vibrates and a system notification appears (also as Web Push from the server, so it arrives with the screen locked or the app closed); the primary button pulses until they press "Iniciar pausa". When the break ends, the same alert asks for "Iniciar foco". Each finished focus block is recorded and shows up in the Painel.

FIRST VIEWPORT: Stopped: page title "Foco", then a two-column grid. Left, wide: the Intervalos panel (segmented presets 25/5, 50/10, Personalizado; four number fields when custom) and below it "Tarefas da sessão" as task cards with "+ Adicionar tarefas". Right, narrow: a large Iniciar foco button at the top and the Música section under it. Today's focus total ("Hoje · 3 focos · 75 min") sits at the right of the page title, not in the right column: there it shows in both phases and stays above the fold on phones (adaptation after the finish review). Running: the left column becomes the clock (phase and cycle as a Label, "Foco · 2 de 4", a row of cycle pills, then mm:ss at display scale, then Pausar, Pular and Encerrar), with the current task card under it; the right column keeps the queue and the player. The cycle pills (done in Ink, current half-tone, remaining in Rule Strong) show where the round stands and how close the long break is at a glance from across the desk, without reading the label; they are the "session track" idea at label scale. The player never remounts between phases.

FORM: "Montar e rodar", fifth on my ordered list of seven structures (1 Mesa de foco, 2 Trilha da sessão, 3 Modo imersivo, 4 Fila primeiro, 5 Montar e rodar, 6 Três colunas, 7 Relógio global na barra), dealt as the lead by the roll; seed key 5557813b.

SIGNATURE: pressing Iniciar collapses the setup panels and the clock grows into their place in one ease-out motion (reduced motion: instant swap). While a session runs on another page, a small "Foco 18:42" chip in the top bar links back.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Background tabs: browsers may delay the end-of-phase alert by up to about a minute when the tab has been hidden for a while; iPhone does not guarantee alerts with the app closed.
- Interval settings and the playlist link are saved per browser (localStorage, per user id), not in the database.
- One pending server alert per user (`focus_alerts` keyed by user): two devices running separate sessions at the same time overwrite each other's scheduled push. The session itself is per browser, so this only matters when someone runs two timers at once.
- Web Push on iPhone/iPad needs the installed app (iOS 16.4+); desktop browsers must be running to show it.
