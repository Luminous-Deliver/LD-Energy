"""Extract London domestic EPCs from MHCLG's full-load zip for scripts/borough-stats.py.

    py -I scripts/borough-extract.py --env-file PATH\\TO\\.env [--cache DIR] [--years 2023 2024 2025 2026]
    py -I scripts/borough-extract.py --env-file PATH\\TO\\.env --header      # print the CSV columns and stop

Source: Get energy performance of buildings data (MHCLG), domestic full-load CSV,
https://api.get-energy-performance-data.communities.gov.uk/api/files/domestic/csv (Open Government
Licence v3.0). The zip is ~8 GB with one certificates-YYYY.csv per year and is regenerated on the 1st of
each month. zipfile only needs a seekable file, so the presigned S3 URL is wrapped in one and only the
chosen years are streamed with HTTP range requests (London 2023-26 reads about 1.1 GB, nothing is stored).

The bearer token comes from EPC_DATA_BEARER_TOKEN in the environment or in the --env-file given (GOV.UK
One Login, "My account"). It is read at run time and never written anywhere.

Privacy: the output keeps no address, no full postcode and no UPRN. The postcode is cut to its outward
code (E15 1AB -> E15) as each row is read; UPRNs are only counted in memory for the stats file.
The output goes to the cache directory, never into this repository.
"""
import argparse, csv, datetime, gzip, io, json, os, re, sys, tempfile, time, urllib.error, urllib.request, zipfile
from pathlib import Path

API = 'https://api.get-energy-performance-data.communities.gov.uk/api/files/domestic/csv'
INFO = API + '/info'
# Columns kept as they are. uprn is read for counting only and dropped from the output.
KEEP = ['certificate_number', 'local_authority', 'property_type', 'built_form', 'tenure', 'transaction_type',
        'report_type', 'total_floor_area', 'number_habitable_rooms', 'lodgement_date', 'current_energy_rating',
        'potential_energy_rating', 'construction_age_band', 'walls_description', 'mainheat_description',
        'main_fuel', 'current_energy_efficiency', 'heating_cost_current', 'hot_water_cost_current',
        'lighting_cost_current', 'photo_supply']
OUTWARD = re.compile(r'^[A-Z]{1,2}[0-9][A-Z0-9]?$')


def token(env_file):
    if os.environ.get('EPC_DATA_BEARER_TOKEN'):
        return os.environ['EPC_DATA_BEARER_TOKEN'].strip()
    if env_file:
        for line in Path(env_file).read_text(encoding='utf-8').splitlines():
            if line.startswith('EPC_DATA_BEARER_TOKEN='):
                return line.split('=', 1)[1].strip().strip('"').strip("'")
    sys.exit('EPC_DATA_BEARER_TOKEN not set and not found in --env-file')


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


def presigned(tok):
    req = urllib.request.Request(API, headers={'Authorization': 'Bearer ' + tok, 'Accept': 'application/json'})
    try:
        urllib.request.build_opener(_NoRedirect).open(req, timeout=60)
    except urllib.error.HTTPError as e:
        if e.code in (301, 302, 303, 307):
            return e.headers['Location']
        raise
    raise RuntimeError('expected a 302 to the zip')


def file_info(tok):
    req = urllib.request.Request(INFO, headers={'Authorization': 'Bearer ' + tok, 'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


class RangeFile(io.RawIOBase):
    """Read-only seekable view of the remote zip, fetched in 16 MB ranges."""
    CHUNK = 16 * 1024 * 1024

    def __init__(self, tok):
        self.tok = tok
        self.url, self.pos, self.buf_start, self.buf, self.fetched = presigned(tok), 0, 0, b'', 0
        with urllib.request.urlopen(urllib.request.Request(self.url, headers={'Range': 'bytes=0-0'}), timeout=60) as r:
            self.size = int(r.headers['Content-Range'].split('/')[1])

    def readable(self): return True
    def seekable(self): return True
    def tell(self): return self.pos

    def seek(self, off, whence=0):
        self.pos = off if whence == 0 else self.pos + off if whence == 1 else self.size + off
        return self.pos

    def _get(self, start, end):
        for attempt in range(5):
            try:
                req = urllib.request.Request(self.url, headers={'Range': f'bytes={start}-{end}'})
                with urllib.request.urlopen(req, timeout=180) as r:
                    data = r.read()
                self.fetched += len(data)
                return data
            except urllib.error.HTTPError as e:
                if e.code != 403:  # 403 = the presigned URL expired: get a fresh one
                    raise
                self.url = presigned(self.tok)
            except OSError:
                time.sleep(5 * (attempt + 1))
        raise RuntimeError(f'range {start}-{end} failed')

    def read(self, n=-1):
        n = self.size - self.pos if n is None or n < 0 else min(n, self.size - self.pos)
        if n <= 0:
            return b''
        if not (self.buf_start <= self.pos and self.pos + n <= self.buf_start + len(self.buf)):
            self.buf_start = self.pos
            self.buf = self._get(self.pos, min(self.size, self.pos + max(n, self.CHUNK)) - 1)
        off = self.pos - self.buf_start
        out = self.buf[off:off + n]
        self.pos += len(out)
        return out

    def readinto(self, b):
        data = self.read(len(b))
        b[:len(data)] = data
        return len(data)


def outward(postcode):
    """E15 1AB -> E15. The inward code is always the last three characters."""
    p = postcode.strip().upper()
    p = p.split()[0] if ' ' in p else p[:-3]
    return p if OUTWARD.match(p) else ''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--env-file', help='a .env holding EPC_DATA_BEARER_TOKEN (the environment variable wins)')
    ap.add_argument('--cache', default=os.path.join(tempfile.gettempdir(), 'ld-borough-stats'))
    ap.add_argument('--years', nargs='+', default=[str(y) for y in range(2023, datetime.date.today().year + 1)])
    ap.add_argument('--header', action='store_true', help='print the CSV columns of the latest year and stop')
    a = ap.parse_args()
    tok = token(a.env_file)
    rf = RangeFile(tok)
    zf = zipfile.ZipFile(rf)

    if a.header:
        RangeFile.CHUNK = 2 * 1024 * 1024
        with zf.open(f'certificates-{a.years[-1]}.csv') as f:
            hdr = next(csv.reader(io.TextIOWrapper(f, encoding='utf-8', newline='')))
        print(len(hdr), 'columns')
        print('\n'.join(hdr))
        missing = [c for c in KEEP + ['postcode', 'uprn'] if c not in hdr]
        print('missing from KEEP:', missing or 'none')
        return

    cache = Path(a.cache); cache.mkdir(parents=True, exist_ok=True)
    out = cache / 'london-borough-extract.csv.gz'
    info = file_info(tok)
    stats = {'source': API, 'licence': 'Open Government Licence v3.0', 'file_info': info, 'zip_bytes': rf.size,
             'extracted': datetime.date.today().isoformat(), 'years': {}}
    uprns, multi = set(), 0
    with gzip.open(out, 'wt', encoding='utf-8', newline='') as g:
        w = csv.writer(g)
        w.writerow(['year'] + KEEP + ['postcode_district'])
        for y in a.years:
            t0, total, london, no_district = time.time(), 0, 0, 0
            with zf.open(f'certificates-{y}.csv') as f:
                r = csv.reader(io.TextIOWrapper(f, encoding='utf-8', newline=''))
                hdr = next(r)
                missing = [c for c in KEEP + ['postcode', 'uprn'] if c not in hdr]
                if missing:
                    raise SystemExit(f'certificates-{y}.csv lacks {missing}; check the data dictionary')
                idx = [hdr.index(c) for c in KEEP]
                la, pc, up = hdr.index('local_authority'), hdr.index('postcode'), hdr.index('uprn')
                for row in r:
                    total += 1
                    if not row[la].startswith('E09'):  # the 32 London boroughs + City of London
                        continue
                    london += 1
                    d = outward(row[pc])
                    no_district += not d
                    if row[up]:
                        if row[up] in uprns:
                            multi += 1
                        else:
                            uprns.add(row[up])
                    w.writerow([y] + [row[i] for i in idx] + [d])
            stats['years'][y] = {'rows': total, 'london_rows': london, 'no_district': no_district,
                                 'seconds': round(time.time() - t0)}
            print(y, stats['years'][y], f'fetched {rf.fetched / 1e9:.2f} GB', flush=True)
    stats.update({'fetched_bytes': rf.fetched, 'distinct_uprns': len(uprns), 'repeat_certificates': multi})
    Path(str(out) + '.stats.json').write_text(json.dumps(stats, indent=1), encoding='utf-8')
    print(f'wrote {out}')


if __name__ == '__main__':
    sys.exit(main())
