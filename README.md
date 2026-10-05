# Alexandria Car Clinic: website

One-page scroll site for Alexandria Car Clinic (owner Zack, 3235 Colvin St, Alexandria VA 22314, 703-370-8870).
Static HTML + two CSS files + one vanilla-JS file. No framework, no scroll library, no build step.
Motion engine adapted from the Loco Exotics build (https://github.com/kemalrahmandesign/Loco-exotic).
**Picking this up in a new chat? Read `docs/HANDOFF.md` first.**

Preview (GitHub Pages, deployed by hand): https://kemalrahmandesign.github.io/Alexandriacarclinic/
Branch: `claude/alexandria-car-clinic-rebuild-ym6le2`

## Layout of the repo
```
index.html            all markup and copy
css/tokens.css        design tokens (midnight navy / brass)
css/site.css          all styles
js/motion.js          scroll engine, text reveals, services index, booking form
fonts/                self-hosted Inter
media/hero.mp4 lift.mp4 + posters   scroll films (made by the "Prepare media" workflow)
media/services/       service photos, one per service, named by slug
media/team/team-1.jpg About photo
media/originals/      untouched shop photos from Zack (NOT deployed, contains a licence plate)
media/removed/        AI cleanup outputs used for paste-back (NOT deployed)
media/ai-v1/          first-round "cinematic" AI photos, kept for reference (NOT deployed)
media/spare/          unused photos (NOT deployed)
media/manifest.txt    films to download: name url trim_start trim_end interp
media/images.txt      stills to download (Higgsfield URLs expire; most are already saved in the repo)
tools/grade.py        numpy/PIL colour grade
tools/build_photos.py per-photo config: paste-back removals, blur boxes, grade; run `python3 tools/build_photos.py [name...]`
docs/design/DESIGN.md design system (read before generating any image or video)
docs/content/client-brief.md   facts and answers from Zack
docs/plan/site-plan.md         section plan
docs/HANDOFF.md      state of play + next steps + prompt for a fresh chat
.github/workflows/    media.yml (download + encode media), pages.yml (deploy preview)
```

## Page structure
Hero scroll film (BMW M2 drives off) → intro statement → Services index (16 rows, one image stage,
accordion on mobile) → Reviews over scroll film (AMG GT on a lift, played in reverse) → Cars for sale
(links to alexandriaautova.com) → About / Contact → Booking form with service chips.

## Workflows (Actions tab)
- **Prepare media**: downloads/encodes films from `media/manifest.txt` (keyframe every 4 frames so scrubbing is smooth),
  downloads stills from `media/images.txt` (skips ones that already exist), commits to the branch.
  The sandbox cannot download Higgsfield/cloudfront URLs, only the Actions runner can.
- **Deploy preview**: publishes the site to GitHub Pages (manual dispatch). Excludes originals, removed, ai-v1, spare, staging, qa.

## Photos
Service photos are `media/services/<slug>.jpg`, 3:2, max 2K wide. If a file is missing the page shows
a dashed "photo coming soon" frame. Image URLs in `index.html` carry `?v=3`; bump it when images change.
Status table is in `docs/HANDOFF.md`.

## Before launch
- [ ] Photos: finish all 16 services (see HANDOFF) and decide on the look
- [ ] Booking form: set `data-endpoint` on the form (currently sends nothing, just shows confirmation)
- [ ] SEO: title/description/OG image, LocalBusiness + AutoRepair JSON-LD, sitemap/robots check, alt text, Google Business link
- [ ] Domain: DNS access for alexandriacarclinic.com (Zack has no domain email, no MX records), hosting (Cloudflare Pages or GitHub Pages custom domain)
- [ ] Replace the six DRAFT review cards with real, approved Google reviews
- [ ] Confirm the text number (571.247.6874 is an unconfirmed guess from the old site)
- [ ] Zack's full name and OK to show him; ASE claim only if confirmed; logo
- [ ] Portrait (9:16) cuts of the films for phones (engine supports `data-portrait` on `<source>`)
- [ ] Real-phone test of scroll scrubbing
