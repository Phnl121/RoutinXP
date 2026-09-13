---
version: 1
slug: "src-pages-gastosfixos-jsx"
primary_target: "src/pages/GastosFixos.jsx"
related_targets: ["src/components/GastosFixosParts.jsx","src/lib/gastosFixos.js","src/lib/useGastosFixos.js","src/pages/financeiro.css"]
---

## Scope

Gastos fixos (`/financeiro/gastos-fixos`), phase 3 of the finance plan (user, 2026-09-13): its own page, in the Finanças section of the side menu, for subscriptions, installment purchases (e.g. 12x on the card), fixed bills (power, internet, rent) and other repeating costs. Mode: **Operate**.

## Audience and task

The account owner with the Financeiro feature. Know how much is already committed per month and per year, see what is due and mark it paid, register an installment purchase once and have every installment land in the right month.

## Constraints

- The committed RoutinXP world and the Neutral Money Rule (no green or red on money). Deadline tints stay inside the deadline badge (overdue, due soon), the same badge as tasks.
- Installments are created up front as outflows dated each month; subscriptions and bills become an entry only when marked paid (the value may vary).

## Direction contract

THESIS: Two questions side by side: what is due next, and what is registered.

STRUCTURE (locked by the user on the decision page, seed key e7e428c8, option "Próximas cobranças ao lado dos cadastros"): header with title and "+ Gasto fixo"; scoreboard (Por mês, Assinaturas por ano, Parcelas a pagar, Pagos este mês); a 1fr / 1.35fr grid with "Próximos 30 dias" on the left (Vencidas first, then day groups; each row with the deadline badge and "Pagar", paid rows with a check and "Desfazer", installments marked "lançada") and the registrations grouped by type on the right (Assinaturas with yearly cost, Compras parceladas with "7 de 12 · faltam R$", Contas fixas with the next charge, Outros), each group with its monthly subtotal; paused items stay listed in Muted. Narrow: one column, upcoming first. Financeiro gets a small summary card linking here.

FINISH: finish review, verdict, DESIGN.md updated.
