import Link from "next/link"
import { redirect } from "next/navigation"
import { requireProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { CATEGORIES, CITIES } from "@/lib/catalog"
import { updateProProfile } from "@/app/actions"
import FormMessage from "@/components/FormMessage"
import VerificationForm from "@/components/VerificationForm"

export default async function PerfilPage({ searchParams }: { searchParams: { error?: string; ok?: string; bienvenida?: string } }) {
  const profile = await requireProfile()
  if (profile.role !== "profesional") redirect("/panel")

  const supabase = createClient()
  const { data: pro } = await supabase
    .from("professional_profiles")
    .select("bio, categories, cities, years_experience, verified")
    .eq("id", profile.id)
    .single()
  const { data: verification } = await supabase
    .from("verifications")
    .select("status, admin_note, submitted_at")
    .eq("pro_id", profile.id)
    .maybeSingle()

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mi perfil profesional</h1>
        <Link href={`/profesionales/${profile.id}`} className="text-sm font-medium text-brand-600">Ver perfil público →</Link>
      </div>

      {searchParams.bienvenida && (
        <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-900">
          ¡Bienvenido a ServiNet! Elige tus servicios y ciudades para empezar a ver trabajos.
        </p>
      )}

      <div className="card mt-6">
        <FormMessage error={searchParams.error} ok={searchParams.ok} />
        <form action={updateProProfile} className="space-y-6">
          <fieldset>
            <legend className="label">¿Qué servicios ofreces?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {CATEGORIES.map(c => (
                <label key={c.slug} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
                  <input type="checkbox" name="categories" value={c.slug} defaultChecked={pro?.categories.includes(c.slug)} />
                  {c.icon} {c.name}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="label">¿En qué ciudades trabajas?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {CITIES.map(c => (
                <label key={c} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
                  <input type="checkbox" name="cities" value={c} defaultChecked={pro?.cities.includes(c)} />
                  {c}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label className="label" htmlFor="years_experience">Años de experiencia</label>
            <input className="input max-w-32" id="years_experience" name="years_experience" type="number" min={0} max={70}
              defaultValue={pro?.years_experience ?? ""} />
          </div>
          <div>
            <label className="label" htmlFor="bio">Sobre ti</label>
            <textarea className="input min-h-28" id="bio" name="bio" maxLength={1500} defaultValue={pro?.bio ?? ""}
              placeholder="Tu experiencia, trabajos que has hecho, si das garantía, si tienes equipo o empresa…" />
          </div>
          <button className="btn-primary">Guardar perfil</button>
        </form>
      </div>

      <div className="card mt-6">
        <h2 className="text-lg font-semibold">Verificación ✔</h2>
        {pro?.verified ? (
          <p className="mt-2 text-sm text-green-700">Tu perfil está verificado. Los clientes ven la insignia en tus cotizaciones.</p>
        ) : verification?.status === "pendiente" ? (
          <p className="mt-2 text-sm text-gray-600">
            ⏳ Recibimos tus documentos el {new Date(verification.submitted_at).toLocaleDateString("es-DO", { timeZone: "America/Santo_Domingo" })}.
            Te verificaremos pronto.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-gray-600">
              Los profesionales verificados reciben más trabajos. Sube tus documentos y el equipo de ServiNet los revisará.
            </p>
            {verification?.status === "rechazada" && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                Tu verificación anterior fue rechazada{verification.admin_note ? `: ${verification.admin_note}` : "."} Puedes volver a enviarla.
              </p>
            )}
            <div className="mt-4"><VerificationForm userId={profile.id} /></div>
          </>
        )}
      </div>
    </div>
  )
}
