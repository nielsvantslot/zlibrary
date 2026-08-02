---
name: The Zomboid Athenaeum
description: A reading-room shelf wall for tracking a Project Zomboid team's book and magazine collection
colors:
  ground-deep: "#1a140f"
  ground: "#241b14"
  walnut: "#4a3320"
  walnut-dark: "#35240f"
  walnut-light: "#6b4a2e"
  brass: "#c9a24b"
  brass-bright: "#e0c179"
  parchment: "#e9e2d0"
  parchment-dim: "#b8ad95"
  ink: "#17110b"
  stamp-missing: "#8a8378"
  stamp-found: "#c98a2c"
  stamp-shelved: "#3f7a54"
  skill-forest: "#2f4d3a"
  skill-oxblood: "#7a2426"
  skill-navy: "#1f3550"
  skill-mustard: "#b98a2e"
  skill-teal: "#205a56"
  skill-plum: "#5b3159"
  skill-rust: "#8a3d20"
  skill-olive: "#565a2a"
  skill-indigo: "#2b2f63"
  skill-slate: "#39434d"
typography:
  display:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "1.7rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0.015em"
  body:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.35
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.7rem"
    fontWeight: 600
    letterSpacing: "0.08em"
rounded:
  sm: "2px"
  md: "3px"
spacing:
  sm: "0.4rem"
  md: "0.8rem"
  lg: "1.6rem"
components:
  tab-active:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.75rem"
  tab-inactive:
    backgroundColor: "rgba(36, 27, 20, 0.6)"
    textColor: "{colors.parchment-dim}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.75rem"
  index-card:
    backgroundColor: "{colors.parchment}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.7rem 0.8rem"
---

# Design System: The Zomboid Athenaeum

## Overview

**Creative North Star: "Reading Room Stacks"**

The library is a real reading room, not a dashboard. Every screen scans like walking up to a physical shelf wall: cloth-bound spines standing in jewel tones, brass call-number tags, a card-catalog for the periodicals. Status is never a colored label bolted onto a card — it's spatial and physical. A missing book is a gap on the shelf. A found book is pulled slightly forward, tagged. A shelved book sits flush, settled.

This world was chosen after two rejected directions (a photocopied-zine aesthetic and a broadcast-teletext aesthetic) that read as clever concepts rather than an actual library. The confirmed rejection: nothing "gimmicky," nothing that requires explaining the metaphor. The confirmed anti-reference is also the cozy-fantasy-library default (cream parchment, serif italic, gold leaf, candlelight) — this system uses real library materials (cloth, brass, card stock) rather than fantasy-tavern warmth, and reserves parchment/cream for the one place a real library actually uses it: index cards and catalog paper, not the whole page.

**Key Characteristics:**
- Charcoal-walnut ground with jewel-tone content — color lives in the books, not the chrome.
- Status is shown by position and material (gap / pulled-forward / flush), never a colored border.
- Three self-hosted type families with distinct jobs: serif for anything foil-stamped or titled, sans for interface chrome, mono for call numbers, labels, and data.
- No emoji, no unicode glyphs as icons — every icon is a drawn single-stroke SVG.

## Colors

Two families: a dark charcoal-walnut chrome that recedes, and jewel-tone spine colors that carry all the content identity.

### Primary
- **Brass** (`#c9a24b`) / **Brass Bright** (`#e0c179`): masthead title, shelf tags, active filter tabs, gauge fill, focus rings. The one accent that repeats system-wide — it reads as hardware (tags, plaques, stamps), not decoration.

### Secondary — Skill Spine Tones
A 10-color jewel-tone rotation assigned per skill, cycling for the 24 skills: **Forest** `#2f4d3a`, **Oxblood** `#7a2426`, **Navy** `#1f3550`, **Mustard** `#b98a2e`, **Teal** `#205a56`, **Plum** `#5b3159`, **Rust** `#8a3d20`, **Olive** `#565a2a`, **Indigo** `#2b2f63`, **Slate** `#39434d`. These are the only saturated color most users see — deliberately reserved for the books themselves.

### Tertiary — Status Inks
- **Stamp Found** (`#c98a2c`): the "FOUND" ribbon tag on a pulled-forward spine, and the found ink-stamp on index cards.
- **Stamp Shelved** (`#3f7a54`): the shelved ink-stamp, and the gauge fill's shelved end.
- **Stamp Missing** (`#8a8378`): reserved for the toast/error state, never used as a card border.

### Neutral
- **Ground** (`#1a140f` → `#241b14`): the page background, a subtle radial brass glow at the very top only.
- **Walnut** (`#4a3320`, darker `#35240f`, lighter `#6b4a2e`): shelf board material.
- **Parchment** (`#e9e2d0`) / **Parchment Dim** (`#b8ad95`): body text on dark ground, and the index-card (catalog paper) background family.
- **Ink** (`#17110b`): text on parchment/brass surfaces.

### Named Rules
**The No-Border Rule.** Status is never communicated with a colored border-left/right on a card or list item. It is communicated by position (shelf gap, pulled-forward), or by a circular ink-stamp badge.

## Typography

**Display Font:** Spectral (600/700, self-hosted woff2)
**Body Font:** IBM Plex Sans (self-hosted variable woff2)
**Label/Mono Font:** IBM Plex Mono (500/600, self-hosted woff2)

**Character:** Spectral supplies the "foil-stamped hardcover" voice — used only where real book/plaque lettering would appear (masthead, spine titles, card titles, popover title). IBM Plex Sans is the workhorse chrome voice for anything read quickly (search, notes, buttons). IBM Plex Mono is reserved for anything that functions as data or classification — call numbers, tier labels, status tabs, gauge labels — never used as a "technical" costume.

### Hierarchy
- **Display** (700, 1.7rem, 1.15 line-height): masthead title only.
- **Title** (600, 0.72–0.88rem): spine titles (vertical), index-card titles, popover title.
- **Body** (400, 0.78–0.92rem): index-card effect text, search input, note inputs.
- **Label** (600, 0.6–0.72rem, 0.02–0.14em tracking, uppercase): shelf tags, gauge labels, filter tabs, spine tier badges, ink-stamp text.

### Named Rules
**The Foil-Stamp Rule.** Display type gets its "stamped" character from a directional text-shadow (dark below, faint highlight above) — never from gradient-clipped text.

## Layout

Shelves and index cards flow in a `flex-wrap` field (not a fixed grid) inside a 1180px max-width container, so each skill's shelf is sized to its own content (exactly 5 spines) rather than stretched to fill a column — shelves pack tightly, several per row on wide viewports, one per row under 640px. Recipe magazines switch to a `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))` card grid, since periodicals don't have the shelf's fixed 5-item structure.

## Elevation & Depth

Layered, not flat. Every physical surface (shelf board, gauge panel, popover, index card, toast) carries a real offset+blur shadow implying it sits above or below the ground. Spines add directional inset shadows to read as rounded cloth over board, and a "found" spine's shadow shifts to imply it has lifted off the shelf.

### Shadow Vocabulary
- **Shelf board** (`0 10px 18px -8px rgba(0,0,0,0.65)`): the walnut plank sits above the page.
- **Found lift** (`0 20px 16px -14px rgba(0,0,0,0.6)`): sells the spine being pulled forward off the shelf.
- **Popover / toast** (`0 12px 30px rgba(0,0,0,0.55)`): floats clearly above everything.

## Shapes

Utilitarian, small radii throughout (2–3px) — nothing soft or pill-shaped except the gauge track. Missing books render as a dashed-outline ghost slot rather than a solid shape, the one deliberate break in an otherwise solid-fill system.

## Components

### Shelf + Spine (signature component)
A `.shelf` is a brass tag (call number + skill name + progress) sitting atop a walnut `.shelf-board`, holding a row of `.spine` elements (44px wide, 172px tall — sized for a legible vertical title, not a thumbnail). Each spine is a two-button composite: `.spine-status-btn` (the visible cloth spine, click/Enter cycles missing → found → shelved) and `.spine-note-tab` (a small brass tab, always keyboard-reachable, opens the note popover) — kept as siblings, not nested buttons, for valid accessible markup. State is shown physically: missing is a dashed empty outline, found is lifted -16px with a "FOUND" ribbon, shelved sits flush. The spine shows only the book's short quoted title (e.g. "Better Gardening"), not the full "Skill N: '...'" citation — the skill and volume number are already on the shelf tag and tier badge, so the spine itself carries just the distinctive part, the way a real book spine does.

### Magazine Covers (Recipe Magazines & VHS Tapes)
A two-part cover, not a note card: a colored masthead band (using the same per-skill jewel-tone as that skill's shelf, or walnut for skill-less "general" magazines) carries the title in reversed foil-stamp type, with a circular ink-stamp badge overlapping its lower edge for found/shelved states. Below it, a flat parchment body panel holds the skill label, unlock effect, and note button — no ruled ledger lines (that read as a sticky note in review; dropped). VHS Tapes reuse this same component (a media catalog card, not a shelved spine, fits a cassette same as a periodical) with a drawn cassette icon as the fallback cover glyph in place of the open-book icon, for the skills that don't already have a dedicated icon.

### Gauges
Brass-bordered panels with a dotted-track progress bar (`scaleX` transform, not width, for animation) — a plaque-and-dial read, not a generic SaaS progress bar.

### Tabs (filters)
Joined mono-label segments, brass fill for the active tab, no individual pill shapes — reads as one continuous control, like a library catalog's tabbed divider.

### Popover
A brass-bordered floating panel anchored to the clicked spine/card; three state buttons plus a note field, closes via a drawn SVG × (not `&times;`).

## Do's and Don'ts

### Do:
- **Do** keep color on the content (spines, ink stamps, brass hardware) and keep the ground neutral charcoal-walnut.
- **Do** show status spatially/physically first; use the ink-stamp badge only where physical position isn't available (index cards).
- **Do** self-host every font face actually used; no system-font fallback as the display voice.
- **Do** keep every icon a drawn single-stroke SVG at a consistent weight.

### Don't:
- **Don't** put a colored border-left/right on any card, list item, or callout — this is the exact pattern the previous (rejected) version leaned on.
- **Don't** use emoji or unicode glyphs (✕, ●, etc.) as icons — draw them.
- **Don't** stack `opacity` on top of a low-alpha `rgba()` color for "dimmed" states — it silently fails contrast; dim with a single solid, checked color instead.
- **Don't** let the missing-book ghost state become illegible — it must stay ≥4.5:1 against the shelf board.
