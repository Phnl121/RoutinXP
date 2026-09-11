-- v2 · Integrações: calendários iCal (Blackboard e outros) viram tarefas.
-- Cada fonte é um link .ics de uma disciplina, com a categoria e a tag que as tarefas recebem.
-- A leitura dos links roda no servidor (Edge Function sincronizar-calendarios), a cada 3 horas.

-- ---------------------------------------------------------------------------
-- calendar_sources: os links conectados
-- ---------------------------------------------------------------------------
create table public.calendar_sources (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome              text not null check (char_length(trim(nome)) between 1 and 60),
  -- O link funciona como uma senha: o navegador grava, mas não lê de volta (ver privilégios).
  url               text not null check (url ~ '^https://\S+$' and char_length(url) <= 2000),
  dominio           text generated always as (substring(url from '^https://([^/:?#]+)')) stored,
  category_id       uuid references public.categories (id) on delete set null,
  tag_id            uuid references public.tags (id) on delete set null,
  importar_passadas boolean not null default false,
  ultima_sync       timestamptz,
  ultimo_erro       text,
  total_importadas  int not null default 0,
  created_at        timestamptz not null default now()
);

create index calendar_sources_user_id_idx on public.calendar_sources (user_id);

-- ---------------------------------------------------------------------------
-- calendar_items: cada atividade do calendário ↔ a tarefa criada
-- task_id nulo = o usuário excluiu a tarefa, e ela não volta.
-- ---------------------------------------------------------------------------
create table public.calendar_items (
  source_id     uuid not null references public.calendar_sources (id) on delete cascade,
  uid           text not null,
  user_id       uuid not null references auth.users (id) on delete cascade,
  task_id       uuid references public.tasks (id) on delete set null,
  data_origem   date,
  titulo_origem text,
  created_at    timestamptz not null default now(),
  primary key (source_id, uid)
);

create index calendar_items_task_id_idx on public.calendar_items (task_id);
create index calendar_items_user_id_idx on public.calendar_items (user_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.calendar_sources enable row level security;
alter table public.calendar_items   enable row level security;

create policy "calendar_sources: select own" on public.calendar_sources
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "calendar_sources: insert own" on public.calendar_sources
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "calendar_sources: update own" on public.calendar_sources
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "calendar_sources: delete own" on public.calendar_sources
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Itens: o app só lê (para saber quais tarefas vieram de cada calendário); quem escreve é o servidor.
create policy "calendar_items: select own" on public.calendar_items
  for select to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Privilégios: a url nunca volta para o navegador (só o domínio).
-- ---------------------------------------------------------------------------
revoke all on public.calendar_sources from anon, authenticated;
revoke all on public.calendar_items   from anon, authenticated;

grant select (id, user_id, nome, dominio, category_id, tag_id, importar_passadas, ultima_sync, ultimo_erro, total_importadas, created_at)
  on public.calendar_sources to authenticated;
grant insert (nome, url, category_id, tag_id, importar_passadas) on public.calendar_sources to authenticated;
grant update (nome, url, category_id, tag_id, importar_passadas) on public.calendar_sources to authenticated;
grant delete on public.calendar_sources to authenticated;

grant select (source_id, user_id, task_id) on public.calendar_items to authenticated;

-- ---------------------------------------------------------------------------
-- Agendamento: a cada 3 horas o banco chama a função de sincronização.
-- O segredo que autentica essa chamada é gerado aqui, no próprio banco, e fica no Vault:
-- nunca passa pelo git nem pelo navegador.
-- ---------------------------------------------------------------------------
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;

select vault.create_secret(
  replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  'routinxp_cron_sync',
  'Autentica o agendamento que sincroniza os calendários (gerado no banco).'
);

-- A função confere o segredo recebido; só o servidor (service_role) pode chamar.
create function public.segredo_cron_valido(p_segredo text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from vault.decrypted_secrets
     where name = 'routinxp_cron_sync' and decrypted_secret = p_segredo
  );
$$;

revoke execute on function public.segredo_cron_valido(text) from public, anon, authenticated;
grant execute on function public.segredo_cron_valido(text) to service_role;

select cron.schedule(
  'routinxp-sincronizar-calendarios',
  '0 */3 * * *',
  $cron$
  select net.http_post(
    url := 'https://cowlksvjueoacwthytmg.supabase.co/functions/v1/sincronizar-calendarios',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'routinxp_cron_sync')
    ),
    body := '{"modo":"cron"}'::jsonb,
    timeout_milliseconds := 60000
  );
  $cron$
);
