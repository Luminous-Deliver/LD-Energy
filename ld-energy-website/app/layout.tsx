import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Header } from '@/components/layout/Header'
import { CompactFooter } from '@/components/layout/CompactFooter'
import { PhoneDock } from '@/components/layout/PhoneDock'
import { QuoteDialog } from '@/components/forms/QuoteDialog'
import { WebAnalytics } from '@/components/layout/WebAnalytics'
import { LondonSkyline } from '@/components/ui/LondonSkyline'
import { site, pricing, priceFrom, SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE } from '@/lib/site'
import { areaServedLondon } from '@/lib/boroughs'
import { assessorSchema } from '@/lib/assessor-schema'
import { whatsappQuoteHref } from '@/lib/area-page'
import './globals.css'
import './shared-parts.css'

// The brand fonts, self-hosted (no Google Fonts request: references/uk-web-compliance.md). Jost carries the
// header, nav and body text; Source Serif 4 the headings, often a page's LCP text. Both are small latin subsets
// (26 KB and 48 KB) and above the fold on every page, so both are preloaded. `swap` paints text at once in the
// metric-matched fallback next/font generates (adjustFontFallback), so the swap moves almost nothing (CLS).
const jost = localFont({
  src: './fonts/jost-latin.woff2',
  variable: '--font-sans',
  weight: '100 900',
  display: 'swap',
  preload: true,
  fallback: ['Futura', 'Century Gothic', 'system-ui', 'sans-serif'],
})

// Source Serif 4 ships one weight with an optical-size axis: the prototype sets every serif at 400.
const sourceSerif = localFont({
  src: './fonts/source-serif-4-latin.woff2',
  variable: '--font-serif',
  weight: '400',
  display: 'swap',
  preload: true,
  fallback: ['Georgia', 'Times New Roman', 'serif'],
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
      `Elmhurst and Quidos accredited domestic energy assessor. Guide prices from £${priceFrom.epc}, exact quote before booking. London-wide service from a Stratford E15 base.`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Domestic EPC London | From £${priceFrom.epc}`,
    description: 'Domestic EPCs across London. Get your exact quote before booking.',
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
  alternateName: ['LD Energy', 'L and D Energy'],
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
  areaServed: areaServedLondon,
  priceRange: '££',
  currenciesAccepted: 'GBP',
  paymentAccepted: 'Cash, Credit Card, Bank Transfer',
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
        itemOffered: { '@type': 'Service', name: `Domestic EPC, ${p.areaLabel}` },
        // minPrice: these are guide prices, and marking them as fixed `price`
        // would misrepresent what the pricing page actually says.
        priceSpecification: { '@type': 'PriceSpecification', minPrice: p.epc, priceCurrency: 'GBP' },
      })),
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Same-Day EPC Lodgement', description: 'Optional: the EPC is lodged on the day of the visit, subject to confirmed availability before booking' },
        priceSpecification: { '@type': 'PriceSpecification', price: SAME_DAY_LODGEMENT_SURCHARGE, priceCurrency: 'GBP', description: 'Additional charge on top of the confirmed EPC price' },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Next-Day EPC Visit and Lodgement', description: 'Optional: the visit is the next day and the EPC is lodged that day, subject to confirmed availability before booking' },
        priceSpecification: { '@type': 'PriceSpecification', price: NEXT_DAY_VISIT_SURCHARGE, priceCurrency: 'GBP', description: 'Additional charge on top of the confirmed EPC price' },
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
    'Quidos Accreditation',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cfBeaconToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN
  const waHref = whatsappQuoteHref()
  return (
    <html lang="en-GB" className={`${jost.variable} ${sourceSerif.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, assessorSchema]) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-sage-700 focus:text-white focus:rounded-btn"
        >
          Skip to main content
        </a>
        <Header waHref={waHref} />
        <main id="main" className="flex-1">
          {children}
        </main>
        {/* The street drawing above the footer, in the night token: the paper ground runs into the footer */}
        <LondonSkyline className="site-skyline text-night -mb-1" />
        <CompactFooter />
        <PhoneDock waHref={waHref} />
        {/* every quote link opens this over the page when it can; /quote is the page it falls back to */}
        <QuoteDialog />
        <WebAnalytics token={cfBeaconToken} />
      </body>
    </html>
  )
}
