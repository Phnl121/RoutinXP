-- Auditoria de segurança (2026-09-13): registrar_push apagava a inscrição de qualquer dono
-- que tivesse o mesmo endpoint. Quem descobrisse o endpoint de outra pessoa podia puxar a
-- inscrição dela para a própria conta. Agora a inscrição só troca de dono quando quem chama
-- também tem a chave secreta "auth" dela, e isso só acontece no mesmo navegador (troca de conta).

create or replace function public.registrar_push(p_endpoint text, p_p256dh text, p_auth text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'sem_login';
  end if;

  insert into public.push_subscriptions as s (user_id, endpoint, p256dh, auth)
  values (v_user, p_endpoint, p_p256dh, p_auth)
  on conflict (endpoint) do update
    set user_id = excluded.user_id,
        p256dh = excluded.p256dh,
        auth = excluded.auth,
        created_at = now()
    where s.user_id = excluded.user_id or s.auth = excluded.auth;

  -- Guarda no máximo 10 aparelhos por usuário (os mais recentes).
  delete from public.push_subscriptions
   where user_id = v_user
     and id not in (
       select id from public.push_subscriptions where user_id = v_user order by created_at desc limit 10
     );
end;
$$;

revoke execute on function public.registrar_push(text, text, text) from public, anon;
grant execute on function public.registrar_push(text, text, text) to authenticated;
