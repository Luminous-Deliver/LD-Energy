# Stage 1b content accuracy review

Prepared 14 September 2026. Base: `14a6813dc500da17fb9dadc49d48bfe0a96b1f94`.
Branch: `fix/stage-1b-content-accuracy`. This content commit is for independent review; it has not been pushed or deployed.

## Stage 1 production gate

Stage 1 is on `main` at the exact approved commit. Cloudflare deployment
`6f86cac1-6a81-42a2-8772-c85d4eecf497` completed successfully, with `commit_dirty: false`.
The deployment serves `https://epc.luminousanddeliver.co.uk`.

Cache-busted production smoke passed on 13 September:

- Contact returned 200/MISS; first control at 447px in the 390×844 viewport.
- Known floor area produced the correct inline estimate; unknown area showed the manual quote message without a numeric total.
- Generic customer type remained empty; landlord and estate-agent context initialised correctly; seller remained empty.
- Newham retained all three in-page `#contact` actions and the shared form.
- Approved £35 form copy was present.
- The real Turnstile script and challenge loaded. No JavaScript page errors or console errors were recorded.
- No real enquiry was submitted.

Evidence: parent workspace `audits/website-growth-audit/ld-energy-stage1-production-2026-09-13/smoke.json` and screenshots.

## What changed and why

The standard EPC recommendation report is included independently of the optional £35 product. The additional product leads with Abdul's personalised interpretation and priorities, supported by the full Elmhurst Energy Report. Legitimate recommendation exceptions follow assessment rules, never the customer's purchase decision.

Current domestic MEES duties are distinguished from EPC commissioning/provision duties and from the confirmed future policy. Current maximum penalties are £2,000 for letting below the standard for under three months, £4,000 for three months or more, £1,000 for false register information and £2,000 for failing to comply with a notice; GOV.UK states a £5,000 total cap per property. The future £30,000 maximum requires legislation.

The confirmed higher standard has one compliance date, 1 October 2030. Copy distinguishes the future metrics and £10,000 cap from today's E minimum and £3,500 cap. Obsolete phased deadlines were removed. Transitional recognition of existing EER C certificates includes expiry **or replacement**.

The fixed-point simulator and duplicate hidden homepage summary were removed. The remaining EPC explanation keeps its useful links. There is no homepage redesign or new interactive tool.

Floor plans are described as marketing/illustrative documents with approximate dimensions, rather than architectural or legal-boundary documents. EPC floor area may differ because its measurement conventions differ.

Related false claims discovered in the same guides were corrected: completed EPC required before any marketing; automatic invalidation after works; guaranteed or budget-derived rating gains; sale-price returns and assessment-fee payback; unsupported appointment availability; expired GBIS funding; incorrect BUS EPC-C eligibility; evidence automatically improving ratings; counting lighting fittings instead of lamps; and confusing carbon changes with the cost-based headline rating. These corrections preserve existing URLs and useful supporting links.

## Files and copy review

Paths below are relative to `ld-energy-website/`. The commit diff is the complete, exact before/after copy record.

| File | Change |
|---|---|
| `app/about/page.tsx` | Correct RdSAP introduction date and avoid implying every assessor uses Elmhurst software. |
| `app/areas/[borough]/page.tsx` | Two legal FAQ answers: MEES scope/penalties and EPC commissioning. Routing unchanged. |
| `app/landlords/page.tsx` | Current penalties, scope/exemptions, future policy, no automatic renewal after works, qualified improvement/appointment claims. |
| `app/layout.tsx` | Factual Improvement Plan offer description only; entity structure unchanged. |
| `app/llms.txt/route.ts` | Recommendations/product, modelled costs, floor-plan scope and current/future MEES consistency. |
| `app/page.tsx` | Remove duplicated hidden summary and now-unused imports. |
| `app/pricing/page.tsx` | Included standard report, additional £35 plan, conditional later lodgement and appointment wording. |
| `app/sellers/page.tsx` | Commissioning/provision distinction across visible copy and metadata; no automatic new EPC after improvements or fixed renewables gain. |
| `app/services/domestic-epc/page.tsx` | Legal FAQs/service copy, current MEES, software/methodology and lamp-count accuracy. |
| `app/services/epc-improvement-plan/page.tsx` | Approved personalised-plan positioning; standard report included; modelled costs; no guaranteed gain or PAS 2035 service implication. |
| `app/services/epc-pre-assessment/page.tsx` | Private assessment is not a lodged EPC or a way to defer duties; no fixed public-record lifetime; later lodgement conditional on valid data/rules. |
| `app/services/floor-plans/page.tsx` | Approximate marketing-plan scope in visible content and description; remove unsupported enquiry-uplift claim. |
| `app/terms/page.tsx` | Included recommendations and additional product; floor-plan scope; valid-data condition for later lodgement; revision date. |
| `components/sections/EpcSimulator.tsx` | Deleted unsupported fixed-point/savings simulator. |
| `components/sections/Pricing.tsx` | Included standard report and additional plan wording. |
| `components/sections/ServicesOverview.tsx` | Additional personalised plan, supporting report, pre-assessment inclusion. |
| `components/sections/WhatIsEpc.tsx` | Remove simulator and empty column; retain accurate EPC essentials and links. |
| `lib/boroughs.ts` | Singular assessor and confirmed appointment availability in all 34 entries; no slug, URL or area restructuring. |
| `lib/faq.ts` | Recommendations, EPC commissioning, MEES, modelled outcomes and availability consistency. |
| `lib/pricing-estimate.ts` | Comments only; no arithmetic or product eligibility changes. |
| `lib/site.ts` | Comments only: remove superseded recommendation-suppression and internal-cost positioning. Prices unchanged. |
| `content/blog/cavity-wall-insulation-epc.mdx` | Current/future policy and funding status. |
| `content/blog/cheapest-ways-improve-epc.mdx` | No fixed outcome/sequence, lamp recording, controls, draught-proofing, funding and additional-plan distinction. |
| `content/blog/epc-c-by-2030.mdx` | Future policy/transition, remove unsupported point gains and obsolete funding advice. |
| `content/blog/epc-for-landlords-2026.mdx` | Current scope/penalties/exemptions, future policy, no guaranteed C budget or rent uplift. |
| `content/blog/epc-for-selling-house.mdx` | Commissioning, scope and timing; remove unsupported market-return statistics and fixed improvement packages. |
| `content/blog/epc-improvements-by-budget.mdx` | Budgets do not predict points/bands; lighting/draught-proofing, funding, reassessment and modelled outcomes. |
| `content/blog/epc-ratings-explained.mdx` | MEES scope/future policy and lighting terminology. |
| `content/blog/epc-vs-floor-plan-vs-survey.mdx` | EPC commissioning, MEES scope, standard recommendations, floor-plan scope and survey qualification wording. |
| `content/blog/how-long-does-epc-last.mdx` | Expiry/works versus actual EPC duty; no guaranteed post-works increase or appointment capacity. |
| `content/blog/how-to-improve-epc-rating.mdx` | Metadata/body consistency, property-specific outcomes, no assessment-fee savings claim, funding/BUS and additional-plan wording. |
| `content/blog/loft-insulation-epc-rating.mdx` | Evidence when inaccessible, no fixed maximum-credit depth or point promise, funding status. |
| `content/blog/mees-regulations-2026.mdx` | Correct current requirements, penalties, exemption evidence and future policy; official source links. |
| `content/blog/mees-timeline-2026-2030.mdx` | Replace obsolete phased timeline; clear current/future distinction and evidence-based preparation. |
| `content/blog/prepare-for-epc-assessment.mdx` | Summary/metadata no longer promise paperwork raises the score. |
| `content/blog/rdsap-10-what-changed-2025.mdx` | Existing dwellings versus full SAP; cost rating versus carbon; no universal direction of change; correct future-policy distinction. |
| `content/blog/what-happens-during-epc-assessment.mdx` | Lamps/controls/evidence accuracy; remove fixed point increments. |
| `content/blog/why-is-my-epc-different.mdx` | Lamp-count terminology consistent with current conventions. |
| `docs/stage-1b-content-review.md` | This review record. |

Edited blog revision dates are 14 September 2026. Original publication dates and URLs are retained.

**Already approved/mechanical:** the £35 positioning, simulator/hidden-summary removal, singular assessor and article revision dates.

**Factual/compliance corrections:** the legal/methodology/funding/measurement statements above, qualification or removal of unsupported outcomes, and consistency across summaries, FAQs, terms and offer descriptions.

**New marketing propositions needing approval:** none. No new prices, delivery guarantees, reviews, credentials, offices, services or analytics were added.

## Evidence and official sources

Sources were checked on 13–14 September 2026. They support editorial corrections, not a legal opinion about an individual property.

- [Current domestic MEES guidance](https://www.gov.uk/guidance/domestic-private-rented-property-minimum-energy-efficiency-standard-landlord-guidance): E standard, scope, present penalties, cap and exemptions.
- [Government response on the higher rented-home standard](https://www.gov.uk/government/consultations/improving-the-energy-performance-of-privately-rented-homes-2025-update/outcome/improving-the-energy-performance-of-privately-rented-homes-government-response-html): 2030 date, pending legislation, metrics, cost cap, transition and future penalties.
- [Domestic EPC marketing/provision guidance](https://www.gov.uk/government/publications/energy-performance-certificates-for-the-construction-sale-and-let-of-dwellings/a-guide-to-energy-performance-certificates-for-the-marketing-sale-and-let-of-dwellings): recommendation report/exception, commissioning and time limits, modelled energy costs and certificate validity.
- [ECO4 extension response](https://www.gov.uk/government/consultations/extending-the-eco4-end-date/outcome/extending-the-eco4-end-date-government-response-html): ECO4 to 31 December 2026 for existing obligations/remediation; GBIS ended 31 March 2026.
- [BUS eligibility](https://www.gov.uk/apply-boiler-upgrade-scheme/check-if-youre-eligible) and [grant amounts](https://www.gov.uk/apply-boiler-upgrade-scheme/what-you-can-get): no general EPC C condition; eligible air-to-water grant.
- [Approved assessment methodologies](https://www.gov.uk/government/publications/methodologies-for-expressing-the-energy-performance-of-buildings-in-england-and-wales-notice-of-approval-24-march-2026) and [Elmhurst's RdSAP 10 overview](https://www.elmhurstenergy.co.uk/blog/2025/05/13/rdsap-10-recap/): methodology scope and more detailed input collection.
- Parent workspace `references/rdsap-conventions.md`, sourced from the MHCLG-approved v12.2 PDF: lighting 7.01, draught-proofing 3.11, evidence and heating conventions. The private scheme material is not published in this commit.

## Verification

Final source checks: no runtime `2028` wording, obsolete paid-recommendation/suppression copy or simulator references. `git diff --check` passes. Package manifests/lockfiles, booking state/attribution, API/security and price-calculation logic are unchanged.

Native Windows environment: Node v26.7.0, npm 11.19.0, existing Next.js 15.3.9. Temp/cache paths were directed into the D:-backed audit folder; no dependency installation or upgrade was run.

- `npm run typecheck`: PASS.
- `npm run lint`: PASS; existing `app/opengraph-image.tsx:36` raw-image warning.
- `npm run build`: PASS, 79 static pages generated, including all edited MDX.
- Rendered final-candidate checks: PASS on 71 affected pages (including all 34 areas, edited articles, blog index and affected category listings), plus `/llms.txt`. All returned 200 with one H1 and no document-wide mobile overflow; zero page errors. All 353 rendered FAQ answers matched their JSON-LD answers.
- Actual browser screenshots cover mobile 390×844 and desktop 1440×900. Manual inspection includes the plan policy, pricing answer, floor-plan scope, terms, landlord table/FAQ and homepage EPC section.
- FAQ answer/schema comparisons use the rendered DOM, not just source arrays. All 34 borough pages retain three `#contact` links and one shared embedded form.
- The homepage `webaudit.js` capture records no console errors or failed requests. Lighthouse was deliberately skipped: this commit makes no performance-score claim.
- No real enquiries were submitted. Local contact POSTs were blocked during browser checks.

Existing build warnings: Open Graph raw image, edge runtime disabling static generation, and `/llms.txt` combining edge runtime with `force-static`. No adapter/platform changes were made. Stage 1b has a successful Next production build; a new Stage 1b Pages package is not claimed. The exact Stage 1 Pages package and production deployment were verified separately before this work.

Evidence is in the parent workspace `audits/website-growth-audit/ld-energy-stage1b-2026-09-13/`: `typecheck.log`, `lint.log`, `next-build.log`, `rendered-results.json`, `detail-checks.json`, `source-contracts.json`, `stage-1b-source.diff`, rendered text/screenshot files and `home-webaudit/summary.json`. Source contracts passed across 128 runtime source files. Review scripts are saved there; these are audit artifacts, not a new application test framework.

## Review limits and remaining operational confirmations

- No newly unresolved legal rule was assumed. Existing questions for Elmhurst about holding survey data/private advisory assessments remain open; later lodgement is explicitly conditional on valid survey data and applicable rules. No holding-period number or unconditional entitlement was invented.
- Existing business service levels (72-hour standard/24-hour agreed express), contact hours, travel terms and unchanged DBS/review/insurance records still need owner verification in the separate factual-confirmation workstream. Current website copy is not proof of operational capacity. Unsupported extra same-day/same-week and 1–2-day appointment promises encountered in this pass were removed or qualified.
- One pre-existing contents-link mismatch remains in `/blog/how-to-improve-epc-rating`: the heading containing linked Tower Hamlets/Newham names produces a different contents slug. The same heading exists at the base commit; no heading-slug machinery was changed. This is recorded for the later link/accessibility pass.
- The landlord table uses its existing horizontal scrolling container on narrow screens; the numeric penalty column is visible by scrolling it. No table layout redesign was bundled in.
- All 34 location URLs are preserved for this workstream, without a permanent keep-every-page decision. No local SEO restructuring, schema entity refactor, consent/analytics change, font optimisation or platform migration is included.
- The parent vault's LD-Energy submodule pointer requires its own later commit. It was not automatically staged or pushed with this content review.
