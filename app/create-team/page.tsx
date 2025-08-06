'use client'

import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { PrimaryButton } from '@/components/ui/primary-button'
import { AccentButton } from '@/components/ui/accent-button'
import { 
  ArrowLeft, Brain, Target, Plus, Crown, Flame, LogOut, Gamepad2, 
  Users, CheckCircle
} from 'lucide-react'
import { getUserByClerkId } from '@/lib/supabase'
import { createTeam, createTeamInvitation } from '@/lib/team-functions'
import { gameConfigs } from '@/lib/game-configs'
import TeamDetailsForm from '@/components/TeamDetailsForm'
import MemberInvitations from '@/components/MemberInvitations'

export default function CreateTeamPage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameParam = searchParams.get('game')
  
  const [selectedGame, setSelectedGame] = useState<string>(gameParam || 'valorant')
  const [userGames, setUserGames] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  
  // Form state
  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    region: 'NA',
    rankRequirement: '',
    isPublic: true,
    practiceSchedule: '',
    logoUrl: '',
    gameSpecificData: {} as Record<string, string>
  })
  
  const [inviteEmails, setInviteEmails] = useState<string[]>([''])

  useEffect(() => {
    const checkUser = async () => {
      if (!user) return

      try {
        const existingUser = await getUserByClerkId(user.id)
        
        if (!existingUser || !existingUser.selected_game) {
          router.push('/game-selection')
          return
        }
        
        const games = Array.isArray(existingUser.selected_game) 
          ? existingUser.selected_game 
          : [existingUser.selected_game]
        
        setUserGames(games)
        
        if (gameParam && games.includes(gameParam)) {
          setSelectedGame(gameParam)
        } else {
          setSelectedGame(games[0])
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error checking user:', error)
        router.push('/game-selection')
      }
    }

    checkUser()
  }, [user, router, gameParam])

  const currentGameConfig = gameConfigs[selectedGame as keyof typeof gameConfigs] || gameConfigs.valorant

  const addInviteField = () => {
    if (inviteEmails.length < currentGameConfig.maxMembers - 1) {
      setInviteEmails([...inviteEmails, ''])
    }
  }

  const removeInviteField = (index: number) => {
    if (inviteEmails.length > 1) {
      setInviteEmails(inviteEmails.filter((_, i) => i !== index))
    }
  }

  const updateInviteEmail = (index: number, email: string) => {
    const newEmails = [...inviteEmails]
    newEmails[index] = email
    setInviteEmails(newEmails)
  }

  const updateGameSpecificField = (fieldName: string, value: string) => {
    setTeamData(prev => ({
      ...prev,
      gameSpecificData: {
        ...prev.gameSpecificData,
        [fieldName]: value
      }
    }))
  }

  const handleCreateTeam = async () => {
    if (!teamData.name.trim() || !user) return
    
    setIsCreating(true)
    
    try {
      const newTeam = await createTeam({
        name: teamData.name.trim(),
        description: teamData.description.trim(),
        game: selectedGame,
        region: teamData.region,
        rank_requirement: teamData.rankRequirement || undefined,
        max_members: currentGameConfig.maxMembers,
        practice_schedule: teamData.practiceSchedule.trim() || undefined,
        logo_url: teamData.logoUrl || undefined,
        game_specific_data: Object.keys(teamData.gameSpecificData).length > 0 
          ? teamData.gameSpecificData 
          : undefined,
        owner_clerk_id: user.id
      })

      console.log('Team created successfully:', newTeam)

      // Send invitations to members
      const validInvites = inviteEmails.filter(email => email.trim())
      const invitePromises = validInvites.map(email => 
        createTeamInvitation({
          team_id: newTeam.id,
          inviter_clerk_id: user.id,
          invited_email: email.trim().includes('@') ? email.trim() : undefined,
          invited_username: !email.trim().includes('@') ? email.trim() : undefined,
          role: 'member'
        }).catch(error => {
          console.error(`Failed to send invitation to ${email}:`, error)
          return null
        })
      )

      await Promise.allSettled(invitePromises)
      
      alert(`Team "${teamData.name}" created successfully! ${validInvites.length > 0 ? `Invitations sent to ${validInvites.length} members.` : ''}`)
      
      router.push('/dashboard')
      
    } catch (error) {
      console.error('Error creating team:', error)
      alert('Failed to create team. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  // Reset game-specific data when game changes
  useEffect(() => {
    setTeamData(prev => ({
      ...prev,
      gameSpecificData: {}
    }))
  }, [selectedGame])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <p className="text-white font-bold">Loading Battle Station...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Gaming Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 md:grid-cols-12 gap-2 md:gap-4 h-full">
          {Array.from({ length: 96 }).map((_, i) => (
            <div key={i} className="border border-red-500/20"></div>
          ))}
        </div>
      </div>

      {/* Enhanced Red Glowing Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-40 h-40 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-32 w-48 h-48 bg-red-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-44 h-44 bg-red-700/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500/40 rounded-full animate-ping"
            style={{
              left: `${20 + (i * 12)}%`,
              top: `${25 + (i * 10)}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: '5s'
            }}
          />
        ))}
      </div>

      {/* Header Navigation */}
      <div className="absolute top-4 left-4 right-4 md:top-6 md:left-6 md:right-6 z-20 flex justify-between items-center">
        <Link 
          href="/dashboard"
          className="flex items-center gap-2 text-white hover:text-red-500 transition-colors duration-300 group"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg flex items-center justify-center group-hover:border-red-500 transition-all duration-300">
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <span className="hidden lg:block font-bold text-sm md:text-base">BACK TO DASHBOARD</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3 bg-gray-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg px-2 py-1 md:px-4 md:py-2">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
              <Crown className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-bold text-xs md:text-sm">{user?.username || user?.firstName || 'Captain'}</p>
              <p className="text-gray-400 text-xs">Team Builder</p>
            </div>
          </div>
          
          <AccentButton
            onClick={() => signOut()}
            size="sm"
            className="px-2 py-1 md:px-4 md:py-2"
          >
            <LogOut className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:block ml-2 text-xs md:text-sm font-bold">LOGOUT</span>
          </AccentButton>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-20 md:py-32">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="relative">
              <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 border-4 border-red-500/30 rounded-3xl animate-spin-slow"></div>
              <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl flex items-center justify-center">
                <Crown className="w-10 h-10 md:w-12 md:h-12 text-white" />
                <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-6 h-6 md:w-8 md:h-8 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                  <Plus className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-3 md:mb-4 relative px-4">
            <span className="relative">
              BUILD YOUR EMPIRE
              <div className="absolute inset-0 bg-red-500/10 blur-xl animate-pulse"></div>
            </span>
          </h1>
          <p className="text-gray-300 font-medium text-base md:text-lg max-w-2xl mx-auto px-4">
            Forge the ultimate gaming squad. Recruit elite players and dominate the battlefield together.
          </p>
        </div>

        {/* Game Selector */}
        {userGames.length > 1 && (
          <div className="mb-8 md:mb-12 max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center flex items-center justify-center gap-2">
              <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
              SELECT GAME
            </h2>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {userGames.map((gameId) => {
                const gameConfig = gameConfigs[gameId as keyof typeof gameConfigs]
                if (!gameConfig) return null
                
                return (
                  <button
                    key={gameId}
                    onClick={() => setSelectedGame(gameId)}
                    className={`group relative flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-3 rounded-xl border-2 transition-all duration-300 ${
                      selectedGame === gameId
                        ? 'border-red-500 bg-red-500/20 text-white'
                        : 'border-red-500/30 bg-gray-900/60 text-gray-300 hover:border-red-500/60 hover:bg-red-500/10'
                    }`}
                  >
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br ${gameConfig.color} flex items-center justify-center`}>
                      <Image 
                        src={gameConfig.logo} 
                        alt={gameConfig.name}
                        width={20}
                        height={20}
                        className="md:w-6 md:h-6 object-contain filter brightness-0 invert"
                      />
                    </div>
                    <span className="font-bold text-sm md:text-base">{gameConfig.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Current Game Display */}
        <div className="mb-8 md:mb-12 max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute -inset-4 bg-red-600/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative">
                <div className="absolute inset-0 w-24 h-24 md:w-32 md:h-32 border-4 border-red-500/30 rounded-full animate-spin-slow"></div>
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/60 rounded-full"></div>
                  <Image 
                    src={currentGameConfig.logo} 
                    alt={currentGameConfig.name}
                    width={64}
                    height={64}
                    className="relative z-10 md:w-20 md:h-20 object-contain filter brightness-0 invert drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mb-6">
            <Badge className="bg-red-600 text-white font-bold px-6 py-3 text-lg md:text-xl border-2 border-red-500 shadow-xl shadow-red-500/30">
              <Target className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />
              {currentGameConfig.name}
              <Flame className="ml-2 md:ml-3 h-5 w-5 md:h-6 md:w-6 animate-pulse" />
            </Badge>
          </div>
          
          <div className="text-center">
            <Badge className="bg-gray-800 text-gray-300 font-bold px-4 py-2 text-sm border border-gray-600">
              <Users className="mr-2 h-4 w-4" />
              Max Team Size: {currentGameConfig.maxMembers} Players
            </Badge>
          </div>
        </div>

        {/* Team Creation Form */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <TeamDetailsForm 
              teamData={teamData}
              currentGameConfig={currentGameConfig}
              selectedGame={selectedGame}
              onTeamDataChange={setTeamData}
              onGameSpecificChange={updateGameSpecificField}
            />

            <MemberInvitations 
              inviteEmails={inviteEmails}
              currentGameConfig={currentGameConfig}
              onAddInvite={addInviteField}
              onRemoveInvite={removeInviteField}
              onUpdateInvite={updateInviteEmail}
            />
          </div>

          {/* Create Team Button */}
          <div className="flex justify-center mt-8 md:mt-12">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-red-600/30 to-red-800/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <PrimaryButton 
                onClick={handleCreateTeam}
                disabled={!teamData.name.trim() || isCreating}
                size="lg" 
                className="relative px-8 py-4 md:px-12 md:py-6 text-lg md:text-xl border-4"
              >
                {isCreating ? (
                  <>
                    <Brain className="mr-3 h-6 w-6 animate-pulse" />
                    <span>FORGING EMPIRE...</span>
                  </>
                ) : (
                  <>
                    <Crown className="mr-3 h-6 w-6" />
                    <span>CREATE TEAM</span>
                    <Flame className="ml-3 h-6 w-6 animate-pulse" />
                  </>
                )}
              </PrimaryButton>
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-12 md:mt-16 text-center">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Crown className="w-4 h-4 text-red-500" />
              <span className="font-bold">Team Leadership</span>
            </div>
            <div className="hidden sm:block w-1 h-4 bg-red-500/30"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <Brain className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="font-bold">AI-Powered Matching</span>
            </div>
            <div className="hidden sm:block w-1 h-4 bg-red-500/30"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <CheckCircle className="w-4 h-4 text-red-500" />
              <span className="font-bold">Verified Members</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}