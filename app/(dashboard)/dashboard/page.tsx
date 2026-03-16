import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: tenant } = await supabase.from("tenants").select("id, name").eq("owner_id", user.id).single()
  if (!tenant) return <p className="p-6 text-red-500">Error: no se encontró tu cuenta.</p>

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
  const todayISO   = today.toISOString()
  const weekAgoISO = weekAgo.toISOString()

  const [
    { count: convsToday },
    { count: convsWeek },
    { count: leadsToday },
    { count: aiReplies },
    { data: waConfig },
    { data: aiConfig },
    { data: recentConvs },
    { data: products },
    { count: totalProducts },
  ] = await Promise.all([
    supabase.from("conversations").select("*", { count: "exact", head: true }).eq("tenant_id", tenant.id).gte("created_at", todayISO),
    supabase.from("conversations").select("*", { count: "exact", head: true }).eq("tenant_id", tenant.id).gte("created_at", weekAgoISO),
    supabase.from("contacts").select("*", { count: "exact", head: true }).eq("tenant_id", tenant.id).gte("created_at", todayISO),
    supabase.from("messages").select("*, conversations!inner(tenant_id)", { count: "exact", head: true })
      .eq("conversations.tenant_id", tenant.id).eq("sent_by_ai", true).eq("direction", "outbound").gte("created_at", todayISO),
    supabase.from("whatsapp_configs").select("is_configured, phone_display").eq("tenant_id", tenant.id).single(),
    supabase.from("ai_configs").select("enabled").eq("tenant_id", tenant.id).single(),
    supabase.from("conversations")
      .select("id, updated_at, ai_paused, status, contacts(name, phone), messages(content, direction, created_at)")
      .eq("tenant_id", tenant.id).eq("status", "open")
      .order("updated_at", { ascending: false }).limit(5),
    supabase.from("catalog_products")
      .select("id, name, price, currency, enabled")
      .eq("tenant_id", tenant.id).eq("enabled", true).limit(5),
    supabase.from("catalog_products").select("*", { count: "exact", head: true }).eq("tenant_id", tenant.id).eq("enabled", true),
  ])

  const isSetupDone = waConfig?.is_configured && aiConfig?.enabled

  // Últimas conversaciones — el último mensaje de cada una
  const recentWithLastMsg = (recentConvs ?? []).map((conv) => {
    const msgs = (conv.messages as any[]) ?? []
    const last = msgs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    const contact = Array.isArray(conv.contacts) ? conv.contacts[0] : conv.contacts
    return { ...conv, lastMsg: last, contact }
  })

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">

      {/* Page header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Bienvenido, {tenant.name} 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Aquí está el resumen de tu negocio hoy
        </p>
      </div>

      <div className="p-6 flex flex-col gap-6 max-w-6xl">

        {/* ── ALERTA SETUP ── */}
        {!isSetupDone && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-amber-500 shrink-0 mt-0.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Tu agente no está activo aún</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                {!waConfig?.is_configured ? "Conecta WhatsApp Business para empezar." : "Activa el agente de IA en Configuración."}
              </p>
            </div>
            <Link href="/settings" className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 shrink-0">
              Configurar →
            </Link>
          </div>
        )}

        {/* ── MÉTRICAS PRINCIPALES ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Conversaciones"
            sublabel="hoy"
            value={convsToday ?? 0}
            sub={`${convsWeek ?? 0} esta semana`}
            color="blue"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>}
            href="/inbox"
          />
          <StatCard
            label="Leads nuevos"
            sublabel="hoy"
            value={leadsToday ?? 0}
            color="green"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
            href="/contacts"
          />
          <StatCard
            label="Respuestas IA"
            sublabel="hoy"
            value={aiReplies ?? 0}
            color="purple"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5"><path d="M12 2a7 7 0 017 7c0 3.5-2.5 5.5-3 8H8c-.5-2.5-3-4.5-3-8a7 7 0 017-7z"/><path d="M9 21h6M10 17h4"/></svg>}
          />
          <StatCard
            label="Productos activos"
            sublabel="en catálogo"
            value={totalProducts ?? 0}
            color="orange"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>}
            href="/catalog"
          />
        </div>

        {/* ── CONTENIDO PRINCIPAL: 2 columnas ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Conversaciones recientes — 3/5 */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Conversaciones activas</h2>
                <p className="text-xs text-gray-400 mt-0.5">WhatsApp en tiempo real</p>
              </div>
              <Link href="/inbox" className="text-xs text-green-600 hover:text-green-700 font-medium">
                Ver todas →
              </Link>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {recentWithLastMsg.length === 0 ? (
                <EmptyState icon="💬" text="Sin conversaciones activas" />
              ) : (
                recentWithLastMsg.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/inbox/${conv.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                        {((conv.contact as any)?.name ?? (conv.contact as any)?.phone ?? "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {(conv.contact as any)?.name ?? (conv.contact as any)?.phone ?? "Desconocido"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {(conv.lastMsg as any)?.content ?? "Sin mensajes"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${conv.ai_paused ? "bg-orange-400" : "bg-green-500"}`} title={conv.ai_paused ? "Bot pausado" : "Bot activo"} />
                      <span className="text-[10px] text-gray-400">{formatTime(conv.updated_at)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Panel derecho — 2/5 */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Módulos próximos */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Acceso rápido</h2>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                <QuickLink href="/orders"    label="Pedidos"    icon="🛒" color="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300" />
                <QuickLink href="/inventory" label="Inventario" icon="📦" color="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" />
                <QuickLink href="/contacts"  label="Clientes"   icon="👥" color="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" />
                <QuickLink href="/reports"   label="Reportes"   icon="📈" color="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300" />
              </div>
            </div>

            {/* Productos del catálogo */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex-1">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Productos</h2>
                <Link href="/catalog" className="text-xs text-green-600 hover:text-green-700 font-medium">Ver todos →</Link>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {(products ?? []).length === 0 ? (
                  <EmptyState icon="📦" text="Sin productos aún" />
                ) : (
                  (products ?? []).map((p) => (
                    <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        <span className="text-xs">📱</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{p.name}</p>
                      {p.price != null && (
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0">
                          {p.currency} {Number(p.price).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── ESTADO DEL AGENTE ── */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Estado del sistema</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatusItem
              label="WhatsApp Business"
              ok={!!waConfig?.is_configured}
              okText={waConfig?.phone_display ?? "Conectado"}
              failText="No conectado"
              href="/settings"
            />
            <StatusItem
              label="Agente IA"
              ok={!!aiConfig?.enabled}
              okText="Activo"
              failText="Desactivado"
              href="/settings"
            />
            <StatusItem
              label="Base de conocimiento"
              ok={(totalProducts ?? 0) > 0}
              okText={`${totalProducts ?? 0} productos`}
              failText="Sin productos"
              href="/knowledge"
            />
            <StatusItem
              label="WhatsApp"
              ok={!!waConfig?.is_configured}
              okText="Recibiendo mensajes"
              failText="Sin configurar"
              href="/settings"
            />
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Helpers ──

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  if (date.toDateString() === now.toDateString())
    return date.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })
  return date.toLocaleDateString("es-DO", { day: "numeric", month: "short" })
}

// ── Componentes ──

const colors = {
  blue:   { bg: "bg-blue-50 dark:bg-blue-900/20",   icon: "text-blue-500",   val: "text-blue-700 dark:text-blue-300",   border: "border-blue-100 dark:border-blue-800" },
  green:  { bg: "bg-green-50 dark:bg-green-900/20", icon: "text-green-500",  val: "text-green-700 dark:text-green-300", border: "border-green-100 dark:border-green-800" },
  purple: { bg: "bg-purple-50 dark:bg-purple-900/20",icon: "text-purple-500",val: "text-purple-700 dark:text-purple-300",border: "border-purple-100 dark:border-purple-800" },
  orange: { bg: "bg-orange-50 dark:bg-orange-900/20",icon: "text-orange-500",val: "text-orange-700 dark:text-orange-300",border: "border-orange-100 dark:border-orange-800" },
} as const

function StatCard({ label, sublabel, value, sub, color, icon, href }: {
  label: string; sublabel: string; value: number; sub?: string
  color: keyof typeof colors; icon: React.ReactNode; href?: string
}) {
  const c = colors[color]
  const inner = (
    <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow`}>
      <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.icon} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {label} <span className="text-xs text-gray-400">/ {sublabel}</span>
        </p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : <div>{inner}</div>
}

function QuickLink({ href, label, icon, color }: { href: string; label: string; icon: string; color: string }) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-2 p-3 rounded-xl ${color} transition-opacity hover:opacity-80`}>
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-semibold">{label}</span>
    </Link>
  )
}

function StatusItem({ label, ok, okText, failText, href }: {
  label: string; ok: boolean; okText: string; failText: string; href: string
}) {
  return (
    <Link href={href} className="flex flex-col gap-1.5 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${ok ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
      </div>
      <p className={`text-xs font-semibold ${ok ? "text-gray-800 dark:text-gray-200" : "text-gray-400"}`}>
        {ok ? okText : failText}
      </p>
    </Link>
  )
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="py-10 flex flex-col items-center gap-2">
      <span className="text-2xl">{icon}</span>
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  )
}
