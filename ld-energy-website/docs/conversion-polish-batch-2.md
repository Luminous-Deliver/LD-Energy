# Conversion polish batch 2: quote form, homepage, FAQ links, footer, menu

16 September 2026. Parent: `ed9449b` (application `fe999ce`, deployment `93f24e7d`). Owner-directed follow-up to the desktop pass, with the old deployment `73c85033` (commit `ff9efbf`, before Stage 1) used as a visual reference only.

## Owner decisions

- Quote form: desktop live summary plus visual polish; mobile unchanged.
- Services menu: replace "Energy Assessor" with the EPC Improvement Plan. The `/domestic-energy-assessor-london` page is retained (footer, FAQ link, sitemap, `llms.txt`); no redirect or removal before the 28/90-day review. Search Console, 28 days to 12 September: 72 impressions, 0 clicks, average position 15.6.
- Homepage: verified Google rating, "Before your visit" moved up one section, the Good to know section restored, and service cards with points and "Better value".

## Changes

- **Quote form (desktop):** a sticky "Your quote" panel restates service, floor area, customer type, lodgement, Improvement Plan and the shared `guideEstimate` total, with call/WhatsApp/email rows, accreditation and rating. The form publishes controlled selections only, through a context with a stable setter; the panel is not a live region and never submits. Desktop also gains a three-step progress bar, three-column floor-area choices and "Better value", "Private" and "Agencies" badges. Service choices moved to `booking-copy.ts` so form and panel share labels. Validation, steps, URL context, Turnstile, submission and attribution are unchanged. The existing "What's included" list is not repeated in the panel because it carries the unconfirmed "No Travel/Call-out Surcharges" claim.
- **Contact page mobile:** support cards, office hours and assessor card remain below `lg`; the sidebar uses flex gap so the hidden desktop panel adds no spacing.
- **Google rating:** 5.0 from 4 reviews, read from the public Google Maps listing on 16/09/2026 and stored in `site.reviews`. Shown as linked text in the mobile hero and assessor section, the desktop hero card, the quote panel and the desktop footer. No review structured data.
- **Homepage cards:** product-fact points only (no turnaround, hours or travel claims); "Better value" and a bundle saving derived from the price table (per band once a floor area is chosen).
- **Homepage order and content:** Before your visit now precedes "An EPC for your next step". "Three things worth knowing first" (`#worth-knowing`) restores the former Good to know copy and links; the RdSAP 10 June 2025 date matches the reviewed RdSAP 10 article.
- **FAQ:** internal links added to the 24 questions without any; 31 of 31 now link (40 internal links). Anchors were verified on production HTML. Answers are unchanged.
- **Footer (desktop):** 32px link rows instead of 44px touch rows, rating and quote action in the brand column, one-row legal bar. Mobile footer layout unchanged.

## Verification

Evidence: `audits/website-growth-audit/desktop-pass-2026-09-16/` (`batch2-before` = production `fe999ce`, cache-busted; `batch2-after`, `after2`, `final-verify2.out`). The local build used a placeholder `NEXT_PUBLIC_TURNSTILE_SITE_KEY` so the Stage 1 tests' mocked widget renders; production keeps its configured key.

- Typecheck, lint (existing OG-image warning only), Next production build (79 pages) and 11/11 unit/contract tests.
- Stage 1 `browser-booking.cjs` at 320/360/375/390/412/430/768/1440 (intent, focus, validation, retry, submission, privacy, 200% reflow) and `review-layout.cjs` (first-control positions and enquiry labels) pass.
- Contact below `lg`: page heights equal production and the first viewport is pixel-identical at 320/390/768; first control 471/447/447px. Desktop first control moves from 419 to 481px at 1440 for the progress bar.
- Batch checks: panel visible only at 1024+ and support cards only below it; panel shows EPC + Floor Plan, 38–52 m², Homeowner and £120 after selection; FAQ 31/31 with links; menu has the Improvement Plan and not Energy Assessor (desktop and mobile); rating visible; badge and saving present; section order; no horizontal overflow or page errors.
- Homepage harness (prices, estimator, form hand-off, quote bar, area pages) and 12-template schema check pass.
- Desktop footer at 1440: 637 → 489px.

| Homepage height | Before | After | Main source of change |
|---|---:|---:|---|
| 390 | 6,313 | 7,453 | Good to know (+645), card points and saving (+451), hero rating (+44) |
| 1440 | 5,137 | 5,517 | Good to know section and card points |

Deployment: exact commit `86869dd` shipped as Cloudflare Pages deployment `d84c147c-1de3-4ace-a95f-4d6f5418e637` on 16 September 2026. The same batch checks against production (cache-busted) passed with heights identical to the local build at all five widths; evidence in `batch2-production/`. Pages cached before the release refresh on expiry; no purge was run.

Rollback: revert `86869dd`.

## Follow-up: quote form proportions, 17 September 2026

Owner feedback: the form still showed white space and uneven cards. Changes, form presentation only:

- The odd option in a two- or three-column grid spans the row (`fullRow`): Agency / portfolio enquiry and Not sure of floor area. No empty cells from 640px up.
- At `lg`, floor-area tiles show the short bedroom reference ("1 bedroom"); below `lg` the full caption remains. Accessible names are unchanged.
- Service badges appear from 1280px, where they fit beside the name; between 1024 and 1279px the cards stay even.
- Area pages at `lg`: the embedded section places the intro and a sticky quote summary beside the form, instead of stretching the form across the container.
- "Need help? Call or WhatsApp." loses its touch padding at `lg` only.

Verification (`final-verify3.out`): typecheck, lint, build, 11/11 unit tests, Stage 1 booking tests at eight widths and layout test, homepage harness, batch checks and schema pass. Phones (320/390): Contact and three area pages keep identical heights and the Contact first viewport is pixel-identical. At 768 pages are 60px shorter where orphan options now span the row. At 1440 area pages are 298px shorter; three `#contact` actions and one form retained.
