# AGENTS.md: regras de convivência entre ferramentas

Este projeto (RoutinXP) é desenvolvido por mais de uma ferramenta de IA, hoje o Claude Code e o Antigravity, e às vezes pelo próprio usuário direto no editor. A memória compartilhada fica toda na pasta:

- **o git**: cada alteração vira um commit;
- **`PROGRESS.md`**: estado atual, log de sessões e decisões;
- **`DESIGN.md`**: o sistema visual, com cores, tipografia, componentes e regras;
- **`PRODUCT.md`**: o que o produto é e as regras de negócio (XP, streak, prazos).

Nenhuma ferramenta depende do que lembra da conversa; só do que está gravado aqui.

## Ao começar uma sessão

1. Leia `PROGRESS.md` e `DESIGN.md`. Leia `PRODUCT.md` se a tarefa mexer em regra de negócio.
2. Rode `git status` e `git log --oneline -15`.
3. **Se houver alterações sem commit, pare e avise o usuário.** Não se sabe quem mexeu nem por quê.
4. Se houver commits de outra ferramenta desde a sua última sessão, leia o diff deles antes de mexer.

## Regras do código

- **Cores:** só pelos tokens do `:root` em `src/index.css`. Nunca hexadecimal solto em componente. As exceções são as cores escolhidas pelo usuário (categorias, tags, colunas do Kanban), que são dados.
- **Papel de cada cor** (DESIGN.md):
  - roxo só para ações;
  - verde só para XP, nível e conclusão;
  - seleção sempre neutra (Panel Two + contorno Rule Strong), nunca roxa.
  - Prazos usam os tokens `--prazo-*`.
- **Textos:** só em `src/i18n/pt-BR.js`, nunca escritos direto no JSX.
- **Banco:** qualquer mudança só por migration nova em `supabase/migrations/` (`npx.cmd supabase migration new <nome>`), nunca pelo painel do Supabase. Aplicar em produção (`npx.cmd supabase db push`) só com autorização do usuário.
- **Não altere** `DESIGN.md`, `PRODUCT.md` nem os arquivos de `supabase/` sem o usuário pedir.
- **Comentários e nomes** em português, no mesmo estilo do código ao redor.

## Ao terminar

1. Rode `npm run lint` e `npm run build` e confirme que não há erro. Se o terminal não achar o `npm`, o Node está em `C:\Program Files\nodejs`.
2. Faça **um commit por ajuste**, com uma mensagem que diga o que mudou.
   - O Antigravity começa a mensagem com `[antigravity]`.
   - O Claude Code termina com `Co-Authored-By: Claude`.
   - O usuário, quando edita à mão, usa `[manual]`.
3. **Não faça push.** Push na `main` publica na hora na Vercel, e quem decide é o usuário.
4. Se a mudança alterou comportamento, estrutura ou uma decisão (não só cor, texto ou espaçamento), acrescente uma entrada curta no "Log de sessões" do `PROGRESS.md`, no formato Feito / Travou / Próximo, e commite.
5. **Nunca troque de ferramenta com alterações sem commit.** O `git status` precisa estar limpo.

## Uma ferramenta por vez

Não deixe duas ferramentas trabalhando ao mesmo tempo nos mesmos arquivos.

## Se algo der errado

Desfaça com `git revert <commit>`, que cria um commit novo desfazendo o anterior. Não reescreva o histórico (`reset --hard`, `push --force`) sem o usuário pedir.

## Divisão de trabalho sugerida

- **Antigravity:** ajustes pequenos de cor, texto, espaçamento, tamanho de botão, ícone e acabamentos visuais.
- **Claude Code:** telas novas, lógica de XP e streak, banco e migrations, integrações, revisões do Impeccable e deploy.
