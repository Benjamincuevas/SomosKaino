import { redirect } from "next/navigation"
import { requireProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { categoryBySlug, whatsappLink } from "@/lib/catalog"
import { reviewVerification } from "@/app/actions"
import FormMessage from "@/components/FormMessage"

type Stats = Record<"clientes" | "profesionales" | "verificados" | "solicitudes" | "abiertas" | "asignadas" | "cotizaciones" | "resenas", number>

type PendingVerification = {
  pro_id: string
  cedula_path: string
  certificado_path: string
  references_text: string | null
  submitted_at: string
  professional_profiles: {
    categories: string[]
    years_experience: number | null
    profiles: { full_name: string; city: string | null } | null
  } | null
}

const STAT_LABELS: [keyof Stats, string][] = [
  ["clientes", "Clientes"],
  ["profesionales", "Profesionales"],
  ["verificados", "Verificados"],
  ["solicitudes", "Solicitudes"],
  ["abiertas", "Abiertas"],
  ["asignadas", "Asignadas"],
  ["cotizaciones", "Cotizaciones"],
  ["resenas", "Reseñas"],
]

export default async function AdminPage({ searchParams }: { searchParams: { error?: string; ok?: string } }) {
  const profile = await requireProfile()
  if (profile.role !== "admin") redirect("/panel")

  const supabase = createClient()
  const [{ data: stats }, { data: pendingData }] = await Promise.all([
    supabase.rpc("admin_stats"),
    supabase
      .from("verifications")
      .select("pro_id, cedula_path, certificado_path, references_text, submitted_at, professional_profiles(categories, years_experience, profiles(full_name, city))")
      .eq("status", "pendiente")
      .order("submitted_at", { ascending: true }),
  ])
  const pending = (pendingData ?? []) as unknown as PendingVerification[]

  // Enlaces temporales a los documentos y teléfonos de los profesionales pendientes
  const docPaths = pending.flatMap(v => [v.cedula_path, v.certificado_path])
  const [{ data: signed }, { data: phones }] = await Promise.all([
    docPaths.length
      ? supabase.storage.from("verificaciones").createSignedUrls(docPaths, 60 * 30)
      : Promise.resolve({ data: [] as { path: string | null; signedUrl: string }[] }),
    pending.length
      ? supabase.from("contacts").select("id, phone").in("id", pending.map(v => v.pro_id))
      : Promise.resolve({ data: [] as { id: string; phone: string }[] }),
  ])
  const urlByPath = new Map((signed ?? []).map(s => [s.path, s.signedUrl]))
  const phoneById = new Map((phones ?? []).map(p => [p.id, p.phone]))

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">Administración</h1>
      <div className="mt-4"><FormMessage error={searchParams.error} ok={searchParams.ok} /></div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STAT_LABELS.map(([key, label]) => (
          <div key={key} className="card !p-4 text-center">
            <p className="text-2xl font-bold">{(stats as Stats | null)?.[key] ?? "—"}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Verificaciones pendientes ({pending.length})</h2>
      {pending.length === 0 ? (
        <div className="card mt-3 text-center text-gray-600">No hay verificaciones pendientes.</div>
      ) : (
        <div className="mt-3 grid gap-4">
          {pending.map(v => {
            const pro = v.professional_profiles
            const phone = phoneById.get(v.pro_id)
            return (
              <div key={v.pro_id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <a href={`/profesionales/${v.pro_id}`} className="text-lg font-semibold text-brand-700 hover:underline">
                      {pro?.profiles?.full_name ?? "Profesional"}
                    </a>
                    <p className="text-sm text-gray-600">
                      {pro?.profiles?.city ?? "Sin ciudad"}
                      {pro?.years_experience != null && ` · ${pro.years_experience} años de experiencia`}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {(pro?.categories ?? []).map(c => categoryBySlug(c)?.name ?? c).join(", ") || "Sin servicios elegidos"}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-500">
                      Enviado el {new Date(v.submitted_at).toLocaleDateString("es-DO", { timeZone: "America/Santo_Domingo" })}
                    </p>
                    {phone && (
                      <a href={whatsappLink(phone)} target="_blank" rel="noopener noreferrer" className="font-medium text-green-700 hover:underline">
                        WhatsApp {phone}
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[["Cédula", v.cedula_path], ["Certificado de no antecedentes", v.certificado_path]].map(([label, path]) => {
                    const url = urlByPath.get(path)
                    return url
                      ? <a key={path} href={url} target="_blank" rel="noopener noreferrer" className="btn-outline">📄 Ver {label.toLowerCase()}</a>
                      : <span key={path} className="btn-outline opacity-50">{label}: no disponible</span>
                  })}
                </div>

                {v.references_text && (
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase text-gray-500">Referencias</p>
                    <p className="whitespace-pre-line text-sm text-gray-700">{v.references_text}</p>
                  </div>
                )}

                <form action={reviewVerification} className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center">
                  <input type="hidden" name="pro_id" value={v.pro_id} />
                  <input name="note" className="input sm:flex-1" maxLength={500} placeholder="Nota (obligatoria si rechazas)" />
                  <div className="flex gap-2">
                    <button name="decision" value="aprobar" className="btn bg-green-600 text-white hover:bg-green-700">✔ Aprobar</button>
                    <button name="decision" value="rechazar" className="btn border border-red-300 bg-white text-red-700 hover:bg-red-50">Rechazar</button>
                  </div>
                </form>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
