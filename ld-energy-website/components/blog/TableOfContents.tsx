import { ChevronDown, List } from 'lucide-react'
import type { TocItem } from '@/lib/heading-text'
export { extractToc } from '@/lib/heading-text'

interface TableOfContentsProps {
  items: TocItem[]
}

function Items({ items }: TableOfContentsProps) {
  return (
    <ol>
      {items.map((item) => (
        <li key={item.id} className={item.level > 2 ? 'is-sub' : undefined}>
          <a href={`#${item.id}`}>{item.text}</a>
        </li>
      ))}
    </ol>
  )
}

/** Contents: a disclosure on phones and tablets, a sticky rail beside the article from 1100 px. */
export function TableOfContents({ items }: TableOfContentsProps) {
  if (!items || items.length === 0) return null
  const sections = items.filter((i) => i.level <= 2).length
  return (
    <nav aria-label="Table of contents" className="gd-toc">
      <details>
        <summary>
          <List width={18} height={18} aria-hidden="true" />
          <span>On this page</span>
          <span className="n num">{sections} sections</span>
          <ChevronDown className="chev" width={18} height={18} aria-hidden="true" />
        </summary>
        <Items items={items} />
      </details>
      <div className="gd-toc__rail">
        <p className="gd-eyebrow">On this page</p>
        <Items items={items} />
      </div>
    </nav>
  )
}
