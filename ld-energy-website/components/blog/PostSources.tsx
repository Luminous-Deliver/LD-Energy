import type { PostSource } from '@/lib/blog'

function ukDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return d && m && y ? `${d}/${m}/${y}` : iso
}

/** Primary documents a guide relies on, each with the date it was opened and checked (plan §8.5). */
export function PostSources({ sources }: { sources: PostSource[] }) {
  if (sources.length === 0) return null
  return (
    <section aria-labelledby="sources" className="not-prose mt-12">
      <h2 id="sources" className="text-xl md:text-2xl font-bold text-secondary-900">
        Sources
      </h2>
      <ol className="mt-4 space-y-3 text-sm text-secondary-700">
        {sources.map((s) => (
          <li key={s.url} className="break-words">
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-700 underline underline-offset-2 hover:text-primary-800">
              {s.title}
            </a>
            <span className="text-secondary-600">, {s.publisher}. Checked {ukDate(s.checked)}.</span>
            {s.note && <span className="block text-secondary-600">{s.note}</span>}
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-secondary-500">
        Crown copyright material is used under the Open Government Licence v3.0.
      </p>
    </section>
  )
}
