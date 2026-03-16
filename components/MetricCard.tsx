import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react"
import Sparkline from "@/components/Sparkline"

type Props = {
  label:      string
  value:      string | number
  sublabel?:  string
  trend?:     { value: number; label: string }
  sparkline?: number[]
  icon:       LucideIcon
  color:      "blue" | "emerald" | "purple" | "amber"
  href?:      string
}

const palette = {
  blue:    { ring: "bg-blue-500/10 border-blue-500/20",    icon: "text-blue-400",    value: "text-blue-300",    spark: "#3b82f6" },
  emerald: { ring: "bg-emerald-500/10 border-emerald-500/20", icon: "text-emerald-400", value: "text-emerald-300", spark: "#10b981" },
  purple:  { ring: "bg-purple-500/10 border-purple-500/20",  icon: "text-purple-400",  value: "text-purple-300",  spark: "#a855f7" },
  amber:   { ring: "bg-amber-500/10 border-amber-500/20",   icon: "text-amber-400",   value: "text-amber-300",   spark: "#f59e0b" },
}

export default function MetricCard({ label, value, sublabel, trend, sparkline, icon: Icon, color, href }: Props) {
  const c    = palette[color]
  const isUp = trend && trend.value >= 0

  const card = (
    <div className="
      group relative bg-slate-900/60 backdrop-blur-sm rounded-2xl
      border border-slate-800/60 p-5 flex flex-col gap-4
      hover:border-slate-700/80 hover:bg-slate-900/80
      hover:shadow-xl hover:shadow-slate-950/50
      hover:-translate-y-0.5 transition-all duration-200 cursor-pointer
    ">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl border ${c.ring} ${c.icon} flex items-center justify-center`}>
          <Icon size={18} strokeWidth={1.75} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${
            isUp
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}>
            {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {isUp ? "+" : ""}{trend.value}%
          </div>
        )}
      </div>

      {/* Valor */}
      <div>
        <p className={`text-3xl font-bold leading-none tracking-tight ${c.value}`}>{value}</p>
        <p className="text-xs text-slate-500 mt-1.5 font-medium">{label}</p>
        {sublabel && <p className="text-[11px] text-slate-600 mt-0.5">{sublabel}</p>}
        {trend && <p className="text-[10px] text-slate-600 mt-1">{trend.label}</p>}
      </div>

      {/* Sparkline */}
      {sparkline && (
        <div className="mt-auto">
          <Sparkline data={sparkline} color={c.spark} height={28} width={100} />
        </div>
      )}
    </div>
  )

  if (href) return <a href={href}>{card}</a>
  return card
}
