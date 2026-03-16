// Funciones para el Catálogo de WhatsApp Business (Meta Commerce Manager)
// Documentación: https://developers.facebook.com/docs/commerce-platform/catalog

const GRAPH_API = "https://graph.facebook.com/v20.0"

export type WACatalogProduct = {
  id:           string
  retailer_id?: string
  name:         string
  description?: string
  price?:       number    // en centavos (ej: 1000 = $10.00)
  currency?:    string    // "USD", "MXN", "DOP", etc.
  image_url?:   string
}

// Cache en memoria — se renueva cada 5 minutos
const catalogCache = new Map<string, { products: WACatalogProduct[]; fetchedAt: number }>()
const CACHE_TTL = 5 * 60 * 1000

export async function fetchCatalogProducts(
  catalogId:   string,
  accessToken: string
): Promise<{ products: WACatalogProduct[]; error?: string }> {
  const now    = Date.now()
  const cached = catalogCache.get(catalogId)

  if (cached && now - cached.fetchedAt < CACHE_TTL) {
    return { products: cached.products }
  }

  try {
    const fields = "id,retailer_id,name,description,price,currency,image_url"
    const res = await fetch(
      `${GRAPH_API}/${catalogId}/products?fields=${fields}&limit=100`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!res.ok) {
      const err = await res.json()
      return {
        products: cached?.products ?? [],
        error:    err?.error?.message ?? `Error ${res.status} al acceder al catálogo`,
      }
    }

    const json     = await res.json()
    const products = (json.data ?? []) as WACatalogProduct[]
    catalogCache.set(catalogId, { products, fetchedAt: now })
    return { products }
  } catch {
    return { products: cached?.products ?? [], error: "Error de conexión con Meta API" }
  }
}

// ── Sincronización hacia Meta (publicar en WhatsApp Business Catalog) ──

export type SyncProduct = {
  id:          string
  name:        string
  description?: string | null
  price?:       number | null
  currency?:    string
  image_url?:   string | null
}

// Sube o elimina un producto en el catálogo de Meta Commerce Manager
// La API items_batch acepta CREATE / UPDATE / DELETE
export async function syncProductToMeta({
  catalogId,
  accessToken,
  product,
  method,
}: {
  catalogId:   string
  accessToken: string
  product:     SyncProduct
  method:      "CREATE" | "UPDATE" | "DELETE"
}): Promise<{ success: boolean; error?: string }> {
  try {
    type MetaRequest = {
      method:       string
      retailer_id:  string
      data?: Record<string, unknown>
    }

    const req: MetaRequest = { method, retailer_id: product.id }

    if (method !== "DELETE") {
      // Meta espera el precio en centavos (entero)
      const priceCents = Math.round((product.price ?? 0) * 100)

      req.data = {
        name:         product.name,
        description:  product.description || product.name,
        price:        priceCents,
        currency:     product.currency ?? "USD",
        image_url:    product.image_url ?? "",
        url:          product.image_url ?? `${GRAPH_API}`,  // URL requerida por Meta
        availability: "in stock",
        condition:    "new",
      }
    }

    const res = await fetch(`${GRAPH_API}/${catalogId}/items_batch`, {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        allow_upsert: method !== "DELETE",
        requests:     [req],
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      const msg = err?.error?.message ?? `Error ${res.status}`
      console.error(`❌ Meta sync (${method}):`, msg)
      return { success: false, error: msg }
    }

    console.log(`✅ Meta sync (${method}): ${product.name}`)
    return { success: true }
  } catch (err) {
    console.error("❌ Meta sync error:", err)
    return { success: false, error: "Error de conexión con Meta API" }
  }
}

// Sincroniza todos los productos de golpe (bulk upsert, máx 100 por llamada)
export async function syncAllProductsToMeta({
  catalogId,
  accessToken,
  products,
}: {
  catalogId:   string
  accessToken: string
  products:    SyncProduct[]
}): Promise<{ success: boolean; synced: number; error?: string }> {
  if (!products.length) return { success: true, synced: 0 }

  try {
    // Meta limita a 100 items por batch — dividimos si es necesario
    const chunks: SyncProduct[][] = []
    for (let i = 0; i < products.length; i += 100) {
      chunks.push(products.slice(i, i + 100))
    }

    for (const chunk of chunks) {
      const requests = chunk.map(p => ({
        method:      "UPDATE",
        retailer_id: p.id,
        data: {
          name:         p.name,
          description:  p.description || p.name,
          price:        Math.round((p.price ?? 0) * 100),
          currency:     p.currency ?? "USD",
          image_url:    p.image_url ?? "",
          url:          p.image_url ?? `${GRAPH_API}`,
          availability: "in stock",
          condition:    "new",
        },
      }))

      const res = await fetch(`${GRAPH_API}/${catalogId}/items_batch`, {
        method:  "POST",
        headers: {
          Authorization:  `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ allow_upsert: true, requests }),
      })

      if (!res.ok) {
        const err = await res.json()
        return { success: false, synced: 0, error: err?.error?.message ?? "Error al sincronizar" }
      }
    }

    return { success: true, synced: products.length }
  } catch {
    return { success: false, synced: 0, error: "Error de conexión con Meta API" }
  }
}

// Convierte los productos a texto para incluirlo en el prompt de la IA
export function catalogProductsToText(products: WACatalogProduct[]): string {
  if (!products.length) return ""

  const lines = products.map(p => {
    const price = p.price != null
      ? ` — $${(p.price / 100).toFixed(2)} ${p.currency ?? ""}`.trim()
      : ""
    const desc = p.description ? ` — ${p.description}` : ""
    return `• ${p.name}${desc}${price}`
  })

  return lines.join("\n")
}
