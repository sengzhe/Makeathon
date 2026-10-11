---
name: The Silent Dispatch
description: A warm-paper newspaper with a photograph that comes to life.
colors:
  ink: "#282820"
  paper: "#e4decd"
  rule: "#797568"
  desk: "#c7c3b7"
  desk-label: "#56554c"
  scene: "#111111"
  scene-text: "#eee9de"
  photograph-label: "#fff7e6"
typography:
  nameplate:
    fontFamily: "UnifrakturMaguntia, serif"
    fontSize: "clamp(36px, 5.5vw, 71px)"
    fontWeight: 400
    lineHeight: 1
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(60px, 8.2vw, 112px)"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.025em"
  title:
    fontFamily: "IM Fell English, Georgia, serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.02
  body:
    fontFamily: "IM Fell English, Georgia, serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.35
  section-label:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "1.7px"
  edition:
    fontFamily: "Georgia, serif"
    fontSize: "11px"
    lineHeight: 1.2
    letterSpacing: "0.5px"
spacing:
  detail: "8px"
  compact-column: "16px"
  column: "22px"
components:
  newspaper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "24px 35px 13px"
  extra-badge:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "8px 12px 7px"
  photograph-trigger:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.photograph-label}"
    padding: "0"
    width: "100%"
  motion-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "8px"
---
# Design System: The Silent Dispatch

## Overview

**Creative North Star: "The Living Broadsheet"**

Warm paper, charcoal ink and densely set type establish a printed newspaper. A blackletter nameplate, condensed headline and literary serif give each editorial role its own voice. The supplied newspaper reference is the visual authority.

Depth belongs to the paper and photograph. Motion stays almost imperceptible while reading, then expands into a full-screen stylized 2.5D scene after deliberate activation.

The language above describes the implemented visual direction; it does not establish historical authenticity. [Visual authority](surface.md) · [Implementation](dist/index.html)

**Key Characteristics:**
- Warm paper and charcoal ink.
- Dense serif columns with fine and double rules.
- Square editorial geometry and restrained material shadows.
- A photograph that becomes an immersive scene.

## Colors

The palette pairs yellowed paper with warm charcoal and subdued dividing rules.

### Primary
- **Charcoal Ink:** Headlines, editorial text, badges and interaction outlines.

### Neutral
- **Aged Paper:** The newspaper surface and reversed badge lettering.
- **Faded Rule:** Column separators, captions and small editorial ornaments.
- **Desk Grey:** The surrounding canvas; its quieter label ink separates framing copy from newsprint.
- **Scene Black / Scene Parchment:** The immersive scene and its supporting text.
- **Photograph Ivory:** The entry label over the image.

Values are extracted from the [stylesheet](dist/style.css). The unused `--muted` declaration is deliberately excluded from the token inventory.

## Typography

**Display Font:** Barlow Condensed, with Arial Narrow and sans-serif fallbacks. **Body Font:** IM Fell English, with Georgia and serif fallbacks. **Nameplate Font:** UnifrakturMaguntia. **Utility Font:** Georgia.

The headline is heavy, narrow and tightly led. The body is compact and literary; blackletter is reserved for the publication name. The families are [self-hosted](dist/assets/fonts.css). Title bolding uses the browser's synthesized weight because the supplied IM Fell English faces are regular and italic.

### Hierarchy
- **Nameplate:** Centered publication identity.
- **Headline:** Monumental, uppercase lead story.
- **Title:** Short serif article headings.
- **Body:** Justified columns with automatic hyphenation.
- **Section label:** Condensed uppercase editorial categories.
- **Edition:** Compact issue and dateline metadata.

Italic serif provides the motto, standfirst, bylines, captions and pull quote. Desktop role values are normative in frontmatter; [responsive overrides](dist/style.css) adjust them with the layout.

## Layout

The newspaper and surrounding labels share a maximum width (1180px). The desktop dispatch uses three tracks (1fr / 2.75fr / 1fr), with a landscape photograph (3:2) in the wide center. The lower editorial strip uses four columns. Body copy beneath the photograph uses two text columns. [Layout source](dist/style.css)

At 1000px and below, gutters and type tighten. At 650px and below, the photograph moves first and spans both tracks; the side stories and lower strip become two columns. The paper padding contracts to 17px 15px 9px. At 1600px and above, the desk gains top space. Preserve this editorial hierarchy when extending the page. [Responsive source](dist/style.css)

## Elevation & Depth

The paper has a diffuse outer shadow and a faint inset warmth. The photograph uses a dark lower gradient for its invitation. The full-screen scene uses an inset vignette and caption shadows. These effects suggest paper and photographic atmosphere. [Depth source](dist/style.css)

### Shadow Vocabulary
- **Paper lift:** `0 7px 30px #35352d24`.
- **Paper aging:** `inset 0 0 85px #8c77491a`.
- **Scene vignette:** `inset 0 0 180px 35px #0005`; softened on mobile.

The battlefield uses simple silhouettes, broad grayscale planes and coarse texture. The same generated asset appears on the page and in the scene; avoid photographic microdetail that would exceed the later animation’s visual fidelity.

## Shapes

Paper, image, badges and editorial regions use square edges. Single rules and double rules establish hierarchy. The entry symbol uses fine open corners and a central cross; badges rotate slightly in opposite directions. Ambient ink is an irregular, fluid black shadow beneath the letterforms. [Shape source](dist/style.css)

## Components

### Newspaper and masthead
A broad paper sheet with a centered blackletter nameplate, two reversed EXTRA badges and a ruled edition strip. Body articles remain open editorial regions rather than individual raised cards. [Markup](dist/index.html) · [Styles](dist/style.css)

### Photograph trigger
The image is the full-width button. Its lower-center icon and uppercase invitation sit over a dark gradient. Hover lifts the invitation (4px) and brightens the photograph. Keyboard focus uses an ink outline (2px) with offset (5px). The picture drifts subtly over a 17-second alternating cycle. [Markup and accessible label](dist/index.html) · [States](dist/style.css)

### Ambient-motion control
An underlined text button in the footer reports on/off state. The implementation honors reduced-motion preferences and allows explicit toggling. A translucent black shadow gathers behind successive words, twitches into tendrils, and leaves fading residue. Its canvas sits beneath the text, at 40% opacity with a soft 1.1px blur, keeping the letters sharp and readable. Each shadow slowly trembles and breathes behind a word for 1.3 seconds, then moves to a nearby word. Several out-of-phase motions disturb its edges. It visits seven words over 10 seconds before fading. New shadows start every 3.3–5 seconds, with up to three running concurrently in different visible paragraphs. The effect stops when motion is disabled, the page is hidden, the window resizes, or the main scene opens. [Behavior](dist/app.js)

### Photographic scene
A full-screen dialog holds the stylized image, atmosphere canvas, caption, status and a thin bottom progress line. It returns focus to the photograph after playback. The scene's treatment keeps the newspaper's serif voice with matched image contrast and a restrained vignette. [Scene markup](dist/index.html) · [Lifecycle](dist/app.js)

## Do's and Don'ts

The guardrails below preserve the [confirmed visual world](surface.md) and [current implementation](dist/style.css).

### Do:
- **Do** preserve distinct nameplate, headline and body type roles.
- **Do** use thin and double rules to organize editorial content.
- **Do** retain visible keyboard focus and the ambient-motion control.
- **Do** let the photograph lead the mobile reading order.

### Don't:
- **Don't** replace the newspaper world with application chrome.
- **Don't** introduce rounded cards or colored action accents into the established page.
- **Don't** increase ambient motion until it competes with reading.
