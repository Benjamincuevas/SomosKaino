import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ReportsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: tenant } = await supabase.from("tenants").select("id").eq("owner_id", user.id).single()
  if (!tenant) redirect("/login")

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    { count: totalConvs },
    { count: totalLeads },
    { count: totalAiReplies },
    { count: totalProducts },
  ] = await Promise.all([
    supabase.from("conversations").select("*", { count: "exact", head: true }).eq("tenant_id", tenant.id).gte("created_at", sevenDaysAgo.toISOString()),
    supabase.from("contacts").select("*", { count: "exact", head: true }).eq("tenant_id", tenant.id).gte("created_at", sevenDaysAgo.toISOString()),
    supabase.from("messages").select("*, conversations!inner(tenant_id)", { count: "exact", head: true })
      .eq("conversations.tenant_id", tenant.id).eq("sent_by_ai", true).gte("created_at", sevenDaysAgo.toISOString()),
    supabase.from("catalog_products").select("*", { count: "exact", head: true }).eq("tenant_id", tenant.id).eq("enabled", true),
  ])

  const stats = [
    { label: "Conversaciones", sublabel: "últimos 7 días", value: totalConvs ?? 0, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Leads captados", sublabel: "últimos 7 días", value: totalLeads ?? 0, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
    { label: "Respuestas IA", sublabel: "últimos 7 días", value: totalAiReplies ?? 0, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { label: "Productos activos", sublabel: "en catálogo", value: totalProducts ?? 0, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20" },
  ]

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Reportes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Análisis y métricas de tu negocio</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl flex flex-col gap-6">

          {/* Métricas de la semana */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Últimos 7 días</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label} className={`${s.bg} rounded-xl p-5`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">{s.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.sublabel}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Próximas funciones */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Próximamente en Reportes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: "📊", title: "Ventas por período", desc: "Gráficos de ventas diarias, semanales y mensuales" },
                { icon: "🗺️", title: "Ventas por zona", desc: "Cibao, Gran Santo Domingo, Este y más" },
                { icon: "📱", title: "Productos más vendidos", desc: "Ranking de tus productos con mayor demanda" },
                { icon: "👥", title: "Clientes frecuentes", desc: "Quiénes compran más y con qué frecuencia" },
                { icon: "🤖", title: "Rendimiento del agente IA", desc: "Tasa de respuesta, leads convertidos" },
                { icon: "📦", title: "Rotación de inventario", desc: "Qué productos se mueven más rápido" },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <span className="text-xl shrink-0 mt-0.5">{f.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{f.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
