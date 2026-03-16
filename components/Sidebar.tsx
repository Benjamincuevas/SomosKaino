"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, MessageCircle, Users, ShoppingCart,
  Package, Tag, BarChart2, Brain, Settings, LogOut, LucideIcon, Zap
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type NavItem  = { href: string; label: string; icon: LucideIcon; badge?: number | string }
type Section  = { title: string; items: NavItem[] }

const sections: Section[] = [
  {
    title: "Principal",
    items: [
      { href: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
      { href: "/inbox",     label: "WhatsApp",   icon: MessageCircle, badge: "•" },
      { href: "/contacts",  label: "Clientes",   icon: Users },
    ],
  },
  {
    title: "Negocio",
    items: [
      { href: "/orders",    label: "Pedidos",    icon: ShoppingCart },
      { href: "/inventory", label: "Inventario", icon: Package },
      { href: "/catalog",   label: "Productos",  icon: Tag },
      { href: "/reports",   label: "Reportes",   icon: BarChart2 },
    ],
  },
  {
    title: "Configuración",
    items: [
      { href: "/knowledge", label: "IA & Conocimiento", icon: Brain },
      { href: "/settings",  label: "Configuración",     icon: Settings },
    ],
  },
]

export default function Sidebar({ tenantName, email }: { tenantName: string; email: string }) {
  const pathname = usePathname()
  const router   = useRouter()
  const initials = tenantName.slice(0, 2).toUpperCase()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <aside className="w-56 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/60 flex flex-col shrink-0">

      {/* Logo */}
      <div className="px-4 h-14 flex items-center border-b border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
            <Zap size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-bold text-white tracking-tight">RentIA</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-5">
        {sections.map((sec) => (
          <div key={sec.title}>
            <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {sec.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {sec.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                      active
                        ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    <item.icon
                      size={15}
                      strokeWidth={active ? 2.25 : 1.75}
                      className={active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        typeof item.badge === "number"
                          ? "bg-blue-500/20 text-blue-400"
                          : "w-1.5 h-1.5 p-0 rounded-full bg-emerald-400"
                      }`}>
                        {typeof item.badge === "number" ? item.badge : ""}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Usuario */}
      <div className="px-3 py-3 border-t border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl mb-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-[10px] font-bold text-white">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{tenantName}</p>
            <p className="text-[10px] text-slate-500 truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-150"
        >
          <LogOut size={12} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
