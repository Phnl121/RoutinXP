# Progresso — App de Rotina (RoutinXP)

Este arquivo é o ponto de handoff entre ferramentas (Code, Antigravity, ou qualquer outra). Toda sessão de trabalho começa lendo isto e o `escopo-mvp-v1.md`, e termina atualizando isto antes de encerrar ou trocar de ferramenta.

## Estado atual
(a ferramenta que estiver trabalhando atualiza esta seção a cada sessão: o que existe, o que está funcionando, o que está pela metade)

Atualizado em 2026-09-10 (Claude Code), depois de segurança, deploy, migrations, CAPTCHA e marca RoutinXP. O próximo passo do roteiro é o 10.

- Repositório git: **sim**, branch `main`, remoto **privado** https://github.com/Phnl121/RoutinXP (conta Phnl121). Identidade local `Pedro <pedrocybernet01@gmail.com>`.
- Deploy: **Vercel**, projeto `phnl121/routinxp` (renomeado de `routin`), produção em **https://routinxp.vercel.app**.
  - O endereço antigo https://routin-six.vercel.app continua respondendo.
  - Deploy automático a cada push na `main`.
  - Variáveis `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` e `VITE_TURNSTILE_SITE_KEY` cadastradas no painel (Production e Preview). `vercel.json` faz o rewrite de SPA; `.vercelignore` impede `.env` de subir por deploy via CLI. Supabase Auth com Site URL de produção (configurado pelo usuário).
- Projeto Vite: **sim**. React 19 + Vite 8 (JS), `react-router`, fonte Archivo auto-hospedada. Node 24 LTS em `C:\Program Files\nodejs` (pode não estar no PATH do shell; `.claude/launch.json` chama `node.exe` direto).
- Supabase: client em `src/lib/supabase.js`.
  - **Migrations versionadas com a Supabase CLI** (dependência de desenvolvimento, versão 2.117.0).
    - A pasta está ligada ao projeto `cowlksvjueoacwthytmg`.
    - A migration inicial `supabase/migrations/20260910203320_schema_inicial.sql` (igual ao `schema.sql`) está marcada como aplicada; local e remoto batem.
  - **Mudanças no banco daqui pra frente:**
    - Criar a migration com `npx.cmd supabase migration new <nome>`.
    - Escrever o SQL no arquivo gerado.
    - Aplicar com `npx.cmd supabase db push`.
    - Conferir com `npx.cmd supabase migration list`.
  - No PowerShell, use `npx.cmd` (a política de execução bloqueia o `npx.ps1`) e rode sempre dentro da pasta do projeto. O `link` grava o estado em `supabase/.temp/`, que fica fora do git.
  - As URLs de Auth foram configuradas pelo usuário.
- Impeccable: `PRODUCT.md`, `DESIGN.md` + `.impeccable/design.json` (atualizados após o passo 9), briefs em `.impeccable/surfaces/`.
- Auth (passo 8): **pronto**, aprovado na revisão final do Impeccable ("ship").
- Tela de tarefas (passo 9): **pronta**, aprovada na revisão final do Impeccable ("fix", correções aplicadas, depois "ship").
  - Estrutura "Trilho de categorias", escolhida pelo usuário: barra superior com medidor de nível (NÍVEL, barra de XP, streak), trilho de categorias com contagem de pendentes, abas LISTA | QUADRO e filtro Pendentes/Concluídas.
  - Lista agrupada por categoria.
  - Quadro com Pendentes/Concluídas: arrastar para Concluídas conclui a tarefa, e não há volta.
  - Criar/editar tarefa em diálogo, com título, categoria e data prevista; não há campo de XP.
  - Excluir tarefa com "Desfazer" por 5 s.
  - Categorias: criar, editar e excluir no trilho, com 8 cores. Uma categoria com tarefas não pode ser excluída, e a interface explica o motivo.
  - Datas relativas ("hoje", "amanhã"); prazos de hoje e atrasados aparecem em tinta forte, sem vermelho.
  - Estados vazio, carregando e erro. No celular, chips roláveis, Quadro deslizante e botão flutuante "+".
  - Camada de dados em `src/lib/dados.js` + `src/lib/useDados.js` (atualizações otimistas).
- **Pré-visualização de desenvolvimento:** `npm run dev` e abrir `/?previa` (opcional `&visao=quadro`). Mostra dados fictícios em memória, sem login, útil para capturas e revisão. Fica fora do build de produção (verificado).
- Lógica de XP/streak (passo 10): **não iniciada**. Por enquanto concluir só grava `status = 'concluida'`; o XP não entra em `user_stats`. As linhas concluídas mostram o `xp_value` guardado (padrão 10) até o passo 10.
- Dashboard / card de perfil (passo 11): não iniciado.
- PWA (passo 12): não iniciado.
- **Configuração de segurança e deploy** (roteiro em `seguranca-e-criacao-repositorio.txt`):
  - Etapas A a D feitas: histórico do git sem segredos, RLS confirmado no painel e por ataque anônimo à API, repositório privado criado, Vercel ligada ao projeto.
  - Etapa E: a Site URL do Supabase foi corrigida pelo usuário para routin-six. Falta:
    - trocar as URLs para routinxp.vercel.app;
    - testar cadastro, confirmação, login e redefinição de senha em produção.
  - **CAPTCHA (Cloudflare Turnstile) ativo.** O widget é invisível e só aparece quando a Cloudflare pede interação. Protege entrar, criar conta e esqueci minha senha. O Supabase recusa pedidos sem token ou com token falso (verificado pela API).
  - Etapa F (tornar o repositório público): opcional, não feita.
  - CLIs `gh` e `vercel` instaladas. O terminal do painel do usuário não as enxerga; quem roda os comandos é o Claude Code.

**Dados de teste na conta real do usuário:** categorias Faculdade, Trabalho, Vida Pessoal e 8 tarefas de exemplo, algumas concluídas, criadas no teste do passo 9. Ainda não foi confirmado se devem ser apagadas.

**Pendências técnicas conhecidas:**
- Alvos de toque abaixo de 44px: botões do filtro segmentado (32px), chips de categoria no celular, chip "+ Nova categoria" e botão compacto da barra (40px). O DESIGN.md registra 44/48px como regra.
- O anel do check vazio numa linha em hover (fundo `--panel-2`) fica em ~2,97:1, um pouco abaixo de 3:1.
- As animações do check divergem: no app 0,45 s e escala 1,2; na demo do login 0,4 s e escala 1,18.
- O brief `.impeccable/surfaces/src-pages-tarefas-jsx.md` ainda cita uma barra roxa no item selecionado do trilho; o código usa um estado neutro, que é o correto.

**Ações pendentes do usuário:**
- **Supabase** → Authentication → URL Configuration:
  - Site URL: `https://routinxp.vercel.app`.
  - Adicionar `https://routinxp.vercel.app/**` às Redirect URLs, mantendo as antigas durante a transição.
- **Cloudflare** → Turnstile → widget Routin: adicionar o hostname `routinxp.vercel.app`. Sem isso o CAPTCHA falha no domínio novo e o login quebra lá.
- **Pasta local:** renomear `App - Rotina` para `RoutinXP` com o Claude fechado. Depois reabrir a pasta nova no Claude Code; o git e o link da Supabase CLI continuam funcionando, porque ficam dentro da pasta.
- **Opcional:**
  - renomear o projeto no painel do Supabase e o widget no Turnstile;
  - apagar os dados de teste.

## Log de sessões (mais recente primeiro)
Cada entrada: data, ferramenta usada, o que foi feito, o que travou, o que fazer a seguir.

### 2026-09-10 (noite), Claude Code (Opus 5): segurança, deploy, migrations, CAPTCHA e marca
Feito:
- Roteiro de `seguranca-e-criacao-repositorio.txt`:
  - `.vercel` no `.gitignore`;
  - histórico do git sem segredos;
  - RLS confirmado no painel e por ataque anônimo à API;
  - repositório privado no GitHub;
  - Vercel com `vercel.json` (rewrite de SPA) e `.vercelignore`;
  - deploy automático ligado.
- Supabase CLI com migrations: baseline aplicado e `schema.sql` removido.
- CAPTCHA com o Cloudflare Turnstile.
- Marca **RoutinXP**:
  - logo em `public/marca/` no login, na redefinição de senha e na barra do app;
  - favicon novo;
  - cores de destaque alinhadas à logo (roxo `#7C3AED`, verde `#22C55E`);
  - repositório do GitHub renomeado para `Phnl121/RoutinXP`;
  - projeto da Vercel renomeado para `routinxp`, com o domínio `routinxp.vercel.app`;
  - `package.json` com o nome `routinxp`.

Travou:
- O terminal do painel do usuário não enxerga programas recém-instalados. Logins e senhas foram feitos pelo usuário num PowerShell externo, usando `npx.cmd`.
- O primeiro `supabase link` foi feito em `C:\WINDOWS\system32` (terminal de administrador) e precisou ser refeito na pasta do projeto.
- Limite de ~2 e-mails/hora do SMTP padrão do Supabase.

Próximo:
- Ações pendentes acima.
- Testar a redefinição de senha no domínio novo.
- SMTP próprio quando houver domínio comprado.
- Passo 10 (XP/streak) usando migrations.

### 2026-09-10 (tarde), Claude Code (Opus 5): passo 9
Feito:
- Regra de XP anti-inflação decidida com o usuário (ver decisões).
- Rodada de estrutura no Impeccable: o usuário gerou imagens no Nano Banana a partir dos prompts em `.impeccable/mocks/decision/PROMPTS-estrutura-tarefas.md` e escolheu o "Trilho de categorias".
- Construção completa da tela de tarefas.
- Teste real na conta do usuário: concluir, arrastar, excluir/desfazer, editar e bloqueio de exclusão de categoria.
- Revisão final (8 correções) e veredito "ship".
- `DESIGN.md` atualizado pelo documentador.

Travou:
- A automação por teclado no navegador do app falha com o painel escondido; foi contornada chamando o próprio módulo de dados.
- O Edge headless não tem a sessão do usuário; por isso foi criada a pré-visualização `/?previa`.
- Os `.txt` de deploy/segurança do usuário entraram no commit `546987a` junto com o código. Nenhum segredo neles, e nada foi enviado a remoto.

Próximo:
- Decidir o deploy (passo 5.1).
- Passo 10: função SQL `concluir_tarefa` com a regra de XP, o streak e o fuso, rodada manualmente no SQL Editor. Depois ligar o voo do "+XP" até a barra superior.
- Resolver as pendências técnicas acima.

### 2026-09-10 (manhã), Claude Code (Opus 5): passos 1 a 8
Feito:
- Passos 1 a 8 do prompt inicial.
- `PRODUCT.md` criado.
- Três rodadas de direção visual; a escolhida foi a convenção de plataforma gamificada (DIO).
- Login gamificado aprovado.
- App renomeado para RoutinXP.
- Removida a promessa de "10 XP por tarefa".

Travou:
- Node.js não estava instalado (foi instalado via winget).
- O git não tinha identidade.
- O SQL precisou ser rodado manualmente.

## Decisões tomadas fora do escopo.md
(qualquer decisão de implementação que não estava prevista no escopo original, pra não se perder entre ferramentas)

Todas em 2026-09-10. Detalhes em `PRODUCT.md`.

- **Nome do produto: RoutinXP** (usuário).
- **Tela de categorias:** criar, editar e excluir, sem categorias pré-criadas. Categoria com tarefas não pode ser excluída.
- **Confirmação de e-mail ligada;** "Esqueci minha senha" incluído.
- **Visão Quadro (Kanban)** por status (Pendentes/Concluídas), convivendo com a Lista. Arrastar para Concluídas conclui a tarefa.
- **Desfazer conclusão:** não entra na v1 (usuário). Uma tarefa concluída não volta para Pendentes.
- **Excluir tarefa:** permitido, com "Tarefa excluída · Desfazer" por 5 s em vez de confirmação (usuário).
- **Níveis** calculados a partir do `xp_total`: 100 XP para o nível 2, e cada nível seguinte pede +50 (`src/lib/nivel.js`).
- **Card de perfil** só dentro do app. Sem ranking e sem conquistas na v1.
- **Regra de XP** (usuário): o usuário nunca escolhe o valor.
  - Base de 10 XP por tarefa, +5 se concluída até a data prevista.
  - Vale 0 XP se concluída menos de 5 minutos depois de criada.
  - Teto de 150 XP por dia.
  - Tudo calculado no banco (passo 10).
  - O formulário de tarefa não tem campo de XP.
- **XP e streak gravados só pelo servidor:** `user_stats` não tem policy de insert/update pro cliente (mais restrito que "CRUD completo", de propósito).
- **Em aberto para o passo 10:** qual fuso define o "dia" do streak (sugestão: `America/Sao_Paulo`).
- **Visual:** tema escuro com verde para XP e nível e roxo para ações, na convenção DIO/Duolingo/Habitica, com a fonte Archivo. Roxo nunca marca seleção; seleção é neutra.
- **Estrutura da tela de tarefas:** "Trilho de categorias" (usuário).
- **Deploy contínuo desde cedo** (usuário, passo 5.1 nos documentos). Ainda não executado: depende de login do usuário no GitHub e na Vercel.
- **Ideia não agendada:** temas desbloqueados por nível. As cores já estão em variáveis CSS.
