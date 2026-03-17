// PATCH /api/conversations/[id] — actualiza ai_paused
// DELETE /api/conversations/[id] — elimina la conversación y sus mensajes

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!tenant) return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })

  // Verificar que la conversación pertenece al tenant antes de borrar
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", params.id)
    .eq("tenant_id", tenant.id)
    .single()

  if (!conversation) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  // Soft delete — mover a papelera
  const { error } = await supabase
    .from("conversations")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("tenant_id", tenant.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!tenant) return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })

  const body = await request.json()
  const { ai_paused, restore, delete_permanent } = body

  // Restaurar desde papelera
  if (restore) {
    const { error } = await supabase
      .from("conversations")
      .update({ deleted_at: null })
      .eq("id", params.id)
      .eq("tenant_id", tenant.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // Eliminar permanentemente
  if (delete_permanent) {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", params.id)
      .eq("tenant_id", tenant.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  const { error } = await supabase
    .from("conversations")
    .update({ ai_paused })
    .eq("id", params.id)
    .eq("tenant_id", tenant.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, ai_paused })
}
