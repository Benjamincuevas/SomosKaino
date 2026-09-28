import { redirect } from "next/navigation"
import { requireProfile } from "@/lib/auth"
import { CATEGORIES, CITIES, URGENCY_LABELS } from "@/lib/catalog"
import { createRequest } from "@/app/actions"
import FormMessage from "@/components/FormMessage"
import PhotoUploader from "@/components/PhotoUploader"

export default async function SolicitarPage({ searchParams }: { searchParams: { categoria?: string; error?: string } }) {
  const profile = await requireProfile()
  if (profile.role !== "cliente") redirect("/panel")

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Pedir un servicio</h1>
      <p className="mt-1 text-sm text-gray-600">Mientras más detalles des, más precisas serán las cotizaciones.</p>

      <div className="card mt-6">
        <FormMessage error={searchParams.error} />
        <form action={createRequest} className="space-y-4">
          <div>
            <label className="label" htmlFor="category">¿Qué tipo de servicio?</label>
            <select className="input" id="category" name="category" required defaultValue={searchParams.categoria ?? ""}>
              <option value="" disabled>Elige un servicio</option>
              {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="title">Título corto</label>
            <input className="input" id="title" name="title" required minLength={5} maxLength={120} placeholder="Ej.: Se sale el agua debajo del fregadero" />
          </div>
          <div>
            <label className="label" htmlFor="description">Describe el trabajo</label>
            <textarea className="input min-h-32" id="description" name="description" required minLength={10} maxLength={2000}
              placeholder="Qué pasa, desde cuándo, medidas aproximadas, materiales, si hay que comprarlos…" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="city">Ciudad</label>
              <select className="input" id="city" name="city" required defaultValue={profile.city ?? ""}>
                <option value="" disabled>Elige una ciudad</option>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="sector">Sector (opcional)</label>
              <input className="input" id="sector" name="sector" maxLength={80} placeholder="Ej.: Los Prados" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="urgency">¿Para cuándo?</label>
              <select className="input" id="urgency" name="urgency" defaultValue="esta_semana">
                {Object.entries(URGENCY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="budget">Presupuesto aproximado en RD$ (opcional)</label>
              <input className="input" id="budget" name="budget" inputMode="numeric" placeholder="Ej.: 3,500" />
            </div>
          </div>
          <PhotoUploader userId={profile.id} />
          <button className="btn-accent w-full py-3 text-base">Publicar y recibir cotizaciones</button>
        </form>
      </div>
    </div>
  )
}
