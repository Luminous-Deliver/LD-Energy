'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ChevronDown, FileText, Layers, LayoutPanelLeft, Plus, type LucideIcon } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/cn'
import { site } from '@/lib/site'
import { quoteHref } from '@/lib/quote-context'

type HomeService = 'epc' | 'bundle' | 'floor-plan'

interface Group { label: string; items: string[]; optional?: boolean }
interface Product { service: HomeService; title: string; bestFor: string; description: string; groups: Group[]; cta: string; detail: string; detailLabel: string; Icon: LucideIcon; flag?: string }

// What each service delivers. No prices here: the hero price card lists them, and
// "See my … price" opens the booking form with the service already picked.
const products: Product[] = [
  {
    service: 'epc', title: 'Domestic EPC', bestFor: 'For lettings, sales and your own home', Icon: FileText,
    description: 'On-site energy assessment, lodged certificate and standard recommendation report where applicable.',
    groups: [
      { label: 'On the visit', items: ['On-site assessment by an accredited Domestic Energy Assessor'] },
      { label: 'You receive', items: ['Your EPC, lodged on the official GOV.UK EPC Register', 'A certificate link once it is live on the register', 'The standard recommendation report, where applicable', 'A certificate valid for 10 years'] },
      { label: 'Optional', optional: true, items: [`£${site.addOns.improvementPlan} Improvement Plan: your priorities, with the full Energy Report`] },
    ],
    cta: 'See my EPC price', detail: '/services/domestic-epc', detailLabel: 'Domestic EPC details',
  },
  {
    service: 'bundle', title: 'EPC + Floor Plan', bestFor: 'For sellers, re-lets and agents preparing a listing', Icon: Layers, flag: 'One visit',
    description: 'Your EPC and a measured marketing floor plan, completed in one property visit. One appointment, one access window, and it costs less than booking both separately.',
    groups: [
      { label: 'Everything in the Domestic EPC', items: ['Assessment, lodged EPC, certificate link and recommendation report'] },
      { label: 'Plus the floor plan', items: ['Laser-measured plan for Rightmove, Zoopla and OnTheMarket', 'Total floor area, approximate room dimensions and labels', 'High-resolution JPEG and PDF files'] },
      { label: 'Why together', items: ['Both surveys are completed during the same property visit'] },
    ],
    cta: 'See my EPC + Floor Plan price', detail: '/pricing', detailLabel: 'EPC and floor plan pricing',
  },
  {
    service: 'floor-plan', title: 'Floor Plan', bestFor: 'For sellers, estate agents and rental listings', Icon: LayoutPanelLeft,
    description: 'A measured marketing plan with approximate room dimensions, supplied as JPG and PDF. It shows buyers and tenants the layout and size at a glance.',
    groups: [
      { label: 'On the visit', items: ['Every room laser-measured on site'] },
      { label: 'You receive', items: ['Total floor area, as gross internal area', 'Approximate room dimensions and room labels', 'High-resolution JPEG and PDF files', 'A plan suitable for Rightmove, Zoopla and OnTheMarket'] },
    ],
    cta: 'See my Floor Plan price', detail: '/services/floor-plans', detailLabel: 'Floor plan details',
  },
]

function ServiceCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false)
  const feature = product.service === 'bundle'
  const listId = `svc-${product.service}-list`
  return (
    <li id={`svc-${product.service}`} className={cn('svc', feature && 'svc--feature')}>
      <div className="flex items-center justify-between gap-3">
        <span aria-hidden="true" className="svc__ico"><product.Icon className="h-5 w-5" /></span>
        {product.flag && <span className="svc__flag">{product.flag}</span>}
      </div>
      <h3 className="svc__title">{product.title}</h3>
      <p className="svc__best">{product.bestFor}</p>
      <p className="svc__desc">{product.description}</p>
      {/* Phones see the intro first; the checklist opens on tap. It stays in the HTML either way. */}
      <button type="button" aria-expanded={open} aria-controls={listId} onClick={() => setOpen((v) => !v)} className="svc__toggle">
        What&rsquo;s included <ChevronDown aria-hidden="true" className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      <div id={listId} data-open={open} className="svc__body">
        {product.groups.map((g) => (
          <div key={g.label}>
            <p className="svc__group">{g.label}</p>
            <ul className="svc__list">
              {g.items.map((item) => (
                <li key={item}>
                  <span aria-hidden="true" className={cn('svc__tick', g.optional && 'svc__tick--opt')}>{g.optional ? <Plus className="h-3 w-3" strokeWidth={3} /> : <Check className="h-3 w-3" strokeWidth={3.2} />}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="svc__foot">
        <Link prefetch={false} href={quoteHref({ service: product.service, sourcePage: 'home', ctaId: 'pricing' })} data-pick={product.service} className="svc__cta">{product.cta}</Link>
        <Link prefetch={false} href={product.detail} className="svc__more">{product.detailLabel} <span aria-hidden="true">→</span></Link>
      </div>
    </li>
  )
}

export function HomeServices() {
  return (
    <section id="services" aria-labelledby="svc-h" className="hv-band scroll-mt-28">
      <Container>
        <div className="hv-top" data-reveal>
          <div>
            <p className="hv-pill">Services</p>
            <h2 id="svc-h" className="hv-h2">What you get with each service</h2>
          </div>
          <p className="hv-lede">More than a certificate: an accredited assessment on site, files you can use straight away, and a clear next step.</p>
        </div>
        <ul className="svc-grid" data-reveal>
          {products.map((p) => <ServiceCard key={p.service} product={p} />)}
        </ul>
        <details id="good-to-know" className="hv-details scroll-mt-28" data-reveal>
          <summary>How guide pricing works</summary>
          <p>Internal floor area is the main pricing factor. Layout, extensions and access inform the final quote. There are no travel charges, and any extra, like next-day lodgement, is agreed before you book. <Link prefetch={false} href="/pricing" className="home-link">See all six floor-area price bands →</Link></p>
        </details>
      </Container>
    </section>
  )
}
