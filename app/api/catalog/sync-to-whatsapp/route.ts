// POST — sincroniza todos los productos activos de SomosKaino con el catálogo de WhatsApp Business
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { syncAllProductsToMeta } from "@/lib/whatsapp-catalog"

export async function POST() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: tenant } = await supabase
    .from("tenants").select("id").eq("owner_id", user.id).single()
  if (!tenant) return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })

  const { data: waConfig } = await supabase
    .from("whatsapp_configs")
    .select("catalog_id, access_token")
    .eq("tenant_id", tenant.id)
    .single()

  if (!waConfig?.catalog_id) {
    return NextResponse.json(
      { error: "No hay catálogo de WhatsApp configurado. Ve a Base de Conocimiento para conectarlo." },
      { status: 400 }
    )
  }
  if (!waConfig?.access_token) {
    return NextResponse.json(
      { error: "No hay token de WhatsApp configurado. Ve a Configuración." },
      { status: 400 }
    )
  }

  const { data: products } = await supabase
    .from("catalog_products")
    .select("id, name, description, price, currency, image_url")
    .eq("tenant_id", tenant.id)
    .eq("enabled", true)

  if (!products || products.length === 0) {
    return NextResponse.json({ success: true, synced: 0, message: "No hay productos activos para sincronizar" })
  }

  const result = await syncAllProductsToMeta({
    catalogId:   waConfig.catalog_id,
    accessToken: waConfig.access_token,
    products,
  })

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true, synced: result.synced })
}
