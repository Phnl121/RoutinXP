---
name: RoutinXP
description: Gamified routine app in a dark learning-platform convention; finish a task, earn XP, level up.
colors:
  ground: "#121318"
  topbar: "#0d0e12"
  panel: "#1c1d24"
  panel-2: "#25262f"
  rule: "#2e3039"
  rule-strong: "#454856"
  check-ring: "#7a7e8c"
  ink: "#f3f4f7"
  muted: "#a3a7b3"
  backdrop: "rgb(6 7 10 / 0.72)"
  qr-fundo: "#ffffff"
  green: "#22c55e"
  green-tip: "#86efac"
  green-wash: "rgb(34 197 94 / 0.1)"
  green-line: "rgb(34 197 94 / 0.35)"
  green-glow: "rgb(34 197 94 / 0.6)"
  on-green: "#0a2616"
  prazo-perto: "#e0a050"
  prazo-atrasado: "#e27d8f"
  on-prazo: "#1d1407"
  purple: "#7c3aed"
  purple-hover: "#8b5cf6"
  purple-soft: "#c4b5fd"
  purple-glow: "rgb(124 58 237 / 0.75)"
  purple-halo: "rgb(124 58 237 / 0.35)"
  purple-selection: "rgb(124 58 237 / 0.5)"
  purple-link-line: "rgb(196 181 253 / 0.4)"
  on-purple: "#ffffff"
typography:
  display:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(2.25rem, 4.2vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 110"
  display-compact:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(1.875rem, 8vw, 2.5rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 110"
  page-title:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 110"
  page-title-compact:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 110"
  wordmark:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 112.5"
  headline:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  stat-figure:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.1
    fontFeature: "'tnum'"
  secret-figure:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    letterSpacing: "0.06em"
    fontFeature: "'tnum'"
  code-entry:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 800
    letterSpacing: "0.3em"
    fontFeature: "'tnum'"
  body-lead:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "'tnum'"
  row-title:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
  meta:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.45
  segment:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
  tab:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 800
    letterSpacing: "0.06em"
  label:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.07em"
  badge:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.06em"
    fontVariation: "'wdth' 112.5"
  xp-figure:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 800
    letterSpacing: "0.02em"
    fontFeature: "'tnum'"
  focus-clock:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "clamp(3.75rem, 11cqi, 6rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 110"
    fontFeature: "'tnum'"
rounded:
  data: "4px"
  row: "8px"
  sm: "10px"
  md: "16px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  2xl: "28px"
  3xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.purple}"
    textColor: "{colors.on-purple}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.purple-hover}"
    textColor: "{colors.on-purple}"
  button-compact:
    backgroundColor: "{colors.purple}"
    textColor: "{colors.on-purple}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  link-button:
    textColor: "{colors.purple-soft}"
    typography: "{typography.meta}"
    padding: "4px 0"
  fab:
    backgroundColor: "{colors.purple}"
    textColor: "{colors.on-purple}"
    rounded: "50%"
    size: "56px"
  icon-button:
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    size: "40px"
  icon-button-hover:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.ink}"
  input:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 15px"
    height: "48px"
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "32px"
  page-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "28px"
  simple-page:
    width: "44rem"
  top-bar:
    backgroundColor: "{colors.topbar}"
    textColor: "{colors.ink}"
    padding: "10px 32px"
  side-menu:
    backgroundColor: "{colors.topbar}"
    textColor: "{colors.muted}"
    padding: "14px 12px"
    width: "16.25rem"
  side-menu-collapsed:
    width: "4.25rem"
  side-menu-drawer:
    backgroundColor: "{colors.topbar}"
    width: "min(18rem, 85vw)"
  side-menu-item:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.row}"
    padding: "0 0.8rem"
    height: "44px"
  side-menu-item-hover:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.ink}"
  side-menu-item-current:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.ink}"
  user-card:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px"
  user-card-hover:
    backgroundColor: "{colors.panel-2}"
  streak-reminder:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.35rem 0.5rem 0.35rem 0.9rem"
  level-pill:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "7px 16px 7px 8px"
  level-pill-skeleton:
    backgroundColor: "{colors.panel-2}"
    rounded: "{rounded.pill}"
    height: "8px"
  account-menu:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px"
  level-badge:
    backgroundColor: "{colors.green}"
    textColor: "{colors.on-green}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
    padding: "5px 10px"
  level-badge-meter:
    backgroundColor: "{colors.green}"
    textColor: "{colors.on-green}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  xp-track:
    backgroundColor: "{colors.panel-2}"
    rounded: "{rounded.pill}"
    height: "8px"
  xp-fill:
    backgroundColor: "{colors.green}"
    rounded: "{rounded.pill}"
    height: "8px"
  segment-well:
    backgroundColor: "{colors.ground}"
    rounded: "{rounded.pill}"
    padding: "3px"
  segment:
    textColor: "{colors.muted}"
    typography: "{typography.segment}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "32px"
  segment-active:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.ink}"
  task-row:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.row-title}"
    rounded: "{rounded.row}"
    padding: "3px 12px 3px 2px"
  task-row-hover:
    backgroundColor: "{colors.panel-2}"
  task-row-kanban:
    backgroundColor: "{colors.panel-2}"
  task-row-kanban-hover:
    backgroundColor: "{colors.rule}"
  deadline-badge:
    textColor: "{colors.muted}"
    rounded: "5px"
    padding: "0 0.4rem"
    height: "1.25rem"
  deadline-badge-today:
    backgroundColor: "{colors.prazo-perto}"
    textColor: "{colors.on-prazo}"
  deadline-badge-overdue:
    backgroundColor: "{colors.prazo-atrasado}"
    textColor: "{colors.on-prazo}"
  tag-label:
    textColor: "{colors.ink}"
    rounded: "{rounded.data}"
    padding: "0 0.4rem"
    height: "1.25rem"
  task-row-xp:
    textColor: "{colors.green}"
    typography: "{typography.xp-figure}"
  task-row-xp-zero:
    textColor: "{colors.muted}"
  xp-flight:
    textColor: "{colors.green}"
    typography: "{typography.xp-figure}"
  task-delete-overlay:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.muted}"
    rounded: "{rounded.row}"
    padding: "6px 10px"
  board-column-target:
    backgroundColor: "{colors.green-wash}"
  chart-bar:
    backgroundColor: "{colors.green}"
    rounded: "{rounded.data}"
    width: "min(2.75rem, 72%)"
  chart-area:
    height: "12rem"
  chart-column-hover:
    backgroundColor: "{colors.panel-2}"
    rounded: "{rounded.row}"
  chart-tooltip:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    padding: "0.35rem 0.55rem"
  category-bar-track:
    backgroundColor: "{colors.panel-2}"
    rounded: "{rounded.data}"
    height: "0.75rem"
  category-bar:
    backgroundColor: "{colors.green}"
    rounded: "{rounded.data}"
  timeline-check:
    backgroundColor: "{colors.green}"
    textColor: "{colors.on-green}"
    rounded: "50%"
    size: "24px"
  timeline-xp:
    textColor: "{colors.green}"
    typography: "{typography.xp-figure}"
  timeline-xp-zero:
    textColor: "{colors.muted}"
  tab:
    textColor: "{colors.muted}"
    typography: "{typography.tab}"
    padding: "4px 0 14px"
  tab-active:
    textColor: "{colors.ink}"
  dialog:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "28px"
    width: "512px"
  color-swatch:
    rounded: "50%"
    size: "36px"
  toast:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "13px 18px"
  toast-level:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "13px 18px"
  notice:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "13px 14px"
  notice-tag:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.pill}"
    padding: "3px 7px"
  avatar:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.ink}"
    rounded: "50%"
    size: "48px"
  avatar-button:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.ink}"
    rounded: "50%"
    size: "40px"
  avatar-menu:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.ink}"
    rounded: "50%"
    size: "36px"
  logo-login:
    height: "2.75rem"
  logo-menu:
    height: "2rem"
  logo-topbar:
    height: "1.875rem"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 20px"
    height: "48px"
  button-outline-hover:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.ink}"
  button-start-focus:
    backgroundColor: "{colors.purple}"
    textColor: "{colors.on-purple}"
    rounded: "{rounded.sm}"
    height: "3.75rem"
    width: "100%"
  checkbox:
    backgroundColor: "transparent"
    rounded: "{rounded.data}"
    size: "1.125rem"
  checkbox-checked:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.data}"
    size: "1.125rem"
  focus-chip:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 0.95rem 0 0.8rem"
    height: "2.5rem"
  focus-chip-hover:
    backgroundColor: "{colors.panel-2}"
  focus-chip-paused:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.muted}"
  focus-page:
    width: "78rem"
  focus-clock-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.focus-clock}"
    rounded: "{rounded.md}"
  focus-clock-paused:
    textColor: "{colors.muted}"
  cycle-pill:
    backgroundColor: "{colors.rule-strong}"
    rounded: "{rounded.pill}"
    width: "1.75rem"
    height: "0.375rem"
  cycle-pill-done:
    backgroundColor: "{colors.ink}"
  task-picker-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    padding: "0.55rem 0.6rem"
    height: "3.25rem"
  task-picker-row-selected:
    backgroundColor: "{colors.panel-2}"
  focus-chart-bar:
    backgroundColor: "{colors.green}"
    rounded: "{rounded.data}"
    width: "min(2.75rem, 72%)"
  admin-page:
    width: "56rem"
  account-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    padding: "0.6rem 0.75rem"
    height: "3.75rem"
  account-row-hover:
    backgroundColor: "{colors.panel-2}"
  state-pill:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "0 0.55rem"
    height: "1.375rem"
  state-pill-strong:
    textColor: "{colors.ink}"
  switch:
    backgroundColor: "{colors.panel-2}"
    rounded: "{rounded.pill}"
    width: "2.75rem"
    height: "1.5rem"
  switch-on:
    backgroundColor: "{colors.ink}"
  admin-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "24px"
  temp-password:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    typography: "{typography.secret-figure}"
    rounded: "{rounded.sm}"
    padding: "1.25rem 1rem"
  qr-tile:
    backgroundColor: "{colors.qr-fundo}"
    rounded: "{rounded.sm}"
    padding: "0.5rem"
    size: "9rem"
  code-field:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    typography: "{typography.code-entry}"
    rounded: "{rounded.sm}"
    height: "48px"
---

# Design System: RoutinXP

## Overview

**Creative North Star: "The Level Always in View"**

RoutinXP follows the gamified learning-platform convention (DIO as the reference, Duolingo and Habitica as the craft bar) rather than an invented world. The system exists to make one moment land: a task is finished, "+n XP" flies to the counter, the number counts up, the bar fills, and on a level change the badge pulses. Everything else is quiet dark chrome that lets that moment be the brightest thing on screen.

Surfaces are a near-black ground with slightly lifted panels, separated by 1px rules. Density is operational, not editorial: rows, fields and meters sit close, labels are small uppercase, and figures are tabular so numbers never jitter while counting. Type is one family, Archivo, pushed to extra-bold and slightly expanded for the headline, page title, wordmark and badges; everything else is plain weight at normal width. Inside the app the level meter lives in the top bar on every screen, which is where the North Star gets its name.

Two accents carry all meaning, and both are taken from the RoutinXP logo (Action Violet and Level Green are the logo's own violet and green). Green is progress (XP, level, fills, completed checks, the completion drop target, the Painel's data). Purple is action (primary buttons, the FAB, the active tab bar, focus, link text). Selection is neutral. Every color is a custom property on `:root` so a later theme can swap the whole set by overriding variables on a `[data-tema]` scope; the system must stay expressible that way.

**Key Characteristics:**
- Dark ground, lifted panels, 1px rules; no nested cards. App chrome (side menu and top bar) sits one step darker than the ground.
- Exactly two accents with fixed jobs: green = XP, level and completion; purple = actions. Selection is neutral.
- Archivo variable, extra-bold and 110-112.5% width for display, page title, wordmark and badges.
- Tabular figures everywhere; XP numbers animate by counting, never by swapping.
- Category color is data: an 8px dot beside the category name, plus the solid cover band on top of every task card (the color picker swatch is the only other fill). Tags are rectangular (labels, bars, swatches), never dots.
- Tasks are flat cards (Panel body, Panel Two in Kanban) set 0.375rem apart, never wrapped in another panel. Due dates are the Deadline Badge: neutral, amber when close, rose once overdue.
- Charts are single-hue green magnitude, directly labeled once, with a table for screen readers.
- Motion is one ease-out curve; reduced-motion collapses it to near zero.

## Colors

A cool, near-black neutral stack with two saturated accents whose roles never overlap. The two accent values are the logo's colors (public/marca), so the brand mark and the interface speak the same violet and green. Translucent effect tokens derive from the accents so glows, washes and halos stay themeable.

### Primary
- **Level Green** (`green`): the progress color. XP fills, the NÍVEL badge (including the one inside the level toast), the avatar ring, completed checks and the check hover ring, earned "+n XP" labels and the flying "+n XP", the "Solte para concluir" drop hint, and the one highlighted phrase in a headline ("Suba de nível."). On the Painel it is every data mark: the XP-per-day bars, the category bars, the timeline's check circles and its earned "+n XP". Text on a green fill always uses **Deep Moss** (`on-green`), never white.
- **Green Tip** (`green-tip`): the lighter leading 0.9rem of the XP fill. Nowhere else.
- **Green Wash** (`green-wash`) and **Green Line** (`green-line`): the completion surfaces. Wash is the fill of the Kanban drop target, the fading flash on a just-completed row, and the login demo's level-up banner; Line is the border of the drop target, of that banner, and of the in-app level toast.
- **Green Glow** (`green-glow`): the transient level-up pulse shadow only.

### Secondary
- **Action Violet** (`purple`): primary and compact button fill, the FAB, the active underline-tab bar. **Violet Lift** (`purple-hover`) is its hover step only.
- **Soft Violet** (`purple-soft`): purple as text or line on dark. Link buttons (including the toast's Desfazer, the reminder's "Ver tarefas" and the install invite's "Instalar"), "+ Nova categoria", the MOSTRAR/OCULTAR field toggle, the focus outline and focused input border, the text caret. Use this, not `purple`, whenever violet must be read as text.
- **Violet Glow** (`purple-glow`), **Violet Halo** (`purple-halo`), **Violet Selection** (`purple-selection`), **Link Line** (`purple-link-line`): effect tokens. The button and FAB glow, the focused-input halo, the `::selection` tint, and the 40% underline on link buttons.
- **On Violet** (`on-purple`): label and icon color on violet fills.

### Tertiary
Deadline status tints (user request, 2026-09-11). They are not accents: they never fill a button, a surface or a chart, and live only in the Deadline Badge and the deadline reminder.
- **Deadline Amber** (`prazo-perto`): a deadline within 3 days (text on an 18% amber wash) or today (solid fill); the clock of the deadline reminder strip.
- **Deadline Rose** (`prazo-atrasado`): the solid fill of an overdue badge, always beside the clock and the date as text.
- **On Deadline** (`on-prazo`): the dark text on a solid amber or rose badge.

### Neutral
- **Top Bar** (`topbar`): the app chrome tier, one step darker than Ground: the sticky top bar and the full-height side menu (and its mobile drawer), so both read as frame rather than as panels. It is also the `theme-color` (index.html and the web manifest), because the top bar is what meets the phone's status bar.
- **Ground** (`ground`): page background, input wells, the segmented-filter well, the temporary-password well, the knob of a switch that is on.
- **Panel** (`panel`): raised containers (form panel, demo panel, Kanban columns, task cards in Lista, Calendário Dia and Linha do tempo, the filter panel, Painel cards, Perfil panels, dialog, account menu, the level pill, the shell strips (offline strip, streak and deadline reminders, install invite)).
- **Panel Two** (`panel-2`): third tier. XP track and skeleton, task card hover (and the card body inside Kanban columns), side-menu item hover and current page, user-card hover, a selected filter chip, the active segment, notice and toast backgrounds, the row's Excluir overlay, avatar fill, the chart column hover, the chart tooltip, the category-bar track, a state pill's fill, a switch track that is off, an account row on hover.
- **Rule** (`rule`): 1px panel borders, row dividers, tab baseline, input border at rest, unselected chip border, the streak divider, the side menu's right edge, the shell strips' border, the chart baseline, the 2px timeline connector, the hairlines between account rows, Registro items and switch rows.
- **Rule Strong** (`rule-strong`): input hover border, notice and toast border, the current side-menu item's inset outline, a selected filter chip's border, the dashed "+ Nova coluna" Kanban slot, the dashed daily-cap line on the XP chart, the chart tooltip border, the share-glyph chip in the iOS install steps, strike-through on completed titles, the destructive text action's underline, the toast time bar, scrollbar thumb, the state pill outline, the border of a switch that is off, the temporary-password well's border.
- **Check Ring** (`check-ring`): the 2px ring of an unchecked completion circle. It exists because Rule Strong fell below 3:1 on Panel. Check Ring holds at least 3:1 (WCAG 1.4.11 non-text contrast) on every surface a card can have: 4.2:1 on Panel, 3.7:1 on Panel Two (hovered row, Kanban card) and 3.3:1 on Rule (hovered Kanban card).
- **Backdrop** (`backdrop`): the scrim behind a modal dialog and behind the open mobile drawer.
- **QR Ground** (`qr-fundo`): the white tile behind the authenticator QR code, and nothing else. It stays light in any theme, because the phone's camera needs dark modules on a light field; a theme may not darken it.
- **Ink** (`ink`): primary text; today and overdue due dates; the fill of the neutral ERRO tag; the selected swatch ring; the chart's one direct value label; the "Mais concluída" line; the track and border of a switch that is on; the "Suspensa" state pill's text.
- **Muted** (`muted`): secondary text, labels, inactive tabs and segments, side-menu items at rest, icon buttons at rest, the shell strips' leading icons (clock, no connection, download), the iOS install step numbers, hints, "faltam n XP", category names, counts, future due dates, chart axis and cap labels, timeline times, the Excluir label, and a completed row's or timeline item's "+0 XP" and "…" (XP pending); state pill text, the knob of a switch that is off, "você" and "último acesso" in the account list.

### Named Rules
**The Two Jobs Rule.** Green means progress and purple means action; neither ever stands in for the other. No green buttons, no purple XP, no third accent. Purple never marks selection: a current side-menu page, a selected chip, segment or swatch is shown with neutrals (Panel Two, Rule Strong, Ink). The single violet indicator is the active underline-tab bar, which marks the current mode. Green is also never spent on something that earned nothing: a "+0 XP" is Muted, and no flight launches for it. The deadline tints (Tertiary) are status, not a third accent: they stay inside the Deadline Badge and the deadline reminder's clock. Administration takes no accent for state: an account's state pills and its feature switches are neutrals (nothing there is progress, nothing is an alarm), and violet stays on the actions.

**The Neutral Error Rule.** Errors are not red. An error is a notice on `panel-2` with a small pill tag in inverted neutrals (ink fill, ground text) reading "ERRO", followed by a plain-language sentence. This keeps the palette to two accents and keeps failure unalarming. Due dates are the one status that takes a tint, and it is not red: the Deadline Badge goes amber when close or today and a soft rose once overdue, always with the clock and the date in words. It holds for reduced rewards: when a completion earns less than usual (task created under 5 minutes ago, the daily XP cap reached or partly reached), an info toast names the reason in a plain sentence, in neutrals, with no tag and no red. And it holds for a streak at risk: the reminder is a Panel strip with a Muted clock, never an alarm. Losing the connection is the same: the offline strip is a Panel strip with a Muted no-connection icon and a plain sentence, no tag, no red.

**The Dot-Only Category Rule.** User-chosen category colors are data. They appear as an 8px round dot beside the category name (filter chips, the Categorias e tags list, row category line, Lista group headings, the Painel's category bars and timeline items), never as fills, text color, bars or backgrounds, and never without the name nearby. Two exceptions: the color picker, where the swatch itself is the choice and fills a 36px circle; and the task card's **cover** in its category color (user request, 2026-09-11, after a Trello reference): a solid band across the top of every task card, 0.375rem tall in Lista, Calendário Dia and Linha do tempo, and 0.875rem in Kanban (density pass, 2026-09-11). The card body is Panel in Lista, Dia and Linha do tempo (Panel Two on hover) and Panel Two inside the Kanban columns (Rule on hover), so the card always sits one step above what holds it. Cards are separated by a 0.375rem gap, never wrapped in another panel. On completed cards the cover fades to 40% of the category color, receding with the rest of the card. The narrow-width Calendário month is the other exception: it shows category dots with no names, because the day opens to the full list with names. **Tags** have their own shape, always rectangular, so a tag is never read as a category (categories are always round dots). On a task row tags are **labels, Trello-style** (user request, 2026-09-11): a row of 4px-radius labels above the title. Named mode: a 1.25rem label, 0 0.4rem padding, 0.75rem at 700 in Ink on the tag color mixed 48% into Panel (55% on hover, the most that keeps Ink above 4.5:1 on all eight colors), ellipsized at 12rem. Color-only mode: a 2.5rem by 0.5rem bar in the full tag color. Clicking any label switches every label between the two modes (saved per browser); it never opens the task. On touch screens the label is too short to tap reliably, so it ignores taps and the tap opens the task; the switch is a mouse affordance. Completed rows show labels at 55% opacity. In the task dialog and the Perfil list a tag is a 0.75rem swatch with 3px corners beside its name.

**The Swappable Theme Rule.** Components read colors only through the `:root` custom properties, effects included (glows, washes, halos, backdrop). A new theme is a new set of variable values, not new component CSS. The only color literals outside `:root` are the category swatch values, which are user data.

## Typography

**Display Font:** Archivo Variable (with Archivo, system-ui, Segoe UI fallback)
**Body Font:** Archivo Variable (same stack)

**Character:** One grotesque carrying everything, split by weight and width. Extra-bold and slightly expanded, it reads as a game UI's scoreboard; at 400-600 and normal width it stays out of the way for rows and forms. Loaded with the weight and width axes (`@fontsource-variable/archivo/wdth.css`).

### Hierarchy
- **Display** (800, clamp 2.25rem to 3.5rem, width 110%, line-height 1.02): the single marketing headline (login). Balanced wrapping. At 60rem and below it uses **Display Compact** (clamp 1.875rem, 8vw, 2.5rem). One phrase may be Level Green when it names the reward.
- **Page Title** (800, 1.625rem, width 110%, line-height 1.1, -0.02em): the one heading of an app screen: the category name or "Todas as tarefas", "Painel", "Perfil". At 60rem and below it drops to **Page Title Compact** (1.375rem). Task card titles are 0.9375rem at 600. Wraps anywhere rather than overflowing long category names.
- **Wordmark** (800, 1.625rem, width 112.5%, line-height 1): "RoutinXP" set in text, kept as a fallback only. The UI never typesets the name; it shows the horizontal logo (see Logo under Components).
- **Headline** (800, 1.5rem, line-height 1.15): titles inside panels, dialogs, empty states and single-task pages (Redefinir senha, Nenhuma tarefa ainda).
- **Stat Figure** (800, 1.5rem, line-height 1.1, tabular): the Painel's streak figures ("6 dias"), set above their Label caption (STREAK ATUAL, RECORDE).
- **Body Lead** (400, 1.0625rem, line-height 1.55, max 46ch, muted): the one supporting paragraph under a display headline.
- **Body** (400, 1rem, line-height 1.45): default; panel prose caps at 44ch at line-height 1.55.
- **Row Title** (600, 1rem, line-height 1.3): task titles and timeline titles, clamped to two lines. Side-menu items use the same weight.
- **Meta** (400, 0.8125rem): counts, hints, timeline times. The task card's meta line (category dot and name) runs 0.75rem. XP-bar secondary text, chart axis labels, the cap label and the user card's level line run 0.75rem.
- **Segment** (700, 0.8125rem): segmented filter labels, sentence case with a " · n" count, or a period ("7 dias").
- **Tab** (800, 0.875rem, 0.06em, uppercase): underline tabs.
- **Label** (700, 0.75rem, 0.07em, uppercase, muted): field labels, field toggles, the filter's group titles, Lista group headings and Kanban column titles (both carry " · n"), Painel card titles and the timeline's day headings (HOJE, ONTEM). The streak caption runs 0.6875rem.
- **Badge** (800, 0.6875rem, width 112.5%, 0.06em, uppercase): NÍVEL pill; 0.8125rem inside the login level meter.
- **XP Figure** (800, tabular): "XP 120 / 150", "+n XP", the top bar's streak figure ("6 dias") and the Painel's "n XP no total".
- **Secret Figure** (800, 1.5rem, 0.06em, tabular, normal width): the temporary password shown once, centered, in groups of four that never wrap inside a group.
- **Code Entry** (800, 1.375rem, 0.3em, tabular, centered): the typed 6-digit verification code. The authenticator key it pairs with runs 0.875rem at 700 with 0.06em, in groups of four that never break inside a group.
- **Focus Clock** (800, clamp(3.75rem, 11cqi, 6rem), sized by its container, width 110%, line-height 1, -0.03em, tabular): the time left on the Foco page's clock and nowhere else. It is the largest type in the app. Ink while running, Muted while paused.

### Named Rules
**The Tabular Rule.** `font-variant-numeric: tabular-nums` is set at the root and stays on; counting XP must never shift its neighbors.

**The Width-for-Rank Rule.** Only display, page title, wordmark and badges use the expanded width axis. Body, rows, side menu, charts, dialogs and forms stay at normal width. The Focus Clock is the one addition: the time on the Foco page reads as a scoreboard figure.

## Layout

**Login.** A 70rem frame, centered, with page padding clamp(1.5rem, 5vw, 3.5rem) vertical by clamp(1rem, 4vw, 2.5rem) horizontal. Two columns: a flexible story column and a fixed 25rem form column, column gap clamp(2.5rem, 7vw, 6rem), row gap 2.25rem. Below 60rem it becomes one 30rem column in the order wordmark, headline, form, demo, and the form panel padding drops from 2rem to 1.5rem. Single-task pages (password reset) use a 26rem centered column with 1.5rem gaps. RoutinXP is invite-only (user decision, 2026-09-13): the form panel has no Entrar / Criar conta tabs. It opens with the Headline "Entrar" and one Muted sentence ("O RoutinXP é por convite…", 1.5rem below), then e-mail, password, the full-width Entrar button and "Esqueci minha senha". Accounts are created by the owner in Supabase. An invite link lands on the password page, which then reads "Crie sua senha" with a "Criar senha" button.

**Account gate.** Between sign-in and the app, every account passes the gate screens, all in the single-task column (26rem, the logo above one Panel padded 2rem, 1.5rem at 44.99rem and below): register the authenticator (first access), type the 6-digit code (every access), then, for an account holding a temporary password, "Crie sua senha". The app shell opens only after them. A failure shows the Headline, the ERRO notice, the primary "Tentar de novo" and the "Sair" link button. While the gate checks, a single Label line shows, as elsewhere.

**App shell.** Two columns at full height: the side menu (16.25rem, or 4.25rem when collapsed; the column width animates over 0.25s) and the content column. The content column stacks the sticky top bar (Top Bar fill, 1px Rule beneath, padding 0.625rem by clamp(1rem, 3vw, 2rem)), the shell strip when one applies (0.75rem below the bar, matching the page's side padding, max 86rem), then the current page. At most one strip shows at a time: offline, the offline strip alone; online, the streak reminder when the streak is at risk, otherwise the deadline reminder when tasks are due today or overdue, otherwise the install invite (mobile only) while the app is installable and not dismissed. On desktop the top bar holds only the level pill and, at the right, the avatar button; the logo lives in the side menu. During a focus session, on any page other than Foco, the focus chip takes the otherwise empty left side (see App Top Bar). The bar is a three-column grid with equal flexible sides (1fr | auto | 1fr), so the level pill is always centered in the bar, whatever sits at either side.

**Tarefas page.** The body is capped at 90rem and centered, padding clamp(1.25rem, 3vw, 2rem) with 6rem at the bottom for the FAB and toast, in **one full-width column** (user request, 2026-09-11). Categories and tags are managed on their own page ("Categorias e tags"); narrowing the tasks happens through the Filter, not a side rail.

**Filter.** A 2.5rem outlined pill button, "Filtrar" with the funnel icon, sits in the title row before the compact "+ Nova tarefa". It shows an Ink count badge when filters are on and toggles (`aria-expanded`) a Panel below the header (1.25rem padding, 1.1rem between groups). The panel holds:
- a search field with the magnifier inside, matching the title and description without regard to accents;
- CATEGORIAS: tag chips with the category dot;
- TAGS: tag chips with the tag swatch;
- PRAZO: single choice among Qualquer, Atrasadas, Hoje, Próximos 7 dias and Sem data;
- a footer over a 1px Rule with the result count in Meta and "Limpar filtros".

The filter applies to Lista, Kanban and Calendário alike; its footer counts what the current view shows (in Lista, "3 pendentes" or "5 concluídas"). With filters on, the page title reads "Tarefas filtradas".

**Deadline Badge.** The due date on every task card is a 1.25rem, 5px-radius badge (0 0.4rem padding) with a 0.75rem clock icon, 0.75rem at 700. Its tinted fills are translucent, so the badge reads the same on a Panel card, a Panel Two Kanban card and a hovered card:
- **future:** Muted on Ink at 7%;
- **within 3 days (including tomorrow):** amber text on amber at 18%;
- **today:** solid amber with dark text;
- **overdue:** solid rose with dark text;
- **no date:** plain Muted "sem data".
The amber and rose come from the `--prazo-perto`, `--prazo-atrasado` and `--on-prazo` tokens.

**Deadline Reminder.** A shell strip like the streak reminder, with the clock in amber: "Você tem 2 tarefas para hoje e 1 atrasada." It links to Tarefas from other pages and can be dismissed until the next day. The strip queue is offline, then the streak reminder, then the deadline reminder, then the install invite, and dismissing one lets the next show.

**Main column (Tarefas).** A title row (page title at the left, the compact "+ Nova tarefa" button at the right, vertically centered), then a controls row: the underline tabs own the baseline; in Lista the segmented filter sits above that baseline at the right, positioned out of flow so switching Lista/Kanban/Calendário never changes the height of the tab row. Content follows 1.5rem below. Kanban is a row of columns (see Kanban).

**Painel.** The same 90rem cap and page padding. Page title, then a grid of a wide column (1.65fr: level panel, XP-per-day card, category card, 1.25rem apart) and a narrow column (1fr: the timeline panel), 1.25rem gap, top-aligned. The grid responds to its own width through a container query, not to the window, because the side menu (open, collapsed or drawer) changes the space: at 58rem of content width and below it becomes one column. Cards pad 1.5rem; the level panel pads 1.25rem by 1.5rem.

**Foco page.** Capped at 78rem and centered, with the Tarefas page padding (6rem at the bottom), 1.25rem between the header and the grid. The header holds the Page Title "Foco" at the left and today's count at the right ("Hoje · 2 focos · 50 min" in 0.875rem at 600, Muted), baseline-aligned and wrapping. Below it is a two-column grid: main at 1.55fr, side at 1fr, gaps of 1.25rem by clamp(1.25rem, 2.5vw, 2rem), top-aligned, with each column stacking its blocks 1.5rem apart. The page has two phases on the same grid:
- **Montar** (setting up): main holds the Intervalos panel, then the session's tasks; side holds Iniciar foco, then Música.
- **Rodar** (running): main holds the clock panel, then Agora (the current task); side holds the queue, then Música.

Música keeps the same slot in both phases, so the player never restarts. The grid responds to its own width through a container query: at 52rem of content width and below it becomes one column, ordered stage (Intervalos or clock), then Iniciar or Agora, then tasks, then music. At 60rem and below the page's link buttons grow to 44px targets. The page stays mounted in the shell while hidden, so the timer and the music carry on across pages.

**Simple pages (Perfil).** One column of panels, max 44rem wide and centered in the content column (it follows the side menu open or collapsed), 1.25rem apart, same page padding. Panels pad 1.75rem (1.25rem at 60rem and below). Field pairs sit in an auto-fit two-column grid (columns at least 9.5rem, 1rem gap) that stacks on its own when narrow.

**Administração.** One column capped at 56rem and centered, with the Tarefas page padding (6rem at the bottom), 1.25rem between blocks. The list page: a title row (Page Title "Administração", the compact "+ Nova conta" at the right), the underline tabs CONTAS | REGISTRO, then the search field (max 24rem) and the account list. The account page: a back link, the header (Page Title name, the e-mail in Muted, the state pills, 0.5rem apart), then the FUNÇÕES and CONTA panels padded 1.5rem (1.25rem at 47.99rem and below). At 47.99rem and below an account row stacks name, pills and last access in one column with the chevron at the right, the search field takes the full width, and each account action takes a full-width row.

**At 60rem and below (single column).** The side menu leaves the grid and becomes an off-canvas drawer; the top bar gains a menu button at the left and the logo centered (equal 1fr sides), keeps the avatar at the right, and wraps the level pill to a full-width second row. "+ Nova tarefa" leaves the Tarefas title row; the FAB (present at every width) remains the create action. On Tarefas the "Filtrar" button stays in the title row (the filter panel stacks its chip groups), and the segmented filter returns to flow under the tabs. The page title drops to 1.375rem; dialog field pairs stack; the toast lifts to clear the FAB; the Painel level panel wraps its XP bar to a full-width second line.

**At 48rem and below.** Kanban columns sit side by side at 86% width and scroll-snap horizontally. In Lista, Dia and Linha do tempo the deadline badge and XP leave the right column and drop to the meta line under the title, as in Kanban, so titles get the card's full width.

**At 30rem and below.** Painel category bars put name and count on one line with the bar full width beneath, so the name is never cut; timeline items move the time onto the category line; the streak figures align left.

Spacing rhythm is a short step scale (8, 12, 16, 20, 24, 28, 32px): 8px between label and input, 20px between form fields, 16px between paired fields, 20px between Painel cards and between Perfil panels, 28px between tabs, 24px demo panel and Painel card padding, 32px form panel padding, 28px dialog and Perfil panel padding. Primary buttons and inputs are at least 48px tall; row check targets and side-menu items are 44px; the compact top-bar button and the menu and collapse buttons are 40px on desktop. At 60rem and below every touch target is at least 44px.

## Elevation & Depth

Depth is tonal first: chrome (top bar and side menu, darker), ground, panel, panel-2, each step separated by a 1px rule. On top of that, panels, the account menu, dialogs, the toast, the chart tooltip and the open mobile drawer carry one soft, diffuse drop shadow, and violet-filled actions carry a violet-tinted glow. The docked desktop side menu has no shadow; it is separated by its 1px Rule edge. There are no hard or offset shadows. Modal dialogs and the open drawer dim everything behind them with the Backdrop scrim.

### Shadow Vocabulary
- **Panel lift** (`--shadow`: `0 1px 2px rgb(0 0 0 / 0.35), 0 16px 40px -12px rgb(0 0 0 / 0.55)`): every panel, dialog, account menu, toast, chart tooltip and the open mobile drawer; always the same.
- **Action glow** (`0 8px 20px -10px var(--purple-glow)`): primary button at rest; tightens to `0 4px 10px -6px` on press.
- **FAB glow** (`0 10px 24px -8px var(--purple-glow)` plus Panel lift): the floating action button, which sits over content.
- **Focus halo** (`0 0 0 3px var(--purple-halo)`): focused input, paired with a Soft Violet border.
- **Selected inset** (`inset 0 0 0 1px var(--rule-strong)`): the side menu's current page. An outline, not a lift.
- **Swatch ring** (`0 0 0 3px var(--panel), 0 0 0 5px var(--ink)`): the checked color swatch.
- **Level-up pulse** (`0 6px 18px -4px var(--green-glow)`): transient only, at the peak of the badge's scale pulse.
- **Waiting halo** (`0 0 0 0 var(--purple-halo)` opening to `0 0 0 0.9rem transparent`, over the Action glow): the Foco clock's primary button while a phase waits for the user, repeating every 2.2s; a still 3px halo under reduced motion.

### Named Rules
**The One Lift Rule.** A panel has exactly one elevation. Content inside a panel is never another shadowed card; it is divided by rules. The level pill inside the top bar is a bordered Panel fill with no shadow, and the shell strips (offline strip, streak and deadline reminders, install invite) are bordered Panel strips with no shadow. Task cards carry no shadow either: they are flat bodies one tonal step above what holds them. The chart tooltip is the one floating element inside a card; it lifts because it hovers over the data, not because it is a card.

## Shapes

Soft, friendly geometry without going bubbly. Containers (panels, dialog) round at 16px; controls (buttons, inputs, notices, toast, shell strips, account menu, user card, icon buttons, level-up banner) at 10px; interactive rows and task cards, side-menu items, menu items, chart columns on hover, the chart tooltip, the iOS step chip and small overlays at 8px. Data ends round at 4px: an XP bar rounds only its top corners and a category bar only its right end, so the baseline stays square. Anything that represents a count, a state token or a filter is a full pill: the NÍVEL badge, the XP track and fill, the level pill, the ERRO tag, the segmented well and its segments, the filter chips, the account state pills, the switch track, and the 3px active-tab bar. Circles are reserved for identity, completion, color and the floating action: the avatar, the task check, the timeline check, the category dot, the color swatch, the FAB. Borders are always 1px, solid except the dashed "+ Nova coluna" Kanban slot and the dashed daily-cap line; rings on the avatar and task check are 2px, and so is the timeline connector. Checkboxes are squares at the 4px data radius with a 2px ring, so a selection box never reads as the round completion check. The Foco cycle pills are full pills, because they count.

The icon family is drawn in-house on a 16px grid: 2px strokes (2.2px for the check), round caps and joins, no fills, color through `currentColor`. Twenty-five glyphs exist: plus, check, pencil, list, chart, person, side-menu panel, menu, clock, stopwatch, play, pause, skip, close, download, share, no connection, calendar, ellipsis, funnel, magnifier, tag, shield, chevron left and chevron right. Single-point marks (the ellipsis dots and the tag's hole) use a 2.5px stroke so they read as dots. New icons follow the same stroke. Icons sit at 1rem in buttons and the iOS step chip, and 1.125rem in the side menu and the shell strips.

## Components

### Buttons
Solid, confident, one per form.
- **Shape:** gently rounded (10px), minimum 48px tall, 24px side padding, 700 weight. A leading 16px icon sits 0.45rem from the label.
- **Primary:** Action Violet fill, white label, Action Glow. Full width in a login form footer; right-aligned in dialogs; left of the save confirmation in Perfil.
- **Hover / Active:** fill steps to Violet Lift; press moves down 1px and tightens the glow. Disabled shows progress cursor at 70% opacity while the label switches to its "…ndo" form.
- **Compact:** 40px tall (44px at 60rem and below), 16px side padding. For a page's title-row action beside the Page Title ("+ Nova tarefa" on Tarefas desktop, "+ Conectar calendário" on Integrações) and the "Usar" button in Foco's music link row.
- **Link button:** Soft Violet text, 600 weight, 0.875rem, underline in Link Line with 4px offset that goes solid on hover. Used for secondary routes, dismissals and the one action inside a strip ("Esqueci minha senha", "Cancelar", "Desfazer", "Ver tarefas", "Instalar", "Sair da conta").
- **Destructive text action:** Muted text, 600 weight, 0.875rem, underline in Rule Strong; hover turns Ink. Pinned to the left of a dialog's action row ("Excluir"). Destruction is never a violet fill and never red.
- **Icon button:** a 40px square, 10px radius, no fill, Muted icon; hover gives Panel Two and Ink. The top bar's menu button and the side menu's collapse and close buttons. Always carries an `aria-label`.
- **Outline:** the secondary beside a primary ("Pular" beside Pausar on the Foco clock). 48px tall, 10px radius, 1.25rem side padding, a 1px Rule Strong border, no fill, Ink label at 700, and a 1rem icon 0.45rem from the label. On hover the border rises to Muted and the fill becomes Panel Two. It is drawn like the Filtrar button, at full button height. Never violet. The account page's actions (Gerar senha provisória, Remover autenticador, Suspender or Reativar conta) are outline buttons in a wrapping row 0.75rem apart, each full width at 47.99rem and below.
- **Start focus:** the primary button at full column width and 3.75rem tall, with a 1.0625rem label at 0.02em and a 1.125rem play icon. Used only for "Iniciar foco" while a Foco session is being set up; it is the page's one violet action in that phase.
- **FAB:** at every width, a 56px Action Violet circle with a plus icon, fixed at the bottom-right (2rem on desktop, 1.25rem at 60rem and below; safe-area aware), carrying the FAB glow; hover brightens it, press scales it to 0.94. One tap opens the new-task dialog. At 60rem and below it replaces the Tarefas title row's "+ Nova tarefa". It appears on every page: the shell renders it everywhere except Tarefas, which renders its own that opens the dialog in place.

### Inputs / Fields
- **Style:** Ground well inside the panel, 1px Rule border, 10px radius, 48px tall. The label sits above in Label style; an optional uppercase Soft Violet toggle (MOSTRAR / OCULTAR) sits at the label's right on the same baseline. Hints go below in Meta muted.
- **Select:** the same well with native appearance removed and a 2px Muted chevron drawn at the right.
- **Textarea:** the same well, three rows (min 5.5rem), 0.7rem by 0.95rem padding, line-height 1.5, resizable vertically only. Used for the task description.
- **Focus:** border turns Soft Violet with the 3px violet halo; no outline. Hover raises the border to Rule Strong. Autofill is forced back to Ground and Ink.
- **Error:** reported through the notice below the fields, not by recoloring inputs.
- **Number with unit:** the same well with its unit ("min", "focos") set inside at the right (0.95rem in, 0.875rem Muted, 3.75rem reserved). Browser spinners are removed (`appearance: textfield`) because the number is typed, and out-of-range values are clamped to their limits on blur. Used for the Foco intervals.
- **Code field:** the same well with the Code Entry type and a numeric keyboard (`inputMode="numeric"`, `autocomplete="one-time-code"`), six digits at most; anything else typed is dropped.
- **Checkbox:** a neutral 1.125rem square, 4px radius, 2px Check Ring border, no fill. Checked, it takes an Ink fill and border with a 2px Ground tick. Border and fill change over 0.15s. Selection is neutral, so a checkbox is never violet, and never green (green is the completion circle). Used in the task picker and the Foco music option.

### Notice (error)
A `panel-2` block with a 1px Rule Strong border, 10px radius, a small pill tag in inverted neutrals reading "ERRO", then the message in 0.875rem. Enters with a 4px slide-down. Announced with `role="alert"`. This is the pattern for every inline error in the app, including the load-failure state.

### Streak Reminder
A quiet strip, distinct from the notice: it is not an error and never carries a tag. Shown under the top bar only when the streak is above zero and nothing was completed today (Brasília). Panel fill, 1px Rule border, 10px radius, no shadow, 0.8125rem text, padding 0.35rem 0.5rem 0.35rem 0.9rem. A leading 1.125rem clock icon in Muted, one plain sentence ("Conclua uma para manter sua sequência de 6 dias."), a "Ver tarefas" link button when not already on Tarefas, and a 36px dismiss button (44px at 60rem and below) (Muted close icon, Panel Two and Ink on hover) that hides it until the next day. Announced with `role="status"`.

### Offline Strip
The streak reminder's form carrying the connection state: Panel fill, 1px Rule border, 10px radius, no shadow, a leading 1.125rem no-connection icon in Muted and one plain sentence ("Sem conexão. O que você mudar agora só será salvo quando a internet voltar."). No link, no dismiss: it leaves when the connection returns. It renders inside a `role="status"` region that stays mounted, so screen readers hear the drop. While offline the streak and deadline reminders and the install invite stay hidden.

### Install Invite
The same strip form, on mobile only (hidden at 60rem and up, where the side menu's "Instalar app" item suffices). A leading 1.125rem download icon in Muted, one plain sentence ("Instale o RoutinXP na tela inicial e abra direto, como um app."), an "Instalar" link button (never a filled button: the invite is optional, not the screen's action), and the 36px dismiss button. Dismissed once, it never returns; "Entendi" in the iOS install dialog dismisses it too. Shown only while online and while neither reminder applies, so the shell never stacks two strips.

### Navigation: Side Menu
The app's primary navigation, full height at the left, in the Top Bar tier with a 1px Rule right edge; sticky, no shadow.
- **Top:** the horizontal logo (2rem tall) and, at the right, the collapse icon button.
- **Items**, in this order: Tarefas (list icon), Foco (stopwatch), Painel (chart), Categorias e tags (tag), Integrações (calendar), Administração (shield), Perfil (person). An account sees only the items for the features it has; Administração appears only for the admin role. 44px rows, 8px radius, a 1.125rem icon 0.75rem from the label, 600 weight, Muted at rest. Hover gives Panel Two and Ink. The **current page** is neutral: Panel Two fill, the Selected inset in Rule Strong, Ink text. Never violet, never a side stripe.
- **Install item:** "Instalar app" with the download icon, the same recipe as the nav items (44px, 8px radius, 600, Muted at rest, Panel Two and Ink on hover, a native tooltip when collapsed). It sits at the bottom directly above the user card and appears only when the app can be installed.
- **User card:** pinned to the bottom; a 36px avatar, the user's name (0.875rem, 700, ellipsized; "Complete seu perfil" when empty) over "Nível n" (0.75rem, Muted). 10px radius, 8px padding. It links to Perfil and has a hover state only (Panel Two); it never shows the current-page state, because the Perfil item already carries it.
- **Collapsed (desktop):** a 4.25rem icon rail. The logo swaps for the 32px icon, the collapse button stacks under it, labels and the user card's text hide, items center their icons and show their name as a native tooltip. The choice persists in `localStorage`.
- **Drawer (60rem and below):** off-canvas at the left, min(18rem, 85vw) wide, slides in over 0.3s with the Panel lift, over the Backdrop scrim. When closed it is `visibility: hidden` so it leaves the tab order. The top bar's menu button opens it; focus moves to the drawer's close button, stays trapped inside the drawer while it is open (Tab and Shift+Tab wrap around its visible controls), and returns to the menu button on close. Esc, the scrim, the close button or a route change close it. The collapse button is hidden here.

### Navigation: Underline Tabs
Uppercase Tab-style labels in Muted, 28px apart, over a 1px Rule baseline. The active tab turns Ink and gets a 3px fully rounded Action Violet bar that scales in from the center over the baseline (0.3s ease-out). Hover lifts the label to Ink. Use for switching what a screen *is*: modes and views (Lista / Kanban / Calendário).

### Segmented Filter
A pill well in Ground with a 1px Rule border and 3px inset; each segment is a 32px pill in Segment type, Muted, sentence case with its count ("Pendentes · 6"). The active segment gets a Panel Two fill and Ink text; hover lifts to Ink. No violet. Use for narrowing the *same* content by state or range (Pendentes / Concluídas in Lista, 7 dias / 30 dias on the Painel). Rule of thumb: if switching changes the layout, it is a tab; if it only changes which rows or days show, it is a segment. On Tarefas desktop it floats above the tab baseline at the right; everywhere else (a Painel card header, mobile) it sits in flow.

### Cards / Containers: Panel
- **Corner Style:** 16px.
- **Background:** Panel, with a 1px Rule border and the Panel lift shadow.
- **Internal Padding:** 32px on forms; 28px on Perfil panels; 24px on Painel cards, narrow screens and demo panels; Kanban columns use 0.7rem on top and 0.6rem elsewhere, so cards run nearly edge to edge; Lista, Calendário Dia and Linha do tempo have no panel at all (the cards are the containers).
- Sections inside a panel are separated by a 1px Rule, never by nested panels.

### App Top Bar
Sticky, Top Bar fill, 1px Rule beneath. Center: the **level pill**, a Panel fill with a 1px Rule border, fully rounded, holding the NÍVEL badge, a compact XP bar (clamp 10rem, 24vw, 20rem wide, 0.3rem between figure row and track) and the streak ("6 dias" in XP Figure over a 0.6875rem STREAK label), the streak split off by a 1px Rule. Right: the avatar button only (creating a task is the FAB's job, and the Tarefas title row's). On desktop the left is empty except for the focus chip; the logo is in the side menu. At 60rem and below the left holds the menu icon button and the logo (1.875rem tall), the right holds only the avatar, and the pill stretches across a second row. Until stats load, the pill renders as a **skeleton**: the same pill shape at clamp(16rem, 36vw, 30rem) with a single 8px Panel Two bar and `aria-busy`, never placeholder numbers.

**Focus chip.** While a focus session is under way and the user is on another page, the top bar carries a link back to Foco. It is a 2.5rem pill (Panel fill, 1px Rule border, 0 0.95rem 0 0.8rem padding, 0.45rem gap) with a 1rem Muted icon and the label at 0.875rem and 700, tabular. It has three states:
- **Running:** the stopwatch icon and the phase with the time left ("Foco 18:42", "Pausa 4:10"), in Ink.
- **Paused mid-block:** the pause icon and "Foco pausado 18:42", in Muted.
- **Waiting for the user** (a phase ended and nothing starts on its own): the play icon, "Hora da pausa 05:00", "Hora da pausa longa 15:00" or "Próximo foco 25:00", in Ink, with a Rule Strong border and a Panel Two fill so it is seen.

The icon stays Muted in every state.

On hover the border rises to Rule Strong and the fill becomes Panel Two. Its accessible name reads "Foco, 18:42 restantes. Abrir a página Foco". On desktop it sits at the left of the bar, in the space the side menu's logo leaves empty. At 60rem and below it replaces the logo in the center (2.75rem tall). It never shows on Foco itself, or when no session is under way.

### Account Menu
The 40px avatar button (Panel Two circle, green ring, initials) opens a native `popover`: Panel fill, 1px Rule, 10px radius, Panel lift, min 15rem, 8px padding. The user's name (0.875rem, 700) and e-mail (Meta muted) sit on top; items are full-width 8px-radius rows at 600 weight with a Panel Two hover ("Sair"). Light-dismiss and Esc come from the platform.

### Categorias e tags
A simple page in the side menu (tag icon), in the Perfil column (max 44rem, centered). It replaces the old Tarefas category rail (user request, 2026-09-11), so the tasks get the full width. Two panels:
- **CATEGORIAS:** one Muted sentence, then one row per category (min 2.75rem, 1px Rules between rows) with the 8px category dot, the name at 600 (ellipsized), the pending count in Meta muted ("2 pendentes", "sem pendentes") and an "Editar" link button. Below comes "+ Nova categoria" as a Soft Violet text action under a 1px Rule. The Category dialog opens from here. A category with tasks still can't be deleted, and the dialog explains why.
- **TAGS:** one Muted sentence, then the same row pattern with the tag's 0.75rem square swatch and the use count ("2 tarefas", "sem tarefas"), and "+ Nova tag". Tags edit in the same dialog with tag texts (names up to 40 characters, same color picker). A tag in use can be deleted, but only on a second press: the first shows a notice ("Esta tag está em N tarefas e vai sair delas…") and relabels the action "Excluir mesmo assim".

Categories and tags can still be created straight from the task dialog.

### List Rows (tasks)
Each row is a card: a Panel body (Panel Two inside Kanban columns) with 8px radius, no shadow, padding 0.2rem 0.75rem 0.2rem 0.125rem, topped by a **cover band in its category color** (see the Dot-Only rule; Rule Strong when the category is unknown). Cards sit 0.375rem apart with no wrapping panel, and hover lifts the body one step (Panel to Panel Two; in Kanban, Panel Two to Rule). A row is a three-column grid:
1. A 44px completion target holding a 1.3rem circle with a 2px Check Ring ring and a 0.8rem tick. Hovering the target turns the ring and the tick green.
2. A middle column: the task's **tag labels** on top (0.3rem apart, see the Dot-Only rule for their two modes; each label is its own button that toggles the mode), then a text button (opens edit) with the Row Title and a 0.75rem Muted meta line (the category's 8px dot and name, only when the view mixes categories). The tag names also join the edit button's accessible name ("Editar …, Tags: …"). The meta line is omitted when it would hold only the date. The description never shows in the row.
3. A right column: the **due date** for pending rows, the **XP label** for completed rows.

Due dates are relative and counted from Brasília's day, the same day the reminder, the filter and the streak use: "hoje", "amanhã", then "12 set", "atrasada · 9 set" once overdue (the word, never color alone), and "sem data" when empty. They render as the Deadline Badge (see Tarefas page), and the deadline also joins the edit button's accessible name ("prazo: …"). In Kanban columns the badge and a completed card's XP leave the right column and join the category line, so the title keeps the card's full width; the category name never breaks.

A pending row reveals an **Excluir** overlay (Panel Two, stepping to Rule on a hovered card; 8px radius, Muted text, Ink on hover) over the date on hover or focus-within, positioned out of flow so title and date never reflow; on touch devices (`hover: none`) it is hidden and deletion lives in the edit dialog. Completed rows: the circle fills green with a Deep Moss tick, the title goes Muted with a Rule Strong strike-through, the check target is disabled, and the row is not draggable. A just-completed row pops its check (scale 1.2, 0.45s) and flashes Green Wash that fades over 1.2s.

The server computes XP, so a completed row's XP label has three states: **pending** ("…" in Muted at 600, hidden from assistive tech) while the server answers; **zero** ("+0 XP" in Muted at 600) when the completion earned nothing; **earned** ("+n XP" in Level Green at 800) otherwise.

**The Earned Record Rule.** In the app's Concluídas and the Painel timeline, an earned "+n XP" stays full-strength Level Green: it is the record of what the task earned. A "+0 XP" is Muted because it records that nothing was earned, not because anything was collected. The login demo dims its completed "+n XP" to 40% only because there the XP has visibly flown to the counter, and the dimmed label reads as "already collected". Do not carry the dimming into real lists.

### Lista
No wrapping panel (density pass, 2026-09-11): the cards are the containers. The rows are grouped by category under Label-style headings carrying the category dot and count ("● FACULDADE · 3"), 1rem above and 0.45rem below each heading, 0.75rem between groups; groups with no rows in the current filter are omitted, and rows drop their own category line since the heading carries it. When the filter narrows to one category the headings disappear. An empty filter shows a single Muted sentence.

### Kanban
The second Tarefas tab, named **Kanban** (user request, 2026-09-11). Columns sit side by side at minmax(15.5rem, 1fr), 1rem apart, and scroll sideways when there are many. At 48rem and below each column takes 86% of the width and they snap.
- **Columns:** Pendentes first, the user's own columns in their order, Concluídas last. Pendentes and Concluídas are fixed, one of each per user: they can be renamed and colored, but not moved or deleted. A last dashed "+ Nova coluna" tile (1px dashed Rule Strong, Soft Violet text) creates a column.
- **Column:** a Panel (padding 0.7rem 0.6rem 0.6rem). Its header holds the name in Label style, in Ink, with the count ("PENDENTES · 5"), and a 32px "⋯" icon button (44px at 60rem and below; Ink at 10% on hover) that opens the column dialog. A column with a color takes it across the whole column: the fill is the color mixed 12% into Panel and the border 45%, light enough that the category covers stay the brightest color. The cards keep their own category covers. Column colors come from the same eight soft colors, plus "Sem cor".
- **Cards:** the task card with a 0.875rem cover on a Panel Two body (Rule on hover), with a tighter 0.375rem gap between check and title. In columns the deadline badge and a completed card's XP sit on the meta line beside the category, so the title keeps the card's full width.
- **Moving:** every pending card is draggable (grab cursor; the dragged card dims to 40% in place). Dropping on a column moves the card there, and dropping on Pendentes sends it back. Over a column, the drop target shows Green Line and Green Wash with a line in green at 0.8125rem and 700: "Solte para concluir" on Concluídas, "Solte para mover para esta coluna" elsewhere. Dropping on Concluídas completes the task exactly as the check does (XP flight), with no way back, as decided in v1. Without drag (touch, keyboard) the task dialog has a "Coluna no Kanban" select once the user has their own columns.
- **Column dialog:** name (up to 40 characters), the color picker with a "Sem cor" swatch (a struck Ground circle), and for the user's own columns "Posição" arrows to swap with a neighbor and the destructive "Excluir coluna" (its cards go back to Pendentes). Fixed columns explain in one Meta line that they do not move.
- Empty columns show one Muted sentence ("Arraste tarefas para cá.").

### Calendário
The third Tarefas tab (LISTA | KANBAN | CALENDÁRIO). Its mode control, a segmented filter with Mês, Semana, Dia and Linha do tempo, sits where the Lista filter sits: at the right, above the tab baseline. It drops under the tabs at 60rem and below. The mode and the view are remembered, and `?visao=calendario&modo=…` links straight to them. The Filter applies to it like the other views.
- **Navigation bar** (Mês, Semana, Dia): two 36px chevron icon buttons (44px at 60rem and below) around a "Hoje" pill (1px Rule border, 0.8125rem at 700, Rule Strong on hover), then the period at 1.125rem/800 ("Setembro de 2026", "6–12 de setembro", "Quinta-feira, 10 de setembro"), announced politely.
- **Day number:** a 28px pill button at 700 (32px when narrow) that opens the Dia mode. **Today** takes the neutral selection (Panel Two fill plus the Rule Strong inset), never green or violet. Days of the neighbouring month are Muted, their cell sits on a Ground wash, and their pills fall to 60%.
- **Task pill** (Mês, Semana): a 1.5rem Panel Two pill, 6px radius, holding the category's 8px dot and the title (0.75rem at 600; ellipsized in Mês, up to two lines in Semana; the full title in the tooltip). Hover goes to Rule. Completed pills are Muted and struck through. Clicking one opens the task dialog.
- **Mês:** one Panel with no padding, a Label row of weekday names (Sunday first), then a 7-column grid of cells. Cells are at least 7rem tall, 0.4rem padding, divided by 1px Rules. A cell shows up to three pills, then a Soft Violet "+n tarefas" that opens the day.
- **Semana:** one Panel with seven day columns (at least 16rem tall) divided by 1px Rules. Each column heads with the Label weekday and the day number, then its pills.
- **Dia and Linha do tempo:** the Lista cards (no wrapping panel), so completing works as everywhere (check, green wash, XP flight). Linha do tempo groups under Label headings with counts: Atrasadas (pending, past due), Hoje, Amanhã, each later date ("sáb, 12 de set"), then Sem data. The list looks forward: completed tasks of past days stay folded behind a Soft Violet text toggle at the top ("Mostrar n tarefas concluídas de dias anteriores", 0.8125rem at 700, `aria-expanded`), which opens their day groups above Atrasadas.
- **Undated tasks:** below Mês, Semana and Dia, a Meta line "n tarefas sem data não aparecem no calendário." followed by the link button "Ver na Linha do tempo".
- **Narrow** (the view's own width at 44rem or less, by container query):
  - Mês cells shrink to 3.5rem. They drop pills and "+n", show up to four category dots (completed ones at 40%) and center the day number.
  - Semana stacks its days vertically, divided by Rules.

### Painel
The progress overview. Every card is a Panel titled in Label style; a header row holds the title and, at the right, its control or highlight. Empty cards show one Muted sentence.
- **Level panel:** the NÍVEL badge, the XP bar (flexible) and "n XP no total" in XP Figure weight, one row. It takes values without the count-up.
- **XP per day:** titled "Sua semana" or "Seus últimos 30 dias", with the 7 / 30 dias segmented filter in flow at the right and a Muted summary line ("n tarefas concluídas · n XP") below.
- **Conclusões por categoria:** a Muted period line under the title and "Mais concluída: …" in Ink at 600 at the right.
- **Linha do tempo:** the tall narrow card. Its header holds the title and two streak figures (STREAK ATUAL, RECORDE) in Stat Figure over Label captions, closed by a 1px Rule.
- **Minutos de foco:** the last card of the wide column, after the categories. It follows the same 7 / 30 dias period, with a Muted summary ("3 focos completos · 75 min") and the focus-minutes chart. Empty: one Muted sentence.

### Charts (signature for data)
One language for every chart: magnitude is **single-hue Level Green**, the scale is neutral, and each value is readable without the hover.
- **XP bars:** a 12rem plotting area over a 1px Rule baseline. Bars are green, min(2.75rem, 72%) wide within equal columns (gap clamp 0.25rem to 0.75rem), with 4px rounded top corners and a square foot. At 30 days the gap drops to 2px and bars fill their columns. The scale is the larger of the daily cap and the tallest day. A **dashed 1px Rule Strong line** marks the 150 XP daily cap as the scale reference, labeled at its right end ("teto diário · 150 XP", 0.75rem Muted). Only the **tallest bar** carries a direct value label above it ("50 XP", 0.75rem, 700, Ink). Axis labels run 0.75rem Muted beneath (weekday for 7 days; every fifth date for 30).
- **Hover:** the column gets a Panel Two 8px-radius wash and a tooltip appears above ("seg 8 set · 50 XP · 3 tarefas"): Panel Two, 1px Rule Strong border, 8px radius, Panel lift, 0.75rem at 600, fading in over 0.15s. Near the chart's ends the tooltip aligns inward so it never leaves the card.
- **Accessibility:** the bars are `aria-hidden`; a visually hidden table (Dia, XP, Tarefas) carries the same data, captioned with the card title.
- **Category bars:** one row per category in a three-column grid (name up to 11rem, bar, count in 2.25rem), 0.75rem apart. The name is the 8px category dot plus the name at 600, ellipsized; the bar is a 0.75rem Panel Two track with a green fill scaled to the largest category, both square at the start and 4px round at the end; the count is 700, right-aligned. The category color appears only on the dot.
- **Focus minutes:** the XP-bar grammar reused for the minutes of completed focus per day. Bars are green, because green is the Painel's data mark. Only the tallest bar carries a direct label ("50 min"). The hover tooltip reads "seg 8 set · 50 min · 2 focos", and a hidden table carries the same data (Dia, Minutos, Focos). There is no cap line: minutes have no daily ceiling, so the tallest day sets the scale.

### Timeline
Recent completions (up to 12), grouped by day under Label headings ("HOJE", "ONTEM", "seg, 8 set"). Each item is a row: a 24px green circle with a Deep Moss check, the title (Row Title, clamped to two lines, breaking anywhere) over the category line (dot and name, Meta muted), the time (Meta muted), and the XP label right-aligned in a 3.75rem column: "+n XP" in green at 800, "+0 XP" in Muted at 600. Items are divided by 1px Rules, and a 2px Rule line runs vertically behind the check circles within each day, joining them. The circles are marks, not controls.

### Foco
A pomodoro page reached from the side menu (stopwatch icon, after Tarefas). For its grid and phases, see Layout. Everything on it is existing parts, plus the clock.
- **Intervalos panel** (montar): a Panel with 1.25rem by 1.5rem padding and 1rem gaps, titled INTERVALOS in Label style. Below the title, a segmented filter sits in flow, left-aligned: 25 / 5, 50 / 10, Personalizado. Personalizado opens four number-with-unit fields in an auto-fit grid (columns at least 9rem, 0.9rem by 1rem gap): Foco, Pausa and Pausa longa in "min", and "Pausa longa a cada" in "focos". A Meta hint states the plan in one sentence.
- **Clock panel** (rodar): a centered Panel with padding clamp(1.75rem, 4cqi, 2.75rem) on top and 1.5rem on the sides and bottom, 1rem gaps. It holds, top to bottom:
  - the phase line in Label style, in Ink, announced politely ("FOCO · 2 DE 4", "HORA DA PAUSA · 2 DE 4", "PRÓXIMO FOCO · 3 DE 4", "PAUSA · 2 DE 4 · PAUSADO");
  - the cycle pills;
  - the time in Focus Clock type (`role="timer"`);
  - a centered, wrapping controls row 0.75rem apart: the primary Pausar, Retomar, Iniciar pausa, Iniciar pausa longa or Iniciar foco (min 10rem) and the outline Pular;
  - "Encerrar sessão" as a link button.

  Paused, the phase line and the time turn Muted (0.3s). Waiting for the user, they stay Ink and the primary button pulses: a Violet Halo ring that opens to 0.9rem and fades over 2.2s, repeating until pressed; under reduced motion it holds still as a 3px halo.
- **Cycle pills:** one 1.75rem by 0.375rem full pill per focus in the round, 0.4rem apart. They are `aria-hidden`, since the phase line says the same in words. A done focus is Ink, the current focus is Ink mixed 45% into Rule Strong, and the rest are Rule Strong. The fill changes over 0.3s.
- **Sections without panels:** the session's tasks, Agora and Música are not panels. Each is a Label heading (min 2rem, 0.5rem above the content) with its one action at the right, followed by the content directly, so no card sits inside a card.
- **Tasks:** the headings read "TAREFAS DA SESSÃO · 3" in montar and "NA FILA · 2" in rodar, with "+ Adicionar tarefas" as a link button (0.8rem plus icon). The tasks are the Lista task cards, unchanged: cover, labels, deadline badge, check, green wash and XP flight. The card's Excluir overlay reads "Tirar" and only takes the task out of the session; on touch it stays visible. Finished tasks gather under "CONCLUÍDAS · n", 1rem below. The empty state is one Muted sentence in a 1px dashed Rule Strong box (10px radius, 1rem by 1.1rem padding).
- **Música:** MÚSICA with "Trocar link" at the right. Below it, in order:
  - the Spotify embed, 152px tall at full width;
  - while editing, the link field and a compact "Usar" button in one 2.75rem row, with a Meta hint that the error text replaces;
  - the "Pausar a música nas pausas" checkbox row (2.75rem, 0.875rem at 600);
  - a Meta hint about 30-second previews.

  A load failure shows the ERRO notice and a "Tentar de novo" link button.
- **Spotify embed:** Spotify's own iframe. It brings its own surface, colors and rounded corners, and we give it no border, panel or shadow. It is not our palette, and the Swappable Theme Rule stops at its edge; nothing in the system borrows its colors.
- **Task picker** ("Adicionar tarefas"): the standard Dialog, with the filter's search field, then "Todas" and the category chips, then a list that scrolls within min(22rem, 45dvh). The list is closed by 1px Rules above and below, and a 1px Rule divides each row. A row is a label, min 3.25rem, 8px radius, 0.55rem by 0.6rem padding: the checkbox, then the title (700, ellipsized) over the category dot, the name and the due date in Meta. Hovered and checked rows take Panel Two. The actions are "Cancelar" and the primary "Adicionar n", disabled at zero.
- **Phase change:** iniciar from montar, and ending a session, morph through the View Transitions API. The Intervalos panel and the clock share `foco-palco`, so one becomes the other, and the tasks and music carry `foco-tarefas` and `foco-musica`. The groups run 0.45s on the shared ease-out. Under reduced motion, or without support, the swap is instant.
- **Ending:** "Encerrar sessão" returns to montar and takes the finished tasks out of the session. It shows the undo toast "Sessão encerrada." (see Toast). Starting a new session closes that toast.
- **End of a phase** (user decision, 2026-09-11): nothing starts on its own. When focus ends the clock stops at "Hora da pausa" and waits for "Iniciar pausa"; when the break ends it waits for "Iniciar foco". The alert is loud enough to cut through music and reach someone not looking at the screen: the music pauses, three chime pairs play, the phone vibrates, and a system notification appears every time ("Tempo de foco acabou · Hora da pausa…", icon, stays until touched). The server also sends it as Web Push, so it arrives with the screen locked, in another tab or with the app closed; both share one tag, so one replaces the other and the second does not ring again within 2 minutes. A softer two-chime reminder repeats each minute, up to three times, while nobody answers. Touching the notification opens Foco. Acting in the app (start, skip, end) closes it.
- **Alerts invite:** under "Iniciar foco", while notifications are not yet allowed, one Meta sentence and an "Ativar avisos" link button. Blocked notifications get a sentence on how to unblock them; iPhone outside the installed app gets a sentence that alerts need the app on the home screen. Nothing shows once they are allowed.

**The Neutral Clock Rule.** Foco marks time and phase in neutrals only. The phase line, the time and the cycle pills are Ink, Muted and Rule Strong. They are never green, because time passing earns nothing, and never violet, because violet is for the actions (Iniciar foco, Iniciar pausa, Retomar, Pausar, Adicionar). The waiting pulse is a violet halo on the action itself, not on the clock. On this page green arrives only through task completion: the check, the green wash and the XP flight.

### Integrações
A simple page (the Perfil column: max 44rem, centered). A title row: Page Title "Integrações" at the left and, once a calendar exists, the compact "+ Conectar calendário" at the right. The row wraps, so the button drops below the title when there is no room; the title never breaks mid-word. Two panels follow.
- **CALENDÁRIOS DA FACULDADE:** one Muted sentence, then one row per connected calendar, divided by 1px Rules:
  - a 2.25rem Panel Two tile holding the Muted calendar icon;
  - the course name at 600;
  - a Meta muted line with the static tag label, the category dot and name, "atualizado há …" (or "falhou há …" when the last attempt failed) and the task count;
  - a neutral Ink line at 600 for the error or for the last manual result ("2 tarefas novas.");
  - "Atualizar" and "Editar" link buttons at the right, which drop under the text at 30rem and below.
  A Meta hint closes the list ("Atualização automática a cada 3 horas."). Empty state: a Muted sentence and the primary "+ Conectar calendário".
- **COMO PEGAR O LINK NO BLACKBOARD:** four steps in the numbered-steps list style, then a Meta note.
- **Connect/edit dialog:** the standard Dialog.
  - Fields: course name; the calendar link, whose field sits in a row with a "Testar link" link button; category and tag as a pair (the tag offers "Nova tag: {course}" by default); a checkbox to bring overdue activities.
  - The preview answers inside the form: one Meta sentence with the counts, then up to five rows (title at 600, ellipsized; date in Muted at the right) between 1px Rules.
  - Editing replaces the link field with a dashed Rule Strong box, "Link salvo (domain)" plus "Trocar link". The link is never shown back.
  - "Remover calendário" is the pinned-left destructive action. It opens a second step titled "Remover {course}", with two radios (keep, or delete the pending imported tasks) and the destructive text action to confirm, never a violet fill.

### Administração
Accounts, not content: the panel never shows anyone's tasks, focus or finance. It reuses the app's parts (Page Title, compact button, underline tabs, the filter's search field, Panels, outline buttons, the destructive text action, Dialog) and adds three: the account row, the state pill and the switch.
- **Account list:** no cards. A list closed by a 1px Rule above and a 1px Rule under each row. A row is a link, min 3.75rem, 0.6rem by 0.75rem padding, 8px radius, Panel Two on hover, laid out as a four-column grid: who (the name at 700 over the e-mail in Meta Muted; the e-mail alone at 700 when there is no name; the owner's own row adds "você" in 0.75rem Muted at 600), the state pills, "último acesso 12 set" (or "nunca acessou") in Meta Muted in a fixed 8.5rem column so the dates align across rows, and a Muted chevron. Names and e-mails ellipsize. The search matches name and e-mail without regard to accents. An empty result is one Muted sentence in a 1px dashed Rule Strong box (10px radius).
- **State pill:** a 1.375rem full pill, 0 0.55rem padding, Panel Two fill, 1px Rule Strong border, 0.75rem at 700, Muted, never wrapping: "Administrador", "Suspensa", "Senha provisória", "Sem autenticador". "Suspensa" alone is Ink, because it changes whether the account can be used. The pill container always renders, even empty, so rows keep their columns.
- **Registro tab:** the same hairline list; each item holds the sentence of what was done (0.875rem) and its date and time in Meta Muted at the right, wrapping under it when narrow, 0.8rem by 0.75rem padding.
- **Account page:** the back link "‹ Contas" (a link button with a 0.875rem chevron left), the header, then two Panels titled in Label style:
  - **FUNÇÕES:** one row per feature, min 3.5rem, divided by 1px Rules: the name at 700 over one Meta line of what it opens, and the switch at the right. Kanban and Calendário depend on Tarefas: with Tarefas off their text falls to 55% and their switches are disabled. A change saves at once (switches stay disabled until the server answers), rolls back if refused, and reports in one Meta `role="status"` line, in Ink on failure; the line leaves the layout while empty.
  - **CONTA:** "Criada em" and "Último acesso" as Meta terms over values at 600, 2.5rem apart, then the outline actions, then "Excluir conta" as the destructive text action at the foot, left-aligned. On the owner's own account the actions are replaced by one Meta sentence.
- **Switch:** a real `role="switch"` button, a 2.75rem by 1.5rem full pill. Off: Panel Two track, 1px Rule Strong border, a 1rem Muted knob at the left. On: Ink track and border, the knob in Ground slid 1.2rem right. Track, border and knob change over 0.2s on the shared ease-out. An invisible ::before extends the target to 44px without enlarging the drawing. Disabled: 45% and a not-allowed cursor. The feature's name is its label and the Meta line its description. Selection stays neutral: never violet, never green.
- **Nova conta dialog:** the standard Dialog with E-mail, Nome (with a Meta hint) and a FUNÇÕES fieldset of neutral checkboxes in an auto-fit grid (columns at least 9rem), each row 2.75rem at 600. Unchecking Tarefas unchecks Kanban and Calendário and disables them (55%).
- **Confirmation dialog:** the standard Dialog with a Headline question, one sentence naming the account and the consequence, "Cancelar" and the action. Deleting asks for the account's e-mail, typed in a field whose label quotes it (the e-mail keeps its own case inside the uppercase label); the action stays disabled until it matches. As everywhere else, destruction is never a violet fill: "Excluir para sempre" is the underlined text action on the left, with "Cancelar" on the right; the reversible actions (suspend, reactivate, new password, remove authenticator) keep the primary button.
- **Temporary password (signature):** a fixed Dialog (see Dialog) that shows the password once: a Ground well with a 1px Rule Strong border, 10px radius, 1.25rem by 1rem padding, holding the password centered in Secret Figure, split into groups of four 0.4em apart (selected whole on click), and a "Copiar senha" link button that copies it without spaces and turns to its done form. Below, a Meta warning that it will not be shown again, and one primary button, "Pronto", that closes it. Nothing keeps the password after closing.

### Two-Step Verification
The gate's authenticator screens (see Account gate in Layout).
- **Register the authenticator:** Headline, one Muted sentence, then an ordered list of three steps (0.9rem apart, line-height 1.5, numbers at 800 in Muted). The second step holds the QR code and the key side by side, wrapping: the QR on a 9rem QR Ground tile (0.5rem padding, 10px radius), and beside it the Label "CHAVE", the key in groups of four, and a "Copiar chave" link button. Then the code field, the full-width primary "Ativar verificação" and the "Sair" link button, centered.
- **Type the code:** Headline, one Muted sentence, the code field, the primary "Confirmar" and "Sair", then a centered Meta line on what to do if the phone is lost.
- Errors are the ERRO notice above the button, and a wrong code clears the field. While the QR loads, a Meta line says so.

### Perfil
A simple page (Page Title, then two panels). The first holds the profile form: first name and surname, birth date and occupation, each pair in the auto-fit two-column grid, then the primary "Salvar perfil" with "Perfil salvo." (0.875rem, 600, Muted, `role="status"`; never green, which stays for XP, level and completion) beside it once saved. When the profile is incomplete the title becomes "Complete seu perfil" and one Muted sentence (44ch) leads the panel. The second panel, titled CONTA in Label style, lists the e-mail (Meta muted term, Ink value) and a "Sair da conta" link button.

### Dialog
A native modal `<dialog>` (focus trapped, Esc and backdrop click close), Panel fill, 1px Rule, 16px radius, Panel lift, width min(100% - 2rem, 32rem), 28px padding, over the Backdrop scrim. Enters with a 10px rise and 0.98 scale (0.35s ease-out). A Headline title, then a standard form (fields 20px apart; a pair of fields, such as category and date, sits in two columns and stacks at 60rem and below), then the action row: destructive text action pinned left (only when editing), then "Cancelar" as a link button, then the primary button at the right. Errors appear as a notice above the actions.

**Fixed dialog.** For what must not be lost to a stray key or click (the temporary password), the dialog is fixed: Esc and a click on the backdrop do nothing, and only its own button closes it. Every other dialog keeps Esc and backdrop close.

**Task dialog.** Fields in order: Título; Descrição (optional textarea, "Opcional." hint); Categoria and Data prevista as a pair; then **Tags**, a fieldset with a Label legend and a wrapping row of tag chips (0.5rem apart). A chip is a 2.25rem pill (1px Rule border, 0 0.8rem padding, 0.875rem at 600, Muted) holding the tag ring and the name; hover raises the border to Rule Strong and the text to Ink; a chip that is on (`aria-pressed`) gets the neutral selection, Panel Two fill with a Rule Strong border and Ink text, never violet. A last dashed chip "+ Nova tag" opens an inline row, not a box: the name field (flexible), a "Criar tag" link button and a 36px close icon button, with the color picker beneath. "Salvar" stays the dialog's only violet action. Enter creates the tag and switches it on; Esc or the close button closes only the inline row. The Tags legend keeps 0.75rem below it (legends are not grid items). With no tags yet, one Muted hint sentence sits above the chips.

**iOS install steps.** The same dialog with no form: the Headline "Instalar na tela de início", one Muted body sentence (line-height 1.55), then an ordered list of three steps 0.75rem apart at line-height 1.5, their numbers in 800 Muted. The first step leads with a 1.75rem chip (1px Rule Strong border, 8px radius, Ink share glyph at 1rem) so the user can find the Safari control. One action, the primary "Entendi", right-aligned; it closes the dialog and dismisses the install invite.

### Color Picker
A fieldset with a Label legend and eight 36px circular swatches, 11px apart, drawn from a fixed soft palette tuned to sit on dark (blue, teal, amber, rose, terracotta, sand, slate, lavender; values live in `formCategoria.cores`). Each swatch is a real radio with the color's name as its title. The checked swatch gets a two-step ring (Panel gap, then Ink); keyboard focus adds the Soft Violet outline 6px out. This is the one place a category or tag color fills a shape. Tags use the same eight colors.

### Toast
Fixed, centered 1.5rem above the bottom (above the FAB on mobile), Panel Two fill, 1px Rule Strong border, 10px radius, Panel lift, 0.875rem at 600. Enters with a 12px rise. One toast at a time. Announced politely (`role="status"`, or `alert` for errors). Four variants:
- **Undo:** "Tarefa excluída" with a "Desfazer" link button and a 2px Rule Strong time bar along the bottom edge that shrinks to zero over 5s. The undo toast can carry its own text and action: ending a focus session shows "Sessão encerrada." with Desfazer. That Desfazer restores the session as it was, unless a new session has begun, and the toast closes after 5s.
- **Info:** one plain sentence naming the XP rule that applied ("Concluída! Você já ganhou os 150 XP de hoje. O streak continua valendo."). No tag, no accent, neutral border; dismisses after 6s.
- **Level:** leads with a green NÍVEL n badge, then "Você subiu de nível!"; the border swaps to Green Line. Dismisses after 5s.
- **Error:** leads with the ERRO tag and dismisses after 6s.

### Empty, Loading and Error States
- **Loading:** a single Label-style line ("Carregando…") in the content area, plus the top-bar skeleton. No spinners, no fake rows or bars.
- **Empty:** a Panel with a Headline, one Muted sentence (44ch), and the primary button with a plus icon (first category, or first task). Inside a Painel card, a single Muted sentence.
- **Error:** the same panel holding an ERRO notice and a "Tentar de novo" primary button; on the Painel, the ERRO notice alone.

### Level Badge (signature)
Green pill, Deep Moss text, "NÍVEL n", Badge type. On a level change it pulses once (scale to 1.2 with the Level-up pulse shadow, 0.7s).

### XP Bar (signature)
Above the track: the XP figure ("XP 120 / 150") left, "faltam n XP" muted right, 0.75rem. The track is an 8px Panel Two pill; the fill is a full-width green pill slid in with `translateX` (never width), with a Green Tip leading edge in its last 0.9rem and a 4% minimum so it is never invisible. The fill transition and the count-up both run 0.7s on the same ease-out, so number and bar arrive together. Exposed as a `progressbar` with min, max and now.

### Level Meter
Badge (meter size) and XP bar side by side in a flex row, closed by a 1px Rule beneath. The compact progress header inside a panel (login demo). In the app the same parts live in the top bar's level pill and the Painel's level panel.

### XP Flight and Level-Up (signature interaction)
One gesture, in the login demo and in the app: "+n XP" in Level Green at 800 flies to the XP figure on the same curve (`cubic-bezier(0.5, 0, 0.2, 1)`), shrinking to 0.75 and fading in its last 20%. The figure counts up and the bar fills only when it arrives, so number, bar and flight read as one event.
- **In the app:** the flight is fixed-position above everything (1rem, 0.7s, starting at scale 1.15), launched from the completed row's check or, in Kanban, from the point where the card was dropped, and aimed at the top bar's "XP n / m" figure. Stats are applied on arrival, and a fallback timer (850ms) applies them if the animation never ends (background tab). A completion that earned 0 XP launches no flight; stats apply at once.
- **In the login demo:** the flight stays inside the demo panel (0.6s, from scale 1.1), starting at the row's XP label.
- **Level-up in the top bar:** the bar fills to 100% in the old level (0.7s), holds 750ms, then snaps with no transition to the new level and the badge pulses. About 1.5s after arrival, once that sequence has played, the level toast confirms it. On first load, and whenever stats arrive or resync, the meter takes its values with no animation. The login demo confirms a level change with an inline banner (Green Wash fill, Green Line border, 10px radius) instead of a toast.
- Reduced motion collapses the flight and the fill; the count jumps to its target.

### Logo
The brand mark lives in public/marca: horizontal logo (icon plus name), vertical logo, name alone, and the icon, each as SVG with PNG copies. The horizontal SVG is the wordmark everywhere, sized by height with its 1992:512 ratio reserved so the page never jumps: 2.75rem tall on the login, 2rem at the top of the side menu, 1.875rem in the mobile top bar. The icon alone (32px) stands in for it in the collapsed side menu, and is the favicon and app icon (SVG, with 192 and 512px PNGs, a maskable 512px PNG and the apple-touch icon). The icon's dark tile is part of the asset (`#16181d`), not a token; the web manifest's `background_color` matches it so the Android splash shows no lighter disc around the icon. The logo carries the accent colors; do not recolor, outline or typeset it.

### Avatar
A Panel Two circle with a 2px green ring and initials at 700: 48px in a profile card, 40px as the top bar's account button (hover fill Rule), 36px in the side menu's user card. Never on the login.

## Do's and Don'ts

### Do:
- **Do** read every color, including glows, washes, halos and the backdrop, through the `:root` custom properties so a theme can replace them in one place.
- **Do** keep green for XP, level and completion, and purple for actions and focus; use Soft Violet when violet must be read as text.
- **Do** mark selection and the current page with neutrals: Panel Two fill plus a Rule Strong outline or border.
- **Do** put Deep Moss text on green fills and white text on violet fills.
- **Do** separate content inside a panel with 1px Rules; tasks are flat cards set 0.375rem apart, never wrapped in a panel.
- **Do** show category color as an 8px dot next to the category name; the task card's cover band and the color picker are the only fills.
- **Do** use underline tabs to switch views and the segmented pill to filter rows or ranges within a view.
- **Do** show due dates relatively ("hoje", "amanhã", "12 set") in the Deadline Badge: neutral when far, amber within 3 days or today, rose once overdue, always with the clock.
- **Do** keep an earned "+n XP" full-strength green in real lists and the timeline; it is the earned record. Show "+0 XP" and the pending "…" in Muted.
- **Do** name the reason in a neutral info toast when a completion earns less than usual.
- **Do** apply XP only when the flight lands, with a fallback timer so a stalled animation never withholds it.
- **Do** draw charts in single-hue green with 4px rounded data ends, a neutral scale reference, one direct label on the extreme value, a hover tooltip, and a visually hidden table with the same data.
- **Do** size responsive grids that sit beside the side menu by container query, not by window width.
- **Do** use the horizontal logo as the wordmark (2.75rem login, 2rem side menu, 1.875rem mobile top bar) and the icon as favicon and collapsed-menu mark.
- **Do** report errors with the neutral notice and its ERRO pill tag; keep the offline strip, the streak and deadline reminders and the install invite as tagless Panel strips, one at a time.
- **Do** animate XP by count-up plus a `translateX` fill on the shared ease-out `cubic-bezier(0.16, 1, 0.3, 1)`, and let reduced-motion collapse it.
- **Do** keep primary buttons and inputs at least 48px tall, completion targets and navigation items at least 44px, and icon buttons 40px.
- **Do** draw new icons on the 16px grid with a 2px round-capped stroke in `currentColor`.
- **Do** mark the focus phase, the time and the cycles in neutrals (Ink, Muted, Rule Strong), and leave green on the Foco page to task completion.
- **Do** show account state as neutral pills and feature access as neutral switches (on is an Ink track); separate account rows with 1px Rules, not cards.
- **Do** show a secret once, in tabular groups of four with a copy action, inside a fixed dialog.

### Don't:
- **Don't** add a third accent, or use red for errors, deletion or a streak at risk. The amber and rose deadline tints stay inside the Deadline Badge and the deadline reminder.
- **Don't** use purple, a colored side stripe, or the category color to mark a selected item or the current page.
- **Don't** fill, border or tint surfaces or chart bars with category colors. The one fill exception is the task card's category-colored cover band (user override, 2026-09-11), faded to 40% on completed cards; the card itself is a flat Panel body (Panel Two in Kanban), never a shadowed nested card.
- **Don't** paint a deadline red as an alarm. Deadlines use the Deadline Badge: amber when close or today, rose only once overdue, always with the clock and the date as text.
- **Don't** draw a tag as a round dot: round dots are categories, tags are rectangular (labels, bars, swatches).
- **Don't** nest a shadowed card inside a panel.
- **Don't** use hard or offset shadows; the only shadows are the soft lift, the violet glows, the focus halo, the selected inset, the swatch ring, the Foco waiting halo and the transient level-up pulse.
- **Don't** add mascots, confetti, or streak-loss warnings in alarm colors; the reward is the XP flight, the fill and the badge pulse.
- **Don't** fly or color green an XP gain of zero, or show a reduced reward in red.
- **Don't** label every bar, add gridlines, or use more than one hue for magnitude.
- **Don't** set body, rows or forms in the expanded width; that axis is for display, page title, wordmark and badges.
- **Don't** hardcode hex or rgb literals in component CSS; add a token instead.
- **Don't** show placeholder numbers while stats load; use the neutral skeleton.
- **Don't** frame, recolor or borrow colors from the Spotify embed; it brings its own surface, and the system's palette stays ours.
- **Don't** color account state green or red, or turn a switch violet; administration carries no progress and no alarm.
- **Don't** darken the QR Ground tile in any theme; the code must stay readable by a camera.
