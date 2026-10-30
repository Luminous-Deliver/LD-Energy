/** Shapes for lib/borough-stats.ts, which scripts/borough-stats.py generates from the GOV.UK EPC register. */
import type { AreaBand } from './floor-area'

/** Current or potential EPC rating, grouped the way the area pages show it. */
export type RatingGroup = 'AtoC' | 'D' | 'E' | 'FtoG'

export interface RatingMix {
  /** Certificates with a rating A to G. */
  n: number
  counts: Record<RatingGroup, number>
  /** Percentages to one decimal place. */
  pct: Record<RatingGroup, number>
}

export type AgeGroup = 'pre1930' | 'from1930to1966' | 'from1967to1990' | 'from1991to2011' | 'from2012'
export type WallGroup = 'solidUninsulated' | 'solidInsulated' | 'cavityUninsulated' | 'cavityInsulated' | 'systemBuilt' | 'timberFrame' | 'other'
export type HeatingGroup = 'mainsGas' | 'communal' | 'electric' | 'heatPump' | 'other'

/** Percentages of the certificates where the field is recorded; `n` is that count. */
export interface Mix<K extends string> {
  n: number
  pct: Record<K, number>
}

export interface DistrictStats {
  /** Postcode outward code, e.g. "E15". Never a full postcode. */
  district: string
  n: number
  pctAtoC: number
  /** Median total floor area in m². */
  medianArea: number
}

export interface AreaSummary {
  /** Page slug from lib/boroughs.ts ("london" for the all-London row). */
  slug: string
  name: string
  /** ONS local authority code; null for London and Stratford. */
  code: string | null
  /** RdSAP certificates (existing homes) lodged in the period. */
  certificates: number
  ratings: RatingMix
  /** The same mix per calendar year of lodgement; the latest year is part-year. */
  byYear: Record<string, RatingMix>
  privateRented: {
    /** Certificates whose tenure is "rented (private)". */
    n: number
    pctBelowC: number
    /** Below the E minimum for letting today. */
    nFtoG: number
    pctFtoG: number
  }
  /** Median total floor area in m², whole numbers. */
  floorArea: { median: number | null; flats: number | null; houses: number | null }
  /** Certificates by L&D's pricing bands (boundaries read from lib/site.ts), in band order. */
  sizeBands: { id: AreaBand; n: number; pct: number }[]
  commonestBand: { id: AreaBand; pct: number }
  /** Flats and maisonettes as a share of all certificates. */
  pctFlats: number
  /** Private lettings plus marketed sales a year, averaged over the last three full years. */
  marketPerYear: number
  /** Private lettings and marketed sales as shares of all certificates. */
  pctLettings: number
  pctSales: number
  age: Mix<AgeGroup>
  walls: Mix<WallGroup>
  heating: Mix<HeatingGroup>
  potential: {
    /** Share whose potential rating is A to C. */
    pctAtoC: number
    /** Of the certificates rated D to G today, the share whose potential rating is A to C. */
    pctBelowCCouldReachC: number
  }
  /** Postcode districts with at least `thresholds.districtMin` certificates, largest first. Empty for London. */
  districts: DistrictStats[]
  /** Certificates in districts below the threshold, folded together. */
  otherDistricts: { n: number; districts: number }
}

export interface StratfordSummary extends AreaSummary {
  /** Postcode districts that make up the Stratford page. */
  definedBy: string[]
  /** Certificates per local authority slug within those districts. */
  localAuthorities: Record<string, number>
}

/** One rating group's estimated running costs (£ a year unless stated), from the certificates' own cost figures. */
export interface RunningCostBand {
  id: 'B' | 'C' | 'D' | 'E' | 'FtoG'
  n: number
  /** Median of heating + hot water + lighting. */
  median: number
  /** Lower and upper quartiles of the same total: the middle half of homes. */
  q1: number
  q3: number
  /** median / 12. */
  monthly: number
  /** Median of total cost per m² of floor area. */
  perM2: number
  medianArea: number | null
  heating: number
  hotWater: number
  lighting: number
  /** Medians for flats and maisonettes, houses and bungalows; null below 50 certificates. */
  flats: number | null
  houses: number | null
}

export interface RunningCosts {
  /** First lodgement date pooled: the latest change of the price list behind certificate costs. */
  from: string
  to: string
  n: number
  /** Smallest group published on its own. */
  minN: number
  /** Band A certificates in the period, left out as too few. */
  excluded: number
  bands: RunningCostBand[]
}

export interface BoroughStatsData {
  /** The 33 London local authorities, keyed by area-page slug. */
  boroughs: Record<string, AreaSummary>
  london: AreaSummary
  stratford: StratfordSummary
  runningCosts: RunningCosts
  thresholds: { districtMin: number }
  source: {
    title: string
    publisher: string
    url: string
    licence: string
    attribution: string
    /** Date the GOV.UK file was last regenerated (YYYY-MM-DD). */
    fileUpdated: string
    /** First and last lodgement dates covered (YYYY-MM-DD). */
    from: string
    to: string
    /** Date scripts/borough-stats.py wrote this file (YYYY-MM-DD). */
    generated: string
    caveats: string[]
  }
}
