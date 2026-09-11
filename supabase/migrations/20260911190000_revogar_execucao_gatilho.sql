-- Avisos do linter de segurança do Supabase (2026-09-11).

-- handle_new_user é função de gatilho: só o gatilho de auth.users a chama.
-- Ninguém precisa chamá-la pela API; o gatilho continua funcionando sem essa permissão.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- concluir_tarefa é o único jeito de concluir uma tarefa (calcula XP e streak no servidor)
-- e só aceita tarefas do próprio usuário. Fica só para quem está logado, com permissão explícita.
revoke execute on function public.concluir_tarefa(uuid) from public, anon;
grant execute on function public.concluir_tarefa(uuid) to authenticated;
