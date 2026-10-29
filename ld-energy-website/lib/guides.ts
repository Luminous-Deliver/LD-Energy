/**
 * Guides (the /blog posts) as readers see them: the hub's five reader-intent groups and the
 * "In your area" links on each post. Plan PLAN-AREAS-GUIDES-2026-10-22 §8.1, §8.2 and §10.
 *
 * The URLs stay at /blog for good (Abdul 22/10/2026); "Guides" is only the label.
 */

/**
 * The borough ratings data page (plan §6) is built in a separate slice. Until it is live, every
 * link to it stays off. Switch `live` to true in the same change that ships the page.
 */
export const BOROUGH_DATA_PAGE = {
  href: '/epc-ratings-by-borough',
  label: 'EPC ratings by London borough',
  live: true,
} as const

export interface GuideGroup {
  id: string
  heading: string
  /** One line under the heading: who the group is for. */
  intro: string
  /** Slugs, pillar first. */
  guides: { slug: string; summary: string }[]
}

/** The five groups on /blog, pillar first in each (plan §8.1 table). Every post appears exactly once. */
export const guideGroups: GuideGroup[] = [
  {
    id: 'understand-your-epc',
    heading: 'Understand your EPC',
    intro: 'What the rating means, how it is worked out and how long a certificate lasts.',
    guides: [
      { slug: 'epc-ratings-explained', summary: 'What each band from A to G means, and the SAP score range behind it.' },
      { slug: 'why-is-my-epc-different', summary: 'Why two similar homes get different ratings, and when a rating can be changed.' },
      { slug: 'rdsap-10-what-changed-2025', summary: 'The RdSAP 10 method since June 2025 and the conventions update of August 2026.' },
      { slug: 'how-long-does-epc-last', summary: 'Ten years, the rules that decide validity, and when you need a new one.' },
    ],
  },
  {
    id: 'before-and-on-the-day',
    heading: 'Before and on the day',
    intro: 'Getting ready for the visit and what the assessor does while there.',
    guides: [
      { slug: 'prepare-for-epc-assessment', summary: 'Access, paperwork and a checklist for the day of the visit.' },
      { slug: 'what-happens-during-epc-assessment', summary: 'What the assessor records, room by room, and how long it takes.' },
      { slug: 'maisonette-epc', summary: 'Maisonettes and two-floor flats: both floors, what is above and below, corridors and shared heating.' },
    ],
  },
  {
    id: 'letting-and-mees',
    heading: 'Letting and MEES',
    intro: 'The minimum rating for rented homes now, and the higher standard planned for 2030.',
    guides: [
      { slug: 'epc-for-landlords-2026', summary: 'The band E minimum, exemptions and what a landlord has to do now.' },
      { slug: 'epc-c-by-2030', summary: 'The 2030 standard for rented homes: what is settled and what still needs legislation.' },
      { slug: 'mees-regulations-2026', summary: 'Penalty limits, the exemption types and the evidence each one needs.' },
      { slug: 'mees-timeline-2026-2030', summary: 'The steps between today’s E minimum and October 2030.' },
    ],
  },
  {
    id: 'improving-your-rating',
    heading: 'Improving your rating',
    intro: 'Measures to look into, and what decides how much each one helps your home.',
    guides: [
      { slug: 'how-to-improve-epc-rating', summary: 'Measures from lighting to heat pumps, and routes from D to C for common London homes.' },
      { slug: 'cheapest-ways-improve-epc', summary: 'Five lower-cost measures, cheapest first.' },
      { slug: 'epc-improvements-by-budget', summary: 'What to look into at three budget levels.' },
      { slug: 'loft-insulation-epc-rating', summary: 'How loft insulation is recorded, and the evidence that helps.' },
      { slug: 'cavity-wall-insulation-epc', summary: 'Which walls can take cavity fill, and how it shows on an EPC.' },
    ],
  },
  {
    id: 'selling-buying-and-floor-plans',
    heading: 'Selling, buying and floor plans',
    intro: 'The documents a sale or let needs, and when to get them.',
    guides: [
      { slug: 'epc-vs-floor-plan-vs-survey', summary: 'What an EPC, a floor plan and a survey each do, and who needs which.' },
      { slug: 'epc-for-selling-house', summary: 'The rules and timing for an EPC when you sell.' },
    ],
  },
]

/**
 * Area pages a guide links to when its frontmatter sets no `areas`. Picked by what the topic is
 * about, from the GOV.UK figures in lib/borough-stats.ts (22/10/2026):
 * - epc-basics: Stratford (the base) and the two pilot boroughs, which carry the fullest local figures;
 * - letting topics: the three boroughs after the City with the highest share of lettings among their EPCs;
 * - improvements: the three with the highest share of uninsulated solid walls;
 * - selling: the three with the highest share of sales among their EPCs.
 */
export const defaultGuideAreas: Record<string, string[]> = {
  'epc-basics': ['stratford', 'newham', 'croydon'],
  'for-landlords': ['brent', 'newham', 'tower-hamlets'],
  regulations: ['brent', 'newham', 'tower-hamlets'],
  improvements: ['kensington-chelsea', 'hammersmith-fulham', 'haringey'],
  'for-sellers': ['bexley', 'bromley', 'richmond'],
}

export function guideAreas(category: string, own: string[]): string[] {
  return own.length > 0 ? own : defaultGuideAreas[category] ?? defaultGuideAreas['epc-basics']
}
