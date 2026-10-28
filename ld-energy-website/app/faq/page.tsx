import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronDown, ShieldCheck } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Ico } from '@/components/sections/home/HomeIcon'
import { OurPromise } from '@/components/sections/OurPromise'
import { OnThisPage, type PageSection } from '@/components/inner/OnThisPage'
import { RevealOnScroll } from '@/components/inner/RevealOnScroll'
import { innerReveals } from '@/components/inner/innerReveals'
import { ReadNext, type NextStep } from '@/components/inner/ReadNext'
import { InnerEnding } from '@/components/inner/InnerEnding'
import { fullFaq, type FaqItem } from '@/lib/faq'
import { quoteHref } from '@/lib/quote-context'
import { site, defaultOgImage } from '@/lib/site'
import '@/app/inner.css'
import './faq.css'

/*
 * /faq, redesigned 24/10/2026 on the inner-page parts (/landlords, /pricing). Every question, group and link comes from
 * lib/faq.ts unchanged, so the visible answers and the FAQPage schema are one array and can't drift. Group ids
 * (#about-epcs, #legal-requirements, #process, #pricing, #your-rating, #improvements) stay. Title and descriptions stay
 * frozen until 14/12; only the H1 changes.
 */
export const metadata: Metadata = {
  title: 'EPC FAQ | Common Questions in London',
  description:
    'Common questions about Energy Performance Certificates: validity, legal rules, the assessment process, pricing and improvements. Answered by a DEA.',
  alternates: { canonical: `${site.url}/faq` },
  openGraph: {
    images: [defaultOgImage],
    title: 'EPC FAQ | Common Questions About EPCs in London | L&D Energy',
    description:
      'Frequently asked questions about Energy Performance Certificates: validity, legal requirements, the assessment process, pricing, and improvements.',
    url: `${site.url}/faq`,
  },
  twitter: {
    images: [defaultOgImage.url],
    title: 'EPC FAQ | Common Questions About EPCs in London',
    description:
      'Frequently asked questions about Energy Performance Certificates, answered by an Elmhurst and Quidos accredited DEA.',
  },
}

/** One line under each group heading, so a reader can tell the groups apart before opening one. */
const groupIntro: Record<string, string> = {
  'about-epcs': 'What an EPC is, how the rating is worked out, and what helps on the day.',
  'legal-requirements': 'When the law needs an EPC, and the minimum for letting a home.',
  process: 'Getting a quote, the visit, and when the certificate arrives.',
  pricing: 'What it costs, what is included, and the faster options.',
  'your-rating': 'The questions people ask once their rating comes back.',
  improvements: 'Raising the rating, and when a new EPC is worth getting.',
}

/** lib/faq.ts titles are title case ("Legal Requirements"); headings here are sentence case, acronyms kept ("About EPCs"). */
const sentence = (t: string) => t.split(' ').map((w, i) => (i === 0 || /^[A-Z]{2,}/.test(w) ? w : w.toLowerCase())).join(' ')

const total = fullFaq.reduce((n, c) => n + c.items.length, 0)

const sections: PageSection[] = [
  ...fullFaq.map((c) => ({ id: c.id, heading: `${c.id}-h`, label: sentence(c.title) })),
  { id: 'more-questions', heading: 'more-h', label: 'Still have a question?' },
]

const readNext: NextStep[] = [
  { kicker: 'Before the visit', title: 'Preparing for your EPC', href: '/preparing-for-your-epc',
    text: 'What to have ready, so the rating counts everything you have done.' },
  { kicker: 'Ratings', title: 'EPC ratings explained', href: '/blog/epc-ratings-explained',
    text: 'What each band means, and how the score behind it is worked out.' },
  { kicker: 'Comparing homes', title: 'Why EPC ratings differ between similar homes', href: '/blog/why-is-my-epc-different',
    text: 'Floor area, outside walls, heating and evidence, side by side.' },
  { kicker: 'Prices', title: 'Every price, by floor area', href: '/pricing', go: true, cta: 'See the prices',
    text: 'One price list for all of London, with no travel charges and no VAT to add.' },
]

const schema = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${site.url}/faq` },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: fullFaq.flatMap((cat) =>
      cat.items.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })),
    ),
  },
]

function Question({ item, open }: { item: FaqItem & { id?: string }; open: boolean }) {
  return (
    <details id={item.id} open={open}>
      <summary><span>{item.q}</span><ChevronDown size={20} className="i" aria-hidden="true" /></summary>
      <div className="in-faq__a">
        <p>{item.a}</p>
        {item.links && item.links.length > 0 && (
          <ul className="fq-links">
            {item.links.map((l) => (
              <li key={l.href}>
                <a className="in-link" href={l.href} {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {l.label} <Ico name="arrow-right" size={14} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  )
}

export default function FaqPage() {
  const reg = site.assessor.accreditations
  return (
    <div className="in fq">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* HERO: the answer on the left, the groups on the right */}
      <section className="in-hd" aria-labelledby="fq-h1">
        <Container>
          <nav className="in-crumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link><span className="sep" aria-hidden="true">›</span></li>
              <li><span aria-current="page">FAQ</span></li>
            </ol>
          </nav>
          <div className="fq-hd">
            <div className="in-hd__copy">
              <p className="in-eyebrow">Frequently asked questions</p>
              <h1 id="fq-h1">EPC questions, answered</h1>
              <p className="in-hd__answer">
                Everything we get asked about Energy Performance Certificates: what they are, the legal requirements, our process,
                pricing and improvements. <b className="num">{total}</b> questions in {fullFaq.length} groups.
              </p>
              <div className="in-hd__acts">
                <a className="ld-btn ld-btn--primary" href={quoteHref({ service: 'epc', sourcePage: 'faq', ctaId: 'hero' })} data-enquiry-cta="hero">Get my exact quote</a>
                <a className="in-wa" href={site.whatsappHref} target="_blank" rel="noopener noreferrer"><Ico name="message" size={18} /> Ask on WhatsApp</a>
              </div>
              <p className="in-by">
                <ShieldCheck size={18} className="i" aria-hidden="true" />
                <span>
                  Answered by <Link href="/about"><b>{site.assessor.name}</b></Link>, {reg.map((a) => a.short).join(' and ')} accredited,{' '}
                  {reg.map((a, i) => <span key={a.number}>{i > 0 && ' and '}<span className="num">{a.number}</span></span>)}.{' '}
                  <a href={site.assessor.verifyUrl} target="_blank" rel="noopener">Check the GOV.UK register</a>
                </span>
              </p>
            </div>
            <div className="fq-hd__side">
              <OnThisPage sections={sections} />
            </div>
          </div>
        </Container>
      </section>

      {fullFaq.map((cat, gi) => (
        <div key={cat.id} className="fq-group">
          <section className={`in-sec${gi % 2 === 0 ? ' in-sec--band' : ''}`} id={cat.id} aria-labelledby={`${cat.id}-h`}>
            <Container className="fq-wrap">
              <div className="fq-side">
                <p className="in-eyebrow"><span className="num">{gi + 1}</span> of <span className="num">{fullFaq.length}</span> · <span className="num">{cat.items.length}</span> questions</p>
                <h2 className="in-h2" id={`${cat.id}-h`}>{sentence(cat.title)}</h2>
                <p className="in-note">{groupIntro[cat.id]}</p>
              </div>
              <div className="in-faq">
                {cat.items.map((item, i) => <Question key={item.q} item={item} open={gi === 0 && i === 0} />)}
              </div>
            </Container>
          </section>
          {/* Our promise under the questions that give the prices (Abdul 24/10: under the prices on any page that shows them) */}
          {cat.id === 'pricing' && <OurPromise />}
        </div>
      ))}

      {/* STILL HAVE A QUESTION */}
      <section className="in-sec" id="more-questions" aria-labelledby="more-h">
        <Container className="fq-more">
          <div>
            <p className="in-eyebrow">Ask us</p>
            <h2 className="in-h2" id="more-h">Still have a question?</h2>
            <p className="in-lede">
              Can&apos;t find what you&apos;re looking for? Get in touch. Phone, WhatsApp and email all reach the assessor directly, and
              we reply during our opening hours.
            </p>
            <p className="fq-more__links">
              See the <Link className="in-link" href="/services/domestic-epc">Domestic EPC page</Link> for service details, or
              the <Link className="in-link" href="/pricing">pricing page</Link> for the full price list.
            </p>
          </div>
          <ul className="fq-ways">
            <li>
              <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer">
                <Ico name="message" size={22} /><span><b>WhatsApp</b><small>Send a photo or a question</small></span><Ico name="arrow-right" size={16} />
              </a>
            </li>
            <li>
              <a href={site.phoneHref}>
                <Ico name="phone" size={22} /><span><b className="num">{site.phone}</b><small>{site.hours}</small></span><Ico name="arrow-right" size={16} />
              </a>
            </li>
            <li>
              <a href={site.emailHref}>
                <Ico name="mail" size={22} /><span><b className="fq-ways__em">{site.email}</b><small>We reply in our opening hours</small></span><Ico name="arrow-right" size={16} />
              </a>
            </li>
          </ul>
        </Container>
      </section>

      <ReadNext steps={readNext} />

      {/* section reveals (motion, Considered); the price sections are left out on purpose, see innerReveals */}
      <RevealOnScroll {...innerReveals('.fq', { lists: ['.fq-ways'] })} />

      <div id="book">
        <InnerEnding variant="a" source="faq"
          heading="Ready for your exact quote?"
          text="Send the address and the size. We confirm your exact price and a visit time before you book." />
      </div>
    </div>
  )
}
