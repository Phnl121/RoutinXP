-- App - Rotina · schema v1
-- Rodar uma vez no SQL Editor do Supabase (Dashboard → SQL Editor → New query → Run).
-- Cria categories, tasks e user_stats com RLS: cada linha só é visível/alterável pelo próprio usuário.

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.task_status as enum ('pendente', 'concluida');

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome       text not null check (char_length(trim(nome)) between 1 and 60),
  cor        text not null check (cor ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  -- permite que tasks garanta, via FK composta, que a categoria é do mesmo usuário
  unique (id, user_id)
);

create index categories_user_id_idx on public.categories (user_id);

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create table public.tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id   uuid not null,
  titulo        text not null check (char_length(trim(titulo)) between 1 and 200),
  status        public.task_status not null default 'pendente',
  data_prevista date,
  xp_value      int not null default 10 check (xp_value > 0),
  created_at    timestamptz not null default now(),
  completed_at  timestamptz,
  -- a categoria precisa pertencer ao mesmo usuário da tarefa
  foreign key (category_id, user_id) references public.categories (id, user_id) on delete restrict,
  -- completed_at preenchido se, e só se, a tarefa estiver concluída
  check ((status = 'concluida') = (completed_at is not null))
);

create index tasks_user_status_idx on public.tasks (user_id, status);
create index tasks_category_id_idx on public.tasks (category_id);

-- ---------------------------------------------------------------------------
-- user_stats
-- ---------------------------------------------------------------------------
create table public.user_stats (
  user_id               uuid primary key references auth.users (id) on delete cascade,
  xp_total              int not null default 0 check (xp_total >= 0),
  streak_atual          int not null default 0 check (streak_atual >= 0),
  streak_recorde        int not null default 0 check (streak_recorde >= 0),
  ultima_data_conclusao date
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.tasks      enable row level security;
alter table public.user_stats enable row level security;

-- categories: CRUD completo só nas próprias linhas
create policy "categories: select own" on public.categories
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "categories: insert own" on public.categories
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "categories: update own" on public.categories
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "categories: delete own" on public.categories
  for delete to authenticated using ((select auth.uid()) = user_id);

-- tasks: CRUD completo só nas próprias linhas
create policy "tasks: select own" on public.tasks
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "tasks: insert own" on public.tasks
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "tasks: update own" on public.tasks
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "tasks: delete own" on public.tasks
  for delete to authenticated using ((select auth.uid()) = user_id);

-- user_stats: o usuário só lê as próprias estatísticas.
-- Não há policy de insert/update: XP e streak são gravados pelo servidor
-- (trigger abaixo e, no passo 10, uma função de conclusão de tarefa),
-- para que o cliente não consiga editar o próprio XP.
create policy "user_stats: select own" on public.user_stats
  for select to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Cria a linha de user_stats automaticamente para cada novo usuário
-- ---------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_stats (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Usuários que já existam antes deste script também ganham a linha
insert into public.user_stats (user_id)
select id from auth.users
on conflict (user_id) do nothing;
