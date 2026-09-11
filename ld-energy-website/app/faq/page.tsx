import { quoteHref } from '@/lib/quote-context'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { PageHero } from '@/components/sections/PageHero'
import { Accordion } from '@/components/ui/Accordion'
import { CtaStrip } from '@/components/sections/CtaStrip'
import { fullFaq } from '@/lib/faq'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'EPC FAQ | Common Questions in London',
  description:
    'Common questions about Energy Performance Certificates: validity, legal rules, the assessment process, pricing and improvements. Answered by a DEA.',
  alternates: { canonical: `${site.url}/faq` },
  openGraph: {
    title: 'EPC FAQ | Common Questions About EPCs in London | L&D Energy',
    description:
      'Frequently asked questions about Energy Performance Certificates: validity, legal requirements, the assessment process, pricing, and improvements.',
    url: `${site.url}/faq`,
  },
  twitter: {
    title: 'EPC FAQ | Common Questions About EPCs in London',
    description:
      'Frequently asked questions about Energy Performance Certificates, answered by an Elmhurst-accredited DEA.',
  },
}

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: '/faq', label: 'FAQ' },
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
    { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${site.url}/faq` },
  ],
}

const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: fullFaq.flatMap((cat) =>
    cat.items.map((q) => ({
      '@type': 'Question',
      name: q.q,
      acceptedAnswer: { '@type': 'Answer', text: q.a },
    })),
  ),
}

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, faqPageSchema]) }}
      />

      <BreadcrumbNav items={breadcrumbs} />

      <PageHero
        eyebrow="Frequently Asked Questions"
        heading="EPC Questions, Answered"
        subheading="Everything we get asked about Energy Performance Certificates, what they are, the legal requirements, our process, pricing, and improvements."
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'faq', ctaId: 'hero' }) }}
      />

      <Section variant="default" id="faq-jump">
        <nav aria-label="FAQ categories" className="rounded-lg border border-secondary-200 bg-secondary-50 p-5">
          <p className="text-sm font-semibold text-secondary-700">Jump to a section:</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {fullFaq.map((cat) => (
              <li key={cat.id}>
                <a
                  href={`#${cat.id}`}
                  className="inline-flex items-center min-h-[44px] rounded-full border border-secondary-200 bg-white px-4 text-sm font-medium text-secondary-800 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                >
                  {cat.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Section>

      {fullFaq.map((cat, i) => (
        <Section
          key={cat.id}
          variant={i % 2 === 0 ? 'muted' : 'default'}
          id={cat.id}
          className="py-12 md:py-16"
        >
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">{cat.title}</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-secondary-900">
              {cat.title}
            </h2>
            <div className="mt-6">
              <Accordion items={cat.items} />
            </div>
          </div>
        </Section>
      ))}

      <Section variant="default" id="more-questions">
        <div className="max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-secondary-900">
            Still have a question?
          </h2>
          <p className="mt-4 text-secondary-700 leading-relaxed">
            Can&rsquo;t find what you&rsquo;re looking for? Get in touch — phone, WhatsApp and email all reach the assessor directly, and we reply during our opening hours.
          </p>
          <p className="mt-2 text-secondary-700">
            See our{' '}
            <Link href="/services/domestic-epc" className="text-primary-700 font-semibold hover:underline">
              Domestic EPC page
            </Link>{' '}
            for service details, or the{' '}
            <Link href="/pricing" className="text-primary-700 font-semibold hover:underline">
              pricing page
            </Link>{' '}
            for the full price list.
          </p>
        </div>
      </Section>

      <CtaStrip
        heading="Ready for your exact quote?"
        body="Get your London EPC sorted. Transparent pricing, fast delivery, no surprises."
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'faq', ctaId: 'bottom' }) }}
      />
    </>
  )
}
