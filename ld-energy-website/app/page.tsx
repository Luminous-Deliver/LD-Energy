import type { Metadata } from 'next'
import { HomePage as HomeBody } from '@/components/sections/home/HomePage'
import { site, priceFrom, defaultOgImage } from '@/lib/site'
import { homeBookingFaqs } from '@/lib/homepage-content'
import './home-v7.css'
import './booking-v7.css'

export const metadata: Metadata = {
  // GSC 90 days to 02/11/2026: "domestic epc/energy assessor" 127 impressions at positions 35-49; "epc london" kept (both words stay).
  title: { absolute: `Domestic EPC Assessor in London from £${priceFrom.epc} | L&D Energy` },
  description: `Domestic EPC assessor in Stratford, E15. Elmhurst (${site.assessor.accreditations[0].number}) and Quidos (${site.assessor.accreditations[1].number}) accredited. EPCs across London from £${priceFrom.epc}, exact quote before you book.`,
  keywords: [
    'EPC London',
    'domestic EPC',
    'energy performance certificate London',
    'EPC certificate',
    'EPC assessor London',
    'EPC and floor plan London',
    'next day EPC London',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: `Domestic EPC London | From £${priceFrom.epc} | Elmhurst Accredited | L&D Energy`,
    description: `Domestic EPCs across London from an Elmhurst and Quidos accredited assessor. Guide prices from £${priceFrom.epc}, based on floor area. Exact quote before booking.`,
    url: site.url,
    images: [defaultOgImage],
  },
  twitter: {
    title: `Domestic EPC London | From £${priceFrom.epc} | Elmhurst Accredited`,
    description: `Official EPC certificates across all London boroughs. Guide prices from £${priceFrom.epc}, exact quote confirmed before booking.`,
    images: [defaultOgImage.url],
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${site.url}/#website`,
  url: site.url,
  name: site.name,
  description: site.description,
  publisher: { '@id': `${site.url}/#business` },
  // No potentialAction/SearchAction: the Sitelinks Search Box it targeted was
  // retired in 2024, and the urlTemplate pointed at /areas/{query}, which 404s
  // for anything that is not an exact borough slug.
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: homeBookingFaqs.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([websiteSchema, faqSchema]) }}
      />
      <HomeBody />
    </>
  )
}
