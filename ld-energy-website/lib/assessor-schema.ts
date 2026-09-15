import { site } from '@/lib/site'

/** The credential belongs to Abdul; Elmhurst is its awarding organisation. */
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
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'Domestic Energy Assessor Accreditation',
    identifier: site.assessor.accreditationNumber,
    url: site.assessor.verifyUrl,
    recognizedBy: {
      '@type': 'Organization',
      name: site.assessor.scheme,
      url: 'https://www.elmhurstenergy.co.uk',
    },
  },
}
