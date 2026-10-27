import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Ico } from '@/components/sections/home/HomeIcon'
import { EnquiryForm } from '@/components/forms/EnquiryForm'
import { LegacyQuoteRedirect } from '@/components/forms/LegacyQuoteRedirect'
import { site, defaultOgImage } from '@/lib/site'
import { quoteHref } from '@/lib/quote-context'
import '../inner.css'
import '../quote-contact.css'

/*
 * /contact to Abdul's brief of 23/10/2026 (projects/ld-energy-redesign-2026-10/BRIEF-ABDUL-2026-10-23-contact-quote.md):
 * "one route for buying a service, another for asking a question". The price route leads and goes to the quote
 * journey; the question route gives the direct lines, then a general enquiry form further down, secondary in weight.
 * Old quote links to /contact are sent on to /quote (LegacyQuoteRedirect).
 */
const title = 'Contact: Bookings, Questions and Agency Work'
const description =
  'Questions about an EPC, an existing booking or agency work? Call, WhatsApp or email L&D Energy, or send a message. For a price, start a quote.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${site.url}/contact` },
  openGraph: { title: `${title} | L&D Energy`, description, url: `${site.url}/contact`, images: [defaultOgImage] },
  twitter: { title: `${title} | L&D Energy`, description, images: [defaultOgImage.url] },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: `${site.url}/contact` },
  ],
}

const hours = site.hours.replace('Monday–Sunday', 'Monday to Sunday').replace('8am–8pm', '8am to 8pm')
const [elmhurst, quidos] = site.assessor.accreditations

export default function ContactPage() {
  return (
    <div className="in cp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <LegacyQuoteRedirect />

      <section className="cp-hero" aria-labelledby="contact-h1">
        <Container>
          <nav className="in-crumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link><span className="sep" aria-hidden="true">›</span></li>
              <li><span aria-current="page">Contact</span></li>
            </ol>
          </nav>
          <p className="in-eyebrow cp-hero__eyebrow">L&amp;D Energy · Contact</p>
          <h1 id="contact-h1">How can we help?</h1>
          <p className="cp-hero__lede">Whether you’re arranging a property service or have a question, we’ll point you in the right direction.</p>
        </Container>
      </section>

      <section className="cp-routes" aria-label="How to reach us">
        <Container className="cp-routes__grid">
          {/* the primary route: one button into the quote journey (the dialog with JavaScript, /quote without) */}
          <div className="cp-price" aria-labelledby="cp-price-h">
            <h2 id="cp-price-h" className="cp-price__h">Looking for a price?</h2>
            <p className="cp-price__p">Need an EPC, a floor plan, or both? Start with a quote so we can collect the right property details and give you the most relevant pricing.</p>
            <a className="ld-btn ld-btn--primary cp-price__go" href={quoteHref({ sourcePage: 'contact', ctaId: 'hero' })} data-enquiry-cta="hero">
              Request a quote <Ico name="arrow-right" size={18} />
            </a>
            <ul className="cp-price__ticks">
              <li><Ico name="check" size={18} />See a guide price as you choose</li>
              <li><Ico name="check" size={18} />Exact price and visit time confirmed before you book</li>
              <li><Ico name="check" size={18} />No upfront payment</li>
            </ul>
          </div>

          {/* the secondary route: direct lines for bookings, questions and business enquiries */}
          <div className="cp-ask" aria-labelledby="cp-ask-h">
            <h2 id="cp-ask-h" className="cp-ask__h">Have another question?</h2>
            <p className="cp-ask__p">For existing bookings, general questions or business enquiries, contact us below.</p>
            <dl className="cp-lines">
              <div><dt><Ico name="phone" size={18} />Phone</dt><dd><a className="num" href={site.phoneHref}>{site.phone}</a><span>Call or text</span></dd></div>
              <div><dt><Ico name="message" size={18} />WhatsApp</dt><dd><a href={site.whatsappHref} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a><span>Good for photos and documents</span></dd></div>
              <div><dt><Ico name="mail" size={18} />Email</dt><dd><a className="cp-lines__mail" href={site.emailHref}>{site.email.slice(0, site.email.indexOf('@') + 1)}<wbr />{site.email.slice(site.email.indexOf('@') + 1)}</a></dd></div>
              <div><dt><Ico name="clock" size={18} />Hours</dt><dd><span className="cp-lines__v">{hours}</span><span>We reply during these hours</span></dd></div>
            </dl>
            <p className="cp-ask__more"><a href="#enquiry">Or send us a message</a></p>
            <p className="in-by cp-ask__by">
              <Ico name="check" size={18} />
              <span><b>{site.assessor.name}</b>, Elmhurst ({elmhurst.number}) and Quidos ({quidos.number}) accredited.{' '}
                <a href={site.assessor.verifyUrl} target="_blank" rel="noopener noreferrer">Check the GOV.UK register</a></span>
            </p>
            <p className="cp-ask__area">Based in Stratford E15, covering all 32 London boroughs and the City of London, with no travel charge. <Link href="/areas">See the areas we cover</Link></p>
          </div>
        </Container>
      </section>

      <section id="enquiry" className="cp-form" aria-labelledby="cp-form-h">
        <Container>
          <div className="cp-form__in">
            <div className="cp-form__head">
              <p className="in-eyebrow">General enquiries</p>
              <h2 id="cp-form-h" className="cp-form__h">Send us a message</h2>
              <p>For anything that isn’t a request for a price: the service or the process, an existing booking or certificate, agency partnerships and multi-property work, or something else.</p>
            </div>
            <EnquiryForm />
          </div>
        </Container>
      </section>
    </div>
  )
}
