/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Sword, Shield, Globe, Star, Clock, Gamepad2, Target, Brain } from 'lucide-react'

interface TeamDetailsFormProps {
  teamData: {
    name: string
    description: string
    region: string
    rankRequirement: string
    practiceSchedule: string
    gameSpecificData: Record<string, string>
  }
  currentGameConfig: any
  selectedGame: string
  onTeamDataChange: (data: any) => void
  onGameSpecificChange: (field: string, value: string) => void
}

export default function TeamDetailsForm({ 
  teamData, 
  currentGameConfig, 
  selectedGame,
  onTeamDataChange, 
  onGameSpecificChange 
}: TeamDetailsFormProps) {
  return (
    <Card className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-red-500/30">
      <CardHeader className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-white text-xl md:text-2xl font-black">
            TEAM DETAILS
          </CardTitle>
        </div>

        <div className="space-y-6">
          {/* Team Name */}
          <div>
            <Label htmlFor="teamName" className="text-white font-bold mb-2 flex items-center gap-2">
              <Sword className="h-4 w-4 text-red-500" />
              Team Name
            </Label>
            <Input
              id="teamName"
              placeholder="Enter your team name..."
              value={teamData.name}
              onChange={(e) => onTeamDataChange({...teamData, name: e.target.value})}
              className="bg-gray-800 border-red-500/30 text-white placeholder-gray-400 focus:border-red-500"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-white font-bold mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-500" />
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your team's goals and playstyle..."
              value={teamData.description}
              onChange={(e) => onTeamDataChange({...teamData, description: e.target.value})}
              className="bg-gray-800 border-red-500/30 text-white placeholder-gray-400 focus:border-red-500 min-h-20"
            />
          </div>

          {/* Region & Rank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-white font-bold mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4 text-red-500" />
                Region
              </Label>
              <select
                value={teamData.region}
                onChange={(e) => onTeamDataChange({...teamData, region: e.target.value})}
                className="w-full bg-gray-800 border border-red-500/30 text-white rounded-md px-3 py-2 focus:border-red-500 focus:outline-none"
              >
                <option value="NA">North America</option>
                <option value="EU">Europe</option>
                <option value="ASIA">Asia</option>
                <option value="OCE">Oceania</option>
                <option value="SA">South America</option>
              </select>
            </div>

            <div>
              <Label className="text-white font-bold mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-red-500" />
                Min Rank
              </Label>
              <select
                value={teamData.rankRequirement}
                onChange={(e) => onTeamDataChange({...teamData, rankRequirement: e.target.value})}
                className="w-full bg-gray-800 border border-red-500/30 text-white rounded-md px-3 py-2 focus:border-red-500 focus:outline-none"
              >
                <option value="">Any Rank</option>
                {currentGameConfig.ranks.map((rank: string) => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Practice Schedule */}
          <div>
            <Label htmlFor="schedule" className="text-white font-bold mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-500" />
              Practice Schedule
            </Label>
            <Input
              id="schedule"
              placeholder="e.g., Mon/Wed/Fri 7-9 PM EST"
              value={teamData.practiceSchedule}
              onChange={(e) => onTeamDataChange({...teamData, practiceSchedule: e.target.value})}
              className="bg-gray-800 border-red-500/30 text-white placeholder-gray-400 focus:border-red-500"
            />
          </div>

          {/* Dynamic Game-Specific Fields */}
          <div className="border-t border-red-500/20 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Gamepad2 className="h-5 w-5 text-red-500" />
              <Label className="text-white font-bold text-lg">
                {currentGameConfig.name} SPECIFICS
              </Label>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(currentGameConfig.formFields).map(([fieldKey, options]: [string, any]) => {
                const fieldDisplayName = fieldKey
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())
                  .trim()
                
                return (
                  <div key={fieldKey}>
                    <Label className="text-white font-bold mb-2 flex items-center gap-2">
                      <Target className="h-3 w-3 text-red-500" />
                      {fieldDisplayName}
                    </Label>
                    <select
                      value={teamData.gameSpecificData[fieldKey] || ''}
                      onChange={(e) => onGameSpecificChange(fieldKey, e.target.value)}
                      className="w-full bg-gray-800 border border-red-500/30 text-white rounded-md px-3 py-2 focus:border-red-500 focus:outline-none text-sm"
                    >
                      <option value="">Select {fieldDisplayName}</option>
                      {options.map((option: string) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>
            
            {/* Game-specific tips */}
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-200 text-xs">
                <Brain className="h-3 w-3 inline mr-1" />
                {selectedGame === 'valorant' && "Pro tip: Specify your preferred agents and strategies for better team synergy!"}
                {selectedGame === 'league-of-legends' && "Pro tip: Define your preferred lanes and champion pools for optimal team composition!"}
                {selectedGame === 'counter-strike-2' && "Pro tip: Mention your favorite maps and preferred roles for tactical coordination!"}
                {selectedGame === 'overwatch-2' && "Pro tip: Specify your hero preferences and communication style for better team dynamics!"}
                {selectedGame === 'rocket-league' && "Pro tip: Define your playstyle and preferred training methods for team chemistry!"}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}