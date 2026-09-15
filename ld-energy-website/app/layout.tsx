import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans, Fraunces } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { CompactFooter } from '@/components/layout/CompactFooter'
import { MobileQuoteBar } from '@/components/layout/MobileQuoteBar'
import { WebAnalytics } from '@/components/layout/WebAnalytics'
import { LondonSkyline } from '@/components/ui/LondonSkyline'
import { site, pricing, priceFrom, EXPRESS_SURCHARGE } from '@/lib/site'
import { boroughMeta } from '@/lib/boroughs'
import { assessorSchema } from '@/lib/assessor-schema'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

// Editorial display serif for headlines, warm, optical, distinctly not-Inter.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  axes: ['SOFT', 'opsz'],
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `Domestic EPC London | From £${priceFrom.epc} | Elmhurst Accredited | L&D Energy`,
    template: '%s | L&D Energy',
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  alternates: { canonical: '/' },
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png', sizes: '96x96' }],
    apple: [{ url: '/apple-icon.png', type: 'image/png', sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: site.url,
    siteName: site.name,
    title: `Domestic EPC London | From £${priceFrom.epc} | L&D Energy`,
    description:
      `Elmhurst accredited domestic energy assessor. Guide prices from £${priceFrom.epc}, exact quote before booking. Next-day service available across all London boroughs.`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Domestic EPC London | From £${priceFrom.epc}`,
    description: 'Fast, affordable EPC certificates across London. Book today.',
  },
  robots: { index: true, follow: true },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  },
  other: {
    'geo.region': 'GB-LND',
    'geo.placename': 'London',
    'geo.position': `${site.geo.lat};${site.geo.lng}`,
    ICBM: `${site.geo.lat}, ${site.geo.lng}`,
    'msvalidate.01': 'DFFEC284468B87783C72AAE82B182E2B',
  },
}

export const viewport: Viewport = {
  themeColor: '#33507F',
  width: 'device-width',
  initialScale: 1,
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  // HomeAndConstructionBusiness is how Google classifies property-survey
  // trades. ProfessionalService was removed: schema.org formally deprecates it.
  '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
  '@id': `${site.url}/#business`,
  name: site.name,
  description: site.description,
  url: site.url,
  image: `${site.url}/logo.webp`,
  logo: `${site.url}/logo.svg`,
  telephone: site.phoneIntl,
  email: site.email,
  address: {
    '@type': 'PostalAddress',
    addressLocality: site.address.locality,
    addressRegion: site.address.region,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: site.geo.lat,
    longitude: site.geo.lng,
  },
  areaServed: [
    { '@type': 'City', name: 'London' },
    ...Object.values(boroughMeta).map((b) => ({ '@type': 'AdministrativeArea', name: b.name, containedInPlace: { '@type': 'City', name: 'London' } })),
  ],
  priceRange: '££',
  currenciesAccepted: 'GBP',
  paymentAccepted: 'Credit Card, Bank Transfer',
  // No aggregateRating. Google's review-snippet policy disallows self-serving
  // review markup — content a business publishes about itself — and the rating
  // was emitted on all 72 URLs while being visible on one. Star ratings in the
  // local pack come from the Google Business Profile, not from this markup, so
  // there was risk without upside. Visible review proof on the site is
  // unaffected; only the structured-data claim is removed.
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'EPC and Floor Plan Services',
    itemListElement: [
      ...pricing.map((p) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: `Domestic EPC Certificate, ${p.areaLabel}` },
        // minPrice: these are guide prices, and marking them as fixed `price`
        // would misrepresent what the pricing page actually says.
        priceSpecification: { '@type': 'PriceSpecification', minPrice: p.epc, priceCurrency: 'GBP' },
      })),
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Next-Day EPC Service', description: 'Optional next-day lodgement, subject to confirmed availability before booking' },
        priceSpecification: { '@type': 'PriceSpecification', price: EXPRESS_SURCHARGE, priceCurrency: 'GBP', description: 'Additional charge on top of the confirmed EPC price' },
      },
      ...pricing.map((p) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: `EPC and Floor Plan Bundle, ${p.areaLabel}` },
        priceSpecification: { '@type': 'PriceSpecification', minPrice: p.bundle, priceCurrency: 'GBP' },
        description: 'EPC and floor plan for the same property, completed in one visit',
      })),
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'EPC Improvement Plan',
          description:
            'Optional personalised written plan explaining what is holding the EPC rating back and which improvements to consider first, supported by the full Elmhurst Energy Report. Standard EPC recommendations are included independently of this add-on.',
        },
        price: site.addOns.improvementPlan,
        priceCurrency: 'GBP',
      },
    ],
  },
  // One LocalBusiness node also represents the organisation. The Person owns the credential.
  founder: { '@id': `${site.url}/about#assessor` },
  knowsAbout: [
    'Energy Performance Certificates',
    'Domestic EPC',
    'MEES Compliance',
    'RdSAP Assessment',
    'Elmhurst Energy Accreditation',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cfBeaconToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN
  return (
    <html lang="en-GB" className={`${inter.variable} ${jakarta.variable} ${fraunces.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, assessorSchema]) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        {/* Skyline transition, ivory canvas fades into forest dark */}
        <LondonSkyline className="text-[#0D1B33] -mb-1" />
        <CompactFooter />
        <MobileQuoteBar />
        <WebAnalytics token={cfBeaconToken} />
      </body>
    </html>
  )
}
