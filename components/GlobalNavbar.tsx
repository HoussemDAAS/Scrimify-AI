'use client'

import React from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import DashboardHeader from '@/components/DashboardHeader'
import Link from 'next/link'
import { ArrowLeft, Gamepad2, Crosshair } from 'lucide-react'

interface UserProfile {
  username: string
  avatar_url?: string
  competitive_level: string
  selected_game: string[]
  riot_account_verified?: boolean
  looking_for_team?: boolean
}

interface GameStats {
  rank?: string
  winRate?: string
  mainRole?: string
  summonerLevel?: number
  profileIcon?: string
}

interface GlobalNavbarProps {
  userProfile?: UserProfile
  gameStats?: Record<string, GameStats>
}

export default function GlobalNavbar({ userProfile, gameStats }: GlobalNavbarProps) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const pathname = usePathname()

  // Don't show navbar on landing page or profile pages
  if (pathname === '/' || pathname.startsWith('/profile') || pathname.startsWith('/sign-')) {
    return null
  }

  const getBackLink = () => {
    if (pathname.startsWith('/teams/manage')) return '/dashboard'
    if (pathname.startsWith('/teams/')) return '/dashboard'
    if (pathname.startsWith('/create-team')) return '/dashboard'
    if (pathname.startsWith('/join-team')) return '/dashboard'
    if (pathname.startsWith('/game-selection')) return '/dashboard'
    return '/dashboard'
  }

  const getBackText = () => {
    if (pathname.startsWith('/teams/manage')) return 'Back to Dashboard'
    if (pathname.startsWith('/teams/')) return 'Back to Dashboard'
    if (pathname.startsWith('/create-team')) return 'Back to Dashboard'
    if (pathname.startsWith('/join-team')) return 'Back to Dashboard'
    return 'Dashboard'
  }

  const showBackButton = pathname !== '/dashboard'

  return (
    <div className="sticky top-0 z-50 border-b border-gray-800 bg-black/90 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side - Back Button, Logo, or Manage Games */}
          <div className="flex items-center gap-4">
            {showBackButton ? (
              <Link href={getBackLink()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:block">{getBackText()}</span>
              </Link>
            ) : (
              <>
                <Link href="/dashboard" className="flex items-center space-x-2 md:space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center relative">
                    <Crosshair className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <span className="text-lg md:text-xl font-bold text-white">SCRIMIFY</span>
                    <span className="text-red-500 text-xs md:text-sm font-bold ml-1 md:ml-2">AI</span>
                  </div>
                </Link>
                
                {/* Manage Games Button - Only on Dashboard */}
                <Link href="/game-selection" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors ml-6">
                  <Gamepad2 className="w-4 h-4" />
                  <span className="hidden lg:block font-bold text-sm md:text-base">MANAGE GAMES</span>
                </Link>
              </>
            )}
          </div>

          {/* Right Side - User Profile */}
          {userProfile && user && (
            <DashboardHeader
              user={userProfile}
              gameStats={gameStats}
              clerkId={user.id}
              onSignOut={() => signOut()}
            />
          )}
        </div>
      </div>
    </div>
  )
}
