-- Passo 10: XP e streak calculados no servidor.
-- Regras (PRODUCT.md): 10 XP de base, +5 se concluída até a data prevista,
-- 0 XP se concluída menos de 5 minutos depois de criada, teto de 150 XP por dia.
-- O "dia" é sempre o horário de Brasília (America/Sao_Paulo).

-- ---------------------------------------------------------------------------
-- xp_value passa a guardar o XP realmente ganho (pode ser 0)
-- ---------------------------------------------------------------------------
alter table public.tasks drop constraint if exists tasks_xp_value_check;
alter table public.tasks add constraint tasks_xp_value_check check (xp_value >= 0);
alter table public.tasks alter column xp_value set default 0;

-- Tarefas concluídas antes do passo 10 nunca somaram XP: zeradas (decisão do usuário).
update public.tasks set xp_value = 0 where status = 'concluida';
update public.tasks set xp_value = 0 where status = 'pendente';

-- ---------------------------------------------------------------------------
-- O navegador só edita título, categoria e data. Status, conclusão e XP
-- mudam apenas pela função concluir_tarefa (RLS continua valendo por cima).
-- ---------------------------------------------------------------------------
revoke insert, update on public.tasks from anon, authenticated;
grant insert (titulo, category_id, data_prevista) on public.tasks to authenticated;
grant update (titulo, category_id, data_prevista) on public.tasks to authenticated;

-- ---------------------------------------------------------------------------
-- concluir_tarefa: conclui uma tarefa pendente do próprio usuário e calcula XP/streak
-- ---------------------------------------------------------------------------
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

    select coalesce(sum(xp_value), 0) into v_xp_hoje
      from public.tasks
     where user_id = v_uid
       and status = 'concluida'
       and (completed_at at time zone 'America/Sao_Paulo')::date = v_hoje;

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
    v_streak := v_stats.streak_atual;
    update public.user_stats set xp_total = xp_total + v_xp where user_id = v_uid
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

-- ---------------------------------------------------------------------------
-- minhas_estatisticas: XP e streak como a tela deve mostrar.
-- O streak aparece zerado se passou um dia inteiro sem conclusão, mesmo antes
-- da próxima conclusão atualizar a linha.
-- ---------------------------------------------------------------------------
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
    'xp_hoje', coalesce((
      select sum(t.xp_value)
        from public.tasks t
       where t.user_id = s.user_id
         and t.status = 'concluida'
         and (t.completed_at at time zone 'America/Sao_Paulo')::date = hoje.d
    ), 0),
    'teto_diario', 150
  )
  from public.user_stats s, hoje
  where s.user_id = auth.uid();
$$;

revoke all on function public.concluir_tarefa(uuid) from public, anon;
grant execute on function public.concluir_tarefa(uuid) to authenticated;

revoke all on function public.minhas_estatisticas() from public, anon;
grant execute on function public.minhas_estatisticas() to authenticated;
