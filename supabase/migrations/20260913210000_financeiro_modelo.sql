-- Controle financeiro, fase 0.3: modelo de dados (pedido do usuário, 2026-09-13).
-- - Contas (corrente, poupança, cartão, dinheiro), categorias financeiras (separadas das
--   categorias de tarefas) e transações (entrada, saída ou transferência entre contas próprias).
-- - Valores em centavos (bigint): sem erro de arredondamento.
-- - Cada linha é do próprio usuário e, além disso, só responde para contas com a função
--   Financeiro liberada no painel e sessão verificada (tem_funcao, do painel de administração).
-- - Limites de linhas no mesmo padrão da auditoria de segurança.

-- ---------------------------------------------------------------------------
-- Contas
-- ---------------------------------------------------------------------------
create table public.fin_contas (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome                   text not null check (char_length(trim(nome)) between 1 and 60),
  tipo                   text not null check (tipo in ('corrente', 'poupanca', 'cartao', 'dinheiro')),
  cor                    text check (cor is null or cor ~ '^#[0-9A-Fa-f]{6}$'),
  -- Saldo a partir do dia saldo_inicial_em. No cartão, a fatura em aberto (negativa).
  saldo_inicial_centavos bigint not null default 0 check (abs(saldo_inicial_centavos) <= 100000000000),
  -- Lançamentos com data anterior (um mês passado registrado depois) não mexem no saldo.
  saldo_inicial_em       date not null default (now() at time zone 'America/Sao_Paulo')::date,
  -- Só cartão: dia em que a fatura fecha e dia em que vence.
  dia_fechamento         smallint check (dia_fechamento between 1 and 31),
  dia_vencimento         smallint check (dia_vencimento between 1 and 31),
  -- Arquivada some das listas e dos seletores, mas as transações antigas continuam.
  arquivada              boolean not null default false,
  posicao                int not null default 0,
  created_at             timestamptz not null default now(),
  unique (id, user_id),
  check (tipo = 'cartao' or (dia_fechamento is null and dia_vencimento is null))
);

create index fin_contas_user_idx on public.fin_contas (user_id, posicao);

-- ---------------------------------------------------------------------------
-- Categorias financeiras
-- ---------------------------------------------------------------------------
create table public.fin_categorias (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome       text not null check (char_length(trim(nome)) between 1 and 40),
  cor        text not null check (cor ~ '^#[0-9A-Fa-f]{6}$'),
  tipo       text not null check (tipo in ('receita', 'despesa')),
  -- Linha da DRE pessoal onde a despesa entra. Receitas não têm grupo.
  grupo      text check (grupo in ('fixa', 'variavel', 'assinatura')),
  arquivada  boolean not null default false,
  posicao    int not null default 0,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  check ((tipo = 'despesa') = (grupo is not null))
);

create index fin_categorias_user_idx on public.fin_categorias (user_id, tipo, posicao);
create unique index fin_categorias_nome_unico on public.fin_categorias (user_id, tipo, lower(trim(nome)));

-- ---------------------------------------------------------------------------
-- Transações
-- ---------------------------------------------------------------------------
create table public.fin_transacoes (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tipo             text not null check (tipo in ('entrada', 'saida', 'transferencia')),
  -- Sempre positivo: o tipo diz se entra ou sai.
  valor_centavos   bigint not null check (valor_centavos between 1 and 100000000000),
  data             date not null default (now() at time zone 'America/Sao_Paulo')::date,
  descricao        text not null check (char_length(trim(descricao)) between 1 and 200),
  conta_id         uuid not null,
  -- Só transferência: a conta que recebe.
  conta_destino_id uuid,
  -- Só entrada e saída. Sem categoria = "a revisar" (as importadas da fase 4 chegam assim).
  categoria_id     uuid,
  origem           text not null default 'manual' check (origem in ('manual', 'banco')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- NO ACTION (e não RESTRICT): a conferência fica para o fim do comando, então excluir o
  -- usuário inteiro (cascata) funciona; excluir só a conta com lançamentos continua recusado.
  foreign key (conta_id, user_id) references public.fin_contas (id, user_id) on delete no action,
  foreign key (conta_destino_id, user_id) references public.fin_contas (id, user_id) on delete no action,
  -- Excluir a categoria deixa as transações "a revisar", sem apagar nada.
  foreign key (categoria_id, user_id) references public.fin_categorias (id, user_id) on delete set null (categoria_id),
  check ((tipo = 'transferencia') = (conta_destino_id is not null)),
  check (tipo <> 'transferencia' or categoria_id is null),
  check (conta_destino_id is null or conta_destino_id <> conta_id)
);

create index fin_transacoes_user_data_idx on public.fin_transacoes (user_id, data desc);
create index fin_transacoes_conta_idx on public.fin_transacoes (conta_id);
create index fin_transacoes_conta_destino_idx on public.fin_transacoes (conta_destino_id) where conta_destino_id is not null;
create index fin_transacoes_categoria_idx on public.fin_transacoes (categoria_id) where categoria_id is not null;

-- Antes de gravar: a categoria combina com o tipo (receita para entrada, despesa para saída)
-- e updated_at acompanha as edições.
create function public.fin_transacoes_conferir()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.categoria_id is not null and not exists (
    select 1 from public.fin_categorias c
     where c.id = new.categoria_id
       and c.user_id = new.user_id
       and c.tipo = case new.tipo when 'entrada' then 'receita' else 'despesa' end
  ) then
    raise exception 'categoria_incompativel' using errcode = '23514';
  end if;
  if tg_op = 'UPDATE' then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

revoke execute on function public.fin_transacoes_conferir() from public, anon, authenticated;

create trigger fin_transacoes_conferir before insert or update on public.fin_transacoes
  for each row execute function public.fin_transacoes_conferir();

-- O tipo de uma categoria (receita ou despesa) não muda depois de criada: as transações dela
-- deixariam de combinar.
create function public.fin_categorias_tipo_fixo()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.tipo is distinct from old.tipo then
    raise exception 'tipo_fixo' using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke execute on function public.fin_categorias_tipo_fixo() from public, anon, authenticated;

create trigger fin_categorias_tipo_fixo before update on public.fin_categorias
  for each row execute function public.fin_categorias_tipo_fixo();

-- ---------------------------------------------------------------------------
-- RLS: dono da linha + função Financeiro liberada (restritiva)
-- ---------------------------------------------------------------------------
alter table public.fin_contas     enable row level security;
alter table public.fin_categorias enable row level security;
alter table public.fin_transacoes enable row level security;

create policy "fin_contas: own" on public.fin_contas for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "fin_categorias: own" on public.fin_categorias for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "fin_transacoes: own" on public.fin_transacoes for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "fin_contas: funcao" on public.fin_contas as restrictive for all to authenticated
  using ((select public.tem_funcao('financeiro'))) with check ((select public.tem_funcao('financeiro')));
create policy "fin_categorias: funcao" on public.fin_categorias as restrictive for all to authenticated
  using ((select public.tem_funcao('financeiro'))) with check ((select public.tem_funcao('financeiro')));
create policy "fin_transacoes: funcao" on public.fin_transacoes as restrictive for all to authenticated
  using ((select public.tem_funcao('financeiro'))) with check ((select public.tem_funcao('financeiro')));

-- Nada para quem não entrou.
revoke all on public.fin_contas, public.fin_categorias, public.fin_transacoes from anon;

-- ---------------------------------------------------------------------------
-- Limites por usuário (acima do uso real)
-- ---------------------------------------------------------------------------
create trigger fin_contas_limite before insert on public.fin_contas
  for each row execute function public.limitar_linhas_por_usuario('50');
create trigger fin_categorias_limite before insert on public.fin_categorias
  for each row execute function public.limitar_linhas_por_usuario('200');
create trigger fin_transacoes_limite before insert on public.fin_transacoes
  for each row execute function public.limitar_linhas_por_usuario('100000');

-- ---------------------------------------------------------------------------
-- Funções chamadas pelo app (rodam com as permissões de quem chama: RLS vale)
-- ---------------------------------------------------------------------------

-- Primeira visita ao Financeiro: cria o conjunto inicial de categorias (editável depois).
-- Não faz nada se a conta já tiver alguma categoria financeira.
create function public.fin_preparar()
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.tem_funcao('financeiro') then
    raise exception 'sem_acesso' using errcode = '42501';
  end if;
  if exists (select 1 from public.fin_categorias where user_id = auth.uid()) then
    return;
  end if;
  insert into public.fin_categorias (nome, cor, tipo, grupo, posicao) values
    ('Moradia',      '#6c9be8', 'despesa', 'fixa',       0),
    ('Alimentação',  '#e0a050', 'despesa', 'variavel',   1),
    ('Transporte',   '#5fc4c0', 'despesa', 'variavel',   2),
    ('Saúde',        '#e27d8f', 'despesa', 'variavel',   3),
    ('Educação',     '#b39ddb', 'despesa', 'fixa',       4),
    ('Lazer',        '#d98a6a', 'despesa', 'variavel',   5),
    ('Compras',      '#c9b37e', 'despesa', 'variavel',   6),
    ('Assinaturas',  '#8f9bb3', 'despesa', 'assinatura', 7),
    ('Outros',       '#8f9bb3', 'despesa', 'variavel',   8),
    ('Salário',      '#6c9be8', 'receita', null,         0),
    ('Freelance',    '#5fc4c0', 'receita', null,         1),
    ('Outros',       '#8f9bb3', 'receita', null,         2)
  -- Duas abas (ou a primeira carga repetida) ao mesmo tempo: a segunda não falha.
  on conflict do nothing;
end;
$$;

revoke execute on function public.fin_preparar() from public, anon;
grant execute on function public.fin_preparar() to authenticated;

-- Saldo de cada conta até hoje (Brasília): saldo inicial + entradas − saídas, com as
-- transferências saindo de uma conta e entrando na outra. Contam os lançamentos de
-- saldo_inicial_em até hoje: os de antes já estavam no saldo inicial, os futuros ainda não.
create function public.fin_saldos()
returns table (conta_id uuid, saldo_centavos bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  with hoje as (select (now() at time zone 'America/Sao_Paulo')::date as dia)
  select c.id,
         c.saldo_inicial_centavos
         + coalesce((
             select sum(case when t.tipo = 'entrada' then t.valor_centavos else -t.valor_centavos end)
               from public.fin_transacoes t, hoje
              where t.conta_id = c.id and t.data between c.saldo_inicial_em and hoje.dia
           ), 0)
         + coalesce((
             select sum(t.valor_centavos)
               from public.fin_transacoes t, hoje
              where t.conta_destino_id = c.id and t.data between c.saldo_inicial_em and hoje.dia
           ), 0)
    from public.fin_contas c
   where c.user_id = auth.uid();
$$;

revoke execute on function public.fin_saldos() from public, anon;
grant execute on function public.fin_saldos() to authenticated;
