import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getPropertyData } from "@/lib/sheets"

// Extrae sheet_id y sheet_gid de una URL de Google Sheets
function parseSheetUrl(url: string): { sheetId: string | null; sheetGid: string } {
  const idMatch  = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
  const gidMatch = url.match(/[#&?]gid=(\d+)/)
  return {
    sheetId:  idMatch  ? idMatch[1]  : null,
    sheetGid: gidMatch ? gidMatch[1] : "0",
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!tenant) return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })

  const { sheet_url } = await request.json()
  const { sheetId, sheetGid } = parseSheetUrl(sheet_url ?? "")

  if (!sheetId) {
    return NextResponse.json({ error: "URL de Google Sheets inválida. Asegúrate de copiar la URL completa." }, { status: 400 })
  }

  // ── Verificar que el Sheet es accesible y tiene datos ──
  const sheetData = await getPropertyData(sheetId, sheetGid)

  if (!sheetData.text) {
    return NextResponse.json({
      error: "No se pudo acceder al Sheet. Verifica que esté compartido como 'Cualquiera con el enlace puede ver'."
    }, { status: 400 })
  }

  const productCount = Object.keys(sheetData.imageMap).length
  const rowCount     = sheetData.text.split("\n").length - 1 // sin header

  if (rowCount === 0) {
    return NextResponse.json({
      error: "El Sheet está vacío o no tiene el formato correcto. Asegúrate de tener columnas de nombre e imagen."
    }, { status: 400 })
  }

  // ── Guardar en Supabase ──
  const { error } = await supabase
    .from("catalog_configs")
    .upsert({
      tenant_id: tenant.id,
      sheet_url,
      sheet_id:  sheetId,
      sheet_gid: sheetGid,
    }, { onConflict: "tenant_id" })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    summary: {
      productos:     rowCount,
      conFoto:       productCount,
      sinFoto:       rowCount - productCount,
    }
  })
}

export async function GET() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!tenant) return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })

  const { data } = await supabase
    .from("catalog_configs")
    .select("sheet_url, sheet_id, sheet_gid")
    .eq("tenant_id", tenant.id)
    .maybeSingle()

  return NextResponse.json(data ?? {})
}
