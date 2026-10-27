import { CheckCircle2 } from 'lucide-react'

interface KeyTakeawaysProps {
  takeaways: string[]
}

export function KeyTakeaways({ takeaways }: KeyTakeawaysProps) {
  if (!takeaways || takeaways.length === 0) return null
  return (
    <aside aria-labelledby="key-takeaways" className="gd-take">
      <h2 id="key-takeaways">Key takeaways</h2>
      <ul>
        {takeaways.map((t) => (
          <li key={t}>
            <CheckCircle2 width={20} height={20} aria-hidden="true" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
