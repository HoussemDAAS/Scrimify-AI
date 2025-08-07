import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, Crown, Shield, Trophy, Target, Star, LogOut, Gamepad2, Menu, X } from 'lucide-react'
import NotificationDropdown from './NotificationDropdown'

interface UserProfile {
  username: string
  avatar_url?: string
  bio?: string
  competitive_level: string
  selected_game: string[]
  riot_account_verified?: boolean
  riot_username?: string
  looking_for_team?: boolean
}

interface GameStats {
  rank?: string
  winRate?: string
  mainRole?: string
  summonerLevel?: number
  profileIcon?: string
}

interface DashboardHeaderProps {
  user: UserProfile
  gameStats?: Record<string, GameStats>
  clerkId: string
  onSignOut: () => void
}

export default function DashboardHeader({ user, gameStats, clerkId, onSignOut }: DashboardHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getCompetitiveLevelInfo = (level: string) => {
    switch (level) {
      case 'professional':
        return { icon: Crown, color: 'text-yellow-400', label: 'Pro' }
      case 'semi-pro':
        return { icon: Trophy, color: 'text-purple-400', label: 'Semi-Pro' }
      case 'competitive':
        return { icon: Target, color: 'text-red-400', label: 'Competitive' }
      default:
        return { icon: Star, color: 'text-blue-400', label: 'Casual' }
    }
  }

  const levelInfo = getCompetitiveLevelInfo(user.competitive_level)
  const LevelIcon = levelInfo.icon
  const lolStats = gameStats?.['league-of-legends']

  return (
    <div className="relative" ref={menuRef}>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-4">
        {/* Profile Section */}
        <Link href="/profile" className="group flex items-center gap-3 hover:opacity-80 transition-opacity">
          {/* Avatar */}
          <div className="relative">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.username}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-red-500/20">
                  <User className="w-4 h-4 text-red-400" />
                </div>
              )}
            </div>
            
            {/* Level indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-900 rounded-full flex items-center justify-center">
              <LevelIcon className={`w-2 h-2 ${levelInfo.color}`} />
            </div>
          </div>

          {/* User Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-sm group-hover:text-red-300 transition-colors">
                {user.username}
              </span>
              {user.riot_account_verified && (
                <Shield className="w-3 h-3 text-green-400" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{levelInfo.label}</span>
              {lolStats?.rank && (
                <>
                  <span>•</span>
                  <span className="text-yellow-400">{lolStats.rank}</span>
                </>
              )}
              {user.looking_for_team && (
                <>
                  <span>•</span>
                  <span className="text-green-400">LFT</span>
                </>
              )}
            </div>
          </div>
        </Link>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700/50" />

        {/* Matches Link */}
        <Link 
          href="/matches" 
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors px-3 py-2 rounded-md hover:bg-red-500/10"
        >
          <Gamepad2 className="w-4 h-4" />
          <span className="text-sm font-medium">Matches</span>
        </Link>

        {/* Notifications */}
        <NotificationDropdown clerkId={clerkId} />

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700/50" />

        {/* Logout */}
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded-md hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center gap-3">
        {/* Profile Avatar */}
        <Link href="/profile" className="group">
          <div className="relative">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.username}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-red-500/20">
                  <User className="w-4 h-4 text-red-400" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-900 rounded-full flex items-center justify-center">
              <LevelIcon className={`w-2 h-2 ${levelInfo.color}`} />
            </div>
          </div>
        </Link>

        {/* Notifications */}
        <NotificationDropdown clerkId={clerkId} />

        {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-red-400 transition-colors rounded-md hover:bg-red-500/10"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-12 right-0 z-50 w-64 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl md:hidden">
          <div className="p-4 space-y-4">
            {/* User Info */}
            <div className="pb-3 border-b border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-medium text-sm">{user.username}</span>
                {user.riot_account_verified && (
                  <Shield className="w-3 h-3 text-green-400" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{levelInfo.label}</span>
                {lolStats?.rank && (
                  <>
                    <span>•</span>
                    <span className="text-yellow-400">{lolStats.rank}</span>
                  </>
                )}
                {user.looking_for_team && (
                  <>
                    <span>•</span>
                    <span className="text-green-400">LFT</span>
                  </>
                )}
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-2">
              <Link 
                href="/matches"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-gray-400 hover:text-red-400 transition-colors p-2 rounded-md hover:bg-red-500/10"
              >
                <Gamepad2 className="w-4 h-4" />
                <span className="text-sm font-medium">Matches</span>
              </Link>

              <Link 
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-gray-400 hover:text-red-400 transition-colors p-2 rounded-md hover:bg-red-500/10"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Profile</span>
              </Link>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  onSignOut()
                }}
                className="flex items-center gap-3 text-gray-400 hover:text-red-400 transition-colors p-2 rounded-md hover:bg-red-500/10 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
