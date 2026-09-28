import Link from "next/link"
import { requireProfile, type Profile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { formatRD } from "@/lib/catalog"
import RequestCard, { type RequestSummary } from "@/components/RequestCard"
import FormMessage from "@/components/FormMessage"

const REQUEST_FIELDS = "id, category, title, city, sector, urgency, budget, status, created_at"

export default async function PanelPage({ searchParams }: { searchParams: { todas?: string; error?: string } }) {
  const profile = await requireProfile()
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Hola, {profile.full_name.split(" ")[0]} 👋</h1>
      <div className="mt-4"><FormMessage error={searchParams.error} /></div>
      {profile.role === "profesional"
        ? <ProPanel profile={profile} allCities={searchParams.todas === "1"} />
        : <ClientPanel profile={profile} />}
    </div>
  )
}

async function ClientPanel({ profile }: { profile: Profile }) {
  const supabase = createClient()
  const { data } = await supabase
    .from("service_requests")
    .select(`${REQUEST_FIELDS}, quotes!quotes_request_id_fkey(count)`)
    .eq("client_id", profile.id)
    .order("created_at", { ascending: false })
  const requests = (data ?? []) as (RequestSummary & { quotes: { count: number }[] })[]

  return (
    <>
      <div className="mt-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Mis solicitudes</h2>
        <Link href="/solicitar" className="btn-accent">+ Pedir un servicio</Link>
      </div>
      {requests.length === 0 ? (
        <div className="card mt-4 text-center text-gray-600">
          Todavía no has pedido ningún servicio. <Link href="/solicitar" className="font-semibold text-brand-600">Pide el primero</Link>.
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {requests.map(r => {
            const n = r.quotes?.[0]?.count ?? 0
            return (
              <RequestCard key={r.id} r={r}
                footer={r.status === "abierta"
                  ? <span className="font-medium text-brand-700">{n === 0 ? "Esperando cotizaciones…" : `${n} cotización${n === 1 ? "" : "es"} recibida${n === 1 ? "" : "s"} →`}</span>
                  : undefined} />
            )
          })}
        </div>
      )}
    </>
  )
}

async function ProPanel({ profile, allCities }: { profile: Profile; allCities: boolean }) {
  const supabase = createClient()
  const { data: pro } = await supabase
    .from("professional_profiles")
    .select("categories, cities, verified, rating_avg, rating_count, jobs_done")
    .eq("id", profile.id)
    .single()

  if (!pro || pro.categories.length === 0) {
    return (
      <div className="card mt-4 bg-amber-50">
        <h2 className="font-semibold">Completa tu perfil para empezar a recibir trabajos</h2>
        <p className="mt-1 text-sm text-gray-600">Dinos qué servicios ofreces y en qué ciudades trabajas.</p>
        <Link href="/perfil" className="btn-primary mt-4">Completar perfil</Link>
      </div>
    )
  }

  let openQuery = supabase
    .from("service_requests")
    .select(REQUEST_FIELDS)
    .eq("status", "abierta")
    .in("category", pro.categories)
    .neq("client_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50)
  if (!allCities && pro.cities.length > 0) openQuery = openQuery.in("city", pro.cities)

  const [{ data: open }, { data: myQuotes }] = await Promise.all([
    openQuery,
    supabase
      .from("quotes")
      .select(`id, price, status, request_id, service_requests!quotes_request_id_fkey(${REQUEST_FIELDS})`)
      .eq("pro_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ])

  const quoted = new Set((myQuotes ?? []).map(q => q.request_id))
  const available = ((open ?? []) as RequestSummary[]).filter(r => !quoted.has(r.id))
  const quotes = (myQuotes ?? []) as unknown as { id: string; price: number; status: string; service_requests: RequestSummary }[]

  const QUOTE_STATUS: Record<string, string> = {
    pendiente: "⏳ Esperando respuesta del cliente",
    aceptada: "✅ ¡Te eligieron! Escríbele al cliente",
    rechazada: "El cliente eligió otra opción",
  }

  return (
    <>
      <div className="mt-2 grid grid-cols-3 gap-3 text-center">
        <div className="card !p-3"><p className="text-2xl font-bold">{pro.jobs_done}</p><p className="text-xs text-gray-500">Trabajos</p></div>
        <div className="card !p-3"><p className="text-2xl font-bold">{pro.rating_count ? Number(pro.rating_avg).toFixed(1) : "—"}</p><p className="text-xs text-gray-500">Calificación</p></div>
        <div className="card !p-3"><p className="text-2xl font-bold">{pro.verified ? "✔" : "—"}</p><p className="text-xs text-gray-500">{pro.verified ? "Verificado" : "Sin verificar"}</p></div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Trabajos disponibles ({available.length})</h2>
        <Link href={allCities ? "/panel" : "/panel?todas=1"} className="text-sm font-medium text-brand-600">
          {allCities ? "Ver solo mis ciudades" : "Ver todas las ciudades"}
        </Link>
      </div>
      {available.length === 0 ? (
        <div className="card mt-4 text-center text-gray-600">No hay solicitudes nuevas de tus servicios ahora mismo. Vuelve pronto.</div>
      ) : (
        <div className="mt-4 grid gap-3">
          {available.map(r => <RequestCard key={r.id} r={r} footer={<span className="font-medium text-brand-700">Enviar cotización →</span>} />)}
        </div>
      )}

      <h2 className="mt-10 text-lg font-semibold">Mis cotizaciones</h2>
      {quotes.length === 0 ? (
        <div className="card mt-4 text-center text-gray-600">Aún no has enviado cotizaciones.</div>
      ) : (
        <div className="mt-4 grid gap-3">
          {quotes.filter(q => q.service_requests).map(q => (
            <RequestCard key={q.id} r={q.service_requests}
              footer={<span>{formatRD(q.price)} · {QUOTE_STATUS[q.status] ?? q.status}</span>} />
          ))}
        </div>
      )}
    </>
  )
}
