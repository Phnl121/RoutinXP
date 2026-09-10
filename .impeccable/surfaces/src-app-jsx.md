---
version: 1
slug: "src-app-jsx"
primary_target: "src/App.jsx"
related_targets: ["src/pages"]
---

## Scope

The whole App - Rotina web app: sign-in/sign-up + password reset (step 8, first surface), task list and Quadro (step 9), categories screen, dashboard (step 11). Mode: **Operate**.

## Audience and task

Students and young professionals juggling several life areas. Sign in fast, register tasks, complete them, see total XP climb. Desktop for planning, phone for completing, both first-class.

## Constraints

- Few colors (user). Neutrals + one amber accent. Category color only as a small dot beside the category name.
- Not childish, not a spreadsheet, no guilt on a lost streak, not a template.
- All UI copy pt-BR, centralized strings. Product terms stay: tarefa, categoria, pendente, concluída, XP, streak.
- Critique reference: the user-approved Nano Banana image `.impeccable/mocks/decision/embarque.png` (code-led build; the image is a reference, not a measured contract).

## Direction contract

THESIS: Every task is a departure and completing it tears off the stub. The screen is a boarding pass plus a departures board, never a stack of rounded cards with checkboxes.

OWN-WORLD: Ground #F6F6F4, white panels #FFFFFF, hairline rules #D5D8DC at 1px, ink #111418, labels #5E6570. One accent, amber: #E09A12 as a fill only (stamps, tags, active marker), with ink text on it; #A86C00 when amber has to be text. Archivo (self-hosted, width axis): condensed small caps for field labels above every value, tabular figures everywhere, dates and XP in fixed columns. Perforations (punched semicircles + dashed rule) divide segments. Low radius (4px), soft offset shadow only on the pass itself.

STORY: The visitor recognises a travel document, understands sign-in is a check-in, gets in. Inside, pending tasks read as a board ordered by date; finishing one tears its stub into Concluídas stamped "CONCLUÍDA +10 XP", and total XP rolls up.

FIRST VIEWPORT: Login = one boarding pass centred on the ground, about 760px wide on desktop. Main segment: "Rotina" where the airline goes, Entrar / Criar conta as two tabs of the pass, labelled fields E-MAIL and SENHA, ink primary button, "Esqueci minha senha". Perforated vertical divider. Stub: amber CHECK-IN tag, sequence number, and a scannable block drawn live from the typed e-mail. Mobile: segments stack, perforation turns horizontal, stub at the bottom.

FORM: Boarding pass and gate board (catalog challenger vernacular-ephemera-boarding-pass-and-gate-board, round 1, picked by the user over the roll; not on my grounded list). Seed key 3bc9e880. Signature interaction: the live scannable block on login; in-app, the row that tears off and reranks in place, keeping identity.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Moving a completed card back to Pendentes: not allowed in v1 unless the user decides otherwise.
- "EMBARCOU" (image) vs "CONCLUÍDA" (product term): building with CONCLUÍDA; user may override.
