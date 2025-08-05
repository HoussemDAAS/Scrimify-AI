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

export async function getUserTeamsForGame(userId: string, game: string) {
  try {
    const { data, error } = await supabase
      .from('team_memberships')
      .select(`
        *,
        teams!inner(*)
      `)
      .eq('user_id', userId)
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

export async function getUserTeamsForAllGames(userId: string, games: string[]) {
  try {
    if (!games || games.length === 0) return []
    
    const { data, error } = await supabase
      .from('team_memberships')
      .select(`
        *,
        teams!inner(*)
      `)
      .eq('user_id', userId)
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