"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, MessageCircle, Users, ShoppingCart,
  Package, Tag, BarChart2, Brain, Settings, LogOut, LucideIcon
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type NavItem = {
  href:   string
  label:  string
  icon:   LucideIcon
  badge?: number | string
}
type Section = { title: string; items: NavItem[] }

const sections: Section[] = [
  {
    title: "Principal",
    items: [
      { href: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
      { href: "/inbox",     label: "WhatsApp",   icon: MessageCircle,   badge: "•" },
      { href: "/contacts",  label: "Clientes",   icon: Users },
    ],
  },
  {
    title: "Negocio",
    items: [
      { href: "/orders",    label: "Pedidos",    icon: ShoppingCart,    badge: 3 },
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
  const pathname  = usePathname()
  const router    = useRouter()
  const initials  = tenantName.slice(0, 2).toUpperCase()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <aside className="w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0">

      {/* Logo */}
      <div className="px-4 h-14 flex items-center border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
            <MessageCircle size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight">RentIA</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto flex flex-col gap-4">
        {sections.map((sec) => (
          <div key={sec.title}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              {sec.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {sec.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                      active
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    <item.icon
                      size={16}
                      strokeWidth={active ? 2 : 1.75}
                      className={active ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        typeof item.badge === "number"
                          ? "bg-blue-500 text-white"
                          : "bg-emerald-500 text-white w-2 h-2 p-0 rounded-full"
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
      <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{tenantName}</p>
            <p className="text-[10px] text-gray-400 truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl transition-colors"
        >
          <LogOut size={13} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
