import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { categoryBySlug } from "@/lib/catalog"
import Stars from "@/components/Stars"

export default async function ProfesionalPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const [{ data: pro }, { data: reviews }] = await Promise.all([
    supabase
      .from("professional_profiles")
      .select("id, bio, categories, cities, years_experience, verified, rating_avg, rating_count, jobs_done, profiles(full_name, created_at)")
      .eq("id", params.id)
      .maybeSingle(),
    supabase
      .from("reviews")
      .select("id, rating, comment, created_at, profiles!reviews_client_id_fkey(full_name)")
      .eq("pro_id", params.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ])
  if (!pro) notFound()

  const person = pro.profiles as unknown as { full_name: string; created_at: string } | null
  const reviewList = (reviews ?? []) as unknown as { id: string; rating: number; comment: string | null; created_at: string; profiles: { full_name: string } | null }[]

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
            {person?.full_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {person?.full_name}
              {pro.verified && <span className="ml-2 align-middle rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">✔ Verificado</span>}
            </h1>
            <Stars value={Number(pro.rating_avg)} count={pro.rating_count} />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
          <div><p className="text-xl font-bold">{pro.jobs_done}</p><p className="text-gray-500">trabajos</p></div>
          <div><p className="text-xl font-bold">{pro.years_experience ?? "—"}</p><p className="text-gray-500">años de experiencia</p></div>
          <div><p className="text-xl font-bold">{person ? new Date(person.created_at).getFullYear() : "—"}</p><p className="text-gray-500">en ServiNet desde</p></div>
        </div>
        {pro.bio && <p className="mt-4 whitespace-pre-line text-gray-700">{pro.bio}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {pro.categories.map((slug: string) => {
            const c = categoryBySlug(slug)
            return <span key={slug} className="rounded-full bg-gray-100 px-3 py-1 text-sm">{c?.icon} {c?.name ?? slug}</span>
          })}
        </div>
        {pro.cities.length > 0 && <p className="mt-3 text-sm text-gray-600">📍 Trabaja en: {pro.cities.join(", ")}</p>}
      </div>

      <h2 className="mt-8 text-lg font-semibold">Reseñas</h2>
      {reviewList.length === 0 ? (
        <div className="card mt-3 text-center text-gray-600">Todavía no tiene reseñas.</div>
      ) : (
        <div className="mt-3 grid gap-3">
          {reviewList.map(r => (
            <div key={r.id} className="card">
              <div className="flex items-center justify-between">
                <Stars value={r.rating} count={1} />
                <span className="text-xs text-gray-400">
                  {r.profiles?.full_name?.split(" ")[0]} · {new Date(r.created_at).toLocaleDateString("es-DO", { timeZone: "America/Santo_Domingo" })}
                </span>
              </div>
              {r.comment && <p className="mt-2 text-sm text-gray-700">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
