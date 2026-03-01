import { useState, useEffect } from 'react'

// ── BRAND COLORS ─────────────────────────────────────────────────────────────
const BRAND = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#EAEAEA',
  pink: '#F445AB',
  pulse: '#A06BFF',
  blue: '#A5DBFD',
  mint: '#9AFFC0',
}

// ── DUMMY DATA — replace with your API calls ──────────────────────────────────
// accent: one of the brand color keys — gives each stat its own identity
const STATS = [
  {
    id: 'tvl',
    label: 'Value Secured',
    value: 248500,
    prefix: '$',
    format: 'compact',
    accent: 'mint',
  },
  {
    id: 'bounties',
    label: 'Bounties Claimed',
    value: 91400,
    prefix: '$',
    format: 'compact',
    accent: 'pink',
  },
  {
    id: 'breached',
    label: 'Sentinels Breached',
    value: 34,
    prefix: '',
    format: 'integer',
    accent: 'pulse',
  },
  {
    id: 'active',
    label: 'Active Sentinels',
    value: 127,
    prefix: '',
    format: 'integer',
    accent: 'blue',
  },
  {
    id: 'token',
    label: '$SENTINEL Distributed',
    value: 4200000,
    prefix: '',
    format: 'compact',
    accent: 'pulse',
  },
  {
    id: 'attacks',
    label: 'Attacks Launched',
    value: 18932,
    prefix: '',
    format: 'compact',
    accent: 'pink',
  },
  {
    id: 'largest',
    label: 'Largest Breach',
    value: 12400,
    prefix: '$',
    format: 'compact',
    accent: 'mint',
  },
]
// ─────────────────────────────────────────────────────────────────────────────

function formatValue(value, format, prefix) {
  let display = ''
  if (format === 'compact') {
    if (value >= 1_000_000) display = (value / 1_000_000).toFixed(1) + 'M'
    else if (value >= 1_000) display = (value / 1_000).toFixed(1) + 'K'
    else display = value.toLocaleString()
  } else {
    display = value.toLocaleString()
  }
  return `${prefix}${display}`
}

function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = null
    const raf = timestamp => {
      if (!start) start = timestamp
      const p = Math.min((timestamp - start) / duration, 1)
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [target, duration])
  return count
}

function StatItem({ stat, index, total }) {
  const animated = useCountUp(stat.value, 1500 + index * 100)
  const display = formatValue(animated, stat.format, stat.prefix)

  return (
    <div
      className="stat-item"
      style={{
        animationDelay: `${index * 70}ms`,
        borderRight: index < total - 1 ? '1px solid rgba(234,234,234,0.07)' : 'none',
      }}
    >
      <span className="stat-value">{display}</span>
      <span className="stat-label">{stat.label}</span>
      {/* accent underline sliver */}
      <span className="stat-underline" />
    </div>
  )
}

export default function SentinelStatsBar() {
  return (
    <>
      <style>{`
        :root {
          --brand-black: #000000;
          --brand-white: #FFFFFF;
          --brand-gray:  #EAEAEA;
          --brand-pink:  #F445AB;
          --brand-pulse: #A06BFF;
          --brand-blue:  #A5DBFD;
          --brand-mint:  #9AFFC0;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }

        @keyframes livePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(244,69,171,0.6); }
          50%       { box-shadow: 0 0 0 5px rgba(244,69,171,0);  }
        }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        /* ── Bar shell ─────────────────────────────────────── */
        .ssb-shell {
          position: relative;
          width: 100%;
          background: #000;
          border-bottom: 1px solid rgba(234,234,234,0.1);
          overflow: hidden;
          font-family: 'IBM Plex Mono', monospace;
        }

        /* top accent stripe — pink→pulse→blue→mint */
        .ssb-shell::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            var(--brand-pink) 0%,
            var(--brand-pulse) 33%,
            var(--brand-blue)  66%,
            var(--brand-mint)  100%
          );
          background-size: 200% auto;
          animation: shimmer 4s linear infinite;
        }

        .ssb-inner {
          display: flex;
          align-items: center;
          padding: 0 24px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .ssb-inner::-webkit-scrollbar { display: none; }

        /* ── Live badge ───────────────────────────────────── */
        .live-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 20px 0 4px;
          border-right: 1px solid rgba(234,234,234,0.07);
          flex-shrink: 0;
          margin-right: 4px;
        }

        .live-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--brand-pink);
          animation: livePulse 2s ease infinite;
          flex-shrink: 0;
        }

        .live-text {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.6rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--brand-pink);
        }

        /* ── Stat items ───────────────────────────────────── */
        .stat-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 13px 22px;
          flex-shrink: 0;
          cursor: default;
          animation: fadeUp 0.45s ease both;
          transition: background 0.2s;
        }

        .stat-item:hover {
          background: rgba(234,234,234,0.03);
        }

        .stat-item:hover .stat-underline {
          transform: scaleX(1);
          opacity: 1;
        }

        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1rem, 1.8vw, 1.35rem);
          font-weight: 800;
          letter-spacing: -0.01em;
          color: var(--accent);
          line-height: 1;
          white-space: nowrap;
          /* subtle glow matching accent */
          text-shadow:
            0 0 20px color-mix(in srgb, var(--accent) 40%, transparent),
            0 0 40px color-mix(in srgb, var(--accent) 15%, transparent);
        }

        .stat-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: clamp(0.52rem, 0.85vw, 0.63rem);
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(234,234,234,0.35);
          white-space: nowrap;
        }

        /* bottom accent underline that slides in on hover */
        .stat-underline {
          position: absolute;
          bottom: 0; left: 20%; right: 20%;
          height: 1.5px;
          background: var(--accent);
          border-radius: 2px;
          transform: scaleX(0);
          opacity: 0;
          transition: transform 0.25s ease, opacity 0.25s ease;
          transform-origin: center;
        }

        @media (max-width: 768px) {
          .ssb-inner { justify-content: flex-start; }
          .stat-item  { padding: 12px 16px; }
        }
      `}</style>

      <div className="ssb-shell">
        <div className="ssb-inner">
          <div className="live-badge">
            <div className="live-dot" />
            <span className="live-text">Live</span>
          </div>

          {STATS.map((stat, i) => (
            <StatItem key={stat.id} stat={stat} index={i} total={STATS.length} />
          ))}
        </div>
      </div>
    </>
  )
}
