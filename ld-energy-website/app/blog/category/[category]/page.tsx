import { quoteHref } from '@/lib/quote-context'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Section } from '@/components/ui/Section'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { PageHero } from '@/components/sections/PageHero'
import { CtaStrip } from '@/components/sections/CtaStrip'
import { PostCard } from '@/components/blog/PostCard'
import { categories, getCategory } from '@/lib/blog-categories'
import { getPostsByCategory } from '@/lib/blog'
import { site, priceFrom } from '@/lib/site'

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: slug } = await params
  const cat = getCategory(slug)
  if (!cat) return {}
  const posts = await getPostsByCategory(slug)
  const url = `${site.url}/blog/category/${cat.slug}`
  return {
    title: `${cat.name}, EPC Guides`,
    description: `${cat.description} Posts written by an Elmhurst-accredited London Domestic Energy Assessor.`,
    alternates: { canonical: url },
    // Don't index a category page until it actually has posts.
    robots: posts.length === 0 ? { index: false, follow: true } : undefined,
    openGraph: {
      title: `${cat.name}, EPC Guides | L&D Energy`,
      description: cat.description,
      url,
    },
    twitter: {
      title: `${cat.name}, EPC Guides`,
      description: cat.description,
    },
  }
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { category: slug } = await params
  const cat = getCategory(slug)
  if (!cat) notFound()
  const posts = await getPostsByCategory(slug)

  const breadcrumbs = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Blog' },
    { href: `/blog/category/${cat.slug}`, label: cat.name },
  ]

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.label,
      item: b.href ? `${site.url}${b.href === '/' ? '' : b.href}` : undefined,
    })),
  }

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cat.name}, EPC Guides`,
    description: cat.description,
    url: `${site.url}/blog/category/${cat.slug}`,
    publisher: { '@id': `${site.url}/#organization` },
    hasPart: posts.map((p) => ({
      '@type': 'Article',
      headline: p.title,
      description: p.description,
      url: `${site.url}/blog/${p.slug}`,
      datePublished: p.publishedAt,
      dateModified: p.updatedAt || p.publishedAt,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, collectionSchema]) }}
      />
      <BreadcrumbNav items={breadcrumbs} />
      <PageHero
        eyebrow="EPC Blog"
        heading={`${cat.name}: EPC Guides for London`}
        subheading={cat.description}
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'blog', ctaId: 'hero' }) }}
      />

      <Section variant="default">
        {posts.length === 0 ? (
          <p className="text-secondary-700">No posts in this category yet, check back soon.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        )}
      </Section>

      <CtaStrip
        heading="Need an EPC? Get your exact quote."
        body={`Elmhurst-accredited assessor. Guide prices from £${priceFrom.epc}. Lodged within 72 hours.`}
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'blog', ctaId: 'bottom' }) }}
      />
    </>
  )
}
