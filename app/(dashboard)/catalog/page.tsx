// Catálogo de Productos — Server Component
// Lista y gestiona los productos del catálogo nativo de RentIA

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CatalogGrid from "./catalog-grid"

export default async function CatalogPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!tenant) redirect("/login")

  const { data: products } = await supabase
    .from("catalog_products")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })

  const activeCount = (products ?? []).filter(p => p.enabled).length

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-3xl flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Catálogo RentIA</h1>
            <p className="text-gray-500 text-sm mt-1">
              Crea y gestiona tus productos. El agente los usa para responder y enviar fotos por WhatsApp.
            </p>
          </div>
          {(products ?? []).length > 0 && (
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{(products ?? []).length}</p>
              <p className="text-xs text-gray-500">productos</p>
            </div>
          )}
        </div>

        {/* Banner informativo si hay productos activos */}
        {activeCount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <p className="text-sm font-medium text-green-800">
                El agente tiene acceso a {activeCount} producto{activeCount !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-green-600">
                Puede responder preguntas y enviar fotos automáticamente por WhatsApp
              </p>
            </div>
          </div>
        )}

        <CatalogGrid products={products ?? []} />

      </div>
    </div>
  )
}
