import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Only apply to admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    console.log('[MIDDLEWARE] Admin route accessed:', req.nextUrl.pathname)

    // Skip middleware for static files and API routes
    if (
      req.nextUrl.pathname.includes('.') ||
      req.nextUrl.pathname.startsWith('/admin/api') ||
      req.nextUrl.pathname.startsWith('/api/admin')
    ) {
      return NextResponse.next()
    }

    try {
      const res = NextResponse.next()

      // Check environment variables
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('[MIDDLEWARE] Missing Supabase environment variables')
        return NextResponse.redirect(new URL('/?error=config', req.url))
      }

      // Create a Supabase client configured to use cookies
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return req.cookies.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              res.cookies.set({ name, value, ...options })
            },
            remove(name: string, options: any) {
              res.cookies.set({ name, value: '', ...options })
            },
          },
        }
      )

      // Check auth using getUser() for security
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError) {
        console.error('[MIDDLEWARE] Auth error:', authError)
        return NextResponse.redirect(new URL('/?error=auth', req.url))
      }

      if (!user) {
        console.log('[MIDDLEWARE] No user found, redirecting to login')
        return NextResponse.redirect(new URL('/login', req.url))
      }

      console.log('[MIDDLEWARE] User authenticated:', user.id)

      // Check if user has admin role using RPC function
      const { data: isAdmin, error: roleError } = await supabase.rpc('is_admin')

      if (roleError) {
        console.error('[MIDDLEWARE] Role check error:', roleError)
        return NextResponse.redirect(new URL('/?error=role_check', req.url))
      }

      console.log('[MIDDLEWARE] Is admin:', isAdmin)

      if (!isAdmin) {
        console.log('[MIDDLEWARE] User is not admin, redirecting to home')
        return NextResponse.redirect(new URL('/', req.url))
      }

      console.log('[MIDDLEWARE] User is admin, allowing access')
      return res
    } catch (error) {
      console.error('[MIDDLEWARE] Unexpected error:', error)
      return NextResponse.redirect(new URL('/?error=unknown', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
