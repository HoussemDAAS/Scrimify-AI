import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { PrimaryButton } from '@/components/ui/primary-button'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { 
  Bell, 
  BellDot, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  MessageSquare,
  ChevronDown
} from 'lucide-react'
import { useTeamNotifications } from '@/lib/useTeamNotifications'

interface NotificationDropdownProps {
  clerkId: string
}

export default function NotificationDropdown({ clerkId }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const { notifications, unreadCount, isLoading, handleRequest } = useTeamNotifications(clerkId)

  const handleAction = async (requestId: string, action: 'accept' | 'decline') => {
    setProcessingId(requestId)
    const result = await handleRequest(requestId, action)
    
    if (result.success) {
      // Success feedback could be added here
    } else {
      alert(`Failed to ${action} request: ${result.error}`)
    }
    setProcessingId(null)
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg px-3 py-2 hover:border-red-500/60 transition-all duration-300"
      >
        {unreadCount > 0 ? (
          <BellDot className="w-4 h-4 text-red-500" />
        ) : (
          <Bell className="w-4 h-4 text-gray-400" />
        )}
        
        {unreadCount > 0 && (
          <Badge className="bg-red-600 text-white text-xs px-1.5 py-0.5 min-w-[18px] h-4 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-red-500/20">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-sm">Team Join Requests</h3>
                {unreadCount > 0 && (
                  <Badge className="bg-red-600 text-white text-xs">
                    {unreadCount} pending
                  </Badge>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <Clock className="w-6 h-6 text-gray-400 animate-pulse mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center">
                  <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No pending requests</p>
                </div>
              ) : (
                <div className="divide-y divide-red-500/10">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-red-500/5 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs">
                            {notification.users.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white text-sm font-bold truncate">
                              {notification.users.username}
                            </p>
                            <Badge className="bg-blue-600/20 text-blue-400 text-xs border border-blue-500/30">
                              {notification.teams.name}
                            </Badge>
                          </div>
                          
                          {notification.message && (
                            <div className="mb-2 p-2 bg-gray-800/50 rounded text-xs">
                              <MessageSquare className="w-3 h-3 inline mr-1 text-blue-400" />
                              <span className="text-gray-300 italic">"{notification.message}"</span>
                            </div>
                          )}
                          
                          <div className="flex gap-1.5">
                            <PrimaryButton
                              size="sm"
                              className="text-xs px-2 py-1 h-6"
                              disabled={processingId === notification.id}
                              onClick={() => handleAction(notification.id, 'accept')}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Accept
                            </PrimaryButton>
                            
                            <SecondaryButton
                              size="sm"
                              className="text-xs px-2 py-1 h-6"
                              disabled={processingId === notification.id}
                              onClick={() => handleAction(notification.id, 'decline')}
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Decline
                            </SecondaryButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}