"use client"

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { LogOut } from 'lucide-react'

export function UserMenu() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-24 h-4 bg-gray-800 rounded animate-pulse" />
        <div className="w-10 h-10 bg-gray-800 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const fullName = user.user_metadata?.full_name || 'Пользователь'
  const email = user.email || ''
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm text-white font-medium">{fullName}</p>
        <p className="text-[10px] text-gray-500">{email}</p>
      </div>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 border border-white/10 flex items-center justify-center text-white font-bold">
        {initials}
      </div>
      <button
        onClick={handleLogout}
        className="p-2 rounded-lg hover:bg-gray-800 transition-colors group"
        title="Выйти"
      >
        <LogOut size={18} className="text-gray-400 group-hover:text-white" />
      </button>
    </div>
  )
}
