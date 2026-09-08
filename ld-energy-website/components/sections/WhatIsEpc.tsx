import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EpcSimulator } from '@/components/sections/EpcSimulator'
import { Disclosure } from '@/components/ui/Disclosure'
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
  'After works that change energy performance',
]

/**
 * EPC education. Previously the explanation sat on the left with the simulator
 * low on the right, leaving a large dead area between them on desktop. Now the
 * explanation and the two fact lists share the left column as one block, and
 * the simulator occupies the right column at the same vertical start — so the
 * two halves balance instead of one trailing the other.
 *
 * On mobile the essentials stay visible and only the simulator is disclosed,
 * since it is the vertically expensive part.
 */
export function WhatIsEpc() {
  return (
    <Section variant="default" tier="secondary" id="what-is-epc" className="scroll-mt-20 md:scroll-mt-24">
      <SectionHeader
        eyebrow="EPC Basics"
        heading="Understand your EPC rating"
        intro="An Energy Performance Certificate rates a property from A (most efficient) to G, and stays valid for ten years. It's required whenever a home is marketed for sale or rent in England and Wales."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-10 lg:items-start">
        {/* Left: the two fact lists, side by side so the column fills properly */}
        <div className="lg:col-span-5">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:gap-7">
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
              <h3 className="text-base font-bold text-secondary-900">You legally need one when</h3>
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
            Most London homes sit around band D or E. If yours is below C and you let it out,{' '}
            <Link
              href="/landlords"
              className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800"
            >
              MEES rules
            </Link>{' '}
            are worth understanding before your next tenancy.
          </p>

          <Link
            href="/services/retrofit-consultation"
            className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800"
          >
            How we help lift your rating
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Right: simulator, aligned to the same top edge */}
        <div className="lg:col-span-7">
          <h3 className="text-base font-bold text-secondary-900">See what would lift your rating</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-secondary-700">
            Toggle the upgrades to see roughly how each one moves the score.
          </p>

          {/* Desktop: always open. Mobile: disclosed — it is the tall part. */}
          <div className="mt-4 hidden md:block">
            <EpcSimulator />
          </div>
          <div className="mt-4 md:hidden">
            <Disclosure summary="Explore the EPC rating simulator">
              <EpcSimulator />
            </Disclosure>
          </div>
        </div>
      </div>
    </Section>
  )
}
