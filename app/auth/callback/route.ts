import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const token = requestUrl.searchParams.get('token') // Some Supabase versions use 'token'
  const type = requestUrl.searchParams.get('type')
  const error_description = requestUrl.searchParams.get('error_description')

  // Support multiple redirect param names
  const next =
    requestUrl.searchParams.get('next') ||
    requestUrl.searchParams.get('redirect_to') ||
    '/dashboard'

  // If Supabase returned an error, redirect to login with that error
  if (error_description) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error_description)}`, requestUrl.origin)
    )
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )

  // Handle PKCE code exchange (OAuth and magic link)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // Handle email confirmation via token_hash or token (Supabase email verification)
  const verificationToken = token_hash || token
  if (verificationToken && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: verificationToken,
      type: type as 'signup' | 'email' | 'recovery' | 'invite',
    })
    if (!error) {
      // Successfully verified - redirect to login with success message
      return NextResponse.redirect(new URL('/login?verified=true', requestUrl.origin))
    }
  }

  // If no valid params, check if user is already authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }

  // Return to login page - user needs to log in after verification
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
