import React from 'react'
import { Crosshair, Crown } from 'lucide-react'

export default function DashboardHero() {
  return (
    <div className="text-center mb-12 md:mb-16">
      <div className="flex justify-center mb-6 md:mb-8">
        <div className="relative">
          <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 border-4 border-red-500/30 rounded-3xl animate-spin-slow"></div>
          <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl flex items-center justify-center">
            <Crosshair className="w-10 h-10 md:w-12 md:h-12 text-white" />
            <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-6 h-6 md:w-8 md:h-8 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
              <Crown className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-3 md:mb-4 relative px-4">
        <span className="relative">
          COMMAND CENTER
          <div className="absolute inset-0 bg-red-500/10 blur-xl animate-pulse"></div>
        </span>
      </h1>
      <p className="text-gray-300 font-medium text-base md:text-lg max-w-2xl mx-auto px-4">
        Your multi-game empire headquarters. Switch between games and manage your teams across all battlefields.
      </p>
    </div>
  )
}
