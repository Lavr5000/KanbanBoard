'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('[AuthProvider] Starting initialization...')

    // Immediately set loading to false to prevent hanging
    const timer = setTimeout(() => {
      console.log('[AuthProvider] Loading complete (timeout fallback)')
      setLoading(false)
    }, 100)

    // Try to load Supabase auth dynamically
    import('@/lib/supabase/client').then(({ createClient }) => {
      console.log('[AuthProvider] Supabase client loaded')

      clearTimeout(timer)

      const supabase = createClient()

      // Get session with timeout
      supabase.auth.getSession()
        .then(({ data: { session } }) => {
          console.log('[AuthProvider] Session loaded:', session?.user?.id || 'no user')
          setUser(session?.user ?? null)
          setLoading(false)
        })
        .catch((error) => {
          console.error('[AuthProvider] Error getting session:', error)
          setLoading(false)
        })

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log('[AuthProvider] Auth state changed:', _event, session?.user?.id)
        setUser(session?.user ?? null)
      })

      return () => subscription.unsubscribe()
    })
    .catch((error) => {
      console.error('[AuthProvider] Error loading Supabase:', error)
      clearTimeout(timer)
      setLoading(false)
    })
  }, [])

  const signOut = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
