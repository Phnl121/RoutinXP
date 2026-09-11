-- Kanban com colunas do usuário (pedido de 2026-09-11).
-- Pendentes e Concluídas são colunas fixas (uma de cada por usuário, renomeáveis e coloríveis);
-- o usuário cria as colunas do meio. Soltar em Concluídas conclui a tarefa (concluir_tarefa).

create table public.board_columns (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tipo       text not null default 'custom' check (tipo in ('pendente', 'custom', 'concluida')),
  nome       text not null check (char_length(trim(nome)) between 1 and 40),
  cor        text check (cor is null or cor ~ '^#[0-9A-Fa-f]{6}$'),
  posicao    int not null default 0,
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create index board_columns_user_idx on public.board_columns (user_id, posicao);
create unique index board_columns_um_pendente on public.board_columns (user_id) where tipo = 'pendente';
create unique index board_columns_uma_concluida on public.board_columns (user_id) where tipo = 'concluida';

alter table public.board_columns enable row level security;

create policy "board_columns: select own" on public.board_columns
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "board_columns: insert own" on public.board_columns
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "board_columns: update own" on public.board_columns
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- As colunas fixas não podem ser excluídas.
create policy "board_columns: delete own custom" on public.board_columns
  for delete to authenticated using ((select auth.uid()) = user_id and tipo = 'custom');

revoke all on public.board_columns from anon, authenticated;
grant select, delete on public.board_columns to authenticated;
grant insert (tipo, nome, cor, posicao) on public.board_columns to authenticated;
grant update (nome, cor, posicao) on public.board_columns to authenticated;

-- Em qual coluna a tarefa pendente está (nulo = Pendentes). A coluna precisa ser do mesmo
-- usuário; excluir a coluna devolve as tarefas para Pendentes.
alter table public.tasks add column column_id uuid;
alter table public.tasks
  add constraint tasks_column_fk foreign key (column_id, user_id)
  references public.board_columns (id, user_id) on delete set null (column_id);
create index tasks_column_id_idx on public.tasks (column_id);

grant insert (column_id) on public.tasks to authenticated;
grant update (column_id) on public.tasks to authenticated;
