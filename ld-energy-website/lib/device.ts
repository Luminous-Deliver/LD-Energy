/**
 * "Phone · Safari" for the business email (Abdul 30/10/2026: which devices bring leads). Read from the request's
 * User-Agent on the server, so the form sends nothing extra. Brave reports itself as Chrome and cannot be told apart.
 */
export function deviceLabel(ua: string | null | undefined): string {
  if (!ua) return 'Not recorded'
  const kind = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua) ? 'Tablet' : /Mobi|iPhone|Android/i.test(ua) ? 'Phone' : 'Computer'
  const browser = /SamsungBrowser/i.test(ua) ? 'Samsung Internet'
    : /Edg(e|A|iOS)?\//.test(ua) ? 'Edge'
    : /OPR\/|Opera/.test(ua) ? 'Opera'
    : /Firefox|FxiOS/.test(ua) ? 'Firefox'
    : /GSA\//.test(ua) ? 'the Google app'
    : /FBAN|FBAV|Instagram/.test(ua) ? 'an in-app browser (Facebook or Instagram)'
    : /CriOS|Chrome\//.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) ? 'Safari'
    : 'another browser'
  const os = /iPhone|iPad|iOS/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS X|Macintosh/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : ''
  return [kind, browser, os].filter(Boolean).join(' · ')
}
