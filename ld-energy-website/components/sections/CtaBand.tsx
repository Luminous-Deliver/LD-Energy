import { quoteHref } from '@/lib/quote-context'
import Link from 'next/link'
import { ArrowRight, Phone, MessageCircle } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { site } from '@/lib/site'

/**
 * The page's single mid-page conversion checkpoint, placed straight after
 * pricing. Previously the only booking route below the hero was the form at
 * the very bottom, so anyone convinced by the price had roughly twelve screens
 * to scroll before they could act.
 *
 * Used exactly once. Repeating identical CTA bands devalues all of them.
 */
export function CtaBand() {
  return (
    <section
      aria-labelledby="cta-band-heading"
      className="relative overflow-hidden py-10 md:py-12"
      style={{ background: 'linear-gradient(160deg, #0D1B33 0%, #142644 55%, #0D1B33 100%)' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-0 h-[260px] w-[420px] rounded-full opacity-[0.12]"
        style={{ background: 'radial-gradient(ellipse, #47846E 0%, transparent 70%)' }}
      />
      <Container className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h2 id="cta-band-heading" className="text-2xl font-semibold text-white md:text-3xl">
            Ready for an exact price?
          </h2>
          <p className="mt-2 leading-relaxed" style={{ color: 'rgba(214,225,240,0.7)' }}>
            Send us the address and a few details. We&rsquo;ll confirm your exact quote and a time
            slot — we reply during our opening hours, 8am&ndash;8pm, seven days a week.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link
            href={quoteHref({ sourcePage: 'home', ctaId: 'bottom' })}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 to-accent-700 px-6 py-3.5 text-base font-bold text-white shadow-md transition-all hover:from-accent-700 hover:to-accent-800"
          >
            Get my exact quote
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <div className="flex gap-3">
            <a
              href={site.phoneHref}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:flex-none"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call
            </a>
            <a
              href={site.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:flex-none"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp
            </a>
          </div>
        </div>
      </Container>
    </section>
  )
}
