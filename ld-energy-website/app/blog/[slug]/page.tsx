import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { PostHeader } from '@/components/blog/PostHeader'
import { KeyTakeaways } from '@/components/blog/KeyTakeaways'
import { TableOfContents, extractToc } from '@/components/blog/TableOfContents'
import { PostContent } from '@/components/blog/PostContent'
import { CTABanner } from '@/components/blog/CTABanner'
import { PostFaq } from '@/components/blog/PostFaq'
import { AuthorBox } from '@/components/blog/AuthorBox'
import { RelatedPosts } from '@/components/blog/RelatedPosts'
import { getAllSlugs, getPostBySlug, getRelatedPosts } from '@/lib/blog'
import { getCategory } from '@/lib/blog-categories'
import { getAuthor } from '@/lib/authors'
import { site, priceFrom, EXPRESS_SURCHARGE } from '@/lib/site'

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

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const category = getCategory(post.category)
  const author = getAuthor(post.author)
  const related = await getRelatedPosts(slug, 3)
  const toc = extractToc(post.content)

  const breadcrumbs = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Blog' },
    ...(category
      ? [{ href: `/blog/category/${category.slug}`, label: category.name }]
      : []),
    { href: `/blog/${post.slug}`, label: post.title },
  ]

  const url = `${site.url}/blog/${post.slug}`

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
      <BreadcrumbNav items={breadcrumbs} />
      <PostHeader
        title={post.title}
        description={post.description}
        category={post.category}
        author={post.author}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        readingTime={post.readingTime}
      />
      <article className="py-10 md:py-14">
        <Container className="max-w-5xl">
          <KeyTakeaways takeaways={post.keyTakeaways} />
          <TableOfContents items={toc} />
          <PostContent source={post.content} />
          <PostFaq faqs={post.faqs} />
          <AuthorBox author={post.author} />
          <RelatedPosts posts={related} />
          <CTABanner
            variant="final"
            heading="Need an EPC? Book in 60 seconds."
            body={`Elmhurst-accredited assessor. Guide prices from £${priceFrom.epc}. Lodged within 72 hours, or next day for £${EXPRESS_SURCHARGE} extra.`}
          />
        </Container>
      </article>
    </>
  )
}
