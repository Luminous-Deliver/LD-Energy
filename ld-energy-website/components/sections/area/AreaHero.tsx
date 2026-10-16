import { Container } from '@/components/ui/Container'
import { BookingCard } from '@/components/forms/BookingCard'
import { pricing, priceFrom, EXPRESS_SURCHARGE } from '@/lib/site'

/**
 * Rebuilt area hero: the price answer in the first line, the standing facts, then the one
 * booking form on the page. The card is full width under the text because the form's layout
 * follows the viewport, not its column.
 */
export function AreaHero({ slug, name, place }: { slug: string; name: string; place: string }) {
  const typical = pricing[2]
  const facts = [
    'Based in Stratford E15',
    'No travel charges',
    'Next-day appointments available',
    `Lodged within 72 hours, or next day for £${EXPRESS_SURCHARGE}`,
  ]
  return (
    <section aria-labelledby="area-h1" className="ar-hero">
      <Container>
        <p className="hv-pill">{place}</p>
        <h1 id="area-h1" className="ar-h1">EPC in {name} from £{priceFrom.epc}</h1>
        <p className="ar-lede">
          Guide prices for a domestic EPC in {name} run from £{priceFrom.epc} to £{pricing[pricing.length - 1].epc}, set by
          internal floor area. A two-bedroom flat of {typical.areaLabel} is £{typical.epc}. Your exact quote is confirmed before booking.
        </p>
        <ul className="ar-facts">
          {facts.map((f) => <li key={f}>{f}</li>)}
        </ul>
        <div id="contact" className="ar-card scroll-mt-28">
          <BookingCard variant="area" areaPage={slug} sourcePage="area" />
        </div>
      </Container>
    </section>
  )
}
