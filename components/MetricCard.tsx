"use client"

import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react"

type Props = {
  label:     string
  value:     string | number
  sublabel?: string
  trend?:    { value: number; label: string }
  icon:      LucideIcon
  color:     "blue" | "emerald" | "purple" | "amber"
  href?:     string
}

const palette = {
  blue:    { bg: "bg-blue-50 dark:bg-blue-950",     icon: "text-blue-600 dark:text-blue-400",    value: "text-blue-700 dark:text-blue-300",    ring: "bg-blue-100 dark:bg-blue-900" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950", icon: "text-emerald-600 dark:text-emerald-400", value: "text-emerald-700 dark:text-emerald-300", ring: "bg-emerald-100 dark:bg-emerald-900" },
  purple:  { bg: "bg-purple-50 dark:bg-purple-950", icon: "text-purple-600 dark:text-purple-400", value: "text-purple-700 dark:text-purple-300",  ring: "bg-purple-100 dark:bg-purple-900" },
  amber:   { bg: "bg-amber-50 dark:bg-amber-950",   icon: "text-amber-600 dark:text-amber-400",   value: "text-amber-700 dark:text-amber-300",    ring: "bg-amber-100 dark:bg-amber-900" },
}

export default function MetricCard({ label, value, sublabel, trend, icon: Icon, color, href }: Props) {
  const c = palette[color]
  const isUp = trend && trend.value >= 0

  const card = (
    <div className={`
      group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800
      p-5 flex flex-col gap-4 cursor-pointer
      hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
    `}>
      {/* Icono */}
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl ${c.ring} ${c.icon} flex items-center justify-center`}>
          <Icon size={20} strokeWidth={1.75} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            isUp
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
              : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
          }`}>
            {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {isUp ? "+" : ""}{trend.value}%
          </div>
        )}
      </div>

      {/* Valor */}
      <div>
        <p className={`text-[32px] font-semibold leading-none ${c.value}`}>{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium">{label}</p>
        {sublabel && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sublabel}</p>}
        {trend && <p className="text-xs text-gray-400 mt-1">{trend.label}</p>}
      </div>
    </div>
  )

  if (href) return <a href={href}>{card}</a>
  return card
}
