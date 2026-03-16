"use client"

import { useState } from "react"
import type { CatalogProduct } from "@/types"
import ProductForm from "./product-form"

type Props = {
  products: CatalogProduct[]
}

export default function CatalogGrid({ products: initial }: Props) {
  const [products, setProducts]   = useState<CatalogProduct[]>(initial)
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState<CatalogProduct | null>(null)
  const [search, setSearch]       = useState("")

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? "").toLowerCase().includes(search.toLowerCase())
  )

  function openCreate() {
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(p: CatalogProduct) {
    setEditing(p)
    setShowForm(true)
  }

  function handleSaved(saved: CatalogProduct) {
    if (editing) {
      setProducts(prev => prev.map(p => p.id === saved.id ? saved : p))
    } else {
      setProducts(prev => [saved, ...prev])
    }
    setShowForm(false)
    setEditing(null)
  }

  async function toggleEnabled(product: CatalogProduct) {
    const res  = await fetch(`/api/catalog/products/${product.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ enabled: !product.enabled }),
    })
    const data = await res.json()
    if (!data.error) {
      setProducts(prev => prev.map(p => p.id === product.id ? data : p))
    }
  }

  async function handleDelete(product: CatalogProduct) {
    if (!confirm(`¿Eliminar "${product.name}"? No se puede deshacer.`)) return

    const res = await fetch(`/api/catalog/products/${product.id}`, { method: "DELETE" })
    if (res.ok) {
      setProducts(prev => prev.filter(p => p.id !== product.id))
    }
  }

  const activeCount = products.filter(p => p.enabled).length

  return (
    <div className="flex flex-col gap-4">

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 whitespace-nowrap"
        >
          <span className="text-base">+</span> Nuevo producto
        </button>
      </div>

      {/* Stats */}
      {products.length > 0 && (
        <p className="text-xs text-gray-500">
          {products.length} producto{products.length !== 1 ? "s" : ""} —{" "}
          <span className="text-green-600 font-medium">{activeCount} activo{activeCount !== 1 ? "s" : ""}</span>
        </p>
      )}

      {/* Form inline */}
      {showForm && (
        <ProductForm
          product={editing}
          onSave={handleSaved}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <div
              key={product.id}
              className={`border rounded-xl overflow-hidden bg-white transition-opacity ${
                product.enabled ? "" : "opacity-50"
              }`}
            >
              {/* Imagen */}
              <div className="relative">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-36 object-cover bg-gray-100"
                  />
                ) : (
                  <div className="w-full h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-3xl">
                    📦
                  </div>
                )}
                {/* Toggle en esquina */}
                <button
                  onClick={() => toggleEnabled(product)}
                  className={`absolute top-2 right-2 h-5 w-9 rounded-full transition-colors shadow ${
                    product.enabled ? "bg-green-500" : "bg-gray-400"
                  }`}
                >
                  <span className={`block h-3.5 w-3.5 rounded-full bg-white shadow mx-auto transition-transform ${
                    product.enabled ? "translate-x-2" : "-translate-x-1"
                  }`} />
                </button>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                {product.description && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">{product.description}</p>
                )}
                {product.price != null && (
                  <p className="text-sm font-bold text-green-700 mt-1">
                    {product.currency} {product.price.toLocaleString("es", { minimumFractionDigits: 2 })}
                  </p>
                )}

                {/* Acciones */}
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => openEdit(product)}
                    className="flex-1 text-xs border rounded-lg py-1 hover:bg-gray-50 text-gray-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="text-xs border rounded-lg px-2 py-1 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-400"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="text-center py-16 border-2 border-dashed rounded-xl">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-600 font-medium">
              {search ? "No se encontraron productos" : "Aún no tienes productos"}
            </p>
            {!search && (
              <button
                onClick={openCreate}
                className="mt-3 text-sm text-green-600 hover:underline"
              >
                Crear tu primer producto
              </button>
            )}
          </div>
        )
      )}
    </div>
  )
}
