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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function normalizeGamesToArray(games: string | string[] | null | undefined): string[] {
  if (!games) return []
  if (Array.isArray(games)) return games
  if (typeof games === 'string') return games ? [games] : []
  return []
}

async function getUserOnboardingStatus(userId: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, selected_game')
      .eq('clerk_id', userId)
      .single()
    
    if (error && error.code === 'PGRST116') {
      return { hasGames: false, isNewUser: true, needsOnboarding: true }
    }
    
    if (error) {
      console.error('Error fetching user:', error)
      return { hasGames: false, isNewUser: true, needsOnboarding: true }
    }
    
    const normalizedGames = normalizeGamesToArray(user.selected_game)
    const hasGames = normalizedGames.length > 0
    
    
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
  
  if (!userId && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
  
  if (userId) {
    const currentPath = req.nextUrl.pathname
    
    if (currentPath.startsWith('/sign-in') || currentPath.startsWith('/sign-up')) {
      const status = await getUserOnboardingStatus(userId)
      
      if (status.isNewUser) {
        return NextResponse.redirect(new URL('/game-selection', req.url))
      }
      
      if (!status.hasGames) {
        return NextResponse.redirect(new URL('/game-selection', req.url))
      }
      
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    
    if (isProtectedRoute(req)) {
      const status = await getUserOnboardingStatus(userId)
      
      if (!status.hasGames && currentPath !== '/game-selection') {
        return NextResponse.redirect(new URL('/game-selection', req.url))
      }
      
      if (status.hasGames && currentPath === '/dashboard') {
        return NextResponse.next()
      }
    }
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}