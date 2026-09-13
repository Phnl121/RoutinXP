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
  unique (user_id, item_id)
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
  add column duplicata_de       uuid references public.fin_transacoes (id) on delete set null;

create unique index fin_transacoes_externo_unico on public.fin_transacoes (user_id, externo_id) where externo_id is not null;
create unique index fin_transacoes_externo_destino_unico on public.fin_transacoes (user_id, externo_id_destino)
  where externo_id_destino is not null;
create index fin_transacoes_duplicata_idx on public.fin_transacoes (duplicata_de) where duplicata_de is not null;

-- ---------------------------------------------------------------------------
-- Juntar uma conta importada com uma conta manual que já existia
-- ---------------------------------------------------------------------------
-- Os lançamentos da conta importada passam para a manual, que herda o vínculo com o banco; a
-- importada sai. O saldo inicial é recalculado na próxima leitura. Roda com as permissões de
-- quem chama (RLS vale).
create function public.fin_juntar_contas(p_importada uuid, p_manual uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  imp public.fin_contas;
  man public.fin_contas;
begin
  select * into imp from public.fin_contas where id = p_importada;
  select * into man from public.fin_contas where id = p_manual;
  if imp.id is null or man.id is null or imp.origem <> 'banco' or man.origem <> 'manual' or imp.tipo <> man.tipo then
    raise exception 'contas_incompativeis' using errcode = '22023';
  end if;

  update public.fin_transacoes set conta_id = man.id where conta_id = imp.id;
  update public.fin_transacoes set conta_destino_id = man.id where conta_destino_id = imp.id;
  update public.fin_recorrencias set conta_id = man.id where conta_id = imp.id;
  -- A troca de conta pode deixar uma transferência com as duas pontas na mesma conta.
  delete from public.fin_transacoes where tipo = 'transferencia' and conta_id = conta_destino_id;

  update public.fin_contas
     set externo_id = null, item_id = null
   where id = imp.id;
  update public.fin_contas
     set origem = 'banco', externo_id = imp.externo_id, item_id = imp.item_id,
         saldo_inicial_centavos = imp.saldo_inicial_centavos,
         saldo_inicial_em = least(man.saldo_inicial_em, imp.saldo_inicial_em),
         dia_fechamento = coalesce(man.dia_fechamento, imp.dia_fechamento),
         dia_vencimento = coalesce(man.dia_vencimento, imp.dia_vencimento)
   where id = man.id;
  delete from public.fin_contas where id = imp.id;
end;
$$;

revoke execute on function public.fin_juntar_contas(uuid, uuid) from public, anon;
grant execute on function public.fin_juntar_contas(uuid, uuid) to authenticated;

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
