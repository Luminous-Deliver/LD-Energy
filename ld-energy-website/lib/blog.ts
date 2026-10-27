import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { fillPrices } from './guide-prices'

export interface PostFaq {
  question: string
  answer: string
}

/** A primary source cited at the foot of a guide, opened and checked on `checked` (YYYY-MM-DD). */
export interface PostSource {
  title: string
  publisher: string
  url: string
  checked: string
  /** What the guide takes from it, in a few words. */
  note?: string
}

export interface Post {
  slug: string
  title: string
  description: string
  /** The 60-90 word direct answer shown under the H1 (plan §8.2). Empty until a post is refreshed. */
  answer: string
  category: string
  tags: string[]
  publishedAt: string
  updatedAt: string
  author: string
  featured: boolean
  ogImage?: string
  keywords: string[]
  keyTakeaways: string[]
  faqs: PostFaq[]
  relatedPosts: string[]
  sources: PostSource[]
  /** Area page slugs for the "In your area" block; empty means the category default. */
  areas: string[]
  readingTime: number
  content: string
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

function readPostFile(slug: string): Post | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf8')
  const parsed = matter(raw)
  const data = parsed.data
  // L&D prices are written as {price:key} tokens and filled from lib/site.ts (lib/guide-prices.ts).
  // The body is filled too, so tokens inside component props such as CTABanner's body work.
  const content = fillPrices(parsed.content)
  const text = (v: unknown) => fillPrices(String(v ?? ''))
  const stats = readingTime(content)

  return {
    slug,
    title: String(data.title ?? ''),
    description: text(data.description),
    answer: text(data.answer),
    category: String(data.category ?? ''),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    publishedAt: String(data.publishedAt ?? ''),
    updatedAt: String(data.updatedAt ?? data.publishedAt ?? ''),
    author: String(data.author ?? 'abdul-taher'),
    featured: Boolean(data.featured),
    ogImage: data.ogImage ? String(data.ogImage) : undefined,
    keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
    keyTakeaways: Array.isArray(data.keyTakeaways) ? data.keyTakeaways.map(text) : [],
    faqs: Array.isArray(data.faqs)
      ? data.faqs.map((f: { question: string; answer: string }) => ({
          question: text(f.question),
          answer: text(f.answer),
        }))
      : [],
    relatedPosts: Array.isArray(data.relatedPosts) ? data.relatedPosts.map(String) : [],
    sources: Array.isArray(data.sources)
      ? data.sources.map((s: Record<string, unknown>) => ({
          title: String(s.title ?? ''),
          publisher: String(s.publisher ?? ''),
          url: String(s.url ?? ''),
          checked: String(s.checked ?? ''),
          note: s.note ? String(s.note) : undefined,
        }))
      : [],
    areas: Array.isArray(data.areas) ? data.areas.map(String) : [],
    readingTime: Math.max(1, Math.round(stats.minutes)),
    content,
  }
}

export async function getAllPosts(): Promise<Post[]> {
  if (!fs.existsSync(BLOG_DIR)) return []
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'))
  const posts = files
    .map((f) => readPostFile(f.replace(/\.mdx$/, '')))
    .filter((p): p is Post => p !== null)
  return posts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return readPostFile(slug)
}

export async function getPostsByCategory(slug: string): Promise<Post[]> {
  const posts = await getAllPosts()
  return posts.filter((p) => p.category === slug)
}

export async function getRelatedPosts(slug: string, limit = 3): Promise<Post[]> {
  const post = await getPostBySlug(slug)
  if (!post) return []
  const all = await getAllPosts()

  // Prefer explicit related posts in frontmatter
  const explicit = post.relatedPosts
    .map((s) => all.find((p) => p.slug === s))
    .filter((p): p is Post => p !== undefined)

  if (explicit.length >= limit) return explicit.slice(0, limit)

  // Fill with same category
  const sameCat = all.filter(
    (p) => p.slug !== slug && p.category === post.category && !explicit.includes(p),
  )
  return [...explicit, ...sameCat].slice(0, limit)
}

export async function getFeaturedPosts(limit = 3): Promise<Post[]> {
  const all = await getAllPosts()
  return all.filter((p) => p.featured).slice(0, limit)
}

export async function getAllSlugs(): Promise<string[]> {
  const posts = await getAllPosts()
  return posts.map((p) => p.slug)
}
