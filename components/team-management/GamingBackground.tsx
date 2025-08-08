'use client'

import { ReactNode } from 'react'
import DashboardBackground from '@/components/dashboard/DashboardBackground'

interface GamingBackgroundProps {
  children: ReactNode
  className?: string
}

export function GamingBackground({ children, className = '' }: GamingBackgroundProps) {
  return (
    <div className={`min-h-screen bg-black relative overflow-hidden ${className}`}>
      <DashboardBackground />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
