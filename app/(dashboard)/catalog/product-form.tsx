"use client"

import { useState, useRef } from "react"
import type { CatalogProduct } from "@/types"

type Props = {
  product?: CatalogProduct | null
  onSave:   (product: CatalogProduct) => void
  onCancel: () => void
}

const CURRENCIES = ["USD", "MXN", "DOP", "COP", "ARS", "EUR"]

export default function ProductForm({ product, onSave, onCancel }: Props) {
  const [name, setName]           = useState(product?.name ?? "")
  const [description, setDesc]    = useState(product?.description ?? "")
  const [price, setPrice]         = useState(product?.price?.toString() ?? "")
  const [currency, setCurrency]   = useState(product?.currency ?? "USD")
  const [imageUrl, setImageUrl]   = useState(product?.image_url ?? "")
  const [preview, setPreview]     = useState(product?.image_url ?? "")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")

    // Preview local inmediato
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    const formData = new FormData()
    formData.append("file", file)

    const res  = await fetch("/api/catalog/upload", { method: "POST", body: formData })
    const data = await res.json()

    if (data.error) {
      setError(data.error)
      setPreview(imageUrl) // revertir preview
    } else {
      setImageUrl(data.url)
      setPreview(data.url)
    }

    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (uploading) return
    setSaving(true)
    setError("")

    const body = { name, description, price, currency, image_url: imageUrl }
    const isEdit = !!product

    const res = await fetch(
      isEdit ? `/api/catalog/products/${product.id}` : "/api/catalog/products",
      {
        method:  isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      }
    )
    const data = await res.json()

    if (data.error) {
      setError(data.error)
      setSaving(false)
    } else {
      onSave(data)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border rounded-xl p-5 flex flex-col gap-4"
    >
      <h3 className="text-base font-semibold text-gray-900">
        {product ? "Editar producto" : "Nuevo producto"}
      </h3>

      <div className="flex gap-4">
        {/* Imagen */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 hover:border-green-400 overflow-hidden bg-gray-50 flex flex-col items-center justify-center transition-colors"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="w-full h-full object-cover" />
            ) : (
              <>
                <span className="text-2xl">📷</span>
                <span className="text-xs text-gray-400 mt-1">Subir foto</span>
              </>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-xs">Subiendo...</span>
              </div>
            )}
          </button>
          {preview && (
            <button
              type="button"
              onClick={() => { setImageUrl(""); setPreview("") }}
              className="text-xs text-red-400 hover:text-red-600"
            >
              Quitar foto
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Campos */}
        <div className="flex-1 flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-gray-700">Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej: Apartamento 2 habitaciones, Chevrolet Spark 2022..."
              required
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-700">Precio</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Moneda</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="text-xs font-medium text-gray-700">Descripción</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Características, disponibilidad, condiciones..."
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="bg-gray-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? "Guardando..." : product ? "Actualizar" : "Crear producto"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm px-4 py-2 rounded-lg border hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
