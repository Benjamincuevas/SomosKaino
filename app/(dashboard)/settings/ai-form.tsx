"use client"

import { useState } from "react"
import type { AiConfig } from "@/types"

export default function AiForm({ config }: { config: AiConfig | null }) {
  const [systemPrompt, setSystemPrompt] = useState(config?.system_prompt ?? "")
  const [enabled, setEnabled]           = useState(config?.enabled ?? true)
  const [status, setStatus]   = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")

    const res = await fetch("/api/settings/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system_prompt: systemPrompt, enabled }),
    })

    const data = await res.json()
    if (data.error) {
      setErrorMsg(data.error)
      setStatus("error")
    } else {
      setStatus("success")
    }
  }

  return (
    <section className="bg-white border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Asistente IA</h2>
      <p className="text-sm text-gray-500 mb-4">
        Define cómo responde tu asistente automático en WhatsApp
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <input
            id="enabled"
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-4 h-4 accent-green-600"
          />
          <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
            Respuestas automáticas activadas
          </label>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Prompt del sistema</label>
          <p className="text-xs text-gray-400 mb-1">
            Instrucciones que definen la personalidad de tu asistente
          </p>
          <textarea
            rows={6}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Eres un asistente amigable de bienes raíces..."
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {status === "success" && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded-lg">
            ✅ Configuración guardada
          </div>
        )}
        {status === "error" && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="self-start bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {status === "loading" ? "Guardando..." : "Guardar prompt"}
        </button>
      </form>
    </section>
  )
}
