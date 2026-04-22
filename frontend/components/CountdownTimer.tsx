import { cn } from '@/lib/utils'
import React, { useState, useEffect } from 'react'

interface CountdownTimerProps {
  endTime: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endTime,
  size = 'md',
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [isActive, setIsActive] = useState<boolean>(true)

  // Size configurations
  const sizeClasses = {
    sm: {
      container: 'text-xs grow',
      dot: 'w-1 h-1',
      gap: 'ml-2',
      numberSpacing: 'ml-1.5',
      dotSpacing: 'ml-1.5',
    },
    md: {
      container: 'lg:text-sm grow',
      dot: 'w-1.5 h-1.5',
      gap: 'justify-evenly lg:justify-evenly lg:ml-1.5',
      numberSpacing: 'lg:ml-1.5',
      dotSpacing: 'lg:ml-1.5',
    },
    lg: {
      container: 'text-base grow',
      dot: 'w-2 h-2',
      gap: 'justify-evenly lg:justify-evenly lg:ml-1.5',
      numberSpacing: 'lg:ml-1.5',
      dotSpacing: 'lg:ml-1.5',
    },
  }

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now()
      const diff = endTime * 1000 - now

      if (diff <= 0) {
        setIsActive(false)
        return null
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      return { days, hours, minutes, seconds }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)

      if (!newTimeLeft) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  if (!timeLeft || !isActive) {
    return null
  }

  const TimeUnit = ({
    value,
    unit,
    className,
  }: {
    value: number
    unit: string
    className?: string
  }) => (
    <div className={cn(`flex items-center`, className)}>
      <span className="text-right tabular-nums text-[var(--color-bg-surface)]">{value}</span>
      <span className="ml-0.5 text-[var(--color-text-muted)]">{unit}</span>
    </div>
  )

  return (
    <div className={cn(`flex items-center rounded-full bg-black p-1`, className)}>
      <div
        className={`${sizeClasses[size].dot} ${sizeClasses[size].dotSpacing} rounded-full bg-[#00D369]`}
      />
      <div className={`flex ${sizeClasses[size].gap} ${sizeClasses[size].container}`}>
        {timeLeft.days > 0 && (
          <TimeUnit className={sizeClasses[size].numberSpacing} value={timeLeft.days} unit="d" />
        )}
        {(timeLeft.days > 0 || timeLeft.hours > 0) && (
          <TimeUnit className={sizeClasses[size].numberSpacing} value={timeLeft.hours} unit="h" />
        )}
        <TimeUnit className={sizeClasses[size].numberSpacing} value={timeLeft.minutes} unit="m" />
        <TimeUnit className={sizeClasses[size].numberSpacing} value={timeLeft.seconds} unit="s" />
      </div>
    </div>
  )
}

export default CountdownTimer
