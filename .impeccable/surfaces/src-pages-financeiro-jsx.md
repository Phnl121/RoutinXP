---
version: 1
slug: "src-pages-financeiro-jsx"
primary_target: "src/pages/Financeiro.jsx"
related_targets: ["src/components/FinanceiroParts.jsx","src/pages/financeiro.css","src/lib/useFinanceiro.js"]
---

## Scope

Financeiro (`/financeiro`), phases 0.4 and 1 of the finance plan (user, 2026-09-13): the month view, manual entries (outflow, inflow, transfer between own accounts), accounts and cards with balances, and editable finance categories. Summary per category, DRE, bills, budget and Open Finance come in later phases in the same page. Mode: **Operate**.

## Audience and task

The account owner (feature "financeiro" released in the admin panel, two-step verification on). Open the month, see what came in and went out, record an entry in seconds, check account balances. Desktop to review, phone to record right after paying.

## Constraints

- The committed RoutinXP world (DESIGN.md): dark ground, panels with 1px rules, Archivo, green only for XP and level, violet only for actions. Money gets no green/red coding: sign and weight carry direction; transfers recede to Muted.
- Values in cents, formatted pt-BR (R$ 1.234,56), tabular figures. Typing a value fills from the right, like a card machine.
- pt-BR copy in src/i18n/pt-BR.js.

## Direction contract

THESIS: The month on one page, read top to bottom: scoreboard, entries by day, where the money sits. Nothing hidden behind tabs.

STRUCTURE (locked by the user on the decision page, seed key bd5e029f, option "O mês numa página só"): header with title, month selector ‹ Setembro de 2026 › and "+ Lançamento" (Categorias as a text action); a scoreboard strip (Entradas, Saídas, Resultado, Poupado); a 1.65fr / 1fr grid with entries grouped by day (day label and day result, rows in a hairline list) and filters (search, type segments, category, account) on the left, and "Contas e cartões" with balances, total and "+ Nova conta" on the right. Narrow content width: one column with accounts before entries; phone: scoreboard 2×2 and the FAB creates an entry.

FIRST RUN: no accounts yet, the page asks for the first account before anything else. Default finance categories are created on first visit.

FINISH: finish review, verdict, DESIGN.md updated.
