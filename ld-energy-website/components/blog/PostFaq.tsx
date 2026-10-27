import { Plus } from 'lucide-react'
import type { PostFaq as PostFaqItem } from '@/lib/blog'

interface PostFaqProps {
  faqs: PostFaqItem[]
}

/** The guide's FAQ as native disclosures (the FAQPage schema is built in the page). */
export function PostFaq({ faqs }: PostFaqProps) {
  if (!faqs || faqs.length === 0) return null
  return (
    <section aria-labelledby="faq-heading" className="gd-faq">
      <h2 id="faq-heading">Frequently asked questions</h2>
      <div className="gd-faq__list">
        {faqs.map((f) => (
          <details key={f.question}>
            <summary>
              <span>{f.question}</span>
              <Plus width={20} height={20} aria-hidden="true" />
            </summary>
            <div>
              <p>{f.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
