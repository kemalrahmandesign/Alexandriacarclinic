# Alexandria Car Clinic — Current Site & Brand Audit

_Compiled 2026-09-24 as pre-build research for the site rebuild._

> **Sourcing note:** The session's network policy blocked direct access to
> `alexandriacarclinic.com` (plus Yelp, BBB, archive.org and the review sites),
> so this was assembled from search-engine indexes of the live site and
> third-party listings, **not a full crawl**. Items marked ⚠️ need confirming
> with the owner or with a real crawl before they go on the new site.

---

## 1. Business basics

| Field | Value | Source |
|---|---|---|
| Name | Alexandria Car Clinic (legal: **Alexandria Car Clinic, Inc.**) | site, BBB |
| Address | **3235 Colvin St, Alexandria, VA 22314** (Douglas MacArthur neighborhood area) | site, Yelp, BBB |
| Phone (website) | **(571) 247-6874** | site |
| Phone (Facebook/listings) | ⚠️ **(703) 370-8870** (a second number; confirm which is primary, or whether both are live) | Facebook |
| Hours | Mon–Fri 8:00 AM – 6:00 PM · Sat 9:00 AM – 3:00 PM · **Sun closed** | site |
| Owner | **Zack** (goes by "Mr. Zack" in reviews); ⚠️ get his full name and whether he wants to be featured | reviews, LinkedIn |
| Experience claim | "Over **50 years of combined** automotive experience" | site |
| Certifications | **ASE-certified technicians** ⚠️ (confirm current certs, how many techs, and any AAA / NAPA / other affiliations) | site |
| BBB | Has a profile, **not accredited**, no BBB reviews | BBB |
| Founding year | ⚠️ Not found. The site only says "since our founding." One reviewer says they've been a customer for **about 20 years**, so ask the owner for the year. | reviews |

## 2. Current site structure (indexed pages)

| URL | Page title (SEO title as indexed) |
|---|---|
| `/` | Auto Repair in Alexandria, VA \| Alexandria Car Clinic \| ASE Certified Technicians, Complete Automotive Service, Engine Diagnostics, Brake Repair, Oil Changes, Electrical Systems, Northern Virginia |
| `/contact/` | Contact Alexandria Car Clinic - Auto Repair Alexandria, VA \| Expert Vehicle Service, … |
| `/schedule/` | Schedule Auto Repair Service in Alexandria, VA \| … Book Online Appointment Scheduling, ASE Certified Technicians, **Same Day Service** |
| `/privacy-policy/` | Privacy Policy - Alexandria Car Clinic |
| `/?PageData=255327` | "Automotive Service and Maintenance in Alexandria, VA". **Legacy URL from an older site platform** that's still indexed. |

**Observations**
- It's a small site: home, contact, schedule, privacy. **No individual service pages were indexed**, which is a big local-SEO gap.
- The SEO titles are keyword-stuffed (very long and comma-listed). The new site should use clean titles with one page per service.
- The legacy `?PageData=` URL is still indexed, so the new site needs a **301 redirect map**.
- There's an online booking page at `/schedule/`. ⚠️ We need to find out which booking tool powers it (Shopmonkey, Tekmetric, AutoOps, a plain form, etc.) so we can keep or replace it.

## 3. Services (as listed or described on the site)

**Maintenance**
- Oil changes
- Belts & hoses inspection
- Batteries
- Cooling system maintenance
- Tire sales & installation ("top-rated brands")
- Computerized wheel alignment

**Repair**
- Brake service & systems / brake inspections
- Engine repair, up to **engine rebuilds**
- Computerized engine analysis / diagnostics
- Electrical system troubleshooting
- Transmission service
- Steering & suspension
- A/C & heating repair

**Positioning phrases from the current copy** (reuse, or improve on them)
- "State-of-the-art diagnostic equipment"
- "Digital inspection reports and clear explanations for every recommended service"
- "Modern facility: hydraulic lifts, computerized alignment equipment, specialized tools"
- "Domestic and foreign vehicles"
- "Comprehensive warranties" + "detailed service records"
- "Accept most extended warranties"
- "Honest diagnostics and quality workmanship"
- "Same day service"

⚠️ Get from the owner: the warranty terms (e.g., 12k/12mo or 24k/24mo), any makes they specialize in, whether they do state inspections (Virginia safety inspection is a big traffic driver), and whether they offer loaners, shuttles, or after-hours key drop.

## 4. Reputation & reviews

| Platform | Rating / count (as indexed) |
|---|---|
| Auto Repair Score | **4.6★ · 73 reviews** |
| Birdeye | 66 reviews |
| Yelp | 16 reviews |
| Google | ⚠️ Not visible in search; pull the rating and count directly |
| Trust Mechanics | Mixed |

**Positive themes** (these should drive the site's messaging)
- **Honesty and trust in Zack personally**: "honest and fair," "doesn't take advantage of customers"
- Friendly, patient, considerate staff
- Fast turnaround: "diagnosed and completed repairs in a single day"
- Fair or competitive pricing
- Long-term loyalty (customers of about 20 years)
- Paraphrased from indexed reviews: "Awesome professional people and fast service!!!"

**Negative themes** (the new site can address these indirectly)
- Dec 2024: a transmission replacement failed after about a month, and the reviewer disputed the warranty.
- Nov 2024: a quoted $2,500 rear-seal job turned out to be a $15 oil pressure switch.
- **Site response:** feature a clear, published warranty, the digital inspection reports with photos, and "we show you before we fix it" transparency.

⚠️ Get permission and exact wording before quoting any review verbatim. The quotes above are paraphrased from search snippets.

## 5. Web presence / links

- Website: https://alexandriacarclinic.com/
- Facebook: https://www.facebook.com/p/Alexandria-Car-Clinic-100069307241968/
- Yelp: https://www.yelp.com/biz/alexandria-car-clinic-alexandria
- BBB: https://www.bbb.org/us/va/alexandria/profile/auto-repair/alexandria-car-clinic-inc-0241-236012079
- Birdeye: https://reviews.birdeye.com/alexandria-car-clinic-149410773046983
- Auto Repair Score: https://autorepairscore.com/va/alexandria/alexandria-car-clinic-alexandria-virginia
- Trust Mechanics: https://www.trust-mechanics.com/shop/alexandria-car-clinic-alexandria/
- LinkedIn (owner): https://www.linkedin.com/in/zack-clinic-18226a64/
- Instagram: none found (`@carcareclinic` is an unrelated account)

## 6. Still needed (couldn't get without direct site access)

- [ ] Logo files (SVG/PNG) and any brand colors or fonts in use
- [ ] Real shop photos: exterior, bays, team, Zack. Also check whether we can get the current site's photos in full resolution.
- [ ] The booking/scheduling tool behind `/schedule/` and the contact form's destination email
- [ ] The full sitemap (`/sitemap.xml`) to build the 301 redirect map
- [ ] Google Business Profile rating, review count, and categories
- [ ] Analytics or tracking in use (GA4, call tracking numbers, which could explain the two phone numbers)
- [ ] Any coupons, specials, financing, or fleet services
- [ ] Which phone number is primary (571 vs 703)

**To unblock a real crawl:** add `alexandriacarclinic.com` to the cloud environment's
allowed domains (environment settings → Network access), or switch to a broader
access level. Then I can pull every page, image, and the sitemap directly.

## 7. Competitive context (same search space)

Wiygul Automotive Clinic (multiple Alexandria locations), Community Car Care,
Midas, Mr. Tire, George's (22314), and EZ Car Clinic (mobile). The name
"Car Clinic" overlaps with Wiygul Automotive Clinic and EZ Car Clinic, so the
brand needs to be distinctive.
