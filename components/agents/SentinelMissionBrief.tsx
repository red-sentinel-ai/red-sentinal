/** Static attacker-facing briefing shown beside every challenge: what the two
 *  Sentinel types are, how a Campaign breach is judged, and where a failed
 *  Attack Fee goes. Purely presentational — render it anywhere in the attack UI. */
export function SentinelMissionBrief() {
  return (
    <div className="space-y-2">
      <div className="industrial-header text-[11px] font-semibold tracking-[0.06em] text-[var(--color-text-muted)]">
        MISSION_BRIEF
      </div>
      <div className="border-hairline space-y-3 bg-[var(--color-bg-base)] p-4">
        <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
          Every Sentinel has a public attack mission and a Bounty Pool. Pay the Attack Fee, then
          try to break it. A verified Breach releases the Bounty Pool under the campaign rules.
        </p>
        <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
          <span className="font-semibold text-white">Security Sentinels</span> test real agent
          boundaries against the stated objective.{' '}
          <span className="font-semibold text-white">Campaign Sentinels</span> are sponsored,
          brand-safe challenges that use only approved public partner context — a Breach requires
          the exact Hidden Transmission (the Challenge Phrase) to appear in the Sentinel&apos;s
          response. Campaign Sentinels never expose private data, production credentials, or live
          tool actions.
        </p>
        <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
          If your attack fails, the fee splits three ways: 50% increases the Bounty Pool, 40% goes
          to the defender or its Syndicate, and 10% supports the Red Sentinel protocol.
        </p>
      </div>
    </div>
  )
}
