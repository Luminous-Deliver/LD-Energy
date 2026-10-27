/**
 * One picture per guide for the Read next cards (Abdul 24/10/2026: "not polished, same pics and some don't have any").
 * The cards used one picture per guide group, so two guides from a group showed the same drawing, and pages that
 * listed guides by hand had none. Each guide now has its own first choice and fallbacks: the L&D illustrations first,
 * the line drawings after. ReadNext takes the first picture not already used in that row, so a row never repeats one.
 */
const A = {
  scale: '/inner/rn-scale.svg',
  twoHouses: '/inner/rn-two-houses.svg',
  landlord: '/inner/rn-landlord.svg',
  seller: '/inner/rn-seller.svg',
  boroughs: '/inner/rn-boroughs.svg',
  book: '/inner/rn-book.svg',
  assessor: '/guides/assessor-room-720.webp',
  section: '/guides/house-section-720.webp',
  report: '/illustrations/report-900.webp',
  access: '/illustrations/access-900.webp',
  evening: '/illustrations/evening-900.webp',
  cutaway: '/home/terrace-cutaway-900.webp',
  street: '/home/street-break-900.webp',
}

const GUIDE: Record<string, string[]> = {
  'epc-ratings-explained': [A.scale, A.report],
  'how-long-does-epc-last': [A.report, A.scale],
  'why-is-my-epc-different': [A.twoHouses, A.street],
  'rdsap-10-what-changed-2025': [A.report, A.assessor, A.scale],
  'what-happens-during-epc-assessment': [A.assessor, A.access],
  'prepare-for-epc-assessment': [A.access, A.assessor],
  'epc-for-landlords-2026': [A.landlord, A.evening],
  'mees-regulations-2026': [A.evening, A.landlord],
  'mees-timeline-2026-2030': [A.landlord, A.evening],
  'epc-c-by-2030': [A.cutaway, A.landlord],
  'how-to-improve-epc-rating': [A.section, A.cutaway],
  'cheapest-ways-improve-epc': [A.cutaway, A.section],
  'epc-improvements-by-budget': [A.cutaway, A.section],
  'loft-insulation-epc-rating': [A.section, A.cutaway],
  'cavity-wall-insulation-epc': [A.street, A.cutaway],
  'epc-for-selling-house': [A.seller, A.street],
  'epc-vs-floor-plan-vs-survey': [A.report, A.seller],
}

const PAGE: Record<string, string[]> = {
  '/epc-ratings-by-borough': [A.boroughs],
  '/preparing-for-your-epc': [A.access, A.assessor],
  '/landlords': [A.landlord, A.evening],
  '/estate-agents': [A.seller],
}

/** Candidate pictures for a card's link, best first; empty when the link has none of its own. */
export function guideImages(href: string): string[] {
  const path = href.split(/[?#]/)[0]
  const blog = path.match(/^\/blog\/([^/]+)$/)
  if (blog) return GUIDE[blog[1]] ?? []
  return PAGE[path] ?? []
}
