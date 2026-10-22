"""Build lib/borough-stats.ts from the GOV.UK EPC register extract. Re-run monthly.

    py -I scripts/borough-stats.py [--cache DIR]

Refresh runbook (monthly; the GOV.UK file is regenerated on the 1st of each month):
  1. py -I scripts/borough-extract.py --env-file <path to the .env holding EPC_DATA_BEARER_TOKEN> [--cache DIR]
     (streams ~1.1 GB, about 2.5 minutes; writes london-borough-extract.csv.gz and its .stats.json to DIR)
  2. py -I scripts/borough-stats.py [--cache DIR]   -> rewrites lib/borough-stats.ts
  3. node --require ./tests/register.cjs --test tests/borough-stats.test.cjs
     The total-certificates check is pinned to one file date; when the file changes, update the pinned date and
     total in the test after checking the new figure is plausible (London adds roughly 20,000 RdSAP a month).
  4. Commit the regenerated file. Pages show source.fileUpdated, so nothing else needs editing.

Source: MHCLG, Get energy performance of buildings data, domestic full-load CSV (Open Government Licence
v3.0). Scope: RdSAP certificates (report_type 2, existing homes) lodged in the 33 London local authorities
from 01/01/2023 to the file date. No figure on the site is typed by hand: every number comes from here.
Size bands use the pricing boundaries in lib/site.ts, so a price-band change is picked up on the next run.
"""
import argparse, collections, csv, datetime, gzip, json, os, re, statistics, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

LA = {
    'E09000001': ('city-of-london', 'City of London'), 'E09000002': ('barking-dagenham', 'Barking and Dagenham'),
    'E09000003': ('barnet', 'Barnet'), 'E09000004': ('bexley', 'Bexley'), 'E09000005': ('brent', 'Brent'),
    'E09000006': ('bromley', 'Bromley'), 'E09000007': ('camden', 'Camden'), 'E09000008': ('croydon', 'Croydon'),
    'E09000009': ('ealing', 'Ealing'), 'E09000010': ('enfield', 'Enfield'), 'E09000011': ('greenwich', 'Greenwich'),
    'E09000012': ('hackney', 'Hackney'), 'E09000013': ('hammersmith-fulham', 'Hammersmith and Fulham'),
    'E09000014': ('haringey', 'Haringey'), 'E09000015': ('harrow', 'Harrow'), 'E09000016': ('havering', 'Havering'),
    'E09000017': ('hillingdon', 'Hillingdon'), 'E09000018': ('hounslow', 'Hounslow'),
    'E09000019': ('islington', 'Islington'), 'E09000020': ('kensington-chelsea', 'Kensington and Chelsea'),
    'E09000021': ('kingston', 'Kingston upon Thames'), 'E09000022': ('lambeth', 'Lambeth'),
    'E09000023': ('lewisham', 'Lewisham'), 'E09000024': ('merton', 'Merton'), 'E09000025': ('newham', 'Newham'),
    'E09000026': ('redbridge', 'Redbridge'), 'E09000027': ('richmond', 'Richmond upon Thames'),
    'E09000028': ('southwark', 'Southwark'), 'E09000029': ('sutton', 'Sutton'),
    'E09000030': ('tower-hamlets', 'Tower Hamlets'), 'E09000031': ('waltham-forest', 'Waltham Forest'),
    'E09000032': ('wandsworth', 'Wandsworth'), 'E09000033': ('westminster', 'Westminster'),
}
# Stratford's page covers the E15 and E20 postcodes (lib/boroughs.ts, stratford.blurb).
STRATFORD = ['E15', 'E20']
DISTRICT_MIN = 200

GROUP = {'A': 'AtoC', 'B': 'AtoC', 'C': 'AtoC', 'D': 'D', 'E': 'E', 'F': 'FtoG', 'G': 'FtoG'}
GROUPS = ['AtoC', 'D', 'E', 'FtoG']
AGE = {
    'before 1900': 'pre1930', '1900-1929': 'pre1930', '1930-1949': 'from1930to1966', '1950-1966': 'from1930to1966',
    '1967-1975': 'from1967to1990', '1976-1982': 'from1967to1990', '1983-1990': 'from1967to1990',
    '1991-1995': 'from1991to2011', '1996-2002': 'from1991to2011', '2003-2006': 'from1991to2011',
    '2007-2011': 'from1991to2011', '2012 onwards': 'from2012', '2012-2021': 'from2012', '2022 onwards': 'from2012',
}
AGES = ['pre1930', 'from1930to1966', 'from1967to1990', 'from1991to2011', 'from2012']
WALLS = ['solidUninsulated', 'solidInsulated', 'cavityUninsulated', 'cavityInsulated', 'systemBuilt', 'timberFrame', 'other']
HEATING = ['mainsGas', 'communal', 'electric', 'heatPump', 'other']
CAVEATS = [
    'Counts are certificates, not homes: a home lodged twice in the period is counted twice.',
    'Homes get an EPC when they are let, sold or surveyed, so these figures describe homes that were, not every home.',
    'Existing homes only (RdSAP certificates). New-build certificates are left out.',
    'Large batches of social-housing certificates lift some boroughs in some years, so certificates a year counts '
    'private lettings and marketed sales only.',
    'RdSAP 10 replaced the earlier assessment method during the period, so earlier and later ratings are not fully '
    'comparable.',
    'A rating reflects what the assessment recorded about the home, not energy prices or how the home is used.',
]


def size_edges():
    """Upper bounds of the pricing bands, read from lib/site.ts so the bands can't drift from the prices."""
    text = (ROOT / 'lib' / 'site.ts').read_text(encoding='utf-8')
    rows = re.findall(r"\{\s*id:\s*'([^']+)'[^}]*?areaMax:\s*(\d+|null)", text)
    if len(rows) != 6 or rows[-1][1] != 'null':
        raise SystemExit(f'lib/site.ts pricing: expected six bands ending open, got {rows}')
    return [i for i, _ in rows], [float(m) for _, m in rows[:-1]]


BAND_IDS, EDGES = size_edges()


def size_band(area):
    for i, edge in enumerate(EDGES):
        if area <= edge:
            return BAND_IDS[i]
    return BAND_IDS[-1]


def wall_group(desc):
    d = desc.lower()
    if not d:
        return None
    insulated = any(s in d for s in ('filled cavity', 'with internal', 'with external', 'with additional', 'as built, insulated'))
    # "partial insulation" counts as not insulated: the wall still loses most of its heat.
    if d.startswith(('solid brick', 'sandstone', 'granite', 'cob')):
        return 'solidInsulated' if insulated else 'solidUninsulated'
    if d.startswith('cavity'):
        return 'cavityInsulated' if insulated else 'cavityUninsulated'
    if d.startswith('system built'):
        return 'systemBuilt'
    if d.startswith('timber frame'):
        return 'timberFrame'
    return 'other'


def heating_group(desc):
    """Classify the main system only: the first two comma-separated parts ("Boiler and radiators, mains gas")."""
    d = ', '.join(desc.lower().split(', ')[:2])
    if not d:
        return None
    if 'heat pump' in d:
        return 'heatPump'
    if 'community' in d or 'heat network' in d:
        return 'communal'
    if 'mains gas' in d:
        return 'mainsGas'
    if 'electric' in d or 'no system present' in d:
        return 'electric'
    return 'other'


def pct(n, d):
    return round(100 * n / d, 1) if d else 0.0


def median(xs):
    return int(round(statistics.median(xs))) if xs else None


def rating_mix(ratings):
    c = collections.Counter(GROUP[r] for r in ratings if r in GROUP)
    n = sum(c.values())
    return {'n': n, 'counts': {g: c[g] for g in GROUPS}, 'pct': {g: pct(c[g], n) for g in GROUPS}}


def mix(values, keys):
    c = collections.Counter(v for v in values if v)
    n = sum(c.values())
    return {'n': n, 'pct': {k: pct(c[k], n) for k in keys}}


def summarise(rows, slug, name, code, full_years, districts=True):
    n = len(rows)
    areas = [r['area'] for r in rows if r['area'] > 0]
    flats = [r for r in rows if r['property_type'] in ('Flat', 'Maisonette')]
    houses = [r for r in rows if r['property_type'] in ('House', 'Bungalow')]
    prs = [r for r in rows if r['tenure'] == 'rented (private)']
    prs_mix = rating_mix(r['current_energy_rating'] for r in prs)
    lettings = [r for r in rows if r['transaction_type'] == 'Rental' and r['tenure'] != 'rented (social)']
    sales = [r for r in rows if r['transaction_type'] == 'Marketed sale']
    market = sum(1 for r in lettings + sales if r['year'] in full_years)
    bands = collections.Counter(size_band(a) for a in areas)
    size = [{'id': b, 'n': bands[b], 'pct': pct(bands[b], len(areas))} for b in BAND_IDS]
    top = max(size, key=lambda s: s['n'])
    below_c = [r for r in rows if GROUP.get(r['current_energy_rating']) in ('D', 'E', 'FtoG')]
    by_year = collections.defaultdict(list)
    for r in rows:
        by_year[r['year']].append(r['current_energy_rating'])
    out = {
        'slug': slug, 'name': name, 'code': code, 'certificates': n,
        'ratings': rating_mix(r['current_energy_rating'] for r in rows),
        'byYear': {y: rating_mix(v) for y, v in sorted(by_year.items())},
        'privateRented': {
            'n': len(prs),
            'pctBelowC': round(100 - prs_mix['pct']['AtoC'], 1) if prs_mix['n'] else 0.0,
            'nFtoG': prs_mix['counts']['FtoG'], 'pctFtoG': prs_mix['pct']['FtoG'],
        },
        'floorArea': {'median': median(areas), 'flats': median([r['area'] for r in flats if r['area'] > 0]),
                      'houses': median([r['area'] for r in houses if r['area'] > 0])},
        'sizeBands': size,
        'commonestBand': {'id': top['id'], 'pct': top['pct']},
        'pctFlats': pct(len(flats), n),
        'marketPerYear': round(market / len(full_years)) if full_years else 0,
        'pctLettings': pct(len(lettings), n), 'pctSales': pct(len(sales), n),
        'age': mix((AGE.get(r['construction_age_band'].replace('England and Wales: ', '')) for r in rows), AGES),
        'walls': mix((wall_group(r['walls_description']) for r in rows), WALLS),
        'heating': mix((heating_group(r['mainheat_description']) for r in rows), HEATING),
        'potential': {
            'pctAtoC': pct(sum(1 for r in rows if GROUP.get(r['potential_energy_rating']) == 'AtoC'), n),
            'pctBelowCCouldReachC': pct(sum(1 for r in below_c if GROUP.get(r['potential_energy_rating']) == 'AtoC'), len(below_c)),
        },
        'districts': [], 'otherDistricts': {'n': 0, 'districts': 0},
    }
    if districts:
        by_d = collections.defaultdict(list)
        for r in rows:
            by_d[r['postcode_district'] or 'unknown'].append(r)
        kept, other_n, other_d = [], 0, 0
        for d, rs in sorted(by_d.items(), key=lambda kv: -len(kv[1])):
            if d != 'unknown' and len(rs) >= DISTRICT_MIN:
                kept.append({'district': d, 'n': len(rs),
                             'pctAtoC': rating_mix(r['current_energy_rating'] for r in rs)['pct']['AtoC'],
                             'medianArea': median([r['area'] for r in rs if r['area'] > 0])})
            else:
                other_n += len(rs)
                other_d += 1
        out['districts'], out['otherDistricts'] = kept, {'n': other_n, 'districts': other_d}
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cache', default=os.path.join(tempfile.gettempdir(), 'ld-borough-stats'))
    ap.add_argument('--out', default=str(ROOT / 'lib' / 'borough-stats.ts'))
    a = ap.parse_args()
    src = Path(a.cache) / 'london-borough-extract.csv.gz'
    info = json.loads(Path(str(src) + '.stats.json').read_text(encoding='utf-8'))
    file_updated = info['file_info']['data']['lastUpdated'][:10]

    rows = []
    with gzip.open(src, 'rt', encoding='utf-8', newline='') as f:
        for r in csv.DictReader(f):
            if r['report_type'] != '2' or r['local_authority'] not in LA:
                continue
            try:
                r['area'] = float(r['total_floor_area'] or 0)
            except ValueError:
                r['area'] = 0.0
            rows.append(r)
    if not rows:
        raise SystemExit(f'{src}: no RdSAP London rows')

    file_year = int(file_updated[:4])
    present = sorted({r['year'] for r in rows})
    full_years = [y for y in present if file_year - 3 <= int(y) <= file_year - 1]
    dates = sorted(r['lodgement_date'][:10] for r in rows if r['lodgement_date'])

    by_la = collections.defaultdict(list)
    for r in rows:
        by_la[r['local_authority']].append(r)
    boroughs = {}
    for code, (slug, name) in LA.items():
        if not by_la[code]:
            raise SystemExit(f'no certificates for {name}')
        boroughs[slug] = summarise(by_la[code], slug, name, code, full_years)

    strat_rows = [r for r in rows if r['postcode_district'] in STRATFORD]
    stratford = summarise(strat_rows, 'stratford', 'Stratford', None, full_years)
    stratford['definedBy'] = STRATFORD
    stratford['localAuthorities'] = dict(collections.Counter(LA[r['local_authority']][0] for r in strat_rows).most_common())

    data = {
        'boroughs': boroughs,
        'london': summarise(rows, 'london', 'London', None, full_years, districts=False),
        'stratford': stratford,
        'thresholds': {'districtMin': DISTRICT_MIN},
        'source': {
            'title': 'Get energy performance of buildings data: domestic certificates',
            'publisher': 'Ministry of Housing, Communities and Local Government',
            'url': 'https://get-energy-performance-data.communities.gov.uk/',
            'licence': 'Open Government Licence v3.0',
            'attribution': 'Contains public sector information licensed under the Open Government Licence v3.0.',
            'fileUpdated': file_updated, 'from': dates[0], 'to': dates[-1],
            'generated': datetime.date.today().isoformat(), 'caveats': CAVEATS,
        },
    }
    body = json.dumps(data, indent=1, ensure_ascii=False)
    Path(a.out).write_text(
        '// Generated by scripts/borough-stats.py from the GOV.UK EPC register (MHCLG, OGL v3.0). Do not edit by hand:\n'
        '// re-run scripts/borough-extract.py and scripts/borough-stats.py (runbook at the top of borough-stats.py).\n'
        "import type { BoroughStatsData } from './borough-stats-types'\n\n"
        f'export const boroughStats: BoroughStatsData = {body}\n', encoding='utf-8', newline='\n')
    print(f"wrote {a.out}: {len(boroughs)} boroughs, {len(rows):,} certificates, file {file_updated}, "
          f"lodged {dates[0]} to {dates[-1]}, market years {full_years}")


if __name__ == '__main__':
    sys.exit(main())
