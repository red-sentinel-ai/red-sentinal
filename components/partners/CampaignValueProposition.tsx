import { BarChart3, Fuel, Handshake, ReceiptText, ShieldCheck, Ticket, Trophy } from 'lucide-react'

/** Static value-proposition section for the public partner path. Presents the
 *  Campaign Sentinel offer: brand-safe challenge, free eligible attacks,
 *  wallet-paid transaction costs, partner-funded Bounty Pool with a separate
 *  Campaign Service Fee, and Campaign Console reporting — plus the safety
 *  boundary around the Challenge Phrase. Deliberately omits paid-attack
 *  economics; Campaign Service Fee amounts are agreed during the assisted
 *  launch, not advertised here. */
const OFFER_POINTS = [
  {
    icon: Handshake,
    title: 'A brand-safe community challenge',
    body: 'We build a hosted Sentinel around what makes your project interesting — its docs, ecosystem, and lore — using only partner-approved public material.',
  },
  {
    icon: Ticket,
    title: 'Free for your community',
    body: 'Eligible participants attack the campaign without paying an Attack Fee. More attackers, more learning, more engagement with your project.',
  },
  {
    icon: Fuel,
    title: 'No gas worries for your community',
    body: 'Eligible participants never pay an Attack Fee, and can claim network and storage credits for their connected wallet on their profile — their wallet covers the on-chain costs.',
  },
  {
    icon: Trophy,
    title: 'You fund the full Bounty Pool',
    body: 'The entire published bounty is yours to seed. Your community sees the full prize — nothing is quietly held back or deducted.',
  },
  {
    icon: ReceiptText,
    title: 'A separate Campaign Service Fee',
    body: 'A Campaign Service Fee, separate from the Bounty Pool, covers setup, hosting, analytics, and support. It is agreed with our team before launch and never taken out of the bounty.',
  },
  {
    icon: BarChart3,
    title: 'Campaign Console reporting',
    body: 'After launch, authorized Partner Members get Campaign Console access with live campaign analytics and share-intent reporting.',
  },
]

export function CampaignValueProposition() {
  return (
    <section>
      <div className="mb-5 md:mb-8">
        <h2 className="font-display text-xl font-extrabold uppercase tracking-[0.04em] text-white sm:text-2xl">
          What you get
        </h2>
        <p className="font-body mt-2 text-xs font-medium leading-relaxed text-[var(--color-text-secondary)] sm:text-sm">
          A Campaign Sentinel is a brand-safe community challenge: your community attacks it for a
          bounty you seed, and learns your project along the way.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OFFER_POINTS.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="flex flex-col border border-[var(--color-border-default)] bg-[var(--color-bg-base)] p-6"
          >
            <span className="border-[var(--color-gold-primary)]/40 flex size-11 items-center justify-center border bg-[var(--color-gold-muted)] text-[var(--color-gold-primary)]">
              <Icon className="size-5" />
            </span>
            <h3 className="font-display mt-4 text-sm font-bold uppercase tracking-[0.04em] text-white md:text-base">
              {title}
            </h3>
            <p className="font-body mt-2 text-xs font-normal leading-[1.7] tracking-[0.01em] text-[var(--color-text-secondary)]">
              {body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-4 border border-[var(--color-border-default)] bg-[var(--color-bg-base)] p-6">
        <span className="border-[var(--color-info)]/40 bg-[var(--color-info)]/10 flex size-11 shrink-0 items-center justify-center border text-[var(--color-info)]">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-[0.04em] text-white md:text-base">
            Safe by design
          </h3>
          <p className="font-body mt-2 text-xs font-normal leading-[1.7] tracking-[0.01em] text-[var(--color-text-secondary)]">
            The breach objective is a Challenge Phrase: a harmless, binary pass/fail condition.
            Campaign Sentinels answer with approved public material only — they never expose private
            data, production credentials, or live tool actions. A successful attack releases a
            phrase that is safe to share, nothing more.
          </p>
        </div>
      </div>
    </section>
  )
}
