# Stage 1 booking repair: review record

Historical `fca8b32` record. See [the independent-review corrections](stage-1-review-fix-report.md)
for the subsequent fix pass and its verification.

Baseline: `ff9efbf`, following the Phase 1 audit and approved booking specification.
Evidence folder: `D:/Dev/Abdul-2/audits/website-growth-audit/ld-energy-stage1-2026-09-10/`.
This is a local implementation for review, not a production deployment.

## Result

The main quote route reaches `/contact#booking-form` directly. The form precedes
supporting contact and assessor information in the DOM and on mobile. Desktop uses
a wider form column and a separate support column. The fixed price overlay is retired.

Service links select EPC, bundle, floor plan, pre-assessment, or bulk correctly. The
Improvement Plan route selects EPC plus the existing £35 add-on. Allowlisted service,
floor-area, applicable speed and plan choices persist in the URL; customer details and
calculated prices never enter it. Canonical metadata remains `/contact`.

At 390×844, name and postcode fields now measure 324px wide, compared with the audited
71px. First-step controls start at approximately 583px on plain `/contact`, within
the first viewport. Fragment entry focuses the visible form heading below the header.

No size is preselected. Known bands produce a guide estimate; “Not sure of floor area”
allows submission without a numeric estimate. The form, existing homepage estimator,
and API use the shared calculation helper. The server validates size compatibility
and recalculates totals. Legacy bedroom identifiers remain accepted for cached clients;
contradictory old/new size fields are rejected. All existing prices are preserved.

Native radio groups and checkboxes expose selected states. Required fields, hints and
errors are associated. Next/Back focuses the new heading, errors focus the first invalid
visible control, and failed delivery retains customer edits. A synchronous submission
guard prevents rapid duplicate clicks. Success requires API confirmation of receipt,
and states clearly that the appointment still needs agreement.

The form emits collector-independent `form_start`, `form_step_complete`,
`enquiry_submitted`, service-selection and estimator events. Payloads contain controlled
categories only. These events make no network requests and do not install analytics.
Qualification and confirmed bookings still require actual business-system outcomes;
the website does not infer them from clicks or successful form submission.

## Additional repairs required by verification

- Enlarged text exposed intrinsic sizing problems in the logo/header, assessor card,
  Contact support cards and footer. Small wrapping/minimum-width fixes preserve their
  ordinary layout; no footer redesign or location-link removal is included.
- Input boundaries and error text now use sufficient contrast, and input targets are
  at least 48px high. Reduced-motion preferences disable existing smooth scrolling
  and transitions.
- Turnstile uses its compact layout when the form container is narrower than 300px.
- The existing cookie banner now tolerates blocked browser storage. Its appearance,
  purpose and analytics behavior are unchanged. The full consent decision is deferred.
- Quote-link constants are separated from Zod validation, avoiding a validation
  dependency in shared navigation.

## Verification

- Typecheck, lint, Next production build and the existing `@cloudflare/next-on-pages`
  packaging passed in an isolated WSL copy with the unchanged lockfile and Node 22.
  `_worker.js/index.js` was generated. Logs are in the evidence folder.
- Four Node test groups cover all five services, six bands, plan/express combinations,
  absent/unknown area, legacy mapping, contradictory input, URL sanitisation, both email
  representations, server recalculation, origin/body/honeypot checks, Turnstile failure,
  missing production secrets and failed delivery. All email transport was mocked.
- Browser journeys passed at 320, 360, 375, 390, 412, 430, 768 and 1440px: selection,
  form start, step focus, required/error association, retained edits, expired challenge,
  failed submission, retry, duplicate click protection, success events and 200% text.
  `booking-breakpoints.json` records dimensions; screenshots show each state.
- Service-page CTAs, Improvement Plan intent, estimator area context, edited selections,
  browser Back, refresh, query canonicals and header widths also passed. These checks
  were repeated against the isolated production preview.
- Specialist checks cover floor-plan/pre-assessment eligibility, a completed mocked
  bulk landlord enquiry, keyboard selection and blocked storage in production.
- All 74 sitemap URLs return 200 with one H1 and their existing canonicals. JSON-LD
  parses and matches the audit baseline, accounting for the already-shipped RdSAP
  article update in `ff9efbf`. All 34 location URLs remain. The retired consultation
  route still redirects with 308, and an unknown URL returns 404.
- Required `webaudit.js` captures completed for Home, Contact, Pricing, Domestic EPC,
  Improvement Plan and Pre-Assessment. No browser console errors were recorded. The
  Contact desktop capture recorded aborted external map-tile requests; mobile did not.
- Mobile and desktop screenshots were inspected, including the retained homepage hero
  and the new Contact layout. This stage does not claim a shorter homepage or improved
  Core Web Vitals.

## Reproduce

Run from `ld-energy-website`:

```text
npm run typecheck
npm run lint
npm run build
node --require ./tests/register.cjs --test tests/booking.test.cjs
node tests/browser-booking.cjs
node tests/booking-navigation.cjs
node tests/booking-specialists.cjs
node tests/rendered-booking.cjs
```

Browser tests use a local preview on port 3100 with Cloudflare's public test site key
and intercepted delivery. Production checks use an isolated preview on 3110.
`tests/pages-build.sh` records the existing local WSL packaging procedure; it uses
an isolated directory and never deploys. The rendered regression script uses the
saved Phase 1 audit baseline. No live customer enquiries were sent.

## Stage boundary and remaining limits

Stage 1 is the booking-repair gate. Homepage composition, hero replacement, the dominant
single-action mobile bar, footer compression, consent redesign, schema corrections,
content-accuracy work and performance experiments have not begun. No hosting migration,
new analytics product, location consolidation, redirect restructuring or price change
is included. Location quality remains a separate future evidence-based workstream.

Existing operational timing, hours, travel and insurance statements were not re-certified.
The remaining operational confirmations from the design specification still apply.
Native-device Safari/Android and assistive-technology testing have not been performed;
the browser evidence is Chromium-based and does not establish full WCAG conformance.
No live email-delivery test or field Core Web Vitals measurement is claimed.

Review this result before deployment or beginning homepage visual implementation.
