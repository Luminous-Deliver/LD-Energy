import { Container } from '@/components/ui/Container'
import { Ico } from '@/components/sections/home/HomeIcon'
import { pricing, priceFrom, site } from '@/lib/site'
import { whatsappQuoteHref } from '@/lib/area-page'
import { quoteHref } from '@/lib/quote-context'
import type { AreaChoice } from '@/lib/floor-area'
import type { SourcePage } from '@/lib/enquiry-attribution'
import '@/app/inner.css'

/**
 * The image behind ending A: an AI illustration of a London terrace at night along the bottom of the frame, empty sky
 * above for the headline (23/10/2026; the rooftop photo was rejected). Set to null to fall back to the plain night ground.
 */
const END_BAND_IMAGE: string | null = '/inner/end-band'

/**
 * Endings from the inner-page options board (Abdul 23/10/2026): A, the night band with the quote and WhatsApp
 * (area pages, guides, hubs); B, the price list where every row opens the quote with that size filled in (the
 * borough ratings page). Replaces the blue "Need an EPC? Get your exact quote." band.
 */
export function InnerEnding({
  variant, heading, text, eyebrow, quote, source,
}: {
  variant: 'a' | 'b'
  heading?: string
  text?: string
  /** Optional small line above the heading (A only). */
  eyebrow?: string
  /** Where the quote button goes; defaults to the quote page. Area pages pass '#contact' (their form). */
  quote?: string
  /** Attribution for the quote links. */
  source?: SourcePage
}) {
  const quoteLink = quote ?? quoteHref({ service: 'epc', sourcePage: source, ctaId: 'bottom' })
  if (variant === 'b') {
    return (
      <section className="in in-end-b" aria-labelledby="in-end-h">
        <Container className="in-end-b__in">
          <div className="in-end-b__h">
            <p className="in-eyebrow">Domestic EPC, anywhere in London</p>
            <h2 id="in-end-h">{heading ?? 'Pick your size to start your quote'}</h2>
            <div className="in-end-b__p">
              <p>{text ?? 'Every row opens the quote with that size filled in. One price list for all of London, with no travel charge.'}</p>
              <p className="in-by">
                <Ico name="check" size={18} />
                <span><b>{site.assessor.name}</b>, Elmhurst and Quidos accredited assessor.{' '}
                  <a href={site.assessor.verifyUrl} rel="noopener">Check the GOV.UK register</a></span>
              </p>
            </div>
          </div>
          <div className="in-end-b__c">
            <ul className="in-plist">
              {pricing.map((b) => (
                <li key={b.id}>
                  <a className="in-prow" href={quoteHref({ service: 'epc', area: b.id as AreaChoice, sourcePage: source, ctaId: 'bottom' })}>
                    <span className="in-prow__s"><b>{b.areaLabel}</b><span>{b.typicalLabel}</span></span>
                    <span className="in-prow__p num">{b.startingPrice && <small>from</small>}£{b.epc}</span>
                    <Ico name="arrow-right" size={18} />
                  </a>
                </li>
              ))}
              <li>
                <a className="in-prow" href={quoteHref({ service: 'epc', area: 'unknown', sourcePage: source, ctaId: 'bottom' })}>
                  <span className="in-prow__s"><b>Not sure of the size</b><span>We confirm it from your property details</span></span>
                  <span className="in-prow__p in-prow__p--tbc">Confirmed before booking</span>
                  <Ico name="arrow-right" size={18} />
                </a>
              </li>
            </ul>
            <a className="ld-btn ld-btn--primary ld-btn--block" href={quoteLink}>Get my exact quote</a>
            <p className="in-pnote">
              Guide prices. Floor plan from £{priceFrom.floorPlan}, EPC and floor plan together from £{priceFrom.bundle}. Your exact
              price is confirmed before booking, and you pay once the assessment is done.
            </p>
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section className="in in-end-a" aria-labelledby="in-end-h">
      <Container className="in-end-a__in">
        <p className="in-eyebrow">{eyebrow ?? <>London EPCs · from <span className="num">£{priceFrom.epc}</span></>}</p>
        <h2 id="in-end-h">{heading ?? 'Book your EPC'}</h2>
        <p className="in-end-a__p">{text ?? 'Send the address and the size. We confirm your exact price and a visit time before you book.'}</p>
        <div className="in-end-a__acts">
          <a className="ld-btn ld-btn--light" href={quoteLink} data-enquiry-cta="bottom">Get my exact quote</a>
          <a className="in-end-a__wa" href={whatsappQuoteHref()} target="_blank" rel="noopener noreferrer">
            <Ico name="message" size={18} /> Or WhatsApp a quote request
          </a>
        </div>
        <p className="in-end-a__tel">Prefer to call? <a className="num" href={site.phoneHref}>{site.phone}</a>, {site.hours.replace('Monday–Sunday, ', '').replace('–', ' to ')}, every day</p>
      </Container>
      {END_BAND_IMAGE && (
        <>
          {/* in the flow, pulled up under the copy by less than its empty sky, so copy never meets the houses */}
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative; next/image is unoptimised on Pages */}
          <img className="in-end-a__img" src={`${END_BAND_IMAGE}-1600.webp`} srcSet={`${END_BAND_IMAGE}-900.webp 900w, ${END_BAND_IMAGE}-1600.webp 1600w`}
            sizes="100vw" alt="" width={1600} height={900} loading="lazy" decoding="async" />
        </>
      )}
    </section>
  )
}
