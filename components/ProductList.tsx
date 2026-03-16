import Link from "next/link"
import { ChevronRight, AlertTriangle, Smartphone, Laptop, Headphones, Tablet, Tv, Package } from "lucide-react"
import { LucideIcon } from "lucide-react"

type Product = {
  id: string
  name: string
  price: number | null
  currency: string | null
  enabled: boolean
  image_url: string | null
  stock?: number | null
}

function getCategoryIcon(name: string): LucideIcon {
  const n = name.toLowerCase()
  if (n.includes("phone") || n.includes("celular") || n.includes("samsung") || n.includes("iphone") || n.includes("móvil")) return Smartphone
  if (n.includes("laptop") || n.includes("computadora") || n.includes("pc") || n.includes("mac")) return Laptop
  if (n.includes("auricular") || n.includes("headphone") || n.includes("audifonos") || n.includes("earphone")) return Headphones
  if (n.includes("tablet") || n.includes("ipad")) return Tablet
  if (n.includes("tv") || n.includes("televisor") || n.includes("monitor")) return Tv
  return Package
}

function formatDOP(price: number) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP", minimumFractionDigits: 0 }).format(price)
}

const LOW_STOCK_THRESHOLD = 5

export default function ProductList({ products }: { products: Product[] }) {
  const list = products.slice(0, 6)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Productos</h2>
          <p className="text-xs text-gray-400 mt-0.5">{products.length} en catálogo</p>
        </div>
        <Link href="/catalog" className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-0.5 hover:underline">
          Ver todos <ChevronRight size={12} />
        </Link>
      </div>

      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {list.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-2 text-gray-400">
            <Package size={28} strokeWidth={1.5} />
            <p className="text-sm">Sin productos aún</p>
            <Link href="/catalog" className="text-xs text-blue-600 hover:underline">Agregar producto →</Link>
          </div>
        ) : (
          list.map((p) => {
            const Icon     = getCategoryIcon(p.name)
            const lowStock = p.stock != null && p.stock <= LOW_STOCK_THRESHOLD

            return (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                {/* Icono categoría */}
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Icon size={17} strokeWidth={1.5} className="text-gray-500 dark:text-gray-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {p.stock != null && (
                      <span className="text-[10px] text-gray-400">Stock: {p.stock}</span>
                    )}
                    {lowStock && (
                      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-full">
                        <AlertTriangle size={9} />
                        Stock bajo
                      </span>
                    )}
                  </div>
                </div>

                {/* Precio */}
                {p.price != null && (
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 shrink-0">
                    {p.currency === "DOP" || !p.currency
                      ? formatDOP(p.price)
                      : `${p.currency} ${p.price.toLocaleString()}`}
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
