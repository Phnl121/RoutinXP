# Progresso — App de Rotina (RoutinXP)

Este arquivo é o ponto de handoff entre ferramentas (Code, Antigravity, ou qualquer outra). Toda sessão de trabalho começa lendo isto e o `escopo-mvp-v1.md`, e termina atualizando isto antes de encerrar ou trocar de ferramenta.

## Estado atual
(a ferramenta que estiver trabalhando atualiza esta seção a cada sessão: o que existe, o que está funcionando, o que está pela metade)

Atualizado em 2026-09-13 (Claude Code). **v1 completa e v2 entregue.** Tudo está no ar e foi testado pelo usuário em produção: PWA no celular, Integrações com os links reais das disciplinas, Kanban, Calendário, tarefas e Foco com os avisos. O log de sessões abaixo guarda o histórico e o detalhe de cada entrega.

**Painel de administração e verificação em duas etapas publicados e testados pelo usuário (2026-09-13).**

**Financeiro no ar e testado pelo usuário (2026-09-13):** menu em seções, fases 0 a 3 (página do mês, lançamentos manuais, contas, categorias, resumo com DRE e evolução, Gastos fixos). Falta aplicar `20260913230000_gastos_fixos_tipo_fixo` (correção da revisão) e publicar os ajustes finais.

### Infraestrutura
- **Pasta local:** `C:\Users\pedro\Desktop\RoutinXP` (renomeada de `App - Rotina` pelo usuário em 2026-09-13). O git e o link da Supabase CLI continuaram funcionando.
- **Repositório:** https://github.com/Phnl121/RoutinXP, **público** desde 2026-09-13 (etapa F do roteiro de segurança, feita pelo usuário). Branch `main`, identidade local `Pedro <pedrocybernet01@gmail.com>`.
  - O histórico não tem segredos (conferido na etapa A).
  - Chaves privadas (VAPID, service role, segredo do agendamento) ficam só nos segredos do Supabase e no Vault, nunca no git.
- **Deploy:** Vercel, projeto `phnl121/routinxp`, produção em **https://routinxp.vercel.app**.
  - Deploy automático a cada push na `main`. O endereço antigo https://routin-six.vercel.app continua respondendo.
  - Variáveis `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` e `VITE_TURNSTILE_SITE_KEY` no painel (Production e Preview).
  - `vercel.json` faz o rewrite de SPA e manda `no-cache` no `/sw.js`; `.vercelignore` impede o `.env` de subir por deploy via CLI.
- **Projeto:** React 19 + Vite 8 (JS), `react-router`, fonte Archivo auto-hospedada. Node 24 LTS em `C:\Program Files\nodejs` (pode não estar no PATH; `.claude/launch.json` chama `node.exe` direto).
- **Supabase** (projeto `cowlksvjueoacwthytmg`, client em `src/lib/supabase.js`):
  - **Migrations com a Supabase CLI**, todas aplicadas (local e remoto batem):
    - `20260910203320_schema_inicial`;
    - `20260910220000_xp_e_streak`;
    - `20260910230000_perfis`;
    - `20260911120000_descricao_e_tags`;
    - `20260911180000_integracoes_calendario`;
    - `20260911190000_revogar_execucao_gatilho`;
    - `20260911200000_kanban_colunas`;
    - `20260911220000_sessoes_foco`;
    - `20260911230000_avisos_foco`;
    - `20260913154343_teto_xp_por_dia`;
    - `20260913154344_push_sem_sequestro`;
    - `20260913154346_limites_por_usuario`;
    - `20260913200000_painel_admin`;
    - `20260913205000_tarefas_fk_no_action`;
    - `20260913210000_financeiro_modelo`;
    - `20260913220000_financeiro_gastos_fixos`;
    - `20260913230000_gastos_fixos_tipo_fixo` (**ainda não aplicada**).
  - **Permissão local:** `.claude/settings.local.json` (fora do git) libera para o Claude Code `npx.cmd supabase db push`, `migration list`, `functions deploy` e `git push`. Continua valendo: só com pedido do usuário no chat.
  - **Mudança no banco:**
    - Criar a migration com `npx.cmd supabase migration new <nome>`.
    - Escrever o SQL no arquivo gerado.
    - Aplicar com `npx.cmd supabase db push`.
    - Conferir com `npx.cmd supabase migration list`.
    - No PowerShell, use `npx.cmd` (a política de execução bloqueia o `npx.ps1`), sempre dentro da pasta do projeto.
  - **Edge Functions:** publicar com `npx.cmd supabase functions deploy <nome> --no-verify-jwt --use-api`.
    - `sincronizar-calendarios` lê os calendários iCal. O pg_cron chama a cada 30 min; cada calendário é lido a cada ~3 h.
    - `avisos-foco` envia o Web Push do fim de fase. O pg_cron confere a cada 15 s e só chama quando há aviso vencido.
    - As duas se autenticam com o segredo `routinxp_cron_sync` do Vault.
    - `admin-usuarios` atende o painel de administração. É a única publicada **com** verificação de JWT: `npx.cmd supabase functions deploy admin-usuarios --use-api` (sem `--no-verify-jwt`).
  - **Segredos:** `VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY`.
  - **Segurança:**
    - RLS em todas as tabelas.
    - XP, streak e conclusão são gravados só pelo servidor (privilégio por coluna).
    - Tabelas de push e avisos acessíveis só por funções.
    - Acesso anônimo testado e recusado (401) em cada tabela nova.
    - CAPTCHA (Cloudflare Turnstile) em entrar e esqueci minha senha; cadastro fechado no servidor e "Secure password change" ligado.
    - Teto de XP guardado em `user_stats`, limites de linhas por usuário e cabeçalhos CSP/segurança na Vercel (auditoria de 2026-09-13).
    - URLs de Auth e hostname do Turnstile em `routinxp.vercel.app`.
- **Impeccable:**
  - `PRODUCT.md`, `DESIGN.md` e `.impeccable/design.json` (sincronizados com o código em 2026-09-13);
  - briefs das telas em `.impeccable/surfaces/` (casca, Tarefas, Painel, Integrações, Foco);
  - capturas de revisão em `.impeccable/review/`.
- **Pré-visualização de desenvolvimento:** `npm run dev` e abrir `/?previa`.
  - Aceita `&visao=lista|quadro|calendario&modo=mes|semana|dia|linha`, ou `/foco?previa`.
  - Usa dados fictícios em memória, sem login, e fica fora do build de produção.

### O que existe (no ar e validado pelo usuário)
- **Conta:**
  - **por convite** (desde 2026-09-13): sem cadastro na tela de entrada; o dono cria a conta no painel do Supabase com senha provisória;
  - entrar, "Esqueci minha senha" e link de convite (cai em "Crie sua senha");
  - página Perfil.
- **Tarefas (`/`):**
  - **Visões:** Lista agrupada por categoria (Pendentes/Concluídas); Kanban com colunas próprias e coloridas (soltar em Concluídas conclui); Calendário (Mês, Semana, Dia, Linha do tempo).
  - **Filtro:** busca, categorias, tags e prazo.
  - **Tarefa:** título, descrição, categoria, data e tags; card com capa na cor da categoria, etiquetas estilo Trello e selo de prazo (âmbar perto, rosa atrasada).
  - **Excluir** com "Desfazer". Não há desfazer conclusão (decisão da v1).
- **XP e streak** calculados no servidor, no horário de Brasília:
  - 10 de base, +5 no prazo;
  - 0 para tarefa criada há menos de 5 min;
  - teto de 150 por dia.
  - Níveis (100 XP para o 2, +50 a cada nível), voo do "+XP" até a barra e aviso de subida de nível.
- **Painel (`/painel`):** nível e XP, XP por dia (7 ou 30 dias), conclusões por categoria, minutos de foco, linha do tempo e streaks.
- **Foco (`/foco`):**
  - pomodoro em duas fases (montar e rodar), com as tarefas da sessão e o player do Spotify por link colado;
  - no fim de cada fase o relógio para e espera o usuário ("Hora da pausa", "Próximo foco");
  - avisos com som, vibração, notificação do sistema e Web Push, que chega com a tela bloqueada;
  - atalho na barra superior e tempo na aba do navegador;
  - histórico dos blocos de foco no Painel.
- **Categorias e tags (`/categorias`)** e **Integrações (`/integracoes`)**: calendários iCal (Blackboard e outros), um link por disciplina, com categoria e tag.
- **Casca:**
  - menu lateral retrátil, que vira gaveta no celular (Tarefas, Foco, Painel, Categorias e tags, Integrações, Perfil);
  - avisos no topo, um por vez: sem conexão, streak em risco, prazos, instalar;
  - botão flutuante "Nova tarefa" em todas as páginas.
- **PWA:**
  - manifest e ícones em `public/marca/`;
  - service worker (modelo em `pwa/sw.js`, gerado no build): casca offline, push e clique no aviso;
  - instalação no Android pelo navegador e no iPhone pelo passo a passo do Safari.
- **Dados de teste:** as 8 tarefas de exemplo foram apagadas pelo usuário (2026-09-13).

### Pendências
- **Aplicar `20260913230000_gastos_fixos_tipo_fixo` e publicar** os ajustes da revisão de Gastos fixos (autorização do usuário).
- **Financeiro, próximas fases:** 3.6 (avisos de vencimento: faixa no topo e push um dia antes), 4 (Open Finance pelo MeuPluggy; depende do usuário criar a conta, a aplicação na Pluggy e guardar as chaves nos segredos do Supabase), 5 (categorização por regras), 6 (orçamento e metas; gamificação sem decisão).
- **Técnicas:**
  - O pacote JS passa de 500 kB; dá para carregar cada página só quando for aberta (lazy loading).
  - O SMTP padrão do Supabase envia só ~2 e-mails por hora. O SMTP próprio depende de um domínio.
  - A proteção contra senhas vazadas é opção do painel do Supabase e parece exigir o plano Pro.
  - Foco: um aviso agendado por usuário (dois cronômetros em aparelhos diferentes se sobrepõem). Intervalos e link do Spotify ficam salvos por navegador.
  - Tarefas não funcionam sem internet (exigiria sincronização).
- **Adiado pelo usuário (2026-09-13):** domínio próprio e os testes de conta ligados a ele (cadastro, confirmação e redefinição de senha).
- **Decisão em aberto:** limitar a largura da Lista em telas muito largas (ficou de fora porque o usuário pediu tarefas em largura total).
- **Opcional do usuário:** renomear o projeto no painel do Supabase e o widget no Turnstile.
- **Risco:** o projeto grátis do Supabase pausa após 1 semana sem uso e precisa ser reativado no painel.

### Ideias (não agendadas)
- **Agenda** (pedida em 2026-09-13, para depois do financeiro): uma área de agenda, que precisa conversar com o Calendário das tarefas, as Integrações e o Foco.
- **Conquistas e badges:** estavam previstas para depois de validar XP e streak.
- **Temas desbloqueados por nível:** todas as cores já estão em variáveis CSS.
- **XP variável por categoria ou prioridade:** esperar dados reais de uso.
- **Notificação de prazos por push:** reaproveita a infraestrutura dos avisos do Foco.
- **Spotify com a conta conectada (Web Playback SDK):** exige Premium, não toca no navegador do celular e tem limite de 25 usuários no modo de desenvolvimento.
- **Ranking entre usuários:** não escolhido na v1.

## Log de sessões (mais recente primeiro)
Cada entrada: data, ferramenta usada, o que foi feito, o que travou, o que fazer a seguir.

### 2026-09-13, Claude Code (Opus 5): Financeiro, fases 2 e 3
Pedidos do usuário: seguir para a fase 2; depois, uma página própria "Gastos fixos" com assinaturas, compras parceladas (ex.: 12x), pagamentos e outros.

Feito (publicado: migration `20260913220000_financeiro_gastos_fixos` aplicada e push; testado pelo usuário):
- **Fase 2, na página Financeiro:** comparação com o mês anterior (no mês em andamento, até o mesmo dia); "Para onde foi" (gastos por categoria, tocar filtra); "Resultado do mês" (DRE pessoal com linhas que abrem as categorias); "Últimos 6 meses" (entradas × saídas, colunas tocáveis). O hook busca 6 meses de uma vez; sem migration.
- **Fase 3, página `/financeiro/gastos-fixos`** (estrutura "Próximas cobranças ao lado dos cadastros", escolhida na página de decisão do Impeccable):
  - `fin_recorrencias` (assinatura, parcelada, conta, outro; mensal, anual, semanal; valor variável; pausar) e vínculo em `fin_transacoes` (`recorrencia_id`, `referencia`, `parcela`, índice único por cobrança).
  - Compra parcelada: `fin_gerar_parcelas` cria as parcelas como saídas datadas em cada mês. Parcelas futuras aparecem no Financeiro como "agendado" e ficam fora dos totais e do saldo até a data.
  - Assinaturas e contas: "Pagar" cria o lançamento com a data de hoje (valor variável abre janela para confirmar); "Desfazer" apaga. Vencidas só contam a partir do dia do cadastro.
  - Placar: comprometido por mês, assinaturas por ano, parcelas a pagar e pagos no mês. Cartão resumo no Financeiro.
- **Revisões finais:** fase 2 (7 correções) e Gastos fixos (7 correções) aplicadas. Uma delas pede a migration `20260913230000_gastos_fixos_tipo_fixo`: o tipo do gasto fixo não muda depois de criado e refazer parcelas nunca apaga pagamentos.
- **Permissões:** o usuário criou `.claude/settings.local.json` para o Claude Code aplicar migrations e dar push quando pedido.

Travou:
- Sem Docker, as migrations não foram testadas num banco local; revisadas à mão e pelo revisor.
- A primeira migration de Gastos fixos foi aplicada antes da revisão terminar; a correção veio numa migration nova.

Próximo:
- Aplicar `20260913230000_gastos_fixos_tipo_fixo` e publicar.
- Decidir entre a fase 3.6 (avisos de vencimento) e a fase 4 (MeuPluggy).

### 2026-09-13, Claude Code (Opus 5): menu em seções e Financeiro (fases 0.3, 0.4 e 1)
Pedidos do usuário: o menu lateral dividido por categorias (prioridade) e seguir com o financeiro, lançamento manual primeiro, na ordem de fases do plano.

Feito (commitado localmente, **nada publicado**):
- **Menu lateral:** seções Rotina (Tarefas, Foco, Painel), Finanças (Financeiro), Organização (Categorias e tags, Integrações) e Conta (Perfil, Administração). Seção sem página liberada some. Recolhido, um fio curto separa as seções. Só a navegação rola em tela baixa, com o pé esmaecido.
- **Banco** (`20260913210000_financeiro_modelo`):
  - `fin_contas` (corrente, poupança, cartão com dias de fechamento e vencimento, dinheiro; saldo inicial com data; arquivar), `fin_categorias` (receita ou despesa; despesa com grupo fixa, variável ou assinatura) e `fin_transacoes` (entrada, saída ou transferência; valor em centavos; sem categoria = a revisar).
  - RLS do dono + política restritiva `tem_funcao('financeiro')`. Gatilho confere que a categoria combina com o tipo; o tipo da categoria não muda. Limites: 50 contas, 200 categorias, 100 mil lançamentos.
  - `fin_preparar()` cria as categorias iniciais na primeira visita; `fin_saldos()` soma o saldo de cada conta até hoje (desde a data do saldo inicial).
- **`20260913205000_tarefas_fk_no_action`:** a FK de tarefas para categorias era RESTRICT, o que podia fazer falhar a exclusão de um usuário com tarefas (inclusive pelo painel). Virou NO ACTION; as FKs do financeiro já nascem assim.
- **Página `/financeiro`** (estrutura "O mês numa página só", escolhida na página de decisão do Impeccable): seletor de mês, placar (Entradas, Saídas, Resultado, Poupado), lançamentos por dia com filtros (busca, tipo, categoria, conta), Contas e cartões com saldos e total, primeira conta quando não há nenhuma, botão flutuante no celular.
- **Janelas:** lançamento (valor digitado como maquininha, dica de que pagar fatura é transferência), conta (edita o saldo atual; cheque especial; arquivar) e categorias (lista e edição na mesma janela). Excluir lançamento tem Desfazer.
- **Pré-visualização:** `/financeiro?previa` com dados fictícios (`src/dev/previaFinanceiro.js`).
- **Impeccable:** brief em `.impeccable/surfaces/src-pages-financeiro-jsx.md`, capturas em `.impeccable/review/financeiro/` e `.impeccable/review/menu/`; revisões finais do menu (4 correções) e do Financeiro (8 correções) aplicadas.

Travou:
- Sem Docker, as migrations não foram testadas num banco local; revisadas à mão.
- Excluir todas as categorias financeiras faz as iniciais voltarem na visita seguinte (o preparo só confere se existe alguma).

Próximo:
- Publicar (ver Pendências) e testar.
- Fase 2: resumo do mês e DRE pessoal.

### 2026-09-13, Claude Code (Opus 5): painel de administração e verificação em duas etapas
Pedido do usuário: um painel para ver as contas do sistema e liberar funções por conta, antes do financeiro. Escolhas: todas as funções controláveis; conta criada com senha provisória gerada; verificação em duas etapas para todo mundo; último acesso só com a data; estrutura "lista e página da conta" (página de decisão do Impeccable).

Feito (publicado pelo usuário: migration, `admin-usuarios` com JWT, `sincronizar-calendarios` e `avisos-foco`, admin marcado no SQL Editor e push):
- **Banco** (`20260913200000_painel_admin`):
  - `contas_app`: papel (`usuario`/`admin`), funções liberadas (tarefas, kanban, calendario, foco, painel, integracoes, financeiro), nome e hash da senha provisória. Contas existentes recebem tudo menos financeiro.
  - `registro_admin`: quem fez o quê no painel, sem senhas.
  - Políticas restritivas em todas as tabelas: exigem sessão `aal2` que ainda existe em `auth.sessions`, senha provisória já trocada e a função certa. As funções chamadas pelo app (`concluir_tarefa`, `minhas_estatisticas`, `registrar_push`, `agendar_aviso_foco`) ganharam o mesmo portão; as originais viraram `*_sem_portao`.
  - `minha_conta()` diz ao app o papel, as funções, se a senha é provisória e se a sessão ainda vale.
  - `encerrar_sessoes` e `marcar_senha_provisoria`: só a chave de serviço.
- **Edge Function `admin-usuarios`:** listar, criar (senha de 16 caracteres; desfaz a conta se algo falhar), funções, suspender/reativar, senha nova, remover autenticador e excluir (pede o e-mail digitado). Suspender, senha nova e remover autenticador encerram as sessões na hora. O admin não age sobre a própria conta.
- **Cron:** `sincronizar-calendarios` só lê calendários de contas com Integrações; `avisos-foco` descarta avisos de contas sem Foco.
- **App:**
  - `PortaoConta` entre o login e a casca: cadastrar autenticador (QR ou chave), digitar o código, trocar a senha provisória; sessão encerrada pelo painel volta ao login.
  - Menu, rotas, dados carregados, abas de Tarefas, card de foco do Painel e botão "Nova tarefa" seguem as funções da conta.
  - `/admin` (lista + registro) e `/admin/:id` (funções com interruptores, dados e ações). Kanban e Calendário dependem de Tarefas.
  - Pré-visualização: `/admin?previa`, `/?previa&etapa=autenticador|codigo|senha`, `&funcoes=tarefas,foco` para simular conta comum.
- **Impeccable:** brief em `.impeccable/surfaces/src-pages-admin-jsx.md`, capturas em `.impeccable/review/admin/`; revisão final com 8 correções e 3 regressões, todas resolvidas.

Travou:
- Sem Docker, a migration não foi testada num banco local; revisada à mão.
- A primeira `db push` falhou: um delimitador `$$` virou `$` numa edição por script (corrigido em seguida).
- O modo automático do Claude Code bloqueou `db push`; o usuário rodou os comandos.
- O `[auth.mfa.totp]` do `config.toml` vale só localmente; no projeto hospedado é o painel do Supabase.

Próximo:
- Testar com uma conta de teste: criar, primeiro acesso, liberar e tirar funções, suspender.
- Depois, o controle financeiro, a partir da fase 0.3 (modelo de dados); as fases 0.1 e 0.2 (trava e verificação) ficam cobertas pelo painel.

### 2026-09-13, Claude Code (Opus 5): correções da auditoria de segurança
Pedido do usuário: auditoria de segurança e correção do que desse para corrigir no código.

Feito (migrations aplicadas e Edge Functions publicadas pelo usuário; push feito com autorização):
- **Teto de XP** (`20260913154343_teto_xp_por_dia`): o XP do dia fica em `user_stats.xp_dia`/`xp_dia_total`. Antes, excluir tarefas concluídas zerava a soma do dia e liberava XP sem limite. `minhas_estatisticas.xp_hoje` usa o mesmo valor.
- **Push** (`20260913154344_push_sem_sequestro`): `registrar_push` só passa a inscrição para outra conta quando a chave `auth` é a mesma (mesmo navegador). Antes bastava saber o endpoint.
- **Limites por usuário** (`20260913154346_limites_por_usuario`): 20 calendários, 100 categorias, 200 tags, 30 colunas, 10 mil tarefas e até 24 h de foco somadas em 24 h. Erro `limite_atingido` com texto em `pt-BR.js`.
- **Edge Functions:** recusam sem `x-cron-secret` antes de consultar o banco; o filtro contra SSRF agora bloqueia se `Deno.resolveDns` não existir (antes deixava passar) e cobre IPv4 dentro de IPv6 em hexadecimal, 6to4, Teredo e multicast.
- **Vercel:** CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy` e `Permissions-Policy`. A CSP precisa de `'unsafe-eval'` e de `embed-cdn.spotifycdn.com` porque o player do Spotify usa `eval` (testado: sem isso o player não aparece). Testada no dev (`/foco?previa`, player carregou sem violação) e no build (`/entrar` com Turnstile).
- **Senha nova:** mínimo de 8 caracteres com letras e números no formulário.

Travou:
- Sem Docker, as migrations não foram testadas num banco local; foram revisadas à mão.
- DNS rebinding no leitor de calendários continua possível em tese: o runtime não deixa fixar o IP conferido na conexão.

Conferido pelo usuário (2026-09-13): cadastro fechado, CAPTCHA ligado, lista de usuários revisada, "Secure password change" ligado, senha mínima de 8 caracteres com letras e números, "Testar link" das Integrações funcionando (o runtime tem `Deno.resolveDns`) e player do Spotify aparecendo com a CSP em produção.

Próximo:
- Risco aceito: DNS rebinding teórico no leitor de calendários.

### 2026-09-13, Claude Code (Opus 5): app por convite
Pedido do usuário: ninguém cria conta sozinho; o dono cria as contas (senha provisória) no painel do Supabase. Isso também protege a futura área financeira.

Feito:
- **Tela de entrada:** saíram a aba "Criar conta" e o formulário de cadastro. Entraram o título "Entrar" e a frase "O RoutinXP é por convite. Entre com o e-mail e a senha que você recebeu.". Ficam "Entrar" e "Esqueci minha senha".
- **Link de convite:** `src/lib/supabase.js` lê `type=invite` no endereço antes de o cliente limpá-lo, e `useSession` manda a pessoa para a tela de senha, que diz "Crie sua senha" / "Criar senha".
- **Textos:** saíram os textos e erros de cadastro (`pt-BR.js`, `authErrors.js`).
- **Documentação:** DESIGN.md, design.json e o brief da casca atualizados.

Ação do usuário (painel do Supabase):
- **Fechar o cadastro no servidor:** Authentication → Sign In / Providers → desligar "Allow new users to sign up". Sem isso, alguém ainda consegue criar conta chamando a API direto.
- **Criar uma conta:** Authentication → Users → Add user → Create new user, com e-mail, senha provisória e "Auto Confirm User".
- **Revisar a lista de usuários** e excluir contas desconhecidas.

Próximo:
- Trava da área financeira no servidor (acesso por usuário, liberado só pelo dono), junto com a nova funcionalidade.

### 2026-09-13, Claude Code (Opus 5): fechamento da v1 e da v2, documentação atualizada
- O usuário testou em produção e validou:
  - PWA no celular;
  - Integrações com os links reais;
  - Kanban, Calendário e demais recursos de tarefas;
  - Foco com os avisos.
- Ações do usuário:
  - pasta renomeada para `RoutinXP`;
  - 8 tarefas de teste apagadas;
  - repositório tornado público.
  - O domínio próprio e os testes de conta ligados a ele ficaram para depois.
- A cópia temporária da chave privada VAPID (`vapid.json`, fora do repositório) foi apagada. A chave vive só nos segredos do Supabase.
- "Estado atual" reescrito para o app de hoje: sem trilho nem Quadro; infraestrutura, recursos, pendências e ideias.
- `DESIGN.md` e `.impeccable/design.json` sincronizados com o código pelo documentador do Impeccable.

Próximo:
- Escolher a próxima frente. Sugestões: carregar cada página só quando for aberta (pacote de 500 kB), notificação de prazos por push, conquistas.

### 2026-09-11, Claude Code (Opus 5): Foco avisa de verdade no fim de cada fase
O problema, relatado pelo usuário:
- o aviso era um toque só, abafado pela música;
- a pausa começava sozinha, então quem estava distraído nem via que tinha parado;
- o foco seguinte ficava esperando um clique que ninguém dava.

Feito:
- **Nada começa sozinho.** No fim do foco, o relógio para em "Hora da pausa" com "Iniciar pausa". No fim da pausa, para em "Próximo foco". Enquanto espera, o botão pulsa e o atalho da barra mostra "Hora da pausa 05:00".
- **Aviso mais forte.**
  - Três pares de toques e vibração mais longa.
  - Notificação do sistema sempre, mesmo com a página à vista. Ela fica na tela até ser tocada.
  - Um lembrete sonoro por minuto (até 3 vezes) enquanto ninguém responde.
  - A música pausa no fim do foco.
- **Web Push pelo servidor**, para avisar com a tela bloqueada, em outra aba ou com o app fechado.
  - O navegador agenda o aviso ao iniciar cada fase e cancela ao pausar, pular ou encerrar.
  - O banco confere a cada 15 s e chama a Edge Function `avisos-foco`, que envia o push (VAPID).
  - Arquivos: `src/lib/push.js`, `pwa/sw.js` (push e clique no aviso) e a migration `20260911230000_avisos_foco.sql`, com as tabelas `push_subscriptions` e `focus_alerts` acessíveis só por funções.
  - Tocar no aviso abre o app na página Foco.
- Convite "Ativar avisos" na página Foco. Se as notificações estiverem bloqueadas, explica como liberar. No iPhone fora do app instalado, explica que precisa instalar.

Próximo:
- (Feito, com autorização do usuário) Migration `avisos_foco` aplicada, segredos VAPID cadastrados, função `avisos-foco` publicada (sem o segredo do agendamento responde 401) e site no ar. Anônimo recebe 401 nas tabelas e funções novas.
  - A chave privada foi gerada fora do repositório, no scratchpad da sessão, e nunca entra no git.
- Testar no celular real, com o app instalado e a tela bloqueada.

### 2026-09-11, Claude Code (Opus 5): página Foco (pomodoro + Spotify)
Pedido do usuário: uma aba de pomodoro com intervalos configuráveis, cronômetro na tela, várias tarefas de categorias diferentes na sessão e música do Spotify tocando no app.

Decisões do usuário:
- o nome é "Foco";
- XP só vem das tarefas;
- Spotify pela opção A (player embutido a partir de um link colado, sem conectar conta);
- o histórico entra no Painel.

Estrutura "Montar e rodar", escolhida na página de decisão do Impeccable (seed 5557813b).

Feito:
- Página `/foco` no menu lateral (`src/pages/Foco.jsx`, `foco.css`).
  - Parada: Intervalos (atalhos 25/5 e 50/10, ou Personalizado com 4 campos), tarefas da sessão como cards da Lista e "Iniciar foco" com a Música ao lado.
  - Ao iniciar, o painel de intervalos vira o relógio (transição de vista do navegador): fase e ciclo, pílulas da rodada, mm:ss grande, Pausar/Retomar, Pular, Encerrar (com Desfazer).
  - Aparecem a tarefa atual ("Agora") e a fila. Concluir ali dá XP com o voo do "+XP" (lógica extraída para `src/lib/useVooXp.js`, usada também em Tarefas).
- Cronômetro (`src/lib/foco.js`):
  - guarda a hora de término, sobrevive a recarregar, sincroniza abas pelo `storage`;
  - a pausa começa sozinha; o foco seguinte espera o Iniciar;
  - no fim de cada fase há som curto, vibração e notificação (com a aba escondida);
  - a tela fica acesa enquanto roda com a página à vista.
- A casca mantém a página Foco montada depois da primeira visita, então o cronômetro e a música continuam ao trocar de página. A barra superior mostra o atalho "Foco 18:42" (no celular, no lugar da logo), e a aba do navegador mostra o tempo.
- Spotify (`src/lib/spotify.js`, `src/components/PlayerSpotify.jsx`): iFrame API oficial.
  - Aceita link de playlist, álbum, música ou podcast (open.spotify.com, com ou sem /intl-xx/) ou URI.
  - Recusa links curtos com explicação.
  - Pausa a música nas pausas e retoma no foco (opção marcável).
  - O link fica salvo no navegador.
- Janela "Adicionar tarefas" (`src/components/SeletorTarefas.jsx`): busca, filtro por categoria e caixas de marcar neutras.
- Painel: cartão "Minutos de foco" com barras por dia no mesmo período (7/30 dias), em `src/components/GraficoFoco.jsx`.
- Banco: migration `supabase/migrations/20260911220000_sessoes_foco.sql` com a tabela `focus_sessions` (id gerado no navegador como chave, então reenviar não duplica; `concluida_em` é a hora do servidor; RLS; o cliente só insere `id` e `minutos`).
  - Sem internet, o bloco fica guardado no navegador e é reenviado depois.
  - Se a tabela ainda não existir, o app carrega normalmente (os minutos de foco vêm vazios).
- Revisão final do Impeccable: "fix" com 7 correções, todas aplicadas (área de toque dos links, Desfazer ao encerrar, estado no atalho da barra, rótulos, setinhas dos campos, contrato atualizado).

Próximo:
- (Feito) Migration `focus_sessions` aplicada e página publicada (anônimo recebe 401 na tabela).
- Testar no celular real: o aviso de fim de fase com a tela bloqueada, e o Spotify logado.
- Limitação conhecida: com a aba escondida há muito tempo, o navegador pode atrasar o aviso em até cerca de 1 minuto; no iPhone o aviso com o app fechado não é garantido.

### 2026-09-11, Claude Code (Opus 5): acabamentos 2 a 6 (antes destinados ao Antigravity)
Feito (o usuário decidiu não passar ao Antigravity):
- "Perfil salvo." em Muted, não mais em verde (verde só para XP, nível e conclusão).
- Gaveta do celular: o foco fica preso nela enquanto está aberta. Tab e Shift+Tab dão a volta pelos controles visíveis.
- Anel do check vazio: `--check-ring` passou de `#6a6e7c` para `#7a7e8c`. Agora tem pelo menos 3:1 em todo fundo de card: 4,2:1 no Panel, 3,7:1 no Panel Two e 3,3:1 no Rule, que é o hover do Kanban.
- Animação do check: um único `@keyframes check-in` em `index.css` (escala 1,2, 0,45s), usado no app e na demo do login. Antes havia duas definições com o mesmo nome, e uma sobrescrevia a outra.
- Brief `.impeccable/surfaces/src-pages-tarefas-jsx.md` reescrito para a tela atual: sem trilho, com filtro, Kanban com colunas, capas e densidade.
- DESIGN.md atualizado nos pontos acima, sem mais menções ao trilho removido nem ao nome "Quadro".
- `.impeccable/design.json`:
  - `check-ring` atualizado;
  - componente "Category Rail" removido;
  - textos de trilho e Quadro corrigidos.
- Revisão final do Impeccable: as correções de documentação que ela pediu foram aplicadas.

Próximo:
- Publicar (push) quando o usuário autorizar.
- `.impeccable/design.json`: o componente "Task Row" ainda descreve as linhas antigas, separadas por fio dentro de um painel. A sincronização completa com o DESIGN.md (capas, densidade, Kanban) continua pendente.

### 2026-09-11, Claude Code (Opus 5): densidade (tela menos poluída)
Feito (pedido do usuário: fonte um pouco menor, cards menores e mais juntos, menos poluição; passou pelo Impeccable antes e depois, distill + revisão final):
- Lista sem painel em volta dos cards (era card dentro de card); o mesmo em Calendário Dia e Linha do tempo.
- Cards mais baixos:
  - título 0,9375rem;
  - capa de 0,375rem na Lista e 0,875rem no Kanban;
  - 0,375rem entre cards;
  - check visível de 1,3rem (a área de toque continua 44px).
- Etiquetas e selos de prazo menores (1,25rem de altura, texto 0,75rem). O fundo do selo agora é translúcido e aparece igual no card da Lista, no do Kanban e no hover.
- Título da página 1,625rem (1,375rem no celular). Barra superior e faixa de aviso mais baixas.
- Kanban: cards em Panel Two dentro das colunas, colunas de 15,5rem, menos espaço entre check e título.
- Celular: na Lista o prazo desce para baixo do título, como no Kanban, e os títulos quebram menos. No toque a etiqueta não alterna nome/cor (curta demais para acertar); o toque abre a tarefa.
- Código morto removido: `Trilho.jsx`, textos `t.trilho`, a visão `Quadro` antiga e o CSS de trilho/quadro. A classe `.trilho__nova` virou `.acao-nova`.
- DESIGN.md atualizado com as novas medidas. Capturas antes/depois em `.impeccable/review/densidade/`.

Próximo:
- Publicar (push) quando o usuário autorizar.
- `.impeccable/design.json` ainda não foi sincronizado com o DESIGN.md.
- A revisão sugeriu limitar a largura da Lista em telas muito largas (o selo de prazo fica longe do título a 1440px). Ficou de fora porque o usuário pediu tarefas em largura total.

### 2026-09-11, Antigravity + Claude Code: área de toque de 44px no celular
Feito:
- Antigravity (commits `655895f` e `45cce7f`): em telas de até 60rem, subiu para 44px os controles tocáveis. São eles: filtro segmentado, chips do filtro e das tags, botão "Filtrar", botão compacto, "⋯" das colunas do Kanban e o × dos avisos.
- Claude Code conferiu os commits e corrigiu:
  - a largura das setas do calendário (estavam 36×44, agora 44×44);
  - o commit do `calendario.css`, que tinha ficado de fora;
  - esta entrada, que tinha entrado no meio da sessão do Kanban;
  - um comentário deslocado em `tarefas.css`.

Próximo:
- Acabamentos que faltam para o Antigravity (itens 2 a 6 da lista):
  - "Perfil salvo." sem verde;
  - prender o Tab na gaveta do celular;
  - contraste do círculo do check;
  - igualar a animação do check;
  - brief de Tarefas sem o trilho.

### 2026-09-11, Claude Code (Opus 5): Kanban com colunas próprias e coloridas
Feito:
- "Quadro" virou **Kanban**. Pendentes vem primeiro, depois as colunas criadas pelo usuário, e Concluídas por último.
- Pendentes e Concluídas são fixas: dá para renomear e colorir, mas não mover nem excluir.
- As colunas do usuário:
  - são criadas no "+ Nova coluna";
  - pela janela "⋯" dá para editar o nome e a cor ("Sem cor" ou uma das 8 cores), trocar a posição com a vizinha e excluir. Ao excluir, as tarefas voltam para Pendentes.
- **A coluna colorida ganha o tom inteiro** (cor a 22% no fundo, 45% na borda); o card mantém a capa da categoria.
- Mover tarefas:
  - arrastar para qualquer coluna muda a coluna;
  - soltar em Concluídas conclui com XP, sem volta;
  - no celular e no teclado, use o campo "Coluna no Kanban" no formulário da tarefa.
- No Kanban o selo de prazo fica na linha da categoria, para o título usar o card todo.
- Migration `20260911200000_kanban_colunas`:
  - tabela `board_columns` com RLS; uma Pendentes e uma Concluídas por usuário, por índice único; só as colunas do usuário podem ser excluídas;
  - coluna `tasks.column_id` com FK composta (`on delete set null`) e privilégio de escrita.
  - As colunas fixas são criadas pelo app na primeira leitura.
  - **Aplicada em produção** (antes do push). Testado sem login: `board_columns` recusa leitura e gravação (401); `tasks` volta vazio.
- Capturas em `.impeccable/review/kanban/`. DESIGN.md com a seção Kanban.
- Revisão final do Impeccable ("fix"), 8 correções aplicadas:
  - o selo diz "atrasada · 9 set", e o prazo entra no nome acessível;
  - no Kanban, o selo e o XP ficam na linha da categoria, e a coluna usa tom de 12%;
  - o filtro conta o que a visão mostra;
  - excluir coluna com tarefas pede confirmação;
  - dispensar o aviso de prazos libera o próximo;
  - um só "hoje" (Brasília) para o selo;
  - o erro ao criar as colunas fixas não é mais engolido;
  - o DESIGN.md foi atualizado.
- Deploy (autorizado pelo usuário): migration aplicada, depois push dos commits do calendário, das tarefas em tela cheia e do Kanban.

Próximo:
- Teste do usuário em produção:
  - Categorias e tags;
  - filtro;
  - capas e selos de prazo;
  - aviso de prazos;
  - Kanban (criar e colorir coluna, arrastar, concluir);
  - Calendário.

### 2026-09-11, Claude Code (Opus 5): tarefas em tela cheia, filtro, capas e prazos
Pedido do usuário: tirar categorias e tags da tela de Tarefas, dar a largura toda às tarefas, criar um filtro, pintar os cards (capa como no Trello, pela imagem que ele mandou), destacar os prazos, e melhorar o Kanban com colunas próprias e coloridas. O Kanban fica para a próxima parte, porque precisa de migration.

Feito:
- **Página "Categorias e tags"** (`/categorias`), no menu lateral: categorias (pendentes, editar, nova) e tags (saíram do Perfil). O trilho de categorias saiu da tela de Tarefas, que agora ocupa a largura toda.
- **Filtro** (botão com funil ao lado de "Nova tarefa"):
  - busca pelo nome (e pela descrição, sem diferenciar acentos);
  - categorias e tags, com várias escolhas;
  - prazo: atrasadas, hoje, próximos 7 dias ou sem data.
  - Vale para Lista, Quadro e Calendário. O botão mostra quantos filtros estão ativos e há "Limpar filtros".
  - Com uma categoria só no filtro, ela vira a sugestão da tarefa nova.
- **Capa na cor da categoria** em cada card (faixa no topo e corpo escuro; mais alta no Quadro), no lugar do contorno.
- **Selo de prazo** com relógio:
  - cinza no futuro;
  - âmbar claro até 3 dias antes;
  - âmbar cheio no dia;
  - rosa cheio quando atrasado.
  - Tokens novos `--prazo-perto`, `--prazo-atrasado` e `--on-prazo` em `index.css`.
- **Aviso de prazos** no topo ("Você tem 2 tarefas para hoje e 1 atrasada."), dispensável até o dia seguinte. A fila de avisos virou: streak em risco, depois prazos, depois o convite para instalar. Dispensar o de streak libera o de prazos.
- **Correções da revisão do calendário:**
  - a Linha do tempo mostra os dias anteriores (recolhidos) e as concluídas sem data;
  - títulos da Semana em até 2 linhas;
  - foco do teclado preservado ao trocar de modo;
  - no celular, o dia inteiro é tocável e o leitor de tela diz quantas tarefas o dia tem;
  - a pílula concluída avisa que está concluída;
  - o ano aparece quando a data não é do ano atual;
  - o link direto `?visao=…&modo=…` vale só na abertura;
  - o controle de modos desce quando falta espaço.
- Capturas em `.impeccable/review/tarefas2/`.

Próximo:
- Kanban com colunas próprias e coloridas: migration nova, que precisa de autorização.

### 2026-09-11, Claude Code (Opus 5): visão Calendário nas tarefas
Feito:
- Terceira aba **CALENDÁRIO** em Tarefas, ao lado de Lista e Quadro, com quatro modos (Mês, Semana, Dia, Linha do tempo) no mesmo lugar do filtro da Lista:
  - navegação "‹ Hoje ›" com o período;
  - Mês: grade de domingo a sábado com até 3 pílulas por dia (ponto da categoria + título) e "+n tarefas";
  - Semana: 7 colunas de pílulas;
  - clicar no número do dia abre o modo Dia; clicar numa pílula abre a tarefa;
  - Dia e Linha do tempo usam as linhas da Lista (concluir, voo do XP, etiquetas);
  - Linha do tempo agrupa Atrasadas, Hoje, Amanhã, cada data seguinte e Sem data.
- As tarefas sem data não entram na grade; um aviso leva à Linha do tempo.
- O modo e a visão ficam salvos no navegador; `?visao=calendario&modo=mes|semana|dia|linha` abre direto.
- Celular: o mês mostra só os pontos das categorias e a semana vira lista vertical (container query).
- Código em `src/components/VisaoCalendario.jsx`, `src/components/calendario.css` e `src/lib/calendario.js`. Capturas em `.impeccable/review/calendario/`. DESIGN.md e brief de Tarefas atualizados.
- Sem mudança no banco.

### 2026-09-11, Claude Code (Opus 5): v2, aba Integrações (calendários iCal / Blackboard)
Decidido com o usuário:
- A v2 começa pela integração com o calendário da faculdade (Blackboard Ultra da FAPCE).
- É opcional, numa aba própria. O usuário conectou um link `.ics` **por disciplina**, pelo "Compartilhar calendário" com só aquela disciplina marcada. O arquivo não traz o nome da matéria, então é o link que define a tag.
- Formato real dos eventos: `SUMMARY` (nome da atividade), `DTSTART` com `TZID=America/Fortaleza` (prazo, 23:59) e `UID` (`GradableItem`). Não há descrição nem link da atividade.
- Regras da importação:
  - atividade nova vira tarefa (título, dia do prazo, categoria e tag da fonte);
  - prazo alterado atualiza a tarefa pendente;
  - título só é atualizado se o usuário não o editou;
  - tarefa concluída nunca é mexida; tarefa excluída não volta;
  - vencidas só entram se a opção estiver ligada;
  - a importação roda a cada 3 horas, e há um botão "Atualizar".
- Serve para qualquer link iCal (Moodle, Canvas, Google Agenda).

Feito:
- Migration `20260911180000_integracoes_calendario`:
  - tabelas `calendar_sources` (a url não volta ao navegador, só o domínio) e `calendar_items`, com RLS;
  - `pg_cron` + `pg_net` chamando a função a cada 3 h, autenticados por um segredo gerado no próprio banco (Vault).
- Edge Function `supabase/functions/sincronizar-calendarios`:
  - modos `cron`, `sincronizar` e `previa`;
  - proteção contra endereços internos, limite de 2 MB e 10 s;
  - reserva de cada atividade antes de criar a tarefa, para não duplicar.
- Tela `/integracoes`: lista de calendários com "Atualizar" e "Editar", passo a passo do Blackboard e janela de conectar com "Testar link" (prévia das próximas atividades), categoria, tag (cria a tag com o nome da disciplina) e opção de trazer as vencidas. Ao remover, escolhe manter ou apagar as tarefas pendentes.
- Capturas em `.impeccable/review/integracoes/`.
- Revisão final do Impeccable ("fix"), 8 correções aplicadas antes do deploy:
  - `verify_jwt = false` para a função no `config.toml` (o agendamento não manda JWT; a função confere login e segredo);
  - DNS resolvido e endereços privados recusados antes de cada leitura (SSRF), além de um limite de 10 testes de link a cada 10 min por usuário;
  - agendamento a cada 30 min lendo em lotes só os calendários sem tentativa há 3 h (4 ao mesmo tempo, com prazo);
  - `ultima_tentativa` separada de `ultima_sync`, para a tela mostrar "falhou há…" em vez de "atualizado";
  - a contagem de tarefas ignora as excluídas;
  - importação de cada atividade numa transação só (`importar_atividade`);
  - trocar o link libera uma nova leitura na hora (trigger);
  - categoria e tag da fonte presas ao mesmo usuário (FK composta);
  - remover calendário confirma com a ação de texto, sem botão roxo.

- **Deploy (autorizado pelo usuário):**
  - migrations `20260911180000_integracoes_calendario` e `20260911190000_revogar_execucao_gatilho` aplicadas;
  - função publicada com `npx.cmd supabase functions deploy sincronizar-calendarios --no-verify-jwt --use-api`;
  - push para a `main`.
  - Testado de fora: a função recusa sem login, sem segredo e com segredo errado (401); as tabelas novas recusam o anônimo (401); as funções internas nem aparecem para o anônimo (PGRST202).
- **Avisos do linter de segurança do Supabase:**
  - `handle_new_user` não é mais executável pela API;
  - `concluir_tarefa` fica só para usuários logados, de propósito.
  - A proteção contra senhas vazadas é opção do painel (Authentication → Email) e parece exigir plano Pro. Fica com o usuário.

Próximo:
- Teste do usuário com os links reais das disciplinas.
- Conferir se o agendamento está rodando: no painel, Integrations → Cron → `routinxp-sincronizar-calendarios` → histórico de execuções.

### 2026-09-11, Claude Code (Opus 5): etiquetas estilo Trello e Perfil centralizado
Feito:
- O usuário não gostou dos anéis. As tags viraram **etiquetas como no Trello**, acima do título da tarefa:
  - com nome: pílula na cor da tag, texto claro, contraste acima de 4,5:1 nas 8 cores;
  - só cor: barrinha de 2,5rem.
  - Clicar em qualquer etiqueta alterna todas entre os dois modos, e a escolha fica salva no navegador (`src/lib/tagsCompactas.js`). O clique não abre a tarefa.
- No formulário e no Perfil, a tag é um quadradinho de cor (a categoria continua sendo ponto redondo).
- Página de Perfil centralizada na área de conteúdo, com o menu aberto ou recolhido (desvio medido: 0 px).
- Etiquetas e contorno publicados (push autorizado pelo usuário).
- No celular, a marca RoutinXP fica **centralizada** na barra superior (menu à esquerda, avatar à direita). No computador nada muda.
- A borda de cima virou **contorno completo**: cada tarefa é um card com 1px na cor da categoria nos quatro lados, cantos de 8px, 0,5rem entre os cards. Nas concluídas o contorno fica a 40%.
- DESIGN.md atualizado. Capturas `etiquetas-*.png` em `.impeccable/review/tags/` e `perfil-centralizado.png` em `.impeccable/review/ajustes/`.

### 2026-09-11, Claude Code (Opus 5): descrição, tags e borda de categoria
Feito:
- **Descrição** opcional nas tarefas (até 1000 caracteres), no formulário da tarefa.
- **Tags** do usuário (nome + cor), várias por tarefa:
  - no formulário, botões que ligam e desligam cada tag, com "Nova tag" criada ali mesmo;
  - na lista e no Quadro aparece só a bolinha da cor de cada tag (o nome fica na dica do mouse e no formulário);
  - no Perfil, seção "Tags" para criar, renomear, trocar a cor e excluir (excluir tira a tag das tarefas).
- **Borda superior** de 2px na cor da categoria em cada tarefa (lista e Quadro).
- Migration `20260911120000_descricao_e_tags`:
  - coluna `descricao` em `tasks`;
  - tabelas `tags` e `task_tags` com RLS;
  - privilégios só nos campos de conteúdo;
  - nome de tag único por usuário.
  - **Aplicada em produção.** Acesso anônimo às tabelas novas testado e recusado.
- Capturas em `.impeccable/review/tags/`.
- Revisão final do Impeccable ("fix"), 8 correções aplicadas:
  - tag vira **anel** (a categoria é ponto cheio), na mesma linha da categoria;
  - nomes das tags no nome acessível da tarefa;
  - "Nova tag" como linha simples, sem caixa e sem segundo botão roxo;
  - excluir tag em uso pede um segundo toque;
  - borda apagada em tarefas concluídas;
  - se as tags falharem ao criar a tarefa, tentar de novo edita a mesma tarefa em vez de duplicar;
  - DESIGN.md e brief de Tarefas atualizados.
- Deploy (autorizado pelo usuário): migration aplicada e push para a `main`.

Próximo:
- Teste do usuário: descrição, tags (criar no formulário e no Perfil, excluir em uso) e borda colorida.

### 2026-09-11, Claude Code (Opus 5): ajustes pedidos pelo usuário
Feito:
- "+ Nova tarefa" saiu da barra superior e foi para a linha do título da página de Tarefas, à direita. No celular continua o botão flutuante.
- Botão flutuante "+" também no computador, em todas as páginas (canto inferior direito). Um clique abre direto o formulário de nova tarefa; fora de Tarefas, ele leva a Tarefas com o formulário já aberto. Em Tarefas, o botão do título continua.
- Barra superior virou grade 1fr | auto | 1fr: o medidor de nível fica sempre centralizado (desvio medido: 0 px com o menu aberto e recolhido).
- `DESIGN.md` atualizado. Capturas em `.impeccable/review/ajustes/`.
- Decidido com o usuário: não haverá painel administrativo na v1; a administração é feita pelo painel do Supabase.

### 2026-09-10 (madrugada), Claude Code (Opus 5): passo 12 (PWA)
Feito:
- Manifest, ícones, service worker gerado no build, convite para instalar (Android/computador e iPhone) e aviso sem conexão.
- Capturas em `.impeccable/review/passo12/`.
- Service worker testado offline num build local de produção.

Travou:
- Nada de bloqueio. Com o Edge headless e o user agent de iPhone, o primeiro clique no convite às vezes não abria o diálogo; no navegador do app abriu normalmente.

- Revisão final do Impeccable ("fix"), correções aplicadas, `DESIGN.md` atualizado pelo documentador, push para produção.

Próximo:
- Teste do usuário no celular:
  - instalar (Android pelo convite, iPhone pelo passo a passo);
  - abrir pelo ícone;
  - abrir sem internet.
  - Conferir no iPhone onde fica o Compartilhar no Safari atual.
- Depois da v1: pendências técnicas acima e ideias da v2 (conquistas, temas por nível).

### 2026-09-10 (fim da noite), Claude Code (Opus 5): passo 11
Feito:
- Menu lateral retrátil, página Perfil, campos de perfil no cadastro e lembrete de streak.
- Migration de perfis aplicada em produção.
- Rodada de estrutura do Painel no Impeccable: o usuário gerou imagens no Nano Banana a partir de `.impeccable/mocks/decision/PROMPTS-painel.md` e escolheu a "Linha do tempo do dia".
- Painel construído e capturado em desktop, largura média e celular (`.impeccable/review/passo11/`).
- Revisão final do Impeccable ("fix"), 8 correções aplicadas, `DESIGN.md` atualizado pelo documentador.
- Push para a `main`; a Vercel publicou a versão nova em https://routinxp.vercel.app.

Travou:
- As capturas de celular por iframe no Edge headless ficavam presas em "Carregando". A solução foi um script CDP com viewport real de 390px, que espera os dados antes de capturar.

Depois: o usuário testou e validou o passo 11 em produção.

Próximo:
- Passo 12 (PWA).

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

Até 2026-09-10, salvo indicação. Detalhes em `PRODUCT.md`.

- **Nome do produto: RoutinXP** (usuário).
- **Tela de categorias:** criar, editar e excluir, sem categorias pré-criadas. Categoria com tarefas não pode ser excluída.
- **Confirmação de e-mail ligada;** "Esqueci minha senha" incluído.
- **Visão Kanban** (chamada de Quadro no início) convivendo com a Lista. Arrastar para Concluídas conclui a tarefa. Em 2026-09-11 ganhou colunas próprias e coloridas entre Pendentes e Concluídas.
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
- **Dia do streak, do teto e do bônus:** horário de Brasília (`America/Sao_Paulo`) para todos, decidido no passo 10.
- **Visual:** tema escuro com verde para XP e nível e roxo para ações, na convenção DIO/Duolingo/Habitica, com a fonte Archivo. Roxo nunca marca seleção; seleção é neutra.
- **Estrutura da tela de tarefas:** começou como "Trilho de categorias" (usuário). Em 2026-09-11 o trilho saiu: as tarefas ocupam a largura toda, com filtro, e as categorias e tags ganharam página própria.
- **Deploy contínuo desde cedo** (usuário, passo 5.1 nos documentos): Vercel publica a cada push na `main`.
- **Integrações externas e push** (fora da v1 no escopo) foram liberados pelo usuário na v2: calendários iCal (2026-09-11) e Web Push dos avisos do Foco (2026-09-11).
- **Foco:** o XP vem só das tarefas; o Spotify entra pelo player embutido (sem conectar conta); no fim de cada fase nada começa sozinho (usuário, 2026-09-11).
- **Ideias não agendadas:** ver "Ideias" em Estado atual.
