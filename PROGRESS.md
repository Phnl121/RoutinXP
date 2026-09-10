# Progresso — App de Rotina (Routin)

Este arquivo é o ponto de handoff entre ferramentas (Code, Antigravity, ou qualquer outra). Toda sessão de trabalho começa lendo isto e o `escopo-mvp-v1.md`, e termina atualizando isto antes de encerrar ou trocar de ferramenta.

## Estado atual
(a ferramenta que estiver trabalhando atualiza esta seção a cada sessão: o que existe, o que está funcionando, o que está pela metade)

Atualizado em 2026-09-10 (Claude Code).

- Repositório git inicializado: **sim**. Branch `main`, identidade local `Pedro <pedrocybernet01@gmail.com>`. `.gitignore` cobre `node_modules`, `dist`, `.env*`, `supabase-credentials.txt`, `Claude outputs/`.
- Projeto Vite criado: **sim**. React 19 + Vite 8, JavaScript (não TypeScript), `react-router` e fonte Archivo (`@fontsource-variable/archivo`). Node 24 LTS instalado via winget em `C:\Program Files\nodejs` (pode não estar no PATH do shell; `.claude/launch.json` chama `node.exe` direto).
- Supabase client: **sim**. `src/lib/supabase.js` lê `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` do `.env` (fora do git; modelo em `.env.example`). `supabase-credentials.txt` foi apagado.
- Schema Supabase (categories, tasks, user_stats) rodado: **sim, confirmado** via API. Arquivo `schema.sql`. RLS ativo nas 3 tabelas; um trigger cria a linha de `user_stats` no cadastro.
- Configuração de URLs do Supabase Auth (Site URL `http://localhost:5173` e Redirect URLs): **feita pelo usuário**.
- Plugin Impeccable: **disponível** (v4.3.1). Contexto em `PRODUCT.md`, sistema visual em `DESIGN.md` e `.impeccable/design.json`, contrato de direção em `.impeccable/surfaces/src-app-jsx.md`.
- Auth (login/cadastro): **pronto** e aprovado na revisão final do Impeccable (disposição "ship").
  - Entrar, criar conta (termina em "confira seu e-mail"), esqueci minha senha e redefinir senha (`/redefinir-senha`).
  - Erros em pt-BR (`src/lib/authErrors.js`).
  - A tela de login tem uma demonstração interativa de XP e nível, que não salva nada.
  - `/` mostra uma página provisória (`src/pages/Inicio.jsx`) até o passo 9.
- CRUD de tarefas: não iniciado (passo 9).
- Tela de categorias: não iniciada (passo 9, adicionada ao escopo).
- Visão Quadro (Kanban): não iniciada (passo 9, adicionada ao escopo).
- Lógica de XP/streak: não iniciada (passo 10). Vai ser uma função no banco e vai exigir um segundo SQL rodado manualmente no SQL Editor.
- Dashboard e card de perfil: não iniciados (passo 11).
- PWA: não iniciado (passo 12).

**Aguardando:** OK do usuário no visual do login para começar o passo 9.

**Pendências técnicas conhecidas (resolver no passo 9):**
- Cores fixas no código em vez de variáveis: fundo da top bar `#0d0e12`, ponta clara da barra de XP `#8af5b5`, valores `rgb()` dos brilhos roxo e verde. Isso atrapalha a ideia de temas.
- O detector do Impeccable aponta 4 valores fora do DESIGN.md: font-size `0.9375rem` (`demo.css`), `0.625rem` (`index.css`), `clamp(1.875rem, 8vw, 2.5rem)` (`auth.css`) e border-radius `3px` (`auth.css`).

## Log de sessões (mais recente primeiro)
Cada entrada: data, ferramenta usada, o que foi feito, o que travou, o que fazer a seguir.

### 2026-09-10, Claude Code (Opus 5)
Feito:
- Passos 1 a 8 do prompt inicial.
- `PRODUCT.md` criado com o `/impeccable init`.
- Direção visual decidida em três rodadas pelo Impeccable. As duas primeiras foram recusadas; a terceira seguiu a convenção de plataforma gamificada, com a DIO como referência.
- Login/cadastro gamificado construído, revisado pelo revisor do Impeccable (8 correções aplicadas, verdict "ship") e documentado no `DESIGN.md`.
- App renomeado para Routin.
- Removida a promessa "cada tarefa vale 10 XP".

Travou:
- Node.js não estava instalado. Foi instalado via winget.
- O git não tinha identidade. Foi configurada só no repositório.
- O SQL precisou ser rodado manualmente, porque não há CLI nem chave de serviço.

Próximo:
- Passo 9: lista de tarefas agrupada por categoria, Quadro com Pendentes/Concluídas, criar/editar tarefa e tela de categorias.
- Seguir o `DESIGN.md` e passar pelo Impeccable antes e depois.
- Resolver as pendências técnicas acima.

## Decisões tomadas fora do escopo.md
(qualquer decisão de implementação que não estava prevista no escopo original, pra não se perder entre ferramentas)

Todas em 2026-09-10. Detalhes em `PRODUCT.md`.

- **Nome do produto: Routin** (usuário). A pasta e o repositório continuam "App - Rotina".
- **Tela de categorias** para criar, editar e excluir (usuário). Nenhuma categoria vem pré-criada, então o primeiro acesso precisa levar o usuário a criar uma. Uma categoria que ainda tem tarefas não pode ser excluída (FK `on delete restrict`), e a interface precisa explicar isso.
- **Confirmação de e-mail ligada** (usuário).
- **"Esqueci minha senha"** incluído, com link por e-mail e tela de nova senha (usuário).
- **Visão Quadro (Kanban)** convivendo com a lista, com alternância Lista/Quadro (usuário).
  - As colunas são por status: Pendentes e Concluídas.
  - Arrastar para Concluídas conclui a tarefa.
  - Em aberto: voltar uma tarefa concluída para Pendentes não é permitido na v1, porque teria que descontar XP.
- **Níveis** calculados a partir do `xp_total`, sem coluna nova (usuário pediu níveis; a curva foi decidida pelo Claude e pode ser ajustada). A curva: 100 XP para o nível 2, e cada nível seguinte pede 50 a mais. Está em `src/lib/nivel.js`.
- **Card de perfil** só dentro do app, nunca no login (usuário).
- **Sem ranking e sem conquistas** na v1 (usuário).
- **XP por tarefa ainda não definido** (usuário). Substitui o "XP fixo" do escopo; tarefas podem valer mais ou menos.
  - A coluna `xp_value` já guarda o valor de cada tarefa (padrão 10).
  - Nenhum texto da interface pode prometer um valor fixo.
- **XP e streak gravados só pelo servidor.** `user_stats` não tem policy de insert/update pro cliente. O cálculo vai ser uma função SQL no passo 10.
- **Em aberto para o passo 10:** qual fuso define o "dia" do streak (sugestão: `America/Sao_Paulo`).
- **Visual** (usuário): convenção de plataforma gamificada, com a DIO como referência e Duolingo e Habitica como régua de acabamento.
  - Tema escuro com dois destaques: verde para XP e nível, roxo para ações.
  - Fonte Archivo.
  - Cores de categoria aparecem só como um ponto ao lado do nome.
- **Ideia não agendada: temas desbloqueados por nível** (usuário). As cores já estão em variáveis CSS para permitir isso depois.
