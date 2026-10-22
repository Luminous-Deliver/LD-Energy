import Link from 'next/link'
import { cn } from '@/lib/cn'
import { ArrowUpRight } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { getFeaturedPosts } from '@/lib/blog'

export async function FromTheBlog() {
  const posts = await getFeaturedPosts(3)
  if (posts.length === 0) return null

  return (
    <Section variant="muted" tier="compact">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
            <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
            EPC Guides &amp; Advice
          </div>
          <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-secondary-900">
            Understand your EPC before you book
          </h2>
          <p className="mt-3 max-w-xl text-secondary-600">
            Plain-English guides on ratings, MEES rules and improving your score, written by an Elmhurst and Quidos accredited London assessor.
          </p>
        </div>
        <Link
          href="/blog"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-primary-700 transition-colors hover:text-primary-800"
        >
          Read all guides
          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {posts.map((post, idx) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className={cn(
              'group flex flex-col rounded-2xl border border-secondary-200 bg-white p-5 transition-all hover:border-primary-300 hover:shadow-premium',
              // Lowest-intent content on the page: one guide on phones, all three
              // from tablet up. The full list is one tap away at /blog.
              idx > 0 && 'hidden md:flex',
            )}
          >
            <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">
              {post.category}
            </p>
            <h3 className="mt-2 text-lg font-bold tracking-tight text-secondary-900 group-hover:text-primary-700">
              {post.title}
            </h3>
            <p className="mt-2 flex-1 text-sm text-secondary-600 line-clamp-3">
              {post.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-700">
              Read more
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </Section>
  )
}
