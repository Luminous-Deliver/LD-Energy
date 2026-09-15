export interface BoroughMeta {
  slug: string
  name: string
  /**
   * What this place actually is. Stratford is a neighbourhood of Newham, not a
   * London borough — it has its own page because it is the business base and a
   * high-intent search target, but the copy and schema must not call it a
   * borough, and no borough may list it as a neighbour.
   */
  kind: 'borough' | 'city' | 'neighbourhood'
  /** For a neighbourhood, the borough that contains it. */
  partOf?: string
  /** Short note used in local intros (postcodes, nearby stations, character) */
  blurb: string
  /** Typical property types and build eras in the area (~55-70 words) */
  housingStock: string
  /** Common EPC findings and improvement challenges for that stock (~55-70 words) */
  epcIssues: string
  /** Key transport links and what they mean for appointment access (~35-45 words) */
  transport: string
  /** 5–6 neighbouring borough slugs for internal linking */
  neighbours: string[]
  /** Area-rich SEO meta title (used as absolute title) */
  metaTitle: string
  /** 'Areas Covered' block naming neighbourhoods + postcode districts */
  areasCovered: string
  /** Postcode-targeted FAQ (feeds accordion + FAQPage schema) */
  postcodeFaq: { q: string; a: string }
}

export const boroughMeta: Record<string, BoroughMeta> = {
  stratford: {
    slug: 'stratford',
    name: 'Stratford',
    kind: 'neighbourhood',
    partOf: 'newham',
    blurb:
      'Our local home base in the E15 and E20 postcodes, covering Westfield, the Olympic Park and surrounding new-build apartments and Victorian terraces.',
    housingStock:
      'Stratford spans the East Village apartments of the former athletes’ village, 2010s towers around the International Quarter, long Victorian terraces near Maryland and Forest Lane, and post-war ex-local-authority blocks. It is one of the fastest-changing housing markets in East London, with new E20 stock sitting alongside much older E15 terraced streets.',
    epcIssues:
      'For East Village and International Quarter apartments, details of communal heating and any accessible heating controls can help the assessment. For Maryland terraces, evidence of insulation, extensions and loft conversions can be relevant. Construction and installed systems must be assessed; neither an E15/E20 postcode nor the age of the building establishes its EPC rating.',
    transport:
      'Our base is Stratford E15. For an apartment visit, confirm the entrance, intercom and any concierge arrangements. For a rented property, agree access with the occupier. Appointment availability is confirmed after reviewing your enquiry.',
    neighbours: ['newham', 'hackney', 'tower-hamlets', 'waltham-forest', 'redbridge'],
    metaTitle: "EPC Assessor Stratford | Fast Certificates in E15 & E20",
    areasCovered:
      "Our accredited energy assessor provides EPCs across Stratford and the surrounding area. We cover all local districts including Stratford (E15), Maryland (E15), Forest Lane (E15), East Village (E20) and the Queen Elizabeth Olympic Park.",
    postcodeFaq: {
      q: "How fast can I get an EPC in Stratford (E15) or East Village (E20)?",
      a: "If your property is located in E15, E20, or anywhere across the Stratford area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  hackney: {
    slug: 'hackney',
    name: 'Hackney',
    kind: 'borough',
    blurb:
      'Covering E2, E5, E8, E9, N1 and N16, from Victorian conversions in Dalston and Stoke Newington to new-build apartments in Hackney Wick.',
    housingStock:
      'Hackney’s housing is dominated by Victorian and Georgian terraces in De Beauvoir, London Fields and Stoke Newington, warehouse conversions around Hackney Wick, and large ex-local-authority estates in Clapton and Homerton. Period conversions split into flats are especially common across the E8 and N16 postcodes.',
    epcIssues:
      'Conservation-area restrictions across much of Hackney limit external alterations, so solid-wall terraces and converted flats usually have the most scope for improvement. Ground-floor conversions lose significant heat through uninsulated suspended timber floors, and original single glazing in protected streets caps the achievable rating without internal upgrades.',
    transport:
      'The London Overground spine, Dalston Junction, Hackney Central and Hackney Wick, plus Stoke Newington and Rectory Road rail give us good coverage despite Hackney’s limited Underground access.',
    neighbours: ['islington', 'haringey', 'waltham-forest', 'newham', 'tower-hamlets', 'city-of-london'],
    metaTitle: "EPC Assessor Hackney | Dalston E8, Clapton E5",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Hackney. We cover all local districts including Dalston (E8), Stoke Newington (N16), Clapton (E5), Hackney Wick (E9), De Beauvoir (N1) and Homerton (E9).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Dalston (E8) or Stoke Newington (N16)?",
      a: "If your property is located in E8, N16, or anywhere across the Hackney area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  'tower-hamlets': {
    slug: 'tower-hamlets',
    name: 'Tower Hamlets',
    kind: 'borough',
    blurb:
      'Serving E1, E2, E3, E14 and the wider Canary Wharf, Whitechapel, Bow and Isle of Dogs area, riverside flats, period terraces and modern developments.',
    housingStock:
      'Tower Hamlets ranges from Canary Wharf and Isle of Dogs high-rise apartments to Georgian townhouses in Spitalfields and Bow, riverside developments at Wapping, and dense post-war estates throughout. The E14 postcode in particular is dominated by modern apartment blocks.',
    epcIssues:
      'High-rise flats are constrained, owners cannot alter the building fabric, so ratings hinge on heating systems and glazing, and most modern blocks perform better. Protected Georgian stock in Spitalfields and Bow, with solid walls and sash windows, tends to be limited by the fabric and needs internal insulation to improve.',
    transport:
      'The Jubilee line, DLR across the Isle of Dogs, and the Elizabeth line at Whitechapel and Canary Wharf make Tower Hamlets one of the quickest boroughs for us to cover.',
    neighbours: ['hackney', 'newham', 'city-of-london', 'southwark', 'greenwich'],
    metaTitle: "EPC Assessor Tower Hamlets | Canary Wharf E14, Bow E3",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Tower Hamlets. We cover all local districts including Canary Wharf (E14), Whitechapel (E1), Bow (E3), Spitalfields (E1), Wapping (E1) and the Isle of Dogs (E14).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Canary Wharf (E14) or Bow (E3)?",
      a: "If your property is located in E14, E3, or anywhere across the Tower Hamlets area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  newham: {
    slug: 'newham',
    name: 'Newham',
    kind: 'borough',
    blurb:
      'Covering E6, E7, E12, E13 and E16, including East Ham, Forest Gate, Plaistow, Canning Town and the Royal Docks new builds.',
    housingStock:
      'Newham is built around long Victorian terraces in Forest Gate, East Ham and Plaistow, the Royal Docks and Royal Wharf new-build developments, and a significant volume of ex-local-authority and HMO-converted stock. It has one of the largest private rental markets in London.',
    epcIssues:
      'The assessment records the actual construction, insulation and heating of each property. For converted homes, explain which rooms form the dwelling and how heating and access are arranged. For Royal Docks apartments with communal systems, any available system information can be useful. The appropriate assessment scope and any recommendations depend on the individual property.',
    transport:
      'We serve Newham from our Stratford E15 base. Share the full postcode, entrance and occupant or concierge arrangements in your enquiry so access and available appointment times can be confirmed.',
    neighbours: ['tower-hamlets', 'hackney', 'waltham-forest', 'redbridge', 'barking-dagenham', 'greenwich'],
    metaTitle: "EPC Assessor Newham | Forest Gate E7, East Ham E6",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Newham. We cover all local districts including Forest Gate (E7), East Ham (E6), Plaistow (E13), Canning Town (E16), Manor Park (E12) and the Royal Docks (E16).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Forest Gate (E7) or East Ham (E6)?",
      a: "If your property is located in E7, E6, or anywhere across the Newham area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  greenwich: {
    slug: 'greenwich',
    name: 'Greenwich',
    kind: 'borough',
    blurb:
      'Covering SE3, SE7, SE10 and SE18, Greenwich, Blackheath, Charlton and Woolwich, with a mix of period homes and new riverside developments.',
    housingStock:
      'Greenwich combines Georgian and early-Victorian houses around the town centre and Blackheath, 1930s semis in Charlton, and large new riverside developments at Greenwich Peninsula and Woolwich. The contrast between protected period streets and modern towers is stark.',
    epcIssues:
      'Period homes in the West Greenwich and Blackheath conservation areas generally have room to improve on the fabric side due to solid walls and single glazing, with limited scope for external changes. Peninsula and Woolwich new-builds usually score better, helped by communal heating and modern insulation standards.',
    transport:
      'The DLR, the Elizabeth line at Woolwich, Southeastern rail and the Jubilee line at North Greenwich together cover the borough’s spread-out riverside geography well.',
    neighbours: ['bexley', 'bromley', 'lewisham', 'newham', 'tower-hamlets'],
    metaTitle: "EPC Assessor Greenwich | Blackheath SE3, Woolwich SE18",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire Royal Borough of Greenwich. We cover all local districts including Greenwich (SE10), Blackheath (SE3), Charlton (SE7), Woolwich (SE18) and Greenwich Peninsula (SE10).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Greenwich (SE10) or Blackheath (SE3)?",
      a: "If your property is located in SE10, SE3, or anywhere across the Greenwich area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  islington: {
    slug: 'islington',
    name: 'Islington',
    kind: 'borough',
    blurb:
      'Covering N1, N5, N7 and N19, Georgian and Victorian terraces in Angel, Highbury and Archway plus modern conversions near King’s Cross.',
    housingStock:
      'Islington is defined by Georgian and Victorian terraces and garden squares in Barnsbury, Canonbury and Highbury, period houses subdivided into flats throughout, and newer developments around King’s Cross and Archway. It is one of the most conservation-controlled boroughs in London.',
    epcIssues:
      'Most period conversions have limited fabric options. Solid walls rule out cheap cavity fill, original windows are often protected, and shared roof spaces in subdivided houses complicate loft insulation. Improvements usually focus on heating controls, hot water cylinders and internal measures.',
    transport:
      'The Victoria and Northern lines, plus Overground services and the major King’s Cross and Highbury & Islington interchanges, keep appointment access straightforward.',
    neighbours: ['camden', 'haringey', 'hackney', 'city-of-london'],
    metaTitle: "EPC Assessor Islington | Angel N1, Highbury N5",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Islington. We cover all local districts including Angel (N1), Highbury (N5), Holloway (N7), Archway (N19) and Canonbury (N1).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Angel (N1) or Highbury (N5)?",
      a: "If your property is located in N1, N5, or anywhere across the Islington area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  southwark: {
    slug: 'southwark',
    name: 'Southwark',
    kind: 'borough',
    blurb:
      'Covering SE1, SE5, SE15, SE16 and SE17, Bermondsey, Peckham, Camberwell and Bankside, from warehouse conversions to Victorian terraces.',
    housingStock:
      'Southwark mixes Bankside and Bermondsey warehouse conversions, Victorian terraces in Peckham and Camberwell, large estates in Walworth, and riverside towers along the Thames. The SE1 and SE16 postcodes carry much of the modern apartment stock.',
    epcIssues:
      'Warehouse conversions can struggle with single-skin walls and large areas of glazing, commonly need insulation or heating work to move up. Victorian terraces in Peckham and Camberwell commonly need solid-wall insulation and boiler upgrades to meet the minimum standard for letting, while modern riverside flats usually perform well thanks to modern construction standards.',
    transport:
      'The Jubilee line, Thameslink, the Overground at Peckham and Bermondsey, and the Northern line at Borough and Elephant & Castle give us strong coverage across Southwark.',
    neighbours: ['city-of-london', 'lambeth', 'lewisham', 'bromley', 'tower-hamlets'],
    metaTitle: "EPC Assessor Southwark | Peckham SE15, Bermondsey SE16",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Southwark. We cover all local districts including Bermondsey (SE16), Peckham (SE15), Camberwell (SE5), Walworth (SE17) and Bankside (SE1).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Peckham (SE15) or Bermondsey (SE16)?",
      a: "If your property is located in SE15, SE16, or anywhere across the Southwark area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  lewisham: {
    slug: 'lewisham',
    name: 'Lewisham',
    kind: 'borough',
    blurb:
      'Covering SE4, SE6, SE13, SE14, SE23 and SE26, Brockley, Catford, Forest Hill, Sydenham and New Cross terraces and converted flats.',
    housingStock:
      'Lewisham is largely Victorian and Edwardian terraces in Brockley, Forest Hill and Hither Green, 1930s semis in Catford, and a high volume of converted flats, with a growing number of new developments around Lewisham town centre.',
    epcIssues:
      'The borough’s large stock of converted Victorian flats, solid walls, suspended timber floors, partial loft cover, usually depend on heating and insulation upgrades to improve. Many of these benefit quickly and cheaply from loft top-ups and heating control upgrades, which is good news for landlords facing MEES deadlines.',
    transport:
      'Southeastern rail, the DLR terminus at Lewisham, and the Overground through Brockley, Honor Oak Park and Forest Hill cover the borough well despite the absence of the Underground.',
    neighbours: ['greenwich', 'bromley', 'southwark', 'lambeth'],
    metaTitle: "EPC Assessor Lewisham | Brockley SE4, Forest Hill SE23",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Lewisham. We cover all local districts including Brockley (SE4), Catford (SE6), Lewisham (SE13), New Cross (SE14), Forest Hill (SE23) and Sydenham (SE26).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Brockley (SE4) or Forest Hill (SE23)?",
      a: "If your property is located in SE4, SE23, or anywhere across the Lewisham area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  'barking-dagenham': {
    slug: 'barking-dagenham',
    name: 'Barking & Dagenham',
    kind: 'borough',
    blurb:
      'Covering IG11, RM8, RM9 and RM10, Barking, Dagenham, Becontree estate and surrounding new-build developments.',
    housingStock:
      'The borough is dominated by the vast 1920s–30s Becontree estate of cottage-style houses, one of the largest public housing developments ever built, alongside post-war semis and major new-build regeneration at Barking Riverside.',
    epcIssues:
      'Becontree-era houses often have solid or early cavity walls and dated heating systems, usually have the most scope for improvement. With a large and growing landlord base, MEES upgrades, cavity insulation where possible, loft top-ups and new boilers, are a frequent requirement before re-letting.',
    transport:
      'The District and Hammersmith & City lines, c2c, the Overground, and the new Barking Riverside extension give us reliable access across all four postcodes.',
    neighbours: ['newham', 'redbridge', 'havering'],
    metaTitle: "EPC Barking & Dagenham | Barking IG11, Dagenham RM10",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Barking and Dagenham. We cover all local districts including Barking (IG11), Dagenham (RM10), the Becontree estate (RM9) and Chadwell Heath (RM8).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Barking (IG11) or Dagenham (RM10)?",
      a: "If your property is located in IG11, RM10, or anywhere across the Barking and Dagenham area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  'waltham-forest': {
    slug: 'waltham-forest',
    name: 'Waltham Forest',
    kind: 'borough',
    blurb:
      'Covering E4, E10, E11 and E17, Walthamstow, Leyton, Leytonstone and Chingford, popular with first-time landlords and growing families.',
    housingStock:
      'Waltham Forest is mostly Victorian and Edwardian terraces in Walthamstow and Leyton, 1930s semis in Chingford, and a large number of period houses converted into flats, stock that is popular with first-time buyers and landlords alike.',
    epcIssues:
      'Terraced and converted stock with solid walls and original windows typically need fabric or heating upgrades to improve. Period flats often have uninsulated ground floors and only partial loft cover; improvements usually combine internal insulation, draught-proofing and heating control upgrades.',
    transport:
      'The Victoria line at Walthamstow Central, the Overground to Chingford, and Central line stations at Leyton and Leytonstone make the borough quick to cover.',
    neighbours: ['enfield', 'haringey', 'hackney', 'newham', 'redbridge'],
    metaTitle: "EPC Assessor Waltham Forest | Walthamstow E17, Leyton E10",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Waltham Forest. We cover all local districts including Walthamstow (E17), Leyton (E10), Leytonstone (E11) and Chingford (E4).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Walthamstow (E17) or Leyton (E10)?",
      a: "If your property is located in E17, E10, or anywhere across the Waltham Forest area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  camden: {
    slug: 'camden',
    name: 'Camden',
    kind: 'borough',
    blurb:
      'Covering NW1, NW3, NW5 and WC1, Camden Town, Belsize Park, Kentish Town and Bloomsbury, with a wide mix of period and contemporary stock.',
    housingStock:
      'Camden spans grand Georgian and Victorian houses in Hampstead, Belsize Park and Primrose Hill, Bloomsbury mansion blocks, and period conversions and ex-local-authority estates in Kentish Town and Camden Town.',
    epcIssues:
      'Strict conservation rules across most of the borough mean solid-wall period homes and mansion flats generally have room to improve on the fabric side, with very limited scope for external insulation. Ratings are usually improved through heating systems, hot water cylinder insulation and low-energy lighting.',
    transport:
      'The Northern line runs the length of the borough, supported by the Metropolitan, Jubilee and Overground services and several major interchanges.',
    neighbours: ['barnet', 'haringey', 'islington', 'city-of-london', 'westminster', 'brent'],
    metaTitle: "EPC Assessor Camden | Camden Town NW1, Kentish Town NW5",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Camden. We cover all local districts including Camden Town (NW1), Belsize Park (NW3), Kentish Town (NW5), Bloomsbury (WC1) and Hampstead (NW3).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Camden Town (NW1) or Kentish Town (NW5)?",
      a: "If your property is located in NW1, NW5, or anywhere across the Camden area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  westminster: {
    slug: 'westminster',
    name: 'Westminster',
    kind: 'borough',
    blurb:
      'Covering W1, W2, SW1 and NW8, Mayfair, Marylebone, Pimlico and St John’s Wood, including mansion-block flats and period townhouses.',
    housingStock:
      'Westminster is dominated by mansion blocks in Marylebone, Pimlico and Maida Vale, period townhouses in Mayfair and Belgravia, and a mix of mews houses and modern apartments. Listed and conservation-area stock makes up a large share of the borough.',
    epcIssues:
      'Solid walls, sash windows and communal heating mean mansion flats and townhouses commonly need insulation or heating work to move up, and listed status often rules out fabric changes entirely. Achievable improvements centre on heating controls, cylinder insulation and lighting.',
    transport:
      'The Bakerloo, Central, Jubilee, Victoria and Circle lines, plus the Paddington, Victoria and Marylebone termini, make Westminster very fast for us to reach.',
    neighbours: ['camden', 'city-of-london', 'kensington-chelsea', 'brent', 'wandsworth', 'lambeth'],
    metaTitle: "EPC Assessor Westminster | Marylebone W1, Pimlico SW1",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire City of Westminster. We cover all local districts including Marylebone (W1), Paddington (W2), Pimlico (SW1), St John's Wood (NW8) and Maida Vale (W9).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Marylebone (W1) or Pimlico (SW1)?",
      a: "If your property is located in W1, SW1, or anywhere across the Westminster area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  lambeth: {
    slug: 'lambeth',
    name: 'Lambeth',
    kind: 'borough',
    blurb:
      'Covering SE1, SE11, SE24, SW2, SW4, SW8, SW9 and SW16, Brixton, Clapham, Kennington, Streatham and Vauxhall.',
    housingStock:
      'Lambeth combines Victorian terraces and converted flats in Clapham, Brixton and Herne Hill, large estates in Stockwell and Vauxhall, and new towers along the Albert Embankment and the Nine Elms fringe.',
    epcIssues:
      'Solid-wall Victorian conversions across Brixton and Clapham usually depend on heating and insulation upgrades to improve. Many flats need improved heating controls and loft insulation to lift the score, while the newer Vauxhall and Nine Elms apartments generally benefit from modern insulation and heating with communal heat networks.',
    transport:
      'The Victoria and Northern lines, the Overground at Clapham High Street and Brixton, and extensive National Rail services cover Lambeth’s long north–south spread.',
    neighbours: ['southwark', 'wandsworth', 'merton', 'croydon', 'lewisham', 'westminster'],
    metaTitle: "EPC Assessor Lambeth | Brixton SW2, Clapham SW4",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Lambeth. We cover all local districts including Brixton (SW2), Clapham (SW4), Kennington (SE11), Streatham (SW16), Stockwell (SW9) and Herne Hill (SE24).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Brixton (SW2) or Clapham (SW4)?",
      a: "If your property is located in SW2, SW4, or anywhere across the Lambeth area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  wandsworth: {
    slug: 'wandsworth',
    name: 'Wandsworth',
    kind: 'borough',
    blurb:
      'Covering SW8, SW11, SW12, SW15, SW17 and SW18, Battersea, Balham, Tooting, Putney and Earlsfield.',
    housingStock:
      'Wandsworth is known for the Victorian “tonsils” terraces of Tooting and Balham, larger period houses around Putney and Wandsworth Common, and major new riverside developments at Battersea and Nine Elms.',
    epcIssues:
      'Period terraces and conversions with solid walls and bay windows usually have the most scope for improvement, and the borough’s many converted flats often need loft and heating upgrades. Battersea and Nine Elms new-builds, by contrast, usually score better, helped by newer construction thanks to communal heat networks.',
    transport:
      'The Northern line extension at Battersea and Nine Elms, plus National Rail at Clapham Junction, one of the UK’s busiest interchanges, give us excellent access.',
    neighbours: ['lambeth', 'merton', 'richmond', 'hammersmith-fulham', 'westminster'],
    metaTitle: "EPC Assessor Wandsworth | Battersea SW11, Tooting SW17",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Wandsworth. We cover all local districts including Battersea (SW11), Balham (SW12), Tooting (SW17), Putney (SW15) and Earlsfield (SW18).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Battersea (SW11) or Tooting (SW17)?",
      a: "If your property is located in SW11, SW17, or anywhere across the Wandsworth area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  brent: {
    slug: 'brent',
    name: 'Brent',
    kind: 'borough',
    blurb:
      'Covering NW2, NW6, NW9, NW10 and HA0, Wembley, Willesden, Kilburn and Harlesden, including a high volume of letting properties.',
    housingStock:
      'Brent mixes Victorian and Edwardian terraces in Kilburn and Willesden, 1930s semis in Wembley and Kingsbury, and a large and growing cluster of new towers around Wembley Park.',
    epcIssues:
      'This is a high-volume rental borough, so MEES work is common. Older terraces and converted flats with solid walls and dated heating frequently need insulation and boiler upgrades to meet the minimum standard for letting, while the Wembley Park new-builds rate well from the outset.',
    transport:
      'The Jubilee, Metropolitan, Bakerloo and Overground lines, with interchanges at Wembley Park and Wembley Central, keep the borough well connected for appointments.',
    neighbours: ['harrow', 'barnet', 'camden', 'westminster', 'kensington-chelsea', 'ealing', 'hammersmith-fulham'],
    metaTitle: "EPC Assessor Brent | Wembley HA0, Willesden NW10",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Brent. We cover all local districts including Wembley (HA0), Willesden (NW10), Kilburn (NW6), Harlesden (NW10) and Cricklewood (NW2).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Wembley (HA0) or Willesden (NW10)?",
      a: "If your property is located in HA0, NW10, or anywhere across the Brent area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  ealing: {
    slug: 'ealing',
    name: 'Ealing',
    kind: 'borough',
    blurb:
      'Covering W3, W5, W7, W13 and UB1, Ealing, Acton, Hanwell, Southall and West Ealing, with strong demand from family lets.',
    housingStock:
      'Ealing is largely Edwardian and 1930s family houses across Ealing and Hanwell, Victorian terraces in Acton, and denser terraced and converted stock in Southall.',
    epcIssues:
      'Large family houses with solid or early cavity walls typically need fabric or heating upgrades to improve. With strong demand from family lets, landlords here often need loft insulation and heating upgrades before re-letting, and Southall’s older terraces frequently need solid-wall measures.',
    transport:
      'The Elizabeth line through Ealing Broadway, Acton and Southall, plus the Central, District and Piccadilly lines, make Ealing one of the better-connected outer boroughs.',
    neighbours: ['hillingdon', 'harrow', 'brent', 'hammersmith-fulham', 'hounslow'],
    metaTitle: "EPC Assessor Ealing | Acton W3, Southall UB1",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Ealing. We cover all local districts including Ealing (W5), Acton (W3), Hanwell (W7), West Ealing (W13) and Southall (UB1).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Ealing (W5) or Southall (UB1)?",
      a: "If your property is located in W5, UB1, or anywhere across the Ealing area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  hounslow: {
    slug: 'hounslow',
    name: 'Hounslow',
    kind: 'borough',
    blurb:
      'Covering TW3, TW4, TW7, TW8 and TW13, Hounslow, Brentford, Isleworth, Chiswick and Feltham.',
    housingStock:
      'Hounslow combines 1930s semis and terraces in Hounslow and Feltham, period houses in Chiswick and Isleworth, and riverside new-builds in Brentford.',
    epcIssues:
      'Inter-war semis with early cavity walls and original windows generally have room to improve on the fabric side, and cavity fill plus loft top-ups often produce a quick improvement. Chiswick’s protected period stock has limited external-insulation scope, so internal measures dominate there.',
    transport:
      'The Piccadilly line runs through Hounslow with the Elizabeth line nearby, supported by South Western Railway at Brentford and Isleworth.',
    neighbours: ['hillingdon', 'ealing', 'hammersmith-fulham', 'richmond'],
    metaTitle: "EPC Assessor Hounslow | Chiswick W4, Brentford TW8",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Hounslow. We cover all local districts including Hounslow (TW3), Brentford (TW8), Isleworth (TW7), Chiswick (W4) and Feltham (TW13).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Chiswick (W4) or Brentford (TW8)?",
      a: "If your property is located in W4, TW8, or anywhere across the Hounslow area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  richmond: {
    slug: 'richmond',
    name: 'Richmond upon Thames',
    kind: 'borough',
    blurb:
      'Covering TW1, TW2, TW9, TW10, KT2 and SW14, Richmond, Twickenham, Kew, Teddington and East Sheen.',
    housingStock:
      'Richmond is largely Georgian and Victorian houses in Richmond, Kew and Twickenham, 1930s semis in Whitton and Hampton, and riverside conversions and apartments.',
    epcIssues:
      'A high proportion of conservation-area and listed period homes means many properties have limited fabric options. Solid walls and sash windows restrict the improvement options, so heating systems, cylinder insulation and internal measures usually do the work.',
    transport:
      'The District line and Overground terminus at Richmond, plus South Western Railway across Twickenham, Teddington and Kew, cover this riverside borough well.',
    neighbours: ['hounslow', 'hammersmith-fulham', 'wandsworth', 'merton', 'kingston'],
    metaTitle: "EPC Assessor Richmond | Twickenham TW1, Kew TW9",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Richmond upon Thames. We cover all local districts including Richmond (TW9), Twickenham (TW1), Kew (TW9), Teddington (TW11) and East Sheen (SW14).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Richmond (TW9) or Twickenham (TW1)?",
      a: "If your property is located in TW9, TW1, or anywhere across the Richmond area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  kingston: {
    slug: 'kingston',
    name: 'Kingston upon Thames',
    kind: 'borough',
    blurb:
      'Covering KT1, KT2, KT3, KT5 and KT6, Kingston, New Malden, Surbiton and Tolworth.',
    housingStock:
      'Kingston mixes Victorian and Edwardian terraces near the town centre, 1930s semis in New Malden and Tolworth, and Surbiton’s period villas and mansion flats.',
    epcIssues:
      'Inter-war semis and period terraces with solid or early cavity walls commonly need insulation or heating work to move up. Surbiton’s mansion flats often depend on shared heating systems, which limits what an individual owner can change, so improvements focus on glazing, controls and insulation.',
    transport:
      'South Western Railway runs from Kingston, Surbiton and New Malden into Waterloo; the borough has no Underground, so we plan appointments around the rail network.',
    neighbours: ['richmond', 'merton', 'sutton'],
    metaTitle: "EPC Assessor Kingston | New Malden KT3, Surbiton KT6",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire Royal Borough of Kingston upon Thames. We cover all local districts including Kingston (KT1), New Malden (KT3), Surbiton (KT6) and Tolworth (KT6).",
    postcodeFaq: {
      q: "How fast can I get an EPC in New Malden (KT3) or Surbiton (KT6)?",
      a: "If your property is located in KT3, KT6, or anywhere across the Kingston area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  croydon: {
    slug: 'croydon',
    name: 'Croydon',
    kind: 'borough',
    blurb:
      'Covering CR0, CR2, CR7 and SE25, Croydon, Thornton Heath, South Norwood and Purley.',
    housingStock:
      'Croydon spans Victorian and Edwardian terraces in Thornton Heath and South Norwood, 1930s semis across Addiscombe and Shirley, larger period houses in Purley, and town-centre towers.',
    epcIssues:
      'With a large rental market, MEES work is frequent here. Solid-wall terraces and inter-war semis usually depend on heating and insulation upgrades to improve, and many landlords need cavity or loft insulation and boiler upgrades. Town-centre apartments generally rate better.',
    transport:
      'Southern and Thameslink rail, plus the extensive Tramlink network, give us good access across this large southern borough.',
    neighbours: ['bromley', 'lambeth', 'merton', 'sutton'],
    metaTitle: "EPC Assessor Croydon | Thornton Heath CR7, Purley CR2",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Croydon. We cover all local districts including Croydon (CR0), Thornton Heath (CR7), South Norwood (SE25) and Purley (CR2).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Thornton Heath (CR7) or Purley (CR2)?",
      a: "If your property is located in CR7, CR2, or anywhere across the Croydon area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  enfield: {
    slug: 'enfield',
    name: 'Enfield',
    kind: 'borough',
    blurb:
      'Covering EN1, EN2, EN3, N9, N13, N14, N18 and N21, Enfield Town, Edmonton, Palmers Green and Southgate.',
    housingStock:
      'Enfield is largely 1930s semis throughout Enfield Town, Southgate and Palmers Green, Victorian terraces in Edmonton, and larger period houses in Winchmore Hill.',
    epcIssues:
      'Inter-war semis with early cavity walls and dated heating usually have the most scope for improvement, and Edmonton’s terraced rental stock often needs insulation and heating upgrades for MEES. Cavity fill where the walls allow is one of the quickest wins.',
    transport:
      'The Piccadilly line at Southgate and Oakwood, plus Great Northern and Overground rail across the borough, cover Enfield’s spread-out geography.',
    neighbours: ['barnet', 'haringey', 'waltham-forest'],
    metaTitle: "EPC Assessor Enfield | Edmonton N9, Palmers Green N13",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Enfield. We cover all local districts including Enfield Town (EN2), Edmonton (N9), Palmers Green (N13), Southgate (N14) and Winchmore Hill (N21).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Edmonton (N9) or Palmers Green (N13)?",
      a: "If your property is located in N9, N13, or anywhere across the Enfield area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  haringey: {
    slug: 'haringey',
    name: 'Haringey',
    kind: 'borough',
    blurb:
      'Covering N4, N8, N15, N17 and N22, Tottenham, Wood Green, Crouch End, Hornsey and Muswell Hill.',
    housingStock:
      'Haringey ranges from large Victorian houses and conversions in Crouch End and Muswell Hill to terraced stock in Tottenham and Wood Green, with major regeneration underway around Tottenham Hale.',
    epcIssues:
      'Solid-wall Victorian conversions across Crouch End and Hornsey typically need fabric or heating upgrades to improve, with conservation controls limiting external work. Tottenham’s older rental terraces frequently need MEES upgrades, insulation, heating controls and new boilers.',
    transport:
      'The Victoria and Piccadilly lines, plus Overground and Great Northern services and the Tottenham Hale interchange, keep the borough well connected.',
    neighbours: ['barnet', 'enfield', 'waltham-forest', 'hackney', 'islington', 'camden'],
    metaTitle: "EPC Assessor Haringey | Tottenham N17, Crouch End N8",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Haringey. We cover all local districts including Tottenham (N17), Wood Green (N22), Crouch End (N8), Muswell Hill (N10) and South Tottenham (N15).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Tottenham (N17) or Crouch End (N8)?",
      a: "If your property is located in N17, N8, or anywhere across the Haringey area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  redbridge: {
    slug: 'redbridge',
    name: 'Redbridge',
    kind: 'borough',
    blurb:
      'Covering IG1, IG2, IG4, IG5, IG6 and E18, Ilford, Wanstead, Woodford and Barkingside.',
    housingStock:
      'Redbridge is mostly 1930s semis and terraces across Ilford and Barkingside, larger Edwardian houses in Wanstead and Woodford, and converted flats near the Central line.',
    epcIssues:
      'Inter-war stock with early cavity walls and original windows generally have room to improve on the fabric side, with cavity fill and loft insulation the usual quick improvements. Wanstead’s period houses have more limited external-insulation options.',
    transport:
      'The Central line through Wanstead, Woodford and Barkingside, plus the Elizabeth line at Ilford, make the borough straightforward to cover.',
    neighbours: ['waltham-forest', 'newham', 'barking-dagenham', 'havering'],
    metaTitle: "EPC Assessor Redbridge | Ilford IG1, Woodford E18",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Redbridge. We cover all local districts including Ilford (IG1), Barkingside (IG6), Woodford (E18) and Wanstead (E11).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Ilford (IG1) or Woodford (E18)?",
      a: "If your property is located in IG1, E18, or anywhere across the Redbridge area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  havering: {
    slug: 'havering',
    name: 'Havering',
    kind: 'borough',
    blurb:
      'Covering RM1, RM2, RM3, RM11, RM12, RM13 and RM14, Romford, Hornchurch, Upminster and Rainham.',
    housingStock:
      'Havering is dominated by 1930s semis in Romford and Hornchurch, Victorian cottages in Upminster, post-war estates in Harold Hill, and newer developments near Romford.',
    epcIssues:
      'Inter-war semis with early cavity walls and dated gas heating commonly need insulation or heating work to move up. As an outer borough, many homes still have older boilers, so heating upgrades alongside loft and cavity insulation are the common route to a better rating.',
    transport:
      'The Elizabeth line at Romford, Gidea Park and Harold Wood, plus c2c and the District line at Upminster, give us reliable access across this large outer borough.',
    neighbours: ['barking-dagenham', 'redbridge'],
    metaTitle: "EPC Assessor Havering | Romford RM1, Hornchurch RM11",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Havering. We cover all local districts including Romford (RM1), Hornchurch (RM11), Upminster (RM14) and Rainham (RM13).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Romford (RM1) or Hornchurch (RM11)?",
      a: "If your property is located in RM1, RM11, or anywhere across the Havering area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  bexley: {
    slug: 'bexley',
    name: 'Bexley',
    kind: 'borough',
    blurb:
      'Covering DA1, DA5, DA6, DA7, DA8, DA14, DA15, DA16 and DA17, Bexleyheath, Welling, Sidcup and Erith.',
    housingStock:
      'Bexley is largely 1930s semis across Bexleyheath, Welling and Sidcup, post-war housing in Erith and Thamesmead, and pockets of Victorian stock in Old Bexley.',
    epcIssues:
      'Inter-war semis with early cavity walls and original windows usually depend on heating and insulation upgrades to improve, and many owner-occupied homes still have aged heating systems that pull the score down. Cavity fill, loft top-ups and a new boiler are the typical improvements.',
    transport:
      'Southeastern rail serves Bexleyheath, Sidcup and Erith; the borough has no Underground, so appointments are planned around the rail timetable.',
    neighbours: ['greenwich', 'bromley'],
    metaTitle: "EPC Assessor Bexley | Bexleyheath DA6, Sidcup DA14",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Bexley. We cover all local districts including Bexleyheath (DA6), Welling (DA16), Sidcup (DA14) and Erith (DA8).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Bexleyheath (DA6) or Sidcup (DA14)?",
      a: "If your property is located in DA6, DA14, or anywhere across the Bexley area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  bromley: {
    slug: 'bromley',
    name: 'Bromley',
    kind: 'borough',
    blurb:
      'Covering BR1–BR8, SE9, SE19, SE20 and SE26, Bromley, Beckenham, Orpington, Chislehurst and Penge.',
    housingStock:
      'Bromley, London’s largest borough by area, is mostly 1930s semis and detached houses across Bromley, Beckenham and Orpington, Victorian villas in Chislehurst and Penge, and post-war estates in Mottingham.',
    epcIssues:
      'Large inter-war and detached homes with solid or early cavity walls usually have the most scope for improvement. The bigger floor areas mean heating and insulation upgrades have a strong impact on the score, so loft insulation and modern boilers are well worth it.',
    transport:
      'Southeastern rail covers the borough, with Tramlink at Beckenham; there is no Underground, so we work around the rail network.',
    neighbours: ['bexley', 'greenwich', 'lewisham', 'southwark', 'croydon'],
    metaTitle: "EPC Assessor Bromley | Beckenham BR3, Orpington BR6",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Bromley. We cover all local districts including Bromley (BR1), Beckenham (BR3), Orpington (BR6), Chislehurst (BR7) and Penge (SE20).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Beckenham (BR3) or Orpington (BR6)?",
      a: "If your property is located in BR3, BR6, or anywhere across the Bromley area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  sutton: {
    slug: 'sutton',
    name: 'Sutton',
    kind: 'borough',
    blurb:
      'Covering SM1–SM7, Sutton, Cheam, Wallington, Carshalton and Worcester Park.',
    housingStock:
      'Sutton is dominated by 1930s semis across Sutton, Cheam and Worcester Park, with Victorian terraces in Carshalton and Wallington and a number of post-war estates.',
    epcIssues:
      'Inter-war semis with early cavity walls and original glazing typically need fabric or heating upgrades to improve. Many homes here benefit quickly from cavity fill and loft top-ups, which can move a property up a band without major expense.',
    transport:
      'Southern and Thameslink rail serve Sutton, Carshalton and Cheam; with no Underground in the borough, appointments are scheduled around the rail network.',
    neighbours: ['croydon', 'merton', 'kingston'],
    metaTitle: "EPC Assessor Sutton | Cheam SM3, Carshalton SM5",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Sutton. We cover all local districts including Sutton (SM1), Cheam (SM3), Wallington (SM6) and Carshalton (SM5).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Cheam (SM3) or Carshalton (SM5)?",
      a: "If your property is located in SM3, SM5, or anywhere across the Sutton area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  merton: {
    slug: 'merton',
    name: 'Merton',
    kind: 'borough',
    blurb:
      'Covering SW19, SW20, CR4, KT3 and SM4, Wimbledon, Mitcham, Morden and Colliers Wood.',
    housingStock:
      'Merton combines Victorian and Edwardian houses in Wimbledon and Wimbledon Park, 1930s semis in Raynes Park and Morden, and denser terraced stock in Mitcham and Colliers Wood.',
    epcIssues:
      'Period houses around Wimbledon with solid walls and sash windows generally have room to improve on the fabric side. Mitcham’s older terraces often need insulation and heating upgrades, while inter-war semis usually respond well to cavity fill and loft top-ups.',
    transport:
      'The District line and the Northern line terminus at Morden, Tramlink across Mitcham, and South Western Railway and Thameslink services cover the borough well.',
    neighbours: ['wandsworth', 'lambeth', 'croydon', 'sutton', 'kingston', 'richmond'],
    metaTitle: "EPC Assessor Merton | Wimbledon SW19, Mitcham CR4",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Merton. We cover all local districts including Wimbledon (SW19), Mitcham (CR4), Morden (SM4), Colliers Wood (SW19) and Raynes Park (SW20).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Wimbledon (SW19) or Mitcham (CR4)?",
      a: "If your property is located in SW19, CR4, or anywhere across the Merton area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  'hammersmith-fulham': {
    slug: 'hammersmith-fulham',
    name: 'Hammersmith & Fulham',
    kind: 'borough',
    blurb:
      'Covering W6, W12, W14, SW6 and SW10, Hammersmith, Fulham, Shepherd’s Bush and Parsons Green.',
    housingStock:
      'Hammersmith & Fulham is largely Victorian terraces and mansion blocks in Fulham and Hammersmith, period conversions in Shepherd’s Bush, and riverside apartments along the Thames.',
    epcIssues:
      'Solid-wall Victorian terraces and mansion flats commonly need insulation or heating work to move up. Conservation-area controls limit external changes across much of the borough, so improvements concentrate on heating systems, cylinder insulation and glazing.',
    transport:
      'The Piccadilly, District, Circle and Hammersmith & City lines, plus the Overground at Shepherd’s Bush and Imperial Wharf, make the borough quick to reach.',
    neighbours: ['brent', 'kensington-chelsea', 'ealing', 'hounslow', 'richmond', 'wandsworth'],
    metaTitle: "EPC Hammersmith & Fulham | Fulham SW6, Shepherd's Bush W12",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Hammersmith and Fulham. We cover all local districts including Hammersmith (W6), Fulham (SW6), Shepherd's Bush (W12) and Parsons Green (SW6).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Fulham (SW6) or Shepherd's Bush (W12)?",
      a: "If your property is located in SW6, W12, or anywhere across the Hammersmith and Fulham area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  'kensington-chelsea': {
    slug: 'kensington-chelsea',
    name: 'Kensington & Chelsea',
    kind: 'borough',
    blurb:
      'Covering W8, W10, W11, SW3, SW5, SW7 and SW10, Notting Hill, Chelsea, Kensington and Earl’s Court.',
    housingStock:
      'Kensington & Chelsea is defined by grand stucco-fronted terraces and townhouses in Chelsea, Kensington and Notting Hill, mansion blocks in Earl’s Court, and period houses converted into flats throughout.',
    epcIssues:
      'The borough is almost entirely conservation-controlled and heavily listed. Solid walls, sash windows and communal systems mean townhouses and mansion flats usually depend on heating and insulation upgrades to improve, with very limited fabric options, heating controls and lighting do most of the achievable improvement.',
    transport:
      'The District, Circle, Central and Piccadilly lines, plus the Overground at Latimer Road and Kensington (Olympia), give us fast access across the borough.',
    neighbours: ['hammersmith-fulham', 'brent', 'westminster'],
    metaTitle: "EPC Kensington & Chelsea | Notting Hill W11, Chelsea SW3",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire Royal Borough of Kensington and Chelsea. We cover all local districts including Notting Hill (W11), Chelsea (SW3), Kensington (W8) and Earl's Court (SW5).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Notting Hill (W11) or Chelsea (SW3)?",
      a: "If your property is located in W11, SW3, or anywhere across the Kensington and Chelsea area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  'city-of-london': {
    slug: 'city-of-london',
    name: 'City of London',
    kind: 'city',
    blurb:
      'Covering EC1, EC2, EC3 and EC4, the Square Mile and Barbican apartments, plus Smithfield and Fleet Street conversions.',
    housingStock:
      'Residential stock in the City is predominantly apartments, the Barbican and Golden Lane estates, modern riverside and converted-office developments, and a small number of period conversions around Smithfield and Fleet Street.',
    epcIssues:
      'Because flats dominate, ratings depend largely on glazing, heating and communal systems rather than wall fabric. The Barbican’s distinctive concrete construction has limited improvement scope, so most gains come from heating controls and lighting.',
    transport:
      'The Central, Circle, Northern, Metropolitan, Hammersmith & City and Elizabeth lines, plus Thameslink and the City termini, make this the most connected square mile in the country.',
    neighbours: ['camden', 'islington', 'hackney', 'tower-hamlets', 'southwark', 'westminster'],
    metaTitle: "EPC Assessor City of London | Barbican EC2, Smithfield EC1",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire City of London. We cover all local districts including the Barbican (EC2), Smithfield (EC1), Fleet Street (EC4) and the Square Mile (EC3).",
    postcodeFaq: {
      q: "How fast can I get an EPC in the Barbican (EC2) or Smithfield (EC1)?",
      a: "If your property is located in EC2, EC1, or anywhere across the City of London, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  barnet: {
    slug: 'barnet',
    name: 'Barnet',
    kind: 'borough',
    blurb:
      'Covering EN4, EN5, HA8, N2, N3, N10, N11, N12, N14, N20, NW2, NW4, NW7, NW9 and NW11, Barnet, Finchley, Hendon, Edgware and Mill Hill.',
    housingStock:
      'Barnet is dominated by 1930s semis across Finchley, Hendon, Edgware and Mill Hill, with Victorian terraces in High Barnet and larger detached houses and Hampstead Garden Suburb stock in the south.',
    epcIssues:
      'Inter-war semis with early cavity walls and dated heating usually have the most scope for improvement, and cavity fill plus loft insulation often improves them quickly. The Garden Suburb’s protected stock has limited external-insulation scope, so internal measures are used there.',
    transport:
      'The Northern line runs across Finchley, Edgware and High Barnet, supported by Thameslink at Mill Hill and Hendon.',
    neighbours: ['harrow', 'brent', 'camden', 'haringey', 'enfield'],
    metaTitle: "EPC Assessor Barnet | Finchley N3, Edgware HA8",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Barnet. We cover all local districts including Finchley (N3), Hendon (NW4), Edgware (HA8), Mill Hill (NW7) and High Barnet (EN5).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Finchley (N3) or Edgware (HA8)?",
      a: "If your property is located in N3, HA8, or anywhere across the Barnet area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  harrow: {
    slug: 'harrow',
    name: 'Harrow',
    kind: 'borough',
    blurb:
      'Covering HA1, HA2, HA3, HA5, HA7 and HA8, Harrow, Pinner, Stanmore and Wealdstone.',
    housingStock:
      'Harrow is largely 1930s semis across Harrow, Pinner and Stanmore, classic Metro-land stock, with detached houses, Victorian cottages in Pinner village, and post-war estates in Wealdstone.',
    epcIssues:
      'Inter-war Metro-land semis with early cavity walls and original windows typically need fabric or heating upgrades to improve. Many owner-occupied homes still have older boilers, so heating upgrades alongside cavity and loft insulation are the usual improvements.',
    transport:
      'The Metropolitan, Jubilee and Bakerloo lines, plus the Overground and Chiltern Railways at Harrow-on-the-Hill, cover the borough well.',
    neighbours: ['hillingdon', 'barnet', 'brent', 'ealing'],
    metaTitle: "EPC Assessor Harrow | Pinner HA5, Stanmore HA7",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Harrow. We cover all local districts including Harrow (HA1), Pinner (HA5), Stanmore (HA7) and Wealdstone (HA3).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Pinner (HA5) or Stanmore (HA7)?",
      a: "If your property is located in HA5, HA7, or anywhere across the Harrow area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
  hillingdon: {
    slug: 'hillingdon',
    name: 'Hillingdon',
    kind: 'borough',
    blurb:
      'Covering UB3, UB4, UB7, UB8, UB9, UB10, HA4 and HA6, Uxbridge, Hayes, Ruislip, Hillingdon and Northwood.',
    housingStock:
      'Hillingdon is mostly 1930s semis across Uxbridge, Hayes and Ruislip, post-war estates in Hayes and West Drayton, and larger detached houses in Northwood and Ruislip.',
    epcIssues:
      'Inter-war semis with early cavity walls and dated heating generally have room to improve on the fabric side. As an outer borough, many homes still rely on older gas systems, so a new boiler combined with cavity and loft insulation is the typical route to a better band.',
    transport:
      'The Metropolitan and Piccadilly lines, plus the Elizabeth line at Hayes & Harlington and West Drayton, give us solid access across London’s westernmost borough.',
    neighbours: ['harrow', 'ealing', 'hounslow'],
    metaTitle: "EPC Assessor Hillingdon | Uxbridge UB8, Ruislip HA4",
    areasCovered:
      "Our accredited energy assessor provides EPCs across the entire London Borough of Hillingdon. We cover all local districts including Uxbridge (UB8), Hayes (UB3), Ruislip (HA4), Northwood (HA6) and West Drayton (UB7).",
    postcodeFaq: {
      q: "How fast can I get an EPC in Uxbridge (UB8) or Ruislip (HA4)?",
      a: "If your property is located in UB8, HA4, or anywhere across the Hillingdon area, your certificate is lodged on the official GOV.UK EPC register within 72 hours of the visit as standard, or next day with our express service. Appointment availability is confirmed with your exact quote.",
    }
  },
}

export const boroughList = Object.values(boroughMeta)

/**
 * Reusable schema.org areaServed value: London, its boroughs, the City and
 * Stratford. Shared by the sitewide LocalBusiness and the per-service
 * Service nodes so their service-area signals stay consistent.
 */
export const areaServedLondon = [
  { '@type': 'City', name: 'London', containedInPlace: { '@type': 'Country', name: 'United Kingdom' } },
  ...boroughList.map((b) => ({
    '@type': b.kind === 'neighbourhood' ? 'Place' : b.kind === 'city' ? 'City' : 'AdministrativeArea',
    name: b.name,
    containedInPlace: b.partOf
      ? { '@type': 'AdministrativeArea', name: boroughMeta[b.partOf].name, containedInPlace: { '@type': 'City', name: 'London' } }
      : { '@type': 'City', name: 'London' },
  })),
]

/**
 * Boroughs surfaced in the footer's Service Areas strip.
 *
 * A curated subset rather than all 34, deliberately: a sitewide footer linking
 * every borough produces 34 near-identical anchors on every page of the site,
 * which is boilerplate that dilutes both anchor text and the equity each link
 * carries. Twelve links pass meaningfully more each.
 *
 * Discovery of the full set is not affected — /areas server-renders all 34 as
 * real links, and every borough is in the sitemap. This is the standard
 * hub-and-spoke shape: footer -> priority areas + hub, hub -> everything.
 *
 * Ordered by commercial priority, anchored on the Stratford E15 base.
 */
export const priorityBoroughSlugs = [
  'stratford',
  'newham',
  'tower-hamlets',
  'hackney',
  'waltham-forest',
  'redbridge',
  'barking-dagenham',
  'greenwich',
  'lewisham',
  'islington',
  'southwark',
  'camden',
] as const

export const priorityBoroughs = priorityBoroughSlugs
  .map((slug) => boroughMeta[slug])
  .filter(Boolean)

/**
 * Dominant search intent per borough, measured — not assumed.
 *
 * Derived from Google Search Console, 6 months to 14 Aug 2026, by bucketing
 * every query containing the borough or one of its neighbourhoods into
 * cost/price intent vs service/location intent and comparing impressions.
 *
 *   'cost'     >=60% of impressions are cost/price queries
 *   'balanced' 40-59%
 *   'service'  <40%, or fewer than 40 impressions (too little data to justify
 *              changing a title that already holds equity)
 *
 * This exists so the 34 titles are not mechanically identical: Harrow is 88%
 * cost-led while Croydon is 19%, and a single template would serve one of them
 * badly. Re-derive when fresh GSC data is available rather than editing by hand.
 */
export type BoroughIntent = 'cost' | 'balanced' | 'service'

export const boroughIntent: Record<string, BoroughIntent> = {
  'stratford': 'cost',
  'hackney': 'service',
  'tower-hamlets': 'balanced',
  'newham': 'service',
  'greenwich': 'balanced',
  'islington': 'service',
  'southwark': 'service',
  'lewisham': 'balanced',
  'barking-dagenham': 'service',
  'waltham-forest': 'balanced',
  'camden': 'balanced',
  'westminster': 'cost',
  'lambeth': 'balanced',
  'wandsworth': 'balanced',
  'brent': 'balanced',
  'ealing': 'cost',
  'hounslow': 'service',
  'richmond': 'service',
  'kingston': 'service',
  'croydon': 'service',
  'enfield': 'cost',
  'haringey': 'balanced',
  'redbridge': 'cost',
  'havering': 'service',
  'bexley': 'service',
  'bromley': 'service',
  'sutton': 'service',
  'merton': 'service',
  'hammersmith-fulham': 'cost',
  'kensington-chelsea': 'service',
  'city-of-london': 'service',
  'barnet': 'balanced',
  'harrow': 'cost',
  'hillingdon': 'service',
}
