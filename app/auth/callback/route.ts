// Destino del enlace de confirmación de correo: canjea el código por una sesión
import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const nextParam = searchParams.get("next") ?? "/panel"
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/panel"

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  const msg = encodeURIComponent("Tu correo está confirmado. Ya puedes entrar.")
  return NextResponse.redirect(`${origin}/login?ok=${msg}`)
}
