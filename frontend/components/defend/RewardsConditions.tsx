import Image from 'next/image'
import Link from 'next/link'
import { Clock, Shield, Zap } from 'lucide-react'
import { SUI_SENTINEL_DEFENDER_REWARDS_DOCS_URL } from '@/constants'

export const RewardsConditions = () => {
  return (
    <div className="w-full rounded-xl border border-[#D8D8D8] bg-white px-10 py-5">
      <h3 className="mb-3 text-xl font-medium">Reward Conditions</h3>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-1">
          <Clock size={20} fill="black" stroke="white" />
          <span>Sentinel uptime</span>
        </div>

        <div className="flex items-center gap-1">
          <Shield size={20} fill="black" />
          <span>Successful Defenses</span>
        </div>

        <div className="flex items-center gap-1">
          <Image src="/icons/three_circles.png" width={20} height={20} alt="three circles icon" />
          <span>No Defeats</span>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-1">
        <span>
          <Zap size={20} fill="#f632f3" stroke="#f632f3" />
        </span>

        <p>
          Defeat pauses rewards.{' '}
          <Link
            href={SUI_SENTINEL_DEFENDER_REWARDS_DOCS_URL}
            className="text-[#5E5E5E] hover:underline"
            target="_blank"
          >
            Learn More
          </Link>
        </p>
      </div>
    </div>
  )
}
