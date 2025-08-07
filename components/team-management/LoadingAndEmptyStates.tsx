'use client'

import Link from 'next/link'
import { GamingBackground } from './GamingBackground'
import { PrimaryButton } from '@/components/ui/primary-button'
import { Users, UserPlus } from 'lucide-react'

interface LoadingStateProps {
  isLoading?: boolean
}

export function LoadingState({ isLoading = true }: LoadingStateProps) {
  if (!isLoading) return null

  return (
    <GamingBackground>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -inset-4 bg-red-600/20 rounded-full blur-2xl animate-pulse"></div>
          </div>
          <p className="text-white font-bold text-lg">Loading Battle Command...</p>
          <p className="text-gray-400 text-sm mt-2">Preparing your team arsenal</p>
        </div>
      </div>
    </GamingBackground>
  )
}

export function EmptyTeamsState() {
  return (
    <GamingBackground>
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl flex items-center justify-center mx-auto">
              <Users className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -inset-6 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
            <span className="relative">
              NO TEAMS COMMAND
              <div className="absolute inset-0 bg-red-500/10 blur-xl animate-pulse"></div>
            </span>
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
            You don&apos;t own any teams yet. Create your first elite squad and start dominating the battlefield.
          </p>
          
          <Link href="/create-team">
            <div className="group relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-red-600/30 to-red-800/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <PrimaryButton className="relative px-8 py-4 text-lg font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-2 border-red-500/50 shadow-xl shadow-red-500/25">
                <UserPlus className="w-5 h-5 mr-3" />
                CREATE YOUR FIRST TEAM
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </PrimaryButton>
            </div>
          </Link>
        </div>
      </div>
    </GamingBackground>
  )
}
