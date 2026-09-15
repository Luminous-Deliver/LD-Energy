import Link from 'next/link'
import { headingText, slugify } from '@/lib/heading-text'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { CTABanner } from './CTABanner'
import { EpcEffectNote } from './EpcEffectNote'

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>
type TableProps = React.TableHTMLAttributes<HTMLTableElement>

function isInternal(href: string): boolean {
  return href.startsWith('/') || href.startsWith('#')
}

const components = {
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = headingText(children)
    const id = slugify(text)
    return (
      <h2 id={id} {...props}>
        {children}
      </h2>
    )
  },
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = headingText(children)
    const id = slugify(text)
    return (
      <h3 id={id} {...props}>
        {children}
      </h3>
    )
  },
  a: ({ href = '', children, ...props }: AnchorProps) => {
    if (isInternal(href)) {
      return (
        <Link href={href} {...(props as Record<string, unknown>)}>
          {children}
        </Link>
      )
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  },
  table: ({ children, ...props }: TableProps) => (
    <div className="not-prose my-8">
      <div className="-mx-4 sm:mx-0 overflow-x-auto overscroll-x-contain px-4 sm:px-0 [scrollbar-width:thin]">
        <table
          className="w-full min-w-[640px] border-collapse text-sm md:text-base"
          {...props}
        >
          {children}
        </table>
      </div>
      <p className="mt-2 text-xs font-medium text-secondary-600 sm:hidden" aria-hidden="true">
        Swipe sideways to see the full table
      </p>
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-secondary-50" {...props} />
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="text-left font-semibold text-secondary-900 px-3 md:px-4 py-2.5 md:py-3 border border-secondary-200 whitespace-nowrap"
      {...props}
    />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="px-3 md:px-4 py-2.5 md:py-3 border border-secondary-200 align-top text-secondary-800"
      {...props}
    />
  ),
  img: ({ src = '', alt = '', ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={typeof src === 'string' ? src : ''}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="my-6 h-auto w-full rounded-lg border border-secondary-200"
      {...props}
    />
  ),
  CTABanner,
  EpcEffectNote,
}

interface PostContentProps {
  source: string
}

export function PostContent({ source }: PostContentProps) {
  return (
    <div className="prose-blog">
      <MDXRemote
        source={source}
        components={components}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </div>
  )
}
