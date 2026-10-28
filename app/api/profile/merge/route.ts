import { NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'
import { ADMIN_API_TOKEN } from '@/lib/server/credentials'
import { requireSession } from '@/lib/server/session'

// Merges mergingUserId INTO survivorUserId.
// survivorUserId keeps its username/avatar/display_name.
// All wallets, social connections, and rewards activity from the merging account
// are moved to the survivor. Points are summed. The merging account is deleted.
export async function POST(request: Request) {
  try {
    // Destructive account operation — the request must carry a verifiable
    // credential: a backend session cookie (user id is verified against the
    // two accounts below) or the ops admin token. Body-supplied ids are never
    // sufficient authorization on their own.
    const { denied, userId: sessionUserId } = requireSession(request, {
      adminToken: ADMIN_API_TOKEN,
    })
    if (denied) return denied

    const { survivorUserId, mergingUserId, email } = await request.json()

    if (!survivorUserId || !mergingUserId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (survivorUserId === mergingUserId) {
      return NextResponse.json({ error: 'Cannot merge an account with itself' }, { status: 400 })
    }

    // When authenticated via session cookie, the caller may only act on their
    // own accounts — the session user must be one side of the merge.
    if (sessionUserId && sessionUserId !== survivorUserId && sessionUserId !== mergingUserId) {
      return NextResponse.json({ error: 'Session user is not part of this merge' }, { status: 403 })
    }

    // Verify that the email belongs to the merging account (prevent spoofed merges)
    const { data: emailConn, error: emailCheckErr } = await supabaseServiceClient
      .from('ss_social_connections')
      .select('user_id')
      .eq('platform', 'email')
      .eq('platform_user_id', email)
      .eq('user_id', mergingUserId)
      .single()

    if (emailCheckErr || !emailConn) {
      return NextResponse.json({ error: 'Email does not belong to the merging account' }, { status: 403 })
    }

    // 1. Move wallets — simple UPDATE, no conflict possible since wallet_address is unique
    const { error: walletErr } = await supabaseServiceClient
      .from('ss_wallet_connections')
      .update({ user_id: survivorUserId })
      .eq('user_id', mergingUserId)

    if (walletErr) throw walletErr

    // 2. Move social connections — skip platforms the survivor already has (keep survivor's)
    const { data: survivorSocials } = await supabaseServiceClient
      .from('ss_social_connections')
      .select('platform')
      .eq('user_id', survivorUserId)

    const survivorPlatforms = new Set((survivorSocials ?? []).map(s => s.platform))

    // Delete merging user's connections that would conflict, then move the rest
    if (survivorPlatforms.size > 0) {
      await supabaseServiceClient
        .from('ss_social_connections')
        .delete()
        .eq('user_id', mergingUserId)
        .in('platform', Array.from(survivorPlatforms))
    }

    const { error: socialErr } = await supabaseServiceClient
      .from('ss_social_connections')
      .update({ user_id: survivorUserId })
      .eq('user_id', mergingUserId)

    if (socialErr) throw socialErr

    // 3. Move rewards activity
    const { error: activityErr } = await supabaseServiceClient
      .from('ss_rewards_activity')
      .update({ user_id: survivorUserId })
      .eq('user_id', mergingUserId)

    if (activityErr) throw activityErr

    // 4. Sum points into survivor
    const { data: mergingUser, error: fetchErr } = await supabaseServiceClient
      .from('ss_users')
      .select('total_points, lifetime_points')
      .eq('id', mergingUserId)
      .single()

    if (fetchErr) throw fetchErr

    const { data: survivorUser, error: fetchSurvivorErr } = await supabaseServiceClient
      .from('ss_users')
      .select('total_points, lifetime_points')
      .eq('id', survivorUserId)
      .single()

    if (fetchSurvivorErr) throw fetchSurvivorErr

    const newTotalPoints = (survivorUser.total_points ?? 0) + (mergingUser.total_points ?? 0)
    const newLifetimePoints = (survivorUser.lifetime_points ?? 0) + (mergingUser.lifetime_points ?? 0)

    const { error: pointsErr } = await supabaseServiceClient
      .from('ss_users')
      .update({ total_points: newTotalPoints, lifetime_points: newLifetimePoints })
      .eq('id', survivorUserId)

    if (pointsErr) throw pointsErr

    // 5. Link the verified email to the survivor now (since we moved the merging user's email conn)
    await supabaseServiceClient
      .from('ss_social_connections')
      .upsert(
        {
          user_id: survivorUserId,
          platform: 'email',
          platform_user_id: email,
          platform_username: email,
          platform_avatar_url: null,
        },
        { onConflict: 'user_id,platform' }
      )

    // 6. Delete the merging account
    const { error: deleteErr } = await supabaseServiceClient
      .from('ss_users')
      .delete()
      .eq('id', mergingUserId)

    if (deleteErr) throw deleteErr

    return NextResponse.json({ success: true, email })
  } catch (error) {
    console.error('Error merging profiles:', error)
    return NextResponse.json({ error: 'Failed to merge profiles' }, { status: 500 })
  }
}
