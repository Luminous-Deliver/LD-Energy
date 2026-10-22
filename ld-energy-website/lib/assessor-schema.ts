import { site } from '@/lib/site'

/** The credentials belong to Abdul; Elmhurst and Quidos are the awarding organisations. */
export const assessorSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${site.url}/about#assessor`,
  name: site.assessor.name,
  jobTitle: 'Domestic Energy Assessor',
  url: `${site.url}/about`,
  worksFor: { '@id': `${site.url}/#business` },
  subjectOf: {
    '@type': 'WebPage',
    name: 'GOV.UK assessor verification',
    url: site.assessor.verifyUrl,
  },
  hasCredential: site.assessor.accreditations.map((a) => ({
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'Domestic Energy Assessor Accreditation',
    identifier: a.number,
    url: site.assessor.verifyUrl,
    recognizedBy: { '@type': 'Organization', name: a.scheme, url: a.url },
  })),
}
