import Link from "next/link"
import { notFound } from "next/navigation"
import { requireProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { STATUS_LABELS, URGENCY_LABELS, categoryBySlug, formatRD, whatsappLink } from "@/lib/catalog"
import { acceptQuote, cancelRequest, completeRequest, leaveReview, sendQuote } from "@/app/actions"
import FormMessage from "@/components/FormMessage"
import Stars from "@/components/Stars"

type Quote = {
  id: string
  pro_id: string
  price: number
  message: string
  available_date: string | null
  status: string
  created_at: string
  professional_profiles: {
    verified: boolean
    rating_avg: number
    rating_count: number
    jobs_done: number
    profiles: { full_name: string } | null
  } | null
}

export default async function SolicitudPage({ params, searchParams }: {
  params: { id: string }
  searchParams: { error?: string; ok?: string }
}) {
  const profile = await requireProfile()
  const supabase = createClient()

  const { data: request } = await supabase
    .from("service_requests")
    .select("id, client_id, category, title, description, city, sector, urgency, budget, status, accepted_quote_id, photos, created_at")
    .eq("id", params.id)
    .maybeSingle()
  if (!request) notFound()

  const isOwner = request.client_id === profile.id

  // Enlaces temporales a las fotos (el bucket es privado)
  let photoUrls: string[] = []
  if (request.photos?.length) {
    const { data } = await supabase.storage.from("solicitudes").createSignedUrls(request.photos, 60 * 60)
    photoUrls = (data ?? []).map(d => d.signedUrl).filter((u): u is string => Boolean(u))
  }
  const { data: quotesData } = await supabase
    .from("quotes")
    .select("id, pro_id, price, message, available_date, status, created_at, professional_profiles!quotes_pro_id_fkey(verified, rating_avg, rating_count, jobs_done, profiles(full_name))")
    .eq("request_id", request.id)
    .order("price", { ascending: true })
  const quotes = (quotesData ?? []) as unknown as Quote[]
  const accepted = quotes.find(q => q.id === request.accepted_quote_id)
  const myQuote = quotes.find(q => q.pro_id === profile.id)

  // Teléfono de la otra parte (RLS solo lo devuelve si hay un trabajo aceptado entre ambos)
  const counterpartId = isOwner ? accepted?.pro_id : myQuote?.status === "aceptada" ? request.client_id : undefined
  let counterpartPhone: string | null = null
  if (counterpartId) {
    const { data } = await supabase.from("contacts").select("phone").eq("id", counterpartId).maybeSingle()
    counterpartPhone = data?.phone || null
  }

  let hasReview = false
  if (isOwner && request.status === "completada") {
    const { count } = await supabase.from("reviews").select("id", { count: "exact", head: true }).eq("request_id", request.id)
    hasReview = (count ?? 0) > 0
  }

  const cat = categoryBySlug(request.category)
  const status = STATUS_LABELS[request.status]
  const waText = `Hola, te escribo por la solicitud "${request.title}" en ServiNet.`

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/panel" className="text-sm text-brand-600">← Volver a mi panel</Link>

      <div className="card mt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">{cat?.icon} {cat?.name ?? request.category}</p>
            <h1 className="mt-1 text-2xl font-bold">{request.title}</h1>
          </div>
          {status && <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>}
        </div>
        <p className="mt-4 whitespace-pre-line text-gray-700">{request.description}</p>
        {photoUrls.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {photoUrls.map(url => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="block h-28 w-28 overflow-hidden rounded-lg border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Foto del trabajo" className="h-full w-full object-cover" />
              </a>
            ))}
          </div>
        )}
        <dl className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-3">
          <div><dt className="text-xs text-gray-400">Lugar</dt><dd>{request.sector ? `${request.sector}, ` : ""}{request.city}</dd></div>
          <div><dt className="text-xs text-gray-400">Para cuándo</dt><dd>{URGENCY_LABELS[request.urgency]}</dd></div>
          <div><dt className="text-xs text-gray-400">Presupuesto</dt><dd>{request.budget ? formatRD(request.budget) : "A cotizar"}</dd></div>
        </dl>
      </div>

      <div className="mt-6">
        <FormMessage error={searchParams.error} ok={searchParams.ok} />
      </div>

      {/* Contacto tras aceptar */}
      {counterpartId && (request.status === "asignada" || request.status === "completada") && (
        <div className="card mb-6 border-green-300 bg-green-50">
          <h2 className="font-semibold">
            {isOwner ? `Trabajo asignado a ${accepted?.professional_profiles?.profiles?.full_name ?? "tu profesional"}` : "¡El cliente te eligió!"}
          </h2>
          <p className="mt-1 text-sm text-gray-600">Coordinen los detalles por WhatsApp.</p>
          {counterpartPhone && (
            <a href={whatsappLink(counterpartPhone, waText)} target="_blank" rel="noopener noreferrer" className="btn mt-3 bg-green-600 text-white hover:bg-green-700">
              Escribir por WhatsApp
            </a>
          )}
          {isOwner && request.status === "asignada" && (
            <form action={completeRequest} className="mt-4">
              <input type="hidden" name="request_id" value={request.id} />
              <button className="btn-outline">Marcar el trabajo como completado</button>
            </form>
          )}
        </div>
      )}

      {/* Reseña */}
      {isOwner && request.status === "completada" && accepted && !hasReview && (
        <div className="card mb-6">
          <h2 className="font-semibold">¿Cómo te fue con {accepted.professional_profiles?.profiles?.full_name}?</h2>
          <form action={leaveReview} className="mt-3 space-y-3">
            <input type="hidden" name="request_id" value={request.id} />
            <input type="hidden" name="pro_id" value={accepted.pro_id} />
            <div className="flex gap-4">
              {[5, 4, 3, 2, 1].map(n => (
                <label key={n} className="flex items-center gap-1 text-sm">
                  <input type="radio" name="rating" value={n} required defaultChecked={n === 5} /> {n}★
                </label>
              ))}
            </div>
            <textarea name="comment" className="input" maxLength={1000} placeholder="Cuéntale a otros clientes cómo fue el trabajo (opcional)" />
            <button className="btn-primary">Publicar reseña</button>
          </form>
        </div>
      )}

      {/* Vista del cliente: cotizaciones recibidas */}
      {isOwner && (
        <>
          <h2 className="text-lg font-semibold">Cotizaciones ({quotes.length})</h2>
          {quotes.length === 0 && (
            <div className="card mt-3 text-center text-gray-600">
              Aún no hay cotizaciones. Los profesionales de {cat?.name.toLowerCase() ?? "esta categoría"} ya pueden ver tu solicitud.
            </div>
          )}
          <div className="mt-3 grid gap-3">
            {quotes.map(q => {
              const pro = q.professional_profiles
              return (
                <div key={q.id} className={`card ${q.status === "aceptada" ? "border-green-400" : ""} ${q.status === "rechazada" ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/profesionales/${q.pro_id}`} className="font-semibold text-brand-700 hover:underline">
                        {pro?.profiles?.full_name ?? "Profesional"}
                      </Link>
                      {pro?.verified && <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">✔ Verificado</span>}
                      <div className="mt-1"><Stars value={Number(pro?.rating_avg ?? 0)} count={pro?.rating_count} /></div>
                      <p className="text-xs text-gray-500">{pro?.jobs_done ?? 0} trabajos completados</p>
                    </div>
                    <p className="text-xl font-bold">{formatRD(q.price)}</p>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm text-gray-700">{q.message}</p>
                  {q.available_date && <p className="mt-1 text-xs text-gray-500">Disponible desde: {q.available_date}</p>}
                  {request.status === "abierta" && q.status === "pendiente" && (
                    <form action={acceptQuote} className="mt-3">
                      <input type="hidden" name="quote_id" value={q.id} />
                      <input type="hidden" name="request_id" value={request.id} />
                      <button className="btn-primary">Aceptar esta cotización</button>
                    </form>
                  )}
                </div>
              )
            })}
          </div>
          {request.status === "abierta" && (
            <form action={cancelRequest} className="mt-6">
              <input type="hidden" name="request_id" value={request.id} />
              <button className="text-sm text-red-600 hover:underline">Cancelar solicitud</button>
            </form>
          )}
        </>
      )}

      {/* Vista del profesional */}
      {!isOwner && profile.role === "profesional" && (
        myQuote ? (
          <div className="card">
            <h2 className="font-semibold">Tu cotización: {formatRD(myQuote.price)}</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{myQuote.message}</p>
            <p className="mt-2 text-sm text-gray-500">
              {myQuote.status === "pendiente" && "⏳ Esperando respuesta del cliente."}
              {myQuote.status === "aceptada" && "✅ El cliente aceptó tu cotización."}
              {myQuote.status === "rechazada" && "El cliente eligió otra opción esta vez."}
            </p>
          </div>
        ) : request.status === "abierta" ? (
          <div className="card">
            <h2 className="font-semibold">Enviar cotización</h2>
            <form action={sendQuote} className="mt-3 space-y-3">
              <input type="hidden" name="request_id" value={request.id} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="price">Precio en RD$</label>
                  <input className="input" id="price" name="price" inputMode="numeric" required placeholder="Ej.: 4,500" />
                </div>
                <div>
                  <label className="label" htmlFor="available_date">Puedo ir desde</label>
                  <input className="input" id="available_date" name="available_date" type="date" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="message">Mensaje para el cliente</label>
                <textarea className="input min-h-24" id="message" name="message" required minLength={5} maxLength={1000}
                  placeholder="Qué incluye el precio, materiales, garantía, tiempo estimado…" />
              </div>
              <button className="btn-primary">Enviar cotización</button>
            </form>
          </div>
        ) : null
      )}
    </div>
  )
}
