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
import { site, pricing, priceFrom, EXPRESS_SURCHARGE } from '@/lib/site'
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
      <section aria-label="Page summary" className="sr-only">
        <h2>About L&amp;D Energy</h2>
        <p>
          L&amp;D Energy is an Elmhurst-accredited Domestic Energy Assessor based in Stratford, East London. We provide official Energy Performance Certificates (EPCs) and professional floor plans for residential properties across all London boroughs. EPCs are lodged on the UK government&rsquo;s official GOV.UK EPC Register within 72 hours as standard, and the certificate link is sent once it is live; next-day lodgement is available for {`£${EXPRESS_SURCHARGE}`} extra. Guide prices start at {`£${priceFrom.epc}`} for properties up to 37 m² and {`£${pricing[5].epc}`} for homes over 121 m², with the exact quote confirmed before booking. Internal floor area is the main pricing factor. We work with homeowners, landlords, and estate and letting agents, and are currently taking on new agency clients. Contact: {site.phone} or {site.email}.
        </p>
      </section>
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
