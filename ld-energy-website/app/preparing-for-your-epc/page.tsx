import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarClock, Clock, CreditCard, FileText, Home, Info, KeyRound, Mail, Phone } from 'lucide-react'
import { GuideCrumbs } from '@/components/blog/GuideCrumbs'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { PrepChecklist } from '@/components/prep/PrepChecklist'
import { WhatsAppIcon } from '@/components/ui/BrandIcons'
import { prepGroups } from '@/lib/prep-checklist'
import { site, govUk, defaultOgImage } from '@/lib/site'
import '../guides.css'
import './prep.css'

/*
 * The briefing a booked customer reads the night before the visit (booking emails link here through
 * lib/booking-copy.ts PREP_PATH; WhatsApp replies link to the section ids below). Rebuilt 23/10/2026 on the guide
 * system (hero A, "In short", contents rail) to the research spec
 * Abdul-2 projects/ld-energy-redesign-2026-10/research/prep-page-spec-2026-10-23.md.
 *
 * EPC method facts come only from Abdul-2 references/rdsap-conventions.md (RdSAP 10 conventions v12.2) and
 * references/epc-evidence-easob.md; convention numbers are noted beside the copy. Fees, payment, cancellation and
 * who must be present are the wording of app/terms/page.tsx (§3, §4, §6, §7): change them there first.
 *
 * Every id that existed before the rebuild is kept, because links already sent to customers point at them:
 * please-read, what-to-have-ready, tenanted-properties, documents-and-evidence, why-evidence-matters, important,
 * quote-and-property-complexity, how-your-epc-rating-is-calculated, why-your-epc-may-differ, rdsap-10.
 */

const PATH = '/preparing-for-your-epc'

export const metadata: Metadata = {
  title: 'Preparing for Your EPC Assessment',
  description:
    'Booked an EPC? What to have ready for the visit: a room-by-room checklist, the paperwork that helps, what happens on the day and when your certificate is ready.',
  alternates: { canonical: `${site.url}${PATH}` },
  openGraph: {
    images: [defaultOgImage],
    title: 'Preparing for Your EPC Assessment | L&D Energy',
    description:
      'Your EPC visit checklist: access, paperwork, what happens on the day and after. Most visits take 45 to 60 minutes.',
    url: `${site.url}${PATH}`,
  },
}

/** WhatsApp for a booked customer: reschedule or ask, never a quote request. */
const waBooked = `${site.whatsappHref}?text=${encodeURIComponent('Hi, it’s about my booked EPC visit.\nAddress:\n')}`

const toc = [
  { id: 'please-read', text: 'The three things that matter', level: 2 },
  { id: 'what-to-have-ready', text: 'Your checklist', level: 2 },
  { id: 'documents-and-evidence', text: 'Paperwork that helps', level: 2 },
  { id: 'on-the-day', text: 'On the day', level: 2 },
  { id: 'who-needs-to-be-there', text: 'Who needs to be there', level: 2 },
  { id: 'after-the-visit', text: 'After the visit', level: 2 },
  { id: 'important', text: 'Worth knowing', level: 2 },
  { id: 'fees-and-changes', text: 'Changes, fees and payment', level: 2 },
]

const crumbs = [
  { href: '/', label: 'Home' },
  { href: PATH, label: 'Preparing for your EPC' },
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
    { '@type': 'ListItem', position: 2, name: 'Preparing for your EPC', item: `${site.url}${PATH}` },
  ],
}

const inShort = [
  { Icon: Clock, text: 'Most visits take 45 to 60 minutes. A large home with 5 or more bedrooms takes around 2 hours.' },
  { Icon: KeyRound, text: 'You or your representative lets us in at the booked time.' },
  { Icon: Home, text: 'Every room, the loft hatch, the boiler and the meters easy to reach.' },
  { Icon: FileText, text: 'Any paperwork for improvements out ready.' },
  { Icon: CreditCard, text: 'Payment when the visit is done, by bank transfer or card.' },
  { Icon: CalendarClock, text: 'Change or cancel free with at least 24 hours’ notice.' },
]

const three = [
  {
    title: 'Access',
    text: 'Every room, the loft hatch, the boiler and cylinder, the heating controls and the meters. Anything locked or blocked on the day can’t be recorded.',
  },
  {
    title: 'Paperwork',
    text: 'Hidden insulation, window age and solar panel details can only be recorded from evidence. Without it, the method uses cautious defaults.',
  },
  {
    title: 'Someone there',
    text: 'You or your representative, at the booked time: an adult who can open every part of the home.',
  },
]

/* Each row: what to look out for, what it lets your assessor record, what happens without it. */
const evidence = [
  {
    doc: 'FENSA or CERTASS certificate, Building Control certificate, or the maker’s guarantee for your windows',
    lets: 'When the glazing was fitted', // rdsap 3.12a
    without: 'Dated from the glass itself if it can be, or recorded as unknown',
  },
  {
    doc: 'BFRC window energy rating certificate, or the manufacturer’s data for your windows',
    lets: 'How much heat your windows actually lose', // rdsap 3.10
    without: 'Standard values for that type of glazing',
  },
  {
    doc: 'Insulation certificates, guarantees or invoices for walls, floors or the loft, ideally showing the thickness. A cavity wall insulation guarantee counts.',
    lets: 'Insulation that can’t be seen on the day', // rdsap 9.02, 3.03a, 3.03b
    without: 'Treated as it was when the house was built, or as unknown for a boarded loft',
  },
  {
    doc: 'Building Control completion certificate for an extension, loft conversion or converted building',
    lets: 'The work as it was signed off. Planning papers on their own aren’t enough.', // rdsap 9.02, 3.05b
    without: 'Only what can be seen on the day is recorded',
  },
  {
    doc: 'Paperwork for an insulated front or back door, with its U-value or the maker’s product reference',
    lets: 'The door as insulated', // rdsap 3.09
    without: 'Standard values for the door',
  },
  {
    doc: 'Boiler or heat pump commissioning paperwork showing it was designed for a low flow temperature',
    lets: 'The low-temperature design', // rdsap 4.01b
    without: 'Flow temperature recorded as unknown',
  },
  {
    doc: 'Solar panel paperwork showing the system size in kWp, or the MCS certificate',
    lets: 'The size of your solar panel system', // rdsap 9.05
    without: 'The panels may be left out, or estimated from how much roof they cover',
  },
  {
    doc: 'Home battery paperwork showing the make, model and usable capacity in kWh',
    lets: 'Your battery’s real capacity', // rdsap 9.05
    without: '5 kWh assumed for each battery',
  },
  {
    doc: 'Solar diverter (sends spare solar power to your hot water): its make and model in writing',
    lets: 'The diverter', // rdsap 9.05
    without: 'The diverter can’t be entered',
  },
  {
    doc: 'Air tightness test certificate from an ATTMA or EAS member, with no major changes to the home since',
    lets: 'Your home’s measured air tightness', // rdsap 10.01
    without: 'A standard value',
  },
  {
    doc: 'Bills showing you get LPG at mains gas prices',
    lets: 'Your LPG priced as mains gas', // rdsap 4.11
    without: 'Standard LPG prices',
  },
]

const day = [
  { t: 'We arrive in your booked time slot', d: 'The time window we agreed when you booked.' },
  { t: 'Outside first', d: 'Photos of the front, back and sides of the home.' }, // EASOB elevations
  { t: 'Room by room', d: 'Measuring each room and photographing the windows, radiators, heating controls and lights.' },
  { t: 'Loft, boiler, cylinder and meters', d: 'Insulation depth in the loft, the label on the boiler, the meters.' }, // rdsap 3.04
  { t: 'A few quick questions', d: 'Such as whether the EPC is for a sale or a let, and anything about the home we can’t see.' }, // rdsap 9.11, 9.12
  { t: 'Payment', d: 'Due when the assessment is done, by bank transfer or card.' }, // terms §6
]

const changes = [
  {
    q: 'Need to change or cancel the time?',
    a: 'It’s free with at least 24 hours’ notice. With less than 24 hours’ notice, a £25 fee may apply to cover travel and time. Message us on WhatsApp as early as you can.', // terms §7
  },
  {
    q: 'What if something can’t be reached on the day?',
    a: 'Your assessor records what they can. Return visits needed because of access issues outside our control are charged at £25 per visit. If the boiler or other heating can’t be inspected and there’s no paperwork for it, the EPC can’t be finished until we can get to it.', // terms §3; rdsap 4.03
  },
  {
    q: 'How do I pay?',
    a: 'Payment is due when the assessment is done, unless we’ve agreed otherwise in writing. We take bank transfer and card.', // terms §6
  },
  {
    q: 'Do I need to tidy up?',
    a: 'No. We only need to reach things: rooms, radiators, windows, the loft hatch, the boiler and the meters.',
  },
]

export default function PreparingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="gd pp">
        <header className="gd-hero pp-hero">
          <div className="gd-w gd-hero__in">
            <div className="gd-hero__copy">
              <GuideCrumbs items={crumbs} />
              <p className="gd-eyebrow">Before your visit</p>
              <h1>Preparing for your EPC assessment</h1>
              <div className="gd-answer">
                <p className="gd-eyebrow">The short answer</p>
                <p>
                  Most visits take 45 to 60 minutes. Your assessor needs to reach every room, the loft hatch, the
                  boiler and the meters. Put out any paperwork for improvements you’ve made and make sure someone can
                  let us in. Payment is due when the visit is done.
                </p>
              </div>
              <div className="pp-acts">
                <a className="ld-btn ld-btn--primary" href={waBooked} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon />
                  Reschedule or ask a question
                </a>
                <a className="gd-link pp-acts__alt" href="#what-to-have-ready">
                  Go to the checklist
                </a>
              </div>
            </div>
            <div className="gd-hero__aside">
              <aside className="gd-short pp-short" aria-label="In short">
                <p className="gd-eyebrow">In short</p>
                <ul>
                  {inShort.map(({ Icon, text }) => (
                    <li key={text}>
                      <Icon width={18} height={18} aria-hidden="true" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        </header>

        <div className="gd-body">
          <div className="gd-w gd-body__in">
            <TableOfContents items={toc} />
            <article className="gd-art pp-art">
              <section id="please-read" className="pp-sec pp-sec--first" aria-labelledby="please-read-h">
                <h2 id="please-read-h">The three things that matter most</h2>
                <ol className="pp-three">
                  {three.map((x, i) => (
                    <li key={x.title}>
                      <span className="pp-three__n num" aria-hidden="true">{i + 1}</span>
                      <div>
                        <h3>{x.title}</h3>
                        <p>{x.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section id="what-to-have-ready" className="pp-sec" aria-labelledby="what-to-have-ready-h">
                <div className="pp-print-head" aria-hidden="true">
                  <b>L&amp;D Energy</b> · EPC visit checklist · WhatsApp or call {site.phone}
                </div>
                <h2 id="what-to-have-ready-h">Your checklist</h2>
                <p className="pp-lede">Grouped by where things are, so you can walk round once. Tick things off as you go.</p>
                <PrepChecklist groups={prepGroups} />
              </section>

              <section id="documents-and-evidence" className="pp-sec" aria-labelledby="documents-and-evidence-h">
                <h2 id="documents-and-evidence-h">Paperwork that helps</h2>
                <p className="pp-lede">
                  Your assessor records what they can see and measure. Anything hidden, like insulation inside a wall
                  or under floorboards, can only be recorded from paperwork that clearly relates to your home. None
                  of it is compulsory. Put out what you have.
                </p>
                <div className="pp-ev" role="region" aria-label="Paperwork and what it changes">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">If you have</th>
                        <th scope="col">We can record</th>
                        <th scope="col">Without it</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evidence.map((row) => (
                        <tr key={row.doc}>
                          <th scope="row">{row.doc}</th>
                          <td data-label="We can record">{row.lets}</td>
                          <td data-label="Without it">{row.without}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div id="why-evidence-matters" className="gd-note pp-note">
                  <Info width={20} height={20} aria-hidden="true" />
                  <div>
                    <h3>Why evidence matters</h3>
                    <p>
                      The method only lets an assessor record what they can see or prove. Paperwork has to clearly
                      relate to your home and show the work was done. Plans or quotes for work, on their own, don’t
                      count, and nor does a verbal assurance on the day.
                    </p>
                    <p>
                      <strong>Evidence changes what can be recorded, not what the rating will be.</strong> It means a
                      real improvement is less likely to be missed.{' '}
                      <Link href="/blog/prepare-for-epc-assessment" className="gd-link">
                        The full preparation and evidence guide
                      </Link>
                    </p>
                  </div>
                </div>
              </section>

              <section id="on-the-day" className="pp-sec" aria-labelledby="on-the-day-h">
                <h2 id="on-the-day-h">On the day</h2>
                <ol className="pp-day">
                  {day.map((s, i) => (
                    <li key={s.t}>
                      <span className="pp-day__n num" aria-hidden="true">{i + 1}</span>
                      <div>
                        <b>{s.t}</b>
                        <p>{s.d}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="pp-after">
                  No mess and nothing invasive. You don’t need to follow us round. If parking near you is tricky, let
                  us know beforehand and we’ll plan around it.
                </p>
              </section>

              <section id="who-needs-to-be-there" className="pp-sec" aria-labelledby="who-needs-to-be-there-h">
                <h2 id="who-needs-to-be-there-h">Who needs to be there</h2>
                <p className="pp-lede">
                  You or your representative, at the property at the booked time. That means an adult who can give us
                  access to every part of the home, including the loft and any locked rooms.
                </p>
                <div id="tenanted-properties" className="pp-tenant">
                  <h3>Tenanted property?</h3>
                  <p>
                    Please let your tenants know about the visit and give them proper notice. They’ll need to let us in
                    and have the rooms easy to reach. If that’s difficult, send us their contact details and we’ll
                    arrange it with them.
                  </p>
                </div>
              </section>

              <section id="after-the-visit" className="pp-sec" aria-labelledby="after-the-visit-h">
                <h2 id="after-the-visit-h">After the visit</h2>
                <p className="pp-lede">
                  We send you a draft of your EPC to check. Once you’re happy with it, we lodge it on the official
                  GOV.UK register and send you the link.
                </p>
                <ul className="pp-when">
                  <li>
                    <span>Standard</span>
                    <b>Ready within 72 hours of the visit</b>
                  </li>
                  <li>
                    <span>Same-day lodgement or a next-day visit</span>
                    <b>Ready on the day of the visit</b>
                  </li>
                </ul>
                <p className="pp-after">
                  A lodged certificate can’t be edited, so the draft is the time to tell us if anything looks wrong.
                </p>
              </section>

              <section id="important" className="pp-sec pp-prose" aria-labelledby="important-h">
                <h2 id="important-h">Worth knowing</h2>

                <h3 id="quote-and-property-complexity">Your price is based on the details you gave us</h3>
                <p>
                  If the home turns out to be materially different, for example a bigger floor area or an extension
                  that wasn’t mentioned, we’ll tell you before we start. We then agree a revised price with you or
                  reschedule, and you’re free to cancel at no charge at that point. We never change an agreed price
                  without speaking to you first.
                </p>

                <h3 id="how-your-epc-rating-is-calculated">Your assessor doesn’t choose the rating</h3>
                <p>
                  We record the home and the evidence. The rating is then calculated by approved software using the
                  government’s method. No assessor can raise or lower a score to order.
                </p>

                <h3 id="why-your-epc-may-differ">Why it may differ from a neighbour’s</h3>
                <p>
                  Ratings are specific to each home. Two homes that look the same from the street can differ because
                  of their position in the terrace, extensions, insulation, glazing, heating and the evidence
                  available on the day.{' '}
                  <Link href="/blog/why-is-my-epc-different">Why EPC ratings differ between similar homes</Link>
                </p>

                <h3 id="rdsap-10">Why it may differ from an older EPC</h3>
                <p>
                  Existing homes have been assessed under RdSAP 10 since {govUk.rdsap10EffectiveFrom}. It’s a more
                  detailed method, so a new EPC shouldn’t be expected to match an older one exactly. That doesn’t
                  mean the older one was wrong, and the change doesn’t always raise or lower a score.{' '}
                  <Link href="/blog/rdsap-10-what-changed-2025">What changed in RdSAP 10</Link>
                  {' · '}
                  <a href={govUk.methodologyNotice} target="_blank" rel="noopener noreferrer">
                    GOV.UK notice of approval
                  </a>
                </p>
              </section>

              <section id="fees-and-changes" className="pp-sec" aria-labelledby="fees-and-changes-h">
                <h2 id="fees-and-changes-h">Changes, fees and payment</h2>
                <dl className="pp-qa">
                  {changes.map((c) => (
                    <div key={c.q}>
                      <dt>{c.q}</dt>
                      <dd>{c.a}</dd>
                    </div>
                  ))}
                </dl>
                <p className="pp-after">
                  The full wording is in our <Link href="/terms" className="gd-link">terms</Link>.
                </p>
              </section>

              <aside className="gd-book pp-end" aria-labelledby="pp-end-h">
                <div>
                  <h2 id="pp-end-h" className="gd-book__h">Need to change something?</h2>
                  <p className="gd-book__p">
                    Message us on WhatsApp to move the time or ask anything before the visit. Open {site.hours}.
                  </p>
                </div>
                <div className="gd-book__acts">
                  <a className="ld-btn ld-btn--primary" href={waBooked} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon />
                    Reschedule or ask a question
                  </a>
                  <div className="pp-end__more">
                    <a href={site.phoneHref} className="gd-link">
                      <Phone width={16} height={16} aria-hidden="true" />
                      {site.phone}
                    </a>
                    <a href={site.emailHref} className="gd-link">
                      <Mail width={16} height={16} aria-hidden="true" />
                      Email
                    </a>
                  </div>
                </div>
              </aside>
            </article>
          </div>
        </div>
      </div>
    </>
  )
}
