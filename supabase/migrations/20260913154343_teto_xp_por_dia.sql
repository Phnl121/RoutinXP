-- Auditoria de segurança (2026-09-13): o teto de 150 XP por dia era somado a partir das tarefas
-- concluídas hoje. Como o usuário pode excluir as próprias tarefas, excluir as concluídas zerava
-- a soma e liberava mais XP no mesmo dia. Agora o XP ganho no dia fica em user_stats, que o
-- navegador não altera, e excluir tarefa não devolve espaço no teto.

alter table public.user_stats
  add column xp_dia date,
  add column xp_dia_total int not null default 0 check (xp_dia_total >= 0);

-- Ponto de partida: o XP das tarefas concluídas hoje que ainda existem.
with hoje as (select (now() at time zone 'America/Sao_Paulo')::date as d),
ganhos as (
  select t.user_id, sum(t.xp_value)::int as total
    from public.tasks t, hoje
   where t.status = 'concluida'
     and (t.completed_at at time zone 'America/Sao_Paulo')::date = hoje.d
   group by t.user_id
)
update public.user_stats s
   set xp_dia = hoje.d, xp_dia_total = ganhos.total
  from ganhos, hoje
 where s.user_id = ganhos.user_id;

-- Reforço: user_stats só é gravado pelas funções do servidor (a RLS já não tinha política de escrita).
revoke insert, update, delete on public.user_stats from anon, authenticated;

create or replace function public.concluir_tarefa(p_task_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid     uuid := auth.uid();
  v_hoje    date := (now() at time zone 'America/Sao_Paulo')::date;
  v_teto    constant int := 150;
  v_tarefa  public.tasks%rowtype;
  v_stats   public.user_stats%rowtype;
  v_xp      int;
  v_motivo  text;
  v_xp_hoje int;
  v_streak  int;
begin
  if v_uid is null then
    raise exception 'nao_autenticado' using errcode = '42501';
  end if;

  -- Trava as estatísticas do usuário: conclusões simultâneas entram em fila,
  -- e o teto diário não estoura por corrida.
  insert into public.user_stats (user_id) values (v_uid) on conflict (user_id) do nothing;
  select * into v_stats from public.user_stats where user_id = v_uid for update;

  select * into v_tarefa
    from public.tasks
   where id = p_task_id and user_id = v_uid
   for update;
  if not found then
    raise exception 'tarefa_nao_encontrada' using errcode = 'P0002';
  end if;
  if v_tarefa.status = 'concluida' then
    raise exception 'tarefa_ja_concluida' using errcode = 'P0001';
  end if;

  -- XP já ganho hoje, guardado em user_stats (não muda quando uma tarefa é excluída).
  v_xp_hoje := case when v_stats.xp_dia = v_hoje then v_stats.xp_dia_total else 0 end;

  -- XP
  if now() - v_tarefa.created_at < interval '5 minutes' then
    v_xp := 0;
    v_motivo := 'recem_criada';
  else
    if v_tarefa.data_prevista is not null and v_hoje <= v_tarefa.data_prevista then
      v_xp := 15;
      v_motivo := 'no_prazo';
    else
      v_xp := 10;
      v_motivo := 'base';
    end if;

    if v_xp_hoje + v_xp > v_teto then
      v_xp := greatest(v_teto - v_xp_hoje, 0);
      v_motivo := case when v_xp = 0 then 'teto' else 'teto_parcial' end;
    end if;
  end if;

  update public.tasks
     set status = 'concluida', completed_at = now(), xp_value = v_xp
   where id = p_task_id
  returning * into v_tarefa;

  -- Streak: tarefa recém-criada (anti-farm) não conta, para não dar para manter
  -- a sequência criando e concluindo qualquer coisa na hora.
  if v_motivo = 'recem_criada' then
    update public.user_stats
       set xp_total = xp_total + v_xp,
           xp_dia = v_hoje,
           xp_dia_total = v_xp_hoje + v_xp
     where user_id = v_uid
    returning * into v_stats;
  else
    if v_stats.ultima_data_conclusao = v_hoje then
      v_streak := greatest(v_stats.streak_atual, 1);
    elsif v_stats.ultima_data_conclusao = v_hoje - 1 then
      v_streak := v_stats.streak_atual + 1;
    else
      v_streak := 1;
    end if;

    update public.user_stats
       set xp_total = xp_total + v_xp,
           xp_dia = v_hoje,
           xp_dia_total = v_xp_hoje + v_xp,
           streak_atual = v_streak,
           streak_recorde = greatest(streak_recorde, v_streak),
           ultima_data_conclusao = v_hoje
     where user_id = v_uid
    returning * into v_stats;
  end if;

  return jsonb_build_object(
    'tarefa', to_jsonb(v_tarefa),
    'xp_ganho', v_xp,
    'motivo', v_motivo,
    'estatisticas', public.minhas_estatisticas()
  );
end;
$$;

-- xp_hoje passa a vir de user_stats, igual ao que concluir_tarefa usa no teto.
create or replace function public.minhas_estatisticas()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with hoje as (select (now() at time zone 'America/Sao_Paulo')::date as d)
  select jsonb_build_object(
    'xp_total', s.xp_total,
    'streak_atual', case when s.ultima_data_conclusao >= hoje.d - 1 then s.streak_atual else 0 end,
    'streak_recorde', s.streak_recorde,
    'ultima_data_conclusao', s.ultima_data_conclusao,
    'xp_hoje', case when s.xp_dia = hoje.d then s.xp_dia_total else 0 end,
    'teto_diario', 150
  )
  from public.user_stats s, hoje
  where s.user_id = auth.uid();
$$;

revoke all on function public.concluir_tarefa(uuid) from public, anon;
grant execute on function public.concluir_tarefa(uuid) to authenticated;
revoke all on function public.minhas_estatisticas() from public, anon;
grant execute on function public.minhas_estatisticas() to authenticated;
