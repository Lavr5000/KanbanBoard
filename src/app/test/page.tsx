export default function TestPage() {
  return (
    <html>
      <body>
        <div style={{ padding: '50px', fontFamily: 'sans-serif', background: '#121218', minHeight: '100vh', color: '#fff' }}>
          <h1>✅ Test Page Works!</h1>
          <p>If you can see this, Next.js is working correctly.</p>
          <p>Current time: {new Date().toLocaleString()}</p>
          <p style={{ color: '#10b981' }}>This page has NO dependencies on AuthProvider or Supabase.</p>
        </div>
      </body>
    </html>
  )
}
