import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PostHeader, showsScale } from '@/components/blog/PostHeader'
import { KeyTakeaways } from '@/components/blog/KeyTakeaways'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { extractToc } from '@/lib/heading-text'
import { PostContent } from '@/components/blog/PostContent'
import { PostFaq } from '@/components/blog/PostFaq'
import { AuthorBox } from '@/components/blog/AuthorBox'
import { GuideFeedback } from '@/components/blog/GuideFeedback'
import { PostSources } from '@/components/blog/PostSources'
import { InYourArea } from '@/components/blog/InYourArea'
import { WhatItCosts } from '@/components/blog/WhatItCosts'
import { ReadNext, type NextStep } from '@/components/inner/ReadNext'
import { InnerEnding } from '@/components/inner/InnerEnding'
import { BOROUGH_DATA_PAGE, guideAreas, guideGroups } from '@/lib/guides'
import { quoteHref } from '@/lib/quote-context'
import { getAllSlugs, getPostBySlug, getRelatedPosts } from '@/lib/blog'
import { getCategory } from '@/lib/blog-categories'
import { getAuthor } from '@/lib/authors'
import { site } from '@/lib/site'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  const url = `${site.url}/blog/${post.slug}`
  const ogImage = post.ogImage ? `${site.url}${post.ogImage}` : `${site.url}/opengraph-image`
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [getAuthor(post.author)?.name ?? 'L&D Energy'],
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  }
}

/** The question a reader in each group is usually asking, for the Read next cards (board option C). */
/* Read next option A: one picture per guide group (the board's A images). */
const GROUP_IMAGE: Record<string, string> = {
  'understand-your-epc': '/inner/rn-scale.svg',
  'before-and-on-the-day': '/guides/assessor-room-720.webp',
  'letting-and-mees': '/inner/rn-landlord.svg',
  'improving-your-rating': '/guides/house-section-720.webp',
  'selling-buying-and-floor-plans': '/inner/rn-seller.svg',
}

function groupOf(slug: string) {
  for (const g of guideGroups) {
    const hit = g.guides.find((x) => x.slug === slug)
    if (hit) return { group: g, summary: hit.summary }
  }
  return null
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const category = getCategory(post.category)
  const author = getAuthor(post.author)
  const related = await getRelatedPosts(slug, 2)
  const toc = extractToc(post.content)

  const breadcrumbs = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Guides' },
    ...(category
      ? [{ href: `/blog/category/${category.slug}`, label: category.name }]
      : []),
    { href: `/blog/${post.slug}`, label: post.title },
  ]

  const url = `${site.url}/blog/${post.slug}`

  const steps: NextStep[] = [
    ...related.map((r) => {
      const g = groupOf(r.slug)
      return {
        kicker: g?.group.heading ?? 'Guide',
        title: r.title,
        text: g?.summary ?? r.description,
        href: `/blog/${r.slug}`,
        img: g ? GROUP_IMAGE[g.group.id] : undefined,
        meta: `${r.readingTime} min read`,
      }
    }),
    ...(BOROUGH_DATA_PAGE.live
      ? [{
          kicker: 'Borough figures',
          title: 'EPC ratings in every London borough',
          text: 'How homes in each borough rate, from EPCs on the GOV.UK register.',
          href: BOROUGH_DATA_PAGE.href,
          img: '/inner/rn-boroughs.svg',
        }]
      : []),
    {
      title: 'Ready to book?',
      text: 'Tell us the address and size. We confirm your exact price before you book.',
      href: quoteHref({ service: 'epc', sourcePage: 'blog', ctaId: 'inline' }),
      go: true,
    },
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

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    inLanguage: 'en-GB',
    author: author
      ? {
          '@type': 'Person',
          '@id': `${site.url}/about#assessor`,
          name: author.name,
          jobTitle: author.role,
          worksFor: { '@id': `${site.url}/#business` },
        }
      : undefined,
    publisher: { '@id': `${site.url}/#business` },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    image: post.ogImage ? `${site.url}${post.ogImage}` : `${site.url}/opengraph-image`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: post.keywords.join(', '),
    articleSection: category?.name,
    ...(post.sources.length > 0
      ? { citation: post.sources.map((s) => ({ '@type': 'CreativeWork', name: s.title, url: s.url, publisher: s.publisher })) }
      : {}),
  }

  const faqSchema =
    post.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }
      : null

  const schemas = [breadcrumbSchema, articleSchema, ...(faqSchema ? [faqSchema] : [])]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <div className="gd">
        <PostHeader
          slug={post.slug}
          crumbs={breadcrumbs}
          title={post.title}
          description={post.description}
          answer={post.answer}
          category={post.category}
          author={post.author}
          publishedAt={post.publishedAt}
          updatedAt={post.updatedAt}
          readingTime={post.readingTime}
          keyTakeaways={post.keyTakeaways}
        />
        <div className="gd-body">
          <div className="gd-w gd-body__in">
            <TableOfContents items={toc} />
            <article className="gd-art">
              {showsScale(post.slug) && <KeyTakeaways takeaways={post.keyTakeaways} />}
              <PostContent source={post.content} />
              <WhatItCosts />
              <PostFaq faqs={post.faqs} />
              <InYourArea slugs={guideAreas(post.category, post.areas)} />
              <PostSources sources={post.sources} />
              <AuthorBox author={post.author} />
              <GuideFeedback slug={post.slug} waHref={`${site.whatsappHref}?text=${encodeURIComponent(`Hi, I read your guide "${post.title}". It didn't cover: `)}`} email={site.email} emailHref={site.emailHref} />
            </article>
          </div>
        </div>
        <ReadNext steps={steps} />
      </div>
      <InnerEnding variant="a" source="blog" />
    </>
  )
}
