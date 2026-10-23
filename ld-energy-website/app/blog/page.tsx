import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BarChart3, Clock, MapPin, ShieldCheck } from 'lucide-react'
import { GuideCrumbs } from '@/components/blog/GuideCrumbs'
import { GuideScale } from '@/components/blog/GuideScale'
import { GuideList, type GuideListGroup } from '@/components/blog/GuideList'
import { InnerEnding } from '@/components/inner/InnerEnding'
import { getAllPosts, type Post } from '@/lib/blog'
import { BOROUGH_DATA_PAGE, guideGroups } from '@/lib/guides'
import { site, defaultOgImage } from '@/lib/site'

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

  const groups: GuideListGroup[] = guideGroups.map((g) => ({
    id: g.id,
    heading: g.heading,
    intro: g.intro,
    guides: g.guides.flatMap((x) => {
      const p = bySlug.get(x.slug)
      return p ? [{ slug: x.slug, title: p.title, summary: x.summary, minutes: p.readingTime }] : []
    }),
  }))
  const total = groups.reduce((n, g) => n + g.guides.length, 0)
  const summaryOf = (slug: string) => guideGroups.flatMap((g) => g.guides).find((x) => x.slug === slug)?.summary ?? ''
  const groupOf = (slug: string) => guideGroups.find((g) => g.guides.some((x) => x.slug === slug))?.heading ?? ''
  const feat = bySlug.get('epc-ratings-explained')
  // the two picture cards: the visit and the house in section (AI illustrations, imagery policy checked 23/10/2026)
  const sides = [
    { slug: 'what-happens-during-epc-assessment', img: '/guides/assessor-room', w: 1200, h: 800 },
    { slug: 'how-to-improve-epc-rating', img: '/guides/house-section', w: 1200, h: 667 },
  ].flatMap((x) => {
    const p = bySlug.get(x.slug)
    return p ? [{ ...x, post: p }] : []
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, blogSchema]) }}
      />
      <div className="gd">
        <header className="gd-hub-hero">
          <div className="gd-w gd-hub-hero__in">
            <GuideCrumbs items={breadcrumbs} />
            <h1>EPC Insights &amp; Guides for London Homeowners &amp; Landlords</h1>
            <p className="gd-hub-hero__lede">{OPENING_ANSWER}</p>
            <p className="gd-hub-hero__by">
              <span>
                <ShieldCheck width={16} height={16} aria-hidden="true" />
                Written by your assessor, Abdul Motaleb Taher, Elmhurst and Quidos accredited
              </span>
              <span>
                <span className="num">{total}</span> guides
              </span>
            </p>
          </div>
        </header>

        <section className="gd-w" aria-label="Start here">
          <div className="gd-top">
            {feat && (
              <Link href={`/blog/${feat.slug}`} className="gd-feat">
                <div className="gd-feat__art">
                  <GuideScale art minimum={false} />
                </div>
                <span className="gd-feat__b">
                  <span className="gd-tagline">
                    <span className="gd-start">Start here</span>
                    <span className="gd-eyebrow">{groupOf(feat.slug)}</span>
                  </span>
                  <b>{feat.title}</b>
                  <span className="gd-feat__d">{summaryOf(feat.slug)}</span>
                  <span className="gd-mins">
                    <Clock width={14} height={14} aria-hidden="true" />
                    <span className="num">{feat.readingTime}</span> min read
                  </span>
                </span>
              </Link>
            )}
            <div className="gd-sides">
              {sides.map(({ slug, img, w, h, post }) => (
                <Link key={slug} href={`/blog/${slug}`} className="gd-side">
                  <span className="gd-side__img">
                    {/* eslint-disable-next-line @next/next/no-img-element -- next/image is unoptimised on Pages */}
                    <img src={`${img}-720.webp`} srcSet={`${img}-720.webp 720w, ${img}-1200.webp 1200w`} sizes="(max-width: 899px) 116px, 30vw" alt="" width={w} height={h} loading="lazy" decoding="async" />
                  </span>
                  <span className="gd-side__b">
                    <span className="gd-eyebrow">{groupOf(slug)}</span>
                    <b>{post.title}</b>
                    <span className="gd-mins">
                      <Clock width={14} height={14} aria-hidden="true" />
                      <span className="num">{post.readingTime}</span> min read
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="gd-w gd-all" id="guides" aria-labelledby="all-guides">
          <div className="gd-all__h">
            <h2 id="all-guides">Every guide, by topic</h2>
            <p>Pick a topic, then read down the list: each group starts with the guide to read first.</p>
          </div>
          <GuideList groups={groups} />
        </section>

        <section className="gd-local" id="local-figures" aria-labelledby="local-figures-h">
          <div className="gd-w gd-local__in">
            <div>
              <h2 id="local-figures-h">Local figures</h2>
              <p>How homes in each London borough rate, from EPCs on the GOV.UK register, and what that means locally.</p>
            </div>
            <div className="gd-local__links">
              <Link href="/areas">
                <MapPin width={20} height={20} aria-hidden="true" />
                <span>
                  Find your area
                  <small>Prices, ratings and local rules for every borough</small>
                </span>
                <ArrowRight className="gd-arrow" width={18} height={18} aria-hidden="true" />
              </Link>
              {BOROUGH_DATA_PAGE.live && (
                <Link href={BOROUGH_DATA_PAGE.href}>
                  <BarChart3 width={20} height={20} aria-hidden="true" />
                  <span>
                    {BOROUGH_DATA_PAGE.label}
                    <small>All 33 councils side by side</small>
                  </span>
                  <ArrowRight className="gd-arrow" width={18} height={18} aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>
      <InnerEnding variant="a" source="blog" />
    </>
  )
}
