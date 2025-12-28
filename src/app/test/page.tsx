// Force dynamic rendering - don't prerender at build time
export const dynamic = 'force-dynamic';

export default function TestPage() {
  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>✅ Test Page Works!</h1>
      <p>If you can see this, Next.js is working correctly.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  )
}
