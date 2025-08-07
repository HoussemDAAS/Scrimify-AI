'use client'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TeamTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  membersCount: number
  requestsCount: number
}

export function TeamTabs({ activeTab, onTabChange, membersCount, requestsCount }: TeamTabsProps) {
  return (
    <div className="relative mb-8">
      <div className="absolute -inset-1 bg-gradient-to-r from-red-600/30 to-red-800/30 rounded-2xl blur-sm"></div>
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="relative grid w-full grid-cols-4 bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-red-500/30 rounded-xl p-2">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white text-gray-400 font-bold transition-all duration-300"
          >
            OVERVIEW
          </TabsTrigger>
          <TabsTrigger 
            value="members"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white text-gray-400 font-bold transition-all duration-300"
          >
            MEMBERS
            <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
              {membersCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="requests"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white text-gray-400 font-bold transition-all duration-300"
          >
            REQUESTS
            {requestsCount > 0 && (
              <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/30 text-xs animate-pulse">
                {requestsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="settings"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white text-gray-400 font-bold transition-all duration-300"
          >
            SETTINGS
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
