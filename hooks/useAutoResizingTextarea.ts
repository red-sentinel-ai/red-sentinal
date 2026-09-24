import { useCallback, useEffect, useRef } from 'react'

const MAX_HEIGHT_PX = 300
const MAX_HEIGHT_VIEWPORT_SHARE = 0.4

export function useAutoResizingTextarea(value: string) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const fitHeightToContent = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const maxHeight = Math.min(window.innerHeight * MAX_HEIGHT_VIEWPORT_SHARE, MAX_HEIGHT_PX)
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  }, [])

  useEffect(() => {
    fitHeightToContent()
  }, [value, fitHeightToContent])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    let lastMeasuredWidth = textarea.clientWidth
    const widthObserver = new ResizeObserver(() => {
      if (textarea.clientWidth === lastMeasuredWidth) return
      lastMeasuredWidth = textarea.clientWidth
      fitHeightToContent()
    })

    widthObserver.observe(textarea)
    return () => widthObserver.disconnect()
  }, [fitHeightToContent])

  return textareaRef
}
