-- Agenda (pedido do usuário, 2026-09-14): uma página abaixo de Tarefas com os eventos do dia,
-- da semana e do mês, e as tarefas marcadas para um dia.
-- - Eventos: título, descrição, local, início e fim (ou dia todo), categoria (cor), repetição
--   e lembrete por push.
-- - Tarefas ganham "quando fazer" (dia e, se quiser, horário), separado do prazo
--   (data_prevista), que continua sendo a data limite e vale para o XP no prazo.

-- ---------------------------------------------------------------------------
-- Função Agenda no painel de administração
-- ---------------------------------------------------------------------------
alter table public.contas_app drop constraint contas_app_funcoes_check;
alter table public.contas_app add constraint contas_app_funcoes_check
  check (funcoes <@ array['tarefas', 'kanban', 'calendario', 'foco', 'painel', 'integracoes', 'financeiro', 'agenda']::text[]);

-- Quem já usa Tarefas ganha a Agenda.
update public.contas_app
   set funcoes = array_append(funcoes, 'agenda')
 where funcoes @> array['tarefas'] and not funcoes @> array['agenda'];

-- Ler e gravar tarefas também vale para quem só tem a Agenda (ela mostra e cria tarefas).
alter policy "categories: funcao" on public.categories
  using ((select public.tem_alguma_funcao(array['tarefas', 'kanban', 'calendario', 'foco', 'painel', 'agenda'])))
  with check ((select public.tem_alguma_funcao(array['tarefas', 'kanban', 'calendario', 'foco', 'painel', 'agenda'])));
alter policy "tags: funcao" on public.tags
  using ((select public.tem_alguma_funcao(array['tarefas', 'kanban', 'calendario', 'foco', 'painel', 'agenda'])))
  with check ((select public.tem_alguma_funcao(array['tarefas', 'kanban', 'calendario', 'foco', 'painel', 'agenda'])));
alter policy "task_tags: funcao" on public.task_tags
  using ((select public.tem_alguma_funcao(array['tarefas', 'kanban', 'calendario', 'foco', 'painel', 'agenda'])))
  with check ((select public.tem_alguma_funcao(array['tarefas', 'kanban', 'calendario', 'foco', 'painel', 'agenda'])));
alter policy "tasks: funcao" on public.tasks
  using ((select public.tem_alguma_funcao(array['tarefas', 'kanban', 'calendario', 'foco', 'painel', 'agenda'])))
  with check ((select public.tem_alguma_funcao(array['tarefas', 'kanban', 'calendario', 'foco', 'painel', 'agenda'])));

-- Concluir tarefa pela Agenda (mesmas regras de XP e streak).
create or replace function public.concluir_tarefa(p_task_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.tem_alguma_funcao(array['tarefas', 'kanban', 'calendario', 'foco', 'agenda']) then
    raise exception 'sem_acesso' using errcode = '42501';
  end if;
  return public.concluir_tarefa_sem_portao(p_task_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- Tarefas: quando fazer
-- ---------------------------------------------------------------------------
alter table public.tasks
  add column planejada_dia    date,
  add column planejada_inicio time,
  add column planejada_fim    time,
  add constraint tasks_planejada_check check (
    (planejada_inicio is null or planejada_dia is not null)
    and (planejada_fim is null or (planejada_inicio is not null and planejada_fim > planejada_inicio))
  );

create index tasks_planejada_idx on public.tasks (user_id, planejada_dia) where planejada_dia is not null;

-- ---------------------------------------------------------------------------
-- Eventos
-- ---------------------------------------------------------------------------
-- Horários no relógio de Brasília (timestamp sem fuso), como o resto do app. No dia todo,
-- início e fim são meia-noite do primeiro e do último dia (o fim conta o dia inteiro).
create table public.agenda_eventos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo        text not null check (char_length(trim(titulo)) between 1 and 200),
  descricao     text check (descricao is null or char_length(descricao) <= 2000),
  local         text check (local is null or char_length(local) <= 300),
  dia_todo      boolean not null default false,
  inicio        timestamp not null,
  fim           timestamp not null,
  categoria_id  uuid,
  -- nao, diaria, semanal, mensal (mesmo dia do mês; dia 31 cai no último dia) ou anual.
  repeticao     text not null default 'nao' check (repeticao in ('nao', 'diaria', 'semanal', 'mensal', 'anual')),
  repetir_ate   date,
  -- Dias de uma repetição que foram apagados ("excluir só este").
  excluidas     date[] not null default '{}' check (cardinality(excluidas) <= 500),
  -- Minutos antes do início para o aviso por push (nulo: sem aviso).
  lembrete_min  int check (lembrete_min in (0, 10, 30, 60, 1440)),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (id, user_id),
  foreign key (categoria_id, user_id) references public.categories (id, user_id) on delete set null (categoria_id),
  check (fim >= inicio),
  -- Um evento que dura mais de 1 ano é engano de data.
  check (fim - inicio <= interval '366 days'),
  check (not dia_todo or (inicio = date_trunc('day', inicio) and fim = date_trunc('day', fim))),
  check (repeticao = 'nao' or repetir_ate is null or repetir_ate >= inicio::date),
  check (repeticao <> 'nao' or repetir_ate is null)
);

create index agenda_eventos_user_idx on public.agenda_eventos (user_id, inicio);
create index agenda_eventos_categoria_idx on public.agenda_eventos (categoria_id) where categoria_id is not null;
create index agenda_eventos_lembrete_idx on public.agenda_eventos (inicio) where lembrete_min is not null;

alter table public.agenda_eventos enable row level security;

create policy "agenda_eventos: own" on public.agenda_eventos for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "agenda_eventos: funcao" on public.agenda_eventos as restrictive for all to authenticated
  using ((select public.tem_funcao('agenda'))) with check ((select public.tem_funcao('agenda')));

revoke all on public.agenda_eventos from anon;

create trigger agenda_eventos_limite before insert on public.agenda_eventos
  for each row execute function public.limitar_linhas_por_usuario('3000');

create function public.agenda_eventos_atualizado()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger agenda_eventos_atualizado before update on public.agenda_eventos
  for each row execute function public.agenda_eventos_atualizado();

-- ---------------------------------------------------------------------------
-- Lembretes por push
-- ---------------------------------------------------------------------------
-- Cada aviso enviado fica registrado (evento + início da ocorrência), para não repetir.
-- Só a Edge Function avisos-agenda (chave de serviço) lê e grava aqui.
create table public.agenda_avisos_enviados (
  evento_id   uuid not null references public.agenda_eventos (id) on delete cascade,
  ocorrencia  timestamp not null,
  enviado_em  timestamptz not null default now(),
  primary key (evento_id, ocorrencia)
);

alter table public.agenda_avisos_enviados enable row level security;
revoke all on public.agenda_avisos_enviados from anon, authenticated;

-- Push liberado também para quem usa a Agenda.
create or replace function public.registrar_push(p_endpoint text, p_p256dh text, p_auth text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.tem_alguma_funcao(array['foco', 'financeiro', 'agenda']) then
    raise exception 'sem_acesso' using errcode = '42501';
  end if;
  perform public.registrar_push_sem_portao(p_endpoint, p_p256dh, p_auth);
end;
$$;

revoke execute on function public.registrar_push(text, text, text) from public, anon;
grant execute on function public.registrar_push(text, text, text) to authenticated;

-- A cada 5 minutos, só quando existe algum evento com lembrete. Registros com mais de 3 dias saem.
select cron.schedule(
  'routinxp-avisos-agenda',
  '*/5 * * * *',
  $cron$
  select net.http_post(
    url := 'https://cowlksvjueoacwthytmg.supabase.co/functions/v1/avisos-agenda',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'routinxp_cron_sync')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  )
  where exists (select 1 from public.agenda_eventos where lembrete_min is not null);
  delete from public.agenda_avisos_enviados where enviado_em < now() - interval '3 days';
  $cron$
);
