-- Gasto fixo cobrado no cartão (pedido do usuário, 2026-09-14): a cobrança já sai do limite no
-- dia, então não há o que "pagar". O que fica devendo é a fatura do cartão.
-- - No dia da cobrança o gasto vira uma saída no cartão, sozinho (como as parcelas).
-- - Cartão conectado ao banco não recebe o lançamento: a compra já vem da importação.
-- - O aviso de vencimento passa a ser o da fatura (Edge Function avisos-vencimento).

-- Lança as cobranças de cartão (manual) de gastos fixos ativos, do dia do cadastro até hoje,
-- que ainda não existem. p_user nulo: todas as contas com a função Financeiro.
create function public.fin_lancar_cobrancas_cartao_de(p_user uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  v_total integer;
begin
  insert into public.fin_transacoes (user_id, tipo, valor_centavos, data, descricao, conta_id, categoria_id, recorrencia_id, referencia)
  select r.user_id, 'saida', r.valor_centavos, c.dia, r.nome, r.conta_id, r.categoria_id, r.id, c.dia
    from public.fin_recorrencias r
    join public.fin_contas k on k.id = r.conta_id and k.user_id = r.user_id
    cross join lateral (
      select case r.frequencia
               when 'semanal' then r.inicio + 7 * n
               when 'anual' then (r.inicio + make_interval(months => 12 * n))::date
               else (r.inicio + make_interval(months => n))::date
             end as dia
        from generate_series(
               0,
               case r.frequencia
                 when 'semanal' then (v_hoje - r.inicio) / 7
                 when 'anual' then (extract(year from age(v_hoje, r.inicio)))::int
                 else (extract(year from age(v_hoje, r.inicio)) * 12 + extract(month from age(v_hoje, r.inicio)))::int + 1
               end
             ) as n
    ) c
   where (p_user is null or r.user_id = p_user)
     and r.ativa
     and r.tipo <> 'parcelada'
     and k.tipo = 'cartao'
     and k.origem = 'manual'
     and not k.arquivada
     and c.dia >= greatest(r.inicio, (r.created_at at time zone 'America/Sao_Paulo')::date)
     and c.dia <= v_hoje
     and (r.fim is null or c.dia <= r.fim)
     and exists (select 1 from public.contas_app a where a.user_id = r.user_id and a.funcoes @> array['financeiro'])
     and not exists (select 1 from public.fin_transacoes t where t.recorrencia_id = r.id and t.referencia = c.dia)
  on conflict do nothing;
  get diagnostics v_total = row_count;
  return v_total;
end;
$$;

revoke execute on function public.fin_lancar_cobrancas_cartao_de(uuid) from public, anon, authenticated;

-- O app chama ao abrir o Financeiro (só as do próprio usuário).
create function public.fin_lancar_cobrancas_cartao()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.tem_funcao('financeiro') then
    raise exception 'sem_acesso' using errcode = '42501';
  end if;
  return public.fin_lancar_cobrancas_cartao_de(auth.uid());
end;
$$;

revoke execute on function public.fin_lancar_cobrancas_cartao() from public, anon;
grant execute on function public.fin_lancar_cobrancas_cartao() to authenticated;

-- O agendamento diário lança para todo mundo (mesmo sem abrir o app).
create function public.fin_lancar_cobrancas_cartao_todos()
returns integer
language sql
security definer
set search_path = ''
as $$
  select public.fin_lancar_cobrancas_cartao_de(null);
$$;

revoke execute on function public.fin_lancar_cobrancas_cartao_todos() from public, anon, authenticated;
grant execute on function public.fin_lancar_cobrancas_cartao_todos() to service_role;

-- Faturas de cartão que vencem num dia (o dia do vencimento cai no último dia dos meses
-- curtos) e estão em aberto, com o valor da fatura (o saldo negativo do cartão). Só para o
-- agendamento (chave de serviço).
create function public.fin_faturas_vencendo(p_dia date)
returns table (user_id uuid, nome text, fatura_centavos bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select c.user_id, c.nome, -s.saldo
    from public.fin_contas c
    cross join lateral (
      select c.saldo_inicial_centavos
             + coalesce((
                 select sum(case when t.tipo = 'entrada' then t.valor_centavos else -t.valor_centavos end)
                   from public.fin_transacoes t
                  where t.conta_id = c.id and t.data between c.saldo_inicial_em and p_dia - 1
               ), 0)
             + coalesce((
                 select sum(t.valor_centavos)
                   from public.fin_transacoes t
                  where t.conta_destino_id = c.id and t.data between c.saldo_inicial_em and p_dia - 1
               ), 0) as saldo
    ) s
   where c.tipo = 'cartao'
     and not c.arquivada
     and c.dia_vencimento is not null
     and least(c.dia_vencimento, extract(day from (date_trunc('month', p_dia) + interval '1 month - 1 day'))::int) = extract(day from p_dia)::int
     and s.saldo < 0;
$$;

revoke execute on function public.fin_faturas_vencendo(date) from public, anon, authenticated;
grant execute on function public.fin_faturas_vencendo(date) to service_role;

-- O agendamento dos avisos passa a rodar todo dia (também lança as cobranças de cartão).
select cron.unschedule('routinxp-avisos-vencimento');
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
  where exists (select 1 from public.fin_recorrencias where ativa and tipo <> 'parcelada')
     or exists (select 1 from public.fin_contas where tipo = 'cartao' and dia_vencimento is not null);
  $cron$
);
