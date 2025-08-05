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

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  
  // If user is not authenticated and trying to access protected route
  if (!userId && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
  
  // If user is authenticated, check their game selection status
  if (userId) {
    // If user is on sign-in/sign-up pages, redirect based on their status
    if (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up')) {
      try {
        // Check if user exists and has selected games
        const { data: user } = await supabase
          .from('users')
          .select('selected_game')
          .eq('clerk_id', userId)
          .single()
        
        if (user && user.selected_game && (Array.isArray(user.selected_game) ? user.selected_game.length > 0 : user.selected_game)) {
          // User has selected games, redirect to dashboard
          return NextResponse.redirect(new URL('/dashboard', req.url))
        } else {
          // User hasn't selected any games, redirect to game selection
          return NextResponse.redirect(new URL('/game-selection', req.url))
        }
      } catch (error) {
        // If user doesn't exist in database, redirect to game selection
        return NextResponse.redirect(new URL('/game-selection', req.url))
      }
    }
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}