// SHA-256 hash using Web Crypto API (works in browser and Node.js)
export async function sha256(input: string): Promise<Uint8Array> {
  const encoded = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded.buffer as ArrayBuffer)
  return new Uint8Array(hashBuffer)
}
