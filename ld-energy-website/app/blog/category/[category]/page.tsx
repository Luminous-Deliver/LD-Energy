import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Clock } from 'lucide-react'
import { GuideCrumbs } from '@/components/blog/GuideCrumbs'
import { InnerEnding } from '@/components/inner/InnerEnding'
import { categories, getCategory } from '@/lib/blog-categories'
import { getPostsByCategory } from '@/lib/blog'
import { site, defaultOgImage } from '@/lib/site'

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
    description: `${cat.description} Posts written by an Elmhurst and Quidos accredited London Domestic Energy Assessor.`,
    alternates: { canonical: url },
    // Don't index a category page until it actually has posts.
    robots: posts.length === 0 ? { index: false, follow: true } : undefined,
    openGraph: {
      images: [defaultOgImage],
      title: `${cat.name}, EPC Guides | L&D Energy`,
      description: cat.description,
      url,
    },
    twitter: {
      images: [defaultOgImage.url],
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
    { href: '/blog', label: 'Guides' },
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
    publisher: { '@id': `${site.url}/#business` },
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
      <div className="gd">
        <header className="gd-hub-hero">
          <div className="gd-w gd-hub-hero__in">
            <GuideCrumbs items={breadcrumbs} />
            <p className="gd-eyebrow">EPC guides</p>
            <h1>{`${cat.name}: EPC Guides for London`}</h1>
            <p className="gd-hub-hero__lede">{cat.description}</p>
            <nav className="gd-cats" aria-label="Guide topics">
              {categories.map((c) => (
                <Link key={c.slug} href={`/blog/category/${c.slug}`} aria-current={c.slug === cat.slug ? 'page' : undefined}>
                  {c.name}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <section className="gd-w gd-all" aria-labelledby="cat-list">
          {posts.length === 0 ? (
            <p>No guides in this topic yet. <Link href="/blog" className="gd-link">See every guide</Link></p>
          ) : (
            <>
              <div className="gd-all__h">
                <h2 id="cat-list">{`All ${cat.name} guides`}</h2>
                <p>
                  <span className="num">{posts.length}</span> {posts.length === 1 ? 'guide' : 'guides'}, written by your assessor.{' '}
                  <Link href="/blog" className="gd-link">See every guide</Link>
                </p>
              </div>
              <ol className="gd-list">
                {posts.map((p, i) => (
                  <li key={p.slug}>
                    <Link href={`/blog/${p.slug}`} className="gd-row">
                      <span className="gd-row__n num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                      <span className="gd-row__b">
                        <b>{p.title}</b>
                        <span className="gd-row__d">{p.description}</span>
                      </span>
                      <span className="gd-row__m">
                        <Clock width={14} height={14} aria-hidden="true" />
                        <span>
                          <span className="num">{p.readingTime}</span> min
                        </span>
                      </span>
                      <ArrowRight className="gd-arrow" width={18} height={18} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>
      </div>
      <InnerEnding variant="a" source="blog" />
    </>
  )
}
