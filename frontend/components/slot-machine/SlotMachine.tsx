import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { SlotReel } from './SlotReel'
import { useClaimReward } from '@/hooks/rewards/useClaimReward'

interface SlotMachineProps {
  onWin?: (amount: number) => void
  onError?: (error: string) => void
}

export const SlotMachine = ({ onWin, onError }: SlotMachineProps) => {
  const account = useCurrentAccount()
  const [isSpinning, setIsSpinning] = useState(false)
  const [hasWon, setHasWon] = useState(false)
  const [result, setResult] = useState<number[]>([4, 5, 4])

  const { mutateAsync: claimTokens, isPending } = useClaimReward()

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

  const stopSpinSound = () => {
    if (spinAudioRef.current) {
      spinAudioRef.current.pause()
      spinAudioRef.current.currentTime = 0
    }
  }

  const handleSpin = async () => {
    if (isSpinning || isPending || hasWon) return

    clickAudioRef.current?.play().catch(e => console.error('Audio play failed', e))

    if (!account?.address) {
      toast.error('Please connect your wallet first')
      return
    }

    spinAudioRef.current?.play().catch(e => console.error('Audio play failed', e))

    setIsSpinning(true)

    try {
      const data = await claimTokens({ recipient: account.address })

      if (data.transferSuccess && data.rewardAmount) {
        const digits = String(data.rewardAmount).padStart(3, '0').slice(-3).split('').map(Number)

        setResult(digits)
        setIsSpinning(false)
        stopSpinSound()
        setHasWon(true)

        setTimeout(() => {
          if (onWin) {
            onWin(data.rewardAmount)
          }
        }, 1500)
      } else {
        toast.error('Spin failed. No rewards available or transfer failed.')
        setIsSpinning(false)
        stopSpinSound()
      }
    } catch (error) {
      console.error('Spin failed', error)
      setIsSpinning(false)
      stopSpinSound()

      const errorMessage = error?.message || 'Failed to spin'

      if (errorMessage.includes('No unclaimed rewards')) {
        if (onError) {
          onError(errorMessage)
        }
      } else {
        toast.error(errorMessage)
      }
    }
  }

  return (
    <div className="relative mx-auto mt-4 w-fit">
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
          disabled={isSpinning || isPending || hasWon}
          className="group transition-transform duration-100 active:translate-y-[14px] disabled:cursor-not-allowed disabled:opacity-80"
        >
          <Image
            src="/img/slot-button.png"
            width={150}
            height={51}
            alt="Spin!"
            className={`${!(isSpinning || isPending || hasWon) ? 'group-hover:brightness-110' : ''} transition-all`}
          />
          {/* {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-[14px]">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )} */}
        </button>
      </div>
    </div>
  )
}
