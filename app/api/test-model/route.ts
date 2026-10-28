import { NextResponse } from 'next/server'
import { lookup } from 'dns/promises'

import { SUI_SENTINEL_API_URL } from '@/constants'
import { BACKEND_API_ADMIN_TOKEN } from '@/lib/server/credentials'
import { rateLimit } from '@/lib/server/rate-limit'

const MAX_TEST_PROMPT_LENGTH = 2_000

// Reject IPv4 addresses in private/loopback/link-local/CGNAT/metadata space
// and their IPv6 equivalents — the backend fetches the caller-supplied URL
// with its admin credentials, so this route is a request-forgery primitive
// unless the target is pinned to a public host.
function isPrivateAddress(address: string): boolean {
  const v4 = address.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])]
    if (a === 10 || a === 127 || a === 0) return true
    if (a === 169 && b === 254) return true // link-local, includes cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 100 && b >= 64 && b <= 127) return true // CGNAT
    if (a >= 224) return true // multicast + reserved
    return false
  }

  const lower = address.toLowerCase()
  if (lower === '::1' || lower === '::' || lower === 'unspecified') return true
  if (lower.startsWith('fe80:')) return true // link-local
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true // unique-local
  if (lower.startsWith('::ffff:')) {
    // IPv4-mapped — check the embedded v4 address
    return isPrivateAddress(lower.slice(7))
  }
  return false
}

// Resolve the hostname and verify every address is public.
async function assertPublicHttpsUrl(rawUrl: string): Promise<string | null> {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return 'api_base_url is not a valid URL'
  }

  if (parsed.protocol !== 'https:') {
    return 'api_base_url must use https'
  }
  if (parsed.username || parsed.password) {
    return 'api_base_url must not contain credentials'
  }

  try {
    const addresses = await lookup(parsed.hostname, { all: true, verbatim: true })
    if (addresses.length === 0) return 'api_base_url hostname does not resolve'
    for (const { address } of addresses) {
      if (isPrivateAddress(address)) {
        return 'api_base_url must point to a public address'
      }
    }
  } catch {
    return 'api_base_url hostname does not resolve'
  }

  return null
}

export async function POST(req: Request) {
  const denied = rateLimit(req, { name: 'test-model', limit: 10, windowMs: 60_000 })
  if (denied) return denied

  try {
    const body = await req.json()
    const { model_provider, api_base_url, api_key, model_name, test_prompt } = body

    if (!api_base_url || !api_key || !model_name) {
      return NextResponse.json(
        { error: 'api_base_url, api_key, and model_name are required' },
        { status: 400 }
      )
    }

    if (typeof test_prompt === 'string' && test_prompt.length > MAX_TEST_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: `test_prompt must be at most ${MAX_TEST_PROMPT_LENGTH} characters` },
        { status: 400 }
      )
    }

    const urlError = await assertPublicHttpsUrl(api_base_url)
    if (urlError) {
      return NextResponse.json({ error: urlError }, { status: 400 })
    }

    const response = await fetch(`${SUI_SENTINEL_API_URL}/sentinels/test-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BACKEND_API_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({
        model_provider: model_provider || 'custom',
        api_base_url,
        api_key,
        model_name,
        test_prompt: test_prompt || 'Say OK if you can hear me',
      }),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error testing model:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
