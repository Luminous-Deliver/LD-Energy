import type { PostSource } from '@/lib/blog'

function ukDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return d && m && y ? `${d}/${m}/${y}` : iso
}

/** Primary documents a guide relies on, each with the date it was opened and checked (plan §8.5). */
export function PostSources({ sources }: { sources: PostSource[] }) {
  if (sources.length === 0) return null
  return (
    <section aria-labelledby="sources" className="gd-src">
      <h2 id="sources">Sources</h2>
      <ol>
        {sources.map((s) => (
          <li key={s.url}>
            <span>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title}
              </a>
              , {s.publisher}. Checked <span className="num">{ukDate(s.checked)}</span>.
              {s.note && <span className="n">{s.note}</span>}
            </span>
          </li>
        ))}
      </ol>
      <p className="gd-src__ogl">Crown copyright material is used under the Open Government Licence v3.0.</p>
    </section>
  )
}
