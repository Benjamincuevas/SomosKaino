import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export type Profile = { id: string; role: "cliente" | "profesional" | "admin"; full_name: string; city: string | null }

// Usuario y perfil actuales, o null si no hay sesión
export async function getCurrentProfile() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, city")
    .eq("id", user.id)
    .single<Profile>()
  return profile
}

export async function requireProfile() {
  const profile = await getCurrentProfile()
  if (!profile) redirect("/login")
  return profile
}
