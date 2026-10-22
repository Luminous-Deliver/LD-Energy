import { ImageResponse } from 'next/og'
import { ogLogo } from './og-logo-data'
import { priceFrom } from '@/lib/site'

export const runtime = 'edge'
export const alt = `L&D Energy, Domestic EPC London from £${priceFrom.epc}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: 'linear-gradient(135deg, #33507F 0%, #1D3050 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '18px 28px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img src={ogLogo} width={276} height={120} alt="L&D Energy" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 84, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            <span>Domestic EPCs</span>
            <span>from {`£${priceFrom.epc}`}</span>
          </div>
          <div style={{ fontSize: 32, opacity: 0.9, fontWeight: 500 }}>
            Elmhurst &amp; Quidos accredited · Next-day visits · All London
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '2px solid rgba(255,255,255,0.25)',
            paddingTop: 28,
            fontSize: 26,
            fontWeight: 600,
          }}
        >
          <span>epc.luminousanddeliver.co.uk</span>
          <span style={{ color: '#95BFAD' }}>07492 575 396</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
