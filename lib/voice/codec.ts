/**
 * Pure helpers for the realtime voice WebSocket protocol:
 * base64 <-> PCM conversion and transcript extraction.
 */

export function trimTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

export function extractResponseTranscript(response: unknown): string {
  const output = (response as { output?: unknown })?.output
  if (!Array.isArray(output)) return ''

  const parts: string[] = []
  for (const item of output) {
    for (const part of (item?.content as Array<unknown>) ?? []) {
      const text = (part as { transcript?: string; text?: string }).transcript ?? (part as { text?: string }).text
      if (typeof text === 'string' && text.trim()) parts.push(text.trim())
    }
  }
  return parts.join(' ').trim()
}

export function base64FromArrayBuffer(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)) as number[]
    )
  }
  return btoa(binary)
}

export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const len = binary.length
  const out = new Uint8Array(len)
  for (let i = 0; i < len; i++) out[i] = binary.charCodeAt(i)
  return out
}
