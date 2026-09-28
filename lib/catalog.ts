// Categorías de servicio y ciudades. Viven en código (no en la base de datos)
// para que la landing cargue sin consultas; la base guarda el slug.

export type Category = { slug: string; name: string; icon: string; group: "hogar" | "construccion" | "negocios" }

export const CATEGORIES: Category[] = [
  { slug: "plomeria", name: "Plomería", icon: "🚰", group: "hogar" },
  { slug: "electricidad", name: "Electricidad", icon: "💡", group: "hogar" },
  { slug: "albanileria", name: "Albañilería", icon: "🧱", group: "construccion" },
  { slug: "herreria", name: "Herrería", icon: "⚒️", group: "construccion" },
  { slug: "carpinteria", name: "Carpintería", icon: "🪚", group: "hogar" },
  { slug: "pintura", name: "Pintura", icon: "🎨", group: "hogar" },
  { slug: "aire-acondicionado", name: "Aire acondicionado", icon: "❄️", group: "hogar" },
  { slug: "electrodomesticos", name: "Reparación de electrodomésticos", icon: "🔧", group: "hogar" },
  { slug: "cerrajeria", name: "Cerrajería", icon: "🔑", group: "hogar" },
  { slug: "limpieza", name: "Limpieza", icon: "🧽", group: "hogar" },
  { slug: "jardineria", name: "Jardinería", icon: "🌿", group: "hogar" },
  { slug: "fumigacion", name: "Fumigación", icon: "🪲", group: "hogar" },
  { slug: "plantas-inversores", name: "Plantas, inversores y paneles solares", icon: "🔋", group: "hogar" },
  { slug: "maestro-constructor", name: "Maestro constructor", icon: "🏗️", group: "construccion" },
  { slug: "ingenieria", name: "Ingeniería civil / eléctrica", icon: "📐", group: "negocios" },
  { slug: "arquitectura", name: "Arquitectura y diseño", icon: "🏛️", group: "negocios" },
  { slug: "mantenimiento-comercial", name: "Mantenimiento para negocios", icon: "🏢", group: "negocios" },
]

export const CITIES = [
  "Distrito Nacional",
  "Santo Domingo Este",
  "Santo Domingo Norte",
  "Santo Domingo Oeste",
  "Santiago",
  "La Romana",
  "Punta Cana / Higüey",
  "San Pedro de Macorís",
  "Puerto Plata",
  "La Vega",
  "San Cristóbal",
  "San Francisco de Macorís",
]

export const URGENCY_LABELS: Record<string, string> = {
  urgente: "Urgente (hoy o mañana)",
  esta_semana: "Esta semana",
  flexible: "Flexible",
}

export const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  abierta: { label: "Recibiendo cotizaciones", className: "bg-blue-100 text-blue-800" },
  asignada: { label: "Asignada", className: "bg-amber-100 text-amber-800" },
  completada: { label: "Completada", className: "bg-green-100 text-green-800" },
  cancelada: { label: "Cancelada", className: "bg-gray-200 text-gray-700" },
}

export function categoryBySlug(slug: string) {
  return CATEGORIES.find(c => c.slug === slug)
}

export function formatRD(amount: number) {
  return "RD$" + amount.toLocaleString("es-DO")
}

// Enlace de WhatsApp a partir de un teléfono dominicano (809/829/849)
export function whatsappLink(phone: string, text?: string) {
  let digits = phone.replace(/\D/g, "")
  if (digits.length === 10) digits = "1" + digits
  return `https://wa.me/${digits}` + (text ? `?text=${encodeURIComponent(text)}` : "")
}
