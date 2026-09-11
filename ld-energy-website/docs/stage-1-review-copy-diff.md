# Stage 1 review fix: copy diff before commit

Compared with `fca8b32`. Prepared before committing the review corrections.
Only the enquiry wording, approved form explanation and identified response-time
promises are changed. Existing operational turnaround/hours copy and the wider
Improvement Plan content remain outside this pass.

## Mechanical / already approved

| Surface | Before | After |
|---|---|---|
| Domestic EPC hero and bottom CTA | Book Your EPC | Get my exact quote |
| Pre-Assessment hero, inline and bottom CTAs | Book a pre-assessment | Get my exact quote |
| Improvement Plan hero | Add it to your booking | Get my exact quote |
| Improvement Plan inline CTA | Book an EPC with the plan | Get my exact quote |
| Improvement Plan bottom CTA | Book Your EPC | Get my exact quote |
| Floor Plan hero and bottom CTAs | Get Your Floor Plan | Get my exact quote |
| Blog article CTA banner | Book Online | Get my exact quote |
| Mobile action bar | Book; accessible name: Book your EPC | Quote; accessible name: Get my exact quote |
| Embedded form eyebrow | Book Now | Request a quote |
| Embedded form heading | Book Your EPC Today | Get my exact quote |
| Area-page bottom heading | Book Your {area name} EPC | Get an EPC quote in {area name} |
| Domestic EPC process heading | Book your appointment | Request your quote |
| Domestic EPC bottom heading | Ready to Book Your EPC? | Ready for your EPC quote? |
| Floor Plan process heading | Book | Request a quote |
| Floor Plan bottom heading | Ready to Order Your Floor Plan? | Ready for your floor plan quote? |
| Floor Plan bottom body | Book online or call us. We'll arrange a visit at a time that suits you. | Request your exact quote online or call us. We'll arrange a visit at a time that suits you. |
| Improvement Plan inline explanation | Tick the box on the booking form | Tick the box on the enquiry form |
| Improvement Plan supporting CTA | Ask us when you book | Ask us in your enquiry |
| Improvement Plan bottom heading | Book an EPC with the Improvement Plan | Get a quote for an EPC with the Improvement Plan |
| Blog index inline link | book an assessment | request an assessment quote |
| About bottom body | Book your EPC online, or get in touch with any question. We reply during our opening hours, Mon–Sun 8am–8pm. | Request your EPC quote online, or get in touch with any question. We reply during our opening hours, Mon–Sun 8am–8pm. |
| FAQ bottom heading | Ready to Book? | Ready for your exact quote? |
| Landlords bottom body | Book your EPC today and stay ahead of MEES. Portfolio enquiries welcome. | Request your EPC quote and stay ahead of MEES. Portfolio enquiries welcome. |
| Assessor page bottom heading | Book Your London Domestic Energy Assessor | Get a quote from your London Domestic Energy Assessor |
| Form customer-type legend | Who are you booking as? | Which best describes you? |
| Form area hint | Floor area in m² is the main pricing factor. Bedroom counts are only a rough reference. | Choose your internal floor area for a guide estimate. Floor area in m² is the main pricing factor. Bedroom counts are only a rough reference. |
| Form before area selection | Choose your floor area below for a guide estimate, or select “Not sure of floor area”. | Removed from the initial summary box; the area hint above sits beside the choices. Known/unknown-area summaries retain their existing wording after selection. |
| API unavailable response, two branches | Booking requests are temporarily unavailable. Please call or WhatsApp us instead. | Quote requests are temporarily unavailable. Please call or WhatsApp us instead. |
| API delivery failure response | We could not send your booking right now. Please call us on 07492 575 396. | We could not send your quote request right now. Please call us on 07492 575 396. |
| API invalid geographic context | No dedicated response | Invalid area page |

Removing shared label overrides requires explicit caller labels. These caller-source
values are now `Get my exact quote`: `Book Your EPC`, `Book Now`, `Book an Assessment`,
`Book Your Landlord EPC`, `Book Your Seller EPC`, `Book Your {area name} EPC`, `Get in Touch`
and `Contact Us`. On those generic `/contact` or `#contact` calls, `fca8b32` already
rendered `Get my exact quote` through its override: this preserves the visible label
while moving ownership to the caller. Agency partnership labels remain unchanged.

## Needs approval

None. No additional marketing claim, product, guarantee, response-time promise or
operational fact has been introduced. The changes above implement the review brief's
requested enquiry terminology and form guidance.

## Factual / compliance correction

The recommendations model below is the owner's explicit corrected product policy.
This patch does not undertake a broader compliance review.

| Surface | Before | After |
|---|---|---|
| Form add-on label | Add the Improvement Plan (+£35) | Add the EPC Improvement Plan (+£35) |
| Form add-on explanation | Recommendations remain on your EPC. Also receive an Energy Report with modelled energy costs and a written plan prioritising improvements for your property, prepared after the visit. | Your full Energy Report plus Abdul's personalised plan explaining what's holding the rating back and which improvements to consider first. Your standard EPC recommendations are included either way. |
| Blog index and category bottom headings | Need an EPC? Book in 60 seconds. | Need an EPC? Get your exact quote. |
| Areas directory bottom body | Contact us directly and we'll confirm coverage for your postcode, usually within the hour. | Send your postcode and we'll confirm coverage. |
| Estate-agents bottom body | Call, WhatsApp, or email with your typical volume and we'll come back with an agency rate card the same day. | Send an enquiry with your typical volume and we'll confirm an agency quote. |
| Customer email preview | We've received your EPC request — we'll confirm your slot and exact price shortly. | We've received your EPC quote request. |

No £9 internal cost, fixed rating gain, target band or guaranteed saving is added.
The email body still explains that a visit requires agreement of price and appointment.

## Internal operational labels only

Internal notification changes `Booking as` to `Customer type`, and adds optional
`Source page`, `CTA` and `Area page` rows. The geographic display name comes from
`boroughMeta`; all rows use the existing HTML-escaping function. None of these
attribution rows appears in the customer acknowledgement.
