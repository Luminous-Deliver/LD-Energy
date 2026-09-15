import type { Metadata } from 'next'
import { HomeHero } from '@/components/sections/HomeHero'
import { HomeServices } from '@/components/sections/HomeServices'
import { HomeContent } from '@/components/sections/HomeContent'
import { site, priceFrom } from '@/lib/site'
import { homeBookingFaqs } from '@/lib/homepage-content'

export const metadata: Metadata = {
  title: { absolute: `EPC London from £${priceFrom.epc} | Elmhurst Accredited | L&D Energy` },
  description: `Domestic EPCs across London from an Elmhurst-accredited assessor based in Stratford. Guide prices from £${priceFrom.epc}, based on floor area. Exact quote before booking.`,
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
    description: `Domestic EPCs across London from an Elmhurst-accredited assessor. Guide prices from £${priceFrom.epc}, based on floor area. Exact quote before booking.`,
    url: site.url,
  },
  twitter: {
    title: `Domestic EPC London | From £${priceFrom.epc} | Elmhurst Accredited`,
    description: `Official EPC certificates across all London boroughs. Guide prices from £${priceFrom.epc}, exact quote confirmed before booking.`,
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${site.url}/#website`,
  url: site.url,
  name: site.name,
  description: site.description,
  publisher: { '@id': `${site.url}/#organization` },
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
      <HomeHero />
      <HomeServices />
      <HomeContent />
    </>
  )
}
