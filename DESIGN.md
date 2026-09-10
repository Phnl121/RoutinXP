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
  check-ring: "#6a6e7c"
  ink: "#f3f4f7"
  muted: "#a3a7b3"
  backdrop: "rgb(6 7 10 / 0.72)"
  green: "#22c55e"
  green-tip: "#86efac"
  green-wash: "rgb(34 197 94 / 0.1)"
  green-line: "rgb(34 197 94 / 0.35)"
  green-glow: "rgb(34 197 94 / 0.6)"
  on-green: "#0a2616"
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
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 110"
  page-title-compact:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "1.5rem"
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
    padding: "14px 32px"
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
    padding: "0.7rem 0.75rem 0.7rem 1rem"
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
  rail-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    padding: "0 14px"
    height: "44px"
  rail-item-selected:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.ink}"
  rail-chip:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "40px"
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
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.row-title}"
    rounded: "{rounded.row}"
    padding: "3px 12px 3px 0"
  task-row-hover:
    backgroundColor: "{colors.panel-2}"
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
- Category color is data, shown as an 8px dot beside the category name (the color picker swatch is the only fill).
- Charts are single-hue green magnitude, directly labeled once, with a table for screen readers.
- Motion is one ease-out curve; reduced-motion collapses it to near zero.

## Colors

A cool, near-black neutral stack with two saturated accents whose roles never overlap. The two accent values are the logo's colors (public/marca), so the brand mark and the interface speak the same violet and green. Translucent effect tokens derive from the accents so glows, washes and halos stay themeable.

### Primary
- **Level Green** (`green`): the progress color. XP fills, the NÍVEL badge (including the one inside the level toast), the avatar ring, completed checks and the check hover ring, earned "+n XP" labels and the flying "+n XP", the "Solte para concluir" drop hint, and the one highlighted phrase in a headline ("Suba de nível."). On the Painel it is every data mark: the XP-per-day bars, the category bars, the timeline's check circles and its earned "+n XP". It also colors the one save confirmation ("Perfil salvo."). Text on a green fill always uses **Deep Moss** (`on-green`), never white.
- **Green Tip** (`green-tip`): the lighter leading 0.9rem of the XP fill. Nowhere else.
- **Green Wash** (`green-wash`) and **Green Line** (`green-line`): the completion surfaces. Wash is the fill of the Quadro drop target, the fading flash on a just-completed row, and the login demo's level-up banner; Line is the border of the drop target, of that banner, and of the in-app level toast.
- **Green Glow** (`green-glow`): the transient level-up pulse shadow only.

### Secondary
- **Action Violet** (`purple`): primary and compact button fill, the FAB, the active underline-tab bar. **Violet Lift** (`purple-hover`) is its hover step only.
- **Soft Violet** (`purple-soft`): purple as text or line on dark. Link buttons (including the toast's Desfazer and the reminder's "Ver tarefas"), "+ Nova categoria", the MOSTRAR/OCULTAR field toggle, the focus outline and focused input border, the text caret. Use this, not `purple`, whenever violet must be read as text.
- **Violet Glow** (`purple-glow`), **Violet Halo** (`purple-halo`), **Violet Selection** (`purple-selection`), **Link Line** (`purple-link-line`): effect tokens. The button and FAB glow, the focused-input halo, the `::selection` tint, and the 40% underline on link buttons.
- **On Violet** (`on-purple`): label and icon color on violet fills.

### Neutral
- **Top Bar** (`topbar`): the app chrome tier, one step darker than Ground: the sticky top bar and the full-height side menu (and its mobile drawer), so both read as frame rather than as panels.
- **Ground** (`ground`): page background, input wells, the segmented-filter well, `theme-color`, favicon tile.
- **Panel** (`panel`): raised containers (form panel, demo panel, list and Quadro panels, category rail, Painel cards, Perfil panels, dialog, account menu, the level pill, the streak reminder, mobile category chips).
- **Panel Two** (`panel-2`): third tier. XP track and skeleton, row hover, side-menu item hover and current page, user-card hover, the selected rail item, the active segment, notice and toast backgrounds, the row's Excluir overlay, avatar fill, the chart column hover, the chart tooltip, the category-bar track.
- **Rule** (`rule`): 1px panel borders, row dividers, tab baseline, input border at rest, unselected chip border, the streak divider, the side menu's right edge, the streak reminder's border, the chart baseline, the 2px timeline connector.
- **Rule Strong** (`rule-strong`): input hover border, notice and toast border, the selected rail item's and current side-menu item's inset outline, the dashed "+ Nova categoria" chip, the dashed daily-cap line on the XP chart, the chart tooltip border, strike-through on completed titles, the destructive text action's underline, the toast time bar, scrollbar thumb.
- **Check Ring** (`check-ring`): the 2px ring of an unchecked completion circle. It exists because Rule Strong fell below 3:1 on Panel; Check Ring holds at least 3:1 there (WCAG 1.4.11 non-text contrast).
- **Backdrop** (`backdrop`): the scrim behind a modal dialog and behind the open mobile drawer.
- **Ink** (`ink`): primary text; today and overdue due dates; the fill of the neutral ERRO tag; the selected swatch ring; the chart's one direct value label; the "Mais concluída" line.
- **Muted** (`muted`): secondary text, labels, inactive tabs and segments, side-menu items at rest, icon buttons at rest, the reminder's clock icon, hints, "faltam n XP", category names, counts, future due dates, chart axis and cap labels, timeline times, the Excluir label, and a completed row's or timeline item's "+0 XP" and "…" (XP pending).

### Named Rules
**The Two Jobs Rule.** Green means progress and purple means action; neither ever stands in for the other. No green buttons, no purple XP, no third accent. Purple never marks selection: a current side-menu page, a selected rail item, chip, segment or swatch is shown with neutrals (Panel Two, Rule Strong, Ink). The single violet indicator is the active underline-tab bar, which marks the current mode. Green is also never spent on something that earned nothing: a "+0 XP" is Muted, and no flight launches for it.

**The Neutral Error Rule.** Errors are not red. An error is a notice on `panel-2` with a small pill tag in inverted neutrals (ink fill, ground text) reading "ERRO", followed by a plain-language sentence. This keeps the palette to two accents and keeps failure unalarming. The same holds for due dates: today and overdue get Ink and weight, never red. It holds for reduced rewards: when a completion earns less than usual (task created under 5 minutes ago, the daily XP cap reached or partly reached), an info toast names the reason in a plain sentence, in neutrals, with no tag and no red. And it holds for a streak at risk: the reminder is a Panel strip with a Muted clock, never an alarm.

**The Dot-Only Category Rule.** User-chosen category colors are data. They appear as an 8px round dot beside the category name (rail, chips, row category line, Lista group headings, the Painel's category bars and timeline items), never as fills, borders, text color, bars or backgrounds, and never without the name. The one exception is the color picker, where the swatch itself is the choice and fills a 36px circle.

**The Swappable Theme Rule.** Components read colors only through the `:root` custom properties, effects included (glows, washes, halos, backdrop). A new theme is a new set of variable values, not new component CSS. The only color literals outside `:root` are the category swatch values, which are user data.

## Typography

**Display Font:** Archivo Variable (with Archivo, system-ui, Segoe UI fallback)
**Body Font:** Archivo Variable (same stack)

**Character:** One grotesque carrying everything, split by weight and width. Extra-bold and slightly expanded, it reads as a game UI's scoreboard; at 400-600 and normal width it stays out of the way for rows and forms. Loaded with the weight and width axes (`@fontsource-variable/archivo/wdth.css`).

### Hierarchy
- **Display** (800, clamp 2.25rem to 3.5rem, width 110%, line-height 1.02): the single marketing headline (login). Balanced wrapping. At 60rem and below it uses **Display Compact** (clamp 1.875rem, 8vw, 2.5rem). One phrase may be Level Green when it names the reward.
- **Page Title** (800, 2rem, width 110%, line-height 1.1, -0.02em): the one heading of an app screen: the category name or "Todas as tarefas", "Painel", "Perfil". At 60rem and below it drops to **Page Title Compact** (1.5rem). Wraps anywhere rather than overflowing long category names.
- **Wordmark** (800, 1.625rem, width 112.5%, line-height 1): "RoutinXP" set in text, kept as a fallback only. The UI never typesets the name; it shows the horizontal logo (see Logo under Components).
- **Headline** (800, 1.5rem, line-height 1.15): titles inside panels, dialogs, empty states and single-task pages (Redefinir senha, Nenhuma tarefa ainda).
- **Stat Figure** (800, 1.5rem, line-height 1.1, tabular): the Painel's streak figures ("6 dias"), set above their Label caption (STREAK ATUAL, RECORDE).
- **Body Lead** (400, 1.0625rem, line-height 1.55, max 46ch, muted): the one supporting paragraph under a display headline.
- **Body** (400, 1rem, line-height 1.45): default; panel prose caps at 44ch at line-height 1.55.
- **Row Title** (600, 1rem, line-height 1.3): task titles and timeline titles, clamped to two lines. Rail and side-menu items use the same weight; the selected rail item goes 700.
- **Meta** (400, 0.8125rem): category line, due dates, counts, hints, timeline times. XP-bar secondary text, chart axis labels, the cap label and the user card's level line run 0.75rem.
- **Segment** (700, 0.8125rem): segmented filter labels, sentence case with a " · n" count, or a period ("7 dias").
- **Tab** (800, 0.875rem, 0.06em, uppercase): underline tabs.
- **Label** (700, 0.75rem, 0.07em, uppercase, muted): field labels, field toggles, the rail's CATEGORIAS title, Lista group headings and Quadro column titles (both carry " · n"), Painel card titles and the timeline's day headings (HOJE, ONTEM). The streak caption runs 0.6875rem.
- **Badge** (800, 0.6875rem, width 112.5%, 0.06em, uppercase): NÍVEL pill; 0.8125rem inside the login level meter.
- **XP Figure** (800, tabular): "XP 120 / 150", "+n XP", the top bar's streak figure ("6 dias") and the Painel's "n XP no total".

### Named Rules
**The Tabular Rule.** `font-variant-numeric: tabular-nums` is set at the root and stays on; counting XP must never shift its neighbors.

**The Width-for-Rank Rule.** Only display, page title, wordmark and badges use the expanded width axis. Body, rows, rail, side menu, charts, dialogs and forms stay at normal width.

## Layout

**Login.** A 70rem frame, centered, with page padding clamp(1.5rem, 5vw, 3.5rem) vertical by clamp(1rem, 4vw, 2.5rem) horizontal. Two columns: a flexible story column and a fixed 25rem form column, column gap clamp(2.5rem, 7vw, 6rem), row gap 2.25rem. Below 60rem it becomes one 30rem column in the order wordmark, headline, form, demo, and the form panel padding drops from 2rem to 1.5rem. Single-task pages (password reset) use a 26rem centered column with 1.5rem gaps.

**App shell.** Two columns at full height: the side menu (16.25rem, or 4.25rem when collapsed; the column width animates over 0.25s) and the content column. The content column stacks the sticky top bar (Top Bar fill, 1px Rule beneath, padding 0.875rem by clamp(1rem, 3vw, 2rem)), the streak reminder when it applies (1rem below the bar, matching the page's side padding, max 86rem), then the current page. On desktop the top bar holds only the centered level pill and, at the right, the actions (compact "+ Nova tarefa" and the avatar button); the logo lives in the side menu.

**Tarefas page.** The body is capped at 90rem and centered, padding clamp(1.25rem, 3vw, 2rem) with 6rem at the bottom for the FAB and toast, in two columns: a 16rem sticky category rail and the main column, gap clamp(1.5rem, 3vw, 2.5rem). The rail belongs to this page, not to the shell.

**Main column (Tarefas).** Page title, then a controls row: the underline tabs own the baseline; in Lista the segmented filter sits above that baseline at the right, positioned out of flow so switching Lista/Quadro never changes the height of the tab row. Content follows 1.5rem below. Quadro is two equal panels, 1.25rem apart, top-aligned.

**Painel.** The same 90rem cap and page padding. Page title, then a grid of a wide column (1.65fr: level panel, XP-per-day card, category card, 1.25rem apart) and a narrow column (1fr: the timeline panel), 1.25rem gap, top-aligned. The grid responds to its own width through a container query, not to the window, because the side menu (open, collapsed or drawer) changes the space: at 58rem of content width and below it becomes one column. Cards pad 1.5rem; the level panel pads 1.25rem by 1.5rem.

**Simple pages (Perfil).** One column of panels, max 44rem wide, 1.25rem apart, same page padding. Panels pad 1.75rem (1.25rem at 60rem and below). Field pairs sit in an auto-fit two-column grid (columns at least 9.5rem, 1rem gap) that stacks on its own when narrow.

**At 60rem and below (single column).** The side menu leaves the grid and becomes an off-canvas drawer; the top bar gains a menu button and the logo at the left, keeps the avatar at the right, and wraps the level pill to a full-width second row. "+ Nova tarefa" leaves the bar and becomes the FAB on every page. On Tarefas the rail becomes a horizontally scrolling chip row that bleeds to both screen edges (negative margin equal to the page padding, scrollbar hidden), and the segmented filter returns to flow under the tabs. The page title drops to 1.5rem; dialog field pairs stack; the toast lifts to clear the FAB; the Painel level panel wraps its XP bar to a full-width second line.

**At 48rem and below.** Quadro columns sit side by side at 86% width and scroll-snap horizontally; the Lista panel's inline padding tightens to 0.5rem.

**At 30rem and below.** Painel category bars put name and count on one line with the bar full width beneath, so the name is never cut; timeline items move the time onto the category line; the streak figures align left.

Spacing rhythm is a short step scale (8, 12, 16, 20, 24, 28, 32px): 8px between label and input, 20px between form fields, 16px between paired fields, 20px between Painel cards and between Perfil panels, 28px between tabs, 24px demo panel and Painel card padding, 32px form panel padding, 28px dialog and Perfil panel padding. Primary buttons and inputs are at least 48px tall; row check targets, rail items and side-menu items are 44px; the compact top-bar button, the menu and collapse buttons and mobile chips are 40px.

## Elevation & Depth

Depth is tonal first: chrome (top bar and side menu, darker), ground, panel, panel-2, each step separated by a 1px rule. On top of that, panels, the account menu, dialogs, the toast, the chart tooltip and the open mobile drawer carry one soft, diffuse drop shadow, and violet-filled actions carry a violet-tinted glow. The docked desktop side menu has no shadow; it is separated by its 1px Rule edge. There are no hard or offset shadows. Modal dialogs and the open drawer dim everything behind them with the Backdrop scrim.

### Shadow Vocabulary
- **Panel lift** (`--shadow`: `0 1px 2px rgb(0 0 0 / 0.35), 0 16px 40px -12px rgb(0 0 0 / 0.55)`): every panel, the rail, dialog, account menu, toast, chart tooltip and the open mobile drawer; always the same.
- **Action glow** (`0 8px 20px -10px var(--purple-glow)`): primary button at rest; tightens to `0 4px 10px -6px` on press.
- **FAB glow** (`0 10px 24px -8px var(--purple-glow)` plus Panel lift): the floating action button, which sits over content.
- **Focus halo** (`0 0 0 3px var(--purple-halo)`): focused input, paired with a Soft Violet border.
- **Selected inset** (`inset 0 0 0 1px var(--rule-strong)`): the selected rail item on desktop and the side menu's current page. An outline, not a lift.
- **Swatch ring** (`0 0 0 3px var(--panel), 0 0 0 5px var(--ink)`): the checked color swatch.
- **Level-up pulse** (`0 6px 18px -4px var(--green-glow)`): transient only, at the peak of the badge's scale pulse.

### Named Rules
**The One Lift Rule.** A panel has exactly one elevation. Content inside a panel is never another shadowed card; it is divided by rules. The level pill inside the top bar is a bordered Panel fill with no shadow, and the streak reminder is a bordered Panel strip with no shadow. The chart tooltip is the one floating element inside a card; it lifts because it hovers over the data, not because it is a card.

## Shapes

Soft, friendly geometry without going bubbly. Containers (panels, rail, dialog) round at 16px; controls (buttons, inputs, notices, toast, streak reminder, account menu, user card, icon buttons, level-up banner) at 10px; interactive rows, rail and side-menu items, menu items, chart columns on hover, the chart tooltip and small overlays at 8px. Data ends round at 4px: an XP bar rounds only its top corners and a category bar only its right end, so the baseline stays square. Anything that represents a count, a state token or a filter is a full pill: the NÍVEL badge, the XP track and fill, the level pill, the ERRO tag, the segmented well and its segments, mobile category chips, and the 3px active-tab bar. Circles are reserved for identity, completion, color and the floating action: the avatar, the task check, the timeline check, the category dot, the color swatch, the FAB. Borders are always 1px, solid except the dashed "+ Nova categoria" chip and the dashed daily-cap line; rings on the avatar and task check are 2px, and so is the timeline connector.

The icon family is drawn in-house on a 16px grid: 2px strokes (2.2px for the check), round caps and joins, no fills, color through `currentColor`. Ten glyphs exist (plus, check, pencil, list, chart, person, side-menu panel, menu, clock, close); new icons follow the same stroke. Icons sit at 1rem in buttons and 1.125rem in the side menu and reminder.

## Components

### Buttons
Solid, confident, one per form.
- **Shape:** gently rounded (10px), minimum 48px tall, 24px side padding, 700 weight. A leading 16px icon sits 0.45rem from the label.
- **Primary:** Action Violet fill, white label, Action Glow. Full width in a login form footer; right-aligned in dialogs; left of the save confirmation in Perfil.
- **Hover / Active:** fill steps to Violet Lift; press moves down 1px and tightens the glow. Disabled shows progress cursor at 70% opacity while the label switches to its "…ndo" form.
- **Compact:** 40px tall, 16px side padding. Only in the top bar ("+ Nova tarefa"), where the chrome row is shorter than a form. It works from any page: it opens Tarefas with the new-task dialog.
- **Link button:** Soft Violet text, 600 weight, 0.875rem, underline in Link Line with 4px offset that goes solid on hover. Used for secondary routes and dismissals ("Esqueci minha senha", "Cancelar", "Desfazer", "Ver tarefas", "Sair da conta").
- **Destructive text action:** Muted text, 600 weight, 0.875rem, underline in Rule Strong; hover turns Ink. Pinned to the left of a dialog's action row ("Excluir"). Destruction is never a violet fill and never red.
- **Icon button:** a 40px square, 10px radius, no fill, Muted icon; hover gives Panel Two and Ink. The top bar's menu button and the side menu's collapse and close buttons. Always carries an `aria-label`.
- **FAB:** at 60rem and below, a 56px Action Violet circle with a plus icon, fixed 1.25rem from the bottom-right (safe-area aware), carrying the FAB glow. It replaces the top bar's "+ Nova tarefa" and appears on every page: the shell renders it everywhere except Tarefas, which renders its own that opens the dialog in place.

### Inputs / Fields
- **Style:** Ground well inside the panel, 1px Rule border, 10px radius, 48px tall. The label sits above in Label style; an optional uppercase Soft Violet toggle (MOSTRAR / OCULTAR) sits at the label's right on the same baseline. Hints go below in Meta muted.
- **Select:** the same well with native appearance removed and a 2px Muted chevron drawn at the right.
- **Focus:** border turns Soft Violet with the 3px violet halo; no outline. Hover raises the border to Rule Strong. Autofill is forced back to Ground and Ink.
- **Error:** reported through the notice below the fields, not by recoloring inputs.

### Notice (error)
A `panel-2` block with a 1px Rule Strong border, 10px radius, a small pill tag in inverted neutrals reading "ERRO", then the message in 0.875rem. Enters with a 4px slide-down. Announced with `role="alert"`. This is the pattern for every inline error in the app, including the load-failure state.

### Streak Reminder
A quiet strip, distinct from the notice: it is not an error and never carries a tag. Shown under the top bar only when the streak is above zero and nothing was completed today (Brasília). Panel fill, 1px Rule border, 10px radius, no shadow, 0.875rem text. A leading 1.125rem clock icon in Muted, one plain sentence ("Conclua uma para manter sua sequência de 6 dias."), a "Ver tarefas" link button when not already on Tarefas, and a 36px dismiss button (Muted close icon, Panel Two and Ink on hover) that hides it until the next day. Announced with `role="status"`.

### Navigation: Side Menu
The app's primary navigation, full height at the left, in the Top Bar tier with a 1px Rule right edge; sticky, no shadow.
- **Top:** the horizontal logo (2rem tall) and, at the right, the collapse icon button.
- **Items:** Tarefas, Painel, Perfil. 44px rows, 8px radius, a 1.125rem icon 0.75rem from the label, 600 weight, Muted at rest. Hover gives Panel Two and Ink. The **current page** is neutral: Panel Two fill, the Selected inset in Rule Strong, Ink text. Never violet, never a side stripe.
- **User card:** pinned to the bottom; a 36px avatar, the user's name (0.875rem, 700, ellipsized; "Complete seu perfil" when empty) over "Nível n" (0.75rem, Muted). 10px radius, 8px padding. It links to Perfil and has a hover state only (Panel Two); it never shows the current-page state, because the Perfil item already carries it.
- **Collapsed (desktop):** a 4.25rem icon rail. The logo swaps for the 32px icon, the collapse button stacks under it, labels and the user card's text hide, items center their icons and show their name as a native tooltip. The choice persists in `localStorage`.
- **Drawer (60rem and below):** off-canvas at the left, min(18rem, 85vw) wide, slides in over 0.3s with the Panel lift, over the Backdrop scrim. When closed it is `visibility: hidden` so it leaves the tab order. The top bar's menu button opens it; focus moves to the drawer's close button, and returns to the menu button on close. Esc, the scrim, the close button or a route change close it. The collapse button is hidden here.

### Navigation: Underline Tabs
Uppercase Tab-style labels in Muted, 28px apart, over a 1px Rule baseline. The active tab turns Ink and gets a 3px fully rounded Action Violet bar that scales in from the center over the baseline (0.3s ease-out). Hover lifts the label to Ink. Use for switching what a screen *is*: modes and views (Entrar / Criar conta, Lista / Quadro).

### Segmented Filter
A pill well in Ground with a 1px Rule border and 3px inset; each segment is a 32px pill in Segment type, Muted, sentence case with its count ("Pendentes · 6"). The active segment gets a Panel Two fill and Ink text; hover lifts to Ink. No violet. Use for narrowing the *same* content by state or range (Pendentes / Concluídas in Lista, 7 dias / 30 dias on the Painel). Rule of thumb: if switching changes the layout, it is a tab; if it only changes which rows or days show, it is a segment. On Tarefas desktop it floats above the tab baseline at the right; everywhere else (a Painel card header, mobile) it sits in flow.

### Cards / Containers: Panel
- **Corner Style:** 16px.
- **Background:** Panel, with a 1px Rule border and the Panel lift shadow.
- **Internal Padding:** 32px on forms; 28px on Perfil panels; 24px on Painel cards, narrow screens and demo panels; list and Quadro panels use 8-16px so rows run nearly edge to edge.
- Sections inside a panel are separated by a 1px Rule, never by nested panels.

### App Top Bar
Sticky, Top Bar fill, 1px Rule beneath. Center: the **level pill**, a Panel fill with a 1px Rule border, fully rounded, holding the NÍVEL badge, a compact XP bar (clamp 10rem, 24vw, 20rem wide, 0.3rem between figure row and track) and the streak ("6 dias" in XP Figure over a 0.6875rem STREAK label), the streak split off by a 1px Rule. Right: compact "+ Nova tarefa" and the avatar button. On desktop there is nothing at the left; the logo is in the side menu. At 60rem and below the left holds the menu icon button and the logo (1.875rem tall), the right holds only the avatar, and the pill stretches across a second row. Until stats load, the pill renders as a **skeleton**: the same pill shape at clamp(16rem, 36vw, 30rem) with a single 8px Panel Two bar and `aria-busy`, never placeholder numbers.

### Account Menu
The 40px avatar button (Panel Two circle, green ring, initials) opens a native `popover`: Panel fill, 1px Rule, 10px radius, Panel lift, min 15rem, 8px padding. The user's name (0.875rem, 700) and e-mail (Meta muted) sit on top; items are full-width 8px-radius rows at 600 weight with a Panel Two hover ("Sair"). Light-dismiss and Esc come from the platform.

### Category Rail
Lives on the Tarefas page only.
- **Desktop:** a sticky Panel (16px radius, lift) with the CATEGORIAS label, then "Todas" and one 44px row per category: 8px dot, name (ellipsized), and the pending count in Meta muted at the right. Hover gives Panel Two. **Selected** is neutral: Panel Two fill, a 1px Rule Strong inset outline, 700 weight. No colored side stripe, no violet. On hover or keyboard focus a 32px pencil button fades in over the count, and the count fades out so they never overlap. "+ Nova categoria" sits once at the bottom under a 1px Rule, Soft Violet text with a plus icon.
- **Mobile (60rem and below):** the whole rail becomes one horizontally scrolling row that bleeds to the screen edges. Categories are 40px pill chips (Panel fill, 1px Rule border, dot, name, count); the selected chip swaps its border to Rule Strong and gains Panel Two, still neutral; the pencil appears only beside the selected chip. "+ Nova categoria" becomes a chip with a 1px dashed Rule Strong border at the end of the row.

### List Rows (tasks)
Rows are divided by 1px Rules between siblings, not boxed. A row is a three-column grid:
1. A 44px completion target holding a 24px circle with a 2px Check Ring ring. Hovering the target turns the ring and the tick green.
2. A text button (opens edit): Row Title, then a category line (8px dot and name in Meta muted), shown only when the view mixes categories.
3. A right column: the **due date** for pending rows, the **XP label** for completed rows.

Due dates are relative: "hoje", "amanhã", then "12 set", and "sem data" when empty. Today is Ink at 600, overdue is Ink at 700, future is Muted. Never red, never an alarm. In a narrow Quadro column (48rem and below) the date leaves the right column and joins the category line, so the title keeps the full width.

Hover gives the row a Panel Two background (8px radius). A pending row reveals an **Excluir** overlay (Panel Two, 8px radius, Muted text, Ink on hover) over the date on hover or focus-within, positioned out of flow so title and date never reflow; on touch devices (`hover: none`) it is hidden and deletion lives in the edit dialog. Completed rows: the circle fills green with a Deep Moss tick, the title goes Muted with a Rule Strong strike-through, the check target is disabled, and the row is not draggable. A just-completed row pops its check (scale 1.2, 0.45s) and flashes Green Wash that fades over 1.2s.

The server computes XP, so a completed row's XP label has three states: **pending** ("…" in Muted at 600, hidden from assistive tech) while the server answers; **zero** ("+0 XP" in Muted at 600) when the completion earned nothing; **earned** ("+n XP" in Level Green at 800) otherwise.

**The Earned Record Rule.** In the app's Concluídas and the Painel timeline, an earned "+n XP" stays full-strength Level Green: it is the record of what the task earned. A "+0 XP" is Muted because it records that nothing was earned, not because anything was collected. The login demo dims its completed "+n XP" to 40% only because there the XP has visibly flown to the counter, and the dimmed label reads as "already collected". Do not carry the dimming into real lists.

### Lista
One panel. In "Todas" the rows are grouped by category under Label-style headings carrying the category dot and count ("● FACULDADE · 3"); groups with no rows in the current filter are omitted, and rows drop their own category line since the heading carries it. When one category is selected the headings disappear. An empty filter shows a single Muted sentence inside the panel.

### Quadro
Two panels side by side, Pendentes and Concluídas, each titled in Label style with a count. Pending rows are draggable (grab cursor); the dragged row stays dark and dims to 40% in place, never lifting into a card. While a row is over Concluídas the column becomes the drop target: border Green Line, fill Green Wash, and a "Solte para concluir" line in green 700. Dropping completes the task exactly as the check does. There is no drag back to Pendentes. Empty columns show a Muted sentence.

### Painel
The progress overview. Every card is a Panel titled in Label style; a header row holds the title and, at the right, its control or highlight. Empty cards show one Muted sentence.
- **Level panel:** the NÍVEL badge, the XP bar (flexible) and "n XP no total" in XP Figure weight, one row. It takes values without the count-up.
- **XP per day:** titled "Sua semana" or "Seus últimos 30 dias", with the 7 / 30 dias segmented filter in flow at the right and a Muted summary line ("n tarefas concluídas · n XP") below.
- **Conclusões por categoria:** a Muted period line under the title and "Mais concluída: …" in Ink at 600 at the right.
- **Linha do tempo:** the tall narrow card. Its header holds the title and two streak figures (STREAK ATUAL, RECORDE) in Stat Figure over Label captions, closed by a 1px Rule.

### Charts (signature for data)
One language for every chart: magnitude is **single-hue Level Green**, the scale is neutral, and each value is readable without the hover.
- **XP bars:** a 12rem plotting area over a 1px Rule baseline. Bars are green, min(2.75rem, 72%) wide within equal columns (gap clamp 0.25rem to 0.75rem), with 4px rounded top corners and a square foot. At 30 days the gap drops to 2px and bars fill their columns. The scale is the larger of the daily cap and the tallest day. A **dashed 1px Rule Strong line** marks the 150 XP daily cap as the scale reference, labeled at its right end ("teto diário · 150 XP", 0.75rem Muted). Only the **tallest bar** carries a direct value label above it ("50 XP", 0.75rem, 700, Ink). Axis labels run 0.75rem Muted beneath (weekday for 7 days; every fifth date for 30).
- **Hover:** the column gets a Panel Two 8px-radius wash and a tooltip appears above ("seg 8 set · 50 XP · 3 tarefas"): Panel Two, 1px Rule Strong border, 8px radius, Panel lift, 0.75rem at 600, fading in over 0.15s. Near the chart's ends the tooltip aligns inward so it never leaves the card.
- **Accessibility:** the bars are `aria-hidden`; a visually hidden table (Dia, XP, Tarefas) carries the same data, captioned with the card title.
- **Category bars:** one row per category in a three-column grid (name up to 11rem, bar, count in 2.25rem), 0.75rem apart. The name is the 8px category dot plus the name at 600, ellipsized; the bar is a 0.75rem Panel Two track with a green fill scaled to the largest category, both square at the start and 4px round at the end; the count is 700, right-aligned. The category color appears only on the dot.

### Timeline
Recent completions (up to 12), grouped by day under Label headings ("HOJE", "ONTEM", "seg, 8 set"). Each item is a row: a 24px green circle with a Deep Moss check, the title (Row Title, clamped to two lines, breaking anywhere) over the category line (dot and name, Meta muted), the time (Meta muted), and the XP label right-aligned in a 3.75rem column: "+n XP" in green at 800, "+0 XP" in Muted at 600. Items are divided by 1px Rules, and a 2px Rule line runs vertically behind the check circles within each day, joining them. The circles are marks, not controls.

### Perfil
A simple page (Page Title, then two panels). The first holds the profile form: first name and surname, birth date and occupation, each pair in the auto-fit two-column grid, then the primary "Salvar perfil" with "Perfil salvo." (0.875rem, 600, Level Green, `role="status"`) beside it once saved. When the profile is incomplete the title becomes "Complete seu perfil" and one Muted sentence (44ch) leads the panel. The second panel, titled CONTA in Label style, lists the e-mail (Meta muted term, Ink value) and a "Sair da conta" link button.

### Dialog
A native modal `<dialog>` (focus trapped, Esc and backdrop click close), Panel fill, 1px Rule, 16px radius, Panel lift, width min(100% - 2rem, 32rem), 28px padding, over the Backdrop scrim. Enters with a 10px rise and 0.98 scale (0.35s ease-out). A Headline title, then a standard form (fields 20px apart; a pair of fields, such as category and date, sits in two columns and stacks at 60rem and below), then the action row: destructive text action pinned left (only when editing), then "Cancelar" as a link button, then the primary button at the right. Errors appear as a notice above the actions.

### Color Picker
A fieldset with a Label legend and eight 36px circular swatches, 11px apart, drawn from a fixed soft palette tuned to sit on dark (blue, teal, amber, rose, terracotta, sand, slate, lavender; values live in `formCategoria.cores`). Each swatch is a real radio with the color's name as its title. The checked swatch gets a two-step ring (Panel gap, then Ink); keyboard focus adds the Soft Violet outline 6px out. This is the one place a category color fills a shape.

### Toast
Fixed, centered 1.5rem above the bottom (above the FAB on mobile), Panel Two fill, 1px Rule Strong border, 10px radius, Panel lift, 0.875rem at 600. Enters with a 12px rise. One toast at a time. Announced politely (`role="status"`, or `alert` for errors). Four variants:
- **Undo:** "Tarefa excluída" with a "Desfazer" link button and a 2px Rule Strong time bar along the bottom edge that shrinks to zero over 5s.
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
- **In the app:** the flight is fixed-position above everything (1rem, 0.7s, starting at scale 1.15), launched from the completed row's check or, in Quadro, from the point where the row was dropped, and aimed at the top bar's "XP n / m" figure. Stats are applied on arrival, and a fallback timer (850ms) applies them if the animation never ends (background tab). A completion that earned 0 XP launches no flight; stats apply at once.
- **In the login demo:** the flight stays inside the demo panel (0.6s, from scale 1.1), starting at the row's XP label.
- **Level-up in the top bar:** the bar fills to 100% in the old level (0.7s), holds 750ms, then snaps with no transition to the new level and the badge pulses. About 1.5s after arrival, once that sequence has played, the level toast confirms it. On first load, and whenever stats arrive or resync, the meter takes its values with no animation. The login demo confirms a level change with an inline banner (Green Wash fill, Green Line border, 10px radius) instead of a toast.
- Reduced motion collapses the flight and the fill; the count jumps to its target.

### Logo
The brand mark lives in public/marca: horizontal logo (icon plus name), vertical logo, name alone, and the icon, each as SVG with PNG copies. The horizontal SVG is the wordmark everywhere, sized by height with its 1992:512 ratio reserved so the page never jumps: 2.75rem tall on the login, 2rem at the top of the side menu, 1.875rem in the mobile top bar. The icon alone (32px) stands in for it in the collapsed side menu, and is the favicon (SVG, with a 512px PNG and apple-touch icon). The logo carries the accent colors; do not recolor, outline or typeset it.

### Avatar
A Panel Two circle with a 2px green ring and initials at 700: 48px in a profile card, 40px as the top bar's account button (hover fill Rule), 36px in the side menu's user card. Never on the login.

## Do's and Don'ts

### Do:
- **Do** read every color, including glows, washes, halos and the backdrop, through the `:root` custom properties so a theme can replace them in one place.
- **Do** keep green for XP, level and completion, and purple for actions and focus; use Soft Violet when violet must be read as text.
- **Do** mark selection and the current page with neutrals: Panel Two fill plus a Rule Strong outline or border.
- **Do** put Deep Moss text on green fills and white text on violet fills.
- **Do** separate content inside a panel with 1px Rules; list items are rows, not cards.
- **Do** show category color as an 8px dot next to the category name; only the color picker fills a shape with it.
- **Do** use underline tabs to switch views and the segmented pill to filter rows or ranges within a view.
- **Do** show due dates relatively ("hoje", "amanhã", "12 set"), with today and overdue in Ink and weight.
- **Do** keep an earned "+n XP" full-strength green in real lists and the timeline; it is the earned record. Show "+0 XP" and the pending "…" in Muted.
- **Do** name the reason in a neutral info toast when a completion earns less than usual.
- **Do** apply XP only when the flight lands, with a fallback timer so a stalled animation never withholds it.
- **Do** draw charts in single-hue green with 4px rounded data ends, a neutral scale reference, one direct label on the extreme value, a hover tooltip, and a visually hidden table with the same data.
- **Do** size responsive grids that sit beside the side menu by container query, not by window width.
- **Do** use the horizontal logo as the wordmark (2.75rem login, 2rem side menu, 1.875rem mobile top bar) and the icon as favicon and collapsed-menu mark.
- **Do** report errors with the neutral notice and its ERRO pill tag; keep reminders as a tagless Panel strip.
- **Do** animate XP by count-up plus a `translateX` fill on the shared ease-out `cubic-bezier(0.16, 1, 0.3, 1)`, and let reduced-motion collapse it.
- **Do** keep primary buttons and inputs at least 48px tall, completion targets and navigation items at least 44px, and icon buttons 40px.
- **Do** draw new icons on the 16px grid with a 2px round-capped stroke in `currentColor`.

### Don't:
- **Don't** add a third accent, or use red for errors, overdue dates, deletion or a streak at risk.
- **Don't** use purple, a colored side stripe, or the category color to mark a selected item or the current page.
- **Don't** fill, border or tint surfaces or chart bars with category colors.
- **Don't** nest a shadowed card inside a panel.
- **Don't** use hard or offset shadows; the only shadows are the soft lift, the violet glows, the focus halo, the selected inset, the swatch ring and the transient level-up pulse.
- **Don't** add mascots, confetti, or streak-loss warnings in alarm colors; the reward is the XP flight, the fill and the badge pulse.
- **Don't** fly or color green an XP gain of zero, or show a reduced reward in red.
- **Don't** label every bar, add gridlines, or use more than one hue for magnitude.
- **Don't** set body, rows or forms in the expanded width; that axis is for display, page title, wordmark and badges.
- **Don't** hardcode hex or rgb literals in component CSS; add a token instead.
- **Don't** show placeholder numbers while stats load; use the neutral skeleton.
