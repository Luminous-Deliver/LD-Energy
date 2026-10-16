"""Build lib/area-stats.ts from the official EPC statistics. Re-run when a new edition lands.

    py -I scripts/area-stats.py [--cache DIR]

Sources (all OGL v3.0 unless noted):
  ONS   Energy efficiency of housing in England and Wales, edition "march2025" (published
        28/10/2025): the latest EPC per dwelling lodged Q2 2015 to Q1 2025. Tables 2a-2e by
        local authority, 3a/3b by MSOA, 1a by region.
  MHCLG Energy Performance of Buildings Certificates live table EB1 (existing dwellings by
        energy efficiency rating, by local authority, per quarter).
  House of Commons Library MSOA Names (Open Parliament Licence v3.0) for neighbourhood names.

When ONS or MHCLG publish a new edition, update the URLs and dates in SOURCES and re-run.
No figure on the site is typed by hand: every number comes from this script's output.
"""
import argparse, csv, json, os, sys, urllib.request, zipfile, tempfile
import xml.etree.ElementTree as ET
from pathlib import Path

import openpyxl

ONS_BASE = 'https://www.ons.gov.uk/file?uri=/peoplepopulationandcommunity/housing/datasets/'
SOURCES = {
    'onsMedian': ONS_BASE + 'medianenergyefficiencyscoreenglandandwales/march2025/medianenergyefficiencyscoreenglandandwales.xlsx',
    'onsCPlus': ONS_BASE + 'energyperformancecertificateepcbandcoraboveenglandandwales/march2025/epcbandcoraboveenglandandwales.xlsx',
    'onsBands': ONS_BASE + 'individualenergyperformancecertificateepcbandsenglandandwales/march2025/individualepcbandsenglandandwales.xlsx',
    'mhclgEB1': 'https://assets.publishing.service.gov.uk/media/6a69c5e816bc92f51e1a42d7/EB1-_Existing_Domestic_Properties.ods',
    'msoaNames': 'https://houseofcommonslibrary.github.io/msoanames/MSOA-Names-Latest2.csv',
}
META = {
    'ons': {
        'title': 'Energy efficiency of housing in England and Wales',
        'publisher': 'Office for National Statistics',
        'edition': 'March 2025',
        'published': '2025-10-28',
        'coverage': 'April 2015 to March 2025',
        'url': 'https://www.ons.gov.uk/peoplepopulationandcommunity/housing/articles/energyefficiencyofhousinginenglandandwales/2025',
    },
    'mhclg': {
        'title': 'Energy Performance of Buildings Certificates, live table EB1',
        'publisher': 'Ministry of Housing, Communities and Local Government',
        'published': '2026-07-30',
        'url': 'https://www.gov.uk/government/statistical-data-sets/live-tables-on-energy-performance-of-buildings-certificates',
    },
    'msoaNames': {
        'title': 'MSOA Names',
        'publisher': 'House of Commons Library',
        'licence': 'Open Parliament Licence v3.0',
        'url': 'https://houseofcommonslibrary.github.io/msoanames/',
    },
}

# ONS local authority names that don't slugify directly.
SLUG = {
    'Barking and Dagenham': 'barking-dagenham', 'Hammersmith and Fulham': 'hammersmith-fulham',
    'Kensington and Chelsea': 'kensington-chelsea', 'Kingston upon Thames': 'kingston',
    'Richmond upon Thames': 'richmond',
}

# Stratford's neighbourhoods: the MSOAs whose House of Commons Library names carry Stratford,
# East Village, Carpenters or Mill Meads, and where real E15 and E20 postcodes fall. Checked
# 16/10/2026 against 534 postcodes from api.postcodes.io (sectors E15 1-4, E20 1-3): E20 1 is 82%
# East Village; E15 1 and E15 4 are mostly Carpenters/Stratford New Town, Stratford Central and
# Stratford East; E15 3 is mostly West Ham & Stratford Park; E15 2 and E20 2 are mostly Mill Meads.
STRATFORD_MSOAS = ['E02006995', 'E02006996', 'E02000725', 'E02000722', 'E02006997', 'E02000733']

LONDON, ENGLAND = 'E12000007', 'E92000001'


def fetch(url, cache):
    name = url.rsplit('/', 1)[-1]
    path = cache / name
    if not path.exists():
        req = urllib.request.Request(url, headers={'User-Agent': 'curl/8.7.1'})
        path.write_bytes(urllib.request.urlopen(req, timeout=120).read())
    return path


def xlsx_table(path, sheet):
    """Rows of one ONS sheet as dicts, keyed by its header row (the first row naming a code)."""
    rows = list(openpyxl.load_workbook(path, read_only=True)[sheet].iter_rows(values_only=True))
    head = next(i for i, r in enumerate(rows) if r and any(isinstance(c, str) and 'code' in c.lower() for c in r if c))
    keys = rows[head]
    return [dict(zip(keys, r)) for r in rows[head + 1:] if r and r[0]]


def num(v):
    """ONS cells hold numbers, numeric strings, or '[x]' for suppressed (fewer than five EPCs)."""
    if v is None or (isinstance(v, str) and v.strip().startswith('[')):
        return None
    return round(float(v), 2)


def ods_rows(path, sheet):
    T = '{urn:oasis:names:tc:opendocument:xmlns:table:1.0}'
    O = '{urn:oasis:names:tc:opendocument:xmlns:office:1.0}'
    root = ET.fromstring(zipfile.ZipFile(path).read('content.xml'))
    for t in root.iter(T + 'table'):
        if t.get(T + 'name') != sheet:
            continue
        for r in t.iter(T + 'table-row'):
            cells = []
            for c in r:
                if c.tag not in (T + 'table-cell', T + 'covered-table-cell'):
                    continue
                v = c.get(O + 'value')
                v = float(v) if v is not None else (''.join(c.itertext()) or None)
                cells.extend([v] * min(int(c.get(T + 'number-columns-repeated', 1)), 40))
            yield cells
        return
    raise SystemExit(f'{path.name}: no sheet {sheet}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cache', default=os.path.join(tempfile.gettempdir(), 'ld-area-stats'))
    ap.add_argument('--out', default=str(Path(__file__).resolve().parent.parent / 'lib' / 'area-stats.ts'))
    a = ap.parse_args()
    cache = Path(a.cache); cache.mkdir(parents=True, exist_ok=True)
    f = {k: fetch(u, cache) for k, u in SOURCES.items()}

    def by_code(path, sheet, code_key='Local authority district code'):
        return {r[code_key]: r for r in xlsx_table(path, sheet)}

    m2a, m2b, m2c, m2d = (by_code(f['onsMedian'], s) for s in ('2a', '2b', '2c', '2d'))
    c2a, c2b, c2d = (by_code(f['onsCPlus'], s) for s in ('2a', '2b', '2d'))
    regionM = by_code(f['onsMedian'], '1a', 'Country or region code')
    regionC = by_code(f['onsCPlus'], '1a', 'Country or region code')
    regionB = by_code(f['onsBands'], '1a', 'Country or region code')

    # MHCLG EB1 by local authority: the four latest quarters.
    rows = list(ods_rows(f['mhclgEB1'], 'EB1_by_LA'))
    head = next(i for i, r in enumerate(rows) if r and r[0] == 'Local Authority Code')
    keys = rows[head]
    eb1 = [dict(zip(keys, r)) for r in rows[head + 1:] if r and isinstance(r[0], str) and r[0].startswith('E09')]
    quarters = sorted({r['Quarter'] for r in eb1})[-4:]
    if len(quarters) != 4:
        raise SystemExit('EB1: fewer than four quarters for London')

    def lodgements(code):
        rs = [r for r in eb1 if r['Local Authority Code'] == code and r['Quarter'] in quarters]
        if len(rs) != 4:
            raise SystemExit(f'EB1: {code} has {len(rs)} of the four latest quarters')
        return {'total': int(sum(r['Number Lodgements'] for r in rs)),
                'bands': {b: int(sum(r[b] for r in rs)) for b in 'ABCDEFG'}}

    boroughs = {}
    for code, r in m2a.items():
        if not str(code).startswith('E09'):
            continue
        name = r['Local authority district name']
        slug = SLUG.get(name, name.lower().replace(' ', '-'))
        b, c, d = m2b.get(code, {}), m2c[code], m2d[code]
        cb, cd = c2b.get(code, {}), c2d[code]
        boroughs[slug] = {
            'code': code, 'name': name,
            'median': num(r['All Dwellings']), 'pctCPlus': num(c2a[code]['All dwellings']),
            'medianExisting': num(d['Existing dwellings']), 'medianNew': num(d['New dwellings']),
            'pctCPlusExisting': num(cd['Existing dwellings']), 'pctCPlusNew': num(cd['New dwellings']),
            'medianByAge': {'pre1929': num(c['Pre-1929']), 'from1930to1982': num(c['1930 to 1982']),
                            'from1983to2011': num(c['1983 to 2011']), 'from2012': num(c['2012 onwards'])},
            'medianByType': {k: num(b.get(h)) for k, h in (('detached', 'Detached'), ('semi', 'Semi-detached'), ('terraced', 'Terraced'), ('flats', 'Flats and maisonettes'))},
            'pctCPlusByType': {k: num(cb.get(h)) for k, h in (('detached', 'Detached'), ('semi', 'Semi-detached'), ('terraced', 'Terraced'), ('flats', 'Flats and maisonettes'))},
            'lodgements': lodgements(code),
        }
    if len(boroughs) != 33:
        raise SystemExit(f'expected 33 London local authorities, got {len(boroughs)}')

    def region(code):
        b = regionB[code]
        return {'median': num(regionM[code]['All dwellings']), 'pctCPlus': num(regionC[code]['All dwellings']),
                'pctBands': {x: num(b[f'Band {x}']) for x in 'ABCDEFG'}}

    names = {r['msoa21cd']: r['msoa21hclnm'] for r in csv.DictReader(open(f['msoaNames'], encoding='utf-8-sig'))}
    m3a = by_code(f['onsMedian'], '3a', 'Middle super output layer (MSOA) code')
    m3b = by_code(f['onsMedian'], '3b', 'Middle super output layer (MSOA) code')
    c3a = by_code(f['onsCPlus'], '3a', 'Middle super output layer (MSOA) code')
    stratford = [{
        'code': code, 'name': names[code], 'onsName': m3a[code]['Middle super output layer (MSOA) name'],
        'median': num(m3a[code]['All dwellings']), 'pctCPlus': num(c3a[code]['All dwellings']),
        'medianExisting': num(m3b[code]['Existing dwellings']), 'medianNew': num(m3b[code]['New dwellings']),
    } for code in STRATFORD_MSOAS]

    q = [x.split('/') for x in (quarters[0], quarters[-1])]
    first = {'1': 'January', '2': 'April', '3': 'July', '4': 'October'}[q[0][1]] + ' ' + q[0][0]
    last = {'1': 'March', '2': 'June', '3': 'September', '4': 'December'}[q[1][1]] + ' ' + q[1][0]
    meta = json.loads(json.dumps(META))
    meta['mhclg']['period'] = f'{first} to {last}'

    data = {'boroughs': boroughs, 'london': region(LONDON), 'england': region(ENGLAND), 'stratford': stratford, 'sources': meta}
    body = json.dumps(data, indent=2, ensure_ascii=False)
    Path(a.out).write_text(
        '// Generated by scripts/area-stats.py from ONS and MHCLG EPC statistics. Do not edit by hand:\n'
        '// change the script or its source editions and re-run it.\n'
        "import type { AreaStatsData } from './area-stats-types'\n\n"
        f'export const areaStats: AreaStatsData = {body}\n', encoding='utf-8', newline='\n')
    print(f'wrote {a.out}: {len(boroughs)} boroughs, {len(stratford)} Stratford neighbourhoods, lodgements {meta["mhclg"]["period"]}')


if __name__ == '__main__':
    sys.exit(main())
