import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create client with anon key for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Don't use Supabase auth since we're using Clerk
  }
})

// Database types
export interface User {
  id: string
  clerk_id: string
  email: string
  username: string
  selected_game: string | string[]  // Handle both string and array formats
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

// Helper function to normalize games to array format
function normalizeGamesToArray(games: string | string[] | null | undefined): string[] {
  if (!games) return []
  if (Array.isArray(games)) return games
  if (typeof games === 'string') return games ? [games] : []
  return []
}

// User operations
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
        selected_game: [] // Initialize as empty array
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
    
    // Normalize the selected_game field to array format
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
    
    // Normalize the response
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
    // First get current games
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

// Game profile operations
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

// Team operations
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
    // First get the user's internal ID from their Clerk ID
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
      .eq('user_id', user.id) // Use the internal UUID, not the Clerk ID
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
    
    // First get the user's internal ID from their Clerk ID
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
      .eq('user_id', user.id) // Use the internal UUID, not the Clerk ID
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

// Helper function to check if user has teams
export async function getUserTeamCount(clerkId: string) {
  try {
    // First get the user's internal ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()
    
    if (!user) return 0
    
    // Count their team memberships
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

// Team creation and management
export async function createTeam(teamData: {
  name: string
  description: string
  game: string
  region: string
  rank_requirement?: string
  max_members: number
  practice_schedule?: string
  game_specific_data?: Record<string, string>
  owner_clerk_id: string
}) {
  try {
    // First get the user's internal ID
    const user = await getUserByClerkId(teamData.owner_clerk_id)
    if (!user) throw new Error('User not found')

    // Create the team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([{
        name: teamData.name,
        description: teamData.description,
        game: teamData.game,
        region: teamData.region,
        rank_requirement: teamData.rank_requirement,
        max_members: teamData.max_members,
        current_members: 1, // Owner counts as first member
        practice_schedule: teamData.practice_schedule,
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

    // Add owner as team member
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
      // Try to clean up the team if membership creation fails
      await supabase.from('teams').delete().eq('id', team.id)
      throw membershipError
    }

    return team
  } catch (error) {
    console.error('Error in createTeam:', error)
    throw error
  }
}

// Team invitations
export async function createTeamInvitation(invitationData: {
  team_id: string
  inviter_clerk_id: string
  invited_email?: string
  invited_username?: string
  role?: string
}) {
  try {
    // Get inviter's internal ID
    const inviter = await getUserByClerkId(invitationData.inviter_clerk_id)
    if (!inviter) throw new Error('Inviter not found')

    // Check if invitation already exists
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

    // Create invitation
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
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
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

// Get user's teams (as owner)
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

// Check if user can create team for game (optional: limit teams per game)
export async function canUserCreateTeamForGame(clerkId: string, game: string) {
  try {
    const user = await getUserByClerkId(clerkId)
    if (!user) return false

    // Check existing teams for this game (limit to 3 teams per game)
    const { count, error } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .eq('game', game)

    if (error) {
      console.error('Error checking team count:', error)
      return true // Allow creation if check fails
    }

    return (count || 0) < 3 // Max 3 teams per game
  } catch (error) {
    console.error('Error in canUserCreateTeamForGame:', error)
    return true
  }
}