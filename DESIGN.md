---
name: Panoramex CRM
description: Sales command center for tour operators — close faster, see further.
colors:
  navy-deep: "#021848"
  navy-container: "#1C2E5E"
  coral: "#E8483A"
  coral-hover: "#C73D30"
  surface: "#fbf8fd"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f5f3f8"
  surface-container: "#efedf2"
  surface-container-high: "#e9e7ec"
  surface-variant: "#e4e2e6"
  on-surface: "#1b1b1f"
  on-surface-variant: "#45464f"
  on-primary: "#ffffff"
  outline: "#757680"
  outline-variant: "#c5c6d0"
  status-qualified: "#16A34A"
  status-process: "#D97706"
  status-no-response: "#DC2626"
  status-new: "#6B7280"
  status-confirmed: "#2563EB"
  status-converted: "#0D9488"
  error: "#ba1a1a"
typography:
  display:
    fontFamily: "\"Plus Jakarta Sans\", sans-serif"
    fontSize: "48px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "\"Plus Jakarta Sans\", sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "\"Plus Jakarta Sans\", sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "\"Plus Jakarta Sans\", sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.05em"
  mono:
    fontFamily: "\"JetBrains Mono\", monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
  giant: "48px"
components:
  button-primary:
    backgroundColor: "{colors.navy-deep}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.navy-container}"
  button-secondary:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.coral-hover}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.navy-deep}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.navy-deep}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  input-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  card-default:
    backgroundColor: "{colors.surface-container-lowest}"
    rounded: "{rounded.xl}"
    padding: "20px"
---

# Design System: Panoramex CRM

## 1. Overview

**Creative North Star: "The Navigator's Command Center"**

Panoramex CRM is a precision instrument — not a generic productivity tool. Every surface exists to help a sales agent navigate a prospect from first contact to confirmed booking with zero wasted motion. The aesthetic reflects the seriousness of that mission: deep navy that communicates authority and focus, coral that fires only as a decisive action signal, and a clean light canvas that lets data breathe without ever feeling airy or casual.

The system favors clarity over cleverness. Charts are legible at a glance. Status badges are unmistakably color-coded. Navigation is immediate and predictable. The design earns trust by staying out of the agent's way — a good session ends with bookings closed, not with the agent remembering UI.

This system explicitly rejects the generic Bootstrap/Material template feel. No default blue-button-on-white patterns, no placeholder icon libraries, no lorem-ipsum card grids. Every component is intentional, every state is handled, and every data point has a clear visual hierarchy.

**Key Characteristics:**
- Deep navy sidebar as an anchor — the always-present north star of the layout
- Coral as a precision action color — reserved for CTAs and live status indicators only
- Status semaphore system — six semantic colors that agents read in under a second
- Light, structured canvas — surface variants provide depth without shadows
- Inter for data, Plus Jakarta Sans for identity — two voices, one system

## 2. Colors: The Command Palette

A disciplined two-pole palette anchored in navy authority and coral urgency, with a semantic semaphore for prospect lifecycle states.

### Primary
- **Deep Navy** (`#021848`): The dominant surface color of the sidebar and primary action backgrounds. Communicates authority, structure, and focus. Used on ≤30% of any given screen — exclusively the navigation shell and primary buttons.
- **Navy Container** (`#1C2E5E`): Hover state for navigation items and secondary navy surfaces. Active nav items use this as background with coral text — the intersection of structure and action.

### Secondary
- **Coral Signal** (`#E8483A`): The system's action trigger. Used on the secondary button variant (book a tour, send a message, primary CTAs in the content area), notification dots, and active status indicators. Never decorative — it always means "do something now."
- **Coral Hover** (`#C73D30`): The deepened hover state. Confirms interaction without surprising the user.

### Tertiary — Semaphore System
The six prospect-lifecycle status colors form a closed semantic system. Each maps to exactly one pipeline state:

- **Qualified Green** (`#16A34A`): Prospect is sales-ready.
- **In-Process Amber** (`#D97706`): Active engagement ongoing.
- **No-Response Red** (`#DC2626`): Requires immediate follow-up.
- **New Gray** (`#6B7280`): Fresh lead, not yet engaged.
- **Confirmed Blue** (`#2563EB`): Booking placed, awaiting finalization.
- **Converted Teal** (`#0D9488`): Deal closed — the goal state.

### Neutral
- **Off-White Canvas** (`#fbf8fd`): The main content background and surface base. Clean without being clinical.
- **Pure White** (`#ffffff`): Cards and modals — one step above the base canvas, creating depth through tonal layering rather than shadow.
- **Surface Low** (`#f5f3f8`): Input backgrounds, secondary containers, zebra rows.
- **Surface Mid** (`#efedf2`): Dividers expressed as background shifts rather than lines.
- **Surface High** (`#e9e7ec`): Hover states on neutral surfaces and selected row backgrounds.
- **Surface Variant** (`#e4e2e6`): Ghost button hover backgrounds, chip defaults.
- **Ink** (`#1b1b1f`): Primary text — near-black, not pure black.
- **Ink Muted** (`#45464f`): Secondary text, labels, metadata, helper text.
- **Outline** (`#757680`): Stroke borders, icon defaults at rest.
- **Outline Variant** (`#c5c6d0`): Input strokes, divider lines, subtle separators.

### Named Rules
**The Coral Scarcity Rule.** Coral appears on ≤10% of any given screen. Its rarity is the point — when agents see coral, they know something needs their action. Using coral as a decorative color drains that signal.

**The Semaphore Purity Rule.** The six status colors are never used outside their status context. Do not use `#16A34A` (Qualified Green) on a chart line or a decorative accent. The moment a status color appears for decoration, the whole semaphore degrades.

## 3. Typography

**Display / Headline Font:** Plus Jakarta Sans (with `sans-serif` fallback)
**Body / Data Font:** Inter (with `sans-serif` fallback)
**Mono Font:** JetBrains Mono (with `monospace` fallback)

**Character:** Plus Jakarta Sans leads — a geometric sans with enough warmth to avoid feeling cold. It carries brand authority at display size and sharpness at label size. Inter handles data density with perfect legibility at 14–16px. JetBrains Mono carries IDs, codes, and reference numbers.

### Hierarchy
- **Display** (800 weight, 48px, 1.1 line-height, -0.02em tracking): Reserved for hero stats or onboarding moments. Not for everyday page titles.
- **Headline H1** (700 weight, 30px, 1.3 line-height, -0.01em tracking): Page headers and modal titles. One per view.
- **Headline H2** (600 weight, 24px, 1.4 line-height): Section headers within a page; card section leaders.
- **Headline H3** (600 weight, 20px, 1.4 line-height): Sub-section headers, sidebar group labels.
- **Body Large** (Inter, 400 weight, 16px, 1.6 line-height): Primary content text. Max line length 65–75ch.
- **Body Medium** (Inter, 400 weight, 14px, 1.6 line-height): Secondary content, table data, most form fields.
- **Label Caps** (Plus Jakarta Sans, 700 weight, 12px, 0.05em tracking, uppercase): Column headers and filter labels — one per logical group, not one per section.
- **Mono** (JetBrains Mono, 400 weight, 13px, 1.5 line-height): IDs, phone numbers, codes, timestamps.

### Named Rules
**The Mono Precision Rule.** Any value that is looked up, copied, or compared — IDs, phone numbers, confirmation codes, currency amounts in data cells — uses JetBrains Mono. The monospace baseline alignment makes scanning a column of numbers immediate.

## 4. Elevation

This system uses **tonal layering, not shadows**, as its primary depth strategy. Depth is expressed by stepping up the surface ramp (`surface → surface-container-low → surface-container-lowest`) rather than by stacking drop shadows.

Shadows are reserved for exactly two cases: interactive elevation (a card's hover shadow signals it's clickable) and modal dialogs (the backdrop lift separates the overlay from the page).

### Shadow Vocabulary
- **Resting Card** (`box-shadow: 0 1px 2px rgba(0,0,0,0.06)`): KPI cards, prospect cards at rest.
- **Hover Card** (`box-shadow: 0 4px 12px rgba(0,0,0,0.10)`): Confirms interactivity on hover.
- **Sidebar** (`box-shadow: 2px 0 8px rgba(0,0,0,0.12)`): Structural separation from content canvas.
- **Modal** (`box-shadow: 0 20px 60px rgba(0,0,0,0.18)`): Full overlay dialogs with 200ms scale animation.
- **Toast** (`box-shadow: 0 4px 16px rgba(0,0,0,0.14)`): Slides in from right.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. A shadow on a non-interactive element is a lie — it implies the element is clickable. If it isn't, remove the shadow.

## 5. Components

### Buttons

- **Shape:** `rounded-lg` (12px). Full-pill (`rounded-full`) reserved for tag chips and filter pills only.
- **Primary:** Navy deep (`#021848`) background, white text. `px-4 py-2` (md), `px-6 py-3` (lg). Hover to Navy Container (`#1C2E5E`).
- **Secondary:** Coral (`#E8483A`) background, white text. Hover to Coral Hover (`#C73D30`). Used for the most urgent action in a view.
- **Outline:** Transparent background, `border-outline` stroke, navy text. Hover fills with `surface-variant`.
- **Ghost:** No border, no background. Navy text, `surface-variant` hover fill. For tertiary actions.
- **Destructive:** Error red (`#ba1a1a`) background, white text. Hover darkens to `#93000a`.

### Chips / Status Badges

- **Style:** Pill shape (`rounded-full`), filled background tint, matching-hue border (1px solid), semaphore text color, 12px semibold label, Material Symbol icon prefix at 14px.
- **States:** Read-only indicators. No hover or selected states on the badge itself.

### Cards / Containers

- **Corner Style:** `rounded-xl` (16px) for KPI and content cards. `rounded-2xl` (24px) for modals only.
- **Background:** Pure white (`#ffffff`) on the off-white canvas — tonal lift without shadow at rest.
- **Shadow Strategy:** Resting `0 1px 2px rgba(0,0,0,0.06)`, hover `shadow-md`. See Elevation.
- **Border:** `1px solid #e9e7ec` on KPI cards. No border on section containers.
- **Internal Padding:** `p-5` (20px) standard. `p-6` (24px) for dense data tables.

### Inputs / Fields

- **Style:** `border border-outline-variant` on `surface` background. `rounded-md` (8px). `py-2` vertical, `pl-3` / `pl-10` (with icon).
- **Focus:** `focus:border-primary focus:ring-1 focus:ring-primary`. Navy ring is unambiguous without being loud.
- **Error:** `border-error` stroke, `text-error` message below.
- **Disabled:** `opacity-50 bg-surface-variant`.
- **Search (TopBar):** `rounded-full` pill — the only pill-shaped input. Signals "global search" vs form fields.

### Navigation

- **Sidebar:** Fixed 240px, Deep Navy background, `shadow-xl` on right edge.
- **Logo Area:** 64px tall, centered "PANORAMEX" wordmark, `text-2xl font-bold tracking-wider` in white.
- **Nav Items:** `px-4 py-3 rounded-lg`, medium weight. Active: `bg-navy-container text-coral shadow-sm`. Hover: `bg-navy-container text-white`. Coral text is the exclusive active differentiator.
- **Icons:** Material Symbols Outlined at 20px, `mr-3` gap.
- **Bottom Area:** `border-t border-navy-container` separator. Subdued support link.

### TopBar

- **Height:** 64px. White background, `border-b border-outline-variant`, `shadow-sm`.
- **Page Title:** `text-xl font-semibold text-on-surface`. One per layout.
- **Notification Bell:** Coral dot indicator, 8px circle with ring clip against white.
- **User Avatar:** 40px circle, coral background (`bg-secondary`), white initials in bold.

### KPI Card (Signature Component)

- **Icon Container:** `w-10 h-10 rounded-xl`, semantic tint colors (blue/emerald/amber/indigo) — analytical role colors, not brand colors.
- **Trend Indicator:** Emerald up, red down, gray flat. Material Symbol at 16px.
- **Value:** `text-3xl font-bold tracking-tight` — the number commands the card.
- **Title:** `text-xs font-medium` in muted ink — understated label above the value.

## 6. Do's and Don'ts

### Do:
- **Do** use the tonal surface ramp (`surface → surface-container-low → white`) to express depth. No fabricated shadows on static containers.
- **Do** use JetBrains Mono for any value that gets copied, compared, or looked up — phone numbers, booking IDs, monetary amounts in data tables.
- **Do** reserve coral exclusively for call-to-action buttons and status signals. If something is coral, it is asking for action.
- **Do** use `rounded-lg` (12px) on buttons and `rounded-xl` (16px) on cards consistently across views.
- **Do** animate modals with `scale(0.96) → scale(1)` plus fade at 200ms ease-out (keyframes are in `tailwind.config.ts`).
- **Do** always respect `@media (prefers-reduced-motion: reduce)` — it's already in `index.css`; honor it in component-level animations.
- **Do** use Plus Jakarta Sans for headings and UI labels; Inter for body, table data, and form content.

### Don't:
- **Don't** use a generic Bootstrap/Material template aesthetic — plain blue primary buttons, default gray cards, iconography with no brand personality.
- **Don't** use coral (`#E8483A`) for decorative purposes — graph lines, hover highlights, background tints. Coral is a scarcity signal.
- **Don't** use any semaphore status color (`#16A34A`, `#D97706`, `#DC2626`, `#6B7280`, `#2563EB`, `#0D9488`) outside their designated lifecycle status role.
- **Don't** exceed `rounded-2xl` (24px) on any component. Cards top out at `rounded-xl` (16px).
- **Don't** pair `border: 1px solid` with a wide `box-shadow` (blur ≥ 16px) on the same element. Choose one.
- **Don't** use gradient text (`background-clip: text` with gradient). Use solid color with weight or size for emphasis.
- **Don't** use repeating-linear-gradient stripe backgrounds or decorative grid overlays.
- **Don't** add tiny uppercase tracked eyebrows above every section. `label-caps` is for column headers and filter labels only.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe on cards or list items.
