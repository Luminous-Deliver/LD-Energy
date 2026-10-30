import Link from 'next/link'
import { headingText, slugify } from '@/lib/heading-text'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { CTABanner } from './CTABanner'
import { EpcEffectNote } from './EpcEffectNote'
import { Price } from './Price'
import { LondonPotentialShare } from './LondonPotentialShare'
import { LondonRatingShare } from './LondonRatingShare'
import { RunningCostTable } from './RunningCosts'

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
    <div className="gd-table">
      <div className="gd-table__scroll">
        <table {...props}>{children}</table>
      </div>
      <p className="gd-table__hint" aria-hidden="true">
        Swipe sideways to see the full table
      </p>
    </div>
  ),
  img: ({ src = '', alt = '', ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={typeof src === 'string' ? src : ''} alt={alt} loading="lazy" decoding="async" {...props} />
  ),
  CTABanner,
  EpcEffectNote,
  Price,
  LondonPotentialShare,
  LondonRatingShare,
  RunningCostTable,
}

interface PostContentProps {
  source: string
}

export function PostContent({ source }: PostContentProps) {
  return (
    <div className="gd-prose">
      <MDXRemote
        source={source}
        components={components}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </div>
  )
}
