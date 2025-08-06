/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PrimaryButton } from '@/components/ui/primary-button'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { AccentButton } from '@/components/ui/accent-button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, Brain, Target, Plus, Crown, Flame, Users, Shield, Upload, LogOut, Gamepad2
} from 'lucide-react'
import { getUserByClerkId, createTeam, canUserCreateTeamForGame, uploadTeamLogo } from '@/lib/supabase'
import { gameConfigs } from '@/lib/game-configs'

interface TeamFormData {
  name: string
  description: string
  game: string
  region: string
  rank_requirement: string
  max_members: number
  practice_schedule: string
  logo_file?: File
}

function CreateTeamContent() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameParam = searchParams.get('game')
  
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [canCreateTeam, setCanCreateTeam] = useState(true)
  
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    game: gameParam || 'valorant',
    region: '',
    rank_requirement: '',
    max_members: 5,
    practice_schedule: ''
  })

  const regions = ['NA', 'EU', 'ASIA', 'OCE', 'SA']

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
        
        setSelectedGames(games)
        
        if (gameParam && games.includes(gameParam)) {
          setFormData(prev => ({ ...prev, game: gameParam }))
        } else {
          setFormData(prev => ({ ...prev, game: games[0] }))
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error checking user:', error)
        router.push('/game-selection')
      }
    }

    checkUser()
  }, [user, router, gameParam])

  useEffect(() => {
    const checkTeamCreationLimit = async () => {
      if (!user || !formData.game) return
      
      try {
        const canCreate = await canUserCreateTeamForGame(user.id, formData.game)
        setCanCreateTeam(canCreate)
      } catch (error) {
        console.error('Error checking team creation limit:', error)
        setCanCreateTeam(true)
      }
    }

    checkTeamCreationLimit()
  }, [user, formData.game])

  const handleInputChange = (field: keyof TeamFormData, value: string | number | File) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      handleInputChange('logo_file', file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!formData.name.trim()) {
      alert('Please enter a team name')
      return
    }

    if (!formData.description.trim()) {
      alert('Please enter a team description')
      return
    }

    if (!formData.region) {
      alert('Please select a region')
      return
    }

    if (!canCreateTeam) {
      alert('You have reached the maximum number of teams for this game (3 teams)')
      return
    }

    setIsCreating(true)
    
    try {
      let logoUrl = ''
      
      if (formData.logo_file) {
        logoUrl = await uploadTeamLogo(formData.logo_file, `temp-${Date.now()}`)
      }

      const teamData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        game: formData.game,
        region: formData.region,
        rank_requirement: formData.rank_requirement || undefined,
        max_members: formData.max_members,
        practice_schedule: formData.practice_schedule || undefined,
        logo_url: logoUrl || undefined,
        owner_clerk_id: user.id
      }

      const newTeam = await createTeam(teamData)
      
      alert(`Team "${newTeam.name}" created successfully! You can now manage your team and invite players.`)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error creating team:', error)
      alert(error.message || 'Failed to create team. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const currentGameConfig = gameConfigs[formData.game as keyof typeof gameConfigs] || gameConfigs.valorant

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
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 md:grid-cols-12 gap-2 md:gap-4 h-full">
          {Array.from({ length: 96 }).map((_, i) => (
            <div key={i} className="border border-red-500/20"></div>
          ))}
        </div>
      </div>

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
              <p className="text-white font-bold text-xs md:text-sm">{user?.username || user?.firstName || 'Commander'}</p>
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
        <div className="text-center mb-12 md:mb-16">
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="relative">
              <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 border-4 border-red-500/30 rounded-3xl animate-spin-slow"></div>
              <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl flex items-center justify-center">
                <Plus className="w-10 h-10 md:w-12 md:h-12 text-white" />
                <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-6 h-6 md:w-8 md:h-8 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                  <Crown className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-3 md:mb-4 relative px-4">
            <span className="relative">
              BUILD YOUR SQUAD
              <div className="absolute inset-0 bg-red-500/10 blur-xl animate-pulse"></div>
            </span>
          </h1>
          <p className="text-gray-300 font-medium text-base md:text-lg max-w-2xl mx-auto px-4">
            Create your elite gaming team with AI-powered tools. Build the perfect squad for competitive domination.
          </p>
        </div>

        {selectedGames.length > 1 && (
          <div className="mb-8 md:mb-12 max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center flex items-center justify-center gap-2">
              <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
              SELECT BATTLEFIELD
            </h2>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {selectedGames.map((gameId) => {
                const gameConfig = gameConfigs[gameId as keyof typeof gameConfigs]
                if (!gameConfig) return null
                
                return (
                  <button
                    key={gameId}
                    onClick={() => handleInputChange('game', gameId)}
                    className={`group relative flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-3 rounded-xl border-2 transition-all duration-300 ${
                      formData.game === gameId
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

        <div className="mb-8 md:mb-12">
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
          
          <div className="text-center mb-8">
            <Badge className="bg-red-600 text-white font-bold px-6 py-3 text-lg md:text-xl border-2 border-red-500 shadow-xl shadow-red-500/30">
              <Target className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />
              {currentGameConfig.name}
              <Flame className="ml-2 md:ml-3 h-5 w-5 md:h-6 md:w-6 animate-pulse" />
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-br from-gray-900/90 to-black/90 border border-red-500/30">
            <CardHeader>
              <CardTitle className="text-white text-2xl font-bold flex items-center gap-2">
                <Crown className="w-6 h-6 text-red-500" />
                TEAM FORMATION
              </CardTitle>
              <CardDescription className="text-gray-400">
                Configure your team settings and prepare for battle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm font-bold mb-2 block">TEAM NAME *</label>
                  <Input
                    type="text"
                    placeholder="Enter your team name..."
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-gray-800/50 border-red-500/30 text-white placeholder:text-gray-500"
                    maxLength={50}
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-bold mb-2 block">TEAM DESCRIPTION *</label>
                  <Textarea
                    placeholder="Describe your team's goals, playstyle, and what you're looking for in teammates..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-gray-800/50 border-red-500/30 text-white placeholder:text-gray-500 min-h-[100px]"
                    maxLength={500}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-300 text-sm font-bold mb-2 block">REGION *</label>
                    <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                      <SelectTrigger className="bg-gray-800/50 border-red-500/30 text-white">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map(region => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm font-bold mb-2 block">MAX MEMBERS</label>
                    <Select 
                      value={formData.max_members.toString()} 
                      onValueChange={(value) => handleInputChange('max_members', parseInt(value))}
                    >
                      <SelectTrigger className="bg-gray-800/50 border-red-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} Players</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-bold mb-2 block">RANK REQUIREMENT (OPTIONAL)</label>
                  <Select value={formData.rank_requirement} onValueChange={(value) => handleInputChange('rank_requirement', value)}>
                    <SelectTrigger className="bg-gray-800/50 border-red-500/30 text-white">
                      <SelectValue placeholder="Select minimum rank" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentGameConfig.ranks?.map(rank => (
                        <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-bold mb-2 block">PRACTICE SCHEDULE (OPTIONAL)</label>
                  <Input
                    type="text"
                    placeholder="e.g., Weekdays 7-10 PM EST, Weekends flexible"
                    value={formData.practice_schedule}
                    onChange={(e) => handleInputChange('practice_schedule', e.target.value)}
                    className="bg-gray-800/50 border-red-500/30 text-white placeholder:text-gray-500"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-bold mb-2 block">TEAM LOGO (OPTIONAL)</label>
                  <div className="space-y-3">
                    {logoPreview && (
                      <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-red-500/30">
                          <Image
                            src={logoPreview}
                            alt="Logo preview"
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-red-500/30 border-dashed rounded-lg cursor-pointer bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-2 pb-3">
                          <Upload className="w-6 h-6 text-gray-400 mb-1" />
                          <p className="text-xs text-gray-400">Click to upload image (max 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleLogoUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {!canCreateTeam && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-400">
                    <Shield className="w-5 h-5" />
                    <span className="font-bold">Team Limit Reached</span>
                  </div>
                  <p className="text-red-300 text-sm mt-1">
                    You have reached the maximum number of teams for {currentGameConfig.name} (3 teams). 
                    Consider managing your existing teams or contact support for increased limits.
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <SecondaryButton 
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1"
                >
                  CANCEL
                </SecondaryButton>
                
                <PrimaryButton 
                  type="submit" 
                  disabled={isCreating || !canCreateTeam}
                  className="flex-1"
                >
                  {isCreating ? (
                    <>
                      <Brain className="mr-2 h-4 w-4 animate-pulse" />
                      CREATING...
                    </>
                  ) : (
                    <>
                      <Crown className="mr-2 h-4 w-4" />
                      CREATE TEAM
                    </>
                  )}
                </PrimaryButton>
              </div>
            </CardContent>
          </Card>
        </form>

        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Crown className="w-4 h-4 text-red-500" />
              <span className="font-bold">Full Team Management</span>
            </div>
            <div className="hidden sm:block w-1 h-4 bg-red-500/30"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-4 h-4 text-red-500" />
              <span className="font-bold">Smart Player Matching</span>
            </div>
            <div className="hidden sm:block w-1 h-4 bg-red-500/30"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <Brain className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="font-bold">AI-Enhanced Recruitment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CreateTeamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <p className="text-white font-bold">Loading Battle Station...</p>
        </div>
      </div>
    }>
      <CreateTeamContent />
    </Suspense>
  )
}