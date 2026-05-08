import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase_new/middleware'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // 1. Update session for Supabase SSR (handles cookie refresh)
  const response = await updateSession(request)

  // 2. Route protection logic
  const pathname = request.nextUrl.pathname
  
  // Admin routes protection
  const isAdminRoute = pathname.startsWith('/settings') || pathname.startsWith('/record') || pathname.startsWith('/edit')
  
  if (isAdminRoute) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const isAdmin = user?.email === 'jojuntae@naver.com'

    if (!user) {
      // Not logged in -> Redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (!isAdmin) {
      // Logged in but not admin -> Redirect to home
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
