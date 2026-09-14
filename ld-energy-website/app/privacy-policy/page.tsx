import type { Metadata } from 'next'
import { LegalPage } from '@/components/ui/LegalPage'
import { site } from '@/lib/site'
import { AnalyticsChoices } from '@/components/layout/AnalyticsChoices'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How L&D Energy uses enquiry and assessment information, keeps records and provides privacy and analytics choices.',
  alternates: { canonical: `${site.url}/privacy-policy` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Privacy Policy | L&D Energy',
    description:
      'How L&D Energy uses enquiry and assessment information, keeps records and provides privacy and analytics choices.',
    url: `${site.url}/privacy-policy`,
  },
  twitter: {
    title: 'Privacy Policy | L&D Energy',
    description: 'How L&D Energy uses your information and provides privacy and analytics choices.',
  },
}

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Privacy Policy',
  url: `${site.url}/privacy-policy`,
  description: 'How L&D Energy uses your information and provides privacy and analytics choices.',
  publisher: { '@id': `${site.url}/#organization` },
  inLanguage: 'en-GB',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: `${site.url}/privacy-policy` },
    ],
  },
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      <LegalPage
      title="Privacy Policy"
      lastUpdated="14 September 2026"
      breadcrumbs={[
        { href: '/', label: 'Home' },
        { href: '/privacy-policy', label: 'Privacy Policy' },
      ]}
    >
      <p>
        This Privacy Policy explains how L&amp;D Energy, a trading name of {site.parentBrand} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), collects, uses and protects your personal data when you enquire about or book one of our services.
      </p>

      <h2>1. Who we are</h2>
      <p>
        <strong>Data controller:</strong> {site.legal.dataController}, based in{' '}
        {site.address.locality}, {site.address.region}. For privacy enquiries, contact us at{' '}
        <a href={site.emailHref}>{site.email}</a>.
      </p>

      <h2>2. What data we collect</h2>
      <p>When you contact us or book a service, we collect:</p>
      <ul>
        <li>Your name</li>
        <li>Phone number</li>
        <li>Email address</li>
        <li>Property address and postcode</li>
        <li>Property details relevant to your quote or assessment, including internal floor area when known and requested services</li>
        <li>Your customer type, requested timing and access arrangements</li>
        <li>Any additional notes you provide</li>
      </ul>
      <p>
        For an assessment we also record measurements, property features, photographs and supporting evidence needed to produce and quality-check the EPC. Please avoid including unrelated personal information in your enquiry or evidence.
      </p>

      <h2>3. How we use your data</h2>
      <ul>
        <li>To respond to your enquiry and arrange your appointment</li>
        <li>To carry out the EPC assessment and lodge your certificate on the UK Government EPC Register</li>
        <li>To send you your certificate and any related documents</li>
        <li>To invoice and collect payment</li>
        <li>To meet our legal and regulatory obligations</li>
      </ul>

      <h2>4. Lawful basis</h2>
      <p>
        We use information needed to prepare your requested quote and arrange or deliver a service to take steps at your request before a contract, or to perform that contract. We rely on legitimate interests to answer other business enquiries, protect the website, keep proportionate service records and handle complaints. We rely on legal obligations where tax or other applicable law requires records or disclosures.
      </p>
      <p>The form&rsquo;s contact agreement confirms that you want a reply about your request. It is not permission for unrelated marketing. Where we rely on consent for any separate optional purpose, you can withdraw that consent.</p>

      <h2>5. Sharing your data</h2>
      <p>We share your data only where required to deliver the service:</p>
      <ul>
        <li>The UK Government EPC Register (mandatory lodgement of EPC data)</li>
        <li>Elmhurst Energy, our accreditation scheme</li>
        <li>Resend, our transactional email provider</li>
        <li>Cloudflare, for website hosting, security checks, email routing and website statistics</li>
        <li>Google, for the business email inbox used to handle correspondence</li>
        <li>Your letting agent or solicitor, only if you ask us to send the certificate directly</li>
      </ul>
      <p>We do not sell your data and we do not share it for marketing purposes.</p>
      <p>Some service providers process information outside the UK. Their data-processing arrangements use applicable transfer safeguards, such as adequacy decisions or approved contractual terms. Contact us if you need details of a particular processing arrangement. Certificate information lodged on the government register is handled under the register&rsquo;s own privacy notice.</p>

      <h2>6. Data retention</h2>
      <p>
        We keep enquiry correspondence while dealing with your request and any necessary follow-up or dispute. Information that becomes part of an assessment record is retained with that record. Financial records are kept for the applicable tax and accounting retention period. We review other correspondence against its continuing purpose; the website does not automatically delete email from the business inbox.
      </p>
      <p>EPC assessment evidence must be retained securely for at least 15 years under our accreditation scheme&rsquo;s requirements. A complaint, legal claim or other applicable obligation can require longer retention. We retain only the information needed for those purposes.</p>
      <p>The government EPC Register controls its own retention. A certificate&rsquo;s usual 10-year validity is not a promise that its record is deleted after 10 years. See the <a href="https://www.gov.uk/guidance/energy-performance-certificates-opt-out-of-public-disclosure" target="_blank" rel="noopener noreferrer">register&rsquo;s data-disclosure guidance and privacy notice</a>.</p>

      <h2>7. Your rights</h2>
      <p>Under UK GDPR you have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you</li>
        <li>Request correction of inaccurate data</li>
        <li>Request erasure where we no longer need the data</li>
        <li>Object to or restrict processing</li>
        <li>Request data portability</li>
        <li>Complain to the Information Commissioner&rsquo;s Office (<a href="https://ico.org.uk" rel="noopener noreferrer" target="_blank">ico.org.uk</a>)</li>
      </ul>
      <p>
        To exercise any of these rights, email <a href={site.emailHref}>{site.email}</a>.
      </p>

      <h2>8. Security</h2>
      <p>
        We use industry-standard security measures including HTTPS encryption in transit and access controls on stored data.
      </p>

      <h2>9. Website statistics and browser storage</h2>
      <p>We use Cloudflare Web Analytics to understand aggregate page use and loading performance so we can improve this website. Its beacon does not use analytics cookies, local storage or fingerprinting to recognise you across visits. It sends page and referrer locations with query strings and fragments removed, browser/device information and performance measurements. Cloudflare discards the source IP address at its nearest data centre rather than storing it in its analytics databases or logs.</p>
      <p>We use these statistics only to improve this service, under the statistical-purpose exception to the storage and access consent rules. You can object using the controls below. We do not send enquiry contents or customer identities to Web Analytics and do not join its statistics to individual enquiry records. We do not use GA4, advertising trackers or session recordings.</p>
      <p>A separate, controlled service/source label accompanies your actual enquiry so we can understand which website route generated it. Successful enquiries, qualified enquiries and confirmed bookings are assessed from our business records; analytics page views do not establish that a booking happened.</p>
      <AnalyticsChoices />
      <p>When you choose, this browser stores a single on/off preference called <code>ld-energy-analytics</code>. It contains no visitor identifier or contact details and remains until changed or browser storage is cleared. An earlier rejection stored by the old banner is honoured. We also respect supported Do Not Track and Global Privacy Control signals. If browser storage is unavailable, optional analytics stays off.</p>
      <p>Cloudflare security and Turnstile protect the site and enquiry form from abuse. They may process browser/network information and use necessary security cookies, such as <code>cf_clearance</code>. These protections are separate from optional analytics. The form may retain your selected customer type in that browser history entry; it does not persist your name, address or contact details there.</p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at the top of this page indicates when it was last revised.
      </p>
    </LegalPage>
    </>
  )
}
