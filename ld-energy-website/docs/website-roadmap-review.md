# Website roadmap: review register

Started 14 September 2026. User authorised focused self-review and shipment of Stage 1b, followed by maximum safe progress through Stages 2–6 with separate commits and stable deployment checkpoints. This supersedes the earlier requirement to await AI 2 before Stage 1b deployment. No platform migration or dependency upgrade is included.

## Stage register

| Stage | Objective and boundary | Acceptance / evidence | State |
|---|---|---|---|
| 1 | Repair enquiry journey | Approved exact commit `14a6813`; production smoke passed | Deployed |
| 1b | Content/recommendations/MEES accuracy | `f6e37a2` + `c51e298`; static/build/rendered and nine-route production smoke passed | Deployed |
| 2 | Cloudflare Web Analytics, truthful privacy/consent | One beacon, verified storage/network behaviour, objection control, no provider migration or custom-event system; enquiry attribution preserved | Deployed `036b67e`; live ingestion/objection passed; see stage-2-measurement-privacy.md |
| 3 | Concise homepage with early pricing and primary form journey | Four-width screenshots/interactions; production height 6,251px at 390, pricing 611px, no overflow | COMPLETE, deployed `566d3cd` |
| 4 | Coherent visible business/person/credential schema | 12 production templates: one entity model, credential, £35 offer, FAQ parity | COMPLETE, deployed `cbdb603`; geographic follow-up in `15ff45b` |
| 5 | Accessibility and measured performance improvements | Keyboard, eight-width form checks, 200% text, reduced motion, network and Lighthouse comparisons | COMPLETE engineering batch, deployed `453174d`; field CWV/conformance not certified |
| 6 | Evidence-led on-site/local SEO | 74-page crawl, all 34 area URLs, fresh GSC, repaired fragments, Stratford/Newham distinctions | PARTIAL long-term workstream; safe on-site batch `15ff45b` deployed; owner facts and 28/90-day review remain |

Evidence directory in parent workspace: `audits/website-growth-audit/ld-energy-roadmap-2026-09-14/`.

## Stage 1b self-review

Base candidate: `f6e37a2eb60c7b6e10e5dfd808c51822adc922a6`. The original content review and 39-file inventory are in `stage-1b-content-review.md`.

The follow-up removes one remaining unsupported promise on the estate-agent page that an assessor can usually attend within one to two working days. Availability is instead confirmed before accepting the instruction. FAQ JSON-LD uses the same answer. No service price, calculation, form or API change.

Reviewed: standard recommendations/additional £35 product consistency; current E/penalties versus future 2030 policy; obsolete deadline search; floor-plan scope; simulator/hidden summary removal; methodology/funding and singular-assessor wording. Existing operational hours/service-level and scheme holding questions remain documented rather than invented. Broader trust/privacy and UI issues proceed in their designated stages.

Follow-up verification: typecheck, lint and Next production build passed (79 generated pages). Rendered spot checks passed for estate agents, pricing, Terms and Improvement Plan; FAQ answers match their JSON-LD. Source contract checks scanned 128 runtime files, confirmed the protected booking/API surfaces and price logic unchanged, all 34 borough slugs retained and no obsolete-policy/simulator/2028 matches. Evidence: `stage1b/build-results.json` in the roadmap audit and the existing Stage 1b rendered/source reports.

## Review discipline

Each completed stage records its exact commit(s), parent boundary, changed areas, acceptance results, deployment ID/hash and production smoke. Failed checks remain in the evidence record with classification. A completed stage does not imply completed long-term conversion or ranking measurement. AI 2 should review stage diffs against these acceptance criteria rather than repeat the entire original audit.

## Final release and exact chain

Application deployment `b97a6ad7-c5e7-4979-a6f6-068b45a3d059` successfully published on 15 September 2026. Production verification completed 16 September. Exact application commit: `15ff45b86eb37c332c5b9810667da09e133704d2`. All implementation commits below are on main and deployed. A subsequent documentation-only commit records this result and uses the supported `[CF-Pages-Skip]` prefix; it changes no deployed application files. [Cloudflare skip-build documentation](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/#skipping-a-build-via-a-commit-message).

| Stage | Exact commit | Parent / review diff |
|---|---|---|
| 1, approved base | `14a6813dc500da17fb9dadc49d48bfe0a96b1f94` | Prior independently approved Stage 1 |
| 1b | `f6e37a2eb60c7b6e10e5dfd808c51822adc922a6` | `14a6813..f6e37a2` |
| 1b self-review | `c51e298337b588769289ed465c16b5b8d7630365` | `f6e37a2..c51e298` |
| 2 code | `036b67e5e733ff721ed5097794d4e479b2f99388` | `c51e298..036b67e` |
| 2 configuration record | `65af54b3856fa749f246d72f58de76afa3692acb` | `036b67e..65af54b`, documentation only |
| 3 homepage | `566d3cdb9772aa0adce13293bb687032edc89ac2` | `65af54b..566d3cd` |
| 4 schema | `cbdb60319b8ce279fad092ad2c85b1cc65297666` | `566d3cd..cbdb603` |
| 5 accessibility/performance | `453174d7f4673b01363474f0d99c11e2af40c553` | `cbdb603..453174d` |
| 6 on-site/local | `15ff45b86eb37c332c5b9810667da09e133704d2` | `453174d..15ff45b` |

Stage 1b first shipped as `c51e298` in deployment `9be02b99-b1b6-4e99-8998-464b86ba102b`; Stage 2's corrected manual analytics configuration shipped exact `036b67e` in `38d8d78e-ddc2-4505-b2ea-0552adb4b6c7`. Stage 3–6 shipped together as the final stable application checkpoint. Commits remain separate rollback boundaries; nothing was squashed.

## Final acceptance evidence

The audit's `final/` folder contains live evidence, distinct from the earlier local stage evidence.

- Linux Cloudflare CI: Node 22.16.0, npm 10.9.2; Next generated 79 pages, Pages packaging and deployment passed. Worker `.vercel/output/static/_worker.js/index.js`; bundled 17 modules / 2,373.23 KiB. Existing adapter/transitive-package deprecations and the non-Vercel environment warning remain. No dependency or lockfile changed.
- Local final typecheck/lint/build passed; all 11 unit/contract checks passed. The Stage 1 form and API implementation are unchanged by this batch; pricing-estimate.ts changes are explanatory comments only. Delivery/security failures are mocked in tests, never live customer enquiries.
- Local 74-page rendered-HTML crawl: 200s, unique titles, one H1, clean canonicals, all URLs reachable and no broken internal fragments. All 34 area URLs retained.
- Production home at 320/390/768/1440: heights 6,721 / 6,251 / 5,426 / 4,603px; no horizontal overflow; quote visible initially, persistent action appears after the hero action leaves view; menu/Contact suppression works. Pricing starts at 611px at 390; 7.4 screens total. Known/unknown estimator states and bundle/area intent pass.
- Stratford/Newham/Croydon each retain three in-page #contact actions and one shared form. Generic customer type and area remain empty; landlord/agent context initialises correctly; seller remains empty. First control at 471px (320) and 447px (390/768). Inline estimate/manual quote, always-mounted live region and real Turnstile request pass. No page errors. The initial final-test assertion incorrectly expected an embedded form on the landlord audience page; following its canonical quote link passed without an application change.
- Real Cloudflare analytics: one script, three observed 204 measurement responses, zero console errors, no analytics cookie or identifier storage. Only the separate security cookie cf_clearance was observed. Privacy page loads no beacon; rejection/GPC/storage-failure controls were checked in Stage 2. One unload/navigation beacon was reported aborted by browser instrumentation; successful responses were observed, so delivery is not inferred merely from installation.
- Twelve production templates pass entity/credential/geography/offer and visible FAQ checks. Bare and cache-busted URLs serve the new implementation; no further cache purge was needed for this release.

| Production Lighthouse, 16 September | Performance desktop / mobile | Mobile LCP | Mobile TBT | CLS |
|---|---|---|---|---|
| Home | 81 / 96 | 2.69s | 88.5ms | 0 |
| Contact | 86 / 100 | 1.61s | 58ms | 0 |
| Domestic EPC | 74 / 93 | 3.14s | 58.5ms | 0 |

All six runs: Accessibility, Best Practices and SEO 100; no captured console or network errors. These are laboratory observations, not WCAG conformance or a field Core Web Vitals pass. The helper uses 390px screenshots and 375px mobile Lighthouse emulation. Desktop LCP was 2.94 / 2.26 / 3.45s respectively. Home/Domestic still miss the 2.5s simulated target. Separate live PerformanceObserver capture identifies the homepage H1 as LCP (2.18s mobile / 1.43s desktop in those unthrottled samples), not an image or consent paragraph. Keep monitoring rather than making an unmeasured optimisation. Earlier comparable local before/after runs are in Stage 3/5 reports; do not compare local and production scores as a controlled experiment.

## Review map, limitations and owner actions

| Stage | Files/areas and AI 2 focus | Detailed acceptance / evidence |
|---|---|---|
| 1b | Terms, pricing, FAQ, landlord/service/article copy, llms, simulator/hidden summary removal; current law vs future policy and recommendation inclusion | [Content review](stage-1b-content-review.md), `stage1b/` and original 71-page content review |
| 2 | WebAnalytics, analytics-preference, AnalyticsChoices, privacy page, old banner removal; one manual beacon, real objection behaviour, no customer data | [Privacy/measurement review](stage-2-measurement-privacy.md), `stage2/` and `final/production-ingestion.json` |
| 3 | HomeHero/HomeServices/HomeContent, homepage-content, CompactFooter/MobileQuoteBar; primary form journey, readable compression, link/price context | [Homepage review](stage-3-homepage-review.md), `stage3/`, `final/browser-results.json` and screenshots |
| 4 | layout, assessor-schema, boroughs, eight provider/publisher references; business/person/credential and visible claims | [Entity review](stage-4-entity-review.md), `stage4/`, `final/schema-review.json` |
| 5 | Header/MobileNav, Logo/Button, globals, font configuration; keyboard/reflow, no hidden dropdowns, measured resources | [Accessibility/performance review](stage-5-accessibility-performance.md), `stage5/`, final Lighthouse and LCP traces |
| 6 | About/Domestic metadata, area template, Stratford/Newham, blog headings/TOC, FAQ link; no speculative consolidation | [Local SEO review](stage-6-local-seo-review.md), `stage6/gsc.json`, location inventory and crawl |

No implementation remains unpushed. Independent AI 2 review is still outstanding across this batch; focused self-review and automated/manual checks are recorded, not labelled independent review.

Remaining owner facts: current numerical Google review proof and DBS status; insurance wording/status where needed; real operational capacity, standard/express definitions, exact hours/travel terms; actual bookings by area and qualified/confirmed outcome totals. Existing website copy alone does not verify those facts. No new trust totals or operational promises were invented. Scheme holding/private-advisory questions remain outside this website workstream.

Cloudflare: required manual-site/public binding/host-only injection suppression are already configured and real ingestion verified; no setup action is pending. Monitor aggregate traffic/performance while keeping enquiry email attribution as outcome ground truth. No GA4/custom event platform was installed.

GSC: optionally request indexing of Pre-Assessment through the owner interface and monitor it; it was discovered/not indexed in the current inspection. GBP: verify current business name/category/service area and review evidence in the owner dashboard; no listing was edited. These are not claims that profiles are absent.

At 28/90 days from the 15 September release (13 October / 14 December), compare relevant queries, indexing and qualified/confirmed bookings. Review the other 32 location pages selectively for genuine local usefulness and overgeneralisations; choose KEEP/IMPROVE/MERGE/REMOVE only from evidence. This is the remaining Stage 6 work, not an excuse to delete URLs now.

No platform migration, dependency upgrade, real enquiry, new review markup or fabricated local office was introduced. Runtime/field performance and full assistive-technology conformance need ongoing evidence. The parent AIOS working tree contains unrelated edits and its submodule pointer remains a separate owner-workspace commit; it was not bundled into the website push.

## Post-review desktop pass, 16 September 2026

An independent review of this batch found no blockers and no rollback case, but flagged sparse desktop composition, the Stage 3 removal of site-wide priority-area footer links, the Sellers hero legal wording, the Estate Agents delivery guarantee and the dropped `alternateName`. These are addressed in one commit on top of `f32cf33`, documented with before/after evidence in [desktop-homepage-pass.md](desktop-homepage-pass.md). Mobile and tablet homepage content is pixel-verified unchanged; the footer adds one collapsible group. Deployed exactly as `fe999ce` in Cloudflare deployment `93f24e7d-f7ef-4cac-be68-7890f16ebb10` on 16 September 2026; production checks matched the local evidence.

Measurement note: the restored footer links change internal linking to 12 area pages from this change's deployment date. Treat that date as a Stage 6 baseline break for the 28/90-day review.

Still open from the review, awaiting owner facts: standard and express lodgement timing, reply and appointment hours, travel-charge policy, and current review, DBS and insurance evidence. Operational wording remains inconsistent across pages until those facts are confirmed and centralised.

## Conversion polish batch 2, 16 September 2026

Owner-directed follow-up: desktop quote summary and form polish, verified Google rating (5.0 from 4, public listing), restored Good to know and service-card points, Before your visit moved up, FAQ internal links on all 31 answers, compact desktop footer, and the Services menu showing the EPC Improvement Plan instead of the assessor page. Stage 1 booking and layout tests pass at all eight widths; Contact below `lg` is pixel-identical to production. Evidence and limits: [conversion-polish-batch-2.md](conversion-polish-batch-2.md).

Google Business Profile mismatch found during review (owner dashboard action): the listing shows "Open 24 hours", an owner post promising same-day lodgement, and "Certificates from £49". The website states guide prices from £65 and does not offer same-day lodgement.

