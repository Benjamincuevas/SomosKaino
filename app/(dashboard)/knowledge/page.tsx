// Base de Conocimiento — Server Component
// Gestiona las fuentes de información que usa el agente de IA

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import WhatsappCatalogSource from "./whatsapp-catalog-source"
import SheetsSource from "./sheets-source"
import DocumentsSource from "./documents-source"

export default async function KnowledgePage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!tenant) redirect("/login")

  const [
    { data: catalogConfig },
    { data: documents },
    { data: whatsappConfig },
    { data: rentiaProducts },
  ] = await Promise.all([
    supabase
      .from("catalog_configs")
      .select("sheet_url, sheet_id, sheet_gid, enabled")
      .eq("tenant_id", tenant.id)
      .maybeSingle(),
    supabase
      .from("knowledge_documents")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("created_at"),
    supabase
      .from("whatsapp_configs")
      .select("catalog_id, access_token, is_configured")
      .eq("tenant_id", tenant.id)
      .single(),
    supabase
      .from("catalog_products")
      .select("id, enabled")
      .eq("tenant_id", tenant.id),
  ])

  // Contar fuentes activas para el resumen
  const sheetsActive    = !!(catalogConfig?.sheet_id && catalogConfig?.enabled !== false)
  const catalogActive   = !!(whatsappConfig?.catalog_id)
  const docsActive      = (documents ?? []).filter(d => d.enabled).length
  const rentiaActive    = (rentiaProducts ?? []).filter(p => p.enabled).length
  const totalSources    = [sheetsActive, catalogActive, docsActive > 0, rentiaActive > 0].filter(Boolean).length

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-2xl flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Base de Conocimiento</h1>
          <p className="text-gray-500 text-sm mt-1">
            El agente de IA responde usando estas fuentes. Activa las que necesites.
          </p>
        </div>

        {/* Resumen de fuentes activas */}
        <div className="grid grid-cols-4 gap-3">
          <div className={`border rounded-xl p-4 text-center ${rentiaActive > 0 ? "bg-green-50 border-green-200" : "bg-gray-50"}`}>
            <p className="text-2xl mb-1">📦</p>
            <p className="text-xs font-medium text-gray-700">Catálogo RentIA</p>
            <p className={`text-xs mt-0.5 ${rentiaActive > 0 ? "text-green-600 font-medium" : "text-gray-400"}`}>
              {rentiaActive > 0 ? `${rentiaActive} producto${rentiaActive > 1 ? "s" : ""}` : "Inactivo"}
            </p>
          </div>
          <div className={`border rounded-xl p-4 text-center ${catalogActive ? "bg-green-50 border-green-200" : "bg-gray-50"}`}>
            <p className="text-2xl mb-1">🛍️</p>
            <p className="text-xs font-medium text-gray-700">Catálogo WA</p>
            <p className={`text-xs mt-0.5 ${catalogActive ? "text-green-600 font-medium" : "text-gray-400"}`}>
              {catalogActive ? "Activo" : "Inactivo"}
            </p>
          </div>
          <div className={`border rounded-xl p-4 text-center ${sheetsActive ? "bg-green-50 border-green-200" : "bg-gray-50"}`}>
            <p className="text-2xl mb-1">📊</p>
            <p className="text-xs font-medium text-gray-700">Google Sheets</p>
            <p className={`text-xs mt-0.5 ${sheetsActive ? "text-green-600 font-medium" : "text-gray-400"}`}>
              {sheetsActive ? "Activo" : "Inactivo"}
            </p>
          </div>
          <div className={`border rounded-xl p-4 text-center ${docsActive > 0 ? "bg-green-50 border-green-200" : "bg-gray-50"}`}>
            <p className="text-2xl mb-1">📄</p>
            <p className="text-xs font-medium text-gray-700">Documentos</p>
            <p className={`text-xs mt-0.5 ${docsActive > 0 ? "text-green-600 font-medium" : "text-gray-400"}`}>
              {docsActive > 0 ? `${docsActive} activo${docsActive > 1 ? "s" : ""}` : "Inactivo"}
            </p>
          </div>
        </div>

        {totalSources === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800">
            El agente no tiene ninguna fuente de conocimiento activa. Configura al menos una fuente para que pueda responder sobre tus productos.
          </div>
        )}

        {/* Enlace rápido al catálogo RentIA */}
        <a
          href="/catalog"
          className="flex items-center justify-between border rounded-xl p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-lg">📦</div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Catálogo RentIA</p>
              <p className="text-xs text-gray-500">
                {rentiaActive > 0
                  ? `${rentiaActive} producto${rentiaActive > 1 ? "s" : ""} activo${rentiaActive > 1 ? "s" : ""}`
                  : "Gestiona tus productos con fotos y precios"}
              </p>
            </div>
          </div>
          <span className="text-gray-400 text-sm">Gestionar →</span>
        </a>

        {/* Fuentes externas */}
        <WhatsappCatalogSource
          catalogId={whatsappConfig?.catalog_id ?? null}
          isConfigured={!!(whatsappConfig?.access_token)}
        />

        <SheetsSource config={catalogConfig} />

        <DocumentsSource documents={documents ?? []} />

      </div>
    </div>
  )
}
