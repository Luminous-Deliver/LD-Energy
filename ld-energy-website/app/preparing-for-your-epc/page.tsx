import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowDown, CalendarClock, Clock, CreditCard, FileText, Home, Info, KeyRound, Mail, Phone } from 'lucide-react'
import { GuideCrumbs } from '@/components/blog/GuideCrumbs'
import { GuideFeedback } from '@/components/blog/GuideFeedback'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { ReadNext, type NextStep } from '@/components/inner/ReadNext'
import { ratingQuestions } from '@/lib/faq'
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
 * Added 23/10 night: what-to-prepare, important-notes. Never rename an id: Abdul sends single sections to customers.
 *
 * Order (Abdul 23/10 night): "Please read" first, as on the old live page: What to prepare (the insulation certificate
 * or guarantee number, then "See which documents may be useful"), then Important notes, whose first three entries
 * carry the homepage's "Three things worth knowing first" titles and wording (components/sections/home/HomePage.tsx
 * worthKnowing) and link down to the full answers. The insulation number is Abdul's stated requirement; it serves
 * rdsap 9.02 (paperwork must be shown to relate to this property and to work carried out).
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
  { id: 'please-read', text: 'Please read first', level: 2 },
  { id: 'what-to-prepare', text: 'What to prepare', level: 3 },
  { id: 'important-notes', text: 'Important notes', level: 3 },
  { id: 'what-to-have-ready', text: 'What to have ready', level: 2 },
  { id: 'documents-and-evidence', text: 'Documents that may help', level: 2 },
  { id: 'important', text: 'Quotes, ratings and older EPCs', level: 2 },
  { id: 'what-counts', text: 'What counts towards your rating', level: 3 },
  { id: 'rating-questions', text: 'When your rating comes back', level: 3 },
  { id: 'on-the-day', text: 'On the day', level: 2 },
  { id: 'who-needs-to-be-there', text: 'Who needs to be there', level: 2 },
  { id: 'after-the-visit', text: 'After the visit', level: 2 },
  { id: 'fees-and-changes', text: 'Changes, fees and payment', level: 2 },
]

/* The three sections Abdul sends on their own (24/10/2026): before the visit, and the two usual complaints */
const shareLinks = [
  { id: 'please-read', label: 'Please read before your EPC' },
  { id: 'why-your-epc-may-differ', label: 'Why your EPC may differ' },
  { id: 'how-your-epc-rating-is-calculated', label: 'How your rating is calculated' },
  { id: 'what-counts', label: 'Done work? What counts' },
  { id: 'rating-questions', label: 'When your rating comes back' },
]

const readNext: NextStep[] = [
  { kicker: 'On the day', title: 'What happens during an EPC assessment', href: '/blog/what-happens-during-epc-assessment',
    text: 'What your assessor records, room by room, and how long it takes.' },
  { kicker: 'Comparing ratings', title: 'Why your EPC differs from your neighbour’s', href: '/blog/why-is-my-epc-different',
    text: 'Terrace position, insulation, evidence and the method, explained.' },
  { kicker: 'The method', title: 'RdSAP 10: what changed in 2025', href: '/blog/rdsap-10-what-changed-2025',
    text: 'Why a new EPC may not match an older one, and the August 2026 update.' },
  { kicker: 'After your EPC', title: 'How to improve your EPC rating', href: '/blog/how-to-improve-epc-rating',
    text: 'Which measures to look at first, and what affects how much they count.' },
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
  { Icon: Home, text: 'Every room, the loft hatch (if there is one), the boiler and the meters easy to reach.' },
  { Icon: FileText, text: 'Any paperwork for improvements out ready.' },
  { Icon: CreditCard, text: 'Payment when the visit is done, by cash, bank transfer or card.' },
  { Icon: CalendarClock, text: 'Change or cancel free with at least 24 hours’ notice.' },
]

/* What to prepare: the old page's two points, kept short, with the insulation rule Abdul asked to be explicit */
const prepare = [
  {
    title: 'Access',
    text: 'Every room, radiator and window, the loft hatch (if there is one), the boiler and hot water cylinder, the heating controls and the meters. Anything locked or blocked on the day can’t be recorded.',
  },
  {
    title: 'Insulation evidence',
    // rdsap 9.02, 3.03a, 3.03b
    text: 'If insulation is hidden, inside a wall, under a floor or under a boarded loft, your assessor can only record it from paperwork. Have the original insulation certificate or guarantee ready, with its certificate or guarantee number. It must show it’s for your home and how thick the insulation is: without the thickness it can’t be used. You can also send it to us by WhatsApp or email before the visit. Without it, the method has to use the default for the age of the home.',
  },
  {
    title: 'Other paperwork, if you have it',
    // rdsap 3.12a, 4.01b, 9.05
    text: 'Window certificates such as FENSA or CERTASS, heat pump paperwork showing the flow temperature, and solar panel or MCS documents. None of it is compulsory.',
  },
]

/* Important notes: the homepage's "Three things worth knowing first", same titles, wording and order, each linking to
   the full answer further down; then turnaround, as on the old page. */
const notes = [
  {
    title: 'Tell us about every floor',
    text: 'Your price is based on the details you send. A flat on two floors (a maisonette), an extension or a loft room can change it, so mention them. Anything different on the day is agreed before the assessment begins.',
    href: '#quote-and-property-complexity',
    link: 'More about quotes and property complexity',
  },
  {
    title: 'We can’t add a point or two',
    text: 'We record the property and the approved software works out the score. Nobody can adjust it by hand. Evidence of improvements you’ve made does count, so have it ready.',
    href: '#how-your-epc-rating-is-calculated',
    link: 'How your EPC rating is calculated',
  },
  {
    title: 'Different from next door, or your old EPC?',
    text: 'Existing homes have used RdSAP 10, a more detailed method, since June 2025, so an older EPC may not match. A neighbour’s can differ too, even in an identical home: their paperwork, when it was assessed, an end or mid terrace, or a different boiler can all change it.',
    href: '#why-your-epc-may-differ',
    link: 'Why your EPC may differ',
  },
  {
    title: 'Planning work to reach a rating?',
    text: 'Not everything that saves energy raises an EPC rating, and some upgrades count for much less than people expect. Ask us before you spend. We record the home as it is, so we can’t promise a rating before the visit.',
    href: '#what-counts',
    link: 'What counts towards your rating',
  },
  {
    title: 'When your EPC is ready',
    // booking-copy.ts lodgedWhen
    text: 'Within 72 hours of the visit, or on the day of the visit if you chose same-day lodgement or a next-day visit.',
    href: '#after-the-visit',
    link: 'What happens after the visit',
  },
]

/* Why two similar homes, or an old and a new EPC, can differ: the old live page's list, trimmed */
const differs = [
  'Position in the terrace: a mid-terrace home has fewer outside walls than an end-terrace or a semi',
  'Floor area, layout, extensions and loft conversions',
  'How the walls, roof and floor are built and insulated',
  'Loft insulation depth, and whether the loft can be inspected',
  'The age and type of the windows',
  'The boiler, heating controls and hot water cylinder',
  'Heat pumps, solar panels and batteries',
  'Lighting',
  'Paperwork: one home had evidence of its insulation or windows, the other didn’t',
  'When it was assessed: before RdSAP 10 in June 2025, or before a later update to the method’s rules',
  'The method used, and what was recorded at the last assessment',
  'Occasionally, a mistake on one of the certificates',
]

/* Abdul 23/10/2026: the documents in four plain groups. The table below is kept for the blog's reference only. */
const docGroups = [
  {
    title: 'Windows and doors',
    items: [
      'Installation certificates, such as FENSA or CERTASS', // rdsap 3.12a
      'Invoices from the installer',
      'Anything showing the installation date or the specification fitted, such as a window energy rating', // rdsap 3.10
      'Paperwork for an insulated door, with its U-value or product reference', // rdsap 3.09
    ],
  },
  {
    title: 'Insulation and building fabric',
    items: [
      'Loft, wall or floor insulation records showing what was installed, with the certificate or guarantee number', // rdsap 9.02, 3.03a
      'The insulation thickness: without it, insulation paperwork can’t be used', // rdsap 3.03b, 3.04
      'Building Control completion paperwork for an extension or loft conversion. Planning papers alone aren’t enough.', // rdsap 3.05b
    ],
  },
  {
    title: 'Heating and hot water',
    items: [
      'Boiler make and model: a photo of the data plate is usually enough',
      'Boiler installation or service paperwork',
      'Hot water cylinder details, including insulation type and thickness',
      'Heat pump installation or commissioning documents',
      'Design or flow temperature information, where you have it', // rdsap 4.01b
    ],
  },
  {
    title: 'Solar and renewables',
    items: [
      'MCS documentation, where you have it', // rdsap 9.05
      'Commissioning or installation paperwork',
      'System details, such as panel capacity in kWp or inverter details',
      'Home battery make, model and usable capacity in kWh', // rdsap 9.05
    ],
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
    doc: 'Insulation certificate or guarantee for walls, floors or the loft, with its certificate or guarantee number, showing it’s for your home and the thickness. A cavity wall insulation guarantee counts.',
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
  { t: 'Payment', d: 'Due when the assessment is done, by cash, bank transfer or card.' }, // terms §6
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
    a: 'Payment is due when the assessment is done, unless we’ve agreed otherwise in writing. We take cash, bank transfer and card.', // terms §6
  },
  {
    q: 'Do I need to tidy up?',
    a: 'No. We only need to reach things: rooms, radiators, windows, the loft hatch (if there is one), the boiler and the meters.',
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
                  Most visits take 45 to 60 minutes. Your assessor needs to reach every room, the loft hatch (if there is one), the
                  boiler and the meters. Put out any paperwork for improvements you’ve made and make sure someone can
                  let us in. Payment is due when the visit is done.
                </p>
              </div>
              <div className="pp-acts">
                <a className="ld-btn ld-btn--primary" href={waBooked} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon />
                  Reschedule or ask a question
                </a>
                <a className="gd-link pp-acts__alt" href="#what-to-prepare">
                  What to prepare
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
            <TableOfContents items={toc} share={shareLinks} />
            <article className="gd-art pp-art">
              <section id="please-read" className="pp-sec pp-sec--first" aria-labelledby="please-read-h">
                <h2 id="please-read-h">Please read before your EPC</h2>
                <p className="pp-lede">
                  These points help the visit run to time, and explain how quotes and EPC ratings work.
                </p>

                <div id="what-to-prepare" className="pp-sub">
                  <h3>What to prepare</h3>
                  {/* what the assessor needs to reach: loft hatch, boiler, cylinder, meters (illustrations board 24/10) */}
                  {/* eslint-disable-next-line @next/next/no-img-element -- decorative; next/image is unoptimised on Pages */}
                  <img className="pp-art" src="/illustrations/access-900.webp" srcSet="/illustrations/access-900.webp 900w, /illustrations/access-1600.webp 1600w"
                    sizes="(min-width: 1100px) 720px, 92vw" alt="" width={900} height={500} loading="lazy" decoding="async" />
                  <ul className="pp-list">
                    {prepare.map((x) => (
                      <li key={x.title}>
                        <b>{x.title}</b>
                        <p>{x.text}</p>
                      </li>
                    ))}
                  </ul>
                  <a className="gd-link pp-more" href="#documents-and-evidence">
                    See which documents may be useful
                    <ArrowDown width={16} height={16} aria-hidden="true" />
                  </a>
                </div>

                <div id="important-notes" className="pp-sub">
                  <h3>Important notes</h3>
                  <ul className="pp-list">
                    {notes.map((n) => (
                      <li key={n.title}>
                        <b>{n.title}</b>
                        <p>{n.text}</p>
                        <a className="gd-link pp-more" href={n.href}>
                          {n.link}
                          <ArrowDown width={16} height={16} aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section id="what-to-have-ready" className="pp-sec" aria-labelledby="what-to-have-ready-h">
                <div className="pp-print-head" aria-hidden="true">
                  <b>L&amp;D Energy</b> · EPC visit checklist · WhatsApp or call {site.phone}
                </div>
                <h2 id="what-to-have-ready-h">What to have ready</h2>
                <p className="pp-lede">Grouped by where things are, so you can walk round once. Tick things off as you go.</p>
                <PrepChecklist groups={prepGroups} />
              </section>

              <section id="documents-and-evidence" className="pp-sec" aria-labelledby="documents-and-evidence-h">
                <h2 id="documents-and-evidence-h">Documents and evidence that may help</h2>
                <p className="pp-lede">
                  Your assessor records what they can see and measure. Anything hidden, like insulation inside a wall
                  or under floorboards, can only be recorded from paperwork that clearly relates to your home. None
                  of it is compulsory. Put out what you have, and the originals if you can: they are preferred to
                  photos or copies.
                </p>
                <div className="pp-docs">
                  {docGroups.map((g, i) => (
                    <div key={g.title} className="pp-docs__g">
                      <h3><span className="num" aria-hidden="true">{i + 1}.</span> {g.title}</h3>
                      <ul>
                        {g.items.map((it) => <li key={it}>{it}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
                <p className="pp-after">
                  You can also send paperwork ahead by WhatsApp or email. Originals on the day are still best, and
                  insulation paperwork must show the thickness.
                </p>
                <h3 id="what-each-document-records" className="pp-ev-h">What each document lets us record</h3>
                <p className="pp-after pp-ev-lede">More detail for each kind of paperwork, and what happens without it.</p>
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

              <section id="important" className="pp-sec pp-prose" aria-labelledby="important-h">
                <h2 id="important-h">Quotes, ratings and older EPCs</h2>
                <p className="pp-lede">The full answers to the questions we’re asked most.</p>

                <h3 id="quote-and-property-complexity">Your quote and property complexity</h3>
                <p>
                  We price from the details you send before the visit. If the home turns out to be materially
                  different, for example a bigger floor area, a different property type, or an extension or loft
                  conversion that wasn’t mentioned, we’ll tell you before we start. We then agree a revised price with
                  you or reschedule, and you’re free to cancel at no charge at that point. We never change an agreed
                  price without speaking to you first, so there’s no surprise on the invoice afterwards.
                </p>

                <h3 id="how-your-epc-rating-is-calculated">How your EPC rating is calculated</h3>
                <p>
                  Your assessor surveys the home, records how it’s built and heated, checks the evidence and enters
                  it. Approved software then calculates the rating using the government’s method. No assessor can raise
                  or lower a score to order. If they could, the certificate would be worth nothing to the buyer, tenant
                  or lender relying on it.
                </p>
                <p>
                  <strong>That includes us.</strong> We can’t change your rating, before or after the visit, and we
                  can’t lodge a different one because it was expected or needed for a sale, a let or a mortgage.
                </p>
                <p>
                  What we can do is make sure everything that’s really there gets recorded and backed by evidence.
                  Have your paperwork out on the day, or send it to us before the visit: the{' '}
                  <a href="#documents-and-evidence">documents section</a> shows what helps.
                </p>

                <h3 id="what-counts">What counts towards your rating</h3>
                <p>
                  Many homeowners renovate and then find the rating hasn’t moved as far as they hoped. Two things are
                  worth knowing:
                </p>
                <ul className="pp-reasons">
                  <li>
                    <strong>Not every change counts towards an EPC rating.</strong> The EPC measures a fixed set of
                    things, so work that makes a home nicer, or even saves energy, may not move the score.
                  </li>
                  <li>
                    <strong>The higher bands are much harder to reach.</strong> Going from C to B takes far more than
                    moving between the lower bands, and it usually needs solar panels.
                  </li>
                </ul>
                <p>Some examples of what does and doesn’t count:</p>
                <ul className="pp-reasons">
                  <li>
                    Loft insulation at both the floor of the loft (the joists) and the roof slope (the rafters): only the
                    joist insulation is counted, so the rafter insulation adds nothing to the rating.
                  </li>
                  <li>
                    Underfloor heating run from the same boiler as your radiators: both are recorded, each with the same
                    boiler, but the rating follows the boiler far more than how the heat is delivered, so the underfloor
                    only moves it a little. With a heat pump, if radiators heat half the floor area or more, only the
                    radiators are counted.
                  </li>
                  <li>Hidden insulation only counts with paperwork that shows the thickness.</li>
                  <li>
                    The loft: if there’s no loft hatch or other way in, it’s recorded as no access and the method uses
                    the default for the age of the home. So if your loft has no insulation at all, the rating may be
                    better with no access to the loft, where the default for its age is used, than with access, where
                    none is recorded.
                    If you can get into the loft, your assessor measures the insulation that’s actually there. A hatch
                    that’s there but can’t be opened on the day is recorded as access with the insulation unknown, not
                    as no access.
                  </li>
                </ul>
                <p>
                  These rules are set by the government’s method, not by us, and we can’t change them, so we can’t
                  promise a particular rating before the visit. If you want to know where you stand first, an{' '}
                  <Link href="/services/epc-pre-assessment">EPC Pre-Assessment</Link> gives you the rating without
                  lodging it, and the <Link href="/services/epc-improvement-plan">EPC Improvement Plan</Link> puts the
                  upgrades in order for your home.
                </p>

                <h3 id="why-your-epc-may-differ">Why your EPC may differ</h3>
                <p>
                  Ratings are specific to each home. Two homes that look the same from the street can score
                  differently, for good reasons:
                </p>
                <ul className="pp-reasons">
                  {differs.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <p>
                  Comparing EPCs? Compare the property details on each certificate, not just the letter.{' '}
                  <Link href="/blog/why-is-my-epc-different">Why EPC ratings differ between similar homes</Link>
                </p>

                <h4 id="rdsap-10">The method changed in June 2025: RdSAP 10</h4>
                <p>
                  Existing homes have been assessed under the updated RdSAP 10 method since {govUk.rdsap10EffectiveFrom},
                  replacing the approach used for older EPCs. RdSAP is a reduced-data version of the full SAP
                  calculation. It’s used for existing homes because the complete construction data a new-build
                  assessment relies on is rarely available for a home that’s already standing.
                </p>
                <p>
                  Older and newer EPCs may differ because the method, the data it needs, the evidence for the home and
                  the technologies it considers have all changed. That’s a change in how a home is assessed and
                  recorded. It isn’t a judgement that older homes or older building standards are now “bad”, and it
                  isn’t a requirement to modernise anything.
                </p>
                <p>
                  The standards have moved on too. Heating, insulation and glazing have improved a lot in the last
                  decade, and the method’s assumptions, such as fuel prices and how each system performs, are updated
                  to match. So a home that hasn’t changed since its EPC five or six years ago can score lower today,
                  because it is now measured against newer standards. It doesn’t always go down: it depends on the home.
                </p>
                <p>
                  So a new EPC shouldn’t be expected to reproduce an older certificate exactly, even if the home itself
                  hasn’t changed much. An older EPC reflects the method and information available at the time; a
                  current EPC assesses the home using today’s approved method.
                </p>
                <p>
                  That doesn’t mean an older EPC was automatically wrong, or that RdSAP 10 will always produce a higher
                  or lower rating. The result depends on the home, the features present, the evidence available and
                  the method used. RdSAP 10 is the approved method for existing homes in England and Wales under the
                  current GOV.UK notice of approval.
                </p>
                <p>
                  Older EPCs can also hold different assumptions or recorded information. If an older certificate
                  looks inconsistent with the home, compare the property details on it rather than the letter alone.
                  Genuine errors are possible, though they shouldn’t be presumed.{' '}
                  <Link href="/blog/rdsap-10-what-changed-2025">What changed in RdSAP 10</Link>
                  {' · '}
                  <a href={govUk.methodologyNotice} target="_blank" rel="noopener noreferrer">
                    GOV.UK notice of approval
                  </a>
                </p>
              
                <h3 id="rating-questions">When your rating comes back</h3>
                <p>The questions we’re asked most once the rating is in, answered straight.</p>
                <dl className="pp-qa pp-qa--rating">
                  {ratingQuestions.map((x) => (
                    <div key={x.id} id={x.id}>
                      <dt>{x.q}</dt>
                      <dd>
                        {x.a}
                        {x.links?.map((l) => (
                          <span key={l.href}>
                            {' '}
                            <a href={l.href.replace('/preparing-for-your-epc', '')} className="gd-link">{l.label}</a>
                          </span>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section id="on-the-day" className="pp-sec" aria-labelledby="on-the-day-h">
                <h2 id="on-the-day-h">On the day</h2>
                <p className="pp-lede">
                  Your assessor photographs and measures each room, records the heating system, insulation, glazing
                  and lighting, and reads the meters. There is no testing, no mess and nothing invasive.
                </p>
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
                  We send you a draft of your EPC to check. Once you’re happy with it, we lodge the certificate on the
                  official GOV.UK EPC register and send you the link as soon as it’s live.
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
                  A lodged certificate can’t be edited, so the draft is your chance to flag anything that looks wrong.
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
              {/* Abdul 28/10/2026: the same "was this useful" close as every guide */}
              <GuideFeedback slug="preparing-for-your-epc" waHref={`${site.whatsappHref}?text=${encodeURIComponent("Hi, I read your EPC preparation guide. It didn't cover: ")}`} email={site.email} emailHref={site.emailHref} />
            </article>
          </div>
        </div>
      </div>
      {/* Read next (Abdul 24/10/2026): the guides that answer what people ask before and after the visit */}
      <ReadNext steps={readNext} />
    </>
  )
}
