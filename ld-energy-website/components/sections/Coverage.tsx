import { quoteHref } from '@/lib/quote-context'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { boroughMeta } from '@/lib/boroughs'

const groups: { region: string; slugs: string[] }[] = [
  {
    region: 'East London',
    slugs: ['stratford', 'tower-hamlets', 'newham', 'hackney', 'barking-dagenham', 'waltham-forest'],
  },
  {
    region: 'North London',
    slugs: ['islington', 'camden', 'enfield', 'haringey', 'barnet'],
  },
  {
    region: 'South London',
    slugs: ['greenwich', 'southwark', 'lewisham', 'lambeth', 'wandsworth', 'croydon'],
  },
  {
    region: 'West & Central',
    slugs: ['westminster', 'brent', 'ealing', 'hounslow', 'richmond'],
  },
]

export function Coverage() {
  return (
    <Section variant="muted" tier="compact" id="areas" className="scroll-mt-20 md:scroll-mt-24">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
          <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
          Coverage · London-wide
        </div>
        <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-secondary-900">
          Areas We Cover
        </h2>
        <p className="mt-4 text-lg text-secondary-700 leading-relaxed">
          Based in Stratford (E15), we provide Elmhurst-accredited EPC assessments across East, North, South and West London, every one of the 32 boroughs, plus surrounding areas within a 1.5-hour radius.
        </p>
      </div>

      <div className="mt-8 md:hidden rounded-2xl bg-white ring-1 ring-secondary-200 p-5 shadow-sm text-center">
        <p className="text-secondary-800 font-medium leading-relaxed">
          Based in Stratford, we cover all <span className="font-bold text-primary-700">32 London boroughs</span> across East, North, South, and West London.
        </p>
        <Link href="/areas" className="mt-3 inline-flex min-h-[44px] items-center font-semibold text-primary-700 hover:text-primary-800">
          View all specific areas &rarr;
        </Link>
      </div>

      <div className="hidden md:block mt-10 space-y-8">
        {groups.map((group) => (
          <div key={group.region}>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-secondary-900">
              {group.region}
              <span className="h-px flex-1 bg-gradient-to-r from-primary-200 to-transparent" aria-hidden="true" />
            </h3>
            <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {group.slugs.map((slug) => {
                const borough = boroughMeta[slug]
                if (!borough) return null
                return (
                  <li key={slug}>
                    <Link
                      href={`/areas/${slug}`}
                      className="group flex items-center justify-between min-h-[44px] rounded-xl bg-white ring-1 ring-secondary-200 px-4 py-3 text-sm font-medium text-secondary-800 hover:ring-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    >
                      <span className="truncate">{borough.name}</span>
                      <ArrowUpRight className="w-4 h-4 shrink-0 text-secondary-300 group-hover:text-primary-500 transition-colors" aria-hidden="true" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="hidden md:flex mt-8 flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <Link
          href="/areas"
          className="inline-flex items-center gap-1.5 min-h-[44px] text-primary-700 font-semibold hover:text-primary-800"
        >
          View all areas
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
        <p className="text-sm text-secondary-600">
          Don&apos;t see your area? We cover all 32 boroughs,{' '}
          <Link href={quoteHref({ sourcePage: 'home', ctaId: 'inline' })} className="font-semibold text-primary-700 hover:text-primary-800">
            get in touch
          </Link>
          .
        </p>
      </div>
    </Section>
  )
}
