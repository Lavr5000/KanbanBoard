'use client'

import { useEffect, useState } from 'react'

export function AuthDebug() {
  const [testResults, setTestResults] = useState<any[]>([])

  const addResult = (test: string, success: boolean, data?: any, error?: any) => {
    setTestResults(prev => [...prev, { test, success, data, error, timestamp: new Date().toISOString() }])
  }

  const runTests = async () => {
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

    // Test 2: Get session via API
    try {
      const res = await fetch('/api/auth/session')
      const { user } = await res.json()
      addResult('Get Session (via /api/auth/session)', res.ok, { hasUser: !!user, userId: user?.id })
    } catch (e: any) {
      addResult('Get Session (via /api/auth/session)', false, null, e.message)
    }

    // Test 3: Test analytics track endpoint
    try {
      const res = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'debug_test', properties: { test: true } }),
      })
      const data = await res.json()
      addResult('Analytics Track API', res.ok, data)
    } catch (e: any) {
      addResult('Analytics Track API', false, null, e.message)
    }

    // Test 4: Test feedback endpoint (no file)
    try {
      const formData = new FormData()
      formData.append('category', 'other')
      formData.append('content', 'Debug test')
      const res = await fetch('/api/feedback', { method: 'POST', body: formData })
      const data = await res.json()
      addResult('Feedback API', res.ok, data)
    } catch (e: any) {
      addResult('Feedback API', false, null, e.message)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <div className="bg-[#1a1a20] rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Auth & API Tests</h2>
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
                    <span className="text-green-500">&#10003;</span>
                  ) : (
                    <span className="text-red-500">&#10007;</span>
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
