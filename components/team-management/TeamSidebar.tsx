'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Users, ChevronRight, UserPlus } from 'lucide-react'

interface Team {
  id: string
  name: string
  description: string
  game: string
  region: string
  rank_requirement: string
  max_members: number
  current_members: number
  practice_schedule: string
  logo_url?: string
  created_at: string
}

interface TeamSidebarProps {
  teams: Team[]
  selectedTeam: Team | null
  onTeamSelect: (team: Team) => void
}

export function TeamSidebar({ teams, selectedTeam, onTeamSelect }: TeamSidebarProps) {
  return (
    <div className="lg:w-80">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">TEAM COMMAND</h1>
            <p className="text-gray-400 text-sm">Battle management headquarters</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {teams.map((team) => (
          <div
            key={team.id}
            className={`group relative cursor-pointer transition-all duration-300 ${
              selectedTeam?.id === team.id 
                ? 'transform scale-105' 
                : 'hover:scale-102'
            }`}
            onClick={() => onTeamSelect(team)}
          >
            <div className={`absolute -inset-1 rounded-xl transition-all duration-300 ${
              selectedTeam?.id === team.id 
                ? 'bg-gradient-to-r from-red-600/50 to-red-800/50 blur-sm' 
                : 'bg-gradient-to-r from-red-600/20 to-red-800/20 opacity-0 group-hover:opacity-100 blur-sm'
            }`}></div>
            
            <div className={`relative bg-gradient-to-br backdrop-blur-lg border-2 rounded-xl p-4 transition-all duration-300 ${
              selectedTeam?.id === team.id 
                ? 'from-gray-900/90 to-black/90 border-red-500/70 shadow-xl shadow-red-500/25' 
                : 'from-gray-900/60 to-black/60 border-red-500/30 hover:border-red-500/60 hover:from-gray-900/80 hover:to-black/80'
            }`}>
              <div className="flex items-center gap-3">
                {team.logo_url ? (
                  <div className="relative">
                    <Image
                      src={team.logo_url}
                      alt={team.name}
                      width={48}
                      height={48}
                      className="rounded-lg"
                    />
                    <div className="absolute -inset-1 bg-red-500/20 rounded-lg blur-sm"></div>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-600/30 to-red-800/30 flex items-center justify-center border border-red-500/30">
                    <Users className="w-6 h-6 text-red-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate text-sm md:text-base">{team.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="text-red-400 font-medium">{team.game.toUpperCase()}</span>
                    <span>•</span>
                    <span>{team.current_members}/{team.max_members}</span>
                  </div>
                </div>
                {selectedTeam?.id === team.id && (
                  <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-red-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <Link href="/create-team">
          <div className="group relative cursor-pointer transition-all duration-300 hover:scale-102">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-300"></div>
            
            <div className="relative bg-gradient-to-br from-gray-900/40 to-black/40 backdrop-blur-lg border-2 border-dashed border-red-500/40 hover:border-red-500/70 rounded-xl p-4 transition-all duration-300">
              <div className="flex items-center gap-3 text-gray-400 group-hover:text-white transition-colors">
                <div className="w-12 h-12 rounded-lg border-2 border-dashed border-red-500/40 group-hover:border-red-500/70 flex items-center justify-center transition-all duration-300">
                  <UserPlus className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm md:text-base">CREATE NEW SQUAD</span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
