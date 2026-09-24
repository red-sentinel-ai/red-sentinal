import { useEffect, useRef, useState } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const START_RATIO = 0.85

/** Ticks a number up from ~85% of its target to the target with an ease-out
 *  curve, so stats feel like they're settling rather than starting from zero.
 *  Relies on effect deps to skip re-runs when a refetch returns the same value;
 *  renders the final value immediately for reduced-motion users. */
export function useCountUp(target: number, durationMs = 1200) {
  const [value, setValue] = useState(target * START_RATIO)
  const frame = useRef(0)

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      window.matchMedia(REDUCED_MOTION_QUERY).matches ||
      !Number.isFinite(target)
    ) {
      setValue(target)
      return
    }

    const from = target * START_RATIO
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(from + (target - from) * eased)
      if (t < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [target, durationMs])

  return value
}
