import React, { createContext, useContext, ReactNode } from 'react'

interface LayoutContextType {
  showNavbar: boolean
  setShowNavbar: (show: boolean) => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function useLayout() {
  const context = useContext(LayoutContext)
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}

interface LayoutProviderProps {
  children: ReactNode
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [showNavbar, setShowNavbar] = React.useState(true)

  return (
    <LayoutContext.Provider value={{ showNavbar, setShowNavbar }}>
      {children}
    </LayoutContext.Provider>
  )
}
