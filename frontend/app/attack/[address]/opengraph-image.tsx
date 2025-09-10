import { ImageResponse } from 'next/og'
import { getAgentDataForOG } from '@/lib/agentData'
import { SUI_SENTINEL_APP_URL } from '@/constants'

export const runtime = 'edge'

export const alt = 'Sui Sentinel Agent Challenge'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: { address: string } }) {
  const agent = await getAgentDataForOG(params.address)
  console.log(
    `[OG Image] Fetched Agent Data for ${params.address}:`,
    agent ? agent.agent_name : 'Not Found'
  )

  // --- Font Loading ---
  let interBoldFont: ArrayBuffer | undefined
  try {
    const fontRes = await Promise.race([
      fetch(new URL('https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCZxSLrA.ttf')), // <-- CHANGED URL!
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error('Font fetch timed out')), 5000)
      ), // 5 second timeout
    ])

    if (!fontRes.ok) {
      console.error(`[OG Image] Failed to fetch font: ${fontRes.status} ${fontRes.statusText}`)
      throw new Error('Font fetch failed')
    }
    interBoldFont = await fontRes.arrayBuffer()
    console.log('[OG Image] Font loaded successfully.')
  } catch (error) {
    console.error('[OG Image] Error loading Inter font:', error)
  }

  const shieldLogoUrl = `${SUI_SENTINEL_APP_URL}/icons/shield.svg`
  const fallbackRobotUrl = `${SUI_SENTINEL_APP_URL}/img/robo_to_r.png`

  const agentProfileImageUrl =
    agent?.agent_profile && agent.agent_profile.startsWith('http')
      ? agent.agent_profile
      : fallbackRobotUrl

  console.log(`[OG Image] Shield Logo URL: ${shieldLogoUrl}`)
  console.log(`[OG Image] Fallback Robot URL: ${fallbackRobotUrl}`)
  console.log(`[OG Image] Agent Profile Image URL: ${agentProfileImageUrl}`)

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: interBoldFont ? '"Inter"' : 'sans-serif', // Fallback to sans-serif
          color: 'white',
          background: 'linear-gradient(to bottom right, #1a021d, #000000)',
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.03) 2px, transparent 2px)',
          backgroundSize: '40px 40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            padding: '60px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              width: '55%',
            }}
          >
            {/* Top: Logo and Brand */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={shieldLogoUrl}
                width="60"
                height="60"
                alt="Logo"
              />
              <div style={{ marginLeft: '20px', fontSize: '36px', fontWeight: 700 }}>
                #Sui Sentinel
              </div>
            </div>

            {/* Middle: Dynamic Agent Name */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '48px', color: '#a8a8a8' }}>Engage Target Sentinel:</div>
              <div
                style={{
                  fontSize: '80px',
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #558EB4, #86E6DA)',
                  backgroundClip: 'text',
                  color: 'transparent',
                  lineHeight: 1.1,
                  marginTop: '10px',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  maxHeight: '180px',
                }}
              >
                {agent?.agent_name || 'Unknown Agent'}
              </div>
            </div>

            {/* Bottom: URL */}
            <div style={{ fontSize: '28px', color: '#777' }}>sui-sentinel.com</div>
          </div>

          {/* Right Side: Agent Profile Image */}
          <div
            style={{
              width: '45%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={agentProfileImageUrl}
              alt="Agent Profile"
              style={{
                width: '450px',
                height: '450px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid rgba(134, 230, 218, 0.5)',
                boxShadow: '0 0 40px rgba(85, 142, 180, 0.6)',
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: interBoldFont
        ? [{ name: 'Inter', data: interBoldFont, style: 'normal', weight: 700 }]
        : [],
    }
  )
}
