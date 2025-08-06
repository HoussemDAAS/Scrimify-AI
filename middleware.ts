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
  '/team-choice',
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

// Helper function to check user's onboarding status
async function getUserOnboardingStatus(userId: string) {
  try {
    // Check if user exists and has selected games
    const { data: user } = await supabase
      .from('users')
      .select('id, selected_game')
      .eq('clerk_id', userId)
      .single()
    
    if (!user) {
      return { hasGames: false, hasTeams: false, needsOnboarding: true }
    }
    
    const hasGames = user.selected_game && 
      (Array.isArray(user.selected_game) ? user.selected_game.length > 0 : !!user.selected_game)
    
    if (!hasGames) {
      return { hasGames: false, hasTeams: false, needsOnboarding: true }
    }
    
    // Check if user has teams
    const { count } = await supabase
      .from('team_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    const hasTeams = (count || 0) > 0
    
    return { 
      hasGames, 
      hasTeams, 
      needsOnboarding: !hasGames || !hasTeams 
    }
  } catch (error) {
    return { hasGames: false, hasTeams: false, needsOnboarding: true }
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
      
      if (!status.hasGames) {
        return NextResponse.redirect(new URL('/game-selection', req.url))
      } else if (!status.hasTeams) {
        return NextResponse.redirect(new URL('/team-choice', req.url))
      } else {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
    
    // For other protected routes, ensure proper onboarding flow
    if (isProtectedRoute(req)) {
      const status = await getUserOnboardingStatus(userId)
      
      // If user hasn't selected games yet
      if (!status.hasGames && currentPath !== '/game-selection') {
        return NextResponse.redirect(new URL('/game-selection', req.url))
      }
      
      // If user has games but no teams, and trying to access dashboard
      if (status.hasGames && !status.hasTeams && currentPath === '/dashboard') {
        return NextResponse.redirect(new URL('/team-choice', req.url))
      }
      
      // Allow access to team-choice if they have games
      if (currentPath === '/team-choice' && !status.hasGames) {
        return NextResponse.redirect(new URL('/game-selection', req.url))
      }
    }
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}