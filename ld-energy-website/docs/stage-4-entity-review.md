# Stage 4: business and assessor identity

Parent: homepage `566d3cd`. Changes are structured-data relationships and the corresponding shared references, not an SEO URL migration.

- Retain `/#business` as the single LocalBusiness/Organization identity. LocalBusiness already inherits Organization in Schema.org. All eight publisher/provider references formerly using `/#organization` now use the business ID. Remove the duplicate organization node and its unsupported disambiguation/founding claims.
- Represent Abdul once through shared `assessorSchema`, retaining `/about#assessor`. His credential carries EES/036265, Elmhurst as the recognising organisation and the existing official GOV.UK verification URL. The verification page is associated with the Person through `subjectOf`.
- Remove Elmhurst and the assessor lookup from business `sameAs`. Remove the Google share/search shortcut from structured identity/map relationships until an unambiguous canonical business-profile URL is verified; the usable customer review link remains visible.
- Remove business-level assessor credentials and an implied employee relationship; retain the real named founder relationship.
- Remove Cash from paymentAccepted to match the existing visible Terms' card/bank-transfer methods. No payment functionality changes. Omit unconfirmed exact opening hours from schema rather than amplifying an unverified operational claim.
- Replace direct addressCountry on the shared London City with Country containment. PostalAddress country fields remain. All area services still have one real Stratford business provider, without branches or invented local offices.
- Qualify the schema express offer as subject to confirmed availability. Preserve the £35 additional plan and guide-price representation; no AggregateRating.

## Evidence

Typecheck, lint and Next production build passed (79 generated pages). `stage4/schema-review.json` in the parent roadmap audit checks 12 rendered routes: home, About, Contact, pricing, three services, landlords, three area pages and an article. JSON-LD parses; one business definition, correct Person credential/verification, no old organization reference, no invalid City country, no AggregateRating, correct service provider and £35 offer. Visible FAQ answers match their JSON-LD where emitted.

Sources: [Schema.org LocalBusiness inheritance](https://schema.org/LocalBusiness), [hasCredential](https://schema.org/hasCredential), [containedInPlace](https://schema.org/containedInPlace). The GOV.UK lookup was verified in the original audit; this session's web-tool fetch failed, so it is not represented as a newly reverified accreditation-status check.

This is rendered structural/semantic checking, not a claim of Google rich-result eligibility or a completed external validator audit. Current public review totals and operational hours/capacity remain unconfirmed. Revert this stage's commit as one rollback boundary. Production rollout is recorded in the roadmap register.
