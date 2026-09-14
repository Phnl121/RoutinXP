-- Controle financeiro, fases 5.5, 3.6 e 6 (pedido do usuário, 2026-09-14).

-- ---------------------------------------------------------------------------
-- 5.5 Recorrências detectadas: sugestões que a pessoa dispensou
-- ---------------------------------------------------------------------------
-- A detecção roda na tela (6 meses de lançamentos). Guardamos só as chaves dispensadas
-- ("Ignorar"), para a sugestão não voltar em outro aparelho.
alter table public.fin_preferencias
  add column sugestoes_ignoradas text[] not null default '{}'
    check (cardinality(sugestoes_ignoradas) <= 300);
