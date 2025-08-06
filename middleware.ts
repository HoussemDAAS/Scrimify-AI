import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

const isProtectedRoute = createRouteMatcher([
  '/game-selection',
  '/dashboard',
  '/teams/(.*)',
  '/join-team',
  '/create-team',
])

// Initialize Supabase client for middleware
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Helper function to normalize games to array format (same as in supabase.ts)
function normalizeGamesToArray(games: string | string[] | null | undefined): string[] {
  if (!games) return []
  if (Array.isArray(games)) return games
  if (typeof games === 'string') return games ? [games] : []
  return []
}

// Helper function to check user's onboarding status
async function getUserOnboardingStatus(userId: string) {
  try {
    // Check if user exists and has selected games
    const { data: user, error } = await supabase
      .from('users')
      .select('id, selected_game')
      .eq('clerk_id', userId)
      .single()
    
    // If user doesn't exist in database, they're a new user
    if (error && error.code === 'PGRST116') {
      return { hasGames: false, isNewUser: true, needsOnboarding: true }
    }
    
    if (error) {
      console.error('Error fetching user:', error)
      return { hasGames: false, isNewUser: true, needsOnboarding: true }
    }
    
    // User exists - normalize and check if they have games selected
    const normalizedGames = normalizeGamesToArray(user.selected_game)
    const hasGames = normalizedGames.length > 0
    
    console.log(`User ${userId} - Games:`, normalizedGames, `- HasGames: ${hasGames}`)
    
    return { 
      hasGames, 
      isNewUser: false,
      needsOnboarding: !hasGames,
      selectedGames: normalizedGames
    }
  } catch (error) {
    console.error('Error in getUserOnboardingStatus:', error)
    return { hasGames: false, isNewUser: true, needsOnboarding: true }
  }
}

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  
  // If user is not authenticated and trying to access protected route
  if (!userId && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
  
  // If user is authenticated, check their onboarding status
  if (userId) {
    const currentPath = req.nextUrl.pathname
    
    // If user is on sign-in/sign-up pages, redirect based on their status
    if (currentPath.startsWith('/sign-in') || currentPath.startsWith('/sign-up')) {
      const status = await getUserOnboardingStatus(userId)
      
      // New users (not in database) should go to game selection
      if (status.isNewUser) {
        return NextResponse.redirect(new URL('/game-selection', req.url))
      }
      
      // Existing users: check if they have games selected in database
      if (!status.hasGames) {
        return NextResponse.redirect(new URL('/game-selection', req.url))
      }
      
      // Existing users with games go directly to dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    
    // For other protected routes, ensure proper onboarding flow
    if (isProtectedRoute(req)) {
      const status = await getUserOnboardingStatus(userId)
      
      // Only redirect to game selection if user hasn't selected games yet
      if (!status.hasGames && currentPath !== '/game-selection') {
        return NextResponse.redirect(new URL('/game-selection', req.url))
      }
      
      // Allow access to dashboard if user has games
      if (status.hasGames && currentPath === '/dashboard') {
        return NextResponse.next()
      }
    }
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}