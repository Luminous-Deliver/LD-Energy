import { Info } from 'lucide-react'

/**
 * The standing caveat for any article that discusses improvement measures.
 *
 * Articles used to publish claims like "cavity wall insulation adds 5–10 SAP
 * points". That is not something anyone can promise: the effect of a measure is
 * calculated by the approved methodology from the whole dwelling — existing
 * construction, services, starting rating, dimensions, fuel and heating system
 * — so the same measure lands differently on two different homes.
 *
 * It also matters commercially that we are the assessor, not the installer. We
 * do not quote for or carry out insulation, glazing or heating work, and copy
 * that implies otherwise would be misleading.
 *
 * Rendered as one component so the wording is identical everywhere and can be
 * corrected in one place.
 */
export function EpcEffectNote({ measure = 'these measures' }: { measure?: string }) {
  return (
    <aside className="gd-note">
      <Info width={20} height={20} aria-hidden="true" />
      <div>
        <p>
          <strong>
            The effect on your EPC is property-specific.
          </strong>{' '}
          How much {measure} change a rating is calculated by the approved methodology from the whole
          dwelling — existing construction and services, starting rating, dimensions, fuel and
          heating system. No measure adds a fixed number of points.
        </p>
        <p>
          Your EPC recommendation report shows an indicative rating after the recommended measures{' '}
          <em>for that particular property</em>, which is the figure worth working from.
        </p>
        <p className="q">
          We carry out the EPC assessment. We do not quote for or install insulation, glazing,
          heating systems or other retrofit work — always get quotes from suitably qualified
          installers.
        </p>
      </div>
    </aside>
  )
}
