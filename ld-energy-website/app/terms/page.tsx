import type { Metadata } from 'next'
import { LegalPage } from '@/components/ui/LegalPage'
import { site, insurance, EXPRESS_SURCHARGE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of service governing the supply of EPC certificates and floor plans by L&D Energy, a trading name of Luminous & Deliver.',
  alternates: { canonical: `${site.url}/terms` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Terms of Service | L&D Energy',
    description:
      'Terms of service governing the supply of EPC certificates and floor plans by L&D Energy, a trading name of Luminous & Deliver.',
    url: `${site.url}/terms`,
  },
  twitter: {
    title: 'Terms of Service | L&D Energy',
    description:
      'Terms of service governing the supply of EPC certificates and floor plans by L&D Energy.',
  },
}

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Terms of Service',
  url: `${site.url}/terms`,
  description: 'Terms of service governing the supply of EPC certificates and floor plans by L&D Energy.',
  publisher: { '@id': `${site.url}/#organization` },
  inLanguage: 'en-GB',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'Terms of Service', item: `${site.url}/terms` },
    ],
  },
}

export default function TermsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      <LegalPage
      title="Terms of Service"
      lastUpdated="May 2026"
      breadcrumbs={[
        { href: '/', label: 'Home' },
        { href: '/terms', label: 'Terms of Service' },
      ]}
    >
      <p>
        These terms govern the supply of EPC certificates, floor plans, and related services by L&amp;D Energy, a trading name of {site.parentBrand} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). By booking a service with us you accept these terms.
      </p>

      <h2>1. The service</h2>
      <p>
        We provide Domestic Energy Performance Certificates (EPCs) and professional property floor plans for residential properties in our service area. EPCs are produced by an Elmhurst-accredited Domestic Energy Assessor (DEA) and lodged on the UK Government EPC Register.
      </p>
      <p>
        Your energy rating is calculated by government-approved RdSAP software from the data recorded at the assessment. We collect and submit that data accurately; we cannot select, influence or adjust the rating the software produces, and we do not guarantee any particular rating or band. Ratings produced under RdSAP 10, the methodology in use since June 2025, are not directly comparable with certificates issued before that date.
      </p>

      <h2>2. Booking and pricing</h2>
      <p>
        Prices shown on our pricing page are guide estimates based mainly on internal floor area (m²), not fixed quotes. We confirm your exact price before the booking is accepted, and that confirmed price is the price you pay, provided the property matches the details given to us at booking. There is no call-out or mileage charge within our normal service area; travel beyond it is included in the quote before booking. Express (next-day) service is available for {`£${EXPRESS_SURCHARGE}`} extra per EPC.
      </p>
      <p>
        If the property turns out to be materially different from those details &mdash; for example a significantly larger floor area, a different property type, or an extension or loft conversion not mentioned at booking &mdash; we will tell you before starting the assessment and either agree a revised price with you or reschedule. We will not change an agreed price without speaking to you first, and you are free to decline and cancel at no charge at that point.
      </p>
      <p>
        Bookings are confirmed once we reply with a confirmed appointment time. We may decline bookings for properties outside our service area or where we cannot deliver the agreed turnaround.
      </p>

      <h2>3. Your obligations</h2>
      <p>To allow us to deliver the service, you (or your representative) must:</p>
      <ul>
        <li>Provide accurate property details at booking</li>
        <li>Be present at the property (or arrange representative access) at the agreed time</li>
        <li>Provide normal access to all rooms, lofts (where safely accessible), the boiler, hot water cylinder, heating controls, energy meters and windows</li>
        <li>Share any supporting evidence you hold, such as installation certificates, insulation specifications, window or boiler installation dates, or MCS documentation for solar panels and heat pumps</li>
        <li>Provide accurate information about the property where requested</li>
      </ul>
      <p>
        Where evidence is not available, the assessment must use the default assumptions the RdSAP methodology requires. Those defaults are deliberately cautious, so a property with undocumented improvements may score lower than one with the same improvements evidenced. Providing what you have is the single most effective thing you can do to make your rating reflect the property accurately.
      </p>
      <p>
        Re-visits made necessary by access issues outside our control are charged at £25 per visit.
      </p>

      <h2>4. Delivery</h2>
      <p>
        Standard EPC delivery is within 72 hours of the assessment. Next-day delivery (where booked) is within 24 hours of the assessment. We lodge your certificate on the official government EPC Register on your behalf and send you the link to your certificate once it is live.
      </p>

      <h2>5. Payment</h2>
      <p>
        Payment is due on completion of the assessment unless otherwise agreed in writing. We accept bank transfer and card payments.
      </p>

      <h2>6. Cancellation</h2>
      <p>
        You may cancel or reschedule an appointment free of charge with at least 24 hours&rsquo; notice. Cancellations or reschedules with less than 24 hours&rsquo; notice may incur a £25 fee to cover travel and time.
      </p>

      <h2>7. Liability</h2>
      <p>
        {insurance.legal} Our liability for any loss arising from the service is limited to the price paid for that service, except where liability cannot be limited by law (for example fraud or personal injury caused by negligence).
      </p>

      <h2>8. Validity of the EPC</h2>
      <p>
        An EPC is valid for 10 years from the date of issue. The certificate is issued on the basis of the data observed and recorded at the assessment. If the property changes materially after the assessment (for example major refurbishment), a new EPC may be required.
      </p>

      <h2>9. Complaints</h2>
      <p>
        Concerns should be raised with us in the first instance at <a href={site.emailHref}>{site.email}</a>. Complaints relating to the EPC itself can also be escalated through Elmhurst Energy&rsquo;s formal complaints process.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These terms are governed by the laws of England and Wales, and any disputes are subject to the exclusive jurisdiction of the English courts.
      </p>

      <h2>11. Contact</h2>
      <p>
        {site.legal.statement} Contact:{' '}
        <a href={site.phoneHref}>{site.phone}</a> · <a href={site.emailHref}>{site.email}</a>.
      </p>
    </LegalPage>
    </>
  )
}
