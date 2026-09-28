import Link from "next/link"
import { redirect } from "next/navigation"
import { requireProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { CATEGORIES, CITIES } from "@/lib/catalog"
import { updateProProfile } from "@/app/actions"
import FormMessage from "@/components/FormMessage"

export default async function PerfilPage({ searchParams }: { searchParams: { error?: string; ok?: string; bienvenida?: string } }) {
  const profile = await requireProfile()
  if (profile.role !== "profesional") redirect("/panel")

  const supabase = createClient()
  const { data: pro } = await supabase
    .from("professional_profiles")
    .select("bio, categories, cities, years_experience, verified")
    .eq("id", profile.id)
    .single()

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
      {!pro?.verified && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Tu perfil aún no está verificado. Los perfiles verificados reciben más trabajos: pronto podrás subir tu cédula y referencias.
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
    </div>
  )
}
