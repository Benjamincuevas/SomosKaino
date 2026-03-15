// Dashboard principal — Server Component
// Lee métricas reales desde Supabase

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Obtener el tenant_id del usuario (lo necesitamos para filtrar sus datos)
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  // Si por alguna razón no tiene tenant, algo falló en el trigger de registro
  if (!tenant) {
    return <p className="text-red-500">Error: no se encontró tu cuenta. Contacta soporte.</p>
  }

  // Calcular inicio del día actual (medianoche) para filtrar métricas "de hoy"
  // new Date().toISOString() → "2024-01-15T06:30:00.000Z"
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  // ── MÉTRICAS ──
  // Promise.all ejecuta las 3 queries en paralelo (más rápido que una por una)
  const [
    { count: conversationsToday },
    { count: leadsToday },
    { count: aiReplies },
  ] = await Promise.all([

    // Conversaciones abiertas creadas hoy
    supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })  // head:true = solo contar, no traer datos
      .eq("tenant_id", tenant.id)
      .gte("created_at", todayISO),  // gte = "greater than or equal" (mayor o igual)

    // Contactos nuevos creados hoy
    supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenant.id)
      .gte("created_at", todayISO),

    // Mensajes enviados por IA hoy
    supabase
      .from("messages")
      .select("*, conversations!inner(tenant_id)", { count: "exact", head: true })
      .eq("conversations.tenant_id", tenant.id)
      .eq("sent_by_ai", true)
      .eq("direction", "outbound")
      .gte("created_at", todayISO),
  ])

  return (
    <div className="flex-1 overflow-auto p-6">
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">Resumen de tu actividad de hoy</p>
      </div>

      {/* Tarjetas de métricas con datos reales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Conversaciones hoy" value={conversationsToday ?? 0} icon="💬" />
        <MetricCard label="Leads nuevos"        value={leadsToday ?? 0}         icon="👤" />
        <MetricCard label="Respuestas con IA"   value={aiReplies ?? 0}          icon="🤖" />
      </div>

      {/* Mensaje de bienvenida si todo está en 0 */}
      {(conversationsToday === 0 && leadsToday === 0) && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <p className="font-medium text-gray-900">¡Tu cuenta está lista!</p>
          <p className="text-sm text-gray-500 mt-1">
            Ve a{" "}
            <a href="/settings" className="text-green-600 hover:underline">Configuración</a>
            {" "}para conectar tu número de WhatsApp.
          </p>
        </div>
      )}
    </div>
    </div>
  )
}

function MetricCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  )
}
