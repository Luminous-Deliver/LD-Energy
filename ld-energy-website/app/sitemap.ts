import type { MetadataRoute } from 'next'
import { site, boroughs } from '@/lib/site'
import { getAllPosts, getPostsByCategory } from '@/lib/blog'
import { categories } from '@/lib/blog-categories'

const staticRoutes: Array<{ path: string; priority: number; changeFreq: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '/',                        priority: 1.0, changeFreq: 'weekly'  },
  { path: '/services/domestic-epc',   priority: 0.9, changeFreq: 'monthly' },
  { path: '/domestic-energy-assessor-london', priority: 0.9, changeFreq: 'monthly' },
  { path: '/services/floor-plans',    priority: 0.9, changeFreq: 'monthly' },
  { path: '/services/epc-improvement-plan', priority: 0.8, changeFreq: 'monthly' },
  { path: '/landlords',               priority: 0.8, changeFreq: 'monthly' },
  { path: '/sellers',                 priority: 0.8, changeFreq: 'monthly' },
  { path: '/estate-agents',           priority: 0.8, changeFreq: 'monthly' },
  { path: '/pricing',                 priority: 0.8, changeFreq: 'monthly' },
  { path: '/areas',                   priority: 0.7, changeFreq: 'monthly' },
  { path: '/faq',                     priority: 0.7, changeFreq: 'monthly' },
  { path: '/preparing-for-your-epc',  priority: 0.6, changeFreq: 'monthly' },
  { path: '/about',                   priority: 0.6, changeFreq: 'monthly' },
  { path: '/contact',                 priority: 0.8, changeFreq: 'monthly' },
  { path: '/blog',                    priority: 0.8, changeFreq: 'weekly'  },
  { path: '/privacy-policy',          priority: 0.3, changeFreq: 'yearly'  },
  { path: '/terms',                   priority: 0.3, changeFreq: 'yearly'  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // No `lastModified` for routes without a real edit-date source below — an
  // every-request "now" stamp is indistinguishable from an actually-changed
  // page and makes the field useless as a freshness signal. Only blog posts
  // carry a genuine date (front-matter), so only they set one.
  const static_ = staticRoutes.map(({ path, priority, changeFreq }) => ({
    url: `${site.url}${path}`,
    changeFrequency: changeFreq,
    priority,
  }))

  const boroughPages = boroughs.map((slug) => ({
    url: `${site.url}/areas/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const posts = await getAllPosts()
  const postPages = posts.map((post) => {
    const dateStr = post.updatedAt || post.publishedAt
    return {
      url: `${site.url}/blog/${post.slug}`,
      // Omit rather than fabricate a date if a post is somehow missing both —
      // frontmatter should always set publishedAt, but don't emit an Invalid Date if not.
      ...(dateStr ? { lastModified: new Date(dateStr) } : {}),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }
  })

  // Mirror the category page's own noindex rule (app/blog/category/[category]/page.tsx):
  // don't submit a category to the sitemap while Google is being told not to index it.
  const categoriesWithPosts = await Promise.all(
    categories.map(async (cat) => ({ cat, count: (await getPostsByCategory(cat.slug)).length }))
  )
  const categoryPages = categoriesWithPosts
    .filter(({ count }) => count > 0)
    .map(({ cat }) => ({
      url: `${site.url}/blog/category/${cat.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))

  return [...static_, ...boroughPages, ...postPages, ...categoryPages]
}
