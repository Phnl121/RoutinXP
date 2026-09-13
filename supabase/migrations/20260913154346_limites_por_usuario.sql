-- Auditoria de segurança (2026-09-13): as tabelas aceitavam inserções sem limite. Uma conta podia
-- cadastrar milhares de calendários (o servidor lê cada link, o que vira um disparador de
-- requisições e atrasa a sincronização dos outros usuários) ou encher o banco do plano grátis.
-- Os limites ficam bem acima do uso real.

-- Recusa a inserção quando o usuário já tem o número máximo de linhas na tabela.
-- O limite vem do argumento do gatilho; nome da tabela e esquema vêm do próprio Postgres.
create function public.limitar_linhas_por_usuario()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_limite int := TG_ARGV[0]::int;
  v_total  int;
begin
  execute format('select count(*) from %I.%I where user_id = $1', TG_TABLE_SCHEMA, TG_TABLE_NAME)
    into v_total
    using new.user_id;
  if v_total >= v_limite then
    raise exception 'limite_atingido' using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke execute on function public.limitar_linhas_por_usuario() from public, anon, authenticated;

create trigger calendar_sources_limite before insert on public.calendar_sources
  for each row execute function public.limitar_linhas_por_usuario('20');
create trigger categories_limite before insert on public.categories
  for each row execute function public.limitar_linhas_por_usuario('100');
create trigger tags_limite before insert on public.tags
  for each row execute function public.limitar_linhas_por_usuario('200');
create trigger board_columns_limite before insert on public.board_columns
  for each row execute function public.limitar_linhas_por_usuario('30');
create trigger tasks_limite before insert on public.tasks
  for each row execute function public.limitar_linhas_por_usuario('10000');

-- Blocos de foco: a soma das últimas 24 horas não pode passar de 24 horas.
-- Blocos guardados sem internet chegam juntos depois, então não dá para exigir intervalo entre eles.
create function public.limitar_minutos_foco()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_minutos int;
begin
  select coalesce(sum(minutos), 0) into v_minutos
    from public.focus_sessions
   where user_id = new.user_id
     and concluida_em > now() - interval '24 hours';
  if v_minutos + new.minutos > 24 * 60 then
    raise exception 'limite_atingido' using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke execute on function public.limitar_minutos_foco() from public, anon, authenticated;

create trigger focus_sessions_limite before insert on public.focus_sessions
  for each row execute function public.limitar_minutos_foco();
