"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { CITIES } from "@/lib/catalog"

function fail(path: string, message: string, extra = ""): never {
  redirect(`${path}?error=${encodeURIComponent(message)}${extra}`)
}

// Solo rutas internas, para evitar redirecciones abiertas
function safeNext(value: FormDataEntryValue | null) {
  const next = String(value ?? "")
  return next.startsWith("/") && !next.startsWith("//") ? next : "/panel"
}

// URL pública de la web: la variable si existe, si no el dominio de la petición
function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  const h = headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.somoskaino.org"
  const proto = h.get("x-forwarded-proto") ?? "https"
  return `${proto}://${host}`
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const next = safeNext(formData.get("next"))

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) fail("/login", "Correo o contraseña incorrectos")

  redirect(next)
}

export async function signUp(formData: FormData) {
  const role = formData.get("role") === "profesional" ? "profesional" : "cliente"
  const fullName = String(formData.get("full_name") ?? "").trim()
  const phone = String(formData.get("phone") ?? "").replace(/\D/g, "")
  const city = String(formData.get("city") ?? "")
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const back = `&rol=${role}`

  if (fullName.length < 3) fail("/registro", "Escribe tu nombre completo", back)
  if (!/^1?(809|829|849)\d{7}$/.test(phone)) fail("/registro", "Escribe un teléfono dominicano válido (809, 829 u 849)", back)
  if (!CITIES.includes(city)) fail("/registro", "Elige tu ciudad", back)
  if (password.length < 8) fail("/registro", "La contraseña debe tener al menos 8 caracteres", back)

  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, full_name: fullName, phone, city },
      // El enlace del correo vuelve a nuestra web (no a localhost) y deja la sesión iniciada
      emailRedirectTo: `${siteUrl()}/auth/callback?next=${role === "profesional" ? "/perfil?bienvenida=1" : "/panel"}`,
    },
  })
  if (error) fail("/registro", error.message, back)

  // Si Supabase pide confirmar el correo, no hay sesión todavía
  if (!data.session) {
    redirect(`/login?ok=${encodeURIComponent("Te enviamos un correo para confirmar tu cuenta")}`)
  }
  redirect(role === "profesional" ? "/perfil?bienvenida=1" : "/panel")
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/")
}
