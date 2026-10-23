/**
 * The printable checklist on /preparing-for-your-epc#what-to-have-ready, grouped by where things are so a customer
 * can walk round the home once. Item ids are stored in the visitor's localStorage when ticked, so never rename one
 * (a renamed id silently drops that tick); add new ids instead.
 *
 * Method facts are from Abdul-2 references/rdsap-conventions.md (RdSAP 10 conventions v12.2) and
 * references/epc-evidence-easob.md (EASOB minimum evidence); the convention number sits beside each item.
 * Access and loft wording: Abdul 23/10/2026 (the customer provides loft access).
 */
export interface PrepItem {
  id: string
  title: string
  note?: string
}

export interface PrepGroup {
  id: string
  title: string
  items: PrepItem[]
}

export const prepGroups: PrepGroup[] = [
  {
    id: 'rooms',
    title: 'Every room',
    items: [
      // booking-copy.ts prepChecklist; terms §3 "normal access to all rooms"
      { id: 'rooms-unlocked', title: 'Every room unlocked', note: 'Including storage rooms, airing cupboards and any outbuildings.' },
      { id: 'radiators-windows', title: 'Radiators and windows easy to see', note: 'If a sofa or bed is pushed against one, please move it before we arrive.' },
      // rdsap 7.01: lamps counted, a missing lamp is recorded as CFL
      { id: 'bulbs', title: 'Bulbs in every fixed light fitting', note: 'We count each bulb. A missing one can’t be counted as LED.' },
      // rdsap 5.01, 9.01
      { id: 'fires-heaters', title: 'Fireplaces and fixed heaters easy to see', note: 'Such as a stove, a gas fire or an electric fire on the wall.' },
    ],
  },
  {
    id: 'loft',
    title: 'Loft',
    items: [
      // rdsap 3.04: hatch unusable on the day = "access, loft insulation unknown"
      { id: 'loft-hatch', title: 'Loft hatch opens', note: 'Not painted shut, and nothing stacked underneath it.' },
      // Abdul 23/10: the customer provides access
      { id: 'loft-ladder', title: 'A loft ladder or steps ready', note: 'Please have these ready, as we rely on yours to get up there.' },
      // rdsap 3.03b, 3.04: boarded loft needs boards lifted, evidence at multiple locations, or documents
      { id: 'loft-boards', title: 'Boarded loft? Lift a few boards', note: 'In a few different places, or have the insulation paperwork ready.' },
    ],
  },
  {
    id: 'heating',
    title: 'Heating and hot water',
    items: [
      // terms §3; rdsap 4.03
      { id: 'boiler', title: 'Boiler and hot water cylinder reachable', note: 'Cupboard doors clear, so we can see the label on the boiler.' },
      // rdsap 4.13, 4.17
      { id: 'controls', title: 'Heating controls visible', note: 'The programmer or timer, the room thermostat and the valves on the radiators.' },
      // rdsap 4.19
      { id: 'app-heating', title: 'Heating run from an app?', note: 'Show us the app and the receiver unit fitted on the wall or by the boiler.' },
    ],
  },
  {
    id: 'meters',
    title: 'Meters',
    items: [
      // rdsap 8.02, 9.13; EASOB meters
      { id: 'meters', title: 'Gas and electricity meters reachable', note: 'With the key if they’re in a locked cupboard or an outside box.' },
      // rdsap 9.13: smart meter unit or portable display
      { id: 'smart-display', title: 'Smart meter display to hand', note: 'The small screen that shows your usage, if you have one.' },
      // rdsap 9.13: a recent bill when a particular tariff is chosen
      { id: 'tariff-bill', title: 'On an off-peak tariff like Economy 7?', note: 'Have a recent bill ready.' },
    ],
  },
  {
    id: 'outside',
    title: 'Outside and shared areas',
    items: [
      // EASOB: front, rear and side elevations
      { id: 'outside-access', title: 'A way round the back and side', note: 'We photograph each side of the home, so unlock any side gate.' },
      // EASOB: corridors leading to a flat entrance
      { id: 'communal', title: 'Flat? Keys or fob for shared doors', note: 'We also look at the corridor or stairs to your front door.' },
    ],
  },
  {
    id: 'before',
    title: 'Before we arrive',
    items: [
      { id: 'paperwork', title: 'Paperwork out on a table', note: 'Certificates, guarantees and bills for any improvements, if you have them.' },
      // terms §3: you or your representative
      { id: 'someone-there', title: 'Someone there to let us in', note: 'You or your representative: an adult who can open every part of the home.' },
      // booking-copy.ts TENANT_NOTICE
      { id: 'tenants-told', title: 'Tenants told about the visit', note: 'Only if the home is let.' },
      // Abdul 23/10: one short line
      { id: 'pets', title: 'Pets in another room', note: 'Just for the length of the visit.' },
    ],
  },
]

export const prepItemIds: string[] = prepGroups.flatMap((g) => g.items.map((i) => i.id))
