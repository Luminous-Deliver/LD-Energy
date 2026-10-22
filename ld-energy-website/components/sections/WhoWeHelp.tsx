import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ArrowRight, Award, BadgePoundSterling, Zap, MapPin } from 'lucide-react'
import { SAME_DAY_LODGEMENT_SURCHARGE } from '@/lib/site'

/**
 * Audience routing, with the four differentiators that previously lived in a
 * separate "Why choose us" section folded in beneath. The two sections were
 * adjacent, addressed the same audience and did the same job, so together they
 * consumed roughly 1,500px of scroll to deliver one section's information.
 */
const audiences = [
  {
    title: 'Homeowners & sellers',
    body: 'Selling or letting? A valid EPC is required before the property is marketed. We survey, lodge and explain the rating in plain English.',
    kicker: 'Ready before your listing goes live',
    href: '/sellers',
  },
  {
    title: 'Landlords',
    body: 'Rented homes must reach at least band E. We flag properties at risk, work politely around tenants, and explain what would lift a low rating.',
    kicker: 'MEES compliance, handled',
    href: '/landlords',
  },
  {
    title: 'Estate & letting agents',
    body: 'Instruct today, list this week. EPCs and floor plans come back correctly formatted for the portals, so nothing holds up a launch.',
    kicker: 'Priority slots for agencies',
    href: '/estate-agents',
  },
  {
    title: 'Property portfolios',
    body: 'Batched by postcode, with volume rates once you are booking regularly and one invoice carrying a per-property breakdown.',
    kicker: 'Bulk EPCs and floor plans',
    href: '/estate-agents',
  },
]

const reasons = [
  {
    Icon: Award,
    title: 'Elmhurst and Quidos accredited',
    body: 'Lodged on the government register by a named, verifiable assessor.',
  },
  {
    Icon: BadgePoundSterling,
    title: 'No surprise pricing',
    body: 'Guide prices up front, exact quote before booking. No call-out fees.',
  },
  {
    Icon: Zap,
    title: 'Fast and flexible',
    body: `72-hour standard, same day for £${SAME_DAY_LODGEMENT_SURCHARGE}. Seven days a week.`,
  },
  {
    Icon: MapPin,
    title: 'Local and reliable',
    body: 'Stratford-based, covering every borough. We answer the phone.',
  },
]

export function WhoWeHelp() {
  return (
    <Section variant="muted" tier="secondary" id="who-we-help" className="scroll-mt-20 md:scroll-mt-24">
      <SectionHeader
        eyebrow="Who we help"
        heading="Built around why you need one"
        intro="Whatever the reason for your EPC, the process is shaped around it."
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {audiences.map((a) => (
          <Link
            key={a.title}
            href={a.href}
            className="group flex flex-col rounded-2xl border border-secondary-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-premium"
          >
            <h3 className="text-lg font-bold text-secondary-900 group-hover:text-primary-700">
              {a.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-secondary-600">{a.body}</p>
            <span className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-primary-700">
              {a.kicker}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </Link>
        ))}
      </div>

      {/* Differentiators from the former Why-choose-us section. Deliberately
          subordinate: separated by a rule, sat on a tint, and typed down so it
          reads as reassurance rather than a second grid of cards. */}
      <div className="mt-10 rounded-2xl border border-secondary-200 bg-white/70 p-5 md:mt-12 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-secondary-600">
          Why people choose us
        </p>
        <ul className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ Icon, title, body }) => (
            <li key={title} className="flex gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-secondary-900">{title}</h3>
                <p className="mt-0.5 text-sm leading-snug text-secondary-600">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
