import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Allow auth callback to proceed without checks (needed for OAuth/magic links)
  if (request.nextUrl.pathname === '/auth/callback') {
    return supabaseResponse
  }

  // Check if we have a valid session token before making API calls
  // This reduces CPU usage by avoiding unnecessary Supabase calls
  // Supabase SSR uses cookie name format: sb-<project-ref>-auth-token
  const authCookie = request.cookies
    .getAll()
    .find((cookie) => cookie.name.match(/^sb-.*-auth-token$/))

  const hasAuthToken = !!authCookie?.value

  // Protected routes
  const protectedPaths = ['/dashboard', '/groups']
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Quick check: if protected path and no tokens, redirect immediately
  if (isProtectedPath && !hasAuthToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Auth pages check
  const authPaths = ['/login', '/register']
  const isAuthPath = authPaths.some((path) => request.nextUrl.pathname === path)

  // Quick check: if auth path and has tokens, redirect to dashboard
  if (isAuthPath && hasAuthToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Only create Supabase client if we need to validate/refresh the session
  // This happens when we have tokens but need to ensure they're valid
  if (hasAuthToken) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

    // Only verify user for protected paths to reduce API calls
    if (isProtectedPath) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  // Only run middleware on routes that actually need authentication
  // This significantly reduces CPU usage on Cloudflare Workers
  matcher: ['/dashboard/:path*', '/groups/:path*', '/login', '/register', '/auth/callback'],
}
