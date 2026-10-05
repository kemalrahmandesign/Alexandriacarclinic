# Handoff: where we are and what is left

## State
Site is built and deployed as a preview. Hero film, lift film, services index, reviews, cars, About, booking form all work.
**What is left: photos, form setup, SEO, domain.** Photos first.

## Photo status (16 services + About)
| Service slug | Status | Source |
|---|---|---|
| oil-change | done (real) | originals/transrep (oil drain pan) |
| brakes | done (real) | originals/brakes |
| engine-diagnostics | done (real) | originals/engine |
| steering-suspension | done (real) | originals/steering |
| tires-alignment | done (real) | originals/tires |
| transmission-service | done (real) | originals/transsvc (impact gun mechanic) |
| differentials | done (real) | originals/diff2 (Mazda underside, plate blurred) |
| bodywork-paint | done (real) | originals/body (hand with sander, NO person, leave it) |
| team/team-1 (About) | done (real) | originals/oil2 (two men by oil drums) |
| electrical-battery | MISSING | generate |
| ac-heating | MISSING | generate |
| belts-hoses-cooling | MISSING | generate |
| engine-replacement | MISSING | generate (reman engine on a stand/hoist) |
| transmission-replacement | MISSING | generate (transmission close-up; the user's pan photo never uploaded) |
| collision-repair | MISSING | generate |
| detailing | MISSING | generate |
| undercoating | MISSING | generate (underside of a nice car on a lift) |

## The photo problem (read this)
Two looks exist and the user dislikes both as they stand:
1. **Real photos + code grade** (current site, `tools/build_photos.py`). Faithful, but reads flat/boring, the grade does not
   feel like the dark navy/brass theme. Removals were done by AI on the originals, then only the cleaned boxes were pasted back
   so the original pixels and text stay.
2. **AI "cinematic" versions** (`media/ai-v1/`, made by Higgsfield gpt_image_2 / nano_banana). Moody, warm brass light,
   dark navy shop, grimy and intense. The user now leans toward this look because it matches the theme ("use the
   garbage AI ones with the intense grimy look"). Problems seen in round one: studio-clean floors, invented text/logos,
   removed machine parts, over-saturation (nano_banana) or no change (gpt_image_2 with a "keep everything" prompt).

Decision from the user: **fill missing services with generated shots in the intense, grimy, cinematic look**, and
(their call) possibly move the existing real photos to that same look so the set is consistent. Ask which for the
existing 9 only if unclear; do not ask about the missing 8, just generate.

## Rules the user set (do not break)
- **Credits are tight** (~410 left). One attempt per image, get it right first time. No low-res tests; 2K max. Use
  `balance` / cost preflight and batch with `generate_image_batch`. Do not re-run to "see".
- **Never touch text** in real photos. AI invents text, so for real photos only paste back cleaned regions.
- Sander shot (bodywork-paint) is intentional: no person. Do not add anything to it.
- Keep the camera look and background blur. Reality over studio. Not a clean showroom, still a lived-in shop.
- Theme: `docs/design/DESIGN.md`. Midnight navy, cool ambient, one warm brass rim light, deep blacks, shop uniform blue.
- Do not touch Higgsfield without saying what it will cost. Plate numbers must not be visible.
- Higgsfield result URLs expire. After generating, add the URL to `media/images.txt` (`services/<slug> <url>`),
  run **Prepare media** workflow so the runner downloads it into the repo, then commit. Sandbox cannot download them.
- Run **Deploy preview** after changes and give the user the link. Bump `?v=3` in `index.html` if images change.

## Prompts for the 8 missing shots (suggested, 3:2, 2K)
Common suffix: "photographed on a full-frame camera, 50mm f/1.8, shallow depth of field, real working European car repair shop,
blue-painted cinder block walls, dark navy ambient shadows, one warm tungsten brass key light, grimy realistic textures,
dust, oil stains, film grain, no text, no logos, no license plates, no people."
- electrical-battery: close-up of a car battery with terminals and a multimeter probe on it, engine bay of a BMW.
- ac-heating: gauge manifold set hooked to an A/C service port, under-hood, hoses and compressor.
- belts-hoses-cooling: serpentine belt, coolant hoses and radiator cap in a Mercedes engine bay, coolant reservoir.
- engine-replacement: a remanufactured engine hanging from a red engine hoist in front of an empty bay, car with open hood behind, blurred.
- transmission-replacement: automatic transmission on a transmission jack under a lifted car, close-up.
- collision-repair: damaged front fender of a dark sedan on a frame rack, masking tape and sanding dust, no person.
- detailing: close-up of a polished dark paint panel with water beads and a buffer, brass light reflection.
- undercoating: underside of a nice car on a two-post lift, fresh black undercoating being sprayed, dramatic upward angle.

## After photos
1. **Form setup**: `data-endpoint=""` on the booking form in `index.html`. Pick a form service (Formspree, Web3Forms,
   or Cloudflare Pages Function) that forwards to Zack's regular email (ask the user for it). `js/motion.js` already POSTs JSON
   `{name, phone, email, vehicle, services[], message}` to the endpoint if set.
2. **SEO**: unique `<title>`/meta description, canonical, OG/Twitter image, JSON-LD `AutoRepair` (name, address, phone,
   hours Mon-Fri 8-6, Sat 9-3, Sun closed, areaServed, `makesOffer` for each service, `priceRange`),
   `sitemap.xml`, `robots.txt`, descriptive alt text, headline with "BMW Mercedes European repair Alexandria VA".
   State no Virginia inspection/emissions.
3. **Domain**: alexandriacarclinic.com. Zack has no domain email and no MX records. Need DNS access, then host on
   Cloudflare Pages or GitHub Pages with a custom domain (add `CNAME` file). Redirect www to apex.
4. Launch checklist is at the bottom of `README.md` (reviews, text number, logo, portrait films, phone test).

## Facts
Opened 2004. BMW/Mercedes/European specialists, works on all makes. 12 mo / 12,000 mi warranty. Shuttle, after-hours key drop.
Phone 703-370-8870. Hours Mon-Fri 8-6, Sat 9-3. No Virginia inspection or emissions. Also sells cars: alexandriaautova.com, 571-312-1593.

## Prompt to paste into a new chat
```
Repo: kemalrahmandesign/alexandriacarclinic, branch claude/alexandria-car-clinic-rebuild-ym6le2.
Read README.md and docs/HANDOFF.md first, then docs/design/DESIGN.md. The one-page site is built; what's left is
photos, then the booking-form endpoint, SEO, and domain. Do photos first.

Photos: 8 services have no image (electrical-battery, ac-heating, belts-hoses-cooling, engine-replacement,
transmission-replacement, collision-repair, detailing, undercoating). Generate them with Higgsfield using the prompts
in HANDOFF.md, in the intense, grimy, moody cinematic look shown in media/ai-v1/ (dark navy shop, warm brass key light,
real working European shop, no studio-clean floors, no text, no logos, no plates, no people).
Check balance and cost first, tell me the total, then run ONE generate_image_batch at 2K 3:2, one attempt per image.
Do not re-run anything without asking. Then look at the results and tell me honestly which are good.

After that, propose (don't spend credits on it yet) whether to move the 9 real photos to the same look; the real
photos are in media/originals and the current graded versions are in media/services. Never alter text in real photos,
and the sander photo (bodywork-paint) is intentional, no person, leave it.

Higgsfield URLs expire and the sandbox cannot download them: add them to media/images.txt and run the "Prepare media"
Action to pull them into the repo, then run "Deploy preview" and give me the link. Then do form setup, SEO and domain.
Be terse. I am frustrated by wasted credits and over-explaining.
```
