import Link from 'next/link'
import { Clock, Calendar, RefreshCw, ShieldCheck } from 'lucide-react'
import { getAuthor } from '@/lib/authors'
import { site } from '@/lib/site'

interface PostMetaProps {
  author: string
  publishedAt: string
  updatedAt: string
  readingTime: number
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Compact byline at the top of every guide: who wrote it, both scheme IDs and the GOV.UK register
 * link, the same credentials line the area pages carry. "Updated" comes from frontmatter and moves
 * only when the content really changes (references/local-seo.md §5).
 */
export function PostMeta({ author, publishedAt, updatedAt, readingTime }: PostMetaProps) {
  const a = getAuthor(author)
  const showUpdated = updatedAt && updatedAt !== publishedAt

  return (
    <div className="mt-6 space-y-2 text-sm text-secondary-600">
      {a && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <ShieldCheck className="w-4 h-4 text-primary-600" aria-hidden="true" />
          <span>
            By{' '}
            <Link href="/about" className="font-semibold text-secondary-900 underline-offset-2 hover:underline">
              {a.name}
            </Link>
          </span>
          {site.assessor.accreditations.map((acc) => (
            <span key={acc.number}>
              {acc.short} {acc.number}
            </span>
          ))}
          <a
            href={site.assessor.verifyUrl}
            rel="noopener"
            className="underline underline-offset-2 hover:text-secondary-900"
          >
            Check the GOV.UK register
          </a>
        </p>
      )}
      <p className="flex flex-wrap items-center gap-x-5 gap-y-1">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" aria-hidden="true" />
          <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
        </span>
        {showUpdated && (
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>
              Updated <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
            </span>
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" aria-hidden="true" />
          {readingTime} min read
        </span>
      </p>
    </div>
  )
}
