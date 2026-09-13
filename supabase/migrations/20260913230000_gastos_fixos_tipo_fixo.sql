-- Revisão da fase 3 (2026-09-13): refazer parcelas não pode apagar pagamentos.
-- - O tipo de um gasto fixo não muda depois de criado (como o tipo das categorias). Antes, só a
--   tela impedia: trocar uma assinatura para parcelada pela API e gerar as parcelas apagaria os
--   pagamentos já feitos.
-- - fin_gerar_parcelas só mexe em lançamentos que são parcelas (parcela preenchida).

create function public.fin_recorrencias_tipo_fixo()
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

revoke execute on function public.fin_recorrencias_tipo_fixo() from public, anon, authenticated;

create trigger fin_recorrencias_tipo_fixo before update on public.fin_recorrencias
  for each row execute function public.fin_recorrencias_tipo_fixo();

create or replace function public.fin_gerar_parcelas(p_recorrencia uuid)
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

  -- Só parcelas: as futuras saem para serem refeitas, e as que não fazem mais parte do plano
  -- (menos parcelas, outra data de início) também.
  delete from public.fin_transacoes t
   where t.recorrencia_id = r.id
     and t.parcela is not null
     and (
       t.data > v_hoje
       or t.parcela > r.parcelas
       or t.referencia <> (r.inicio + make_interval(months => t.parcela - 1))::date
     );

  update public.fin_transacoes t
     set descricao = format('%s (%s/%s)', r.nome, t.parcela, r.parcelas),
         categoria_id = r.categoria_id
   where t.recorrencia_id = r.id
     and t.parcela is not null;

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
