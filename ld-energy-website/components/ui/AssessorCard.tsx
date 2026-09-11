import { ShieldCheck, MapPin, ExternalLink } from 'lucide-react'
import { site } from '@/lib/site'

/**
 * Assessor credentials card. Shows the named, accredited assessor and links
 * out to the official government register so anyone can verify independently
 * — the single strongest trust signal we can show on an EPC site.
 *
 * The accreditation number and the verify link are treated as the hero of the
 * card: they are the two things a sceptical customer actually acts on.
 */
export function AssessorCard({
  className,
  note,
  headingLevel = 3,
}: {
  className?: string
  /** Optional line above the credentials, e.g. an invitation to verify independently. */
  note?: string
  headingLevel?: 2 | 3
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-secondary-200 bg-white shadow-premium [overflow-wrap:anywhere] ${className ?? ''}`}
    >
      {/* Header band — sets this apart from an ordinary content card */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-secondary-100 bg-secondary-50/70 px-5 py-3 md:px-6 md:py-4">
        <ShieldCheck className="w-5 h-5 text-accent-600 shrink-0" aria-hidden="true" />
        <Heading className="text-base font-bold text-secondary-900">Your Assessor</Heading>
        <span className="ml-auto rounded-full bg-accent-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-700 ring-1 ring-accent-200">
          Verified
        </span>
      </div>

      <div className="p-5 md:p-6">
        {note && <p className="mb-4 text-[13px] leading-relaxed text-secondary-600 md:mb-5 md:text-sm">{note}</p>}

        <div className="space-y-3 md:space-y-4">
          <dl className="grid grid-cols-2 gap-3 sm:block sm:space-y-3 md:space-y-4">
            <div>
              <dt className="text-xs uppercase tracking-wide font-medium text-secondary-500">Name</dt>
              <dd className="mt-0.5 text-[15px] font-semibold leading-snug text-secondary-900 md:text-base">{site.assessor.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide font-medium text-secondary-500">
                Accreditation
              </dt>
              <dd className="mt-0.5 text-[15px] font-semibold leading-snug text-secondary-900 md:text-base">
                {site.assessor.qualification}
              </dd>
            </div>
          </dl>

          {/* The number people actually type into the register */}
          <dl className="rounded-xl bg-primary-50 px-4 py-2.5 ring-1 ring-primary-100 md:py-3">
            <dt className="text-xs uppercase tracking-wide font-semibold text-primary-700">
              Accreditation number
            </dt>
            <dd className="mt-0.5 font-mono text-lg font-bold tracking-tight text-secondary-900 md:mt-1 md:text-xl">
              {site.assessor.accreditationNumber}
            </dd>
            <dd className="mt-1 text-xs text-secondary-600">{site.assessor.scheme}</dd>
          </dl>
        </div>

        <a
          href={site.assessor.verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 to-accent-700 px-4 py-3 md:mt-5 md:py-3.5 text-sm font-bold text-white shadow-md transition-all hover:from-accent-700 hover:to-accent-800 hover:shadow-lg"
        >
          Verify on the official register
          <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
        </a>

        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-secondary-500 md:mt-4">
          <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
          Based in {site.address.locality} {site.address.postalCode}
        </p>
      </div>
    </div>
  )
}
