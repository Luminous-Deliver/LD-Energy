# Stage 6: on-site SEO and local quality

15 September 2026. Parent boundary: Stage 5 `453174d`. Scope: safe on-site corrections and an evidence-based local review baseline. No URL consolidation, redirect changes, /areas restructuring, crawler-policy changes or dependency work.

## Changes and acceptance

- Keep all 74 sitemap URLs, including all 34 location pages. Every page returns 200, has one H1, a unique title, a clean canonical and an internal discovery route in the final local crawl. No broken internal fragment remains.
- Fix the FAQ preparation evidence fragment. Article headings containing links/emphasis now use their visible text for anchors; the contents list uses the same slug rules. A regression test reproduces the previously broken Tower Hamlets/Newham heading.
- Give About a named-assessor title and the Domestic EPC detail page a service-focused title without an unverified next-day title promise. Keep homepage, pricing and borough title strategies; this is intent clarity, not a claim that cannibalisation has been proven or resolved.
- Make the shared local introduction explicit about the single Stratford E15 base. Preserve hero, pricing and bottom #contact actions and the embedded shared form. Improve only Stratford/Newham's local paragraphs, replacing deterministic rating/compliance or short-notice claims with relevant evidence/access information. Link the Newham borough page to its Stratford neighbourhood page.
- Reuse one geographic service-area value across business and service schema. Stratford is a Place within Newham; City of London is a City; boroughs are AdministrativeAreas. No fictional branches or offices.
- Remove an article CTA's unsupported 60-second promise and use controlled enquiry attribution. Correct an About travel claim to require any additional charge to be agreed with the quote. No new turnaround or savings promise.
- Related factual correction: major renovations do not universally trigger a legal EPC requirement. The Domestic EPC card now explains common reasons to arrange an EPC, distinguishing required sale/letting cases (subject to exemptions) from voluntary reassessment after improvements. [GOV.UK dwelling guidance](https://www.gov.uk/government/publications/energy-performance-certificates-for-the-construction-sale-and-let-of-dwellings/a-guide-to-energy-performance-certificates-for-the-marketing-sale-and-let-of-dwellings).

## Current search evidence

Read-only Search Console API, captured 15 September. Current window 16 August–12 September: 30 clicks / 6,629 impressions. Previous 28 days: 27 / 8,640. Homepage 9 / 506; Croydon 2 / 283; Haringey 2 / 100; Newham 1 / 175; Stratford 0 / 71; Wandsworth 0 / 472. These are search observations, not qualified enquiries or bookings.

Eight URL inspections: homepage, Stratford, Newham, Croydon, Haringey, Wandsworth and Improvement Plan indexed; Pre-Assessment discovered but currently not indexed. The earlier audit's statement that Improvement Plan was unknown is now outdated. No indexing guarantee or unsupported title experiment follows from this small sample. Google can choose a different title; shared templates alone do not establish a doorway violation. [Title guidance](https://developers.google.com/search/docs/appearance/title-link), [spam policies](https://developers.google.com/search/docs/essentials/spam-policies).

## Evidence

Parent audit: `audits/website-growth-audit/ld-energy-roadmap-2026-09-14/stage6/`.

- `gsc.json`: both search windows, page/query evidence and eight inspections.
- `location-inventory.json`: all 34 authoritative slugs, geography kind, local word count, current search measurements, sampled index status and later review requirement.
- `crawl.json`: 74 rendered HTML responses, headings, titles, canonicals, links, schema and zero crawl failures.
- `schema-review.json`: 12 key templates, one business/person credential model, geographic semantics, £35 offer and visible FAQ parity.
- `rendered-spots.json` and screenshots: About, Domestic EPC, Newham, Stratford, assessment article and FAQ at 390px, no horizontal overflow.
- Typecheck, lint and Next production build pass (79 generated pages). All 11 unit/contract tests pass, including pricing, unknown area, customer history, server validation/security, controlled attribution and the new article-heading case. No enquiry sent.
- During development the new test initially loaded a JSX module unsupported by the test loader. Pure heading helpers were separated into a .ts module; typecheck then caught a leftover duplicate import, which was removed. Final gates pass; no loader/dependency change.

## Remaining local-quality and operational work

This completes the safe on-site batch, not the long-term local-quality workstream. The other 32 location pages still require selective owner/expert review of their factual usefulness and generalisations. Their template similarity and existing local paragraphs have been inventoried, not certified as original assessment experience. Do not invent case studies to fill that gap.

Review at 28 and 90 days after deployment: relevant queries, index state, page overlap, qualified enquiries and completed bookings by area, useful unique evidence, internal links, geographic credibility and doorway risk. Each location can then receive KEEP / IMPROVE / MERGE / REMOVE. No permanent keep-all decision. Current priority remains Stratford/Newham, with Croydon/Haringey/Wandsworth considered against real business outcomes.

Abdul's operational records are needed for actual booking areas and qualification/confirmation totals. Current capacity, precise hours/travel terms and current trust-proof status remain owner confirmations; existing website statements are not independent proof. No new numerical Google review, DBS or insurance claim has been introduced. Broader existing operational wording must be aligned once those facts are confirmed.

Manual follow-up: optionally request Pre-Assessment indexing through Search Console after the new links are live; monitor its inspection status. Verify GBP's real business name/category/service area and current review evidence in the owner dashboard. No GBP, Bing or Apple listing was edited in this stage. No IndexNow or additional analytics product was installed.

AI 2 review focus: heading/TOC anchor agreement, protected area form actions and slugs, local geographic semantics, factual scope of the edited copy, and whether title changes are appropriately modest for the available data. Revert this commit independently if needed. Deployment evidence belongs in the roadmap register.
