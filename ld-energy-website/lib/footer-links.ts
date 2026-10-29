import { boroughMeta, priorityBoroughs } from '@/lib/boroughs'
import { BOROUGH_DATA_PAGE } from '@/lib/guides'

/* Footer link groups, shared by the footer options (29/10/2026). Guides and areas are ordered by Search Console
   impressions, 90 days to 26/10/2026, plus the new cost guide (booking intent). */

export type FooterLink = [label: string, href: string]

export const footerServices: FooterLink[] = [
  ['Domestic EPC', '/services/domestic-epc'],
  ['Floor plans', '/services/floor-plans'],
  ['EPC Pre-Assessment', '/services/epc-pre-assessment'],
  ['EPC Improvement Plan', '/services/epc-improvement-plan'],
  ['Guide prices', '/pricing'],
  ['For landlords', '/landlords'],
  ['For estate agents', '/estate-agents'],
  ['For sellers', '/sellers'],
]

export const footerGuides: FooterLink[] = [
  ['EPC, floor plan or survey?', '/blog/epc-vs-floor-plan-vs-survey'],
  ['EPC ratings explained', '/blog/epc-ratings-explained'],
  ['What an EPC costs, and who pays', '/blog/epc-cost-who-pays'],
  ['Preparing for the visit', '/blog/prepare-for-epc-assessment'],
  ['Improving your rating', '/blog/how-to-improve-epc-rating'],
  ['Why ratings differ', '/blog/why-is-my-epc-different'],
  ['EPCs for landlords', '/blog/epc-for-landlords-2026'],
]

export const footerCompany: FooterLink[] = [
  ['About Abdul', '/about'],
  ['Your assessor', '/domestic-energy-assessor-london'],
  ['Before your visit', '/preparing-for-your-epc'],
  ['EPC questions', '/faq'],
  [BOROUGH_DATA_PAGE.label, BOROUGH_DATA_PAGE.href],
  ['Contact us', '/contact'],
]

export const footerAreas: FooterLink[] = priorityBoroughs.map((b) => [b.name, `/areas/${b.slug}`])
export const footerAreaCount = Object.keys(boroughMeta).length
