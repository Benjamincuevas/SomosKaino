"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/auth"
import { CATEGORIES, CITIES } from "@/lib/catalog"

const CATEGORY_SLUGS = CATEGORIES.map(c => c.slug)

function fail(path: string, message: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`)
}

function toInt(value: FormDataEntryValue | null) {
  const n = parseInt(String(value ?? "").replace(/[^\d]/g, ""), 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

// ─── Cliente ─────────────────────────────────────────────────────────────────

export async function createRequest(formData: FormData) {
  const profile = await requireProfile()
  if (profile.role !== "cliente") fail("/panel", "Solo los clientes pueden pedir servicios")

  const category = String(formData.get("category") ?? "")
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const city = String(formData.get("city") ?? "")
  const sector = String(formData.get("sector") ?? "").trim() || null
  const urgency = String(formData.get("urgency") ?? "flexible")
  const budget = toInt(formData.get("budget"))
  const back = `/solicitar?categoria=${encodeURIComponent(category)}`

  if (!CATEGORY_SLUGS.includes(category)) fail(back, "Elige el tipo de servicio")
  if (title.length < 5) fail(back, "El título debe tener al menos 5 letras")
  if (description.length < 10) fail(back, "Describe un poco más el trabajo")
  if (!CITIES.includes(city)) fail(back, "Elige la ciudad")
  if (!["urgente", "esta_semana", "flexible"].includes(urgency)) fail(back, "Elige la urgencia")

  const supabase = createClient()
  const { data, error } = await supabase
    .from("service_requests")
    .insert({ client_id: profile.id, category, title, description, city, sector, urgency, budget })
    .select("id")
    .single()
  if (error || !data) fail(back, "No pudimos publicar tu solicitud. Intenta de nuevo.")

  redirect(`/solicitudes/${data.id}?ok=${encodeURIComponent("¡Listo! Los profesionales ya pueden ver tu solicitud.")}`)
}

async function callRpc(fn: "accept_quote" | "complete_request" | "cancel_request", arg: Record<string, string>, requestId: string, ok: string) {
  await requireProfile()
  const supabase = createClient()
  const { error } = await supabase.rpc(fn, arg)
  const path = `/solicitudes/${requestId}`
  if (error) fail(path, error.message)
  revalidatePath(path)
  redirect(`${path}?ok=${encodeURIComponent(ok)}`)
}

export async function acceptQuote(formData: FormData) {
  const quoteId = String(formData.get("quote_id"))
  const requestId = String(formData.get("request_id"))
  await callRpc("accept_quote", { p_quote: quoteId }, requestId, "Cotización aceptada. Ya puedes escribirle por WhatsApp.")
}

export async function completeRequest(formData: FormData) {
  const requestId = String(formData.get("request_id"))
  await callRpc("complete_request", { p_request: requestId }, requestId, "Trabajo marcado como completado. ¡Déjale una reseña!")
}

export async function cancelRequest(formData: FormData) {
  const requestId = String(formData.get("request_id"))
  await callRpc("cancel_request", { p_request: requestId }, requestId, "Solicitud cancelada.")
}

export async function leaveReview(formData: FormData) {
  const profile = await requireProfile()
  const requestId = String(formData.get("request_id"))
  const proId = String(formData.get("pro_id"))
  const rating = toInt(formData.get("rating"))
  const comment = String(formData.get("comment") ?? "").trim() || null
  const path = `/solicitudes/${requestId}`

  if (!rating || rating > 5) fail(path, "Elige de 1 a 5 estrellas")

  const supabase = createClient()
  const { error } = await supabase
    .from("reviews")
    .insert({ request_id: requestId, client_id: profile.id, pro_id: proId, rating, comment })
  if (error) fail(path, "No pudimos guardar la reseña")

  revalidatePath(path)
  redirect(`${path}?ok=${encodeURIComponent("¡Gracias por tu reseña!")}`)
}

// ─── Profesional ─────────────────────────────────────────────────────────────

export async function sendQuote(formData: FormData) {
  const profile = await requireProfile()
  const requestId = String(formData.get("request_id"))
  const path = `/solicitudes/${requestId}`
  if (profile.role !== "profesional") fail(path, "Solo los profesionales pueden cotizar")

  const price = toInt(formData.get("price"))
  const message = String(formData.get("message") ?? "").trim()
  const availableDate = String(formData.get("available_date") ?? "") || null

  if (!price) fail(path, "Escribe un precio válido")
  if (message.length < 5) fail(path, "Escribe un mensaje para el cliente")

  const supabase = createClient()
  const { error } = await supabase
    .from("quotes")
    .insert({ request_id: requestId, pro_id: profile.id, price, message, available_date: availableDate })
  if (error) {
    fail(path, error.code === "23505" ? "Ya enviaste una cotización para esta solicitud" : "No pudimos enviar la cotización")
  }

  revalidatePath(path)
  redirect(`${path}?ok=${encodeURIComponent("Cotización enviada. Te avisaremos si el cliente la acepta.")}`)
}

export async function updateProProfile(formData: FormData) {
  const profile = await requireProfile()
  if (profile.role !== "profesional") fail("/panel", "Esta sección es para profesionales")

  const bio = String(formData.get("bio") ?? "").trim() || null
  const categories = formData.getAll("categories").map(String).filter(c => CATEGORY_SLUGS.includes(c))
  const cities = formData.getAll("cities").map(String).filter(c => CITIES.includes(c))
  const yearsRaw = String(formData.get("years_experience") ?? "")
  const years = yearsRaw === "" ? null : Math.max(0, parseInt(yearsRaw, 10) || 0)

  if (categories.length === 0) fail("/perfil", "Elige al menos un servicio que ofreces")
  if (cities.length === 0) fail("/perfil", "Elige al menos una ciudad donde trabajas")

  const supabase = createClient()
  const { error } = await supabase
    .from("professional_profiles")
    .update({ bio, categories, cities, years_experience: years })
    .eq("id", profile.id)
  if (error) fail("/perfil", "No pudimos guardar tu perfil")

  revalidatePath("/perfil")
  redirect(`/perfil?ok=${encodeURIComponent("Perfil guardado. Ya verás las solicitudes de tus servicios en tu panel.")}`)
}
