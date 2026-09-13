-- Controle financeiro, fase 3: gastos fixos (pedido do usuário, 2026-09-13).
-- Uma página própria, "Gastos fixos", para assinaturas, compras parceladas, contas fixas
-- (luz, internet, aluguel) e outros gastos que se repetem.
-- - Assinatura, conta e outro: a cobrança de cada período vira lançamento quando a pessoa marca
--   como paga (o valor pode variar, como a conta de luz). O vínculo fica em
--   fin_transacoes.recorrencia_id + referencia (o dia da cobrança), sem duplicar.
-- - Parcelada: as parcelas são criadas de uma vez como saídas com a data de cada mês
--   (fin_gerar_parcelas). Lançamento com data futura não mexe no saldo até o dia chegar.

-- ---------------------------------------------------------------------------
-- Gastos fixos
-- ---------------------------------------------------------------------------
create table public.fin_recorrencias (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome            text not null check (char_length(trim(nome)) between 1 and 60),
  tipo            text not null check (tipo in ('assinatura', 'parcelada', 'conta', 'outro')),
  -- Valor de cada cobrança (na parcelada, o valor da parcela).
  valor_centavos  bigint not null check (valor_centavos between 1 and 100000000000),
  -- Valor aproximado (conta de luz): ao marcar como paga, a pessoa confirma o valor real.
  valor_variavel  boolean not null default false,
  frequencia      text not null default 'mensal' check (frequencia in ('mensal', 'anual', 'semanal')),
  -- Primeira cobrança. Dá o dia do mês (mensal, parcelada), o dia e o mês (anual) ou o dia da
  -- semana (semanal) das próximas.
  inicio          date not null,
  -- Última cobrança possível (assinatura cancelada no fim do ano, por exemplo).
  fim             date,
  parcelas        smallint check (parcelas between 2 and 72),
  conta_id        uuid not null,
  categoria_id    uuid,
  -- Pausada: não cobra nem entra no comprometido, mas continua cadastrada.
  ativa           boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (id, user_id),
  foreign key (conta_id, user_id) references public.fin_contas (id, user_id) on delete no action,
  foreign key (categoria_id, user_id) references public.fin_categorias (id, user_id) on delete set null (categoria_id),
  check ((tipo = 'parcelada') = (parcelas is not null)),
  check (tipo <> 'parcelada' or frequencia = 'mensal'),
  check (fim is null or fim >= inicio)
);

create index fin_recorrencias_user_idx on public.fin_recorrencias (user_id, tipo);
create index fin_recorrencias_conta_idx on public.fin_recorrencias (conta_id);
create index fin_recorrencias_categoria_idx on public.fin_recorrencias (categoria_id) where categoria_id is not null;

-- A categoria do gasto fixo é sempre de despesa; updated_at acompanha as edições.
create function public.fin_recorrencias_conferir()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.categoria_id is not null and not exists (
    select 1 from public.fin_categorias c
     where c.id = new.categoria_id and c.user_id = new.user_id and c.tipo = 'despesa'
  ) then
    raise exception 'categoria_incompativel' using errcode = '23514';
  end if;
  if tg_op = 'UPDATE' then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

revoke execute on function public.fin_recorrencias_conferir() from public, anon, authenticated;

create trigger fin_recorrencias_conferir before insert or update on public.fin_recorrencias
  for each row execute function public.fin_recorrencias_conferir();

alter table public.fin_recorrencias enable row level security;

create policy "fin_recorrencias: own" on public.fin_recorrencias for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "fin_recorrencias: funcao" on public.fin_recorrencias as restrictive for all to authenticated
  using ((select public.tem_funcao('financeiro'))) with check ((select public.tem_funcao('financeiro')));

revoke all on public.fin_recorrencias from anon;

create trigger fin_recorrencias_limite before insert on public.fin_recorrencias
  for each row execute function public.limitar_linhas_por_usuario('300');

-- ---------------------------------------------------------------------------
-- Lançamentos ligados a um gasto fixo
-- ---------------------------------------------------------------------------
alter table public.fin_transacoes
  add column recorrencia_id uuid,
  -- Dia da cobrança a que o lançamento corresponde (pode diferir da data em que foi pago).
  add column referencia     date,
  -- Número da parcela (só compras parceladas).
  add column parcela        smallint check (parcela between 1 and 72),
  -- Excluir o gasto fixo mantém os lançamentos já feitos, só sem o vínculo.
  add foreign key (recorrencia_id, user_id)
    references public.fin_recorrencias (id, user_id) on delete set null (recorrencia_id),
  add check (recorrencia_id is null or referencia is not null);

create unique index fin_transacoes_cobranca_unica on public.fin_transacoes (recorrencia_id, referencia)
  where recorrencia_id is not null;

-- ---------------------------------------------------------------------------
-- Parcelas de uma compra parcelada
-- ---------------------------------------------------------------------------
-- Cria ou refaz as parcelas depois de salvar a compra: uma saída por mês, a partir de `inicio`
-- (no dia 31, meses curtos caem no último dia). Parcelas com data já passada só atualizam o
-- nome e a categoria; as futuras seguem valor, conta e datas atuais. Roda com as permissões de
-- quem chama (RLS vale). Devolve quantas parcelas existem.
create function public.fin_gerar_parcelas(p_recorrencia uuid)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  r public.fin_recorrencias;
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  select * into r from public.fin_recorrencias where id = p_recorrencia;
  if not found or r.tipo <> 'parcelada' then
    raise exception 'recorrencia_invalida' using errcode = '22023';
  end if;

  -- Parcelas futuras saem para serem refeitas; as que não fazem mais parte do plano (menos
  -- parcelas, outra data de início) também.
  delete from public.fin_transacoes t
   where t.recorrencia_id = r.id
     and (
       t.data > v_hoje
       or t.parcela is null
       or t.parcela > r.parcelas
       or t.referencia <> (r.inicio + make_interval(months => t.parcela - 1))::date
     );

  update public.fin_transacoes t
     set descricao = format('%s (%s/%s)', r.nome, t.parcela, r.parcelas),
         categoria_id = r.categoria_id
   where t.recorrencia_id = r.id;

  insert into public.fin_transacoes
    (tipo, valor_centavos, data, descricao, conta_id, categoria_id, recorrencia_id, referencia, parcela)
  select 'saida', r.valor_centavos, p.dia, format('%s (%s/%s)', r.nome, p.n, r.parcelas),
         r.conta_id, r.categoria_id, r.id, p.dia, p.n
    from (
      select n, (r.inicio + make_interval(months => n - 1))::date as dia
        from generate_series(1, r.parcelas) as n
    ) p
   where not exists (
     select 1 from public.fin_transacoes t where t.recorrencia_id = r.id and t.referencia = p.dia
   );

  return r.parcelas;
end;
$$;

revoke execute on function public.fin_gerar_parcelas(uuid) from public, anon;
grant execute on function public.fin_gerar_parcelas(uuid) to authenticated;
