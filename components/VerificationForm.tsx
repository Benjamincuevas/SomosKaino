"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { uploadToOwnFolder } from "@/lib/storage"
import { submitVerification } from "@/app/actions"

export default function VerificationForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const cedula = form.get("cedula") as File | null
    const certificado = form.get("certificado") as File | null
    if (!cedula?.size || !certificado?.size) {
      setError("Sube la foto de tu cédula y el certificado")
      return
    }
    setError(null)
    setSending(true)
    try {
      const [cedulaPath, certificadoPath] = await Promise.all([
        uploadToOwnFolder("verificaciones", userId, cedula),
        uploadToOwnFolder("verificaciones", userId, certificado),
      ])
      const result = await submitVerification(cedulaPath, certificadoPath, String(form.get("references") ?? ""))
      if (result.error) throw new Error(result.error)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos enviar tus documentos")
      setSending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="cedula">Foto de tu cédula (por ambos lados si puedes)</label>
        <input className="input" id="cedula" name="cedula" type="file" accept="image/*,application/pdf" required />
      </div>
      <div>
        <label className="label" htmlFor="certificado">Certificado de no antecedentes penales</label>
        <input className="input" id="certificado" name="certificado" type="file" accept="image/*,application/pdf" required />
        <p className="mt-1 text-xs text-gray-500">Lo puedes solicitar en línea en la Procuraduría General de la República.</p>
      </div>
      <div>
        <label className="label" htmlFor="references">Dos referencias de trabajo (nombre y teléfono)</label>
        <textarea className="input" id="references" name="references" maxLength={1000}
          placeholder="Ej.: María Pérez 809-555-0000 (le instalé la cisterna)" />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button className="btn-primary" disabled={sending}>{sending ? "Enviando…" : "Enviar para verificación"}</button>
      <p className="text-xs text-gray-500">Tus documentos son privados: solo los ve el equipo de ServiNet.</p>
    </form>
  )
}
