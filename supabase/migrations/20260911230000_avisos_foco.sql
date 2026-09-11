-- Aviso de fim de fase da página Foco por Web Push (pedido de 2026-09-11): o celular e o
-- computador avisam que o tempo acabou mesmo com a tela bloqueada, a aba escondida ou o app
-- fechado. O navegador agenda o aviso com a hora de término da fase; o banco confere a cada
-- 15 s se há aviso vencido e, só então, chama a Edge Function avisos-foco, que envia o push.
--
-- As tabelas não são acessíveis pelo navegador: tudo passa pelas funções abaixo, que usam o
-- login (auth.uid()) e validam os valores.

-- ---------------------------------------------------------------------------
-- Inscrições de push (uma por navegador/aparelho do usuário)
-- ---------------------------------------------------------------------------
create table public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  -- Só os serviços de push dos navegadores (Chrome/Android, Firefox, Safari/iPhone, Edge):
  -- o servidor manda requisições a esse endereço, então ele não pode ser qualquer um.
  endpoint   text not null unique check (
    char_length(endpoint) <= 1000
    and endpoint ~ '^https://(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|web\.push\.apple\.com|[a-z0-9.-]+\.push\.apple\.com|[a-z0-9-]+\.notify\.windows\.com)/'
  ),
  p256dh     text not null check (char_length(p256dh) between 20 and 200),
  auth       text not null check (char_length(auth) between 10 and 100),
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

-- ---------------------------------------------------------------------------
-- Aviso pendente (no máximo um por usuário: a fase que está correndo agora)
-- ---------------------------------------------------------------------------
create table public.focus_alerts (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  enviar_em  timestamptz not null,
  tipo       text not null check (tipo in ('fim_foco', 'fim_pausa')),
  created_at timestamptz not null default now()
);

create index focus_alerts_enviar_em_idx on public.focus_alerts (enviar_em);

alter table public.push_subscriptions enable row level security;
alter table public.focus_alerts enable row level security;
-- Sem políticas: só as funções (security definer) e o servidor mexem nessas tabelas.
revoke all on public.push_subscriptions from anon, authenticated;
revoke all on public.focus_alerts from anon, authenticated;

-- O mesmo navegador pode trocar de conta: a inscrição passa para quem está logado agora.
-- Guarda no máximo 10 aparelhos por usuário (os mais recentes).
create function public.registrar_push(p_endpoint text, p_p256dh text, p_auth text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'sem_login';
  end if;
  delete from public.push_subscriptions where endpoint = p_endpoint;
  insert into public.push_subscriptions (user_id, endpoint, p256dh, auth)
  values (v_user, p_endpoint, p_p256dh, p_auth);
  delete from public.push_subscriptions
   where user_id = v_user
     and id not in (
       select id from public.push_subscriptions where user_id = v_user order by created_at desc limit 10
     );
end;
$$;

-- Agenda (ou reagenda) o aviso da fase atual. A hora vem do navegador, mas só vale entre
-- agora e 3 horas à frente.
create function public.agendar_aviso_foco(p_enviar_em timestamptz, p_tipo text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'sem_login';
  end if;
  if p_enviar_em < now() - interval '1 minute' or p_enviar_em > now() + interval '3 hours' then
    raise exception 'horario_invalido';
  end if;
  insert into public.focus_alerts (user_id, enviar_em, tipo)
  values (v_user, p_enviar_em, p_tipo)
  on conflict (user_id) do update
    set enviar_em = excluded.enviar_em, tipo = excluded.tipo, created_at = now();
end;
$$;

-- Pausou, pulou ou encerrou: não há aviso a mandar.
create function public.cancelar_aviso_foco()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.focus_alerts where user_id = auth.uid();
$$;

-- Usada pela Edge Function: tira os avisos vencidos numa operação só (ninguém recebe duas
-- vezes, mesmo que duas execuções se cruzem) e devolve quem avisar.
create function public.retirar_avisos_foco_vencidos()
returns table (user_id uuid, tipo text)
language sql
security definer
set search_path = ''
as $$
  delete from public.focus_alerts where enviar_em <= now() returning user_id, tipo;
$$;

revoke execute on function public.registrar_push(text, text, text) from public, anon;
revoke execute on function public.agendar_aviso_foco(timestamptz, text) from public, anon;
revoke execute on function public.cancelar_aviso_foco() from public, anon;
revoke execute on function public.retirar_avisos_foco_vencidos() from public, anon, authenticated;
grant execute on function public.registrar_push(text, text, text) to authenticated;
grant execute on function public.agendar_aviso_foco(timestamptz, text) to authenticated;
grant execute on function public.cancelar_aviso_foco() to authenticated;
grant execute on function public.retirar_avisos_foco_vencidos() to service_role;

-- ---------------------------------------------------------------------------
-- Agendamento: a cada 15 s, só chama a Edge Function quando há aviso vencido.
-- Usa o mesmo segredo do Vault que autentica a sincronização dos calendários.
-- ---------------------------------------------------------------------------
select cron.schedule(
  'routinxp-avisos-foco',
  '15 seconds',
  $cron$
  select net.http_post(
    url := 'https://cowlksvjueoacwthytmg.supabase.co/functions/v1/avisos-foco',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'routinxp_cron_sync')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  )
  where exists (select 1 from public.focus_alerts where enviar_em <= now());
  $cron$
);
