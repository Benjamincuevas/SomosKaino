"use client"

import { useState, useRef } from "react"
import type { KnowledgeDocument } from "@/types"

type Props = {
  documents: KnowledgeDocument[]
}

// Tipos de archivo que podemos leer como texto plano
const ACCEPTED = ".txt,.md,.csv,.json"

export default function DocumentsSource({ documents: initial }: Props) {
  const [docs, setDocs]           = useState<KnowledgeDocument[]>(initial)
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState<KnowledgeDocument | null>(null)
  const [name, setName]           = useState("")
  const [content, setContent]     = useState("")
  const [saving, setSaving]       = useState(false)
  const [errorMsg, setErrorMsg]   = useState("")
  const [loadingFile, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const activeCount = docs.filter(d => d.enabled).length

  function openCreate() {
    setEditing(null); setName(""); setContent(""); setErrorMsg("")
    setShowForm(true)
  }

  function openEdit(doc: KnowledgeDocument) {
    setEditing(doc); setName(doc.name); setContent(doc.content); setErrorMsg("")
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false); setEditing(null); setName(""); setContent("")
  }

  // Leer un archivo de texto en el navegador (sin servidor)
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño (máx 1MB para texto)
    if (file.size > 1024 * 1024) {
      setErrorMsg("El archivo no debe superar 1MB")
      return
    }

    setLoading(true)
    setErrorMsg("")

    try {
      const text = await file.text()
      if (!text.trim()) {
        setErrorMsg("El archivo está vacío")
        setLoading(false)
        return
      }
      // Usar el nombre del archivo como nombre del documento (sin extensión)
      const docName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
      setName(prev => prev || docName)
      setContent(text)
      setShowForm(true)
    } catch {
      setErrorMsg("No se pudo leer el archivo")
    }

    setLoading(false)
    // Limpiar el input para permitir subir el mismo archivo de nuevo
    if (fileRef.current) fileRef.current.value = ""
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrorMsg("")

    const url    = editing ? `/api/knowledge/documents/${editing.id}` : "/api/knowledge/documents"
    const method = editing ? "PATCH" : "POST"

    const res  = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, content }),
    })
    const data = await res.json()

    if (data.error) {
      setErrorMsg(data.error)
    } else {
      setDocs(prev =>
        editing
          ? prev.map(d => d.id === editing.id ? data : d)
          : [...prev, data]
      )
      cancelForm()
    }
    setSaving(false)
  }

  async function toggleEnabled(doc: KnowledgeDocument) {
    const res  = await fetch(`/api/knowledge/documents/${doc.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !doc.enabled }),
    })
    const data = await res.json()
    if (!data.error) setDocs(prev => prev.map(d => d.id === doc.id ? data : d))
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este documento? No se puede deshacer.")) return
    const res = await fetch(`/api/knowledge/documents/${id}`, { method: "DELETE" })
    if (res.ok) setDocs(prev => prev.filter(d => d.id !== id))
  }

  return (
    <section className="bg-white border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-lg">📄</div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Documentos</h2>
            <p className="text-xs text-gray-500">FAQ, precios, políticas — escribe o sube un archivo</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          activeCount > 0
            ? "bg-purple-50 text-purple-700 border border-purple-200"
            : "bg-gray-100 text-gray-500"
        }`}>
          {activeCount > 0 ? `${activeCount} activo${activeCount > 1 ? "s" : ""}` : "Sin documentos"}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-4">

        {/* Lista de documentos */}
        {docs.length > 0 && (
          <div className="flex flex-col gap-2">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className={`border rounded-lg p-3 flex items-start gap-3 ${
                  doc.enabled ? "bg-white" : "bg-gray-50 opacity-60"
                }`}
              >
                <button
                  onClick={() => toggleEnabled(doc)}
                  className={`mt-0.5 relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                    doc.enabled ? "bg-purple-500" : "bg-gray-300"
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${
                    doc.enabled ? "translate-x-4" : "translate-x-1"
                  }`} />
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {doc.content.length.toLocaleString()} caracteres
                  </p>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(doc)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  >✏️</button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                  >🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form inline */}
        {showForm ? (
          <form onSubmit={handleSave} className="border border-purple-200 rounded-xl p-4 flex flex-col gap-3 bg-purple-50/20">
            <h3 className="text-sm font-semibold text-gray-800">
              {editing ? "Editar documento" : "Nuevo documento"}
            </h3>

            <div>
              <label className="text-xs font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej: Lista de precios, FAQ, Políticas de envío..."
                required
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">Contenido</label>
                <span className="text-xs text-gray-400">{content.length.toLocaleString()} caracteres</span>
              </div>
              <textarea
                rows={7}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe o pega el texto que el agente debe conocer..."
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-xs"
              />
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? "Guardando..." : editing ? "Actualizar" : "Guardar"}
              </button>
              <button type="button" onClick={cancelForm} className="text-sm px-4 py-2 rounded-lg border hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={openCreate}
              className="flex-1 flex items-center justify-center gap-2 text-sm text-purple-700 font-medium border border-purple-200 border-dashed rounded-lg px-4 py-3 hover:bg-purple-50 transition-colors"
            >
              ✏️ Escribir documento
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              disabled={loadingFile}
              className="flex-1 flex items-center justify-center gap-2 text-sm text-gray-600 font-medium border border-dashed rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              📁 {loadingFile ? "Leyendo..." : "Subir archivo"}
            </button>

            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED}
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {docs.length === 0 && !showForm && (
          <p className="text-center text-xs text-gray-400">
            Soporta archivos .txt, .md, .csv, .json · Máx 1MB
          </p>
        )}
      </div>
    </section>
  )
}
