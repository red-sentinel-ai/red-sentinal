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
  breakAttempts,
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
        'bg-[#12121266] backdrop-blur-xl rounded-lg lg:rounded-2xl p-4 border border-[#2E40494D] text-[#B5B5B5]' // Updated background, border, and text color
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex-1 text-center">
          <p className="text-[10px] md:text-xs text-gray-400">Prize pool</p>
          <h4 className="text-xl md:text-2xl font-bold text-[#B8B8B8]">
            {isDrained ? drainAmountFormatted : prizePool} {symbol}
          </h4>
        </div>
        <div className="h-12 w-[1px] bg-[#6F6F6F] mx-4"></div>{' '}
        <div className="flex-1 text-center">
          <p className="text-[10px] md:text-xs text-gray-400">Message price</p>
          <h4 className="text-xl md:text-2xl font-bold text-[#B8B8B8]">
            {messagePrice} {symbol}
          </h4>
        </div>
        <div className="h-12 w-[1px] bg-[#6F6F6F] mx-4"></div>{' '}
        <div className="flex-1 text-center">
          <p className="text-[10px] md:text-xs text-gray-400">Break attempts</p>
          <h4 className="text-xl md:text-2xl font-bold text-[#B8B8B8]">{breakAttempts}</h4>
        </div>
      </div>
    </div>
  )
}
