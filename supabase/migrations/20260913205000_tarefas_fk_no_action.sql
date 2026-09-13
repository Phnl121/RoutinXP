-- Revisão do Financeiro (2026-09-13): a FK de tarefas → categorias era "on delete restrict".
-- RESTRICT é conferido na hora, mesmo dentro de uma cascata: ao excluir uma conta (auth.users),
-- a categoria pode sair antes das tarefas dela e a exclusão inteira falha. NO ACTION confere só
-- no fim do comando, quando as tarefas também já saíram; excluir uma categoria com tarefas pela
-- tela continua recusado com o mesmo código (23503).
alter table public.tasks drop constraint tasks_category_id_user_id_fkey;
alter table public.tasks
  add constraint tasks_category_id_user_id_fkey
  foreign key (category_id, user_id) references public.categories (id, user_id) on delete no action;
