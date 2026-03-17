"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MessageCircle, Users, Settings } from "lucide-react"

const items = [
  { href: "/dashboard", label: "Inicio",    icon: LayoutDashboard },
  { href: "/inbox",     label: "WhatsApp",  icon: MessageCircle },
  { href: "/contacts",  label: "Clientes",  icon: Users },
  { href: "/settings",  label: "Config",    icon: Settings },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/60 flex">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
              active ? "text-blue-400" : "text-slate-500"
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
