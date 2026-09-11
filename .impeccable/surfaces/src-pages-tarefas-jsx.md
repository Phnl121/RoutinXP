---
version: 1
slug: "src-pages-tarefas-jsx"
primary_target: "src/pages/Tarefas.jsx"
related_targets: ["src/components"]
---

## Scope

Main app surface `/`: category-grouped task list with Pendentes/Concluídas filter, Quadro (Kanban by status), create/edit/delete task, categories create/edit/delete. Mode: **Operate**. Inherits the world in DESIGN.md and the app-level contract in `.impeccable/surfaces/src-app-jsx.md`; no world change.

## Structure (locked by the user)

"Trilho de categorias", seed key d1ee812b (surface round, structures dealt 7/3/6; the user picked the second dealt card after generating Nano Banana images of all three).
- Top bar (shell): the level meter (NÍVEL badge + XP bar + streak) in a pill, always centered; avatar with account menu at the right. The wordmark lives in the side menu.
- Left rail: CATEGORIAS, "Todas" plus each category with its dot and pending count, the selected item marked with the neutral selection (Panel Two + Rule Strong inset, never purple), edit on hover, "+ Nova categoria" once at the bottom.
- Main: a title row (category name or "Todas as tarefas" at the left, compact "+ Nova tarefa" at the right), LISTA | QUADRO underline tabs, a Pendentes/Concluídas segmented filter in Lista. A FAB opens the new-task dialog at every width.
- Rows (user request 2026-09-11): every task row is a card with a 1px outline in its category color on all four sides, 0.5rem apart (faded on completed rows); tags as Trello-style labels above the title (name or color-only, toggled by clicking a label); the description only inside the task dialog. Tags are managed in Perfil.
- Calendário (user request 2026-09-11): a third tab. Its mode control (Mês, Semana, Dia, Linha do tempo) sits where the Lista filter sits.
  - A navigation bar: "‹ Hoje ›" and the period in 800.
  - Mês: a 7-column grid, Sunday first. Each cell holds the day number and up to three task pills (category dot and title), then "+n tarefas". Clicking the number opens Dia.
  - Semana: seven day columns of pills.
  - Dia and Linha do tempo reuse the Lista rows (check, XP flight, labels). Linha do tempo groups Atrasadas, Hoje, Amanhã, then each date, then Sem data.
  - Today uses the neutral selection. Narrow widths: the month shows category dots only and the week stacks vertically.
- Quadro: two panels, Pendentes and Concluídas. Dragging a pending row into Concluídas completes it; no dragging back (v1 decision).
- Mobile: the level meter wraps to a second top-bar row, the rail becomes scrollable chips, the Quadro columns scroll-snap horizontally, a purple FAB replaces "+ Nova tarefa".

## Critique reference

The user's Nano Banana image of this structure (shared in chat, not saved to disk). Deviations the build corrects on purpose, per DESIGN.md:
- Rows are rule-divided inside a panel, not separated slabs.
- Rows show the category dot beside the category name.
- The dragged row stays dark and dims in place, never a white card.
- "+ Nova categoria" appears once.
- The Faculdade dot is its category color, not gray.

## Signature

Completing a task (check or drop) pops the check green and washes the row green as it settles into Concluídas. The +XP flight to the top-bar counter arrives in step 10, when XP is actually awarded.

## Unresolved

- XP is awarded in step 10. Until then completed rows show the stored `xp_value` (default 10).
- The streak's day timezone is decided in step 10.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
