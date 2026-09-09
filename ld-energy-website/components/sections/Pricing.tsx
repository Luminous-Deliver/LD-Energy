import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PricingServiceCard } from '@/components/ui/PricingServiceCard'
import { ExactQuoteStrip } from '@/components/ui/ExactQuoteStrip'
import { FloorAreaGuide } from '@/components/sections/FloorAreaGuide'
import { priceFrom, maxBundleSaving, site } from '@/lib/site'

/**
 * Pricing — a primary-tier section built in three layers:
 *   1. three service cards: which service, roughly what does it start at
 *   2. floor-area guide: roughly what for a property this size
 *   3. enquiry: the only number that is ever binding
 *
 * Every figure here is a guide. The design has to make that obvious to someone
 * who reads only headings, labels and buttons — hence "Guide price from" as a
 * label line rather than a small "from" beside a big number.
 *
 * Now a server component; the interactive part lives in FloorAreaGuide, so the
 * cards and headings ship as static HTML.
 */
export function Pricing() {
  return (
    <Section variant="muted" tier="primary" id="pricing" className="scroll-mt-20 md:scroll-mt-24">
      <SectionHeader
        tier="primary"
        eyebrow="Services and guide pricing"
        heading="What you get, and what it costs"
        intro="An accredited assessor, an officially lodged certificate, and a price agreed with you before the visit is booked. Internal floor area is the main factor in the final figure."
      />

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <PricingServiceCard
          title="Domestic EPC"
          from={priceFrom.epc}
          positioning="A full on-site assessment, lodged on the official GOV.UK EPC Register and valid for ten years."
          inclusions={[
            'Carried out by an accredited Domestic Energy Assessor',
            'Standard lodgement within 72 hours, next day available',
            'Certificate link sent as soon as it is live on the register',
            `Improvement recommendations and a written plan available for £${site.addOns.improvementPlan}`,
          ]}
          href="/contact"
          alternative={{
            text: 'Don’t want it on the public register? The EPC Pre-Assessment is the same survey at the same price, not lodged.',
            linkLabel: 'See how it works',
            href: '/services/epc-pre-assessment',
          }}
        />
        <PricingServiceCard
          title="EPC + Floor Plan"
          from={priceFrom.bundle}
          saving={maxBundleSaving}
          positioning="Both surveys completed in one property visit, so a listing has everything it needs."
          inclusions={[
            'Everything in the Domestic EPC',
            'Laser-measured 2D floor plan to Rightmove and Zoopla spec',
            'Total floor area, room dimensions, compass point, floor labels',
            'Supplied as high-resolution JPG and PDF',
            'Built for landlords, sellers and letting agents',
          ]}
          href="/contact"
          emphasis
          emphasisLabel="Better value together"
        />
        <PricingServiceCard
          title="Floor Plan only"
          from={priceFrom.floorPlan}
          positioning="A professional measured plan for a property that already has a valid EPC."
          inclusions={[
            'Laser-measured on site, drawn to portal specification',
            'Total floor area, room dimensions, compass point, floor labels',
            'High-resolution JPG and PDF supplied',
            'Ready for Rightmove, Zoopla and OnTheMarket',
          ]}
          href="/contact"
        />
      </div>

      <ExactQuoteStrip />

      <FloorAreaGuide />
    </Section>
  )
}
