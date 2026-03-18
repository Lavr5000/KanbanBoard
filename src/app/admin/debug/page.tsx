'use client'

import { useEffect, useState } from 'react'
import { AuthDebug } from '@/app/admin/debug/AuthDebug'

export default function AdminDebugPage() {
  const [status, setStatus] = useState<{
    step: string
    data?: any
    error?: string
  }>({ step: 'Initializing...' })

  useEffect(() => {
    async function debugAdminAccess() {
      try {
        setStatus({ step: '1. Checking auth session...' })
        const res = await fetch('/api/auth/session')
        const { user } = await res.json()

        if (!user) {
          setStatus({ step: '2. No session found', error: 'Please login first' })
          return
        }

        setStatus({
          step: '2. Session found',
          data: {
            userId: user.id,
            email: user.email
          }
        })

        setStatus({
          step: '3. User info from session',
          data: user
        })

        setStatus({
          step: '4. Debug page loaded (admin check requires server API routes)',
          data: { userId: user.id, email: user.email }
        })

      } catch (error: any) {
        setStatus({
          step: 'Unexpected Error',
          error: error.message
        })
      }
    }

    debugAdminAccess()
  }, [])

  return (
    <div className="min-h-screen bg-[#121218] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Access Debug</h1>

        <div className="bg-[#1a1a20] rounded-xl p-6 border border-gray-800 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Diagnostic Steps</h2>
          <div className="space-y-2">
            <div className={`p-3 rounded-lg ${
              status.step.includes('4.') ? 'bg-green-500/20 text-green-400' :
              status.error ? 'bg-red-500/20 text-red-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              <p className="font-mono text-sm">{status.step}</p>
            </div>

            {status.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 font-semibold">Error:</p>
                <p className="text-red-300 text-sm font-mono mt-1">{status.error}</p>
              </div>
            )}

            {status.data && (
              <div className="p-3 bg-gray-800 rounded-lg">
                <p className="text-gray-400 font-semibold mb-2">Data:</p>
                <pre className="text-xs text-green-400 overflow-auto">
                  {JSON.stringify(status.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <AuthDebug />
      </div>
    </div>
  )
}
