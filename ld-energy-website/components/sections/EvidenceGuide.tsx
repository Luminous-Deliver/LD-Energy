import Link from 'next/link'
import { AlertCircle, Flame, PanelsTopLeft, Sun, Layers } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'

/**
 * Supporting evidence for an EPC assessment.
 *
 * The claim-safety rules here matter more than the copy. Nothing on this page
 * may say that documents guarantee a better rating, that any particular
 * document is compulsory, or that an MCS certificate is required — each is
 * either untrue or unprovable. Everything is phrased as "may be useful" and
 * "where the assessor can accept it", because the assessor decides what
 * constitutes valid evidence under the methodology, not the customer and not
 * this page.
 */
const groups = [
  {
    Icon: PanelsTopLeft,
    title: 'Windows and doors',
    items: [
      'Installation certificates',
      'Invoices from the installer',
      'Anything showing the installation date or the specification fitted',
    ],
  },
  {
    Icon: Layers,
    title: 'Insulation and building fabric',
    items: [
      'Loft, wall or floor insulation records showing what was installed',
      'Building-control or construction paperwork for an extension',
      'Insulation specification or thickness — the detail the methodology needs',
      'Documentation for insulated doors, where relevant',
    ],
  },
  {
    Icon: Flame,
    title: 'Heating and hot water',
    items: [
      'Boiler make and model — a photo of the data plate is usually enough',
      'Boiler installation or service paperwork',
      'Hot-water cylinder details, including insulation type and thickness',
      'Heat-pump installation or commissioning documents',
      'Design or flow-temperature information, where it is available',
    ],
  },
  {
    Icon: Sun,
    title: 'Solar and renewables',
    items: [
      'MCS documentation, where you have it',
      'Commissioning or installation paperwork',
      'System specifications, such as panel capacity or inverter details',
    ],
  },
]

export function EvidenceGuide() {
  return (
    <Section variant="default" tier="secondary" id="documents-and-evidence" className="scroll-mt-24 md:scroll-mt-28">
      <div className="max-w-3xl">
        <SectionHeader
          eyebrow="Supporting evidence"
          heading="Documents and evidence that may help"
          intro="An EPC is based on what the assessor can verify during the visit, together with supporting evidence they can accept. This matters most for concealed insulation — behind walls or floors, under boarded lofts, in extensions or doors. If it cannot be safely accessed, measured and photographed, it can only be recorded where documentation confirms what was installed, including the insulation thickness where the methodology requires it. Otherwise the applicable default or age-based assumption has to be used."
        />
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {groups.map(({ Icon, title, items }) => (
          <li key={title} className="rounded-2xl border border-secondary-200 bg-white p-5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 ring-1 ring-primary-100">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <h3 className="mt-3 text-base font-bold text-secondary-900">{title}</h3>
            <ul className="mt-2 space-y-1.5">
              {items.map((i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-secondary-600">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-secondary-400" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex max-w-3xl items-start gap-3 rounded-2xl border border-warm-200 bg-warm-50 p-5">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warm-600" aria-hidden="true" />
        <div>
          <p className="font-semibold text-secondary-900">None of this is compulsory</p>
          <p className="mt-1 text-sm leading-relaxed text-secondary-700">
            You do not need any of these documents to have an EPC carried out, and no single document
            is required. They are simply the things that sometimes help, where they exist and where
            the assessor can accept them as evidence under the assessment methodology.
          </p>
        </div>
      </div>

      <div id="why-evidence-matters" className="mt-5 max-w-3xl scroll-mt-24 md:scroll-mt-28">
        <h3 className="text-lg font-bold text-secondary-900">Why evidence matters</h3>
        <p className="mt-2 leading-relaxed text-secondary-700">
          An assessor cannot simply accept that concealed insulation exists. Where it cannot be
          safely accessed, measured and photographed, documentary evidence is needed — and it has to
          carry enough detail to establish what was actually installed, including the insulation
          thickness where the methodology requires it. Without that, the approved methodology
          requires a default or age-based assumption instead, which can be less favourable than what
          is genuinely there. The assessor is also responsible for validating the information used,
          which is why a verbal assurance on the day is not enough on its own.
        </p>
        <p className="mt-3 leading-relaxed text-secondary-700">
          It is worth being precise about what that means:{' '}
          <strong className="font-semibold text-secondary-900">
            evidence changes what can legitimately be recorded, not what the rating will be
          </strong>
          . Bringing paperwork does not guarantee a better result — it just means a genuine
          improvement is less likely to go uncredited.{' '}
          <Link
            href="/guides/prepare-for-epc-assessment"
            className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800"
          >
            Read the full preparation and evidence guide
          </Link>
          .
        </p>
      </div>
    </Section>
  )
}
