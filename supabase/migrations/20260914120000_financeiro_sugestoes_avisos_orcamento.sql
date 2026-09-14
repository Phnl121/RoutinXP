-- Controle financeiro, fases 5.5, 3.6 e 6 (pedido do usuário, 2026-09-14).

-- ---------------------------------------------------------------------------
-- 5.5 Recorrências detectadas: sugestões que a pessoa dispensou
-- ---------------------------------------------------------------------------
-- A detecção roda na tela (6 meses de lançamentos). Guardamos só as chaves dispensadas
-- ("Ignorar"), para a sugestão não voltar em outro aparelho.
alter table public.fin_preferencias
  add column sugestoes_ignoradas text[] not null default '{}'
    check (cardinality(sugestoes_ignoradas) <= 300);

-- ---------------------------------------------------------------------------
-- 3.6 Avisos de vencimento
-- ---------------------------------------------------------------------------
-- Faixa no topo do app (calculada na tela) e push um dia antes (Edge Function
-- avisos-vencimento, chamada pelo agendamento todo dia às 8h de Brasília).
alter table public.fin_preferencias
  add column avisar_vencimentos boolean not null default true;

-- Quem usa só o Financeiro também inscreve o aparelho para receber push (antes, só o Foco).
create or replace function public.registrar_push(p_endpoint text, p_p256dh text, p_auth text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.tem_alguma_funcao(array['foco', 'financeiro']) then
    raise exception 'sem_acesso' using errcode = '42501';
  end if;
  perform public.registrar_push_sem_portao(p_endpoint, p_p256dh, p_auth);
end;
$$;

revoke execute on function public.registrar_push(text, text, text) from public, anon;
grant execute on function public.registrar_push(text, text, text) to authenticated;

-- 8h de Brasília = 11h UTC. Só chama a função se alguém tiver gasto fixo ativo.
select cron.schedule(
  'routinxp-avisos-vencimento',
  '0 11 * * *',
  $cron$
  select net.http_post(
    url := 'https://cowlksvjueoacwthytmg.supabase.co/functions/v1/avisos-vencimento',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'routinxp_cron_sync')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  )
  where exists (select 1 from public.fin_recorrencias where ativa and tipo <> 'parcelada');
  $cron$
);
