import type { Metadata } from 'next'
import { Phone, MessageCircle, Mail, MapPin, Clock, Timer } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { ContactForm } from '@/components/forms/ContactForm'
import { AssessorCard } from '@/components/ui/AssessorCard'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact | Book Your London EPC',
  description:
    'Book your London EPC certificate. Call, WhatsApp, email or use our booking form. We reply during our opening hours, Mon–Sun 8am–8pm.',
  alternates: { canonical: `${site.url}/contact` },
  openGraph: {
    title: 'Contact L&D Energy | Book Your London EPC | 07492 575 396',
    description:
      'Book your London EPC certificate. Call, WhatsApp, email or use our booking form. We reply during our opening hours, Mon–Sun 8am–8pm.',
    url: `${site.url}/contact`,
  },
  twitter: {
    title: 'Contact L&D Energy | Book Your London EPC',
    description:
      'Book your London EPC certificate. Call, WhatsApp, email or use our booking form. Fast response.',
  },
}

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: '/contact', label: 'Contact' },
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: `${site.url}/contact` },
  ],
}

const methods = [
  {
    Icon: Phone,
    title: 'Phone',
    value: site.phone,
    detail: 'Fastest response. Tap to dial.',
    href: site.phoneHref,
    cta: 'Call Now',
    external: true,
  },
  {
    Icon: MessageCircle,
    title: 'WhatsApp',
    value: site.phone,
    detail: 'Send a message, great for photos or property details.',
    href: site.whatsappHref,
    cta: 'Open WhatsApp',
    external: true,
  },
  {
    Icon: Mail,
    title: 'Email',
    value: site.email,
    detail: 'We reply during our opening hours, Mon–Sun 8am–8pm.',
    href: site.emailHref,
    cta: 'Send Email',
    external: true,
  },
] as const

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <BreadcrumbNav items={breadcrumbs} />

      {/* Form first in both the reading order and mobile layout. */}
      <Section variant="default" id="contact-methods" className="!py-4 sm:!py-6">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <h1 id="booking-form" tabIndex={-1} className="scroll-mt-32 text-3xl font-bold tracking-tight text-secondary-900 md:text-4xl">Get your exact quote</h1>
            <p className="mt-2 text-base text-secondary-700">Send your property details. We’ll confirm the exact price and an available appointment before booking.</p>
            <div className="mt-4"><ContactForm /></div>
          </div>
          <div className="min-w-0 lg:col-span-4 space-y-4">
            {methods.map((m) => (
              <div key={m.title} className="rounded-lg bg-white border border-secondary-200 p-4 sm:p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary-100 text-primary-700 shrink-0">
                    <m.Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                    <h2 className="text-base font-semibold text-secondary-900">{m.title}</h2>
                    <p className="mt-0.5 text-secondary-800 [overflow-wrap:anywhere]">{m.value}</p>
                    <p className="text-sm text-secondary-500">{m.detail}</p>
                    <a
                      href={m.href}
                      {...(m.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="mt-3 inline-flex items-center gap-2 min-h-[44px] rounded-md border border-secondary-200 bg-white hover:bg-secondary-50 text-secondary-800 font-semibold px-4 text-sm"
                    >
                      {m.cta}
                    </a>
                  </div>
                </div>
              </div>
            ))}

            <Card>
              <h2 className="text-base font-semibold text-secondary-900">Office hours</h2>
              <ul className="mt-3 space-y-2 text-sm text-secondary-700">
                <li className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-primary-600" aria-hidden="true" />
                  Monday–Sunday, 8am–8pm
                </li>
                <li className="flex items-center gap-2.5">
                  <Timer className="w-4 h-4 text-primary-600" aria-hidden="true" />
                  Replies during opening hours
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-primary-600 mt-0.5" aria-hidden="true" />
                  Based in Stratford, East London E15. Covering all 32 London boroughs and the City of London.
                </li>
              </ul>
            </Card>

            <AssessorCard headingLevel={2} />
          </div>
        </div>
      </Section>
      {/* Service area */}
      <Section variant="muted" id="service-area">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">Service Area</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Where we cover
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            Based in Stratford (E15), we cover all 32 London boroughs and the City of London. We also serve areas within a 1.5-hour radius, including parts of Essex, Kent, Hertfordshire and Surrey. No travel surcharges within this area.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-lg border border-secondary-200">
          <iframe
            title="L&D Energy service area map"
            aria-label="Map of L&D Energy service area centred on Stratford, East London"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-0.5%2C51.28%2C0.34%2C51.7&amp;layer=mapnik&amp;marker=51.543%2C-0.0005"
            /* iframes carry a 300px intrinsic width; without min-w-0 that
               becomes the grid track minimum and overflows a 320px viewport. */
            className="w-full min-w-0 h-72 md:h-96 border-0"
            loading="lazy"
          />
        </div>
      </Section>
    </>
  )
}
