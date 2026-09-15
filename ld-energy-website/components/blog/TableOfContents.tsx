import type { TocItem } from '@/lib/heading-text'
export { extractToc } from '@/lib/heading-text'

interface TableOfContentsProps {
  items: TocItem[]
}

export function TableOfContents({ items }: TableOfContentsProps) {
  if (!items || items.length === 0) return null
  return (
    <nav aria-label="Table of contents" className="not-prose my-8 rounded-lg border border-secondary-200 bg-white p-5">
      <p className="text-xs uppercase tracking-wide font-semibold text-secondary-500 mb-3">
        On this page
      </p>
      <ol className="space-y-1.5 text-sm">
        {items.map((item) => (
          <li key={item.id} className={item.level > 2 ? 'pl-4' : ''}>
            <a
              href={`#${item.id}`}
              className="text-secondary-700 hover:text-primary-700 hover:underline"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
