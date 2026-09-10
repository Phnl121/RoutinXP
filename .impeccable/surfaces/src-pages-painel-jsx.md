---
version: 1
slug: "src-pages-painel-jsx"
primary_target: "src/pages/Painel.jsx"
related_targets: ["src/components"]
---

## Scope

Painel (dashboard) at `/painel`, inside the app shell with the collapsible sidebar (Tarefas, Painel, Perfil). Mode: **Operate**. Inherits DESIGN.md; no world change.

## Structure (locked by the user)

"Linha do tempo do dia", seed key 6e042463 (surface round; the user generated Nano Banana images of all three dealt structures and picked this one).
- Left column (wide):
  - level header: NÍVEL badge, XP bar, total XP;
  - "Sua semana" XP-per-day bar chart with the 150/day cap line, a 7/30-day period control, and a summary of tasks completed and XP in the period;
  - "Conclusões por categoria" horizontal bars naming the most completed category.
- Right column: "Linha do tempo" with streak and record at the top and recent completions grouped by day (Hoje, Ontem, weekday), each with time and XP earned.
- Mobile: a single column with the timeline last.

## Critique reference

The user's Nano Banana image (shared in chat, not on disk). Deliberate deviations, per DESIGN.md and the dataviz method:
- The streak reminder stays a dark neutral panel, not a white bar.
- The active menu item uses neutral selection, not a purple marker (Two Jobs rule).
- Bars carry one direct label (the tallest) plus hover/focus tooltips and a visually hidden table; not a number on every bar.
- Panel titles use the label style.

## Data

Computed client-side from the user's own tasks (RLS), Brasília days (`src/lib/painel.js`). No new tables.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
