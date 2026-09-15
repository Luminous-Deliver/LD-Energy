# Stage 2: measurement and privacy

Parent: Stage 1b `c51e298337b588769289ed465c16b5b8d7630365`, deployed as Cloudflare deployment `9be02b99-b1b6-4e99-8998-464b86ba102b`. Nine cache-busted production routes passed. Stage 1b's original 71-page review and focused follow-up remain its evidence boundary.

## Observed baseline, 14 September 2026

- Production had no `NEXT_PUBLIC_CF_BEACON_TOKEN` binding and no Pages analytics tag. The old banner wrote `cookie-consent` but controlled no loader.
- The parent domain already had a Cloudflare Web Analytics site, automatic injection and a wildcard include rule, with `lite: true`. A fresh UK browser received no analytics script or RUM request. It received a `cf_clearance` security cookie, separately from analytics.
- Therefore neither “analytics is absent everywhere” nor “the banner grants working consent” described production accurately.
- Comparable local production-build homepage baseline: desktop Performance 66, mobile 78; Accessibility 99, Best Practices 100, SEO 92. Height was 20,876px at 390px. These are laboratory observations, not field performance.

## Implementation

Use a dedicated manual Cloudflare Web Analytics site for the exact EPC hostname; retain the existing parent-domain site for other hosts. A zone Configuration Rule with expression `http.host eq "epc.luminousanddeliver.co.uk"` and `disable_rum: true` disables automatic injection only for this website. The initial attempt to add an ordinary Web Analytics exclusion returned 409 `maxRulesError` and made no change. The documented Configuration Rule succeeded; no other hostname, zone setting or existing rule was changed. The Pages production binding adds only the public beacon token and preserves the existing bindings.

`WebAnalytics` loads the vendor's module once, after reading the browser preference. Rejections, the old banner's declined state, supported DNT/GPC signals and unavailable storage keep it off. No new tracking identifiers or custom-event layer. Existing email attribution and booking contracts remain unchanged.

Remove the misleading fixed cookie banner. The footer offers “Privacy & analytics choices”. The privacy page never loads analytics; full navigation to it ends the earlier document before a choice is made. The guard also reloads that page if reached through a client navigation with an already-running beacon. Switching a preference applies when opening another page. Removing a script element alone would not stop vendor listeners, so the control does not make that false promise.

The single persistent preference `ld-energy-analytics` stores `on`/`off`, no identity. An explicit new choice can supersede an old rejection; browser privacy signals still take precedence. No analytics runs when storage is unavailable. Booking/security do not depend on analytics.

Privacy copy distinguishes requested pre-contract/contract processing, legitimate interests, legal duties and any separately optional consent. It identifies actual hosting/email/security providers and transfer safeguards. It removes the inaccurate universal seven-year assessment-retention claim: the documented Elmhurst member evidence requirement is at least 15 years. It distinguishes certificate validity from register retention and states realistic purpose-based correspondence retention, without promising automated deletion from the inbox.

## Measurement boundary

Cloudflare supplies aggregate traffic and performance statistics, not a custom enquiry funnel. Successful enquiry, qualified enquiry and confirmed booking remain operational outcomes from enquiry email/business records. Do not label page views or Call/WhatsApp clicks as bookings. No joins between Cloudflare page identifiers and customer records. Begin the 28/90-day comparison at the recorded production deployment; the earlier UK sample had no observed beacon.

## Evidence and review

Parent audit folder: `audits/website-growth-audit/ld-energy-roadmap-2026-09-14/`.

- `analytics-production-before.json`, `cloudflare-before.json`: observed script/storage and dashboard baseline.
- `stage2/cloudflare-config.json`: verified host-only configuration and public environment binding.
- `stage2/browser-results.json`: actual vendor script loaded once; off/legacy rejection/storage failure/GPC suppress it; privacy off/on works; 320/390/768/1440 screenshots; form/service/unknown-area controls remain functional.
- Vendor measurements are intercepted locally, not submitted to a production enquiry endpoint. Payload assertions verify no query marker, form fields or enquiry data. Performance element selectors such as `#areaBand-6` are static control IDs, not field values.
- Ten unit/contract tests passed, including existing booking/security/pricing/history tests with email delivery mocked. Initial browser harness failures were an incorrect service selector and storage setup on opaque `about:blank`; corrected. An overly broad payload assertion initially treated a static element ID as enquiry data; corrected to inspect payload keys and the private test marker.
- Typecheck/lint/production build and final rendered review recorded in the stage evidence. Existing raw OG-image warning is unchanged.

## Primary sources

- [Cloudflare RUM privacy and fields](https://developers.cloudflare.com/speed/observatory/rum-beacon/)
- [Cloudflare Web Analytics rules](https://developers.cloudflare.com/web-analytics/configuration-options/rules/)
- [Configuration Rules disable_rum](https://developers.cloudflare.com/rules/configuration-rules/settings/)
- [Cloudflare analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/)
- [Cloudflare security cookies](https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/)
- [ICO statistical-purpose exception and objection requirement](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/)
- Scheme evidence: parent workspace `references/epc-audit-and-scheme-rules.md` and `references/epc-evidence-requirements.md`; private scheme source documents are not published.

## Rollback and limitations

Revert this stage commit to restore the previous code, then remove the public beacon token before rebuilding if restoring the old unconditional loader. Keep host-only automatic-injection suppression until the privacy behaviour of the replacement is confirmed. The created configuration rule ID is recorded in the audit; delete only that rule if explicitly restoring the former zone behaviour. No platform/dependency change.

Production on 15 September: deployment `38d8d78e-ddc2-4505-b2ea-0552adb4b6c7` builds exact commit `036b67e5e733ff721ed5097794d4e479b2f99388`. Real vendor measurements returned 204, with one script and no console errors. The browser recorded only the separate security cookie `cf_clearance`, no analytics cookies and no storage identifiers. Privacy objection and booking controls passed. A non-UK browser location has not been independently exercised; the host-only injection rule is region-independent. Aggregate outcome reporting and correspondence-retention reviews still require normal business operations; this stage does not create a CRM or automated inbox purge. Ad blockers and objections mean analytics counts are incomplete.

## Deployment correction and live evidence

The initial zone token returned 404/CORS errors at the manual ingestion endpoint. Created manual site 083d2aef21de418eaee56a5b990b1aa4 with auto-install disabled, updated the existing public Pages binding, and rebuilt the same application commit. A stale bare /pricing response still supplied the earlier token. Purging the 75 precise sitemap/llms URLs on the EPC hostname removed the stale responses; no other website cache was purged. The final real ingestion check passed (three observed 204 responses, zero console errors). One visibility/navigation request was reported aborted by browser instrumentation; CDP separately observed 204 delivery for a navigation beacon. This was a configuration/cache correction, with no application or dependency change.

Evidence: stage2/manual-site.json, cache-purge.json, rum-network.json and production-ingestion.json. The earlier failed diagnostics remain recorded. Cloudflare package builds passed; deployment IDs and exact commit are recorded above. No enquiry was submitted.

