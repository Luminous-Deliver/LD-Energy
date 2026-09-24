# Quote form polish: layout, success, failures and confirmation email

24 September 2026. Parent: `0db86a9`. Owner-directed after production feedback: the form looked
oversized and unorganised, a homeowner could be selected on a portfolio enquiry, the success
message was thin, a failed send said "try again" when retrying could not help, and the
confirmation email needed a review. The pre-Stage 1 form (deployment `40877dd3`, source
`fca8b32^`) was the visual reference for density and badge colours only.

## Owner decisions

- Design A to D approved as proposed in chat.
- Reply time: keep "during opening hours (Mon–Sun, 8am–8pm)". No reply-time promise.
- The confirmation subject stays exactly as it was: `scripts/resend-send.py`,
  `scripts/booking-followup.py` and the `/quote-reply` skill in the parent repo match on it.

## Changes

- **Form layout.** One compact step row with a progress bar replaces the three-label bar,
  "Step n of 3" line and large step heading. Questions are serif legends; "Choose one option."
  hints are gone. Option cards keep native radios (the input covers its card invisibly), drop the
  drawn dot, show a tick when selected, and use 15px labels with 14px descriptions. Floor area is
  a 2-column grid on phones and 3 columns from 640px, with the short bedroom caption at every
  width. Badges show at every width: "Better value" green, "Private" and "Agencies" navy.
- **Customer type.** One-line descriptions restored. A portfolio enquiry offers Landlord, Estate
  agent and Letting agent only; switching to it clears a Homeowner selection, and a bulk link
  never restores Homeowner from history. Visible copy keeps "Which best describes you?" (the
  Stage 1 review removed "booking" wording).
- **Success.** "Request sent. Thanks, {first name}." Shows "We've emailed a copy to…" only when
  the API reports the confirmation email was accepted. What happens next (shared with the email),
  a summary, a Before your visit link for EPC, bundle and Pre-Assessment, a tenant reminder for
  landlords, call and WhatsApp.
- **Failures.** A refused security check resets the widget and says so without also flagging an
  empty-token field error. Offline says offline. Anything else says "We couldn't send this
  online", keeps the details, and offers WhatsApp and email pre-filled with the request, plus
  call. "Try again" is offered only for 500/502/504.
- **API.** Accepts the production alias origin `https://epc-euc.pages.dev` (a browser submission
  from it returned 403 "Forbidden" on 24/09). The security refusal carries `code: 'security'`
  beside the unchanged sentence the daily health check greps. Success returns
  `confirmationSent`. Bulk notification subjects no longer end in an empty "()".
- **Customer email.** Service labels as shown on the site, floor area and property as separate
  rows, lodgement wording per speed, booking-as, notes, dd/MM/yyyy dates, What happens next,
  Before your visit (three points condensed from `/preparing-for-your-epc`, link to the full
  checklist), tenant note, no emoji or em dashes in the body, sans-serif body font, labels that
  wrap on phones.
- **Internal email.** Every existing row and label kept (the `/quote-reply` skill reads them),
  plus WhatsApp, call and email buttons for the customer and a WhatsApp link in the text part.
- Visit length is not promised anywhere: `site.ts` durations run to 2 hours and are not
  published, so "45–60 minutes" was dropped from the draft.

## Verification

Evidence: `audits/website-growth-audit/ld-energy-form-polish-2026-09-24/` (screenshots of
every state, rendered emails at 640 and 375px, measurements). Tests ran against `next start` of
the production build with the Turnstile test site key; all transport mocked.

- Typecheck, lint (existing OG-image warning only), Next production build (79 pages).
- `node --require ./tests/register.cjs --test tests/*.test.cjs`: 14/14, including new checks for
  customer types, next steps, dates, the fallback summary, `confirmationSent`, origins, the
  security code, both subjects, the prep checklist per service and the tenant note.
- Browser suites pass: `browser-booking` (8 widths, now also the WhatsApp/email rescue and the
  emailed-copy line), `booking-specialists` (now asserts no Homeowner on bulk), `review-fixes`,
  `review-layout`, `booking-navigation`, `area-cta-survey` (34 area pages).
- Stale steps repaired, unrelated to this change: the cookie-banner Decline click (banner removed
  in `036b67e`), the homepage floor-area picker (moved to service pages in `566d3cd`), the
  desktop footer `/pricing` link (removed in `86869dd`).
- Still failing, pre-existing and unrelated: `rendered-booking` compares JSON-LD with the
  10/09 crawl, which Stage 4 schema work has since changed; `final-corrections` enters a
  quote form from the homepage, which has had no form since `566d3cd`.

Form height with EPC, 38–52 m² and Homeowner selected (step 1), production vs this change:

| Width | Before | After | Bulk before | Bulk after |
|---|---:|---:|---:|---:|
| 390 | 2,269 | 1,826 | 1,389 | 1,236 |
| 768 | 1,519 | 1,219 | 1,017 | 884 |
| 1024 | 1,523 | 1,227 | 1,107 | 892 |
| 1440 | 1,463 | 1,208 | 1,087 | 892 |

The chat estimate of about 950px desktop and 1,400px phone was not reached. The remaining height
is the 14px descriptions, 48px targets and the full Improvement Plan wording, all kept.

Rollback: revert this commit.
