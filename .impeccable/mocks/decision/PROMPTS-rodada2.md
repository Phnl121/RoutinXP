# Prompts para o Nano Banana — rodada 2

Novo sorteio: nenhuma direção da rodada 1 volta. As três telas têm **o mesmo conteúdo** da rodada 1 (visão Quadro, desktop 16:9), pra comparação justa.

**Como usar:** gere em 16:9 (ex.: 1920×1080) e salve **nesta pasta** (`.impeccable/mocks/decision/`) com o nome indicado.

As cores das categorias aparecem **só como um ponto pequeno ao lado do nome**:
Faculdade `#4A6FA5` · Trabalho `#5E8C6A` · Vida Pessoal `#B0674E` · Projetos Pessoais `#7A68A6`

---

## 1. Placar de ginásio → salvar como `placar.png`

```
Flat UI screenshot of a desktop web app called "Rotina", 16:9, straight-on, no device frame, no perspective, no people, no balls, no sports illustrations, no mascots, no confetti. Language: Brazilian Portuguese, all text legible and spelled exactly as written.

WORLD: a Brazilian school gym (quadra poliesportiva) during an inter-class tournament, rendered as a calm, precise interface. The page is a light, matte court floor #F1F1EE. ALL rules and dividers are hairlines (1px) in #141518 at low opacity, like painted court markings; NO rounded corners anywhere, every box is square-cornered. Text near-black #141518; secondary text #6A6E75. The ONLY dark element on the whole screen is the scoreboard: a matte black #141518 electromechanical scoreboard panel at the top, whose digits are made of individual round lamp bulbs in a dot-matrix grid, lit in warm amber #FFB23F (unlit bulbs faintly visible as dark gray dots). Amber #FFB23F appears ONLY in the scoreboard bulbs and one small marker on the active row. No other colors except tiny category dots.

TYPOGRAPHY: a condensed, sturdy grotesque in uppercase for labels (like stenciled scoreboard labels), a clean neutral sans for task titles, all numbers tabular.

LAYOUT:
- Thin top bar on the light floor: left "Rotina" wordmark in condensed caps; center a square-cornered segmented toggle "LISTA | QUADRO" with "QUADRO" pressed (looks physically pushed in); right a square black button "+ NOVA TAREFA" with white text.
- The SCOREBOARD panel, full content width, below the top bar: on the left the big amber bulb-matrix number "1240" with a white condensed label "XP" and a small white caption "XP TOTAL"; on the right two smaller bulb readouts: "06" labeled "SEQUÊNCIA" (streak atual, in days) and "14" labeled "RECORDE" (streak recorde).
- Below, two square-cornered columns drawn like official match score sheets (súmulas): ruled rows, a narrow numbered left margin, column headers in condensed caps.
  LEFT "PENDENTES · 6": rows with row number, task title, category dot + name, due date. The first row has a small amber marker at its left edge (active row):
    01 Responder e-mail do orientador · Faculdade · 11 set
    02 Entregar relatório de Cálculo II · Faculdade · 12 set
    03 Revisar slides da reunião de sexta · Trabalho · 13 set
    04 Pagar conta de luz · Vida Pessoal · 15 set
    05 Estudar capítulo 4 de Estatística · Faculdade · 16 set
    06 Atualizar README do portfólio · Projetos Pessoais · sem data
  RIGHT "CONCLUÍDAS · 4": same ruled structure, each row ending with a handwritten-style tally mark and "+10" in near-black ink (not amber):
    01 Academia às 19h · Vida Pessoal · +10
    02 Ler artigo sobre UX · Projetos Pessoais · +10
    03 Enviar planilha de horas · Trabalho · +10
    04 Resumo de Direito Civil · Faculdade · +10
    Next to the last row, a thin hairline leader line rises from "+10" toward the scoreboard.

MOOD: calm, precise, school-gym nostalgia for grown-ups, a quiet sense of scoring points. Mostly light floor with one dark scoreboard block. No gradients, no glassmorphism, no neon glow halos, no red.
```

**Variação login (opcional, `placar-login.png`):** mesmo mundo e cores. No alto, o placar preto #141518 com "0000" em lâmpadas âmbar #FFB23F apagadas pela metade e "BEM-VINDO" em lâmpadas. Abaixo, no piso claro #F1F1EE, uma súmula de cantos retos como formulário: rótulos em caixa alta condensada "E-MAIL" e "SENHA" sobre linhas pautadas, botão quadrado preto "ENTRAR", link "Criar conta" e link pequeno "Esqueci minha senha".

---

## 2. Menu de RPG → salvar como `rpg.png`

```
Flat UI screenshot of a desktop web app called "Rotina", 16:9, straight-on, no device frame, no perspective, no characters, no sprites, no swords, no mascots. Language: Brazilian Portuguese, all text legible and spelled exactly as written.

WORLD: the status menu of a 16-bit Japanese RPG, rendered crisp and modern (clean vector, not blurry pixel art). Background deep navy #0F1426. Every panel is a menu window filled with flat navy #1C2547, framed by a double white border #F2F3F7 (outer thin line, small gap, inner thin line) with small square corners. All text white #F2F3F7; secondary text white at 65% opacity. ONE accent color only: soft gold #E6B84C, used ONLY for the XP number and the selection cursor (a small pointing-arrow cursor). No other colors except tiny category dots.

TYPOGRAPHY: a clean, slightly squared sans evocative of RPG menus but fully legible at small sizes, all numbers tabular and right-aligned like stat values.

LAYOUT:
- Top window strip: left "Rotina"; center a menu-style toggle "Lista  ▸Quadro" where the gold arrow cursor points at "Quadro"; right a menu item "+ Nova tarefa".
- A wide STATUS window: "XP" label with the big gold number "1240" right-aligned like a stat; below it two stat lines "Streak atual ........ 6 dias" and "Streak recorde ...... 14 dias" with dotted leaders.
- Two tall menu windows side by side:
  LEFT window titled "Pendentes 6": list items, the gold arrow cursor on the first one; each item shows title, category dot + name, due date right-aligned:
    Responder e-mail do orientador · Faculdade · 11 set
    Entregar relatório de Cálculo II · Faculdade · 12 set
    Revisar slides da reunião de sexta · Trabalho · 13 set
    Pagar conta de luz · Vida Pessoal · 15 set
    Estudar capítulo 4 de Estatística · Faculdade · 16 set
    Atualizar README do portfólio · Projetos Pessoais · —
  RIGHT window titled "Concluídas 4": items in white at 65% with "+10 XP" right-aligned:
    Academia às 19h · Vida Pessoal
    Ler artigo sobre UX · Projetos Pessoais
    Enviar planilha de horas · Trabalho
    Resumo de Direito Civil · Faculdade

MOOD: nostalgic but grown-up, tidy, focused. No gradients inside windows, no glow, no levels, no HP bars, no character portraits.
```

**Variação login (opcional, `rpg-login.png`):** tela de título: fundo navy #0F1426, "Rotina" grande em branco no centro-alto, e uma janela de menu com borda dupla branca contendo os campos "E-mail" e "Senha" e as opções "Continuar" (entrar) e "Novo jogo" (criar conta), com o cursor de seta dourado #E6B84C em "Continuar"; link pequeno "Esqueci minha senha" abaixo.

---

## 3. Painel de palhetas → salvar como `painel.png`

```
Flat UI screenshot of a desktop web app called "Rotina", 16:9, straight-on, no device frame, no perspective, no people, no trains, no buses. Language: Brazilian Portuguese, all text legible and spelled exactly as written.

WORLD: a bus/train station split-flap departure board (painel de palhetas). Background brushed-steel light gray #F5F5F2 as the board frame. The boards themselves are matte black #111214, made of individual split-flap character cells (each letter on its own small black flap with a thin horizontal split line through the middle), letters in white #F5F5F2. Labels and secondary text on the steel frame in gray #9EA3A8 and near-black. ONE accent color only: amber #E8A33D, used ONLY for the XP digits and the small status lamp on completed rows. No other colors except tiny category dots on the steel frame beside each row.

TYPOGRAPHY: one condensed white sans in fixed-width flap cells, uppercase for board content; neutral sans for the app chrome; all numbers tabular.

LAYOUT:
- Top bar on steel: left "Rotina"; center a toggle "LISTA | QUADRO" with "QUADRO" selected; right a black button "+ NOVA TAREFA".
- Header split-flap strip: "XP TOTAL" label and the number "1240" in amber flaps; then "STREAK 06 DIAS" and "RECORDE 14 DIAS" in white flaps.
- Two split-flap boards side by side with column headers "DATA | TAREFA | CATEGORIA":
  LEFT board "PENDENTES 6", rows sorted by date:
    11 SET · RESPONDER E-MAIL DO ORIENTADOR · FACULDADE
    12 SET · ENTREGAR RELATÓRIO DE CÁLCULO II · FACULDADE
    13 SET · REVISAR SLIDES DA REUNIÃO DE SEXTA · TRABALHO
    15 SET · PAGAR CONTA DE LUZ · VIDA PESSOAL
    16 SET · ESTUDAR CAPÍTULO 4 DE ESTATÍSTICA · FACULDADE
    —      · ATUALIZAR README DO PORTFÓLIO · PROJETOS PESSOAIS
  RIGHT board "CONCLUÍDAS 4", each row ending with a small lit amber lamp and "CONCLUÍDA +10":
    ACADEMIA ÀS 19H · VIDA PESSOAL
    LER ARTIGO SOBRE UX · PROJETOS PESSOAIS
    ENVIAR PLANILHA DE HORAS · TRABALHO
    RESUMO DE DIREITO CIVIL · FACULDADE
  One row on the right is caught mid-flip (a few flaps half-turned).

MOOD: orderly, rhythmic, calm station at off-peak hours. No gradients, no glassmorphism, no red.
```

**Variação login (opcional, `painel-login.png`):** um painel de palhetas preto #111214 centralizado sobre o aço #F5F5F2 exibindo "BEM-VINDO AO ROTINA"; abaixo, formulário no aço com campos "E-mail" e "Senha", botão preto "Entrar", link "Criar conta" e link pequeno "Esqueci minha senha". Âmbar #E8A33D só numa lâmpada acesa ao lado de "Entrar".
