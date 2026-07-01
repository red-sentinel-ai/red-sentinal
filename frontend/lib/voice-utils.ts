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
