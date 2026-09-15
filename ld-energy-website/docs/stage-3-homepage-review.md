# Stage 3: homepage journey

Parent: Stage 2 application `036b67e`, with configuration/evidence follow-up `65af54b`. No form/API, dependency, price table or borough-template change.

## Objective and implementation

Retain the navy/sage identity and serif headings, while bringing Domestic EPC, accreditation, guide price and exact-quote action together. Replace duplicated homepage sections with `HomeHero`, `HomeServices` and `HomeContent`. Pricing uses the existing shared calculator and controlled quote helper. No area is preselected; unknown area has no invented total. Services remain visible without swiping.

The named assessor section links to GOV.UK and genuine Google reviews without asserting an unverified current review count. Preparation, audience, coverage and knowledge summaries link to existing comprehensive pages. Five initially closed FAQs and their JSON-LD use one source array. The homepage form becomes a direct final quote action; all 34 area-page embedded forms remain unchanged.

`CompactFooter` keeps contact/legal information visible and secondary navigation in native disclosures on mobile. `MobileQuoteBar` supplies one dominant enquiry action after the hero action leaves view, hides during menu use, and is absent on Contact and Privacy. Call and WhatsApp remain supporting links. Safe-area padding is reserved. Existing meaningful homepage fragments are retained, including services, pricing, before-the-visit, areas, agency, what-is-epc and contact.

## Verification

Evidence: parent workspace `audits/website-growth-audit/ld-energy-roadmap-2026-09-14/stage3/`.

| Width × viewport height | Document height | Pricing starts | Assessor starts | Horizontal overflow |
|---|---:|---:|---:|---|
| 320 × 568 | 6,721px | 635px | 2,265px | None |
| 390 × 844 | 6,251px | 611px | 2,158px | None |
| 768 × 1024 | 5,426px | 580px | 1,939px | None |
| 1440 × 900 | 4,603px | 592px | 1,296px | None |

At 390px: 7.4 viewport heights, compared with 20,876px / 24.7 viewports in the comparable Stage 1b baseline. Hero 627px; footer 547px. Pricing and some supporting sections exceed the suggested per-section maximum budgets because readable outcomes, links and targets remain; no fixed heights or smaller type were used to force them down. The overall target is met naturally. The primary quote action is visible at all tested widths, and pricing begins in the first 390 × 844 viewport.

- Typecheck, lint and production build passed (79 generated pages).
- Ten booking/security/history/analytics unit and contract checks passed with delivery mocked.
- Browser interaction checks passed: known and unknown price states, bundle/area intent reaches Contact, five closed FAQs, no duplicate homepage form, mobile action visibility/menu/Contact behaviour, and Stratford/Newham/Croydon embedded form CTA routing. No page errors or real enquiry submission.
- The first browser context assertion ran before Contact hydration finished. Waiting for the actual selected controls resolved that harness race; no form implementation was changed.
- Real screenshots at all four widths, plus desktop/mobile full-page review.
- Comparable local Lighthouse: desktop Performance 66 → 95; mobile 78 → 98. Accessibility 99 → 100; Best Practices 100 → 100; SEO 92 → 100. These lab runs are not a field Core Web Vitals result or proof of WCAG conformance. Further keyboard/enlarged-text/performance work belongs to Stage 5.

## Review and rollback

Review the hierarchy, product outcomes and controlled intent, mobile persistent action, retained links/fragments and FAQ source parity. Unconfirmed turnaround, DBS, insurance and current numerical review proof are not newly promoted into the hero. Conversion uplift requires measured enquiries and bookings. Revert this stage commit to restore the preceding homepage and shared footer/action presentation. Production rollout will occur after the following focused accessibility/schema checks, with exact deployment recorded in the roadmap register.
