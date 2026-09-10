# App de Rotina Gamificada — Escopo v1 (MVP)

## Objetivo da v1
Validar o loop núcleo de recompensa (cadastrar → concluir → XP/streak) com um web app único, responsivo, sem depender de integrações externas. Projeto de portfólio, feito com React + Supabase, codado com apoio do Claude Code.

## Fora de escopo na v1 (decidido, não revisitar sem motivo forte)
- Integração com Google Calendar ou qualquer serviço externo
- App nativo separado para celular (o mesmo web app deve funcionar via PWA)
- Relatórios avançados, gráficos históricos complexos
- Notificações push
- Sistema de conquistas/badges elaborado (fica para v2, depois de validar o XP/streak básico)

## Stack
- Frontend: React (Vite)
- Backend/DB/Auth: Supabase (Postgres + Auth prontos, plano free)
- Deploy: Vercel (integra direto com o repositório, URL acessível de qualquer navegador)
- PWA: manifest + service worker no fim do desenvolvimento, não é prioridade de dia 1
- Deploy: contínuo desde cedo, não no final (revisão de uma decisão anterior, ver "Passos" abaixo)

## Modelo de dados (Postgres via Supabase)

**categories**
- id (uuid, pk)
- user_id (fk auth.users)
- nome (text) — ex: Faculdade, Trabalho, Vida Pessoal, Projetos Pessoais
- cor (text, hex)

**tasks**
- id (uuid, pk)
- user_id (fk auth.users)
- category_id (fk categories)
- titulo (text)
- status (enum: pendente, concluida)
- data_prevista (date, opcional)
- xp_value (int, default 10)
- created_at (timestamp)
- completed_at (timestamp, nullable)

**user_stats**
- user_id (fk auth.users, pk)
- xp_total (int, default 0)
- streak_atual (int, default 0)
- streak_recorde (int, default 0)
- ultima_data_conclusao (date, nullable)

## Regras do loop de recompensa (v1, simples de propósito)
- Concluir uma tarefa soma o `xp_value` dela ao `xp_total`.
- Streak incrementa em +1 quando pelo menos 1 tarefa é concluída num dia que ainda não tinha conclusão registrada.
- Streak zera se passar um dia sem nenhuma tarefa concluída.
- XP fixo por tarefa na v1 (não variar por categoria/prioridade ainda — isso é ajuste de v2, só depois de ter dado real de uso).

## Telas mínimas
1. Login/cadastro (Supabase Auth)
2. Lista de tarefas, agrupada por categoria, com filtro de pendente/concluída
3. Criar/editar tarefa (título, categoria, data prevista)
4. Dashboard simples: XP total, streak atual, streak recorde

## Passos para começar (Claude Code)
1. Criar projeto no Supabase, guardar `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
2. Rodar o SQL do modelo de dados acima no editor do Supabase (criar as 3 tabelas + RLS básico por `user_id`).
3. Criar o projeto React com Vite localmente, na pasta do projeto.
4. Abrir essa pasta no Claude Code.
5. Primeiro prompt: configurar cliente Supabase, variáveis de ambiente, tela de login funcionando.
5.1. Assim que o projeto Vite existir e rodar local (mesmo com pouca coisa pronta), conectar o repositório na Vercel e fazer o primeiro deploy. Cadastrar `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` manualmente nas variáveis de ambiente do projeto na Vercel (o `.env` não vai no git, então a Vercel não vê essas variáveis sozinha). A partir daqui, todo commit na branch principal gera deploy automático, não precisa repetir esse passo.
6. Segundo prompt: CRUD de tarefas (criar, listar por categoria, marcar como concluída).
7. Terceiro prompt: lógica de XP e streak disparada ao concluir tarefa, gravando em `user_stats`.
8. Quarto prompt: dashboard com XP/streak.
9. Só no final: PWA (manifest, ícone, "adicionar à tela inicial"). O deploy em si já aconteceu desde o passo 5.1, e continua automático a cada commit.

## Risco a monitorar
Projeto Supabase gratuito pausa automaticamente após 1 semana sem uso. Isso é um ponto real de atrito: se o hábito de mexer no projeto cair, o banco fica pausado e precisa ser reativado manualmente antes de continuar. Vale tratar isso como um sinal de alerta, não só um detalhe técnico.
