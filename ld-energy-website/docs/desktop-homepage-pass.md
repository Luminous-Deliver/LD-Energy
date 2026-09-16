# Desktop homepage pass and review fixes

16 September 2026. Parent: `f32cf33` (application `15ff45b`). Follows the independent review of the Stage 1b–6 batch. Scope: desktop (1024px and wider) homepage composition, the footer area-link regression and three small review fixes. The deployment `73c85033` was used as a visual reference only; none of its superseded claims were restored.

## Boundary

- Below 1024px the homepage renders the existing compact layout. Desktop treatment uses `lg:` classes and elements that are `display: none` below `lg`, so mobile DOM order, heading structure and the mobile quote bar trigger (`#home-quote`) are unchanged.
- No form, API, pricing data, estimate logic, analytics/privacy, entity model (beyond `alternateName`), dependency or Stage 1 history change.

## Desktop changes

- **Hero:** two columns. Left: proposition, then the guide price, exact-quote action and "see guide prices" in one panel. Right: assessor card with name, EES/036265, Elmhurst scheme, GOV.UK verification, reviews and About links. A thin A–G EPC colour scale marks the card; it is decorative and implies no rating.
- **Fact strip** straddling the hero edge: lodged on GOV.UK, valid for 10 years, priced by floor area (six bands), based in Stratford E15. Product facts only; no turnaround, hours, rating, DBS or travel-charge claims.
- **Pricing:** the floor-area `<select>` is replaced at `lg` by a measured scale of the six m² bands plus "Not sure of floor area". Both controls share one `area` state and the existing `guideEstimate`; no pricing logic was duplicated. Service cards gain icons and larger guide prices.
- **Home content:** the mobile assessor section is hidden at `lg` because the hero card carries it. How it works gains a connected step sequence; audiences become icon cards; the preparation checklist, area chips and guide links become compact cards. The FAQ column gains a small call/WhatsApp prompt using existing contact channels.

## Review fixes

- Footer: "Popular areas" from `priorityBoroughs` (12 area pages). Desktop column; collapsible `<details>` below `lg`. This restores the site-wide links the pre-Stage 3 footer had and is a change to the Stage 6 measurement baseline from this deployment.
- Sellers hero: "Generally, an EPC must be commissioned before your home is marketed for sale; exemptions apply", matching the page FAQ.
- Estate Agents: removed "Your listing goes live on time, every time." and "Same-day confirmations during opening hours".
- Schema: `alternateName: ['LD Energy', 'L and D Energy']` on `/#business`.
- Formatting only: `CompactFooter`, `HomeContent`, `MobileQuoteBar`, `heading-links` test, and `<Link prefetch={false}` blank-line artefacts in `Header`/`MobileNav`.

## Verification

Parent evidence: `audits/website-growth-audit/desktop-pass-2026-09-16/`. Before = local production build of `f32cf33`; after = local production build of this commit; same harness, port and browser (Playwright, Edge).

| Width | Before height | After height | `<main>` bottom before → after | Control |
|---:|---:|---:|---:|---|
| 320 | 6,721 | 6,783 | 6,075 → 6,075 | select |
| 390 | 6,251 | 6,313 | 5,665 → 5,665 | select |
| 768 | 5,426 | 5,488 | 4,846 → 4,846 | select |
| 1024 | 4,713 | 5,212 | 3,966 → 4,465 | scale |
| 1440 | 4,603 | 5,137 | 3,810 → 4,344 | scale |

- Below `lg` the +62px is the added "Popular areas" footer disclosure only; `<main>` is unchanged. Controlled viewport screenshots (hero, and pricing after selection) at 320/390/768 are pixel-identical before and after. Full-page captures differ only by the fixed mobile quote bar's capture timing (390) and sub-perceptual rendering noise with a maximum channel delta of 1 (768).
- Desktop 1440 remains 60% shorter than deployment `73c85033` (12,940px).
- Area and Contact pages: +62px below `lg` (the footer group, below the form) and unchanged at 1440; three `#contact` actions and one form retained.
- Interaction checks at 320/390/768/1024/1440: five closed FAQs, no homepage form, no horizontal overflow, guide/estimate/unknown states, bundle and area passed to the form, mobile quote bar visibility and menu suppression, desktop scale selection by pointer and keyboard reaching the form with service and area preselected, Stratford/Newham/Croydon three `#contact` actions and one form, no page errors.
- Schema: the Stage 4 twelve-template check re-run with an added `alternateName` assertion; visible FAQ parity passes.
- Typecheck, lint (existing OG-image warning only), Next production build (79 pages) and 11/11 unit/contract tests pass.

Deployment: exact commit `fe999ce` shipped as Cloudflare Pages deployment `93f24e7d-f7ef-4cac-be68-7890f16ebb10` on 16 September 2026 (Linux build, packaging and deploy stages succeeded). The same harness against production matched the local after-build heights at all five widths and passed every interaction and area-page check with no page errors. Prerendered pages cached at the edge before the release (`s-maxage=3600`) refresh on expiry; a cache-busted `/estate-agents` served the new content while the bare URL was still a pre-release HIT. No cache purge was run.

Rollback: revert this commit.
