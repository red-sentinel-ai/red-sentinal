/**
 * The realtime speech protocol carries audio as base64 strings, while the
 * microphone worklet produces raw PCM16 buffers. This is the one place that
 * conversion happens.
 */

/** Chunked so a long buffer can't blow the argument limit of `String.fromCharCode`. */
const ENCODE_CHUNK_SIZE = 0x8000

export function encodePcmToBase64(pcmBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(pcmBuffer)
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += ENCODE_CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + ENCODE_CHUNK_SIZE))
  }
  return btoa(binary)
}
