import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: tenant } = await supabase
    .from("tenants").select("id").eq("owner_id", user.id).single()
  if (!tenant) return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })

  const body = await request.json()
  const updates: Record<string, unknown> = {}

  if (body.name        !== undefined) updates.name        = body.name.trim()
  if (body.description !== undefined) updates.description = body.description?.trim() || null
  if (body.price       !== undefined) updates.price       = body.price ? Number(body.price) : null
  if (body.currency    !== undefined) updates.currency    = body.currency
  if (body.image_url   !== undefined) updates.image_url   = body.image_url || null
  if (body.enabled     !== undefined) updates.enabled     = body.enabled

  const { data, error } = await supabase
    .from("catalog_products")
    .update(updates)
    .eq("id", params.id)
    .eq("tenant_id", tenant.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: tenant } = await supabase
    .from("tenants").select("id").eq("owner_id", user.id).single()
  if (!tenant) return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })

  // Obtener la imagen para eliminarla del storage también
  const { data: product } = await supabase
    .from("catalog_products")
    .select("image_url")
    .eq("id", params.id)
    .eq("tenant_id", tenant.id)
    .single()

  const { error } = await supabase
    .from("catalog_products")
    .delete()
    .eq("id", params.id)
    .eq("tenant_id", tenant.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Eliminar imagen del storage si existe
  if (product?.image_url) {
    try {
      const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const path = product.image_url.split("/catalog-images/")[1]
      if (path) {
        await serviceClient.storage.from("catalog-images").remove([path])
      }
    } catch {
      // No crítico si falla la limpieza del storage
    }
  }

  return NextResponse.json({ success: true })
}
