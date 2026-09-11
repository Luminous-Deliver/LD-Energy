import { quoteHref } from '@/lib/quote-context'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { CalendarClock, FileSpreadsheet, KeyRound, Layers } from 'lucide-react'

/**
 * Trade / agency band. Deliberately framed around what we can offer agencies
 * rather than claims about existing agency volume, and access is described as
 * the landlord's or agent's to arrange.
 */
const points = [
  {
    Icon: CalendarClock,
    title: 'Built for launch dates',
    body: 'Priority slots for agencies and express next-day turnaround when a listing can’t wait.',
  },
  {
    Icon: FileSpreadsheet,
    title: 'One invoice, per-property breakdown',
    body: 'Portfolios batched by postcode, with volume rates from five properties a month.',
  },
  {
    Icon: Layers,
    title: 'Batched by area, not one at a time',
    body: 'Several properties in the same area go into a single visit, which keeps the per-property rate down.',
  },
  {
    Icon: KeyRound,
    title: 'Straightforward access',
    body: 'You or the landlord arrange entry and give tenants notice. If that’s difficult, send us their details and we’ll sort it.',
  },
]

export function TradeAgency() {
  return (
    <section
      id="agency"
      className="relative overflow-hidden py-16 md:py-24 scroll-mt-20 md:scroll-mt-24"
      style={{ background: 'linear-gradient(160deg, #0D1B33 0%, #142644 50%, #0D1B33 100%)' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-0 w-[620px] h-[400px] rounded-full opacity-[0.12]"
        style={{ background: 'radial-gradient(ellipse, #47846E 0%, transparent 70%)' }}
      />

      <Container className="relative grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
        <div className="lg:col-span-5">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs uppercase tracking-wide font-semibold"
            style={{
              background: 'rgba(71,132,110,0.12)',
              border: '1px solid rgba(71,132,110,0.3)',
              color: '#95BFAD',
            }}
          >
            Trade &amp; agency work
          </span>
          <h2
            className="mt-4 text-3xl md:text-4xl font-semibold text-white"
            style={{ letterSpacing: '-0.01em' }}
          >
            Set up for letting and estate agents
          </h2>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: 'rgba(214,225,240,0.7)' }}>
            Instructing more than the occasional one-off? The process is built for deadlines,
            batched portfolios and portal-ready output — with volume rates once you’re booking
            regularly. Individual customers get exactly the same standard.
          </p>

          <Button href={quoteHref({ service: 'bulk', sourcePage: 'home', ctaId: 'inline' })} variant="accent" size="lg" className="mt-7">
            Talk about agency rates
          </Button>

          <p className="mt-4 text-sm" style={{ color: 'rgba(214,225,240,0.5)' }}>
            Tell us roughly how many properties a month and which postcodes, and we’ll come back
            with rates.
          </p>
        </div>

        <ul className="lg:col-span-7 grid gap-4 sm:grid-cols-2">
          {points.map(({ Icon, title, body }) => (
            <li
              key={title}
              className="rounded-2xl p-5 md:p-6 transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'rgba(255,255,255,0.045)',
                border: '1px solid rgba(71,132,110,0.2)',
              }}
            >
              <span
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl"
                style={{ background: 'rgba(71,132,110,0.18)', color: '#95BFAD' }}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base md:text-lg font-semibold text-white">{title}</h3>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: 'rgba(214,225,240,0.62)' }}
              >
                {body}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
