import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans, Fraunces } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileCallBar } from '@/components/layout/MobileCallBar'
import { CookieBanner } from '@/components/layout/CookieBanner'
import { LondonSkyline } from '@/components/ui/LondonSkyline'
import { site, pricing, priceFrom, EXPRESS_SURCHARGE } from '@/lib/site'
import { boroughMeta } from '@/lib/boroughs'
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
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '08:00',
    closes: '20:00',
  },
  areaServed: [
    { '@type': 'City', name: 'London' },
    ...Object.values(boroughMeta).map((b) => ({ '@type': 'AdministrativeArea', name: b.name, containedInPlace: { '@type': 'City', name: 'London' } })),
  ],
  priceRange: '££',
  currenciesAccepted: 'GBP',
  paymentAccepted: 'Cash, Credit Card, Bank Transfer',
  // Local pack signals: map/profile link, service radius from the Stratford base,
  // and the languages we can actually serve enquiries in.
  hasMap: site.reviews.profileUrl,
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
        itemOffered: { '@type': 'Service', name: 'Next-Day EPC Service', description: 'Certificate lodged within 24 hours of the assessment' },
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
            'Written improvement plan delivered alongside an EPC assessment: the improvement recommendations on the lodged certificate, a full Energy Report, and a prioritised plan of which measures are worth doing on the property',
        },
        price: site.addOns.improvementPlan,
        priceCurrency: 'GBP',
      },
    ],
  },
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'Domestic Energy Assessor Accreditation',
    identifier: site.assessor.accreditationNumber,
    recognizedBy: { '@type': 'Organization', name: site.assessor.scheme },
  },
  // Sole trader: the operator IS the assessor. Expressed as founder rather
  // than legalName, which would imply a registered company.
  founder: { '@id': `${site.url}/about#assessor` },
  employee: {
    '@type': 'Person',
    '@id': `${site.url}/about#assessor`,
    name: site.assessor.name,
    jobTitle: 'Domestic Energy Assessor',
    identifier: site.assessor.accreditationNumber,
  },
  sameAs: [
    site.reviews.profileUrl,
    site.assessor.verifyUrl,
    'https://www.elmhurstenergy.co.uk',
  ],
  // The LocalBusiness and Organization nodes describe one business.
  brand: { '@id': `${site.url}/#organization` },
  knowsAbout: [
    'Energy Performance Certificates',
    'Domestic EPC',
    'MEES Compliance',
    'RdSAP Assessment',
    'Elmhurst Energy Accreditation',
  ],
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${site.url}/#organization`,
  name: 'L&D Energy',
  alternateName: ['LD Energy', 'L and D Energy'],
  disambiguatingDescription: 'L&D Energy is a domestic Energy Performance Certificate (EPC) provider based in Stratford, East London. We provide official EPC certificates and floor plans for residential properties across all London boroughs. L&D Energy is not related to learning and development, oil and gas training, L&Q Energy, or LD Energy Solutions.',
  description: `Elmhurst-accredited domestic Energy Performance Certificate (EPC) provider serving all 32 London boroughs. Official EPC certificates for homeowners, landlords, and letting agents, with guide prices from £${priceFrom.epc}.`,
  url: site.url,
  logo: { '@type': 'ImageObject', url: `${site.url}/logo.svg` },
  telephone: site.phoneIntl,
  email: site.email,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: site.phoneIntl,
    contactType: 'customer service',
    areaServed: 'GB',
    availableLanguage: 'English',
  },
  founder: { '@id': `${site.url}/about#assessor` },
  foundingLocation: { '@type': 'Place', name: 'Stratford, East London', address: { '@type': 'PostalAddress', addressLocality: 'Stratford', postalCode: 'E15', addressCountry: 'GB' } },
  areaServed: { '@type': 'City', name: 'London' },
  sameAs: [
    site.reviews.profileUrl,
    site.assessor.verifyUrl,
    'https://www.elmhurstenergy.co.uk',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cfBeaconToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN
  return (
    <html lang="en-GB" className={`${inter.variable} ${jakarta.variable} ${fraunces.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, organizationSchema]) }}
        />
        {cfBeaconToken ? (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: cfBeaconToken })}
          />
        ) : null}
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
        <Footer />
        <MobileCallBar />
        <CookieBanner />
      </body>
    </html>
  )
}
