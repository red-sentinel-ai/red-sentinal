import { SyndicateMetricCard } from './SyndicateMetricCard'

interface Props {
  isContractLoading: boolean
  isMemberLoading: boolean
  formattedTVL: string | null
  formattedIdle: string | null
  formattedPendingFees: string | null
}

export function SyndicateMetricsGrid({
  isContractLoading,
  isMemberLoading,
  formattedTVL,
  formattedIdle,
  formattedPendingFees,
}: Props) {
  return (
    <section className="mb-20 grid grid-cols-1 divide-y divide-[var(--color-border-strong)] border border-[var(--color-border-strong)] md:grid-cols-3 md:divide-x md:divide-y-0">
      <SyndicateMetricCard
        label="Total Managed Assets"
        value={isContractLoading ? null : `$${formattedTVL ?? '0.00'}`}
        subtitle="+0.0% (24H)"
        subtitleClass="text-[var(--color-text-primary)]"
      />
      <SyndicateMetricCard
        label="Idle Principal"
        value={isContractLoading ? null : `$${formattedIdle ?? '0.00'}`}
        subtitle="Not yet in sentinel"
      />
      <SyndicateMetricCard
        label="Pending User Fees"
        value={isMemberLoading ? null : `$${formattedPendingFees ?? '0.00'}`}
        subtitle="Unclaimed yield"
      />
    </section>
  )
}
