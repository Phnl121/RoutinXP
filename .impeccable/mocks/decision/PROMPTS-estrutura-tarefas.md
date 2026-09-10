# Prompts para o Nano Banana — estrutura da tela de tarefas (passo 9)

O visual já está decidido (`DESIGN.md`). As três imagens mostram **o mesmo conteúdo** e **o mesmo visual**; só muda a composição da tela. Todos os dados são de exemplo.

**Como usar:** gere em 16:9 (ex.: 1920×1080). Salve **nesta pasta** (`.impeccable/mocks/decision/`) com o nome indicado. As variações de celular são opcionais, em 9:19.5 (ex.: 1080×2340).

---

## Bloco de mundo (já está dentro de cada prompt abaixo)

```
WORLD (fixed design system, do not change): dark gamified learning-platform UI in the style of DIO / Duolingo / Habitica, grown-up, no mascots, no confetti, no illustrations.
- Page background #121318. Panels #1c1d24 with a 1px border #2e3039, 16px corner radius and a soft diffuse drop shadow. Third tone #25262f for tracks and row hover.
- Text #f3f4f7; secondary text #a3a7b3.
- ONLY two accent colors. Green #2bd576 is used ONLY for XP, level and completion: level badge, XP bar fill, completed check circles, "+15 XP" labels. Text on green is dark #0a2616. Purple #8e2de2 is used ONLY for actions: primary buttons (white text) and the active tab underline. Purple text and links use #c28cf6.
- No red anywhere. No gradients except a slightly lighter tip at the leading end of the green XP bar. No glassmorphism, no neon glow.
- Font: Archivo, a sturdy grotesque. Extra-bold (800) and slightly wide for the wordmark, headings and the level badge. Regular or semibold for rows. Small uppercase letter-spaced labels. All numbers tabular.
- Level badge: green pill, dark text "NÍVEL 4". XP bar: 8px pill track #25262f with a green fill at 36%, "XP 90 / 250" on the left above it and "faltam 160 XP" on the right in #a3a7b3.
- Tabs: uppercase, letter-spaced, 800 weight; the active one is #f3f4f7 with a 3px purple #8e2de2 underline, the inactive one is #a3a7b3.
- Task rows are NOT cards. They are rows inside a panel, separated by 1px #2e3039 lines. Each row: a 24px circle check (gray ring #454856 when pending, filled green #2bd576 with a dark check mark when completed), the title (semibold), and under it a small 8px colored dot plus the category name in #a3a7b3, and the due date on the right in #a3a7b3. Completed rows: title in #a3a7b3 with a strike-through, and a green "+10 XP" or "+15 XP" on the right.
- Category colors appear ONLY as small 8px dots beside the category name, never as fills: Faculdade #6c9be8, Trabalho #e0a050, Vida Pessoal #e27d8f, Projetos Pessoais #5fc4c0.
- Wordmark "Routin" in white, extra-bold, top-left.
- Language: Brazilian Portuguese; every text legible and spelled exactly as written. Flat UI screenshot, straight-on, no device frame, no perspective, no people.
```

## Conteúdo comum (já está dentro de cada prompt)

```
CONTENT (synthetic demo data):
- User: initials "AS", name "Ana Souza", NÍVEL 4, XP 90 / 250, XP total 540, streak atual "6 dias", streak recorde "14 dias".
- Categories with counts: Faculdade (3 pendentes), Trabalho (2), Vida Pessoal (1), Projetos Pessoais (0), plus a link "+ Nova categoria".
- PENDENTES (6):
  Faculdade: "Entregar relatório de Cálculo II" · 12 set; "Estudar capítulo 4 de Estatística" · 16 set; "Responder e-mail do orientador" · 11 set
  Trabalho: "Revisar slides da reunião de sexta" · 13 set; "Enviar planilha de horas" · sem data
  Vida Pessoal: "Pagar conta de luz" · 15 set
- CONCLUÍDAS (4): "Academia às 19h" · Vida Pessoal · +15 XP; "Ler artigo sobre UX" · Projetos Pessoais · +10 XP; "Resumo de Direito Civil" · Faculdade · +15 XP; "Atualizar README do portfólio" · Projetos Pessoais · +10 XP
- Primary purple button "+ Nova tarefa".
```

---

## 1. Três colunas, estilo DIO → salvar como `estrutura-tres-colunas.png`

```
Flat UI screenshot of a desktop web app called "Routin", 16:9.

WORLD (fixed design system, do not change): dark gamified learning-platform UI in the style of DIO / Duolingo / Habitica, grown-up, no mascots, no confetti, no illustrations. Page background #121318. Panels #1c1d24 with a 1px border #2e3039, 16px corner radius and a soft diffuse drop shadow. Third tone #25262f for tracks and row hover. Text #f3f4f7; secondary text #a3a7b3. ONLY two accent colors: green #2bd576 ONLY for XP, level and completion (level badge, XP bar fill, completed checks, "+15 XP" labels; text on green is dark #0a2616); purple #8e2de2 ONLY for actions (primary buttons with white text, active tab underline); purple text #c28cf6. No red, no gradients except a slightly lighter tip on the green XP bar, no glassmorphism, no neon. Font Archivo: extra-bold slightly wide for wordmark, headings and level badge; semibold rows; small uppercase letter-spaced labels; tabular numbers. Task rows are NOT cards: rows inside a panel separated by 1px #2e3039 lines, each with a 24px circle check, semibold title, small 8px category dot plus category name in #a3a7b3 below, due date on the right. Category dots only: Faculdade #6c9be8, Trabalho #e0a050, Vida Pessoal #e27d8f, Projetos Pessoais #5fc4c0. Brazilian Portuguese, all text legible and exactly as written. Straight-on, no device frame, no people.

LAYOUT (three columns, like the DIO feed page):
- Top bar full width, background #0d0e12 with a bottom 1px line #2e3039: left the wordmark "Routin"; right a purple button "+ Nova tarefa" and a small circle avatar "AS" with a green ring.
- LEFT column (about 25% width): a profile panel. A 48px circle avatar "AS" with a 2px green #2bd576 ring, the name "Ana Souza" and a green pill badge "NÍVEL 4". Below: "XP 90 / 250" with "faltam 160 XP" and the green XP bar at 36%. Below a thin divider, two stats side by side in big tabular numbers: "6 dias" labeled "STREAK ATUAL" and "14 dias" labeled "STREAK RECORDE".
- CENTER column (about 50% width): tabs "LISTA" (active, purple underline) and "QUADRO", with a small filter "Pendentes · Concluídas" on the right. Below, one panel with the pending tasks grouped by category: a small uppercase heading per category with its dot ("FACULDADE · 3", "TRABALHO · 2", "VIDA PESSOAL · 1") and the task rows under each heading:
  FACULDADE: "Responder e-mail do orientador" 11 set; "Entregar relatório de Cálculo II" 12 set; "Estudar capítulo 4 de Estatística" 16 set
  TRABALHO: "Revisar slides da reunião de sexta" 13 set; "Enviar planilha de horas" sem data
  VIDA PESSOAL: "Pagar conta de luz" 15 set
- RIGHT column (about 25% width): a panel titled "CATEGORIAS" listing each category with its dot, name and pending count on the right: Faculdade 3, Trabalho 2, Vida Pessoal 1, Projetos Pessoais 0; at the bottom a link "+ Nova categoria" in #c28cf6.

MOOD: calm, focused, motivating; the level and XP always in view.
```

**Celular (opcional, `estrutura-tres-colunas-mobile.png`, 9:19.5):** mesmo mundo. Topo: "Routin" e avatar "AS". Logo abaixo, uma faixa compacta de perfil com o badge "NÍVEL 4", a barra de XP "XP 90 / 250" e "6 dias" de streak. Depois, uma fileira de chips roláveis de categoria (Todas selecionado, Faculdade, Trabalho, Vida Pessoal, Projetos Pessoais), as abas "LISTA | QUADRO" e a lista agrupada por categoria. Um botão roxo redondo "+" fixo no canto inferior direito.

---

## 2. Trilho de categorias → salvar como `estrutura-trilho.png`

```
Flat UI screenshot of a desktop web app called "Routin", 16:9.

WORLD (fixed design system, do not change): dark gamified learning-platform UI in the style of DIO / Duolingo / Habitica, grown-up, no mascots, no confetti, no illustrations. Page background #121318. Panels #1c1d24 with a 1px border #2e3039, 16px corner radius and a soft diffuse drop shadow. Third tone #25262f for tracks and row hover. Text #f3f4f7; secondary text #a3a7b3. ONLY two accent colors: green #2bd576 ONLY for XP, level and completion (level badge, XP bar fill, completed checks, "+15 XP" labels; text on green is dark #0a2616); purple #8e2de2 ONLY for actions (primary buttons with white text, active tab underline, the selected item's left marker); purple text #c28cf6. No red, no gradients except a slightly lighter tip on the green XP bar, no glassmorphism, no neon. Font Archivo: extra-bold slightly wide for wordmark, headings and level badge; semibold rows; small uppercase letter-spaced labels; tabular numbers. Task rows are NOT cards: rows inside a panel separated by 1px #2e3039 lines, each with a 24px circle check, semibold title, small 8px category dot plus category name in #a3a7b3 below, due date on the right. Category dots only: Faculdade #6c9be8, Trabalho #e0a050, Vida Pessoal #e27d8f, Projetos Pessoais #5fc4c0. Brazilian Portuguese, all text legible and exactly as written. Straight-on, no device frame, no people.

LAYOUT (category rail on the left, level meter on top):
- Top bar full width, background #0d0e12 with a bottom 1px line #2e3039: left the wordmark "Routin"; center a compact level meter: green pill "NÍVEL 4" next to a wide XP bar labeled "XP 90 / 250" and "faltam 160 XP", and "6 dias" of streak next to it; right a purple button "+ Nova tarefa" and a circle avatar "AS" with a green ring.
- LEFT rail (about 22% width, full height, panel background #1c1d24, right border 1px #2e3039): uppercase label "CATEGORIAS", then a vertical list: "Todas · 6" (selected: #25262f background with a 3px purple left marker), "Faculdade · 3", "Trabalho · 2", "Vida Pessoal · 1", "Projetos Pessoais · 0", each with its 8px dot; at the bottom "+ Nova categoria" in #c28cf6.
- MAIN area (right, about 78%): heading "Todas as tarefas" in extra-bold; tabs "LISTA" and "QUADRO" with "QUADRO" active (purple underline). Show the QUADRO view: two columns side by side as panels.
  Column "PENDENTES · 6": task rows (no cards, divided by lines): "Responder e-mail do orientador" Faculdade 11 set; "Entregar relatório de Cálculo II" Faculdade 12 set; "Revisar slides da reunião de sexta" Trabalho 13 set; "Pagar conta de luz" Vida Pessoal 15 set; "Estudar capítulo 4 de Estatística" Faculdade 16 set; "Enviar planilha de horas" Trabalho sem data.
  Column "CONCLUÍDAS · 4": completed rows with filled green checks, titles struck through in #a3a7b3, green XP on the right: "Academia às 19h" Vida Pessoal +15 XP; "Ler artigo sobre UX" Projetos Pessoais +10 XP; "Resumo de Direito Civil" Faculdade +15 XP; "Atualizar README do portfólio" Projetos Pessoais +10 XP.
  One pending row is shown mid-drag toward CONCLUÍDAS, slightly lifted with a soft shadow.

MOOD: organized, fast to navigate, the level meter always visible on top.
```

**Celular (opcional, `estrutura-trilho-mobile.png`, 9:19.5):** mesmo mundo. Topo: "Routin", o badge "NÍVEL 4" e uma barra de XP fina em toda a largura. O trilho vira uma fileira de chips roláveis (Todas · 6 selecionado com borda roxa, Faculdade · 3, Trabalho · 2…). Depois, as abas "LISTA | QUADRO" e a coluna "PENDENTES", com "CONCLUÍDAS" acessível deslizando pro lado (mostrar a borda da segunda coluna aparecendo à direita). Botão roxo redondo "+" fixo embaixo à direita.

---

## 3. Barra de adição rápida → salvar como `estrutura-adicao-rapida.png`

```
Flat UI screenshot of a desktop web app called "Routin", 16:9.

WORLD (fixed design system, do not change): dark gamified learning-platform UI in the style of DIO / Duolingo / Habitica, grown-up, no mascots, no confetti, no illustrations. Page background #121318. Panels #1c1d24 with a 1px border #2e3039, 16px corner radius and a soft diffuse drop shadow. Third tone #25262f for tracks and row hover. Text #f3f4f7; secondary text #a3a7b3. ONLY two accent colors: green #2bd576 ONLY for XP, level and completion (level badge, XP bar fill, completed checks, "+15 XP" labels; text on green is dark #0a2616); purple #8e2de2 ONLY for actions (primary buttons with white text, active tab underline, focused input border in #c28cf6); purple text #c28cf6. No red, no gradients except a slightly lighter tip on the green XP bar, no glassmorphism, no neon. Font Archivo: extra-bold slightly wide for wordmark, headings and level badge; semibold rows; small uppercase letter-spaced labels; tabular numbers. Task rows are NOT cards: rows inside a panel separated by 1px #2e3039 lines, each with a 24px circle check, semibold title, small 8px category dot plus category name in #a3a7b3 below, due date on the right. Category dots only: Faculdade #6c9be8, Trabalho #e0a050, Vida Pessoal #e27d8f, Projetos Pessoais #5fc4c0. Brazilian Portuguese, all text legible and exactly as written. Straight-on, no device frame, no people.

LAYOUT (single wide column with a quick-add bar):
- Top bar full width, background #0d0e12 with a bottom 1px line #2e3039: left the wordmark "Routin"; center-right a compact level meter: green pill "NÍVEL 4", XP bar "XP 90 / 250" and "faltam 160 XP", then "6 dias" streak; far right a link "Categorias" in #c28cf6 and a circle avatar "AS" with a green ring.
- Below, centered in a column about 70% of the page width: a large quick-add bar as one panel, 56px tall: an input with the placeholder "Nova tarefa…" (the input border is focused #c28cf6), then inside the same bar two small selector chips "● Faculdade" (with its blue dot) and "12 set" (calendar), then a purple button "Adicionar".
- Under it: tabs "LISTA" (active, purple underline) and "QUADRO", with a small filter "Pendentes · Concluídas" at the right.
- Then one wide panel with the pending tasks grouped by category, each group with a small uppercase heading and dot ("FACULDADE · 3", "TRABALHO · 2", "VIDA PESSOAL · 1") and rows:
  FACULDADE: "Responder e-mail do orientador" 11 set; "Entregar relatório de Cálculo II" 12 set; "Estudar capítulo 4 de Estatística" 16 set
  TRABALHO: "Revisar slides da reunião de sexta" 13 set; "Enviar planilha de horas" sem data
  VIDA PESSOAL: "Pagar conta de luz" 15 set
  One row shows hover state: background #25262f, check ring turned green, and small "Editar" and "Excluir" text actions on the right in #a3a7b3.

MOOD: fast, keyboard-first, uncluttered; adding a task feels instant.
```

**Celular (opcional, `estrutura-adicao-rapida-mobile.png`, 9:19.5):** mesmo mundo. Topo: "Routin", o badge "NÍVEL 4" e uma barra de XP fina. As abas "LISTA | QUADRO" e a lista agrupada por categoria ocupam a tela. A barra "Nova tarefa…" fica fixa embaixo, perto do polegar, com os chips de categoria e data e um botão roxo de enviar em forma de seta.
