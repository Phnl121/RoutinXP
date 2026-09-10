# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Single responsive web app, installable as a PWA at the end of v1. No separate native app in v1 (decided in `escopo-mvp-v1.md`).

## Stack

- Frontend: React (Vite)
- Backend, database, auth: Supabase (Postgres + Auth, free plan)
- Deploy: Vercel
- PWA (manifest, icon, "add to home screen") comes last, after the core loop works.

Decided in `escopo-mvp-v1.md`; not to be revisited without a strong reason.

## Users

Students and young professionals juggling several fronts at once: university, work, personal life, side projects. They need one place to see and close out tasks across all of those areas, and a small, steady reward for actually doing them.

The app is also a portfolio project, but real use by this audience is the target; the portfolio value follows from that.

## Product Purpose

A gamified routine app. The user organizes tasks into categories (life areas), completes them, and earns XP and a daily streak for doing so.

v1 exists to validate the core reward loop: **register a task → complete it → gain XP / keep the streak**. Success for v1 means that loop works end to end and feels worth coming back to, without any external integration.

## Positioning

One list for every area of life, with a reward loop that is deliberately simple: XP per completed task and a daily streak. Instead of a planner that tries to manage your calendar, it rewards the act of finishing something, whatever area it belongs to.

(Derived from the v1 scope; refine once there is real usage data.)

## Operating Context

- Used on both desktop and phone about equally: tasks tend to be created and organized on the computer, and completed on the phone throughout the day (via the PWA). Both contexts are first-class.
- Categories are user-defined life areas, each with a color. Examples: Faculdade, Trabalho, Vida Pessoal, Projetos Pessoais.
- Tasks have a title, a category, an optional due date (`data_prevista`), and a status (pendente / concluída).

## Capabilities and Constraints

**v1 screens (minimum):**
1. Login / sign-up (Supabase Auth)
2. Task list grouped by category, with pendente / concluída filter
3. Create / edit task (title, category, due date)
4. Simple dashboard: total XP, current streak, record streak
5. Category management: create, edit, delete categories (name + color). Added by the user on 2026-09-10, beyond the original scope, because tasks require a category and no categories are pre-seeded. New users start with zero categories, so first run must lead them to create one. A category that still has tasks cannot be deleted (FK `on delete restrict`); the UI must explain that instead of failing silently.

6. Board view (Kanban, Trello-style), added by the user on 2026-09-10 beyond the original scope. It lives alongside the category-grouped list, with a Lista / Quadro toggle that remembers the last choice. Columns are status: **Pendentes** and **Concluídas**, with category shown on each card as its name plus color. Dragging a card into Concluídas completes it and triggers the same XP/streak rule as the complete button. Open decision: moving a card back to Pendentes (un-completing, which would have to reverse XP) is **not** allowed in v1 unless the user decides otherwise.

**Auth:** Supabase email confirmation stays on (decided 2026-09-10). Sign-up ends in a "check your email" state, not a logged-in session. The free plan rate-limits confirmation emails. Includes "esqueci minha senha": reset link by email plus a screen to set the new password (decided 2026-09-10).

**Hero number:** total XP is the number that makes people come back (decided 2026-09-10). Streak and record streak support it; they don't compete with it.

**Levels** (added by the user 2026-09-10, beyond the original scope): the level is computed from `xp_total` with no schema change. Each level needs 50 XP more than the previous one: level 1→2 needs 100 XP, 2→3 needs 150, 3→4 needs 200, and so on. The UI shows a "NÍVEL n" badge and an XP bar toward the next level ("XP 120 / 150").

**Profile card** (user, 2026-09-10): avatar with initials, level badge, XP bar and streaks. Shown only inside the app after sign-in, never on the login screen.

**Not in v1 (user did not select, 2026-09-10):** ranking between users and achievements/badges.

**Idea, not scheduled:** themes unlocked by leveling up. The user would customize the app's look with what they earn as their level rises. Not in v1 unless the user decides otherwise, but design tokens must stay theme-swappable so it can be added later.

**Reward rules (v1, simple on purpose):**
- Completing a task adds its `xp_value` to `xp_total`.
- Streak goes up by 1 the first time a task is completed on a day with no prior completion.
- Streak resets to zero if a full day passes with no completed task.
- **XP per task is not decided** (user, 2026-09-10, superseding the "XP fixo" line in `escopo-mvp-v1.md`): some tasks may be worth more and others less. The `xp_value` column already stores each task's own value (schema default 10 until a rule exists). No UI copy may promise a fixed amount ("vale 10 XP"); demo data may show varied example values.

**Data model:** `categories`, `tasks`, `user_stats` in Postgres with RLS restricting every row to its `user_id`. Full schema in `escopo-mvp-v1.md`.

**Out of scope for v1 (decided):**
- Google Calendar or any external integration
- Separate native mobile app
- Advanced reports or complex historical charts
- Push notifications
- Elaborate achievements / badges system (v2, after XP/streak is validated)

**Known operational risk:** the free Supabase project auto-pauses after a week without use and must be reactivated manually.

**Terminology:** UI copy is in Portuguese. Use the scope's terms consistently: tarefa, categoria, concluída, pendente, XP, streak, streak recorde.

**Language:** pt-BR only in v1, but all UI strings must live in one centralized place so an English translation can be added later without hunting through components. Dates and numbers formatted for pt-BR.

## Brand Commitments

- **Name: Routin** (user, 2026-09-10). Replaces "Rotina" in every user-visible place. The project folder and repo keep "App - Rotina".

- **Visual convention** (user, 2026-09-10): follow the gamified learning platforms rather than an invented world. DIO (web.dio.me) is the primary reference; Duolingo and Habitica set the craft bar. The first two directions (travel document, then a round of alternatives) were rejected for losing the gamification focus.
- **Colors** (user, 2026-09-10): dark theme with two accents only, green for XP and level, purple for actions. Not DIO's full green/purple/yellow/pink palette. User-defined category colors are data, shown as small dots.
- Must not feel: childish, cold like a spreadsheet, guilt-inducing when a streak is lost, or like a generic UI-kit template (user, 2026-09-10).

## Evidence on Hand

- `escopo-mvp-v1.md`: the v1 scope, data model, and reward rules.
- `prompt-inicial-code.txt`: the build order and working rules for this project.
- No real users, usage data, testimonials, logo, or brand assets exist yet. Do not invent any.

## Product Principles

1. **The loop comes first.** Register, complete, get rewarded. Every screen should make that loop faster or clearer; anything that doesn't serve it waits for v2.
2. **Finishing is the event.** Completing a task is the moment the product exists for. The reward (XP, streak) must be immediate and unmistakable, never buried.
3. **Simple rules, honestly shown.** Each task shows the XP it gives, and the streak is plain. The user should always understand why a number changed.
4. **Every life area belongs.** Faculdade and Vida Pessoal get the same standing; categories organize, they don't rank.
5. **Two devices, one app.** Planning on the desktop and completing on the phone are both primary; neither is a degraded version of the other.

## Accessibility & Inclusion

No product-specific requirement established yet. Default to WCAG 2.1 AA. Category color must never be the only way to tell categories apart (always pair it with the category name), and the completion action needs a comfortable touch target on the phone.
