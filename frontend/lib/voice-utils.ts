const MICROPHONE_ERROR_CODES = new Set([3001, 3002, 3014])
const MICROPHONE_ERROR_NAMES = new Set([
  'NotAllowedError',
  'DeviceNotAvailable',
  'SelectedDeviceMissing',
])

export function isMicrophoneError(error: unknown): boolean {
  const name = (error as { name?: string })?.name
  const code = (error as { code?: number })?.code
  return (
    (typeof code === 'number' && MICROPHONE_ERROR_CODES.has(code)) ||
    (typeof name === 'string' && MICROPHONE_ERROR_NAMES.has(name))
  )
}

/** Turn a 100ms audio/device error into a message a user can act on. */
export function describeVoiceError(error: unknown): string {
  const name = (error as { name?: string })?.name
  const code = (error as { code?: number })?.code

  if (code === 3002 || name === 'DeviceNotAvailable') {
    return 'No microphone found. Connect a mic (and close other apps using it), then try again.'
  }
  if (name === 'NotAllowedError' || code === 3001) {
    return 'Microphone access is blocked. Allow it in your browser settings, then try again.'
  }
  if (code === 3014 || name === 'SelectedDeviceMissing') {
    return 'Your microphone was disconnected. Reconnect it (or plug in another) to keep talking.'
  }
  return error instanceof Error ? error.message : 'Failed to join the voice room'
}
