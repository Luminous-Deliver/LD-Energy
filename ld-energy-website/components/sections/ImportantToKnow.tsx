import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { govUk } from '@/lib/site'
import { SectionHeader } from '@/components/ui/SectionHeader'

/**
 * The long-form version of the homepage "Good to know" strip.
 *
 * Three trust messages that are easy to get wrong. The quote one must not read
 * as "we turn up and put the price up"; the rating one is a compliance
 * statement as much as a sales one; and the comparison one must explain why
 * certificates legitimately differ without implying another assessor erred.
 */
export function ImportantToKnow({ govUkHref }: { govUkHref: string }) {
  return (
    <Section variant="muted" tier="secondary" id="important" className="scroll-mt-24 md:scroll-mt-28">
      <div className="max-w-3xl">
        <SectionHeader
          eyebrow="Important"
          heading="Things worth knowing before your EPC"
        />

        <h3 id="quote-and-property-complexity" className="mt-8 scroll-mt-24 text-xl font-bold text-secondary-900 md:scroll-mt-28">
          Your quote is based on the details you give us
        </h3>
        <p className="mt-2 leading-relaxed text-secondary-700">
          We price from the property information supplied before the appointment. If the property is
          materially larger or more complex than described — a significant undisclosed extension, a
          loft conversion that was not mentioned, or an unusually complex layout — we will explain any
          adjustment and confirm it with you <strong className="font-semibold text-secondary-900">before
          the assessment starts</strong>. You will not find a different number on the invoice
          afterwards. In practice this is rare; most quotes stand exactly as given.
        </p>

        <h3 id="how-your-epc-rating-is-calculated" className="mt-8 scroll-mt-24 text-xl font-bold text-secondary-900 md:scroll-mt-28">
          Your EPC rating is not chosen by the assessor
        </h3>
        <p className="mt-2 leading-relaxed text-secondary-700">
          This is the question we are asked most, so it is worth being direct. Our role is to survey
          the property, record its physical characteristics and systems, verify what evidence we can
          accept, and enter that data. The rating is then calculated from that data by the
          government-approved methodology and software.
        </p>
        <p className="mt-3 leading-relaxed text-secondary-700">
          No assessor can raise or lower a score to reach a requested result. If we could, the
          certificate would be worth nothing to the buyer, tenant or lender relying on it. What we{' '}
          <em>can</em> do is make sure everything genuinely present is recorded and evidenced — which
          is what the{' '}
          <Link href="#documents-and-evidence" className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800">
            evidence section above
          </Link>{' '}
          is for.
        </p>

        <h3 id="why-your-epc-may-differ" className="mt-8 scroll-mt-24 text-xl font-bold text-secondary-900 md:scroll-mt-28">
          Why your EPC may differ from a neighbour&rsquo;s or an older certificate
        </h3>
        <p className="mt-2 leading-relaxed text-secondary-700">
          EPC ratings are specific to the individual property. Two neighbouring homes can receive
          different ratings even when they look almost identical from the street. Things that
          legitimately change the result include:
        </p>
        <ul className="mt-3 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
          {[
            'Position in the terrace — a mid-terrace home has fewer exposed walls than an end-terrace or semi',
            'Floor area, extensions and layout',
            'Wall, roof and floor construction and insulation',
            'Loft insulation depth, and whether it can actually be inspected',
            'Window and glazing age and specification',
            'Boiler, heating controls and hot-water cylinder',
            'Heat pumps, solar PV or other renewable systems',
            'Lighting',
            'Extensions or loft conversions built at different times',
            'The evidence available on the day',
            'The methodology used to calculate the certificate',
            'The information recorded during the previous assessment',
          ].map((t) => (
            <li key={t} className="flex gap-2 text-sm leading-relaxed text-secondary-700">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary-500" />
              <span>{t}</span>
            </li>
          ))}
        </ul>

        <h4 id="rdsap-10" className="mt-8 scroll-mt-24 text-lg font-bold text-secondary-900 md:scroll-mt-28">
          The methodology changed in June 2025: RdSAP 10
        </h4>
        <p className="mt-2 leading-relaxed text-secondary-700">
          Existing homes have been assessed under the updated RdSAP 10 methodology since{' '}
          {govUk.rdsap10EffectiveFrom}, replacing the approach used for older EPCs. RdSAP is a
          reduced-data version of the full SAP calculation, used for existing homes because the
          complete construction data a new-build assessment relies on is rarely available for a
          property already standing.
        </p>
        <p className="mt-3 leading-relaxed text-secondary-700">
          Older and newer EPCs may differ because the methodology, the data requirements, the
          property evidence and the technologies considered have all evolved. That is a change in
          how a home is assessed and recorded — not a judgement that older homes or older building
          standards are now &ldquo;bad&rdquo;, and not a requirement to modernise anything.
        </p>
        <p className="mt-3 leading-relaxed text-secondary-700">
          Because of this, a new EPC should not be expected to reproduce an older certificate
          exactly, even if the property itself has not changed very much. An older EPC reflects the
          methodology and information available at the time; a current EPC assesses the property
          using today&rsquo;s approved methodology.
        </p>
        <p className="mt-3 leading-relaxed text-secondary-700">
          This does not mean an older EPC was automatically wrong, or that RdSAP 10 will always
          produce a higher or lower rating. The result depends on the individual property, the
          features present, the evidence available and the methodology used. RdSAP 10 remains the
          approved methodology for existing dwellings in England and Wales under the{' '}
          <a
            href={govUk.methodologyNotice}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800"
          >
            current GOV.UK notice of approval
          </a>
          .
        </p>

        <p className="mt-3 leading-relaxed text-secondary-700">
          Previous EPCs can also contain different assumptions or recorded information. If an older
          certificate looks inconsistent with the property, it is worth comparing the underlying
          property details rather than the letter rating alone — and genuine errors are possible,
          though they should not be presumed.
        </p>

        <p className="mt-5 rounded-2xl border border-primary-200 bg-primary-50/70 p-5 font-semibold text-secondary-900">
          Comparing EPCs? Compare the property details and the assessment methodology — not just the
          letter rating.
        </p>

        <p className="mt-5 text-sm leading-relaxed text-secondary-600">
          Official guidance on energy certificates is published at{' '}
          <a
            href={govUkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800"
          >
            GOV.UK
          </a>
          . For the longer explanation, see{' '}
          <Link href="/guides/why-is-my-epc-different" className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800">
            why EPC ratings differ between similar homes
          </Link>
          .
        </p>
      </div>
    </Section>
  )
}
