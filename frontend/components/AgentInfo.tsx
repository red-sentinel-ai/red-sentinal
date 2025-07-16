import { MIST_PER_SUI } from '@/constants'
import { formatBalance } from '@/lib/utils'
import clsx from 'clsx'

export type AgentInfoProps = {
  balance: string
  decimal: number
  promptPrice: string
  symbol: string
  breakAttempts: number
  isDrained: boolean
  drainAmount: string
  className?: string
}

export const AgentInfo = ({
  balance,
  decimal,
  promptPrice,
  symbol,
  isDrained,
  drainAmount,
  className,
}: AgentInfoProps) => {
  const prizePool = (Number(balance) / MIST_PER_SUI).toFixed(4)
  const messagePrice = (Number(promptPrice) / MIST_PER_SUI).toFixed(4)
  const drainAmountFormatted = formatBalance(BigInt(drainAmount), decimal)

  return (
    <div
      className={clsx(
        className,
        'bg-[#2E40494D] rounded-md p-2 border border-[#2E40494D] text-[#B5B5B5]'
      )}
    >
      <div className="flex justify-between items-center text-md gap-4">
        <div className="text-center">
          <p className="text-[12px] text-gray-400">Total Bounty</p>
          <p className="font-semibold text-white">
            {isDrained ? drainAmountFormatted : prizePool} {symbol}
          </p>
        </div>
        <div className="h-6 w-[1px] bg-[#6F6F6F]"></div>
        <div className="text-center">
          <p className="text-[12px] text-gray-400">Attack Fee</p>
          <p className="font-semibold text-white">
            {messagePrice} {symbol}
          </p>
        </div>
      </div>
    </div>
  )
}
