import { Phone } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { site } from '@/lib/site'

interface PageHeroProps {
  eyebrow?: string
  heading: string
  subheading: string
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}

export function PageHero({
  eyebrow,
  heading,
  subheading,
  primaryCta = { label: 'Book Your EPC', href: '#contact' },
  secondaryCta,
}: PageHeroProps) {
  return (
    <section className="bg-gradient-to-b from-primary-50 via-white to-white border-b border-secondary-100 -mt-24">
      {/* Overdraw the tallest floating-header state so this background always
          reaches the viewport edge; matching padding keeps the content in its
          original position. See Hero.tsx for the full explanation. */}
      <Container className="pt-32 pb-12 md:pb-20">
        {eyebrow && (
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700 mb-3">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-secondary-900 max-w-3xl">
          {heading}
        </h1>
        <p className="mt-5 text-lg md:text-xl text-secondary-700 leading-relaxed max-w-2xl">
          {subheading}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button href={primaryCta.href} variant="accent" size="lg">
            {primaryCta.label}
          </Button>
          {secondaryCta ? (
            <Button href={secondaryCta.href} variant="secondary" size="lg">
              {secondaryCta.label}
            </Button>
          ) : (
            <Button href={site.phoneHref} variant="secondary" size="lg">
              <Phone className="w-5 h-5" aria-hidden="true" />
              Call {site.phone}
            </Button>
          )}
        </div>
      </Container>
    </section>
  )
}
