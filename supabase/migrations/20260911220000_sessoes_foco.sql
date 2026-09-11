-- Página Foco (pomodoro), pedido de 2026-09-11: cada bloco de foco completo vira uma linha,
-- para o Painel mostrar os minutos de foco por dia. Não dá XP (o XP vem só das tarefas).

create table public.focus_sessions (
  -- Gerado no navegador quando o bloco começa: se duas abas ou uma reconexão enviarem
  -- o mesmo bloco, a chave primária recusa a repetição.
  id           uuid primary key,
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  minutos      int not null check (minutos between 1 and 120),
  -- Hora do servidor: o navegador não escolhe o dia do bloco.
  concluida_em timestamptz not null default now()
);

create index focus_sessions_user_idx on public.focus_sessions (user_id, concluida_em desc);

alter table public.focus_sessions enable row level security;

create policy "focus_sessions: select own" on public.focus_sessions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "focus_sessions: insert own" on public.focus_sessions
  for insert to authenticated with check ((select auth.uid()) = user_id);

revoke all on public.focus_sessions from anon, authenticated;
grant select on public.focus_sessions to authenticated;
grant insert (id, minutos) on public.focus_sessions to authenticated;
