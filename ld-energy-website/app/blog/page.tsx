import { quoteHref } from '@/lib/quote-context'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { PageHero } from '@/components/sections/PageHero'
import { CtaStrip } from '@/components/sections/CtaStrip'
import { PostCard } from '@/components/blog/PostCard'
import { getAllPosts, getFeaturedPosts } from '@/lib/blog'
import { categories } from '@/lib/blog-categories'
import { site, priceFrom } from '@/lib/site'

export const metadata: Metadata = {
  title: 'EPC Guides for London Homeowners & Landlords',
  description:
    'Expert guidance on Energy Performance Certificates, MEES compliance, and improving your EPC rating, written by an Elmhurst-accredited London DEA.',
  alternates: { canonical: `${site.url}/blog` },
  openGraph: {
    title: 'EPC Insights & Guides | L&D Energy Blog',
    description:
      'Expert EPC guidance for London homeowners, landlords, and estate agents. Written by a working Elmhurst-accredited DEA.',
    url: `${site.url}/blog`,
  },
  twitter: {
    title: 'EPC Insights & Guides',
    description:
      'Expert EPC guidance for London homeowners, landlords, and estate agents.',
  },
}

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: `${site.url}/blog` },
  ],
}

export default async function BlogIndexPage() {
  const allPosts = await getAllPosts()
  const featured = await getFeaturedPosts(3)
  const featuredSlugs = new Set(featured.map((p) => p.slug))
  const recent = allPosts.filter((p) => !featuredSlugs.has(p.slug))

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${site.url}/blog`,
    name: 'L&D Energy Blog',
    description:
      'Expert guidance on EPCs, MEES compliance, and improving energy efficiency from a working London DEA.',
    publisher: { '@id': `${site.url}/#organization` },
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
        eyebrow="EPC Blog"
        heading="EPC Insights & Guides for London Homeowners & Landlords"
        subheading="Expert guidance on Energy Performance Certificates, MEES compliance, and improving your rating, written by a working London DEA."
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'blog', ctaId: 'hero' }) }}
      />

      {allPosts.length === 0 ? (
        <Section variant="default">
          <div className="max-w-2xl">
            <p className="text-lg text-secondary-700">
              New posts are on the way. In the meantime, see our{' '}
              <Link href="/services/domestic-epc" className="text-primary-700 underline">
                Domestic EPC service
              </Link>{' '}
              or{' '}
              <Link href={quoteHref({ sourcePage: 'blog', ctaId: 'inline' })} className="text-primary-700 underline">
                request an assessment quote
              </Link>
              .
            </p>
          </div>
        </Section>
      ) : (
        <>
          {featured.length > 0 && (
            <Section variant="default" id="featured">
              <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">
                Featured
              </p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
                Editor&rsquo;s picks
              </h2>
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {featured.map((post, i) => (
                  <PostCard key={post.slug} post={post} featured={i === 0 && featured.length > 1} />
                ))}
              </div>
            </Section>
          )}

          <Section variant="muted" id="categories">
            <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">
              Browse by topic
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
              Explore by category
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/blog/category/${cat.slug}`}
                    className="block h-full rounded-lg border border-secondary-200 bg-white p-5 transition-colors hover:border-primary-300 hover:bg-primary-50"
                  >
                    <p className="font-semibold text-secondary-900 group-hover:text-primary-700">
                      {cat.name}
                    </p>
                    <p className="mt-1 text-sm text-secondary-600">{cat.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>

          {recent.length > 0 && (
            <Section variant="default" id="recent">
              <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">
                Recent posts
              </p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
                Latest guides
              </h2>
              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recent.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </Section>
          )}
        </>
      )}

      <CtaStrip
        heading="Need an EPC? Get your exact quote."
        body={`Elmhurst-accredited assessor. Guide prices from £${priceFrom.epc}. Lodged within 72 hours.`}
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'blog', ctaId: 'bottom' }) }}
      />
    </>
  )
}
