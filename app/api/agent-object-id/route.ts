import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'
import type {
  ApiResponse,
  AddAgentObjectIdRequest,
  DeleteAgentObjectIdRequest,
  UpdateArrayRequest,
} from './types'
import { ADMIN_API_TOKEN } from '@/lib/server/credentials'
import { requireSession } from '@/lib/server/session'
import { rateLimit } from '@/lib/server/rate-limit'

const ARRAY_KEY = 'AGENET_OBJECT_IDS'

// Sui object ids are 0x-prefixed hex; reject anything else so the shared KV
// list can't be poisoned with arbitrary strings.
const AGENT_OBJECT_ID_RE = /^0x[0-9a-fA-F]{1,64}$/

// GET stays public (read-only list). Every mutation requires a verified
// session or the ops admin token — these endpoints overwrite shared state.
function guardMutation(request: NextRequest) {
  const rateLimited = rateLimit(request, { name: 'agent-object-id', limit: 30, windowMs: 60_000 })
  if (rateLimited) return rateLimited

  const { denied } = requireSession(request, { adminToken: ADMIN_API_TOKEN })
  if (denied) return denied
  return null
}

// Get the array
export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const agentObjectIds: string[] = (await kv.get(ARRAY_KEY)) || []
    return NextResponse.json({ agentObjectIds })
  } catch (error) {
    console.error('Failed to fetch strings:', error)
    return NextResponse.json({ error: 'Failed to fetch strings' }, { status: 500 })
  }
}

// Update the entire array
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const denied = guardMutation(request)
  if (denied) return denied as NextResponse<ApiResponse>

  try {
    const body: UpdateArrayRequest = await request.json()

    if (
      !Array.isArray(body.agentObjectIds) ||
      !body.agentObjectIds.every(id => typeof id === 'string' && AGENT_OBJECT_ID_RE.test(id))
    ) {
      return NextResponse.json(
        { error: 'Invalid data: agentObjectIds must be an array of Sui object ids' },
        { status: 400 }
      )
    }

    await kv.set(ARRAY_KEY, body.agentObjectIds)
    return NextResponse.json({ success: true, agentObjectIds: body.agentObjectIds })
  } catch (error) {
    console.error('Failed to save strings:', error)
    return NextResponse.json({ error: 'Failed to save strings' }, { status: 500 })
  }
}

// Add a string to the array
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const denied = guardMutation(request)
  if (denied) return denied as NextResponse<ApiResponse>

  try {
    const body: AddAgentObjectIdRequest = await request.json()
    const agentObjectId = body.agentObjectId
    if (!agentObjectId || typeof agentObjectId !== 'string' || !AGENT_OBJECT_ID_RE.test(agentObjectId)) {
      return NextResponse.json(
        { error: 'Invalid data: agentObjectId must be a Sui object id' },
        { status: 400 }
      )
    }

    const currentObjectIds: string[] = (await kv.get(ARRAY_KEY)) || []
    if (currentObjectIds.includes(agentObjectId)) {
      return NextResponse.json({
        success: false,
        agentObjectIds: currentObjectIds,
        message: 'Already exists',
      })
    }

    const newIds = [...currentObjectIds, agentObjectId]
    await kv.set(ARRAY_KEY, newIds)

    return NextResponse.json({ success: true, agentObjectIds: newIds })
  } catch (error) {
    console.error('Failed to add string:', error)
    return NextResponse.json({ error: 'Failed to add string' }, { status: 500 })
  }
}

// Delete a string from the array
export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const denied = guardMutation(request)
  if (denied) return denied as NextResponse<ApiResponse>

  try {
    const body: DeleteAgentObjectIdRequest = await request.json()

    if (!body.agentObjectId || typeof body.agentObjectId !== 'string') {
      return NextResponse.json({ error: 'Invalid data: string is required' }, { status: 400 })
    }

    const currentObjectIds: string[] = (await kv.get(ARRAY_KEY)) || []
    const newIds = currentObjectIds.filter(s => s !== body.agentObjectId)
    await kv.set(ARRAY_KEY, newIds)

    return NextResponse.json({ success: true, agentObjectIds: newIds })
  } catch (error) {
    console.error('Failed to delete string:', error)
    return NextResponse.json({ error: 'Failed to delete string' }, { status: 500 })
  }
}
