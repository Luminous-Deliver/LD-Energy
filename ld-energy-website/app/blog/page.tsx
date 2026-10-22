import { quoteHref } from '@/lib/quote-context'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { PageHero } from '@/components/sections/PageHero'
import { CtaStrip } from '@/components/sections/CtaStrip'
import { getAllPosts, type Post } from '@/lib/blog'
import { BOROUGH_DATA_PAGE, guideGroups } from '@/lib/guides'
import { whatsappQuoteHref } from '@/lib/area-page'
import { site, priceFrom, defaultOgImage } from '@/lib/site'

// Title and H1 are frozen until the 14/12 review (references/local-seo.md); the body is the Guides hub
// of plan PLAN-AREAS-GUIDES-2026-10-22 §8.1.
export const metadata: Metadata = {
  title: 'EPC Guides for London Homeowners & Landlords',
  description:
    'Expert guidance on Energy Performance Certificates, MEES compliance, and improving your EPC rating, written by an Elmhurst and Quidos accredited London DEA.',
  alternates: { canonical: `${site.url}/blog` },
  openGraph: {
    images: [defaultOgImage],
    title: 'EPC Insights & Guides | L&D Energy Blog',
    description:
      'Expert EPC guidance for London homeowners, landlords, and estate agents. Written by a working Elmhurst and Quidos accredited DEA.',
    url: `${site.url}/blog`,
  },
  twitter: {
    images: [defaultOgImage.url],
    title: 'EPC Insights & Guides',
    description:
      'Expert EPC guidance for London homeowners, landlords, and estate agents.',
  },
}

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Guides' },
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
    { '@type': 'ListItem', position: 2, name: 'Guides', item: `${site.url}/blog` },
  ],
}

const OPENING_ANSWER =
  'An EPC rates a home from A to G using a modelled score, not your bills. You need a valid one, lodged no more than 10 years ago, before you sell or let, and rented homes covered by the minimum standard must be band E or above unless an exemption is registered. Approved software works out the rating from what the assessor records and the evidence you can show. Start with the group that fits where you are.'

export default async function BlogIndexPage() {
  const allPosts = await getAllPosts()
  const bySlug = new Map<string, Post>(allPosts.map((p) => [p.slug, p]))

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${site.url}/blog`,
    name: 'L&D Energy Guides',
    description:
      'Guidance on EPCs, MEES compliance and improving energy efficiency from a working London DEA.',
    publisher: { '@id': `${site.url}/#business` },
    blogPost: allPosts.slice(0, 20).map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${site.url}/blog/${p.slug}`,
      datePublished: p.publishedAt,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, blogSchema]) }}
      />
      <BreadcrumbNav items={breadcrumbs} />

      <PageHero
        eyebrow="Guides"
        heading="EPC Insights & Guides for London Homeowners & Landlords"
        subheading={OPENING_ANSWER}
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'blog', ctaId: 'hero' }) }}
        secondaryCta={{ label: 'WhatsApp a quote request', href: whatsappQuoteHref() }}
      />

      <Section variant="default" id="guides">
        <nav aria-label="Guide groups" className="flex flex-wrap gap-2">
          {guideGroups.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="inline-flex min-h-11 items-center rounded-full border border-secondary-200 bg-white px-4 text-sm font-medium text-secondary-800 hover:border-primary-300 hover:bg-primary-50"
            >
              {g.heading}
            </a>
          ))}
        </nav>

        <div className="mt-10 space-y-14">
          {guideGroups.map((group) => (
            <section key={group.id} id={group.id} aria-labelledby={`${group.id}-heading`} className="scroll-mt-28">
              <h2 id={`${group.id}-heading`} className="text-2xl md:text-3xl font-bold tracking-tight text-secondary-900">
                {group.heading}
              </h2>
              <p className="mt-2 max-w-2xl text-secondary-700">{group.intro}</p>
              <ul className="mt-6 grid gap-3 md:grid-cols-2">
                {group.guides.map((g, i) => {
                  const post = bySlug.get(g.slug)
                  if (!post) return null
                  const pillar = i === 0
                  return (
                    <li key={g.slug} className={pillar ? 'md:col-span-2' : undefined}>
                      <Link
                        href={`/blog/${g.slug}`}
                        className={`group flex h-full flex-col rounded-lg border p-5 transition-colors hover:border-primary-300 hover:bg-primary-50 ${
                          pillar ? 'border-primary-200 bg-primary-50/60' : 'border-secondary-200 bg-white'
                        }`}
                      >
                        {pillar && (
                          <span className="text-xs font-semibold uppercase tracking-wide text-primary-700">Start here</span>
                        )}
                        <span className={`font-semibold text-secondary-900 group-hover:text-primary-800 ${pillar ? 'mt-1 text-lg' : ''}`}>
                          {post.title}
                        </span>
                        <span className="mt-1 text-sm text-secondary-700">{g.summary}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      </Section>

      <Section variant="muted" id="local-figures">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-secondary-900">Local figures</h2>
        <p className="mt-2 max-w-2xl text-secondary-700">
          How homes in each London borough rate, from EPCs on the GOV.UK register, and what that means locally.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/areas"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-secondary-200 bg-white px-5 py-3 font-semibold text-secondary-900 hover:border-primary-300 hover:bg-primary-50"
          >
            <MapPin className="h-4 w-4 text-primary-600" aria-hidden="true" />
            Find your area
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {BOROUGH_DATA_PAGE.live && (
            <Link
              href={BOROUGH_DATA_PAGE.href}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-secondary-200 bg-white px-5 py-3 font-semibold text-secondary-900 hover:border-primary-300 hover:bg-primary-50"
            >
              {BOROUGH_DATA_PAGE.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </Section>

      <CtaStrip
        heading="Need an EPC? Get your exact quote."
        body={`Elmhurst and Quidos accredited assessor. Guide prices from £${priceFrom.epc}. Lodged within 72 hours.`}
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'blog', ctaId: 'bottom' }) }}
      />
    </>
  )
}
