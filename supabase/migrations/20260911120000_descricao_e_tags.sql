-- Descrição nas tarefas e tags (várias por tarefa), pedidas pelo usuário em 2026-09-11.
-- Tags são do próprio usuário (nome + cor) e se ligam às tarefas por task_tags.
-- Tudo com RLS: cada linha só é visível e alterável pelo dono.

-- ---------------------------------------------------------------------------
-- Descrição (opcional, até 1000 caracteres)
-- ---------------------------------------------------------------------------
alter table public.tasks
  add column descricao text check (descricao is null or char_length(descricao) <= 1000);

-- O navegador continua editando só os campos de conteúdo (ver migration do passo 10).
grant insert (descricao) on public.tasks to authenticated;
grant update (descricao) on public.tasks to authenticated;

-- Permite que task_tags garanta, via FK composta, que tarefa e tag são do mesmo usuário.
alter table public.tasks add constraint tasks_id_user_id_key unique (id, user_id);

-- ---------------------------------------------------------------------------
-- tags
-- ---------------------------------------------------------------------------
create table public.tags (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome       text not null check (char_length(trim(nome)) between 1 and 40),
  cor        text not null check (cor ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create index tags_user_id_idx on public.tags (user_id);
-- Sem duas tags com o mesmo nome (ignorando maiúsculas) para o mesmo usuário.
create unique index tags_user_nome_idx on public.tags (user_id, lower(trim(nome)));

-- ---------------------------------------------------------------------------
-- task_tags (tarefa ↔ tag)
-- ---------------------------------------------------------------------------
create table public.task_tags (
  task_id    uuid not null,
  tag_id     uuid not null,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (task_id, tag_id),
  -- Excluir a tarefa ou a tag remove o vínculo.
  foreign key (task_id, user_id) references public.tasks (id, user_id) on delete cascade,
  foreign key (tag_id, user_id) references public.tags (id, user_id) on delete cascade
);

create index task_tags_tag_id_idx on public.task_tags (tag_id);
create index task_tags_user_id_idx on public.task_tags (user_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.tags      enable row level security;
alter table public.task_tags enable row level security;

create policy "tags: select own" on public.tags
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "tags: insert own" on public.tags
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "tags: update own" on public.tags
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "tags: delete own" on public.tags
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "task_tags: select own" on public.task_tags
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "task_tags: insert own" on public.task_tags
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "task_tags: delete own" on public.task_tags
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Privilégios: anônimo não toca; o usuário logado só escreve os campos de conteúdo.
-- ---------------------------------------------------------------------------
revoke all on public.tags      from anon, authenticated;
revoke all on public.task_tags from anon, authenticated;

grant select, delete on public.tags to authenticated;
grant insert (nome, cor) on public.tags to authenticated;
grant update (nome, cor) on public.tags to authenticated;

grant select, delete on public.task_tags to authenticated;
grant insert (task_id, tag_id) on public.task_tags to authenticated;
