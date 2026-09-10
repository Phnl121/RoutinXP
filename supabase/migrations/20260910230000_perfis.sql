-- Passo 11: perfil do usuário (nome, sobrenome, data de nascimento, ocupação).
-- Preenchido no cadastro (metadados do signUp, via trigger) ou depois, na página Perfil.
-- Idade mínima de 13 anos, conferida no banco (decisão do usuário).

create table public.profiles (
  user_id         uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  primeiro_nome   text not null check (char_length(trim(primeiro_nome)) between 1 and 50),
  sobrenome       text not null check (char_length(trim(sobrenome)) between 1 and 80),
  data_nascimento date not null,
  ocupacao        text not null check (ocupacao in ('estudante', 'trabalho', 'ambos')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Validação de idade e limpeza dos nomes (a data de hoje é a de Brasília).
create function public.validar_perfil()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  if new.data_nascimento < date '1900-01-01' or new.data_nascimento > v_hoje then
    raise exception 'data_nascimento_invalida' using errcode = '23514';
  end if;
  if new.data_nascimento > (v_hoje - interval '13 years')::date then
    raise exception 'idade_minima' using errcode = '23514';
  end if;
  new.primeiro_nome := trim(new.primeiro_nome);
  new.sobrenome := trim(new.sobrenome);
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_validar
  before insert or update on public.profiles
  for each row execute function public.validar_perfil();

-- RLS: cada um só vê e altera o próprio perfil. Sem delete (sai junto com a conta).
alter table public.profiles enable row level security;

create policy "profiles: select own" on public.profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "profiles: insert own" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "profiles: update own" on public.profiles
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant insert (primeiro_nome, sobrenome, data_nascimento, ocupacao) on public.profiles to authenticated;
grant update (primeiro_nome, sobrenome, data_nascimento, ocupacao) on public.profiles to authenticated;

-- Cadastro: além de user_stats, cria o perfil a partir dos dados enviados no signUp.
-- Se os dados forem inválidos (ex.: menos de 13 anos), o cadastro inteiro é recusado.
-- Contas sem esses dados (criadas antes do passo 11) completam o perfil na página Perfil.
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
