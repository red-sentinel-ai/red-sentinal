/**
 * The EVM TEE returns a 64-byte r+s signature and a separate recovery_id.
 * The Sentinel contract uses OpenZeppelin ECDSA.recover(), which expects
 * a 65-byte signature: r (32) + s (32) + v (1), where v = 27 + recovery_id.
 */
export function buildEvmSignature(signatureHex: string, recoveryId: number): `0x${string}` {
  const withPrefix = signatureHex.startsWith('0x') ? signatureHex : `0x${signatureHex}`
  // Only append v if signature is 64 bytes (r+s only). 65-byte sigs already have v.
  if (withPrefix.length === 130) {
    const v = (27 + recoveryId).toString(16).padStart(2, '0')
    return `${withPrefix}${v}` as `0x${string}`
  }
  return withPrefix as `0x${string}`
}

/**
 * Convert a 32-element byte array (from the TEE response) to a bytes32 hex string.
 */
export function bytesToHex32(bytes: number[]): `0x${string}` {
  return `0x${bytes.map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`
}
