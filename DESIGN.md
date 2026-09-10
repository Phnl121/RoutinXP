---
name: Rotina
description: Gamified routine app in a dark learning-platform convention; finish a task, earn XP, level up.
colors:
  ground: "#121318"
  panel: "#1c1d24"
  panel-2: "#25262f"
  rule: "#2e3039"
  rule-strong: "#454856"
  ink: "#f3f4f7"
  muted: "#a3a7b3"
  green: "#2bd576"
  on-green: "#0a2616"
  purple: "#8e2de2"
  purple-hover: "#9d47ec"
  purple-soft: "#c28cf6"
  on-purple: "#ffffff"
typography:
  display:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(2.25rem, 4.2vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1.02
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
  link-button:
    textColor: "{colors.purple-soft}"
    typography: "{typography.meta}"
    padding: "4px 0"
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
  task-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.row-title}"
    rounded: "{rounded.row}"
    padding: "12px 10px"
  task-row-hover:
    backgroundColor: "{colors.panel-2}"
  tab:
    textColor: "{colors.muted}"
    typography: "{typography.tab}"
    padding: "4px 0 14px"
  tab-active:
    textColor: "{colors.ink}"
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
---

# Design System: Rotina

## Overview

**Creative North Star: "The Level Always in View"**

Rotina follows the gamified learning-platform convention (DIO as the reference, Duolingo and Habitica as the craft bar) rather than an invented world. The system exists to make one moment land: a task is finished, "+10 XP" flies to the counter, the number counts up, the bar fills, and on a level change the badge pulses. Everything else is quiet dark chrome that lets that moment be the brightest thing on screen.

Surfaces are a near-black ground with slightly lifted panels, separated by 1px rules. Density is operational, not editorial: rows, fields and meters sit close, labels are small uppercase, and figures are tabular so numbers never jitter while counting. Type is one family, Archivo, pushed to extra-bold and slightly expanded for the headline, wordmark and badges; everything else is plain weight at normal width.

Two accents carry all meaning. Green is progress (XP, level, fills, completed checks). Purple is action (primary buttons, the active tab bar, focus, link text). Every color is a custom property on `:root` so a later theme can swap the whole set by overriding variables on a `[data-tema]` scope; the system must stay expressible that way.

**Key Characteristics:**
- Dark ground, lifted panels, 1px rules; no nested cards.
- Exactly two accents with fixed jobs: green = XP and level, purple = actions.
- Archivo variable, extra-bold and 110-112.5% width for display, wordmark and badges.
- Tabular figures everywhere; XP numbers animate by counting, never by swapping.
- Category color is data, shown only as an 8px dot beside the category name.
- Motion is one ease-out curve; reduced-motion collapses it to near zero.

## Colors

A cool, near-black neutral stack with two saturated accents whose roles never overlap.

### Primary
- **Level Green** (`green`): the progress color. XP fills, the NÍVEL badge, the avatar ring, completed checks, "+10 XP" labels and the flying "+10 XP", and the one highlighted phrase in a headline ("Suba de nível."). Text on a green fill always uses **Deep Moss** (`on-green`), never white.

### Secondary
- **Action Violet** (`purple`): primary button fill, the active tab's underline bar, text-selection tint. **Violet Lift** (`purple-hover`) is its hover step only.
- **Soft Violet** (`purple-soft`): purple as text or line on dark. Link buttons, the MOSTRAR/OCULTAR field toggle, the focus outline and focused input border, the text caret. Use this, not `purple`, whenever violet must be read as text.
- **On Violet** (`on-purple`): label text on the primary button.

### Neutral
- **Ground** (`ground`): page background, input wells, `theme-color`, favicon tile.
- **Panel** (`panel`): raised containers (form panel, demo/meter panel).
- **Panel Two** (`panel-2`): third tier. XP track, row hover, notice background, avatar fill.
- **Rule** (`rule`): 1px panel borders, row dividers, tab baseline, input border at rest.
- **Rule Strong** (`rule-strong`): input hover border, notice border, unchecked check ring, strike-through color on completed titles, scrollbar thumb.
- **Ink** (`ink`): primary text; also the fill of the neutral ERRO tag.
- **Muted** (`muted`): secondary text, labels, inactive tabs, hints, "faltam n XP", category names.

### Named Rules
**The Two Jobs Rule.** Green means progress and purple means action; neither ever stands in for the other. No green buttons, no purple XP, no third accent.

**The Neutral Error Rule.** Errors are not red. An error is a notice on `panel-2` with a small pill tag in inverted neutrals (ink fill, ground text) reading "ERRO", followed by a plain-language sentence. This keeps the palette to two accents and keeps failure unalarming.

**The Dot-Only Category Rule.** User-chosen category colors are data. They appear only as an 8px round dot beside the category name, never as fills, borders, text color, or backgrounds, and never without the name.

**The Swappable Theme Rule.** Components read colors only through the `:root` custom properties. A new theme is a new set of variable values, not new component CSS.

## Typography

**Display Font:** Archivo Variable (with Archivo, system-ui, Segoe UI fallback)
**Body Font:** Archivo Variable (same stack)

**Character:** One grotesque carrying everything, split by weight and width. Extra-bold and slightly expanded, it reads as a game UI's scoreboard; at 400-600 and normal width it stays out of the way for rows and forms. Loaded with the weight and width axes (`@fontsource-variable/archivo/wdth.css`).

### Hierarchy
- **Display** (800, clamp 2.25rem to 3.5rem, width 110%, line-height 1.02): the single page headline. Balanced wrapping. Below 60rem it drops to clamp(1.875rem, 8vw, 2.5rem). One phrase may be Level Green when it names the reward.
- **Wordmark** (800, 1.625rem, width 112.5%, line-height 1): "Rotina" in text; no logo asset exists.
- **Headline** (800, 1.5rem, line-height 1.15): titles inside panels and simple pages (Redefinir senha, Confira seu e-mail).
- **Body Lead** (400, 1.0625rem, line-height 1.55, max 46ch, muted): the one supporting paragraph under a display headline.
- **Body** (400, 1rem, line-height 1.45): default; panel prose caps at 44ch.
- **Row Title** (600, 1rem, line-height 1.3): task titles, clamped to two lines.
- **Meta** (400, 0.8125rem): category name, hints, XP-bar secondary text (0.75rem there).
- **Tab** (800, 0.875rem, 0.06em, uppercase): segmented tabs.
- **Label** (700, 0.75rem, 0.07em, uppercase, muted): field labels, field toggles, section titles over a list (the list title runs 0.8125rem, 0.06em).
- **Badge** (800, 0.6875rem, width 112.5%, 0.06em, uppercase): NÍVEL pill; 0.8125rem inside a level meter.
- **XP Figure** (800, tabular): "XP 120 / 150" and "+10 XP".

### Named Rules
**The Tabular Rule.** `font-variant-numeric: tabular-nums` is set at the root and stays on; counting XP must never shift its neighbors.

**The Width-for-Rank Rule.** Only display, wordmark and badges use the expanded width axis. Body, rows and forms stay at normal width.

## Layout

The login uses a 70rem frame, centered, with page padding clamp(1.5rem, 5vw, 3.5rem) vertical by clamp(1rem, 4vw, 2.5rem) horizontal. Two columns: a flexible story column and a fixed 25rem form column, column gap clamp(2.5rem, 7vw, 6rem), row gap 2.25rem. The wordmark spans the top; the form panel is top-aligned with the headline; the demo sits under the intro.

Below 60rem the grid becomes one 30rem column in the order wordmark, headline, form, demo, and the form panel padding drops from 2rem to 1.5rem. Single-task pages (password reset) use a 26rem centered column with 1.5rem gaps. App chrome uses a top bar with a bottom rule and the same clamp horizontal padding.

Spacing rhythm is a short step scale (8, 12, 16, 20, 24, 28, 32px): 8px between label and input, 20px between form fields, 16px inside the form footer, 28px between tabs, 24px demo panel padding, 32px form panel padding. Touch targets are at least 48px tall for buttons and inputs.

## Elevation & Depth

Depth is tonal first: ground, then panel, then panel-2, each step separated by a 1px rule. On top of that, panels carry one soft, diffuse drop shadow to lift them off the ground, and the primary button carries a violet-tinted glow. There are no hard or offset shadows.

### Shadow Vocabulary
- **Panel lift** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.35), 0 16px 40px -12px rgb(0 0 0 / 0.55)`): every panel, always the same.
- **Action glow** (`box-shadow: 0 8px 20px -10px rgb(142 45 226 / 0.75)`): primary button at rest; tightens to `0 4px 10px -6px` on press.
- **Focus halo** (`box-shadow: 0 0 0 3px rgb(142 45 226 / 0.35)`): focused input, paired with a Soft Violet border.
- **Level-up pulse** (`0 6px 18px -4px rgb(43 213 118 / 0.6)`): transient only, at the peak of the badge's scale pulse.

### Named Rules
**The One Lift Rule.** A panel has exactly one elevation. Content inside a panel is never another shadowed card; it is divided by rules.

## Shapes

Soft, friendly geometry without going bubbly. Containers round at 16px, controls (buttons, inputs, notices, level-up banner) at 10px, interactive rows at 8px. Anything that represents a count or a state token is a full pill: the NÍVEL badge, the XP track and fill, the ERRO tag. Circles are reserved for identity and completion: the avatar, the task check, the category dot. Borders are always 1px, except the 2px rings on the avatar and the task check; the active-tab bar is 3px with its top corners rounded.

## Components

### Buttons
Solid, confident, one per form.
- **Shape:** gently rounded (10px), minimum 48px tall, 24px side padding, 700 weight.
- **Primary:** Action Violet fill, white label, Action Glow. Full width in a form footer.
- **Hover / Active:** fill steps to Violet Lift; press moves down 1px and tightens the glow. Disabled shows progress cursor at 70% opacity while the label switches to its "…ndo" form.
- **Link button:** Soft Violet text, 600 weight, 0.875rem, underline at 40% opacity with 4px offset that goes solid on hover. Used for secondary routes ("Esqueci minha senha", "Voltar para o login", "Recomeçar exemplo", "Sair").

### Inputs / Fields
- **Style:** Ground well inside the panel, 1px Rule border, 10px radius, 48px tall. The label sits above in Label style; an optional uppercase Soft Violet toggle (MOSTRAR / OCULTAR) sits at the label's right on the same baseline. Hints go below in Meta muted.
- **Focus:** border turns Soft Violet with the 3px violet halo; no outline. Hover raises the border to Rule Strong. Autofill is forced back to Ground and Ink.
- **Error:** reported through the notice below the fields, not by recoloring inputs.

### Notice (error)
A `panel-2` block with a 1px Rule Strong border, 10px radius, a small pill tag in inverted neutrals reading "ERRO", then the message in 0.875rem. Enters with a 4px slide-down. Announced with `role="alert"`. This is the pattern for every error in the app.

### Navigation: Underline Tabs
Uppercase Tab-style labels in Muted, 28px apart, over a 1px Rule baseline. The active tab turns Ink and gets a 3px Action Violet bar that scales in from the center over the baseline (0.3s ease-out). Hover lifts the label to Ink. Use for any two-to-four-way mode switch (Entrar / Criar conta now; Lista / Quadro and Pendentes / Concluídas filters inherit it).

### Cards / Containers: Panel
- **Corner Style:** 16px.
- **Background:** Panel, with a 1px Rule border and the Panel Lift shadow.
- **Internal Padding:** 32px (24px on narrow screens and for list panels).
- Sections inside a panel are separated by a 1px Rule, never by nested panels.

### List Rows (tasks)
Rows are divided by 1px Rules between siblings, not boxed. Each row is a full-width button: a 24px circular check (2px Rule Strong ring), a text stack (Row Title plus category line: 8px color dot and the name in Meta muted), and a right-aligned green "+10 XP". Hover gives the row a Panel Two background (8px radius) and turns the check ring green. Completed: check fills green with a Deep Moss tick and a 1.18 scale pop, title goes Muted with a Rule Strong strike-through, and the XP label drops to 40% opacity. The whole row is the touch target.

### Level Badge (signature)
Green pill, Deep Moss text, "NÍVEL n", Badge type. On a level change it pulses once (scale to 1.2 with the green pulse shadow, 0.7s).

### XP Bar (signature)
Above the track: the XP figure ("XP 120 / 150") left, "faltam n XP" muted right, 0.75rem. The track is an 8px Panel Two pill; the fill is a full-width green pill slid in with `translateX` (never width), with a lighter leading tip in its last 0.9rem and a 4% minimum so it is never invisible. The fill transition and the count-up both run 0.7s on the same ease-out, so number and bar arrive together. Exposed as a `progressbar` with min, max and now.

### Level Meter
Badge (meter size) and XP bar side by side in a flex row, closed by a 1px Rule beneath. This is the compact progress header for any panel that lists tasks.

### XP Flight and Level-Up (signature interaction)
Completing a task launches "+10 XP" (green, 800, 0.9375rem) from the row's XP label to the XP figure (0.6s, scale 1.1 to 0.75, fades in its last 20%). On arrival the figure counts up and the bar fills. On a level change the bar fills to 100% in the old level, holds 750ms, then snaps (no transition) to the new level at 0 and the badge pulses; a green-tinted banner (green at 10% fill, 35% border, 10px radius) confirms it. Changes are announced through a polite live region. The same sequence is used in the login demo and in the app.

### Avatar
48px circle, Panel Two fill, 2px green ring, initials at 700. Appears only inside the app (profile card), never on the login.

## Do's and Don'ts

### Do:
- **Do** read every color through the `:root` custom properties so a theme can replace them in one place.
- **Do** keep green for XP, level and completion, and purple for actions and focus; use Soft Violet when violet must be read as text.
- **Do** put Deep Moss text on green fills and white text on the violet button.
- **Do** separate content inside a panel with 1px Rules; list items are rows, not cards.
- **Do** show category color only as an 8px dot next to the category name.
- **Do** report errors with the neutral notice and its ERRO pill tag.
- **Do** animate XP by count-up plus a `translateX` fill on the shared ease-out `cubic-bezier(0.16, 1, 0.3, 1)`, and let reduced-motion collapse it.
- **Do** keep buttons, inputs and completion rows at least 48px tall.

### Don't:
- **Don't** add a third accent, or use red for errors.
- **Don't** fill, border or tint surfaces with category colors.
- **Don't** nest a shadowed card inside a panel.
- **Don't** use hard or offset shadows; the only shadows are the soft lift, the violet glow, the focus halo and the transient level-up pulse.
- **Don't** add mascots, confetti, or streak-loss warnings in alarm colors; the reward is the XP flight, the fill and the badge pulse.
- **Don't** set body, rows or forms in the expanded width; that axis is for display, wordmark and badges.
- **Don't** hardcode hex or rgb literals in component CSS; add a token instead.
