'use client'

import { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  value: string | number
  label: string
  color: 'blue' | 'orange' | 'red' | 'purple' | 'green'
  className?: string
}

export function StatCard({ icon, value, label, color, className = '' }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-600/30 to-blue-800/30 border-blue-500/30 group-hover:border-blue-500/60 text-blue-400',
    orange: 'from-orange-600/30 to-orange-800/30 border-orange-500/30 group-hover:border-orange-500/60 text-orange-400',
    red: 'from-red-600/30 to-red-800/30 border-red-500/30 group-hover:border-red-500/60 text-red-400',
    purple: 'from-purple-600/30 to-purple-800/30 border-purple-500/30 group-hover:border-purple-500/60 text-purple-400',
    green: 'from-green-600/30 to-green-800/30 border-green-500/30 group-hover:border-green-500/60 text-green-400'
  }

  return (
    <div className={`group relative ${className}`}>
      <div className={`absolute -inset-1 bg-gradient-to-r ${colorClasses[color]} rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-300`}></div>
      <div className={`relative text-center p-4 md:p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-lg border ${colorClasses[color]} transition-all duration-300 group-hover:scale-105`}>
        <div className={`w-6 h-6 md:w-8 md:h-8 ${colorClasses[color].split(' ').pop()} mx-auto mb-3`}>
          {icon}
        </div>
        <div className="text-2xl md:text-3xl font-black text-white">{value}</div>
        <div className="text-xs md:text-sm text-gray-400 font-medium uppercase tracking-wide">{label}</div>
      </div>
    </div>
  )
}
