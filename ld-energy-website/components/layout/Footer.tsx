import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, ShieldCheck, Star, ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/ui/Logo'
import { navLinks, site } from '@/lib/site'
import { priorityBoroughs, boroughMeta } from '@/lib/boroughs'

const services = navLinks.filter(l =>
  ['/services/domestic-epc', '/domestic-energy-assessor-london', '/services/floor-plans', '/landlords', '/sellers', '/estate-agents'].includes(l.href)
)
const otherLinks = navLinks.filter(l =>
  ['/areas', '/pricing', '/faq', '/blog', '/about'].includes(l.href)
)

export function Footer() {
  const year = new Date().getFullYear()
  const priorityAreas = priorityBoroughs
  const totalAreas = Object.keys(boroughMeta).length

  return (
    <footer
      className="relative overflow-hidden pb-20 [overflow-wrap:anywhere] md:pb-0"
      style={{
        background: 'linear-gradient(160deg, #0D1B33 0%, #142644 40%, #0D1B33 70%, #091324 100%)',
      }}
    >
      {/* Subtle decorative glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 w-[500px] h-[300px] rounded-full opacity-[0.07]"
        style={{ background: 'radial-gradient(ellipse, #47846E 0%, transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[200px] rounded-full opacity-[0.05]"
        style={{ background: 'radial-gradient(ellipse, #95BFAD 0%, transparent 70%)' }}
      />

      {/* Main content */}
      <Container className="relative pt-14 pb-10 md:pt-16 md:pb-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">

          {/* Brand column */}
          <div className="md:col-span-4">
            <Logo variant="light" />
            <p className="mt-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>
              Domestic EPCs across London. Elmhurst-accredited Domestic Energy Assessor based in
              Stratford, East London. Covering all 32 London boroughs.
            </p>

            {/* Accreditation badge */}
            <div
              className="mt-5 inline-flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium"
              style={{ background: 'rgba(71,132,110,0.10)', border: '1px solid rgba(71,132,110,0.30)' }}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: '#95BFAD' }} aria-hidden="true" />
              <span style={{ color: 'rgba(255,255,255,0.9)' }}>
                Elmhurst Accredited · {site.assessor.accreditationNumber}
              </span>
            </div>

            {/* Hours */}
            <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
              <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: '#95BFAD' }} aria-hidden="true" />
              {site.hours}
            </div>
          </div>

          {/* Services + Company, side by side on mobile to avoid dead space */}
          <div className="grid grid-cols-2 gap-8 md:contents">
            {/* Services column */}
            <nav aria-label="Footer services" className="md:col-span-2">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(149,191,173,0.85)' }}>
                Services
              </h2>
              <ul className="space-y-0">
                {services.map((link) => (
                  <li key={link.href}>
                    <Link
                      prefetch={false}
                      href={link.href}
                      className="inline-flex min-h-[44px] items-center text-sm transition-colors hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.88)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Other links column */}
            <nav aria-label="Footer links" className="md:col-span-2">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(149,191,173,0.85)' }}>
                Company
              </h2>
              <ul className="space-y-0">
                {otherLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      prefetch={false}
                      href={link.href}
                      className="inline-flex min-h-[44px] items-center text-sm transition-colors hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.88)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Contact column */}
          <div className="md:col-span-4">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(149,191,173,0.85)' }}>
              Get in Touch
            </h2>
            <ul className="space-y-1">
              <li>
                <a
                  href={site.phoneHref}
                  className="group inline-flex min-h-[44px] items-center gap-2.5 text-sm transition-colors hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.92)' }}
                >
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                    style={{ background: 'rgba(71,132,110,0.18)' }}
                  >
                    <Phone className="w-3.5 h-3.5" style={{ color: '#95BFAD' }} aria-hidden="true" />
                  </span>
                  {site.phone}
                </a>
              </li>
              <li>
                <a
                  href={site.emailHref}
                  className="group inline-flex min-h-[44px] items-center gap-2.5 text-sm transition-colors hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.92)' }}
                >
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                    style={{ background: 'rgba(71,132,110,0.18)' }}
                  >
                    <Mail className="w-3.5 h-3.5" style={{ color: '#95BFAD' }} aria-hidden="true" />
                  </span>
                  {site.email}
                </a>
              </li>
              <li
                className="inline-flex items-center gap-2.5 text-sm"
                style={{ color: 'rgba(255,255,255,0.92)' }}
              >
                <span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                  style={{ background: 'rgba(71,132,110,0.18)' }}
                >
                  <MapPin className="w-3.5 h-3.5" style={{ color: '#95BFAD' }} aria-hidden="true" />
                </span>
                Stratford, East London E15
              </li>
            </ul>

            {/* Google Reviews CTA */}
            <a
              href={site.reviews.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:brightness-110"
              style={{
                background: 'rgba(71,132,110,0.12)',
                border: '1px solid rgba(71,132,110,0.30)',
                color: 'rgba(255,255,255,0.92)',
              }}
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              View our Google Reviews
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
            </a>
          </div>
        </div>
      </Container>


      {/* Service Areas — a compact strip, not a directory.
          Kept as real crawlable <a> links because borough pages are
          commercially important, but limited to a priority set: 34 near-identical
          sitewide anchors is boilerplate that dilutes both anchor text and the
          equity each link carries. Discovery of the full set is guaranteed by
          /areas (which server-renders all 34) and by the sitemap. */}
      <div
        style={{
          borderTop: '1px solid rgba(71,132,110,0.14)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <Container className="py-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-baseline lg:gap-5">
            <h2
              className="shrink-0 text-xs font-bold uppercase tracking-widest"
              style={{ color: 'rgba(165,217,124,0.75)' }}
            >
              Service areas
            </h2>
            <nav aria-label="Service areas" className="min-w-0">
              <ul className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
                {priorityAreas.map((b, i) => (
                  <li key={b.slug} className="flex items-center">
                    <Link
                      prefetch={false}
                      href={`/areas/${b.slug}`}
                      className="rounded px-1.5 py-1.5 text-[13px] leading-snug transition-colors hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.62)' }}
                    >
                      EPC {b.name}
                    </Link>
                    {i < priorityAreas.length - 1 && (
                      <span aria-hidden="true" style={{ color: 'rgba(255,255,255,0.22)' }}>
                        ·
                      </span>
                    )}
                  </li>
                ))}
                <li className="ml-1">
                  <Link
                    prefetch={false}
                    href="/areas"
                    className="inline-flex items-center gap-1 rounded px-1.5 py-1.5 text-[13px] font-semibold leading-snug transition-colors hover:brightness-125"
                    style={{ color: '#95BFAD' }}
                  >
                    View all {totalAreas} London areas
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </Container>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(71,132,110,0.14)' }}>
        <Container className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
          <p className="text-center sm:text-left">
            © {year} {site.name}. Part of {site.parentBrand}.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link prefetch={false} href="/privacy-policy" className="inline-flex min-h-[44px] items-center hover:text-white transition-colors">Privacy Policy</Link>
            <Link prefetch={false} href="/terms" className="inline-flex min-h-[44px] items-center hover:text-white transition-colors">Terms of Service</Link>
            <a
              href="https://digital.luminousanddeliver.co.uk/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center hover:text-white transition-colors"
            >
              Made by{' '}
              <span className="font-semibold" style={{ color: 'rgba(149,191,173,0.85)' }}>L&amp;D Digital</span>
            </a>
          </div>
        </Container>
      </div>
    </footer>
  )
}
