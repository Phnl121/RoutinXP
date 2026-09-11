---
version: 2
slug: "src-pages-tarefas-jsx"
primary_target: "src/pages/Tarefas.jsx"
related_targets: ["src/components"]
---

## Scope

Main app surface `/`: all tasks at full width in three views (Lista, Kanban, Calendário), a filter, and create/edit/delete task. Categories and tags live on their own page (`/categorias`, "Categorias e tags"). Mode: **Operate**. Inherits the world in DESIGN.md and the app-level contract in `.impeccable/surfaces/src-app-jsx.md`; no world change.

## Structure

Originally "Trilho de categorias" (seed key d1ee812b, picked by the user). The left rail was removed on 2026-09-11 at the user's request: the tasks take the full width, the filter replaces the rail's category selection, and categories are managed on the Categorias e tags page.
- Top bar (shell): the level meter (NÍVEL badge + XP bar + streak) in a pill, always centered; avatar with account menu at the right. The wordmark lives in the side menu.
- Main: a title row ("Todas as tarefas", or "Tarefas filtradas" with filters on, at the left; "Filtrar" and compact "+ Nova tarefa" at the right), LISTA | KANBAN | CALENDÁRIO underline tabs, and at the right of the tabs the Lista's Pendentes/Concluídas segmented filter or the Calendário's mode control. A FAB opens the new-task dialog at every width.
- Filter: a funnel button with an active-count badge opens a panel (search, categories, tags, deadline). Selection is neutral (Panel Two + Rule Strong), never purple. It applies to every view.
- Cards (user requests 2026-09-11): every task is a card with a **cover** band in its category color across the top (Trello reference), 0.375rem in Lista, Dia and Linha do tempo and 0.875rem in Kanban. Cards are separated by a small gap and never wrapped in another panel (density pass). Tags are Trello-style labels above the title (name or color-only, toggled by clicking a label with the mouse). The description shows only inside the task dialog. A deadline badge (future gray, amber within 3 days, solid amber today, solid rose overdue with "atrasada · 9 set") sits at the right, or on the meta line under the title in Kanban and on phones.
- Lista: grouped by category under Label headings with dot and count.
- Kanban: user columns (Pendentes and Concluídas fixed, custom columns in between, each with an optional color tint). Cards sit on Panel Two inside the column panel. Dragging a card into Concluídas completes it; no dragging back (v1 decision).
- Calendário: its mode control (Mês, Semana, Dia, Linha do tempo) sits where the Lista filter sits.
  - A navigation bar: "‹ Hoje ›" and the period in 800.
  - Mês: a 7-column grid, Sunday first. Each cell holds the day number and up to three task pills (category dot and title), then "+n tarefas". Clicking the number opens Dia.
  - Semana: seven day columns of pills.
  - Dia and Linha do tempo reuse the Lista cards (check, XP flight, labels). Linha do tempo groups Atrasadas, Hoje, Amanhã, then each date, then Sem data.
  - Today uses the neutral selection. Narrow widths: the month shows category dots only and the week stacks vertically.
- Shell strips above the page: offline, streak at risk, deadlines due today or overdue, install invite; one at a time.
- Mobile: the level meter wraps to a second top-bar row, Kanban columns scroll-snap horizontally at 86%, the purple FAB replaces "+ Nova tarefa", touch targets are 44px.

## Critique reference

The user's Nano Banana image of the original structure and two Trello screenshots (cards with a colored cover; colored Kanban columns), shared in chat, not saved to disk. Deviations the build keeps on purpose, per DESIGN.md:
- Categories are round dots; tags are rectangular, so they never read as each other.
- The dragged card stays dark and dims in place, never a white card.
- Green only marks XP, level and completion; purple only marks actions.

## Signature

Completing a task (check or drop into Concluídas) pops the check green, washes the card green, and flies "+n XP" to the top-bar counter.

## Unresolved

- On very wide screens the Lista card is wide and the deadline badge sits far from the title. Capping the Lista width was left out because the user asked for tasks at full width.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
