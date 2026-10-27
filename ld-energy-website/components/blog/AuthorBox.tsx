import { getAuthor } from '@/lib/authors'

interface AuthorBoxProps {
  author: string
}

export function AuthorBox({ author }: AuthorBoxProps) {
  const a = getAuthor(author)
  if (!a) return null
  return (
    <aside className="gd-author" aria-label="About the author">
      <span className="gd-author__av" aria-hidden="true">
        {a.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
      </span>
      <div>
        <p className="gd-author__k">Written by</p>
        <p className="gd-author__n">{a.name}</p>
        <p className="gd-author__r">{a.role}</p>
        <p className="gd-author__b">{a.bio}</p>
        <ul>
          {a.credentials.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
