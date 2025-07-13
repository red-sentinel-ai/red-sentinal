import { ImageResponse } from 'next/og'
import type { LeaderboardEntry } from '@/types/ravenRewards'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const baseUrl = `${url.protocol}//${url.host}`

    const response = await fetch(`${baseUrl}/api/rewards/leaderboard?limit=8&offset=0`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const leaderboard: LeaderboardEntry[] = data.leaderboard || []

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            background:
              'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0f0f23 100%)',
            padding: '30px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
              display: 'flex',
            }}
          />

          {/* Grid Pattern Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                linear-gradient(rgba(139, 92, 246, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              display: 'flex',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '80px',
              left: '60px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'rgba(139, 92, 246, 0.4)',
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '120px',
              right: '80px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'rgba(168, 85, 247, 0.3)',
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              left: '100px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: 'rgba(139, 92, 246, 0.3)',
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '120px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: 'rgba(168, 85, 247, 0.4)',
              display: 'flex',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '25px',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-10px',
                left: '-20px',
                right: '-20px',
                bottom: '-10px',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '20px',
                filter: 'blur(20px)',
                display: 'flex',
              }}
            />

            <h1
              style={{
                fontSize: '56px',
                fontWeight: '800',
                color: '#ffffff',
                margin: '0',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                position: 'relative',
              }}
            >
              🏆 RP Points Leaderboard
            </h1>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              maxWidth: '1100px',
              gap: '12px',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-15px',
                left: '-15px',
                right: '-15px',
                bottom: '-15px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '24px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                filter: 'blur(1px)',
                display: 'flex',
              }}
            />

            {leaderboard && leaderboard.length > 0 ? (
              leaderboard.slice(0, 8).map((entry: LeaderboardEntry, i: number) => {
                let bgGradient =
                  'linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))'
                let borderColor = 'rgba(255, 255, 255, 0.15)'
                let rankColor = '#ffffff'
                let rankText = `#${i + 1}`
                let fontSize = '28px'
                let height = '55px'
                let padding = '15px 20px'

                // Top 3 get special treatment
                if (i === 0) {
                  bgGradient =
                    'linear-gradient(90deg, rgba(251, 191, 36, 0.25), rgba(251, 191, 36, 0.08))'
                  borderColor = 'rgba(251, 191, 36, 0.4)'
                  rankColor = '#fbbf24'
                  rankText = '🥇'
                  fontSize = '32px'
                  height = '65px'
                  padding = '18px 25px'
                } else if (i === 1) {
                  bgGradient =
                    'linear-gradient(90deg, rgba(156, 163, 175, 0.25), rgba(156, 163, 175, 0.08))'
                  borderColor = 'rgba(156, 163, 175, 0.4)'
                  rankColor = '#9ca3af'
                  rankText = '🥈'
                  fontSize = '30px'
                  height = '60px'
                  padding = '16px 22px'
                } else if (i === 2) {
                  bgGradient =
                    'linear-gradient(90deg, rgba(194, 120, 3, 0.25), rgba(194, 120, 3, 0.08))'
                  borderColor = 'rgba(194, 120, 3, 0.4)'
                  rankColor = '#c2780b'
                  rankText = '🥉'
                  fontSize = '30px'
                  height = '60px'
                  padding = '16px 22px'
                }

                return (
                  <div
                    key={entry.user_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: bgGradient,
                      border: `1px solid ${borderColor}`,
                      borderRadius: '12px',
                      padding: padding,
                      height: height,
                      position: 'relative',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: i < 3 ? '36px' : '32px',
                        fontWeight: 'bold',
                        color: rankColor,
                        minWidth: '60px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {rankText}
                    </div>

                    {/* Username */}
                    <div
                      style={{
                        fontSize: fontSize,
                        fontWeight: '600',
                        color: '#ffffff',
                        flex: 1,
                        marginLeft: '25px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {entry.username || `${(entry.user_id ?? '').slice(0, 10)}...`}
                    </div>

                    {/* Points */}
                    <div
                      style={{
                        fontSize: fontSize,
                        fontWeight: 'bold',
                        color: '#10b981',
                        textAlign: 'right',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {entry.total_points?.toLocaleString()} RP
                    </div>
                  </div>
                )
              })
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  height: '200px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                No leaderboard data available
              </div>
            )}
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              fontSize: '14px',
              color: 'rgba(139, 92, 246, 0.8)',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            ravenhouse.xyz • Updated every minute
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0f0f23 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <h1
            style={{
              fontSize: '56px',
              fontWeight: '800',
              color: '#ffffff',
              margin: '0',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🏆 RP Points Leaderboard
          </h1>
          <p
            style={{
              fontSize: '28px',
              color: '#cbd5e1',
              margin: '20px 0 0 0',
              textAlign: 'center',
            }}
          >
            Loading leaderboard data...
          </p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }
}
