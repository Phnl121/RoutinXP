-- v2 · Integrações: calendários iCal (Blackboard e outros) viram tarefas.
-- Cada fonte é um link .ics de uma disciplina, com a categoria e a tag que as tarefas recebem.
-- A leitura dos links roda no servidor (Edge Function sincronizar-calendarios).

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
  category_id       uuid,
  tag_id            uuid,
  importar_passadas boolean not null default false,
  ultima_sync       timestamptz, -- última leitura que deu certo
  ultima_tentativa  timestamptz, -- última tentativa, com ou sem sucesso
  ultimo_erro       text,
  total_importadas  int not null default 0,
  created_at        timestamptz not null default now(),
  -- Categoria e tag precisam ser do mesmo usuário. Se forem excluídas, a fonte fica sem elas.
  foreign key (category_id, user_id) references public.categories (id, user_id) on delete set null (category_id),
  foreign key (tag_id, user_id) references public.tags (id, user_id) on delete set null (tag_id)
);

create index calendar_sources_user_id_idx on public.calendar_sources (user_id);
create index calendar_sources_tentativa_idx on public.calendar_sources (ultima_tentativa nulls first);

-- Trocar o link libera uma nova leitura na hora e limpa o erro antigo.
create function public.calendar_sources_link_trocado()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.url is distinct from old.url then
    new.ultima_tentativa := null;
    new.ultimo_erro := null;
  end if;
  return new;
end;
$$;

create trigger calendar_sources_link_trocado
  before update on public.calendar_sources
  for each row execute function public.calendar_sources_link_trocado();

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
-- previa_uso: limite do "Testar link" (10 leituras a cada 10 minutos por usuário)
-- ---------------------------------------------------------------------------
create table public.previa_uso (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  janela_inicio timestamptz not null default now(),
  contagem      int not null default 0
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.calendar_sources enable row level security;
alter table public.calendar_items   enable row level security;
alter table public.previa_uso       enable row level security;

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

-- previa_uso: sem policy; só o servidor usa.

-- ---------------------------------------------------------------------------
-- Privilégios: a url nunca volta para o navegador (só o domínio).
-- ---------------------------------------------------------------------------
revoke all on public.calendar_sources from anon, authenticated;
revoke all on public.calendar_items   from anon, authenticated;
revoke all on public.previa_uso       from anon, authenticated;

grant select (id, user_id, nome, dominio, category_id, tag_id, importar_passadas, ultima_sync, ultima_tentativa, ultimo_erro, total_importadas, created_at)
  on public.calendar_sources to authenticated;
grant insert (nome, url, category_id, tag_id, importar_passadas) on public.calendar_sources to authenticated;
grant update (nome, url, category_id, tag_id, importar_passadas) on public.calendar_sources to authenticated;
grant delete on public.calendar_sources to authenticated;

grant select (source_id, user_id, task_id) on public.calendar_items to authenticated;

-- ---------------------------------------------------------------------------
-- Funções do servidor (só service_role)
-- ---------------------------------------------------------------------------

-- Importa uma atividade numa transação só: reserva o item, cria a tarefa, liga a tag e o item.
-- Devolve o id da tarefa, ou null se a atividade já tinha sido importada.
create function public.importar_atividade(p_source uuid, p_uid text, p_titulo text, p_data date)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fonte public.calendar_sources%rowtype;
  v_task  uuid;
begin
  select * into v_fonte from public.calendar_sources where id = p_source;
  if not found then
    raise exception 'fonte_nao_encontrada';
  end if;
  if v_fonte.category_id is null then
    raise exception 'sem_categoria';
  end if;

  insert into public.calendar_items (source_id, uid, user_id, data_origem, titulo_origem)
  values (p_source, p_uid, v_fonte.user_id, p_data, p_titulo)
  on conflict (source_id, uid) do nothing;
  if not found then
    return null;
  end if;

  insert into public.tasks (user_id, category_id, titulo, data_prevista)
  values (v_fonte.user_id, v_fonte.category_id, p_titulo, p_data)
  returning id into v_task;

  if v_fonte.tag_id is not null then
    insert into public.task_tags (task_id, tag_id, user_id) values (v_task, v_fonte.tag_id, v_fonte.user_id);
  end if;

  update public.calendar_items set task_id = v_task where source_id = p_source and uid = p_uid;
  return v_task;
end;
$$;

-- Conta um "Testar link" do usuário; false quando passou de 10 em 10 minutos.
create function public.registrar_previa(p_user uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_contagem int;
begin
  insert into public.previa_uso as u (user_id, janela_inicio, contagem)
  values (p_user, now(), 1)
  on conflict (user_id) do update set
    contagem      = case when u.janela_inicio < now() - interval '10 minutes' then 1 else u.contagem + 1 end,
    janela_inicio = case when u.janela_inicio < now() - interval '10 minutes' then now() else u.janela_inicio end
  returning contagem into v_contagem;
  return v_contagem <= 10;
end;
$$;

revoke execute on function public.importar_atividade(uuid, text, text, date) from public, anon, authenticated;
revoke execute on function public.registrar_previa(uuid) from public, anon, authenticated;
grant execute on function public.importar_atividade(uuid, text, text, date) to service_role;
grant execute on function public.registrar_previa(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Agendamento: a cada 30 minutos o banco chama a função, que lê só os calendários
-- sem tentativa há 3 horas ou mais (em lotes). Cada calendário é lido a cada ~3 h.
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
  '*/30 * * * *',
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
