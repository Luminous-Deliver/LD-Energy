'use client'

import { useRef, useState } from 'react'
import { Check, ChevronDown, Link2, List } from 'lucide-react'
import type { TocItem } from '@/lib/heading-text'
import { jumpTo, useScrollSpy } from '@/components/inner/useScrollSpy'

interface TableOfContentsProps {
  items: TocItem[]
  /** Sections worth sending on their own: each gets a copy-link button (prep page, Abdul 24/10/2026). */
  share?: { id: string; label: string }[]
}

/** One copy-link row per section: copies the full address with its #section, for WhatsApp or email, then goes there. */
function Share({ share, onPick }: { share: NonNullable<TableOfContentsProps['share']>; onPick?: () => void }) {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = async (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`
    try { await navigator.clipboard.writeText(url) } catch { window.prompt('Copy this link', url) }
    setCopied(id)
    // and go there, so the reader sees what they are sending (Abdul 24/10/2026)
    onPick?.()
    jumpTo(id)
    window.setTimeout(() => setCopied((c) => (c === id ? null : c)), 2000)
  }
  return (
    <div className="gd-share">
      <p className="gd-eyebrow">Copy a link to send</p>
      <ul>
        {share.map((s) => (
          <li key={s.id}>
            <button type="button" onClick={() => copy(s.id)} aria-live="polite">
              {copied === s.id ? <Check width={16} height={16} aria-hidden="true" /> : <Link2 width={16} height={16} aria-hidden="true" />}
              <span>{copied === s.id ? 'Link copied' : s.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Items({ items, active, onPick }: TableOfContentsProps & { active: string | null; onPick?: () => void }) {
  return (
    <ol>
      {items.map((item) => {
        const on = item.id === active
        return (
          <li key={item.id} className={[item.level > 2 ? 'is-sub' : '', on ? 'is-on' : ''].filter(Boolean).join(' ') || undefined}>
            <a href={`#${item.id}`} aria-current={on ? 'location' : undefined} onClick={(e) => { jumpTo(item.id, e); onPick?.() }}>{item.text}</a>
          </li>
        )
      })}
    </ol>
  )
}

/**
 * Contents: a sticky disclosure on phones and tablets that names the section being read, a sticky rail beside the
 * article from 1100 px with that section marked (Abdul 23/10: the titles should follow the reader).
 */
export function TableOfContents({ items, share }: TableOfContentsProps) {
  const ids = (items ?? []).map((i) => i.id)
  const active = useScrollSpy(ids)
  const details = useRef<HTMLDetailsElement>(null)
  if (!items || items.length === 0) return null
  const sections = items.filter((i) => i.level <= 2).length
  // a sub-heading reports its parent section in the phone summary
  const idx = items.findIndex((i) => i.id === active)
  const current = idx < 0 ? null : items.slice(0, idx + 1).reverse().find((i) => i.level <= 2) ?? items[idx]
  return (
    <nav aria-label="Table of contents" className="gd-toc">
      <details ref={details}>
        <summary>
          <List width={18} height={18} aria-hidden="true" />
          <span className="gd-toc__now">
            <span className="gd-toc__lbl">On this page</span>
            {current && <span className="gd-toc__cur">{current.text}</span>}
          </span>
          <span className="n num">{sections} sections</span>
          <ChevronDown className="chev" width={18} height={18} aria-hidden="true" />
        </summary>
        <Items items={items} active={active} onPick={() => { if (details.current) details.current.open = false }} />
        {share && share.length > 0 && <Share share={share} onPick={() => { if (details.current) details.current.open = false }} />}
      </details>
      <div className="gd-toc__rail">
        <p className="gd-eyebrow">On this page</p>
        <Items items={items} active={active} />
        {share && share.length > 0 && <Share share={share} />}
      </div>
    </nav>
  )
}
