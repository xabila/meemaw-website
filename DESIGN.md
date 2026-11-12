---
name: Meemaw Hunter & Family Suite Web
description: Architectural Texas Sunset & Saloon Timber showcase and multilingual privacy system for Meemaw Hunter on meemaw.app.
colors:
  sheriff-gold: "#F7B928"
  sheriff-gold-deep: "#D99B10"
  pop-gold: "#FFD13B"
  pop-gold-hover: "#FFE06B"
  pop-gold-deep: "#D9A814"
  chili-red: "#C93B2B"
  chili-link: "#B82E22"
  armed-emerald: "#136B42"
  armed-emerald-deep: "#0D5232"
  saloon-timber: "#1F130C"
  saloon-rail: "#2C1B11"
  emerald-poche: "#0B4634"
  emerald-rail: "#105A43"
  emerald-slate: "#073124"
  emerald-badge: "#126E51"
  emerald-tint: "#E9F6F0"
  mint-cream: "#E8F5EF"
  mint-muted: "#B8DACB"
  sapphire-poche: "#0B3068"
  sapphire-rail: "#124084"
  sapphire-slate: "#072048"
  sapphire-badge: "#154D9E"
  sapphire-tint: "#EBF2FC"
  sky-cream: "#EAF2FF"
  sky-muted: "#BDD1F2"
  crisp-paper: "#FFFFFF"
  paper-stone: "#F3F0EA"
  paper-cool: "#EFF3F9"
  ink: "#1A120B"
  ink-emerald: "#11211B"
  ink-sapphire: "#0E1B31"
  ink-secondary: "#483626"
  timber-cream: "#F5E9D6"
  timber-muted: "#DECBB0"
typography:
  display:
    fontFamily: "'Bricolage Grotesque', 'Bricolage Fallback', 'Hiragino Sans', 'Apple SD Gothic Neo', sans-serif"
    fontSize: "3.1rem"
    fontWeight: 800
    lineHeight: 1.06
    letterSpacing: "-0.028em"
  headline:
    fontFamily: "'Bricolage Grotesque', 'Bricolage Fallback', 'Hiragino Sans', 'Apple SD Gothic Neo', sans-serif"
    fontSize: "2.55rem"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  title:
    fontFamily: "'Bricolage Grotesque', 'Bricolage Fallback', 'Hiragino Sans', 'Apple SD Gothic Neo', sans-serif"
    fontSize: "1.4rem"
    fontWeight: 800
    lineHeight: 1.18
    letterSpacing: "-0.02em"
  body:
    fontFamily: "'Nunito', 'Nunito Fallback', 'Hiragino Sans', 'Apple SD Gothic Neo', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.6
  label:
    fontFamily: "'Bricolage Grotesque', 'Bricolage Fallback', 'Hiragino Sans', 'Apple SD Gothic Neo', sans-serif"
    fontSize: "0.92rem"
    fontWeight: 800
    lineHeight: 1.2
rounded:
  control: "12px"
  surface: "16px"
  pill: "999px"
spacing:
  xs: "0.5rem"
  sm: "0.9rem"
  md: "1.5rem"
  lg: "2.25rem"
  section: "4.5rem"
components:
  button-primary:
    backgroundColor: "{colors.sheriff-gold}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.82rem 1.3rem"
  button-primary-hover:
    backgroundColor: "#FFD054"
    textColor: "{colors.ink}"
  button-secondary:
    backgroundColor: "{colors.saloon-rail}"
    textColor: "{colors.timber-cream}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.8rem 1.15rem"
  button-reload:
    backgroundColor: "{colors.armed-emerald}"
    textColor: "{colors.crisp-paper}"
    typography: "{typography.label}"
    rounded: "8px"
    padding: "0.28rem 0.65rem"
  button-reload-hover:
    backgroundColor: "{colors.armed-emerald-deep}"
    textColor: "{colors.crisp-paper}"
  chip-world:
    backgroundColor: "{colors.paper-stone}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.55rem 0.9rem"
  chip-world-active:
    backgroundColor: "{colors.saloon-timber}"
    textColor: "{colors.crisp-paper}"
  card-saloon:
    backgroundColor: "{colors.saloon-timber}"
    textColor: "{colors.crisp-paper}"
    rounded: "{rounded.surface}"
    padding: "1.65rem 1.75rem"
---

# Design System: Meemaw Hunter & Family Suite Web

## Overview

**Creative North Star: "The Daylight Saloon Gallery"**

The `meemaw.app/hunter/` visual system merges painted Texas pop-art arcade illustration with disciplined architectural section-cutting. Instead of dark neon gaming clichés, faked woodgrain CSS bevels, or generic SaaS card grids, the page alternates between deep espresso Saloon Timber poche, a bold sunlit Sheriff Gold active band, and crisp pure-white editorial ledgers ruled with solid ink hairlines.

Every surface pairs tactile character warmth with verifiable family trust. Authentic painted game plates, critter sprites, and hand-pose medallions supply all pictorial richness, while interface chrome stays crisp, flat-inked, and typographically authoritative across eight languages—including French, English, Spanish, German, Italian, Brazilian Portuguese, Japanese, and Korean.

**Key Characteristics:**
- Architectural chapter alternation between Saloon Timber dark poche, Sheriff Gold active bands, and pure-white ink-ruled ledgers.
- Self-hosted expressive grotesque display lettering (`Bricolage Grotesque`) paired with warm rounded tabular body copy (`Nunito` + native CJK fallbacks).
- Cardless ink-ruled multi-column ledgers for gestures, armory specs, and privacy/pricing commitments instead of repetitive boxed grids.
- Mechanical split-flap instrument readouts and ink-cased optical crosshairs that stay legible over bright painted scenery.
- Strict surface-aware focus outlines and WCAG AA+ contrast across dark timber, bright gold, and crisp white grounds.

## Colors

The palette balances warm roasted espresso timber against high-noon Sheriff Gold and crisp pure-white editorial paper, punctured selectively by chili red links and armed emerald status badges.

### Primary
- **Sheriff Gold** (`#F7B928`): Primary action fill, active family-suite indicator, architectural chapter band, and brass plaque framing on dark surfaces.
- **Sheriff Gold Deep** (`#D99B10`): Scrollbar thumb and deeper brass accent tone.

### Secondary
- **Chili Barn Red** (`#C93B2B`): High-contrast editorial inline links and action underlines on pure-white paper chapters.

### Tertiary
- **Armed Emerald** (`#136B42`): Reload control fill and "Free Worlds" status pills (`6.5:1` contrast with crisp white text).
- **Armed Emerald Deep** (`#0D5232`): Tactile hover state for armed emerald controls (`8.9:1` contrast).

### Neutral
- **Saloon Timber** (`#1F130C`): Primary dark architectural poche for the masthead, gallery frame, stage showcase, AirPlay chapter, FAQ, and footer.
- **Saloon Rail** (`#2C1B11`): Raised dark timber secondary control fill, suite switcher track, and shooting-gallery sill rail.
- **Crisp Paper** (`#FFFFFF`): Pure neutral white ground for the 7-World Atlas, Privacy & Pricing ledger, and legal reading surfaces—preventing warm cream wash drift.
- **Paper Stone** (`#F3F0EA`): Resting surface fill for unselected world tabs and subtle legal table containers.
- **Deep Roast Ink** (`#1A120B`): Structural `2px–3px` rules, button casings, optical crosshair outer strokes, and primary headings on paper and gold bands.
- **Warm Umber Secondary** (`#483626`): Long-form editorial body copy on pure-white paper (`10.2:1` contrast).
- **Timber Cream** (`#F5E9D6`): Primary body copy and list text on dark Saloon Timber chapters.
- **Timber Muted** (`#DECBB0`): Captions, scoreboard labels, and secondary metadata on dark Saloon Timber chapters.

### Suite App Chapter Poche Worlds
All three Meemaw Family Suite web experiences share the exact same architectural chapter grammar (`Dark App Poche` → `Active Pop/Sheriff Gold Band` → `Crisp Paper #FFFFFF Ledger` → `Dark App Showcase` → `Crisp Paper #FFFFFF Matrix` → `Dark Closing Chapter`), `Bricolage Grotesque` + `Nunito` self-hosted typography, and two-tier mobile masthead, differentiated by each app's signature App Store chromatic world:
- **Meemaw Orthographe (`/`) — Royal Sapphire**: `--sapphire-poche: #0B3068`, `--sapphire-rail: #124084`, `--sapphire-slate: #072048`, `--pop-gold: #FFD13B`, `--ink-sapphire: #0E1B31`.
- **Meemaw Math (`/math/`) — Deep Emerald**: `--emerald-poche: #0B4634`, `--emerald-rail: #105A43`, `--emerald-slate: #073124`, `--pop-gold: #FFD13B`, `--ink-emerald: #11211B`.
- **Meemaw Hunter (`/hunter/`) — Saloon Timber**: `--saloon-timber: #1F130C`, `--saloon-rail: #2C1B11`, `--sheriff-gold: #F7B928`, `--ink: #1A120B`.

### Named Rules
**The Chapter Section-Cut Rule.** Alternate full-bleed horizontal chapters decisively between Saloon Timber (`#1F130C`), Sheriff Gold (`#F7B928`), and Crisp Paper (`#FFFFFF`) separated by `2.5px–3px` solid ink or gold rules—never blend chapters with soft atmospheric page gradients.

**The Adaptive Focus Ring Rule.** Keyboard `:focus-visible` rings use `3px solid #F7B928` on dark Saloon Timber surfaces and switch explicitly to `3px solid #1A120B` on Sheriff Gold and Crisp Paper chapters so focus indicators never drop below `8:1` contrast.

## Typography

**Display Font:** `Bricolage Grotesque` (with `'Hiragino Sans', 'Apple SD Gothic Neo', sans-serif` fallbacks)
**Body Font:** `Nunito` (with `'Hiragino Sans', 'Apple SD Gothic Neo', -apple-system, BlinkMacSystemFont, sans-serif` fallbacks)

**Character:** `Bricolage Grotesque` at ExtraBold (`800`) gives headlines the punchy carved confidence of a painted western shooting-gallery sign without resorting to novelty cowboy display fonts, while `Nunito` (`600–800`) keeps multilingual instructions and legal commitments friendly, open, and tabular-aligned.

### Hierarchy
- **Display** (`800`, `clamp(2.05rem, 3.5vw, 3.1rem)`, `line-height: 1.06`, `-0.028em`): Opening saloon-plaque `h1` and primary legal document titles.
- **Headline** (`800`, `clamp(1.75rem, 3vw, 2.55rem)`, `line-height: 1.12`, `-0.025em`): Chapter `h2` headings across product and legal surfaces.
- **Title** (`800`, `1.35rem–2rem`, `line-height: 1.15–1.22`, `-0.02em`): World showcase `h3`, ledger column headers, and screenshot strip headers.
- **Body** (`600–700`, `1.0625rem`, `line-height: 1.6`, `tabular-nums`): Primary narrative copy, capped at `48ch–68ch` (`text-wrap: pretty`) for effortless scanning.
- **Label** (`800`, `0.82rem–1rem`, `line-height: 1.2`): Buttons, world tabs, status pills, and split-flap instrument digits (mixed case; uppercase reserved strictly for compact 4–5 character HUD tags like `SCORE`).

### Named Rules
**The Direct Heading Rule.** Every `h1`, `h2`, and `h3` opens its block directly without small uppercase kicker or eyebrow labels above it; status pills and weapon tags sit below the body copy where they act as structured metadata.

**The Multilingual CJK Phrase Rule.** Apply `word-break: auto-phrase; line-break: strict;` on `:lang(ja)` headings and `word-break: keep-all;` on `:lang(ko)` blocks alongside `overflow-wrap: break-word` on legal prose so long bundle identifiers and CJK clauses wrap cleanly on `390px` viewports.

## Layout

Product chapters center inside a `1240px` shell (`1320px` for the sticky masthead and opening shooting-gallery stage; `780px` single-column measure for legal reading pages) with `4.5rem` vertical chapter rhythm and `1.5rem` horizontal gutters (`1rem` below `600px`).

- **Sticky Two-Tier Mobile Masthead:** On desktop (`> 980px`), brand, family-suite switcher, section anchors, language selector, and App Store button occupy a single horizontal bar. Below `600px`, `.suite-nav` sits as a direct child of `.masthead-inner` with `order: 3; width: 100%`, keeping the brand and language selector side-by-side on Row 1 and the three-app switcher cleanly on Row 2.
- **Cardless Ruled Ledgers:** Multi-item explanations (`.gesture-row` 3-up, `.armory-grid` 4-up, `.trust-ledger` 2-up) divide space with crisp `1.5px–2.5px` ink hairlines rather than wrapping every item in a separate card.
- **Responsive Screenshot Showcase:** Above `1200px`, all 6 localized iPhone screenshots sit unclipped in a 6-column grid (`repeat(6, minmax(0, 1fr))`). At `1200px` and below, the strip switches to horizontal snap-scrolling and bleeds to the viewport edge (`margin-inline: -1.5rem; padding-inline: 1.5rem`) so peeking frames never clip mid-headline against an inset container edge.

## Elevation & Depth

Surfaces rely primarily on high-contrast architectural color blocking and crisp `2px–3px` solid borders (`#1A120B` ink on light/gold grounds; `#F7B928` brass on dark timber plaques), reserving soft warm-umber ambient shadows strictly for major stage frames and elevated plaques. Never use hard brutalist offset shadows or CSS bevel/emboss filters.

### Shadow Vocabulary
- **Stage Depth** (`box-shadow: 0 18px 44px rgba(10, 5, 2, 0.42)`): Anchors the 16:9 AirPlay living-room frame against dark Saloon Timber.
- **Elevated Plaque** (`box-shadow: 0 10px 26px rgba(26, 18, 11, 0.16)`): Lifts the interactive 7-world stage theater off the Crisp Paper ground.
- **Optical Sprite Cast** (`filter: drop-shadow(0 10px 16px rgba(15, 7, 3, 0.45))`): Separates transparent cutout critters and the ink-cased optical crosshair (`drop-shadow(0 3px 8px rgba(10, 5, 2, 0.72))`) from painted stage scenery.

### Named Rules
**The Architectural Stage Rule.** Full-bleed viewport stages (`.gallery-window`) remain flush (`border-radius: 0`, `box-shadow: none`) with a solid `6px` dark timber counter sill along their bottom edge, so foreground plaques (`.saloon-sign`, `.range-hud`) never create nested card-in-card framing.

## Shapes

Corners follow a three-step hierarchy: `16px` (`--radius-surface`) for major plaques, painted gesture medallions, and stage theaters; `12px` (`--radius-control`) for buttons, language selectors, world tabs, and weapon tags; and `999px` (`--radius-pill`) exclusively for the family-suite segmented track and compact status pills. Interactive hover motion uses an snappy exponential ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`, `150ms–220ms`) with subtle `-1px` to `-2px` vertical lift and full `prefers-reduced-motion: reduce` support.

## Components

### Buttons
- **Shape:** Gently rounded tactile rectangles (`12px` radius) framed by a `2px` `#1A120B` ink border on primary actions or `1.5px` brass border on dark secondary actions.
- **Primary (`button-primary`):** Sheriff Gold (`#F7B928`) fill with `#1A120B` ExtraBold text and inline SVG icon (`padding: 0.82rem 1.3rem`). Brightens to `#FFD054` and lifts `translateY(-2px)` on hover.
- **Secondary (`button-secondary`):** Saloon Rail (`#2C1B11`) fill with Timber Cream (`#F5E9D6`) text and `rgba(247, 185, 40, 0.65)` border; shifts text and border to `#F7B928` on hover.
- **Compact Action (`button-reload`):** Armed Emerald (`#136B42`) fill with `#FFFFFF` label and `1.5px` white rim (`8px` radius), deepening to `#0D5232` on hover.

### Chips
- **World Switcher Tabs (`chip-world`):** Paper Stone (`#F3F0EA`) fill, `#1A120B` ExtraBold label, `2px solid rgba(26, 18, 11, 0.2)` border, and inline status pill (`#136B42` for Free, `#F7B928` for Sheriff Pack).
- **Selected State (`chip-world-active`):** Saloon Timber (`#1F130C`) fill with `#FFFFFF` label and `#1A120B` border, toggled via both `.is-active` and `aria-selected="true"`.

### Cards / Containers
- **Saloon Sign Plaque (`card-saloon`):** Translucent Saloon Timber (`rgba(31, 19, 12, 0.94)`), `2.5px solid #F7B928` border, `16px` radius, `1.65rem 1.75rem` padding, housing the primary value proposition over painted scenery without heavy blur stacks.
- **Split Stage Theater (`.stage-theater`):** Two-column (`1.35fr 1fr`) `16px` container framed in `3px solid #1A120B` with painted scenery on the left and Saloon Timber commentary on the right.

### Inputs / Fields
- **Language Selector (`.lang-wrap`):** Compact Saloon Rail (`#2C1B11`) capsule (`12px` radius, `1.5px solid rgba(247, 185, 40, 0.45)`) pairing an inline globe SVG with a native `<select>` in `#FFFFFF` ExtraBold text for instant 8-language switching.

### Navigation
- **Family Suite Segmented Pill (`.suite-nav`):** Saloon Rail (`#2C1B11`) pill container (`999px` radius) linking `Meemaw`, `Meemaw Math`, and `Meemaw Hunter`, highlighting the active app (`aria-current="page"`) in solid `#F7B928` Sheriff Gold with `#1A120B` text.

### Split-Flap Range Scoreboard
- **Instrument Cells (`.split-flap-board` / `.flap-cell`):** Four `30px × 38px` dark roasted plates (`linear-gradient(180deg, #160D08 0%, #24150D 49%, #0D0603 51%, #1A0F09 100%)`) framed in `1.5px solid rgba(247, 185, 40, 0.65)` with a `1.5px` horizontal center split seam and `rotateX(-75deg -> 0deg)` flip cascade whenever a digit updates, paired beside 6 vertical brass cylinder chambers (`.chamber`) and an ink-cased optical reticle (`#opticalReticle`).

## Do's and Don'ts

### Do:
- **Do** use authentic painted game plates, critter sprites, and hand-pose medallions for pictorial surfaces while keeping UI chrome flat-inked and architectural.
- **Do** frame over-scenery vector indicators (such as `#opticalReticle`) with a `#1A120B` ink outer stroke and dark drop-shadow so they remain `>= 4.5:1` legible against bright sky and grass.
- **Do** structure feature groups as ink-ruled ledgers (`.gesture-row`, `.armory-grid`, `.trust-ledger`) on solid `#F7B928` or `#FFFFFF` grounds.
- **Do** test every layout change across both `1440px` desktop and `390px` mobile in Latin and CJK (`ja`, `ko`) locales.

### Don't:
- **Don't** place uppercase eyebrow or kicker labels above `h1`, `h2`, or `h3` headings.
- **Don't** nest bordered/shadowed cards inside outer rounded/shadowed hero containers.
- **Don't** drift light paper chapters (`#FFFFFF`) toward warm cream washes or dark timber chapters (`#1F130C`) toward cool blue-slate.
- **Don't** fabricate ratings, review counts, press badges, or unverified telemetry claims anywhere in the Meemaw suite.
