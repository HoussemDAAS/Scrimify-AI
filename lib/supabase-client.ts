import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Types for the save function
interface GameStatistics {
  profile_icon_url?: string
  summoner_level?: number
  current_rank?: string
  rank_points?: string
  flex_rank?: string
  main_role?: string
  win_rate?: number
  games_played?: number
  wins?: number
  losses?: number
  total_matches?: number
  average_kda?: number
  last_played?: string
  recent_form?: string
  additional_stats?: Record<string, unknown>
}

// Client-side Supabase client that uses user's auth context
export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true
    }
  })
}

// Client-side function to save user game statistics with proper auth context
export async function saveUserGameStatistics(
  userId: string,
  gameId: string,
  stats: Partial<GameStatistics>
) {
  const supabaseClient = createSupabaseClient()
  
  const statisticsData = {
    user_id: userId,
    game_id: gameId,
    current_rank: 'Unranked',
    ...stats,
    last_updated: new Date().toISOString()
  }
  
  const { data, error } = await supabaseClient
    .from('user_game_statistics')
    .upsert(statisticsData, {
      onConflict: 'user_id,game_id'
    })
    .select()
    .single()
  
  if (error) {
    console.error('❌ Client-side save error:', error)
    throw new Error(`Failed to save: ${error.message}`)
  }
  
  return data
}
