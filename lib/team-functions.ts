import { getUserByClerkId, supabase } from '@/lib/supabase'

export const createTeam = async (teamData: {
  name: string
  description: string
  game: string
  region: string
  rank_requirement?: string
  max_members: number
  practice_schedule?: string
  logo_url?: string
  game_specific_data?: Record<string, string>
  owner_clerk_id: string
}) => {
  try {
    const user = await getUserByClerkId(teamData.owner_clerk_id)
    if (!user) throw new Error('User not found')

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([{
        name: teamData.name,
        description: teamData.description,
        game: teamData.game,
        region: teamData.region,
        rank_requirement: teamData.rank_requirement,
        max_members: teamData.max_members,
        current_members: 1,
        practice_schedule: teamData.practice_schedule,
        logo_url: teamData.logo_url,
        game_specific_data: teamData.game_specific_data,
        owner_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (teamError) {
      console.error('Error creating team:', teamError)
      throw teamError
    }

    const { error: membershipError } = await supabase
      .from('team_memberships')
      .insert([{
        team_id: team.id,
        user_id: user.id,
        role: 'owner',
        joined_at: new Date().toISOString()
      }])

    if (membershipError) {
      console.error('Error creating team membership:', membershipError)
      await supabase.from('teams').delete().eq('id', team.id)
      throw membershipError
    }

    return team
  } catch (error) {
    console.error('Error in createTeam:', error)
    throw error
  }
}

export const createTeamInvitation = async (invitationData: {
  team_id: string
  inviter_clerk_id: string
  invited_email?: string
  invited_username?: string
  role?: string
}) => {
  try {
    const inviter = await getUserByClerkId(invitationData.inviter_clerk_id)
    if (!inviter) throw new Error('Inviter not found')

    const { data: invitation, error } = await supabase
      .from('team_invitations')
      .insert([{
        team_id: invitationData.team_id,
        inviter_id: inviter.id,
        invited_email: invitationData.invited_email,
        invited_username: invitationData.invited_username,
        role: invitationData.role || 'member',
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating team invitation:', error)
      throw error
    }

    return invitation
  } catch (error) {
    console.error('Error in createTeamInvitation:', error)
    throw error
  }
}