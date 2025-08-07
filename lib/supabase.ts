import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
})

// Service role client for server-side operations that bypass RLS
// Falls back to regular client if service key is not available
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase

export interface User {
  id: string
  clerk_id: string
  email: string
  username: string
  selected_game: string | string[]
  team_id?: string
  
  // Enhanced profile fields
  bio?: string
  location?: string
  avatar_url?: string
  discord_username?: string
  date_of_birth?: string
  timezone?: string
  competitive_level?: string
  looking_for_team?: boolean
  
  // Riot Games integration
  riot_username?: string
  riot_tagline?: string
  riot_account_verified?: boolean
  riot_puuid?: string
  riot_region?: string
  
  // Metadata
  created_at: string
  updated_at: string
}

// Create user from Clerk data with automatic avatar import
export async function createUserFromClerk(clerkUser: {
  id: string
  emailAddresses: Array<{ emailAddress: string }>
  username?: string
  firstName?: string
  lastName?: string
  imageUrl?: string
}): Promise<User> {
  try {
    console.log('🆕 Creating user from Clerk data:', clerkUser.id)
    
    const email = clerkUser.emailAddresses[0]?.emailAddress
    if (!email) {
      throw new Error('No email found in Clerk user data')
    }
    
    // Generate username from Clerk data
    const username = clerkUser.username || 
                    (clerkUser.firstName && clerkUser.lastName 
                      ? `${clerkUser.firstName}_${clerkUser.lastName}` 
                      : email.split('@')[0])
    
    const userData = {
      clerk_id: clerkUser.id,
      email,
      username,
      selected_game: ['league-of-legends'], // Default game as array
      avatar_url: clerkUser.imageUrl || null,
      looking_for_team: true, // Default to looking for team
      competitive_level: 'casual' // Default level
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error creating user:', error)
      throw error
    }
    
    console.log('✅ Created user:', data.username)
    return data
  } catch (error) {
    console.error('❌ Error in createUserFromClerk:', error)
    throw error
  }
}

// Enhanced function to update user profile with comprehensive data
export async function updateUserProfile(clerkId: string, updates: Partial<User>): Promise<User> {
  try {
    console.log('🔄 Updating user profile for:', clerkId)
    console.log('📝 Updates:', updates)
    
    // Remove fields that shouldn't be updated directly
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, clerk_id, created_at, ...safeUpdates } = updates
    
    const { data, error } = await supabase
      .from('users')
      .update({
        ...safeUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_id', clerkId)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error updating user profile:', error)
      throw error
    }
    
    // Normalize selected_game array
    if (data) {
      data.selected_game = normalizeGamesToArray(data.selected_game)
    }
    
    console.log('✅ Updated user profile:', data.username)
    return data
  } catch (error) {
    console.error('❌ Error in updateUserProfile:', error)
    throw error
  }
}

// Store or update user game statistics
export async function upsertUserGameStatistics(
  userId: string, 
  gameId: string, 
  stats: Partial<Omit<UserGameStatistics, 'id' | 'user_id' | 'game_id' | 'created_at' | 'last_updated'>>
): Promise<UserGameStatistics> {
  try {
    console.log('📊 Upserting game statistics for user:', userId, 'game:', gameId)
    
    // Ensure current_rank is always present as it's required
    const safeStats = {
      current_rank: 'Unranked',
      ...stats
    }
    
    const statisticsData = {
      user_id: userId,
      game_id: gameId,
      ...safeStats
    }
    
    const { data, error } = await supabaseAdmin
      .from('user_game_statistics')
      .upsert(statisticsData, {
        onConflict: 'user_id,game_id'
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Database error: ${error.message}`)
    }
    
    console.log('✅ Upserted game statistics successfully')
    return data
  } catch (error) {
    console.error('❌ Error in upsertUserGameStatistics:', error)
    throw error
  }
}

// Get user game statistics
export async function getUserGameStatistics(userId: string, gameId: string): Promise<UserGameStatistics | null> {
  try {
    const { data, error } = await supabase
      .from('user_game_statistics')
      .select('*')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null // No statistics found
      }
      throw error
    }
    
    return data
  } catch (error) {
    console.error('❌ Error getting user game statistics:', error)
    throw error
  }
}

// Store match history
export async function addUserMatchHistory(
  userId: string,
  gameId: string,
  matchData: Omit<UserMatchHistory, 'id' | 'user_id' | 'game_id' | 'created_at'>
): Promise<UserMatchHistory> {
  try {
    console.log('🎮 Adding match history for user:', userId)
    
    const historyData = {
      user_id: userId,
      game_id: gameId,
      ...matchData
    }
    
    const { data, error } = await supabase
      .from('user_match_history')
      .insert(historyData)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error adding match history:', error)
      throw error
    }
    
    console.log('✅ Added match history')
    return data
  } catch (error) {
    console.error('❌ Error in addUserMatchHistory:', error)
    throw error
  }
}

// Get recent match history
export async function getUserMatchHistory(
  userId: string, 
  gameId: string, 
  limit: number = 10
): Promise<UserMatchHistory[]> {
  try {
    const { data, error } = await supabase
      .from('user_match_history')
      .select('*')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .order('match_date', { ascending: false })
      .limit(limit)
    
    if (error) {
      throw error
    }
    
    return data || []
  } catch (error) {
    console.error('❌ Error getting user match history:', error)
    throw error
  }
}

export interface UserGameStatistics {
  id: string
  user_id: string
  game_id: string
  
  // Profile Information
  profile_icon_url?: string
  summoner_level?: number
  account_level?: number
  
  // Rank Information
  current_rank: string
  rank_points?: string // LP for LoL, RR for Valorant
  rank_icon_url?: string
  flex_rank?: string
  
  // Performance Statistics
  main_role?: string
  main_agent?: string
  win_rate?: number
  games_played?: number
  wins?: number
  losses?: number
  total_matches?: number
  average_kda?: number
  
  // Match History
  last_played?: string
  recent_form?: string // e.g., "WWLWW"
  
  // Additional Data
  additional_stats?: Record<string, string | number | boolean | null>
  
  // Metadata
  last_updated: string
  created_at: string
}

export interface UserMatchHistory {
  id: string
  user_id: string
  game_id: string
  match_id: string
  
  // Match Details
  match_date: string
  queue_type: string
  game_duration: number
  
  // Player Performance
  champion_played?: string
  role_played?: string
  kills: number
  deaths: number
  assists: number
  win: boolean
  
  // Additional Data
  match_data?: Record<string, string | number | boolean | null>
  
  created_at: string
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

// Enhanced function to get user by Clerk ID with better error handling
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  try {
    console.log('🔍 Getting user by Clerk ID:', clerkId)
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('🔄 User not found, will need to create one')
        return null
      }
      console.error('❌ Error fetching user:', error)
      throw error
    }
    
    if (data) {
      data.selected_game = normalizeGamesToArray(data.selected_game)
      console.log('✅ Found user:', data?.username)
    }
    
    return data
  } catch (error) {
    console.error('❌ Error in getUserByClerkId:', error)
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
    console.error('Error in getUserTeamCount:', error)
    return 0
  }
}

export async function uploadUserAvatar(file: File, clerkId: string): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${clerkId}-${Date.now()}.${fileExt}`
    const filePath = `user-avatars/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('user-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-assets')
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Error uploading user avatar:', error)
    throw error
  }
}

export async function deleteUserAvatar(avatarUrl: string): Promise<void> {
  try {
    const urlParts = avatarUrl.split('/user-assets/')
    if (urlParts.length < 2) return

    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from('user-assets')
      .remove([filePath])

    if (error) {
      console.error('Storage delete error:', error)
      throw error
    }
  } catch (error) {
    console.error('Error deleting user avatar:', error)
    // Ignore error for now as deletion is not critical
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
        users!inner(id, username, email, clerk_id, avatar_url, competitive_level, riot_account_verified),
        teams!inner(id, name)
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

// Get team members
export async function getTeamMembers(teamId: string) {
  try {
    const { data, error } = await supabase
      .from('team_memberships')
      .select(`
        *,
        users!inner(id, username, avatar_url, competitive_level, riot_account_verified)
      `)
      .eq('team_id', teamId)
      .order('joined_at', { ascending: true })

    if (error) {
      console.error('Error fetching team members:', error)
      throw error
    }

    return data?.map(membership => ({
      id: membership.users.id,
      username: membership.users.username,
      avatar_url: membership.users.avatar_url,
      role: membership.role,
      joined_at: membership.joined_at,
      competitive_level: membership.users.competitive_level,
      riot_account_verified: membership.users.riot_account_verified
    })) || []
  } catch (error) {
    console.error('Error in getTeamMembers:', error)
    throw error
  }
}

// Accept join request
export async function acceptJoinRequest(requestId: string) {
  try {
    const { data: request, error: requestError } = await supabaseAdmin
      .from('team_join_requests')
      .select(`
        *,
        teams!inner(id, current_members, max_members)
      `)
      .eq('id', requestId)
      .eq('status', 'pending')
      .single()

    if (requestError) {
      console.error('Error fetching join request:', requestError)
      throw new Error('Join request not found')
    }

    if (request.teams.current_members >= request.teams.max_members) {
      throw new Error('Team is now full')
    }

    // Add member to team
    const { error: membershipError } = await supabaseAdmin
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

    // Update team member count
    const { error: teamUpdateError } = await supabaseAdmin
      .from('teams')
      .update({ 
        current_members: request.teams.current_members + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', request.team_id)

    if (teamUpdateError) {
      console.error('Error updating team member count:', teamUpdateError)
    }

    // Update request status
    const { error: statusError } = await supabaseAdmin
      .from('team_join_requests')
      .update({ 
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (statusError) {
      console.error('Error updating request status:', statusError)
      throw new Error('Failed to update request status')
    }

    return { success: true }
  } catch (error) {
    console.error('Error in acceptJoinRequest:', error)
    throw error
  }
}

// Reject join request
export async function rejectJoinRequest(requestId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('team_join_requests')
      .update({ 
        status: 'declined',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (error) {
      console.error('Error rejecting join request:', error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Error in rejectJoinRequest:', error)
    throw error
  }
}

// Remove team member
export async function removeTeamMember(teamId: string, memberId: string) {
  try {
    // Remove membership
    const { error: membershipError } = await supabaseAdmin
      .from('team_memberships')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', memberId)

    if (membershipError) {
      console.error('Error removing team member:', membershipError)
      throw membershipError
    }

    // Update team member count
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .select('current_members')
      .eq('id', teamId)
      .single()

    if (!teamError && team) {
      await supabaseAdmin
        .from('teams')
        .update({ 
          current_members: Math.max(0, team.current_members - 1),
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId)
    }

    return { success: true }
  } catch (error) {
    console.error('Error in removeTeamMember:', error)
    throw error
  }
}

// Update team
export async function updateTeam(teamId: string, updates: {
  name?: string
  description?: string
  rank_requirement?: string
  practice_schedule?: string
}) {
  try {
    const { error } = await supabaseAdmin
      .from('teams')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId)

    if (error) {
      console.error('Error updating team:', error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Error in updateTeam:', error)
    throw error
  }
}

// Delete team
export async function deleteTeam(teamId: string) {
  try {
    // Delete all memberships first
    await supabaseAdmin
      .from('team_memberships')
      .delete()
      .eq('team_id', teamId)

    // Delete all join requests
    await supabaseAdmin
      .from('team_join_requests')
      .delete()
      .eq('team_id', teamId)

    // Delete the team
    const { error } = await supabaseAdmin
      .from('teams')
      .delete()
      .eq('id', teamId)

    if (error) {
      console.error('Error deleting team:', error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteTeam:', error)
    throw error
  }
}

// ========================================
// AI TEAM MATCHING FUNCTIONS
// ========================================

interface TeamVector {
  team_id: string
  skill_level: number
  region_weight: number
  activity_score: number
  playstyle_aggression: number
  playstyle_teamwork: number
  availability_hours: string
}

interface TeamWithVector extends Team {
  skill_level: number
  activity_score: number
  playstyle_aggression: number
}

interface CompatibilityFactors {
  skillMatch: number
  regionMatch: number
  activityMatch: number
  playstyleMatch: number
  skillGap: 'easier' | 'equal' | 'harder'
}

export interface AITeamRecommendation {
  team: Team
  score: number
  reason: string
  challengeType: 'scrim' | 'practice' | 'challenge' | 'coaching'
  skillGap: 'easier' | 'equal' | 'harder'
  compatibilityFactors: {
    skillMatch: number
    regionMatch: number
    activityMatch: number
    playstyleMatch: number
  }
}

// Get AI team recommendations for a user
export async function getAITeamRecommendations(
  clerkId: string, 
  game: string, 
  limit: number = 5
): Promise<AITeamRecommendation[]> {
  try {
    const user = await getUserByClerkId(clerkId)
    if (!user) throw new Error('User not found')

    // Get user's teams for this game
    const userTeams = await getUserTeamsForGame(clerkId, game)
    if (userTeams.length === 0) {
      // If user has no teams, recommend popular active teams
      return await getPopularTeamsForGame(game, limit)
    }

    const userTeam = userTeams[0].teams // Use first team as reference

    // Get team vector for user's team
    const { data: userVector } = await supabase
      .from('team_vectors')
      .select('*')
      .eq('team_id', userTeam.id)
      .single()

    if (!userVector) {
      return await getPopularTeamsForGame(game, limit)
    }

    // Find teams with similar characteristics
    const { data: candidateTeams, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_vectors!inner(skill_level, activity_score, playstyle_aggression)
      `)
      .eq('game', game)
      .neq('id', userTeam.id)
      .gte('team_vectors.skill_level', userVector.skill_level - 2)
      .lte('team_vectors.skill_level', userVector.skill_level + 2)
      .lt('current_members', 'max_members')
      .limit(limit * 2)

    if (error) {
      console.error('Error finding candidate teams:', error)
      return await getPopularTeamsForGame(game, limit)
    }

    // Generate recommendations with AI scoring
    const recommendations: AITeamRecommendation[] = []

    for (const candidateTeam of candidateTeams.slice(0, limit)) {
      const recommendation = await generateTeamRecommendation(
        userTeam, 
        userVector, 
        candidateTeam
      )
      recommendations.push(recommendation)
    }

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

  } catch (error) {
    console.error('Error in getAITeamRecommendations:', error)
    throw error
  }
}

// Generate simple AI recommendation for a specific team matchup
async function generateSimpleTeamRecommendation(
  userTeam: Team,
  targetTeam: Team
): Promise<AITeamRecommendation> {
  // Simple compatibility scoring
  const regionMatch = userTeam.region === targetTeam.region ? 100 : 50
  const memberRatio = (targetTeam.current_members / targetTeam.max_members) * 100
  const availabilityScore = Math.max(0, 100 - memberRatio) // More available spots = higher score
  
  // Simple rank matching (if available)
  const rankMatch = userTeam.rank_requirement === targetTeam.rank_requirement ? 100 : 70
  
  // Calculate overall compatibility score
  const compatibilityScore = (
    regionMatch * 0.4 + 
    availabilityScore * 0.3 + 
    rankMatch * 0.3
  )

  // Simple skill gap determination
  const skillGap: 'easier' | 'equal' | 'harder' = 'equal' // Default for now
  const challengeType: 'scrim' | 'practice' | 'challenge' | 'coaching' = 'scrim'

  // Generate simple reasoning
  const reasons = []
  if (regionMatch === 100) reasons.push("Same region")
  if (availabilityScore > 50) reasons.push("Has open spots")
  if (rankMatch === 100) reasons.push("Matching skill level")
  if (reasons.length === 0) reasons.push("Good potential match")

  return {
    team: targetTeam,
    score: Math.round(compatibilityScore),
    reason: reasons.join(" • "),
    challengeType,
    skillGap,
    compatibilityFactors: {
      skillMatch: Math.round(rankMatch),
      regionMatch: Math.round(regionMatch),
      activityMatch: Math.round(availabilityScore),
      playstyleMatch: 75 // Default
    }
  }
}
async function generateTeamRecommendation(
  userTeam: Team,
  userVector: TeamVector,
  targetTeam: TeamWithVector
): Promise<AITeamRecommendation> {
  // Calculate compatibility factors
  const skillDiff = Math.abs(userVector.skill_level - targetTeam.skill_level)
  const skillMatch = Math.max(0, 100 - skillDiff * 10) // 0-100 scale
  
  const regionMatch = userTeam.region === targetTeam.region ? 100 : 50
  
  const activityMatch = Math.min(100, 
    Math.max(0, 100 - Math.abs(userVector.activity_score - targetTeam.activity_score) * 10)
  )
  
  const playstyleMatch = Math.min(100,
    Math.max(0, 100 - Math.abs(userVector.playstyle_aggression - targetTeam.playstyle_aggression) * 5)
  )

  // Calculate overall compatibility score
  const compatibilityScore = (
    skillMatch * 0.4 + 
    regionMatch * 0.3 + 
    activityMatch * 0.2 + 
    playstyleMatch * 0.1
  )

  // Determine challenge type and skill gap
  const skillGap: 'easier' | 'equal' | 'harder' = 
    skillDiff < 0.5 ? 'equal' : 
    targetTeam.skill_level > userVector.skill_level ? 'harder' : 'easier'

  const challengeType: 'scrim' | 'practice' | 'challenge' | 'coaching' =
    skillGap === 'equal' ? 'scrim' :
    skillGap === 'harder' ? 'challenge' : 'practice'

  // Generate AI reasoning
  const reason = generateAIReason(userTeam, targetTeam, {
    skillMatch, regionMatch, activityMatch, playstyleMatch, skillGap
  })

  return {
    team: targetTeam,
    score: Math.round(compatibilityScore),
    reason,
    challengeType,
    skillGap,
    compatibilityFactors: {
      skillMatch: Math.round(skillMatch),
      regionMatch: Math.round(regionMatch),
      activityMatch: Math.round(activityMatch),
      playstyleMatch: Math.round(playstyleMatch)
    }
  }
}

// Generate AI reasoning for team recommendation
function generateAIReason(
  userTeam: Team, 
  targetTeam: TeamWithVector, 
  factors: CompatibilityFactors
): string {
  const reasons = []

  if (factors.skillMatch > 80) {
    reasons.push("Perfect skill level match")
  } else if (factors.skillMatch > 60) {
    reasons.push("Good skill compatibility")
  }

  if (factors.regionMatch === 100) {
    reasons.push("Same region (low ping)")
  }

  if (factors.skillGap === 'harder') {
    reasons.push("Great for improvement")
  } else if (factors.skillGap === 'equal') {
    reasons.push("Balanced competition")
  }

  if (factors.activityMatch > 70) {
    reasons.push("Similar activity levels")
  }

  if (targetTeam.current_members < targetTeam.max_members) {
    reasons.push("Currently recruiting")
  }

  return reasons.slice(0, 3).join(" • ") || "Recommended match"
}

// Fallback: Get popular teams for users without teams
async function getPopularTeamsForGame(game: string, limit: number): Promise<AITeamRecommendation[]> {
  try {
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_vectors(skill_level, activity_score)
      `)
      .eq('game', game)
      .filter('current_members', 'lt', 'max_members')
      .order('current_members', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (teams || []).map((team, index) => ({
      team,
      score: 85 - index * 5, // Decreasing score
      reason: "Popular active team • Looking for members",
      challengeType: 'scrim' as const,
      skillGap: 'equal' as const,
      compatibilityFactors: {
        skillMatch: 75,
        regionMatch: 50,
        activityMatch: 80,
        playstyleMatch: 60
      }
    }))
  } catch (error) {
    console.error('Error getting popular teams:', error)
    return []
  }
}

// Track AI recommendation interaction
export async function trackAIRecommendation(
  clerkId: string,
  teamId: string,
  score: number,
  reason: string,
  type: string,
  action: 'clicked' | 'challenged' | 'ignored'
): Promise<void> {
  try {
    const user = await getUserByClerkId(clerkId)
    if (!user) return

    await supabase
      .from('ai_recommendations')
      .insert({
        user_id: user.id,
        recommended_team_id: teamId,
        score,
        reason,
        recommendation_type: type,
        clicked: action === 'clicked' || action === 'challenged',
        result: action
      })
  } catch (error) {
    console.error('Error tracking AI recommendation:', error)
  }
}