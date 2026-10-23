import { BookingCard } from '@/components/forms/BookingCard'
import { Container } from '@/components/ui/Container'
import { site } from '@/lib/site'
import type { SourcePage } from '@/lib/enquiry-attribution'
import '@/app/inner.css'
import '@/app/booking-v7.css'

/**
 * Embedded booking section on area pages: a short head, then the same booking form as the homepage in its v7 look
 * (Abdul 23/10: the old white card here was "massive and ugly"). The form, its fields and attribution are unchanged;
 * .bk7 only takes the homepage's restyle (app/booking-v7.css).
 */
export function ContactSection({ areaPage, sourcePage }: { areaPage?: string; sourcePage?: SourcePage }) {
  return (
    <section id="contact" className="in in-sec in-contact" aria-labelledby="contact-title">
      <Container>
        <div className="in-contact__head">
          <div className="in-contact__title">
            <p className="in-eyebrow">Request a quote</p>
            <h2 className="in-h2" id="contact-title">Get my exact quote</h2>
          </div>
          <div className="in-contact__side">
            <p>Tell us about the property and we confirm the exact price and a visit time before you book. Replies come from the assessor directly.</p>
            <a className="in-contact__acc" href={site.assessor.verifyUrl} target="_blank" rel="noopener noreferrer">
              {site.assessor.name}, Elmhurst and Quidos accredited. <u>Check the GOV.UK register</u>
            </a>
          </div>
        </div>
        <div className="bk7">
          <BookingCard variant="area" areaPage={areaPage} sourcePage={sourcePage} />
        </div>
      </Container>
    </section>
  )
}
