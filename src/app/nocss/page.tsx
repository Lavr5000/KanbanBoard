// No CSS, no imports, pure HTML

export default function NoCssPage() {
  return (
    <html>
      <body style={{ margin: 0, padding: 0, background: '#000' }}>
        <div style={{ padding: '20px', color: '#0f0', fontFamily: 'monospace' }}>
          <h1>No CSS Test Page</h1>
          <p>If you see this, Next.js works WITHOUT any CSS or imports.</p>
          <p>Time: {new Date().toISOString()}</p>
        </div>
      </body>
    </html>
  )
}
