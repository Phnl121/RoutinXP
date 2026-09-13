-- Controle financeiro, fase 5: categorização por regras, sem IA (pedido do usuário, 2026-09-14).
-- - Regra: "descrição contém X → categoria Y", com tipo e conta opcionais e prioridade.
-- - Dicionário inicial de estabelecimentos comuns no Brasil, criado com as categorias da pessoa.
-- - A categoria que o banco manda (campo category da Pluggy, em inglês) serve de pista quando
--   nenhuma regra reconhece o lançamento.
-- - A categoria escolhida pela pessoa nunca é trocada por regra (categoria_origem = 'manual').

-- ---------------------------------------------------------------------------
-- De onde veio a categoria de cada lançamento
-- ---------------------------------------------------------------------------
alter table public.fin_transacoes
  -- manual: a pessoa escolheu; regra: uma regra aplicou; banco: pista da categoria do banco.
  add column categoria_origem text check (categoria_origem in ('manual', 'regra', 'banco')),
  -- Categoria que o banco informou (Pluggy), guardada como veio.
  add column categoria_banco  text check (categoria_banco is null or char_length(categoria_banco) <= 120);

-- O que já tinha categoria até aqui foi escolhido à mão.
update public.fin_transacoes set categoria_origem = 'manual' where categoria_id is not null;

-- ---------------------------------------------------------------------------
-- Regras
-- ---------------------------------------------------------------------------
create table public.fin_regras (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Trecho procurado na descrição (sem diferença de maiúsculas e acentos).
  termo        text not null check (char_length(trim(termo)) between 2 and 60),
  categoria_id uuid not null,
  -- Só para entradas ou só para saídas (nulo: qualquer uma que combine com a categoria).
  tipo         text check (tipo in ('entrada', 'saida')),
  -- Só lançamentos desta conta (nulo: todas).
  conta_id     uuid,
  prioridade   int not null default 0,
  -- sugerida: veio do dicionário inicial; usuario: criada ou editada pela pessoa.
  origem       text not null default 'usuario' check (origem in ('usuario', 'sugerida')),
  created_at   timestamptz not null default now(),
  foreign key (categoria_id, user_id) references public.fin_categorias (id, user_id) on delete cascade,
  foreign key (conta_id, user_id) references public.fin_contas (id, user_id) on delete cascade
);

create index fin_regras_user_idx on public.fin_regras (user_id, prioridade desc);
create unique index fin_regras_termo_unico on public.fin_regras (user_id, lower(trim(termo)), coalesce(tipo, ''), coalesce(conta_id::text, ''));

alter table public.fin_regras enable row level security;

create policy "fin_regras: own" on public.fin_regras for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "fin_regras: funcao" on public.fin_regras as restrictive for all to authenticated
  using ((select public.tem_funcao('financeiro'))) with check ((select public.tem_funcao('financeiro')));

revoke all on public.fin_regras from anon;

create trigger fin_regras_limite before insert on public.fin_regras
  for each row execute function public.limitar_linhas_por_usuario('500');

-- ---------------------------------------------------------------------------
-- Comparação sem maiúsculas, acentos e símbolos
-- ---------------------------------------------------------------------------
create function public.fin_normalizar(p_texto text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select regexp_replace(
    translate(lower(coalesce(p_texto, '')), 'áàâãäéèêëíìîïóòôõöúùûüçñ', 'aaaaaeeeeiiiiooooouuuucn'),
    '[^a-z0-9]+', ' ', 'g'
  );
$$;

-- Normalizados uma vez só (colunas geradas): aplicar as regras não refaz a expressão regular
-- em cada par regra × lançamento. Com espaço nas pontas, para comparar palavras inteiras.
alter table public.fin_transacoes
  add column descricao_normalizada text generated always as (' ' || trim(public.fin_normalizar(descricao)) || ' ') stored;
alter table public.fin_regras
  add column termo_normalizado text generated always as (' ' || trim(public.fin_normalizar(termo)) || ' ') stored;

-- Preferências do Financeiro por pessoa (o dicionário inicial é criado uma vez só).
create table public.fin_preferencias (
  user_id            uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  regras_preparadas  boolean not null default false,
  updated_at         timestamptz not null default now()
);

alter table public.fin_preferencias enable row level security;

create policy "fin_preferencias: own" on public.fin_preferencias for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "fin_preferencias: funcao" on public.fin_preferencias as restrictive for all to authenticated
  using ((select public.tem_funcao('financeiro'))) with check ((select public.tem_funcao('financeiro')));

revoke all on public.fin_preferencias from anon;

-- ---------------------------------------------------------------------------
-- Aplicar as regras
-- ---------------------------------------------------------------------------
-- Categoriza os lançamentos de entrada e saída que estão sem categoria ou que foram
-- categorizados por regra ou pista do banco (a escolha manual nunca muda):
-- 1. a regra que combina, pela prioridade e depois pelo termo mais longo;
-- 2. sem regra, a pista da categoria do banco, convertida para uma categoria da pessoa.
-- Roda com as permissões de quem chama. A Edge Function (chave de serviço) informa p_user.
-- Devolve quantos lançamentos mudaram de categoria.
create function public.fin_aplicar_regras(p_user uuid default null)
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

  -- Pista do banco: palavras da categoria da Pluggy apontam para o nome de uma categoria.
  with pista as (
    select t.id,
           case
             -- \m e \M: palavra inteira ("rent" não pega "rental" nem "current").
             when t.tipo = 'entrada' and b ~ '\m(salary|payroll|wages?)\M' then 'salario'
             when t.tipo = 'entrada' then null
             when b ~ '\m(streaming|subscriptions?|digital services?|software)\M' then 'assinaturas'
             when b ~ '\m(food|groceries|grocery|supermarkets?|eating out|restaurants?|bakery|food delivery)\M' then 'alimentacao'
             when b ~ '\m(transportation|transport|taxi|ride hailing|gas stations?|fuel|parking|tolls?|public transportation)\M' then 'transporte'
             when b ~ '\m(health|healthcare|pharmacy|pharmacies|drugstore|medical|dentist|dental|hospital|clinics?|health insurance)\M' then 'saude'
             when b ~ '\m(education|schools?|university|courses?|books?|bookstore)\M' then 'educacao'
             when b ~ '\m(rent|housing|utilities|electricity|water|internet|telecommunications|telecom|mobile phone|condominium)\M' then 'moradia'
             when b ~ '\m(leisure|entertainment|travel|hotels?|airlines?|sports?|gyms?|bars?|culture)\M' then 'lazer'
             when b ~ '\m(shopping|clothing|electronics|department stores?|retail|marketplace|online shopping)\M' then 'compras'
           end as nome
      from (
        select t.id, t.tipo, lower(coalesce(t.categoria_banco, '')) as b
          from public.fin_transacoes t
         where t.user_id = v_user
           and t.tipo <> 'transferencia'
           and (t.categoria_id is null or t.categoria_origem = 'banco')
           and t.categoria_banco is not null
      ) t
  )
  update public.fin_transacoes t
     set categoria_id = c.id, categoria_origem = 'banco'
    from pista
    join public.fin_categorias c
      on c.user_id = v_user
     and not c.arquivada
     and public.fin_normalizar(c.nome) = pista.nome
   where t.id = pista.id
     and pista.nome is not null
     and c.tipo = case t.tipo when 'entrada' then 'receita' else 'despesa' end;
  get diagnostics v_banco = row_count;

  return v_regras + v_banco;
end;
$$;

revoke execute on function public.fin_aplicar_regras(uuid) from public, anon;
grant execute on function public.fin_aplicar_regras(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Dicionário inicial
-- ---------------------------------------------------------------------------
-- Cria as regras sugeridas para as categorias da pessoa (pelo nome). Não faz nada se ela já
-- tiver alguma regra. Devolve quantas regras criou.
create function public.fin_preparar_regras()
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_total integer;
begin
  if not public.tem_funcao('financeiro') then
    raise exception 'sem_acesso' using errcode = '42501';
  end if;
  if exists (select 1 from public.fin_preferencias where user_id = auth.uid() and regras_preparadas)
     or exists (select 1 from public.fin_regras where user_id = auth.uid()) then
    return 0;
  end if;

  insert into public.fin_regras (termo, categoria_id, tipo, origem)
  select d.termo, c.id, d.tipo, 'sugerida'
    from (values
      -- Alimentação
      ('ifood', 'alimentacao', 'saida'), ('rappi', 'alimentacao', 'saida'), ('ze delivery', 'alimentacao', 'saida'),
      ('mcdonald s', 'alimentacao', 'saida'), ('burger king', 'alimentacao', 'saida'), ('subway', 'alimentacao', 'saida'),
      ('padaria', 'alimentacao', 'saida'), ('restaurante', 'alimentacao', 'saida'), ('lanchonete', 'alimentacao', 'saida'),
      ('supermercado', 'alimentacao', 'saida'), ('mercadinho', 'alimentacao', 'saida'), ('atacadao', 'alimentacao', 'saida'),
      ('assai', 'alimentacao', 'saida'), ('carrefour', 'alimentacao', 'saida'), ('pao de acucar', 'alimentacao', 'saida'),
      ('uber eats', 'alimentacao', 'saida'), ('hortifruti', 'alimentacao', 'saida'), ('acougue', 'alimentacao', 'saida'),
      -- Transporte
      ('uber', 'transporte', 'saida'), ('99app', 'transporte', 'saida'), ('99pop', 'transporte', 'saida'),
      ('cabify', 'transporte', 'saida'), ('posto', 'transporte', 'saida'), ('shell', 'transporte', 'saida'),
      ('ipiranga', 'transporte', 'saida'), ('petrobras', 'transporte', 'saida'), ('estacionamento', 'transporte', 'saida'),
      ('sem parar', 'transporte', 'saida'), ('conectcar', 'transporte', 'saida'), ('metro', 'transporte', 'saida'),
      -- Assinaturas
      ('netflix', 'assinaturas', 'saida'), ('spotify', 'assinaturas', 'saida'), ('amazon prime', 'assinaturas', 'saida'),
      ('prime video', 'assinaturas', 'saida'), ('disney', 'assinaturas', 'saida'), ('hbo', 'assinaturas', 'saida'),
      ('hbomax', 'assinaturas', 'saida'), ('globoplay', 'assinaturas', 'saida'), ('youtube', 'assinaturas', 'saida'),
      ('apple com bill', 'assinaturas', 'saida'), ('icloud', 'assinaturas', 'saida'), ('google one', 'assinaturas', 'saida'),
      ('deezer', 'assinaturas', 'saida'), ('chatgpt', 'assinaturas', 'saida'), ('openai', 'assinaturas', 'saida'),
      ('claude ai', 'assinaturas', 'saida'), ('anthropic', 'assinaturas', 'saida'), ('microsoft', 'assinaturas', 'saida'),
      -- Saúde
      ('drogasil', 'saude', 'saida'), ('droga raia', 'saude', 'saida'), ('drogaria', 'saude', 'saida'),
      ('farmacia', 'saude', 'saida'), ('pague menos', 'saude', 'saida'), ('panvel', 'saude', 'saida'),
      ('unimed', 'saude', 'saida'), ('hapvida', 'saude', 'saida'), ('laboratorio', 'saude', 'saida'),
      ('smart fit', 'saude', 'saida'), ('academia', 'saude', 'saida'),
      -- Moradia
      ('aluguel', 'moradia', 'saida'), ('condominio', 'moradia', 'saida'), ('enel', 'moradia', 'saida'),
      ('cemig', 'moradia', 'saida'), ('light servicos', 'moradia', 'saida'), ('sabesp', 'moradia', 'saida'),
      ('copasa', 'moradia', 'saida'), ('vivo fibra', 'moradia', 'saida'), ('telefonica', 'moradia', 'saida'), ('claro', 'moradia', 'saida'),
      ('tim', 'moradia', 'saida'), ('oi fibra', 'moradia', 'saida'), ('comgas', 'moradia', 'saida'),
      -- Compras
      ('mercadolivre', 'compras', 'saida'), ('mercado livre', 'compras', 'saida'), ('amazon', 'compras', 'saida'),
      ('shopee', 'compras', 'saida'), ('aliexpress', 'compras', 'saida'), ('magalu', 'compras', 'saida'),
      ('magazine luiza', 'compras', 'saida'), ('americanas', 'compras', 'saida'), ('shein', 'compras', 'saida'),
      ('renner', 'compras', 'saida'), ('riachuelo', 'compras', 'saida'), ('cea modas', 'compras', 'saida'),
      ('kabum', 'compras', 'saida'), ('casas bahia', 'compras', 'saida'), ('leroy merlin', 'compras', 'saida'),
      -- Lazer
      ('cinema', 'lazer', 'saida'), ('cinemark', 'lazer', 'saida'), ('ingresso', 'lazer', 'saida'),
      ('sympla', 'lazer', 'saida'), ('steam', 'lazer', 'saida'), ('playstation', 'lazer', 'saida'),
      ('airbnb', 'lazer', 'saida'), ('booking', 'lazer', 'saida'), ('decolar', 'lazer', 'saida'),
      ('latam', 'lazer', 'saida'), ('gol linhas', 'lazer', 'saida'), ('azul linhas', 'lazer', 'saida'),
      -- Educação
      ('udemy', 'educacao', 'saida'), ('alura', 'educacao', 'saida'), ('coursera', 'educacao', 'saida'),
      ('faculdade', 'educacao', 'saida'), ('universidade', 'educacao', 'saida'), ('livraria', 'educacao', 'saida'),
      -- Receitas
      ('salario', 'salario', 'entrada'), ('pagamento de salario', 'salario', 'entrada'), ('folha', 'salario', 'entrada')
    ) as d (termo, categoria, tipo)
    join public.fin_categorias c
      on c.user_id = auth.uid()
     and not c.arquivada
     and public.fin_normalizar(c.nome) = d.categoria
     and c.tipo = case d.tipo when 'entrada' then 'receita' else 'despesa' end
  on conflict do nothing;
  get diagnostics v_total = row_count;
  -- Marcado mesmo sem criar nenhuma: excluir o dicionário não o traz de volta.
  insert into public.fin_preferencias (regras_preparadas) values (true)
  on conflict (user_id) do update set regras_preparadas = true, updated_at = now();
  return v_total;
end;
$$;

revoke execute on function public.fin_preparar_regras() from public, anon;
grant execute on function public.fin_preparar_regras() to authenticated;

-- ---------------------------------------------------------------------------
-- Juntar duplicata: a categoria do manual (escolhida pela pessoa) vence a da regra
-- ---------------------------------------------------------------------------
create or replace function public.fin_resolver_duplicata(p_banco uuid, p_juntar boolean)
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
    delete from public.fin_transacoes where id = m.id;
    update public.fin_transacoes
       set duplicata_de = null,
           categoria_id = coalesce(m.categoria_id, b.categoria_id),
           categoria_origem = case when m.categoria_id is not null then 'manual' else b.categoria_origem end,
           recorrencia_id = coalesce(b.recorrencia_id, m.recorrencia_id),
           referencia = coalesce(b.referencia, m.referencia),
           parcela = coalesce(b.parcela, m.parcela)
     where id = b.id;
  else
    update public.fin_transacoes set duplicata_de = null where id = b.id;
  end if;
end;
$$;
