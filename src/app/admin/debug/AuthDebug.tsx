'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function AuthDebug() {
  const [testResults, setTestResults] = useState<any[]>([])

  const addResult = (test: string, success: boolean, data?: any, error?: any) => {
    setTestResults(prev => [...prev, { test, success, data, error, timestamp: new Date().toISOString() }])
  }

  const runTests = async () => {
    const supabase = createClient()
    setTestResults([])

    // Test 1: Environment variables
    addResult(
      'Environment Variables',
      !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    )

    // Test 2: Get session
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      addResult('Get Session', !error, { hasSession: !!session, userId: session?.user.id, error })
    } catch (e: any) {
      addResult('Get Session', false, null, e.message)
    }

    // Test 3: Get current user
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      addResult('Get User', !error, { hasUser: !!user, userId: user?.id, error })
    } catch (e: any) {
      addResult('Get User', false, null, e.message)
    }

    // Test 4: Check if user exists in public.users
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      addResult('User Profile in public.users', !error, { profile, error })
    } catch (e: any) {
      addResult('User Profile in public.users', false, null, e.message)
    }

    // Test 5: Test is_admin() function
    try {
      const { data, error } = await supabase.rpc('is_admin')
      addResult('is_admin() RPC function', !error, { isAdmin: data, error })
    } catch (e: any) {
      addResult('is_admin() RPC function', false, null, e.message)
    }

    // Test 6: Query all users (should fail for non-admin)
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, role')

      addResult('Query all users (requires admin)', !error, { count: users?.length, hasError: !!error, error })
    } catch (e: any) {
      addResult('Query all users (requires admin)', false, null, e.message)
    }

    // Test 7: Test analytics_events access (should fail for non-admin)
    try {
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .limit(1)

      addResult('Query analytics_events (requires admin)', !error, { hasData: !!events?.length, hasError: !!error, error })
    } catch (e: any) {
      addResult('Query analytics_events (requires admin)', false, null, e.message)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <div className="bg-[#1a1a20] rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Auth & Permissions Tests</h2>
        <button
          onClick={runTests}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
        >
          Run Tests Again
        </button>
      </div>

      <div className="space-y-2">
        {testResults.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              result.success
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <span className="text-green-500">✓</span>
                  ) : (
                    <span className="text-red-500">✗</span>
                  )}
                  <p className="text-white font-medium">{result.test}</p>
                </div>

                {result.data && (
                  <pre className="mt-2 text-xs text-gray-400 overflow-auto bg-black/30 p-2 rounded">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}

                {result.error && (
                  <p className="mt-2 text-sm text-red-400 font-mono">
                    {result.error}
                  </p>
                )}
              </div>

              <span className="text-xs text-gray-600 ml-4 whitespace-nowrap">
                {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {testResults.length === 0 && (
        <p className="text-gray-500 text-center py-8">Running tests...</p>
      )}
    </div>
  )
}
