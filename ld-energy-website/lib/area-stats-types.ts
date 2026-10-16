/** Shapes for lib/area-stats.ts, which scripts/area-stats.py generates from ONS and MHCLG data. */

/** null where ONS suppresses a cell: fewer than five EPCs for that group. */
type Score = number | null

export type Band = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

export interface BoroughStats {
  code: string
  name: string
  /** Median energy efficiency (SAP) score, 1 to 100+, of each home's latest EPC. */
  median: Score
  /** Percentage of homes whose latest EPC is band C or above (score 69+). */
  pctCPlus: Score
  medianExisting: Score
  medianNew: Score
  pctCPlusExisting: Score
  pctCPlusNew: Score
  medianByAge: { pre1929: Score; from1930to1982: Score; from1983to2011: Score; from2012: Score }
  medianByType: { detached: Score; semi: Score; terraced: Score; flats: Score }
  pctCPlusByType: { detached: Score; semi: Score; terraced: Score; flats: Score }
  /** MHCLG EB1: EPCs lodged for existing homes over the four latest quarters. */
  lodgements: { total: number; bands: Record<Band, number> }
}

export interface RegionStats {
  median: Score
  pctCPlus: Score
  pctBands: Record<Band, Score>
}

export interface NeighbourhoodStats {
  code: string
  /** House of Commons Library name, e.g. "East Village". */
  name: string
  /** ONS name, e.g. "Newham 038". */
  onsName: string
  median: Score
  pctCPlus: Score
  medianExisting: Score
  medianNew: Score
}

interface Source { title: string; publisher: string; url: string; published?: string; edition?: string; coverage?: string; period?: string; licence?: string }

export interface AreaStatsData {
  boroughs: Record<string, BoroughStats>
  london: RegionStats
  england: RegionStats
  stratford: NeighbourhoodStats[]
  sources: { ons: Source; mhclg: Source; msoaNames: Source }
}

/** RdSAP/SAP rating bands by score. */
export const BANDS: { band: Band; min: number; max: number }[] = [
  { band: 'A', min: 92, max: 120 },
  { band: 'B', min: 81, max: 91 },
  { band: 'C', min: 69, max: 80 },
  { band: 'D', min: 55, max: 68 },
  { band: 'E', min: 39, max: 54 },
  { band: 'F', min: 21, max: 38 },
  { band: 'G', min: 1, max: 20 },
]

export function bandFor(score: number): Band {
  return (BANDS.find((b) => score >= b.min) ?? BANDS[BANDS.length - 1]).band
}
