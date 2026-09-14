import type { Metadata } from 'next'
import { Hero } from '@/components/sections/Hero'
import { TrustBar } from '@/components/sections/TrustBar'
import { SocialProof } from '@/components/sections/SocialProof'
import { WhatIsEpc } from '@/components/sections/WhatIsEpc'
import { Pricing } from '@/components/sections/Pricing'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { PrepPreview } from '@/components/sections/PrepPreview'
import { GoodToKnow } from '@/components/sections/GoodToKnow'
import { CtaBand } from '@/components/sections/CtaBand'
import { ServicesOverview } from '@/components/sections/ServicesOverview'
import { WhoWeHelp } from '@/components/sections/WhoWeHelp'
import { TradeAgency } from '@/components/sections/TradeAgency'
import { Coverage } from '@/components/sections/Coverage'
import { FromTheBlog } from '@/components/sections/FromTheBlog'
import { Faq } from '@/components/sections/Faq'
import { ContactSection } from '@/components/sections/ContactSection'
import { site, priceFrom } from '@/lib/site'
import { homepageFaqFeatured } from '@/lib/faq'

export const metadata: Metadata = {
  title: { absolute: `EPC London from £${priceFrom.epc} | Elmhurst Accredited | L&D Energy` },
  description: `Official EPC certificates across all 32 London boroughs. Elmhurst-accredited assessor, guide prices from £${priceFrom.epc}, lodged within 72 hours, next-day available. Exact quote before booking.`,
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
    description: `Official EPC certificates across all London boroughs. Elmhurst accredited DEA. Guide prices from £${priceFrom.epc}, lodged within 72 hours, next-day service available.`,
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
  mainEntity: homepageFaqFeatured.map((item) => ({
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
      <Hero />
      {/*
        Order is deliberate: establish what happens and what to know BEFORE
        pricing, so the page reads "what happens / what should I know?" ->
        "what do you offer?" -> "what does it cost?" -> "how do I get a quote?".
        TrustBar stays welded to the hero as its trust strip.
      */}
      <TrustBar />
      <SocialProof />
      <PrepPreview />
      <GoodToKnow />
      <Pricing sourcePage="home" />
      <CtaBand />
      <HowItWorks />
      <WhatIsEpc />
      <ServicesOverview />
      <WhoWeHelp />
      <TradeAgency />
      <Coverage />
      <FromTheBlog />
      <Faq />
      <ContactSection />
    </>
  )
}
