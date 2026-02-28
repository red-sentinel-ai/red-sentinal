import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateTimeLeft = (endTime: number) => {
  const now = Date.now()
  const diff = endTime * 1000 - now

  if (diff <= 0) {
    return 'Inactive'
  }

  const diffInMs = Number(diff)
  const hours = Math.floor(diffInMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

export const stringToBigInt = (value: string, decimals: number = 0) => {
  if (!value) return BigInt(0)

  if (value.includes('.')) {
    const [integerPart, decimalPart] = value.split('.')
    const paddedDecimals = decimalPart.padEnd(decimals, '0').slice(0, decimals)
    return BigInt(integerPart + paddedDecimals)
  }

  if (decimals === 0) {
    return BigInt(value)
  }

  const multiplier = BigInt(10) ** BigInt(decimals)
  return BigInt(value) * multiplier
}

export const bigIntToString = (
  value: bigint,
  decimals: number,
  precision: number = 2,
  ceil: boolean = false
) => {
  const divisor = BigInt(10) ** BigInt(decimals)
  let quotient = value / divisor
  let remainder = value % divisor

  if (ceil && remainder > BigInt(0)) {
    const precisionDivisor = BigInt(10) ** BigInt(decimals - precision)
    const remainderMod = remainder % precisionDivisor
    if (remainderMod > BigInt(0)) {
      remainder += precisionDivisor - remainderMod
    }
    if (remainder == divisor) {
      quotient += BigInt(1)
      remainder = BigInt(0)
    }
  }

  const paddedRemainder = remainder.toString().padStart(decimals, '0')
  if (precision === 0) {
    return quotient.toString()
  }
  const remainderStr = paddedRemainder.slice(0, precision).padEnd(precision, '0')
  return `${quotient}.${remainderStr}`
}

export const formatBalance = (
  balance: bigint,
  decimals: number,
  precision: number = 0,
  ceil: boolean = false
) => {
  if (balance === BigInt(0)) {
    return '0'
  }

  const decimalsDivisor = BigInt(10) ** BigInt(decimals)
  const precisionDivisor = BigInt(10) ** BigInt(precision)

  if (balance < decimalsDivisor / precisionDivisor) {
    if (precision === 0) {
      return '1'
    }
    return '0.' + '0'.repeat(precision - 1) + '1'
  }

  return bigIntToString(balance, decimals, precision, ceil)
}

export const truncateAddress = (addr: string) => {
  return addr.slice(0, 6) + '...' + addr.slice(-6)
}

export const removeHexPrefix = (hex: string) => {
  return hex.replace(/^0x/i, '')
}

export const addHexPrefix = (hex: string) => {
  return `0x${removeHexPrefix(hex)}`
}

export const utf8Length = (str: string) => {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(str)
  return bytes.length
}

export const encodeToHex = (str: string) => {
  let result = ''
  const encoder = new TextEncoder()
  const bytes = encoder.encode(str)
  for (let i = 0; i < bytes.length; i++) {
    result += bytes[i].toString(16).padStart(2, '0')
  }
  return addHexPrefix(result)
}

export const splitByteArray = (bytes: Uint8Array, chunkSize: number = 31) => {
  const chunks: Uint8Array[] = []
  for (let i = 0; i < bytes.length; i += chunkSize) {
    chunks.push(bytes.slice(i, i + chunkSize))
  }
  return chunks
}

export const encodeChunk = (chunk: Uint8Array) => {
  let result = ''
  for (let i = 0; i < chunk.length; i++) {
    result += chunk[i].toString(16).padStart(2, '0')
  }
  if (result === '') {
    return '0x0'
  }
  return addHexPrefix(result)
}

export const hexToVector = (hex: string): number[] => {
  const bytes: number[] = []
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16))
  }
  return bytes
}

export function formatDuration(ms: number) {
  if (ms < 0) ms = 0

  const totalSeconds = Math.floor(ms / 1000)

  const days = Math.floor(totalSeconds / (24 * 3600))
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds }
}
const simpleHash = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

export const generateGradientAvatar = (seed: string): string => {
  const palettes = [
    ['#2E3192', '#1BFFFF'],
    ['#FF4E50', '#F9D423'],
    ['#009245', '#FCEE21'],
    ['#6A3093', '#A044FF', '#E863AE'],
    ['#4776E6', '#8E54E9'],
    ['#1D9BF0', '#7C4DFF', '#FC5185'],
    ['#1D976C', '#93F9B9'],
  ]

  const hash = simpleHash(seed)
  const colorPair = palettes[hash % palettes.length]

  const gradId = `grad-${hash}`

  const stops = colorPair
    .map((color, index) => {
      const offset = (index / (colorPair.length - 1)) * 100
      return `<stop offset="${offset}%" stop-color="${color}" />`
    })
    .join('')

  const cx = (hash % 50) + 25
  const cy = (hash % 50) + 25
  const r = (hash % 25) + 75
  const fx = (hash % 80) + 10
  const fy = (hash % 80) + 10

  const svg = `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="${gradId}" cx="${cx}%" cy="${cy}%" r="${r}%" fx="${fx}%" fy="${fy}%">
          ${stops}
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#${gradId})" />
    </svg>
  `

  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

export const buildAgentShareTweetUrl = (agentName: string, pageUrl: string, xUsername: string): string => {
  const text = `I'm challenging ${agentName} on @${xUsername}! 🛡️\n\nThink you can break this AI agent and win the prize pool?\n\nTry it here: ${pageUrl}`
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=SuiSentinel,Web3,Sui`
}
