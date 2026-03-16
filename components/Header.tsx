"use client"

import { Bell, Search } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"
import { useState, useEffect } from "react"

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Buenos días"
  if (h < 19) return "Buenas tardes"
  return "Buenas noches"
}

function getFormattedDate() {
  const d = new Date().toLocaleDateString("es-DO", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })
  return d.charAt(0).toUpperCase() + d.slice(1)
}

export default function Header({ name }: { name: string }) {
  const [greeting, setGreeting]           = useState("")
  const [dateFormatted, setDateFormatted] = useState("")

  useEffect(() => {
    setGreeting(getGreeting())
    setDateFormatted(getFormattedDate())
  }, [])

  return (
    <header className="h-14 bg-slate-900/70 backdrop-blur-xl border-b border-slate-800/60 flex items-center px-6 gap-4 shrink-0">

      {/* Saludo */}
      <div className="flex-1 min-w-0 hidden md:block">
        <p className="text-[13px] font-semibold text-slate-200 truncate">
          {greeting ? `${greeting}, ${name} 👋` : ""}
        </p>
        <p className="text-[10px] text-slate-500 truncate">{dateFormatted}</p>
      </div>

      {/* Búsqueda */}
      <div className="flex-1 max-w-sm relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar productos, clientes, pedidos..."
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-800/60 border border-slate-700/50 rounded-xl
            focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50
            text-slate-300 placeholder-slate-600 transition-all duration-200"
        />
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 ml-auto">
        <button className="relative w-8 h-8 flex items-center justify-center rounded-xl text-slate-500
          hover:text-slate-200 hover:bg-slate-800/60 transition-all duration-150">
          <Bell size={15} strokeWidth={1.75} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
        <ThemeToggle />
      </div>
    </header>
  )
}
