import Link from 'next/link'

export interface Crumb {
  href: string
  label: string
}

/** Breadcrumbs inside the page's own header (the schema stays in each page's JSON-LD). */
export function GuideCrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="gd-crumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, i) => (
          <li key={item.href}>
            {i < items.length - 1 ? (
              <>
                <Link href={item.href}>{item.label}</Link>
                <span className="sep" aria-hidden="true">›</span>
              </>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
