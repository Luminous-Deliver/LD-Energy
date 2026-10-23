import type { Metadata } from 'next'
import Link from 'next/link'
import { BookingCard } from '@/components/forms/BookingCard'
import { Container } from '@/components/ui/Container'
import { site, defaultOgImage } from '@/lib/site'
import '../inner.css'
import '../booking-v7.css'
import '../quote-contact.css'

/*
 * The quote journey's page (Abdul 23/10/2026: "/quote as a back up for if popup is blocked"). Every quote button on the
 * site is a link here; with JavaScript most open the same form in a dialog over the page instead. It reads the link's
 * choices (service, size, speed, plan, where it started) from its own URL and keeps the URL in step as they change.
 */
const title = 'EPC Quote London: Exact Price Before Booking'
const description =
  'Get your exact EPC or floor plan price for a London home. Pick the service and size, see the guide price, and we confirm it and a visit time before you book.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${site.url}/quote` },
  openGraph: { title: `${title} | L&D Energy`, description, url: `${site.url}/quote`, images: [defaultOgImage] },
  twitter: { title: `${title} | L&D Energy`, description, images: [defaultOgImage.url] },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
    { '@type': 'ListItem', position: 2, name: 'Get a quote', item: `${site.url}/quote` },
  ],
}

export default function QuotePage() {
  return (
    <div className="in qp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <section className="in-contact qp__sec" aria-labelledby="booking-form">
        <Container>
          <nav className="in-crumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link><span className="sep" aria-hidden="true">›</span></li>
              <li><span aria-current="page">Get a quote</span></li>
            </ol>
          </nav>
          <div className="in-contact__head qp__head">
            <div className="in-contact__title">
              <p className="in-eyebrow">L&amp;D Energy · Quote</p>
              <h1 className="qp__h1" id="booking-form" tabIndex={-1}>Get your exact quote</h1>
            </div>
            <div className="in-contact__side">
              <p>Pick the service and the size to see your guide price. We confirm the exact price and a visit time before you book.</p>
              <a className="in-contact__acc" href={site.assessor.verifyUrl} target="_blank" rel="noopener noreferrer">
                {site.assessor.name}, Elmhurst and Quidos accredited. <u>Check the GOV.UK register</u>
              </a>
            </div>
          </div>
          <div className="bk7">
            <BookingCard variant="page" />
          </div>
          <p className="qp__other">Not after a price? <Link href="/contact">Ask us a question</Link> about a booking, a certificate or agency work.</p>
        </Container>
      </section>
    </div>
  )
}
