import type { Metadata } from 'next'
import { FooterA, FooterB, FooterC } from '@/components/layout/FooterOptions'
import './footer-options.css'

// Review page for Abdul's footer pick (29/10/2026). Preview branch only; never merged to main.
export const metadata: Metadata = { title: 'Footer options', robots: { index: false, follow: false } }

const options = [
  { id: 'a', name: 'A. Rounded panel, phone first, big wordmark', note: 'Monzo-style panel lifts off the page; the phone number is the biggest thing; the L&D ENERGY wordmark closes the site.', Footer: FooterA },
  { id: 'b', name: 'B. The coverage map', note: 'Every borough on the map is a link to its page, Stratford is marked. Shows where you work at a glance, for people and for search.', Footer: FooterB },
  { id: 'c', name: 'C. Light footer, sage contact card', note: 'Stays on the paper colour like the rest of the site; a sage card asks "Questions before you book?" with call, WhatsApp and quote.', Footer: FooterC },
]

export default function FooterOptionsPage() {
  return (
    <div className="fo-page bg-stone-50 pt-28">
      {options.map(({ id, name, note, Footer }) => (
        <section key={id} id={id} className="pb-24">
          <div className="mx-auto max-w-[1216px] px-4 pb-8 sm:px-6 lg:px-8">
            <h1 className="font-serif text-3xl text-stone-900">{name}</h1>
            <p className="mt-2 max-w-[70ch] text-stone-700">{note}</p>
          </div>
          <Footer />
        </section>
      ))}
    </div>
  )
}
