import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
})

export interface User {
  id: string
  clerk_id: string
  email: string
  username: string
  selected_game: string | string[]
  team_id?: string
  created_at: string
  updated_at: string
}

export interface UserGameProfile {
  id: string
  user_id: string
  game_id: string
  rank?: string
  hours_played?: number
  main_role?: string
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  game: string
  description?: string
  owner_id: string
  max_members: number
  current_members: number
  rank_requirement?: string
  region: string
  logo_url?: string
  practice_schedule?: string
  game_specific_data?: Record<string, string>
  created_at: string
  updated_at: string
}

export interface TeamMembership {
  id: string
  team_id: string
  user_id: string
  role: 'owner' | 'captain' | 'member'
  joined_at: string
}

export interface TeamJoinRequest {
  id: string
  team_id: string
  user_id: string
  message?: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  updated_at: string
}

function normalizeGamesToArray(games: string | string[] | null | undefined): string[] {
  if (!games) return []
  if (Array.isArray(games)) return games
  if (typeof games === 'string') return games ? [games] : []
  return []
}

export async function createUser(userData: {
  clerk_id: string
  email: string
  username: string
}) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        ...userData, 
        selected_game: []
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase create user error:', error)
      throw error
    }
    return data
  } catch (error) {
    console.error('Error in createUser:', error)
    throw error
  }
}

export async function getUserByClerkId(clerkId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Supabase get user error:', error)
      throw error
    }
    
    if (data) {
      data.selected_game = normalizeGamesToArray(data.selected_game)
    }
    
    return data
  } catch (error) {
    console.error('Error in getUserByClerkId:', error)
    throw error
  }
}

export async function updateUserGames(clerkId: string, games: string[]) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        selected_game: games, 
        updated_at: new Date().toISOString() 
      })
      .eq('clerk_id', clerkId)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase update user games error:', error)
      throw error
    }
    
    if (data) {
      data.selected_game = normalizeGamesToArray(data.selected_game)
    }
    
    return data
  } catch (error) {
    console.error('Error in updateUserGames:', error)
    throw error
  }
}

export async function addUserGame(clerkId: string, gameId: string) {
  try {
    const user = await getUserByClerkId(clerkId)
    if (!user) throw new Error('User not found')
    
    const currentGames = normalizeGamesToArray(user.selected_game)
    if (!currentGames.includes(gameId)) {
      const updatedGames = [...currentGames, gameId]
      return updateUserGames(clerkId, updatedGames)
    }
    return user
  } catch (error) {
    console.error('Error in addUserGame:', error)
    throw error
  }
}

export async function removeUserGame(clerkId: string, gameId: string) {
  try {
    const user = await getUserByClerkId(clerkId)
    if (!user) throw new Error('User not found')
    
    const currentGames = normalizeGamesToArray(user.selected_game)
    const updatedGames = currentGames.filter(game => game !== gameId)
    return updateUserGames(clerkId, updatedGames)
  } catch (error) {
    console.error('Error in removeUserGame:', error)
    throw error
  }
}

export async function createUserGameProfile(profileData: {
  user_id: string
  game_id: string
  rank?: string
  hours_played?: number
  main_role?: string
}) {
  const { data, error } = await supabase
    .from('user_game_profiles')
    .insert([profileData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getUserGameProfiles(userId: string) {
  const { data, error } = await supabase
    .from('user_game_profiles')
    .select('*')
    .eq('user_id', userId)
  
  if (error) throw error
  return data
}

export async function getTeamsForGame(game: string) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('game', game)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getUserTeamsForGame(clerkId: string, game: string) {
  try {
    const user = await getUserByClerkId(clerkId)
    if (!user) {
      console.log('User not found for clerk ID:', clerkId)
      return []
    }

    const { data, error } = await supabase
      .from('team_memberships')
      .select(`
        *,
        teams!inner(*)
      `)
      .eq('user_id', user.id)
      .eq('teams.game', game)
    
    if (error) {
      console.error('Error fetching user teams for game:', error)
      throw error
    }
    return data
  } catch (error) {
    console.error('Error in getUserTeamsForGame:', error)
    return []
  }
}

export async function getUserTeamsForAllGames(clerkId: string, games: string[]) {
  try {
    if (!games || games.length === 0) return []
    
    const user = await getUserByClerkId(clerkId)
    if (!user) {
      console.log('User not found for clerk ID:', clerkId)
      return []
    }
    
    const { data, error } = await supabase
      .from('team_memberships')
      .select(`
        *,
        teams!inner(*)
      `)
      .eq('user_id', user.id)
      .in('teams.game', games)
    
    if (error) {
      console.error('Error fetching user teams for all games:', error)
      throw error
    }
    return data
  } catch (error) {
    console.error('Error in getUserTeamsForAllGames:', error)
    return []
  }
}

export async function getUserTeamCount(clerkId: string) {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()
    
    if (!user) return 0
    
    const { count, error } = await supabase
      .from('team_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    if (error) return 0
    return count || 0
  } catch (error) {
    return 0
  }
}

export async function uploadTeamLogo(file: File, teamId: string): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${teamId}-${Date.now()}.${fileExt}`
    const filePath = `team-logos/${fileName}`

    const { data, error } = await supabase.storage
      .from('team-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      throw error
    }

    const { data: { publicUrl } } = supabase.storage
      .from('team-assets')
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Error uploading team logo:', error)
    throw error
  }
}

export async function deleteTeamLogo(logoUrl: string): Promise<void> {
  try {
    const urlParts = logoUrl.split('/team-assets/')
    if (urlParts.length < 2) return

    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from('team-assets')
      .remove([`team-logos/${filePath.split('/').pop()}`])

    if (error) {
      console.error('Storage delete error:', error)
      throw error
    }
  } catch (error) {
    console.error('Error deleting team logo:', error)
  }
}

export async function createTeam(teamData: {
  name: string
  description: string
  game: string
  region: string
  rank_requirement?: string
  max_members: number
  practice_schedule?: string
  game_specific_data?: Record<string, string>
  logo_url?: string
  owner_clerk_id: string
}) {
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
        game_specific_data: teamData.game_specific_data,
        logo_url: teamData.logo_url,
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

export async function updateTeamLogo(teamId: string, logoUrl: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('teams')
      .update({ 
        logo_url: logoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId)

    if (error) {
      console.error('Error updating team logo:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in updateTeamLogo:', error)
    throw error
  }
}

export async function createTeamInvitation(invitationData: {
  team_id: string
  inviter_clerk_id: string
  invited_email?: string
  invited_username?: string
  role?: string
}) {
  try {
    const inviter = await getUserByClerkId(invitationData.inviter_clerk_id)
    if (!inviter) throw new Error('Inviter not found')

    const { data: existingInvite } = await supabase
      .from('team_invitations')
      .select('id')
      .eq('team_id', invitationData.team_id)
      .eq('invited_email', invitationData.invited_email || '')
      .eq('status', 'pending')
      .single()

    if (existingInvite) {
      throw new Error('Invitation already exists for this email')
    }

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

export async function getUserOwnedTeams(clerkId: string) {
  try {
    const user = await getUserByClerkId(clerkId)
    if (!user) return []

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching owned teams:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserOwnedTeams:', error)
    return []
  }
}

export async function canUserCreateTeamForGame(clerkId: string, game: string) {
  try {
    const user = await getUserByClerkId(clerkId)
    if (!user) return false

    const { count, error } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .eq('game', game)

    if (error) {
      console.error('Error checking team count:', error)
      return true
    }

    return (count || 0) < 3
  } catch (error) {
    console.error('Error in canUserCreateTeamForGame:', error)
    return true
  }
}

export async function searchTeamsForGame(game: string, filters?: {
  search?: string
  region?: string
  rankRequirement?: string
}) {
  try {
    let query = supabase
      .from('teams')
      .select(`
        *,
        team_memberships(count)
      `)
      .eq('game', game)
    
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters?.region) {
      query = query.eq('region', filters.region)
    }

    if (filters?.rankRequirement) {
      query = query.eq('rank_requirement', filters.rankRequirement)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching teams:', error)
      throw error
    }

    const availableTeams = (data || []).filter(team => team.current_members < team.max_members)

    return availableTeams
  } catch (error) {
    console.error('Error in searchTeamsForGame:', error)
    throw error
  }
}

export async function isUserTeamMember(clerkId: string, teamId: string): Promise<boolean> {
  try {
    const user = await getUserByClerkId(clerkId)
    if (!user) return false

    const { data, error } = await supabase
      .from('team_memberships')
      .select('id')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking team membership:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error in isUserTeamMember:', error)
    return false
  }
}

export async function hasUserPendingRequest(clerkId: string, teamId: string): Promise<boolean> {
  try {
    const user = await getUserByClerkId(clerkId)
    if (!user) return false

    const { data, error } = await supabase
      .from('team_join_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .eq('status', 'pending')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking pending request:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error in hasUserPendingRequest:', error)
    return false
  }
}

export async function requestToJoinTeam(teamId: string, clerkId: string, message?: string) {
  try {
    const user = await getUserByClerkId(clerkId)
    if (!user) throw new Error('User not found')

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, current_members, max_members, name')
      .eq('id', teamId)
      .single()

    if (teamError) {
      console.error('Error fetching team:', teamError)
      throw new Error('Team not found')
    }

    if (team.current_members >= team.max_members) {
      throw new Error('Team is full')
    }

    const isMember = await isUserTeamMember(clerkId, teamId)
    if (isMember) {
      throw new Error('You are already a member of this team')
    }

    const hasPendingRequest = await hasUserPendingRequest(clerkId, teamId)
    if (hasPendingRequest) {
      throw new Error('You already have a pending request for this team')
    }

    const { data: request, error } = await supabase
      .from('team_join_requests')
      .insert([{
        team_id: teamId,
        user_id: user.id,
        message: message || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating join request:', error)
      throw new Error('Failed to send join request')
    }

    return request
  } catch (error) {
    console.error('Error in requestToJoinTeam:', error)
    throw error
  }
}

export async function getTeamJoinRequests(teamId: string, clerkId: string) {
  try {
    const user = await getUserByClerkId(clerkId)
    if (!user) throw new Error('User not found')

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('owner_id')
      .eq('id', teamId)
      .single()

    if (teamError || team.owner_id !== user.id) {
      throw new Error('You are not authorized to view join requests for this team')
    }

    const { data, error } = await supabase
      .from('team_join_requests')
      .select(`
        *,
        users!inner(id, username, email, clerk_id)
      `)
      .eq('team_id', teamId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching join requests:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getTeamJoinRequests:', error)
    throw error
  }
}

export async function respondToJoinRequest(requestId: string, clerkId: string, action: 'accept' | 'decline') {
  try {
    const user = await getUserByClerkId(clerkId)
    if (!user) throw new Error('User not found')

    const { data: request, error: requestError } = await supabase
      .from('team_join_requests')
      .select(`
        *,
        teams!inner(id, owner_id, current_members, max_members)
      `)
      .eq('id', requestId)
      .eq('status', 'pending')
      .single()

    if (requestError) {
      console.error('Error fetching join request:', requestError)
      throw new Error('Join request not found')
    }

    if (request.teams.owner_id !== user.id) {
      throw new Error('You are not authorized to respond to this request')
    }

    if (action === 'accept') {
      if (request.teams.current_members >= request.teams.max_members) {
        throw new Error('Team is now full')
      }

      const { error: membershipError } = await supabase
        .from('team_memberships')
        .insert([{
          team_id: request.team_id,
          user_id: request.user_id,
          role: 'member',
          joined_at: new Date().toISOString()
        }])

      if (membershipError) {
        console.error('Error adding team member:', membershipError)
        throw new Error('Failed to add member to team')
      }

      const { error: teamUpdateError } = await supabase
        .from('teams')
        .update({ 
          current_members: request.teams.current_members + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.team_id)

      if (teamUpdateError) {
        console.error('Error updating team member count:', teamUpdateError)
      }
    }

    const { error: statusError } = await supabase
      .from('team_join_requests')
      .update({ 
        status: action === 'accept' ? 'accepted' : 'declined',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (statusError) {
      console.error('Error updating request status:', statusError)
      throw new Error('Failed to update request status')
    }

    return { success: true, action }
  } catch (error) {
    console.error('Error in respondToJoinRequest:', error)
    throw error
  }
}