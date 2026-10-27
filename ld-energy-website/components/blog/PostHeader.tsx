import Link from 'next/link'
import { Calendar, CheckCircle2, Clock, RefreshCw, ShieldCheck } from 'lucide-react'
import { getCategory } from '@/lib/blog-categories'
import { getAuthor } from '@/lib/authors'
import { site } from '@/lib/site'
import { GuideCrumbs, type Crumb } from './GuideCrumbs'
import { GuideScale } from './GuideScale'

/**
 * Guides where the A to G scale is the point of the page or the letting minimum is the subject. The others show
 * their key takeaways beside the answer instead (board option A, generalised to every guide).
 */
const SCALE_GUIDES = new Set([
  'epc-ratings-explained',
  'why-is-my-epc-different',
  'epc-for-landlords-2026',
  'mees-regulations-2026',
  'mees-timeline-2026-2030',
  'epc-c-by-2030',
  'how-to-improve-epc-rating',
])

export function showsScale(slug: string): boolean {
  return SCALE_GUIDES.has(slug)
}

interface PostHeaderProps {
  slug: string
  crumbs: Crumb[]
  title: string
  description: string
  /** The direct answer (plan §8.2). Shown in place of the description when a post has one. */
  answer: string
  category: string
  author: string
  publishedAt: string
  updatedAt: string
  readingTime: number
  keyTakeaways: string[]
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Guide hero, board option A (Abdul 23/10/2026): the title, the short answer, who wrote it; the scale beside. */
export function PostHeader({
  slug,
  crumbs,
  title,
  description,
  answer,
  category,
  author,
  publishedAt,
  updatedAt,
  readingTime,
  keyTakeaways,
}: PostHeaderProps) {
  const cat = getCategory(category)
  const a = getAuthor(author)
  const showUpdated = updatedAt && updatedAt !== publishedAt
  const scale = showsScale(slug)

  return (
    <header className="gd-hero">
      <div className="gd-w gd-hero__in">
        <div className="gd-hero__copy">
          <GuideCrumbs items={crumbs} />
          {cat && (
            <Link href={`/blog/category/${cat.slug}`} className="gd-eyebrow gd-hero__kick">
              {cat.name}
            </Link>
          )}
          <h1>{title}</h1>
          <div className="gd-answer">
            <p className="gd-eyebrow">The short answer</p>
            <p data-answer-first={answer ? '' : undefined}>{answer || description}</p>
          </div>
          {a && (
            <p className="gd-by">
              <ShieldCheck width={18} height={18} aria-hidden="true" />
              <span>
                By{' '}
                <Link href="/about" className="gd-by__name">
                  {a.name}
                </Link>
                , Elmhurst and Quidos accredited assessor,{' '}
                <span className="num">{site.assessor.accreditations.map((acc) => acc.number).join(' · ')}</span>.{' '}
                <a href={site.assessor.verifyUrl} rel="noopener" className="gd-link">
                  Check the GOV.UK register
                </a>
              </span>
            </p>
          )}
          <p className="gd-meta">
            <span>
              <Calendar width={16} height={16} aria-hidden="true" />
              <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
            </span>
            {showUpdated && (
              <span>
                <RefreshCw width={16} height={16} aria-hidden="true" />
                <span>
                  Updated <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
                </span>
              </span>
            )}
            <span>
              <Clock width={16} height={16} aria-hidden="true" />
              <span className="num">{readingTime}</span> min read
            </span>
          </p>
        </div>
        <div className="gd-hero__aside">
          {scale ? (
            <GuideScale />
          ) : keyTakeaways.length > 0 ? (
            <aside className="gd-short" aria-label="Key takeaways">
              <p className="gd-eyebrow">In short</p>
              <ul>
                {keyTakeaways.map((t) => (
                  <li key={t}>
                    <CheckCircle2 width={18} height={18} aria-hidden="true" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>
      </div>
    </header>
  )
}
