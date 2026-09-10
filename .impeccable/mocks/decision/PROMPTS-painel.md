# Prompts para o Nano Banana — Painel (dashboard) do RoutinXP · passo 11

As três imagens mostram **o mesmo conteúdo, o mesmo visual e o mesmo menu lateral**; só muda a composição do Painel. Todos os dados são de exemplo.

**Como usar:** gere em 16:9 (ex.: 1920×1080) e salve **nesta pasta** (`.impeccable/mocks/decision/`) com o nome indicado.

---

## 1. Ficha do jogador → salvar como `painel-ficha.png`

```
Flat UI screenshot of a desktop web app called "RoutinXP", 16:9, straight-on, no device frame, no people, no mascots, no confetti, no illustrations. Brazilian Portuguese, every text legible and spelled exactly as written.

WORLD (fixed design system, do not change): dark gamified learning-platform UI like DIO / Duolingo / Habitica, grown-up. Page background #121318. Panels #1c1d24 with 1px border #2e3039, 16px radius, soft diffuse shadow. Third tone #25262f for tracks and hover. Text #f3f4f7, secondary #a3a7b3. ONLY two accents: green #22C55E only for XP, level, completion and chart bars (dark text #0a2616 on green); purple #7C3AED only for actions (primary buttons, active tab underline, active menu item marker) and purple text #c4b5fd. No red, no gradients except a lighter tip on the green XP bar, no glassmorphism, no neon. Font Archivo: extra-bold slightly wide for headings, badge and big numbers; tabular figures. Category colors only as small 8px dots beside the category name: Faculdade #6c9be8, Trabalho #e0a050, Vida Pessoal #e27d8f, Projetos Pessoais #5fc4c0. Charts: thin bars with 4px rounded tops on the baseline, 2px gaps, recessive gridlines #2e3039, axis labels in #a3a7b3, values in #f3f4f7, one short label on the tallest bar only.

LEFT SIDEBAR (like the Claude desktop app, expanded, 260px wide, background #0d0e12, right border 1px #2e3039): top row with the RoutinXP logo (a dark rounded-square icon with a purple "R" and a green check-arrow, followed by the word "Routin" in white and "XP" in purple) and a small collapse-sidebar icon button on the right. Then a navigation list with outline icons: "Tarefas", "Painel" (active: #25262f background, white text, thin purple marker), "Perfil". At the bottom: a small user row with avatar circle "AS" (green ring), "Ana Souza" and "Nível 5".

TOP STRIP of the main area: a subtle neutral banner panel with a small clock icon: "Você ainda não concluiu nenhuma tarefa hoje. Conclua uma para manter sua sequência de 6 dias." and a purple text link "Ver tarefas".

MAIN AREA — "character sheet" composition:
- Big profile header panel spanning the width: large avatar circle "AS" with green ring, name "Ana Souza" in extra-bold, green pill badge "NÍVEL 5", a wide XP bar "XP 40 / 300" with "faltam 260 XP", and beside it three attribute blocks with big tabular numbers: "740" labeled "XP TOTAL", "6 dias" labeled "STREAK ATUAL", "14 dias" labeled "STREAK RECORDE".
- Below, two panels side by side:
  LEFT "XP por dia · últimos 7 dias": vertical green bar chart, days "seg ter qua qui sex sáb dom" with values 45, 60, 30, 75, 50, 15, 40; a thin dashed horizontal line at 150 labeled "teto diário"; only the tallest bar labeled "75".
  RIGHT "Conclusões por categoria": horizontal green bars sorted descending, each row with its category dot and name: Faculdade 18, Trabalho 14, Vida Pessoal 11, Projetos Pessoais 5; a small line above: "Mais concluída: Faculdade".
- Bottom row of three small stat panels: "48" "TAREFAS CONCLUÍDAS", "9" "NESTA SEMANA", "40 / 150" "XP HOJE".

MOOD: a player's stat sheet, proud but calm.
```

---

## 2. Linha do tempo do dia → salvar como `painel-linha-do-tempo.png`

```
Flat UI screenshot of a desktop web app called "RoutinXP", 16:9, straight-on, no device frame, no people, no mascots, no confetti, no illustrations. Brazilian Portuguese, every text legible and spelled exactly as written.

WORLD (fixed design system, do not change): dark gamified learning-platform UI like DIO / Duolingo / Habitica, grown-up. Page background #121318. Panels #1c1d24 with 1px border #2e3039, 16px radius, soft diffuse shadow. Third tone #25262f for tracks and hover. Text #f3f4f7, secondary #a3a7b3. ONLY two accents: green #22C55E only for XP, level, completion and chart bars (dark text #0a2616 on green); purple #7C3AED only for actions and the active menu item marker; purple text #c4b5fd. No red, no gradients except a lighter tip on the green XP bar, no glassmorphism, no neon. Font Archivo, tabular figures. Category colors only as small 8px dots beside category names: Faculdade #6c9be8, Trabalho #e0a050, Vida Pessoal #e27d8f, Projetos Pessoais #5fc4c0. Charts: thin bars, 4px rounded tops, 2px gaps, recessive gridlines #2e3039.

LEFT SIDEBAR (like the Claude desktop app, expanded, 260px, background #0d0e12, right border #2e3039): RoutinXP logo (dark rounded-square icon with purple "R" and green check-arrow, then "Routin" white + "XP" purple) with a collapse icon button; nav items with outline icons "Tarefas", "Painel" (active), "Perfil"; bottom user row "AS" avatar with green ring, "Ana Souza", "Nível 5".

TOP STRIP: subtle neutral banner: "Você ainda não concluiu nenhuma tarefa hoje. Conclua uma para manter sua sequência de 6 dias." with purple link "Ver tarefas".

MAIN AREA — two columns:
- LEFT (wide, ~62%): a compact level header (green pill "NÍVEL 5", XP bar "XP 40 / 300", "740 XP no total"), then a panel "Sua semana" with a vertical green bar chart of XP per day (seg 45, ter 60, qua 30, qui 75, sex 50, sáb 15, dom 40) and a dashed line at 150 "teto diário", then a panel "Conclusões por categoria" with horizontal green bars: Faculdade 18, Trabalho 14, Vida Pessoal 11, Projetos Pessoais 5 (category dots beside names).
- RIGHT (~38%): a tall panel "Linha do tempo" listing recent completions grouped by day headings ("Ontem", "Terça"), each row: small green filled check, task title, category dot + name, time "19:10", and a green "+15 XP" or "+10 XP" on the right:
  Ontem: "Academia às 19h" · Vida Pessoal · +15 XP; "Ler artigo sobre UX" · Projetos Pessoais · +10 XP; "Resumo de Direito Civil" · Faculdade · +15 XP
  Terça: "Enviar planilha de horas" · Trabalho · +10 XP; "Entregar relatório de Cálculo II" · Faculdade · +15 XP
  Above the list, two small stats: "6 dias STREAK ATUAL" and "14 dias RECORDE".

MOOD: a calm activity log, momentum you can scroll.
```

---

## 3. Faixa de números + gráficos → salvar como `painel-faixa.png`

```
Flat UI screenshot of a desktop web app called "RoutinXP", 16:9, straight-on, no device frame, no people, no mascots, no confetti, no illustrations. Brazilian Portuguese, every text legible and spelled exactly as written.

WORLD (fixed design system, do not change): dark gamified learning-platform UI like DIO / Duolingo / Habitica, grown-up. Page background #121318. Panels #1c1d24 with 1px border #2e3039, 16px radius, soft diffuse shadow. Third tone #25262f for tracks and hover. Text #f3f4f7, secondary #a3a7b3. ONLY two accents: green #22C55E only for XP, level, completion and chart marks (dark text #0a2616 on green); purple #7C3AED only for actions, the active menu marker and the selected period chip; purple text #c4b5fd. No red, no gradients except a lighter tip on the green XP bar, no glassmorphism, no neon. Font Archivo, tabular figures. Category colors only as small 8px dots beside category names: Faculdade #6c9be8, Trabalho #e0a050, Vida Pessoal #e27d8f, Projetos Pessoais #5fc4c0. Charts: thin marks, 2px lines, 4px rounded bar tops, recessive gridlines #2e3039.

LEFT SIDEBAR shown COLLAPSED (like the Claude desktop app collapsed state): a narrow 64px icon rail, background #0d0e12, right border #2e3039: the RoutinXP icon on top (dark rounded square, purple "R", green check-arrow), an expand-sidebar icon button, then three outline icons (tasks list, dashboard chart — active with #25262f background and purple marker, profile person), and the avatar "AS" with green ring at the bottom.

TOP STRIP: subtle neutral banner: "Você ainda não concluiu nenhuma tarefa hoje. Conclua uma para manter sua sequência de 6 dias." with purple link "Ver tarefas".

MAIN AREA — a KPI strip and a 2x2 chart grid:
- Heading "Painel" with a small segmented period control on the right: "7 dias" (selected) | "30 dias".
- KPI strip of five equal panels in one row, each a big tabular number with a small uppercase label: "NÍVEL 5" (green pill) with a thin XP bar "40 / 300" under it; "740" "XP TOTAL"; "6 dias" "STREAK ATUAL"; "14 dias" "RECORDE"; "48" "CONCLUÍDAS".
- 2x2 grid of chart panels:
  top-left "XP por dia": vertical green bars seg 45, ter 60, qua 30, qui 75, sex 50, sáb 15, dom 40, dashed line at 150 "teto diário".
  top-right "Tarefas concluídas por dia": a thin green line with round markers over the same 7 days: 3, 4, 2, 5, 3, 1, 3.
  bottom-left "Conclusões por categoria": horizontal green bars with category dots: Faculdade 18, Trabalho 14, Vida Pessoal 11, Projetos Pessoais 5; caption "Mais concluída: Faculdade".
  bottom-right "No prazo x fora do prazo": a single horizontal stacked bar, green "No prazo 31" and neutral gray #454856 "Sem prazo ou atrasada 17", with labels under it.

MOOD: an analytics overview, dense but tidy.
```
