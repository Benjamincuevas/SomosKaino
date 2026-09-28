import Link from "next/link"
import { STATUS_LABELS, URGENCY_LABELS, categoryBySlug, formatRD } from "@/lib/catalog"

export type RequestSummary = {
  id: string
  category: string
  title: string
  city: string
  sector: string | null
  urgency: string
  budget: number | null
  status: string
  created_at: string
}

export default function RequestCard({ r, footer }: { r: RequestSummary; footer?: React.ReactNode }) {
  const cat = categoryBySlug(r.category)
  const status = STATUS_LABELS[r.status]
  return (
    <Link href={`/solicitudes/${r.id}`} className="card block transition hover:border-brand-500 hover:shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500">{cat?.icon} {cat?.name ?? r.category}</p>
          <h3 className="mt-1 font-semibold">{r.title}</h3>
        </div>
        {status && <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>{status.label}</span>}
      </div>
      <p className="mt-2 text-sm text-gray-600">
        📍 {r.sector ? `${r.sector}, ` : ""}{r.city} · ⏱ {URGENCY_LABELS[r.urgency] ?? r.urgency}
        {r.budget ? ` · 💰 ${formatRD(r.budget)}` : ""}
      </p>
      <p className="mt-1 text-xs text-gray-400">
        {new Date(r.created_at).toLocaleDateString("es-DO", { day: "numeric", month: "short", timeZone: "America/Santo_Domingo" })}
      </p>
      {footer && <div className="mt-3 border-t border-gray-100 pt-3 text-sm">{footer}</div>}
    </Link>
  )
}
