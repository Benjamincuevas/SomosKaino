// Refresca la sesión de Supabase y protege las rutas privadas

import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const PRIVATE_PREFIXES = ["/panel", "/solicitar", "/solicitudes", "/perfil", "/admin"]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  if (!user && PRIVATE_PREFIXES.some(p => path.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.search = `?next=${encodeURIComponent(path)}`
    return NextResponse.redirect(url)
  }

  if (user && (path === "/login" || path === "/registro")) {
    const url = request.nextUrl.clone()
    url.pathname = "/panel"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
