import type { FaqItem } from '@/lib/faq'
import { EXPRESS_SURCHARGE } from '@/lib/site'

/** Shared by the visible homepage answers and its FAQ JSON-LD. */
export const homeBookingFaqs: FaqItem[] = [
  {q:'Is the guide price my final quote?',a:'No. Guide prices are based mainly on internal floor area. Layout, extensions and access may affect the final price. We confirm your exact quote before you agree to the appointment.',links:[{href:'/pricing',label:'Full guide prices'}]},
  {q:'What if I do not know my floor area?',a:'Choose “Not sure of floor area” and send your property details. You can submit without selecting an m² band. We will review the details and confirm your exact quote; no guide total is invented.'},
  {q:'When can you visit and lodge my EPC?',a:`Tell us your deadline and preferred timing. We confirm an available appointment and the delivery timing before booking. Next-day lodgement adds £${EXPRESS_SURCHARGE} when agreed; it does not guarantee a next-day appointment.`},
  {q:'Do you cover my London postcode?',a:'L&D Energy is based in Stratford E15 and serves London. Send your postcode with your enquiry so we can confirm availability, access and any travel charge before you agree to the visit.',links:[{href:'/areas',label:'See London coverage'}]},
  {q:'What will I receive after the assessment?',a:'For a Domestic EPC, you receive a lodged certificate and its standard software-generated recommendation report where applicable. A floor-plan service provides a marketing plan as JPG and PDF. The optional Improvement Plan adds personalised interpretation and priorities, supported by the full Energy Report.'},
]
