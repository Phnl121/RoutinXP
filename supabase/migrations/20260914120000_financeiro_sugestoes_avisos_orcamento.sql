-- Controle financeiro, fases 5.5, 3.6 e 6 (pedido do usuário, 2026-09-14).

-- ---------------------------------------------------------------------------
-- 5.5 Recorrências detectadas: sugestões que a pessoa dispensou
-- ---------------------------------------------------------------------------
-- A detecção roda na tela (6 meses de lançamentos). Guardamos só as chaves dispensadas
-- ("Ignorar"), para a sugestão não voltar em outro aparelho.
alter table public.fin_preferencias
  add column sugestoes_ignoradas text[] not null default '{}'
    check (cardinality(sugestoes_ignoradas) <= 300);

-- Ignorar acrescenta à lista no banco (outro aparelho pode ter ignorado outra sugestão antes);
-- guarda as 300 mais recentes. Devolve a lista gravada.
create function public.fin_ignorar_sugestao(p_chave text)
returns text[]
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_lista text[];
begin
  if auth.uid() is null then
    raise exception 'sem_acesso' using errcode = '42501';
  end if;
  if p_chave is null or char_length(p_chave) not between 1 and 200 then
    raise exception 'chave_invalida' using errcode = '22023';
  end if;
  insert into public.fin_preferencias as p (user_id, sugestoes_ignoradas)
  values (auth.uid(), array[p_chave])
  on conflict (user_id) do update
    set sugestoes_ignoradas = (array_remove(p.sugestoes_ignoradas, p_chave) || p_chave)[
          greatest(1, cardinality(array_remove(p.sugestoes_ignoradas, p_chave)) + 1 - 299):
        ],
        updated_at = now()
  returning sugestoes_ignoradas into v_lista;
  return v_lista;
end;
$$;

revoke execute on function public.fin_ignorar_sugestao(text) from public, anon;
grant execute on function public.fin_ignorar_sugestao(text) to authenticated;

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

-- ---------------------------------------------------------------------------
-- 6 Orçamento e metas
-- ---------------------------------------------------------------------------
-- Limite mensal por categoria de despesa. O quanto já foi gasto é calculado na tela, com os
-- lançamentos do mês (aviso em 80% e 100%).
create table public.fin_orcamentos (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  categoria_id     uuid not null,
  limite_centavos  bigint not null check (limite_centavos between 1 and 100000000000),
  updated_at       timestamptz not null default now(),
  unique (user_id, categoria_id),
  foreign key (categoria_id, user_id) references public.fin_categorias (id, user_id) on delete cascade
);

alter table public.fin_orcamentos enable row level security;

create policy "fin_orcamentos: own" on public.fin_orcamentos for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "fin_orcamentos: funcao" on public.fin_orcamentos as restrictive for all to authenticated
  using ((select public.tem_funcao('financeiro'))) with check ((select public.tem_funcao('financeiro')));

revoke all on public.fin_orcamentos from anon;

create trigger fin_orcamentos_limite before insert on public.fin_orcamentos
  for each row execute function public.limitar_linhas_por_usuario('300');

-- A janela "Definir limites" grava a lista inteira de uma vez: o que não veio sai.
-- p_limites: [{"categoria_id": "...", "limite_centavos": 50000}, ...]. Só categorias de despesa.
create function public.fin_salvar_orcamentos(p_limites jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'sem_acesso' using errcode = '42501';
  end if;
  if jsonb_typeof(p_limites) <> 'array' or jsonb_array_length(p_limites) > 200 then
    raise exception 'limites_invalidos' using errcode = '22023';
  end if;
  if exists (
    select 1
      from jsonb_array_elements(p_limites) l
     where jsonb_typeof(l -> 'limite_centavos') <> 'number'
        or jsonb_typeof(l -> 'categoria_id') <> 'string'
  ) then
    raise exception 'limites_invalidos' using errcode = '22023';
  end if;
  if exists (
    select 1
      from jsonb_array_elements(p_limites) l
      left join public.fin_categorias c on c.id = (l ->> 'categoria_id')::uuid and c.user_id = v_user
     where c.id is null or c.tipo <> 'despesa'
  ) then
    raise exception 'categoria_incompativel' using errcode = '23514';
  end if;

  delete from public.fin_orcamentos
   where user_id = v_user
     and categoria_id not in (select (l ->> 'categoria_id')::uuid from jsonb_array_elements(p_limites) l);

  -- A mesma categoria repetida vale uma vez (a última).
  insert into public.fin_orcamentos (user_id, categoria_id, limite_centavos)
  select distinct on ((l ->> 'categoria_id')::uuid) v_user, (l ->> 'categoria_id')::uuid, (l ->> 'limite_centavos')::bigint
    from jsonb_array_elements(p_limites) with ordinality as e(l, i)
   order by (l ->> 'categoria_id')::uuid, i desc
  on conflict (user_id, categoria_id)
  do update set limite_centavos = excluded.limite_centavos, updated_at = now()
   where public.fin_orcamentos.limite_centavos is distinct from excluded.limite_centavos;
end;
$$;

revoke execute on function public.fin_salvar_orcamentos(jsonb) from public, anon;
grant execute on function public.fin_salvar_orcamentos(jsonb) to authenticated;

-- Meta de poupança do mês: uma parte das entradas (pct, de 1 a 90) ou um valor fixo (centavos).
alter table public.fin_preferencias
  add column meta_tipo text check (meta_tipo in ('pct', 'valor')),
  add column meta_valor bigint,
  add constraint fin_preferencias_meta_check check (
    (meta_tipo is null and meta_valor is null)
    or (meta_tipo = 'pct' and meta_valor between 1 and 90)
    or (meta_tipo = 'valor' and meta_valor between 1 and 100000000000)
  );
