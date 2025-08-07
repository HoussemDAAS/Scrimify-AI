'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface QuickActionCardProps {
  href?: string
  onClick?: () => void
  icon: ReactNode
  title: string
  description: string
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple'
}

export function QuickActionCard({ href, onClick, icon, title, description, color }: QuickActionCardProps) {
  const colorClasses = {
    blue: 'from-blue-600/20 to-blue-800/20 border-blue-500/30 hover:border-blue-500/60 text-blue-400',
    green: 'from-green-600/20 to-green-800/20 border-green-500/30 hover:border-green-500/60 text-green-400',
    orange: 'from-orange-600/20 to-orange-800/20 border-orange-500/30 hover:border-orange-500/60 text-orange-400',
    red: 'from-red-600/20 to-red-800/20 border-red-500/30 hover:border-red-500/60 text-red-400',
    purple: 'from-purple-600/20 to-purple-800/20 border-purple-500/30 hover:border-purple-500/60 text-purple-400'
  }

  const gradientClasses = {
    blue: 'from-transparent via-blue-500 to-transparent',
    green: 'from-transparent via-green-500 to-transparent',
    orange: 'from-transparent via-orange-500 to-transparent',
    red: 'from-transparent via-red-500 to-transparent',
    purple: 'from-transparent via-purple-500 to-transparent'
  }

  const content = (
    <div className="group relative cursor-pointer">
      <div className={`absolute -inset-2 bg-gradient-to-r ${colorClasses[color]} rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-all duration-500`}></div>
      <div className={`relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-lg border-2 ${colorClasses[color]} rounded-2xl p-6 text-center transition-all duration-300 group-hover:scale-105`}>
        <div className={`w-8 h-8 ${colorClasses[color].split(' ').slice(-1)} mx-auto mb-4`}>
          {icon}
        </div>
        <h3 className="font-bold text-white mb-2 text-lg">{title}</h3>
        <p className="text-xs text-gray-400">{description}</p>
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClasses[color]}`}></div>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return <div onClick={onClick}>{content}</div>
}
