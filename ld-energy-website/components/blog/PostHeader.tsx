import { Container } from '@/components/ui/Container'
import { PostMeta } from './PostMeta'
import { getCategory } from '@/lib/blog-categories'
import Link from 'next/link'

interface PostHeaderProps {
  title: string
  description: string
  /** The direct answer (plan §8.2). Shown in place of the description when a post has one. */
  answer: string
  category: string
  author: string
  publishedAt: string
  updatedAt: string
  readingTime: number
}

export function PostHeader({
  title,
  description,
  answer,
  category,
  author,
  publishedAt,
  updatedAt,
  readingTime,
}: PostHeaderProps) {
  const cat = getCategory(category)
  return (
    <header className="bg-gradient-to-b from-primary-50 via-white to-white border-b border-secondary-100">
      <Container className="py-10 md:py-14 max-w-5xl">
        {cat && (
          <Link
            href={`/blog/category/${cat.slug}`}
            className="inline-flex items-center text-xs uppercase tracking-wide font-semibold text-primary-700 hover:text-primary-800"
          >
            {cat.name}
          </Link>
        )}
        <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight text-secondary-900">
          {title}
        </h1>
        {answer ? (
          <p data-answer-first className="mt-5 max-w-3xl text-lg text-secondary-800 leading-relaxed">
            {answer}
          </p>
        ) : (
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">{description}</p>
        )}
        <PostMeta
          author={author}
          publishedAt={publishedAt}
          updatedAt={updatedAt}
          readingTime={readingTime}
        />
      </Container>
    </header>
  )
}
