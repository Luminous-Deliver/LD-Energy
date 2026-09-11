# Stage 1 independent-review corrections

Base commit: `fca8b32`. Branch: `fix/stage-1-booking-journey`.
This is a focused follow-up for independent re-review. No push, deployment, merge,
squash, homepage redesign, migration or analytics installation is included.

Evidence: `D:/Dev/Abdul-2/audits/website-growth-audit/ld-energy-stage1-review-fix-2026-09-11/`.

## A. Blockers fixed

- `PageHero` and `CtaStrip` now render the caller's explicit destination and label.
  Their primary CTA is required; routing policy no longer lives in either component.
  All callers are explicit. All 34 area pages keep their shared embedded form.
- Customer type starts empty on generic/seller/area enquiries and is required in
  Step 1. Landlord and agency source categories seed it once, then user state wins.
- Server-known `data.slug` passes through the area template, `ContactSection` and
  `ContactForm` as `areaPage`. It is distinct from the floor-area pricing `areaBand`.
  The API rejects unknown slugs against the existing authoritative `boroughMeta`.
- The form uses the owner's exact £35 additional-product explanation. Standard EPC
  recommendations are included either way. The wider content correction is Stage 1b.

## B. Completion fixes

- Controlled source and CTA attribution reaches the internal email, alongside the
  existing service, size and customer type. No analytics provider is added.
- The URL initialisation effect runs once. The `popstate` field-reset listener is
  removed. Back/Forward cannot reapply URL defaults over edited form values.
- The initial estimate box is omitted. Existing known/unknown/bulk summaries appear
  only when applicable. Contact spacing drops 12px without altering type or targets.
- Enquiry-facing Book labels are corrected on the affected CTA surfaces, with useful
  confirmed-booking prose preserved. Identified response-time promises are removed.

## C. Files changed

The implementation changes the shared form, validator, API, quote-context helper,
and new lightweight attribution module. Most remaining source edits are explicit
CTA source/destination arguments, customer context on pricing calls, and the copy
listed in the separate copy diff. The full relative file inventory follows below.

## D. Commit

One follow-up commit is added on top of `fca8b32`, without squashing it. The final
chat report records the resulting SHA. This report and the copy diff were prepared
before that commit. The parent vault's submodule pointer is not staged or committed.

## E. Customer type matrix

| Entry | Initial service | Initial customer type | After manual selection / Next / Back / validation |
|---|---|---|---|
| Generic `/contact` | Domestic EPC | Unselected | Customer's selection retained |
| `/landlords` quote links | Domestic EPC, or selected pricing service | Landlord (tenanted), existing enum | Retained |
| `/estate-agents` hero/bottom | Bulk / Agency Enquiry | Estate agent, existing enum | Retained |
| `/sellers` quote links | Domestic EPC, or selected pricing service | Unselected | Retained |
| Area-page embedded form | Domestic EPC | Unselected | Retained |
| Send another request | Domestic EPC | Unselected; size also unselected | Clean form |

These initialise only once. No new customer-type options are introduced.

## F. Area CTA matrix

| Area | Hero | Local pricing | Bottom | Internal area name |
|---|---|---|---|---|
| Stratford | `#contact` | `#contact` | `#contact` | Stratford |
| Newham | `#contact` | `#contact` | `#contact` | Newham |
| Croydon | `#contact` | `#contact` | `#contact` | Croydon |
| All remaining 31 URLs | `#contact` | `#contact` | `#contact` | Existing canonical display name |

The three named pages passed 9 mocked CTA submissions at each of eight widths:
72 submissions total. The production HTML survey additionally verifies all 34
templates render the three anchors, one form and their original canonical URL.

## G. Attribution contract

| Field | Source / validation | Output |
|---|---|---|
| `sourcePage` | `sourcePages` enum; explicit caller or controlled current-page category; optional for cached clients | Internal `Source page` row |
| `ctaId` | `ctaIds` enum; explicit quote URL argument, or last activated in-page CTA's controlled data attribute | Internal `CTA` row |
| `areaPage` | Server page prop; API membership check against `boroughMeta`; never read from an embedded page's query text | Internal `Area page` row with canonical display name |
| `areaBand` | Existing size-band enum or `unknown`, independently validated | Existing floor-area row and server estimate |
| `services` | Existing service enum and combination validation | Existing service row |
| `customerType` | Existing customer enum, empty rejected on submission | Internal `Customer type` row |

`sourcePages`: home, contact, area, areas, landlords, sellers, estate-agents,
domestic-epc, floor-plans, pre-assessment, improvement-plan, pricing, blog, about,
faq, assessor, preparation, other.

`ctaIds`: hero, pricing, bottom, header, mobile-menu, mobile-bar, inline, estimator,
embedded, direct.

Canonical quote links may contain allowlisted `source` and `cta` categories in
addition to the existing service/size/speed/plan selections. The existing URL `area`
parameter still means floor-area band. Geographic `areaPage` is never generated in
quote URLs. Existing clean `/contact` canonical metadata is preserved.

Missing attribution is accepted for cached clients. Invalid source/CTA enums and
invalid borough slugs return 400. Unknown payload keys are stripped. No referrer,
full query string, tracking ID or customer free text is collected as attribution.
The existing HTML escape function handles every internal email row. Attribution
is operational context, not cryptographic proof of an acquisition source. It is
absent from the customer acknowledgement and from the existing analytics events.

## H. First-control measurements

Measured on plain `/contact`, scroll position zero, fonts ready, existing consent
banner dismissed, normal text size. Actual first service radio top, in CSS pixels.
Development and isolated production measurements match.

| Viewport | First control top |
|---|---:|
| 320×568 | 471px |
| 360×800 | 447px |
| 375×812 | 447px |
| 390×844 | 447px |
| 412×915 | 447px |
| 430×932 | 423px |
| 768×1024 | 447px |
| 1440×900 | 419px |

The 390px target of ≤450px passes. The first control fits within 320×568. This
does not claim the first-visit cookie collision is resolved; that is Stage 2.
The 390px name/postcode widths remain 324px. Typography and touch targets retain
their Stage 1 sizes. Mobile and desktop screenshots were visually inspected.

## I. History and state

At all eight widths, a real same-page header quote link creates history, the user
selects Bundle / 38–52 m² / Letting agent, enters notes on Step 2, returns with the
form Back button, then uses browser Back and Forward. Service, size, customer type
and notes survive. Further edits recalculate correctly. Initial service parameters,
refresh context, validation focus, and Send another request also pass.

## J. Copy diff

See [the full copy diff](stage-1-review-copy-diff.md), separated into mechanical /
already approved, needs approval, and factual / compliance correction. No additional
copy needs approval. Internal labels are listed separately. No internal Energy Report
cost, deterministic rating gain or guaranteed saving is introduced.

## K–M. Verification results

| Check | Result |
|---|---|
| `npm run typecheck` | Pass locally and in isolated WSL |
| `npm run lint` | Pass; Windows retains the existing opengraph `<img>` warning; WSL reports no warnings/errors |
| `npm run build` | Pass in isolated WSL, Next.js 15.3.9, unchanged lockfile |
| `npm run pages:build` | Pass with the existing adapter in known-good WSL; worker output generated |
| `node --require ./tests/register.cjs --test tests/booking.test.cjs` | 7/7 groups pass: all pricing combinations, schema/legacy rules, URL allowlists, customer defaults, attribution, approved wording, API/email/security |
| `node tests/browser-booking.cjs` | All 8 widths pass core journey, fields, errors, focus, retry, duplicate prevention, privacy, reset and 200% text |
| `node tests/review-fixes.cjs` | All 8 widths pass audience defaults, manual edits, real-link history, estimates and 72 area CTA submissions |
| `node tests/booking-navigation.cjs` | Service/add-on/size intent, refresh, history, canonicals and header widths pass |
| `node tests/booking-specialists.cjs` | Floor-plan/pre-assessment eligibility, bulk landlord, keyboard and denied-storage production check pass |
| `node --require ./tests/register.cjs tests/area-cta-survey.cjs` | All 34 production-rendered area pages pass |
| `node tests/review-layout.cjs` | Production positions at all 8 widths and quote-link labels on 13 changed surfaces pass |

Core browser tests use the existing local preview on 3100 with mocked Turnstile and
intercepted submissions. Read-only production checks use the final isolated build
on 3111 (`BOOKING_TEST_URL`); the specialist storage check uses
`BOOKING_PRODUCTION_URL=http://localhost:3111`. No real enquiries or emails were sent.

The known WSL build helper supports `BOOKING_TEST_ARTIFACTS` for the new evidence
folder and reuses `/root/.cache/ld-energy-stage1.xi1Bxl`. It never deploys.

Evidence files: `booking-breakpoints.json`, `review-fixes.json`,
`production-layout-copy.json`, `area-cta-survey.json`, `booking-navigation.json`,
`specialist-checks.json`, build/test logs, and viewport/state screenshots.

## N. Regressions and deliberate deferrals

No failures remain in the changed-surface and core regression checks. The earlier
74-page independent survey was not unnecessarily repeated; the relevant 34 area
pages were rechecked. Pricing logic, lockfiles, Next version, Turnstile architecture,
cookie UI, origin checks, honeypot validation, request cap, missing-key protection,
server recalculation, error preservation and duplicate-submit guard remain intact.

Two pre-existing non-blocking API issues are documented rather than expanded here:
the honeypot's silent-accept branch is unreachable because schema validation rejects
it first, and the bulk subject can contain `Portfolio ()`. Bot payloads still fail
validation and never send an email. Neither issue was introduced by this patch.

Stage 1b owns wider Improvement Plan wording; Stage 2 owns consent/action-bar design.
No site-wide operational claims were re-certified. Tests are Chromium-based, with no
claim of complete WCAG conformance, real email delivery or Core Web Vitals improvement.

## O–P. Handoff gate

Keep this work on `fix/stage-1-booking-journey`, as a follow-up to `fca8b32`.
No push, deployment or merge is authorised. The final response records the commit
and clean working-tree check. Safe for independent re-review: **YES**.

## Full changed-file inventory

Paths below are relative to `ld-energy-website/`.


```text
app/about/page.tsx
app/api/contact/route.ts
app/areas/[borough]/page.tsx
app/areas/page.tsx
app/blog/category/[category]/page.tsx
app/blog/page.tsx
app/contact/page.tsx
app/domestic-energy-assessor-london/page.tsx
app/estate-agents/page.tsx
app/faq/page.tsx
app/landlords/page.tsx
app/page.tsx
app/pricing/page.tsx
app/sellers/page.tsx
app/services/domestic-epc/page.tsx
app/services/epc-improvement-plan/page.tsx
app/services/epc-pre-assessment/page.tsx
app/services/floor-plans/page.tsx
components/blog/CTABanner.tsx
components/forms/ContactForm.tsx
components/layout/Header.tsx
components/layout/MobileCallBar.tsx
components/layout/MobileNav.tsx
components/sections/BoroughFinder.tsx
components/sections/ContactSection.tsx
components/sections/Coverage.tsx
components/sections/CtaBand.tsx
components/sections/CtaStrip.tsx
components/sections/FloorAreaGuide.tsx
components/sections/Hero.tsx
components/sections/LocalPricingSummary.tsx
components/sections/PageHero.tsx
components/sections/Pricing.tsx
components/sections/TradeAgency.tsx
components/ui/ExactQuoteStrip.tsx
docs/stage-1-booking-repairs.md
docs/stage-1-review-copy-diff.md
docs/stage-1-review-fix-report.md
lib/enquiry-attribution.ts
lib/quote-context.ts
lib/validators.ts
tests/area-cta-survey.cjs
tests/booking-navigation.cjs
tests/booking-specialists.cjs
tests/booking.test.cjs
tests/browser-booking.cjs
tests/pages-build.sh
tests/review-fixes.cjs
tests/review-layout.cjs
```
