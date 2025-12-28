import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  console.log('🔍 [MIDDLEWARE] Starting middleware for:', request.nextUrl.pathname)
  console.log('🔍 [MIDDLEWARE] Environment check:', {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  })

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    console.log('🔍 [MIDDLEWARE] Supabase client created')

    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log('🔍 [MIDDLEWARE] Session check:', {
      hasSession: !!session,
      pathname: request.nextUrl.pathname,
    })

    // Redirect to login if not authenticated and trying to access protected routes
    if (!session && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/signup')) {
      console.log('🔍 [MIDDLEWARE] Redirecting to /login (no session)')
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Redirect to home if authenticated and trying to access auth pages
    if (session && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup'))) {
      console.log('🔍 [MIDDLEWARE] Redirecting to / (has session on auth page)')
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    const duration = Date.now() - startTime
    console.log('🔍 [MIDDLEWARE] Proceeding to:', request.nextUrl.pathname, `(${duration}ms)`)

    return supabaseResponse
  } catch (error) {
    console.error('❌ [MIDDLEWARE] Error:', error)
    return supabaseResponse
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
