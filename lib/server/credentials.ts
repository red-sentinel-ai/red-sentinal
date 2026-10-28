import 'server-only'

// Server-only credentials. This module exists so secrets never sit in
// `@/constants`, which is imported by ~40 client components — one
// NEXT_PUBLIC_ rename away from shipping a service key in the client bundle.
// The `server-only` import makes any accidental client import a build error.

export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
export const BACKEND_API_ADMIN_TOKEN = process.env.BACKEND_API_ADMIN_TOKEN || ''
export const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN || ''
