-- Controle financeiro, fase 4: Open Finance pelo MeuPluggy (pedido do usuário, 2026-09-13).
-- - As chaves da Pluggy e os itens (um por banco conectado no MeuPluggy) ficam só nos segredos
--   das Edge Functions (PLUGGY_CLIENT_ID, PLUGGY_CLIENT_SECRET, PLUGGY_ITEM_IDS). O navegador
--   nunca fala com a Pluggy.
-- - A Edge Function sincronizar-banco lê contas e lançamentos e grava com a chave de serviço.
--   Só o administrador verificado conecta (o plano grátis do MeuPluggy é de uso pessoal).
-- - Cada conta e lançamento importado guarda o identificador da Pluggy: ler de novo não duplica.

-- ---------------------------------------------------------------------------
-- Bancos conectados
-- ---------------------------------------------------------------------------
create table public.fin_conexoes (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Item da Pluggy (uma conexão por banco no MeuPluggy).
  item_id                text not null check (char_length(item_id) between 1 and 100),
  banco                  text,
  imagem_url             text,
  -- Situação do item na Pluggy: UPDATED, UPDATING, LOGIN_ERROR, OUTDATED, WAITING_USER_INPUT…
  status                 text,
  ultimo_erro            text,
  ultima_sync            timestamptz,
  ultima_tentativa       timestamptz,
  consentimento_expira   timestamptz,
  created_at             timestamptz not null default now(),
  unique (user_id, item_id),
  -- Um banco conectado pertence a uma conta só: outro administrador não recebe os mesmos dados.
  unique (item_id)
);

alter table public.fin_conexoes enable row level security;

-- O dono lê e desconecta; quem grava é a Edge Function (chave de serviço).
create policy "fin_conexoes: ler" on public.fin_conexoes for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "fin_conexoes: desconectar" on public.fin_conexoes for delete to authenticated
  using ((select auth.uid()) = user_id);
create policy "fin_conexoes: funcao" on public.fin_conexoes as restrictive for all to authenticated
  using ((select public.tem_funcao('financeiro'))) with check ((select public.tem_funcao('financeiro')));

revoke all on public.fin_conexoes from anon;
revoke insert, update on public.fin_conexoes from authenticated;

-- ---------------------------------------------------------------------------
-- Contas e lançamentos importados
-- ---------------------------------------------------------------------------
alter table public.fin_contas
  add column origem     text not null default 'manual' check (origem in ('manual', 'banco')),
  -- Conta da Pluggy (id) e o item (banco) de onde veio.
  add column externo_id text,
  add column item_id    text;

create unique index fin_contas_externo_unico on public.fin_contas (user_id, externo_id) where externo_id is not null;

alter table public.fin_transacoes
  add column externo_id         text,
  -- Transferência montada a partir de duas pontas importadas (saída numa conta, entrada na
  -- outra): a ponta de entrada fica guardada aqui para não ser importada de novo.
  add column externo_id_destino text,
  -- Ainda não compensado no banco (PENDING na Pluggy).
  add column pendente           boolean not null default false,
  -- Lançamento importado que parece o mesmo de um manual (mesmo valor, data ±2 dias):
  -- a tela sugere juntar ou manter os dois.
  add column duplicata_de       uuid;

-- Referência ao lançamento manual sempre da mesma pessoa (FK composta, como no resto do modelo).
alter table public.fin_transacoes
  add constraint fin_transacoes_id_user_unico unique (id, user_id),
  add constraint fin_transacoes_duplicata_fk foreign key (duplicata_de, user_id)
    references public.fin_transacoes (id, user_id) on delete set null (duplicata_de);

create unique index fin_transacoes_externo_unico on public.fin_transacoes (user_id, externo_id) where externo_id is not null;
create unique index fin_transacoes_externo_destino_unico on public.fin_transacoes (user_id, externo_id_destino)
  where externo_id_destino is not null;
create index fin_transacoes_duplicata_idx on public.fin_transacoes (duplicata_de) where duplicata_de is not null;

-- ---------------------------------------------------------------------------
-- Movimento de uma conta (entradas − saídas ± transferências) de um dia até hoje
-- ---------------------------------------------------------------------------
-- Mesma conta de fin_saldos, para uma conta só. Usada pela leitura do banco (chave de serviço)
-- e ao juntar contas. Roda com as permissões de quem chama.
create function public.fin_movimento_conta(p_conta uuid, p_desde date)
returns bigint
language sql
stable
security invoker
set search_path = ''
as $$
  with hoje as (select (now() at time zone 'America/Sao_Paulo')::date as dia)
  select coalesce((
           select sum(case when t.tipo = 'entrada' then t.valor_centavos else -t.valor_centavos end)
             from public.fin_transacoes t, hoje
            where t.conta_id = p_conta and t.data between p_desde and hoje.dia
         ), 0)
       + coalesce((
           select sum(t.valor_centavos)
             from public.fin_transacoes t, hoje
            where t.conta_destino_id = p_conta and t.data between p_desde and hoje.dia
         ), 0);
$$;

revoke execute on function public.fin_movimento_conta(uuid, date) from public, anon;
grant execute on function public.fin_movimento_conta(uuid, date) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Juntar uma conta importada com uma conta manual que já existia
-- ---------------------------------------------------------------------------
-- Os lançamentos da conta importada passam para a manual, que herda o vínculo com o banco; a
-- importada sai. O saldo da conta juntada fica igual ao saldo de hoje da importada (o do banco).
create function public.fin_juntar_contas(p_importada uuid, p_manual uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  imp public.fin_contas;
  man public.fin_contas;
  v_saldo_banco bigint;
  v_desde date;
begin
  select * into imp from public.fin_contas where id = p_importada;
  select * into man from public.fin_contas where id = p_manual;
  if imp.id is null or man.id is null or imp.origem <> 'banco' or man.origem <> 'manual' or imp.tipo <> man.tipo then
    raise exception 'contas_incompativeis' using errcode = '22023';
  end if;

  v_saldo_banco := imp.saldo_inicial_centavos + public.fin_movimento_conta(imp.id, imp.saldo_inicial_em);
  v_desde := least(man.saldo_inicial_em, imp.saldo_inicial_em);

  -- Transferências entre as duas viraram movimento dentro da mesma conta: saem antes da troca.
  delete from public.fin_transacoes
   where tipo = 'transferencia'
     and ((conta_id = imp.id and conta_destino_id = man.id) or (conta_id = man.id and conta_destino_id = imp.id));

  update public.fin_transacoes set conta_id = man.id where conta_id = imp.id;
  update public.fin_transacoes set conta_destino_id = man.id where conta_destino_id = imp.id;
  update public.fin_recorrencias set conta_id = man.id where conta_id = imp.id;

  update public.fin_contas set externo_id = null, item_id = null where id = imp.id;
  delete from public.fin_contas where id = imp.id;

  update public.fin_contas
     set origem = 'banco', externo_id = imp.externo_id, item_id = imp.item_id,
         saldo_inicial_em = v_desde,
         saldo_inicial_centavos = v_saldo_banco - public.fin_movimento_conta(man.id, v_desde),
         dia_fechamento = coalesce(man.dia_fechamento, imp.dia_fechamento),
         dia_vencimento = coalesce(man.dia_vencimento, imp.dia_vencimento)
   where id = man.id;
end;
$$;

revoke execute on function public.fin_juntar_contas(uuid, uuid) from public, anon;
grant execute on function public.fin_juntar_contas(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Resolver uma possível duplicata
-- ---------------------------------------------------------------------------
-- Juntar: fica o lançamento do banco, que herda do manual a categoria (se não tiver) e o vínculo
-- com o gasto fixo (pagamento, parcela); o manual sai. Senão, só tira a marca. Uma operação só.
create function public.fin_resolver_duplicata(p_banco uuid, p_juntar boolean)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  b public.fin_transacoes;
  m public.fin_transacoes;
begin
  select * into b from public.fin_transacoes where id = p_banco;
  if b.id is null or b.origem <> 'banco' then
    raise exception 'lancamento_invalido' using errcode = '22023';
  end if;
  if p_juntar and b.duplicata_de is not null then
    select * into m from public.fin_transacoes where id = b.duplicata_de;
  end if;
  if m.id is not null then
    -- O manual sai antes: a cobrança do gasto fixo é única e passa para o do banco.
    delete from public.fin_transacoes where id = m.id;
    update public.fin_transacoes
       set duplicata_de = null,
           categoria_id = coalesce(b.categoria_id, m.categoria_id),
           recorrencia_id = coalesce(b.recorrencia_id, m.recorrencia_id),
           referencia = coalesce(b.referencia, m.referencia),
           parcela = coalesce(b.parcela, m.parcela)
     where id = b.id;
  else
    update public.fin_transacoes set duplicata_de = null where id = b.id;
  end if;
end;
$$;

revoke execute on function public.fin_resolver_duplicata(uuid, boolean) from public, anon;
grant execute on function public.fin_resolver_duplicata(uuid, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- Desconectar um banco
-- ---------------------------------------------------------------------------
-- Apagar: os lançamentos importados saem, e as contas do banco sem outros lançamentos também.
-- Manter: as contas deixam de ser do banco (voltam a ser manuais, com o saldo editável).
create function public.fin_desconectar_banco(p_conexao uuid, p_apagar boolean)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  c public.fin_conexoes;
begin
  select * into c from public.fin_conexoes where id = p_conexao;
  if c.id is null then
    raise exception 'conexao_invalida' using errcode = '22023';
  end if;
  if p_apagar then
    delete from public.fin_transacoes t
     using public.fin_contas a
     where a.item_id = c.item_id and a.origem = 'banco' and t.conta_id = a.id and t.origem = 'banco';
    delete from public.fin_contas a
     where a.item_id = c.item_id and a.origem = 'banco'
       and not exists (select 1 from public.fin_transacoes t where t.conta_id = a.id or t.conta_destino_id = a.id)
       and not exists (select 1 from public.fin_recorrencias r where r.conta_id = a.id);
  end if;
  update public.fin_contas
     set origem = 'manual', externo_id = null, item_id = null
   where item_id = c.item_id and origem = 'banco';
  delete from public.fin_conexoes where id = c.id;
end;
$$;

revoke execute on function public.fin_desconectar_banco(uuid, boolean) from public, anon;
grant execute on function public.fin_desconectar_banco(uuid, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- Leitura diária (6h de Brasília = 9h UTC)
-- ---------------------------------------------------------------------------
select cron.schedule(
  'routinxp-sincronizar-banco',
  '0 9 * * *',
  $cron$
  select net.http_post(
    url := 'https://cowlksvjueoacwthytmg.supabase.co/functions/v1/sincronizar-banco',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'routinxp_cron_sync')
    ),
    body := '{"modo":"cron"}'::jsonb,
    timeout_milliseconds := 60000
  )
  where exists (select 1 from public.fin_conexoes);
  $cron$
);
