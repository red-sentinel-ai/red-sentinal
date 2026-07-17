export const NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}`

export function isNativeToken(tokenAddress: string | undefined): boolean {
  return tokenAddress?.toLowerCase() === NATIVE_TOKEN_ADDRESS
}

