import { Coins, Zap } from 'lucide-react'
import clsx from 'clsx'
import { MIST_PER_SUI } from '@/constants'
import { formatBalance } from '@/lib/utils'

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
  const prizePool = (Number(balance) / MIST_PER_SUI).toFixed(2)
  const messagePrice = (Number(promptPrice) / MIST_PER_SUI).toFixed(2)
  const drainAmountFormatted = formatBalance(BigInt(drainAmount), decimal)

  return (
    <div
      className={clsx(
        className,
        'bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-600/50 shadow-lg whitespace-nowrap'
      )}
    >
      <div className="flex justify-between items-center gap-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-gradient-to-r from-[#558EB4] to-[#1388D5] rounded-full flex items-center justify-center shadow-md">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-300 mb-1">Total Bounty</p>
            <p className="text-lg font-bold text-white">
              {isDrained ? drainAmountFormatted : prizePool}{' '}
              <span className="text-sm font-medium">{symbol}</span>
            </p>
          </div>
        </div>

        <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-500 to-transparent"></div>

        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-gradient-to-r from-text to-primary_pink rounded-full flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-300 mb-1">Attack Fee</p>
            <p className="text-lg font-bold text-white flex items-center gap-1">
              <span>{messagePrice}</span>
              <span className="text-sm font-medium">{symbol}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
