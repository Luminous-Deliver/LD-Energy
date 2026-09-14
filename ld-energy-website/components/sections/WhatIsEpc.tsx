import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CheckCircle2, ArrowRight } from 'lucide-react'

const contents = [
  'Current energy efficiency rating (A–G)',
  'Potential rating after improvements',
  'Estimated annual energy costs',
  'CO₂ emissions estimate',
  'Improvement recommendations',
]

const whenRequired = [
  'Selling a residential property',
  'Letting to a new tenant',
  'Marketing a property for sale or rent',
  'Construction of a new dwelling (a different assessment method applies)',
]

/** EPC essentials; improvement outcomes depend on the assessed property. */
export function WhatIsEpc() {
  return (
    <Section variant="default" tier="secondary" id="what-is-epc" className="scroll-mt-20 md:scroll-mt-24">
      <SectionHeader
        eyebrow="EPC Basics"
        heading="Understand your EPC rating"
        intro="An Energy Performance Certificate rates a property from A (most efficient) to G and is normally valid for ten years, unless replaced. In England and Wales, it generally needs to be commissioned before marketing a home for sale or rent; exemptions apply."
      />

      <div className="mt-8 max-w-3xl">
        <div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-base font-bold text-secondary-900">Your EPC includes</h3>
              <ul className="mt-3 space-y-2">
                {contents.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-secondary-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-base font-bold text-secondary-900">When EPC requirements generally apply</h3>
              <ul className="mt-3 space-y-2">
                {whenRequired.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-secondary-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-secondary-700">
            Improvements do not automatically make an existing EPC expire. A fresh assessment
            can record changes, but the resulting rating depends on the whole property.
            For rentals covered by{' '}
            <Link
              href="/landlords"
              className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800"
            >
              MEES rules
            </Link>, the current minimum is E unless a valid exemption is registered.
          </p>

          <Link
            href="/services/epc-improvement-plan"
            className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800"
          >
            Explore the optional EPC Improvement Plan
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

      </div>
    </Section>
  )
}
