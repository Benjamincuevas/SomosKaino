// Cliente de Supabase para el SERVIDOR (Server Components, API Routes)
// Necesita las cookies para mantener la sesión del usuario

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()            { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // En Server Components de solo lectura esto falla silenciosamente
            // El middleware se encarga de refrescar la sesión
          }
        },
      },
    }
  )
}
