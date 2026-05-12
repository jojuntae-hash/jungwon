import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase_new/middleware'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // 관리자 경로 및 보호가 필요한 경로 정의
  const isAdminRoute = pathname.startsWith('/settings') || pathname.startsWith('/record') || pathname.startsWith('/edit')
  
  // 1. 관리자 경로인 경우에만 세션 업데이트 및 인증 체크 수행
  // 일반 페이지(홈, 앨범 등)에서는 수파베이스 인증 서버 호출을 건너뛰어 속도 향상
  if (isAdminRoute) {
    const response = await updateSession(request)
    
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
      // 로그인 안됨 -> 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (!isAdmin) {
      // 로그인되었으나 관리자 아님 -> 홈으로 리다이렉트
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    return response
  }

  // 일반 페이지는 바로 통과 (지연 시간 최소화)
  return NextResponse.next()
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
