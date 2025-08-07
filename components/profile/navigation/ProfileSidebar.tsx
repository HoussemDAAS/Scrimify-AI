import React from 'react'
import { User, Gamepad2, Shield, Settings, Trophy, X } from 'lucide-react'

export type ProfileSection = 'general' | 'gaming' | 'riot' | 'preferences'

interface ProfileSidebarProps {
  activeSection: ProfileSection
  setActiveSection: (section: ProfileSection) => void
  hasUnsavedChanges?: boolean
  onClose?: () => void
}

const navigationItems = [
  {
    id: 'general' as const,
    label: 'General',
    icon: User,
    description: 'Basic profile information'
  },
  {
    id: 'gaming' as const,
    label: 'Gaming',
    icon: Gamepad2,
    description: 'Game preferences & stats'
  },
  {
    id: 'riot' as const,
    label: 'Riot Games',
    icon: Shield,
    description: 'Connect your Riot account'
  },
  {
    id: 'preferences' as const,
    label: 'Preferences',
    icon: Settings,
    description: 'Privacy & notifications'
  }
]

/**
 * Sidebar navigation for profile sections
 * Clean, gaming-style navigation with section indicators
 */
export default function ProfileSidebar({ 
  activeSection, 
  setActiveSection, 
  hasUnsavedChanges,
  onClose 
}: ProfileSidebarProps) {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-900/95 to-black/95 border-r border-red-500/20 flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-red-500/20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <Trophy className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-white font-bold text-base lg:text-lg truncate">Profile</h2>
            <p className="text-gray-400 text-xs lg:text-sm truncate">Gaming identity</p>
          </div>
          {/* Mobile Close Button */}
          {onClose && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onClose()
              }}
              className="lg:hidden w-8 h-8 rounded-lg bg-gray-800/50 border border-red-500/30 flex items-center justify-center text-gray-400 hover:text-white hover:border-red-500 transition-all duration-200 relative z-10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-3 lg:p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id)
                // Close sidebar on mobile after selecting
                if (onClose) {
                  onClose()
                }
              }}
              className={`
                w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/50 text-white' 
                  : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                }
              `}
            >
              <Icon className={`w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0 ${isActive ? 'text-red-400' : 'text-gray-400'}`} />
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium text-xs lg:text-sm truncate">{item.label}</div>
                <div className="text-xs opacity-70 truncate hidden lg:block">{item.description}</div>
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
              )}
            </button>
          )
        })}
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="p-3 lg:p-4 flex-shrink-0">
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse flex-shrink-0"></div>
              <span className="text-yellow-400 text-xs font-medium truncate">Unsaved changes</span>
            </div>
            <p className="text-yellow-300/70 text-xs mt-1 hidden lg:block">
              Remember to save your changes before switching sections
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
