---
version: 1
slug: "src-pages-integracoes-jsx"
primary_target: "src/pages/Integracoes.jsx"
related_targets: ["src/components"]
---

## Scope

Integrações at `/integracoes` (v2, first feature), inside the app shell with a new side-menu item between Painel and Perfil. Mode: **Operate**. Inherits DESIGN.md; no world change.

## Structure

It follows the simple-page pattern of Perfil: one centered column, max 44rem.
- A title row: "Integrações" at the left and a compact "+ Conectar calendário" at the right, shown once at least one calendar exists.
- Panel "CALENDÁRIOS DA FACULDADE":
  - one Muted sentence;
  - the list of connected calendars, one row each:
    - a calendar icon in a Panel Two tile;
    - the name at 600;
    - a meta line with the tag label (static), the category dot and name, "atualizado há …" and the task count;
    - a neutral error or result line when there is one;
    - "Atualizar" and "Editar" link buttons at the right.
  - The footer hint reads "Atualização automática a cada 3 horas".
  - Empty state: a Muted sentence and a primary "+ Conectar calendário".
- Panel "COMO PEGAR O LINK NO BLACKBOARD": four numbered steps in the iOS-steps list style, plus a Muted note.
- Connect/edit dialog, in the standard Dialog. Fields:
  - the course name;
  - the calendar link, with a "Testar link" link button that previews the next 5 activities with their dates;
  - category and tag selects, as a field pair. The tag defaults to a new tag with the course name.
  - a checkbox to import activities that are already overdue.
  Editing shows "Link salvo (domain)" with "Trocar link". "Remover calendário" is the pinned-left destructive action, with a second step that chooses to keep or delete the pending imported tasks.

## Rules

- Errors are neutral Ink text, never red.
- Purple appears only on the primary actions.
- Tag labels reuse the Trello-style label.
- The link is never displayed back after saving; only the domain is shown.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
