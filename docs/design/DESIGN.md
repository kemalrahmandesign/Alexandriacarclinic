# ALEXANDRIA CAR CLINIC: Style Reference
> Darkroom garage editorial. A lone car floating in midnight blue darkness, ivory typography the only decoration.

Adapted from the ORYZO style reference (`DESIGN_4.md`). **Structure, type rules, radii and component behavior are unchanged.** Only the palette moves from warm brown to a midnight-navy family that echoes the shop's blue uniforms, and the orange accent becomes brass.

**Theme:** dark

## Tokens: Colors

| Name | Value | Token | Role |
|---|---|---|---|
| Ivory | `#F1EADB` | `--color-ivory` | All text on dark surfaces. Never pure white. |
| Midnight | `#050B16` | `--color-midnight` | Page canvas and deepest background, a blue-black, never pure black. The void behind every reveal. |
| Uniform Navy | `#0F2A4A` | `--color-uniform-navy` | Elevated surface and the one filled button. ⚠️ Sample the exact uniform blue from Zack's photos and adjust. |
| Steel Line | `#24344B` | `--color-steel-line` | Hairlines, dashed section dividers, card outlines |
| Slate | `#5F7189` | `--color-slate` | Secondary dividers, muted labels, disabled states |
| Brass | `#C9A45C` | `--color-brass` | Accent, **editorial credit only**: the "Cars for sale" label, the phone number link, small tags. Never a button. |

## Tokens: Typography
One typeface family, two modes.

- **Family:** Inter (ORYZO's Halyard is a licensed font; Inter is the structural match). Enable `"ss01"`.
- **Mode 1: UPPERCASE, weight 500.** Everything: nav, headings, labels, links, buttons. Letter-spacing normal.
- **Mode 2: mixed case, weight 400, 29px.** Body/description copy only.

| Role | Size | Line height |
|---|---|---|
| display | 51px (scale up with `clamp()` on large screens) | 0.9 |
| heading | 41px | 0.9 |
| heading-sm | 24px | 1.09 |
| body | 29px / 400 | 1.26 |
| subheading | 18px | 1 |
| label | 12px | 1.2 |
| micro | 8px (legal only) | 1.2 |

On mobile, scale body to 20px and display to about 34px so nothing overflows.

## Shapes & Spacing
- Radii: cards 12px · inputs 0px · pill button 36px · outlined button 22.5px
- Card padding 24px · element gap 18px
- Sections are full-viewport, full-bleed, no max-width container
- Dividers: 1px **dashed** `--color-steel-line`

## Rules
**Do**
- Ivory text everywhere; Midnight canvas everywhere.
- One filled (Uniform Navy) button per section at most; ghost outline for the rest.
- Left-align all text, even when flanking a centered image.
- Depth comes from the two-step surface stack (Midnight → Uniform Navy), never from shadows.

**Don't**
- No pure `#fff` or `#000`.
- No brass on buttons or CTAs.
- No lowercase/sentence-case headings or labels.
- No drop shadows, no radius below 12px on containers, no center-aligned body copy.

## Imagery & video grade (applies to EVERY generated or edited asset)
- **Void mode:** subject isolated on Midnight (`#050B16`) blue-black, no visible room, no clutter.
- **Light:** cool blue ambient, **one warm brass-toned rim light from the upper right**, high contrast, deep blacks.
- **Grade:** desaturated except the subject, slight blue shadows, warm highlights.
- **Composition:** subject offset or centered with generous negative space for text; sharp-edged, no rounded masks.
- **Never in frame:** readable text, brand logos, license plates, visible people (except the real team photos).
- **Camera (video):** locked-off or one very slow move; no whip pans, no cuts. Scroll-scrubbed video must read cleanly at any frame.

## CSS variables
```css
:root {
  --color-ivory: #F1EADB;
  --color-midnight: #050B16;
  --color-uniform-navy: #0F2A4A;
  --color-steel-line: #24344B;
  --color-slate: #5F7189;
  --color-brass: #C9A45C;

  --font-main: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --text-display: clamp(34px, 5vw, 51px);
  --text-heading: clamp(28px, 4vw, 41px);
  --text-heading-sm: 24px;
  --text-body: clamp(20px, 2.2vw, 29px);
  --text-subheading: 18px;
  --text-label: 12px;

  --radius-card: 12px;
  --radius-pill: 36px;
  --radius-outline: 22.5px;
  --card-padding: 24px;
  --element-gap: 18px;
}
```
