---
version: 1
slug: "src-app-jsx"
primary_target: "src/App.jsx"
related_targets: ["src/pages","src/components"]
---

## Scope

The whole App - Rotina web app: sign-in/sign-up + password reset (step 8, first surface), task list and Quadro (step 9), categories screen, dashboard and profile card (step 11). Mode: **Operate**, except the login's intro column, which has to sell the loop in one glance.

## Audience and task

Students and young professionals juggling several life areas. Sign in fast, register tasks, complete them, watch XP fill the level bar. Desktop for planning, phone for completing.

## Constraints

- Canon path, chosen by the user: gamified learning platform convention. DIO is the reference; Duolingo and Habitica are the craft bar.
- Dark theme, two accents only: green = XP and level, purple = actions. Category colors are small dots.
- Not childish (no mascot, no confetti), not a spreadsheet, no guilt on a lost streak.
- Profile card only inside the app. Levels computed from xp_total (100, 150, 200… XP per level).
- Tokens must stay theme-swappable (future idea: themes unlocked by level).
- pt-BR copy, centralized in src/i18n/pt-BR.js. Product name: RoutinXP. XP per task is undecided: never promise a fixed amount; the demo uses varied example values (+15, +5, +10).

## Direction contract

THESIS: Your level is always in view and every finished task visibly moves it. The screen's job is to make "+XP" and the bar filling feel earned, never a plain to-do list with a number in the corner.

OWN-WORLD: Ground #121318, panels #1C1D24 with 1px #2E3039 rules and 16px radius, tracks #25262F. Text #F3F4F7, secondary #A3A7B3. Green #2BD576 only for XP, level badges and progress fills (dark text on green). Purple #8E2DE2 only for actions: primary buttons, active tab underline, focus; #C28CF6 for purple text. Archivo: extra-bold, slightly expanded for badges and headline, tabular XP figures. Avatar = initials in a green ring. Pill badge "NÍVEL n". Uppercase tabs with a purple underline bar.

STORY: The visitor gets the loop in one glance: finish a task, earn XP, level up. They try it in the demo on the login screen, then sign in. Inside, every completion adds its XP to a bar they can always see.

FIRST VIEWPORT: Login on desktop, two columns in a 70rem frame. Left: "RoutinXP" wordmark, headline "Conclua tarefas. Ganhe XP. Suba de nível." (last sentence green, ~3.75rem), one line of copy, then an interactive demo panel: a level meter (NÍVEL 2 badge + XP 120/150 bar, no avatar or name, since the profile card lives only inside the app) and three sample task rows you can tick; each "+XP" flies to the counter, the counter counts up, and the third fills the bar, holds, then resets to NÍVEL 3 0/200. Right, top-aligned with the headline: the form panel with ENTRAR / CRIAR CONTA tabs, fields, full-width purple button, "Esqueci minha senha". Mobile: headline, form, demo.

FORM: Canon (the category standard: gamified learning platforms), taken by the user after rejecting two dealt hands. Seed key 3bc9e880. Signature interaction: the "+XP" float plus a bar that fills and a badge that pulses on level-up, the same in the login demo and in the app.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Moving a completed card back to Pendentes: not allowed in v1 unless the user decides otherwise.
- Theme unlocks by level: idea only, not scheduled.
