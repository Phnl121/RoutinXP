-- Painel de administração (pedido do usuário, 2026-09-13).
-- - Cada conta tem um papel (usuario | admin) e a lista de funções liberadas. Tudo é cobrado
--   aqui no banco, não só escondido na tela: sem a função, as tabelas dela não respondem.
-- - Verificação em duas etapas para todos: os dados só saem para sessões verificadas com o
--   código do autenticador (aal2 no token do Supabase).
-- - Senha provisória: contas criadas pelo painel só usam o app depois de trocar a senha.
--   O banco guarda o hash da senha provisória e só libera quando o hash atual for outro.
-- - O painel lê e altera contas por uma Edge Function (admin-usuarios), que usa a chave de
--   administração; o navegador nunca mexe nessas tabelas diretamente.
-- O primeiro administrador é marcado à mão no SQL Editor do Supabase (o e-mail não vai para o
-- repositório, que é público).

-- ---------------------------------------------------------------------------
-- Contas do app
-- ---------------------------------------------------------------------------
create table public.contas_app (
  user_id               uuid primary key references auth.users (id) on delete cascade,
  papel                 text not null default 'usuario' check (papel in ('usuario', 'admin')),
  funcoes               text[] not null default '{}'
                          check (funcoes <@ array['tarefas', 'kanban', 'calendario', 'foco', 'painel', 'integracoes', 'financeiro']::text[]),
  -- Nome que o administrador dá à conta ao criá-la (o perfil completo vem depois, pela pessoa).
  nome_exibicao         text check (nome_exibicao is null or char_length(trim(nome_exibicao)) between 1 and 80),
  -- Hash da senha provisória (cópia de auth.users.encrypted_password). Nulo = já trocou.
  senha_provisoria_hash text,
  criada_por            uuid references auth.users (id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.contas_app enable row level security;
revoke all on public.contas_app from anon, authenticated;

-- Contas que já existem: tudo o que o app tem hoje continua liberado (Financeiro ainda não).
insert into public.contas_app (user_id, funcoes)
select id, array['tarefas', 'kanban', 'calendario', 'foco', 'painel', 'integracoes']
  from auth.users
on conflict (user_id) do nothing;

-- Registro das ações do painel (quem fez o quê e quando). Nunca guarda senhas.
create table public.registro_admin (
  id         bigint generated always as identity primary key,
  admin_id   uuid references auth.users (id) on delete set null,
  alvo_id    uuid,
  alvo_email text,
  acao       text not null check (acao in ('criar', 'funcoes', 'suspender', 'reativar', 'nova_senha', 'remover_autenticador', 'excluir')),
  detalhes   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index registro_admin_data_idx on public.registro_admin (created_at desc);

alter table public.registro_admin enable row level security;
revoke all on public.registro_admin from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Portões (usados pelas políticas e pelas funções)
-- ---------------------------------------------------------------------------

-- Sessão verificada com o autenticador, ainda existente (o painel encerra sessões ao suspender,
-- gerar senha nova ou remover o autenticador; o token já emitido deixa de valer na hora) e
-- senha provisória já trocada.
create function public.conta_liberada()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
     and exists (
       select 1 from auth.sessions s
        where s.id = nullif(auth.jwt() ->> 'session_id', '')::uuid and s.user_id = auth.uid()
     )
     and exists (
       select 1 from public.contas_app c
        where c.user_id = auth.uid() and c.senha_provisoria_hash is null
     );
$$;

-- Conta liberada e com pelo menos uma das funções pedidas.
create function public.tem_alguma_funcao(p_funcoes text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
     and exists (
       select 1 from auth.sessions s
        where s.id = nullif(auth.jwt() ->> 'session_id', '')::uuid and s.user_id = auth.uid()
     )
     and exists (
       select 1 from public.contas_app c
        where c.user_id = auth.uid()
          and c.senha_provisoria_hash is null
          and c.funcoes && p_funcoes
     );
$$;

create function public.tem_funcao(p_funcao text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.tem_alguma_funcao(array[p_funcao]);
$$;

revoke execute on function public.conta_liberada() from public, anon;
revoke execute on function public.tem_alguma_funcao(text[]) from public, anon;
revoke execute on function public.tem_funcao(text) from public, anon;
grant execute on function public.conta_liberada() to authenticated;
grant execute on function public.tem_alguma_funcao(text[]) to authenticated;
grant execute on function public.tem_funcao(text) to authenticated;

-- O app pergunta, logo depois do login, o que mostrar. Funciona antes da verificação (aal1),
-- porque é o que decide se a tela pede o código; não devolve nenhum dado sensível.
create function public.minha_conta()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'papel', c.papel,
    'funcoes', to_jsonb(c.funcoes),
    'senha_provisoria', c.senha_provisoria_hash is not null,
    -- Falso quando o painel encerrou a sessão: o app sai em vez de abrir sem dados.
    'sessao_ativa', exists (
      select 1 from auth.sessions s
       where s.id = nullif(auth.jwt() ->> 'session_id', '')::uuid and s.user_id = auth.uid()
    )
  )
    from public.contas_app c
   where c.user_id = auth.uid();
$$;

revoke execute on function public.minha_conta() from public, anon;
grant execute on function public.minha_conta() to authenticated;

-- A pessoa trocou a senha provisória: libera a conta se o hash atual já for outro.
-- Devolve true quando a conta ficou liberada.
create function public.confirmar_troca_de_senha()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(auth.jwt() ->> 'aal', '') <> 'aal2' then
    raise exception 'sem_acesso' using errcode = '42501';
  end if;
  update public.contas_app c
     set senha_provisoria_hash = null, updated_at = now()
    from auth.users u
   where c.user_id = auth.uid()
     and u.id = c.user_id
     and c.senha_provisoria_hash is not null
     and u.encrypted_password is distinct from c.senha_provisoria_hash;
  return not exists (
    select 1 from public.contas_app where user_id = auth.uid() and senha_provisoria_hash is not null
  );
end;
$$;

revoke execute on function public.confirmar_troca_de_senha() from public, anon;
grant execute on function public.confirmar_troca_de_senha() to authenticated;

-- Edge Function admin-usuarios: confere que quem chamou é administrador verificado.
-- Roda com o token de quem chamou (auth.uid() e aal vêm dele). Devolve o id do administrador.
create function public.admin_verificado()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if coalesce(auth.jwt() ->> 'aal', '') <> 'aal2'
     or not exists (
       select 1 from public.contas_app
        where user_id = auth.uid() and papel = 'admin' and senha_provisoria_hash is null
     ) then
    raise exception 'sem_acesso' using errcode = '42501';
  end if;
  return auth.uid();
end;
$$;

revoke execute on function public.admin_verificado() from public, anon;
grant execute on function public.admin_verificado() to authenticated;

-- Edge Function admin-usuarios (chave de administração): marca a senha atual da conta como
-- provisória, logo depois de criá-la ou de gerar uma senha nova.
create function public.marcar_senha_provisoria(p_user uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.contas_app c
     set senha_provisoria_hash = u.encrypted_password, updated_at = now()
    from auth.users u
   where c.user_id = p_user and u.id = p_user;
$$;

revoke execute on function public.marcar_senha_provisoria(uuid) from public, anon, authenticated;
grant execute on function public.marcar_senha_provisoria(uuid) to service_role;

-- Edge Function admin-usuarios (chave de administração): encerra todas as sessões da conta.
-- Chamada ao suspender, gerar senha nova e remover o autenticador.
create function public.encerrar_sessoes(p_user uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.sessions where user_id = p_user;
$$;

revoke execute on function public.encerrar_sessoes(uuid) from public, anon, authenticated;
grant execute on function public.encerrar_sessoes(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Novas contas: nascem sem funções (o painel define as funções ao criar)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.user_stats (user_id) values (new.id)
  on conflict (user_id) do nothing;

  insert into public.contas_app (user_id) values (new.id)
  on conflict (user_id) do nothing;

  if m ? 'primeiro_nome' then
    insert into public.profiles (user_id, primeiro_nome, sobrenome, data_nascimento, ocupacao)
    values (
      new.id,
      m ->> 'primeiro_nome',
      m ->> 'sobrenome',
      (m ->> 'data_nascimento')::date,
      m ->> 'ocupacao'
    );
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Políticas restritivas: somam-se às políticas "own" que já existem
-- ---------------------------------------------------------------------------
-- Dados das tarefas: Tarefas, Kanban, Calendário, Foco (usa as tarefas da sessão) ou Painel (lê).
create policy "categories: funcao" on public.categories as restrictive for all to authenticated
  using ((select public.tem_alguma_funcao(array['tarefas', 'kanban', 'calendario', 'foco', 'painel'])))
  with check ((select public.tem_alguma_funcao(array['tarefas', 'kanban', 'calendario', 'foco', 'painel'])));
create policy "tags: funcao" on public.tags as restrictive for all to authenticated
  using ((select public.tem_alguma_funcao(array['tarefas', 'kanban', 'calendario', 'foco', 'painel'])))
  with check ((select public.tem_alguma_funcao(array['tarefas', 'kanban', 'calendario', 'foco', 'painel'])));
create policy "task_tags: funcao" on public.task_tags as restrictive for all to authenticated
  using ((select public.tem_alguma_funcao(array['tarefas', 'kanban', 'calendario', 'foco', 'painel'])))
  with check ((select public.tem_alguma_funcao(array['tarefas', 'kanban', 'calendario', 'foco', 'painel'])));
create policy "tasks: funcao" on public.tasks as restrictive for all to authenticated
  using ((select public.tem_alguma_funcao(array['tarefas', 'kanban', 'calendario', 'foco', 'painel'])))
  with check ((select public.tem_alguma_funcao(array['tarefas', 'kanban', 'calendario', 'foco', 'painel'])));

create policy "board_columns: funcao" on public.board_columns as restrictive for all to authenticated
  using ((select public.tem_funcao('kanban')))
  with check ((select public.tem_funcao('kanban')));

create policy "calendar_sources: funcao" on public.calendar_sources as restrictive for all to authenticated
  using ((select public.tem_funcao('integracoes')))
  with check ((select public.tem_funcao('integracoes')));
create policy "calendar_items: funcao" on public.calendar_items as restrictive for all to authenticated
  using ((select public.tem_funcao('integracoes')))
  with check ((select public.tem_funcao('integracoes')));

-- Minutos de foco: gravados pelo Foco, lidos também pelo Painel.
create policy "focus_sessions: funcao" on public.focus_sessions as restrictive for all to authenticated
  using ((select public.tem_alguma_funcao(array['foco', 'painel'])))
  with check ((select public.tem_funcao('foco')));

-- Perfil e estatísticas: qualquer conta liberada (verificada e com a senha já trocada).
create policy "profiles: conta liberada" on public.profiles as restrictive for all to authenticated
  using ((select public.conta_liberada()))
  with check ((select public.conta_liberada()));
create policy "user_stats: conta liberada" on public.user_stats as restrictive for all to authenticated
  using ((select public.conta_liberada()));

-- ---------------------------------------------------------------------------
-- Funções chamadas pelo app: ganham o mesmo portão
-- (a original é renomeada e só pode ser chamada pela nova, que confere o acesso antes)
-- ---------------------------------------------------------------------------
alter function public.concluir_tarefa(uuid) rename to concluir_tarefa_sem_portao;
revoke execute on function public.concluir_tarefa_sem_portao(uuid) from public, anon, authenticated;

create function public.concluir_tarefa(p_task_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.tem_alguma_funcao(array['tarefas', 'kanban', 'calendario', 'foco']) then
    raise exception 'sem_acesso' using errcode = '42501';
  end if;
  return public.concluir_tarefa_sem_portao(p_task_id);
end;
$$;

revoke execute on function public.concluir_tarefa(uuid) from public, anon;
grant execute on function public.concluir_tarefa(uuid) to authenticated;

alter function public.minhas_estatisticas() rename to minhas_estatisticas_sem_portao;
revoke execute on function public.minhas_estatisticas_sem_portao() from public, anon, authenticated;

create function public.minhas_estatisticas()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.conta_liberada() then
    raise exception 'sem_acesso' using errcode = '42501';
  end if;
  return public.minhas_estatisticas_sem_portao();
end;
$$;

revoke execute on function public.minhas_estatisticas() from public, anon;
grant execute on function public.minhas_estatisticas() to authenticated;

alter function public.registrar_push(text, text, text) rename to registrar_push_sem_portao;
revoke execute on function public.registrar_push_sem_portao(text, text, text) from public, anon, authenticated;

create function public.registrar_push(p_endpoint text, p_p256dh text, p_auth text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.tem_funcao('foco') then
    raise exception 'sem_acesso' using errcode = '42501';
  end if;
  perform public.registrar_push_sem_portao(p_endpoint, p_p256dh, p_auth);
end;
$$;

revoke execute on function public.registrar_push(text, text, text) from public, anon;
grant execute on function public.registrar_push(text, text, text) to authenticated;

alter function public.agendar_aviso_foco(timestamptz, text) rename to agendar_aviso_foco_sem_portao;
revoke execute on function public.agendar_aviso_foco_sem_portao(timestamptz, text) from public, anon, authenticated;

create function public.agendar_aviso_foco(p_enviar_em timestamptz, p_tipo text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.tem_funcao('foco') then
    raise exception 'sem_acesso' using errcode = '42501';
  end if;
  perform public.agendar_aviso_foco_sem_portao(p_enviar_em, p_tipo);
end;
$$;

revoke execute on function public.agendar_aviso_foco(timestamptz, text) from public, anon;
grant execute on function public.agendar_aviso_foco(timestamptz, text) to authenticated;

-- Cancelar não expõe nada: fica sem portão (só apaga o aviso da própria conta).
