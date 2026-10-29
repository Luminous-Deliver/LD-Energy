import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Home, Flame, Grid2x2, Thermometer, Lightbulb, Gauge } from 'lucide-react'

const items = [
  {
    Icon: Home,
    title: 'All rooms',
    body: 'Including the loft hatch, any outbuildings and locked or storage rooms.',
  },
  {
    Icon: Flame,
    title: 'Heating systems',
    body: 'Boiler, cylinder and controls — plus the manual or model number if you have it.',
  },
  {
    Icon: Grid2x2,
    title: 'All windows',
    body: 'Every window and external door, so glazing type and age can be recorded.',
  },
  {
    Icon: Thermometer,
    title: 'All radiators',
    body: 'Clear enough access to see each one, including behind furniture or curtains.',
  },
  {
    Icon: Lightbulb,
    title: 'All lights',
    body: 'Fittings need to be visible so low-energy versus halogen can be counted.',
  },
  {
    Icon: Gauge,
    title: 'Electricity meters',
    body: 'Including the meter cupboard key if it’s a communal or external box.',
  },
]

export function WhatToHaveReady({ heading = true }: { heading?: boolean } = {}) {
  return (
    <Section variant="default" tier="secondary" id="what-to-have-ready" className="scroll-mt-24 md:scroll-mt-28">
      {heading && (
      <div className="max-w-3xl">
        <SectionHeader
          eyebrow="Before the visit"
          heading="What to have ready"
        />
        <p className="mt-4 text-lg text-secondary-700 leading-relaxed">
          Most surveys take 45–60 minutes when everything below is reachable, or up to 90 minutes for a
          large 5+ bedroom home. A quick tidy beforehand
          genuinely helps — if a sofa is pushed against a radiator or a bed sits under a window, please
          move it before we arrive. If something isn’t accessible on the day it usually means a second visit.
        </p>
      </div>
      )}

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ Icon, title, body }) => (
          <li
            key={title}
            className="rounded-2xl border border-secondary-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-premium"
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 text-primary-700 ring-1 ring-primary-100">
              <Icon className="w-5 h-5" aria-hidden="true" />
            </span>
            <h3 className="mt-3 text-base font-bold text-secondary-900">{title}</h3>
            <p className="mt-1.5 text-sm text-secondary-600 leading-relaxed">{body}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div id="tenanted-properties" className="scroll-mt-24 rounded-2xl border border-primary-200 bg-primary-50/60 p-5 md:scroll-mt-28">
          <p className="text-sm leading-relaxed text-secondary-800">
            <strong className="font-semibold text-secondary-900">Tenanted property?</strong>{' '}
            Please arrange the visit with your tenants and give them proper notice — they’ll need to
            let us in and have the rooms accessible. If that’s difficult, send us their contact
            details and we’ll sort it out with them. Evening and weekend slots are available at no
            extra cost.
          </p>
        </div>
        <div className="rounded-2xl border border-accent-200 bg-accent-50/60 p-5">
          <p className="text-sm leading-relaxed text-secondary-800">
            <strong className="font-semibold text-secondary-900">More than one property?</strong>{' '}
            If you own several in the same area, they can be grouped into a single visit rather than
            booked one at a time — quicker for you, and it usually means a discount. Tell us the
            postcodes when you enquire and we’ll quote the whole set together.
          </p>
        </div>
      </div>
    </Section>
  )
}
