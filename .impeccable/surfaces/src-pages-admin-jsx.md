---
version: 1
slug: "src-pages-admin-jsx"
primary_target: "src/pages/Admin.jsx"
related_targets: ["src/pages/AdminConta.jsx","src/pages/Verificacao.jsx","src/lib/conta.js"]
---

## Scope

App page `/admin` ("Administração", side menu, only for the admin role) and `/admin/:id` (one account). Mode: **Operate**. Inherits the world in DESIGN.md and the app-level contract in `.impeccable/surfaces/src-app-jsx.md`; no world change. Also covers the gate screens every account passes after sign-in: register the authenticator app, type the 6-digit code, and replace a temporary password (extensions of the password-reset page, `src/pages/Verificacao.jsx`, `src/pages/RedefinirSenha.jsx`).

## Decisions (user, 2026-09-13)

- The app is invite-only; the owner creates accounts from this panel with a generated temporary password that must be changed on first access.
- Every feature is controllable per account: Tarefas (with Categorias e tags), Kanban, Calendário, Foco, Painel, Integrações, Financeiro. Perfil is always on.
- Two-step verification (authenticator app, TOTP) is mandatory for everyone.
- The list shows only the date of the last access (no device or browser).
- The panel never shows anyone's content (tasks, focus, finance): account data only.
- Structure: "Lista e página da conta", locked on the decision page.

## Direction contract

THESIS: Administering a handful of invited accounts should feel like the rest of RoutinXP, not like a back office. A calm list answers "who is here and are they okay"; one tap opens the account's own page, where the switches and the few serious actions live. It refuses the dense admin data grid with checkbox columns and a bulk-action bar.

OWN-WORLD: RoutinXP's dark chrome (Ground, Panel, 1px Rules, Archivo). Rows rule-divided like the Painel timeline, not cards. Account state as neutral pills (Ink/Muted on Panel Two with a Rule Strong outline); no green (nothing here is progress) and no red (Neutral Error Rule). Purple only on actions ("+ Nova conta", confirm buttons). Feature switches in neutrals: on is an Ink track.

STORY: The owner opens Administração, scans who exists and their state (active, suspended, temporary password pending, authenticator missing, last access), creates an account (e-mail, a name to recognise it, features) and copies the temporary password shown once. Opening an account, they flip features on or off and, when needed, generate a new temporary password, remove a lost authenticator, suspend or reactivate, or delete with the e-mail typed as confirmation. A Registro tab lists what was done and when.

FIRST VIEWPORT: `/admin`: Page Title "Administração" with the compact "+ Nova conta" at the right; underline tabs CONTAS | REGISTRO; under Contas a search field and the rule-divided list. Each row: name (or e-mail when no name) over the e-mail in Meta, the state pills, "último acesso 12 set" at the right and a chevron; the owner's own row marked "você". `/admin/:id`: a back link "‹ Contas", the name as Page Title with the e-mail and state pills under it, then two panels: FUNÇÕES (one switch row per feature, label and one Meta line of what it opens) and CONTA (created date, last access, then the actions as outline buttons), with "Excluir conta" as the destructive text action at the foot. On phones everything stacks in one column; rows keep a 44px target.

FORM: "Lista e página da conta", fourth on my ordered list of seven structures (1 Lista com painel ao lado, 2 Matriz de funções, 3 Linha que expande, 4 Lista e página da conta, 5 Abas Contas e Registro com tabela, 6 Cards por conta, 7 Visão por função), dealt as the lead by the roll; seed key 31488275.

SIGNATURE: the temporary password moment. Creating an account or generating a new password shows the password once, large in tabular figures, with "Copiar" and a plain warning that it will not be shown again; closing it leaves no trace of the password anywhere.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- The first admin is set by hand in the Supabase SQL Editor (the e-mail stays out of the public repository).
- If the owner loses their own authenticator, recovery is through the Supabase dashboard (Authentication → Users → the user → remove the MFA factor).
