"use client"

import { useState } from "react"
import type { AiConfig } from "@/types"

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl bg-[#060e20] border border-[#1f2b49] text-sm text-[#dee5ff] placeholder-[#3a4460] focus:outline-none focus:border-[#FF6D00]/50 focus:ring-2 focus:ring-[#FF6D00]/10 transition-all"

const labelCls = "text-[11px] font-semibold uppercase tracking-widest text-[#a3aac4] block mb-1.5"

export default function AiForm({ config }: { config: AiConfig | null }) {
  const [enabled,           setEnabled]          = useState(config?.enabled ?? true)
  const [systemPrompt,      setSystemPrompt]      = useState(config?.system_prompt ?? "")
  const [greetingMessage,   setGreetingMessage]   = useState(config?.greeting_message ?? "")
  const [alertNumbers,      setAlertNumbers]      = useState(
    (config?.alert_numbers ?? []).join("\n")
  )
  const [handoverTemplate,  setHandoverTemplate]  = useState(config?.handover_template ?? "")
  const [status,   setStatus]   = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    // Parsear números: uno por línea, ignorar vacíos y limpiar espacios
    const parsedNumbers = alertNumbers
      .split("\n")
      .map(n => n.trim())
      .filter(Boolean)

    const res = await fetch("/api/settings/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enabled,
        system_prompt:      systemPrompt,
        greeting_message:   greetingMessage || null,
        alert_numbers:      parsedNumbers,
        handover_template:  handoverTemplate || null,
      }),
    })

    const data = await res.json()
    if (data.error) {
      setErrorMsg(data.error)
      setStatus("error")
    } else {
      setStatus("success")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Section header */}
      <div>
        <p className="text-[10px] font-semibold tracking-[0.15em] text-[#a3aac4] uppercase mb-0.5">Gemini AI</p>
        <h2 className="text-xl font-bold text-[#dee5ff]" style={{ fontFamily: "Manrope, sans-serif" }}>
          Asistente IA
        </h2>
        <p className="text-sm text-[#a3aac4] mt-1">
          Configura cómo responde y se comporta tu asistente automático en WhatsApp
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Activar/desactivar */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#1f2b49]" style={{ background: "#0d1a35" }}>
          <input
            id="enabled"
            type="checkbox"
            checked={enabled}
            onChange={e => setEnabled(e.target.checked)}
            className="w-4 h-4 accent-[#FF6D00]"
          />
          <div>
            <label htmlFor="enabled" className="text-sm font-semibold text-[#dee5ff] cursor-pointer">
              Respuestas automáticas activadas
            </label>
            <p className="text-[11px] text-[#a3aac4]">El asistente responderá automáticamente los mensajes de WhatsApp</p>
          </div>
        </div>

        {/* Prompt del sistema */}
        <div>
          <label className={labelCls}>Prompt del sistema</label>
          <p className="text-[11px] text-[#a3aac4] mb-2">
            Instrucciones que definen la personalidad y comportamiento de tu asistente
          </p>
          <textarea
            rows={6}
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            placeholder="Eres un asistente amigable de la tienda TechStore. Ayudas a los clientes a encontrar productos y resolver dudas..."
            required
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Mensaje de bienvenida */}
        <div>
          <label className={labelCls}>Mensaje de bienvenida</label>
          <p className="text-[11px] text-[#a3aac4] mb-2">
            Primer mensaje que se envía automáticamente cuando un cliente escribe por primera vez. Si está vacío se usa el nombre de la empresa.
          </p>
          <input
            type="text"
            value={greetingMessage}
            onChange={e => setGreetingMessage(e.target.value)}
            placeholder="Saludos, te comunicas con TechStore 👋 ¿En qué puedo ayudarte?"
            className={inputCls}
          />
        </div>

        {/* Números de alerta (handover) */}
        <div>
          <label className={labelCls}>Números de alerta para handover</label>
          <p className="text-[11px] text-[#a3aac4] mb-2">
            Teléfonos que recibirán una notificación cuando un cliente esté listo para pagar o pida hablar con un asesor. Un número por línea, en formato internacional (ej: 18094173098).
          </p>
          <textarea
            rows={3}
            value={alertNumbers}
            onChange={e => setAlertNumbers(e.target.value)}
            placeholder={"18094173098\n18292856400"}
            className={`${inputCls} resize-none font-mono text-xs`}
          />
        </div>

        {/* Template de handover */}
        <div>
          <label className={labelCls}>Template de WhatsApp para notificaciones</label>
          <p className="text-[11px] text-[#a3aac4] mb-2">
            Nombre exacto del template aprobado en Meta para enviar alertas de pedidos a tus asesores. Si está vacío se usa texto plano como fallback.
          </p>
          <input
            type="text"
            value={handoverTemplate}
            onChange={e => setHandoverTemplate(e.target.value)}
            placeholder="confirmacin_de_pedido"
            className={inputCls}
          />
        </div>

        {/* Feedback */}
        {status === "success" && (
          <div className="flex items-center gap-2 rounded-xl border border-[#40C4FF]/25 px-4 py-3"
            style={{ background: "rgba(64,196,255,0.06)" }}>
            <span className="text-[#40C4FF] text-sm">✅ Configuración guardada correctamente</span>
          </div>
        )}
        {status === "error" && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            <p className="text-sm text-red-400">{errorMsg}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="self-start inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF6D00] hover:bg-[#e86200] text-white text-[11px] font-bold tracking-widest uppercase transition-all disabled:opacity-50 shadow-lg shadow-orange-900/20"
        >
          {status === "loading" ? "Guardando..." : "Guardar Configuración"}
        </button>
      </form>
    </div>
  )
}
