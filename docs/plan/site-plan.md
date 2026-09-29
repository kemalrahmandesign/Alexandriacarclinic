# Site Plan: One Page, Six Sections

Single-page site, fixed transparent nav (4 items max): **SERVICES · REVIEWS · CARS FOR SALE · CONTACT**.
Visual system: `docs/design/DESIGN.md`. Facts and copy source: `docs/content/client-brief.md`.

## Section flow

| # | Section | Media | Notes |
|---|---|---|---|
| 1 | **Hero** | **Scroll video #1**: BMW drives off, headline appears in the empty space | Wordmark + one-line tagline + call/text ghost buttons. Info card lower-left: "BMW · MERCEDES · EUROPEAN SPECIALISTS, SINCE 2004". |
| 2 | **Intro statement** | none (type only) | Three-column pattern: heading left, body right. Trust facts with dashed dividers: Since 2004 · 12-month/12,000-mile warranty · Shuttle service · After-hours key drop. |
| 3 | **Services** | Still images (see below) | Service Index. No per-service pages. |
| 4 | **Reviews** | **Scroll video #2**: BMW on a lift rises; review quotes reveal as it goes up | Real Google reviews only (get Zack's OK). |
| 5 | **Cars for sale** | 2-3 stills of inventory cars | Brass label, link to Alexandriaautova.com + (571) 312-1593. |
| 6 | **About / Contact** | Team photos (AI-cleaned to the theme) | Zack + team, hours, map, call/text, contact form. States: **no Virginia inspection or emissions.** |

Only two scroll videos, as decided. Everything else is stills.

## Services section: the Service Index

**Problem:** Zack wants a picture for every job (16+), but a page per job is messy.
**Solution:** one full-viewport section, an index on the left and a single image stage on the right.

```
┌──────────────────────────────────────────────────────┐
│ SERVICES                                              │
│ [MECHANICAL] [ENGINES & DRIVETRAIN] [BODY & PAINT] [CARE] │  ← 4 category tabs (ghost pills)
├──────────────────────────┬───────────────────────────┤
│ 01 OIL CHANGE & MAINT.   │                           │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │    ONE LARGE IMAGE        │
│ 02 BRAKES        ◄ hover │   (crossfades to the row  │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │    you hover / tap)       │
│ 03 ENGINE DIAGNOSTICS    │   + 1-line caption        │
│ ...                      │                           │
└──────────────────────────┴───────────────────────────┘
```

- Every service has its own image, but only **one image is on screen at a time**, so 16 photos don't turn into a wall.
- Rows are uppercase 500 with dashed dividers; the active row gets the ivory underline.
- **Mobile:** each row is an accordion. Tapping expands the image inline with a one-line description and a call/text button.
- Images lazy-load and preload the next one, so it stays fast.
- Adding a service later means adding one row and one image.

**The 16 rows (merged from Zack's list):**

| Tab | Rows |
|---|---|
| Mechanical & Maintenance | Oil change & maintenance · Brakes · Engine diagnostics & repair · Electrical & battery · Steering & suspension · A/C & heating · Tires & alignment · Belts, hoses & cooling |
| Engines & Drivetrain | Transmission service · Engine replacement (reman / used) · Transmission replacement · Front & rear differentials |
| Body & Paint | Collision repair · Bodywork & paint |
| Care & Protection | Detailing · Undercoating |

## Image sourcing (16 service images + team)
1. **Real shop photos first** (Zack's, from Kemal): AI-edit to the theme (dark navy void, cool ambient + brass rim light).
2. **Gaps** (parts or jobs with no real photo): generate stills in the same void-mode grade, e.g. a remanufactured engine isolated on Midnight, a differential, a brake rotor.
3. **Team photos:** clean up backgrounds and grade to the theme, **preserving each person's likeness**. Pilot on one photo before doing the rest.
4. Stills are cheap compared to video, so batch these after the two videos are locked.

## Video shot list (one scene at a time, one video attempt each)

**Credit-saving workflow per scene:**
1. Generate the **start frame** (and end frame) as *stills* first. They are cheap, and you approve them.
2. Run **one** video shot using those frames as start/end images, so the outcome is anchored and less likely to need a redo.
3. Preflight the cost with `get_cost` before submitting. Nothing is spent until you say go.

### Scene 1: Hero (BMW drives off)
- **Start frame:** rear three-quarter view of a dark BMW sedan parked on a polished floor in a pure Midnight void; brass rim light on the roofline.
- **End frame:** the same empty floor, car gone, taillight glow fading on the floor.
- **Motion:** car pulls away from camera and out of frame. Camera locked. About 5-6 s, 16:9.
- **Layout:** lower half of the end frame is empty, and the headline sits there.

### Scene 2: Reviews (lift rises)
- **Start frame:** the BMW (same car) on a two-post lift in a dark bay, wheels a foot off the floor, in Midnight void with cool blue ambient.
- **End frame:** car fully raised, the underside lit by a brass rim light, negative space on both sides.
- **Motion:** the lift rises slowly, camera locked. About 5-6 s, 16:9.
- **Layout:** review quotes sit left and right of the car and reveal as the scroll progresses.

**Scroll delivery:** export each video as ~90-120 frames (WebP, 1280px wide) and scrub on scroll with GSAP ScrollTrigger. Add a still fallback and disable the animation for `prefers-reduced-motion`. Smaller mobile frame set.

## Build stack (proposed)
Astro + GSAP ScrollTrigger + vanilla JS for the Service Index, on Cloudflare Pages. The contact form posts to a form service that forwards to Zack's regular email.

## Open items
- [ ] Zack's email address for form submissions
- [ ] Logo (or we set the wordmark in type, like ORYZO)
- [ ] ASE certification (leave off until confirmed)
- [ ] Which number is the text line
- [ ] Permission + exact text for review quotes
- [ ] Worker photos and shop/service photos into `assets/raw/`
