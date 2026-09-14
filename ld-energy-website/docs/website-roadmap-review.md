# Website roadmap: review register

Started 14 September 2026. User authorised focused self-review and shipment of Stage 1b, followed by maximum safe progress through Stages 2–6 with separate commits and stable deployment checkpoints. This supersedes the earlier requirement to await AI 2 before Stage 1b deployment. No platform migration or dependency upgrade is included.

## Stage register

| Stage | Objective and boundary | Acceptance / evidence | State |
|---|---|---|---|
| 1 | Repair enquiry journey | Approved exact commit `14a6813`; production smoke passed | Deployed |
| 1b | Content/recommendations/MEES accuracy | `f6e37a2` + `c51e298`; static/build/rendered and nine-route production smoke passed | Deployed |
| 2 | Cloudflare Web Analytics, truthful privacy/consent | One beacon, verified storage/network behaviour, objection control, no provider migration or custom-event system; enquiry attribution preserved | Final validation; see stage-2-measurement-privacy.md |
| 3 | Concise homepage with early pricing and primary form journey | 320/390/768/1440 screenshots, height/CTA/pricing/trust measurements, interactions, Lighthouse | Pending |
| 4 | Coherent visible business/person/credential schema | Rendered JSON-LD parse and entity/visible-content assertions on key templates | Pending |
| 5 | Accessibility and measured performance improvements | Keyboard, 200% text, reduced motion, contrast, overflow; Lighthouse/network comparisons | Pending |
| 6 | Evidence-led on-site/local SEO | GSC where accessible, route/link/title/canonical checks, useful local distinctions; no mass URL deletion | Pending |

Evidence directory in parent workspace: `audits/website-growth-audit/ld-energy-roadmap-2026-09-14/`.

## Stage 1b self-review

Base candidate: `f6e37a2eb60c7b6e10e5dfd808c51822adc922a6`. The original content review and 39-file inventory are in `stage-1b-content-review.md`.

The follow-up removes one remaining unsupported promise on the estate-agent page that an assessor can usually attend within one to two working days. Availability is instead confirmed before accepting the instruction. FAQ JSON-LD uses the same answer. No service price, calculation, form or API change.

Reviewed: standard recommendations/additional £35 product consistency; current E/penalties versus future 2030 policy; obsolete deadline search; floor-plan scope; simulator/hidden summary removal; methodology/funding and singular-assessor wording. Existing operational hours/service-level and scheme holding questions remain documented rather than invented. Broader trust/privacy and UI issues proceed in their designated stages.

Follow-up verification: typecheck, lint and Next production build passed (79 generated pages). Rendered spot checks passed for estate agents, pricing, Terms and Improvement Plan; FAQ answers match their JSON-LD. Source contract checks scanned 128 runtime files, confirmed the protected booking/API surfaces and price logic unchanged, all 34 borough slugs retained and no obsolete-policy/simulator/2028 matches. Evidence: `stage1b/build-results.json` in the roadmap audit and the existing Stage 1b rendered/source reports.

## Review discipline

Each completed stage records its exact commit(s), parent boundary, changed areas, acceptance results, deployment ID/hash and production smoke. Failed checks remain in the evidence record with classification. A completed stage does not imply completed long-term conversion or ranking measurement. AI 2 should review stage diffs against these acceptance criteria rather than repeat the entire original audit.
