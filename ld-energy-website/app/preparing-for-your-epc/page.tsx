import type { Metadata } from 'next'
import { quoteHref } from '@/lib/quote-context'
import { Section } from '@/components/ui/Section'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { PageHero } from '@/components/sections/PageHero'
import { CtaStrip } from '@/components/sections/CtaStrip'
import { WhatToHaveReady } from '@/components/sections/WhatToHaveReady'
import { EvidenceGuide } from '@/components/sections/EvidenceGuide'
import { ImportantToKnow } from '@/components/sections/ImportantToKnow'
import { CustomerBriefing } from '@/components/sections/CustomerBriefing'
import { OnThisPage, type PageAnchor } from '@/components/ui/OnThisPage'
import { Container } from '@/components/ui/Container'
import { site, govUk } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Preparing for Your EPC Assessment | Access, Documents and Evidence',
  description:
    'What to have ready for your EPC assessment: access, supporting documents and evidence. Plus how your quote works, why the rating is calculated rather than chosen, and why EPCs differ between similar homes.',
  alternates: { canonical: `${site.url}/preparing-for-your-epc` },
  openGraph: {
    title: 'Preparing for Your EPC Assessment | L&D Energy',
    description:
      'A short checklist of what the assessor needs access to, so your EPC survey takes 45–60 minutes and does not need a second visit.',
    url: `${site.url}/preparing-for-your-epc`,
  },
}

/**
 * Stable, human-readable fragments. Deliberately short slugs set explicitly on
 * the sections rather than derived from heading text, so a link copied into a
 * WhatsApp reply keeps working if the visible wording is later reworded.
 */
const pageAnchors: readonly PageAnchor[] = [
  { id: 'what-to-have-ready', label: 'What to have ready' },
  { id: 'documents-and-evidence', label: 'Documents and evidence' },
  { id: 'why-evidence-matters', label: 'Why evidence matters' },
  { id: 'quote-and-property-complexity', label: 'Your quote and property complexity' },
  { id: 'how-your-epc-rating-is-calculated', label: 'How your EPC rating is calculated' },
  { id: 'why-your-epc-may-differ', label: 'Why your EPC may differ' },
  { id: 'rdsap-10', label: 'RdSAP 10' },
  { id: 'tenanted-properties', label: 'Tenanted properties' },
]

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: '/preparing-for-your-epc', label: 'Preparing for your EPC' },
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Preparing for your EPC',
      item: `${site.url}/preparing-for-your-epc`,
    },
  ],
}

export default function PreparingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BreadcrumbNav items={breadcrumbs} />
      <PageHero
        eyebrow="Before the visit"
        heading="Preparing for your EPC assessment"
        subheading="A short checklist so the survey takes 45–60 minutes and nothing needs a second visit. Nothing here is difficult — it is mostly about access."
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ sourcePage: 'preparation', ctaId: 'hero' }) }}
      />
      <CustomerBriefing />
      <Container className="pt-8">
        <div className="mx-auto max-w-4xl">
          <OnThisPage anchors={pageAnchors} />
        </div>
      </Container>
      <WhatToHaveReady heading={false} />
      <EvidenceGuide />
      <Section variant="muted" tier="secondary">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-secondary-900">
            What happens on the day
          </h2>
          <p className="mt-3 leading-relaxed text-secondary-700">
            Your assessor photographs and measures each room, records the heating system, insulation,
            glazing and lighting, and reads the meters. There is no testing, no mess and nothing
            invasive.
          </p>
          <p className="mt-3 leading-relaxed text-secondary-700">
            After the visit we send you a draft of your EPC to check. Once you are happy with it, we
            lodge the certificate on the official GOV.UK EPC register within 72 hours, or the next
            day if you chose express, and send you the link as soon as it is live. A lodged
            certificate cannot be edited, so the draft is your opportunity to flag anything that
            looks wrong.
          </p>
        </div>
      </Section>
      <ImportantToKnow govUkHref={govUk.epcGuidance} />
      <CtaStrip
        heading="Ready to get your EPC quote?"
        body="Send us the property details and we'll confirm your exact quote and a time slot."
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ sourcePage: 'preparation', ctaId: 'bottom' }) }}
      />
    </>
  )
}
