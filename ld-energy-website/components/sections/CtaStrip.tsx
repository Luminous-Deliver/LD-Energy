import type { CtaId } from '@/lib/enquiry-attribution'
import { Phone, MessageCircle } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { site } from '@/lib/site'

interface CtaStripProps {
  heading: string
  body?: string
  primaryCta: { label: string; href: string; ctaId?: CtaId }
}

export function CtaStrip({
  heading,
  body,
  primaryCta,
}: CtaStripProps) {
  return (
    <Section variant="primary">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="min-w-0">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{heading}</h2>
          {body && <p className="mt-3 text-lg text-primary-100">{body}</p>}
        </div>
        {/* Three shrink-0 buttons plus the heading do not fit on one line in the
            md band (768–1023), which pushed the row past the viewport. Stack the
            buttons there and go horizontal again once there is room at lg. */}
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row shrink-0">
          <Button href={primaryCta.href} data-enquiry-cta={primaryCta.ctaId} variant="accent" size="lg">
            {primaryCta.label}
          </Button>
          <Button
            href={site.phoneHref}
            variant="secondary"
            size="lg"
            className="bg-transparent border-white text-white hover:bg-primary-700 hover:border-primary-700"
          >
            <Phone className="w-5 h-5" aria-hidden="true" />
            {site.phone}
          </Button>
          <Button
            href={site.whatsappHref}
            variant="secondary"
            size="lg"
            className="bg-transparent border-white text-white hover:bg-primary-700 hover:border-primary-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            WhatsApp
          </Button>
        </div>
      </div>
    </Section>
  )
}
