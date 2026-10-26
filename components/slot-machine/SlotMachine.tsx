import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { toast } from '@/lib/toast'
import { SlotReel } from './SlotReel'
import { useSpinPass } from '@/hooks/rewards/useBoosters'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { useActiveChain } from '@/context/ActiveChainContext'
import type { Booster, SpinResponse } from '@/types'

interface SlotMachineProps {
  booster: Booster | null
  onWin?: (spinResponse: SpinResponse) => void
  onError?: (error: string) => void
  shareToTwitter?: boolean
}

export const SlotMachine = ({
  booster,
  onWin,
  onError,
  shareToTwitter = false,
}: SlotMachineProps) => {
  const { address: connectedAddress } = useConnectedAddress()
  const [isSpinning, setIsSpinning] = useState(false)
  const [hasWon, setHasWon] = useState(false)
  const [result, setResult] = useState<number[]>([4, 5, 4])
  const [showTooltip, setShowTooltip] = useState(false)

  const { mutateAsync: spinPass, isPending } = useSpinPass()
  const { activeChain } = useActiveChain()

  const spinAudioRef = useRef<HTMLAudioElement | null>(null)
  const clickAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    spinAudioRef.current = new Audio('/sounds/slot-machine.mp3')
    spinAudioRef.current.loop = true

    clickAudioRef.current = new Audio('/sounds/click.mp4')

    return () => {
      stopSpinSound()
    }
  }, [])

  // Reset hasWon state when booster changes
  useEffect(() => {
    setHasWon(false)
  }, [booster])

  const stopSpinSound = () => {
    if (spinAudioRef.current) {
      spinAudioRef.current.pause()
      spinAudioRef.current.currentTime = 0
    }
  }

  const handleSpin = async () => {
    if (isSpinning || isPending || hasWon) return

    clickAudioRef.current?.play().catch(e => console.error('Audio play failed', e))

    if (!connectedAddress) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!booster) {
      toast.error('Please select a booster first')
      return
    }

    spinAudioRef.current?.play().catch(e => console.error('Audio play failed', e))

    setIsSpinning(true)

    try {
      const data = await spinPass({
        walletAddress: connectedAddress,
        passId: booster._id,
        shareToTwitter,
        chain: activeChain,
      })

      if (data.success && data.spin.baseAmount) {
        const digits = String(data.spin.baseAmount)
          .padStart(3, '0')
          .slice(-3)
          .split('')
          .map(Number)

        setResult(digits)
        setIsSpinning(false)
        stopSpinSound()
        setHasWon(true)

        setTimeout(() => {
          if (onWin) {
            onWin(data)
          }
        }, 1500)
      } else {
        toast.error('Spin failed. Please try again.')
        setIsSpinning(false)
        stopSpinSound()
      }
    } catch (error: any) {
      console.error('Spin failed', error)
      setIsSpinning(false)
      stopSpinSound()

      const errorMessage = error?.message || 'Failed to spin'

      if (onError) {
        onError(errorMessage)
      } else {
        toast.error(errorMessage)
      }
    }
  }

  return (
    <div className="relative mx-auto w-fit">
      {/* Tooltip positioned above everything */}
      {showTooltip && !booster && (
        <div className="absolute left-1/2 -top-8 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--color-bg-base)] px-4 py-2 text-sm text-white shadow-lg">
          Select Spin Pass to spin
          <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[var(--color-bg-base)]"></div>
        </div>
      )}

      <div className="mt-12 scale-125 sm:scale-150 md:scale-[1.75]">
        <div className="relative z-0">
          <Image
            src="/img/slot-machine.png"
            width={290}
            height={381}
            alt="slot machine"
            className="pointer-events-none"
          />
        </div>

        <div className="absolute left-[48px] top-[72px] z-10 flex gap-1 overflow-hidden rounded-[20px]">
          <SlotReel value={result[0]} isSpinning={isSpinning} delay={0} />
          <SlotReel value={result[1]} isSpinning={isSpinning} delay={0.2} />
          <SlotReel value={result[2]} isSpinning={isSpinning} delay={0.4} />
        </div>

        <div className="absolute bottom-[90px] left-[31px] z-20 h-[51px] w-[150px] overflow-hidden">
          <button
            onClick={handleSpin}
            onMouseEnter={() => !booster && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            disabled={isSpinning || isPending || hasWon || !booster}
            className="group transition-transform duration-100 active:translate-y-[14px] disabled:cursor-not-allowed disabled:opacity-80"
          >
            <Image
              src="/img/slot-button.png"
              width={150}
              height={51}
              alt="Spin!"
              className={`${!(isSpinning || isPending || hasWon) ? 'group-hover:brightness-110' : ''} transition-all`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
