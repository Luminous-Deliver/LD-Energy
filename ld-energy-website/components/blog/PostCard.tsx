import Link from 'next/link'
import { Clock } from 'lucide-react'
import { getCategory } from '@/lib/blog-categories'
import { guideGroupOf } from '@/lib/guides'
import { getAuthor } from '@/lib/authors'
import type { Post } from '@/lib/blog'

interface PostCardProps {
  post: Post
  featured?: boolean
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const cat = getCategory(post.category)
  const group = guideGroupOf(post.slug)
  const author = getAuthor(post.author)
  return (
    <article
      className={`relative group flex flex-col h-full rounded-lg border border-secondary-200 bg-white overflow-hidden transition-shadow hover:shadow-md ${
        featured ? 'md:flex-row md:col-span-2' : ''
      }`}
    >
      <div className={`flex flex-col flex-1 p-5 md:p-6 ${featured ? 'md:p-8' : ''}`}>
        {(group || cat) && (
          <Link
            href={group ? `/guides#${group.id}` : '/guides'}
            className="relative z-10 text-xs uppercase tracking-wide font-semibold text-primary-700 hover:text-primary-800 self-start"
          >
            {group?.heading ?? cat?.name}
          </Link>
        )}
        <h3
          className={`mt-3 font-bold text-secondary-900 group-hover:text-primary-700 transition-colors ${
            featured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'
          }`}
        >
          <Link href={`/guides/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        <p className="mt-3 text-secondary-700 leading-relaxed line-clamp-3 flex-1">
          {post.description}
        </p>
        <div className="mt-5 flex items-center gap-3 text-xs text-secondary-500">
          {author && <span className="font-medium text-secondary-700">{author.name}</span>}
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            {post.readingTime} min
          </span>
        </div>
      </div>
    </article>
  )
}
