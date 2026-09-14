-- Categorias da Pluggy (pedido do usuário, 2026-09-14): a pista do banco passa a cobrir a lista
-- inteira da Pluggy, inclusive entradas (rendimentos, reembolsos), e escolhe entre nomes de
-- categoria em ordem de preferência. Na tela, a categoria do banco aparece traduzida.

create or replace function public.fin_aplicar_regras(p_user uuid default null)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user uuid := coalesce(auth.uid(), p_user);
  v_regras integer;
  v_banco integer;
begin
  if v_user is null then
    raise exception 'sem_usuario' using errcode = '22023';
  end if;

  with alvo as (
    select t.id,
           (
             select r.categoria_id
               from public.fin_regras r
               join public.fin_categorias c on c.id = r.categoria_id
              where r.user_id = v_user
                and (r.tipo is null or r.tipo = t.tipo)
                and (r.conta_id is null or r.conta_id = t.conta_id)
                and c.tipo = case t.tipo when 'entrada' then 'receita' else 'despesa' end
                and not c.arquivada
                -- Palavras inteiras: "tim" não pega "ultimo"; "uber eats" vence "uber" pelo tamanho.
                and t.descricao_normalizada like ('%' || r.termo_normalizado || '%')
              order by r.prioridade desc, char_length(r.termo_normalizado) desc
              limit 1
           ) as categoria_id
      from public.fin_transacoes t
     where t.user_id = v_user
       and t.tipo <> 'transferencia'
       and (t.categoria_id is null or t.categoria_origem in ('regra', 'banco'))
  )
  update public.fin_transacoes t
     set categoria_id = alvo.categoria_id, categoria_origem = 'regra'
    from alvo
   where t.id = alvo.id
     and alvo.categoria_id is not null
     and (t.categoria_id is distinct from alvo.categoria_id or t.categoria_origem is distinct from 'regra');
  get diagnostics v_regras = row_count;

  -- Regra excluída ou editada: o que ela tinha categorizado e nenhuma regra pega mais volta
  -- para "a revisar" (a pista do banco, logo abaixo, ainda pode categorizar).
  update public.fin_transacoes t
     set categoria_id = null, categoria_origem = null
   where t.user_id = v_user
     and t.categoria_origem = 'regra'
     and not exists (
       select 1
         from public.fin_regras r
         join public.fin_categorias c on c.id = r.categoria_id
        where r.user_id = v_user
          and r.categoria_id = t.categoria_id
          and (r.tipo is null or r.tipo = t.tipo)
          and (r.conta_id is null or r.conta_id = t.conta_id)
          and not c.arquivada
          and t.descricao_normalizada like ('%' || r.termo_normalizado || '%')
     );

  -- Pista do banco: a categoria da Pluggy (em inglês) aponta para nomes de categoria, em ordem
  -- de preferência; vale o primeiro nome que a pessoa tiver. Hífens e símbolos viram espaço
  -- ("Taxi and ride-hailing" = "taxi and ride hailing").
  with pista as (
    select t.id, t.tipo,
           case
             -- \m e \M: palavra inteira ("rent" não pega "rental" nem "current").
             when t.tipo = 'entrada' then case
               when b ~ '\m(salary|payroll|wages?|retirement|pension)\M' then array['salario']
               when b ~ '\m(interests?|dividends?|proceeds|investments?|fixed income|mutual funds|variable income)\M' then array['rendimentos', 'investimentos', 'outros']
               when b ~ '\m(entrepreneurial|freelance)\M' then array['freelance', 'outros']
               when b ~ '\m(cashback|refunds?|government aid|income)\M' then array['outros']
             end
             when b ~ '\m(streaming|subscriptions?|digital services?|software|gaming)\M' then array['assinaturas']
             when b ~ '\m(groceries|grocery|supermarkets?)\M' then array['mercado', 'alimentacao']
             when b ~ '\m(food|eating out|restaurants?|bakery|food delivery|drinks)\M' then array['alimentacao']
             when b ~ '\m(transportation|transport|taxi|ride hailing|gas stations?|fuel|parking|tolls?|public transportation|car rental|bicycle|automotive|vehicle|traffic tickets|bus tickets)\M' then array['transporte']
             when b ~ '\m(gyms?|fitness|sports practice|wellness)\M' then array['academia', 'saude', 'lazer']
             when b ~ '\m(health|healthcare|pharmacy|pharmacies|drugstore|medical|dentist|dental|hospital|clinics?|optometry|labs)\M' then array['saude']
             when b ~ '\m(education|schools?|university|courses?|kindergarten|books?|bookstore)\M' then array['educacao']
             when b ~ '\m(rent|housing|utilities|electricity|water|gas|internet|telecommunications|telecom|mobile|tv|condominium|houseware|urban land)\M' then array['moradia']
             when b ~ '\m(leisure|entertainment|travel|hotels?|airlines?|airport|accommodation|mileage|tickets|stadiums|museums|cinema|theater|concerts|bars?|culture|lottery|gambling|bet)\M' then array['lazer']
             when b ~ '\m(shopping|clothing|electronics|department stores?|retail|marketplace|pet supplies|kids|toys|sports goods|office supplies)\M' then array['compras']
             when b ~ '\m(bank fees|account fees|atm fees|credit card fees|taxes|tax|insurance|donations|alimony|late payment|interests charged)\M' then array['taxas', 'impostos', 'outros']
           end as nomes
      from (
        select t.id, t.tipo, trim(regexp_replace(lower(coalesce(t.categoria_banco, '')), '[^a-z]+', ' ', 'g')) as b
          from public.fin_transacoes t
         where t.user_id = v_user
           and t.tipo <> 'transferencia'
           and (t.categoria_id is null or t.categoria_origem = 'banco')
           and t.categoria_banco is not null
      ) t
  )
  update public.fin_transacoes t
     set categoria_id = escolha.categoria_id, categoria_origem = 'banco'
    from (
      select distinct on (p.id) p.id, c.id as categoria_id
        from pista p
        join public.fin_categorias c
          on c.user_id = v_user
         and not c.arquivada
         and c.tipo = case p.tipo when 'entrada' then 'receita' else 'despesa' end
         and public.fin_normalizar(c.nome) = any (p.nomes)
       order by p.id, array_position(p.nomes, public.fin_normalizar(c.nome))
    ) escolha
   where t.id = escolha.id
     and t.categoria_id is distinct from escolha.categoria_id;
  get diagnostics v_banco = row_count;

  return v_regras + v_banco;
end;
$$;

revoke execute on function public.fin_aplicar_regras(uuid) from public, anon;
grant execute on function public.fin_aplicar_regras(uuid) to authenticated, service_role;

-- Reaplica para quem já usa o Financeiro (só muda o que está sem categoria ou veio do banco).
select public.fin_aplicar_regras(a.user_id) from public.contas_app a where a.funcoes @> array['financeiro'];
