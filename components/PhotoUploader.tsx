"use client"

import { useState } from "react"
import { uploadToOwnFolder } from "@/lib/storage"

const MAX_PHOTOS = 5

// Sube las fotos al elegirlas y deja sus rutas en inputs ocultos "photos"
export default function PhotoUploader({ userId }: { userId: string }) {
  const [photos, setPhotos] = useState<{ path: string; preview: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS - photos.length)
    e.target.value = ""
    if (files.length === 0) return
    setError(null)
    setUploading(true)
    try {
      for (const file of files) {
        const path = await uploadToOwnFolder("solicitudes", userId, file)
        setPhotos(prev => [...prev, { path, preview: URL.createObjectURL(file) }])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos subir la foto")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <span className="label">Fotos (opcional, hasta {MAX_PHOTOS})</span>
      <div className="flex flex-wrap gap-2">
        {photos.map(p => (
          <div key={p.path} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.preview} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={() => setPhotos(prev => prev.filter(x => x.path !== p.path))}
              className="absolute right-0.5 top-0.5 rounded-full bg-black/60 px-1.5 text-xs text-white" aria-label="Quitar foto">×</button>
            <input type="hidden" name="photos" value={p.path} />
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-xs text-gray-500 hover:border-brand-500">
            {uploading ? "Subiendo…" : <><span className="text-2xl">📷</span>Añadir</>}
            <input type="file" accept="image/*" multiple className="hidden" onChange={onChange} disabled={uploading} />
          </label>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500">Una foto del problema ayuda mucho a cotizar mejor.</p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
