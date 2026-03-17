// Catálogo de Productos — Server Component

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

  const [{ data: products }, { data: waConfig }] = await Promise.all([
    supabase
      .from("catalog_products")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("whatsapp_configs")
      .select("catalog_id, access_token")
      .eq("tenant_id", tenant.id)
      .single(),
  ])

  const activeCount   = (products ?? []).filter(p => p.enabled).length
  const waCatalogId   = waConfig?.catalog_id ?? null
  const waConnected   = !!(waCatalogId && waConfig?.access_token)

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-3xl flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Catálogo SomosKaino</h1>
            <p className="text-gray-500 text-sm mt-1">
              Crea y gestiona tus productos. El agente los usa para responder y enviar fotos por WhatsApp.
            </p>
          </div>
          {(products ?? []).length > 0 && (
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-gray-900">{(products ?? []).length}</p>
              <p className="text-xs text-gray-500">productos</p>
            </div>
          )}
        </div>

        {/* Banner de sincronización con WhatsApp */}
        {waConnected ? (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">✅</span>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Sincronizado con WhatsApp Business
                </p>
                <p className="text-xs text-green-600">
                  Cada producto que crees o edites se publica automáticamente en tu catálogo de WhatsApp
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-medium text-amber-800">
                WhatsApp Business no conectado
              </p>
              <p className="text-xs text-amber-600">
                Conecta tu catálogo en{" "}
                <a href="/knowledge" className="underline font-medium">Base de Conocimiento</a>
                {" "}para publicar aquí y en WhatsApp al mismo tiempo
              </p>
            </div>
          </div>
        )}

        {activeCount > 0 && (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">
              {activeCount} activo{activeCount !== 1 ? "s" : ""}
            </span>
            <span>el agente tiene acceso a estos productos</span>
          </div>
        )}

        <CatalogGrid
          products={products ?? []}
          waConnected={waConnected}
        />

      </div>
    </div>
  )
}
