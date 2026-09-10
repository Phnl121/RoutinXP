# Prompts para o Nano Banana — direções visuais do App - Rotina

Um prompt por direção. Todos mostram **a mesma tela com o mesmo conteúdo** (visão Quadro, desktop 16:9), pra comparação justa: só muda o mundo visual.

**Como usar:** gere em 16:9 (ex.: 1920×1080). Salve cada imagem **nesta pasta** (`.impeccable/mocks/decision/`) com o nome indicado. A página de decisão aberta no navegador mostra a imagem sozinha quando o arquivo aparece.

As cores das categorias são iguais em todas as direções e aparecem **só como um ponto pequeno ao lado do nome** (poucas cores):
Faculdade `#4A6FA5` · Trabalho `#5E8C6A` · Vida Pessoal `#B0674E` · Projetos Pessoais `#7A68A6`

---

## 1. Álbum de figurinhas → salvar como `album.png`

```
Flat UI screenshot of a desktop web app called "Rotina", 16:9, straight-on, no device frame, no perspective, no people, no mascots, no confetti. Language: Brazilian Portuguese, all text legible and spelled exactly as written.

WORLD: an adult World Cup sticker album (Panini-style), graphic and numbered, restrained. The page is a cool, glossy coated-paper white #F4F4F1 (NOT cream, NOT beige). All text and rules in near-black ink #1A1B1F; secondary text #5C6068. Empty sticker slots are flat light gray #E3E5E8 rectangles with a fine dotted outline #A3A8B0 and a printed slot number. Pasted stickers are pure white #FFFFFF cards with a thin white border, a soft realistic drop shadow (small offset, soft blur) and slightly rounded corners, as if physically glued onto the page. ONE accent color only: metallic gold #C9971C, used in exactly two places: the XP number and the edge glint of the most recently pasted sticker. No other colors except tiny category dots.

TYPOGRAPHY: condensed bold grotesque for numbers and headings, like sticker-album numbering; clean neutral sans for task titles; all numbers tabular.

LAYOUT:
- Top bar: left "Rotina" wordmark in condensed bold; center a segmented toggle "Lista | Quadro" with "Quadro" selected; right a small "+ Nova tarefa" button (black ink, white text).
- Below the top bar, a wide header strip like an album counter: a monumental "1.240" in condensed bold with "XP" next to it in gold #C9971C, caption "XP total · 124 figurinhas coladas". To its right, smaller: "6 dias" with caption "streak atual", and "14 dias" with caption "streak recorde".
- Two columns side by side, each styled as an album page with a heading in condensed caps and a count:
  LEFT "PENDENTES · 6": a grid of 6 empty numbered slots (gray #E3E5E8, dotted outline), each slot showing its number top-left (Nº 125, Nº 126, Nº 127, Nº 128, Nº 129, Nº 130), the task title printed faintly inside, a category dot + category name, and a due date:
    Nº 125 "Entregar relatório de Cálculo II" · Faculdade · 12 set
    Nº 126 "Revisar slides da reunião de sexta" · Trabalho · 13 set
    Nº 127 "Pagar conta de luz" · Vida Pessoal · 15 set
    Nº 128 "Estudar capítulo 4 de Estatística" · Faculdade · 16 set
    Nº 129 "Atualizar README do portfólio" · Projetos Pessoais · sem data
    Nº 130 "Responder e-mail do orientador" · Faculdade · 11 set
  RIGHT "CONCLUÍDAS · 4": 4 white stickers pasted in their slots, same structure but crisp and bold, each with "+10 XP" small in the corner:
    Nº 121 "Academia às 19h" · Vida Pessoal
    Nº 122 "Ler artigo sobre UX" · Projetos Pessoais
    Nº 123 "Enviar planilha de horas" · Trabalho
    Nº 124 "Resumo de Direito Civil" · Faculdade  (this one has the gold edge glint: just pasted)

MOOD: calm, precise, collectible, grown-up. Generous whitespace, thin rules, no gradients, no glassmorphism, no neon.
```

**Variação login (opcional, `album-login.png`):** mesmo mundo e mesmas cores. A tela é a capa do álbum: "Rotina" grande em condensada preta sobre o papel #F4F4F1 e, em destaque, a "ficha do colecionador" como um retângulo branco colado na capa com o título "Este álbum pertence a", campos "E-mail" e "Senha" desenhados como linhas de preencher, botão preto "Entrar", link "Criar conta" e link pequeno "Esqueci minha senha". Dourado #C9971C só num detalhe de brilho da ficha.

---

## 2. Cartão fidelidade de carimbos → salvar como `carimbos.png`

```
Flat UI screenshot of a desktop web app called "Rotina", 16:9, straight-on, no device frame, no perspective, no people, no mascots, no confetti. Language: Brazilian Portuguese, all text legible and spelled exactly as written.

WORLD: a bakery loyalty stamp card ("10 carimbos, 1 prêmio"), restrained. Background a cool light gray #ECEDEF. Every task is a printed white card #FFFFFF with a thin rule, square-ish corners and a subtle realistic shadow. All text in near-black #16171A; secondary text #5F636B. ONE accent color only: rubber-stamp ink blue-violet #3A3FB0, used only for real ink stamps and the XP number. Stamps look like genuine rubber-stamp impressions: slightly rotated (3–8°), uneven ink density, small gaps in the ink, never a clean vector icon. No other colors except tiny category dots.

TYPOGRAPHY: a sturdy, slightly rounded grotesque for the UI; stamps use condensed uppercase letters inside a circular border; all numbers tabular.

LAYOUT:
- Top bar: left "Rotina" wordmark; center segmented toggle "Lista | Quadro" with "Quadro" selected; right "+ Nova tarefa" button (near-black, white text).
- Header like the front of a loyalty card: large "1.240 XP" with "XP" in stamp ink #3A3FB0, caption "XP total"; next to it a row of 10 stamp circles for today, 4 stamped in violet ink and 6 empty dashed circles, caption "hoje"; to the right, smaller "6 dias · streak atual" and "14 dias · streak recorde".
- Two columns side by side, headings "Pendentes · 6" and "Concluídas · 4".
  LEFT cards each have: title, category dot + name, due date, and on the right an EMPTY dashed stamp circle:
    "Entregar relatório de Cálculo II" · Faculdade · 12 set
    "Revisar slides da reunião de sexta" · Trabalho · 13 set
    "Pagar conta de luz" · Vida Pessoal · 15 set
    "Estudar capítulo 4 de Estatística" · Faculdade · 16 set
    "Atualizar README do portfólio" · Projetos Pessoais · sem data
    "Responder e-mail do orientador" · Faculdade · 11 set
  RIGHT cards have the same structure but carry a real violet ink stamp "FEITO +10 XP" over the stamp circle, slightly rotated, title slightly muted:
    "Academia às 19h" · Vida Pessoal
    "Ler artigo sobre UX" · Projetos Pessoais
    "Enviar planilha de horas" · Trabalho
    "Resumo de Direito Civil" · Faculdade

MOOD: tactile, friendly, grown-up, quick. No gradients, no glassmorphism, no neon, no cartoon illustrations.
```

**Variação login (opcional, `carimbos-login.png`):** o cartão fidelidade ainda em branco, centralizado sobre #ECEDEF: "Rotina" no topo do cartão, 10 círculos vazios pontilhados em linha, campos "E-mail" e "Senha", botão quase preto "Entrar", link "Criar conta" e link pequeno "Esqueci minha senha". Um único carimbo violeta #3A3FB0 escrito "BEM-VINDO" batido torto no canto.

---

## 3. Cartão de embarque e painel de portões → salvar como `embarque.png`

```
Flat UI screenshot of a desktop web app called "Rotina", 16:9, straight-on, no device frame, no perspective, no people, no airplanes illustrations. Language: Brazilian Portuguese, all text legible and spelled exactly as written.

WORLD: an airport departure board plus segmented boarding passes, restrained. Background off-white #F6F6F4; panels pure white #FFFFFF with hairline rules #D5D8DC. All text near-black #111418; secondary text and labels #5E6570. ONE accent color only: amber #E09A12, used only for the "EMBARCOU" state and the XP number. No other colors except tiny category dots.

TYPOGRAPHY: a precise neutral grotesque for titles; small uppercase labels above each field like on a boarding pass (e.g. "TAREFA", "CATEGORIA", "PARTIDA", "XP"); all numbers tabular, times and dates aligned in fixed columns.

LAYOUT:
- Top bar: left "Rotina" wordmark; center segmented toggle "Lista | Quadro" with "Quadro" selected; right "+ Nova tarefa" button (near-black, white text).
- Header styled like the top of a boarding pass: large "1.240" with "XP" in amber #E09A12, label "XP TOTAL"; perforation line; then "6 dias" label "STREAK ATUAL" and "14 dias" label "STREAK RECORDE".
- Two columns side by side:
  LEFT heading "PENDENTES · 6", styled as a departures board: fixed-column rows (PARTIDA date | TAREFA | CATEGORIA with dot | XP "10"), sorted by date:
    11 set · Responder e-mail do orientador · Faculdade · 10
    12 set · Entregar relatório de Cálculo II · Faculdade · 10
    13 set · Revisar slides da reunião de sexta · Trabalho · 10
    15 set · Pagar conta de luz · Vida Pessoal · 10
    16 set · Estudar capítulo 4 de Estatística · Faculdade · 10
    — · Atualizar README do portfólio · Projetos Pessoais · 10
  RIGHT heading "CONCLUÍDAS · 4", styled as torn boarding-pass stubs with a perforated edge, each stamped with a small amber label "EMBARCOU +10 XP":
    Academia às 19h · Vida Pessoal
    Ler artigo sobre UX · Projetos Pessoais
    Enviar planilha de horas · Trabalho
    Resumo de Direito Civil · Faculdade

MOOD: orderly, calm, precise, a little travel-document charm. No gradients, no glassmorphism, no neon, no red alert colors.
```

**Variação login (opcional, `embarque-login.png`):** um cartão de embarque em branco centralizado sobre #F6F6F4, com segmentos picotados: "Rotina" no lugar da companhia, campos rotulados "E-MAIL" e "SENHA", botão quase preto "Entrar", link "Criar conta" e link pequeno "Esqueci minha senha". Âmbar #E09A12 só na etiqueta "CHECK-IN".

---

## 4. O padrão da categoria → salvar como `canon.png`

```
Flat UI screenshot of a desktop web app called "Rotina", 16:9, straight-on, no device frame, no perspective, no people, no illustrations. Language: Brazilian Portuguese, all text legible and spelled exactly as written.

WORLD: a clean, well-crafted Trello/Todoist-style productivity board. Background #F9FAFB; cards pure white #FFFFFF with 1px border #E5E7EB, 8px radius and a very soft shadow. Text #111827; secondary text #6B7280. ONE accent color only: indigo #4F46E5, used for the selected toggle, the primary button and the XP number. No other colors except tiny category dots.

TYPOGRAPHY: a clean neutral sans-serif, clear size and weight steps, tabular numbers.

LAYOUT:
- Top bar: left "Rotina" wordmark; center segmented toggle "Lista | Quadro" with "Quadro" selected (indigo); right "+ Nova tarefa" indigo button.
- Header row: "1.240 XP" large with "XP" in indigo, caption "XP total"; then "6 dias · streak atual" and "14 dias · streak recorde".
- Two columns: "Pendentes 6" and "Concluídas 4".
  LEFT cards: round empty checkbox, title, category dot + name, due date:
    "Entregar relatório de Cálculo II" · Faculdade · 12 set
    "Revisar slides da reunião de sexta" · Trabalho · 13 set
    "Pagar conta de luz" · Vida Pessoal · 15 set
    "Estudar capítulo 4 de Estatística" · Faculdade · 16 set
    "Atualizar README do portfólio" · Projetos Pessoais · sem data
    "Responder e-mail do orientador" · Faculdade · 11 set
  RIGHT cards: filled indigo check, title in muted gray, "+10 XP":
    "Academia às 19h" · Vida Pessoal
    "Ler artigo sobre UX" · Projetos Pessoais
    "Enviar planilha de horas" · Trabalho
    "Resumo de Direito Civil" · Faculdade

MOOD: tidy, neutral, professional. No gradients, no glassmorphism.
```

**Variação login (opcional, `canon-login.png`):** card branco centralizado sobre #F9FAFB, "Rotina" acima, campos "E-mail" e "Senha", botão índigo #4F46E5 "Entrar", link "Criar conta" e link pequeno "Esqueci minha senha".
