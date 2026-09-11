import { quoteHref } from '@/lib/quote-context'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  TrendingUp,
  Clock,
  Hourglass,
  Home,
  Lightbulb,
  Thermometer,
  Sun,
} from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Accordion } from '@/components/ui/Accordion'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { PageHero } from '@/components/sections/PageHero'
import { Pricing } from '@/components/sections/Pricing'
import { CtaStrip } from '@/components/sections/CtaStrip'
import { site, pricing, priceFrom, EXPRESS_SURCHARGE } from '@/lib/site'
import { areaServedLondon } from '@/lib/boroughs'
import type { FaqItem } from '@/lib/faq'

export const metadata: Metadata = {
  title: `EPC for Selling Your Home London | From £${priceFrom.epc}`,
  description:
    `EPC certificates for selling your London home. Required by law before marketing. Lodged within 72 hours, next-day available. Guide prices from £${priceFrom.epc}.`,
  alternates: { canonical: `${site.url}/sellers` },
  openGraph: {
    title: `EPC for Selling Your Home London | From £${priceFrom.epc} | L&D Energy`,
    description:
      `EPC certificates for selling your London home. Required by law before marketing. Lodged within 72 hours, next-day available. Guide prices from £${priceFrom.epc}.`,
    url: `${site.url}/sellers`,
  },
  twitter: {
    title: `EPC for Selling Your Home London | From £${priceFrom.epc}`,
    description:
      'EPC certificates for selling your London home. Required by law before marketing. Book today.',
  },
}

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: '/sellers', label: 'For Sellers' },
]

const timeline = [
  {
    title: 'Get your EPC before marketing',
    body: 'You must have an EPC commissioned before your property is advertised. Estate agents will ask for it on day one.',
  },
  {
    title: 'Book early in the listing process',
    body: 'Booking your EPC at the same time as your photography and floor plan keeps everything ready for launch day.',
  },
  {
    title: 'Use next-day service if you’re tight',
    body: `If your agent has already started chasing, our next-day service (+£${EXPRESS_SURCHARGE}) lodges the certificate within 24 hours.`,
  },
  {
    title: 'Provide the EPC to your buyer’s solicitor',
    body: 'The certificate is required as part of your sale pack and is referenced during conveyancing.',
  },
]

const improvements = [
  {
    Icon: Lightbulb,
    title: 'LED lighting',
    body: 'Low-cost swap. Increases the proportion of low-energy lighting recorded, a direct EPC factor.',
  },
  {
    Icon: Thermometer,
    title: 'Modern condensing boiler',
    body: 'A high-efficiency boiler with good controls is one of the highest-impact upgrades for older properties.',
  },
  {
    Icon: Home,
    title: 'Loft & cavity wall insulation',
    body: 'Quick, cost-effective improvements that meaningfully shift your rating in many London homes.',
  },
  {
    Icon: Sun,
    title: 'Renewables',
    body: 'Solar PV or a heat pump can move a property up several bands, useful if you’re aiming for EPC C or above.',
  },
]

const whyMatters = [
  {
    Icon: Clock,
    title: 'Legal requirement',
    body: 'You must have an EPC commissioned before your property is marketed for sale in England and Wales, and your estate agent cannot legally list it without one.',
  },
  {
    Icon: TrendingUp,
    title: 'Buyers care about efficiency',
    body: 'With rising energy bills and tighter mortgage criteria, more buyers now factor EPC rating into offers. A better rating supports your asking price.',
  },
  {
    Icon: Hourglass,
    title: 'Don’t hold up your sale',
    body: 'Conveyancing solicitors will ask for the certificate early. Our 72-hour standard delivery (or 24-hour express) keeps your timeline on track.',
  },
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
    { '@type': 'ListItem', position: 2, name: 'For Sellers', item: `${site.url}/sellers` },
  ],
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Energy Performance Certificate',
  name: 'EPC for Selling a Home',
  description:
    'Domestic EPC certificates for homeowners selling in London. Legally required before marketing, delivered within 72 hours or next day.',
  provider: { '@id': `${site.url}/#business` },
  url: `${site.url}/sellers`,
  areaServed: areaServedLondon,
  offers: {
    '@type': 'Offer',
    // Guide price, so minPrice — a fixed `price` would misstate the page.
    priceSpecification: { '@type': 'PriceSpecification', minPrice: pricing[0].epc, priceCurrency: 'GBP' },
    availability: 'https://schema.org/InStock',
  },
}

const sellerFaq: FaqItem[] = [
  {
    q: 'Do I need the EPC before or after I list my home?',
    a: 'Before. You must have commissioned an EPC before your property is marketed for sale — estate agents cannot legally advertise your home on Rightmove, Zoopla or any portal without one. Booking it early means nothing delays your listing going live.',
  },
  {
    q: 'Should I arrange the EPC myself or leave it to my estate agent?',
    a: 'Either works, but booking directly is often faster and cheaper than an agent-arranged panel provider. You keep control of the timing and can have the certificate ready the moment you instruct your agent.',
  },
  {
    q: 'Does a higher EPC rating actually help my sale?',
    a: 'Increasingly, yes. With higher energy bills and tighter mortgage stress-testing, more buyers factor the EPC rating into their offers. A better rating can support your asking price and speed up the sale, while a poor one gives buyers a reason to negotiate down.',
  },
  {
    q: 'Should I improve my rating before selling, or sell as-is?',
    a: 'It depends on your timeline. Cheap quick wins like LED lighting and topping up loft insulation can lift the rating before you list. If you need to move fast, selling as-is is perfectly fine — the improvement recommendations on your certificate simply pass to the buyer.',
  },
  {
    q: 'I already have an EPC from when I bought the property — can I reuse it?',
    a: 'Yes, as long as it is still within its 10-year validity. The certificate is tied to the property, not the owner. If it has expired, or you have made significant changes since, you will need a fresh assessment before marketing.',
  },
]

const sellerFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: sellerFaq.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

export default function SellersPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, serviceSchema, sellerFaqSchema]) }}
      />

      <BreadcrumbNav items={breadcrumbs} />

      <PageHero
        eyebrow="For Home Sellers"
        heading="EPCs for Selling Your London Home"
        subheading={`An EPC is required by law before your property goes on the market. We provide fast, transparently priced certificates so your sale isn't held up — lodged within 72 hours as standard, or next day for £${EXPRESS_SURCHARGE} extra.`}
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'sellers', ctaId: 'hero' }) }}
      />

      {/* Why it matters */}
      <Section variant="default" id="why-it-matters">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
            <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
            Why It Matters
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Why You Need an EPC to Sell
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            An EPC is legally required before any residential property is marketed for sale in England and Wales. It must be commissioned before your property is advertised and provided to potential buyers on request.
          </p>
          <p className="mt-4 text-secondary-700 leading-relaxed">
            You can book directly with us, often faster and cheaper than an agent-arranged panel provider, and if
            you work in property,{' '}
            <Link href="/estate-agents" className="text-primary-700 underline underline-offset-2 hover:text-primary-800 font-medium">
              estate and letting agents can partner with us
            </Link>{' '}
            for all their listings.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {whyMatters.map((m) => (
            <li key={m.title} className="flex sm:flex-col items-start gap-4 sm:gap-0 rounded-2xl bg-canvas ring-1 ring-secondary-900/5 p-5 md:p-6 shadow-sm">
              <div className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary-50 ring-1 ring-primary-100 text-primary-700">
                <m.Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="sm:mt-4">
                <h3 className="text-base md:text-lg font-semibold text-secondary-900">{m.title}</h3>
                <p className="mt-1.5 text-sm text-secondary-700 leading-relaxed">{m.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* Sale price impact */}
      <Section variant="muted" id="sale-price">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
          <div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
              <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
              Sale Price &amp; Speed
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
              How Your EPC Affects Your Sale
            </h2>
            <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
              EPC ratings are now front-and-centre on Rightmove, Zoopla and OnTheMarket listings. With energy costs and lender stress-testing in the spotlight, more buyers consider efficiency before making an offer.
            </p>
            <p className="mt-4 text-secondary-700 leading-relaxed">
              A higher rating signals lower running costs, which can support your asking price and reduce time on market. A lower rating doesn’t stop a sale, but it gives buyers a reason to negotiate down. The improvement recommendations on your certificate give you a roadmap if you want to push the rating up before relisting.
            </p>
          </div>

          <Card>
            <h3 className="text-xl font-semibold text-secondary-900">Quick-win improvements for sellers</h3>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {improvements.map((i) => (
                <li key={i.title} className="flex flex-col gap-2">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700">
                    <i.Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="font-semibold text-secondary-900">{i.title}</span>
                  <span className="text-sm text-secondary-700">{i.body}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      {/* Timeline */}
      <Section variant="default" id="timeline">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
            <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
            Timeline
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            When to Book Your EPC
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            The earlier the better. Here’s how to fit your EPC into a typical sale.
          </p>
        </div>
        <div className="mt-10 max-w-3xl">
          <ol className="space-y-6">
            {timeline.map((step, i) => (
              <li key={step.title} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary-600 text-white font-bold text-sm shrink-0">
                    {i + 1}
                  </span>
                  {i < timeline.length - 1 && (
                    <span className="mt-2 w-px flex-1 bg-primary-200" aria-hidden="true" />
                  )}
                </div>
                <div className="pb-6">
                  <h3 className="text-lg font-semibold text-secondary-900">{step.title}</h3>
                  <p className="mt-1 text-secondary-700 leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Pricing sourcePage="sellers" />

      {/* Seller FAQ */}
      <Section variant="default" id="seller-faq">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">Seller Questions</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            EPC FAQs for Home Sellers in London
          </h2>
          <div className="mt-8">
            <Accordion items={sellerFaq} />
          </div>
        </div>
      </Section>

      <CtaStrip
        heading="Don’t Let an EPC Delay Your Sale"
        body={`Standard 72-hour lodgement or next-day for £${EXPRESS_SURCHARGE}. We'll fit you in around your viewings.`}
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'sellers', ctaId: 'bottom' }) }}
      />
    </>
  )
}
