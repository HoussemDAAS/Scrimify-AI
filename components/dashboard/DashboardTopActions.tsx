import React from 'react'
import Link from 'next/link'
import { Settings } from 'lucide-react'

export default function DashboardTopActions() {
  return (
    <div className="absolute top-4 left-4 right-4 md:top-6 md:left-6 md:right-6 z-20 flex justify-between items-center">
      <Link 
        href="/game-selection"
        className="flex items-center gap-2 text-white hover:text-red-500 transition-colors duration-300 group"
      >
        <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg flex items-center justify-center group-hover:border-red-500 transition-all duration-300">
          <Settings className="h-4 w-4 md:h-5 md:w-5" />
        </div>
        <span className="hidden lg:block font-bold text-sm md:text-base">MANAGE GAMES</span>
      </Link>
    </div>
  )
}
